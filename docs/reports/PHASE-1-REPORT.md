# Rapport de phase 1 — Fondation d’ingénierie

Date : 29 août 2026  
Branche : `phase-1/engineering-foundation`

## 1. Résumé exécutif

La fondation d’ingénierie du portail a été créée dans le dépôt applicatif racine : espace de travail pnpm, application Next.js localisée FR/NL, primitives d’interface accessibles, garde-fous de sécurité, observabilité minimale et contrôles CI. Aucun parcours métier, contenu patient, CMS, fournisseur externe, déploiement ou changement du dépôt Appointment API n’a été ajouté.

Cette phase ne livre pas un MVP ni une mise en production. Le verdict est **CONDITIONAL GO** uniquement pour instruire et, après décisions humaines, engager la phase 2.

## 2. Objectif et périmètre autorisé

L’autorité humaine a autorisé la création du dépôt Git racine, des espaces pnpm et d’une fondation sans orchestrateur de monorepo. Les travaux ont été limités à la structure, aux outillages, à l’interface de fondation accessible, à l’architecture FR/NL, à la sécurité de base, à l’observabilité et aux pipelines de contrôle.

Sont restés hors périmètre : choix ou intégration de CMS/fournisseur, pages ou formulaires métier, prise de rendez-vous, modification de l’Appointment API, infrastructure, GitOps, déploiement, données de santé ou contenu clinique.

## 3. Travaux réalisés

- Initialisation Git sur `main`, puis travail sur `phase-1/engineering-foundation`, sans commit, fusion, tag ni déploiement.
- Création des espaces `apps/web`, `packages/config`, `packages/localization`, `packages/ui` et `packages/observability`.
- Mise en place de Next.js, TypeScript strict, ESLint, Prettier, Vitest, Playwright, Task et des scripts pnpm de contrôle.
- Ajout d’une page de fondation neutre, d’une négociation de langue FR/NL, de catalogues versionnés et d’un sélecteur de langue sans repli silencieux sous NL.
- Ajout de primitives d’accessibilité : lien d’évitement, résumé d’erreurs, jetons de design et tests automatisés de base.
- Ajout des en-têtes de sécurité, de routes de santé, de journaux structurés à attributs autorisés et de documentation opérationnelle.
- Ajout des workflows CI, CodeQL, Dependabot, SBOM CycloneDX, audit des dépendances, contrôle de secrets, SAST, budget de performance et contrôle HTTP de la build de production.

## 4. Fichiers créés, modifiés ou supprimés

Les fichiers de fondation créés ou modifiés couvrent notamment `package.json`, `pnpm-workspace.yaml`, `Taskfile.yml`, `Dockerfile`, `.github/`, `apps/web/`, `packages/`, `scripts/`, `tests/`, les configurations de qualité et les documents `docs/operations/`, `docs/compliance/` et `docs/architecture/adr/`.

Les ADR `0001-monorepo-orchestration.md` et `0011-platform-repository-boundary.md` ont été ajoutés ou mis à jour dans ce cadre. Aucune suppression n’a été effectuée.

Un formatage Prettier initial a aussi modifié mécaniquement des documents préexistants, y compris le contrat maître et des artefacts de phase 0. Ils sont désormais exclus du formatage automatique ; leur restauration exacte octet-à-octet n’a pas été effectuée durant cette phase et requiert revue/décision humaine avant toute suite.

## 5. Décisions et ADR concernés

- ADR 0001 — **Accepté** : pnpm workspaces et scripts Task, sans orchestrateur de monorepo au démarrage, conformément à la décision humaine.
- ADR 0011 — **Accepté** : frontière du dépôt applicatif racine, séparée du dépôt Appointment API et de l’infrastructure.
- ADR 0002 à 0010 — restent des propositions : aucune sélection de fournisseur, notamment CMS, n’a été faite.
- Une adaptation de compatibilité Next.js/TypeScript a été appliquée : TypeScript 5.9 est conservé et `experimental.useTypeScriptCli` est désactivé afin que la build Next utilise le compilateur TypeScript compatible dans cet environnement. Ce point reste à surveiller lors des mises à niveau.

## 6. Commandes exécutées

- `git init -b main` : succès ; la branche de travail créée ensuite est `phase-1/engineering-foundation`.
- `pnpm install --frozen-lockfile` : succès.
- `pnpm exec task setup` : succès pour Node, pnpm, Task et Git ; Docker et Trivy signalés comme optionnels et indisponibles localement.
- `pnpm exec task ci` : succès (code de sortie 0).
- `pnpm security:dependencies` : succès, audit de production sans vulnérabilité connue.
- `pnpm security:sbom` : succès, SBOM CycloneDX 1.6 validé avec 699 composants.
- `pnpm peers check` : succès.
- `pnpm exec task test:e2e`, `pnpm exec task container:build` et `pnpm exec task container:scan` : non concluants localement pour les raisons consignées à la section 7.

## 7. Tests, contrôles et résultats factuels

`pnpm exec task ci` a terminé avec le code 0. Il a exécuté le contrôle de formatage, le lint et les frontières de sources, le typage strict, 24 tests unitaires répartis sur 7 fichiers, 2 tests d’intégration, 1 test d’accessibilité de composant, le contrôle de secrets sur 110 fichiers, le SAST par lint, la build, le contrôle HTTP de production et le budget de performance.

Le contrôle HTTP de production a validé la négociation NL, le document FR, les en-têtes CSP/cadrage/référent, HSTS en mode production et les routes de santé. Le contrôle de performance a mesuré 172&nbsp;671 octets gzip JavaScript pour un budget de 204&nbsp;800, et 1&nbsp;682 octets CSS pour un budget de 51&nbsp;200.

