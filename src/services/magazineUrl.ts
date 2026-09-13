/**
 * Gera a URL da página WordPress que contém os shortcodes do 3D FlipBook.
 *
 * O padrão de slug no WordPress é:
 *   https://zimnymagazine.com/zimny-magazine-edicao-{NN}/
 *
 * @param editionNumber - Número da edição (ex: "1", "7", "12")
 * @returns URL completa da página WordPress
 *
 * @example
 *   getMagazineUrl("7")   // → "https://zimnymagazine.com/zimny-magazine-edicao-07/"
 *   getMagazineUrl("12")  // → "https://zimnymagazine.com/zimny-magazine-edicao-12/"
 */
export function getMagazineUrl(editionNumber: string): string {
  const base = "https://zimnymagazine.com/zimny-magazine-edicao";
  const padded = String(editionNumber).padStart(2, "0");
  return `${base}-${padded}/?app=true`;
}