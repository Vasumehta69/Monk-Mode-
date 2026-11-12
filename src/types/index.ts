export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  estimatedBlocks: number;
  completedBlocks: number;
  dueDate?: string;
  category: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekdays' | 'weekends';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  colorTag?: string;
  streak: number;
  bestStreak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD' -> true/false
  createdAt: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  targetMinutes: number;
  startedAt: string;
  completedAt: string;
  completed: boolean;
  taskId?: string;
  taskTitle?: string;
  category: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  clarityScore: number; // 1 to 5
  morningIntention: string;
  eveningReview: string;
  distractionsEncountered: string;
  oneBigVictory: string;
  gratitudeOrStoicNote: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  tagline: string;
  monkMantra: string;
  dailyFocusTargetHours: number;
  monkModeDayCount: number;
  monkModeStartDate: string;
  theme: 'matte-black' | 'amoled' | 'charcoal';
  soundEnabled: boolean;
  soundVolume: number;
  ambientSound: 'none' | 'white-noise' | 'rain' | 'theta' | 'campfire';
  ambientVolume: number;
  firebaseConfigured: boolean;
}

export interface DailyProductivityScore {
  score: number; // 0 to 100
  taskComponent: number; // out of 40
  focusComponent: number; // out of 40
  habitComponent: number; // out of 20
  rating: 'UNSTOPPABLE' | 'OPTIMAL' | 'BUILDING' | 'RECALIBRATE';
}

export interface AIGoal {
  id: string;
  title: string;
  recommendedMinutes: number;
  priority: 'HIGH' | 'MEDIUM';
  whyItMatters: string;
}

export interface AIGoalPlan {
  theme: string;
  mindsetPrompt: string;
  primaryGoals: AIGoal[];
  frictionToRemove: string;
}

export interface AIPatternAnalysis {
  disciplineGrade: 'A' | 'B' | 'C' | 'D';
  summary: string;
  strengths: string[];
  vulnerabilities: string[];
  tomorrowDirectives: string[];
}

export type ViewSection = 
  | 'dashboard'
  | 'timer'
  | 'tasks'
  | 'habits'
  | 'journal'
  | 'mentor'
  | 'analytics'
  | 'settings';