Les quatre scénarios Playwright n’ont pas pu démarrer sur cet hôte : Chromium échoue avant navigation en raison de bibliothèques système absentes (`libnspr4.so`, `libnss3.so`, `libnssutil3.so`, `libasound.so.2`). L’installation des dépendances système demande un accès `sudo` interactif. Docker et Trivy ne sont pas installés localement ; les contrôles de build et scan de conteneur n’ont donc pas produit de résultat positif. Le workflow CI prévoit l’installation Playwright avec dépendances, mais il n’a pas été exécuté sur un runner externe dans cette phase.

## 8. Sécurité, RGPD, accessibilité et conformité

Les mesures livrées comprennent CSP, protection contre le cadrage, politique de référent, en-têtes de type MIME, HSTS en production, routes de santé sans cache, listes d’attributs de journalisation autorisés, SAST, audit de dépendances, scan de secrets et SBOM. La CSP contient encore `unsafe-inline` pour le bootstrap et les styles Next.js : c’est une dette explicitement documentée, non une conformité démontrée.

L’interface de fondation comprend navigation clavier, lien d’évitement, langue déclarée, composants testés par axe en environnement DOM et alternatives FR/NL. Les validations navigateur réelles restent bloquées par l’environnement local. Aucune affirmation de conformité RGPD, médicale, légale ou WCAG complète n’est formulée : elles exigent des décisions, contenus et validations ultérieurs.

## 9. Écarts, risques et dette explicitement acceptée

- Validation E2E navigateur indisponible sur cet hôte faute de bibliothèques système ; elle doit être répétée sur runner compatible.
- Validation de l’image et du scan de conteneur indisponible localement faute de Docker et Trivy.
- La CSP utilise temporairement `unsafe-inline` ; un durcissement compatible Next.js devra être conçu et testé.
- L’adaptation `experimental.useTypeScriptCli: false` est nécessaire à la build actuelle et constitue un point de compatibilité à réévaluer.
- Le formatage mécanique de documents préexistants, y compris le contrat maître, doit être revu et potentiellement restauré exactement avant une phase suivante. Aucune modification sémantique n’est revendiquée.

## 10. Éléments reportés hors périmètre

Le CMS et son fournisseur, les contenus approuvés, les pages publiques et formulaires métier, le consentement, l’Appointment API et sa résolution des écarts de contrat, l’infrastructure, le déploiement, les domaines, l’analytics, les données personnelles et les intégrations externes sont reportés.

## 11. État du dépôt et du déploiement

Le dépôt est sur `phase-1/engineering-foundation`. Les fichiers de fondation sont non suivis, car aucun commit n’a été créé durant cette exécution. Aucun déploiement, environnement distant, image publiée, ressource cloud ou modification d’infrastructure n’a été effectué.

Le dépôt Appointment API n’a pas été modifié. L’infrastructure reste séparée et non initialisée, conformément aux constats de phase 0.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**CONDITIONAL GO** pour passer, après approbation humaine explicite, à une phase 2 limitée et correctement décidée. Ce verdict n’autorise ni production, ni publication, ni intégration à l’Appointment API, ni choix autonome de fournisseur.

## 13. Suite recommandée et justification

La suite recommandée est une phase 2 de portail public, précédée de la résolution des décisions humaines et des écarts de phase 0 : CMS explicitement sélectionné par ADR, contenu et domaine approuvés, et stratégie de correction des lacunes Appointment API. Cette séquence évite d’implémenter un parcours public ou de rendez-vous sur des contrats, responsabilités ou fournisseurs non approuvés.

## 14. Décisions humaines nécessaires

- Approuver ou refuser ce rapport de phase 1 et le passage à la phase 2.
- Décider de la restauration exacte ou de l’acceptation documentée du formatage mécanique des documents préexistants, notamment le contrat maître.
- Sélectionner le CMS, uniquement après examen et approbation de l’ADR et de sa matrice de décision.
- Approuver les domaines, contenus publics, coordonnées et allégations autorisées avant toute page métier.
- Décider de l’environnement autorisé pour rejouer Playwright avec dépendances système, ainsi que les validations Docker/Trivy.
- Décider du traitement des écarts de l’Appointment API identifiés en phase 0 avant toute intégration.

## 15. Prompt prêt à coller pour la phase suivante

```text
J’approuve explicitement le rapport de phase 1 et autorise la phase 2 du portail public NEXT GEN CARE.

Périmètre autorisé : concevoir et implémenter les pages publiques après validation du CMS par ADR et décision humaine explicite ; conserver la frontière avec le dépôt Appointment API et le dépôt d’infrastructure ; ne pas déployer ni intégrer la prise de rendez-vous tant que les écarts de contrat de phase 0 ne sont pas résolus.

Contraintes : ne choisir aucun fournisseur sans validation humaine, ne publier aucune allégation clinique/légale non approuvée, préserver les changements existants, restaurer ou documenter explicitement les documents préexistants formatés mécaniquement, et rejouer les contrôles navigateur/conteneur dans un environnement approuvé.

Commence par relire le contrat maître et les ADR, puis fournis le rapport de phase obligatoire avec ses 16 sections et arrête-toi au prochain gate humain.
```

## 16. Confirmation d’arrêt au gate humain

La phase 1 s’arrête ici. Aucune phase 2, intégration, déploiement ou sélection de fournisseur ne sera engagée sans approbation explicite de l’Human Engineering Authority.
