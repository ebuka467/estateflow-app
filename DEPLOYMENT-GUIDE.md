# EstateFlow - Complete Deployment & Setup Guide

## Overview
EstateFlow is a Progressive Web App (PWA) for estate management in Nigeria. This guide covers everything from development to production deployment.

---

## Part 1: Running the App Locally

### Prerequisites
- Node.js v20+ installed
- npm or yarn package manager

### Steps
```bash
# 1. Navigate to project
cd estateflow-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Go to: http://localhost:8443
```

---

## Part 2: Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Output: `dist/` folder with optimized files

---

## Part 3: Deploying to Vercel (Recommended)

### Option A: Via Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Framework Preset: Vite
5. Click "Deploy"

### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Your app will be live at: `https://your-app.vercel.app`

---

## Part 4: Installing as PWA

### On Android (Chrome)
1. Open your deployed URL in Chrome
2. Tap menu (⋮) → "Install app"
3. App installs to home screen

### On iPhone (Safari)
1. Open URL in Safari
2. Tap Share button
3. Scroll to "Add to Home Screen"
4. Tap "Add"

### On Desktop (Chrome/Edge)
1. Visit your URL
2. Click install icon in address bar
3. App opens in standalone window

---

## Part 5: Payment Integration (Paystack)

### Setup Steps

1. **Create Paystack Account**
   - Go to https://paystack.com
   - Sign up and verify your business
   - Get API keys from Settings → API Keys

2. **Install Paystack SDK**
```bash
npm install react-paystack
```

3. **Add Environment Variables**
Create `.env` file:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
ESTATE_ACCOUNT_NUMBER=0123456789
ESTATE_ACCOUNT_NAME=Greenview Estate
ESTATE_BANK=GTBank
```

4. **Update Payment Component**
```typescript
import { usePaystackPayment } from 'react-paystack'

const config = {
  reference: new Date().getTime().toString(),
  email: tenantEmail,
  amount: totalAmount * 100, // In kobo
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  metadata: {
    custom_fields: [
      { display_name: "Estate", variable_name: "estate", value: estateName },
      { display_name: "House", variable_name: "house", value: houseNumber }
    ]
  }
}

const initializePayment = usePaystackPayment(config)

// On payment success
const onSuccess = (reference: any) => {
  console.log('Payment successful:', reference)
  // Update invoice status to 'verified'
  // Send notification to tenant
}
```

5. **Split Payment Logic**
```typescript
// Estate dues (90%) → Estate Manager Account
// App service charge (10%) → EstateFlow Account

const estateDues = totalAmount * 0.90
const serviceCharge = totalAmount * 0.10

// Use Paystack Transfer API to split
```

---

## Part 6: Database Setup (Supabase)

### Why Supabase?
- Free tier: 500MB database, 50K monthly users
- Real-time subscriptions
- Built-in authentication
- PostgreSQL database

### Setup Steps

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Get API URL and anon key

2. **Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

3. **Create Tables**

```sql
-- Estates table
CREATE TABLE estates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  manager_id UUID REFERENCES auth.users(id),
  join_code TEXT UNIQUE,
  monthly_dues INTEGER,
  app_dues INTEGER,
  subscription TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id),
  name TEXT,
  house_number TEXT,
  email TEXT,
  avatar TEXT,
  joined_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  estate_id UUID REFERENCES estates(id),
  amount INTEGER,
  app_dues INTEGER,
  total INTEGER,
  status TEXT DEFAULT 'pending',
  paystack_reference TEXT,
  verified_by UUID,
  verified_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  estate_id UUID REFERENCES estates(id),
  category TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. **Initialize Supabase Client**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## Part 7: Security Best Practices

### Authentication
- Use Supabase Auth or Firebase Auth
- Implement JWT tokens
- Add email verification
- Enable 2FA for managers

### Data Protection
- Never store card details (use Paystack)
- Encrypt sensitive data at rest
- Use HTTPS everywhere (automatic with Vercel)
- Implement rate limiting

