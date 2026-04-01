# ADR-001 — Types partagés dans `shared/`

**Date** : 31 mars 2026
**Statut** : Accepté

## Contexte

Le projet avait deux fichiers de types distincts :
- `src/types/index.ts` (frontend)
- `backend/models/interfaces.ts` (backend)

Ces deux fichiers décrivent les mêmes entités (`Player`, `Game`, `GameSession`...) mais sont maintenus indépendamment. Des divergences silencieuses sont apparues (`game_type`, `pseudo`).

## Décision

Créer un dossier `shared/types/index.ts` à la racine du monorepo. Frontend et backend importent depuis ce fichier. `backend/models/interfaces.ts` est supprimé. `src/types/index.ts` réexporte uniquement depuis `shared/types`.

## Conséquences

**Positives :**
- Source de vérité unique — un seul endroit à modifier quand un type change
- TypeScript détecte les incohérences au build (front + back compilent contre les mêmes types)
- Préparation naturelle pour un client Android futur

**Négatives :**
- Migration à faire : déplacer les types, mettre à jour les imports, configurer les path aliases dans les deux tsconfig
- Le Dockerfile doit copier `shared/` avant de builder les deux projets

## Alternatives rejetées

- **Frontend comme source** (`src/types/` → backend importe depuis `../src/types`) : crée une dépendance backend → frontend, sémantiquement fausse
- **Backend comme source** (`backend/models/` → frontend importe depuis `../backend/models`) : même problème inversé
