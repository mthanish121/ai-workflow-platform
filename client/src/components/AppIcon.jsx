import React from 'react';

// Crisp official brand SVG logos matching Zapier integration tiles
export function AppIcon({ name, size = 'md', className = '' }) {
  const norm = (name || '').toLowerCase().trim();
  
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const sz = sizeMap[size] || sizeMap.md;

  // 0. Formatter by Zapier
  if (norm.includes('formatter') || norm.includes('zapier')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#FFF3E0"/>
        <path d="M9 13.5C11 11 13 11 15 13.5C17 16 19 16 23 13.5" stroke="#FF4F00" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M9 18.5C11 16 13 16 15 18.5C17 21 19 21 23 18.5" stroke="#FF4F00" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // 0.1 Google Contacts
  if (norm.includes('contact')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#4285F4"/>
        <circle cx="16" cy="13" r="4.5" fill="#FFFFFF"/>
        <path d="M8.5 24C8.5 20 12 19 16 19C20 19 23.5 20 23.5 24" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 0.2 Twilio
  if (norm.includes('twilio') || norm.includes('sms')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#F22F46"/>
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF"/>
        <circle cx="20" cy="12" r="2.5" fill="#FFFFFF"/>
        <circle cx="12" cy="20" r="2.5" fill="#FFFFFF"/>
        <circle cx="20" cy="20" r="2.5" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 1. Google Sheets
  if (norm.includes('sheet')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <path d="M19.5 2H8C6.89543 2 6 2.89543 6 4V28C6 29.1046 6.89543 30 8 30H24C25.1046 30 26 29.1046 26 28V8.5L19.5 2Z" fill="#0F9D58"/>
        <path d="M19.5 2V8.5H26L19.5 2Z" fill="#87CEAC"/>
        <rect x="10" y="14" width="12" height="10" rx="1" fill="#FFFFFF"/>
        <path d="M10 18H22M10 21H22M15 14V24" stroke="#0F9D58" strokeWidth="1.5"/>
      </svg>
    );
  }

  // 2. Gmail
  if (norm.includes('gmail') || (norm.includes('mail') && !norm.includes('chimp'))) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <path d="M6 8L16 16L26 8" stroke="#EA4335" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 8V24C6 24.5523 6.44772 25 7 25H9V12L16 17.5L23 12V25H25C25.5523 25 26 24.5523 26 24V8L16 16L6 8Z" fill="#EA4335"/>
        <path d="M6 9V24C6 24.5523 6.44772 25 7 25H9V12L6 9Z" fill="#4285F4"/>
        <path d="M26 9V24C26 24.5523 25.5523 25 25 25H23V12L26 9Z" fill="#34A853"/>
        <path d="M6 8L16 16L9 12L6 8Z" fill="#FBBC05"/>
        <path d="M26 8L16 16L23 12L26 8Z" fill="#EA4335"/>
      </svg>
    );
  }

  // 3. Google Calendar
  if (norm.includes('calendar')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="22" rx="4" fill="#4285F4"/>
        <rect x="7" y="12" width="18" height="13" rx="2" fill="#FFFFFF"/>
        <path d="M10 4V8M22 4V8" stroke="#1A73E8" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12 18L15 21L20 16" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  // 4. Facebook / Meta Lead Ads
  if (norm.includes('facebook') || norm.includes('meta')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#1877F2"/>
        <path d="M18.5 16.5H21L21.5 13.5H18.5V11.5C18.5 10.7 18.8 10 20 10H21.5V7.2C21.2 7.15 20.2 7 19 7C16.5 7 14.8 8.5 14.8 11.2V13.5H12V16.5H14.8V25H18.5V16.5Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 5. Pipedrive
  if (norm.includes('pipedrive')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#000000"/>
        <circle cx="16" cy="16" r="13" fill="#26292C"/>
        <path d="M13 9H17.5C19.9853 9 22 11.0147 22 13.5C22 15.9853 19.9853 18 17.5 18H15V23H13V9ZM15 11V16H17.5C18.8807 16 20 14.8807 20 13.5C20 12.1193 18.8807 11 17.5 11H15Z" fill="#28A745"/>
      </svg>
    );
  }

  // 6. Asana
  if (norm.includes('asana')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#FC636B" fillOpacity="0.1"/>
        <circle cx="16" cy="11" r="4.5" fill="#F06A6A"/>
        <circle cx="10" cy="21" r="4.5" fill="#F06A6A"/>
        <circle cx="22" cy="21" r="4.5" fill="#F06A6A"/>
      </svg>
    );
  }

  // 7. Lead / CRM / HubSpot / Inbound
  if (norm.includes('crm') || norm.includes('hubspot') || norm.includes('lead')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#8B0029"/>
        <circle cx="16" cy="13" r="4" fill="#FFFFFF"/>
        <path d="M9 23C9 19.5 12 18 16 18C20 18 23 19.5 23 23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  // 8. Telegram
  if (norm.includes('telegram')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#24A1DE"/>
        <path d="M8 15.5L23.5 9.5L19.5 23.5L15 19L12.5 21V17.5L20 11.5L11 16.5L8 15.5Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 9. Notion
  if (norm.includes('notion')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="5" fill="#000000"/>
        <path d="M9 10L20 8.5L23 10V22L13 23.5L9 21V10Z" fill="#FFFFFF"/>
        <path d="M12 12.5V20.5L14 20.2V14.2L19 20L20.5 19.8V11.8L18.5 12V18L13.5 12.3L12 12.5Z" fill="#000000"/>
      </svg>
    );
  }

  // 10. Slack
  if (norm.includes('slack')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <path d="M12.5 8C12.5 6.6 11.4 5.5 10 5.5C8.6 5.5 7.5 6.6 7.5 8C7.5 9.4 8.6 10.5 10 10.5H12.5V8Z" fill="#E01E5A"/>
        <path d="M14 8C14 9.4 15.1 10.5 16.5 10.5C17.9 10.5 19 9.4 19 8V5.5C19 4.1 17.9 3 16.5 3C15.1 3 14 4.1 14 5.5V8Z" fill="#2EB67D"/>
        <path d="M19.5 14C18.1 14 17 15.1 17 16.5C17 17.9 18.1 19 19.5 19H22C23.4 19 24.5 17.9 24.5 16.5C24.5 15.1 23.4 14 22 14H19.5Z" fill="#ECB22E"/>
        <path d="M18 19.5C18 18.1 16.9 17 15.5 17C14.1 17 13 18.1 13 19.5V22C13 23.4 14.1 24.5 15.5 24.5C16.9 24.5 18 23.4 18 22V19.5Z" fill="#E01E5A"/>
        <path d="M7.5 16.5C7.5 15.1 8.6 14 10 14H12.5V16.5C12.5 17.9 11.4 19 10 19C8.6 19 7.5 17.9 7.5 16.5Z" fill="#36C5F0"/>
        <path d="M22 10.5C23.4 10.5 24.5 9.4 24.5 8C24.5 6.6 23.4 5.5 22 5.5H19.5V10.5H22Z" fill="#ECB22E"/>
        <path d="M14 13.5C14 12.1 15.1 11 16.5 11C17.9 11 19 12.1 19 13.5V16H14V13.5Z" fill="#36C5F0"/>
        <path d="M10 22C8.6 22 7.5 20.9 7.5 19.5C7.5 18.1 8.6 17 10 17H12.5V22H10Z" fill="#2EB67D"/>
      </svg>
    );
  }

  // 11. Google Gemini AI / AI
  if (norm.includes('gemini') || norm.includes('ai') || norm.includes('copilot')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="geminiGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1BA1E2"/>
            <stop offset="0.5" stopColor="#9B51E0"/>
            <stop offset="1" stopColor="#FA709A"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#geminiGrad)"/>
        <path d="M16 8C16 12.4 12.4 16 8 16C12.4 16 16 19.6 16 24C16 19.6 19.6 16 24 16C19.6 16 16 12.4 16 8Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 12. Stripe
  if (norm.includes('stripe')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#635BFF"/>
        <path d="M15.5 13.2C15.5 12.5 16.1 12 17.2 12C18.4 12 19.8 12.4 20.8 13V9.8C19.6 9.3 18.3 9 17 9C13.8 9 11.8 10.6 11.8 13.5C11.8 18 17.8 17.2 17.8 19.2C17.8 20.1 17 20.6 15.8 20.6C14.4 20.6 12.8 20 11.6 19.2V22.5C13 23.1 14.5 23.4 16 23.4C19.3 23.4 21.5 21.8 21.5 18.8C21.5 14 15.5 14.9 15.5 13.2Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 13. Zendesk
  if (norm.includes('zendesk')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#03363D"/>
        <path d="M10 10H16L10 18V22H16L10 10Z" fill="#00A656"/>
        <path d="M22 22H16L22 14V10H16L22 22Z" fill="#78A300"/>
      </svg>
    );
  }

  // 14. Shopify
  if (norm.includes('shopify')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#95BF47"/>
        <path d="M19.5 8L12.5 10L10 24L22 22L19.5 8Z" fill="#FFFFFF"/>
        <path d="M14.5 11C14.5 9.5 15.5 8.5 16.8 8.5C18.1 8.5 18.8 9.5 18.8 11" stroke="#95BF47" strokeWidth="1.5"/>
        <path d="M17 14L15 18L18 19" stroke="#95BF47" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // 15. QuickBooks
  if (norm.includes('quickbook')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" fill="#2CA01C"/>
        <path d="M12 11V21C12 21 14 21 15 20C16 19 16 17 16 16C16 15 16 13 15 12C14 11 12 11 12 11ZM20 21V11C20 11 18 11 17 12C16 13 16 15 16 16C16 17 16 19 17 20C18 21 20 21 20 21Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 16. GitHub
  if (norm.includes('github')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#24292E"/>
        <path d="M16 6C10.5 6 6 10.5 6 16C6 20.4 8.9 24.1 12.8 25.4C13.3 25.5 13.5 25.2 13.5 24.9V23.2C10.7 23.8 10.1 21.9 10.1 21.9C9.7 20.8 9 20.5 9 20.5C8.1 19.9 9.1 19.9 9.1 19.9C10.1 20 10.6 21 10.6 21C11.5 22.5 13 22.1 13.5 21.8C13.6 21.1 13.9 20.7 14.2 20.4C12 20.1 9.6 19.3 9.6 15.5C9.6 14.4 10 13.5 10.7 12.8C10.6 12.5 10.2 11.5 10.8 10.1C10.8 10.1 11.7 9.8 13.6 11.1C14.4 10.9 15.2 10.8 16 10.8C16.8 10.8 17.6 10.9 18.4 11.1C20.3 9.8 21.2 10.1 21.2 10.1C21.8 11.5 21.4 12.5 21.3 12.8C22 13.5 22.4 14.4 22.4 15.5C22.4 19.3 20 20.1 17.8 20.4C18.2 20.7 18.5 21.3 18.5 22.2V24.9C18.5 25.2 18.7 25.5 19.2 25.4C23.1 24.1 26 20.4 26 16C26 10.5 21.5 6 16 6Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 17. Claude / Anthropic
  if (norm.includes('claude code')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="5" y="7" width="22" height="18" rx="4" fill="#C08465"/>
        <rect x="9" y="11" width="3" height="3" rx="0.5" fill="#2E1B15"/>
        <rect x="20" y="11" width="3" height="3" rx="0.5" fill="#2E1B15"/>
        <path d="M13 18H19" stroke="#2E1B15" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  if (norm.includes('claude')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#D97757"/>
        <path d="M16 6V26M6 16H26M8.9 8.9L23.1 23.1M8.9 23.1L23.1 8.9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // 18. ChatGPT / OpenAI
  if (norm.includes('chatgpt') || norm.includes('openai')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#10A37F"/>
        <path d="M16 9C12.5 9 10 11.5 10 14.5C10 15.2 10.2 15.8 10.5 16.4L9.5 19.5L12.8 18.8C13.7 19.5 14.8 20 16 20C19.5 20 22 17.5 22 14.5C22 11.5 19.5 9 16 9Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    );
  }

  // 19. Cursor
  if (norm.includes('cursor')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#1E1E1E"/>
        <path d="M16 6L25 11.5V20.5L16 26L7 20.5V11.5L16 6Z" fill="#383838"/>
        <path d="M16 6L25 11.5L16 16.5L7 11.5L16 6Z" fill="#606060"/>
        <path d="M16 16.5V26L25 20.5V11.5L16 16.5Z" fill="#4B4B4B"/>
      </svg>
    );
  }

  // 20. OpenClaw
  if (norm.includes('openclaw') || norm.includes('claw')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#E11D48"/>
        <path d="M11 11C11 9 14 7 16 9C18 7 21 9 21 11C21 14 18 17 16 19C14 17 11 14 11 11Z" fill="#FFFFFF"/>
        <circle cx="16" cy="23" r="2" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 21. Muse
  if (norm.includes('muse')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#0284C7"/>
        <path d="M10 22V10L16 17L22 10V22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  // 22. Grok Bot
  if (norm.includes('grok')) {
    return (
      <svg className={`${sz} ${className}`} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#000000"/>
        <circle cx="16" cy="16" r="8" stroke="#FFFFFF" strokeWidth="2.5"/>
        <path d="M10 22L22 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // Fallback: Elegant generic tool icon
  return (
    <div className={`${sz} rounded-md bg-slate-700/80 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-white uppercase ${className}`}>
      {name ? name.slice(0, 2) : 'AP'}
    </div>
  );
}

// Visual Workflow Step Pipeline Preview Bar (Zapier Style with white tile icons, badges & arrow)
export function TemplateIconStrip({ apps = [], stepsCount = 2, targetApp = null }) {
  // If targetApp is provided, split apps into source trigger apps and destination app
  const primaryApps = apps.slice(0, 3);
  const remainingCount = Math.max(0, stepsCount - primaryApps.length - (targetApp ? 1 : 0));
  const destApp = targetApp || (apps.length > 3 ? apps[apps.length - 1] : null);

  return (
    <div className="flex items-center justify-center p-2.5 rounded-xl bg-slate-950/80 shadow-sm border border-slate-800 gap-2">
      {/* Source Step Icons */}
      <div className="flex items-center gap-1.5">
        {primaryApps.map((app, i) => (
          <div
            key={`${app}-${i}`}
            className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
            title={app}
          >
            <AppIcon name={app} size="md" />
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="px-1.5 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-400 font-mono">
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Arrow Indicator */}
      <div className="text-cyan-400 font-black text-xs px-0.5">
        →
      </div>

      {/* Destination Target App Tile */}
      <div
        className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
        title={destApp || 'Action'}
      >
        <AppIcon name={destApp || primaryApps[primaryApps.length - 1]} size="md" />
      </div>
    </div>
  );
}
