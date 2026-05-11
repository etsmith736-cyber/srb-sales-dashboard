import { cn } from '@/lib/utils'
import type { SalesRow } from '../../../shared/types'

const TABLE_COLUMNS = [
  { key: 'appointmentTime', label: 'Appointment' },
  { key: 'salesRep', label: 'Sales Rep' },
  { key: 'leadSource', label: 'Lead Source' },
  { key: 'webinarId', label: 'Webinar ID' },
  { key: 'setter', label: 'Setter' },
  { key: 'showed', label: 'Showed' },
  { key: 'closed', label: 'Status' },
  { key: 'cashCollected', label: 'Cash Collected' },
  { key: 'contractedRevenue', label: 'Contracted Revenue' },
  { key: 'dateOfPurchase', label: 'Date of Purchase' },
] as const

function getRowHighlight(row: SalesRow): string {
  if (row.closed === 'Closed') return 'bg-[#C4F700]/5'
  if (row.showed === 'No-Show') return 'bg-red-50/50'
  if (row.showed === 'Cancelled') return 'bg-orange-50/50'
  return ''
}

interface TableViewProps {
  data: SalesRow[]
  title?: string
}

export function TableView({ data, title = 'Sales Data Table' }: TableViewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#2E2D32]">{title}</h3>
        <p className="text-xs text-[#2E2D32]/40 mt-0.5">
          Showing {data.length} rows
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-left text-xs font-medium text-[#2E2D32]/60 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length} className="py-16 text-center text-muted-foreground">
                  No data matches the current filters.
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const highlight = getRowHighlight(row)
                return (
                  <tr
                    key={row.rowIndex || i}
                    className={cn(
                      'border-b border-border/30 transition-colors hover:bg-muted/20',
                      highlight
                    )}
                  >
                    {TABLE_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2.5 whitespace-nowrap text-[#2E2D32]/80"
                      >
                        {(row as any)[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
