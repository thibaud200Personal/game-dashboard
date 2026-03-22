# Architecture Frontend : Board Game Dashboard

## Vue d'ensemble

Ce document décrit l'architecture frontend du Board Game Dashboard, organisée selon une structure modulaire et maintenable.

## Structure des Répertoires

```
src/
├── components/           # Composants React principaux
│   ├── dialogs/         # Boîtes de dialogue réutilisables
│   ├── games/           # Composants spécifiques aux jeux
│   ├── players/         # Composants spécifiques aux joueurs (n'existe pas pour le moment)
│   └── ui/              # Composants UI de base (shadcn)
├── *.tsx                #
├── docs/                # Documentation frontend
├── hooks/               # Hooks React personnalisés
│   ├── games/           # Hooks spécifiques aux jeux
│   ├── players/         # Hooks spécifiques aux joueurs (n'existe pas pour le moment)
│   └── *.tsx                #
├── lib/                 # Utilitaires
├── services/            # Services pour les appels API BGG
├── styles/              # CSS
├── types/               # Définitions TypeScript
├── utils/               # Test BGG
├── views/               # Composants de vue (présentation)
│   ├── games/           # Vues spécifiques aux jeux
│   ├── players/         # Vues spécifiques aux joueurs (n'existe pas pour le moment)
│   └── *.tsx            #
```

## Principes d'Architecture

### 1. Separation of Concerns

- **Components** : Logique métier et gestion d'état
- **Views** : Présentation et interface utilisateur pure
- **Hooks** : Logique réutilisable et gestion d'état
- **Services** : Communication avec les APIs externes

### 2. Composants Principaux

#### Pages Principales
- `Dashboard` : Page d'accueil avec statistiques
- `PlayersPage` : Gestion des joueurs
- `GamesPage` : Gestion des jeux
- `StatsPage` : Statistiques détaillées
- `SettingsPage` : Configuration
- `NewGamePage` : Création de sessions de jeu

#### Composants Spécialisés
- `GameDetailPage` : Détail d'un jeu
- `GameExpansionsPage` : Gestion des extensions
- `GameCharactersPage` : Gestion des personnages

### 3. Hooks Personnalisés

#### Hooks de Pages
- `useDashboard` : État du tableau de bord
- `usePlayersPage` : Gestion de la page joueurs
- `useGamesPage` : Gestion de la page jeux
- `useStatsPage` : Logique des statistiques

#### Hooks Spécialisés
- `useGameExpansions` : Gestion des extensions de jeu
- `useGameCharacters` : Gestion des personnages de jeu

### 4. Services

#### ApiService
Service principal pour les communications avec le backend :
- CRUD Players
- CRUD Games
- CRUD Sessions
- Gestion des erreurs

#### BGGService
Service pour l'intégration avec BoardGameGeek API :
- Recherche de jeux
- Récupération des données
- Mapping des données BGG vers notre format

### 5. Types TypeScript

`src/types/index.ts` est la **source de vérité unique** pour tous les types. Le flux est unidirectionnel :

```
DB schema (schema.sql) → backend models → src/types/index.ts → composants frontend
```

**Règles strictes :**
- Aucun `any` autorisé — 0 `any` dans tout le codebase (frontend + backend)
- Les payloads de création utilisent `Omit<T, 'generated_id'>` pour exclure les champs auto-générés
- Les payloads de mise à jour utilisent `Partial<T>` avec les champs immuables exclus via `Omit`
- Les submit handlers utilisent `React.FormEvent` (pas `any`)

