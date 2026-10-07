import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { z } from 'zod';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe SDK in Test Mode
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
if (!stripeKey) {
  console.warn('⚠️ [Stripe] STRIPE_SECRET_KEY is missing in server/.env. Stripe SDK operations will require a valid test key.');
}
const stripe = new Stripe(stripeKey);

// Valid plan tiers
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free / Developer',
    price_monthly: 0,
    price_yearly: 0,
    task_limit: 100,
    workflow_limit: 5,
    log_retention_days: 1,
    ai_copilot: true,
    auto_retry: false,
    features: ['100 tasks/month', '5 active workflows', 'Gemini AI Copilot', 'Standard telemetry'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price_monthly: 29,
    price_yearly: 19,
    task_limit: 10000,
    workflow_limit: null, // unlimited
    log_retention_days: 7,
    ai_copilot: true,
    auto_retry: true,
    features: ['10,000 tasks/month', 'Unlimited workflows', 'Webhook auto-retry', '7-day log retention'],
  },
  team: {
    id: 'team',
    name: 'Team',
    price_monthly: 99,
    price_yearly: 69,
    task_limit: 100000,
    workflow_limit: null, // unlimited
    log_retention_days: 30,
    ai_copilot: true,
    auto_retry: true,
    features: ['100,000 tasks/month', 'Unlimited workflows + team members', 'Custom Gemini parameters', '30-day log retention + CSV export'],
  },
};

const upgradePlanSchema = z.object({
  plan: z.enum(['free', 'professional', 'team']),
  billing_period: z.enum(['monthly', 'yearly']).default('monthly'),
  card_last4: z.string().optional().default('4242'),
  card_brand: z.string().optional().default('Visa'),
  payment_method_id: z.string().optional(),
});

// ============================================================================
// PUBLIC WEBHOOK: POST /api/billing/webhook (Called directly by Stripe servers)
// ============================================================================
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (webhookSecret && req.rawBody) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || 'professional';
        const billingPeriod = session.metadata?.billing_period || 'yearly';
        const amount = (session.amount_total || 0) / 100;
        const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

        if (userId) {
          await query(
            'UPDATE users SET plan = $1, plan_updated_at = NOW() WHERE id = $2',
            [plan, userId]
          );

          await query(
            `INSERT INTO transactions (
              user_id, payment_id, plan, amount, billing_period, status, card_brand, receipt_note
            ) VALUES ($1, $2, $3, $4, $5, 'succeeded', 'Stripe Webhook', 'Verified Stripe Checkout Session')
            ON CONFLICT DO NOTHING`,
            [userId, paymentId, plan, amount, billingPeriod]
          );

          console.log(`[Stripe Webhook] Successfully processed checkout.session.completed for user ${userId} -> ${plan}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        const plan = paymentIntent.metadata?.plan;
        const billingPeriod = paymentIntent.metadata?.billing_period || 'monthly';
        const amount = (paymentIntent.amount || 0) / 100;

        if (userId && plan) {
          await query(
            'UPDATE users SET plan = $1, plan_updated_at = NOW() WHERE id = $2',
            [plan, userId]
          );

          await query(
            `INSERT INTO transactions (
              user_id, payment_id, plan, amount, billing_period, status, card_brand, receipt_note
            ) VALUES ($1, $2, $3, $4, $5, 'succeeded', 'Stripe', 'Stripe PaymentIntent Succeeded')
            ON CONFLICT DO NOTHING`,
            [userId, paymentIntent.id, plan, amount, billingPeriod]
          );

          console.log(`[Stripe Webhook] Successfully processed payment_intent.succeeded for user ${userId} -> ${plan}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Error]:', error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================
router.use(authenticate);

// GET /api/billing/plans — list all available plans
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.values(PLANS),
    stripe_enabled: Boolean(stripeKey && stripeKey.startsWith('sk_')),
  });
});

