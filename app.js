/* =====================================================
   NutriTrack Pro — app.js v2.0
   Cập nhật: bug fixes, settings, statistics, protein,
   streak, light mode, ICS export, SW notifications,
   offline indicator, PWA install prompt, XSS safe
   ===================================================== */

'use strict';

// ==================== UTILS ====================
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return labels[d.getDay()];
}

// ==================== DATA CONSTANTS ====================

// Mutable — loaded from/saved to localStorage
let PROFILE = {
  name: 'Nguyễn Tuân',
  height: 175,
  startWeight: 71.0,
  targetWeight: 78.0,
  startDate: '2026-06-07',
  glucose: 5.6
};

const MEAL_SCHEDULE = [
  { id: 'pre_morning', time: '04:30', displayTime: '4h30', name: 'Ăn nhẹ trước dạy sáng', icon: '🌅', activity: 'Trước khi dạy Pickleball sáng (thứ 2–6)', goal: 'Có năng lượng nhẹ, không nặng bụng', category: 'morning', options: ['1 quả chuối nhỏ', '1 lát bánh mì nhỏ hoặc ½ ổ nhỏ', '½ củ khoai lang nhỏ', '1 ly nhỏ sữa tươi không đường', '300–500ml nước lọc'] },
  { id: 'pickleball_morning', time: '05:00', displayTime: '5h–6h15', name: 'Dạy Pickleball sáng', icon: '🏸', activity: 'Dạy Pickleball 5h–6h15 (thứ 2–6)', goal: 'Duy trì nước và năng lượng cho buổi sáng', category: 'morning', options: ['Nước lọc từng ngụm nhỏ', 'Điện giải loãng nếu trời nóng/mồ hôi nhiều'] },
  { id: 'breakfast', time: '06:15', displayTime: '6h15–6h45', name: 'Ăn sáng chính', icon: '🍜', activity: 'Bữa sáng chính', goal: 'Bù năng lượng sau dạy sáng, nền cho cả ngày', category: 'morning', options: ['Phở/bún bò/bún chả cá/mì quảng có thịt hoặc trứng + sữa', 'Bánh mì thịt hoặc bánh mì trứng + sữa', '1–1.5 chén cơm + cá/thịt/trứng + canh + sữa', 'Bánh mì + 2 trứng luộc + sữa (khi bận)'] },
  { id: 'work_morning', time: '07:00', displayTime: '7h–9h', name: 'Làm việc', icon: '💼', activity: 'Làm việc hành chính 7h–11h30 (thứ 2–6)', goal: 'Giữ tỉnh táo, không dùng đường ngọt trong ca làm việc', category: 'morning', options: ['Nước lọc đều đặn', 'Không uống cà phê sữa quá ngọt'] },
  { id: 'snack_morning', time: '09:30', displayTime: '9h30', name: 'Bữa phụ tại cơ quan', icon: '🥛', activity: 'Bữa phụ sáng', goal: 'Tránh tụt năng lượng, hỗ trợ tăng cân', category: 'morning', options: ['Sữa chua không đường + trái cây', 'Sữa tươi không đường + đậu phộng/hạt điều/hạnh nhân', 'Trái cây + 1 quả trứng luộc', 'Bánh mì nhỏ + sữa không đường', 'Bắp luộc hoặc khoai lang'] },
  { id: 'pre_noon', time: '10:45', displayTime: '10h45–11h', name: 'Lót năng lượng trước dạy trưa', icon: '⚡', activity: 'Lót năng lượng trước dạy Pickleball trưa (thứ 2–6)', goal: 'Không để cơ thể rỗng năng lượng trước ca dạy trưa', category: 'noon', options: ['1 quả chuối', '1 khúc bắp luộc', '1 lát bánh mì', '1 hộp sữa tươi không đường', '1 củ khoai nhỏ'] },
  { id: 'pickleball_noon', time: '11:30', displayTime: '11h30–12h30', name: 'Dạy Pickleball trưa', icon: '🏸', activity: 'Dạy Pickleball 11h30–12h30 (thứ 2–6)', goal: 'Bù nước và năng lượng trong giờ dạy trưa', category: 'noon', options: ['Nước lọc thường xuyên', 'Điện giải loãng nếu nắng nóng, mồ hôi nhiều'] },
  { id: 'lunch', time: '12:30', displayTime: '12h30–13h', name: 'Ăn trưa chính', icon: '🍚', activity: 'Ăn trưa chính sau ca dạy (thứ 2–6)', goal: '2 chén cơm + đạm + rau + canh để phục hồi', category: 'noon', options: ['2 chén cơm', 'Đạm: Cá kho/hấp, gà, thịt heo nạc, bò, tôm, mực, trứng, đậu phụ', 'Rau luộc, rau xào ít dầu, salad', '1 chén canh (canh rau/cá/thịt/xương)', 'Tráng miệng nhỏ: ổi, đu đủ, thanh long, táo'] },
  { id: 'rest', time: '13:00', displayTime: '13h–13h30', name: 'Nghỉ phục hồi', icon: '😴', activity: 'Nghỉ trưa rồi đi làm ở công ty 13h30–17h (thứ 2–6)', goal: 'Giảm mệt và chuẩn bị cho ca làm việc chiều', category: 'noon', options: ['Chợp mắt 15–20 phút nếu được', 'Rất quan trọng nếu ngủ đêm ít'] },
  { id: 'snack_afternoon', time: '15:30', displayTime: '15h30–16h', name: 'Bữa phụ chiều', icon: '🍌', activity: 'Bữa phụ chiều trong ca làm việc ở công ty (thứ 2–6)', goal: 'Giữ năng lượng khi làm việc từ 13h30–17h', category: 'afternoon', options: ['Sữa tươi không đường + chuối (ưu tiên)', 'Sữa tươi không đường + bắp luộc', 'Sữa chua không đường + trái cây', 'Bánh bao / bánh bèo / bún riêu / bánh bột lọc: 1 phần + thêm 1 trứng hoặc 100g tôm/gà/đậu phụ', 'Vịt gỏi trộn: 1 phần + thêm 1 trứng luộc hoặc 1 hộp đậu phụ + 1 ly sữa'] },
  { id: 'extra_sport', time: '16:30', displayTime: '16h30', name: 'Ăn thêm nếu chơi đến 20h', icon: '🥖', activity: 'Sau ca công ty, trước khi chơi 17h–19h30 (thứ 2–6)', goal: 'Tăng năng lượng trước buổi vận động kéo dài', category: 'afternoon', optional: true, options: ['1 lát bánh mì hoặc ½ ổ nhỏ', '1 củ khoai nhỏ', '1 quả trứng luộc', '1 khúc bắp', '1 phần cơm nắm nhỏ'] },
  { id: 'sport_evening', time: '17:00', displayTime: '17h–20h', name: 'Bóng bàn / Social Pickleball', icon: '🏓', activity: 'Chơi bóng bàn / Pickleball 17h–19h30 (thứ 2–6)', goal: 'Duy trì nước, điện giải và năng lượng khi chơi sau công ty', category: 'afternoon', optional: true, options: ['Dưới 60 phút: nước lọc là đủ', '90–180 phút: nước lọc + điện giải loãng', 'Hụt sức: 1 quả chuối hoặc 1 lát bánh mì nhỏ'] },
  { id: 'dinner', time: '20:15', displayTime: '20h15–20h45', name: 'Ăn tối chính', icon: '🌙', activity: 'Ăn tối sau buổi làm việc và thể thao (thứ 2–6)', goal: 'Có chơi 17h–19h30: 2 chén cơm | Không chơi: 1.5 chén', category: 'evening', options: ['Cơm + cá + rau + canh (ưu tiên thường xuyên)', 'Cơm + gà + rau (tốt sau vận động)', 'Cơm + thịt bò + canh (1–2 bữa/tuần)', 'Cơm + đậu phụ + cá (nhẹ bụng)', 'Bún/phở/mì quảng nếu không muốn ăn cơm'] },
  { id: 'work_evening', time: '21:00', displayTime: '21h–22h30', name: 'Làm việc tối', icon: '💻', activity: 'Làm việc tối', goal: 'Không kích thích thần kinh quá mức', category: 'evening', options: ['Nước lọc', 'Tránh cà phê/trà đặc sau chiều'] },
  { id: 'pre_sleep', time: '22:00', displayTime: '22h–22h30', name: 'Trước khi ngủ (nếu đói)', icon: '🌛', activity: 'Bữa phụ trước ngủ', goal: 'Bổ sung nhẹ, không tăng đường nhanh', category: 'evening', options: ['1 ly sữa tươi không đường ấm (dễ ngủ hơn)', 'Sữa tươi không đường + 1 quả trứng luộc', '1 hũ sữa chua không đường', 'Sữa + ½ củ khoai (hôm vận động rất nặng)'] },
  { id: 'sleep', time: '22:30', displayTime: '22h30–23h', name: 'Ngủ', icon: '💤', activity: 'Ngủ phục hồi', goal: 'Cố định giờ ngủ', category: 'evening', options: ['Càng ngủ đều càng dễ tăng cân sạch', 'Mục tiêu: 7–8 tiếng'] }
];

