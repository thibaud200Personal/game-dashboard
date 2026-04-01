# Architecture Backend

## Vue d'ensemble

Le backend est une API Express 5 en TypeScript, organisée en couches strictes. Il est conçu comme un **API first-class** capable de servir plusieurs clients (web, Android).

## Structure des fichiers

```
backend/
├── server.ts                    → setup Express + enregistrement routes
├── routes/                      → handlers HTTP (parsing uniquement)
│   ├── players.ts
│   ├── games.ts
│   ├── sessions.ts
│   ├── stats.ts
│   ├── bgg.ts
│   └── auth.ts
├── services/                    → logique métier + transactions
│   ├── PlayerService.ts
│   ├── GameService.ts
│   ├── SessionService.ts
│   ├── StatsService.ts
│   └── AuthService.ts
├── repositories/                → accès BDD (une entité par fichier)
│   ├── PlayerRepository.ts
│   ├── GameRepository.ts
│   ├── SessionRepository.ts
│   ├── StatsRepository.ts
│   └── BGGRepository.ts
├── database/
│   ├── DatabaseConnection.ts    → connexion SQLite + runner migrations
│   ├── migrations/              → fichiers SQL numérotés
│   │   ├── 001_initial_schema.sql
│   │   └── ...
│   └── schema.sql               → schéma de référence
├── middleware/
│   ├── auth.ts                  → vérification JWT
│   ├── requireRole.ts           → guard admin/user
│   └── errorHandler.ts          → mapping erreurs → HTTP
├── validation/
│   ├── schemas.ts               → schémas Zod
│   └── middleware.ts            → middleware validation
└── scripts/
    ├── import-bgg-catalog.ts
    └── init-database.ts
```

## Flux d'une requête

```
HTTP Request
  ↓ [cors, helmet, json parser]
  ↓ [auth middleware]         → vérifie JWT, injecte { sub, role } dans req
  ↓ [requireRole middleware]  → sur routes protégées admin
  ↓ [validation middleware]   → Zod : body + params + query
  ↓ [Route handler]           → extrait les données, appelle le service
  ↓ [Service]                 → logique métier, transactions
  ↓ [Repository]              → requêtes SQL typées
  ↓ [DatabaseConnection]      → SQLite
  ↓ [errorHandler]            → si exception : mappe en code HTTP
→ JSON Response
```

## Couche Routes

**Responsabilité unique** : parsing HTTP. Une route ne contient aucune logique métier.

```ts
// routes/players.ts
router.post('/', validateBody(CreatePlayerSchema), async (req, res) => {
  const player = await playerService.createPlayer(req.body)
  res.status(201).json(player)
})
```

Les routes ne savent pas comment les données sont stockées.

## Couche Services

**Responsabilité** : logique métier + orchestration de transactions.

Règles :
- Un service peut appeler plusieurs repositories
- Les transactions restent confinées au service — jamais exposées à la route
- Les services lèvent des erreurs typées (`NotFoundError`, `ConflictError`)

```ts
// services/SessionService.ts
createSession(payload: CreateSessionPayload): GameSession {
  return this.db.transaction(() => {
    const session = this.sessionRepo.insertSession(payload)
    this.sessionRepo.insertSessionPlayers(session.session_id, payload.players)
    return session
  })()
}
```

## Couche Repositories

**Responsabilité** : requêtes SQL pour une entité. Chaque repository reçoit `DatabaseConnection` en paramètre (injection de dépendance → testable).

```ts
// repositories/PlayerRepository.ts
export class PlayerRepository {
  constructor(private db: DatabaseConnection) {}

  findAll(): Player[] {
    return this.db.prepare('SELECT * FROM player_statistics').all() as Player[]
  }

  findById(id: number): Player | undefined {
    return this.db.prepare('SELECT * FROM player_statistics WHERE player_id = ?').get(id) as Player
  }
}
```

Les repositories ne savent pas qu'ils peuvent être dans une transaction.

## Erreurs typées

```ts
// middleware/errorHandler.ts
export class NotFoundError extends Error { constructor(msg: string) { super(msg); this.name = 'NotFoundError' } }
export class ConflictError extends Error { ... }
export class ValidationError extends Error { ... }
export class ForbiddenError extends Error { ... }

// Mapping automatique :
// NotFoundError   → 404
// ConflictError   → 409
// ValidationError → 400
// ForbiddenError  → 403
// Autres          → 500 (message masqué en prod)
```

## Authentification JWT

```
POST /api/v1/auth/login
  Body: { password: string }
  → valide contre ADMIN_PASSWORD ou USER_PASSWORD (.env)
  → génère JWT signé : { sub: 'user', role: 'admin'|'user', exp: now+3600 }
  → web : Set-Cookie httpOnly + SameSite=Strict
  → Android : { token, expiresIn }

Routes protégées :
  → middleware auth.ts vérifie le JWT (cookie OU header Authorization)
  → injecte req.user = { sub, role }

Routes admin-only :
  → middleware requireRole('admin')
  → 403 si role !== 'admin'
```

Rôles :
| Rôle | Accès |
|---|---|
| `user` | Lecture + création sessions/jeux/joueurs, export données |
| `admin` | Tout user + import BGG catalog + suppression en masse |

## Migrations BDD

Les migrations sont des fichiers SQL numérotés appliqués séquentiellement au démarrage.

```
backend/database/migrations/
├── 001_initial_schema.sql
├── 002_add_pseudo_to_players.sql
├── 003_add_bgg_catalog.sql
├── 004_remove_dead_stats_columns.sql
├── 005_remove_game_type.sql
└── 006_add_hybrid_session_type.sql
```

Table de suivi :
```sql
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

Le runner vérifie `MAX(version)`, applique les fichiers manquants dans une transaction atomique. Un crash en milieu de migration laisse la BDD dans son état précédent.

## Ajouter un endpoint — checklist

1. Ajouter le type dans `shared/types/index.ts` si nécessaire
2. Ajouter le schéma Zod dans `backend/validation/schemas.ts`
3. Ajouter la méthode dans le repository correspondant
4. Ajouter la logique dans le service correspondant
5. Ajouter la route dans `backend/routes/`
6. Enregistrer la route dans `server.ts`
7. Écrire les tests : repository (DB in-memory) + service (mocks) + route (supertest)
8. Mettre à jour `docs/architecture/DATA_MAPPING.md` si un type change
