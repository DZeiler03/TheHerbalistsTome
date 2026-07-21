/**
 * Plant portraits use static PNG paths under /images/plants/{id}.png.
 * No bulk fetch at startup (that caused NetworkError with 100+ parallel requests).
 * Missing images fall back via the img onerror handler in the plant detail view.
 */

export async function ensurePlantImages(): Promise<void> {
  // Intentionally a no-op: images load on demand from /images/plants/{id}.png
  return;
}

export function plantImageSrc(id: string): string {
  return `/images/plants/${id}.png`;
}
