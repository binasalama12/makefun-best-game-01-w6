// hud.js — heads-up display and full-screen states for Prism Breakout:
// score / level / lives / combo bar during play, the title screen, the pause
// veil and the game-over screen. Drawn on the same canvas as the world.

import { W, H, COLORS, POWER_KINDS } from './config.js';

function label(ctx, text, x, y, size, color, align = 'left', bold = true) {
  ctx.save();
  ctx.font = `${bold ? 'bold ' : ''}${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawHud(ctx, world) {
  ctx.save();
  ctx.fillStyle = 'rgba(5,2,18,0.72)';
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 64, W, 2);

  label(ctx, 'SCORE', 48, 22, 12, COLORS.dim);
  label(ctx, String(world.score).padStart(6, '0'), 48, 46, 24, COLORS.text);
  label(ctx, `LEVEL ${world.level}`, W / 2, 26, 15, COLORS.gold, 'center');
  const alive = world.bricks.filter((b) => b.alive).length;
  label(ctx, `BRICKS LEFT ${alive}`, W / 2, 48, 12, COLORS.dim, 'center');
  label(ctx, 'LIVES', W - 48, 22, 12, COLORS.dim, 'right');
  ctx.fillStyle = '#ff3d7f';
  ctx.shadowColor = '#ff3d7f';
  ctx.shadowBlur = 8;
  for (let i = 0; i < world.lives; i++) {
    const cx = W - 62 - i * 26;
    ctx.beginPath();
    ctx.arc(cx, 46, 8, 0, 6.29);
    ctx.fill();
  }
  ctx.restore();

  // Combo meter under the top bar.
  if (world.combo >= 2) {
    const mult = 1 + Math.floor(world.combo / 6);
    ctx.save();
    label(ctx, `COMBO ×${mult}  (${world.combo} hits)`, 48, 88, 13, '#e05cff');
    ctx.fillStyle = 'rgba(224,92,255,0.25)';
    ctx.fillRect(210, 82, 180, 9);
    ctx.fillStyle = '#e05cff';
    ctx.fillRect(210, 82, 180 * ((world.combo % 6) / 6 || 1), 9);
    ctx.restore();
  }
  // Active power timers, right side.
  const timers = [];
  if (world.paddle.laserT > 0) timers.push(['LASER', world.paddle.laserT, POWER_KINDS.L.color]);
  if (world.paddle.wideT > 0) timers.push(['WIDE', world.paddle.wideT, POWER_KINDS.W.color]);
  if (world.slowT > 0) timers.push(['SLOW-MO', world.slowT, POWER_KINDS.S.color]);
  timers.forEach(([name, t, color], i) => {
    label(ctx, `${name} ${Math.ceil(t)}s`, W - 56, 88 + i * 18, 12, color, 'right');
  });
  if (world.stuck) {
    label(ctx, 'SPACE / CLICK TO LAUNCH', W / 2, H - 96, 17, '#ffffff', 'center');
  }
}

export function drawTitle(ctx, world) {
  // The world (full brick wall) is already drawn behind; add a soft veil,
  // the logo and the instructions panel.
  ctx.save();
  ctx.fillStyle = 'rgba(4,1,16,0.42)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.shadowColor = '#3dc9ff';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 92px system-ui, sans-serif';
  ctx.fillText('PRISM', W / 2, 300);
  ctx.shadowColor = '#e05cff';
  ctx.fillStyle = '#ffd23d';
  ctx.font = 'bold 92px system-ui, sans-serif';
  ctx.fillText('BREAKOUT', W / 2, 392);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#cfe8ff';
  ctx.font = 'bold 21px system-ui, sans-serif';
  ctx.fillText('NEON BRICKSTORM — multiball · lasers · chain explosions', W / 2, 448);

  ctx.fillStyle = 'rgba(8,4,28,0.82)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 330, 486, 660, 118, 12);
  ctx.fill();
  ctx.strokeStyle = '#3dc9ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Brick legend: one swatch per special brick kind, named.
  const legend = [['#c7d2e8', 'STEEL ×2'], ['#ff9d3d', '✸ EXPLOSIVE'], ['#e05cff', '◆ PRISM SPLIT'], ['#ff3d7f', 'BOSS CORE']];
  ctx.font = 'bold 13px system-ui, sans-serif';
  let lx = W / 2 - 268;
  for (const [color, name] of legend) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(lx, 470, 22, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#f2f6ff';
    ctx.textAlign = 'left';
    ctx.fillText(name, lx + 28, 477);
    lx += 28 + ctx.measureText(name).width + 30;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2f6ff';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Mouse or ← → / A D — steer the paddle · SPACE — launch & fire', W / 2, 516);
  ctx.fillText('Prism bricks split your ball · orange ✸ bricks explode in chains', W / 2, 544);
  ctx.fillText('Catch capsules: WIDE · LASER · MULTI · SLOW-MO · 1UP', W / 2, 572);

  const pulse = 0.72 + 0.28 * Math.sin(world.time * 4);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#7dff3d';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('PRESS ENTER OR CLICK TO PLAY', W / 2, 652);
  ctx.restore();
}

export function drawPause(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(4,1,16,0.62)';
  ctx.fillRect(0, 0, W, H);
  label(ctx, 'PAUSED', W / 2, H / 2 - 10, 44, '#ffffff', 'center');
  label(ctx, 'Press P to resume', W / 2, H / 2 + 34, 17, COLORS.dim, 'center');
  ctx.restore();
}

export function drawGameOver(ctx, world) {
  ctx.save();
  ctx.fillStyle = 'rgba(4,1,16,0.66)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff3d7f';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#ff5c8a';
  ctx.font = 'bold 72px system-ui, sans-serif';
  ctx.fillText('GAME OVER', W / 2, 240);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(8,4,28,0.85)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 250, 292, 500, 208, 14);
  ctx.fill();
  ctx.strokeStyle = '#ff3d7f';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  label(ctx, `FINAL SCORE   ${world.score}`, W / 2, 336, 24, COLORS.gold, 'center');
  label(ctx, `Levels cleared to  ${world.level}`, W / 2, 382, 18, COLORS.text, 'center');
  label(ctx, `Bricks smashed  ${world.broken}`, W / 2, 416, 18, COLORS.text, 'center');
  label(ctx, `Best combo  ×${1 + Math.floor(world.bestCombo / 6)}  (${world.bestCombo} hits)`, W / 2, 450, 18, COLORS.text, 'center');

  const pulse = 0.72 + 0.28 * Math.sin(world.time * 4);
  ctx.globalAlpha = pulse;
  label(ctx, 'PRESS R OR CLICK TO PLAY AGAIN', W / 2, 556, 22, '#7dff3d', 'center');
  ctx.restore();
}
