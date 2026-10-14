"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { ContactChannel } from "@/lib/links";
import { PREFILL_EVENT, buildPrefillMessage, type PrefillDetail } from "@/lib/events";
import {
  contactLimits,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from "@/lib/contact/validation";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; code: string };

const EMPTY: ContactInput = { name: "", company: "", contact: "", message: "" };
const FIELD_ORDER: ContactField[] = ["name", "company", "contact", "message"];

const errorMessages: Record<string, string> = {
  not_configured:
    "O envio por este formulário ainda não está ativo. Sua mensagem não foi enviada.",
  rate_limited: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  invalid: "Revise os campos destacados e tente novamente.",
  network: "Não foi possível conectar. Verifique sua internet e tente novamente.",
  default: "Não conseguimos enviar sua mensagem agora. Tente novamente em instantes.",
};

interface ContactFormProps {
  /** Se o envio real (e-mail) está configurado no servidor. */
  deliveryEnabled: boolean;
  /** Canais alternativos configurados, exibidos em caso de falha. */
  channels: ContactChannel[];
}

export function ContactForm({ deliveryEnabled, channels }: ContactFormProps) {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;

  // Recebe as áreas escolhidas no esboço da seção "Soluções".
  useEffect(() => {
    const onPrefill = (event: Event) => {
      const { areas } = (event as CustomEvent<PrefillDetail>).detail;
      const text = buildPrefillMessage(areas);
      setStatus((s) => (s.kind === "success" ? { kind: "idle" } : s));
      setValues((v) => ({ ...v, message: v.message.trim() ? `${v.message.trim()}\n\n${text}` : text }));
      requestAnimationFrame(() => {
        const el = messageRef.current;
        if (!el) return;
        el.focus({ preventScroll: true });
        el.setSelectionRange(el.value.length, el.value.length);
      });
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status.kind]);

  const update = (field: ContactField) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (touched) {
      const result = validateContact(next);
      setErrors(result.ok ? {} : result.errors);
    }
  };

  const focusFirstError = (errs: ContactErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "submitting") return;
    setTouched(true);

    const result = validateContact(values);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus({ kind: "error", code: "invalid" });
      focusFirstError(result.errors);
      return;
    }
    setErrors({});
    setStatus({ kind: "submitting" });

    const honeypot = new FormData(event.currentTarget).get("website");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot ?? "" }),
        signal: controller.signal,
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        errors?: ContactErrors;
      } | null;

      if (response.ok && body?.ok) {
        setStatus({ kind: "success" });
        setValues(EMPTY);
        setTouched(false);
        return;
      }
      if (body?.errors) {
        setErrors(body.errors);
        focusFirstError(body.errors);
      }
      setStatus({ kind: "error", code: body?.code ?? "default" });
    } catch {
      setStatus({ kind: "error", code: "network" });
    } finally {
      window.clearTimeout(timeout);
    }
  };

  if (status.kind === "success") {
    return (
      <div className="panel flex min-h-[28rem] flex-col items-start justify-center p-8 sm:p-10" role="status">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h3 ref={successRef} tabIndex={-1} className="mt-6 text-2xl font-medium text-fg focus:outline-none">
          Mensagem enviada.
        </h3>
        <p className="mt-3 max-w-sm leading-relaxed text-muted">
          Obrigado por contar sobre o seu negócio. Vamos ler com atenção e retornar pelo contato que você informou.
        </p>
        <button type="button" className="btn btn-ghost mt-8" onClick={() => setStatus({ kind: "idle" })}>
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const errorCode = status.kind === "error" ? status.code : null;

  const fieldProps = (field: ContactField, describedBy?: string) => ({
    id: id(field),
    name: field,
    value: values[field],
    onChange: update(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": [describedBy, errors[field] ? id(`${field}-error`) : null].filter(Boolean).join(" ") || undefined,
    className: "field",
  });

  const fieldError = (field: ContactField) =>
    errors[field] ? (
      <p id={id(`${field}-error`)} className="mt-2 flex items-start gap-1.5 text-sm text-danger">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={id("title")}
      aria-busy={submitting}
      className="panel p-6 sm:p-8"
      data-testid="contact-form"
    >
      <h3 id={id("title")} className="text-xl font-medium text-fg">
        Fale sobre o seu negócio
      </h3>
      <p className="mt-1.5 text-sm text-muted">
        Leva cerca de dois minutos. Campos marcados com <span aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> são obrigatórios.
      </p>

      {!deliveryEnabled ? (
        <p
          role="note"
          className="mt-5 rounded-xl border border-dashed border-[#f5c26b]/60 bg-[#f5c26b]/5 px-4 py-3 text-sm leading-relaxed text-[#f7d494]"
        >
          Formulário em ativação: o envio de mensagens ainda não está disponível.
          {channels.length > 0 ? " Use um dos canais ao lado enquanto isso." : null}
        </p>
      ) : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className="mb-2 block text-sm font-medium text-fg">
            Nome <span aria-hidden="true" className="text-accent">*</span>
          </label>
          <input {...fieldProps("name")} type="text" autoComplete="name" required maxLength={contactLimits.name.max} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor={id("company")} className="mb-2 block text-sm font-medium text-fg">
            Empresa <span className="font-normal text-subtle">(opcional)</span>
          </label>
          <input
            {...fieldProps("company")}
            type="text"
            autoComplete="organization"
            maxLength={contactLimits.company.max}
          />
          {fieldError("company")}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={id("contact")} className="mb-2 block text-sm font-medium text-fg">
          E-mail ou telefone para retorno <span aria-hidden="true" className="text-accent">*</span>
        </label>
        <input
          {...fieldProps("contact", id("contact-hint"))}
          type="text"
          autoComplete="email"
          required
          maxLength={contactLimits.contact.max}
        />
        <p id={id("contact-hint")} className="mt-2 text-xs text-subtle">
          Ex.: voce@empresa.com.br ou (00) 00000-0000 — use o canal em que prefere ser contatado.
        </p>
        {fieldError("contact")}
      </div>

      <div className="mt-5">
        <label htmlFor={id("message")} className="mb-2 block text-sm font-medium text-fg">
          Qual é a necessidade do seu negócio? <span aria-hidden="true" className="text-accent">*</span>
        </label>
        <textarea
          {...fieldProps("message", id("message-hint"))}
          ref={messageRef}
          rows={5}
          required
          maxLength={contactLimits.message.max}
          placeholder="Ex.: hoje controlamos os pedidos em uma planilha e pelo WhatsApp, e fica difícil saber o que já foi entregue."
          className="field min-h-36 resize-y leading-relaxed"
        />
        <div className="mt-2 flex items-start justify-between gap-4 text-xs text-subtle">
          <p id={id("message-hint")}>Descreva com suas palavras — não precisa de termos técnicos.</p>
          <span aria-hidden="true" className="shrink-0 tabular-nums">
            {values.message.length}/{contactLimits.message.max}
          </span>
        </div>
        {fieldError("message")}
      </div>

      {/* Campo-armadilha para robôs: invisível e fora da ordem de tabulação. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={id("website")}>Não preencha este campo</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div aria-live="assertive" className="empty:hidden">
        {errorCode ? (
          <div role="alert" className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm leading-relaxed text-danger">
            <p className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {errorMessages[errorCode] ?? errorMessages.default}
            </p>
            {errorCode !== "invalid" && channels.length > 0 ? (
              <p className="mt-2 pl-6 text-muted">
                Você também pode falar conosco por{" "}
                {channels.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 ? (i === channels.length - 1 ? " ou " : ", ") : null}
                    <a href={c.href} className="text-fg underline underline-offset-2">
                      {c.label}
                    </a>
                  </span>
                ))}
                .
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-subtle sm:max-w-[16rem]">
          Usamos seus dados apenas para responder a este contato. Veja o{" "}
          <a href="/privacidade" className="text-muted underline underline-offset-2 hover:text-fg">
            aviso de privacidade
          </a>
          .
        </p>
        <button type="submit" className="btn btn-primary w-full shrink-0 sm:w-auto" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enviando…
            </>
          ) : (
            <>
              Enviar mensagem
              <ArrowRight className="btn-icon size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