const CHECKLIST_ITEMS = [
  { id: 'c1',  text: 'Ăn nhẹ trước dạy sáng (4h30)',               time: '4h30',    icon: '🌅' },
  { id: 'c2',  text: 'Ăn sáng có tinh bột + đạm (6h15)',            time: '6h15',    icon: '🍜' },
  { id: 'c3',  text: 'Uống ít nhất 2 bịch sữa/sữa chua trong ngày', time: 'Cả ngày', icon: '🥛' },
  { id: 'c4',  text: 'Ăn bữa phụ 9h30',                             time: '9h30',    icon: '🥗' },
  { id: 'c5',  text: 'Ăn nhẹ trước dạy trưa (10h45)',               time: '10h45',   icon: '⚡' },
  { id: 'c6',  text: 'Ăn trưa đủ 2 chén cơm + đạm + rau + canh',   time: '12h45',   icon: '🍚' },
  { id: 'c7',  text: 'Nghỉ trưa 15–20 phút',                        time: '13h20',   icon: '😴' },
  { id: 'c8',  text: 'Ăn bữa phụ chiều (15h30)',                    time: '15h30',   icon: '🍌' },
  { id: 'c9',  text: 'Nếu chơi đến 20h: Ăn thêm lúc 16h30',        time: '16h30',   icon: '🥖' },
  { id: 'c10', text: 'Ăn tối đủ đạm, không bỏ cơm (20h15)',         time: '20h15',   icon: '🌙' },
  { id: 'c11', text: 'Uống đủ nước (2–3 lít)',                       time: 'Cả ngày', icon: '💧' },
  { id: 'c12', text: 'Không dùng sữa đặc / nước ngọt / trà sữa',    time: 'Cả ngày', icon: '🚫' }
];

const RULES = [
  { icon: '⏰', title: 'Giữ khung giờ cố định', text: 'Ăn đúng các mốc trong ngày để không bị rỗng năng lượng. Cơ thể quen giờ ăn sẽ hấp thu tốt hơn.' },
  { icon: '🔄', title: 'Món ăn xoay vòng', text: 'Không ăn mãi trứng, bánh mì, khoai lang. Dùng nhiều nguồn tinh bột và đạm khác nhau để đủ chất và không ngán.' },
  { icon: '🚫', title: 'Không tăng cân bằng đường ngọt', text: 'Tránh sữa đặc, nước ngọt, trà sữa, bánh ngọt. Đường sẽ tăng glucose và tích mỡ bụng, không tốt.' },
  { icon: '🍚', title: 'Tăng cân bằng thực phẩm thật', text: 'Cơm, bún, phở, mì quảng, cá, thịt, gà, trứng, đậu phụ, sữa không đường — đây là nền tảng.' },
  { icon: '🍽️', title: 'Ưu tiên bữa trưa và tối', text: 'Đây là 2 bữa phục hồi chính sau vận động và làm việc. Không thay bằng trái cây hay sữa.' },
  { icon: '🥗', title: 'Bữa phụ là bắt buộc', text: 'Vì bạn vận động nhiều, không nên để khoảng cách giữa các bữa quá dài. Bữa phụ giúp duy trì năng lượng.' },
  { icon: '🥚', title: 'Ưu tiên protein mỗi bữa', text: 'Nếu ăn bánh bao, bánh bèo, bún riêu, hãy kèm thêm trứng, tôm, gà, đậu phụ hoặc sữa để đạt đủ đạm cho thể thao.' },
  { icon: '💪', title: 'Mục tiêu protein cho vận động', text: 'Mỗi ngày nên ưu tiên khoảng 1.6–2.2 g protein/kg cân nặng, chia đều vào bữa sáng, trưa, chiều và tối.' },
  { icon: '📊', title: 'Theo dõi glucose', text: 'Nếu glucose tăng, giảm đồ ngọt và tinh chỉnh tinh bột buổi tối. Không cắt bỏ hoàn toàn tinh bột.' },
  { icon: '😴', title: 'Ngủ đủ giấc', text: 'Càng ngủ đều càng dễ tăng cân sạch. Mục tiêu ngủ trước 23h và đủ 7–8 tiếng.' }
];

const ADJUST_RULES = [
  { condition: '⚖️ Cân không tăng', action: 'Thêm ½ chén cơm tối, 1 quả trứng hoặc 1 hộp sữa trong ngày, và giữ protein ở mỗi bữa' },
  { condition: '⚡ Chiều vẫn hụt sức', action: 'Thêm 1 lát bánh mì/khoai/bắp lúc 16h30, hoặc sữa + trứng + bắp/khoai để tăng năng lượng và protein' },
  { condition: '✅ Tăng 0.3–0.7kg/2 tuần', action: 'Giữ nguyên lịch, đang đúng hướng!' },
  { condition: '🤔 Cân tăng nhanh, bụng to', action: 'Giảm ½ chén cơm tối, giữ đạm và rau đầy đủ' },
  { condition: '📈 Glucose tăng', action: 'Bỏ hoàn toàn đồ ngọt, giảm tinh bột tối nhẹ, giữ bữa phụ sạch' },
  { condition: '😟 Mặt vẫn hốc', action: 'Tăng bữa phụ chiều hoặc thêm sữa + trứng trước ngủ' },
  { condition: '😴 Ngủ kém', action: 'Không dùng cà phê/trà đặc sau chiều, ăn tối không quá sát giờ ngủ' },
  { condition: '💪 Hay chuột rút/mệt', action: 'Tăng nước, dùng điện giải loãng khi dạy/chơi lâu' }
];

const GOOD_FOODS = [
  { icon: '🍚', name: 'Cơm, bún, phở, mì quảng, nui, miến' },
  { icon: '🥖', name: 'Bánh mì, khoai lang, bắp, cơm nắm' },
  { icon: '🐟', name: 'Cá, tôm, mực (ưu tiên 3–4 bữa/tuần)' },
  { icon: '🍗', name: 'Thịt gà, thịt heo nạc, thịt bò' },
  { icon: '🥚', name: 'Trứng (1–2 quả/ngày)' },
  { icon: '🥛', name: 'Sữa tươi không đường, sữa chua không đường' },
  { icon: '🌽', name: 'Đậu phụ, đậu hũ sốt cà' },
  { icon: '🍜', name: 'Bánh bao / bánh bèo / bún riêu / bánh bột lọc kèm đạm' },
  { icon: '🥗', name: 'Vịt gỏi trộn có thêm trứng hoặc đậu phụ để tăng protein' },
  { icon: '🍌', name: 'Chuối, ổi, táo, đu đủ, thanh long' },
  { icon: '🥜', name: 'Đậu phộng, hạt điều, hạnh nhân (lượng nhỏ)' }
];

const BAD_FOODS = [
  { icon: '🍯', name: 'Sữa đặc có đường' },
  { icon: '🥤', name: 'Nước ngọt, nước tăng lực' },
  { icon: '🧋', name: 'Trà sữa, cà phê sữa quá ngọt' },
  { icon: '🍰', name: 'Bánh ngọt, bánh quy ngọt' },
  { icon: '🍹', name: 'Nước ép trái cây nhiều (mất chất xơ)' },
  { icon: '☕', name: 'Cà phê/trà đặc sau chiều' }
];

const WATER_GUIDE = {
  heavy: { target: 2500, summary: 'Đủ nước: 2500ml/ngày ≈ 13 ly 200ml, 9 ly 300ml hoặc 5 ly 500ml', reminder: 'Nhắc uống nước mỗi 90 phút, 1 ly 200–300ml mỗi lần' },
  light:  { target: 2000, summary: 'Đủ nước: 2000ml/ngày ≈ 10 ly 200ml, 7 ly 300ml hoặc 4 ly 500ml', reminder: 'Nhắc uống nước mỗi 90 phút, 1 ly 200–300ml mỗi lần' }
};

// Sorted longest-first to prevent sub-string double-matching
const CALORIE_KEYWORDS = [
  { key: 'sữa chua', kcal: 100 },
  { key: 'đậu phụ', kcal: 90  },
  { key: 'bánh mì',  kcal: 180 },
  { key: 'đu đủ',    kcal: 70  },
  { key: 'thanh long', kcal: 60 },
  { key: 'khoai',    kcal: 130 },
  { key: 'miến',     kcal: 220 },
  { key: 'chuối',    kcal: 90  },
  { key: 'canh',     kcal: 35  },
  { key: 'phở',      kcal: 320 },
  { key: 'bún',      kcal: 250 },
  { key: 'nui',      kcal: 260 },
  { key: 'mì',       kcal: 300 },
  { key: 'cơm',      kcal: 180 },
  { key: 'cá',       kcal: 150 },
  { key: 'gà',       kcal: 180 },
  { key: 'thịt',     kcal: 200 },
  { key: 'trứng',    kcal: 70  },
  { key: 'sữa',      kcal: 120 },
  { key: 'bắp',      kcal: 120 },
  { key: 'rau',      kcal: 40  },
  { key: 'ổi',       kcal: 65  },
  { key: 'táo',      kcal: 55  },
  { key: 'tôm',      kcal: 100 },
  { key: 'bò',       kcal: 200 },
  { key: 'heo',      kcal: 190 }
];

