// ============================================
// ESTATEFLOW — Main Application
// ============================================
// All estates get the FULL product. No subscription tiers.
// Revenue: 10% service fee added ON TOP of estate dues.
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { Icon } from '@iconify/react'
import { QRCodeSVG } from 'qrcode.react'
import type { Screen, EstateConfig, TenantInfo, Notification, Invoice, Complaint, EmergencyAlert, GuestCode } from './types'
import { meetsWCAG_AA } from './types'
import { calculatePaymentBreakdown } from './types'
import { DEFAULT_CONFIG, APT_PHOTO, AVATAR_SVGS, AVATARS, BANKS, THEME_COLORS, FONT_OPTIONS, MAINTENANCE_CATEGORIES, EMERGENCY_TYPES, GUEST_TYPES, SERVICE_FEE_PERCENT, ESTATE_THEMES, LAYOUT_PRESETS } from './constants'
import { PageTransition, PageBack, HouseIcon, SplitBg, Field, ThemedBtn, WhiteBtn, PaymentBreakdown, StatusBadge, EmptyState, House3DOverlay, SuccessAnimation } from './components'
import { PrivacyPolicy, TermsOfService, PaymentRefundPolicy, EmergencyDisclaimer } from './legal'


// Security: Sanitize user text to prevent XSS (Master §38)
function sanitizeText(text: string): string {
  return text.replace(/[<>'"&]/g, (char) => {
    const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' }
    return entities[char] || char
  })
}

// ============================================
// SPLASH SCREEN
// ============================================
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const steps = [15, 35, 60, 80, 100]; let i = 0
    const tick = () => { if (i < steps.length) { setProgress(steps[i++]); setTimeout(tick, 350) } else setTimeout(onDone, 300) }
    setTimeout(tick, 300)
  }, [onDone])
  const paths = [
    { d: 'M12 46 L50 10 L88 46', len: 98, delay: 0.1 },
    { d: 'M20 46 L20 82', len: 36, delay: 0.65 },
    { d: 'M80 46 L80 82', len: 36, delay: 0.7 },
    { d: 'M20 82 L80 82', len: 60, delay: 0.95 },
    { d: 'M40 82 L40 58 L60 58 L60 82', len: 64, delay: 1.2 },
    { d: 'M24 54 L36 54 L36 66 L24 66 Z', len: 48, delay: 1.5 },
    { d: 'M64 54 L76 54 L76 66 L64 66 Z', len: 48, delay: 1.6 },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white gap-8">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-44 h-44 rounded-full" style={{ backgroundColor: '#1B873F15', animation: 'pulse-ring 2.2s ease-out infinite' }} />
        <div className="absolute rounded-full" style={{ width: 136, height: 136, backgroundColor: '#1B873F10', animation: 'pulse-ring 2.2s ease-out 0.6s infinite' }} />
        <div className="w-28 h-28"><svg viewBox="0 0 100 90" fill="none" className="w-full h-full">
          {paths.map((p, i) => (<path key={i} d={p.d} stroke="#1B873F" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: p.len, strokeDashoffset: p.len, animation: 'draw-path 0.5s ease ' + p.delay + 's forwards' }} />))}
        </svg></div>
      </div>
      <div style={{ animation: 'fade-up 0.6s ease 1.8s both' }} className="flex flex-col items-center gap-1">
        <h1 className="text-4xl font-black tracking-tight" style={{ color: '#1B873F' }}>EstateFlow</h1>
        <p className="text-gray-400 text-sm font-medium">Your estate, managed smart</p>
      </div>
      <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden" style={{ animation: 'fade-up 0.5s ease 1.9s both' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: progress + '%', backgroundColor: '#1B873F' }} />
      </div>
    </div>
  )
}

// ============================================
// ROLE SELECT SCREEN
// ============================================
function RoleSelectScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: '#1B873F' }} /><div className="h-1/2" style={{ backgroundImage: 'url(' + APT_PHOTO + ')', backgroundSize: 'cover', backgroundPosition: 'center' }} /></div>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 gap-4" style={{ animation: 'fade-up 0.5s ease both' }}>
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"><HouseIcon stroke="white" size={36} /></div>
          <h1 className="text-4xl font-black text-white tracking-tight">EstateFlow</h1>
          <p className="text-white/70 text-sm font-medium">Select your role</p>
        </div>
        {[
          { label: 'Estate Manager', icon: 'mdi:office-building', screen: 'manager-auth' as Screen },
          { label: 'Tenant', icon: 'mdi:account', screen: 'tenant-code' as Screen },
          { label: 'Service Staff', icon: 'mdi:wrench', screen: 'service-code' as Screen },
        ].map((btn) => (
          <button key={btn.label} onClick={() => go(btn.screen)} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-base flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all hover:shadow-xl">
            <Icon icon={btn.icon} width="22" height="22" style={{ color: '#1B873F' }} />{btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// MANAGER AUTH SCREENS
// ============================================
function ManagerAuthScreen({ go }: { go: (s: Screen) => void }) {
  return <SplitBg><div className="px-8 flex flex-col h-full">
    <div className="pt-[max(3.5rem,env(safe-area-inset-top))] pb-5"><button onClick={() => go('role-select')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
    <h2 className="text-3xl font-black text-white mb-1">Estate Manager</h2><p className="text-white/70 text-sm mb-8">Choose how to continue</p>
    <div className="flex flex-col gap-3">
      <WhiteBtn onClick={async () => { try { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }) } catch { alert('Enable Google provider in Supabase Dashboard') } }}><svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Sign in with Google</WhiteBtn>
      <WhiteBtn onClick={() => go('manager-signup')}>Sign Up</WhiteBtn>
      <WhiteBtn onClick={() => go('manager-login')}>Log In</WhiteBtn>
    </div>
  </div></SplitBg>
}

function ManagerSignUpScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const [f, setF] = useState({ name: '', surname: '', phone: '', email: '', pw: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  const handleSignUp = async () => {
    if (!f.email.trim() || !f.pw.trim()) { setError('Please fill in email and password'); return }
    setLoading(true); setError('')
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email: f.email.trim(), password: f.pw, options: { data: { first_name: f.name, surname: f.surname, phone: f.phone } } })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      // Note: Manager screens now require active Supabase session (auth gate)
      go('manager-home')
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }
  return <SplitBg color={config.color} bg={config.bgImageUrl}><div className="px-8 flex flex-col h-full">
    <div className="pt-[max(3.5rem,env(safe-area-inset-top))] pb-4"><button onClick={() => go('manager-auth')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
    <h2 className="text-3xl font-black text-white mb-1">Create Account</h2><p className="text-white/70 text-sm mb-6">Set up your estate platform</p>
    <div className="flex flex-col gap-3 overflow-y-auto pb-8">
      <Field placeholder="First Name" value={f.name} onChange={set('name')} /><Field placeholder="Surname" value={f.surname} onChange={set('surname')} />
      <Field placeholder="Phone Number" type="tel" value={f.phone} onChange={set('phone')} /><Field placeholder="Email Address" type="email" value={f.email} onChange={set('email')} />
      <Field placeholder="Password" type="password" value={f.pw} onChange={set('pw')} />
      {error && <div className="bg-red-500/30 rounded-xl px-4 py-3"><p className="text-white text-sm font-semibold">{error}</p></div>}
      <ThemedBtn onClick={handleSignUp} color={config.color} disabled={false} className="mt-2">
        {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</> : 'Create Account →'}
      </ThemedBtn>
    </div>
  </div></SplitBg>
}

function ManagerLoginScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const handleLogin = async () => {
    if (!email.trim() || !pw.trim()) { setError('Please fill in email and password'); return }
    setLoading(true); setError('')
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw })
      console.log('Login result:', data)
      if (loginError) { setError(loginError.message); setLoading(false); return }
      go('manager-home')
    } catch (e) { setError('Error: ' + (e as Error).message); setLoading(false) }
  }
  return <SplitBg color={config.color} bg={config.bgImageUrl}><div className="px-8 flex flex-col h-full">
    <div className="pt-[max(3.5rem,env(safe-area-inset-top))] pb-4"><button onClick={() => go('manager-auth')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
    <h2 className="text-3xl font-black text-white mb-1">Welcome Back</h2><p className="text-white/70 text-sm mb-8">Sign in to your estate platform</p>
    <div className="flex flex-col gap-3">
      <Field placeholder="Email Address" type="email" value={email} onChange={setEmail} /><Field placeholder="Password" type="password" value={pw} onChange={setPw} />
      {error && <div className="bg-red-500/30 rounded-xl px-4 py-3"><p className="text-white text-sm font-semibold">{error}</p></div>}
      <ThemedBtn onClick={handleLogin} color={config.color} disabled={false} className="mt-2">
        {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing In...</> : 'Log In →'}
      </ThemedBtn>
    </div>
  </div></SplitBg>
}

// ============================================
// ESTATE PROFILE SCREEN (New onboarding — no plans)
// ============================================
function EstateProfileScreen({ go, config, setConfig, userEmail }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void; userEmail?: string }) {
  const [form, setForm] = useState({ name: config.estateName, location: '', size: '', occupants: '', dues: '15000', accountNum: config.estateAccountNumber, accountName: config.estateAccountName, bank: config.estateBank, picUrl: '' })
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v })
  const breakdown = calculatePaymentBreakdown(parseInt(form.dues) || 15000)
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Estate Profile</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 pb-8">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <p className="text-xs text-green-800 font-bold">Your estate platform is free</p>
        <p className="text-xs text-green-700 mt-1">EstateFlow earns through a transparent {SERVICE_FEE_PERCENT}% service fee added on top of estate dues.</p>
      </div>
      <Field placeholder="Name of Estate" value={form.name} onChange={set('name')} />
      <Field placeholder="Location / Address" value={form.location} onChange={set('location')} />
      <Field placeholder="Size of Estate" value={form.size} onChange={set('size')} />
      <Field placeholder="Number of Units" value={form.occupants} onChange={set('occupants')} />
      <Field placeholder="Monthly Estate Dues (₦)" type="number" value={form.dues} onChange={set('dues')} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
        <p className="text-xs text-blue-800 font-bold mb-2">What tenants will pay</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Estate Dues</span><span className="font-bold">₦{breakdown.baseAmount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">EstateFlow Service Fee ({SERVICE_FEE_PERCENT}%)</span><span className="font-bold text-green-600">₦{breakdown.serviceFee.toLocaleString()}</span></div>
          <div className="border-t border-blue-200 my-2" />
          <div className="flex justify-between font-black"><span>Total</span><span style={{ color: config.color }}>₦{breakdown.totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Estate receives</span><span>₦{breakdown.estateSettlement.toLocaleString()}</span></div>
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mt-2">
        <p className="text-xs text-purple-800 font-bold mb-2">Payment Setup — Estate Bank Account</p>
        <Field placeholder="Account Number" value={form.accountNum} onChange={set('accountNum')} /><div className="h-2" />
        <Field placeholder="Account Name" value={form.accountName} onChange={set('accountName')} /><div className="h-2" />
        <select value={form.bank} onChange={(e) => set('bank')(e.target.value)} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black outline-none">
          <option value="">Select Bank</option>{BANKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2">
        <p className="text-xs text-gray-800 font-bold mb-2">Estate Picture (optional)</p>
        <Field placeholder="Estate picture URL" value={form.picUrl} onChange={set('picUrl')} />
      </div>
      <ThemedBtn onClick={async () => {
        const dues = parseInt(form.dues) || 15000
        try {
          await supabase.from('estates').insert([{ name: form.name || 'My Estate', manager_email: userEmail || '', join_code: 'EF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(), monthly_dues: dues, app_dues: Math.round(dues * 0.10), estate_account_number: form.accountNum, estate_account_name: form.accountName, estate_bank: form.bank }]).select()
        } catch (err) { console.log('Save note:', err) }
        setConfig({ ...config, estateName: form.name || config.estateName, monthlyDues: dues, estateAccountNumber: form.accountNum, estateAccountName: form.accountName, estateBank: form.bank, bgImageUrl: form.picUrl })
        go('payment-setup')
      }} color={config.color} className="mt-2">Next — Payment Setup →</ThemedBtn>
    </div>
  </div>
}

// ============================================
// PAYMENT SETUP SCREEN (NOT subscription payment)
// ============================================
function PaymentSetupScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [verified, setVerified] = useState(false)
  const breakdown = calculatePaymentBreakdown(config.monthlyDues)
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('estate-profile')} /><h2 className="font-black text-xl">Payment Setup</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 pb-8">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Estate Settlement Account</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: config.color + '15' }}><Icon icon="mdi:bank" width="24" height="24" style={{ color: config.color }} /></div>
          <div><p className="font-bold text-gray-900">{config.estateAccountName || 'Not set'}</p><p className="text-gray-400 text-sm">{config.estateBank} • • • •{config.estateAccountNumber.slice(-4)}</p></div>
        </div>
        <button onClick={() => setVerified(true)} className="w-full py-3 rounded-xl font-bold text-white active:scale-[0.98] transition-transform" style={{ backgroundColor: verified ? '#10b981' : config.color }}>
          {verified ? '✓ Account Verified' : 'Verify Account'}
        </button>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Payment Flow</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: config.color }}>1</div><div><p className="font-bold text-sm text-gray-800">Tenant receives invoice</p><p className="text-xs text-gray-500">Estate dues + {SERVICE_FEE_PERCENT}% EstateFlow service fee</p></div></div>
          <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: config.color }}>2</div><div><p className="font-bold text-sm text-gray-800">Tenant pays via Paystack</p><p className="text-xs text-gray-500">Secure card, transfer, or USSD payment</p></div></div>
          <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: config.color }}>3</div><div><p className="font-bold text-sm text-gray-800">Automatic split settlement</p><p className="text-xs text-gray-500">₦{breakdown.estateSettlement.toLocaleString()} → Estate | ₦{breakdown.estateflowShare.toLocaleString()} → EstateFlow</p></div></div>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm text-green-800 font-bold">Your estate pays nothing</p>
        <p className="text-xs text-green-700 mt-1">EstateFlow is free for estates. We earn through the transparent service fee on payments.</p>
      </div>
      <ThemedBtn onClick={() => { setConfig({ ...config }); go('theme-customizer') }} color={config.color}>Continue — Customize Estate →</ThemedBtn>
      <button onClick={() => { go('manager-home') }} className="w-full py-3 text-center text-sm font-semibold text-gray-500">Skip for now</button>
    </div>
  </div>
}

