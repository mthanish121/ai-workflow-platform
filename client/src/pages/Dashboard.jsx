import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workflowsAPI, logsAPI, aiAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';
import { WORKFLOW_TEMPLATES, ZapierTemplateCard } from './TemplatesPage';
import {
  Sparkles, ArrowRight, Zap, Bot, Database,
  Cpu, FileText, CheckCircle2, RefreshCw, Play,
  Plus, ChevronRight, Mic, Send, Star, ExternalLink,
  Layers, Clock, ShieldCheck, HelpCircle, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Fetch live workflows and execution telemetry
  const fetchData = async () => {
    try {
      const [wfRes, logRes] = await Promise.all([
        workflowsAPI.list(),
        logsAPI.list({ limit: 5 }),
      ]);
      setWorkflows(wfRes.data.workflows || []);
      setLogs(logRes.data.logs || []);
    } catch {
      // Graceful load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopilotSubmit = async (e) => {
    e?.preventDefault();
    const prompt = copilotInput.trim();
    if (!prompt || prompt.length < 3) {
      toast.error('Please enter an automation idea or app names');
      return;
    }

    setCopilotLoading(true);
    const toastId = toast.loading('Copilot is parsing your intent & seeding your custom workflow...', { id: 'copilot-gen' });

    try {
      const res = await aiAPI.generateWorkflow({ prompt });
      const newWorkflow = res.data.workflow;
      const workflowId = newWorkflow?.id || res.data.workflowId;

      toast.dismiss(toastId);
      toast.success(`Workflow created with ${newWorkflow?.steps?.length || 3} tailored steps! Opening canvas...`);

      if (workflowId) {
        navigate(`/editor/${workflowId}`, {
          state: {
            workflow: newWorkflow,
            missingConnections: res.data.missingConnections,
            connectedApps: res.data.connectedApps,
          }
        });
      } else {
        navigate('/workflows/new', {
          state: {
            prompt,
            workflow: newWorkflow,
            template: {
              title: newWorkflow?.name || prompt,
              desc: newWorkflow?.description,
              steps: newWorkflow?.steps,
            }
          }
        });
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Could not generate workflow. Please try again.');
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleUseTemplate = async (tpl) => {
    const toastId = toast.loading(`Activating "${tpl.title}" template...`);
    try {
      const res = await workflowsAPI.fromTemplate({
        templateId: tpl.id,
        template: tpl,
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
      navigate('/workflows/new', {
        state: {
          template: {
            title: tpl.title,
            desc: tpl.desc,
            trigger: tpl.trigger,
            conditions: tpl.conditions,
            actions: tpl.actions,
            apps: tpl.apps,
          }
        }
      });
    }
  };

  const handleQuickExecute = async (e, wf) => {
    e.preventDefault();
    e.stopPropagation();
    setRunningId(wf.id);
    try {
      const res = await workflowsAPI.execute(wf.id);
      toast.success(`⚡ "${wf.name}" executed in ${res.data.log.duration_ms}ms!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally {
      setRunningId(null);
    }
  };

  const safeWorkflows = Array.isArray(workflows) ? workflows.filter(Boolean) : [];
  const safeLogs = Array.isArray(logs) ? logs.filter(Boolean) : [];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* ─── 1. TOP ZAPIER TRIAL / PRO UPGRADE BANNER (Purple style as Image 1) ────────── */}
      <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-purple-200/90 shadow-2xs">
        <div className="flex items-center gap-4 text-left w-full sm:w-auto">
          {/* Days Left Badge */}
          <div className="px-3.5 py-1.5 rounded-xl text-center border border-purple-200 bg-purple-50/70 flex-shrink-0">
            <span className="block text-xl font-black text-purple-700 leading-none">13</span>
            <span className="block text-[9px] font-bold text-purple-600 uppercase tracking-wider mt-0.5">TRIAL DAYS LEFT</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Your workflow is ready to turn on</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch it on and it starts working for you. Upgrade to keep it running after your trial.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCheckoutOpen(true)}
          className="w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-xs tracking-wide bg-[#6558f5] hover:bg-[#5245e3] text-white shadow-xs transition-colors whitespace-nowrap active:scale-98"
        >
          Upgrade now
        </button>
      </div>

      {/* ─── 2. HERO COPILOT PROMPT BOX ───────────────── */}
      <div className="max-w-3xl mx-auto text-center space-y-4 pt-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          What would you like to automate?
        </h1>

        {/* Interactive Copilot Input Container (Crisp White Card with Orange Accent) */}
        <div className="relative rounded-2xl p-4 sm:p-5 text-left bg-white border border-slate-200 hover:border-orange-300 focus-within:border-[#ff4f00] shadow-2xs transition-all group">
          {/* Header Tag */}
          <div className="flex items-center gap-1.5 font-bold text-xs mb-2 text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
            <span>Copilot</span>
          </div>

          <form onSubmit={handleCopilotSubmit} className="space-y-3">
            <textarea
              rows={2}
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCopilotSubmit();
                }
              }}
              placeholder="Enter an idea or app name to get started"
              className="w-full bg-transparent border-none text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none resize-none font-medium"
            />

            <div className="flex items-center justify-end pt-1 gap-2">
              <button
                type="button"
                onClick={() => toast('Voice prompt active — speaking allowed')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={copilotLoading}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#ff4f00] text-slate-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
              >
                {copilotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        </div>

        <p className="text-[11px] text-slate-500">
          Copilot is AI and can make mistakes. Please double-check responses.
        </p>
      </div>

      {/* ─── 3. START FROM SCRATCH SECTION (Zapier 5 Blocks) ─────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Start from scratch</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* 1. Zap / Workflow */}
          <Link
            to="/workflows/new"
            className="p-3.5 rounded-xl bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-300 transition-all flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] group-hover:scale-105 transition-transform flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">Zap</h3>
              <p className="text-[11px] text-slate-500">Automated workflows</p>
            </div>
          </Link>

          {/* 2. Agent */}
          <Link
            to="/workflows/new"
            state={{ prompt: "Create an autonomous AI Agent that classifies inbound leads and drafts responses" }}
            className="p-3.5 rounded-xl bg-white hover:bg-rose-50/20 border border-slate-200 hover:border-rose-300 transition-all flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Agent</h3>
              <p className="text-[11px] text-slate-500">AI teammates</p>
            </div>
          </Link>

          {/* 3. Table */}
          <Link
            to="/templates"
            className="p-3.5 rounded-xl bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-300 transition-all flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Table</h3>
              <p className="text-[11px] text-slate-500">Automated data</p>
            </div>
          </Link>

          {/* 4. MCP */}
          <Link
            to="/mcp"
            className="p-3.5 rounded-xl bg-white hover:bg-amber-50/20 border border-slate-200 hover:border-amber-300 transition-all flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">MCP</h3>
              <p className="text-[11px] text-slate-500">AI tool integrations</p>
            </div>
          </Link>

          {/* 5. Form */}
          <Link
            to="/workflows/new"
            state={{ prompt: "When a new lead form is submitted, validate fields and alert team" }}
            className="p-3.5 rounded-xl bg-white hover:bg-red-50/20 border border-slate-200 hover:border-red-300 transition-all flex items-center gap-3 group col-span-2 sm:col-span-1 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">Form</h3>
              <p className="text-[11px] text-slate-500">Automation-ready forms</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── 4. RECOMMENDED FOR YOU (Carousel Cards) ──────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recommended for you</h2>
          <Link
            to="/templates"
            className="text-xs font-bold text-[#ff4f00] hover:text-[#e04500] flex items-center gap-1 transition-colors"
          >
            <span>See all templates</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Cards Row matching Image 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {WORKFLOW_TEMPLATES.slice(0, 4).map((tpl) => (
            <ZapierTemplateCard
              key={tpl.id}
              template={tpl}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      </div>

      {/* ─── 5. ACTIVE WORKFLOWS TELEMETRY SECTION ───────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff4f00]" />
            <h2 className="text-sm font-bold text-slate-900">Your Active Automations</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {safeWorkflows.length}
            </span>
          </div>
          <Link
            to="/workflows"
            className="text-xs font-bold text-[#ff4f00] hover:text-[#e04500] flex items-center gap-1 transition-colors"
          >
            <span>Manage all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {safeWorkflows.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <Zap className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No workflows created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the Copilot bar above or pick a template to launch your first automation.
            </p>
            <Link to="/workflows/new" className="btn-primary !py-2 !px-4 !text-xs inline-flex items-center gap-2 mt-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Workflow</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeWorkflows.slice(0, 6).map((wf) => (
              <div
                key={wf.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {wf.trigger?.type || 'webhook'}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      wf.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${wf.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {wf.is_active ? 'Active' : 'Off'}
                    </span>
                  </div>

                  <Link to={`/workflows/${wf.id}`} className="text-sm font-bold text-slate-900 hover:text-[#ff4f00] transition-colors line-clamp-1">
                    {wf.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {wf.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {wf.run_count || 0} runs
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleQuickExecute(e, wf)}
                      disabled={runningId === wf.id}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ff4f00] border border-orange-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {runningId === wf.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      <span>Run</span>
                    </button>
                    <Link
                      to={`/workflows/${wf.id}`}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        plan={{ id: 'professional', name: 'Professional', price_monthly: 29, price_yearly: 19 }}
        billingPeriod="yearly"
        onSuccess={(data) => {
          if (data?.plan && updateUser) updateUser({ plan: data.plan });
        }}
      />
    </div>
  );
}
