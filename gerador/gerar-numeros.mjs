import fs from 'node:fs';
import { C, MONO } from './paleta-final.mjs';

/**
 * O cartao de numeros, desenhado aqui em vez de vir pronto de fora.
 *
 * A versao anterior deste perfil usava o github-readme-stats, que e o cartao que todo mundo usa.
 * Na primeira conferida ele respondeu `503 DEPLOYMENT_PAUSED`: o servico saiu do ar de vez. Um
 * perfil que depende de um servidor de terceiro para mostrar os proprios numeros e um perfil que
 * um dia amanhece com dois retangulos quebrados no meio, e nao ha aviso nenhum quando isso
 * acontece.
 *
 * Entao os numeros vem da API do proprio GitHub, dentro de uma Action, e o SVG e desenhado aqui
 * com a mesma paleta do resto. Some a dependencia e some tambem a estetica de template.
 *
 * Roda dentro do workflow, com GITHUB_TOKEN no ambiente.
 */

const USUARIO = process.env.USUARIO ?? 'ojozinho';
const TOKEN = process.env.GITHUB_TOKEN;
const SAIDA = process.env.SAIDA ?? '../assets/numeros.svg';

const CONSULTA = `
query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar { totalContributions }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        stargazerCount
      }
    }
  }
}`;

async function buscar() {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'perfil-do-jozinho',
    },
    body: JSON.stringify({ query: CONSULTA, variables: { login: USUARIO } }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data.user;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const compacto = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n));

function desenhar(u) {
  const cc = u.contributionsCollection;
  const estrelas = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

  /*
    Só entra o que tem número.

    Cartão zerado não informa nada e ainda ocupa o mesmo espaço de um cheio. Os dois primeiros
    ficam sempre, porque são o que a página é; o resto aparece quando passar de zero e some de
    novo se voltar. Assim o cartão se ajusta sozinho conforme a conta cresce, sem ninguém ter que
    vir aqui editar lista.
  */
  const todos = [
    { valor: cc.contributionCalendar.totalContributions + cc.restrictedContributionsCount, rotulo: 'contribuições no ano', cor: C.blue, fixo: true },
    { valor: cc.totalCommitContributions, rotulo: 'commits', cor: C.purple, fixo: true },
    { valor: u.repositories.totalCount, rotulo: 'repositórios', cor: C.text },
    { valor: cc.totalPullRequestContributions, rotulo: 'pull requests', cor: C.green },
    { valor: estrelas, rotulo: 'estrelas', cor: C.pink },
    { valor: u.followers.totalCount, rotulo: 'seguidores', cor: C.lime },
  ];
  const cartoes = todos.filter((c) => c.fixo || c.valor > 0);

  const W = 1200;
  const H = 148;
  const larg = 176;
  const vao = 24;
  const total = cartoes.length * larg + (cartoes.length - 1) * vao;
  const x0 = Math.round((W - total) / 2);

  const blocos = cartoes
    .map((c, i) => {
      const x = x0 + i * (larg + vao);
      return `  <g class="carta" style="animation-delay:${(i * 0.08).toFixed(2)}s">
    <rect x="${x}" y="12" width="${larg}" height="92" rx="14" fill="${c.cor}" fill-opacity="0.10" stroke="${c.cor}" stroke-opacity="0.28"/>
    <text x="${x + 18}" y="66" font-family="${MONO}" font-size="34" font-weight="700" fill="${c.cor}">${compacto(c.valor)}</text>
    <text x="${x + 18}" y="88" font-family="${MONO}" font-size="11" fill="${C.smoke}">${esc(c.rotulo)}</text>
  </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="Números do GitHub de ${esc(USUARIO)}">
<title>Os números, direto da API do GitHub</title>
<defs>
  <filter id="g" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <style>
    @keyframes subir { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    .carta { animation: subir .7s cubic-bezier(.2,.8,.2,1) both; }
    @media (prefers-reduced-motion: reduce) { .carta { animation: none; } }
  </style>
</defs>
<rect width="${W}" height="${H}" fill="${C.void}"/>
${blocos}
<rect width="${W}" height="${H}" filter="url(#g)" opacity="0.05" style="mix-blend-mode:overlay"/>
</svg>
`;
}

const usuario = await buscar();
fs.mkdirSync(SAIDA.replace(/\/[^/]+$/, ''), { recursive: true });
fs.writeFileSync(SAIDA, desenhar(usuario));
console.log(`numeros.svg escrito em ${SAIDA}`);
