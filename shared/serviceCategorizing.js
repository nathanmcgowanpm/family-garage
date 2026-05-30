/**
 * Family Garage — Service Categorization (server-side, shared module)
 * --------------------------------------------------------------------
 * Standalone AI categorization for service records that did not go through
 * receipt parsing (manual log entries). Also exports CATEGORY_IDS, which
 * shared/receiptParsing.js embeds in the combined parse+categorize prompt.
 *
 * MAINTENANCE CONTRACT: CATEGORY_IDS must stay in sync with the `id` values
 * in MAINTENANCE_ITEMS (src/data/maintenance-intervals.js). Claude returns
 * these strings; buildLastServicedMap reads them to build service baselines.
 */

export const CATEGORY_MODEL = 'claude-haiku-4-5-20251001'
export const CATEGORY_MAX_TOKENS = 256

/**
 * Canonical maintenance category ids.
 * Must match the `id` fields in MAINTENANCE_ITEMS in
 * src/data/maintenance-intervals.js — update both files together.
 */
export const CATEGORY_IDS = [
  'oil-change',
  'tire-rotation',
  'brake-fluid-flush',
  'engine-air-filter',
  'cabin-air-filter',
  'coolant-flush',
  'transmission-fluid',
  'wheel-alignment',
  'battery-test',
  'spark-plugs',
  'wiper-blades',
  'brake-pads',
]

/**
 * Build an Anthropic request for classifying a service description into
 * canonical maintenance categories. Used for manual log entries that never
 * went through receipt parsing.
 *
 * @param {{ serviceType: string, lineItems?: Array }} args
 *   lineItems may be strings or objects; both are handled.
 * @returns {Object} Anthropic messages API request body
 */
export function buildServiceCategorizeRequest({ serviceType, lineItems }) {
  const itemsSection =
    Array.isArray(lineItems) && lineItems.length
      ? `\nLine items:\n${lineItems
          .map((l) => `- ${typeof l === 'string' ? l : JSON.stringify(l)}`)
          .join('\n')}`
      : ''

  const prompt =
    `Classify this vehicle service into maintenance categories.\n` +
    `Valid ids: ${CATEGORY_IDS.join(', ')}.\n\n` +
    `Rules:\n` +
    `- A service may match multiple categories (oil change + tire rotation → ["oil-change","tire-rotation"])\n` +
    `- Use [] if no category applies (windshield, diagnostic fee, state inspection, etc.)\n` +
    `- Match on actual maintenance content, not keyword proximity:\n` +
    `  "Cooling System Exchange" → "coolant-flush"\n` +
    `  "Brake System Service" → ["brake-pads","brake-fluid-flush"] depending on context\n` +
    `  "Full synthetic oil service" → "oil-change"\n` +
    `  "AC recharge" → [] (out of taxonomy)\n\n` +
    `Service: ${serviceType}${itemsSection}\n\n` +
    `Respond ONLY with JSON: {"categories": ["id1", "id2"]}`

  return {
    model: CATEGORY_MODEL,
    max_tokens: CATEGORY_MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  }
}

/**
 * Extract and validate the categories array from an Anthropic response.
 * Filters out any ids not in the canonical list. Returns [] on any failure
 * so callers can always treat the result as a usable array.
 *
 * @param {Object} anthropicResponse - Full /v1/messages response body
 * @returns {string[]}
 */
export function extractCategories(anthropicResponse) {
  try {
    const text = anthropicResponse.content?.find((b) => b.type === 'text')?.text
    if (!text) return []
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const cats = parsed?.categories
    if (!Array.isArray(cats)) return []
    return cats.filter((c) => CATEGORY_IDS.includes(c))
  } catch {
    return []
  }
}
