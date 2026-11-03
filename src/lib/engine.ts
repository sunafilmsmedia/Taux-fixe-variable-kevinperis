import type { BuyerInput, BuyerResult } from "@/types/buyer";
import { analyserProfilAcheteur } from "./decision";
import { generateAnalysis } from "./ai";
import { getCurrentRates } from "./rates";

export interface EngineOutput {
  result: BuyerResult;
  aiGenerated: boolean;
}

/**
 * Pipeline complet : décision (synchrone, déterministe) -> taux du marché
 * (contexte seulement) -> texte IA. Utilisé côté serveur dans
 * /api/submit-lead.
 */
export async function processLead(input: BuyerInput): Promise<EngineOutput> {
  const decision = analyserProfilAcheteur(input);

  // Les taux du marché sont mis en cache côté serveur (voir lib/rates.ts) :
  // cet appel ne déclenche une recherche web que quelques fois par jour.
  const rates = await getCurrentRates();
  const ai = await generateAnalysis(input, decision);

  return {
    result: { decision, rates, aiResponse: ai.text },
    aiGenerated: ai.generated,
  };
}
