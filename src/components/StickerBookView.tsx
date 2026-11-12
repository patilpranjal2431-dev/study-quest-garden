import React, { useState } from 'react';
import { Sparkles, Lock, Award, CheckCircle, Info, X } from 'lucide-react';
import { AppState, Sticker } from '../types';

interface StickerBookViewProps {
  state: AppState;
}

export const StickerBookView: React.FC<StickerBookViewProps> = ({ state }) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const unlockedCount = state.stickers.filter((s) => s.unlocked).length;

  const filteredStickers = state.stickers.filter((s) => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape washi-tape-pink px-3 py-1 rounded-sm text-xs font-bold text-pink-900 mb-1">
            <span>📖 Collector Album</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100">
            Pastel Sticker Book
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            Milestones and triumphs you achieve earn cute collectible die-cut stickers for your journal!
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-purple-900/60 px-4 py-2 rounded-2xl border border-amber-300/80 dark:border-purple-700 self-start sm:self-auto">
          <Award className="w-4 h-4 text-amber-700 dark:text-amber-300" />
          <span className="text-xs font-bold text-stone-800 dark:text-purple-100">
            {unlockedCount} of {state.stickers.length} Collected
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Stickers' },
          { id: 'quests', label: 'Quests & Goals' },
          { id: 'garden', label: 'Garden & Quizzes' },
          { id: 'streaks', label: 'Streaks' },
          { id: 'focus', label: 'Focus & Mood' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              categoryFilter === tab.id
                ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs font-bold'
                : 'bg-stone-100 dark:bg-purple-950/50 text-stone-600 dark:text-purple-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sticker Album Pages Grid */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#FFFDF9] to-[#F9F5EC] dark:from-[#201a33] dark:to-[#171326] border-2 border-stone-200 dark:border-purple-800 shadow-soft min-h-[380px]">
        {/* Album Page Texture Lines */}
        <div className="absolute inset-x-8 top-4 flex justify-between text-[10px] text-stone-300 dark:text-purple-900/60 font-mono select-none">
          <span>STICKER SPREAD VOL. 1</span>
          <span>KEEP SHINING ⭐</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {filteredStickers.map((sticker) => {
            const isUnlocked = sticker.unlocked;

            return (
              <div
                key={sticker.id}
                onClick={() => setSelectedSticker(sticker)}
                className={`group relative cursor-pointer flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 hover:rotate-1 hover:scale-105 active:scale-95 ${
                  isUnlocked
                    ? 'bg-white dark:bg-purple-900/30 border-amber-300/80 dark:border-purple-600 shadow-card hover:shadow-soft'
                    : 'bg-stone-100/60 dark:bg-purple-950/30 border-dashed border-stone-300 dark:border-purple-900 opacity-60'
                }`}
              >
                {/* Die-cut Sticker Badge */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 relative transition-transform ${
                    isUnlocked ? 'group-hover:animate-bounce-mascot' : 'grayscale'
                  }`}
                >
                  {/* Holographic foil sheen background */}
                  {isUnlocked && (
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-pink-300/30 via-yellow-200/30 to-purple-300/30 opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}

                  <span className="relative z-10">{sticker.icon}</span>

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-stone-900/20 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center z-20">
                      <Lock className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Sticker Title */}
                <span className="font-hand text-base font-bold text-stone-800 dark:text-purple-100 text-center leading-tight">
                  {sticker.name}
                </span>

                <span className="text-[10px] text-stone-500 dark:text-purple-300/70 text-center mt-0.5">
                  {isUnlocked ? 'Unlocked!' : sticker.condition}
                </span>

                {isUnlocked && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs text-amber-500">
                    ✨
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Sticker Modal */}
      {selectedSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-purple-950 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-200 dark:border-purple-700 text-center space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSticker(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-5xl bg-amber-100 dark:bg-purple-900/60 border-2 border-amber-300 shadow-soft">
              {selectedSticker.icon}
            </div>

            <div>
              <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-100">
                {selectedSticker.name}
              </h3>
              <p className="text-xs text-stone-600 dark:text-purple-300 mt-1">
                {selectedSticker.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-purple-900/30 border border-stone-200 dark:border-purple-800 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-stone-400">Unlock Condition:</span>
                <span className="font-bold text-stone-700 dark:text-purple-200">
                  {selectedSticker.condition}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-stone-400">Status:</span>
                <span
                  className={`font-bold ${
                    selectedSticker.unlocked ? 'text-emerald-600' : 'text-stone-400'
                  }`}
                >
                  {selectedSticker.unlocked ? 'Unlocked 🌟' : 'In Progress ⏳'}
                </span>
              </div>
              {selectedSticker.unlockedAt && (
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-400">Earned Date:</span>
                  <span className="font-bold">{selectedSticker.unlockedAt}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSticker(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 hover:bg-amber-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
