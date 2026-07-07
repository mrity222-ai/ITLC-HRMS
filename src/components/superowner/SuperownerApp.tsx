import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, CreditCard, ListChecks, DollarSign, 
  BarChart3, Users, ShieldAlert, ToggleLeft, LifeBuoy, Activity, 
  Bell, Ticket, GitMerge, Lock, History, Settings, User, LogOut,
  Search, Keyboard, Zap, ChevronDown, Sparkles, CheckCircle2, 
  ArrowRight, X, AlertTriangle, Play, HelpCircle, Database
} from 'lucide-react';
import { useDashboard } from './context/DashboardContext';
import { api } from '../../services/api';

// Import Tab Components
import OverviewTab from './tabs/OverviewTab';
import CompaniesTab from './tabs/CompaniesTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import PaymentsTab from './tabs/PaymentsTab';
import RevenueTab from './tabs/RevenueTab';
import FeatureManagementTab from './tabs/FeatureManagementTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import NotificationsTab from './tabs/NotificationsTab';
import CouponsTab from './tabs/CouponsTab';
import SupportCenterTab from './tabs/SupportCenterTab';
import IntegrationsTab from './tabs/IntegrationsTab';
import SecurityTab from './tabs/SecurityTab';
import ActivityLogsTab from './tabs/ActivityLogsTab';
import SettingsTab from './tabs/SettingsTab';

