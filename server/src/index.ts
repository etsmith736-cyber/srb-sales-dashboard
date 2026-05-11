import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './router.js'
import { fetchSalesData, fetchTriageData } from './sheets.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
)

// REST API routes for sheet data
app.get('/api/sheet-data', async (req, res) => {
  try {
    const data = await fetchSalesData(false)
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching sales data:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch data' })
  }
})

app.post('/api/sheet-data/refresh', async (req, res) => {
  try {
    const data = await fetchSalesData(true)
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error refreshing sales data:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to refresh data' })
  }
})

app.get('/api/triage-data', async (req, res) => {
  try {
    const data = await fetchTriageData(false)
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching triage data:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch triage data' })
  }
})

app.post('/api/triage-data/refresh', async (req, res) => {
  try {
    const data = await fetchTriageData(true)
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error refreshing triage data:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to refresh triage data' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`tRPC available at http://localhost:${PORT}/trpc`)
})
