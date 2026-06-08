/* =====================================================
   NutriTrack Pro — app.js
   Full-featured Nutrition Management Application
   ===================================================== */

'use strict';

// ==================== DATA CONSTANTS ====================
const PROFILE = {
  name: 'Tuấn Nguyễn',
  height: 175,
  startWeight: 71.0,
  targetWeight: 78.0,
  startDate: '2026-06-07',
  glucose: 5.6
};

const MEAL_SCHEDULE = [
  {
    id: 'pre_morning',
    time: '04:30',
    displayTime: '4h30',
    name: 'Ăn nhẹ trước dạy sáng',
    icon: '🌅',
    activity: 'Trước khi dạy pickleball sáng',
    goal: 'Có năng lượng nhẹ, không nặng bụng',
    category: 'morning',
    options: [
      '1 quả chuối nhỏ',
      '1 lát bánh mì nhỏ hoặc ½ ổ nhỏ',
      '½ củ khoai lang nhỏ',
      '1 ly nhỏ sữa tươi không đường',
      '300–500ml nước lọc'
    ]
  },
  {
    id: 'pickleball_morning',
    time: '05:00',
    displayTime: '5h–6h',
    name: 'Dạy Pickleball sáng',
    icon: '🏸',
    activity: 'Dạy pickleball',
    goal: 'Duy trì nước',
    category: 'morning',
    options: [
      'Nước lọc từng ngụm nhỏ',
      'Điện giải loãng nếu trời nóng/mồ hôi nhiều'
    ]
  },
  {
    id: 'breakfast',
    time: '06:15',
    displayTime: '6h15–6h45',
    name: 'Ăn sáng chính',
    icon: '🍜',
    activity: 'Bữa sáng chính',
    goal: 'Bù năng lượng sau dạy sáng, nền cho cả ngày',
    category: 'morning',
    options: [
      'Phở/bún bò/bún chả cá/mì quảng có thịt hoặc trứng + sữa',
      'Bánh mì thịt hoặc bánh mì trứng + sữa',
      '1–1.5 chén cơm + cá/thịt/trứng + canh + sữa',
      'Bánh mì + 2 trứng luộc + sữa (khi bận)'
    ]
  },
  {
    id: 'work_morning',
    time: '07:00',
    displayTime: '7h–9h',
    name: 'Làm việc',
    icon: '💼',
    activity: 'Giờ hành chính',
    goal: 'Giữ tỉnh táo, không dùng đường ngọt',
    category: 'morning',
    options: [
      'Nước lọc đều đặn',
      'Không uống cà phê sữa quá ngọt'
    ]
  },
  {
    id: 'snack_morning',
    time: '09:30',
    displayTime: '9h30',
    name: 'Bữa phụ tại cơ quan',
    icon: '🥛',
    activity: 'Bữa phụ sáng',
    goal: 'Tránh tụt năng lượng, hỗ trợ tăng cân',
    category: 'morning',
    options: [
      'Sữa chua không đường + trái cây',
      'Sữa tươi không đường + đậu phộng/hạt điều/hạnh nhân',
      'Trái cây + 1 quả trứng luộc',
      'Bánh mì nhỏ + sữa không đường',
      'Bắp luộc hoặc khoai lang'
    ]
  },
  {
    id: 'pre_noon',
    time: '10:45',
    displayTime: '10h45–11h',
    name: 'Lót năng lượng trước dạy trưa',
    icon: '⚡',
    activity: 'Trước khi về dạy trưa',
    goal: 'Không để cơ thể rỗng năng lượng khi dạy',
    category: 'noon',
    options: [
      '1 quả chuối',
      '1 khúc bắp luộc',
      '1 lát bánh mì',
      '1 hộp sữa tươi không đường',
      '1 củ khoai nhỏ'
    ]
  },
  {
    id: 'pickleball_noon',
    time: '11:30',
    displayTime: '11h30–12h30',
    name: 'Dạy Pickleball trưa',
    icon: '🏸',
    activity: 'Dạy pickleball',
    goal: 'Bù nước trong khi dạy',
    category: 'noon',
    options: [
      'Nước lọc thường xuyên',
      'Điện giải loãng nếu nắng nóng, mồ hôi nhiều'
    ]
  },
  {
    id: 'lunch',
    time: '12:45',
    displayTime: '12h45–13h15',
    name: 'Ăn trưa chính',
    icon: '🍚',
    activity: 'Bữa phục hồi chính',
    goal: '2 chén cơm + đạm + rau + canh',
    category: 'noon',
    options: [
      '2 chén cơm',
      'Đạm: Cá kho/hấp, gà, thịt heo nạc, bò, tôm, mực, trứng, đậu phụ',
      'Rau luộc, rau xào ít dầu, salad',
      '1 chén canh (canh rau/cá/thịt/xương)',
      'Tráng miệng nhỏ: ổi, đu đủ, thanh long, táo'
    ]
  },
  {
    id: 'rest',
    time: '13:20',
    displayTime: '13h20–13h40',
    name: 'Nghỉ phục hồi',
    icon: '😴',
    activity: 'Nghỉ trưa',
    goal: 'Giảm mệt, hỗ trợ tăng cân',
    category: 'noon',
    options: [
      'Chợp mắt 15–20 phút nếu được',
      'Rất quan trọng nếu ngủ đêm ít'
    ]
  },
  {
    id: 'snack_afternoon',
    time: '15:30',
    displayTime: '15h30–16h',
    name: 'Bữa phụ chiều',
    icon: '🍌',
    activity: 'Bữa phụ chiều',
    goal: 'Chuẩn bị năng lượng cho chiều/tối',
    category: 'afternoon',
    options: [
      'Sữa tươi không đường + chuối (ưu tiên)',
      'Sữa tươi không đường + bắp luộc',
      'Sữa chua không đường + trái cây',
      'Bánh mì nhỏ + sữa (nếu chiều chơi thể thao)',
      'Khoai + sữa (bền năng lượng)'
    ]
  },
  {
    id: 'extra_sport',
    time: '16:30',
    displayTime: '16h30',
    name: 'Ăn thêm nếu chơi đến 20h',
    icon: '🥖',
    activity: 'Nếu chiều chơi thể thao đến tối',
    goal: 'Tăng năng lượng trước vận động kéo dài',
    category: 'afternoon',
    options: [
      '1 lát bánh mì hoặc ½ ổ nhỏ',
      '1 củ khoai nhỏ',
      '1 quả trứng luộc',
      '1 khúc bắp',
      '1 phần cơm nắm nhỏ'
    ],
    optional: true
  },
  {
    id: 'sport_evening',
    time: '17:00',
    displayTime: '17h–20h',
    name: 'Bóng bàn / Social Pickleball',
    icon: '🏓',
    activity: 'Nếu có chơi thể thao chiều/tối',
    goal: 'Duy trì nước và điện giải',
    category: 'afternoon',
    options: [
      'Dưới 60 phút: nước lọc là đủ',
      '90–180 phút: nước lọc + điện giải loãng',
      'Hụt sức: 1 quả chuối hoặc 1 lát bánh mì nhỏ'
    ],
    optional: true
  },
  {
    id: 'dinner',
    time: '20:15',
    displayTime: '20h15–20h45',
    name: 'Ăn tối chính',
    icon: '🌙',
    activity: 'Bữa phục hồi sau ngày dài',
    goal: 'Có chơi: 2 chén cơm | Không chơi: 1.5 chén',
    category: 'evening',
    options: [
      'Cơm + cá + rau + canh (ưu tiên thường xuyên)',
      'Cơm + gà + rau (tốt sau vận động)',
      'Cơm + thịt bò + canh (1–2 bữa/tuần)',
      'Cơm + đậu phụ + cá (nhẹ bụng)',
      'Bún/phở/mì quảng nếu không muốn ăn cơm'
    ]
  },
  {
    id: 'work_evening',
    time: '21:00',
    displayTime: '21h–22h30',
    name: 'Làm việc tối',
    icon: '💻',
    activity: 'Làm việc tối',
    goal: 'Không kích thích thần kinh quá mức',
    category: 'evening',
    options: [
      'Nước lọc',
      'Tránh cà phê/trà đặc sau chiều'
    ]
  },
  {
    id: 'pre_sleep',
    time: '22:00',
    displayTime: '22h–22h30',
    name: 'Trước khi ngủ (nếu đói)',
    icon: '🌛',
    activity: 'Bữa phụ trước ngủ',
    goal: 'Bổ sung nhẹ, không tăng đường nhanh',
    category: 'evening',
    options: [
      '1 ly sữa tươi không đường ấm (dễ ngủ hơn)',
      'Sữa tươi không đường + 1 quả trứng luộc',
      '1 hũ sữa chua không đường',
      'Sữa + ½ củ khoai (hôm vận động rất nặng)'
    ]
  },
  {
    id: 'sleep',
    time: '22:30',
    displayTime: '22h30–23h',
    name: 'Ngủ',
    icon: '💤',
    activity: 'Ngủ phục hồi',
    goal: 'Cố định giờ ngủ',
    category: 'evening',
    options: [
      'Càng ngủ đều càng dễ tăng cân sạch',
      'Mục tiêu: 7–8 tiếng'
    ]
  }
];

