import { problem } from "@/content/home";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Problem() {
  return (
    <section aria-labelledby="problema-title" className="relative py-24 md:py-36">
      <div className="container-page grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading index="01" label={problem.label} title={problem.title} lead={problem.intro} id="problema-title" />
        </div>

        <ol className="border-t border-line">
          {problem.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              className="group grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-8 sm:grid-cols-[4rem_1fr] md:py-10"
            >
              <span className="pt-1 font-mono text-xs text-subtle transition-colors duration-300 group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-medium text-fg md:text-2xl">{item.title}</h3>
                <p className="mt-3 max-w-lg leading-relaxed text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Ponte: da dor para a oportunidade */}
      <div className="container-page mt-20 md:mt-28">
        <div data-reveal className="panel relative overflow-hidden px-6 py-12 sm:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent,black_60%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-1/2 size-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(66_217_255/0.16),transparent_65%)]"
          />
          <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-end md:gap-16">
            <div>
              <p className="eyebrow">{problem.opportunity.label}</p>
              <h3 className="mt-5 max-w-md text-title font-semibold text-fg">{problem.opportunity.title}</h3>
            </div>
            <p className="max-w-xl text-lead text-muted">{problem.opportunity.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
