import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add Iconify and QR imports
content = content.replace(
    "import { useState, useEffect, useCallback } from 'react'",
    "import { useState, useEffect, useCallback } from 'react'\nimport { Icon } from '@iconify/react'\nimport { QRCodeSVG } from 'qrcode.react'"
)

# 2. Replace empty avatars with SVG designs
old_avatars = "const AVATARS = ['','','','','','','','','','']"
new_avatars = '''const AVATAR_SVGS = [
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
const AVATARS = AVATAR_SVGS'''
content = content.replace(old_avatars, new_avatars)

# 3. Replace tenant header avatar
content = content.replace(
    """{tenant?.avatar || '👤'}""",
    """<div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html: tenant?.avatar || AVATAR_SVGS[0]}} />"""
)

# 4. Replace avatar selector buttons (both occurrences)
content = content.replace(
    '{AVATARS.map((a) => (<button key={a} onClick={() => setAvatar(a)} className={"w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all bg-white " + (avatar === a ? \'ring-4 shadow-lg\' : \'\')} style={{ borderColor: avatar === a ? config.color : \'transparent\', borderWidth: avatar === a ? \'3px\' : \'0\' }}>{a}</button>))}',
    '{AVATARS.map((a, i) => (<button key={i} onClick={() => setAvatar(a)} className={"w-12 h-12 rounded-full transition-all bg-white overflow-hidden " + (avatar === a ? \'ring-4 shadow-lg\' : \'\')} style={{ borderColor: avatar === a ? config.color : \'transparent\', borderWidth: avatar === a ? \'3px\' : \'0\' }}><div style={{width:\'100%\',height:\'100%\'}} dangerouslySetInnerHTML={{__html: a}} /></button>))}'
)

content = content.replace(
    '{AVATARS.map((a) => (<button key={a} onClick={() => setAvatar(a)} className={"w-12 h-12 rounded-full text-2xl flex items-center justify-center bg-white " + (avatar === a ? \'ring-4\' : \'\')} style={{ borderColor: avatar === a ? config.color : \'transparent\', borderWidth: avatar === a ? \'3px\' : \'0\' }}>{a}</button>))}',
    '{AVATARS.map((a, i) => (<button key={i} onClick={() => setAvatar(a)} className={"w-12 h-12 rounded-full bg-white overflow-hidden " + (avatar === a ? \'ring-4\' : \'\')} style={{ borderColor: avatar === a ? config.color : \'transparent\', borderWidth: avatar === a ? \'3px\' : \'0\' }}><div style={{width:\'100%\',height:\'100%\'}} dangerouslySetInnerHTML={{__html: a}} /></button>))}'
)

# 5. Replace tenant bottom nav emojis with Iconify icons
content = content.replace(
    """[{ label: 'Home', icon: '🏠', s: 'tenant-home' as Screen }, { label: 'Bills', icon: '💳', s: 'tenant-bills' as Screen }, { label: 'Complain', icon: '⚠️', s: 'tenant-complaints' as Screen }, { label: 'Emergency', icon: '🚨', s: 'emergency' as Screen }, { label: 'Guest', icon: '👥', s: 'guest' as Screen }].map((item, i) => (<button key={i} onClick={() => go(item.s)} className="flex-1 py-3 flex flex-col items-center gap-1 transition-colors"><span className="text-lg">{item.icon}</span><span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</span></button>))""",
    """[{ label: 'Home', icon: 'mdi:home', s: 'tenant-home' as Screen }, { label: 'Bills', icon: 'mdi:credit-card', s: 'tenant-bills' as Screen }, { label: 'Complain', icon: 'mdi:alert-circle', s: 'tenant-complaints' as Screen }, { label: 'Emergency', icon: 'mdi:alarm-light', s: 'emergency' as Screen }, { label: 'Guest', icon: 'mdi:account-group', s: 'guest' as Screen }].map((item, i) => (<button key={i} onClick={() => go(item.s)} className="flex-1 py-3 flex flex-col items-center gap-1 transition-colors"><Icon icon={item.icon} width="22" height="22" style={{ color: 'rgba(255,255,255,0.9)' }} /><span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</span></button>))"""
)

# 6. Replace QR share screen with real QR code
old_qr = """function QRShareScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Share Access</h2></div><div className="flex-1 px-5 py-6 flex flex-col items-center gap-5"><div className="bg-white rounded-3xl p-5 shadow-sm w-full flex flex-col items-center gap-4"><p className="text-sm text-gray-500 font-medium">{"Share with tenants to join " + config.estateName}</p><div className="p-3 border-2 border-gray-100 rounded-2xl"><div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-6xl">📱</div></div><div className="bg-gray-50 rounded-2xl px-6 py-3 border border-gray-200 w-full text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Join Code</p><p className="text-2xl font-black tracking-widest">{config.joinCode}</p></div></div><div className="grid grid-cols-3 gap-3 w-full">{['WhatsApp', 'Messages', 'Copy'].map((a) => (<button key={a} className="py-3 bg-white rounded-xl font-bold text-sm text-gray-700 shadow-sm active:scale-[0.98]">{a}</button>))}</div></div></div>
}"""

new_qr = """function QRShareScreen({ go, config }: { go: (s: Screen) => void; config: EstateConfig }) {
  return <div className="flex flex-col h-full" style={{ backgroundColor: config.color + '12' }}><div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100"><PageBack onClick={() => go('manager-home')} /><h2 className="font-black text-xl">Share Access</h2></div><div className="flex-1 px-5 py-6 flex flex-col items-center gap-5"><div className="bg-white rounded-3xl p-5 shadow-lg w-full flex flex-col items-center gap-4"><p className="text-sm text-gray-500 font-medium">{"Share with tenants to join " + config.estateName}</p><div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner"><QRCodeSVG value={config.joinCode} size={200} bgColor="#ffffff" fgColor={config.color} level="H" includeMargin={true} /></div><div className="bg-gray-50 rounded-2xl px-6 py-3 border border-gray-200 w-full text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Join Code</p><p className="text-2xl font-black tracking-widest" style={{ color: config.color }}>{config.joinCode}</p></div><div className="flex items-center gap-2 text-xs text-gray-400"><Icon icon="mdi:shield-check" width="16" height="16" /><span>Secure and unique to your estate</span></div></div><div className="grid grid-cols-3 gap-3 w-full">{[{label:"WhatsApp",icon:"mdi:whatsapp"},{label:"Messages",icon:"mdi:message-text"},{label:"Copy",icon:"mdi:content-copy"}].map((a) => (<button key={a.label} className="py-3 bg-white rounded-xl font-bold text-sm text-gray-700 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"><Icon icon={a.icon} width="18" height="18" style={{ color: config.color }} /><span>{a.label}</span></button>))}</div></div></div>
}"""

content = content.replace(old_qr, new_qr)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("✅ Premium UI applied successfully")
