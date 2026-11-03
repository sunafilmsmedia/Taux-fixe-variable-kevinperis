import type { DebtType, DownPaymentSource, Horizon, IncomeType, PaymentShock, PropertyType, Timeline } from "@/types/buyer";

export const INCOME_LABELS: Record<IncomeType, string> = {
  salarie: "Salarié(e)",
  autonome: "À mon compte",
  saisonnier_chomage: "Saisonnier, avec chômage l'hiver",
};

export const PAYMENT_SHOCK_LABELS: Record<PaymentShock, string> = {
  pas_grave: "Pas grave",
  serre: "Ce serait serré",
  panique: "Ce serait la panique",
};

export const HORIZON_LABELS: Record<Horizon, string> = {
  moins_3_ans: "Moins de 3 ans",
  "3_5_ans": "3 à 5 ans",
  "5_ans_plus": "5 ans et plus",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  condo: "Condo",
  maison: "Maison",
  duplex: "Duplex",
};

export const DOWN_PAYMENT_LABELS: Record<DownPaymentSource, string> = {
  epargne: "Épargne personnelle",
  reer_celiapp: "REER (RAP) ou CELIAPP",
  don_parents: "Don des parents",
};

export const DEBT_LABELS: Record<DebtType, string> = {
  auto: "Prêt auto",
  cartes: "Cartes de crédit",
  marge: "Marge de crédit",
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  moins_3_mois: "Moins de 3 mois",
  "3_6_mois": "3 à 6 mois",
  "6_12_mois": "6 à 12 mois",
  juste_curieux: "Juste curieux pour l'instant",
};

export function formatRatePercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

export function formatDebtsList(debts: DebtType[]): string {
  return debts.length > 0 ? debts.map((d) => DEBT_LABELS[d]).join(", ") : "aucune";
}
