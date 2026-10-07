import React from 'react';
import {
  Webhook, Mail, MessageSquare, Users, CreditCard,
  Database, Clock, FileSpreadsheet, Sparkles, FileUp,
  Code2, Smartphone, CheckSquare, Zap, Globe, FileText,
  Layers, Bot, Bell, ShieldCheck, HelpCircle
} from 'lucide-react';

const NODE_MAP = {
  // Triggers
  webhook: { icon: Webhook, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Webhook' },
  form_submission: { icon: FileSpreadsheet, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Form Submit' },
  schedule_cron: { icon: Clock, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', label: 'Schedule / Cron' },
  email_received: { icon: Mail, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', label: 'Email Received' },
  payment_received: { icon: CreditCard, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Payment Event' },
  database_change: { icon: Database, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', label: 'DB Trigger' },
  new_customer_registration: { icon: Users, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'New Customer' },
  file_uploaded: { icon: FileUp, color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200', label: 'File Upload' },
  api_call: { icon: Globe, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'API Call' },
  custom_event: { icon: Zap, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Custom Event' },

  // Actions
  send_email: { icon: Mail, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', label: 'Send Email' },
  send_slack_message: { icon: MessageSquare, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', label: 'Slack Message' },
  create_crm_record: { icon: Users, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Create CRM' },
  update_crm_record: { icon: Users, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', label: 'Update CRM' },
  webhook_post: { icon: Webhook, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Webhook POST' },
  send_sms: { icon: Smartphone, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Send SMS' },
  create_task: { icon: CheckSquare, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Create Task' },
  add_to_spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Add to Sheet' },
  generate_pdf: { icon: FileText, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', label: 'Generate PDF' },
  call_api: { icon: Globe, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', label: 'Call API' },
  send_push_notification: { icon: Bell, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', label: 'Push Notification' },
  create_ticket: { icon: ShieldCheck, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', label: 'Create Ticket' },
};

export function getNodeMeta(type) {
  return NODE_MAP[type] || {
    icon: Zap,
    color: 'text-slate-700',
    bg: 'bg-slate-100 border-slate-200',
    label: (type || 'Step').replace(/_/g, ' ')
  };
}

export default function NodeBadge({ type, size = 'sm', showLabel = true, className = '' }) {
  const meta = getNodeMeta(type);
  const Icon = meta.icon;

  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`flex items-center justify-center rounded-lg border flex-shrink-0 ${meta.bg} ${sizeClasses[size] || sizeClasses.sm}`}>
        <Icon className={`${iconSizes[size] || iconSizes.sm} ${meta.color}`} />
      </div>
      {showLabel && (
        <span className="font-semibold text-slate-800 capitalize">
          {meta.label}
        </span>
      )}
    </div>
  );
}
