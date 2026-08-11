import React from 'react';
import { ChecklistItem, ChecklistState } from '../types';
import { CheckSquare, RotateCcw, Check, Sparkles, Utensils, Droplets, Dumbbell, Info } from 'lucide-react';

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

  // Categorize checklist items into 3 clear modules matching Email notifications
  const mealItems = checklistItems.filter(item => {
    const text = item.text.toLowerCase();
    return text.includes('ăn') || text.includes('sữa') || text.includes('bữa') || text.includes('cơm');
  });

  const waterItems = checklistItems.filter(item => {
    const text = item.text.toLowerCase();
    return text.includes('nước') || text.includes('uống') || text.includes('lít');
  });

  const sportItems = checklistItems.filter(item => {
    const text = item.text.toLowerCase();
    return (
      text.includes('thể thao') ||
      text.includes('pickleball') ||
      text.includes('bóng bàn') ||
      text.includes('nghỉ') ||
      text.includes('ngủ') ||
      text.includes('không dùng')
    );
  });

  // Catch any remaining items
  const otherItems = checklistItems.filter(
    item => !mealItems.includes(item) && !waterItems.includes(item) && !sportItems.includes(item)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Bảng Kiểm Thói Quen Hằng Ngày</span>
          </h1>
          <p className="page-subtitle text-sm text-slate-400 mt-1">
            Được phân hệ rõ ràng để tích chọn công việc ngay khi nhận tin nhắn / email nhắc nhở
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

      {/* Action Guide Banner for Email Notifications */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-blue-500/15 to-purple-500/15 border border-white/15 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-200 leading-relaxed">
          <span className="font-bold text-white block text-sm mb-0.5">📩 Quy trình tích chọn nhanh từ Thông Báo & Email:</span>
          1️⃣ <b>Khi nhận mail nhắc Ăn Uống / Sữa:</b> Mở app ➔ Tích vào danh sách <span className="text-emerald-400 font-bold">1. Bữa Ăn & Sữa</span>.<br />
          2️⃣ <b>Khi nhận mail nhắc Uống Nước:</b> Mở app ➔ Tích vào danh sách <span className="text-blue-400 font-bold">2. Uống Nước & Điện Giải</span>.<br />
          3️⃣ <b>Khi nhận mail nhắc Tập Luyện 17h:</b> Mở app ➔ Tích vào danh sách <span className="text-amber-400 font-bold">3. Tập Luyện & Thể Thao</span>.
        </div>
      </div>

      {/* Progress Ring Gauge Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
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
            <span>Tiến độ thói quen hôm nay</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mỗi lần nhận email hay tin nhắn nhắc nhở và mở app tích chọn, cơ thể anh sẽ được rèn luyện kỷ luật dinh dưỡng thể thao hoàn hảo nhất!
          </p>
        </div>
      </div>

      {/* MODULE 1: BỮA ĂN & SỮA */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">1. Phân Hệ Bữa Ăn & Sữa (Email Nhắc Ăn Uống)</h3>
            <p className="text-xs text-slate-400">Tích chọn ngay sau khi anh hoàn thành bữa ăn hoặc uống 1 bịch Vinamilk</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mealItems.map(item => renderCheckItem(item))}
        </div>
      </div>

      {/* MODULE 2: UỐNG NƯỚC & ĐIỆN GIẢI */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">2. Phân Hệ Uống Nước & Điện Giải (Email Nhắc Uống Nước)</h3>
            <p className="text-xs text-slate-400">Tích chọn khi hoàn thành ca uống 250-300ml nước lọc trong ngày</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {waterItems.map(item => renderCheckItem(item))}
        </div>
      </div>

      {/* MODULE 3: TẬP LUYỆN & NGHỈ NGƠI */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">3. Phân Hệ Tập Luyện & Thể Thao (Email Nhắc Tập Luyện)</h3>
            <p className="text-xs text-slate-400">Tích chọn sau ca bóng bàn / pickleball chiều 17h00 hoặc ngủ phục hồi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sportItems.map(item => renderCheckItem(item))}
          {otherItems.map(item => renderCheckItem(item))}
        </div>
      </div>
    </div>
  );

  function renderCheckItem(item: ChecklistItem) {
    const isDone = !!todayChecks[item.id];
    return (
      <div
        key={item.id}
        onClick={() => onToggleCheck(item.id)}
        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
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
          <span className={`text-xs font-semibold block ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
            {item.icon} {item.text}
          </span>
        </div>

        <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
          {item.time}
        </span>
      </div>
    );
  }
};
