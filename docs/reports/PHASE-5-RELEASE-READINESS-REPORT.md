# Rapport de phase 5 — Release readiness

Date : 31 août 2026  
Branche : `phase-5/release-readiness`  
Périmètre : audit et corrections non destructives après merge de la PR #7, sans déploiement.

## 1. Résumé exécutif

La phase de release readiness a identifié et corrigé un écart applicatif dans le
parcours public soins à domicile : le sélecteur créait un hold mais ne soumettait
pas encore la demande patient à l’adaptateur `POST /api/home-care/appointment-requests`.
Le parcours UI envoie maintenant une demande `PENDING_REVIEW` après saisie des
coordonnées minimales et ne la présente pas comme un rendez-vous confirmé.

Verdict de release : **NO-GO production**. Le dépôt est meilleur pour revue, mais
les preuves obligatoires de production restent absentes ou incomplètes.

## 2. Objectif et périmètre autorisé

Objectif autorisé par l’Autorité Humaine d’Ingénierie : préparer la release
readiness sur une branche dédiée, auditer l’état réel du dépôt après merge de la
PR #7, corriger les écarts applicatifs non destructifs dans le périmètre MVP,
exécuter les validations locales pertinentes et ne pas déployer.

Sont exclus : déploiement, modification d’infrastructure de production, choix de
provider, traitement `PAY_ONLINE`, auto-approbation, décision RGPD/clinique/légale
ou accessibilité experte.

## 3. Travaux réalisés

- Synchronisation locale de `main` avec le merge distant de la PR #7.
- Création de la branche `phase-5/release-readiness`.
- Audit des instructions repository, du contrat maître, des workflows CI, du
  Taskfile, des routes publiques, de l’adaptateur rendez-vous et des tests.
- Correction du sélecteur public pour ajouter le formulaire patient minimal et
  soumettre la demande en revue humaine après création du hold.
- Ajout d’un test unitaire jsdom couvrant le parcours catalogue -> disponibilité
  -> hold -> demande `PENDING_REVIEW`.
- Ajustement de la configuration Vitest pour transformer les composants `.tsx`
  importés directement dans les tests unitaires.
- Mise à jour du README et de la documentation des gates pour refléter l’état réel
  post-PR #7.
- Ajustement du message du gate contrat pour éviter de présenter un statut
  obsolète `NOT_APPLICABLE_PHASE_1`.

## 4. Fichiers créés, modifiés ou supprimés

Créé :

- `docs/reports/PHASE-5-RELEASE-READINESS-REPORT.md`
- `apps/web/tests/appointment-slot-selector.test.tsx`

Modifiés :

- `apps/web/src/components/appointment-slot-selector.tsx`
- `vitest.config.ts`
- `scripts/check-phase-gate.mjs`
- `README.md`
- `docs/operations/QUALITY-GATES.md`

Aucun fichier supprimé.

## 5. Décisions et ADR concernés

La correction respecte l’ADR-0003 : le navigateur ne contacte pas directement
l’Appointment API externe ; il passe par la façade serveur du portail.

Aucune nouvelle décision provider, CMS, identité, email, analytics, hébergement,
stockage média, secrets ou backup n’a été prise pendant cette phase.

## 6. Commandes exécutées

- `sed -n '1,220p' AGENTS.md`
- `sed -n '1,260p' NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
- `sed -n '261,520p' NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
- `sed -n '521,780p' NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
- `sed -n '781,1040p' NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
- `git status --short`
- `git branch --show-current`
- `git switch main`
- `git pull --ff-only`
- `git switch -c phase-5/release-readiness`
- `rg --files ...`
- `rg -n ...`
- `sed -n ...` sur les fichiers de CI, documentation, routes et tests inspectés.
- `pnpm exec prettier --write apps/web/src/components/appointment-slot-selector.tsx apps/web/tests/appointment-slot-selector.test.tsx`
- `pnpm exec vitest run apps/web/tests/appointment-slot-selector.test.tsx apps/web/tests/appointment-client.test.ts`
- `pnpm exec task ci`
- `pnpm exec prettier --write README.md docs/operations/QUALITY-GATES.md docs/reports/PHASE-5-RELEASE-READINESS-REPORT.md scripts/check-phase-gate.mjs vitest.config.ts apps/web/src/components/appointment-slot-selector.tsx apps/web/tests/appointment-slot-selector.test.tsx`
- `pnpm exec task ci`

## 7. Tests, contrôles et résultats factuels

Le test ciblé final a réussi :

- Commande : `pnpm exec vitest run apps/web/tests/appointment-slot-selector.test.tsx apps/web/tests/appointment-client.test.ts`
- Résultat : exit code `0`
- Résumé : `Test Files 2 passed (2)`, `Tests 3 passed (3)`

La CI locale complète finale a réussi :

- Commande : `pnpm exec task ci`
- Résultat : exit code `0`
- Formatage : Prettier a confirmé que tous les fichiers contrôlés respectent le
  style.
- Lint/frontières : ESLint a réussi et le contrôle de frontières a inspecté 45
  fichiers source.
- Typecheck : les workspaces TypeScript concernés ont réussi.
- Tests unitaires : `Test Files 11 passed (11)`, `Tests 33 passed (33)`.
- Tests d’intégration : `Test Files 1 passed (1)`, `Tests 2 passed (2)`.
- Gate contrat : `MANUAL_APPOINTMENT_ADAPTER_ONLY`, statut explicite et non preuve
  de compatibilité OpenAPI.
- A11y automatisé : `Test Files 1 passed (1)`, `Tests 1 passed (1)`, avec
  avertissement jsdom connu sur `HTMLCanvasElement.getContext()`.
