import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import ExploreAppsModal from '../components/ExploreAppsModal';
import ContactSalesModal from '../components/ContactSalesModal';
import CheckoutModal from '../components/CheckoutModal';
import { billingAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  Sparkles, Check, ArrowRight, Bot, Cpu, ShieldCheck,
  Zap, HelpCircle, ChevronDown, ChevronUp, Layers, CheckCircle2,
  Database, Server, LayoutGrid, MessageSquare
} from 'lucide-react';

const TASK_LEVELS = [
  { label: '100', value: 100, proPrice: 19, teamPrice: 69 },
  { label: '2K', value: 2000, proPrice: 19, teamPrice: 69 },
  { label: '10K', value: 10000, proPrice: 49, teamPrice: 99 },
  { label: '100K', value: 100000, proPrice: 189, teamPrice: 299 },
  { label: '1M', value: 1000000, proPrice: 799, teamPrice: 999 },
  { label: '2M', value: 2000000, proPrice: 1499, teamPrice: 1799 },
];

// Plan definitions for checkout modal
const CHECKOUT_PLANS = {
  professional: {
    id: 'professional',
    name: 'Professional',
    price_monthly: 29,
    price_yearly: 19,
  },
  team: {
    id: 'team',
    name: 'Team',
    price_monthly: 99,
    price_yearly: 69,
  },
};

