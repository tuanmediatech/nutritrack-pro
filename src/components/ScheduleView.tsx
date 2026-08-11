import React, { useState } from 'react';
import { MealOption } from '../types';
import { Clock, Target, Trash2, RotateCcw, Edit3, Plus, Save, X, Check } from 'lucide-react';

interface ScheduleViewProps {
  mealSchedule: MealOption[];
  onDeleteMealSlot?: (id: string) => void;
  onResetSchedule?: () => void;
  onUpdateMealSlot?: (updated: MealOption) => void;
  onAddMealSlot?: (newSlot: MealOption) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  mealSchedule,
  onDeleteMealSlot,
  onResetSchedule,
  onUpdateMealSlot,
  onAddMealSlot,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MealOption>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState<Partial<MealOption>>({
    icon: '⏰',
    time: '08:00',
    displayTime: '8h00–8h30',
    name: 'Bữa ăn mới',
    category: 'morning',
    goal: 'Bổ sung năng lượng',
    options: ['Lựa chọn 1', 'Lựa chọn 2'],
  });

  const categoryLabels: Record<string, string> = {
    morning: 'Buổi Sáng',
    noon: 'Buổi Trưa',
    afternoon: 'Buổi Chiều',
    evening: 'Buổi Tối',
  };

  const categoryBadges: Record<string, string> = {
    morning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    noon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    afternoon: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    evening: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const handleStartEdit = (item: MealOption) => {
    setEditingId(item.id);
    setEditForm({
      ...item,
      options: item.options ? [...item.options] : [],
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = (id: string) => {
    if (!onUpdateMealSlot) return;
    const timeVal = editForm.displayTime || editForm.time || '08:00';
    const updatedItem: MealOption = {
      id,
      time: editForm.time || '08:00',
      displayTime: timeVal,
      name: editForm.name || 'Hoạt động',
      category: (editForm.category as any) || 'morning',
      icon: editForm.icon || '⏰',
      goal: editForm.goal || '',
      options: (editForm.options || []).filter(o => o.trim() !== ''),
    };
    onUpdateMealSlot(updatedItem);
    setEditingId(null);
    setEditForm({});
  };

  const handleOptionChange = (idx: number, val: string) => {
    const opts = [...(editForm.options || [])];
    opts[idx] = val;
    setEditForm({ ...editForm, options: opts });
  };

  const handleAddOption = () => {
    setEditForm({
      ...editForm,
      options: [...(editForm.options || []), ''],
    });
  };

  const handleRemoveOption = (idx: number) => {
    const opts = (editForm.options || []).filter((_, i) => i !== idx);
    setEditForm({ ...editForm, options: opts });
  };

  const handleSaveNewSlot = () => {
    if (!onAddMealSlot) return;
    const newId = `slot_${Date.now()}`;
    const newItem: MealOption = {
      id: newId,
      time: newSlotForm.time || '08:00',
      displayTime: newSlotForm.displayTime || newSlotForm.time || '8h00',
      name: newSlotForm.name || 'Hoạt động mới',
      category: (newSlotForm.category as any) || 'morning',
      icon: newSlotForm.icon || '⏰',
      goal: newSlotForm.goal || '',
      options: (newSlotForm.options || []).filter(o => o.trim() !== ''),
    };
    onAddMealSlot(newItem);
    setIsAdding(false);
    setNewSlotForm({
      icon: '⏰',
      time: '08:00',
      displayTime: '8h00–8h30',
      name: 'Bữa ăn mới',
      category: 'morning',
      goal: 'Bổ sung năng lượng',
      options: ['Lựa chọn 1'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span>Lịch Sinh Hoạt & Khung Giờ</span>
          </h1>
          <p className="page-subtitle text-sm text-slate-400 mt-1">
            Chỉnh sửa trực tiếp khung giờ, mục tiêu và danh sách xoay vòng theo nhu cầu của bạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAddMealSlot && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm khung giờ mới</span>
            </button>
          )}

          {onResetSchedule && (
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn khôi phục lịch sinh hoạt về mặc định?')) {
                  onResetSchedule();
                }
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
              title="Khôi phục lịch sinh hoạt ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Khôi phục lịch gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Form thêm mốc sinh hoạt mới */}
      {isAdding && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-emerald-400 text-base flex items-center gap-2">
              <Plus className="w-4 h-4" /> Thêm mốc sinh hoạt / Khung giờ mới
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Khung giờ hiển thị</label>
              <input
                type="text"
                value={newSlotForm.displayTime || ''}
                onChange={e => setNewSlotForm({ ...newSlotForm, displayTime: e.target.value })}
                placeholder="Ví dụ: 6h15–6h45 hoặc 09:30"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tên hoạt động / Bữa ăn</label>
              <input
                type="text"
                value={newSlotForm.name || ''}
                onChange={e => setNewSlotForm({ ...newSlotForm, name: e.target.value })}
                placeholder="Ví dụ: Ăn sáng chính"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Phân loại buổi</label>
              <select
                value={newSlotForm.category || 'morning'}
                onChange={e => setNewSlotForm({ ...newSlotForm, category: e.target.value as any })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
              >
                <option value="morning">Buổi Sáng</option>
                <option value="noon">Buổi Trưa</option>
                <option value="afternoon">Buổi Chiều</option>
                <option value="evening">Buổi Tối</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Biểu tượng (Icon)</label>
              <input
                type="text"
                value={newSlotForm.icon || '⏰'}
                onChange={e => setNewSlotForm({ ...newSlotForm, icon: e.target.value })}
                placeholder="Ví dụ: 🌅, 🏸, 🍚"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Mục tiêu ngắn</label>
              <input
                type="text"
                value={newSlotForm.goal || ''}
                onChange={e => setNewSlotForm({ ...newSlotForm, goal: e.target.value })}
                placeholder="Mục tiêu của khung giờ..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveNewSlot}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20"
            >
              Lưu mốc sinh hoạt
            </button>
          </div>
        </div>
      )}

      {/* Grid danh sách các mốc sinh hoạt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mealSchedule.map(item => {
          const isEditing = editingId === item.id;

          if (isEditing) {
            return (
              <div
                key={item.id}
                className="glass-card p-5 rounded-2xl border-2 border-emerald-500/50 bg-slate-900/95 space-y-3 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ✏️ Sửa mốc sinh hoạt
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      title="Lưu"
                    >
                      <Check className="w-3.5 h-3.5" /> Lưu
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                      title="Hủy"
                    >
                      Hủy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Icon</label>
                    <input
                      type="text"
                      value={editForm.icon || ''}
                      onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-400 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Khung giờ</label>
                    <input
                      type="text"
                      value={editForm.displayTime || editForm.time || ''}
                      onChange={e => setEditForm({ ...editForm, displayTime: e.target.value, time: e.target.value })}
                      placeholder="6h15–6h45"
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tên hoạt động</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:border-emerald-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phân loại</label>
                    <select
                      value={editForm.category || 'morning'}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-emerald-400 outline-none"
                    >
                      <option value="morning">Sáng</option>
                      <option value="noon">Trưa</option>
                      <option value="afternoon">Chiều</option>
                      <option value="evening">Tối</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mục tiêu ngắn</label>
                  <input
                    type="text"
                    value={editForm.goal || ''}
                    onChange={e => setEditForm({ ...editForm, goal: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-400 outline-none"
                  />
                </div>

                {/* Sửa Lựa chọn xoay vòng */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Lựa chọn xoay vòng:
                    </span>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Thêm món
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {(editForm.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={opt}
                          onChange={e => handleOptionChange(idx, e.target.value)}
                          placeholder={`Lựa chọn ${idx + 1}`}
                          className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Lưu thay đổi
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="glass-card p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all space-y-3 relative group bg-slate-900/60 hover:bg-slate-900/80"
            >
              {/* Header card */}
              <div className="flex items-center justify-between">
                <span
                  onClick={() => handleStartEdit(item)}
                  className="font-outfit font-extrabold text-xl text-emerald-400 flex items-center gap-2 cursor-pointer hover:underline"
                  title="Nhấn để sửa trực tiếp khung giờ"
                >
                  <span>{item.icon}</span>
                  <span>{item.displayTime || item.time}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                      categoryBadges[item.category] || 'bg-slate-800 text-slate-300 border-white/10'
                    }`}
                  >
                    {categoryLabels[item.category] || 'Bữa ăn'}
                  </span>

                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                    title="Sửa trực tiếp mốc sinh hoạt này"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {onDeleteMealSlot && mealSchedule.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi lịch?`)) {
                          onDeleteMealSlot(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Xóa mốc này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Nội dung card */}
              <div onClick={() => handleStartEdit(item)} className="cursor-pointer group-hover:opacity-95">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
                  <span>{item.name}</span>
                </h3>
                {item.goal && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Mục tiêu: {item.goal}</span>
                  </p>
                )}
              </div>

              {/* Lựa chọn xoay vòng */}
              {item.options && item.options.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Lựa chọn xoay vòng:
                  </span>
                  <div className="space-y-1">
                    {item.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5 flex items-start gap-2 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-emerald-400 text-xs">•</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
