# Rapport Phase 0 — NEXT GEN CARE

## 1. Résumé exécutif

La Phase 0 a établi que le portail public NEXT GEN CARE n’est pas implémenté dans l’espace de travail inspecté, que le dépôt d’infrastructure dédié est vide et que le répertoire plateforme n’est pas un dépôt Git fonctionnel. Le dépôt séparé de rendez-vous contient une application substantielle, mais son contrat et son comportement ne sont pas intégrables en production tels quels pour le parcours NEXT GEN CARE.

Quatre blocages d’intégration sont prouvés par inspection statique : l’API confirme directement les rendez-vous sans validation humaine, les holds expirés restent susceptibles de bloquer un créneau au niveau de la contrainte PostgreSQL, l’OpenAPI exporté ne décrit ni l’authentification ni les réponses réelles, et une collision de nom `PatientAddress` produit un schéma d’adresse erroné pour la confirmation.

Verdict recommandé : **NO-GO pour le MVP complet au 31 août 2026**. Il reste deux jours calendaires entre l’état observé et la cible, sans application publique, contenus FR/NL, infrastructure, décisions fournisseurs, preuves de conformité ni parcours testés. Une **Phase 1 de fondation est conditionnellement recommandée**, uniquement après approbation humaine explicite, replanification de la date et attribution séparée des corrections de l’API de rendez-vous.

## 2. Objectif et périmètre autorisé

Le périmètre autorisé était exclusivement la **Phase 0 — découverte en lecture seule et architecture** : lire le contrat et les instructions, inventorier les dépôts application/infrastructure/rendez-vous, analyser l’OpenAPI et l’implémentation, produire les schémas d’architecture, les propositions d’ADR, le registre de risques, le backlog/chemin critique et l’évaluation de faisabilité.

Seuls des documents de Phase 0 ont été créés dans `/home/hkengne/projects/next-gen-care-platform`. Aucun code applicatif, dépendance, manifeste d’exécution ou comportement n’a été créé/modifié. Le dépôt de rendez-vous et son état utilisateur préexistant ont été préservés.

## 3. Travaux réalisés

- Lecture complète du Master Engineering Contract, de `AGENTS.md`, du déclencheur Phase 0 et des instructions applicables du dépôt de rendez-vous.
- Délimitation des trois périmètres : plateforme publique, infrastructure dédiée, API de rendez-vous.
- Inspection des manifests/lockfiles, workflows CI, Dockerfiles, Compose, configurations, migrations V1–V16, tests, contrôleurs, sécurité, persistance, notifications, paiement, rétention, Kubernetes et runbooks du dépôt de rendez-vous.
- Validation syntaxique et extraction structurée de l’OpenAPI non suivi : version, empreinte, opérations, schémas, sécurité et réponses.
- Création de l’inventaire obligatoire de l’API avec les 11 catégories de la section 9.2 du contrat.
- Production des diagrammes C4, carte de contextes, séquences critiques, flux/classification de données, modèle de menaces, topologie et frontières de modules.
- Comparaison des options et création de dix ADR candidats, tous au statut `Proposed`.
- Établissement du registre de risques, du backlog MVP, du chemin critique et du verdict de faisabilité.

## 4. Fichiers créés, modifiés ou supprimés

Fichiers créés :

```text
docs/discovery/REPOSITORY_INVENTORY.md
docs/discovery/APPOINTMENT_API_INVENTORY.md
docs/discovery/PHASE-0-RISKS-AND-FEASIBILITY.md
docs/architecture/C4-CONTEXT.md
docs/architecture/C4-CONTAINER.md
docs/architecture/BOUNDED-CONTEXTS.md
docs/architecture/CRITICAL-JOURNEYS.md
docs/architecture/DATA-FLOWS.md
docs/architecture/THREAT-MODEL.md
docs/architecture/DEPLOYMENT-CONTEXT.md
docs/architecture/MODULE-BOUNDARIES.md
docs/architecture/ARCHITECTURE-OPTIONS.md
docs/architecture/adr/ADR-TEMPLATE.md
docs/architecture/adr/0001-monorepo-orchestration.md
docs/architecture/adr/0002-cms-selection.md
docs/architecture/adr/0003-appointment-api-integration.md
docs/architecture/adr/0004-lead-storage-delivery.md
docs/architecture/adr/0005-admin-identity.md
docs/architecture/adr/0006-media-storage.md
docs/architecture/adr/0007-email-delivery.md
docs/architecture/adr/0008-analytics-consent.md
docs/architecture/adr/0009-secrets-management.md
docs/architecture/adr/0010-backup-disaster-recovery.md
docs/reports/PHASE-0-REPORT.md
```

