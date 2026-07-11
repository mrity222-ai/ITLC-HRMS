import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Building2, Briefcase, 
  CalendarCheck, CalendarX, CreditCard, FileUser, 
  TrendingUp, GraduationCap, Laptop, BarChart3, 
  BellRing, BadgePercent, Settings, ShieldAlert, Wallet,
  HeartHandshake, LogOut, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    id: 'people', 
    label: 'People', 
    icon: Users,
    subItems: [
      { id: 'employees', label: 'Employee Directory' },
      { id: 'employee-profile', label: 'Employee' },
      { id: 'departments', label: 'Departments' },
      { id: 'designations', label: 'Designations' },
      { id: 'organization', label: 'Organization' },
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    subItems: [
      { id: 'attendance-dashboard', label: 'Dashboard' },
      { id: 'attendance-logs', label: 'Daily Logs' },
      { id: 'attendance-grid', label: 'Monthly Grid' },
      { id: 'attendance-my', label: 'My Attendance' },
      { id: 'attendance-shift', label: 'Shift Setup' },
      { id: 'attendance-reports', label: 'Reports' },
    ]
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: CalendarX,
    subItems: [
      { id: 'leave-dashboard', label: 'Dashboard' },
      { id: 'leave-request', label: 'Leave Request' },
      { id: 'leave-my', label: 'My Leave' },
      { id: 'leave-policies', label: 'Policies Setup' },
      { id: 'leave-calendar', label: 'Leave Calendar' },
      { id: 'leave-reports', label: 'Reports' },
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: CreditCard,
    subItems: [
      { id: 'payroll-dashboard', label: 'Dashboard' },
      { id: 'payroll-structures', label: 'Salary Structures' },
      { id: 'payroll-run', label: 'Run Payroll' },
      { id: 'payroll-payslips', label: 'Payslips Console' },
      { id: 'payroll-compliance', label: 'Statutory Compliance' },
      { id: 'payroll-reimbursements', label: 'Reimbursements' },
      { id: 'payroll-reports', label: 'Reports & Export' },
    ]
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: FileUser,
    subItems: [
      { id: 'recruitment-dashboard', label: 'Dashboard' },
      { id: 'recruitment-openings', label: 'Job Openings' },
      { id: 'recruitment-candidates', label: 'Candidates' },
      { id: 'recruitment-interview', label: 'Interview' },
      { id: 'recruitment-offers', label: 'Offer Letters' },
      { id: 'recruitment-onboarding', label: 'Onboarding Wizard' },
    ]
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Wallet, // Wallet icon mapped for Expenses
    subItems: [
      { id: 'expenses-dashboard', label: 'Dashboard' },
      { id: 'expenses-my', label: 'My Expenses' },
      { id: 'expenses-create', label: 'Create Expense' },
      { id: 'expenses-approvals', label: 'Approvals' },
      { id: 'expenses-categories', label: 'Categories' },
      { id: 'expenses-reports', label: 'Reports' },
      { id: 'expenses-settings', label: 'Settings' },
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    subItems: [
      { id: 'performance-dashboard', label: 'Dashboard' },
      { id: 'performance-goals', label: 'Goals' },
      { id: 'performance-kpis', label: 'KPIs Target' },
      { id: 'performance-cycles', label: 'Review Cycles' },
      { id: 'performance-appraisals', label: 'Appraisals' },
      { id: 'performance-feedback', label: '360 Feedback' },
      { id: 'performance-reports', label: 'Reports' },
    ]
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Laptop,
    subItems: [
      { id: 'assets-inventory', label: 'Inventory' },
      { id: 'assets-allocate', label: 'Allocate Asset' },
      { id: 'assets-requests', label: 'Asset Requests' },
      { id: 'assets-maintenance', label: 'Maintenance' },
      { id: 'assets-reports', label: 'Reports' },
      { id: 'assets-settings', label: 'Settings' },
    ]
  },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'settings', label: 'Company Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: ShieldAlert },
  { id: 'support', label: 'Support', icon: HeartHandshake },
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, handleLogout, mobileOpen, setMobileOpen, companyName }) {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Auto expand when active tab falls under a collapsible menu parent
  useEffect(() => {
    const parentMenu = menuItems.find(item => 
      item.subItems && item.subItems.some(sub => sub.id === activeTab)
    );
    if (parentMenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [parentMenu.id]: true
      }));
    }
  }, [activeTab]);

  const handleItemClick = (id) => {
    setActiveTab(id);
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const toggleMenu = (menuId) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedMenus(prev => ({ ...prev, [menuId]: true }));
    } else {
      setExpandedMenus(prev => ({
        ...prev,
        [menuId]: !prev[menuId]
      }));
    }
    setActiveTab(menuId + '-dashboard');
  };

  return (
    <aside
      className={`fixed md:sticky z-50 md:z-30 flex flex-col overflow-hidden transition-all duration-300 bg-[var(--sidebar-bg)] border-r border-slate-200/80 h-screen inset-y-0 left-0 w-[260px] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${collapsed ? 'md:w-20' : 'md:w-[280px]'} shrink-0`}
    >
      {/* Sidebar Header */}
      <div style={{ 
        padding: '24px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        flexShrink: 0
      }}>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 18,
            }}>
              {companyName ? companyName[0].toUpperCase() : 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#0F172A', lineHeight: '1.2' }}>{companyName || 'Antigravity'}</span>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>HRMS Enterprise</span>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 18,
          }}>
            {companyName ? companyName[0].toUpperCase() : 'A'}
          </div>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '12px 12px', // Reduce top/bottom padding to make it tighter
        display: 'flex',
        flexDirection: 'column',
        gap: 2 // Reduce gap between items to 2px
      }}>
        {menuItems.map((item) => {
          // Render sub-items accordion
          if (item.subItems) {
            const isParentActive = item.subItems.some(sub => sub.id === activeTab);
            const isExpanded = expandedMenus[item.id];
            
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`saas-sidebar-item ${isParentActive ? 'active' : ''}`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    color: isParentActive ? '#4F46E5' : '#64748B',
                    fontWeight: 500,
                    fontSize: '15px',
                    outline: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <item.icon size={20} style={{ color: isParentActive ? '#4F46E5' : '#64748B', flexShrink: 0 }} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </div>
                  {!collapsed && (
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ display: 'flex', alignItems: 'center' }}>
                      <ChevronDown size={14} style={{ color: '#94A3B8' }} />
                    </motion.div>
                  )}
                </button>

                {/* Sub items collapsible list */}
                <AnimatePresence initial={false}>
                  {!collapsed && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        paddingLeft: 12,
                        marginLeft: 22,
                        borderLeft: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        overflow: 'hidden'
                      }}
                    >
                      {item.subItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleItemClick(sub.id)}
                            className={`saas-sidebar-subitem ${isSubActive ? 'active' : ''}`}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: 'none',
                              background: isSubActive ? '#EEF2FF' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                              color: isSubActive ? '#4F46E5' : '#64748B',
                              fontWeight: isSubActive ? 600 : 500,
                              fontSize: '13px',
                              outline: 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Render normal root items
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`saas-sidebar-item ${isActive ? 'active' : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#EEF2FF' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                color: isActive ? '#4F46E5' : '#64748B',
                fontWeight: 500,
                fontSize: '15px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <Icon size={20} style={{ 
                color: isActive ? '#4F46E5' : '#64748B',
                flexShrink: 0
              }} />
              
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer Button */}
      <div style={{ 
        padding: '16px 12px', 
        borderTop: '1px solid rgba(226, 232, 240, 0.6)',
        flexShrink: 0
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            color: 'var(--color-danger)',
            fontWeight: 600,
            fontSize: '0.875rem',
            outline: 'none'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </aside>
  );
}
