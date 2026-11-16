// shots.js — deterministic staged scenes for the screenshot dossier.
// Each scene rebuilds a fixed, hand-placed moment of play from literal
// coordinates (no wall-clock, no unseeded randomness), so two captures of
// the same scene are byte-identical. ?shot=title|play|feature|end&seed=7.

function killPattern(world, cells) {
  const byPos = new Map();
  for (const b of world.bricks) {
    const c = Math.round((b.x - 62) / 92);
    const r = Math.round((b.y - 118) / 36);
    byPos.set(`${c},${r}`, b);
  }
  for (const key of cells) {
    const b = byPos.get(key);
    if (b) { b.alive = false; world.broken++; }
  }
}

function setBall(ball, x, y, vx, vy, trailPts) {
  ball.stuck = false;
  ball.x = x; ball.y = y; ball.vx = vx; ball.vy = vy;
  ball.trail = trailPts.map(([tx, ty]) => ({ x: tx, y: ty }));
}

function addParticles(world, list) {
  for (const [x, y, color, size] of list) {
    world.particles.push({ x, y, vx: 0, vy: 0, life: 0.7, maxLife: 0.8, size, color });
  }
}

export function stageScene(world, scene) {
  world.time = 1.25;
  if (scene === 'title') {
    world.paddle.x = 640;
    world.paddle.w = 208;
    world.balls[0].stuck = true;
    world.balls[0].x = 640;
    world.balls[0].y = 640;
    world.score = 0;
    // Attract-mode dressing: drifting capsules, a second ball crossing the
    // lower arena with its trail, and sparks keep the title frame alive
    // behind the veil without hiding the full rainbow wall.
    world.powers.push({ x: 1086, y: 300, vy: 168, kind: 'M', spin: 1.4 });
    world.powers.push({ x: 196, y: 470, vy: 168, kind: 'L', spin: 2.9 });
    const tb = world.newBall(false, 902, 560, 2.6);
    setBall(tb, 902, 560, -340, -260, [[920, 574], [938, 588], [956, 602], [974, 616]]);
    world.balls.push(tb);
    addParticles(world, [
      [240, 210, '#ffc93d', 5], [262, 224, '#ff7a3d', 4],
      [1030, 470, '#3dc9ff', 4], [1052, 484, '#e05cff', 5],
      [420, 560, '#7dff3d', 4], [444, 574, '#3dffc9', 5],
      [860, 300, '#ff3d7f', 4], [884, 314, '#ffc93d', 4],
    ]);
    return 'title';
  }

  if (scene === 'play') {
    killPattern(world, ['2,2', '3,2', '9,2', '5,3', '6,3', '7,3', '1,5', '11,5', '4,6', '8,6', '6,0', '6,1']);
    world.score = 1850;
    world.combo = 7;
    world.bestCombo = 7;
    world.paddle.x = 470;
    setBall(world.balls[0], 742, 392, 300, -430, [[724, 410], [706, 428], [688, 446], [670, 464], [652, 482]]);
    const pb = world.newBall(false, 330, 560, 0.7);
    setBall(pb, 330, 560, 380, -300, [[312, 576], [294, 592], [276, 608]]);
    world.balls.push(pb);
    world.powers.push({ x: 872, y: 330, vy: 168, kind: 'L', spin: 1.2 });
    world.powers.push({ x: 300, y: 470, vy: 168, kind: 'M', spin: 2.6 });
    world.powers.push({ x: 1010, y: 540, vy: 168, kind: 'W', spin: 4.4 });
    addParticles(world, [
      [560, 240, '#ffc93d', 5], [584, 252, '#ffc93d', 4], [538, 262, '#ff7a3d', 5],
      [906, 200, '#3dc9ff', 4], [926, 214, '#3dc9ff', 5], [886, 218, '#7a5cff', 4],
      [352, 330, '#7dff3d', 4], [372, 344, '#7dff3d', 5],
      [620, 520, '#e05cff', 4], [644, 534, '#3dc9ff', 5], [596, 536, '#e05cff', 4],
      [180, 620, '#ffc93d', 4], [204, 632, '#ff7a3d', 4],
    ]);
    world.texts.push({ x: 610, y: 226, str: '+100', color: '#ffc93d', life: 0.8 });
    world.texts.push({ x: 905, y: 180, str: '+50', color: '#3dc9ff', life: 0.7 });
    world.stuck = false;
    return 'play';
  }

  if (scene === 'feature') {
    killPattern(world, ['2,2', '3,2', '4,2', '8,2', '9,2', '10,2', '5,3', '6,3', '7,3', '0,4', '12,4', '6,4', '1,6', '11,6', '5,0', '7,1']);
    world.score = 6420;
    world.combo = 13;
    world.bestCombo = 13;
    world.paddle.x = 640;
    world.paddle.w = 208;
    world.paddle.laserT = 9;
    world.flash = 0.3;
    world.shake = 4;
    setBall(world.balls[0], 408, 300, -260, -470, [[424, 318], [440, 336], [456, 354], [472, 372]]);
    const b2 = world.newBall(false, 838, 356, 0.9);
    setBall(b2, 838, 356, 430, 260, [[820, 344], [802, 332], [784, 320]]);
    world.balls.push(b2);
    const b3 = world.newBall(false, 660, 470, 2.4);
    setBall(b3, 660, 470, -180, 500, [[668, 448], [676, 426], [684, 404]]);
    world.balls.push(b3);
    const b4 = world.newBall(false, 240, 600, 0.5);
    setBall(b4, 240, 600, 420, -240, [[222, 612], [204, 624], [186, 636]]);
    world.balls.push(b4);
    world.powers.push({ x: 900, y: 590, vy: 168, kind: 'M', spin: 5.3 });
    world.lasers.push({ x: 546, y: 420, vy: -760 }, { x: 546, y: 300, vy: -760 }, { x: 734, y: 470, vy: -760 }, { x: 734, y: 350, vy: -760 }, { x: 546, y: 540, vy: -760 }, { x: 734, y: 590, vy: -760 });
    world.powers.push({ x: 210, y: 250, vy: 168, kind: 'W', spin: 0.7 });
    world.powers.push({ x: 1050, y: 430, vy: 168, kind: '+', spin: 2.1 });
    world.powers.push({ x: 520, y: 130, vy: 168, kind: 'S', spin: 4.0 });
    addParticles(world, [
      [610, 236, '#ff9d3d', 6], [640, 220, '#ff9d3d', 5], [580, 254, '#ffc93d', 5], [668, 248, '#ff7a3d', 6],
      [596, 268, '#ff9d3d', 4], [652, 272, '#ffc93d', 4], [622, 200, '#ff9d3d', 5], [700, 226, '#ff7a3d', 4],
      [300, 380, '#e05cff', 5], [322, 394, '#e05cff', 4], [278, 396, '#3dc9ff', 4],
      [980, 180, '#3dffc9', 5], [1002, 194, '#3dffc9', 4],
      [452, 520, '#ff3d7f', 4], [472, 534, '#ff3d7f', 5],
      [760, 540, '#3dc9ff', 5], [784, 554, '#7a5cff', 4], [736, 556, '#3dc9ff', 4],
      [180, 560, '#ffc93d', 4], [204, 574, '#ffc93d', 5],
      [1080, 560, '#e05cff', 5], [1104, 574, '#3dffc9', 4],
    ]);
    world.texts.push({ x: 622, y: 190, str: '+300', color: '#ff9d3d', life: 0.85 });
    world.texts.push({ x: 300, y: 350, str: 'SPLIT!', color: '#e05cff', life: 0.8 });
    world.texts.push({ x: 986, y: 150, str: '+100', color: '#3dffc9', life: 0.75 });
    world.stuck = false;
    return 'play';
  }

  // end: a hard-fought wall, no lives left.
  killPattern(world, ['0,0', '1,0', '5,0', '6,0', '11,0', '12,0', '2,2', '3,2', '9,2', '10,2', '5,3', '6,3', '7,3', '0,4', '4,4', '8,4', '12,4', '1,5', '11,5', '4,6', '8,6', '6,7', '2,7', '10,7']);
  world.score = 12750;
  world.level = 3;
  world.broken = 61;
  world.bestCombo = 19;
  world.lives = 0;
  world.paddle.x = 560;
  world.balls = [];
  addParticles(world, [
    [400, 300, '#ff3d7f', 5], [880, 260, '#3dc9ff', 5], [640, 420, '#ffc93d', 4],
    [300, 470, '#e05cff', 4], [980, 460, '#7dff3d', 4],
  ]);
  return 'gameover';
}
