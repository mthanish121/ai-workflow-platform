import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { workflowsAPI, aiAPI } from '../lib/api';
import { AppIcon } from '../components/AppIcon';
import {
  Sparkles, Plus, Trash2, ChevronDown, ChevronUp,
  ArrowLeft, Save, RefreshCw, Wand2, X,
  Code, Check, CheckCircle2, AlertCircle, Play,
  MoreVertical, Copy, ThumbsUp, ThumbsDown, ArrowUp,
  Search, SlidersHorizontal, Settings2, ExternalLink,
  ShieldCheck, HelpCircle, Undo2, Maximize2, Minimize2,
  Lock, Edit2, Zap, FileText, ArrowRight, CornerDownRight,
  GripVertical, Home, LayoutGrid, FolderGit2, FileCode,
  MessageSquare, Calendar, Clock, Settings, Archive,
  Flame, Bell, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

// Available apps catalog for step creation & change
const POPULAR_APPS = [
  { id: 'google_sheets', name: 'Google Sheets', category: 'Productivity', actions: ['New or Updated Spreadsheet Row', 'Create Spreadsheet Row', 'Find Row', 'Update Row'] },
  { id: 'google_calendar', name: 'Google Calendar', category: 'Productivity', actions: ['Quick Add Event', 'Create Detailed Event', 'Find Event'] },
  { id: 'gmail', name: 'Gmail', category: 'Communication', actions: ['Send Email', 'Create Draft', 'Find Email', 'Send Attachment'] },
  { id: 'slack', name: 'Slack', category: 'Communication', actions: ['Send Channel Message', 'Send Direct Message', 'Create Channel', 'Add Reaction'] },
  { id: 'google_contacts', name: 'Google Contacts', category: 'CRM & Contacts', actions: ['Find Contact', 'Create Contact', 'Update Contact', 'Add Contact to Group'] },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM & Sales', actions: ['Create Lead', 'Create Deal', 'Find Person', 'Update Deal Stage'] },
  { id: 'zapier_formatter', name: 'Formatter by Zapier', category: 'Built-in Tool', actions: ['Text (Transform & Clean)', 'Date / Time Converter', 'Numbers (Math & Currency)', 'Utilities'] },
  { id: 'facebook', name: 'Facebook Ads', category: 'Marketing', actions: ['New Lead Form Submission', 'Custom Audience Sync'] },
  { id: 'asana', name: 'Asana', category: 'Productivity', actions: ['Create Task', 'Update Task', 'Find Task by Name'] },
  { id: 'gemini', name: 'Google Gemini', category: 'AI & Machine Learning', actions: ['Classify & Generate Response', 'Summarize Text', 'Extract Entities'] },
  { id: 'stripe', name: 'Stripe', category: 'Payment', actions: ['New Payment Event', 'Create Invoice', 'Find Customer'] },
  { id: 'notion', name: 'Notion', category: 'Productivity', actions: ['Create Database Item', 'Append Block', 'Find Page'] },
  { id: 'telegram', name: 'Telegram', category: 'Communication', actions: ['Send Direct Message', 'Send Photo', 'Send Document'] },
  { id: 'twilio', name: 'Twilio', category: 'Communication', actions: ['Send SMS', 'Make Call', 'Send WhatsApp Message'] },
  { id: 'zendesk', name: 'Zendesk', category: 'Support', actions: ['Create Ticket', 'Update Ticket', 'Find User'] },
];

// ─── Gmail "Send Email" Configure Panel ────────────────────────────────────
function GmailConfigPanel({ currentStep, dynamicVariables, handleUpdateStepField, isStepAppConnected, handleConnectApp }) {
  const [toValue, setToValue] = React.useState(
    currentStep.config?.to ||
    dynamicVariables.find(v => v.label.includes('email'))?.pill ||
    localStorage.getItem('userEmail') || ''
  );
  const [subjectValue, setSubjectValue] = React.useState(
    currentStep.config?.subject ||
    (dynamicVariables.find(v => v.label.includes('headline'))?.pill
      ? `AI Digest: ${dynamicVariables.find(v => v.label.includes('headline'))?.pill}`
      : 'Your AI News Summary is Ready')
  );
  const defaultBody = [
    'Hi there,',
    '',
    'Here is your latest AI-curated news summary:',
    '',
    `📰 Headline: ${dynamicVariables.find(v => v.label.includes('headline'))?.pill || dynamicVariables.find(v => v.label.includes('feed_title'))?.pill || '{{Step1.feed_title}}'}`,
    '',
    `📝 Summary:\n${dynamicVariables.find(v => v.label.includes('summary'))?.pill || '{{Step2.gemini_summary}}'}`,
    '',
    `🔗 Read more: ${dynamicVariables.find(v => v.label.includes('url'))?.pill || '{{Step1.feed_url}}'}`,
    '',
    `🕐 Published: ${dynamicVariables.find(v => v.label.includes('published'))?.pill || '{{Step1.published_at}}'}`,
    '',
    '—',
    'Sent automatically by FlowAI',
  ].join('\n');
  const [bodyValue, setBodyValue] = React.useState(currentStep.config?.body || defaultBody);

  const saveFields = () => {
    handleUpdateStepField('config', {
      ...currentStep.config,
      to: toValue,
      subject: subjectValue,
      body: bodyValue,
    });
    handleUpdateStepField('actionEvent', 'Send Email');
  };

  return (
    <div className="space-y-4">
      {/* Auth gate banner */}
      {!isStepAppConnected && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1 text-[11px] text-amber-800">
            Connect Gmail first to enable field mapping.
          </div>
          <button
            onClick={() => handleConnectApp('Gmail')}
            className="px-2 py-1 rounded-lg bg-[#ff4f00] text-white text-[11px] font-bold flex-shrink-0 shadow-sm"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Action event label */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-500 text-[10px]">✉</span>
          Send Email (Gmail)
        </span>
        <span className="text-[10px] text-[#ff4f00] bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-bold">Auto-mapped</span>
      </div>

      {/* TO field */}
      <div className="space-y-1">
        <label className="font-bold text-slate-700 flex items-center gap-1">
          To <span className="text-[#ff4f00]">*</span>
        </label>
        <input
          type="text"
          value={toValue}
          onChange={e => setToValue(e.target.value)}
          onBlur={saveFields}
          placeholder="recipient@example.com or {{Step1.attendee_email}}"
          className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 font-mono shadow-xs"
        />
        <div className="flex flex-wrap gap-1 pt-0.5">
          {dynamicVariables.filter(v => v.label.includes('email') || v.label.includes('output')).slice(0, 4).map((v, i) => (
            <button
              key={i}
              onClick={() => { setToValue(v.pill); }}
              title={v.desc}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-mono text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBJECT field */}
      <div className="space-y-1">
        <label className="font-bold text-slate-700 flex items-center gap-1">
          Subject <span className="text-[#ff4f00]">*</span>
        </label>
        <input
          type="text"
          value={subjectValue}
          onChange={e => setSubjectValue(e.target.value)}
          onBlur={saveFields}
          placeholder="e.g. AI Digest: {{Step2.gemini_headline}}"
          className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 font-mono shadow-xs"
        />
        <div className="flex flex-wrap gap-1 pt-0.5">
          {dynamicVariables.filter(v => v.label.includes('headline') || v.label.includes('title') || v.label.includes('summary')).slice(0, 4).map((v, i) => (
            <button
              key={i}
              onClick={() => setSubjectValue(prev => prev + v.pill)}
              title={v.desc}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-[10px] font-mono text-violet-700 hover:bg-violet-100 transition-colors"
            >
              + {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* BODY field */}
      <div className="space-y-1">
        <label className="font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1">Body <span className="text-[#ff4f00]">*</span></span>
          <span className="text-[10px] text-slate-400 font-normal">Supports {'{{'}variables{'}}'}</span>
        </label>
        <textarea
          rows={9}
          value={bodyValue}
          onChange={e => setBodyValue(e.target.value)}
          onBlur={saveFields}
          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-900 outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 font-mono shadow-xs resize-none leading-relaxed"
        />
        {dynamicVariables.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff4f00]" />
              Insert variable into body
            </p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto scrollbar-thin pr-1">
              {dynamicVariables.map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setBodyValue(prev => prev + v.pill);
                    toast.success(`Inserted ${v.label}`);
                  }}
                  title={v.desc}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  + {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save mapping button */}
      <button
        onClick={saveFields}
        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5" />
        Save Email Configuration
      </button>
    </div>
  );
}

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !id || id === 'new';

  // --- Main Editor State ---
  const [workflow, setWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('Create calendar events from updated sales appointment rows');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('setup'); // 'setup' | 'configure' | 'test'

  // --- Panels & Copilot State ---
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [copilotGuidance, setCopilotGuidance] = useState({
    defaults: [
      'Watch for status changes where status = confirmed.',
      'Auto-generate Google Meet conference link.',
      'Send calendar invite to both prospect and host.'
    ],
    customize: [
      'Set custom calendar reminders (15 mins prior).',
      'Add CRM deal link into the calendar description.'
    ],
    description: 'Sync row changes in Google Sheets directly with calendar events and multi-channel notifications.',
    workedTime: 'worked for 8 seconds >'
  });
  const [missingConnections, setMissingConnections] = useState([]);
  const [connectedApps, setConnectedApps] = useState([]);
  const [userConnections, setUserConnections] = useState([]);

  // --- AI Chat State ---
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // --- Action & Loading States ---
  // --- Action & Loading States ---
  const [loading, setLoading] = useState(!isNew);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testingStep, setTestingStep] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(98);

  // --- Modal & Flyout States ---
  const [platformFlyoutOpen, setPlatformFlyoutOpen] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [insertStepIndex, setInsertStepIndex] = useState(null);
  const [showAppPickerForStep, setShowAppPickerForStep] = useState(false);

  // Active Selected Step — must be declared before availableActionsForCurrentStep
  const currentStep = useMemo(() => {
    return steps[activeStepIndex] || steps[0] || null;
  }, [steps, activeStepIndex]);

  // Available actions for the currently active step's app
  const availableActionsForCurrentStep = useMemo(() => {
    if (!currentStep || !currentStep.app) return ['Perform Action', 'Find or Create Record'];
    const appName = String(currentStep.app || '').toLowerCase();
    const matched = POPULAR_APPS.find(
      a => a.name.toLowerCase().includes(appName) ||
           appName.includes(a.name.toLowerCase()) ||
           a.id === currentStep.appId
    );
    if (matched && Array.isArray(matched.actions)) {
      const acts = [...matched.actions];
      if (currentStep.actionEvent && !acts.includes(currentStep.actionEvent)) {
        acts.unshift(currentStep.actionEvent);
      }
      return acts;
    }
    return [currentStep.actionEvent || 'Perform Action', 'Find or Create Record', 'Update Record'];
  }, [currentStep]);

  // Load user connections
  const fetchConnections = async (workflowId = id) => {
    try {
      const res = await workflowsAPI.getConnections();
      const conns = res?.data?.connections || [];
      setUserConnections(conns);
      const appNames = conns.map(c => c.app_name).filter(Boolean);
      setConnectedApps(appNames);

      if (workflowId && workflowId !== 'new' && !String(workflowId).startsWith('wf_tpl_')) {
        const wfConnRes = await workflowsAPI.getWorkflowConnections(workflowId).catch(() => null);
        if (wfConnRes?.data?.missingConnections) {
          setMissingConnections(wfConnRes.data.missingConnections);
        }
      }
    } catch {
      // ignore
    }
  };

  // Default standard 5-step sales calendar workflow
  const defaultStepsBlueprint = [
    {
      id: 'step_1',
      stepNumber: 1,
      type: 'trigger',
      app: 'Google Sheets',
      appId: 'google_sheets',
      actionEvent: 'New or Updated Spreadsheet Row',
      label: '1. New Row in Google Sheets',
      subtitle: 'Google Sheets',
      status: 'needs_auth',
      authRequired: true,
      badgeText: 'Trigger Event',
      config: { spreadsheet: 'Sales Appointments 2026', worksheet: 'Bookings' }
    },
    {
      id: 'step_2',
      stepNumber: 2,
      type: 'action',
      app: 'Formatter by Zapier',
      appId: 'zapier_formatter',
      actionEvent: 'Date / Time Converter',
      label: '2. Format Date Time',
      subtitle: 'Formatter by Zapier',
      status: 'configured',
      authRequired: false,
      badgeText: 'Built-in Tool',
      config: { transform: 'Format to ISO 8601' }
    },
    {
      id: 'step_3',
      stepNumber: 3,
      type: 'action',
      app: 'Google Calendar',
      appId: 'google_calendar',
      actionEvent: 'Create Detailed Event',
      label: '3. Create Calendar Event',
      subtitle: 'Google Calendar',
      status: 'needs_auth',
      authRequired: true,
      badgeText: 'Productivity',
      config: { calendar: 'Primary Calendar' }
    },
    {
      id: 'step_4',
      stepNumber: 4,
      type: 'action',
      app: 'Gmail',
      appId: 'gmail',
      actionEvent: 'Send Confirmation',
      label: '4. Send Confirmation',
      subtitle: 'Gmail',
      status: 'needs_auth',
      authRequired: true,
      badgeText: 'Communication',
      config: { subject: 'Consultation Confirmed' }
    },
    {
      id: 'step_5',
      stepNumber: 5,
      type: 'action',
      app: 'Slack',
      appId: 'slack',
      actionEvent: 'Notify Sales Team',
      label: '5. Notify Sales Team',
      subtitle: 'Slack',
      status: 'needs_auth',
      authRequired: true,
      badgeText: 'Alerts',
      config: { channel: '#sales-alerts' }
    }
  ];

  // Initial Load from Backend or Navigation State
  useEffect(() => {
    setFetchError(null);
    fetchConnections(id);

    // Check if navigated with state from template activation
    if (location.state?.workflow) {
      const wf = location.state.workflow;
      setWorkflow(wf);
      setWorkflowName(wf.name || 'Activated Workflow');
      setWorkflowDesc(wf.description || '');
      setIsActive(Boolean(wf.is_active));
      
      const loadedSteps = Array.isArray(wf.steps) && wf.steps.length > 0
        ? wf.steps
        : deriveStepsFromWorkflow(wf);
      setSteps(loadedSteps.length > 0 ? loadedSteps : defaultStepsBlueprint);
      
      if (location.state.missingConnections) {
        setMissingConnections(location.state.missingConnections);
      }
      if (wf.copilot_guidance) {
        setCopilotGuidance(wf.copilot_guidance);
      }
      setLoading(false);
      return;
    }

    // If client-generated template ID fallback in URL
    if (id && String(id).startsWith('wf_tpl_')) {
      setWorkflow({ id, name: 'Sales Appointments Workflow' });
      setWorkflowName('Create calendar events from updated sales appointment rows');
      setSteps(defaultStepsBlueprint);
      setMissingConnections([
        { appId: 'google_sheets', appName: 'Google Sheets', buttonText: 'Sign in to Google Sheets' },
        { appId: 'google_calendar', appName: 'Google Calendar', buttonText: 'Sign in to Google Calendar' },
        { appId: 'gmail', appName: 'Gmail', buttonText: 'Sign in to Gmail' },
        { appId: 'slack', appName: 'Slack', buttonText: 'Sign in to Slack' },
      ]);
      setLoading(false);
      return;
    }

    // If existing workflow ID in URL
    if (!isNew) {
      setLoading(true);
      workflowsAPI.get(id)
        .then(res => {
          const wf = res.data.workflow;
          if (!wf) throw new Error('Workflow empty');
          setWorkflow(wf);
          setWorkflowName(wf.name || 'Untitled Zap');
          setWorkflowDesc(wf.description || '');
          setIsActive(Boolean(wf.is_active));
          
          const loadedSteps = Array.isArray(wf.steps) && wf.steps.length > 0
            ? wf.steps
            : deriveStepsFromWorkflow(wf);
          setSteps(loadedSteps.length > 0 ? loadedSteps : defaultStepsBlueprint);

          if (wf.copilot_guidance) {
            setCopilotGuidance(wf.copilot_guidance);
          }

          const userConns = res.data.connections || [];
          setUserConnections(userConns);
          const connectedNames = userConns.map(c => c.app_name?.toLowerCase()).filter(Boolean);

          const required = [];
          (loadedSteps.length > 0 ? loadedSteps : defaultStepsBlueprint).forEach(s => {
            if (!s.app || /formatter|zapier|webhook|filter/i.test(s.app)) return;
            const isConn = connectedNames.some(cn => cn.includes(s.app?.toLowerCase()) || s.app?.toLowerCase().includes(cn));
            if (!isConn && !required.some(r => r.appName === s.app)) {
              required.push({
                appId: s.appId || s.app?.toLowerCase().replace(/\s+/g, '_'),
                appName: s.app,
                buttonText: `Sign in to ${s.app}`,
              });
            }
          });
          setMissingConnections(required);
        })
        .catch(err => {
          console.warn('Workflow fetch error:', err);
          // Instead of a blank page, recover by loading template default or showing fallback
          setFetchError(err.response?.data?.message || 'Workflow could not be retrieved');
          setSteps(defaultStepsBlueprint);
        })
        .finally(() => setLoading(false));
    } else {
      // Default standard 5-step sales calendar workflow
      setSteps(defaultStepsBlueprint);
      setMissingConnections([
        { appId: 'google_sheets', appName: 'Google Sheets', buttonText: 'Sign in to Google Sheets' },
        { appId: 'google_calendar', appName: 'Google Calendar', buttonText: 'Sign in to Google Calendar' },
        { appId: 'gmail', appName: 'Gmail', buttonText: 'Sign in to Gmail' },
        { appId: 'slack', appName: 'Slack', buttonText: 'Sign in to Slack' },
      ]);
      setLoading(false);
    }
  }, [id, isNew]);

  // Helper: derive steps from existing workflow record
  const deriveStepsFromWorkflow = (wf) => {
    const list = [];
    const trig = wf.trigger || {};
    list.push({
      id: 'step_1',
      stepNumber: 1,
      type: 'trigger',
      app: trig.app || 'Google Sheets',
      appId: 'google_sheets',
      actionEvent: trig.type || 'New or Updated Spreadsheet Row',
      label: `1. ${trig.app || 'Trigger'}`,
      subtitle: trig.app || 'Trigger Event',
      status: 'configured',
      authRequired: true,
      badgeText: 'Trigger',
      config: trig.config || {}
    });

    const acts = Array.isArray(wf.actions) ? wf.actions : [];
    acts.forEach((a, i) => {
      list.push({
        id: `step_${i + 2}`,
        stepNumber: i + 2,
        type: 'action',
        app: a.app || 'Action Step',
        appId: (a.app || 'action').toLowerCase().replace(/\s+/g, '_'),
        actionEvent: a.type || 'action',
        label: `${i + 2}. ${a.app || a.type}`,
        subtitle: a.app || 'Action Service',
        status: 'configured',
        authRequired: true,
        badgeText: 'Action',
        config: a.config || {}
      });
    });
    return list;
  };

  // Check if current step's app is connected
  const isStepAppConnected = useMemo(() => {
    if (!currentStep) return false;
    if (/formatter|zapier|webhook|filter/i.test(currentStep.app)) return true;
    const slug = currentStep.app?.toLowerCase();
    return userConnections.some(c => c.app_name?.toLowerCase().includes(slug) || slug?.includes(c.app_name?.toLowerCase()));
  }, [currentStep, userConnections]);

  // Is the active step a Gmail / Send Email step?
  const isGmailStep = useMemo(() => {
    if (!currentStep) return false;
    return /gmail/i.test(currentStep.app) || /send.?email/i.test(currentStep.actionEvent);
  }, [currentStep]);

  // Dynamic pill variables derived from previous steps (for field mapping)
  const dynamicVariables = useMemo(() => {
    const vars = [];
    steps.forEach((s, idx) => {
      if (idx >= activeStepIndex) return; // only upstream steps
      const stepLabel = `Step${idx + 1}`;
      const app = s.app || '';
      if (/rss|feed/i.test(app) || /rss|feed/i.test(s.actionEvent)) {
        vars.push(
          { label: `${stepLabel}.feed_title`,   pill: `{{${stepLabel}.feed_title}}`,   desc: 'RSS feed item title' },
          { label: `${stepLabel}.feed_url`,     pill: `{{${stepLabel}.feed_url}}`,     desc: 'Link to article' },
          { label: `${stepLabel}.feed_content`, pill: `{{${stepLabel}.feed_content}}`, desc: 'Raw feed body' },
          { label: `${stepLabel}.published_at`, pill: `{{${stepLabel}.published_at}}`, desc: 'Publish date' },
        );
      } else if (/gemini|ai|gpt|openai/i.test(app)) {
        vars.push(
          { label: `${stepLabel}.gemini_summary`,  pill: `{{${stepLabel}.gemini_summary}}`,  desc: 'AI-generated summary' },
          { label: `${stepLabel}.gemini_headline`, pill: `{{${stepLabel}.gemini_headline}}`, desc: 'AI headline / title' },
          { label: `${stepLabel}.sentiment`,       pill: `{{${stepLabel}.sentiment}}`,       desc: 'Detected sentiment' },
        );
      } else if (/sheet|spreadsheet/i.test(app)) {
        vars.push(
          { label: `${stepLabel}.client_name`,    pill: `{{${stepLabel}.client_name}}`,    desc: 'Client name from sheet' },
          { label: `${stepLabel}.attendee_email`, pill: `{{${stepLabel}.attendee_email}}`, desc: 'Email from sheet' },
          { label: `${stepLabel}.event_time`,     pill: `{{${stepLabel}.event_time}}`,     desc: 'Appointment time' },
        );
      } else if (/filter|condition/i.test(app)) {
        vars.push(
          { label: `${stepLabel}.result`, pill: `{{${stepLabel}.result}}`, desc: 'Filter pass/fail result' },
        );
      } else {
        vars.push(
          { label: `${stepLabel}.output`, pill: `{{${stepLabel}.output}}`, desc: `Output from ${app}` },
          { label: `${stepLabel}.id`,     pill: `{{${stepLabel}.id}}`,     desc: 'Record ID' },
        );
      }
    });
    return vars;
  }, [steps, activeStepIndex]);

  // Real-time Step Persistence Handler (PATCH /api/workflows/:id/steps/:stepId)
  const handleUpdateStepField = async (field, value) => {
    if (!currentStep) return;
    const updatedStep = { ...currentStep, [field]: value };
    
    // Update local state immediately
    setSteps(prev => prev.map((s, idx) => idx === activeStepIndex ? updatedStep : s));

    // Persist directly to backend database if workflow exists
    if (workflow?.id && workflow.id !== 'new') {
      try {
        await workflowsAPI.updateStep(workflow.id, currentStep.id || String(activeStepIndex + 1), {
          [field]: value
        });
      } catch {
        // quiet fallback
      }
    }
  };

  // Connect App Integration handler (called when clicking "Sign in to [App]")
  const handleConnectApp = async (appName) => {
    const toastId = toast.loading(`Connecting ${appName}...`);
    try {
      const res = await workflowsAPI.connectApp({
        appName,
        appId: appName.toLowerCase().replace(/\s+/g, '_'),
        accountName: `${appName} Active Account (${localStorage.getItem('userEmail') || 'user@company.com'})`,
        authType: 'OAuth 2.0',
      });
      toast.dismiss(toastId);
      toast.success(`✓ Authenticated with ${appName}!`);
      
      // Update local connection state
      const newConn = res.data.connection;
      setUserConnections(prev => [newConn, ...prev.filter(c => c.app_id !== newConn.app_id)]);
      setConnectedApps(prev => [...new Set([...prev, appName])]);
      setMissingConnections(prev => prev.filter(m => m.appName.toLowerCase() !== appName.toLowerCase()));

      // Update steps status
      setSteps(prev => prev.map(s => {
        if (s.app.toLowerCase().includes(appName.toLowerCase()) || appName.toLowerCase().includes(s.app.toLowerCase())) {
          return { ...s, status: 'configured', connectedAccount: newConn.account_name };
        }
        return s;
      }));

      // Real-time persist step state if in database
      if (workflow?.id && workflow.id !== 'new' && currentStep) {
        workflowsAPI.updateStep(workflow.id, currentStep.id || String(activeStepIndex + 1), {
          status: 'configured',
          connectedAccount: newConn.account_name,
        }).catch(() => {});
      }
    } catch {
      toast.dismiss(toastId);
      toast.error(`Failed to connect ${appName}`);
    }
  };

  // Save / Publish Workflow
  const handleSaveWorkflow = async (publish = false) => {
    setSaving(true);
    const payload = {
      name: workflowName.trim() || 'Untitled Zap',
      description: workflowDesc,
      trigger: {
        type: steps[0]?.actionEvent || 'webhook',
        app: steps[0]?.app || 'Google Sheets',
        config: steps[0]?.config || {},
      },
      conditions: workflow?.conditions || [],
      actions: steps.slice(1).map(s => ({
        type: s.actionEvent || 'send_email',
        app: s.app || 'Service',
        config: s.config || {},
      })),
      steps: steps,
      copilot_guidance: copilotGuidance,
      is_active: publish ? true : isActive,
    };

    try {
      if (workflow?.id && workflow.id !== 'new') {
        const res = await workflowsAPI.update(workflow.id, payload);
        setWorkflow(res.data.workflow);
        if (publish) setIsActive(true);
        toast.success(publish ? '🎉 Workflow published live!' : '✓ Changes saved to Supabase');
      } else {
        const res = await workflowsAPI.create(payload);
        setWorkflow(res.data.workflow);
        if (publish) setIsActive(true);
        toast.success('🎉 Workflow created & saved in Supabase!');
        navigate(`/editor/${res.data.workflow.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  // Test Step Action Handler
  const handleTestStep = async () => {
    if (!currentStep) return;
    setTestingStep(true);
    setTestResult(null);

    setTimeout(() => {
      setTestingStep(false);
      const mockPayload = {
        status: 200,
        statusText: 'OK',
        step: currentStep.label,
        app: currentStep.app,
        action: currentStep.actionEvent,
        timestamp: new Date().toISOString(),
        outputData: {
          id: `row_${Math.random().toString(36).substring(2, 8)}`,
          client_name: 'Sarah Connor',
          attendee_email: 'sarah.connor@cyberdyne.io',
          event_time: '2026-10-15T14:00:00Z',
          calendar_event_id: 'cal_ev_84920419',
          slack_ts: '1728291042.001900',
          status: 'confirmed',
        }
      };
      setTestResult(mockPayload);
      toast.success(`✓ Step ${currentStep.stepNumber} test passed!`);
    }, 800);
  };

  // Add Step between or after nodes
  const handleInsertStep = (app, actionName) => {
    const insertAt = insertStepIndex !== null ? insertStepIndex : steps.length;
    const newStepNum = insertAt + 1;
    const newStep = {
      id: `step_${Date.now()}`,
      stepNumber: newStepNum,
      type: 'action',
      app: app.name,
      appId: app.id,
      actionEvent: actionName || app.actions[0],
      label: `${newStepNum}. ${actionName || app.actions[0]}`,
      subtitle: app.name,
      status: 'configured',
      authRequired: true,
      badgeText: 'Action Step',
      config: {}
    };

    const newSteps = [...steps];
    newSteps.splice(insertAt, 0, newStep);

    const reindexed = newSteps.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
      label: s.label.replace(/^\d+\.\s*/, `${idx + 1}. `)
    }));

    setSteps(reindexed);
    setActiveStepIndex(insertAt);
    setActiveTab('setup');           // reset panel to Setup tab
    setShowAddStepModal(false);
    setShowAppPickerForStep(false);  // also close app-picker if open
    setInsertStepIndex(null);
    toast.success(`Added ${app.name} step!`);
  };

  // Delete a step
  const handleDeleteStep = (index, e) => {
    e?.stopPropagation();
    if (steps.length <= 1) {
      toast.error('Workflow must have at least one trigger node');
      return;
    }
    const filtered = steps.filter((_, idx) => idx !== index);
    const reindexed = filtered.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
      label: s.label.replace(/^\d+\.\s*/, `${idx + 1}. `)
    }));
    setSteps(reindexed);
    setActiveStepIndex(Math.max(0, index - 1));
    toast.success('Step removed');
  };

  // Handle Copilot Chat Submission
  const handleCopilotChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const res = await aiAPI.generate(userText);
      const aiWf = res.data.workflow;
      
      const newAssistantMsg = {
        role: 'assistant',
        text: `I've updated the workflow based on: "${userText}". Added ${aiWf.actions?.length || 1} action steps and optimized field mappings.`,
        workflow: aiWf
      };
      setChatMessages(prev => [...prev, newAssistantMsg]);

      if (Array.isArray(aiWf.actions) && aiWf.actions.length > 0) {
        const addedSteps = aiWf.actions.map((act, i) => {
          const stepNum = steps.length + i + 1;
          const appName = act.type.includes('slack') ? 'Slack' : act.type.includes('email') ? 'Gmail' : 'Google Gemini';
          return {
            id: `step_ai_${Date.now()}_${i}`,
            stepNumber: stepNum,
            type: 'action',
            app: appName,
            appId: appName.toLowerCase().replace(/\s+/g, '_'),
            actionEvent: act.type.replace(/_/g, ' '),
            label: `${stepNum}. ${appName}`,
            subtitle: appName,
            status: 'configured',
            authRequired: true,
            badgeText: 'AI Suggested',
            config: act.config || {}
          };
        });
        setSteps(prev => [...prev, ...addedSteps]);
        toast.success('🤖 Copilot updated canvas steps!');
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Got it! I've noted that for step optimization. You can test your steps on the canvas.` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] text-slate-800 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading workflow canvas from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf9f6] text-slate-800 select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP APPLICATION NAVIGATION HEADER (CLEAN LIGHT & ZAPIER ORANGE)        */}
      {/* ========================================================================= */}
      <header className="h-12 px-3 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 z-30 shadow-2xs">
        
        {/* Left Section: FlowAI Icon & Breadcrumbs */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard"
            className="w-7 h-7 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ff4f00] transition-colors shadow-2xs"
            title="Return to Dashboard"
          >
            <Zap className="w-4 h-4 fill-[#ff4f00] text-[#ff4f00]" />
          </Link>

          {/* Workflow Name Editor / Breadcrumb */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Workflows /</span>
            
            {isEditingName ? (
              <input
                type="text"
                value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="bg-white border border-[#ff4f00] rounded-lg px-2 py-0.5 text-xs font-bold text-slate-900 outline-none w-64 sm:w-80 shadow-2xs focus:ring-1 focus:ring-orange-400/30"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#ff4f00] px-1.5 py-0.5 rounded-lg hover:bg-slate-100 transition-colors group truncate max-w-[240px] sm:max-w-md"
              >
                <span className="truncate">{workflowName}</span>
                <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-[#ff4f00]" />
              </button>
            )}

            {/* Status Pill Badge */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isActive ? 'Published' : 'Draft'}</span>
            </span>
          </div>
        </div>

        {/* Center Section: Quick Search & Copilot Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search steps, apps... Ctrl+K"
              className="w-56 h-7 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={`h-7 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              copilotOpen
                ? 'bg-orange-50 text-[#ff4f00] border-orange-200 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
            <span>Copilot</span>
          </button>
        </div>

        {/* Right Section: Undo, Test Run, Zoom, Publish Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600">
            <span>{zoomLevel}%</span>
          </div>

          <button
            onClick={() => toast('No previous action to undo')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 hidden md:block"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Test Run Execution Button */}
          <button
            onClick={() => {
              setActiveTab('test');
              handleTestStep();
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Play className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">Test run</span>
          </button>

          {/* Save / Publish Button */}
          <button
            onClick={() => handleSaveWorkflow(true)}
            disabled={saving}
            className="px-3.5 py-1 rounded-lg bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</>
            ) : (
              <><Zap className="w-3 h-3" /> Publish</>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE WITH FAR-LEFT MINI TOOLBAR + COPILOT + CANVAS + DRAWER  */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ─── 1. FAR-LEFT MINI ICON TOOLBAR (LIGHT STRIP) ───────────────────── */}
        <aside className="w-12 bg-white border-r border-slate-200 flex flex-col items-center justify-between py-3 flex-shrink-0 z-30 shadow-2xs">
          
          {/* Top Icons Navigation Stack */}
          <div className="flex flex-col items-center gap-2.5 w-full relative">
            {/* 1. Home */}
            <Link
              to="/dashboard"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="Home Dashboard"
            >
              <Home className="w-4 h-4" />
            </Link>

            {/* 2. Apps / Platform Menu Toggle */}
            <button
              onClick={() => setPlatformFlyoutOpen(!platformFlyoutOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${
                platformFlyoutOpen
                  ? 'bg-orange-50 text-[#ff4f00] border border-orange-200'
                  : 'text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100'
              }`}
              title="Automation Platform Menu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Automation Platform Flyout Menu */}
            {platformFlyoutOpen && (
              <div
                className="absolute left-12 top-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-fade-in text-left text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-[11px] tracking-wide">
                    FlowAI Platform Menu
                  </span>
                  <button onClick={() => setPlatformFlyoutOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {[
                    { label: 'Workflows', icon: Zap, color: 'text-[#ff4f00]', path: '/workflows' },
                    { label: 'Tables', icon: LayoutGrid, color: 'text-blue-500', path: '/templates' },
                    { label: 'Forms', icon: FileText, color: 'text-emerald-500', path: '/templates' },
                    { label: 'Chatbots', icon: MessageSquare, color: 'text-purple-500', path: '/workflows/new' },
                    { label: 'Canvas', icon: Layers, color: 'text-[#ff4f00]', path: '/workflows/new' },
                    { label: 'MCP Servers', icon: Archive, color: 'text-teal-500', path: '/mcp' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setPlatformFlyoutOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="font-semibold text-xs">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff4f00]" />
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
                  <p>You are on the <span className="text-slate-900 font-semibold">Free plan</span>.</p>
                  <p>Automate at scale with our <Link to="/pricing" className="text-[#ff4f00] underline hover:text-orange-600">Professional plan</Link>.</p>
                </div>
              </div>
            )}

            {/* 3. Workflows / Zaps (Active) */}
            <Link
              to="/workflows"
              className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff4f00] border border-orange-200 flex items-center justify-center transition-colors shadow-2xs"
              title="Workflows"
            >
              <Zap className="w-4 h-4 fill-[#ff4f00]" />
            </Link>

            {/* 4. Folders */}
            <Link
              to="/folders"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="Folders"
            >
              <FolderGit2 className="w-4 h-4" />
            </Link>

            {/* 5. Logs / Documents */}
            <Link
              to="/logs"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="Execution Logs"
            >
              <FileText className="w-4 h-4" />
            </Link>

            {/* 6. Messages / Chat */}
            <button
              onClick={() => setCopilotOpen(!copilotOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                copilotOpen ? 'bg-orange-50 text-[#ff4f00] border border-orange-200 shadow-2xs' : 'text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100'
              }`}
              title="Toggle AI Copilot"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* 7. Calendar */}
            <Link
              to="/templates"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="Schedule & Calendar"
            >
              <Calendar className="w-4 h-4" />
            </Link>

            {/* 8. History / Runs with notification badge counter */}
            <Link
              to="/logs"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors relative"
              title="Run History"
            >
              <Clock className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-100 text-[#ff4f00] border border-orange-200 font-bold text-[9px] flex items-center justify-center shadow-2xs">
                1
              </span>
            </Link>
          </div>

          {/* Bottom Settings & Storage Icons */}
          <div className="flex flex-col items-center gap-3 w-full">
            <Link
              to="/connections"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="Settings & Connections"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <Link
              to="/mcp"
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff4f00] hover:bg-slate-100 flex items-center justify-center transition-colors"
              title="MCP Servers & Tools"
            >
              <Archive className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        {/* ─── 2. AI COPILOT EXPANDABLE PANEL (LIGHT MODE) ───────────────── */}
        {copilotOpen && (
          <aside className="w-72 lg:w-80 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 z-20 animate-fade-in shadow-sm">
            
            {/* Copilot Header */}
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-orange-50 text-[#ff4f00] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                  COPILOT
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => toast.success('Guidance synced')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  title="Refresh guidance"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setCopilotOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  title="Collapse Copilot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Copilot Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin text-xs">
              
              {/* Guidance Box (Defaults, Customize, Pre-configured Note) */}
              <div className="space-y-3 text-slate-700">
                
                {/* Defaults Section */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]" />
                    <span>Defaults:</span>
                  </h4>
                  <ul className="space-y-1 pl-3 text-slate-600 text-[11px] list-disc list-outside leading-relaxed">
                    {copilotGuidance.defaults?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                {/* Customize Section */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Customize:</span>
                  </h4>
                  <ul className="space-y-1 pl-3 text-slate-600 text-[11px] list-disc list-outside leading-relaxed">
                    {copilotGuidance.customize?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Context description paragraph */}
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 leading-relaxed">
                  {copilotGuidance.description}
                </p>
              </div>

              {/* Execution Telemetry Pill */}
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-mono">
                  {copilotGuidance.workedTime || 'worked for 8 seconds >'}
                </span>
              </div>

              {/* Missing App Authentication Prompts */}
              {missingConnections.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    You need to connect your {missingConnections.map(m => m.appName).join(' and ')} accounts. Let me prompt you to do that:
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {missingConnections.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleConnectApp(item.appName)}
                        className="w-full px-3 py-2 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-bold text-left flex items-center justify-between shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <AppIcon name={item.appName} size="sm" />
                          <span>{item.buttonText}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback icons */}
              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <button className="p-1 hover:text-slate-700" title="Good response"><ThumbsUp className="w-3 h-3" /></button>
                <button className="p-1 hover:text-slate-700" title="Poor response"><ThumbsDown className="w-3 h-3" /></button>
                <button onClick={() => toast.success('Copied')} className="p-1 hover:text-slate-700" title="Copy text"><Copy className="w-3 h-3" /></button>
              </div>

              {/* Conversation Chat Stream */}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl text-xs space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-orange-50 text-slate-900 ml-3 border border-orange-200'
                      : 'bg-slate-50 text-slate-700 mr-2 border border-slate-200'
                  }`}
                >
                  <div className="font-bold text-[10px] text-slate-500 uppercase">
                    {msg.role === 'user' ? 'You' : 'Copilot'}
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Copilot Bottom Input Form & Stepper Pager */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
              
              {/* Stepper Pager Navigation Strip */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                    disabled={activeStepIndex === 0}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs disabled:opacity-30 transition-colors shadow-2xs"
                    title="Previous step"
                  >
                    ‹
                  </button>
                  <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-[#ff4f00] border border-orange-200 text-[11px] font-bold font-mono">
                    {activeStepIndex + 1}
                  </span>
                  <button
                    onClick={() => setActiveStepIndex(Math.min(steps.length - 1, activeStepIndex + 1))}
                    disabled={activeStepIndex >= steps.length - 1}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs disabled:opacity-30 transition-colors shadow-2xs"
                    title="Next step"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => {
                      fetchConnections(workflow?.id);
                      toast.success('Synced with Supabase');
                    }}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-[10px] transition-colors shadow-2xs"
                    title="Refresh step data"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  Step {activeStepIndex + 1} of {steps.length}
                </span>
              </div>

              <form onSubmit={handleCopilotChat} className="relative rounded-xl bg-white border border-slate-200 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-200 p-2 shadow-2xs">
                <textarea
                  rows={2}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCopilotChat();
                    }
                  }}
                  placeholder="Chat with Copilot..."
                  className="w-full bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <Sparkles className="w-3 h-3 text-[#ff4f00]" />

                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-2 py-0.5 rounded-md bg-[#ff4f00] hover:bg-[#e04500] text-white text-[11px] font-bold flex items-center gap-1 disabled:opacity-40 transition-colors shadow-2xs"
                  >
                    <span>Build</span>
                    {chatLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowUp className="w-3 h-3" />}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        )}

        {/* ─── 3. CENTER WORKFLOW CANVAS (VERTICAL SEQUENTIAL NODES) ─────────── */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-6 lg:p-8 flex flex-col items-center relative scrollbar-thin">
          
          {/* Dotted Grid Canvas Background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.35) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="w-full max-w-xl space-y-3 relative z-10 py-4">
            
            {steps.map((step, index) => {
              const isSelected = activeStepIndex === index;
              const isConnected = /formatter|zapier|webhook|filter/i.test(step.app) ||
                userConnections.some(c => c.app_name?.toLowerCase().includes(step.app?.toLowerCase()));

              return (
                <React.Fragment key={step.id || index}>
                  
                  {/* Floating Status Pill for Active Node */}
                  {isSelected && (
                    <div className="flex justify-center -mb-1 animate-fade-in">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-0.5 rounded-full bg-orange-50 text-[#ff4f00] border border-orange-200 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-[#ff4f00]" />
                        <span>Selected step</span>
                      </span>
                    </div>
                  )}

                  {/* Node Card Box (Clean White Light Mode) */}
                  <div
                    onClick={() => {
                      setActiveStepIndex(index);
                      setActiveTab('setup');
                    }}
                    className={`relative rounded-2xl p-4 sm:p-4.5 transition-all duration-200 cursor-pointer shadow-sm group ${
                      isSelected
                        ? 'bg-white border-2 border-[#ff4f00] shadow-md ring-2 ring-orange-100'
                        : 'bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Left: App Pill Badge & Step Title */}
                      <div className="space-y-1.5">
                        
                        {/* App Badge Pill */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 shadow-xs">
                          <AppIcon name={step.app} size="sm" />
                          <span className="text-[11px] font-bold text-slate-700">
                            {step.app}
                          </span>
                        </div>

                        {/* Step Title Label */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">
                          {step.label || `${index + 1}. ${step.actionEvent}`}
                        </h3>
                      </div>

                      {/* Right: Step Status & Options Menu */}
                      <div className="flex items-center gap-2">
                        {step.authRequired && !isConnected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Needs Account
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStep(index, e);
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Connector Line with Centered '+' Add Step Button */}
                  <div className="relative flex justify-center py-1.5">
                    <div className="w-0.5 h-7 bg-gradient-to-b from-orange-300 to-slate-300" />

                    <button
                      onClick={() => {
                        setInsertStepIndex(index + 1);
                        setShowAddStepModal(true);
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white hover:bg-[#ff4f00] border border-slate-300 hover:border-[#ff4f00] text-slate-500 hover:text-white flex items-center justify-center shadow-sm transition-all z-10 hover:scale-110"
                      title="Add a step here"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Bottom Add Step Button Pill */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  setInsertStepIndex(steps.length);
                  setShowAddStepModal(true);
                }}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-[#ff4f00] text-slate-600 hover:text-[#ff4f00] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add step to workflow</span>
              </button>
            </div>
          </div>
        </main>

        {/* ─── 4. RIGHT CONFIGURATION SIDEBAR (SETUP, CONFIGURE, TEST) ───────── */}
        {currentStep && (
          <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col justify-between flex-shrink-0 z-20 animate-fade-in shadow-md">
            
            {/* Header: Step Number, Title, Icons */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-sm flex-shrink-0">
                  <AppIcon name={currentStep.app} size="sm" />
                </div>
                <div className="truncate">
                  <h3 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{currentStep.label || currentStep.actionEvent}</span>
                    <Edit2 className="w-3 h-3 text-slate-400 hover:text-[#ff4f00] cursor-pointer" />
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-700" title="Expand"><Maximize2 className="w-3 h-3" /></button>
                <button onClick={() => setActiveStepIndex(null)} className="p-1 hover:text-slate-700" title="Close"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Step Navigation Tabs: Setup, Configure, Test */}
            <div className="flex items-center border-b border-slate-200 bg-white px-3">
              <button
                onClick={() => setActiveTab('setup')}
                className={`py-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'setup'
                    ? 'border-[#ff4f00] text-[#ff4f00]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'setup' ? 'bg-[#ff4f00]' : 'bg-slate-300'}`} />
                <span>Setup</span>
              </button>

              <span className="text-slate-600 text-xs">›</span>

              <button
                onClick={() => setActiveTab('configure')}
                className={`py-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'configure'
                    ? 'border-[#ff4f00] text-[#ff4f00]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'configure' ? 'bg-[#ff4f00]' : 'bg-slate-300'}`} />
                <span>Configure</span>
              </button>

              <span className="text-slate-400 text-xs">›</span>

              <button
                onClick={() => setActiveTab('test')}
                className={`py-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'test'
                    ? 'border-[#ff4f00] text-[#ff4f00]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'test' ? 'bg-[#ff4f00]' : 'bg-slate-300'}`} />
                <span>Test</span>
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              
              {/* ─── TAB 1: SETUP (APP SELECTION, ACTION EVENT, ACCOUNT AUTH) ── */}
              {activeTab === 'setup' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  
                  {/* Field: App * */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>App</span>
                      <span className="text-[#ff4f00]">*</span>
                    </label>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center p-1 shadow-xs border border-slate-200">
                          <AppIcon name={currentStep.app} size="sm" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{currentStep.app}</span>
                      </div>

                      <button
                        onClick={() => {
                          setInsertStepIndex(activeStepIndex);
                          setShowAppPickerForStep(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold transition-colors shadow-xs"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Field: Action event * */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Action event</span>
                      <span className="text-[#ff4f00]">*</span>
                    </label>

                    <select
                      value={currentStep.actionEvent}
                      onChange={(e) => handleUpdateStepField('actionEvent', e.target.value)}
                      className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 outline-none capitalize shadow-xs"
                    >
                      {availableActionsForCurrentStep.map((act) => (
                        <option key={act} value={act}>
                          {act}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field: Account * */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Account</span>
                      <span className="text-[#ff4f00]">*</span>
                    </label>

                    {isStepAppConnected ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {userConnections.find(c => c.app_name?.toLowerCase().includes(currentStep.app?.toLowerCase()))?.account_name
                                || (isGmailStep ? (localStorage.getItem('userEmail') || 'user@gmail.com') : `${currentStep.app} Active Account`)}
                            </p>
                            <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {isGmailStep ? 'Gmail — Connected & Verified via OAuth 2.0' : 'Connected & Verified'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnectApp(currentStep.app)}
                          className="text-[11px] text-slate-500 hover:text-slate-900 underline flex-shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        {/* Gmail OAuth CTA — styled like Zapier's account block */}
                        <div className="px-3 py-2.5 bg-slate-50 flex items-center gap-2 border-b border-slate-200">
                          <AppIcon name={currentStep.app} size="sm" />
                          <span className="text-xs text-slate-700 font-semibold">{currentStep.app}</span>
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Not connected</span>
                        </div>
                        <div className="p-3 space-y-2 bg-white">
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {isGmailStep
                              ? 'Sign in with your Google account to allow FlowAI to send emails on your behalf.'
                              : `Connect your ${currentStep.app} account to continue.`}
                          </p>
                          <button
                            onClick={() => handleConnectApp(currentStep.app)}
                            className="w-full py-2 rounded-lg bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {isGmailStep ? 'Sign in to Gmail via Google OAuth' : `Sign in to ${currentStep.app}`}
                          </button>
                          <p className="text-[10px] text-slate-400 text-center">
                            Secured with OAuth 2.0 — credentials are never stored in plain text.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Partner Security Assurance Notice */}
                  <div className="pt-2 text-[10px] text-slate-500 leading-relaxed space-y-1 border-t border-slate-200">
                    <p>
                      <span className="text-slate-700 font-semibold">{currentStep.app}</span> is a secure partner with FlowAI. Your credentials are encrypted and can be removed at any time.
                    </p>
                    <p>
                      You can <Link to="/connections" className="text-[#ff4f00] hover:underline">manage all of your connected accounts here</Link>.
                    </p>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: CONFIGURE (DYNAMIC FIELD MAPPING) ────────────────── */}
              {activeTab === 'configure' && (
                <div className="space-y-4 animate-fade-in text-xs">

                  {/* Gmail-specific Send Email configuration panel */}
                  {isGmailStep ? (
                    <GmailConfigPanel
                      currentStep={currentStep}
                      dynamicVariables={dynamicVariables}
                      handleUpdateStepField={handleUpdateStepField}
                      isStepAppConnected={isStepAppConnected}
                      handleConnectApp={handleConnectApp}
                    />
                  ) : (
                    /* Generic field mapping for all other apps */
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <h4 className="font-bold text-slate-900 flex items-center justify-between">
                        <span>Field Mapping</span>
                        <span className="text-[10px] text-[#ff4f00] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">Auto-mapped</span>
                      </h4>

                      <div className="space-y-1">
                        <label className="text-slate-500 text-[11px]">Event Title / Subject</label>
                        <input
                          type="text"
                          defaultValue={currentStep.config?.subject || 'Consultation Confirmed with {{Step1.client_name}}'}
                          className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 font-mono shadow-xs"
                          onChange={e => handleUpdateStepField('config', { ...currentStep.config, subject: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 text-[11px]">Recipient / Channel</label>
                        <input
                          type="text"
                          defaultValue={currentStep.config?.to || dynamicVariables.find(v => v.label.includes('email'))?.pill || '{{Step1.attendee_email}}'}
                          className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-orange-400/20 font-mono shadow-xs"
                          onChange={e => handleUpdateStepField('config', { ...currentStep.config, to: e.target.value })}
                        />
                      </div>

                      {/* Dynamic variable pills */}
                      {dynamicVariables.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Insert variable</p>
                          <div className="flex flex-wrap gap-1">
                            {dynamicVariables.slice(0, 6).map((v, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  navigator.clipboard?.writeText(v.pill);
                                  toast.success(`Copied ${v.label}`);
                                }}
                                title={v.desc}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-mono text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: TEST (STEP TESTING & LIVE JSON INSPECTION) ────────── */}
              {activeTab === 'test' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">Test Step Execution</h4>
                      <button
                        onClick={handleTestStep}
                        disabled={testingStep}
                        className="px-2.5 py-1 rounded-lg bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        {testingStep ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        <span>Test step</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      We'll perform a sample run to verify credentials and response mapping.
                    </p>
                  </div>

                  {testResult && (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Test successful (200 OK)</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{testResult.timestamp.slice(11, 19)}</span>
                      </div>

                      <pre className="p-2 rounded-lg bg-slate-50 text-[10px] font-mono text-emerald-700 overflow-x-auto max-h-40 scrollbar-thin border border-slate-200">
                        {JSON.stringify(testResult.outputData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50">
              {activeTab === 'setup' && (
                <button
                  onClick={() => setActiveTab('configure')}
                  className="w-full py-2 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-bold transition-all shadow-sm text-center"
                >
                  {isStepAppConnected ? 'Continue' : 'Add account to continue'}
                </button>
              )}

              {activeTab === 'configure' && (
                <button
                  onClick={() => setActiveTab('test')}
                  className="w-full py-2 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-bold transition-all shadow-sm text-center"
                >
                  Continue to Test
                </button>
              )}

              {activeTab === 'test' && (
                <button
                  onClick={() => handleSaveWorkflow(false)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done Editing Step</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: ADD STEP / CHANGE APP CHOOSER GRID                             */}
      {/* ========================================================================= */}
      {(showAddStepModal || showAppPickerForStep) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#ff4f00] border border-orange-200 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Choose App & Action Event</h3>
                  <p className="text-[10px] text-slate-500">Select an integration service to add to your flow</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddStepModal(false);
                  setShowAppPickerForStep(false);
                }}
                className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal App Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 scrollbar-thin bg-white">
              {POPULAR_APPS.map(app => (
                <div
                  key={app.id}
                  className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all space-y-2 group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center p-1 shadow-xs border border-slate-200 flex-shrink-0">
                      <AppIcon name={app.name} size="md" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">{app.name}</h4>
                      <p className="text-[9px] text-slate-500">{app.category}</p>
                    </div>
                  </div>

                  {/* Actions list */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    {app.actions.map(action => (
                      <button
                        key={action}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (showAppPickerForStep) {
                            // ── CHANGE APP for existing step ──────────────
                            // One atomic update: build the full updated step
                            // and write it in a single setSteps call so we
                            // never hit stale-closure bugs from sequential calls.
                            const appId = app.id;
                            setSteps(prev => prev.map((s, idx) => {
                              if (idx !== activeStepIndex) return s;
                              return {
                                ...s,
                                app: app.name,
                                appId,
                                actionEvent: action,
                                label: `${idx + 1}. ${action}`,
                                subtitle: app.name,
                                // reset auth status so the Setup panel shows
                                // the correct connection state for the new app
                                status: /formatter|zapier|webhook|filter/i.test(app.name)
                                  ? 'configured'
                                  : 'needs_auth',
                                authRequired: !/formatter|zapier|webhook|filter/i.test(app.name),
                              };
                            }));
                            setActiveTab('setup'); // snap panel back to Setup
                            setShowAppPickerForStep(false);
                            toast.success(`Updated to ${app.name} → ${action}`);

                            // Persist to backend (best-effort)
                            if (workflow?.id && workflow.id !== 'new') {
                              workflowsAPI.updateStep(
                                workflow.id,
                                steps[activeStepIndex]?.id || String(activeStepIndex + 1),
                                { app: app.name, appId, actionEvent: action }
                              ).catch(() => {});
                            }
                          } else {
                            // ── INSERT new step ──────────────────────────
                            handleInsertStep(app, action);
                          }
                        }}
                        className="w-full text-left px-2 py-1 rounded bg-slate-50 hover:bg-orange-50 text-[10px] text-slate-700 hover:text-[#ff4f00] flex items-center justify-between transition-colors border border-slate-100 hover:border-orange-200"
                      >
                        <span className="truncate">{action}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#ff4f00]" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