### NDPR Compliance (Nigeria)
- Privacy Policy page
- User consent for data collection
- Data deletion requests
- Breach notification within 72 hours
- Appoint Data Protection Officer

---

## Part 8: Push Notifications

### Setup with Firebase Cloud Messaging

1. **Install Firebase**
```bash
npm install firebase
```

2. **Configure Firebase**
```typescript
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

// Request permission
const permission = await Notification.requestPermission()

// Get token
const token = await getToken(messaging)

// Listen for messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload)
  // Show notification
})
```

3. **Send Notifications from Backend**
```javascript
// Cloud Function or backend endpoint
const admin = require('firebase-admin')
admin.initializeApp()

async function sendNotification(token, title, body) {
  const message = {
    notification: { title, body },
    token: token
  }
  await admin.messaging().send(message)
}
```

---

## Part 9: Monitoring & Analytics

### Error Tracking
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

### Analytics
```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

---

## Part 10: Custom Domain

### Setup on Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., estateflow.ng)
3. Update DNS records:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
4. Wait for SSL certificate (automatic)

### Domain Registration
- Namecheap: ~₦5,000/year
- GoDaddy: ~₦6,500/year
- Whogohost: ~₦4,500/year

---

## Part 11: Scaling Strategy

### Phase 1: Launch (Month 1-3)
- Vercel free tier
- Supabase free tier
- Target: 10 estates
- Cost: ₦0

### Phase 2: Growth (Month 4-12)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Target: 100 estates
- Cost: ~₦70,000/month

### Phase 3: Scale (Year 2)
- Custom backend (DigitalOcean/AWS)
- PostgreSQL database
- Redis caching
- Target: 1,000 estates
- Cost: ~₦300,000/month

---

## Part 12: Business Registration (Nigeria)

### CAC Registration
1. Reserve name on https://crc.cac.gov.ng
2. Fill registration forms
3. Pay fees: ~₦50,000
4. Get RC number

### Tax Registration
- Register with FIRS
- Get TIN (Tax Identification Number)
- VAT registration (7.5%)

### NDPR Registration
- Register with NDPC
- Cost: ~₦100,000
- Annual audit required

---

## Part 13: Customer Support

### Setup WhatsApp Business
1. Download WhatsApp Business
2. Create business profile
3. Set up quick replies
4. Enable chatbot for FAQs

### Support Channels
- WhatsApp: Primary support
- Email: support@estateflow.ng
- In-app chat: For urgent issues
- Phone: For emergencies

---

## Part 14: Marketing Strategy

### Digital Marketing
- Instagram: Estate management tips
- Twitter: Industry news
- LinkedIn: B2B outreach
- Facebook: Community building

### Partnerships
- Estate owners associations
- Real estate agencies
- Property managers
- Facility management companies

### Referral Program
- Existing managers get 1 month free for referrals
- Agents get 10% commission for 3 months

---

## Part 15: Legal Documents Needed

1. **Terms of Service**
   - Subscription terms
   - Cancellation policy
   - Refund policy
   - Limitation of liability

2. **Privacy Policy**
   - Data collection practices
   - Third-party sharing
   - User rights
   - Cookie policy

3. **SLA (Service Level Agreement)**
   - Uptime guarantee (99.9%)
   - Support response times
   - Maintenance windows

---

## Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf node_modules .next
npm install

# Rebuild
npm run build
```

### Deployment Issues
- Check environment variables
- Verify build command
- Check Node.js version

### Payment Issues
- Verify Paystack API keys
- Check webhook configuration
- Test with test mode first

---

## Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Paystack Docs: https://paystack.com/docs
- PWA Guide: https://web.dev/progressive-web-apps/

---

## Support

For technical issues:
- GitHub Issues: Create issue in repository
- Email: support@estateflow.ng
- WhatsApp: +234 XXX XXX XXXX

---

*Last Updated: 2026*
*Version: 1.0.0*
