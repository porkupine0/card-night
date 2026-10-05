// Inserts (or refreshes) the shared Claude helper in one app's index.html.
//   node hx/ai-inject.js <app-folder> <adapter-file>
// The adapter file holds the app's `const AI = {...}`. CSS goes before the first </style>; the adapter and the module go
// just before the main script's boot `render();`. Both are fenced with markers, so running it again replaces them.
const fs = require('fs');
const path = require('path');
const [dir, adapterFile] = process.argv.slice(2);
if (!dir || !adapterFile) { console.error('usage: node hx/ai-inject.js <app-folder> <adapter-file>'); process.exit(1); }
const file = path.join(dir, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'ai.css'), 'utf8').trim();
const mod = fs.readFileSync(path.join(__dirname, 'ai-module.js'), 'utf8').trim();
const adapter = fs.readFileSync(adapterFile, 'utf8').trim();
for (const [n, s] of [['module', mod], ['adapter', adapter], ['css', css]]) if (s.includes('</script') || s.includes('</style')) throw new Error(n + ' contains a closing tag');

const CSS_A = '/* ai:css:start */', CSS_B = '/* ai:css:end */';
const JS_A = '/* ai:js:start */', JS_B = '/* ai:js:end */';
const strip = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b); return i >= 0 && j > i ? s.slice(0, i) + s.slice(j + b.length).replace(/^\n/, '') : s; };
html = strip(html, CSS_A, CSS_B);
html = strip(html, JS_A, JS_B);

const styleEnd = html.indexOf('</style>');
if (styleEnd < 0) throw new Error('no </style> in ' + file);
html = html.slice(0, styleEnd) + `${CSS_A}\n${css}\n${CSS_B}\n` + html.slice(styleEnd);

// the main script is the one that defines render(); its boot call is the last line that is exactly `render();`
const fr = html.indexOf('function render(');
if (fr < 0) throw new Error('no function render( in ' + file);
const scriptEnd = html.indexOf('</script>', fr);
const boot = html.lastIndexOf('\nrender();', scriptEnd);
if (boot < fr) throw new Error('no boot render(); in ' + file);
html = html.slice(0, boot + 1) + `${JS_A}\n${adapter}\n${mod}\n${JS_B}\n` + html.slice(boot + 1);
fs.writeFileSync(file, html);
console.log('Claude helper in ' + file);
