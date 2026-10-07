import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
router.use(authenticate);

// Helper: Normalize app name to slug
const appNameToSlug = (name = '') => {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'app';
};

// ─── Intelligent Open-Ended Fallback Workflow Generator ────────────────────────
// Intelligently parses ANY open-ended natural language prompt into
// a realistic, multi-step Zapier-style automation pipeline when Gemini is busy or offline.
function generateFallbackWorkflow(prompt) {
  const text = (prompt || '').trim();
  const lower = text.toLowerCase();

  // 1. Identify Trigger App & Event
  let triggerApp = 'Webhooks by FlowAI';
  let triggerAppId = 'webhook';
  let triggerEvent = 'Catch Hook';
  let triggerLabel = '1. Catch Webhook';
  let triggerConfig = { method: 'POST', path: '/webhook/custom', secret: 'auto_generated' };

  if (/shopify/i.test(lower)) {
    triggerApp = 'Shopify';
    triggerAppId = 'shopify';
    triggerEvent = /cancel/i.test(lower) ? 'Cancelled Order' : /customer/i.test(lower) ? 'New Customer' : 'New Order Created';
    triggerLabel = `1. ${triggerEvent} in Shopify`;
    triggerConfig = { topic: 'orders/create', store_url: 'myshop.myshopify.com' };
  } else if (/jira/i.test(lower)) {
    triggerApp = 'Jira';
    triggerAppId = 'jira';
    triggerEvent = /comment/i.test(lower) ? 'New Comment' : 'New or Updated Issue';
    triggerLabel = `1. ${triggerEvent} in Jira`;
    triggerConfig = { projectKey: 'ENG', issueType: 'Bug', priorityFilter: 'High' };
  } else if (/stripe|payment|charge|invoice/i.test(lower)) {
    triggerApp = 'Stripe';
    triggerAppId = 'stripe';
    triggerEvent = /fail/i.test(lower) ? 'Payment Failed' : 'Payment Intent Succeeded';
    triggerLabel = `1. ${triggerEvent} in Stripe`;
    triggerConfig = { event: 'payment_intent.succeeded' };
  } else if (/rss|news|feed/i.test(lower)) {
    triggerApp = 'RSS by Zapier';
    triggerAppId = 'rss';
    triggerEvent = 'New Item in Feed';
    triggerLabel = '1. New RSS Feed Item';
    triggerConfig = { feedUrl: 'https://news.ycombinator.com/rss' };
  } else if (/schedule|cron|daily|every\s+(day|hour|week)|morning/i.test(lower)) {
    triggerApp = 'Schedule by Zapier';
    triggerAppId = 'schedule';
    triggerEvent = 'Every Day';
    triggerLabel = '1. Scheduled Trigger';
    triggerConfig = { triggerTime: '09:00', timezone: 'UTC' };
  } else if (/github|git|pull\s*request|commit|pr\b/i.test(lower)) {
    triggerApp = 'GitHub';
    triggerAppId = 'github';
    triggerEvent = /pr|pull/i.test(lower) ? 'New Pull Request' : 'New Push or Commit';
    triggerLabel = `1. ${triggerEvent} in GitHub`;
    triggerConfig = { repo: 'org/repo', event: 'pull_request.opened' };
  } else if (/google\s*sheets?|sheet|spreadsheet/i.test(lower)) {
    triggerApp = 'Google Sheets';
    triggerAppId = 'google_sheets';
    triggerEvent = 'New or Updated Row';
    triggerLabel = '1. New Row in Google Sheets';
    triggerConfig = { spreadsheet: 'Active Data 2026', worksheet: 'Sheet1' };
  } else if (/gmail|email|inbox/i.test(lower) && !/send\s+email/i.test(lower)) {
    triggerApp = 'Gmail';
    triggerAppId = 'gmail';
    triggerEvent = 'New Email Matching Search';
    triggerLabel = '1. New Email in Gmail';
    triggerConfig = { searchString: 'is:unread has:attachment' };
  } else if (/form|typeform|tally/i.test(lower)) {
    triggerApp = 'Typeform';
    triggerAppId = 'typeform';
    triggerEvent = 'New Entry / Form Submission';
    triggerLabel = '1. New Form Submission';
    triggerConfig = { formId: 'inbound_intake_form' };
  }

  // 2. Identify Intermediate Processing Steps (Formatter, Gemini AI, Filter, etc.)
  const intermediateSteps = [];
  let stepIndex = 2;

  // AI Summarization / Processing step
  const needsAi = /ai|summar|classif|extract|sentiment|draft|gpt|gemini|analys|intel/i.test(lower);
  if (needsAi) {
    intermediateSteps.push({
      id: `step_${stepIndex}`,
      stepNumber: stepIndex,
      type: 'action',
      app: 'Google Gemini',
      appId: 'gemini',
      actionEvent: /sentiment/i.test(lower) ? 'Classify Sentiment & Emotion' : /extract/i.test(lower) ? 'Extract Structured Entities' : 'Summarize Text & Content',
      label: `${stepIndex}. Gemini AI Reasoning`,
      subtitle: 'Google Gemini',
      status: 'configured',
      authRequired: false,
      badgeText: 'AI Powered',
      config: {
        model: 'gemini-2.0-flash',
        promptTemplate: `Analyze the incoming payload from ${triggerApp} and produce clean structured key-value output.`,
        temperature: 0.2
      }
    });
    stepIndex++;
  }

  // Formatter or Data Transformer step
  const needsFormatter = /sync|notion|transform|format|clean|currency|order|parse/i.test(lower);
  if (needsFormatter) {
    intermediateSteps.push({
      id: `step_${stepIndex}`,
      stepNumber: stepIndex,
      type: 'action',
      app: 'Formatter by Zapier',
      appId: 'zapier_formatter',
      actionEvent: 'Text (Transform & Clean Data)',
      label: `${stepIndex}. Clean & Map Fields`,
      subtitle: 'Formatter by Zapier',
      status: 'configured',
      authRequired: false,
      badgeText: 'Built-in Tool',
      config: {
        operation: 'text_extract_and_format',
        inputs: ['{{trigger.id}}', '{{trigger.title}}', '{{trigger.amount}}']
      }
    });
    stepIndex++;
  }

  // Filter / Condition step
  const needsFilter = /filter|priority|high|urgent|condition|only\s+if|when/i.test(lower);
  if (needsFilter) {
    intermediateSteps.push({
      id: `step_${stepIndex}`,
      stepNumber: stepIndex,
      type: 'action',
      app: 'Filter by Zapier',
      appId: 'filter',
      actionEvent: 'Only Continue If...',
      label: `${stepIndex}. Check Priority & Status`,
      subtitle: 'Filter by Zapier',
      status: 'configured',
      authRequired: false,
      badgeText: 'Conditional',
      config: {
        field: 'priority',
        operator: 'contains',
        value: 'High'
      }
    });
    stepIndex++;
  }

  // If no intermediate steps were triggered, insert a standard Formatter tool to guarantee a rich multi-step experience
  if (intermediateSteps.length === 0) {
    intermediateSteps.push({
      id: `step_${stepIndex}`,
      stepNumber: stepIndex,
      type: 'action',
      app: 'Formatter by Zapier',
      appId: 'zapier_formatter',
      actionEvent: 'Utilities (Data Prep & Normalization)',
      label: `${stepIndex}. Transform Data`,
      subtitle: 'Formatter by Zapier',
      status: 'configured',
      authRequired: false,
      badgeText: 'Built-in Tool',
      config: { operation: 'data_cleanse' }
    });
    stepIndex++;
  }

  // 3. Identify Action Destination Apps & Outputs
  const actionSteps = [];

  if (/notion/i.test(lower)) {
    actionSteps.push({
      app: 'Notion',
      appId: 'notion',
      actionEvent: 'Create Database Page / Item',
      config: { databaseId: 'Orders & Workflows Database' }
    });
  }
  if (/telegram/i.test(lower)) {
    actionSteps.push({
      app: 'Telegram',
      appId: 'telegram',
      actionEvent: 'Send Channel Alert',
      config: { chatId: '@alerts_channel', parseMode: 'MarkdownV2' }
    });
  }
  if (/slack/i.test(lower)) {
    actionSteps.push({
      app: 'Slack',
      appId: 'slack',
      actionEvent: 'Send Channel Message',
      config: { channel: '#workflow-notifications' }
    });
  }
  if (/gmail|email|mail/i.test(lower)) {
    actionSteps.push({
      app: 'Gmail',
      appId: 'gmail',
      actionEvent: 'Send Email',
      config: { to: 'team@company.com', subject: 'Automated FlowAI Notification' }
    });
  }
  if (/sheet|spreadsheet/i.test(lower) && triggerAppId !== 'google_sheets') {
    actionSteps.push({
      app: 'Google Sheets',
      appId: 'google_sheets',
      actionEvent: 'Create Spreadsheet Row',
      config: { spreadsheet: 'Master Records', worksheet: 'Sheet1' }
    });
  }
  if (/jira/i.test(lower) && triggerAppId !== 'jira') {
    actionSteps.push({
      app: 'Jira',
      appId: 'jira',
      actionEvent: 'Create Issue',
      config: { project: 'ENG', issueType: 'Task' }
    });
  }

  // Default action fallback if none detected
  if (actionSteps.length === 0) {
    actionSteps.push({
      app: 'Slack',
      appId: 'slack',
      actionEvent: 'Send Notification Card',
      config: { channel: '#general', message: `Processed: ${text}` }
    });
  }

  // Combine into full sequence of steps
  const allSteps = [
    {
      id: 'step_1',
      stepNumber: 1,
      type: 'trigger',
      app: triggerApp,
      appId: triggerAppId,
      actionEvent: triggerEvent,
      label: triggerLabel,
      subtitle: triggerApp,
      status: 'needs_auth',
      authRequired: true,
      badgeText: 'Trigger Event',
      config: triggerConfig
    },
    ...intermediateSteps
  ];

  actionSteps.forEach((act) => {
    allSteps.push({
      id: `step_${stepIndex}`,
      stepNumber: stepIndex,
      type: 'action',
      app: act.app,
      appId: act.appId,
      actionEvent: act.actionEvent,
      label: `${stepIndex}. ${act.actionEvent}`,
      subtitle: act.app,
      status: 'needs_auth',
      authRequired: true,
      badgeText: 'Action',
      config: act.config || {}
    });
    stepIndex++;
  });

  // Capitalize name
  const workflowName = text.length > 50
    ? text.slice(0, 47) + '...'
    : text.charAt(0).toUpperCase() + text.slice(1);

  return {
    name: workflowName,
    description: `Automates: "${text}". Listens for events in ${triggerApp}, formats and transforms data, and syncs downstream.`,
    trigger: {
      app: triggerApp,
      appId: triggerAppId,
      type: triggerEvent.toLowerCase().replace(/\s+/g, '_'),
      config: triggerConfig
    },
    conditions: needsFilter ? [{ field: 'status', operator: 'equals', value: 'approved' }] : [],
    actions: allSteps.filter(s => s.type === 'action').map(s => ({
      app: s.app,
      appId: s.appId,
      type: s.actionEvent.toLowerCase().replace(/\s+/g, '_'),
      config: s.config || {}
    })),
    steps: allSteps,
    copilot_guidance: {
      defaults: [
        `Configured ${triggerApp} as the starting trigger node.`,
        `Chained ${allSteps.length - 1} action step(s) with pre-mapped attributes.`
      ],
      customize: [
        'Authenticate your accounts using the "Sign in to [App]" buttons.',
        'Refine specific field mapping templates in the canvas configuration panel.'
      ],
      description: `Tailormade workflow for: "${text}"`,
      workedTime: 'Worked for 4 seconds >'
    }
  };
}