- Secrets : `Secret baseline passed (152 repository files inspected; secret values are never printed).`
- Build : `next build` réussi, 25 pages statiques générées, routes API rendez-vous
  présentes dans le graphe App Router.
- Baseline HTTP : locale redirect, document FR, headers sécurité, liveness et
  readiness validés.
- Performance : JavaScript public `140473` octets gzip sur budget `204800`, CSS
  public `2318` octets gzip sur budget `51200`.

Deux exécutions intermédiaires ont échoué et ont guidé les corrections :

- import `.tsx` non transformé par Vitest avec la configuration JSX initiale ;
- duplication du message de non-confirmation après soumission acceptée.

Les validations E2E navigateur, audit dépendances, SBOM, build conteneur et scan
conteneur doivent encore être exécutées sur cette branche si la suite doit partir
en PR de durcissement.

## 8. Sécurité, RGPD, accessibilité et conformité

Le parcours UI continue de ne pas contacter l’Appointment API depuis le navigateur.
La demande est soumise à la route serveur interne avec `Idempotency-Key`; la réponse
attendue reste `202` avec `status: PENDING_REVIEW`. L’UI indique explicitement que
la demande sera examinée et qu’il ne s’agit pas d’une confirmation de rendez-vous.

Les champs patient ajoutés sont minimaux pour une demande de revue : prénom, nom,
e-mail, téléphone et adresse optionnelle. Aucune donnée réelle patient n’a été
utilisée dans les tests.

Cette phase ne constitue pas une validation RGPD, DPIA, clinique, juridique,
fiscale, travel-law ou accessibilité experte. Les contrôles automatisés restent
nécessaires mais insuffisants avant publication.

## 9. Écarts, risques et dette explicitement acceptée

- Le fichier `nurse-appointment-api.json` n’est pas présent dans ce dépôt ; la
  compatibilité OpenAPI pinée n’est donc pas prouvée localement.
- Le gate `test:contract` reste un statut de phase, pas un test de compatibilité
  contractuelle contre un artefact OpenAPI versionné.
- Le parcours navigateur E2E ne couvre pas encore le chemin complet de demande de
  rendez-vous avec mocks de disponibilité, hold et `PENDING_REVIEW`.
- Aucune instance staging représentative de production n’a été validée.
- Aucune revue accessibilité experte, screen-reader manuelle ou DPIA n’est présente
  dans le dépôt.
- Aucune stratégie production de rate limiting, anti-abus, email, consentement,
  rétention, suppression/export, sauvegarde/restauration et rollback n’est prouvée.

## 10. Éléments reportés hors périmètre

Sont reportés : déploiement, staging, production, confirmation/rejet admin côté
portail, annulation/replanification, `PAY_ONLINE`, paiement, formulaires qualifiés
des autres domaines, email, analytics/consentement, infrastructure Kubernetes,
Helm/GitOps, secrets production et choix provider.

## 11. État du dépôt et du déploiement

Le travail est local sur `phase-5/release-readiness`. Aucun déploiement, tag,
release, merge, force-push ou modification d’environnement distant n’a été effectué
pendant cette phase.

La PR #7 est déjà mergée dans `main` avant cette phase ; cette phase part de ce
merge comme base.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**NO-GO production**.

Justification : malgré la correction du parcours UI, les preuves obligatoires de
release restent incomplètes : contrat OpenAPI non piné dans le dépôt, E2E critique
incomplet, staging absent, revue RGPD/DPIA absente, revue accessibilité experte
absente, infrastructure/rollback non validés et absence d’autorisation humaine de
production.

## 13. Suite recommandée et justification

Recommandation : poursuivre par une phase courte de durcissement pré-staging.

Objectif : ajouter un test E2E déterministe du parcours rendez-vous avec mocks,
réintroduire ou référencer explicitement l’artefact OpenAPI accepté, transformer le
gate contrat en vérification réelle, puis exécuter `pnpm exec task ci`,
`pnpm exec task ci:extended` et les gates conteneur avant toute PR.

Cette suite réduit les principaux risques techniques sans engager de provider ni
de déploiement.

## 14. Décisions humaines nécessaires

- Confirmer où doit vivre l’artefact OpenAPI accepté : dans ce dépôt, dans un
  package généré, ou comme référence versionnée externe.
- Décider si le parcours complet rendez-vous doit être couvert par Playwright avec
  mocks côté portail avant staging.
- Mandater les validations RGPD/DPIA, clinique/juridique, contenu FR/NL et
  accessibilité experte.
- Autoriser séparément tout staging, tout choix provider, toute configuration
  secrets et tout déploiement.

## 15. Prompt prêt à coller pour la phase suivante

```text
J’approuve le rapport Phase 5 release readiness et autorise une phase courte de
durcissement pré-staging sur une branche dédiée.

Objectif :
- ne pas déployer ;
- ne pas modifier l’infrastructure production ;
- ajouter une couverture E2E déterministe du parcours public rendez-vous
  PAY_ON_SITE avec mocks catalogue/disponibilité/hold/demande PENDING_REVIEW ;
- intégrer ou référencer de manière versionnée l’artefact OpenAPI accepté ;
- remplacer le gate contrat par une vérification factuelle adaptée ;
- exécuter les validations locales pertinentes, notamment pnpm exec task ci,
  ci:extended si réseau disponible, et les gates conteneur si Docker/Trivy sont
  disponibles ;
- produire un rapport français à 16 sections et s’arrêter au gate humain.

Toute décision provider, RGPD, clinique, juridique, accessibilité experte,
staging ou production reste soumise à validation humaine explicite.
```

## 16. Confirmation d’arrêt au gate humain

La phase de release readiness s’arrête au gate humain. Aucune production n’est
autorisée ni recommandée à partir de ces seules preuves.
