import { z } from "zod";

const phoneRegex = /^[+]?[\d\s().-]{10,20}$/;

export const buyerInputSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("Courriel invalide"),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),

  income: z.enum(["salarie", "autonome", "saisonnier_chomage"]),
  paymentShock: z.enum(["pas_grave", "serre", "panique"]),
  horizon: z.enum(["moins_3_ans", "3_5_ans", "5_ans_plus"]),
  propertyType: z.enum(["condo", "maison", "duplex"]),
  downPaymentSource: z.enum(["epargne", "reer_celiapp", "don_parents"]),
  debts: z.array(z.enum(["auto", "cartes", "marge"])),
  timeline: z.enum(["moins_3_mois", "3_6_mois", "6_12_mois", "juste_curieux"]),

  consentContact: z.literal(true, {
    errorMap: () => ({ message: "Le consentement est requis" }),
  }),
});

export type ValidatedBuyerInput = z.infer<typeof buyerInputSchema>;
