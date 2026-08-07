import fs from 'node:fs';
import opentype from 'opentype.js';
import { C } from './paleta-final.mjs';

/**
 * A marca: um J em negativo, vazado num campo azul.
 *
 * O desenho é subtrativo. Não existe um J desenhado por cima do azul: existe um retângulo azul do
 * qual o J foi removido, e o que se lê como letra é o buraco. Em SVG isso é um caminho só, com o
 * contorno do retângulo e o contorno do J dentro dele, resolvido por `fill-rule="evenodd"`: onde
 * os dois se sobrepõem, o preenchimento se cancela.
 *
 * Vazar de verdade importa mais do que parece. Um J pintado de escuro por cima do azul exigiria
 * saber de que cor é o fundo, e sobre qualquer outra cor o truque apareceria. Vazado, o buraco
 * mostra o que estiver atrás, seja o que for.
 */

const FONTE = opentype.parse(
  fs.readFileSync('fontes/static/BricolageGrotesque-ExtraBold.ttf').buffer,
);

/**
 * Encaixa o J no quadro.
 *
 * O glifo é medido pela caixa que a tinta ocupa de verdade, e não pelo avanço da fonte. O avanço
 * inclui o espaço lateral que a letra guarda para conviver com as vizinhas numa palavra, e aqui
 * não há vizinha nenhuma: usar o avanço deixaria o J flutuando fora do centro, com uma folga de
 * um lado que não existe do outro.
 */
function jEncaixado(lado, margem) {
  const util = lado - margem * 2;
  const bb = FONTE.charToGlyph('J').getPath(0, 0, 1000).getBoundingBox();

  // O J é duas vezes mais alto que largo, então quem manda no tamanho é a altura.
  const corpo = 1000 * (util / (bb.y2 - bb.y1));

  // Mede de novo no corpo final em vez de multiplicar a medida antiga pela escala. A fonte tem
  // um eixo óptico, e o desenho da letra muda um pouco de um corpo para outro.
  const b2 = FONTE.charToGlyph('J').getPath(0, 0, corpo).getBoundingBox();
  const dx = margem + (util - (b2.x2 - b2.x1)) / 2 - b2.x1;
  const dy = margem - b2.y1;

  // `getPath` já aceita o deslocamento, então o caminho sai posicionado e pode entrar no mesmo
  // `d` da moldura sem passar por nenhuma transformação depois. Isso importa: `fill-rule` só
  // cancela o que está no mesmo caminho, e um `<g transform>` em volta manteria os dois
  // separados, sem vazar buraco nenhum.
  return FONTE.charToGlyph('J').getPath(dx, dy, corpo).toPathData(2);
}

/**
 * @param lado    o quadro é quadrado, que é o formato que avatar e favicon pedem
 * @param margem  0 encosta o J nas bordas de cima e de baixo
 * @param fundo   null deixa o buraco transparente; uma cor pinta o buraco
 */
function marca({ lado = 1024, margem = 0, fundo = null, cantos = 0 } = {}) {
  const jPath = jEncaixado(lado, margem);
  const moldura =
    cantos > 0
      ? `M${cantos} 0h${lado - cantos * 2}a${cantos} ${cantos} 0 0 1 ${cantos} ${cantos}v${lado - cantos * 2}a${cantos} ${cantos} 0 0 1 -${cantos} ${cantos}h-${lado - cantos * 2}a${cantos} ${cantos} 0 0 1 -${cantos} -${cantos}v-${lado - cantos * 2}a${cantos} ${cantos} 0 0 1 ${cantos} -${cantos}z`
      : `M0 0h${lado}v${lado}H0z`;

  const atras = fundo
    ? `<path d="${moldura}" fill="${fundo}"/>\n`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" width="${lado}" height="${lado}" role="img" aria-label="J">
<title>J</title>
${atras}<path d="${moldura} ${jPath}" fill="${C.blue}" fill-rule="evenodd"/>
</svg>
`;
}

fs.mkdirSync('../marca', { recursive: true });

const saidas = [
  ['marca-j.svg', { lado: 1024, margem: 0 }],
  ['marca-j-respiro.svg', { lado: 1024, margem: 96 }],
  ['marca-j-quadrado.svg', { lado: 1024, margem: 96, fundo: C.void }],
  ['marca-j-arredondado.svg', { lado: 1024, margem: 96, fundo: C.void, cantos: 220 }],
];

for (const [nome, opts] of saidas) {
  const svg = marca(opts);
  fs.writeFileSync(`../marca/${nome}`, svg);
  console.log(`${nome.padEnd(26)} ${(svg.length / 1024).toFixed(1)} KB`);
}
