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
  | 'tenant-code' | 'tenant-onboarding' | 'tenant-home' | 'tenant-bills'
  | 'tenant-pay' | 'tenant-receipts' | 'tenant-profile' | 'tenant-settings'
  | 'tenant-complaints' | 'maintenance' | 'emergency' | 'guest' | 'ai-chatbot'
  | 'service-code' | 'service-role' | 'service-security' | 'service-worker'

// Every estate gets ALL features — no subscription tiers
export interface EstateConfig {
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
  logoPosition: 'top-left' | 'top-right' | 'center' | 'bottom-right'
  enable3D: boolean
  enableAI: boolean
  isGoldBlackTheme: boolean
  monthlyDues: number
  // EstateFlow service fee is 10% added ON TOP of estate dues
  // Tenant pays: monthlyDues + (monthlyDues * 0.10)
  estateAccountNumber: string
  estateAccountName: string
  estateBank: string
  useEstateLogoFor3D: boolean
  threeDOpacity: number
  threeDScale: number
  threeDSpeed: number
  borderRadius: number
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
  welcomeMessage: string
  cardStyle: 'sharp' | 'rounded' | 'pill'
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
  // Estate dues — what the estate requested
  baseAmount: number
  // EstateFlow 10% service fee — added ON TOP
  serviceFee: number
  // Processing fee (currently 0)
  processingFee: number
  // What the tenant actually pays
  totalAmount: number
  // What the estate receives (same as baseAmount)
  estateSettlement: number
  // What EstateFlow earns (same as serviceFee)
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
