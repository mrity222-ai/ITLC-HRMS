import React, { useState } from 'react';
import { FileText, FileSpreadsheet, ArrowDownCircle, CheckSquare, Square } from 'lucide-react';

const reportTypes = [
  { id: 'attendance', label: 'Attendance Reports', desc: 'Punch logs, shift reports, check-in averages.' },
  { id: 'payroll', label: 'Payroll & Compensation', desc: 'Salary dispersals, allowances, tax breakdowns.' },
  { id: 'leave', label: 'Leave & Absences', desc: 'Remaining days, type averages, approval rates.' },
  { id: 'employee', label: 'Employee Records', desc: 'Personal details, contracts, contact metrics.' },
  { id: 'dept', label: 'Department Analytics', desc: 'Budget allocation, staff ratios, head count trends.' },
];

export default function Reports() {
  const [selected, setSelected] = useState(['attendance', 'payroll']);
  const [generating, setGenerating] = useState(false);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleGenerate = (format) => {
    if (selected.length === 0) {
      alert("Please select at least one report category!");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`Report Package generated and downloaded successfully as a .${format} archive!`);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Custom Report Assembler</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Select the modules you wish to package into your compiled report</p>
        </div>

        {/* Checkbox selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reportTypes.map(rep => {
            const isChecked = selected.includes(rep.id);
            return (
              <div 
                key={rep.id}
                onClick={() => toggleSelect(rep.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 14,
                  border: isChecked ? '1px solid var(--color-primary)' : '1px solid #E2E8F0',
                  background: isChecked ? 'var(--color-primary-light)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ color: isChecked ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                  {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rep.label}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{rep.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action triggers */}
        <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 20, alignItems: 'center' }}>
          <button 
            disabled={generating}
            onClick={() => handleGenerate('pdf')}
            className="premium-btn premium-btn-primary"
            style={{ opacity: generating ? 0.7 : 1 }}
          >
            <FileText size={16} />
            <span>{generating ? 'Compiling Archive...' : 'Download PDF Package'}</span>
          </button>

          <button 
            disabled={generating}
            onClick={() => handleGenerate('xlsx')}
            className="premium-btn premium-btn-secondary"
            style={{ opacity: generating ? 0.7 : 1 }}
          >
            <FileSpreadsheet size={16} />
            <span>Download Excel Package</span>
          </button>
        </div>
      </div>
    </div>
  );
}
