// ============================================
// ESTATEFLOW — Domain Types
// ============================================

export type Screen =
  | 'splash' | 'role-select'
  | 'manager-auth' | 'manager-signup' | 'manager-login' | 'manager-home'
  | 'qr-share' | 'theme-customizer' | 'font-picker' | 'logo-upload'
  | 'estate-profile' | 'payment-setup' | 'management'
  | 'announcement-editor' | 'invoices' | 'manager-settings'
  | 'tenants' | 'reports' | 'search-tenant'
  | 'privacy-policy' | 'terms-of-service' | 'payment-refund-policy' | 'emergency-disclaimer'
  | 'tenant-code' | 'tenant-onboarding' | 'tenant-home' | 'tenant-bills'
  | 'tenant-pay' | 'tenant-receipts' | 'tenant-profile' | 'tenant-settings'
  | 'tenant-complaints' | 'maintenance' | 'emergency' | 'guest' | 'ai-chatbot'
  | 'service-code' | 'service-role' | 'service-security' | 'service-worker'

// Visual theme definition — each theme is a complete visual system
export interface EstateTheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  textPrimary: string
  textSecondary: string
  border: string
  shadow: 'none' | 'subtle' | 'medium' | 'strong'
  radius: 'sharp' | 'rounded' | 'pill'
  description: string
}

// Layout preset definition
export interface LayoutPreset {
  id: string
  name: string
  description: string
  cardDensity: 'compact' | 'normal' | 'spacious'
  showWelcomeHero: boolean
  prioritizeFinance: boolean
  prioritizeCommunity: boolean
  prioritizeOperations: boolean
  gridColumns: 2 | 3
}

// Background type
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'pattern'

// Full estate configuration — ALL features for every estate
export interface EstateConfig {
  // Identity
  color: string
  secondaryColor: string
  fontFamily: string
  headingFont: string
  fontSize: number
  logoUrl: string
  bgImageUrl: string
  estateName: string
  estateDescription: string
  joinCode: string
  welcomeMessage: string

  // Theme (from 10 presets)
  themeId: string
  isGoldBlackTheme: boolean

  // Background
  backgroundType: BackgroundType
  gradientAngle: number
  gradientColors: [string, string]
  backgroundOpacity: number

  // Layout
  layoutId: string
  solidBgColor: string
  backgroundPattern: number

  // Card/Button styles
  cardStyle: 'soft' | 'bordered' | 'elevated' | 'minimal'
  buttonStyle: 'rounded' | 'pill' | 'sharp' | 'outlined'
  borderRadius: number
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'

  // 3D Model
  enable3D: boolean
  useEstateLogoFor3D: boolean
  threeDOpacity: number
  threeDScale: number
  threeDSpeed: number

  // Financial
  monthlyDues: number
  estateAccountNumber: string
  estateAccountName: string
  estateBank: string

  // Feature flags (all enabled for everyone)
  enableAI: boolean
  logoPosition: 'top-left' | 'top-right' | 'center' | 'bottom-right'
}

export interface TenantInfo {
  name: string
  houseNumber: string
  avatar: string
  email: string
  joinedDate: string
  phone: string
}

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  type: 'announcement' | 'payment' | 'maintenance' | 'emergency' | 'complaint' | 'guest' | 'system'
  read: boolean
}

export interface Invoice {
  id: string
  tenantName: string
  houseNumber: string
  baseAmount: number
  serviceFee: number
  processingFee: number
  totalAmount: number
  estateSettlement: number
  estateflowShare: number
  date: string
  status: 'pending' | 'verified' | 'rejected'
  verifiedBy?: string
  verifiedDate?: string
  paymentReference?: string
  currency: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  date: string
  priority: 'normal' | 'high' | 'urgent'
  authorName: string
}

export interface Complaint {
  id: string
  tenantName: string
  houseNumber: string
  category: string
  description: string
  date: string
  status: 'open' | 'assigned' | 'in-progress' | 'awaiting-tenant' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
}

export interface EmergencyAlert {
  id: string
  type: string
  houseNumber: string
  tenantName: string
  date: string
  location: string
  status: 'active' | 'responded' | 'resolved'
}

export interface GuestCode {
  code: string
  type: string
  name: string
  house: string
  date: string
  vehicleInfo?: string
  arrivalTime?: string
  expiresAt?: string
}

// Payment breakdown helper
export function calculatePaymentBreakdown(baseAmount: number): {
  baseAmount: number
  serviceFee: number
  processingFee: number
  totalAmount: number
  estateSettlement: number
  estateflowShare: number
} {
  const SERVICE_FEE_PERCENT = 0.10
  const serviceFee = Math.round(baseAmount * SERVICE_FEE_PERCENT)
  const processingFee = 0
  const totalAmount = baseAmount + serviceFee + processingFee
  return {
    baseAmount,
    serviceFee,
    processingFee,
    totalAmount,
    estateSettlement: baseAmount,
    estateflowShare: serviceFee,
  }
}

// WCAG contrast ratio calculation (Patch §8, §62)
export function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(c => {
    const v = parseInt(c, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }) || [0, 0, 0]
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
export function meetsWCAG_AA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5
}
