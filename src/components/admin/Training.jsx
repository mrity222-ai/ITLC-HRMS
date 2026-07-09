import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, CheckCircle, Clock } from 'lucide-react';

const courses = [];

const initialCertificates = [];

export default function Training() {
  const [certs, setCerts] = useState(initialCertificates);

  const claimCertificate = () => {
    alert("New training certificate generated. Sent to employee profile!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Course List & Progress Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {courses.map((course) => (
          <div key={course.id} className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{course.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <Clock size={12} />
                  <span>{course.duration}</span>
                </div>
              </div>
              <span className="badge badge-primary">{course.attendees} Enrolled</span>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                <span>Overall Team Completion</span>
                <strong className="number-font">{course.progress}%</strong>
              </div>
              <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${course.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificates & Training Calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* Certificate ledger */}
        <div className="premium-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Issued Certificates</h3>
            <button onClick={claimCertificate} className="premium-btn premium-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              <span>Generate Cert</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {certs.map((cert) => (
              <div key={cert.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                background: '#F8FAFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={16} style={{ color: 'var(--color-warning)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{cert.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{cert.course}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="number-font" style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{cert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Calendar schedules */}
        <div className="premium-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18 }}>Training Calendar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, borderLeft: '3px solid var(--color-primary)', paddingLeft: 12 }}>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Cybersecurity Awareness Drill</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>July 08 • 10:00 AM • Zoom</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, borderLeft: '3px solid var(--color-accent)', paddingLeft: 12 }}>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700 }}>Stripe Billing API integration workshop</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>July 15 • 02:00 PM • HQ Conf Room A</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
