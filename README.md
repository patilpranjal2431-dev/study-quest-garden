# 🌸 Study Quest Garden

> **An aesthetic, cute, bullet-journal style study planner and AI quiz game with a growing virtual garden, evolving pet companion, and cozy focus lounge.**

---

## 📖 Overview

**Study Quest Garden** is designed for students, teens, and lifelong learners who want a cozy, encouraging, and pressure-free study space. It blends the tactile warmth of a pastel bullet-journal with smart active-recall tools powered by Google Gemini AI:

- **Plan your week** with structured, bite-sized daily quest checklists.
- **Turn study notes into interactive quizzes and flashcards** using Gemini AI.
- **Grow a botanical garden**: correct answers sprout flowers, while missed questions are nurtured in a *Needs Water* spaced-repetition nursery.
- **Raise a cute pet mascot** (Bunny, Cat, or Shiba) that evolves through 4 stages as you earn study stars.
- **Focus with cozy tea & rain scenes** accompanied by procedural lo-fi beats generated natively via the Web Audio API.
- **Export all study metrics to CSV** for analysis in Python (pandas), SQL, Excel, or Power BI.

---

## ✨ Features

### 1. 📅 Study Quest Notebook (Planner)
- **AI-Powered "Plan My Week"**: Enter your subjects, exam dates, daily available hours, and optional focus notes. Gemini (`gemini-3.8-flash`) generates an actionable 7-day checklist with study tips and priorities.
- **Quest Checklist**: Mark tasks as complete with confetti bursts, star chimes, and +10 study stars.
- **Exam Countdown**: Visual cards counting down days to upcoming midterms, finals, and assignment deadlines.
- **Daily Streak Counter**: Tracks consecutive active study days.
- **Subject Manager**: Add custom subjects with personalized pastel tags and emoji icons.

### 2. 🌸 Quiz Garden & Spaced Repetition Nursery
- **Note-to-Quiz AI Generator**: Paste notes or upload `.txt` or `.md` files. Gemini extracts structured multiple-choice questions (with 4 options, explanations, and flower types) plus a set of flashcards.
- **Quiz Mode**: Answer questions one by one. Correct answers sprout blooming flowers into your virtual botanical plot.
- **"Needs Water" Spaced Repetition**: Missed questions are saved to a watering nursery. Review them at intervals of **1 day, 3 days, and 7 days** until they graduate into radiant **Golden Blooms**!
- **3D Flashcard Deck**: Smooth flip cards with prompt, answer, and optional hints. Mark cards as *"Got it!"* or *"Need Review (Again)"*.
- **Virtual Garden Plot**: Visual grid displaying soil mounds, flower species (Sakura, Sunflower, Lavender, Daisy, Rose, Lotus), growth stages (sprout → bud → blooming → golden), and click-to-inspect memory logs.

### 3. 🐾 Mascot Companion & 4 Growth Stages
Choose between **Boba the Bunny**, **Mochi the Cat**, or **Miso the Shiba** (rendered with pure vector SVG and CSS).
- **Stage 1 (0–49 ⭐)**: *Baby Sproutling* — Tiny sprout on head.
- **Stage 2 (50–119 ⭐)**: *Cozy Student* — Round study spectacles & satchel.
- **Stage 3 (120–249 ⭐)**: *Master Scholar* — Mini graduation cap & starlight.
- **Stage 4 (250+ ⭐)**: *Garden Guardian* — Glowing golden halo & floral crown.
- **Dynamic Reactions**: Bounces with joy on completed tasks, reacts to clicks with floating hearts, and rests in a cozy nightcap if you take a day off (always encouraging, never guilt-inducing).

### 4. 🍵 Cozy Pomodoro Focus Lounge
- **Presets & Custom Times**: 25m Focus, 5m Short Break, 15m Long Break, or custom minute inputs.
- **Scene Switcher**:
  - *Cozy Teacup*: Animated rising steam curls.
  - *Rain Window*: Gentle raindrops falling down the windowpane.
- **Procedural Lo-Fi Ambient Synthesizer**: Generates warm electric piano 7th chord progressions (Fmaj7 → Em7 → Dm7 → Cmaj7), soft vinyl crackle, and soothing rain ambience using the Web Audio API (no external MP3 dependencies).
- **Study Logging**: Completed sessions are automatically logged toward your weekly study time.

### 5. 📖 Pastel Sticker Book
- Collect 10 holographic foil die-cut stickers for milestones:
  - *First Step* (Complete 1 quest)
  - *Sproutling Streak* (3-day streak)
  - *Garden Guardian* (7-day streak)
  - *First Bloom* (Grow 1 flower)
  - *Quiz Whiz* (10 quiz blooms)
  - *Cozy Tea Master* (3 focus sessions)
  - *Starlight Scholar* (Study in Night Mode)
  - *Blossom Paradise* (8 garden flowers)
  - *Century Club* (Earn 100 stars)
  - *Plant Medic* (Review a Needs Water card)

