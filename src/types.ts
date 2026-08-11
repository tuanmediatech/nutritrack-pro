export type ProfileType = 'tang_can' | 'giam_can';
export type DayType = 'heavy' | 'light';

export type TabType = 
  | 'dashboard' 
  | 'schedule' 
  | 'stats' 
  | 'log' 
  | 'weight' 
  | 'checklist' 
  | 'meals' 
  | 'notebook' 
  | 'health' 
  | 'reminders'
  | 'settings';

export interface UserProfile {
  name: string;
  height: number;
  startWeight: number;
  targetWeight: number;
  startDate: string;
  glucose: number;
  profileType: ProfileType;
}

export interface MealOption {
  id: string;
  time: string;
  displayTime: string;
  name: string;
  icon: string;
  activity: string;
  goal: string;
  category: 'morning' | 'noon' | 'afternoon' | 'evening';
  options: string[];
  optional?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  time: string;
  icon: string;
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  meal_type: string;
  food: string;
  rice: number;
  water: number;
  feeling: 'good' | 'ok' | 'bad';
  protein: number;
  calories: number;
  timestamp: number;
}

export interface WeightEntry {
  id?: string;
  date: string; // YYYY-MM-DD
  weight: number;
  note?: string;
}

export interface ChecklistState {
  [date: string]: {
    [itemId: string]: boolean;
  };
}

export interface NutritionRule {
  icon: string;
  title: string;
  text: string;
}

export interface AdjustRule {
  condition: string;
  action: string;
}

export interface FoodGuideItem {
  icon: string;
  name: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  checkupDate: string;
  bloodPressure: string;
  glucose?: number;
  cholesterol?: number;
  uricAcid?: number;
  liverEnzymes: string;
  conclusion: string;
  notes?: string;
}

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface SymptomConsultation {
  id: string;
  logDate: string;
  symptoms: string;
  symptomName: string;
  assessment: string;
  recommendations: string;
  warnings?: string;
  references: ReferenceLink[];
}

export interface AISchedule {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  meal_schedule: MealOption[];
  checklist: ChecklistItem[];
}
