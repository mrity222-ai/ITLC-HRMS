const sequelize = require('../backend/config/db');

async function run() {
  try {
    console.log("Altering table column...");
    await sequelize.query("ALTER TABLE Companies MODIFY logo LONGTEXT;");
    console.log("Database table Companies altered successfully to LONGTEXT!");
  } catch (err) {
    console.error("Failed to alter table:", err);
  } finally {
    process.exit(0);
  }
}

run();
