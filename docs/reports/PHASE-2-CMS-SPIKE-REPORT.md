# Rapport de phase 2 — CMS Payload et portail public

Date : 30 août 2026  
Branche : `phase-2/cms-spike`

## 1. Résumé exécutif

Payload est intégré comme CMS MVP après l’accord humain enregistré dans ADR-0002. Le portail public comprend maintenant une landing page, cinq présentations de domaine, une page légale de retenue, des catalogues FR/NL, un changement de langue qui conserve la route, un rendu de page CMS, métadonnées, sitemap et robots fail-closed. La validation locale utilise PostgreSQL 17 et aucun contenu réel, patient ou secret n’est ajouté au dépôt.

La Phase 2 n’autorise pas une mise en production : le domaine, les mentions légales définitives, les faits métier, les fournisseurs d’identité/MFA, médias, e-mail, secrets et sauvegarde ne sont pas encore décidés ni validés.

## 2. Objectif et périmètre autorisé

L’autorité humaine a autorisé le périmètre des pages publiques Phase 2, les contenus FR/NL, l’identité administrateur/MFA, les médias, l’e-mail, les secrets, la sauvegarde et les validations de production. Cet accord autorise l’implémentation et la validation locale des composants du portail ; il ne sélectionne pas un fournisseur distinct, ne fournit pas de domaine, de données d’éditeur, de prix, de zone, de disponibilité ou de contenu médical/légal définitif.

Le périmètre réalisé couvre CMS, gouvernance éditoriale, portail public, SEO protégé, médias de développement et validations locales. Les formulaires, paiements, intégration Appointment API et déploiement restent exclus.

## 3. Travaux réalisés

- Payload 3.88.0 est configuré avec PostgreSQL, FR/NL, brouillons, versions, aperçu protégé, planification et rôles CMS.
- Le modèle `pages` ajoute type de page, texte localisé, SEO localisé, image sociale, no-index par défaut, traçabilité du dernier éditeur et revue explicite. Une publication exige un document déjà brouillon, un approbateur, la confirmation du propriétaire de contenu et un autre utilisateur que le dernier éditeur.
- Le modèle média restreint les formats à JPEG, PNG, WebP, AVIF et PDF ; texte alternatif localisé obligatoire et note de droits disponible soutiennent le workflow. Le stockage local reste limité au développement.
- Les pages FR/NL couvrent la landing page et les cinq domaines confirmés. Elles ne publient ni tarifs, ni coordonnées, ni promesse de prise en charge, ni disponibilité. La page légale expose explicitement l’attente des informations validées.
- Le changement de langue conserve le chemin courant. Une traduction CMS inexistante retourne une absence de page au lieu d’un repli silencieux.
- Canonical, `hreflang`, Open Graph, sitemap et indexation dépendent d’un domaine HTTPS approuvé et de `PUBLIC_SEO_ENABLED=true`. Sans ces deux valeurs, `robots.txt` interdit l’indexation et le sitemap ne contient aucune URL.
- PostgreSQL local a été réutilisé sans effacement. Le serveur Next/Payload temporaire a été arrêté après les tests HTTP.

## 4. Fichiers créés, modifiés ou supprimés

- Créés : `apps/web/src/app/sitemap.ts`, `apps/web/src/app/[locale]/legal/page.tsx`, `apps/web/src/components/locale-switcher.tsx`, `apps/web/src/config/public-site.ts`, `apps/web/tests/metadata-routes.test.ts`.
- Modifiés : layout et landing page locale, styles globaux, proxy, robots, modèles Payload `pages`/`media`, test CMS, catalogues FR/NL et `.env.example`.
- Conservés et complétés : configuration Payload, routes CMS, collections, test CMS, Compose PostgreSQL et ADR-0002 issus du spike approuvé.
- Aucun fichier applicatif ou base locale n’a été supprimé. Aucun commit, push, fusion, tag, image ou déploiement n’a été effectué.

## 5. Décisions et ADR concernés