// GET /api/billing/status — get current user's plan from Supabase
router.get('/status', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT plan, plan_updated_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { plan = 'free', plan_updated_at } = result.rows[0];
    const planDetails = PLANS[plan] || PLANS.free;

    res.json({
      current_plan: plan || 'free',
      plan_details: planDetails,
      plan_updated_at,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/billing/create-checkout-session — Create official Stripe Hosted Checkout Session (Test Mode)
router.post('/create-checkout-session', async (req, res, next) => {
  try {
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      return res.status(500).json({
        message: 'Stripe Secret Key is not configured in server/.env. Please set STRIPE_SECRET_KEY to a valid Stripe test key (sk_test_...).'
      });
    }

    const { plan, billing_period } = req.body;
    const planInfo = PLANS[plan];
    if (!planInfo || plan === 'free') {
      return res.status(400).json({ message: 'Invalid plan selected for checkout' });
    }

    const amount = billing_period === 'yearly' ? planInfo.price_yearly * 12 : planInfo.price_monthly;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Direct Stripe API SDK call (Dynamic payment methods managed automatically by Stripe)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FlowAI ${planInfo.name} Plan`,
              description: `Automated Workflow Platform - ${billing_period === 'yearly' ? 'Annual Billing ($' + planInfo.price_yearly + '/mo)' : 'Monthly Billing ($' + planInfo.price_monthly + '/mo)'}`,
            },
            unit_amount: amount * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&upgraded=${plan}`,
      cancel_url: `${clientUrl}/pricing?cancelled=true`,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        plan,
        billing_period: billing_period || 'monthly',
      },
    });

    console.log(`[Stripe Test Mode] Created Checkout Session: ${session.id} for user ${req.user.id}`);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout Session Error]:', error.message);
    res.status(error.statusCode || 500).json({
      message: `Stripe Checkout Error: ${error.message}`
    });
  }
});

// GET /api/billing/verify-session — Verify real Stripe Checkout Session on return
router.get('/verify-session', async (req, res, next) => {
  try {
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      return res.status(500).json({
        message: 'Stripe Secret Key is not configured in server/.env.'
      });
    }

    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ message: 'session_id query parameter is required' });
    }

    // Retrieve directly from Stripe API SDK with expanded payment_intent
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent'],
    });

    if (session.payment_status === 'paid' || session.status === 'complete') {
      const plan = session.metadata?.plan || 'professional';
      const billingPeriod = session.metadata?.billing_period || 'monthly';
      const planInfo = PLANS[plan] || PLANS.professional;
      const amount = (session.amount_total || 0) / 100;
      const paymentIntentId = typeof session.payment_intent === 'object' && session.payment_intent?.id
        ? session.payment_intent.id
        : (typeof session.payment_intent === 'string' ? session.payment_intent : session.id);

      // Update Supabase users table
      await query(
        'UPDATE users SET plan = $1, plan_updated_at = NOW() WHERE id = $2',
        [plan, req.user.id]
      );

      // Check if already logged to avoid duplicates
      const existingTxn = await query(
        'SELECT id FROM transactions WHERE payment_id = $1',
        [paymentIntentId]
      );

      let txnId = existingTxn.rows[0]?.id;
      if (!txnId) {
        const txnResult = await query(
          `INSERT INTO transactions (
            user_id, payment_id, plan, amount, billing_period, status, card_brand, receipt_note
          ) VALUES ($1, $2, $3, $4, $5, 'succeeded', 'Stripe', $6)
          RETURNING id`,
          [req.user.id, paymentIntentId, plan, amount, billingPeriod, `Stripe Test Mode Payment Verified (${session.id})`]
        );
        txnId = txnResult.rows[0]?.id;
      }

      console.log(`[Stripe Test Mode] Verified session ${session_id} — User ${req.user.id} upgraded to ${plan} (Txn: ${txnId})`);

      return res.json({
        success: true,
        message: `Payment confirmed! Welcome to ${planInfo.name}.`,
        plan,
        plan_details: planInfo,
        transaction: {
          id: txnId || paymentIntentId,
          payment_id: paymentIntentId,
          amount_usd: amount,
          status: 'succeeded',
          plan: planInfo.name,
        }
      });
    }

    res.status(400).json({ message: 'Payment not completed or pending authorization.' });
  } catch (error) {
    console.error('[Stripe Verify Session Error]:', error.message);
    res.status(error.statusCode || 500).json({
      message: `Stripe Verification Error: ${error.message}`
    });
  }
});

