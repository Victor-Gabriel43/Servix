"use client";

import { ArrowRight, Check, Plus } from "lucide-react";
import { useState } from "react";

import { solution } from "@/content/home";
import { PREFILL_EVENT, type PrefillDetail } from "@/lib/events";
import { LogoSymbol } from "@/components/ui/Logo";

const { composer } = solution;

/**
 * Esboço interativo: o visitante marca as áreas que mais pesam na rotina e
 * vê como elas se conectariam a um sistema. As escolhas podem ser levadas
 * para o formulário de contato. É uma ilustração — não um produto existente.
 */
export function ModuleComposer() {
  const [selected, setSelected] = useState<string[]>([]);
  const count = selected.length;

  const toggle = (area: string) =>
    setSelected((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : composer.areas.filter((a) => prev.includes(a) || a === area),
    );

  const sendToContact = () => {
    if (count === 0) return;
    window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail: { areas: selected } }));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("contato")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="panel p-5 sm:p-8" data-testid="module-composer">
      <div className="flex items-center justify-between gap-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-subtle">
        <span>esboço / sistema</span>
        <span aria-live="polite" className={count ? "text-accent" : undefined}>
          {count} de {composer.areas.length} áreas
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-medium text-fg">{composer.title}</h3>
      <p id="composer-hint" className="mt-2 text-sm text-muted">
        {composer.hint}
      </p>

      {/* Núcleo */}
      <div className="mt-8 flex flex-col items-center">
        <div
          className={`relative flex items-center gap-3 rounded-2xl bg-ink px-5 py-3.5 transition-shadow duration-500 ${
            count
              ? "shadow-[0_0_0_1px_var(--color-accent)_inset,0_0_40px_-8px_rgb(66_217_255/0.45)]"
              : "shadow-[0_0_0_1px_var(--color-line-strong)_inset]"
          }`}
        >
          <LogoSymbol className="h-3.5 w-auto text-fg" />
          <span className="text-sm font-medium">{composer.core}</span>
          <span
            aria-hidden="true"
            className={`size-2 rounded-full transition-colors duration-300 ${count ? "pulse-ring bg-accent" : "bg-line-strong"}`}
          />
        </div>
        <span aria-hidden="true" className={`h-6 w-px transition-colors duration-500 ${count ? "bg-accent/70" : "bg-line-strong"}`} />
      </div>

      {/* Módulos conectados a um barramento central */}
      <div className="relative">
        <span
          aria-hidden="true"
          className={`absolute bottom-6 left-1/2 top-0 w-px -translate-x-1/2 transition-colors duration-500 ${
            count ? "bg-accent/50" : "bg-line-strong"
          }`}
        >
          {count > 0
            ? [0, 1100, 2200].map((d) => (
                <span
                  key={d}
                  className="travel-dot absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_10px_2px_rgb(66_217_255/0.6)] motion-reduce:hidden"
                  style={{ "--delay": `${d}ms` } as React.CSSProperties}
                />
              ))
            : null}
        </span>

        <ul className="grid grid-cols-2 gap-x-8 gap-y-3" aria-describedby="composer-hint">
          {composer.areas.map((area, i) => {
            const on = selected.includes(area);
            const left = i % 2 === 0;
            return (
              <li key={area} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 h-px w-4 transition-colors duration-300 ${left ? "left-full" : "right-full"} ${
                    on ? "bg-accent" : "bg-line-strong"
                  }`}
                />
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(area)}
                  className={`group flex min-h-12 w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.82rem] leading-snug transition-all duration-300 sm:px-4 sm:text-sm ${
                    on
                      ? "bg-accent/10 text-fg shadow-[0_0_0_1px_var(--color-accent)_inset]"
                      : "text-muted shadow-[0_0_0_1px_var(--color-line-strong)_inset] hover:bg-white/[0.03] hover:text-fg hover:shadow-[0_0_0_1px_var(--color-muted)_inset]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md transition-colors duration-300 ${
                      on ? "bg-accent text-accent-ink" : "bg-surface-2 text-subtle group-hover:text-fg"
                    }`}
                  >
                    {on ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" />}
                  </span>
                  {area}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-subtle">{composer.disclaimer}</p>

      <button
        type="button"
        onClick={sendToContact}
        aria-disabled={count === 0}
        className="btn btn-ghost mt-6 w-full"
      >
        {count === 0 ? composer.emptyCta : composer.cta}
        {count > 0 ? <ArrowRight className="btn-icon size-4" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