const CHECKLIST_ITEMS = [
  { id: 'c1', text: 'Ăn nhẹ trước dạy sáng (4h30)', time: '4h30', icon: '🌅' },
  { id: 'c2', text: 'Ăn sáng có tinh bột + đạm (6h15)', time: '6h15', icon: '🍜' },
  { id: 'c3', text: 'Uống ít nhất 2 bịch sữa/sữa chua trong ngày', time: 'Cả ngày', icon: '🥛' },
  { id: 'c4', text: 'Ăn bữa phụ 9h30', time: '9h30', icon: '🥗' },
  { id: 'c5', text: 'Ăn nhẹ trước dạy trưa (10h45)', time: '10h45', icon: '⚡' },
  { id: 'c6', text: 'Ăn trưa đủ 2 chén cơm + đạm + rau + canh', time: '12h45', icon: '🍚' },
  { id: 'c7', text: 'Nghỉ trưa 15–20 phút', time: '13h20', icon: '😴' },
  { id: 'c8', text: 'Ăn bữa phụ chiều (15h30)', time: '15h30', icon: '🍌' },
  { id: 'c9', text: 'Nếu chơi đến 20h: Ăn thêm lúc 16h30', time: '16h30', icon: '🥖' },
  { id: 'c10', text: 'Ăn tối đủ đạm, không bỏ cơm (20h15)', time: '20h15', icon: '🌙' },
  { id: 'c11', text: 'Uống đủ nước (2–3 lít)', time: 'Cả ngày', icon: '💧' },
  { id: 'c12', text: 'Không dùng sữa đặc / nước ngọt / trà sữa', time: 'Cả ngày', icon: '🚫' }
];

