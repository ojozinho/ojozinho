import fs from 'node:fs';
import { paraCaminho } from './vetor.mjs';
import { C, MONO } from './paleta-final.mjs';

/**
 * O cabeçalho.
 *
 * Três ideias somadas, todas refeitas à mão em SVG:
 *
 *   O nome ocupando a largura inteira, pesado e apertado, sem margem para respirar. É o único
 *   elemento grande da página e não divide atenção com nada.
 *
 *   Fitas de luz curvas passando atrás, borradas, nas cores do próprio GitHub. Elas dobram de
 *   verdade: o `d` do caminho é interpolado por SMIL entre três desenhos com a mesma estrutura de
 *   comandos, que é o que permite a morfose sem script.
 *
 *   Uma linha embaixo onde as palavras ficam borradas menos uma, e um par de colchetes desliza de
 *   uma para a outra. O foco anda sozinho, em laço.
 *
 * Tudo roda sem depender de nada externo. SVG servido pelo GitHub abre em modo estático seguro:
 * script não roda, fonte web não carrega, imagem externa não carrega. Por isso o display é
 * contorno vetorial e as animações são CSS e SMIL dentro do próprio arquivo.
 */

const W = 1200;
const H = 440;

// ---------------------------------------------------------------------------
// O nome, ocupando a largura toda
// ---------------------------------------------------------------------------

/**
 * Acha o corpo de fonte que faz o nome chegar na largura pedida.
 *
 * A alternativa seria escalar o caminho com `transform`, mas aí o `tracking` escalaria junto e o
 * espacejamento sairia diferente do que foi ajustado. Medindo e regerando, o entrelinhamento fica
 * exatamente como desenhado em qualquer largura.
 */
function ajustarAoLargo(texto, alvoLargura, tracking) {
  let corpo = 200;
  for (let i = 0; i < 24; i++) {
    const m = paraCaminho(texto, corpo, { tracking: tracking * (corpo / 200) });
    const erro = alvoLargura / m.largura;
    if (Math.abs(erro - 1) < 0.001) return { ...m, corpo };
    corpo *= erro;
  }
  const m = paraCaminho(texto, corpo, { tracking: tracking * (corpo / 200) });
  return { ...m, corpo };
}

const MARGEM = 40;
const nome = ajustarAoLargo('JOZINHO', W - MARGEM * 2, -7);
const nomeY = 268;

// ---------------------------------------------------------------------------
// A linha de foco
// ---------------------------------------------------------------------------

/**
 * A frase da linha de foco.
 *
 * Era uma lista de disciplinas: design, interface, produto, marca. Bonita e vazia, do tipo que
 * cabe em qualquer perfil de qualquer pessoa. Estas tres palavras sao as etapas do trabalho de
 * verdade, na ordem em que acontecem, e o foco passando por elas conta o processo em vez de
 * enfeitar a tela.
 */
const PALAVRAS = ['desenho.', 'construo.', 'confiro.'];
const CORPO_PALAVRA = 34;
const VAO = 40;

// Cada palavra vira caminho e guarda a própria largura, que é o que os colchetes seguem.
const medidas = PALAVRAS.map((p) => paraCaminho(p, CORPO_PALAVRA, { tracking: -0.4 }));
const larguraLinha =
  medidas.reduce((s, m) => s + m.largura, 0) + VAO * (PALAVRAS.length - 1);
const linhaX0 = Math.round((W - larguraLinha) / 2);
const linhaY = 372;

let cursor = linhaX0;
const palavras = medidas.map((m, i) => {
  const x = cursor;
  cursor += m.largura + VAO;
  return { d: m.d, x: Math.round(x), largura: Math.round(m.largura), i };
});

/** Um ciclo completo do foco. Cada palavra fica no foco por uma fatia igual. */
const CICLO = PALAVRAS.length * 2.4;
const fatia = 100 / PALAVRAS.length;
/** Quanto da fatia é gasto entrando e saindo do foco, em pontos percentuais do ciclo. */
const RAMPA = fatia * 0.18;

/**
 * Os quadros de nitidez de uma palavra.
 *
 * Ela nasce borrada, fica nítida durante a própria fatia e volta a borrar. Os `%` são do ciclo
 * inteiro, não da fatia, porque é um laço só governando todas as palavras ao mesmo tempo.
 */
function quadrosDeFoco(i) {
  const ini = i * fatia;
  const fim = ini + fatia;
  const em = (v) => `${Math.max(0, Math.min(100, v)).toFixed(2)}%`;
  return [
    `0%,${em(ini - RAMPA)} { filter: blur(4.5px); opacity: .42; }`,
    `${em(ini)},${em(fim - RAMPA)} { filter: blur(0); opacity: 1; }`,
    `${em(fim)},100% { filter: blur(4.5px); opacity: .42; }`,
  ].join(' ');
}

