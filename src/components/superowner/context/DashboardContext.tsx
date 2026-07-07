import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, SubscriptionPlan, Payment, User, Coupon, SupportTicket, ActivityLog } from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_PLANS,
  INITIAL_PAYMENTS,
  INITIAL_USERS,
  INITIAL_COUPONS,
  INITIAL_TICKETS,
  INITIAL_LOGS
} from '../dashboardData';

interface Settings {
  platformName: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  smtpServer: string;
  smtpEmail: string;
  brandColor: string;
  stripeEnabled: boolean;
  razorpayEnabled: boolean;
  paypalEnabled: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  plans: SubscriptionPlan[];
  setPlans: React.Dispatch<React.SetStateAction<SubscriptionPlan[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  logs: ActivityLog[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  impersonatedCompany: Company | null;
  setImpersonatedCompany: (company: Company | null) => void;
  addLog: (action: string, details: string, category: ActivityLog['category'], actor?: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  formatAmount: (amountInUSD: number) => string;
  isFormDirty: boolean;
  setIsFormDirty: (dirty: boolean) => void;
}

export const CURRENCY_DETAILS: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  INR: { symbol: '₹', rate: 83.0 },
  GBP: { symbol: '£', rate: 0.79 },
  CAD: { symbol: 'CA$', rate: 1.36 },
  AUD: { symbol: 'A$', rate: 1.50 },
  JPY: { symbol: '¥', rate: 155.0 }
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

import { api } from '../../../services/api';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const companyList = await api.getCompanies();
        setCompanies(companyList);
        
        const ticketList = await api.getSuperOwnerTickets();
        setTickets(ticketList);

        const userList = await api.getSuperOwnerUsers();
        setUsers(userList);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const [impersonatedCompany, setImpersonatedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>({
    platformName: 'SUPEROWNER HRMS',
    currency: 'USD',
    timezone: 'UTC-5',
    maintenanceMode: false,
    smtpServer: 'smtp.mailgun.org',
    smtpEmail: 'noreply@superowner.io',
    brandColor: '#6366f1',
    stripeEnabled: true,
    razorpayEnabled: true,
    paypalEnabled: true,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  useEffect(() => {
    setSelectedCurrency(settings.currency);
  }, [settings.currency]);

  const formatAmount = (amountInUSD: number) => {
    const details = CURRENCY_DETAILS[selectedCurrency] || CURRENCY_DETAILS.USD;
    const converted = amountInUSD * details.rate;
    if (selectedCurrency === 'JPY') {
      return `${details.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${details.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('System settings updated successfully', 'success');
    addLog('Settings Updated', 'Platform global settings modified.', 'settings', 'Priya Sharma');
  };

  const addLog = (
    action: string,
    details: string,
    category: ActivityLog['category'],
    actor = 'Priya Sharma'
  ) => {
    const newLog: ActivityLog = {
      id: `log_${Math.random().toString(36).substring(2, 9)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      category,
      actorName: actor
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Keyboard shortcut Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        companies,
        setCompanies,
        plans,
        setPlans,
        payments,
        setPayments,
        users,
        setUsers,
        coupons,
        setCoupons,
        tickets,
        setTickets,
        logs,
        setLogs,
        settings,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        showCommandPalette,
        setShowCommandPalette,
        impersonatedCompany,
        setImpersonatedCompany,
        addLog,
        selectedCurrency,
        setSelectedCurrency,
        formatAmount,
        isFormDirty,
        setIsFormDirty
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