const RULES = [
  { icon: '⏰', title: 'Giữ khung giờ cố định', text: 'Ăn đúng các mốc trong ngày để không bị rỗng năng lượng. Cơ thể quen giờ ăn sẽ hấp thu tốt hơn.' },
  { icon: '🔄', title: 'Món ăn xoay vòng', text: 'Không ăn mãi trứng, bánh mì, khoai lang. Dùng nhiều nguồn tinh bột và đạm khác nhau để đủ chất và không ngán.' },
  { icon: '🚫', title: 'Không tăng cân bằng đường ngọt', text: 'Tránh sữa đặc, nước ngọt, trà sữa, bánh ngọt. Đường sẽ tăng glucose và tích mỡ bụng, không tốt.' },
  { icon: '🍚', title: 'Tăng cân bằng thực phẩm thật', text: 'Cơm, bún, phở, mì quảng, cá, thịt, gà, trứng, đậu phụ, sữa không đường — đây là nền tảng.' },
  { icon: '🍽️', title: 'Ưu tiên bữa trưa và tối', text: 'Đây là 2 bữa phục hồi chính sau vận động và làm việc. Không thay bằng trái cây hay sữa.' },
  { icon: '🥗', title: 'Bữa phụ là bắt buộc', text: 'Vì bạn vận động nhiều, không nên để khoảng cách giữa các bữa quá dài. Bữa phụ giúp duy trì năng lượng.' },
  { icon: '📊', title: 'Theo dõi glucose', text: 'Nếu glucose tăng, giảm đồ ngọt và tinh chỉnh tinh bột buổi tối. Không cắt bỏ hoàn toàn tinh bột.' },
  { icon: '😴', title: 'Ngủ đủ giấc', text: 'Càng ngủ đều càng dễ tăng cân sạch. Mục tiêu ngủ trước 23h và đủ 7–8 tiếng.' }
];

const ADJUST_RULES = [
  { condition: '⚖️ Cân không tăng', action: 'Thêm ½ chén cơm tối hoặc thêm 1 quả trứng/ngày hoặc thêm 1 lát bánh mì lúc 16h30' },
  { condition: '⚡ Chiều vẫn hụt sức', action: 'Thêm 1 lát bánh mì/khoai/bắp lúc 16h30, hoặc sữa + bắp/khoai' },
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

// ==================== APP STATE ====================
let state = {
  currentTab: 'dashboard',
  dayType: 'heavy', // 'heavy' | 'light'
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
  reminderTimers: []
};

// ==================== LOCAL STORAGE ====================
function saveState() {
  const toSave = {
    dayType: state.dayType,
    water: state.water,
    logs: state.logs,
    weights: state.weights,
    checklistData: state.checklistData,
    reminderEnabled: state.reminderEnabled,
    waterReminderEnabled: state.waterReminderEnabled,
    reminderAdvance: state.reminderAdvance,
    lastReset: state.today
  };
  localStorage.setItem('nutritrack_state', JSON.stringify(toSave));
}

function loadState() {
  try {
    const raw = localStorage.getItem('nutritrack_state');
    if (!raw) return;
    const saved = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];

    // Reset daily data if new day
    if (saved.lastReset !== today) {
      state.water = 0;
      state.checklistData[today] = {};
    } else {
      state.water = saved.water || 0;
      if (saved.checklistData) state.checklistData = saved.checklistData;
    }

    state.logs = saved.logs || [];
    state.weights = saved.weights || [];
    state.dayType = saved.dayType || 'heavy';
    state.reminderEnabled = saved.reminderEnabled !== undefined ? saved.reminderEnabled : true;
    state.waterReminderEnabled = saved.waterReminderEnabled !== undefined ? saved.waterReminderEnabled : true;
    state.reminderAdvance = saved.reminderAdvance || 5;
  } catch (e) {
    console.warn('Could not load state:', e);
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
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
  updateDashboardStats();
  updateWeightStats();
  setDefaultDates();
  startClockTick();
  scheduleReminders();
  if (state.dayType === 'light') setDayType('light', true);
  checkWaterReminders();
});

