require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Load models to ensure sync
require('./models/Attendance');
require('./models/Task');
require('./models/PerformanceReview');
require('./models/Meeting');
require('./models/Asset');
require('./models/Announcement');
require('./models/Coupon');
require('./models/CorrectionRequest');
require('./models/Department');
require('./models/Designation');
require('./models/Branch');
require('./models/Payment');
require('./models/SubscriptionPlan');
// Synchronize database
sequelize.sync({ force: false })
  .then(async () => {
    console.log('MySQL schemas synchronized successfully');
    
    // Alter employees table
    try {
      await sequelize.query("ALTER TABLE employees MODIFY COLUMN company_id VARCHAR(255) NULL;");
      console.log("Successfully altered employees table to allow NULL VARCHAR(255) company_id");
    } catch (err) {
      console.log("Note: employees table alteration status:", err.message);
    }

    // Alter support_tickets table
    try {
      await sequelize.query("ALTER TABLE support_tickets ADD COLUMN company_id VARCHAR(255) DEFAULT '';");
      console.log("Successfully altered support_tickets table to add company_id column");
    } catch (err) {
      // Column already exists, safe to ignore
    }

    // Alter leave_requests table
    try {
      await sequelize.query("ALTER TABLE leave_requests ADD COLUMN company_id VARCHAR(255) DEFAULT '';");
      console.log("Successfully altered leave_requests table to add company_id column");
    } catch (err) {
      // Column already exists, safe to ignore
    }

    // Alter companies table for geofencing
    try {
      await sequelize.query("ALTER TABLE companies ADD COLUMN lat FLOAT NULL;");
      console.log("Successfully altered companies table to add lat column");
    } catch (err) {}
    try {
      await sequelize.query("ALTER TABLE companies ADD COLUMN lng FLOAT NULL;");
      console.log("Successfully altered companies table to add lng column");
    } catch (err) {}
    try {
      await sequelize.query("ALTER TABLE companies ADD COLUMN radius FLOAT DEFAULT 500;");
      console.log("Successfully altered companies table to add radius column");
    } catch (err) {}
    try {
      await sequelize.query("ALTER TABLE companies ADD COLUMN modulesEnabled TEXT NULL;");
      console.log("Successfully altered companies table to add modulesEnabled column");
    } catch (err) {}

    // Temporary route to restore old mock data
    app.get('/api/restore-data', async (req, res) => {
      const Company = require('./models/Company');
      const Employee = require('./models/Employee');
      const bcrypt = require('bcryptjs');
      
      try {
        const passwordHash = await bcrypt.hash('password123', 10);
        const companies = [
          { id: 'comp_acme', name: 'Acme Corporation', ownerName: 'Sarah Jenkins', email: 'sarah.j@acme.com', phone: '1234567890', status: 'active', subscriptionPlanId: 'professional' },
          { id: 'comp_stark', name: 'Stark Industries', ownerName: 'David Banner', email: 'd.banner@stark.com', phone: '1234567890', status: 'active', subscriptionPlanId: 'enterprise' },
          { id: 'comp_wayne', name: 'Wayne Enterprises', ownerName: 'Selina Kyle', email: 'selina@wayne.com', phone: '1234567890', status: 'active', subscriptionPlanId: 'business' },
          { id: 'comp_umbrella', name: 'Umbrella Corporation', ownerName: 'Albert Wesker', email: 'wesker@umbrella.com', phone: '1234567890', status: 'suspended', subscriptionPlanId: 'starter' },
          { id: 'comp_oscorp', name: 'Oscorp Industries', ownerName: 'Peter Parker', email: 'p.parker@oscorp.com', phone: '1234567890', status: 'active', subscriptionPlanId: 'starter' }
        ];

        for (let c of companies) {
          const exists = await Company.findByPk(c.id);
          if (!exists) await Company.create(c);
        }

        const employees = [
          { id: 'usr_super', name: 'Priya Sharma', email: 'priya.sharma@superowner.io', role: 'Super Owner', companyId: null, passwordHash, status: 'Active', department: 'Executive', designation: 'Platform Admin' },
          { id: 'usr_acme_admin', name: 'Sarah Jenkins', email: 'sarah.j@acme.com', role: 'Company Admin', companyId: 'comp_acme', passwordHash, status: 'Active', department: 'Design', designation: 'Senior UX Designer' },
          { id: 'usr_stark_hr', name: 'David Banner', email: 'd.banner@stark.com', role: 'HR', companyId: 'comp_stark', passwordHash, status: 'Active', department: 'HR', designation: 'HR Manager' },
          { id: 'usr_wayne_mgr', name: 'Selina Kyle', email: 'selina@wayne.com', role: 'Manager', companyId: 'comp_wayne', passwordHash, status: 'Active', department: 'Operations', designation: 'Operations Manager' },
          { id: 'usr_umbrella_admin', name: 'Albert Wesker', email: 'wesker@umbrella.com', role: 'Company Admin', companyId: 'comp_umbrella', passwordHash, status: 'Suspended', department: 'Management', designation: 'Director' },
          { id: 'usr_oscorp_emp', name: 'Peter Parker', email: 'p.parker@oscorp.com', role: 'Employee', companyId: 'comp_oscorp', passwordHash, status: 'Active', department: 'Engineering', designation: 'Junior Dev' },
          { id: 'usr_acme_2', name: 'Marcus Vance', email: 'marcus.v@acme.com', role: 'Manager', companyId: 'comp_acme', passwordHash, status: 'Active', department: 'Engineering', designation: 'Tech Lead' },
          { id: 'usr_acme_3', name: 'Sophia Patel', email: 'sophia.p@acme.com', role: 'Employee', companyId: 'comp_acme', passwordHash, status: 'Active', department: 'Marketing', designation: 'Analyst' },
          { id: 'usr_acme_4', name: 'Harvey Specter', email: 'harvey.s@acme.com', role: 'Employee', companyId: 'comp_acme', passwordHash, status: 'Active', department: 'Sales', designation: 'Partner' },
          { id: 'usr_acme_5', name: 'Diana Prince', email: 'diana.p@acme.com', role: 'HR', companyId: 'comp_acme', passwordHash, status: 'Active', department: 'HR', designation: 'Director' },
          { id: 'usr_acme_6', name: 'Bruce Wayne', email: 'bruce.w@acme.com', role: 'Manager', companyId: 'comp_acme', passwordHash, status: 'On Leave', department: 'Sales', designation: 'Director' }
        ];

        for (let e of employees) {
          const exists = await Employee.findOne({ where: { email: e.email } });
          if (!exists) await Employee.create(e);
        }

        res.json({ success: true, message: 'All mock companies and employees restored successfully!' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Alter expense_claims table
    try {
      await sequelize.query("ALTER TABLE expense_claims ADD COLUMN company_id VARCHAR(255) DEFAULT '';");
      console.log("Successfully altered expense_claims table to add company_id column");
    } catch (err) {
      // Column already exists, safe to ignore
    }

    // Alter companies table with new SaaS columns
    const companyAlters = [
      "ALTER TABLE companies ADD COLUMN gst VARCHAR(255) DEFAULT '';",
      "ALTER TABLE companies ADD COLUMN address TEXT;",
      "ALTER TABLE companies ADD COLUMN country VARCHAR(255) DEFAULT '';",
      "ALTER TABLE companies ADD COLUMN state VARCHAR(255) DEFAULT '';",
      "ALTER TABLE companies ADD COLUMN city VARCHAR(255) DEFAULT '';",
      "ALTER TABLE companies ADD COLUMN timezone VARCHAR(255) DEFAULT 'UTC';",
      "ALTER TABLE companies ADD COLUMN currency VARCHAR(255) DEFAULT 'USD';",
      "ALTER TABLE companies ADD COLUMN subscription_plan_id VARCHAR(255) DEFAULT 'starter';",
      "ALTER TABLE companies ADD COLUMN max_employees INT DEFAULT 100;",
      "ALTER TABLE companies ADD COLUMN storage_limit FLOAT DEFAULT 50.0;",
      "ALTER TABLE companies ADD COLUMN storage_used FLOAT DEFAULT 0.0;",
      "ALTER TABLE companies ADD COLUMN status ENUM('active', 'suspended', 'trial', 'expired') DEFAULT 'trial';",
      "ALTER TABLE companies ADD COLUMN created_date VARCHAR(255);"
    ];

    for (const q of companyAlters) {
      try {
        await sequelize.query(q);
      } catch (err) {
        // Column already exists, safe to ignore
      }
    }
    console.log("Checked and verified all companies columns are up to date.");

    // Alter leave_requests table with manager_status and manager_comment columns
    const leaveAlters = [
      "ALTER TABLE leave_requests ADD COLUMN manager_status VARCHAR(255) DEFAULT 'Pending';",
      "ALTER TABLE leave_requests ADD COLUMN manager_comment TEXT;"
    ];
    for (const q of leaveAlters) {
      try {
        await sequelize.query(q);
      } catch (err) {
        // Column already exists, safe to ignore
      }
    }
    console.log("Checked and verified all leave_requests manager recommendation columns are up to date.");

    // Alter employees table with documents column
    try {
      await sequelize.query("ALTER TABLE employees ADD COLUMN documents LONGTEXT;");
      console.log("Successfully altered employees table to add documents column");
    } catch (err) {
      // Column already exists, safe to ignore
    }

    // Alter employees table with avatar column to LONGTEXT
    try {
      await sequelize.query("ALTER TABLE employees MODIFY COLUMN avatar LONGTEXT;");
      console.log("Successfully altered employees table to modify avatar column to LONGTEXT");
    } catch (err) {
      console.log("Error altering avatar column:", err.message);
    }

    // Alter leave_requests table with attachment column
    try {
      await sequelize.query("ALTER TABLE leave_requests ADD COLUMN attachment LONGTEXT;");
      console.log("Successfully altered leave_requests table to add attachment column");
    } catch (err) {
      // Column already exists, safe to ignore
    }
  })
  .catch(err => console.error('Database sync error:', err));

// Routes Configuration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/superowner', require('./routes/superowner'));
app.use('/api/payment', require('./routes/payment'));

// Root endpoint to verify API status
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'HRMS Backend API is running successfully', connection: 'active' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HRMS Backend Server listening on port ${PORT}`);
  console.log("api connect successfully");
});
