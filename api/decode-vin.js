// Thin server endpoint: VIN string → normalized year/make/model/trim via NHTSA vPIC.
//
// Why server-side and not a direct client fetch?
// NHTSA vPIC is public and CORS-friendly, so a client-side fetch is technically
// viable. But putting it here keeps all response-shape handling in one place,
// makes it testable with curl, insulates the client from any future NHTSA API
// changes, and mirrors the established pattern (parse-receipt, extract-vin).
// The tradeoff (one extra hop) is negligible for a one-time onboarding call.

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues'

// Error codes that indicate hard failures where core fields will be empty.
// Code 1 (check digit) fires for nearly all VINs and is not a failure —
// the data decodes correctly regardless. Code 1 is intentionally excluded.
const FATAL_ERROR_CODES = new Set([
  5,   // VIN is not the correct length
  400, // Invalid characters present
])

/**
 * Normalize a raw NHTSA vPIC DecodeVinValues result object into our
 * internal vehicle spec shape.
 *
 * @param {Object} r   - Results[0] from vPIC response
 * @param {string} vin - The VIN that was decoded (echoed back)
 * @returns {{ ok: true, vin, year, make, model, trim, engine, bodyClass }
 *         | { ok: false, error: string, vin }}
 */
function normalizeNhtsaResult(r, vin) {
  // Parse the comma-separated error code list
  const errorCodes = r.ErrorCode
    ? r.ErrorCode.split(',').map((c) => parseInt(c.trim(), 10)).filter((n) => !isNaN(n))
    : []

  const hasFatal = errorCodes.some((c) => FATAL_ERROR_CODES.has(c))

  const year  = r.ModelYear?.trim() || ''
  const make  = r.Make?.trim()      || ''
  const model = r.Model?.trim()     || ''

  if (hasFatal || !year || !make || !model) {
    return { ok: false, error: 'VIN could not be decoded', vin }
  }

  // Prefer Trim; fall back to Series (vPIC puts the useful descriptor in
  // Series for some makes, e.g. many GM/Stellantis vehicles).
  const trim = r.Trim?.trim() || r.Series?.trim() || null

  // Engine summary: "3.6L 6-cyl" or just "3.6L" if cylinder count missing
  const displacement = r.DisplacementL?.trim()
  const cylinders    = r.EngineCylinders?.trim()
  const engine =
    displacement && cylinders ? `${displacement}L ${cylinders}-cyl`
    : displacement            ? `${displacement}L`
    : null

  const bodyClass = r.BodyClass?.trim() || null

  return {
    ok: true,
    vin,
    year:      parseInt(year, 10),
    make,
    model,
    trim,
    engine,
    bodyClass,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { vin } = req.body || {}
  if (!vin || typeof vin !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid vin' })
  }

  const trimmed = vin.trim().toUpperCase()
  if (trimmed.length !== 17) {
    return res.status(400).json({ error: 'VIN must be exactly 17 characters', vin: trimmed })
  }

  try {
    const url = `${NHTSA_BASE}/${encodeURIComponent(trimmed)}?format=json`
    const nhtsaRes = await fetch(url)

    if (!nhtsaRes.ok) {
      console.error(`NHTSA error ${nhtsaRes.status} for VIN ${trimmed}`)
      return res.status(502).json({ error: 'NHTSA decode unavailable' })
    }

    const body = await nhtsaRes.json()
    const result = body.Results?.[0]
    if (!result) {
      return res.status(502).json({ error: 'Unexpected NHTSA response shape' })
    }

    const normalized = normalizeNhtsaResult(result, trimmed)

    // Return 200 even for "ok: false" — the decode request itself succeeded;
    // the client decides what to do with an unrecognized VIN.
    return res.status(200).json(normalized)
  } catch (err) {
    console.error('decode-vin handler error:', err)
    return res.status(500).json({ error: 'VIN decode failed' })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4kb',
    },
  },
}
