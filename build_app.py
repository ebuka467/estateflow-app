#!/usr/bin/env python3
"""Generate the full EstateFlow App.tsx"""
import os

PARTS = []

# ══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''import { useState, useEffect, useCallback } from 'react'

type Screen =
  | 'splash' | 'role-select'
  | 'manager-auth' | 'manager-signup' | 'manager-login' | 'manager-home'
  | 'qr-share' | 'theme-customizer' | 'estate-profile' | 'plan-select' | 'payment'
  | 'management' | 'announcement-editor' | 'invoices' | 'manager-settings'
  | 'tenant-code' | 'tenant-onboarding' | 'tenant-home' | 'tenant-bills'
  | 'tenant-pay' | 'tenant-receipts' | 'tenant-profile' | 'tenant-settings'
  | 'tenant-complaints' | 'maintenance' | 'emergency' | 'guest'
  | 'service-code' | 'service-role' | 'service-security' | 'service-worker'

type SubPlan = 'basic' | 'premium' | 'platinum'

interface EstateConfig {
  color: string
  fontFamily: string
  fontSize: number
  logoUrl: string
  bgImageUrl: string
  estateName: string
  joinCode: string
  subscription: SubPlan
  logoPosition: 'top-left' | 'top-right' | 'center' | 'bottom-right'
  enable3D: boolean
  enableAI: boolean
  isGoldBlackTheme: boolean
  monthlyDues: number
  appDues: number
  estateAccountNumber: string
  estateAccountName: string
  estateBank: string
  useEstatePictureForBg: boolean
  useEstateLogoFor3D: boolean
}

interface TenantInfo { name: string; houseNumber: string; avatar: string; email: string; joinedDate: string }
interface Notification { id: string; title: string; message: string; date: string; type: 'announcement'|'payment'|'maintenance'|'emergency'|'complaint'; read: boolean }
interface Invoice { id: string; tenantName: string; houseNumber: string; amount: number; appDues: number; total: number; date: string; status: 'pending'|'verified'|'rejected'; verifiedBy?: string; verifiedDate?: string }
interface Announcement { id: string; title: string; body: string; date: string }
interface Complaint { id: string; tenantName: string; houseNumber: string; category: string; description: string; date: string; status: 'open'|'in-progress'|'resolved' }
interface EmergencyAlert { id: string; type: string; houseNumber: string; tenantName: string; date: string; location: string; status: 'active'|'responded' }
interface GuestCode { code: string; type: string; name: string; house: string; date: string }

const DEFAULT_CONFIG: EstateConfig = {
  color: '#1B873F', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16,
  logoUrl: '', bgImageUrl: '', estateName: 'Greenview Estate', joinCode: 'EF-4829-GVE',
  subscription: 'basic', logoPosition: 'top-left', enable3D: false, enableAI: false,
  isGoldBlackTheme: false, monthlyDues: 15000, appDues: 1500,
  estateAccountNumber: '0123456789', estateAccountName: 'Greenview Estate Mgt',
  estateBank: 'GTBank', useEstatePictureForBg: false, useEstateLogoFor3D: false,
}

const APT_PHOTO = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=1200&fit=crop&auto=format'
const AVATARS = ['','','','','','','','','','']
const BANKS = ['GTBank', 'Access Bank', 'First Bank', 'UBA', 'Zenith', 'Fidelity', 'Sterling', 'Wema', 'Union']

const PLANS = [
  { id: 'basic' as SubPlan, name: 'Basic', monthly: 2500, annual: 25000, color: '#6b7280', features: ['Up to 50 units', '7 color themes', 'Theme background', 'Standard font', 'Announcements', 'Basic QR'] },
  { id: 'premium' as SubPlan, name: 'Premium', monthly: 5000, annual: 50000, color: '#2563eb', features: ['Up to 200 units', '12 color themes', 'Logo positioning', '5 premium fonts', 'Custom uploads', 'Maintenance QR', '3D model (semi-transparent)'] },
  { id: 'platinum' as SubPlan, name: 'Platinum', monthly: 12000, annual: 115000, color: '#d97706', features: ['Unlimited units', '14 color themes', 'Gold & Black luxury', 'Liquid glass fonts', '3D estate model with logo', 'AI auto-verify payments', 'Smart 10% service charge', 'Emergency alerts', 'Priority support'] },
]

function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full" style={{ animation: 'slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>{children}</div>
}

function PageBack({ onClick, light = false }: { onClick: () => void; light?: boolean }) {
  return <button onClick={onClick} className={"active:opacity-60 flex items-center gap-1 " + (light ? 'text-white' : 'text-black')}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
    <span className="text-sm font-semibold">Back</span>
  </button>
}

function HouseIcon({ stroke = 'white', size = 40 }: { stroke?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 100 90" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 46 L50 10 L88 46" /><path d="M20 46 L20 82 L80 82 L80 46" />
    <path d="M40 82 L40 58 L60 58 L60 82" /><rect x="24" y="54" width="12" height="12" /><rect x="64" y="54" width="12" height="12" />
  </svg>
}

function Field({ placeholder, type = 'text', value, onChange }: { placeholder: string; type?: string; value: string; onChange: (v: string) => void }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
    className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none focus:border-green-600 transition-all shadow-sm" />
}

function ThemedBtn({ children, onClick, color, className = '', disabled = false }: { children: React.ReactNode; onClick: () => void; color: string; className?: string; disabled?: boolean }) {
  const opacClass = disabled ? 'opacity-50' : ''
  return <button onClick={onClick} disabled={disabled}
    className={"w-full py-4 px-5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] " + opacClass + " " + className}
    style={{ backgroundColor: disabled ? '#d1d5db' : color }}>{children}</button>
}

function WhiteBtn({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return <button onClick={onClick} className={"w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-base flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98] " + className}>{children}</button>
}

function SplitBg({ children, color = '#1B873F', bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  return <div className="relative h-full overflow-hidden">
    <div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: color }} /><div className="h-1/2" style={{ backgroundImage: "url(" + (bg || APT_PHOTO) + ")", backgroundSize: 'cover', backgroundPosition: 'center' }} /></div>
    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
    <div className="relative z-10 h-full flex flex-col" style={{ animation: 'fade-up 0.4s ease both' }}>{children}</div>
  </div>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const steps = [15, 35, 60, 80, 100]; let i = 0
    const tick = () => { if (i < steps.length) { setProgress(steps[i++]); setTimeout(tick, 380) } else setTimeout(onDone, 300) }
    setTimeout(tick, 300)
  }, [onDone])
  const paths = [
    { d: 'M12 46 L50 10 L88 46', len: 98, delay: 0.1 }, { d: 'M20 46 L20 82', len: 36, delay: 0.65 },
    { d: 'M80 46 L80 82', len: 36, delay: 0.7 }, { d: 'M20 82 L80 82', len: 60, delay: 0.95 },
    { d: 'M40 82 L40 58 L60 58 L60 82', len: 64, delay: 1.2 },
    { d: 'M24 54 L36 54 L36 66 L24 66 Z', len: 48, delay: 1.5 }, { d: 'M64 54 L76 54 L76 66 L64 66 Z', len: 48, delay: 1.6 },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white gap-8">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-44 h-44 rounded-full" style={{ backgroundColor: '#1B873F15', animation: 'pulse-ring 2.2s ease-out infinite' }} />
        <div className="absolute rounded-full" style={{ width: 136, height: 136, backgroundColor: '#1B873F10', animation: 'pulse-ring 2.2s ease-out 0.6s infinite' }} />
        <div className="w-28 h-28"><svg viewBox="0 0 100 90" fill="none" className="w-full h-full">
          {paths.map((p, i) => (<path key={i} d={p.d} stroke="#1B873F" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: p.len, strokeDashoffset: p.len, animation: "draw-path 0.5s ease " + p.delay + "s forwards" }} />))}
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

function RoleSelectScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: '#1B873F' }} /><div className="h-1/2" style={{ backgroundImage: "url(" + APT_PHOTO + ")", backgroundSize: 'cover', backgroundPosition: 'center' }} /></div>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 gap-4" style={{ animation: 'fade-up 0.5s ease both' }}>
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"><HouseIcon stroke="white" size={36} /></div>
          <h1 className="text-4xl font-black text-white tracking-tight">EstateFlow</h1><p className="text-white/70 text-sm font-medium">Select your role</p>
        </div>
        {[{ label: 'Estate Manager', icon: '', screen: 'manager-auth' as Screen }, { label: 'Tenant', icon: '', screen: 'tenant-code' as Screen }, { label: 'Service Staff', icon: '🔧', screen: 'service-code' as Screen }].map((btn) => (
          <button key={btn.label} onClick={() => go(btn.screen)} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-base flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all hover:shadow-xl">
            <span className="text-xl">{btn.icon}</span>{btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ManagerAuthScreen({ go }: { go: (s: Screen) => void }) {
  return <SplitBg><div className="px-8 flex flex-col h-full">
    <div className="pt-14 pb-5"><button onClick={() => go('role-select')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
    <h2 className="text-3xl font-black text-white mb-1">Estate Manager</h2><p className="text-white/70 text-sm mb-8">Choose how to continue</p>
    <div className="flex flex-col gap-3">
      <WhiteBtn onClick={() => go('manager-home')}><svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Sign in with Google</WhiteBtn>
      <WhiteBtn onClick={() => go('manager-signup')}>Sign Up</WhiteBtn><WhiteBtn onClick={() => go('manager-login')}>Log In</WhiteBtn>
    </div></div></SplitBg>
}

function ManagerSignUpScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const [f, setF] = useState({ name: '', surname: '', phone: '', email: '', pw: '' })
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  return <SplitBg color={config.color} bg={config.bgImageUrl}><div className="px-8 flex flex-col h-full">
    <div className="pt-14 pb-4"><button onClick={() => go('manager-auth')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
    <h2 className="text-3xl font-black text-white mb-1">Create Account</h2><p className="text-white/70 text-sm mb-6">Fill in your details</p>
    <div className="flex flex-col gap-3 overflow-y-auto pb-8">
      <Field placeholder="First Name" value={f.name} onChange={set('name')} /><Field placeholder="Surname" value={f.surname} onChange={set('surname')} />
      <Field placeholder="Phone Number" type="tel" value={f.phone} onChange={set('phone')} /><Field placeholder="Email Address" type="email" value={f.email} onChange={set('email')} />
      <Field placeholder="Password" type="password" value={f.pw} onChange={set('pw')} />
      <ThemedBtn onClick={() => go('manager-home')} color={config.color} className="mt-2">Create Account →</ThemedBtn>
    </div></div></SplitBg>
}

function ManagerLoginScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  return <SplitBg color={config.color} bg={config.bgImageUrl}><div className="px-8 flex flex-col h-full">
    <div className="pt-14 pb-4"><button onClick={() => go('manager-auth')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
    <h2 className="text-3xl font-black text-white mb-1">Welcome Back</h2><p className="text-white/70 text-sm mb-8">Sign in to continue</p>
    <div className="flex flex-col gap-3"><Field placeholder="Email Address" type="email" value={email} onChange={setEmail} /><Field placeholder="Password" type="password" value={pw} onChange={setPw} />
      <ThemedBtn onClick={() => go('manager-home')} color={config.color} className="mt-2">Log In →</ThemedBtn>
    </div></div></SplitBg>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function EstateProfileScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [form, setForm] = useState({ name: config.estateName, location: '', size: '', occupants: '', dues: '15000', accountNum: config.estateAccountNumber, accountName: config.estateAccountName, bank: config.estateBank, picUrl: '' })
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v })
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Estate Profile</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 pb-8">
      <Field placeholder="Name of Estate" value={form.name} onChange={set('name')} /><Field placeholder="Location / Address" value={form.location} onChange={set('location')} />
      <Field placeholder="Size of Estate" value={form.size} onChange={set('size')} /><Field placeholder="Number of Occupants" value={form.occupants} onChange={set('occupants')} />
      <Field placeholder="Monthly Estate Dues (₦)" type="number" value={form.dues} onChange={set('dues')} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-2">
        <p className="text-xs text-blue-800 font-bold mb-2">💳 Estate Bank Account (for Paystack split payments)</p>
        <p className="text-xs text-blue-700 mb-2">Estate dues → this account. 10% app service charge → EstateFlow.</p>
        <Field placeholder="Account Number" value={form.accountNum} onChange={set('accountNum')} /><div className="h-2" />
        <Field placeholder="Account Name" value={form.accountName} onChange={set('accountName')} /><div className="h-2" />
        <select value={form.bank} onChange={(e) => set('bank')(e.target.value)} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black outline-none">
          <option value="">Select Bank</option>{BANKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mt-2">
        <p className="text-xs text-purple-800 font-bold mb-2">🖼️ Estate Picture (for background & 3D)</p>
        <Field placeholder="Estate picture URL (optional)" value={form.picUrl} onChange={set('picUrl')} />
        <p className="text-xs text-purple-700 mt-1">Use as main background and/or Platinum 3D rotating model</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">App dues auto-calculated as 10% of estate dues</p>
      <ThemedBtn onClick={() => { const dues = parseInt(form.dues) || 15000; setConfig({ ...config, estateName: form.name || config.estateName, monthlyDues: dues, appDues: Math.round(dues * 0.10), estateAccountNumber: form.accountNum, estateAccountName: form.accountName, estateBank: form.bank, bgImageUrl: form.picUrl || '', logoUrl: form.picUrl || '' }); go('plan-select') }} color={config.color} className="mt-2">Next — Choose Plan →</ThemedBtn>
    </div>
  </div>
}

function PlanSelectScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [selected, setSelected] = useState<SubPlan | null>(null); const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('estate-profile')} /><h2 className="font-black text-xl">Choose Your Plan</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-8 flex flex-col gap-4">
      <div className="flex bg-gray-200 rounded-xl p-1 gap-1">{(['monthly', 'annual'] as const).map((b) => (<button key={b} onClick={() => setBilling(b)} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all" style={{ backgroundColor: billing === b ? 'white' : 'transparent', color: billing === b ? '#111' : '#6b7280' }}>{b === 'monthly' ? 'Monthly' : 'Annual (Save 17%)'}</button>))}</div>
      {PLANS.map((plan) => (<button key={plan.id} onClick={() => setSelected(plan.id)} className="w-full bg-white rounded-2xl p-5 border-2 text-left transition-all active:scale-[0.98] shadow-sm" style={{ borderColor: selected === plan.id ? config.color : '#f3f4f6' }}>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} /><span className="font-black text-xl" style={{ color: plan.color }}>{plan.name}</span></div><div><span className="font-black text-2xl text-gray-900">{(billing === 'monthly' ? plan.monthly : plan.annual).toLocaleString()}</span><span className="text-gray-400 text-sm font-medium">/{billing === 'monthly' ? 'mo' : 'yr'}</span></div></div>
        <ul className="flex flex-col gap-1.5">{plan.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm text-gray-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B873F" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>{f}</li>))}</ul>
      </button>))}
      <ThemedBtn onClick={() => { if (selected) { setConfig({ ...config, subscription: selected, enable3D: selected !== 'basic', enableAI: selected === 'platinum' }); go('payment') } }} color={selected ? config.color : '#d1d5db'}>Continue to Payment →</ThemedBtn>
    </div>
  </div>
}

function PaymentScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const [method, setMethod] = useState<string | null>(null); const [processing, setProcessing] = useState(false); const [success, setSuccess] = useState(false); const [email, setEmail] = useState('')
  const plan = PLANS.find(p => p.id === config.subscription) || PLANS[0]; const totalAmount = plan.monthly + config.appDues
  const handlePay = () => { if (!method || !email.trim()) return; setProcessing(true); setTimeout(() => { setProcessing(false); setSuccess(true) }, 2500) }
  if (success) return <div className="flex flex-col h-full items-center justify-center px-8 gap-6" style={{ backgroundColor: config.color + '12' }}>
    <div className="relative flex items-center justify-center"><div className="absolute w-32 h-32 rounded-full bg-green-200/60" style={{ animation: 'pulse-ring 1.4s ease-out infinite' }} /><div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></div></div>
    <div className="text-center"><h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h3><p className="text-gray-500 text-sm">Your {config.subscription.toUpperCase()} plan is now active.</p></div>
    <ThemedBtn onClick={() => go('manager-home')} color={config.color}>Go to Dashboard →</ThemedBtn>
  </div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('plan-select')} /><h2 className="font-black text-xl">Payment</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Order Summary</p>
        <div className="flex justify-between mb-2"><span className="font-bold">{plan.name} Plan</span><span className="font-black">₦{plan.monthly.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">App Dues (10%)</span><span className="font-bold text-green-600">{config.appDues.toLocaleString()}</span></div>
        <div className="border-t my-3" /><div className="flex justify-between"><span className="font-black">Total</span><span className="font-black text-xl" style={{ color: config.color }}>{totalAmount.toLocaleString()}</span></div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3"><p className="text-xs text-blue-800 font-bold mb-1">💳 Paystack Split Payment</p><p className="text-xs text-blue-700">Estate dues → {config.estateAccountName} ({config.estateAccountNumber})</p><p className="text-xs text-blue-700">App service charge (10%) → EstateFlow account</p></div>
      <Field placeholder="Receipt Email" type="email" value={email} onChange={setEmail} />
      <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Payment Method</p><div className="flex flex-col gap-3">
        {[{ id: 'card', label: 'Card', icon: '💳', desc: 'Visa, Mastercard, Verve' }, { id: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'GTBank, Access, etc.' }, { id: 'ussd', label: 'USSD', icon: '📱', desc: '*737#, *901#' }, { id: 'paystack', label: 'Paystack', icon: '🔒', desc: 'Secure checkout' }].map((m) => (
          <button key={m.id} onClick={() => setMethod(m.id)} className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-[0.98]" style={{ borderColor: method === m.id ? config.color : '#e5e7eb', backgroundColor: method === m.id ? config.color + '08' : 'white' }}>
            <span className="text-2xl">{m.icon}</span><div className="text-left flex-1"><p className="font-bold text-sm">{m.label}</p><p className="text-gray-400 text-xs">{m.desc}</p></div>
            {method === m.id && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
          </button>
        ))}
      </div></div>
      <ThemedBtn onClick={handlePay} color={method && email.trim() ? config.color : '#d1d5db'} className={(!method || !email.trim()) ? 'opacity-50' : ''}>{processing ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : "Pay ₦" + totalAmount.toLocaleString() + " →"}</ThemedBtn>
    </div>
  </div>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function House3DOverlay({ config }: { config: EstateConfig }) {
  if (!config.enable3D) return null
  const opacity = config.subscription === 'platinum' ? 0.4 : 0.18; const color = config.isGoldBlackTheme ? '#d4af37' : config.color
  const useLogo = config.useEstateLogoFor3D && config.logoUrl
  return <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 flex justify-center" style={{ height: '45%' }}>
    <div style={{ perspective: '600px', width: '180px', height: '180px', animation: 'rise-up 2s ease-out forwards' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', animation: 'rotate3d 20s linear infinite', opacity }}>
        <div style={{ position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px', background: "linear-gradient(135deg, " + color + ", " + color + "99)", border: "2px solid " + color, borderRadius: '12px', transform: 'translateZ(80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {useLogo ? <img src={config.logoUrl} alt="estate" className="w-full h-full object-cover" style={{ borderRadius: '10px' }} /> : <svg width="100" height="90" viewBox="0 0 100 90" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 46 L50 10 L88 46" /><path d="M20 46 L20 82 L80 82 L80 46" /><path d="M40 82 L40 58 L60 58 L60 82" /></svg>}
        </div>
        <div style={{ position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px', background: color + "88", border: "2px solid " + color, borderRadius: '12px', transform: 'rotateY(180deg) translateZ(80px)' }} />
        <div style={{ position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px', background: color + "66", border: "2px solid " + color, borderRadius: '12px', transform: 'rotateY(-90deg) translateZ(80px)' }} />
        <div style={{ position: 'absolute', width: '160px', height: '160px', left: '10px', top: '10px', background: color + "66", border: "2px solid " + color, borderRadius: '12px', transform: 'rotateY(90deg) translateZ(80px)' }} />
      </div>
    </div>
  </div>
}

function ManagerHomeScreen({ go, config, menuOpen, setMenuOpen, notifications, invoices, setInvoices, clearSession }: { go: (s: Screen) => void; config: EstateConfig; menuOpen: boolean; setMenuOpen: (v: boolean) => void; notifications: Notification[]; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; clearSession: () => void }) {
  const isGB = config.isGoldBlackTheme && config.subscription === 'platinum'; const bgColor = isGB ? '#000000' : (config.color + '18'); const cardBg = isGB ? '#1a1a1a' : 'white'
  const textP = isGB ? '#d4af37' : '#111827'; const textS = isGB ? '#f4e4a0' : '#6b7280'; const borderColor = isGB ? '#d4af3733' : '#f3f4f6'
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length
  return <div className="flex flex-col h-full relative" style={{ backgroundColor: bgColor }}>
    <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b relative z-10" style={{ backgroundColor: isGB ? '#000000' : 'white', borderColor: isGB ? '#d4af3733' : '#f3f4f6' }}>
      <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] p-1"><span className={"block w-6 h-[2.5px] rounded-full " + (isGB ? 'bg-yellow-500' : 'bg-black')} /><span className={"block w-6 h-[2.5px] rounded-full " + (isGB ? 'bg-yellow-500' : 'bg-black')} /><span className={"block w-6 h-[2.5px] rounded-full " + (isGB ? 'bg-yellow-500' : 'bg-black')} /></button>
      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><HouseIcon stroke="white" size={20} /></div><span className="font-bold text-base" style={{ fontFamily: config.fontFamily, color: textP }}>{config.estateName}</span></div>
      <div className="relative" onClick={() => go('invoices')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isGB ? '#d4af37' : 'black'} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>{pendingInvoices > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{pendingInvoices}</span>}</div>
    </div>
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-32 relative z-10">
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: isGB ? 'linear-gradient(135deg, #1a1a1a, #333)' : "linear-gradient(135deg, " + config.color + ", " + config.color + "bb)" }}><p className="text-white/80 text-sm font-medium mb-0.5">Good morning</p><h3 className="text-xl font-black mb-1">{config.estateName}</h3><p className="text-white/70 text-xs">{config.subscription.toUpperCase()} · ₦{config.monthlyDues.toLocaleString()}/mo · App: ₦{config.appDues.toLocaleString()}</p></div>
      <div className="grid grid-cols-3 gap-3 mb-5">{[{ label: 'Paid', value: invoices.filter(i => i.status === 'verified').length.toString(), c: '#1B873F' }, { label: 'Pending', value: pendingInvoices.toString(), c: '#f59e0b' }, { label: 'Units', value: '120', c: isGB ? '#d4af37' : '#2563eb' }].map((s) => (<div key={s.label} className="rounded-2xl p-3 text-center shadow-sm" style={{ backgroundColor: cardBg, border: "1px solid " + borderColor }}><p className="text-2xl font-black" style={{ color: s.c }}>{s.value}</p><p className="text-xs font-medium mt-0.5" style={{ color: textS }}>{s.label}</p></div>))}</div>
      <div className="grid grid-cols-2 gap-3 mb-5">{[{ label: 'Management', icon: '', s: 'management' as Screen }, { label: 'Announcement', icon: '', s: 'announcement-editor' as Screen }, { label: 'Invoices', icon: '🧾', s: 'invoices' as Screen }, { label: 'Customize', icon: '🎨', s: 'theme-customizer' as Screen }].map((a) => (<button key={a.label} onClick={() => go(a.s)} className="flex items-center gap-3 rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform text-left" style={{ backgroundColor: cardBg, border: "1px solid " + borderColor }}><span className="text-xl">{a.icon}</span><span className="font-bold text-sm" style={{ color: textP }}>{a.label}</span></button>))}</div>
      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: textS }}>Quick Actions</p>
      <div className="grid grid-cols-3 gap-3">{[{ label: 'QR Share', icon: '📱', s: 'qr-share' as Screen }, { label: 'Settings', icon: '⚙️', s: 'manager-settings' as Screen }, { label: 'Estate Profile', icon: '🏢', s: 'estate-profile' as Screen }].map((a) => (<button key={a.label} onClick={() => go(a.s)} className="flex flex-col items-center gap-2 py-4 rounded-2xl shadow-sm active:scale-[0.98] transition-transform" style={{ backgroundColor: cardBg, border: "1px solid " + borderColor }}><span className="text-2xl">{a.icon}</span><span className="text-xs font-bold" style={{ color: textP }}>{a.label}</span></button>))}</div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-6 z-10"><div className="flex rounded-2xl overflow-visible shadow-xl" style={{ backgroundColor: isGB ? '#1a1a1a' : config.color }}>
      {[{ label: 'QR', icon: '', s: 'qr-share' as Screen, isCenter: true }, { label: 'Home', icon: '🏠', s: 'manager-home' as Screen }, { label: 'Invoices', icon: '🧾', s: 'invoices' as Screen }].map((item, i) => (<button key={i} onClick={() => go(item.s)} className="flex-1 py-3 flex flex-col items-center gap-1 transition-colors" style={item.isCenter ? { marginTop: -18 } : {}}>
        {item.isCenter ? (<div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg" style={{ border: "3px solid " + (isGB ? '#d4af37' : config.color) }}><span className="text-2xl">{item.icon}</span></div>) : (<span className="text-xl">{item.icon}</span>)}
        <span className="text-xs font-semibold" style={{ color: isGB ? '#d4af37' : 'rgba(255,255,255,0.9)' }}>{item.label}</span>
      </button>))}</div></div>
    {menuOpen && <div className="absolute inset-0 z-50 flex"><div className="w-3/4 h-full bg-white flex flex-col pt-16 px-6 pb-8 shadow-2xl" style={{ animation: 'slide-in-left 0.3s ease' }}>
      <div className="flex items-center gap-3 mb-8"><div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><HouseIcon stroke="white" size={24} /></div><div><p className="font-black text-gray-900">{config.estateName}</p><p className="text-gray-400 text-xs">Manager · {config.subscription.toUpperCase()}</p></div></div>
      <div className="flex flex-col gap-1 flex-1">{[{ label: 'Estate Profile', icon: '🏢', s: 'estate-profile' as Screen }, { label: 'Management', icon: '📊', s: 'management' as Screen }, { label: 'Announcements', icon: '📢', s: 'announcement-editor' as Screen }, { label: 'Invoices', icon: '🧾', s: 'invoices' as Screen }, { label: 'Settings', icon: '⚙️', s: 'manager-settings' as Screen }].map((item) => (<button key={item.label} onClick={() => { setMenuOpen(false); go(item.s) }} className="flex items-center gap-4 py-4 px-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-left"><span className="text-2xl">{item.icon}</span><span className="font-bold text-gray-800">{item.label}</span>{item.s === 'invoices' && pendingInvoices > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingInvoices}</span>}</button>))}</div>
      <button onClick={() => { setMenuOpen(false); clearSession(); go('role-select') }} className="flex items-center gap-3 py-3 px-4 rounded-xl text-red-500 font-bold mt-4">Sign Out</button>
    </div><div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} /></div>}
  </div>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function ManagementScreen({ go, config, invoices, complaints }: { go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; complaints: Complaint[] }) {
  const [activeTab, setActiveTab] = useState(0); const tabs = ['Dues Chart', 'Complaints', 'Spending']; const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  const verifiedCount = invoices.filter(i => i.status === 'verified').length
  const monthlyPaid = [12, 18, 25, 32, 45, 58, verifiedCount]; const monthlyUnpaid = [65, 55, 48, 40, 30, 20, Math.max(0, 80 - verifiedCount)]; const maxVal = Math.max(...monthlyPaid, ...monthlyUnpaid, 100)
  const complaintData = [complaints.filter(c => c.status === 'open').length, complaints.filter(c => c.status === 'in-progress').length, complaints.filter(c => c.status === 'resolved').length, 5, 3, 8, complaints.length]; const complaintMax = Math.max(...complaintData, 20)
  const spending = [450, 380, 520, 290, 610, 440, verifiedCount * 15]; const spendingMax = Math.max(...spending)
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Management</h2>{config.subscription === 'platinum' && <span className="ml-auto text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">PLATINUM</span>}</div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
      <div className="bg-gray-200 rounded-xl p-1 flex relative mb-5"><div className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 shadow-sm" style={{ width: 'calc(33.33% - 3px)', left: "calc(" + (activeTab * 33.33) + "% + 2px)", backgroundColor: config.color }} />{tabs.map((t, i) => (<button key={t} onClick={() => setActiveTab(i)} className="flex-1 py-2.5 text-sm font-bold relative z-10 rounded-lg transition-colors" style={{ color: activeTab === i ? 'white' : '#6b7280' }}>{t}</button>))}</div>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5"><p className="font-bold text-gray-700 text-sm mb-4">{activeTab === 0 ? "Monthly Dues (Paid: " + verifiedCount + ")" : activeTab === 1 ? "Complaints (" + complaints.length + " total)" : 'Monthly Spending (₦000s)'}</p>
        <div className="flex items-end gap-2" style={{ height: 140 }}>{(activeTab === 0 ? monthlyPaid : activeTab === 1 ? complaintData : spending).map((v, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t-sm transition-all" style={{ height: ((v / (activeTab === 0 ? maxVal : activeTab === 1 ? complaintMax : spendingMax)) * 110) + 'px', backgroundColor: activeTab === 0 ? config.color : activeTab === 1 ? '#f59e0b' : '#7c3aed' }} /><span className="text-xs text-gray-400 font-medium">{months[i]}</span></div>))}</div>
        {activeTab === 0 && <div className="flex gap-4 mt-3"><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: config.color }} /><span className="text-xs text-gray-500">Paid</span></div><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-300" /><span className="text-xs text-gray-500">Unpaid</span></div></div>}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p><div className="flex flex-col gap-3">
        <button onClick={() => go('announcement-editor')} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-transform shadow-sm" style={{ backgroundColor: config.color }}><span className="text-2xl">📢</span><div className="text-left"><p className="text-sm">Send Announcement</p><p className="text-xs opacity-70">Goes to all tenant home screens</p></div></button>
        <button onClick={() => go('invoices')} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-transform shadow-sm" style={{ backgroundColor: config.color }}><span className="text-2xl">🧾</span><div className="text-left"><p className="text-sm">Invoices & Payments</p><p className="text-xs opacity-70">{invoices.filter(i => i.status === 'pending').length + " pending verification"}</p></div></button>
        <button onClick={() => go('manager-settings')} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-800 bg-white active:scale-[0.98] transition-transform shadow-sm border-2 border-gray-200"><span className="text-2xl">⚙️</span><div className="text-left"><p className="text-sm">Settings</p><p className="text-xs text-gray-500">Sounds, permissions & logins</p></div></button>
      </div>
    </div>
  </div>
}

function AnnouncementEditorScreen({ go, config, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [sent, setSent] = useState(false)
  const handleSend = () => { if (!title.trim() || !body.trim()) return; const notif: Notification = { id: "n" + Date.now(), title: title.trim(), message: body.trim(), date: new Date().toLocaleDateString(), type: 'announcement', read: false }; setNotifications([notif, ...notifications]); setTitle(''); setBody(''); setSent(true); setTimeout(() => setSent(false), 2000) }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Announcements</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">{!sent ? <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3"><p className="text-xs text-blue-800 font-bold">📬 Announcements go to all tenants</p><p className="text-xs text-blue-700 mt-1">When sent, appears on tenant home screen notification area.</p></div>
      <button onClick={handleSend} disabled={!title.trim() || !body.trim()} className="w-full py-32 rounded-3xl font-bold text-white text-xl active:scale-[0.98] transition-transform shadow-lg flex flex-col items-center justify-center gap-3" style={{ backgroundColor: (title.trim() && body.trim()) ? config.color : '#d1d5db', opacity: (title.trim() && body.trim()) ? 0.85 : 1 }}><span className="text-5xl">📢</span><span>{title.trim() ? 'Send Announcement' : 'Tap to Start'}</span></button>
      <div className="flex flex-col gap-3"><Field placeholder="Announcement Title" value={title} onChange={setTitle} /><textarea placeholder="Write your announcement here..." value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none resize-none shadow-sm" />
        <div className="grid grid-cols-2 gap-3"><button className="py-3 bg-white rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-700 flex items-center justify-center gap-2">📷 Add Image</button><button className="py-3 bg-white rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-700 flex items-center justify-center gap-2">🎙️ Voice Note</button></div>
      </div></> : <div className="flex flex-col items-center justify-center flex-1 gap-4"><div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-xl"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div><h3 className="text-2xl font-black text-gray-900">Announcement Sent!</h3><p className="text-gray-500 text-sm text-center">All tenants have been notified.</p><ThemedBtn onClick={() => go('manager-home')} color={config.color}>Back to Home</ThemedBtn></div>}
    </div>
  </div>
}

function InvoicesScreen({ go, config, invoices, setInvoices, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const isPlatinum = config.subscription === 'platinum'; const [filter, setFilter] = useState<'all'|'pending'|'verified'>('all')
  const verifyInvoice = (id: string, byAI = false) => { const updated = invoices.map(inv => inv.id === id ? { ...inv, status: 'verified' as const, verifiedBy: byAI ? 'AI Assistant' : config.estateName, verifiedDate: new Date().toLocaleDateString() } : inv); setInvoices(updated); const inv = invoices.find(i => i.id === id); if (inv) setNotifications([{ id: "n" + Date.now(), title: 'Payment Verified ✅', message: "Your payment of ₦" + inv.total.toLocaleString() + " for " + inv.houseNumber + " has been verified.", date: new Date().toLocaleDateString(), type: 'payment', read: false }, ...notifications]) }
  const rejectInvoice = (id: string) => setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'rejected' as const } : inv))
  const aiVerifyAll = () => { if (!isPlatinum) return; invoices.filter(i => i.status === 'pending').forEach(inv => verifyInvoice(inv.id, true)) }
  const filtered = invoices.filter(i => filter === 'all' || i.status === filter); const pendingCount = invoices.filter(i => i.status === 'pending').length
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Invoices</h2>{pendingCount > 0 && <span className="ml-auto text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">{pendingCount + " pending"}</span>}</div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">{isPlatinum && pendingCount > 0 && <button onClick={aiVerifyAll} className="w-full py-3 rounded-xl font-bold text-black mb-4 active:scale-[0.98] transition-transform flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #d4af37, #f4e4a0)' }}>🤖 AI Auto-Verify All (" + pendingCount + ")</button>}
      <div className="flex bg-gray-200 rounded-xl p-1 gap-1 mb-4">{(['all', 'pending', 'verified'] as const).map((f) => (<button key={f} onClick={() => setFilter(f)} className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all" style={{ backgroundColor: filter === f ? 'white' : 'transparent', color: filter === f ? '#111' : '#6b7280' }}>{f}</button>))}</div>
      {filtered.length === 0 ? <div className="text-center py-16"><p className="text-5xl mb-3">📭</p><p className="font-bold text-gray-700">No invoices</p></div> : filtered.map((inv) => <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <div className="flex items-start justify-between mb-2"><div><p className="font-bold text-gray-900">{inv.tenantName}</p><p className="text-gray-400 text-xs">{inv.houseNumber} · {inv.date}</p></div><span className={"text-xs font-bold px-2.5 py-1 rounded-full " + (inv.status === 'verified' ? 'bg-green-100 text-green-700' : inv.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>{inv.status === 'verified' ? '✓ Verified' : inv.status === 'rejected' ? '✗ Rejected' : ' Pending'}</span></div>
        <div className="border-t pt-2 mt-2"><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Estate Dues</span><span className="font-bold">₦{inv.amount.toLocaleString()}</span></div><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">App Dues (10%)</span><span className="font-bold text-green-600">₦{inv.appDues.toLocaleString()}</span></div><div className="flex justify-between text-sm font-black text-base border-t pt-2 mt-2"><span>Total</span><span style={{ color: config.color }}>₦{inv.total.toLocaleString()}</span></div></div>
        {inv.status === 'pending' && <div className="flex gap-2 mt-3"><button onClick={() => verifyInvoice(inv.id)} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm active:scale-[0.98]" style={{ backgroundColor: '#1B873F' }}>✓ Verify</button><button onClick={() => rejectInvoice(inv.id)} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-red-500 active:scale-[0.98]">✗ Reject</button></div>}
        {inv.verifiedBy && <p className="text-xs text-gray-400 mt-2">Verified by {inv.verifiedBy} on {inv.verifiedDate}</p>}
      </div>)}
    </div>
  </div>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function ThemeCustomizerScreen({ go, config, setConfig }: { go: (s: Screen) => void; config: EstateConfig; setConfig: (c: EstateConfig) => void }) {
  const isBasic = config.subscription === 'basic'; const isPlatinum = config.subscription === 'platinum'
  const colors = isBasic ? ['#1B873F', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777'] : isPlatinum ? ['#1B873F', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1', '#d4af37', '#000000'] : ['#1B873F', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1']
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '18' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Theme</h2><span className="ml-auto text-xs font-bold bg-gray-100 px-2 py-1 rounded-full uppercase">{config.subscription}</span></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
      <div className={"rounded-2xl p-4 text-white " + (isPlatinum ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-blue-600 to-blue-400')}><p className="text-xs font-bold uppercase opacity-80">Current Plan</p><p className="text-2xl font-black">{config.subscription.toUpperCase()}</p><p className="text-xs mt-1">Theme color applies to the full page background!</p></div>
      <div><p className="font-bold text-gray-600 mb-3 text-xs uppercase tracking-widest">{"Theme Color (" + colors.length + " options)"}</p><div className="flex gap-3 flex-wrap">{colors.map((c) => (<button key={c} onClick={() => setConfig({ ...config, color: c, isGoldBlackTheme: false })} className="w-12 h-12 rounded-full transition-transform active:scale-90 shadow-sm" style={{ backgroundColor: c, boxShadow: (config.color === c && !config.isGoldBlackTheme) ? "0 0 0 3px white, 0 0 0 5px " + c : 'none' }} />))}</div></div>
      {isPlatinum && <div><p className="font-bold text-yellow-600 mb-3 text-xs uppercase tracking-widest">✨ Gold & Black Luxury</p><div className="grid grid-cols-2 gap-3"><button onClick={() => setConfig({ ...config, color: '#d4af37', isGoldBlackTheme: true })} className={"h-20 rounded-xl flex items-center justify-center font-bold shadow-lg " + (config.isGoldBlackTheme ? 'ring-4 ring-yellow-400' : '')} style={{ background: 'linear-gradient(135deg, #1a1a1a, #333)', border: '3px solid #d4af37' }}><span style={{ color: '#d4af37', fontFamily: 'Georgia' }}>Gold & Black</span></button><button onClick={() => setConfig({ ...config, color: '#f4e4a0', isGoldBlackTheme: false })} className="h-20 rounded-xl flex items-center justify-center font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #f4e4a0, #d4af37)', border: '3px solid #d4af37' }}><span style={{ color: '#1a1a1a', fontFamily: 'Georgia' }}>Liquid Glass</span></button></div></div>}
      <div><p className="font-bold text-gray-600 mb-3 text-xs uppercase tracking-widest">3D Background Model (Platinum)</p><div className="flex flex-col gap-2">
        <button onClick={() => setConfig({ ...config, useEstateLogoFor3D: false })} className={"p-4 rounded-xl border-2 text-left font-bold " + (!config.useEstateLogoFor3D ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white')}><p className="text-sm text-gray-900"> Default House Icon</p><p className="text-xs text-gray-500">Standard rotating house for 3D background</p></button>
        <button onClick={() => { if (config.logoUrl) setConfig({ ...config, useEstateLogoFor3D: true }) }} className={"p-4 rounded-xl border-2 text-left font-bold " + (config.useEstateLogoFor3D ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white') + " " + (!config.logoUrl ? 'opacity-50' : '')}><p className="text-sm text-gray-900">🖼️ Use Estate Logo</p><p className="text-xs text-gray-500">{config.logoUrl ? 'Use uploaded estate logo in 3D model' : 'Upload a logo first in Logo Upload'}</p></button>
      </div></div>
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: config.isGoldBlackTheme ? '#000' : config.color + '25' }}><p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: config.isGoldBlackTheme ? '#d4af37' : config.color }}>Live Preview</p><div className="h-20 rounded-xl flex items-center justify-center" style={{ backgroundColor: config.isGoldBlackTheme ? '#1a1a1a' : 'white', border: "2px solid " + (config.isGoldBlackTheme ? '#d4af37' : config.color) }}><span className="font-black text-lg" style={{ color: config.isGoldBlackTheme ? '#d4af37' : config.color }}>EstateFlow</span></div></div>
      <ThemedBtn onClick={() => go('manager-home')} color={config.color}>Apply Changes ✓</ThemedBtn>
    </div>
  </div>
}

function TenantCodeScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const [code, setCode] = useState(''); const [error, setError] = useState('')
  const handleJoin = () => { if (!code.trim()) { setError('Please enter a code'); return } if (code.trim().toUpperCase() !== config.joinCode.toUpperCase()) { setError('Invalid code'); return } go('tenant-onboarding') }
  return <div className="relative h-full overflow-hidden"><div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: config.color }} /><div className="h-1/2" style={{ backgroundImage: "url(" + (config.bgImageUrl || APT_PHOTO) + ")", backgroundSize: 'cover' }} /></div><div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
    <div className="relative z-10 h-full flex flex-col px-8"><div className="pt-14 pb-4"><button onClick={() => go('role-select')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div>
      <div className="flex-1 flex flex-col justify-center gap-5" style={{ animation: 'fade-up 0.5s ease both' }}>
        <div className="flex flex-col items-center gap-3"><div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><HouseIcon stroke="white" size={36} /></div><h2 className="text-3xl font-black text-white text-center">{config.estateName}</h2><p className="text-white/70 text-sm text-center">Enter the join code from your manager</p></div>
        <input type="text" placeholder={"Code (e.g. " + config.joinCode + ")"} value={code} onChange={(e) => { setCode(e.target.value); setError('') }} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-center text-lg tracking-widest outline-none shadow-sm" />
        {error && <div className="bg-red-500/30 rounded-xl px-4 py-3"><p className="text-white text-sm font-semibold">{error}</p></div>}
        <button onClick={handleJoin} className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98]" style={{ backgroundColor: config.color }}>Enter Estate →</button>
        <p className="text-white/50 text-xs text-center">Demo: try <strong className="text-white/80">{config.joinCode}</strong></p>
      </div>
    </div>
  </div>
}

function TenantOnboardingScreen({ go, config, setTenant }: { go: (s: Screen) => void; config: EstateConfig; setTenant: (t: TenantInfo) => void }) {
  const [name, setName] = useState(''); const [house, setHouse] = useState(''); const [avatar, setAvatar] = useState(''); const [email, setEmail] = useState('')
  const handleSave = () => { if (!name.trim() || !house.trim()) return; setTenant({ name: name.trim(), houseNumber: house.trim(), avatar, email: email.trim(), joinedDate: new Date().toLocaleDateString() }); go('tenant-home') }
  return <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: config.color + '15' }}>
    <House3DOverlay config={config} />
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 relative z-10"><PageBack onClick={() => go('tenant-code')} /><h2 className="font-black text-xl" style={{ fontFamily: config.fontFamily }}>{"Welcome to " + config.estateName}</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5 relative z-10">
      <div className="text-center"><p className="text-gray-500 text-sm">Set up your tenant profile</p></div>
      <div className="flex justify-center"><div className="flex gap-2 flex-wrap justify-center">{AVATARS.map((a) => (<button key={a} onClick={() => setAvatar(a)} className={"w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all bg-white " + (avatar === a ? 'ring-4 shadow-lg' : '')} style={{ borderColor: avatar === a ? config.color : 'transparent', borderWidth: avatar === a ? '3px' : '0' }}>{a}</button>))}</div></div>
      <Field placeholder="Your Full Name" value={name} onChange={setName} /><Field placeholder="House / Flat Number (e.g. Block B, Flat 7)" value={house} onChange={setHouse} /><Field placeholder="Email (optional)" type="email" value={email} onChange={setEmail} />
      <ThemedBtn onClick={handleSave} color={name.trim() && house.trim() ? config.color : '#d1d5db'} className={(name.trim() && house.trim()) ? '' : 'opacity-50'}>Save Profile →</ThemedBtn>
    </div>
  </div>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function TenantHomeScreen({ go, config, tenant, notifications, menuOpen, setMenuOpen }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; notifications: Notification[]; menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const isGB = config.isGoldBlackTheme && config.subscription === 'platinum'; const bgColor = isGB ? '#000000' : (config.color + '18'); const cardBg = isGB ? '#1a1a1a' : 'white'
  const textP = isGB ? '#d4af37' : '#111827'; const textS = isGB ? '#f4e4a0' : '#6b7280'; const unread = notifications.filter(n => !n.read).length
  return <div className="flex flex-col h-full relative" style={{ backgroundColor: bgColor }}>
    <House3DOverlay config={config} />
    <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b relative z-10" style={{ backgroundColor: isGB ? '#000000dd' : 'white', borderColor: isGB ? '#d4af3733' : '#f3f4f6' }}>
      <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] p-1"><span className={"block w-6 h-[2.5px] rounded-full " + (isGB ? 'bg-yellow-500' : 'bg-black')} /><span className={"block w-6 h-[2.5px] rounded-full " + (isGB ? 'bg-yellow-500' : 'bg-black')} /><span className={"block w-6 h-[2.5px] rounded-full " + (isGB ? 'bg-yellow-500' : 'bg-black')} /></button>
      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: config.color }}>{tenant?.avatar || '👤'}</div><span className="font-bold text-base" style={{ fontFamily: config.fontFamily, color: textP }}>{config.estateName}</span></div>
      <button onClick={() => go('tenant-settings')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isGB ? '#d4af37' : 'black'} strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg></button>
    </div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-28 relative z-10">
      {unread > 0 && <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">{unread}</div><div><p className="font-bold text-red-800 text-sm">{"You have " + unread + " new notification" + (unread > 1 ? 's' : '')}</p><p className="text-red-600 text-xs">Tap to view</p></div></div>}
      {notifications.length === 0 && <div className="text-center py-8 mb-4"><p className="text-4xl mb-2">📭</p><p className="text-gray-400 text-sm">No new notifications</p></div>}
      {notifications.slice(0, 5).map((n) => <div key={n.id} className="rounded-2xl p-4 shadow-sm mb-3" style={{ backgroundColor: cardBg, borderLeft: "4px solid " + (n.type === 'payment' ? '#1B873F' : n.type === 'emergency' ? '#ef4444' : n.type === 'complaint' ? '#f59e0b' : config.color) }}><p className="text-xs font-medium mb-1" style={{ color: textS }}>{n.date + " · " + n.type}</p><h5 className="font-bold text-sm mb-1" style={{ color: textP }}>{n.title}</h5><p className="text-xs" style={{ color: textS }}>{n.message}</p></div>)}
    </div>
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-6 z-10"><div className="flex rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: isGB ? '#1a1a1a' : config.color }}>
      {[{ label: 'Home', icon: '🏠', s: 'tenant-home' as Screen }, { label: 'Bills', icon: '💳', s: 'tenant-bills' as Screen }, { label: 'Complain', icon: '⚠️', s: 'tenant-complaints' as Screen }, { label: 'Emergency', icon: '🚨', s: 'emergency' as Screen }, { label: 'Guest', icon: '👥', s: 'guest' as Screen }].map((item, i) => (<button key={i} onClick={() => go(item.s)} className="flex-1 py-3 flex flex-col items-center gap-1 transition-colors"><span className="text-lg">{item.icon}</span><span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</span></button>))}</div></div>
    {menuOpen && <div className="absolute inset-0 z-50 flex"><div className="w-3/4 h-full bg-white flex flex-col pt-16 px-6 pb-8 shadow-2xl" style={{ animation: 'slide-in-left 0.3s ease' }}>
      <div className="flex items-center gap-3 mb-8"><div className="w-11 h-11 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: config.color }}>{tenant?.avatar || '👤'}</div><div><p className="font-black text-gray-900">{tenant?.name || 'Tenant'}</p><p className="text-gray-400 text-xs">{tenant?.houseNumber || 'Not set'}</p></div></div>
      <div className="flex flex-col gap-1 flex-1">{[{ label: 'My Profile', icon: '👤', s: 'tenant-profile' as Screen }, { label: 'Notifications', icon: '🔔', s: 'tenant-home' as Screen }, { label: 'Receipts', icon: '🧾', s: 'tenant-receipts' as Screen }, { label: 'Settings', icon: '⚙️', s: 'tenant-settings' as Screen }].map((item) => (<button key={item.label} onClick={() => { setMenuOpen(false); go(item.s) }} className="flex items-center gap-4 py-4 px-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-left"><span className="text-2xl">{item.icon}</span><span className="font-bold text-gray-800">{item.label}</span></button>))}</div>
      <button onClick={() => { setMenuOpen(false); go('role-select') }} className="flex items-center gap-3 py-3 px-4 rounded-xl text-red-500 font-bold mt-4">Sign Out</button>
    </div><div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} /></div>}
  </div>
}

function TenantBillsScreen({ go, config, tenant, invoices, setInvoices, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const total = config.monthlyDues + config.appDues; const myInvoices = invoices.filter(i => i.houseNumber === tenant?.houseNumber); const pending = myInvoices.find(i => i.status === 'pending')
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">My Bills</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-32">
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: "linear-gradient(135deg, " + config.color + ", " + config.color + "bb)" }}><p className="text-white/80 text-sm font-medium mb-1">Total Outstanding</p><p className="text-4xl font-black">{"₦" + total.toLocaleString()}</p><p className="text-white/70 text-xs mt-1">{(tenant?.houseNumber || '') + " · " + (tenant?.name || '')}</p></div>
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-3"><div className="flex justify-between mb-2"><span className="font-bold text-gray-700">Estate Dues</span><span className="font-black">{"₦" + config.monthlyDues.toLocaleString()}</span></div><div className="flex justify-between mb-2"><span className="font-bold text-gray-700">App Dues (10%)</span><span className="font-black text-green-600">{"₦" + config.appDues.toLocaleString()}</span></div><div className="border-t pt-2 flex justify-between"><span className="font-black">Total</span><span className="font-black text-xl" style={{ color: config.color }}>{"₦" + total.toLocaleString()}</span></div></div>
      {pending && <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-3"><p className="text-yellow-800 text-sm font-bold">⏳ Payment pending verification</p><p className="text-yellow-600 text-xs mt-1">Manager will verify your payment shortly.</p></div>}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Payment History</p>
      {myInvoices.filter(i => i.status === 'verified').length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No payments yet.</p> : myInvoices.filter(i => i.status === 'verified').map((inv) => <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3"><div className="flex justify-between mb-1"><span className="font-bold text-sm">{inv.date}</span><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Verified</span></div><p className="font-black text-gray-900">{"₦" + inv.total.toLocaleString()}</p></div>)}
    </div>
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-8 flex gap-3">
      <ThemedBtn onClick={() => { const newInv: Invoice = { id: "inv" + Date.now(), tenantName: tenant?.name || 'Tenant', houseNumber: tenant?.houseNumber || 'Unknown', amount: config.monthlyDues, appDues: config.appDues, total, date: new Date().toLocaleDateString(), status: 'pending' }; setInvoices([newInv, ...invoices]); go('tenant-pay') }} color={config.color}>{"Pay ₦" + total.toLocaleString()}</ThemedBtn>
      <button onClick={() => go('tenant-receipts')} className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 active:scale-[0.98]">Receipts</button>
    </div>
  </div>
}

function TenantPayScreen({ go, config, invoices, setInvoices, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; setInvoices: (i: Invoice[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const [processing, setProcessing] = useState(false); const [paid, setPaid] = useState(false); const pending = invoices.find(i => i.status === 'pending')
  const handlePay = () => { setProcessing(true); setTimeout(() => { setProcessing(false); setPaid(true); if (pending) { setInvoices(invoices.map(inv => inv.id === pending.id ? { ...inv, status: 'verified' as const, verifiedBy: 'Paystack', verifiedDate: new Date().toLocaleDateString() } : inv)); setNotifications([{ id: "n" + Date.now(), title: 'Payment Verified ✅', message: "Your payment of ₦" + pending.total.toLocaleString() + " has been verified via Paystack.", date: new Date().toLocaleDateString(), type: 'payment', read: false }, ...notifications]) } }, 2500) }
  if (paid) return <div className="flex flex-col h-full items-center justify-center px-8 gap-6" style={{ backgroundColor: config.color + '12' }}>
    <div className="relative flex items-center justify-center"><div className="absolute w-32 h-32 rounded-full bg-green-200/60" style={{ animation: 'pulse-ring 1.4s ease-out infinite' }} /><div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></div></div>
    <div className="text-center"><h3 className="text-2xl font-black text-gray-900 mb-2">Payment Verified!</h3><p className="text-gray-500 text-sm">Payment confirmed via Paystack.</p><p className="text-gray-400 text-xs mt-2">Receipt added to your history.</p></div>
    <ThemedBtn onClick={() => go('tenant-home')} color={config.color}>Back to Home</ThemedBtn>
  </div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-bills')} /><h2 className="font-black text-xl">Pay Bill</h2></div>
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}><span className="text-4xl">💳</span></div>
      <div className="text-center"><p className="text-gray-500 text-sm mb-1">Total Amount</p><p className="text-4xl font-black" style={{ color: config.color }}>{"₦" + (config.monthlyDues + config.appDues).toLocaleString()}</p><p className="text-gray-400 text-xs mt-2">{"Estate: ₦" + config.monthlyDues.toLocaleString() + " + App: ₦" + config.appDues.toLocaleString()}</p></div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 w-full"><p className="text-xs text-blue-800 font-bold">💳 Paystack Checkout</p><p className="text-xs text-blue-700">{"Estate dues → " + config.estateAccountName}</p><p className="text-xs text-blue-700">App charge → EstateFlow</p></div>
      <ThemedBtn onClick={handlePay} color={processing ? '#d1d5db' : config.color}>{processing ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : 'Confirm Payment via Paystack'}</ThemedBtn>
    </div>
  </div>
}

function TenantReceiptsScreen({ go, config, invoices, tenant }: { go: (s: Screen) => void; config: EstateConfig; invoices: Invoice[]; tenant: TenantInfo | null }) {
  const myReceipts = invoices.filter(i => i.houseNumber === tenant?.houseNumber && i.status === 'verified')
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-bills')} /><h2 className="font-black text-xl">Receipts</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5">{myReceipts.length === 0 ? <div className="text-center py-16"><p className="text-5xl mb-3">🧾</p><p className="font-bold text-gray-700">No receipts yet</p></div> : myReceipts.map((inv) => <div key={inv.id} className="bg-white rounded-2xl p-5 shadow-sm mb-3"><div className="flex justify-between mb-3"><span className="font-black text-gray-900">{"₦" + inv.total.toLocaleString()}</span><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Verified</span></div><div className="text-xs text-gray-500 space-y-1"><p>Date: {inv.date}</p><p>Verified by: {inv.verifiedBy}</p><p>Estate Dues: ₦{inv.amount.toLocaleString()} · App: ₦{inv.appDues.toLocaleString()}</p></div></div>)}</div>
  </div>
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
PARTS.append(r'''
function TenantComplaintsScreen({ go, config, tenant, complaints, setComplaints, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; complaints: Complaint[]; setComplaints: (c: Complaint[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const [selected, setSelected] = useState<string | null>(null); const [desc, setDesc] = useState(''); const [submitted, setSubmitted] = useState(false)
  const handleSubmit = () => { if (!selected || !desc.trim() || !tenant) return; setComplaints([{ id: "c" + Date.now(), tenantName: tenant.name, houseNumber: tenant.houseNumber, category: selected, description: desc.trim(), date: new Date().toLocaleDateString(), status: 'open' }, ...complaints]); setNotifications([{ id: "n" + Date.now(), title: 'Complaint Submitted', message: "Your " + selected + " complaint has been sent to the estate manager.", date: new Date().toLocaleDateString(), type: 'complaint', read: false }, ...notifications]); setDesc(''); setSelected(null); setSubmitted(true); setTimeout(() => setSubmitted(false), 2500) }
  if (submitted) return <div className="flex flex-col h-full items-center justify-center px-8 gap-5" style={{ backgroundColor: config.color + '12' }}><div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></div><h3 className="text-2xl font-black">Complaint Sent!</h3><p className="text-gray-500 text-sm text-center">Manager has been notified.</p><ThemedBtn onClick={() => go('tenant-home')} color={config.color}>Back to Home</ThemedBtn></div>
  const cats = [{ l: 'Plumbing', e: '🔧' }, { l: 'Electrical', e: '⚡' }, { l: 'Security', e: '🔒' }, { l: 'Cleaning', e: '🧹' }, { l: 'Water', e: '' }, { l: 'Other', e: '⚠️' }]
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Submit Complaint</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
      <p className="text-sm text-gray-500 mb-4">Select issue type:</p>
      <div className="grid grid-cols-3 gap-3 mb-5">{cats.map((c) => (<button key={c.l} onClick={() => setSelected(c.l)} className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 bg-white active:scale-[0.98]" style={{ borderColor: selected === c.l ? config.color : 'transparent', backgroundColor: selected === c.l ? config.color + '10' : 'white' }}><span className="text-2xl">{c.e}</span><span className="text-xs font-bold">{c.l}</span></button>))}</div>
      {selected && <div className="flex flex-col gap-3" style={{ animation: 'fade-up 0.3s ease both' }}><textarea placeholder={"Describe the " + selected + " issue..."} value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none resize-none shadow-sm" /><ThemedBtn onClick={handleSubmit} color={desc.trim() ? config.color : '#d1d5db'} className={desc.trim() ? '' : 'opacity-50'}>Submit Complaint</ThemedBtn></div>}
      {complaints.filter(c => c.houseNumber === tenant?.houseNumber).length > 0 && <div className="mt-6"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">My Complaints</p>{complaints.filter(c => c.houseNumber === tenant?.houseNumber).map((c) => <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm mb-2"><div className="flex justify-between mb-1"><span className="font-bold text-sm">{c.category}</span><span className={"text-xs font-bold px-2 py-0.5 rounded-full " + (c.status === 'open' ? 'bg-yellow-100 text-yellow-700' : c.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')}>{c.status}</span></div><p className="text-gray-500 text-xs">{c.description}</p><p className="text-gray-400 text-xs mt-1">{c.date}</p></div>)}</div>}
    </div>
  </div>
}

function TenantProfileScreen({ go, config, tenant, setTenant }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; setTenant: (t: TenantInfo) => void }) {
  const [name, setName] = useState(tenant?.name || ''); const [house, setHouse] = useState(tenant?.houseNumber || ''); const [avatar, setAvatar] = useState(tenant?.avatar || '👤'); const [saved, setSaved] = useState(false)
  const handleSave = () => { setTenant({ ...tenant!, name, houseNumber: house, avatar }); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Profile</h2><button onClick={handleSave} className="text-sm font-bold" style={{ color: config.color }}>{saved ? '✓ Saved' : 'Save'}</button></div>
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
      <div className="flex justify-center"><div className="flex gap-2 flex-wrap justify-center">{AVATARS.map((a) => (<button key={a} onClick={() => setAvatar(a)} className={"w-12 h-12 rounded-full text-2xl flex items-center justify-center bg-white " + (avatar === a ? 'ring-4' : '')} style={{ borderColor: avatar === a ? config.color : 'transparent', borderWidth: avatar === a ? '3px' : '0' }}>{a}</button>))}</div></div>
      <Field placeholder="Full Name" value={name} onChange={setName} /><Field placeholder="House / Flat Number" value={house} onChange={setHouse} />
      <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Estate Info</p><div className="text-sm text-gray-600 space-y-2"><div className="flex justify-between"><span>Estate</span><span className="font-bold">{config.estateName}</span></div><div className="flex justify-between"><span>Joined</span><span className="font-bold">{tenant?.joinedDate || 'Today'}</span></div><div className="flex justify-between"><span>Plan</span><span className="font-bold capitalize">{config.subscription}</span></div></div></div>
    </div>
  </div>
}

function TenantSettingsScreen({ go, config, clearSession }: { go: (s: Screen) => void; config: EstateConfig; clearSession: () => void }) {
  const [sound, setSound] = useState('default'); const [notifOn, setNotifOn] = useState(true)
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Settings</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">🔔 Notifications</p>
        <div className="flex items-center justify-between mb-3"><span className="font-bold text-gray-800">Enable Notifications</span><button onClick={() => setNotifOn(!notifOn)} className="w-12 h-7 rounded-full p-0.5 transition-colors" style={{ backgroundColor: notifOn ? '#1B873F' : '#d1d5db' }}><div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform" style={{ transform: notifOn ? 'translateX(20px)' : 'translateX(0)' }} /></button></div>
        <div className="flex items-center justify-between"><span className="font-bold text-gray-800">Notification Sound</span><select value={sound} onChange={(e) => setSound(e.target.value)} className="py-2 px-3 rounded-lg border border-gray-200 text-sm font-medium"><option value="default">Default</option><option value="chime">Chime</option><option value="bell">Bell</option><option value="ding">Ding</option><option value="none">None</option></select></div>
      </div>
      <button onClick={() => { clearSession(); go('role-select') }} className="w-full py-4 rounded-xl font-bold text-red-500 bg-red-50 active:scale-[0.98] transition-transform">🚪 Log Out of Estate</button>
    </div>
  </div>
}

function MaintenanceScreen({ go, config, tenant, complaints, setComplaints, setNotifications, notifications }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; complaints: Complaint[]; setComplaints: (c: Complaint[]) => void; setNotifications: (n: Notification[]) => void; notifications: Notification[] }) {
  const [selected, setSelected] = useState<string | null>(null); const [desc, setDesc] = useState(''); const [submitted, setSubmitted] = useState(false)
  const handleSubmit = () => { if (!selected || !desc.trim() || !tenant) return; setComplaints([{ id: "m" + Date.now(), tenantName: tenant.name, houseNumber: tenant.houseNumber, category: selected, description: desc.trim(), date: new Date().toLocaleDateString(), status: 'open' }, ...complaints]); setNotifications([{ id: "n" + Date.now(), title: 'Maintenance Request Sent', message: "Your " + selected + " request has been submitted.", date: new Date().toLocaleDateString(), type: 'maintenance', read: false }, ...notifications]); setDesc(''); setSelected(null); setSubmitted(true) }
  if (submitted) return <div className="flex flex-col h-full items-center justify-center px-8 gap-5" style={{ backgroundColor: config.color + '12' }}><div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></div><h3 className="text-2xl font-black">Request Sent!</h3><p className="text-gray-500 text-sm text-center">Your {selected} request has been sent.</p><ThemedBtn onClick={() => go('tenant-home')} color={config.color}>Back to Home</ThemedBtn></div>
  const cats = [{ l: 'Plumbing', e: '' }, { l: 'Electrical', e: '⚡' }, { l: 'Security', e: '🔒' }, { l: 'Cleaning', e: '🧹' }, { l: 'Water', e: '💧' }, { l: 'Other', e: '⚠️' }]
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Maintenance</h2></div>
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-8"><p className="text-sm text-gray-500 mb-4">Select issue type:</p><div className="grid grid-cols-3 gap-3 mb-5">{cats.map((c) => (<button key={c.l} onClick={() => setSelected(c.l)} className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 bg-white active:scale-[0.98]" style={{ borderColor: selected === c.l ? config.color : 'transparent', backgroundColor: selected === c.l ? config.color + '10' : 'white' }}><span className="text-2xl">{c.e}</span><span className="text-xs font-bold">{c.l}</span></button>))}</div>{selected && <div className="flex flex-col gap-3"><textarea placeholder={"Describe the " + selected + " issue..."} value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-semibold text-black placeholder-gray-400 text-base outline-none resize-none shadow-sm" /><ThemedBtn onClick={handleSubmit} color={desc.trim() ? config.color : '#d1d5db'} className={desc.trim() ? '' : 'opacity-50'}>Submit Request</ThemedBtn></div>}</div>
  </div>
}

function EmergencyScreen({ go, config, tenant, alerts, setAlerts }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; alerts: EmergencyAlert[]; setAlerts: (a: EmergencyAlert[]) => void }) {
  const [sent, setSent] = useState(false); const [alertType, setAlertType] = useState('')
  const types = [{ l: 'Fire', e: '🔥', c: '#ef4444' }, { l: 'Robbery', e: '🚨', c: '#f59e0b' }, { l: 'Medical', e: '🏥', c: '#3b82f6' }, { l: 'Gas Leak', e: '💨', c: '#8b5cf6' }]
  if (sent) return <div className="flex flex-col h-full items-center justify-center px-8 gap-6 bg-red-50"><div className="relative flex items-center justify-center"><div className="absolute w-36 h-36 rounded-full bg-red-200/60" style={{ animation: 'pulse-ring 1.4s ease-out infinite' }} /><div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-xl"><span className="text-3xl">🚨</span></div></div><h3 className="text-2xl font-black text-red-600">{alertType + " Alert Sent!"}</h3><p className="text-gray-600 text-sm text-center">{"Security notified at " + (tenant?.houseNumber || '') + "."}</p><ThemedBtn onClick={() => go('tenant-home')} color="#ef4444">Back to Home</ThemedBtn></div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}>
    <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Emergency</h2></div>
    <div className="flex-1 px-5 py-4 flex flex-col gap-4"><div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center"><p className="text-amber-800 text-sm font-bold">Only use in real emergencies</p><p className="text-amber-600 text-xs mt-0.5">{"Your address (" + (tenant?.houseNumber || '') + ") will be sent to security."}</p></div><p className="text-sm text-gray-500 text-center">Select emergency type:</p><div className="grid grid-cols-2 gap-3">{types.map((t) => (<button key={t.l} onClick={() => { setAlertType(t.l); setSent(true); setAlerts([{ id: "e" + Date.now(), type: t.l, houseNumber: tenant?.houseNumber || 'Unknown', tenantName: tenant?.name || 'Unknown', date: new Date().toLocaleString(), location: tenant?.houseNumber || '', status: 'active' }, ...alerts]) }} className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-white shadow-sm active:scale-[0.98]"><span className="text-3xl">{t.e}</span><span className="font-bold text-sm" style={{ color: t.c }}>{t.l}</span></button>))}</div></div>
  </div>
}

function GuestScreen({ go, config, tenant, guestCodes, setGuestCodes }: { go: (s: Screen) => void; config: EstateConfig; tenant: TenantInfo | null; guestCodes: GuestCode[]; setGuestCodes: (g: GuestCode[]) => void }) {
  const [step, setStep] = useState<'choose'|'details'|'code'>('choose'); const [guestType, setGuestType] = useState<string | null>(null); const [guestName, setGuestName] = useState(''); const [code, setCode] = useState('')
  const types = [{ l: 'Delivery', e: '📦' }, { l: 'Uber/Food', e: '' }, { l: 'Visitor', e: '👤' }]
  if (step === 'code') return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => setStep('details')} /><h2 className="font-black text-xl">Access Code</h2></div><div className="flex-1 px-5 py-6 flex flex-col items-center gap-5"><div className="bg-white rounded-3xl p-5 shadow-sm w-full flex flex-col items-center gap-4"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: config.color + '18' }}>{(types.find(t => t.l === guestType) || {e:''}).e}</div><p className="font-bold text-gray-900">{guestName || 'Guest'}</p><div className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-8 py-4 w-full text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Access Code</p><p className="text-3xl font-black tracking-widest">{code}</p></div><p className="text-xs text-gray-400 text-center">{(tenant?.houseNumber || '') + " · Valid 2 hours"}</p></div><div className="grid grid-cols-2 gap-3 w-full">{['WhatsApp', 'Messages', 'Email', 'Copy'].map((a) => (<button key={a} className="py-3 bg-white rounded-xl font-bold text-sm text-gray-700 shadow-sm active:scale-[0.98]">{a}</button>))}</div><div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full"><div className="px-4 py-3 border-b border-gray-100"><p className="font-bold text-gray-900 text-sm">Security Gate Notified</p><p className="text-xs text-gray-400 mt-0.5">{((types.find(t => t.l === guestType) || {e:''}).e) + " · " + guestName + " → " + (tenant?.houseNumber || '')}</p></div></div></div></div>
  if (step === 'details') return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => setStep('choose')} /><h2 className="font-black text-xl">{(guestType || '') + " Details"}</h2></div><div className="flex-1 px-5 py-5 flex flex-col gap-4"><div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto" style={{ backgroundColor: config.color + '18' }}>{(types.find(t => t.l === guestType) || {e:''}).e}</div><Field placeholder="Guest name" value={guestName} onChange={setGuestName} /><ThemedBtn onClick={() => { const c = 'G-' + Math.floor(1000 + Math.random() * 9000); setCode(c); setGuestCodes([{ code: c, type: guestType || '', name: guestName, house: tenant?.houseNumber || '', date: new Date().toLocaleString() }, ...guestCodes]); setStep('code') }} color={guestName.trim() ? config.color : '#d1d5db'} className={guestName.trim() ? '' : 'opacity-50'}>Generate Code →</ThemedBtn></div></div>
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('tenant-home')} /><h2 className="font-black text-xl">Guest Access</h2></div><div className="flex-1 px-5 py-6 flex flex-col gap-3"><p className="text-sm text-gray-500 text-center mb-3">Who are you expecting?</p>{types.map((t) => (<button key={t.l} onClick={() => { setGuestType(t.l); setStep('details') }} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] text-left"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: config.color + '18' }}>{t.e}</div><div><p className="font-bold text-gray-900">{t.l}</p></div><svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg></button>))}</div></div>
}

function ServiceCodeScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const [code, setCode] = useState(''); const [error, setError] = useState('')
  const handleJoin = () => { if (!code.trim()) { setError('Please enter a code'); return } if (code.trim().toUpperCase() !== config.joinCode.toUpperCase()) { setError('Invalid code'); return } go('service-role') }
  return <div className="relative h-full overflow-hidden"><div className="absolute inset-0"><div className="h-1/2" style={{ backgroundColor: config.color }} /><div className="h-1/2" style={{ backgroundImage: "url(" + (config.bgImageUrl || APT_PHOTO) + ")", backgroundSize: 'cover' }} /></div><div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} /><div className="relative z-10 h-full flex flex-col px-8"><div className="pt-14 pb-4"><button onClick={() => go('role-select')} className="flex items-center gap-1 text-white font-semibold text-sm">← Back</button></div><div className="flex-1 flex flex-col justify-center gap-5" style={{ animation: 'fade-up 0.5s ease both' }}><div className="flex flex-col items-center gap-3"><div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}><span className="text-3xl">🔧</span></div><h2 className="text-3xl font-black text-white text-center">Service Staff</h2><p className="text-white/70 text-sm text-center">Enter the code from the estate manager</p></div><input type="text" placeholder={"Code (e.g. " + config.joinCode + ")"} value={code} onChange={(e) => { setCode(e.target.value); setError('') }} className="w-full py-4 px-5 bg-white rounded-xl border-2 border-black/10 font-bold text-black text-center text-lg tracking-widest outline-none" />{error && <div className="bg-red-500/30 rounded-xl px-4 py-3"><p className="text-white text-sm font-semibold">{error}</p></div>}<button onClick={handleJoin} className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98]" style={{ backgroundColor: config.color }}>Continue →</button></div></div></div>
}

function ServiceRoleScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  const roles = [{ label: 'Security', icon: '👮', screen: 'service-security' as Screen, desc: 'Emergency alerts & guest codes' }, { label: 'Plumber', icon: '🔧', screen: 'service-worker' as Screen, desc: 'Plumbing complaints' }, { label: 'Cleaner', icon: '🧹', screen: 'service-worker' as Screen, desc: 'Cleaning requests' }, { label: 'Electrician', icon: '⚡', screen: 'service-worker' as Screen, desc: 'Electrical complaints' }]
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '15' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('service-code')} /><h2 className="font-black text-xl">Select Your Role</h2></div><div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">{roles.map((r) => (<button key={r.label} onClick={() => go(r.screen)} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left border-2 border-transparent hover:border-gray-200"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: config.color + '18' }}>{r.icon}</div><div><p className="font-bold text-gray-900 text-base">{r.label}</p><p className="text-gray-400 text-xs mt-0.5">{r.desc}</p></div><svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg></button>))}</div></div>
}

function ServiceSecurityScreen({ go, config, alerts, guestCodes }: { go: (s: Screen) => void; config: EstateConfig; alerts: EmergencyAlert[]; guestCodes: GuestCode[] }) {
  const [scanCode, setScanCode] = useState(''); const [scanned, setScanned] = useState<{ code: string; type: string; name: string; house: string } | null>(null)
  const handleScan = () => { const found = guestCodes.find(g => g.code.toUpperCase() === scanCode.toUpperCase()); if (found) setScanned({ code: found.code, type: found.type, name: found.name, house: found.house }); else setScanned({ code: scanCode, type: 'Unknown', name: 'Not Found', house: 'N/A' }) }
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('service-role')} /><h2 className="font-black text-xl">Security Dashboard</h2></div><div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
    {alerts.filter(a => a.status === 'active').length > 0 && <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4"><p className="text-red-800 text-sm font-bold mb-2">{"🚨 Active Emergency (" + alerts.filter(a => a.status === 'active').length + ")"}</p>{alerts.filter(a => a.status === 'active').map((a) => <div key={a.id} className="bg-white rounded-xl p-3 mb-2"><p className="font-bold text-red-600">{a.type + " — " + a.houseNumber}</p><p className="text-gray-500 text-xs">{a.tenantName + " · " + a.date}</p><p className="text-xs text-gray-600 mt-1">{"📍 Address: " + a.location}</p></div>)}</div>}
    <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">🔍 Scan Guest Code</p><input type="text" placeholder="Enter guest code" value={scanCode} onChange={(e) => setScanCode(e.target.value)} className="w-full py-3 px-4 bg-gray-50 rounded-xl border-2 border-gray-200 font-bold text-center text-lg tracking-widest outline-none focus:border-green-600" /><button onClick={handleScan} className="w-full py-3 mt-3 rounded-xl font-bold text-white active:scale-[0.98]" style={{ backgroundColor: config.color }}>Scan Code</button>{scanned && <div className="mt-4 bg-gray-50 rounded-xl p-4 border-2 border-gray-200"><p className="text-xs font-bold text-gray-400 uppercase mb-2">Scan Result</p><div className="space-y-1 text-sm"><p><strong>Code:</strong> {scanned.code}</p><p><strong>Type:</strong> {scanned.type}</p><p><strong>Guest:</strong> {scanned.name}</p><p><strong>Apartment:</strong> <span className="font-bold text-green-600">{scanned.house}</span></p></div></div>}</div>
  </div></div>
}

function ServiceWorkerScreen({ go, config, complaints }: { go: (s: Screen) => void; config: EstateConfig; complaints: Complaint[] }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('service-role')} /><h2 className="font-black text-xl">My Jobs</h2></div><div className="flex-1 overflow-y-auto px-5 py-5">{complaints.length === 0 ? <div className="text-center py-16"><p className="text-5xl mb-3">📭</p><p className="font-bold text-gray-700">No jobs assigned</p></div> : complaints.map((c) => <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3"><div className="flex items-start justify-between mb-2"><div><p className="font-bold text-gray-900">{c.category}</p><p className="text-gray-400 text-xs">{c.houseNumber + " · " + c.date}</p></div><span className={"text-xs font-bold px-2 py-1 rounded-full " + (c.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700')}>{c.status}</span></div><p className="text-gray-600 text-sm">{c.description}</p><div className="mt-3 pt-3 border-t text-xs text-gray-400"><p>Tenant: {c.tenantName}</p><p>Address: <strong className="text-gray-700">{c.houseNumber}</strong></p></div></div>)}</div></div>
}

function QRShareScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Share Access</h2></div><div className="flex-1 px-5 py-6 flex flex-col items-center gap-5"><div className="bg-white rounded-3xl p-5 shadow-sm w-full flex flex-col items-center gap-4"><p className="text-sm text-gray-500 font-medium">{"Share with tenants to join " + config.estateName}</p><div className="p-3 border-2 border-gray-100 rounded-2xl"><div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-6xl">📱</div></div><div className="bg-gray-50 rounded-2xl px-6 py-3 border border-gray-200 w-full text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Join Code</p><p className="text-2xl font-black tracking-widest">{config.joinCode}</p></div></div><div className="grid grid-cols-3 gap-3 w-full">{['WhatsApp', 'Messages', 'Copy'].map((a) => (<button key={a} className="py-3 bg-white rounded-xl font-bold text-sm text-gray-700 shadow-sm active:scale-[0.98]">{a}</button>))}</div></div></div>
}

function ManagerSettingsScreen({ go, config, tenantLogins }: { go: (s: Screen) => void; config: EstateConfig; tenantLogins: { name: string; house: string; date: string }[] }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Settings</h2></div><div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
    <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">🔔 Notifications</p><div className="flex items-center justify-between mb-3"><span className="font-bold text-gray-800">Notification Sound</span><select className="py-2 px-3 rounded-lg border border-gray-200 text-sm font-medium"><option>Default</option><option>Chime</option><option>Bell</option></select></div><div className="flex items-center justify-between"><span className="font-bold text-gray-800">Push Notifications</span><div className="w-12 h-7 rounded-full bg-green-500 p-0.5 cursor-pointer"><div className="w-6 h-6 rounded-full bg-white shadow-sm translate-x-5 transition-transform" /></div></div></div>
    <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{" Tenant Logins (" + tenantLogins.length + ")"}</p>{tenantLogins.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No tenants have joined yet.</p> : tenantLogins.map((t, i) => <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{t.name[0] || ''}</div><div className="flex-1"><p className="font-bold text-gray-900 text-sm">{t.name}</p><p className="text-gray-400 text-xs">{t.house + " · Joined " + t.date}</p></div></div>)}</div>
    <div className="bg-white rounded-2xl p-5 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">ℹ️ About</p><div className="text-sm text-gray-600 space-y-2"><div className="flex justify-between"><span>Estate</span><span className="font-bold">{config.estateName}</span></div><div className="flex justify-between"><span>Plan</span><span className="font-bold capitalize">{config.subscription}</span></div><div className="flex justify-between"><span>Monthly Dues</span><span className="font-bold">{"₦" + config.monthlyDues.toLocaleString()}</span></div><div className="flex justify-between"><span>App Dues (10%)</span><span className="font-bold text-green-600">{"₦" + config.appDues.toLocaleString()}</span></div><div className="flex justify-between"><span>Estate Bank</span><span className="font-bold">{config.estateBank}</span></div><div className="flex justify-between"><span>Account</span><span className="font-bold">{config.estateAccountNumber}</span></div></div></div>
  </div></div>
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash'); const [config, setConfig] = useState<EstateConfig>(DEFAULT_CONFIG); const [menuOpen, setMenuOpen] = useState(false)
  const [tenant, setTenant] = useState<TenantInfo | null>(null); const [activeRole, setActiveRole] = useState<string>(() => localStorage.getItem('ef_role') || '')
  const [tenantLogins, setTenantLogins] = useState<{ name: string; house: string; date: string }[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([{ id: 'n1', title: 'Estate Fumigation', message: 'Estate-wide fumigation Saturday 19 July at 8am.', date: 'Jul 14, 2026', type: 'announcement', read: false }, { id: 'n2', title: 'Monthly Meeting', message: 'Residents meeting Sunday 20 July at community hall.', date: 'Jul 12, 2026', type: 'announcement', read: false }])
  const [invoices, setInvoices] = useState<Invoice[]>([]); const [complaints, setComplaints] = useState<Complaint[]>([]); const [alerts, setAlerts] = useState<EmergencyAlert[]>([]); const [guestCodes, setGuestCodes] = useState<GuestCode[]>([])
  const go = useCallback((s: Screen) => { setMenuOpen(false); setScreen(s) }, [])
  useEffect(() => { if (screen === 'splash') { const role = localStorage.getItem('ef_role'); setTimeout(() => { if (role === 'manager') go('manager-home'); else if (role === 'tenant' && tenant) go('tenant-home'); else if (role === 'tenant' && !tenant) go('tenant-code'); else if (role === 'service') go('service-role'); else go('role-select') }, 2500) } }, [screen])
  const setRole = (role: string) => { localStorage.setItem('ef_role', role); setActiveRole(role) }
  const clearSession = () => { localStorage.removeItem('ef_role'); setTenant(null); setActiveRole('') }
  useEffect(() => { if (tenant && screen === 'tenant-home') { const exists = tenantLogins.find(t => t.house === tenant.houseNumber); if (!exists) setTenantLogins([...tenantLogins, { name: tenant.name, house: tenant.houseNumber, date: tenant.joinedDate }]) } }, [tenant, screen])
  const screens: Record<Screen, React.ReactNode> = {
    splash: <SplashScreen onDone={() => { const role = localStorage.getItem('ef_role'); if (role === 'manager') go('manager-home'); else if (role === 'tenant' && tenant) go('tenant-home'); else if (role === 'tenant') go('tenant-code'); else if (role === 'service') go('service-role'); else go('role-select') }} />,
    'role-select': <RoleSelectScreen go={(s) => { if (s === 'manager-auth') setRole('manager'); else if (s === 'tenant-code') setRole('tenant'); else if (s === 'service-code') setRole('service'); go(s) }} />,
    'manager-auth': <ManagerAuthScreen go={go} />, 'manager-signup': <ManagerSignUpScreen go={go} config={config} />, 'manager-login': <ManagerLoginScreen go={go} config={config} />,
    'manager-home': <ManagerHomeScreen go={go} config={config} menuOpen={menuOpen} setMenuOpen={setMenuOpen} notifications={notifications} invoices={invoices} setInvoices={setInvoices} clearSession={clearSession} />,
    'qr-share': <QRShareScreen go={go} config={config} />, 'theme-customizer': <ThemeCustomizerScreen go={go} config={config} setConfig={setConfig} />,
    'estate-profile': <EstateProfileScreen go={go} config={config} setConfig={setConfig} />, 'plan-select': <PlanSelectScreen go={go} config={config} setConfig={setConfig} />,
    payment: <PaymentScreen go={go} config={config} setConfig={setConfig} />,
    management: <ManagementScreen go={go} config={config} invoices={invoices} complaints={complaints} />,
    'announcement-editor': <AnnouncementEditorScreen go={go} config={config} setNotifications={setNotifications} notifications={notifications} />,
    invoices: <InvoicesScreen go={go} config={config} invoices={invoices} setInvoices={setInvoices} setNotifications={setNotifications} notifications={notifications} />,
    'manager-settings': <ManagerSettingsScreen go={go} config={config} tenantLogins={tenantLogins} />,
    'tenant-code': <TenantCodeScreen go={go} config={config} />, 'tenant-onboarding': <TenantOnboardingScreen go={go} config={config} setTenant={(t) => { setTenant(t); setRole('tenant') }} />,
    'tenant-home': <TenantHomeScreen go={go} config={config} tenant={tenant} notifications={notifications} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />,
    'tenant-bills': <TenantBillsScreen go={go} config={config} tenant={tenant} invoices={invoices} setInvoices={setInvoices} setNotifications={setNotifications} notifications={notifications} />,
    'tenant-pay': <TenantPayScreen go={go} config={config} invoices={invoices} setInvoices={setInvoices} setNotifications={setNotifications} notifications={notifications} />,
    'tenant-receipts': <TenantReceiptsScreen go={go} config={config} invoices={invoices} tenant={tenant} />,
    'tenant-complaints': <TenantComplaintsScreen go={go} config={config} tenant={tenant} complaints={complaints} setComplaints={setComplaints} setNotifications={setNotifications} notifications={notifications} />,
    'tenant-profile': <TenantProfileScreen go={go} config={config} tenant={tenant} setTenant={setTenant} />, 'tenant-settings': <TenantSettingsScreen go={go} config={config} clearSession={clearSession} />,
    maintenance: <MaintenanceScreen go={go} config={config} tenant={tenant} complaints={complaints} setComplaints={setComplaints} setNotifications={setNotifications} notifications={notifications} />,
    emergency: <EmergencyScreen go={go} config={config} tenant={tenant} alerts={alerts} setAlerts={setAlerts} />, guest: <GuestScreen go={go} config={config} tenant={tenant} guestCodes={guestCodes} setGuestCodes={setGuestCodes} />,
    'service-code': <ServiceCodeScreen go={go} config={config} />, 'service-role': <ServiceRoleScreen go={go} config={config} />,
    'service-security': <ServiceSecurityScreen go={go} config={config} alerts={alerts} guestCodes={guestCodes} />, 'service-worker': <ServiceWorkerScreen go={go} config={config} complaints={complaints} />,
  }
  return <div className="min-h-screen bg-zinc-400 flex items-center justify-center p-0 sm:p-6"><div className="relative bg-white overflow-hidden w-full sm:w-[400px]" style={{ height: '100dvh', maxHeight: '900px', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 30px 80px rgba(0,0,0,0.4)', borderRadius: 'clamp(0px, 2vw, 36px)' }}><PageTransition>{screens[screen]}</PageTransition></div></div>
}
''')

# Write all parts to file
output_path = '/home/user/estateflow-app/src/App.tsx'
with open(output_path, 'w', encoding='utf-8') as f:
    for i, part in enumerate(PARTS):
        f.write(part)
        if i < len(PARTS) - 1:
            f.write('\n')

content_text = ''.join(PARTS)
total = len(content_text)
lines = content_text.count(chr(10))
print(f"✅ Written {total} chars, {lines} lines to {output_path}")
