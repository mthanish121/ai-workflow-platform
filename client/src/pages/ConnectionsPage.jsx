import { useState } from 'react';
import { AppIcon } from '../components/AppIcon';
import {
  Search, Plus, Filter, X, CheckCircle2,
  Trash2, ExternalLink, ShieldCheck, RefreshCw,
  Layers, ChevronDown, SlidersHorizontal, AlertCircle,
  MoreVertical, Link2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const AVAILABLE_APPS = [
  { id: 'google_sheets', name: 'Google Sheets', category: 'Productivity', type: 'OAuth 2.0', defaultAccount: 'marketing.team@flowai.io' },
  { id: 'gmail', name: 'Gmail', category: 'Communication', type: 'OAuth 2.0', defaultAccount: 'founder@flowai.io' },
  { id: 'google_calendar', name: 'Google Calendar', category: 'Productivity', type: 'OAuth 2.0', defaultAccount: 'consulting@flowai.io' },
  { id: 'slack', name: 'Slack', category: 'Communication', type: 'Bot Token', defaultAccount: '#general (FlowAI Workspace)' },
  { id: 'stripe', name: 'Stripe', category: 'Payment & Finance', type: 'API Key', defaultAccount: 'FlowAI Production Account' },
  { id: 'facebook', name: 'Facebook Lead Ads', category: 'Marketing', type: 'Page Token', defaultAccount: 'FlowAI Business Page' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM & Sales', type: 'API Key', defaultAccount: 'Sales Pipeline (Direct Deals)' },
  { id: 'notion', name: 'Notion', category: 'Productivity', type: 'Integration Token', defaultAccount: 'Company Knowledgebase' },
  { id: 'telegram', name: 'Telegram', category: 'Communication', type: 'Bot API', defaultAccount: '@FlowAINotifierBot' },
  { id: 'asana', name: 'Asana', category: 'Productivity', type: 'OAuth 2.0', defaultAccount: 'Client Onboarding Project' },
  { id: 'zendesk', name: 'Zendesk', category: 'Customer Support', type: 'API Key', defaultAccount: 'support.flowai.zendesk.com' },
  { id: 'shopify', name: 'Shopify', category: 'E-commerce', type: 'Admin API', defaultAccount: 'flowai-store.myshopify.com' },
  { id: 'github', name: 'GitHub', category: 'Developer Tools', type: 'Personal Access Token', defaultAccount: 'flowai-org/platform' },
  { id: 'gemini', name: 'Google Gemini 2.0 AI', category: 'AI & Machine Learning', type: 'API Key', defaultAccount: 'Native Server Copilot' },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [customAccountName, setCustomAccountName] = useState('');
  const [connecting, setConnecting] = useState(false);

  const filteredConnections = connections.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.account.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenAddModal = (app = null) => {
    setSelectedApp(app);
    setCustomAccountName(app?.defaultAccount || '');
    setAddModalOpen(true);
  };

  const handleConnectApp = (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setConnecting(true);
    setTimeout(() => {
      const newConn = {
        id: `conn_${Date.now()}`,
        name: selectedApp.name,
        appId: selectedApp.id,
        category: selectedApp.category,
        type: selectedApp.type,
        account: customAccountName.trim() || selectedApp.defaultAccount,
        status: 'Connected',
        connectedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      setConnections([newConn, ...connections]);
      setConnecting(false);
      setAddModalOpen(false);
      setSelectedApp(null);
      toast.success(`Successfully connected ${selectedApp.name}!`);
    }, 600);
  };

  const handleDisconnect = (id, name) => {
    setConnections(connections.filter((c) => c.id !== id));
    toast.success(`Disconnected ${name}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* ─── Top Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Connections</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage authenticated OAuth credentials, API keys, and webhook endpoints.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="btn-primary !py-2.5 !px-5 !text-xs self-start sm:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create connection</span>
        </button>
      </div>

      {/* ─── Search & View By Filter Toolbar (Zapier Style) ──────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* View by selector */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold whitespace-nowrap shadow-2xs">
          <span className="text-slate-500">View by:</span>
          <span className="text-slate-900 font-bold">Connections</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Search Bar with Clear Icon */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connection or app name"
            className="w-full h-10 pl-10 pr-10 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#ff4f00] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Button */}
        <button
          onClick={() => toast('Displaying all available app filters')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters</span>
        </button>
      </div>

      {/* ─── Main Content Area (Empty State vs Connected Table) ──────────── */}
      {connections.length === 0 ? (
        /* Authentic Zapier Empty State Card */
        <div className="rounded-2xl bg-white border border-slate-200 p-12 sm:p-16 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] mx-auto">
            <div className="grid grid-cols-2 gap-1.5 p-1">
              <div className="w-3 h-3 rounded-full border-2 border-[#ff4f00]" />
              <div className="w-3 h-3 rounded-full border-2 border-[#ff4f00]" />
              <div className="w-3 h-3 rounded-full border-2 border-[#ff4f00]" />
              <div className="w-3 h-3 rounded-full border-2 border-[#ff4f00]" />
            </div>
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              You haven't added a connection yet
            </h3>
            <p className="text-xs text-slate-500">
              Add a connection to start automating across your favorite apps and platforms.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleOpenAddModal()}
              className="btn-primary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add connection</span>
            </button>
          </div>
        </div>
      ) : (
        /* Connected Apps Grid & Table */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((conn) => (
              <div
                key={conn.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                      <AppIcon name={conn.name} size="lg" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">
                        {conn.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {conn.account}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {conn.status}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">{conn.type}</span>
                  <button
                    onClick={() => handleDisconnect(conn.id, conn.name)}
                    className="text-rose-500 hover:text-rose-600 hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Add Connection Modal ────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-[#ff4f00] flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedApp ? `Connect ${selectedApp.name}` : 'Select an App to Connect'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedApp ? 'Configure OAuth or API token' : 'Choose from 14+ official platforms'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setAddModalOpen(false); setSelectedApp(null); }}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto scrollbar-none flex-1 space-y-4">
              {!selectedApp ? (
                /* App Picker Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_APPS.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setCustomAccountName(app.defaultAccount);
                      }}
                      className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all flex items-center gap-3 text-left group shadow-2xs"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center p-1 shadow-2xs border border-slate-200 flex-shrink-0">
                        <AppIcon name={app.name} size="md" />
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#ff4f00] truncate">
                          {app.name}
                        </h4>
                        <p className="text-[10px] text-slate-500">{app.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Authentication Form for Selected App */
                <form onSubmit={handleConnectApp} className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-2xs border border-slate-200">
                      <AppIcon name={selectedApp.name} size="lg" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedApp.name}</h4>
                      <p className="text-xs text-slate-500">{selectedApp.type} Authentication</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Account / Workspace Identifier
                    </label>
                    <input
                      type="text"
                      value={customAccountName}
                      onChange={(e) => setCustomAccountName(e.target.value)}
                      placeholder="e.g., user@company.com or #channel-name"
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <p className="text-[11px] leading-relaxed">
                      Credentials are encrypted in transit and securely verified with FlowAI execution engine.
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={connecting}
                      className="btn-primary !py-2 !px-5 !text-xs flex items-center gap-2"
                    >
                      {connecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{connecting ? 'Authenticating...' : 'Authorize & Connect'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
