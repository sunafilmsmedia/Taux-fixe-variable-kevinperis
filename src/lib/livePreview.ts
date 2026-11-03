import { computeRiskScore } from "./decision";
import { computeScoreInfo } from "./score";
import type { DebtType, IncomeType, PaymentShock } from "@/types/buyer";

export interface LivePreview {
  score: number | null;
  label: string;
  hasEnoughInfo: boolean;
}

interface PartialProfile {
  income?: IncomeType;
  paymentShock?: PaymentShock;
  debts?: DebtType[];
}

/**
 * Aperçu en direct pendant le quiz, dès que revenu + tolérance au choc de
 * paiement sont connus (les deux premières questions) — se raffine ensuite
 * si les dettes sont déjà répondues. Volontairement une approximation,
 * jamais le verdict final (voir ui/ScoreGauge "active" + le flou visuel
 * dans BuyerQuiz).
 */
export function computeLivePreview(answers: PartialProfile): LivePreview {
  if (!answers.income || !answers.paymentShock) {
    return { score: null, label: "", hasEnoughInfo: false };
  }

  const raw = computeRiskScore({
    income: answers.income,
    paymentShock: answers.paymentShock,
    debts: answers.debts ?? [],
  });
  const info = computeScoreInfo(raw);
  return { score: info.score, label: info.label, hasEnoughInfo: true };
}