Aucun fichier applicatif/infrastructure n’a été modifié ou supprimé. Les changements préexistants `CLAUDE.md` modifié et `nurse-appointment-api.json` non suivi dans le dépôt de rendez-vous n’ont pas été altérés. Le starter pack Phase 0 préexistant n’a pas été modifié.

## 5. Décisions et ADR concernés

Dix ADR sont proposés, sans approbation automatique : orchestration monorepo, CMS, intégration rendez-vous, stockage/livraison des leads, identité administrateur, stockage média, email, analytics/consentement, secrets et sauvegarde/reprise.

Orientation recommandée pour examen humain : monorepo modulaire ; un seul déployable web initial avec façade serveur et anti-corruption layer ; extraction d’un BFF séparé uniquement sur preuve ; CMS mature après spike ; aucune analytics non essentielle au lancement ; aucun formulaire médical générique ; API de rendez-vous conservée comme système de vérité séparé.

Aucun fournisseur n’est sélectionné. Chaque ADR reste `Proposed` et demande des preuves sécurité, résidence UE, opérations, coûts, portabilité, accessibilité, localisation, compétence équipe et sortie fournisseur.

## 6. Commandes exécutées

Principales commandes non destructives exécutées et résultats factuels :

```text
pwd; rg --files; find; ls -la; wc -l; sed -n
→ lecture/inventaire des instructions, contrats, dépôts et documents.

git status --short --branch; git log -5; git diff --stat/name-status/check
→ racine plateforme : fatal « not a git repository » car .git est vide.
→ rendez-vous : main...origin/main; CLAUDE.md modifié; nurse-appointment-api.json non suivi.
→ git diff --check signale des espaces finaux préexistants dans CLAUDE.md.

jq -e . nurse-appointment-api.json
→ OPENAPI_JSON_VALID.

sha256sum nurse-appointment-api.json
→ afb40204376bf5fe520abb2065401c27db3539389731f8ef73f3d2b77e6d3a4a.

jq (métadonnées, chemins, opérations, schémas, sécurité, réponses)
→ OpenAPI 3.1.0, version v1, 42 chemins, 58 opérations, 46 schémas, aucun securityScheme.

find backend/src/test ...; find admin-frontend ...
→ 66 classes de test Java, 2 classes sous e2e, 0 fichier de test frontend, 0 Taskfile.

rg (annotations HTTP/RBAC, expirations, secrets à haute confiance, données seed, OpenTelemetry, alertes)
→ contrôleurs/RBAC inventoriés; aucune transition de hold expiré trouvée; aucun motif secret haute confiance ni seed patient trouvé; aucune dépendance OpenTelemetry ni règle d’alerte trouvée.
```

Les valeurs de configuration dont le nom évoquait mot de passe, secret, token, clé ou credential ont été masquées dans les sorties. Aucun `kubectl`, `helm`, `argocd`, déploiement, écriture de base de données, installation ou commande destructive n’a été exécuté.

## 7. Tests, contrôles et résultats factuels

Aucune suite applicative n’a été exécutée, afin de rester dans la découverte Phase 0 et de ne pas produire d’artefacts de build dans le dépôt séparé. Il est donc interdit de conclure que les tests passent actuellement.

Contrôles réellement exécutés : JSON OpenAPI syntaxiquement valide ; empreinte calculée ; inventaire croisé contrôleurs/OpenAPI ; recherche statique des transitions de hold ; inspection des contraintes PostgreSQL ; comptage des tests ; inspection CI ; recherche ciblée de secrets/données patients ; contrôle structurel final des livrables Markdown et des 16 sections du présent rapport.

Résultats du contrôle final : `REQUIRED_FILES_OK`, `REPORT_H2_COUNT 16`, `CODE_FENCES_OK`, 29 blocs Mermaid détectés, 10 ADR au statut `Proposed`, aucun hit du motif secret haute confiance dans `docs/`. Le dépôt de rendez-vous présente après contrôle le même état qu’au baseline : `CLAUDE.md` modifié et `nurse-appointment-api.json` non suivi.

