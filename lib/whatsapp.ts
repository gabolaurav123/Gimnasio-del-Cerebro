export const DEFAULT_WHATSAPP_NUMBER = "543813004167";

export function normalizeWhatsAppNumber(number?: string | null) {
  const normalized = (number ?? "").replace(/\D/g, "");
  return normalized.length >= 8 && normalized.length <= 15 ? normalized : DEFAULT_WHATSAPP_NUMBER;
}

export const whatsappUrl = (message: string, number?: string | null) =>
  `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;

export function formatWhatsAppNumber(number?: string | null) {
  const normalized = normalizeWhatsAppNumber(number);
  return `+${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5, 8)}-${normalized.slice(8)}`;
}