/** Os quadros de posição dos colchetes: eles pousam em cada palavra na vez dela. */
function quadrosDeColchete(lado) {
  return palavras
    .map((p) => {
      const ini = p.i * fatia;
      const fim = ini + fatia;
      const x = lado === 'esq' ? p.x - 14 : p.x + p.largura + 14;
      return `${(ini).toFixed(2)}%,${(fim - RAMPA).toFixed(2)}% { transform: translateX(${Math.round(x)}px); }`;
    })
    .join(' ');
}

// ---------------------------------------------------------------------------
// As fitas de luz
// ---------------------------------------------------------------------------

/**
 * Três desenhos da mesma fita, com a MESMA sequência de comandos.
 *
 * SMIL só interpola `d` quando os caminhos têm estrutura idêntica: mesma quantidade de comandos,
 * na mesma ordem. Mudando isso, a animação simplesmente pula de um desenho para o outro em vez de
 * dobrar. É a única regra que importa aqui.
 */
function fita(base, amplitude) {
  const y = base;
  return [
    `M-200 ${y} C 200 ${y - amplitude}, 500 ${y + amplitude}, 800 ${y - amplitude * 0.6} S 1200 ${y + amplitude * 0.4}, 1500 ${y}`,
    `M-200 ${y + amplitude * 0.5} C 200 ${y + amplitude * 0.8}, 500 ${y - amplitude}, 800 ${y + amplitude * 0.9} S 1200 ${y - amplitude * 0.7}, 1500 ${y - amplitude * 0.3}`,
    `M-200 ${y - amplitude * 0.4} C 200 ${y - amplitude * 0.3}, 500 ${y + amplitude * 0.7}, 800 ${y - amplitude} S 1200 ${y + amplitude}, 1500 ${y + amplitude * 0.2}`,
  ];
}

const FITAS = [
  { cor: C.blue, base: 160, amp: 130, largura: 120, dur: 19, opacidade: 0.95 },
  { cor: C.purple, base: 255, amp: 160, largura: 92, dur: 25, opacidade: 0.8 },
  { cor: C.lime, base: 330, amp: 110, largura: 56, dur: 31, opacidade: 0.55 },
];

const svgFitas = FITAS.map((f, i) => {
  const [a, b, c] = fita(f.base, f.amp);
  return `  <path d="${a}" stroke="url(#fita${i})" stroke-width="${f.largura}" stroke-linecap="round" fill="none" opacity="${f.opacidade}" filter="url(#desfoque)">
    <animate attributeName="d" dur="${f.dur}s" repeatCount="indefinite" calcMode="spline"
      keyTimes="0;0.33;0.66;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
      values="${a};${b};${c};${a}"/>
  </path>`;
}).join('\n');

const gradientesFita = FITAS.map(
  (f, i) => `  <linearGradient id="fita${i}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${f.cor}" stop-opacity="0"/>
    <stop offset="0.4" stop-color="${f.cor}" stop-opacity="1"/>
    <stop offset="0.62" stop-color="${f.cor}" stop-opacity="0.85"/>
    <stop offset="1" stop-color="${f.cor}" stop-opacity="0"/>
    <animate attributeName="x1" dur="${f.dur * 0.7}s" repeatCount="indefinite" values="-0.6;0.5;-0.6"/>
    <animate attributeName="x2" dur="${f.dur * 0.7}s" repeatCount="indefinite" values="0.4;1.5;0.4"/>
  </linearGradient>`,
).join('\n');

// ---------------------------------------------------------------------------

