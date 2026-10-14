import { Blocks, Gauge, History, Workflow, type LucideIcon } from "lucide-react";

import { capabilities } from "@/content/home";
import { AutomationMock, ModulesMock, OverviewMock, TimelineMock } from "@/components/capabilities/Mocks";
import { BrandMarkFallback } from "@/components/visual/BrandMarkFallback";

const visuals: Record<(typeof capabilities.cards)[number]["key"], { icon: LucideIcon; Mock: () => React.ReactNode }> = {
  timeline: { icon: History, Mock: TimelineMock },
  automation: { icon: Workflow, Mock: AutomationMock },
  overview: { icon: Gauge, Mock: OverviewMock },
  modules: { icon: Blocks, Mock: ModulesMock },
};

/** "Possibilidades": abertura centralizada com a marca em um tile de vidro e cards com telas ilustrativas. */
export function Capabilities() {
  return (
    <section id="possibilidades" aria-labelledby="possibilidades-title" className="relative py-24 md:py-36">
      <div className="container-page">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div data-reveal className="glass-tile relative size-28 rounded-[1.75rem] p-1.5 sm:size-32">
            <BrandMarkFallback id="tile-mark" />
          </div>
          <h2 id="possibilidades-title" data-reveal className="text-gradient mt-10 pb-1 text-title font-semibold">
            {capabilities.title}
          </h2>
          <p data-reveal className="mt-5 text-lead text-muted">
            {capabilities.lead}
          </p>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-20 md:grid-cols-2">
          {capabilities.cards.map((card) => {
            const { icon: Icon, Mock } = visuals[card.key];
            return (
              <li key={card.key} data-reveal className="min-w-0">
                <div className="panel relative h-[19rem] overflow-hidden rounded-[2rem] sm:h-[20rem]" aria-hidden="true">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <div className="relative h-full">
                    <Mock />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />
                </div>
                <div className="px-2 pt-7 sm:px-10">
                  <Icon className="size-5 text-fg" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-medium text-fg">{card.title}</h3>
                  <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted">{card.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-14 text-center text-xs text-subtle">{capabilities.disclaimer}</p>
      </div>
    </section>
  );
}
