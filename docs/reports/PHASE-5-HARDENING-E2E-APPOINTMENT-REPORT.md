# Rapport — Durcissement Phase 5 (1/3) : couverture E2E rendez-vous

Date : 31 août 2026
Branche : `claude/audit-codex-claude-migration-vhehdd`
Périmètre : premier des trois éléments du backlog de durcissement pré-staging
approuvé en Phase 5 (`docs/reports/PHASE-5-RELEASE-READINESS-REPORT.md`,
section 15) — ajout d'une couverture E2E déterministe du parcours public
rendez-vous `PAY_ON_SITE`. Les deux autres éléments (artefact OpenAPI piné,
gate contrat réel) sont **bloqués**, voir section 9.

## 1. Résumé exécutif

Le dépôt ne contenait, avant cette session, aucun test navigateur du
parcours complet catalogue → disponibilité → hold → demande `PENDING_REVIEW`
sur la page publique soins à domicile ; seul un test unitaire jsdom
(`apps/web/tests/appointment-slot-selector.test.tsx`, Phase 5) existait.
Cette session ajoute `tests/e2e/home-care-appointment.spec.ts`, deux tests
Playwright déterministes qui mockent les quatre routes internes
`/api/home-care/*` au niveau réseau du navigateur et pilotent réellement le
composant `AppointmentSlotSelector` : un scénario nominal (demande acceptée
en `PENDING_REVIEW`, avec vérification explicite que le texte « rendez-vous
confirmé » n'apparaît jamais) et un scénario d'échec de hold (créneau
indisponible, message d'erreur affiché, pas de confirmation).

Les 8 tests Playwright du dépôt (6 existants + 2 nouveaux) passent, ainsi
que `pnpm exec task ci` dans son intégralité. Verdict : **GO** pour ce seul
élément du backlog ; les deux autres éléments restent bloqués en dehors du
périmètre de ce dépôt (section 9).

## 2. Objectif et périmètre autorisé

Objectif approuvé par l'utilisateur : « oui » à la proposition d'enchaîner,
après correction de l'écart accessibilité (finalement inexistant, voir
`docs/reports/PHASE-LANDING-V2-VISUAL-REDESIGN-REPORT.md`), sur le backlog
Phase 5. Périmètre respecté : uniquement l'ajout d'un test E2E avec mocks,
aucune modification du composant applicatif, des routes serveur ou du
contrat, aucune sélection de fournisseur, aucun déploiement.

## 3. Travaux réalisés

- Lecture de `apps/web/src/components/appointment-slot-selector.tsx`,
  `apps/web/src/appointment/appointment-client.ts`, et des quatre routes
  serveur `apps/web/src/app/api/home-care/{catalog,availability,
booking-holds,appointment-requests}/route.ts` pour comprendre les formes
  de requêtes/réponses réelles et les contraintes de validation (format
  UUID pour `serviceId`/`locationId`, en-tête `Idempotency-Key` obligatoire,
  code `202`/`PENDING_REVIEW` en cas de succès).
- Création de `tests/e2e/home-care-appointment.spec.ts` : mocks
  `page.route` sur les quatre endpoints internes, pilotage du composant via
  `getByRole`/`getByLabel` (dates, mode, créneau radio, formulaire patient
  minimal), assertions sur le texte de non-confirmation et sur l'absence de
  toute mention « rendez-vous confirmé ».
- Exécution réelle contre un serveur `next dev` local et un Chromium
  pré-installé de l'environnement (même procédure que pour la clôture
  landing v2) : `pnpm exec playwright test` ciblé, puis suite complète.
- `pnpm exec prettier --write` et `pnpm exec eslint --max-warnings=0` sur le
  nouveau fichier.
- Exécution complète de `pnpm exec task ci` sur l'état final.
- Annulation systématique des régénérations automatiques de
  `apps/web/next-env.d.ts` par `next dev` avant chaque commit.

## 4. Fichiers créés, modifiés ou supprimés

Créés :

- `tests/e2e/home-care-appointment.spec.ts`
- `docs/reports/PHASE-5-HARDENING-E2E-APPOINTMENT-REPORT.md` (ce document)

Aucun fichier applicatif modifié. Aucun fichier supprimé.

## 5. Décisions et ADR concernés

