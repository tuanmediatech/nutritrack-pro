import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import cors from "cors";
import db from "./src/db.js";
import { initScheduler } from "./src/mailer.js";
import { consultSymptoms } from "./src/medical.js";
import { triggerSync, receiveDb, receiveCode } from "./src/sync.js";

dotenv.config();

const _dirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();

const IS_LAPTOP = process.env.IS_LAPTOP === "true";
const SYNC_TARGET_URL = process.env.SYNC_TARGET_URL || "";

const app = express();
const PORT = Number(process.env.PORT) || 3456;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/sync/receive-code", express.raw({ type: "application/octet-stream", limit: "100mb" }));
app.use("/api/sync/receive-db", express.raw({ type: "application/octet-stream", limit: "50mb" }));

// Auth middleware
function authenticate(req: Request & { userId?: number }, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Bạn cần đăng nhập để thực hiện chức năng này." });
  (req as any).userId = parseInt(userId as string, 10);
  next();
}

// Gemini AI helper
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}

// ==================== HEALTH CHECK ====================
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ==================== AUTH ====================
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Vui lòng điền đầy đủ tên đăng nhập và mật khẩu." });

  db.get("SELECT * FROM users WHERE username = ?", [username.toLowerCase()], (err: any, user: any) => {
    if (err) return res.status(500).json({ error: "Lỗi server khi đăng nhập." });
    if (!user) return res.status(400).json({ error: "Tài khoản không tồn tại." });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: "Mật khẩu không chính xác." });

    db.get("SELECT * FROM app_settings WHERE user_id = ?", [user.id], (_e: any, settings: any) => {
      const s = settings || { day_type: "heavy", reminder_enabled: 1, water_reminder_enabled: 1, reminder_advance: 5, theme: "dark" };
      res.json({
        user: { id: user.id, username: user.username, name: user.name, profile_type: user.profile_type, height: user.height, start_weight: user.start_weight, target_weight: user.target_weight, start_date: user.start_date, glucose: user.glucose, role: user.role },
        settings: s
      });
    });
  });
});

app.post("/api/auth/register", (req, res) => {
  const { username, password, profile_type, name, height, start_weight, target_weight, start_date } = req.body;
  if (!username || !password || !profile_type || !name) return res.status(400).json({ error: "Vui lòng điền đầy đủ các thông tin bắt buộc." });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password, profile_type, name, height, start_weight, target_weight, start_date, glucose) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.6)`,
    [username.toLowerCase(), hashedPassword, profile_type, name, height || 175, start_weight || 70, target_weight || 75, start_date || new Date().toISOString().split("T")[0]],
    function (this: any, err: any) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) return res.status(400).json({ error: "Tên đăng nhập đã tồn tại." });
        return res.status(500).json({ error: "Lỗi tạo tài khoản: " + err.message });
      }
      const userId = this.lastID;
      db.run("INSERT INTO app_settings (user_id) VALUES (?)", [userId], () => {
        res.status(201).json({ id: userId, username, profile_type, name });
      });
    }
  );
});

// ==================== PROFILE / SETTINGS ====================
app.get("/api/user/profile", authenticate, (req: any, res) => {
  db.get("SELECT id, username, name, profile_type, height, start_weight, target_weight, start_date, glucose FROM users WHERE id = ?", [req.userId], (err: any, user: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(user);
  });
});

app.post("/api/user/profile", authenticate, (req: any, res) => {
  const { name, height, start_weight, target_weight, start_date, glucose } = req.body;
  db.run(`UPDATE users SET name = ?, height = ?, start_weight = ?, target_weight = ?, start_date = ?, glucose = ? WHERE id = ?`,
    [name, height, start_weight, target_weight, start_date, glucose, req.userId], (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Cập nhật hồ sơ thành công!" });
    });
});

app.get("/api/user/settings", authenticate, (req: any, res) => {
  db.get("SELECT * FROM app_settings WHERE user_id = ?", [req.userId], (err: any, settings: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(settings || {});
  });
});

app.post("/api/user/settings", authenticate, (req: any, res) => {
  const { day_type, reminder_enabled, water_reminder_enabled, reminder_advance, custom_checklists_json, custom_meals_json, gemini_api_key, active_schedule_id, theme } = req.body;
  db.run(`INSERT INTO app_settings (user_id, day_type, reminder_enabled, water_reminder_enabled, reminder_advance, custom_checklists_json, custom_meals_json, gemini_api_key, active_schedule_id, theme)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET day_type=excluded.day_type, reminder_enabled=excluded.reminder_enabled, water_reminder_enabled=excluded.water_reminder_enabled, reminder_advance=excluded.reminder_advance, custom_checklists_json=excluded.custom_checklists_json, custom_meals_json=excluded.custom_meals_json, gemini_api_key=excluded.gemini_api_key, active_schedule_id=excluded.active_schedule_id, theme=excluded.theme`,
    [req.userId, day_type, reminder_enabled, water_reminder_enabled, reminder_advance, custom_checklists_json, custom_meals_json, gemini_api_key, active_schedule_id, theme],
    (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Lưu cài đặt thành công!" });
    });
});

// ==================== ADMIN ====================
app.get("/api/admin/users", authenticate, (req: any, res) => {
  db.get("SELECT role FROM users WHERE id = ?", [req.userId], (err: any, row: any) => {
    if (err || !row || row.role !== "admin") return res.status(403).json({ error: "Quyền truy cập bị từ chối. Chỉ dành cho admin." });
    db.all("SELECT id, username, name, profile_type, created_at, role FROM users ORDER BY created_at DESC", [], (err: any, users: any[]) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(users);
    });
  });
});

// ==================== LOGS ====================
app.get("/api/logs", authenticate, (req: any, res) => {
  const { date } = req.query;
  let query = "SELECT * FROM logs WHERE user_id = ?";
  const params: any[] = [req.userId];
  if (date) { query += " AND date = ?"; params.push(date); }
  query += " ORDER BY date DESC, time DESC";
  db.all(query, params, (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/logs", authenticate, (req: any, res) => {
  const { id, date, time, meal_type, food, rice, water, feeling, protein, calories, timestamp } = req.body;
  db.run(`INSERT INTO logs (id, user_id, date, time, meal_type, food, rice, water, feeling, protein, calories, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.userId, date, time, meal_type, food, rice || 0, water || 0, feeling || "ok", protein || 0, calories || 0, timestamp],
    (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Ghi nhật ký thành công!" });
    });
});

