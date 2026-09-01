# Audit global — plateforme NEXT GEN CARE

**Date :** 31 août 2026
**Branche inspectée :** `redesign/landing-visual-identity` (à jour avec `origin`)
**Portée :** monorepo complet — gates qualité, sécurité, architecture, accessibilité,
i18n, tests, chaîne d'approvisionnement. Lecture seule, hors deux correctifs
appliqués et tracés en fin de document.
**Contexte :** audit conduit pendant que l'Appointment API amont est corrigée
(cf. `APPOINTMENT_API_REMEDIATION_AUDIT_2026-08-30.md`).

## Conclusion

La branche est saine : tous les gates locaux passent et les fondations
(sécurité des en-têtes, séparation auteur/reviewer/publisher, client RDV
prudent, chaîne d'approvisionnement épinglée) sont solides. Un défaut de
contrôle d'accès dans la collection Payload `Users` permettait une escalade de
privilèges anonyme ; il est corrigé dans cette passe. Le reste des constats
relève d'écarts documentaires, de dette d'accessibilité localisée, de trous de
couverture de tests et d'hygiène de dépôt.

## État des gates (31/08/2026)

| Gate | Résultat |
| --- | --- |
| `format:check` / `lint` / `typecheck` | vert |
| `test:unit` | vert — 34 tests (33 avant, +1 ajouté ici) |
| `test:integration` / `test:a11y` | vert — 2 / 1 |
| `test:contract` (phase-gate statique) | vert — `MANUAL_APPOINTMENT_ADAPTER_ONLY` |
| `security:secrets` / `security:sast` | vert |
| `build` + `test:http` | vert |
| `performance` | vert — JS 147 549 / 204 800 o gz · CSS 4 158 / 51 200 o gz |
| `pnpm audit --prod --audit-level high` (CI) | vert |
| `test:e2e` | non exécuté (Chromium non installé localement) |

## Constats

### Élevé

#### E1 — Escalade de privilèges anonyme via la REST API Payload *(corrigé)*

`apps/web/src/cms/collections/users.ts` autorisait `create: ({ req }) => !req.user || …`,
soit la création de compte **non authentifiée**. Le champ `roles` n'avait aucun
contrôle d'accès de niveau champ et est renseignable à la création ; `update`
autorise l'auto-modification (`{ id: { equals: req.user?.id } }`). La REST API
Payload est montée (`app/(payload)/api/[...slug]/route.ts`, `routes.api = "/api"`)
et `/api/users` retombe sur ce catch-all.

Chemin d'attaque : `POST /api/users` avec
`{"email":…,"password":…,"roles":["technical-admin"]}` crée un administrateur
technique immédiatement exploitable — `Users` n'a pas `verify: true` et
`access.admin` autorise `editor|medical-approver|technical-admin` à ouvrir
`/admin`. Variante : créer un `editor`, se connecter, puis s'auto-attribuer
`technical-admin` via l'auto-`update` (aucun garde de niveau champ).

Non couvert par le threat model (T-03 = credential stuffing uniquement).

**Correctif appliqué :**

- `create` et `delete` de `Users` réservés à `technical-admin` ;
- `access.create` / `access.update` de niveau champ ajoutés sur `roles`
  (réservés à `technical-admin`) pour fermer l'auto-escalade ;
- le premier compte reste créable via le setup « first user » de Payload
  (`registerFirstUserOperation` appelle `payload.create({ overrideAccess: true })`
  et n'est possible que tant qu'aucun utilisateur n'existe — vérifié dans
  `payload@3.88.0/dist/auth/operations/registerFirstUser.js`) ;
- test de non-régression ajouté dans `apps/web/tests/cms-spike.test.ts`
  (anonyme → `false`, `editor` → `false`, `technical-admin` → `true`, sur
  `Users.access.create` et sur l'accès de niveau champ `roles`).

Non rejoué contre une base réelle (aucune DB dans l'environnement d'audit) ;
la règle d'accès est toutefois sans ambiguïté et l'analyse de
`registerFirstUser` confirme que le bootstrap n'est pas cassé.

### Moyen

#### M1 — Formulaire de PII patient hors landmark

`apps/web/src/app/[locale]/home-care/page.tsx:23` rend `<AppointmentSlotSelector>`
comme frère de `<main>`, **après** `</main>`. Le formulaire qui collecte
nom / e-mail / téléphone / adresse est orphelin (aucun landmark) et le skip-link
`#main-content` de `layout.tsx` n'y conduit pas. Placer le sélecteur à
l'intérieur du `<main>` de `DomainPage`, ou fusionner les deux composants pour
`/home-care`.

#### M2 — Handlers d'API `/api/home-care/*` non testés

`api/home-care/{appointment-requests,availability,booking-holds,catalog}/route.ts`
portent la validation d'entrée (regex UUID, `Idempotency-Key`, format de date,
`mode`), le mapping d'erreurs (400 / 422 / 502 / 503) et le pass-through vers
l'amont. Aucun test unitaire ne les couvre ; seul `appointment/appointment-client.ts`
est testé (`apps/web/tests/appointment-client.test.ts`). Ajouter des tests de
route (cas positifs, JSON invalide, payload invalide, amont non configuré,
erreurs amont).

#### M3 — `SECURITY-BASELINE.md` en décalage avec le code

`docs/compliance/SECURITY-BASELINE.md` affirme « no … forms, appointment
contract, or admin surface ». La branche embarque désormais l'admin Payload, le
formulaire RDV et l'intégration Appointment API. Les contrôles explicitement
différés « tant que la surface n'existe pas » — contrôle d'`Origin` / CSRF sur
mutations, throttling / honeypot (T-16) — ne sont donc plus hors périmètre :
ils manquent sur une surface *live* qui relaie de la PII vers un tiers.
Mettre à jour le baseline pour refléter les surfaces réelles et rouvrir les
lignes de dette correspondantes.

#### M4 — Localisation court-circuitée dans deux composants

`apps/web/src/components/appointment-slot-selector.tsx` et
`apps/web/src/components/cookie-consent-banner.tsx` embarquent leurs chaînes
FR / NL **en dur** au lieu des catalogues versionnés de
`@next-gen-care/localization`. Deux composants visibles (dont un formulaire)
échappent à la parité, au versioning et à la revue du paquet localisation.
Migrer les chaînes vers `fr.v1.json` / `nl.v1.json`.

#### M5 — Sonde de readiness factice

`apps/web/src/app/health/ready/route.ts` renvoie toujours `200 {status:"ok"}`
sans vérifier Postgres / Payload. Les pages `/[locale]/content/[slug]` dépendent
de Payload ; une instance sans DB serait déclarée « ready ». Vérifier au minimum
la joignabilité de la base derrière `/health/ready` (en conservant une réponse
non mise en cache).

### Faible

- **F1 — Dépôt : dossier `/public/` racine.** *(corrigé partiellement)*
  Ce dossier n'est pas servi par Next (qui sert `apps/web/public/`) ; il
  regroupe des références de design citées par
  `docs/prompts/NEXT-GEN-CARES-CODEX-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`.
  Le fichier suivi au nom corrompu `public/brand/logo-mfr.39` (en réalité un
  WebP) est renommé en `public/brand/logo-mfr.webp` et les trois références du
  prompt sont mises à jour. Le PDF personnel non suivi
  `public/brand/contrat_travail_proposition_HKengne.pdf` (4,8 Mo) est ajouté à
  `.gitignore` pour qu'il ne puisse jamais entrer dans l'historique.
  Restent en vrac non suivis : `Next_Gen_Care_Landing0{1,2}.pdf` (cités par le
  prompt — à suivre explicitement si ce sont des entrées de design de
  référence), `berlin2026-fin.png`, `minfull-tripp-paris.jpeg`, `reims-01.png`
  (à suivre ou à supprimer).
- **F2 — `pnpm audit`.** 3 vulnérabilités modérées + 2 faibles, toutes
  `dompurify` via `monaco-editor` (éditeur de code de l'admin Payload,
  hors bundle public). La CI passe grâce à `--audit-level high`. À tracer via
  `pnpm.overrides` / résolution, ou acceptation explicite datée.
- **F3 — CSP.** `'unsafe-inline'` sur `script-src` / `style-src` est déjà
  documenté comme dette (`SECURITY-BASELINE.md`). À noter aussi : `worker-src`
  non défini — l'éditeur Monaco de Payload utilise des workers `blob:` et
  pourrait casser dans l'admin.
- **F4 — `PREVIEW_SECRET` en query string.** `cms/collections/pages.ts` (fonction
  `admin.preview`) et `api/preview/route.ts` font transiter le secret en
  paramètre d'URL → historique navigateur / logs. Pattern Payload courant ;
  hygiène de secret perfectible.
- **F5 — `AppointmentSlotSelector` : ergonomie / a11y.** Pas d'élément `<form>`,
  boutons `type="button"` + handlers manuels → pas de soumission au clavier
  (Enter), pas d'erreur restituée par champ. Le composant `ErrorSummary` de
  `packages/ui` existe et n'est pas réutilisé.
- **F6 — `cookie-consent-banner` : `role="dialog"`** sans focus-trap ni
  `aria-modal`. Un `role="region"` + `aria-label` conviendrait mieux pour une
  bannière non modale toujours rendue en fin de `<body>`.

## Points solides observés

- Tous les gates verts ; budgets de performance largement respectés.
- En-têtes de sécurité complets, HSTS en production, `poweredByHeader: false`,
  `robots` / `sitemap` fail-closed sur l'indexation (`config/public-site.ts`).
- Séparation auteur / reviewer / publisher **réelle** dans
  `Pages.hooks.beforeChange` : `approvedBy` ≠ `lastEditedBy`,
  `contentOwnerConfirmed` requis, publication réservée à `canPublishContent`.
- Client RDV prudent : timeout 8 s, validation `https` / `localhost` de
  `APPOINTMENT_API_URL`, corps amont ni journalisé ni réexposé, statut
  strictement `202` / `PENDING_REVIEW`.
- Chaîne d'approvisionnement : Actions GitHub épinglées par SHA,
  `permissions: contents: read`, Dependabot, Trivy, SBOM CycloneDX 1.6, script
  de frontières de paquets (`scripts/check-package-boundaries.mjs`).
- Catalogues FR / NL à parité stricte (60 clés chacun, `_meta` cohérent).
- Threat model (`docs/architecture/THREAT-MODEL.md`) sérieux et explicite sur
  la dette différée.

## Suivi API — merge du 31/08/2026 (renommage Practitioner/Client)

Dépôt API inspecté en lecture seule : `~/projects/nurse-appointment-scheduling-api`,
`origin/main` @ `aa504c2` (fusion de la reprise de remédiation OpenAPI ; migration
en conflit renumérotée `V19` ; renommage Nurse/Patient → Practitioner/Client ;
correction du hold expiré qui bloquait à tort un nouveau créneau — remédiation
blocker n°2 levée). `GET /v3/api-docs` répond de nouveau (OpenAPI 3.1.0, 47
endpoints).

### Alignement des cinq appels du portail

| Appel portail | Contrat API observé | État |
| --- | --- | --- |
| `GET /api/v1/services` | `ServiceResponse { id, paymentMode, supportsHome, … }` | OK — le filtre `catalog/route.ts` (`PAY_ON_SITE` + `supportsHome`) reste valide |
| `GET /api/v1/locations` | `LocationResponse { id, city, postalCode, supportsHomeCare, … }` | OK — le filtre `/li[eè]ge/` + `supportsHomeCare` reste valide |
| `GET /api/v1/availability` | params `serviceId, date, mode, locationId, clientLat?, clientLng?` ; réponse `{ slots: [{ start }] }` | **cassé partiellement** — le portail envoyait `patientLat` / `patientLng`, désormais ignorés en silence → **corrigé ici** |
| `POST /api/v1/booking-holds` | `{ serviceId, locationId, start, mode, clientAddress?: { latitude, longitude } }` ; réponse `{ holdId, expiresAt }` | OK — le portail n'envoie pas de géoloc sur le hold ; si ajoutée, la clé est `clientAddress`, pas `patientLat` |
| `POST /api/v1/appointment-requests` | corps `{ holdId, client: { firstName, lastName, email, phone, address } }` ; réponse `{ requestId, status:"PENDING_REVIEW", reviewExpiresAt }` | **cassé** — le portail envoyait `patient: {…}` → **corrigé ici** |

Réponses `availability`, `booking-holds`, `appointment-requests` : formes
identiques à ce qu'attend le portail (`AvailabilityResponse { slots:[{start}] }`,
`BookingHoldCreated { holdId, expiresAt }`, `AppointmentRequestAccepted
{ requestId, status, reviewExpiresAt }`). Le statut `PENDING_REVIEW` est bien émis
(202).

