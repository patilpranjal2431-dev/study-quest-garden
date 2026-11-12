import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, Flame, Sparkles, RefreshCw, Trophy, BookOpen, AlertCircle } from 'lucide-react';
import { AppState } from '../types';
import { getDaysOffsetStr, getTodayStr } from '../utils/storage';

interface WeeklyRecapViewProps {
  state: AppState;
}

export const WeeklyRecapView: React.FC<WeeklyRecapViewProps> = ({ state }) => {
  const [aiRecap, setAiRecap] = useState<{
    summarySentence: string;
    mascotPraise: string;
    studyTip: string;
  } | null>(null);
  const [isLoadingRecap, setIsLoadingRecap] = useState(false);
  const [recapError, setRecapError] = useState<string | null>(null);

  // Compute Weekly Statistics
  // Collect last 7 days dates
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];
    return { date: dateStr, dayName };
  });

  // Calculate daily minutes from focusSessions + completed tasks
  const dailyStudyStats = last7Days.map((day) => {
    const sessionMinutes = state.focusSessions
      .filter((s) => s.date === day.date)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const taskMinutes = state.tasks
      .filter((t) => t.date === day.date && t.completed)
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    // To prevent double counting if users log both, we take max or combined realistic estimate
    const totalMins = Math.max(sessionMinutes, taskMinutes) || (sessionMinutes + taskMinutes);

    return {
      date: day.date,
      dayName: day.dayName,
      minutes: totalMins,
    };
  });

  const totalStudyMinutes = dailyStudyStats.reduce((sum, d) => sum + d.minutes, 0);
  const totalCompletedTasks = state.tasks.filter((t) => t.completed).length;

  // Find most productive day
  const sortedDays = [...dailyStudyStats].sort((a, b) => b.minutes - a.minutes);
  const mostProductiveDay = sortedDays[0]?.minutes > 0 ? sortedDays[0].dayName : 'Consistent Every Day';

  const maxMinutes = Math.max(...dailyStudyStats.map((d) => d.minutes), 60);

  // Fetch or refresh AI weekly summary
  const fetchAiRecap = async () => {
    setIsLoadingRecap(true);
    setRecapError(null);

    try {
      const response = await fetch('/api/weekly-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalMinutes: totalStudyMinutes,
          completedTasksCount: totalCompletedTasks,
          mostProductiveDay,
          streak: state.streak,
          flowersGrown: state.garden.length,
          petName: state.settings.petName,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not fetch weekly summary from Gemini.');
      }

      const data = await response.json();
      setAiRecap(data);
    } catch (err: any) {
      console.error(err);
      setRecapError(err.message || 'Error creating weekly recap.');
    } finally {
      setIsLoadingRecap(false);
    }
  };

  useEffect(() => {
    fetchAiRecap();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape washi-tape-mint px-3 py-1 rounded-sm text-xs font-bold text-emerald-900 mb-1">
            <span>📊 Weekly Bloom Journal</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100">
            Weekly Study Recap
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            Celebrate how much you've learned and grown over the past 7 days!
          </p>
        </div>

        <button
          onClick={fetchAiRecap}
          disabled={isLoadingRecap}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-purple-900 hover:bg-stone-200 text-stone-800 dark:text-purple-200 border border-stone-200 dark:border-purple-700 flex items-center gap-1.5 self-start sm:self-auto transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecap ? 'animate-spin' : ''}`} />
          <span>Refresh AI Summary</span>
        </button>
      </div>

      {/* AI Personalized Praise Card */}
      <div className="bg-linear-to-r from-amber-50 via-pink-50 to-purple-50 dark:from-purple-950/70 dark:via-purple-900/50 dark:to-stone-900 rounded-3xl p-6 border-2 border-amber-200/90 dark:border-purple-700 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-hand text-xl font-bold text-stone-900 dark:text-purple-100">
            {state.settings.petName}'s Weekly Reflection
          </h3>
        </div>

        {isLoadingRecap ? (
          <div className="py-4 text-center text-xs text-stone-500 dark:text-purple-300">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
            Generating your personalized study celebration...
          </div>
        ) : aiRecap ? (
          <div className="space-y-3 text-xs sm:text-sm">
            {/* Friendly Sentence from Gemini */}
            <p className="font-bold text-stone-800 dark:text-purple-100 text-base leading-snug">
              "{aiRecap.summarySentence}"
            </p>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-purple-950/60 border border-amber-200/60 dark:border-purple-700/60 space-y-2">
              <p className="text-amber-900 dark:text-purple-200 font-medium">
                🐾 <span className="font-bold">{state.settings.petName}:</span> {aiRecap.mascotPraise}
              </p>
              <p className="text-stone-600 dark:text-purple-300">
                💡 <span className="font-bold">Next Week's Study Tip:</span> {aiRecap.studyTip}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-600 dark:text-purple-300">
            You blossomed this week! Keep up the daily momentum and watch your garden flourish.
          </p>
        )}
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-purple-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 dark:text-purple-300 font-semibold block">
              Study Time
            </span>
            <span className="font-hand text-xl font-bold text-stone-900 dark:text-purple-100">
              {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 dark:text-purple-300 font-semibold block">
              Quests Done
            </span>
            <span className="font-hand text-xl font-bold text-stone-900 dark:text-purple-100">
              {totalCompletedTasks}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-700 dark:text-pink-300 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 dark:text-purple-300 font-semibold block">
              Top Day
            </span>
            <span className="font-hand text-xl font-bold text-stone-900 dark:text-purple-100">
              {mostProductiveDay}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-300 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 dark:text-purple-300 font-semibold block">
              Daily Streak
            </span>
            <span className="font-hand text-xl font-bold text-stone-900 dark:text-purple-100">
              {state.streak} Days 🔥
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Weekly Bar Chart */}
      <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-6 sm:p-7 border border-amber-200/80 dark:border-purple-800/60 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span>Daily Study Time (Last 7 Days)</span>
          </h4>
          <span className="text-xs text-stone-500 dark:text-purple-300 font-semibold">
            Minutes Studied
          </span>
        </div>

        <div className="h-56 pt-8 pb-4 flex items-end justify-between gap-2 sm:gap-6 border-b border-stone-200 dark:border-purple-800/60 px-2 sm:px-6">
          {dailyStudyStats.map((day) => {
            const heightPercent = maxMinutes > 0 ? Math.max((day.minutes / maxMinutes) * 100, 4) : 4;
            const isToday = day.date === getTodayStr();

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-800 text-white dark:bg-purple-800 transition-opacity pointer-events-none">
                  {day.minutes}m
                </span>

                {/* Animated Bar */}
                <div
                  className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                    isToday
                      ? 'bg-linear-to-t from-amber-400 to-pink-400 dark:from-purple-600 dark:to-pink-500 shadow-xs'
                      : 'bg-linear-to-t from-amber-200 to-amber-300 dark:from-purple-900 dark:to-purple-800 hover:from-amber-300 hover:to-amber-400'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Day Label */}
                <div className="text-center">
                  <span
                    className={`text-xs block font-bold ${
                      isToday
                        ? 'text-amber-800 dark:text-purple-200'
                        : 'text-stone-500 dark:text-purple-400'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    {day.minutes}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