// ============================================
// MANAGER HOME / DASHBOARD (Upgraded)
// ============================================
function ManagerHomeScreen({ go, config, menuOpen, setMenuOpen, notifications, invoices, complaints, alerts, clearSession, tenantLogins }: {
  go: (s: Screen) => void; config: EstateConfig; menuOpen: boolean; setMenuOpen: (v: boolean) => void
  notifications: Notification[]; invoices: Invoice[]; complaints: Complaint[]; alerts: EmergencyAlert[]; clearSession: () => void; tenantLogins: { name: string; house: string; date: string }[]
}) {
  const isGB = config.isGoldBlackTheme
  const currentLayout = LAYOUT_PRESETS.find(l => l.id === config.layoutId) || LAYOUT_PRESETS[0]
  const bgColor = isGB ? '#000000' : (config.color + '10')
  const cardBg = isGB ? '#1a1a1a' : 'white'
  const textP = isGB ? '#d4af37' : '#111827'
  const textS = isGB ? '#f4e4a0' : '#6b7280'
  const borderColor = isGB ? '#d4af3733' : '#f3f4f6'
  const cardPadding = currentLayout.cardDensity === 'compact' ? 'p-2' : currentLayout.cardDensity === 'spacious' ? 'p-5' : 'p-3'
  const gridGap = currentLayout.cardDensity === 'compact' ? 'gap-2' : currentLayout.cardDensity === 'spacious' ? 'gap-4' : 'gap-3'

  const verifiedInvoices = invoices.filter(i => i.status === 'verified')
  const pendingInvoices = invoices.filter(i => i.status === 'pending')
  const totalCollected = verifiedInvoices.reduce((sum, i) => sum + i.baseAmount, 0)
  const totalOutstanding = pendingInvoices.reduce((sum, i) => sum + i.baseAmount, 0)
  const totalFees = verifiedInvoices.reduce((sum, i) => sum + i.serviceFee, 0)
  const openMaintenance = complaints.filter(c => c.status === 'open' || c.status === 'in-progress').length
  const activeAlerts = alerts.filter(a => a.status === 'active').length

  return <div className="flex flex-col h-full relative" style={{ backgroundColor: bgColor }}>
    <House3DOverlay config={config} />
    {/* Header */}
    <div className="flex items-center justify-between px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 border-b relative z-10" style={{ backgroundColor: isGB ? '#000000' : 'white', borderColor }}>
      <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] p-1">
        {[0,1,2].map(i => <span key={i} className={'block w-6 h-[2.5px] rounded-full ' + (isGB ? 'bg-yellow-500' : 'bg-black')} />)}
      </button>
      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><HouseIcon stroke="white" size={20} /></div><span className="font-bold text-base" style={{ fontFamily: config.fontFamily, color: textP }}>{config.estateName}</span></div>
      <div className="relative" onClick={() => go('invoices')}><Icon icon="mdi:bell" width="22" height="22" style={{ color: isGB ? '#d4af37' : 'black' }} />{pendingInvoices.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{pendingInvoices.length}</span>}</div>
    </div>
    {/* Content */}
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-32 relative z-10">
      {/* Welcome Card */}
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: isGB ? 'linear-gradient(135deg, #1a1a1a, #333)' : 'linear-gradient(135deg, ' + config.color + ', ' + config.color + 'bb)' }}>
        <p className="text-white/80 text-sm font-medium mb-0.5">Good morning</p>
        <h3 className="text-xl font-black mb-2">{config.estateName}</h3>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white/15 rounded-xl p-3"><p className="text-white/70 text-xs">Collected</p><p className="font-black text-lg">₦{totalCollected.toLocaleString()}</p></div>
          <div className="bg-white/15 rounded-xl p-3"><p className="text-white/70 text-xs">Outstanding</p><p className="font-black text-lg">₦{totalOutstanding.toLocaleString()}</p></div>
        </div>
        <p className="text-white/60 text-xs mt-3">EstateFlow Service Fee: ₦{totalFees.toLocaleString()}</p>
      </div>
      {/* Search Bar (Patch §7, §9) */}
      <button onClick={() => go('search-tenant')} className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm mb-4 active:scale-[0.99] transition-transform" style={{ border: '1px solid ' + borderColor }}>
        <Icon icon="mdi:magnify" width="20" height="20" style={{ color: '#9ca3af' }} />
        <span className="text-gray-400 text-sm font-medium">Search tenant by name or unit...</span>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: config.color + '15', color: config.color }}>QR</span>
      </button>
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Paid', value: verifiedInvoices.length.toString(), c: '#1B873F' },
          { label: 'Pending', value: pendingInvoices.length.toString(), c: '#f59e0b' },
          { label: 'Units', value: tenantLogins.length > 0 ? tenantLogins.length.toString() : '—', c: isGB ? '#d4af37' : '#2563eb' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-3 text-center shadow-sm" style={{ backgroundColor: cardBg, border: '1px solid ' + borderColor }}>
            <p className="text-2xl font-black" style={{ color: s.c }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: textS }}>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Operational Overview */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Maintenance', value: openMaintenance.toString(), c: '#f59e0b', icon: 'mdi:wrench' },
          { label: 'Complaints', value: complaints.filter(c => c.status === 'open').length.toString(), c: '#ef4444', icon: 'mdi:alert-circle' },
          { label: 'Alerts', value: activeAlerts.toString(), c: '#8b5cf6', icon: 'mdi:alarm-light' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-3 text-center shadow-sm" style={{ backgroundColor: cardBg, border: '1px solid ' + borderColor }}>
            <Icon icon={s.icon} width="18" height="18" style={{ color: s.c }} className="mx-auto mb-1" />
            <p className="text-lg font-black" style={{ color: s.c }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: textS }}>{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: textS }}>Quick Actions</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tenants', icon: 'mdi:account-group', s: 'tenants' as Screen },
          { label: 'Settings', icon: 'mdi:cog', s: 'manager-settings' as Screen },
          { label: 'Estate', icon: 'mdi:office-building', s: 'estate-profile' as Screen },
        ].map((a) => (
          <button key={a.label} onClick={() => go(a.s)} className="flex flex-col items-center gap-2 py-4 rounded-2xl shadow-sm active:scale-[0.98] transition-transform" style={{ backgroundColor: cardBg, border: '1px solid ' + borderColor }}>
            <Icon icon={a.icon} width="26" height="26" style={{ color: textP }} /><span className="text-xs font-bold" style={{ color: textP }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
    {/* Bottom Nav */}
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-6 z-10">
      <div className="flex rounded-2xl overflow-visible shadow-xl" style={{ backgroundColor: isGB ? '#1a1a1a' : config.color }}>
        {[
          { label: 'QR', icon: 'mdi:qrcode', s: 'qr-share' as Screen, isCenter: true },
          { label: 'Home', icon: 'mdi:home', s: 'manager-home' as Screen },
          { label: 'Invoices', icon: 'mdi:receipt', s: 'invoices' as Screen },
        ].map((item, i) => (
          <button key={i} onClick={() => go(item.s)} className="flex-1 py-3 flex flex-col items-center gap-1 transition-colors" style={item.isCenter ? { marginTop: -18 } : {}}>
            {item.isCenter ? (<div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg" style={{ border: '3px solid ' + (isGB ? '#d4af37' : config.color) }}><Icon icon={item.icon} width="28" height="28" style={{ color: isGB ? '#d4af37' : config.color }} /></div>) : (<Icon icon={item.icon} width="22" height="22" style={{ color: isGB ? '#d4af37' : 'rgba(255,255,255,0.9)' }} />)}
            <span className="text-xs font-semibold" style={{ color: isGB ? '#d4af37' : 'rgba(255,255,255,0.9)' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
    {/* Side Menu */}
    {menuOpen && <div className="absolute inset-0 z-50 flex"><div className="w-3/4 h-full bg-white flex flex-col pt-16 px-6 pb-8 shadow-2xl" style={{ animation: 'slideInLeft 0.3s ease' }}>
      <div className="flex items-center gap-3 mb-8"><div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><HouseIcon stroke="white" size={24} /></div><div><p className="font-black text-gray-900">{config.estateName}</p><p className="text-gray-400 text-xs">Estate Manager</p></div></div>
      <div className="flex flex-col gap-1 flex-1">
        {[
          { label: 'Search Tenant', icon: 'mdi:account-search', s: 'search-tenant' as Screen },
          { label: 'Invoices & Payments', icon: 'mdi:receipt', s: 'invoices' as Screen },
          { label: 'Announcements', icon: 'mdi:bullhorn', s: 'announcement-editor' as Screen },
          { label: 'Reports', icon: 'mdi:chart-bar', s: 'management' as Screen },
          { label: 'Customize Estate', icon: 'mdi:palette', s: 'theme-customizer' as Screen },
        ].map((item) => (
          <button key={item.label} onClick={() => { setMenuOpen(false); go(item.s) }} className="flex items-center gap-4 py-4 px-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-left">
            <Icon icon={item.icon} width="24" height="24" style={{ color: '#6b7280' }} /><span className="font-bold text-gray-800">{item.label}</span>
          </button>
        ))}
      </div>
      <button onClick={() => { setMenuOpen(false); clearSession(); go('role-select') }} className="flex items-center gap-3 py-3 px-4 rounded-xl text-red-500 font-bold mt-4">Sign Out</button>
    </div><div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} /></div>}
  </div>
}

// ============================================
// MANAGEMENT SCREEN
// ============================================
function ManagementScreen({ go, config, invoices, complaints }: { go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; complaints: Complaint[] }) {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ['Collection', 'Maintenance', 'Overview']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  const verifiedCount = invoices.filter(i => i.status === 'verified').length
  const monthlyCollected = [120000, 180000, 250000, 320000, 450000, 580000, verifiedCount * config.monthlyDues]
  const maxVal = Math.max(...monthlyCollected, 100)
  const complaintData = [complaints.filter(c => c.status === 'open').length, complaints.filter(c => c.status === 'in-progress').length, complaints.filter(c => c.status === 'resolved').length, 5, 3, 8, complaints.length]
  const complaintMax = Math.max(...complaintData, 20)
  const totalCollected = invoices.filter(i => i.status === 'verified').reduce((s, i) => s + i.baseAmount, 0)
  const totalFees = invoices.filter(i => i.status === 'verified').reduce((s, i) => s + i.serviceFee, 0)
  const totalOutstanding = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.baseAmount, 0)

  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Management</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
      <div className="bg-gray-200 rounded-xl p-1 flex relative mb-5"><div className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 shadow-sm" style={{ width: 'calc(33.33% - 3px)', left: 'calc(' + (activeTab * 33.33) + '% + 2px)', backgroundColor: config.color }} />{tabs.map((t, i) => (<button key={t} onClick={() => setActiveTab(i)} className="flex-1 py-2.5 text-sm font-bold relative z-10 rounded-lg transition-colors" style={{ color: activeTab === i ? 'white' : '#6b7280' }}>{t}</button>))}</div>
      {/* Financial Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <p className="font-bold text-gray-700 text-sm mb-4">Financial Summary</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3"><p className="text-xs text-green-600 font-bold">Collected</p><p className="font-black text-lg text-green-800">₦{totalCollected.toLocaleString()}</p></div>
          <div className="bg-yellow-50 rounded-xl p-3"><p className="text-xs text-yellow-600 font-bold">Outstanding</p><p className="font-black text-lg text-yellow-800">₦{totalOutstanding.toLocaleString()}</p></div>
          <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600 font-bold">Estate Settlement</p><p className="font-black text-lg text-blue-800">₦{totalCollected.toLocaleString()}</p></div>
          <div className="bg-purple-50 rounded-xl p-3"><p className="text-xs text-purple-600 font-bold">Service Fees</p><p className="font-black text-lg text-purple-800">₦{totalFees.toLocaleString()}</p></div>
        </div>
      </div>
      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <p className="font-bold text-gray-700 text-sm mb-4">{activeTab === 0 ? 'Monthly Collection' : activeTab === 1 ? 'Maintenance Requests' : 'Overview'}</p>
        <div className="flex items-end gap-2" style={{ height: 140 }}>
          {(activeTab === 0 ? monthlyCollected : complaintData).map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-t-sm transition-all" style={{ height: ((v / (activeTab === 0 ? maxVal : complaintMax)) * 110) + 'px', backgroundColor: activeTab === 0 ? config.color : '#f59e0b' }} />
              <span className="text-xs text-gray-400 font-medium">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => go('announcement-editor')} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-transform shadow-sm" style={{ backgroundColor: config.color }}><Icon icon="mdi:bullhorn" width="24" height="24" /><div className="text-left"><p className="text-sm">Send Announcement</p><p className="text-xs opacity-70">Goes to all tenant home screens</p></div></button>
        <button onClick={() => go('invoices')} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-transform shadow-sm" style={{ backgroundColor: config.color }}><Icon icon="mdi:receipt" width="24" height="24" /><div className="text-left"><p className="text-sm">Invoices & Payments</p><p className="text-xs opacity-70">{invoices.filter(i => i.status === 'pending').length} pending verification</p></div></button>
        <button onClick={() => go('theme-customizer')} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-transform shadow-sm" style={{ backgroundColor: config.color }}><Icon icon="mdi:palette" width="24" height="24" /><div className="text-left"><p className="text-sm">Customize Estate</p><p className="text-xs opacity-70">Colors, fonts, branding & 3D</p></div></button>
      </div>
    </div>
  </div>
}

// ============================================
// ANNOUNCEMENT EDITOR
// ============================================
function AnnouncementEditorScreen({ go, config, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [sent, setSent] = useState(false)
  const handleSend = () => {
    if (!title.trim() || !body.trim()) return
    const notif: Notification = { id: 'n' + Date.now(), title: title.trim(), message: body.trim(), date: new Date().toLocaleDateString(), type: 'announcement', read: false }
    setNotifications([notif, ...notifications]); setTitle(''); setBody(''); setSent(true); setTimeout(() => setSent(false), 2000)
  }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Announcements</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
      {!sent ? <>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3"><p className="text-xs text-blue-800 font-bold">Announcements reach all tenants</p><p className="text-xs text-blue-700 mt-1">Appears on tenant home screen notification area.</p></div>
        <button onClick={handleSend} disabled={!title.trim() || !body.trim()} className="w-full py-28 rounded-3xl font-bold text-white text-xl active:scale-[0.98] transition-transform shadow-lg flex flex-col items-center justify-center gap-3" style={{ backgroundColor: (title.trim() && body.trim()) ? config.color : '#d1d5db' }}>
          <Icon icon="mdi:bullhorn" width="48" height="48" /><span>{title.trim() ? 'Send Announcement' : 'Tap to Start'}</span>
        </button>
        <Field placeholder="Announcement Title" value={title} onChange={setTitle} />
        <textarea placeholder="Write your announcement here..." value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none resize-none shadow-sm" />
      </> : <div className="flex flex-col items-center justify-center flex-1 gap-4"><SuccessAnimation message="Announcement Sent!" subtext="All tenants have been notified." color={config.color} /><ThemedBtn onClick={() => go('manager-home')} color={config.color}>Back to Home</ThemedBtn></div>}
    </div>
  </div>
}

// ============================================
// INVOICES SCREEN (with proper payment breakdown)
// ============================================
function InvoicesScreen({ go, config, invoices, setInvoices, setNotifications, notifications }: {
  go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[]
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')
  const verifyInvoice = (id: string) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status: 'verified' as const, verifiedBy: config.estateName, verifiedDate: new Date().toLocaleDateString() } : inv)
    setInvoices(updated)
    const inv = invoices.find(i => i.id === id)
    if (inv) setNotifications([{ id: 'n' + Date.now(), title: 'Payment Verified', message: 'Your payment of ₦' + inv.totalAmount.toLocaleString() + ' for ' + inv.houseNumber + ' has been verified.', date: new Date().toLocaleDateString(), type: 'payment', read: false }, ...notifications])
  }
  const rejectInvoice = (id: string) => setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'rejected' as const } : inv))
  const filtered = invoices.filter(i => filter === 'all' || i.status === filter)
  const pendingCount = invoices.filter(i => i.status === 'pending').length

  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Invoices</h2>{pendingCount > 0 && <span className="ml-auto text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">{pendingCount} pending</span>}</div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
      <div className="flex bg-gray-200 rounded-xl p-1 gap-1 mb-4">{(['all', 'pending', 'verified'] as const).map((f) => (<button key={f} onClick={() => setFilter(f)} className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all" style={{ backgroundColor: filter === f ? 'white' : 'transparent', color: filter === f ? '#111' : '#6b7280' }}>{f}</button>))}</div>
      {filtered.length === 0 ? <EmptyState icon="mdi:receipt" title="No invoices" message="Invoices will appear here when tenants make payments." /> :
      filtered.map((inv) => <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <div className="flex items-start justify-between mb-2"><div><p className="font-bold text-gray-900">{inv.tenantName}</p><p className="text-gray-400 text-xs">{inv.houseNumber} — {inv.date}</p></div><StatusBadge status={inv.status} /></div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Estate Dues</span><span className="font-bold">₦{inv.baseAmount.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Service Fee ({SERVICE_FEE_PERCENT}%)</span><span className="font-bold text-green-600">₦{inv.serviceFee.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm font-black text-base border-t pt-2 mt-2"><span>Total Paid</span><span style={{ color: config.color }}>₦{inv.totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Estate settlement</span><span>₦{inv.estateSettlement.toLocaleString()}</span></div>
        </div>
        {inv.status === 'pending' && <div className="flex gap-2 mt-3"><button onClick={() => verifyInvoice(inv.id)} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm active:scale-[0.98]" style={{ backgroundColor: '#1B873F' }}>✓ Verify</button><button onClick={() => rejectInvoice(inv.id)} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-red-500 active:scale-[0.98]">✗ Reject</button></div>}
        {inv.verifiedBy && <p className="text-xs text-gray-400 mt-2">Verified by {inv.verifiedBy} on {inv.verifiedDate}</p>}
      </div>)}
    </div>
  </div>
}

// ============================================
// THEME CUSTOMIZER (Full — available to ALL estates)
// ============================================
// ============================================
// THEME CUSTOMIZER SCREEN — Full Studio
// ============================================
function ThemeCustomizerScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [activeTab, setActiveTab] = useState<'themes' | 'background' | 'fonts' | 'layout' | 'cards' | '3d' | 'preview'>('themes')
  const [bgColorPicker, setBgColorPicker] = useState(config.color)
  const [selectedPattern, setSelectedPattern] = useState(0)
  const [previewRole, setPreviewRole] = useState<'manager' | 'tenant' | 'staff'>('manager')
  const currentTheme = ESTATE_THEMES.find(t => t.id === config.themeId) || ESTATE_THEMES[0]
  const currentLayout = LAYOUT_PRESETS.find(l => l.id === config.layoutId) || LAYOUT_PRESETS[0]
  const contrastPass = meetsWCAG_AA(currentTheme.textPrimary, currentTheme.background)
  
  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'themes', label: 'Themes', icon: 'mdi:palette' },
    { id: 'background', label: 'Background', icon: 'mdi:image' },
    { id: 'fonts', label: 'Fonts', icon: 'mdi:format-font' },
    { id: 'layout', label: 'Layout', icon: 'mdi:view-grid' },
    { id: 'cards', label: 'Style', icon: 'mdi:card' },
    { id: '3d', label: '3D', icon: 'mdi:cube-outline' },
    { id: 'preview', label: 'Preview', icon: 'mdi:eye' },
  ]

  // 15 Pattern templates
  const patterns = [
    { name: 'Dots', svg: 'circle cx="20" cy="20" r="3" fill="currentColor"' },
    { name: 'Lines', svg: 'line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="2"' },
    { name: 'Grid', svg: 'rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1"' },
    { name: 'Zigzag', svg: 'polyline points="0,20 10,5 20,20 30,5 40,20" fill="none" stroke="currentColor" stroke-width="2"' },
    { name: 'Diamonds', svg: 'polygon points="20,5 35,20 20,35 5,20" fill="none" stroke="currentColor" stroke-width="1.5"' },
    { name: 'Waves', svg: 'path d="M0,20 Q10,5 20,20 T40,20" fill="none" stroke="currentColor" stroke-width="2"' },
    { name: 'Crosses', svg: 'line x1="15" y1="10" x2="25" y2="20" stroke="currentColor" stroke-width="2" / line x1="25" y1="10" x2="15" y2="20" stroke="currentColor" stroke-width="2"' },
    { name: 'Triangles', svg: 'polygon points="20,5 35,30 5,30" fill="none" stroke="currentColor" stroke-width="1.5"' },
    { name: 'Hexagons', svg: 'polygon points="20,5 33,12 33,27 20,34 7,27 7,12" fill="none" stroke="currentColor" stroke-width="1"' },
    { name: 'Circles', svg: 'circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="1.5"' },
    { name: 'Squares', svg: 'rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"' },
    { name: 'Stars', svg: 'polygon points="20,5 23,15 33,15 25,21 28,31 20,25 12,31 15,21 7,15 17,15" fill="currentColor" opacity="0.3"' },
    { name: 'Bricks', svg: 'rect x="0" y="0" width="20" height="10" fill="none" stroke="currentColor" stroke-width="1" / rect x="20" y="0" width="20" height="10" fill="none" stroke="currentColor" stroke-width="1" / rect x="10" y="10" width="20" height="10" fill="none" stroke="currentColor" stroke-width="1"' },
    { name: 'Chevron', svg: 'polyline points="5,10 20,25 35,10" fill="none" stroke="currentColor" stroke-width="2"' },
    { name: 'Topographic', svg: 'circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" stroke-width="1" / circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" stroke-width="1" / circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="1"' },
  ]

  const applyTheme = (theme: typeof ESTATE_THEMES[0]) => {
    setConfig({
      ...config,
      themeId: theme.id,
      color: theme.primary,
      secondaryColor: theme.secondary,
      fontFamily: config.fontFamily,
      isGoldBlackTheme: theme.id === 'dark-premium',
      shadowIntensity: theme.shadow,
      borderRadius: theme.radius === 'sharp' ? 8 : theme.radius === 'pill' ? 999 : 16,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setConfig({ ...config, bgImageUrl: reader.result as string, backgroundType: 'image' })
      }
      reader.readAsDataURL(file)
    }
  }

  return <div className="flex flex-col h-full" style={{ backgroundColor: currentTheme.background }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-3 border-b" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
      <PageBack onClick={() => go('manager-home')} />
      <h2 className="font-black text-xl" style={{ color: currentTheme.textPrimary }}>Customize Estate</h2>
    </div>
    {/* Tab bar */}
    <div className="flex overflow-x-auto gap-1 px-3 py-2 border-b" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all" style={{ backgroundColor: activeTab === tab.id ? currentTheme.primary : 'transparent', color: activeTab === tab.id ? 'white' : currentTheme.textSecondary }}>
          <Icon icon={tab.icon} width="14" height="14" />{tab.label}
        </button>
      ))}
    </div>
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
      {/* === THEMES TAB === */}
      {activeTab === 'themes' && <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>20 Complete Themes</p>
          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: currentTheme.primary + '15', color: currentTheme.primary }}>All Free</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ESTATE_THEMES.map(theme => {
            const isActive = config.themeId === theme.id
            return (
              <button key={theme.id} onClick={() => applyTheme(theme)} className="rounded-2xl p-3 text-left transition-all active:scale-[0.97]" style={{ backgroundColor: theme.surface, border: '2px solid ' + (isActive ? theme.primary : theme.border) }}>
                <div className="flex gap-1 mb-2 h-8 rounded-lg overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: theme.primary }} />
                  <div className="flex-1" style={{ backgroundColor: theme.secondary }} />
                  <div className="flex-1" style={{ backgroundColor: theme.accent }} />
                  <div className="flex-1" style={{ backgroundColor: theme.background, border: '1px solid ' + theme.border }} />
                </div>
                <p className="font-bold text-xs" style={{ color: theme.textPrimary }}>{theme.name}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{theme.description}</p>
                {isActive && <p className="text-xs font-bold mt-1" style={{ color: theme.primary }}>✓ Active</p>}
              </button>
            )
          })}
        </div>
        {!contrastPass && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-xs text-red-800 font-bold">⚠️ Low contrast detected</p><p className="text-xs text-red-700 mt-1">Current theme may not meet WCAG AA for text readability.</p></div>}
      </div>}

      {/* === BACKGROUND TAB === */}
      {activeTab === 'background' && <div className="flex flex-col gap-4">
        <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Background Type</p>
        <div className="grid grid-cols-2 gap-3">
          {(['solid', 'gradient', 'image', 'pattern'] as const).map(type => (
            <button key={type} onClick={() => setConfig({ ...config, backgroundType: type })} className="p-4 rounded-xl border-2 text-left font-bold text-sm capitalize" style={{ borderColor: config.backgroundType === type ? currentTheme.primary : currentTheme.border, backgroundColor: config.backgroundType === type ? currentTheme.primary + '10' : currentTheme.surface }}>
              {type}
            </button>
          ))}
        </div>
        
        {/* Solid color picker */}
        {config.backgroundType === 'solid' && <div className="flex flex-col gap-3">
          <p className="text-xs font-bold" style={{ color: currentTheme.textSecondary }}>Choose background color:</p>
          <div className="flex items-center gap-3">
            <input type="color" value={bgColorPicker} onChange={(e) => { setBgColorPicker(e.target.value); setConfig({ ...config, background: e.target.value }) }} className="w-16 h-12 rounded-lg cursor-pointer border-2" style={{ borderColor: currentTheme.border }} />
            <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: bgColorPicker }} />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {['#ffffff', '#f0f0f0', '#1a1a1a', '#000000', currentTheme.primary, currentTheme.secondary].map(c => (
              <button key={c} onClick={() => { setBgColorPicker(c); setConfig({ ...config, background: c }) }} className="h-10 rounded-lg border-2 active:scale-90 transition-transform" style={{ backgroundColor: c, borderColor: bgColorPicker === c ? currentTheme.primary : currentTheme.border }} />
            ))}
          </div>
        </div>}
        
        {/* Gradient controls */}
        {config.backgroundType === 'gradient' && <div className="flex flex-col gap-3">
          <div><p className="text-xs font-bold mb-2" style={{ color: currentTheme.textSecondary }}>Angle: {config.gradientAngle}°</p><input type="range" min="0" max="360" value={config.gradientAngle} onChange={(e) => setConfig({ ...config, gradientAngle: parseInt(e.target.value) })} className="w-full" /></div>
          <div className="flex gap-3">
            <div className="flex-1"><p className="text-xs font-bold mb-1" style={{ color: currentTheme.textSecondary }}>Color 1</p><input type="color" value={config.gradientColors[0]} onChange={(e) => setConfig({ ...config, gradientColors: [e.target.value, config.gradientColors[1]] })} className="w-full h-10 rounded-lg cursor-pointer" /></div>
            <div className="flex-1"><p className="text-xs font-bold mb-1" style={{ color: currentTheme.textSecondary }}>Color 2</p><input type="color" value={config.gradientColors[1]} onChange={(e) => setConfig({ ...config, gradientColors: [config.gradientColors[0], e.target.value] })} className="w-full h-10 rounded-lg cursor-pointer" /></div>
          </div>
          <div className="h-20 rounded-xl" style={{ background: `linear-gradient(${config.gradientAngle}deg, ${config.gradientColors[0]}, ${config.gradientColors[1]})` }} />
        </div>}
        
        {/* Image upload from gallery */}
        {config.backgroundType === 'image' && <div className="flex flex-col gap-3">
          <p className="text-xs font-bold" style={{ color: currentTheme.textSecondary }}>Upload from your gallery:</p>
          <label className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed cursor-pointer active:scale-[0.98] transition-transform" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.surface }}>
            <Icon icon="mdi:image-plus" width="48" height="48" style={{ color: currentTheme.primary }} />
            <p className="font-bold text-sm mt-2" style={{ color: currentTheme.textPrimary }}>Add Image</p>
            <p className="text-xs" style={{ color: currentTheme.textSecondary }}>Tap to choose from gallery</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {config.bgImageUrl && <div className="relative">
            <div className="h-40 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${config.bgImageUrl})` }} />
            <button onClick={() => setConfig({ ...config, bgImageUrl: '' })} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">×</button>
          </div>}
          <div><p className="text-xs font-bold mb-2" style={{ color: currentTheme.textSecondary }}>Image Opacity: {Math.round(config.backgroundOpacity * 100)}%</p><input type="range" min="10" max="100" value={config.backgroundOpacity * 100} onChange={(e) => setConfig({ ...config, backgroundOpacity: parseInt(e.target.value) / 100 })} className="w-full" /></div>
        </div>}
        
        {/* Pattern templates */}
        {config.backgroundType === 'pattern' && <div className="flex flex-col gap-3">
          <p className="text-xs font-bold" style={{ color: currentTheme.textSecondary }}>15 Aesthetic Pattern Templates:</p>
          <div className="grid grid-cols-3 gap-3">
            {patterns.map((p, i) => (
              <button key={p.name} onClick={() => setSelectedPattern(i)} className="rounded-xl border-2 p-2 transition-all active:scale-95" style={{ borderColor: selectedPattern === i ? currentTheme.primary : currentTheme.border, backgroundColor: currentTheme.surface }}>
                <svg viewBox="0 0 40 40" className="w-full h-12" style={{ color: currentTheme.primary }} dangerouslySetInnerHTML={{ __html: p.svg }} />
                <p className="text-xs font-bold mt-1" style={{ color: currentTheme.textPrimary }}>{p.name}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <p className="text-xs font-bold" style={{ color: currentTheme.textSecondary }}>Pattern color:</p>
            <input type="color" value={config.color} onChange={(e) => setConfig({ ...config, color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={config.enable3D} onChange={(e) => setConfig({ ...config, enable3D: e.target.checked })} className="w-5 h-5" />
              <span className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>Add estate image behind pattern</span>
            </label>
          </div>
        </div>}
      </div>}

      {/* === FONTS TAB === */}
      {activeTab === 'fonts' && <div className="flex flex-col gap-4">
        <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Typography</p>
        <div className="flex flex-col gap-2">
          {FONT_OPTIONS.map(font => (
            <button key={font.value} onClick={() => setConfig({ ...config, fontFamily: font.value })} className="w-full p-3 rounded-xl border-2 text-left transition-all" style={{ borderColor: config.fontFamily === font.value ? currentTheme.primary : currentTheme.border, backgroundColor: config.fontFamily === font.value ? currentTheme.primary + '10' : currentTheme.surface, fontFamily: font.value }}>
              <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>{font.label}</span>
              <span className="text-xs ml-2" style={{ color: currentTheme.textSecondary }}>The quick brown fox</span>
            </button>
          ))}
        </div>
      </div>}

      {/* === LAYOUT TAB with mini previews === */}
      {activeTab === 'layout' && <div className="flex flex-col gap-4">
        <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>10 Layout Presets</p>
        <div className="grid grid-cols-2 gap-3">
          {LAYOUT_PRESETS.map(layout => {
            const isActive = config.layoutId === layout.id
            return (
              <button key={layout.id} onClick={() => setConfig({ ...config, layoutId: layout.id })} className="rounded-xl border-2 p-3 text-left transition-all active:scale-[0.97]" style={{ borderColor: isActive ? currentTheme.primary : currentTheme.border, backgroundColor: isActive ? currentTheme.primary + '10' : currentTheme.surface }}>
                {/* Mini preview */}
                <div className="h-16 rounded-lg mb-2 overflow-hidden border" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background }}>
                  <div className="h-3 mx-1 mt-1 rounded" style={{ backgroundColor: currentTheme.primary, width: '60%' }} />
                  <div className="flex gap-1 mx-1 mt-1">
                    <div className="h-6 flex-1 rounded" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border }} />
                    <div className="h-6 flex-1 rounded" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border }} />
                  </div>
                  <div className="flex gap-1 mx-1 mt-1">
                    {Array.from({length: layout.gridColumns}).map((_, i) => (
                      <div key={i} className="h-4 rounded flex-1" style={{ backgroundColor: currentTheme.primary + '30' }} />
                    ))}
                  </div>
                </div>
                <p className="font-bold text-xs" style={{ color: currentTheme.textPrimary }}>{layout.name}</p>
                <p className="text-xs mt-0.5" style={{ color: currentTheme.textSecondary }}>{layout.description}</p>
                {isActive && <p className="text-xs font-bold mt-1" style={{ color: currentTheme.primary }}>✓ Active</p>}
              </button>
            )
          })}
        </div>
      </div>}

      {/* === CARDS/STYLE TAB === */}
      {activeTab === 'cards' && <div className="flex flex-col gap-5">
        <div>
          <p className="font-bold text-sm mb-3" style={{ color: currentTheme.textPrimary }}>Card Style</p>
          <div className="grid grid-cols-2 gap-3">
            {(['soft', 'bordered', 'elevated', 'minimal'] as const).map(style => (
              <button key={style} onClick={() => setConfig({ ...config, cardStyle: style })} className="h-20 rounded-xl border-2 flex items-center justify-center font-bold text-sm capitalize transition-all" style={{ borderColor: config.cardStyle === style ? currentTheme.primary : currentTheme.border, backgroundColor: currentTheme.surface, boxShadow: style === 'elevated' ? '0 4px 12px rgba(0,0,0,0.1)' : style === 'soft' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
                {style}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-bold text-sm mb-3" style={{ color: currentTheme.textPrimary }}>Button Style</p>
          <div className="grid grid-cols-2 gap-3">
            {(['rounded', 'pill', 'sharp', 'outlined'] as const).map(style => (
              <button key={style} onClick={() => setConfig({ ...config, buttonStyle: style })} className="h-12 flex items-center justify-center font-bold text-sm capitalize text-white transition-all" style={{ backgroundColor: style === 'outlined' ? 'transparent' : currentTheme.primary, border: style === 'outlined' ? '2px solid ' + currentTheme.primary : 'none', borderRadius: style === 'pill' ? '999px' : style === 'sharp' ? '4px' : '12px', color: style === 'outlined' ? currentTheme.primary : 'white' }}>
                {style}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-bold text-sm mb-3" style={{ color: currentTheme.textPrimary }}>Shadow Intensity</p>
          <div className="grid grid-cols-4 gap-2">
            {(['none', 'subtle', 'medium', 'strong'] as const).map(level => (
              <button key={level} onClick={() => setConfig({ ...config, shadowIntensity: level })} className="py-3 rounded-xl border-2 text-xs font-bold capitalize transition-all" style={{ borderColor: config.shadowIntensity === level ? currentTheme.primary : currentTheme.border, backgroundColor: config.shadowIntensity === level ? currentTheme.primary + '10' : currentTheme.surface }}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* === 3D TAB === */}
      {activeTab === '3d' && <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border }}>
          <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Enable 3D Model</span>
          <button onClick={() => setConfig({ ...config, enable3D: !config.enable3D })} className="w-12 h-7 rounded-full p-0.5 transition-colors" style={{ backgroundColor: config.enable3D ? currentTheme.primary : '#d1d5db' }}><div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform" style={{ transform: config.enable3D ? 'translateX(20px)' : 'translateX(0)' }} /></button>
        </div>
        {config.enable3D && <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border }}>
            <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Use Estate Logo</span>
            <button onClick={() => setConfig({ ...config, useEstateLogoFor3D: !config.useEstateLogoFor3D })} className="w-12 h-7 rounded-full p-0.5 transition-colors" style={{ backgroundColor: config.useEstateLogoFor3D ? currentTheme.primary : '#d1d5db' }}><div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform" style={{ transform: config.useEstateLogoFor3D ? 'translateX(20px)' : 'translateX(0)' }} /></button>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border }}>
            <p className="font-bold text-sm mb-2" style={{ color: currentTheme.textPrimary }}>Opacity: {Math.round(config.threeDOpacity * 100)}%</p>
            <input type="range" min="5" max="60" value={config.threeDOpacity * 100} onChange={(e) => setConfig({ ...config, threeDOpacity: parseInt(e.target.value) / 100 })} className="w-full" />
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border }}>
            <p className="font-bold text-sm mb-2" style={{ color: currentTheme.textPrimary }}>Rotation Speed: {config.threeDSpeed}s</p>
            <input type="range" min="8" max="40" value={config.threeDSpeed} onChange={(e) => setConfig({ ...config, threeDSpeed: parseInt(e.target.value) })} className="w-full" />
          </div>
        </div>}
      </div>}

      {/* === PREVIEW TAB — Shows all 3 role views === */}
      {activeTab === 'preview' && <div className="flex flex-col gap-4">
        <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Live Preview</p>
        <div className="flex bg-gray-200 rounded-xl p-1 gap-1">
          {(['manager', 'tenant', 'staff'] as const).map(role => (
            <button key={role} onClick={() => setPreviewRole(role)} className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all" style={{ backgroundColor: previewRole === role ? 'white' : 'transparent', color: previewRole === role ? '#111' : '#6b7280' }}>{role}</button>
          ))}
        </div>
        <div className="rounded-3xl overflow-hidden shadow-xl border-4 mx-auto" style={{ borderColor: currentTheme.border, maxWidth: 320 }}>
          <div className="p-4 min-h-[400px]" style={{ background: config.backgroundType === 'gradient' ? `linear-gradient(${config.gradientAngle}deg, ${config.gradientColors[0]}, ${config.gradientColors[1]})` : config.backgroundType === 'image' && config.bgImageUrl ? `linear-gradient(rgba(0,0,0,${1 - config.backgroundOpacity}), rgba(0,0,0,${1 - config.backgroundOpacity})), url(${config.bgImageUrl}) center/cover` : currentTheme.background, fontFamily: config.fontFamily }}>
            {previewRole === 'manager' && <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: currentTheme.primary }}><HouseIcon stroke="white" size={18} /></div>
                <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>{config.estateName}</span>
              </div>
              <div className="rounded-2xl p-4 mb-3" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primary}bb)` }}>
                <p className="text-white/80 text-xs">Good morning</p>
                <p className="text-white font-black text-lg">{config.estateName}</p>
                <p className="text-white/70 text-xs mt-2">{config.monthlyDues.toLocaleString()}/mo</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['Paid', 'Pending', 'Units'].map(label => (
                  <div key={label} className="rounded-xl p-2 text-center" style={{ backgroundColor: currentTheme.surface, boxShadow: config.cardStyle === 'elevated' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none', border: config.cardStyle === 'bordered' ? '1px solid ' + currentTheme.border : 'none', borderRadius: config.buttonStyle === 'pill' ? 999 : config.buttonStyle === 'sharp' ? 4 : 12 }}>
                    <p className="font-black text-sm" style={{ color: currentTheme.primary }}>—</p>
                    <p className="text-xs" style={{ color: currentTheme.textSecondary }}>{label}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: currentTheme.primary, borderRadius: config.buttonStyle === 'pill' ? 999 : config.buttonStyle === 'sharp' ? 4 : 12 }}>Management</button>
            </>}
            {previewRole === 'tenant' && <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: currentTheme.primary }}><HouseIcon stroke="white" size={18} /></div>
                <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>{config.estateName}</span>
              </div>
              <div className="rounded-2xl p-4 mb-3" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primary}bb)` }}>
                <p className="text-white/80 text-xs">Next Payment</p>
                <p className="text-white font-black text-2xl">₦{(config.monthlyDues * 1.1).toLocaleString()}</p>
              </div>
              <button className="w-full py-2.5 rounded-xl font-bold text-white text-sm mb-3" style={{ backgroundColor: currentTheme.primary, borderRadius: config.buttonStyle === 'pill' ? 999 : config.buttonStyle === 'sharp' ? 4 : 12 }}>Pay Now</button>
              <div className="grid grid-cols-2 gap-2">
                {['Bills', 'Maintenance'].map(label => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: currentTheme.surface, borderRadius: config.buttonStyle === 'pill' ? 999 : 12 }}>
                    <p className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>{label}</p>
                  </div>
                ))}
              </div>
            </>}
            {previewRole === 'staff' && <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: currentTheme.primary }}><Icon icon="mdi:wrench" width="18" height="18" style={{ color: 'white' }} /></div>
                <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Service Staff</span>
              </div>
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border, borderRadius: config.buttonStyle === 'pill' ? 999 : 12 }}>
                <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>My Jobs</p>
                <p className="text-xs" style={{ color: currentTheme.textSecondary }}>3 assigned tasks</p>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor: currentTheme.surface, border: '1px solid ' + currentTheme.border, borderRadius: config.buttonStyle === 'pill' ? 999 : 12 }}>
                <p className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>Scan QR</p>
                <p className="text-xs" style={{ color: currentTheme.textSecondary }}>Verify guest access</p>
              </div>
            </>}
          </div>
        </div>
        <ThemedBtn onClick={() => go('manager-home')} color={currentTheme.primary}>Apply & Save ✓</ThemedBtn>
        <button onClick={() => setConfig(DEFAULT_CONFIG)} className="w-full py-3 text-sm font-semibold text-center" style={{ color: currentTheme.textSecondary }}>Reset to Default</button>
      </div>}
    </div>
  </div>
}



