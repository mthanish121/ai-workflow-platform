import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import NodeBadge from '../components/NodeBadge';
import ExploreAppsModal from '../components/ExploreAppsModal';
import ContactSalesModal from '../components/ContactSalesModal';
import {
  Sparkles, ArrowRight, Check, Layers, Wrench,
  Database, ShieldCheck, Cpu, Code2, Server, Lock,
  Activity, CheckCircle2, Zap, Terminal, LayoutGrid
} from 'lucide-react';

const AUTOMATION_MODES = [
  {
    id: 'deterministic',
    title: 'Deterministic',
    badge: 'Fixed Rules',
    desc: 'You choose the triggers and steps. Every action follows deterministic rules with sub-millisecond execution.',
    diagram: [
      { step: '1. Webhook / Form Received', type: 'webhook' },
      { step: '2. Check if VIP customer', type: 'database_change' },
      { step: '3. Create CRM record', type: 'create_crm_record' },
    ],
  },
  {
    id: 'deterministic_ai',
    title: 'Deterministic + AI',
    badge: 'Smart Reasoning',
    desc: 'AI handles intelligence tasks (summarizing, drafting, categorizing) while deterministic pipelines deliver the payload.',
    diagram: [
      { step: '1. Email Received', type: 'email_received' },
      { step: '2. Gemini AI: Classify intent & summarize', type: 'api_call' },
      { step: '3. Route Slack alert with summary', type: 'send_slack_message' },
    ],
  },
  {
    id: 'agentic',
    title: 'Autonomous Flow',
    badge: 'Self-Healing',
    desc: 'FlowAI inspects errors, auto-retries failed API endpoints, and adapts parameters before workflows break.',
    diagram: [
      { step: '1. Payment Webhook received', type: 'payment_received' },
      { step: '2. AI validates currency & customer tax ID', type: 'api_call' },
      { step: '3. Generate PDF receipt & email client', type: 'generate_pdf' },
    ],
  },
];

