import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function parseCurrency(value: string): number {
  if (!value) return NaN
  const cleaned = value.replace(/[$,\s]/g, '')
  return parseFloat(cleaned)
}

export function formatPercentage(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `${num}%`
}

export function formatDays(value: number): string {
  if (isNaN(value) || value === 0) return '0 days'
  return `${Math.round(value)} days`
}
