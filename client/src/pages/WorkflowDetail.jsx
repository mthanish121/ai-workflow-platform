import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workflowsAPI, logsAPI } from '../lib/api';
import NodeBadge from '../components/NodeBadge';
import {
  ArrowLeft, Play, Pencil, Trash2, CheckCircle2,
  XCircle, Clock, Zap, GitBranch, ChevronDown, ChevronUp,
  Calendar, BarChart3, RefreshCw, Layers, Copy, Check,
  Activity, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const steps = Array.isArray(log.steps_executed) ? log.steps_executed : [];

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    toast.success('Log payload copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-orange-300 transition-all shadow-2xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {log.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                {log.status}
              </span>
              {log.duration_ms && (
                <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {log.duration_ms}ms
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(log.started_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {steps.length} steps
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Copy log JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-200 space-y-4 bg-slate-50">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Executed Steps
            </h4>
            {steps.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No step records</p>
            ) : (
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="w-6 h-6 rounded bg-orange-50 border border-orange-100 flex items-center justify-center text-xs font-bold text-[#ff4f00] flex-shrink-0">
                      {step.step || i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 font-mono">{step.action}</p>
                        <span className={`badge !text-[10px] ${step.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{step.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {log.trigger_data && Object.keys(log.trigger_data).length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Input Payload
              </h4>
              <pre className="text-xs text-slate-700 bg-white rounded-lg p-3 overflow-x-auto font-mono border border-slate-200 shadow-2xs">
                {JSON.stringify(log.trigger_data, null, 2)}
              </pre>
            </div>
          )}

          {log.error_message && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-xs font-bold text-rose-700 mb-0.5">Execution Error</p>
              <p className="text-xs text-rose-800 font-mono break-all">{log.error_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      workflowsAPI.get(id),
      logsAPI.list({ workflow_id: id, limit: 20 }),
    ]).then(([wfRes, logRes]) => {
      setWorkflow(wfRes.data.workflow);
      setLogs(logRes.data.logs || []);
    }).catch(() => {
      toast.error('Workflow not found');
      navigate('/workflows');
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await workflowsAPI.execute(id);
      toast.success(`⚡ Pipeline executed successfully in ${res.data.log.duration_ms}ms!`);
      setWorkflow(w => ({ ...w, run_count: (w.run_count || 0) + 1, last_run_at: new Date().toISOString() }));
      setLogs(prev => [res.data.log, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete workflow "${workflow?.name}"?`)) return;
    setDeleting(true);
    try {
      await workflowsAPI.delete(id);
      toast.success('Workflow deleted');
      navigate('/workflows');
    } catch {
      toast.error('Failed to delete workflow');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading details...</p>
      </div>
    );
  }

  if (!workflow) return null;

  const actions = Array.isArray(workflow.actions) ? workflow.actions : [];
  const conditions = Array.isArray(workflow.conditions) ? workflow.conditions : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{workflow.name}</h1>
              <span className={`badge ${workflow.is_active ? 'badge-success' : 'badge-info'}`}>
                {workflow.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{workflow.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExecute}
            disabled={executing}
            className="btn-primary !py-2 !px-4 !text-xs"
          >
            {executing ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running...</>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" /> Execute Flow</>
            )}
          </button>

          <Link to={`/editor/${id}`} className="btn-secondary !py-2 !px-3.5 !text-xs">
            <Pencil className="w-3.5 h-3.5" />
            <span>Visual Editor</span>
          </Link>

          <button onClick={handleDelete} disabled={deleting} className="btn-danger !py-2 !px-3.5 !text-xs">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Runs', value: workflow.run_count || 0, icon: BarChart3, color: 'text-[#ff4f00]' },
          { label: 'Action Steps', value: actions.length, icon: Zap, color: 'text-amber-500' },
          { label: 'Filter Rules', value: conditions.length, icon: GitBranch, color: 'text-indigo-500' },
          { label: 'Created On', value: new Date(workflow.created_at).toLocaleDateString(), icon: Calendar, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="p-4 text-center rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Step Sequence Overview */}
      <div className="p-6 space-y-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <h2 className="section-header flex items-center gap-2 text-slate-900">
          <Layers className="w-4 h-4 text-[#ff4f00]" />
          Workflow Architecture
        </h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto py-1">
          <div className="flex-1 p-4 rounded-xl bg-orange-50/60 border border-orange-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#ff4f00] mb-2">Step 1: Trigger</p>
            <NodeBadge type={workflow.trigger?.type} size="sm" />
          </div>

          <div className="hidden md:flex items-center justify-center text-slate-300">
            <ArrowRight className="w-5 h-5" />
          </div>

          {conditions.length > 0 && (
            <>
              <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Step 2: Filter ({conditions.length})</p>
                <div className="space-y-1">
                  {conditions.map((c, idx) => (
                    <p key={idx} className="text-xs font-mono text-slate-700 truncate">
                      {c.field} {c.operator} {c.value}
                    </p>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </>
          )}

          {actions.map((act, i) => (
            <div key={i} className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Action Step {i + 1}
              </p>
              <NodeBadge type={act.type} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Execution Logs Card */}
      <div className="p-6 space-y-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="section-header flex items-center gap-2 text-slate-900">
              <Activity className="w-4 h-4 text-emerald-600" />
              Execution History
            </h2>
            <p className="section-sub text-slate-500">{logs.length} runs recorded</p>
          </div>
          <button
            onClick={handleExecute}
            disabled={executing}
            className="btn-secondary !py-1.5 !px-3 !text-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Run</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No executions recorded</p>
            <p className="text-xs text-slate-500">Click "Execute Flow" to trigger a run.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map(log => <LogRow key={log.id} log={log} />)}
          </div>
        )}
      </div>
    </div>
  );
}
