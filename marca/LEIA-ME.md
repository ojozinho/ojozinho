# A marca

Um J vazado num campo azul `#58a6ff`, o mesmo azul de destaque do GitHub no modo escuro.

O desenho é subtrativo. Não existe um J desenhado por cima do azul: existe um campo azul do qual
o J foi removido, e o que se lê como letra é o buraco. Isso não é detalhe de implementação — é o
que permite a marca viver sobre qualquer fundo. Um J pintado de escuro exigiria saber de que cor
é o fundo, e sobre qualquer outra cor o truque apareceria.

| arquivo | o que é |
| --- | --- |
| `marca-j.svg` | o J encostando nas bordas, preenchendo o quadro inteiro |
| `marca-j-respiro.svg` | o mesmo, com margem |
| `marca-j-quadrado.svg` | com o fundo escuro do GitHub pintado atrás |
| `marca-j-arredondado.svg` | o de cima com cantos de ícone de app |

Os dois primeiros têm o buraco transparente. Os dois últimos trazem o `#0d1117` pintado atrás,
para quando o destino não aceita transparência.

Em `png/` estão as versões rasterizadas em 512 e 1024, geradas a partir dos próprios SVG para não
existirem duas fontes da verdade. O maior arquivo tem 23 KB.

Para regerar: `node gerar-logo.mjs` dentro de `/gerador`.
