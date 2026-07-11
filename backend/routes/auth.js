const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

// Check if any Super Owner exists
router.get('/check-superowner', async (req, res) => {
  try {
    const superOwner = await Employee.findOne({ where: { role: 'Super Owner' } });
    res.json({ setupRequired: !superOwner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register first Super Owner
router.post('/register-superowner', async (req, res) => {
  const { name, email, phone, password, avatar } = req.body;
  try {
    const superOwnerExists = await Employee.findOne({ where: { role: 'Super Owner' } });
    if (superOwnerExists) {
      return res.status(400).json({ error: 'Super Owner already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newSuperOwner = await Employee.create({
      id: `SUP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'Super Owner',
      department: 'Executive',
      designation: 'Platform Administrator',
      avatar: avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      companyId: null
    });

    const token = jwt.sign(
      { id: newSuperOwner.id, email: newSuperOwner.email, role: newSuperOwner.role, companyId: null },
      process.env.JWT_SECRET || 'superowner_hrms_secret_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: newSuperOwner.role,
      name: newSuperOwner.name,
      email: newSuperOwner.email,
      avatar: newSuperOwner.avatar
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Company / Admin Registration from Login Page
router.post('/register-company', async (req, res) => {
  const { companyName, companyEmail, companyPhone, password, country, stateName, cityName, ownerName } = req.body;
  try {
    // Check if email already registered in Employee
    const existing = await Employee.findOne({ where: { email: companyEmail.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email is already registered.' });
    }

    const companyId = `comp_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const adminId = `ADM${Math.floor(100000 + Math.random() * 900000)}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Company
    const newCompany = await Company.create({
      id: companyId,
      name: companyName,
      ownerName: ownerName || 'Company Owner',
      email: companyEmail.toLowerCase(),
      phone: companyPhone,
      country: country || '',
      state: stateName || '',
      city: cityName || '',
      subscriptionPlanId: 'starter',
      maxEmployees: 100,
      storageLimit: 50.0,
      storageUsed: 0.0,
      status: 'trial'
    });

    // Create Admin Employee
    const newAdmin = await Employee.create({
      id: adminId,
      companyId: companyId,
      name: ownerName || 'Company Owner',
      email: companyEmail.toLowerCase(),
      passwordHash,
      role: 'Company Admin',
      department: 'Management',
      designation: 'Company Director',
      phone: companyPhone || '',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0]
    });

    res.json({
      success: true,
      company: newCompany,
      admin: newAdmin
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Look up user by email or ID (support employee/admin ID login)
    const user = await Employee.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { id: email }
        ]
      }
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check Company Status
    if (user.companyId && user.role !== 'Super Owner') {
      const company = await Company.findByPk(user.companyId);
      if (company && company.status === 'expired') {
        return res.status(403).json({ error: 'Your company subscription has expired. Please contact superowner to renew.' });
      }
      if (company && company.status === 'suspended') {
        return res.status(403).json({ error: 'Your company account has been suspended.' });
      }
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET || 'superowner_hrms_secret_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      companyId: user.companyId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile
router.get('/profile', auth(), async (req, res) => {
  try {
    const user = await Employee.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    let companyName = 'HRMS Platform';
    let companyLogo = '';
    let companyDetails = null;
    
    if (user.companyId) {
      const company = await Company.findByPk(user.companyId);
      if (company) {
        companyName = company.name;
        companyLogo = company.logo;
        companyDetails = company;
      }
    }

    let docs = [];
    try {
      if (user.documents) {
        docs = JSON.parse(user.documents);
      }
    } catch (e) {
      // Ignore parse errors
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      salary: user.salary,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
      companyId: user.companyId,
      companyName,
      companyLogo,
      companyDetails,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      joiningDate: user.joiningDate,
      reportingManager: user.reportingManager,
      documents: docs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', auth(), async (req, res) => {
  const { name, phone, dob, gender, address, avatar, documents } = req.body;
  try {
    const user = await Employee.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;
    if (documents !== undefined) user.documents = JSON.stringify(documents);
    
    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});



router.post('/refresh', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'superowner_hrms_secret_key_2026', { ignoreExpiration: true });
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role, companyId: decoded.companyId },
      process.env.JWT_SECRET || 'superowner_hrms_secret_key_2026',
      { expiresIn: '24h' }
    );
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
