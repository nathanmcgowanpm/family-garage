import { createClient } from '@supabase/supabase-js'
import { buildReceiptParseRequest, extractParsedReceipt } from '../shared/receiptParsing.js'

// Initialize Supabase admin client (bypasses RLS via service role key).
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PARSEABLE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Auth check — token in query parameter
  const expectedSecret = process.env.POSTMARK_WEBHOOK_SECRET
  if (!expectedSecret) {
    console.error('POSTMARK_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

const providedToken = req.query?.token
if (providedToken !== expectedSecret) {
  console.warn('Invalid auth on inbound-email webhook')
  return res.status(401).json({ error: 'Unauthorized' })
}

  const payload = req.body
  const fromAddress = payload?.FromFull?.Email?.toLowerCase()?.trim()
  const fromName = payload?.FromFull?.Name || null
  const subject = payload?.Subject || null
  const textBody = payload?.TextBody || null
  const htmlBody = payload?.HtmlBody || null
  const attachments = Array.isArray(payload?.Attachments) ? payload.Attachments : []

  if (!fromAddress) {
    console.warn('Postmark payload missing From address', { messageId: payload?.MessageID })
    return res.status(200).json({ ok: true, reason: 'no_from_address' })
  }

  console.log(`Inbound email from ${fromAddress}, ${attachments.length} attachments`)

  // Look up user by email
  const { data: userMatch, error: lookupError } = await supabaseAdmin.auth.admin.listUsers()
  if (lookupError) {
    console.error('User lookup failed', lookupError)
    return res.status(200).json({ ok: false, error: 'user_lookup_failed' })
  }

  const matchedUser = userMatch?.users?.find(
    (u) => u.email?.toLowerCase()?.trim() === fromAddress
  )

  // No user match → save to unmatched_emails
  if (!matchedUser) {
    const { error: insertError } = await supabaseAdmin
      .from('unmatched_emails')
      .insert({
        from_address: fromAddress,
        from_name: fromName,
        subject,
        text_body: textBody,
        html_body: htmlBody,
        attachment_count: attachments.length,
        postmark_payload: payload,
      })
    if (insertError) {
      console.error('Failed to insert unmatched_email', insertError)
    } else {
      console.log(`Stored unmatched email from ${fromAddress}`)
    }
    return res.status(200).json({ ok: true, matched: false })
  }

  const userId = matchedUser.id
  console.log(`Matched user ${userId} for ${fromAddress}`)

  const parseable = attachments.filter((a) => PARSEABLE_MIME_TYPES.has(a.ContentType))
  if (parseable.length === 0) {
    console.log(`No parseable attachments from ${fromAddress}`)
    await supabaseAdmin.from('unmatched_emails').insert({
      from_address: fromAddress,
      from_name: fromName,
      subject,
      text_body: textBody,
      html_body: htmlBody,
      attachment_count: 0,
      postmark_payload: payload,
      claimed_by_user_id: userId,
      claimed_at: new Date().toISOString(),
      notes: 'matched user but no parseable attachments',
    })
    return res.status(200).json({ ok: true, matched: true, parsed: 0 })
  }

  // Find the user's household(s)
  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)

  if (membershipError || !memberships?.length) {
    console.error('No household for user', userId, membershipError)
    await supabaseAdmin.from('unmatched_emails').insert({
      from_address: fromAddress,
      from_name: fromName,
      subject,
      text_body: textBody,
      html_body: htmlBody,
      attachment_count: attachments.length,
      postmark_payload: payload,
      claimed_by_user_id: userId,
      claimed_at: new Date().toISOString(),
      notes: 'matched user but no household',
    })
    return res.status(200).json({ ok: true, matched: true, parsed: 0, reason: 'no_household' })
  }

  const householdIds = memberships.map((m) => m.household_id)

  // Fetch ALL active vehicles in the household so Claude can pick the
  // best match per receipt. Ordered by updated_at desc so vehicles[0]
  // is the fallback when matching returns an invalid id.
  const { data: vehicleRows, error: vehiclesError } = await supabaseAdmin
    .from('vehicles')
    .select('id, year, make, model, trim, nickname, vin, license_plate, current_mileage')
    .in('household_id', householdIds)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })

  if (vehiclesError || !vehicleRows?.length) {
    console.error('No vehicle found for user households', userId, vehiclesError)
    await supabaseAdmin.from('unmatched_emails').insert({
      from_address: fromAddress,
      from_name: fromName,
      subject,
      text_body: textBody,
      html_body: htmlBody,
      attachment_count: attachments.length,
      postmark_payload: payload,
      claimed_by_user_id: userId,
      claimed_at: new Date().toISOString(),
      notes: 'matched user but no active vehicle in household',
    })
    return res.status(200).json({ ok: true, matched: true, parsed: 0, reason: 'no_vehicle' })
  }

  // Map current_mileage → last_known_mileage for the prompt shape.
  const vehiclesForMatching = vehicleRows.map((v) => ({
    id: v.id,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    nickname: v.nickname,
    vin: v.vin,
    license_plate: v.license_plate,
    last_known_mileage: v.current_mileage,
  }))
  const validVehicleIds = new Set(vehicleRows.map((v) => v.id))
  const fallbackVehicleId = vehicleRows[0].id

  // Parse each attachment with Claude Haiku, insert as service_record
  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_KEY missing')
    return res.status(200).json({ ok: false, error: 'no_api_key' })
  }

  let parsedCount = 0
  for (const attachment of parseable) {
    try {
      const requestBody = buildReceiptParseRequest({
        base64: attachment.Content,
        mediaType: attachment.ContentType,
        vehicles: vehiclesForMatching,
      })

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!anthropicResponse.ok) {
        const errBody = await anthropicResponse.text()
        console.error(`Anthropic error for ${attachment.Name}: ${anthropicResponse.status}`, errBody)
        continue
      }

      const data = await anthropicResponse.json()
      const parsed = extractParsedReceipt(data)

      // Matching fields are duplicated: dedicated columns are canonical;
      // raw_parsed_data preserves Claude's original response for auditing.
      // If Claude hallucinated a uuid not in the household, the dedicated
      // columns get the corrected values while raw_parsed_data keeps the
      // hallucinated id so we can see what Claude returned AND what we did.
      let matchedVehicleId = parsed.matched_vehicle_id
      let matchConfidence = parsed.match_confidence ?? null
      let matchReason = parsed.match_reason ?? null
      if (!matchedVehicleId || !validVehicleIds.has(matchedVehicleId)) {
        matchedVehicleId = fallbackVehicleId
        matchConfidence = 'low'
        matchReason = 'Matching returned invalid vehicle id; defaulted to most recent.'
      }

      const { error: recordError } = await supabaseAdmin
        .from('service_records')
        .insert({
          created_by: userId,
          vehicle_id: matchedVehicleId,
          service_type: parsed.service_type || null,
          shop_name: parsed.shop_name || null,
          service_date: parsed.date || null,
          mileage_at_service: parsed.mileage
            ? parseInt(String(parsed.mileage).replace(/[^\d]/g, ''), 10) || null
            : null,
          cost_cents: parsed.cost
            ? Math.round(parseFloat(String(parsed.cost).replace(/[^\d.]/g, '')) * 100) || null
            : null,
          line_items: Array.isArray(parsed.line_items)
            ? parsed.line_items.map((item) =>
                typeof item === 'string' ? item : JSON.stringify(item)
              )
            : [],
          raw_parsed_data: parsed,
          notes: parsed.notes || null,
          source: 'email_forward',
          status: 'pending_review',
          match_confidence: matchConfidence,
          match_reason: matchReason,
        })

      if (recordError) {
        console.error(`Failed to insert service_record for ${attachment.Name}`, recordError)
      } else {
        parsedCount++
        console.log(`Parsed ${attachment.Name} for user ${userId}`)
      }
    } catch (err) {
      console.error(`Error processing ${attachment.Name}`, err)
    }
  }

  return res.status(200).json({ ok: true, matched: true, parsed: parsedCount })
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
}