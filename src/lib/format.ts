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

export function formatIsoDateBr(isoDate: string) {
  const trimmed = isoDate.trim();
  if (!trimmed) return "";
  return trimmed.split("-").reverse().join("/");
}

export function todayIsoDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildRentalMessage(
  productName: string,
  price: number,
  eventDate?: string,
  clientName?: string,
) {
  const formattedPrice = brl(price).replace(/\u00a0/g, " ");
  const formattedDate = eventDate ? formatIsoDateBr(eventDate) : "";
  const base = formattedDate
    ? `Olá! Vi a ${productName} (${formattedPrice}) no site da Amora e gostaria de saber se está disponível para aluguel no dia ${formattedDate}.`
    : `Olá! Vi a ${productName} (${formattedPrice}) no site da Amora e gostaria de saber sobre a disponibilidade para aluguel.`;
  const trimmedName = clientName?.trim();
  return trimmedName ? `${base}\nMeu nome é ${trimmedName}.` : base;
}

export function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
