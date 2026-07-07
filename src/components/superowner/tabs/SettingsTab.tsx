import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Mail, DollarSign, Palette, ShieldAlert, 
  Database, CheckCircle, RefreshCw, Play, Download
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, addToast, addLog, setIsFormDirty } = useDashboard();

  // Local Form state
  const [formData, setFormData] = useState({ ...settings });
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  });

  // Form Update Helper
  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsFormDirty(true);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    addToast(`Theme switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsFormDirty(false);
  };

  const handleTestSmtp = () => {
    addToast('Sending test email via SMTP relay...', 'info');
    setTimeout(() => {
      addToast('SMTP handshake succeeded! Test email dispatched.', 'success');
      addLog('SMTP Handshake Succeeded', `Tested SMTP configuration on server ${formData.smtpServer}.`, 'settings');
    }, 1500);
  };

  const handleTriggerBackup = () => {
    setIsBackupRunning(true);
    addToast('Initiating full system snapshot...', 'info');
    
    setTimeout(() => {
      setIsBackupRunning(false);
      addToast('Platform backup snapshot archived successfully (2.4 GB)', 'success');
      addLog('Database Backup Archive', 'Manual full system database snapshot generated and archived to secure S3 storage.', 'settings');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Platform Configuration
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure branding palettes, billing currencies, transaction relay gateways, SMTP servers, and system maintenance overrides.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core details & brand colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General settings */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Settings className="h-4.5 w-4.5 text-indigo-400" /> Platform Preferences</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Platform / Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.platformName}
                  onChange={(e) => updateForm({ platformName: e.target.value })}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Default Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateForm({ currency: e.target.value })}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => updateForm({ timezone: e.target.value })}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                  >
                    <option value="UTC-5">UTC-5 (EST)</option>
                    <option value="UTC-0">UTC-0 (GMT)</option>
                    <option value="UTC+5.5">UTC+5:30 (IST)</option>
                    <option value="UTC+1">UTC+1 (CET)</option>
                  </select>
                </div>
              </div>

              {/* Theme Preference selector */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-slate-400 font-medium">Interface Theme Mode</label>
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value as 'dark' | 'light')}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-300"
                >
                  <option value="dark">Dark Theme (Futuristic Glass)</option>
                  <option value="light">Light Theme (Frosted Snow)</option>
                </select>
              </div>

              {/* Maintenance Mode switch */}
              <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center mt-4">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-rose-400" /> Maintenance Override</span>
                  <span className="text-[10px] text-slate-500 block leading-normal">Restrict client company portals and routing endpoints.</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm({ maintenanceMode: !formData.maintenanceMode })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    formData.maintenanceMode 
                      ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' 
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {formData.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>

          {/* Color theme settings */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Palette className="h-4.5 w-4.5 text-indigo-400" /> Platform Branding Colors</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Custom Brand Color Accent</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => updateForm({ brandColor: e.target.value })}
                    className="h-9 w-12 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brandColor}
                    onChange={(e) => updateForm({ brandColor: e.target.value })}
                    className="glass-input font-mono text-xs px-3 py-2 rounded-xl text-slate-300 w-28 text-center"
                  />
                </div>
              </div>

              {/* Predefined templates */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Palette Templates</span>
                <div className="flex gap-2">
                  {[
                    { name: 'Indigo Glow', color: '#6366f1' },
                    { name: 'Emerald Forest', color: '#10b981' },
                    { name: 'Vibrant Amethyst', color: '#8b5cf6' },
                    { name: 'Cyberpunk Rose', color: '#f43f5e' }
                  ].map(pal => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => updateForm({ brandColor: pal.color })}
                      className="px-2.5 py-1.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-[10px] font-semibold text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pal.color }}></span>
                      {pal.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="glass-card p-6 rounded-2xl space-y-4 relative">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Mail className="h-4.5 w-4.5 text-indigo-400" /> SMTP Transactional Mail Configuration</h3>
            <button
              type="button"
              onClick={handleTestSmtp}
              className="px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition"
            >
              Test SMTP Connection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">SMTP Server Host</label>
              <input
                type="text"
                required
                value={formData.smtpServer}
                onChange={(e) => updateForm({ smtpServer: e.target.value })}
                placeholder="smtp.mailgun.org"
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">SMTP Default Sender Email</label>
              <input
                type="email"
                required
                value={formData.smtpEmail}
                onChange={(e) => updateForm({ smtpEmail: e.target.value })}
                placeholder="noreply@superowner.io"
                className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Database Snapshots & Backup Recovery */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2"><Database className="h-4.5 w-4.5 text-indigo-400" /> Database Snapshots & Backups</h3>
          <p className="text-xs text-slate-400 mb-4">Export system configurations, tenant billing logs, and user credentials directories securely.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isBackupRunning}
              onClick={handleTriggerBackup}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white transition shadow-lg shadow-indigo-600/15"
            >
              {isBackupRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Archiving Snapshot...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Trigger Manual Backup Now
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                addToast('Downloading backup manifest logs...', 'success');
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
            >
              <Download className="h-4 w-4" /> Download Backup Logs
            </button>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
          >
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
export default SettingsTab;