### Points de vigilance encore ouverts (hors flux public du portail)

- **Admin `confirm` / `reject`** :
  `@PreAuthorize("hasAnyRole('ADMIN','NURSE','STAFF')")` référence toujours le
  rôle `NURSE` supprimé (remplacé par `PRACTITIONER`) — tout praticien est donc
  refusé sur ces deux actions. Le portail ne les appelle pas, mais le **parcours
  bout-en-bout** (demande soumise → praticien qui la traite) reste bloqué tant
  que le correctif dédié amont n'est pas livré : les tests d'acceptation
  réalistes du workflow de revue sont impossibles d'ici là.
- **Résolution « première organisation »** : `ServicePublicController` /
  `LocationPublicController` font `organizationService.list().findFirst()`. Depuis
  l'onboarding BYB (PR #59 amont), si l'environnement NEXT GEN CARE contient plus
  d'une organisation, `/api/home-care/catalog` peut résoudre le catalogue BYB
  (threat-model T-11). À confirmer : l'environnement cible ne provisionne qu'une
  seule organisation.
- **Contrat OpenAPI** : `/v3/api-docs` reste généré au runtime par springdoc ;
  aucun artefact **suivi et épinglé par commit** n'est présent dans le dépôt API.
  Le phase-gate `scripts/check-phase-gate.mjs contract` du portail continue donc
  de bloquer légitimement la reprise de la Phase 3 tant qu'un contrat accepté et
  épinglé n'existe pas.

