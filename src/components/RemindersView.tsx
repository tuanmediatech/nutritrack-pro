import React, { useState } from 'react';
import { Bell, Clock, Droplets, Utensils, CheckCircle, Volume2, ShieldCheck, Play, Flame, Dumbbell } from 'lucide-react';
import { MealOption } from '../types';

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
              Tự động phát âm thanh và hiển thị thông báo báo giờ ăn, giờ uống nước & giờ chơi thể thao tập luyện.
            </p>
          </div>
          <button
            onClick={handleTestNotification}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Thử nghiệm thông báo</span>
          </button>
        </div>

        {testSuccess && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testSuccess}</span>
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

      {/* Schedule Timetable */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>Danh Sách Khung Giờ Đã Lập Lịch Nhắc Nhở</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mealSchedule.map((meal) => (
            <div
              key={meal.id}
              className="bg-slate-800/60 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{meal.icon}</span>
                <div>
                  <div className="font-bold text-white text-sm">{meal.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{meal.time}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                reminderEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {reminderEnabled ? 'Đang bật' : 'Đã tắt'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