// ==================== DATE / TIME ====================
function initDateDisplay() {
  const el = document.getElementById('today-date');
  const now = new Date();
  const days = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
  el.textContent = `${days[now.getDay()]}, ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
}

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const wd = document.getElementById('weight-date');
  if (wd) wd.value = today;
  const lf = document.getElementById('log-date-filter');
  if (lf) lf.value = today;
}

function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function startClockTick() {
  updateTimeline();
  setInterval(() => {
    updateTimeline();
    updateNextMealBadge();
  }, 60000);
  updateNextMealBadge();
}

// ==================== NAVIGATION ====================
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
      // Close sidebar on mobile
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const nav = document.getElementById(`nav-${tabId}`);
  if (nav) nav.classList.add('active');
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`tab-${tabId}`);
  if (tab) tab.classList.add('active');

  // Draw chart if switching to weight tab
  if (tabId === 'weight') drawWeightChart();
}

// ==================== HAMBURGER / SIDEBAR ======= 
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ==================== DAY TYPE ====================
function setDayType(type, silent = false) {
  state.dayType = type;
  const heavy = document.getElementById('btn-heavy-day');
  const light = document.getElementById('btn-light-day');
  if (type === 'heavy') {
    heavy.classList.add('active'); light.classList.remove('active');
    state.waterTarget = 2500;
    document.getElementById('water-progress-label').textContent = 'Mục tiêu: 2500ml';
    document.getElementById('rice-progress-label').textContent = 'Mục tiêu: 4 chén';
  } else {
    light.classList.add('active'); heavy.classList.remove('active');
    state.waterTarget = 2000;
    document.getElementById('water-progress-label').textContent = 'Mục tiêu: 2000ml';
    document.getElementById('rice-progress-label').textContent = 'Mục tiêu: 3.5 chén';
  }
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

// ==================== DASHBOARD STATS ====================
function updateDashboardStats() {
  // Weight
  const currentW = getCurrentWeight();
  document.getElementById('current-weight-display').innerHTML = `${currentW.toFixed(1)} <span class="stat-unit">kg</span>`;
  const weightPct = Math.min(((currentW - PROFILE.startWeight) / (PROFILE.targetWeight - PROFILE.startWeight)) * 100, 100);
  document.getElementById('weight-progress-bar').style.width = Math.max(weightPct, 0) + '%';
  document.getElementById('weight-progress-label').textContent = `${Math.max(weightPct, 0).toFixed(0)}% → ${PROFILE.targetWeight}kg`;

  // Water
  document.getElementById('water-display').innerHTML = `${state.water} <span class="stat-unit">ml</span>`;
  const waterPct = Math.min((state.water / state.waterTarget) * 100, 100);
  document.getElementById('water-progress-bar').style.width = waterPct + '%';

  // Checklist
  const todayChecks = state.checklistData[state.today] || {};
  const doneCount = Object.values(todayChecks).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  document.getElementById('checklist-display').innerHTML = `${doneCount} <span class="stat-unit">/ ${total}</span>`;
  const checkPct = (doneCount / total) * 100;
  document.getElementById('check-progress-bar').style.width = checkPct + '%';
  document.getElementById('check-progress-label').textContent = `Hoàn thành ${checkPct.toFixed(0)}%`;
  document.getElementById('schedule-badge').textContent = `${total - doneCount} việc còn lại`;

  // Rice from logs today
  const todayLogs = state.logs.filter(l => l.date === state.today);
  const totalRice = todayLogs.reduce((sum, l) => sum + (l.rice || 0), 0);
  const riceTarget = state.dayType === 'heavy' ? 4 : 3.5;
  document.getElementById('rice-display').innerHTML = `${totalRice} <span class="stat-unit">chén</span>`;
  const ricePct = Math.min((totalRice / riceTarget) * 100, 100);
  document.getElementById('rice-progress-bar').style.width = ricePct + '%';
}

function getCurrentWeight() {
  if (state.weights.length === 0) return PROFILE.startWeight;
  const sorted = [...state.weights].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted[0].weight;
}

// ==================== TIMELINE ====================
function renderTimeline() {
  const container = document.getElementById('meal-timeline');
  const now = getCurrentTimeMinutes();

  container.innerHTML = MEAL_SCHEDULE.map(meal => {
    const mealMin = timeToMinutes(meal.time);
    let statusClass = '';
    let statusLabel = '';

    if (mealMin < now - 30) {
      statusClass = 'completed'; statusLabel = '<span class="status-badge status-done">✓ Xong</span>';
    } else if (mealMin <= now + 30) {
      statusClass = 'current'; statusLabel = '<span class="status-badge status-now">⦿ Bây giờ</span>';
    } else {
      statusClass = ''; statusLabel = `<span class="status-badge status-upcoming">${meal.displayTime}</span>`;
    }

    const optionText = meal.options.slice(0, 2).map(o => `<span>• ${o}</span>`).join(' ');

    return `
      <div class="timeline-item ${statusClass}" id="tl-${meal.id}">
        <div class="timeline-time">${meal.displayTime}</div>
        <div class="timeline-icon">${meal.icon}</div>
        <div class="timeline-content">
          <div class="timeline-name">${meal.name}</div>
          <div class="timeline-desc">${meal.goal}</div>
        </div>
        <div class="timeline-status">${statusLabel}</div>
      </div>
    `;
  }).join('');
}

function updateTimeline() {
  const now = getCurrentTimeMinutes();
  MEAL_SCHEDULE.forEach(meal => {
    const el = document.getElementById(`tl-${meal.id}`);
    if (!el) return;
    const mealMin = timeToMinutes(meal.time);
    el.classList.remove('completed','current');
    const statusEl = el.querySelector('.timeline-status');
    if (mealMin < now - 30) {
      el.classList.add('completed');
      if (statusEl) statusEl.innerHTML = '<span class="status-badge status-done">✓ Xong</span>';
    } else if (mealMin <= now + 30) {
      el.classList.add('current');
      if (statusEl) statusEl.innerHTML = '<span class="status-badge status-now">⦿ Bây giờ</span>';
    } else {
      if (statusEl) statusEl.innerHTML = `<span class="status-badge status-upcoming">${meal.displayTime}</span>`;
    }
  });
}

function updateNextMealBadge() {
  const now = getCurrentTimeMinutes();
  const next = MEAL_SCHEDULE.find(m => timeToMinutes(m.time) > now + 30);
  const badge = document.getElementById('next-meal-badge');
  if (badge) {
    if (next) badge.textContent = `Tiếp theo: ${next.displayTime} — ${next.name}`;
    else badge.textContent = 'Đã hoàn thành các bữa trong ngày 🎉';
  }
}

// ==================== SCHEDULE GRID ====================
function renderScheduleGrid() {
  const container = document.getElementById('schedule-grid');
  const now = getCurrentTimeMinutes();

  container.innerHTML = MEAL_SCHEDULE.map(meal => {
    const mealMin = timeToMinutes(meal.time);
    const isActive = mealMin <= now + 30 && mealMin > now - 60;
    return `
      <div class="schedule-card ${isActive ? 'active-slot' : ''}">
        <div class="schedule-time">${meal.displayTime}</div>
        <div class="schedule-activity">${meal.icon} ${meal.activity}</div>
        <div class="schedule-meal-title">${meal.name}</div>
        <div class="schedule-options">
          ${meal.options.map(o => `
            <div class="schedule-option">
              <div class="option-dot"></div>
              <span>${o}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ==================== QUICK LOG ====================
function quickLog() {
  const mealType = document.getElementById('quick-meal-type').value;
  const food = document.getElementById('quick-food').value.trim();
  const rice = parseFloat(document.getElementById('quick-rice').value) || 0;
  const water = parseInt(document.getElementById('quick-water-extra').value) || 0;
  const feeling = document.getElementById('quick-feeling').value;

  if (!mealType || !food) {
    showNotification('⚠️ Thiếu thông tin', 'Hãy chọn bữa ăn và ghi nội dung', 'warning');
    return;
  }

  const entry = {
    id: Date.now().toString(),
    date: state.today,
    time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
    mealType,
    food,
    rice,
    water,
    feeling,
    timestamp: Date.now()
  };

  state.logs.unshift(entry);
  if (water > 0) state.water += water;

  // Reset form
  document.getElementById('quick-meal-type').value = '';
  document.getElementById('quick-food').value = '';
  document.getElementById('quick-rice').value = '0';
  document.getElementById('quick-water-extra').value = '0';

  saveState();
  updateDashboardStats();
  renderLog();
  showNotification('💾 Đã lưu', `Bữa ${mealType} - ${food.substring(0,40)}...`, 'success');
}

// ==================== LOG TAB ====================
function renderLog(filterDate = null) {
  const container = document.getElementById('log-list');
  let logs = [...state.logs];

  if (filterDate) {
    logs = logs.filter(l => l.date === filterDate);
  }

  if (logs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Chưa có bữa ăn nào được ghi lại${filterDate ? ' cho ngày này' : ''}.</p>
        <p style="margin-top:0.5rem;font-size:0.8125rem;">Dùng "Ghi nhanh" ở Dashboard để bắt đầu!</p>
      </div>
    `;
    return;
  }

  const feelingIcons = { good: '😊', ok: '😐', bad: '😴' };
  container.innerHTML = logs.map(entry => `
    <div class="log-entry">
      <div>
        <div class="log-time">${entry.time}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">${formatDate(entry.date)}</div>
      </div>
      <div>
        <div class="log-food">${entry.mealType ? `<strong>${entry.mealType}</strong> — ` : ''}${entry.food}</div>
        <div class="log-meta">
          ${entry.rice > 0 ? `<span class="log-tag">🍚 ${entry.rice} chén</span>` : ''}
          ${entry.water > 0 ? `<span class="log-tag">💧 +${entry.water}ml</span>` : ''}
          ${entry.feeling ? `<span class="log-tag">${feelingIcons[entry.feeling]} ${entry.feeling === 'good' ? 'Tốt' : entry.feeling === 'ok' ? 'Bình thường' : 'Mệt'}</span>` : ''}
        </div>
      </div>
      <div class="log-actions">
        <button class="btn-danger" onclick="deleteLog('${entry.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
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
  const data = state.logs.map(l =>
    `${l.date}\t${l.time}\t${l.mealType}\t${l.food}\t${l.rice} chén\t${l.water}ml\t${l.feeling}`
  ).join('\n');
  const header = 'Ngày\tGiờ\tBữa\tThức ăn\tCơm\tNước\tCảm giác\n';
  const blob = new Blob([header + data], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `nhat-ky-an-uong-${state.today}.txt`;
  a.click(); URL.revokeObjectURL(url);
  showNotification('📥 Xuất thành công', 'File nhật ký đã được tải về', 'success');
}

// ==================== WEIGHT TAB ====================
function saveWeight() {
  const date = document.getElementById('weight-date').value;
  const weight = parseFloat(document.getElementById('weight-input').value);
  const note = document.getElementById('weight-note').value.trim();

  if (!date || isNaN(weight) || weight < 50 || weight > 150) {
    showNotification('⚠️ Dữ liệu không hợp lệ', 'Hãy nhập cân nặng hợp lệ (50–150kg)', 'warning');
    return;
  }

  // Remove existing entry for this date
  state.weights = state.weights.filter(w => w.date !== date);
  state.weights.push({ date, weight, note });
  state.weights.sort((a, b) => new Date(a.date) - new Date(b.date));

  document.getElementById('weight-input').value = '';
  document.getElementById('weight-note').value = '';

  saveState();
  renderWeightHistory();
  updateWeightStats();
  updateDashboardStats();
  drawWeightChart();
  showNotification('⚖️ Đã lưu', `${date}: ${weight}kg`, 'success');
}

function updateWeightStats() {
  const current = getCurrentWeight();
  const gained = current - PROFILE.startWeight;
  const remaining = PROFILE.targetWeight - current;

  document.getElementById('wstat-current').textContent = `${current.toFixed(1)} kg`;
  document.getElementById('wstat-gained').textContent = `+${gained.toFixed(1)} kg`;
  document.getElementById('wstat-remaining').textContent = `${Math.max(remaining, 0).toFixed(1)} kg`;
}

function renderWeightHistory() {
  const tbody = document.getElementById('weight-table-body');
  if (!state.weights.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">Chưa có dữ liệu cân nặng</td></tr>`;
    return;
  }

  const sorted = [...state.weights].sort((a, b) => new Date(b.date) - new Date(a.date));
  tbody.innerHTML = sorted.map((entry, i) => {
    const prev = sorted[i + 1];
    const diff = prev ? (entry.weight - prev.weight) : null;
    const diffStr = diff !== null ? `<span class="weight-change ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '+' : ''}${diff.toFixed(1)}kg</span>` : '<span style="color:var(--text-muted)">—</span>';
    return `
      <tr>
        <td>${formatDate(entry.date)}</td>
        <td><strong>${entry.weight.toFixed(1)} kg</strong></td>
        <td>${diffStr}</td>
        <td style="color:var(--text-secondary)">${entry.note || '—'}</td>
        <td><button class="btn-danger" onclick="deleteWeight('${entry.date}')">🗑️</button></td>
      </tr>
    `;
  }).join('');
}

function deleteWeight(date) {
  state.weights = state.weights.filter(w => w.date !== date);
  saveState();
  renderWeightHistory();
  updateWeightStats();
  updateDashboardStats();
  drawWeightChart();
}

function drawWeightChart() {
  const canvas = document.getElementById('weight-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.clientWidth || 600;
  const H = 200;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const data = [...state.weights].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (data.length < 2) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Cần ít nhất 2 điểm dữ liệu để hiển thị biểu đồ', W/2, H/2);
    return;
  }

  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights, PROFILE.targetWeight) + 0.5;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const xScale = i => pad.left + (i / (data.length - 1)) * chartW;
  const yScale = v => pad.top + chartH - ((v - minW) / (maxW - minW)) * chartH;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    const val = maxW - (i / 4) * (maxW - minW);
    ctx.fillStyle = '#64748b'; ctx.font = '11px Inter'; ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), pad.left - 6, y + 4);
  }

  // Target line
  const targetY = yScale(PROFILE.targetWeight);
  ctx.strokeStyle = 'rgba(16,185,129,0.4)';
  ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.left, targetY); ctx.lineTo(W - pad.right, targetY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#10b981'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
  ctx.fillText('🎯 78kg', W - pad.right - 60, targetY - 4);

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  gradient.addColorStop(0, 'rgba(16,185,129,0.3)');
  gradient.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.beginPath();
  ctx.moveTo(xScale(0), yScale(weights[0]));
  data.forEach((d, i) => { if (i > 0) ctx.lineTo(xScale(i), yScale(d.weight)); });
  ctx.lineTo(xScale(data.length - 1), H - pad.bottom);
  ctx.lineTo(xScale(0), H - pad.bottom);
  ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();

  // Line
  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = xScale(i), y = yScale(d.weight);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  data.forEach((d, i) => {
    const x = xScale(i), y = yScale(d.weight);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; ctx.fill();
    ctx.strokeStyle = '#0a0e1a'; ctx.lineWidth = 2; ctx.stroke();
  });

  // X Labels
  const step = Math.max(1, Math.floor(data.length / 5));
  ctx.fillStyle = '#64748b'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1) {
      const parts = d.date.split('-');
      ctx.fillText(`${parts[2]}/${parts[1]}`, xScale(i), H - 8);
    }
  });
}

