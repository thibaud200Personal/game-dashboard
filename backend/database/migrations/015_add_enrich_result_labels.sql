-- Migration 015: Add success/error labels for BGG enrichment
INSERT OR IGNORE INTO labels (key, locale, value) VALUES
  ('settings.data.bgg_enrich_success', 'en', 'Enrichment completed'),
  ('settings.data.bgg_enrich_success', 'fr', 'Enrichissement terminé'),
  ('settings.data.bgg_enrich_error',   'en', 'Enrichment failed'),
  ('settings.data.bgg_enrich_error',   'fr', 'Erreur lors de l''enrichissement');
