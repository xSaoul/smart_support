const db = require('../mariadb');

async function setupDatabase() {
  await db.execute(`CREATE TABLE IF NOT EXISTS thread_timers (
    thread_id VARCHAR(50) PRIMARY KEY,
    op_id VARCHAR(50) NOT NULL,
    last_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    close_scheduled_time TIMESTAMP DEFAULT NULL)`);
}

module.exports = { setupDatabase };
