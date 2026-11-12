import React, { useState } from 'react';
import {
  Calendar,
  Flower2,
  Coffee,
  Sparkles,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Flame,
  Star,
  Music,
} from 'lucide-react';
import { AppState, MascotType } from '../types';
import { Mascot } from './Mascot';
import { getTodayStr, getDaysOffsetStr } from '../utils/storage';
import { lofiPlayer } from '../utils/sound';

interface NotebookLayoutProps {
  state: AppState;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleNightMode: () => void;
  isMascotBouncing: boolean;
  children: React.ReactNode;
}

export const NotebookLayout: React.FC<NotebookLayoutProps> = ({
  state,
  activeTab,
  onTabChange,
  onToggleNightMode,
  isMascotBouncing,
  children,
}) => {
  const isNight = state.settings.isNightMode;
  const todayStr = getTodayStr();

  // Check if user hasn't studied today or yesterday -> sleepy mascot
  const isSleepy = state.lastActiveDate !== todayStr && state.lastActiveDate !== getDaysOffsetStr(-1);

  const tabs = [
    { id: 'planner', label: 'Planner', icon: '📋', tag: 'Quests' },
    { id: 'quiz', label: 'Quiz Garden', icon: '🌸', tag: 'Practice' },
    { id: 'garden', label: 'My Garden', icon: '🌿', tag: 'Blooms' },
    { id: 'pomodoro', label: 'Cozy Focus', icon: '🍵', tag: 'Timer' },
    { id: 'stickers', label: 'Stickers', icon: '📖', tag: 'Album' },
    { id: 'recap', label: 'Recap', icon: '📊', tag: 'Summary' },
    { id: 'settings', label: 'Settings', icon: '⚙️', tag: 'Options' },
  ];

  // Theme accent background based on settings
  const themeAccentStyle = {
    peach: 'bg-[#FFF8EE]',
    lavender: 'bg-[#F9F6FF]',
    mint: 'bg-[#F4FAF6]',
    butter: 'bg-[#FFFBF0]',
  }[state.settings.themeColor || 'peach'];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 relative overflow-x-hidden ${
        isNight
          ? 'paper-dots-dark text-purple-100 selection:bg-purple-700 selection:text-white'
          : `${themeAccentStyle} paper-dots-light text-stone-800 selection:bg-pink-200 selection:text-pink-900`
      }`}
    >
      {/* Night Study Fireflies / Twinkling Stars */}
      {isNight && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/12 text-yellow-200 text-sm animate-firefly">✨</div>
          <div className="absolute top-1/3 right-1/6 text-yellow-100 text-xs animate-firefly" style={{ animationDelay: '1.2s' }}>⭐</div>
          <div className="absolute bottom-1/4 left-1/5 text-yellow-200 text-base animate-firefly" style={{ animationDelay: '2.1s' }}>✨</div>
          <div className="absolute bottom-1/3 right-1/12 text-yellow-100 text-xs animate-firefly" style={{ animationDelay: '0.8s' }}>🌟</div>
          <div className="absolute top-1/6 right-1/3 text-amber-200 text-sm animate-firefly" style={{ animationDelay: '1.8s' }}>✨</div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Top Floating App Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 px-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-xs">🌱</span>
            <div>
              <h1 className="font-hand text-2xl sm:text-3xl font-extrabold tracking-wide text-stone-800 dark:text-purple-100 flex items-center gap-2">
                <span>Study Quest Garden</span>
              </h1>
              <span className="text-[11px] text-stone-500 dark:text-purple-300/80 font-medium block -mt-1">
                Cozy Bullet Journal & Botanical Quiz Planner
              </span>
            </div>
          </div>

          {/* Quick Status Badges & Night Mode Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100/90 dark:bg-purple-900/60 border border-amber-300/80 dark:border-purple-700 shadow-xs text-xs font-bold text-amber-900 dark:text-purple-200"
              title={`${state.streak} consecutive active study days!`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
              <span>{state.streak} Day Streak</span>
            </div>

            {/* Stars Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-yellow-100/90 dark:bg-yellow-950/50 border border-yellow-300 dark:border-yellow-700/60 shadow-xs text-xs font-bold text-yellow-900 dark:text-yellow-200"
              title={`${state.stars} stars collected from quests and quizzes!`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{state.stars} Stars</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleNightMode}
              className="p-2 rounded-2xl bg-white/80 dark:bg-purple-900/60 hover:bg-white dark:hover:bg-purple-800 border border-stone-200 dark:border-purple-700 text-stone-700 dark:text-purple-200 shadow-xs transition-transform active:scale-90"
              title={isNight ? 'Switch to Pastel Day Mode' : 'Switch to Dark Night Study Mode'}
            >
              {isNight ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600" />
              )}
            </button>
          </div>
        </header>

        {/* THE NOTEBOOK BODY */}
        <div className="relative flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl bg-[#FFFDF9] dark:bg-[#1D1730] border-2 sm:border-4 border-[#EADDCF] dark:border-[#382F56] shadow-soft overflow-hidden">
          {/* Metallic Spiral Rings on Left / Top */}
          <div className="hidden lg:flex flex-col justify-around py-8 px-2.5 bg-stone-100 dark:bg-purple-950/80 border-r-2 border-stone-200 dark:border-purple-900 w-10 shrink-0">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center my-1.5">
                <div className="w-6 h-3 rounded-full spiral-wire" />
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Side Notebook Tabs */}
          <div className="hidden md:flex flex-col gap-1.5 p-3 bg-stone-50/70 dark:bg-purple-950/50 border-r border-stone-200 dark:border-purple-800/60 w-52 shrink-0">
            {/* Mascot in Sidebar */}
            <div className="pb-3 border-b border-stone-200 dark:border-purple-800/60">
              <Mascot
                type={state.settings.petType}
                name={state.settings.petName}
                stars={state.stars}
                isSleepy={isSleepy}
                isBouncing={isMascotBouncing}
                message={state.mascotCheer}
                size="sm"
              />
            </div>

            {/* Tab navigation links */}
            <div className="space-y-1 pt-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-soft translate-x-1 border border-amber-300 dark:border-purple-600'
                        : 'text-stone-600 dark:text-purple-300 hover:bg-stone-100 dark:hover:bg-purple-900/40 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base group-hover:scale-110 transition-transform">
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </div>
                    <span
                      className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-white/80 dark:bg-purple-950 text-amber-900 dark:text-purple-200'
                          : 'text-stone-400 opacity-60'
                      }`}
                    >
                      {tab.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Top Tabs */}
          <div className="flex md:hidden overflow-x-auto gap-1 p-2 bg-stone-50 dark:bg-purple-950/60 border-b border-stone-200 dark:border-purple-800/60">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                    : 'text-stone-600 dark:text-purple-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Notebook Page Main Content Area */}
          <main className="flex-1 p-4 sm:p-7 min-w-0">
            {/* Washi tape decoration on notebook page corner */}
            <div className="flex justify-between items-center mb-4">
              <div className="washi-tape px-3 py-0.5 rounded-sm text-[10px] font-bold text-amber-900 select-none">
                STUDY QUEST JOURNAL
              </div>
              <div className="text-[11px] font-mono text-stone-400 select-none">
                {todayStr} • PAGE {tabs.findIndex((t) => t.id === activeTab) + 1} OF 7
              </div>
            </div>

            {/* Active Feature View */}
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-stone-500 dark:text-purple-400/80 font-medium flex flex-wrap items-center justify-center gap-4">
          <span>🌱 Study Quest Garden</span>
          <span>•</span>
          <span>Made for mindful, encouraging learning</span>
          <span>•</span>
          <button
            onClick={() => onTabChange('settings')}
            className="hover:underline font-semibold text-amber-700 dark:text-purple-300"
          >
            Customize Companion & Data
          </button>
        </footer>
      </div>
    </div>
  );
};
