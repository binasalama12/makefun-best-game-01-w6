// render.js — all canvas drawing for Prism Breakout: the neon arena, the
// rainbow brick wall, glowing paddle and balls with trails, laser bolts,
// power-up capsules, particles and explosion flashes. Saturated layered
// colour is the point: every still frame should read as dense arcade action.

import { W, H, WALL, PADDLE, BALL, COLORS, POWER_KINDS } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawBackground(ctx, world) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, COLORS.bg1);
  g.addColorStop(0.55, COLORS.bg0);
  g.addColorStop(1, '#0d0524');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Distant prism shards + starfield, fixed by world seed via positions
  // derived from a cheap hash so the backdrop is identical every frame.
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const sx = ((i * 173) % 1200) + 40;
    const sy = ((i * 271) % 620) + 30;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(world.time * 1.4 + i));
    ctx.globalAlpha = 0.25 + 0.5 * tw;
    ctx.fillStyle = i % 5 === 0 ? '#7a5cff' : '#cfe8ff';
    ctx.fillRect(sx, sy, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2);
  }
  ctx.restore();

  // Arena frame with a neon rim.
  ctx.save();
  ctx.strokeStyle = COLORS.wall;
  ctx.shadowColor = COLORS.wall;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(WALL.left - 8, H);
  ctx.lineTo(WALL.left - 8, WALL.top - 10);
  ctx.lineTo(WALL.right + 8, WALL.top - 10);
  ctx.lineTo(WALL.right + 8, H);
  ctx.stroke();
  ctx.restore();

  // Floor glow strip under the paddle line.
  const fg = ctx.createLinearGradient(0, PADDLE.y + 26, 0, H);
  fg.addColorStop(0, 'rgba(61,201,255,0.20)');
  fg.addColorStop(1, 'rgba(61,201,255,0)');
  ctx.fillStyle = fg;
  ctx.fillRect(WALL.left - 8, PADDLE.y + 26, WALL.right - WALL.left + 16, H - PADDLE.y);
}

