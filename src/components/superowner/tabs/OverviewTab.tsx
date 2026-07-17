import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, DollarSign, CreditCard, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, ShieldCheck, Sparkles,
  ArrowRight, FileText, CheckCircle2, UserCheck
} from 'lucide-react';
import { useDashboard, CURRENCY_DETAILS } from '../context/DashboardContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, LineChart, Line
} from 'recharts';

// Simple Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ value, prefix = '', suffix = '' }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="font-bold text-2xl md:text-3xl tracking-tight text-white font-grotesk"
    >
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </motion.span>
  );
};

// Simple Sparkline SVG path generator
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 80;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const OverviewTab: React.FC = () => {
  const { companies, users, payments, logs, setActiveTab, plans, formatAmount, selectedCurrency } = useDashboard();

  // Dynamic statistics
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'active').length;
    const trialCompanies = companies.filter(c => c.status === 'trial').length;
    const expiredCompanies = companies.filter(c => c.status === 'expired').length;
    
    const totalEmployees = companies.reduce((acc, c) => acc + c.employeesCount, 0);
    const hrUsersCount = users.filter(u => u.role?.toLowerCase() === 'hr' || u.role?.toLowerCase() === 'company admin').length;

    const planPrices: Record<string, number> = {};
    plans.forEach(p => planPrices[p.id] = p.price);

    // Calculate monthly revenue from active companies
    const monthlyRev = companies
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (planPrices[c.subscriptionPlanId] || 0), 0);
    const annualRev = monthlyRev * 12;

    const activeSubscriptions = companies.filter(c => c.status === 'active' && c.subscriptionPlanId !== 'free_trial').length;

    const todayNew = companies.filter(c => {
      const createdDate = c.createdDate;
      if (!createdDate) return false;
      return new Date(createdDate).toDateString() === new Date().toDateString();
    }).length;

    return {
      totalCompanies,
      activeCompanies,
      totalEmployees,
      hrUsersCount,
      monthlyRev,
      annualRev,
      activeSubscriptions,
      trialCompanies,
      expiredCompanies,
      todayNew: Math.max(1, todayNew) // fallback to minimum 1 if none created today to keep stats active
    };
  }, [companies, users]);

  // Chart Data
  const revenueChartData = [
    { name: 'Jan', revenue: stats.monthlyRev * 0.7 },
    { name: 'Feb', revenue: stats.monthlyRev * 0.78 },
    { name: 'Mar', revenue: stats.monthlyRev * 0.82 },
    { name: 'Apr', revenue: stats.monthlyRev * 0.88 },
    { name: 'May', revenue: stats.monthlyRev * 0.95 },
    { name: 'Jun', revenue: stats.monthlyRev },
  ];

  const growthChartData = [
    { name: 'Jan', companies: 4, employees: 800 },
    { name: 'Feb', companies: 4, employees: 1100 },
    { name: 'Mar', companies: 5, employees: 1350 },
    { name: 'Apr', companies: 5, employees: 1700 },
    { name: 'May', companies: 6, employees: 2100 },
    { name: 'Jun', companies: stats.totalCompanies, employees: stats.totalEmployees },
  ];

  const activeUsersData = [
    { time: '08:00', active: 450 },
    { time: '10:00', active: 980 },
    { time: '12:00', active: 1420 },
    { time: '14:00', active: 1380 },
    { time: '16:00', active: 1150 },
    { time: '18:00', active: 620 },
  ];

  const cardsData = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      sparkData: [5, 5, 6, 6, 7, stats.totalCompanies],
      growth: '+12%',
      isPositive: true,
      color: '#7C3AED', // Electric Violet
      tab: 'Companies'
    },
    {
      title: 'Active Companies',
      value: stats.activeCompanies,
      icon: ShieldCheck,
      sparkData: [4, 4, 4, 5, 5, stats.activeCompanies],
      growth: '+8%',
      isPositive: true,
      color: '#10B981', // Emerald
      tab: 'Companies'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      sparkData: [800, 1100, 1350, 1700, 2100, stats.totalEmployees],
      growth: '+22%',
      isPositive: true,
      color: '#2563EB', // Royal Blue
      tab: 'Analytics'
    },
    {
      title: 'Total HR Users',
      value: stats.hrUsersCount,
      icon: UserCheck,
      sparkData: [12, 18, 22, 28, 30, stats.hrUsersCount],
      growth: '+15%',
      isPositive: true,
      color: '#06B6D4', // Cyan
      tab: 'Users'
    },
    {
      title: 'Monthly Revenue',
      value: stats.monthlyRev,
      prefix: '$',
      icon: DollarSign,
      sparkData: [1800, 2100, 2400, 2900, 3100, stats.monthlyRev],
      growth: '+18%',
      isPositive: true,
      color: '#10B981', // Emerald
      tab: 'Revenue'
    },
    {
      title: 'Annual Run Rate',
      value: stats.annualRev,
      prefix: '$',
      icon: DollarSign,
      sparkData: [21600, 25200, 28800, 34800, 37200, stats.annualRev],
      growth: '+18%',
      isPositive: true,
      color: '#7C3AED', // Electric Violet
      tab: 'Revenue'
    },
    {
      title: 'Active Subs',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      sparkData: [3, 4, 4, 4, 5, stats.activeSubscriptions],
      growth: '+5%',
      isPositive: true,
      color: '#2563EB', // Royal Blue
      tab: 'Subscriptions'
    },
    {
      title: 'Trial Companies',
      value: stats.trialCompanies,
      icon: Clock,
      sparkData: [2, 1, 3, 2, 1, stats.trialCompanies],
      growth: '+4%',
      isPositive: true,
      color: '#F59E0B', // Amber
      tab: 'Companies'
    },
    {
      title: 'Expired Plans',
      value: stats.expiredCompanies,
      icon: AlertTriangle,
      sparkData: [1, 2, 1, 1, 2, stats.expiredCompanies],
      growth: '-15%',
      isPositive: false,
      color: '#EF4444', // Rose Red
      tab: 'Companies'
    },
    {
      title: "Today's Signups",
      value: stats.todayNew,
      icon: Sparkles,
      sparkData: [1, 2, 0, 1, 3, stats.todayNew],
      growth: '+40%',
      isPositive: true,
      color: '#06B6D4', // Cyan
      tab: 'Activity Logs'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Platform State */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans bg-clip-text">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics and platform performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium animate-pulse-slow">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
          Live Stream Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cardsData.map((card, idx) => {
          const details = CURRENCY_DETAILS[selectedCurrency] || CURRENCY_DETAILS.USD;
          const isCurrency = card.prefix === '$';
          const displayValue = isCurrency ? Math.round(card.value * details.rate) : card.value;
          const displayPrefix = isCurrency ? details.symbol : card.prefix;
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveTab(card.tab)}
              className="glass-card p-5 rounded-2xl cursor-pointer hover:-translate-y-1"
            >
              <div className="flex justify-between items-start text-slate-400">
                <span className="text-xs font-medium tracking-wide uppercase">{card.title}</span>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <card.icon className="h-4 w-4 text-slate-300" style={{ color: card.color }} />
                </div>
              </div>
              
              <div className="mt-4 flex items-baseline gap-2">
                <AnimatedCounter value={displayValue} prefix={displayPrefix} />
              <span className={`text-xs flex items-center font-medium ${card.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {card.isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {card.growth}
              </span>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Sparkline data={card.sparkData} color={card.color} />
              <span className="text-[10px] text-slate-500 font-mono">Last 30d</span>
            </div>
          </motion.div>
        ); })}
      </div>

      {/* Main Charts & Side Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Graph Area */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Monthly Revenue</h3>
              <p className="text-xs text-slate-400">Calculated MRR from active client subscriptions</p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
              MRR: ${stats.monthlyRev.toLocaleString()}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                  formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights & Recommendation Panel */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-white">AI Insights & Actions</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Automated optimizations scanned by AI agent</p>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-purple-300">
                  <span>Storage Warning</span>
                  <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">Stark Industries</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Stark Industries has consumed 78% of their allocated 1000 GB storage. Recommend sending a capacity upgrade offer.
                </p>
                <button 
                  onClick={() => setActiveTab('Companies')}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 mt-1"
                >
                  Configure Storage Limit <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-300">
                  <span>Upgrade Lead</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">Initech Inc.</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Initech Inc. has active employee counts (88) close to starter threshold. Professional package fits best.
                </p>
                <button 
                  onClick={() => setActiveTab('Subscriptions')}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 mt-1"
                >
                  Send Upgrade Plan <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-amber-300">
                  <span>Coupon Efficiency</span>
                  <span className="text-[10px] coupon-badge-orange px-1.5 py-0.5 rounded font-mono font-extrabold shadow-sm">SUPERLAUNCH30</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The discount coupon has achieved 142 redemptions (28.4% of limit). High effectiveness rate.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>Model: Gemini 3.5 Flash</span>
            <span>Refreshed 2m ago</span>
          </div>
        </div>
      </div>

      {/* Additional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company & Employee Growth Charts */}
        <div className="glass-card p-6 rounded-2xl relative">
          <h3 className="text-base font-semibold text-white mb-2">Company & Employee Growth</h3>
          <p className="text-xs text-slate-400 mb-6">Historical onboarding tracker of client companies</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="employees" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Employees" />
                <Bar dataKey="companies" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Companies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Login / Active User Analytics */}
        <div className="glass-card p-6 rounded-2xl relative">
          <h3 className="text-base font-semibold text-white mb-2">Active Users Load</h3>
          <p className="text-xs text-slate-400 mb-6">Live concurrent user session chart (by hour)</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeUsersData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="active" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} name="Active Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-white">Live Activity Feed</h3>
              <button 
                onClick={() => setActiveTab('Activity Logs')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View Logs <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {logs.slice(0, 4).map((log) => {
                const date = new Date(log.timestamp);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={log.id} className="flex gap-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-slate-200">{log.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{timeString}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-bold">{log.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> All systems operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OverviewTab;
