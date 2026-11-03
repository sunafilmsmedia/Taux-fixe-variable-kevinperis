import { SCORE_MAX } from "./decision";

/**
 * Jauge de présentation (0-100) — traduit le score de risque brut
 * (lib/decision.ts, 0-SCORE_MAX) en pourcentage pour ScoreGauge. Le verdict
 * reste décidé par analyserProfilAcheteur ; cette jauge ne fait qu'habiller
 * visuellement le même score.
 */
export interface ScoreInfo {
  score: number; // 0-100
  label: string;
}

export function normalizeRiskScore(rawScore: number): number {
  return Math.round(Math.min(100, Math.max(0, (rawScore / SCORE_MAX) * 100)));
}

export function scoreLabel(score: number): string {
  if (score <= 15) return "À l'aise avec les fluctuations";
  if (score <= 45) return "Un équilibre à trouver";
  if (score <= 70) return "Tu préfères la prévisibilité";
  return "Tu as besoin de stabilité";
}

export function computeScoreInfo(rawScore: number): ScoreInfo {
  const score = normalizeRiskScore(rawScore);
  return { score, label: scoreLabel(score) };
}