## Correctifs appliqués dans cette passe

| Réf. | Fichiers | Nature |
| --- | --- | --- |
| E1 | `apps/web/src/cms/collections/users.ts`, `apps/web/tests/cms-spike.test.ts` | Accès `create` / `delete` de `Users` et accès de niveau champ `roles` réservés à `technical-admin` ; test de non-régression |
| F1 | `public/brand/logo-mfr.39` → `public/brand/logo-mfr.webp`, `docs/prompts/NEXT-GEN-CARES-CODEX-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`, `.gitignore` | Renommage du fichier au nom corrompu + mise à jour des références ; exclusion Git du PDF de contrat personnel |
| API/rename | `apps/web/src/appointment/appointment-client.ts`, `apps/web/src/app/api/home-care/appointment-requests/route.ts`, `apps/web/src/app/api/home-care/availability/route.ts`, `apps/web/src/components/appointment-slot-selector.tsx` | Alignement sur le renommage amont Practitioner/Client : corps `appointment-requests` `patient` → `client` ; params `availability` `patientLat` / `patientLng` → `clientLat` / `clientLng` |
| API/rename (tests) | `apps/web/tests/appointment-requests-route.test.ts` (nouveau), `apps/web/tests/availability-route.test.ts` (nouveau), `apps/web/tests/appointment-client.test.ts`, `apps/web/tests/appointment-slot-selector.test.tsx` | Tests de route figeant la forme `client` et le transfert `clientLat` / `clientLng` ; rejet explicite de l'ancienne forme `patient` (constat M2 partiellement adressé) |

Les autres constats (M1, M3–M5, F2–F6) sont laissés ouverts : ils relèvent d'un
arbitrage produit / clinique à mener avec la reprise de la Phase 3, ou d'une
tranche de dette dédiée.
