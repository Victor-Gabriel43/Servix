import { process } from "@/content/home";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PendingNote } from "@/components/ui/PendingNote";

export function Process() {
  return (
    <section id="processo" aria-labelledby="processo-title" className="relative bg-ink-2 py-24 md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      <div className="container-page grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading index="03" label={process.label} title={process.title} lead={process.lead} id="processo-title" />
          <p className="mt-6">
            <PendingNote>validar a metodologia com a empresa</PendingNote>
          </p>
        </div>

        <ol className="relative [view-timeline-name:--process]">
          {/* Trilho que se preenche conforme a leitura avança */}
          <span aria-hidden="true" className="absolute bottom-10 left-[1.1875rem] top-3 w-px bg-line-strong">
            <span className="process-progress absolute inset-0 bg-gradient-to-b from-accent to-accent/30" />
          </span>

          {process.steps.map((step, i) => (
            <li key={step.title} data-reveal className="group relative grid grid-cols-[2.5rem_1fr] gap-x-5 pb-12 last:pb-0 sm:gap-x-8">
              <span
                aria-hidden="true"
                className="relative z-10 flex size-10 items-center justify-center rounded-full bg-ink-2 font-mono text-xs text-accent shadow-[0_0_0_1px_var(--color-line-strong)_inset] transition-shadow duration-300 group-hover:shadow-[0_0_0_1px_var(--color-accent)_inset]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1.5">
                <h3 className="text-xl font-medium text-fg md:text-2xl">
                  <span className="sr-only">Etapa {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-3 max-w-lg leading-relaxed text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
