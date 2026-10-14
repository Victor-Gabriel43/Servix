import { getSiteUrl, siteConfig } from "@/config/site";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { About } from "@/components/sections/About";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Process } from "@/components/sections/Process";
import { Products } from "@/components/sections/Products";
import { Solution } from "@/components/sections/Solution";

/** Dados estruturados mínimos e verdadeiros — só com domínio oficial definido. */
function OrganizationJsonLd() {
  const url = getSiteUrl();
  if (!url) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName ?? siteConfig.name,
    url: url.toString(),
    description: siteConfig.description,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(siteConfig.social.length ? { sameAs: siteConfig.social.map((s) => s.url) } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <Problem />
        <Solution />
        <Capabilities />
        <Process />
        <Products />
        <About />
        <Contact />
      </main>
      <Footer />
      <OrganizationJsonLd />
    </>
  );
}