Aucune. Le test ajouté n'introduit aucune dépendance, aucune route,
aucune logique métier nouvelle ; il exerce le code déjà en place.

## 6. Commandes exécutées

```text
pnpm exec prettier --write tests/e2e/home-care-appointment.spec.ts
pnpm exec eslint tests/e2e/home-care-appointment.spec.ts --max-warnings=0
pnpm --filter @next-gen-care/web dev --hostname 127.0.0.1 --port 3100
pnpm exec playwright test --project=chromium --config=<config locale, executablePath Chromium pré-installé, reuseExistingServer:true>
pnpm exec task ci
```

## 7. Tests, contrôles et résultats factuels

Suite Playwright ciblée (`tests/e2e/home-care-appointment.spec.ts`) —
**2 tests passés (2)** :

- `submits a PENDING_REVIEW request and never presents it as a confirmed
appointment` — passé.
- `surfaces an unavailable message when the hold request fails` — passé.

Suite Playwright complète (`tests/e2e/foundation.spec.ts` +
`tests/e2e/home-care-appointment.spec.ts`) — **8 tests passés (8)** en
9,2 s, aucune régression sur les 6 tests préexistants (négociation NL,
navigation, deux scans `axe-core`, lien d'évitement).

`pnpm exec task ci` — exit code `0`, mêmes résultats que documentés dans
`docs/reports/PHASE-LANDING-V2-VISUAL-REDESIGN-REPORT.md` section 7
(formatage, lint, frontières, typecheck, 33 tests unitaires, 2 tests
d'intégration, gate contrat en statut `MANUAL_APPOINTMENT_ADAPTER_ONLY`
inchangé, a11y jsdom, secrets, build, baseline HTTP, budget de performance).
Le nouveau fichier de test n'est pas exécuté par `task ci` lui-même (qui ne
lance pas la suite Playwright par défaut) ; il l'a été séparément via
`pnpm exec playwright test`, comme documenté ci-dessus.

`ci:extended` non exécuté dans cette session, comme dans la clôture
landing v2 (même justification : disponibilité réseau non vérifiée).

## 8. Sécurité, RGPD, accessibilité et conformité

Le test ajouté n'utilise aucune donnée patient réelle : `Camille Dupont`,
`camille.dupont@example.test` sont des valeurs synthétiques. Il vérifie
explicitement que la demande acceptée reste présentée comme
`PENDING_REVIEW` et jamais comme un rendez-vous confirmé, ce qui constitue
une preuve automatisée directe du comportement exigé par la Phase 3
(« Ne présentez jamais une demande comme un rendez-vous confirmé »). Il
vérifie aussi la présence de l'en-tête `Idempotency-Key` sur les requêtes
`POST` mockées, cohérent avec l'exigence d'idempotence déjà actée.

## 9. Écarts, risques et dette explicitement acceptée

- **Élément bloqué — artefact OpenAPI piné** : le backlog Phase 5 demande de
  « référencer/verser l'artefact OpenAPI accepté ». Cet artefact appartient
  au dépôt séparé Nurse Appointment Scheduling API, qui n'est pas attaché à
  cette session (aucun `add_repo` n'a été fait pour lui, et aucune décision
  humaine sur son emplacement final n'a été prise — Phase 5 rapport
  section 14). Je ne peux pas fabriquer ou copier cet artefact sans y avoir
  accès réel : le faire violerait la discipline de preuve du contrat maître
  (« Never invent … API behavior »). **Reste bloqué en attente d'accès au
  dépôt ou de decision humaine sur son emplacement.**
- **Élément bloqué — gate contrat réel** : remplacer
  `scripts/check-phase-gate.mjs contract` (statut
  `MANUAL_APPOINTMENT_ADAPTER_ONLY`) par une vérification factuelle de
  compatibilité OpenAPI nécessite l'artefact ci-dessus. **Reste bloqué pour
  la même raison.**
- Le test E2E mocke la frontière réseau du navigateur
  (`page.route`), pas les routes serveur Next.js elles-mêmes : il ne
  prouve donc pas que les routes serveur transforment correctement une
  vraie réponse de l'Appointment API, seulement que le composant client se
  comporte correctement face à des réponses conformes au contrat attendu.
  Une preuve d'intégration serveur ↔ Appointment API réelle nécessiterait
  soit un environnement de test avec l'API réelle/un double fidèle, soit un
  test contractuel contre l'artefact OpenAPI — actuellement indisponible
  (voir ci-dessus).