const PROTEIN_KEYWORDS = [
  { key: 'sữa chua', protein: 5  },
  { key: 'đậu phụ', protein: 8  },
  { key: 'trứng',    protein: 6  },
  { key: 'sữa',      protein: 8  },
  { key: 'cá',       protein: 22 },
  { key: 'tôm',      protein: 18 },
  { key: 'gà',       protein: 25 },
  { key: 'thịt',     protein: 20 },
  { key: 'bò',       protein: 22 },
  { key: 'heo',      protein: 19 },
  { key: 'mực',      protein: 16 },
  { key: 'đậu phộng', protein: 7 },
  { key: 'hạnh nhân', protein: 5 },
  { key: 'hạt điều', protein: 5  }
];

// ==================== APP STATE ====================
let state = {
  currentTab: 'dashboard',
  dayType: 'heavy',
  today: new Date().toISOString().split('T')[0],
  water: 0,
  waterTarget: 2500,
  logs: [],
  weights: [],
  checklistData: {},
  reminderEnabled: true,
  waterReminderEnabled: true,
  reminderAdvance: 5,
  notificationPermission: 'default',
  reminderTimers: [],
  theme: 'dark',
  installPromptEvent: null,
  installDismissed: false
};

// ==================== LOCAL STORAGE ====================
function saveState() {
  const toSave = {
    dayType: state.dayType,
    water: state.water,
    waterTarget: state.waterTarget,
    logs: state.logs,
    weights: state.weights,
    checklistData: state.checklistData,
    reminderEnabled: state.reminderEnabled,
    waterReminderEnabled: state.waterReminderEnabled,
    reminderAdvance: state.reminderAdvance,
    notificationPermission: state.notificationPermission,
    theme: state.theme,
    installDismissed: state.installDismissed,
    lastReset: state.today
  };
  localStorage.setItem('nutritrack_state', JSON.stringify(toSave));
}

function loadState() {
  try {
    const raw = localStorage.getItem('nutritrack_state');
    if (!raw) return;
    const saved = JSON.parse(raw);

    state.today = new Date().toISOString().split('T')[0];

    // FIX: Reset water & day-specific data when a new day starts
    if (saved.lastReset !== state.today) {
      state.water = 0;
    } else {
      state.water = saved.water || 0;
    }

    state.checklistData = saved.checklistData || {};
    if (!state.checklistData[state.today]) state.checklistData[state.today] = {};

    state.logs    = saved.logs    || [];
    state.weights = saved.weights || [];
    state.dayType = saved.dayType || 'heavy';
    state.waterTarget = saved.waterTarget || (state.dayType === 'light' ? 2000 : 2500);
    state.reminderEnabled      = saved.reminderEnabled      !== undefined ? saved.reminderEnabled      : true;
    state.waterReminderEnabled = saved.waterReminderEnabled !== undefined ? saved.waterReminderEnabled : true;
    state.reminderAdvance      = saved.reminderAdvance || 5;
    state.notificationPermission = saved.notificationPermission || 'default';
    state.theme                = saved.theme || 'dark';
    state.installDismissed     = saved.installDismissed || false;
  } catch (e) {
    console.warn('Could not load state:', e);
  }
}

// ==================== PROFILE ====================
function saveProfile() {
  localStorage.setItem('nutritrack_profile', JSON.stringify(PROFILE));
}

function loadProfile() {
  try {
    const raw = localStorage.getItem('nutritrack_profile');
    if (raw) {
      const p = JSON.parse(raw);
      PROFILE = { ...PROFILE, ...p };
    }
  } catch (e) { /* keep defaults */ }
}

function applyProfile() {
  const initials = PROFILE.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl   = document.getElementById('sidebar-name');
  const goalEl   = document.getElementById('sidebar-goal');
  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl)   nameEl.textContent   = PROFILE.name;
  if (goalEl)   goalEl.textContent   = `Mục tiêu: ${PROFILE.targetWeight}kg`;

  const subtitleEl = document.getElementById('weight-subtitle');
  if (subtitleEl) subtitleEl.textContent = `${PROFILE.startWeight}kg → ${PROFILE.targetWeight}kg | Mục tiêu tăng sạch, kiểm soát`;

  const roadmapLabel = document.getElementById('roadmap-target-label');
  if (roadmapLabel) roadmapLabel.textContent = `${PROFILE.targetWeight}kg`;

  const proteinTarget = Math.round(PROFILE.startWeight * 1.8);
  const proteinLabelEl = document.getElementById('protein-progress-label');
  if (proteinLabelEl) proteinLabelEl.textContent = `Mục tiêu: ~${proteinTarget}g`;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadState();
  initTheme();
  initOfflineIndicator();
  initInstallPrompt();
  initDateDisplay();
  initNavigation();
  initHamburger();
  renderTimeline();
  renderScheduleGrid();
  renderChecklist();
  renderMealsGrid();
  renderRules();
  renderReminders();
  renderLog();
  renderWeightHistory();
  renderQuickSuggestions();
  renderStats();
  renderSettings();
  updateDashboardStats();
  updateWeightStats();
  setDefaultDates();
  startClockTick();
  scheduleReminders();
  if (state.dayType === 'light') setDayType('light', true);
  checkWaterReminders();
  applyProfile();
  updateNotificationPermissionUI();
});