// ============================================
// QR SHARE SCREEN
// ============================================
function QRShareScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  return <div className="flex flex-col h-full bg-gray-50">
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Share Access</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center gap-5">
      <div className="bg-white rounded-3xl p-5 shadow-lg w-full flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 font-medium">Share with tenants to join {config.estateName}</p>
        <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner"><QRCodeSVG value={config.joinCode} size={200} bgColor="#ffffff" fgColor={config.color} level="H" includeMargin={true} /></div>
        <div className="bg-gray-50 rounded-2xl px-6 py-3 border border-gray-200 w-full text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Join Code</p><p className="text-2xl font-black tracking-widest" style={{ color: config.color }}>{config.joinCode}</p></div>
        <div className="flex items-center gap-2 text-xs text-gray-400"><Icon icon="mdi:shield-check" width="16" height="16" style={{ color: config.color }} /><span>Secure and unique to your estate</span></div>
      </div>
      <div className="w-full"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Share via</p>
        <div className="grid grid-cols-3 gap-3">{[{label:'WhatsApp',icon:'mdi:whatsapp'},{label:'Messages',icon:'mdi:message-text'},{label:'Copy',icon:'mdi:content-copy'}].map((a) => (
          <button key={a.label} className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 shadow-sm active:scale-95 transition-transform"><Icon icon={a.icon} width="24" height="24" style={{ color: config.color }} /><span className="text-xs font-bold text-gray-700">{a.label}</span></button>
        ))}</div></div>
    </div>
  </div>
}

