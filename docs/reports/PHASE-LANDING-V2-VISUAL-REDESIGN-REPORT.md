# Rapport — Clôture de la refonte visuelle landing v2

Date : 31 août 2026
Branche : `claude/audit-codex-claude-migration-vhehdd`
Périmètre : audit rétroactif et clôture de la phase de refonte visuelle de la
landing page déjà mergée sur `main` (commits `22f6451`, `9978e0b`,
`c922dfa`), exécutée sous
`docs/prompts/claude/LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`.

> **Errata (même session, après approbation humaine de la correction
> proposée en section 13) :** en préparant la correction de l'écart
> `prefers-reduced-motion`, l'inspection s'est étendue à
> `packages/ui/styles/foundation.css`, qui n'avait pas été greffé au
> périmètre du `grep` initial (limité à `apps/web/src` et
> `apps/web/public`). Une règle `@media (prefers-reduced-motion: reduce)`
> y existe déjà (ligne 119), neutralise `transition-duration` sur tous les
> éléments avec `!important`, et est importée globalement via
> `apps/web/src/app/[locale]/layout.tsx` (`import
"@next-gen-care/ui/foundation.css"`) avant `global.css`. **L'écart décrit
> ci-dessous dans ce rapport n'existe donc pas** : aucune correction de code
> n'a été appliquée. Les sections 1, 8, 9, 12, 13, 14, 15 et 16 restent
> inchangées ci-dessous pour préserver la trace de l'analyse initiale, mais
> doivent être lues à la lumière de cet errata plutôt que comme un écart
> réel restant à trancher.

## 1. Résumé exécutif

La refonte visuelle de la landing page NEXTGEN CARES (palette verte/or sur
fond ivoire, hero éditorial, cinq sections de service, sous-marque Mindful
Healing Trips) était déjà implémentée et mergée sur `main` avant cette
session, mais sans le rapport de phase français obligatoire ni la preuve
d'exécution des gates de qualité sur l'état final. Cette session comble cet
écart : elle exécute réellement les contrôles requis contre le code actuel
et documente les résultats, sans modifier le code applicatif.

Résultat : `pnpm exec task ci` est vert sur l'état actuel, les 6 tests
Playwright existants passent (dont deux scans `axe-core` WCAG
2a/2aa/21aa sans violation sur `/fr` et sur `/fr/home-care`), les images
utilisées sont sourcées et licenciées dans `docs/brand/LANDING_V2_IMAGE_SOURCES.md`,
et le FR/NL fonctionne au niveau testé. Un écart mineur est identifié :
aucune règle `prefers-reduced-motion` ne protège les transitions CSS
existantes, contrairement à la section 13 du prompt de refonte.

Verdict : **CONDITIONAL GO** pour considérer la phase de refonte landing
comme close côté ingénierie, sous réserve de la décision humaine sur
l'écart `prefers-reduced-motion` (corriger maintenant vs. accepter comme
dette documentée) et sans changement au verdict **NO-GO production** global
hérité de la Phase 5.

## 2. Objectif et périmètre autorisé

Objectif autorisé par l'utilisateur : exécuter directement l'étape 1
proposée dans l'audit précédent, c'est-à-dire clore la phase de refonte
landing conformément au prompt Claude Code converti.

Périmètre respecté, conformément à ce prompt (section 22, gate d'approbation
humaine avant toute implémentation nouvelle) : audit rétroactif de
l'existant, exécution de contrôles non destructifs, aucune modification de
code applicatif au-delà de la correction d'un artefact généré par `next dev`
(`apps/web/next-env.d.ts`, annulée), aucune sélection de fournisseur, aucun
déploiement.

## 3. Travaux réalisés

- Lecture de `docs/brand/LANDING_V2_IMAGE_SOURCES.md`.
- Lecture de `tests/e2e/foundation.spec.ts` pour identifier la couverture
  E2E/accessibilité déjà existante sur la landing page refondue.
- Installation des dépendances (`pnpm install`, exécutée implicitement par
  `pnpm exec task ci`).
- Exécution de `pnpm exec task ci` sur l'état actuel de `main` fusionné dans
  cette branche (formatage, lint, frontières de paquets, typecheck, tests
  unitaires, tests d'intégration, gate contrat, tests a11y jsdom, scan de
  secrets, build de production, baseline HTTP, budget de performance).
