import { google } from 'googleapis'
import type { SalesRow, TriageRow } from './shared-types.js'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '143pCbA2rktBqI-t3EYUjZBiZNZv0i-WxuPobN9wKRW0'
const SALES_SHEET_NAME = 'Sales Calls'
const TRIAGE_SHEET_NAME = 'Triage Calls'

// Cache for sheet data
let salesCache: { data: SalesRow[]; fetchedAt: number } | null = null
let triageCache: { data: TriageRow[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getAuth() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (apiKey) {
    return google.auth.fromAPIKey(apiKey)
  }

  // Try service account credentials
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (credentialsJson) {
    const credentials = JSON.parse(credentialsJson)
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
  }

  throw new Error('No Google authentication configured. Set GOOGLE_API_KEY or GOOGLE_SERVICE_ACCOUNT_JSON.')
}

function parseCurrency(value: string): number {
  if (!value) return NaN
  const cleaned = value.replace(/[$,\s]/g, '')
  return parseFloat(cleaned)
}

function parseDate(value: string): string {
  if (!value) return ''
  return value.trim()
}

/**
 * Parse a row from the Sales Calls sheet into a SalesRow object.
 * Column mapping (0-indexed):
 * A(0)  = Date Added
 * B(1)  = Appointment Time
 * C(2)  = Sales Rep (Closer)
 * D(3)  = Lead Source
 * E(4)  = Webinar ID
 * F(5)  = Setter
 * G(6)  = Showed status
 * H(7)  = Closed status
 * I(8)  = Cash Collected
 * J(9)  = Contracted Revenue
 * R(17) = Date of Purchase
 */
function parseSalesRow(row: string[], rowIndex: number): SalesRow {
  return {
    rowIndex,
    dateAdded: parseDate(row[0] || ''),
    appointmentTime: parseDate(row[1] || ''),
    salesRep: (row[2] || '').trim(),
    leadSource: (row[3] || '').trim(),
    webinarId: (row[4] || '').trim(),
    setter: (row[5] || '').trim(),
    showed: (row[6] || '').trim(),
    closed: (row[7] || '').trim(),
    cashCollected: (row[8] || '').trim(),
    contractedRevenue: (row[9] || '').trim(),
    dateOfPurchase: parseDate(row[17] || ''),
    notes: (row[10] || '').trim(),
    stage: (row[7] || '').trim(), // stage mirrors closed column
  }
}

/**
 * Parse a row from the Triage Calls sheet into a TriageRow object.
 * Column mapping (0-indexed):
 * A(0)  = Date Added
 * B(1)  = Appointment Time
 * C(2)  = Setter (col C in Triage = setter, col M in original = setter per spec)
 * D(3)  = Lead Source
 * E(4)  = Webinar ID
 * F(5)  = Showed
 * G(6)  = Status
 * H(7)  = Notes
 */
function parseTriageRow(row: string[], rowIndex: number): TriageRow {
  return {
    rowIndex,
    dateAdded: parseDate(row[0] || ''),
    appointmentTime: parseDate(row[1] || ''),
    setter: (row[2] || '').trim(),
    leadSource: (row[3] || '').trim(),
    webinarId: (row[4] || '').trim(),
    showed: (row[5] || '').trim(),
    status: (row[6] || '').trim(),
    notes: (row[7] || '').trim(),
  }
}

export async function fetchSalesData(forceRefresh = false): Promise<SalesRow[]> {
  const now = Date.now()

  if (!forceRefresh && salesCache && now - salesCache.fetchedAt < CACHE_TTL_MS) {
    return salesCache.data
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth: auth as any })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SALES_SHEET_NAME}!A2:S`,
  })

  const rows = response.data.values || []
  const data = rows
    .filter((row) => row.some((cell) => cell && cell.toString().trim()))
    .map((row, i) => parseSalesRow(row.map(String), i + 2))

  salesCache = { data, fetchedAt: now }
  return data
}

export async function fetchTriageData(forceRefresh = false): Promise<TriageRow[]> {
  const now = Date.now()

  if (!forceRefresh && triageCache && now - triageCache.fetchedAt < CACHE_TTL_MS) {
    return triageCache.data
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth: auth as any })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TRIAGE_SHEET_NAME}!A2:N`,
  })

  const rows = response.data.values || []
  const data = rows
    .filter((row) => row.some((cell) => cell && cell.toString().trim()))
    .map((row, i) => parseTriageRow(row.map(String), i + 2))

  triageCache = { data, fetchedAt: now }
  return data
}