### 6. 📊 Weekly Bloom Journal & Analytics
- Overview of total study minutes, completed quests, top productive day, and streak.
- Interactive weekly bar chart of minutes studied per day (Sun–Sat).
- AI reflection sentence and weekly study tip from your mascot.

### 7. 🌙 Dark "Night Study" Mode
- Toggle between the pastel bullet-journal day mode and a nocturnal dark purple/navy theme with animated glowing fireflies and twinkling stars.

### 8. 💾 Data Persistence & CSV Export
- **Local-First Architecture**: All tasks, exams, garden flowers, flashcards, focus sessions, and stickers persist in `localStorage` wrapped in error-handled utilities.
- **"Export My Data (CSV)"**: Downloads a multi-sheet structured CSV file containing quests, focus logs, garden history, and summary metrics for data science and analysis.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Motion, Canvas-Confetti, Lucide Icons.
- **Backend / Full-Stack**: Node.js, Express, Vite Middlewares (`server.ts`), TSX.
- **AI SDK**: `@google/genai` (utilizing `gemini-3.8-flash` with structured JSON schemas and resilient fallbacks).
- **Audio Engine**: Web Audio API (procedural harmonic synthesizers for chimes, pops, bells, lo-fi chords, and rain noise).
- **Typography**: Google Fonts (*Patrick Hand*, *Caveat*, *Nunito*).

---

## 📂 Project Directory Structure

```
├── server.ts                    # Full-stack Express server with Gemini AI endpoints
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── index.html                   # HTML entry point with Google Fonts & metadata
├── metadata.json                # Applet metadata & permissions
├── README.md                    # Project documentation
└── src/
    ├── types.ts                 # TypeScript interfaces and data models
    ├── App.tsx                  # Main application state, streak tracking, view routing
    ├── main.tsx                 # React DOM root entry
    ├── index.css                # Tailwind CSS v4, bullet journal dot/grid paper & animations
    ├── components/
    │   ├── Mascot.tsx           # Scalable SVG mascot with 4 growth stages & animations
    │   ├── NotebookLayout.tsx   # Spiral rings, washi tape tabs, header stats & night mode
    │   ├── PlannerView.tsx      # Daily quests checklist, exam deadlines, AI plan generator
    │   ├── QuizView.tsx         # Note-to-quiz creator, quiz game, flashcards & review nursery
    │   ├── GardenView.tsx       # Botanical plot grid, flower species SVGs & inspection modal
    │   ├── PomodoroView.tsx     # Teacup/window scenes, focus timer, procedural lo-fi player
    │   ├── StickerBookView.tsx  # Holographic collectible stickers & milestones
    │   ├── WeeklyRecapView.tsx  # Interactive 7-day bar chart & AI reflection summary
    │   ├── SettingsView.tsx     # Mascot selector, theme palettes, sound, CSV export & subjects
    │   └── OnboardingModal.tsx  # 3-step setup dialog on first launch
    └── utils/
        ├── storage.ts           # Safe localStorage reader/writer and streak logic
        ├── sound.ts             # Web Audio procedural sound effects & lo-fi chord engine
        └── exportCsv.ts         # Multi-table CSV data exporter for Python/Excel/Power BI
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Optional: GEMINI_API_KEY
# If provided, Gemini generates study plans, note quizzes, and recap summaries.
# If omitted or unavailable, the app uses built-in smart fallback generation so students are never blocked!
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

---

## 🎨 How to Customize

### 1. Changing Theme Colors
Palette colors are defined in `src/index.css` and `src/components/NotebookLayout.tsx`:
- Peach: `#FFD9C9`
- Lavender: `#E4D9FF`
- Mint / Matcha: `#D4F5E5`
- Honey Butter: `#FFF2B2`
- Soft Pink: `#FFD2DF`

### 2. Changing Fonts
Fonts are loaded in `index.html`:
- Headings: `'Patrick Hand'` and `'Caveat'`
- Body: `'Nunito'`

To swap them, update the Google Fonts link in `index.html` and update the `@theme` rules in `src/index.css`.

### 3. Modifying AI Prompts
All Gemini prompts are located in `server.ts`:
- **Weekly Study Plan**: Endpoint `/api/plan-week` (around line 98).
- **Quiz & Flashcards**: Endpoint `/api/generate-quiz` (around line 210).
- **Weekly Recap Sentence**: Endpoint `/api/weekly-recap` (around line 302).

---

## 📄 License
Apache-2.0
