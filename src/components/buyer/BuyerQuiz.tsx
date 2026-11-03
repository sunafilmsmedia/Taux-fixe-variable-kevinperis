"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  BuyerInput,
  DebtType,
  DownPaymentSource,
  Horizon,
  IncomeType,
  PaymentShock,
  PropertyType,
  Timeline,
} from "@/types/buyer";
import ProgressBar from "@/components/ui/ProgressBar";
import ScoreGauge from "@/components/ui/ScoreGauge";
import LoadingAI from "./LoadingAI";
import {
  DEBT_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
  HORIZON_OPTIONS,
  INCOME_OPTIONS,
  PAYMENT_SHOCK_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
  type ChoiceOption,
} from "./fields";
import { computeLivePreview } from "@/lib/livePreview";
import { trackPixel } from "@/lib/pixel";

type StepKey =
  | "income"
  | "paymentShock"
  | "horizon"
  | "propertyType"
  | "downPayment"
  | "debts"
  | "timeline"
  | "contact";

const STEPS: StepKey[] = [
  "income",
  "paymentShock",
  "horizon",
  "propertyType",
  "downPayment",
  "debts",
  "timeline",
  "contact",
];

interface Answers {
  income?: IncomeType;
  paymentShock?: PaymentShock;
  horizon?: Horizon;
  propertyType?: PropertyType;
  downPaymentSource?: DownPaymentSource;
  debts?: DebtType[];
  timeline?: Timeline;
  fullName?: string;
  email?: string;
  phone?: string;
  consentContact?: boolean;
}

export default function BuyerQuiz() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clampedIndex = Math.min(stepIndex, STEPS.length - 1);
  const currentStep = STEPS[clampedIndex];

  const preview = useMemo(
    () => computeLivePreview(answers),
    [answers.income, answers.paymentShock, answers.debts]
  );
  const showMobilePreview = preview.hasEnoughInfo && currentStep !== "contact";

  function update(patch: Partial<Answers>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setError(null);
  }

  function goNext() {
    if (clampedIndex < STEPS.length - 1) setStepIndex(clampedIndex + 1);
  }

  function goBack() {
    if (clampedIndex > 0) setStepIndex(clampedIndex - 1);
  }

  const canContinue = useMemo(() => validateStep(currentStep, answers), [currentStep, answers]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = buildPayload(answers);
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Il manque quelques informations avant de générer ton résultat.");
        setSubmitting(false);
        return;
      }

      trackPixel("Lead");
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(1000 - elapsed, 0);
      sessionStorage.setItem(
        `result:${data.leadId}`,
        JSON.stringify({ result: data.result, input: payload })
      );
      setTimeout(() => router.push(data.resultUrl), wait);
    } catch {
      setError("Une erreur est survenue. Réessaie dans un instant.");
      setSubmitting(false);
    }
  }

  if (submitting) return <LoadingAI />;

  return (
    <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        {showMobilePreview && (
          <div className="sticky top-3 z-20 mb-5 lg:hidden">
            <div className="rounded-2xl border border-line bg-white/95 px-4 py-3 text-center shadow-card backdrop-blur">
              <span className="caps-label text-[10px] font-semibold text-primary">Ton profil en direct</span>
              <p className="mt-0.5 text-base font-bold text-ink">
                <span className="select-none blur-[6px]">{preview.label}</span>
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-muted">🔒 Débloque les détails à la fin</p>
            </div>
          </div>
        )}

        <ProgressBar current={clampedIndex + 1} total={STEPS.length} />

        <div key={currentStep} className="mt-8 animate-fadeUp">
          <StepContent step={currentStep} answers={answers} update={update} advance={goNext} />
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
        )}

        <div className="mt-8 flex items-center gap-3">
          {clampedIndex > 0 && (
            <button
              onClick={goBack}
              className="h-14 rounded-2xl border border-line px-6 text-sm font-semibold text-ink transition hover:bg-tint"
            >
              Retour
            </button>
          )}
          {currentStep === "contact" ? (
            <button
              onClick={handleSubmit}
              disabled={!canContinue}
              className="h-14 flex-1 rounded-2xl bg-primary px-8 text-base font-bold text-white shadow-glow transition enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              Voir mon profil
            </button>
          ) : NEEDS_EXPLICIT_CONTINUE.has(currentStep) ? (
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="h-14 flex-1 rounded-2xl bg-primary px-8 text-base font-bold text-white shadow-glow transition enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer
            </button>
          ) : (
            <p className="text-sm text-muted">Touche une réponse pour continuer →</p>
          )}
        </div>
      </div>

      <aside className="hidden flex-col gap-4 lg:flex">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
          <div className="caps-label flex items-center gap-2 text-[11px] font-semibold text-primary">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">⚡</span>
            Ton profil en direct
          </div>
          <div className="mt-4 text-xl font-bold text-ink">
            {preview.hasEnoughInfo ? preview.label : "À découvrir"}
          </div>
          <div className="mt-4">
            <ScoreGauge score={preview.score ?? 0} active={preview.hasEnoughInfo} />
          </div>
        </div>
      </aside>
    </div>
  );
}

const NEEDS_EXPLICIT_CONTINUE = new Set<StepKey>(["debts"]);

/* --------------------------- Validation par étape --------------------------- */

function validateStep(step: StepKey, a: Answers): boolean {
  switch (step) {
    case "income":
      return !!a.income;
    case "paymentShock":
      return !!a.paymentShock;
    case "horizon":
      return !!a.horizon;
    case "propertyType":
      return !!a.propertyType;
    case "downPayment":
      return !!a.downPaymentSource;
    case "debts":
      return true; // aucune dette (tableau vide) est une réponse valide
    case "timeline":
      return !!a.timeline;
    case "contact":
      return (
        !!a.fullName?.trim() &&
        !!a.email?.trim() &&
        /.+@.+\..+/.test(a.email ?? "") &&
        !!a.phone?.trim() &&
        a.consentContact === true
      );
    default:
      return false;
  }
}

