import React, { useState, useEffect } from 'react';
import {
  DayType,
  LogEntry,
  MealOption,
  NoteItem,
  ProfileType,
  TabType,
  UserProfile,
  WeightEntry,
  HealthRecord,
  ChecklistItem,
  AISchedule,
} from './types';
import {
  AppStateData,
  loadState,
  saveState,
  INITIAL_STATE,
  calculateStreak,
} from './utils/storage';
import { PROFILE_DATA } from './data/defaultData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { StatsView } from './components/StatsView';
import { LogView } from './components/LogView';
import { WeightView } from './components/WeightView';
import { ChecklistView } from './components/ChecklistView';
import { MealsView } from './components/MealsView';
import { NotebookView } from './components/NotebookView';
import { HealthView } from './components/HealthView';
import { RemindersView } from './components/RemindersView';
import { SettingsView } from './components/SettingsView';
import { SyncView } from './components/SyncView';

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(() => loadState());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Apply dark / light data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appState.theme);
  }, [appState.theme]);

  // Get active Meal Schedule & Checklist Items
  const activeProfileData = PROFILE_DATA[appState.userProfile.profileType || 'tang_can'];

  let activeMealSchedule: MealOption[] = (appState.customMealSchedule && appState.customMealSchedule.length > 0)
    ? appState.customMealSchedule
    : activeProfileData.MEAL_SCHEDULE;

  if (appState.activeScheduleId) {
    const aiFound = appState.aiSchedules.find(s => s.id === appState.activeScheduleId);
    if (aiFound && aiFound.meal_schedule && aiFound.meal_schedule.length > 0) {
      activeMealSchedule = aiFound.meal_schedule;
    }
  }

  // Ensure active list is never empty
  if (!activeMealSchedule || activeMealSchedule.length === 0) {
    activeMealSchedule = activeProfileData.MEAL_SCHEDULE;
  }

  // Automatically sync Checklist Items with activeMealSchedule so Bảng kiểm and Lịch sinh hoạt stay 100% in sync!
  const scheduleChecklistItems: ChecklistItem[] = activeMealSchedule.map(slot => ({
    id: slot.id,
    text: slot.name,
    time: slot.displayTime || slot.time,
    icon: slot.icon || '⏰',
  }));

  const habitChecklistItems: ChecklistItem[] = [
    { id: 'c_water', text: 'Uống đủ nước (2–3 lít)', time: 'Cả ngày', icon: '💧' },
    { id: 'c_nosugar', text: 'Không dùng nước ngọt / trà sữa / đồ ngọt', time: 'Cả ngày', icon: '🚫' },
  ];

  const activeChecklistItems: ChecklistItem[] = [...scheduleChecklistItems, ...habitChecklistItems];

  // Schedule & Slot Mutators
  const handleSaveMealSchedule = (newSchedule: MealOption[]) => {
    if (appState.activeScheduleId) {
      setAppState(prev => ({
        ...prev,
        aiSchedules: prev.aiSchedules.map(s =>
          s.id === prev.activeScheduleId ? { ...s, meal_schedule: newSchedule } : s
        ),
      }));
    } else {
      setAppState(prev => ({
        ...prev,
        customMealSchedule: newSchedule,
      }));
    }
    showToast('Đã lưu danh sách bữa ăn!');
  };

  const handleDeleteMealSlot = (id: string) => {
    const updated = activeMealSchedule.filter(m => m.id !== id);
    handleSaveMealSchedule(updated);
    showToast('Đã xóa mốc thời gian khỏi danh mục');
  };

  const handleUpdateMealSlot = (updatedItem: MealOption) => {
    const updated = activeMealSchedule.map(m => (m.id === updatedItem.id ? updatedItem : m));
    handleSaveMealSchedule(updated);
    showToast(`Đã cập nhật mốc sinh hoạt: ${updatedItem.displayTime || updatedItem.time}`);
  };

  const handleAddMealSlot = (newItem: MealOption) => {
    const updated = [...activeMealSchedule, newItem];
    handleSaveMealSchedule(updated);
    showToast(`Đã thêm mốc sinh hoạt mới: ${newItem.name}`);
  };

  const handleResetSchedule = () => {
    setAppState(prev => ({
      ...prev,
      customMealSchedule: undefined,
      customChecklistItems: undefined,
    }));
    showToast('Đã khôi phục khung giờ mặc định');
  };

  // State Mutator Helpers
  const handleSetDayType = (type: DayType) => {
    setAppState(prev => ({ ...prev, dayType: type }));
    showToast(`Chuyển chế độ: ${type === 'heavy' ? 'Vận động nhiều' : 'Vận động nhẹ'}`);
  };

  const handleToggleProfileType = () => {
    const newType: ProfileType = appState.userProfile.profileType === 'tang_can' ? 'giam_can' : 'tang_can';
    setAppState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        profileType: newType,
      },
    }));
    showToast(`Chuyển phân hệ: ${newType === 'tang_can' ? 'Tăng Cân Sạch 📈' : 'Giảm Cân / Giảm Mỡ 📉'}`);
  };

  const handleToggleTheme = () => {
    const newTheme = appState.theme === 'dark' ? 'light' : 'dark';
    setAppState(prev => ({ ...prev, theme: newTheme }));
  };

  // Quick Log Entry
  const handleAddLog = (entryData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entryData,
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
    };

    setAppState(prev => ({
      ...prev,
      logs: [newEntry, ...prev.logs],
    }));

    showToast(`Ghi nhận bữa ăn: ${entryData.food.substring(0, 35)}...`);
  };

  // Add Water
  const handleAddWater = (ml: number) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: LogEntry = {
      id: `w_${Date.now()}`,
      date: today,
      time: timeStr,
      meal_type: 'water',
      food: `Uống ${ml}ml nước lọc`,
      rice: 0,
      water: ml,
      feeling: 'good',
      protein: 0,
      calories: 0,
      timestamp: Date.now(),
    };

    setAppState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs],
    }));

    showToast(`+${ml}ml nước lọc!`);
  };

  // Delete Log
  const handleDeleteLog = (id: string) => {
    setAppState(prev => ({
      ...prev,
      logs: prev.logs.filter(l => l.id !== id),
    }));
    showToast('Đã xóa bản ghi nhật ký', 'warn');
  };

  // Weight Operations
  const handleSaveWeight = (entry: WeightEntry) => {
    setAppState(prev => {
      const existingIdx = prev.weights.findIndex(w => w.date === entry.date);
      let updatedWeights = [...prev.weights];
      if (existingIdx >= 0) {
        updatedWeights[existingIdx] = { ...updatedWeights[existingIdx], ...entry };
      } else {
        updatedWeights.push({ id: `w_${Date.now()}`, ...entry });
      }
      return { ...prev, weights: updatedWeights };
    });

    showToast(`Đã lưu cân nặng ${entry.weight}kg ngày ${entry.date}`);
  };

  const handleDeleteWeight = (date: string) => {
    setAppState(prev => ({
      ...prev,
      weights: prev.weights.filter(w => w.date !== date),
    }));
    showToast('Đã xóa cân nặng', 'warn');
  };

  // Checklist Operations
  const handleToggleCheck = (itemId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAppState(prev => {
      const currentTodayChecks = prev.checklist[today] || {};
      const newStatus = !currentTodayChecks[itemId];

      return {
        ...prev,
        checklist: {
          ...prev.checklist,
          [today]: {
            ...currentTodayChecks,
            [itemId]: newStatus,
          },
        },
      };
    });
  };

  const handleResetChecklist = () => {
    const today = new Date().toISOString().split('T')[0];
    setAppState(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [today]: {},
      },
    }));
    showToast('Đã reset bảng kiểm hôm nay', 'warn');
  };

  // Notebook Operations
  const handleSaveNote = (noteData: Omit<NoteItem, 'id' | 'updatedAt'> & { id?: string }) => {
    setAppState(prev => {
      let updatedNotes = [...prev.notes];
      if (noteData.id) {
        updatedNotes = updatedNotes.map(n =>
          n.id === noteData.id
            ? { ...n, title: noteData.title, content: noteData.content, updatedAt: new Date().toISOString() }
            : n
        );
      } else {
        updatedNotes.unshift({
          id: `note_${Date.now()}`,
          title: noteData.title,
          content: noteData.content,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...prev, notes: updatedNotes };
    });
    showToast('Đã lưu ghi chú!');
  };

  const handleDeleteNote = (id: string) => {
    setAppState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
    }));
    showToast('Đã xóa ghi chú', 'warn');
  };

  // Health Record Operations
  const handleSaveHealthRecord = (recordData: Omit<HealthRecord, 'id'> & { id?: string }) => {
    setAppState(prev => {
      let updated = [...prev.healthRecords];
      if (recordData.id) {
        updated = updated.map(h => (h.id === recordData.id ? { ...h, ...recordData } : h));
      } else {
        updated.unshift({
          id: `hr_${Date.now()}`,
          ...recordData,
        });
      }
      return { ...prev, healthRecords: updated };
    });
    showToast('Đã lưu kết quả khám bệnh!');
  };

  const handleDeleteHealthRecord = (id: string) => {
    setAppState(prev => ({
      ...prev,
      healthRecords: prev.healthRecords.filter(h => h.id !== id),
    }));
    showToast('Đã xóa hồ sơ khám bệnh', 'warn');
  };

  // Profile Save
  const handleSaveProfile = (profile: UserProfile) => {
    setAppState(prev => ({
      ...prev,
      userProfile: profile,
    }));
    showToast('Đã cập nhật hồ sơ cá nhân!');
  };

  // AI Schedule Operations
  const handleActivateSchedule = (scheduleId?: string) => {
    setAppState(prev => ({ ...prev, activeScheduleId: scheduleId }));
    showToast(scheduleId ? 'Đã kích hoạt lịch trình AI!' : 'Đã khôi phục lịch trình mặc định');
  };

  const handleAddAISchedule = (schedule: AISchedule) => {
    setAppState(prev => ({
      ...prev,
      aiSchedules: [schedule, ...prev.aiSchedules],
    }));
    showToast('Tạo lịch trình AI thành công!');
  };

  const handleDeleteAISchedule = (id: string) => {
    setAppState(prev => ({
      ...prev,
      aiSchedules: prev.aiSchedules.filter(s => s.id !== id),
      activeScheduleId: prev.activeScheduleId === id ? undefined : prev.activeScheduleId,
    }));
    showToast('Đã xóa lịch trình AI', 'warn');
  };

  // JSON Backup Operations
  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nutritrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Đã xuất file sao lưu JSON!');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.userProfile && parsed.logs) {
          setAppState(parsed);
          showToast('Khôi phục dữ liệu thành công!');
        } else {
          showToast('File JSON không hợp lệ!', 'warn');
        }
      } catch (err) {
        showToast('Lỗi đọc file backup!', 'warn');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn xóa toàn bộ dữ liệu và reset về mặc định không?')) {
      setAppState(INITIAL_STATE);
      showToast('Đã reset toàn bộ dữ liệu!', 'warn');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative pb-20 md:pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white font-medium text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage.type === 'warn' ? '⚠️' : '✅'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userProfile={appState.userProfile}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="md:ml-[260px] min-h-screen p-4 sm:p-6 lg:p-8">
        <Header
          userProfile={appState.userProfile}
          dayType={appState.dayType}
          onSetDayType={handleSetDayType}
          onToggleProfileType={handleToggleProfileType}
          theme={appState.theme}
          onToggleTheme={handleToggleTheme}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        <main className="max-w-7xl mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              userProfile={appState.userProfile}
              dayType={appState.dayType}
              mealSchedule={activeMealSchedule}
              logs={appState.logs}
              weights={appState.weights}
              checklistState={appState.checklist}
              onAddLog={handleAddLog}
              onAddWater={handleAddWater}
              onSelectTab={setCurrentTab}
              onDeleteMealSlot={handleDeleteMealSlot}
            />
          )}

          {currentTab === 'schedule' && (
            <ScheduleView
              mealSchedule={activeMealSchedule}
              onDeleteMealSlot={handleDeleteMealSlot}
              onResetSchedule={handleResetSchedule}
              onUpdateMealSlot={handleUpdateMealSlot}
              onAddMealSlot={handleAddMealSlot}
            />
          )}

          {currentTab === 'stats' && (
            <StatsView logs={appState.logs} checklistState={appState.checklist} />
          )}

          {currentTab === 'log' && (
            <LogView logs={appState.logs} onDeleteLog={handleDeleteLog} />
          )}

          {currentTab === 'weight' && (
            <WeightView
              userProfile={appState.userProfile}
              weights={appState.weights}
              onSaveWeight={handleSaveWeight}
              onDeleteWeight={handleDeleteWeight}
            />
          )}

          {currentTab === 'checklist' && (
            <ChecklistView
              checklistItems={activeChecklistItems}
              checklistState={appState.checklist}
              onToggleCheck={handleToggleCheck}
              onResetChecklist={handleResetChecklist}
            />
          )}

          {currentTab === 'meals' && (
            <MealsView mealSchedule={activeMealSchedule} />
          )}

          {currentTab === 'notebook' && (
            <NotebookView
              notes={appState.notes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentTab === 'health' && (
            <HealthView
              healthRecords={appState.healthRecords}
              onSaveHealthRecord={handleSaveHealthRecord}
              onDeleteHealthRecord={handleDeleteHealthRecord}
            />
          )}

          {currentTab === 'sync' && <SyncView />}

          {currentTab === 'reminders' && (
            <RemindersView
              mealSchedule={activeMealSchedule}
              reminderAdvance={appState.reminderAdvance}
              waterReminderEnabled={appState.waterReminderEnabled}
              reminderEnabled={appState.reminderEnabled}
              onUpdateReminders={(adv, wRem, rem) =>
                setAppState(p => ({
                  ...p,
                  reminderAdvance: adv,
                  waterReminderEnabled: wRem,
                  reminderEnabled: rem,
                }))
              }
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              userProfile={appState.userProfile}
              mealSchedule={activeMealSchedule}
              checklistItems={activeChecklistItems}
              aiSchedules={appState.aiSchedules}
              activeScheduleId={appState.activeScheduleId}
              reminderAdvance={appState.reminderAdvance}
              waterReminderEnabled={appState.waterReminderEnabled}
              reminderEnabled={appState.reminderEnabled}
              onSaveProfile={handleSaveProfile}
              onSaveMealSchedule={handleSaveMealSchedule}
              onSaveChecklistItems={c => setAppState(p => ({ ...p, customChecklistItems: c }))}
              onActivateSchedule={handleActivateSchedule}
              onAddAISchedule={handleAddAISchedule}
              onDeleteAISchedule={handleDeleteAISchedule}
              onUpdateReminders={(adv, wRem, rem) =>
                setAppState(p => ({
                  ...p,
                  reminderAdvance: adv,
                  waterReminderEnabled: wRem,
                  reminderEnabled: rem,
                }))
              }
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetAllData={handleResetAllData}
            />
          )}

          {/* Fallback if invalid tab */}
          {![
            'dashboard',
            'schedule',
            'stats',
            'log',
            'weight',
            'checklist',
            'meals',
            'notebook',
            'health',
            'sync',
            'reminders',
            'settings',
          ].includes(currentTab) && (
            <Dashboard
              userProfile={appState.userProfile}
              dayType={appState.dayType}
              mealSchedule={activeMealSchedule}
              logs={appState.logs}
              weights={appState.weights}
              checklistState={appState.checklist}
              onAddLog={handleAddLog}
              onAddWater={handleAddWater}
              onSelectTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
      />
    </div>
  );
}
