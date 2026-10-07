import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderPlus, Star, Link2, Cpu, Plus,
  Sparkles, CheckCircle2, ArrowRight, Database,
  Search, ShieldCheck, RefreshCw, Layers, Mail, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export function FoldersPage() {
  const [folders, setFolders] = useState([
    { id: 'f1', name: 'Lead Acquisition & Ads', count: 4, updated: '2 hours ago' },
    { id: 'f2', name: 'Billing & Invoicing Pipelines', count: 2, updated: 'Yesterday' },
    { id: 'f3', name: 'Customer Support Triages', count: 5, updated: '3 days ago' },
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders([...folders, { id: `f_${Date.now()}`, name: newFolderName.trim(), count: 0, updated: 'Just now' }]);
    setNewFolderName('');
    setCreating(false);
    toast.success('Folder created successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Folders</h1>
          <p className="text-xs text-slate-500 mt-1">Organize your Zaps and automation workflows across teams and projects.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary !py-2 !px-4 !text-xs inline-flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreateFolder} className="p-4 rounded-xl bg-white border border-orange-200 shadow-sm flex items-center gap-3">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name (e.g., Marketing Automation)..."
            className="input-field text-xs flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary !py-2 !px-4 !text-xs">Create</button>
          <button type="button" onClick={() => setCreating(false)} className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800">Cancel</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {folders.map((f) => (
          <div key={f.id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all space-y-3 shadow-2xs group">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] group-hover:scale-105 transition-transform">
                <FolderPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{f.count} workflows</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">{f.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Updated {f.updated}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FavoritesPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Favorites</h1>
        <p className="text-xs text-slate-500 mt-1">Starred and priority automations for quick monitoring.</p>
      </div>
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <Star className="w-8 h-8 text-amber-500 mx-auto fill-amber-100" />
        <h3 className="text-base font-bold text-slate-900">No starred automations yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Click the star icon next to any automation in your workflow list to pin it here for rapid access.
        </p>
        <Link to="/workflows" className="btn-primary !py-2 !px-4 !text-xs inline-flex items-center gap-2 mt-2">
          <span>View All Workflows</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function AppConnectionsPage() {
  const [connections] = useState([
    { name: 'Google Workspace (Sheets, Gmail)', status: 'Connected', icon: Mail, type: 'OAuth 2.0' },
    { name: 'Slack Team Engine', status: 'Connected', icon: MessageSquare, type: 'Bot Token' },
    { name: 'Stripe Billing Webhook', status: 'Active', icon: Database, type: 'Webhook Key' },
    { name: 'Google Gemini 2.0 AI API', status: 'Active', icon: Sparkles, type: 'Server API' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">App Connections</h1>
          <p className="text-xs text-slate-500 mt-1">Manage API keys, Webhooks, and OAuth authentications across your connected tools.</p>
        </div>
        <button
          onClick={() => toast.success('Select an app integration to connect.')}
          className="btn-primary !py-2 !px-4 !text-xs inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Connection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((c) => (
          <div key={c.name} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00]">
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                <p className="text-[11px] text-slate-500">{c.type}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function McpServersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-2xl bg-white border border-slate-200 p-8 shadow-2xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#ff4f00] text-xs font-bold border border-orange-100 mb-3">
          <Cpu className="w-3.5 h-3.5 text-[#ff4f00]" />
          <span>Model Context Protocol (MCP)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">MCP Tool Connectors</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Expose external databases, local CLI utilities, and AI toolsets directly into your FlowAI Copilot workflows via standardized Model Context Protocol servers.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No custom MCP server connected yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Connect your local or remote MCP endpoints to give your Gemini AI workflows instant access to specialized database schemas and tools.
        </p>
        <button
          onClick={() => toast.success('MCP server configuration dialog opening...')}
          className="btn-primary !py-2 !px-5 !text-xs inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Connect MCP Server</span>
        </button>
      </div>
    </div>
  );
}
