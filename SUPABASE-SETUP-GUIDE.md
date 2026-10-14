# SUPABASE SETUP GUIDE — Step by Step
## EstateFlow Production Setup
### Your Project: https://supabase.com/dashboard/project/fhnzqitzazameullngdys

---

## OVERVIEW — What We're Doing

| Step | What | Time |
|------|------|------|
| 1 | Run Database Migrations (create tables) | 5 min |
| 2 | Enable Authentication Providers | 3 min |
| 3 | Create Storage Bucket (for logos/images) | 2 min |
| 4 | Add Environment Variables | 2 min |
| 5 | Deploy Edge Functions (payment backend) | 5 min |
| 6 | Verify Everything Works | 3 min |

**Total time: ~20 minutes**

---

## STEP 1: Run Database Migrations

This creates all the tables, security policies, and functions EstateFlow needs.

### 1a. Open SQL Editor

1. Go to 👉 **https://supabase.com/dashboard/project/fhnzqitzazameullngdys/sql-editor**
2. Click **"New query"**

### 1b. Run Migration 001 — Core Tables

1. Open the file `supabase/migrations/001_core_tables.sql` on your laptop
2. **Copy ALL the text** (Ctrl+A, Ctrl+C)
3. **Paste it** into the Supabase SQL Editor
4. Click **"Run"** (bottom right, or press Ctrl+Enter)
5. You should see: ✅ `Success. No rows returned`

**What this created:**
- `profiles` table (user profiles)
- `estates` table (estate records)
- `estate_memberships` table (who belongs where)
- `units` table (houses/flats)
- `unit_memberships` table (tenant ↔ unit)
- RLS policies on all tables
- Auto-profile creation trigger

### 1c. Run Migration 002 — Finance Tables

1. Click **"New query"** again
2. Open `supabase/migrations/002_finance_tables.sql`
3. **Copy ALL the text** → Paste → Click **"Run"**
4. You should see: ✅ `Success. No rows returned`

**What this created:**
- `invoices` table (estate dues bills)
- `payments` table (actual money received)
- `payment_events` table (audit trail)
- `manual_payments` table (Opay/Moniepoint fallback)
- `calculate_invoice_amounts()` function
- RLS policies

### 1d. Run Migration 003 — Operations Tables

1. Click **"New query"** again
2. Open `supabase/migrations/003_operations_tables.sql`
3. **Copy ALL the text** → Paste → Click **"Run"**
4. You should see: ✅ `Success. No rows returned`

**What this created:**
- `announcements`, `notifications`
- `maintenance_tickets`, `maintenance_events`
- `emergency_alerts`
- `guest_invites`
- `qr_tokens` (secure, hashed)
- `verification_challenges` (tenant PIN verification)
- `estate_branding` (customization storage)
- `audit_logs`
- `search_tenants()` function
- RLS on all tables

### 1e. Verify Tables Were Created

1. Go to 👉 **https://supabase.com/dashboard/project/fhnzqitzazameullngdys/table-editor**
2. You should see **17+ tables** in the left sidebar:
   - `profiles`
   - `estates`
   - `estate_memberships`
   - `units`
   - `unit_memberships`
   - `invoices`
   - `payments`
   - `payment_events`
   - `manual_payments`
   - `announcements`
   - `announcement_reads`
   - `notifications`
   - `maintenance_tickets`
   - `maintenance_events`
   - `emergency_alerts`
   - `guest_invites`
   - `qr_tokens`
   - `verification_challenges`
   - `estate_branding`
   - `audit_logs`

---

## STEP 2: Enable Authentication Providers

### 2a. Enable Email/Password Auth

1. Go to 👉 **https://supabase.com/dashboard/project/fhnzqitzazameullngdys/auth/providers**
2. Make sure **"Email"** is **enabled** (it should be by default)
3. Under Email settings:
   - ✅ Confirm email: **ON** (recommended) or **OFF** for testing
   - If OFF: users can sign in immediately without confirming email

### 2b. Enable Google Sign-In (Optional but Recommended)

1. In the same Providers page, find **"Google"**
2. Click to enable it
3. You'll need Google OAuth credentials:
   - Go to 👉 **https://console.cloud.google.com/apis/credentials**
   - Create a new project (or use existing)
   - Go to **OAuth consent screen** → set app name to "EstateFlow"
   - Go to **Credentials** → **Create OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `https://fhnzqitzazameullngdys.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
4. Back in Supabase, paste the Client ID and Client Secret
5. Click **Save**

### 2c. Verify Auth Settings

1. Go to 👉 **https://supabase.com/dashboard/project/fhnzqitzazameullngdys/auth/users**
2. You should see the Auth page (may be empty if no users yet)

---

## STEP 3: Create Storage Bucket

For estate logos, background images, and other uploads.

### 3a. Create the Bucket

1. Go to 👉 **https://supabase.com/dashboard/project/fhnzqitzazameullngdys/storage**
2. Click **"New bucket"**
3. Name: `estate-assets`
4. Toggle **"Public bucket"** → **ON** (so images can be displayed)
5. Click **"Create bucket"**

### 3b. Set Storage Policies

1. Click on the `estate-assets` bucket
2. Go to the **"Policies"** tab
3. Click **"New policy"** → **"Create a policy from scratch"**
4. Paste this SQL and run:

```sql
-- Anyone can view estate assets (public images)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'estate-assets');

