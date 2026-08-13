# 🏠 EstateFlow — Complete Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [How to Run & Build](#how-to-run--build)
3. [How to Deploy as Downloadable App](#how-to-deploy-as-downloadable-app)
4. [PWA Installation Guide](#pwa-installation-guide)
5. [Converting to Native Mobile App](#converting-to-native-mobile-app)
6. [Payment Integration (Nigeria)](#payment-integration-nigeria)
7. [Architecture Decisions](#architecture-decisions)
8. [Subscription Tiers Explained](#subscription-tiers-explained)
9. [Security Considerations](#security-considerations)
10. [Roadmap & Next Steps](#roadmap--next-steps)

---

## Project Overview

**EstateFlow** is a Progressive Web App (PWA) for estate management in Nigeria. It serves two user types:

- **Estate Managers**: Set up estates, customize the app appearance, manage dues, track complaints, and handle maintenance.
- **Tenants**: View bills, submit maintenance requests, trigger emergency alerts, and manage guest access via QR codes.

### Key Features
- ✅ Animated splash screen with house drawing animation
- ✅ Split green/apartment background login flow
- ✅ QR code & PIN-based estate joining
- ✅ Manager dashboard with charts (dues, complaints, spending)
- ✅ Tenant-facing bills, maintenance, emergency, and guest screens
- ✅ Customizable theme (colors, fonts, backgrounds, logo)
- ✅ PWA installable on phone and PC
- ✅ Offline-first service worker
- ✅ Nigerian Naira payment integration (Paystack-ready)

---

## How to Run & Build

### Development
```bash
# Install dependencies
pnpm install

# Start dev server (auto-reloads)
pnpm dev
```

### Production Build
```bash
# Build for production
pnpm build

# Preview the production build
pnpm preview
```

The built files will be in the `dist/` folder, ready to deploy to any static hosting (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## How to Deploy as Downloadable App

### Option A: Host as a PWA (Easiest)
1. Deploy the `dist/` folder to **Vercel**, **Netlify**, or **Cloudflare Pages**
2. Users visit the URL on their phone browser
3. They tap "Add to Home Screen" → it becomes a full-screen app

```bash
# Deploy to Vercel
npx vercel --prod

# Deploy to Netlify
npx netlify deploy --prod --dir=dist

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

### Option B: Convert to Android APK
Use **TWA (Trusted Web Activity)** via Bubblewrap:

```bash
# Install Bubblewrap (Google's TWA tool)
npm i -g @aspect-build/rules_js
npx @nickvdg/nickvdg@latest

# Or use PWABuilder (web-based)
# Visit: https://www.pwabuilder.com/
# Enter your deployed PWA URL → Download Android package
```

**Recommended: Use [PWABuilder.com](https://www.pwabuilder.com/)**
1. Deploy your PWA to a URL (e.g., `estateflow.vercel.app`)
2. Go to PWABuilder.com → enter URL
3. Click "Package for Stores" → Download APK/AAB
4. Upload to Google Play Store or distribute directly

### Option C: iOS App (via Capacitor or TWA)
For iOS, you need a Mac with Xcode:

```bash
# Using Capacitor (Ionic)
npm install @capacitor/core @capacitor/cli
npx cap init EstateFlow com.estateflow.app
npx cap add ios
npx cap open ios
```

---

## PWA Installation Guide

### On Android (Chrome):
1. Visit your deployed URL
2. Tap the **⋮** menu (top right)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. The EstateFlow icon appears on the home screen

### On iPhone (Safari):
1. Visit your deployed URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Confirm → app icon appears on home screen

### On Desktop (Chrome/Edge):
1. Visit your deployed URL
2. Click the **⊕** install icon in the address bar
3. Or: Menu → "Install EstateFlow"
4. App launches in its own window like a native app

---

## Converting to Native Mobile App

### Using Capacitor (Recommended for cross-platform)

```bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/android @capacitor/ios

# Initialize
npx cap init "EstateFlow" "com.estateflow.app" --web-dir=dist

# Build the web app first
pnpm build

# Add platforms
npx cap add android
npx cap add ios

# Sync web assets to native projects
npx cap sync

# Open in native IDE
npx cap open android  # Opens Android Studio
npx cap open ios       # Opens Xcode
```

### Using PWABuilder (No coding required)
1. Deploy PWA to a URL with HTTPS
2. Visit [pwabuilder.com](https://www.pwabuilder.com)
3. Enter URL → Test → Package
4. Get Android APK, iOS package, or Windows app

---

## Payment Integration (Nigeria)

### Paystack (Recommended)
Paystack supports cards, bank transfers, USSD, and mobile money in Nigeria.

**Setup Steps:**
1. Create account at [paystack.com](https://paystack.com)
2. Get your **Public Key** and **Secret Key**
3. Add to your environment variables:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

**Frontend Integration:**
```tsx
// Install the Paystack React library
// pnpm add react-paystack

import { PaystackButton } from 'react-paystack'

function PaymentButton({ amount, email, onSuccess }) {
  const config = {
    reference: new Date().getTime().toString(),
    email: email,
    amount: amount * 100, // Paystack uses kobo (₦1 = 100 kobo)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
    channels: ['card', 'bank', 'ussd'],
  }
  
  return <PaystackButton {...{ ...config, onSuccess, text: 'Pay Now' }} />
}
```

**Backend (for verification):**
```js
// Node.js/Express endpoint to verify payment
app.post('/verify-payment', async (req, res) => {
  const { reference } = req.body
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  )
  const data = await response.json()
  res.json(data)
})
```

### Alternative: Flutterwave
Flutterwave also works well in Nigeria:
```bash
pnpm add flutterwave-react-v3
```

### Service Charge Logic
For the app service charge (₦1,500 – ₦9,900 or 10%):
```typescript
function calculateServiceCharge(monthlyDues: number): number {
  // 10% of monthly dues, but between ₦1,500 and ₦9,900
  const charge = monthlyDues * 0.10
  return Math.max(1500, Math.min(9900, charge))
}
```

---

## Architecture Decisions

### Why PWA instead of React Native?
| Feature | PWA | React Native |
|---------|-----|-------------|
| Development Speed | ⚡ Fast | 🐢 Slower |
| Install on Phone | ✅ Yes | ✅ Yes |
| Works Offline | ✅ Yes | ✅ Yes |
| App Store Required | ❌ No | ✅ Yes |
| Push Notifications | ✅ Yes | ✅ Yes |
| Camera/QR Scanner | ✅ Yes | ✅ Yes |
| Update Instantly | ✅ Yes | ❌ Needs review |
| Cost | 🆓 Free | 💰 $99/yr Apple + $25 Google |

### State Management
Currently using React `useState` (simple, no library needed for this size). For production with a backend, consider:
- **Zustand** (lightweight) for client state
- **React Query / TanStack Query** for server data
- **Context API** for theme/config sharing

### File Structure
```
estateflow-app/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker (offline)
│   └── icons/             # App icons (72, 96, 128, 192, 512)
├── src/
│   ├── App.tsx            # All screens & logic
│   ├── main.tsx           # React entry point
│   └── index.css          # Tailwind + animations
├── index.html             # PWA meta tags
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Subscription Tiers Explained

### Basic (₦2,500/month)
- 7 layout designs with simple color combinations
- Basic color palette (green, blue, red, orange, purple, cyan, pink)
- Standard fonts
- Up to 50 units
- Announcements & dues tracking

### Premium (₦5,000/month)
- More color combinations (expandable palette)
- More font styles and sizes
- Logo positioning control (choose where logo appears in background)
- Up to 200 units
- All Basic features + maintenance + QR access

### Platinum (₦12,000/month)
- Liquid glass font layout
- Gold & Black premium design theme
- 3D blend effects (CAD design of house/estate that rotates 360°)
- Rising animation (3D model rises from bottom to center on load)
- AI Chatbot that:
  - Responds to tenant complaints
  - Summarizes complaints into short notes
  - Auto-categorizes and routes to maintenance sections (plumber, carpenter, security, electrical)
- Unlimited units
- All Premium features + emergency + priority support

### Implementation for AI Chatbot (Platinum)
```typescript
// Using OpenAI API or similar
async function aiProcessComplaint(text: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an estate management assistant. Categorize complaints into: plumbing, electrical, carpentry, security, cleaning, or other. Summarize into a short note for the estate manager.' },
        { role: 'user', content: text }
      ]
    })
  })
  return response.json()
}
```

---

## Security Considerations

### 🔒 Critical Security Measures

1. **API Keys**: Never expose secret keys in frontend code
   - Use environment variables with `VITE_` prefix for public keys only
   - Keep Paystack secret key on a backend server

2. **Authentication**: 
   - Implement JWT tokens for manager login
   - Use Firebase Auth or Supabase Auth for Google sign-in
   - Hash passwords with bcrypt (min 10 rounds)

3. **QR Codes**: 
   - Sign QR payloads with HMAC to prevent tampering
   - Add expiry timestamps to access codes
   - Rate-limit code generation

4. **Data Protection**:
   - Encrypt tenant personal data at rest
   - Use HTTPS everywhere (enforced by PWA)
   - Comply with Nigeria Data Protection Regulation (NDPR)

5. **Payment Security**:
   - Never process payments on frontend
   - Use Paystack's hosted checkout (PCI DSS compliant)
   - Verify all payments server-side before granting access

6. **Emergency Alerts**:
   - Implement rate limiting (max 3 alerts per hour per user)
   - Verify user location before sending
   - Log all emergency events for audit

---

## Roadmap & Next Steps

### Phase 1 — MVP (Current)
- [x] Splash screen with animation
- [x] Role selection (Manager/Tenant)
- [x] Manager auth flow
- [x] Tenant QR/PIN entry
- [x] Manager dashboard with charts
- [x] Tenant bills & maintenance
- [x] Emergency alerts UI
- [x] Guest access system
- [x] PWA setup

### Phase 2 — Backend & Payments
- [ ] Set up Firebase/Supabase backend
- [ ] Real authentication (Google, email/password)
- [ ] Paystack payment integration
- [ ] Cloud database for estate data
- [ ] Real-time notifications via WebSocket

### Phase 3 — Advanced Features
- [ ] AI chatbot (Platinum tier)
- [ ] 3D estate visualization (Three.js)
- [ ] Push notifications for emergency alerts
- [ ] QR code scanner (using `html5-qrcode` library)
- [ ] Biometric login (fingerprint/Face ID)

### Phase 4 — Scale & Distribute
- [ ] Google Play Store listing (via PWABuilder)
- [ ] Apple App Store listing (via Capacitor)
- [ ] Multi-estate support
- [ ] Analytics dashboard
- [ ] Automated billing & reminders

---

## Generating App Icons

You need actual PNG icons for the PWA manifest. Create a simple house logo in any design tool, then:

```bash
# Use sharp (Node.js image processing) to generate all sizes
pnpm add sharp
```

```javascript
// scripts/generate-icons.js
const sharp = require('sharp')
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generate() {
  for (const size of sizes) {
    await sharp('public/logo-source.png')
      .resize(size, size, { fit: 'contain', background: '#1B873F' })
      .toFile(`public/icons/icon-${size}.png`)
  }
  console.log('✅ All icons generated')
}

generate()
```

Or use an online tool like [realfavicongenerator.net](https://realfavicongenerator.net/) — upload your logo and it generates all sizes.

---

## Quick Start Checklist

1. ✅ Copy this project to your machine
2. ✅ Run `pnpm install`
3. ✅ Run `pnpm dev` to see the app
4. ✅ Create a logo image → generate icons
5. ✅ Deploy to Vercel/Netlify (free)
6. ✅ Visit deployed URL on phone → "Add to Home Screen"
7. ✅ Replace placeholder data with real Firebase/Supabase backend
8. ✅ Add Paystack API keys for payments
9. ✅ Test on multiple devices (Android + iOS)
10. ✅ Submit to app stores when ready

---

## Contact & Support

For questions about this codebase or the EstateFlow project:
- This is a fully functional prototype ready for production enhancement
- All UI/UX is implemented according to specification
- Payment integration is stubbed and ready for Paystack connection
- PWA manifest and service worker are configured for installability

---

*Built with ❤️ for Nigerian estates*
