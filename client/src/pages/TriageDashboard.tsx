import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useMemo } from 'react'
import type { TriageRow } from '../../../shared/types'

const CHART_COLORS = ['#C4F700', '#5C94EB', '#FFA1D9', '#34d399', '#a78bfa', '#fb923c', '#f87171']

interface TriageDashboardProps {
  data: TriageRow[]
}

export function TriageDashboard({ data }: TriageDashboardProps) {
  const metrics = useMemo(() => {
    const total = data.length
    const showed = data.filter((r) => r.showed === 'Showed').length
    const noShow = data.filter((r) => r.showed === 'No-Show').length
    const showRate = total > 0 ? ((showed / total) * 100).toFixed(1) : '0.0'
    const bookingRate = total > 0 ? ((showed / total) * 100).toFixed(1) : '0.0'
    return { total, showed, noShow, showRate, bookingRate }
  }, [data])

  const bookedBySetter = useMemo(() => {
    const map: Record<string, number> = {}
    data.filter((r) => r.setter).forEach((r) => { map[r.setter] = (map[r.setter] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [data])

  const showedByWebinar = useMemo(() => {
    const map: Record<string, number> = {}
    data.filter((r) => r.showed === 'Showed' && r.webinarId).forEach((r) => { map[r.webinarId] = (map[r.webinarId] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [data])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-[#2E2D32]/50"><p>No triage data available</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-medium text-[#2E2D32]/50 uppercase">Roadmap Booked</p>
          <p className="text-2xl font-bold text-[#2E2D32] mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-medium text-[#2E2D32]/50 uppercase">Showed</p>
          <p className="text-2xl font-bold text-[#2E2D32] mt-1">{metrics.showed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-medium text-[#2E2D32]/50 uppercase">Show Rate</p>
          <p className="text-2xl font-bold text-[#2E2D32] mt-1">{metrics.showRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-medium text-[#2E2D32]/50 uppercase">Roadmap Booking Rate</p>
          <p className="text-2xl font-bold text-[#2E2D32] mt-1">{metrics.bookingRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#2E2D32]">Roadmap Booked by Setter</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookedBySetter} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {bookedBySetter.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#2E2D32]">Showed by Webinar</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={showedByWebinar} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {showedByWebinar.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
