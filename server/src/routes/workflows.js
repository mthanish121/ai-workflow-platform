import express from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();
router.use(authenticate);

// Official Built-in Workflow Templates Catalog with Zapier-authentic Steps & Guidance
export const SERVER_TEMPLATES = {
  'tpl-lead-staging': {
    id: 'tpl-lead-staging',
    name: 'Create staging leads from ad forms for rapid follow-up',
    description: 'Captures incoming Facebook & Google Ad leads, validates phone/email with AI formatting, looks up contacts, and pushes qualified prospects to Pipedrive.',
    category: 'Marketing',
    requiredApps: ['Facebook Ads', 'Pipedrive', 'Google Contacts'],
    trigger: {
      type: 'form_submission',
      app: 'Facebook Ads',
      config: { form_name: 'facebook_instant_form_2026', event: 'lead_created' },
    },
    conditions: [
      { field: 'country', operator: 'exists', value: 'true' }
    ],
    actions: [
      { type: 'call_api', app: 'Formatter by Zapier', config: { operation: 'text_normalize_phone', format: 'E.164' } },
      { type: 'create_crm_record', app: 'Google Contacts', config: { action: 'find_or_create_contact', searchBy: 'email_or_phone' } },
      { type: 'create_crm_record', app: 'Pipedrive', config: { entity: 'lead', stage: 'Qualified Inbound' } },
    ],
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        type: 'trigger',
        app: 'Facebook Ads',
        appId: 'facebook',
        actionEvent: 'New Lead Form Submission',
        label: '1. New Lead Form',
        subtitle: 'Facebook Ads',
        status: 'configured',
        authRequired: true,
        badgeText: 'Trigger Event',
        config: { form_name: 'facebook_instant_form_2026' }
      },
      {
        id: 'step_2',
        stepNumber: 2,
        type: 'action',
        app: 'Formatter by Zapier',
        appId: 'zapier_formatter',
        actionEvent: 'Text (Format & Clean Input)',
        label: '2. Text',
        subtitle: 'Formatter by Zapier',
        status: 'configured',
        authRequired: false,
        badgeText: 'Built-in Tool',
        config: { transform: 'Phone number normalization to E.164' }
      },
      {
        id: 'step_3',
        stepNumber: 3,
        type: 'action',
        app: 'Google Contacts',
        appId: 'google_contacts',
        actionEvent: 'Find Contact',
        label: '3. Find Contact',
        subtitle: 'Google Contacts',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Selected authentication',
        config: { matchBy: 'email', fallback: 'phone' }
      },
      {
        id: 'step_4',
        stepNumber: 4,
        type: 'action',
        app: 'Google Contacts',
        appId: 'google_contacts',
        actionEvent: 'Create Contact (if not found)',
        label: '4. Find Contact',
        subtitle: 'Google Contacts',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Selected authentication',
        config: { matchBy: 'email', fallback: 'phone' }
      },
      {
        id: 'step_5',
        stepNumber: 5,
        type: 'action',
        app: 'Pipedrive',
        appId: 'pipedrive',
        actionEvent: 'Create Lead & Deal',
        label: '5. Create Lead',
        subtitle: 'Pipedrive',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'CRM Sync',
        config: { pipeline: 'Inbound Sales Pipeline' }
      }
    ],
    copilotGuidance: {
      defaults: [
        'Match contacts by email first, then phone as fallback.',
        'Create a new contact when no match is found.',
        'Normalize phone numbers to E.164 by default.'
      ],
      customize: [
        'Only create for records with an email or phone present.',
        'Add a team label or contact group when creating new contacts.'
      ],
      description: 'This is a pre-configured template that can be customized to fit your specific needs. While these are the suggested apps, the same workflow pattern can be applied using other integrations in your tech stack.',
      workedTime: 'Worked for 10 seconds >'
    }
  },
  'tpl-calendar-sales': {
    id: 'tpl-calendar-sales',
    name: 'Create calendar events from updated sales appointment rows',
    description: 'Watches Google Sheets for newly booked consultations, schedules calendar appointments, and notifies your sales Slack channel.',
    category: 'Sales & CRM',
    requiredApps: ['Google Sheets', 'Google Calendar', 'Gmail', 'Slack'],
    trigger: {
      type: 'database_change',
      app: 'Google Sheets',
      config: { source: 'google_sheets', table: 'sales_appointments', event: 'row_updated' }
    },
    conditions: [
      { field: 'status', operator: 'equals', value: 'confirmed' }
    ],
    actions: [
      { type: 'call_api', app: 'Google Calendar', config: { endpoint: 'calendar.events.create', calendarId: 'primary' } },
      { type: 'send_email', app: 'Gmail', config: { to: '{{attendee_email}}', subject: 'Consultation Confirmed' } },
      { type: 'send_slack_message', app: 'Slack', config: { channel: '#sales-alerts', message: 'New consultation confirmed' } }
    ],
    steps: [
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
        badgeText: 'Trigger',
        config: { spreadsheet: 'Consultations 2026', worksheet: 'Bookings' }
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
        config: { toFormat: 'YYYY-MM-DDTHH:mm:ssZ' }
      },
      {
        id: 'step_3',
        stepNumber: 3,
        type: 'action',
        app: 'Google Calendar',
        appId: 'google_calendar',
        actionEvent: 'Quick Add Event',
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
        actionEvent: 'Send Email',
        label: '4. Send Confirmation',
        subtitle: 'Gmail',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Communication',
        config: { subject: 'Your Meeting is Confirmed!' }
      },
      {
        id: 'step_5',
        stepNumber: 5,
        type: 'action',
        app: 'Slack',
        appId: 'slack',
        actionEvent: 'Send Channel Message',
        label: '5. Notify Sales Team',
        subtitle: 'Slack',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Alerts',
        config: { channel: '#sales-appointments' }
      }
    ],
    copilotGuidance: {
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
      workedTime: 'Worked for 8 seconds >'
    }
  },
  'tpl-agency-queue': {
    id: 'tpl-agency-queue',
    name: 'Add social lead to agency follow-up queue instantly',
    description: 'When a new lead fills your social bio link, automatically assign tasks in Asana and send an intro SMS.',
    category: 'Marketing',
    requiredApps: ['Facebook Ads', 'Asana', 'Twilio'],
    trigger: { type: 'webhook', app: 'Facebook Ads', config: { path: '/social-lead-hook' } },
    conditions: [],
    actions: [
      { type: 'create_task', app: 'Asana', config: { project: 'Inbound Social Leads', priority: 'high' } },
      { type: 'send_sms', app: 'Twilio', config: { to: '{{phone}}', message: 'Thanks for contacting us!' } }
    ],
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        type: 'trigger',
        app: 'Facebook Ads',
        appId: 'facebook',
        actionEvent: 'New Form Submission',
        label: '1. Catch Webhook / Bio Form',
        subtitle: 'Facebook Ads',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Trigger',
        config: {}
      },
      {
        id: 'step_2',
        stepNumber: 2,
        type: 'action',
        app: 'Asana',
        appId: 'asana',
        actionEvent: 'Create Task',
        label: '2. Create High-Priority Task',
        subtitle: 'Asana',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Project Management',
        config: { project: 'Client Onboarding' }
      }
    ],
    copilotGuidance: {
      defaults: ['Assign incoming lead task to the account director on duty.', 'Tag priority as High.'],
      customize: ['Add custom tags based on budget specified by lead.'],
      description: 'Streamline agency inbound workflows into actionable Asana tasks.',
      workedTime: 'Worked for 5 seconds >'
    }
  },
  'tpl-lead-alerts': {
    id: 'tpl-lead-alerts',
    name: 'Send immediate lead alerts to campaign managers via chat',
    description: 'Broadcast high-value lead submissions straight to Telegram & Slack with clickable CRM profile links.',
    category: 'Sales & CRM',
    requiredApps: ['Telegram', 'Slack', 'Notion'],
    trigger: { type: 'form_submission', app: 'Facebook Ads', config: { source: 'landing_page_quote' } },
    conditions: [{ field: 'budget', operator: 'greater_than', value: '1000' }],
    actions: [
      { type: 'send_slack_message', app: 'Slack', config: { channel: '#urgent-leads' } },
      { type: 'add_to_spreadsheet', app: 'Notion', config: { sheet: 'Notion VIP Deals' } }
    ],
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        type: 'trigger',
        app: 'Facebook Ads',
        appId: 'facebook',
        actionEvent: 'High-Intent Form Submission',
        label: '1. Quote Form Submitted',
        subtitle: 'Facebook Ads',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Trigger',
        config: {}
      },
      {
        id: 'step_2',
        stepNumber: 2,
        type: 'action',
        app: 'Slack',
        appId: 'slack',
        actionEvent: 'Send Channel Message',
        label: '2. Broadcast to Slack',
        subtitle: 'Slack',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Team Chat',
        config: { channel: '#vip-leads' }
      },
      {
        id: 'step_3',
        stepNumber: 3,
        type: 'action',
        app: 'Telegram',
        appId: 'telegram',
        actionEvent: 'Send Direct Message',
        label: '3. Alert Campaign Director',
        subtitle: 'Telegram',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Mobile Alert',
        config: {}
      }
    ],
    copilotGuidance: {
      defaults: ['Filter submissions with budget > $1,000.', 'Include direct telephone and email links in message.'],
      customize: ['Mention @channel for enterprise leads over $10,000.'],
      description: 'Instant notification pipeline for closing high-ticket opportunities.',
      workedTime: 'Worked for 6 seconds >'
    }
  },
  'tpl-ai-ticket-responder': {
    id: 'tpl-ai-ticket-responder',
    name: 'Classify support tickets & draft automated AI response',
    description: 'Uses Google Gemini AI to analyze customer sentiment, tag the issue category, and draft a tailored reply in Zendesk/Slack.',
    category: 'AI & Agents',
    requiredApps: ['Zendesk', 'Google Gemini', 'Slack', 'Gmail'],
    trigger: { type: 'email_received', app: 'Zendesk', config: { mailbox: 'support@flowai.io' } },
    conditions: [],
    actions: [
      { type: 'call_api', app: 'Google Gemini', config: { service: 'gemini_classifier' } },
      { type: 'send_slack_message', app: 'Slack', config: { channel: '#support-triage' } }
    ],
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        type: 'trigger',
        app: 'Zendesk',
        appId: 'zendesk',
        actionEvent: 'New Ticket Created',
        label: '1. New Zendesk Ticket',
        subtitle: 'Zendesk',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Trigger',
        config: {}
      },
      {
        id: 'step_2',
        stepNumber: 2,
        type: 'action',
        app: 'Google Gemini',
        appId: 'gemini',
        actionEvent: 'Classify & Generate Response',
        label: '2. Gemini 2.0 AI Analysis',
        subtitle: 'Google Gemini',
        status: 'configured',
        authRequired: false,
        badgeText: 'AI Agent',
        config: { model: 'gemini-2.0-flash' }
      },
      {
        id: 'step_3',
        stepNumber: 3,
        type: 'action',
        app: 'Slack',
        appId: 'slack',
        actionEvent: 'Post Triage Card',
        label: '3. Notify Support Channel',
        subtitle: 'Slack',
        status: 'needs_auth',
        authRequired: true,
        badgeText: 'Triage',
        config: { channel: '#support-ai' }
      }
    ],
    copilotGuidance: {
      defaults: ['Classify tickets into Billing, Technical, or Feature Request.', 'Draft polite and empathetic response with resolution links.'],
      customize: ['Automatically escalate negative sentiment scores.'],
      description: 'Deploy an autonomous AI customer support assistant.',
      workedTime: 'Worked for 12 seconds >'
    }
  }
};

const workflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(255),
  description: z.string().optional().default(''),
  trigger: z.object({
    type: z.string().min(1),
    app: z.string().optional(),
    config: z.record(z.any()).optional().default({}),
  }),
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.string(),
      value: z.any(),
    })
  ).optional().default([]),
  actions: z.array(
    z.object({
      type: z.string(),
      app: z.string().optional(),
      config: z.record(z.any()).optional().default({}),
    })
  ).min(1, 'At least one action is required'),
  steps: z.array(z.any()).optional().default([]),
  template_id: z.string().optional().nullable(),
  copilot_guidance: z.record(z.any()).optional().default({}),
  is_active: z.boolean().optional().default(false),
});

// Helper: Normalize app name to slug
const appNameToSlug = (name = '') => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
};

// ==========================================
// 1. TEMPLATE ACTIVATION & DATABASE ROUTING
// ==========================================

// POST /api/workflows/from-template — Create workflow from template and verify active connections
router.post('/from-template', async (req, res, next) => {
  try {
    const { templateId, template: clientTemplate } = req.body;
    const baseTemplate = (templateId && SERVER_TEMPLATES[templateId]) || clientTemplate || {};

    const name = baseTemplate.title || baseTemplate.name || 'Activated Zapier Workflow';
    const description = baseTemplate.desc || baseTemplate.description || 'Pre-configured workflow template';
    const trigger = baseTemplate.trigger || { type: 'webhook', config: {} };
    const conditions = Array.isArray(baseTemplate.conditions) ? baseTemplate.conditions : [];
    const actions = Array.isArray(baseTemplate.actions) && baseTemplate.actions.length > 0
      ? baseTemplate.actions
      : [{ type: 'send_email', config: {} }];

    // Derive steps if not explicitly provided
    let steps = Array.isArray(baseTemplate.steps) && baseTemplate.steps.length > 0 ? baseTemplate.steps : null;
    if (!steps) {
      steps = [];
      // Trigger Step
      steps.push({
        id: 'step_1',
        stepNumber: 1,
        type: 'trigger',
        app: trigger.app || (baseTemplate.sourceApps && baseTemplate.sourceApps[0]) || 'Webhook',
        appId: appNameToSlug(trigger.app || (baseTemplate.sourceApps && baseTemplate.sourceApps[0]) || 'webhook'),
        actionEvent: (trigger.type || 'webhook').replace(/_/g, ' '),
        label: `1. ${trigger.app || 'Trigger'}`,
        subtitle: trigger.app || 'Flow Trigger',
        status: 'configured',
        authRequired: true,
        badgeText: 'Trigger',
        config: trigger.config || {}
      });

      // Action Steps
      actions.forEach((act, idx) => {
        const stepNum = idx + 2;
        const appName = act.app || (baseTemplate.apps && baseTemplate.apps[stepNum - 1]) || 'Action Service';
        steps.push({
          id: `step_${stepNum}`,
          stepNumber: stepNum,
          type: 'action',
          app: appName,
          appId: appNameToSlug(appName),
          actionEvent: (act.type || 'send_message').replace(/_/g, ' '),
          label: `${stepNum}. ${appName}`,
          subtitle: appName,
          status: 'needs_auth',
          authRequired: true,
          badgeText: idx === 0 ? 'Selected authentication' : 'Action',
          config: act.config || {}
        });
      });
    }

    // Required apps list
    const requiredApps = baseTemplate.requiredApps || baseTemplate.apps || [
      ...new Set([
        trigger.app || (steps[0] && steps[0].app),
        ...actions.map(a => a.app),
        ...steps.map(s => s.app)
      ].filter(Boolean))
    ];

    // Fetch user's existing app connections from database
    const connResult = await query(
      `SELECT id, app_id, app_name, account_name, status, created_at
       FROM app_connections
       WHERE user_id = $1 AND status = 'connected'`,
      [req.user.id]
    );
    const existingConnections = connResult.rows;
    const connectedAppSlugs = new Set(existingConnections.map(c => appNameToSlug(c.app_name || c.app_id)));

    // Determine missing connections
    const missingConnections = [];
    const connectedApps = [];

    requiredApps.forEach(appName => {
      // Formatter by Zapier and Webhooks don't require external OAuth
      if (/formatter|webhook|schedule|filter/i.test(appName)) return;

      const slug = appNameToSlug(appName);
      const isConnected = connectedAppSlugs.has(slug) ||
        existingConnections.some(c => c.app_name?.toLowerCase().includes(appName.toLowerCase()) || appName.toLowerCase().includes(c.app_name?.toLowerCase()));

      if (isConnected) {
        connectedApps.push(appName);
      } else {
        missingConnections.push({
          appId: slug,
          appName: appName,
          buttonText: `Sign in to ${appName}`,
        });
      }
    });

    // Update steps status based on connections
    const enhancedSteps = steps.map(step => {
      const slug = appNameToSlug(step.app);
      const isConnected = connectedAppSlugs.has(slug) ||
        existingConnections.some(c => c.app_name?.toLowerCase().includes(step.app?.toLowerCase()));
      
      return {
        ...step,
        status: (/formatter|webhook|schedule|filter/i.test(step.app) || isConnected) ? 'configured' : 'needs_auth',
        connectedAccount: isConnected ? (existingConnections.find(c => appNameToSlug(c.app_name || c.app_id) === slug)?.account_name || 'Active Account') : null
      };
    });

    const copilotGuidance = baseTemplate.copilotGuidance || {
      defaults: [
        'Automatic field mapping configured for template schema.',
        'Retry on rate limits enabled with exponential backoff.'
      ],
      customize: [
        'Add custom filter rules or branches between nodes.',
        'Customize notification recipient emails or chat channels.'
      ],
      description: baseTemplate.desc || baseTemplate.description || 'Pre-configured workflow template blueprint.',
      workedTime: 'Worked for 10 seconds >'
    };

    // Save newly activated workflow in Postgres database
    const insertResult = await query(
      `INSERT INTO workflows (user_id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, is_active, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft')
       RETURNING id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, status, is_active, run_count, last_run_at, created_at, updated_at`,
      [
        req.user.id,
        name,
        description,
        JSON.stringify(trigger),
        JSON.stringify(conditions),
        JSON.stringify(actions),
        JSON.stringify(enhancedSteps),
        templateId || baseTemplate.id || 'custom-template',
        JSON.stringify(copilotGuidance),
        false // Default to draft
      ]
    );

    const createdWf = insertResult.rows[0];

    // Populate workflow_steps table for fine-grained persistence & real-time sync
    for (let i = 0; i < enhancedSteps.length; i++) {
      const s = enhancedSteps[i];
      await query(
        `INSERT INTO workflow_steps (workflow_id, user_id, step_number, type, app_name, app_id, action_event, label, subtitle, status, auth_required, badge_text, config)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          createdWf.id,
          req.user.id,
          s.stepNumber || i + 1,
          s.type || (i === 0 ? 'trigger' : 'action'),
          s.app || 'Service',
          s.appId || appNameToSlug(s.app || 'service'),
          s.actionEvent || 'action',
          s.label || `${i + 1}. ${s.app}`,
          s.subtitle || s.app || '',
          s.status || 'configured',
          Boolean(s.authRequired),
          s.badgeText || '',
          JSON.stringify(s.config || {})
        ]
      ).catch(() => {});
    }

    res.status(201).json({
      workflow: createdWf,
      missingConnections,
      connectedApps,
      requiredApps,
      message: 'Workflow created from template successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workflows/:id/connections — Validate required connections specifically for a workflow
router.get('/:id/connections', async (req, res, next) => {
  try {
    const wfResult = await query(
      `SELECT id, name, steps, trigger, actions FROM workflows WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (wfResult.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const workflow = wfResult.rows[0];
    const steps = Array.isArray(workflow.steps) ? workflow.steps : JSON.parse(workflow.steps || '[]');

    // Get user active connections
    const connResult = await query(
      `SELECT id, app_id, app_name, account_name, status, created_at
       FROM user_connections
       WHERE user_id = $1 AND status = 'connected'`,
      [req.user.id]
    );
    const userConns = connResult.rows;
    const connectedSlugs = new Set(userConns.map(c => appNameToSlug(c.app_name || c.app_id)));

    const requiredApps = [];
    const missingConnections = [];
    const connectedApps = [];

    steps.forEach(step => {
      if (!step.app || /formatter|zapier|webhook|filter/i.test(step.app)) return;
      if (!requiredApps.includes(step.app)) requiredApps.push(step.app);
    });

    requiredApps.forEach(appName => {
      const slug = appNameToSlug(appName);
      const isConnected = connectedSlugs.has(slug) ||
        userConns.some(c => c.app_name?.toLowerCase().includes(appName.toLowerCase()) || appName.toLowerCase().includes(c.app_name?.toLowerCase()));

      if (isConnected) {
        connectedApps.push(appName);
      } else {
        missingConnections.push({
          appId: slug,
          appName: appName,
          buttonText: `Sign in to ${appName}`,
        });
      }
    });

    res.json({
      workflowId: req.params.id,
      requiredApps,
      connectedApps,
      missingConnections,
      userConnections: userConns,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/workflows/:id/steps/:stepId — Real-time step configuration update
router.patch('/:id/steps/:stepId', async (req, res, next) => {
  try {
    const { id: workflowId, stepId } = req.params;
    const { app, actionEvent, label, config, status, connectedAccount } = req.body;

    // Verify workflow ownership
    const wfResult = await query(
      `SELECT id, steps FROM workflows WHERE id = $1 AND user_id = $2`,
      [workflowId, req.user.id]
    );
    if (wfResult.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    let steps = Array.isArray(wfResult.rows[0].steps)
      ? wfResult.rows[0].steps
      : JSON.parse(wfResult.rows[0].steps || '[]');

    // Update in memory JSON array
    let updatedStep = null;
    steps = steps.map((s, idx) => {
      const isMatch = s.id === stepId || String(s.stepNumber) === String(stepId) || String(idx + 1) === String(stepId);
      if (isMatch) {
        updatedStep = {
          ...s,
          ...(app !== undefined && { app, appId: appNameToSlug(app) }),
          ...(actionEvent !== undefined && { actionEvent }),
          ...(label !== undefined && { label }),
          ...(config !== undefined && { config: { ...s.config, ...config } }),
          ...(status !== undefined && { status }),
          ...(connectedAccount !== undefined && { connectedAccount }),
        };
        return updatedStep;
      }
      return s;
    });

    // Update workflows table JSON
    await query(
      `UPDATE workflows SET steps = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
      [JSON.stringify(steps), workflowId, req.user.id]
    );

    // Also update workflow_steps table if row exists
    if (updatedStep) {
      await query(
        `UPDATE workflow_steps
         SET app_name = COALESCE($1, app_name),
             action_event = COALESCE($2, action_event),
             label = COALESCE($3, label),
             config = COALESCE($4, config),
             status = COALESCE($5, status),
             updated_at = NOW()
         WHERE workflow_id = $6 AND user_id = $7 AND (id::text = $8 OR step_number = $9)`,
        [
          updatedStep.app,
          updatedStep.actionEvent,
          updatedStep.label,
          JSON.stringify(updatedStep.config || {}),
          updatedStep.status,
          workflowId,
          req.user.id,
          stepId,
          updatedStep.stepNumber || 1
        ]
      ).catch(() => {});
    }

    res.json({
      message: 'Step configuration saved in real-time',
      step: updatedStep,
      steps,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. APP CONNECTIONS MANAGEMENT FOR WORKFLOWS
// ==========================================

// GET /api/workflows/connections — List all user's connected apps
router.get('/connections', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, app_id, app_name, account_name, auth_type, status, created_at, updated_at
       FROM user_connections
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ connections: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/workflows/connections — Connect or mock-authenticate an app integration
router.post('/connections', async (req, res, next) => {
  try {
    const { appId, appName, accountName, authType, credentials } = req.body;
    if (!appName) {
      return res.status(400).json({ message: 'App name is required' });
    }

    const safeAppId = appId || appNameToSlug(appName);
    const safeAccountName = accountName || `${appName} Account (${req.user.email})`;

    // Upsert or insert connection
    const existing = await query(
      `SELECT id FROM app_connections WHERE user_id = $1 AND (app_id = $2 OR LOWER(app_name) = LOWER($3))`,
      [req.user.id, safeAppId, appName]
    );

    let connection;
    if (existing.rows.length > 0) {
      const updateResult = await query(
        `UPDATE app_connections 
         SET account_name = $1, status = 'connected', updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [safeAccountName, existing.rows[0].id]
      );
      connection = updateResult.rows[0];
    } else {
      const insertResult = await query(
        `INSERT INTO app_connections (user_id, app_id, app_name, account_name, auth_type, status, credentials)
         VALUES ($1, $2, $3, $4, $5, 'connected', $6)
         RETURNING *`,
        [req.user.id, safeAppId, appName, safeAccountName, authType || 'oauth', JSON.stringify(credentials || {})]
      );
      connection = insertResult.rows[0];
    }

    res.json({
      connection,
      message: `Successfully authenticated ${appName}!`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workflows/connections/:id — Disconnect an app integration
router.delete('/connections/:id', async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM app_connections WHERE id = $1 AND user_id = $2 RETURNING id, app_name`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json({ message: `Disconnected ${result.rows[0].app_name}` });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. CORE WORKFLOW CRUD OPERATIONS
// ==========================================

// GET /api/workflows — list user's workflows
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, status, is_active, run_count, last_run_at, created_at, updated_at
       FROM workflows
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ workflows: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/workflows/:id — get single workflow (owned by user)
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, status, is_active, run_count, last_run_at, created_at, updated_at
       FROM workflows
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const workflow = result.rows[0];

    // Fetch user connections to cross-reference
    const connResult = await query(
      `SELECT id, app_id, app_name, account_name, status FROM app_connections WHERE user_id = $1`,
      [req.user.id]
    );
    const connections = connResult.rows;

    res.json({ workflow, connections });
  } catch (error) {
    next(error);
  }
});

// POST /api/workflows — create workflow
router.post('/', async (req, res, next) => {
  try {
    const data = workflowSchema.parse(req.body);
    const result = await query(
      `INSERT INTO workflows (user_id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user.id,
        data.name,
        data.description,
        JSON.stringify(data.trigger),
        JSON.stringify(data.conditions),
        JSON.stringify(data.actions),
        JSON.stringify(data.steps || []),
        data.template_id || null,
        JSON.stringify(data.copilot_guidance || {}),
        data.is_active,
      ]
    );
    res.status(201).json({ workflow: result.rows[0], message: 'Workflow created successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
});

// PUT /api/workflows/:id — update workflow
router.put('/:id', async (req, res, next) => {
  try {
    // Verify ownership first
    const existing = await query(
      'SELECT id FROM workflows WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const data = workflowSchema.partial().parse(req.body);
    const updates = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) { updates.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { updates.push(`description = $${idx++}`); values.push(data.description); }
    if (data.trigger !== undefined) { updates.push(`trigger = $${idx++}`); values.push(JSON.stringify(data.trigger)); }
    if (data.conditions !== undefined) { updates.push(`conditions = $${idx++}`); values.push(JSON.stringify(data.conditions)); }
    if (data.actions !== undefined) { updates.push(`actions = $${idx++}`); values.push(JSON.stringify(data.actions)); }
    if (data.steps !== undefined) { updates.push(`steps = $${idx++}`); values.push(JSON.stringify(data.steps)); }
    if (data.copilot_guidance !== undefined) { updates.push(`copilot_guidance = $${idx++}`); values.push(JSON.stringify(data.copilot_guidance)); }
    if (data.is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(data.is_active); }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id, req.user.id);

    const result = await query(
      `UPDATE workflows SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx++} RETURNING *`,
      values
    );

    res.json({ workflow: result.rows[0], message: 'Workflow updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
});

// PATCH /api/workflows/:id/status — toggle is_active (ON / OFF)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ message: '`is_active` must be a boolean' });
    }

    const result = await query(
      `UPDATE workflows
       SET is_active = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, is_active, updated_at`,
      [is_active, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const updated = result.rows[0];
    res.json({
      message: `Workflow ${updated.is_active ? 'activated' : 'deactivated'} successfully`,
      workflow: updated,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workflows/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM workflows WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/workflows/:id/execute — mock trigger execution
router.post('/:id/execute', async (req, res, next) => {
  try {
    const wfResult = await query(
      'SELECT * FROM workflows WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (wfResult.rows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const workflow = wfResult.rows[0];
    const startedAt = new Date();

    // Create an in-progress log entry
    const logResult = await query(
      `INSERT INTO execution_logs (workflow_id, user_id, status, trigger_data, steps_executed, started_at)
       VALUES ($1, $2, 'running', $3, $4, NOW())
       RETURNING id`,
      [workflow.id, req.user.id, JSON.stringify(req.body || {}), JSON.stringify([])]
    );
    const logId = logResult.rows[0].id;

    // Simulate execution steps
    const steps = [];
    const workflowSteps = Array.isArray(workflow.steps) && workflow.steps.length > 0
      ? workflow.steps
      : (Array.isArray(workflow.actions) ? workflow.actions : JSON.parse(workflow.actions || '[]'));

    for (let i = 0; i < workflowSteps.length; i++) {
      const stepItem = workflowSteps[i];
      await new Promise(r => setTimeout(r, 100)); // simulate processing
      steps.push({
        step: i + 1,
        name: stepItem.label || stepItem.type || `Step ${i + 1}`,
        app: stepItem.app || 'Service',
        config: stepItem.config || {},
        status: 'success',
        executed_at: new Date().toISOString(),
        result: `Mock execution of "${stepItem.label || stepItem.type || 'step'}" completed successfully`,
      });
    }

    const duration = Date.now() - startedAt.getTime();

    // Update log to completed
    await query(
      `UPDATE execution_logs 
       SET status = 'success', steps_executed = $1, duration_ms = $2, completed_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(steps), duration, logId]
    );

    // Update workflow run count and last run
    await query(
      `UPDATE workflows SET run_count = run_count + 1, last_run_at = NOW(), status = 'active', updated_at = NOW()
       WHERE id = $1`,
      [workflow.id]
    );

    const logFinal = await query('SELECT * FROM execution_logs WHERE id = $1', [logId]);

    res.json({
      message: 'Workflow executed successfully',
      log: logFinal.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
