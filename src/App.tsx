import React, { useState, useEffect } from 'react';
import { AppState, Flower, StudyTask, MascotType, ThemeColor } from './types';
import {
  loadAppState,
  saveAppState,
  checkAndUpdateStreak,
  checkStickerUnlocks,
  getDefaultState,
} from './utils/storage';
import { NotebookLayout } from './components/NotebookLayout';
import { PlannerView } from './components/PlannerView';
import { QuizView } from './components/QuizView';
import { GardenView } from './components/GardenView';
import { PomodoroView } from './components/PomodoroView';
import { StickerBookView } from './components/StickerBookView';
import { WeeklyRecapView } from './components/WeeklyRecapView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('planner');
  const [isMascotBouncing, setIsMascotBouncing] = useState(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync Tailwind dark class with night mode setting
  useEffect(() => {
    if (state.settings.isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.isNightMode]);

  // Check sticker unlocks whenever relevant state updates
  useEffect(() => {
    const updatedStickers = checkStickerUnlocks(state);
    const hasNewUnlocks = updatedStickers.some(
      (s, i) => s.unlocked && !state.stickers[i]?.unlocked
    );

    if (hasNewUnlocks) {
      setState((prev) => ({
        ...prev,
        stickers: updatedStickers,
        stars: prev.stars + 10,
      }));
    }
  }, [state.tasks, state.garden, state.focusSessions, state.stars, state.streak, state.settings.isNightMode]);

  const triggerMascotBounce = () => {
    setIsMascotBouncing(true);
    setTimeout(() => setIsMascotBouncing(false), 900);
  };

  const handleTaskCompleted = (task: StudyTask) => {
    triggerMascotBounce();

    // Check streak update
    const { newStreak, newLastActive } = checkAndUpdateStreak(state);
    setState((prev) => ({
      ...prev,
      streak: newStreak,
      lastActiveDate: newLastActive,
      mascotCheer: `Great job on "${task.topic.slice(0, 24)}..."! Keep up this wonderful momentum! 🌟`,
    }));
  };

  const handleFlowerPlanted = (flower: Flower) => {
    triggerMascotBounce();
    setState((prev) => ({
      ...prev,
      garden: [flower, ...prev.garden],
      mascotCheer: `A fresh ${flower.type} sprouted in our garden! Your curiosity makes everything blossom! 🌸`,
    }));
  };

  const handleToggleNightMode = () => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        isNightMode: !prev.settings.isNightMode,
      },
    }));
  };

  const handleResetData = () => {
    const defaultData = getDefaultState();
    defaultData.settings.onboardingCompleted = true; // don't re-trigger onboarding on explicit reset
    setState(defaultData);
  };

  const handleOnboardingComplete = (settings: {
    name: string;
    petType: MascotType;
    petName: string;
    themeColor: ThemeColor;
  }) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        name: settings.name,
        petType: settings.petType,
        petName: settings.petName,
        themeColor: settings.themeColor,
        onboardingCompleted: true,
      },
      stars: prev.stars + 15,
      mascotCheer: `Hi ${settings.name}! I'm ${settings.petName}. Let's make studying gentle and fun together! 🌱`,
    }));
    triggerMascotBounce();
  };

  return (
    <>
      <NotebookLayout
        state={state}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleNightMode={handleToggleNightMode}
        isMascotBouncing={isMascotBouncing}
      >
        {activeTab === 'planner' && (
          <PlannerView
            state={state}
            onUpdateState={setState}
            onTaskCompleted={handleTaskCompleted}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            state={state}
            onUpdateState={setState}
            onFlowerPlanted={handleFlowerPlanted}
          />
        )}

        {activeTab === 'garden' && (
          <GardenView
            state={state}
            onUpdateState={setState}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroView
            state={state}
            onUpdateState={setState}
          />
        )}

        {activeTab === 'stickers' && (
          <StickerBookView state={state} />
        )}

        {activeTab === 'recap' && (
          <WeeklyRecapView state={state} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            state={state}
            onUpdateState={setState}
            onResetData={handleResetData}
          />
        )}
      </NotebookLayout>

      {/* First-launch Onboarding Modal */}
      <OnboardingModal
        isOpen={!state.settings.onboardingCompleted}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}
