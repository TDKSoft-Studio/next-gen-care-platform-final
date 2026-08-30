# Prompt de remédiation — Appointment API

```text
Vous intervenez dans le dépôt séparé Nurse Appointment Scheduling API. Votre
objectif est de rendre son contrat public sûr et consommable par NEXT GEN CARE
Phase 3, sans modifier le dépôt du portail et sans déployer.

Avant toute écriture, lisez intégralement CLAUDE.md et les documents
autoritaires qu’il référence. Travaillez sur une branche dédiée, conservez les
changements utilisateur, ne commitez pas directement sur main et ne révélez
aucun secret ou donnée réelle.

Contexte établi par audit, à vérifier dans le code :

1. POST /api/v1/appointments/confirm crée actuellement directement un
   rendez-vous CONFIRMED. NEXT GEN CARE doit accuser réception d’une demande
   puis ne confirmer qu’après validation humaine.
2. booking_holds applique une contrainte d’exclusion à toute ligne ACTIVE,
   tandis que la disponibilité ignore les ACTIVE expirés. Aucun chemin
   transactionnel observé ne fait passer ces lignes à EXPIRED ; un hold expiré
   peut donc bloquer un nouveau créneau au niveau PostgreSQL.
3. nurse-appointment-api.json est non suivi. L’export OpenAPI observé n’a ni
   securitySchemes, ni réponses non-200, ni schémas ProblemDetail complets et
   expose une collision PatientAddress.

Périmètre autorisé : corriger ces défauts dans l’API, ses migrations, ses
tests, sa documentation et son contrat OpenAPI suivi. N’ajoutez ni paiement,
ni fournisseur, ni collecte clinique, ni intégration portail, ni déploiement.

Premièrement, documentez dans une ADR ou une proposition de décision le cycle
de vie et faites-le accepter par le propriétaire métier/clinique avant de
figer les transitions : REQUESTED, PENDING_REVIEW, CONFIRMED, REJECTED,
CANCELLED et RESCHEDULED. Définissez les acteurs, les autorisations, les
notifications, les invariants, les transitions impossibles et le comportement
de capacité pendant PENDING_REVIEW. Ne présentez jamais une demande comme un
rendez-vous confirmé. Si aucune décision de capacité n’est disponible,
arrêtez-vous et demandez-la : elle détermine la cohérence et l’expérience
publique.

Ensuite, implémentez un chemin public de création de demande qui renvoie un
accusé réception sans confirmation clinique, et une transition réservée à un
acteur humain autorisé pour confirmer ou rejeter. Préservez explicitement la
compatibilité des consommateurs existants ou livrez une version d’API et un
plan de migration acceptés ; ne changez pas silencieusement la sémantique d’un
endpoint public. Chaque transition doit être auditée dans la même transaction
et respecter l’idempotence existante.

Corrigez l’expiration des holds dans le chemin transactionnel de réservation :
sous les AdvisoryLockService existants, marquez les holds ACTIVE expirés comme
EXPIRED avant tout calcul de disponibilité et avant toute insertion
concurrente. Un nettoyage asynchrone peut exister en complément, jamais comme
unique protection. Ne tentez pas un prédicat d’index utilisant now() : il
n’est pas approprié comme garantie d’exclusion PostgreSQL. Ajoutez une
migration seulement si le schéma l’exige, compatible avec les données
existantes et accompagnée de notes de rollback/forward-fix.

Rendez le contrat OpenAPI canonique, suivi et reproductible. À minima :

- placez l’artefact versionné à un emplacement documenté ;
- empêchez la dérive par une vérification CI génération/validation/diff ;
- documentez les schémas de sécurité et les opérations d’administration ;
- décrivez Idempotency-Key, succès 201/202/204 et toutes les erreurs réelles
  avec un schéma ProblemDetail et codes stables ;
- donnez des noms OpenAPI uniques aux DTO incompatibles, notamment les deux
  formes PatientAddress ;
- reflétez exactement le nouveau modèle de demande et ses états.

Ajoutez et exécutez des tests unitaires, Testcontainers/PostgreSQL,
intégration HTTP et contractuels. Ils doivent couvrir au minimum : demande
accusée sans CONFIRMED, autorisation de revue, confirmation et rejet humains,
transitions invalides, idempotence, hold expiré suivi d’une nouvelle
réservation chevauchante, concurrence, erreurs ProblemDetail, contrat OpenAPI
validé et absence de collision de schéma. N’utilisez que des données
synthétiques et vérifiez qu’aucun corps patient n’est loggé.

Avant de terminer, fournissez :

1. le commit immuable et le chemin du contrat OpenAPI accepté ;
2. une matrice opération/état/rôle/réponse/erreur ;
3. les migrations et le plan rollback/forward-fix ;
4. les commandes réellement exécutées avec résultats ;
5. les écarts, risques et décisions humaines restantes ;
6. un rapport de phase français fidèle aux instructions du dépôt API.

Ne déployez rien et attendez l’approbation explicite du propriétaire du dépôt
et de l’Human Engineering Authority avant de déclarer le contrat consommable
par NEXT GEN CARE.
```