// ==================== CHECKLIST ====================
function renderChecklist() {
  const container = document.getElementById('checklist-items');
  const todayChecks = state.checklistData[state.today] || {};

  container.innerHTML = CHECKLIST_ITEMS.map(item => {
    const checked = !!todayChecks[item.id];
    return `
      <div class="checklist-item ${checked ? 'checked' : ''}" onclick="toggleCheck('${item.id}')" id="check-${item.id}">
        <div class="check-box">${checked ? '✓' : ''}</div>
        <span class="item-text">${item.icon} ${item.text}</span>
        <span class="item-time">${item.time}</span>
      </div>
    `;
  }).join('');

  updateChecklistProgress();
}

function toggleCheck(id) {
  if (!state.checklistData[state.today]) state.checklistData[state.today] = {};
  state.checklistData[state.today][id] = !state.checklistData[state.today][id];

  const item = document.getElementById(`check-${id}`);
  const box = item.querySelector('.check-box');
  const checked = state.checklistData[state.today][id];

  if (checked) {
    item.classList.add('checked');
    box.textContent = '✓';
  } else {
    item.classList.remove('checked');
    box.textContent = '';
  }

  saveState();
  updateChecklistProgress();
  updateDashboardStats();
}

function updateChecklistProgress() {
  const todayChecks = state.checklistData[state.today] || {};
  const done = Object.values(todayChecks).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const pct = done / total;
  const circumference = 2 * Math.PI * 54;

  document.getElementById('circle-count').textContent = `${done}/${total}`;
  document.getElementById('circle-fill').style.strokeDashoffset = circumference * (1 - pct);

  const messages = {
    0: 'Hãy bắt đầu ngày mới với năng lượng tích cực! 💪',
    3: 'Tốt lắm! Tiếp tục duy trì nhé! 🌟',
    6: 'Bạn đang làm rất tốt! Hơn nửa chặng đường rồi! 🎯',
    9: 'Gần đến đích rồi! Cố lên! 🚀',
    12: 'Hoàn hảo! Bạn đã hoàn thành tất cả bảng kiểm hôm nay! 🎉'
  };

  let message = messages[0];
  if (done >= 12) message = messages[12];
  else if (done >= 9) message = messages[9];
  else if (done >= 6) message = messages[6];
  else if (done >= 3) message = messages[3];

  document.getElementById('checklist-message').textContent = message;
}

