// Shared VIN-extraction logic.
// Imported by serverless functions only (api/extract-vin.js).
// The frontend POSTs {base64, mediaType} to /api/extract-vin and receives
// {vin, confidence} — it has no knowledge of Anthropic or this prompt.
// Vercel includes this directory with each function via vercel.json.
//
// Architecture: the vision model does ONE narrow job — read the raw VIN
// characters from the image. Authoritative year/make/model/trim decoding
// is handled separately by NHTSA vPIC (api/decode-vin.js). Never ask
// the vision model to interpret the VIN — only to transcribe it.

import { extractParsedReceipt } from './receiptParsing.js'

export const VIN_EXTRACT_MODEL     = 'claude-haiku-4-5-20251001'
export const VIN_EXTRACT_MAX_TOKENS = 256

export const VIN_EXTRACT_PROMPT =
  `Your task is to find and read the Vehicle Identification Number (VIN) in this image.\n\n` +
  `Rules:\n` +
  `- A VIN is exactly 17 characters: digits 0–9 and uppercase letters A–Z.\n` +
  `- The letters I, O, and Q never appear in a valid VIN. If you see a character ` +
  `that looks like I, it is the digit 1. If it looks like O, it is the digit 0. ` +
  `Q does not appear in VINs at all.\n` +
  `- Transcribe only what you can actually see. Do not guess or fill in characters ` +
  `that are obscured, damaged, or out of frame.\n` +
  `- confidence "high": all 17 characters are clearly legible with no ambiguity.\n` +
  `- confidence "medium": 1–2 characters required inference (e.g. I vs 1 substitution).\n` +
  `- confidence "low": more than 2 characters uncertain, VIN is partially obscured, ` +
  `or fewer than 17 characters are readable.\n` +
  `- If no VIN is visible or it cannot be read, return vin: null with confidence "low".\n\n` +
  `Respond ONLY with a JSON object — no explanation, no markdown, no extra text:\n` +
  `{"vin": "1C4HJXDG2MW820338", "confidence": "high"}`

/**
 * Build the Anthropic messages API request body for VIN extraction.
 *
 * @param {Object} args
 * @param {string} args.base64   - Image as base64 string (no data: prefix)
 * @param {string} args.mediaType - e.g. 'image/jpeg', 'image/png', 'image/webp'
 * @returns {Object} Request body to POST to Anthropic /v1/messages
 */
export function buildVinExtractRequest({ base64, mediaType }) {
  return {
    model: VIN_EXTRACT_MODEL,
    max_tokens: VIN_EXTRACT_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: VIN_EXTRACT_PROMPT },
        ],
      },
    ],
  }
}

/**
 * Parse the Anthropic response into {vin, confidence}.
 * Reuses extractParsedReceipt (generic fence-strip + JSON.parse) from
 * receiptParsing.js — the fence-stripping logic is not duplicated.
 *
 * @param {Object} anthropicResponse - Full response body from /v1/messages
 * @returns {{ vin: string|null, confidence: 'high'|'medium'|'low' }}
 * @throws if no text block found or JSON parsing fails
 */
export function extractVinResult(anthropicResponse) {
  // extractParsedReceipt is a generic "strip fences, JSON.parse" helper.
  // It works for any Anthropic response that returns a JSON object.
  return extractParsedReceipt(anthropicResponse)
}
