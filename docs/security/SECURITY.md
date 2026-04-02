# Sécurité

## Modèle de menace

L'application est exposée sur internet avec un accès restreint par authentification. Les menaces principales pour ce type de projet :

| Menace | Probabilité | Mesure |
|---|---|---|
| Accès non authentifié aux données | Élevée | JWT sur toutes les routes |
| Brute-force mot de passe | Élevée | Rate limiting sur `/auth/login` |
| XSS → vol de token | Moyenne | Cookie HttpOnly (non lisible en JS) |
| Injection SQL | Faible | Requêtes paramétrées (better-sqlite3) |
| Information leak via stack traces | Élevée si non géré | Erreurs masquées en production |
| Dépendances vulnérables | Continue | npm audit en CI |

## Authentification

### JWT

Tokens signés avec `jsonwebtoken` et un secret configuré dans `.env`.

```
POST /api/v1/auth/login
  Body : { password: string }
  → valide contre ADMIN_PASSWORD ou USER_PASSWORD
  → génère : { sub: 'user', role: 'admin'|'user', iat, exp: now+3600 }
  → web : Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict; Secure
  → Android : { token, expiresIn: 3600 }
```

**Pourquoi HttpOnly cookie pour le web** : un cookie `HttpOnly` n'est pas accessible via `document.cookie` en JavaScript. Une attaque XSS ne peut pas exfiltrer le token. `localStorage` est vulnérable XSS par définition.

**Pourquoi un secret .env** : le JWT est signé côté backend. Si le secret est compromis, tous les tokens actifs sont invalides dès que le secret est changé. Ne jamais hardcoder le secret.

Générer un secret sécurisé :
```bash
openssl rand -hex 32
```

### Rôles

| Rôle | Périmètre |
|---|---|
| `user` | Lecture de toutes les données, création/modification jeux/joueurs/sessions, export |
| `admin` | Tout `user` + import BGG catalog + suppressions en masse |

Le rôle est dans le payload JWT. Le frontend l'utilise pour afficher/masquer les fonctionnalités admin. Le backend le vérifie via `requireRole('admin')` pour les routes sensibles — la vérification côté frontend est cosmétique uniquement.

### Expiration et refresh

Tokens valides 1 heure. À l'expiration, le frontend reçoit un 401 et redirige vers `/login`. Pas de refresh token implémenté pour le moment — acceptable pour un usage personnel (reconnexion manuelle toutes les heures si la session est longue).

## Rate limiting

```ts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 tentatives max
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/v1/auth/login', loginLimiter)
```

Les tentatives échouées sont loguées en niveau `warn` avec l'IP source.

## Headers HTTP — Helmet

```ts
app.use(helmet())
```

Headers automatiquement configurés :
- `X-Content-Type-Options: nosniff` — empêche le MIME sniffing
- `X-Frame-Options: DENY` — empêche le clickjacking
- `Strict-Transport-Security` — force HTTPS
- `Content-Security-Policy` — restreint les sources de scripts

## Validation des entrées

Toutes les entrées sont validées par des schémas Zod :
- **Body** : `validateBody(schema)` sur POST/PUT
- **Paramètres de route** : `validateParams(z.object({ id: z.coerce.number().int().positive() }))`
- **Query strings** : `validateQuery(schema)` sur les routes avec filtres

Règle : ne jamais faire confiance à une valeur de `req.params` ou `req.query` sans validation préalable.

## Injection SQL

`better-sqlite3` utilise des requêtes paramétrées. Ne jamais interpoler des variables dans les requêtes SQL :

```ts
// ✅ Sécurisé
db.prepare('SELECT * FROM players WHERE player_id = ?').get(id)

// ❌ Vulnérable
db.prepare(`SELECT * FROM players WHERE player_id = ${id}`).get()
```

## Messages d'erreur en production

```ts
const isDev = process.env.NODE_ENV !== 'production'

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err)
  res.status(resolveStatus(err)).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  })
})
```

En production : aucune information interne dans les réponses d'erreur. Les détails sont dans les logs (pino), pas dans la réponse HTTP.

## CORS

```ts
const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) ?? []
app.use(cors({
  origin: allowedOrigins,
  credentials: true,          // nécessaire pour les cookies HttpOnly
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
```

`credentials: true` est requis pour que le navigateur envoie les cookies cross-origin. En production, `allowedOrigins` ne doit contenir que le domaine du frontend.

## HTTPS

En production, redirection HTTP → HTTPS et header `Strict-Transport-Security`. Configuré au niveau du reverse proxy (nginx) ou dans `server.ts` si déploiement direct.

## Audit des dépendances

```bash
npm audit              # Frontend
cd backend && npm audit  # Backend
```

Exécuté à chaque PR dans le stage de build Docker. Une vulnérabilité de sévérité `high` ou `critical` bloque le build.

## Import BGG Catalog

L'endpoint d'import (`POST /api/v1/bgg/import-catalog`) traite un fichier CSV de 175k lignes. Il est protégé par `requireRole('admin')` pour deux raisons :
1. Opération longue — peut saturer les ressources du serveur
2. Modifie massivement la base de données

Le fichier CSV doit être uploadé par l'administrateur depuis l'interface Settings (rôle admin requis).

## Checklist sécurité avant déploiement

- [ ] `AUTH_JWT_SECRET` généré avec `openssl rand -hex 32` (32+ chars)
- [ ] `ADMIN_PASSWORD` et `USER_PASSWORD` forts et différents
- [ ] `NODE_ENV=production` dans l'environnement de prod
- [ ] `CORS_ORIGINS` contient uniquement le domaine de prod
- [ ] `npm audit` → 0 vulnérabilité high/critical
- [ ] HTTPS configuré (certificat valide)
- [ ] Logs accessibles (stdout Docker ou agrégateur)
- [ ] Rate limiting actif sur `/auth/login`
