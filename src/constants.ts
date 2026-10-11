// ============================================
// ESTATEFLOW — Constants & Static Data
// ============================================

import type { EstateConfig } from './types'

// EstateFlow service fee percentage (added ON TOP of estate dues)
export const SERVICE_FEE_PERCENT = 10

// Default estate configuration — ALL features enabled for every estate
export const DEFAULT_CONFIG: EstateConfig = {
  color: '#1B873F',
  secondaryColor: '#065f46',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  headingFont: "'Plus Jakarta Sans', sans-serif",
  fontSize: 16,
  logoUrl: '',
  bgImageUrl: '',
  estateName: 'Greenview Estate',
  estateDescription: '',
  joinCode: 'EF-4829-GVE',
  logoPosition: 'top-left',
  enable3D: true,
  enableAI: true,
  isGoldBlackTheme: false,
  monthlyDues: 15000,
  estateAccountNumber: '0123456789',
  estateAccountName: 'Greenview Estate Mgt',
  estateBank: 'GTBank',
  useEstateLogoFor3D: false,
  threeDOpacity: 0.2,
  threeDScale: 1,
  threeDSpeed: 20,
  borderRadius: 16,
  shadowIntensity: 'medium',
  welcomeMessage: 'Welcome home.',
  cardStyle: 'rounded',
}

export const APT_PHOTO = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=1200&fit=crop&auto=format'

export const AVATAR_SVGS = [
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#e5e7eb"/><path d="M50 55 C35 55 30 70 30 80 L70 80 C70 70 65 55 50 55" fill="#9ca3af"/><circle cx="50" cy="40" r="15" fill="#9ca3af"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#3b82f6"/><rect x="25" y="60" width="50" height="30" rx="10" fill="#1e40af"/><circle cx="50" cy="40" r="18" fill="#fbbf24"/><rect x="45" y="65" width="10" height="20" fill="#fbbf24"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1f2937"/><path d="M30 80 L50 60 L70 80 Z" fill="#f59e0b"/><circle cx="50" cy="45" r="20" fill="#fbbf24"/><rect x="40" y="35" width="20" height="5" fill="#1f2937"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#ec4899"/><circle cx="50" cy="45" r="18" fill="#fbcfe8"/><path d="M30 70 Q50 60 70 70 L70 85 L30 85 Z" fill="#fbcfe8"/><circle cx="45" cy="42" r="3" fill="#1f2937"/><circle cx="55" cy="42" r="3" fill="#1f2937"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1e40af"/><rect x="35" y="55" width="30" height="30" rx="5" fill="#93c5fd"/><circle cx="50" cy="40" r="18" fill="#dbeafe"/><rect x="45" y="35" width="10" height="10" fill="#1e3a8a"/><circle cx="47" cy="38" r="2" fill="#fff"/><circle cx="53" cy="38" r="2" fill="#fff"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#059669"/><rect x="30" y="60" width="40" height="25" rx="8" fill="#a7f3d0"/><circle cx="50" cy="45" r="18" fill="#d1fae5"/><path d="M42 42 L50 50 L58 42" stroke="#059669" strokeWidth="3" fill="none"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#8b5cf6"/><path d="M30 75 L50 65 L70 75 L70 85 L30 85 Z" fill="#c4b5fd"/><circle cx="50" cy="45" r="18" fill="#ede9fe"/><rect x="45" y="50" width="10" height="15" fill="#8b5cf6"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f97316"/><rect x="30" y="60" width="40" height="25" rx="5" fill="#fed7aa"/><circle cx="50" cy="45" r="18" fill="#ffedd5"/><rect x="40" y="70" width="20" height="5" fill="#c2410c"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#d4af37"/><circle cx="50" cy="45" r="20" fill="#fef3c7"/><path d="M30 75 Q50 65 70 75 L70 90 L30 90 Z" fill="#fef3c7"/><circle cx="50" cy="40" r="8" fill="#92400e"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f3f4f6"/><circle cx="50" cy="45" r="15" fill="#d1d5db"/><rect x="35" y="65" width="30" height="20" rx="10" fill="#d1d5db"/></svg>',
]

export const AVATARS = AVATAR_SVGS

export const BANKS = ['GTBank', 'Access Bank', 'First Bank', 'UBA', 'Zenith', 'Fidelity', 'Sterling', 'Wema', 'Union']

// Theme colors available to ALL estates (no subscription lock)
export const THEME_COLORS = [
  '#1B873F', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2',
  '#db2777', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
  '#d4af37', '#000000', '#0ea5e9', '#8b5cf6',
]

// Professional font library
export const FONT_OPTIONS = [
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Manrope', value: "'Manrope', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Outfit', value: "'Outfit', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Nunito Sans', value: "'Nunito Sans', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
]

// Maintenance categories
export const MAINTENANCE_CATEGORIES = [
  { label: 'Plumbing', icon: 'mdi:wrench' },
  { label: 'Electrical', icon: 'mdi:flash' },
  { label: 'Security', icon: 'mdi:shield-lock' },
  { label: 'Cleaning', icon: 'mdi:broom' },
  { label: 'Water Supply', icon: 'mdi:water' },
  { label: 'Elevator', icon: 'mdi:elevator' },
  { label: 'Generator', icon: 'mdi:engine' },
  { label: 'Other', icon: 'mdi:alert-circle' },
]

// Emergency types
export const EMERGENCY_TYPES = [
  { label: 'Fire', icon: 'mdi:fire', color: '#ef4444', emoji: '🔥' },
  { label: 'Security', icon: 'mdi:police-badge', color: '#f59e0b', emoji: '🚨' },
  { label: 'Medical', icon: 'mdi:hospital', color: '#3b82f6', emoji: '🏥' },
  { label: 'Gas Leak', icon: 'mdi:gas-cylinder', color: '#8b5cf6', emoji: '☁️' },
  { label: 'Other', icon: 'mdi:alert-octagon', color: '#6b7280', emoji: '⚠️' },
]

// Guest types
export const GUEST_TYPES = [
  { label: 'Delivery', icon: 'mdi:package' },
  { label: 'Ride/Food', icon: 'mdi:motorbike' },
  { label: 'Visitor', icon: 'mdi:account' },
  { label: 'Contractor', icon: 'mdi:hard-hat' },
]
