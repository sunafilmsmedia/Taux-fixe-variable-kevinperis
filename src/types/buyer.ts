export type IncomeType = "salarie" | "autonome" | "saisonnier_chomage";
export type PaymentShock = "pas_grave" | "serre" | "panique";
export type Horizon = "moins_3_ans" | "3_5_ans" | "5_ans_plus";
export type PropertyType = "condo" | "maison" | "duplex";
export type DownPaymentSource = "epargne" | "reer_celiapp" | "don_parents";
export type DebtType = "auto" | "cartes" | "marge";
export type Timeline = "moins_3_mois" | "3_6_mois" | "6_12_mois" | "juste_curieux";

export type Verdict =
  | "VARIABLE_ENVISAGEABLE"
  | "EQUILIBRE_A_DISCUTER"
  | "FIXE_RECOMMANDE"
  | "FIXE_FORTEMENT_RECOMMANDE";

export type Urgency = "CHAUD" | "TIEDE" | "A_SURVEILLER" | "EXPLORATEUR";

export interface BuyerInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;

  // 1. Type de revenu.
  income: IncomeType;

  // 2. Tolérance au choc de paiement (+200$/mois) — facteur dominant du verdict.
  paymentShock: PaymentShock;

  // 3. Durée prévue de détention — n'influence jamais le verdict fixe/variable,
  //    voir lib/decision.ts (shortHorizonNote).
  horizon: Horizon;

  // 4. Type de propriété.
  propertyType: PropertyType;

  // 5. Source de la mise de fonds.
  downPaymentSource: DownPaymentSource;

  // 6. Dettes actuelles — [] = aucune.
  debts: DebtType[];

  // 7. Échéancier d'achat — détermine l'urgence et la date de rappel.
  timeline: Timeline;

  consentContact: boolean;
}

export interface MarketRates {
  fixe5: number | null;
  variable: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  asOfDate: string | null;
  fetchedAt: number;
  generated: boolean;
}

export interface DecisionResult {
  verdict: Verdict;
  riskScore: number; // 0-100, normalisé pour l'affichage (jauge)
  urgency: Urgency;
  relance: string; // ISO yyyy-mm-dd — date de rappel suggérée, basée sur l'échéancier
  shortHorizonNote: boolean; // true si horizon < 3 ans — note séparée, jamais mêlée au verdict
  debtsCount: number;
}

export interface BuyerResult {
  decision: DecisionResult;
  rates: MarketRates;
  aiResponse: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  leadId: string;
  resultUrl: string;
  result: BuyerResult;
}
