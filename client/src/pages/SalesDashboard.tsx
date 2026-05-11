import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { PhoneCall, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import type { SalesRow } from '../../../shared/types'
import { useSalesMetrics } from '@/hooks/useSalesMetrics'
import { formatCurrency, formatDays } from '@/lib/utils'

const CHART_COLORS = ['#C4F700', '#5C94EB', '#FFA1D9', '#34d399', '#a78bfa', '#fb923c', '#f87171']

interface SalesDashboardProps {
  data: SalesRow[]
  revenueData: SalesRow[]
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#C4F700',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 xs:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-[#2E2D32]/50 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-[#2E2D32] mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-[#2E2D32]/40 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 xs:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2E2D32]">{title}</h3>
      {subtitle && <p className="text-xs text-[#2E2D32]/40 mt-0.5">{subtitle}</p>}
      <div className="mt-4 h-64">{children}</div>
    </div>
  )
}

export function SalesDashboard({ data, revenueData }: SalesDashboardProps) {
  const {
    callMetrics,
    revenueMetrics,
    closedBySalesRep,
    revenueByWebinar,
    bookedBySetter,
    showedByWebinar,
  } = useSalesMetrics(data, revenueData)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#2E2D32]/50">
        <p>No data matches the current filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Call Performance Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-[#2E2D32]/70 mb-3 uppercase tracking-wide">
          Call Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
          <MetricCard
            title="Calls Booked"
            value={callMetrics.callsBooked}
            icon={PhoneCall}
            color="#5C94EB"
          />
          <MetricCard
            title="Show Rate"
            value={`${callMetrics.showRate}%`}
            subtitle={`${callMetrics.showed} showed`}
            icon={TrendingUp}
            color="#34d399"
          />
          <MetricCard
            title="Close Rate"
            value={`${callMetrics.closeRate}%`}
            subtitle={`${callMetrics.closed} closed`}
            icon={TrendingUp}
            color="#C4F700"
          />
          <MetricCard
            title="Effective Show Rate"
            value={`${callMetrics.effectiveShowRate}%`}
            subtitle="Excl. cancellations"
            icon={TrendingUp}
            color="#a78bfa"
          />
          <MetricCard
            title="No-Show Rate"
            value={`${(100 - parseFloat(callMetrics.showRate)).toFixed(1)}%`}
            subtitle={`${callMetrics.noShow} no-shows`}
            icon={PhoneCall}
            color="#f87171"
          />
          <MetricCard
            title="Cancellation Rate"
            value={`${callMetrics.cancellationRate}%`}
            subtitle={`${callMetrics.cancelled} cancelled`}
            icon={Calendar}
            color="#fb923c"
          />
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-[#2E2D32]/70 mb-3 uppercase tracking-wide">
          Revenue
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
          <MetricCard
            title="Cash Collected"
            value={formatCurrency(revenueMetrics.cashCollected)}
            subtitle={`${revenueMetrics.cashCollectedRows} payments`}
            icon={DollarSign}
            color="#C4F700"
          />
          <MetricCard
            title="Contracted Revenue"
            value={formatCurrency(revenueMetrics.contractedRevenue)}
            subtitle={`${revenueMetrics.closedCount} closed deals`}
            icon={DollarSign}
            color="#5C94EB"
          />
          <MetricCard
            title="Avg Deal Size"
            value={formatCurrency(revenueMetrics.avgDealSize)}
            subtitle="Per closed deal"
            icon={TrendingUp}
            color="#a78bfa"
          />
          <MetricCard
            title="Avg Cash Collected"
            value={formatCurrency(revenueMetrics.avgCashCollected)}
            subtitle="Per payment"
            icon={DollarSign}
            color="#34d399"
          />
          <MetricCard
            title="Avg Sales Cycle"
            value={formatDays(revenueMetrics.avgSalesCycle)}
            subtitle={`${revenueMetrics.cycleCount} deals measured`}
            icon={Calendar}
            color="#fb923c"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Closed Deals by Sales Rep" subtitle="Number of closed deals per closer">
          {closedBySalesRep.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={closedBySalesRep} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {closedBySalesRep.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[#2E2D32]/40">
              No closed deals in selected range
            </div>
          )}
        </ChartCard>

        <ChartCard title="Contracted Revenue by Webinar" subtitle="Total contracted value per webinar ID">
          {revenueByWebinar.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByWebinar} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {revenueByWebinar.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[#2E2D32]/40">
              No revenue data in selected range
            </div>
          )}
        </ChartCard>

        <ChartCard title="Roadmap Booked by Setter" subtitle="Number of roadmap bookings per setter">
          {bookedBySetter.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookedBySetter} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {bookedBySetter.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[#2E2D32]/40">
              No roadmap bookings in selected range
            </div>
          )}
        </ChartCard>

        <ChartCard title="Showed by Webinar" subtitle="Number of showed calls per webinar ID">
          {showedByWebinar.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={showedByWebinar} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {showedByWebinar.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[#2E2D32]/40">
              No showed calls in selected range
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
