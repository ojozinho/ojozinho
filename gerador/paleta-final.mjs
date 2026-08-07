/**
 * As cores do GitHub no modo escuro.
 *
 * Não é uma paleta inventada: são os tokens do próprio GitHub, os mesmos que a interface em volta
 * está usando. Isso é o ponto. O perfil encosta na página sem emenda, sem aquele retângulo de
 * outra marca colado no meio do site.
 */
export const C = {
  /** O fundo da página no tema escuro. Tudo aqui nasce dele. */
  void: '#0d1117',
  /** O fundo dos cartões e caixas do GitHub. */
  surface: '#161b22',
  /** A borda padrão. */
  line: '#30363d',
  /** O texto principal. */
  text: '#e6edf3',
  /** O texto secundário. */
  smoke: '#8b949e',
  /** O azul de link e de destaque. */
  blue: '#58a6ff',
  /** O roxo do Copilot e dos rótulos. */
  purple: '#bc8cff',
  /** O verde de sucesso. */
  green: '#3fb950',
  /** O verde mais aceso, o do último nível do gráfico de contribuições. */
  lime: '#39d353',
  /** O rosa dos rótulos. */
  pink: '#f778ba',
};

/**
 * Pilha de monoespacadas do sistema.
 *
 * Fonte web não carrega dentro de SVG servido pelo GitHub, então o texto pequeno usa o que a
 * máquina de quem lê já tem. O display não passa por aqui: ele é contorno vetorial.
 */
export const MONO =
  "ui-monospace,'SF Mono','Cascadia Mono','Roboto Mono',Menlo,Consolas,monospace";

/** Pilha sem serifa do sistema, para textos de apoio um pouco maiores. */
export const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
