import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { mainNav, siteConfig, type SocialNetwork } from "@/config/site";
import { getContactChannels } from "@/lib/links";
import { finalCta } from "@/content/home";
import { Logo } from "@/components/ui/Logo";
import { GiantWordmark } from "@/components/layout/GiantWordmark";
import { PendingNote } from "@/components/ui/PendingNote";

const socialInitials: Record<SocialNetwork, string> = {
  instagram: "IG",
  linkedin: "in",
  github: "GH",
  youtube: "YT",
  x: "X",
  facebook: "f",
};

export function Footer() {
  const channels = getContactChannels();
  const year = new Date().getFullYear();
  const { legalName, taxId, social } = siteConfig;

  return (
    <footer id="rodape" className="relative bg-ink">
      {/* Chamada final, logotipo gigante e horizonte de luz */}
      <div className="relative isolate overflow-hidden pt-28 md:pt-40">
        <div aria-hidden="true" className="hero-beam pointer-events-none absolute left-1/2 top-0 -z-10 h-[34rem] w-[min(80rem,160vw)] -translate-x-1/2 opacity-70" />
        <div className="container-page flex flex-col items-center text-center">
          <p className="text-gradient font-serif text-[clamp(2.75rem,1.6rem+5vw,5.75rem)] leading-[1.02] tracking-[-0.02em]" data-reveal>
            {finalCta.titleLines.map((line) => (
              <span key={line} className="block pb-1">
                {line}
              </span>
            ))}
          </p>
          <Link href={finalCta.cta.href} className="btn btn-ghost mt-10 min-h-11 px-5" data-reveal>
            {finalCta.cta.label}
            <ChevronRight className="btn-icon size-4 text-muted" aria-hidden="true" />
          </Link>
        </div>
        <div className="container-page mt-20 md:mt-28">
          <GiantWordmark />
        </div>
        <div aria-hidden="true" className="relative h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
        <div className="max-w-xs">
          <Link href="/#inicio" className="-m-2 inline-flex rounded-lg p-2" aria-label="Servix — voltar ao início">
            <Logo className="h-11 w-auto text-fg" />
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-muted">{siteConfig.description}</p>
          {siteConfig.tagline ? (
            <p className="mt-3 text-sm text-fg">{siteConfig.tagline}</p>
          ) : (
            <p className="mt-3">
              <PendingNote>slogan</PendingNote>
            </p>
          )}
        </div>

        <nav aria-label="Rodapé">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Navegação</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={`/${item.href}`} className="link-underline text-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#contato" className="link-underline text-muted hover:text-fg">
                Contato
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Contato</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {channels.map((c) => (
              <li key={c.id}>
                <a
                  href={c.href}
                  className="link-underline break-all text-muted hover:text-fg"
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {c.value}
                </a>
              </li>
            ))}
            <li>
              <Link href="/#contato" className="link-underline text-muted hover:text-fg">
                Formulário de contato
              </Link>
            </li>
            {channels.length === 0 ? (
              <li>
                <PendingNote>e-mail, telefone e WhatsApp</PendingNote>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Institucional</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/privacidade" className="link-underline text-muted hover:text-fg">
                Aviso de privacidade
              </Link>
            </li>
            {social.length > 0 ? (
              <li className="flex flex-wrap gap-2.5 pt-2">
                {social.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} (abre em nova aba)`}
                    className="flex size-10 items-center justify-center rounded-full bg-white/[0.04] font-mono text-[0.7rem] text-muted ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08] hover:text-fg"
                  >
                    {socialInitials[s.network]}
                  </a>
                ))}
              </li>
            ) : null}
            {social.length === 0 ? (
              <li>
                <PendingNote>redes sociais</PendingNote>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {legalName ?? siteConfig.name}
            {taxId ? ` · CNPJ ${taxId}` : null}
          </p>
          {!legalName || !taxId ? <PendingNote>razão social e CNPJ</PendingNote> : null}
        </div>
      </div>
    </footer>
  );
}
