import { describe, expect, it } from "vitest";

import { detectContactKind, validateContact } from "@/lib/contact/validation";

const valid = {
  name: "Maria Souza",
  company: "",
  contact: "maria@exemplo.com.br",
  message: "Controlamos os pedidos em uma planilha e queremos organizar melhor.",
};

describe("validateContact", () => {
  it("aceita dados válidos e identifica e-mail", () => {
    const result = validateContact(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.contactKind).toBe("email");
  });

  it("aceita telefone brasileiro com DDD", () => {
    const result = validateContact({ ...valid, contact: "(11) 91234-5678" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.contactKind).toBe("phone");
  });

  it("exige nome, contato e mensagem", () => {
    const result = validateContact({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["contact", "message", "name"]);
      expect(result.errors.company).toBeUndefined();
    }
  });

  it("rejeita contato que não é e-mail nem telefone", () => {
    const result = validateContact({ ...valid, contact: "me liga" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.contact).toMatch(/e-mail válido/);
  });

  it("rejeita mensagem curta demais e longa demais", () => {
    expect(validateContact({ ...valid, message: "curta" }).ok).toBe(false);
    expect(validateContact({ ...valid, message: "a".repeat(2001) }).ok).toBe(false);
  });

  it("limita o tamanho dos campos", () => {
    const result = validateContact({ ...valid, name: "a".repeat(81), company: "b".repeat(101) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.company).toBeDefined();
    }
  });

  it("normaliza espaços e remove caracteres de controle", () => {
    const result = validateContact({ ...valid, name: "  Maria \u0000  Souza ", message: `${valid.message}\r\n\r\n\r\n\r\nfim` });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Maria Souza");
      expect(result.data.message).toBe(`${valid.message}\n\nfim`);
    }
  });

  it("ignora valores que não são texto", () => {
    const result = validateContact({ name: 123, contact: ["x"], message: { a: 1 } });
    expect(result.ok).toBe(false);
  });
});

describe("detectContactKind", () => {
  it.each([
    ["contato@empresa.com", "email"],
    ["+55 11 91234-5678", "phone"],
    ["1133334444", "phone"],
    ["12345", null],
    ["email@semdominio", null],
  ])("%s → %s", (value, expected) => {
    expect(detectContactKind(value)).toBe(expected);
  });
});
