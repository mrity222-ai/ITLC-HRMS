import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, AlertCircle, CheckCircle, Clock, Send, MessageSquare, ChevronRight, RefreshCw, User } from 'lucide-react';
import { api } from '../../services/api';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('Active'); // Active vs Resolved

  // Load tickets on mount
  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await api.getAdminTickets();
      // Ensure it's an array
      if (Array.isArray(list)) {
        setTickets(list);
        if (list.length > 0 && !selectedTicketId) {
          setSelectedTicketId(list[0].id);
        }
      }
    } catch (err) {
      setError('Failed to fetch support tickets. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Parse messages from JSON string
  const getMessages = (ticket) => {
    if (!ticket) return [];
    try {
      return JSON.parse(ticket.messagesJson || '[]');
    } catch (e) {
      return [];
    }
  };

  // Submit reply message
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setReplyLoading(true);
    try {
      const messages = getMessages(selectedTicket);
      const newMsg = {
        id: `msg_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        senderName: 'Company Admin',
        senderRole: 'Admin',
        content: replyText,
        timestamp: new Date().toISOString(),
        isAgent: true
      };
      
      const updatedMessages = [...messages, newMsg];
      
      // Update in DB
      const updatedTicket = await api.updateAdminTicket(selectedTicket.id, {
        messagesJson: JSON.stringify(updatedMessages),
        status: selectedTicket.status === 'open' ? 'pending' : selectedTicket.status
      });

      // Update in local state list
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setReplyText('');
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  // Update Status directly
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updatedTicket = await api.updateAdminTicket(selectedTicket.id, {
        status: newStatus
      });
      // Update in local state list
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Badges styling helper
  const getPriorityStyle = (p) => {
    switch (p ? p.toLowerCase() : '') {
      case 'urgent':
        return { bg: '#FFEBEB', color: '#D32F2F', label: 'Urgent' };
      case 'high':
        return { bg: '#FFF3E0', color: '#EF6C00', label: 'High' };
      case 'medium':
        return { bg: '#E8F5E9', color: '#2E7D32', label: 'Medium' };
      default:
        return { bg: '#F1F5F9', color: '#475569', label: 'Low' };
    }
  };

  const getStatusStyle = (s) => {
    switch (s ? s.toLowerCase() : '') {
      case 'open':
        return { bg: '#E0F2FE', color: '#0369A1', label: 'Open' };
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706', label: 'Pending' };
      case 'resolved':
        return { bg: '#DCFCE7', color: '#15803D', label: 'Resolved' };
      default:
        return { bg: '#F1F5F9', color: '#475569', label: 'Closed' };
    }
  };

  // Filter list
  const filteredTickets = tickets.filter(t => {
    const isClosed = t.status === 'resolved';
    return filterTab === 'Closed' ? isClosed : !isClosed;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: 'calc(100vh - 120px)' }}>
      {/* Top Header Card */}
      <div className="premium-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(90deg, #0F172A 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Helpdesk & Support Center</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Manage employee support requests, IT queries, and HR service tickets.</p>
        </div>
        <button onClick={loadTickets} className="premium-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: 16, background: '#FFF5F5', border: '1px solid #FFE3E3', color: '#E53E3E', borderRadius: 16, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Main Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Ticket List */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tab Filter switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', gap: 12, flexShrink: 0 }}>
            {['Active', 'Closed'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: filterTab === tab ? 'var(--color-primary-light)' : 'transparent',
                  color: filterTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {tab} Tickets ({tickets.filter(t => {
                  const isClosed = t.status === 'resolved';
                  return tab === 'Closed' ? isClosed : !isClosed;
                }).length})
              </button>
            ))}
          </div>

          {/* Ticket Listing container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Loading support tickets...
              </div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map(t => {
                const priority = getPriorityStyle(t.priority);
                const status = getStatusStyle(t.status);
                const isSelected = selectedTicketId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid #E2E8F0',
                      background: isSelected ? 'rgba(79, 70, 229, 0.03)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{t.id}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: priority.bg, color: priority.color, fontWeight: 700 }}>
                          {priority.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: status.bg, color: status.color, fontWeight: 700 }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>{t.subject}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>From: {t.requesterName} ({t.requesterEmail})</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                      <span>Created: {t.createdDate}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: 48, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                No {filterTab.toLowerCase()} support tickets found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Conversation Thread */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedTicket ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Header: Ticket details */}
              <div style={{ padding: 20, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{selectedTicket.id}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{selectedTicket.subject}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    Opened by <strong>{selectedTicket.requesterName}</strong> ({selectedTicket.requesterEmail}) on {selectedTicket.createdDate}
                  </p>
                </div>
                
                {/* Actions: Change Status */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedTicket.status !== 'resolved' ? (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="premium-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#10B981', color: '#10B981', background: '#ECFDF5' }}
                    >
                      <CheckCircle size={12} />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus('open')}
                      className="premium-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: '#F5F3FF' }}
                    >
                      <RefreshCw size={12} />
                      <span>Re-open Ticket</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread Scroll Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#F8FAFC' }}>
                {getMessages(selectedTicket).map((msg, index) => {
                  const isAdmin = msg.isAgent || msg.senderRole === 'Admin';
                  return (
                    <div
                      key={msg.id || index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                        <User size={10} />
                        <span>{msg.senderName} ({msg.senderRole})</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: 16,
                        borderBottomLeftRadius: isAdmin ? 16 : 4,
                        borderBottomRightRadius: isAdmin ? 4 : 16,
                        background: isAdmin ? 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' : '#FFFFFF',
                        color: isAdmin ? '#FFFFFF' : '#0F172A',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                        border: isAdmin ? 'none' : '1px solid #E2E8F0',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom: Send Message Form */}
              {selectedTicket.status !== 'resolved' ? (
                <form onSubmit={handleSendReply} style={{ padding: 16, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a message reply to help resolution..."
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      outline: 'none',
                      fontSize: '0.8rem',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={replyLoading || !replyText.trim()}
                    className="premium-btn premium-btn-primary"
                    style={{
                      height: 48,
                      width: 48,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <div style={{ padding: 16, borderTop: '1px solid #E2E8F0', textAlign: 'center', background: '#F1F5F9', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                  This support ticket is resolved and closed. Re-open it from actions to reply.
                </div>
              )}

            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--color-text-secondary)', padding: 48 }}>
              <LifeBuoy size={48} style={{ opacity: 0.3 }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Select a Service Ticket</h3>
              <p style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: 280 }}>Choose any open support ticket from the list on the left to start communicating or resolve it.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
