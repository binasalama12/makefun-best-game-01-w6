// config.js — arena geometry, palette and tuning for Prism Breakout.

export const W = 1280;
export const H = 720;

export const WALL = { left: 36, right: W - 36, top: 84, bottom: H - 18 };
export const BRICK = { cols: 13, rows: 8, w: 86, h: 30, gap: 6, x0: 62, y0: 118 };
export const PADDLE = { w: 148, wideW: 208, h: 16, y: H - 58, speed: 980 };
export const BALL = { r: 9, baseSpeed: 520, maxSpeed: 940 };
export const START_LIVES = 3;

// Saturated neon palette — one hue family per brick row so a full wall reads
// as a rainbow prism in a single still frame.
export const ROW_COLORS = [
  '#ff3d7f', '#ff7a3d', '#ffc93d', '#7dff3d',
  '#3dffc9', '#3dc9ff', '#7a5cff', '#e05cff',
];
export const COLORS = {
  bg0: '#070418',
  bg1: '#160a38',
  wall: '#3dc9ff',
  paddle: '#3dc9ff',
  paddleCore: '#eafcff',
  ball: '#ffffff',
  hard: '#c7d2e8',
  hardDark: '#5d6c8c',
  boom: '#ff9d3d',
  prism: '#e05cff',
  laser: '#ff3d5e',
  text: '#f2f6ff',
  dim: '#9fb4d8',
  gold: '#ffd23d',
};

export const POWER_KINDS = {
  W: { label: 'WIDE', color: '#3dc9ff' },
  L: { label: 'LASER', color: '#ff3d5e' },
  M: { label: 'MULTI', color: '#e05cff' },
  S: { label: 'SLOW', color: '#3dffc9' },
  '+': { label: '1UP', color: '#ffd23d' },
};

// Brick glyphs used by the level layouts in world.js:
//   '.' empty · '1'..'8' coloured 1-HP brick of that row hue
//   '#' steel 2-HP · 'X' explosive · 'P' prism (splits the ball) · 'B' boss core
export const LEVELS = [
  [
    '1111111111111',
    '2222222222222',
    '33X333P333X33',
    '4444444444444',
    '555##555##555',
    '6666666666666',
    '77P7777777P77',
    '8888888888888',
  ],
  [
    '1.1.1.1.1.1.1',
    '.2.2.2.2.2.2.',
    '3X3#3P3#3X3#3',
    '.4.4.4.4.4.4.',
    '5.5.5X5.5.5.5',
    '.6.6.6.6P6.6.',
    '7#7#7#7#7#7#7',
    '.8.8.8.8.8.8.',
  ],
  [
    '#####BBB#####',
    '#111#BBB#111#',
    '#1X1#####1P1#',
    '#11122222111#',
    '.3333X33333..',
    '..444444444..',
    '.5P5555555P5.',
    '6666666666666',
  ],
  [
    'P22222222222P',
    '2X222222222X2',
    '22##33333##22',
    '2#444444444#2',
    '22##55555##22',
    '2X666666666X2',
    'P77777777777P',
    '888#88888#888',
  ],
];
