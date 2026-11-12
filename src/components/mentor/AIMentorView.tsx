import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Target,
  BarChart2,
  ListOrdered,
  Flame,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Shield,
  Lightbulb,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  Task,
  Habit,
  FocusSession,
  JournalEntry,
  UserProfile,
  AIGoalPlan,
  AIPatternAnalysis
} from '../../types';

interface AIMentorViewProps {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
  journalEntries: JournalEntry[];
  profile: UserProfile;
  onAddGeneratedGoalAsTask: (title: string, blocks: number, priority: 'HIGH' | 'MEDIUM') => void;
}

type MentorTab = 'chat' | 'goals' | 'organize' | 'patterns';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIMentorView: React.FC<AIMentorViewProps> = ({
  tasks,
  habits,
  focusSessions,
  journalEntries,
  profile,
  onAddGeneratedGoalAsTask,
}) => {
  const [activeTab, setActiveTab] = useState<MentorTab>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `I am your Monk Mode Mentor. My doctrine is simple: Discipline Over Distraction.

We do not seek motivation; we build non-negotiable systems. Tell me your highest-friction obstacle today, ask me to audit your schedule, or tap one of the tactical presets below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Goal Plan State
  const [goalPlan, setGoalPlan] = useState<AIGoalPlan | null>(null);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [addedGoalIds, setAddedGoalIds] = useState<Record<string, boolean>>({});

  // Task Organizer State
  const [organizeResult, setOrganizeResult] = useState<any | null>(null);
  const [isOrganizeLoading, setIsOrganizeLoading] = useState(false);
  const [organizeError, setOrganizeError] = useState<string | null>(null);

  // Pattern Analysis State
  const [patternAnalysis, setPatternAnalysis] = useState<AIPatternAnalysis | null>(null);
  const [isPatternLoading, setIsPatternLoading] = useState(false);
  const [patternError, setPatternError] = useState<string | null>(null);

  // Quick prompt presets
  const promptPresets = [
    'Audit my daily focus and give me a ruthless reality check.',
    'I am procrastinating on a complex problem. Break it down.',
    'Design a 90-minute deep work battle plan for right now.',
    'How do I eliminate my urge to check my phone during work blocks?',
  ];

  // 1. Send Chat Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsChatLoading(true);
    setChatError(null);

    // Context for mentor
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = focusSessions.filter((s) => s.completed && s.completedAt.startsWith(today));
    const focusMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    try {
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            focusMinutesToday,
            pendingTasksCount: tasks.filter((t) => !t.completed).length,
            completedTasksCount: tasks.filter((t) => t.completed).length,
            mantra: profile.monkMantra,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error communicating with AI Mentor');
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setChatError(err.message || 'Unable to connect to AI Mentor.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Generate Goals
  const handleGenerateGoals = async () => {
    setIsGoalsLoading(true);
    setGoalsError(null);

    try {
      const response = await fetch('/api/mentor/generate-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusTargetHours: profile.dailyFocusTargetHours,
          currentTasks: tasks.map((t) => ({ title: t.title, priority: t.priority, completed: t.completed })),
          habits: habits.map((h) => h.title),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate goal plan.');
      }
      setGoalPlan(data);
    } catch (err: any) {
      setGoalsError(err.message || 'Goal generation failed.');
    } finally {
      setIsGoalsLoading(false);
    }
  };

  // 3. Organize Tasks
  const handleOrganizeTasks = async () => {
    setIsOrganizeLoading(true);
    setOrganizeError(null);

    try {
      const response = await fetch('/api/mentor/organize-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, completed: t.completed })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to organize tasks.');
      }
      setOrganizeResult(data);
    } catch (err: any) {
      setOrganizeError(err.message || 'Task organization failed.');
    } finally {
      setIsOrganizeLoading(false);
    }
  };

  // 4. Analyze Patterns
  const handleAnalyzePatterns = async () => {
    setIsPatternLoading(true);
    setPatternError(null);

    try {
      const response = await fetch('/api/mentor/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            totalFocusSessions: focusSessions.length,
            recentFocusMinutes: focusSessions.slice(0, 7).reduce((acc, s) => acc + s.durationMinutes, 0),
            habitsCount: habits.length,
            completedTasks: tasks.filter((t) => t.completed).length,
            pendingTasks: tasks.filter((t) => !t.completed).length,
            recentClarityScores: journalEntries.slice(0, 5).map((j) => j.clarityScore),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze patterns.');
      }
      setPatternAnalysis(data);
    } catch (err: any) {
      setPatternError(err.message || 'Pattern analysis failed.');
    } finally {
      setIsPatternLoading(false);
    }
  };

  const handleAddGoalToBacklog = (goal: any) => {
    const blocks = Math.max(1, Math.round((goal.recommendedMinutes || 50) / 25));
    onAddGeneratedGoalAsTask(goal.title, blocks, goal.priority || 'HIGH');
    setAddedGoalIds((prev) => ({ ...prev, [goal.id]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-display">
            Monk Mode AI Mentor
          </h2>
          <p className="text-xs text-zinc-400">
            Ruthless clarity, cognitive audits, and stoic discipline systems.
          </p>
        </div>

        {/* Feature Tab Bar */}
        <div className="flex items-center gap-1 bg-[#131317] p-1 rounded-xl border border-[#22222a] text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-[#22222a] text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Stoic Mentor
          </button>
          <button
            onClick={() => {
              setActiveTab('goals');
              if (!goalPlan) handleGenerateGoals();
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-[#22222a] text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Daily Goals
          </button>
          <button
            onClick={() => {
              setActiveTab('organize');
              if (!organizeResult) handleOrganizeTasks();
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'organize'
                ? 'bg-[#22222a] text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Task Architect
          </button>
          <button
            onClick={() => {
              setActiveTab('patterns');
              if (!patternAnalysis) handleAnalyzePatterns();
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'patterns'
                ? 'bg-[#22222a] text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pattern Audit
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Chat */}
      {activeTab === 'chat' && (
        <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] overflow-hidden flex flex-col h-[640px]">
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono ${
                    msg.role === 'user'
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  {msg.role === 'user' ? 'Me' : 'M'}
                </div>

                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'bg-[#15151a] text-zinc-200 border border-[#222228] whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[10px] font-mono mt-2 ${
                      msg.role === 'user' ? 'text-zinc-400 text-right' : 'text-zinc-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 max-w-lg items-center text-xs text-zinc-400 font-mono">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Mentor analyzing cognitive friction...</span>
              </div>
            )}

            {chatError && (
              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{chatError}</span>
              </div>
            )}
          </div>

          {/* Quick Presets Strip */}
          <div className="px-6 py-2.5 bg-[#0f0f12] border-t border-[#1a1a20] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">Presets:</span>
            {promptPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(preset)}
                disabled={isChatLoading}
                className="px-2.5 py-1 rounded-md bg-[#16161c] hover:bg-[#202028] border border-[#24242c] text-[11px] text-zinc-300 whitespace-nowrap transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-[#141418] border-t border-[#1f1f24]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask your mentor for an honest reality check or time-blocking advice..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isChatLoading}
                className="flex-1 px-4 py-2.5 text-xs bg-[#16161c] border border-[#2a2a34] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !inputMessage.trim()}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inquire</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Goal Plan */}
      {activeTab === 'goals' && (
        <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a1a20] pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-display">
                High-Leverage Daily Goal Formulation
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                The Rule of 3: Three needle-moving anchors, ignoring trivial busyness.
              </p>
            </div>

            <button
              onClick={handleGenerateGoals}
              disabled={isGoalsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-950 hover:border-emerald-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGoalsLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          {isGoalsLoading ? (
            <div className="py-20 text-center space-y-3 font-mono text-xs text-zinc-400">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto animate-spin" />
              <p>Formulating high-leverage Monk Mode directives...</p>
            </div>
          ) : goalsError ? (
            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-300">
              {goalsError}
            </div>
          ) : goalPlan ? (
            <div className="space-y-6">
              {/* Theme & Mindset Banner */}
              <div className="p-4 rounded-xl bg-[#15151b] border border-[#22222a] space-y-2">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                  Today's Execution Theme: {goalPlan.theme}
                </span>
                <p className="text-sm text-zinc-200 font-medium italic">
                  "{goalPlan.mindsetPrompt}"
                </p>
                {goalPlan.frictionToRemove && (
                  <p className="text-xs text-amber-300/90 pt-1 border-t border-[#1e1e26]">
                    Distraction to eliminate: {goalPlan.frictionToRemove}
                  </p>
                )}
              </div>

              {/* Goals Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goalPlan.primaryGoals?.map((goal, index) => {
                  const isAdded = addedGoalIds[goal.id];
                  return (
                    <div
                      key={goal.id || index}
                      className="p-5 rounded-xl bg-[#141419] border border-[#22222a] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 font-bold">Anchor 0{index + 1}</span>
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{goal.recommendedMinutes}m block</span>
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-100">{goal.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{goal.whyItMatters}</p>
                      </div>

                      <button
                        onClick={() => handleAddGoalToBacklog(goal)}
                        disabled={isAdded}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? 'bg-[#1e1e26] text-zinc-500 cursor-default'
                            : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Added to Task Vault</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Active Tasks</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={handleGenerateGoals}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
              >
                Generate Daily Goals Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Task Architect & Prioritization */}
      {activeTab === 'organize' && (
        <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a1a20] pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-display">
                Eisenhower & Leverage Task Structuring
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Separate high-cognitive depth work from batch administrative chores.
              </p>
            </div>

            <button
              onClick={handleOrganizeTasks}
              disabled={isOrganizeLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-950 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOrganizeLoading ? 'animate-spin' : ''}`} />
              <span>Re-Architect</span>
            </button>
          </div>

          {isOrganizeLoading ? (
            <div className="py-20 text-center font-mono text-xs text-zinc-400 space-y-3">
              <ListOrdered className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
              <p>Auditing task cognitive depth and ordering sequence...</p>
            </div>
          ) : organizeResult ? (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-[#15151b] border border-[#22222a]">
                <span className="font-mono text-emerald-400 uppercase text-[11px] block mb-1">
                  Strategic Recommendation
                </span>
                <p className="text-zinc-200 leading-relaxed text-sm">
                  {organizeResult.coreFocusRecommendation}
                </p>
              </div>

              {organizeResult.insights && organizeResult.insights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-zinc-400 uppercase">
                    Tactical Task Adjustments
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {organizeResult.insights.map((item: any, i: number) => {
                      const matchedTask = tasks.find((t) => t.id === item.taskId);
                      return (
                        <div
                          key={i}
                          className="p-3.5 rounded-lg bg-[#141419] border border-[#202028] space-y-1"
                        >
                          <span className="text-zinc-200 font-semibold block">
                            {matchedTask?.title || `Task #${i + 1}`}
                          </span>
                          <p className="text-zinc-400 leading-relaxed">{item.advice}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={handleOrganizeTasks}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
              >
                Organize Tasks with AI
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Pattern Diagnostics */}
      {activeTab === 'patterns' && (
        <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a1a20] pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-display">
                Monk Mode Productivity Diagnostics
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluation of focus hours, habit compliance, and behavioral patterns.
              </p>
            </div>

            <button
              onClick={handleAnalyzePatterns}
              disabled={isPatternLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-950 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPatternLoading ? 'animate-spin' : ''}`} />
              <span>Run Diagnostic</span>
            </button>
          </div>

          {isPatternLoading ? (
            <div className="py-20 text-center font-mono text-xs text-zinc-400 space-y-3">
              <BarChart2 className="w-6 h-6 text-emerald-400 mx-auto animate-pulse" />
              <p>Analyzing behavioral variance and focus retention...</p>
            </div>
          ) : patternAnalysis ? (
            <div className="space-y-6">
              {/* Grade & Summary */}
              <div className="p-6 rounded-xl bg-[#15151b] border border-[#22222a] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1 max-w-xl">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">
                    Discipline Diagnosis
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                    {patternAnalysis.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111114] border border-[#26262e] shrink-0">
                  <span className="text-xs font-mono text-zinc-400">Current Grade:</span>
                  <span className="text-3xl font-extrabold text-emerald-400 font-display">
                    {patternAnalysis.disciplineGrade}
                  </span>
                </div>
              </div>

              {/* Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#141419] border border-[#202028] space-y-3">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Discipline Fortresses (Strengths)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {patternAnalysis.strengths?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-[#141419] border border-[#202028] space-y-3">
                  <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Distraction Vulnerabilities</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {patternAnalysis.vulnerabilities?.map((v, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400">·</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tomorrow's Directives */}
              <div className="p-5 rounded-xl bg-[#141419] border border-[#202028] space-y-3">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Directives for Tomorrow's Session
                </h4>
                <div className="space-y-2 text-xs">
                  {patternAnalysis.tomorrowDirectives?.map((directive, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#17171d] rounded-lg border border-[#24242e] text-zinc-200 flex items-center gap-3"
                    >
                      <span className="font-mono text-emerald-400 font-bold">0{idx + 1}</span>
                      <span>{directive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={handleAnalyzePatterns}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
              >
                Run Pattern Diagnostic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
