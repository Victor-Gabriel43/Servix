# Servix — site institucional

Site oficial da Servix: página única institucional com formulário comercial,
feito em Next.js (App Router), React, TypeScript estrito e Tailwind CSS 4.

## Executar localmente

Requer Node.js 20.9+ (testado com Node 22).

```bash
npm install
npm run dev          # http://localhost:3000 — mostra avisos "Pendente"
npm run build        # build de produção
npm run start        # serve o build
```

## Verificações

```bash
npm run typecheck    # TypeScript (strict + noUncheckedIndexedAccess)
npm run lint         # ESLint (next/core-web-vitals + typescript)
npm test             # Vitest + Testing Library (lógica e componentes)
npm run test:e2e     # Playwright: build + servidor + navegador (desktop e mobile), inclui axe
```

## Estrutura

```
src/
  config/site.ts            ← dados institucionais editáveis (fonte única)
  content/home.ts           ← textos da página, separados do layout
  app/
    layout.tsx, page.tsx    ← metadados, fontes, montagem das seções
    api/contact/route.ts    ← endpoint do formulário
    privacidade/            ← aviso de privacidade (versão preliminar)
    not-found.tsx, error.tsx, robots.ts, sitemap.ts, opengraph-image.tsx, icon.svg
  components/
    brand/geometry.ts       ← vetores do logotipo e do monograma SX
    layout/                 ← Header (menu mobile), Footer
    sections/               ← Hero, Problem, Solution, Process, Products, About, Contact
    visual/                 ← elemento 3D (canvas) + fallback SVG, geometria compartilhada
    solution/ModuleComposer ← esboço interativo de áreas → pré-preenche o contato
    contact/ContactForm     ← formulário com validação e estados reais
    ui/                     ← Logo, SectionHeading, PendingNote
  lib/
    contact/                ← validação (cliente+servidor), rate limit, envio, handler
    links.ts, events.ts
tests/unit, tests/e2e
docs/DECISOES.md            ← decisões de design e técnicas
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Nenhuma é obrigatória para rodar.

| Variável | Onde | Função |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build | Domínio oficial. Habilita canonical, sitemap e JSON-LD. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | build | `true` libera indexação. Sem ela, `noindex` + `robots.txt` bloqueando. |
| `RESEND_API_KEY` | servidor | Chave do Resend para enviar o formulário por e-mail. |
| `CONTACT_TO_EMAIL` | servidor | Caixa que recebe as mensagens. |
| `CONTACT_FROM_EMAIL` | servidor | Remetente em domínio verificado no Resend. |

As variáveis do formulário são lidas no servidor (nunca vão para o navegador).
A página é estática: defina-as **antes do build** para que o aviso
"Formulário em ativação" desapareça; o endpoint as lê em tempo de execução.

## Integrações pendentes

1. **Envio do formulário** — criar conta no [Resend](https://resend.com),
   verificar o domínio, gerar a chave e preencher as três variáveis acima.
   Sem isso, o formulário valida os dados e informa claramente que o envio
   não está ativo (status 503) — nunca simula sucesso.
   Para trocar de provedor, altere apenas `src/lib/contact/delivery.ts`.
2. **Proteção contra abuso em escala** — o limite de 5 envios / 10 min por IP
   é em memória (por instância). Em produção com várias instâncias, use o
   firewall/rate limit da hospedagem ou um armazenamento compartilhado
   (ex.: Upstash Redis). Há também campo-armadilha e checagem de `Origin`.
3. **Analytics** — nenhum rastreador ou cookie foi incluído. Se for adotado,
   atualize o aviso de privacidade e a CSP em `next.config.ts`.

## Dados institucionais pendentes

Edite `src/config/site.ts` (campos `null` ficam ocultos em produção e
sinalizados em desenvolvimento):

- Slogan, missão, história, cidade/área de atuação
- Razão social e CNPJ
- E-mail, telefone e WhatsApp comerciais
- Redes sociais
- Produtos próprios (`products.items`) — a seção hoje mostra discretamente
  "em estruturação"; use `announceWhenEmpty: false` para ocultá-la
- Paleta definitiva (tokens em `src/app/globals.css`, bloco `@theme`)
- Arquivo vetorial original do logotipo (hoje redesenhado a partir das
  imagens enviadas, em `src/components/brand/geometry.ts`)
- Validação da metodologia de 5 etapas (`src/content/home.ts`)
- Revisão jurídica do aviso de privacidade (`src/app/privacidade/page.tsx`)

Portfólio, cases e depoimentos não existem no site de propósito — adicione
somente quando houver material real.

## Publicação (ex.: Vercel)

1. Preencher os dados pendentes essenciais (ao menos um canal de contato ou o
   envio do formulário ativo; razão social/CNPJ no aviso de privacidade).
2. Importar o repositório na Vercel (detecta Next.js; build `npm run build`).
3. Configurar as variáveis de ambiente de produção.
4. Apontar o domínio oficial e definir `NEXT_PUBLIC_SITE_URL`.
5. Quando o conteúdo estiver aprovado, `NEXT_PUBLIC_ALLOW_INDEXING=true` e
   novo deploy. Enviar o sitemap ao Google Search Console.

Qualquer host Node.js também funciona (`npm run build && npm run start`).
