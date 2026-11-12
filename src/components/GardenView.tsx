import React, { useState } from 'react';
import { Droplets, Sparkles, Filter, X, Award, Info, Flower2 } from 'lucide-react';
import { AppState, Flower } from '../types';
import { playBloom } from '../utils/sound';

interface GardenViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const GardenView: React.FC<GardenViewProps> = ({ state, onUpdateState }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [inspectedFlower, setInspectedFlower] = useState<Flower | null>(null);
  const [isWatering, setIsWatering] = useState(false);

  const filteredFlowers = state.garden.filter((f) => {
    if (selectedSubject === 'all') return true;
    return f.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  const uniqueFlowerTypes = Array.from(new Set(state.garden.map((f) => f.type))).length;

  const handleWaterGarden = () => {
    setIsWatering(true);
    playBloom(state.settings.soundEnabled);

    // Evolve any 'bud' or 'sprout' flowers to blooming!
    setTimeout(() => {
      onUpdateState((prev) => ({
        ...prev,
        garden: prev.garden.map((f) => (f.stage === 'bud' || f.stage === 'sprout' ? { ...f, stage: 'blooming' } : f)),
        stars: prev.stars + 5,
      }));
      setIsWatering(false);
    }, 1000);
  };

  // Render SVG flower graphic based on type and stage
  const renderFlowerSvg = (flower: Flower) => {
    const isGolden = flower.stage === 'golden';

    if (flower.stage === 'sprout') {
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12 transition-transform group-hover:scale-110">
          <path d="M 30 55 L 30 35" stroke="#487830" strokeWidth="3" strokeLinecap="round" />
          <path d="M 30 38 Q 20 28 22 22 Q 28 22 30 34" fill="#90DE60" stroke="#487830" strokeWidth="1.5" />
          <path d="M 30 38 Q 40 28 38 22 Q 32 22 30 34" fill="#78C850" stroke="#487830" strokeWidth="1.5" />
        </svg>
      );
    }

    if (flower.stage === 'bud') {
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12 transition-transform group-hover:scale-110">
          <path d="M 30 55 L 30 30" stroke="#487830" strokeWidth="3" strokeLinecap="round" />
          <path d="M 30 42 Q 22 36 24 32" stroke="#487830" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="30" cy="24" rx="9" ry="13" fill="#FFC4D6" stroke="#487830" strokeWidth="1.5" />
          <path d="M 23 26 Q 30 18 37 26" fill="none" stroke="#E27396" strokeWidth="1.5" />
        </svg>
      );
    }

    // Blooming flowers by species
    switch (flower.type) {
      case 'Sakura':
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 transition-transform group-hover:scale-110">
            {isGolden && <circle cx="30" cy="30" r="24" fill="#FFE66D" opacity="0.3" className="animate-pulse" />}
            <path d="M 30 55 L 30 32" stroke="#487830" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(30, 24)">
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <path
                  key={i}
                  d="M 0 0 C -8 -12, -4 -20, 0 -22 C 4 -20, 8 -12, 0 0 Z"
                  fill={isGolden ? '#FFE066' : '#FFB7B2'}
                  stroke={isGolden ? '#D4A017' : '#E27396'}
                  strokeWidth="1.2"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="4.5" fill="#FFE66D" stroke="#D4A017" strokeWidth="1" />
            </g>
          </svg>
        );

      case 'Sunflower':
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 transition-transform group-hover:scale-110">
            {isGolden && <circle cx="30" cy="30" r="24" fill="#FFE66D" opacity="0.3" className="animate-pulse" />}
            <path d="M 30 55 L 30 30" stroke="#487830" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 30 42 Q 18 36 20 32" stroke="#487830" strokeWidth="2.5" strokeLinecap="round" />
            <g transform="translate(30, 22)">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-13"
                  rx="3.5"
                  ry="7"
                  fill={isGolden ? '#FFF275' : '#FFD166'}
                  stroke="#E09F3E"
                  strokeWidth="1"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="7.5" fill="#6B4226" stroke="#472C19" strokeWidth="1.5" />
            </g>
          </svg>
        );

      case 'Lavender':
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 transition-transform group-hover:scale-110">
            {isGolden && <circle cx="30" cy="30" r="24" fill="#FFE66D" opacity="0.3" className="animate-pulse" />}
            <path d="M 30 55 L 30 20" stroke="#487830" strokeWidth="2.5" strokeLinecap="round" />
            {[20, 26, 32, 38].map((y, i) => (
              <g key={i}>
                <ellipse cx="25" cy={y} rx="5" ry="3.5" fill={isGolden ? '#FFE066' : '#9D8DF1'} transform={`rotate(-25 25 ${y})`} />
                <ellipse cx="35" cy={y} rx="5" ry="3.5" fill={isGolden ? '#FFE066' : '#B8B8FF'} transform={`rotate(25 35 ${y})`} />
                <circle cx="30" cy={y - 2} r="3" fill={isGolden ? '#FFF2B2' : '#C8B6FF'} />
              </g>
            ))}
          </svg>
        );

      case 'Daisy':
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 transition-transform group-hover:scale-110">
            {isGolden && <circle cx="30" cy="30" r="24" fill="#FFE66D" opacity="0.3" className="animate-pulse" />}
            <path d="M 30 55 L 30 30" stroke="#487830" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(30, 22)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-12"
                  rx="3.5"
                  ry="7.5"
                  fill={isGolden ? '#FFF9D2' : '#FFFFFF'}
                  stroke="#D3D3D3"
                  strokeWidth="1"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="5.5" fill="#FFB703" stroke="#FB8500" strokeWidth="1" />
            </g>
          </svg>
        );

      case 'Rose':
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 transition-transform group-hover:scale-110">
            {isGolden && <circle cx="30" cy="30" r="24" fill="#FFE66D" opacity="0.3" className="animate-pulse" />}
            <path d="M 30 55 L 30 30" stroke="#487830" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(30, 22)">
              <circle cx="0" cy="0" r="11" fill={isGolden ? '#FFE066' : '#E63946'} />
              <path d="M -7 -4 Q 0 -10 7 -4 Q 0 4 -7 -4" fill={isGolden ? '#FFF275' : '#FF6B6B'} />
              <circle cx="0" cy="0" r="4" fill={isGolden ? '#FFF9D2' : '#F1FAEE'} />
            </g>
          </svg>
        );

      case 'Lotus':
      default:
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 transition-transform group-hover:scale-110">
            {isGolden && <circle cx="30" cy="30" r="24" fill="#FFE66D" opacity="0.3" className="animate-pulse" />}
            <path d="M 30 55 L 30 32" stroke="#487830" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(30, 24)">
              <path d="M -14 0 Q -10 -18 0 -22 Q 10 -18 14 0 Z" fill={isGolden ? '#FFE066' : '#FF99C8'} />
              <path d="M -8 2 Q -5 -14 0 -18 Q 5 -14 8 2 Z" fill={isGolden ? '#FFF275' : '#FCF6BD'} />
              <circle cx="0" cy="-2" r="3" fill="#FFD166" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tending Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-purple-800/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 washi-tape washi-tape-lavender px-3 py-1 rounded-sm text-xs font-bold text-purple-900 mb-1">
            <span>🌿 Virtual Study Garden</span>
          </div>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-stone-800 dark:text-purple-100">
            Botanical Study Plot
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-purple-300/80">
            Every plant here sprouted from a successfully mastered study quest or quiz question!
          </p>
        </div>

        <button
          onClick={handleWaterGarden}
          disabled={isWatering || state.garden.length === 0}
          className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-blue-100 hover:bg-blue-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-blue-900 dark:text-purple-100 border border-blue-300 dark:border-purple-700 shadow-soft transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Droplets className={`w-4 h-4 text-blue-600 ${isWatering ? 'animate-bounce' : ''}`} />
          <span>{isWatering ? 'Watering blooms...' : 'Tend & Water Garden (+5 stars)'}</span>
        </button>
      </div>

      {/* Garden Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs text-center">
          <span className="text-stone-500 dark:text-purple-300 text-xs font-medium block">
            Total Blooms
          </span>
          <span className="font-hand text-2xl font-bold text-amber-900 dark:text-purple-100">
            {state.garden.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs text-center">
          <span className="text-stone-500 dark:text-purple-300 text-xs font-medium block">
            Species Found
          </span>
          <span className="font-hand text-2xl font-bold text-pink-700 dark:text-pink-300">
            {uniqueFlowerTypes} / 6
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs text-center">
          <span className="text-stone-500 dark:text-purple-300 text-xs font-medium block">
            Golden Blooms
          </span>
          <span className="font-hand text-2xl font-bold text-amber-600 dark:text-amber-300">
            {state.garden.filter((f) => f.stage === 'golden').length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-purple-950/40 border border-amber-200/80 dark:border-purple-800/60 shadow-xs text-center">
          <span className="text-stone-500 dark:text-purple-300 text-xs font-medium block">
            Garden Level
          </span>
          <span className="font-hand text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            Lv. {Math.min(5, Math.floor(state.garden.length / 3) + 1)}
          </span>
        </div>
      </div>

      {/* Filter by Subject */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            selectedSubject === 'all'
              ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
              : 'bg-stone-100 dark:bg-purple-950/50 text-stone-600 dark:text-purple-300'
          }`}
        >
          All Flowers ({state.garden.length})
        </button>
        {state.subjects.map((s) => {
          const count = state.garden.filter((f) => f.subject.toLowerCase() === s.name.toLowerCase()).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.name)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedSubject.toLowerCase() === s.name.toLowerCase()
                  ? 'bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 shadow-xs'
                  : 'bg-stone-100 dark:bg-purple-950/50 text-stone-600 dark:text-purple-300'
              }`}
            >
              {s.icon || '🌸'} {s.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Garden Soil Plot / Greenhouse Grid */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#FAF4EC] to-[#F2E8DC] dark:from-[#221c38] dark:to-[#171329] border-4 border-[#E0D0C0] dark:border-[#382f5c] shadow-soft min-h-[380px]">
        {/* Wooden Fence / Planter Texture Accent */}
        <div className="absolute top-2 left-4 right-4 flex justify-between text-stone-300/60 dark:text-purple-900/60 text-xs font-mono pointer-events-none select-none">
          <span>🪵 PLOT-A</span>
          <span>GREENHOUSE BED</span>
          <span>SUNLIGHT: 100% ☀️</span>
        </div>

        {filteredFlowers.length === 0 ? (
          <div className="text-center py-20 px-4">
            <span className="text-4xl block mb-2">🌱</span>
            <h4 className="font-hand text-xl font-bold text-stone-700 dark:text-purple-200">
              Empty soil patch!
            </h4>
            <p className="text-xs text-stone-500 dark:text-purple-300/70 max-w-xs mx-auto mt-1">
              Take a quiz or complete study quests to cultivate flowers here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 pt-4">
            {filteredFlowers.map((flower) => (
              <div
                key={flower.id}
                onClick={() => setInspectedFlower(flower)}
                className="group relative cursor-pointer flex flex-col items-center justify-end p-2.5 rounded-2xl bg-white/60 dark:bg-purple-950/40 hover:bg-white dark:hover:bg-purple-900/60 border border-stone-200/60 dark:border-purple-800/60 transition-all hover:-translate-y-1 hover:shadow-card"
              >
                {/* Flower SVG */}
                <div className="relative flex items-center justify-center h-16 w-16">
                  {renderFlowerSvg(flower)}
                </div>

                {/* Ground Pot / Soil mound */}
                <div className="w-10 h-3 rounded-full bg-[#8D6E63]/30 dark:bg-purple-900/40 -mt-1" />

                {/* Subject tag */}
                <span className="mt-1.5 text-[10px] font-bold text-stone-600 dark:text-purple-300 truncate max-w-full text-center">
                  {flower.type}
                </span>
                <span className="text-[9px] text-stone-400 dark:text-purple-400 truncate max-w-full">
                  {flower.subject}
                </span>

                {flower.stage === 'golden' && (
                  <span className="absolute -top-1.5 -right-1 text-xs">✨</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flower Inspection Modal */}
      {inspectedFlower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-purple-950 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-200 dark:border-purple-700 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 dark:border-purple-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <h3 className="font-hand text-2xl font-bold text-stone-800 dark:text-purple-100">
                  {inspectedFlower.type} Bloom
                </h3>
              </div>
              <button
                onClick={() => setInspectedFlower(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <div className="w-20 h-20 flex items-center justify-center">
                {renderFlowerSvg(inspectedFlower)}
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-700 dark:text-purple-200">
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-purple-900">
                <span className="text-stone-400 font-semibold">Subject:</span>
                <span className="font-bold">{inspectedFlower.subject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-purple-900">
                <span className="text-stone-400 font-semibold">Growth Stage:</span>
                <span className="font-bold capitalize">{inspectedFlower.stage}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-purple-900">
                <span className="text-stone-400 font-semibold">Planted On:</span>
                <span className="font-bold">{inspectedFlower.plantedAt}</span>
              </div>
              {inspectedFlower.questionAnswered && (
                <div className="py-2">
                  <span className="text-stone-400 font-semibold block mb-0.5">
                    Sprouted from Question:
                  </span>
                  <p className="p-2.5 rounded-xl bg-amber-50 dark:bg-purple-900/30 border border-amber-200/50 dark:border-purple-800/40 text-[11px] leading-relaxed">
                    {inspectedFlower.questionAnswered}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectedFlower(null)}
              className="w-full py-2 rounded-xl text-xs font-bold bg-amber-200 dark:bg-purple-800 text-stone-900 dark:text-purple-100 hover:bg-amber-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
