# Rapport — Durcissement Phase 5 (1/3) : couverture E2E rendez-vous

Date : 31 août 2026
Branche : `claude/audit-codex-claude-migration-vhehdd` (pull request
[#10](https://github.com/TDKSoft-Studio/next-gen-care-platform-final/pull/10))
Périmètre : premier des trois éléments du backlog de durcissement pré-staging
approuvé en Phase 5 (`docs/reports/PHASE-5-RELEASE-READINESS-REPORT.md`,
section 15) — ajout d'une couverture E2E déterministe du parcours public
rendez-vous `PAY_ON_SITE`. Les deux autres éléments (artefact OpenAPI piné,
gate contrat réel) sont **bloqués par deux défauts réels découverts dans le
dépôt Appointment API pendant cette session**, voir section 9.

> **Mise à jour (même session) :** après approbation humaine, le dépôt
> `TDKSoft-Studio/nurse-appointment-scheduling-api` a été attaché en lecture
> seule et cloné (commit `aa504c2633a9efe64690288f5b55c2f5024259d1`, tip de
> `main`) pour tenter de générer l'artefact OpenAPI accepté. La tentative a
> découvert deux défauts bloquants dans ce dépôt séparé, indépendants de cet
> environnement : sa suite de tests ne compile pas, et deux migrations
> Flyway partagent le même numéro de version, empêchant l'application de
> démarrer contre une base de données neuve. Aucune correction n'a été
> appliquée dans ce dépôt (hors périmètre). Voir section 9 pour le détail et
> les preuves.

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
élément du backlog ; les deux autres éléments restent bloqués, cette fois
par deux défauts vérifiés dans le dépôt Appointment API lui-même (section 9),
et non plus par un simple manque d'accès.

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
git clone --depth 1 https://github.com/TDKSoft-Studio/nurse-appointment-scheduling-api /home/user/nurse-appointment-scheduling-api
service postgresql start
su postgres -c "psql -c \"CREATE ROLE nurse_scheduling LOGIN PASSWORD 'nurse_scheduling';\""
su postgres -c "psql -c \"CREATE DATABASE nurse_scheduling OWNER nurse_scheduling;\""
redis-server --daemonize yes --port 6379
bash backend/scripts/generate-openapi.sh
./mvnw --batch-mode -q spring-boot:run   # (échec testCompile, voir section 9.1)
./mvnw --batch-mode -q -Dmaven.test.skip=true spring-boot:run   # (échec Flyway V17, voir section 9.2)
```

Ces trois dernières commandes ont été exécutées dans le clone local de
`nurse-appointment-scheduling-api` uniquement pour observer le comportement
réel de l'application ; aucune n'a modifié un fichier de ce dépôt.

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

- **Élément bloqué — artefact OpenAPI piné, cause racine identifiée** : le
  dépôt `TDKSoft-Studio/nurse-appointment-scheduling-api` a été attaché en
  lecture seule et cloné (commit `aa504c2633a9efe64690288f5b55c2f5024259d1`)
  pour tenter de générer l'artefact via `backend/scripts/generate-openapi.sh`.
  Deux défauts bloquants ont été trouvés dans ce dépôt séparé, tous deux
  vérifiés directement dans le code source (indépendants de cet
  environnement) :
  1. **Suite de tests non compilable** : `AppointmentServiceTest.java`
     appelle `ConfirmAppointmentRequest.patient()`, alors que
     l'enregistrement réel (`ConfirmAppointmentRequest.java`) expose
     `.client()` et non `.patient()` ; le test référence aussi
     `NURSE_ID`/`nurseId`, absents du code de production actuel. La
     commande `./mvnw spring-boot:run` échoue en `testCompile` avant même de
     démarrer, car ce goal Spring Boot force la compilation des sources de
     test.
  2. **Collision de version Flyway** : `backend/src/main/resources/db/
migration/` contient deux fichiers `V17__appointment_review_workflow.sql`
     et `V17__phase12_rename_practitioner_client.sql` portant le même
     numéro de version. Une fois la compilation des tests contournée
     (`-Dmaven.test.skip=true`, uniquement local, aucun fichier modifié dans
     ce dépôt), l'application échoue au démarrage contre une base
     PostgreSQL neuve avec `FlywayException: Found more than one migration
with version 17`.

     Conséquence : **toute instance fraîche de cette API — CI avec base
     neuve, staging, ou tout environnement partant d'une base vide —
     échoue actuellement au démarrage sur `main`.** C'est très probablement
     la raison pour laquelle l'artefact OpenAPI n'a jamais été généré et
     piné : l'équipe API elle-même ne peut pas le régénérer proprement dans
     cet état, indépendamment de toute action du portail.

  Aucune correction n'a été appliquée dans ce dépôt séparé (hors périmètre
  et explicitement interdit par le contrat maître et par `CLAUDE.md` de ce
  dépôt : « do not alter the separately owned appointment API repository »).
  L'environnement local (PostgreSQL, Redis, processus Java) utilisé pour
  cette tentative a été arrêté ; aucun commit, aucune modification n'a été
  faite dans `nurse-appointment-scheduling-api`. **Reste bloqué en attente
  de correction par l'équipe propriétaire de ce dépôt.**

- **Élément bloqué — gate contrat réel** : remplacer
  `scripts/check-phase-gate.mjs contract` (statut
  `MANUAL_APPOINTMENT_ADAPTER_ONLY`) par une vérification factuelle de
  compatibilité OpenAPI nécessite l'artefact ci-dessus. **Reste bloqué pour
  la même raison ; aggravé par le fait que l'API elle-même ne démarre pas
  actuellement contre une base neuve.**
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
5 (artefact OpenAPI, gate contrat réel) — non plus faute d'accès, mais parce
que le dépôt Appointment API attaché contient deux défauts qui l'empêchent
de démarrer contre une base neuve (section 9). Le verdict global **NO-GO
production** hérité de la Phase 5 reste inchangé et se **renforce** : un
défaut empêchant le démarrage de l'API sur `main` est un risque de
production supplémentaire, indépendant du portail.

## 13. Suite recommandée et justification

La priorité immédiate n'est plus l'artefact OpenAPI lui-même, mais les deux
défauts qui empêchent de le générer :

1. **Signaler les deux défauts à l'équipe/au propriétaire du dépôt
   Appointment API** (test `AppointmentServiceTest.java` désynchronisé du
   code de production ; collision de version Flyway `V17`), avec les
   preuves de cette section. C'est un préalable à toute génération
   d'artefact OpenAPI, que ce travail soit fait par ce portail ou par
   l'équipe API elle-même.
2. Une fois ces défauts corrigés **dans le dépôt Appointment API, sous son
   autorité propre** (jamais par ce portail), régénérer réellement
   l'artefact OpenAPI, l'accepter formellement, puis reprendre le
   référencement/versionnement et le remplacement du gate contrat dans ce
   dépôt portail.
3. Dans l'intervalle, le gate `MANUAL_APPOINTMENT_ADAPTER_ONLY` reste le
   statut honnête à afficher : il ne prétend pas à une compatibilité
   contractuelle qu'aucun artefact actuel ne permet de vérifier.

## 14. Décisions humaines nécessaires

- Décider qui corrige les deux défauts du dépôt Appointment API (son
  équipe/propriétaire, selon la séparation de responsabilité déjà actée) et
  selon quel calendrier.
- Confirmer si la couverture E2E ajoutée ici est jugée suffisante pour ce
  seul élément du backlog Phase 5, ou si une couverture supplémentaire
  (annulation, replanification, confirmation/rejet administratif) est
  requise avant de considérer le parcours rendez-vous comme durci.
- Décider si ces deux défauts doivent être suivis comme un risque formel
  dans le registre déjà tenu par le dépôt Appointment API (`RK-*`, selon sa
  propre convention documentée dans son `CLAUDE.md`) ou communiqués
  directement à son équipe hors de cet outillage.
- Toute décision fournisseur, RGPD/DPIA, clinique/juridique, staging ou
  production reste soumise à l'Human Engineering Authority.

## 15. Prompt prêt à coller pour la phase suivante

```text
J'approuve ce rapport de durcissement Phase 5 (1/3, couverture E2E
rendez-vous) et je prends note des deux défauts découverts dans le dépôt
Appointment API (test AppointmentServiceTest désynchronisé, collision de
version Flyway V17).

Objectif pour la suite :
- ne pas modifier le dépôt Appointment API depuis ce portail ;
- une fois ces deux défauts corrigés par l'équipe propriétaire de ce dépôt
  et un artefact OpenAPI réellement généré et accepté, reprendre ce
  backlog : référencer/verser cet artefact dans ce dépôt portail (ou une
  référence externe versionnée), puis remplacer
  scripts/check-phase-gate.mjs (mode contract) par une vérification
  factuelle de compatibilité ;
- en attendant, conserver le statut MANUAL_APPOINTMENT_ADAPTER_ONLY comme
  statut honnête, sans prétendre à une compatibilité non vérifiable ;
- exécuter pnpm exec task ci et la suite Playwright pour confirmer
  l'absence de régression à chaque étape ;
- ne pas déployer, ne pas modifier l'infrastructure production ;
- produire un rapport français à 16 sections et s'arrêter au gate humain.

Toute décision provider, RGPD, clinique, juridique, staging ou production
reste soumise à validation humaine explicite.
```

## 16. Confirmation d'arrêt au gate humain

Cette session s'arrête ici pour les deux éléments bloqués. Le dépôt
Appointment API a été attaché et cloné en lecture seule sur autorisation
humaine explicite ; aucune modification n'y a été faite, aucun artefact
OpenAPI n'a été fabriqué ou copié, et aucune modification du gate contrat
n'a été tentée sans les preuves nécessaires. J'attends la décision humaine
de la section 14 avant de poursuivre.
