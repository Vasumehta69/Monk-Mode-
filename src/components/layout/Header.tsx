import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Flame, 
  Sparkles,
  Menu,
  Clock
} from 'lucide-react';
import { UserProfile, ViewSection } from '../../types';
import { soundEngine } from '../../utils/audio';

interface HeaderProps {
  currentSection: ViewSection;
  onNavigate: (section: ViewSection) => void;
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onOpenMobileMenu: () => void;
  todayScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onNavigate,
  profile,
  onUpdateProfile,
  isZenMode,
  onToggleZenMode,
  onOpenMobileMenu,
  todayScore,
}) => {
  const [ambientActive, setAmbientActive] = React.useState(profile.ambientSound !== 'none');

  const handleToggleAmbient = () => {
    if (ambientActive) {
      soundEngine.stopAmbient();
      setAmbientActive(false);
      onUpdateProfile({ ambientSound: 'none' });
    } else {
      const nextSound = 'rain';
      soundEngine.setAmbientSound(nextSound, profile.ambientVolume);
      setAmbientActive(true);
      onUpdateProfile({ ambientSound: nextSound });
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const getSectionTitle = (sec: ViewSection) => {
    switch (sec) {
      case 'dashboard': return 'Dashboard';
      case 'timer': return 'Focus Timer';
      case 'tasks': return 'Task Manager';
      case 'habits': return 'Habit Tracker';
      case 'journal': return 'Reflective Journal';
      case 'mentor': return 'AI Mentor';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#1c1c21] bg-[#09090b]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Brand with VIP Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#141418] rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img
            src="/src/assets/images/monk_mode_logo_1794485318148.jpg"
            alt="Monk Mode Emblem"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
          />
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-bold text-zinc-100 tracking-wider font-display text-xs uppercase">
              MONK MODE
            </span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300 font-medium whitespace-nowrap text-xs">{getSectionTitle(currentSection)}</span>
          </div>
        </div>
      </div>

      {/* Zone 2: Minimalist Central Stats & Date */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-zinc-400 font-mono">
        <span className="text-zinc-300">{todayFormatted}</span>
        <span className="text-zinc-700">·</span>
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          <span>Day {profile.monkModeDayCount}</span>
        </span>
        <span className="text-zinc-700">·</span>
        <span className="text-emerald-400 font-semibold tabular-nums">Score: {todayScore}%</span>
      </div>

      {/* Zone 3: Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Ambient sound toggle */}
        <button
          onClick={handleToggleAmbient}
          title={ambientActive ? `Ambient Sound Active (${profile.ambientSound})` : 'Start Ambient Focus Sound'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            ambientActive
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-[#121215] border-[#222228] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          {ambientActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline capitalize font-mono text-[11px]">{profile.ambientSound}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline font-mono text-[11px]">Sound Off</span>
            </>
          )}
        </button>

        {/* Quick Launch Focus Button */}
        {currentSection !== 'timer' && (
          <button
            onClick={() => onNavigate('timer')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Timer</span>
          </button>
        )}

        {/* Zen Mode Toggle */}
        <button
          onClick={onToggleZenMode}
          title={isZenMode ? 'Exit Zen Mode (Esc)' : 'Enter Distraction-Free Zen Mode'}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#141418] border border-[#222228] rounded-lg transition-colors"
          aria-label="Toggle Zen mode"
        >
          {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* VIP Sovereign Avatar button */}
        <button
          onClick={() => onNavigate('settings')}
          title="VIP Member Profile"
          className="flex items-center gap-2 pl-2 border-l border-[#22222a] group"
        >
          <img
            src="/src/assets/images/vip_monk_avatar_1794485319775.jpg"
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50 group-hover:ring-emerald-400 transition-all shadow-sm"
          />
          <span className="hidden xl:inline text-[11px] font-mono text-zinc-300 font-medium">
            VIP Sovereign
          </span>
        </button>
      </div>
    </header>
  );
};
