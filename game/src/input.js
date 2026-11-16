// input.js — keyboard + mouse state for Prism Breakout.
// Mouse (or touch drag) steers the paddle directly; ArrowLeft/ArrowRight and
// A/D steer by key; Space launches and fires lasers; P pauses; R restarts
// from the game-over screen; Enter/click starts from the title screen.

export class Input {
  constructor(canvas) {
    this.left = false;
    this.right = false;
    this.mouseX = null;
    this.launchPressed = false;
    this.startPressed = false;
    this.pausePressed = false;
    this.restartPressed = false;
    this._launchQueued = false;
    this._startQueued = false;

    addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { this.left = true; e.preventDefault(); }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { this.right = true; e.preventDefault(); }
      if (e.code === 'Space') { this._launchQueued = true; this._startQueued = true; e.preventDefault(); }
      if (e.code === 'Enter') { this._startQueued = true; }
      if (e.code === 'KeyP') this.pausePressed = true;
      if (e.code === 'KeyR') this.restartPressed = true;
    });
    addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = false;
    });

    const toGameX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * canvas.width;
    };
    canvas.addEventListener('mousemove', (e) => { this.mouseX = toGameX(e.clientX); });
    canvas.addEventListener('mousedown', () => { this._launchQueued = true; this._startQueued = true; });
    canvas.addEventListener('touchstart', (e) => {
      this.mouseX = toGameX(e.touches[0].clientX);
      this._launchQueued = true;
      this._startQueued = true;
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      this.mouseX = toGameX(e.touches[0].clientX);
      e.preventDefault();
    }, { passive: false });
  }
  // Edge-triggered reads: each queued press is consumed exactly once.
  takeLaunch() { const v = this._launchQueued; this._launchQueued = false; return v; }
  takeStart() { const v = this._startQueued; this._startQueued = false; return v; }
  takePause() { const v = this.pausePressed; this.pausePressed = false; return v; }
  takeRestart() { const v = this.restartPressed; this.restartPressed = false; return v; }
}