La CI déclarée exécute `mvn clean verify`, lint/build Next.js, builds Docker sans push, CodeQL et Dependabot. Cela prouve la configuration, pas le résultat actuel. Aucun test OpenAPI de compatibilité, test frontend, test navigateur/accessibilité, scan d’image/IaC/secret, SBOM ou Taskfile n’a été trouvé.

## 8. Sécurité, RGPD, accessibilité et conformité

Sécurité : l’API observée possède JWT/RBAC, BCrypt, refresh tokens hachés, tokens patients hachés, contraintes de concurrence, idempotency et certaines limites Redis. Les lacunes critiques incluent l’absence de MFA, de limitation login/admin, la confiance directe dans `X-Forwarded-For`, le token patient dans l’URL, l’OpenAPI sans auth, l’absence de politiques réseau et des contrôles supply-chain incomplets.

RGPD/vie privée : le parcours soins traite des données de rendez-vous rattachables à un patient et doit être considéré à haute sensibilité/catégorie spéciale pour la conception. Le job de rétention est désactivé par défaut et n’anonymise pas les destinataires de notifications. Base légale, condition article 9, DPIA, rétention par catégorie, droits des personnes, responsables/sous-traitants et transferts UE restent à valider par des humains qualifiés. Aucune conformité juridique n’est revendiquée.

Accessibilité : aucune application publique, aucun test navigateur/a11y et aucune revue experte ne sont présents. Les documents imposent WCAG 2.2 AA renforcé, FR/NL complets, formulaires accessibles, prévention/récupération d’erreurs et validation manuelle avant lancement.

Conformité métier : aucun contenu clinique/INAMI, prix, zone, conditions de voyage, fiscalité/VAT ou mention légale n’a été inventé. Leur publication reste bloquée jusqu’à approbation qualifiée.

## 9. Écarts, risques et dette explicitement acceptée

Aucune dette ni risque n’est accepté par l’agent. Les risques P0 sont : date irréaliste, sémantique de validation humaine absente, hold expiré bloquant, OpenAPI incorrect/non suivi, fuite possible du token URL, absence DPIA/validation juridique, MFA et throttling admin absents, infrastructure/GitOps inexistante, FR/NL absent et inputs publics non fournis.

Les risques et traitements proposés sont détaillés dans `docs/discovery/PHASE-0-RISKS-AND-FEASIBILITY.md` et `docs/architecture/THREAT-MODEL.md`. Leur acceptation, financement ou report relève exclusivement de l’autorité humaine compétente.

## 10. Éléments reportés hors périmètre

- Toute implémentation Phase 1+, ajout de dépendance, création/réparation de dépôt Git, infrastructure ou déploiement.
- Toute modification de l’API de rendez-vous, y compris les correctifs critiques identifiés.
- Sélection/procurement d’un CMS, IdP, hébergeur, base, email, média, analytics, secrets ou backup.
- Paiements/voyage commerce, comptes patients/hôpitaux/infirmiers, marketplace, SSO transverse, EN/DE production et création de logo.
- Validation juridique, clinique, RGPD/DPIA, accessibilité experte, fiscale/comptable ou travel-law.
- Tests/builds applicatifs et interrogation d’un cluster, d’un registre, de la CI distante ou de la production.

## 11. État du dépôt et du déploiement

Le répertoire plateforme contient le starter pack et les nouveaux livrables Phase 0, mais son `.git` est vide : aucun statut/diff/commit de ce périmètre n’est disponible. Le dépôt d’infrastructure est vide et sans Git. Le dépôt de rendez-vous reste sur `main...origin/main` avec ses changements utilisateur préexistants ; il n’a pas été modifié.

Aucune preuve de déploiement existant n’a été établie. Les YAML Kubernetes du dépôt de rendez-vous sont des quick-starts manuels avec images `:latest`; la CI ne pousse ni ne déploie. Aucun environnement dev/staging/prod NEXT GEN CARE, Helm, Argo CD, IaC, DNS, certificat, secret réel ou cluster n’a été observé/créé.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**NO-GO** pour le MVP public complet au 31 août 2026.