app.delete("/api/logs/:id", authenticate, (req: any, res) => {
  db.run("DELETE FROM logs WHERE id = ? AND user_id = ?", [req.params.id, req.userId], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Đã xóa bữa ăn!" });
  });
});

// ==================== WEIGHT ====================
app.get("/api/weight", authenticate, (req: any, res) => {
  db.all("SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date ASC", [req.userId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/weight", authenticate, (req: any, res) => {
  const { date, weight, note } = req.body;
  db.run(`INSERT INTO weight_logs (user_id, date, weight, note) VALUES (?, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET weight=excluded.weight, note=excluded.note`,
    [req.userId, date, weight, note], (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Đã lưu cân nặng!" });
    });
});

app.delete("/api/weight/:date", authenticate, (req: any, res) => {
  db.run("DELETE FROM weight_logs WHERE date = ? AND user_id = ?", [req.params.date, req.userId], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Đã xóa cân nặng!" });
  });
});

// ==================== CHECKLIST ====================
app.get("/api/checklist", authenticate, (req: any, res) => {
  const { date } = req.query;
  db.all("SELECT item_id, is_done FROM checklist_logs WHERE user_id = ? AND date = ?", [req.userId, date], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted: Record<string, boolean> = {};
    rows.forEach((r: any) => { formatted[r.item_id] = !!r.is_done; });
    res.json(formatted);
  });
});

app.post("/api/checklist/toggle", authenticate, (req: any, res) => {
  const { date, item_id, is_done } = req.body;
  db.run(`INSERT INTO checklist_logs (user_id, date, item_id, is_done) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, date, item_id) DO UPDATE SET is_done=excluded.is_done`,
    [req.userId, date, item_id, is_done ? 1 : 0], (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Đã cập nhật checklist!" });
    });
});

app.post("/api/checklist/reset", authenticate, (req: any, res) => {
  const { date } = req.body;
  db.run("DELETE FROM checklist_logs WHERE user_id = ? AND date = ?", [req.userId, date], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Đã reset checklist!" });
  });
});

// ==================== NOTES ====================
app.get("/api/notes", authenticate, (req: any, res) => {
  db.all("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC", [req.userId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/notes", authenticate, (req: any, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "Tiêu đề không được để trống" });
  db.run(`INSERT INTO notes (user_id, title, content, updated_at) VALUES (?, ?, ?, datetime('now', 'localtime'))`,
    [req.userId, title, content], function (this: any, err: any) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, content, updated_at: new Date().toISOString() });
    });
});

