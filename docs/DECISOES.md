# Decisões de design e técnicas

## Direção visual

- **Base escura premium**: fundo `#080B12`, superfícies `#101622`, texto
  `#F5F7FA` / `#A0A8B8`. O ciano `#42D9FF` é usado com parcimônia: CTA
  principal, índices de seção, estados ativos e o elemento visual.
- **Tipografia**: Geist Sans (títulos e texto) e Geist Mono (rótulos técnicos),
  auto-hospedadas via pacote `geist` — sem requisição a terceiros.
- **Variedade de layout**: cada seção tem uma composição própria (lista
  indexada, esboço interativo, linha do tempo, princípios em colunas,
  formulário dividido) para evitar a repetição de cards.
- **Marca**: monograma "SX" e logotipo "SERVIX" redesenhados em vetor a partir
  das imagens enviadas; cor via `currentColor`.

## Elemento visual — "camadas de um sistema"

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
