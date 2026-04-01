# ADR-003 — Pattern Repository pour le backend

**Date** : 31 mars 2026
**Statut** : Accepté

## Contexte

`DatabaseManager.ts` (896 lignes) est une classe dieu qui gère toutes les entités sans séparation de responsabilités. Impossible à tester en isolation. Chaque nouvelle entité l'alourdit.

## Décision

Éclater `DatabaseManager` en :
- `DatabaseConnection.ts` — connexion SQLite + runner de migrations uniquement
- Un repository par domaine : `PlayerRepository`, `GameRepository`, `SessionRepository`, `StatsRepository`, `BGGRepository`
- Une couche service par domaine : `PlayerService`, `GameService`, `SessionService`, `StatsService`, `AuthService`

Injection de dépendance : les repositories reçoivent `DatabaseConnection` en paramètre de constructeur.

## Gestion des transactions

Les transactions qui couvrent plusieurs tables restent dans la couche service :

```ts
// SessionService.ts
createSession(payload) {
  return this.db.transaction(() => {
    const session = this.sessionRepo.insertSession(payload)
    this.sessionRepo.insertSessionPlayers(session.session_id, payload.players)
    return session
  })()
}
```

Règle : **une transaction ne sort jamais d'un service**. Les repositories ne savent pas qu'ils sont dans une transaction — ils font leurs requêtes normalement.

## Conséquences

**Positives :**
- Chaque repository est testable isolément (DB SQLite in-memory injectée)
- Chaque service est testable avec repositories mockés
- Responsabilité unique par fichier
- `server.ts` simplifié (délègue aux routes, plus de logique inline)

**Négatives :**
- Plus de fichiers à maintenir
- La transaction cross-repository nécessite que le service ait accès à `DatabaseConnection` directement (pour `.transaction()`) en plus des repositories

## Alternatives rejetées

- **Garder `DatabaseManager` monolithique** : n'adresse pas le problème de testabilité
- **ORM (Prisma, Knex)** : ajoute une dépendance lourde, perd le contrôle sur les vues SQL qui sont un avantage du schéma actuel, support SQLite limité pour les migrations Prisma
