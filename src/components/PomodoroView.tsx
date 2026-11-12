import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, CloudRain, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, FocusSession } from '../types';
import { getTodayStr } from '../utils/storage';
import { playTimerBell, playChime, lofiPlayer } from '../utils/sound';

interface PomodoroViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({ state, onUpdateState }) => {
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sceneType, setSceneType] = useState<'teacup' | 'window'>('teacup');
  const [selectedSubject, setSelectedSubject] = useState(state.subjects[0]?.name || 'General Study');
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [lofiVolume, setLofiVolume] = useState(state.settings.lofiVolume || 0.35);

  const timerRef = useRef<any>(null);

  // Set default times for presets
  const handleModeChange = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setMode(newMode);
    setIsRunning(false);
    let mins = 25;
    if (newMode === 'short_break') mins = 5;
    if (newMode === 'long_break') mins = 15;
    setCustomMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const handleCustomTimeChange = (mins: number) => {
    const valid = Math.max(1, Math.min(120, mins));
    setCustomMinutes(valid);
    setTimeLeft(valid * 60);
    setIsRunning(false);
  };

  // Timer Tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, customMinutes, selectedSubject]);

  // Handle completion
  const handleTimerComplete = () => {
    setIsRunning(false);
    playTimerBell(state.settings.soundEnabled);

    // Confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (mode === 'focus') {
      const todayStr = getTodayStr();
      const newSession: FocusSession = {
        id: `focus-${Date.now()}`,
        date: todayStr,
        durationMinutes: customMinutes,
        mode: 'focus',
        subject: selectedSubject,
      };

      onUpdateState((prev) => ({
        ...prev,
        stars: prev.stars + 20, // +20 stars for focus session
        focusSessions: [newSession, ...prev.focusSessions],
      }));
    }
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customMinutes * 60);
  };

  const handleToggleLofi = () => {
    if (isLofiPlaying) {
      lofiPlayer.stop();
      setIsLofiPlaying(false);
    } else {
      lofiPlayer.start(lofiVolume);
      setIsLofiPlaying(true);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setLofiVolume(vol);
    lofiPlayer.setVolume(vol);
    onUpdateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, lofiVolume: vol },
    }));
  };

  // Cleanup audio when leaving view
  useEffect(() => {
    return () => {
      lofiPlayer.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = customMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape washi-tape-butter px-3 py-1 rounded-sm text-xs font-bold text-amber-900 mb-1">
            <span>⏱️ Cozy Focus Lounge</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100">
            Pomodoro Study Timer
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            Sip cozy tea, listen to lo-fi rain beats, and log deep focus sessions directly to your weekly recap!
          </p>
        </div>

        {/* Scene Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSceneType('teacup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              sceneType === 'teacup'
                ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                : 'bg-stone-100 dark:bg-purple-950 text-stone-600 dark:text-purple-300'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Cozy Teacup</span>
          </button>
          <button
            onClick={() => setSceneType('window')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              sceneType === 'window'
                ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                : 'bg-stone-100 dark:bg-purple-950 text-stone-600 dark:text-purple-300'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Window</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Main Cozy Scene & Timer Box */}
        <div className="md:col-span-7 bg-white dark:bg-purple-950/40 rounded-3xl p-6 sm:p-8 border border-amber-200/80 dark:border-purple-800/60 shadow-card flex flex-col items-center justify-center relative overflow-hidden">
          {/* Preset Buttons */}
          <div className="flex gap-2 mb-6 z-10">
            {[
              { id: 'focus', label: 'Study Focus (25m)', mins: 25 },
              { id: 'short_break', label: 'Short Break (5m)', mins: 5 },
              { id: 'long_break', label: 'Long Break (15m)', mins: 15 },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleModeChange(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === p.id
                    ? 'bg-amber-300 dark:bg-purple-700 text-stone-900 dark:text-purple-100 shadow-xs'
                    : 'bg-stone-100/90 dark:bg-purple-900/40 text-stone-600 dark:text-purple-300 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* SCENE VISUAL: TEACUP or RAIN WINDOW */}
          <div className="relative w-56 h-56 flex items-center justify-center mb-6">
            {/* Progress Circular Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="8"
                className="text-stone-100 dark:text-purple-900/30"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="text-amber-400 dark:text-purple-500 transition-all duration-1000"
                fill="transparent"
              />
            </svg>

            {/* Inner Scene */}
            <div className="absolute inset-4 rounded-full flex flex-col items-center justify-center bg-amber-50/60 dark:bg-purple-950/70 border border-amber-200/50 dark:border-purple-800/40 shadow-inner overflow-hidden">
              {sceneType === 'teacup' ? (
                /* Cute Ceramic Teacup with Steam */
                <div className="relative flex flex-col items-center">
                  {/* Steam Animation when running */}
                  {isRunning && (
                    <div className="absolute -top-7 flex gap-1.5 opacity-70">
                      <div className="w-1.5 h-6 bg-linear-to-t from-stone-400 to-transparent rounded-full animate-steam-1" />
                      <div className="w-1.5 h-8 bg-linear-to-t from-stone-400 to-transparent rounded-full animate-steam-2" />
                      <div className="w-1.5 h-6 bg-linear-to-t from-stone-400 to-transparent rounded-full animate-steam-3" />
                    </div>
                  )}

                  {/* Teacup SVG */}
                  <svg viewBox="0 0 80 50" className="w-20 h-14 drop-shadow-xs">
                    {/* Cup Body */}
                    <path
                      d="M 12 10 Q 14 42 40 42 Q 66 42 68 10 Z"
                      fill="#FFD9C9"
                      stroke="#8E5431"
                      strokeWidth="2.5"
                    />
                    {/* Cup Rim */}
                    <ellipse cx="40" cy="10" rx="28" ry="6" fill="#FFF2B2" stroke="#8E5431" strokeWidth="2.5" />
                    {/* Tea liquid */}
                    <ellipse cx="40" cy="11" rx="24" ry="4" fill="#A86539" />
                    {/* Cup Handle */}
                    <path
                      d="M 64 16 Q 78 24 62 34"
                      fill="none"
                      stroke="#8E5431"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Saucer */}
                    <ellipse cx="40" cy="46" rx="36" ry="4" fill="#E8D5C4" stroke="#8E5431" strokeWidth="2" />
                  </svg>
                </div>
              ) : (
                /* Rainy Window Scene */
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Rain drops falling */}
                  {isRunning && (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      <div className="absolute top-2 left-6 w-0.5 h-6 bg-blue-400 rotate-12 animate-pulse" />
                      <div className="absolute top-8 left-16 w-0.5 h-5 bg-blue-400 rotate-12 animate-pulse" />
                      <div className="absolute top-4 right-10 w-0.5 h-7 bg-blue-400 rotate-12 animate-pulse" />
                      <div className="absolute bottom-6 left-10 w-0.5 h-6 bg-blue-400 rotate-12 animate-pulse" />
                    </div>
                  )}
                  <CloudRain className={`w-12 h-12 text-blue-400 ${isRunning ? 'animate-bounce' : ''}`} />
                </div>
              )}

              {/* Time Display */}
              <div className="font-hand text-3xl sm:text-4xl font-bold text-stone-900 dark:text-purple-100 tracking-wider mt-1">
                {formatTime(timeLeft)}
              </div>
              <span className="text-[10px] font-bold text-stone-500 dark:text-purple-300 capitalize">
                {mode.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3 z-10">
            <button
              onClick={handleResetTimer}
              className="p-3 rounded-2xl bg-stone-100 dark:bg-purple-900/50 hover:bg-stone-200 text-stone-700 dark:text-purple-200 transition-all active:scale-95"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleTimer}
              className={`px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 hover:bg-amber-300'
                  : 'bg-amber-400 hover:bg-amber-300 dark:bg-purple-700 text-stone-900 dark:text-purple-100'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings, Subject Picker & Lo-Fi Generator */}
        <div className="md:col-span-5 space-y-4">
          {/* Focus Subject Picker */}
          <div className="bg-white dark:bg-purple-950/40 rounded-3xl p-5 border border-amber-200/80 dark:border-purple-800/60 shadow-card space-y-3">
            <span className="font-hand text-lg font-bold text-stone-800 dark:text-purple-100 block">
              📚 Current Study Quest
            </span>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-purple-300 mb-1">
                Tag Focus Session With Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100 font-semibold"
              >
                {state.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.icon || '📖'} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-purple-300 mb-1">
                Custom Duration (minutes):
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => handleCustomTimeChange(parseInt(e.target.value) || 25)}
                disabled={isRunning}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-purple-700 bg-stone-50 dark:bg-purple-900/30 text-stone-800 dark:text-purple-100 font-bold"
              />
            </div>
          </div>

          {/* Cozy Lo-Fi Music & Rain Sound Generator */}
          <div className="bg-amber-50/80 dark:bg-purple-950/50 rounded-3xl p-5 border border-amber-200 dark:border-purple-800 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-hand text-lg font-bold text-amber-900 dark:text-purple-100 flex items-center gap-1.5">
                ☕ Cozy Lo-Fi Beats
              </span>
              <button
                onClick={handleToggleLofi}
                className={`p-2 rounded-xl border transition-all ${
                  isLofiPlaying
                    ? 'bg-amber-400 text-stone-900 border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-purple-900 text-stone-600 dark:text-purple-200 border-stone-300'
                }`}
                title={isLofiPlaying ? 'Mute Lo-Fi' : 'Play Lo-Fi chords + rain'}
              >
                {isLofiPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-purple-300/80">
              Procedurally generated warm Rhodes electric piano 7th chords with soft vinyl crackle and soothing rain ambience.
            </p>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-stone-500 dark:text-purple-300">
                <span>Music Volume</span>
                <span>{Math.round(lofiVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={lofiVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Total Focus Logged Today */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-purple-950/30 border border-stone-200 dark:border-purple-800/50 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-stone-600 dark:text-purple-300 font-semibold">
                Logged Sessions Today:
              </span>
            </div>
            <span className="font-bold text-stone-800 dark:text-purple-100">
              {state.focusSessions.filter((s) => s.date === getTodayStr()).length} session(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
