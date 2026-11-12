/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Task,
  Habit,
  FocusSession,
  JournalEntry,
  UserProfile,
  ViewSection,
  DailyProductivityScore
} from './types';
import {
  loadStoredData,
  saveStoredData,
  calculateDailyProductivityScore,
  getTodayDateString,
  resetToDemoData
} from './services/storage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { FocusTimerView } from './components/timer/FocusTimerView';
import { TaskManagerView } from './components/tasks/TaskManagerView';
import { HabitTrackerView } from './components/habits/HabitTrackerView';
import { JournalView } from './components/journal/JournalView';
import { AIMentorView } from './components/mentor/AIMentorView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [data, setData] = useState(() => loadStoredData());
  const [currentSection, setCurrentSection] = useState<ViewSection>('dashboard');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync back to storage on updates
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Keyboard shortcut: Escape toggles Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // Compute live dynamic daily score
  const dailyScore: DailyProductivityScore = useMemo(() => {
    return calculateDailyProductivityScore(
      data.tasks,
      data.focusSessions,
      data.habits,
      data.profile.dailyFocusTargetHours
    );
  }, [data.tasks, data.focusSessions, data.habits, data.profile.dailyFocusTargetHours]);

  // 1. Task Handlers
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'completedBlocks' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      completed: false,
      completedBlocks: 0,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleToggleTask = (taskId: string) => {
    setData((prev) => {
      const today = getTodayDateString();
      return {
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (t.id === taskId) {
            const nextCompleted = !t.completed;
            return {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            };
          }
          return t;
        }),
      };
    });
  };

  const handleIncrementTaskBlock = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          const newCompletedBlocks = t.completedBlocks + 1;
          const shouldAutoFinish = newCompletedBlocks >= t.estimatedBlocks && !t.completed;
          return {
            ...t,
            completedBlocks: newCompletedBlocks,
            completed: shouldAutoFinish ? true : t.completed,
            completedAt: shouldAutoFinish ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      }),
    }));
  };

  // 2. Habit Handlers
  const handleAddHabit = (
    newHabit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'history' | 'createdAt'>
  ) => {
    const habit: Habit = {
      ...newHabit,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      history: {},
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, habit],
    }));
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Habit>) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h)),
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  const handleToggleHabitDay = (habitId: string, dateString: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id === habitId) {
          const currentVal = h.history[dateString] === true;
          const nextVal = !currentVal;
          const newHistory = { ...h.history, [dateString]: nextVal };

          // Recalculate streak
          let streak = 0;
          const checkDate = new Date();
          // Walk backwards from today
          for (let i = 0; i < 90; i++) {
            const y = checkDate.getFullYear();
            const m = String(checkDate.getMonth() + 1).padStart(2, '0');
            const d = String(checkDate.getDate()).padStart(2, '0');
            const str = `${y}-${m}-${d}`;
            if (newHistory[str]) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }

          const bestStreak = Math.max(h.bestStreak, streak);

          return {
            ...h,
            history: newHistory,
            streak,
            bestStreak,
          };
        }
        return h;
      }),
    }));
  };

  const handleToggleHabitToday = (habitId: string) => {
    handleToggleHabitDay(habitId, getTodayDateString());
  };

  // 3. Focus Session Handlers
  const handleSaveFocusSession = (sessionData: Omit<FocusSession, 'id'>) => {
    const session: FocusSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      focusSessions: [session, ...prev.focusSessions],
    }));
  };

  // 4. Journal Handlers
  const handleSaveJournalEntry = (
    entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setData((prev) => {
      const existingIdx = prev.journalEntries.findIndex((e) => e.date === entryData.date);
      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        const updated = [...prev.journalEntries];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...entryData,
          updatedAt: now,
        };
        return { ...prev, journalEntries: updated };
      } else {
        const newEntry: JournalEntry = {
          ...entryData,
          id: `journal-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, journalEntries: [newEntry, ...prev.journalEntries] };
      }
    });
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    setData((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((e) => e.id !== entryId),
    }));
  };

  // 5. Profile & Settings Handlers
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  };

  const handleResetData = () => {
    const fresh = resetToDemoData();
    setData(fresh);
  };

  const handleAddGeneratedGoalAsTask = (
    title: string,
    blocks: number,
    priority: 'HIGH' | 'MEDIUM'
  ) => {
    handleAddTask({
      title,
      priority,
      estimatedBlocks: blocks,
      dueDate: getTodayDateString(),
      category: 'Deep Work',
    });
  };

  // Background style based on chosen theme
  const getThemeBackground = () => {
    switch (data.profile.theme) {
      case 'amoled':
        return 'bg-black';
      case 'charcoal':
        return 'bg-[#0d0d10]';
      case 'matte-black':
      default:
        return 'bg-[#09090b]';
    }
  };

  return (
    <div className={`min-h-screen text-zinc-100 flex ${getThemeBackground()} selection:bg-emerald-500/30 selection:text-emerald-300 font-sans`}>
      {/* Sidebar Navigation (hidden in Zen mode) */}
      {!isZenMode && (
        <Sidebar
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          profile={data.profile}
          todayScore={dailyScore.score}
        />
      )}

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isZenMode && (
          <Header
            currentSection={currentSection}
            onNavigate={setCurrentSection}
            profile={data.profile}
            onUpdateProfile={handleUpdateProfile}
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode(true)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            todayScore={dailyScore.score}
          />
        )}

        <main className={`flex-1 overflow-y-auto px-4 sm:px-8 ${isZenMode ? 'pt-8' : 'pt-6'}`}>
          {currentSection === 'dashboard' && (
            <DashboardView
              tasks={data.tasks}
              habits={data.habits}
              focusSessions={data.focusSessions}
              profile={data.profile}
              dailyScore={dailyScore}
              onNavigate={setCurrentSection}
              onToggleTask={handleToggleTask}
              onToggleHabitToday={handleToggleHabitToday}
            />
          )}

          {currentSection === 'timer' && (
            <FocusTimerView
              tasks={data.tasks}
              profile={data.profile}
              onSaveSession={handleSaveFocusSession}
              onIncrementTaskBlock={handleIncrementTaskBlock}
              isZenMode={isZenMode}
              onToggleZenMode={() => setIsZenMode(!isZenMode)}
            />
          )}

          {currentSection === 'tasks' && (
            <TaskManagerView
              tasks={data.tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleTask={handleToggleTask}
              onNavigate={setCurrentSection}
            />
          )}

          {currentSection === 'habits' && (
            <HabitTrackerView
              habits={data.habits}
              onAddHabit={handleAddHabit}
              onUpdateHabit={handleUpdateHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleHabitDay={handleToggleHabitDay}
            />
          )}

          {currentSection === 'journal' && (
            <JournalView
              entries={data.journalEntries}
              onSaveEntry={handleSaveJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
            />
          )}

          {currentSection === 'mentor' && (
            <AIMentorView
              tasks={data.tasks}
              habits={data.habits}
              focusSessions={data.focusSessions}
              journalEntries={data.journalEntries}
              profile={data.profile}
              onAddGeneratedGoalAsTask={handleAddGeneratedGoalAsTask}
            />
          )}

          {currentSection === 'analytics' && (
            <AnalyticsView
              tasks={data.tasks}
              habits={data.habits}
              focusSessions={data.focusSessions}
              profile={data.profile}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsView
              profile={data.profile}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
