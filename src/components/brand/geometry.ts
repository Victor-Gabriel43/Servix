/**
 * Geometria vetorial da marca Servix (monograma "SX" e logotipo "SERVIX").
 *
 * Redesenhada em SVG a partir das imagens do logotipo enviadas pela empresa.
 * Quando o arquivo vetorial original (SVG/AI/PDF) estiver disponível,
 * substitua os pontos abaixo — todos os usos do site derivam deste arquivo.
 */

/** "S" angular, compartilhado pelo monograma e pelo logotipo. */
export const S_POINTS =
  "963,165 870,232 735,289 795,297 942,345 880,402 595,477 700,393 840,352 705,333 623,300 730,222";

/** "X" do monograma. */
export const X_POINTS =
  "972,238 1078,238 1130,293 1215,222 1368,180 1182,318 1305,428 1200,428 1128,355 1040,400 893,476 1078,330";

/** Monograma SX: viewBox recortado. */
export const MONOGRAM_VIEWBOX = "585 160 793 326";

/* Letras "ERVIX" do logotipo, alinhadas à barra central do S
   (topo y=297, base y=350, traço de 12). */
const T = 297;
const B = 350;

function e(x: number) {
  return `M${x} ${T}h72v11h-60v10h56v11h-56v10h60v11h-72z`;
}
function r(x: number) {
  // Contorno externo (horário) + furo da barriga (anti-horário).
  return `M${x} ${T}h62a15 15 0 0 1 0 30h-4l24 23h-16l-24-23h-30v23h-12zm12 11v8h50a4 4 0 0 0 0-8z`;
}
function v(x: number) {
  return `M${x} ${T}h17l40 39 40-39h17l-50 ${B - T}h-14z`;
}
function i(x: number) {
  return `M${x} ${T}h12v${B - T}h-12z`;
}
function xLetter(x: number) {
  return `M${x} ${T}h28l32 18.5 32-18.5h28l-46 26.5 46 26.5h-28l-32-18.5-32 18.5h-28l46-26.5z`;
}

/** Letras com origem em x=0; posicionadas e ampliadas por WORDMARK_LETTERS_TRANSFORM. */
export const WORDMARK_LETTERS = [e(0), r(150), v(312), i(504), xLetter(594)].join("");
export const WORDMARK_LETTERS_TRANSFORM = "translate(900 350) scale(1.14) translate(0 -350)";

/** No logotipo, o S é levemente mais estreito que no monograma. */
export const WORDMARK_S_TRANSFORM = "translate(595 0) scale(0.85 1) translate(-595 0)";

/** Logotipo completo: viewBox recortado. */
export const WORDMARK_VIEWBOX = "590 160 1132 326";