// Roles & Permissions tab was removed
export const App: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const {
    activeTab, setActiveTab,
    toasts, removeToast,
    showCommandPalette, setShowCommandPalette,
    impersonatedCompany, setImpersonatedCompany,
    addToast, addLog, companies, tickets,
    selectedCurrency, setSelectedCurrency,
    isFormDirty, setIsFormDirty
  } = useDashboard();

  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const handleSetActiveTab = (tabName: string) => {
    if (isFormDirty) {
      setPendingTab(tabName);
    } else {
      setActiveTab(tabName);
    }
    setMobileSidebarOpen(false);
  };  // Collapsed states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Command Palette states
  const [cpSearch, setCpSearch] = useState('');

  // Lockscreen simulation state
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const prof = await api.getProfile();
        setProfile(prof);
      } catch (err) {
        console.error("Failed to load Super Owner profile:", err);
      }
    };
    loadProfile();
  }, []);

  // Sidebar list mapping
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Companies', icon: Building2 },
    { name: 'Subscriptions', icon: CreditCard },
    { name: 'Payments', icon: DollarSign },
    { name: 'Revenue', icon: BarChart3 },
    { name: 'Feature Management', icon: ToggleLeft },
    { name: 'Support Center', icon: LifeBuoy },
    { name: 'Analytics', icon: Activity },
    { name: 'Notifications', icon: Bell },
    { name: 'Coupons', icon: Ticket },
    { name: 'Integrations', icon: GitMerge },
    { name: 'Security', icon: Lock },
    { name: 'Activity Logs', icon: History },
    { name: 'Settings', icon: Settings }
  ];

  // Render tab helper
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <OverviewTab />;
      case 'Companies': return <CompaniesTab />;
      case 'Subscriptions': return <SubscriptionsTab />;
      case 'Payments': return <PaymentsTab />;
      case 'Revenue': return <RevenueTab />;
      case 'Feature Management': return <FeatureManagementTab />;
      case 'Support Center': return <SupportCenterTab />;
      case 'Analytics': return <AnalyticsTab />;
      case 'Notifications': return <NotificationsTab />;
      case 'Coupons': return <CouponsTab />;
      case 'Integrations': return <IntegrationsTab />;
      case 'Security': return <SecurityTab />;
      case 'Activity Logs': return <ActivityLogsTab />;
      case 'Settings': return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  // Command palette search results
  const cpResults = useMemo(() => {
    if (!cpSearch.trim()) return [];
    const searchLower = cpSearch.toLowerCase();
    
    const results: Array<{ type: 'nav' | 'action' | 'company', title: string, sub: string, payload?: any }> = [];

    // Match Navigation
    sidebarItems.forEach(item => {
      if (item.name.toLowerCase().includes(searchLower)) {
        results.push({ type: 'nav', title: `Go to ${item.name}`, sub: 'Navigate to section' });
      }
    });

    // Match Actions
    const actions = [
      { title: 'Trigger Database Backup', sub: 'Runs full snapshot backup', payload: 'backup' },
      { title: 'Create Promo Coupon', sub: 'Opens coupons creation modal', payload: 'coupon' },
      { title: 'Add New Company Tenant', sub: 'Opens company onboarding modal', payload: 'company' },
      { title: 'Send System Broadcast Notice', sub: 'Dispatches Email/SMS alerts', payload: 'notify' }
    ];
    actions.forEach(act => {
      if (act.title.toLowerCase().includes(searchLower)) {
        results.push({ type: 'action', title: act.title, sub: act.sub, payload: act.payload });
      }
    });

    // Match Companies
    companies.forEach(c => {
      if (c.name.toLowerCase().includes(searchLower)) {
        results.push({ type: 'company', title: `Login as ${c.name}`, sub: 'Impersonate client admin workspace', payload: c });
      }
    });

    return results.slice(0, 5);
  }, [cpSearch, companies]);

  // Execute Command Palette click
  const handleCpExecute = (res: any) => {
    setShowCommandPalette(false);
    setCpSearch('');

    if (res.type === 'nav') {
      const tabName = res.title.replace('Go to ', '');
      handleSetActiveTab(tabName);
      addToast(`Navigated to ${tabName}`, 'info');
    } else if (res.type === 'action') {
      if (res.payload === 'backup') {
        handleSetActiveTab('Settings');
        addToast('Settings tab opened. Click "Trigger Manual Backup" to run.', 'info');
      } else if (res.payload === 'coupon') {
        handleSetActiveTab('Coupons');
        addToast('Coupon Management opened. Click "Create Coupon" to start.', 'info');
      } else if (res.payload === 'company') {
        handleSetActiveTab('Companies');
        addToast('Companies tab opened. Click "Add Company" to start.', 'info');
      } else if (res.payload === 'notify') {
        handleSetActiveTab('Notifications');
        addToast('Notifications center opened. Write message in dispatcher.', 'info');
      }
    } else if (res.type === 'company') {
      setImpersonatedCompany(res.payload);
      addToast(`Logged in as Admin for ${res.payload.name}`, 'info');
      addLog('Impersonated Login', `Logged in as Company Admin for ${res.payload.name} via Command Palette.`, 'security');
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === '') {
      setIsLocked(false);
      setPasswordInput('');
      addToast('Welcome back, Priya!', 'success');
      addLog('Admin Unlocked Screen', 'Super admin unlocked control screen.', 'security');
    } else {
      addToast('Invalid credential token. (Tip: leave blank or use "admin")', 'error');
    }
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-dark flex flex-col items-center justify-center p-4">
        {/* Glowing Background Grid */}
        <div className="absolute inset-0 bg-radial-glow from-indigo-500/5 via-transparent to-transparent blur-3xl pointer-events-none"></div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card w-full max-w-sm p-8 rounded-3xl space-y-6 text-center"
        >
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 animate-pulse-slow">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">System Screen Locked</h2>
            <p className="text-xs text-slate-400 mt-1">Super Owner session locked for {profile?.name || 'Super Owner'}</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password credential (or hit Enter)..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="glass-input w-full px-4 py-2 rounded-xl text-xs text-center text-slate-200 placeholder-slate-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/30"
            >
              Unlock Terminal Screen
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--bg-color)] flex relative overflow-hidden transition-colors duration-300">
      {/* Noise tactile texture overlay */}
      <div className="noise-overlay"></div>

      {/* Moving gradient mesh & floating blurred glow lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 blur-[120px] animate-mesh-float-1"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40rem] h-[40rem] rounded-full bg-purple-500/8 blur-[150px] animate-mesh-float-2"></div>
        <div className="absolute top-[40%] right-[30%] w-[30rem] h-[30rem] rounded-full bg-cyan-500/8 blur-[100px] animate-mesh-float-3"></div>
      </div>
      
      {/* Impersonation top notification banner */}
      <AnimatePresence>
        {impersonatedCompany && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 border-b border-indigo-500/30 text-white py-2 px-4 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <span className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 animate-bounce" /> Impersonating Client Workspace Admin for: <span className="underline">{impersonatedCompany.name}</span></span>
            <button
              onClick={() => {
                setImpersonatedCompany(null);
                addToast('Returned to Super Owner workspace', 'info');
              }}
              className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold tracking-wider uppercase transition"
            >
              Exit Impersonation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
 
       {/* Backdrop overlay for mobile drawer */}
       {isMobile && mobileSidebarOpen && (
         <div
           className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
           onClick={() => setMobileSidebarOpen(false)}
         />
       )}

       {/* Sidebar Navigation */}
        <aside 
          className={`fixed md:relative top-0 bottom-0 md:h-screen left-0 z-40 md:z-auto transition-all duration-300 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] backdrop-blur-md ${mobileSidebarOpen ? 'flex' : 'hidden md:flex'} flex-col justify-between ${impersonatedCompany ? 'pt-8' : ''} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${sidebarOpen ? 'w-64' : 'w-64 md:w-20'}`}
        >
         <div className="flex-1 flex flex-col min-h-0">
           {/* Logo Brand */}
           <div className="p-5 flex items-center gap-3 border-b border-[var(--border-color)]">
             <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/25 shrink-0 text-lg">
               S
             </div>
             {(isMobile || sidebarOpen) && (
               <div>
                 <span className="font-bold text-white tracking-wide block leading-none text-lg">SUPEROWNER</span>
                 <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5 block">HRMS SAAS</span>
               </div>
             )}
           </div>

           {/* Navigation Links list */}
           <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
             {sidebarItems.map((item) => {
               const isActive = activeTab === item.name;
               return (
                  <button
                    key={item.name}
                    onClick={() => handleSetActiveTab(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-base relative group ${
                      isActive 
                        ? 'text-indigo-600 dark:text-indigo-300 font-semibold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/2 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-pill"
                        className="absolute inset-0 bg-indigo-500/10 border-l-[3px] border-indigo-500 rounded-xl z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3 w-full">
                      <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {(isMobile || sidebarOpen) && <span>{item.name}</span>}
                    </span>
                    
                    {/* Tooltip on collapsed */}
                    {!(isMobile || sidebarOpen) && (
                      <div className="absolute left-16 bg-slate-900 border border-slate-200/50 dark:border-white/5 text-[10px] font-semibold text-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-50">
                        {item.name}
                      </div>
                    )}
                  </button>
               );
             })}
           </nav>
         </div>

         {/* Footer profile / logout */}
         <div className="p-4 border-t border-slate-200/50 dark:border-white/5 space-y-1.5">
           {/* Profile Trigger */}
           <button
             onClick={() => setProfileOpen(true)}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/2 hover:text-slate-800 dark:hover:text-slate-200 transition text-base relative group"
           >
             <User className="h-5 w-5 shrink-0" />
             {(isMobile || sidebarOpen) && <span className="truncate">{profile?.name || 'Super Owner'}</span>}
             {!(isMobile || sidebarOpen) && (
               <div className="absolute left-16 bg-slate-900 border border-slate-200/50 dark:border-white/5 text-[10px] font-semibold text-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-50">
                 {profile?.name || 'User'}'s Profile
               </div>
             )}
           </button>

           {/* Logout Lock */}
           <button
              onClick={() => onLogout ? onLogout() : setIsLocked(true)}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition text-base relative group"
           >
             <LogOut className="h-5 w-5 shrink-0" />
             {(isMobile || sidebarOpen) && <span>{onLogout ? 'Log Out' : 'Lock Session'}</span>}
             {!(isMobile || sidebarOpen) && (
               <div className="absolute left-16 bg-slate-900 border border-slate-200/50 dark:border-white/5 text-[10px] font-semibold text-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-50">
                  {onLogout ? 'Log Out' : 'Lock Screen'}
               </div>
             )}
           </button>
         </div>
       </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        <header className={`h-16 shrink-0 border-b border-[var(--border-color)] bg-[var(--header-bg)] backdrop-blur-md px-6 flex justify-between items-center z-30 ${impersonatedCompany ? 'mt-8' : ''}`}>
          
          {/* Collapsible toggle & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => isMobile ? setMobileSidebarOpen(!mobileSidebarOpen) : setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={(isMobile ? mobileSidebarOpen : sidebarOpen) ? "M4 6h16M4 12h8m-8 6h16" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Global Search / Command palette activator */}
            <div 
              onClick={() => setShowCommandPalette(true)}
              className="relative max-w-xs w-full cursor-pointer hidden sm:block group"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition" />
              <div className="glass-input pl-9 pr-12 py-1.5 rounded-xl text-xs text-slate-400 select-none flex justify-between items-center w-full">
                <span>Search settings, actions...</span>
                <span className="flex items-center gap-0.5 border border-white/10 px-1 rounded text-[8px] font-semibold font-mono bg-white/2 uppercase">
                  <Keyboard className="h-2 w-2" /> Ctrl K
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & notifications & profile menu */}
          <div className="flex items-center gap-3">
            {/* Country Currency Selector */}
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  addToast(`Payment currency set to ${e.target.value}`, 'success');
                }}
                className="glass-input px-2.5 py-1.5 rounded-lg text-xs text-slate-300 font-semibold bg-transparent cursor-pointer border border-white/10 hover:border-white/20 transition-all focus:outline-none"
              >
                <option value="USD" className="bg-white text-black font-semibold">🇺🇸 USD ($)</option>
                <option value="EUR" className="bg-white text-black font-semibold">🇪🇺 EUR (€)</option>
                <option value="INR" className="bg-white text-black font-semibold">🇮🇳 INR (₹)</option>
                <option value="GBP" className="bg-white text-black font-semibold">🇬🇧 GBP (£)</option>
                <option value="CAD" className="bg-white text-black font-semibold">🇨🇦 CAD (CA$)</option>
                <option value="AUD" className="bg-white text-black font-semibold">🇦🇺 AUD (A$)</option>
                <option value="JPY" className="bg-white text-black font-semibold">🇯🇵 JPY (¥)</option>
              </select>
            </div>

            {/* Quick Actions menu */}
            <div className="relative">
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-purple-50 text-purple-600 transition shadow border border-purple-200"
              >
                <Zap className="h-3.5 w-3.5 text-purple-500" /> Quick Actions <ChevronDown className="h-3 w-3 text-purple-400" />
              </button>
              
              <AnimatePresence>
                {quickActionsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickActionsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 z-50 shadow-2xl text-sm"
                    >
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Companies'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition font-medium text-left"
                      >
                        <Building2 className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>Register New Tenant Company</span>
                      </button>
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Notifications'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition font-medium text-left"
                      >
                        <Bell className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>Broadcast SMTP Notice Alert</span>
                      </button>
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Coupons'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition font-medium text-left"
                      >
                        <Ticket className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>Add Promotion Discount Code</span>
                      </button>
                      <button 
                        onClick={() => { setQuickActionsOpen(false); handleSetActiveTab('Settings'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition font-medium text-left"
                      >
                        <Database className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>Trigger Database S3 Backup</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Drawer activator */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 glass-card rounded-xl p-4 z-50 text-xs shadow-xl space-y-3"
                    >
                      <span className="font-bold text-white block">Recent Platform Events</span>
                      <div className="space-y-2.5">
                        {(() => {
                          const platformEvents = [];
                          companies.slice(0, 2).forEach(c => {
                            platformEvents.push({
                              id: `company-${c.id}`,
                              title: "New tenant registered",
                              message: `${c.name} (Owner: ${c.ownerName})`,
                              color: "bg-emerald-400"
                            });
                          });
                          tickets.filter(t => t.status === 'open').slice(0, 2).forEach(t => {
                            platformEvents.push({
                              id: `ticket-${t.id}`,
                              title: "Support ticket opened",
                              message: `"${t.subject}"`,
                              color: "bg-amber-400"
                            });
                          });
                          if (platformEvents.length === 0) {
                            return <div className="text-[10px] text-slate-500 text-center py-2">No recent platform events</div>;
                          }
                          return platformEvents.map((evt, idx) => (
                            <div key={idx} className="flex gap-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${evt.color} mt-1.5 shrink-0`}></div>
                              <div>
                                <span className="font-semibold text-slate-300 block">{evt.title}</span>
                                <span className="text-[10px] text-slate-500">{evt.message}</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      <button 
                        onClick={() => { setNotificationsOpen(false); handleSetActiveTab('Activity Logs'); }}
                        className="w-full text-center py-1 bg-white/2 hover:bg-white/5 border border-white/5 rounded text-[10px] font-semibold text-slate-400 hover:text-white transition block"
                      >
                        Open Telemetry Logs
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic active view panel */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 z-10 relative">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30, scale: 0.97, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(10px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </main>

      {/* Global Toast Alert Box */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-bold pointer-events-auto min-w-[280px] ${
                toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' :
                toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20' :
                toast.type === 'warning' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20' :
                toast.type === 'info' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' :
                'bg-slate-950 border-white/10 text-white shadow-lg'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5 text-white shrink-0" />}
              {toast.type === 'error' && <AlertTriangle className="h-4.5 w-4.5 text-white shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="h-4.5 w-4.5 text-white shrink-0" />}
              {toast.type === 'info' && <Sparkles className="h-4.5 w-4.5 text-white shrink-0" />}
              
              <span className="flex-1 leading-normal">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition p-0.5 rounded hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global Command Palette dialog (Ctrl + K) */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[15vh]">
            <div className="fixed inset-0" onClick={() => setShowCommandPalette(false)}></div>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="glass-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              {/* Input */}
              <div className="relative border-b border-white/5 p-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command, navigate sections, or login to a client..."
                  value={cpSearch}
                  onChange={(e) => setCpSearch(e.target.value)}
                  className="w-full bg-transparent border-0 pl-8 pr-12 text-sm text-slate-200 focus:outline-none placeholder-slate-500"
                />
                <button 
                  onClick={() => setShowCommandPalette(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-white/10 px-1.5 py-0.5 rounded font-mono uppercase bg-white/2"
                >
                  Esc
                </button>
              </div>

              {/* Search Results list */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {cpResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    {cpSearch.trim() ? 'No commands or companies matched.' : 'Type to search platform settings or tenants...'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-2 block mb-1">Matching Controls</span>
                    {cpResults.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => handleCpExecute(res)}
                        className="p-3.5 rounded-xl hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs text-slate-200 transition"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold block text-slate-200">{res.title}</span>
                          <span className="text-[10px] text-slate-500 block leading-normal">{res.sub}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-400 capitalize font-mono">{res.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hotkeys */}
              <div className="p-3.5 bg-white/1 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>↑↓ navigate</span>
                <span>⏎ select</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Profile Details modal */}
      <AnimatePresence>
        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="fixed inset-0" onClick={() => setProfileOpen(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl relative z-10 space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>
              
              <button 
                onClick={() => setProfileOpen(false)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md">
                  {profile?.name ? profile.name.split(' ').map((n: any) => n[0]).join('').toUpperCase() : 'SO'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">{profile?.name || 'Super Owner'}</h3>
                  <span className="text-xs text-indigo-400 font-semibold mt-1.5 inline-block">Platform Super Owner</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs font-bold">
                <div className="flex justify-between text-slate-400">
                  <span>Profile Status</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active Verified</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Registered Email</span>
                  <span className="font-bold text-slate-200 font-mono">{profile?.email || 'admin@superowner.io'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Workspaces</span>
                  <span className="font-bold text-slate-200">SUPEROWNER Core</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>MFA Token Authorization</span>
                  <span className="font-bold text-slate-200 font-mono">Authy OTP Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Page Confirmation Modal */}
      <AnimatePresence>
        {pendingTab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-4 relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold text-white">Unsaved Changes</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                You have unsaved changes in your form. Are you sure you want to discard them and leave this page?
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPendingTab(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-slate-200/20 dark:border-white/10 transition"
                >
                  Stay & Complete
                </button>
                <button
                  onClick={() => {
                    setIsFormDirty(false);
                    setActiveTab(pendingTab);
                    setPendingTab(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-600/20"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default App;
