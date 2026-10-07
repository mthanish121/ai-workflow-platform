import React, { useState } from 'react';
import { X, Search, Zap, Webhook, Database, Mail, MessageSquare, Bot, CreditCard, GitBranch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const APPS_CATALOG = [
  {
    name: 'Webhooks by FlowAI',
    category: 'Triggers',
    desc: 'Receive instant HTTP POST/GET payloads with custom secret verification.',
    icon: Webhook,
    badge: 'Core Trigger',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    name: 'Google Gemini 2.0 AI',
    category: 'AI Engine',
    desc: 'Extract structured data, classify intent, summarize, or generate dynamic JSON.',
    icon: Bot,
    badge: 'AI Powered',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  {
    name: 'PostgreSQL Database',
    category: 'Database',
    desc: 'Run ACID-compliant SELECT, INSERT, or UPDATE queries with parameterized safety.',
    icon: Database,
    badge: 'Storage',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
  },
  {
    name: 'Slack Notifications',
    category: 'Messaging',
    desc: 'Send rich markdown cards, error alerts, and triage messages to team channels.',
    icon: MessageSquare,
    badge: 'Action',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    name: 'Stripe Events',
    category: 'Payments',
    desc: 'Trigger workflows on successful charges, invoice failures, or subscription renewals.',
    icon: CreditCard,
    badge: 'Trigger',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
  },
  {
    name: 'Resend / SMTP Email',
    category: 'Email',
    desc: 'Dispatch transactional emails, receipts, and alert reports with dynamic templates.',
    icon: Mail,
    badge: 'Action',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  },
  {
    name: 'GitHub Webhooks & Actions',
    category: 'Developer Tools',
    desc: 'Automate pull request summaries, commit checks, and release notifications.',
    icon: GitBranch,
    badge: 'Integration',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
  {
    name: 'Custom REST API Dispatcher',
    category: 'Connectivity',
    desc: 'Send authenticated HTTP requests (Bearer, API Key, Basic) to any modern API.',
    icon: Zap,
    badge: 'Universal',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  }
];

export default function ExploreAppsModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Triggers', 'AI Engine', 'Database', 'Messaging', 'Payments', 'Email', 'Connectivity'];

  const filteredApps = APPS_CATALOG.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff4f00] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                Integration Catalog
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">Explore FlowAI Apps & Triggers</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect webhooks, databases, AI models, and APIs into automated pipelines.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search triggers, AI models, and action apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-[#ff4f00] outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-400/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-orange-50 text-[#ff4f00] border border-orange-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white">
          {filteredApps.map((app, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] group-hover:scale-105 transition-transform">
                    <app.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                    {app.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">
                  {app.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {app.desc}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Category: {app.category}</span>
                <span className="text-[#ff4f00] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Ready <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            Need a custom integration? You can use our universal REST API step or Gemini AI copilot.
          </p>
          <Link
            to="/register"
            onClick={onClose}
            className="btn-primary !py-2 !px-4 !text-xs whitespace-nowrap"
          >
            <span>Start Building Workflows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