const ARCHITECTURE_PILLARS = [
  {
    icon: Database,
    title: 'PostgreSQL Relational Storage',
    subtitle: 'ACID Relational Core',
    desc: 'Workflows, triggers, actions, and execution logs are stored with strict referential integrity and optimized indexing.',
    tags: ['PostgreSQL', 'Connection Pooling', 'JSONB Storage'],
    badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: Cpu,
    title: 'Server-Side Gemini AI Engine',
    subtitle: 'Zero Client Key Exposure',
    desc: 'Natural language prompts are translated into validated JSON schemas on the server using Google Gemini, keeping API keys 100% private.',
    tags: ['Gemini 2.0 / 3.8', 'Structured JSON', 'Server Isolation'],
    badgeColor: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    icon: Lock,
    title: 'Stateless JWT & Bcrypt Auth',
    subtitle: 'Row-Level User Isolation',
    desc: 'Stateless JWT tokens with expiration paired with 12-round bcrypt password hashing. All database queries enforce strict user ownership.',
    tags: ['JWT Bearer', 'Bcrypt (12 Rounds)', 'User Isolation'],
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    icon: Code2,
    title: 'Strict Zod Runtime Validation',
    subtitle: 'Fail-Safe Schema Safety',
    desc: 'Every incoming trigger, condition operator, and action configuration is parsed through Zod schemas before database persistence or execution.',
    tags: ['Zod Validation', 'Type Safety', 'Input Sanitization'],
    badgeColor: 'text-sky-600 bg-sky-50 border-sky-200',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deterministic_ai');
  const [emailInput, setEmailInput] = useState('');
  const [exploreAppsOpen, setExploreAppsOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);

  const handleStartWithEmail = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      navigate(`/register?email=${encodeURIComponent(emailInput.trim())}`);
    } else {
      navigate('/register');
    }
  };

  const currentMode = AUTOMATION_MODES.find(m => m.id === activeTab) || AUTOMATION_MODES[1];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 selection:text-orange-600">
      {/* Zapier-Style Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Left: Logo & Links */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link to="/" className="flex items-center">
              <BrandLogo size="md" showText={true} showSubtitle={false} />
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#solutions" className="hover:text-orange-600 transition-colors">Solutions</a>
              <a href="#modes" className="hover:text-orange-600 transition-colors">Fluid Determinism</a>
              <a href="#architecture" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
                <span>Architecture</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200">Tech Stack</span>
              </a>
              <Link to="/pricing" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
                <span>Pricing</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">Plans</span>
              </Link>
            </nav>
          </div>

          {/* Right Header CTAs */}
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

            {/* Auth Buttons */}
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

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-white" id="solutions">
        {/* Subtle warm top gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-orange-50/80 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            The Next Generation of Automation
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Welcome to automation <br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              in the agentic era
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Start building in natural language with Google Gemini AI, then run, monitor, and govern trusted multi-step workflows on FlowAI.
          </p>

          {/* Email Signup Form */}
          <form onSubmit={handleStartWithEmail} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-10">
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Enter your work email..."
              className="flex-1 w-full py-3 px-4 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 shadow-sm transition-all"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold w-full sm:w-auto flex-shrink-0 transition-colors shadow-sm"
            >
              <span>Start free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Free developer tier</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> PostgreSQL ACID storage</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Server-side Gemini integration</span>
          </div>
        </div>

        {/* Zapier-Style Interactive Self-Healing Hero Showcase Card */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-14">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Self-Healing Diagnostic Architecture
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    FlowAI detects payload anomalies and formats fallback filter rules dynamically.
                  </p>
                </div>
              </div>
              <span className="badge badge-success self-start sm:self-auto">Zero Data Loss ⚡</span>
            </div>

            {/* Code / Flow Trace Preview */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-amber-400">
                ⚠️ <span className="text-slate-400">trigger.payload:</span> Missing optional field `assignee_email` from incoming webhook
              </p>
              <p className="text-cyan-400">
                ✓ <span className="text-slate-400">validation:</span> Zod schema routed execution through fallback channel `#triage`
              </p>
              <p className="text-emerald-400">
                ✓ <span className="text-slate-400">telemetry:</span> Execution completed in 68ms with step audit log persisted
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <NodeBadge type="webhook" size="xs" />
                <span className="text-slate-400 text-xs">➔</span>
                <NodeBadge type="api_call" size="xs" />
                <span className="text-slate-400 text-xs">➔</span>
                <NodeBadge type="send_slack_message" size="xs" />
              </div>
              <Link to="/register" className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 transition-colors">
                <span>Try FlowAI Engine</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modes of Automation */}
      <section id="modes" className="py-20 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
              Fluid Determinism
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Build anywhere. Run on FlowAI. Govern in one place.
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Fluid Determinism combines natural language prompt flexibility with deterministic execution pipelines that never hallucinate payloads.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {AUTOMATION_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id)}
                className={`p-5 rounded-2xl text-left border transition-all ${
                  activeTab === mode.id
                    ? 'bg-white border-orange-400 shadow-md shadow-orange-100'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-slate-900">{mode.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === mode.id ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {mode.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {mode.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Active Mode Architecture Showcase */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Step Architecture: {currentMode.title}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentMode.diagram.map((d, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-orange-500 mb-1.5 block">Step {i + 1}</span>
                    <p className="text-xs font-bold text-slate-900 mb-3">{d.step}</p>
                  </div>
                  <NodeBadge type={d.type} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real Developer-First Platform Architecture & Scale Section */}
      <section id="architecture" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-widest mb-3">
              <Server className="w-3.5 h-3.5" />
              Engineering & Infrastructure
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Platform Architecture & Scale
            </h2>
            <p className="text-sm text-slate-500 mt-2.5 max-w-2xl mx-auto">
              Engineered with a relational database backbone, isolated server-side AI execution, and strict type safety at every layer.
            </p>
          </div>

          {/* 4 Technical Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {ARCHITECTURE_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                      <pillar.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${pillar.badgeColor}`}>
                      {pillar.subtitle}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                    {pillar.desc}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                  {pillar.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-slate-900">Row-Level User Isolation</p>
              <p className="text-xs text-slate-500 mt-1">Enforced at SQL query level</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 border border-orange-200 flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-slate-900">Sub-Millisecond Engine</p>
              <p className="text-xs text-slate-500 mt-1">Fast asynchronous execution</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-slate-900">Zero Client-Side Key Leaks</p>
              <p className="text-xs text-slate-500 mt-1">Strict server environment isolation</p>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Ready to automate in the agentic era?
          </h2>
          <p className="text-sm text-orange-100 max-w-xl mx-auto mb-8">
            Experience intelligent, reliable workflow automation built with full transparency and developer-first design.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-white hover:bg-orange-50 text-orange-600 text-sm font-bold w-full sm:w-auto transition-colors shadow-sm">
              <span>Start free with email</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold w-full sm:w-auto border border-orange-400/30 transition-colors">
              <span>Sign in to Workspace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <BrandLogo size="sm" showText={true} showSubtitle={true} />
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link to="/#solutions" className="hover:text-slate-900 transition-colors">Solutions</Link>
              <Link to="/#modes" className="hover:text-slate-900 transition-colors">Fluid Determinism</Link>
              <Link to="/#architecture" className="hover:text-slate-900 transition-colors">Architecture</Link>
              <Link to="/pricing" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Pricing</Link>
              <Link to="/login" className="hover:text-slate-900 transition-colors">Log in</Link>
              <Link to="/register" className="hover:text-slate-900 transition-colors">Sign up</Link>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© 2026 FlowAI Platform. Developer-first workflow automation.</p>
            <p className="font-mono text-[11px] text-slate-500">PostgreSQL • Express.js • React 19 • Google Gemini AI</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExploreAppsModal isOpen={exploreAppsOpen} onClose={() => setExploreAppsOpen(false)} />
      <ContactSalesModal isOpen={contactSalesOpen} onClose={() => setContactSalesOpen(false)} />
    </div>
  );
}