Interfaces principales définies dans `types/index.ts` :
- `Player` : Représentation d'un joueur (`avatar?`, `stats?` optionnels)
- `Game` : Représentation d'un jeu (inclut champs BGG étendus)
- `GameExpansion` : Extension de jeu (`year_published?` optionnel)
- `GameCharacter` : Personnage de jeu (`description?` optionnel)
- `GameSession` : Session de jeu (types: `competitive | cooperative | campaign | hybrid`)
- `SessionPlayer` : Joueur dans une session
- `CreateSessionPayload` : Payload de création de session avec champs spécifiques coopératif/campagne
- `BGGGame`, `BGGExpansion`, `BGGCharacter` : Types pour l'intégration BoardGameGeek
- `GameFormData`, `PlayerFormData` : Types pour les formulaires (sans champs auto-générés)

## Flux de Données

### 1. État Global
L'état principal est géré dans `App.tsx` avec useState :
- `players` : Liste des joueurs
- `games` : Liste des jeux
- `stats` : Statistiques globales
- `currentView` : Vue actuelle
- `navigationContext` : Contexte de navigation

### 2. Navigation
Le système de navigation utilise :
- `currentView` : État de la vue actuelle
- `navigationContext` : Contexte avec ID et source
- `handleNavigation` : Fonction de navigation centralisée

### 3. Gestion des Données
- **Lecture** : Services API → Hooks → Composants → Views
- **Écriture** : Views → Composants → Hooks → Services API
- **État Local** : Hooks personnalisés pour la logique spécialisée

## Patterns Utilisés

### 1. Container/Presenter Pattern
- **Containers** (Components) : Logique et état
- **Presenters** (Views) : Interface utilisateur pure

### 2. Custom Hooks Pattern
- Extraction de la logique réutilisable
- Séparation des préoccupations
- Tests facilités

### 3. Service Layer Pattern
- Abstraction des appels API
- Gestion centralisée des erreurs
- Cache et optimisations

## Composants UI

### shadcn/ui Components
Utilisation de la bibliothèque shadcn pour :
- `Button`, `Input`, `Dialog`
- `Card`, `Badge`, `Tooltip`
- `Form`, `Select`, `Checkbox`
- `Tabs`, `Sheet`, `Alert`

### Composants Personnalisés
- `BottomNavigation` : Navigation mobile
- `BGGSearch` : Recherche BoardGameGeek
- Dialogs spécialisés pour chaque entité

## Responsive Design

### Mobile First
- Design adaptatif avec Tailwind CSS
- Navigation contextuelle mobile
- Menus contextuels pour les actions

### Desktop Enhancements
- Tooltips sur hover
- Actions directes sans menus
- Layouts optimisés pour grand écran

## Performance

### Optimisations
- Lazy loading des composants
- Mémoisation avec useMemo/useCallback
- Images optimisées avec formats modernes
- Minimal re-renders avec React patterns

### Bundle Splitting
- Code splitting par route
- Chargement différé des fonctionnalités avancées
- Tree shaking des imports

## Tests

### Structure de Tests
```
src/
├── __tests__/           # Tests unitaires
├── components/
│   └── __tests__/       # Tests de composants
├── hooks/
│   └── __tests__/       # Tests de hooks
└── services/
    └── __tests__/       # Tests de services
```

### Types de Tests
- **Unit Tests** : Hooks et utilitaires
- **Component Tests** : Composants React
- **Integration Tests** : Flux complets
- **E2E Tests** : Parcours utilisateur

## Conventions de Code

### Naming Conventions
- **Components** : PascalCase (ex: `GameCard`)
- **Hooks** : camelCase avec préfixe `use` (ex: `useGameData`)
- **Types** : PascalCase (ex: `Player`)
- **Variables** : camelCase (ex: `gameList`)

Pour les conventions de nommage de fichiers et l'organisation des imports, veuillez vous référer au **`DEVELOPMENT_GUIDE.md`**.

## Évolutions Futures

### Améliorations Prévues
- Migration vers React Query pour la gestion d'état serveur
- Implémentation de PWA (Progressive Web App)
- Ajout de tests automatisés complets
- Optimisations de performance avancées

### Extensibilité
- Architecture modulaire pour nouveaux composants
- Système de plugins pour nouvelles fonctionnalités
- API standardisée pour intégrations tierces