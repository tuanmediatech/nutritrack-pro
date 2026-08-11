import React, { useState } from 'react';
import { NoteItem } from '../types';
import { BookOpen, Plus, Search, Trash2, Save, FileText } from 'lucide-react';

interface NotebookViewProps {
  notes: NoteItem[];
  onSaveNote: (note: Omit<NoteItem, 'id' | 'updatedAt'> & { id?: string }) => void;
  onDeleteNote: (id: string) => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length ? notes[0].id : null
  );

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const filteredNotes = notes.filter(
    n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleCreateNew = () => {
    setSelectedNoteId(null);
    setTitle('');
    setContent('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSaveNote({
      id: selectedNoteId || undefined,
      title: title.trim(),
      content: content.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <span>Sổ Ghi Chép Cá Nhân (Notebook)</span>
        </h1>
        <p className="page-subtitle text-sm text-slate-400 mt-1">
          Lưu trữ ghi chú thực đơn tự làm, lịch thi đấu thể thao hoặc thói quen tập luyện
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Search & Notes List */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Danh sách ghi chú</span>
            <button
              onClick={handleCreateNew}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo mới</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm ghi chú..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Không tìm thấy ghi chú nào.</p>
            ) : (
              filteredNotes.map(n => {
                const isActive = selectedNoteId === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <h4 className="text-xs font-bold truncate mb-1">{n.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{n.content || 'Chưa có nội dung...'}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(n.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Editor Form */}
        <div className="glass-card p-5 md:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-outfit">
                {selectedNoteId ? '✏️ Chỉnh Sửa Ghi Chú' : '➕ Ghi Chú Mới'}
              </h3>

              {selectedNoteId && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteNote(selectedNoteId);
                    handleCreateNew();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Note</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tiêu đề ghi chú</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Kế hoạch bổ sung đạm tuần này..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nội dung ghi chú</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                placeholder="Nhập ghi chú sinh hoạt, thói quen ăn uống hoặc lịch tập luyện tại đây..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="btn-primary px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Ghi Chú</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
