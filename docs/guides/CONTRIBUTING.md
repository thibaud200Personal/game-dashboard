# Guide de contribution

## Prérequis

- Node.js 24 LTS
- npm 10+
- Git

## Installation locale

```bash
# Cloner le repo
git clone <repo-url>
cd game-dashboard

# Frontend
npm install

# Backend
cd backend && npm install && cd ..

# Variables d'environnement
cp .env.example .env
# Éditer .env : AUTH_JWT_SECRET, ADMIN_PASSWORD, USER_PASSWORD

# Initialiser la base de données
cd backend && npm run init-db && cd ..

# Démarrer les deux serveurs
npm run dev          # Frontend : http://localhost:5173
cd backend && npm run dev  # Backend : http://localhost:3001
```

## Structure du projet

```
game-dashboard/
├── shared/          → types et utilitaires partagés front/back
├── src/             → frontend React
├── backend/         → API Express
├── docs/            → documentation
├── .env.example     → template variables d'environnement
└── Dockerfile
```

## Variables d'environnement

Voir `.env.example` pour la liste complète. Variables obligatoires :

| Variable | Description | Exemple |
|---|---|---|
| `AUTH_JWT_SECRET` | Secret de signature JWT (min 32 chars) | `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Mot de passe administrateur | — |
| `USER_PASSWORD` | Mot de passe utilisateur standard | — |
| `PORT` | Port du serveur backend | `3001` |
| `NODE_ENV` | Environnement (`development` / `production`) | `development` |
| `CORS_ORIGINS` | Origines autorisées (séparées par `,`) | `http://localhost:5173` |

Ne jamais commiter `.env`. Seul `.env.example` est versionné.

## Workflow de développement

### Branches

- `main` — branche protégée, review obligatoire
- `feature/<nom>` — nouvelles fonctionnalités
- `fix/<nom>` — corrections de bugs
- `chore/<nom>` — maintenance, dépendances
- `docs/<nom>` — documentation uniquement

### Process PR

1. Créer une branche depuis `main`
2. Écrire les tests avant le code (TDD)
3. Développer la feature
4. Vérifier que tous les tests passent : `npm run test:run`
5. Vérifier le lint : `npm run lint`
6. Ouvrir une PR vers `main`
7. Review obligatoire avant merge
8. Après merge : supprimer la branche locale ET distante

```bash
git push origin --delete ma-branche
git branch -d ma-branche
```

## Principe TDD

**Tests écrits avant le code.**

1. Écrire le test qui décrit le comportement attendu → il échoue (red)
2. Écrire le code minimal pour le faire passer (green)
3. Refactorer sans casser les tests (refactor)

Avantage : les tests documentent le comportement attendu et servent de filet de sécurité pour les refactorings futurs.

## Conventions de code

### TypeScript

- `strict: true` dans tous les tsconfig
- Zéro `any` — utiliser `unknown`, types précis, ou `Omit<T, 'field'>`
- Types importés depuis `@shared/types` ou `@/types` (qui réexporte shared)
- Exception documentée : middleware d'erreur Express 5 (`error: any` — convention Express)

