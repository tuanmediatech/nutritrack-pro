import React, { useState } from 'react';
import {
  MealOption,
  ChecklistItem,
  UserProfile,
  AISchedule,
  ProfileType
} from '../types';
import { exportICSFile } from '../utils/storage';
import {
  Settings,
  User,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  RotateCcw,
  Bell,
  CheckSquare
} from 'lucide-react';

interface SettingsViewProps {
  userProfile: UserProfile;
  mealSchedule: MealOption[];
  checklistItems: ChecklistItem[];
  aiSchedules: AISchedule[];
  activeScheduleId?: string;
  reminderAdvance: number;
  waterReminderEnabled: boolean;
  reminderEnabled: boolean;
  onSaveProfile: (profile: UserProfile) => void;
  onSaveMealSchedule: (meals: MealOption[]) => void;
  onSaveChecklistItems: (items: ChecklistItem[]) => void;
  onActivateSchedule: (scheduleId?: string) => void;
  onAddAISchedule: (schedule: AISchedule) => void;
  onDeleteAISchedule: (id: string) => void;
  onUpdateReminders: (advance: number, waterRem: boolean, remEnabled: boolean) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  mealSchedule,
  checklistItems,
  aiSchedules,
  activeScheduleId,
  reminderAdvance,
  waterReminderEnabled,
  reminderEnabled,
  onSaveProfile,
  onSaveMealSchedule,
  onSaveChecklistItems,
  onActivateSchedule,
  onAddAISchedule,
  onDeleteAISchedule,
  onUpdateReminders,
  onExportBackup,
  onImportBackup,
  onResetAllData,
}) => {
  // Profile form state
  const [name, setName] = useState<string>(userProfile.name);
  const [height, setHeight] = useState<number>(userProfile.height);
  const [startWeight, setStartWeight] = useState<number>(userProfile.startWeight);
  const [targetWeight, setTargetWeight] = useState<number>(userProfile.targetWeight);
  const [startDate, setStartDate] = useState<string>(userProfile.startDate);
  const [profileType, setProfileType] = useState<ProfileType>(userProfile.profileType);

  // Meal slot editing state
  const [editingMealSlot, setEditingMealSlot] = useState<MealOption | null>(null);
  const [slotTime, setSlotTime] = useState<string>('08:00');
  const [slotName, setSlotName] = useState<string>('');
  const [slotGoal, setSlotGoal] = useState<string>('');

  // AI Generator prompt input state
  const [aiHabitsInput, setAiHabitsInput] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      height,
      startWeight,
      targetWeight,
      startDate,
      glucose: userProfile.glucose,
      profileType,
    });
  };

  const handleAddMealSlot = () => {
    if (!slotName.trim()) return;
    const newSlot: MealOption = {
      id: `custom_${Date.now()}`,
      time: slotTime,
      displayTime: slotTime,
      name: slotName.trim(),
      icon: '🍽️',
      activity: 'Khung giờ tùy chỉnh',
      goal: slotGoal.trim() || 'Cung cấp năng lượng',
      category: 'morning',
      options: ['Thực phẩm tùy chọn'],
    };

    const updated = [...mealSchedule, newSlot].sort((a, b) => a.time.localeCompare(b.time));
    onSaveMealSchedule(updated);
    setSlotName('');
    setSlotGoal('');
  };

  const handleDeleteMealSlot = (id: string) => {
    const updated = mealSchedule.filter(m => m.id !== id);
    onSaveMealSchedule(updated);
  };

  const handleGenerateAiSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiHabitsInput.trim()) return;

    setLoadingAi(true);
    setAiError('');

    try {
      const res = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habits: aiHabitsInput.trim(),
          userProfile: { name, profileType, startWeight, targetWeight },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi kết nối tạo lịch trình AI');
      }

      const newAiSchedule: AISchedule = {
        id: `ai_${Date.now()}`,
        name: data.schedule.name || 'Lịch Sinh Hoạt AI Cá Nhân',
        description: data.schedule.description || 'Được tạo bởi Gemini AI',
        createdAt: new Date().toISOString(),
        meal_schedule: data.schedule.meal_schedule || [],
        checklist: data.schedule.checklist || [],
      };

      onAddAISchedule(newAiSchedule);
      onActivateSchedule(newAiSchedule.id);
      setAiHabitsInput('');
    } catch (err: any) {
      setAiError(err.message || 'Lỗi tạo lịch trình');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Cài Đặt & AI Schedule Generator</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Tùy chỉnh thông số cá nhân, khung giờ sinh hoạt và tạo lịch trình AI cá nhân hóa
        </p>
      </div>

      {/* User Profile Form */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <User className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-outfit">Hồ Sơ Cá Nhân</h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chế độ dinh dưỡng</label>
              <select
                value={profileType}
                onChange={e => setProfileType(e.target.value as ProfileType)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="tang_can">📈 Tăng Cân Sạch & Tăng Cơ</option>
                <option value="giam_can">📉 Giảm Cân / Thâm Hụt Calo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chiều cao (cm)</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cân nặng ban đầu (kg)</label>
              <input
                type="number"
                step="0.1"
                value={startWeight}
                onChange={e => setStartWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cân nặng mục tiêu (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={e => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Hồ Sơ</span>
          </button>
        </form>
      </div>

      {/* AI Schedule Generator Section */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-outfit">AI Schedule Generator (Gemini AI)</h3>
        </div>

        <form onSubmit={handleGenerateAiSchedule} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Mô tả thói quen sinh hoạt & nhu cầu riêng biệt của bạn:
          </label>
          <textarea
            value={aiHabitsInput}
            onChange={e => setAiHabitsInput(e.target.value)}
            rows={3}
            placeholder="VD: Tôi thường dạy Pickleball lúc 5h sáng, làm văn phòng từ 8h-17h, tập gym 18h tối. Muốn có lịch ăn 6 bữa tập trung đạm..."
            className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
          />

          {aiError && <p className="text-xs text-rose-400">{aiError}</p>}

          <button
            type="submit"
            disabled={loadingAi || !aiHabitsInput.trim()}
            className="btn-primary px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingAi ? 'Đang gọi Gemini AI tạo lịch...' : 'Tạo Lịch Sinh Hoạt Mới Bằng AI'}</span>
          </button>
        </form>

        {/* AI Schedules List */}
        {aiSchedules.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/10">
            <span className="text-xs font-bold text-slate-300 block">Các lịch trình AI đã tạo:</span>
            <div className="space-y-2">
              {aiSchedules.map(sched => {
                const isActive = activeScheduleId === sched.id;
                return (
                  <div
                    key={sched.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isActive ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-white break-words overflow-hidden leading-relaxed">
                        {sched.name.replace(/\d{8,}/g, '')}
                      </h4>
                      <p className="text-[11px] text-slate-400 break-words mt-0.5">{sched.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onActivateSchedule(isActive ? undefined : sched.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        {isActive ? 'Đang dùng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => onDeleteAISchedule(sched.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Xóa lịch trình này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Custom Meal Schedule Manager */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-outfit">Danh Sách Bữa Ăn & Khung Giờ Sinh Hoạt</h3>
        </div>

        {/* Add Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tên bữa ăn</label>
            <input
              type="text"
              value={slotName}
              onChange={e => setSlotName(e.target.value)}
              placeholder="VD: Ăn xế chiều"
              className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Giờ thực hiện</label>
            <input
              type="time"
              value={slotTime}
              onChange={e => setSlotTime(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
            />
          </div>
          <button
            onClick={handleAddMealSlot}
            disabled={!slotName.trim()}
            className="btn-primary py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Bữa</span>
          </button>
        </div>

        {/* List Meal Slots */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {mealSchedule.map(m => (
            <div key={m.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-400 w-12">{m.time}</span>
                <span className="font-semibold text-white">{m.icon} {m.name}</span>
              </div>
              <button
                onClick={() => handleDeleteMealSlot(m.id)}
                className="p-1 text-slate-400 hover:text-rose-400"
                title="Xóa bữa này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & System Tools */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-outfit">Xuất / Nhập Dữ Liệu & Khôi Phục</h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportICSFile(mealSchedule)}
            className="btn-secondary px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Xuất Lịch .ics (Google/Apple Calendar)</span>
          </button>

          <button
            onClick={onExportBackup}
            className="btn-secondary px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Sao Lưu Dữ Liệu JSON</span>
          </button>

          <label className="btn-secondary px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Phục Hồi JSON</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={e => e.target.files?.[0] && onImportBackup(e.target.files[0])}
            />
          </label>
        </div>

        <div className="pt-3 border-t border-rose-500/20">
          <button
            onClick={onResetAllData}
            className="px-4 py-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Xóa Toàn Bộ Dữ Liệu & Reset Về Mặc Định</span>
          </button>
        </div>
      </div>
    </div>
  );
};
