import BrokerCard from "@/components/ui/BrokerCard";
import HookHeadline from "@/components/ui/HookHeadline";
import TrackedLink from "@/components/ui/TrackedLink";
import { buyerConfig } from "@/lib/config";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-deep via-primary to-primary-deep">
      <header className="mx-auto flex w-full max-w-[1280px] justify-center px-6 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-kp.jpg" alt={buyerConfig.brokerName} className="h-16 w-16 rounded-full object-cover shadow-card" />
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10 text-center">
        <span className="caps-label inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-[11px] font-semibold text-primary shadow-card">
          ⏱️ 2 minutes · sans engagement
        </span>

        <HookHeadline />

        <p className="mt-6 text-lg text-white/75">
          Réponds à quelques questions sur ta situation et découvre ton profil — taux fixe ou variable, lequel te
          convient pour ton premier achat? Analyse gratuite et personnalisée par {buyerConfig.brokerName}.
        </p>

        <TrackedLink
          href="/quiz"
          event="ViewContent"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-[#E5E3DC] px-8 text-base font-bold text-primary shadow-glow transition hover:bg-white"
        >
          Découvrir mon profil →
        </TrackedLink>

        <div className="silver-line mt-10 mb-10 w-full max-w-xs" />

        <div className="w-full max-w-sm">
          <BrokerCard />
        </div>
      </div>
    </main>
  );
}