```ts
// ✅ Correct
async createPlayer(data: Omit<Player, 'player_id' | 'created_at'>): Promise<Player>

// ❌ Interdit
async createPlayer(data: any): Promise<any>
```

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `GameCard.tsx` |
| Vues (presenters) | PascalCase + suffixe `View` | `GamesPageView.tsx` |
| Hooks | camelCase + préfixe `use` | `useGamesPage.ts` |
| Services/Repositories | PascalCase + suffixe | `PlayerRepository.ts` |
| Types | PascalCase | `Player`, `GameSession` |
| Variables | camelCase | `gameList` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_PLAYERS` |

### Imports

```ts
// 1. React
import React, { useState } from 'react'
// 2. Bibliothèques externes
import { useQuery } from '@tanstack/react-query'
// 3. Imports internes absolus
import { Player } from '@/types'
import { playerApi } from '@/features/players/playerApi'
import { queryKeys } from '@/shared/services/api/queryKeys'
// 4. Imports relatifs
import './Component.css'
```

### Commits

Format Conventional Commits :
```
feat: ajouter la sélection de personnages en session
fix: corriger le calcul des stats joueur sur sessions coopératives
chore: mettre à jour Vite 8.1
docs: documenter le pattern repository
test: ajouter les tests d'intégration SessionService
```

## Ajouter un champ en base de données

1. Créer un fichier de migration numéroté : `backend/database/migrations/00N_description.sql`
2. Ajouter le champ dans `shared/types/index.ts`
3. Mettre à jour le schéma Zod dans `backend/validation/schemas.ts`
4. Mettre à jour le repository concerné
5. Mettre à jour `docs/architecture/DATA_MAPPING.md`
6. Écrire un test qui vérifie que la migration s'applique correctement

## Ajouter un endpoint

1. Ajouter le type dans `shared/types/index.ts` si nécessaire
2. Créer/mettre à jour le schéma Zod dans `backend/validation/schemas.ts`
3. Ajouter la méthode dans le repository
4. Ajouter la logique dans le service
5. Ajouter la route dans `backend/routes/`
6. Enregistrer dans `server.ts`
7. Écrire les tests (repository + service + route)
8. Mettre à jour la doc OpenAPI (annotations JSDoc sur la route)

## Ajouter une page frontend

L'architecture est **feature-based** : chaque fonctionnalité est co-localisée dans `src/features/<nom>/`.

1. Créer le dossier `src/features/<nom>/`
2. Créer le hook `src/features/<nom>/use<NomPage>.ts`
3. Créer le container `src/features/<nom>/<NomPage>.tsx`
4. Créer la view `src/features/<nom>/<NomPage>View.tsx`
5. Si dialogs nécessaires : créer `src/features/<nom>/dialogs/`
6. Si nouveau domaine API : créer `src/features/<nom>/<nom>Api.ts`
7. Ajouter la route dans `src/App.tsx`
8. Ajouter les clés de cache dans `src/shared/services/api/queryKeys.ts`
9. Écrire les tests (hook + composant + intégration)

**Règles d'architecture :**
- Une feature n'importe **jamais** depuis une autre feature (exception : `features/bgg/` est importable par `features/games/` et `features/settings/`)
- Tout module utilisé par 2+ features → `src/shared/`
- Ne pas créer de fichiers dans les anciens dossiers `src/components/`, `src/views/`, `src/hooks/` (supprimés)

## Tests

### Commandes

```bash
npm run test:run        # One-shot (frontend)
npm test                # Watch mode (frontend)
npm run test:coverage   # Couverture (seuil 80%)

cd backend
npm run test:run        # One-shot (backend)
```

### Structure

```
src/__tests__/
├── unit/
│   ├── technical/      → fonctions pures, utils, formatters
│   └── functional/     → hooks et composants
├── integration/        → flux complets avec MSW
└── fixtures/           → données réalistes (Gloomhaven, Wingspan, Catan)

backend/__tests__/
├── unit/
│   ├── services/       → services avec repositories mockés
│   └── repositories/   → SQL contre DB SQLite in-memory
├── integration/        → routes HTTP complètes (supertest)
└── fixtures/
```

### Règles

- Fixtures réalistes — pas de données génériques ("test", "foo", 123)
- Repositories testés contre une vraie DB SQLite in-memory
- Services testés avec repositories mockés (injection de dépendance)
- Chaque test est indépendant (pas d'état partagé entre tests)

## Sécurité

- Ne jamais commiter de secrets (`.env`, tokens, mots de passe)
- Vérifier `npm audit` avant chaque PR : `npm audit && cd backend && npm audit`
- Signaler une vulnérabilité en créant une issue privée (pas en PR publique)

Voir `docs/security/SECURITY.md` pour le modèle de menace complet.