export function drawBricks(ctx, world) {
  for (const b of world.bricks) {
    if (!b.alive) continue;
    ctx.save();
    const flash = b.hitFlash > 0.4;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 13;
    const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    g.addColorStop(0, flash ? '#ffffff' : b.color);
    g.addColorStop(0.5, b.color);
    g.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = g;
    rr(ctx, b.x, b.y, b.w, b.h, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Top bevel highlight.
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    rr(ctx, b.x + 3, b.y + 3, b.w - 6, 7, 3);
    ctx.fill();
    if (b.kind === 'steel') {
      ctx.strokeStyle = 'rgba(20,28,48,0.65)';
      ctx.lineWidth = 2;
      rr(ctx, b.x + 5, b.y + 5, b.w - 10, b.h - 10, 4);
      ctx.stroke();
      ctx.fillStyle = '#39496b';
      for (const dx of [12, b.w - 12]) for (const dy of [8, b.h - 8]) {
        ctx.beginPath(); ctx.arc(b.x + dx, b.y + dy, 2.4, 0, 6.29); ctx.fill();
      }
      if (b.hp === 1) { // cracked overlay after first hit
        ctx.strokeStyle = 'rgba(10,14,28,0.8)';
        ctx.beginPath();
        ctx.moveTo(b.x + 14, b.y + 4); ctx.lineTo(b.x + 34, b.y + 15); ctx.lineTo(b.x + 26, b.y + 26);
        ctx.moveTo(b.x + 56, b.y + 5); ctx.lineTo(b.x + 48, b.y + 16); ctx.lineTo(b.x + 66, b.y + 25);
        ctx.stroke();
      }
    }
    if (b.kind === 'boom') {
      ctx.fillStyle = '#3d1503';
      ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, 8, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#ffe9b0';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✸', b.x + b.w / 2, b.y + b.h / 2 + 1);
    }
    if (b.kind === 'prism') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      ctx.moveTo(cx, cy - 9); ctx.lineTo(cx + 8, cy + 7); ctx.lineTo(cx - 8, cy + 7);
      ctx.closePath(); ctx.fill();
    }
    if (b.kind === 'boss') {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      rr(ctx, b.x + 8, b.y + b.h - 8, b.w - 16, 4, 2); ctx.fill();
      ctx.fillStyle = '#ffd23d';
      rr(ctx, b.x + 8, b.y + b.h - 8, (b.w - 16) * (b.hp / 6), 4, 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('◆ CORE ◆', b.x + b.w / 2, b.y + b.h / 2 - 2);
    }
    ctx.restore();
  }
}

export function drawPaddle(ctx, world) {
  const p = world.paddle;
  const x = p.x - p.w / 2;
  ctx.save();
  ctx.shadowColor = COLORS.paddle;
  ctx.shadowBlur = 20;
  const g = ctx.createLinearGradient(x, PADDLE.y, x, PADDLE.y + PADDLE.h);
  g.addColorStop(0, '#bdf3ff');
  g.addColorStop(0.45, COLORS.paddle);
  g.addColorStop(1, '#1668a8');
  ctx.fillStyle = g;
  rr(ctx, x, PADDLE.y, p.w, PADDLE.h, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.paddleCore;
  rr(ctx, x + 10, PADDLE.y + 4, p.w - 20, 4, 2);
  ctx.fill();
  if (p.laserT > 0) { // laser cannons on both paddle tips
    ctx.fillStyle = COLORS.laser;
    ctx.shadowColor = COLORS.laser;
    ctx.shadowBlur = 10;
    rr(ctx, x + 2, PADDLE.y - 12, 12, 14, 3); ctx.fill();
    rr(ctx, x + p.w - 14, PADDLE.y - 12, 12, 14, 3); ctx.fill();
  }
  if (p.wideT > 0) {
    ctx.fillStyle = 'rgba(61,201,255,0.85)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`WIDE ${Math.ceil(p.wideT)}s`, p.x, PADDLE.y + 32);
  }
  ctx.restore();
}

export function drawBalls(ctx, world) {
  for (const ball of world.balls) {
    ctx.save();
    for (let i = ball.trail.length - 1; i >= 0; i--) {
      const t = ball.trail[i];
      const k = 1 - i / ball.trail.length;
      ctx.globalAlpha = 0.30 * k;
      ctx.fillStyle = '#3dc9ff';
      ctx.beginPath();
      ctx.arc(t.x, t.y, BALL.r * (0.35 + 0.6 * k), 0, 6.29);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = '#9be8ff';
    ctx.shadowBlur = 18;
    const g = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, BALL.r + 2);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.6, '#dff6ff');
    g.addColorStop(1, '#7fd4ff');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL.r, 0, 6.29);
    ctx.fill();
    ctx.restore();
  }
}

export function drawLasers(ctx, world) {
  ctx.save();
  ctx.strokeStyle = COLORS.laser;
  ctx.shadowColor = COLORS.laser;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const l of world.lasers) {
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x, l.y + 20);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPowers(ctx, world) {
  for (const pw of world.powers) {
    const meta = POWER_KINDS[pw.kind];
    ctx.save();
    ctx.translate(pw.x, pw.y);
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = meta.color;
    rr(ctx, -17, -12, 34, 24, 11);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    rr(ctx, -17, -12, 17, 24, 11);
    ctx.fill();
    ctx.fillStyle = '#0b0620';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(pw.kind === '+' ? '♥' : pw.kind, 0, 1);
    ctx.restore();
  }
}

export function drawParticles(ctx, world) {
  ctx.save();
  for (const pt of world.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.restore();
}

export function drawTexts(ctx, world) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 17px system-ui, sans-serif';
  for (const t of world.texts) {
    ctx.globalAlpha = Math.min(1, t.life / 0.45);
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 8;
    ctx.fillText(t.str, t.x, t.y);
  }
  ctx.restore();
}

export function drawWorld(ctx, world) {
  ctx.save();
  if (world.shake > 0) {
    const s = world.shake;
    ctx.translate(((world.time * 977) % 1 - 0.5) * s, ((world.time * 631) % 1 - 0.5) * s);
  }
  drawBackground(ctx, world);
  drawBricks(ctx, world);
  drawPowers(ctx, world);
  drawLasers(ctx, world);
  drawPaddle(ctx, world);
  drawBalls(ctx, world);
  drawParticles(ctx, world);
  drawTexts(ctx, world);
  ctx.restore();
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255,157,61,${(world.flash * 0.20).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
  }
}