app.put("/api/notes/:id", authenticate, (req: any, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "Tiêu đề không được để trống" });
  db.run(`UPDATE notes SET title = ?, content = ?, updated_at = datetime('now', 'localtime') WHERE id = ? AND user_id = ?`,
    [title, content, req.params.id, req.userId], (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Cập nhật ghi chú thành công" });
    });
});

app.delete("/api/notes/:id", authenticate, (req: any, res) => {
  db.run("DELETE FROM notes WHERE id = ? AND user_id = ?", [req.params.id, req.userId], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Đã xóa ghi chú!" });
  });
});

// ==================== HEALTH RECORDS ====================
app.get("/api/health/records", authenticate, (req: any, res) => {
  db.all("SELECT * FROM health_records WHERE user_id = ? ORDER BY checkup_date DESC", [req.userId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/health/records", authenticate, (req: any, res) => {
  const { id, checkup_date, blood_pressure, glucose, cholesterol, uric_acid, liver_enzymes, conclusion, notes } = req.body;
  if (!checkup_date) return res.status(400).json({ error: "Vui lòng điền ngày khám bệnh." });
  if (id) {
    db.run(`UPDATE health_records SET checkup_date=?, blood_pressure=?, glucose=?, cholesterol=?, uric_acid=?, liver_enzymes=?, conclusion=?, notes=? WHERE id=? AND user_id=?`,
      [checkup_date, blood_pressure, glucose, cholesterol, uric_acid, liver_enzymes, conclusion, notes, id, req.userId], (err: any) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cập nhật hồ sơ khám thành công!" });
      });
  } else {
    db.run(`INSERT INTO health_records (user_id, checkup_date, blood_pressure, glucose, cholesterol, uric_acid, liver_enzymes, conclusion, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, checkup_date, blood_pressure, glucose, cholesterol, uric_acid, liver_enzymes, conclusion, notes], (err: any) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Lưu hồ sơ khám sức khỏe thành công!" });
      });
  }
});

app.delete("/api/health/records/:id", authenticate, (req: any, res) => {
  db.run("DELETE FROM health_records WHERE id = ? AND user_id = ?", [req.params.id, req.userId], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Đã xóa hồ sơ khám bệnh!" });
  });
});

// ==================== HEALTH CONSULTATION ====================
app.get("/api/health/consultations", authenticate, (req: any, res) => {
  db.all("SELECT * FROM symptom_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC", [req.userId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map((r: any) => {
      try { r.references = JSON.parse(r.references_json || "[]"); } catch { r.references = []; }
      return r;
    });
    res.json(parsed);
  });
});

app.post("/api/health/consult", authenticate, async (req: any, res) => {
  const { symptoms, date } = req.body;
  if (!symptoms) return res.status(400).json({ error: "Vui lòng nhập triệu chứng." });

  const logDate = date || new Date().toISOString().split("T")[0];

  // Try AI first, fallback to local medical knowledge
  const ai = getGenAI();
  let advice: any;

  if (ai) {
    try {
      const prompt = `Bạn là bác sĩ tư vấn y khoa người Việt Nam. Người dùng mô tả: "${symptoms}". Trả về JSON: {"symptomName":"...","assessment":"...","recommendations":"...","warnings":"...","references":[{"title":"...","url":"..."}]}`;
      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: "application/json" } });
      advice = JSON.parse(response.text || "{}");
    } catch {
      advice = consultSymptoms(symptoms);
    }
  } else {
    advice = consultSymptoms(symptoms);
  }

  db.run(`INSERT INTO symptom_logs (user_id, log_date, symptoms, assessment, recommendations, references_json) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, logDate, symptoms, `${advice.symptomName}: ${advice.assessment}`, `${advice.recommendations}\n\n${advice.warnings || ""}`, JSON.stringify(advice.references || [])],
    function (this: any, err: any) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, log_date: logDate, symptoms, ...advice });
    });
});

