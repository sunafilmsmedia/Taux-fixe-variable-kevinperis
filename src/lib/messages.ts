import type { BuyerInput, DecisionResult, Verdict } from "@/types/buyer";

export interface VerdictContent {
  verdict: Verdict;
  headline: string;
  message: string;
  cta: string;
  tone: "positive" | "urgent" | "neutral" | "info";
}

export function buildVerdictContent(input: BuyerInput, decision: DecisionResult): VerdictContent {
  switch (decision.verdict) {
    case "VARIABLE_ENVISAGEABLE":
      return {
        verdict: decision.verdict,
        headline: "Le taux variable pourrait te convenir",
        message:
          "Ton profil montre une bonne marge de manoeuvre : revenu stable, peu de dettes, et une hausse de paiement ne te ferait pas paniquer. Le taux variable part historiquement souvent plus bas que le fixe — ça pourrait valoir la peine d'en discuter avec Kevin, qui va comparer les deux options avec les vrais chiffres de ton dossier.",
        cta: "Comparer fixe et variable avec Kevin",
        tone: "positive",
      };

    case "EQUILIBRE_A_DISCUTER":
      return {
        verdict: decision.verdict,
        headline: "Fixe ou variable : ça se discute",
        message:
          "Ton profil est entre les deux : ni assez à l'aise pour foncer en variable les yeux fermés, ni assez serré pour que le fixe s'impose d'emblée. C'est exactement le genre de dossier où une conversation avec Kevin fait la différence — il va regarder ta capacité de paiement réelle et te proposer l'option qui te convient le mieux.",
        cta: "Discuter de mon profil avec Kevin",
        tone: "neutral",
      };

    case "FIXE_RECOMMANDE":
      return {
        verdict: decision.verdict,
        headline: "Le taux fixe est probablement le bon choix",
        message:
          "Selon tes réponses, une hausse de paiement te mettrait de la pression — le taux fixe t'offre un paiement qui ne bouge pas pendant tout ton terme, ce qui protège ton budget pendant que tu t'installes dans ta nouvelle vie de propriétaire.",
        cta: "Sécuriser un taux fixe avec Kevin",
        tone: "neutral",
      };

    case "FIXE_FORTEMENT_RECOMMANDE":
    default:
      return {
        verdict: decision.verdict,
        headline: "Priorise la stabilité : taux fixe recommandé",
        message:
          "Entre ton type de revenu, tes dettes actuelles et ta tolérance à une hausse de paiement, la priorité pour toi c'est un paiement prévisible et stable. Kevin peut t'aider à bâtir un dossier solide avec un taux fixe, et à structurer ton budget pour que ton premier achat se passe bien.",
        cta: "Bâtir mon dossier avec Kevin",
        tone: "urgent",
      };
  }
}

/**
 * Notes contextuelles additionnelles — jamais injectées dans le score ou le
 * verdict (voir lib/decision.ts), seulement affichées comme pistes de
 * discussion avec Kevin.
 */
export function buildContextNotes(input: BuyerInput): string[] {
  const notes: string[] = [];

  if (input.horizon === "moins_3_ans") {
    notes.push(
      "Comme tu prévois rester moins de 3 ans, parles-en à Kevin : un terme plus court (1 ou 2 ans) peut éviter une grosse pénalité si tu revends plus vite que prévu, peu importe fixe ou variable."
    );
  }
  if (input.propertyType === "condo") {
    notes.push(
      "N'oublie pas d'inclure les frais de condo dans ton budget mensuel — Kevin peut t'aider à les intégrer au calcul."
    );
  }
  if (input.propertyType === "duplex") {
    notes.push(
      "Un revenu de loyer peut parfois être considéré dans ta capacité d'emprunt pour un duplex — à valider avec Kevin."
    );
  }
  if (input.downPaymentSource === "don_parents") {
    notes.push(
      "Une mise de fonds qui vient d'un don familial demande une lettre de don — Kevin va te guider pour ce document."
    );
  }
  if (input.downPaymentSource === "reer_celiapp") {
    notes.push(
      "Le RAP (REER) et le CELIAPP sont deux outils pensés pour les premiers acheteurs — Kevin peut t'expliquer comment les combiner."
    );
  }

  return notes;
}

export function formatDateFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
