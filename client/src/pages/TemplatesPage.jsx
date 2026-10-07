import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppIcon, TemplateIconStrip } from '../components/AppIcon';
import { workflowsAPI } from '../lib/api';
import {
  Sparkles, Search, ArrowRight, Zap, Bot, Database,
  Mail, MessageSquare, Globe, Shield, ShoppingCart,
  CheckCircle2, Users, Layers, ExternalLink, Filter, Plus,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WORKFLOW_TEMPLATES = [
  {
    id: 'tpl-calendar-sales',
    title: 'Create calendar events from updated sales appointment rows',
    desc: 'Watches Google Sheets for newly booked consultations, schedules calendar appointments, and notifies your sales Slack channel.',
    category: 'Sales & CRM',
    stepsCount: 7,
    usedBy: '',
    isTop: true,
    headerBg: 'bg-[#bfe2db]', // Pastel Teal / Sage (Zapier exact)
    apps: ['Google Sheets', 'Gmail', 'Google Calendar', 'Slack'],
    sourceApps: ['Google Sheets', 'Gmail'],
    extraSteps: 3,
    targetApp: 'Google Calendar',
    trigger: {
      type: 'database_change',
      config: { source: 'google_sheets', table: 'sales_appointments', event: 'row_updated' }
    },
    conditions: [
      { field: 'status', operator: 'equals', value: 'confirmed' }
    ],
    actions: [
      { type: 'call_api', config: { endpoint: 'calendar.events.create', calendarId: 'primary' } },
      { type: 'send_email', config: { to: '{{attendee_email}}', subject: 'Consultation Confirmed' } },
      { type: 'send_slack_message', config: { channel: '#sales-alerts', message: 'New consultation confirmed with {{client_name}}' } }
    ]
  },
  {
    id: 'tpl-lead-staging',
    title: 'Create staging leads from ad forms for rapid follow-up',
    desc: 'Captures incoming Facebook & Google Ad leads, validates phone/email with AI formatting, and pushes qualified prospects to Pipedrive.',
    category: 'Marketing',
    stepsCount: 3,
    usedBy: 'Used by 100+ teams',
    isTop: false,
    headerBg: 'bg-[#fcd5cd]', // Pastel Coral / Salmon
    apps: ['Facebook Ads', 'Google Sheets', 'Pipedrive', 'CRM'],
    sourceApps: ['Facebook Ads', 'Google Sheets', 'Pipedrive'],
    extraSteps: 0,
    targetApp: 'CRM',
    trigger: {
      type: 'form_submission',
      config: { form_name: 'facebook_instant_form_2026' }
    },
    conditions: [
      { field: 'country', operator: 'exists', value: 'true' }
    ],
    actions: [
      { type: 'create_crm_record', config: { entity: 'lead', crm: 'pipedrive' } },
      { type: 'send_email', config: { to: 'sales@company.com', subject: 'High-Intent Ad Lead Arrived' } }
    ]
  },
  {
    id: 'tpl-agency-queue',
    title: 'Add property inquiry lead, notify agents, and log',
    desc: 'When a new lead fills your social bio link, automatically assign tasks in Asana and send an intro SMS.',
    category: 'Marketing',
    stepsCount: 2,
    usedBy: 'Used by 400+ teams',
    isTop: false,
    headerBg: 'bg-[#fcdfcb]', // Pastel Peach / Apricot
    apps: ['Facebook Ads', 'Gmail', 'Google Sheets', 'CRM'],
    sourceApps: ['Facebook Ads', 'Gmail', 'Google Sheets'],
    extraSteps: 0,
    targetApp: 'CRM',
    trigger: {
      type: 'webhook',
      config: { path: '/social-lead-hook' }
    },
    conditions: [],
    actions: [
      { type: 'create_task', config: { project: 'Inbound Social Leads', priority: 'high' } },
      { type: 'send_sms', config: { to: '{{phone}}', message: 'Thanks for contacting us! An advisor will reach out shortly.' } }
    ]
  },
  {
    id: 'tpl-lead-alerts',
    title: 'Send immediate lead alerts to campaign managers via chat',
    desc: 'Broadcast high-value lead submissions straight to Telegram & Slack with clickable CRM profile links.',
    category: 'Sales & CRM',
    stepsCount: 2,
    usedBy: 'Used by 100+ teams',
    isTop: false,
    headerBg: 'bg-[#e4ddf4]', // Pastel Lavender
    apps: ['Facebook Ads', 'Telegram', 'Notion'],
    sourceApps: ['Facebook Ads', 'Telegram'],
    extraSteps: 0,
    targetApp: 'Notion',
    trigger: {
      type: 'form_submission',
      config: { source: 'landing_page_quote' }
    },
    conditions: [
      { field: 'budget', operator: 'greater_than', value: '1000' }
    ],
    actions: [
      { type: 'send_slack_message', config: { channel: '#urgent-leads', message: 'VIP Lead: {{email}}' } },
      { type: 'add_to_spreadsheet', config: { sheet: 'Notion VIP Deals' } }
    ]
  },
  {
    id: 'tpl-ai-ticket-responder',
    title: 'Classify support tickets & draft automated AI response',
    desc: 'Uses Google Gemini AI to analyze customer sentiment, tag the issue category, and draft a tailored reply in Zendesk/Slack.',
    category: 'AI & Agents',
    stepsCount: 4,
    usedBy: 'Used by 850+ teams',
    isTop: true,
    headerBg: 'bg-[#d8e6f7]', // Pastel Sky Blue
    apps: ['Zendesk', 'Gemini AI', 'Slack', 'Gmail'],
    sourceApps: ['Zendesk', 'Gemini AI'],
    extraSteps: 1,
    targetApp: 'Slack',
    trigger: {
      type: 'email_received',
      config: { mailbox: 'support@flowai.io' }
    },
    conditions: [],
    actions: [
      { type: 'call_api', config: { service: 'gemini_classifier', prompt: 'Categorize sentiment and extract summary' } },
      { type: 'send_slack_message', config: { channel: '#support-triage', message: 'Ticket received: {{subject}}' } },
      { type: 'send_email', config: { to: '{{sender}}', subject: 'Re: {{subject}} - Ticket #{{id}}' } }
    ]
  },
  {
    id: 'tpl-stripe-slack-invoice',
    title: 'Generate PDF receipt & alert team on Stripe payments',
    desc: 'Listens for successful Stripe checkout events, dynamically compiles a branded PDF invoice, and delivers it via email.',
    category: 'Developer Tools',
    stepsCount: 3,
    usedBy: 'Used by 1.2K+ teams',
    isTop: false,
    headerBg: 'bg-[#f7e0e8]', // Pastel Rose
    apps: ['Stripe', 'Gmail', 'Slack'],
    sourceApps: ['Stripe', 'Gmail'],
    extraSteps: 0,
    targetApp: 'Slack',
    trigger: {
      type: 'payment_received',
      config: { gateway: 'stripe', event: 'charge.succeeded' }
    },
    conditions: [
      { field: 'amount', operator: 'greater_than', value: '0' }
    ],
    actions: [
      { type: 'generate_pdf', config: { template: 'standard_invoice_v2' } },
      { type: 'send_email', config: { to: '{{customer_email}}', subject: 'Your Receipt from FlowAI' } },
      { type: 'send_slack_message', config: { channel: '#revenue', message: '💰 Payment received: ${{amount}}' } }
    ]
  },
  {
    id: 'tpl-shopify-inventory',
    title: 'Sync Shopify orders to accounting & notify fulfillment',
    desc: 'When a new Shopify purchase is placed, sync customer details to QuickBooks and send order details to your warehouse.',
    category: 'E-commerce',
    stepsCount: 4,
    usedBy: 'Used by 300+ teams',
    isTop: false,
    headerBg: 'bg-[#d5edd8]', // Pastel Mint Green
    apps: ['Shopify', 'QuickBooks', 'Gmail'],
    sourceApps: ['Shopify', 'QuickBooks'],
    extraSteps: 1,
    targetApp: 'Gmail',
    trigger: {
      type: 'webhook',
      config: { source: 'shopify_orders_create' }
    },
    conditions: [
      { field: 'total_price', operator: 'greater_than', value: '0' }
    ],
    actions: [
      { type: 'call_api', config: { service: 'quickbooks_sync' } },
      { type: 'send_email', config: { to: 'fulfillment@warehouse.com', subject: 'Order #{{order_number}} Ready to Pack' } }
    ]
  },
  {
    id: 'tpl-github-slack-ci',
    title: 'Post GitHub release notes & trigger deployment webhook',
    desc: 'Whenever a new GitHub release tag is published, send rich markdown release highlights to Slack and trigger production deployment.',
    category: 'Developer Tools',
    stepsCount: 3,
    usedBy: 'Used by 500+ teams',
    isTop: false,
    headerBg: 'bg-[#fbeacc]', // Pastel Warm Cream
    apps: ['GitHub', 'Slack', 'Webhook'],
    sourceApps: ['GitHub', 'Slack'],
    extraSteps: 0,
    targetApp: 'Webhook',
    trigger: {
      type: 'webhook',
      config: { source: 'github_release' }
    },
    conditions: [
      { field: 'prerelease', operator: 'equals', value: 'false' }
    ],
    actions: [
      { type: 'send_slack_message', config: { channel: '#releases', message: '🚀 New Release {{tag_name}} is live!' } },
      { type: 'webhook_post', config: { url: 'https://api.deployer.internal/deploy' } }
    ]
  }
];

export const CATEGORIES = [
  'All Templates',
  'Marketing',
  'Sales & CRM',
  'AI & Agents',
  'E-commerce',
  'Developer Tools',
];

// Reusable Zapier-authentic Workflow Template Card
export function ZapierTemplateCard({ template, onUse }) {
  const { isTop, title, desc, stepsCount, usedBy, sourceApps, extraSteps, targetApp, headerBg } = template;

  return (
    <div
      onClick={() => onUse(template)}
      className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
    >
      {/* ─── Top Illustrated Pastel Step Strip Header ─── */}
      <div className={`relative h-28 ${headerBg || 'bg-[#bfe2db]'} p-3 flex items-center justify-center border-b border-slate-200/60`}>
        
        {/* Top Recommendation Tag (Top-left ribbon in dark navy as Zapier) */}
        {isTop && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1f2937] text-white shadow-2xs">
              <span className="text-amber-400">★</span>
              Top recommendation
            </span>
          </div>
        )}

        {/* Three-dots menu icon (Top-right) */}
        <div className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-800 transition-colors">
          <MoreVertical className="w-3.5 h-3.5" />
        </div>

        {/* Center Step Pipeline Pill Strip (Crisp White Pill) */}
        <div className="relative z-10 px-3 py-1.5 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center gap-2">
          {/* Trigger Apps Tiles */}
          <div className="flex items-center gap-1.5">
            {sourceApps.map((appName) => (
              <div
                key={appName}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 hover:scale-110 transition-transform shadow-2xs"
                title={appName}
              >
                <AppIcon name={appName} size="md" />
              </div>
            ))}

            {/* Extra Steps Indicator (e.g. +3) */}
            {extraSteps > 0 && (
              <div className="px-1.5 h-6 rounded bg-slate-100 text-slate-700 font-bold text-[11px] font-mono flex items-center justify-center border border-slate-200">
                +{extraSteps}
              </div>
            )}
          </div>

          {/* Workflow Arrow */}
          <span className="text-slate-500 font-bold text-xs">→</span>

          {/* Destination App Tile */}
          <div
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 hover:scale-110 transition-transform shadow-2xs"
            title={targetApp}
          >
            <AppIcon name={targetApp} size="md" />
          </div>
        </div>
      </div>

      {/* ─── Bottom Body Content ─── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors leading-snug line-clamp-2">
            {title}
          </h3>
          {desc && (
            <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
            {usedBy && (
              <span className="truncate flex items-center gap-1 text-slate-500 font-sans">
                <Users className="w-3 h-3 text-slate-400 flex-shrink-0" />
                {usedBy}
              </span>
            )}
            {usedBy && <span>•</span>}
            <span className="flex items-center gap-1 text-slate-500">
              <Zap className="w-3 h-3 text-[#ff4f00]" />
              {stepsCount} steps
            </span>
          </div>

          <button
            type="button"
            className="text-[#ff4f00] hover:text-[#e04500] font-sans font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Use</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Templates');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      activeCategory === 'All Templates' || tpl.category === activeCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.apps.some((app) => app.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template) => {
    const toastId = toast.loading(`Activating "${template.title}" template...`);
    try {
      const res = await workflowsAPI.fromTemplate({
        templateId: template.id,
        template: template,
      });
      toast.dismiss(toastId);
      toast.success('Template activated! Opening live visual editor...');
      navigate(`/editor/${res.data.workflow.id}`, {
        state: {
          workflow: res.data.workflow,
          missingConnections: res.data.missingConnections,
          connectedApps: res.data.connectedApps,
        }
      });
    } catch {
      toast.dismiss(toastId);
      navigate(`/workflows/new`, {
        state: {
          template: {
            title: template.title,
            desc: template.desc,
            trigger: template.trigger,
            conditions: template.conditions,
            actions: template.actions,
            apps: template.apps,
          }
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-white border border-slate-200 p-8 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ff4f00] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
            <span>Official Integration Blueprints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Workflow Templates Library
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Jumpstart your automation stack in seconds. Choose from multi-step triggers, CRM syncs, and AI agent blueprints with official app connectors.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by app name (e.g., Slack, Sheets, Stripe, Gemini)..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#ff4f00] text-slate-900 placeholder:text-slate-400 text-xs outline-none transition-all"
            />
          </div>
          <Link
            to="/workflows/new"
            className="btn-primary !py-2.5 !px-4 !text-xs !whitespace-nowrap flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Blank Canvas</span>
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-orange-50 text-[#ff4f00] border border-orange-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No templates found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another app name like "Gmail", "Slack", or "Google Sheets".
          </p>
          <button
            onClick={() => { setActiveCategory('All Templates'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <ZapierTemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
