/**
 * contact.ts — Dados centralizados de contato comercial da Zimny Magazine.
 *
 * Fonte única de verdade para telefone, e-mail e WhatsApp usados nas CTAs
 * "Anuncie Conosco" do app (Home, Podcast, ZyTV, media kit, etc.) e na página
 * de contato (`/contato`). Ajuste os valores aqui para refletir em todo o app.
 */
import { ZIMNY_LINKS } from "./social";

export const ZIMNY_CONTACT = {
  /** Telefone / WhatsApp exibido ao usuário */
  phoneDisplay: "+1 (978) 559-6949",
  /** Apenas dígitos — usados em links `tel:` e `wa.me` */
  phoneDigits: "19785596949",
  /** E-mail comercial */
  email: "info@zimnymagazine.com",
} as const;

/** Dígitos do WhatsApp (sem símbolos). */
export const WHATSAPP_DIGITS = ZIMNY_CONTACT.phoneDigits;

/** Link de conversa do WhatsApp, com mensagem opcional pré-preenchida. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Link de e-mail (mailto:) com assunto/corpo opcionais. */
export function mailtoUrl(subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const qs = params.length > 0 ? `?${params.join("&")}` : "";
  return `mailto:${ZIMNY_CONTACT.email}${qs}`;
}

/** Link de chamada telefônica (tel:). */
export function telUrl(): string {
  return `tel:${ZIMNY_CONTACT.phoneDigits}`;
}

/** Redes sociais e site oficial da Zimny. */
export const ZIMNY_SOCIAL_LINKS = ZIMNY_LINKS;
