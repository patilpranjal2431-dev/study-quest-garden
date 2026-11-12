import React, { useState } from 'react';
import { MascotType } from '../types';

interface MascotProps {
  type: MascotType;
  name: string;
  stars: number;
  isSleepy?: boolean;
  isBouncing?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  onPet?: () => void;
}

export const Mascot: React.FC<MascotProps> = ({
  type,
  name,
  stars,
  isSleepy = false,
  isBouncing = false,
  message,
  size = 'md',
  onPet,
}) => {
  const [petHearts, setPetHearts] = useState<{ id: number; x: number }[]>([]);

  // Stage calculation
  const getStage = (starsCount: number): { stage: number; title: string; perk: string } => {
    if (starsCount >= 250) return { stage: 4, title: 'Garden Guardian', perk: 'Magical Blossom Crown & Golden Aura' };
    if (starsCount >= 120) return { stage: 3, title: 'Master Scholar', perk: 'Scholar Cap & Cosmic Starlight' };
    if (starsCount >= 50) return { stage: 2, title: 'Cozy Student', perk: 'Study Glasses & Little Satchel' };
    return { stage: 1, title: 'Baby Sproutling', perk: 'Little Green Sprout' };
  };

  const currentStage = getStage(stars);

  const handlePetMascot = () => {
    const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
    setPetHearts((prev) => [...prev.slice(-4), newHeart]);
    setTimeout(() => {
      setPetHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
    if (onPet) onPet();
  };

  const dimensions = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
  }[size];

  return (
    <div className="flex flex-col items-center select-none relative">
      {/* Dynamic Floating Speech Bubble */}
      {message && (
        <div className="relative mb-3 max-w-xs animate-float-gentle z-10">
          <div className="bg-amber-50/95 dark:bg-purple-950/90 text-amber-950 dark:text-purple-100 px-4 py-2 rounded-2xl shadow-md border-2 border-amber-200 dark:border-purple-700/60 text-xs sm:text-sm font-medium text-center backdrop-blur-xs">
            <span className="font-hand text-base font-bold text-amber-800 dark:text-purple-300 block mb-0.5">
              {name} says:
            </span>
            {message}
          </div>
          <div className="w-3 h-3 bg-amber-50 dark:bg-purple-950 border-r-2 border-b-2 border-amber-200 dark:border-purple-700/60 transform rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Interactive Mascot Container */}
      <div
        onClick={handlePetMascot}
        className={`relative ${dimensions} cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group ${
          isBouncing ? 'animate-bounce-mascot' : 'animate-float-gentle'
        }`}
        title={`Click to pet ${name}!`}
      >
        {/* Floating Hearts from petting */}
        {petHearts.map((h) => (
          <span
            key={h.id}
            style={{ transform: `translateX(${h.x}px)` }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-pink-500 font-bold text-lg animate-ping pointer-events-none"
          >
            💕
          </span>
        ))}

        {/* Stage 4: Golden Halo / Blossom Aura */}
        {currentStage.stage === 4 && (
          <div className="absolute inset-0 rounded-full bg-amber-300/25 dark:bg-amber-400/20 blur-md animate-pulse pointer-events-none" />
        )}

        {/* Pet SVG Rendering */}
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Gradients */}
            <linearGradient id="bunnyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9F5" />
              <stop offset="100%" stopColor="#F7E6DC" />
            </linearGradient>
            <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="100%" stopColor="#F5D599" />
            </linearGradient>
            <linearGradient id="shibaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4A261" />
              <stop offset="100%" stopColor="#E76F51" />
            </linearGradient>
            <linearGradient id="cheekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9AA2" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFB7B2" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE066" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFE066" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Shadow underneath */}
          <ellipse cx="80" cy="144" rx="42" ry="9" fill="rgba(60, 40, 30, 0.12)" />

          {/* --- BUNNY --- */}
          {type === 'bunny' && (
            <g>
              {/* Ears */}
              <ellipse cx="58" cy="42" rx="14" ry="34" fill="url(#bunnyGrad)" transform="rotate(-12 58 42)" stroke="#533D35" strokeWidth="2.5" />
              <ellipse cx="58" cy="44" rx="7" ry="22" fill="#FFC4D6" transform="rotate(-12 58 44)" />

              <ellipse cx="102" cy="42" rx="14" ry="34" fill="url(#bunnyGrad)" transform="rotate(12 102 42)" stroke="#533D35" strokeWidth="2.5" />
              <ellipse cx="102" cy="44" rx="7" ry="22" fill="#FFC4D6" transform="rotate(12 102 44)" />

              {/* Body */}
              <ellipse cx="80" cy="100" rx="46" ry="42" fill="url(#bunnyGrad)" stroke="#533D35" strokeWidth="2.5" />
              {/* Soft Belly */}
              <ellipse cx="80" cy="112" rx="26" ry="22" fill="#FFFFFF" opacity="0.85" />

              {/* Paws */}
              <ellipse cx="60" cy="132" rx="12" ry="8" fill="#FFF9F5" stroke="#533D35" strokeWidth="2.5" />
              <ellipse cx="100" cy="132" rx="12" ry="8" fill="#FFF9F5" stroke="#533D35" strokeWidth="2.5" />
            </g>
          )}

          {/* --- CAT --- */}
          {type === 'cat' && (
            <g>
              {/* Ears */}
              <polygon points="46,70 32,32 72,50" fill="url(#catGrad)" stroke="#533D35" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="48,64 38,38 66,51" fill="#FFC4D6" strokeLinejoin="round" />

              <polygon points="114,70 128,32 88,50" fill="url(#catGrad)" stroke="#533D35" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="112,64 122,38 94,51" fill="#FFC4D6" strokeLinejoin="round" />

              {/* Tail swishing */}
              <path d="M 124 116 Q 148 110 142 85 Q 138 98 120 120" fill="url(#catGrad)" stroke="#533D35" strokeWidth="2.5" />

              {/* Body */}
              <ellipse cx="80" cy="98" rx="46" ry="42" fill="url(#catGrad)" stroke="#533D35" strokeWidth="2.5" />
              <ellipse cx="80" cy="110" rx="26" ry="22" fill="#FFF7E6" opacity="0.9" />

              {/* Paws */}
              <ellipse cx="60" cy="132" rx="11" ry="8" fill="#FFF2D6" stroke="#533D35" strokeWidth="2.5" />
              <ellipse cx="100" cy="132" rx="11" ry="8" fill="#FFF2D6" stroke="#533D35" strokeWidth="2.5" />
            </g>
          )}

          {/* --- SHIBA --- */}
          {type === 'shiba' && (
            <g>
              {/* Ears */}
              <polygon points="50,68 36,34 72,48" fill="url(#shibaGrad)" stroke="#533D35" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="50,62 42,40 66,50" fill="#FFE3CC" strokeLinejoin="round" />

              <polygon points="110,68 124,34 88,48" fill="url(#shibaGrad)" stroke="#533D35" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="110,62 118,40 94,50" fill="#FFE3CC" strokeLinejoin="round" />

              {/* Body */}
              <ellipse cx="80" cy="98" rx="46" ry="42" fill="url(#shibaGrad)" stroke="#533D35" strokeWidth="2.5" />
              {/* Shiba white muzzle/chest mask */}
              <ellipse cx="80" cy="110" rx="30" ry="24" fill="#FFFDF8" />
              <ellipse cx="66" cy="88" rx="12" ry="12" fill="#FFFDF8" />
              <ellipse cx="94" cy="88" rx="12" ry="12" fill="#FFFDF8" />

              {/* Paws */}
              <ellipse cx="60" cy="132" rx="11" ry="8" fill="#FFFDF8" stroke="#533D35" strokeWidth="2.5" />
              <ellipse cx="100" cy="132" rx="11" ry="8" fill="#FFFDF8" stroke="#533D35" strokeWidth="2.5" />
            </g>
          )}

          {/* Facial Features */}
          {isSleepy ? (
            /* Sleepy / Peaceful face */
            <g>
              {/* Happy curved sleeping eyes */}
              <path d="M 58 92 Q 66 98 74 92" fill="none" stroke="#533D35" strokeWidth="3" strokeLinecap="round" />
              <path d="M 86 92 Q 94 98 102 92" fill="none" stroke="#533D35" strokeWidth="3" strokeLinecap="round" />

              {/* Tiny nose & smile */}
              <ellipse cx="80" cy="97" rx="3" ry="2" fill="#533D35" />
              <path d="M 77 101 Q 80 104 83 101" fill="none" stroke="#533D35" strokeWidth="2" strokeLinecap="round" />

              {/* Cozy Nightcap */}
              <path d="M 52 64 C 40 40 100 24 116 56 C 104 54 62 58 52 64 Z" fill="#9086D1" stroke="#533D35" strokeWidth="2" />
              <circle cx="118" cy="56" r="8" fill="#FFF" stroke="#533D35" strokeWidth="2" />
              {/* Floating Zzz */}
              <text x="110" y="30" fill="#887BB0" fontSize="16" fontWeight="bold" fontFamily="Patrick Hand">
                z
              </text>
              <text x="122" y="20" fill="#887BB0" fontSize="12" fontWeight="bold" fontFamily="Patrick Hand">
                z
              </text>
            </g>
          ) : (
            /* Awake & Cheerful face */
            <g>
              {/* Big sparkling eyes */}
              <circle cx="64" cy="92" r="6" fill="#3D2922" />
              <circle cx="62" cy="90" r="2.2" fill="#FFFFFF" />
              <circle cx="65.5" cy="93.5" r="1.1" fill="#FFFFFF" />

              <circle cx="96" cy="92" r="6" fill="#3D2922" />
              <circle cx="94" cy="90" r="2.2" fill="#FFFFFF" />
              <circle cx="97.5" cy="93.5" r="1.1" fill="#FFFFFF" />

              {/* Rosy cheeks */}
              <ellipse cx="54" cy="98" rx="8" ry="5" fill="url(#cheekGrad)" />
              <ellipse cx="106" cy="98" rx="8" ry="5" fill="url(#cheekGrad)" />

              {/* Tiny nose & happy mouth */}
              <ellipse cx="80" cy="95" rx="3.5" ry="2.2" fill="#533D35" />
              <path d="M 75 98 Q 80 103 85 98" fill="none" stroke="#533D35" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* STAGE ACCESSORIES */}
          {/* Stage 1: Sprout Leaf on head */}
          {currentStage.stage === 1 && !isSleepy && (
            <g>
              <path d="M 80 62 Q 78 48 88 44 Q 92 52 82 58" fill="#78C850" stroke="#487830" strokeWidth="1.5" />
              <path d="M 80 62 Q 80 50 72 48 Q 70 56 78 59" fill="#90DE60" stroke="#487830" strokeWidth="1.5" />
            </g>
          )}

          {/* Stage 2: Round Study Glasses & cute satchel */}
          {currentStage.stage === 2 && !isSleepy && (
            <g>
              <circle cx="64" cy="92" r="10" fill="none" stroke="#8E5431" strokeWidth="2" />
              <circle cx="96" cy="92" r="10" fill="none" stroke="#8E5431" strokeWidth="2" />
              <line x1="74" y1="92" x2="86" y2="92" stroke="#8E5431" strokeWidth="2" />

              {/* Satchel strap across shoulder */}
              <path d="M 52 108 Q 80 120 108 126" fill="none" stroke="#A05A2C" strokeWidth="3" />
              <rect x="94" y="118" width="16" height="13" rx="3" fill="#D49A6A" stroke="#533D35" strokeWidth="1.5" />
            </g>
          )}

          {/* Stage 3: Scholar Cap & magical starlight */}
          {currentStage.stage === 3 && !isSleepy && (
            <g>
              {/* Mini graduation mortarboard */}
              <polygon points="80,44 106,52 80,60 54,52" fill="#3A385E" stroke="#222038" strokeWidth="1.5" />
              <rect x="73" y="56" width="14" height="6" fill="#2D2B4A" />
              <line x1="80" y1="52" x2="104" y2="62" stroke="#F6BD60" strokeWidth="2" />
              <circle cx="104" cy="62" r="2.5" fill="#F6BD60" />
            </g>
          )}

          {/* Stage 4: Flower Crown & Magical Halo */}
          {currentStage.stage === 4 && !isSleepy && (
            <g>
              {/* Floral wreath headband */}
              <path d="M 54 62 Q 80 54 106 62" fill="none" stroke="#7CB518" strokeWidth="3" />
              {/* Little blossoms on head */}
              <circle cx="62" cy="59" r="5" fill="#FFB7B2" stroke="#E27396" strokeWidth="1" />
              <circle cx="62" cy="59" r="2" fill="#FFE66D" />

              <circle cx="80" cy="54" r="6" fill="#FFDAC1" stroke="#F4A261" strokeWidth="1" />
              <circle cx="80" cy="54" r="2.5" fill="#E76F51" />

              <circle cx="98" cy="59" r="5" fill="#B5E2FA" stroke="#4A90E2" strokeWidth="1" />
              <circle cx="98" cy="59" r="2" fill="#FFE66D" />

              {/* Magic sparkles */}
              <text x="34" y="58" fill="#F6BD60" fontSize="14">✨</text>
              <text x="114" y="54" fill="#F6BD60" fontSize="14">✨</text>
            </g>
          )}
        </svg>
      </div>

      {/* Mascot Info Badge */}
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-hand text-lg font-bold text-amber-900 dark:text-purple-200">
            {name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-purple-900/60 text-amber-800 dark:text-purple-300 border border-amber-300/60 dark:border-purple-600/50">
            Lv.{currentStage.stage} {currentStage.title}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-purple-300/70 font-medium">
          {currentStage.perk}
        </p>
      </div>
    </div>
  );
};
