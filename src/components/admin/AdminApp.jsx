import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import EmployeeManagement from './EmployeeManagement';
import Departments from './Departments';
import Attendance from './Attendance';
import LeaveManagement from './LeaveManagement';
import Payroll from './Payroll';
import Recruitment from './Recruitment';
import Performance from './Performance';
import Training from './Training';
import AssetManagement from './AssetManagement';
import Reports from './Reports';
import Notifications from './Notifications';
import Subscription from './Subscription';
import Settings from './Settings';
import Security from './Security';
import AiFeatures from './AiFeatures';
import Designations from './Designations';
import Organization from './Organization';
import Expenses from './Expenses';
import SupportTickets from './SupportTickets';
import { Bot, Sparkles, X, Send } from 'lucide-react';

const initialEmployees = [];

const initialNotifications = [];

const initialMessages = [];

import { api } from '../../services/api';
import { applyThemeColor } from '../../utils/theme';

export default function App({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [featureFlags, setFeatureFlags] = useState({});

  const handleMarkNotificationRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem("hrms_admin_read_notification_ids") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("hrms_admin_read_notification_ids", JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("hrms_admin_read_notification_ids") || "[]");
    notifications.forEach(n => {
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    localStorage.setItem("hrms_admin_read_notification_ids", JSON.stringify(readIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (isMobile && !['attendance', 'settings', 'payroll', 'attendance-dashboard', 'attendance-logs', 'attendance-grid', 'attendance-my', 'attendance-shift', 'attendance-reports'].includes(activeTab) && !activeTab.startsWith('payroll-')) {
      setActiveTab('attendance-dashboard');
    }
  }, [isMobile, activeTab]);
  const [employees, setEmployees] = useState([]);
  const [profile, setProfile] = useState({
    name: 'Marcus Vance',
    role: 'HR Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const prof = await api.getProfile();
        const comp = await api.getAdminCompany();
        setProfile({
          name: prof.name,
          role: prof.role,
          avatar: prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          companyName: prof.companyName || 'Antigravity',
          companyLogo: prof.companyLogo || '',
          currency: comp?.currency || 'USD'
        });
        if (comp && comp.themeColor) {
          applyThemeColor(comp.themeColor);
        }
        let mods = comp?.modulesEnabled || {};
        if (typeof mods === 'string') {
          try { mods = JSON.parse(mods); } catch (e) {}
        }
        if (typeof mods === 'string') {
          try { mods = JSON.parse(mods); } catch (e) {}
        }
        if (!mods || typeof mods !== 'object') {
          mods = {};
        }
        setFeatureFlags(mods);
        
        const list = await api.getEmployees();
        setEmployees(list);

        // Fetch pending leaves
        const leaves = await api.getAdminLeaves();
        const pendingL = leaves.filter(l => l.status === 'Pending');

        // Fetch pending expenses
        const expenses = await api.getAdminExpenses();
        const pendingE = expenses.filter(e => e.status === 'Pending');

        // Fetch open tickets
        const tickets = await api.getAdminTickets();
        const openT = tickets.filter(t => t.status === 'open' || t.status === 'Open');

        // Fetch pending correction requests
        const corrections = await api.getManagerCorrections().catch(() => []);
        const pendingC = corrections.filter(c => c.status === 'Pending');

        // Generate Admin Notifications
        const generated = [];
        const readIds = JSON.parse(localStorage.getItem("hrms_admin_read_notification_ids") || "[]");

        pendingL.forEach(l => {
          const id = `NTF-admin-leave-${l.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Leave Approval Required",
            message: `${l.employeeName || 'An employee'} requested ${l.totalDays} days of leave.`,
            time: "New",
            type: "info",
            badgeColor: "#F59E0B",
            read
          });
        });

        pendingE.forEach(e => {
          const id = `NTF-admin-expense-${e.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Expense Claim Approval",
            message: `${e.employeeName || 'An employee'} requested ₹${e.amount} reimbursement.`,
            time: "New",
            type: "info",
            badgeColor: "#EF4444",
            read
          });
        });

        openT.forEach(t => {
          const id = `NTF-admin-ticket-${t.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Support Ticket Logged",
            message: `New support ticket: ${t.subject} (${t.priority}).`,
            time: "New",
            type: "info",
            badgeColor: "#3B82F6",
            read
          });
        });

        pendingC.forEach(c => {
          const id = `NTF-admin-correction-${c.id}`;
          const read = readIds.includes(id);
          generated.push({
            id,
            title: "Correction Request Submitted",
            message: `${c.employeeName || 'An employee'} requested attendance correction for ${c.date}.`,
            time: "New",
            type: "info",
            badgeColor: "#8B5CF6",
            read
          });
        });

        setNotifications(generated);
      } catch (err) {
        console.error("Error loading admin core records:", err);
      }
    };
    loadAdminData();
    const interval = setInterval(loadAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: 'Hello! I am your AI HR Copilot. Ask me anything about employees, payroll, or business logistics.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLog(prev => [...prev, { sender: 'user', text: chatInput }]);
    const query = chatInput.toLowerCase();
    setChatInput('');
    
    setTimeout(() => {
      let response = `I've analyzed the live workspace datastore. All active records are synced.`;
      
      if (query.includes('how many') || query.includes('count') || query.includes('number of') || query.includes('employee') || query.includes('workers') || query.includes('staff')) {
        const total = employees.length;
        const active = employees.filter(emp => emp.status?.toLowerCase() === 'active').length;
        const onLeave = employees.filter(emp => emp.status?.toLowerCase() === 'on leave').length;
        response = `There are currently ${total} employees registered in ${profile.companyName || 'the company'}. Of these, ${active} are currently Active, and ${onLeave} are On Leave.`;
      } 
      else if (query.includes('pending') || query.includes('approval') || query.includes('action') || query.includes('request')) {
        const leaveAlerts = notifications.filter(n => n.title.includes('Leave')).length;
        const expAlerts = notifications.filter(n => n.title.includes('Expense')).length;
        const ticketAlerts = notifications.filter(n => n.title.includes('Ticket')).length;
        response = `Action items breakdown: There are ${leaveAlerts} pending leave applications, ${expAlerts} expense claims awaiting review, and ${ticketAlerts} support tickets open.`;
      }
      else if (query.includes('burnout') || query.includes('risk') || query.includes('stress') || query.includes('workload')) {
        const engineeringCount = employees.filter(emp => emp.department?.toLowerCase() === 'engineering').length;
        response = `Burnout analysis: Sarah Jenkins (Senior UX Designer) shows an elevated burnout risk score of 84% due to high task workload. The rest of the ${engineeringCount} engineering staff are at a stable workload rating.`;
      }
      else if (query.includes('brand') || query.includes('itlc') || query.includes('company name') || query.includes('workspace name') || query.includes('name')) {
        response = `Your workspace brand name is currently set to "${profile.companyName || 'Antigravity'}". You can update this brand name at any time by navigating to "Company Settings" under the Settings tab.`;
      }
      else {
        const matchedEmp = employees.find(emp => query.includes(emp.name.toLowerCase()) || emp.name.toLowerCase().split(' ').some(w => w.length > 2 && query.includes(w)));
        if (matchedEmp) {
          response = `Employee Lookup: ${matchedEmp.name} is a ${matchedEmp.role || matchedEmp.designation} in the ${matchedEmp.department || 'Staff'} department. Email: ${matchedEmp.email || 'N/A'}. Status is currently "${matchedEmp.status}".`;
        } else {
          response = `I am your real-time HR Copilot. You can ask me to:
          • Count total employees ("how many employees")
          • List pending approvals ("any pending approvals")
          • Check specific employee details (e.g. "search Marcus Vance")
          • Check burnout stress levels ("burnout risk")`;
        }
      }
      
      setChatLog(prev => [...prev, { sender: 'ai', text: response }]);
    }, 600);
  };

  const handleLogout = () => {
    onLogout && onLogout();
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview employeesList={employees} notifications={notifications} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'employees':
      case 'employee-profile':
        return <EmployeeManagement employees={employees} setEmployees={setEmployees} searchQuery={searchQuery} subTab={activeTab === 'employee-profile' ? 'profile' : 'directory'} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'departments':
        return <Departments setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'designations':
        return <Designations setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'organization':
        return <Organization employees={employees} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'attendance':
      case 'attendance-dashboard':
      case 'attendance-logs':
      case 'attendance-corrections':
      case 'attendance-grid':
      case 'attendance-my':
      case 'attendance-shift':
      case 'attendance-reports':
        return <Attendance subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'leave':
      case 'leave-dashboard':
      case 'leave-request':
      case 'leave-my':
      case 'leave-policies':
      case 'leave-calendar':
      case 'leave-reports':
        return <LeaveManagement subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'payroll':
      case 'payroll-dashboard':
      case 'payroll-structures':
      case 'payroll-run':
      case 'payroll-payslips':
      case 'payroll-compliance':
      case 'payroll-reimbursements':
      case 'payroll-reports':
        return <Payroll employees={employees} subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'recruitment':
      case 'recruitment-dashboard':
      case 'recruitment-openings':
      case 'recruitment-candidates':
      case 'recruitment-interview':
      case 'recruitment-offers':
      case 'recruitment-onboarding':
        return <Recruitment subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'performance':
      case 'performance-dashboard':
      case 'performance-goals':
      case 'performance-kpis':
      case 'performance-cycles':
      case 'performance-appraisals':
      case 'performance-feedback':
      case 'performance-reports':
        return <Performance employees={employees} subTab={activeTab.split('-')[1] || 'dashboard'} />;
      case 'expenses':
        return <Expenses setActiveTab={setActiveTab} currency={profile.currency} />;
      case 'support':
        return <SupportTickets setActiveTab={setActiveTab} />;
      case 'assets':
      case 'assets-inventory':
      case 'assets-allocate':
      case 'assets-requests':
      case 'assets-maintenance':
      case 'assets-reports':
      case 'assets-settings':
        return <AssetManagement subTab={activeTab.split('-')[1] || 'dashboard'} setActiveTab={setActiveTab} />;
      case 'training':
        return <Training setActiveTab={setActiveTab} />;
      case 'reports':
        return <Reports setActiveTab={setActiveTab} />;
      case 'notifications':
        return <Notifications notifications={notifications} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllNotificationsRead} />;
      case 'subscription':
        return <Subscription setActiveTab={setActiveTab} />;
      case 'settings':
        return <Settings setActiveTab={setActiveTab} />;
      case 'security':
        return <Security setActiveTab={setActiveTab} />;
      case 'ai-assistant':
        return <AiFeatures setActiveTab={setActiveTab} />;
      default:
        return <DashboardOverview employeesList={employees} notifications={notifications} setActiveTab={setActiveTab} currency={profile.currency} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49
          }}
        />
      )}

      {/* Sidebar Nav */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        handleLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        companyName={profile.companyName}
        companyLogo={profile.companyLogo}
        featureFlags={featureFlags}
      />

      {/* Main Panel Wrapper */}
      <main
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 admin-main-content p-4 md:pr-6 md:py-4"
      >
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          toggleAiAssistant={() => setShowAiAssistant(true)} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          messages={initialMessages}
          userProfile={profile}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Inner Page Transitions */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="premium-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating AI Assistant overlay drawer */}
      <AnimatePresence>
        {showAiAssistant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiAssistant(false)}
              style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 900 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '100%',
                maxWidth: 400,
                background: 'rgba(4, 6, 12, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
                zIndex: 901,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyBetween: 'space-between',
                justifyContent: 'space-between',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bot size={22} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>AI assistant Insights</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>Powered by DeepMind</span>
                  </div>
                </div>
                <button onClick={() => setShowAiAssistant(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Chat Feed */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatLog.map((chat, index) => (
                  <div key={index} style={{ display: 'flex', justify: chat.sender === 'user' ? 'flex-end' : 'flex-start', justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: 12,
                      borderRadius: 12,
                      fontSize: '0.8rem',
                      background: chat.sender === 'user' ? 'var(--color-primary)' : '#E2E8F0',
                      color: chat.sender === 'user' ? 'white' : 'var(--color-text-primary)',
                      borderBottomRightRadius: chat.sender === 'user' ? 2 : 12,
                      borderBottomLeftRadius: chat.sender === 'ai' ? 2 : 12
                    }}>
                      {chat.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Ask about burnouts..." 
                  className="premium-input" 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="premium-btn premium-btn-primary" style={{ padding: 12 }}>
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
