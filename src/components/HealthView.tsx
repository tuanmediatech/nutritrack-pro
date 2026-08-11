import React, { useState } from 'react';
import { HealthRecord, SymptomConsultation } from '../types';
import { HeartPulse, Plus, Stethoscope, ExternalLink, Trash2, Calendar, AlertTriangle } from 'lucide-react';

interface HealthViewProps {
  healthRecords: HealthRecord[];
  onSaveHealthRecord: (record: Omit<HealthRecord, 'id'> & { id?: string }) => void;
  onDeleteHealthRecord: (id: string) => void;
}

export const HealthView: React.FC<HealthViewProps> = ({
  healthRecords,
  onSaveHealthRecord,
  onDeleteHealthRecord,
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [checkupDate, setCheckupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bloodPressure, setBloodPressure] = useState<string>('120/80 mmHg');
  const [glucose, setGlucose] = useState<number>(5.6);
  const [cholesterol, setCholesterol] = useState<number>(4.8);
  const [uricAcid, setUricAcid] = useState<number>(380);
  const [liverEnzymes, setLiverEnzymes] = useState<string>('AST 24 / ALT 28 U/L');
  const [conclusion, setConclusion] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Symptom Consult State
  const [symptomInput, setSymptomInput] = useState<string>('');
  const [loadingConsult, setLoadingConsult] = useState<boolean>(false);
  const [consultResult, setConsultResult] = useState<SymptomConsultation | null>(null);

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkupDate || !conclusion.trim()) return;

    onSaveHealthRecord({
      checkupDate,
      bloodPressure,
      glucose,
      cholesterol,
      uricAcid,
      liverEnzymes,
      conclusion: conclusion.trim(),
      notes: notes.trim(),
    });

    setShowForm(false);
    setConclusion('');
    setNotes('');
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setLoadingConsult(true);
    try {
      const res = await fetch('/api/ai/consult-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomInput.trim() }),
      });
      const data = await res.json();
      setConsultResult(data);
    } catch (err) {
      console.error('Failed to consult AI health:', err);
    } finally {
      setLoadingConsult(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-400" />
          <span>Theo Dõi Sức Khỏe & Tư Vấn Y Khoa</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Lưu trữ kết quả khám sức khỏe định kỳ & Tra cứu tư vấn triệu chứng y khoa
        </p>
      </div>

      {/* AI Symptom Consult Section */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-outfit">Tư Vấn & Tra Cứu Triệu Chứng Y Khoa</h3>
        </div>

        <form onSubmit={handleConsultSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={symptomInput}
              onChange={e => setSymptomInput(e.target.value)}
              placeholder="VD: Mỏi cơ gối sau dạy Pickleball, Đau dạ dày khi đói, Chóng mặt..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loadingConsult || !symptomInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition-all shrink-0 disabled:opacity-50"
            >
              {loadingConsult ? 'Đang tra cứu...' : 'Gửi Tư Vấn'}
            </button>
          </div>
        </form>

        {consultResult && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 font-outfit">{consultResult.symptomName}</h4>

            <div className="space-y-2 text-xs text-slate-200">
              <p>
                <strong className="text-slate-300">Phân tích:</strong> {consultResult.assessment}
              </p>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-white/5">
                <strong className="text-emerald-400 block mb-1">📋 Khuyên dùng:</strong>
                <p className="whitespace-pre-line text-slate-300">{consultResult.recommendations}</p>
              </div>

              {consultResult.warnings && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-300">
                  <span className="font-bold flex items-center gap-1 mb-1 text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dấu hiệu nguy hiểm cần lưu ý:</span>
                  </span>
                  <p>{consultResult.warnings}</p>
                </div>
              )}

              {consultResult.references && consultResult.references.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Tài liệu tham khảo uy tín:</span>
                  <div className="flex flex-wrap gap-2">
                    {consultResult.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                      >
                        <span>{ref.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Annual Checkup Records Header */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-outfit">Hồ Sơ Khám Bệnh Định Kỳ</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showForm ? 'Đóng form' : 'Thêm hồ sơ khám'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleRecordSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày khám</label>
                <input
                  type="date"
                  value={checkupDate}
                  onChange={e => setCheckupDate(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Huyết áp</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={e => setBloodPressure(e.target.value)}
                  placeholder="120/80 mmHg"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Đường huyết (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={glucose}
                  onChange={e => setGlucose(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cholesterol (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cholesterol}
                  onChange={e => setCholesterol(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Acid Uric (umol/L)</label>
                <input
                  type="number"
                  value={uricAcid}
                  onChange={e => setUricAcid(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Men gan (AST/ALT)</label>
                <input
                  type="text"
                  value={liverEnzymes}
                  onChange={e => setLiverEnzymes(e.target.value)}
                  placeholder="AST 24 / ALT 28 U/L"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kết luận bác sĩ *</label>
              <textarea
                value={conclusion}
                onChange={e => setConclusion(e.target.value)}
                rows={2}
                placeholder="VD: Các chỉ số ổn định, duy trì chế độ sinh hoạt thể thao..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="btn-primary py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Lưu Hồ Sơ Khám
            </button>
          </form>
        )}

        {/* List of Records */}
        <div className="space-y-3">
          {healthRecords.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có kết quả khám sức khỏe nào.</p>
          ) : (
            healthRecords.map(r => (
              <div key={r.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ngày khám: {r.checkupDate}</span>
                  </span>
                  <button
                    onClick={() => onDeleteHealthRecord(r.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                    title="Xóa hồ sơ khám này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Huyết áp</span>
                    <span className="font-semibold text-white">{r.bloodPressure || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Đường huyết</span>
                    <span className="font-semibold text-white">{r.glucose ? `${r.glucose} mmol/L` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cholesterol</span>
                    <span className="font-semibold text-white">{r.cholesterol ? `${r.cholesterol} mmol/L` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Acid Uric</span>
                    <span className="font-semibold text-white">{r.uricAcid ? `${r.uricAcid} umol/L` : '—'}</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5 text-xs">
                  <span className="text-emerald-400 font-bold block mb-0.5">Kết luận:</span>
                  <p className="text-slate-200">{r.conclusion}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
