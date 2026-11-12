import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Calendar,
  Zap,
  Target,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  Task,
  Habit,
  FocusSession,
  UserProfile,
  ViewSection,
  DailyProductivityScore
} from '../../types';
import { getTodayDateString } from '../../services/storage';

interface DashboardViewProps {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  profile: UserProfile;
  dailyScore: DailyProductivityScore;
  onNavigate: (section: ViewSection) => void;
  onToggleTask: (taskId: string) => void;
  onToggleHabitToday: (habitId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  habits,
  focusSessions,
  profile,
  dailyScore,
  onNavigate,
  onToggleTask,
  onToggleHabitToday,
}) => {
  const today = getTodayDateString();

  // Focus metrics today
  const todaySessions = focusSessions.filter(
    (s) => s.completed && s.completedAt.startsWith(today)
  );
  const totalFocusMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const focusHoursLoggedToday = (totalFocusMinutesToday / 60).toFixed(1);
  const targetFocusMinutes = profile.dailyFocusTargetHours * 60;
  const focusProgressPercent = Math.min(
    100,
    Math.round((totalFocusMinutesToday / targetFocusMinutes) * 100)
  );

  // Tasks metrics
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || t.completedAt?.startsWith(today)
  );
  const displayTasks = todayTasks.length > 0 ? todayTasks : tasks.slice(0, 5);
  const completedTasksCount = displayTasks.filter((t) => t.completed).length;

  // Habit metrics
  const completedHabitsToday = habits.filter((h) => h.history[today] === true).length;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Stoic greeting quotes
  const quotes = [
    "You have power over your mind - not outside events. Realize this, and you will find strength.",
    "No man is free who is not master of himself.",
    "Do every act of your life as if it were your last.",
    "Silence is a lesson learned through life's many sufferings.",
    "First say to yourself what you would be; and then do what you have to do."
  ];
  const quoteIndex = new Date().getDate() % quotes.length;
  const activeQuote = quotes[quoteIndex];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Top Hero: VIP Sanctuary & Executive Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0e0e12] border border-[#1f1f26] p-6 sm:p-8 shadow-xl">
        {/* VIP Sanctuary Background Backdrop with Contrast Scrim */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <img
            src="/src/assets/images/vip_monk_sanctuary_1794485319575.jpg"
            alt="VIP Monk Sanctuary"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e12] via-[#0e0e12]/90 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                VIP SOVEREIGN EDITION
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-emerald-400 font-semibold">Day {profile.monkModeDayCount} of Monk Mode</span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <img
                src="/src/assets/images/vip_monk_avatar_1794485319775.jpg"
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50 shadow-md shrink-0"
              />
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100 font-display">
                  Welcome back, {profile.name}.
                </h2>
                <p className="text-xs text-zinc-400 font-mono tracking-tight">
                  Status: High Cognitive Flow · Distraction Shield Active
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed italic pt-1 border-l-2 border-emerald-500/60 pl-3">
              "{activeQuote}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('timer')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>Enter Focus Session</span>
            </button>

            <button
              onClick={() => onNavigate('mentor')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-200 bg-[#16161d] hover:bg-[#1e1e27] border border-[#262632] rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Mentor Brief</span>
            </button>
          </div>
        </div>

        {/* Mantra Banner */}
        <div className="relative z-10 mt-6 pt-5 border-t border-[#1a1a24] flex items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300 font-semibold tracking-tight whitespace-nowrap">Active Pledge:</span>
            <span className="text-zinc-400 truncate italic">{profile.monkMantra}</span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            Edit Pledge →
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Daily Productivity Score */}
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">Daily Productivity Score</span>
            <span className="text-emerald-400 text-xs font-mono font-medium">{dailyScore.rating}</span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-zinc-100 font-display tabular-nums">
              {dailyScore.score}
            </span>
            <span className="text-sm font-mono text-zinc-400">/ 100</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-zinc-400">
            <div className="flex justify-between">
              <span>Task Efficiency ({dailyScore.taskComponent}/40)</span>
              <span className="text-zinc-300 font-mono">{Math.round((dailyScore.taskComponent / 40) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Deep Focus ({dailyScore.focusComponent}/40)</span>
              <span className="text-zinc-300 font-mono">{Math.round((dailyScore.focusComponent / 40) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Habit Compliance ({dailyScore.habitComponent}/20)</span>
              <span className="text-zinc-300 font-mono">{Math.round((dailyScore.habitComponent / 20) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Focus Hours */}
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">Focus Hours Today</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-zinc-100 font-display tabular-nums">
              {focusHoursLoggedToday}
            </span>
            <span className="text-sm font-mono text-zinc-400">/ {profile.dailyFocusTargetHours} hrs</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>Target Progress</span>
              <span className="text-emerald-400">{focusProgressPercent}%</span>
            </div>
            <div className="w-full bg-[#1b1b21] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${focusProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Completed Tasks */}
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-zinc-100 font-display tabular-nums">
              {completedTasksCount}
            </span>
            <span className="text-sm font-mono text-zinc-400">/ {displayTasks.length} active</span>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1a1a20]">
            <span>Remaining high-impact:</span>
            <span className="font-mono text-zinc-200 font-medium">
              {displayTasks.filter((t) => !t.completed).length} items
            </span>
          </div>
        </div>

        {/* Metric 4: Active Habits */}
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">Active Habits</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-zinc-100 font-display tabular-nums">
              {completedHabitsToday}
            </span>
            <span className="text-sm font-mono text-zinc-400">/ {habits.length} done</span>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1a1a20]">
            <span>Today's discipline:</span>
            <span className="font-mono text-emerald-400 font-medium">
              {habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Split: Daily Tasks & Active Habits Quick-Check */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Today's High-Leverage Tasks */}
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100 font-display">
                Priority Action Items
              </h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#1a1a20]">
            {displayTasks.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">No active tasks logged for today.</p>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="px-3 py-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-lg hover:bg-emerald-950/60"
                >
                  Create High-Leverage Task
                </button>
              </div>
            ) : (
              displayTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3 flex items-start justify-between gap-3 group transition-colors"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug transition-all ${
                        task.completed
                          ? 'line-through text-zinc-500'
                          : 'text-zinc-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono">
                      <span>{task.category}</span>
                      <span>·</span>
                      <span
                        className={
                          task.priority === 'HIGH'
                            ? 'text-rose-400 font-semibold'
                            : task.priority === 'MEDIUM'
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                        }
                      >
                        {task.priority} Priority
                      </span>
                      <span>·</span>
                      <span>{task.completedBlocks}/{task.estimatedBlocks} blocks</span>
                    </div>
                  </div>

                  {!task.completed && (
                    <button
                      onClick={() => onNavigate('timer')}
                      title="Focus on this task now"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-zinc-400 hover:text-emerald-400 rounded hover:bg-[#1a1a20]"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Daily Habits Routine */}
        <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-zinc-100 font-display">
                Non-Negotiable Habits
              </h3>
            </div>
            <button
              onClick={() => onNavigate('habits')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>View Streaks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#1a1a20]">
            {habits.map((habit) => {
              const isDone = habit.history[today] === true;
              return (
                <div
                  key={habit.id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleHabitToday(habit.id)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-[#26262e] bg-[#141419] text-transparent hover:border-zinc-500'
                      }`}
                      aria-label={`Toggle habit ${habit.title}`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          isDone ? 'text-zinc-400 line-through' : 'text-zinc-200'
                        }`}
                      >
                        {habit.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                        <span className="capitalize">{habit.timeOfDay}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Flame className="w-2.5 h-2.5" />
                          <span>{habit.streak} day streak</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400">
                    {isDone ? 'Done' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Quick Action Shortcuts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('timer')}
          className="rounded-xl bg-[#111114] hover:bg-[#15151a] border border-[#1f1f24] hover:border-emerald-500/40 p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-emerald-400">Deep Work</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">
            25m / 45m / 90m Focus Sessions
          </h4>
          <p className="text-xs text-zinc-400">
            Start a distraction-free countdown with ambient binaural audio.
          </p>
        </div>

        <div
          onClick={() => onNavigate('mentor')}
          className="rounded-xl bg-[#111114] hover:bg-[#15151a] border border-[#1f1f24] hover:border-emerald-500/40 p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-emerald-400">AI Intelligence</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">
            Gemini Monk Mode Mentor
          </h4>
          <p className="text-xs text-zinc-400">
            Generate needle-moving goals and audit your schedule for maximum leverage.
          </p>
        </div>

        <div
          onClick={() => onNavigate('journal')}
          className="rounded-xl bg-[#111114] hover:bg-[#15151a] border border-[#1f1f24] hover:border-emerald-500/40 p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-emerald-400">Evening Review</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">
            Reflective Journaling
          </h4>
          <p className="text-xs text-zinc-400">
            Record clarity, analyze friction vectors, and solidify today’s victories.
          </p>
        </div>
      </div>
    </div>
  );
};
