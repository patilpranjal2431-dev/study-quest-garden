import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  User,
  Heart,
  Palette,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { AppState, MascotType, ThemeColor } from '../types';
import { exportStudyDataAsCsv } from '../utils/exportCsv';
import { getDefaultState } from '../utils/storage';

interface SettingsViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateState,
  onResetData,
}) => {
  const [userName, setUserName] = useState(state.settings.name);
  const [petName, setPetName] = useState(state.settings.petName);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('📚');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        name: userName.trim() || 'Scholar',
        petName: petName.trim() || 'Companion',
      },
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSelectPet = (petType: MascotType, defaultName: string) => {
    onUpdateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        petType,
        petName: petName === prev.settings.petName ? defaultName : petName,
      },
    }));
  };

  const handleSelectTheme = (themeColor: ThemeColor) => {
    onUpdateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        themeColor,
      },
    }));
  };

  const handleToggleNightMode = () => {
    onUpdateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        isNightMode: !prev.settings.isNightMode,
      },
    }));
  };

  const handleToggleSound = () => {
    onUpdateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: !prev.settings.soundEnabled,
      },
    }));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const colors = ['#D4F5E5', '#FFD9C9', '#E4D9FF', '#FFF2B2', '#FFD2DF', '#B5E2FA'];
    const randomColor = colors[state.subjects.length % colors.length];

    onUpdateState((prev) => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          id: `sub-${Date.now()}`,
          name: newSubjectName.trim(),
          color: randomColor,
          icon: newSubjectIcon,
        },
      ],
    }));

    setNewSubjectName('');
  };

  const handleDeleteSubject = (id: string) => {
    if (state.subjects.length <= 1) return;
    onUpdateState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape washi-tape-butter px-3 py-1 rounded-sm text-xs font-bold text-amber-900 mb-1">
            <span>⚙️ Notebook Customizer</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100">
            Study Preferences & Data
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            Customize your companion pet, color themes, sound effects, or export your progress.
          </p>
        </div>

        <button
          onClick={() => exportStudyDataAsCsv(state)}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-900 dark:text-emerald-100 text-emerald-950 border border-emerald-300 dark:border-emerald-700 shadow-soft transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export My Data (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companion Mascot Selector */}
        <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-6 border border-amber-200/80 dark:border-purple-800/60 shadow-card space-y-4">
          <h3 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <span>Choose Your Pet Mascot</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'bunny', label: 'Boba Bunny', icon: '🐰', defaultName: 'Boba' },
              { type: 'cat', label: 'Mochi Cat', icon: '🐱', defaultName: 'Mochi' },
              { type: 'shiba', label: 'Miso Shiba', icon: '🦊', defaultName: 'Miso' },
            ].map((pet) => (
              <button
                key={pet.type}
                type="button"
                onClick={() => handleSelectPet(pet.type as any, pet.defaultName)}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                  state.settings.petType === pet.type
                    ? 'bg-amber-100 dark:bg-purple-900/60 border-amber-400 dark:border-purple-500 shadow-xs'
                    : 'bg-stone-50 dark:bg-purple-950/20 border-stone-200 dark:border-purple-800/50 hover:bg-stone-100'
                }`}
              >
                <span className="text-3xl">{pet.icon}</span>
                <span className="text-xs font-bold text-stone-800 dark:text-purple-100">
                  {pet.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-purple-300 mb-1">
                  Your Student Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-purple-300 mb-1">
                  Pet's Name
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profile Updated!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-300 hover:bg-amber-400 dark:bg-purple-700 text-stone-900 dark:text-purple-100 shadow-xs"
              >
                Save Names
              </button>
            </div>
          </form>
        </div>

        {/* Theme & Atmosphere */}
        <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-6 border border-amber-200/80 dark:border-purple-800/60 shadow-card space-y-4">
          <h3 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" />
            <span>Journal Atmosphere</span>
          </h3>

          {/* Theme Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-purple-300 mb-2">
              Pastel Accent Palette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'peach', label: 'Peach', color: '#FFD9C9' },
                { id: 'lavender', label: 'Lavender', color: '#E4D9FF' },
                { id: 'mint', label: 'Matcha', color: '#D4F5E5' },
                { id: 'butter', label: 'Butter', color: '#FFF2B2' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id as any)}
                  className={`p-2.5 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    state.settings.themeColor === theme.id
                      ? 'border-stone-800 dark:border-white shadow-xs'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: theme.color }}
                >
                  <span className="text-stone-900 font-bold">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            {/* Night Study Mode */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-purple-900/30 border border-stone-200 dark:border-purple-800">
              <div className="flex items-center gap-2.5">
                {state.settings.isNightMode ? (
                  <Moon className="w-5 h-5 text-purple-300" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <span className="text-xs font-bold text-stone-800 dark:text-purple-100 block">
                    Dark "Night Study" Mode
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-purple-300">
                    Nocturnal palette with soft glowing starlight
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleNightMode}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  state.settings.isNightMode ? 'bg-purple-600' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    state.settings.isNightMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-purple-900/30 border border-stone-200 dark:border-purple-800">
              <div className="flex items-center gap-2.5">
                {state.settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <VolumeX className="w-5 h-5 text-stone-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-stone-800 dark:text-purple-100 block">
                    Sound Effects & Chimes
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-purple-300">
                    Audio chimes for task completions and blooms
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  state.settings.soundEnabled ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    state.settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Manager */}
        <div className="md:col-span-2 bg-white dark:bg-purple-950/40 rounded-3xl p-6 border border-amber-200/80 dark:border-purple-800/60 shadow-card space-y-4">
          <h3 className="font-hand text-xl font-bold text-stone-800 dark:text-purple-100 flex items-center gap-2">
            <span>📚 Subject Registry</span>
          </h3>

          <div className="flex flex-wrap gap-2.5">
            {state.subjects.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-stone-300/80 dark:border-purple-700 shadow-xs text-xs font-bold"
                style={{ backgroundColor: sub.color }}
              >
                <span>{sub.icon || '📖'}</span>
                <span className="text-stone-900">{sub.name}</span>
                {state.subjects.length > 1 && (
                  <button
                    onClick={() => handleDeleteSubject(sub.id)}
                    className="text-stone-500 hover:text-red-700 p-0.5 ml-1 transition-colors"
                    title="Remove subject"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubject} className="flex gap-2 pt-2">
            <select
              value={newSubjectIcon}
              onChange={(e) => setNewSubjectIcon(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100"
            >
              <option value="📚">📚 Books</option>
              <option value="🧬">🧬 Science</option>
              <option value="📐">📐 Math</option>
              <option value="📜">📜 History</option>
              <option value="🎨">🎨 Art</option>
              <option value="💻">💻 Code</option>
              <option value="🌍">🌍 Geography</option>
              <option value="🎵">🎵 Music</option>
            </select>

            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New Subject Name (e.g. Physics, French...)"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100 font-semibold"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-300 hover:bg-amber-400 dark:bg-purple-700 text-stone-900 dark:text-purple-100 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>

        {/* Data Reset */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-red-900 dark:text-red-200 block">
              Reset Journal Data
            </span>
            <span className="text-[11px] text-red-700/80 dark:text-red-300/70">
              Clear all tasks, flowers, quiz records, and restore starter data.
            </span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all Study Quest data to default starter state?')) {
                onResetData();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-100 dark:bg-red-900/60 hover:bg-red-200 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-800 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Starter Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