- ADR-0002 est **Accepted — human approval recorded** : Payload est retenu pour les contenus publics et métadonnées média du MVP, jamais pour les données de formulaire, de rendez-vous ou de santé.
- ADR-0005 identité/MFA, ADR-0006 médias, ADR-0007 e-mail, ADR-0009 secrets et ADR-0010 sauvegarde/reprise restent **Proposed**. L’autorisation de périmètre ne les transforme pas en sélection de fournisseur ni en acceptation de production.
- Le no-index par défaut est une décision de sûreté : aucun domaine ni publication SEO ne peut être inféré.

## 6. Commandes exécutées

- `pnpm exec prettier --check …`, `pnpm --filter @next-gen-care/web typecheck` et tests Vitest ciblés : succès.
- `pnpm run ci` : succès, code de sortie 0 après les modifications Phase 2.
- `pnpm --filter @next-gen-care/web build` : succès, code de sortie 0, après résolution d’un verrou `.next/lock` orphelin confirmé sans processus build actif.
- Démarrage temporaire de `pnpm --filter @next-gen-care/web dev` contre PostgreSQL local, puis arrêt.
- Requêtes HTTP locales sur `/fr`, `/nl/health-tech`, `/fr/legal`, `/robots.txt` et `/sitemap.xml` : succès.
- `git diff --check` : succès.

## 7. Tests, contrôles et résultats factuels

- `pnpm run ci` a réussi : formatage, lint, frontières de packages, typage, 30 tests unitaires, 2 tests d’intégration, 1 test a11y, scan de secrets sur 140 fichiers, SAST, build, baseline HTTP et budget de performance. Le contrôle Appointment API affiche `NOT_APPLICABLE_PHASE_1` : ce n’est pas un test d’intégration Appointment API.
- Le build a généré statiquement les routes FR/NL de landing, cinq domaines, page légale, `robots.txt` et `sitemap.xml`; la route CMS reste dynamique par conception.
- Les contrôles HTTP locaux ont retourné 200 pour les trois pages publiques, robots et sitemap. Le sitemap sans domaine approuvé ne contient aucune balise `<loc>` ; `robots.txt` contient `Disallow: /`. Les en-têtes `X-Frame-Options: DENY` et `X-Content-Type-Options: nosniff` sont présents.
- Les tests ajoutés vérifient le no-index/sitemap fail-closed et les tests CMS vérifient les nouveaux champs éditoriaux et la restriction de formats médias.
- Les E2E navigateur précédemment tentés restent en échec sur cet hôte avant navigation, Chromium ne démarrant pas faute de `libnspr4.so`. Aucun parcours navigateur représentatif de production n’est donc déclaré réussi.

## 8. Sécurité, RGPD, accessibilité et conformité

Les routes publiques sont sans formulaire ni donnée de santé. Le CMS conserve la frontière « contenu public et métadonnées média » ; il n’implémente aucune collecte de santé. Le preview est protégé par un secret hors dépôt et la configuration d’exemple ne contient que des valeurs fictives.

Les en-têtes restrictifs restent actifs, les uploads sont limités à des types explicites, et l’indexation est bloquée par défaut. Les tests automatisés a11y passent, mais aucun audit expert, test lecteur d’écran, revue cognitive FR/NL, DPIA, validation RGPD, clinique, juridique ou sécurité de production n’est revendiqué.

MFA, gestion de cycle de vie, scan antimalware, limite d’upload au proxy, stockage objet, chiffrement au repos, e-mail, coffre de secrets, sauvegarde hors domaine de panne, RPO/RTO et restauration de production ne sont pas implémentés ni validés.

## 9. Écarts, risques et dette explicitement acceptée

