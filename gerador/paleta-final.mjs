/**
 * A paleta, tirada da propria ilustracao.
 *
 * As cores nao foram escolhidas por gosto: foram amostradas do desenho do vagao de metro, region
 * por regiao, com canvas. O laranja e o do banco, o creme e o da parede iluminada, o azul e o do
 * bone, o verde e o do grafite. As amostras cruas sao escuras demais para texto sobre fundo
 * preto, entao a saturacao e o brilho foram levantados ate cada cor passar no contraste do WCAG
 * contra o #0d1117 do GitHub no modo escuro.
 *
 * amostra crua  ->  cor de uso        onde estava no desenho
 * #8b3708           #E2571E rust      o banco laranja do vagao
 * #a77334           #FF8A3D ember     o reflexo quente no metal
 * #d4a67b           #F2A65A amber     a parede iluminada
 * #ddb682           #F3E2C7 cream     a camiseta branca sob a luz amarela
 * #2a3f59           #3B82D6 dodger    o bone do time
 * #2a3f59           #63B3F5 sky       o mesmo azul, aberto
 * #181b1d           #7BA36A moss      o grafite verde na parede do fundo
 */
export const C = {
  /** O mesmo preto do GitHub no modo escuro, para o SVG encostar no fundo da pagina sem emenda. */
  void: '#0d1117',
  ink: '#010409',
  rust: '#E2571E',
  ember: '#FF8A3D',
  amber: '#F2A65A',
  cream: '#F3E2C7',
  dodger: '#3B82D6',
  sky: '#63B3F5',
  moss: '#7BA36A',
  /** O cinza de texto secundario do proprio GitHub. */
  smoke: '#8B949E',
};

/**
 * Pilha de monoespacadas do sistema.
 *
 * Fonte web nao carrega dentro de SVG servido pelo GitHub, entao o texto pequeno usa o que a
 * maquina de quem le ja tem. O display nao passa por aqui: ele e contorno vetorial.
 */
export const MONO =
  "ui-monospace,'SF Mono','Cascadia Mono','Roboto Mono',Menlo,Consolas,monospace";

/** Pilha sem serifa do sistema, para textos de apoio um pouco maiores. */
export const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
