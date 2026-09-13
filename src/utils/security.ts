/**
 * Aceita somente URLs HTTPS absolutas vindas do WordPress.
 * Evita esquemas executáveis e caracteres capazes de quebrar HTML inline.
 */
export function getSafeHttpsUrl(value: unknown): string {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!/^https:\/\/[^\s"'<>]+$/i.test(trimmed)) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

/** Escapa texto usado entre aspas em atributos HTML. */
export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
