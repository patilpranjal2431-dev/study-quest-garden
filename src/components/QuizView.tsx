import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  BookOpen,
  HelpCircle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Droplets,
  Flower2,
  ChevronRight,
  Lightbulb,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Flower, Flashcard, QuizQuestion, NeedsWaterItem } from '../types';
import { getTodayStr, getDaysOffsetStr } from '../utils/storage';
import { playBloom, playChime } from '../utils/sound';

interface QuizViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onFlowerPlanted: (flower: Flower) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  state,
  onUpdateState,
  onFlowerPlanted,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'quiz' | 'flashcards' | 'needs_water'>('generate');

  // Generation form states
  const [notesText, setNotesText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(state.subjects[0]?.name || 'General');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Active Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);

  // Needs Water Spaced Repetition Review State
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewSelectedOption, setReviewSelectedOption] = useState<number | null>(null);
  const [reviewAnswerRevealed, setReviewAnswerRevealed] = useState(false);

  const todayStr = getTodayStr();

  // Handle Text File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotesText(content);
        // Guess subject from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const matchingSubject = state.subjects.find((s) =>
          cleanName.toLowerCase().includes(s.name.toLowerCase())
        );
        if (matchingSubject) {
          setSelectedSubject(matchingSubject.name);
        }
      }
    };
    reader.readAsText(file);
  };

  // Call server to generate quiz
  const handleGenerateQuiz = async () => {
    if (!notesText.trim() || notesText.trim().length < 10) {
      setGenerateError('Please enter at least a few sentences of notes or study text.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notesText,
          subject: selectedSubject,
          difficulty,
          questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('AI could not formulate questions from this text. Please check notes and retry.');
      }

      // Attach subject to questions
      const preparedQuestions: QuizQuestion[] = data.questions.map((q: any, i: number) => ({
        id: `quiz-q-${Date.now()}-${i}`,
        question: q.question,
        options: q.options || [],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || 'Great job checking your understanding!',
        flowerType: q.flowerType || 'Sakura',
        subject: selectedSubject,
      }));

      // Flashcards
      const newFlashcards: Flashcard[] = (data.flashcards || []).map((fc: any, i: number) => ({
        id: `fc-${Date.now()}-${i}`,
        front: fc.front,
        back: fc.back,
        hint: fc.hint,
        subject: selectedSubject,
        mastered: false,
      }));

      onUpdateState((prev) => ({
        ...prev,
        activeQuiz: preparedQuestions,
        flashcards: [...newFlashcards, ...prev.flashcards],
      }));

      // Reset quiz session
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setQuizScore(0);
      setIsQuizCompleted(false);
      setActiveTab('quiz');

      playBloom(state.settings.soundEnabled);
    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message || 'Error creating quiz. Please try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Quiz Option Selection
  const handleSelectQuizOption = (optionIndex: number) => {
    if (isAnswerRevealed || !currentQuestion) return;

    setSelectedOption(optionIndex);
    setIsAnswerRevealed(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      playBloom(state.settings.soundEnabled);

      // Create and grow a new flower in virtual garden!
      const newFlower: Flower = {
        id: `flower-${Date.now()}`,
        type: currentQuestion.flowerType || 'Sakura',
        stage: 'blooming',
        subject: currentQuestion.subject || selectedSubject,
        plantedAt: todayStr,
        questionAnswered: currentQuestion.question,
      };

      onFlowerPlanted(newFlower);
      onUpdateState((prev) => ({
        ...prev,
        stars: prev.stars + 15, // +15 stars for correct answer
      }));
    } else {
      // Send to "Needs Water" spaced-repetition pile!
      const newNeedsWaterItem: NeedsWaterItem = {
        id: `nw-${Date.now()}`,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctIndex: currentQuestion.correctIndex,
        explanation: currentQuestion.explanation,
        subject: currentQuestion.subject || selectedSubject,
        flowerType: currentQuestion.flowerType || 'Daisy',
        wrongCount: 1,
        reviewStep: 0,
        nextReviewDate: todayStr, // available for review
      };

      onUpdateState((prev) => ({
        ...prev,
        needsWaterPile: [
          newNeedsWaterItem,
          ...prev.needsWaterPile.filter((item) => item.question !== currentQuestion.question),
        ],
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < state.activeQuiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      setIsQuizCompleted(true);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
      playChime(state.settings.soundEnabled);
    }
  };

  const currentQuestion = state.activeQuiz[currentQuestionIndex];

  // Needs Water Spaced Repetition handler
  const dueNeedsWaterItems = state.needsWaterPile.filter(
    (item) => item.nextReviewDate <= todayStr && item.reviewStep < 3
  );
  const currentReviewItem = dueNeedsWaterItems[reviewIndex];

  const handleReviewAnswer = (index: number) => {
    if (reviewAnswerRevealed || !currentReviewItem) return;
    setReviewSelectedOption(index);
    setReviewAnswerRevealed(true);

    const isCorrect = index === currentReviewItem.correctIndex;
    if (isCorrect) {
      playBloom(state.settings.soundEnabled);
      // Advance spaced repetition step (0 -> 1 day, 1 -> 3 days, 2 -> 7 days, 3 -> graduated)
      const nextStep = currentReviewItem.reviewStep + 1;
      const daysToAdd = nextStep === 1 ? 1 : nextStep === 2 ? 3 : 7;
      const nextDate = getDaysOffsetStr(daysToAdd);

      onUpdateState((prev) => {
        const updatedPile = prev.needsWaterPile.map((item) => {
          if (item.id === currentReviewItem.id) {
            return {
              ...item,
              reviewStep: nextStep,
              nextReviewDate: nextDate,
              lastReviewedDate: todayStr,
            };
          }
          return item;
        });

        // If graduated (step 3), award golden bloom flower!
        let updatedGarden = prev.garden;
        if (nextStep >= 3) {
          const healedFlower: Flower = {
            id: `healed-flower-${Date.now()}`,
            type: currentReviewItem.flowerType,
            stage: 'golden',
            subject: currentReviewItem.subject,
            plantedAt: todayStr,
            questionAnswered: `Mastered via Spaced Repetition: ${currentReviewItem.question}`,
          };
          updatedGarden = [healedFlower, ...prev.garden];
        }

        return {
          ...prev,
          stars: prev.stars + (nextStep >= 3 ? 30 : 10),
          needsWaterPile: updatedPile,
          garden: updatedGarden,
        };
      });
    }
  };

  const handleNextReviewItem = () => {
    if (reviewIndex < dueNeedsWaterItems.length - 1) {
      setReviewIndex((prev) => prev + 1);
    } else {
      setReviewIndex(0);
    }
    setReviewSelectedOption(null);
    setReviewAnswerRevealed(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape washi-tape-mint px-3 py-1 rounded-sm text-xs font-bold text-emerald-900 mb-1">
            <span>🌸 Quiz & Study Garden</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100">
            Notes to Quiz Generator
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            Paste notes, answer questions, and watch your virtual garden blossom with every correct answer!
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 dark:bg-purple-950/60 rounded-2xl border border-stone-200 dark:border-purple-800">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                : 'text-stone-600 dark:text-purple-300 hover:text-stone-900'
            }`}
          >
            ✨ Make Quiz
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                : 'text-stone-600 dark:text-purple-300 hover:text-stone-900'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5 text-pink-500" />
            <span>Quiz Mode ({state.activeQuiz.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                : 'text-stone-600 dark:text-purple-300 hover:text-stone-900'
            }`}
          >
            📇 Flashcards ({state.flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('needs_water')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'needs_water'
                ? 'bg-amber-100 dark:bg-purple-800 text-amber-900 dark:text-purple-100 shadow-xs'
                : 'text-stone-600 dark:text-purple-300 hover:text-stone-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Needs Water ({dueNeedsWaterItems.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MAKE A QUIZ */}
      {activeTab === 'generate' && (
        <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-5 sm:p-7 border border-amber-200/80 dark:border-purple-800/60 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-100 flex items-center gap-2">
                <span>📝 Paste Notes or Upload Text File</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-purple-300/70">
                Paste textbook excerpts, lecture notes, or markdown. Gemini extracts key concepts into flashcards & quiz questions!
              </p>
            </div>

            {/* File Upload Button */}
            <label className="cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-purple-900/60 hover:bg-amber-200 text-amber-900 dark:text-purple-200 border border-amber-300 dark:border-purple-700 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt or .md</span>
              <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
              >
                {state.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
              >
                <option value="easy">Easy (Definitions & Recall)</option>
                <option value="medium">Medium (Applications & Steps)</option>
                <option value="challenging">Challenging (Analysis & Problem Solving)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 6)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
              >
                <option value={4}>4 Quick Questions</option>
                <option value={6}>6 Standard Questions</option>
                <option value={8}>8 Deep Review Questions</option>
                <option value={10}>10 Full Mastery Challenge</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 dark:text-purple-200">
                Your Notes
              </label>
              <button
                type="button"
                onClick={() =>
                  setNotesText(
                    `Photosynthesis occurs in chloroplasts. In the light-dependent reactions, chlorophyll absorbs photons, splitting water into oxygen, protons, and high-energy electrons. This drives ATP synthesis via photophosphorylation and reduces NADP+ to NADPH. In the Calvin cycle (light-independent reactions), the enzyme RuBisCO fixes carbon dioxide into 3-PGA, which is reduced using ATP and NADPH into G3P to form glucose. Cellular respiration in mitochondria operates in reverse: glycolysis breaks glucose into 2 pyruvate, generating net 2 ATP and 2 NADH. The Krebs cycle oxidizes acetyl-CoA, releasing CO2 and loading electron carriers. Finally, the electron transport chain uses oxygen as the terminal electron acceptor, pumping protons to drive ATP synthase and generating approximately 30-32 ATP.`
                  )
                }
                className="text-[11px] text-amber-700 dark:text-purple-300 hover:underline font-semibold"
              >
                ✨ Insert Sample Biology Notes
              </button>
            </div>
            <textarea
              rows={8}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Paste lecture notes, study guide summaries, or book paragraphs here..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-stone-300 dark:border-purple-700 bg-stone-50/70 dark:bg-purple-900/20 text-stone-800 dark:text-purple-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>

          {generateError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{generateError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-stone-500 dark:text-purple-400">
              🌱 Every correct answer will sprout a new flower in your virtual garden!
            </span>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !notesText.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-linear-to-r from-amber-300 via-pink-300 to-purple-300 dark:from-purple-800 dark:via-pink-800 dark:to-amber-800 hover:opacity-95 text-stone-900 dark:text-purple-100 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{state.settings.petName} is generating your quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  <span>Sprout Quiz & Flashcards</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE QUIZ MODE */}
      {activeTab === 'quiz' && (
        <div>
          {state.activeQuiz.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-stone-300 dark:border-purple-800/40 bg-stone-50/50 dark:bg-purple-950/20">
              <Flower2 className="w-12 h-12 mx-auto text-pink-400 mb-2 animate-bounce" />
              <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-200">
                Your Quiz Plot is Empty!
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-purple-300/70 max-w-sm mx-auto mt-1 mb-4">
                Head over to the "Make Quiz" tab to paste your notes and generate an AI quiz game.
              </p>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs"
              >
                ✨ Create a Quiz Now
              </button>
            </div>
          ) : isQuizCompleted ? (
            /* Quiz Completed Celebration Screen */
            <div className="text-center py-12 px-6 rounded-3xl bg-linear-to-b from-amber-50 to-pink-50 dark:from-purple-950 dark:to-stone-900 border-2 border-amber-200 dark:border-purple-700 shadow-soft max-w-lg mx-auto">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="font-hand text-3xl font-bold text-stone-800 dark:text-purple-100">
                Quiz Quest Finished!
              </h3>
              <p className="text-sm text-stone-600 dark:text-purple-300/80 mt-1">
                You scored <span className="font-bold text-emerald-600 dark:text-emerald-400">{quizScore}</span> out of {state.activeQuiz.length} questions!
              </p>

              <div className="my-6 p-4 rounded-2xl bg-white/80 dark:bg-purple-900/50 border border-amber-200/60 dark:border-purple-700/60 text-xs text-stone-700 dark:text-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span>🌸 Flowers sprouted:</span>
                  <span className="font-bold text-pink-600 dark:text-pink-300">{quizScore} new blooms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>⭐ Stars collected:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-300">+{quizScore * 15} stars</span>
                </div>
                {state.activeQuiz.length - quizScore > 0 && (
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-300">
                    <span>💧 Needs Water review pile:</span>
                    <span className="font-bold">{state.activeQuiz.length - quizScore} question(s) saved for spaced review</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setIsAnswerRevealed(false);
                    setQuizScore(0);
                    setIsQuizCompleted(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-purple-900 text-stone-800 dark:text-purple-200 hover:bg-stone-200 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 text-stone-900 dark:text-purple-100 shadow-md"
                >
                  Create New Quiz
                </button>
              </div>
            </div>
          ) : (
            /* Single Question Screen */
            <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-6 sm:p-8 border border-amber-200/80 dark:border-purple-800/60 shadow-card max-w-2xl mx-auto space-y-6">
              {/* Question Progress Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-purple-300">
                <span className="flex items-center gap-1.5 font-hand text-base text-amber-900 dark:text-purple-200">
                  Question {currentQuestionIndex + 1} of {state.activeQuiz.length}
                </span>
                <span className="flex items-center gap-1">
                  <Flower2 className="w-3.5 h-3.5 text-pink-500" />
                  Sprouts a {currentQuestion.flowerType}
                </span>
              </div>

              <div className="w-full h-2 bg-stone-100 dark:bg-purple-900/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-300 to-pink-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + 1) / state.activeQuiz.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Text */}
              <div className="py-2">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-purple-900/80 text-amber-900 dark:text-purple-200 uppercase tracking-wider mb-2">
                  {currentQuestion.subject || selectedSubject}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-purple-100 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  let btnStyle = 'bg-stone-50/80 dark:bg-purple-900/20 border-stone-200 dark:border-purple-800/60 text-stone-800 dark:text-purple-200 hover:border-amber-300 hover:bg-amber-50/50';

                  if (isAnswerRevealed) {
                    if (idx === currentQuestion.correctIndex) {
                      btnStyle = 'bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-xs font-bold';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-red-100/80 dark:bg-red-950/70 border-red-400 text-red-950 dark:text-red-200 line-through';
                    } else {
                      btnStyle = 'opacity-40 border-stone-200 dark:border-purple-900 text-stone-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={isAnswerRevealed}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/80 dark:bg-purple-950 flex items-center justify-center font-bold text-xs shrink-0 border border-stone-200 dark:border-purple-700">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswerRevealed && idx === currentQuestion.correctIndex && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerRevealed && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswerRevealed && (
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                      selectedOption === currentQuestion.correctIndex
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {selectedOption === currentQuestion.correctIndex ? (
                        <>
                          <span>🌸 Correct! A flower bloomed in your garden!</span>
                        </>
                      ) : (
                        <>
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span>Added to "Needs Water" pile for spaced review</span>
                        </>
                      )}
                    </div>
                    <p>{currentQuestion.explanation}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 text-stone-900 dark:text-purple-100 shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <span>
                        {currentQuestionIndex < state.activeQuiz.length - 1 ? 'Next Question' : 'Complete Quiz'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FLASHCARDS MODE */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6">
          {state.flashcards.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-stone-300 dark:border-purple-800/40 bg-stone-50/50">
              <BookOpen className="w-12 h-12 mx-auto text-amber-500 mb-2" />
              <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-200">
                No Flashcards Yet
              </h3>
              <p className="text-xs text-stone-500 dark:text-purple-300/70 max-w-sm mx-auto mt-1 mb-4">
                Generate a quiz from your study notes to automatically build a cute deck of flashcards!
              </p>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-200 text-stone-900 shadow-xs"
              >
                ✨ Make Deck Now
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-purple-300 mb-3">
                <span className="font-hand text-base text-amber-900 dark:text-purple-200">
                  Card {flashcardIndex + 1} of {state.flashcards.length}
                </span>
                <span className="text-[11px] bg-amber-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md font-bold text-amber-900 dark:text-purple-200">
                  {state.flashcards[flashcardIndex].subject || 'General'}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="w-full min-h-[260px] cursor-pointer rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 shadow-soft border-2 border-amber-200/90 dark:border-purple-700 select-none bg-linear-to-br from-white via-amber-50/30 to-amber-100/30 dark:from-purple-950 dark:via-purple-900/40 dark:to-stone-900 relative group hover:border-amber-400"
              >
                <div className="flex items-center justify-between text-stone-400 text-xs">
                  <span className="font-bold tracking-wider uppercase text-[10px]">
                    {isCardFlipped ? '💡 Explanation (Back)' : '❓ Prompt (Front)'}
                  </span>
                  <span className="text-xs group-hover:text-amber-600 transition-colors">
                    Click to flip 🔄
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <p className="text-base sm:text-lg font-bold text-stone-800 dark:text-purple-100 leading-relaxed">
                    {isCardFlipped
                      ? state.flashcards[flashcardIndex].back
                      : state.flashcards[flashcardIndex].front}
                  </p>

                  {/* Hint */}
                  {!isCardFlipped && state.flashcards[flashcardIndex].hint && (
                    <div className="mt-4">
                      {showCardHint ? (
                        <span className="text-xs text-amber-800 dark:text-purple-300 bg-amber-100/70 dark:bg-purple-900/50 px-3 py-1 rounded-full border border-amber-200">
                          🔍 Hint: {state.flashcards[flashcardIndex].hint}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCardHint(true);
                          }}
                          className="text-[11px] text-stone-400 hover:text-amber-600 font-semibold inline-flex items-center gap-1"
                        >
                          <Lightbulb className="w-3 h-3" /> Show Hint
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-stone-400">
                  {state.flashcards[flashcardIndex].mastered ? '⭐ Mastered' : '🌱 Learning'}
                </div>
              </div>

              {/* Flashcard Action Buttons */}
              <div className="flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => {
                    // Mark as "Again" (keep in active rotation)
                    setIsCardFlipped(false);
                    setShowCardHint(false);
                    setFlashcardIndex((prev) => (prev + 1) % state.flashcards.length);
                  }}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-stone-100 dark:bg-purple-900/60 text-stone-700 dark:text-purple-200 hover:bg-stone-200 border border-stone-200 dark:border-purple-800 transition-all"
                >
                  Need Review (Again)
                </button>

                <button
                  onClick={() => {
                    // Mark as "Got it!"
                    playBloom(state.settings.soundEnabled);
                    onUpdateState((prev) => ({
                      ...prev,
                      stars: prev.stars + 5,
                      flashcards: prev.flashcards.map((fc, i) =>
                        i === flashcardIndex ? { ...fc, mastered: true } : fc
                      ),
                    }));
                    setIsCardFlipped(false);
                    setShowCardHint(false);
                    setFlashcardIndex((prev) => (prev + 1) % state.flashcards.length);
                  }}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  <span>Got it! (+5 stars)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NEEDS WATER (SPACED REPETITION) */}
      {activeTab === 'needs_water' && (
        <div className="max-w-xl mx-auto space-y-5">
          <div className="bg-blue-50/80 dark:bg-purple-950/40 border border-blue-200 dark:border-purple-800 rounded-3xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-purple-900/80 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-100">
                  Needs Water Garden Nursery
                </h3>
                <p className="text-xs text-stone-600 dark:text-purple-300/80 mt-0.5">
                  When you miss a quiz question, it takes root here as a thirsty sprout. Review after 1, 3, and 7 days with spaced repetition to heal it into a Golden Bloom!
                </p>
              </div>
            </div>
          </div>

          {dueNeedsWaterItems.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-3xl border-2 border-dashed border-stone-300 dark:border-purple-800/40 bg-stone-50/50">
              <span className="text-4xl block mb-2">🌿✨</span>
              <h4 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-200">
                All Plants are Hydrated and Thriving!
              </h4>
              <p className="text-xs text-stone-500 dark:text-purple-300/70 max-w-sm mx-auto mt-1">
                You have no questions pending review today. Great memory work!
              </p>
            </div>
          ) : currentReviewItem ? (
            <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-6 border border-blue-200 dark:border-purple-800 shadow-card space-y-5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-purple-300">
                <span className="font-hand text-base text-blue-900 dark:text-purple-200">
                  Nursery Sprout {reviewIndex + 1} of {dueNeedsWaterItems.length}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-purple-900 dark:text-purple-200">
                  Review Stage {currentReviewItem.reviewStep + 1}/3
                </span>
              </div>

              <div className="py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  {currentReviewItem.subject}
                </span>
                <h4 className="text-base font-bold text-stone-900 dark:text-purple-100">
                  {currentReviewItem.question}
                </h4>
              </div>

              <div className="space-y-2">
                {currentReviewItem.options.map((option, idx) => {
                  let btnStyle = 'bg-stone-50 dark:bg-purple-900/20 border-stone-200 text-stone-800 dark:text-purple-200 hover:border-blue-300';
                  if (reviewAnswerRevealed) {
                    if (idx === currentReviewItem.correctIndex) {
                      btnStyle = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 font-bold text-emerald-900';
                    } else if (idx === reviewSelectedOption) {
                      btnStyle = 'bg-red-100 dark:bg-red-950 border-red-400 line-through text-red-900';
                    } else {
                      btnStyle = 'opacity-40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleReviewAnswer(idx)}
                      disabled={reviewAnswerRevealed}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {reviewAnswerRevealed && (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-purple-900/40 border border-blue-200 dark:border-purple-800 text-xs text-blue-950 dark:text-blue-100">
                    <p className="font-bold mb-0.5">Explanation:</p>
                    <p>{currentReviewItem.explanation}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextReviewItem}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-xs"
                    >
                      Next Sprout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
