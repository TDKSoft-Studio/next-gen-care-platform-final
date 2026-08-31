# Audit — Migration Codex → Claude Code et état du dépôt

Date : 31 août 2026
Branche : `claude/audit-codex-claude-migration-vhehdd`
Périmètre : audit en lecture seule de l'état réel du dépôt, conversion des
prompts destinés à Codex en prompts Claude Code, aucune modification
applicative.

## 1. Résumé exécutif

Le dépôt implémente un processus d'ingénierie par phases mature (Phase 0 à
Phase 5) piloté par un contrat maître neutre vis-à-vis de l'agent
(`NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`), avec des rapports français à
16 sections pour chaque phase. Jusqu'à cette session, l'adaptateur d'agent
présent à la racine était exclusivement `AGENTS.md`, écrit et nommé pour
Codex ; **aucun `CLAUDE.md` n'existait à la racine**, alors que le contrat
maître prévoit explicitement que Claude Code dispose de son propre adaptateur
fin. Quatre artefacts documentaires (`AGENTS.md`, `CODEX_PHASE_0_PROMPT.md`,
`README-CODEX-PHASE0.md`,
`docs/prompts/NEXT-GEN-CARES-CODEX-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`)
étaient rédigés spécifiquement pour Codex.

Constat le plus significatif de cet audit : la dernière phase de travail
observée sur `main` — la refonte visuelle de la landing page (commits
`22f6451`, `9978e0b`, `c922dfa`) — a été **implémentée directement sur
`main` sans respecter le gate de phase** que son propre prompt Codex impose
(audit préalable obligatoire section 21, arrêt humain section 22, rapport
final obligatoire section 24). Aucun rapport de phase n'existe pour ce
travail dans `docs/reports/`, contrairement à toutes les phases précédentes.

Cette session a : (1) créé `CLAUDE.md` comme adaptateur Claude Code
équivalent à `AGENTS.md` ; (2) converti les quatre prompts Codex identifiés
en équivalents Claude Code ; (3) produit ce rapport d'audit. Aucun fichier
applicatif n'a été modifié.

## 2. Objectif et périmètre autorisé

Objectif demandé par l'utilisateur : auditer complètement l'état actuel du
dépôt, transformer tous les prompts destinés à Codex en prompts pour Claude
Code, puis proposer la suite logique.

Périmètre que je me suis fixé, par cohérence avec la discipline du contrat
maître même si aucune phase numérotée n'a été explicitement invoquée :
lecture seule sur le code applicatif, création/modification de documents
d'ingénierie et de prompts uniquement, aucune sélection de fournisseur,
aucun déploiement, aucune donnée patient réelle.

## 3. Travaux réalisés

- Inspection de l'historique Git complet (`0305ecb` → `7854628`), des
  branches locales/distantes et de l'état de l'arbre de travail.
- Recensement de toutes les occurrences de « Codex » dans le dépôt
  (`.md`, `.yml`, `.ts`, `.json`, etc.).
- Lecture intégrale de `AGENTS.md`, `README-CODEX-PHASE0.md`,
  `CODEX_PHASE_0_PROMPT.md`,
  `docs/prompts/NEXT-GEN-CARES-CODEX-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`,
  `docs/prompts/APPOINTMENT_API_REMEDIATION_PROMPT.md`,
  `apps/web/CLAUDE.md`, `apps/web/AGENTS.md`, `README.md`,
  `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md` (sections 1 à 4, 17 et 17.1).
- Lecture des 6 rapports de phase existants (`PHASE-0` à `PHASE-5`) et de
  leurs diffs Git d'introduction, pour établir la chronologie réelle des
  phases et vérifier la présence/absence de rapport pour chaque changement
  fonctionnel majeur.
- Vérification de la présence des 11 ADR (`docs/architecture/adr/0001` à
  `0011`), des lignes de base sécurité/accessibilité
  (`docs/compliance/`), et des tâches disponibles dans `Taskfile.yml`.
- Création de `CLAUDE.md` (racine), `CLAUDE_PHASE_0_PROMPT.md` (racine),
  `README-CLAUDE-PHASE0.md` (racine), et
  `docs/prompts/NEXT-GEN-CARES-CLAUDE-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`.