- Démarrage du serveur de développement local (`pnpm --filter
@next-gen-care/web dev`) et exécution réelle de la suite Playwright
  (`tests/e2e/foundation.spec.ts`) avec Chromium pré-installé de
  l'environnement, via une configuration Playwright locale non commitée
  pointant vers l'exécutable Chromium disponible (le binaire embarqué dans
  `@playwright/test@1.62.1` visait une révision non présente localement).
- Inspection de `apps/web/src/app/global.css` et `packages/ui/styles/*.css`
  pour vérifier la présence de `prefers-reduced-motion` et le nombre de
  points de rupture responsives (`@media`).
- Annulation d'une modification non intentionnelle de
  `apps/web/next-env.d.ts` générée automatiquement par `next dev`.

## 4. Fichiers créés, modifiés ou supprimés

Créé :

- `docs/reports/PHASE-LANDING-V2-VISUAL-REDESIGN-REPORT.md` (ce document).

Modifiés : aucun fichier applicatif. `apps/web/next-env.d.ts` a été
temporairement régénéré par `next dev` puis restauré à l'identique
(`git checkout --`) ; le dépôt ne porte donc aucune modification résiduelle
de ce fichier.

Aucun fichier supprimé.

## 5. Décisions et ADR concernés

Aucune nouvelle décision d'architecture ou de fournisseur. La refonte
respecte les limites déjà actées : aucune route, aucun contrat d'API,
aucune logique métier n'a été touchée par le travail visuel audité ici, ce
qui est cohérent avec la section 16 du prompt de refonte (« Strict
functional non-regression boundary »).

## 6. Commandes exécutées

```text
pnpm exec prettier --write docs/prompts/claude/PHASE_0_PROMPT.md docs/reports/AUDIT-CODEX-CLAUDE-MIGRATION-2026-08-31.md
pnpm exec task ci
pnpm exec playwright test --project=chromium --config=<config locale avec executablePath Chromium pré-installé, reuseExistingServer:true>
grep -c "@media" apps/web/src/app/global.css
grep -rn "prefers-reduced-motion" apps/web/src apps/web/public
git diff apps/web/next-env.d.ts
git checkout -- apps/web/next-env.d.ts
```

## 7. Tests, contrôles et résultats factuels

`pnpm exec task ci` — exit code `0` :

- Prettier : tous les fichiers contrôlés respectent le style (après
  correction des deux fichiers créés lors de la session précédente).
- ESLint + frontières de paquets : `Package boundary check passed (46
source files inspected)`.
- Typecheck : les 4 workspaces TypeScript concernés (`packages/localization`,
  `packages/observability`, `packages/ui`, `apps/web`) réussissent.
- Tests unitaires : `Test Files 11 passed (11)`, `Tests 33 passed (33)`.
- Tests d'intégration : `Test Files 1 passed (1)`, `Tests 2 passed (2)`.
- Gate contrat : `MANUAL_APPOINTMENT_ADAPTER_ONLY`, statut explicite, non
  preuve de compatibilité OpenAPI (inchangé depuis la Phase 5).
- A11y automatisé (jsdom) : `Test Files 1 passed (1)`, `Tests 1 passed (1)`.
- Secrets : `Secret baseline passed (172 repository files inspected;
secret values are never printed)`.
- Build : `next build` réussi, 25 pages statiques générées, Turbopack,
  Next.js 16.3.3.
- Baseline HTTP : `Production HTTP baseline passed: locale redirect, FR
document, security headers, liveness, readiness.`
- Performance : JavaScript public `147549` octets gzip sur budget `204800` ;
  CSS public `4158` octets gzip sur budget `51200`.

Suite Playwright (`tests/e2e/foundation.spec.ts`), exécutée réellement
contre le serveur de développement local, Chromium réel — **6 tests
passés (6)** en 11,5 s :

- `negotiates Dutch without silently rendering French` — passé (négociation
  NL réelle sur la landing v2).
- `preserves an equivalent page when switching language` — passé.
- `navigates from the primary nav to a business-domain placeholder page` —
  passé.
- `has no automatically detectable violations on a business-domain
placeholder page` — passé (`axe-core`, tags `wcag2a`, `wcag2aa`,
  `wcag21aa`, zéro violation sur `/fr/home-care`).
