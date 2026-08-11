import nodemailer from 'nodemailer';
import cron from 'node-cron';
import db from './db.js';

// Transporter configuration using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Define meal and training schedules for both profiles
const SCHEDULES: Record<string, Array<{ id: string; time: string; name: string; type: string; desc: string }>> = {
  tang_can: [
    { id: 'pre_morning', time: '06:00', name: 'Thức dậy & Uống nước ấm 🥛', type: 'water', desc: 'Uống 300ml nước ấm khởi động hệ tiêu hóa & bù nước sau giấc ngủ.' },
    { id: 'breakfast', time: '06:30', name: 'Ăn sáng chính + Sữa Vinamilk 🍜', type: 'eat', desc: 'Phở / bún bò / bánh mì + 1 bịch Sữa tươi Vinamilk Nguyên chất (220ml).' },
    { id: 'water_m1', time: '08:30', name: 'Uống nước ca làm việc sáng 💧', type: 'water', desc: 'Uống 250ml nước lọc giữ cơ thể luôn đủ nước khi làm việc hành chính.' },
    { id: 'snack_morning', time: '09:30', name: 'Bữa phụ sáng tại công ty 🥗', type: 'eat', desc: 'Sữa chua hạt / trái cây / trứng luộc để duy trì năng lượng.' },
    { id: 'water_m2', time: '10:30', name: 'Uống nước ca làm việc sáng 💧', type: 'water', desc: 'Uống 250ml nước lọc trước khi chuẩn bị nghỉ trưa.' },
    { id: 'lunch', time: '11:45', name: 'Ăn trưa chính 🍚', type: 'eat', desc: '2 chén cơm đầy + đạm nạc (cá/thịt/gà/trứng) + rau xanh + 1 chén canh.' },
    { id: 'rest_noon', time: '12:30', name: 'Nghỉ trưa phục hồi 😴', type: 'workout', desc: 'Chợp mắt 20–30 phút giúp lấy lại sức làm việc ca chiều 13h30-17h.' },
    { id: 'water_a1', time: '14:30', name: 'Uống nước ca làm việc chiều 💧', type: 'water', desc: 'Uống 250ml nước lọc duy trì độ tập trung ca chiều công ty.' },
    { id: 'snack_afternoon', time: '15:30', name: 'Bữa phụ chiều + Sữa Vinamilk 🍌', type: 'eat', desc: '1 bịch Sữa tươi Vinamilk Nguyên chất (220ml) + chuối luộc / bắp luộc.' },
    { id: 'water_a2', time: '16:00', name: 'Uống nước ca làm việc chiều 💧', type: 'water', desc: 'Uống 250ml nước lọc kết thúc ca làm việc công ty.' },
    { id: 'pre_sport', time: '16:30', name: 'Ăn nhẹ trước chơi thể thao 🥖', type: 'eat', desc: '1 lát bánh mì / 1 quả trứng luộc để nạp năng lượng nhanh.' },
    { id: 'sport_evening', time: '17:00', name: '🏓 Ca thể thao Bóng bàn / Pickleball', type: 'workout', desc: 'Chơi thể thao 17h00 - 19h00. Nhớ uống bổ sung 500-700ml nước điện giải.' },
    { id: 'dinner', time: '19:30', name: 'Ăn tối chính 🌙', type: 'eat', desc: 'Cơm (2 chén nếu chơi thể thao) + cá/gà + rau xanh + canh xương.' },
    { id: 'water_night', time: '21:00', name: 'Uống nước buổi tối 💧', type: 'water', desc: 'Uống 250ml nước lọc thư giãn buổi tối.' },
    { id: 'pre_sleep', time: '22:00', name: 'Sữa tươi Vinamilk trước ngủ 🥛', type: 'eat', desc: '1 bịch Sữa tươi Vinamilk Nguyên chất (220ml) ấm giúp phục hồi cơ bắp & dễ ngủ.' },
    { id: 'sleep', time: '22:30', name: 'Đi ngủ phục hồi 💤', type: 'workout', desc: 'Tắt thiết bị điện tử, ngủ đủ 7–8 tiếng để kích hoạt hormone tăng cân tăng cơ.' }
  ],
  giam_can: [
    { id: 'wake_up', time: '05:00', name: 'Thức dậy & Uống nước ấm 💧', type: 'eat', desc: 'Uống 1 ly nước ấm ngay khi ngủ dậy để thải độc tố và khởi động hệ trao đổi chất.' },
    { id: 'breakfast', time: '06:30', name: 'Ăn sáng lành mạnh 🥣', type: 'eat', desc: 'Yến mạch trái cây hoặc 2 quả trứng luộc + khoai lang nhỏ. Hạn chế tinh bột nhanh.' },
    { id: 'snack_morning', time: '09:30', name: 'Bữa phụ sáng 🍏', type: 'eat', desc: '1 quả táo xanh hoặc 1 hũ sữa chua không đường để giảm cảm giác thèm ăn.' },
    { id: 'lunch', time: '12:00', name: 'Ăn trưa kiểm soát calo 🥗', type: 'eat', desc: '1 chén cơm nhỏ + ức gà áp chảo / cá hấp + thật nhiều rau luộc/salad ít sốt.' },
    { id: 'snack_afternoon', time: '15:30', name: 'Bữa phụ chiều 🥜', type: 'eat', desc: 'Ổi hoặc 5-7 hạt hạnh nhân. Giữ lượng calo phụ dưới 100 kcal.' },
    { id: 'cardio', time: '17:30', name: '🔥 Cardio / Đốt mỡ (Chạy bộ, Pickleball)', type: 'workout', desc: 'Buổi tập tối thiểu 45 phút để kích hoạt chế độ đốt mỡ tự nhiên.' },
    { id: 'dinner', time: '18:45', name: 'Ăn tối low-carb 🥗', type: 'eat', desc: 'Nhiều rau xanh, đạm nạc (cá/ức gà), hạn chế tinh bột cơm sau 19h.' },
    { id: 'sleep_prep', time: '22:30', name: 'Chuẩn bị ngủ phục hồi 💤', type: 'workout', desc: 'Ngủ đủ 7-8 tiếng. Đốt mỡ tự nhiên hiệu quả nhất khi ngủ sâu trước 23h.' }
  ]
};

function subtractMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  let totalMins = h * 60 + m - mins;
  if (totalMins < 0) totalMins += 24 * 60;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

async function sendReminderEmail(toEmail: string, userName: string, eventName: string, type: string, details: string, scheduledTime: string) {
  const isWorkout = type === 'workout';
  const typeText = isWorkout ? 'LỊCH TẬP LUYỆN' : 'LỊCH ĂN UỐNG';
  const colorTheme = isWorkout ? '#8b5cf6' : '#10b981';
  const bgSoft = isWorkout ? 'rgba(139, 92, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)';

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background-color: ${colorTheme}; padding: 24px; text-align: center; color: white;">
        <span style="font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">NutriTrack Pro</span>
        <h2 style="margin: 10px 0 0 0; font-size: 22px;">⏰ Nhắc Lịch Tự Động</h2>
      </div>
      <div style="padding: 24px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Đây là thông báo nhắc nhở lịch sinh hoạt từ hệ thống <strong>NutriTrack Pro</strong>.</p>
        <div style="background-color: ${bgSoft}; border-left: 4px solid ${colorTheme}; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <span style="font-size: 11px; font-weight: bold; color: ${colorTheme}; letter-spacing: 1px;">${typeText}</span>
          <h3 style="margin: 4px 0; font-size: 18px; color: #0f172a;">${eventName}</h3>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #475569;"><strong>Giờ thực hiện:</strong> ${scheduledTime}</p>
        </div>
        <div style="margin-top: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #334155;">💡 Gợi ý thực hiện:</h4>
          <p style="margin: 0; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 14px; border: 1px solid #f1f5f9;">${details}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
          Mở ứng dụng tại <a href="${process.env.SYNC_TARGET_URL || 'http://localhost:3456'}" style="color: ${colorTheme}; text-decoration: none; font-weight: bold;">NutriTrack Pro Dashboard</a> để ghi nhận tiến trình.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        © 2026 NTM Systems & Automation. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"NutriTrack Pro" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `[NutriTrack] Nhắc lịch: ${eventName} (${scheduledTime})`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi thành công tới ${toEmail} cho sự kiện ${eventName}. MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[Email] Lỗi gửi email tới ${toEmail}:`, error.message);
  }
}

async function sendDailySummaryEmail(toEmail: string, user: any, logs: any[], checks: Record<string, boolean>, currentWeight: number) {
  const isGain = user.profile_type === 'tang_can';
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((l: any) => l.date === today);

  const totalCal = todayLogs.reduce((sum: number, l: any) => sum + (l.calories || 0), 0);
  const totalPro = todayLogs.reduce((sum: number, l: any) => sum + (l.protein || 0), 0);
  const totalWater = todayLogs.reduce((sum: number, l: any) => sum + (l.water || 0), 0);
  const totalRice = todayLogs.reduce((sum: number, l: any) => sum + (l.rice || 0), 0);

  const doneChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = 12;
  const checkPct = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const dateFormatted = new Date().toLocaleDateString('vi-VN');

  let advice = '';
  if (isGain) {
    advice = (totalCal >= 2500 && totalPro >= 100)
      ? 'Hôm nay bạn nạp calo và đạm rất tốt, cực kỳ thích hợp để xây dựng cơ bắp và tăng cân sạch!'
      : 'Bạn nạp hơi ít năng lượng và đạm hôm nay. Hãy cố gắng ăn thêm các bữa phụ và sữa tươi!';
  } else {
    advice = (totalCal <= 1800 && totalWater >= 2000)
      ? 'Tuyệt vời! Lượng calo nạp vào hôm nay nằm trong tầm kiểm soát tốt để duy trì thâm hụt calo đốt mỡ.'
      : 'Hôm nay lượng calo hơi cao hoặc thiếu nước. Hãy uống thêm nước và giảm tinh bột vào ngày mai!';
  }

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center; color: white; border-bottom: 3px solid #f97316;">
        <span style="font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; color: #f97316;">NutriTrack Pro</span>
        <h2 style="margin: 10px 0 0 0; font-size: 22px;">📊 Báo Cáo Tổng Kết Ngày</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Ngày ${dateFormatted}</p>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <thead><tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 10px; text-align: left; color: #475569;">Chỉ số</th>
            <th style="padding: 10px; text-align: right; color: #475569;">Đạt được</th>
            <th style="padding: 10px; text-align: right; color: #475569;">Mục tiêu</th>
          </tr></thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold;">🔥 Calories</td><td style="padding: 10px; text-align: right; color: #f97316; font-weight: bold;">${totalCal} kcal</td><td style="padding: 10px; text-align: right; color: #64748b;">${isGain ? '>= 2500' : '<= 1800'} kcal</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold;">🥚 Protein</td><td style="padding: 10px; text-align: right; color: #06b6d4; font-weight: bold;">${totalPro} g</td><td style="padding: 10px; text-align: right; color: #64748b;">~${Math.round(currentWeight * 1.8)} g</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold;">💧 Nước uống</td><td style="padding: 10px; text-align: right; color: #3b82f6; font-weight: bold;">${totalWater} ml</td><td style="padding: 10px; text-align: right; color: #64748b;">2000-2500 ml</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold;">🍚 Lượng cơm</td><td style="padding: 10px; text-align: right; font-weight: bold;">${totalRice.toFixed(1)} chén</td><td style="padding: 10px; text-align: right; color: #64748b;">${isGain ? '3.5 - 4' : '1.5 - 2'} chén</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold;">✅ Bảng kiểm</td><td style="padding: 10px; text-align: right; color: #10b981; font-weight: bold;">${doneChecks}/${totalChecks} (${checkPct}%)</td><td style="padding: 10px; text-align: right; color: #64748b;">100%</td></tr>
            <tr style="border-bottom: 2px solid #e2e8f0;"><td style="padding: 10px; font-weight: bold;">⚖️ Cân nặng hiện tại</td><td style="padding: 10px; text-align: right; color: #8b5cf6; font-weight: bold;">${currentWeight.toFixed(1)} kg</td><td style="padding: 10px; text-align: right; color: #64748b;">Mục tiêu: ${user.target_weight} kg</td></tr>
          </tbody>
        </table>
        <div style="background-color: #f8fafc; border-left: 4px solid #f97316; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a;">📝 Đánh giá chuyên sâu:</h4>
          <p style="margin: 0; font-size: 14px; color: #334155; font-style: italic;">"${advice}"</p>
        </div>
        <div style="margin-top: 24px;">
          <h4 style="margin: 0 0 10px 0; color: #334155;">📋 Các bữa đã ghi nhận hôm nay:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
            ${todayLogs.map((l: any) => `<li><strong>[${l.time}]</strong> ${l.food}</li>`).join('') || '<li style="color:#94a3b8; font-style:italic;">Không ghi nhận hoạt động nào hôm nay</li>'}
          </ul>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
          Xem thêm chi tiết tại <a href="${process.env.SYNC_TARGET_URL || 'http://localhost:3456'}" style="color: #f97316; text-decoration: none; font-weight: bold;">NutriTrack Pro Web App</a>.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        © 2026 NTM Systems & Automation. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"NutriTrack Pro" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `[NutriTrack] Báo cáo tổng kết ngày ${dateFormatted}`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi báo cáo tổng kết ngày thành công tới ${toEmail}. MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[Email] Lỗi gửi báo cáo tổng kết ngày tới ${toEmail}:`, error.message);
  }
}

