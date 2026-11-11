# Taux fixe ou variable — Kevin Péris

Outil de profilage pour Kevin Péris, courtier hypothécaire chez Multi-Prêts Hypothèques (Gatineau).
Un premier acheteur répond à 7 questions (revenu, tolérance à une hausse de paiement, durée de
détention prévue, type de propriété, source de la mise de fonds, dettes actuelles, échéancier
d'achat) et l'app applique un moteur de décision **déterministe** (pas une IA) pour déterminer si
un taux **fixe** ou **variable** lui convient mieux, avec quatre niveaux de verdict :

- **VARIABLE_ENVISAGEABLE** — revenu stable, peu de dettes, à l'aise avec une hausse de paiement :
  le variable peut valoir la peine d'être exploré.
- **EQUILIBRE_A_DISCUTER** — profil entre les deux, à trancher avec Kevin.
- **FIXE_RECOMMANDE** — une hausse de paiement mettrait de la pression : le fixe protège le budget.
- **FIXE_FORTEMENT_RECOMMANDE** — revenu variable/saisonnier, dettes, et peu de tolérance au
  risque : priorité à la stabilité.

Le choc de paiement (+200 $/mois) est le facteur **dominant** du calcul — c'est la mesure directe
du risque réel du variable. La durée de détention prévue n'influence jamais ce verdict (voir le
commentaire en tête de `src/lib/decision.ts`) : un horizon court est transmis séparément comme une
piste de discussion (terme plus court), pour ne jamais contredire la tolérance au risque exprimée.

Une IA (Claude) sert uniquement à **expliquer** ce verdict en langage simple ; elle ne le calcule
jamais et ne prédit jamais l'évolution des taux — voir `src/lib/ai.ts` (`SYSTEM_PROMPT`).

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

## Statut des intégrations

| Service | État | Où le brancher |
|---|---|---|
| Moteur de décision | ✅ réel, local, aucune clé requise | `src/lib/decision.ts` |
| Taux du marché (fixe 5 ans + variable) | 🟡 recherche web Claude, cache 12h | `src/lib/rates.ts` — nécessite `ANTHROPIC_API_KEY` |
| Réponse IA personnalisée | 🟡 **stub** (texte généré localement) sans clé | `src/lib/ai.ts` — nécessite `ANTHROPIC_API_KEY` |
| Envoi CRM | 🟡 **stub** (log serveur) sans URL | `src/lib/crm.ts` → définir `CRM_WEBHOOK_URL` (pas encore connu — à obtenir de Kevin) |
| Pixel Meta (« Pixel de Kevin » 1388001303411655) | ✅ PageView + Lead navigateur | `src/lib/pixel.ts` (ID par défaut, remplaçable par `NEXT_PUBLIC_META_PIXEL_ID`) |
| Meta Conversions API (Lead serveur) | 🟡 code prêt, nécessite `META_CAPI_TOKEN` | `src/lib/metaCapi.ts`, dédup via `eventId` |
| Clarity | ⚪ non branché | `NEXT_PUBLIC_CLARITY_ID` |

Sans `ANTHROPIC_API_KEY`, le verdict reste 100 % correct (le calcul ne dépend pas de l'IA) mais les
taux du marché restent `null` et le texte retombe sur un gabarit local clair, jamais un chiffre
halluciné.

## Flux

Page unique (`src/components/buyer/BuyerQuiz.tsx`) : hero → questionnaire en 8 étapes →
`POST /api/submit-lead` (validation Zod → décision → taux du marché → texte IA → CRM) → résultat,
sans changement d'URL.

## Branding

Couleurs tirées de `KP_Palette-couleurs.pdf` (fournie par Kevin, 2026-11-03) : taupe `#B3AC9C`,
bleu `#75909B`, blanc `#E5E3DC`, vert `#00332C` (couleur primaire), noir `#110E0C`. Logo monogramme
KP dans `public/logo-kp.jpg`. Polices Fraunces (titres) + Inter (corps/labels) — voir
`tailwind.config.ts` et `src/app/globals.css`.

**À faire avant mise en production** :
- Remplacer `public/logo-kp.jpg` par une version haute résolution / transparente si disponible.
- Ajouter une vraie photo de Kevin à `public/kevin-peris.jpg` (sinon `ui/BrokerCard.tsx` retombe
  automatiquement sur des initiales « KP »).
- Obtenir et définir `CRM_WEBHOOK_URL`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`.

## Configuration métier

Coordonnées du courtier : `src/lib/config.ts`. Poids du moteur de risque (choc de paiement, type
de revenu, dettes) : constantes `RISK_POINTS` en haut de `src/lib/decision.ts`.
