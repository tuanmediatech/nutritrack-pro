import React, { useState, useEffect } from 'react';
import { Bell, Clock, Droplets, Utensils, CheckCircle, Volume2, ShieldCheck, Play, Flame, Dumbbell, Mail, Loader2, AlertCircle, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import { MealOption } from '../types';

const DEFAULT_ACTIVE_IDS = ['water_07','water_09','water_10','snack_morning','water_13','water_14','water_16','snack_afternoon'];

interface RemindersViewProps {
  mealSchedule: MealOption[];
  reminderAdvance: number;
  waterReminderEnabled: boolean;
  sportReminderEnabled?: boolean;
  reminderEnabled: boolean;
  onUpdateReminders: (advance: number, waterRem: boolean, rem: boolean, sportRem?: boolean) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  mealSchedule,
  reminderAdvance,
  waterReminderEnabled,
  sportReminderEnabled = true,
  reminderEnabled,
  onUpdateReminders,
}) => {
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [catchingUp, setCatchingUp] = useState(false);
  const [emailResult, setEmailResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Per-event toggle state
  const [activeEventIds, setActiveEventIds] = useState<string[]>(DEFAULT_ACTIVE_IDS);
  const [savingToggle, setSavingToggle] = useState(false);
  const [toggleResult, setToggleResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/active-events')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.activeEventIds) setActiveEventIds(data.activeEventIds); })
      .catch(() => {});
  }, []);

  const handleToggleEvent = async (id: string) => {
    const newIds = activeEventIds.includes(id)
      ? activeEventIds.filter(x => x !== id)
      : [...activeEventIds, id];
    setActiveEventIds(newIds);
    setSavingToggle(true);
    try {
      await fetch('/api/user/active-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeEventIds: newIds }),
      });
      setToggleResult('Đã lưu!');
    } catch {
      setToggleResult('Lỗi lưu cài đặt');
    } finally {
      setSavingToggle(false);
      setTimeout(() => setToggleResult(null), 2000);
    }
  };

  const handleTestNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('NutriTrack Reminder Test 🔔', {
          body: 'Đã đến giờ nạp năng lượng! Hãy kiểm tra thực đơn của bạn.',
          icon: '/favicon.ico',
        });
        setTestSuccess('Đã gửi thông báo thử nghiệm thành công!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('NutriTrack Reminder Test 🔔', {
              body: 'Đã đến giờ nạp năng lượng! Hãy kiểm tra thực đơn của bạn.',
            });
            setTestSuccess('Đã cấp quyền và gửi thông báo thành công!');
          }
        });
      } else {
        setTestSuccess('Trình duyệt đang chặn thông báo. Vui lòng bật trong cài đặt browser.');
      }
    } else {
      setTestSuccess('Trình duyệt không hỗ trợ Web Notification API.');
    }

    setTimeout(() => setTestSuccess(null), 4000);
  };

  const handleTestEmail = async () => {
    setSendingEmail(true);
    setEmailResult(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nguyentuanqnpc@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailResult({ type: 'success', text: data.message || 'Đã gửi email thử nghiệm tới Gmail thành công!' });
      } else {
        setEmailResult({ type: 'error', text: data.error || 'Gửi email thất bại.' });
      }
    } catch (err: any) {
      setEmailResult({ type: 'error', text: 'Lỗi kết nối server: ' + err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-emerald-900/40 via-slate-900 to-blue-900/40 border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
              <Bell className="w-6 h-6 text-emerald-400" />
              <span>Nhắc Nhở Lịch Ăn, Uống Nước & Tập Luyện</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Tự động gửi thông báo Gmail (nguyentuanqnpc@gmail.com) và phát âm thanh báo giờ ăn, giờ uống nước & giờ chơi thể thao.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestEmail}
              disabled={sendingEmail}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {sendingEmail ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> : <Mail className="w-4 h-4 text-blue-400" />}
              <span>{sendingEmail ? 'Đang gửi...' : 'Gửi email thử (Gmail)'}</span>
            </button>
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Thông báo Web</span>
            </button>
          </div>
        </div>

        {testSuccess && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testSuccess}</span>
          </div>
        )}

        {emailResult && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
            emailResult.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {emailResult.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{emailResult.text}</span>
          </div>
        )}
      </div>


      {/* Global Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meal Reminders Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <span>Nhắc Nhở Bữa Ăn</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={e => onUpdateReminders(reminderAdvance, waterReminderEnabled, e.target.checked, sportReminderEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <p className="text-xs text-slate-300">
            Báo trước thời gian ăn theo khung giờ đã cài đặt.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Thời gian nhắc trước (phút):</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map(mins => (
                <button
                  key={mins}
                  onClick={() => onUpdateReminders(mins, waterReminderEnabled, reminderEnabled, sportReminderEnabled)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    reminderAdvance === mins
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                      : 'bg-slate-800/60 text-slate-400 border-white/10 hover:bg-slate-800'
                  }`}
                >
                  {mins === 0 ? 'Đúng giờ' : `${mins} phút`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Water Reminders Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span>Nhắc Nhở Uống Nước (Mỗi 60p)</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={waterReminderEnabled}
                onChange={e => onUpdateReminders(reminderAdvance, e.target.checked, reminderEnabled, sportReminderEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <p className="text-xs text-slate-300">
            Nhắc uống 200ml - 250ml nước lọc mỗi tiếng trong khung giờ sinh hoạt (07:00 - 21:00).
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Đảm bảo bạn luôn bù đủ nước cho cơ thể kể cả khi làm việc bận rộn.</span>
          </div>
        </div>

        {/* Sport / Workout Reminders Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Nhắc Lịch Tập Luyện & Thể Thao</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sportReminderEnabled}
                onChange={e => onUpdateReminders(reminderAdvance, waterReminderEnabled, reminderEnabled, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="text-xs text-slate-300">
            Báo trước 15–30 phút ca tập Bóng bàn / Pickleball chiều (17:00) để khởi động & nạp nhẹ Sữa tươi / Chuối.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Nhắc nạp 1 bịch Vinamilk + 1 chuối lúc 15h30 để sẵn sàng sung sức lúc 17h00.</span>
          </div>
        </div>
      </div>

      {/* Per-event toggle section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Tùy Chỉnh Từng Loại Nhắc Nhở Email</span>
          </h3>
          <div className="flex items-center gap-2">
            {savingToggle && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
            {toggleResult && (
              <span className="text-xs text-emerald-300 font-semibold">{toggleResult}</span>
            )}
            <span className="text-xs text-slate-400">
              {activeEventIds.length} / {mealSchedule.length} đang bật
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Bật/tắt từng mục — thay đổi lưu ngay, không cần restart app. Lịch sinh hoạt vẫn giữ nguyên.
        </p>

        {/* Group by category */}
        {(['morning', 'noon', 'afternoon', 'evening'] as const).map(cat => {
          const catItems = mealSchedule.filter(m => m.category === cat);
          if (catItems.length === 0) return null;
          const catLabel: Record<string, string> = {
            morning: '☀️ Buổi Sáng',
            noon: '🌞 Buổi Trưa',
            afternoon: '🌤️ Buổi Chiều',
            evening: '🌙 Buổi Tối',
          };
          return (
            <div key={cat} className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1">
                {catLabel[cat]}
              </div>
              <div className="space-y-2">
                {catItems.map(meal => {
                  const isActive = activeEventIds.includes(meal.id);
                  return (
                    <div
                      key={meal.id}
                      onClick={() => handleToggleEvent(meal.id)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/50'
                          : 'bg-slate-800/40 border-white/5 hover:border-white/20 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{meal.icon}</span>
                        <div>
                          <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                            {meal.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{meal.displayTime || meal.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {isActive
                          ? <ToggleRight className="w-7 h-7" />
                          : <ToggleLeft className="w-7 h-7" />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quick presets */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            onClick={async () => {
              const ids = mealSchedule.map(m => m.id);
              setActiveEventIds(ids);
              await fetch('/api/user/active-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeEventIds: ids }) });
              setToggleResult('Đã bật tất cả!');
              setTimeout(() => setToggleResult(null), 2000);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
          >
            ✅ Bật tất cả
          </button>
          <button
            onClick={async () => {
              setActiveEventIds(DEFAULT_ACTIVE_IDS);
              await fetch('/api/user/active-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeEventIds: DEFAULT_ACTIVE_IDS }) });
              setToggleResult('Đã đặt lại mặc định!');
              setTimeout(() => setToggleResult(null), 2000);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
          >
            🔄 Mặc định (nước + phụ sáng/chiều)
          </button>
          <button
            onClick={async () => {
              setActiveEventIds([]);
              await fetch('/api/user/active-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeEventIds: [] }) });
              setToggleResult('Đã tắt tất cả!');
              setTimeout(() => setToggleResult(null), 2000);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            🔕 Tắt tất cả
          </button>
        </div>
      </div>
    </div>
  );
};
