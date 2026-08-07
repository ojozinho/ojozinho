import * as si from 'simple-icons';
import { paraCaminho } from './vetor.mjs';

/**
 * Os ícones das ferramentas.
 *
 * Vêm de duas origens, e a divisão não foi escolha estética.
 *
 * A maioria sai do Simple Icons, que é domínio público e traz o caminho oficial de cada marca.
 *
 * Os da Adobe não. Eles foram removidos do Simple Icons a pedido da própria Adobe, que não quer
 * os ícones dela redistribuídos. Então em vez de copiar de outro lugar e fingir que não é isso,
 * os cinco são monogramas desenhados aqui: dois caracteres num quadrado arredondado, na cor do
 * produto, que é a mesma gramática que a Adobe usa nos ícones dela. Fica reconhecível sem pegar
 * emprestado o que não é para pegar.
 */

const LADO = 22;

/** Um ícone do Simple Icons, redimensionado do quadro de 24 para o nosso. */
function daBiblioteca(chave) {
  const ic = si[chave];
  if (!ic) throw new Error(`Ícone não encontrado no Simple Icons: ${chave}`);
  const k = LADO / 24;
  return {
    cor: `#${ic.hex}`,
    markup: (cor) =>
      `<path d="${ic.path}" transform="scale(${k.toFixed(4)})" fill="${cor}"/>`,
  };
}

/**
 * Um monograma da Adobe: duas letras num quadrado arredondado.
 *
 * As letras entram como contorno vetorial, e não como `<text>`, pelo mesmo motivo de todo o resto
 * do perfil: fonte web não carrega dentro de SVG servido pelo GitHub, e uma pilha de fontes do
 * sistema daria uma largura diferente em cada máquina, o que num quadrado de 22 pixels significa
 * a letra saindo pela borda.
 */
function monograma(letras, cor, fundo) {
  const corpo = 11.5;
  const m = paraCaminho(letras, corpo, { tracking: -0.5 });
  const dx = (LADO - m.largura) / 2;
  // A linha de base fica um pouco abaixo do meio: a caixa alta e a caixa baixa juntas pesam para
  // cima, e centralizar pela métrica deixaria o par visualmente alto dentro do quadrado.
  const dy = LADO / 2 + corpo * 0.37;
  return {
    cor,
    markup: () =>
      `<rect width="${LADO}" height="${LADO}" rx="5" fill="${fundo}"/>` +
      `<path d="${m.d}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})" fill="${cor}"/>`,
  };
}

/**
 * O catálogo.
 *
 * As cores da Adobe são as dos produtos: o laranja do Illustrator, o azul do Photoshop, o magenta
 * do InDesign, o lilás do After Effects e o roxo do Premiere. O fundo de cada um é a versão bem
 * escura da mesma cor, como nos ícones originais.
 */
const CATALOGO = {
  FIGMA: daBiblioteca('siFigma'),
  ILLUSTRATOR: monograma('Ai', '#FF9A00', '#2B1400'),
  PHOTOSHOP: monograma('Ps', '#31A8FF', '#001E36'),
  INDESIGN: monograma('Id', '#FF3366', '#2E0413'),
  'AFTER EFFECTS': monograma('Ae', '#9999FF', '#0D0D3B'),
  PREMIERE: monograma('Pr', '#E479FF', '#22062B'),
  BLENDER: daBiblioteca('siBlender'),
  REACT: daBiblioteca('siReact'),
  TYPESCRIPT: daBiblioteca('siTypescript'),
  TAILWIND: daBiblioteca('siTailwindcss'),
  GSAP: daBiblioteca('siGsap'),
  MOTION: daBiblioteca('siFramer'),
  FIREBASE: daBiblioteca('siFirebase'),
  VITE: daBiblioteca('siVite'),
  WEBFLOW: daBiblioteca('siWebflow'),
  FRAMER: daBiblioteca('siFramer'),
};

/**
 * Devolve o ícone posicionado, ou null quando a ferramenta não tem um.
 *
 * Devolver null em vez de estourar é deliberado: uma ferramenta nova na lista deve aparecer só
 * com o nome, e não derrubar a geração do perfil inteiro.
 */
export function icone(nome, x, y) {
  const ic = CATALOGO[nome];
  if (!ic) return null;
  return `<g transform="translate(${x} ${y})">${ic.markup(ic.cor)}</g>`;
}

export const LADO_ICONE = LADO;
