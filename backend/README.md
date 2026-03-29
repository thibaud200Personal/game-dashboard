# Backend API - Board Game Dashboard

## Vue d'ensemble

Ce document décrit l'API backend pour l'application Board Game Dashboard. Le backend est construit avec Express.js et communique avec une base de données SQLite pour la persistance des données.

## Structure du Projet

```
backend/
├── api/
│   └── GameCharacterController.ts  # Contrôleur REST pour les personnages de jeu
├── database/
│   ├── DatabaseManager.ts  # Classe pour gérer les interactions avec la BDD
│   ├── schema.sql          # Schéma complet de la BDD
│   ├── database-structure.md # Documentation détaillée du schéma
│   └── README.md           # Documentation spécifique à la BDD
├── validation/
│   ├── schemas.ts          # Schémas Zod pour la validation des requêtes
│   └── middleware.ts       # Middleware Express de validation
└── server.ts               # Point d'entrée du serveur, gestion des routes
```

-   **`server.ts`**: Configure le serveur Express, définit les routes de l'API et gère les requêtes HTTP.
-   **`database/DatabaseManager.ts`**: Abstrait toutes les opérations de base de données (CRUD) et fournit une interface simple pour le `server.ts`.
-   **`database/`**: Contient toute la documentation et le code relatifs à la base de données.

## Installation et Lancement

1.  **Installer les dépendances :**
    ```bash
    cd backend
    npm install
    ```

2.  **Initialiser la base de données :**
    Ce script crée le fichier de base de données et applique le schéma si ce n'est pas déjà fait.
    ```bash
    npm run init-db
    ```

3.  **Démarrer le serveur de développement :**
    ```bash
    npm run dev
    ```
    Le serveur sera accessible à l'adresse `http://localhost:3001`.

## API Endpoints

### Health Check

-   `GET /api/health`
    -   **Description**: Vérifie que le serveur est en ligne.
    -   **Réponse**: `{ "status": "OK", "timestamp": "..." }`

### Players

-   `GET /api/players`
    -   **Description**: Récupère la liste de tous les joueurs.
-   `GET /api/players/:id`
    -   **Description**: Récupère un joueur par son ID.
-   `POST /api/players`
    -   **Description**: Crée un nouveau joueur.
    -   **Body**: `{ "player_name": "string", "pseudo": "string" (optionnel, unique), "avatar": "string" (optionnel), "favorite_game": "string" (optionnel) }`
-   `PUT /api/players/:id`
    -   **Description**: Met à jour un joueur existant.
    -   **Body**: `{ "player_name": "string", ... (tous les champs de la table player) }`
-   `DELETE /api/players/:id`
    -   **Description**: Supprime un joueur.

### Games

-   `GET /api/games`
    -   **Description**: Récupère la liste de tous les jeux, incluant leurs extensions et personnages.
-   `GET /api/games/:id`
    -   **Description**: Récupère un jeu par son ID, incluant ses extensions et personnages.
-   `POST /api/games`
    -   **Description**: Crée un nouveau jeu, avec ses extensions et personnages si fournis.
    -   **Body**: `{ "name": "string", "min_players": "number", "max_players": "number", ... (autres champs de la table game), "expansions": [], "characters": [] }`
-   `PUT /api/games/:id`
    -   **Description**: Met à jour un jeu existant. Les extensions et personnages existants sont supprimés et remplacés par ceux fournis dans la requête.
    -   **Body**: `{ "name": "string", ... (tous les champs de la table game), "expansions": [], "characters": [] }`
-   `DELETE /api/games/:id`
    -   **Description**: Supprime un jeu et ses relations en cascade (extensions, personnages, sessions).

### Sessions

-   `GET /api/sessions`
    -   **Description**: Récupère toutes les sessions de jeu. Peut être filtré par `game_id`.
    -   **Query Param**: `?game_id=<id>` (optionnel)
-   `POST /api/sessions`
    -   **Description**: Crée une nouvelle session de jeu et y associe les joueurs.
    -   **Body**: `{ "game_id": "number", "players": [{ "player_id": "number", "score": "number", ... }], ... (autres champs de la table game_sessions) }`

### Authentication

-   `POST /api/auth/login`
    -   **Description**: Authentifie un utilisateur et retourne un Bearer token.
    -   **Body**: `{ "password": "string" }`
    -   **Réponse**: `{ "token": "string" }`

### BGG (BoardGameGeek)

-   `GET /api/bgg/search?q=<query>`
    -   **Description**: Recherche dans le catalogue BGG local (`bgg_catalog`).
-   `GET /api/bgg/game/:id`
    -   **Description**: Récupère les détails complets d'un jeu depuis l'API BGG.
-   `GET /api/bgg/catalog/status`
    -   **Description**: Retourne l'état du catalogue local (nombre d'entrées, date d'import).
-   `POST /api/bgg/catalog/import`
    -   **Description**: Importe le catalogue BGG depuis le fichier CSV local.

### Settings

-   `GET /api/settings/import-log`
    -   **Description**: Retourne le journal des dernières opérations d'import/export (`log_import`).

### Statistics

-   `GET /api/stats/players`
    -   **Description**: Récupère des statistiques agrégées sur les joueurs.
    -   **Réponse**: `{ "total_players": "number", "total_games_played": "number", "overall_average_score": "number" }`
-   `GET /api/stats/games`
    -   **Description**: Récupère des statistiques agrégées sur les jeux.
    -   **Réponse**: `{ "total_games": "number", "games_with_expansions": "number", "games_with_characters": "number", "average_rating": "number" }`

## Base de Données

Le backend utilise SQLite via la bibliothèque `better-sqlite3`. La logique d'accès à la base de données est entièrement encapsulée dans la classe `DatabaseManager`.

Pour une description détaillée du schéma, des tables, des vues et des triggers, veuillez consulter la documentation dédiée :
-   **Documentation de la Base de Données**

## Gestion des Erreurs

-   **Wrapper `asyncHandler`**: Toutes les routes asynchrones sont enveloppées dans un `asyncHandler` qui propage les erreurs au middleware de gestion des erreurs.
-   **Middleware Centralisé**: Un middleware à la fin de `server.ts` intercepte toutes les erreurs.
    -   Il gère spécifiquement les erreurs de contrainte de la base de données (ex: `SQLITE_CONSTRAINT`).
    -   Il renvoie une erreur 500 générique pour les autres cas, avec plus de détails en environnement de développement.
-   **404 Handler**: Un middleware gère les requêtes vers des endpoints non trouvés.

## Environment Variables

-   `PORT` : Port sur lequel le serveur écoute (défaut : `3001`).
-   `NODE_ENV` : Environnement d'exécution (`development` ou `production`).