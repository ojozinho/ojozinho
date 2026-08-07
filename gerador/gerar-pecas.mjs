import fs from 'node:fs';
import { paraCaminho } from './vetor.mjs';
import { C, MONO } from './paleta-final.mjs';

/**
 * As pecas menores do perfil.
 *
 * Mesma regra do cabecalho: nada externo. Cada arquivo aqui e autossuficiente, com as animacoes
 * em CSS dentro do proprio SVG, porque e assim que o GitHub vai servir.
 *
 * Uma coisa que NAO da para fazer e :hover. SVG dentro de <img> nao recebe ponteiro, entao um
 * botao que so acende quando o mouse passa por cima fica morto para sempre. Por isso todo estado
 * vivo aqui e animacao ociosa, que acontece sozinha.
 */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const grao = `  <filter id="g" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>`;

// ---------------------------------------------------------------------------
// Botoes de link
// ---------------------------------------------------------------------------

/**
 * Um botao. O contorno e desenhado por `stroke-dasharray` correndo em volta, que da a sensacao
 * de circuito ligado sem precisar de ponteiro.
 */
function botao({ nome, rotulo, cor, glifo, largura = 300 }) {
  const H = 64;
  const r = 14;
  const perimetro = 2 * (largura - 2 * r) + 2 * (H - 2 * r) + 2 * Math.PI * r;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${H}" width="${largura}" height="${H}" fill="none" role="img" aria-label="${esc(rotulo)}">
<title>${esc(rotulo)}</title>
<defs>
  <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${cor}" stop-opacity="0.20"/>
    <stop offset="1" stop-color="${cor}" stop-opacity="0.04"/>
  </linearGradient>
  <linearGradient id="v" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${cor}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${cor}" stop-opacity="0.5"/>
    <stop offset="1" stop-color="${cor}" stop-opacity="0"/>
  </linearGradient>
${grao}
  <clipPath id="c"><rect x="1" y="1" width="${largura - 2}" height="${H - 2}" rx="${r}"/></clipPath>
  <style>
    @keyframes correr { to { stroke-dashoffset: ${-Math.round(perimetro)}; } }
    @keyframes varrer { from { transform: translateX(${-largura}px); } to { transform: translateX(${largura}px); } }
    @keyframes respirar { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
    .fio  { stroke-dasharray: 90 ${Math.round(perimetro) - 90}; animation: correr 5.5s linear infinite; }
    .luz  { animation: varrer 5.5s linear infinite; }
    .seta { animation: respirar 2.4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .fio, .luz, .seta { animation: none; } }
  </style>
</defs>
<rect x="1" y="1" width="${largura - 2}" height="${H - 2}" rx="${r}" fill="url(#f)" stroke="${cor}" stroke-opacity="0.32"/>
<rect x="1" y="1" width="${largura - 2}" height="${H - 2}" rx="${r}" class="fio" stroke="${cor}" stroke-width="2"/>
<g clip-path="url(#c)"><rect class="luz" x="0" y="0" width="${largura}" height="${H}" fill="url(#v)"/></g>
<g transform="translate(24 ${H / 2 - 11})" fill="${cor}">${glifo}</g>
<text x="62" y="${H / 2 - 3}" font-family="${MONO}" font-size="10.5" letter-spacing="2.6" fill="${cor}" opacity="0.75">${esc(nome)}</text>
<text x="62" y="${H / 2 + 15}" font-family="${MONO}" font-size="14.5" font-weight="700" fill="${C.text}">${esc(rotulo)}</text>
<g class="seta" transform="translate(${largura - 34} ${H / 2 - 6})" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
  <path d="M0 6h11M6 1l5 5-5 5"/>
</g>
<rect width="${largura}" height="${H}" rx="${r}" filter="url(#g)" opacity="0.05" style="mix-blend-mode:overlay"/>
</svg>
`;
  return svg;
}

const GLIFO_INSTA =
  '<path d="M6.2 0h9.6A6.2 6.2 0 0 1 22 6.2v9.6a6.2 6.2 0 0 1-6.2 6.2H6.2A6.2 6.2 0 0 1 0 15.8V6.2A6.2 6.2 0 0 1 6.2 0Zm0 2.2A4 4 0 0 0 2.2 6.2v9.6a4 4 0 0 0 4 4h9.6a4 4 0 0 0 4-4V6.2a4 4 0 0 0-4-4H6.2Zm4.8 3.1a5.7 5.7 0 1 1 0 11.4 5.7 5.7 0 0 1 0-11.4Zm0 2.2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm6-3.05a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7Z"/>';

const GLIFO_LINKEDIN =
  '<path d="M2.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM.35 7.4h4.3V22H.35V7.4ZM8 7.4h4.12v2h.06c.57-1.08 1.97-2.22 4.06-2.22 4.34 0 5.14 2.86 5.14 6.58V22h-4.3v-6.36c0-1.52-.03-3.47-2.11-3.47-2.12 0-2.44 1.65-2.44 3.36V22H8V7.4Z"/>';

const GLIFO_GLOBO =
  '<path d="M11 0a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 2.2c1.2 0 2.7 2.1 3.3 5.5H7.7C8.3 4.3 9.8 2.2 11 2.2ZM5.5 7.7H2.9A8.9 8.9 0 0 1 7.5 3.1a14.6 14.6 0 0 0-2 4.6Zm-3.2 2.2h3a22 22 0 0 0 0 2.2h-3a8.8 8.8 0 0 1 0-2.2Zm.6 4.4h2.6c.4 1.7 1 3.3 2 4.6a8.9 8.9 0 0 1-4.6-4.6ZM11 19.8c-1.2 0-2.7-2.1-3.3-5.5h6.6c-.6 3.4-2.1 5.5-3.3 5.5Zm3.7-7.7H7.3a19 19 0 0 1 0-2.2h7.4a19 19 0 0 1 0 2.2Zm-.2 7.2c1-1.3 1.6-2.9 2-4.6h2.6a8.9 8.9 0 0 1-4.6 4.6Zm2.4-6.8a22 22 0 0 0 0-2.2h3a8.8 8.8 0 0 1 0 2.2h-3Zm-.4-4.4a14.6 14.6 0 0 0-2-4.6 8.9 8.9 0 0 1 4.6 4.6h-2.6Z"/>';

const GLIFO_EMAIL =
  '<path d="M2.4 2h17.2A2.4 2.4 0 0 1 22 4.4v13.2a2.4 2.4 0 0 1-2.4 2.4H2.4A2.4 2.4 0 0 1 0 17.6V4.4A2.4 2.4 0 0 1 2.4 2Zm.6 2.4 8 5.5 8-5.5H3Zm16.8 1.9-7.7 5.3a2.4 2.4 0 0 1-2.7 0L2.2 6.3v11.4h17.6V6.3Z"/>';

const links = [
  { arq: 'link-instagram.svg', nome: 'INSTAGRAM', rotulo: '@jozinho', cor: C.pink, glifo: GLIFO_INSTA },
  { arq: 'link-linkedin.svg', nome: 'LINKEDIN', rotulo: 'joão victor garcino', cor: C.blue, glifo: GLIFO_LINKEDIN },
  { arq: 'link-email.svg', nome: 'E-MAIL', rotulo: 'me manda um oi', cor: C.green, glifo: GLIFO_EMAIL },
];

// ---------------------------------------------------------------------------
// Marquise de ferramentas
// ---------------------------------------------------------------------------

const FERRAMENTAS = [
  'FIGMA', 'ILLUSTRATOR', 'PHOTOSHOP', 'AFTER EFFECTS', 'BLENDER',
  'REACT', 'TYPESCRIPT', 'TAILWIND', 'GSAP', 'MOTION',
  'FIREBASE', 'VITE', 'FRAMER', 'WEBFLOW', 'INDESIGN',
];

function stackSvg() {
  const W = 1200;
  const H = 92;
  const passo = 22;
  // A fita e desenhada duas vezes, lado a lado, e desliza exatamente a largura de uma copia. No
  // instante em que a primeira sai de cena a segunda esta no lugar exato dela, e o laco nao tem
  // emenda visivel.
  const item = (t, i) =>
    `<text x="${i * 250}" y="0" font-family="${MONO}" font-size="17" font-weight="700" letter-spacing="2.4" fill="${i % 3 === 0 ? C.blue : i % 3 === 1 ? C.text : C.purple}" opacity="${i % 3 === 1 ? 0.9 : 0.75}">${t}</text>` +
    `<circle cx="${i * 250 + 250 - 26}" cy="-6" r="3.5" fill="${C.pink}" opacity="0.7"/>`;
  const copia = FERRAMENTAS.map(item).join('');
  const larguraCopia = FERRAMENTAS.length * 250;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="Ferramentas: ${esc(FERRAMENTAS.join(', '))}">
<title>Ferramentas do dia a dia</title>
<defs>
  <linearGradient id="borda" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.void}"/>
    <stop offset="0.08" stop-color="${C.void}" stop-opacity="0"/>
    <stop offset="0.92" stop-color="${C.void}" stop-opacity="0"/>
    <stop offset="1" stop-color="${C.void}"/>
  </linearGradient>
${grao}
  <style>
    @keyframes fita { from { transform: translateX(0); } to { transform: translateX(${-larguraCopia}px); } }
    .fita { animation: fita ${passo}s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .fita { animation: none; } }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${C.void}"/>
<line x1="0" y1="0.5" x2="${W}" y2="0.5" stroke="${C.text}" stroke-opacity="0.07"/>
<line x1="0" y1="${H - 0.5}" x2="${W}" y2="${H - 0.5}" stroke="${C.text}" stroke-opacity="0.07"/>
<g transform="translate(0 ${H / 2 + 6})">
  <g class="fita">${copia}<g transform="translate(${larguraCopia} 0)">${copia}</g></g>
</g>
<rect width="${W}" height="${H}" fill="url(#borda)"/>
<rect width="${W}" height="${H}" filter="url(#g)" opacity="0.05" style="mix-blend-mode:overlay"/>
</svg>
`;
}

// ---------------------------------------------------------------------------
// Divisor
// ---------------------------------------------------------------------------

function divisorSvg(titulo) {
  const W = 1200;
  const H = 64;
  const t = paraCaminho(titulo, 30, { tracking: 1 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="${esc(titulo)}">
<title>${esc(titulo)}</title>
<defs>
  <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.blue}"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </linearGradient>
  <style>
    @keyframes bater { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: 1; transform: scale(1.35); } }
    .pt { transform-origin: center; transform-box: fill-box; animation: bater 2.8s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .pt { animation: none; } }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${C.void}"/>
<circle class="pt" cx="12" cy="${H / 2}" r="5" fill="${C.blue}"/>
<path d="${t.d}" transform="translate(30 ${H / 2 + 11})" fill="${C.text}"/>
<rect x="${Math.round(t.largura) + 50}" y="${H / 2 - 1}" width="${W - Math.round(t.largura) - 66}" height="2" fill="url(#l)"/>
</svg>
`;
}

// ---------------------------------------------------------------------------

fs.mkdirSync('../assets', { recursive: true });

for (const l of links) {
  fs.writeFileSync(`../assets/${l.arq}`, botao(l));
}
fs.writeFileSync('../assets/stack.svg', stackSvg());

const secoes = [
  ['div-stack.svg', 'ferramentas'],
  ['div-horas.svg', 'a que horas'],
  ['div-numeros.svg', 'números'],
  ['div-fala.svg', 'me chama'],
];
for (const [arq, titulo] of secoes) {
  fs.writeFileSync(`../assets/${arq}`, divisorSvg(titulo));
}

const total = fs
  .readdirSync('../assets')
  .filter((f) => f.endsWith('.svg'))
  .reduce((s, f) => s + fs.statSync(`../assets/${f}`).size, 0);
console.log(`${fs.readdirSync('../assets').filter((f) => f.endsWith('.svg')).length} svg | ${(total / 1024).toFixed(1)} KB no total`);
