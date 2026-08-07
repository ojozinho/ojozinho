import { chromium } from 'file:///C:/Users/joaog/OneDrive/Documentos/Party%20pay/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b64 = fs.readFileSync('C:/Users/joaog/OneDrive/Imagens/github profile/Imagem site.png').toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const cores = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = 240; c.height = Math.round(240 * img.height / img.width);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  // Agrupa por celula de 24 niveis para achar familias de cor, nao pixels isolados.
  const balde = new Map();
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2];
    const k = [Math.round(r/24), Math.round(g/24), Math.round(b/24)].join(',');
    const e = balde.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    balde.set(k, e);
  }
  return [...balde.values()].sort((a,b) => b.n - a.n).slice(0, 22).map(e => {
    const r = Math.round(e.r/e.n), g = Math.round(e.g/e.n), b = Math.round(e.b/e.n);
    const hex = '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const sat = max === 0 ? 0 : (max-min)/max;
    return { hex, n: e.n, sat: +sat.toFixed(2), lum: Math.round((0.299*r+0.587*g+0.114*b)) };
  });
}, b64);
console.log(JSON.stringify(cores, null, 0).replace(/\},/g, '},\n'));
await browser.close();