- Les risques déjà actés en Phase 5 et dans la clôture landing v2 restent
  inchangés et ne sont pas repris ici.

## 10. Éléments reportés hors périmètre

Artefact OpenAPI piné, gate contrat réel, `ci:extended`, staging,
déploiement, choix fournisseur, décision RGPD/DPIA — tous hors périmètre de
cette session pour les raisons de la section 9.

## 11. État du dépôt et du déploiement

Travail effectué sur `claude/audit-codex-claude-migration-vhehdd`. Aucun
commit sur `main`, aucun merge, tag, release, force-push. Le serveur de
développement local utilisé pour les tests Playwright a été arrêté après
chaque exécution. Aucun déploiement n'a eu lieu.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**GO** pour cet élément isolé (couverture E2E rendez-vous) : livré, testé,
sans régression. **BLOCKED** pour les deux autres éléments du backlog Phase
5 (artefact OpenAPI, gate contrat réel), faute d'accès au dépôt Appointment
API ou de décision humaine sur son emplacement. Le verdict global
**NO-GO production** hérité de la Phase 5 reste inchangé : cette session ne
lève pas ce verdict, elle réduit un seul des risques qui le motivaient.

## 13. Suite recommandée et justification

Pour débloquer les deux éléments restants, l'une de ces actions humaines est
nécessaire :

1. Attacher le dépôt Nurse Appointment Scheduling API à une session future
   (`add_repo` côté Claude Code) afin d'en extraire l'artefact OpenAPI
   réellement accepté ; ou
2. Fournir directement l'artefact OpenAPI accepté (fichier ou URL versionnée)
   pour qu'il soit intégré et piné dans ce dépôt ; ou
3. Confirmer explicitement que ces deux éléments restent hors périmètre pour
   l'instant et que la Phase 5 est close avec cette réserve documentée.

Recommandation : option 1, la plus directe, si ce dépôt existe et est
accessible — elle permet de vérifier l'état réel du contrat plutôt que de
travailler sur une hypothèse.

## 14. Décisions humaines nécessaires

- Choisir parmi les options 1 à 3 de la section 13.
- Confirmer si la couverture E2E ajoutée ici est jugée suffisante pour ce
  seul élément du backlog Phase 5, ou si une couverture supplémentaire
  (annulation, replanification, confirmation/rejet administratif) est
  requise avant de considérer le parcours rendez-vous comme durci.
- Toute décision fournisseur, RGPD/DPIA, clinique/juridique, staging ou
  production reste soumise à l'Human Engineering Authority.

## 15. Prompt prêt à coller pour la phase suivante

```text
J'approuve ce rapport de durcissement Phase 5 (1/3, couverture E2E
rendez-vous) et j'attache le dépôt Nurse Appointment Scheduling API à cette
session pour en extraire l'artefact OpenAPI réellement accepté.

Objectif :
- lire en lecture seule le dépôt Appointment API attaché ;
- identifier et extraire l'artefact OpenAPI actuellement exposé, avec son
  empreinte et sa version ;
- proposer, sans l'imposer, un emplacement de stockage versionné dans ce
  dépôt portail (ou une référence externe versionnée) pour cet artefact ;
- remplacer scripts/check-phase-gate.mjs (mode contract) par une
  vérification factuelle de compatibilité contre cet artefact, uniquement
  après validation de l'emplacement choisi ;
- exécuter pnpm exec task ci et la suite Playwright pour confirmer
  l'absence de régression ;
- ne pas déployer, ne pas modifier l'infrastructure production, ne pas
  modifier le dépôt Appointment API lui-même ;
- produire un rapport français à 16 sections et s'arrêter au gate humain.

Toute décision provider, RGPD, clinique, juridique, staging ou production
reste soumise à validation humaine explicite.
```

## 16. Confirmation d'arrêt au gate humain

Cette session s'arrête ici pour les deux éléments bloqués. Aucun accès au
dépôt Appointment API, aucune fabrication d'artefact OpenAPI, aucune
modification du gate contrat n'a été tentée sans les preuves nécessaires.
J'attends la décision humaine de la section 14 avant de poursuivre.
