import { buildReceiptParseRequest, extractParsedReceipt } from '../shared/receiptParsing.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_KEY not set in environment')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { base64, mediaType } = req.body || {}
  if (!base64 || !mediaType) {
    return res.status(400).json({ error: 'Missing base64 or mediaType' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(buildReceiptParseRequest({ base64, mediaType })),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error(`Anthropic error ${response.status}:`, errBody)
      return res.status(500).json({ error: 'Parsing failed' })
    }

    const data = await response.json()
    const parsed = extractParsedReceipt(data)
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Parsing failed' })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}
