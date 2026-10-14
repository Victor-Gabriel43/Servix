/**
 * Configuração institucional da Servix — fonte única de dados editáveis.
 *
 * Regra do projeto: nenhum dado institucional deve ser inventado.
 * Campos com valor `null` estão PENDENTES de definição pela empresa:
 *   - na interface pública, o elemento correspondente fica oculto;
 *   - em desenvolvimento (`npm run dev`), aparece um aviso "Pendente".
 *
 * Logotipo: definido em `src/components/brand/geometry.ts` (vetor redesenhado
 * a partir das imagens enviadas; substituir pelo arquivo vetorial original).
 *
 * Variáveis sensíveis (chaves de API, destinatário do formulário) NÃO ficam
 * aqui: veja `.env.example`.
 */

export type SocialNetwork =
  | "instagram"
  | "linkedin"
  | "github"
  | "youtube"
  | "x"
  | "facebook";

export interface SocialLink {
  network: SocialNetwork;
  label: string;
  url: string;
}

export interface Product {
  /** Identificador estável, usado em URLs futuras (/produtos/[slug]). */
  slug: string;
  name: string;
  summary: string;
  /** Status real do produto. Não use "available" para algo que não existe. */
  status: "available" | "beta" | "in-development";
  url?: string;
}

export interface SiteConfig {
  name: string;
  /** Descrição curta usada em metadados e no rodapé. */
  description: string;
  /** Slogan oficial — PENDENTE. */
  tagline: string | null;
  /** Missão oficial — PENDENTE. */
  mission: string | null;
  /** História oficial — PENDENTE. */
  history: string | null;
  /** Cidade / área de atuação — PENDENTE. */
  location: string | null;
  /** Razão social e CNPJ, exibidos no rodapé e no aviso de privacidade — PENDENTE. */
  legalName: string | null;
  taxId: string | null;
  contact: {
    /** E-mail comercial público (exibido como link mailto). */
    email: string | null;
    /** Telefone comercial em formato legível, ex.: "+55 11 0000-0000". */
    phone: string | null;
    /** WhatsApp comercial: apenas dígitos com DDI, ex.: "5511900000000". */
    whatsapp: string | null;
    /** Mensagem inicial sugerida no link do WhatsApp. */
    whatsappMessage: string;
  };
  social: SocialLink[];
  products: {
    items: Product[];
    /**
     * Quando não há produtos, exibe discretamente que a área está em
     * estruturação. Defina `false` para omitir a seção por completo.
     */
    announceWhenEmpty: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: "Servix",
  description:
    "A Servix desenvolve sistemas sob medida para pequenos negócios, a partir da forma como cada negócio funciona.",
  tagline: null,
  mission: null,
  history: null,
  location: null,
  legalName: null,
  taxId: null,
  contact: {
    email: null,
    phone: null,
    whatsapp: null,
    whatsappMessage:
      "Olá! Vim pelo site da Servix e gostaria de conversar sobre um sistema para o meu negócio.",
  },
  social: [],
  products: {
    items: [],
    announceWhenEmpty: true,
  },
};

/** Navegação principal da página única. */
export const mainNav = [
  { href: "#inicio", label: "Início" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#processo", label: "Processo" },
  { href: "#sobre", label: "Sobre" },
] as const;

/**
 * URL pública do site. Defina `NEXT_PUBLIC_SITE_URL` somente após a definição
 * do domínio oficial — ela habilita URLs canônicas, sitemap e dados estruturados.
 */
export function getSiteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/**
 * Indexação por buscadores fica desligada até a publicação oficial, para que
 * prévias com conteúdo provisório não sejam indexadas.
 */
export function isIndexingAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" && getSiteUrl() !== null;
}

/** Avisos de pendência só aparecem fora de produção. */
export const showPendingNotes = process.env.NODE_ENV !== "production";
