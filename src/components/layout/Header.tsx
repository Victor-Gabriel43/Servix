"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { mainNav } from "@/config/site";
import { Logo } from "@/components/ui/Logo";

/**
 * Header fixo: ajuda o visitante a voltar ao contato a qualquer momento
 * numa página longa. Ganha fundo ao rolar e destaca a seção atual.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Destaca o link da seção visível.
  useEffect(() => {
    const sections = mainNav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Menu mobile: bloqueia o conteúdo ao fundo, fecha com Esc e no desktop.
  useEffect(() => {
    if (!open) return;
    const outside = [document.getElementById("conteudo"), document.getElementById("rodape")];
    outside.forEach((el) => el?.setAttribute("inert", ""));
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onDesktop = () => desktop.matches && close(false);

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      outside.forEach((el) => el?.removeAttribute("inert"));
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open, close]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        solid
          ? "bg-ink/80 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only-focusable absolute left-4 top-3 z-10 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
      >
        Pular para o conteúdo
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Link href="/#inicio" className="-m-2 rounded-lg p-2" aria-label="Servix — início">
          <Logo className="h-9 w-auto text-fg md:h-10" />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const current = active === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={`/${item.href}`}
                    aria-current={current ? "true" : undefined}
                    className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-200 hover:text-fg ${
                      current ? "text-fg" : "text-muted"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-500 ease-out-expo ${
                        current ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/#contato" className="btn btn-primary hidden min-h-10 px-5 py-2 text-sm sm:inline-flex">
            Fale com a Servix
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-fg shadow-[0_0_0_1px_var(--color-line-strong)_inset] transition-colors hover:bg-white/5 md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        id={menuId}
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ink md:hidden"
      >
        <nav aria-label="Menu mobile" className="container-page flex min-h-full flex-col py-8">
          <ul className="flex flex-col">
            {mainNav.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={`/${item.href}`}
                  onClick={() => close(false)}
                  className="flex items-baseline gap-4 py-5 text-2xl font-medium text-fg"
                >
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/#contato" onClick={() => close(false)} className="btn btn-primary mt-10 w-full">
            Fale com a Servix
          </Link>
        </nav>
      </div>
    </header>
  );
}
