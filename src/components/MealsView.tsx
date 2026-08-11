import React, { useState } from 'react';
import { MealOption } from '../types';
import { Utensils, Target, Layers } from 'lucide-react';

interface MealsViewProps {
  mealSchedule: MealOption[];
}

export const MealsView: React.FC<MealsViewProps> = ({ mealSchedule }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả bữa ăn' },
    { id: 'morning', label: '☀️ Buổi Sáng' },
    { id: 'noon', label: '🌤 Buổi Trưa' },
    { id: 'afternoon', label: '🌅 Buổi Chiều' },
    { id: 'evening', label: '🌙 Buổi Tối' },
  ];

  const filtered = mealSchedule.filter(
    m => filterCategory === 'all' || m.category === filterCategory
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <Utensils className="w-6 h-6 text-emerald-400" />
          <span>Thực Đơn Gợi Ý & Xoay Vòng Món Ăn</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Lựa chọn thực phẩm đa dạng dinh dưỡng, không bị ngán và phù hợp thời gian
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === cat.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Meal Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(meal => (
          <div
            key={meal.id}
            className="glass-card p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-outfit font-extrabold text-lg text-emerald-400 flex items-center gap-2">
                <span>{meal.icon}</span>
                <span>{meal.displayTime || meal.time}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                {meal.name}
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-start gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Mục tiêu: {meal.goal}</span>
            </p>

            {meal.options && meal.options.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Các món mẫu xoay vòng:
                </span>
                <ul className="space-y-1.5">
                  {meal.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-200 bg-white/5 p-2 rounded-xl border border-white/5 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
