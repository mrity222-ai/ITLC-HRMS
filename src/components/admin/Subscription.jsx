import React, { useState, useEffect } from 'react';
import { BadgeCheck, CreditCard, HardDrive, Cpu, Users, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { downloadPaymentSlip } from '../../utils/PaymentSlip';

const PLANS = [
  { id: 'free_trial', name: 'Free Trial', price: '$0', employees: 20, storage: 1, desc: 'Ideal for small startup evaluations.' },
  { id: 'starter', name: 'Starter Pack', price: '$99', employees: 50, storage: 5, desc: 'Great for growing small businesses.' },
  { id: 'premium', name: 'Premium Business', price: '$199', employees: 150, storage: 20, desc: 'Advanced features for scaling companies.' },
  { id: 'enterprise', name: 'Enterprise Suite', price: '$499', employees: 500, storage: 100, desc: 'Complete enterprise-grade security and capabilities.' },
];

export default function Subscription() {
  const [profile, setProfile] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBillingInfo = async () => {
    try {
      const prof = await api.getProfile();
      setProfile(prof);

      // Fetch employees to count actual usage
      const emps = await api.getEmployees();
      setEmployeeCount(emps.length);
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const handleOpenUpgrade = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    try {
      const result = await api.upgradeSubscription(selectedPlan.id);
      alert(`Payment of ${selectedPlan.price}/month confirmed! Your subscription has been successfully updated to ${selectedPlan.name}.`);
      setIsModalOpen(false);
      await fetchBillingInfo();
      
      if (result.payment) {
        downloadPaymentSlip(result.payment, result.company);
      }
    } catch (err) {
      alert(err.message || 'Upgrade failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="h-8 w-8 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const company = profile?.companyDetails || {
    subscriptionPlanId: 'free_trial',
    maxEmployees: 20,
    storageLimit: 1.0,
    storageUsed: 0.0,
    status: 'trial'
  };

  const activePlan = PLANS.find(p => p.id === company.subscriptionPlanId) || PLANS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Plan Card & Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Tier Details Card */}
        <div className="premium-card" style={{ 
          padding: 28, 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.07) 0%, rgba(6, 182, 212, 0.04) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 320,
          border: '1px solid rgba(79, 70, 229, 0.2)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#4f46e5', color: '#fff' }}>
                Active Plan
              </span>
              <span className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activePlan.price} / mo</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 14, color: '#fff' }}>{activePlan.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{activePlan.desc}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#34d399' }} />
              <span>Up to {activePlan.employees} Employee Workspace entries</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#34d399' }} />
              <span>Up to {activePlan.storage} GB Cloud Storage limit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#34d399' }} />
              <span>Automatic backups & real-time analytics access</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: '#34d399' }} />
            <span>Workspace isolated under Tenant ID: {company.id}</span>
          </div>
        </div>

        {/* Meters Panel */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#fff' }}>Resource Metering</h3>
          
          {/* Storage Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                <HardDrive size={14} style={{ color: '#64748b' }} />
                <span>Cloud Storage</span>
              </div>
              <strong className="number-font" style={{ color: '#fff' }}>
                {Number(company.storageUsed).toFixed(2)} GB / {company.storageLimit} GB
              </strong>
            </div>
            <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(100, (company.storageUsed / company.storageLimit) * 100)}%`, 
                  height: '100%', 
                  backgroundColor: '#4f46e5' 
                }} 
              />
            </div>
          </div>

          {/* Employee Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                <Users size={14} style={{ color: '#64748b' }} />
                <span>Employee Database Limit</span>
              </div>
              <strong className="number-font" style={{ color: '#fff' }}>
                {employeeCount} / {company.maxEmployees}
              </strong>
            </div>
            <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(100, (employeeCount / company.maxEmployees) * 100)}%`, 
                  height: '100%', 
                  backgroundColor: '#06b6d4' 
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Selection Grid */}
      <div className="premium-card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Select Subscription Upgrade</h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 24 }}>Choose the plan that fits your business scale. Subscriptions are billed monthly.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {PLANS.map((plan) => {
            const isCurrent = company.subscriptionPlanId === plan.id;
            return (
              <div 
                key={plan.id} 
                className="premium-card" 
                style={{ 
                  padding: 20, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isCurrent ? '2px solid #4f46e5' : '1px solid rgba(255,255,255,0.05)',
                  background: isCurrent ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.01)',
                  borderRadius: '16px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{plan.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 8px 0' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{plan.price}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ month</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 16 }}>{plan.desc}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.7rem', color: '#94a3b8', marginBottom: 20 }}>
                    <div>• Up to {plan.employees} employees</div>
                    <div>• Up to {plan.storage} GB storage</div>
                  </div>
                </div>

                {isCurrent ? (
                  <button 
                    disabled 
                    className="premium-btn" 
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', cursor: 'default' }}
                  >
                    Current active plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenUpgrade(plan)} 
                    className="premium-btn premium-btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Upgrade / Select
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="premium-card animate-zoom" style={{ width: '100%', maxWidth: '400px', padding: 28, background: '#0f172a', border: '1px solid #334155', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} style={{ color: '#4f46e5' }} />
              <span>Confirm Subscription Upgrade</span>
            </h3>
            
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '14px 0', lineHeight: 1.5 }}>
              You are upgrading to the <strong style={{ color: '#fff' }}>{selectedPlan.name}</strong>. You will be billed <strong style={{ color: '#fff' }}>{selectedPlan.price}/month</strong> starting today.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>
                <span>Employee Limit increases to:</span>
                <strong style={{ color: '#fff' }}>{selectedPlan.employees}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>Storage Limit increases to:</span>
                <strong style={{ color: '#fff' }}>{selectedPlan.storage} GB</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                disabled={isProcessing}
                onClick={() => setIsModalOpen(false)} 
                className="premium-btn premium-btn-secondary"
              >
                Cancel
              </button>
              <button 
                disabled={isProcessing}
                onClick={handleConfirmUpgrade} 
                className="premium-btn premium-btn-primary"
              >
                {isProcessing ? 'Processing Payment...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
