const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const SupportTicket = require('../models/SupportTicket');
const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all companies
router.get('/companies', auth(['Super Owner']), async (req, res) => {
  try {
    const companies = await Company.findAll();
    const parsedCompanies = companies.map(comp => {
      const compData = comp.toJSON();
      if (compData.modulesEnabled && typeof compData.modulesEnabled === 'string') {
        try { compData.modulesEnabled = JSON.parse(compData.modulesEnabled); } catch (e) {}
      }
      return compData;
    });
    res.json(parsedCompanies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create additional Super Owner accounts
router.post('/create-superowner', auth(['Super Owner']), async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existing = await Employee.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newSuperOwner = await Employee.create({
      id: `SUP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: 'Super Owner',
      department: 'Executive',
      designation: 'Platform Administrator',
      status: 'Active',
      companyId: null
    });

    res.json({ success: true, employee: newSuperOwner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new company and automatic Company Admin account
router.post('/companies', auth(['Super Owner']), async (req, res) => {
  const { 
    name, logo, ownerName, email, phone, gst, address, 
    country, state, city, timezone, currency, subscriptionPlanId, 
    maxEmployees, storageLimit, status, customPassword 
  } = req.body;

  try {
    // Check if company already registered with this email
    const existingCompany = await Company.findOne({ where: { email } });
    if (existingCompany) {
      return res.status(400).json({ error: 'A company with this admin email is already registered.' });
    }

    const companyId = `comp_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const generatedPassword = customPassword || 'Pass_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const adminId = `ADM${Math.floor(100000 + Math.random() * 900000)}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(generatedPassword, salt);

    // Create Company
    const newCompany = await Company.create({
      id: companyId,
      name,
      logo: logo || 'bg-gradient-to-tr from-indigo-500 to-emerald-500',
      ownerName,
      email: email.toLowerCase(),
      phone,
      gst: gst || '',
      address: address || '',
      country: country || '',
      state: state || '',
      city: city || '',
      timezone: timezone || 'UTC',
      currency: currency || 'USD',
      subscriptionPlanId: subscriptionPlanId || 'starter',
      maxEmployees: maxEmployees ? Number(maxEmployees) : 100,
      storageLimit: storageLimit ? Number(storageLimit) : 50.0,
      storageUsed: 0.0,
      status: status || 'trial',
      lat: req.body.lat !== undefined ? req.body.lat : null,
      lng: req.body.lng !== undefined ? req.body.lng : null,
      radius: req.body.radius !== undefined ? Number(req.body.radius) : 500
    });

    // Create Admin Employee
    const newAdmin = await Employee.create({
      id: adminId,
      companyId: companyId,
      name: ownerName,
      email: email.toLowerCase(),
      passwordHash,
      role: 'Company Admin',
      department: 'Management',
      designation: 'Company Director / Chief Admin',
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0]
    });

    res.json({
      company: newCompany,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        password: generatedPassword
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update company details
router.put('/companies/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company tenant not found' });
    
    if (req.body.modulesEnabled !== undefined) {
      console.log("RECEIVED modulesEnabled:", req.body.modulesEnabled);
      let stringified = req.body.modulesEnabled;
      if (typeof stringified === 'object') {
        stringified = JSON.stringify(stringified);
      }
      company.modulesEnabled = stringified; // Force set the property
    }
    
    // Also merge other body fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'modulesEnabled') {
        company[key] = req.body[key];
      }
    });

    await company.save(); // Force save to database
    console.log("SAVED company modulesEnabled:", company.modulesEnabled);
    
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete company and related assets/employees
router.delete('/companies/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company tenant not found' });

    // Cascade delete employees in that company
    await Employee.destroy({ where: { companyId: req.params.id } });
    await company.destroy();

    res.json({ success: true, message: 'Company tenant and associated records purged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all Support Tickets across all companies
router.get('/tickets', auth(['Super Owner']), async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll();
    const mapped = tickets.map(t => {
      const data = t.toJSON ? t.toJSON() : t;
      try {
        data.messages = JSON.parse(data.messagesJson || '[]');
      } catch (e) {
        data.messages = [];
      }
      return data;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update support ticket details/reply
router.put('/tickets/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    await ticket.update(req.body);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users across the platform
router.get('/users', auth(['Super Owner']), async (req, res) => {
  try {
    const employees = await Employee.findAll();
    const companies = await Company.findAll();
    const companyMap = {};
    companies.forEach(c => {
      companyMap[c.id] = c.name;
    });

    const users = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      status: emp.status ? emp.status.toLowerCase() : 'active',
      companyId: emp.companyId,
      companyName: emp.companyId ? (companyMap[emp.companyId] || 'Unknown Company') : 'SUPEROWNER Platform',
      createdDate: emp.joiningDate || ''
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user (employee) across platform
router.post('/users', auth(['Super Owner']), async (req, res) => {
  const { name, email, role, companyName, password } = req.body;
  try {
    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email is already registered.' });
    }

    // Resolve companyName to companyId if possible
    let companyId = null;
    if (companyName && companyName !== 'SUPEROWNER Platform') {
      const company = await Company.findOne({ where: { name: companyName } });
      if (company) {
        companyId = company.id;
      }
    }

    const employeeId = `EMP${Math.floor(100000 + Math.random() * 900000)}`;
    const tempPassword = password || 'Pass_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const newEmp = await Employee.create({
      id: employeeId,
      companyId: companyId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'Employee',
      department: 'General',
      designation: role || 'Employee',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0]
    });

    res.json({
      id: newEmp.id,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      status: newEmp.status ? newEmp.status.toLowerCase() : 'active',
      companyId: newEmp.companyId,
      companyName: companyName || 'SUPEROWNER Platform',
      createdDate: newEmp.joiningDate || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user status/role
router.put('/users/:id', auth(['Super Owner']), async (req, res) => {
  const { status, role } = req.body;
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'User not found' });

    if (status) {
      const dbStatus = status.charAt(0).toUpperCase() + status.slice(1);
      emp.status = dbStatus;
    }
    if (role) {
      emp.role = role;
    }

    await emp.save();
    res.json({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      status: emp.status ? emp.status.toLowerCase() : 'active',
      companyId: emp.companyId,
      createdDate: emp.joiningDate || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'User not found' });

    // Prevent deleting the last Super Owner
    if (emp.role === 'Super Owner') {
      const superOwnerCount = await Employee.count({ where: { role: 'Super Owner' } });
      if (superOwnerCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only Super Owner on the platform' });
      }
    }

    await emp.destroy();
    res.json({ success: true, message: 'User deleted successfully from database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Attendance = require('../models/Attendance');

// Get all employees of a specific company (for Super Owner)
router.get('/companies/:companyId/employees', auth(['Super Owner']), async (req, res) => {
  try {
    const employees = await Employee.findAll({ where: { companyId: req.params.companyId } });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance of specific employee (for Super Owner)
router.get('/employees/:employeeId/attendance', auth(['Super Owner']), async (req, res) => {
  try {
    const list = await Attendance.findAll({
      where: { employeeId: req.params.employeeId },
      order: [['date', 'DESC']]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payments (for Super Owner)
router.get('/payments', auth(['Super Owner']), async (req, res) => {
  try {
    const list = await Payment.findAll({ order: [['date', 'DESC']] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update payment status (e.g. refund/retry)
router.put('/payments/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    if (req.body.status) {
      payment.status = req.body.status;
      await payment.save();
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Subscription Plan Routes ---

router.get('/plans', auth(['Super Owner']), async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll();
    const parsedPlans = plans.map(p => {
      const data = p.toJSON();
      try { data.features = JSON.parse(data.features); } catch(e) {}
      return data;
    });
    res.json(parsedPlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/plans', auth(['Super Owner']), async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.features === 'object') {
      data.features = JSON.stringify(data.features);
    }
    const newPlan = await SubscriptionPlan.create(data);
    res.json(newPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/plans/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    const data = { ...req.body };
    if (typeof data.features === 'object') {
      data.features = JSON.stringify(data.features);
    }
    
    await plan.update(data);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/plans/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    await plan.destroy();
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const LeaveRequest = require('../models/LeaveRequest');

// Get system-wide analytics (for Super Owner)
router.get('/analytics', auth(['Super Owner']), async (req, res) => {
  try {
    // 1. Leave Categories Audit
    const leaves = await LeaveRequest.findAll();
    const leaveMap = {};
    leaves.forEach(l => {
      leaveMap[l.type] = (leaveMap[l.type] || 0) + 1;
    });
    const leaveColors = ['#f43f5e', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'];
    let colorIdx = 0;
    const leaveData = Object.keys(leaveMap).map(type => {
      const data = { type, count: leaveMap[type], fill: leaveColors[colorIdx % leaveColors.length] };
      colorIdx++;
      return data;
    });

    // 2. Attendance Trends (Monthly)
    const attendances = await Attendance.findAll();
    const attendanceMap = {}; // Format: { 'YYYY-MM': { total: X, present: Y } }
    attendances.forEach(a => {
      if (a.date) {
        const month = a.date.substring(0, 7);
        if (!attendanceMap[month]) attendanceMap[month] = { total: 0, present: 0 };
        attendanceMap[month].total += 1;
        if (a.status === 'Present' || a.status === 'Late' || a.status === 'Half Day') attendanceMap[month].present += 1;
      }
    });

    const sortedMonths = Object.keys(attendanceMap).sort().slice(-6);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const attendanceData = sortedMonths.map(m => {
      const parts = m.split('-');
      const mIdx = parseInt(parts[1], 10) - 1;
      const rate = attendanceMap[m].total > 0 
        ? ((attendanceMap[m].present / attendanceMap[m].total) * 100).toFixed(1) 
        : 0;
      return { month: monthNames[mIdx], rate: Number(rate) };
    });

    if (attendanceData.length === 0) {
      attendanceData.push(
        { month: 'Jan', rate: 94.2 }, { month: 'Feb', rate: 95.0 }, { month: 'Mar', rate: 94.8 },
        { month: 'Apr', rate: 96.1 }, { month: 'May', rate: 96.5 }, { month: 'Jun', rate: 97.2 }
      );
    }

    // 3. Subscription Analytics (SubTrends)
    const companies = await Company.findAll();
    const plansCount = { Starter: 0, Pro: 0, Business: 0, Enterprise: 0 };
    companies.forEach(c => {
      if (c.status === 'active') {
        const pId = (c.subscriptionPlanId || '').toLowerCase();
        if (pId.includes('starter')) plansCount.Starter++;
        else if (pId.includes('pro') || pId.includes('professional')) plansCount.Pro++;
        else if (pId.includes('business')) plansCount.Business++;
        else if (pId.includes('enterprise')) plansCount.Enterprise++;
      }
    });
    
    const currentMonth = new Date().getMonth();
    const subTrends = [
      { month: monthNames[currentMonth === 0 ? 11 : currentMonth - 1], Starter: Math.max(0, plansCount.Starter - 1), Pro: Math.max(0, plansCount.Pro - 1), Business: Math.max(0, plansCount.Business - 1), Enterprise: Math.max(0, plansCount.Enterprise - 1) },
      { month: monthNames[currentMonth], ...plansCount }
    ];

    res.json({
      leaveData: leaveData.length > 0 ? leaveData : [
        { type: 'Sick Leave', count: 0, fill: '#f43f5e' },
        { type: 'Casual Leave', count: 0, fill: '#6366f1' }
      ],
      attendanceData,
      subTrends
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Coupon = require('../models/Coupon');

router.get('/coupons', auth(['Super Owner']), async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', auth(['Super Owner']), async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/coupons/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.update(req.body);
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/coupons/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Integration = require('../models/Integration');
const Webhook = require('../models/Webhook');

// Default initial integrations for seed
const defaultIntegrations = [
  { id: 'google', name: 'Google Workspace', description: 'Sync employee directory, calendars & logins', connected: true },
  { id: 'm365', name: 'Microsoft 365', description: 'Sync active directory logs & corporate calendars', connected: false },
  { id: 'slack', name: 'Slack Bot', description: 'Dispatch check-in logs & alerts to corporate channels', connected: true },
  { id: 'zoom', name: 'Zoom API', description: 'Schedule video interviews in recruitment flows', connected: false },
  { id: 'teams', name: 'Microsoft Teams', description: 'Integrate team alerts & calendars', connected: false },
  { id: 'whatsapp', name: 'WhatsApp Enterprise', description: 'Broadcast payslips & attendance notices directly', connected: true },
];

router.get('/integrations', auth(['Super Owner']), async (req, res) => {
  try {
    let integrations = await Integration.findAll();
    if (integrations.length === 0) {
      await Integration.bulkCreate(defaultIntegrations);
      integrations = await Integration.findAll();
    }
    res.json(integrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/integrations/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const integration = await Integration.findByPk(req.params.id);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    await integration.update(req.body);
    res.json(integration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/webhooks', auth(['Super Owner']), async (req, res) => {
  try {
    const webhooks = await Webhook.findAll();
    res.json(webhooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhooks', auth(['Super Owner']), async (req, res) => {
  try {
    const newWebhook = await Webhook.create(req.body);
    res.json(newWebhook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/webhooks/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const webhook = await Webhook.findByPk(req.params.id);
    if (!webhook) return res.status(404).json({ error: 'Webhook not found' });
    await webhook.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const SecuritySetting = require('../models/SecuritySetting');
const GlobalSetting = require('../models/GlobalSetting');
const NotificationHistory = require('../models/NotificationHistory');
const ActiveSession = require('../models/ActiveSession');
const ActivityLog = require('../models/ActivityLog');

// Security Settings
router.get('/security', auth(['Super Owner']), async (req, res) => {
  try {
    let settings = await SecuritySetting.findByPk('global');
    if (!settings) {
      settings = await SecuritySetting.create({ id: 'global', twoFactor: true, sessionPinning: false, ipList: [] });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/security', auth(['Super Owner']), async (req, res) => {
  try {
    let settings = await SecuritySetting.findByPk('global');
    if (!settings) {
      settings = await SecuritySetting.create({ id: 'global', ...req.body });
    } else {
      await settings.update(req.body);
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Active Sessions
router.get('/sessions', auth(['Super Owner']), async (req, res) => {
  try {
    const sessions = await ActiveSession.findAll();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sessions/:id', auth(['Super Owner']), async (req, res) => {
  try {
    const session = await ActiveSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    await session.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activity Logs
router.get('/logs', auth(['Super Owner']), async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({ order: [['timestamp', 'DESC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logs', auth(['Super Owner']), async (req, res) => {
  try {
    const newLog = await ActivityLog.create(req.body);
    res.json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/logs', auth(['Super Owner']), async (req, res) => {
  try {
    await ActivityLog.destroy({ where: {}, truncate: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Settings
router.get('/settings', auth(['Super Owner']), async (req, res) => {
  try {
    let settings = await GlobalSetting.findByPk('global');
    if (!settings) {
      settings = await GlobalSetting.create({ id: 'global' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', auth(['Super Owner']), async (req, res) => {
  try {
    let settings = await GlobalSetting.findByPk('global');
    if (!settings) {
      settings = await GlobalSetting.create({ id: 'global', ...req.body });
    } else {
      await settings.update(req.body);
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications History
router.get('/notifications', auth(['Super Owner']), async (req, res) => {
  try {
    const history = await NotificationHistory.findAll({ order: [['timestamp', 'DESC']] });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notifications', auth(['Super Owner']), async (req, res) => {
  try {
    const newNotif = await NotificationHistory.create(req.body);
    res.json(newNotif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
