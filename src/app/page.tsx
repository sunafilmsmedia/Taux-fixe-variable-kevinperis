import BrokerCard from "@/components/ui/BrokerCard";
import HookHeadline from "@/components/ui/HookHeadline";
import TrackedLink from "@/components/ui/TrackedLink";
import { buyerConfig } from "@/lib/config";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-tint">
      <header className="mx-auto flex w-full max-w-[1280px] justify-center px-6 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-kp.jpg" alt={buyerConfig.brokerName} className="h-16 w-16 rounded-full object-cover shadow-card" />
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10 text-center">
        <span className="caps-label inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-[11px] font-semibold text-primary shadow-card">
          ⏱️ 2 minutes · sans engagement
        </span>

        <HookHeadline />

        <p className="mt-6 text-lg text-muted">
          Réponds à quelques questions sur ta situation et découvre ton profil — taux fixe ou variable, lequel te
          convient pour ton premier achat? Analyse gratuite et personnalisée par {buyerConfig.brokerName}.
        </p>

        <TrackedLink
          href="/quiz"
          event="ViewContent"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold text-white shadow-glow transition hover:bg-primary-light"
        >
          Découvrir mon profil →
        </TrackedLink>

        <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
          <ValueProp icon="🔒" title="Confidentiel" subtitle="Tes réponses restent privées" />
          <ValueProp icon="✓" title="Sans engagement" subtitle="Juste un profil clair" />
          <ValueProp icon="⚡" title="Réponse rapide" subtitle="Kevin te recontacte vite" />
        </div>

        <div className="silver-line my-10 w-full max-w-xs" />

        <div className="w-full max-w-sm">
          <BrokerCard />
        </div>
      </div>
    </main>
  );
}

function ValueProp({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="text-xl">{icon}</div>
      <div className="mt-1.5 text-sm font-bold text-ink">{title}</div>
      <div className="text-xs text-muted">{subtitle}</div>
    </div>
  );
}
