import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, UserCheck, Calendar, ArrowRight, UserPlus, FileText, Plus, Star, Edit2, Trash2 } from 'lucide-react';

const initialOpenings = [];

const initialCandidates = [];

import { api } from '../../services/api';
import { useEffect } from 'react';

export default function Recruitment({ subTab = 'dashboard' }) {
  const [openings, setOpenings] = useState([]);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [showAddOpening, setShowAddOpening] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const list = await api.getAdminJobs();
        setOpenings(list);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    };
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Form states for Add Job
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newType, setNewType] = useState('Full-time');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newVacancies, setNewVacancies] = useState(1);

  // States for Edit Job Mode
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDept, setEditDept] = useState('Engineering');
  const [editType, setEditType] = useState('Full-time');
  const [editLocation, setEditLocation] = useState('Remote');
  const [editVacancies, setEditVacancies] = useState(1);
  const [editStatus, setEditStatus] = useState('Active');

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await api.createAdminJob({
        title: newTitle,
        department: newDept,
        type: newType,
        location: newLocation,
        vacancies: Number(newVacancies),
        status: 'Active'
      });
      const list = await api.getAdminJobs();
      setOpenings(list);
      setNewTitle('');
      setNewLocation('Remote');
      setNewVacancies(1);
      setShowAddOpening(false);
    } catch (err) {
      alert("Failed to create job opening");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;
    try {
      await api.deleteAdminJob(id);
      const list = await api.getAdminJobs();
      setOpenings(list);
    } catch (err) {
      alert("Failed to delete job opening");
    }
  };

  const handleEditJobSelect = (job) => {
    setEditingJob(job);
    setEditTitle(job.title || '');
    setEditDept(job.department || 'Engineering');
    setEditType(job.type || 'Full-time');
    setEditLocation(job.location || 'Remote');
    setEditVacancies(job.vacancies || 1);
    setEditStatus(job.status || 'Active');
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      await api.updateAdminJob(editingJob.id, {
        title: editTitle,
        department: editDept,
        type: editType,
        location: editLocation,
        vacancies: Number(editVacancies),
        status: editStatus
      });
      const list = await api.getAdminJobs();
      setOpenings(list);
      setEditingJob(null);
    } catch (err) {
      alert("Failed to update job opening");
    }
  };

  const moveCandidate = (id, nextStage) => {
    setCandidates(candidates.map(cand => 
      cand.id === id ? { ...cand, stage: nextStage } : cand
    ));
  };

  const scheduleInterview = (name) => {
    alert(`Interview invitation email scheduled for ${name}. Calendar invite sent!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard / Job Openings */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Active Job Postings</h3>
              <button onClick={() => setShowAddOpening(!showAddOpening)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px' }}>
                <Plus size={14} />
                <span>New Job</span>
              </button>
            </div>

            {showAddOpening && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card" 
                style={{ padding: 24, border: '1px solid var(--color-border)', borderRadius: '16px' }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 14 }}>Create Job Posting</h4>
                <form onSubmit={handleAddJob} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Role Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      className="premium-input" 
                      placeholder="e.g. Lead Designer"
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Department</label>
                    <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="premium-input">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Job Type</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)} className="premium-input">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Location</label>
                    <input 
                      type="text" 
                      required 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Vacancies</label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      value={newVacancies} 
                      onChange={(e) => setNewVacancies(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Save</button>
                    <button type="button" onClick={() => setShowAddOpening(false)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}

            {editingJob && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card" 
                style={{ padding: 24, border: '1px solid var(--color-primary-glow)', borderRadius: '16px' }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 14, color: 'var(--color-primary)' }}>Edit Job Posting</h4>
                <form onSubmit={handleUpdateJob} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Role Title</label>
                    <input 
                      type="text" 
                      required 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Department</label>
                    <select value={editDept} onChange={(e) => setEditDept(e.target.value)} className="premium-input">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Job Type</label>
                    <select value={editType} onChange={(e) => setEditType(e.target.value)} className="premium-input">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Location</label>
                    <input 
                      type="text" 
                      required 
                      value={editLocation} 
                      onChange={(e) => setEditLocation(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Vacancies</label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      value={editVacancies} 
                      onChange={(e) => setEditVacancies(e.target.value)} 
                      className="premium-input" 
                    />
                  </div>
                  <div className="premium-form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="premium-input">
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="premium-btn premium-btn-primary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Update</button>
                    <button type="button" onClick={() => setEditingJob(null)} className="premium-btn premium-btn-secondary" style={{ flex: 1, height: 42, justifyContent: 'center' }}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {openings.map((job) => (
                <div key={job.id} className="premium-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{job.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{job.department} • {job.type} • {job.location || 'Remote'}</span>
                    </div>
                    <span className={`badge ${job.status === 'Active' ? 'badge-success' : 'badge-primary'}`}>{job.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Candidates: <strong className="number-font" style={{ color: 'var(--color-text-primary)' }}>{job.candidates || 0}</strong>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => handleEditJobSelect(job)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => handleDeleteJob(job.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                      <button onClick={() => alert(`Reviewing applications for ${job.title}`)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                        <span>Review</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Candidates */}
        {subTab === 'candidates' && (
          <motion.div
            key="candidates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Applicant Pipeline</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Live evaluation stages</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Target Role</th>
                    <th>Evaluation Rating</th>
                    <th>Current Stage</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(cand => (
                    <tr key={cand.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={cand.avatar} alt={cand.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                          <span style={{ fontWeight: 600 }}>{cand.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{cand.role}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)', fontSize: '0.8rem', fontWeight: 700 }}>
                          <Star size={14} fill="var(--color-warning)" />
                          <span>{cand.rating}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cand.stage === 'Offered' ? 'badge-success' : cand.stage === 'Interviewing' ? 'badge-warning' : 'badge-primary'}`}>
                          {cand.stage}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {cand.stage === 'Applied' && (
                          <button onClick={() => moveCandidate(cand.id, 'Interviewing')} className="premium-btn premium-btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                            Advance
                          </button>
                        )}
                        {cand.stage === 'Interviewing' && (
                          <button onClick={() => moveCandidate(cand.id, 'Offered')} className="premium-btn premium-btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                            Offer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Interview Scheduler */}
        {subTab === 'interview' && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Interview Calendars</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Send invites and schedule technical sessions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {candidates.filter(c => c.stage === 'Interviewing').map(cand => (
                <div key={cand.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: '1px solid var(--color-border)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={cand.avatar} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cand.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{cand.role} Interview</p>
                    </div>
                  </div>
                  <button onClick={() => scheduleInterview(cand.name)} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px' }}>
                    <Calendar size={14} />
                    <span>Send Invite</span>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 4: Offer Letters */}
        {subTab === 'offers' && (
          <motion.div
            key="offers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Offer Generation Center</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
                Compile legally compliant job offers, compensation sheets, NDAs, and onboarding contracts automatically.
              </p>
            </div>
            <button onClick={() => alert("Offer template compiled! Sent to candidate Matt Smith.")} className="premium-btn premium-btn-primary" style={{ padding: '10px 20px' }}>
              <span>Generate Offer PDF</span>
            </button>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Onboarding Wizard */}
        {subTab === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Onboarding Checklist</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Assign credentials and resources for new hires</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create GSuite corporate email and Slack login</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ship hardware asset (MacBook Pro / accessories)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <input type="checkbox" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Schedule team alignment call & assign mentor</span>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
