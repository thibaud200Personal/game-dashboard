# Sprint 5 — Système de Migration BDD

## Problème
Le schéma SQLite est fixe. Tout ajout de colonne nécessite un `ALTER TABLE` manuel appliqué directement sur la base — pas de versioning, pas de traçabilité, risque de perte de données ou d'état incohérent.

## État actuel
- `backend/database/schema.sql` : schéma complet mais monolithique, pas versionné
- `backend/database/DatabaseManager.ts` : `initDatabase()` recrée les tables avec `CREATE TABLE IF NOT EXISTS` — pas de migration incrémentale

## Ce qui manque

### Option recommandée : système custom léger
1. **Table `schema_migrations`** dans SQLite :
   ```sql
   CREATE TABLE IF NOT EXISTS schema_migrations (
     version INTEGER PRIMARY KEY,
     applied_at TEXT DEFAULT (datetime('now')),
     description TEXT
   );
   ```

2. **Répertoire `backend/database/migrations/`** :
   - `001_initial_schema.sql` — schéma actuel complet
   - `002_bgg_extended_fields.sql` — colonnes BGG manquantes (voir sprint1-bgg-schema-migration)
   - `003_*.sql` — futures évolutions

3. **`DatabaseManager.ts` : `applyMigrations()`** appelé au démarrage :
   ```typescript
   private applyMigrations() {
     const currentVersion = this.db.prepare('SELECT MAX(version) FROM schema_migrations').pluck().get() ?? 0;
     const migrations = this.loadMigrations(); // lire fichiers 00X_*.sql
     for (const m of migrations.filter(m => m.version > currentVersion)) {
       this.db.exec(m.sql);
       this.db.prepare('INSERT INTO schema_migrations (version, description) VALUES (?, ?)').run(m.version, m.description);
     }
   }
   ```

### Option alternative : knex.js
- Outil mature avec `knex migrate:latest` / `knex migrate:rollback`
- Overhead d'une dépendance supplémentaire
- Recommandé si le projet évolue vers une vraie architecture multi-env

## Fichiers à créer/modifier
- `backend/database/migrations/001_initial_schema.sql`
- `backend/database/migrations/002_bgg_extended_fields.sql`
- `backend/database/DatabaseManager.ts` — ajouter `applyMigrations()`
- `backend/database/schema.sql` — peut devenir la migration 001

## Estimation
2-3 jours
