import React from 'react';
import { TabType } from '../types';
import { BarChart3, Clock, CheckSquare, Scale, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenMobileSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
}) => {
  const items = [
    { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
    { id: 'schedule', label: 'Lịch ăn', icon: Clock },
    { id: 'checklist', label: 'Bảng kiểm', icon: CheckSquare },
    { id: 'weight', label: 'Cân nặng', icon: Scale },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id as TabType)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenMobileSidebar}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </nav>
  );
};
