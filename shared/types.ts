// Shared types between client and server

export interface SalesRow {
  rowIndex: number
  // Column A - Date Added
  dateAdded: string
  // Column B - Appointment Time/Date
  appointmentTime: string
  // Column C - Sales Rep (Closer)
  salesRep: string
  // Column D - Lead Source
  leadSource: string
  // Column E - Webinar ID
  webinarId: string
  // Column F - Setter
  setter: string
  // Column G - Showed status
  showed: string
  // Column H - Closed status ("Closed" or other)
  closed: string
  // Column I - Cash Collected
  cashCollected: string
  // Column J - Contracted Revenue
  contractedRevenue: string
  // Column R - Date of Purchase
  dateOfPurchase: string
  // Additional columns
  notes: string
  stage: string
}

export interface TriageRow {
  rowIndex: number
  dateAdded: string
  appointmentTime: string
  setter: string
  leadSource: string
  webinarId: string
  showed: string
  status: string
  notes: string
}

export interface DashboardUser {
  id: number
  email: string
  isAdmin: number
  createdAt: string
}

export interface SheetDataResponse {
  success: boolean
  data: SalesRow[]
  error?: string
}

export interface TriageDataResponse {
  success: boolean
  data: TriageRow[]
  error?: string
}

export interface AuthResponse {
  success: boolean
  user?: DashboardUser
  error?: string
}
