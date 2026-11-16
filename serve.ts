// serve.ts — zero-dependency static server for local play and screenshot
// capture. Node 22 runs TypeScript directly; standard library only.
//   node serve.ts --port 8199   then open http://127.0.0.1:8199/index.html
// Serves the game/ directory (index.html plus its ES modules) and nothing else.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const portArg = process.argv.indexOf('--port');
const port = portArg >= 0 ? Number(process.argv[portArg + 1]) : 8199;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '');
    if (path === '' || path === '.') path = 'index.html';
    const file = join(root, path);
    if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Prism Breakout serving game/ at http://127.0.0.1:${port}/index.html`);
});
