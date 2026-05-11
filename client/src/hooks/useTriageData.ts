import { useState, useCallback, useEffect, useMemo } from 'react'
import type { TriageRow } from '../../../shared/types'

interface TriageDataState {
  data: TriageRow[]
  loading: boolean
  error: string | null
}

export function useTriageData() {
  const [data, setData] = useState<TriageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (refresh = false) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        refresh ? '/api/triage-data/refresh' : '/api/triage-data',
        refresh ? { method: 'POST' } : {}
      )
      const json = await response.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to fetch triage data')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(() => fetchData(true), [fetchData])

  return { data, loading, error, refresh }
}

export function useTriageFilters(data: TriageRow[]) {
  const [filters, setFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    setter: '',
    leadSource: '',
    webinarId: '',
  })

  const setters = useMemo(() => {
    const set = new Set<string>()
    data.forEach((row) => {
      if (row.setter && row.setter.trim()) set.add(row.setter.trim())
    })
    return Array.from(set).sort()
  }, [data])

  const leadSources = useMemo(() => {
    const set = new Set<string>()
    data.forEach((row) => {
      if (row.leadSource && row.leadSource.trim()) set.add(row.leadSource.trim())
    })
    return Array.from(set).sort()
  }, [data])

  const webinarIds = useMemo(() => {
    const set = new Set<string>()
    data.forEach((row) => {
      if (row.webinarId && row.webinarId.trim()) set.add(row.webinarId.trim())
    })
    return Array.from(set).sort()
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.setter && row.setter !== filters.setter) return false
      if (filters.leadSource && row.leadSource !== filters.leadSource) return false
      if (filters.webinarId && row.webinarId !== filters.webinarId) return false
      if (filters.dateFrom || filters.dateTo) {
        const rowDate = new Date(row.appointmentTime)
        if (isNaN(rowDate.getTime())) return false
        if (filters.dateFrom && rowDate < filters.dateFrom) return false
        if (filters.dateTo) {
          const end = new Date(filters.dateTo)
          end.setHours(23, 59, 59, 999)
          if (rowDate > end) return false
        }
      }
      return true
    })
  }, [data, filters])

  return {
    filters,
    setFilters,
    filteredData,
    setters,
    leadSources,
    webinarIds,
  }
}
