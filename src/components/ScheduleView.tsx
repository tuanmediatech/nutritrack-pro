import React from 'react';
import { MealOption } from '../types';
import { Clock, Target, Calendar, Trash2, RotateCcw } from 'lucide-react';

interface ScheduleViewProps {
  mealSchedule: MealOption[];
  onDeleteMealSlot?: (id: string) => void;
  onResetSchedule?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  mealSchedule,
  onDeleteMealSlot,
  onResetSchedule,
}) => {
  const categoryLabels = {
    morning: ' Buổi Sáng',
    noon: ' Buổi Trưa',
    afternoon: ' Buổi Chiều',
    evening: ' Buổi Tối',
  };

  const categoryBadges = {
    morning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    noon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    afternoon: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    evening: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span> Lịch Sinh Hoạt & Khung Giờ</span>
          </h1>
          <p className="page-subtitle text-sm text-slate-400 mt-1">
            Lịch cố định giúp duy trì năng lượng, hỗ trợ tiêu hóa và phục hồi thể lực tốt nhất
          </p>
        </div>

        {onResetSchedule && (
          <button
            onClick={onResetSchedule}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Khôi phục lịch gốc</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mealSchedule.map(item => (
          <div
            key={item.id}
            className="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="font-outfit font-extrabold text-xl text-emerald-400 flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.displayTime || item.time}</span>
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                    categoryBadges[item.category] || 'bg-slate-800 text-slate-300 border-white/10'
                  }`}
                >
                  {categoryLabels[item.category] || 'Bữa ăn'}
                </span>

                {onDeleteMealSlot && mealSchedule.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi lịch?`)) {
                        onDeleteMealSlot(item.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Xóa mốc này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Mục tiêu: {item.goal}</span>
              </p>
            </div>

            {item.options && item.options.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lựa chọn xoay vòng:
                </span>
                <div className="space-y-1">
                  {item.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 text-xs">•</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
