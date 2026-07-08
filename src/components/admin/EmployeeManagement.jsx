import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { 
  Plus, Search, Edit3, Trash2, ShieldCheck, ShieldAlert, Download, 
  Upload, X, Check, FileText, Image, Mail, Phone, MapPin, ArrowLeft,
  Key, User, Calendar, Briefcase, DollarSign, Award, Star, Clock, Laptop, Eye, EyeOff
} from 'lucide-react';

export default function EmployeeManagement({ employees, setEmployees, searchQuery, initialSelectedEmpId, subTab }) {
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [desgFilter, setDesgFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Navigation & Sub-views mode state
  const [viewMode, setViewMode] = useState(initialSelectedEmpId ? 'profile' : 'list'); // 'list', 'add', 'edit', 'profile', 'delete'
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(
    initialSelectedEmpId 
      ? employees.find(e => e.id === initialSelectedEmpId) 
      : null
  );

  useEffect(() => {
    if (subTab === 'profile') {
      setViewMode('profile');
      if (!selectedProfile && employees.length > 0) {
        // Automatically default to the first employee if none is selected
        setSelectedProfile(employees[0]);
      }
    } else if (subTab === 'directory') {
      setViewMode('list');
    }
  }, [subTab, employees]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [profileNotes, setProfileNotes] = useState([
    { text: 'Completed advanced UI patterns certification course.', date: 'June 20, 2026' },
    { text: 'Shipped MacBook Pro 16" device to residence.', date: 'Jan 10, 2026' }
  ]);
  const [noteInput, setNoteInput] = useState('');
  
  // Form variables
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedEmpCredentials, setGeneratedEmpCredentials] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newSystemRole, setNewSystemRole] = useState('Employee');
  const [newDept, setNewDept] = useState('Engineering');
  const [newStatus, setNewStatus] = useState('Active');
  const [newPhone, setNewPhone] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState('Personal Info');
  const [newDob, setNewDob] = useState('1992-08-24');
  const [newGender, setNewGender] = useState('Male');
  const [newAddress, setNewAddress] = useState('482 Silver Lake Blvd, Los Angeles, CA 90026');
  const [newPrimaryContact, setNewPrimaryContact] = useState('Jane Wright (Spouse) - +1 (555) 382-9029');
  const [newSecondaryContact, setNewSecondaryContact] = useState('Robert Wright (Father) - +1 (555) 492-0210');
  const [newBankName, setNewBankName] = useState('ITLC Silicon Bank, NA');
  const [newAccountNumber, setNewAccountNumber] = useState('30234928430');
  const [newIfsc, setNewIfsc] = useState('ISB000492');
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [isAcctUnmasked, setIsAcctUnmasked] = useState(false);
  const [newManager, setNewManager] = useState('None');
  const [newCustomDept, setNewCustomDept] = useState('');
  const [showCustomDeptInput, setShowCustomDeptInput] = useState(false);
  const [newPermissions, setNewPermissions] = useState({
    viewDirectory: true,
    editProfile: true,
    viewPayroll: false,
    manageDocs: true
  });
  
  const filteredEmployees = employees.filter(emp => {
    if (!emp) return false;
    const query = localSearch || searchQuery || '';
    
    const nameVal = emp.name || '';
    const emailVal = emp.email || '';
    const descVal = emp.designation || emp.role || '';
    
    const matchesSearch = nameVal.toLowerCase().includes(query.toLowerCase()) || 
                          emailVal.toLowerCase().includes(query.toLowerCase()) ||
                          descVal.toLowerCase().includes(query.toLowerCase());
                          
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    
    // Fallback branch / type mappings based on numeric ID
    const empIdNum = parseInt(emp.id?.replace(/\D/g, '') || '0') || 0;
    const empBranch = empIdNum % 2 === 0 ? 'New York HQ' : 'London Tech Hub';
    const empType = empIdNum % 3 === 0 ? 'Contract' : empIdNum % 4 === 0 ? 'Intern' : 'Full-time';
    
    const matchesDesg = desgFilter === 'All' || descVal === desgFilter;
    const matchesBranch = branchFilter === 'All' || empBranch === branchFilter;
    const matchesType = typeFilter === 'All' || empType === typeFilter;
    
    return matchesSearch && matchesDept && matchesStatus && matchesDesg && matchesBranch && matchesType;
  });

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newRole) return;
    
    try {
      const result = await api.createEmployee({
        name: newName,
        email: newEmail,
        role: newRole,
        systemRole: newSystemRole,
        department: showCustomDeptInput ? newCustomDept : newDept,
        salary: `$${newSalary || '75,000'}`,
        phone: newPhone || '+1 (555) 019-2834',
        reportingManager: newManager,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150&auto=format&fit=crop&q=80`,
        password: newPassword
      });

      setEmployees([result.employee, ...employees]);
      setGeneratedEmpCredentials({
        id: result.employee.id,
        email: result.employee.email,
        pass: result.generatedPassword || newPassword,
        employeeName: result.employee.name
      });
      resetForm();
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const handleStartEdit = (emp) => {
    setEditingEmployee(emp);
    setNewName(emp.name);
    setNewEmail(emp.email);
    setNewRole(emp.designation || emp.role || '');
    setNewSystemRole(emp.role || 'Employee');
    setNewDept(emp.department);
    setNewStatus(emp.status);
    setNewPhone(emp.phone || '');
    setNewSalary(emp.salary ? emp.salary.replace('$', '').replace(/,/g, '') : '');
    setNewDob(emp.dob || '1992-08-24');
    setNewGender(emp.gender || 'Male');
    setNewAddress(emp.address || '482 Silver Lake Blvd, Los Angeles, CA 90026');
    setNewPrimaryContact(emp.primaryContact || 'Jane Wright (Spouse) - +1 (555) 382-9029');
    setNewSecondaryContact(emp.secondaryContact || 'Robert Wright (Father) - +1 (555) 492-0210');
    setNewBankName(emp.bankName || 'ITLC Silicon Bank, NA');
    setNewAccountNumber(emp.accountNumber || '30234928430');
    setNewIfsc(emp.ifsc || 'ISB000492');
    setNewManager(emp.reportingManager || 'None');
    setNewPermissions(emp.permissions || {
      viewDirectory: true,
      editProfile: true,
      viewPayroll: false,
      manageDocs: true
    });
    setViewMode('edit');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateEmployee(editingEmployee.id, {
        name: newName, 
        email: newEmail, 
        role: newSystemRole, 
        designation: newRole,
        department: showCustomDeptInput ? newCustomDept : newDept, 
        status: newStatus, 
        phone: newPhone, 
        salary: `$${Number(newSalary).toLocaleString()}`,
        dob: newDob,
        gender: newGender,
        address: newAddress,
        primaryContact: newPrimaryContact,
        secondaryContact: newSecondaryContact,
        bankName: newBankName,
        accountNumber: newAccountNumber,
        ifsc: newIfsc,
        reportingManager: newManager,
        permissions: newPermissions
      });

      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updated : emp));
      resetForm();
      setEditingEmployee(null);
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    }
  };

  const handleDeleteEmployee = (id) => {
    setConfirmDeleteId(id);
    setViewMode('delete');
  };

  const handleConfirmDelete = async () => {
    try {
      await api.deleteEmployee(confirmDeleteId);
      setEmployees(employees.filter(emp => emp.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      setViewMode('list');
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewRole('');
    setNewSystemRole('Employee');
    setNewDept('Engineering');
    setNewStatus('Active');
    setNewPhone('');
    setNewSalary('');
    setNewDob('1992-08-24');
    setNewGender('Male');
    setNewAddress('482 Silver Lake Blvd, Los Angeles, CA 90026');
    setNewPrimaryContact('Jane Wright (Spouse) - +1 (555) 382-9029');
    setNewSecondaryContact('Robert Wright (Father) - +1 (555) 492-0210');
    setNewBankName('ITLC Silicon Bank, NA');
    setNewAccountNumber('30234928430');
    setNewIfsc('ISB000492');
    setNewManager('None');
    setNewCustomDept('');
    setNewPassword('');
    setShowCustomDeptInput(false);
    setNewPermissions({
      viewDirectory: true,
      editProfile: true,
      viewPayroll: false,
      manageDocs: true
    });
  };

  const handleExport = () => {
    alert("Exporting CSV file: employee_records_july2026.csv downloaded successfully!");
  };

  const handleImport = () => {
    alert("CSV File Import simulated. 5 records appended to database!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Directory List View */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Total Employees</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6 }} className="number-font">
                  {employees.length}
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Active Employees</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-success)' }} className="number-font">
                  {employees.filter(e => e.status === 'Active').length}
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>New Joiners (30d)</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-primary)' }} className="number-font">
                  4
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>On Notice Period</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-warning)' }} className="number-font">
                  1
                </h4>
              </div>
              <div className="premium-card" style={{ padding: 20 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Interns & Trainees</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 6, color: 'var(--color-accent)' }} className="number-font">
                  2
                </h4>
              </div>
            </div>

            {/* Search Bar & Filters Block */}
            <div className="premium-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Search input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.01)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '4px 14px' }}>
                <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                <input 
                  type="text" 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="premium-input"
                  style={{ border: 'none', background: 'transparent', padding: '8px 0', width: '100%', outline: 'none', boxShadow: 'none' }}
                  placeholder="Search by employee name, email, or designation..."
                />
                {localSearch && (
                  <button onClick={() => setLocalSearch('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filters & Actions Sub-row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Department</label>
                    <select 
                      value={deptFilter} 
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Designation</label>
                    <select 
                      value={desgFilter} 
                      onChange={(e) => setDesgFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Designations</option>
                      <option value="Senior UX Designer">Senior UX Designer</option>
                      <option value="Engineering Tech Lead">Engineering Tech Lead</option>
                      <option value="Growth Lead Analyst">Growth Analyst</option>
                      <option value="Sales Partner">Sales Partner</option>
                      <option value="HR Director">HR Director</option>
                      <option value="Operations Director">Ops Director</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Branch Location</label>
                    <select 
                      value={branchFilter} 
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Branches</option>
                      <option value="New York HQ">New York HQ</option>
                      <option value="London Tech Hub">London Tech Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="premium-label" style={{ marginBottom: 4 }}>Employment Type</label>
                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="premium-input"
                    >
                      <option value="All">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button onClick={handleImport} className="premium-btn premium-btn-secondary" style={{ padding: '8px 14px' }}>
                    <Upload size={14} />
                    <span>Import</span>
                  </button>
                  <button onClick={handleExport} className="premium-btn premium-btn-secondary" style={{ padding: '8px 14px' }}>
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                  <button onClick={() => setViewMode('add')} className="premium-btn premium-btn-primary" style={{ padding: '8px 16px' }}>
                    <Plus size={16} />
                    <span>Add Employee</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Employee Cards Grid with internal scroll */}
            <div style={{ maxHeight: '650px', overflowY: 'auto', paddingRight: '8px', paddingBottom: '16px' }} className="premium-scrollbar">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {filteredEmployees.map((emp) => {
                  if (!emp) return null;
                  return (
                    <div 
                      key={emp.id} 
                      className="premium-card" 
                      style={{ 
                        padding: 20, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        textAlign: 'center',
                        gap: 14,
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => { setSelectedProfile(emp); setViewMode('profile'); }}
                    >
                      {/* Status Badge */}
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : emp.status === 'On Leave' ? 'badge-warning' : 'badge-danger'}`} style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.65rem' }}>
                        {emp.status}
                      </span>

                      {/* Avatar */}
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover', marginTop: 10 }} 
                      />

                      {/* Info */}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{emp.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{emp.email}</p>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{emp.department}</span>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{emp.designation || emp.role}</span>
                        {emp.role && emp.role !== 'Employee' && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{emp.role}</span>
                        )}
                      </div>

                      <div className="number-font" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {emp.salary}
                      </div>

                      {/* Action row */}
                      <div 
                        style={{ 
                          display: 'flex', 
                          gap: 12, 
                          width: '100%', 
                          borderTop: '1px solid var(--color-border)', 
                          paddingTop: 12,
                          justifyContent: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => { setSelectedProfile(emp); setViewMode('profile'); }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4 }}
                          title="View Profile"
                        >
                          <User size={15} />
                        </button>
                        <button 
                          onClick={() => handleStartEdit(emp)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 4 }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </div>
                  );
                })}
                
                {filteredEmployees.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                    No employees matching filters or search queries.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: Add Employee View */}
        {viewMode === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                onClick={() => { setViewMode('list'); resetForm(); }}
                className="premium-btn premium-btn-secondary"
                style={{ padding: 8, borderRadius: 10 }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add New Employee</h3>
            </div>

            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="premium-form-group">
                <label className="premium-label">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="premium-input" 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="premium-input" 
                  placeholder="e.g. john@company.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Role</label>
                  <input 
                    type="text" 
                    required 
                    value={newRole} 
                    onChange={(e) => setNewRole(e.target.value)} 
                    className="premium-input" 
                    placeholder="e.g. Tech Lead"
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Department</span>
                    <button 
                      type="button" 
                      onClick={() => setShowCustomDeptInput(!showCustomDeptInput)} 
                      style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                    >
                      {showCustomDeptInput ? "Use List" : "Add Custom"}
                    </button>
                  </label>
                  {showCustomDeptInput ? (
                    <input 
                      type="text" 
                      required 
                      value={newCustomDept} 
                      onChange={(e) => setNewCustomDept(e.target.value)} 
                      className="premium-input" 
                      placeholder="Type custom department..." 
                    />
                  ) : (
                    <select 
                      value={newDept} 
                      onChange={(e) => setNewDept(e.target.value)} 
                      className="premium-input"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product Engineering">Product Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Base Salary (USD/yr)</label>
                  <input 
                    type="number" 
                    value={newSalary} 
                    onChange={(e) => setNewSalary(e.target.value)} 
                    className="premium-input" 
                    placeholder="75,000"
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Status</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Reporting Manager</label>
                  <select 
                    value={newManager} 
                    onChange={(e) => setNewManager(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="None">None</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation || emp.role})</option>
                    ))}
                  </select>
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">System Access Role</label>
                  <select 
                    value={newSystemRole} 
                    onChange={(e) => setNewSystemRole(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="Employee">Employee (Staff)</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR Officer</option>
                    <option value="Company Admin">Company Admin</option>
                  </select>
                </div>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Custom Password (Optional)</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="premium-input"
                  placeholder="Leave blank to auto-generate temporary password"
                />
              </div>

              {/* System Role Access Permissions Matrix */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="premium-label" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Role Access & Permissions Configuration</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewDirectory} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewDirectory: e.target.checked })} 
                    />
                    <span>Read Directory (Full Access)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.editProfile} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, editProfile: e.target.checked })} 
                    />
                    <span>Edit Profile Settings</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewPayroll} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewPayroll: e.target.checked })} 
                    />
                    <span>Access Payroll & Bank Details</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.manageDocs} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, manageDocs: e.target.checked })} 
                    />
                    <span>Manage Document Vault</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                <button type="button" onClick={() => { setViewMode('list'); resetForm(); }} className="premium-btn premium-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Create Record
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 3: Edit Employee View */}
        {viewMode === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                onClick={() => { setViewMode('list'); resetForm(); }}
                className="premium-btn premium-btn-secondary"
                style={{ padding: 8, borderRadius: 10 }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Employee Profile</h3>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* SECTION A: Personal & Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Personal & Contact Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Full Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Email Address</label>
                    <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Mobile Number</label>
                    <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Date of Birth</label>
                    <input type="text" value={newDob} onChange={(e) => setNewDob(e.target.value)} className="premium-input" placeholder="e.g. 1992-08-24" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Gender</label>
                    <input type="text" value={newGender} onChange={(e) => setNewGender(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Residential Address</label>
                    <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="premium-input" />
                  </div>
                </div>
              </div>

              {/* SECTION B: Emergency Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Emergency Contacts</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Primary Contact</label>
                    <input type="text" value={newPrimaryContact} onChange={(e) => setNewPrimaryContact(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Secondary Contact</label>
                    <input type="text" value={newSecondaryContact} onChange={(e) => setNewSecondaryContact(e.target.value)} className="premium-input" />
                  </div>
                </div>
              </div>

              {/* SECTION C: Work & Compensation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Work & Compensation</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Designation / Role</label>
                    <input type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Department</span>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomDeptInput(!showCustomDeptInput)} 
                        style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                      >
                        {showCustomDeptInput ? "Use List" : "Add Custom"}
                      </button>
                    </label>
                    {showCustomDeptInput ? (
                      <input 
                        type="text" 
                        required 
                        value={newCustomDept} 
                        onChange={(e) => setNewCustomDept(e.target.value)} 
                        className="premium-input" 
                        placeholder="Type custom department..." 
                      />
                    ) : (
                      <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="premium-input">
                        <option value="Engineering">Engineering</option>
                        <option value="Product Engineering">Product Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                      </select>
                    )}
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Base Salary (USD/yr)</label>
                    <input type="text" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="premium-input">
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Reporting Manager</label>
                    <select value={newManager} onChange={(e) => setNewManager(e.target.value)} className="premium-input">
                      <option value="None">None</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation || emp.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">System Access Role</label>
                    <select value={newSystemRole} onChange={(e) => setNewSystemRole(e.target.value)} className="premium-input">
                      <option value="Employee">Employee (Staff)</option>
                      <option value="Manager">Manager</option>
                      <option value="HR">HR Officer</option>
                      <option value="Company Admin">Company Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION D: Bank Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Bank Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Bank Name</label>
                    <input type="text" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Account Number</label>
                    <input type="text" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} className="premium-input" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">IFSC / Routing Code</label>
                    <input type="text" value={newIfsc} onChange={(e) => setNewIfsc(e.target.value)} className="premium-input" />
                  </div>
                </div>
              </div>

              {/* SECTION E: System Role Access Permissions Matrix */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="premium-label" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Role Access & Permissions Configuration</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewDirectory} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewDirectory: e.target.checked })} 
                    />
                    <span>Read Directory (Full Access)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.editProfile} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, editProfile: e.target.checked })} 
                    />
                    <span>Edit Profile Settings</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.viewPayroll} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, viewPayroll: e.target.checked })} 
                    />
                    <span>Access Payroll & Bank Details</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newPermissions.manageDocs} 
                      onChange={(e) => setNewPermissions({ ...newPermissions, manageDocs: e.target.checked })} 
                    />
                    <span>Manage Document Vault</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                <button type="button" onClick={() => { setViewMode('list'); resetForm(); }} className="premium-btn premium-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
          </motion.div>
        )}        {/* VIEW 4: Profile Detail View */}
        {viewMode === 'profile' && selectedProfile && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                onClick={() => { setViewMode('list'); setSelectedProfile(null); }}
                className="premium-btn premium-btn-secondary"
                style={{ padding: 8, borderRadius: 10 }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Employee Profile Dossier</h3>
            </div>

            {/* Layout Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: 24,
              alignItems: 'start'
            }}>
              
              {/* LEFT COLUMN: Identity, Actions, & Sidebar Sub-Navigation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Profile Identity Card */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800
                  }}>
                    {selectedProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{selectedProfile.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'block', marginTop: 4 }}>
                      Employee ID: EMP-2026-{selectedProfile.id + 400}
                    </span>
                    <span className="badge badge-info" style={{ marginTop: 8, fontSize: '0.65rem' }}>
                      {selectedProfile.department || 'Product Engineering'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions Console */}
                <div className="premium-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => handleStartEdit(selectedProfile)} className="premium-btn premium-btn-primary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                    <span>Edit Profile</span>
                  </button>
                  <button onClick={() => alert("Password reset trigger email sent to employee.")} className="premium-btn premium-btn-secondary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                    <span>Change Password</span>
                  </button>
                  <button onClick={() => setShowIdCardModal(true)} className="premium-btn premium-btn-secondary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                    <span>Generate ID Pass</span>
                  </button>
                </div>

                {/* Sidebar Navigation Options */}
                <div className="premium-card" style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Personal Info', 'Employment Details', 'Documents Vault', 'Bank Details'
                  ].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveProfileTab(tab)}
                      className={`premium-btn ${activeProfileTab === tab ? 'chrome-box-active' : 'chrome-box-inactive'}`}
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.8rem',
                        borderRadius: 10,
                        justifyContent: 'flex-start',
                        width: '100%',
                        border: 'none',
                        textAlign: 'left'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: Tab content rendering */}
              <div style={{ minHeight: 400 }}>
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: Personal Info */}
                  {activeProfileTab === 'Personal Info' && (
                    <motion.div
                      key="personal-info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      {/* Personal Information Card */}
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem' }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Full Name</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.name}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Email Address</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>
                              <a href={`mailto:${selectedProfile.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                {selectedProfile.email}
                              </a>
                            </div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Mobile Number</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>
                              <a href={`tel:${selectedProfile.phone || '+1 (555) 382-9021'}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                {selectedProfile.phone || '+1 (555) 382-9021'}
                              </a>
                            </div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Date of Birth</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>1992-08-24</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Gender</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Male</div>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Residential Address</span>
                            <div style={{ fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>
                              482 Silver Lake Blvd, Los Angeles, CA 90026
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contacts Card */}
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Emergency Contacts</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem' }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Primary Contact</span>
                            <div style={{ fontWeight: 700, marginTop: 4 }}>Jane Wright (Spouse)</div>
                            <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>+1 (555) 382-9029</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Secondary Contact</span>
                            <div style={{ fontWeight: 700, marginTop: 4 }}>Robert Wright (Father)</div>
                            <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>+1 (555) 492-0210</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Employment Details */}
                  {activeProfileTab === 'Employment Details' && (
                    <motion.div
                      key="employment-details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="premium-card"
                      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>Employment Details</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem' }}>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Employee ID</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>EMP-2026-{selectedProfile.id + 400}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Department</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.department || 'Product Engineering'}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Designation</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.role || 'Senior Software Engineer'}</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Employment Type</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>Full-Time Permanent</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Joining Date</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>2023-03-15</div>
                        </div>
                        <div>
                          <span className="premium-label" style={{ fontSize: '0.65rem' }}>Reporting Manager</span>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.reportingManager || 'None'}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Documents Vault */}
                  {activeProfileTab === 'Documents Vault' && (
                    <motion.div
                      key="documents-vault"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="premium-card"
                      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Document Verification Center</h3>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input 
                            type="file" 
                            id="doc-upload" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const updatedDocs = [...(selectedProfile.documents || []), file.name];
                              setSelectedProfile({ ...selectedProfile, documents: updatedDocs });
                              setEmployees(employees.map(emp => 
                                emp.id === selectedProfile.id 
                                  ? { ...emp, documents: updatedDocs }
                                  : emp
                              ));
                              alert(`Document "${file.name}" uploaded successfully!`);
                            }} 
                          />
                          <label htmlFor="doc-upload" className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            Upload Document
                          </label>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                        {(selectedProfile.documents || [
                          'Profile_Photo.jpg',
                          'Aadhaar_Card.pdf',
                          'PAN_Card.pdf',
                          'Experience_Letter.pdf',
                          'Bank_Passbook.pdf',
                          'Cancelled_Cheque.pdf',
                          'Offer_Letter.pdf',
                          'Appointment_Letter.pdf'
                        ]).map((doc, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.01)' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{doc.replace(/_/g, ' ')}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button 
                                onClick={() => setActiveDocPreview(doc)} 
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700 }}
                              >
                                View
                              </button>
                              <button 
                                onClick={() => {
                                  const updatedDocs = (selectedProfile.documents || []).filter(d => d !== doc);
                                  setSelectedProfile({ ...selectedProfile, documents: updatedDocs });
                                  setEmployees(employees.map(emp => 
                                    emp.id === selectedProfile.id 
                                      ? { ...emp, documents: updatedDocs }
                                      : emp
                                  ));
                                  alert(`Document "${doc}" removed successfully!`);
                                }} 
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 700 }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Bank Details */}
                  {activeProfileTab === 'Bank Details' && (
                    <motion.div
                      key="bank-details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      {/* Bank Details block */}
                      <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Bank Details</h3>
                          <button onClick={() => handleStartEdit(selectedProfile)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            Edit Bank Details
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: '0.85rem', marginTop: 10 }}>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Bank Name</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.bankName || 'ITLC Silicon Bank, NA'}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Account Number</span>
                            <div className="number-font" style={{ fontWeight: 600, marginTop: 4 }}>
                              {selectedProfile.accountNumber && !selectedProfile.accountNumber.includes('*') 
                                ? selectedProfile.accountNumber 
                                : '30234928430'}
                            </div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>IFSC / Routing Code</span>
                            <div className="number-font" style={{ fontWeight: 600, marginTop: 4 }}>{selectedProfile.ifsc || 'ISB000492'}</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Account Type</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Corporate Salary Account</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Branch Location</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Silicon Valley Corporate Hub, CA</div>
                          </div>
                          <div>
                            <span className="premium-label" style={{ fontSize: '0.65rem' }}>Payment Method</span>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>Direct Bank Wire (ACH)</div>
                          </div>
                        </div>
                      </div>

                      {/* Payroll Lock Compliance Notice */}
                      <div className="badge badge-warning" style={{
                        padding: 16,
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        lineHeight: 1.5,
                        textAlign: 'left',
                        whiteSpace: 'normal',
                        color: '#d97706',
                        background: 'rgba(217, 119, 6, 0.08)',
                        border: '1px solid rgba(217, 119, 6, 0.2)'
                      }}>
                        * Payroll Compliance Lock: Bank details are verified and cannot be deleted or cleared. Please use the change request form to update account information.
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 5: Delete Warning Confirm Screen */}
        {viewMode === 'delete' && (
          <motion.div
            key="delete"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card"
            style={{
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 24,
              maxWidth: 500,
              margin: '40px auto'
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Terminate Record?</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{employees.find(e => e.id === confirmDeleteId)?.name}</strong>? This will purge all associated metadata, credentials, logs, and billing files.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14, width: '100%' }}>
              <button 
                onClick={() => { setViewMode('list'); setConfirmDeleteId(null); }} 
                className="premium-btn premium-btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="premium-btn premium-btn-primary" 
                style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--color-danger)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)' }}
              >
                Yes, Purge Record
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {activeDocPreview && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }} onClick={() => setActiveDocPreview(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                padding: 32,
                borderRadius: 20,
                width: '100%',
                maxWidth: 600,
                position: 'relative',
                boxShadow: 'var(--glass-shadow)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveDocPreview(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={28} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Document Preview Console</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>File: {activeDocPreview}</span>
                </div>
              </div>

              {/* Scanned Certificate Canvas mockup */}
              <div style={{
                height: 320,
                border: '2px dashed var(--color-border)',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: 24,
                textAlign: 'center'
              }}>
                {/* Verified Watermark */}
                <div style={{
                  position: 'absolute',
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'rgba(16, 185, 129, 0.08)',
                  transform: 'rotate(-25deg)',
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: 4
                }}>
                  Verified HR Admin
                </div>

                <div style={{ zIndex: 2 }}>
                  <ShieldCheck size={48} style={{ color: 'var(--color-success)', marginBottom: 12 }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeDocPreview.replace(/_/g, ' ').replace(/\.[^/.]+$/, "")}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 6, maxWidth: 300, lineHeight: 1.4 }}>
                    This official certificate is scanned, encrypted, and locked in the secure database. Audit verification completed by HR Super Admin.
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', display: 'block', marginTop: 10 }}>
                    SHA-256 Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => alert("Downloading digital copy...")} className="premium-btn premium-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Download Copy
                </button>
                <button onClick={() => setActiveDocPreview(null)} className="premium-btn premium-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showIdCardModal && selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="premium-card relative overflow-hidden"
              style={{
                width: '100%',
                maxWidth: 400,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                background: 'var(--color-bg-primary, #ffffff)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                borderRadius: 24
              }}
            >
              {/* Brand glow overlay */}
              <div style={{ position: 'absolute', top: 0, right: 0, height: 120, width: 120, background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.1))', filter: 'blur(30px)', pointerEvents: 'none' }}></div>

              <button 
                onClick={() => setShowIdCardModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary, #0f172a)', margin: 0 }}>Corporate Security ID Badge</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #475569)', display: 'block', marginTop: 2 }}>Official Identification Pass Card</span>
              </div>

              {/* ID Card Wrapper (The printed badge itself) */}
              <div 
                id="employee-security-pass"
                style={{
                  border: '1px solid var(--color-border, #e2e8f0)',
                  borderRadius: 20,
                  background: 'var(--color-bg-secondary, #f8fafc)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* ID Card Top Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  padding: '16px 20px',
                  color: 'white',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>ACME ENTERPRISES</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 700, letterSpacing: 1 }}>SECURE ACCESS PASS</div>
                </div>

                {/* ID Card Content */}
                <div style={{ padding: '24px 20px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                  {/* Photo Container */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      background: '#e2e8f0'
                    }}>
                      <img 
                        src={selectedProfile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'} 
                        alt={selectedProfile.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    {/* Status Badge Ring */}
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '3px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} title="Status: Active Verified" />
                  </div>

                  {/* Profile Name & Title */}
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--color-text-primary, #0f172a)', margin: 0 }}>{selectedProfile.name}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', display: 'block', marginTop: 4 }}>
                      {selectedProfile.role || 'Senior Software Engineer'}
                    </span>
                  </div>

                  {/* Details Table */}
                  <div style={{
                    width: '100%',
                    background: 'var(--color-bg-primary, #ffffff)',
                    borderRadius: 12,
                    padding: 12,
                    border: '1px solid var(--color-border, #edf2f7)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px 8px',
                    textAlign: 'left',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Employee ID</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary, #334155)', fontFamily: 'monospace' }}>EMP-2026-{selectedProfile.id + 400}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Department</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary, #334155)' }}>{selectedProfile.department || 'Product Engineering'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Date of Joining</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary, #334155)' }}>{selectedProfile.joiningDate || '2023-03-15'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-tertiary, #94a3b8)', textTransform: 'uppercase', display: 'block' }}>Access Level</span>
                      <span style={{ fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase' }}>LEVEL 3 (STD)</span>
                    </div>
                  </div>

                  {/* Mock Barcode / Access Strips */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ height: 32, display: 'flex', gap: 2, alignItems: 'stretch', width: '80%', opacity: 0.8 }}>
                      {Array.from({ length: 38 }).map((_, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            flexGrow: (i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2), 
                            background: '#0f172a' 
                          }} 
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary, #94a3b8)', fontFamily: 'monospace', letterSpacing: 3 }}>
                      *EMP-ID-{selectedProfile.id + 400}*
                    </span>
                  </div>
                </div>

                {/* ID Card Footer */}
                <div style={{
                  borderTop: '1px dashed var(--color-border, #e2e8f0)',
                  padding: 10,
                  fontSize: '0.6rem',
                  color: 'var(--color-text-tertiary, #64748b)',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.01)'
                }}>
                  Security System Badge &bull; Property of Corporate HRMS
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => alert(`Access pass for ${selectedProfile.name} download initiated!`)}
                  className="premium-btn premium-btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Download size={14} /> <span>Download Pass</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>Print Pass</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generated Employee Credentials Popup Modal */}
      <AnimatePresence>
        {generatedEmpCredentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 rounded-2xl space-y-5 relative overflow-hidden"
              style={{ background: 'var(--header-bg, #0f172a)', color: '#fff', border: '1px solid var(--color-border, #334155)', borderRadius: '24px' }}
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 text-emerald-400">
                <Check className="h-6 w-6 shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20 shadow-md animate-bounce" />
                <h3 className="text-lg font-bold text-white font-sans" style={{ margin: 0 }}>Employee Credentials Created</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans" style={{ margin: 0 }}>
                A new database employee workspace has been registered for <span className="font-extrabold text-white font-mono">{generatedEmpCredentials.employeeName}</span>. Use the following credentials to log in:
              </p>

              <div className="space-y-3 bg-white/2 p-3.5 rounded-xl border border-white/5 font-sans" style={{ background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block" style={{ fontSize: '10px', color: '#64748b' }}>Employee ID (Username)</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px' }}>
                    <span className="text-xs font-semibold text-slate-200 block font-mono" style={{ fontSize: '12px' }}>{generatedEmpCredentials.id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmpCredentials.id);
                        alert('Employee ID copied to clipboard!');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block" style={{ fontSize: '10px', color: '#64748b' }}>Employee Email Address</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px' }}>
                    <span className="text-xs font-semibold text-slate-200 block font-mono" style={{ fontSize: '12px' }}>{generatedEmpCredentials.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmpCredentials.email);
                        alert('Email address copied to clipboard!');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block" style={{ fontSize: '10px', color: '#64748b' }}>Password</span>
                  <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px' }}>
                    <span className="text-xs font-bold text-emerald-400 font-mono tracking-wide" style={{ fontSize: '12px', color: '#34d399' }}>{generatedEmpCredentials.pass}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmpCredentials.pass);
                        alert('Password copied to clipboard!');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setGeneratedEmpCredentials(null)}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow border border-indigo-700 cursor-pointer"
                  style={{ cursor: 'pointer', background: '#4f46e5', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: 700 }}
                >
                  Dismiss / Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
