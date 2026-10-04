// Renders Card Night's icons from one SVG: node source/make-icons.js (run from the repo root; needs Playwright).
// apple-touch-icon and the maskable icon are full-bleed squares (the phone rounds the corners); the "any" icons are rounded.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const HEART = 'M0,35 C-10,25 -50,0 -50,-22 C-50,-42 -32,-52 -18,-52 C-8,-52 -2,-46 0,-40 C2,-46 8,-52 18,-52 C32,-52 50,-42 50,-22 C50,0 10,25 0,35 Z';
const DIAMOND = 'M0,-50 L36,0 L0,50 L-36,0 Z';
const SPADE = 'M0,-50 C10,-36 50,-14 50,10 C50,28 34,38 20,38 C12,38 5,34 2,28 C3,40 8,48 16,54 L-16,54 C-8,48 -3,40 -2,28 C-5,34 -12,38 -20,38 C-34,38 -50,28 -50,10 C-50,-14 -10,-36 0,-50 Z';
const card = (rot, dx, dy, suit, color) => `<g transform="rotate(${rot}) translate(${dx} ${dy})">
  <rect x="-78" y="-110" width="156" height="220" rx="18" fill="#fffaf0" stroke="#d8ccb2" stroke-width="3"/>
  <path d="${suit}" fill="${color}" transform="scale(1.05)"/>
  <path d="${suit}" fill="${color}" transform="translate(-52 -80) scale(.28)"/>
  <path d="${suit}" fill="${color}" transform="translate(52 80) rotate(180) scale(.28)"/></g>`;
const svg = ({ round = false, scale = 1 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs><radialGradient id="felt" cx="50%" cy="38%" r="78%"><stop offset="0" stop-color="#1d7556"/><stop offset="1" stop-color="#0a3022"/></radialGradient>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#000" flood-opacity=".35"/></filter></defs>
  <rect width="512" height="512" rx="${round ? 112 : 0}" fill="url(#felt)"/>
  <g transform="translate(256 262) scale(${1.18 * scale})" filter="url(#sh)">
    ${card(-28, -46, 18, HEART, '#c8102e')}${card(28, 46, 18, DIAMOND, '#c8102e')}${card(0, 0, -14, SPADE, '#1b1b1b')}
  </g></svg>`;
(async () => {
  fs.writeFileSync(path.join(ROOT, 'icon.svg'), svg({ round: true }));
  const browser = await chromium.launch(), page = await browser.newPage();
  const out = async (file, size, opts) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg(opts).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
    await page.screenshot({ path: path.join(ROOT, file), omitBackground: !!(opts && opts.round), clip: { x: 0, y: 0, width: size, height: size } });
  };
  await out('icon-512.png', 512, { round: true });
  await out('icon-192.png', 192, { round: true });
  await out('icon-maskable-512.png', 512, { scale: .74 });
  await out('apple-touch-icon.png', 180, {});
  await out('favicon-32.png', 32, { round: true });
  await browser.close();
  console.log('icons written');
})();
