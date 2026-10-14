import { siteConfig } from "@/config/site";
import { about } from "@/content/home";
import { PendingNote } from "@/components/ui/PendingNote";

export function About() {
  const institutional = [
    { label: "Missão", value: siteConfig.mission },
    { label: "História", value: siteConfig.history },
    { label: "Área de atuação", value: siteConfig.location },
  ];
  const defined = institutional.filter((f): f is { label: string; value: string } => Boolean(f.value));
  const pending = institutional.filter((f) => !f.value).map((f) => f.label.toLowerCase());

  return (
    <section id="sobre" aria-labelledby="sobre-title" className="relative py-24 md:py-36">
      <div className="container-page">
        <p className="eyebrow" data-reveal="fade">
          <span className="text-accent">05</span>
          {about.label}
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <h2 id="sobre-title" data-reveal className="text-title font-semibold text-fg lg:text-[clamp(2.5rem,1.5rem+2.8vw,4rem)]">
            {about.title}
          </h2>
          <div data-reveal className="lg:pt-3">
            <p className="text-lead text-muted">{about.text}</p>
            {defined.length > 0 ? (
              <dl className="mt-8 space-y-5 border-t border-line pt-8">
                {defined.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">{f.label}</dt>
                    <dd className="mt-1.5 leading-relaxed text-fg">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {pending.length > 0 ? (
              <p className="mt-6">
                <PendingNote>{pending.join(", ")}</PendingNote>
              </p>
            ) : null}
          </div>
        </div>

        <ul className="mt-16 grid border-t border-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {about.principles.map((principle, i) => (
            <li
              key={principle.title}
              data-reveal
              className="group relative border-b border-line py-8 sm:px-6 sm:[&:nth-child(odd)]:pl-0 lg:border-b-0 lg:px-6 lg:first:pl-0 lg:[&:not(:first-child)]:border-l"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-0 bg-accent transition-[width] duration-700 ease-out-expo group-hover:w-full"
              />
              <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-lg font-medium text-fg">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{principle.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
