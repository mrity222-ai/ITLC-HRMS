import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Calculator, Download, Percent, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

const mockPayslipHistory = [];

export default function Payroll({ employees, subTab = 'dashboard', setActiveTab, currency = 'USD' }) {
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };
  const cSymbol = currencySymbols[currency] || '$';

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 1);
  const [bonus, setBonus] = useState(500);
  const [deductions, setDeductions] = useState(200);
  const [attendance, setAttendance] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState([]);

  // Editable Payroll Configurations
  const [basicSalaryPercent, setBasicSalaryPercent] = useState(50.0);
  const [hraPercent, setHraPercent] = useState(40.0);
  const [pfPercent, setPfPercent] = useState(12.0);
  const [esiPercent, setEsiPercent] = useState(1.75);
  const [tdsPercent, setTdsPercent] = useState(15.0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(22);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [selectedEmpBreakdown, setSelectedEmpBreakdown] = useState(null);

  const loadCompanyPayrollSettings = async () => {
    setLoadingCompany(true);
    try {
      const comp = await api.getAdminCompany();
      if (comp) {
        if (comp.basicSalaryPercent !== undefined) setBasicSalaryPercent(comp.basicSalaryPercent);
        if (comp.hraPercent !== undefined) setHraPercent(comp.hraPercent);
        if (comp.pfPercent !== undefined) setPfPercent(comp.pfPercent);
        if (comp.esiPercent !== undefined) setEsiPercent(comp.esiPercent);
        if (comp.tdsPercent !== undefined) setTdsPercent(comp.tdsPercent);
        if (comp.totalWorkingDays !== undefined) setTotalWorkingDays(comp.totalWorkingDays);
        if (comp.walletBalance !== undefined) setWalletBalance(comp.walletBalance);
      }
    } catch (err) {
      console.error("Failed to load company payroll settings:", err);
    } finally {
      setLoadingCompany(false);
    }
  };

  useEffect(() => {
    loadCompanyPayrollSettings();
  }, []);

  const handleSavePayrollSettings = async () => {
    try {
      await api.updateAdminCompany({
        basicSalaryPercent,
        hraPercent,
        pfPercent,
        esiPercent,
        tdsPercent,
        totalWorkingDays
      });
      alert("Payroll configurations saved successfully!");
    } catch (err) {
      alert("Failed to save payroll configurations.");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const history = await api.getAdminPayroll();
        setPayrollHistory(history);
      } catch (err) {
        console.error("Failed to load payroll history:", err);
      }
    };
    fetchPayroll();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'structures', label: 'Salary Structures' },
    { id: 'run', label: 'Run Payroll' },
    { id: 'payslips', label: 'Payslips Console' },
    { id: 'compliance', label: 'Statutory Compliance' },
    { id: 'reimbursements', label: 'Reimbursements' },
    { id: 'reports', label: 'Reports & Export' },
  ];

  const selectedEmp = employees.find(emp => emp.id.toString() === selectedEmpId.toString()) || employees[0];

  useEffect(() => {
    if (!selectedEmp) return;
    const fetchAttendance = async () => {
      setLoadingAtt(true);
      try {
        const data = await api.getAdminAttendance(selectedEmp.id);
        setAttendance(data || []);
      } catch (err) {
        console.error("Failed to load employee attendance for payroll:", err);
      } finally {
        setLoadingAtt(false);
      }
    };
    fetchAttendance();
  }, [selectedEmpId, selectedEmp]);

  // Calculate payroll logic based on attendance
  const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const halfDayCount = attendance.filter(a => a.status === 'Half-day').length;
  const activeDays = presentCount + (halfDayCount * 0.5);
  const payoutRatio = attendance.length === 0 ? 1.0 : Math.min(1.0, activeDays / totalWorkingDays);

  const baseSalary = (selectedEmp && typeof selectedEmp.salary === 'string') 
    ? parseFloat(selectedEmp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 
    : (selectedEmp && typeof selectedEmp.salary === 'number')
    ? selectedEmp.salary / 12
    : 5000;
  const adjustedBaseSalary = baseSalary * payoutRatio;

  const basicPay = adjustedBaseSalary * (basicSalaryPercent / 100);
  const hra = basicPay * (hraPercent / 100);
  const pf = Math.round(basicPay * (pfPercent / 100));
  const esi = Math.round(basicPay * (esiPercent / 100));
  const tax = Math.round((adjustedBaseSalary + Number(bonus)) * (tdsPercent / 100));
  const netPay = Math.round(adjustedBaseSalary + Number(bonus) - Number(deductions) - pf - esi - tax);

  const handleDownloadPayslip = () => {
    alert(`Downloading Payslip for ${selectedEmp.name} (July 2026). PDF generated successfully!`);
  };

  const handleProcessSinglePayslip = async () => {
    try {
      await api.createAdminPayroll({
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        month: 'July',
        year: 2026,
        basic: basicPay,
        hra: hra,
        allowances: Number(bonus),
        deductions: pf + esi + tax + Number(deductions),
        netSalary: netPay,
        status: 'Processed'
      });
      alert(`Payslip for ${selectedEmp.name} (July 2026) has been successfully processed and disbursed!`);
      const history = await api.getAdminPayroll();
      setPayrollHistory(history);
    } catch (err) {
      alert("Failed to process individual payslip.");
    }
  };

  const handleRunBulkPayroll = async () => {
    try {
      let totalAmount = 0;
      for (const emp of employees) {
        const empBase = (typeof emp.salary === 'string') 
          ? parseFloat(emp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 
          : (typeof emp.salary === 'number' ? emp.salary / 12 : 5000);
        const empBasicPay = empBase * (basicSalaryPercent / 100);
        const empPf = Math.round(empBasicPay * (pfPercent / 100));
        const empEsi = Math.round(empBasicPay * (esiPercent / 100));
        const empTax = Math.round(empBase * (tdsPercent / 100));
        const empNet = Math.round(empBase - empPf - empEsi - empTax);
        totalAmount += empNet;
        
        await api.createAdminPayroll({
          employeeId: emp.id,
          employeeName: emp.name,
          month: 'July',
          year: 2026,
          basic: empBasicPay,
          hra: empBasicPay * (hraPercent / 100),
          allowances: 0,
          deductions: empPf + empEsi + empTax,
          netSalary: empNet,
          status: 'Processed'
        });
      }
      alert(`Bulk payroll processing successful! ${cSymbol}${totalAmount.toLocaleString()} net salary disbursed across ${employees.length} employee accounts.`);
      
      const history = await api.getAdminPayroll();
      setPayrollHistory(history);
    } catch (err) {
      alert("Failed to run bulk payroll.");
      console.error(err);
    }
  };

  const getEmpPayrollDetails = (emp) => {
    const empBase = (typeof emp.salary === 'string') 
      ? parseFloat(emp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 
      : (typeof emp.salary === 'number' ? emp.salary / 12 : 5000);
    const empBasicPay = empBase * (basicSalaryPercent / 100);
    const empPf = Math.round(empBasicPay * (pfPercent / 100));
    const empEsi = Math.round(empBasicPay * (esiPercent / 100));
    const empTax = Math.round(empBase * (tdsPercent / 100));
    const empNet = Math.round(empBase - empPf - empEsi - empTax);
    return {
      basic: empBasicPay,
      hra: empBasicPay * (hraPercent / 100),
      deductions: empPf + empEsi + empTax,
      netSalary: empNet
    };
  };

  const handleRechargeWallet = async (e) => {
    e.preventDefault();
    const amt = Number(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid recharge amount.");
      return;
    }
    setIsRecharging(true);
    try {
      const res = await api.rechargeAdminWallet(amt);
      if (res.success) {
        setWalletBalance(res.walletBalance);
        setRechargeAmount('');
        alert(`Successfully added ${cSymbol}${amt.toLocaleString()} to your HRMS Wallet!`);
      }
    } catch (err) {
      alert("Failed to recharge wallet.");
    } finally {
      setIsRecharging(false);
    }
  };

  const handleDisburseSingleSalary = async (emp) => {
    const details = getEmpPayrollDetails(emp);
    try {
      const res = await api.disbursePayroll({
        employeeId: emp.id,
        employeeName: emp.name,
        month: 'July',
        year: 2026,
        basic: details.basic,
        hra: details.hra,
        allowances: 0,
        deductions: details.deductions,
        netSalary: details.netSalary
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        alert(`Salary of ${cSymbol}${details.netSalary.toLocaleString()} successfully disbursed to ${emp.name}!`);
        const history = await api.getAdminPayroll();
        setPayrollHistory(history);
      }
    } catch (err) {
      alert(err.message || "Failed to disburse salary.");
    }
  };

  const handleHoldSingleSalary = async (emp) => {
    const details = getEmpPayrollDetails(emp);
    try {
      const res = await api.holdPayroll({
        employeeId: emp.id,
        employeeName: emp.name,
        month: 'July',
        year: 2026,
        basic: details.basic,
        hra: details.hra,
        allowances: 0,
        deductions: details.deductions,
        netSalary: details.netSalary
      });
      if (res.success) {
        alert(`Salary for ${emp.name} has been placed ON HOLD.`);
        const history = await api.getAdminPayroll();
        setPayrollHistory(history);
      }
    } catch (err) {
      alert("Failed to hold salary.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Sub tabs navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }} className="no-scrollbar">
        {tabs.map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab(`payroll-${tab.id}`);
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard Calculator */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}
          >
            {/* Payroll Config Panel */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calculator size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Generate & Process Payslip</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Select Employee</label>
                  <select 
                    value={selectedEmpId} 
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="premium-input"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Bonus ({currency})</label>
                    <input 
                      type="number" 
                      value={bonus} 
                      onChange={(e) => setBonus(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Deductions ({currency})</label>
                    <input 
                      type="number" 
                      value={deductions} 
                      onChange={(e) => setDeductions(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                  <button 
                    onClick={handleProcessSinglePayslip}
                    className="premium-btn premium-btn-success" 
                    style={{ width: '100%', justifyContent: 'center', padding: 12, border: 'none', borderRadius: 8, background: 'var(--color-success)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>Process & Disburse Salary</span>
                  </button>

                  <button 
                    onClick={handleDownloadPayslip}
                    className="premium-btn premium-btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                  >
                    <Download size={16} />
                    <span>Download PDF Payslip</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payslip preview */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Breakdown Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Basic Base Salary (Monthly):</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Math.round(baseSalary).toLocaleString()}</span>
                </div>
                {attendance.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--color-bg-secondary)', padding: 8, borderRadius: 8, fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                      <span>Attendance Present Days:</span>
                      <span className="number-font">{presentCount} Days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                      <span>Attendance Half-Days:</span>
                      <span className="number-font">{halfDayCount} Days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', borderTop: '1px dashed var(--color-border)', paddingTop: 4, marginTop: 4 }}>
                      <span>Prorated Payout Ratio:</span>
                      <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{(payoutRatio * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Adjusted Base Salary:</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Math.round(adjustedBaseSalary).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Performance Bonus:</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{cSymbol}{bonus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Provident Fund (PF 12%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{pf}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>State Insurance (ESI 1.75%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{esi}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Tax Deductions (TDS 15%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{tax}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                <div>
                  <span className="premium-label" style={{ fontSize: '0.65rem' }}>Estimated Net Pay</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Direct bank wire payment</p>
                </div>
                <h4 className="number-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {cSymbol}{netPay.toLocaleString()}
                </h4>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Salary Structures */}
        {subTab === 'structures' && (
          <motion.div
            key="structures"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Salary Components</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Define structure mappings and deductions formulas</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Component Name</th>
                    <th>Type</th>
                    <th>Formula / Base Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Basic Pay</td>
                    <td>Earning</td>
                    <td className="number-font">
                      <input 
                        type="number" 
                        value={basicSalaryPercent} 
                        onChange={(e) => setBasicSalaryPercent(parseFloat(e.target.value) || 0)} 
                        style={{ width: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit', marginRight: 6 }} 
                      />
                      % of CTC
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>House Rent Allowance (HRA)</td>
                    <td>Earning</td>
                    <td className="number-font">
                      <input 
                        type="number" 
                        value={hraPercent} 
                        onChange={(e) => setHraPercent(parseFloat(e.target.value) || 0)} 
                        style={{ width: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit', marginRight: 6 }} 
                      />
                      % of Basic Pay
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Provident Fund (PF)</td>
                    <td>Deduction</td>
                    <td className="number-font">
                      <input 
                        type="number" 
                        value={pfPercent} 
                        onChange={(e) => setPfPercent(parseFloat(e.target.value) || 0)} 
                        style={{ width: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit', marginRight: 6 }} 
                      />
                      % of Basic Pay
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={handleSavePayrollSettings} className="premium-btn premium-btn-success">
                Save Component Mappings
              </button>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Run Payroll */}
        {subTab === 'run' && (() => {
          const totalRequiredPayroll = employees.reduce((acc, emp) => {
            const details = getEmpPayrollDetails(emp);
            return acc + details.netSalary;
          }, 0);
          const getEmployeePayrollStatus = (empId) => {
            const record = payrollHistory.find(r => r.employeeId === empId && r.month === 'July' && r.year === 2026);
            return record ? record.status : 'Pending';
          };

          return (
            <motion.div
              key="run"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Wallet and Payroll Summary Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                
                {/* HRMS Wallet */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
                      <span>HRMS Admin Wallet</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Add money to disburse salaries to employees.</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(79, 70, 229, 0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Wallet Balance</span>
                    <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {cSymbol}{walletBalance.toLocaleString()}
                    </strong>
                  </div>
                  <form onSubmit={handleRechargeWallet} style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder="Amount (e.g. 50000)"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="premium-input"
                      style={{ flex: 1, height: 40 }}
                    />
                    <button 
                      type="submit" 
                      disabled={isRecharging} 
                      className="premium-btn premium-btn-primary" 
                      style={{ padding: '0 20px', height: 40, whiteSpace: 'nowrap' }}
                    >
                      {isRecharging ? 'Processing...' : 'Add Money'}
                    </button>
                  </form>
                </div>

                {/* Payroll Summary */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calculator size={18} style={{ color: 'var(--color-success)' }} />
                      <span>Monthly Payroll Summary (July 2026)</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Auto calculated net payable salary volume.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total Employees & Managers:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{employees.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total Net Payable:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{cSymbol}{totalRequiredPayroll.toLocaleString()}</strong>
                    </div>
                  </div>

                  {walletBalance < totalRequiredPayroll && (
                    <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>⚠️</span>
                      <span>Warning: Wallet balance is insufficient to complete bulk salary runs.</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      onClick={handleRunBulkPayroll} 
                      disabled={walletBalance < totalRequiredPayroll || employees.length === 0} 
                      className="premium-btn premium-btn-primary" 
                      style={{ flex: 1, height: 42, justifyContent: 'center' }}
                    >
                      <CreditCard size={14} />
                      <span>Disburse All Salaries</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Horizontal Disbursal Checklist */}
              <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Salary Disbursal Checklist</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                    Verify and disburse individual employee or manager salary using check (✔) and hold (✖) actions.
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: 16, 
                  overflowX: 'auto', 
                  paddingBottom: 16,
                  paddingTop: 4,
                  scrollbarWidth: 'thin',
                  msOverflowStyle: 'none'
                }}>
                  {employees.map((emp) => {
                    const status = getEmployeePayrollStatus(emp.id);
                    const details = getEmpPayrollDetails(emp);
                    return (
                      <div 
                        key={emp.id} 
                        className="premium-card" 
                        onClick={() => setSelectedEmpBreakdown(emp)}
                        style={{ 
                          minWidth: 320, 
                          maxWidth: 340, 
                          padding: '10px 14px', 
                          display: 'flex', 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          gap: 12, 
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          flexShrink: 0,
                          borderRadius: 12,
                          cursor: 'pointer',
                          height: 'auto'
                        }}
                      >
                        {/* Avatar */}
                        <img 
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'} 
                          alt={emp.name} 
                          style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover' }}
                        />

                        {/* Mid Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{emp.role}</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)' }} className="number-font">
                              {cSymbol}{details.netSalary.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                        >
                          {status === 'Processed' ? (
                            <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px' }}>
                              ✔️ Paid
                            </span>
                          ) : status === 'On Hold' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="badge badge-warning" style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px' }}>
                                ✖️ Hold
                              </span>
                              <button 
                                onClick={() => handleDisburseSingleSalary(emp)}
                                className="premium-btn premium-btn-primary"
                                style={{ padding: '0 8px', fontSize: '0.7rem', height: '26px', justifyContent: 'center' }}
                              >
                                Pay
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button 
                                onClick={() => handleHoldSingleSalary(emp)}
                                className="premium-btn premium-btn-secondary" 
                                style={{ padding: '0 8px', fontSize: '0.7rem', height: '26px', borderColor: '#ef4444', color: '#ef4444', justifyContent: 'center' }}
                                title="Hold"
                              >
                                ✖
                              </button>
                              <button 
                                onClick={() => handleDisburseSingleSalary(emp)}
                                className="premium-btn premium-btn-primary" 
                                style={{ padding: '0 8px', fontSize: '0.7rem', height: '26px', justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }}
                                title="Pay"
                              >
                                ✔
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Salary Breakdown Modal */}
              {selectedEmpBreakdown && (() => {
                const details = getEmpPayrollDetails(selectedEmpBreakdown);
                return (
                  <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: 20
                  }} onClick={() => setSelectedEmpBreakdown(null)}>
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        padding: 24,
                        borderRadius: 20,
                        width: '100%',
                        maxWidth: 420,
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={selectedEmpBreakdown.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'} 
                          alt={selectedEmpBreakdown.name} 
                          style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{selectedEmpBreakdown.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{selectedEmpBreakdown.role}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-text-secondary)' }}>Salary Breakdown (July 2026)</h3>
                      </div>

                      {/* Details Table */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Basic Salary ({basicSalaryPercent}%):</span>
                          <strong className="number-font">{cSymbol}{Math.round(details.basic).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>House Rent Allowance (HRA - {hraPercent}%):</span>
                          <strong className="number-font">{cSymbol}{Math.round(details.hra).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                          <span>Total Deductions (PF/ESI/Tax):</span>
                          <strong className="number-font">-{cSymbol}{Math.round(details.deductions).toLocaleString()}</strong>
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                          <span style={{ fontWeight: 700 }}>Net Payable Salary:</span>
                          <strong style={{ color: 'var(--color-primary)', fontWeight: 800 }} className="number-font">
                            {cSymbol}{details.netSalary.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {/* Footer Buttons */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button 
                          onClick={() => setSelectedEmpBreakdown(null)}
                          className="premium-btn premium-btn-secondary"
                          style={{ flex: 1, justifyContent: 'center', height: 38 }}
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}

            </motion.div>
          );
        })()}

        {/* SUB-VIEW 4: Payslips Console */}
        {subTab === 'payslips' && (
          <motion.div
            key="payslips"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Disbursed Payslips Archives</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Historically logged wire payouts</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Slip ID</th>
                    <th>Payment Date</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollHistory.map(slip => (
                    <tr key={slip.id}>
                      <td style={{ fontWeight: 700 }}>{slip.id}</td>
                      <td style={{ fontSize: '0.8rem' }}>{slip.month} {slip.year} - {slip.employeeName}</td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{cSymbol}{slip.netSalary?.toLocaleString()}</td>
                      <td><span className="badge badge-success">{slip.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => alert(`Downloading pdf for slip: ${slip.id}`)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                        >
                          <Download size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Statutory Compliance */}
        {subTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Statutory Regulatory Compliance</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Verify tax rates, PF declarations, and insurance audits</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>TDS Flat Rate (%)</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={tdsPercent} 
                  onChange={(e) => setTdsPercent(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>PF Contribution (%)</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={pfPercent} 
                  onChange={(e) => setPfPercent(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>ESI Medical (%)</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={esiPercent} 
                  onChange={(e) => setEsiPercent(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={handleSavePayrollSettings} className="premium-btn premium-btn-success">
                Update Statutory Compliance
              </button>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 6: Reimbursements */}
        {subTab === 'reimbursements' && (
          <motion.div
            key="reimbursements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Reimbursements Gateway</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                All approved employee expense claims are queued directly into the current payroll cycle under the *Reimbursements* component.
              </p>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 7: Reports */}
        {subTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Payroll Sheets</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                Download statutory compliance documentation, ledger summaries, and tax forms (Form 16) in Excel.
              </p>
            </div>

            <button onClick={() => alert("Downloading payroll_annual_audit.xlsx")} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
              <FileText size={16} />
              <span>Download Payroll Reports</span>
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
