import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, getTRPCClient } from '@/lib/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useSheetData } from '@/hooks/useSheetData'
import { useTriageData, useTriageFilters } from '@/hooks/useTriageData'
import { useSalesFilters } from '@/hooks/useSalesFilters'
import { LoginPage } from '@/pages/LoginPage'
import { SalesDashboard } from '@/pages/SalesDashboard'
import { TriageDashboard } from '@/pages/TriageDashboard'
import { TableView } from '@/pages/TableView'
import { UsersPage } from '@/pages/UsersPage'
import {
  LayoutDashboard, Table as TableIcon, PhoneCall, Users, LogOut, RefreshCw, ChevronLeft,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const NAV_ITEMS = [
  { label: 'Sales Calls', items: [
    { id: 'sales-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales-table', label: 'Table', icon: TableIcon },
  ]},
  { label: 'Triage Calls', items: [
    { id: 'triage-dashboard', label: 'Dashboard', icon: PhoneCall },
    { id: 'triage-table', label: 'Table', icon: TableIcon },
  ]},
]

function DashboardApp() {
  const { isAuthenticated, isAdmin, session, login, logout, isLoggingIn } = useAuth()
  const [activeView, setActiveView] = useState('sales-dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { data: salesData, loading: salesLoading, error: salesError, lastFetched, refresh: refreshSales } = useSheetData()
  const { data: triageData, loading: triageLoading, error: triageError, refresh: refreshTriage } = useTriageData()

  const { filters, filteredData, revenueFilteredData, salesReps, webinarIds, stages, updateFilter, resetFilters } = useSalesFilters(salesData)
  const { filteredData: triageFiltered, filters: triageFilters, setFilters: setTriageFilters, setters, leadSources, webinarIds: triageWebinarIds } = useTriageFilters(triageData)

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} isLoading={isLoggingIn} />
  }

  const handleRefresh = () => {
    refreshSales()
    refreshTriage()
  }

  return (
    <div className="flex h-screen bg-[#FBF6EA]">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-100 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-sm font-bold tracking-wider text-[#2E2D32]">SOFIA ROSE</h1>
              <p className="text-[10px] tracking-[0.2em] text-[#2E2D32]/50">BERNARDI</p>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-[#2E2D32]/40 hover:text-[#2E2D32] transition-colors">
            <ChevronLeft size={16} className={sidebarCollapsed ? 'rotate-180' : ''} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          {NAV_ITEMS.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && <p className="px-3 py-1 text-[10px] font-semibold text-[#2E2D32]/40 uppercase tracking-wider">{group.label}</p>}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeView === item.id ? 'bg-[#C4F700]/20 text-[#2E2D32] font-medium' : 'text-[#2E2D32]/60 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={16} />
                  {!sidebarCollapsed && item.label}
                </button>
              ))}
            </div>
          ))}
          <div>
            {!sidebarCollapsed && <p className="px-3 py-1 text-[10px] font-semibold text-[#2E2D32]/40 uppercase tracking-wider">Settings</p>}
            <button
              onClick={() => setActiveView('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeView === 'users' ? 'bg-[#C4F700]/20 text-[#2E2D32] font-medium' : 'text-[#2E2D32]/60 hover:bg-gray-50'
              }`}
            >
              <Users size={16} />
              {!sidebarCollapsed && 'Users'}
            </button>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#2E2D32]/60 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors">
            <LogOut size={16} />
            {!sidebarCollapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#FBF6EA]/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2D32]">
              {activeView === 'sales-dashboard' && 'Sales Dashboard'}
              {activeView === 'sales-table' && 'Sales Data Table'}
              {activeView === 'triage-dashboard' && 'Triage Dashboard'}
              {activeView === 'triage-table' && 'Triage Data Table'}
              {activeView === 'users' && 'User Management'}
            </h2>
            {lastFetched && (
              <p className="text-xs text-[#2E2D32]/40">Updated {formatDistanceToNow(lastFetched, { addSuffix: true })}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Filters for sales views */}
            {(activeView === 'sales-dashboard' || activeView === 'sales-table') && (
              <div className="flex items-center gap-2 flex-wrap">
                <select value={filters.salesRep} onChange={(e) => updateFilter('salesRep', e.target.value)} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
                  <option value="all">All Closers</option>
                  {salesReps.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={filters.leadSource} onChange={(e) => updateFilter('leadSource', e.target.value)} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
                  <option value="all">All Lead Sources</option>
                  {(Array.from(new Set(salesData.map(r => r.leadSource).filter(Boolean))).sort()).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={filters.webinarId} onChange={(e) => updateFilter('webinarId', e.target.value)} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
                  <option value="all">All Webinars</option>
                  {webinarIds.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input type="date" value={filters.dateRange.from?.toISOString().split('T')[0] || ''} onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value ? new Date(e.target.value) : undefined })} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white" />
                <input type="date" value={filters.dateRange.to?.toISOString().split('T')[0] || ''} onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value ? new Date(e.target.value) : undefined })} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white" />
                {(filters.salesRep !== 'all' || filters.leadSource !== 'all' || filters.webinarId !== 'all' || filters.dateRange.from || filters.dateRange.to) && (
                  <button onClick={resetFilters} className="px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg">Reset</button>
                )}
              </div>
            )}
            <button onClick={handleRefresh} disabled={salesLoading || triageLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2E2D32] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <RefreshCw size={12} className={salesLoading || triageLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {salesError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{salesError}</div>}
          {triageError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{triageError}</div>}

          {salesLoading && activeView.startsWith('sales') ? (
            <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4F700]"></div></div>
          ) : (
            <>
              {activeView === 'sales-dashboard' && <SalesDashboard data={filteredData} revenueData={revenueFilteredData} />}
              {activeView === 'sales-table' && <TableView data={filteredData} title="Sales Data Table" />}
              {activeView === 'triage-dashboard' && <TriageDashboard data={triageFiltered} />}
              {activeView === 'triage-table' && <TableView data={triageFiltered as any} title="Triage Data Table" />}
              {activeView === 'users' && <UsersPage currentUserEmail={session?.email || ''} isAdmin={isAdmin} />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// Wrap with providers
const queryClient = new QueryClient()
const trpcClient = getTRPCClient()

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <DashboardApp />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
