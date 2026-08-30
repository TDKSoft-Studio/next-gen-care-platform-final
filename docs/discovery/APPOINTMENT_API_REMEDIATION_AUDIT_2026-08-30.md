# Audit de remédiation — Appointment API

**Date :** 30 août 2026  
**Dépôt inspecté :** `/home/hkengne/projects/nurse-appointment-scheduling-api`  
**Mode :** lecture seule ; aucune modification du dépôt Appointment API

## Conclusion

L’Appointment API ne peut pas encore être consommée par la Phase 3 de NEXT
GEN CARE. Trois correctifs sont bloquants avant la génération d’un client ou
la collecte d’une demande de soins : le cycle de vie n’implémente pas la
validation humaine, une réservation expirée peut rester bloquante dans
PostgreSQL, et le contrat OpenAPI n’est ni suivi ni fidèle au comportement.

## Éléments de preuve

- Le dépôt est sur `main...origin/main`, commit observé
  `e7894e71e6b3e329bffe0b653dd864c0e204a7e5`. Son seul changement observé est
  `nurse-appointment-api.json`, non suivi.
- Cet export indique OpenAPI 3.1.0, version `v1`, 42 chemins et 58 opérations.
  Son SHA-256 observé est
  `afb40204376bf5fe520abb2065401c27db3539389731f8ef73f3d2b77e6d3a4a`.
- L’analyse structurée de cet export trouve zéro `securitySchemes`, zéro
  opération avec sécurité déclarée et uniquement la réponse `200` pour
  `POST /api/v1/booking-holds` et `POST /api/v1/appointments/confirm`.
- `AppointmentStatus.java` ne contient que `CONFIRMED`, `CANCELLED`,
  `COMPLETED` et `NO_SHOW`. `ConfirmAppointmentController` appelle le service
  qui crée directement un rendez-vous confirmé ; les tests E2E actuels
  affirment explicitement ce résultat.
- La migration `V4__phase05_booking_and_confirmation.sql` impose une
  contrainte d’exclusion sur toute ligne `booking_holds` dont `status =
  'ACTIVE'`. `BookingHold.isActive(now)` considère une ligne expirée inactive,
  mais aucune transition observée vers `EXPIRED` ou `RELEASED` ne libère cette
  ligne dans la base. La requête applicative peut donc proposer un créneau que
  PostgreSQL refusera ensuite.

## Correctifs obligatoires

### 1. Cycle de vie et validation humaine

Le flux public ne doit plus produire directement `CONFIRMED`. Le propriétaire
métier/clinique doit accepter un automate comprenant au minimum `REQUESTED`,
`PENDING_REVIEW`, `CONFIRMED`, `REJECTED`, `CANCELLED` et `RESCHEDULED`, les
acteurs autorisés, les transitions, les notifications et le comportement de
capacité pendant la revue.

La décision de capacité est indispensable : soit une demande en revue réserve
explicitement le créneau avec une expiration/règle de libération documentée,
soit l’équipe confirme seulement après une nouvelle vérification atomique. Ce
choix ne peut pas être déduit par le portail.

### 2. Expiration des holds sous PostgreSQL

La correction de sûreté doit s’exécuter dans le chemin transactionnel sous les
verrous consultatifs existants, avant la disponibilité et avant l’insertion :
passer les holds `ACTIVE` expirés à `EXPIRED`, puis seulement calculer et
réserver. Un travail de nettoyage asynchrone peut compléter cette mesure mais
ne peut pas être son unique garantie de cohérence.

Des tests Testcontainers/PostgreSQL doivent prouver qu’un hold expiré reste
historique mais ne bloque plus un nouveau hold chevauchant, y compris dans un
scénario concurrent. Aucune suppression globale de données n’est nécessaire
ni autorisée pour ce correctif.

### 3. Contrat OpenAPI versionné et fidèle

Le contrat accepté doit être un artefact suivi et reproductible, généré ou
vérifié en CI. Il doit documenter les schémas et réponses réels (`201`, `202`,
`204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500` selon les
opérations), `ProblemDetail` et ses codes stables, `Idempotency-Key`, les
schémas de sécurité d’administration et les opérations publiques.

Les deux DTO Java actuellement exportés sous le même nom `PatientAddress`
doivent avoir des noms OpenAPI uniques. Le contrat doit aussi refléter le
nouveau cycle de vie et le modèle de demande validé.

## Critères de remise à NEXT GEN CARE

1. PRs revues et CI verte dans le dépôt API, incluant migrations et tests
   réels PostgreSQL.
2. Contrat OpenAPI suivi, versionné et référencé par un commit immuable ;
   validation OpenAPI et contrôle de dérive code/contrat en CI.
3. Preuves de tests des cas positifs, erreurs, idempotence, expiration,
   concurrence, transitions de revue, rejet, annulation et replanification.
4. Décision humaine enregistrée sur le cycle, la capacité pendant revue et le
   traitement des données de santé ; aucune donnée réelle dans les tests ou
   logs.
5. Approbation explicite de ce contrat pour le portail. Seul cet artefact
   permettra de reprendre la Phase 3.
