import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Calculator, Download, Percent, FileText, CheckCircle, ShieldCheck, User, Briefcase, Plus, X, Calendar, Landmark } from 'lucide-react';
import { api } from '../../services/api';
import { downloadEmployeePayslip } from '../../utils/PaymentSlip';

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
  const [expenses, setExpenses] = useState([]);

  // Overtime States
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(25);

  // Professional Tax & Statutory settings
  const [profTax, setProfTax] = useState(200);

  // F&F Settlement Form States
  const [ffEmpId, setFfEmpId] = useState(employees[0]?.id || '');
  const [resignationDate, setResignationDate] = useState('');
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [leaveEncashmentDays, setLeaveEncashmentDays] = useState(0);
  const [gratuityAmount, setGratuityAmount] = useState(0);
  const [noticePeriodAllowance, setNoticePeriodAllowance] = useState(0);
  const [ffOtherDeductions, setFfOtherDeductions] = useState(0);

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

  const fetchExpensesAndPayroll = async () => {
    try {
      const history = await api.getAdminPayroll();
      setPayrollHistory(history || []);
      const exps = await api.getAdminExpenses();
      setExpenses(exps || []);
    } catch (err) {
      console.error("Failed to load payroll or expense data:", err);
    }
  };

  useEffect(() => {
    loadCompanyPayrollSettings();
    fetchExpensesAndPayroll();
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'structures', label: 'Salary Structures' },
    { id: 'run', label: 'Run Payroll' },
    { id: 'payslips', label: 'Payslips Console' },
    { id: 'compliance', label: 'Statutory Compliance' },
    { id: 'reimbursements', label: 'Reimbursements' },
    { id: 'ff', label: 'F&F Settlement' },
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

  // Calculate approved expense reimbursements for this employee
  const empApprovedExpenses = expenses.filter(exp => exp.employeeId === selectedEmp?.id && exp.status === 'Approved');
  const reimbursementAmount = empApprovedExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

  // Calculate attendance & salary details
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
  
  // Overtime Pay
  const overtimePay = Number(overtimeHours) * Number(overtimeRate);
  
  // Total Earnings & Net Pay calculations
  const tax = Math.round((adjustedBaseSalary + Number(bonus) + overtimePay) * (tdsPercent / 100));
  const netPay = Math.round(adjustedBaseSalary + Number(bonus) + overtimePay + reimbursementAmount - Number(deductions) - pf - esi - tax - Number(profTax));

  const handleDownloadPayslip = async () => {
    if (!selectedEmp) return;
    try {
      const company = await api.getAdminCompany();
      downloadEmployeePayslip(
        selectedEmp,
        company || { name: 'ITLC Workspace' },
        {
          month: 'July',
          year: 2026,
          basic: basicPay,
          hra: hra,
          allowances: Number(bonus),
          overtime: overtimePay,
          reimbursement: reimbursementAmount,
          pf: pf,
          esi: esi,
          tax: tax,
          profTax: Number(profTax),
          deductions: pf + esi + tax + Number(profTax) + Number(deductions),
          netSalary: netPay,
          currency: currency
        }
      );
    } catch (e) {
      alert("Failed to generate payslip download");
    }
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
        allowances: Number(bonus) + overtimePay,
        deductions: pf + esi + tax + Number(profTax) + Number(deductions),
        netSalary: netPay,
        overtime: overtimePay,
        reimbursements: reimbursementAmount,
        profTax: Number(profTax),
        type: 'Regular',
        status: 'Processed'
      });
      alert(`Payslip for ${selectedEmp.name} (July 2026) has been successfully processed and disbursed!`);
      fetchExpensesAndPayroll();
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
        
        // Load approved reimbursements for each employee
        const empExps = expenses.filter(exp => exp.employeeId === emp.id && exp.status === 'Approved');
        const empReimb = empExps.reduce((acc, exp) => acc + Number(exp.amount), 0);

        const empNet = Math.round(empBase + empReimb - empPf - empEsi - empTax - Number(profTax));
        totalAmount += empNet;
        
        await api.createAdminPayroll({
          employeeId: emp.id,
          employeeName: emp.name,
          month: 'July',
          year: 2026,
          basic: empBasicPay,
          hra: empBasicPay * (hraPercent / 100),
          allowances: 0,
          deductions: empPf + empEsi + empTax + Number(profTax),
          netSalary: empNet,
          overtime: 0,
          reimbursements: empReimb,
          profTax: Number(profTax),
          type: 'Regular',
          status: 'Processed'
        });
      }
      alert(`Bulk payroll processing successful! ${cSymbol}${totalAmount.toLocaleString()} net salary disbursed across ${employees.length} employee accounts.`);
      fetchExpensesAndPayroll();
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
    
    const empExps = expenses.filter(exp => exp.employeeId === emp.id && exp.status === 'Approved');
    const empReimb = empExps.reduce((acc, exp) => acc + Number(exp.amount), 0);

    const empNet = Math.round(empBase + empReimb - empPf - empEsi - empTax - Number(profTax));
    return {
      basic: empBasicPay,
      hra: empBasicPay * (hraPercent / 100),
      deductions: empPf + empEsi + empTax + Number(profTax),
      netSalary: empNet,
      reimbursements: empReimb
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
        netSalary: details.netSalary,
        reimbursements: details.reimbursements,
        profTax: Number(profTax)
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        alert(`Salary of ${cSymbol}${details.netSalary.toLocaleString()} successfully disbursed to ${emp.name}!`);
        fetchExpensesAndPayroll();
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
        netSalary: details.netSalary,
        profTax: Number(profTax)
      });
      if (res.success) {
        alert(`Salary for ${emp.name} has been placed ON HOLD.`);
        fetchExpensesAndPayroll();
      }
    } catch (err) {
      alert("Failed to hold salary.");
    }
  };

  const getEmployeePayrollStatus = (empId) => {
    const record = payrollHistory.find(r => r.employeeId === empId && r.month === 'July' && r.year === 2026);
    return record ? record.status : 'Pending';
  };

  // Full & Final calculations
  const ffEmp = employees.find(e => e.id.toString() === ffEmpId.toString()) || employees[0];
  const ffBase = ffEmp ? (typeof ffEmp.salary === 'string' ? parseFloat(ffEmp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 : ffEmp.salary / 12) : 5000;
  const unpaidSalaryAmount = Math.round((ffBase / 30) * unpaidDays);
  const leaveEncashmentAmount = Math.round((ffBase / 30) * leaveEncashmentDays);
  const ffNetPayable = unpaidSalaryAmount + leaveEncashmentAmount + Number(gratuityAmount) + Number(noticePeriodAllowance) - Number(ffOtherDeductions);

  const handleProcessFF = async (e) => {
    e.preventDefault();
    if (!ffEmp) return;
    try {
      await api.createAdminPayroll({
        employeeId: ffEmp.id,
        employeeName: ffEmp.name,
        month: 'Settlement',
        year: 2026,
        basic: unpaidSalaryAmount,
        hra: 0,
        allowances: Number(gratuityAmount) + Number(noticePeriodAllowance),
        deductions: Number(ffOtherDeductions),
        netSalary: ffNetPayable,
        gratuity: Number(gratuityAmount),
        leaveEncashment: leaveEncashmentAmount,
        type: 'F&F',
        status: 'Processed'
      });
      alert(`Full & Final (F&F) settlement of ${cSymbol}${ffNetPayable.toLocaleString()} processed for ${ffEmp.name}!`);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to process F&F settlement: " + err.message);
    }
  };

  // Generate compliance Form 16 or audit report
  const handleDownloadAnnualReports = () => {
    if (!selectedEmp) return;
    
    // Generate statutory compliance text payload representing Form 16
    const form16Text = `
========================================================================
             FORM NO. 16 - ANNUAL TAX DEDUCTION STATEMENT
========================================================================
Employer Name: ITLC Workspace
Employee Name: ${selectedEmp.name} (ID: ${selectedEmp.id})
Assessment Year: 2026 - 2027
TDS Period: July 2025 to June 2026
------------------------------------------------------------------------
I. Gross Salary received u/s 17(1):         ${cSymbol}${Math.round(baseSalary * 12).toLocaleString()}
II. HRA Exemption u/s 10(13A):               ${cSymbol}${Math.round(hra * 12).toLocaleString()}
III. Deductions u/s 16:
     (a) Standard Deduction:                ${cSymbol}50,000
     (b) Professional Tax u/s 16(iii):       ${cSymbol}${Math.round(profTax * 12).toLocaleString()}
IV. Total Deductions:                       ${cSymbol}${Math.round(50000 + (profTax * 12)).toLocaleString()}
V. Taxable Income u/s 115BAC:               ${cSymbol}${Math.round((baseSalary * 12) - 50000 - (profTax * 12)).toLocaleString()}
VI. Total Tax Deposited (TDS):             ${cSymbol}${Math.round(tax * 12).toLocaleString()}
------------------------------------------------------------------------
Verification: This statement certifies that tax has been deducted at source
and paid to the credit of the Government.
========================================================================
    `;

    const blob = new Blob([form16Text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Form_16_${selectedEmp.name.replace(/\s+/g, '_')}_2026.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Form 16 Tax Certificate compiled and downloaded for ${selectedEmp.name}!`);
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Overtime Hours</label>
                    <input 
                      type="number" 
                      value={overtimeHours} 
                      onChange={(e) => setOvertimeHours(Number(e.target.value) || 0)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Hourly Overtime Rate ({currency})</label>
                    <input 
                      type="number" 
                      value={overtimeRate} 
                      onChange={(e) => setOvertimeRate(Number(e.target.value) || 0)} 
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
                  <span style={{ color: 'var(--color-text-secondary)' }}>Overtime Earnings:</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{cSymbol}{overtimePay}</span>
                </div>
                {reimbursementAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Approved Reimbursements:</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{cSymbol}{reimbursementAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Provident Fund (PF {pfPercent}%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{pf}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>State Insurance (ESI {esiPercent}%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{esi}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Tax Deductions (TDS {tdsPercent}%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Professional Tax (PT):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{profTax}</span>
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

              {/* Premium Disbursal Table matching user upload design */}
              <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Salary Disbursal Console</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                    Verify and disburse individual employee or manager salary details. Click row to see complete details.
                  </p>
                </div>

                <div style={{ maxHeight: '450px', overflowY: 'auto', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }} className="premium-scrollbar">
                  <div className="premium-table-container" style={{ margin: 0 }}>
                    <table className="premium-table">
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}># ID</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> Name</span>
                          </th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={13} /> Role</span>
                          </th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Basic Salary</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Reimbursements</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Net Payable</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Status</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => {
                          const status = getEmployeePayrollStatus(emp.id);
                          const details = getEmpPayrollDetails(emp);
                          return (
                            <tr 
                              key={emp.id} 
                              onClick={() => setSelectedEmpBreakdown(emp)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* ID */}
                              <td style={{ fontWeight: 700 }} className="number-font">
                                #{emp.id}
                              </td>

                              {/* Name */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                                    <img 
                                      src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'} 
                                      alt={emp.name} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                  </div>
                                  <span style={{ fontWeight: 700 }}>{emp.name}</span>
                                </div>
                              </td>

                              {/* Role */}
                              <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                {emp.role}
                              </td>

                              {/* Basic */}
                              <td className="number-font" style={{ color: 'var(--color-text-secondary)' }}>
                                {cSymbol}{Math.round(details.basic).toLocaleString()}
                              </td>

                              {/* Reimbursements */}
                              <td className="number-font" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                +{cSymbol}{details.reimbursements.toLocaleString()}
                              </td>

                              {/* Net Payable */}
                              <td className="number-font" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                {cSymbol}{details.netSalary.toLocaleString()}
                              </td>

                              {/* Status Badge */}
                              <td>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: status === 'Processed' ? 'rgba(34, 197, 94, 0.12)' : status === 'On Hold' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                  color: status === 'Processed' ? '#22c55e' : status === 'On Hold' ? '#eab308' : '#64748b'
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status === 'Processed' ? '#22c55e' : status === 'On Hold' ? '#eab308' : '#64748b' }} />
                                  <span>{status === 'Processed' ? 'Paid' : status === 'On Hold' ? 'On Hold' : 'Pending'}</span>
                                </span>
                              </td>

                              {/* Actions */}
                              <td style={{ textAlign: 'right' }}>
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', width: '100%' }}
                                >
                                  {status === 'Processed' ? (
                                    <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px' }}>
                                      ✔️ Paid
                                    </span>
                                  ) : status === 'On Hold' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <button 
                                        onClick={() => handleDisburseSingleSalary(emp)}
                                        className="premium-btn premium-btn-primary"
                                        style={{ padding: '0 10px', fontSize: '0.7rem', height: '26px', justifyContent: 'center' }}
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
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                          <span>Reimbursements Claims:</span>
                          <strong className="number-font">+{cSymbol}{details.reimbursements.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                          <span>Total Deductions (PF/ESI/Tax/PT):</span>
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
                    <th>Payment Period / Name</th>
                    <th>Type</th>
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
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{slip.type || 'Regular'}</td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{cSymbol}{slip.netSalary?.toLocaleString()}</td>
                      <td><span className="badge badge-success">{slip.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={async () => {
                            try {
                              const emp = employees.find(e => e.id === slip.employeeId) || { name: slip.employeeName };
                              const companyInfo = await api.getAdminCompany();
                              const basicVal = Number(slip.basic || 0);
                              const hraVal = Number(slip.hra || 0);
                              const allowancesVal = Number(slip.allowances || 0);
                              const deductionsVal = Number(slip.deductions || 0);
                              const netVal = Number(slip.netSalary || 0);
                              
                              const pfVal = Math.round(basicVal * 0.12);
                              const esiVal = Math.round(basicVal * 0.0175);
                              const taxVal = Math.round((basicVal + hraVal + allowancesVal) * 0.15);
                              
                              downloadEmployeePayslip(
                                emp,
                                companyInfo || { name: 'ITLC Workspace' },
                                {
                                  month: slip.month,
                                  year: slip.year,
                                  basic: basicVal,
                                  hra: hraVal,
                                  allowances: allowancesVal,
                                  overtime: slip.overtime || 0,
                                  reimbursement: slip.reimbursements || 0,
                                  pf: pfVal,
                                  esi: esiVal,
                                  tax: taxVal,
                                  profTax: slip.profTax || 0,
                                  deductions: deductionsVal,
                                  netSalary: netVal,
                                  currency: currency
                                }
                              );
                            } catch (e) {
                              alert("Failed to download payslip PDF.");
                            }
                          }}
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
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Professional Tax (Flat PT)</span>
                <input 
                  type="number" 
                  value={profTax} 
                  onChange={(e) => setProfTax(Number(e.target.value) || 0)} 
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
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Reimbursements Gateway</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Approved employee expense claims automatically queue directly into the current payroll run as tax-free reimbursements.
              </p>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Employee Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter(e => e.status === 'Approved').map(exp => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 700 }}>#{exp.id}</td>
                      <td>{exp.employeeName}</td>
                      <td>{exp.category}</td>
                      <td>{exp.description}</td>
                      <td className="number-font" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{cSymbol}{exp.amount}</td>
                      <td>
                        <span className="badge badge-success">Approved</span>
                      </td>
                    </tr>
                  ))}
                  {expenses.filter(e => e.status === 'Approved').length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No approved reimbursement claims queued.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 7: F&F Settlement */}
        {subTab === 'ff' && (
          <motion.div
            key="ff"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}
          >
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Landmark size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Full & Final (F&F) Settlement</span>
              </h3>

              <form onSubmit={handleProcessFF} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Resigning Employee</label>
                  <select 
                    value={ffEmpId} 
                    onChange={(e) => setFfEmpId(e.target.value)}
                    className="premium-input"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div className="premium-form-group">
                  <label className="premium-label">Resignation/Relieving Date</label>
                  <input 
                    type="date" 
                    required 
                    value={resignationDate} 
                    onChange={(e) => setResignationDate(e.target.value)}
                    className="premium-input" 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Unpaid Salary Days</label>
                    <input 
                      type="number" 
                      value={unpaidDays} 
                      onChange={(e) => setUnpaidDays(Number(e.target.value) || 0)}
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Encashable Leave Days</label>
                    <input 
                      type="number" 
                      value={leaveEncashmentDays} 
                      onChange={(e) => setLeaveEncashmentDays(Number(e.target.value) || 0)}
                      className="premium-input" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Gratuity Amount ({currency})</label>
                    <input 
                      type="number" 
                      value={gratuityAmount} 
                      onChange={(e) => setGratuityAmount(Number(e.target.value) || 0)}
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Notice Period Buyout ({currency})</label>
                    <input 
                      type="number" 
                      value={noticePeriodAllowance} 
                      onChange={(e) => setNoticePeriodAllowance(Number(e.target.value) || 0)}
                      className="premium-input" 
                    />
                  </div>
                </div>

                <div className="premium-form-group">
                  <label className="premium-label">Other Deductions / Dues ({currency})</label>
                  <input 
                    type="number" 
                    value={ffOtherDeductions} 
                    onChange={(e) => setFfOtherDeductions(Number(e.target.value) || 0)}
                    className="premium-input" 
                  />
                </div>

                <button type="submit" className="premium-btn premium-btn-success" style={{ width: '100%', height: 42, justifyContent: 'center' }}>
                  Disburse F&F Settlement
                </button>
              </form>
            </div>

            {/* F&F Summary Preview */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>F&F Settlement Statement</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Unpaid Working Salary ({unpaidDays} Days):</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{unpaidSalaryAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Leave Encashment ({leaveEncashmentDays} Days):</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{leaveEncashmentAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Gratuity Benefit:</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Number(gratuityAmount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Notice Period Buyout:</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Number(noticePeriodAllowance).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444' }}>
                  <span>Dues & Deductions:</span>
                  <strong className="number-font">-{cSymbol}{Number(ffOtherDeductions).toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                <div>
                  <span style={{ fontSize: '0.65rem' }} className="premium-label">Net Settlement Amount</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Includes taxes and standard benefits</p>
                </div>
                <h4 className="number-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {cSymbol}{ffNetPayable.toLocaleString()}
                </h4>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 8: Reports */}
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Payroll Sheets & Statutory Forms</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                Download Form 16 Tax Statement certificate or compile compliance excel return reports for the selected employee.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDownloadAnnualReports} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
                <FileText size={16} />
                <span>Download Form 16</span>
              </button>
              
              <button 
                onClick={() => {
                  let csv = "ID,Employee Name,Month/Year,Base Pay,HRA,Allowances,Deductions,Overtime Pay,Reimbursements,Professional Tax,Net Paid,Type,Status\n";
                  payrollHistory.forEach(slip => {
                    csv += `"${slip.id}","${slip.employeeName}","${slip.month} ${slip.year}","${slip.basic}","${slip.hra}","${slip.allowances}","${slip.deductions}","${slip.overtime || 0}","${slip.reimbursements || 0}","${slip.profTax || 0}","${slip.netSalary}","${slip.type || 'Regular'}","${slip.status}"\n`;
                  });
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `HRMS_Payroll_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  alert("Payroll ledger export downloaded successfully!");
                }} 
                className="premium-btn premium-btn-secondary" 
                style={{ padding: '12px 24px' }}
              >
                <span>Export Compliance Excel</span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
