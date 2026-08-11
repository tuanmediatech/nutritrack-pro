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
  Trash2
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
  const [selectedMealId, setSelectedMealId] = useState<string>('breakfast');
  const [foodText, setFoodText] = useState<string>('');
  const [ricePortion, setRicePortion] = useState<number>(0);
  const [extraWater, setExtraWater] = useState<number>(0);
  const [feeling, setFeeling] = useState<'good' | 'ok' | 'bad'>('good');

  const selectedMeal = mealSchedule.find(m => m.id === selectedMealId);

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
    return h * 60 + m;
  };

  return (
    <div className="space-y-6">
      {/* ===== Quick Log Section ===== */}
      <div className="glass-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="section-title text-lg font-bold text-white flex items-center gap-2 font-outfit">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>⚡ Ghi Nhánh Bữa Ăn & Sinh Hoạt</span>
          </h2>
          <span className="text-xs text-slate-400">Tự động tính Calories & Protein</span>
        </div>

        <form onSubmit={handleSubmitLog} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meal Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Bữa ăn trong ngày</label>
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
                    <span>Xóa mốc này</span>
                  </button>
                )}
              </div>
              <select
                value={selectedMealId}
                onChange={e => setSelectedMealId(e.target.value)}
                className="quick-select w-full bg-slate-800/80 border border-white/10 rounded-xl p-2.5 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none"
              >
                {mealSchedule.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.time} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Textarea */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Món ăn / thực phẩm nạp vào</label>
              <div className="relative">
                <textarea
                  value={foodText}
                  onChange={e => setFoodText(e.target.value)}
                  placeholder="VD: 2 chén cơm + cá kho + 1 tô canh rau + 1 bịch sữa tươi..."
                  rows={2}
                  className="quick-textarea w-full bg-slate-800/80 border border-white/10 rounded-xl p-2.5 pr-8 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                {foodText && (
                  <button
                    type="button"
                    onClick={() => setFoodText('')}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-full bg-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preset Chips */}
          {selectedMeal && selectedMeal.options && selectedMeal.options.length > 0 && (
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                <span>Món mẫu gợi ý theo giờ ({selectedMeal.name}):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMeal.options.map((opt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPreset(opt)}
                    className="quick-suggestion-chip px-3 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/30 text-slate-200 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portion Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Rice Spinner */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                🍚 Số chén cơm (chén):
              </label>
              <div className="flex items-center bg-slate-800/80 border border-white/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setRicePortion(Math.max(0, ricePortion - 0.5))}
                  className="px-3 py-2 text-emerald-400 font-bold hover:bg-white/10 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-sm text-white">{ricePortion} chén</span>
                <button
                  type="button"
                  onClick={() => setRicePortion(ricePortion + 0.5)}
                  className="px-3 py-2 text-emerald-400 font-bold hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Extra Water Spinner */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                💧 Nước nạp thêm (ml):
              </label>
              <div className="flex items-center bg-slate-800/80 border border-white/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExtraWater(Math.max(0, extraWater - 100))}
                  className="px-3 py-2 text-blue-400 font-bold hover:bg-white/10 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-sm text-white">{extraWater} ml</span>
                <button
                  type="button"
                  onClick={() => setExtraWater(extraWater + 100)}
                  className="px-3 py-2 text-blue-400 font-bold hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Feeling Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">😊 Cảm giác sau ăn:</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-800/80 border border-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFeeling('good')}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    feeling === 'good' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Tốt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeeling('ok')}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    feeling === 'ok' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400'
                  }`}
                >
                  <Meh className="w-3.5 h-3.5" />
                  <span>Vừa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeeling('bad')}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    feeling === 'bad' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-400'
                  }`}
                >
                  <Frown className="w-3.5 h-3.5" />
                  <span>Mệt</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>💾 Lưu Bữa Ăn & Cập Nhật Chỉ Số</span>
          </button>
        </form>
      </div>

      {/* ===== Summary Stat Cards Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Water Card */}
        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
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
              className="progress-fill h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((todayWater / waterTarget) * 100))}%` }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAddWater(200)}
              className="flex-1 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition-all"
            >
              +200ml
            </button>
            <button
              onClick={() => onAddWater(300)}
              className="flex-1 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition-all"
            >
              +300ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition-all"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Checklist Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
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
            className="w-full py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium text-xs hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1"
          >
            <span>Mở Bảng Kiểm Hôm Nay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weight & Rice Summary Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
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
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
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
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
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
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
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
            <span>⏱️ Lịch Ăn & Sinh Hoạt Hôm Nay</span>
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
                className={`glass-card p-3.5 flex items-center gap-4 rounded-xl border transition-all ${
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
