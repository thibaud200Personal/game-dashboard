-- BGG Search component labels
INSERT OR IGNORE INTO labels (key, locale, value) VALUES
  ('bgg.search.placeholder', 'en', 'Search by name or BGG ID...'),
  ('bgg.search.placeholder', 'fr', 'Rechercher par nom ou ID BGG...'),
  ('bgg.search.loading_details', 'en', 'Loading details...'),
  ('bgg.search.loading_details', 'fr', 'Chargement des détails...'),
  ('bgg.search.error.search_failed', 'en', 'BGG search failed. Please try again.'),
  ('bgg.search.error.search_failed', 'fr', 'Échec de la recherche sur BoardGameGeek. Veuillez réessayer.'),
  ('bgg.search.error.load_failed', 'en', 'Could not load game details. Please try again.'),
  ('bgg.search.error.load_failed', 'fr', 'Impossible de charger les détails du jeu. Veuillez réessayer.'),
  ('bgg.search.badge.base_game', 'en', 'Base game'),
  ('bgg.search.badge.base_game', 'fr', 'Jeu de base'),
  ('bgg.search.empty', 'en', 'No games found. Try a different search term.'),
  ('bgg.search.empty', 'fr', 'Aucun jeu trouvé. Essayez un autre terme de recherche.'),
  ('bgg.search.footer', 'en', 'Data from BoardGameGeek.com · Enter a BGG ID for direct loading'),
  ('bgg.search.footer', 'fr', 'Données de BoardGameGeek.com · Entrez un ID BGG pour un chargement direct');
