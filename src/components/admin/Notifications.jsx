import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Send, Radio } from 'lucide-react';

export default function Notifications() {
  const [channel, setChannel] = useState('email');
  const [template, setTemplate] = useState('welcome');
  const [customMsg, setCustomMsg] = useState('Welcome to the Antigravity HR portal! Please set up your login profile and secure credentials.');

  const templates = {
    welcome: 'Welcome to the Antigravity HR portal! Please set up your login profile and secure credentials.',
    holiday: 'Office Announcement: Independence Day holiday scheduled for July 04. All systems offline except DevOps support.',
    payroll: 'Payslip Disbursal notification: Payroll cycle has been processed and disbursal receipts are ready in your dashboard.',
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    setCustomMsg(templates[e.target.value]);
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    alert(`Announcements broadcasted via [${channel.toUpperCase()}] channel using [${template}] draft template.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="premium-card" style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        
        {/* Templates Panel */}
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Broadcast Systems</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Send announcements or notifications across multiple gateways</span>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Select Gateway</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {[
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'sms', label: 'SMS', icon: Radio },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
              ].map(gate => {
                const Icon = gate.icon;
                return (
                  <button
                    key={gate.id}
                    type="button"
                    onClick={() => setChannel(gate.id)}
                    className={`premium-btn ${channel === gate.id ? `${gate.id}-active` : 'chrome-box-inactive'}`}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                    }}
                  >
                    <Icon size={14} />
                    <span>{gate.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Template Preset</label>
            <select 
              value={template} 
              onChange={handleTemplateChange}
              className="premium-input"
            >
              <option value="welcome">Welcome Onboarding Message</option>
              <option value="holiday">Holiday Notice</option>
              <option value="payroll">Payroll Alert</option>
            </select>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Message Draft</label>
            <textarea 
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="premium-input"
              rows={4}
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="premium-btn premium-btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Send size={14} />
            <span>Send Announcement</span>
          </button>
        </form>

        {/* Audit Announcement list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Broadcast History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">Email Sent</span>
                <span className="number-font" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>June 30, 2026</span>
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: 6, fontWeight: 500 }}>"Monthly salary statements are available in the portal..."</p>
            </div>
            <div style={{ padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-info">WhatsApp Sent</span>
                <span className="number-font" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>June 15, 2026</span>
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: 6, fontWeight: 500 }}>"Security audit warning: Please renew password configurations..."</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