/* ------------------------------- Payload final ------------------------------ */

function buildPayload(a: Answers): BuyerInput {
  const nameParts = (a.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  return {
    firstName,
    lastName,
    email: a.email?.trim() ?? "",
    phone: a.phone?.trim() ?? "",
    income: a.income!,
    paymentShock: a.paymentShock!,
    horizon: a.horizon!,
    propertyType: a.propertyType!,
    downPaymentSource: a.downPaymentSource!,
    debts: a.debts ?? [],
    timeline: a.timeline!,
    consentContact: a.consentContact === true,
  };
}

/* ------------------------------- Rendu étapes ------------------------------- */

interface StepContentProps {
  step: StepKey;
  answers: Answers;
  update: (patch: Partial<Answers>) => void;
  advance: () => void;
}

function StepContent({ step, answers, update, advance }: StepContentProps) {
  const pick = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    update({ [key]: value } as Partial<Answers>);
    advance();
  };

  switch (step) {
    case "income":
      return (
        <SingleChoice
          title="Ton revenu, c'est quoi?"
          options={INCOME_OPTIONS}
          value={answers.income}
          onSelect={(v) => pick("income", v)}
        />
      );
    case "paymentShock":
      return (
        <SingleChoice
          title="Si ton paiement montait de 200 $/mois demain, tu le vivrais comment?"
          options={PAYMENT_SHOCK_OPTIONS}
          value={answers.paymentShock}
          onSelect={(v) => pick("paymentShock", v)}
        />
      );
    case "horizon":
      return (
        <SingleChoice
          title="Tu prévois rester dans cette maison combien de temps?"
          options={HORIZON_OPTIONS}
          value={answers.horizon}
          onSelect={(v) => pick("horizon", v)}
        />
      );
    case "propertyType":
      return (
        <SingleChoice
          title="Tu achètes quoi?"
          options={PROPERTY_TYPE_OPTIONS}
          value={answers.propertyType}
          onSelect={(v) => pick("propertyType", v)}
        />
      );
    case "downPayment":
      return (
        <SingleChoice
          title="Ta mise de fonds vient d'où?"
          options={DOWN_PAYMENT_OPTIONS}
          value={answers.downPaymentSource}
          onSelect={(v) => pick("downPaymentSource", v)}
        />
      );
    case "debts":
      return <DebtsStep answers={answers} update={update} />;
    case "timeline":
      return (
        <SingleChoice
          title="Quand achètes-tu?"
          options={TIMELINE_OPTIONS}
          value={answers.timeline}
          onSelect={(v) => pick("timeline", v)}
        />
      );
    case "contact":
      return <ContactStep answers={answers} update={update} />;
    default:
      return null;
  }
}

/* ------------------------------ Sous-composants ----------------------------- */

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl font-bold leading-tight text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

function SingleChoice<T extends string>({
  title,
  subtitle,
  options,
  value,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  options: ChoiceOption<T>[];
  value?: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <StepTitle title={title} subtitle={subtitle} />
      <div className="grid gap-3">
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            sublabel={opt.sublabel}
            icon={opt.icon}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  sublabel,
  icon,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
        selected ? "border-primary bg-primary/5 text-ink shadow-glow" : "border-line bg-white text-ink hover:border-primary/40 hover:bg-tint"
      }`}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span className="flex-1">
        {label}
        {sublabel && <span className="mt-0.5 block text-xs font-normal text-muted">{sublabel}</span>}
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
          selected ? "border-primary bg-primary text-white" : "border-line"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}

function DebtsStep({ answers, update }: { answers: Answers; update: (patch: Partial<Answers>) => void }) {
  const selected = answers.debts ?? [];

  function toggle(value: DebtType) {
    const next = selected.includes(value) ? selected.filter((d) => d !== value) : [...selected, value];
    update({ debts: next });
  }

  return (
    <div>
      <StepTitle title="As-tu des dettes en ce moment?" subtitle="Sélectionne tout ce qui s'applique — laisse vide si aucune." />
      <div className="grid gap-3">
        {DEBT_OPTIONS.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            icon={opt.icon}
            selected={selected.includes(opt.value)}
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
      {selected.length === 0 && (
        <p className="mt-3 rounded-xl bg-tint px-4 py-3 text-sm text-muted">Aucune dette sélectionnée — touche « Continuer » si c'est exact.</p>
      )}
    </div>
  );
}

function ContactStep({ answers, update }: { answers: Answers; update: (patch: Partial<Answers>) => void }) {
  return (
    <div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
        <span className="caps-label text-[11px] font-semibold text-primary">Dernière étape</span>
        <p className="mt-1 font-serif text-lg font-semibold text-ink">Reçois ton profil complet</p>
        <p className="mt-1 text-xs text-muted">
          Kevin analyse ton dossier et peut confirmer les meilleures options. Gratuit, sans engagement.
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        <Field label="Nom complet" value={answers.fullName ?? ""} onChange={(v) => update({ fullName: v })} />
        <Field label="Courriel" type="email" value={answers.email ?? ""} onChange={(v) => update({ email: v })} />
        <Field label="Numéro de téléphone" type="tel" value={answers.phone ?? ""} onChange={(v) => update({ phone: v })} />
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={answers.consentContact === true}
          onChange={(e) => update({ consentContact: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-line accent-primary"
        />
        J&apos;accepte d&apos;être contacté(e) au sujet de mon profil et de mon projet d&apos;achat.
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none"
      />
    </label>
  );
}
