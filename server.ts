import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client (only server-side)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: Plan My Week
app.post('/api/plan-week', async (req: Request, res: Response) => {
  try {
    const { subjects, examDates, dailyHours, availableDays, userNotes, petName } = req.body;

    const subjectsList = Array.isArray(subjects) && subjects.length > 0 
      ? subjects.join(', ') 
      : 'General Studies, Math, Science, Literature';
    
    const examsSummary = Array.isArray(examDates) && examDates.length > 0
      ? examDates.map((e: any) => `${e.subject}: ${e.name || 'Exam'} on ${e.date}`).join('; ')
      : 'No immediate exam deadlines specified';

    const hours = Number(dailyHours) || 2;
    const companionName = petName || 'Mochi';

    if (!ai) {
      // Graceful fallback plan if API key is not configured in environment
      const today = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const defaultPlans = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];
        const sub = (Array.isArray(subjects) && subjects[i % subjects.length]) || 'Study Focus';
        return {
          date: dayStr,
          dayName,
          focusTheme: `${sub} Foundation & Practice`,
          tasks: [
            {
              id: `task-${i}-1`,
              subject: sub,
              topic: `Core concepts review & summary flashcards`,
              durationMinutes: Math.round((hours * 60) * 0.5),
              priority: 'high',
              tips: 'Review definitions first, then summarize in your own words.',
            },
            {
              id: `task-${i}-2`,
              subject: sub,
              topic: `Practice problem set & quiz self-test`,
              durationMinutes: Math.round((hours * 60) * 0.5),
              priority: 'medium',
              tips: 'Take a 5-minute stretch break halfway through!',
            },
          ],
        };
      });

      return res.json({
        weekGoal: `Master key concepts across ${subjectsList} with consistent daily habits!`,
        mascotCheer: `${companionName} says: "Let's take it day by day and watch our study garden blossom! You've got this! 🌱"`,
        dailyPlans: defaultPlans,
      });
    }

    const prompt = `
Create a personalized 7-day study schedule for a student notebook planner called Study Quest Garden.
Tone: Warm, encouraging, cute, realistic, never preachy.
Mascot Name: ${companionName}
Target Subjects: ${subjectsList}
Upcoming Exams/Deadlines: ${examsSummary}
Daily Available Study Time: ${hours} hours per day (around ${Math.round(hours * 60)} minutes)
Extra Student Notes: ${userNotes || 'None provided'}
Current Reference Date: ${new Date().toISOString().split('T')[0]}

Requirements:
- Plan the next 7 consecutive days starting from today (${new Date().toISOString().split('T')[0]}).
- Each day should have 2-4 bite-sized, actionable tasks (each 20-60 minutes).
- Make sure total daily task duration approximately matches ${Math.round(hours * 60)} minutes.
- Give each day a cute, motivational focusTheme.
- Include actionable study tips (e.g. "draw a mind map", "explain to a rubber duck").
- Give an overarching weekGoal and a cheerful message from ${companionName}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekGoal: { type: Type.STRING },
            mascotCheer: { type: Type.STRING },
            dailyPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                  dayName: { type: Type.STRING },
                  focusTheme: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        priority: { type: Type.STRING, description: 'high, medium, or low' },
                        tips: { type: Type.STRING },
                      },
                      required: ['id', 'subject', 'topic', 'durationMinutes', 'priority', 'tips'],
                    },
                  },
                },
                required: ['date', 'dayName', 'focusTheme', 'tasks'],
              },
            },
          },
          required: ['weekGoal', 'mascotCheer', 'dailyPlans'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini plan-week encountered issue, providing resilient plan fallback:', error.message || error);
    const { subjects, dailyHours, petName } = req.body;
    const hours = Number(dailyHours) || 2;
    const companionName = petName || 'Mochi';
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fallbackPlans = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      const sub = (Array.isArray(subjects) && subjects[i % subjects.length]) || 'Core Study';
      return {
        date: dayStr,
        dayName,
        focusTheme: `${sub} Mastery & Problem Solving`,
        tasks: [
          {
            id: `task-resilient-${i}-1`,
            subject: sub,
            topic: `Core concepts breakdown & summary notes`,
            durationMinutes: Math.round((hours * 60) * 0.5),
            priority: 'high',
            tips: 'Review definitions first, then summarize in your own words.',
          },
          {
            id: `task-resilient-${i}-2`,
            subject: sub,
            topic: `Practice problem set & quiz active recall`,
            durationMinutes: Math.round((hours * 60) * 0.5),
            priority: 'medium',
            tips: 'Take a 5-minute tea break halfway through!',
          },
        ],
      };
    });

    return res.json({
      weekGoal: `Stay consistent and conquer key concepts across your subjects!`,
      mascotCheer: `${companionName} says: "We've got your back! Step by step, our study garden is going to bloom beautifully~ 🌱"`,
      dailyPlans: fallbackPlans,
    });
  }
});

// Endpoint: Generate Quiz and Flashcards from Notes
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { notes, subject, difficulty, questionCount } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide notes or study text to generate a quiz.' });
    }

    const sub = subject || 'General Topic';
    const diff = difficulty || 'medium';
    const count = Math.min(Math.max(Number(questionCount) || 6, 4), 10);

    if (!ai) {
      // Fallback quiz if no API key
      return res.json({
        title: `${sub} Study Sprint`,
        subject: sub,
        flashcards: [
          {
            front: `Core Idea of ${sub}`,
            back: notes.slice(0, 150) + (notes.length > 150 ? '...' : ''),
            hint: 'Recall the main summary sentence from your notes.',
          },
          {
            front: 'Key Application',
            back: 'Applying these principles helps solidify memory and garden growth!',
            hint: 'How would you use this concept in real life or exam questions?',
          },
        ],
        questions: [
          {
            id: 'q-demo-1',
            question: `Which concept best aligns with the study notes for ${sub}?`,
            options: [
              'Active recall through self-quizzing and spaced repetition',
              'Passive reading without checking understanding',
              'Skipping difficult topics entirely',
              'Studying only the night before the exam',
            ],
            correctIndex: 0,
            explanation: 'Active recall and spaced repetition strengthen neural connections and sprout beautiful flowers in your garden!',
            flowerType: 'Daisy',
          },
        ],
      });
    }

    const prompt = `
