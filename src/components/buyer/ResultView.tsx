"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BuyerInput, BuyerResult } from "@/types/buyer";
import { buildContextNotes, buildVerdictContent, formatDateFr } from "@/lib/messages";
import { computeScoreInfo } from "@/lib/score";
import { formatRatePercent } from "@/lib/format";
import { buyerConfig } from "@/lib/config";
import BrokerCard from "@/components/ui/BrokerCard";
import ScoreGauge from "@/components/ui/ScoreGauge";

interface StoredResult {
  result: BuyerResult;
  input: BuyerInput;
}

// Fond de page maintenant vert foncé — cette carte reste sur un blanc opaque
// (plutôt qu'un tint translucide sur fond clair comme dans le gabarit
// d'origine) pour rester lisible peu importe la couleur de page derrière.
const TONE_BORDER: Record<string, string> = {
  positive: "border-positive/40",
  urgent: "border-danger/40",
  neutral: "border-accent/40",
  info: "border-taupe/50",
};

export default function ResultView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`result:${leadId}`);
    if (raw) setData(JSON.parse(raw) as StoredResult);
    setLoaded(true);
  }, [leadId]);

  if (loaded && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-deep via-primary to-primary-deep px-6 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h1 className="font-serif text-2xl font-bold text-ink">Résultat introuvable</h1>
          <p className="mt-3 text-muted">Ton résultat n&apos;est plus disponible. Tu peux refaire le quiz en 2 minutes.</p>
          <Link
            href="/quiz"
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-primary px-6 font-bold text-white"
          >
            Recommencer
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main className="min-h-screen bg-primary" />;
  }

  const { result, input } = data;
  const { decision, rates, aiResponse } = result;
  const content = buildVerdictContent(input, decision);
  const notes = buildContextNotes(input);
  const scoreInfo = computeScoreInfo(decision.riskScore);
  const hasRates = rates.generated && (rates.fixe5 || rates.variable);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-deep via-primary to-primary-deep">
      <header className="mx-auto flex w-full max-w-[1280px] justify-center px-6 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-kp.jpg" alt={buyerConfig.brokerName} className="h-16 w-16 rounded-full object-cover shadow-card" />
      </header>

      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="animate-fadeUp">
          <span className="caps-label text-xs font-semibold text-[#DCD6C6]">Ton profil</span>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            {input.firstName}, {content.headline.toLowerCase()}.
          </h1>

          <div className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="caps-label text-[11px] font-semibold text-primary">Ta tolérance au risque</span>
              <span className="font-serif text-base font-bold text-ink">{scoreInfo.label}</span>
            </div>
            <div className="mt-4">
              <ScoreGauge score={scoreInfo.score} active />
            </div>
          </div>

          <div className={`mt-4 rounded-3xl border bg-white p-6 ${TONE_BORDER[content.tone]}`}>
            <p className="text-sm leading-relaxed text-ink sm:text-base">{content.message}</p>
          </div>

          {notes.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {notes.map((note, i) => (
                <div key={i} className="rounded-2xl border border-line bg-tint p-4 text-sm leading-relaxed text-ink">
                  {note}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            Prochain contact prévu de Kevin autour du{" "}
            <strong className="text-ink">{formatDateFr(decision.relance)}</strong>, selon ton échéancier d&apos;achat.
          </div>

          <div className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-card">
            <div className="caps-label mb-3 text-xs font-semibold text-primary">
              Taux actuellement observés sur le marché
            </div>
            {hasRates ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <RateFigure label="Fixe 5 ans" value={rates.fixe5} />
                  <RateFigure label="Variable" value={rates.variable} />
                </div>
                <p className="mt-3 text-xs text-muted">
                  Source : {rates.sourceName ?? "comparateur en ligne"}
                  {rates.asOfDate ? ` — en date du ${rates.asOfDate}` : ""}. À titre indicatif seulement : les taux
                  fluctuent et ton taux réel dépendra de ton dossier.
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Les taux fluctuent quotidiennement — {buyerConfig.brokerName} pourra te donner les taux exacts du jour
                lors de votre appel.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-card">
            <h2 className="mb-3 font-serif text-lg font-bold text-ink">Ton analyse personnalisée</h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink/90">
              {aiResponse.split("\n").map((line, i) =>
                line.trim() === "" ? <div key={i} className="h-1" /> : <p key={i}>{line}</p>
              )}
            </div>
          </div>

          <p className="mt-6 rounded-2xl border border-line bg-tint p-4 text-xs leading-relaxed text-muted">
            Ce résultat est fourni à titre informatif seulement, à partir des informations fournies. Il ne constitue
            pas un conseil financier personnalisé ni une approbation de prêt. Le profil de risque et la
            recommandation fixe/variable doivent être confirmés par Kevin Péris à partir de ton dossier complet avant
            toute décision d&apos;achat.
          </p>

          <div className="mt-8">
            <BrokerCard />
          </div>

          <Link
            href="/quiz"
            className="mt-6 block w-full rounded-2xl border border-white/25 px-6 py-3 text-center text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Recommencer le profil
          </Link>
        </div>
      </div>
    </main>
  );
}

function RateFigure({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl bg-tint p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-bold text-primary">{formatRatePercent(value)}</div>
    </div>
  );
}