function resetChecklist() {
  if (!confirm('Bạn muốn reset bảng kiểm hôm nay?')) return;
  state.checklistData[state.today] = {};
  renderChecklist();
  updateDashboardStats();
  saveState();
  showNotification('🔄 Đã reset', 'Bảng kiểm đã được làm mới', 'warning');
}

// ==================== MEALS GRID ====================
function renderMealsGrid(filter = 'all') {
  const container = document.getElementById('meals-grid');
  const catLabels = { morning: 'Buổi sáng', noon: 'Buổi trưa', afternoon: 'Buổi chiều', evening: 'Buổi tối' };
  const catClass = { morning: 'cat-morning', noon: 'cat-noon', afternoon: 'cat-afternoon', evening: 'cat-evening' };

  const filtered = MEAL_SCHEDULE.filter(m => filter === 'all' || m.category === filter);

  container.innerHTML = filtered.map(meal => `
    <div class="meal-card" data-category="${meal.category}">
      <div class="meal-card-header">
        <span class="meal-time-tag">${meal.icon} ${meal.displayTime}</span>
        <span class="meal-category-tag ${catClass[meal.category]}">${catLabels[meal.category]}</span>
      </div>
      <div class="meal-name">${meal.name}</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.875rem">🎯 ${meal.goal}</div>
      <ul class="meal-options-list">
        ${meal.options.map(o => `<li>${o}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function filterMeals(filter, btn) {
  document.querySelectorAll('.meal-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMealsGrid(filter);
}

// ==================== RULES ====================
function renderRules() {
  const rulesGrid = document.getElementById('rules-grid');
  rulesGrid.innerHTML = RULES.map(r => `
    <div class="rule-card">
      <div class="rule-icon">${r.icon}</div>
      <div class="rule-title">${r.title}</div>
      <div class="rule-text">${r.text}</div>
    </div>
  `).join('');

  const adjustGrid = document.getElementById('adjust-grid');
  adjustGrid.innerHTML = ADJUST_RULES.map(r => `
    <div class="adjust-item">
      <div class="adjust-condition">${r.condition}</div>
      <div class="adjust-action">${r.action}</div>
    </div>
  `).join('');

  const goodFoods = document.getElementById('good-foods-list');
  goodFoods.innerHTML = GOOD_FOODS.map(f => `
    <div class="food-item"><span class="food-icon">${f.icon}</span><span>${f.name}</span></div>
  `).join('');

  const badFoods = document.getElementById('bad-foods-list');
  badFoods.innerHTML = BAD_FOODS.map(f => `
    <div class="food-item"><span class="food-icon">${f.icon}</span><span>${f.name}</span></div>
  `).join('');
}

// ==================== REMINDERS ====================
function renderReminders() {
  const container = document.getElementById('reminders-grid');
  const reminders = MEAL_SCHEDULE.filter(m =>
    !['pickleball_morning', 'pickleball_noon', 'sport_evening', 'work_morning', 'work_evening', 'rest', 'sleep'].includes(m.id)
  );

  container.innerHTML = reminders.map(meal => `
    <div class="reminder-item">
      <div class="reminder-time">${meal.displayTime}</div>
      <div class="reminder-text">${meal.icon} ${meal.name}</div>
      <div class="reminder-toggle-item">
        <label class="toggle-switch">
          <input type="checkbox" checked id="rem-${meal.id}" onchange="saveReminderSettings()" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `).join('');

  // Update UI from state
  const toggle = document.getElementById('reminder-toggle');
  if (toggle) toggle.checked = state.reminderEnabled;
  const waterToggle = document.getElementById('water-reminder-toggle');
  if (waterToggle) waterToggle.checked = state.waterReminderEnabled;
  const advance = document.getElementById('reminder-advance');
  if (advance) advance.value = state.reminderAdvance;
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showNotification('❌ Không hỗ trợ', 'Trình duyệt không hỗ trợ thông báo', 'error');
    return;
  }
  const permission = await Notification.requestPermission();
  state.notificationPermission = permission;
  if (permission === 'granted') {
    document.getElementById('notification-permission-card').style.display = 'none';
    scheduleReminders();
    showNotification('🔔 Đã bật', 'Thông báo đã được kích hoạt!', 'success');
    new Notification('NutriTrack Pro 🥗', {
      body: 'Thông báo dinh dưỡng đã được bật thành công!',
      icon: '🥗'
    });
  } else {
    showNotification('⚠️ Chưa cho phép', 'Hãy cho phép thông báo trong cài đặt trình duyệt', 'warning');
  }
}

function toggleReminders() {
  state.reminderEnabled = document.getElementById('reminder-toggle').checked;
  saveReminderSettings();
  if (state.reminderEnabled) scheduleReminders();
}

function saveReminderSettings() {
  state.reminderEnabled = document.getElementById('reminder-toggle')?.checked ?? true;
  state.waterReminderEnabled = document.getElementById('water-reminder-toggle')?.checked ?? true;
  state.reminderAdvance = parseInt(document.getElementById('reminder-advance')?.value) || 5;
  saveState();
}

function scheduleReminders() {
  // Clear existing timers
  state.reminderTimers.forEach(t => clearTimeout(t));
  state.reminderTimers = [];

  if (!state.reminderEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const mealReminders = MEAL_SCHEDULE.filter(m =>
    !['pickleball_morning', 'pickleball_noon', 'sport_evening', 'work_morning', 'work_evening', 'rest', 'sleep'].includes(m.id)
  );

  mealReminders.forEach(meal => {
    const mealMin = timeToMinutes(meal.time) - state.reminderAdvance;
    const minutesUntil = mealMin - nowMin;

    if (minutesUntil > 0 && minutesUntil < 24 * 60) {
      const timer = setTimeout(() => {
        if (Notification.permission === 'granted' && state.reminderEnabled) {
          new Notification(`${meal.icon} ${meal.name}`, {
            body: `${meal.displayTime} — ${meal.goal}`,
            icon: '🥗',
            tag: meal.id
          });
          showNotification(`${meal.icon} ${meal.name}`, `${meal.displayTime} — ${meal.goal}`, 'success');
        }
      }, minutesUntil * 60 * 1000);
      state.reminderTimers.push(timer);
    }
  });
}

function checkWaterReminders() {
  if (!state.waterReminderEnabled) return;
  // Remind every 1.5 hours if water < target
  setInterval(() => {
    if (state.water < state.waterTarget && Notification.permission === 'granted') {
      showNotification('💧 Nhắc uống nước', `Bạn đã uống ${state.water}ml/${state.waterTarget}ml. Hãy uống thêm nước!`, 'warning');
    }
  }, 90 * 60 * 1000); // every 90 minutes
}

// ==================== NOTIFICATIONS ====================
function showNotification(title, body, type = 'success') {
  const container = document.getElementById('notification-container');
  const icons = { success: '✅', warning: '⚠️', error: '❌' };

  const el = document.createElement('div');
  el.className = `notification ${type === 'warning' ? 'warning' : type === 'error' ? 'error' : ''}`;
  el.innerHTML = `
    <div class="notification-icon">${icons[type]}</div>
    <div class="notification-text">
      <div class="notification-title">${title}</div>
      <div class="notification-body">${body}</div>
    </div>
    <div class="notification-close" onclick="this.parentElement.remove()">×</div>
  `;
  container.appendChild(el);
  setTimeout(() => { if (el.parentElement) el.remove(); }, 4500);
}

// ==================== UTILS ====================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', e => {
  if (e.altKey) {
    const keys = { '1': 'dashboard', '2': 'schedule', '3': 'log', '4': 'weight', '5': 'checklist', '6': 'meals', '7': 'rules', '8': 'reminders' };
    if (keys[e.key]) { e.preventDefault(); switchTab(keys[e.key]); }
  }
});

// ==================== SERVICE WORKER (PWA) ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

console.log('%c🥗 NutriTrack Pro loaded!', 'color:#10b981;font-size:1.2rem;font-weight:bold;');
console.log('%cPhím tắt: Alt+1..8 để chuyển tab nhanh', 'color:#94a3b8');
