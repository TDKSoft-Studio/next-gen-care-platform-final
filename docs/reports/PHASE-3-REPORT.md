# Rapport de phase 3 — Intégration de la demande de rendez-vous

Date : 30 août 2026  
Périmètre : adaptateur serveur du portail vers le contrat `nurse-appointment-api.json`

## 1. Résumé exécutif

L’adaptateur anti-corruption et le sélecteur UI du portail sont implémentés pour le parcours
`PAY_ON_SITE` : il transmet une demande à `POST /api/v1/appointment-requests`
et ne considère comme succès que `202 PENDING_REVIEW`. La route publique ne
présente donc jamais la demande comme un rendez-vous confirmé.

## 2. Objectif et périmètre autorisé

Le périmètre repris est l’intégration serveur du contrat corrigé fourni par le
dépôt Appointment API. Le flux `PAY_ONLINE`, les opérations d’administration,
le déploiement et la modification du dépôt Appointment API sont exclus.

## 3. Travaux réalisés

- Ajout d’un client serveur avec URL configurée côté serveur, timeout de 8 s,
  `cache: no-store` et transmission de `Idempotency-Key`.
- Ajout de `POST /api/home-care/appointment-requests`.
- Validation du `holdId`, des champs patient minimaux et de l’adresse e-mail.
- Normalisation des erreurs sans retransmettre le détail amont potentiellement
  sensible.
- Validation stricte de la réponse `202` et de l’état `PENDING_REVIEW`.
- Ajout de tests unitaires synthétiques pour le succès et l’erreur amont.
- Ajout d’un sélecteur accessible de date, mode, créneau et hold temporaire.
- Ajout des relais serveur de disponibilité et de création de hold.
- Désactivation automatique lorsque les IDs service/lieu approuvés manquent.

## 4. Fichiers créés, modifiés ou supprimés

Créés :

- `apps/web/src/appointment/appointment-client.ts`
- `apps/web/src/app/api/home-care/appointment-requests/route.ts`
- `apps/web/src/app/api/home-care/availability/route.ts`
- `apps/web/src/app/api/home-care/booking-holds/route.ts`
- `apps/web/src/components/appointment-slot-selector.tsx`
- `apps/web/tests/appointment-client.test.ts`
- `docs/reports/PHASE-3-REPORT.md`

Modifié : `apps/web/.env.example`. Aucun fichier supprimé et aucun fichier du
dépôt Appointment API modifié par cette phase.

## 5. Décisions et ADR concernés

ADR-0003 recommande l’adaptateur serveur et interdit l’intégration directe du
navigateur. Le contrat fourni définit `202 PENDING_REVIEW` pour la nouvelle
demande. Le choix d’exclure `PAY_ONLINE` est appliqué conformément à la
clarification humaine reçue.

## 6. Commandes exécutées

- Inspection `jq` du contrat OpenAPI fourni.
- Lecture de la documentation locale Next.js sur les Route Handlers.
- `pnpm exec prettier --write ...` sur les trois nouveaux fichiers TypeScript.
- `pnpm exec prettier --check ...`.
- `pnpm exec eslint ... --max-warnings=0`.
- `pnpm --filter @next-gen-care/web typecheck`.
- `pnpm exec vitest run apps/web/tests/appointment-client.test.ts`.
- `pnpm --filter @next-gen-care/web build`.
- `git diff --check`.

## 7. Tests, contrôles et résultats factuels

Le formatage, le lint ciblé, le typage ciblé et le build Next.js ont réussi. Le test Vitest ciblé
a réussi avec 1 fichier et 2 tests. Les tests utilisent uniquement une réponse
HTTP synthétique et des données fictives.

Aucun test d’intégration HTTP avec une instance réelle de l’Appointment API,
aucun test E2E navigateur et aucun test de concurrence n’ont été exécutés dans
le portail.

## 8. Sécurité, RGPD, accessibilité et conformité

La clé d’idempotence est obligatoire, l’URL de l’API est serveur uniquement,
les mutations ne sont pas mises en cache et les corps ne sont pas journalisés.
Les erreurs amont sont réduites à un code stable et un message générique.
La route ne constitue ni une preuve de conformité RGPD, ni une validation DPIA,
ni une validation clinique ou d’accessibilité.

## 9. Écarts, risques et dette explicitement acceptée

- La protection anti-abus/rate limiting du portail reste à intégrer et valider.
- Le sélecteur UI attend encore les IDs service/lieu approuvés et une validation
  métier de l’usage des coordonnées pour le mode domicile ; aucun identifiant,
  service, lieu, zone ou contenu n’a été inventé.
- La validation de la réservation de hold et de l’expiration reste dans les
  tests et le dépôt Appointment API propriétaire.
- Le timeout et la stratégie d’erreur sont implémentés, mais leur adéquation
  opérationnelle doit être validée en staging.

## 10. Éléments reportés hors périmètre

Sont reportés : flux `PAY_ONLINE`, confirmation/rejet administratifs dans le
portail, annulation et replanification, e-mail, stockage de leads, analytics,
gestion de consentement, déploiement et tests avec infrastructure distante.

## 11. État du dépôt et du déploiement

Le dépôt portail contient les changements non commités des phases précédentes
et ceux de cette phase. Le dépôt Appointment API reste séparé et déjà modifié
par des changements existants sur sa branche `codex/openapi-remediation-resume`.
Aucun commit, push, déploiement ou modification d’environnement distant n’a
été effectué.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**CONDITIONAL GO** pour revue humaine de l’adaptateur et poursuite contrôlée de
l’UI après fourniture des paramètres de catalogue/ créneau approuvés. **NO-GO**
pour production ou exposition publique tant que les contrôles d’abus, de
confidentialité, d’accessibilité, d’intégration et de staging ne sont pas
réalisés.

## 13. Suite recommandée et justification

Revoir l’adaptateur et le sélecteur, puis fournir les paramètres approuvés pour
les services, lieux et créneaux. Ensuite exécuter les tests
contractuels et d’intégration contre l’API corrigée dans un environnement
représentatif, sans données réelles.

## 14. Décisions humaines nécessaires

- Accepter explicitement le contrat corrigé et son identifiant/version de
  référence pour le portail.
- Fournir les services `PAY_ON_SITE`, lieux, zones et règles de créneau
  approuvés pour construire le sélecteur public.
- Autoriser la protection anti-abus et la stratégie de stockage/livraison des
  demandes de rendez-vous.
- Nommer les responsables privacy, clinique et accessibilité pour la revue.

## 15. Prompt prêt à coller pour la phase suivante

```text
J’approuve le rapport de Phase 3 et autorise uniquement la finalisation du
parcours UI public de demande de soins à domicile PAY_ON_SITE, basé sur
POST /api/home-care/appointment-requests et le contrat externe
POST /api/v1/appointment-requests -> 202 PENDING_REVIEW.

Voici les services, lieux, zones et paramètres de créneaux approuvés : [références].
Ne pas implémenter PAY_ONLINE, ne pas présenter une demande comme confirmée,
ne pas modifier l’Appointment API, ne pas choisir de fournisseur et ne pas
déployer. Ajouter les tests de sélection de créneau, double soumission,
erreurs, expiration et accessibilité, puis produire le rapport français à
16 sections et s’arrêter au gate humain.
```

## 16. Confirmation d’arrêt au gate humain

La Phase 3 s’arrête ici. L’adaptateur n’est pas déclaré prêt pour la production
ou pour une publication publique sans revue humaine, paramètres métier
approuvés et validations d’intégration/staging complémentaires.
