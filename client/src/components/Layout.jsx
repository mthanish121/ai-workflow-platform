import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import ExploreAppsModal from './ExploreAppsModal';
import ContactSalesModal from './ContactSalesModal';
import CheckoutModal from './CheckoutModal';
import {
  Home, GitBranch, Folder, Star, LayoutGrid, Link2,
  Cpu, FileText, MoreHorizontal, Plus, Search,
  HelpCircle, ChevronDown, LogOut,
  User, CheckCircle2, Zap, ArrowRight, Menu, X,
  Info, Shield, ExternalLink, Command
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/workflows', icon: GitBranch, label: 'Automations' },
  { to: '/folders', icon: Folder, label: 'Folders' },
  { to: '/favorites', icon: Star, label: 'Favorites' },
  { to: '/templates', icon: LayoutGrid, label: 'Templates' },
  { to: '/connections', icon: Link2, label: 'App connections' },
  { to: '/mcp', icon: Cpu, label: 'MCP servers', badge: 'New' },
  { to: '/logs', icon: FileText, label: 'Zap history' },
];

export default function Layout({ children }) {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [exploreAppsOpen, setExploreAppsOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Global Ctrl+K handler for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'MT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const planName = user?.plan === 'team' ? 'Team' : user?.plan === 'professional' ? 'Professional' : 'Developer';
  const taskLimit = user?.plan === 'team' ? 100000 : user?.plan === 'professional' ? 10000 : 1000;
  const currentTasks = 0;
  const taskPercent = Math.min(100, Math.round((currentTasks / taskLimit) * 100));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate('/templates');
  };

  return (
    <div className="min-h-screen flex text-slate-800 bg-[#faf9f6]">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── LEFT SIDEBAR (Clean White Zapier Style) ─────────────────────── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col justify-between
          transition-all duration-300 select-none bg-white border-r border-slate-200
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none p-4">
          
          {/* Top Logo & Collapse Button */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <BrandLogo size="md" showText={!sidebarCollapsed} showSubtitle={false} />
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* + Create Action Button (Zapier Orange) */}
          <div className="mb-4">
            <Link
              to="/workflows/new"
              className={`
                w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2
                bg-[#ff4f00] hover:bg-[#e04500] text-white shadow-xs
                transition-all duration-200 active:scale-[0.98]
                ${sidebarCollapsed ? '!px-0 justify-center' : ''}
              `}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {!sidebarCollapsed && <span>Create</span>}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group
                  ${sidebarCollapsed ? 'justify-center !px-0' : ''}
                  ${isActive
                    ? 'bg-orange-50 text-[#ff4f00] font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }
                `}
                title={sidebarCollapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-[#ff4f00]' : 'text-slate-500 group-hover:text-slate-700'
                    }`} />
                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{label}</span>
                    )}
                    {!sidebarCollapsed && badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <button
              onClick={() => toast.success('Explore more features, webhooks, and team settings')}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all
                ${sidebarCollapsed ? 'justify-center !px-0' : ''}
              `}
            >
              <MoreHorizontal className="w-4 h-4 flex-shrink-0 text-slate-500" />
              {!sidebarCollapsed && <span>More</span>}
            </button>
          </nav>
        </div>

        {/* ─── Bottom Sidebar Plan Usage Meter ────────────────────────────── */}
        <div className="p-4 border-t border-slate-100">
          {!sidebarCollapsed ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  Plan tasks <Info className="w-3 h-3 text-slate-400" />
                </span>
                <span className="text-slate-700 font-mono font-bold">{currentTasks} / {taskLimit.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#ff4f00]"
                  style={{ width: `${Math.max(4, taskPercent)}%` }}
                />
              </div>

              <div className="pt-0.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {user?.plan && user.plan !== 'free' ? `${planName} Pro trial ends Oct 21` : 'Zapier Pro trial ends Oct 21'}
                </span>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="text-[11px] font-semibold text-[#6558f5] hover:underline transition-colors"
                >
                  Manage plan
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full flex justify-center py-2 text-[#ff4f00] hover:text-[#e04500] transition-colors"
              title="Manage Plan / Upgrade"
            >
              <Zap className="w-5 h-5 fill-[#ff4f00]" />
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar (Clean White) */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 flex items-center justify-between gap-4 bg-white border-b border-slate-200">
          
          {/* Mobile Menu Trigger & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar (Zapier Style: "Search assets, apps, templates, and more") */}
            <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets, apps, templates, and more"
                className="w-full h-9 pl-10 pr-16 rounded-lg text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-slate-300 text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white border border-slate-200 pointer-events-none">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </form>
          </div>

          {/* Right Header Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Help */}
            <button
              onClick={() => setHelpOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help</span>
            </button>

            {/* Explore Apps */}
            <button
              onClick={() => setExploreAppsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span>Explore apps</span>
            </button>

            {/* Contact Sales */}
            <button
              onClick={() => setContactSalesOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <span>Contact Sales</span>
            </button>

            {/* Top Upgrade Button */}
            <button
              onClick={() => setCheckoutOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
            >
              Upgrade
            </button>

            {/* User Profile Avatar Dropdown (Cyan MT Avatar as in Zapier screenshot) */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 font-bold text-xs flex items-center justify-center shadow-2xs transition-transform active:scale-95"
              >
                {getInitials(user?.full_name)}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl p-2 z-50 bg-white border border-slate-200 animate-slide-up">
                  <div className="px-3 py-2.5 mb-1 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-orange-50 text-[#ff4f00] border border-orange-200">
                      {planName} Tier
                    </span>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); setCheckoutOpen(true); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#ff4f00]" />
                      Manage Subscription
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <Link
                    to="/workflows"
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-[#ff4f00]" />
                    My Automations
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── PAGE BODY ─────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <ExploreAppsModal isOpen={exploreAppsOpen} onClose={() => setExploreAppsOpen(false)} />
      <ContactSalesModal isOpen={contactSalesOpen} onClose={() => setContactSalesOpen(false)} />
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        plan={{ id: 'professional', name: 'Professional', price_monthly: 29, price_yearly: 19 }}
        billingPeriod="yearly"
        onSuccess={(data) => {
          if (data?.plan && updateUser) updateUser({ plan: data.plan });
        }}
      />

      {/* Help / FAQ Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 bg-white border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#ff4f00]" />
                <h3 className="text-base font-bold text-slate-900">FlowAI Help Center</h3>
              </div>
              <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <p><strong className="text-slate-900">How do I create an automation?</strong> Click the "Create" button on the left sidebar or type your natural language prompt into the Copilot bar on the Home Dashboard.</p>
              <p><strong className="text-slate-900">Are webhook triggers instantaneous?</strong> Yes, FlowAI evaluates webhook POST payloads in sub-100ms and executes your configured action rules.</p>
              <p><strong className="text-slate-900">How do I test billing?</strong> You can simulate plan upgrades directly from the "Upgrade" button using sample test cards.</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setHelpOpen(false)} className="btn-primary !py-2 !px-4 !text-xs">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
