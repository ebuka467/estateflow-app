# 🏠 EstateFlow

**Smart Estate Management for Nigeria** — A Progressive Web App for estate managers and tenants.

![EstateFlow](https://img.shields.io/badge/version-1.0.0-1B873F?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-1B873F?style=for-the-badge)

## ✨ Features

### For Estate Managers
- 🎨 **Full Customization** — Change colors, fonts, backgrounds, and logos
- 📊 **Management Dashboard** — Track dues, complaints, and spending with charts
- 📱 **QR Code Sharing** — Generate codes for tenants to join your estate
- 💰 **Subscription Plans** — Basic, Premium, and Platinum tiers
- 📢 **Announcements** — Post estate-wide notices with images

### For Tenants
- 🏠 **Join Estates** — Enter QR code or PIN to access your estate
- 💳 **View Bills** — See estate dues and app subscription charges
- 🔧 **Maintenance** — Report issues (plumbing, electrical, security, etc.)
- 🚨 **Emergency Alerts** — Fire, robbery, medical, gas leak, flooding
- 👥 **Guest Access** — Generate codes for deliveries, Uber, and visitors

### Technical
- 📲 **Installable PWA** — Works on phone and PC like a native app
- 🔌 **Offline Support** — Service worker caches the app
- 🇳🇬 **Nigerian Payments** — Paystack integration (cards, bank, USSD)
- 🎭 **Animated UI** — Drawing animation splash, smooth transitions

## 🚀 Quick Start

```bash
# Clone the repo
git clone <your-repo-url>
cd estateflow-app

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open `http://localhost:8443` in your browser.

## 📱 Install as App

### On Phone
1. Deploy to Vercel/Netlify (free)
2. Visit URL on phone → "Add to Home Screen"

### On Desktop
1. Visit deployed URL in Chrome/Edge
2. Click install icon in address bar

## 🏗️ Build for Production

```bash
pnpm build    # Creates dist/ folder
pnpm preview  # Preview production build
```

## 📦 Deploy

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist

# Cloudflare Pages
npx wrangler pages deploy dist
```

## 💳 Payment Integration

See [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) for Paystack integration details.

## 📋 Subscription Plans

| Feature | Basic (₦2,500/mo) | Premium (₦5,000/mo) | Platinum (₦12,000/mo) |
|---------|-------------------|---------------------|----------------------|
| Units | Up to 50 | Up to 200 | Unlimited |
| Layouts | 7 designs | More options | Liquid glass + 3D |
| Colors | Basic palette | Extended | Gold & Black |
| Fonts | Standard | More styles | All styles |
| Logo | Default | Position control | Full control |
| 3D Blend | ❌ | ❌ | ✅ 360° rotation |
| AI Bot | ❌ | ❌ | ✅ Smart chatbot |

## 📖 Documentation

Full developer guide: [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)

## 🛡️ Security

- All passwords hashed with bcrypt
- Paystack handles PCI DSS compliance
- HTTPS enforced via PWA
- QR codes signed with HMAC
- NDPR compliant data handling

## 📄 License

MIT License — free to use and modify.

---

*Built for Nigerian estates 🇳🇬*