export default function PricingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState('yearly'); // 'monthly' | 'yearly'
  const [sliderIndex, setSliderIndex] = useState(1); // 2K tasks default
  const [activeSubTab, setActiveSubTab] = useState('platform'); // 'platform' | 'agents' | 'chatbots'
  const [openFaq, setOpenFaq] = useState(null);
  const [exploreAppsOpen, setExploreAppsOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  // Check for Stripe Checkout return callback with session_id
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const isCancelled = searchParams.get('cancelled');

    if (sessionId) {
      const verifyCheckout = async () => {
        const loadingToast = toast.loading('Verifying your Stripe Test Payment...');
        try {
          const res = await billingAPI.verifySession(sessionId);
          toast.dismiss(loadingToast);
          toast.success(res.data.message || 'Payment confirmed! Welcome to your new plan.');
          if (res.data.plan && updateUser) {
            updateUser({ plan: res.data.plan });
          }
          navigate('/pricing', { replace: true });
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error(err.response?.data?.message || 'Could not verify payment session.');
          navigate('/pricing', { replace: true });
        }
      };
      verifyCheckout();
    } else if (isCancelled) {
      toast('Stripe Checkout was cancelled.', { icon: 'ℹ️' });
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate, updateUser]);

  const openCheckout = (planId) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!user && !token && !storedUser) {
      navigate('/login?redirect=/pricing');
      return;
    }
    setCheckoutPlan(CHECKOUT_PLANS[planId]);
    setCheckoutOpen(true);
  };

  const selectedTaskLevel = TASK_LEVELS[sliderIndex];
  const discountMultiplier = billingPeriod === 'yearly' ? 1 : 1.33;

  const proDisplayPrice = Math.round(selectedTaskLevel.proPrice * discountMultiplier);
  const teamDisplayPrice = Math.round(selectedTaskLevel.teamPrice * discountMultiplier);

  const faqs = [
    {
      q: 'What is a "task" in FlowAI?',
      a: 'A task is counted every time a single action step inside a workflow completes successfully. Triggers that listen for incoming webhooks or scheduled chronometers do not consume tasks; only completed actions (e.g. database inserts, Gemini AI inference calls, Slack alerts) count toward your quota.',
    },
    {
      q: 'Can I change my task volume tier at any time?',
      a: 'Yes. You can adjust your task slider anytime. If upgrading mid-billing cycle, you will only be charged a prorated difference. If downgrading, your balance is automatically credited towards subsequent renewals.',
    },
    {
      q: 'Does Google Gemini 2.0 AI usage cost extra?',
      a: 'No extra API keys required. Gemini 2.0 AI prompts and JSON extractions run directly through FlowAI backend infrastructure with zero client-side key exposure and are included within each plan’s task limits.',
    },
    {
      q: 'What payment methods do you support?',
      a: 'We process payments using Stripe. We accept all major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay in Test and Production environments.',
    },
    {
      q: 'Can I self-host the PostgreSQL execution database?',
      a: 'Yes! On the Enterprise plan, we support custom VPC peering and external PostgreSQL connection strings for full data sovereignty and on-premise governance.',
    },
  ];

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50 selection:bg-orange-500/20 selection:text-orange-600">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Left: Brand + Main Links */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link to="/" className="flex items-center">
              <BrandLogo size="md" showText={true} showSubtitle={false} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/#solutions" className="hover:text-orange-600 transition-colors">Solutions</Link>
              <Link to="/#modes" className="hover:text-orange-600 transition-colors">Fluid Determinism</Link>
              <Link to="/#architecture" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
                <span>Architecture</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200">Tech</span>
              </Link>
              <Link to="/pricing" className="text-orange-600 font-bold flex items-center gap-1.5">
                <span>Pricing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              </Link>
            </nav>
          </div>

          {/* Right: GitHub, Explore Apps, Contact Sales, Log in, CTA */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* GitHub Repo */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            {/* Explore Apps Modal Trigger */}
            <button
              onClick={() => setExploreAppsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-orange-500" />
              <span>Explore apps</span>
            </button>

            {/* Contact Sales Trigger */}
            <button
              onClick={() => setContactSalesOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>Contact sales</span>
            </button>

            {/* User Auth state / CTAs */}
            {user ? (
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-sm">
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <span>Get started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Pricing Hero Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative">
        {/* Section Title & Subheading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-slate-200 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-black uppercase tracking-widest">
              <span className="w-2 h-0.5 bg-orange-500 rounded-full inline-block" />
              PRICING &amp; PLANS
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              AI orchestration plans
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md font-normal lg:text-right">
            Unlock the power of AI orchestration across your organization. Multi-step workflows, structured databases, webhooks, custom conditions, and Gemini AI action layers in one platform.
          </p>
        </div>

        {/* AI Orchestration & Add-ons Tabs Bar */}
        <div className="pt-10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-slate-200">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              AI ORCHESTRATION
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('platform')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'platform'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                Platform
              </button>
            </div>
          </div>

          <div className="md:pl-6 md:border-l md:border-slate-200">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              ADD-ONS &amp; COPILOTS
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('agents')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'agents'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                Agents
              </button>
              <button
                onClick={() => setActiveSubTab('chatbots')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'chatbots'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                Chatbots
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Task Slider Box */}
        <div className="my-8 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>How many tasks do you need?</span>
              <span className="text-xs text-orange-600 font-mono font-bold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {selectedTaskLevel.label} tasks / month
              </span>
            </h3>
            <button
              onClick={() => setOpenFaq(0)}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>About task usage rates</span>
            </button>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max={TASK_LEVELS.length - 1}
              step="1"
              value={sliderIndex}
              onChange={e => setSliderIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ff4f00]"
            />
            {/* Tick labels */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
              {TASK_LEVELS.map((level, idx) => (
                <button
                  key={idx}
                  onClick={() => setSliderIndex(idx)}
                  className={`hover:text-orange-600 transition-colors ${
                    sliderIndex === idx ? 'text-orange-600 font-bold' : ''
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="radio"
                  name="billing"
                  checked={billingPeriod === 'monthly'}
                  onChange={() => setBillingPeriod('monthly')}
                  className="accent-[#ff4f00] w-4 h-4 cursor-pointer"
                />
                <span>Pay monthly</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-900 font-bold">
                <input
                  type="radio"
                  name="billing"
                  checked={billingPeriod === 'yearly'}
                  onChange={() => setBillingPeriod('yearly')}
                  className="accent-[#ff4f00] w-4 h-4 cursor-pointer"
                />
                <span>Pay yearly</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Save 33%
                </span>
              </label>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Currency: <span className="text-slate-800 font-bold">USD ($)</span>
            </div>
          </div>
        </div>

        {/* 4 Clean Developer Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          
          {/* 1. Free / Developer Plan */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-slate-900">Free</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Developer
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                For solo builders and testing webhooks with native Gemini AI.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Free forever</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>100 tasks</strong> / month</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>5 active</strong> automated workflows</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Google Gemini 2.0 AI Prompt Copilot</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Visual Trigger ➔ Action Builder</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Standard execution audit telemetry</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                to="/register"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <span>Get started free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. Professional Plan */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-orange-300 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-slate-900">Professional</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200">
                  Individual Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                For creators and fast-growing projects requiring custom branching logic.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">${proDisplayPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {billingPeriod === 'yearly' ? 'Billed annually ($228/yr)' : 'Billed monthly'}
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>{selectedTaskLevel.label} tasks</strong> / month included</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Unlimited</strong> active workflows</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Multi-step condition branching rules</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Webhook auto-retry on 5xx failures</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>7-day raw execution log retention</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => openCheckout('professional')}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Upgrade to Professional</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Team Plan (Most Popular) */}
          <div className="rounded-2xl bg-white border-2 border-orange-500 p-6 flex flex-col justify-between relative shadow-xl shadow-orange-500/10">
            {/* Top Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
              MOST POPULAR
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-slate-900">Team</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200">
                  Engineering
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Collaborate with shared folders, high execution concurrency, and live telemetry.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">${teamDisplayPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <span className="text-[11px] text-orange-600 font-semibold block mt-1">
                  {billingPeriod === 'yearly' ? 'Billed annually (Save 33%)' : 'Billed monthly'}
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>{selectedTaskLevel.label} tasks</strong> + high concurrency</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Unlimited team members</strong> &amp; roles</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Sub-second webhook trigger latency</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Custom Gemini prompt temperature &amp; tokens</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>30-day log retention &amp; CSV/JSON export</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => openCheckout('team')}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <span>Upgrade to Team Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4. Enterprise Plan */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-slate-900">Enterprise</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Custom
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Tailored VPC infrastructure, self-hosted PostgreSQL, and custom SLAs.
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">Custom</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">Contact sales for volume pricing</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Millions of tasks</strong> with custom rate limits</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Dedicated VPC &amp; self-hosted database options</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Custom LLM routing (Claude / Gemini / OpenAI)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>99.99% Uptime Service Level Agreement</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>24/7 dedicated solutions engineering team</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => setContactSalesOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Compare Platform Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              All plans run on our secure PostgreSQL architecture with stateless JWT security.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 sm:p-5 font-bold">Platform Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-center">Free</th>
                  <th className="p-4 sm:p-5 font-bold text-center">Professional</th>
                  <th className="p-4 sm:p-5 font-bold text-center text-orange-600">Team</th>
                  <th className="p-4 sm:p-5 font-bold text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">Monthly Tasks</td>
                  <td className="p-4 sm:p-5 text-center font-mono">100</td>
                  <td className="p-4 sm:p-5 text-center font-mono">2,000 – 2M</td>
                  <td className="p-4 sm:p-5 text-center font-mono text-orange-600 font-bold bg-orange-50/20">10,000 – 2M+</td>
                  <td className="p-4 sm:p-5 text-center font-mono">Custom Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">Google Gemini 2.0 AI Builder</td>
                  <td className="p-4 sm:p-5 text-center"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                  <td className="p-4 sm:p-5 text-center bg-orange-50/20"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">Webhook Auto-Retry Engine</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">—</td>
                  <td className="p-4 sm:p-5 text-center"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                  <td className="p-4 sm:p-5 text-center bg-orange-50/20"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">Execution Telemetry Retention</td>
                  <td className="p-4 sm:p-5 text-center font-mono">24 Hours</td>
                  <td className="p-4 sm:p-5 text-center font-mono">7 Days</td>
                  <td className="p-4 sm:p-5 text-center font-mono text-orange-600 font-bold bg-orange-50/20">30 Days</td>
                  <td className="p-4 sm:p-5 text-center font-mono">1 Year / Custom</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-slate-900">Dedicated VPC / Custom DB</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">—</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">—</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400 bg-orange-50/20">—</td>
                  <td className="p-4 sm:p-5 text-center"><Check className="w-4 h-4 text-orange-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs Accordion Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-orange-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-orange-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50/40 to-orange-50 border border-orange-200 text-center relative overflow-hidden shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            Build your first workflow in 60 seconds
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6">
            Join thousands of developers automating mission-critical workflows with zero server management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md w-full sm:w-auto justify-center">
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setContactSalesOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-colors shadow-xs w-full sm:w-auto justify-center"
            >
              <span>Contact Sales</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <BrandLogo size="sm" showText={true} showSubtitle={true} />
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link to="/#solutions" className="hover:text-orange-600 transition-colors">Solutions</Link>
              <Link to="/#modes" className="hover:text-orange-600 transition-colors">Fluid Determinism</Link>
              <Link to="/#architecture" className="hover:text-orange-600 transition-colors">Architecture</Link>
              <Link to="/pricing" className="text-orange-600 font-bold">Pricing</Link>
              <Link to="/login" className="hover:text-slate-900 transition-colors">Log in</Link>
              <Link to="/register" className="hover:text-slate-900 transition-colors">Sign up</Link>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© 2026 FlowAI Platform. Developer-first workflow automation.</p>
            <p className="font-mono text-[11px] text-slate-400">PostgreSQL • Express.js • React 19 • Google Gemini AI</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExploreAppsModal isOpen={exploreAppsOpen} onClose={() => setExploreAppsOpen(false)} />
      <ContactSalesModal isOpen={contactSalesOpen} onClose={() => setContactSalesOpen(false)} />
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          setCheckoutPlan(null);
        }}
        plan={checkoutPlan}
        billingPeriod={billingPeriod}
        onSuccess={(data) => {
          if (data?.plan && updateUser) {
            updateUser({ plan: data.plan });
          }
        }}
      />
    </div>
  );
}
