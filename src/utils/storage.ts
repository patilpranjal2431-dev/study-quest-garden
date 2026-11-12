import { AppState, Flower, Sticker, StudyTask, Subject, ExamDate, FocusSession, NeedsWaterItem } from '../types';

const STORAGE_KEY = 'study_quest_garden_data_v1';

export const INITIAL_STICKERS: Sticker[] = [
  {
    id: 'first_task',
    name: 'First Step',
    icon: '🌱',
    description: 'Completed your very first study quest!',
    condition: 'Complete 1 task',
    unlocked: false,
    category: 'quests',
  },
  {
    id: 'streak_3',
    name: 'Sproutling Streak',
    icon: '🔥',
    description: 'Studied 3 days in a row without skipping!',
    condition: '3-day streak',
    unlocked: false,
    category: 'streaks',
  },
  {
    id: 'streak_7',
    name: 'Garden Guardian',
    icon: '👑',
    description: 'A full week of consistent daily dedication!',
    condition: '7-day streak',
    unlocked: false,
    category: 'streaks',
  },
  {
    id: 'first_bloom',
    name: 'First Bloom',
    icon: '🌸',
    description: 'Grew your first beautiful flower from an AI quiz!',
    condition: 'Grow 1 flower',
    unlocked: false,
    category: 'garden',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Whiz',
    icon: '✨',
    description: 'Answered 10 quiz questions correctly!',
    condition: '10 correct answers',
    unlocked: false,
    category: 'garden',
  },
  {
    id: 'pomodoro_hero',
    name: 'Cozy Tea Master',
    icon: '🍵',
    description: 'Completed 3 soothing Pomodoro focus sessions!',
    condition: 'Complete 3 focus sessions',
    unlocked: false,
    category: 'focus',
  },
  {
    id: 'night_owl',
    name: 'Starlight Scholar',
    icon: '🌙',
    description: 'Studied peacefully under the night study sky!',
    condition: 'Switch to Night Mode',
    unlocked: false,
    category: 'focus',
  },
  {
    id: 'garden_full',
    name: 'Blossom Paradise',
    icon: '🌺',
    description: 'Cultivated 8 or more blooming flowers in your plot!',
    condition: 'Grow 8 flowers',
    unlocked: false,
    category: 'garden',
  },
  {
    id: 'star_century',
    name: 'Century Club',
    icon: '⭐',
    description: 'Collected over 100 study stars!',
    condition: 'Earn 100 stars',
    unlocked: false,
    category: 'quests',
  },
  {
    id: 'plant_medic',
    name: 'Plant Medic',
    icon: '💧',
    description: 'Revived a wilting card from the Needs Water pile!',
    condition: 'Review 1 Needs Water question',
    unlocked: false,
    category: 'garden',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Biology', color: '#D4F5E5', icon: '🧬' },
  { id: 'sub-2', name: 'World History', color: '#FFD9C9', icon: '📜' },
  { id: 'sub-3', name: 'Algebra II', color: '#E4D9FF', icon: '📐' },
  { id: 'sub-4', name: 'English Lit', color: '#FFF2B2', icon: '📖' },
];

export function getTodayStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getDaysOffsetStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export const INITIAL_EXAMS: ExamDate[] = [
  { id: 'ex-1', subject: 'Biology', name: 'Cell Energetics Midterm', date: getDaysOffsetStr(4) },
  { id: 'ex-2', subject: 'Algebra II', name: 'Quadratic & Polynomials Quiz', date: getDaysOffsetStr(8) },
];

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-init-1',
    date: getTodayStr(),
    subject: 'Biology',
    topic: 'Review ATP cycle diagram & chloroplast structure',
    durationMinutes: 35,
    priority: 'high',
    tips: 'Sketch the thylakoid membrane on notebook scratch paper!',
    completed: true,
    completedAt: getTodayStr(),
  },
  {
    id: 'task-init-2',
    date: getTodayStr(),
    subject: 'Algebra II',
    topic: 'Factor 10 quadratic equations with negative coefficients',
    durationMinutes: 30,
    priority: 'medium',
    tips: 'Remember to check for the greatest common factor first.',
    completed: false,
  },
  {
    id: 'task-init-3',
    date: getTodayStr(),
    subject: 'English Lit',
    topic: 'Outline themes of nature in Chapter 4 reading',
    durationMinutes: 25,
    priority: 'low',
    tips: 'Pick 2 key quotes to memorize.',
    completed: false,
  },
  {
    id: 'task-init-4',
    date: getDaysOffsetStr(1),
    subject: 'World History',
    topic: 'Create timeline for the Silk Road trade routes',
    durationMinutes: 40,
    priority: 'high',
    tips: 'Color code goods, ideas, and cultural exchanges.',
    completed: false,
  },
];

export const INITIAL_FLOWERS: Flower[] = [
  {
    id: 'fl-1',
    type: 'Sakura',
    stage: 'blooming',
    subject: 'English Lit',
    plantedAt: getDaysOffsetStr(-2),
    questionAnswered: 'Theme analysis on romanticism',
  },
  {
    id: 'fl-2',
    type: 'Lavender',
    stage: 'blooming',
    subject: 'Biology',
    plantedAt: getDaysOffsetStr(-1),
    questionAnswered: 'Cellular respiration inputs',
  },
  {
    id: 'fl-3',
    type: 'Sunflower',
    stage: 'bud',
    subject: 'Algebra II',
    plantedAt: getTodayStr(),
    questionAnswered: 'Discriminant in quadratic formula',
  },
];