Justification factuelle : deux jours calendaires restants, zéro code public observé, infrastructure dédiée vide, contrats/inputs/contenus/providers non approuvés, défauts critiques de rendez-vous et absence de toutes les preuves finales de sécurité, vie privée, accessibilité, performance, staging, opérations, restauration, rollback et acceptation humaine.

Ce verdict n’interdit pas une Phase 1 replanifiée. Il interdit de présenter la cible du 31 août comme atteignable sans affaiblir les gates obligatoires.

## 13. Suite recommandée et justification

Recommandation : **Phase 1 — fondation d’ingénierie**, après approbation explicite de la Phase 0 et rebaselining de la date. La Phase 1 doit établir un vrai dépôt Git, la structure minimale, les toolchains, Taskfile/CI, quality gates, fondation UI accessible, localisation FR/NL, configuration sécurité/observabilité et structure du dépôt infra — sans construire encore le CMS, les pages métier, l’intégration rendez-vous ou les formulaires.

En parallèle mais sous une autorisation distincte et dans le dépôt de rendez-vous, son propriétaire doit planifier les corrections contrat/hold/validation humaine. La Phase 1 portail ne doit pas contourner ces écarts.

## 14. Décisions humaines nécessaires

1. Approuver/rejeter/amender les schémas et dix ADR candidats.
2. Accepter le NO-GO du 31 août et fixer une nouvelle cible ou un nouveau périmètre explicitement sécurisé.
3. Autoriser la création/réparation des vrais dépôts plateforme et infrastructure et confirmer leurs owners.
4. Décider l’orientation monorepo/BFF initiale et les critères de sélection des fournisseurs.
5. Nommer l’owner des corrections de l’API rendez-vous et approuver une évolution de contrat avec validation humaine.
6. Fournir domaine, contacts, zone de soins, services/prix, information INAMI, sender/routing email et owners FR/NL.
7. Mandater les validations DPIA/RGPD, juridique/clinique, voyage, fiscalité/comptabilité et accessibilité.
8. Définir hébergement/cluster, budget, environnements, IdP/MFA, secrets, RPO/RTO, SLOs et autorité de production.

## 15. Prompt prêt à coller pour la phase suivante

```text
Je suis le Human Engineering Authority du projet NEXT GEN CARE.

J’ai examiné les livrables et le rapport de Phase 0. J’approuve explicitement le passage à la Phase 1 — Engineering Foundation, sous les conditions suivantes :

1. Le NO-GO du MVP complet au 31 août 2026 est accepté ; aucune mise en production n’est autorisée pendant cette phase.
2. La Phase 1 est limitée à la fondation : dépôt Git/structure approuvée, toolchains épinglées, workspace/Taskfile, parité CI locale, format/lint/type-check/tests de base, scans sécurité initiaux, fondation UI accessible, architecture de localisation FR/NL, configuration de base sécurité et observabilité, et squelette documentaire/opérationnel.
3. Ne pas intégrer de CMS/provider, ne pas implémenter les pages métier, formulaires qualifiés ou parcours de rendez-vous, ne pas créer/déployer d’infrastructure de production et ne pas modifier le dépôt nurse-appointment-scheduling-api.
4. Préserver tous les changements utilisateur existants. Avant toute création/réparation de dépôt Git ou sélection de dépendance/outillage, appliquer les décisions humaines suivantes : <INSÉRER DÉCISIONS ADR-0001 ET FRONTIÈRES DE DÉPÔTS>.
5. Les corrections de l’API de rendez-vous (validation humaine, expiration des holds, OpenAPI) restent un chantier séparé nécessitant une autorisation distincte de son propriétaire.
6. Exécuter et reporter les commandes/tests réels ; ne jamais extrapoler un succès non exécuté.
7. À la fin de Phase 1, produire le rapport français obligatoire en exactement 16 sections, proposer la phase suivante, fournir son prompt prêt à coller, puis s’arrêter au gate humain.

Commence la Phase 1 uniquement après avoir reformulé les décisions humaines injectées ci-dessus et confirmé le périmètre exact autorisé.
```

## 16. Confirmation d’arrêt au gate humain

> Phase 0 est terminée. L’agent s’arrête ici et attend l’approbation explicite du Human Engineering Authority avant de commencer la Phase 1.
