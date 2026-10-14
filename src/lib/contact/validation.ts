/**
 * Validação do formulário de contato. Compartilhada entre o navegador
 * (feedback imediato) e o servidor (fonte de verdade).
 */

export const contactLimits = {
  name: { min: 2, max: 80 },
  company: { max: 100 },
  contact: { max: 120 },
  message: { min: 20, max: 2000 },
} as const;

export type ContactField = "name" | "company" | "contact" | "message";

export interface ContactInput {
  name: string;
  company: string;
  contact: string;
  message: string;
}

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactKind = "email" | "phone";

export interface ValidContact extends ContactInput {
  contactKind: ContactKind;
}

export type ValidationResult =
  | { ok: true; data: ValidContact }
  | { ok: false; errors: ContactErrors };

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Remove caracteres de controle e normaliza espaços. */
function clean(value: unknown, { multiline = false } = {}): string {
  if (typeof value !== "string") return "";
  const withoutControl = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (multiline) {
    return withoutControl.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  return withoutControl.replace(/\s+/g, " ").trim();
}

export function detectContactKind(value: string): ContactKind | null {
  if (EMAIL_RE.test(value)) return "email";
  const digits = value.replace(/\D/g, "");
  // Telefones brasileiros: 10–11 dígitos; com DDI, até 13. Internacionais até 15.
  const onlyPhoneChars = /^[+\d\s().-]+$/.test(value);
  if (onlyPhoneChars && digits.length >= 10 && digits.length <= 15) return "phone";
  return null;
}

export function normalizeContactInput(raw: Partial<Record<ContactField, unknown>>): ContactInput {
  return {
    name: clean(raw.name),
    company: clean(raw.company),
    contact: clean(raw.contact),
    message: clean(raw.message, { multiline: true }),
  };
}

export function validateContact(raw: Partial<Record<ContactField, unknown>>): ValidationResult {
  const input = normalizeContactInput(raw);
  const errors: ContactErrors = {};

  if (!input.name) {
    errors.name = "Informe seu nome.";
  } else if (input.name.length < contactLimits.name.min) {
    errors.name = "O nome precisa ter pelo menos 2 caracteres.";
  } else if (input.name.length > contactLimits.name.max) {
    errors.name = `Use no máximo ${contactLimits.name.max} caracteres.`;
  }

  if (input.company.length > contactLimits.company.max) {
    errors.company = `Use no máximo ${contactLimits.company.max} caracteres.`;
  }

  const contactKind = input.contact ? detectContactKind(input.contact) : null;
  if (!input.contact) {
    errors.contact = "Informe um e-mail ou telefone para retorno.";
  } else if (input.contact.length > contactLimits.contact.max) {
    errors.contact = `Use no máximo ${contactLimits.contact.max} caracteres.`;
  } else if (!contactKind) {
    errors.contact = "Informe um e-mail válido ou um telefone com DDD.";
  }

  if (!input.message) {
    errors.message = "Conte brevemente qual é a necessidade do seu negócio.";
  } else if (input.message.length < contactLimits.message.min) {
    errors.message = `Escreva pelo menos ${contactLimits.message.min} caracteres para entendermos o contexto.`;
  } else if (input.message.length > contactLimits.message.max) {
    errors.message = `Use no máximo ${contactLimits.message.max} caracteres.`;
  }

  if (Object.keys(errors).length > 0 || !contactKind) {
    return { ok: false, errors };
  }

  return { ok: true, data: { ...input, contactKind } };
}
