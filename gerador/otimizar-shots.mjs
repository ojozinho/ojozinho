import { chromium } from 'playwright';
import fs from 'node:fs';
const ARQS = ['cliente-home','cliente-evento','cliente-racha','negocio-painel','negocio-kanban','cliente-pagamento'];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const nome of ARQS) {
  const p = `C:/Users/joaog/Downloads/${nome}.png`;
  if (!fs.existsSync(p)) continue;
  const b64 = fs.readFileSync(p).toString('base64');
  const s = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const largura = Math.min(900, img.width);
    const c = document.createElement('canvas');
    c.width = largura; c.height = Math.round(largura * img.height / img.width);
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return { url: c.toDataURL('image/webp', 0.84), w: c.width, h: c.height };
  }, b64);
  const buf = Buffer.from(s.url.split(',')[1], 'base64');
  fs.writeFileSync(`../assets/${nome}.webp`, buf);
  console.log(`${nome}.webp ${s.w}x${s.h} ${(buf.length/1024).toFixed(0)} KB`);
}
await browser.close();