export function initScheduler() {
  console.log('[Scheduler] Đã kích hoạt hệ thống kiểm tra và gửi nhắc nhở qua Gmail');

  // Minute check cron for live reminders
  cron.schedule('* * * * *', () => {
    const now = new Date();
    const currentHHMM = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

    db.all(`
      SELECT u.id, u.username, u.name, u.profile_type, s.reminder_enabled, s.reminder_advance
      FROM users u
      JOIN app_settings s ON u.id = s.user_id
      WHERE s.reminder_enabled = 1
    `, [], async (err: Error | null, users: any[]) => {
      if (err) { console.error('[Scheduler] Lỗi truy vấn database:', err); return; }
      if (!users || users.length === 0) return;

      for (const user of users) {
        const schedule = SCHEDULES[user.profile_type] || [];
        const advance = user.reminder_advance || 5;

        for (const event of schedule) {
          const notifyTime = subtractMinutes(event.time, advance);
          if (notifyTime === currentHHMM) {
            const targetEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER || '';
            console.log(`[Scheduler] Nhắc: ${event.name} lúc ${event.time} cho user ${user.name}`);
            await sendReminderEmail(targetEmail, user.name, event.name, event.type, event.desc, event.time);
          }
        }
      }
    });
  });

  // Daily summary at 22:30
  cron.schedule('30 22 * * *', () => {
    const today = new Date().toISOString().split('T')[0];
    console.log('[Scheduler] Bắt đầu tạo báo cáo tổng kết ngày...');

    db.all('SELECT id, name, username, profile_type, target_weight, start_weight FROM users', [], async (err: Error | null, users: any[]) => {
      if (err || !users) return;
      for (const user of users) {
        db.all('SELECT * FROM logs WHERE user_id = ? AND date = ?', [user.id, today], (errLogs: Error | null, logs: any[] = []) => {
          db.all('SELECT item_id, is_done FROM checklist_logs WHERE user_id = ? AND date = ?', [user.id, today], (errCheck: Error | null, checkRows: any[] = []) => {
            const checks: Record<string, boolean> = {};
            checkRows.forEach((r: any) => { checks[r.item_id] = !!r.is_done; });

            db.get('SELECT weight FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1', [user.id], (errW: Error | null, wRow: any) => {
              const currentWeight = wRow ? wRow.weight : user.start_weight;
              const targetEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER || '';
              sendDailySummaryEmail(targetEmail, user, logs, checks, currentWeight);
            });
          });
        });
      }
    });
  });
}

export { sendReminderEmail, sendDailySummaryEmail };