- Aucune commande de test ou de build n'a été exécutée pendant cet audit ;
  ce rapport ne réclame donc aucun résultat de `pnpm exec task ci`.

## 4. Fichiers créés, modifiés ou supprimés

Créés :

- `CLAUDE.md`
- `CLAUDE_PHASE_0_PROMPT.md`
- `README-CLAUDE-PHASE0.md`
- `docs/prompts/NEXT-GEN-CARES-CLAUDE-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`
- `docs/reports/AUDIT-CODEX-CLAUDE-MIGRATION-2026-08-31.md` (ce document)

Modifiés : aucun fichier existant n'a été modifié. Les fichiers Codex
d'origine (`AGENTS.md`, `CODEX_PHASE_0_PROMPT.md`, `README-CODEX-PHASE0.md`,
`docs/prompts/NEXT-GEN-CARES-CODEX-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`)
ont été **conservés intacts**, par choix de sécurité (non-destructif) : ils
restent l'adaptateur pour Codex et l'historique de ce qui a été réellement
demandé lors de la refonte landing, la conversion se fait par ajout de leurs
équivalents plutôt que par remplacement. `docs/prompts/
APPOINTMENT_API_REMEDIATION_PROMPT.md` n'a pas été modifié : il référence
déjà `CLAUDE.md` et cible le dépôt séparé de l'API de rendez-vous, pas ce
dépôt.

Aucun fichier supprimé.

## 5. Décisions et ADR concernés

Aucune nouvelle décision d'architecture, de fournisseur ou de persistance
n'a été prise. Aucun ADR existant n'a été modifié. Cet audit ne modifie ni
n'invalide aucune des 11 ADR proposées (`0001`–`0011`), toutes restées au
statut `Proposed` d'après leur en-tête.

## 6. Commandes exécutées

```text
git log --oneline -20
git branch -a
git status
find . -iname "*codex*" ...
grep -ril "codex" --include="*.md" .
grep -rli "codex" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.ts" --include="*.tsx" --include="*.mjs" .
grep -n -i "codex" NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md
git show --stat <commit> pour 22f6451, 9978e0b, c922dfa, 3c36e2b, f723022, 0305ecb
git show 22f6451 -- NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md
git show 9978e0b -- NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md
git log --all --oneline --diff-filter=A -- docs/reports
grep -rli "landing" docs/reports/
ls .github/workflows/
grep -n "^  [a-z]" Taskfile.yml
ls docs/architecture/adr docs/compliance
```

Tous les résultats ont été utilisés tels quels dans ce rapport ; aucune
commande n'a modifié l'état du dépôt (toutes les commandes ci-dessus sont en
lecture seule).

## 7. Tests, contrôles et résultats factuels

Aucune suite de test n'a été exécutée pendant cet audit. Les résultats de
tests cités dans ce rapport sont ceux déjà consignés dans
`docs/reports/PHASE-5-RELEASE-READINESS-REPORT.md` (dernier rapport de phase
disponible), datés du 31 août 2026 avant les commits de refonte landing :
`pnpm exec task ci` en exit code `0`, `Test Files 11 passed (11)`,
`Tests 33 passed (33)`, build Next.js réussi. **Ces résultats sont
antérieurs aux commits `22f6451`/`9978e0b`/`c922dfa` et ne couvrent donc pas
la refonte landing** : aucune preuve de `pnpm exec task ci` postérieure à la
refonte n'existe dans le dépôt.

## 8. Sécurité, RGPD, accessibilité et conformité

Sans changement par rapport à l'état déjà documenté en Phase 5 : le parcours
rendez-vous reste `PAY_ON_SITE` en revue humaine, sans confirmation
automatique. Cet audit ne modifie aucun comportement.

Point de conformité process notable : le prompt Codex de refonte landing
(section 12) exige explicitement une vérification WCAG 2.2 AA et une
stratégie d'accessibilité documentée avant de considérer le travail terminé
(section 27, « Definition of Done »). Aucune preuve d'exécution de cette
vérification n'existe dans le dépôt pour la refonte déjà mergée sur `main`.
Aucune donnée patient réelle ni secret n'a été observé pendant cet audit.

