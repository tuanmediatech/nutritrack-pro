import React from 'react';
import { DayType, ProfileType, TabType, UserProfile } from '../types';
import { Activity, Sun, Moon, Sparkles, Menu, Calendar, Smartphone } from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile;
  dayType: DayType;
  onSetDayType: (type: DayType) => void;
  onToggleProfileType: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  dayType,
  onSetDayType,
  onToggleProfileType,
  theme,
  onToggleTheme,
  onOpenMobileSidebar,
}) => {
  const today = new Date();
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const formattedDate = `${days[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  return (
    <header className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="page-title text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2 font-outfit">
            <span>🥗 NutriTrack</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-semibold">
              Pro v3.0
            </span>
          </h1>
        </div>
        <p className="page-subtitle text-sm text-slate-400 mt-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400 inline" />
          <span>{formattedDate}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">
            Hồ sơ: {userProfile.name} ({userProfile.profileType === 'tang_can' ? 'Tăng cân' : 'Giảm cân'})
          </span>
        </p>
      </div>

      <div className="header-actions flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
        {/* Profile Switcher Badge */}
        <button
          onClick={onToggleProfileType}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            userProfile.profileType === 'tang_can'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
          }`}
          title="Nhấn để đổi giữa chế độ Tăng Cân & Giảm Cân"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phân hệ: {userProfile.profileType === 'tang_can' ? 'Tăng Cân Sạch 📈' : 'Giảm Cân / Giảm Mỡ 📉'}</span>
        </button>

        {/* Day Type Toggle */}
        <div className="day-type-toggle flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-full">
          <span className="text-xs text-slate-400 px-2 font-medium hidden sm:inline">Chế độ:</span>
          <button
            onClick={() => onSetDayType('heavy')}
            className={`day-type-btn px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dayType === 'heavy'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vận động nhiều</span>
          </button>
          <button
            onClick={() => onSetDayType('light')}
            className={`day-type-btn px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dayType === 'light'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Vận động nhẹ</span>
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Chuyển đổi giao diện Sáng / Tối"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
