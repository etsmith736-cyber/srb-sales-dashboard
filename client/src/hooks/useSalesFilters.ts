import { useState, useMemo } from 'react'
import type { SalesRow } from '../../../shared/types'

export interface SalesFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  salesRep: string
  webinarId: string
  leadSource: string
  stage: string
}

function isDateInRange(dateStr: string, range: { from?: Date; to?: Date }): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false

  if (range.from) {
    const from = new Date(range.from)
    from.setHours(0, 0, 0, 0)
    if (date < from) return false
  }

  if (range.to) {
    const to = new Date(range.to)
    to.setHours(23, 59, 59, 999)
    if (date > to) return false
  }

  return true
}

function matchesFilters(row: SalesRow, filters: SalesFilters): boolean {
  if (filters.salesRep !== 'all' && row.salesRep !== filters.salesRep) return false
  if (filters.webinarId !== 'all' && row.webinarId !== filters.webinarId) return false
  if (filters.leadSource !== 'all' && row.leadSource !== filters.leadSource) return false
  if (filters.stage !== 'all' && row.stage !== filters.stage) return false
  return true
}

export function useSalesFilters(data: SalesRow[]) {
  const [filters, setFilters] = useState<SalesFilters>({
    dateRange: { from: undefined, to: undefined },
    salesRep: 'all',
    webinarId: 'all',
    leadSource: 'all',
    stage: 'all',
  })

  // Unique values for filter dropdowns
  const salesReps = useMemo(() => {
    const set = new Set(data.map((r) => r.salesRep).filter(Boolean))
    return Array.from(set).sort()
  }, [data])

  const webinarIds = useMemo(() => {
    const set = new Set(data.map((r) => r.webinarId).filter(Boolean))
    return Array.from(set).sort()
  }, [data])

  const stages = useMemo(() => {
    const set = new Set(data.map((r) => r.stage).filter(Boolean))
    return Array.from(set).sort()
  }, [data])

  // Call metrics filter by appointment date (column B)
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Date range filter uses appointmentTime for call metrics
      if ((filters.dateRange.from || filters.dateRange.to) && !isDateInRange(row.appointmentTime, filters.dateRange)) {
        return false
      }
      return matchesFilters(row, filters)
    })
  }, [data, filters])

  // Revenue metrics filter by date of purchase (column R)
  const revenueFilteredData = useMemo(() => {
    return data.filter((row) => {
      // Date range filter uses dateOfPurchase for revenue metrics
      if ((filters.dateRange.from || filters.dateRange.to) && !isDateInRange(row.dateOfPurchase, filters.dateRange)) {
        return false
      }
      return matchesFilters(row, filters)
    })
  }, [data, filters])

  const updateFilter = (key: keyof SalesFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      salesRep: 'all',
      webinarId: 'all',
      leadSource: 'all',
      stage: 'all',
    })
  }

  return {
    filters,
    filteredData,
    revenueFilteredData,
    salesReps,
    webinarIds,
    stages,
    updateFilter,
    resetFilters,
  }
}
