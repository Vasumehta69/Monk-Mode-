import {
  Task,
  Habit,
  FocusSession,
  JournalEntry,
  UserProfile,
  DailyProductivityScore,
} from '../types';

export interface MonkModeStorageData {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  journalEntries: JournalEntry[];
  profile: UserProfile;
  lastUpdated: string;
}

const STORAGE_KEY = 'monk_mode_v1_store';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultProfile: UserProfile = {
  name: 'Marcus',
  tagline: 'Discipline Over Distraction',
  monkMantra: 'We must all suffer one of two things: the pain of discipline or the pain of regret.',
  dailyFocusTargetHours: 4,
  monkModeDayCount: 24,
  monkModeStartDate: getPastDateString(24),
  theme: 'matte-black',
  soundEnabled: true,
  soundVolume: 0.6,
  ambientSound: 'none',
  ambientVolume: 0.35,
  firebaseConfigured: false,
};

export const initialSeedData: MonkModeStorageData = {
  profile: defaultProfile,
  tasks: [
    {
      id: 'task-1',
      title: 'Architect production data layer & offline sync',
      description: 'Design the resilient schema for client-side offline storage and cloud synchronization.',
      priority: 'HIGH',
      completed: true,
      completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      estimatedBlocks: 3,
      completedBlocks: 3,
      dueDate: getTodayDateString(),
      category: 'Deep Work',
      createdAt: getPastDateString(1),
    },
    {
      id: 'task-2',
      title: 'Write technical brief for next quarter initiative',
      description: 'Zero distractions. Craft the core problem statement, trade-offs, and rollout roadmap.',
      priority: 'HIGH',
      completed: true,
      completedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      estimatedBlocks: 2,
      completedBlocks: 2,
      dueDate: getTodayDateString(),
      category: 'Strategy',
      createdAt: getTodayDateString(),
    },
    {
      id: 'task-3',
      title: 'Refactor high-latency database queries & indexing',
      description: 'Isolate queries >150ms and eliminate N+1 query patterns.',
      priority: 'HIGH',
      completed: false,
      estimatedBlocks: 2,
      completedBlocks: 1,
      dueDate: getTodayDateString(),
      category: 'Code',
      createdAt: getTodayDateString(),
    },
    {
      id: 'task-4',
      title: 'Read 25 pages of Meditations (Marcus Aurelius)',
      description: 'Book VII: Focus on stillness of the mind and accepting what cannot be controlled.',
      priority: 'MEDIUM',
      completed: false,
      estimatedBlocks: 1,
      completedBlocks: 0,
      dueDate: getTodayDateString(),
      category: 'Study',
      createdAt: getTodayDateString(),
    },
    {
      id: 'task-5',
      title: 'Triage inbox and cancel 3 unnecessary recurring meetings',
      description: 'Protect monk mode deep work blocks from calendar fragmentation.',
      priority: 'LOW',
      completed: false,
      estimatedBlocks: 1,
      completedBlocks: 0,
      dueDate: getTodayDateString(),
      category: 'Admin',
      createdAt: getTodayDateString(),
    },
  ],
  habits: [
    {
      id: 'habit-1',
      title: '05:30 AM Wake Up & Cold Exposure',
      description: 'No snooze button. Immediate cold shower to reset alertness.',
      frequency: 'daily',
      timeOfDay: 'morning',
      streak: 18,
      bestStreak: 24,
      history: {
        [getPastDateString(4)]: true,
        [getPastDateString(3)]: true,
        [getPastDateString(2)]: true,
        [getPastDateString(1)]: true,
        [getTodayDateString()]: true,
      },
      createdAt: getPastDateString(24),
    },
    {
      id: 'habit-2',
      title: 'Zero Phone First 60 Minutes',
      description: 'Keep smartphone in another room until deep morning intention is set.',
      frequency: 'daily',
      timeOfDay: 'morning',
      streak: 12,
      bestStreak: 19,
      history: {
        [getPastDateString(4)]: true,
        [getPastDateString(3)]: true,
        [getPastDateString(2)]: true,
        [getPastDateString(1)]: true,
        [getTodayDateString()]: true,
      },
      createdAt: getPastDateString(24),
    },
    {
      id: 'habit-3',
      title: '90-Minute Uninterrupted Deep Work Sprint',
      description: 'No browser tabs, no messaging, singular focus on the hardest problem.',
      frequency: 'daily',
      timeOfDay: 'morning',
      streak: 21,
      bestStreak: 21,
      history: {
        [getPastDateString(4)]: true,
        [getPastDateString(3)]: true,
        [getPastDateString(2)]: true,
        [getPastDateString(1)]: true,
        [getTodayDateString()]: true,
      },
      createdAt: getPastDateString(24),
    },
    {
      id: 'habit-4',
      title: 'Daily 4L Hydration & Clean Fuel',
      description: 'Zero processed sugars. High cognitive stamina nutrition.',
      frequency: 'daily',
      timeOfDay: 'afternoon',
      streak: 9,
      bestStreak: 15,
      history: {
        [getPastDateString(4)]: true,
        [getPastDateString(3)]: true,
        [getPastDateString(2)]: false,
        [getPastDateString(1)]: true,
        [getTodayDateString()]: false,
      },
      createdAt: getPastDateString(20),
    },
    {
      id: 'habit-5',
      title: 'Evening Monk Mode Journal & Digital Blackout',
      description: 'Reflect on where focus slipped. Screens off 60 minutes before sleep.',
      frequency: 'daily',
      timeOfDay: 'evening',
      streak: 14,
      bestStreak: 18,
      history: {
        [getPastDateString(4)]: true,
        [getPastDateString(3)]: true,
        [getPastDateString(2)]: true,
        [getPastDateString(1)]: true,
        [getTodayDateString()]: false,
      },
      createdAt: getPastDateString(24),
    },
  ],
  focusSessions: [
    {
      id: 'session-1',
      durationMinutes: 90,
      targetMinutes: 90,
      startedAt: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      completed: true,
      taskId: 'task-1',
      taskTitle: 'Architect production data layer & offline sync',
      category: 'Deep Work',
      notes: 'Total flow state. Zero interruptions. Completed core schema.',
    },
    {
      id: 'session-2',
      durationMinutes: 60,
      targetMinutes: 60,
      startedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
      completed: true,
      taskId: 'task-2',
      taskTitle: 'Write technical brief for next quarter initiative',
      category: 'Strategy',
      notes: 'Clarified executive summary and key engineering milestones.',
    },
    {
      id: 'session-3',
      durationMinutes: 45,
      targetMinutes: 45,
      startedAt: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 0.45 * 3600 * 1000).toISOString(),
      completed: true,
      taskId: 'task-3',
      taskTitle: 'Refactor high-latency database queries & indexing',
      category: 'Code',
      notes: 'Profiling slow logs. Identified 2 critical missing indices.',
    },
    {
      id: 'session-past-1',
      durationMinutes: 90,
      targetMinutes: 90,
      startedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 24.5 * 3600 * 1000).toISOString(),
      completed: true,
      category: 'Deep Work',
      notes: 'Yesterday morning core focus sprint.',
    },
    {
      id: 'session-past-2',
      durationMinutes: 60,
      targetMinutes: 60,
      startedAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      completed: true,
      category: 'Code',
      notes: 'Clean code cleanup.',
    },
  ],
  journalEntries: [
    {
      id: 'journal-today',
      date: getTodayDateString(),
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      clarityScore: 5,
      morningIntention: 'Deliver the architectural blueprint without checking communications until noon. Protect deep focus at all costs.',
      eveningReview: 'Maintained strict focus through the 90m and 60m blocks. Energy remained high by avoiding sugar.',
      distractionsEncountered: 'Brief urge to check news around 11:30 AM; stepped away for water instead.',
      oneBigVictory: 'Finished both high-leverage deliverables ahead of schedule.',
      gratitudeOrStoicNote: 'The impediment to action advances action. What stands in the way becomes the way.',
      tags: ['Flow', 'Architecture', 'Stoic'],
    },
    {
      id: 'journal-yesterday',
      date: getPastDateString(1),
      createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      clarityScore: 4,
      morningIntention: 'Clear all pending tech debt so today’s deep sprint can start with an empty cognitive cache.',
      eveningReview: 'Logged 3.8 hours of deep work. Sleep quality noticeably better with phone kept out of bedroom.',
      distractionsEncountered: 'Unexpected urgent ping from slack; handled in 10 minutes then immediately closed tab.',
      oneBigVictory: 'Held monk mode boundaries without compromising team support.',
      gratitudeOrStoicNote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
      tags: ['Deep Work', 'Boundaries'],
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export function loadStoredData(): MonkModeStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredData(initialSeedData);
      return initialSeedData;
    }
    const parsed = JSON.parse(raw);
    return {
      ...initialSeedData,
      ...parsed,
      profile: { ...initialSeedData.profile, ...(parsed.profile || {}) },
    };
  } catch (e) {
    console.error('Failed to load storage, returning initial seed data', e);
    return initialSeedData;
  }
}

