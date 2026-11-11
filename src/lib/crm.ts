import type { BuyerInput, DecisionResult } from "@/types/buyer";
import { URGENCY_LABELS, VERDICT_LABELS } from "./decision";
import { DOWN_PAYMENT_LABELS, HORIZON_LABELS, INCOME_LABELS, PROPERTY_TYPE_LABELS, formatDebtsList } from "./format";
import { formatDateFr } from "./messages";

/**
 * Payload CRM (format GoHighLevel) construit à partir du lead.
 */
export interface CrmPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  periode: "jour" | "nuit";
  lead_type: "lead_jour" | "lead_nuit";
  tags: string[];
  customFields: Record<string, string | number>;
}

/**
 * Segmentation jour/nuit selon l'heure du Québec (America/Toronto — gère
 * automatiquement l'heure d'été/hiver). Jour = 8h à 20h, Nuit = 20h à 8h.
 */
export function getLeadPeriod(): { periode: "jour" | "nuit"; lead_type: "lead_jour" | "lead_nuit" } {
  const hourStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  const hour = Number(hourStr) % 24;
  const isDay = hour >= 8 && hour < 20;
  return isDay
    ? { periode: "jour", lead_type: "lead_jour" }
    : { periode: "nuit", lead_type: "lead_nuit" };
}

export function buildCrmPayload(input: BuyerInput, decision: DecisionResult): CrmPayload {
  const { periode, lead_type } = getLeadPeriod();

  const tags = [
    "Lead - Outil premier acheteur",
    `Verdict - ${VERDICT_LABELS[decision.verdict]}`,
    `Urgence - ${URGENCY_LABELS[decision.urgency]}`,
    lead_type,
  ];
  if (decision.debtsCount > 0) tags.push("A des dettes actuelles");
  if (input.downPaymentSource === "don_parents") tags.push("Mise de fonds - Don familial");
  if (input.downPaymentSource === "reer_celiapp") tags.push("Mise de fonds - REER/CELIAPP");
  if (input.propertyType === "duplex") tags.push("Achat plex (duplex, triplex, 4+)");
  if (decision.shortHorizonNote) tags.push("Horizon court (< 3 ans)");

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    periode,
    lead_type,
    tags,
    customFields: {
      income: INCOME_LABELS[input.income],
      horizon: HORIZON_LABELS[input.horizon],
      propertyType: PROPERTY_TYPE_LABELS[input.propertyType],
      downPaymentSource: DOWN_PAYMENT_LABELS[input.downPaymentSource],
      debts: formatDebtsList(input.debts),
      verdict: VERDICT_LABELS[decision.verdict],
      riskScore: decision.riskScore,
      urgency: URGENCY_LABELS[decision.urgency],
      dateRelance: formatDateFr(decision.relance),
      periode,
      lead_type,
    },
  };
}

export interface CrmSyncResult {
  ok: boolean;
  error?: string;
}

// Webhook GoHighLevel / LeadConnector — pas encore connu pour Kevin (nouveau
// client). Tant que CRM_WEBHOOK_URL n'est pas défini, on logue le lead côté
// serveur au lieu de l'envoyer, pour ne jamais polluer un CRM de production
// par erreur. À coller dans .env (ou les variables d'environnement Vercel)
// une fois le webhook de Kevin confirmé — voir .env.example.
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;

/**
 * Envoi du lead au CRM (POST JSON vers le webhook GoHighLevel/LeadConnector).
 * Un échec CRM ne doit jamais bloquer l'utilisateur (le lead est quand même
 * retourné à la personne).
 */
export async function sendToCrm(payload: CrmPayload): Promise<CrmSyncResult> {
  if (!CRM_WEBHOOK_URL) {
    console.log("[CRM_STUB] CRM_WEBHOOK_URL non défini — lead loggué localement :", payload);
    return { ok: true };
  }

  try {
    const res = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `CRM_SYNC_FAILED: HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `CRM_SYNC_FAILED: ${(e as Error).message}` };
  }
}
