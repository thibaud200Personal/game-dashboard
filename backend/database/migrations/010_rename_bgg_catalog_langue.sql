-- Consolidate language tables:
-- 1. Drop the simpler stash table (if it somehow exists)
-- 2. Rename bgg_catalog_langue -> bgg_catalog_language (final canonical name)
DROP TABLE IF EXISTS bgg_catalog_language;
ALTER TABLE bgg_catalog_langue RENAME TO bgg_catalog_language;
