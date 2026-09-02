# Rapport de phase — Contrat de déploiement applicatif

**Date :** 2 septembre 2026
**Dépôt :** `next-gen-care-platform`
**Branche de travail au moment du rapport :** `main` (modifications non committées ; voir §11)
**Agent :** Claude Code, sous autorité humaine explicite
**Contrat maître :** `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md` — Adaptateur : `CLAUDE.md` — Adaptateur de tâche : `docs/prompts/claude/DEPLOYMENT_PROMPT.md`

---

## 1. Résumé exécutif

Le contrôle de pré-déploiement de l'infrastructure (`/ngc:prod-preflight`,
exécuté côté `next-gen-care-infra`) avait retourné **BLOCKED** : aucun contrat de
déploiement applicatif exploitable n'existait dans ce dépôt à l'emplacement
attendu par la règle de handoff (`docs/application-deployment-contract.md`).

Cette phase, **documentaire uniquement**, produit ce contrat à partir des
preuves du dépôt, sans modifier le comportement applicatif ni l'infrastructure.
Livrables :

- `docs/application-deployment-contract.md` — contrat normalisé, courant, v1.1,
  chaque champ soit renseigné avec citation de preuve, soit marqué
  `UNKNOWN — REQUIRES DECISION` / `UNKNOWN — REQUIRES MEASUREMENT` avec le
  décideur nommé ;
- `docs/contracts/application-profile.example.yaml` — profil d'exemple
  lisible par machine, non secret, non déployable, cohérent avec le contrat ;
- `docs/architecture/DEPLOYMENT-CONTEXT.md` — corrigé : le dépôt
  `next-gen-care-infra` existe et joue le rôle de contrôleur de déploiement (la
  mention « vide, sans métadonnées Git » est supprimée) ;
- `DEPLOYMENT_CONTRACT.md` (racine) réduit à un pointeur d'une page vers le
  contrat sous `docs/` (disposition validée par l'autorité humaine dans cette
  session) ;
- réalignement des références (`CLAUDE.md`, `docs/knowledge-base/README.md`,
  `docs/prompts/claude/DEPLOYMENT_PROMPT.md`) vers
  `docs/application-deployment-contract.md`.

