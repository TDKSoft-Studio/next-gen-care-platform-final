# Rapport de revue ADR-0002 — Comparaison CMS

Date : 30 août 2026  
Branche : `phase-2/cms-spike`

## 1. Résumé exécutif

La revue compare Payload auto-hébergé, Storyblok en espace UE et Contentful avec résidence UE. Aucun CMS n’est sélectionné. Payload est le seul candidat avec une preuve runtime NEXT GEN CARE ; les deux candidats managés ont été documentés uniquement par leurs sources officielles. La décision reste soumise aux validations humaines de contrat, DPA, résidence, sécurité, coût, exploitation et accessibilité.

## 2. Objectif et périmètre autorisé

L’autorité humaine a autorisé la suite limitée à une décision ADR-0002 documentée, sans sélection de fournisseur, développement de portail complet, déploiement, modification de l’Appointment API ou création de tenant distant.

## 3. Travaux réalisés

- Relecture du contrat maître, de l’ADR-0002, de la matrice d’architecture et du rapport de validation Payload.
- Recherche de sources officielles de capacités, résidence, gouvernance, export/reprise et limites pour les trois candidats.
- Extension de l’ADR-0002 avec matrice de preuve, sources, limites et gate de décision humaine.

## 4. Fichiers créés, modifiés ou supprimés

- Modifié : `docs/architecture/adr/0002-cms-selection.md`.
- Créé : `docs/reports/PHASE-2-CMS-ADR-REVIEW-REPORT.md`.
- Aucune suppression, dépendance, ressource distante, tenant, commit, push, fusion ou déploiement.

## 5. Décisions et ADR concernés

ADR-0002 reste **Proposed**. La recommandation est de ne sélectionner aucun candidat sur la seule base de la documentation ou du spike local. L’ADR recense explicitement les preuves nécessaires avant acceptation.

## 6. Commandes exécutées

- Lecture complète de `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`.
- Inspection de l’ADR-0002, de `ARCHITECTURE-OPTIONS.md`, du rapport de spike et de l’état Git.
- Recherches web ciblées, sur les sites officiels Payload, Storyblok et Contentful.
- `pnpm exec prettier --check docs/architecture/adr/0002-cms-selection.md docs/reports/PHASE-2-CMS-ADR-REVIEW-REPORT.md`.

## 7. Tests, contrôles et résultats factuels

Le formatage Prettier des deux artefacts est contrôlé localement. La revue ne modifie pas de code d’exécution ; aucun test applicatif supplémentaire n’est revendiqué. Les preuves runtime Payload antérieures restent consignées dans le rapport de spike ; les capacités Storyblok et Contentful sont seulement documentées, non exercées dans un tenant NEXT GEN CARE.

## 8. Sécurité, RGPD, accessibilité et conformité

La revue confirme que le CMS ne peut recevoir ni formulaires médicaux ni données de santé. La DPA Storyblok consultée interdit les catégories particulières de données ; cette contrainte est compatible avec le périmètre CMS contenu-only, sans constituer une acceptation juridique. La documentation Contentful indique que sa résidence UE ne garantit pas un traitement ou accès exclusivement UE. L’accessibilité de l’administration reste à tester avec des éditeurs représentatifs pour tous les candidats.

## 9. Écarts, risques et dette explicitement acceptée

- Aucun DPA signé, examen de sous-traitants, devis, SLA, plan de support ou preuve MFA/SSO n’est disponible.
- Aucun test tenant managé n’a démontré les workflows, export/reprise, webhooks, médias ou audit.
- Les limites documentées d’export/reprise Storyblok et Contentful doivent être vérifiées contre les besoins de sortie et d’archivage.
- Payload conserve les écarts opérationnels du spike : infrastructure, TLS, sauvegarde, médias, MFA, jobs et E2E navigateur non acceptés.

## 10. Éléments reportés hors périmètre

Sélection et acquisition de CMS, tenant distant, intégration CMS complète, contenu métier, médias, identité, e-mail, formulaires, analytics, rendez-vous, infrastructure, déploiement et production restent hors périmètre.

## 11. État du dépôt et du déploiement

Le dépôt reste sur `phase-2/cms-spike` avec les changements non commités du spike et des documents. PostgreSQL local de développement est hors de cette revue documentaire ; aucun environnement distant n’a été modifié. Aucun déploiement n’existe.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**CONDITIONAL GO** uniquement pour demander une décision humaine de périmètre de POC managé, ou pour accepter une architecture auto-hébergée assortie de ses décisions dépendantes. **BLOCKED** pour sélectionner, contractualiser ou déployer un CMS.

## 13. Suite recommandée et justification

Choisir d’abord le modèle d’exploitation : auto-hébergé Payload avec responsabilité plateforme assumée, ou POC managé synthétique et time-boxé. La seconde option doit vérifier le plan, le DPA, l’espace UE, le workflow complet, l’export/restauration, les webhooks, l’accessibilité admin et l’identité. Cette séquence produit les preuves qui manquent à l’ADR sans exposer de données réelles.

## 14. Décisions humaines nécessaires

- Choisir le modèle à évaluer : POC managé synthétique ou architecture Payload auto-hébergée.
- Autoriser, le cas échéant, un tenant d’essai et préciser le candidat, le plan, le budget et le chemin DPA/privacy.
- Nommer les propriétaires contenu, sécurité, privacy et exploitation qui valideront le workflow, l’accessibilité et la sortie de données.
- Décider si les limites de résidence et d’export documentées sont compatibles avec la politique NEXT GEN CARE.

## 15. Prompt prêt à coller pour la phase suivante

```text
J’approuve le rapport de revue ADR-0002 et autorise uniquement un POC CMS managé, non productif et limité à du contenu synthétique, pour le candidat suivant : <NOM DU CANDIDAT>.

Avant toute donnée réelle, vérifiez et documentez le plan, la région UE, le DPA, les sous-traitants, l’authentification/MFA, les rôles auteur-relecteur-publisher, les slugs FR/NL sans fallback, l’aperçu, le rollback, les webhooks, l’export/restauration, les médias accessibles, l’audit et l’accessibilité de l’administration. Ne sélectionnez pas le fournisseur, ne déployez rien et arrêtez-vous avec le rapport français à 16 sections pour mon approbation explicite.
```

## 16. Confirmation d’arrêt au gate humain

La revue ADR s’arrête ici. Aucun fournisseur n’est retenu et aucune nouvelle phase ne commencera sans décision humaine explicite sur le modèle et, le cas échéant, le candidat de POC.
