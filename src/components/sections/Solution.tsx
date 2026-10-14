import { solution } from "@/content/home";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ModuleComposer } from "@/components/solution/ModuleComposer";

export function Solution() {
  return (
    <section id="solucoes" aria-labelledby="solucoes-title" className="relative py-24 md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      <div className="container-page grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <SectionHeading index="02" label={solution.label} title={solution.title} lead={solution.lead} id="solucoes-title" />

          <dl className="mt-12 space-y-8">
            {solution.points.map((point) => (
              <div key={point.title} data-reveal className="relative pl-6">
                <span aria-hidden="true" className="absolute left-0 top-2 size-2 rotate-45 border border-accent" />
                <dt className="text-lg font-medium text-fg">{point.title}</dt>
                <dd className="mt-2 max-w-md leading-relaxed text-muted">{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-reveal className="lg:pt-10">
          <ModuleComposer />
        </div>
      </div>
    </section>
  );
}
