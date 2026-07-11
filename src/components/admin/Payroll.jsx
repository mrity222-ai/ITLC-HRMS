import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Calculator, Download, Percent, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

const mockPayslipHistory = [];

export default function Payroll({ employees, subTab = 'dashboard', setActiveTab }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 1);
  const [bonus, setBonus] = useState(500);
  const [deductions, setDeductions] = useState(200);
  const [attendance, setAttendance] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(false);

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
  const totalWorkingDays = 22;
  const payoutRatio = attendance.length === 0 ? 1.0 : Math.min(1.0, activeDays / totalWorkingDays);

  const baseSalary = (selectedEmp && typeof selectedEmp.salary === 'string') 
    ? parseFloat(selectedEmp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 
    : (selectedEmp && typeof selectedEmp.salary === 'number')
    ? selectedEmp.salary / 12
    : 5000;
  const adjustedBaseSalary = baseSalary * payoutRatio;

  const pf = Math.round(adjustedBaseSalary * 0.12);
  const esi = Math.round(adjustedBaseSalary * 0.0175);
  const tax = Math.round((adjustedBaseSalary + Number(bonus)) * 0.15); // 15% flat rate
  const netPay = Math.round(adjustedBaseSalary + Number(bonus) - Number(deductions) - pf - esi - tax);

  const handleDownloadPayslip = () => {
    alert(`Downloading Payslip for ${selectedEmp.name} (July 2026). PDF generated successfully!`);
  };

  const handleRunBulkPayroll = () => {
    alert(`Bulk payroll processing initialized! ₹${(240000).toLocaleString()} net salary disbursed across ${employees.length} employee accounts.`);
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
                    <label className="premium-label">Bonus (USD)</label>
                    <input 
                      type="number" 
                      value={bonus} 
                      onChange={(e) => setBonus(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Deductions (USD)</label>
                    <input 
                      type="number" 
                      value={deductions} 
                      onChange={(e) => setDeductions(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleDownloadPayslip}
                  className="premium-btn premium-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 10 }}
                >
                  <Download size={16} />
                  <span>Download PDF Payslip</span>
                </button>
              </div>
            </div>

            {/* Payslip preview */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Breakdown Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Basic Base Salary (Monthly):</span>
                  <span className="number-font" style={{ fontWeight: 600 }}>₹{Math.round(baseSalary).toLocaleString()}</span>
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
                  <span className="number-font" style={{ fontWeight: 600 }}>₹{Math.round(adjustedBaseSalary).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Performance Bonus:</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+₹{bonus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Provident Fund (PF 12%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-₹{pf}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>State Insurance (ESI 1.75%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-₹{esi}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Tax Deductions (TDS 15%):</span>
                  <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-₹{tax}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                <div>
                  <span className="premium-label" style={{ fontSize: '0.65rem' }}>Estimated Net Pay</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Direct bank wire payment</p>
                </div>
                <h4 className="number-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{netPay.toLocaleString()}
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
                    <td className="number-font">50% of CTC</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>House Rent Allowance (HRA)</td>
                    <td>Earning</td>
                    <td className="number-font">40% of Basic Pay</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Provident Fund (PF)</td>
                    <td>Deduction</td>
                    <td className="number-font">12% of Basic Pay</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Run Payroll */}
        {subTab === 'run' && (
          <motion.div
            key="run"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Initialize Monthly Payroll Run</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 450, margin: '0 auto', lineHeight: 1.5 }}>
                Disburse compensation across all active bank wires. Total aggregate volume estimation is **₹240K** for this cycle.
              </p>
            </div>

            <button onClick={handleRunBulkPayroll} className="premium-btn premium-btn-primary" style={{ padding: '12px 32px' }}>
              <CreditCard size={16} />
              <span>Disburse Net Salaries</span>
            </button>
          </motion.div>
        )}

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
                  {mockPayslipHistory.map(slip => (
                    <tr key={slip.id}>
                      <td style={{ fontWeight: 700 }}>{slip.id}</td>
                      <td style={{ fontSize: '0.8rem' }}>{slip.date}</td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{slip.amount}</td>
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
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>TDS Flat Rate</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6 }} className="number-font">15.00%</div>
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>PF Contribution</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6 }} className="number-font">12.00%</div>
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>ESI Medical</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6 }} className="number-font">1.75%</div>
              </div>
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