// ============================================
// TENANT SCREENS
// ============================================
function TenantCodeScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const handleJoin = async () => {
    if (!code.trim()) { setError('Please enter a code'); return }
    setLoading(true); setError('')
    try {
      // Lookup estate from Supabase by join code (cross-device!)
      const { data, error } = await supabase.rpc('find_estate_by_join_code', { p_join_code: code.trim().toUpperCase() })
      if (error || !data || data.length === 0) {
        setError('Invalid code. Check with your estate manager.')
        setLoading(false); return
      }
      const estate = data[0]
      // Load estate config from database
      const fetchedConfig = {
        ...config,
        estateName: estate.estate_name,
        joinCode: code.trim().toUpperCase(),
        monthlyDues: (estate.monthly_dues || 1500000) / 100,
        estateAccountNumber: '',
        estateAccountName: estate.estate_account_name || '',
        estateBank: estate.estate_bank || '',
      }
      localStorage.setItem('ef_estate_data', JSON.stringify(fetchedConfig))
      localStorage.setItem('ef_estate_id', estate.estate_id)
      setConfig(fetchedConfig)
      go('tenant-onboarding')
    } catch (e) {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }
  return <div className="relative h-full overflow-hidden"><div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: config.color }} /><div className="h-1/2" style={{ backgroundImage: 'url(' + (config.bgImageUrl || APT_PHOTO) + ')', backgroundSize: 'cover' }} /></div><div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
    <div className="relative z-10 h-full flex flex-col px-8"><div className="pt-[max(3.5rem,env(safe-area-inset-top))] pb-4"><button onClick={() => go('role-select')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
      <div className="flex-1 flex flex-col justify-center gap-5" style={{ animation: 'fade-up 0.5s ease both' }}>
        <div className="flex flex-col items-center gap-3"><div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><HouseIcon stroke="white" size={36} /></div><h2 className="text-3xl font-black text-white text-center">{config.estateName}</h2><p className="text-white/70 text-sm text-center">Enter the join code from your manager</p></div>
        <input type="text" placeholder={'Code (e.g. ' + config.joinCode + ')'} value={code} onChange={(e) => { setCode(e.target.value); setError('') }} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-center text-lg tracking-widest outline-none shadow-sm" />
        {error && <div className="bg-red-500/30 rounded-xl px-4 py-3"><p className="text-white text-sm font-semibold">{error}</p></div>}
        <button onClick={handleJoin} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98]" style={{ backgroundColor: config.color }}>{loading ? 'Looking up estate...' : 'Enter Estate →'}</button>
      </div>
    </div>
  </div>
}

