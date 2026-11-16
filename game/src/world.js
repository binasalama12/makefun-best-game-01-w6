// world.js — simulation for Prism Breakout: paddle, balls, bricks, lasers,
// falling power-up capsules, particles and floating score text. Pure state
// and stepping; all drawing lives in render.js / hud.js.

import { Rng } from './rng.js';
import {
  W, WALL, BRICK, PADDLE, BALL, START_LIVES, ROW_COLORS, LEVELS, POWER_KINDS,
} from './config.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class World {
  constructor(seed, sfx) {
    this.rng = new Rng(seed * 7919 + 13);
    this.sfx = sfx;
    this.score = 0;
    this.lives = START_LIVES;
    this.level = 1;
    this.combo = 0;
    this.bestCombo = 0;
    this.broken = 0;
    this.shake = 0;
    this.flash = 0;
    this.time = 0;
    this.resetLevel();
  }

  resetLevel() {
    const layout = LEVELS[(this.level - 1) % LEVELS.length];
    this.bricks = [];
    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const g = layout[r][c];
        if (g === '.' || g === ' ') continue;
        const brick = {
          x: BRICK.x0 + c * (BRICK.w + BRICK.gap),
          y: BRICK.y0 + r * (BRICK.h + BRICK.gap),
          w: BRICK.w, h: BRICK.h, alive: true, hitFlash: 0,
        };
        if (g >= '1' && g <= '8') { brick.kind = 'norm'; brick.hp = 1; brick.color = ROW_COLORS[Number(g) - 1]; }
        else if (g === '#') { brick.kind = 'steel'; brick.hp = 2; brick.color = '#c7d2e8'; }
        else if (g === 'X') { brick.kind = 'boom'; brick.hp = 1; brick.color = '#ff9d3d'; }
        else if (g === 'P') { brick.kind = 'prism'; brick.hp = 1; brick.color = '#e05cff'; }
        else if (g === 'B') { brick.kind = 'boss'; brick.hp = 6; brick.color = '#ff3d7f'; }
        else continue;
        this.bricks.push(brick);
      }
    }
    this.paddle = { x: W / 2, w: PADDLE.w, wideT: 0, laserT: 0, laserCd: 0 };
    this.balls = [this.newBall(true)];
    this.powers = [];
    this.lasers = [];
    this.particles = [];
    this.texts = [];
    this.slowT = 0;
    this.stuck = true;
  }

  newBall(stuck = false, x = 0, y = 0, angle = -Math.PI / 3) {
    const speed = Math.min(BALL.baseSpeed + (this.level - 1) * 46, BALL.maxSpeed);
    return {
      x, y, r: BALL.r, speed,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      stuck, trail: [],
    };
  }

  launch() {
    for (const b of this.balls) {
      if (!b.stuck) continue;
      b.stuck = false;
      const a = -Math.PI / 2 + this.rng.range(-0.42, 0.42);
      b.vx = Math.cos(a) * b.speed;
      b.vy = Math.sin(a) * b.speed;
    }
    this.stuck = false;
  }

  burst(x, y, color, n, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = this.rng.range(0, Math.PI * 2);
      const s = this.rng.range(40, 320) * power;
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60,
        life: this.rng.range(0.3, 0.8), maxLife: 0.8, size: this.rng.range(2, 6), color,
      });
    }
  }

  addText(x, y, str, color) {
    this.texts.push({ x, y, str, color, life: 0.9 });
  }

  maybeDrop(x, y) {
    if (!this.rng.chance(0.16)) return;
    const kind = this.rng.pick(Object.keys(POWER_KINDS));
    this.powers.push({ x, y, vy: 168, kind, spin: this.rng.range(0, 6.28) });
  }

  breakBrick(brick, cause) {
    brick.alive = false;
    this.broken++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const mult = 1 + Math.floor(this.combo / 6);
    const pts = (brick.kind === 'boss' ? 150 : 50) * mult;
    this.score += pts;
    this.addText(brick.x + brick.w / 2, brick.y + 14, `+${pts}`, brick.color);
    this.burst(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, brick.kind === 'boom' ? 26 : 12);
    if (brick.kind === 'boom') {
      this.shake = Math.max(this.shake, 9);
      this.flash = 0.55;
      this.sfx?.boom();
      // Chain explosion: neighbours take one hit, explosives chain further.
      for (const other of this.bricks) {
        if (!other.alive || other === brick) continue;
        const dx = Math.abs((other.x + other.w / 2) - (brick.x + brick.w / 2));
        const dy = Math.abs((other.y + other.h / 2) - (brick.y + brick.h / 2));
        if (dx < BRICK.w * 1.7 && dy < BRICK.h * 2.4) this.hitBrick(other, 'chain');
      }
    } else if (brick.kind === 'prism') {
      this.sfx?.split();
      const src = this.balls.find((b) => !b.stuck) ?? this.balls[0];
      if (src && this.balls.length < 6) {
        for (const da of [-0.6, 0.6]) {
          const sp = Math.hypot(src.vx, src.vy) || src.speed;
          const a = Math.atan2(src.vy, src.vx) + da;
          const nb = this.newBall(false, brick.x + brick.w / 2, brick.y + brick.h / 2, a);
          nb.vx = Math.cos(a) * sp; nb.vy = Math.sin(a) * sp; nb.speed = sp;
          this.balls.push(nb);
        }
        this.addText(brick.x + brick.w / 2, brick.y - 6, 'SPLIT!', '#e05cff');
      }
    } else {
      this.sfx?.brick(this.combo);
    }
    this.maybeDrop(brick.x + brick.w / 2, brick.y + brick.h / 2);
    if (cause !== 'chain') this.shake = Math.max(this.shake, brick.kind === 'boss' ? 7 : 2.5);
  }

  hitBrick(brick, cause = 'ball') {
    if (!brick.alive) return;
    brick.hp--;
    brick.hitFlash = 1;
    if (brick.hp > 0) {
      this.sfx?.steel();
      this.burst(brick.x + brick.w / 2, brick.y + brick.h / 2, '#c7d2e8', 5, 0.6);
      return;
    }
    this.breakBrick(brick, cause);
  }

  applyPower(kind) {
    const p = this.paddle;
    if (kind === 'W') { p.w = PADDLE.wideW; p.wideT = 14; }
    if (kind === 'L') { p.laserT = 12; }
    if (kind === 'S') { this.slowT = 7; }
    if (kind === '+') { this.lives = Math.min(this.lives + 1, 6); }
    if (kind === 'M') {
      const src = this.balls.find((b) => !b.stuck);
      if (src && this.balls.length < 6) {
        for (const da of [-0.85, 0.85]) {
          const sp = Math.hypot(src.vx, src.vy) || src.speed;
          const a = Math.atan2(src.vy, src.vx) + da;
          const nb = this.newBall(false, src.x, src.y, a);
          nb.vx = Math.cos(a) * sp; nb.vy = Math.sin(a) * sp; nb.speed = sp;
          this.balls.push(nb);
        }
      }
    }
    this.sfx?.power();
    this.addText(p.x, PADDLE.y - 26, POWER_KINDS[kind].label, POWER_KINDS[kind].color);
    this.score += 25;
  }

  step(dt, input) {
    this.time += dt;
    const p = this.paddle;
    // Paddle steering: mouse wins, keys add.
    if (input.mouseX !== null && input.mouseX !== undefined) p.x = input.mouseX;
    if (input.left) p.x -= PADDLE.speed * dt;
    if (input.right) p.x += PADDLE.speed * dt;
    p.x = clamp(p.x, WALL.left + p.w / 2, WALL.right - p.w / 2);
    if (p.wideT > 0) { p.wideT -= dt; if (p.wideT <= 0) p.w = PADDLE.w; }
    if (p.laserT > 0) p.laserT -= dt;
    if (this.slowT > 0) this.slowT -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 26);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.8);

    // Lasers fire while the laser timer runs.
    if (p.laserT > 0) {
      p.laserCd -= dt;
      if (p.laserCd <= 0 && !this.stuck) {
        p.laserCd = 0.19;
        this.lasers.push({ x: p.x - p.w / 2 + 10, y: PADDLE.y - 10, vy: -760 });
        this.lasers.push({ x: p.x + p.w / 2 - 10, y: PADDLE.y - 10, vy: -760 });
        this.sfx?.laser();
      }
    }
    for (const l of this.lasers) {
      l.y += l.vy * dt;
      for (const b of this.bricks) {
        if (!b.alive) continue;
        if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
          this.hitBrick(b, 'laser');
          l.y = -999;
          break;
        }
      }
    }
    this.lasers = this.lasers.filter((l) => l.y > WALL.top - 30);

    const speedScale = this.slowT > 0 ? 0.62 : 1;
    for (const ball of this.balls) {
      if (ball.stuck) {
        ball.x = p.x;
        ball.y = PADDLE.y - BALL.r - 3;
        ball.trail.length = 0;
        continue;
      }
      const sub = 3;
      for (let s = 0; s < sub; s++) this.stepBall(ball, (dt / sub) * speedScale);
      ball.trail.unshift({ x: ball.x, y: ball.y });
      if (ball.trail.length > 13) ball.trail.pop();
    }
    this.balls = this.balls.filter((b) => b.y - b.r < WALL.bottom + 30);
    if (this.balls.length === 0) {
      this.lives--;
      this.combo = 0;
      this.sfx?.lose();
      if (this.lives <= 0) return 'gameover';
      this.balls = [this.newBall(true)];
      this.stuck = true;
      this.powers = [];
      this.lasers = [];
    }

    for (const pw of this.powers) {
      pw.y += pw.vy * dt;
      pw.spin += dt * 4;
      if (pw.y > PADDLE.y - 14 && pw.y < PADDLE.y + 26 && Math.abs(pw.x - p.x) < p.w / 2 + 14) {
        pw.y = 9999;
        this.applyPower(pw.kind);
      }
    }
    this.powers = this.powers.filter((pw) => pw.y < WALL.bottom + 20);

    for (const pt of this.particles) {
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 340 * dt; pt.life -= dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
    for (const t of this.texts) { t.y -= 44 * dt; t.life -= dt; }
    this.texts = this.texts.filter((t) => t.life > 0);
    for (const b of this.bricks) if (b.hitFlash > 0) b.hitFlash = Math.max(0, b.hitFlash - dt * 6);

    if (this.bricks.every((b) => !b.alive)) {
      this.level++;
      this.score += 250;
      this.sfx?.level();
      this.resetLevel();
      return 'levelup';
    }
    return 'play';
  }

  stepBall(ball, dt) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x - ball.r < WALL.left) { ball.x = WALL.left + ball.r; ball.vx = Math.abs(ball.vx); this.sfx?.wall(); }
    if (ball.x + ball.r > WALL.right) { ball.x = WALL.right - ball.r; ball.vx = -Math.abs(ball.vx); this.sfx?.wall(); }
    if (ball.y - ball.r < WALL.top) { ball.y = WALL.top + ball.r; ball.vy = Math.abs(ball.vy); this.sfx?.wall(); }

    const p = this.paddle;
    if (ball.vy > 0 && ball.y + ball.r >= PADDLE.y && ball.y + ball.r <= PADDLE.y + PADDLE.h + 12
        && Math.abs(ball.x - p.x) <= p.w / 2 + ball.r) {
      const rel = clamp((ball.x - p.x) / (p.w / 2), -1, 1);
      const a = -Math.PI / 2 + rel * 1.05;
      const sp = Math.min(Math.hypot(ball.vx, ball.vy) * 1.012, BALL.maxSpeed);
      ball.vx = Math.cos(a) * sp;
      ball.vy = Math.sin(a) * sp;
      ball.y = PADDLE.y - ball.r - 1;
      this.combo = 0;
      this.sfx?.paddle();
      this.burst(ball.x, PADDLE.y, '#3dc9ff', 4, 0.5);
    }

    for (const b of this.bricks) {
      if (!b.alive) continue;
      const nx = clamp(ball.x, b.x, b.x + b.w);
      const ny = clamp(ball.y, b.y, b.y + b.h);
      const dx = ball.x - nx;
      const dy = ball.y - ny;
      if (dx * dx + dy * dy > ball.r * ball.r) continue;
      if (Math.abs(dx) > Math.abs(dy)) ball.vx = dx > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
      else ball.vy = dy > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
      // Anti-stall: a near-horizontal ball can orbit the wall forever, so
      // enforce a minimum vertical component after any brick bounce.
      const sp = Math.hypot(ball.vx, ball.vy);
      if (sp > 0 && Math.abs(ball.vy) < sp * 0.22) {
        ball.vy = (ball.vy < 0 ? -1 : 1) * sp * 0.22;
        ball.vx = Math.sign(ball.vx || 1) * Math.sqrt(sp * sp - ball.vy * ball.vy);
      }
      this.hitBrick(b, 'ball');
      break;
    }
  }
}
