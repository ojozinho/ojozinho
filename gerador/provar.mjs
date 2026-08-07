import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Renderiza cada SVG do jeito que o GitHub renderiza: dentro de uma <img>.
 *
 * Isso importa. SVG dentro de <img> abre em modo estatico seguro: script nao roda, fonte web nao
 * carrega, imagem externa nao carrega. Abrir o arquivo direto no navegador NAO prova nada, porque
 * ali essas restricoes nao valem e um SVG quebrado no README aparece perfeito. O teste tem que
 * ser feito na mesma caixa em que a coisa vai viver.
 *
 * Uso: node provar.mjs [ms de espera antes do print]
 */
const DIR = '../assets';
const ESPERA = Number(process.argv[2] ?? 2600);
const arquivos = fs.readdirSync(DIR).filter((f) => f.endsWith('.svg'));

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

fs.mkdirSync('prova', { recursive: true });

for (const arq of arquivos) {
  const b64 = fs.readFileSync(path.join(DIR, arq)).toString('base64');
  await page.setContent(
    `<body style="margin:0;background:#0d1117;display:flex;align-items:center;justify-content:center;min-height:100vh">
       <img id="alvo" src="data:image/svg+xml;base64,${b64}" style="display:block">
     </body>`,
  );
  await page.waitForTimeout(ESPERA);
  const caixa = await page.locator('#alvo').boundingBox();
  await page.locator('#alvo').screenshot({ path: `prova/${arq.replace('.svg', '')}.png` });
  console.log(`${arq.padEnd(16)} ${Math.round(caixa.width)}x${Math.round(caixa.height)}`);
}

await browser.close();