// ==================== DATE / TIME ====================
function initDateDisplay() {
  const el = document.getElementById('today-date');
  const now = new Date();
  const days = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
  if (el) el.textContent = `${days[now.getDay()]}, ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
}

function setDefaultDates() {
  const today = state.today;
  const wd = document.getElementById('weight-date');
  if (wd) wd.value = today;
  const lf = document.getElementById('log-date-filter');
  if (lf) lf.value = today;
  const sd = document.getElementById('settings-start-date');
  if (sd && !sd.value) sd.value = PROFILE.startDate;
}

function startClockTick() {
  updateTimeline();
  setInterval(() => { updateTimeline(); updateNextMealBadge(); }, 60000);
  updateNextMealBadge();
}

// ==================== NAVIGATION ====================
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const nav = document.getElementById(`nav-${tabId}`);
  if (nav) nav.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`tab-${tabId}`);
  if (tab) tab.classList.add('active');

  if (tabId === 'weight') drawWeightChart();
  if (tabId === 'stats')  renderStats();
  if (tabId === 'settings') renderSettings();
}

// ==================== HAMBURGER / SIDEBAR ====================
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');
  if (hamburger) hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  if (s) s.classList.remove('open');
  if (o) o.classList.remove('open');
}

// ==================== THEME ====================
function initTheme() {
  applyTheme(state.theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn  = document.getElementById('theme-toggle-btn');
  const chk  = document.getElementById('theme-toggle-check');
  if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  if (chk) chk.checked = theme === 'dark';
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.theme);
  saveState();
}

function toggleThemeFromCheck(el) {
  state.theme = el.checked ? 'dark' : 'light';
  applyTheme(state.theme);
  saveState();
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = state.theme === 'dark' ? '🌙' : '☀️';
}

// ==================== OFFLINE INDICATOR ====================
function initOfflineIndicator() {
  function setOnline()  { document.getElementById('offline-bar')?.classList.remove('show'); document.body.classList.remove('offline'); }
  function setOffline() { document.getElementById('offline-bar')?.classList.add('show');    document.body.classList.add('offline'); }
  window.addEventListener('online',  setOnline);
  window.addEventListener('offline', setOffline);
  if (!navigator.onLine) setOffline();
}

// ==================== PWA INSTALL PROMPT ====================
function initInstallPrompt() {
  if (state.installDismissed) return;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    state.installPromptEvent = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('show');
  });
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.remove('show');
    state.installPromptEvent = null;
    showNotification('📲 Đã cài thành công', 'NutriTrack Pro đã được cài lên màn hình chính!', 'success');
  });
}

function doInstall() {
  if (!state.installPromptEvent) return;
  state.installPromptEvent.prompt();
  state.installPromptEvent.userChoice.then(r => {
    if (r.outcome === 'accepted') {
      document.getElementById('install-banner')?.classList.remove('show');
    }
    state.installPromptEvent = null;
  });
}

function dismissInstall() {
  document.getElementById('install-banner')?.classList.remove('show');
  state.installDismissed = true;
  saveState();
}

// ==================== DAY TYPE ====================
function setDayType(type, silent = false) {
  state.dayType = type;
  const heavy = document.getElementById('btn-heavy-day');
  const light = document.getElementById('btn-light-day');
  const guide = WATER_GUIDE[type];
  if (type === 'heavy') {
    heavy?.classList.add('active'); light?.classList.remove('active');
    document.getElementById('rice-progress-label').textContent = 'Mục tiêu: 4 chén';
  } else {
    light?.classList.add('active'); heavy?.classList.remove('active');
    document.getElementById('rice-progress-label').textContent = 'Mục tiêu: 3.5 chén';
  }
  state.waterTarget = guide.target;
  const guideText = document.getElementById('water-guide-text');
  if (guideText) guideText.textContent = `${guide.summary} • ${guide.reminder}`;
  if (!silent) {
    saveState();
    updateDashboardStats();
    showNotification('✅ Đã cập nhật', `Chế độ: ${type === 'heavy' ? 'Vận động nhiều' : 'Vận động nhẹ'}`, 'success');
  }
}

// ==================== WATER ====================
function addWater(ml) {
  state.water += ml;
  updateDashboardStats();
  saveState();
  showNotification('💧 Đã thêm nước', `+${ml}ml | Tổng: ${state.water}ml`, 'success');
}

// ==================== CALORIE & PROTEIN ESTIMATION ====================
function estimateCalories(entry) {
  const riceAmount = Number(entry.rice) || 0;
  let total = riceAmount * 180;
  let foodText = (entry.food || '').toLowerCase();

  // Sort by key length (longest first) then replace matched text to prevent sub-match double-counting
  const sorted = [...CALORIE_KEYWORDS].sort((a, b) => b.key.length - a.key.length);
  sorted.forEach(({ key, kcal }) => {
    if (foodText.includes(key)) {
      total += kcal;
      foodText = foodText.split(key).join(' '.repeat(key.length));
    }
  });

  return Math.round(Math.max(total, 0));
}

function estimateProtein(entry) {
  // Use manually entered protein if provided
  if (entry.protein && Number(entry.protein) > 0) return Number(entry.protein);

  const riceAmount = Number(entry.rice) || 0;
  let total = riceAmount * 3; // ~3g protein per chén cơm
  let foodText = (entry.food || '').toLowerCase();

  const sorted = [...PROTEIN_KEYWORDS].sort((a, b) => b.key.length - a.key.length);
  sorted.forEach(({ key, protein }) => {
    if (foodText.includes(key)) {
      total += protein;
      foodText = foodText.split(key).join(' '.repeat(key.length));
    }
  });

  return Math.round(Math.max(total, 0));
}

function getTodayCalories() {
  return state.logs
    .filter(l => l.date === state.today)
    .reduce((sum, e) => sum + (e.calories || estimateCalories(e)), 0);
}

function getTodayProtein() {
  return state.logs
    .filter(l => l.date === state.today)
    .reduce((sum, e) => sum + (e.protein || estimateProtein(e)), 0);
}

function getDayCalories(dateStr) {
  return state.logs
    .filter(l => l.date === dateStr)
    .reduce((sum, e) => sum + (e.calories || estimateCalories(e)), 0);
}

function getDayProtein(dateStr) {
  return state.logs
    .filter(l => l.date === dateStr)
    .reduce((sum, e) => sum + (e.protein || estimateProtein(e)), 0);
}

function getDayWater(dateStr) {
  // Water tracked in state for today; for past days, sum from log entries that have water
  if (dateStr === state.today) return state.water;
  return state.logs
    .filter(l => l.date === dateStr)
    .reduce((sum, e) => sum + (Number(e.water) || 0), 0);
}

// ==================== DASHBOARD STATS ====================
function updateDashboardStats() {
  const guide = WATER_GUIDE[state.dayType || 'heavy'];
  const guideText = document.getElementById('water-guide-text');
  if (guideText) guideText.textContent = `${guide.summary} • ${guide.reminder}`;

  // Weight
  const currentW = getCurrentWeight();
  document.getElementById('current-weight-display').innerHTML =
    `${currentW.toFixed(1)} <span class="stat-unit">kg</span>`;
  const weightPct = Math.min(((currentW - PROFILE.startWeight) / (PROFILE.targetWeight - PROFILE.startWeight)) * 100, 100);
  document.getElementById('weight-progress-bar').style.width = Math.max(weightPct, 0) + '%';
  document.getElementById('weight-progress-label').textContent = `${Math.max(weightPct, 0).toFixed(0)}% → ${PROFILE.targetWeight}kg`;

  // Water
  document.getElementById('water-display').innerHTML = `${state.water} <span class="stat-unit">ml</span>`;
  const waterPct = Math.min((state.water / state.waterTarget) * 100, 100);
  document.getElementById('water-progress-bar').style.width = waterPct + '%';
  document.getElementById('water-progress-label').textContent = `Đã uống ${waterPct.toFixed(0)}% / ${state.waterTarget}ml`;

  // Checklist
  const todayChecks = state.checklistData[state.today] || {};
  const doneCount   = Object.values(todayChecks).filter(Boolean).length;
  const total       = CHECKLIST_ITEMS.length;
  document.getElementById('checklist-display').innerHTML = `${doneCount} <span class="stat-unit">/ ${total}</span>`;
  const checkPct = (doneCount / total) * 100;
  document.getElementById('check-progress-bar').style.width = checkPct + '%';
  document.getElementById('check-progress-label').textContent = `Hoàn thành ${checkPct.toFixed(0)}%`;
  document.getElementById('schedule-badge').textContent = `${total - doneCount} việc còn lại`;

  // Rice
  const todayLogs = state.logs.filter(l => l.date === state.today);
  const totalRice = todayLogs.reduce((sum, l) => sum + (l.rice || 0), 0);
  const riceTarget = state.dayType === 'heavy' ? 4 : 3.5;
  document.getElementById('rice-display').innerHTML = `${totalRice} <span class="stat-unit">chén</span>`;
  document.getElementById('rice-progress-bar').style.width = Math.min((totalRice / riceTarget) * 100, 100) + '%';

  // Calories
  const totalCalories  = getTodayCalories();
  const calorieTarget  = state.dayType === 'heavy' ? 3000 : 2600;
  document.getElementById('calorie-display').innerHTML = `${totalCalories} <span class="stat-unit">kcal</span>`;
  document.getElementById('calorie-progress-bar').style.width = Math.min((totalCalories / calorieTarget) * 100, 100) + '%';
  document.getElementById('calorie-progress-label').textContent = `Mục tiêu ước tính: ${calorieTarget} kcal`;

  // Protein
  const totalProtein  = getTodayProtein();
  const proteinTarget = Math.round(PROFILE.startWeight * 1.8);
  document.getElementById('protein-display').innerHTML = `${totalProtein} <span class="stat-unit">g</span>`;
  document.getElementById('protein-progress-bar').style.width = Math.min((totalProtein / proteinTarget) * 100, 100) + '%';
  document.getElementById('protein-progress-label').textContent = `Mục tiêu: ~${proteinTarget}g (ước tính)`;
}

function getCurrentWeight() {
  if (!state.weights.length) return PROFILE.startWeight;
  return [...state.weights].sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight;
}

// ==================== TIMELINE ====================
function renderTimeline() {
  const container = document.getElementById('meal-timeline');
  if (!container) return;
  const now = getCurrentTimeMinutes();

  container.innerHTML = MEAL_SCHEDULE.map(meal => {
    const mealMin = timeToMinutes(meal.time);
    let statusClass = '', statusLabel = '';
    if (mealMin < now - 30) {
      statusClass = 'completed'; statusLabel = '<span class="status-badge status-done">✓ Xong</span>';
    } else if (mealMin <= now + 30) {
      statusClass = 'current'; statusLabel = '<span class="status-badge status-now">⦿ Bây giờ</span>';
    } else {
      statusLabel = `<span class="status-badge status-upcoming">${escHtml(meal.displayTime)}</span>`;
    }
    return `
      <div class="timeline-item ${statusClass}" id="tl-${meal.id}">
        <div class="timeline-time">${escHtml(meal.displayTime)}</div>
        <div class="timeline-icon">${meal.icon}</div>
        <div class="timeline-content">
          <div class="timeline-name">${escHtml(meal.name)}</div>
          <div class="timeline-desc">${escHtml(meal.goal)}</div>
        </div>
        <div class="timeline-status">${statusLabel}</div>
      </div>`;
  }).join('');
}

function updateTimeline() {
  const now = getCurrentTimeMinutes();
  MEAL_SCHEDULE.forEach(meal => {
    const el = document.getElementById(`tl-${meal.id}`);
    if (!el) return;
    const mealMin = timeToMinutes(meal.time);
    el.classList.remove('completed', 'current');
    const statusEl = el.querySelector('.timeline-status');
    if (mealMin < now - 30) {
      el.classList.add('completed');
      if (statusEl) statusEl.innerHTML = '<span class="status-badge status-done">✓ Xong</span>';
    } else if (mealMin <= now + 30) {
      el.classList.add('current');
      if (statusEl) statusEl.innerHTML = '<span class="status-badge status-now">⦿ Bây giờ</span>';
    } else {
      if (statusEl) statusEl.innerHTML = `<span class="status-badge status-upcoming">${escHtml(meal.displayTime)}</span>`;
    }
  });
}

function updateNextMealBadge() {
  const now  = getCurrentTimeMinutes();
  const next = MEAL_SCHEDULE.find(m => timeToMinutes(m.time) > now + 30);
  const badge = document.getElementById('next-meal-badge');
  if (badge) {
    if (next) badge.textContent = `Tiếp theo: ${next.displayTime} — ${next.name}`;
    else       badge.textContent = 'Đã hoàn thành các bữa trong ngày 🎉';
  }
}

// ==================== SCHEDULE GRID ====================
function renderScheduleGrid() {
  const container = document.getElementById('schedule-grid');
  if (!container) return;
  const now = getCurrentTimeMinutes();
  container.innerHTML = MEAL_SCHEDULE.map(meal => {
    const mealMin = timeToMinutes(meal.time);
    const isActive = mealMin <= now + 30 && mealMin > now - 60;
    return `
      <div class="schedule-card ${isActive ? 'active-slot' : ''}">
        <div class="schedule-time">${escHtml(meal.displayTime)}</div>
        <div class="schedule-activity">${meal.icon} ${escHtml(meal.activity)}</div>
        <div class="schedule-meal-title">${escHtml(meal.name)}</div>
        <div class="schedule-options">
          ${meal.options.map(o => `
            <div class="schedule-option">
              <div class="option-dot"></div>
              <span>${escHtml(o)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

// ==================== QUICK LOG ====================
function renderQuickSuggestions() {
  const select = document.getElementById('quick-meal-type');
  const list   = document.getElementById('quick-suggestion-list');
  const smartRow  = document.getElementById('smart-suggestions-row');
  const smartList = document.getElementById('smart-suggestion-list');
  if (!select || !list) return;

  const selected = select.value;
  const meal     = MEAL_SCHEDULE.find(m => m.id === selected);
  const options  = meal?.options || [];

  if (!options.length) {
    list.innerHTML = '<span class="quick-empty">Chọn khung giờ để xem món mẫu phù hợp.</span>';
    if (smartRow) smartRow.style.display = 'none';
    return;
  }

  list.innerHTML = options.map(o => `
    <button type="button" class="quick-suggestion-chip" data-option="${escHtml(o)}">${escHtml(o)}</button>
  `).join('');
  list.querySelectorAll('.quick-suggestion-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const fi = document.getElementById('quick-food');
      if (fi) fi.value = btn.dataset.option;
    });
  });

  // Smart suggestions from history
  const smart = getSmartSuggestions(selected);
  if (smart.length && smartRow && smartList) {
    smartRow.style.display = 'block';
    smartList.innerHTML = smart.map(s => `
      <button type="button" class="quick-suggestion-chip" data-option="${escHtml(s)}">${escHtml(s)}</button>
    `).join('');
    smartList.querySelectorAll('.quick-suggestion-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const fi = document.getElementById('quick-food');
        if (fi) fi.value = btn.dataset.option;
      });
    });
  } else if (smartRow) {
    smartRow.style.display = 'none';
  }
}

function getSmartSuggestions(mealId) {
  const relevant = state.logs.filter(l => l.mealType === mealId && l.food);
  const freq = {};
  relevant.forEach(l => {
    const food = l.food.trim();
    freq[food] = (freq[food] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([food]) => food);
}

function quickLog() {
  const mealType = document.getElementById('quick-meal-type').value;
  const food     = document.getElementById('quick-food').value.trim();
  const rice     = parseFloat(document.getElementById('quick-rice').value) || 0;
  const water    = parseInt(document.getElementById('quick-water-extra').value) || 0;
  const protein  = parseInt(document.getElementById('quick-protein').value) || 0;
  const feeling  = document.getElementById('quick-feeling').value;

  if (!mealType || !food) {
    showNotification('⚠️ Thiếu thông tin', 'Hãy chọn bữa ăn và ghi nội dung', 'warning');
    return;
  }

  const entry = {
    id: Date.now().toString(),
    date: state.today,
    time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
    mealType, food, rice, water, feeling,
    protein:  protein > 0 ? protein : 0,
    calories: estimateCalories({ food, rice, mealType }),
    timestamp: Date.now()
  };
  // Fill protein estimate if not manually entered
  if (entry.protein === 0) entry.protein = estimateProtein(entry);

  state.logs.unshift(entry);
  if (water > 0) state.water += water;

  // Reset form
  document.getElementById('quick-meal-type').value = '';
  document.getElementById('quick-food').value = '';
  document.getElementById('quick-rice').value = '0';
  document.getElementById('quick-water-extra').value = '0';
  document.getElementById('quick-protein').value = '0';
  renderQuickSuggestions();

  saveState();
  updateDashboardStats();
  renderLog();
  showNotification('💾 Đã lưu', `${escHtml(food.substring(0, 45))}`, 'success');
}

// ==================== LOG TAB ====================
function renderLog(filterDate = null) {
  const container = document.getElementById('log-list');
  if (!container) return;
  let logs = [...state.logs];
  if (filterDate) logs = logs.filter(l => l.date === filterDate);

  if (!logs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Chưa có bữa ăn nào được ghi lại${filterDate ? ' cho ngày này' : ''}.</p>
        <p style="margin-top:0.5rem;font-size:0.8125rem;">Dùng "Ghi nhanh" ở Dashboard để bắt đầu!</p>
      </div>`;
    return;
  }

  const feelingIcons = { good: '😊', ok: '😐', bad: '😴' };
  const feelingText  = { good: 'Tốt', ok: 'Bình thường', bad: 'Mệt' };

  container.innerHTML = logs.map(e => {
    const prot = e.protein || estimateProtein(e);
    const cals = e.calories || estimateCalories(e);
    return `
    <div class="log-entry">
      <div>
        <div class="log-time">${escHtml(e.time)}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">${formatDate(e.date)}</div>
      </div>
      <div>
        <div class="log-food">${e.mealType ? `<strong>${escHtml(e.mealType)}</strong> — ` : ''}${escHtml(e.food)}</div>
        <div class="log-meta">
          ${e.rice  > 0 ? `<span class="log-tag">🍚 ${e.rice} chén</span>` : ''}
          ${cals    > 0 ? `<span class="log-tag">🔥 ${cals} kcal</span>` : ''}
          ${prot    > 0 ? `<span class="log-tag">💪 ${prot}g protein</span>` : ''}
          ${e.water > 0 ? `<span class="log-tag">💧 +${e.water}ml</span>` : ''}
          ${e.feeling ? `<span class="log-tag">${feelingIcons[e.feeling]} ${feelingText[e.feeling] || ''}</span>` : ''}
        </div>
      </div>
      <div class="log-actions">
        <button class="btn-danger" onclick="deleteLog('${escHtml(e.id)}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function filterLog() {
  const date = document.getElementById('log-date-filter').value;
  if (date) renderLog(date);
}

function clearLogFilter() {
  document.getElementById('log-date-filter').value = '';
  renderLog();
}

function deleteLog(id) {
  state.logs = state.logs.filter(l => l.id !== id);
  saveState();
  renderLog();
  updateDashboardStats();
  showNotification('🗑️ Đã xóa', 'Đã xóa bữa ăn', 'warning');
}

function exportLog() {
  const data = state.logs.map(l => {
    const prot = l.protein || estimateProtein(l);
    const cals = l.calories || estimateCalories(l);
    return `${l.date}\t${l.time}\t${l.mealType}\t${l.food}\t${l.rice} chén\t${l.water}ml\t${cals} kcal\t${prot}g protein\t${l.feeling}`;
  }).join('\n');
  const header = 'Ngày\tGiờ\tBữa\tThức ăn\tCơm\tNước\tCalo\tProtein\tCảm giác\n';
  downloadFile(header + data, `nhat-ky-an-uong-${state.today}.txt`, 'text/plain;charset=utf-8');
  showNotification('📥 Xuất thành công', 'File nhật ký đã được tải về', 'success');
}

function exportBackup() {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    profile: PROFILE,
    data: {
      dayType: state.dayType, water: state.water, waterTarget: state.waterTarget,
      logs: state.logs, weights: state.weights, checklistData: state.checklistData,
      reminderEnabled: state.reminderEnabled, waterReminderEnabled: state.waterReminderEnabled,
      reminderAdvance: state.reminderAdvance, theme: state.theme
    }
  };
  downloadFile(JSON.stringify(payload, null, 2), `nutritrack-backup-${state.today}.json`, 'application/json;charset=utf-8');
  showNotification('💾 Backup đã sẵn sàng', 'File JSON đã được tải về', 'success');
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      const data = parsed.data || parsed;
      if (parsed.profile) {
        PROFILE = { ...PROFILE, ...parsed.profile };
        saveProfile();
        applyProfile();
      }
      state = {
        ...state,
        dayType:       data.dayType || state.dayType,
        water:         Number(data.water) || 0,
        waterTarget:   Number(data.waterTarget) || (data.dayType === 'light' ? 2000 : 2500),
        logs:          Array.isArray(data.logs)    ? data.logs    : [],
        weights:       Array.isArray(data.weights) ? data.weights : [],
        checklistData: data.checklistData || {},
        reminderEnabled:      data.reminderEnabled      !== undefined ? data.reminderEnabled      : state.reminderEnabled,
        waterReminderEnabled: data.waterReminderEnabled !== undefined ? data.waterReminderEnabled : state.waterReminderEnabled,
        reminderAdvance: Number(data.reminderAdvance) || state.reminderAdvance,
        theme: data.theme || state.theme
      };
      saveState();
      applyTheme(state.theme);
      updateDashboardStats(); renderLog(); renderWeightHistory();
      updateWeightStats(); drawWeightChart(); renderChecklist(); renderStats();
      setDayType(state.dayType, true);
      showNotification('📥 Khôi phục thành công', 'Dữ liệu đã được tải từ file backup', 'success');
    } catch {
      showNotification('❌ File không hợp lệ', 'Vui lòng chọn file backup JSON đúng định dạng', 'error');
    }
  };
  reader.readAsText(file);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ==================== WEIGHT TAB ====================
function saveWeight() {
  const date   = document.getElementById('weight-date').value;
  const weight = parseFloat(document.getElementById('weight-input').value);
  const note   = document.getElementById('weight-note').value.trim();

  if (!date || isNaN(weight) || weight < 30 || weight > 200) {
    showNotification('⚠️ Dữ liệu không hợp lệ', 'Hãy nhập cân nặng hợp lệ (30–200kg)', 'warning');
    return;
  }
  state.weights = state.weights.filter(w => w.date !== date);
  state.weights.push({ date, weight, note });
  state.weights.sort((a, b) => new Date(a.date) - new Date(b.date));

  document.getElementById('weight-input').value = '';
  document.getElementById('weight-note').value  = '';

  saveState();
  renderWeightHistory();
  updateWeightStats();
  updateDashboardStats();
  drawWeightChart();
  showNotification('⚖️ Đã lưu', `${date}: ${weight}kg`, 'success');
}

function updateWeightStats() {
  const current   = getCurrentWeight();
  const gained    = current - PROFILE.startWeight;
  const remaining = PROFILE.targetWeight - current;

  document.getElementById('wstat-start').textContent    = `${PROFILE.startWeight.toFixed(1)} kg`;
  document.getElementById('wstat-current').textContent  = `${current.toFixed(1)} kg`;
  document.getElementById('wstat-gained').textContent   = `+${gained.toFixed(1)} kg`;
  document.getElementById('wstat-remaining').textContent = `${Math.max(remaining, 0).toFixed(1)} kg`;
}

function renderWeightHistory() {
  const tbody = document.getElementById('weight-table-body');
  if (!tbody) return;
  if (!state.weights.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">Chưa có dữ liệu cân nặng</td></tr>`;
    return;
  }
  const sorted = [...state.weights].sort((a, b) => new Date(b.date) - new Date(a.date));
  tbody.innerHTML = sorted.map((entry, i) => {
    const prev = sorted[i + 1];
    const diff = prev ? (entry.weight - prev.weight) : null;
    const diffStr = diff !== null
      ? `<span class="weight-change ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '+' : ''}${diff.toFixed(1)}kg</span>`
      : '<span style="color:var(--text-muted)">—</span>';
    return `
      <tr>
        <td>${formatDate(entry.date)}</td>
        <td><strong>${entry.weight.toFixed(1)} kg</strong></td>
        <td>${diffStr}</td>
        <td style="color:var(--text-secondary)">${escHtml(entry.note || '—')}</td>
        <td><button class="btn-danger" onclick="deleteWeight('${escHtml(entry.date)}')">🗑️</button></td>
      </tr>`;
  }).join('');
}

function deleteWeight(date) {
  state.weights = state.weights.filter(w => w.date !== date);
  saveState(); renderWeightHistory(); updateWeightStats(); updateDashboardStats(); drawWeightChart();
}

function drawWeightChart() {
  const canvas = document.getElementById('weight-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.clientWidth || 600, H = 200;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  const data = [...state.weights].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (data.length < 2) {
    ctx.fillStyle = '#64748b'; ctx.font = '14px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Cần ít nhất 2 điểm dữ liệu để hiển thị biểu đồ', W / 2, H / 2);
    return;
  }
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights, PROFILE.targetWeight) + 0.5;
  const pad  = { top: 20, right: 20, bottom: 40, left: 50 };
  const cW   = W - pad.left - pad.right;
  const cH   = H - pad.top - pad.bottom;
  const xS = i => pad.left + (i / (data.length - 1)) * cW;
  const yS = v => pad.top + cH - ((v - minW) / (maxW - minW)) * cH;

  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * cH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    const val = maxW - (i / 4) * (maxW - minW);
    ctx.fillStyle = '#64748b'; ctx.font = '11px Inter'; ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), pad.left - 6, y + 4);
  }
  const targetY = yS(PROFILE.targetWeight);
  ctx.strokeStyle = 'rgba(16,185,129,0.4)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.left, targetY); ctx.lineTo(W - pad.right, targetY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#10b981'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
  ctx.fillText(`🎯 ${PROFILE.targetWeight}kg`, W - pad.right - 70, targetY - 4);

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, 'rgba(16,185,129,0.3)'); grad.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.beginPath(); ctx.moveTo(xS(0), yS(weights[0]));
  data.forEach((d, i) => { if (i > 0) ctx.lineTo(xS(i), yS(d.weight)); });
  ctx.lineTo(xS(data.length - 1), H - pad.bottom); ctx.lineTo(xS(0), H - pad.bottom);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach((d, i) => { const x = xS(i), y = yS(d.weight); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();

  data.forEach((d, i) => {
    const x = xS(i), y = yS(d.weight);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; ctx.fill();
    ctx.strokeStyle = '#0a0e1a'; ctx.lineWidth = 2; ctx.stroke();
  });

  const step = Math.max(1, Math.floor(data.length / 5));
  ctx.fillStyle = '#64748b'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1) {
      const parts = d.date.split('-');
      ctx.fillText(`${parts[2]}/${parts[1]}`, xS(i), H - 8);
    }
  });
}