const COLCHETE = 13;
const canto = (dx, dy, sx, sy) =>
  `<path d="M0 ${COLCHETE}V0h${COLCHETE}" transform="translate(${dx} ${dy}) scale(${sx} ${sy})" stroke="${C.blue}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="JOZINHO — desenho, construo, confiro">
<title>JOZINHO</title>
<defs>
${gradientesFita}

  <linearGradient id="tinta" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset="1" stop-color="${C.text}"/>
  </linearGradient>

  <linearGradient id="lampejo" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.blue}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${C.blue}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </linearGradient>

  <linearGradient id="veu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.void}" stop-opacity="0"/>
    <stop offset="0.42" stop-color="${C.void}" stop-opacity="0.88"/>
    <stop offset="0.72" stop-color="${C.void}" stop-opacity="0.88"/>
    <stop offset="1" stop-color="${C.void}" stop-opacity="0"/>
  </linearGradient>

  <filter id="desfoque" x="-30%" y="-120%" width="160%" height="340%">
    <feGaussianBlur stdDeviation="30"/>
  </filter>

  <filter id="graos" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>

  <clipPath id="recorteNome">
    <path d="${nome.d}" transform="translate(${MARGEM} ${nomeY})"/>
  </clipPath>

  <style>
    @keyframes varrer { from { transform: translateX(-460px); } to { transform: translateX(${W + 160}px); } }
    @keyframes surgir { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulsar { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
    @keyframes tremer { 0%,100% { opacity: .05; } 50% { opacity: .08; } }
${palavras.map((p) => `    @keyframes foco${p.i} { ${quadrosDeFoco(p.i)} }`).join('\n')}
    @keyframes colcheteEsq { ${quadrosDeColchete('esq')} }
    @keyframes colcheteDir { ${quadrosDeColchete('dir')} }

    .lampejo  { animation: varrer 7s cubic-bezier(.55,0,.35,1) infinite; }
    .kicker   { animation: surgir .9s ease-out both; }
    .ponto    { animation: pulsar 2.6s ease-in-out infinite; }
    .grao     { animation: tremer 4s ease-in-out infinite; }
${palavras.map((p) => `    .p${p.i} { animation: foco${p.i} ${CICLO}s cubic-bezier(.4,0,.2,1) infinite; }`).join('\n')}
    .colEsq   { animation: colcheteEsq ${CICLO}s cubic-bezier(.5,0,.2,1) infinite; }
    .colDir   { animation: colcheteDir ${CICLO}s cubic-bezier(.5,0,.2,1) infinite; }

    /* Quem pede menos movimento recebe menos movimento. Não é acessibilidade decorativa: existe
       gente que sente enjoo com coisa deslizando na tela. Sem animação, todas as palavras ficam
       nítidas de uma vez, que é o estado que informa. */
    @media (prefers-reduced-motion: reduce) {
      .lampejo, .kicker, .ponto, .grao, .colEsq, .colDir${palavras.map((p) => `, .p${p.i}`).join('')} { animation: none; }
${palavras.map((p) => `      .p${p.i} { filter: none; opacity: 1; }`).join('\n')}
      .colEsq, .colDir { opacity: 0; }
    }
  </style>
</defs>

<rect width="${W}" height="${H}" fill="${C.void}"/>

<!-- As fitas dobrando atrás de tudo. -->
<g>
${svgFitas}
</g>

<g class="kicker">
  <circle class="ponto" cx="${MARGEM + 4}" cy="${nomeY - 214}" r="4.5" fill="${C.green}"/>
  <text x="${MARGEM + 18}" y="${nomeY - 209}" font-family="${MONO}" font-size="14" letter-spacing="4" fill="${C.smoke}">WEB DESIGNER · UI / UX · SÃO PAULO, BR</text>
</g>

<!-- O nome. O lampejo corre por cima, recortado pela própria forma das letras. -->
<path d="${nome.d}" transform="translate(${MARGEM} ${nomeY})" fill="url(#tinta)"/>
<g clip-path="url(#recorteNome)">
  <rect class="lampejo" x="0" y="0" width="460" height="${H}" fill="url(#lampejo)"/>
</g>

<!--
  Um véu escuro só atrás da linha de foco.

  As fitas passam por ali e deixam a palavra nítida competindo com um fundo aceso, o que estraga
  exatamente o efeito que a linha existe para produzir. O véu é um degradê que nasce e morre em
  transparente, então ele apaga a luz onde o texto está sem desenhar uma faixa visível.
-->
<rect x="0" y="${linhaY - 62}" width="${W}" height="104" fill="url(#veu)"/>

<!-- A linha de foco: tudo borrado menos uma palavra, e os colchetes deslizando entre elas. -->
<g>
${palavras
  .map(
    (p) =>
      `  <path class="p${p.i}" d="${p.d}" transform="translate(${p.x} ${linhaY})" fill="${C.text}"/>`,
  )
  .join('\n')}
  <g class="colEsq">
    ${canto(0, linhaY - 34, 1, 1)}
    ${canto(0, linhaY + 12, 1, -1)}
  </g>
  <g class="colDir">
    ${canto(0, linhaY - 34, -1, 1)}
    ${canto(0, linhaY + 12, -1, -1)}
  </g>
</g>

<rect class="grao" width="${W}" height="${H}" filter="url(#graos)" opacity="0.06" style="mix-blend-mode:overlay"/>
</svg>
`;

fs.writeFileSync('../assets/hero.svg', svg);
console.log(
  `hero.svg ${(svg.length / 1024).toFixed(1)} KB | nome ${Math.round(nome.largura)}px @ corpo ${nome.corpo.toFixed(0)} | linha ${Math.round(larguraLinha)}px`,
);
