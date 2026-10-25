#!/bin/bash

echo "🚀 ESTATEFLOW DEPLOYMENT SCRIPT"
echo "================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if logged in
echo "🔐 Checking Supabase login..."
supabase whoami 2>/dev/null
if [ $? -ne 0 ]; then
    echo "🔑 Please login to Supabase:"
    supabase login
fi

# Link project
echo ""
echo "🔗 Linking to project..."
supabase link --project-ref fhnzqitzazameullngdys

# Set secrets
echo ""
echo " Setting secrets..."
read -p "Enter Paystack Secret Key (sk_live_...): " PAYSTACK_KEY
supabase secrets set PAYSTACK_SECRET_KEY=$PAYSTACK_KEY

# Deploy functions
echo ""
echo "⚙️  Deploying Edge Functions..."
supabase functions deploy initialize-payment
supabase functions deploy paystack-webhook

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Next steps:"
echo "1. Add Paystack webhook URL to your Paystack dashboard:"
echo "   https://fhnzqitzazameullngdys.supabase.co/functions/v1/paystack-webhook"
echo ""
echo "2. Create subaccounts for each estate in Paystack"
echo ""
echo "3. Test with a small payment"
echo ""
echo "4. Your app is ready for production! 🚀"