// ==================== CHECKLIST ====================
function renderChecklist() {
  const container  = document.getElementById('checklist-items');
  if (!container) return;
  const todayChecks = state.checklistData[state.today] || {};

  container.innerHTML = CHECKLIST_ITEMS.map(item => {
    const checked = !!todayChecks[item.id];
    return `
      <div class="checklist-item ${checked ? 'checked' : ''}" onclick="toggleCheck('${item.id}')" id="check-${item.id}">
        <div class="check-box">${checked ? '✓' : ''}</div>
        <span class="item-text">${item.icon} ${escHtml(item.text)}</span>
        <span class="item-time">${escHtml(item.time)}</span>
      </div>`;
  }).join('');

  updateChecklistProgress();
  updateStreakBadge();
}

function toggleCheck(id) {
  if (!state.checklistData[state.today]) state.checklistData[state.today] = {};
  state.checklistData[state.today][id] = !state.checklistData[state.today][id];
  const item    = document.getElementById(`check-${id}`);
  const box     = item?.querySelector('.check-box');
  const checked = state.checklistData[state.today][id];
  if (item) { item.classList.toggle('checked', checked); }
  if (box)  { box.textContent = checked ? '✓' : ''; }
  saveState(); updateChecklistProgress(); updateDashboardStats(); updateStreakBadge();
}

