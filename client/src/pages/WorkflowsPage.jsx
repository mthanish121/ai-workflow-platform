import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workflowsAPI } from '../lib/api';
import NodeBadge from '../components/NodeBadge';
import {
  Plus, Search, GitBranch, Play, Pencil, Trash2,
  Zap, BarChart3, Clock, RefreshCw, Sparkles, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

function parseJsonSafe(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function WorkflowCard({ workflow, onDelete, onExecute, onToggle }) {
  const [executing, setExecuting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [localActive, setLocalActive] = useState(Boolean(workflow?.is_active));
  const navigate = useNavigate();

  // Keep local state in sync if parent refreshes the list
  useEffect(() => {
    setLocalActive(Boolean(workflow?.is_active));
  }, [workflow?.is_active]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    const next = !localActive;
    setLocalActive(next);   // optimistic
    setToggling(true);
    try {
      const res = await workflowsAPI.toggleStatus(workflow.id, next);
      toast.success(next ? '✅ Workflow activated' : '⏸️ Workflow deactivated');
      if (onToggle) onToggle(workflow.id, res?.data?.workflow?.is_active ?? next);
    } catch {
      setLocalActive(!next);  // revert on failure
      toast.error('Failed to update workflow status');
    } finally {
      setToggling(false);
    }
  };

  if (!workflow) return null;

  const handleExecute = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExecuting(true);
    try {
      const res = await workflowsAPI.execute(workflow.id);
      const dur = res?.data?.log?.duration_ms || 120;
      toast.success(`⚡ "${workflow.name}" completed in ${dur}ms!`);
      if (onExecute) onExecute(workflow.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete workflow "${workflow.name || 'Untitled'}"?`)) return;
    setDeleting(true);
    try {
      await workflowsAPI.delete(workflow.id);
      toast.success('Workflow deleted');
      if (onDelete) onDelete(workflow.id);
    } catch {
      toast.error('Failed to delete workflow');
    } finally {
      setDeleting(false);
    }
  };

  const rawActions = workflow.actions;
  const actions = Array.isArray(rawActions)
    ? rawActions
    : parseJsonSafe(rawActions, []);

  const rawTrigger = workflow.trigger;
  const trigger = (typeof rawTrigger === 'object' && rawTrigger !== null)
    ? rawTrigger
    : parseJsonSafe(rawTrigger, {});

  const formattedDate = workflow.created_at
    ? new Date(workflow.created_at).toLocaleDateString()
    : 'Recently';

  return (
    <div
      onClick={() => navigate(`/workflows/${workflow.id}`)}
      className="zapier-card-interactive p-6 flex flex-col justify-between group relative overflow-hidden transition-all bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md shadow-2xs rounded-2xl cursor-pointer"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all group-hover:scale-105"
              style={localActive ? { background: '#fff5f0', borderColor: '#ffd0bd', color: '#ff4f00' } : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }}
            >
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-[#ff4f00] transition-colors">
                {workflow.name || 'Untitled Flow'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {workflow.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Zapier-style toggle switch */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={localActive ? 'Deactivate workflow' : 'Activate workflow'}
            className="flex-shrink-0 flex items-center gap-1.5 group/toggle focus:outline-none"
            aria-label={localActive ? 'Turn off' : 'Turn on'}
          >
            {/* Track */}
            <span
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out"
              style={{
                background: toggling
                  ? '#d1d5db'
                  : localActive
                  ? '#22c55e'
                  : '#e2e8f0',
                boxShadow: localActive && !toggling ? '0 0 0 2px #bbf7d0' : 'none',
              }}
            >
              {/* Thumb */}
              <span
                className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out"
                style={{ transform: localActive ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </span>
            <span
              className="text-[10px] font-bold tracking-wide"
              style={{ color: localActive ? '#16a34a' : '#94a3b8' }}
            >
              {toggling ? '...' : localActive ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Zapier Step Sequence */}
        <div className="p-3 rounded-xl space-y-2 mb-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 flex-shrink-0">
              Trigger
            </span>
            <NodeBadge type={trigger?.type} size="xs" />
          </div>

          <div className="flex items-start gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 flex-shrink-0 mt-0.5">
              Actions
            </span>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {actions.slice(0, 3).map((a, i) => (
                <NodeBadge key={i} type={a?.type} size="xs" />
              ))}
              {actions.length > 3 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  +{actions.length - 3} more
                </span>
              )}
              {actions.length === 0 && (
                <span className="text-xs text-slate-400 italic">No actions added</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 pb-3 mb-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            <span>{workflow.run_count || 0} runs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleExecute}
            disabled={executing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs transition-all disabled:opacity-50 bg-orange-50 border border-orange-200 text-[#ff4f00] hover:bg-orange-100"
          >
            {executing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{executing ? 'Running...' : 'Run Flow'}</span>
          </button>

          <Link
            to={`/editor/${workflow.id}`}
            className="p-2 rounded-lg transition-colors bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            title="Open visual editor"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
            title="Delete workflow"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchWorkflows = () => {
    workflowsAPI.list()
      .then(res => {
        const list = res?.data?.workflows || [];
        setWorkflows(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        toast.error('Failed to load workflows');
        setWorkflows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const safeWorkflows = Array.isArray(workflows) ? workflows.filter(Boolean) : [];

  const filtered = safeWorkflows.filter(w => {
    if (!w) return false;
    const name = String(w.name || '');
    const desc = String(w.description || '');
    const trig = typeof w.trigger === 'object' && w.trigger !== null
      ? w.trigger
      : parseJsonSafe(w.trigger, {});
    const trigType = String(trig?.type || '');

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      trigType.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'active') return Boolean(w.is_active);
    if (filter === 'inactive') return !w.is_active;
    return true;
  });

  const handleDelete = (id) => setWorkflows(ws => ws.filter(w => w?.id !== id));
  const handleExecute = (id) => {
    setWorkflows(ws => ws.map(w => w?.id === id
      ? { ...w, run_count: (w.run_count || 0) + 1, last_run_at: new Date().toISOString() }
      : w
    ));
  };
  const handleToggle = (id, newActive) => {
    setWorkflows(ws => ws.map(w => w?.id === id ? { ...w, is_active: newActive } : w));
  };

  const activeCount = safeWorkflows.filter(w => Boolean(w?.is_active)).length;
  const inactiveCount = safeWorkflows.filter(w => !w?.is_active).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5 text-slate-900">
            <GitBranch className="w-6 h-6 text-[#ff4f00]" />
            Workflows & Integrations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your multi-step automated pipelines
          </p>
        </div>

        <Link to="/workflows/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Create Workflow</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by flow name, trigger, or action..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !py-2 !pl-10 !text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({safeWorkflows.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === 'active'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === 'inactive'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 skeleton rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="zapier-card p-12 text-center max-w-lg mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-orange-50 border border-orange-100 text-[#ff4f00]">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {search ? 'No workflows match your search' : 'No workflows configured yet'}
          </h3>
          <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
            {search ? 'Try adjusting your search criteria.' : 'Create your first automated flow in seconds.'}
          </p>
          <Link to="/workflows/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" />
            Build Flow
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(wf => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onDelete={handleDelete}
              onExecute={handleExecute}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
