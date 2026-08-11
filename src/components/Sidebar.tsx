import React from 'react';
import { TabType, UserProfile } from '../types';
import {
  BarChart3,
  Clock,
  TrendingUp,
  FileText,
  Scale,
  CheckSquare,
  Utensils,
  Bell,
  Settings,
  BookOpen,
  HeartPulse,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userProfile: UserProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navSections = [
    {
      label: 'Ghi nhận hằng ngày',
      items: [
        { id: 'checklist', label: 'Bảng kiểm hằng ngày', icon: CheckSquare },
        { id: 'log', label: 'Nhật ký ăn uống', icon: FileText },
        { id: 'dashboard', label: 'Dashboard tổng quan', icon: BarChart3 },
      ],
    },
    {
      label: 'Lịch trình & Lộ trình',
      items: [
        { id: 'schedule', label: 'Lịch sinh hoạt', icon: Clock },
        { id: 'weight', label: 'Cân nặng & Lộ trình', icon: Scale },
        { id: 'stats', label: 'Thống kê 7 ngày', icon: TrendingUp },
      ],
    },
    {
      label: 'Kiến thức & Tiện ích',
      items: [
        { id: 'meals', label: 'Thực đơn gợi ý', icon: Utensils },
        { id: 'notebook', label: 'Sổ ghi chép (Notes)', icon: BookOpen },
        { id: 'health', label: 'Sức khỏe & Khám bệnh', icon: HeartPulse },
      ],
    },
    {
      label: 'Hệ thống',
      items: [
        { id: 'reminders', label: 'Nhắc nhở & Lịch', icon: Bell },
        { id: 'settings', label: 'Cài đặt & Đồng bộ AI', icon: Settings },
      ],
    },
  ];

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const initials = userProfile.name
    .split(' ')
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`sidebar fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col p-5 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div className="sidebar-logo flex items-center justify-between pb-5 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
              🥗
            </div>
            <div>
              <h2 className="font-outfit font-extrabold text-lg text-white leading-tight">NutriTrack</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Pro Edition</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="sidebar-nav-container flex-1 overflow-y-auto pr-1 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="nav-section">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
                {section.label}
              </span>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id as TabType)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card Footer */}
        <div className="sidebar-footer pt-4 mt-4 border-t border-white/10">
          <div className="user-card flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-xs text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userProfile.name}</p>
              <p className="text-xs text-emerald-400 font-medium truncate">
                Mục tiêu: {userProfile.targetWeight}kg ({userProfile.profileType === 'tang_can' ? 'Tăng cân' : 'Giảm cân'})
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
