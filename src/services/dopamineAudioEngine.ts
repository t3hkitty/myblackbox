/**
 * 🎵 Web Audio API Dopamine Sound Synthesizer
 * Zero external audio binary assets. 100% legal, offline, and instant.
 * Procedural major-third chords and focus sounds for AuDHD reward loops.
 */

class DopamineAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const storedMute = localStorage.getItem('mbb_sound_muted');
      this.isMuted = storedMute === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mbb_sound_muted', String(muted));
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. High-Dopamine Victory Chime: Dual-sine-wave Major-Third Chord (C5 + G5 or F5 + A5)
   * Plays on checking off tasks, milestone achievements, or beating the clock.
   */
  public playVictoryChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: Warm C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Note 2: Bright G5 (783.99 Hz) slightly delayed (+0.07s)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.07);
      gain2.gain.setValueAtTime(0.14, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Dopamine victory chime failed:', e);
    }
  }

  /**
   * 2. Grand Sweep All / Double Checkmark Chord: F5 + A5 + C6
   */
  public playSweepAllChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 698.46, delay: 0, dur: 0.4 },     // F5
        { freq: 880.00, delay: 0.06, dur: 0.5 },  // A5
        { freq: 1046.50, delay: 0.12, dur: 0.65 } // C6
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.delay);
        gain.gain.setValueAtTime(0.12, now + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.delay);
        osc.stop(now + n.delay + n.dur);
      });
    } catch (e) {
      console.warn('Sweep chime failed:', e);
    }
  }

  /**
   * 3. Gentle Micro-Tick Chime: Crisp soft bubble blip for +1 Roman numeral increments
   */
  public playTickBlip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Tick blip failed:', e);
    }
  }

  /**
   * 4. Guilt-Free Half / Skip Gentle Thud (Low soft wooden tap)
   */
  public playGentleRelief() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.15); // C4
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Gentle relief sound failed:', e);
    }
  }
}

export const dopamineAudio = new DopamineAudioEngine();
