import { createClient } from '@supabase/supabase-js'
import { buildReceiptParseRequest, extractParsedReceipt } from './_lib/receiptParsing.js'

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

  // Auth check - basic auth from Postmark
  const expectedSecret = process.env.POSTMARK_WEBHOOK_SECRET
  if (!expectedSecret) {
    console.error('POSTMARK_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

 const authHeader = req.headers.authorization || ''
const expectedAuth = 'Basic ' + Buffer.from(`postmark:${expectedSecret}`).toString('base64')

if (authHeader !== expectedAuth) {
  // TEMPORARY DEBUG - revert after diagnosing
  const expectedSnippet = expectedSecret
    ? expectedSecret.slice(0, 8) + '...' + expectedSecret.slice(-8)
    : 'EMPTY'
  let receivedDecoded = 'NO_HEADER'
  if (authHeader.startsWith('Basic ')) {
    try {
      receivedDecoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8')
      const colonIdx = receivedDecoded.indexOf(':')
      if (colonIdx !== -1) {
        const username = receivedDecoded.slice(0, colonIdx)
        const password = receivedDecoded.slice(colonIdx + 1)
        receivedDecoded = `user="${username}" passLen=${password.length} passSnippet="${password.slice(0, 8)}...${password.slice(-8)}"`
      }
    } catch (e) {
      receivedDecoded = 'DECODE_ERROR'
    }
  }
  console.warn('Invalid auth', {
    envSecretLen: expectedSecret?.length || 0,
    envSecretSnippet: expectedSnippet,
    received: receivedDecoded,
  })
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

  // Find vehicle - use most recently updated.
  // Future: match make/model/VIN from receipt text against vehicles list.
  const { data: vehicles, error: vehiclesError } = await supabaseAdmin
    .from('vehicles')
    .select('id')
    .eq('created_by', userId)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (vehiclesError || !vehicles?.length) {
    console.error('No vehicle found for user', userId, vehiclesError)
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
      notes: 'matched user but no vehicle on account',
    })
    return res.status(200).json({ ok: true, matched: true, parsed: 0, reason: 'no_vehicle' })
  }
  const vehicleId = vehicles[0].id

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

      const { error: recordError } = await supabaseAdmin
        .from('service_records')
        .insert({
          created_by: userId,
          vehicle_id: vehicleId,
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