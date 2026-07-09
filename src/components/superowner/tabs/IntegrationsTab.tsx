import React, { useState } from 'react';
import { 
  Globe, Calendar, Video, MessageSquare, Code, 
  CheckCircle2, RotateCw, Plus, Trash2, Key
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
}

export const IntegrationsTab: React.FC = () => {
  const { addToast, addLog } = useDashboard();
  
  const [integrations, setIntegrations] = useState([
    { id: 'google', name: 'Google Workspace', desc: 'Sync employee directory, calendars & logins', icon: Globe, connected: true },
    { id: 'm365', name: 'Microsoft 365', desc: 'Sync active directory logs & corporate calendars', icon: Calendar, connected: false },
    { id: 'slack', name: 'Slack Bot', desc: 'Dispatch check-in logs & alerts to corporate channels', icon: MessageSquare, connected: true },
    { id: 'zoom', name: 'Zoom API', desc: 'Schedule video interviews in recruitment flows', icon: Video, connected: false },
    { id: 'teams', name: 'Microsoft Teams', desc: 'Integrate team alerts & calendars', icon: Video, connected: false },
    { id: 'whatsapp', name: 'WhatsApp Enterprise', desc: 'Broadcast payslips & attendance notices directly', icon: MessageSquare, connected: true },
  ]);


  // Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: 'wh_1', url: 'https://api.acme.com/webhooks/hrms', events: ['employee.created', 'payment.succeeded'], status: 'active' }
  ]);
  const [newWhUrl, setNewWhUrl] = useState('');

  // API Tokens
  const [apiKey, setApiKey] = useState('sk_live_placeholder_key_xxxx_xxxx');
  const [showKey, setShowKey] = useState(false);

  const toggleIntegration = (id: string, name: string, current: boolean) => {
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, connected: !current } : item));
    const action = !current ? 'Connected' : 'Disconnected';
    addToast(`${name} ${action}`, !current ? 'success' : 'warning');
    addLog('Integration Modified', `Third-party integration "${name}" status changed to ${action}.`, 'settings');
  };

  const handleGenerateKey = () => {
    const randomKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
    setApiKey(randomKey);
    addToast('New API Secret Key generated', 'success');
    addLog('API Key Rotated', 'Super Owner rotated platform system access API token.', 'security');
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhUrl.trim()) return;

    const newWh: Webhook = {
      id: `wh_${Math.random().toString(36).substring(2, 9)}`,
      url: newWhUrl,
      events: ['employee.created', 'attendance.clocked'],
      status: 'active'
    };

    setWebhooks(prev => [...prev, newWh]);
    setNewWhUrl('');
    addToast('Webhook endpoint added successfully', 'success');
    addLog('Webhook Created', `Registered new webhook callback receiver: ${newWhUrl}`, 'settings');
  };

  const handleDeleteWebhook = (id: string, url: string) => {
    if (confirm(`Remove webhook endpoint: ${url}?`)) {
      setWebhooks(prev => prev.filter(wh => wh.id !== id));
      addToast('Webhook endpoint removed', 'warning');
      addLog('Webhook Deleted', `Removed webhook callback receiver: ${url}`, 'settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Integrations & API
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect third-party enterprise tools, trigger custom Webhooks, or integrate custom software via REST API tokens.
        </p>
      </div>

      {/* Connection grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/20">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 shrink-0">
                <item.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-white text-sm block">{item.name}</span>
                <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className={`flex items-center gap-1.5 font-semibold text-[10px] ${item.connected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {item.connected ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>

              <button
                onClick={() => toggleIntegration(item.id, item.name, item.connected)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  item.connected 
                    ? 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/20 text-rose-300 hover:text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 border-transparent text-white shadow-lg shadow-indigo-600/15'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Keys and Webhooks Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Tokens */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Key className="h-4 w-4 text-indigo-400" /> REST API Access Keys</h3>
            <p className="text-xs text-slate-400 mb-6">Expose tenant registries securely for custom corporate software configurations.</p>
            
            <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-3">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Super Admin Master Key</label>
              
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="glass-input flex-1 font-mono text-xs px-3 py-2 rounded-xl text-slate-300 select-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                >
                  {showKey ? 'Hide' : 'Reveal'}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <button
              onClick={handleGenerateKey}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <RotateCw className="h-3.5 w-3.5" /> Rotate Secret Token
            </button>
            <span className="flex items-center gap-1 font-mono text-[10px]"><Code className="h-3.5 w-3.5" /> Read Developer API</span>
          </div>
        </div>

        {/* Webhooks config */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2"><Code className="h-4 w-4 text-indigo-400" /> Platform Webhooks</h3>
            <p className="text-xs text-slate-400 mb-6">Listen to database activities (employee hire, subscription renews) in real-time.</p>

            <form onSubmit={handleAddWebhook} className="flex gap-2 mb-4">
              <input
                type="url"
                required
                placeholder="https://client-api.com/v1/webhook-receiver"
                value={newWhUrl}
                onChange={(e) => setNewWhUrl(e.target.value)}
                className="glass-input flex-1 px-3.5 py-1.5 rounded-xl text-xs text-slate-200"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
              >
                <Plus className="h-4 w-4" /> Add Receiver
              </button>
            </form>

            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-3 rounded-xl bg-white/2 border border-white/5 text-xs flex justify-between items-center">
                  <div className="space-y-1.5 truncate pr-4">
                    <span className="font-mono text-slate-300 font-medium block truncate select-all">{wh.url}</span>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map(ev => (
                        <span key={ev} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 text-[8px] font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteWebhook(wh.id, wh.url)}
                    className="p-1 rounded bg-white/5 hover:bg-rose-600 hover:text-white border border-white/5 text-slate-400 transition shrink-0"
                    title="Remove Webhook"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active Webhook Services running</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IntegrationsTab;