function updateChecklistProgress() {
  const todayChecks = state.checklistData[state.today] || {};
  const done  = Object.values(todayChecks).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const pct   = done / total;
  const circ  = 2 * Math.PI * 54;

  const countEl = document.getElementById('circle-count');
  const fillEl  = document.getElementById('circle-fill');
  const msgEl   = document.getElementById('checklist-message');
  if (countEl) countEl.textContent = `${done}/${total}`;
  if (fillEl)  fillEl.style.strokeDashoffset = circ * (1 - pct);

  const messages = ['Hãy bắt đầu ngày mới với năng lượng tích cực! 💪', 'Tốt lắm! Tiếp tục duy trì nhé! 🌟', 'Bạn đang làm rất tốt! Hơn nửa chặng đường rồi! 🎯', 'Gần đến đích rồi! Cố lên! 🚀', 'Hoàn hảo! Bạn đã hoàn thành tất cả bảng kiểm hôm nay! 🎉'];
  let msg = messages[0];
  if (done >= 12) msg = messages[4];
  else if (done >= 9) msg = messages[3];
  else if (done >= 6) msg = messages[2];
  else if (done >= 3) msg = messages[1];
  if (msgEl) msgEl.textContent = msg;
}

function resetChecklist() {
  if (!confirm('Bạn muốn reset bảng kiểm hôm nay?')) return;
  state.checklistData[state.today] = {};
  renderChecklist(); updateDashboardStats(); saveState();
  showNotification('🔄 Đã reset', 'Bảng kiểm đã được làm mới', 'warning');
}

// ==================== STREAK ====================
function calculateStreak() {
  const today = new Date();
  let current = 0, best = 0, run = 0;
  let d = new Date(today);

  // Calculate current streak going backwards from yesterday
  // (today might not be complete yet, so check from yesterday)
  for (let i = 0; i < 365; i++) {
    const ds = d.toISOString().split('T')[0];
    const checks = state.checklistData[ds] || {};
    const done   = Object.values(checks).filter(Boolean).length;
    const hasLog = state.logs.some(l => l.date === ds);
    const active = done >= 6 || hasLog; // at least 6 checks or any log entry

    if (active) {
      run++;
      if (i === 0 || i === 1) current = run; // today or yesterday feeds current streak
    } else {
      if (i > 1) { if (run > best) best = run; run = 0; }
      else if (i === 0 && !active) { /* today not yet active, start from yesterday */ }
      else { if (run > best) best = run; run = 0; }
    }
    d.setDate(d.getDate() - 1);
  }
  if (run > best) best = run;
  if (current === 0 && run > 0) current = run;

  return { current, best };
}

function getBestStreak() {
  return calculateStreak().best;
}

function updateStreakBadge() {
  const { current } = calculateStreak();
  const el = document.getElementById('streak-badge-text');
  if (el) {
    if (current > 1) el.textContent = `🔥 Chuỗi ${current} ngày liên tiếp! Tiếp tục phát huy!`;
    else if (current === 1) el.textContent = '✅ Hôm nay bắt đầu chuỗi mới!';
    else el.textContent = '';
  }
}

