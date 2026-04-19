import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read API key directly from .env file
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8')
const apiKey = envFile.split('\n')
  .find(l => l.startsWith('ANTHROPIC_KEY='))
  ?.split('=').slice(1).join('=').trim()

console.log('API key loaded:', apiKey ? apiKey.slice(0, 20) + '...' : 'MISSING')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '20mb' }))

app.post('/api/parse-receipt', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3001, () => console.log('API server running on http://localhost:3001'))