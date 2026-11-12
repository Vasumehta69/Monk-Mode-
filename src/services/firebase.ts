/**
 * Firebase Integration Architecture Layer
 * Provides cloud sync structure, schema definitions, and credentials handler
 * for future Firebase Authentication & Firestore integration.
 */

export interface FirebaseConfigState {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  isInitialized: boolean;
  syncStatus: 'offline-local' | 'synced' | 'connecting' | 'error';
  lastSyncedAt?: string;
}

export const firebaseBlueprint = {
  version: '1.0',
  collections: {
    users: {
      description: 'User profile, monk mode pledges, and preferences',
      fields: ['uid', 'name', 'monkMantra', 'dailyFocusTargetHours', 'theme', 'createdAt'],
    },
    tasks: {
      description: 'Task backlog, priorities, status, and focus block estimations',
      fields: ['id', 'userId', 'title', 'description', 'priority', 'completed', 'completedAt', 'category', 'dueDate'],
    },
    habits: {
      description: 'Custom habits, daily completion flags, and streak tracking',
      fields: ['id', 'userId', 'title', 'frequency', 'timeOfDay', 'streak', 'bestStreak', 'history'],
    },
    focusSessions: {
      description: 'Logged deep work sessions, durations, and reflections',
      fields: ['id', 'userId', 'durationMinutes', 'targetMinutes', 'startedAt', 'completedAt', 'taskId', 'notes'],
    },
    journalEntries: {
      description: 'Daily reflections, morning intentions, and stoic reviews',
      fields: ['id', 'userId', 'date', 'clarityScore', 'morningIntention', 'eveningReview', 'oneBigVictory'],
    },
  },
};

class FirebaseBridge {
  private configState: FirebaseConfigState = {
    isInitialized: false,
    syncStatus: 'offline-local',
  };

  getConfig(): FirebaseConfigState {
    const raw = localStorage.getItem('monk_mode_firebase_config');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return { ...this.configState, ...parsed };
      } catch (e) {
        // fallback
      }
    }
    return this.configState;
  }

  saveConfig(config: Partial<FirebaseConfigState>) {
    const current = this.getConfig();
    const updated = { ...current, ...config, syncStatus: 'offline-local' as const };
    localStorage.setItem('monk_mode_firebase_config', JSON.stringify(updated));
    return updated;
  }
}

export const firebaseBridge = new FirebaseBridge();
