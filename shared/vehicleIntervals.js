/**
 * Family Garage — Vehicle OEM Interval Fetching (server-side, shared module)
 * ---------------------------------------------------------------------------
 * Fetches manufacturer-recommended maintenance intervals for a specific
 * vehicle from Claude Haiku. Used by api/fetch-vehicle-intervals.js.
 *
 * CATEGORY_IDS is imported from serviceCategorizing.js — single source of
 * truth for the canonical 12 maintenance category ids.
 */

import { CATEGORY_IDS } from './serviceCategorizing.js'

export const INTERVALS_MODEL = 'claude-haiku-4-5-20251001'
export const INTERVALS_MAX_TOKENS = 512

/**
 * Build an Anthropic request for manufacturer-recommended maintenance intervals.
 *
 * @param {{ year: number|string, make: string, model: string, trim?: string }} args
 * @returns {Object} Anthropic messages API request body
 */
export function buildVehicleIntervalsRequest({ year, make, model, trim }) {
  const vehicleDesc = [year, make, model, trim].filter(Boolean).join(' ')

  const prompt =
    `You are providing manufacturer-recommended (OEM) maintenance intervals for a specific vehicle.\n\n` +
    `Vehicle: ${vehicleDesc}\n\n` +
    `For each maintenance category below, return the manufacturer's recommended interval in miles.\n` +
    `- For recurring items (oil changes, filters, tire rotation): how often the service should be performed.\n` +
    `- For milestone items (brake fluid, coolant, transmission fluid, spark plugs, brake pads): the mileage at which the service is first expected.\n\n` +
    `Categories: ${CATEGORY_IDS.join(', ')}\n\n` +
    `Rules:\n` +
    `1. Use the OEM's standard service schedule — not severe-duty, not extended-interval.\n` +
    `2. For oil changes, use the synthetic-oil interval when the manufacturer specifies one (most modern vehicles do).\n` +
    `3. Omit any category you cannot answer with reasonable confidence. Do not guess.\n\n` +
    `Respond with JSON only — no commentary, no markdown fences.\n` +
    `Shape: {"oil-change": 10000, "tire-rotation": 7500, "coolant-flush": 100000, ...}\n` +
    `Values are positive integers in miles. Omit unknown categories entirely — do not return null.`

  return {
    model: INTERVALS_MODEL,
    max_tokens: INTERVALS_MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  }
}

/**
 * Extract and validate vehicle intervals from an Anthropic response.
 * Drops unknown category keys and non-positive-integer values.
 * Returns {} (empty object) on any parse failure — the caller stores {}
 * and falls back to generic intervals. An empty result does not trigger
 * a retry.
 *
 * @param {Object} anthropicResponse - Full /v1/messages response body
 * @returns {{ [categoryId: string]: number }}
 */
export function extractVehicleIntervals(anthropicResponse) {
  try {
    const text = anthropicResponse.content?.find((b) => b.type === 'text')?.text
    if (!text) return {}
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const result = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (!CATEGORY_IDS.includes(key)) continue        // unknown category
      if (!Number.isInteger(value) || value <= 0) continue  // bad value
      result[key] = value
    }
    return result
  } catch {
    return {}
  }
}