## 9. Écarts, risques et dette explicitement acceptée

- **Écart de gate de phase (le plus important)** : la refonte visuelle de la
  landing page a été implémentée et mergée sur `main` sans rapport de phase
  français, sans audit préalable section 21 documenté, et sans point d'arrêt
  humain entre audit et implémentation — alors que son propre prompt
  déclencheur l'exige explicitement (sections 21, 22, 24, 25). C'est une
  dérogation à la discipline que le contrat maître impose à toutes les
  phases précédentes.
- **Absence de `CLAUDE.md` racine avant cette session**, alors que le
  contrat maître (préambule, ligne « Agent-specific files ») prévoit
  explicitement son existence à parité avec `AGENTS.md`. Risque : toute
  session Claude Code antérieure travaillait sans adaptateur dédié, avec un
  risque de dérive de comportement par rapport aux instructions
  spécifiques à l'outil (conventions d'outils, discipline de preuve).
- **Numérotation de phase non strictement continue** : il existe
  `PHASE-2-CMS-SPIKE-REPORT.md`, `PHASE-2-CMS-ADR-REVIEW-REPORT.md`,
  `PHASE-3-REPORT.md`, puis `PHASE-5-RELEASE-READINESS-REPORT.md` — aucune
  `PHASE-4`. Risque mineur de traçabilité si un lecteur suppose une
  correspondance 1:1 entre numéro et fonctionnalité livrée.
- **Preuves de tests non rejouées après la refonte landing** : le dernier
  `pnpm exec task ci` documenté (Phase 5) précède les trois commits de
  refonte. Aucune preuve que lint/typecheck/tests unitaires/a11y/build
  restent verts après ces commits.
- **Approvisionnement photographique landing v2** : `docs/brand/
  LANDING_V2_IMAGE_SOURCES.md` existe mais n'a pas été audité en détail dans
  cette session ; le prompt de refonte impose une licence et une source
  enregistrées par image avant utilisation en production — à vérifier
  explicitement lors de la clôture de cette phase.
- **Décision NO-GO de production toujours active** : le dernier verdict
  documenté (Phase 5) est `NO-GO production`, avec des preuves obligatoires
  encore manquantes (contrat OpenAPI non piné, E2E rendez-vous incomplet,
  staging absent, RGPD/DPIA absent, accessibilité experte absente). Rien
  observé dans cette session ne change ce verdict.

Aucun de ces risques n'est traité comme accepté implicitement par cette
session ; ils sont listés pour décision humaine explicite (section 14).

## 10. Éléments reportés hors périmètre

Sont hors périmètre de cette session : toute modification de code
applicatif, toute exécution de `pnpm exec task ci`/`ci:extended`, toute
décision de fusion des adaptateurs Codex/Claude Code, toute décision sur le
sort des fichiers Codex d'origine (conservés, non supprimés), toute
production du rapport de phase manquant pour la refonte landing (proposée
comme prochaine étape, non exécutée ici), tout choix de fournisseur, tout
déploiement.

## 11. État du dépôt et du déploiement

Travail effectué sur la branche `claude/audit-codex-claude-migration-vhehdd`,
créée à partir de `main` (`7854628`). Avant cette session, `git status`
rapportait un arbre de travail propre. Aucun commit, push, merge, tag,
release ou modification d'environnement distant n'a été effectué par cette
session avant rédaction de ce rapport. Aucun déploiement n'a eu lieu.

## 12. Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED

**CONDITIONAL GO** pour la suite décrite en section 13, sous réserve des
décisions humaines de la section 14.

Ce verdict porte uniquement sur la migration documentaire Codex → Claude
Code, qui est complète et non régressive. Il ne change rien au verdict
**NO-GO production** déjà en vigueur depuis la Phase 5, qui reste la
référence pour toute question de mise en production.

## 13. Suite recommandée et justification

Recommandation, par ordre de priorité :

