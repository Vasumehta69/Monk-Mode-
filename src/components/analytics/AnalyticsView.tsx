import React from 'react';
import {
  BarChart3,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Activity
} from 'lucide-react';
import { Task, Habit, FocusSession, UserProfile } from '../../types';
import { getPastDateString, getTodayDateString } from '../../services/storage';

interface AnalyticsViewProps {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  profile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  habits,
  focusSessions,
  profile,
}) => {
  const todayStr = getTodayDateString();

  // 1. Weekly focus minutes per day for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i;
    const dateStr = getPastDateString(daysAgo);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);

    const daySessions = focusSessions.filter(
      (s) => s.completed && s.completedAt.startsWith(dateStr)
    );
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      isToday: daysAgo === 0,
    };
  });

  const targetMinutesPerDay = profile.dailyFocusTargetHours * 60;
  const maxDayMinutes = Math.max(targetMinutesPerDay, ...last7Days.map((d) => d.totalMinutes), 60);

  // 2. High-level focus session metrics
  const totalCompletedSessions = focusSessions.filter((s) => s.completed);
  const totalFocusMinutesAll = totalCompletedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusHoursAll = (totalFocusMinutesAll / 60).toFixed(1);
  const avgSessionLength = totalCompletedSessions.length > 0
    ? Math.round(totalFocusMinutesAll / totalCompletedSessions.length)
    : 0;

  // 3. Category breakdown
  const categoryMap: Record<string, number> = {};
  totalCompletedSessions.forEach((s) => {
    const cat = s.category || 'Deep Work';
    categoryMap[cat] = (categoryMap[cat] || 0) + s.durationMinutes;
  });
  const categoryStats = Object.entries(categoryMap).map(([name, mins]) => ({
    name,
    mins,
    hours: (mins / 60).toFixed(1),
    pct: totalFocusMinutesAll > 0 ? Math.round((mins / totalFocusMinutesAll) * 100) : 0,
  })).sort((a, b) => b.mins - a.mins);

  // 4. Monthly 28-day activity grid
  const last28Days = Array.from({ length: 28 }, (_, i) => {
    const daysAgo = 27 - i;
    const dateStr = getPastDateString(daysAgo);
    const dSessions = focusSessions.filter((s) => s.completed && s.completedAt.startsWith(dateStr));
    const mins = dSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    let level = 0;
    if (mins >= 180) level = 4;
    else if (mins >= 120) level = 3;
    else if (mins >= 60) level = 2;
    else if (mins > 0) level = 1;

    return {
      dateStr,
      mins,
      level,
    };
  });

  // 5. Habit Consistency stats
  const habitAdherence = habits.map((h) => {
    const keys = Object.keys(h.history);
    const completedDays = keys.filter((k) => h.history[k] === true).length;
    const totalTracked = Math.max(1, keys.length);
    const rate = Math.round((completedDays / totalTracked) * 100);
    return {
      title: h.title,
      streak: h.streak,
      bestStreak: h.bestStreak,
      rate,
      timeOfDay: h.timeOfDay,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-display">
          Discipline & Focus Analytics
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Quantifiable telemetry of uninterrupted attention and habit compliance.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#111114] border border-[#1f1f24] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Total Focus Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-100 font-display tabular-nums">
            {totalFocusHoursAll} <span className="text-sm font-normal text-zinc-500 font-mono">hrs</span>
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">Across {totalCompletedSessions.length} deep sessions</p>
        </div>

        <div className="p-5 rounded-xl bg-[#111114] border border-[#1f1f24] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Avg Block Length</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-100 font-display tabular-nums">
            {avgSessionLength} <span className="text-sm font-normal text-zinc-500 font-mono">min</span>
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">Ideal flow state benchmark</p>
        </div>

        <div className="p-5 rounded-xl bg-[#111114] border border-[#1f1f24] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Task Velocity</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-100 font-display tabular-nums">
            {tasks.filter((t) => t.completed).length} <span className="text-sm font-normal text-zinc-500 font-mono">/ {tasks.length}</span>
          </p>
          <p className="text-[11px] text-emerald-400 font-mono">
            {tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#111114] border border-[#1f1f24] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Peak Habit Streak</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-100 font-display tabular-nums">
            {Math.max(0, ...habits.map((h) => h.bestStreak))} <span className="text-sm font-normal text-zinc-500 font-mono">days</span>
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">Longest unbroken sequence</p>
        </div>
      </div>

      {/* 1. Weekly Focus Minutes SVG Bar Chart */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111114] border border-[#1f1f24] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 font-display">
              Weekly Focus Rhythm (Last 7 Days)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target line indicates your {profile.dailyFocusTargetHours}h daily target ({targetMinutesPerDay}m).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Logged Focus</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-zinc-600"></span>
              <span>Daily Target</span>
            </span>
          </div>
        </div>

        {/* Clean Bar Visualization */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-64 border-b border-[#1f1f24] pb-2 relative">
            {/* Target line across grid */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-zinc-600/70 z-10 pointer-events-none"
              style={{
                bottom: `${(targetMinutesPerDay / maxDayMinutes) * 100}%`,
              }}
            >
              <span className="absolute -top-3.5 right-0 text-[10px] font-mono text-zinc-500">
                {targetMinutesPerDay}m Target
              </span>
            </div>

            {last7Days.map((day) => {
              const heightPercent = Math.min(100, (day.totalMinutes / maxDayMinutes) * 100);
              const reachedTarget = day.totalMinutes >= targetMinutesPerDay;

              return (
                <div key={day.dateStr} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-mono text-zinc-400 group-hover:text-emerald-400 transition-colors mb-2 tabular-nums">
                    {day.totalMinutes}m
                  </span>

                  <div className="w-full max-w-[48px] bg-[#16161c] rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        reachedTarget ? 'bg-emerald-400' : 'bg-emerald-600/80'
                      } ${day.isToday ? 'ring-1 ring-emerald-300' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <div className="text-center mt-3">
                    <span className={`block text-xs font-mono ${day.isToday ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      {day.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600">
                      {day.dayNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Split: 28-Day Intensity Grid + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 28-Day Heatmap Grid */}
        <div className="p-6 rounded-2xl bg-[#111114] border border-[#1f1f24] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 font-display">
                28-Day Consistency Matrix
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Density of daily deep work sessions over 4 weeks.
              </p>
            </div>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {last28Days.map((d) => (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.mins} minutes logged`}
                className={`h-9 rounded-md border flex items-center justify-center text-[10px] font-mono transition-all ${
                  d.level === 4
                    ? 'bg-emerald-400 border-emerald-300 text-zinc-950 font-bold'
                    : d.level === 3
                    ? 'bg-emerald-600/70 border-emerald-500/80 text-zinc-100'
                    : d.level === 2
                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                    : d.level === 1
                    ? 'bg-[#181820] border-[#262632] text-zinc-400'
                    : 'bg-[#121216] border-[#1c1c22] text-zinc-700'
                }`}
              >
                {d.dateStr.split('-')[2]}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-3 border-t border-[#1a1a20]">
            <span>Less Focus</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#121216] border border-[#1c1c22]"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-[#181820] border border-[#262632]"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-950/60 border border-emerald-800/60"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600/70"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400"></span>
            </div>
            <span>Deep Mastery</span>
          </div>
        </div>

        {/* Focus Category Allocation */}
        <div className="p-6 rounded-2xl bg-[#111114] border border-[#1f1f24] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 font-display">
                Cognitive Allocation by Category
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Where your attention was invested.
              </p>
            </div>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No focus sessions recorded yet.</p>
            ) : (
              categoryStats.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-200 font-medium">{cat.name}</span>
                    <span className="font-mono text-zinc-400 tabular-nums">
                      {cat.hours} hrs ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#1b1b22] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Habit Adherence League */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-[#1f1f24] space-y-4">
        <h3 className="text-base font-bold text-zinc-100 font-display">
          Habit Adherence Scorecard
        </h3>

        <div className="divide-y divide-[#1a1a20]">
          {habitAdherence.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-zinc-200 font-medium block">{item.title}</span>
                <span className="text-[10px] font-mono text-zinc-500 capitalize">{item.timeOfDay}</span>
              </div>

              <div className="flex items-center gap-6 font-mono text-right">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Current Streak</span>
                  <span className="text-emerald-400 font-bold">{item.streak} days</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Adherence</span>
                  <span className="text-zinc-200 font-semibold">{item.rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