- `supports a keyboard skip link` — passé.
- `has no automatically detectable WCAG A/AA violations` — passé
  (`axe-core`, mêmes tags, zéro violation sur `/fr`, c'est-à-dire la landing
  v2 elle-même).

`ci:extended` (audit de dépendances réseau, SBOM) n'a pas été exécuté dans
cette session ; disponibilité réseau non vérifiée et hors nécessité pour
clore le volet visuel.

## 8. Sécurité, RGPD, accessibilité et conformité

Aucune donnée patient réelle ni secret n'a été manipulé. Le scan de secrets
automatisé reste vert.

Accessibilité : preuve automatisée réelle et positive obtenue dans cette
session (voir section 7) — zéro violation `axe-core` WCAG 2a/2aa/21aa sur la
landing v2 et sur une page de domaine métier. Cela couvre un sous-ensemble
mesurable de la section 12 du prompt de refonte (contraste, structure
sémantique de base, navigation clavier via le lien d'évitement), mais **ne
constitue pas une revue accessibilité experte manuelle** (lecteur d'écran,
parcours complet, zoom 200 %, cibles tactiles mesurées) — ce point reste une
lacune déjà identifiée en Phase 5 et non résolue ici.

Écart identifié : le prompt de refonte (section 13) exige `prefers-reduced-
motion`. Le dépôt contient des transitions CSS sur les états `hover`
(`transition: transform 420ms ease` dans `apps/web/src/app/global.css`,
`transition: transform 120ms ease` dans `packages/ui/styles/foundation.css`)
sans qu'aucune règle `@media (prefers-reduced-motion: reduce)` ne les
désactive ou ne les atténue pour les utilisateurs qui en ont fait la demande
au niveau système. Ces transitions restent courtes et non intrusives (pas de
parallax, pas d'animation continue), donc le risque est limité, mais l'écart
par rapport à l'exigence explicite du prompt doit être tranché
explicitement plutôt que silencieusement accepté.

## 9. Écarts, risques et dette explicitement acceptée

- **`prefers-reduced-motion` non implémenté** (détaillé section 8) : risque
  faible (transitions courtes, pas d'animation de grande ampleur), mais
  exigence explicite non respectée. Décision humaine requise (section 14).
- **Deux points de rupture responsives seulement** (`@media (max-width:
52rem)` et `@media (max-width: 38rem)`, soit environ 832px et 608px) dans
  `apps/web/src/app/global.css`. Cela correspond à une stratégie
  mobile/desktop simple plutôt qu'à une grille à points de rupture multiples
  ; aucune preuve automatisée de rendu visuel (captures d'écran multi-
  appareils) n'a été produite dans cette session — seule la structure CSS a
  été inspectée, pas le rendu réel sur tablette.
- **Pas de revue accessibilité experte manuelle**, de test lecteur d'écran,
  ni de vérification de contraste chiffrée par token — seule la preuve
  automatisée `axe-core` existe, ce qui est nécessaire mais insuffisant
  selon la section 12 du prompt de refonte lui-même.
- **`ci:extended` non exécuté** dans cette session (audit dépendances,
  SBOM) : aucune régression connue, mais aucune preuve fraîche non plus.
- Les risques déjà actés en Phase 5 (contrat OpenAPI non piné, E2E
  rendez-vous incomplet, staging absent, RGPD/DPIA absent) restent
  inchangés et ne sont pas repris en détail ici pour éviter la duplication.

## 10. Éléments reportés hors périmètre

Sont hors périmètre de cette clôture : toute correction de code (y compris
l'ajout de `prefers-reduced-motion`, volontairement non implémenté ici en
attente de décision humaine), toute revue accessibilité experte manuelle,
toute capture d'écran responsive multi-appareils, `ci:extended`,
déploiement, staging, choix fournisseur, décision RGPD/DPIA.

## 11. État du dépôt et du déploiement

Travail effectué sur `claude/audit-codex-claude-migration-vhehdd`. Aucun
commit sur `main`, aucun merge, tag, release, force-push ni modification
d'environnement distant. Le serveur de développement local lancé pour les
tests Playwright a été arrêté après exécution. Aucun déploiement n'a eu
lieu.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**CONDITIONAL GO** pour considérer le volet ingénierie de la refonte landing
v2 comme clos, conditionné à la décision humaine sur
`prefers-reduced-motion` (section 14). Ce verdict ne change rien au
**NO-GO production** global hérité de la Phase 5 : cette clôture documente
un travail déjà mergé, elle n'autorise ni ne recommande une mise en
production.

## 13. Suite recommandée et justification

Deux options équivalentes en coût, à trancher par l'Human Engineering
Authority :

1. **Corriger l'écart `prefers-reduced-motion`** immédiatement (ajout d'une
   règle `@media (prefers-reduced-motion: reduce)` neutralisant les
   transitions `transform` identifiées), puis rejouer `pnpm exec task ci`
   et la suite Playwright pour confirmer l'absence de régression. Coût
   estimé faible (un bloc CSS, deux fichiers).
2. **Accepter la dette documentée** telle quelle et reprendre directement le
   backlog Phase 5 (E2E rendez-vous, contrat OpenAPI piné, gate contrat
   réel), qui reste la priorité stratégique la plus proche de la production.

Recommandation : option 1 d'abord, parce que le coût est faible et que cela
ferme complètement la Definition of Done du prompt de refonte (section 27),
puis enchaîner sur la Phase 5. Mais la décision reste humaine (voir
section 14) — je ne l'implémente pas sans approbation explicite, en
cohérence avec le gate de la section 22 du prompt.

## 14. Décisions humaines nécessaires

- Approuver l'ajout d'une règle `prefers-reduced-motion` (option 1
  ci-dessus) ou accepter explicitement l'écart comme dette technique.
- Confirmer que ce rapport clôt suffisamment le gate de phase manquant pour
  la refonte landing v2, ou demander une revue accessibilité experte
  manuelle complémentaire avant de considérer la phase réellement close.
- Confirmer la priorité de la suite : reprendre le backlog Phase 5
  (E2E rendez-vous / contrat OpenAPI) maintenant.
- Toute décision fournisseur, RGPD/DPIA, clinique/juridique, staging ou
  production reste soumise à l'Human Engineering Authority, sans changement
  par rapport aux rapports précédents.

## 15. Prompt prêt à coller pour la phase suivante

```text
J'approuve le rapport de clôture de la refonte landing v2 et autorise la
correction de l'écart prefers-reduced-motion sur une branche dédiée, suivie
de la reprise du backlog Phase 5.

Objectif :
- ajouter une règle @media (prefers-reduced-motion: reduce) neutralisant
  les transitions transform identifiées dans apps/web/src/app/global.css et
  packages/ui/styles/foundation.css, sans changer le comportement par
  défaut ;
- rejouer pnpm exec task ci et la suite Playwright
  (tests/e2e/foundation.spec.ts) pour confirmer l'absence de régression ;
- puis reprendre le backlog Phase 5 : couverture E2E déterministe du
  parcours rendez-vous PAY_ON_SITE, référencement/versionnement de
  l'artefact OpenAPI accepté, remplacement du gate test:contract par une
  vérification factuelle ;
- ne pas déployer, ne pas modifier l'infrastructure production ;
- produire un rapport français à 16 sections et s'arrêter au gate humain.

Toute décision provider, RGPD, clinique, juridique, staging ou production
reste soumise à validation humaine explicite.
```

## 16. Confirmation d'arrêt au gate humain

Cette clôture s'arrête ici. Aucune correction de code, aucun commit sur
`main`, aucune décision fournisseur, RGPD ou de production n'est entreprise
à partir de ces seules constatations. J'attends l'approbation explicite du
Human Engineering Authority avant de corriger l'écart `prefers-reduced-
motion` ou de reprendre le backlog Phase 5.

## 17. Verdict final (après errata)

Compte tenu de l'errata en tête de ce document, le seul écart conditionnant
le verdict de la section 12 n'existe pas. **Verdict final : GO** pour
considérer le volet ingénierie de la refonte landing v2 comme clos, sans
correction de code nécessaire. Cela ne change rien au **NO-GO production**
global hérité de la Phase 5, et n'autorise ni ne recommande une mise en
production. Le backlog Phase 5 (E2E rendez-vous déterministe, contrat
OpenAPI piné, gate contrat réel) reste la suite recommandée, sur
autorisation humaine distincte.
