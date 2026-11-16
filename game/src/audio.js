// audio.js — tiny WebAudio synth for Prism Breakout. Created lazily on the
// first user gesture so the page never autoplays sound; every effect is a
// short oscillator blip, no audio assets and no network requests.

export class Sfx {
  constructor() {
    this.ctx = null;
    this.master = null;
  }
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.16;
    this.master.connect(this.ctx.destination);
  }
  blip(freq, dur = 0.07, type = 'square', slide = 0, vol = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gain.gain.setValueAtTime(0.9 * vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  paddle() { this.blip(220, 0.05, 'square'); }
  wall() { this.blip(170, 0.04, 'square'); }
  brick(combo) { this.blip(330 + Math.min(combo, 12) * 36, 0.06, 'square', 120); }
  steel() { this.blip(140, 0.05, 'sawtooth'); }
  boom() { this.blip(90, 0.28, 'sawtooth', -60, 1.4); this.blip(55, 0.34, 'triangle', -20, 1.2); }
  power() { this.blip(520, 0.09, 'sine', 380); this.blip(780, 0.12, 'sine', 240, 0.7); }
  laser() { this.blip(920, 0.06, 'sawtooth', -500, 0.5); }
  split() { this.blip(440, 0.08, 'sine', 440); }
  lose() { this.blip(300, 0.3, 'sawtooth', -220); }
  level() { [392, 523, 659, 784].forEach((f, i) => setTimeout(() => this.blip(f, 0.1, 'square'), i * 70)); }
  over() { [330, 262, 196, 131].forEach((f, i) => setTimeout(() => this.blip(f, 0.16, 'triangle'), i * 130)); }
}
