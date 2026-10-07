import { useState, useEffect } from 'react';
import { AppIcon } from '../components/AppIcon';
import { mcpAPI } from '../lib/api';
import {
  Search, Plus, CheckCircle2, Trash2, Copy, Check,
  Sparkles, Bot, Cpu, Layers, ExternalLink, RefreshCw,
  ShieldCheck, ArrowRight, HelpCircle, Code2, Server,
  ChevronRight, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AGENTS = [
  // Popular
  { id: 'claude', name: 'Claude', category: 'popular', desc: 'Anthropic Claude Desktop & Web' },
  { id: 'claude_code', name: 'Claude Code', category: 'popular', desc: 'Anthropic CLI Terminal Agent' },
  { id: 'chatgpt', name: 'ChatGPT', category: 'popular', desc: 'OpenAI GPT-4o Custom GPTs' },
  { id: 'cursor', name: 'Cursor', category: 'popular', desc: 'AI Code Editor IDE Agent' },
  { id: 'openclaw', name: 'OpenClaw', category: 'popular', desc: 'Open-source Local Agent Engine' },

  // New
  { id: 'muse', name: 'Muse', category: 'new', desc: 'Creative Autonomous Agent' },
  { id: 'grok', name: 'Grok Bot', category: 'new', desc: 'xAI Reasoning Assistant' },
  { id: 'slack', name: 'Slack', category: 'new', desc: 'Slack Assistant AI Bot' },
  { id: 'gemini', name: 'Gemini Enterprise', category: 'new', desc: 'Google Cloud Gemini 2.0 AI' },
];

export default function McpPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentCustomName, setAgentCustomName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [newlyCreatedServer, setNewlyCreatedServer] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const fetchServers = async () => {
    try {
      const res = await mcpAPI.list();
      setServers(res.data.servers || []);
    } catch {
      // Graceful load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleOpenConnect = (agent) => {
    setSelectedAgent(agent);
    setAgentCustomName(agent ? `${agent.name} Workspace` : 'Custom AI Agent');
    setNewlyCreatedServer(null);
    setConnectModalOpen(true);
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgent && !agentCustomName.trim()) return;

    setConnecting(true);
    try {
      const res = await mcpAPI.connect({
        agent_name: agentCustomName.trim() || selectedAgent?.name || 'AI Agent',
        agent_type: selectedAgent?.id || 'custom',
        tools: ['workflows_list', 'workflows_trigger', 'data_lookup', 'copilot_generate'],
      });

      toast.success(res.data.message || 'MCP Server Connected!');
      setNewlyCreatedServer(res.data.server);
      fetchServers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect MCP server');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id, name) => {
    try {
      await mcpAPI.disconnect(id);
      toast.success(`Disconnected "${name}"`);
      setServers(servers.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disconnect');
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredAgents = AGENTS.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularAgents = filteredAgents.filter((a) => a.category === 'popular');
  const newAgents = filteredAgents.filter((a) => a.category === 'new');

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      
      {/* ─── 1. TOP HEADER & HOW IT WORKS (Zapier Reference) ───────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">MCP servers</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Connect external AI agents (Claude, Cursor, ChatGPT, Gemini) via Model Context Protocol.
            </p>
          </div>

          <button
            onClick={() => handleOpenConnect(null)}
            className="btn-primary !py-2.5 !px-5 !text-xs self-start sm:self-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add MCP server</span>
          </button>
        </div>

        {/* "How it works" 3-Step Educational Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff4f00] text-center">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] mx-auto">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                1. Connect your AI agent to FlowAI
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Choose from the list below and get your secure MCP SSE endpoint in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                2. Add the apps you use
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Let your agent access Google Sheets, Slack, Stripe, and CRM tools automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4f00] mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                3. Ask your AI agent to act
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Tell Claude or ChatGPT to trigger a workflow, update records, or fetch data. It just works.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. ACTIVE CONNECTED MCP SERVERS (Supabase Synced) ───────────── */}
      {servers.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#ff4f00]" />
            <h2 className="text-sm font-bold text-slate-900">Active Connected MCP Servers</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {servers.length}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {servers.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all space-y-4 shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                      <AppIcon name={srv.agent_name || srv.agent_type} size="lg" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">
                        {srv.agent_name}
                      </h3>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                        Type: {srv.agent_type}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                </div>

                {/* Endpoint & Token copy bar */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">SSE Endpoint:</span>
                    <button
                      onClick={() => handleCopy(srv.endpoint_url, `Endpoint (${srv.agent_name})`)}
                      className="text-[#ff4f00] hover:text-orange-600 flex items-center gap-1 text-[11px] font-bold"
                    >
                      {copiedField === `Endpoint (${srv.agent_name})` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-slate-800 truncate text-[11px] font-mono">{srv.endpoint_url}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Bearer Token:</span>
                    <span className="text-slate-700 text-[11px]">{srv.masked_token}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Created {new Date(srv.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDisconnect(srv.id, srv.agent_name)}
                    className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 hover:underline"
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

      {/* ─── 3. CHOOSE YOUR AI AGENT (Zapier Reference Layout) ────────────── */}
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Choose your AI agent
          </h2>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI agents (Claude, Cursor, ChatGPT, Gemini)..."
              className="w-full h-10 pl-10 pr-4 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#ff4f00] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Popular Category */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Popular</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {popularAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleOpenConnect(agent)}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all flex flex-col items-center text-center gap-3 group shadow-2xs hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <AppIcon name={agent.name} size="lg" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">
                    {agent.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{agent.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New Category */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">New</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {newAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleOpenConnect(agent)}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all flex flex-col items-center text-center gap-3 group shadow-2xs hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <AppIcon name={agent.name} size="lg" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#ff4f00] transition-colors">
                    {agent.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{agent.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. CONNECT MCP SERVER MODAL ─────────────────────────────────── */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-[#ff4f00] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedAgent ? `Connect ${selectedAgent.name}` : 'Connect Custom MCP Server'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Model Context Protocol Server Configuration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {!newlyCreatedServer ? (
                <form onSubmit={handleConnectSubmit} className="space-y-4">
                  {selectedAgent && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-2xs border border-slate-200">
                        <AppIcon name={selectedAgent.name} size="lg" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{selectedAgent.name}</h4>
                        <p className="text-xs text-slate-500">{selectedAgent.desc}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Agent Name / Identifier
                    </label>
                    <input
                      type="text"
                      value={agentCustomName}
                      onChange={(e) => setAgentCustomName(e.target.value)}
                      placeholder="e.g., Claude Desktop, Cursor Agent, Dev Bot"
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Exposed MCP Tools:</span>
                    <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside font-mono">
                      <li>workflows_list (inspect active flows)</li>
                      <li>workflows_trigger (execute webhooks & zaps)</li>
                      <li>data_lookup (query connected tables & CRM)</li>
                      <li>copilot_generate (synthesize actions)</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setConnectModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={connecting}
                      className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2"
                    >
                      {connecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{connecting ? 'Generating Server...' : 'Generate Connection'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Success & Credentials Output Screen */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-slate-900">MCP Server Ready!</h4>
                    <p className="text-xs text-emerald-700">
                      Copy the server endpoint & token below into your AI agent's configuration.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold">
                        <span>Server SSE URL</span>
                        <button
                          onClick={() => handleCopy(newlyCreatedServer.endpoint_url, 'SSE URL')}
                          className="text-[#ff4f00] hover:text-orange-600 flex items-center gap-1 font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </button>
                      </div>
                      <p className="text-slate-800 break-all select-all font-mono">{newlyCreatedServer.endpoint_url}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold">
                        <span>Bearer API Token (Shown Once)</span>
                        <button
                          onClick={() => handleCopy(newlyCreatedServer.raw_token, 'Bearer Token')}
                          className="text-[#ff4f00] hover:text-orange-600 flex items-center gap-1 font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Token</span>
                        </button>
                      </div>
                      <p className="text-emerald-700 font-bold break-all select-all font-mono">{newlyCreatedServer.raw_token}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setConnectModalOpen(false)}
                      className="btn-primary !py-2 !px-6 !text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