export function getDefaultState(): AppState {
  return {
    settings: {
      name: 'Scholar',
      petType: 'bunny',
      petName: 'Boba',
      themeColor: 'peach',
      isNightMode: false,
      soundEnabled: true,
      lofiVolume: 0.35,
      onboardingCompleted: false,
    },
    stars: 35,
    streak: 3,
    lastActiveDate: getTodayStr(),
    subjects: INITIAL_SUBJECTS,
    exams: INITIAL_EXAMS,
    tasks: INITIAL_TASKS,
    garden: INITIAL_FLOWERS,
    needsWaterPile: [
      {
        id: 'nw-demo-1',
        question: 'Which enzyme unwinds the DNA double helix during replication?',
        options: ['DNA Polymerase', 'Helicase', 'Ligase', 'RNA Primase'],
        correctIndex: 1,
        explanation: 'Helicase unzips the DNA double helix by breaking hydrogen bonds between base pairs.',
        subject: 'Biology',
        flowerType: 'Lavender',
        wrongCount: 1,
        reviewStep: 0,
        nextReviewDate: getTodayStr(),
      },
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is the role of ATP synthase in cellular respiration?',
        back: 'It acts as a tiny rotary turbine powered by H+ proton gradient to synthesize ATP from ADP and Pi.',
        hint: 'Chemiosmosis in the mitochondrial membrane',
        subject: 'Biology',
        mastered: false,
      },
      {
        id: 'fc-2',
        front: 'Quadratic Formula: What does b² - 4ac tell you?',
        back: 'The discriminant! >0 means 2 real solutions, =0 means 1 real solution, <0 means 2 complex solutions.',
        hint: 'Under the square root',
        subject: 'Algebra II',
        mastered: true,
      },
      {
        id: 'fc-3',
        front: 'Define Alliteration in literature',
        back: 'The repetition of initial consonant sounds in neighboring words (e.g., "soft summer breeze").',
        hint: 'Poetic sound device',
        subject: 'English Lit',
        mastered: false,
      },
    ],
    activeQuiz: [],
    focusSessions: [
      {
        id: 'fs-1',
        date: getTodayStr(),
        durationMinutes: 25,
        mode: 'focus',
        subject: 'Biology',
      },
      {
        id: 'fs-2',
        date: getDaysOffsetStr(-1),
        durationMinutes: 25,
        mode: 'focus',
        subject: 'Algebra II',
      },
      {
        id: 'fs-3',
        date: getDaysOffsetStr(-2),
        durationMinutes: 50,
        mode: 'focus',
        subject: 'World History',
      },
    ],
    stickers: INITIAL_STICKERS.map((s) => (s.id === 'first_task' || s.id === 'first_bloom' ? { ...s, unlocked: true, unlockedAt: getTodayStr() } : s)),
    weekGoal: 'Nurture your daily focus habits and get ahead on your upcoming exams!',
    mascotCheer: 'Welcome to your cozy garden! Every study quest helps our cute companions grow! 🌱',
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);

    // Merge with any new default keys safely
    const defaultState = getDefaultState();
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      stickers: defaultState.stickers.map((stk) => {
        const savedStk = parsed.stickers?.find((s: Sticker) => s.id === stk.id);
        return savedStk ? { ...stk, ...savedStk } : stk;
      }),
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getDefaultState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

// Check and update streak when tasks are completed
export function checkAndUpdateStreak(state: AppState): { newStreak: number; newLastActive: string } {
  const today = getTodayStr();
  const last = state.lastActiveDate;

  if (last === today) {
    return { newStreak: state.streak, newLastActive: today };
  }

  const yesterday = getDaysOffsetStr(-1);
  if (last === yesterday) {
    return { newStreak: state.streak + 1, newLastActive: today };
  }

  // Skipped days -> streak restarts at 1
  return { newStreak: 1, newLastActive: today };
}

// Check if any locked stickers should be unlocked
export function checkStickerUnlocks(state: AppState): Sticker[] {
  const today = getTodayStr();
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const flowersCount = state.garden.length;
  const focusCount = state.focusSessions.filter((s) => s.mode === 'focus').length;

  return state.stickers.map((sticker) => {
    if (sticker.unlocked) return sticker;

    let shouldUnlock = false;
    switch (sticker.id) {
      case 'first_task':
        shouldUnlock = completedTasks >= 1;
        break;
      case 'streak_3':
        shouldUnlock = state.streak >= 3;
        break;
      case 'streak_7':
        shouldUnlock = state.streak >= 7;
        break;
      case 'first_bloom':
        shouldUnlock = flowersCount >= 1;
        break;
      case 'quiz_master':
        shouldUnlock = flowersCount >= 10;
        break;
      case 'pomodoro_hero':
        shouldUnlock = focusCount >= 3;
        break;
      case 'night_owl':
        shouldUnlock = state.settings.isNightMode;
        break;
      case 'garden_full':
        shouldUnlock = flowersCount >= 8;
        break;
      case 'star_century':
        shouldUnlock = state.stars >= 100;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      return { ...sticker, unlocked: true, unlockedAt: today };
    }
    return sticker;
  });
}