- Les contenus publics sont des textes structurants prudents ; ils exigent une revue humaine avant une publication commerciale, médicale, sécurité, voyage ou légale.
- Les routes principales sont actuellement des présentations de catalogue versionnées dans le dépôt ; la route `/[locale]/content/[slug]` rend les pages éditoriales Payload. Le raccordement de chaque page principale à un document CMS final dépend des contenus approuvés.
- L’indépendance auteur/relecteur/éditeur est renforcée par la logique de publication, mais MFA et audit immuable dépendent d’une décision d’identité et d’opérations.
- Le stockage de média Payload est le filesystem local de développement ; il ne convient pas à la production.
- Le serveur d’exécution local a utilisé PostgreSQL sans TLS et des identifiants de développement non suivis : uniquement pour validation locale.

## 10. Éléments reportés hors périmètre

Sont reportés : formulaires qualifiés, paiement, Appointment API, consentement, analytics, identité/MFA choisie, SSO, fournisseur de médias/CDN, e-mail transactionnel, gestion centralisée de secrets, stratégie de sauvegarde/reprise de production, Kubernetes/GitOps, domaine/DNS/TLS, mentions légales et confidentialité finales, données d’éditeur, prix, zones, disponibilités, services détaillés et contenus validés.

## 11. État du dépôt et du déploiement

La branche est `phase-2/cms-spike` et le dépôt contient des changements Phase 2 non commités, y compris des changements préexistants du spike Payload. `git diff --check` est propre. PostgreSQL de développement persiste dans son volume local ; le serveur Next temporaire est arrêté. Aucun environnement distant, déploiement, infrastructure, Appointment API ou donnée réelle n’a été modifié.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**CONDITIONAL GO** pour revue humaine du livrable Phase 2 et préparation de la phase suivante. **NO-GO** pour toute publication ou production : les conditions de contenu, domaine, juridique/RGPD, navigateur, identité/MFA, médias, e-mail, secrets, sauvegarde et infrastructure ne sont pas acceptées.

## 13. Suite recommandée et justification

Accepter formellement ce gate Phase 2, fournir les faits et responsables de contenu nécessaires, puis autoriser Phase 3 séparément avec le contrat OpenAPI versionné de l’Appointment API. En parallèle, ouvrir les ADR de production restants avec les opérateurs compétents. Cette séquence évite d’inventer des faits publics ou de transformer les contrôles de code en conformité de production.

## 14. Décisions humaines nécessaires

- Valider ou corriger les contenus FR/NL de chaque domaine, y compris avertissement de non-urgence, et nommer leurs propriétaires/relecteurs.
- Fournir le domaine HTTPS final, l’entité éditrice, les contacts, la politique de confidentialité/cookies, les conditions applicables et l’autorisation explicite d’indexation.
- Sélectionner ou réutiliser un IdP avec MFA, un stockage média, un e-mail, une gestion de secrets et une stratégie de sauvegarde/reprise, en acceptant les ADR correspondants.
- Autoriser un environnement navigateur avec les dépendances Chromium et les revues manuelles d’accessibilité/sécurité requises.
- Fournir et accepter le contrat OpenAPI exact avant toute Phase 3.

## 15. Prompt prêt à coller pour la phase suivante

```text
J’accepte le rapport de gate Phase 2 et autorise uniquement la Phase 3 — intégration Appointment API.

Voici le dépôt et le document OpenAPI versionné acceptés : [chemins ou références]. Implémentez l’adaptateur anti-corruption et les parcours de demande de soins à domicile, sans modifier l’API existante, sans créer de formulaire CMS pour des données de santé, sans déployer et sans choisir de fournisseur d’identité, média, e-mail, secrets ou sauvegarde. Exécutez les tests contractuels, d’intégration, d’échec et de confidentialité disponibles, produisez le rapport français obligatoire à 16 sections, puis arrêtez-vous pour mon approbation explicite.
```

## 16. Confirmation d’arrêt au gate humain

La Phase 2 s’arrête au présent gate. Aucun passage en Phase 3, mise en production, activation SEO, suppression de données locales, choix de fournisseur, push, fusion, tag ou déploiement ne sera effectué sans approbation explicite de l’Human Engineering Authority.
