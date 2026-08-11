import React, { useState } from 'react';
import { LogEntry } from '../types';
import { formatDate } from '../utils/storage';
import { FileText, Download, Trash2, Calendar, Filter, Plus, Utensils, Check } from 'lucide-react';

interface LogViewProps {
  logs: LogEntry[];
  onDeleteLog: (id: string) => void;
  onAddLog?: (entryData: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

export const LogView: React.FC<LogViewProps> = ({ logs, onDeleteLog, onAddLog }) => {
  const [filterDate, setFilterDate] = useState<string>('');

  // Form state for adding meal
  const [food, setFood] = useState<string>('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'water'>('breakfast');
  const [rice, setRice] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [feeling, setFeeling] = useState<'good' | 'ok' | 'tired'>('good');
  const [time, setTime] = useState<string>(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );

  const handleSubmitMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!food.trim()) return;

    if (onAddLog) {
      onAddLog({
        date: new Date().toISOString().split('T')[0],
        time,
        meal_type: mealType,
        food: food.trim(),
        rice,
        water,
        feeling,
        protein: 0,
        calories: 0,
      });
    }

    setFood('');
    setRice(0);
    setWater(0);
  };

  const filteredLogs = logs.filter(l => !filterDate || l.date === filterDate);

  const handleExportTxt = () => {
    if (filteredLogs.length === 0) return;
    let txt = `NUTRITRACK PRO - NHẬT KÝ DINH DƯỠNG\n`;
    txt += `Ngày xuất: ${new Date().toLocaleString()}\n`;
    txt += `===============================================\n\n`;

    filteredLogs.forEach(l => {
      txt += `[${formatDate(l.date)} - ${l.time}] Bữa: ${l.meal_type}\n`;
      txt += `- Thực phẩm: ${l.food}\n`;
      if (l.rice > 0) txt += `- Cơm: ${l.rice} chén\n`;
      if (l.protein > 0) txt += `- Protein: ${l.protein}g\n`;
      if (l.calories > 0) txt += `- Calories: ${l.calories} kcal\n`;
      txt += `- Cảm giác: ${l.feeling}\n`;
      txt += `-----------------------------------------------\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nutritrack_logs_${filterDate || 'all'}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Nhật Ký Ăn Uống & Sinh Hoạt</span>
          </h1>
          <p className="page-subtitle text-sm text-slate-400 mt-1">
            Lịch sử đầy đủ các bữa ăn và thời gian ghi nhận
          </p>
        </div>

        <button
          onClick={handleExportTxt}
          disabled={filteredLogs.length === 0}
          className="btn-secondary px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Xuất File .txt</span>
        </button>
      </div>

      {/* Quick Meal Logging Form */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Utensils className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-outfit">Ghi Nhanh Bữa Ăn Mới</h3>
        </div>

        <form onSubmit={handleSubmitMeal} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Món ăn / Sữa / Thực phẩm</label>
              <input
                type="text"
                value={food}
                onChange={e => setFood(e.target.value)}
                placeholder="VD: 1 tô phở bò + 1 bịch Vinamilk 220ml"
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phân loại bữa</label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as any)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="breakfast">🌅 Bữa Sáng</option>
                <option value="lunch">☀️ Bữa Trưa</option>
                <option value="dinner">🌙 Bữa Tối</option>
                <option value="snack">🥛 Bữa Phụ / Sữa</option>
                <option value="water">💧 Nước lọc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Giờ ăn</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Số chén cơm (nếu có)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={rice}
                onChange={e => setRice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lượng nước (ml)</label>
              <input
                type="number"
                step="50"
                min="0"
                value={water}
                onChange={e => setWater(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cảm giác cơ thể</label>
              <select
                value={feeling}
                onChange={e => setFeeling(e.target.value as any)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="good">😊 Ngon miệng / Tốt</option>
                <option value="ok">😐 Bình thường</option>
                <option value="tired">😴 Mệt / No căng</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!food.trim()}
              className="btn-primary px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Lưu Vào Nhật Ký Ăn Uống</span>
            </button>
          </div>
        </form>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Lọc theo ngày:</span>
        </span>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white"
          >
            Xem tất cả
          </button>
        )}
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-500 mb-2" />
            <p className="font-semibold text-sm">Không có nhật ký ăn uống nào {filterDate ? `ngày ${formatDate(filterDate)}` : ''}.</p>
            <p className="text-xs text-slate-500">Hãy ghi bữa ăn mới từ trang Dashboard!</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="glass-card p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-outfit font-extrabold text-sm text-emerald-400">{log.time}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                    {formatDate(log.date)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    {log.meal_type}
                  </span>
                </div>

                <p className="text-sm font-semibold text-white">{log.food}</p>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {log.rice > 0 && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      🍚 {log.rice} chén cơm
                    </span>
                  )}
                  {log.protein > 0 && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      💪 {log.protein}g đạm
                    </span>
                  )}
                  {log.calories > 0 && (
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                      🔥 {log.calories} kcal
                    </span>
                  )}
                  {log.feeling && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Cảm giác: {log.feeling === 'good' ? '😊 Tốt' : log.feeling === 'ok' ? '😐 Bình thường' : '😴 Mệt'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteLog(log.id)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all self-end sm:self-center"
                title="Xóa bản ghi nhật ký này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
