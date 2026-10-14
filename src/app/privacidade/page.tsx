import Link from "next/link";
import type { Metadata } from "next";

import { getSiteUrl, siteConfig } from "@/config/site";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PendingNote } from "@/components/ui/PendingNote";

export const metadata: Metadata = {
  title: "Aviso de privacidade",
  description: "Como a Servix trata as informações enviadas pelo formulário de contato do site.",
  ...(getSiteUrl() ? { alternates: { canonical: "/privacidade" } } : {}),
};

/*
 * VERSÃO PRELIMINAR. Este texto descreve fielmente o funcionamento atual do
 * site, mas precisa de revisão jurídica e dos dados do controlador
 * (razão social, CNPJ e canal de contato) antes da publicação oficial.
 */
export default function PrivacyPage() {
  const { legalName, taxId, contact } = siteConfig;
  const controller = legalName ? `${legalName}${taxId ? `, CNPJ ${taxId}` : ""}` : "Servix";

  return (
    <>
      <Header />
      <main id="conteudo" tabIndex={-1} className="pb-24 pt-32 outline-none md:pt-40">
        <article className="container-page max-w-3xl">
          <p className="eyebrow">Institucional</p>
          <h1 className="mt-6 text-title font-semibold">Aviso de privacidade</h1>

          <p
            role="note"
            className="mt-8 rounded-xl border border-dashed border-[#f5c26b]/60 bg-[#f5c26b]/5 px-4 py-3 text-sm leading-relaxed text-[#f7d494]"
          >
            Versão preliminar. Este aviso será revisado e completado antes da publicação oficial do site.
          </p>

          <div className="mt-12 space-y-10 leading-relaxed text-muted [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-fg [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
            <section>
              <h2>Quem é responsável pelos dados</h2>
              <p>
                As informações enviadas por este site são tratadas por {controller}.{" "}
                {!legalName || !taxId ? <PendingNote>razão social e CNPJ</PendingNote> : null}
              </p>
            </section>

            <section>
              <h2>Quais dados coletamos</h2>
              <p>Coletamos apenas o que você informa no formulário de contato:</p>
              <ul>
                <li>nome;</li>
                <li>nome da empresa (opcional);</li>
                <li>e-mail ou telefone para retorno;</li>
                <li>a descrição da necessidade do seu negócio.</li>
              </ul>
              <p>
                Para proteger o formulário contra abuso, o endereço IP da requisição é usado temporariamente, em
                memória, para limitar o número de envios. Ele não é gravado pelo site. O provedor de hospedagem pode
                manter registros técnicos de acesso conforme suas próprias políticas.
              </p>
            </section>

            <section>
              <h2>Para que usamos</h2>
              <p>
                Usamos esses dados exclusivamente para responder ao seu contato e conversar sobre a sua necessidade.
                Não os utilizamos para publicidade e não os vendemos ou compartilhamos para fins comerciais.
              </p>
            </section>

            <section>
              <h2>Como as mensagens são tratadas</h2>
              <p>
                O site não guarda as mensagens em banco de dados. Ao enviar o formulário, o conteúdo é repassado,
                por meio de um provedor de envio de e-mails, para a caixa de e-mail comercial da Servix.
              </p>
            </section>

            <section>
              <h2>Cookies e rastreamento</h2>
              <p>
                Este site não utiliza cookies de rastreamento, ferramentas de análise de audiência ou pixels de
                publicidade.
              </p>
            </section>

            <section>
              <h2>Seus direitos</h2>
              <p>
                Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a
                confirmação do tratamento, o acesso, a correção ou a exclusão dos seus dados.
              </p>
              <p>
                {contact.email ? (
                  <>
                    Para isso, escreva para{" "}
                    <a href={`mailto:${contact.email}`} className="text-fg underline underline-offset-2">
                      {contact.email}
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Para isso, utilize o <Link href="/#contato" className="text-fg underline underline-offset-2">formulário de contato</Link>.{" "}
                    <PendingNote>e-mail para solicitações de privacidade</PendingNote>
                  </>
                )}
              </p>
            </section>

            <section>
              <h2>Atualizações</h2>
              <p>Este aviso pode ser atualizado para refletir mudanças no site ou na legislação.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
