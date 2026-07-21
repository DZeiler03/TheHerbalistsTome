export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

export const FLAG_URL = (code: string) =>
  `https://flagcdn.com/w80/${code.toLowerCase()}.png`;

export function tName(
  lang: "en" | "de",
  item: { nameEn: string; nameDe: string }
): string {
  return lang === "de" ? item.nameDe : item.nameEn;
}

export function tDesc(
  lang: "en" | "de",
  item: { descriptionEn: string; descriptionDe: string }
): string {
  return lang === "de" ? item.descriptionDe : item.descriptionEn;
}
