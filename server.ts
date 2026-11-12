import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & configuration check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 1. AI MENTOR: Chat endpoint
app.post('/api/mentor/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getAIClient();

    const systemInstruction = `You are the MONK MODE AI Mentor.
Core Tagline: "Discipline Over Distraction."
Your philosophy:
- Rooted in deep work (Cal Newport), stoic philosophy (Marcus Aurelius, Seneca), and relentless deliberate execution.
- Direct, clear, sharp, uncompromising, yet deeply encouraging and constructive.
- No fluff, no generic pleasantries, no empty corporate motivational clichés.
- Emphasize single-tasking, removing phone/social friction, radical time blocking, and ruthless prioritization.
- Always provide structured, actionable steps with specific time durations when appropriate.
- Current User Context:
  - Daily Focus Hours Logged: ${context?.focusMinutesToday ? (context.focusMinutesToday / 60).toFixed(1) + ' hrs' : '0 hrs'}
  - Active Tasks Pending: ${context?.pendingTasksCount ?? 0}
  - Tasks Completed Today: ${context?.completedTasksCount ?? 0}
  - Habit Streak Score: ${context?.habitStreakScore ?? 'N/A'}
  - User Mantra: ${context?.mantra || 'Discipline Over Distraction'}`;

    // Construct conversation for gemini-3.8-flash
    let promptText = '';
    if (Array.isArray(history) && history.length > 0) {
      promptText += 'Previous conversation:\n';
      history.slice(-8).forEach((h: { role: string; content: string }) => {
        promptText += `${h.role === 'user' ? 'User' : 'Mentor'}: ${h.content}\n`;
      });
      promptText += '\nCurrent query:\n';
    }
    promptText += message;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text ?? 'Focus on the single next action. What is your priority right now?' });
  } catch (error: any) {
    console.error('Error in /api/mentor/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to communicate with AI Mentor. Verify your GEMINI_API_KEY in Settings > Secrets.',
    });
  }
});

// 2. AI MENTOR: Generate Daily Goals
app.post('/api/mentor/generate-goals', async (req: Request, res: Response) => {
  try {
    const { focusTargetHours, currentTasks, habits, notes } = req.body;
    const ai = getAIClient();

    const systemInstruction = `You are the MONK MODE Daily Goal Strategist.
Your task is to take the user's workload and formulate 3 to 4 high-leverage, non-negotiable daily Monk Mode targets.
Rules:
- Apply the Rule of 3: Focus on 3 massive needle-movers, not 15 trivial chores.
- Specify recommended focus duration in minutes for each goal.
- Return valid JSON matching the requested schema.`;

    const userPrompt = `Generate a disciplined daily Monk Mode plan.
Target Focus Hours: ${focusTargetHours || 4} hours.
Current Task Backlog: ${JSON.stringify(currentTasks?.slice(0, 8) || [])}
Active Habits: ${JSON.stringify(habits?.slice(0, 6) || [])}
User Notes/Context: ${notes || 'Ready for high intensity deep work.'}

Respond strictly in valid JSON with format:
{
  "theme": "string (e.g. Ruthless Deep Execution / High-Leverage Sprint)",
  "mindsetPrompt": "string (A sharp 1-2 sentence stoic reminder for today)",
  "primaryGoals": [
    {
      "id": "goal-1",
      "title": "string (action-oriented headline)",
      "recommendedMinutes": 60,
      "priority": "HIGH" | "MEDIUM",
      "whyItMatters": "string (1 concise sentence on high leverage outcome)"
    }
  ],
  "frictionToRemove": "string (one concrete distraction to eliminate today)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/mentor/generate-goals:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate Monk Mode goals.',
    });
  }
});

// 3. AI MENTOR: Organize & Prioritize Tasks
app.post('/api/mentor/organize-tasks', async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    const ai = getAIClient();

    const systemInstruction = `You are an elite productivity architect.
Analyze the user's tasks. Filter the vanity work from high-impact work.
Categorize into:
1. "The One Thing" (The single most important task that moves the needle)
2. "Secondary High-Impact" (Important deep work)
3. "Batch Chores / Low Friction" (Admin or quick items to batch at the end of the day)
Return valid JSON.`;

    const prompt = `Here are the user's tasks:
${JSON.stringify(tasks || [])}

Return JSON with format:
{
  "coreFocusRecommendation": "string",
  "orderedTaskIds": ["id1", "id2"],
  "insights": [
    { "taskId": "string", "advice": "string (e.g. break into two 45m blocks or eliminate)" }
  ],
  "batchChoreIds": ["id..."]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/mentor/organize-tasks:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to organize tasks.',
    });
  }
});

// 4. AI MENTOR: Analyze Productivity Patterns
app.post('/api/mentor/analyze-patterns', async (req: Request, res: Response) => {
  try {
    const { stats } = req.body;
    const ai = getAIClient();

    const systemInstruction = `You are the Monk Mode Master Analyst.
Evaluate the user's metrics: focus hours, task velocity, habit adherence, and reflections.
Be truthful, analytical, and provide a constructive critique of where discipline held vs where distraction crept in.
Return JSON with format:
{
  "disciplineGrade": "A" | "B" | "C" | "D",
  "summary": "string (2-3 concise sentences)",
  "strengths": ["string", "string"],
  "vulnerabilities": ["string", "string"],
  "tomorrowDirectives": ["string", "string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User stats: ${JSON.stringify(stats || {})}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/mentor/analyze-patterns:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze productivity patterns.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Monk Mode] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
