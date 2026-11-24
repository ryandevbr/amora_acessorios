import { describe, it, expect } from "vitest";
import {
  cartTotal,
  buildOrderMessage,
  buildRentalMessage,
  formatIsoDateBr,
  WHATSAPP_NUMBER,
} from "./format";

const lines = [
  { id: "a", name: "Brinco", unitPrice: 49.9, qty: 2 },
  { id: "b", name: "Colar", unitPrice: 64.9, qty: 1 },
];

describe("pedido", () => {
  it("soma o total", () => expect(cartTotal(lines)).toBe(164.7));
  it("usa o número da loja", () => expect(WHATSAPP_NUMBER).toBe("5531988813158"));
  it("mensagem tem nome, itens, recebimento e total", () => {
    const m = buildOrderMessage(lines, "entrega", "Ana");
    expect(m).toContain("Ana");
    expect(m).toContain("2x Brinco");
    expect(m).toContain("Entrega");
    expect(m.replace(/\u00a0/g, " ")).toContain("R$ 164,70");
  });
  it("sem nome não mostra a linha de nome", () => {
    expect(buildOrderMessage(lines, "retirada")).not.toContain("Nome:");
  });
});

describe("aluguel", () => {
  it("formata YYYY-MM-DD para DD/MM/AAAA sem erro de fuso", () => {
    expect(formatIsoDateBr("2026-12-05")).toBe("05/12/2026");
    expect(formatIsoDateBr("")).toBe("");
  });
  it("monta mensagem com data e nome", () => {
    const msg = buildRentalMessage("Bolsa Clutch Dourada", 80, "2026-12-05", "Maria");
    expect(msg).toBe(
      "Olá! Vi a Bolsa Clutch Dourada (R$ 80,00) no site da Amora e gostaria de saber se está disponível para aluguel no dia 05/12/2026.\nMeu nome é Maria.",
    );
  });
  it("monta mensagem sem data específica", () => {
    const msg = buildRentalMessage("Bolsa Clutch Dourada", 80);
    expect(msg).toBe(
      "Olá! Vi a Bolsa Clutch Dourada (R$ 80,00) no site da Amora e gostaria de saber sobre a disponibilidade para aluguel.",
    );
  });
});
