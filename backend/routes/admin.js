const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const ExpenseClaim = require('../models/ExpenseClaim');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const SupportTicket = require('../models/SupportTicket');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Branch = require('../models/Branch');
const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const PayrollRecord = require('../models/PayrollRecord');
const Asset = require('../models/Asset');
const PerformanceReview = require('../models/PerformanceReview');
const JobOpening = require('../models/JobOpening');
const TrainingProgram = require('../models/TrainingProgram');
const Holiday = require('../models/Holiday');
const LeavePolicy = require('../models/LeavePolicy');
const Asset = require('../models/Asset');

// Get all employees of logged-in admin's company
router.get('/employees', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const employees = await Employee.findAll({ where: { companyId: req.user.companyId } });
    const mapped = employees.map(emp => {
      const data = emp.toJSON();
      let parsedDocs = [];
      if (data.documents) {
        try {
          parsedDocs = typeof data.documents === 'string' ? JSON.parse(data.documents) : data.documents;
        } catch (e) {
          parsedDocs = [];
        }
      }
      data.documents = parsedDocs;
      return data;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new employee
router.post('/employees', auth(['Company Admin', 'HR']), async (req, res) => {
  const { name, email, department, designation, salary, phone, avatar, joiningDate, reportingManager, password, role, systemRole } = req.body;
  try {
    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An employee with this email is already registered.' });
    }

    const employeeId = `EMP${Math.floor(100000 + Math.random() * 900000)}`;
    const tempPassword = password || 'Pass_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    // Parse role and designation safely
    const authRole = systemRole || (['Manager', 'HR', 'Employee', 'Company Admin'].includes(role) ? role : 'Employee');
    const finalDesignation = designation || (!['Manager', 'HR', 'Employee', 'Company Admin'].includes(role) ? role : '') || 'Staff Member';

    const newEmp = await Employee.create({
      id: employeeId,
      companyId: req.user.companyId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: authRole,
      department: department || 'Engineering',
      designation: finalDesignation,
      salary: salary || '$60,000',
      phone: phone || '',
      avatar: avatar || '',
      status: 'Active',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      reportingManager: reportingManager || 'None'
    });

    res.json({
      employee: newEmp,
      generatedPassword: tempPassword
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update employee
router.put('/employees/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const emp = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!emp) return res.status(404).json({ error: 'Employee not found in your company' });

    await emp.update(req.body);
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete employee
router.delete('/employees/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const emp = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!emp) return res.status(404).json({ error: 'Employee not found in your company' });

    await emp.destroy();
    res.json({ success: true, message: 'Employee purged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all leaves of the company
router.get('/leaves', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({ where: { companyId: req.user.companyId } });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update leave request status
router.put('/leaves/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await LeaveRequest.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    
    leave.status = status;
    await leave.save();
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expense claims of the company
router.get('/expenses', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const expenses = await ExpenseClaim.findAll({ where: { companyId: req.user.companyId } });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update expense claim status
router.put('/expenses/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  const { status } = req.body;
  try {
    const expense = await ExpenseClaim.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!expense) return res.status(404).json({ error: 'Expense claim not found' });
    
    expense.status = status;
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upgrade Company Subscription Plan
router.put('/subscription', auth(['Company Admin']), async (req, res) => {
  const { planId } = req.body;
  try {
    const company = await Company.findOne({ where: { id: req.user.companyId } });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    let maxEmployees = 20;
    let storageLimit = 1.0;
    let amount = 0;

    if (planId === 'starter') {
      maxEmployees = 50;
      storageLimit = 5.0;
      amount = 99;
    } else if (planId === 'premium') {
      maxEmployees = 150;
      storageLimit = 20.0;
      amount = 199;
    } else if (planId === 'enterprise') {
      maxEmployees = 500;
      storageLimit = 100.0;
      amount = 499;
    } else if (planId === 'free_trial') {
      maxEmployees = 20;
      storageLimit = 1.0;
      amount = 0;
    } else {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    await company.update({
      subscriptionPlanId: planId,
      maxEmployees,
      storageLimit,
      status: 'active'
    });

    let payment = null;
    if (amount > 0) {
      payment = await Payment.create({
        id: `pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        companyId: company.id,
        companyName: company.name,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amount,
        gateway: 'stripe',
        status: 'successful',
        date: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      company,
      payment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Attendance = require('../models/Attendance');

// Get all attendance of company
router.get('/attendance', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const list = await Attendance.findAll({ where: { companyId: req.user.companyId }, order: [['date', 'DESC']] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance of specific employee
router.get('/attendance/:employeeId', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const list = await Attendance.findAll({
      where: { employeeId: req.params.employeeId, companyId: req.user.companyId },
      order: [['date', 'DESC']]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets of admin's company
router.get('/tickets', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const list = await SupportTicket.findAll({ where: { companyId: req.user.companyId } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update support ticket details/reply (Admin)
router.put('/tickets/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      where: { id: req.params.id, companyId: req.user.companyId }
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    await ticket.update(req.body);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Company profile
router.get('/company', auth(['Company Admin']), async (req, res) => {
  try {
    const company = await Company.findByPk(req.user.companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const compData = company.toJSON();
    if (compData.modulesEnabled && typeof compData.modulesEnabled === 'string') {
      try { compData.modulesEnabled = JSON.parse(compData.modulesEnabled); } catch (e) {}
    }
    res.json(compData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Company profile
router.put('/company', auth(['Company Admin']), async (req, res) => {
  const { name, logo, phone, address, gst, lat, lng, radius, currency } = req.body;
  try {
    const company = await Company.findByPk(req.user.companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    if (name) company.name = name;
    if (logo !== undefined) company.logo = logo;
    if (phone !== undefined) company.phone = phone;
    if (address !== undefined) company.address = address;
    if (gst !== undefined) company.gst = gst;
    if (lat !== undefined) company.lat = lat;
    if (lng !== undefined) company.lng = lng;
    if (radius !== undefined) company.radius = radius;
    if (currency !== undefined) company.currency = currency;

    await company.save();
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// DEPARTMENTS
// ----------------------------------------------------
router.get('/departments', auth(['Company Admin']), async (req, res) => {
  try {
    const deps = await Department.findAll({ where: { companyId: req.user.companyId } });
    res.json(deps);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/departments', auth(['Company Admin']), async (req, res) => {
  try {
    const dep = await Department.create({ ...req.body, companyId: req.user.companyId });
    res.json(dep);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/departments/:id', auth(['Company Admin']), async (req, res) => {
  try {
    const dep = await Department.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!dep) return res.status(404).json({ error: 'Not found' });
    await dep.update(req.body);
    res.json(dep);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/departments/:id', auth(['Company Admin']), async (req, res) => {
  try {
    const dep = await Department.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!dep) return res.status(404).json({ error: 'Not found' });
    await dep.destroy();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// DESIGNATIONS
// ----------------------------------------------------
router.get('/designations', auth(['Company Admin']), async (req, res) => {
  try {
    const desgs = await Designation.findAll({ where: { companyId: req.user.companyId } });
    res.json(desgs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/designations', auth(['Company Admin']), async (req, res) => {
  try {
    const desg = await Designation.create({ ...req.body, companyId: req.user.companyId });
    res.json(desg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/designations/:id', auth(['Company Admin']), async (req, res) => {
  try {
    const desg = await Designation.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!desg) return res.status(404).json({ error: 'Not found' });
    await desg.update(req.body);
    res.json(desg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/designations/:id', auth(['Company Admin']), async (req, res) => {
  try {
    const desg = await Designation.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!desg) return res.status(404).json({ error: 'Not found' });
    await desg.destroy();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// BRANCHES
// ----------------------------------------------------
router.get('/branches', auth(['Company Admin']), async (req, res) => {
  try {
    const branches = await Branch.findAll({ where: { companyId: req.user.companyId } });
    res.json(branches);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/branches', auth(['Company Admin']), async (req, res) => {
  try {
    const branch = await Branch.create({ ...req.body, companyId: req.user.companyId });
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/branches/:id', auth(['Company Admin']), async (req, res) => {
  try {
    const branch = await Branch.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!branch) return res.status(404).json({ error: 'Not found' });
    await branch.update(req.body);
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/branches/:id', auth(['Company Admin']), async (req, res) => {
  try {
    const branch = await Branch.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!branch) return res.status(404).json({ error: 'Not found' });
    await branch.destroy();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// SUBSCRIPTION PLANS (Read Only)
// ----------------------------------------------------
router.get('/plans', auth(['Company Admin']), async (req, res) => {
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

// ----------------------------------------------------
// PAYROLL
// ----------------------------------------------------
router.get('/payroll', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const records = await PayrollRecord.findAll({ where: { companyId: req.user.companyId } });
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/payroll', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const record = await PayrollRecord.create({ ...req.body, companyId: req.user.companyId });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/payroll/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const record = await PayrollRecord.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await record.update(req.body);
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// ASSETS
// ----------------------------------------------------
router.get('/assets', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const assets = await Asset.findAll({ where: { companyId: req.user.companyId } });
    res.json(assets);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/assets', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const assetId = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
    const asset = await Asset.create({ ...req.body, id: assetId, companyId: req.user.companyId });
    res.json(asset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/assets/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const asset = await Asset.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!asset) return res.status(404).json({ error: 'Not found' });
    await asset.update(req.body);
    res.json(asset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// PERFORMANCE
// ----------------------------------------------------
router.get('/performance', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const records = await PerformanceReview.findAll({ where: { companyId: req.user.companyId } });
    const mapped = records.map(r => {
      const data = r.toJSON();
      try { data.kpis = JSON.parse(data.kpis); } catch (e) { data.kpis = []; }
      try { data.kras = JSON.parse(data.kras); } catch (e) { data.kras = []; }
      try { data.goals = JSON.parse(data.goals); } catch (e) { data.goals = []; }
      return data;
    });
    res.json(mapped);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/performance', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const data = { ...req.body, companyId: req.user.companyId };
    if (data.kpis) data.kpis = JSON.stringify(data.kpis);
    if (data.kras) data.kras = JSON.stringify(data.kras);
    if (data.goals) data.goals = JSON.stringify(data.goals);
    const record = await PerformanceReview.create(data);
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/performance/:id', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const record = await PerformanceReview.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!record) return res.status(404).json({ error: 'Not found' });
    const data = { ...req.body };
    if (data.kpis) data.kpis = JSON.stringify(data.kpis);
    if (data.kras) data.kras = JSON.stringify(data.kras);
    if (data.goals) data.goals = JSON.stringify(data.goals);
    await record.update(data);
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// RECRUITMENT (JOB OPENINGS)
// ----------------------------------------------------
router.get('/jobs', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const jobs = await JobOpening.findAll({ where: { companyId: req.user.companyId } });
    res.json(jobs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/jobs', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const jobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const job = await JobOpening.create({ ...req.body, id: jobId, companyId: req.user.companyId });
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/jobs/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const job = await JobOpening.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!job) return res.status(404).json({ error: 'Not found' });
    await job.update(req.body);
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// TRAINING
// ----------------------------------------------------
router.get('/trainings', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const trainings = await TrainingProgram.findAll({ where: { companyId: req.user.companyId } });
    res.json(trainings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/trainings', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const tId = `TRN-${Math.floor(1000 + Math.random() * 9000)}`;
    const training = await TrainingProgram.create({ ...req.body, id: tId, companyId: req.user.companyId });
    res.json(training);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/trainings/:id', auth(['Company Admin', 'HR']), async (req, res) => {
  try {
    const training = await TrainingProgram.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!training) return res.status(404).json({ error: 'Not found' });
    await training.update(req.body);
    res.json(training);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// HOLIDAYS
// ----------------------------------------------------
router.get('/holidays', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const records = await Holiday.findAll({ where: { companyId: req.user.companyId } });
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/holidays', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const hId = `HOL-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = await Holiday.create({ ...req.body, id: hId, companyId: req.user.companyId });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/holidays/:id', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const record = await Holiday.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await record.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------------------------------------------
// LEAVE POLICIES
// ----------------------------------------------------
router.get('/leave-policies', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const records = await LeavePolicy.findAll({ where: { companyId: req.user.companyId } });
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/leave-policies', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const polId = `POL-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = await LeavePolicy.create({ ...req.body, id: polId, companyId: req.user.companyId });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/leave-policies/:id', auth(['Company Admin', 'HR', 'Manager']), async (req, res) => {
  try {
    const record = await LeavePolicy.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await record.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
