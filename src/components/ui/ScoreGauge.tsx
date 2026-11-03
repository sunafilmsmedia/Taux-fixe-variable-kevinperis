"use client";

interface ScoreGaugeProps {
  score: number; // 0-100
  active?: boolean; // false = jauge "verrouillée" (grise, position neutre)
  poleLow?: string;
  poleHigh?: string;
}

function colorForScore(score: number): string {
  if (score <= 15) return "#2F7D5C"; // positive — à l'aise avec les fluctuations
  if (score <= 45) return "#75909B"; // accent (bleu KP) — équilibre
  if (score <= 70) return "#B3AC9C"; // taupe — penche vers la prévisibilité
  return "#00332C"; // primary — besoin de stabilité
}

export default function ScoreGauge({
  score,
  active = true,
  poleLow = "Fluctuations OK",
  poleHigh = "Besoin de stabilité",
}: ScoreGaugeProps) {
  const pct = Math.min(100, Math.max(0, score));
  const color = active ? colorForScore(pct) : "#DEDAD0";

  return (
    <div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-tint">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${active ? pct : 50}%`, background: color }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
        <span>{poleLow}</span>
        <span>{poleHigh}</span>
      </div>
    </div>
  );
}