export function saveStoredData(data: MonkModeStorageData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

export function calculateDailyProductivityScore(
  tasks: Task[],
  focusSessions: FocusSession[],
  habits: Habit[],
  targetHours: number = 4
): DailyProductivityScore {
  const today = getTodayDateString();

  // 1. Task Component (40 points)
  const todayTasks = tasks.filter(t => t.dueDate === today || t.completedAt?.startsWith(today));
  let taskComponent = 20; // baseline
  if (todayTasks.length > 0) {
    const completedCount = todayTasks.filter(t => t.completed).length;
    taskComponent = Math.round((completedCount / todayTasks.length) * 40);
  }

  // 2. Focus Component (40 points)
  const todaySessions = focusSessions.filter(s => s.completed && s.completedAt.startsWith(today));
  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const targetMinutes = targetHours * 60;
  const focusComponent = Math.min(40, Math.round((totalMinutes / targetMinutes) * 40));

  // 3. Habit Component (20 points)
  let habitComponent = 0;
  if (habits.length > 0) {
    const completedHabitsToday = habits.filter(h => h.history[today] === true).length;
    habitComponent = Math.round((completedHabitsToday / habits.length) * 20);
  }

  const totalScore = Math.min(100, taskComponent + focusComponent + habitComponent);

  let rating: DailyProductivityScore['rating'] = 'BUILDING';
  if (totalScore >= 85) rating = 'UNSTOPPABLE';
  else if (totalScore >= 70) rating = 'OPTIMAL';
  else if (totalScore >= 50) rating = 'BUILDING';
  else rating = 'RECALIBRATE';

  return {
    score: totalScore,
    taskComponent,
    focusComponent,
    habitComponent,
    rating,
  };
}

export function exportDataAsJSON(): void {
  const data = loadStoredData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `monk-mode-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.tasks || !parsed.habits) {
      throw new Error('Invalid Monk Mode schema.');
    }
    saveStoredData(parsed);
    return true;
  } catch (e) {
    console.error('Failed to parse import data', e);
    return false;
  }
}

export function resetToDemoData(): MonkModeStorageData {
  saveStoredData(initialSeedData);
  return initialSeedData;
}
