import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { mainNav, siteConfig } from "@/config/site";
import { getContactChannels } from "@/lib/links";
import { Logo } from "@/components/ui/Logo";
import { PendingNote } from "@/components/ui/PendingNote";

export function Footer() {
  const channels = getContactChannels();
  const year = new Date().getFullYear();
  const { legalName, taxId, social } = siteConfig;

  return (
    <footer id="rodape" className="relative border-t border-line bg-ink-2">
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
            {social.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-1 text-muted hover:text-fg"
                >
                  {s.label}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              </li>
            ))}
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