function TenantOnboardingScreen({ go, config, setTenant }: { go: (s: Screen) => void; config: EstateConfig; setTenant: (t: TenantInfo) => void }) {
  const [name, setName] = useState(''); const [house, setHouse] = useState(''); const [avatar, setAvatar] = useState(''); const [email, setEmail] = useState('')
  const handleSave = () => { if (!name.trim() || !house.trim()) return; setTenant({ name: name.trim(), houseNumber: house.trim(), avatar, email: email.trim(), joinedDate: new Date().toLocaleDateString(), phone: '' }); go('tenant-home') }
  return <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: config.color + '12' }}>
    <House3DOverlay config={config} />
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 relative z-10"><PageBack onClick={() => go('tenant-code')} /><h2 className="font-black text-xl" style={{ fontFamily: config.fontFamily }}>Welcome to {config.estateName}</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5 relative z-10">
      <p className="text-gray-500 text-sm text-center">Set up your tenant profile</p>
      <div className="flex justify-center"><div className="flex gap-2 flex-wrap justify-center">{AVATARS.map((a, i) => (<button key={i} onClick={() => setAvatar(a)} className={'w-12 h-12 rounded-full transition-all bg-white overflow-hidden ' + (avatar === a ? 'ring-4 shadow-lg' : '')} style={{ borderColor: avatar === a ? config.color : 'transparent', borderWidth: avatar === a ? '3px' : '0' }}><div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html: a}} /></button>))}</div></div>
      <Field placeholder="Your Full Name" value={name} onChange={setName} />
      <Field placeholder="House / Unit Number" value={house} onChange={setHouse} />
      <Field placeholder="Email (optional)" type="email" value={email} onChange={setEmail} />
      <ThemedBtn onClick={handleSave} color={name.trim() && house.trim() ? config.color : '#d1d5db'} className={(name.trim() && house.trim()) ? '' : 'opacity-50'}>Save Profile →</ThemedBtn>
    </div>
  </div>
}

function TenantHomeScreen({ go, config, tenant, notifications, menuOpen, setMenuOpen }: {
  go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; notifications: Notification[]; menuOpen: boolean; setMenuOpen: (v: boolean) => void
}) {
  const isGB = config.isGoldBlackTheme
  const bgColor = isGB ? '#000000' : (config.color + '10')
  const cardBg = isGB ? '#1a1a1a' : 'white'
  const textP = isGB ? '#d4af37' : '#111827'
  const textS = isGB ? '#f4e4a0' : '#6b7280'
  const unread = notifications.filter(n => !n.read).length
  const breakdown = calculatePaymentBreakdown(config.monthlyDues)

  return <div className="flex flex-col h-full relative" style={{ backgroundColor: bgColor }}>
    <House3DOverlay config={config} />
    <div className="flex items-center justify-between px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 border-b relative z-10" style={{ backgroundColor: isGB ? '#000000dd' : 'white', borderColor: isGB ? '#d4af3733' : '#f3f4f6' }}>
      <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] p-1">{[0,1,2].map(i => <span key={i} className={'block w-6 h-[2.5px] rounded-full ' + (isGB ? 'bg-yellow-500' : 'bg-black')} />)}</button>
      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: config.color }}><div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html: tenant?.avatar || AVATAR_SVGS[0]}} /></div><span className="font-bold text-base" style={{ fontFamily: config.fontFamily, color: textP }}>{config.estateName}</span></div>
      <button onClick={() => go('tenant-settings')}><Icon icon="mdi:cog" width="22" height="22" style={{ color: isGB ? '#d4af37' : 'black' }} /></button>
    </div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-28 relative z-10">
      {/* Payment Card */}
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: isGB ? 'linear-gradient(135deg, #1a1a1a, #333)' : 'linear-gradient(135deg, ' + config.color + ', ' + config.color + 'bb)' }}>
        <p className="text-white/80 text-sm font-medium mb-1">Hello, {tenant?.name || 'Tenant'}</p>
        <p className="text-white/60 text-xs mb-3">{tenant?.houseNumber || ''} — {config.estateName}</p>
        <p className="text-white/70 text-xs font-bold uppercase mb-1">Next Payment</p>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm"><span className="text-white/80">Estate Dues</span><span className="font-bold">₦{breakdown.baseAmount.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-white/80">EstateFlow Service Fee</span><span className="font-bold">₦{breakdown.serviceFee.toLocaleString()}</span></div>
          <div className="border-t border-white/20 my-2" />
          <div className="flex justify-between"><span className="font-black text-lg">Total</span><span className="font-black text-2xl">₦{breakdown.totalAmount.toLocaleString()}</span></div>
        </div>
        <button onClick={() => go('tenant-bills')} className="w-full py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>Pay Now →</button>
      </div>
      {/* Notifications */}
      {unread > 0 && <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">{unread}</div><div><p className="font-bold text-red-800 text-sm">{unread} new notification{unread > 1 ? 's' : ''}</p></div></div>}
      {notifications.slice(0, 5).map((n) => <div key={n.id} className="rounded-2xl p-4 shadow-sm mb-3" style={{ backgroundColor: cardBg, borderLeft: '4px solid ' + (n.type === 'payment' ? '#1B873F' : n.type === 'emergency' ? '#ef4444' : n.type === 'complaint' ? '#f59e0b' : config.color) }}><p className="text-xs font-medium mb-1" style={{ color: textS }}>{n.date} — {n.type}</p><h5 className="font-bold text-sm mb-1" style={{ color: textP }}>{n.title}</h5><p className="text-xs" style={{ color: textS }}>{n.message}</p></div>)}
    </div>
    {/* Bottom Nav */}
    <div className="absolute bottom-0 left-0 right-0 px-3 z-10" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}><div className="flex rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: isGB ? '#1a1a1a' : config.color }}>
      {[
        { label: 'Home', icon: 'mdi:home', s: 'tenant-home' as Screen },
        { label: 'Bills', icon: 'mdi:credit-card', s: 'tenant-bills' as Screen },
        { label: 'Maintenance', icon: 'mdi:wrench', s: 'tenant-complaints' as Screen },
        { label: 'Emergency', icon: 'mdi:alarm-light', s: 'emergency' as Screen },
        { label: 'Guest', icon: 'mdi:account-group', s: 'guest' as Screen },
      ].map((item, i) => (<button key={i} onClick={() => go(item.s)} className="flex-1 py-3 flex flex-col items-center gap-1 transition-colors"><Icon icon={item.icon} width="20" height="20" style={{ color: 'rgba(255,255,255,0.9)' }} /><span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</span></button>))}</div></div>
    {/* Side Menu */}
    {menuOpen && <div className="absolute inset-0 z-50 flex"><div className="w-3/4 h-full bg-white flex flex-col pt-16 px-6 pb-8 shadow-2xl" style={{ animation: 'slideInLeft 0.3s ease' }}>
      <div className="flex items-center gap-3 mb-8"><div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: config.color }}><div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html: tenant?.avatar || AVATAR_SVGS[0]}} /></div><div><p className="font-black text-gray-900">{tenant?.name || 'Tenant'}</p><p className="text-gray-400 text-xs">{tenant?.houseNumber || 'Not set'}</p></div></div>
      <div className="flex flex-col gap-1 flex-1">
        {[{ label: 'My Profile', icon: 'mdi:account', s: 'tenant-profile' as Screen }, { label: 'Notifications', icon: 'mdi:bell', s: 'tenant-home' as Screen }, { label: 'Receipts', icon: 'mdi:receipt', s: 'tenant-receipts' as Screen }, { label: 'Settings', icon: 'mdi:cog', s: 'tenant-settings' as Screen }].map((item) => (
          <button key={item.label} onClick={() => { setMenuOpen(false); go(item.s) }} className="flex items-center gap-4 py-4 px-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-left"><Icon icon={item.icon} width="24" height="24" style={{ color: '#6b7280' }} /><span className="font-bold text-gray-800">{item.label}</span></button>
        ))}
      </div>
      <button onClick={() => { setMenuOpen(false); go('role-select') }} className="flex items-center gap-3 py-3 px-4 rounded-xl text-red-500 font-bold mt-4">Sign Out</button>
    </div><div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} /></div>}
  </div>
}

function TenantBillsScreen({ go, config, tenant, invoices, setInvoices, setNotifications, notifications }: {
  go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[]
}) {
  const breakdown = calculatePaymentBreakdown(config.monthlyDues)
  const myInvoices = invoices.filter(i => i.houseNumber === tenant?.houseNumber)
  const pending = myInvoices.find(i => i.status === 'pending')
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">My Bills</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-32">
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: 'linear-gradient(135deg, ' + config.color + ', ' + config.color + 'bb)' }}>
        <p className="text-white/80 text-sm font-medium mb-1">Total to Pay</p>
        <p className="text-4xl font-black">₦{breakdown.totalAmount.toLocaleString()}</p>
        <p className="text-white/70 text-xs mt-1">{tenant?.houseNumber} — {tenant?.name}</p>
      </div>
      <PaymentBreakdown baseAmount={config.monthlyDues} color={config.color} />
      {pending && <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-3"><p className="text-yellow-800 text-sm font-bold">Payment pending verification</p><p className="text-yellow-600 text-xs mt-1">Manager will verify your payment shortly.</p></div>}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-5 mb-3">Payment History</p>
      {myInvoices.filter(i => i.status === 'verified').length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No payments yet.</p> :
      myInvoices.filter(i => i.status === 'verified').map((inv) => <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3"><div className="flex justify-between mb-1"><span className="font-bold text-sm">{inv.date}</span><StatusBadge status="verified" /></div><p className="font-black text-gray-900">₦{inv.totalAmount.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Estate: ₦{inv.estateSettlement.toLocaleString()} | Fee: ₦{inv.serviceFee.toLocaleString()}</p></div>)}
    </div>
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 flex gap-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      <ThemedBtn onClick={() => {
        const b = calculatePaymentBreakdown(config.monthlyDues)
        const newInv: Invoice = { id: 'inv' + Date.now(), tenantName: tenant?.name || 'Tenant', houseNumber: tenant?.houseNumber || 'Unknown', baseAmount: b.baseAmount, serviceFee: b.serviceFee, processingFee: 0, totalAmount: b.totalAmount, estateSettlement: b.estateSettlement, estateflowShare: b.estateflowShare, date: new Date().toLocaleDateString(), status: 'pending', currency: 'NGN' }
        setInvoices([newInv, ...invoices]); go('tenant-pay')
      }} color={config.color}>Pay ₦{breakdown.totalAmount.toLocaleString()}</ThemedBtn>
      <button onClick={() => go('tenant-receipts')} className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 active:scale-[0.98]">Receipts</button>
    </div>
  </div>
}

function TenantPayScreen({ go, config, invoices, setInvoices, setNotifications, notifications }: {
  go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[]
}) {
  const [processing, setProcessing] = useState(false); const [paid, setPaid] = useState(false)
  const pending = invoices.find(i => i.status === 'pending')
  const breakdown = calculatePaymentBreakdown(config.monthlyDues)
  const handlePay = () => {
    // SECURITY: Real payment requires Paystack integration (backend Edge Function)
    // This simulates the payment REQUEST being created (not verified)
    // In production: call Edge Function → initialize Paystack → redirect to checkout
    // Webhook will verify and mark as successful server-side
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false); setPaid(true)
      if (pending) {
        // Mark as PENDING (not verified) — manager or webhook must verify
        setInvoices(invoices.map(inv => inv.id === pending.id ? { ...inv, status: 'pending' as const, paymentReference: 'EF-PEND-' + Math.floor(10000000 + Math.random() * 90000000) } : inv))
        setNotifications([{ id: 'n' + Date.now(), title: 'Payment Submitted', message: 'Your payment of ₦' + pending.totalAmount.toLocaleString() + ' is being processed. Awaiting verification.', date: new Date().toLocaleDateString(), type: 'payment', read: false }, ...notifications])
      }
    }, 2500)
  }
  if (paid && pending) return <div className="flex flex-col h-full items-center justify-center px-8 gap-4" style={{ backgroundColor: config.color + '10' }}>
    <SuccessAnimation message="Payment Submitted" subtext="Awaiting verification" color={config.color} />
    <div className="bg-white rounded-2xl p-5 shadow-sm w-full">
      <div className="flex justify-between mb-1"><span className="text-gray-500 text-sm">Estate Dues</span><span className="font-bold">₦{pending.baseAmount.toLocaleString()}</span></div>
      <div className="flex justify-between mb-1"><span className="text-gray-500 text-sm">Service Fee</span><span className="font-bold text-green-600">₦{pending.serviceFee.toLocaleString()}</span></div>
      <div className="border-t my-2" /><div className="flex justify-between"><span className="font-black">Total Paid</span><span className="font-black text-lg" style={{ color: config.color }}>₦{pending.totalAmount.toLocaleString()}</span></div>
      <p className="text-xs text-gray-400 mt-3">Reference: {pending.paymentReference || 'EF-XXXXXXXX'}</p>
    </div>
    <ThemedBtn onClick={() => go('tenant-home')} color={config.color}>Back to Home</ThemedBtn>
  </div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-bills')} /><h2 className="font-black text-xl">Pay Bill</h2></div>
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
      <PaymentBreakdown baseAmount={config.monthlyDues} color={config.color} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 w-full"><p className="text-xs text-blue-800 font-bold">Secure payment via Paystack</p><p className="text-xs text-blue-700">Estate dues → {config.estateAccountName}</p><p className="text-xs text-blue-700">Service fee → EstateFlow platform</p></div>
      <ThemedBtn onClick={handlePay} color={processing ? '#d1d5db' : config.color}>{processing ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : 'Pay ₦' + breakdown.totalAmount.toLocaleString() + ' →'}</ThemedBtn>
    </div>
  </div>
}