// ==================== AI SCHEDULE ====================
app.post("/api/ai/generate-schedule", authenticate, async (req: any, res) => {
  try {
    const ai = getGenAI();
    if (!ai) return res.status(400).json({ error: "GEMINI_API_KEY chưa được cấu hình." });

    const { habits, userProfile } = req.body;
    if (!habits) return res.status(400).json({ error: "Vui lòng nhập thói quen và nhu cầu." });

    const profileText = userProfile
      ? `Hồ sơ: ${userProfile.name}, chế độ: ${userProfile.profileType === "tang_can" ? "Tăng cân" : "Giảm cân"}, Cân nặng: ${userProfile.startWeight}kg, Mục tiêu: ${userProfile.targetWeight}kg.`
      : "";

    const prompt = `Bạn là chuyên gia dinh dưỡng thể thao chuyên nghiệp.\n${profileText}\nThói quen: "${habits}"\n\nTạo Lịch Trình Dinh Dưỡng chi tiết theo giờ bằng tiếng Việt.\nTên ngắn gọn dưới 60 ký tự.\nJSON: {"name":"...","description":"...","meal_schedule":[{"id":"...","time":"HH:MM","displayTime":"...","name":"...","icon":"...","activity":"...","goal":"...","category":"morning|noon|afternoon|evening","options":["..."]}],"checklist":[{"id":"c1","text":"...","time":"...","icon":"..."}]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, meal_schedule: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, time: { type: Type.STRING }, displayTime: { type: Type.STRING }, name: { type: Type.STRING }, icon: { type: Type.STRING }, activity: { type: Type.STRING }, goal: { type: Type.STRING }, category: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } } } } }, checklist: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING }, time: { type: Type.STRING }, icon: { type: Type.STRING } } } } } } }
    });

    const scheduleData = JSON.parse(response.text || "{}");
    if (scheduleData.name) {
      scheduleData.name = scheduleData.name.replace(/\d{8,}/g, "").trim();
      if (scheduleData.name.length > 70) scheduleData.name = scheduleData.name.substring(0, 70) + "...";
    }

    // Save to DB
    db.run(`INSERT INTO custom_schedules (user_id, name, description, meal_schedule_json, checklist_json) VALUES (?, ?, ?, ?, ?)`,
      [req.userId, scheduleData.name, scheduleData.description, JSON.stringify(scheduleData.meal_schedule), JSON.stringify(scheduleData.checklist || [])],
      function (this: any, err: any) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, schedule: scheduleData });
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi tạo lịch trình AI" });
  }
});

app.get("/api/schedules", authenticate, (req: any, res) => {
  db.all("SELECT id, name, description, created_at FROM custom_schedules WHERE user_id = ? ORDER BY id DESC", [req.userId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/schedules/:id", authenticate, (req: any, res) => {
  db.get("SELECT * FROM custom_schedules WHERE id = ? AND user_id = ?", [req.params.id, req.userId], (err: any, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Không tìm thấy" });
    try { row.meal_schedule = JSON.parse(row.meal_schedule_json || "[]"); } catch { row.meal_schedule = []; }
    try { row.checklist = JSON.parse(row.checklist_json || "[]"); } catch { row.checklist = []; }
    res.json(row);
  });
});

app.post("/api/schedules/activate", authenticate, (req: any, res) => {
  const { schedule_id } = req.body;
  const val = schedule_id ? parseInt(schedule_id, 10) : null;
  db.run("UPDATE app_settings SET active_schedule_id = ? WHERE user_id = ?", [val, req.userId], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Đã kích hoạt lịch trình!" });
  });
});

app.delete("/api/schedules/:id", authenticate, (req: any, res) => {
  db.run("DELETE FROM custom_schedules WHERE id = ? AND user_id = ?", [req.params.id, req.userId], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run("UPDATE app_settings SET active_schedule_id = NULL WHERE user_id = ? AND active_schedule_id = ?", [req.userId, req.params.id]);
    res.json({ message: "Đã xóa lịch trình!" });
  });
});

app.put("/api/schedules/:id", authenticate, (req: any, res) => {
  const { name, meal_schedule_json, checklist_json } = req.body;
  db.run(`UPDATE custom_schedules SET name=COALESCE(?,name), meal_schedule_json=COALESCE(?,meal_schedule_json), checklist_json=COALESCE(?,checklist_json) WHERE id=? AND user_id=?`,
    [name, meal_schedule_json, checklist_json, req.params.id, req.userId], (err: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Đã cập nhật lịch trình!" });
    });
});

// ==================== SYNC ====================
app.get("/api/sync/status", (_req, res) => {
  res.json({ isLaptop: IS_LAPTOP, targetUrl: SYNC_TARGET_URL });
});

app.post("/api/sync/trigger", authenticate, async (_req, res) => {
  const { type, targetUrl } = _req.body;
  try {
    const results = await triggerSync(type, targetUrl);
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync/receive-db", receiveDb);
app.post("/api/sync/receive-code", receiveCode);

// ==================== START SERVER ====================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🥗 NutriTrack Pro Server is running!`);
    console.log(`🚀 URL local: http://localhost:${PORT}`);
    console.log(`🔧 Chế độ máy: ${IS_LAPTOP ? "Laptop (Source)" : "PC (Target)"}`);
    console.log(`===============================================`);
    initScheduler();
  });
}

startServer();
