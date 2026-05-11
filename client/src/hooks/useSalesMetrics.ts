import { useMemo } from 'react'
import type { SalesRow } from '../../../shared/types'
import { parseCurrency } from '@/lib/utils'

export interface SalesMetrics {
  // Call metrics (filtered by appointment date)
  callsBooked: number
  showed: number
  noShow: number
  cancelled: number
  closed: number
  closeRate: string
  showRate: string
  effectiveShowRate: string
  effectiveShowRateDenominator: number
  cancellationRate: string
}

export interface RevenueMetrics {
  cashCollected: number
  contractedRevenue: number
  closedCount: number
  avgDealSize: number
  cashCollectedRows: number
  avgCashCollected: number
  avgSalesCycle: number
  cycleCount: number
}

export function useSalesMetrics(filteredData: SalesRow[], revenueData: SalesRow[]) {
  // Call performance metrics - uses filteredData (filtered by appointment date)
  const callMetrics = useMemo((): SalesMetrics => {
    const total = filteredData.length
    const showed = filteredData.filter((r) => r.showed === 'Showed').length
    const noShow = filteredData.filter((r) => r.showed === 'No-Show').length
    const cancelled = filteredData.filter((r) => r.showed === 'Cancelled').length
    const closed = filteredData.filter((r) => r.closed === 'Closed').length

    // Close rate = closed / showed (only count rows that showed)
    const closeRate = showed > 0 ? ((closed / showed) * 100).toFixed(1) : '0.0'

    // Show rate = showed / total booked
    const showRate = total > 0 ? ((showed / total) * 100).toFixed(1) : '0.0'

    // Effective show rate = showed / (showed + no-show), excludes cancelled
    const effectiveDenom = showed + noShow
    const effectiveShowRate = effectiveDenom > 0 ? ((showed / effectiveDenom) * 100).toFixed(1) : '0.0'

    // Cancellation rate
    const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0'

    return {
      callsBooked: total,
      showed,
      noShow,
      cancelled,
      closed,
      closeRate,
      showRate,
      effectiveShowRate,
      effectiveShowRateDenominator: effectiveDenom,
      cancellationRate,
    }
  }, [filteredData])

  // Revenue metrics - uses revenueData (filtered by date of purchase)
  const revenueMetrics = useMemo((): RevenueMetrics => {
    // Total cash collected - any row with cash regardless of status
    const cashCollected = revenueData.reduce((sum, row) => {
      const val = parseCurrency(row.cashCollected)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)

    // Total contracted revenue - any row with revenue regardless of status
    const contractedRevenue = revenueData.reduce((sum, row) => {
      const val = parseCurrency(row.contractedRevenue)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)

    // Avg deal size = contracted revenue / closed count (only H="Closed")
    const closedCount = revenueData.filter((r) => r.closed === 'Closed').length
    const avgDealSize = closedCount > 0 ? contractedRevenue / closedCount : 0

    // Avg cash collected = cash / rows with cash
    const cashCollectedRows = revenueData.filter((r) => {
      const val = parseCurrency(r.cashCollected)
      return !isNaN(val) && val > 0
    }).length
    const avgCashCollected = cashCollectedRows > 0 ? cashCollected / cashCollectedRows : 0

    // Average Sales Cycle = days between appointment date (B) and purchase date (R)
    // Only for rows where H="Closed" and both dates exist
    let totalCycleDays = 0
    let cycleCount = 0
    revenueData.forEach((row) => {
      if (row.closed === 'Closed' && row.appointmentTime && row.dateOfPurchase) {
        const apptDate = new Date(row.appointmentTime)
        const purchaseDate = new Date(row.dateOfPurchase)
        if (!isNaN(apptDate.getTime()) && !isNaN(purchaseDate.getTime())) {
          const diffMs = purchaseDate.getTime() - apptDate.getTime()
          const diffDays = diffMs / (1000 * 60 * 60 * 24)
          if (diffDays >= 0) {
            totalCycleDays += diffDays
            cycleCount++
          }
        }
      }
    })
    const avgSalesCycle = cycleCount > 0 ? totalCycleDays / cycleCount : 0

    return {
      cashCollected,
      contractedRevenue,
      closedCount,
      avgDealSize,
      cashCollectedRows,
      avgCashCollected,
      avgSalesCycle,
      cycleCount,
    }
  }, [revenueData])

  // Charts data - Closed Deals by Sales Rep
  const closedBySalesRep = useMemo(() => {
    const map: Record<string, number> = {}
    filteredData
      .filter((r) => r.closed === 'Closed' && r.salesRep)
      .forEach((r) => {
        map[r.salesRep] = (map[r.salesRep] || 0) + 1
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Contracted Revenue by Webinar
  const revenueByWebinar = useMemo(() => {
    const map: Record<string, number> = {}
    revenueData
      .filter((r) => r.closed === 'Closed' && r.webinarId)
      .forEach((r) => {
        const val = parseCurrency(r.contractedRevenue)
        if (!isNaN(val)) {
          map[r.webinarId] = (map[r.webinarId] || 0) + val
        }
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [revenueData])

  // Roadmap Booked by Setter
  const bookedBySetter = useMemo(() => {
    const map: Record<string, number> = {}
    filteredData
      .filter((r) => r.setter)
      .forEach((r) => {
        map[r.setter] = (map[r.setter] || 0) + 1
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Showed by Webinar
  const showedByWebinar = useMemo(() => {
    const map: Record<string, number> = {}
    filteredData
      .filter((r) => r.showed === 'Showed' && r.webinarId)
      .forEach((r) => {
        map[r.webinarId] = (map[r.webinarId] || 0) + 1
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  return {
    callMetrics,
    revenueMetrics,
    closedBySalesRep,
    revenueByWebinar,
    bookedBySetter,
    showedByWebinar,
  }
}
