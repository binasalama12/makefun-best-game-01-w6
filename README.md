# Prism Breakout — Neon Brickstorm

An evolved breakout for the make.fun **best-game-01** competition. Smash a
rainbow prism wall of 104 bricks with a glowing paddle and a trail-blazing
ball — then watch the wall fight back with steel plates, chain-detonating
explosive bricks, prism bricks that split your ball in two, and a boss core
with its own health bar on every third wall.

## How to play

- **Steer:** mouse, touch drag, or `←` `→` / `A` `D`
- **Launch the ball / fire lasers:** `Space` or click
- **Pause:** `P` · **Restart after game over:** `R` or click
- Catch falling capsules: **W** wide paddle, **L** laser cannons (auto-fire
  while active), **M** multiball, **S** slow-motion ball, **♥** extra life
- Chain hits without touching the paddle to grow the **combo multiplier**;
  every 6 chained hits raises the score multiplier by one
- Clear the wall to advance; layouts rotate through four hand-designed
  walls, speed rises each level, three lives to start

Full loop on one canvas: title screen → play → pause → game over with a
score / levels / bricks / best-combo report → instant restart. Sound is a
tiny WebAudio synth (no assets), unlocked by the first click or keypress.

## Run it

Static and offline — no build step, no dependencies, no network requests:

```
node serve.ts --port 8199
# open http://127.0.0.1:8199/index.html
```

or serve the `game/` folder with any static file server. Node 22 runs the
TypeScript helper directly; the game itself is plain HTML + ES modules.

## Layout

- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to the
  output directory and writes `dossier.json` via `vendor/makefun-game.ts`
- `game/index.html` — the page and canvas
- `game/src/` — `main.js` (loop + state machine), `world.js` (paddle, balls,
  bricks, lasers, capsules, particles), `render.js` (neon drawing),
  `hud.js` (HUD, title, pause, game over), `shots.js` (deterministic staged
  scenes for the screenshots), `input.js`, `audio.js`, `config.js`, `rng.js`
- `screenshots/` — title, play, feature and game-over frames, captured from
  the deterministic `?shot=` scenes (same seed, byte-identical captures)
- `shots.json` — the screenshot scene manifest

Deterministic by construction: one seeded generator drives level drops and
particle motion, and every screenshot scene is staged from literal
coordinates, so the dossier rebuilds byte-for-byte.
