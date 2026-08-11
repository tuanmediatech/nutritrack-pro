import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Laptop,
  Monitor,
  Database,
  Code,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Send,
  HelpCircle,
  Globe
} from 'lucide-react';

export const SyncView: React.FC = () => {
  const [isLaptop, setIsLaptop] = useState<boolean>(true);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [syncType, setSyncType] = useState<'db' | 'code' | 'both'>('both');
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  // Fetch Sync Status from Server
  useEffect(() => {
    fetch('/api/sync/status')
      .then(res => res.json())
      .then(data => {
        setIsLaptop(data.isLaptop ?? true);
        if (data.targetUrl) {
          setTargetUrl(data.targetUrl);
        }
      })
      .catch(err => {
        addLog(`⚠️ Không thể tải thông tin trạng thái Sync: ${err.message}`);
      });
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const handleStartSync = async () => {
    if (!targetUrl.trim()) {
      alert('Vui lòng nhập địa chỉ URL ngrok của PC đích!');
      return;
    }

    setLoading(true);
    setSyncSuccess(null);
    setLogs([]);
    addLog(`🚀 Bắt đầu quá trình đồng bộ (Chế độ: ${syncType.toUpperCase()})...`);
    addLog(`🌐 Địa chỉ đích: ${targetUrl.trim()}`);

    try {
      const res = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: syncType,
          targetUrl: targetUrl.trim(),
        }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch (e) {
        throw new Error(`Phản hồi từ server không phải JSON (${res.status}): ${resText.substring(0, 150)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi không xác định từ máy chủ!');
      }

      addLog(`✅ Đồng bộ thành công! DB=${data.results?.db ? 'OK' : 'Không'}, Code=${data.results?.code ? 'OK' : 'Không'}`);
      addLog(`💡 Đang tự động làm mới dữ liệu trình duyệt trong 2 giây...`);
      setSyncSuccess(true);

      setTimeout(() => {
        localStorage.removeItem('nutritrack_pro_v3_state');
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      addLog(`❌ Thất bại: ${err.message}`);
      setSyncSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-emerald-400" />
          <span>Đồng Bộ Dữ Liệu & Mã Nguồn (Laptop ↔ PC)</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Chuyển dữ liệu nhật ký SQLite và cập nhật code giữa Laptop cơ quan và PC cá nhân qua Ngrok
        </p>
      </div>

      {/* Mode Indicator & URL Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Machine Mode Card */}
        <div className="glass-card p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Vai trò thiết bị hiện tại
          </span>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isLaptop ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isLaptop ? <Laptop className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">
                {isLaptop ? 'Máy Laptop (Source - Nguồn)' : 'Máy PC (Target - Đích)'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLaptop
                  ? 'Gửi code và database từ máy này sang máy PC'
                  : 'Sẵn sàng nhận dữ liệu đồng bộ và tự động restart PM2'}
              </p>
            </div>
          </div>
        </div>

        {/* Target URL Config Card */}
        <div className="glass-card p-5 space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Địa chỉ Ngrok máy PC (Target URL)
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="https://reveler-leverage-backlight.ngrok-free.dev"
              className="w-full bg-slate-800 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Lấy link ngrok đang chạy trên máy PC (Ví dụ: <code className="text-emerald-400">ngrok http 3456</code>)
          </p>
        </div>
      </div>

      {/* Sync Type Selector */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2 border-b border-white/10 pb-3">
          <Zap className="w-5 h-5 text-emerald-400" />
          <span>Chọn chế độ Đồng bộ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option: Database */}
          <button
            type="button"
            onClick={() => setSyncType('db')}
            className={`p-4 rounded-xl border text-left transition-all ${
              syncType === 'db'
                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Database className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold">Chỉ Database SQLite</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Đồng bộ toàn bộ bản ghi nhật ký ăn uống, cân nặng, ghi chú và hồ sơ bệnh án (`nutritrack.db`).
            </p>
          </button>

          {/* Option: Code */}
          <button
            type="button"
            onClick={() => setSyncType('code')}
            className={`p-4 rounded-xl border text-left transition-all ${
              syncType === 'code'
                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Code className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-sm font-bold">Chỉ Mã Nguồn (Code)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tự động nén tất cả file giao diện, logic server và giải nén sang máy PC.
            </p>
          </button>

          {/* Option: Both */}
          <button
            type="button"
            onClick={() => setSyncType('both')}
            className={`p-4 rounded-xl border text-left transition-all ${
              syncType === 'both'
                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Zap className="w-6 h-6 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold">Cả Database & Mã Nguồn</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Đồng bộ hoàn toàn cả dữ liệu và code cập nhật mới nhất (Khuyên dùng).
            </p>
          </button>
        </div>

        {/* Start Button */}
        <div className="pt-3">
          <button
            onClick={handleStartSync}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Đang thực hiện đồng bộ...' : 'BẮT ĐẦU ĐỒNG BỘ NGHAY'}</span>
          </button>
        </div>
      </div>

      {/* Sync Console & Log Monitor */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-outfit">Bảng Điều Khiển Log Đồng Bộ</h3>
          </div>
          {syncSuccess !== null && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              syncSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {syncSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{syncSuccess ? 'Hoàn tất 100%' : 'Gặp lỗi'}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[160px] max-h-[300px] overflow-y-auto space-y-1.5">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">Nhấn "BẮT ĐẦU ĐỒNG BỘ" để theo dõi nhật ký thực hiện tại đây...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Guide Note */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-start">
        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <span className="font-bold text-white block">Hướng dẫn thao tác trên máy PC (Target):</span>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Mở CMD/Terminal trên máy PC và gõ command: <code className="text-emerald-400">ngrok http 3456</code></li>
            <li>Copy liên kết public ngrok vừa xuất hiện và dán vào ô <b>"Địa chỉ Ngrok máy PC"</b> phía trên.</li>
            <li>Sau khi đồng bộ hoàn tất, máy PC sẽ tự động restart dịch vụ PM2 để cập nhật code & database mới.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
