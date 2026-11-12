export type MascotType = 'cat' | 'bunny' | 'shiba';

export type ThemeColor = 'peach' | 'lavender' | 'mint' | 'butter';

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  icon?: string;
}

export interface ExamDate {
  id: string;
  subject: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface StudyTask {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  tips?: string;
  completed: boolean;
  completedAt?: string;
}

export interface DailyPlan {
  date: string;
  dayName: string;
  focusTheme: string;
  tasks: StudyTask[];
}

export interface Flower {
  id: string;
  type: 'Sakura' | 'Sunflower' | 'Lavender' | 'Daisy' | 'Rose' | 'Lotus' | 'Tulip' | 'Bluebell';
  stage: 'sprout' | 'bud' | 'blooming' | 'golden';
  subject: string;
  plantedAt: string;
  questionAnswered?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  flowerType: Flower['type'];
  subject?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  subject?: string;
  mastered?: boolean;
}

export interface NeedsWaterItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
  flowerType: Flower['type'];
  wrongCount: number;
  reviewStep: number; // 0 = 1 day, 1 = 3 days, 2 = 7 days, 3 = graduated
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedDate?: string;
}

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  mode: 'focus' | 'short_break' | 'long_break';
  subject?: string;
  notes?: string;
}

export interface Sticker {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'quests' | 'garden' | 'focus' | 'streaks';
}

export interface UserSettings {
  name: string;
  petType: MascotType;
  petName: string;
  themeColor: ThemeColor;
  isNightMode: boolean;
  soundEnabled: boolean;
  lofiVolume: number;
  onboardingCompleted: boolean;
}

export interface AppState {
  settings: UserSettings;
  stars: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  subjects: Subject[];
  exams: ExamDate[];
  tasks: StudyTask[];
  garden: Flower[];
  needsWaterPile: NeedsWaterItem[];
  flashcards: Flashcard[];
  activeQuiz: QuizQuestion[];
  focusSessions: FocusSession[];
  stickers: Sticker[];
  weekGoal?: string;
  mascotCheer?: string;
}
