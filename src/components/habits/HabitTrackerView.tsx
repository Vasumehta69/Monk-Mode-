import React, { useState } from 'react';
import {
  Plus,
  Flame,
  Check,
  X,
  Trash2,
  Edit2,
  Calendar,
  Sun,
  Sunset,
  Moon,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Habit } from '../../types';
import { getTodayDateString, getPastDateString } from '../../services/storage';

interface HabitTrackerViewProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'history' | 'createdAt'>) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabitDay: (habitId: string, dateString: string) => void;
}

export const HabitTrackerView: React.FC<HabitTrackerViewProps> = ({
  habits,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
  onToggleHabitDay,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // New habit form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTimeOfDay, setNewTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');

  const todayStr = getTodayDateString();

  // Get last 7 days array (from 6 days ago up to today)
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i;
    const dateStr = getPastDateString(daysAgo);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return {
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      shortName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: daysAgo === 0,
    };
  });

  const handleOpenAdd = () => {
    setNewTitle('');
    setNewDescription('');
    setNewTimeOfDay('morning');
    setNewFrequency('daily');
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      timeOfDay: newTimeOfDay,
      frequency: newFrequency,
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editingHabit.title.trim()) return;

    onUpdateHabit(editingHabit.id, {
      title: editingHabit.title.trim(),
      description: editingHabit.description?.trim(),
      timeOfDay: editingHabit.timeOfDay,
      frequency: editingHabit.frequency,
    });

    setEditingHabit(null);
  };

  const getTimeIcon = (time: Habit['timeOfDay']) => {
    switch (time) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'afternoon':
        return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
      case 'evening':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  // Calculate 7-day completion rate
  const totalSlots = habits.length * 7;
  let totalCompletedSlots = 0;
  habits.forEach((h) => {
    past7Days.forEach((day) => {
      if (h.history[day.dateStr]) totalCompletedSlots++;
    });
  });
  const overallWeeklyCompliance = totalSlots > 0 ? Math.round((totalCompletedSlots / totalSlots) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-display">
            Habit Discipline Matrix
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Consistency breeds identity. Track your non-negotiable daily standards.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Summary Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400">Total Active Habits</span>
            <p className="text-2xl font-bold text-zinc-100 font-display mt-1">{habits.length}</p>
          </div>
          <Calendar className="w-6 h-6 text-zinc-600" />
        </div>

        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400">7-Day Consistency</span>
            <p className="text-2xl font-bold text-emerald-400 font-display mt-1 tabular-nums">
              {overallWeeklyCompliance}%
            </p>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-500/50" />
        </div>

        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400">Longest Active Streak</span>
            <p className="text-2xl font-bold text-zinc-100 font-display mt-1 tabular-nums flex items-center gap-1.5">
              <span>{Math.max(0, ...habits.map((h) => h.streak))}</span>
              <span className="text-xs font-mono font-normal text-zinc-400">days</span>
            </p>
          </div>
          <Flame className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Habits Table with Weekly Grid */}
      <div className="rounded-xl bg-[#111114] border border-[#1f1f24] overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:px-6 bg-[#141418] border-b border-[#1f1f24] flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
            Habit Routine
          </span>

          <div className="flex items-center gap-2 sm:gap-3 text-center">
            {past7Days.map((day) => (
              <div
                key={day.dateStr}
                className={`w-7 sm:w-9 flex flex-col items-center ${
                  day.isToday ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                }`}
              >
                <span className="text-[10px] font-mono">{day.shortName}</span>
                <span className="text-xs font-mono">{day.dateStr.split('-')[2]}</span>
              </div>
            ))}
            <div className="w-16 hidden sm:block text-right text-[11px] font-mono text-zinc-500">
              Streak
            </div>
          </div>
        </div>

        {/* Table Rows */}
        {habits.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">No habits tracked yet</h3>
            <p className="text-xs text-zinc-400">
              Establish your core non-negotiables (morning sunlight, deep sprint, screen blackout).
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg font-semibold"
            >
              Add First Habit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a20]">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#141418] transition-colors group"
              >
                {/* Habit details */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    {getTimeIcon(habit.timeOfDay)}
                    <h4 className="text-sm font-semibold text-zinc-100 truncate">
                      {habit.title}
                    </h4>
                  </div>
                  {habit.description && (
                    <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-md">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-1">
                    <span className="capitalize">{habit.timeOfDay}</span>
                    <span>·</span>
                    <span className="capitalize">{habit.frequency}</span>
                    <span>·</span>
                    <span>Best: {habit.bestStreak}d</span>
                  </div>
                </div>

                {/* 7-Day Matrix Toggles */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {past7Days.map((day) => {
                    const isChecked = habit.history[day.dateStr] === true;
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => onToggleHabitDay(habit.id, day.dateStr)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-[#15151a] border-[#25252f] text-transparent hover:border-zinc-500'
                        } ${day.isToday ? 'ring-1 ring-emerald-500/30' : ''}`}
                        title={`${habit.title} on ${day.dateStr}: ${isChecked ? 'Completed' : 'Missed'}`}
                        aria-label={`Toggle habit on ${day.dateStr}`}
                      >
                        <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}

                  {/* Streak metric */}
                  <div className="w-16 hidden sm:flex flex-col items-end text-xs font-mono">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      title="Edit habit"
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-[#1e1e26]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      title="Delete habit"
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-[#1e1e26]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111114] border border-[#24242c] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a1a20] pb-3">
              <h3 className="text-base font-bold text-zinc-100 font-display">
                Create Non-Negotiable Habit
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-Minute Morning Box Breathing & Sunlight"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Description / Trigger
                </label>
                <textarea
                  rows={2}
                  placeholder="Immediately upon waking, stepping outside before looking at any display."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Time of Day
                  </label>
                  <select
                    value={newTimeOfDay}
                    onChange={(e) => setNewTimeOfDay(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="daily">Daily (7 days)</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekends">Weekends Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a20]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111114] border border-[#24242c] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a1a20] pb-3">
              <h3 className="text-base font-bold text-zinc-100 font-display">
                Edit Habit
              </h3>
              <button
                onClick={() => setEditingHabit(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={editingHabit.title}
                  onChange={(e) => setEditingHabit({ ...editingHabit, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingHabit.description || ''}
                  onChange={(e) => setEditingHabit({ ...editingHabit, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Time of Day
                  </label>
                  <select
                    value={editingHabit.timeOfDay}
                    onChange={(e) => setEditingHabit({ ...editingHabit, timeOfDay: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={editingHabit.frequency}
                    onChange={(e) => setEditingHabit({ ...editingHabit, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="daily">Daily (7 days)</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekends">Weekends Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a20]">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
