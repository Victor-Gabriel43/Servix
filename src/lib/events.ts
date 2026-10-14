/** Evento usado para levar as áreas escolhidas no esboço para o formulário. */
export const PREFILL_EVENT = "servix:prefill-contact";

export interface PrefillDetail {
  areas: string[];
}

export function buildPrefillMessage(areas: string[]): string {
  if (areas.length === 0) return "";
  const list =
    areas.length === 1 ? areas[0] : `${areas.slice(0, -1).join(", ")} e ${areas[areas.length - 1]}`;
  return `Gostaria de conversar sobre um sistema para organizar: ${list}.\n\nHoje, no meu negócio, `;
}
