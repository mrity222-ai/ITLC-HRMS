import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, Plus, Edit2, ShieldAlert, 
  UserPlus, Check, X, ShieldCheck, Eye, Trash2, LogIn,
  Building, Mail, Phone, Calendar, HardDrive, Users,
  ArrowLeft, Activity, ToggleLeft, User, Clock, XCircle
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { Company } from '../types';
import { api } from '../../../services/api';

export const CompaniesTab: React.FC = () => {
  const { 
    companies, setCompanies, plans, addToast, addLog, 
    setImpersonatedCompany, impersonatedCompany,
    isFormDirty, setIsFormDirty
  } = useDashboard();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // View Details Side-panel State
  const [detailsCompany, setDetailsCompany] = useState<Company | null>(null);

  // Custom Delete Confirm State
  const [deleteConfirmCompany, setDeleteConfirmCompany] = useState<{ id: string, name: string } | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; pass: string; companyName: string } | null>(null);

  // platform employee list and attendance lookup
  const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState<any | null>(null);
  const [employeeAttendance, setEmployeeAttendance] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  React.useEffect(() => {
    if (!detailsCompany) {
      setCompanyEmployees([]);
      return;
    }
    const fetchCompanyEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await api.getSuperOwnerCompanyEmployees(detailsCompany.id);
        setCompanyEmployees(data || []);
      } catch (err) {
        console.error("Failed to load company employees:", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchCompanyEmployees();
  }, [detailsCompany]);

  const handleViewEmployeeAttendance = async (emp: any) => {
    setSelectedEmployeeForAttendance(emp);
    setLoadingAttendance(true);
    try {
      const data = await api.getSuperOwnerEmployeeAttendance(emp.id);
      setEmployeeAttendance(data || []);
    } catch (err) {
      console.error("Failed to load employee attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Form Update Helper
  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsFormDirty(true);
  };

  // Carousel drag-to-scroll states
  const carouselOuterRef = React.useRef<HTMLDivElement>(null);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const [carouselStartY, setCarouselStartY] = useState(0);
  const [carouselScrollLeft, setCarouselScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleCarouselMouseDown = (e: React.MouseEvent) => {
    if (!carouselOuterRef.current) return;
    setIsCarouselDragging(true);
    setHasDragged(false);
    setCarouselStartY(e.pageY - carouselOuterRef.current.offsetTop);
    setCarouselScrollLeft(carouselOuterRef.current.scrollTop);
  };

  const handleCarouselMouseMove = (e: React.MouseEvent) => {
    if (!isCarouselDragging || !carouselOuterRef.current) return;
    e.preventDefault();
    const y = e.pageY - carouselOuterRef.current.offsetTop;
    const walk = (y - carouselStartY) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    carouselOuterRef.current.scrollTop = carouselScrollLeft - walk;
  };

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    employeesCount: 50,
    subscriptionPlanId: 'starter',
    storageUsed: 5.0,
    status: 'trial' as Company['status'],
    customPassword: '',
    lat: '',
    lng: '',
    radius: 500
  });

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesSub = subFilter === 'all' || c.subscriptionPlanId === subFilter;
      const matchesDate = !dateFilter || c.createdDate >= dateFilter;

      return matchesSearch && matchesStatus && matchesSub && matchesDate;
    });
  }, [companies, searchTerm, statusFilter, subFilter, dateFilter]);

  // Open Modal to Add
  const handleAddClick = () => {
    setIsFormDirty(false);
    setSelectedCompany(null);
    setFormData({
      name: '',
      ownerName: '',
      email: '',
      phone: '',
      employeesCount: 20,
      subscriptionPlanId: 'free_trial',
      storageUsed: 1.0,
      status: 'trial',
      customPassword: '',
      lat: '',
      lng: '',
      radius: 500
    });
    setIsModalOpen(true);
  };

  // Open Modal to Edit
  const handleEditClick = (company: Company) => {
    setIsFormDirty(false);
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      ownerName: company.ownerName,
      email: company.email,
      phone: company.phone,
      employeesCount: company.employeesCount,
      subscriptionPlanId: company.subscriptionPlanId,
      storageUsed: company.storageUsed,
      status: company.status,
      customPassword: '',
      lat: company.lat !== undefined && company.lat !== null ? company.lat.toString() : '',
      lng: company.lng !== undefined && company.lng !== null ? company.lng.toString() : '',
      radius: company.radius !== undefined && company.radius !== null ? company.radius : 500
    });
    setIsModalOpen(true);
  };

  // Delete Company execution
  const executeDelete = async () => {
    if (!deleteConfirmCompany) return;
    const { id, name } = deleteConfirmCompany;
    try {
      await api.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      addToast(`${name} deleted successfully`, 'success');
      addLog('Company Deleted', `Client company "${name}" was removed from the database.`, 'company');
      if (detailsCompany?.id === id) setDetailsCompany(null);
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    }
    setDeleteConfirmCompany(null);
  };

  // Suspend Company
  const handleSuspend = async (id: string, name: string) => {
    try {
      const updated = await api.updateCompany(id, { status: 'suspended' });
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      addToast(`${name} suspended`, 'warning');
      addLog('Company Suspended', `Company "${name}" status updated to Suspended.`, 'company');
      if (detailsCompany?.id === id) setDetailsCompany(prev => prev ? { ...prev, status: 'suspended' } : null);
    } catch (err: any) {
      addToast(err.message || 'Suspension failed', 'error');
    }
  };

  // Activate Company
  const handleActivate = async (id: string, name: string) => {
    try {
      const updated = await api.updateCompany(id, { status: 'active' });
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      addToast(`${name} activated`, 'success');
      addLog('Company Activated', `Company "${name}" status updated to Active.`, 'company');
      if (detailsCompany?.id === id) setDetailsCompany(prev => prev ? { ...prev, status: 'active' } : null);
    } catch (err: any) {
      addToast(err.message || 'Activation failed', 'error');
    }
  };

  // Expire / End Subscription
  const handleExpire = async (id: string, name: string) => {
    try {
      const updated = await api.updateCompany(id, { status: 'expired' });
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      addToast(`Subscription ended for ${name}`, 'warning');
      addLog('Subscription Expired', `Company "${name}" status updated to Expired.`, 'company');
      if (detailsCompany?.id === id) setDetailsCompany(prev => prev ? { ...prev, status: 'expired' } : null);
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  // Impersonate
  const handleLoginAs = (company: Company) => {
    setImpersonatedCompany(company);
    addToast(`Logged in as Admin for ${company.name}`, 'info');
    addLog('Impersonated Login', `Super Owner logged in as Company Admin for ${company.name}.`, 'security');
  };

  // Submit Modal Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompany) {
      // Edit
      try {
        const updated = await api.updateCompany(selectedCompany.id, {
          name: formData.name,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          employeesCount: Number(formData.employeesCount),
          subscriptionPlanId: formData.subscriptionPlanId,
          storageUsed: Number(formData.storageUsed),
          status: formData.status,
          lat: formData.lat === '' ? null : Number(formData.lat),
          lng: formData.lng === '' ? null : Number(formData.lng),
          radius: Number(formData.radius) || 500
        });
        setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? updated : c));
        addToast(`${formData.name} updated successfully`, 'success');
        addLog('Company Updated', `Company details for "${formData.name}" modified.`, 'company');
      } catch (err: any) {
        addToast(err.message || 'Update failed', 'error');
      }
    } else {
      // Add
      try {
        const result = await api.createCompany({
          name: formData.name,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          employeesCount: Number(formData.employeesCount),
          subscriptionPlanId: formData.subscriptionPlanId,
          storageUsed: Number(formData.storageUsed),
          status: formData.status,
          customPassword: formData.customPassword,
          lat: formData.lat === '' ? null : Number(formData.lat),
          lng: formData.lng === '' ? null : Number(formData.lng),
          radius: Number(formData.radius) || 500
        });

        setCompanies(prev => [...prev, result.company]);
        setGeneratedCredentials({
          email: result.admin.email,
          pass: result.admin.password,
          companyName: result.company.name
        });
        addToast(`${formData.name} created successfully`, 'success');
        addLog('Company Created', `New company "${formData.name}" added to the platform. Password generated.`, 'company');
      } catch (err: any) {
        addToast(err.message || 'Creation failed', 'error');
      }
    }
    setIsFormDirty(false);
    setIsModalOpen(false);
  };

  // CSV Export Function
  const exportToCSV = () => {
    const headers = 'ID,Company Name,Owner,Email,Phone,Employees,Subscription,Storage (GB),Status,Created Date\n';
    const rows = filteredCompanies.map(c => 
      `"${c.id}","${c.name}","${c.ownerName}","${c.email}","${c.phone}",${c.employeesCount},"${c.subscriptionPlanId}",${c.storageUsed},"${c.status}","${c.createdDate}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `SUPEROWNER_Companies_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    addToast('CSV file downloaded', 'success');
    addLog('CSV Exported', 'Companies list exported to CSV format.', 'settings');
  };

  // Status Badge Helper
  const renderStatusBadge = (status: Company['status']) => {
    const styles = {
      active: 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow-sm',
      suspended: 'bg-rose-600 border-rose-500 text-white font-extrabold shadow-sm',
      trial: 'bg-amber-600 border-amber-500 text-white font-extrabold shadow-sm',
      expired: 'bg-slate-600 border-slate-500 text-white font-extrabold shadow-sm'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (detailsCompany) {
    const otherCompanies = companies.filter(c => c.id !== detailsCompany.id);
    const plan = plans.find(p => p.id === detailsCompany.subscriptionPlanId);

    return (
      <div className="space-y-6">
        {/* Header / Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDetailsCompany(null)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Directory
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full ${detailsCompany.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
                {detailsCompany.name} Portal
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Manage details, modules, limits, and workspaces for this company.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLoginAs(detailsCompany)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
            >
              <LogIn className="h-4 w-4" /> Login Workspace
            </button>
          </div>
        </div>

        {/* DRAGGABLE / SCROLLABLE OTHER COMPANIES VERTICAL SIDEBAR CAROUSEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Draggable vertical other companies carousel */}
          <div className="lg:col-span-1 space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Browse Other Companies (Drag or Scroll)</span>
            <div 
              ref={carouselOuterRef}
              onMouseDown={handleCarouselMouseDown}
              onMouseLeave={() => setIsCarouselDragging(false)}
              onMouseUp={() => setIsCarouselDragging(false)}
              onMouseMove={handleCarouselMouseMove}
              className={`glass-card p-3 rounded-2xl border border-slate-200/30 dark:border-white/5 h-[300px] lg:h-[650px] overflow-y-auto scrollbar-thin select-none space-y-3 pb-6 ${
                isCarouselDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ scrollbarWidth: 'thin' }}
            >
              {otherCompanies.map(c => {
                const cPlan = plans.find(p => p.id === c.subscriptionPlanId);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (!hasDragged) {
                        setDetailsCompany(c);
                      }
                    }}
                    className="glass-card p-3.5 rounded-xl border border-slate-200/20 dark:border-white/5 hover:border-indigo-500/30 hover:scale-[1.02] transition cursor-pointer flex items-center gap-3 select-none"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div className={`h-8 w-8 rounded-lg ${c.logo || ''} flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0`}>
                      {(c.name || '').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block truncate text-xs">{c.name}</span>
                      <span className="text-[9px] text-indigo-400 font-semibold block">{cPlan ? cPlan.name : 'No Plan'}</span>
                      <span className="text-[9px] text-slate-500 block font-mono">Emp: {c.employeesCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROFILE PORTAL DETAILED PANEL GRID */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Column 1: Info Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-white/5 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`h-20 w-20 rounded-2xl ${detailsCompany.logo || ''} flex items-center justify-center font-bold text-white text-3xl shadow-lg`}>
                    {(detailsCompany.name || '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">{detailsCompany.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 inline-block">CLIENT ID: {detailsCompany.id}</span>
                  </div>
                  {renderStatusBadge(detailsCompany.status)}
                </div>

                <div className="space-y-4 border-t border-slate-200/20 dark:border-white/5 pt-4 text-sm text-slate-300">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact & Registration</h4>
                  
                  <div className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Owner / Admin</span>
                      <span className="font-medium text-white">{detailsCompany.ownerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Email Address</span>
                      <span className="font-medium text-white font-mono break-all">{detailsCompany.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Phone Connection</span>
                      <span className="font-medium text-white">{detailsCompany.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Registration Date</span>
                      <span className="font-medium text-white">{detailsCompany.createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status / Suspend Action card */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-white/5 space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Management Actions</h4>
                
                <div className="flex flex-col gap-2">
                  {detailsCompany.status === 'active' || detailsCompany.status === 'trial' ? (
                    <>
                      <button
                        onClick={() => handleSuspend(detailsCompany.id, detailsCompany.name)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 transition cursor-pointer"
                      >
                        <ShieldAlert className="h-4 w-4" /> Suspend Tenant Account
                      </button>
                      <button
                        onClick={() => handleExpire(detailsCompany.id, detailsCompany.name)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl bg-slate-600/10 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-500/20 transition cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" /> End Subscription (Expire)
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleActivate(detailsCompany.id, detailsCompany.name)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/20 transition cursor-pointer"
                    >
                      <ShieldCheck className="h-4 w-4" /> Activate / Start Subscription
                    </button>
                  )}
                  
                  <button
                    onClick={() => setDeleteConfirmCompany({ id: detailsCompany.id, name: detailsCompany.name })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl bg-rose-600/25 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 transition"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Company Tenant
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2 & 3: Usage Limits and Feature flags config */}
            <div className="md:col-span-2 space-y-6">
              {/* Usage Limits Card */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-white/5 space-y-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Activity className="h-4 w-4 text-indigo-400" /> Usage Capacity & Limits</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employees limit */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400"><Users className="h-4 w-4 text-indigo-400" /> Employee Licenses</span>
                      <span className="text-white font-mono">{detailsCompany.employeesCount} Active / Unlimited</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-normal">Currently utilizing 45% of allocated client manager seats.</span>
                  </div>

                  {/* Storage limit */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400"><HardDrive className="h-4 w-4 text-emerald-400" /> Cloud Media Storage</span>
                      <span className="text-white font-mono">{(detailsCompany.storageUsed || 0).toFixed(1)} GB / 50.0 GB</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((detailsCompany.storageUsed || 0) / 50) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-normal">Utilized {((detailsCompany.storageUsed || 0) / 50 * 100).toFixed(1)}% of secure workspace storage limit.</span>
                  </div>
                </div>
              </div>

              {/* Feature Flags Module switch list */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ToggleLeft className="h-4 w-4 text-indigo-400" /> Modular Settings & Feature Toggles</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Directly toggle features for this company. These sync instantly across their portal viewports.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'attendance', name: 'Attendance & Check-in', desc: 'Allows biometric verification, self-reporting loggers, and webcam checkins.' },
                    { id: 'leave', name: 'Leave & PTO Planner', desc: 'Manage leave matrices, auto-approval configurations, and custom calendar overlays.' },
                    { id: 'payroll', name: 'Payroll & Invoicing', desc: 'Enables payslips generations, tax deductions, and bank payouts integrations.' },
                    { id: 'aiReports', name: 'AI Insights & Reports', desc: 'Activates LLM recommendation systems to write analytics briefings.' },
                    { id: 'geofencing', name: 'GPS Geofencing Tracker', desc: 'Locks punch-ins to specific office coordinates or site perimeter areas.' },
                    { id: 'mobileApp', name: 'Mobile App Support', desc: 'Allows employee check-ins via iOS & Android native apps.' },
                    { id: 'whiteLabeling', name: 'White-Label Branding', desc: 'Enables custom domain mappings, portal favicons, and corporate colors overrides.' },
                    { id: 'performance', name: 'Performance Appraisals', desc: 'Activates 360 review workflows, OKR trackers, and peer assessments.' }
                  ].map(flag => {
                    const isEnabled = detailsCompany.modulesEnabled ? detailsCompany.modulesEnabled[flag.id] !== false : true;
                    
                    return (
                      <div 
                        key={flag.id}
                        onClick={() => {
                          const nextFeatures = {
                            ...(detailsCompany.modulesEnabled || {}),
                            [flag.id]: !isEnabled
                          };
                          const updated = {
                            ...detailsCompany,
                            modulesEnabled: nextFeatures
                          };
                          setDetailsCompany(updated);
                          const index = companies.findIndex(c => c.id === detailsCompany.id);
                          if (index !== -1) {
                            const nextCompanies = [...companies];
                            nextCompanies[index] = updated;
                            setCompanies(nextCompanies);
                            addToast(`Toggled ${flag.name} for ${detailsCompany.name}`, 'success');
                            addLog('Module Config Adjusted', `Toggled module flag ${flag.id} to ${!isEnabled ? 'enabled' : 'disabled'} for company ${detailsCompany.name}.`, 'company');
                          }
                        }}
                        className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer select-none transition ${
                          (() => {
                            if (!isEnabled) return 'bg-white/1 border-white/5 text-slate-500';
                            switch (flag.id) {
                              case 'payroll': return 'bg-amber-500/5 border-amber-500/35 text-slate-200 shadow-[0_0_15px_-3px_rgba(245,158,11,0.12)]';
                              case 'attendance': return 'bg-sky-500/5 border-sky-500/35 text-slate-200 shadow-[0_0_15px_-3px_rgba(14,165,233,0.12)]';
                              case 'geofencing': return 'bg-rose-500/5 border-rose-500/35 text-slate-200 shadow-[0_0_15px_-3px_rgba(244,63,94,0.12)]';
                              default: return 'bg-indigo-500/5 border-indigo-500/20 text-slate-200 shadow-[0_0_15px_-3px_rgba(99,102,241,0.05)]';
                            }
                          })()
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <span className={`text-xs block leading-none ${
                            (() => {
                              if (!isEnabled) return 'text-slate-400 font-semibold';
                              switch (flag.id) {
                                case 'payroll': return 'text-amber-400 dark:text-amber-300 font-extrabold';
                                case 'attendance': return 'text-sky-400 dark:text-sky-300 font-extrabold';
                                case 'geofencing': return 'text-rose-400 dark:text-rose-300 font-extrabold';
                                default: return 'text-white font-semibold';
                              }
                            })()
                          }`}>{flag.name}</span>
                          <span className="text-[9px] text-slate-500 block leading-normal">{flag.desc}</span>
                        </div>
                        
                        <div className={`h-4.5 w-9 rounded-full p-0.5 transition flex-shrink-0 ${
                          (() => {
                            if (!isEnabled) return 'bg-slate-800';
                            switch (flag.id) {
                              case 'payroll': return 'bg-amber-500';
                              case 'attendance': return 'bg-sky-500';
                              case 'geofencing': return 'bg-rose-500';
                              default: return 'bg-indigo-600';
                            }
                          })()
                        }`}>
                          <div className={`h-3.5 w-3.5 rounded-full bg-white transition ${isEnabled ? 'translate-x-4.5' : ''}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Employees Directory */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/30 dark:border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Employee Directory ({companyEmployees.length})</h3>
              <p className="text-slate-400 text-xs mt-0.5">Click on an employee to inspect their attendance history & logs.</p>
            </div>
            {loadingEmployees && <div className="text-xs text-indigo-400">Loading employees...</div>}
          </div>

          {companyEmployees.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No employees registered for this company.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/15 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Employee ID</th>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {companyEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono text-indigo-400">{emp.id}</td>
                      <td className="py-3 font-semibold">{emp.name}</td>
                      <td className="py-3 font-mono">{emp.email}</td>
                      <td className="py-3">{emp.role}</td>
                      <td className="py-3">{emp.department || 'General'}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          emp.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleViewEmployeeAttendance(emp)}
                          className="px-3 py-1 bg-indigo-600/25 hover:bg-indigo-600/50 text-indigo-300 font-semibold border border-indigo-500/35 rounded-lg transition cursor-pointer"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Companies Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage subscription status, limits, and system configurations for registered tenants.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white hover:bg-purple-50 text-purple-600 transition shadow border border-purple-200"
          >
            <Plus className="h-4 w-4 text-purple-500" /> Add Company
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, owner, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-10 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-400 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          {/* Subscription Filter */}
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-lg text-xs text-slate-300"
          >
            <option value="all">All Plans</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-lg text-xs text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-lg text-xs text-slate-300"
          />
        </div>
      </div>

      {/* Main Companies Table & Side Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Section */}
        <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${detailsCompany ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                  <th className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-fuchsia-600 border border-fuchsia-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-fuchsia-700">
                        S.No.
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-5">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 border border-blue-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-blue-700">
                      Company
                    </span>
                  </th>
                  <th className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-600 border border-purple-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-purple-700">
                      Owner
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-600 border border-teal-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-teal-700">
                        Employees
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-600 border border-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-amber-700">
                      Subscription
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 border border-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-emerald-700">
                        Storage
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-600 border border-rose-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-rose-700">
                      Status
                    </span>
                  </th>
                  <th className="py-3 px-5 text-right">
                    <div className="flex justify-end">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 border border-indigo-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md transition select-none hover:bg-indigo-700">
                        Actions
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Building className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-40" />
                      No companies match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((c, index) => {
                    const plan = plans.find(p => p.id === c.subscriptionPlanId);
                    return (
                      <tr 
                        key={c.id} 
                        className="hover:bg-white/2 transition group cursor-pointer"
                        onClick={() => setDetailsCompany(c)}
                      >
                        {/* Serial Number */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-400 font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        {/* Logo & Name */}
                        <td className="py-4 px-5 flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${c.logo || ''} flex items-center justify-center font-bold text-white text-xs shadow-md`}>
                            {(c.name || '').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white block group-hover:text-indigo-400 transition">{c.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
                          </div>
                        </td>
                        
                        {/* Owner & Contact */}
                        <td className="py-4 px-4">
                          <span className="block font-medium text-slate-200">{c.ownerName}</span>
                          <span className="text-xs text-slate-400 block">{c.email}</span>
                        </td>

                        {/* Employee count */}
                        <td className="py-4 px-4 text-center font-mono font-medium">
                          {c.employeesCount}
                        </td>

                        {/* Subscription */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-indigo-400">{plan ? plan.name : 'Unknown Plan'}</span>
                          <span className="text-[10px] text-slate-500 block">Joined {c.createdDate}</span>
                        </td>

                        {/* Storage */}
                        <td className="py-4 px-4 text-center font-mono">
                          {(c.storageUsed || 0).toFixed(1)} GB
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {renderStatusBadge(c.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            {/* Impersonate */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLoginAs(c); }}
                              title="Login as Company Admin"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 text-slate-300 transition"
                            >
                              <LogIn className="h-3.5 w-3.5" />
                            </button>

                            {/* View details */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setDetailsCompany(c); }}
                              title="View Details"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/10 text-slate-300 transition"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
                              title="Edit Company"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 text-slate-300 transition"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Status toggle */}
                            {c.status === 'active' || c.status === 'trial' ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSuspend(c.id, c.name); }}
                                  title="Suspend Company"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 hover:text-white border border-white/10 text-slate-300 transition cursor-pointer"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleExpire(c.id, c.name); }}
                                  title="End Subscription (Expire)"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-slate-600 hover:text-white border border-white/10 text-slate-300 transition cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleActivate(c.id, c.name); }}
                                title="Activate Company"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/10 text-slate-300 transition cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmCompany({ id: c.id, name: c.name }); }}
                              title="Delete Company"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600 hover:text-white border border-white/10 text-rose-400 hover:text-white transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit / Create Company Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 rounded-2xl space-y-6 relative overflow-y-auto max-h-[90vh] border border-white/10"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-2xl pointer-events-none"></div>
              
              <button 
                onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white">{selectedCompany ? 'Edit Tenant Company' : 'Add New Client Tenant'}</h3>
                <p className="text-xs text-slate-400 mt-1">Configure profile details and license status.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateForm({ name: e.target.value })}
                      placeholder="e.g. Wayne Enterprises"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Owner Name</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => updateForm({ ownerName: e.target.value })}
                      placeholder="e.g. Bruce Wayne"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Phone</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => updateForm({ phone: e.target.value })}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="e.g. bruce@wayne.com"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Employee Count</label>
                    <input
                      type="number"
                      required
                      value={formData.employeesCount}
                      onChange={(e) => updateForm({ employeesCount: Number(e.target.value) })}
                      placeholder="e.g. 150"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Subscription Plan</label>
                    <select
                      value={formData.subscriptionPlanId}
                      onChange={(e) => updateForm({ subscriptionPlanId: e.target.value })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Storage Allocated (GB)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={formData.storageUsed}
                      onChange={(e) => updateForm({ storageUsed: Number(e.target.value) })}
                      placeholder="e.g. 50"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateForm({ status: e.target.value as Company['status'] })}
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="trial">Trial</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  {/* Geofencing configuration */}
                  <div className="space-y-1.5 col-span-2 border-t border-white/5 pt-3 mt-2">
                    <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Geofence Attendance Setting</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => updateForm({ lat: e.target.value })}
                      placeholder="e.g. 28.6139"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => updateForm({ lng: e.target.value })}
                      placeholder="e.g. 77.2090"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs text-slate-400 font-medium">Radius (in meters)</label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) => updateForm({ radius: Number(e.target.value) })}
                      placeholder="e.g. 500"
                      className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                    />
                  </div>

                  {!selectedCompany && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs text-slate-400 font-medium">Custom Admin Password (Optional)</label>
                      <input
                        type="password"
                        value={formData.customPassword}
                        onChange={(e) => updateForm({ customPassword: e.target.value })}
                        placeholder="Leave blank to generate temporary password automatically"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setIsFormDirty(false); }}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-4 relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-rose-500/10 blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 text-rose-500">
                <ShieldAlert className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold text-white font-sans">Delete Tenant Company</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Are you sure you want to delete <span className="font-extrabold text-white font-mono">{deleteConfirmCompany.name}</span>? This action is permanent and cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmCompany(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-slate-200/20 dark:border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-md shadow-rose-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generated Credentials Popup Modal */}
      <AnimatePresence>
        {generatedCredentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-5 relative overflow-y-auto max-h-[90vh] border border-white/10"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 text-emerald-400">
                <Check className="h-6 w-6 shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20 shadow-md" />
                <h3 className="text-lg font-bold text-white font-sans">Tenant Login Generated</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                A new database tenant workspace has been registered for <span className="font-extrabold text-white font-mono">{generatedCredentials.companyName}</span>. Use the following generated credentials to log in as Company Admin:
              </p>

              <div className="space-y-3 bg-white/2 p-3.5 rounded-xl border border-white/5 font-sans">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Admin Email Address</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1">
                    <span className="text-xs font-semibold text-slate-200 block font-mono">{generatedCredentials.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.email);
                        addToast('Email copied to clipboard!', 'success');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Generated Admin Password</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1">
                    <span className="text-xs font-bold text-emerald-400 font-mono tracking-wide">{generatedCredentials.pass}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.pass);
                        addToast('Password copied to clipboard!', 'success');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 leading-normal font-sans">
                Note: The company owner has been added as the chief workspace administrator.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setGeneratedCredentials(null)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-650/30"
                >
                  Understood & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance History Modal */}
      <AnimatePresence>
        {selectedEmployeeForAttendance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#11131a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl font-sans"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
                <div>
                  <h3 className="text-md font-bold text-white">Attendance Logs: {selectedEmployeeForAttendance.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">EMPLOYEE ID: {selectedEmployeeForAttendance.id} | ROLE: {selectedEmployeeForAttendance.role}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployeeForAttendance(null)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[450px] overflow-y-auto space-y-4 scrollbar-thin">
                {loadingAttendance ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Loading attendance database records...
                  </div>
                ) : employeeAttendance.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No attendance records logged for this employee.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[9px]">
                          <th className="pb-2 font-semibold">Date</th>
                          <th className="pb-2 font-semibold">Punch In</th>
                          <th className="pb-2 font-semibold">Punch Out</th>
                          <th className="pb-2 font-semibold">Break</th>
                          <th className="pb-2 font-semibold">Work Hours</th>
                          <th className="pb-2 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {employeeAttendance.map((rec, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 font-semibold">{rec.date}</td>
                            <td className="py-2.5 text-emerald-400 font-mono">{rec.checkIn || '--:--:--'}</td>
                            <td className="py-2.5 text-rose-400 font-mono">{rec.checkOut || '--:--:--'}</td>
                            <td className="py-2.5 font-mono">{rec.breakDuration || '00:00:00'}</td>
                            <td className="py-2.5 font-mono font-semibold">{rec.workHours || '00:00:00'}</td>
                            <td className="py-2.5 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                rec.status === 'Present' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : rec.status === 'Late'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {rec.status || 'Present'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CompaniesTab;
