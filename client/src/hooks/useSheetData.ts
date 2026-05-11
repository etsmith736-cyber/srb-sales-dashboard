import { useState, useCallback, useEffect } from 'react'
import type { SalesRow } from '../../../shared/types'

interface SheetDataState {
  data: SalesRow[]
  loading: boolean
  error: string | null
  lastFetched: Date | null
}

export function useSheetData() {
  const [state, setState] = useState<SheetDataState>({
    data: [],
    loading: true,
    error: null,
    lastFetched: null,
  })

  const fetchData = useCallback(async (refresh = false) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await fetch(refresh ? '/api/sheet-data/refresh' : '/api/sheet-data', {
        method: refresh ? 'POST' : 'GET',
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error || 'Failed to load data')
      setState({ data: json.data, loading: false, error: null, lastFetched: new Date() })
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message || 'Unknown error' }))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refresh: () => fetchData(true) }
}
