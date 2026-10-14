import { ImageResponse } from "next/og";

import {
  S_POINTS,
  WORDMARK_LETTERS,
  WORDMARK_LETTERS_TRANSFORM,
  WORDMARK_S_TRANSFORM,
  WORDMARK_VIEWBOX,
} from "@/components/brand/geometry";

export const alt = "Servix — Sistemas sob medida para pequenos negócios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORDMARK_VIEWBOX}" fill="#F5F7FA"><polygon points="${S_POINTS}" transform="${WORDMARK_S_TRANSFORM}"/><path fill-rule="evenodd" transform="${WORDMARK_LETTERS_TRANSFORM}" d="${WORDMARK_LETTERS}"/></svg>`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "radial-gradient(circle at 85% 30%, rgba(66,217,255,0.18), transparent 45%), #000000",
          color: "#F5F7FA",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(logo)}`} width={348} height={100} />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 26, color: "#42D9FF", letterSpacing: 4, textTransform: "uppercase" }}>
            Sistemas sob medida para pequenos negócios
          </div>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.05, maxWidth: 940, letterSpacing: -2 }}>
            A rotina do seu negócio, organizada em um sistema feito para ela.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
