import { ArrowUpRight } from "lucide-react";

import { contact } from "@/content/home";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { getContactChannels } from "@/lib/links";
import { ContactForm } from "@/components/contact/ContactForm";
import { PendingNote } from "@/components/ui/PendingNote";

/** CTA final + formulário comercial. */
export function Contact() {
  const channels = getContactChannels();
  const deliveryEnabled = isContactDeliveryConfigured();

  return (
    <section id="contato" aria-labelledby="contato-title" className="relative isolate overflow-hidden py-24 md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_20%_45%,black,transparent_75%)]" />
        <div className="absolute -left-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(66_217_255/0.1),transparent_62%)]" />
      </div>

      <div className="container-page grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="lg:pt-6">
          <p className="eyebrow" data-reveal="fade">
            <span className="text-accent">06</span>
            {contact.label}
          </p>
          <h2 id="contato-title" data-reveal className="mt-6 text-display font-semibold text-fg">
            {contact.title}
          </h2>
          <p data-reveal className="mt-7 max-w-lg text-lead text-muted">
            {contact.text}
          </p>

          <div data-reveal className="mt-12 max-w-md">
            <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">{contact.nextStepsTitle}</h3>
            <ol className="mt-5 space-y-4">
              {contact.nextSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-4 text-fg">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[0.7rem] text-accent shadow-[0_0_0_1px_var(--color-line-strong)_inset]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-subtle">{contact.reassurance}</p>
          </div>

          {channels.length > 0 ? (
            <div data-reveal className="mt-12 border-t border-line pt-8">
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">Outros canais</h3>
              <ul className="mt-4 flex flex-wrap gap-3">
                {channels.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.href}
                      className="btn btn-ghost min-h-11 text-sm"
                      {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span className="text-subtle">{c.label}</span>
                      <span className="break-all">{c.id === "whatsapp" ? "Abrir conversa" : c.value}</span>
                      {c.external ? (
                        <>
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                          <span className="sr-only">(abre em nova aba)</span>
                        </>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-10 flex flex-wrap gap-2">
              <PendingNote>e-mail, WhatsApp e telefone comerciais</PendingNote>
              {!deliveryEnabled ? <PendingNote>serviço de envio do formulário</PendingNote> : null}
            </p>
          )}
        </div>

        <div data-reveal>
          <ContactForm deliveryEnabled={deliveryEnabled} channels={channels} />
        </div>
      </div>
    </section>
  );
}