// ==================== STATISTICS TAB ====================
function renderStats() {
  const days7 = getLast7Days();
  const { current, best } = calculateStreak();
  const totalLoggedDays = new Set(state.logs.map(l => l.date)).size;

  // Streak
  const scEl = document.getElementById('streak-current');
  const sbEl = document.getElementById('streak-best');
  const tdEl = document.getElementById('total-logged-days');
  if (scEl) scEl.textContent = current;
  if (sbEl) sbEl.textContent = best;
  if (tdEl) tdEl.textContent = totalLoggedDays;

  // Weekly averages
  const days7Data = days7.map(d => ({
    date: d,
    label: getDayLabel(d),
    calories: getDayCalories(d),
    water:    getDayWater(d),
    protein:  getDayProtein(d),
    checkPct: (() => {
      const checks = state.checklistData[d] || {};
      const done   = Object.values(checks).filter(Boolean).length;
      return Math.round((done / CHECKLIST_ITEMS.length) * 100);
    })()
  }));

  const activeDays  = days7Data.filter(d => d.calories > 0 || d.water > 0);
  const avgCalories = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length) : 0;
  const avgWater    = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.water,    0) / activeDays.length) : 0;
  const avgProtein  = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.protein,  0) / activeDays.length) : 0;
  const avgCheck    = days7Data.length  ? Math.round(days7Data.reduce((s, d) => s + d.checkPct,  0) / days7Data.length)  : 0;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('avg-calories', avgCalories);
  setEl('avg-water',    avgWater);
  setEl('avg-protein',  avgProtein);
  setEl('avg-checklist', avgCheck);

  // Bar charts
  renderBarChart('chart-calories', days7Data.map(d => ({ value: d.calories, label: d.label })), '#f97316');
  renderBarChart('chart-water',    days7Data.map(d => ({ value: d.water,    label: d.label })), '#3b82f6');
  renderBarChart('chart-protein',  days7Data.map(d => ({ value: d.protein,  label: d.label })), '#06b6d4');

  // Top foods
  renderTopFoods();
}