You are the AI tutor in "Study Quest Garden", a cozy pastel study planner app.
A student pasted the following study notes and wants a fun, high-yield quiz and flashcard deck.

Subject: ${sub}
Target Difficulty: ${diff}
Target Question Count: ${count}
Student Study Notes:
---
${notes.slice(0, 8000)}
---

Generate:
1. Exactly ${count} multiple-choice questions directly testing the key terms, mechanisms, facts, and problem-solving steps in the notes.
2. 4 distinct, plausible options for each question (only 1 strictly correct).
3. The zero-based index of the correct answer (0, 1, 2, or 3).
4. A warm, encouraging explanation clarifying WHY that answer is correct and a quick memory hook.
5. An assigned flowerType for each question matching the subject vibe (choose from: "Sakura", "Sunflower", "Lavender", "Daisy", "Rose", "Lotus", "Tulip", "Bluebell").
6. 4 to 8 bite-sized Flashcards (front prompt/question, back clear explanation, and a gentle hint).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['front', 'back', 'hint'],
              },
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  flowerType: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'flowerType'],
              },
            },
          },
          required: ['title', 'subject', 'flashcards', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini generate-quiz encountered issue, providing resilient quiz fallback:', error.message || error);
    const { notes, subject } = req.body;
    const sub = subject || 'General Topic';
    const noteExcerpt = (notes && typeof notes === 'string') ? notes.slice(0, 160) : 'Active learning';

    return res.json({
      title: `${sub} Study Sprint`,
      subject: sub,
      flashcards: [
        {
          front: `Core Idea of ${sub}`,
          back: noteExcerpt + (notes && notes.length > 160 ? '...' : ''),
          hint: 'Recall the main summary sentence from your notes.',
        },
        {
          front: 'Active Recall Mechanism',
          back: 'Testing yourself with flashcards solidifies neural pathways up to 3x faster than passive re-reading!',
          hint: 'Why active recall works best',
        },
      ],
      questions: [
        {
          id: `q-resilient-1-${Date.now()}`,
          question: `Which study strategy best reinforces key concepts in ${sub}?`,
          options: [
            'Spaced repetition and self-testing with feedback',
            'Cramming everything the night before the exam',
            'Passively highlighting paragraphs without recall',
            'Skipping practice questions',
          ],
          correctIndex: 0,
          explanation: 'Spaced repetition combined with active self-quizzing leads to durable long-term retention and blooms beautiful flowers!',
          flowerType: 'Lavender',
        },
        {
          id: `q-resilient-2-${Date.now()}`,
          question: `When a quiz card enters the "Needs Water" nursery, what is the best review schedule?`,
          options: [
            'Review at intervals of 1 day, 3 days, and 7 days',
            'Never review it again',
            'Look at the answer immediately and discard it',
            'Wait 6 months before checking it',
          ],
          correctIndex: 0,
          explanation: 'Expanding review intervals (1, 3, 7 days) match the human forgetting curve to maximize recall!',
          flowerType: 'Sunflower',
        },
      ],
    });
  }
});