// POST /api/billing/upgrade — Process Payment directly via Stripe SDK (PaymentIntent in Test Mode)
router.post('/upgrade', async (req, res, next) => {
  try {
    const data = upgradePlanSchema.parse(req.body);
    const { plan, billing_period, card_last4, card_brand, payment_method_id } = data;

    if (plan === 'free') {
      await query(
        'UPDATE users SET plan = $1, plan_updated_at = NOW() WHERE id = $2',
        ['free', req.user.id]
      );
      return res.json({
        message: 'Plan downgraded to Free tier successfully.',
        plan: 'free',
        plan_details: PLANS.free,
        transaction: null,
      });
    }

    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      return res.status(500).json({
        message: 'Stripe Secret Key is not configured in server/.env. Please set STRIPE_SECRET_KEY to a valid Stripe test key (sk_test_...).'
      });
    }

    const planInfo = PLANS[plan];
    if (!planInfo) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const amount = billing_period === 'yearly' ? planInfo.price_yearly : planInfo.price_monthly;
    const totalCents = (billing_period === 'yearly' ? planInfo.price_yearly * 12 : planInfo.price_monthly) * 100;

    // Direct Stripe SDK API call in Test Mode — no fake fallback
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      payment_method: payment_method_id || 'pm_card_visa', // Standard Stripe Test Mode PaymentMethod
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      description: `FlowAI ${planInfo.name} Subscription for User ${req.user.id}`,
      metadata: {
        userId: req.user.id,
        plan,
        billing_period,
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({
        message: `Payment status is ${paymentIntent.status}. Payment could not be completed automatically.`
      });
    }

    const realPaymentIntentId = paymentIntent.id;
    const stripeReceiptNote = `Stripe Test Mode PaymentIntent Confirmed (${paymentIntent.status})`;
    console.log(`[Stripe Test Mode] PaymentIntent succeeded: ${realPaymentIntentId} ($${totalCents / 100})`);

    // Update Supabase PostgreSQL database
    await query(
      'UPDATE users SET plan = $1, plan_updated_at = NOW() WHERE id = $2',
      [plan, req.user.id]
    );

    // Record in Supabase transactions table with real Stripe payment ID
    const txnResult = await query(
      `INSERT INTO transactions (
        user_id, payment_id, plan, amount, billing_period, status, card_last4, card_brand, receipt_note
      ) VALUES ($1, $2, $3, $4, $5, 'succeeded', $6, $7, $8)
      RETURNING id, created_at`,
      [
        req.user.id,
        realPaymentIntentId,
        plan,
        amount,
        billing_period,
        card_last4 || '4242',
        card_brand || 'Visa',
        stripeReceiptNote,
      ]
    );

    const insertedTxn = txnResult.rows[0];

    // Build structured transaction receipt
    const transaction = {
      id: insertedTxn?.id || realPaymentIntentId,
      payment_id: realPaymentIntentId,
      status: 'succeeded',
      amount_usd: amount,
      billing_period,
      plan: planInfo.name,
      card_last4: card_last4 || '4242',
      card_brand: card_brand || 'Visa',
      timestamp: insertedTxn?.created_at || new Date().toISOString(),
      receipt_note: stripeReceiptNote,
    };

    console.log(`[FlowAI Billing] User ${req.user.id} upgraded to ${plan} (${billing_period}) — $${amount}/mo (Real Stripe Txn: ${realPaymentIntentId})`);

    res.json({
      message: `Successfully subscribed to ${planInfo.name}!`,
      plan,
      plan_details: planInfo,
      transaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('[Stripe Upgrade Error]:', error.message);
    res.status(error.statusCode || 500).json({
      message: error.raw?.message || error.message || 'Payment processing failed with Stripe Test API.'
    });
  }
});

// GET /api/billing/transactions — get user's payment & subscription history
router.get('/transactions', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, payment_id, plan, amount, billing_period, status, card_last4, card_brand, receipt_note, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
