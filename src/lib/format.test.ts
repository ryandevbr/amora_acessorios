import { describe, it, expect } from "vitest";
import { cartTotal, buildOrderMessage, WHATSAPP_NUMBER } from "./format";

const lines = [
  { id: "a", name: "Brinco", unitPrice: 49.9, qty: 2 },
  { id: "b", name: "Colar", unitPrice: 64.9, qty: 1 },
];

describe("pedido", () => {
  it("soma o total", () => expect(cartTotal(lines)).toBe(164.7));
  it("usa o número da loja", () => expect(WHATSAPP_NUMBER).toBe("5531997515006"));
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
