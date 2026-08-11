import React, { useState } from 'react';
import {
  DayType,
  LogEntry,
  MealOption,
  UserProfile,
  ChecklistState,
  WeightEntry
} from '../types';
import { estimateCalories, estimateProtein } from '../utils/storage';
import {
  Droplets,
  CheckSquare,
  Scale,
  Flame,
  Dumbbell,
  Plus,
  Clock,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Check,
  ChevronRight,
  UtensilsCrossed,
  X,
  Trash2,
  Utensils
} from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
  dayType: DayType;
  mealSchedule: MealOption[];
  logs: LogEntry[];
  weights: WeightEntry[];
  checklistState: ChecklistState;
  onAddLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  onAddWater: (ml: number) => void;
  onSelectTab: (tab: any) => void;
  onDeleteMealSlot?: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  dayType,
  mealSchedule,
  logs,
  weights,
  checklistState,
  onAddLog,
  onAddWater,
  onSelectTab,
  onDeleteMealSlot,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const isGain = userProfile.profileType === 'tang_can';

  // Quick Log form states
  const [selectedMealId, setSelectedMealId] = useState<string>(mealSchedule[0]?.id || 'breakfast');
  const [foodText, setFoodText] = useState<string>('');
  const [ricePortion, setRicePortion] = useState<number>(0);
  const [extraWater, setExtraWater] = useState<number>(0);
  const [feeling, setFeeling] = useState<'good' | 'ok' | 'bad'>('good');

  const selectedMeal = mealSchedule.find(m => m.id === selectedMealId) || mealSchedule[0];

  // Today's aggregate numbers
  const todayLogs = logs.filter(l => l.date === today);
  const todayWater = todayLogs.reduce((sum, l) => sum + (l.water || 0), 0);
  const todayRice = todayLogs.reduce((sum, l) => sum + (l.rice || 0), 0);
  const todayCalories = todayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const todayProtein = todayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);

  const waterTarget = dayType === 'heavy' ? 2500 : 2000;
  const riceTarget = isGain ? (dayType === 'heavy' ? 4 : 3.5) : (dayType === 'heavy' ? 2 : 1.5);
  const proteinTarget = Math.round((weights.length ? weights[weights.length - 1].weight : userProfile.startWeight) * 1.8);

  const todayChecks = checklistState[today] || {};
  const doneChecks = Object.values(todayChecks).filter(Boolean).length;
  const totalChecks = 10;
  const currentWeight = weights.length ? weights[weights.length - 1].weight : userProfile.startWeight;

  // Handle Preset Chip Click
  const handleSelectPreset = (preset: string) => {
    const cleanPreset = preset.replace(/^[•-\s]+/, '');
    setFoodText(cleanPreset);

    // Auto estimate rice
    let riceVal = 0;
    if (cleanPreset.includes('2 chén cơm') || cleanPreset.includes('2 bát cơm')) riceVal = 2;
    else if (cleanPreset.includes('1.5 chén cơm') || cleanPreset.includes('1.5 bát cơm')) riceVal = 1.5;
    else if (cleanPreset.includes('1 chén cơm') || cleanPreset.includes('1 bát cơm')) riceVal = 1;
    else if (cleanPreset.includes('½ chén cơm') || cleanPreset.includes('1/2 chén cơm')) riceVal = 0.5;
    else if (cleanPreset.toLowerCase().includes('chén cơm') || cleanPreset.toLowerCase().includes('bát cơm')) riceVal = 1;

    setRicePortion(riceVal);
  };

  // Submit Quick Log
  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMealId) return;
    if (!foodText.trim() && extraWater === 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const desc = foodText.trim() || `Ghi nhận ${selectedMeal?.name || 'Bữa ăn'}`;

    const cal = estimateCalories(desc, ricePortion);
    const pro = estimateProtein(desc, ricePortion);

    onAddLog({
      date: today,
      time: timeStr,
      meal_type: selectedMealId,
      food: desc,
      rice: ricePortion,
      water: extraWater,
      feeling: feeling,
      calories: cal,
      protein: pro,
    });

    // Reset fields
    setFoodText('');
    setRicePortion(0);
    setExtraWater(0);
  };

  // Timeline helper
  const nowInMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const timeToMins = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  return (
    <div className="space-y-6">
      {/* ===== Quick Log Section (Redesigned & Clean) ===== */}
      <div className="glass-card p-5 md:p-6 space-y-5 rounded-3xl border border-white/10 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit leading-tight">
                Ghi Nhận Bữa Ăn & Sinh Hoạt
              </h2>
              <p className="text-xs text-slate-400">Tự động tính toán Calories, Protein & Nhật ký dinh dưỡng</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              ⚡ Nạp Năng Lượng
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmitLog} className="space-y-4">
          {/* Main Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Meal Select Dropdown */}
            <div className="md:col-span-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bữa ăn trong ngày</span>
                </label>

                {onDeleteMealSlot && mealSchedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa mốc này khỏi danh mục?')) {
                        onDeleteMealSlot(selectedMealId);
                      }
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline font-medium"
                    title="Xóa mốc bữa ăn này khỏi danh mục"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa mốc</span>
                  </button>
                )}
              </div>

              <select
                value={selectedMealId}
                onChange={e => setSelectedMealId(e.target.value)}
                className="w-full bg-slate-800/90 border border-white/10 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:border-emerald-400 focus:outline-none transition-all shadow-inner"
              >
                {mealSchedule.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.icon || '⏰'} {m.displayTime || m.time} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Text Input */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Món ăn & Thực phẩm nạp vào</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={foodText}
                  onChange={e => setFoodText(e.target.value)}
                  placeholder="Ví dụ: 2 chén cơm + 200g cá hấp + 1 tô canh rau..."
                  className="w-full bg-slate-800/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none transition-all shadow-inner pr-10"
                />
                {foodText && (
                  <button
                    type="button"
                    onClick={() => setFoodText('')}
                    className="absolute top-2.5 right-3 p-1 text-slate-400 hover:text-white rounded-full bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Preset Chips */}
          {selectedMeal && selectedMeal.options && selectedMeal.options.length > 0 && (
            <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gợi ý mẫu theo giờ ({selectedMeal.name}):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMeal.options.map((opt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPreset(opt)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-300 transition-all text-left font-medium"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Steppers & Feelings Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Rice Portion Stepper */}
            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-2xl space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">🍚 Lượng cơm (chén):</span>
              <div className="flex items-center justify-between bg-slate-800 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setRicePortion(Math.max(0, ricePortion - 0.5))}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-extrabold text-base flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="font-outfit font-extrabold text-sm text-white">{ricePortion} chén</span>
                <button
                  type="button"
                  onClick={() => setRicePortion(ricePortion + 0.5)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-extrabold text-base flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Extra Water Stepper */}
            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-2xl space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">💧 Nước nạp thêm:</span>
              <div className="flex items-center justify-between bg-slate-800 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setExtraWater(Math.max(0, extraWater - 100))}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 font-extrabold text-base flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="font-outfit font-extrabold text-sm text-white">{extraWater} ml</span>
                <button
                  type="button"
                  onClick={() => setExtraWater(extraWater + 100)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 font-extrabold text-base flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Feeling Selector */}
            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-2xl space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">😊 Cảm giác sau ăn:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-800 border border-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFeeling('good')}
                  className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    feeling === 'good'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Tốt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeeling('ok')}
                  className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    feeling === 'ok'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Meh className="w-3.5 h-3.5" />
                  <span>Vừa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeeling('bad')}
                  className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    feeling === 'bad'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Frown className="w-3.5 h-3.5" />
                  <span>Mệt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>GHI NHẬN BỮA ĂN & CẬP NHẬT CHỈ SỐ</span>
          </button>
        </form>
      </div>

      {/* ===== Summary Stat Cards Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Water Card */}
        <div className="glass-card p-5 space-y-3 relative overflow-hidden rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-md">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Nước uống hôm nay</span>
                <span className="font-outfit font-extrabold text-2xl text-white">
                  {todayWater} <span className="text-sm font-normal text-slate-400">/ {waterTarget}ml</span>
                </span>
              </div>
            </div>
          </div>

          <div className="progress-bar h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((todayWater / waterTarget) * 100))}%` }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAddWater(200)}
              className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-500/20 transition-all"
            >
              +200ml
            </button>
            <button
              onClick={() => onAddWater(300)}
              className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-500/20 transition-all"
            >
              +300ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-500/20 transition-all"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Checklist Card */}
        <div className="glass-card p-5 space-y-3 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-md">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Bảng kiểm hằng ngày</span>
                <span className="font-outfit font-extrabold text-2xl text-white">
                  {doneChecks} <span className="text-sm font-normal text-slate-400">/ {totalChecks} việc</span>
                </span>
              </div>
            </div>
          </div>

          <div className="progress-bar h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((doneChecks / totalChecks) * 100))}%` }}
            />
          </div>

          <button
            onClick={() => onSelectTab('checklist')}
            className="w-full py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium text-xs hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1"
          >
            <span>Mở Bảng Kiểm Hôm Nay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weight & Rice Summary Card */}
        <div className="glass-card p-5 space-y-3 rounded-2xl border border-white/10">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cân nặng</span>
                <span className="font-outfit font-extrabold text-lg text-white">
                  {currentWeight.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                🍚
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cơm hôm nay</span>
                <span className="font-outfit font-extrabold text-lg text-white">
                  {todayRice.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ {riceTarget}c</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Calories</span>
                <span className="font-outfit font-extrabold text-sm text-white">
                  {todayCalories} <span className="text-[10px] text-slate-400">kcal</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Protein</span>
                <span className="font-outfit font-extrabold text-sm text-white">
                  {todayProtein} <span className="text-[10px] text-slate-400">/ ~{proteinTarget}g</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Today Meal Timeline ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title text-lg font-bold text-white flex items-center gap-2 font-outfit">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Lịch Sinh Hoạt Hôm Nay</span>
          </h2>
          <button
            onClick={() => onSelectTab('schedule')}
            className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Xem Lịch Chi Tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {mealSchedule.map(meal => {
            const mealMins = timeToMins(meal.time);
            const isLogged = logs.some(l => l.meal_type === meal.id && l.date === today);

            let statusTag = (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-white/5">
                Sắp tới
              </span>
            );

            if (isLogged) {
              statusTag = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Đã ăn</span>
                </span>
              );
            } else if (nowInMinutes >= mealMins && nowInMinutes < mealMins + 60) {
              statusTag = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                  💡 Đến giờ
                </span>
              );
            } else if (nowInMinutes >= mealMins + 60) {
              statusTag = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  Trễ giờ
                </span>
              );
            }

            return (
              <div
                key={meal.id}
                className={`glass-card p-3.5 flex items-center gap-4 rounded-2xl border transition-all ${
                  isLogged
                    ? 'bg-emerald-900/10 border-emerald-500/20'
                    : nowInMinutes >= mealMins && nowInMinutes < mealMins + 60
                    ? 'bg-blue-900/15 border-blue-500/40 shadow-md shadow-blue-500/10'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="font-outfit font-extrabold text-sm text-emerald-400 w-14 shrink-0">
                  {meal.displayTime || meal.time}
                </span>

                <span className="text-2xl shrink-0">{meal.icon}</span>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{meal.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{meal.goal}</p>
                </div>

                <div className="shrink-0">{statusTag}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
