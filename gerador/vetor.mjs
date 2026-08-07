import opentype from 'opentype.js';
import fs from 'node:fs';

/**
 * Texto vira contorno vetorial.
 *
 * SVG carregado pelo GitHub roda em modo estatico seguro: script nao executa e recurso externo
 * nao carrega, fonte web inclusive. Ou a fonte vai embutida em base64, que engorda o arquivo em
 * centenas de kilobytes, ou o texto vira contorno. Contorno e menor, renderiza igual em qualquer
 * navegador, e nao depende de nada.
 */
const fonte = opentype.parse(fs.readFileSync('fontes/static/BricolageGrotesque-ExtraBold.ttf').buffer);

export function paraCaminho(texto, tamanho, { tracking = 0 } = {}) {
  // opentype nao aplica tracking, entao cada glifo e posicionado a mao.
  let x = 0;
  const partes = [];
  // charToGlyph por caractere pula a camada de shaping do opentype, que estoura com as tabelas
  // GSUB da Bricolage. Para caixa alta latina o resultado e identico.
  const glifos = [...texto].map((ch) => fonte.charToGlyph(ch));
  for (let i = 0; i < glifos.length; i++) {
    const g = glifos[i];
    const p = g.getPath(x, 0, tamanho);
    partes.push(p.toPathData(2));
    x += (g.advanceWidth / fonte.unitsPerEm) * tamanho + tracking;
    if (i + 1 < glifos.length) {
      const k = fonte.getKerningValue(g, glifos[i + 1]);
      x += (k / fonte.unitsPerEm) * tamanho;
    }
  }
  return { d: partes.join(' '), largura: x - tracking };
}

if (process.argv[2]) {
  const r = paraCaminho(process.argv[2], Number(process.argv[3] ?? 200), { tracking: Number(process.argv[4] ?? 0) });
  console.log('largura', Math.round(r.largura));
  fs.writeFileSync('ultimo.path', r.d);
  console.log('bytes', r.d.length);
}