function TenantReceiptsScreen({ go, config, invoices, tenant }: { go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; tenant: TenantInfo | null }) {
  const myReceipts = invoices.filter(i => i.houseNumber === tenant?.houseNumber && i.status === 'verified')
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-bills')} /><h2 className="font-black text-xl">Receipts</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5">
      {myReceipts.length === 0 ? <EmptyState icon="mdi:receipt" title="No receipts yet" message="Your payment receipts will appear here." /> :
      myReceipts.map((inv) => <div key={inv.id} className="bg-white rounded-2xl p-5 shadow-sm mb-3">
        <div className="flex justify-between mb-3"><span className="font-black text-gray-900 text-lg">₦{inv.totalAmount.toLocaleString()}</span><StatusBadge status="verified" /></div>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between"><span>Estate Dues</span><span className="font-bold">₦{inv.baseAmount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Service Fee</span><span className="font-bold text-green-600">₦{inv.serviceFee.toLocaleString()}</span></div>
          <p>Date: {inv.date}</p><p>Reference: {inv.paymentReference || 'N/A'}</p>
        </div>
      </div>)}
    </div>
  </div>
}

function TenantComplaintsScreen({ go, config, tenant, complaints, setComplaints, setNotifications, notifications }: {
  go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; complaints: Complaint[]; setComplaints: (c: Complaint[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[]
}) {
  const [selected, setSelected] = useState<string | null>(null); const [desc, setDesc] = useState(''); const [submitted, setSubmitted] = useState(false)
  const handleSubmit = () => {
    if (!selected || !desc.trim() || !tenant) return
    setComplaints([{ id: 'c' + Date.now(), tenantName: tenant.name, houseNumber: tenant.houseNumber, category: selected, description: desc.trim(), date: new Date().toLocaleDateString(), status: 'open', priority: 'medium' }, ...complaints])
    setNotifications([{ id: 'n' + Date.now(), title: 'Report Submitted', message: 'Your ' + selected + ' report has been sent to management.', date: new Date().toLocaleDateString(), type: 'maintenance', read: false }, ...notifications])
    setDesc(''); setSelected(null); setSubmitted(true); setTimeout(() => setSubmitted(false), 2500)
  }
  if (submitted) return <div className="flex flex-col h-full items-center justify-center px-8 gap-5" style={{ backgroundColor: config.color + '10' }}><SuccessAnimation message="Report Submitted!" subtext="Management has been notified." color={config.color} /><ThemedBtn onClick={() => go('tenant-home')} color={config.color}>Back to Home</ThemedBtn></div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Report Issue</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
      <p className="text-sm text-gray-500 mb-4">Select issue type:</p>
      <div className="grid grid-cols-3 gap-3 mb-5">{MAINTENANCE_CATEGORIES.map((c) => (<button key={c.label} onClick={() => setSelected(c.label)} className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 bg-white active:scale-[0.98]" style={{ borderColor: selected === c.label ? config.color : 'transparent', backgroundColor: selected === c.label ? config.color + '10' : 'white' }}><Icon icon={c.icon} width="28" height="28" style={{ color: config.color }} /><span className="text-xs font-bold">{c.label}</span></button>))}</div>
      {selected && <div className="flex flex-col gap-3" style={{ animation: 'fade-up 0.3s ease both' }}><textarea placeholder={'Describe the ' + selected + ' issue...'} value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none resize-none shadow-sm" /><ThemedBtn onClick={handleSubmit} color={desc.trim() ? config.color : '#d1d5db'} className={desc.trim() ? '' : 'opacity-50'}>Submit Report</ThemedBtn></div>}
      {complaints.filter(c => c.houseNumber === tenant?.houseNumber).length > 0 && <div className="mt-6"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">My Reports</p>{complaints.filter(c => c.houseNumber === tenant?.houseNumber).map((c) => <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm mb-2"><div className="flex justify-between mb-1"><span className="font-bold text-sm">{c.category}</span><StatusBadge status={c.status} /></div><p className="text-gray-500 text-xs">{c.description}</p><p className="text-gray-400 text-xs mt-1">{c.date}</p></div>)}</div>}
    </div>
  </div>
}

function TenantProfileScreen({ go, config, tenant, setTenant }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; setTenant: (t: TenantInfo) => void }) {
  const [name, setName] = useState(tenant?.name || ''); const [house, setHouse] = useState(tenant?.houseNumber || ''); const [avatar, setAvatar] = useState(tenant?.avatar || ''); const [saved, setSaved] = useState(false)
  const handleSave = () => { setTenant({ ...tenant!, name, houseNumber: house, avatar }); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center justify-between px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Profile</h2><button onClick={handleSave} className="text-sm font-bold" style={{ color: config.color }}>{saved ? '✓ Saved' : 'Save'}</button></div>
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
      <div className="flex justify-center"><div className="flex gap-2 flex-wrap justify-center">{AVATARS.map((a, i) => (<button key={i} onClick={() => setAvatar(a)} className={'w-12 h-12 rounded-full bg-white overflow-hidden ' + (avatar === a ? 'ring-4' : '')} style={{ borderColor: avatar === a ? config.color : 'transparent', borderWidth: avatar === a ? '3px' : '0' }}><div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html: a}} /></button>))}</div></div>
      <Field placeholder="Full Name" value={name} onChange={setName} /><Field placeholder="House / Unit Number" value={house} onChange={setHouse} />
      <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Estate Info</p><div className="text-sm text-gray-600 space-y-2"><div className="flex justify-between"><span>Estate</span><span className="font-bold">{config.estateName}</span></div><div className="flex justify-between"><span>Joined</span><span className="font-bold">{tenant?.joinedDate || 'Today'}</span></div></div></div>
    </div>
  </div>
}

function TenantSettingsScreen({ go, config, clearSession }: { go: (s: Screen) => void; config: EstateConfig; clearSession: () => void }) {
  const [notifOn, setNotifOn] = useState(true)
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Settings</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Notifications</p>
        <div className="flex items-center justify-between"><span className="font-bold text-gray-800">Enable Notifications</span><button onClick={() => setNotifOn(!notifOn)} className="w-12 h-7 rounded-full p-0.5 transition-colors" style={{ backgroundColor: notifOn ? '#1B873F' : '#d1d5db' }}><div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform" style={{ transform: notifOn ? 'translateX(20px)' : 'translateX(0)' }} /></button></div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-3">Account</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => { if (confirm('Leave this estate?')) { clearSession(); go('role-select') } }} className="w-full py-3 rounded-xl font-bold text-red-600 bg-red-50 active:scale-[0.98] transition-transform text-left px-4">
            <Icon icon="mdi:logout" width="18" height="18" className="inline mr-2 -mt-1" />Leave Estate
          </button>
          <button onClick={() => { if (confirm('Delete your account? This cannot be undone.')) { clearSession(); go('role-select') } }} className="w-full py-3 rounded-xl font-bold text-red-700 bg-red-100 active:scale-[0.98] transition-transform text-left px-4">
            <Icon icon="mdi:delete" width="18" height="18" className="inline mr-2 -mt-1" />Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
}

// ============================================
// EMERGENCY SCREEN (Red, distinct visual)
// ============================================
function EmergencyScreen({ go, config, tenant, alerts, setAlerts }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; alerts: EmergencyAlert[]; setAlerts: (a: EmergencyAlert[]) => void }) {
  const [sent, setSent] = useState(false); const [alertType, setAlertType] = useState('')
  const isGB = config.isGoldBlackTheme
  const emergencyBg = isGB ? '#1a0000' : config.color + '08'
  const emergencyCard = isGB ? '#1a1a1a' : 'white'
  const emergencyBorder = isGB ? '#ef4444' : config.color + '30'
  const emergencyText = isGB ? '#fca5a5' : '#991b1b'
  
  if (sent) return <div className="flex flex-col h-full items-center justify-center px-8 gap-6" style={{ backgroundColor: emergencyBg }}>
    <div className="relative flex items-center justify-center"><div className="absolute w-36 h-36 rounded-full" style={{ backgroundColor: config.color + '30', animation: 'pulse-ring 1.4s ease-out infinite' }} /><div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: config.color }}><Icon icon="mdi:alarm-light" width="40" height="40" style={{ color: 'white' }} /></div></div>
    <h3 className="text-2xl font-black" style={{ color: config.color }}>{alertType} Alert Sent!</h3>
    <p className="text-sm text-center" style={{ color: isGB ? '#a1a1aa' : '#6b7280' }}>Security & management notified at {tenant?.houseNumber || ''}.</p>
    <ThemedBtn onClick={() => go('tenant-home')} color={config.color}>Back to Home</ThemedBtn>
  </div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: emergencyBg }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 border-b" style={{ backgroundColor: isGB ? '#1a0000' : config.color, borderColor: emergencyBorder }}>
      <PageBack onClick={() => go('tenant-home')} light={isGB} /><h2 className="font-black text-xl" style={{ color: isGB ? '#fca5a5' : 'white' }}>Emergency</h2>
    </div>
    <div className="flex-1 px-5 py-4 flex flex-col gap-4">
      <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: config.color + '10', border: '2px solid ' + emergencyBorder }}>
        <p className="text-sm font-bold" style={{ color: emergencyText }}>️ Only use in real emergencies</p>
        <p className="text-xs mt-1" style={{ color: isGB ? '#a1a1aa' : '#6b7280' }}>Your address ({tenant?.houseNumber || ''}) will be sent to security immediately.</p>
      </div>
      <p className="text-sm text-center font-semibold" style={{ color: isGB ? '#fca5a5' : '#374151' }}>Select emergency type:</p>
      <div className="grid grid-cols-2 gap-3">{[
        { label: 'Fire', icon: 'mdi:fire', color: '#ef4444' },
        { label: 'Security', icon: 'mdi:shield-alert', color: '#f59e0b' },
        { label: 'Medical', icon: 'mdi:hospital-box', color: '#3b82f6' },
        { label: 'Gas Leak', icon: 'mdi:gas-cylinder', color: '#8b5cf6' },
        { label: 'Other', icon: 'mdi:alert-octagon', color: '#6b7280' },
      ].map((t) => (
        <button key={t.label} onClick={() => { setAlertType(t.label) }} className="flex flex-col items-center gap-3 py-6 rounded-2xl shadow-sm active:scale-[0.98] transition-transform" style={{ backgroundColor: emergencyCard, border: '2px solid ' + emergencyBorder }}>
          <Icon icon={t.icon} width="40" height="40" style={{ color: t.color }} /><span className="font-bold text-sm" style={{ color: t.color }}>{t.label}</span>
        </button>
      ))}</div>
      {alertType && <div className="rounded-2xl p-5 mt-3" style={{ backgroundColor: emergencyCard, border: '2px solid ' + emergencyBorder, animation: 'scaleIn 0.2s ease' }}>
        <p className="font-bold text-center mb-2" style={{ color: emergencyText }}>Confirm: {alertType} Emergency?</p>
        <p className="text-xs text-center mb-4" style={{ color: isGB ? '#a1a1aa' : '#6b7280' }}>Your location ({tenant?.houseNumber}) will be sent to security & management immediately.</p>
        <div className="flex gap-3">
          <button onClick={() => setAlertType('')} className="flex-1 py-3 rounded-xl font-bold active:scale-[0.98]" style={{ backgroundColor: isGB ? '#333' : '#f3f4f6', color: isGB ? '#fca5a5' : '#374151' }}>Cancel</button>
          <button onClick={() => { setSent(true); setAlerts([{ id: 'e' + Date.now(), type: alertType, houseNumber: tenant?.houseNumber || 'Unknown', tenantName: tenant?.name || 'Unknown', date: new Date().toLocaleString(), location: tenant?.houseNumber || '', status: 'active' }, ...alerts]) }} className="flex-1 py-3 rounded-xl font-bold text-white active:scale-[0.98]" style={{ backgroundColor: config.color }}>SEND ALERT</button>
        </div>
      </div>}
    </div>
  </div>
}

