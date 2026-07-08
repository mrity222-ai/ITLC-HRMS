import React, { useState, useEffect } from 'react';
import { Settings, Save, Globe, Key, Clock, ShieldCheck, Phone, MapPin, Percent } from 'lucide-react';
import { api } from '../../services/api';

export default function CompanySettings() {
  const [compName, setCompName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');
  const [currency, setCurrency] = useState('USD ($)');
  const [smtpServer, setSmtpServer] = useState('smtp.sendgrid.net');
  const [smsGateway, setSmsGateway] = useState('https://api.twilio.com/2010-04-01');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Admin Profile states
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await api.getAdminCompany();
        if (details) {
          setCompName(details.name || '');
          setCompEmail(details.email || '');
          setPhone(details.phone || '');
          setAddress(details.address || '');
          setGst(details.gst || '');
          setCurrency(details.currency || 'USD');
        }
      } catch (err) {
        console.error('Failed to load company details:', err);
      }

      try {
        const profile = await api.getProfile();
        if (profile) {
          setAdminName(profile.name || '');
          setAdminPhone(profile.phone || '');
          setAdminAvatar(profile.avatar || '');
        }
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      }
    };
    fetchDetails();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.updateAdminCompany({
        name: compName,
        phone,
        address,
        gst
      });
      setSuccess(true);
      
      // Notify components to update branding or trigger window reload for instant sidebar/header refresh
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name: adminName,
        phone: adminPhone,
        avatar: adminAvatar
      });
      alert('Profile updated successfully! Refreshing workspace...');
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {success && (
        <div style={{
          padding: '16px 20px',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: '0.85rem',
          fontWeight: 650,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
        }}>
          <ShieldCheck size={18} style={{ color: '#10B981', flexShrink: 0 }} />
          <span>Branding & Configuration parameters updated successfully! Syncing sidebars...</span>
        </div>
      )}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Core Company Profile Settings */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Company Profile & Branding</span>
          </h3>

          <div className="premium-form-group">
            <label className="premium-label">Legal Entity / Workspace Name</label>
            <input 
              type="text" 
              required
              value={compName} 
              onChange={(e) => setCompName(e.target.value)} 
              className="premium-input" 
              placeholder="e.g. ITLC HRMS"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Contact Email (Linked Account)</label>
            <input 
              type="email" 
              disabled
              readOnly
              value={compEmail} 
              className="premium-input bg-slate-100/50 cursor-not-allowed" 
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Contact Phone</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="premium-input" 
              placeholder="Company phone number"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Tax ID / GST Details</label>
            <input 
              type="text" 
              value={gst} 
              onChange={(e) => setGst(e.target.value)} 
              className="premium-input" 
              placeholder="GSTIN Number"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Office Address</label>
            <textarea 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="premium-input resize-none" 
              rows={2}
              placeholder="Entity address details"
            />
          </div>
        </div>

        {/* Admin Profile Settings */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <span>My Profile Settings</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {adminAvatar ? (
                <img src={adminAvatar} alt="Admin avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>A</span>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              id="admin-avatar-file" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                      setAdminAvatar(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label htmlFor="admin-avatar-file" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer' }}>
              📷 Upload Photo
            </label>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Admin Name</label>
            <input 
              type="text" 
              required
              value={adminName} 
              onChange={(e) => setAdminName(e.target.value)} 
              className="premium-input" 
              placeholder="e.g. Administrator"
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Admin Phone</label>
            <input 
              type="text" 
              value={adminPhone} 
              onChange={(e) => setAdminPhone(e.target.value)} 
              className="premium-input" 
              placeholder="Admin phone number"
            />
          </div>

          <button type="button" onClick={handleSaveAdminProfile} className="premium-btn premium-btn-primary" style={{ padding: '10px 20px', width: '100%', justifyContent: 'center' }}>
            <span>Save My Profile</span>
          </button>
        </div>

        {/* Gateways & Integrations Config */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} style={{ color: 'var(--color-accent)' }} />
            <span>Gateways & API Credentials</span>
          </h3>

          <div className="premium-form-group">
            <label className="premium-label">SMTP Server Host</label>
            <input 
              type="text" 
              required
              value={smtpServer} 
              onChange={(e) => setSmtpServer(e.target.value)} 
              className="premium-input" 
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">SMS Gateway API Root</label>
            <input 
              type="text" 
              required
              value={smsGateway} 
              onChange={(e) => setSmsGateway(e.target.value)} 
              className="premium-input" 
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-label">WhatsApp Cloud Business API Key</label>
            <input 
              type="password" 
              defaultValue="••••••••••••••••••••••••••••••••" 
              disabled
              className="premium-input" 
            />
          </div>
        </div>

        {/* Working Hours settings */}
        <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', gap: 16, flexDirection: 'row' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: 'var(--color-warning)' }} />
                <span>Working Hours & Branches</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Set standard work durations and branch operating parameters.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, flex: 2 }}>
              <div className="premium-form-group">
                <label className="premium-label">Standard Workday Start</label>
                <input type="time" defaultValue="09:00" className="premium-input" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Standard Workday End</label>
                <input type="time" defaultValue="17:00" className="premium-input" />
              </div>
              <div className="premium-form-group">
                <label className="premium-label">Branch HQ Coordinates</label>
                <input type="text" defaultValue="San Francisco, CA" className="premium-input" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(226,232,240,0.6)', paddingTop: 16 }}>
            <button type="submit" disabled={saving} className="premium-btn premium-btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              {saving ? (
                <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
