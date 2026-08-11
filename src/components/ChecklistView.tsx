import React from 'react';
import { ChecklistItem, ChecklistState } from '../types';
import { CheckSquare, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ChecklistViewProps {
  checklistItems: ChecklistItem[];
  checklistState: ChecklistState;
  onToggleCheck: (id: string) => void;
  onResetChecklist: () => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklistItems,
  checklistState,
  onToggleCheck,
  onResetChecklist,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayChecks = checklistState[today] || {};

  const doneCount = Object.values(todayChecks).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const messages = [
    'Hãy bắt đầu ngày mới với năng lượng tích cực! 💪',
    'Tốt lắm! Tiếp tục duy trì nhé! 🌟',
    'Bạn đang làm rất tốt! Hơn nửa chặng đường rồi! 🎯',
    'Gần đến đích rồi! Cố lên! 🚀',
    'Hoàn hảo! Bạn đã hoàn thành tất cả bảng kiểm hôm nay! 🎉',
  ];

  let msg = messages[0];
  if (doneCount >= totalCount && totalCount > 0) msg = messages[4];
  else if (doneCount >= Math.round(totalCount * 0.75)) msg = messages[3];
  else if (doneCount >= Math.round(totalCount * 0.5)) msg = messages[2];
  else if (doneCount >= 1) msg = messages[1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Bảng Kiểm Thói Quen Hằng Ngày</span>
          </h1>
          <p className="page-subtitle text-sm text-slate-400 mt-1">
            Kiểm tra 10-12 nguyên tắc thói quen cốt lõi để giữ kỷ luật
          </p>
        </div>

        <button
          onClick={onResetChecklist}
          className="btn-secondary px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 text-xs font-bold flex items-center gap-2 transition-all self-start"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Reset Ngày Mới</span>
        </button>
      </div>

      {/* Progress Ring Gauge Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Circle Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" className="stroke-slate-800" strokeWidth="8" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="50"
              className="stroke-emerald-400 transition-all duration-700"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-outfit text-center">
            <span className="text-xl font-extrabold text-white">{pct}%</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {doneCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <h3 className="font-outfit font-extrabold text-lg text-white flex items-center gap-2 justify-center sm:justify-start">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{msg}</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mỗi tích chọn sẽ giúp cơ thể thiết lập nhịp sinh học đều đặn. Việc giữ kỷ luật thói quen là yếu tố tiên quyết giúp tăng cân sạch hoặc giảm mỡ hiệu quả!
          </p>
        </div>
      </div>

      {/* Checklist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checklistItems.map(item => {
          const isDone = !!todayChecks[item.id];
          return (
            <div
              key={item.id}
              onClick={() => onToggleCheck(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                    : 'border-white/20 bg-slate-800'
                }`}
              >
                {isDone && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold block ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                  {item.icon} {item.text}
                </span>
              </div>

              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
