import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Users, Globe, Building, ShieldCheck, Download, 
  Upload, FileText, Landmark, Clock, Cpu, Heart, CheckCircle2, ChevronRight, ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { api } from '../../services/api';

// --- Helper: Animated Number Counter ---
function AnimatedCounter({ value, duration = 1000, currencySymbol = '$' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    if (start === end) return;
    let totalMiliseconds = duration;
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    incrementTime = Math.max(incrementTime, 12);
    
    let startTime = Date.now();
    let timer = setInterval(() => {
      let timePassed = Date.now() - startTime;
      let progress = Math.min(timePassed / totalMiliseconds, 1);
      let current = Math.floor(progress * end);
      setCount(current);
      if (progress === 1) {
        clearInterval(timer);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  const isPercent = value.toString().includes('%');
  const isCurrency = value.toString().includes('$') || value.toString().includes('₹') || value.toString().includes('€') || value.toString().includes('£') || value.toString().includes('¥');
  return <span className="number-font">{isCurrency && currencySymbol}{count.toLocaleString()}{isPercent && '%'}</span>;
}




// --- Recursive Org Node Component ---
function OrgNode({ member }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* Node Box */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '14px 20px',
          borderRadius: 16,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: 'var(--sidebar-border)',
          boxShadow: 'var(--glass-shadow)',
          cursor: hasChildren ? 'pointer' : 'default',
          textAlign: 'center',
          minWidth: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          position: 'relative',
          zIndex: 2
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{member.name}</span>
        <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>{member.role}</span>
        {hasChildren && (
          <div style={{ marginTop: 4, color: 'var(--color-text-tertiary)' }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {/* Children connector lines */}
      {hasChildren && expanded && (
        <div style={{
          display: 'flex',
          gap: 24,
          paddingTop: 30,
          position: 'relative'
        }}>
          {/* Vertical line connecting parent to branch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: 30,
            width: 2,
            background: 'var(--color-border)'
          }} />
          
          {member.children.map((child, idx) => (
            <OrgNode key={idx} member={child} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function Organization({ employees = [], setActiveTab, currency = 'USD' }) {
  const currencySymbol = (() => {
    switch (currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  })();
  const [branches, setBranches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'chart', 'working-info'

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data || []);
    } catch (err) {
      console.error('Error fetching branches', err);
    }
  };

  // Form states
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newManager, setNewManager] = useState('');
  const [newType, setNewType] = useState('Branch Office');

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newName || !newManager) return;
    const newBr = {
      name: newName,
      country: newCountry,
      address: '',
      manager: newManager,
      count: 0,
      phone: '',
      type: newType,
      status: 'Active'
    };
    try {
      await api.createBranch(newBr);
      fetchBranches();
      setNewName('');
      setNewCountry('United States');
      setNewManager('');
      setNewType('Branch Office');
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Error saving branch');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Close branch permanently? All associated personnel records will become orphaned.")) {
      try {
        await api.deleteBranch(id);
        fetchBranches();
      } catch (err) {
        alert(err.message || 'Error deleting branch');
      }
    }
  };

  // Hierarchy Data
  const ceoNode = {
    name: 'Marcus Vance',
    role: 'CEO & Founder',
    children: [
      {
        name: 'Kenji Sato',
        role: 'Director of Engineering',
        children: [
          { name: 'Matt Smith', role: 'Engineering Lead' }
        ]
      },
      {
        name: 'Sarah Jenkins',
        role: 'Director of Product',
        children: [
          { name: 'Bob Johnson', role: 'Design Lead' }
        ]
      },
      {
        name: 'Priya Sharma',
        role: 'Director of Operations',
        children: [
          { name: 'Diana Prince', role: 'HR Manager' }
        ]
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Navigation sub-tabs inside Organization */}
      <div className="premium-card" style={{ padding: '8px 12px', display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
        {[
          { id: 'overview', label: 'Company Overview' },
          { id: 'chart', label: 'Organization Chart' },
          { id: 'working-info', label: 'Working Information' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`premium-btn ${viewMode === tab.id ? 'chrome-box-active' : 'chrome-box-inactive'}`}
            style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 10 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Company Overview */}
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Company Metadata & Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
              
              {/* Left Card: Company Profile */}
              <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800
                  }}>A</div>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Antigravity Solutions</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Software & HR Solutions</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.7rem', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Reg Number:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>REG-2026-8924</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>GST Number:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>27AAACA1248Q1Z1</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>PAN Number:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>AAACA1248Q</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Founded:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>Jan 12, 2024</span>
                  </div>
                </div>
              </div>

              {/* Right Card: Branches and Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Branches List */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 800 }}>Active International Branches</h3>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      <Plus size={14} />
                      <span>Add Branch</span>
                    </button>
                  </div>

                  {showAddForm && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="premium-card" 
                      style={{ padding: 20, border: '1px solid var(--color-border)' }}
                    >
                      <form onSubmit={handleAddBranch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
                        <div className="premium-form-group" style={{ marginBottom: 0 }}>
                          <label className="premium-label" style={{ fontSize: '0.65rem' }}>Branch Name</label>
                          <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input" placeholder="e.g. Paris Hub" />
                        </div>
                        <div className="premium-form-group" style={{ marginBottom: 0 }}>
                          <label className="premium-label" style={{ fontSize: '0.65rem' }}>Manager</label>
                          <input type="text" required value={newManager} onChange={(e) => setNewManager(e.target.value)} className="premium-input" placeholder="e.g. Clara" />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save</button>
                          <button type="button" onClick={() => setShowAddForm(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {branches.map(br => (
                      <div key={br.id} style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{br.name}</span>
                          <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>{br.status}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.7rem', marginTop: 10, color: 'var(--color-text-secondary)' }}>
                          <span>Manager: {br.manager}</span>
                          <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{br.count} employees</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Health Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                  
                  {/* Health Score */}
                  <div className="premium-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="premium-label" style={{ fontSize: '0.6rem' }}>Company Health Score</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={14} style={{ color: 'var(--color-danger)' }} fill="var(--color-danger)" />
                      <span className="number-font" style={{ fontSize: '1.1rem', fontWeight: 800 }}>98.2 / 100</span>
                    </div>
                  </div>

                  {/* Quick Actions Console */}
                  <div className="premium-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <span className="premium-label" style={{ fontSize: '0.6rem' }}>Reports console</span>
                    <button onClick={() => alert("Organization Report generated successfully!")} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem', justifyContent: 'center' }}>
                      <FileText size={12} />
                      <span>Download Company Report</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Org Chart */}
        {viewMode === 'chart' && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ 
              padding: 40, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              overflowX: 'auto',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ alignSelf: 'flex-start', marginBottom: 30 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Interactive Corporate Tree</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Click nodes to expand or collapse child branches</span>
            </div>

            {/* Tree root node */}
            <OrgNode member={ceoNode} />
          </motion.div>
        )}

        {/* SUB-VIEW 3: Working Info */}
        {viewMode === 'working-info' && (
          <motion.div
            key="working-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Working Setup & Policies</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>Standard operational constraints across branches</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.6rem' }}>Office Timing Hours</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                  <span>09:00 AM - 05:00 PM</span>
                </div>
              </div>

              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.6rem' }}>Weekly Off Days</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6 }}>Saturday & Sunday</div>
              </div>

              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <span className="premium-label" style={{ fontSize: '0.6rem' }}>Payroll Wire Cycle</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6 }}>Monthly (End of Month)</div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