Trois des quatre contradictions signalées par l'issue sont **résolues par
preuve** ; la quatrième (nom d'hôte de production) et six autres décisions
restent ouvertes et **bloquent la mise en production**. Elles sont consolidées
dans la Section 24 du contrat.

**Verdict : CONDITIONAL GO** pour le handoff de documentation ;
**NO-GO** pour un déploiement de production tant que la Section 24 n'est pas
soldée.

## 2. Objectif et périmètre autorisé

Autorisé (issue collée par l'autorité humaine) :

- créer le contrat de déploiement normalisé et son profil d'exemple ;
- mettre à jour `docs/architecture/DEPLOYMENT-CONTEXT.md` ;
- résoudre par preuve les contradictions résolubles, marquer les autres ;
- produire ce rapport de phase français et un prompt de reprise pour l'infra.

Hors périmètre, non fait :

- aucun changement de code applicatif ou de comportement ;
- aucun ajout/màj de dépendance, de manifeste ou de lockfile ;
- aucune création d'infrastructure, aucun déploiement, aucun `kubectl` / `helm`
  / `argocd` / DNS / certificat / base de données / registre ;
- aucune modification du dépôt `next-gen-care-infra` ni du dépôt de l'API de
  rendez-vous ;
- aucune sélection de fournisseur (registre, SMTP, IdP, stockage objet,
  observabilité, outil de migration) ;
- aucun commit / push / merge / tag / release.

## 3. Travaux réalisés

1. Lecture intégrale de `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`, `CLAUDE.md`,
   `docs/prompts/claude/DEPLOYMENT_PROMPT.md`, `docs/knowledge-base/README.md`,
   `docs/knowledge-base/environment-matrix.md`.
2. Collecte de preuves (lecture seule) : `Dockerfile`, `apps/web/.env.example`,
   `apps/web/next.config.ts`, `apps/web/payload.config.ts`,
   `apps/web/src/security/headers.ts`,
   `apps/web/src/app/health/live/route.ts`,
   `apps/web/src/app/health/ready/route.ts`,
   `apps/web/src/appointment/appointment-client.ts`,
   `apps/web/src/app/api/home-care/*/route.ts`,
   `apps/web/src/app/api/preview/route.ts`,
   `apps/web/src/cms/access.ts`, `apps/web/src/cms/collections/{users,media}.ts`,
   `Taskfile.yml`, `.github/workflows/ci.yml`, `package.json`,
   `apps/web/package.json`, `scripts/check-production-http.mjs`,
   `scripts/generate-sbom.mjs`, `.node-version`, `.nvmrc`,
   `docs/operations/QUALITY-GATES.md`,
   `docs/reports/LOCAL-DEPLOYMENT-VALIDATION-REPORT-2026-09-01.md`,
   `docs/architecture/adr/0011-platform-repository-boundary.md`,
   `DEPLOYMENT_CONTRACT.md` (contenu v1.0 issu de la branche `codex/b103`).
3. Rédaction de `docs/application-deployment-contract.md` v1.1 (27 sections).
4. Rédaction de `docs/contracts/application-profile.example.yaml`.
5. Mise à jour de `docs/architecture/DEPLOYMENT-CONTEXT.md`.
6. Réduction de `DEPLOYMENT_CONTRACT.md` (racine) à un pointeur.
7. Réalignement des références dans `CLAUDE.md`,
   `docs/knowledge-base/README.md`, `docs/prompts/claude/DEPLOYMENT_PROMPT.md`.
8. Formatage Prettier de tous les fichiers touchés + validation de syntaxe YAML.
9. Exécution de `pnpm exec task test:http` et de sondes HTTP manuelles sur le
   serveur standalone pour valider factuellement les affirmations du contrat
   (santé, en-têtes, redirection de locale).
10. Rédaction du présent rapport.

## 4. Fichiers créés, modifiés ou supprimés

| État     | Fichier                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Modifié  | `docs/application-deployment-contract.md` (pointeur 7 lignes → contrat complet v1.1)                                                     |
| Modifié  | `DEPLOYMENT_CONTRACT.md` (contrat complet v1.0 → pointeur)                                                                               |
| Modifié  | `docs/architecture/DEPLOYMENT-CONTEXT.md` (infra = contrôleur de déploiement ; mention « vide » supprimée ; stop conditions reformulées) |
| Modifié  | `docs/knowledge-base/README.md` (lignes de la table repository map re-pointées ; ligne dédiée au profil d'exemple)                       |
| Modifié  | `docs/prompts/claude/DEPLOYMENT_PROMPT.md` (source de vérité re-pointée vers `docs/`)                                                    |
| Modifié  | `CLAUDE.md` (référence de l'adaptateur re-pointée)                                                                                       |
| Créé     | `docs/contracts/application-profile.example.yaml`                                                                                        |
| Créé     | `docs/reports/PHASE-APPLICATION-DEPLOYMENT-CONTRACT-REPORT-2026-09-02.md` (ce rapport)                                                   |
| Supprimé | aucun                                                                                                                                    |

Fichiers non suivis pré-existants dans `public/brand/` : conservés sans
intervention.

## 5. Décisions et ADR concernés

- **ADR-0011 (Platform repository boundary, Accepted)** : confirmée. La
  frontière application / infrastructure est respectée ; le contrat est le point
  de contact contractuel entre les deux dépôts.
- ADR ouverts référencés comme décideurs de champs `UNKNOWN` : ADR-0002 (CMS,
  acté), ADR-0005 (identité admin / MFA), ADR-0006 (stockage média), ADR-0007
  (email), ADR-0008 (analytics/consentement), ADR-0009 (gestion des secrets),
  ADR-0010 (sauvegarde/DR).
- **Aucune nouvelle décision d'architecture n'est prise par cette phase.** Le
  choix de disposition des fichiers (contrat sous `docs/`, pointeur à la racine)
  a été tranché par l'autorité humaine dans cette session.

## 6. Commandes exécutées

Inspection (lecture seule, non mutantes) : `git log`, `git show`, `git status`,
`git branch`, `git merge-base`, `ls`, `find`, `grep`, plus les outils
`Read`/`Glob`.

Formatage et validation :

```text
npx prettier --write  <fichiers touchés>
npx prettier --check  <fichiers touchés>        → All matched files use Prettier code style!
node -e "<parse structurel YAML>"                → sections attendues présentes
```

Validation HTTP factuelle :

```text
pnpm exec task test:http
  → "Production HTTP baseline passed: locale redirect, FR document, security headers, liveness, readiness."

# serveur standalone éphémère, sondes manuelles
PORT=3199 HOSTNAME=127.0.0.1 NODE_ENV=production node apps/web/.next/standalone/apps/web/server.js
curl -i /health/live    → HTTP/1.1 200 OK
curl -i /health/ready   → HTTP/1.1 200 OK
curl -i -H 'Accept-Language: nl-BE,nl' /  → HTTP/1.1 307 Temporary Redirect
```

`node -v` → `v24.20.0` ; `pnpm -v` → `11.24.0`.

## 7. Tests, contrôles et résultats factuels

| Contrôle                                          | Commande / source                                                                       | Résultat                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Redirection de locale `/` → `/nl` (307)           | `pnpm exec task test:http` + `curl`                                                     | **PASS** — `HTTP/1.1 307` observé                                                                          |
| Document FR `<html lang="fr">` sur `/fr`          | `scripts/check-production-http.mjs`                                                     | **PASS**                                                                                                   |
| En-tête CSP `frame-ancestors 'none'`              | `curl -i` (voir §6)                                                                     | **PASS** — CSP complet observé                                                                             |
| `Referrer-Policy: no-referrer`                    | `curl -i`                                                                               | **PASS**                                                                                                   |
| HSTS `max-age=63072000; includeSubDomains` (prod) | `curl -i`                                                                               | **PASS**                                                                                                   |
| `GET /health/live` → 200                          | `curl -i`, `check-production-http.mjs`                                                  | **PASS**                                                                                                   |
| `GET /health/ready` → 200                         | `curl -i`, `check-production-http.mjs`                                                  | **PASS** (mode DB-less : `database: "not-configured"`, dérivé de `apps/web/src/app/health/ready/route.ts`) |
| Prettier sur tous les fichiers touchés            | `npx prettier --check`                                                                  | **PASS**                                                                                                   |
| Cohérence contrat ↔ code                          | inspection croisée `Dockerfile` / `.env.example` / `ci.yml` / routes santé / adaptateur | **cohérent** ; divergences internes documentées en Section 24 du contrat                                   |

Portée : `pnpm exec task test:http` a été exécuté sur un **build standalone
pré-existant** dans l'arbre de travail (non reconstruit dans cette session).
`pnpm exec task ci` (parité CI complète) n'a **pas** été exécuté. Aucune
affirmation « tous les tests passent » n'est faite au-delà du tableau ci-dessus.

## 8. Sécurité, RGPD, accessibilité et conformité

- Aucun secret ni donnée patient réelle n'a été lu, écrit ou imprimé. Le contrat
  ne liste que des **noms logiques** de secrets et leurs clés.
- En-têtes de sécurité applicatifs documentés à partir de
  `apps/web/src/security/headers.ts` (source unique) et vérifiés par sonde HTTP.
- Dette de sécurité connue reportée telle quelle : le secret de `/api/preview`
  transite en paramètre de requête et peut apparaître dans les journaux d'accès
  serveur (déjà suivi dans `docs/compliance/SECURITY-BASELINE.md`).
- Le contrat rappelle que le traitement RGPD (DPIA, base légale, hébergement UE,
  rétention) et l'acceptation d'accessibilité WCAG 2.2 AA relèvent d'une
  revue humaine qualifiée et ne sont **pas** validés par cette phase.
- Contrainte de sécurité réseau documentée : l'adaptateur n'accepte
  `APPOINTMENT_API_URL` qu'en `https:` ou hôte `localhost`
  (`apps/web/src/appointment/appointment-client.ts:37`).

## 9. Écarts, risques et dette explicitement acceptée

- **Écart résolu** : les endpoints `/health/live` et `/health/ready` existent
  bien dans le code et sont couverts par le gate CI ; le constat infra « not
  found in application code » était erroné au commit `f9122cd`.
- **Risque bloquant** : aucune image n'est publiée par ce dépôt (CI
  `permissions: contents: read`, pas de `docker push`, aucune référence
  registre). Le digest concret du profil infra ne provient donc pas d'ici. Le
  déploiement par digest exigé par le Contrat maître §19 ne peut pas être
  satisfait tant qu'un workflow de publication n'existe pas.
- **Risque** : dimensionnement CPU/RAM, temps de démarrage et
  `readOnlyRootFilesystem` non mesurés → marqués `UNKNOWN — REQUIRES
MEASUREMENT` / `REQUIRES VALIDATION`.
- **Risque** : mécanisme de migration Payload/PostgreSQL non défini ; une
  migration destructrice pourrait imposer une restauration de base plutôt qu'un
  simple rollback d'image.
- **Dette documentaire acceptée** : `docs/operations/QUALITY-GATES.md` contient
  encore la mention « infrastructure repository remains uninitialized » (ligne
  Helm) — hors périmètre de cette issue, signalé pour correction ultérieure.
- **Dette de méthode acceptée** : `pnpm exec task ci` non exécuté ; validation
  limitée à `test:http` + sondes.

## 10. Éléments reportés hors périmètre

- Contrepartie Codex `docs/prompts/codex/DEPLOYMENT_PROMPT.md`.
- Correction de `docs/operations/QUALITY-GATES.md` (mention Helm obsolète).
- Toute implémentation : workflow de publication d'image, endpoints ou sondes
  supplémentaires, changement de politique de l'adaptateur d'URL.
- Mesures de ressources et validation `readOnlyRootFilesystem` en conteneur.
- Toute décision de fournisseur, de domaine, de namespace, d'ingress, de
  StorageClass, de backend d'observabilité.

## 11. État du dépôt et du déploiement

- Branche courante : `main` au commit `9ef6855`.
- **Les livrables de cette phase ne sont pas committés.** Arbre de travail :
  6 fichiers modifiés + 2 fichiers créés (`docs/contracts/…`,
  `docs/reports/…`), plus les fichiers non suivis pré-existants dans
  `public/brand/`.
- Aucun `git add` / `commit` / `push` / `merge` / `tag` n'a été effectué.
- Recommandation : déplacer ces changements sur une branche dédiée
  (`docs/application-deployment-contract`) avant tout commit — pas de commit
  direct sur `main`.
- État de déploiement : inchangé. Aucun état de cluster inspecté ou modifié.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

- **CONDITIONAL GO** — pour le handoff _documentaire_ vers `next-gen-care-infra` :
  le contrat existe, est courant, cohérent avec le code, et chaque inconnue est
  nommée avec son décideur.
- **NO-GO** — pour un _déploiement de production_ : la Section 24 du contrat
  liste 10 décisions/contradictions ouvertes qui bloquent la production, dont
  l'absence d'image publiée (déploiement par digest impossible) et le nom
  d'hôte de production non confirmé.

## 13. Suite recommandée et justification

1. **Autorité humaine** : revoir et approuver les livrables ; trancher les
   points de la Section 24 qui lui reviennent (nom d'hôte, `PREVIEW_SECRET`,
   transport vers l'API de rendez-vous, mécanisme de migration, ADR ouverts).
2. **Admin dépôt/org** : décider du registre et autoriser un workflow de
   publication d'image (avec provenance) — prérequis au déploiement par digest.
3. **Intégration** : déplacer les livrables sur une branche dédiée, ouvrir une
   PR de documentation, faire relire, merger sous autorité humaine.
4. **Infra** : une fois le contrat mergé et approuvé, relancer
   `/ngc:prod-preflight` ; s'il juge le contrat exploitable → vérification
   cluster en lecture seule → preuve locale k3d → gate humain explicite →
   déploiement Argo CD.
5. **Mesures** : `next-gen-care-infra` exécute un run conteneur pour mesurer
   temps de démarrage, ressources, et valider `readOnlyRootFilesystem` ; les
   valeurs obtenues reviennent mettre à jour la Section 12/24 du contrat
   (bump mineur/patch).

## 14. Décisions humaines nécessaires

Reprise de la Section 24 du contrat (chaque ligne nomme le décideur) :

| #   | Décision                                                                                                                                     | Décideur                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Registre + workflow de publication d'image + provenance ; digest et `sourceRevision` faisant autorité                                        | admin dépôt/org + Autorité humaine                    |
| 2   | `PREVIEW_SECRET` requis en production ou non                                                                                                 | Autorité humaine + responsable gouvernance de contenu |
| 4   | Nom d'hôte canonique de production (apex vs `www`) + redirection ; `NEXT_PUBLIC_SITE_URL`                                                    | Autorité humaine                                      |
| 5   | Transport interne vers l'API de rendez-vous : HTTPS interne, ou changement autorisé de la politique de l'adaptateur, ou TLS via sidecar/mesh | Autorité humaine + infra + propriétaire de l'API      |
| 6   | Validation `readOnlyRootFilesystem` + chemins inscriptibles                                                                                  | infra                                                 |
| 7   | Requests/limits CPU et mémoire (par mesure)                                                                                                  | infra                                                 |
| 8   | `replicas` min/max, stratégie de déploiement, PDB, HPA                                                                                       | infra + Autorité humaine                              |
| 9   | Mécanisme de migration (push auto vs migrations générées) + politique de migration destructrice / rollback DB                                | Autorité humaine + infra                              |
| 10  | ADR ouverts : email, identité admin/MFA, stockage média/objet, analytics/consentement, gestionnaire de secrets + rotation, sauvegarde/DR     | Autorité humaine (par ADR)                            |
| 3   | _(résolu)_ Configuration des sondes santé selon la Section 6 du contrat                                                                      | infra (configuration seule)                           |

## 15. Prompt prêt à coller pour la phase suivante

```text
Contexte : le contrat de déploiement applicatif de `next-gen-care-platform` est
maintenant présent et à jour :
- docs/application-deployment-contract.md (v1.1, faisant autorité)
- docs/contracts/application-profile.example.yaml (profil d'exemple)
- DEPLOYMENT_CONTRACT.md (pointeur)
La Section 24 du contrat liste les décisions/contradictions ouvertes qui
bloquent la production, chacune avec son décideur.

Objectif de cette phase (dépôt next-gen-care-infra, sous autorité humaine) :
1. Relancer /ngc:prod-preflight en consommant docs/application-deployment-contract.md
   et docs/contracts/application-profile.example.yaml.
2. Ne rien inventer : tout champ marqué UNKNOWN — REQUIRES DECISION /
   REQUIRES MEASUREMENT reste bloquant jusqu'à décision/mesure enregistrée.
3. Produire un rapport de préflight indiquant, contradiction par contradiction
   (Section 24), si elle est levée, par quelle preuve, et par quelle décision
   humaine.
4. Si — et seulement si — le préflight juge le contrat exploitable :
   vérification cluster en lecture seule → preuve locale k3d → gate humain
   explicite → déploiement Argo CD.
5. Ne pas modifier le dépôt next-gen-care-platform depuis l'infra ; toute
   correction du contrat repasse par une PR sur le dépôt applicatif.
6. S'arrêter et demander l'approbation de l'Autorité humaine avant tout
   déploiement.

Ne pas franchir de phase gate sans approbation humaine explicite.
```

## 16. Confirmation d'arrêt au gate humain

La phase est terminée. L'agent **s'arrête ici** et attend l'approbation
explicite de l'Autorité humaine d'ingénierie avant :

- de committer ou pousser quoi que ce soit (les livrables sont dans l'arbre de
  travail sur `main`, non committés) ;
- d'ouvrir une pull request ;
- de démarrer toute phase suivante ou toute implémentation.

Aucune approbation implicite ne peut être déduite d'une commande verte, d'une
conversation antérieure ou du présent rapport.
