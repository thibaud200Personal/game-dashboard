-- Migration 014: Add BGG enrichment labels for Settings page
INSERT OR IGNORE INTO labels (key, locale, value) VALUES
  ('settings.data.bgg_enrich',          'en', 'Re-run Wikidata Enrichment'),
  ('settings.data.bgg_enrich',          'fr', 'Relancer l''enrichissement Wikidata'),
  ('settings.data.bgg_enriching',       'en', 'Enrichment in progress…'),
  ('settings.data.bgg_enriching',       'fr', 'Enrichissement en cours…');
