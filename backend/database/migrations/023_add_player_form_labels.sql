INSERT OR IGNORE INTO labels (key, locale, value) VALUES
  -- player dialog descriptions
  ('players.add_dialog.description',  'en', 'Create a new player profile by filling out the form below.'),
  ('players.add_dialog.description',  'fr', 'Créez un nouveau profil joueur en remplissant le formulaire ci-dessous.'),
  ('players.edit_dialog.description', 'en', 'Update player information and statistics.'),
  ('players.edit_dialog.description', 'fr', 'Modifiez les informations du joueur ci-dessous.'),

  -- players form shared fields
  ('players.form.name.placeholder',   'en', 'First name or full name'),
  ('players.form.name.placeholder',   'fr', 'Prénom ou nom complet'),
  ('players.form.pseudo.label',       'en', 'Pseudo'),
  ('players.form.pseudo.label',       'fr', 'Pseudo'),
  ('players.form.pseudo.placeholder', 'en', 'Unique identifier'),
  ('players.form.pseudo.placeholder', 'fr', 'Identifiant unique'),
  ('players.form.avatar.placeholder', 'en', 'https://example.com/avatar.jpg'),
  ('players.form.avatar.placeholder', 'fr', 'https://example.com/avatar.jpg (optionnel)'),

  -- players form validation
  ('players.form.validation.pseudo_required', 'en', 'Pseudo is required'),
  ('players.form.validation.pseudo_required', 'fr', 'Le pseudo est requis'),

  -- players form buttons
  ('players.form.buttons.update', 'en', 'Update'),
  ('players.form.buttons.update', 'fr', 'Mettre à jour');
