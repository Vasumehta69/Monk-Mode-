import React from 'react';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Repeat,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  X,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { ViewSection, UserProfile } from '../../types';

interface SidebarProps {
  currentSection: ViewSection;
  onNavigate: (section: ViewSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  profile: UserProfile;
  todayScore: number;
}

interface NavItem {
  id: ViewSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timer', label: 'Focus Timer', icon: Timer },
  { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
  { id: 'habits', label: 'Habit Tracker', icon: Repeat },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'mentor', label: 'AI Mentor', icon: Sparkles, tag: 'AI' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  profile,
  todayScore,
}) => {
  const handleSelect = (sec: ViewSection) => {
    onNavigate(sec);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c0c0e] border-r border-[#1a1a20] flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1a1a20]">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/monk_mode_logo_1794485318148.jpg"
              alt="Monk Mode Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/50 shadow-[0_0_14px_rgba(16,185,129,0.3)] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-wider text-zinc-100 font-display uppercase truncate">
                  MONK MODE
                </h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  VIP
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight truncate">
                Discipline Over Distraction
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-[#16161c]"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#15151a] text-zinc-100 border border-emerald-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#131317]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.tag && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                      isActive
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                        : 'border-[#26262e] text-zinc-400'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Monk Pledge & Daily Score Card */}
        <div className="p-3 border-t border-[#1a1a20] space-y-2">
          {/* VIP User Profile bar */}
          <div
            onClick={() => handleSelect('settings')}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-[#111114] hover:bg-[#16161b] border border-[#1e1e24] cursor-pointer transition-colors group"
          >
            <img
              src="/src/assets/images/vip_monk_avatar_1794485319775.jpg"
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/50 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-emerald-300 transition-colors">
                  {profile.name}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">SOVEREIGN</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 block truncate">
                Day {profile.monkModeDayCount} · Deep Flow
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111114] border border-[#1e1e24] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono text-[11px]">Productivity Score</span>
              <span className="text-emerald-400 font-bold font-mono text-xs tabular-nums">
                {todayScore}%
              </span>
            </div>

            {/* Score progress track */}
            <div className="w-full bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, todayScore))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-[#1a1a20]">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" />
                <span>Streak</span>
              </span>
              <span className="font-mono text-zinc-300 font-medium">{profile.monkModeDayCount} Days</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
