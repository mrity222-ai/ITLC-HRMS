import React, { useState, useEffect } from 'react';
import { BadgeCheck, CreditCard, HardDrive, Cpu, Users, FileText, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { downloadPaymentSlip } from '../../utils/PaymentSlip';
import { INITIAL_PLANS } from '../superowner/dashboardData';

const RATES = { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79 };
const SYMBOLS = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };

export default function Subscription({ onSubscriptionUpdate }) {
  const [profile, setProfile] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const fetchBillingInfo = async () => {
    try {
      const prof = await api.getProfile();
      setProfile(prof);
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
      alert(`Payment of ${SYMBOLS[currency]}${(selectedPlan.price * RATES[currency]).toFixed(0)}/month confirmed! Your subscription has been successfully updated to ${selectedPlan.name}.`);
      setIsModalOpen(false);
      await fetchBillingInfo();
      
      if (result.payment) {
        downloadPaymentSlip(result.payment, result.company);
      }
      
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate();
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
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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

  const activePlan = INITIAL_PLANS.find(p => p.id === company.subscriptionPlanId) || INITIAL_PLANS[0];

  const formatPrice = (usdPrice) => {
    if (usdPrice === 0) return `${SYMBOLS[currency]}0`;
    return `${SYMBOLS[currency]}${(usdPrice * RATES[currency]).toFixed(0)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: '#ffffff', borderRadius: '16px', padding: '24px' }}>
      
      {/* Header and Currency Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Subscription & Billing</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0 0' }}>Manage your subscription plan, usage, and billing settings.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Globe size={16} style={{ color: '#64748b' }} />
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Plan Card & Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Tier Details Card */}
        <div style={{ 
          padding: 28, 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 320,
          border: '1px solid rgba(79, 70, 229, 0.2)',
          borderRadius: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#4f46e5', color: '#fff', borderRadius: '999px', fontWeight: 700 }}>
                Active Plan
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatPrice(activePlan.price)} / mo</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 14, color: '#0f172a' }}>{activePlan.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Access to your HRMS features.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#10b981' }} />
              <span>Up to {activePlan.employeeLimit} Employee Workspace entries</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#10b981' }} />
              <span>Up to {activePlan.storageLimit} GB Cloud Storage limit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeCheck size={16} style={{ color: '#10b981' }} />
              <span>Automatic backups & real-time analytics access</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Workspace isolated under Tenant ID: {company.id}</span>
          </div>
        </div>

        {/* Meters Panel */}
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Resource Metering</h3>
          
          {/* Storage Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                <HardDrive size={14} style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 600 }}>Cloud Storage</span>
              </div>
              <strong style={{ color: '#0f172a' }}>
                {Number(company.storageUsed).toFixed(2)} GB / {company.storageLimit} GB
              </strong>
            </div>
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                <Users size={14} style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 600 }}>Employee Database Limit</span>
              </div>
              <strong style={{ color: '#0f172a' }}>
                {employeeCount} / {company.maxEmployees}
              </strong>
            </div>
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
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
      <div style={{ padding: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Select Subscription Upgrade</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 24 }}>Choose the plan that fits your business scale. Subscriptions are billed monthly.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {INITIAL_PLANS.map((plan) => {
            const isCurrent = company.subscriptionPlanId === plan.id;
            return (
              <div 
                key={plan.id} 
                style={{ 
                  padding: 24, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isCurrent ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: isCurrent ? '#f1f5f9' : '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{plan.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '16px 0 12px 0' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{formatPrice(plan.price)}</span>
                    <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>/ month</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', color: '#475569', marginBottom: 24, fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} style={{ color: '#4f46e5' }} /> Up to {plan.employeeLimit} employees
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} style={{ color: '#4f46e5' }} /> Up to {plan.storageLimit} GB storage
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} style={{ color: '#4f46e5' }} /> {plan.aiCreditsLimit} AI Credits
                    </div>
                  </div>
                </div>

                {isCurrent ? (
                  <button 
                    disabled 
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', background: '#e2e8f0', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'default' 
                    }}
                  >
                    Current active plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenUpgrade(plan)} 
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#4338ca'}
                    onMouseOut={(e) => e.target.style.background = '#4f46e5'}
                  >
                    Select Plan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: '420px', padding: 32, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={24} style={{ color: '#4f46e5' }} />
              Confirm Upgrade
            </h3>
            
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.6 }}>
              You are upgrading to the <strong style={{ color: '#0f172a' }}>{selectedPlan.name}</strong>. You will be billed <strong style={{ color: '#0f172a' }}>{formatPrice(selectedPlan.price)}/month</strong>.
            </p>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b', marginBottom: 8 }}>
                <span>Employee Limit:</span>
                <strong style={{ color: '#0f172a' }}>{selectedPlan.employeeLimit}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                <span>Storage Limit:</span>
                <strong style={{ color: '#0f172a' }}>{selectedPlan.storageLimit} GB</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                disabled={isProcessing}
                onClick={() => setIsModalOpen(false)} 
                style={{ padding: '10px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled={isProcessing}
                onClick={handleConfirmUpgrade} 
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {isProcessing ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
