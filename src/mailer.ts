import nodemailer from 'nodemailer';
import cron from 'node-cron';
import dotenv from 'dotenv';
import db from './db.js';
import { ImapFlow } from 'imapflow';

dotenv.config();

// Helper to get transporter with active credentials
function getTransporter() {
  const user = process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com';
  const pass = process.env.GMAIL_PASS || '';

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
}

// ── ACTIVE REMINDERS ─────────────────────────────────────────────────────────
// Chỉ những event_id có trong danh sách này mới được gửi email nhắc nhở.
// Muốn tắt tạm: xóa id ra khỏi mảng.  Muốn bật lại: thêm id trở lại.
const ACTIVE_EVENT_IDS: string[] = [
  // 💧 Nước buổi SÁNG
  'water_07',        // 07:30 - Sau ăn sáng
  'water_09',        // 09:00 - Giữa ca sáng
  'water_10',        // 10:30 - Trước nghỉ trưa
  // 🥗 Bữa phụ SÁNG
  'snack_morning',   // 09:30 - Bữa phụ sáng
  // 💧 Nước buổi CHIỀU
  'water_13',        // 13:00 - Sau bữa trưa
  'water_14',        // 14:00 / 14:30 - Đầu ca chiều
  'water_16',        // 16:00 / 16:30 - Cuối ca chiều
  // 🥗 Bữa phụ CHIỀU
  'snack_afternoon', // 15:30 - Bữa phụ chiều
];
// ─────────────────────────────────────────────────────────────────────────────