function renderBarChart(containerId, data, color) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const barsHtml = data.map(d => {
    const pct = Math.max((d.value / maxVal) * 100, d.value > 0 ? 4 : 0);
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;justify-content:flex-end;">
      <span style="font-size:0.6rem;color:var(--text-muted);white-space:nowrap;">${d.value > 0 ? d.value : ''}</span>
      <div style="width:75%;height:${pct}%;background:${color};border-radius:3px 3px 0 0;min-height:${d.value > 0 ? 3 : 0}px;transition:height 0.6s ease;opacity:0.85;"></div>
      <span style="font-size:0.62rem;color:var(--text-muted);">${escHtml(d.label)}</span>
    </div>`;
  }).join('');

  el.innerHTML = `<div style="display:flex;align-items:flex-end;height:100%;gap:3px;padding:0 4px;">${barsHtml}</div>`;
}

function renderTopFoods() {
  const container = document.getElementById('top-foods');
  if (!container) return;
  const freq = {};
  state.logs.forEach(l => {
    if (!l.food) return;
    const food = l.food.trim();
    freq[food] = (freq[food] || 0) + 1;
  });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!top.length) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.875rem;padding:1rem 0;">Chưa có đủ dữ liệu. Hãy ghi nhật ký ăn uống thường xuyên!</div>';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = top.map(([food, count], i) => `
    <div class="top-food-item">
      <span class="tf-rank">${medals[i] || `${i + 1}.`}</span>
      <span class="tf-name">${escHtml(food)}</span>
      <span class="tf-count">${count} lần</span>
    </div>`).join('');
}

// ==================== SETTINGS TAB ====================
function renderSettings() {
  const s = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  };
  s('settings-name',          PROFILE.name);
  s('settings-height',        PROFILE.height);
  s('settings-start-weight',  PROFILE.startWeight);
  s('settings-target-weight', PROFILE.targetWeight);
  s('settings-start-date',    PROFILE.startDate);
  s('settings-glucose',       PROFILE.glucose);

  const themeCheck = document.getElementById('theme-toggle-check');
  if (themeCheck) themeCheck.checked = state.theme === 'dark';
}

function saveSettings() {
  const g = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : null;
  };
  const name         = g('settings-name');
  const height       = parseFloat(g('settings-height'));
  const startWeight  = parseFloat(g('settings-start-weight'));
  const targetWeight = parseFloat(g('settings-target-weight'));
  const startDate    = g('settings-start-date');
  const glucose      = parseFloat(g('settings-glucose'));

  if (!name) { showNotification('⚠️ Thiếu thông tin', 'Hãy nhập họ tên', 'warning'); return; }
  if (isNaN(startWeight) || startWeight < 30) { showNotification('⚠️ Dữ liệu không hợp lệ', 'Cân nặng ban đầu phải > 30kg', 'warning'); return; }
  if (isNaN(targetWeight) || targetWeight < 30) { showNotification('⚠️ Dữ liệu không hợp lệ', 'Cân nặng mục tiêu phải > 30kg', 'warning'); return; }

  PROFILE = {
    name, startDate: startDate || PROFILE.startDate,
    height:       isNaN(height)  ? PROFILE.height  : height,
    startWeight,  targetWeight,
    glucose:      isNaN(glucose) ? PROFILE.glucose  : glucose
  };
  saveProfile();
  applyProfile();
  updateDashboardStats();
  updateWeightStats();
  showNotification('💾 Đã lưu', 'Hồ sơ cá nhân đã được cập nhật', 'success');
}

function resetAllData() {
  if (!confirm('⚠️ Xóa TOÀN BỘ dữ liệu? Thao tác này không thể hoàn tác!\n\nHãy backup trước khi xóa.')) return;
  if (!confirm('Bạn chắc chắn muốn xóa? Nhấn OK để xác nhận.')) return;
  localStorage.removeItem('nutritrack_state');
  localStorage.removeItem('nutritrack_profile');
  location.reload();
}

// ==================== MEALS GRID ====================
function renderMealsGrid(filter = 'all') {
  const container = document.getElementById('meals-grid');
  if (!container) return;
  const catLabels = { morning: 'Buổi sáng', noon: 'Buổi trưa', afternoon: 'Buổi chiều', evening: 'Buổi tối' };
  const catClass  = { morning: 'cat-morning', noon: 'cat-noon', afternoon: 'cat-afternoon', evening: 'cat-evening' };
  const filtered  = MEAL_SCHEDULE.filter(m => filter === 'all' || m.category === filter);

  container.innerHTML = filtered.map(meal => `
    <div class="meal-card" data-category="${meal.category}">
      <div class="meal-card-header">
        <span class="meal-time-tag">${meal.icon} ${escHtml(meal.displayTime)}</span>
        <span class="meal-category-tag ${catClass[meal.category]}">${catLabels[meal.category]}</span>
      </div>
      <div class="meal-name">${escHtml(meal.name)}</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.875rem">🎯 ${escHtml(meal.goal)}</div>
      <ul class="meal-options-list">${meal.options.map(o => `<li>${escHtml(o)}</li>`).join('')}</ul>
    </div>`).join('');
}

function filterMeals(filter, btn) {
  document.querySelectorAll('.meal-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMealsGrid(filter);
}

// ==================== RULES ====================
function renderRules() {
  const rulesGrid = document.getElementById('rules-grid');
  if (rulesGrid) rulesGrid.innerHTML = RULES.map(r => `
    <div class="rule-card">
      <div class="rule-icon">${r.icon}</div>
      <div class="rule-title">${escHtml(r.title)}</div>
      <div class="rule-text">${escHtml(r.text)}</div>
    </div>`).join('');

  const adjustGrid = document.getElementById('adjust-grid');
  if (adjustGrid) adjustGrid.innerHTML = ADJUST_RULES.map(r => `
    <div class="adjust-item">
      <div class="adjust-condition">${r.condition}</div>
      <div class="adjust-action">${escHtml(r.action)}</div>
    </div>`).join('');

  const goodFoods = document.getElementById('good-foods-list');
  if (goodFoods) goodFoods.innerHTML = GOOD_FOODS.map(f => `
    <div class="food-item"><span class="food-icon">${f.icon}</span><span>${escHtml(f.name)}</span></div>`).join('');

  const badFoods = document.getElementById('bad-foods-list');
  if (badFoods) badFoods.innerHTML = BAD_FOODS.map(f => `
    <div class="food-item"><span class="food-icon">${f.icon}</span><span>${escHtml(f.name)}</span></div>`).join('');
}

// ==================== REMINDERS ====================
function renderReminders() {
  const container = document.getElementById('reminders-grid');
  if (!container) return;
  const mealReminders = MEAL_SCHEDULE.filter(m =>
    !['pickleball_morning','pickleball_noon','sport_evening','work_morning','work_evening','rest','sleep'].includes(m.id)
  );
  const guide = WATER_GUIDE[state.dayType || 'heavy'];

  container.innerHTML = [
    ...mealReminders.map(meal => `
      <div class="reminder-item">
        <div class="reminder-time">${escHtml(meal.displayTime)}</div>
        <div class="reminder-text">${meal.icon} ${escHtml(meal.name)}</div>
        <div class="reminder-toggle-item">
          <label class="toggle-switch">
            <input type="checkbox" checked id="rem-${meal.id}" onchange="saveReminderSettings()" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>`),
    `<div class="reminder-item" style="border-left:4px solid #38bdf8;background:rgba(56,189,248,0.07)">
      <div class="reminder-time">💧 90 phút</div>
      <div class="reminder-text">Nhắc uống nước: ${escHtml(guide.summary)}</div>
    </div>`
  ].join('');

  const toggle = document.getElementById('reminder-toggle');
  if (toggle) toggle.checked = state.reminderEnabled;
  const waterToggle = document.getElementById('water-reminder-toggle');
  if (waterToggle) waterToggle.checked = state.waterReminderEnabled;
  const advance = document.getElementById('reminder-advance');
  if (advance) advance.value = state.reminderAdvance;
}

function updateNotificationPermissionUI() {
  const card = document.getElementById('notification-permission-card');
  if (!card) return;
  const perm = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  card.style.display = perm === 'granted' ? 'none' : 'block';
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showNotification('❌ Không hỗ trợ', 'Trình duyệt không hỗ trợ thông báo', 'error');
    return;
  }
  const permission = await Notification.requestPermission();
  state.notificationPermission = permission;
  saveState();
  if (permission === 'granted') {
    document.getElementById('notification-permission-card').style.display = 'none';
    scheduleReminders();
    showNotification('🔔 Đã bật', 'Thông báo đã được kích hoạt!', 'success');
    // Test notification via SW for better background support
    sendSwNotification('test', 1000, 'NutriTrack Pro 🥗', 'Thông báo dinh dưỡng đã được bật thành công!');
  } else {
    showNotification('⚠️ Chưa cho phép', 'Hãy cho phép thông báo trong cài đặt trình duyệt', 'warning');
  }
}

function toggleReminders() {
  state.reminderEnabled = document.getElementById('reminder-toggle').checked;
  saveReminderSettings();
  if (state.reminderEnabled) scheduleReminders();
  else cancelSwNotifications();
}

function saveReminderSettings() {
  state.reminderEnabled      = document.getElementById('reminder-toggle')?.checked ?? true;
  state.waterReminderEnabled = document.getElementById('water-reminder-toggle')?.checked ?? true;
  state.reminderAdvance      = parseInt(document.getElementById('reminder-advance')?.value) || 5;
  saveState();
}

function scheduleReminders() {
  // Clear existing browser timers
  state.reminderTimers.forEach(t => clearTimeout(t));
  state.reminderTimers = [];

  if (!state.reminderEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const nowMin = getCurrentTimeMinutes();
  const mealReminders = MEAL_SCHEDULE.filter(m =>
    !['pickleball_morning','pickleball_noon','sport_evening','work_morning','work_evening','rest','sleep'].includes(m.id)
  );

  mealReminders.forEach(meal => {
    const mealMin     = timeToMinutes(meal.time) - state.reminderAdvance;
    const minutesLeft = mealMin - nowMin;
    if (minutesLeft > 0 && minutesLeft < 24 * 60) {
      const delayMs = minutesLeft * 60 * 1000;
      const title   = `${meal.icon} ${meal.name}`;
      const body    = `${meal.displayTime} — ${meal.goal}`;

      // Schedule via SW (survives tab close on installed PWA)
      sendSwNotification(meal.id, delayMs, title, body);

      // Also keep browser-side timer as fallback
      const timer = setTimeout(() => {
        showNotification(title, body, 'success');
      }, delayMs);
      state.reminderTimers.push(timer);
    }
  });
}

function cancelSwNotifications() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({ type: 'CANCEL_NOTIFICATIONS' });
    }).catch(() => {});
  }
}

function sendSwNotification(id, delayMs, title, body) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION', id, delay: delayMs, title, body });
  }).catch(() => {});
}

function checkWaterReminders() {
  if (!state.waterReminderEnabled) return;
  setInterval(() => {
    if (state.water < state.waterTarget && 'Notification' in window && Notification.permission === 'granted') {
      showNotification('💧 Nhắc uống nước', `Đã uống ${state.water}ml/${state.waterTarget}ml. Hãy uống thêm 1 ly 200–300ml!`, 'warning');
    }
  }, 90 * 60 * 1000);
}

// ==================== ICS CALENDAR EXPORT ====================
function exportCalendarICS() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const UID_SUFFIX = '@nutritrack.pro';

  function icsDate(date8, time4) {
    // date8: "20260801", time4: "0430" → "20260801T043000"
    return `${date8}T${time4}00`;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function mealEndTime(timeStr) {
    // Add 30 minutes to the meal start time
    const [h, m] = timeStr.split(':').map(Number);
    const total  = h * 60 + m + 30;
    return `${pad2(Math.floor(total / 60) % 24)}${pad2(total % 60)}`;
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NutriTrack Pro//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:NutriTrack Pro - Lịch Dinh Dưỡng',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    'X-WR-CALDESC:Lịch ăn uống và tập luyện tự động từ NutriTrack Pro',
  ];

  // Meal reminder events (daily recurring)
  const mealEvents = MEAL_SCHEDULE.filter(m =>
    !['pickleball_morning','pickleball_noon','sport_evening','work_morning','work_evening','rest','sleep'].includes(m.id)
  );

  mealEvents.forEach((meal, idx) => {
    const t4    = meal.time.replace(':', '');
    const endT4 = mealEndTime(meal.time);
    const desc  = `${meal.goal}\\n${meal.options.slice(0, 3).join('\\n')}`.replace(/,/g, '\\,');
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;TZID=Asia/Ho_Chi_Minh:${icsDate(dateStr, t4)}`,
      `DTEND;TZID=Asia/Ho_Chi_Minh:${icsDate(dateStr, endT4)}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${meal.icon} ${meal.name}`,
      `DESCRIPTION:${desc}`,
      `UID:nutritrack-meal-${idx}-${Date.now()}${UID_SUFFIX}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT5M',
      'ACTION:DISPLAY',
      `DESCRIPTION:⏰ Sắp đến giờ: ${meal.name}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  // Training schedule (Mon-Fri)
  const trainings = [
    { time: '05:00', end: '06:15', name: '🏸 Dạy Pickleball sáng', desc: 'Uống 300–500ml nước trước\\nĐiện giải loãng nếu trời nóng' },
    { time: '11:30', end: '12:30', name: '🏸 Dạy Pickleball trưa', desc: 'Uống nước thường xuyên\\nĐiện giải loãng nếu nắng nóng' },
    { time: '17:00', end: '19:30', name: '🏓 Bóng bàn / Social Pickleball', desc: 'Dưới 60 phút: nước lọc\\n90–180 phút: nước + điện giải' }
  ];

  trainings.forEach((t, idx) => {
    const st = t.time.replace(':', '');
    const et = t.end.replace(':', '');
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;TZID=Asia/Ho_Chi_Minh:${icsDate(dateStr, st)}`,
      `DTEND;TZID=Asia/Ho_Chi_Minh:${icsDate(dateStr, et)}`,
      'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      `SUMMARY:${t.name}`,
      `DESCRIPTION:${t.desc}`,
      `UID:nutritrack-train-${idx}-${Date.now()}${UID_SUFFIX}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      `DESCRIPTION:⏰ 10 phút nữa: ${t.name}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  // Water reminders (every 90 minutes during the day)
  const waterTimes = ['07:30','09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30','21:00'];
  waterTimes.forEach((wt, idx) => {
    const t4 = wt.replace(':', '');
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;TZID=Asia/Ho_Chi_Minh:${icsDate(dateStr, t4)}`,
      `DTEND;TZID=Asia/Ho_Chi_Minh:${icsDate(dateStr, t4)}`,
      'RRULE:FREQ=DAILY',
      // water reminder block
      `SUMMARY:💧 Nhắc uống nước (${wt})`,
      'DESCRIPTION:Uống 1 ly 200–300ml nước lọc ngay bây giờ! Mục tiêu 2500ml/ngày.',
      `UID:nutritrack-water-${idx}-${Date.now()}${UID_SUFFIX}`,
      'BEGIN:VALARM',
      'TRIGGER:PT0S',
      'ACTION:DISPLAY',
      // valarm description below
      'DESCRIPTION:Nhac uong nuoc: 1 ly 200-300ml',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');


  downloadFile(lines.join('\r\n'), 'nutritrack-lich-dinh-duong.ics', 'text/calendar;charset=utf-8');


  showNotification(
    '📅 Đã xuất lịch',
    'Mở file .ics trên điện thoại để thêm vào Google/Apple Calendar',
    'success'
  );
}

// ==================== NOTIFICATIONS ====================
function showNotification(title, body, type = 'success') {
  const container = document.getElementById('notification-container');
  const icons = { success: '✅', warning: '⚠️', error: '❌' };
  const el = document.createElement('div');
  el.className = `notification ${type === 'warning' ? 'warning' : type === 'error' ? 'error' : ''}`;
  el.innerHTML = `
    <div class="notification-icon">${icons[type] || '✅'}</div>
    <div class="notification-text">
      <div class="notification-title">${escHtml(title)}</div>
      <div class="notification-body">${escHtml(body)}</div>
    </div>
    <div class="notification-close" onclick="this.parentElement.remove()">×</div>`;
  container.appendChild(el);
  setTimeout(() => { if (el.parentElement) el.remove(); }, 4500);
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', e => {
  if (e.altKey) {
    const keys = { '1':'dashboard','2':'schedule','3':'stats','4':'log','5':'weight','6':'checklist','7':'meals','8':'rules','9':'reminders','0':'settings' };
    if (keys[e.key]) { e.preventDefault(); switchTab(keys[e.key]); }
  }
});

// ==================== SERVICE WORKER (PWA) ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

console.log('%c🥗 NutriTrack Pro v2.0 loaded!', 'color:#10b981;font-size:1.2rem;font-weight:bold;');
console.log('%cPhím tắt: Alt+0..9 để chuyển tab nhanh', 'color:#94a3b8');
