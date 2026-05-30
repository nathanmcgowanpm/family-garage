import { buildVehicleIntervalsRequest, extractVehicleIntervals } from '../shared/vehicleIntervals.js'

/**
 * POST /api/fetch-vehicle-intervals
 * ----------------------------------
 * Fetch manufacturer-recommended (OEM) maintenance intervals for a vehicle.
 * Called fire-and-forget after vehicle save — does not block the save.
 *
 * Request body: { year, make, model, trim? }
 * Response:     { intervals: { [categoryId]: number } }
 *
 * On Anthropic failure (error or timeout), returns { intervals: {} } rather
 * than 500 — the caller stores {} and the advisor falls back to generic
 * intervals. No retry storm on transient failures.
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

  const { year, make, model, trim } = req.body || {}
  if (!year || !make || !model) {
    return res.status(400).json({ error: 'Missing required fields: year, make, model' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(buildVehicleIntervalsRequest({ year, make, model, trim })),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error(`Anthropic error ${response.status}:`, errBody)
      // Return empty — caller stores {} and falls back to generics.
      return res.status(200).json({ intervals: {} })
    }

    const data = await response.json()
    const intervals = extractVehicleIntervals(data)
    console.log(`OEM intervals fetched for ${[year, make, model, trim].filter(Boolean).join(' ')}:`, intervals)
    return res.status(200).json({ intervals })
  } catch (err) {
    console.error('fetch-vehicle-intervals handler error:', err)
    return res.status(200).json({ intervals: {} })
  }
}
