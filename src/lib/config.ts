/**
 * Configuration globale de l'outil premier acheteur.
 *
 * Coordonnées confirmées via la carte d'affaires et la palette fournies par
 * Kevin le 2026-11-03. Pas de pixel Meta ni de projet Clarity connus pour
 * l'instant — voir NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_CLARITY_ID dans
 * .env.example, à brancher une fois que Kevin les aura confirmés.
 */
export const buyerConfig = {
  brokerName: "Kevin Péris",
  brokerTitle: "Courtier hypothécaire · Multi-Prêts Hypothèques",
  brokerPhone: "819 319-9783",
  brokerPhoneTel: "+18193199783",
  brokerEmail: "kperis@multi-prets.ca",
  brokerWebsite: "https://kevinperis.com",
  // Pas de lien d'agenda en ligne connu pour l'instant — le CTA principal
  // est "Appeler" / "Texter" / "Courriel", voir ui/BrokerCard.tsx.
  calendarLink: "",
};

export type BuyerConfig = typeof buyerConfig;