1. **Clore proprement la phase de refonte landing** en exécutant le prompt
   converti `docs/prompts/NEXT-GEN-CARES-CLAUDE-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`
   tel qu'il est maintenant rédigé : audit rétroactif contre le code tel
   qu'il existe sur `main`, exécution effective de `pnpm exec task ci` (et
   `ci:extended` si le réseau est disponible) sur l'état actuel, vérification
   WCAG 2.2 AA/responsive/FR-NL, puis rapport français à 16 sections
   documentant ce qui a réellement été livré. C'est la priorité la plus
   directe parce que c'est la seule phase du dépôt sans preuve de gate.
2. **Reprendre la feuille de route Phase 5** : ajouter la couverture E2E
   déterministe du parcours rendez-vous, référencer/verser l'artefact
   OpenAPI accepté, remplacer le gate `test:contract` par une vérification
   réelle — c'est la suite déjà explicitement recommandée et approuvée dans
   le prompt prêt à coller de `PHASE-5-RELEASE-READINESS-REPORT.md`
   section 15, toujours non exécutée.
3. **Décider du sort des adaptateurs Codex** : les fichiers Codex d'origine
   ont été conservés par prudence ; une décision humaine explicite doit
   confirmer s'ils doivent rester (multi-agent), être marqués
   dépréciés, ou être supprimés maintenant que `CLAUDE.md` existe.

La justification : contrairement à un audit qui découvrirait un blocage
technique, l'essentiel de la dette ici est **procédurale** (gate de phase
non respecté, adaptateur manquant) plutôt que fonctionnelle. La fermer avant
de reprendre le backlog Phase 5 évite d'empiler une nouvelle phase
d'implémentation sur une phase déjà non auditée.

## 14. Décisions humaines nécessaires

- Approuver ou non l'exécution du prompt de clôture de la refonte landing
  (`docs/prompts/NEXT-GEN-CARES-CLAUDE-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`).
- Décider si les fichiers Codex d'origine (`AGENTS.md`,
  `CODEX_PHASE_0_PROMPT.md`, `README-CODEX-PHASE0.md`,
  `docs/prompts/NEXT-GEN-CARES-CODEX-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md`)
  doivent être conservés comme adaptateur multi-agent, marqués dépréciés, ou
  supprimés.
- Confirmer la priorité entre « clôturer la phase landing » et « reprendre
  la Phase 5 (durcissement pré-staging) » si les deux ne peuvent pas être
  menées en parallèle.
- Toute décision fournisseur, RGPD/DPIA, clinique/juridique, staging ou
  production reste soumise à l'Human Engineering Authority, sans changement
  par rapport aux rapports précédents.

## 15. Prompt prêt à coller pour la phase suivante

```text
J'approuve cet audit de migration Codex → Claude Code et autorise la clôture
de la phase de refonte visuelle de la landing page sur une branche dédiée.

Objectif :
- utiliser CLAUDE.md et
  docs/prompts/NEXT-GEN-CARES-CLAUDE-LANDING-PAGE-VISUAL-REDESIGN-PROMPT.md
  comme instructions ;
- auditer l'implémentation déjà mergée sur main (commits 22f6451, 9978e0b,
  c922dfa) contre les sections 21 et 27 du prompt ;
- exécuter réellement pnpm exec task ci (et ci:extended si le réseau est
  disponible) sur l'état actuel et consigner les résultats ;
- vérifier WCAG 2.2 AA, responsive mobile/tablette/desktop, et FR/NL ;
- vérifier les sources et licences des images dans
  docs/brand/LANDING_V2_IMAGE_SOURCES.md ;
- ne pas modifier le code sauf pour corriger un écart objectivement constaté,
  et dans ce cas s'arrêter avant implémentation pour approbation explicite ;
- produire le rapport français à 16 sections manquant pour cette phase et
  s'arrêter au gate humain.

Toute décision provider, RGPD, clinique, juridique, staging ou production
reste soumise à validation humaine explicite, sans changement par rapport
aux phases précédentes.
```

## 16. Confirmation d'arrêt au gate humain

Cet audit s'arrête ici. Aucune implémentation, aucun commit sur `main`,
aucune décision fournisseur, RGPD ou de production n'est entreprise à partir
de ces seules constatations. J'attends l'approbation explicite du Human
Engineering Authority avant d'exécuter la phase recommandée en section 13.
