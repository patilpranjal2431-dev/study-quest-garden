// Web Audio API procedural sound synthesizer for Study Quest Garden
// No external assets required - runs 100% reliably in any modern browser!

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sparkly chime for completing a task or earning stars
export function playChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// Gentle pop / bloom sound when a flower grows
export function playBloom(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {
    console.warn('Audio bloom error:', err);
  }
}

// Gentle bell chime for Pomodoro completion
export function playTimerBell(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [440, 880, 1320]; // Warm harmonic bell

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const vol = 0.15 / (i + 1);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  } catch (err) {
    console.warn('Audio bell error:', err);
  }
}

// Cozy Lo-Fi Music & Ambient Rain Synthesizer
class LofiAmbientPlayer {
  private isPlaying = false;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private chordIndex = 0;

  // Aesthetic Lo-Fi chords: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
  private chords = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
    [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
    [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
  ];

  start(volume = 0.4) {
    if (this.isPlaying) return;
    try {
      const ctx = getAudioContext();
      this.isPlaying = true;

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      // Start vinyl crackle + rain ambience
      this.startRainAndCrackle(ctx);

      // Play looping warm electric piano chords
      this.playChordStep(ctx);
      this.intervalId = setInterval(() => {
        if (!this.isPlaying) return;
        this.playChordStep(ctx);
      }, 3500);
    } catch (e) {
      console.warn('Lofi player error:', e);
    }
  }

  setVolume(volume: number) {
    if (this.masterGain && audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
    }
  }

  private playChordStep(ctx: AudioContext) {
    if (!this.masterGain) return;
    const chord = this.chords[this.chordIndex % this.chords.length];
    this.chordIndex++;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.connect(this.masterGain);

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      // Warm attack and long decay
      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.04 + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.04 + 3.2);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 3.3);
    });
  }

  private startRainAndCrackle(ctx: AudioContext) {
    if (!this.masterGain) return;
    // Generate pink noise for soft rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.05;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1000;
    rainFilter.Q.value = 0.8;

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.04, ctx.currentTime);

    whiteNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.rainNode) {
      try {
        (this.rainNode as any).stop();
      } catch (_) {}
      this.rainNode = null;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const lofiPlayer = new LofiAmbientPlayer();
