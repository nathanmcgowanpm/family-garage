// Shared receipt-parsing logic.
// Imported by serverless functions only (api/parse-receipt.js, api/inbound-email.js).
// The frontend POSTs {base64, mediaType} to /api/parse-receipt and receives
// the already-parsed object — it has no knowledge of Anthropic or the prompt.
// Vercel includes this directory with each function via vercel.json.

export const RECEIPT_PARSE_MODEL = 'claude-haiku-4-5-20251001'
export const RECEIPT_PARSE_MAX_TOKENS = 1024

export const RECEIPT_PARSE_PROMPT =
  `Parse this vehicle service receipt. Respond ONLY with JSON: ` +
  `{"service_type": "...", "shop_name": "...", "date": "YYYY-MM-DD", "mileage": "...", "cost": "...", "line_items": [], "notes": "..."}. ` +
  `Convert any date format on the receipt to ISO 8601 (YYYY-MM-DD). ` +
  `If the year is shown as 2 digits (e.g. '01/19/26'), interpret it as 20XX. ` +
  `Use null for missing.`

/**
 * Build the prompt for a receipt that should also be matched to one of
 * the household's vehicles. Returned text is plain string; embed in the
 * messages array as a text block.
 */
function buildMatchingPrompt(vehicles) {
  const lines = vehicles.map((v) => {
    const ymmt = [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ') || 'unknown'
    const parts = [`id=${v.id}`, ymmt]
    if (v.nickname) parts.push(`nickname: ${v.nickname}`)
    if (v.vin) parts.push(`VIN: ${v.vin}`)
    if (v.license_plate) parts.push(`plate: ${v.license_plate}`)
    if (v.last_known_mileage != null) parts.push(`last known mileage: ${v.last_known_mileage}`)
    return `- ${parts.join(' | ')}`
  }).join('\n')

  return (
    `You will see a vehicle service receipt and a list of vehicles in this household. ` +
    `Parse the receipt AND match it to one of the listed vehicles.\n\n` +
    `Household vehicles:\n${lines}\n\n` +
    `Respond ONLY with JSON: ` +
    `{"service_type": "...", "shop_name": "...", "date": "YYYY-MM-DD", "mileage": "...", "cost": "...", "line_items": [], "notes": "...", ` +
    `"matched_vehicle_id": "...", "match_confidence": "high"|"medium"|"low", "match_reason": "one short sentence"}. ` +
    `Convert any date format on the receipt to ISO 8601 (YYYY-MM-DD). ` +
    `If the year is shown as 2 digits (e.g. '01/19/26'), interpret it as 20XX. ` +
    `Use null for any missing receipt field.\n\n` +
    `Matching rules:\n` +
    `- high: receipt text contains a VIN matching a vehicle's VIN, OR a license plate matching, OR an explicit year+make+model that uniquely matches one vehicle.\n` +
    `- medium: indirect-but-strong signal (e.g. mileage in receipt within ~5% of a vehicle's last known mileage and only one vehicle is in that range, or unambiguous make+model when the household has only one of that make).\n` +
    `- low: no clear signal; pick best guess based on whatever is available.\n\n` +
    `matched_vehicle_id MUST be one of the ids listed above. Do not invent a uuid. Never return null. ` +
    `If you have nothing to go on, pick the first listed vehicle and use confidence "low".`
  )
}

/**
 * Build the request body for Anthropic's messages API for a single receipt.
 *
 * @param {Object} args
 * @param {string} args.base64 - The receipt file as a base64 string (no data: prefix)
 * @param {string} args.mediaType - e.g. 'application/pdf', 'image/jpeg', 'image/png'
 * @param {Array}  [args.vehicles] - Optional household vehicles for matching.
 *   Shape: {id, year, make, model, trim, nickname, vin, license_plate, last_known_mileage}.
 *   When omitted or empty, the original parse-only prompt is used (upload path behavior).
 * @returns {Object} Request body to POST to Anthropic
 */
export function buildReceiptParseRequest({ base64, mediaType, vehicles }) {
  const isPDF = mediaType === 'application/pdf'
  const prompt = vehicles?.length ? buildMatchingPrompt(vehicles) : RECEIPT_PARSE_PROMPT
  return {
    model: RECEIPT_PARSE_MODEL,
    max_tokens: RECEIPT_PARSE_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: isPDF ? 'document' : 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  }
}

/**
 * Extract and parse the JSON object from an Anthropic response.
 * Strips markdown fences if Claude wraps the JSON in them.
 *
 * @param {Object} anthropicResponse - The full response body from /v1/messages
 * @returns {Object} Parsed JSON. May include matching fields when the request
 *   included `vehicles`: matched_vehicle_id, match_confidence, match_reason.
 * @throws if no text block found or JSON parsing fails
 */
export function extractParsedReceipt(anthropicResponse) {
  const text = anthropicResponse.content?.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('No text content in Anthropic response')
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}
