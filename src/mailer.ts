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

async function sendWeeklySummaryEmail(toEmail: string, user: any, past7DaysLogs: any[], past7DaysChecklist: any[], currentWeight: number) {
  const isGain = user.profile_type === 'tang_can';
  
  // Calculate weekly stats
  const totalWater = past7DaysLogs.reduce((sum: number, l: any) => sum + (l.water || 0), 0);
  const avgWaterPerDay = Math.round(totalWater / 7);
  const totalMeals = past7DaysLogs.filter((l: any) => l.meal_type !== 'water').length;
  const doneChecklistCount = past7DaysChecklist.filter((c: any) => c.is_done).length;

  // Highlights & Good Achievements
  const goodPoints: string[] = [];
  const improvePoints: string[] = [];

  if (doneChecklistCount >= 35) {
    goodPoints.push('✅ Duy trì kỷ luật bảng kiểm thói quen xuất sắc (hơn 5 thói quen cốt lõi/ngày).');
  } else {
    goodPoints.push('✅ Đã khởi tạo nhịp sinh hoạt và theo dõi sức khỏe chủ động hàng ngày.');
  }

  if (avgWaterPerDay >= 2000) {
    goodPoints.push(`✅ Bù nước & điện giải rất tốt: Trung bình ${avgWaterPerDay}ml nước lọc/ngày.`);
  } else {
    improvePoints.push(`⚠️ Uống chưa đủ nước: Trung bình ${avgWaterPerDay}ml/ngày. Cần tăng thêm 1 ly (250ml) vào ca làm việc chiều.`);
  }

  if (totalMeals >= 20) {
    goodPoints.push('✅ Duy trì đủ 3 bữa chính và 2 bữa phụ Vinamilk bổ sung đạm đúng giờ.');
  } else {
    improvePoints.push('⚠️ Khoảng cách giữa các bữa ăn còn thưa: Cần nhớ bổ sung 1 bịch Sữa tươi Vinamilk 220ml vào lúc 15h30 chiều.');
  }

  if (isGain) {
    if (currentWeight >= user.start_weight) {
      goodPoints.push(`✅ Tiến trình cân nặng ổn định: ${currentWeight.toFixed(1)}kg (Mục tiêu: ${user.target_weight}kg).`);
    } else {
      improvePoints.push('⚠️ Cân nặng giảm nhẹ: Cần đảm bảo ăn đủ 2 chén cơm ở bữa trưa và tối sau ca tập thể thao 17h.');
    }
  }

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px; text-align: center; color: white; border-bottom: 4px solid #10b981;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; background: rgba(16, 185, 129, 0.2); padding: 5px 12px; border-radius: 20px; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">NutriTrack Pro Weekly Report</span>
        <h2 style="margin: 12px 0 4px 0; font-size: 24px; font-weight: 800;">📊 Báo Cáo Tổng Kết Tuần & Định Hướng Sức Khỏe</h2>
        <p style="margin: 0; font-size: 13px; opacity: 0.8; color: #94a3b8;">Tổng hợp tiến trình & lời khuyên chuyên sâu từ AI Health System</p>
      </div>

      <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${user.name}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">Dưới đây là bảng tổng kết toàn bộ nhịp sinh hoạt, dinh dưỡng và chỉ số sức khỏe của anh trong 7 ngày qua:</p>

        <!-- GOOD ACHIEVEMENTS -->
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #166534; flex items-center gap-2;">🌟 Việc Đã Hoàn Thành Tốt Trong Tuần:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #15803d; line-height: 1.8;">
            ${goodPoints.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>

        <!-- AREAS FOR IMPROVEMENT -->
        <div style="background-color: #fffbebf5; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">💡 Việc Cần Cải Thiện Để Đảm Bảo Sức Khỏe Tuần Tới:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #b45309; line-height: 1.8;">
            ${improvePoints.length > 0 ? improvePoints.map(p => `<li>${p}</li>`).join('') : '<li>🎉 Rất xuất sắc! Anh đã thực hiện hoàn hảo mọi mục tiêu trong tuần qua!</li>'}
          </ul>
        </div>

        <!-- STATS TABLE SUMMARY -->
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px; text-align: left; color: #475569;">Chỉ số thống kê 7 ngày</th>
              <th style="padding: 12px; text-align: right; color: #475569;">Kết quả tuần</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold;">🥛 Nước uống trung bình/ngày</td>
              <td style="padding: 10px; text-align: right; color: #3b82f6; font-weight: bold;">${avgWaterPerDay} ml/ngày</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold;">🍱 Tổng số bữa ăn & phụ đã ghi nhận</td>
              <td style="padding: 10px; text-align: right; color: #10b981; font-weight: bold;">${totalMeals} bữa</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold;">✅ Tổng lượt tích chọn bảng kiểm thói quen</td>
              <td style="padding: 10px; text-align: right; color: #8b5cf6; font-weight: bold;">${doneChecklistCount} lượt</td>
            </tr>
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: bold;">⚖️ Cân nặng cập nhật mới nhất</td>
              <td style="padding: 10px; text-align: right; color: #f97316; font-weight: bold;">${currentWeight.toFixed(1)} kg</td>
            </tr>
          </tbody>
        </table>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
          Mở ứng dụng <a href="${process.env.SYNC_TARGET_URL || 'http://localhost:3456'}" style="color: #10b981; text-decoration: none; font-weight: bold;">NutriTrack Pro Dashboard</a> để tiếp tục duy trì kỷ luật cho tuần mới!
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
    subject: `[NutriTrack] Báo cáo tổng kết tuần & Định hướng sức khỏe tuần mới`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi báo cáo tổng kết TUẦN thành công tới ${toEmail}. MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[Email] Lỗi gửi báo cáo tổng kết TUẦN tới ${toEmail}:`, error.message);
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

  // Weekly summary EVERY SUNDAY AT 20:00 (8:00 PM)
  cron.schedule('0 20 * * 0', () => {
    console.log('[Scheduler] Bắt đầu tạo báo cáo tổng kết TUẦN (Tối Chủ Nhật)...');

    db.all('SELECT id, name, username, profile_type, target_weight, start_weight FROM users', [], async (err: Error | null, users: any[]) => {
      if (err || !users) return;
      for (const user of users) {
        db.all('SELECT * FROM logs WHERE user_id = ? AND timestamp >= ?', [user.id, Date.now() - 7 * 24 * 3600 * 1000], (errLogs: Error | null, logs: any[] = []) => {
          db.all('SELECT item_id, is_done FROM checklist_logs WHERE user_id = ? AND date >= date("now", "-7 days")', [user.id], (errCheck: Error | null, checkRows: any[] = []) => {
            db.get('SELECT weight FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1', [user.id], (errW: Error | null, wRow: any) => {
              const currentWeight = wRow ? wRow.weight : user.start_weight;
              const targetEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER || '';
              sendWeeklySummaryEmail(targetEmail, user, logs, checkRows, currentWeight);
            });
          });
        });
      }
    });
  });
}

export { sendReminderEmail, sendDailySummaryEmail };