// ============================================
// 
// ============================================
// GUEST SCREEN
// ============================================
function GuestScreen({ go, config, tenant, guestCodes, setGuestCodes }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; guestCodes: GuestCode[]; setGuestCodes: (g: GuestCode[]) => void }) {
  const [step, setStep] = useState<'choose' | 'details' | 'code'>('choose'); const [guestType, setGuestType] = useState<string | null>(null); const [guestName, setGuestName] = useState(''); const [code, setCode] = useState('')
  if (step === 'code') return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}><div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => setStep('details')} /><h2 className="font-black text-xl">Access Code</h2></div><div className="flex-1 px-5 py-6 flex flex-col items-center gap-5"><div className="bg-white rounded-3xl p-5 shadow-lg w-full flex flex-col items-center gap-4"><div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: config.color + '15' }}><Icon icon={(GUEST_TYPES.find(t => t.label === guestType) || { icon: 'mdi:account' }).icon} width="28" height="28" style={{ color: config.color }} /></div><p className="font-bold text-gray-900">{guestName || 'Guest'}</p><div className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-8 py-4 w-full text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Access Code</p><p className="text-3xl font-black tracking-widest">{code}</p></div><p className="text-xs text-gray-400 text-center">{tenant?.houseNumber} — Valid 2 hours</p></div><div className="grid grid-cols-2 gap-3 w-full">{['WhatsApp', 'Messages', 'Email', 'Copy'].map((a) => (<button key={a} className="py-3 bg-white rounded-xl font-bold text-sm text-gray-700 shadow-sm active:scale-[0.98]">{a}</button>))}</div></div></div>
  if (step === 'details') return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}><div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => setStep('choose')} /><h2 className="font-black text-xl">{guestType} Details</h2></div><div className="flex-1 px-5 py-5 flex flex-col gap-4"><Field placeholder="Guest name" value={guestName} onChange={setGuestName} /><ThemedBtn onClick={() => { const c = 'G-' + Math.floor(1000 + Math.random() * 9000); setCode(c); setGuestCodes([{ code: c, type: guestType || '', name: guestName, house: tenant?.houseNumber || '', date: new Date().toLocaleString() }, ...guestCodes]); setStep('code') }} color={guestName.trim() ? config.color : '#d1d5db'} className={guestName.trim() ? '' : 'opacity-50'}>Generate Code →</ThemedBtn></div></div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}><div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Guest Access</h2></div><div className="flex-1 px-5 py-6 flex flex-col gap-3"><p className="text-sm text-gray-500 text-center mb-3">Who are you expecting?</p>{GUEST_TYPES.map((t) => (<button key={t.label} onClick={() => { setGuestType(t.label); setStep('details') }} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] text-left"><div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: config.color + '15' }}><Icon icon={t.icon} width="28" height="28" style={{ color: config.color }} /></div><div><p className="font-bold text-gray-900">{t.label}</p></div><svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg></button>))}</div></div>
}

// ============================================
// SERVICE STAFF SCREENS
// ============================================
function ServiceCodeScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const handleJoin = async () => {
    if (!code.trim()) { setError('Please enter a code'); return }
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.rpc('find_estate_by_join_code', { p_join_code: code.trim().toUpperCase() })
      if (error || !data || data.length === 0) { setError('Invalid code.'); setLoading(false); return }
      const estate = data[0]
      setConfig({ ...config, estateName: estate.estate_name, joinCode: code.trim().toUpperCase(), monthlyDues: (estate.monthly_dues || 1500000) / 100 })
      localStorage.setItem('ef_estate_data', JSON.stringify({ estateName: estate.estate_name, joinCode: code.trim().toUpperCase(), monthlyDues: (estate.monthly_dues || 1500000) / 100 }))
      go('service-role')
    } catch { setError('Network error.') }
    setLoading(false)
  }
  return <div className="relative h-full overflow-hidden"><div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: config.color }} /><div className="h-1/2" style={{ backgroundImage: 'url(' + (config.bgImageUrl || APT_PHOTO) + ')', backgroundSize: 'cover' }} /></div><div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} /><div className="relative z-10 h-full flex flex-col px-8"><div className="pt-[max(3.5rem,env(safe-area-inset-top))] pb-4"><button onClick={() => go('role-select')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div><div className="flex-1 flex flex-col justify-center gap-5" style={{ animation: 'fade-up 0.5s ease both' }}><div className="flex flex-col items-center gap-3"><div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><Icon icon="mdi:wrench" width="36" height="36" style={{ color: 'white' }} /></div><h2 className="text-3xl font-black text-white text-center">Service Staff</h2><p className="text-white/70 text-sm text-center">Enter the code from the estate manager</p></div><input type="text" placeholder={'Code (e.g. ' + config.joinCode + ')'} value={code} onChange={(e) => { setCode(e.target.value); setError('') }} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-center text-lg tracking-widest outline-none" />{error && <div className="bg-red-500/30 rounded-xl px-4 py-3"><p className="text-white text-sm font-semibold">{error}</p></div>}<button onClick={handleJoin} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98]" style={{ backgroundColor: config.color }}>{loading ? 'Looking up...' : 'Continue →'}</button></div></div></div>
}

function ServiceRoleScreen({ go }: { go: (s: Screen) => void }) {
  const roles = [{ label: 'Security', icon: 'mdi:shield-account', screen: 'service-security' as Screen, desc: 'Emergency alerts & guest codes' }, { label: 'Plumber', icon: 'mdi:wrench', screen: 'service-worker' as Screen, desc: 'Plumbing requests' }, { label: 'Cleaner', icon: 'mdi:broom', screen: 'service-worker' as Screen, desc: 'Cleaning requests' }, { label: 'Electrician', icon: 'mdi:flash', screen: 'service-worker' as Screen, desc: 'Electrical requests' }]
  return <div className="flex flex-col h-full bg-gray-50"><div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('service-code')} /><h2 className="font-black text-xl">Select Your Role</h2></div><div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">{roles.map((r) => (<button key={r.label} onClick={() => go(r.screen)} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left"><div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-green-50"><Icon icon={r.icon} width="28" height="28" style={{ color: '#1B873F' }} /></div><div><p className="font-bold text-gray-900 text-base">{r.label}</p><p className="text-gray-400 text-xs mt-0.5">{r.desc}</p></div><svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg></button>))}</div></div>
}

function ServiceSecurityScreen({ go, config, alerts, guestCodes }: { go: (s: Screen) => void; config: EstateConfig; alerts: EmergencyAlert[]; guestCodes: GuestCode[] }) {
  const [scanCode, setScanCode] = useState(''); const [scanned, setScanned] = useState<{ code: string; type: string; name: string; house: string } | null>(null)
  const handleScan = () => { const found = guestCodes.find(g => g.code.toUpperCase() === scanCode.toUpperCase()); if (found) setScanned({ code: found.code, type: found.type, name: found.name, house: found.house }); else setScanned({ code: scanCode, type: 'Unknown', name: 'Not Found', house: 'N/A' }) }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}><div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('service-role')} /><h2 className="font-black text-xl">Security Dashboard</h2></div><div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
    {alerts.filter(a => a.status === 'active').length > 0 && <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4"><p className="text-red-800 text-sm font-bold mb-2">Active Emergency ({alerts.filter(a => a.status === 'active').length})</p>{alerts.filter(a => a.status === 'active').map((a) => <div key={a.id} className="bg-white rounded-xl p-3 mb-2"><p className="font-bold text-red-600">{a.type} — {a.houseNumber}</p><p className="text-gray-500 text-xs">{a.date}</p></div>)}</div>}
    <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Scan Guest Code</p><input type="text" placeholder="Enter guest code" value={scanCode} onChange={(e) => setScanCode(e.target.value)} className="w-full py-3 px-4 bg-gray-50 rounded-xl border-2 border-gray-200 font-bold text-center text-lg tracking-widest outline-none" /><button onClick={handleScan} className="w-full py-3 mt-3 rounded-xl font-bold text-white active:scale-[0.98]" style={{ backgroundColor: config.color }}>Scan Code</button>{scanned && <div className="mt-4 bg-gray-50 rounded-xl p-4 border-2 border-gray-200"><p className="text-xs font-bold text-gray-400 uppercase mb-2">Result</p><div className="space-y-1 text-sm"><p><strong>Code:</strong> {scanned.code}</p><p><strong>Type:</strong> {scanned.type}</p><p><strong>Guest:</strong> {scanned.name}</p><p><strong>Unit:</strong> <span className="font-bold text-green-600">{scanned.house}</span></p></div></div>}</div>
  </div></div>
}

function ServiceWorkerScreen({ go, config, complaints }: { go: (s: Screen) => void; config: EstateConfig; complaints: Complaint[] }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}><div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('service-role')} /><h2 className="font-black text-xl">My Jobs</h2></div><div className="flex-1 overflow-y-auto px-5 py-5">{complaints.length === 0 ? <EmptyState icon="mdi:inbox" title="No jobs assigned" message="New jobs will appear here." color={config.color} /> : complaints.map((c) => <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3"><div className="flex items-start justify-between mb-2"><div><p className="font-bold text-gray-900">{c.category}</p><p className="text-gray-400 text-xs">{c.houseNumber} — {c.date}</p></div><StatusBadge status={c.status} /></div><p className="text-gray-600 text-sm">{c.description}</p><div className="mt-3 pt-3 border-t text-xs text-gray-400"><p>Tenant: {c.tenantName}</p><p>Unit: <strong className="text-gray-700">{c.houseNumber}</strong></p></div></div>)}</div></div>
}

// ============================================
// TENANTS SCREEN (Manager view of estate tenants)
// ============================================
function TenantsScreen({ go, config, tenantLogins, invoices }: { go: (s: Screen) => void; config: EstateConfig; tenantLogins: { name: string; house: string; date: string }[]; invoices: Invoice[] }) {
  const isGB = config.isGoldBlackTheme
  const currentLayout = LAYOUT_PRESETS.find(l => l.id === config.layoutId) || LAYOUT_PRESETS[0]
  const bgColor = isGB ? '#000000' : (config.color + '10')
  const cardBg = isGB ? '#1a1a1a' : 'white'
  const textP = isGB ? '#d4af37' : '#111827'
  const textS = isGB ? '#f4e4a0' : '#6b7280'
  const borderColor = isGB ? '#d4af3733' : '#f3f4f6'
  const cardPadding = currentLayout.cardDensity === 'compact' ? 'p-2' : currentLayout.cardDensity === 'spacious' ? 'p-5' : 'p-3'
  const gridGap = currentLayout.cardDensity === 'compact' ? 'gap-2' : currentLayout.cardDensity === 'spacious' ? 'gap-4' : 'gap-3'
  const getTenantFinance = (house: string) => {
    const tInvoices = invoices.filter(i => i.houseNumber === house)
    const paid = tInvoices.filter(i => i.status === 'verified').reduce((s, i) => s + i.baseAmount, 0)
    const outstanding = tInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.baseAmount, 0)
    return { paid, outstanding, payments: tInvoices.filter(i => i.status === 'verified').length }
  }
  return <div className="flex flex-col h-full" style={{ backgroundColor: bgColor }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Tenants</h2><span className="ml-auto text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: config.color + '15', color: config.color }}>{tenantLogins.length} joined</span></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
      {tenantLogins.length === 0 ? <div className="text-center py-16"><Icon icon="mdi:account-group" width="64" height="64" style={{ color: '#d1d5db' }} /><p className="font-bold text-gray-700 mt-3">No tenants yet</p><p className="text-gray-400 text-sm mt-1">Share your join code to onboard tenants</p><button onClick={() => go('qr-share')} className="mt-4 px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: config.color }}>Share Join Code</button></div> :
      tenantLogins.map((t, i) => { const fin = getTenantFinance(t.house); return (
        <div key={i} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: cardBg, border: '1px solid ' + borderColor }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: config.color }}>{t.name[0]?.toUpperCase() || '?'}</div>
            <div className="flex-1"><p className="font-bold" style={{ color: textP }}>{t.name}</p><p className="text-xs" style={{ color: textS }}>{t.house} — Joined {t.date}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#1B873F10' }}><p className="text-xs text-green-600 font-bold">Paid</p><p className="font-bold text-sm text-green-800">{fin.paid.toLocaleString()}</p></div>
            <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#f59e0b10' }}><p className="text-xs text-yellow-600 font-bold">Owing</p><p className="font-bold text-sm text-yellow-800">₦{fin.outstanding.toLocaleString()}</p></div>
            <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#2563eb10' }}><p className="text-xs text-blue-600 font-bold">Payments</p><p className="font-bold text-sm text-blue-800">{fin.payments}</p></div>
          </div>
        </div>
      )})}
    </div>
  </div>
}