// ─── Primary Generator Handler ────────────────────────────────────────────────
// Handles both POST /api/ai/generate-workflow and POST /api/ai/generate
async function handleWorkflowGeneration(req, res, next) {
  try {
    const rawPrompt = req.body.prompt || req.body.description || req.body.query || '';
    const prompt = typeof rawPrompt === 'string' ? rawPrompt.trim() : '';

    if (!prompt || prompt.length < 3) {
      return res.status(400).json({
        message: 'Please provide a workflow description of at least 3 characters',
      });
    }

    let generatedWf = null;
    let source = 'fallback';

    // ── 1. Attempt Gemini 2.0 AI Generation ──────────────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemPrompt = `You are FlowAI's Principal Automation Architect. Your task is to take any arbitrary user automation idea or request and generate a complete, production-ready multi-step workflow.

You MUST respond with ONLY a single valid JSON object with this exact structure:
{
  "name": "string (Concise workflow title, e.g. 'Sync Shopify Orders to Notion Database')",
  "description": "string (1-2 sentences explaining what the pipeline executes)",
  "trigger": {
    "app": "string (Display app name, e.g. 'Shopify', 'Jira', 'Stripe', 'Webhooks by FlowAI', 'Schedule by Zapier', 'RSS by Zapier', 'GitHub', 'Google Sheets')",
    "appId": "string (slug: 'shopify', 'jira', 'stripe', 'webhook', 'schedule', 'rss', 'github', 'google_sheets')",
    "type": "string (snake_case event: e.g. 'new_order', 'issue_created')",
    "actionEvent": "string (e.g. 'New Order Created')",
    "config": { "sample": "defaults" }
  },
  "conditions": [
    {
      "field": "string",
      "operator": "equals|contains|greater_than|exists",
      "value": "string or number"
    }
  ],
  "actions": [
    {
      "app": "string (e.g. 'Formatter by Zapier', 'Google Gemini', 'Notion', 'Telegram', 'Slack', 'Gmail', 'Google Sheets')",
      "appId": "string (slug: 'zapier_formatter', 'gemini', 'notion', 'telegram', 'slack', 'gmail', 'google_sheets')",
      "type": "string (snake_case: e.g. 'format_data', 'summarize', 'create_page')",
      "actionEvent": "string (e.g. 'Format Currency & Line Items', 'Create Database Item')",
      "config": {}
    }
  ],
  "steps": [
    {
      "id": "step_1",
      "stepNumber": 1,
      "type": "trigger",
      "app": "string (App name)",
      "appId": "string (slug)",
      "actionEvent": "string (Event label)",
      "label": "1. Event in App",
      "subtitle": "App Name",
      "status": "needs_auth",
      "authRequired": true,
      "badgeText": "Trigger Event",
      "config": {}
    },
    {
      "id": "step_2",
      "stepNumber": 2,
      "type": "action",
      "app": "string",
      "appId": "string",
      "actionEvent": "string",
      "label": "2. Action in App",
      "subtitle": "App Name",
      "status": "needs_auth",
      "authRequired": true,
      "badgeText": "Action",
      "config": {}
    }
  ],
  "copilot_guidance": {
    "defaults": ["Bullet 1 of configuration details", "Bullet 2 of mapping"],
    "customize": ["Bullet 1 of customization ideas", "Bullet 2"],
    "description": "Short explanation",
    "workedTime": "Worked for 5 seconds >"
  }
}

Rules:
- Intelligently break down the user's intent into 3 to 5 realistic sequential steps.
- If the user mentions formatting, data cleaning, or structure: include 'Formatter by Zapier'.
- If the user mentions AI, summarization, analysis, or intelligence: include 'Google Gemini' as an AI reasoning step.
- If the user mentions conditions or priority: include 'Filter by Zapier'.
- Make sure steps array begins with step 1 (trigger) and has stepNumber 1, 2, 3...
- Return ONLY the JSON object. Do not include markdown code block ticks or explanation.`;

        // Execute Gemini call with 6-second timeout protection
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: `Create an automation workflow for this prompt:\n"${prompt}"` }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);

        const rawJson = response.text().trim();
        const parsed = JSON.parse(rawJson);

        if (parsed.name && parsed.trigger && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
          // Normalize steps
          const normalizedSteps = parsed.steps.map((s, idx) => ({
            id: s.id || `step_${idx + 1}`,
            stepNumber: idx + 1,
            type: idx === 0 ? 'trigger' : 'action',
            app: s.app || (idx === 0 ? parsed.trigger.app : 'Action Service'),
            appId: s.appId || appNameToSlug(s.app),
            actionEvent: s.actionEvent || (idx === 0 ? parsed.trigger.actionEvent : 'Perform Action'),
            label: s.label || `${idx + 1}. ${s.actionEvent || s.app}`,
            subtitle: s.subtitle || s.app,
            status: /formatter|filter|builtin|schedule|webhook/i.test(s.app) ? 'configured' : 'needs_auth',
            authRequired: !(/formatter|filter|builtin/i.test(s.app)),
            badgeText: idx === 0 ? 'Trigger Event' : (/gemini|ai/i.test(s.app) ? 'AI Powered' : 'Action'),
            config: s.config || {}
          }));

          generatedWf = {
            ...parsed,
            steps: normalizedSteps
          };
          source = 'gemini';
        }
      } catch (geminiErr) {
        console.warn('[FlowAI] Gemini generation fallback triggered:', geminiErr.message);
        generatedWf = null;
      }
    }

    // ── 2. Fallback to Open-Ended Keyword & Intent Parser ───────────────────────
    if (!generatedWf) {
      generatedWf = generateFallbackWorkflow(prompt);
      source = 'intelligent-parser';
    }

    // ── 3. Check User's Existing Integrations in Database ───────────────────────
    let existingConnections = [];
    try {
      const connResult = await query(
        `SELECT id, app_id, app_name, account_name, status FROM app_connections WHERE user_id = $1 AND status = 'connected'`,
        [req.user.id]
      );
      existingConnections = connResult.rows || [];
    } catch {
      existingConnections = [];
    }

    const connectedSlugs = new Set(existingConnections.map(c => appNameToSlug(c.app_name || c.app_id)));

    // Mark steps with active connections
    const finalizedSteps = generatedWf.steps.map(step => {
      const slug = appNameToSlug(step.app || step.appId);
      const isConnected = connectedSlugs.has(slug) ||
        existingConnections.some(c => c.app_name?.toLowerCase().includes(step.app?.toLowerCase()));
      
      const isBuiltin = /formatter|webhook|schedule|filter|builtin/i.test(step.app);

      return {
        ...step,
        status: (isBuiltin || isConnected) ? 'configured' : 'needs_auth',
        authRequired: !isBuiltin,
        connectedAccount: isConnected
          ? (existingConnections.find(c => appNameToSlug(c.app_name || c.app_id) === slug)?.account_name || 'Active Account')
          : null
      };
    });

    // Compute required and missing apps
    const requiredApps = [];
    const missingConnections = [];
    const connectedApps = [];

    finalizedSteps.forEach(s => {
      if (!s.app || /formatter|webhook|schedule|filter|builtin/i.test(s.app)) return;
      if (!requiredApps.includes(s.app)) requiredApps.push(s.app);
    });

    requiredApps.forEach(appName => {
      const slug = appNameToSlug(appName);
      const isConnected = connectedSlugs.has(slug) ||
        existingConnections.some(c => c.app_name?.toLowerCase().includes(appName.toLowerCase()));

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

    // ── 4. Dynamic Database Seeding into Supabase (PostgreSQL) ──────────────────
    const insertResult = await query(
      `INSERT INTO workflows (user_id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, is_active, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft')
       RETURNING id, name, description, trigger, conditions, actions, steps, template_id, copilot_guidance, status, is_active, run_count, last_run_at, created_at, updated_at`,
      [
        req.user.id,
        generatedWf.name || prompt,
        generatedWf.description || `Generated from prompt: "${prompt}"`,
        JSON.stringify(generatedWf.trigger || {}),
        JSON.stringify(generatedWf.conditions || []),
        JSON.stringify(generatedWf.actions || []),
        JSON.stringify(finalizedSteps),
        'ai-generated',
        JSON.stringify(generatedWf.copilot_guidance || {}),
        false
      ]
    );

    const createdWorkflow = insertResult.rows[0];

    // Seed individual step records in workflow_steps table
    for (let i = 0; i < finalizedSteps.length; i++) {
      const s = finalizedSteps[i];
      await query(
        `INSERT INTO workflow_steps (workflow_id, user_id, step_number, type, app_name, app_id, action_event, label, subtitle, status, auth_required, badge_text, config)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          createdWorkflow.id,
          req.user.id,
          s.stepNumber || i + 1,
          s.type || (i === 0 ? 'trigger' : 'action'),
          s.app || 'Service',
          appNameToSlug(s.app),
          s.actionEvent || 'Execute',
          s.label || `${i + 1}. ${s.app}`,
          s.subtitle || s.app,
          s.status || 'needs_auth',
          Boolean(s.authRequired),
          s.badgeText || (i === 0 ? 'Trigger Event' : 'Action'),
          JSON.stringify(s.config || {})
        ]
      ).catch(() => {});
    }

    return res.status(201).json({
      message: 'Workflow dynamically generated and seeded into database',
      workflow: createdWorkflow,
      workflowId: createdWorkflow.id,
      missingConnections,
      connectedApps,
      requiredApps,
      source
    });

  } catch (error) {
    next(error);
  }
}

// Routes
router.post('/generate-workflow', handleWorkflowGeneration);
router.post('/generate', handleWorkflowGeneration);

export default router;
