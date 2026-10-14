import { siteConfig } from "@/config/site";

export interface ContactChannel {
  id: "email" | "whatsapp" | "phone";
  label: string;
  value: string;
  href: string;
  external: boolean;
}

export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Apenas canais efetivamente configurados — nunca links vazios ou "#". */
export function getContactChannels(config = siteConfig): ContactChannel[] {
  const { email, whatsapp, phone, whatsappMessage } = config.contact;
  const channels: ContactChannel[] = [];

  if (email) {
    channels.push({ id: "email", label: "E-mail", value: email, href: `mailto:${email}`, external: false });
  }
  if (whatsapp) {
    channels.push({
      id: "whatsapp",
      label: "WhatsApp",
      value: "Conversar pelo WhatsApp",
      href: whatsappUrl(whatsapp, whatsappMessage),
      external: true,
    });
  }
  if (phone) {
    channels.push({
      id: "phone",
      label: "Telefone",
      value: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
      external: false,
    });
  }
  return channels;
}
