// ============================================
// ESTATEFLOW — Reusable UI Components
// ============================================

import { Icon } from '@iconify/react'
import type { EstateConfig } from './types'
import { APT_PHOTO } from './constants'

// ---- Layout Components ----

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full" style={{ animation: 'fadeIn 0.22s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {children}
    </div>
  )
}

export function PageBack({ onClick, light = false }: { onClick: () => void; light?: boolean }) {
  return (
    <button onClick={onClick} className={'active:opacity-60 flex items-center gap-1 ' + (light ? 'text-white' : 'text-black')}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-sm font-semibold">Back</span>
    </button>
  )
}

export function HouseIcon({ stroke = 'white', size = 40 }: { stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 90" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 46 L50 10 L88 46" />
      <path d="M20 46 L20 82 L80 82 L80 46" />
      <path d="M40 82 L40 58 L60 58 L60 82" />
      <rect x="24" y="54" width="12" height="12" />
      <rect x="64" y="54" width="12" height="12" />
    </svg>
  )
}

export function SplitBg({ children, color = '#1B873F', bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <div className="h-1/2" style={{ backgroundColor: color }} />
        <div className="h-1/2" style={{ backgroundImage: 'url(' + (bg || APT_PHOTO) + ')', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </div>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
      <div className="relative z-10 h-full flex flex-col" style={{ animation: 'fade-up 0.4s ease both' }}>
        {children}
      </div>
    </div>
  )
}

// ---- Form Components ----

export function Field({ placeholder, type = 'text', value, onChange, label }: {
  placeholder: string; type?: string; value: string; onChange: (v: string) => void; label?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none focus:border-green-600 transition-all shadow-sm"
      />
    </div>
  )
}

export function ThemedBtn({ children, onClick, color, className = '', disabled = false }: {
  children: React.ReactNode; onClick: () => void; color: string; className?: string; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={'w-full py-4 px-5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] ' + (disabled ? 'opacity-50 cursor-not-allowed' : '') + ' ' + className}
      style={{ backgroundColor: disabled ? '#d1d5db' : color }}
    >
      {children}
    </button>
  )
}

export function WhiteBtn({ children, onClick, className = '' }: {
  children: React.ReactNode; onClick: () => void; className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={'w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-base flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98] ' + className}
    >
      {children}
    </button>
  )
}

// ---- Payment Breakdown Display ----

export function PaymentBreakdown({ baseAmount, serviceFeePercent = 10, color = '#1B873F', compact = false }: {
  baseAmount: number; serviceFeePercent?: number; color?: string; compact?: boolean
}) {
  const serviceFee = Math.round(baseAmount * (serviceFeePercent / 100))
  const total = baseAmount + serviceFee

  if (compact) {
    return (
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Estate Dues</span>
        <span className="font-bold">₦{baseAmount.toLocaleString()}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-4">Payment Breakdown</p>
      <div className="flex justify-between mb-3">
        <span className="font-semibold text-gray-700">Estate Dues</span>
        <span className="font-black text-lg">₦{baseAmount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between mb-3">
        <span className="font-semibold text-gray-700">EstateFlow Service Fee ({serviceFeePercent}%)</span>
        <span className="font-bold text-green-600">₦{serviceFee.toLocaleString()}</span>
      </div>
      <div className="border-t border-gray-100 my-3" />
      <div className="flex justify-between">
        <span className="font-black text-lg">Total to Pay</span>
        <span className="font-black text-2xl" style={{ color }}>₦{total.toLocaleString()}</span>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Estate receives</span>
          <span className="font-bold">₦{baseAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>EstateFlow platform fee</span>
          <span className="font-bold text-green-600">₦{serviceFee.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ---- Status Badge ----

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'verified': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
    'open': 'bg-yellow-100 text-yellow-700',
    'assigned': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'awaiting-tenant': 'bg-purple-100 text-purple-700',
    'resolved': 'bg-green-100 text-green-700',
    'closed': 'bg-gray-100 text-gray-700',
    'active': 'bg-red-100 text-red-700',
    'responded': 'bg-blue-100 text-blue-700',
  }

  const labels: Record<string, string> = {
    'pending': '⏳ Pending',
    'verified': '✓ Verified',
    'rejected': '✗ Rejected',
    'open': 'Open',
    'assigned': 'Assigned',
    'in-progress': 'In Progress',
    'awaiting-tenant': 'Awaiting Tenant',
    'resolved': '✓ Resolved',
    'closed': 'Closed',
    'active': '🔴 Active',
    'responded': '✓ Responded',
  }

  return (
    <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + (styles[status] || 'bg-gray-100 text-gray-700')}>
      {labels[status] || status}
    </span>
  )
}

// ---- Empty State ----

export function EmptyState({ icon = 'mdi:inbox', title, message, actionLabel, onAction, color = '#1B873F' }: {
  icon?: string; title: string; message?: string; actionLabel?: string; onAction?: () => void; color?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: color + '15' }}>
        <Icon icon={icon} width="40" height="40" style={{ color: '#d1d5db' }} />
      </div>
      <p className="font-bold text-gray-700 text-center mb-1">{title}</p>
      {message && <p className="text-gray-400 text-sm text-center mb-4">{message}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl font-bold text-white text-sm active:scale-[0.98] transition-transform"
          style={{ backgroundColor: color }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ---- Loading Skeleton ----

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={'bg-gray-200 rounded-xl animate-pulse ' + className} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f9fafb' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100">
        <Skeleton className="w-8 h-4" />
        <Skeleton className="w-32 h-6 mx-auto" />
        <Skeleton className="w-6 h-6" />
      </div>
      <div className="flex-1 px-5 py-5 flex flex-col gap-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    </div>
  )
}

// ---- 3D House Overlay (available to ALL estates) ----

export function House3DOverlay({ config }: { config: EstateConfig }) {
  if (!config.enable3D) return null

  const opacity = config.threeDOpacity || 0.2
  const color = config.isGoldBlackTheme ? '#d4af37' : config.color
  const useLogo = config.useEstateLogoFor3D && config.logoUrl
  const scale = config.threeDScale || 1
  const speed = config.threeDSpeed || 20

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 flex justify-center" style={{ height: '45%' }}>
      <div style={{ perspective: '600px', width: `${180 * scale}px`, height: `${180 * scale}px`, animation: 'rise-up 2s ease-out forwards' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', animation: `rotate3d ${speed}s linear infinite`, opacity }}>
          {/* Front face */}
          <div style={{
            position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px',
            background: 'linear-gradient(135deg, ' + color + ', ' + color + '99)',
            border: '2px solid ' + color, borderRadius: '12px',
            transform: 'translateZ(80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {useLogo ? (
              <img src={config.logoUrl} alt="estate" className="w-full h-full object-cover" style={{ borderRadius: '10px' }} />
            ) : (
              <svg width="100" height="90" viewBox="0 0 100 90" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 46 L50 10 L88 46" />
                <path d="M20 46 L20 82 L80 82 L80 46" />
                <path d="M40 82 L40 58 L60 58 L60 82" />
              </svg>
            )}
          </div>
          {/* Back face */}
          <div style={{
            position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px',
            background: color + '88', border: '2px solid ' + color, borderRadius: '12px',
            transform: 'rotateY(180deg) translateZ(80px)'
          }} />
          {/* Left face */}
          <div style={{
            position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px',
            background: color + '66', border: '2px solid ' + color, borderRadius: '12px',
            transform: 'rotateY(-90deg) translateZ(80px)'
          }} />
          {/* Right face */}
          <div style={{
            position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px',
            background: color + '66', border: '2px solid ' + color, borderRadius: '12px',
            transform: 'rotateY(90deg) translateZ(80px)'
          }} />
        </div>
      </div>
    </div>
  )
}

// ---- Success Animation ----

export function SuccessAnimation({ message, subtext, color = '#1B873F' }: {
  message: string; subtext?: string; color?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full bg-green-200/60" style={{ animation: 'pulse-ring 1.4s ease-out infinite' }} />
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: color }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-gray-900 mb-2">{message}</h3>
        {subtext && <p className="text-gray-500 text-sm">{subtext}</p>}
      </div>
    </div>
  )
}