// Endpoint: Weekly Recap AI Summary
app.post('/api/weekly-recap', async (req: Request, res: Response) => {
  try {
    const { totalMinutes, completedTasksCount, mostProductiveDay, streak, flowersGrown, petName } = req.body;
    const pet = petName || 'Mochi';

    if (!ai) {
      return res.json({
        summarySentence: `You dedicated ${Math.round(totalMinutes || 0)} minutes of focus and completed ${completedTasksCount || 0} quests this week!`,
        mascotPraise: `${pet} is doing joyful backflips! Your dedication has helped the garden bloom with ${flowersGrown || 0} lovely flowers. 🌸`,
        studyTip: 'Keep up the rhythm! Short, frequent reviews build much stronger memories than cramming.',
      });
    }

    const prompt = `
You are the cute mascot ${pet} from the aesthetic study planner "Study Quest Garden".
Generate a weekly recap celebration for the student based on their statistics:
- Total Focus Study Time: ${totalMinutes || 0} minutes
- Completed Tasks/Quests: ${completedTasksCount || 0}
- Most Productive Day: ${mostProductiveDay || 'Mid-week'}
- Current Daily Streak: ${streak || 1} day(s)
- New Flowers Grown: ${flowersGrown || 0}

Requirements:
- summarySentence: Exactly 1 friendly, celebratory sentence summarizing their week's triumph (warm, uplifting, encouraging).
- mascotPraise: A playful reaction from ${pet} (e.g. happy purr, ear wiggle, dancing under flower petals).
- studyTip: 1 cute, actionable study habit tip for the upcoming week.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summarySentence: { type: Type.STRING },
            mascotPraise: { type: Type.STRING },
            studyTip: { type: Type.STRING },
          },
          required: ['summarySentence', 'mascotPraise', 'studyTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini weekly-recap encountered issue, providing resilient fallback:', error.message || error);
    const { totalMinutes, completedTasksCount, streak, flowersGrown, petName } = req.body;
    const pet = petName || 'Mochi';

    return res.json({
      summarySentence: `You blossomed this week with ${Math.round(totalMinutes || 0)} minutes of focus and ${completedTasksCount || 0} completed study quests!`,
      mascotPraise: `${pet} is dancing under flower petals! Every session you completed nourished the garden and earned you sparkly stars. 🌸`,
      studyTip: 'Try taking a relaxing 5-minute stretch break before starting your most challenging chapter!',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Study Quest Garden server running on http://0.0.0.0:${port}`);
  });
}

startServer();
