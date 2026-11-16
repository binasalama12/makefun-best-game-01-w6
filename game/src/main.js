// main.js — game loop and state machine for Prism Breakout.
// States: title -> play <-> pause -> gameover -> (restart) -> title of a
// fresh run. In screenshot mode (?shot=<scene>) the loop renders exactly one
// staged deterministic frame and raises window.__shotReady for the driver.

import { World } from './world.js';
import { Input } from './input.js';
import { Sfx } from './audio.js';
import { seedFromQuery } from './rng.js';
import { drawWorld } from './render.js';
import { drawHud, drawTitle, drawPause, drawGameOver } from './hud.js';
import { stageScene } from './shots.js';
import { W, H } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const seed = seedFromQuery(7);
const sfx = new Sfx();
const input = new Input(canvas);
let world = new World(seed, sfx);
let state = 'title';
let last = performance.now();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  state = stageScene(world, shot);
  drawWorld(ctx, world);
  if (state === 'title') drawTitle(ctx, world);
  else {
    drawHud(ctx, world);
    if (state === 'gameover') drawGameOver(ctx, world);
  }
  window.__shotReady = true;
} else {
  requestAnimationFrame(frame);
}

function startRun() {
  sfx.unlock();
  world = new World(seed, sfx);
  state = 'play';
}

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.05) dt = 0.05; // tab-switch clamp; physics substeps handle the rest
  world.time += 0; // time advances inside step / title idle below

  if (state === 'title') {
    world.time += dt;
    if (input.takeStart()) startRun();
  } else if (state === 'play') {
    if (input.takePause()) state = 'pause';
    else {
      if (input.takeLaunch() && world.stuck) { sfx.unlock(); world.launch(); }
      const result = world.step(dt, input);
      if (result === 'gameover') { state = 'gameover'; sfx.over(); }
    }
  } else if (state === 'pause') {
    if (input.takePause()) state = 'play';
  } else if (state === 'gameover') {
    world.time += dt;
    if (input.takeRestart() || input.takeStart()) startRun();
  }

  drawWorld(ctx, world);
  if (state === 'title') drawTitle(ctx, world);
  else {
    drawHud(ctx, world);
    if (state === 'pause') drawPause(ctx);
    if (state === 'gameover') drawGameOver(ctx, world);
  }
}
