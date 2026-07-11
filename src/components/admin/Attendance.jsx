import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Square, Calendar, Clock, UserCheck, AlertTriangle, 
  MapPin, CheckCircle, FileSpreadsheet, List, Table, User, ShieldAlert, Sliders, FileText, LogOut
} from 'lucide-react';

const shiftSchedule = [
  { id: 1, name: 'Morning Shift', hours: '09:00 AM - 05:00 PM', department: 'All Departments' },
  { id: 2, name: 'Swing Shift', hours: '02:00 PM - 10:00 PM', department: 'Customer Support' },
  { id: 3, name: 'Night Shift', hours: '10:00 PM - 06:00 AM', department: 'Security & DevOps' },
];

const mockCalendarDays = [
  { day: 25, status: 'Present', time: '08:58 AM' },
  { day: 26, status: 'Present', time: '08:56 AM' },
  { day: 27, status: 'Late', time: '09:15 AM' },
  { day: 28, status: 'Present', time: '08:50 AM' },
  { day: 29, status: 'Absent', time: '-' },
  { day: 30, status: 'Present', time: '09:02 AM' },
  { day: 1, status: 'Present', time: '08:59 AM' },
  { day: 2, status: 'Present', time: '08:45 AM' },
];

const mockDailyLogs = [
  { id: 1, name: 'Sarah Jenkins', dept: 'Design', inTime: '08:58 AM', outTime: '05:02 PM', status: 'On Time' },
  { id: 2, name: 'Marcus Vance', dept: 'Engineering', inTime: '09:12 AM', outTime: '06:10 PM', status: 'Late' },
  { id: 3, name: 'Clara Oswald', dept: 'Engineering', inTime: '08:45 AM', outTime: '05:00 PM', status: 'On Time' },
  { id: 4, name: 'Sophia Patel', dept: 'Marketing', inTime: '09:00 AM', outTime: '05:05 PM', status: 'On Time' },
  { id: 5, name: 'David Tennant', dept: 'Sales', inTime: '09:34 AM', outTime: '05:30 PM', status: 'Late' },
];

import { api } from '../../services/api';

