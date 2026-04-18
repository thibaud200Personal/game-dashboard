# ADR-004 — JWT signé + rôles admin/user

**Date** : 31 mars 2026
**Statut** : Accepté

## Contexte

L'authentification actuelle (PR #57) utilise un token 64-hex généré en mémoire au démarrage. Problèmes :
- Token invalide à chaque redémarrage du conteneur Docker
- Pas de standard (pas JWT) — pas d'expiration, pas de claims
- Token stocké dans `localStorage` — vulnérable XSS
- Un seul niveau d'accès pour toutes les opérations

## Décision

### JWT signé

Remplacer le token statique par des JWT signés avec `jsonwebtoken` :
- Secret dans `AUTH_JWT_SECRET` (.env)
- Expiration : 1 heure
- Payload : `{ sub: 'user', role: 'admin'|'user', iat, exp }`
- Résistant aux redémarrages (validé par signature, pas par dictionnaire en mémoire)

### Cookie HttpOnly pour le web

Le JWT est stocké dans un cookie `HttpOnly; SameSite=Strict; Secure`. Non accessible en JavaScript — protégé contre XSS. `credentials: true` dans CORS.

### Rôles admin/user

Deux mots de passe configurés en `.env` :
- `ADMIN_PASSWORD` → token avec `role: 'admin'`
- `USER_PASSWORD` → token avec `role: 'user'`

| Rôle | Périmètre |
|---|---|
| `user` | Lecture, création/modification jeux/joueurs/sessions |
| `admin` | Tout user + import BGG catalog + suppressions sensibles |

Frontend : les fonctionnalités admin sont conditionnellement rendues selon le rôle décodé du JWT. Le backend vérifie le rôle via `requireRole('admin')` — la vérification frontend est cosmétique (UX), la vérification backend est la seule garantie de sécurité.

## Conséquences

**Positives :**
- Résistance aux redémarrages Docker
- Standard JWT — outillage existant, auditabilité
- Cookie HttpOnly — protégé XSS
- Rôles extensibles pour un multi-utilisateur futur
- Import BGG catalog protégé par rôle admin

**Négatives :**
- ~~Pas de refresh token~~ — **Refresh tokens implémentés** (table `refresh_tokens`, rotation de famille via `RefreshTokenRepository` + `AuthService.rotateRefreshToken`). Expiration access token : 1h, refresh token : 30 jours.
- Migration : le frontend doit changer de `localStorage` vers cookie, adapter les requêtes avec `credentials: 'include'`

## Alternatives rejetées

- **Garder le token statique** : problème redémarrage non résolu, non standard
- **Sessions serveur (express-session)** : état serveur incompatible avec l'objectif multi-client (Android)
- **OAuth2** : sur-ingénierie pour un usage personnel mono/bi-utilisateur
