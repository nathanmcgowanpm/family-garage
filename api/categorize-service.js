import { buildServiceCategorizeRequest, extractCategories } from '../shared/serviceCategorizing.js'

/**
 * POST /api/categorize-service
 * ----------------------------
 * Classify a service description into canonical maintenance categories.
 * Used by the manual-entry log flow (no receipt image available).
 *
 * Request body: { serviceType: string, lineItems?: string[] }
 * Response:     { categories: string[] }  — always an array, [] if none match
 *
 * Categorization failure must never block a record save. If this endpoint
 * errors, the caller falls back to categories: null and logs the failure.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_KEY not set in environment')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { serviceType, lineItems } = req.body || {}
  if (!serviceType?.trim()) {
    return res.status(400).json({ error: 'Missing serviceType' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(
        buildServiceCategorizeRequest({ serviceType: serviceType.trim(), lineItems })
      ),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error(`Anthropic error ${response.status}:`, errBody)
      return res.status(500).json({ error: 'Categorization failed' })
    }

    const data = await response.json()
    const categories = extractCategories(data)
    return res.status(200).json({ categories })
  } catch (err) {
    console.error('categorize-service handler error:', err)
    return res.status(500).json({ error: 'Categorization failed' })
  }
}
