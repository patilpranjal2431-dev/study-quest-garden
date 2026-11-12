import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Plus, Sparkles, AlertCircle, BookOpen, Trash2, ChevronRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, StudyTask, ExamDate } from '../types';
import { getTodayStr, getDaysOffsetStr } from '../utils/storage';
import { playChime } from '../utils/sound';

interface PlannerViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onTaskCompleted: (task: StudyTask) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  state,
  onUpdateState,
  onTaskCompleted,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);

  // Form states for manual task
  const [taskSubject, setTaskSubject] = useState(state.subjects[0]?.name || 'General');
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskDate, setTaskDate] = useState(getTodayStr());

  // Form states for exam
  const [examSubject, setExamSubject] = useState(state.subjects[0]?.name || 'General');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(getDaysOffsetStr(7));

  // AI Planner modal states
  const [dailyHours, setDailyHours] = useState(2);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(state.subjects.map((s) => s.name));
  const [userNotes, setUserNotes] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiPlanError, setAiPlanError] = useState<string | null>(null);

  const todayStr = getTodayStr();

  // Filter tasks
  const filteredTasks = state.tasks.filter((t) => {
    if (selectedDate === 'all') return true;
    if (selectedDate === 'today') return t.date === todayStr;
    return t.date === selectedDate;
  });

  const toggleTask = (task: StudyTask) => {
    const isNowCompleted = !task.completed;

    if (isNowCompleted) {
      // Confetti burst
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFD9C9', '#E4D9FF', '#D4F5E5', '#FFF2B2', '#FF9AA2'],
      });
      playChime(state.settings.soundEnabled);
      onTaskCompleted(task);
    }

    onUpdateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === task.id
          ? { ...t, completed: isNowCompleted, completedAt: isNowCompleted ? todayStr : undefined }
          : t
      ),
      stars: isNowCompleted ? prev.stars + 10 : Math.max(0, prev.stars - 10),
    }));
  };

  const deleteTask = (taskId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const deleteExam = (examId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      exams: prev.exams.filter((e) => e.id !== examId),
    }));
  };

  const handleManualAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTopic.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      date: taskDate,
      subject: taskSubject,
      topic: taskTopic.trim(),
      durationMinutes: Number(taskDuration) || 30,
      priority: taskPriority,
      completed: false,
    };

    onUpdateState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));

    setTaskTopic('');
    setIsAddTaskModalOpen(false);
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    const newExam: ExamDate = {
      id: `exam-${Date.now()}`,
      subject: examSubject,
      name: examName.trim(),
      date: examDate,
    };

    onUpdateState((prev) => ({
      ...prev,
      exams: [...prev.exams, newExam].sort((a, b) => a.date.localeCompare(b.date)),
    }));

    setExamName('');
    setIsAddExamModalOpen(false);
  };

  const handleGenerateAiPlan = async () => {
    setIsGeneratingPlan(true);
    setAiPlanError(null);

    try {
      const response = await fetch('/api/plan-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          examDates: state.exams,
          dailyHours,
          userNotes,
          petName: state.settings.petName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.dailyPlans || !Array.isArray(data.dailyPlans)) {
        throw new Error('Received invalid plan data from AI.');
      }

      // Collect tasks from daily plans
      const newTasks: StudyTask[] = [];
      data.dailyPlans.forEach((dp: any) => {
        if (Array.isArray(dp.tasks)) {
          dp.tasks.forEach((t: any, index: number) => {
            newTasks.push({
              id: `ai-task-${dp.date}-${index}-${Date.now()}`,
              date: dp.date,
              subject: t.subject || 'Study',
              topic: t.topic || 'Review core chapter notes',
              durationMinutes: Number(t.durationMinutes) || 30,
              priority: (t.priority as any) || 'medium',
              tips: t.tips || '',
              completed: false,
            });
          });
        }
      });

      onUpdateState((prev) => ({
        ...prev,
        tasks: [...newTasks, ...prev.tasks],
        weekGoal: data.weekGoal || prev.weekGoal,
        mascotCheer: data.mascotCheer || prev.mascotCheer,
      }));

      // Confetti celebrate plan creation!
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
      playChime(state.settings.soundEnabled);

      setIsAiPlanModalOpen(false);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setAiPlanError(err.message || 'Could not generate weekly plan. Please try again!');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Helper for exam countdown
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Passed';
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow!';
    return `In ${diff} days`;
  };

  const completedTodayCount = state.tasks.filter((t) => t.date === todayStr && t.completed).length;
  const totalTodayCount = state.tasks.filter((t) => t.date === todayStr).length;

  return (
    <div className="space-y-6">
      {/* Top Header & AI Plan Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape px-3 py-1 rounded-sm text-xs font-bold text-amber-900 mb-1">
            <span>📅 Study Quest Notebook</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100 flex items-center gap-2">
            Weekly Study Planner
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            {state.weekGoal || 'Turn big study goals into cute, bite-sized quests!'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 dark:bg-purple-900/50 hover:bg-stone-200 dark:hover:bg-purple-900 text-stone-800 dark:text-purple-200 border border-stone-300/60 dark:border-purple-700/60 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-600 dark:text-purple-300" />
            <span>Add Quest</span>
          </button>

          <button
            onClick={() => setIsAiPlanModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-linear-to-r from-amber-200 via-pink-200 to-purple-200 dark:from-purple-900 dark:via-pink-900/40 dark:to-amber-900/40 hover:opacity-95 text-stone-800 dark:text-purple-100 border border-amber-300/80 dark:border-purple-600/50 shadow-soft transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
            <span>Plan My Week</span>
          </button>
        </div>
      </div>

      {/* Upcoming Exams Countdown Bar */}
      <div className="bg-amber-50/80 dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/40 rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="font-hand text-base font-bold text-amber-900 dark:text-purple-200 flex items-center gap-1.5">
            🎯 Upcoming Deadlines & Exams
          </span>
          <button
            onClick={() => setIsAddExamModalOpen(true)}
            className="text-xs text-amber-800 dark:text-purple-300 hover:underline flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Exam
          </button>
        </div>

        {state.exams.length === 0 ? (
          <p className="text-xs text-stone-500 dark:text-purple-300/70 italic">
            No exams scheduled! Click "Add Exam" to add a test date or assignment deadline.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {state.exams.map((exam) => {
              const countdown = getDaysUntil(exam.date);
              const isUrgent = countdown.includes('Today') || countdown.includes('Tomorrow') || countdown.includes('In 1') || countdown.includes('In 2') || countdown.includes('In 3');
              return (
                <div
                  key={exam.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isUrgent
                      ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
                      : 'bg-white/80 dark:bg-purple-900/30 border-amber-200/60 dark:border-purple-800/50 text-stone-800 dark:text-purple-200'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider block opacity-75">
                      {exam.subject}
                    </span>
                    <span className="font-semibold truncate block">{exam.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isUrgent
                          ? 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200'
                          : 'bg-amber-100 text-amber-900 dark:bg-purple-800/60 dark:text-purple-200'
                      }`}
                    >
                      {countdown}
                    </span>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-stone-400 hover:text-red-500 p-0.5 transition-colors"
                      title="Remove exam"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Filter & Progress pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Quests' },
            { id: 'today', label: 'Today' },
            { id: getDaysOffsetStr(1), label: 'Tomorrow' },
            { id: getDaysOffsetStr(2), label: 'Day +2' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDate(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedDate === tab.id
                  ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs font-bold'
                  : 'bg-stone-100/80 dark:bg-purple-950/40 text-stone-600 dark:text-purple-300 hover:bg-stone-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-600 dark:text-purple-300 flex items-center gap-2 font-medium">
          <span>Today's Progress:</span>
          <div className="w-24 h-2.5 bg-stone-200 dark:bg-purple-900/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-300 to-teal-400 transition-all duration-500 rounded-full"
              style={{
                width: `${totalTodayCount > 0 ? (completedTodayCount / totalTodayCount) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="font-bold">
            {completedTodayCount}/{totalTodayCount} done
          </span>
        </div>
      </div>

      {/* Task Checklist Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-stone-300 dark:border-purple-800/40 bg-stone-50/50 dark:bg-purple-950/20">
          <BookOpen className="w-12 h-12 mx-auto text-amber-600/60 dark:text-purple-400/60 mb-2" />
          <h3 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-200">
            No study quests here yet!
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-purple-300/70 max-w-sm mx-auto mt-1 mb-4">
            Click "Plan My Week" to let AI build your study schedule, or tap "Add Quest" to create a task!
          </p>
          <button
            onClick={() => setIsAiPlanModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 hover:bg-amber-300 transition-colors shadow-xs"
          >
            ✨ Spark AI Study Plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.completed;
            const priorityColors = {
              high: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200',
              medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
              low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
            }[task.priority || 'medium'];

            return (
              <div
                key={task.id}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 shadow-xs flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 opacity-80'
                    : 'bg-white dark:bg-purple-900/30 border-amber-200/70 dark:border-purple-800/50 hover:shadow-card hover:-translate-y-0.5'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task)}
                  className="mt-0.5 shrink-0 transition-transform active:scale-90"
                  title={isCompleted ? 'Mark as incomplete' : 'Complete task (+10 stars!)'}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-900/50" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-purple-800/60 text-amber-900 dark:text-purple-200">
                      {task.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-purple-300/80 font-medium">
                      <Clock className="w-3 h-3" /> {task.durationMinutes}m
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColors}`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] text-stone-400 dark:text-purple-400/60 ml-auto">
                      {task.date === todayStr ? 'Today' : task.date}
                    </span>
                  </div>

                  <p
                    className={`text-sm font-semibold transition-all ${
                      isCompleted
                        ? 'line-through text-stone-400 dark:text-purple-400/50'
                        : 'text-stone-800 dark:text-purple-100'
                    }`}
                  >
                    {task.topic}
                  </p>

                  {task.tips && (
                    <p className="mt-1 text-xs text-amber-800/80 dark:text-purple-300/80 bg-amber-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-amber-200/50 dark:border-purple-800/40 inline-block">
                      💡 Tip: {task.tips}
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-opacity"
                  title="Delete quest"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* AI PLAN MODAL */}
      {isAiPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-purple-950 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-amber-200 dark:border-purple-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-100">
                  Plan My Study Week with AI
                </h3>
              </div>
              <button
                onClick={() => setIsAiPlanModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-purple-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-purple-300/80 my-3">
              Gemini will turn your subjects, available hours, and upcoming exams into an encouraging 7-day checklist notebook schedule!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1.5">
                  Daily Available Study Time
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="font-hand text-lg font-bold text-amber-900 dark:text-purple-200 w-16 text-right">
                    {dailyHours} hrs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1.5">
                  Subjects to Include
                </label>
                <div className="flex flex-wrap gap-2">
                  {state.subjects.map((s) => {
                    const isSelected = selectedSubjects.includes(s.name);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjects((prev) =>
                            isSelected ? prev.filter((name) => name !== s.name) : [...prev, s.name]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-200 text-stone-900 border-amber-300 shadow-xs'
                            : 'bg-stone-100 text-stone-500 border-stone-200 opacity-60'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                  Specific Topics / Focus Notes (Optional)
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Focus on cell respiration diagram and factoring quadratic polynomials..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {aiPlanError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{aiPlanError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiPlanModalOpen(false)}
                  disabled={isGeneratingPlan}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 dark:text-purple-300 hover:bg-stone-100 dark:hover:bg-purple-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiPlan}
                  disabled={isGeneratingPlan || selectedSubjects.length === 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 dark:hover:bg-purple-600 text-stone-900 dark:text-purple-100 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-800" />
                      <span>{state.settings.petName} is crafting your plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate 7-Day Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD QUEST MODAL */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleManualAddTask}
            className="bg-white dark:bg-purple-950 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-200 dark:border-purple-700"
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-purple-800">
              <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-100">
                Add Study Quest
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-purple-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                  Subject
                </label>
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
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
                  Topic / Goal
                </label>
                <input
                  type="text"
                  required
                  value={taskTopic}
                  onChange={(e) => setTaskTopic(e.target.value)}
                  placeholder="e.g. Solve 5 calculus integration problems"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 dark:text-purple-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 dark:hover:bg-purple-600 text-stone-900 dark:text-purple-100 shadow-md"
                >
                  Save Quest
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ADD EXAM MODAL */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleAddExam}
            className="bg-white dark:bg-purple-950 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-200 dark:border-purple-700"
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-purple-800">
              <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-100">
                Add Exam / Deadline
              </h3>
              <button
                type="button"
                onClick={() => setIsAddExamModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                  Subject
                </label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
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
                  Exam / Assignment Name
                </label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. Unit 3 Midterm Test"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-purple-200 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 dark:text-purple-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 dark:hover:bg-purple-600 text-stone-900 dark:text-purple-100 shadow-md"
                >
                  Add Exam
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
