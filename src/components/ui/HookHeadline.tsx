"use client";

import { useEffect, useState } from "react";

const SWITCH_MS = 5000;
// Fond de page maintenant vert foncé (#00332C) — le vert ne peut donc plus
// servir d'accent de texte ici (invisible sur lui-même). On alterne plutôt
// entre le taupe et le bleu de la palette KP, qui contrastent bien sur fond
// vert foncé ; fixe et variable restent deux options neutres, pas un verdict.
const TAUPE = "#DCD6C6";
const BLEU = "#9BB3BC";

export default function HookHeadline() {
  const [fixeIsTaupe, setFixeIsTaupe] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setFixeIsTaupe((v) => !v), SWITCH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
      Taux{" "}
      <span className="italic transition-colors duration-700" style={{ color: fixeIsTaupe ? TAUPE : BLEU }}>
        fixe
      </span>{" "}
      ou{" "}
      <span className="italic transition-colors duration-700" style={{ color: fixeIsTaupe ? BLEU : TAUPE }}>
        variable
      </span>{" "}
      : lequel choisir pour ton premier achat?
    </h1>
  );
}
