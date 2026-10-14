import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { getSiteUrl, isIndexingAllowed, siteConfig } from "@/config/site";
import { PointerSpotlight } from "@/components/ui/PointerSpotlight";

import "./globals.css";

const siteUrl = getSiteUrl();
const title = "Servix — Sistemas sob medida para pequenos negócios";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl, alternates: { canonical: "/" } } : {}),
  title: {
    default: title,
    template: "%s — Servix",
  },
  description:
    "A Servix desenvolve sistemas sob medida para pequenos negócios, construídos a partir da rotina de cada negócio para organizar informações e processos do dia a dia.",
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
  robots: isIndexingAllowed() ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">
        {children}
        <PointerSpotlight />
      </body>
    </html>
  );
}
