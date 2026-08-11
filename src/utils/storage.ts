import { LogEntry, WeightEntry, ChecklistState, UserProfile, NoteItem, HealthRecord, SymptomConsultation, AISchedule, MealOption, ChecklistItem } from '../types';
import { CALORIE_KEYWORDS, PROTEIN_KEYWORDS } from '../data/defaultData';

const LOCAL_STORAGE_KEY = 'nutritrack_pro_v3_state';

export interface AppStateData {
  userProfile: UserProfile;
  dayType: 'heavy' | 'light';
  logs: LogEntry[];
  weights: WeightEntry[];
  checklist: ChecklistState;
  notes: NoteItem[];
  healthRecords: HealthRecord[];
  symptomLogs: SymptomConsultation[];
  aiSchedules: AISchedule[];
  activeScheduleId?: string;
  customMealSchedule?: MealOption[];
  customMealSchedules?: Record<string, MealOption[]>;
  customChecklistItems?: ChecklistItem[];
  reminderAdvance: number;
  waterReminderEnabled: boolean;
  reminderEnabled: boolean;
  theme: 'dark' | 'light';
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Nguyễn Tuân',
  height: 175,
  startWeight: 71.0,
  targetWeight: 78.0,
  startDate: new Date().toISOString().split('T')[0],
  glucose: 5.6,
  profileType: 'tang_can',
};

export const INITIAL_STATE: AppStateData = {
  userProfile: INITIAL_USER_PROFILE,
  dayType: 'heavy',
  logs: [
    {
      id: 'sample_1',
      date: new Date().toISOString().split('T')[0],
      time: '06:30',
      meal_type: 'breakfast',
      food: '1 tô bún bò huế + 1 bịch sữa tươi không đường',
      rice: 0,
      water: 250,
      feeling: 'good',
      protein: 28,
      calories: 450,
      timestamp: Date.now() - 3600000 * 4,
    },
    {
      id: 'sample_2',
      date: new Date().toISOString().split('T')[0],
      time: '12:45',
      meal_type: 'lunch',
      food: '2 chén cơm + cá kho tộ + canh cải bắp + 1 quả trứng luộc',
      rice: 2,
      water: 300,
      feeling: 'good',
      protein: 36,
      calories: 620,
      timestamp: Date.now() - 3600000 * 1,
    }
  ],
  weights: [
    { id: 'w1', date: '2026-07-28', weight: 70.2, note: 'Khởi đầu chương trình' },
    { id: 'w2', date: '2026-08-01', weight: 70.6, note: 'Sáng sau vệ sinh' },
    { id: 'w3', date: '2026-08-05', weight: 71.0, note: 'Tăng tiến nhẹ' },
  ],
  checklist: {},
  notes: [
    {
      id: 'note_1',
      title: 'Kế hoạch bổ sung đạm và nước tập Pickleball',
      content: 'Ưu tiên uống 1 ly nước điện giải loãng trong lúc dạy trưa 11h30-12h30. Sau ca dạy trưa cần ăn 2 chén cơm đầy.',
      updatedAt: new Date().toISOString(),
    }
  ],
  healthRecords: [
    {
      id: 'hr_1',
      checkupDate: '2026-06-15',
      bloodPressure: '120/80 mmHg',
      glucose: 5.6,
      cholesterol: 4.8,
      uricAcid: 380,
      liverEnzymes: 'AST 24 / ALT 28 U/L',
      conclusion: 'Sức khỏe tổng quát tốt, thể lực sung sức. Tiếp tục duy trì dinh dưỡng thể thao.',
      notes: 'Khám định kỳ tại Bệnh viện Tâm Anh'
    }
  ],
  symptomLogs: [],
  aiSchedules: [],
  reminderAdvance: 5,
  waterReminderEnabled: true,
  reminderEnabled: true,
  theme: 'dark',
};

export function loadState(): AppStateData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_STATE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load local state:', e);
  }
  return INITIAL_STATE;
}

export function saveState(state: AppStateData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function estimateCalories(food: string, rice: number): number {
  let total = (Number(rice) || 0) * 180;
  let foodText = (food || '').toLowerCase();

  const sorted = [...CALORIE_KEYWORDS].sort((a, b) => b.key.length - a.key.length);
  sorted.forEach(({ key, kcal }) => {
    if (foodText.includes(key)) {
      total += kcal;
      foodText = foodText.split(key).join(' '.repeat(key.length));
    }
  });

  return Math.round(Math.max(total, 0));
}

export function estimateProtein(food: string, rice: number, manualProtein?: number): number {
  if (manualProtein && Number(manualProtein) > 0) return Number(manualProtein);

  let total = (Number(rice) || 0) * 3;
  let foodText = (food || '').toLowerCase();

  const sorted = [...PROTEIN_KEYWORDS].sort((a, b) => b.key.length - a.key.length);
  sorted.forEach(({ key, protein }) => {
    if (foodText.includes(key)) {
      total += protein;
      foodText = foodText.split(key).join(' '.repeat(key.length));
    }
  });

  return Math.round(Math.max(total, 0));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return labels[d.getDay()];
}

export function calculateStreak(logs: LogEntry[], checklistState: ChecklistState) {
  const today = new Date();
  let current = 0;
  let best = 0;
  let run = 0;
  let d = new Date(today);

  for (let i = 0; i < 365; i++) {
    const ds = d.toISOString().split('T')[0];
    const checks = checklistState[ds] || {};
    const done = Object.values(checks).filter(Boolean).length;
    const hasLog = logs.some(l => l.date === ds);
    const active = done >= 5 || hasLog;

    if (active) {
      run++;
      if (i === 0 || i === 1) current = run;
    } else {
      if (run > best) best = run;
      run = 0;
    }
    d.setDate(d.getDate() - 1);
  }
  if (run > best) best = run;

  return { current, best };
}

export function exportICSFile(mealSchedule: any[]) {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NutriTrack Pro//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  mealSchedule.forEach((meal, idx) => {
    const [h, m] = (meal.time || '08:00').split(':');
    ics = ics.concat([
      'BEGIN:VEVENT',
      `UID:nutritrack-meal-${meal.id || idx}-${idx}@nutritrack.pro`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;TZID=Asia/Ho_Chi_Minh:20260101T${h}${m}00`,
      `RRULE:FREQ=DAILY`,
      `SUMMARY:[NutriTrack] ${meal.icon || '🥗'} ${meal.name}`,
      `DESCRIPTION:Mục tiêu: ${meal.goal || ''}\\nMón gợi ý: ${(meal.options || []).join(', ')}`,
      'END:VEVENT'
    ]);
  });

  ics.push('END:VCALENDAR');
  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nutritrack_schedule.ics';
  a.click();
}
