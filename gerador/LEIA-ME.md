# O gerador

O que desenha os SVG do perfil. Nada aqui é enfeite de repositório: os arquivos em `/assets` são
saída deste código, e mexer na cor ou no texto é mexer aqui e rodar de novo.

```bash
npm install
node gerar-hero.mjs     # o cabeçalho
node gerar-pecas.mjs    # botões, paleta, fita de ferramentas, divisores
node provar.mjs         # renderiza tudo do jeito que o GitHub renderiza
```

Precisa da **Bricolage Grotesque** em `fontes/static/BricolageGrotesque-ExtraBold.ttf`. Ela não
está versionada porque é fonte de terceiro; baixe do Google Fonts. A fonte só é usada em tempo de
geração, para converter o texto grande em contorno vetorial. O SVG final não depende dela.

## As três regras que mandam no formato

**Nada externo carrega.** SVG servido pelo GitHub abre no modo estático seguro do navegador:
script não roda, fonte web não carrega, imagem externa não carrega. Por isso o display é contorno
vetorial (`vetor.mjs`) e o texto pequeno usa a pilha de monoespacadas do sistema.

**`:hover` não existe.** SVG dentro de `<img>` não recebe ponteiro. Um botão que só acende quando
o mouse passa por cima fica morto para sempre. Todo estado vivo aqui é animação ociosa.

**Testar abrindo o arquivo no navegador não prova nada.** Aberto direto, o SVG roda em modo
completo e um arquivo quebrado no README aparece perfeito. `provar.mjs` existe para isso: ele
carrega cada arquivo dentro de uma `<img>`, que é a mesma caixa em que o GitHub vai colocar.

## A paleta

`paleta.mjs` e `regioes.mjs` foram usados uma vez, para amostrar a ilustração do vagão e descobrir
de que cor ela realmente é. O resultado virou `paleta-final.mjs`, que é a fonte da verdade. Ficam
aqui porque a origem de cada cor importa mais que o hex.
