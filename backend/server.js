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
require('./models/CorrectionRequest');

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

// Root endpoint to verify API status
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'HRMS Backend API is running successfully', connection: 'active' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HRMS Backend Server listening on port ${PORT}`);
  console.log("api connect successfully");
});
