// Shared receipt-parsing logic.
// Single source of truth — imported by both the frontend (src/App.jsx)
// and serverless functions (api/parse-receipt.js, api/inbound-email.js).
// Vercel includes this directory with each function via vercel.json.

export const RECEIPT_PARSE_MODEL = 'claude-haiku-4-5-20251001'
export const RECEIPT_PARSE_MAX_TOKENS = 1024

export const RECEIPT_PARSE_PROMPT =
  `Parse this vehicle service receipt. Respond ONLY with JSON: ` +
  `{"service_type": "...", "shop_name": "...", "date": "...", "mileage": "...", "cost": "...", "line_items": [], "notes": "..."}. ` +
  `Use null for missing.`

/**
 * Build the request body for Anthropic's messages API for a single receipt.
 *
 * @param {Object} args
 * @param {string} args.base64 - The receipt file as a base64 string (no data: prefix)
 * @param {string} args.mediaType - e.g. 'application/pdf', 'image/jpeg', 'image/png'
 * @returns {Object} Request body to POST to Anthropic
 */
export function buildReceiptParseRequest({ base64, mediaType }) {
  const isPDF = mediaType === 'application/pdf'
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
          { type: 'text', text: RECEIPT_PARSE_PROMPT },
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
 * @returns {Object} Parsed JSON with service_type, shop_name, date, mileage, cost, line_items, notes
 * @throws if no text block found or JSON parsing fails
 */
export function extractParsedReceipt(anthropicResponse) {
  const text = anthropicResponse.content?.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('No text content in Anthropic response')
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}