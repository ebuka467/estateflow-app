// ============================================
// ESTATEFLOW LEGAL DOCUMENTS (DRAFT)
// All documents marked as DRAFT — require review by Nigerian counsel
// ============================================

import { PageBack } from './components'
import type { Screen } from './types'

// ============================================
// PRIVACY POLICY
// ============================================
export function PrivacyPolicy({ go, config }: { go: (s: Screen) => void; config: any }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-gray-100">
        <PageBack onClick={() => go('manager-settings')} />
        <h2 className="font-black text-xl">Privacy Policy</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-yellow-800 font-bold">⚠️ DRAFT — Requires review by Nigerian legal counsel</p>
          <p className="text-xs text-yellow-700 mt-1">This is a template. Consult a lawyer before publishing.</p>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-xs text-gray-500 mb-4">Last updated: [DATE]</p>
          
          <h3 className="font-bold text-lg mb-2">1. Introduction</h3>
          <p className="text-sm text-gray-700 mb-4">
            [COMPANY NAME] ("we", "our", "us") operates EstateFlow, a digital estate management platform. 
            This Privacy Policy explains how we collect, use, and protect your personal information in 
            compliance with the Nigeria Data Protection Act 2023.
          </p>

          <h3 className="font-bold text-lg mb-2">2. Information We Collect</h3>
          <p className="text-sm text-gray-700 mb-2">We collect:</p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li><strong>Account information:</strong> Name, email, phone number</li>
            <li><strong>Estate information:</strong> Estate name, address, bank details (managers only)</li>
            <li><strong>Unit information:</strong> House/flat number, move-in date (tenants only)</li>
            <li><strong>Payment information:</strong> Processed by Paystack (we don't store card details)</li>
            <li><strong>Usage data:</strong> App interactions, feature usage, device information</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">3. How We Use Your Information</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Provide estate management services</li>
            <li>Process payments and settlements</li>
            <li>Send notifications and announcements</li>
            <li>Improve our services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">4. Data Sharing</h3>
          <p className="text-sm text-gray-700 mb-4">
            We share data only with:
          </p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li><strong>Paystack:</strong> For payment processing</li>
            <li><strong>Supabase:</strong> For data storage (hosted securely)</li>
            <li><strong>Estate managers:</strong> Can view tenant data within their estate only</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">5. Data Retention</h3>
          <p className="text-sm text-gray-700 mb-4">
            We retain data for as long as your account is active, plus [X] years for legal compliance. 
            Payment records are kept for [X] years per financial regulations.
          </p>

          <h3 className="font-bold text-lg mb-2">6. Your Rights</h3>
          <p className="text-sm text-gray-700 mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request data deletion</li>
            <li>Export your data</li>
            <li>Withdraw consent</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">7. Contact Us</h3>
          <p className="text-sm text-gray-700 mb-4">
            For privacy concerns, contact our Data Protection Officer:<br/>
            Email: [DPO EMAIL]<br/>
            Address: [COMPANY ADDRESS]
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// TERMS OF SERVICE
// ============================================
export function TermsOfService({ go, config }: { go: (s: Screen) => void; config: any }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-gray-100">
        <PageBack onClick={() => go('manager-settings')} />
        <h2 className="font-black text-xl">Terms of Service</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-yellow-800 font-bold">⚠️ DRAFT — Requires review by Nigerian legal counsel</p>
          <p className="text-xs text-yellow-700 mt-1">This is a template. Consult a lawyer before publishing.</p>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-xs text-gray-500 mb-4">Last updated: [DATE]</p>
          
          <h3 className="font-bold text-lg mb-2">1. Acceptance of Terms</h3>
          <p className="text-sm text-gray-700 mb-4">
            By using EstateFlow, you agree to these Terms of Service. If you don't agree, 
            please don't use our services.
          </p>

          <h3 className="font-bold text-lg mb-2">2. Description of Service</h3>
          <p className="text-sm text-gray-700 mb-4">
            EstateFlow is a digital platform for estate management. We provide tools for 
            estate managers, tenants, and service staff to manage dues, payments, maintenance, 
            and communication.
          </p>

          <h3 className="font-bold text-lg mb-2">3. User Accounts</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>You must provide accurate information</li>
            <li>You're responsible for your account security</li>
            <li>One account per person (unless authorized)</li>
            <li>We can suspend accounts for violations</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">4. Payment Terms</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>EstateFlow charges a 10% service fee on payments</li>
            <li>Fees are added on top of estate dues (not deducted)</li>
            <li>Payments are processed by Paystack</li>
            <li>Refunds follow our Refund Policy</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">5. User Responsibilities</h3>
          <p className="text-sm text-gray-700 mb-2"><strong>Estate Managers must:</strong></p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Provide accurate estate information</li>
            <li>Verify payments promptly</li>
            <li>Respond to tenant requests</li>
            <li>Use emergency features responsibly</li>
          </ul>

          <p className="text-sm text-gray-700 mb-2"><strong>Tenants must:</strong></p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Pay dues on time</li>
            <li>Provide accurate unit information</li>
            <li>Use maintenance features appropriately</li>
            <li>Report emergencies truthfully</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">6. Prohibited Activities</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Fake emergency reports</li>
            <li>Fraudulent payment attempts</li>
            <li>Harassment through the platform</li>
            <li>Unauthorized access to other users' data</li>
            <li>Reverse engineering the app</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">7. Limitation of Liability</h3>
          <p className="text-sm text-gray-700 mb-4">
            EstateFlow is provided "as is". We're not liable for:
          </p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Service interruptions</li>
            <li>Data loss (though we back up regularly)</li>
            <li>Third-party service failures (Paystack, etc.)</li>
            <li>Emergency response delays (we're not an emergency service)</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">8. Termination</h3>
          <p className="text-sm text-gray-700 mb-4">
            We can terminate accounts for violations. You can delete your account anytime. 
            Upon termination, you can request data export within 30 days.
          </p>

          <h3 className="font-bold text-lg mb-2">9. Governing Law</h3>
          <p className="text-sm text-gray-700 mb-4">
            These terms are governed by Nigerian law. Disputes will be resolved in Nigerian courts.
          </p>

          <h3 className="font-bold text-lg mb-2">10. Contact</h3>
          <p className="text-sm text-gray-700 mb-4">
            Questions about these terms?<br/>
            Email: [SUPPORT EMAIL]<br/>
            Address: [COMPANY ADDRESS]
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PAYMENT & REFUND POLICY
// ============================================
export function PaymentRefundPolicy({ go, config }: { go: (s: Screen) => void; config: any }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-gray-100">
        <PageBack onClick={() => go('manager-settings')} />
        <h2 className="font-black text-xl">Payment & Refund Policy</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-yellow-800 font-bold">️ DRAFT — Requires review by Nigerian legal counsel</p>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <h3 className="font-bold text-lg mb-2">1. Payment Processing</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>All payments processed by Paystack (PCI-compliant)</li>
            <li>We accept cards, bank transfers, and USSD</li>
            <li>Payments are in Nigerian Naira (NGN) only</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">2. Fee Structure</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold mb-2">Example Payment:</p>
            <p className="text-sm text-gray-700">Estate Dues: ₦15,000</p>
            <p className="text-sm text-gray-700">EstateFlow Fee (10%): ₦1,500</p>
            <p className="text-sm font-bold text-gray-900">Total: ₦16,500</p>
            <p className="text-xs text-gray-500 mt-2">Estate receives: ₦15,000 | EstateFlow receives: ₦1,500</p>
          </div>

          <h3 className="font-bold text-lg mb-2">3. Refunds</h3>
          <p className="text-sm text-gray-700 mb-2">Refunds are available in these cases:</p>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Double payment (accidental duplicate)</li>
            <li>Payment to wrong estate (with proof)</li>
            <li>Service failure (EstateFlow's fault)</li>
          </ul>
          <p className="text-sm text-gray-700 mb-4">
            <strong>Not refundable:</strong> Estate dues paid correctly, service fees for processed payments.
          </p>

          <h3 className="font-bold text-lg mb-2">4. Refund Process</h3>
          <ol className="list-decimal pl-6 text-sm text-gray-700 mb-4">
            <li>Contact estate manager or EstateFlow support</li>
            <li>Provide payment reference and reason</li>
            <li>Review takes 5-10 business days</li>
            <li>Approved refunds processed within 7-14 days</li>
          </ol>

          <h3 className="font-bold text-lg mb-2">5. Disputes</h3>
          <p className="text-sm text-gray-700 mb-4">
            Payment disputes are handled through Paystack's dispute resolution process. 
            We'll provide transaction records upon request.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EMERGENCY DISCLAIMER
// ============================================
export function EmergencyDisclaimer({ go, config }: { go: (s: Screen) => void; config: any }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-gray-100">
        <PageBack onClick={() => go('manager-settings')} />
        <h2 className="font-black text-xl">Emergency Disclaimer</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6">
          <p className="text-red-800 font-bold mb-2">⚠️ IMPORTANT — READ CAREFULLY</p>
          <p className="text-sm text-red-700">
            EstateFlow is NOT an emergency service provider.
          </p>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <h3 className="font-bold text-lg mb-2">What EstateFlow Is</h3>
          <p className="text-sm text-gray-700 mb-4">
            EstateFlow is a communication and management platform that helps notify estate 
            security and management about emergencies within your estate.
          </p>

          <h3 className="font-bold text-lg mb-2">What EstateFlow Is NOT</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>A replacement for police, fire service, or ambulance</li>
            <li>A guarantee of emergency response</li>
            <li>Connected to government emergency services</li>
            <li>Available 24/7 (technical issues may occur)</li>
          </ul>

          <h3 className="font-bold text-lg mb-2">In a Real Emergency</h3>
          <ol className="list-decimal pl-6 text-sm text-gray-700 mb-4">
            <li><strong>First:</strong> Call appropriate emergency services (police, fire, ambulance)</li>
            <li><strong>Second:</strong> Use EstateFlow to notify estate security</li>
            <li><strong>Third:</strong> Follow instructions from emergency responders</li>
          </ol>

          <h3 className="font-bold text-lg mb-2">Emergency Numbers (Nigeria)</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700"> Police: 119 or 767</p>
            <p className="text-sm text-gray-700">🚒 Fire Service: 119 or 767</p>
            <p className="text-sm text-gray-700">🚑 Ambulance: 119 or 767</p>
            <p className="text-sm text-gray-700">🏥 National Emergency: 112</p>
          </div>

          <h3 className="font-bold text-lg mb-2">Limitations</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700 mb-4">
            <li>Alerts depend on internet connectivity</li>
            <li>Response time varies by estate staffing</li>
            <li>We're not liable for delayed responses</li>
            <li>False reports may result in account suspension</li>
          </ul>

          <p className="text-xs text-gray-500 mt-6 italic">
            By using EstateFlow's emergency feature, you acknowledge that you understand these limitations.
          </p>
        </div>
      </div>
    </div>
  )
}
