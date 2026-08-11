import React, { useState } from 'react';
import { WeightEntry, UserProfile } from '../types';
import { formatDate } from '../utils/storage';
import { Scale, Plus, Trash2, Calendar, Target, CheckCircle2 } from 'lucide-react';

interface WeightViewProps {
  userProfile: UserProfile;
  weights: WeightEntry[];
  onSaveWeight: (entry: WeightEntry) => void;
  onDeleteWeight: (date: string) => void;
}

export const WeightView: React.FC<WeightViewProps> = ({
  userProfile,
  weights,
  onSaveWeight,
  onDeleteWeight,
}) => {
  const isGain = userProfile.profileType === 'tang_can';
  const startW = userProfile.startWeight;
  const targetW = userProfile.targetWeight;

  const currentW = weights.length ? weights[weights.length - 1].weight : startW;

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weightInput, setWeightInput] = useState<number>(currentW);
  const [note, setNote] = useState<string>('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || isNaN(weightInput) || weightInput < 30) return;
    onSaveWeight({
      date,
      weight: weightInput,
      note: note.trim(),
    });
    setNote('');
  };

  const sortedWeights = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Statistics
  const diffGained = currentW - startW;
  const remaining = isGain ? Math.max(0, targetW - currentW) : Math.max(0, currentW - targetW);

  // SVG Chart Calculation
  const renderSvgChart = () => {
    if (sortedWeights.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-slate-400">
          Cần ít nhất 2 bản ghi cân nặng để vẽ biểu đồ xu hướng.
        </div>
      );
    }

    const minW = Math.min(...sortedWeights.map(w => w.weight)) - 0.5;
    const maxW = Math.max(...sortedWeights.map(w => w.weight), targetW) + 0.5;
    const height = 180;
    const width = 600;
    const pad = { top: 20, right: 30, bottom: 30, left: 40 };

    const cW = width - pad.left - pad.right;
    const cH = height - pad.top - pad.bottom;

    const getX = (i: number) => pad.left + (i / (sortedWeights.length - 1)) * cW;
    const getY = (w: number) => pad.top + cH - ((w - minW) / (maxW - minW)) * cH;

    const points = sortedWeights.map((w, i) => `${getX(i)},${getY(w.weight)}`).join(' ');
    const targetY = getY(targetW);

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          {/* Target Line */}
          <line
            x1={pad.left}
            y1={targetY}
            x2={width - pad.right}
            y2={targetY}
            stroke="#10b981"
            strokeDasharray="4,4"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <text x={width - pad.right - 60} y={targetY - 5} fill="#10b981" fontSize="10" fontWeight="bold">
            Mục tiêu: {targetW}kg
          </text>

          {/* Area Fill */}
          <polygon
            points={`${getX(0)},${height - pad.bottom} ${points} ${getX(sortedWeights.length - 1)},${height - pad.bottom}`}
            fill="url(#weightGradient)"
            opacity="0.25"
          />

          {/* Gradient */}
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Line Path */}
          <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />

          {/* Point Dots */}
          {sortedWeights.map((w, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(w.weight)} r="4" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
              <text x={getX(i)} y={getY(w.weight) - 8} fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                {w.weight}kg
              </text>
              <text x={getX(i)} y={height - 10} fill="#94a3b8" fontSize="9" textAnchor="middle">
                {formatDate(w.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <Scale className="w-6 h-6 text-emerald-400" />
          <span>Theo Dõi Cân Nặng & Lộ Trình</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          {startW}kg → {targetW}kg | Chế độ {isGain ? 'Tăng Cân Sạch & Tăng Cơ' : 'Giảm Mỡ & Thâm Hụt Calo'}
        </p>
      </div>

      {/* Entry Form Card */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-outfit">Ghi Cân Nặng Mới</h3>
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày cân</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cân nặng (kg)</label>
            <div className="flex items-center bg-slate-800 border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setWeightInput(Math.max(30, parseFloat((weightInput - 0.1).toFixed(1))))}
                className="px-3 py-2 text-emerald-400 font-bold hover:bg-white/10"
              >
                -
              </button>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={e => setWeightInput(parseFloat(e.target.value) || 0)}
                className="w-full text-center bg-transparent font-bold text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setWeightInput(parseFloat((weightInput + 0.1).toFixed(1)))}
                className="px-3 py-2 text-emerald-400 font-bold hover:bg-white/10"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ghi chú (sáng sau vệ sinh...)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="VD: Nhẹ nhõm, sau khi tập"
              className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="btn-primary py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Lưu Cân Nặng</span>
          </button>
        </form>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Cân ban đầu</span>
          <span className="font-outfit font-extrabold text-2xl text-white">{startW.toFixed(1)}</span>
          <span className="text-xs text-slate-500"> kg</span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Cân hiện tại</span>
          <span className="font-outfit font-extrabold text-2xl text-emerald-400">{currentW.toFixed(1)}</span>
          <span className="text-xs text-slate-500"> kg</span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">{isGain ? 'Đã tăng' : 'Đã giảm'}</span>
          <span className="font-outfit font-extrabold text-2xl text-cyan-400">
            {diffGained >= 0 ? `+${diffGained.toFixed(1)}` : diffGained.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500"> kg</span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Còn cần {isGain ? 'tăng' : 'giảm'}</span>
          <span className="font-outfit font-extrabold text-2xl text-amber-400">{remaining.toFixed(1)}</span>
          <span className="text-xs text-slate-500"> kg</span>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <span>🗺️ Lộ Trình Mục Tiêu</span>
        </h3>

        <div className="space-y-3 relative pl-6 border-l-2 border-emerald-500/30 ml-2">
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            <p className="text-xs font-bold text-white">2 Tuần Đầu: {isGain ? '+0.3 – 0.7kg' : '-0.5 – 1.0kg'}</p>
            <p className="text-xs text-slate-400">Kiểm tra khả năng hấp thu, sức tập, giấc ngủ.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            <p className="text-xs font-bold text-white">1 Tháng: {isGain ? '+0.5 – 1.0kg' : '-1.5 – 2.0kg'}</p>
            <p className="text-xs text-slate-400">Không cần vội vã, duy trì kỷ luật dinh dưỡng hằng ngày.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            <p className="text-xs font-bold text-white">3 Tháng: {isGain ? '+2.0 – 3.0kg' : '-3.0 – 5.0kg'}</p>
            <p className="text-xs text-slate-400">Thay đổi rõ rệt vóc dáng, người đầy đặn/săn chắc hơn.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-lg shadow-emerald-500/50" />
            <p className="text-xs font-bold text-emerald-400">🎯 Đạt Mốc Mục Tiêu: {targetW}kg</p>
            <p className="text-xs text-slate-400">Giữ cân ổn định, điều chỉnh nếu tăng mỡ bụng.</p>
          </div>
        </div>
      </div>

      {/* Weight Chart & History Table */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-outfit">Biểu Đồ & Lịch Sử Cân Nặng</h3>
        {renderSvgChart()}

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="py-2.5 px-3">Ngày</th>
                <th className="py-2.5 px-3">Cân nặng</th>
                <th className="py-2.5 px-3">Ghi chú</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...sortedWeights].reverse().map((item, idx) => (
                <tr key={idx} className="text-slate-200 hover:bg-white/5">
                  <td className="py-2.5 px-3 font-semibold">{formatDate(item.date)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{item.weight.toFixed(1)} kg</td>
                  <td className="py-2.5 px-3 text-slate-400">{item.note || '—'}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteWeight(item.date)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Xóa bản ghi cân nặng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
