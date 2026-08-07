import fs from 'node:fs';
import { paraCaminho } from './vetor.mjs';
import { C, MONO } from './paleta-final.mjs';

/**
 * O cabecalho.
 *
 * A ideia vem da ilustracao: um vagao de metro a noite, com a luz das estacoes passando pela
 * janela. As barras quentes que atravessam a tela sao essa luz, e o brilho que corre por dentro
 * das letras e o reflexo dela na tipografia.
 *
 * Tudo aqui e feito a mao e roda sem depender de nada externo. SVG servido pelo GitHub abre em
 * modo estatico seguro: script nao roda, fonte web nao carrega, imagem externa nao carrega. Por
 * isso o display e contorno vetorial e as animacoes sao CSS puro dentro do proprio arquivo.
 */

const W = 1200;
const H = 460;
const nome = paraCaminho('JOZINHO', 208, { tracking: -6 });
const nomeX = Math.round((W - nome.largura) / 2);
const nomeY = 268;

/**
 * Largura da linha digitada, calculada e nao chutada.
 *
 * A monoespacada avanca 0.6em por caractere em praticamente toda familia da pilha, entao a conta
 * fecha sem precisar medir no navegador. Serve para tres coisas ao mesmo tempo: onde a cortina do
 * efeito de digitacao para, quantos passos ela da, e onde o cursor fica piscando no fim. Chutar
 * qualquer um dos tres deixa o cursor solto no meio da frase.
 */
const LINHA_PX = 19;
const larguraLinha = (texto) => Math.round(texto.length * LINHA_PX * 0.6);

// As barras de luz que atravessam. Posicao e atraso escolhidos a mao para nao virar padrao obvio.
const barras = [
  { x: -180, w: 90, o: 0.16, d: 0, dur: 7.5 },
  { x: -320, w: 34, o: 0.1, d: 1.1, dur: 9 },
  { x: -60, w: 150, o: 0.07, d: 2.4, dur: 11 },
  { x: -420, w: 60, o: 0.13, d: 3.7, dur: 8.2 },
  { x: -240, w: 22, o: 0.18, d: 5.0, dur: 6.4 },
];

