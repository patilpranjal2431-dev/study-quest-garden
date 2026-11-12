import React, { useState } from 'react';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, MascotType, ThemeColor } from '../types';
import { playBloom } from '../utils/sound';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: { name: string; petType: MascotType; petName: string; themeColor: ThemeColor }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [petType, setPetType] = useState<MascotType>('bunny');
  const [petName, setPetName] = useState('Boba');
  const [themeColor, setThemeColor] = useState<ThemeColor>('peach');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
      playBloom(true);
      onComplete({
        name: name.trim() || 'Scholar',
        petType,
        petName: petName.trim() || 'Companion',
        themeColor,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-purple-950 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-200 dark:border-purple-700 relative overflow-hidden">
        {/* Washi tape header banner */}
        <div className="washi-tape px-4 py-1.5 text-center text-xs font-bold text-amber-950 mb-4 rounded-sm mx-auto w-fit">
          📖 Welcome to Study Quest Garden
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-amber-400 dark:bg-purple-500'
                  : s < step
                  ? 'w-4 bg-emerald-400'
                  : 'w-4 bg-stone-200 dark:bg-purple-900'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: USER NAME */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">🌱✨</div>
            <h3 className="font-hand text-2xl font-bold text-stone-900 dark:text-purple-100">
              What shall we call you?
            </h3>
            <p className="text-xs text-stone-500 dark:text-purple-300">
              Welcome to your personal bullet-journal planner. Enter your name or nickname!
            </p>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (e.g. Mia, Alex, Emma)"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              className="w-full px-4 py-3 text-sm rounded-2xl border-2 border-amber-200 dark:border-purple-700 bg-amber-50/50 dark:bg-purple-900/30 text-stone-900 dark:text-purple-100 text-center font-bold focus:outline-hidden focus:border-amber-400"
            />
          </div>
        )}

        {/* STEP 2: CHOOSE PET */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <h3 className="font-hand text-2xl font-bold text-stone-900 dark:text-purple-100">
              Adopt your Study Mascot!
            </h3>
            <p className="text-xs text-stone-500 dark:text-purple-300">
              Your pet will study alongside you, bounce when you complete quests, and evolve as you collect stars!
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { type: 'bunny', icon: '🐰', name: 'Boba Bunny' },
                { type: 'cat', icon: '🐱', name: 'Mochi Cat' },
                { type: 'shiba', icon: '🦊', name: 'Miso Shiba' },
              ].map((p) => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => {
                    setPetType(p.type as any);
                    setPetName(p.name.split(' ')[0]);
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                    petType === p.type
                      ? 'border-amber-400 bg-amber-100 dark:bg-purple-900/60 shadow-xs'
                      : 'border-stone-200 dark:border-purple-800/40 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-xs font-bold text-stone-800 dark:text-purple-100">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-stone-500 dark:text-purple-300 mb-1">
                Pet's Name:
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-48 px-3 py-1.5 text-xs text-center rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/40 font-bold"
              />
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE THEME */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <h3 className="font-hand text-2xl font-bold text-stone-900 dark:text-purple-100">
              Pick Your Journal Theme
            </h3>
            <p className="text-xs text-stone-500 dark:text-purple-300">
              Choose your favorite pastel accent color. You can change this anytime!
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'peach', label: 'Peach Blossom', color: '#FFD9C9' },
                { id: 'lavender', label: 'Lavender Dream', color: '#E4D9FF' },
                { id: 'mint', label: 'Matcha Mint', color: '#D4F5E5' },
                { id: 'butter', label: 'Honey Butter', color: '#FFF2B2' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeColor(t.id as any)}
                  className={`p-3.5 rounded-2xl border-2 transition-all font-bold text-xs flex items-center justify-center gap-2 ${
                    themeColor === t.id
                      ? 'border-stone-800 dark:border-white shadow-soft scale-102'
                      : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: t.color }}
                >
                  <span className="text-stone-900">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next / Finish Button */}
        <div className="pt-6 flex justify-end">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 text-stone-900 dark:text-purple-100 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{step === 3 ? 'Start My Study Quest! 🌸' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
