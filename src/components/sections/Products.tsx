import { ArrowUpRight } from "lucide-react";

import { siteConfig, type Product } from "@/config/site";
import { products as copy } from "@/content/home";

const statusLabel: Record<Product["status"], string> = {
  available: "Disponível",
  beta: "Em beta",
  "in-development": "Em desenvolvimento",
};

/**
 * Área de produtos próprios. Sem produtos cadastrados em `siteConfig`,
 * exibe apenas um aviso discreto (ou nada, se `announceWhenEmpty` for false).
 */
export function Products() {
  const { items, announceWhenEmpty } = siteConfig.products;

  if (items.length === 0) {
    if (!announceWhenEmpty) return null;
    return (
      <section id="produtos" aria-labelledby="produtos-title" className="py-10">
        <div className="container-page">
          <div
            data-reveal
            className="flex flex-col gap-4 rounded-2xl border border-dashed border-line-strong px-6 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-8"
          >
            <p className="eyebrow shrink-0">
              <span className="text-accent">04</span>
              {copy.label}
            </p>
            <div>
              <h2 id="produtos-title" className="text-base font-medium text-fg">
                {copy.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{copy.text}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" aria-labelledby="produtos-title" className="py-24 md:py-32">
      <div className="container-page">
        <p className="eyebrow">
          <span className="text-accent">04</span>
          {copy.label}
        </p>
        <h2 id="produtos-title" className="mt-5 text-title font-semibold">
          Produtos Servix
        </h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2">
          {items.map((product) => (
            <li key={product.slug} className="bg-surface p-8">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{statusLabel[product.status]}</p>
              <h3 className="mt-4 text-xl font-medium">{product.name}</h3>
              <p className="mt-2 text-muted">{product.summary}</p>
              {product.url ? (
                <a href={product.url} className="link-underline mt-6 inline-flex items-center gap-1 text-sm text-fg">
                  Conhecer {product.name}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
