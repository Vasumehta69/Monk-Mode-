import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  Tag,
  Check,
  Music
} from 'lucide-react';
import { Task, FocusSession, UserProfile } from '../../types';
import { soundEngine } from '../../utils/audio';

interface FocusTimerViewProps {
  tasks: Task[];
  profile: UserProfile;
  onSaveSession: (session: Omit<FocusSession, 'id'>) => void;
  onIncrementTaskBlock: (taskId: string) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

type PresetMinutes = 25 | 45 | 60 | 90;

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  tasks,
  profile,
  onSaveSession,
  onIncrementTaskBlock,
  isZenMode,
  onToggleZenMode,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(45);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [ambientChoice, setAmbientChoice] = useState<'none' | 'white-noise' | 'rain' | 'theta' | 'campfire'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(profile.ambientVolume || 0.35);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [hasCompletedAlert, setHasCompletedAlert] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  // Set preset
  const handleSelectPreset = (minutes: number) => {
    if (isActive) return;
    setSelectedMinutes(minutes);
    setTimeLeftSeconds(minutes * 60);
    setShowCustomInput(false);
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(customMinutesInput, 10);
    if (!isNaN(num) && num > 0 && num <= 180) {
      setSelectedMinutes(num);
      setTimeLeftSeconds(num * 60);
      setShowCustomInput(false);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isActive && timeLeftSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeftSeconds]);

