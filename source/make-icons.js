// Draws Card Night's icons ("suit candy": the four suits as bright candy tiles) at every size the site needs.
// Run from the repo root: node source/make-icons.js (needs Playwright). The apple-touch and maskable icons are
// full-bleed squares (the phone rounds the corners; maskable keeps everything inside the safe circle); the
// "any" icons and the favicon are rounded. File names carry a version so phones never reuse an old cached icon.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), V = 'v2';
const HEART = 'M0,35 C-10,25 -50,0 -50,-22 C-50,-42 -32,-52 -18,-52 C-8,-52 -2,-46 0,-40 C2,-46 8,-52 18,-52 C32,-52 50,-42 50,-22 C50,0 10,25 0,35 Z';
const DIAMOND = 'M0,-50 C10,-34 24,-14 36,0 C24,14 10,34 0,50 C-10,34 -24,14 -36,0 C-24,-14 -10,-34 0,-50 Z';
const SPADE = 'M0,-50 C10,-36 50,-14 50,10 C50,28 34,38 20,38 C12,38 5,34 2,28 C3,40 8,48 16,54 L-16,54 C-8,48 -3,40 -2,28 C-5,34 -12,38 -20,38 C-34,38 -50,28 -50,10 C-50,-14 -10,-36 0,-50 Z';
const club = fill => `<g fill="${fill}"><circle cx="0" cy="-24" r="22"/><circle cx="-24" cy="10" r="22"/><circle cx="24" cy="10" r="22"/><path d="M-5,8 L-14,52 L14,52 L5,8 Z"/><circle cx="0" cy="6" r="12"/></g>`;
const suit = (name, fill, t) => name === 'club' ? `<g transform="${t}">${club(fill)}</g>` : `<path d="${{ heart: HEART, diamond: DIAMOND, spade: SPADE }[name]}" fill="${fill}" transform="${t}"/>`;
const sparkle = (x, y, s) => `<path d="M0,-22 C3,-6 6,-3 22,0 C6,3 3,6 0,22 C-3,6 -6,3 -22,0 C-6,-3 -3,-6 0,-22Z" fill="#fff7c2" transform="translate(${x} ${y}) scale(${s})"/>`;
const tile = (x, y, rot, s, bg) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-92" y="-92" width="184" height="184" rx="44" fill="${bg}"/>
  <rect x="-92" y="-92" width="184" height="92" rx="44" fill="#fff" opacity=".18"/>${suit(s, '#fff', 'scale(1.25)')}</g>`;
const svg = ({ round = false, scale = 1, sparkles = true } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#6366f1"/><stop offset="1" stop-color="#a21caf"/></linearGradient>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#1e1b4b" flood-opacity=".45"/></filter></defs>
  <rect width="512" height="512" rx="${round ? 112 : 0}" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)" filter="url(#sh)">
    ${tile(156, 156, -6, 'heart', '#ff3b6b')}${tile(356, 156, 5, 'spade', '#1f2a5a')}${tile(156, 356, 4, 'diamond', '#ff9f1c')}${tile(356, 356, -5, 'club', '#16a34a')}
  </g>${sparkles ? sparkle(442, 66, 1) + sparkle(72, 452, .7) : ''}</svg>`;
(async () => {
  for (const f of fs.readdirSync(ROOT)) if (/^(apple-touch-icon|favicon-32|icon-192|icon-512|icon-maskable-512)(-v\d+)?\.png$/.test(f)) fs.unlinkSync(path.join(ROOT, f));
  fs.writeFileSync(path.join(ROOT, 'icon.svg'), svg({ round: true }));
  const browser = await chromium.launch(), page = await browser.newPage();
  const out = async (file, size, opts) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg(opts).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
    await page.screenshot({ path: path.join(ROOT, file.replace('.png', `-${V}.png`)), omitBackground: !!(opts && opts.round), clip: { x: 0, y: 0, width: size, height: size } });
  };
  await out('icon-512.png', 512, { round: true });
  await out('icon-192.png', 192, { round: true });
  await out('icon-maskable-512.png', 512, { scale: .74, sparkles: false });
  await out('apple-touch-icon.png', 180, {});
  await out('favicon-32.png', 32, { round: true, sparkles: false });
  await browser.close();
  console.log('icons written');
})();
