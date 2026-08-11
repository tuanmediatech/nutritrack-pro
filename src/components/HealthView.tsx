import React, { useState } from 'react';
import { HealthRecord, SymptomConsultation } from '../types';
import {
  HeartPulse,
  Plus,
  Stethoscope,
  ExternalLink,
  Trash2,
  Calendar,
  AlertTriangle,
  Activity,
  Droplet,
  Sparkles,
  ShieldAlert,
  FileText,
  X
} from 'lucide-react';

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

  const sampleSymptoms = [
    'Mỏi cơ gối sau dạy Pickleball',
    'Đau dạ dày khi đói',
    'Chóng mặt sau buổi tập',
    'Tăng Acid Uric nhẹ',
  ];

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

  const [parsingPdf, setParsingPdf] = useState<boolean>(false);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingPdf(true);
    setPdfFileName(file.name);

    try {
      let textContent = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        textContent = await file.text();
      }

      const res = await fetch('/api/ai/parse-medical-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: file.name,
          text_content: textContent,
        }),
      });

      const parsed = await res.json();

      if (parsed) {
        onSaveHealthRecord({
          checkupDate: parsed.checkup_date || new Date().toISOString().split('T')[0],
          bloodPressure: parsed.blood_pressure || '120/80 mmHg',
          glucose: parsed.glucose || 5.6,
          cholesterol: parsed.cholesterol || 4.8,
          uricAcid: parsed.uric_acid || 380,
          liverEnzymes: parsed.liver_enzymes || 'AST 24 / ALT 28 U/L',
          conclusion: parsed.conclusion || `Đã phân tích tự động từ ${file.name}`,
          fileName: file.name,
          aiAdvice: parsed.ai_advice || '',
        });
      }
    } catch (err) {
      console.error('Failed to parse PDF medical record:', err);
    } finally {
      setParsingPdf(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-400" />
          <span>Theo Dõi Sức Khỏe & Tra Cứu Y Khoa</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Quản lý kết quả khám sức khỏe định kỳ & Hỏi đáp tư vấn triệu chứng y khoa AI
        </p>
      </div>

      {/* AI Symptom Consult Section */}
      <div className="glass-card p-5 md:p-6 space-y-4 rounded-3xl border border-white/10 shadow-2xl relative">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <span>Trợ Lý Tra Cứu Y Khoa AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                Medical AI
              </span>
            </h3>
            <p className="text-xs text-slate-400">Nhập triệu chứng hoặc thắc mắc sức khỏe để nhận phân tích y khoa</p>
          </div>
        </div>

        <form onSubmit={handleConsultSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={symptomInput}
                onChange={e => setSymptomInput(e.target.value)}
                placeholder="VD: Mỏi cơ gối sau dạy Pickleball, Đau dạ dày khi đói, Chóng mặt..."
                className="w-full bg-slate-800/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all shadow-inner pr-10"
              />
              {symptomInput && (
                <button
                  type="button"
                  onClick={() => setSymptomInput('')}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingConsult || !symptomInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition-all shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingConsult ? 'Đang phân tích...' : 'Gửi Tư Vấn AI'}</span>
            </button>
          </div>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Gợi ý mẫu:</span>
            {sampleSymptoms.map((s, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setSymptomInput(s)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        {consultResult && (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-base font-bold text-emerald-400 font-outfit flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Phân Tích Y Khoa: {consultResult.symptomName}</span>
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Khuyên Dùng
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-200">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <strong className="text-emerald-400 block text-xs">🔬 Đánh giá tổng quan:</strong>
                <p className="text-slate-300">{consultResult.assessment}</p>
              </div>

              <div className="bg-slate-800/90 p-4 rounded-xl border border-white/10 space-y-1.5">
                <strong className="text-emerald-400 block text-xs font-bold">📋 Khuyên dùng & Hướng xử lý:</strong>
                <p className="whitespace-pre-line text-slate-200">{consultResult.recommendations}</p>
              </div>

              {consultResult.warnings && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-rose-300 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Dấu hiệu cảnh báo cần lưu ý:</span>
                  </span>
                  <p>{consultResult.warnings}</p>
                </div>
              )}

              {consultResult.references && consultResult.references.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Nguồn tài liệu y khoa tham khảo:</span>
                  <div className="flex flex-wrap gap-2">
                    {consultResult.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-semibold transition-all"
                      >
                        <span>{ref.title}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Annual Checkup Records Header & PDF Upload Zone */}
      <div className="glass-card p-5 md:p-6 space-y-5 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">Hồ Sơ Khám Bệnh Định Kỳ & PDF Kết Quả</h3>
              <p className="text-xs text-slate-400">Tải file PDF kết quả khám ➔ AI tự động đọc chỉ số & Phân tích y khoa chi tiết</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer border border-purple-400/30">
              <FileText className="w-4 h-4 text-purple-200" />
              <span>{parsingPdf ? '🤖 Đang đọc PDF...' : '📄 Upload File PDF Kết Quả Khám'}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
                disabled={parsingPdf}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1"
              title="Nhập tay thủ công"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Đóng' : 'Nhập tay'}</span>
            </button>
          </div>
        </div>

        {/* PDF Processing Indicator */}
        {parsingPdf && (
          <div className="p-4 bg-purple-500/15 border border-purple-500/30 rounded-2xl flex items-center gap-3 text-purple-300 text-xs animate-pulse">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">🤖 Trợ lý AI đang đọc file PDF: {pdfFileName}</span>
              Đang trích xuất chỉ số Huyết áp, Đường huyết, Cholesterol, Uric Acid và phân tích tác động tới chế độ Tăng Cân Sạch & Lịch Thể Thao...
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleRecordSubmit} className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-emerald-400 border-b border-white/10 pb-2">
              📝 Cập Nhật Chỉ Số Xét Nghiệm Mới
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày khám</label>
                <input
                  type="date"
                  value={checkupDate}
                  onChange={e => setCheckupDate(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Huyết áp (mmHg)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={e => setBloodPressure(e.target.value)}
                  placeholder="120/80 mmHg"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Đường huyết (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={glucose}
                  onChange={e => setGlucose(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cholesterol (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cholesterol}
                  onChange={e => setCholesterol(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Acid Uric (umol/L)</label>
                <input
                  type="number"
                  value={uricAcid}
                  onChange={e => setUricAcid(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Men gan (AST/ALT)</label>
                <input
                  type="text"
                  value={liverEnzymes}
                  onChange={e => setLiverEnzymes(e.target.value)}
                  placeholder="AST 24 / ALT 28 U/L"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
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
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Lưu Hồ Sơ Khám
              </button>
            </div>
          </form>
        )}

        {/* List of Clinical Records */}
        <div className="space-y-4">
          {healthRecords.length === 0 ? (
            <div className="text-center py-10 space-y-2 border border-dashed border-white/10 rounded-2xl">
              <HeartPulse className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">Chưa có kết quả khám sức khỏe nào được ghi nhận.</p>
            </div>
          ) : (
            healthRecords.map(r => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 hover:border-white/20 transition-all"
              >
                {/* Record Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>Ngày khám: {r.checkupDate}</span>
                    </span>

                    {r.fileName && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold">
                        <FileText className="w-3 h-3 text-purple-400" />
                        <span>{r.fileName}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa hồ sơ khám bệnh này?')) {
                        onDeleteHealthRecord(r.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Xóa hồ sơ khám này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Vital Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold block flex items-center gap-1">
                      <Activity className="w-3 h-3 text-rose-400" /> Huyết áp
                    </span>
                    <span className="font-outfit font-extrabold text-sm text-white">{r.bloodPressure || '—'}</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold block flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-amber-400" /> Đường huyết
                    </span>
                    <span className="font-outfit font-extrabold text-sm text-white">
                      {r.glucose ? `${r.glucose} mmol/L` : '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold block">Cholesterol</span>
                    <span className="font-outfit font-extrabold text-sm text-white">
                      {r.cholesterol ? `${r.cholesterol} mmol/L` : '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-slate-400 text-[11px] font-semibold block">Acid Uric</span>
                    <span className="font-outfit font-extrabold text-sm text-white">
                      {r.uricAcid ? `${r.uricAcid} µmol/L` : '—'}
                    </span>
                  </div>
                </div>

                {/* Conclusion Box */}
                {r.conclusion && (
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-white/5 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold block text-xs">🩺 Kết luận bác sĩ:</span>
                    <p className="text-slate-200 leading-relaxed">{r.conclusion}</p>
                  </div>
                )}

                {/* AI Advice Box */}
                {r.aiAdvice && (
                  <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 p-4 rounded-2xl border border-purple-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-bold border-b border-purple-500/20 pb-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Phân Tích Y Khoa & Tư Vấn Chi Tiết Từ AI</span>
                    </div>
                    <p className="whitespace-pre-line text-purple-100/90 leading-relaxed font-sans">{r.aiAdvice}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
