import React, { useState } from 'react';
import {
  User,
  Sliders,
  Volume2,
  Download,
  Upload,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  Save
} from 'lucide-react';
import { UserProfile } from '../../types';
import { soundEngine } from '../../utils/audio';
import { exportDataAsJSON, importDataFromJSON, resetToDemoData } from '../../services/storage';
import { firebaseBlueprint, firebaseBridge, FirebaseConfigState } from '../../services/firebase';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
}) => {
  // Local profile edits
  const [name, setName] = useState(profile.name);
  const [mantra, setMantra] = useState(profile.monkMantra);
  const [dailyFocusTargetHours, setDailyFocusTargetHours] = useState(profile.dailyFocusTargetHours);
  const [theme, setTheme] = useState(profile.theme);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [soundVolume, setSoundVolume] = useState(profile.soundVolume);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Firebase Config State
  const [fbConfig, setFbConfig] = useState<FirebaseConfigState>(firebaseBridge.getConfig());
  const [fbProjectId, setFbProjectId] = useState(fbConfig.projectId || '');
  const [fbStatusMessage, setFbStatusMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      monkMantra: mantra,
      dailyFocusTargetHours: Number(dailyFocusTargetHours),
      theme,
      soundEnabled,
      soundVolume: Number(soundVolume),
    });

    setSaveSuccess(true);
    soundEngine.playTick(profile.soundVolume);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestChime = () => {
    soundEngine.playZenBell(soundVolume);
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = firebaseBridge.saveConfig({
      projectId: fbProjectId,
      isInitialized: Boolean(fbProjectId),
    });
    setFbConfig(updated);
    setFbStatusMessage('Firebase connection parameters cached locally.');
    setTimeout(() => setFbStatusMessage(null), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataFromJSON(content);
        if (success) {
          window.location.reload();
        } else {
          alert('Failed to parse backup JSON. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-display">
          Monk Mode Configuration
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tune your discipline parameters, sound frequencies, and data persistence vault.
        </p>
      </div>

      {/* VIP Sovereign Membership Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#131318] via-[#0f0f13] to-[#0a0a0d] border border-[#2a2a35] p-6 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="/src/assets/images/vip_monk_avatar_1794485319775.jpg"
                alt="VIP Member"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500 shadow-lg"
              />
              <img
                src="/src/assets/images/monk_mode_logo_1794485318148.jpg"
                alt="VIP Insignia"
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#0a0a0d] absolute -bottom-1 -right-1 shadow-md"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-100 font-display">
                  {name || profile.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  VIP Sovereign
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Black Edition · Member #MM-7729 · High Cognitive Vault
              </p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 font-mono">
                <span className="text-emerald-400 font-semibold">{profile.monkModeDayCount} Days in Monk Mode</span>
                <span>·</span>
                <span>Active Shield: 100%</span>
              </div>
            </div>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#1a1a24]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              Discipline Status
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg mt-1">
              UNBROKEN
            </span>
          </div>
        </div>
      </div>

      {/* 1. Profile & Monk Pledge Form */}
      <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1a1a20] pb-3">
          <User className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-100 font-display">
            Monk Profile & Daily Focus Target
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Monk Name / Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Daily Focus Goal (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={dailyFocusTargetHours}
                onChange={(e) => setDailyFocusTargetHours(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Monk Mode Pledge / Mantra
            </label>
            <textarea
              rows={2}
              value={mantra}
              onChange={(e) => setMantra(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Theme selection */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              Visual Atmosphere
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'matte-black', label: 'Matte Black', sub: 'Subtle dark grey' },
                { id: 'amoled', label: 'AMOLED Pure', sub: 'Zero-light black' },
                { id: 'charcoal', label: 'Charcoal Slate', sub: 'Deep titanium' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    theme === th.id
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#15151a] border-[#222228] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="block text-xs font-semibold">{th.label}</span>
                  <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{th.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1a1a20]">
            <div>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully.</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Audio & Notifications Preferences */}
      <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1a1a20] pb-3">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-100 font-display">
            Acoustic & Notification Tuning
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-zinc-200 block">Tibetan Singing Bowl Chime</span>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Play a resonant synthesized harmonic bell upon completing focus blocks.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                onUpdateProfile({ soundEnabled: next });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-emerald-500' : 'bg-[#22222a]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {soundEnabled && (
            <div className="space-y-2 pt-2 border-t border-[#1a1a20]">
              <div className="flex justify-between font-mono text-[11px] text-zinc-400">
                <span>Sound Master Volume</span>
                <span>{Math.round(soundVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setSoundVolume(vol);
                    onUpdateProfile({ soundVolume: vol });
                  }}
                  className="w-full accent-emerald-500 h-1.5 bg-[#22222a] rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="px-3 py-1 text-xs bg-[#1a1a22] hover:bg-[#252530] text-zinc-300 rounded-lg whitespace-nowrap border border-[#2a2a34]"
                >
                  Test Chime
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Firebase Cloud Architecture Ready Panel */}
      <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1a1a20] pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100 font-display">
              Firebase Cloud Synchronization Architecture
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-900/40">
            Offline Vault Active
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          MONK MODE features a decoupled cloud schema blueprint. Your tasks, habits, focus logs, and journals are persisted locally and ready for Firebase Firestore and Auth integration.
        </p>

        {/* Blueprint Overview */}
        <div className="p-4 rounded-xl bg-[#141419] border border-[#202028] space-y-2 text-xs">
          <span className="font-mono text-zinc-300 font-semibold block">
            Integrated Collection Blueprint:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-zinc-400">
            {Object.keys(firebaseBlueprint.collections).map((col) => (
              <div key={col} className="p-2 bg-[#181820] rounded border border-[#262632]">
                <span className="text-emerald-400">/{col}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Firebase Project ID (Optional for Cloud Sync)
            </label>
            <input
              type="text"
              placeholder="e.g. monk-mode-production"
              value={fbProjectId}
              onChange={(e) => setFbProjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {fbStatusMessage && (
              <span className="text-xs font-mono text-emerald-400">{fbStatusMessage}</span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 text-xs bg-[#1c1c24] hover:bg-[#242430] text-zinc-200 border border-[#2a2a36] rounded-lg font-medium transition-colors"
            >
              Update Cloud Config
            </button>
          </div>
        </form>
      </div>

      {/* 4. Data Management: Backup, Export, Import, Reset */}
      <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1a1a20] pb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-100 font-display">
            Vault Backup & Data Management
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          All data is strictly your property. Export a portable JSON backup of your entire Monk Mode history, restore an existing vault, or reset demo seed data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export button */}
          <button
            type="button"
            onClick={exportDataAsJSON}
            className="p-3.5 rounded-xl bg-[#141419] hover:bg-[#181822] border border-[#22222a] hover:border-zinc-700 text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-emerald-400">
              <Download className="w-4 h-4" />
              <span className="text-xs font-semibold">Export JSON</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Download full encrypted vault</p>
          </button>

          {/* Import file input label */}
          <label className="p-3.5 rounded-xl bg-[#141419] hover:bg-[#181822] border border-[#22222a] hover:border-zinc-700 text-left transition-all space-y-1 cursor-pointer block">
            <div className="flex items-center gap-2 text-zinc-300">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">Import Backup</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Restore from .json file</p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all tasks, habits, and journals to fresh demo state?')) {
                onResetData();
              }
            }}
            className="p-3.5 rounded-xl bg-[#141419] hover:bg-[#1f1517] border border-[#22222a] hover:border-rose-900/50 text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-semibold">Reset Demo Data</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Revert to initial seed records</p>
          </button>
        </div>
      </div>
    </div>
  );
};