export default function Attendance({ subTab = 'dashboard' }) {
  const [punchedIn, setPunchedIn] = useState(() => {
    return localStorage.getItem('admin_punched_in') === 'true';
  });
  const [punchTime, setPunchTime] = useState(() => {
    const saved = localStorage.getItem('admin_punch_time');
    return saved ? new Date(saved) : null;
  });
  const [workDuration, setWorkDuration] = useState('00:00:00');
  const [logs, setLogs] = useState([]);
  const [ownLogs, setOwnLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [companyDetails, setCompanyDetails] = useState(null);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayOwnRecord = ownLogs.find(r => r.date === todayDate);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const [data, personalData, company] = await Promise.all([
          api.getAdminAttendance(),
          api.getEmployeeAttendance(),
          api.getAdminCompany()
        ]);
        setLogs(data || []);
        setOwnLogs(personalData || []);
        setCompanyDetails(company || null);
      } catch (err) {
        console.error("Failed to fetch admin attendance logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [subTab]);

  useEffect(() => {
    if (todayOwnRecord) {
      if (todayOwnRecord.checkIn && !todayOwnRecord.checkOut) {
        setPunchedIn(true);
        const [h, m, s] = todayOwnRecord.checkIn.split(':').map(Number);
        const tDate = new Date();
        tDate.setHours(h, m, s, 0);
        setPunchTime(tDate);
        localStorage.setItem('admin_punched_in', 'true');
        localStorage.setItem('admin_punch_time', tDate.toISOString());
      } else {
        setPunchedIn(false);
        setPunchTime(null);
        localStorage.setItem('admin_punched_in', 'false');
        localStorage.removeItem('admin_punch_time');
      }
    } else {
      // Don't override localStorage if we are still loading or local storage has it active
      const localPunched = localStorage.getItem('admin_punched_in') === 'true';
      if (!localPunched) {
        setPunchedIn(false);
        setPunchTime(null);
      }
    }
  }, [ownLogs]);
  
  useEffect(() => {
    let interval;
    if (punchedIn && punchTime) {
      interval = setInterval(() => {
        const diff = Date.now() - punchTime.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setWorkDuration(`${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }, 1000);
    } else {
      setWorkDuration('00:00:00');
    }
    return () => clearInterval(interval);
  }, [punchedIn, punchTime]);

  const todayLogs = logs.filter(l => l.date === todayDate);
  const totalPresentToday = todayLogs.filter(l => l.status === 'Present' || l.status === 'Late').length;
  const lateToday = todayLogs.filter(l => l.status === 'Late').length;

  const handlePunch = async () => {
    if (companyDetails) {
      try {
        await checkGeofence(companyDetails);
      } catch (err) {
        alert("Geofence Restriction: " + err.message);
        return;
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    if (!punchedIn) {
      try {
        const record = await api.punchIn({
          date: dateStr,
          checkIn: timeStr,
          status: 'Present'
        });
        setOwnLogs(prev => [record, ...prev]);
        localStorage.setItem('admin_punched_in', 'true');
        localStorage.setItem('admin_punch_time', now.toISOString());
        alert("Attendance Marked Successfully");
      } catch (err) {
        alert("Failed to punch in: " + err.message);
      }
    } else {
      const elapsedTotal = Math.floor((now.getTime() - punchTime.getTime()) / 1000);
      const hrs = Math.floor(elapsedTotal / 3600);
      const mins = Math.floor((elapsedTotal % 3600) / 60);
      const secs = elapsedTotal % 60;
      const workStr = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      
      try {
        const record = await api.punchOut({
          date: dateStr,
          checkOut: timeStr,
          breakDuration: '00:00:00',
          workHours: workStr,
          status: 'Present'
        });
        setOwnLogs(prev => prev.map(r => r.date === dateStr ? record : r));
        localStorage.setItem('admin_punched_in', 'false');
        localStorage.removeItem('admin_punch_time');
        alert("Punch Out Successful");
      } catch (err) {
        alert("Failed to punch out: " + err.message);
      }
    }
  };

  const exportAttendance = () => {
    alert("Exporting attendance sheet: attendance_summary_july2026.xlsx");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Punch & Status Board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              
              {/* Punch Card */}
              <div 
                className="premium-card" 
                style={{ 
                  padding: 28, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 18,
                  textAlign: 'center',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: punchedIn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  color: punchedIn ? 'var(--color-success)' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={30} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {punchedIn ? 'You are Punched In' : todayOwnRecord ? 'Shift Completed' : 'Not Clocked In'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    {punchedIn ? `Started at ${punchTime.toLocaleTimeString()}` : todayOwnRecord ? `Punched in: ${todayOwnRecord.checkIn} | Out: ${todayOwnRecord.checkOut}` : 'Ready to begin your workday?'}
                  </p>
                </div>

                {(punchedIn || todayOwnRecord) && (
                  <div className="number-font" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {punchedIn ? workDuration : todayOwnRecord.workHours}
                  </div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePunch}
                  className={punchedIn ? 'btn-punch-out' : 'btn-punch-in'}
                  style={{ width: '100%' }}
                >
                  {punchedIn ? <LogOut size={16} /> : <Play size={16} />}
                  <span>{punchedIn ? 'Punch Out' : 'Punch In'}</span>
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <MapPin size={12} />
                  <span>IP: 192.168.1.1 (HQ Office Gateway)</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <span className="premium-label">Total Present Today</span>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{totalPresentToday} Active</h4>
                  </div>
                </div>
                <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <span className="premium-label">Late Checked-in</span>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{lateToday} Employees</h4>
                  </div>
                </div>
                <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="premium-label">Total Logged Records</span>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{logs.length} Logs</h4>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Daily Logs */}
        {subTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Daily Login Logs</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Live check-in times of all employees</span>
              </div>
            </div>

            <div className="premium-table-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 24, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  Loading logs from database...
                </div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  No attendance records found.
                </div>
              ) : (
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Date</th>
                      <th>Punch In Time</th>
                      <th>Punch Out Time</th>
                      <th>Work Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id || index}>
                        <td style={{ fontWeight: 600 }}>{log.employeeName}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem' }}>{log.date}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>{log.checkIn || '--:--:--'}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{log.checkOut || '--:--:--'}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.workHours || '00:00:00'}</td>
                        <td>
                          <span className={`badge ${log.status === 'Present' || log.status === 'On Time' ? 'badge-success' : log.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                            {log.status || 'Present'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Monthly Grid */}
        {subTab === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Monthly Attendance Grid</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Color-coded present, absent and leave tracking</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, textAlign: 'center', marginTop: 12 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>{day}</div>
              ))}
              {Array(30).fill(0).map((_, idx) => {
                const status = idx % 9 === 0 ? 'absent' : idx % 12 === 0 ? 'late' : 'present';
                return (
                  <div 
                    key={idx} 
                    style={{
                      height: 50,
                      borderRadius: 10,
                      background: status === 'present' ? 'var(--color-success-light)' : status === 'late' ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: status === 'present' ? 'var(--color-success)' : status === 'late' ? 'var(--color-warning)' : 'var(--color-danger)'
                    }}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 4: My Attendance */}
        {subTab === 'my' && (
          <motion.div
            key="my"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>My Logs Calendar</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Personal login audit records</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Log Time</th>
                    <th>Work Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ownLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20 }} className="text-muted-foreground">
                        No personal logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    ownLogs.map((log, idx) => (
                      <tr key={log.id || idx}>
                        <td style={{ fontWeight: 600 }}>{log.date}</td>
                        <td className="number-font" style={{ fontSize: '0.8rem' }}>
                          In: {log.checkIn || '--'} | Out: {log.checkOut || '--'}
                        </td>
                        <td className="number-font" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {log.workHours || '00:00:00'}
                        </td>
                        <td>
                          <span className={`badge ${log.status === 'Present' || log.status === 'On Time' ? 'badge-success' : log.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                            {log.status || 'Present'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Shift Setup */}
        {subTab === 'shift' && (
          <motion.div
            key="shift"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Company Shift Schedules</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Configure work times across corporate branches</span>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Shift Classification</th>
                    <th>Working Hours</th>
                    <th>Target Departments</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftSchedule.map(shift => (
                    <tr key={shift.id}>
                      <td style={{ fontWeight: 700 }}>{shift.name}</td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{shift.hours}</td>
                      <td><span className="badge badge-info">{shift.department}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 6: Reports */}
        {subTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Logs Sheet</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                Download comprehensive login sheets, late markers, and hourly aggregates in XLSX or CSV format.
              </p>
            </div>

            <button onClick={exportAttendance} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
              <FileSpreadsheet size={16} />
              <span>Export CSV Spreadsheet</span>
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

// Geofence helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
}

function checkGeofence(companyDetails) {
  return new Promise((resolve, reject) => {
    if (!companyDetails || companyDetails.lat === null || companyDetails.lng === null || companyDetails.lat === undefined || companyDetails.lng === undefined) {
      resolve(true);
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser. Geofencing is enabled, so you cannot mark attendance without location access."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          companyDetails.lat,
          companyDetails.lng
        );
        const radiusLimit = companyDetails.radius || 500;
        if (distance <= radiusLimit) {
          resolve(true);
        } else {
          reject(new Error(`You are outside the permitted range. Your distance: ${Math.round(distance)}m, Allowed limit: ${radiusLimit}m.`));
        }
      },
      (err) => {
        reject(new Error("Unable to retrieve location: " + err.message + ". Location access is required to mark attendance."));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
