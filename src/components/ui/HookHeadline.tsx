"use client";

import { useEffect, useState } from "react";

const SWITCH_MS = 5000;
// Deux couleurs de la palette KP, assez contrastées pour alterner sur fond
// clair — contrairement à taux120jours-michel-turgeon, on évite ici un
// rouge/vert "mauvais choix / bon choix" : fixe et variable sont deux
// options neutres, pas un verdict en soi.
const VERT = "#00332C";
const BLEU = "#3F6773";

export default function HookHeadline() {
  const [fixeIsVert, setFixeIsVert] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setFixeIsVert((v) => !v), SWITCH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.1] text-ink sm:text-5xl">
      Taux{" "}
      <span className="italic transition-colors duration-700" style={{ color: fixeIsVert ? VERT : BLEU }}>
        fixe
      </span>{" "}
      ou{" "}
      <span className="italic transition-colors duration-700" style={{ color: fixeIsVert ? BLEU : VERT }}>
        variable
      </span>{" "}
      : lequel choisir pour ton premier achat?
    </h1>
  );
}