  const handleToggleTimer = () => {
    if (!isActive) {
      soundEngine.playTick(profile.soundVolume);
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = new Date();
      }
      setIsActive(true);

      // Start ambient sound if selected
      if (ambientChoice !== 'none') {
        soundEngine.setAmbientSound(ambientChoice, ambientVolume);
      }
    } else {
      soundEngine.playTick(profile.soundVolume);
      setIsActive(false);
    }
  };

  const handleResetTimer = () => {
    soundEngine.playTick(profile.soundVolume);
    setIsActive(false);
    setTimeLeftSeconds(selectedMinutes * 60);
    sessionStartTimeRef.current = null;
  };

  const handleCompleteSession = (naturalFinish: boolean) => {
    setIsActive(false);
    soundEngine.playZenBell(profile.soundVolume);
    setHasCompletedAlert(true);

    const targetMinutes = selectedMinutes;
    const elapsedSeconds = (selectedMinutes * 60) - timeLeftSeconds;
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const linkedTask = tasks.find((t) => t.id === selectedTaskId);

    onSaveSession({
      durationMinutes: naturalFinish ? targetMinutes : actualMinutes,
      targetMinutes: targetMinutes,
      startedAt: (sessionStartTimeRef.current || new Date()).toISOString(),
      completedAt: new Date().toISOString(),
      completed: true,
      taskId: linkedTask?.id,
      taskTitle: linkedTask?.title,
      category: linkedTask?.category || 'Deep Work',
      notes: sessionNotes || undefined,
    });

    if (selectedTaskId) {
      onIncrementTaskBlock(selectedTaskId);
    }

    sessionStartTimeRef.current = null;
    setTimeLeftSeconds(selectedMinutes * 60);

    setTimeout(() => {
      setHasCompletedAlert(false);
    }, 5000);
  };

  // Ambient sound switcher
  const handleAmbientChange = (choice: 'none' | 'white-noise' | 'rain' | 'theta' | 'campfire') => {
    setAmbientChoice(choice);
    if (choice === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.setAmbientSound(choice, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundEngine.setAmbientVolume(vol);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular calculations
  const totalDuration = selectedMinutes * 60;
  const progressRatio = (totalDuration - timeLeftSeconds) / totalDuration;
  const strokeDashoffset = 880 * (1 - progressRatio);

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${isZenMode ? 'py-12' : 'pb-12'}`}>
      {/* Session complete banner */}
      {hasCompletedAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">
              Focus block logged successfully! Zen chime played.
            </span>
          </div>
          <span className="font-mono text-emerald-400/80">+{selectedMinutes}m Deep Work</span>
        </div>
      )}

      {/* Main Timer Display Card */}
      <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-8 sm:p-12 flex flex-col items-center relative overflow-hidden">
        {/* Zen mode button in top right of card */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
            className="p-2 text-zinc-400 hover:text-zinc-200 border border-[#222228] hover:bg-[#16161c] rounded-lg transition-colors text-xs flex items-center gap-1.5"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{isZenMode ? 'Exit Zen' : 'Zen View'}</span>
          </button>
        </div>

        {/* Selected Task Indicator with VIP Logo Badge */}
        <div className="mb-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#15151a] border border-[#22222a]">
          <img
            src="/src/assets/images/monk_mode_logo_1794485318148.jpg"
            alt="VIP Monk Emblem"
            referrerPolicy="no-referrer"
            className="w-4 h-4 rounded-full object-cover ring-1 ring-emerald-500/60 shrink-0"
          />
          <span className="text-[11px] font-mono text-zinc-400">Target Focus:</span>
          <span className="text-xs text-zinc-200 font-semibold truncate max-w-xs">
            {tasks.find((t) => t.id === selectedTaskId)?.title || 'General Monk Mode Deep Sprint'}
          </span>
        </div>

        {/* Circular Progress + Time display */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r="135"
              className="stroke-[#191920]"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="150"
              cy="150"
              r="135"
              className="stroke-emerald-400 transition-all duration-1000 ease-linear"
              strokeWidth="7"
              strokeDasharray="848"
              strokeDashoffset={848 * (1 - progressRatio)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time & State in center */}
          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <span className="text-6xl sm:text-7xl font-extrabold text-zinc-100 font-display tracking-tight tabular-nums drop-shadow-md">
              {formattedTime}
            </span>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest pt-1 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
              <span>{isActive ? 'In Deep Flow' : timeLeftSeconds === selectedMinutes * 60 ? 'Ready' : 'Paused'}</span>
            </span>
          </div>
        </div>

        {/* Controls: Start / Pause / Reset / Complete */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleResetTimer}
            title="Reset timer"
            className="p-3 text-zinc-400 hover:text-zinc-200 bg-[#16161b] hover:bg-[#1e1e25] border border-[#26262e] rounded-xl transition-all"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-sm tracking-wide rounded-xl shadow-lg transition-all flex items-center gap-2.5 active:scale-95"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Start Deep Work</span>
              </>
            )}
          </button>

          {timeLeftSeconds < selectedMinutes * 60 && (
            <button
              onClick={() => handleCompleteSession(false)}
              title="Finish & log session now"
              className="p-3 text-emerald-400 hover:text-emerald-300 bg-[#16161b] hover:bg-[#1e1e25] border border-emerald-950 rounded-xl transition-all"
              aria-label="Finish and log session"
            >
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Duration Presets */}
        <div className="mt-8 pt-8 border-t border-[#1a1a20] w-full max-w-lg flex flex-wrap items-center justify-center gap-2">
          {([25, 45, 60, 90] as PresetMinutes[]).map((m) => (
            <button
              key={m}
              onClick={() => handleSelectPreset(m)}
              disabled={isActive}
              className={`px-4 py-2 text-xs font-mono font-medium rounded-lg border transition-all ${
                selectedMinutes === m && !showCustomInput
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#141418] border-[#222228] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {m} Min
            </button>
          ))}

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={isActive}
            className={`px-3 py-2 text-xs font-mono rounded-lg border transition-all ${
              showCustomInput
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                : 'bg-[#141418] border-[#222228] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom duration inline form */}
        {showCustomInput && !isActive && (
          <form onSubmit={handleApplyCustomMinutes} className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="180"
              placeholder="Minutes (e.g. 50)"
              value={customMinutesInput}
              onChange={(e) => setCustomMinutesInput(e.target.value)}
              className="w-36 px-3 py-1.5 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-emerald-400 text-zinc-950 font-semibold rounded-lg hover:bg-emerald-300"
            >
              Set
            </button>
          </form>
        )}
      </div>

      {/* Auxiliary Settings: Link Task & Ambient Sound Generators */}
      {!isZenMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Link Task Box */}
          <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100 font-display">
                Assign Focus to Task
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              When finished, this focus block will automatically credit to your selected task.
            </p>

            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#15151a] border border-[#24242c] rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans"
            >
              <option value="">No task linked (General Deep Work)</option>
              {tasks
                .filter((t) => !t.completed)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.priority}] {t.title} ({t.completedBlocks}/{t.estimatedBlocks} blocks)
                  </option>
                ))}
            </select>

            <div className="pt-2">
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Session Intent Note (Optional)
              </label>
              <input
                type="text"
                placeholder="What single outcome constitutes victory for this block?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#15151a] border border-[#24242c] rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Ambient Sound Box */}
          <div className="rounded-xl bg-[#111114] border border-[#1f1f24] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100 font-display">
                  Monk Ambient Sound
                </h3>
              </div>
              {ambientChoice !== 'none' && (
                <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                  Playing Active
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400">
              Zero distractions. Synthesized binaural noise & weather frequencies.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { id: 'none', label: 'Silence' },
                { id: 'rain', label: 'Rain Storm' },
                { id: 'theta', label: 'Theta 432Hz' },
                { id: 'white-noise', label: 'White Noise' },
                { id: 'campfire', label: 'Campfire' },
              ].map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleAmbientChange(sound.id as any)}
                  className={`px-3 py-2 rounded-lg border text-left transition-all ${
                    ambientChoice === sound.id
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#15151a] border-[#22222a] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {ambientChoice !== 'none' && (
              <div className="space-y-1 pt-2 border-t border-[#1a1a20]">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Volume</span>
                  <span>{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-[#22222a] rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
