# Decisões de design e técnicas

## Direção visual

- **Monocromático, inspirado em estúdios como a Resend**: preto puro,
  grafites neutros, títulos com degradê de branco para cinza e botão
  principal branco. O ciano `#42D9FF` virou assinatura pontual da marca
  (pulso de dados, índices, foco), não cor dominante.
- **Textura**: facho de luz no hero, grade de pontos e granulação de filme
  (SVG estático) para tirar o aspecto "chapado" do preto.
- **Painéis** com brilho e borda que seguem o cursor (`PointerSpotlight`:
  um único listener, atualização por quadro, desligado em toque e com
  movimento reduzido).
- **Tipografia**: Geist Sans (títulos e texto) e Geist Mono (rótulos técnicos),
  auto-hospedadas via pacote `geist` — sem requisição a terceiros.
- **Variedade de layout**: cada seção tem uma composição própria (lista
  indexada, esboço interativo, linha do tempo, princípios em colunas,
  formulário dividido) para evitar a repetição de cards.
- **Marca**: monograma "SX" e logotipo "SERVIX" redesenhados em vetor a partir
  das imagens enviadas; cor via `currentColor`.

## Seção "Possibilidades" e rodapé (padrões da Resend)

- Abertura centralizada com a marca em um tile de vidro escuro.
- Grade de cards com mini-interfaces animadas só com CSS (linha do tempo,
  automação, painel do dia, módulos). São **ilustrativas, com dados
  fictícios**, rotuladas como tal e ocultas de leitores de tela.
- Rodapé: chamada final em Instrument Serif (OFL, hospedada em
  `src/fonts`, sem pré-carregamento) e o logotipo SERVIX gigante em contorno,
  com luz que segue o cursor e varredura lenta para telas de toque.
- Redes sociais (quando configuradas) em botões redondos com siglas.

## Marca 3D do hero

O "S" do logotipo Servix extrudado em 3D, em cromo negro, com um pulso de
dados ciano percorrendo o contorno. Gira suavemente, inclina com o cursor,
reage à rolagem e pode ser arrastado (inércia + retorno elástico).

- Mesmo motor de projeção do visual de camadas, canvas 2D, sem bibliotecas.
- Começa em `requestIdleCallback` para não competir com o carregamento e
  só anima enquanto visível.
- Fallback SVG gerado no servidor com a mesma geometria; o pulso do
  contorno é animado só com CSS (funciona sem JavaScript).

## Elemento visual — "camadas de um sistema" (painel "A oportunidade")

Três planos modulares (dados → processos → interface). Os módulos chegam
dispersos (informações espalhadas do negócio) e se encaixam; pulsos de dados
sobem entre as camadas. Representa a transformação de processos em software.

- **Canvas 2D com projeção 3D própria**, sem Three.js: a cena tem ~40 quadros
  planos; uma biblioteca 3D adicionaria ~150 kB sem ganho visual real.
- Pausa fora da tela e em abas ocultas; DPR limitado a 2.
- **Fallbacks**: SVG estático gerado no servidor a partir da mesma geometria
  (sem JS ou sem canvas); quadro estático com `prefers-reduced-motion`.

## Movimento

- Entrada do hero por keyframes CSS; revelações ao rolar com
  *scroll-driven animations* (`animation-timeline: view()`), sem JavaScript.
  Navegadores sem suporte mostram o conteúdo normalmente.
- Título e texto do hero partem de opacidade 0.01 (não 0) para continuarem
  candidatos a LCP.
- Nenhuma biblioteca de animação foi instalada.

## Conversão

- CTA de contato no header fixo, no hero e no final.
- O "esboço" da seção Soluções deixa o visitante marcar áreas da rotina e
  levar a seleção para o formulário, pré-preenchendo a mensagem.
- Formulário curto (3 campos obrigatórios), um único campo "e-mail ou
  telefone", validação acessível e estados de envio/sucesso/erro reais.

## Honestidade do conteúdo

- Nenhum cliente, número, depoimento, prazo, preço ou serviço não confirmado.
- Exemplos do esboço são rotulados como ilustração.
- IA citada como parte do campo de atuação, não como oferta.
- Canais não configurados não aparecem (nunca `href="#"`).

## Segurança

- CSP sem domínios externos, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS em produção.
- API: checagem de `Origin`, `Content-Type`, tamanho do corpo, rate limit,
  campo-armadilha, validação no servidor, escape de HTML no e-mail.
- Nada é armazenado; segredos apenas em variáveis de servidor.
