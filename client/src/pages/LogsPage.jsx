import { useEffect, useState } from 'react';
import { logsAPI } from '../lib/api';
import {
  CheckCircle2, Clock, ChevronDown, ChevronUp,
  Search, Activity, Copy, Check, RefreshCw,
  ShieldAlert, FileText, ChevronLeft, ChevronRight,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function LogDetail({ log }) {
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
    <div className="zapier-card-interactive overflow-hidden transition-all bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md rounded-2xl shadow-2xs mb-3">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between gap-4 p-4.5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            log.status === 'success'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {log.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm truncate">{log.workflow_name || 'Workflow Run'}</span>
              <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                {log.status}
              </span>
              {log.duration_ms && (
                <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {log.duration_ms}ms
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(log.started_at).toLocaleString()}</span>
              <span>•</span>
              <span>{steps.length} steps executed</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Copy log JSON"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-200 space-y-4 bg-slate-50">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Execution Trace
            </h4>
            {steps.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No individual step records</p>
            ) : (
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-[#ff4f00] bg-orange-50 border border-orange-100 flex-shrink-0">
                      {step.step || i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 font-mono">{step.action}</p>
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
                Trigger Payload
              </h4>
              <pre className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3.5 overflow-x-auto font-mono shadow-2xs">
                {JSON.stringify(log.trigger_data, null, 2)}
              </pre>
            </div>
          )}

          {log.error_message && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200">
              <p className="text-xs font-bold text-rose-700 mb-0.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Error Message
              </p>
              <p className="text-xs text-rose-800 font-mono break-all">{log.error_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchLogs = async (newOffset = 0) => {
    setLoading(true);
    try {
      const res = await logsAPI.list({ limit: LIMIT, offset: newOffset });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setOffset(newOffset);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  const filtered = logs.filter(l => {
    const matchesSearch = (l.workflow_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const successCount = logs.filter(l => l.status === 'success').length;
  const failCount = logs.filter(l => l.status === 'failed' || l.status === 'error').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5 text-slate-900">
            <Activity className="w-6 h-6 text-[#ff4f00]" />
            Execution Telemetry & Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time execution telemetry and payloads for all workflows
          </p>
        </div>

        <button
          onClick={() => fetchLogs(offset)}
          disabled={loading}
          className="btn-secondary !py-2 !px-3.5 !text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="zapier-card p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-2xl font-black text-slate-900">{total}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Executions</p>
        </div>
        <div className="zapier-card p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-2xl font-black text-emerald-600">{successCount}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Successful Runs</p>
        </div>
        <div className="zapier-card p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-2xl font-black text-rose-600">{failCount}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Failed Runs</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by flow name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !py-2 !pl-10 !text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {['all', 'success', 'failed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                statusFilter === s
                  ? s === 'success'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : s === 'failed'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="zapier-card p-12 text-center max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">No logs found</h3>
          <p className="text-xs text-slate-500">
            {search || statusFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Execute a workflow to record telemetry.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(log => <LogDetail key={log.id} log={log} />)}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total} logs
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => fetchLogs(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
