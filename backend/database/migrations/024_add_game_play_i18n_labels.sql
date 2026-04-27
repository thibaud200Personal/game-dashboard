INSERT OR IGNORE INTO labels (key, locale, value) VALUES
  -- games form missing placeholders
  ('games.form.expansions.placeholder', 'en', 'Extension 1 (2023), Extension 2 (2024), ...'),
  ('games.form.expansions.placeholder', 'fr', 'Extension 1 (2023), Extension 2 (2024), ...'),
  ('games.form.duration.placeholder',   'en', '30-60 min'),
  ('games.form.duration.placeholder',   'fr', '30-60 min'),

  -- plays difficulty levels
  ('plays.form.difficulty.easy',   'en', 'Easy'),
  ('plays.form.difficulty.easy',   'fr', 'Facile'),
  ('plays.form.difficulty.normal', 'en', 'Normal'),
  ('plays.form.difficulty.normal', 'fr', 'Normal'),
  ('plays.form.difficulty.hard',   'en', 'Hard'),
  ('plays.form.difficulty.hard',   'fr', 'Difficile'),
  ('plays.form.difficulty.expert', 'en', 'Expert'),
  ('plays.form.difficulty.expert', 'fr', 'Expert');
