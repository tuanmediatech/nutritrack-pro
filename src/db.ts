import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const dbPath = path.resolve(_dirname, '../nutritrack.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu SQLite:', err.message);
  } else {
    console.log('Đã kết nối thành công tới database SQLite tại:', dbPath);
  }
});

// Run DB Queries in sequence
db.serialize(() => {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profile_type TEXT NOT NULL,
      name TEXT NOT NULL,
      height REAL DEFAULT 175,
      start_weight REAL DEFAULT 71.0,
      target_weight REAL DEFAULT 78.0,
      start_date TEXT DEFAULT CURRENT_DATE,
      glucose REAL DEFAULT 5.6,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Nutrition Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food TEXT NOT NULL,
      rice REAL DEFAULT 0,
      water INTEGER DEFAULT 0,
      feeling TEXT DEFAULT 'ok',
      protein REAL DEFAULT 0,
      calories REAL DEFAULT 0,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 3. Weight Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT UNIQUE NOT NULL,
      weight REAL NOT NULL,
      note TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 4. Checklist Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS checklist_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      item_id TEXT NOT NULL,
      is_done INTEGER DEFAULT 0,
      UNIQUE(user_id, date, item_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 5. Notebook Table
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 6. User Settings Table
  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      user_id INTEGER PRIMARY KEY,
      day_type TEXT DEFAULT 'heavy',
      reminder_enabled INTEGER DEFAULT 1,
      water_reminder_enabled INTEGER DEFAULT 1,
      reminder_advance INTEGER DEFAULT 5,
      custom_checklists_json TEXT,
      custom_meals_json TEXT,
      active_schedule_id INTEGER,
      gemini_api_key TEXT,
      theme TEXT DEFAULT 'dark',
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Safe migrations for existing DBs
  db.run("ALTER TABLE app_settings ADD COLUMN custom_checklists_json TEXT", () => {});
  db.run("ALTER TABLE app_settings ADD COLUMN custom_meals_json TEXT", () => {});
  db.run("ALTER TABLE app_settings ADD COLUMN active_schedule_id INTEGER", () => {});
  db.run("ALTER TABLE app_settings ADD COLUMN gemini_api_key TEXT", () => {});
  db.run("ALTER TABLE app_settings ADD COLUMN theme TEXT DEFAULT 'dark'", () => {});
  db.run("ALTER TABLE health_records ADD COLUMN file_name TEXT", () => {});
  db.run("ALTER TABLE health_records ADD COLUMN ai_advice TEXT", () => {});

  // 6.5. Custom AI Schedules Table
  db.run(`
    CREATE TABLE IF NOT EXISTS custom_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      meal_schedule_json TEXT NOT NULL,
      checklist_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 7. Periodic Medical Checkup Table
  db.run(`
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      checkup_date TEXT NOT NULL,
      blood_pressure TEXT,
      glucose REAL,
      cholesterol REAL,
      uric_acid REAL,
      liver_enzymes TEXT,
      conclusion TEXT,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 8. Symptom Logs & AI Consultation Table
  db.run(`
    CREATE TABLE IF NOT EXISTS symptom_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      assessment TEXT,
      recommendations TEXT,
      references_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Insert default admin user if table is empty
  db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
    if (err) {
      console.error('Lỗi kiểm tra bảng users:', err);
      return;
    }
    if (row.count === 0) {
      console.log('Khởi tạo tài khoản mẫu...');
      const hashedAdmin = bcrypt.hashSync('admin', 10);

      db.run(`
        INSERT INTO users (username, password, profile_type, name, height, start_weight, target_weight, start_date, glucose, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['admin', hashedAdmin, 'tang_can', 'Nguyễn Tuân (Admin)', 175, 71.0, 78.0, '2026-06-07', 5.6, 'admin'], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) console.error('Lỗi tạo user admin:', err);
        else {
          const userId = this.lastID;
          db.run(`INSERT OR IGNORE INTO app_settings (user_id) VALUES (?)`, [userId]);
          console.log('Tạo tài khoản Admin mẫu thành công! (Username: admin, Pass: admin)');
        }
      });
    }
  });
});

export default db;