// Define meal and training schedules for both profiles
export const SCHEDULES: Record<string, Array<{ id: string; time: string; name: string; type: string; desc: string }>> = {
  tang_can: [
    // ── SÁNG SỚM ──
    { id: 'pre_morning',   time: '06:00', name: 'Thức dậy & Uống nước ấm 🥛',              type: 'water', desc: 'Uống 300ml nước ấm từng ngụm nhỏ — khởi động hệ tiêu hóa & bù nước sau giấc ngủ dài.' },
    { id: 'breakfast',     time: '06:30', name: 'Ăn sáng chính + Sữa Vinamilk 🍜',         type: 'eat',   desc: 'Phở / bún bò / bánh mì + 1 bịch Sữa tươi Vinamilk Nguyên chất (220ml).' },
    { id: 'water_07',      time: '07:30', name: 'Uống nước sau ăn sáng 💧',                 type: 'water', desc: 'Uống 200ml nước lọc từng ngụm — hỗ trợ tiêu hóa bữa sáng, cơ thể bắt đầu hoạt động.' },
    // ── CA LÀM VIỆC SÁNG ──
    { id: 'water_09',      time: '09:00', name: 'Uống nước giữa ca sáng 💧',                type: 'water', desc: 'Uống 200ml nước lọc — duy trì độ tỉnh táo, tránh mất nước giữa giờ làm việc.' },
    { id: 'snack_morning', time: '09:30', name: 'Bữa phụ sáng tại công ty 🥗',              type: 'eat',   desc: 'Sữa chua hạt / trái cây / trứng luộc để duy trì năng lượng.' },
    { id: 'water_10',      time: '10:30', name: 'Uống nước trước nghỉ trưa 💧',             type: 'water', desc: 'Uống 200ml nước lọc — chuẩn bị cho ca hoạt động trưa, không để cơ thể thiếu nước trước bữa ăn.' },
    // ── TRƯA ──
    { id: 'lunch',         time: '11:45', name: 'Ăn trưa chính 🍚',                         type: 'eat',   desc: '2 chén cơm đầy + đạm nạc (cá/thịt/gà/trứng) + rau xanh + 1 chén canh.' },
    { id: 'rest_noon',     time: '12:30', name: 'Nghỉ trưa phục hồi 😴',                   type: 'workout', desc: 'Chợp mắt 20–30 phút giúp lấy lại sức làm việc ca chiều 13h30-17h.' },
    { id: 'water_13',      time: '13:00', name: 'Uống nước sau bữa trưa 💧',                type: 'water', desc: 'Uống 200ml nước lọc — hỗ trợ tiêu hóa bữa trưa, bổ sung nước trước ca chiều dài.' },
    // ── CA LÀM VIỆC CHIỀU ──
    { id: 'water_14',      time: '14:00', name: 'Uống nước đầu ca chiều 💧',                type: 'water', desc: 'Uống 200ml nước lọc — khởi động ca làm việc chiều 13h30-17h, duy trì sự tập trung.' },
    { id: 'snack_afternoon', time: '15:30', name: 'Bữa phụ chiều + Sữa Vinamilk 🍌',       type: 'eat',   desc: '1 bịch Sữa tươi Vinamilk Nguyên chất (220ml) + chuối luộc / bắp luộc.' },
    { id: 'water_16',      time: '16:00', name: 'Uống nước cuối ca chiều 💧',               type: 'water', desc: 'Uống 200ml nước lọc — kết thúc ca làm việc, chuẩn bị cơ thể trước ca thể thao 17h.' },
    { id: 'pre_sport',     time: '16:30', name: 'Ăn nhẹ trước chơi thể thao 🥖',           type: 'eat',   desc: '1 lát bánh mì / 1 quả trứng luộc để nạp năng lượng nhanh.' },
    // ── CA THỂ THAO (3 mốc nước mới — quan trọng nhất) ──
    { id: 'sport_evening', time: '17:00', name: '🏓 Ca thể thao Bóng bàn / Pickleball',    type: 'workout', desc: 'Chơi thể thao 17h00-19h00. Uống nước theo nhắc nhở lúc 17h15, 18h00, 18h45.' },
    { id: 'water_sport1',  time: '17:15', name: 'Uống nước trong thể thao (lần 1) 🚰',     type: 'water', desc: 'Uống 200ml nước lọc hoặc điện giải loãng — từng ngụm nhỏ, không uống ồ ạt khi đang vận động.' },
    { id: 'water_sport2',  time: '18:00', name: 'Uống nước trong thể thao (lần 2) 🚰',     type: 'water', desc: 'Uống 200ml nước lọc hoặc điện giải — giữa buổi tập là lúc mất nước nhiều nhất qua mồ hôi.' },
    { id: 'water_sport3',  time: '18:45', name: 'Uống nước sau thể thao 🚰',               type: 'water', desc: 'Uống 200ml nước lọc sau khi kết thúc ca tập — bù ngay lượng nước mất, hỗ trợ phục hồi cơ bắp.' },
    // ── TỐI ──
    { id: 'dinner',        time: '19:30', name: 'Ăn tối chính 🌙',                          type: 'eat',   desc: 'Cơm (2 chén nếu chơi thể thao) + cá/gà + rau xanh + canh xương.' },
    { id: 'water_night',   time: '21:00', name: 'Uống nước buổi tối 💧',                    type: 'water', desc: 'Uống 200ml nước lọc từng ngụm nhỏ — lần cuối trong ngày, không uống quá nhiều gần giờ ngủ.' },
    { id: 'pre_sleep',     time: '22:00', name: 'Sữa tươi Vinamilk trước ngủ 🥛',          type: 'eat',   desc: '1 bịch Sữa tươi Vinamilk Nguyên chất (220ml) ấm giúp phục hồi cơ bắp & dễ ngủ.' },
    { id: 'sleep',         time: '22:30', name: 'Đi ngủ phục hồi 💤',                      type: 'workout', desc: 'Tắt thiết bị điện tử, ngủ đủ 7–8 tiếng để kích hoạt hormone tăng cân tăng cơ.' }
  ],
  giam_can: [
    { id: 'wake_up',         time: '05:00', name: 'Thức dậy & Uống nước ấm 💧',          type: 'water', desc: 'Uống 300ml nước ấm từng ngụm nhỏ — thải độc tố, khởi động trao đổi chất, hỗ trợ đốt mỡ sáng sớm.' },
    { id: 'breakfast',       time: '06:30', name: 'Ăn sáng lành mạnh 🥣',               type: 'eat',   desc: 'Yến mạch trái cây hoặc 2 quả trứng luộc + khoai lang nhỏ. Hạn chế tinh bột nhanh.' },
    { id: 'water_07',        time: '07:30', name: 'Uống nước sau ăn sáng 💧',            type: 'water', desc: 'Uống 200ml nước lọc — hỗ trợ tiêu hóa, tăng cảm giác no, giảm lượng ăn vặt buổi sáng.' },
    { id: 'water_09',        time: '09:00', name: 'Uống nước giữa ca sáng 💧',           type: 'water', desc: 'Uống 200ml nước lọc — uống nước thay vì ăn vặt khi đói giả, hỗ trợ giảm cân hiệu quả.' },
    { id: 'snack_morning',   time: '09:30', name: 'Bữa phụ sáng nhẹ 🍏',               type: 'eat',   desc: '1 quả táo xanh hoặc 1 hũ sữa chua không đường để giảm cảm giác thèm ăn.' },
    { id: 'water_10',        time: '10:30', name: 'Uống nước trước nghỉ trưa 💧',        type: 'water', desc: 'Uống 200ml nước lọc — uống trước bữa trưa 30 phút giúp giảm lượng cơm ăn tự nhiên.' },
    { id: 'lunch',           time: '12:00', name: 'Ăn trưa kiểm soát calo 🥗',          type: 'eat',   desc: '1 chén cơm nhỏ + ức gà áp chảo / cá hấp + thật nhiều rau luộc/salad ít sốt.' },
    { id: 'water_13',        time: '13:00', name: 'Uống nước sau bữa trưa 💧',           type: 'water', desc: 'Uống 200ml nước lọc — hỗ trợ tiêu hóa, giảm cảm giác buồn ngủ sau ăn trưa.' },
    { id: 'water_14',        time: '14:30', name: 'Uống nước giữa ca chiều 💧',          type: 'water', desc: 'Uống 200ml nước lọc — tránh nhầm khát với đói, ngăn ăn vặt không cần thiết buổi chiều.' },
    { id: 'snack_afternoon', time: '15:30', name: 'Bữa phụ chiều ít calo 🥜',           type: 'eat',   desc: 'Ổi hoặc 5-7 hạt hạnh nhân. Giữ lượng calo phụ dưới 100 kcal.' },
    { id: 'water_16',        time: '16:30', name: 'Uống nước trước tập 💧',              type: 'water', desc: 'Uống 200ml nước lọc — nạp nước trước buổi cardio, tránh chuột rút và tối ưu đốt mỡ.' },
    { id: 'cardio',          time: '17:30', name: '🔥 Cardio / Đốt mỡ (Chạy bộ, Pickleball)', type: 'workout', desc: 'Buổi tập tối thiểu 45 phút để kích hoạt chế độ đốt mỡ tự nhiên.' },
    { id: 'water_sport1',    time: '17:45', name: 'Uống nước trong tập (lần 1) 🚰',     type: 'water', desc: 'Uống 150–200ml nước lọc từng ngụm nhỏ — bù nước khi mồ hôi ra nhiều trong lúc cardio.' },
    { id: 'water_sport2',    time: '18:15', name: 'Uống nước trong tập (lần 2) 🚰',     type: 'water', desc: 'Uống 150–200ml nước lọc — giữa buổi tập là thời điểm mất nước cao nhất, uống đủ để duy trì hiệu suất.' },
    { id: 'dinner',          time: '18:45', name: 'Ăn tối low-carb 🥗',                 type: 'eat',   desc: 'Nhiều rau xanh, đạm nạc (cá/ức gà), hạn chế tinh bột cơm sau 19h.' },
    { id: 'water_20',        time: '20:00', name: 'Uống nước buổi tối 💧',              type: 'water', desc: 'Uống 200ml nước lọc — bù nước sau buổi tập, không uống quá nhiều gần giờ ngủ để tránh phù.' },
    { id: 'sleep_prep',      time: '22:30', name: 'Chuẩn bị ngủ phục hồi 💤',          type: 'workout', desc: 'Ngủ đủ 7-8 tiếng. Đốt mỡ tự nhiên hiệu quả nhất khi ngủ sâu trước 23h.' }
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

export async function sendTestEmail(targetEmail?: string) {
  const recipient = targetEmail || process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com';
  const transporter = getTransporter();
  const mailOptions = {
    from: `"NutriTrack Pro" <${process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com'}>`,
    to: recipient,
    subject: `[NutriTrack Pro] Email thử nghiệm kết nối thành công 🔔`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #10b981; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background-color: #10b981; padding: 24px; text-align: center; color: white;">
          <span style="font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">NutriTrack Pro</span>
          <h2 style="margin: 10px 0 0 0; font-size: 22px;">✅ Kết Nối Email Thành Công!</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
          <p>Xin chào <strong>Nguyễn Tuân</strong>,</p>
          <p>Đây là email thử nghiệm kiểm tra tính năng gửi thông báo tự động từ <strong>NutriTrack Pro</strong> tới hòm thư <code>${recipient}</code>.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">Hệ thống thông báo NutriTrack Pro sẵn sàng gửi tin nhắn!</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #15803d;">Bạn sẽ nhận được email nhắc nhở lịch ăn uống, lịch uống nước và lịch chơi thể thao Pickleball đúng giờ theo cài đặt.</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            Thời gian kiểm tra: ${new Date().toLocaleString('vi-VN')}
          </p>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          © 2026 NTM Systems & Automation. All rights reserved.
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Test] Đã gửi email thử nghiệm thành công tới ${recipient}. MessageId: ${info.messageId}`);
  return info;
}

export async function sendReminderEmail(toEmail: string, userName: string, eventName: string, type: string, details: string, scheduledTime: string) {
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
    from: `"NutriTrack Pro" <${process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com'}>`,
    to: toEmail,
    subject: `[NutriTrack] Nhắc lịch: ${eventName} (${scheduledTime})`,
    html
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi thành công tới ${toEmail} cho sự kiện ${eventName}. MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[Email] Lỗi gửi email tới ${toEmail}:`, error.message);
  }
}

export async function sendWeeklySummaryEmail(toEmail: string, user: any, past7DaysLogs: any[], past7DaysChecklist: any[], currentWeight: number) {
  const isGain = user.profile_type === 'tang_can';
  
  const totalWater = past7DaysLogs.reduce((sum: number, l: any) => sum + (l.water || 0), 0);
  const avgWaterPerDay = Math.round(totalWater / 7);
  const totalMeals = past7DaysLogs.filter((l: any) => l.meal_type !== 'water').length;
  const doneChecklistCount = past7DaysChecklist.filter((c: any) => c.is_done).length;

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
    from: `"NutriTrack Pro" <${process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com'}>`,
    to: toEmail,
    subject: `[NutriTrack] Báo cáo tổng kết tuần & Định hướng sức khỏe tuần mới`,
    html
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi báo cáo tổng kết TUẦN thành công tới ${toEmail}. MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[Email] Lỗi gửi báo cáo tổng kết TUẦN tới ${toEmail}:`, error.message);
  }
}

export async function checkAndSendReminders(isCatchup: boolean = false, catchupWindowMinutes: number = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const currentHHMM = `${h}:${m}`;

  return new Promise<{ checked: number; sent: number; eventsSent: string[] }>((resolve) => {
    db.all(`
      SELECT u.id, u.username, u.name, u.profile_type, s.reminder_enabled, s.water_reminder_enabled, s.reminder_advance, s.active_schedule_id, s.active_event_ids_json
      FROM users u
      JOIN app_settings s ON u.id = s.user_id
      WHERE s.reminder_enabled = 1
    `, [], async (err: Error | null, users: any[]) => {
      if (err || !users || users.length === 0) {
        if (err) console.error('[Scheduler] Lỗi truy vấn DB:', err);
        return resolve({ checked: 0, sent: 0, eventsSent: [] });
      }

      let sentCount = 0;
      const eventsSent: string[] = [];

      for (const user of users) {
        let schedule: Array<{ id: string; time: string; name: string; type: string; desc: string }> = [];

        // Check if custom active schedule is configured
        if (user.active_schedule_id) {
          try {
            const row: any = await new Promise((res) => db.get("SELECT meal_schedule_json FROM custom_schedules WHERE id = ?", [user.active_schedule_id], (_e, r) => res(r)));
            if (row && row.meal_schedule_json) {
              const customMeals = JSON.parse(row.meal_schedule_json);
              schedule = customMeals.map((m: any) => ({
                id: m.id || m.name,
                time: m.time,
                name: m.name,
                type: m.category === 'workout' ? 'workout' : (m.name.includes('nước') ? 'water' : 'eat'),
                desc: m.activity || m.goal || m.name
              }));
            }
          } catch (e) {
            console.error('[Scheduler] Lỗi đọc custom schedule:', e);
          }
        }

        if (schedule.length === 0) {
          schedule = SCHEDULES[user.profile_type] || SCHEDULES['tang_can'];
        }

        const advance = user.reminder_advance ?? 5;

        // Load per-user active event list (from DB), fallback to global default
        let userActiveIds: string[] = ACTIVE_EVENT_IDS;
        if (user.active_event_ids_json) {
          try { userActiveIds = JSON.parse(user.active_event_ids_json); } catch {}
        }

        for (const event of schedule) {
          // Skip events not in the active list (người dùng tắt trên app)
          if (!userActiveIds.includes(event.id)) {
            continue;
          }
          // Skip water reminder if water_reminder_enabled is turned off
          if (event.type === 'water' && user.water_reminder_enabled === 0) {
            continue;
          }

          const notifyTime = subtractMinutes(event.time, advance);

          // Catch-up có window: chỉ gửi trong N phút gần nhất (tránh gửi cả ngày)
          let catchupFrom = '00:00';
          if (isCatchup && catchupWindowMinutes > 0) {
            catchupFrom = subtractMinutes(currentHHMM, catchupWindowMinutes);
          }
          const shouldSend = isCatchup
            ? (notifyTime <= currentHHMM && (catchupWindowMinutes === 0 || notifyTime >= catchupFrom))
            : notifyTime === currentHHMM;

          if (shouldSend) {
            // Check if already sent today
            const alreadySent: any = await new Promise((res) => {
              db.get(
                "SELECT id FROM sent_reminders_log WHERE user_id = ? AND date = ? AND event_id = ?",
                [user.id, todayStr, event.id],
                (_e, r) => res(r)
              );
            });

            if (!alreadySent) {
              const targetEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com';
              console.log(`[Scheduler] Gửi nhắc nhở (${isCatchup ? 'Catch-up' : 'Live'}): ${event.name} lúc ${event.time} tới ${targetEmail}`);

              try {
                await sendReminderEmail(targetEmail, user.name, event.name, event.type, event.desc, event.time);
                db.run(
                  "INSERT OR IGNORE INTO sent_reminders_log (user_id, date, event_id) VALUES (?, ?, ?)",
                  [user.id, todayStr, event.id]
                );
                sentCount++;
                eventsSent.push(`${event.name} (${event.time})`);
                // Delay nhỏ giữa các email khi catch-up — giải phóng event loop
                if (isCatchup) await new Promise(r => setTimeout(r, 800));
              } catch (err: any) {
                console.error(`[Scheduler] Lỗi khi gửi email event ${event.name}:`, err);
              }
            }
          }
        }
      }

      resolve({ checked: users.length, sent: sentCount, eventsSent });
    });
  });
}

// ──────────────────────────────────────────────────────────────────
// AUTO-DELETE: Xóa email NutriTrack khỏi Inbox sau 1 phút
// Kết nối qua IMAP (dùng lại App Password) — không cần OAuth mới
// ──────────────────────────────────────────────────────────────────
export async function deleteExpiredNutritrackEmails() {
  const user = process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com';
  const pass = process.env.GMAIL_PASS || '';

  if (!pass) {
    console.warn('[AutoDelete] GMAIL_PASS chưa được cấu hình, bỏ qua auto-delete.');
    return;
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false   // tắt log IMAP verbose
  });

  try {
    await client.connect();

    // Tìm trong INBOX
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Email NutriTrack gửi trước (now - 1 phút)
      const cutoffDate = new Date(Date.now() - 1 * 60 * 1000);

      const uids = await client.search({
        from: user,               // gửi từ chính mình
        subject: '[NutriTrack]', // subject chứa [NutriTrack]
        before: cutoffDate        // nhận trước thời điểm cutoff
      }, { uid: true });

      if (uids && Array.isArray(uids) && uids.length > 0) {
        // Chuyển vào Trash (xóa mềm)
        await client.messageMove(uids as number[], '[Gmail]/Trash', { uid: true });
        console.log(`[AutoDelete] Đã dọn ${uids.length} email NutriTrack cũ hơn 1 phút vào Thùng rác.`);
      } else {
        console.log('[AutoDelete] Không có email NutriTrack nào cần xóa.');
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err: any) {
    // Không crash server nếu IMAP lỗi (mạng, sai pass, v.v.)
    console.error('[AutoDelete] Lỗi kết nối IMAP:', err.message);
  }
}

// ── Mutex flags — ngăn cron chạy chồng lên nhau ──
let reminderRunning = false;
let autoDeleteRunning = false;

export function initScheduler() {
  console.log('[Scheduler] Đã kích hoạt hệ thống kiểm tra và gửi nhắc nhở qua Gmail');

  // Boot catch-up: chỉ gửi những event trong 30 phút gần nhất bị bỏ lỡ
  // (tránh gửi ồ ạt cả ngày khi restart giữa chừng)
  setTimeout(async () => {
    if (reminderRunning) return;
    reminderRunning = true;
    console.log('[Scheduler] Đang kiểm tra & gửi bù thông báo đã bỏ lỡ (30 phút gần nhất)...');
    try {
      await checkAndSendReminders(true, 30);
    } finally {
      reminderRunning = false;
    }
  }, 3000);

  // Live check mỗi phút — có mutex, bỏ qua nếu lần trước chưa xong
  cron.schedule('* * * * *', async () => {
    if (reminderRunning) return;
    reminderRunning = true;
    try {
      await checkAndSendReminders(false);
    } finally {
      reminderRunning = false;
    }
  });

  // Catch-up mỗi 30 phút — chỉ nhìn lại 35 phút để không bỏ sót
  cron.schedule('*/30 * * * *', async () => {
    if (reminderRunning) return;
    reminderRunning = true;
    try {
      await checkAndSendReminders(true, 35);
    } finally {
      reminderRunning = false;
    }
  });

  // Auto-delete IMAP — mutex riêng, chạy mỗi 10 phút (giảm từ 5)
  cron.schedule('*/10 * * * *', async () => {
    if (autoDeleteRunning) return;
    autoDeleteRunning = true;
    try {
      await deleteExpiredNutritrackEmails();
    } finally {
      autoDeleteRunning = false;
    }
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
              const targetEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER || 'nguyentuanqnpc@gmail.com';
              sendWeeklySummaryEmail(targetEmail, user, logs, checkRows, currentWeight);
            });
          });
        });
      }
    });
  });
}