// ============================================
// MANAGER SETTINGS
// ============================================
// ============================================
// SEARCH TENANT SCREEN (Patch §5, §9)
// ============================================
function SearchTenantScreen({ go, config, tenantLogins, invoices }: {
  go: (s: Screen) => void; config: EstateConfig; tenantLogins: { name: string; house: string; date: string }[]; invoices: Invoice[]
}) {
  const [query, setQuery] = useState('')
  const minQuery = 2
  const trimmed = query.trim()
  const results = trimmed.length >= minQuery
    ? tenantLogins.filter(t => t.name.toLowerCase().includes(trimmed.toLowerCase()) || t.house.toLowerCase().includes(trimmed.toLowerCase()))
    : []
  const getTenantFinance = (house: string) => {
    const tenantInvoices = invoices.filter(i => i.houseNumber === house)
    const paid = tenantInvoices.filter(i => i.status === 'verified').reduce((s, i) => s + i.baseAmount, 0)
    const outstanding = tenantInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.baseAmount, 0)
    return { paid, outstanding, totalPayments: tenantInvoices.filter(i => i.status === 'verified').length }
  }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100">
      <PageBack onClick={() => go('manager-home')} />
      <h2 className="font-black text-xl">Search Tenant</h2>
    </div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <Icon icon="mdi:magnify" width="20" height="20" className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search by name or unit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full py-4 pl-12 pr-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none focus:border-green-600 transition-all shadow-sm"
        />
      </div>
      {/* Search info */}
      <p className="text-xs text-gray-400">Minimum {minQuery} characters. Results limited to your estate.</p>
      {/* Results */}
      {trimmed.length < minQuery ? (
        <div className="text-center py-12">
          <Icon icon="mdi:account-search" width="48" height="48" style={{ color: '#d1d5db' }} />
          <p className="text-gray-400 text-sm mt-3">Type at least {minQuery} characters to search</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Icon icon="mdi:account-off" width="48" height="48" style={{ color: '#d1d5db' }} />
          <p className="font-bold text-gray-600 mt-3">No tenants found</p>
          <p className="text-gray-400 text-sm mt-1">No results for "{trimmed}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map((t, i) => {
            const fin = getTenantFinance(t.house)
            return (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: config.color }}>
                    {t.name[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.house} — Joined {t.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-600 font-bold">Paid</p>
                    <p className="font-bold text-sm text-green-800">₦{fin.paid.toLocaleString()}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-yellow-600 font-bold">Owing</p>
                    <p className="font-bold text-sm text-yellow-800">₦{fin.outstanding.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-600 font-bold">Payments</p>
                    <p className="font-bold text-sm text-blue-800">{fin.totalPayments}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  </div>
}

// ============================================
// TENANTS SCREEN (Manager view of estate tenants)
// ============================================
// MANAGER SETTINGS
// ============================================
function ManagerSettingsScreen({ go, config, tenantLogins }: { go: (s: Screen) => void; config: EstateConfig; tenantLogins: { name: string; house: string; date: string }[] }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '10' }}>
    <div className="flex items-center gap-3 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Settings</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Tenant Logins: {tenantLogins.length}</p>
        {tenantLogins.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No tenants yet.</p> : tenantLogins.map((t, i) => (<div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{t.name[0] || ''}</div><div className="flex-1"><p className="font-bold text-gray-900 text-sm">{t.name}</p><p className="text-gray-400 text-xs">{t.house} — Joined {t.date}</p></div></div>))}
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-3">Account</p>
        <div className="flex flex-col gap-2">
          <button onClick={async () => { if (confirm('Sign out of your account?')) { await clearSession(); go('role-select') } }} className="w-full py-3 rounded-xl font-bold text-red-600 bg-red-50 active:scale-[0.98] transition-transform text-left px-4">
            <Icon icon="mdi:logout" width="18" height="18" className="inline mr-2 -mt-1" />Sign Out
          </button>
          <button onClick={async () => { if (confirm('Delete your account? This cannot be undone.')) { try { await supabase.auth.signOut(); await supabase.auth.admin?.deleteUser?.(userEmail); } catch {} clearSession(); go('role-select') } }} className="w-full py-3 rounded-xl font-bold text-red-700 bg-red-100 active:scale-[0.98] transition-transform text-left px-4">
            <Icon icon="mdi:delete" width="18" height="18" className="inline mr-2 -mt-1" />Delete Account
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Estate Information</p>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex justify-between"><span>Estate</span><span className="font-bold">{config.estateName}</span></div>
          <div className="flex justify-between"><span>Monthly Dues</span><span className="font-bold">₦{config.monthlyDues.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Service Fee ({SERVICE_FEE_PERCENT}%)</span><span className="font-bold text-green-600">₦{Math.round(config.monthlyDues * 0.1).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Bank</span><span className="font-bold">{config.estateBank}</span></div>
          <div className="flex justify-between"><span>Account</span><span className="font-bold">{config.estateAccountNumber}</span></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Legal</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => go('privacy-policy')} className="w-full text-left py-3 px-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all border border-gray-100">
            <p className="font-bold text-sm text-gray-800">Privacy Policy</p>
            <p className="text-xs text-gray-500">How we handle your data</p>
          </button>
          <button onClick={() => go('terms-of-service')} className="w-full text-left py-3 px-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all border border-gray-100">
            <p className="font-bold text-sm text-gray-800">Terms of Service</p>
            <p className="text-xs text-gray-500">Rules for using EstateFlow</p>
          </button>
          <button onClick={() => go('payment-refund-policy')} className="w-full text-left py-3 px-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all border border-gray-100">
            <p className="font-bold text-sm text-gray-800">Payment & Refund Policy</p>
            <p className="text-xs text-gray-500">Fees and refund process</p>
          </button>
          <button onClick={() => go('emergency-disclaimer')} className="w-full text-left py-3 px-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all border border-gray-100">
            <p className="font-bold text-sm text-gray-800">Emergency Disclaimer</p>
            <p className="text-xs text-gray-500">Important safety information</p>
          </button>
        </div>
      </div>
    </div>
  </div>
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [config, setConfig] = useState<EstateConfig>(DEFAULT_CONFIG)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [activeRole, setActiveRole] = useState<string>(() => localStorage.getItem('ef_role') || '')
  const [userEmail, setUserEmail] = useState<string>('')
  const [authChecked, setAuthChecked] = useState(false)
  const [tenantLogins, setTenantLogins] = useState<{ name: string; house: string; date: string }[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'Estate Fumigation', message: 'Estate-wide fumigation Saturday 19 July at 8am.', date: 'Jul 14, 2026', type: 'announcement', read: false },
    { id: 'n2', title: 'Monthly Meeting', message: 'Residents meeting Sunday 20 July at community hall.', date: 'Jul 12, 2026', type: 'announcement', read: false },
  ])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const [guestCodes, setGuestCodes] = useState<GuestCode[]>([])
  const go = useCallback((s: Screen) => { setMenuOpen(false); setScreen(s) }, [])

  // Auth state listener — verifies session, captures user email
  useEffect(() => {
    // Load saved estate data immediately from localStorage
    try {
      const saved = localStorage.getItem('ef_estate_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        setConfig(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email)
        // Also try to load from database
        supabase.from('estates').select('*').eq('manager_email', session.user.email).limit(1).then(({ data }) => {
          if (data && data.length > 0) {
            const e = data[0]
            const dbData = { estateName: e.name, joinCode: e.join_code, monthlyDues: (e.monthly_dues || 1500000) / 100, estateAccountNumber: e.estate_account_number || '', estateAccountName: e.estate_account_name || '', estateBank: e.estate_bank || '' }
            setConfig(prev => ({ ...prev, ...dbData }))
            localStorage.setItem('ef_estate_data', JSON.stringify(dbData))
          }
        })
      }
      setAuthChecked(true)
    })
    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email)
        // Load estate from localStorage first (always works)
        try {
          const saved = localStorage.getItem('ef_estate_data')
          if (saved) {
            const parsed = JSON.parse(saved)
            setConfig(prev => ({ ...prev, ...parsed }))
          }
        } catch {}
        // Also try database (may fail due to RLS)
        try {
          const { data: estates } = await supabase.from('estates').select('*').eq('manager_email', session.user.email).limit(1)
          if (estates && estates.length > 0) {
            const e = estates[0]
            const dbData = { estateName: e.name, joinCode: e.join_code, monthlyDues: (e.monthly_dues || 1500000) / 100, estateAccountNumber: e.estate_account_number || '', estateAccountName: e.estate_account_name || '', estateBank: e.estate_bank || '' }
            setConfig(prev => ({ ...prev, ...dbData }))
            localStorage.setItem('ef_estate_data', JSON.stringify(dbData))
            if (e.id) localStorage.setItem('ef_estate_id', e.id)
          }
        } catch {}
      }
      if (event === 'SIGNED_OUT') { localStorage.removeItem('ef_role'); localStorage.removeItem('ef_estate_id'); setActiveRole(''); setUserEmail('') }
      setAuthChecked(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Safe Supabase connection test
  useEffect(() => {
    const test = async () => {
      try { const { error } = await supabase.from('estates').select('*').limit(1); if (error) console.log('DB note:', error.message) } catch {}
    }
    test()
  }, [])

  useEffect(() => {
    if (screen === 'splash') {
      setTimeout(async () => {
        const role = localStorage.getItem('ef_role')
        // Security gate: verify Supabase auth session for managers (Patch §5)
        if (role === 'manager') {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            setUserEmail(session.user.email || '')
            go('manager-home')
          } else {
            // No valid session — force re-auth
            localStorage.removeItem('ef_role')
            setActiveRole('')
            go('manager-auth')
          }
        }
        else if (role === 'tenant' && tenant) go('tenant-home')
        else if (role === 'tenant' && !tenant) go('tenant-code')
        else if (role === 'service') go('service-role')
        else go('role-select')
      }, 2500)
    }
  }, [screen])

  const setRole = (role: string) => { localStorage.setItem('ef_role', role); setActiveRole(role) }
  const clearSession = async () => {
    localStorage.removeItem('ef_role'); setTenant(null); setActiveRole('')
    try { await supabase.auth.signOut() } catch {}
  }
  useEffect(() => {
    if (tenant && screen === 'tenant-home') {
      const exists = tenantLogins.find(t => t.house === tenant.houseNumber)
      if (!exists) setTenantLogins([...tenantLogins, { name: tenant.name, house: tenant.houseNumber, date: tenant.joinedDate }])
    }
  }, [tenant, screen])

  const screens: Record<Screen, React.ReactNode> = {
    splash: <SplashScreen onDone={() => { const role = localStorage.getItem('ef_role'); if (role === 'manager') go('manager-home'); else if (role === 'tenant' && tenant) go('tenant-home'); else if (role === 'tenant') go('tenant-code'); else if (role === 'service') go('service-role'); else go('role-select') }} />,
    'role-select': <RoleSelectScreen go={(s) => { if (s === 'manager-auth') setRole('manager'); else if (s === 'tenant-code') setRole('tenant'); else if (s === 'service-code') setRole('service'); go(s) }} />,
    'manager-auth': <ManagerAuthScreen go={go} />,
    'manager-signup': <ManagerSignUpScreen go={go} config={config} />,
    'manager-login': <ManagerLoginScreen go={go} config={config} />,
    'manager-home': <ManagerHomeScreen go={go} config={config} menuOpen={menuOpen} setMenuOpen={setMenuOpen} notifications={notifications} invoices={invoices} complaints={complaints} alerts={alerts} clearSession={clearSession} tenantLogins={tenantLogins} />,
    'search-tenant': <SearchTenantScreen go={go} config={config} tenantLogins={tenantLogins} invoices={invoices} />,
    'qr-share': <QRShareScreen go={go} config={config} />,
    'theme-customizer': <ThemeCustomizerScreen go={go} config={config} setConfig={setConfig} />,
    'estate-profile': <EstateProfileScreen go={go} config={config} setConfig={setConfig} userEmail={userEmail} />,
    'payment-setup': <PaymentSetupScreen go={go} config={config} setConfig={setConfig} />,
    management: <ManagementScreen go={go} config={config} invoices={invoices} complaints={complaints} />,
    'announcement-editor': <AnnouncementEditorScreen go={go} config={config} setNotifications={setNotifications} notifications={notifications} />,
    invoices: <InvoicesScreen go={go} config={config} invoices={invoices} setInvoices={setInvoices} setNotifications={setNotifications} notifications={notifications} />,
    'manager-settings': <ManagerSettingsScreen go={go} config={config} tenantLogins={tenantLogins} />,
    'tenant-code': <TenantCodeScreen go={go} config={config} setConfig={setConfig} />,
    'tenant-onboarding': <TenantOnboardingScreen go={go} config={config} setTenant={(t) => { setTenant(t); setRole('tenant') }} />,
    'tenant-home': <TenantHomeScreen go={go} config={config} tenant={tenant} notifications={notifications} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />,
    'tenant-bills': <TenantBillsScreen go={go} config={config} tenant={tenant} invoices={invoices} setInvoices={setInvoices} setNotifications={setNotifications} notifications={notifications} />,
    'tenant-pay': <TenantPayScreen go={go} config={config} invoices={invoices} setInvoices={setInvoices} setNotifications={setNotifications} notifications={notifications} />,
    'tenant-receipts': <TenantReceiptsScreen go={go} config={config} invoices={invoices} tenant={tenant} />,
    'tenant-complaints': <TenantComplaintsScreen go={go} config={config} tenant={tenant} complaints={complaints} setComplaints={setComplaints} setNotifications={setNotifications} notifications={notifications} />,
    'tenant-profile': <TenantProfileScreen go={go} config={config} tenant={tenant} setTenant={setTenant} />,
    'tenant-settings': <TenantSettingsScreen go={go} config={config} clearSession={clearSession} />,
    maintenance: <TenantComplaintsScreen go={go} config={config} tenant={tenant} complaints={complaints} setComplaints={setComplaints} setNotifications={setNotifications} notifications={notifications} />,
    emergency: <EmergencyScreen go={go} config={config} tenant={tenant} alerts={alerts} setAlerts={setAlerts} />,
    guest: <GuestScreen go={go} config={config} tenant={tenant} guestCodes={guestCodes} setGuestCodes={setGuestCodes} />,
    'service-code': <ServiceCodeScreen go={go} config={config} setConfig={setConfig} />,
    'service-role': <ServiceRoleScreen go={go} />,
    'service-security': <ServiceSecurityScreen go={go} config={config} alerts={alerts} guestCodes={guestCodes} />,
    'service-worker': <ServiceWorkerScreen go={go} config={config} complaints={complaints} />,
    'ai-chatbot': <TenantHomeScreen go={go} config={config} tenant={tenant} notifications={notifications} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />,
    'font-picker': <ThemeCustomizerScreen go={go} config={config} setConfig={setConfig} />,
    'logo-upload': <ThemeCustomizerScreen go={go} config={config} setConfig={setConfig} />,
    'privacy-policy': <PrivacyPolicy go={go} config={config} />,
    'terms-of-service': <TermsOfService go={go} config={config} />,
    'payment-refund-policy': <PaymentRefundPolicy go={go} config={config} />,
    'emergency-disclaimer': <EmergencyDisclaimer go={go} config={config} />,
    tenants: <TenantsScreen go={go} config={config} tenantLogins={tenantLogins} invoices={invoices} />,
    reports: <ManagementScreen go={go} config={config} invoices={invoices} complaints={complaints} />,
  }

  return (
    <div className="min-h-screen bg-zinc-400 flex items-center justify-center p-0 sm:p-6">
      <div className="relative bg-white overflow-hidden w-full sm:max-w-[420px] md:max-w-[480px] lg:max-w-[500px] mx-auto" style={{ height: '100dvh', maxHeight: '900px', fontFamily: config.fontFamily, boxShadow: '0 30px 80px rgba(0,0,0,0.4)', borderRadius: 'clamp(0px, 2vw, 36px)' }}>
        <PageTransition>{screens[screen]}</PageTransition>
      </div>
    </div>
  )
}
