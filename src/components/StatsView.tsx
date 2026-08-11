import React, { useState } from 'react';
import { LogEntry, ChecklistState } from '../types';
import { calculateStreak, getLast7Days, getDayLabel } from '../utils/storage';
import { Flame, Trophy, Calendar, TrendingUp, Award } from 'lucide-react';

interface StatsViewProps {
  logs: LogEntry[];
  checklistState: ChecklistState;
}

export const StatsView: React.FC<StatsViewProps> = ({ logs, checklistState }) => {
  const [chartTab, setChartTab] = useState<'calories' | 'water' | 'protein'>('calories');

  const { current, best } = calculateStreak(logs, checklistState);
  const totalLoggedDays = new Set(logs.map(l => l.date)).size;

  const days7 = getLast7Days();

  const days7Data = days7.map(d => {
    const dayLogs = logs.filter(l => l.date === d);
    const calories = dayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    const water = dayLogs.reduce((sum, l) => sum + (l.water || 0), 0);
    const protein = dayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);

    const checks = checklistState[d] || {};
    const done = Object.values(checks).filter(Boolean).length;
    const checkPct = Math.round((done / 10) * 100);

    return {
      date: d,
      label: getDayLabel(d),
      calories,
      water,
      protein,
      checkPct,
    };
  });

  const activeDays = days7Data.filter(d => d.calories > 0 || d.water > 0);
  const avgCalories = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length) : 0;
  const avgWater = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.water, 0) / activeDays.length) : 0;
  const avgProtein = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.protein, 0) / activeDays.length) : 0;
  const avgCheck = days7Data.length ? Math.round(days7Data.reduce((s, d) => s + d.checkPct, 0) / days7Data.length) : 0;

  // Top foods calculation
  const foodFreq: Record<string, number> = {};
  logs.forEach(l => {
    if (!l.food || l.meal_type === 'water') return;
    const clean = l.food.trim();
    foodFreq[clean] = (foodFreq[clean] || 0) + 1;
  });
  const topFoods = Object.entries(foodFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Active chart data
  const chartMax = Math.max(
    ...days7Data.map(d => d[chartTab]),
    chartTab === 'calories' ? 2000 : chartTab === 'water' ? 2000 : 100
  );

  const chartColors = {
    calories: 'bg-orange-500',
    water: 'bg-blue-500',
    protein: 'bg-cyan-500',
  };

  const chartLabels = {
    calories: '🔥 Calo Nạp Vào (kcal)',
    water: '💧 Nước Uống (ml)',
    protein: '💪 Protein Nạp Vào (g)',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span>Thống Kê Dinh Dưỡng 7 Ngày Qua</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Theo dõi mức độ duy trì kỷ luật và xu hướng dinh dưỡng
        </p>
      </div>

      {/* Streak Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl">
            🔥
          </div>
          <span className="font-outfit font-black text-4xl text-amber-400 block">{current}</span>
          <span className="text-xs font-semibold text-slate-300 block">Chuỗi Ngày Liên Tiếp</span>
        </div>

        <div className="glass-card p-5 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
            🏆
          </div>
          <span className="font-outfit font-black text-4xl text-emerald-400 block">{best}</span>
          <span className="text-xs font-semibold text-slate-300 block">Chuỗi Kỷ Lục Dài Nhất</span>
        </div>

        <div className="glass-card p-5 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto text-2xl">
            📅
          </div>
          <span className="font-outfit font-black text-4xl text-blue-400 block">{totalLoggedDays}</span>
          <span className="text-xs font-semibold text-slate-300 block">Tổng Số Ngày Đã Ghi Nhật Ký</span>
        </div>
      </div>

      {/* Weekly Averages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">TB Calo/ngày</span>
          <span className="font-outfit font-extrabold text-2xl text-white">{avgCalories}</span>
          <span className="text-xs text-slate-500"> kcal</span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">TB Nước/ngày</span>
          <span className="font-outfit font-extrabold text-2xl text-white">{avgWater}</span>
          <span className="text-xs text-slate-500"> ml</span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">TB Protein/ngày</span>
          <span className="font-outfit font-extrabold text-2xl text-white">{avgProtein}</span>
          <span className="text-xs text-slate-500"> g</span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Bảng kiểm TB</span>
          <span className="font-outfit font-extrabold text-2xl text-white">{avgCheck}</span>
          <span className="text-xs text-slate-500"> %</span>
        </div>
      </div>

      {/* Interactive 7-Day Bar Chart */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{chartLabels[chartTab]}</h3>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setChartTab('calories')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartTab === 'calories' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Calo
            </button>
            <button
              onClick={() => setChartTab('water')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartTab === 'water' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💧 Nước
            </button>
            <button
              onClick={() => setChartTab('protein')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartTab === 'protein' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💪 Protein
            </button>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-white/10 pb-2">
          {days7Data.map((d, idx) => {
            const val = d[chartTab];
            const pct = Math.max(4, Math.round((val / chartMax) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">{val > 0 ? val : ''}</span>
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${chartColors[chartTab]}`}
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[11px] font-bold text-slate-400">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Foods Frequency */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2 font-outfit">
          <Award className="w-5 h-5 text-amber-400" />
          <span>⭐ Món Ăn Xuất Hiện Nhiêu Nhất</span>
        </h3>

        {topFoods.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có đủ dữ liệu bữa ăn để thống kê.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topFoods.map(([food, count], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-amber-400 text-xs w-5">{idx + 1}.</span>
                  <span className="text-slate-200 font-medium truncate">{food}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                  {count} lần
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
