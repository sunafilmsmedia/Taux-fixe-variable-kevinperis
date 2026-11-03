import Anthropic from "@anthropic-ai/sdk";
import type { BuyerInput, DecisionResult } from "@/types/buyer";
import { VERDICT_LABELS } from "./decision";
import { buildContextNotes, buildVerdictContent } from "./messages";
import { DOWN_PAYMENT_LABELS, HORIZON_LABELS, INCOME_LABELS, PAYMENT_SHOCK_LABELS, PROPERTY_TYPE_LABELS, TIMELINE_LABELS, formatDebtsList } from "./format";

/**
 * Génération de la réponse IA personnalisée (côté serveur uniquement).
 *
 * Si ANTHROPIC_API_KEY est défini, on appelle l'API Anthropic (Claude). Sinon
 * (ou en cas d'échec), on retombe proprement sur un texte construit localement —
 * le formulaire ne casse jamais et l'utilisateur voit toujours un résultat.
 */

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

export const SYSTEM_PROMPT = `Tu es un assistant spécialisé en vulgarisation hypothécaire pour Kevin Péris, courtier hypothécaire chez Multi-Prêts Hypothèques à Gatineau.
Un moteur de calcul déterministe (pas toi) a déjà établi, à partir de la tolérance au risque, du type de revenu et des dettes du client, si un taux fixe ou variable lui convient mieux pour son premier achat. Ton rôle est UNIQUEMENT d'expliquer ce verdict en langage simple — jamais de le remettre en question ni d'en calculer un autre.
Règle la plus importante : tu ne dois JAMAIS prédire si les taux d'intérêt vont monter, baisser ou rester stables dans le futur. Le verdict se base sur la tolérance au risque du client, jamais sur une anticipation du marché.
Tu ne dois jamais présenter ce verdict comme une approbation de prêt ou une promesse de taux — ce sont des pistes à valider par Kevin à partir du dossier complet du client.
Tu dois toujours encourager l'utilisateur à valider son profil avec Kevin avant de prendre une décision.
Écris dans un français québécois professionnel, simple, chaleureux et encourageant — c'est souvent un premier achat, le ton doit rassurer sans minimiser les enjeux réels.
Maximum 200 mots. Structure ta réponse en 4 sections avec ces titres exacts, chacun sur sa propre ligne :
Résumé simple
Ce que notre analyse indique
Pourquoi ce profil
Prochaine étape avec Kevin`;

export interface AIResult {
  text: string;
  generated: boolean;
}

export async function generateAnalysis(input: BuyerInput, decision: DecisionResult): Promise<AIResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { text: buildLocalAnalysis(input, decision), generated: false };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input, decision) }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("Réponse IA vide");
    return { text, generated: true };
  } catch (e) {
    console.error("AI_GENERATION_FAILED", e);
    return { text: buildLocalAnalysis(input, decision), generated: false };
  }
}

function buildUserPrompt(input: BuyerInput, decision: DecisionResult): string {
  const content = buildVerdictContent(input, decision);
  const notes = buildContextNotes(input);

  return `Voici le dossier d'un premier acheteur :

Prénom : ${input.firstName}
Type de revenu : ${INCOME_LABELS[input.income]}
Réaction à une hausse de paiement de 200$/mois : ${PAYMENT_SHOCK_LABELS[input.paymentShock]}
Durée prévue dans la maison : ${HORIZON_LABELS[input.horizon]}
Type de propriété : ${PROPERTY_TYPE_LABELS[input.propertyType]}
Source de la mise de fonds : ${DOWN_PAYMENT_LABELS[input.downPaymentSource]}
Dettes actuelles : ${formatDebtsList(input.debts)}
Échéancier d'achat : ${TIMELINE_LABELS[input.timeline]}

Verdict calculé par notre moteur (${VERDICT_LABELS[decision.verdict]}) — à expliquer, jamais à remettre en question :
${content.message}

${notes.length > 0 ? `Points additionnels à mentionner brièvement si pertinent (ne les invente pas, utilise-les tels quels) :\n${notes.join("\n")}` : "(aucun point additionnel pour ce dossier)"}

Génère la réponse personnalisée en 4 sections (titres exacts demandés dans tes consignes), adressée directement à ${input.firstName}. Ne prédis jamais l'évolution future des taux.`;
}

function buildLocalAnalysis(input: BuyerInput, decision: DecisionResult): string {
  const content = buildVerdictContent(input, decision);
  const notes = buildContextNotes(input);

  return [
    "Résumé simple",
    `Bonjour ${input.firstName}, ${content.headline.toLowerCase()}.`,
    "",
    "Ce que notre analyse indique",
    content.message,
    "",
    "Pourquoi ce profil",
    `Basé sur ta tolérance à une hausse de paiement (${PAYMENT_SHOCK_LABELS[input.paymentShock]}), ton type de revenu (${INCOME_LABELS[input.income]}) et tes dettes actuelles (${formatDebtsList(input.debts)}).`,
    ...(notes.length > 0 ? ["", ...notes] : []),
    "",
    "Prochaine étape avec Kevin",
    "Ce profil est une estimation basée sur tes réponses, pas une approbation de prêt. La prochaine étape est de valider ton dossier complet avec Kevin, qui confirmera les meilleures options disponibles pour toi, sans engagement.",
  ].join("\n");
}
