import type { BuyerInput, DecisionResult, Timeline, Urgency, Verdict } from "@/types/buyer";

/**
 * Moteur de décision premier acheteur — fixe vs variable, traduction d'une
 * logique de tolérance au risque standard en courtage hypothécaire.
 *
 * Le choc de paiement (+200$/mois) est le facteur DOMINANT : c'est la
 * question qui mesure directement le risque réel du taux variable (un
 * paiement qui peut augmenter). Le type de revenu et les dettes ajustent la
 * marge de manoeuvre autour de ce facteur dominant.
 *
 * La durée de détention prévue (horizon) n'entre JAMAIS dans ce score : un
 * horizon court réduit le risque de pénalité si on revend vite, mais ça ne
 * change rien au fait qu'une personne qui "panique" à l'idée d'une hausse de
 * paiement ne devrait pas se faire pousser vers un variable à cause de ça.
 * L'horizon court est donc transmis séparément (shortHorizonNote) comme une
 * piste à discuter avec Kevin (terme plus court), jamais comme un correctif
 * au verdict fixe/variable. Voir lib/messages.ts (buildContextNotes).
 */
export const RISK_POINTS = {
  paymentShock: { pas_grave: 0, serre: 20, panique: 45 },
  income: { salarie: 0, autonome: 10, saisonnier_chomage: 20 },
  debtPerType: 5,
} as const;

export const SCORE_MAX = 80; // 45 (panique) + 20 (saisonnier) + 3 * 5 (dettes)

const SEUIL_VARIABLE = 10;
const SEUIL_EQUILIBRE = 35;
const SEUIL_FIXE = 55;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Date de rappel suggérée — pas un calcul de fenêtre comme pour un
 * renouvellement (pas d'échéance fixe ici), juste un délai raisonnable selon
 * l'urgence déclarée par le client.
 */
function relanceDateFromTimeline(timeline: Timeline): string {
  const d = new Date();
  switch (timeline) {
    case "moins_3_mois":
      d.setUTCDate(d.getUTCDate() + 3);
      break;
    case "3_6_mois":
      d.setUTCDate(d.getUTCDate() + 42);
      break;
    case "6_12_mois":
      d.setUTCMonth(d.getUTCMonth() + 4);
      break;
    case "juste_curieux":
    default:
      d.setUTCMonth(d.getUTCMonth() + 6);
      break;
  }
  return isoDate(d);
}

function urgencyFromTimeline(timeline: Timeline): Urgency {
  switch (timeline) {
    case "moins_3_mois":
      return "CHAUD";
    case "3_6_mois":
      return "TIEDE";
    case "6_12_mois":
      return "A_SURVEILLER";
    case "juste_curieux":
    default:
      return "EXPLORATEUR";
  }
}

export function computeRiskScore(input: Pick<BuyerInput, "paymentShock" | "income" | "debts">): number {
  const base =
    RISK_POINTS.paymentShock[input.paymentShock] +
    RISK_POINTS.income[input.income] +
    input.debts.length * RISK_POINTS.debtPerType;
  return Math.min(SCORE_MAX, base);
}

function verdictFromScore(score: number): Verdict {
  if (score <= SEUIL_VARIABLE) return "VARIABLE_ENVISAGEABLE";
  if (score <= SEUIL_EQUILIBRE) return "EQUILIBRE_A_DISCUTER";
  if (score <= SEUIL_FIXE) return "FIXE_RECOMMANDE";
  return "FIXE_FORTEMENT_RECOMMANDE";
}

export function analyserProfilAcheteur(input: BuyerInput): DecisionResult {
  const riskScore = computeRiskScore(input);
  const verdict = verdictFromScore(riskScore);

  return {
    verdict,
    riskScore,
    urgency: urgencyFromTimeline(input.timeline),
    relance: relanceDateFromTimeline(input.timeline),
    shortHorizonNote: input.horizon === "moins_3_ans",
    debtsCount: input.debts.length,
  };
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  VARIABLE_ENVISAGEABLE: "Le taux variable pourrait te convenir",
  EQUILIBRE_A_DISCUTER: "Fixe ou variable : ça se discute",
  FIXE_RECOMMANDE: "Le taux fixe est probablement le bon choix",
  FIXE_FORTEMENT_RECOMMANDE: "Priorise la stabilité : taux fixe recommandé",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  CHAUD: "Prêt(e) à agir bientôt",
  TIEDE: "Ça s'en vient",
  A_SURVEILLER: "À suivre",
  EXPLORATEUR: "En exploration",
};
