import { chromium } from 'file:///C:/Users/joaog/OneDrive/Documentos/Party%20pay/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b64 = fs.readFileSync('C:/Users/joaog/OneDrive/Imagens/github profile/Imagem site.png').toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const out = await page.evaluate(async (b64) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  // Regioes em fracao da imagem: [nome, x, y, largura, altura]
  const alvos = [
    ['bone LA', 0.61, 0.09, 0.06, 0.05],
    ['assento', 0.30, 0.60, 0.05, 0.05],
    ['assento dir', 0.88, 0.58, 0.04, 0.04],
    ['parede', 0.42, 0.22, 0.04, 0.04],
    ['camiseta', 0.55, 0.40, 0.03, 0.04],
    ['grafite verde', 0.90, 0.28, 0.03, 0.05],
    ['janela noite', 0.06, 0.30, 0.04, 0.06],
    ['piso', 0.10, 0.90, 0.05, 0.04],
    ['jeans', 0.45, 0.80, 0.05, 0.05],
  ];
  return alvos.map(([nome, fx, fy, fw, fh]) => {
    const d = ctx.getImageData(fx*c.width, fy*c.height, Math.max(2,fw*c.width), Math.max(2,fh*c.height)).data;
    let r=0,g=0,b=0,n=0;
    for (let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
    r=Math.round(r/n);g=Math.round(g/n);b=Math.round(b/n);
    return nome.padEnd(14) + '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  });
}, b64);
console.log(out.join('\n'));
await browser.close();
