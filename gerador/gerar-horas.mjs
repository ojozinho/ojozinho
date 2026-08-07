import fs from 'node:fs';
import { C, MONO } from './paleta-final.mjs';

/**
 * A que horas eu trabalho.
 *
 * Um relógio de 24 raios: cada raio é uma hora do dia e o comprimento dele é quanto código saiu
 * naquela hora. Sai da API de eventos do GitHub, que guarda os últimos noventa dias de atividade
 * pública, e conta os commits de cada push pelo horário de São Paulo.
 *
 * A escolha de contar por commit e não por push importa: um push com trinta commits e um push com
 * um commit contariam igual, e a madrugada em que se fecha um trabalho inteiro de uma vez sumiria
 * na média.
 *
 * Roda dentro do workflow, com GITHUB_TOKEN no ambiente.
 */

const USUARIO = process.env.USUARIO ?? 'ojozinho';
const TOKEN = process.env.GITHUB_TOKEN;
const SAIDA = process.env.SAIDA_HORAS ?? '../assets/horas.svg';

/** O fuso de quem trabalha, não o do servidor. Sem isto o gráfico conta o dia de Londres. */
const FUSO = 'America/Sao_Paulo';

async function buscarEventos() {
  const horas = new Array(24).fill(0);
  let total = 0;

  // A API entrega no máximo dez páginas de trinta. Mais que isso ela recusa, então o teto é 300
  // eventos, que é o que cabe nos últimos noventa dias.
  for (let pagina = 1; pagina <= 10; pagina++) {
    const r = await fetch(
      `https://api.github.com/users/${USUARIO}/events?per_page=100&page=${pagina}`,
      {
        headers: {
          Authorization: `bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'perfil-do-jozinho',
        },
      },
    );
    if (!r.ok) break;
    const lote = await r.json();
    if (!Array.isArray(lote) || lote.length === 0) break;

    for (const ev of lote) {
      if (ev.type !== 'PushEvent') continue;
      const quantos = ev.payload?.commits?.length ?? ev.payload?.size ?? 1;
      const hora = Number(
        new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          hour12: false,
          timeZone: FUSO,
        }).format(new Date(ev.created_at)),
      );
      if (Number.isFinite(hora)) {
        horas[hora % 24] += quantos;
        total += quantos;
      }
    }
    if (lote.length < 100) break;
  }

  return { horas, total };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const doisDigitos = (n) => String(n).padStart(2, '0');

function desenhar({ horas, total }) {
  const W = 1200;
  const H = 380;
  const cx = W / 2;
  const cy = 176;
  const raioInterno = 54;
  const raioMax = 138;
  const pico = Math.max(...horas, 1);

  // A hora com mais código. É o número que a peça inteira existe para dizer.
  const horaPico = horas.indexOf(pico);

  /**
   * A escala é de raiz quadrada, não linear.
   *
   * Numa escala linear, uma hora com trinta commits e outra com três viram um raio gigante ao lado
   * de um toco, e o formato do dia some. A raiz comprime o topo o suficiente para o desenho contar
   * o ritmo em vez de contar só o recorde.
   */
  const comprimento = (v) => raioInterno + Math.sqrt(v / pico) * (raioMax - raioInterno);

  const raios = horas
    .map((v, h) => {
      // O ângulo começa no topo, meia-noite, e anda no sentido do relógio.
      const ang = (h / 24) * Math.PI * 2 - Math.PI / 2;
      const r0 = raioInterno;
      const r1 = comprimento(v);
      const x0 = cx + Math.cos(ang) * r0;
      const y0 = cy + Math.sin(ang) * r0;
      const x1 = cx + Math.cos(ang) * r1;
      const y1 = cy + Math.sin(ang) * r1;
      const cor = v === 0 ? C.line : h === horaPico ? C.blue : C.green;
      const op = v === 0 ? 0.5 : 0.35 + (v / pico) * 0.65;
      return `  <line class="raio" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${cor}" stroke-width="9" stroke-linecap="round" opacity="${op.toFixed(2)}" style="animation-delay:${(h * 0.028).toFixed(3)}s"/>`;
    })
    .join('\n');

  // As marcas de 0, 6, 12 e 18 horas, para o relógio ser legível sem legenda.
  const marcas = [0, 6, 12, 18]
    .map((h) => {
      const ang = (h / 24) * Math.PI * 2 - Math.PI / 2;
      const r = raioMax + 20;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r + 4;
      return `  <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${C.smoke}">${doisDigitos(h)}h</text>`;
    })
    .join('\n');

  const vazio = total === 0;

  /*
    Os quatro períodos do dia, ladeando o relógio.

    O relógio sozinho num quadro de 1200 fica boiando: ele conta o formato do dia mas deixa a
    largura vazia dos dois lados. Os períodos preenchem esse espaço com o mesmo dado lido de outro
    jeito, que é a soma por faixa. Um diz o ritmo, o outro diz o volume.
  */
  const PERIODOS = [
    { nome: 'madrugada', de: 0, ate: 6, lado: 'esq', linha: 0 },
    { nome: 'manhã', de: 6, ate: 12, lado: 'esq', linha: 1 },
    { nome: 'tarde', de: 12, ate: 18, lado: 'dir', linha: 0 },
    { nome: 'noite', de: 18, ate: 24, lado: 'dir', linha: 1 },
  ];
  const somaPeriodo = (p) => horas.slice(p.de, p.ate).reduce((s, v) => s + v, 0);
  const maiorPeriodo = Math.max(...PERIODOS.map(somaPeriodo), 1);

  const blocos = PERIODOS.map((p, i) => {
    const v = somaPeriodo(p);
    const larguraBarra = 210;
    const x = p.lado === 'esq' ? 60 : W - 60 - larguraBarra;
    const y = cy - 46 + p.linha * 78;
    const w = Math.max(3, Math.round((v / maiorPeriodo) * larguraBarra));
    const bx = p.lado === 'esq' ? x : x + larguraBarra - w;
    const alinha = p.lado === 'esq' ? 'start' : 'end';
    const tx = p.lado === 'esq' ? x : x + larguraBarra;
    return `  <g class="bloco" style="animation-delay:${(0.5 + i * 0.11).toFixed(2)}s">
    <text x="${tx}" y="${y}" text-anchor="${alinha}" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${C.smoke}">${esc(p.nome.toUpperCase())}</text>
    <text x="${tx}" y="${y + 30}" text-anchor="${alinha}" font-family="${MONO}" font-size="24" font-weight="700" fill="${C.text}">${v}</text>
    <rect x="${x}" y="${y + 42}" width="${larguraBarra}" height="6" rx="3" fill="${C.line}" opacity="0.55"/>
    <rect x="${bx}" y="${y + 42}" width="${w}" height="6" rx="3" fill="${v === maiorPeriodo ? C.blue : C.green}"/>
  </g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="Commits por hora do dia; o pico é às ${doisDigitos(horaPico)} horas">
<title>A que horas o código sai</title>
<defs>
  <radialGradient id="nucleo" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.blue}" stop-opacity="0.22"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <filter id="g" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <style>
    @keyframes crescer { from { transform: scale(0.15); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes respirar { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
    @keyframes crescer2 { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    /* O raio cresce a partir do centro do relógio, e não do meio de si mesmo, senão ele brota
       para os dois lados. A origem da transformação em unidades do usuário resolve. */
    .raio { transform-origin: ${cx}px ${cy}px; animation: crescer .9s cubic-bezier(.2,.9,.2,1) both; }
    .nucleo { animation: respirar 4s ease-in-out infinite; }
    .bloco { animation: crescer2 .8s cubic-bezier(.2,.9,.2,1) both; }
    @media (prefers-reduced-motion: reduce) { .raio, .nucleo, .bloco { animation: none; opacity: 1; } }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${C.void}"/>

<circle class="nucleo" cx="${cx}" cy="${cy}" r="${raioMax + 40}" fill="url(#nucleo)"/>
<circle cx="${cx}" cy="${cy}" r="${raioInterno - 8}" fill="none" stroke="${C.line}" stroke-width="1"/>

${blocos}

${raios}
${marcas}

<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="${MONO}" font-size="26" font-weight="700" fill="${C.text}">${vazio ? '—' : doisDigitos(horaPico) + 'h'}</text>
<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="1.6" fill="${C.smoke}">${vazio ? 'SEM DADO' : 'O PICO'}</text>

<text x="${cx}" y="${H - 14}" text-anchor="middle" font-family="${MONO}" font-size="12.5" fill="${C.smoke}">${esc(
    vazio
      ? 'ainda não há atividade pública suficiente para desenhar o dia.'
      : `${total} commits nos últimos 90 dias, contados pelo horário de São Paulo.`,
  )}</text>

<rect width="${W}" height="${H}" filter="url(#g)" opacity="0.05" style="mix-blend-mode:overlay"/>
</svg>
`;
}

const dados = await buscarEventos();
fs.mkdirSync(SAIDA.replace(/\/[^/]+$/, ''), { recursive: true });
fs.writeFileSync(SAIDA, desenhar(dados));
console.log(`horas.svg escrito em ${SAIDA} | ${dados.total} commits`);
