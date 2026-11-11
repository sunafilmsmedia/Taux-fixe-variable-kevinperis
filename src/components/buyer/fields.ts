import type {
  DebtType,
  DownPaymentSource,
  Horizon,
  IncomeType,
  PaymentShock,
  PropertyType,
  Timeline,
} from "@/types/buyer";

export interface ChoiceOption<T = string> {
  label: string;
  sublabel?: string;
  value: T;
  icon?: string;
}

export const INCOME_OPTIONS: ChoiceOption<IncomeType>[] = [
  { label: "Salarié(e)", sublabel: "Revenu stable, talons de paie", icon: "💼", value: "salarie" },
  { label: "À mon compte", sublabel: "Travailleur autonome ou entreprise", icon: "🧾", value: "autonome" },
  { label: "Saisonnier, avec chômage l'hiver", sublabel: "Revenu qui varie selon la saison", icon: "❄️", value: "saisonnier_chomage" },
];

export const PAYMENT_SHOCK_OPTIONS: ChoiceOption<PaymentShock>[] = [
  { label: "Pas grave", icon: "😌", value: "pas_grave" },
  { label: "Ce serait serré", icon: "😬", value: "serre" },
  { label: "Ce serait la panique", icon: "😰", value: "panique" },
];

export const HORIZON_OPTIONS: ChoiceOption<Horizon>[] = [
  { label: "Moins de 3 ans", icon: "🏃", value: "moins_3_ans" },
  { label: "3 à 5 ans", icon: "🚶", value: "3_5_ans" },
  { label: "5 ans et plus", icon: "🏡", value: "5_ans_plus" },
];

export const PROPERTY_TYPE_OPTIONS: ChoiceOption<PropertyType>[] = [
  { label: "Condo", icon: "🏢", value: "condo" },
  { label: "Maison", icon: "🏠", value: "maison" },
  { label: "Duplex, triplex, 4+ plex", icon: "🏘️", value: "duplex" },
];

export const DOWN_PAYMENT_OPTIONS: ChoiceOption<DownPaymentSource>[] = [
  { label: "Épargne personnelle", icon: "💰", value: "epargne" },
  { label: "REER (RAP) ou CELIAPP", icon: "📈", value: "reer_celiapp" },
  { label: "Don des parents", icon: "🎁", value: "don_parents" },
];

export const DEBT_OPTIONS: ChoiceOption<DebtType>[] = [
  { label: "Prêt auto", icon: "🚗", value: "auto" },
  { label: "Cartes de crédit", icon: "💳", value: "cartes" },
  { label: "Marge de crédit", icon: "🏦", value: "marge" },
];

export const TIMELINE_OPTIONS: ChoiceOption<Timeline>[] = [
  { label: "Moins de 3 mois", icon: "🔥", value: "moins_3_mois" },
  { label: "3 à 6 mois", icon: "📅", value: "3_6_mois" },
  { label: "6 à 12 mois", icon: "🗓️", value: "6_12_mois" },
  { label: "Juste curieux pour l'instant", icon: "👀", value: "juste_curieux" },
];
