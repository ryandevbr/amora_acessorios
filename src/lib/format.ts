export const WHATSAPP_NUMBER = "5531988813158";

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type CartLine = { id: string; name: string; unitPrice: number; qty: number };
export type Delivery = "retirada" | "entrega";

export function cartTotal(lines: CartLine[]) {
  return Math.round(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0) * 100) / 100;
}

export function buildOrderMessage(lines: CartLine[], delivery: Delivery, name?: string) {
  const out = ["Olá, Amora! Gostaria de fazer um pedido:", ""];
  if (name?.trim()) out.push(`*Nome:* ${name.trim()}`, "");
  out.push("*Itens:*");
  for (const l of lines) out.push(`• ${l.qty}x ${l.name} — ${brl(l.unitPrice * l.qty)}`);
  out.push("", `*Recebimento:* ${delivery === "entrega" ? "Entrega" : "Retirar na loja"}`);
  out.push(`*Total:* ${brl(cartTotal(lines))}`);
  return out.join("\n");
}

export function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