const KICKER = 'WEB DESIGNER  ·  UI / UX  ·  SÃO PAULO, BR';
const LINHA = 'design que resolve, não que enfeita.';
const LINHA_W = larguraLinha(LINHA);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="JOZINHO — web designer, UI/UX, São Paulo">
<title>JOZINHO — web designer · UI/UX</title>
<defs>
  <linearGradient id="ceu" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.ink}"/>
    <stop offset="0.55" stop-color="${C.void}"/>
    <stop offset="1" stop-color="#14100c"/>
  </linearGradient>

  <radialGradient id="brilho" cx="0.5" cy="0.62" r="0.72">
    <stop offset="0" stop-color="${C.rust}" stop-opacity="0.26"/>
    <stop offset="0.5" stop-color="${C.rust}" stop-opacity="0.07"/>
    <stop offset="1" stop-color="${C.rust}" stop-opacity="0"/>
  </radialGradient>

  <linearGradient id="tinta" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.amber}"/>
    <stop offset="0.32" stop-color="${C.ember}"/>
    <stop offset="0.62" stop-color="${C.cream}"/>
    <stop offset="1" stop-color="${C.amber}"/>
    <animate attributeName="x1" values="-1;0;-1" dur="9s" repeatCount="indefinite"/>
    <animate attributeName="x2" values="0;1;0" dur="9s" repeatCount="indefinite"/>
  </linearGradient>

  <linearGradient id="lampejo" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.45" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>

  <linearGradient id="feixe" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.amber}" stop-opacity="0"/>
    <stop offset="0.35" stop-color="${C.amber}" stop-opacity="1"/>
    <stop offset="0.7" stop-color="${C.ember}" stop-opacity="1"/>
    <stop offset="1" stop-color="${C.ember}" stop-opacity="0"/>
  </linearGradient>

  <filter id="graos" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>

  <filter id="halo" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="9" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <clipPath id="recorteNome">
    <path d="${nome.d}" transform="translate(${nomeX} ${nomeY})"/>
  </clipPath>

  <clipPath id="revelaLinha">
    <rect id="cortina" x="${nomeX + 4}" y="0" width="0" height="${H}"/>
  </clipPath>

  <style>
    @keyframes correr { from { transform: translateX(0); } to { transform: translateX(${W + 500}px); } }
    @keyframes varrer { from { transform: translateX(-420px); } to { transform: translateX(${W + 120}px); } }
    @keyframes pulsar { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes piscar { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
    @keyframes surgir { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes esticar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes digitar { from { width: 0; } to { width: ${LINHA_W}px; } }
    @keyframes tremer { 0%,100% { opacity: 0.055; } 50% { opacity: 0.085; } }

    .barra   { animation: correr linear infinite; }
    .lampejo { animation: varrer 6s cubic-bezier(.6,0,.35,1) infinite; }
    .kicker  { animation: surgir .9s ease-out both; }
    .regua   { transform-origin: left center; animation: esticar 1.4s cubic-bezier(.2,.8,.2,1) .35s both; }
    .cursor  { animation: piscar 1.05s steps(1) infinite; }
    .ponto   { animation: pulsar 2.6s ease-in-out infinite; }
    .grao    { animation: tremer 4s ease-in-out infinite; }
    #cortina { animation: digitar 2.6s steps(${LINHA.length}) .7s both; }

    /* Quem pede menos movimento recebe menos movimento. Nao e acessibilidade decorativa: existe
       gente que sente enjoo com coisa deslizando na tela. */
    @media (prefers-reduced-motion: reduce) {
      .barra, .lampejo, .kicker, .regua, .cursor, .ponto, .grao, #cortina { animation: none; }
      #cortina { width: ${LINHA_W}px; }
    }
  </style>
</defs>

<rect width="${W}" height="${H}" fill="url(#ceu)"/>
<rect width="${W}" height="${H}" fill="url(#brilho)"/>

<!-- A luz das estacoes passando pela janela do vagao. -->
<g opacity="0.9">
${barras
  .map(
    (b) =>
      `  <rect class="barra" x="${b.x}" y="0" width="${b.w}" height="${H}" fill="url(#feixe)" opacity="${b.o}" style="animation-duration:${b.dur}s;animation-delay:-${b.d}s"/>`,
  )
  .join('\n')}
</g>

<!-- Trilhos horizontais, o piso do vagao. -->
<g stroke="${C.cream}" stroke-opacity="0.06">
  <line x1="0" y1="${nomeY + 26}" x2="${W}" y2="${nomeY + 26}"/>
  <line x1="0" y1="${nomeY + 34}" x2="${W}" y2="${nomeY + 34}"/>
</g>

<g class="kicker">
  <circle class="ponto" cx="${nomeX + 4}" cy="${nomeY - 172}" r="5" fill="${C.moss}"/>
  <text x="${nomeX + 18}" y="${nomeY - 167}" font-family="${MONO}" font-size="15" letter-spacing="4.2" fill="${C.smoke}">${KICKER}</text>
</g>

<!-- O nome, em contorno. O gradiente anda por dentro e o lampejo corre por cima, recortado pela
     propria forma das letras. -->
<g filter="url(#halo)">
  <path d="${nome.d}" transform="translate(${nomeX} ${nomeY})" fill="url(#tinta)"/>
</g>
<g clip-path="url(#recorteNome)">
  <rect class="lampejo" x="0" y="0" width="420" height="${H}" fill="url(#lampejo)" opacity="0.55"/>
</g>

<rect class="regua" x="${nomeX}" y="${nomeY + 30}" width="${Math.round(nome.largura)}" height="3" fill="${C.rust}"/>

<g clip-path="url(#revelaLinha)">
  <text x="${nomeX + 4}" y="${nomeY + 88}" font-family="${MONO}" font-size="19" fill="${C.cream}" opacity="0.92">${LINHA}</text>
</g>
<rect class="cursor" x="${nomeX + 8 + LINHA_W}" y="${nomeY + 72}" width="11" height="21" fill="${C.ember}"/>

<rect class="grao" width="${W}" height="${H}" filter="url(#graos)" opacity="0.07" style="mix-blend-mode:overlay"/>
</svg>
`;

fs.writeFileSync('../assets/hero.svg', svg);
console.log('hero.svg', (svg.length / 1024).toFixed(1) + ' KB | nome largura', Math.round(nome.largura));