-- Only authenticated managers can upload
CREATE POLICY "Managers can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'estate-assets'
  AND auth.role() = 'authenticated'
);

-- Managers can update their own uploads
CREATE POLICY "Managers can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'estate-assets'
  AND auth.role() = 'authenticated'
);

-- Managers can delete
CREATE POLICY "Managers can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'estate-assets'
  AND auth.role() = 'authenticated'
);
```

5. Click **"Run"**

---

## STEP 4: Add Environment Variables (Vercel)

Your app on Vercel needs the Supabase credentials to work.

### 4a. Open Vercel Settings

1. Go to 👉 **https://vercel.com/dashboard**
2. Click on your **estateflow-app** project
3. Go to **Settings** → **Environment Variables**

### 4b. Add Supabase Variables

Add these 2 variables (for Production, Preview, and Development):

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | `https://fhnzqitzazameullngdys.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(copy from your Supabase Dashboard → Settings → API → anon public key)* |

### 4c. Find Your Anon Key

1. Go to 👉 **https://supabase.com/dashboard/project/fhnzqitzazameullngdys/settings/api**
2. Under **"Project API keys"**, find the **`anon` `public`** key
3. Click the copy icon
4. Paste it as the value for `VITE_SUPABASE_ANON_KEY` in Vercel

### 4d. Redeploy

1. Go to **Deployments** tab in Vercel
2. Click **⋮** on the latest deployment → **Redeploy**
3. Wait for it to finish

---

## STEP 5: Deploy Edge Functions (Payment Backend)

This makes the payment system actually work.

### 5a. Install Supabase CLI (One Time)

On your laptop, open Command Prompt and run:
```
npm install -g supabase
```

### 5b. Login to Supabase CLI

```
supabase login
```
This opens a browser — click "Authorize".

### 5c. Link Your Project

```
cd C:\Users\Ebuka\Desktop\estateflow-app
supabase link --project-ref fhnzqitzazameullngdys
```

### 5d. Set Paystack Secret Key

⚠️ **You need a Paystack account first!**

1. Go to 👉 **https://dashboard.paystack.com**
2. Sign up (or log in)
3. Go to **Settings → API Keys**
4. Copy the **Secret Key** (test or live)
5. Back in terminal, run:

```
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_key_here
```

### 5e. Deploy the Functions

```
supabase functions deploy initialize-payment
supabase functions deploy paystack-webhook
```

You should see: ✅ `Deployed Function ...`

### 5f. Set Up Paystack Webhook

1. Go to 👉 **https://dashboard.paystack.com/settings/developer**
2. Under **"Webhooks"**, click **"Add webhook URL"**
3. URL: `https://fhnzqitzazameullngdys.supabase.co/functions/v1/paystack-webhook`
4. Events: Select **"charge.success"** (and optionally "charge.failed")
5. Save — Paystack will show you the webhook signing key
6. **This is already handled in the Edge Function** (uses PAYSTACK_SECRET_KEY for HMAC)

---

## STEP 6: Verify Everything Works

### 6a. Test Signup

1. Open your app: **estateflow-app-seven.vercel.app**
2. Click **Estate Manager** → **Sign Up**
3. Enter email + password
4. Should create account and go to dashboard
5. Check Supabase → Auth → Users — you should see the new user

### 6b. Test Database

1. Go to Supabase → SQL Editor → New query
2. Run:
```sql
SELECT * FROM public.estates LIMIT 5;
```
3. If you created an estate from the app, it should appear here

### 6c. Test Auth Gate

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Try: `localStorage.setItem('ef_role', 'manager')`
4. Refresh the page
5. **Should redirect to login** (NOT dashboard) — this proves the auth gate works!

### 6d. Test on Your Phone

1. Open **estateflow-app-seven.vercel.app** on your phone
2. Sign up with a new account
3. Create an estate
4. Verify the app works properly (no blank screen!)

---

## TROUBLESHOOTING

### "relation already exists" error
A migration was already run. Skip it and run the next one.

### "permission denied" error
The RLS policies might not have been applied. Re-run the migration.

### App shows blank white screen on Vercel
Check Vercel → Environment Variables — make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, then redeploy.

### "function does not exist" error
The Edge Functions haven't been deployed yet. Follow Step 5.

### Google Sign-In doesn't work
Make sure you added the redirect URI correctly:
`https://fhnzqitzazameullngdys.supabase.co/auth/v1/callback`

---

## CHECKLIST

After completing all steps, verify:

- [ ] 17+ tables visible in Table Editor
- [ ] Email provider enabled in Auth
- [ ] Google provider enabled (optional)
- [ ] `estate-assets` storage bucket created
- [ ] Storage policies applied
- [ ] Vercel env vars set (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- [ ] Vercel redeployed
- [ ] Supabase CLI installed + linked
- [ ] PAYSTACK_SECRET_KEY set in Supabase secrets
- [ ] initialize-payment function deployed
- [ ] paystack-webhook function deployed
- [ ] Paystack webhook URL configured
- [ ] Signup works on desktop
- [ ] Signup works on phone
- [ ] Auth gate prevents localStorage bypass
- [ ] Estate creation saves to database

---

**After completing this guide, your EstateFlow app will have:**
- ✅ Real database with all tables
- ✅ Secure authentication
- ✅ RLS protection on all data
- ✅ Working payment backend
- ✅ Proper estate isolation
