-- pseudo column is included in 001_initial_schema.sql.
-- This migration is a no-op for databases created with migration 001.
-- For older databases that predate the migration system, the DatabaseConnection
-- guard handles this case before applying this file.
SELECT 1;
