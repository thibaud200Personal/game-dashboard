# Spec : Table `labels` — Internationalisation UI (i18n)

**Date :** 2026-04-10  
**Statut :** Approuvé  
**Scope :** Strings statiques hardcodées (titres, labels, messages d'erreur, textes de boutons, placeholders). Hors scope : valeurs d'enums stockées en BDD (difficulty, game_type…) — chantier séparé.

---

## Contexte

L'UI contient des strings hardcodées en anglais ou français selon les composants, sans couche d'abstraction. Le stub `language` dans `useSettingsPage` n'est pas fonctionnel. L'objectif est de centraliser tous les libellés statiques en BDD, organisés par feature, avec EN et FR comme locales initiales. **La liste des langues disponibles est elle-même stockée en BDD** — ajouter une nouvelle langue ne nécessite pas de redéploiement frontend.

---

## Base de données

### Migration `011_create_labels.sql`

```sql
CREATE TABLE IF NOT EXISTS labels (
  key    TEXT NOT NULL,
  locale TEXT NOT NULL,
  value  TEXT NOT NULL,
  PRIMARY KEY (key, locale)
);
CREATE INDEX IF NOT EXISTS idx_labels_locale ON labels(locale);
```

Pas de contrainte `CHECK` sur `locale` — la liste des locales valides est dynamique (nouvelles langues = nouvelles lignes, sans migration de schéma).

### Seed EN + FR (inclus dans la migration)

#### `common.*` — Éléments partagés

| key | en | fr |
|---|---|---|
| `common.buttons.save` | Save | Enregistrer |
| `common.buttons.cancel` | Cancel | Annuler |
| `common.buttons.delete` | Delete | Supprimer |
| `common.buttons.edit` | Edit | Modifier |
| `common.buttons.add` | Add | Ajouter |
| `common.buttons.confirm` | Confirm | Confirmer |
| `common.buttons.back` | Back | Retour |
| `common.buttons.retry` | Retry | Réessayer |
| `common.buttons.submit` | Submit | Valider |
| `common.buttons.create` | Create | Créer |
| `common.buttons.close` | Close | Fermer |
| `common.buttons.loading` | Loading... | Chargement... |
| `common.search.placeholder` | Search... | Rechercher... |
| `common.empty.no_results` | No results found | Aucun résultat |
| `common.action.cannot_undo` | This action cannot be undone. | Cette action est irréversible. |

#### `auth.*` — Authentification (LoginPage)

| key | en | fr |
|---|---|---|
| `auth.title` | Board Game Dashboard | Board Game Dashboard |
| `auth.subtitle` | Enter your password to continue | Entrez votre mot de passe pour continuer |
| `auth.password.label` | Password | Mot de passe |
| `auth.password.placeholder` | •••••••• | •••••••• |
| `auth.submit` | Sign in | Se connecter |
| `auth.submit.loading` | Signing in... | Connexion... |
| `auth.error.wrong_password` | Incorrect password. Please try again. | Mot de passe incorrect. Veuillez réessayer. |

#### `dashboard.*` — Dashboard

| key | en | fr |
|---|---|---|
| `dashboard.title` | Dashboard | Dashboard |
| `dashboard.tooltip.back` | Go Back | Retour |
| `dashboard.tooltip.settings` | Settings | Paramètres |
| `dashboard.section.players` | Player Statistics | Statistiques joueurs |
| `dashboard.section.games` | Recent Games | Jeux récents |
| `dashboard.section.activity` | Recent Activity | Activité récente |
| `dashboard.players.empty` | No players yet | Aucun joueur |
| `dashboard.players.add_first` | Add your first player | Ajouter votre premier joueur |
| `dashboard.games.empty` | No games yet | Aucun jeu |
| `dashboard.games.add_first` | Add your first game | Ajouter votre premier jeu |
| `dashboard.activity.game_started` | New game started | Nouvelle partie démarrée |
| `dashboard.activity.player_joined` | Player joined | Joueur rejoint |
| `dashboard.actions.new_game` | New Game | Nouvelle partie |
| `dashboard.actions.new_game.tooltip` | Start a New Game Session | Démarrer une nouvelle partie |
| `dashboard.actions.add_player` | Add Player | Ajouter joueur |
| `dashboard.actions.add_player.tooltip` | Go to Players Page | Aller à la page joueurs |
| `dashboard.tooltip.view_players` | View All Players | Voir tous les joueurs |
| `dashboard.tooltip.view_games` | View All Games | Voir tous les jeux |

#### `games.*` — Page Jeux + Dialogs

| key | en | fr |
|---|---|---|
| `games.page.title` | Games | Jeux |
| `games.stats.total` | Total Games | Total jeux |
| `games.stats.categories` | Categories | Catégories |
| `games.stats.avg_rating` | Avg Rating | Note moyenne |
| `games.search.placeholder` | Search games, designers, publishers... | Rechercher jeux, créateurs, éditeurs... |
| `games.card.players` | players | joueurs |
| `games.card.weight` | Weight: | Poids : |
| `games.card.expansion` | Extension | Extension |
| `games.card.expansion.count` | expansion | extension |
| `games.card.expansion.count_plural` | expansions | extensions |
| `games.card.character.count` | character | personnage |
| `games.card.character.count_plural` | characters | personnages |
| `games.card.section.expansions` | Expansions | Extensions |
| `games.card.section.characters` | Characters/Roles | Personnages/Rôles |
| `games.card.modes.competitive` | Compétitif | Compétitif |
| `games.card.modes.cooperative` | Coopératif | Coopératif |
| `games.card.modes.campaign` | Campagne | Campagne |
| `games.card.modes.hybrid` | Hybride | Hybride |
| `games.empty` | No games found | Aucun jeu trouvé |
| `games.tooltip.view_details` | View Details | Voir les détails |
| `games.tooltip.view_stats` | View Game Stats | Voir les stats |
| `games.tooltip.edit` | Edit Game | Modifier le jeu |
| `games.menu.view_details` | View Details | Voir les détails |
| `games.menu.view_stats` | View Stats | Voir les stats |
| `games.menu.edit` | Edit Game | Modifier le jeu |
| `games.menu.expansions` | Manage Expansions | Gérer les extensions |
| `games.menu.characters` | Manage Characters | Gérer les personnages |
| `games.menu.delete` | Delete Game | Supprimer le jeu |
| `games.add_dialog.title` | Add New Game | Ajouter un nouveau jeu |
| `games.add_dialog.submit` | Add Game | Ajouter le jeu |
| `games.edit_dialog.title` | Edit Game | Modifier le jeu |
| `games.edit_dialog.submit` | Update Game | Mettre à jour |
| `games.delete_dialog.title` | Delete Game | Supprimer le jeu |
| `games.delete_dialog.description` | Are you sure you want to delete "{name}"? This action cannot be undone and will also remove all associated expansions and characters. | Supprimer "{name}" ? Cette action est irréversible et supprimera également toutes les extensions et personnages associés. |
| `games.form.name.label` | Game Name | Nom du jeu |
| `games.form.name.placeholder` | Enter game name | Entrer le nom du jeu |
| `games.form.image.label` | Image URL | URL de l'image |
| `games.form.thumbnail.label` | Thumbnail URL | URL de la miniature |
| `games.form.designer.label` | Designer | Créateur |
| `games.form.publisher.label` | Publisher | Éditeur |
| `games.form.year.label` | Year | Année |
| `games.form.bgg_rating.label` | BGG Rating | Note BGG |
| `games.form.description.label` | Description | Description |
| `games.form.description.placeholder` | Brief game description | Brève description du jeu |
| `games.form.category.label` | Category | Catégorie |
| `games.form.modes.label` | Game Modes | Modes de jeu |
| `games.form.is_expansion.label` | Est une extension | Est une extension |
| `games.form.has_expansion.label` | A des extensions | A des extensions |
| `games.form.expansions.label` | Expansions | Extensions |
| `games.form.has_characters.label` | Has character roles | A des rôles de personnages |
| `games.form.characters.section` | Characters | Personnages |
| `games.form.characters.name.placeholder` | Character name | Nom du personnage |
| `games.form.characters.description.placeholder` | Character description | Description du personnage |
| `games.form.characters.abilities.label` | Abilities | Capacités |
| `games.form.characters.ability.placeholder` | Ability name | Nom de la capacité |

#### `players.*` — Page Joueurs + Dialogs

| key | en | fr |
|---|---|---|
| `players.page.title` | Players | Joueurs |
| `players.stats.total` | Players | Joueurs |
| `players.stats.games` | Games | Parties |
| `players.stats.wins` | Wins | Victoires |
| `players.search.placeholder` | Search players... | Rechercher des joueurs... |
| `players.card.games` | games | parties |
| `players.card.wins` | wins | victoires |
| `players.card.avg` | Avg: | Moy : |
| `players.card.menu.view_stats` | View Stats | Voir les stats |
| `players.card.menu.edit` | Edit | Modifier |
| `players.card.menu.delete` | Delete | Supprimer |
| `players.empty` | No players found | Aucun joueur trouvé |
| `players.empty.add_first` | Add Your First Player | Ajouter votre premier joueur |
| `players.add_dialog.title` | Add New Player | Ajouter un joueur |
| `players.add_dialog.submit` | Ajouter | Ajouter |
| `players.edit_dialog.title` | Edit Player | Modifier le joueur |
| `players.delete_dialog.title` | Delete Player | Supprimer le joueur |
| `players.delete_dialog.description` | Are you sure you want to delete "{name}"? This action cannot be undone. | Supprimer "{name}" ? Cette action est irréversible. |
| `players.form.name.label` | Name | Nom |
| `players.form.name.placeholder` | Prénom ou nom complet | Prénom ou nom complet |
| `players.form.pseudo.placeholder` | Identifiant unique | Identifiant unique |
| `players.form.avatar.label` | Avatar URL | URL de l'avatar |
| `players.form.favorite_game.label` | Favorite Game | Jeu favori |
| `players.form.favorite_game.placeholder` | Enter favorite game (optional) | Jeu favori (optionnel) |

#### `sessions.*` — Nouvelle Partie (NewGameView)

| key | en | fr |
|---|---|---|
| `sessions.new.title` | New Game Session | Nouvelle partie |
| `sessions.setup.title` | Game Setup | Configuration |
| `sessions.setup.game.label` | Game | Jeu |
| `sessions.setup.game.placeholder` | Choose a game... | Choisir un jeu... |
| `sessions.setup.type.label` | Session Type | Type de session |
| `sessions.setup.type.competitive` | Competitive - Players compete against each other | Compétitif - Les joueurs s'affrontent |
| `sessions.setup.type.cooperative` | Cooperative - Players work together | Coopératif - Les joueurs coopèrent |
| `sessions.setup.type.campaign` | Campaign - Ongoing story mode | Campagne - Mode histoire |
| `sessions.setup.type.hybrid` | Hybrid - Mix of team and individual goals | Hybride - Mélange d'objectifs équipe et individuels |
| `sessions.players.title` | Select Players | Sélectionner les joueurs |
| `sessions.players.min_required` | Minimum {min} players required ({current} selected) | Minimum {min} joueurs requis ({current} sélectionné(s)) |
| `sessions.players.max_reached` | Maximum of {max} players reached | Maximum de {max} joueurs atteint |
| `sessions.cooperative.title` | Cooperative Objectives | Objectifs coopératifs |
| `sessions.cooperative.difficulty.label` | Difficulty Level | Niveau de difficulté |
| `sessions.cooperative.team_success` | Team Victory | Victoire d'équipe |
| `sessions.cooperative.team_score.label` | Team Score | Score d'équipe |
| `sessions.cooperative.objectives.label` | Shared Objectives | Objectifs partagés |
| `sessions.cooperative.objectives.add_common` | Add Common | Ajouter communs |
| `sessions.cooperative.objectives.add_custom` | Add Custom | Ajouter personnalisé |
| `sessions.cooperative.objectives.empty` | No objectives set yet | Aucun objectif défini |
| `sessions.cooperative.objectives.empty_hint` | Add objectives to track your team's progress | Ajoutez des objectifs pour suivre la progression |
| `sessions.cooperative.objectives.placeholder` | Objective description... | Description de l'objectif... |
| `sessions.cooperative.objectives.points` | pts | pts |
| `sessions.cooperative.objectives.completed` | Completed | Accompli |
| `sessions.cooperative.objectives.total` | Total Objectives Score: | Score total des objectifs : |
| `sessions.cooperative.objectives.progress` | {done} of {total} completed | {done} sur {total} accomplis |
| `sessions.competitive.title` | Competitive Scoring | Scores compétitifs |
| `sessions.competitive.winner_missing` | A winner must be designated | Un vainqueur doit être désigné |
| `sessions.competitive.score_invalid` | The winner's score must be greater than 0 | Le score du vainqueur doit être supérieur à 0 |
| `sessions.competitive.winner` | Winner | Vainqueur |
| `sessions.hybrid.team.title` | Team Objectives | Objectifs d'équipe |
| `sessions.hybrid.team.completed` | Team Objectives Completed | Objectifs d'équipe accomplis |
| `sessions.hybrid.team.score` | Team Score | Score d'équipe |
| `sessions.hybrid.individual.title` | Individual Scores | Scores individuels |
| `sessions.details.title` | Session Details | Détails de la session |
| `sessions.details.duration.label` | Duration (minutes) | Durée (minutes) |
| `sessions.details.duration.required` | Required | Obligatoire |
| `sessions.details.duration.placeholder` | 60 | 60 |
| `sessions.details.notes.label` | Notes | Notes |
| `sessions.details.notes.placeholder` | Game notes, highlights, or observations... | Notes, moments forts ou observations... |
| `sessions.submit` | Create Session | Créer la session |
| `sessions.submit.loading` | Creating... | Création... |

#### `stats.game.*` — Stats par jeu (GameStatsView)

| key | en | fr |
|---|---|---|
| `stats.game.no_data` | No game data available | Aucune donnée disponible |
| `stats.game.all_title` | All Games Statistics | Statistiques tous jeux |
| `stats.game.all_overview` | Overview across {count} games | Vue d'ensemble sur {count} jeux |
| `stats.game.stat.sessions` | Sessions | Sessions |
| `stats.game.stat.avg_players` | Avg Players | Joueurs moy. |
| `stats.game.stat.avg_duration` | Avg Duration | Durée moy. |
| `stats.game.stat.avg_score` | Avg Score | Score moy. |
| `stats.game.back_to_all` | ← Back to All Games Statistics | ← Retour aux statistiques globales |
| `stats.game.select.title` | Select a Game for Detailed Stats | Choisir un jeu pour les stats détaillées |
| `stats.game.popularity.title` | Game Popularity | Popularité des jeux |
| `stats.game.sessions_label` | sessions | sessions |
| `stats.game.score_trend.title` | Score Trend | Évolution des scores |
| `stats.game.score_trend.subtitle` | Last 10 Sessions | 10 dernières sessions |
| `stats.game.session_types.title` | Session Types | Types de sessions |
| `stats.game.player_dist.title` | Player Count Distribution | Distribution nb joueurs |
| `stats.game.player_dist.label` | players | joueurs |
| `stats.game.top_winners.title` | Top Winners | Meilleurs joueurs |
| `stats.game.top_winners.wins` | wins | victoires |
| `stats.game.recent.title` | Recent Sessions | Sessions récentes |
| `stats.game.recent.winner` | Winner: | Vainqueur : |
| `stats.game.recent.avg_score` | avg score | score moy. |

#### `stats.player.*` — Stats joueur (PlayerStatsView)

| key | en | fr |
|---|---|---|
| `stats.player.profile` | Player Profile | Profil joueur |
| `stats.player.stat.wins` | Wins | Victoires |
| `stats.player.stat.games_played` | Games Played | Parties jouées |
| `stats.player.stat.total_score` | Total Score | Score total |
| `stats.player.stat.avg_score` | Avg Score | Score moyen |
| `stats.player.stat.total_players` | Total Players | Total joueurs |
| `stats.player.favorite_game` | Favorite Game | Jeu favori |
| `stats.player.top_players` | Top Players | Meilleurs joueurs |
| `stats.player.recent.title` | {name}'s Recent Games | Parties récentes de {name} |
| `stats.player.recent.empty` | No recent games found | Aucune partie récente |
| `stats.player.recent.score` | Score: {score} pts | Score : {score} pts |
| `stats.player.recent.winner` | Winner | Vainqueur |
| `stats.player.activity.title` | Recent Activity | Activité récente |
| `stats.player.activity.played` | played {game} | a joué à {game} |
| `stats.player.performance.title` | {name}'s Performance | Performance de {name} |
| `stats.player.performance.all` | Performance Overview | Vue d'ensemble |
| `stats.player.performance.coming_soon` | Detailed charts coming soon... | Graphiques détaillés à venir... |

#### `settings.*` — Paramètres (SettingsPageView)

| key | en | fr |
|---|---|---|
| `settings.page.title` | Settings | Paramètres |
| `settings.section.preferences` | Preferences | Préférences |
| `settings.notifications.label` | Notifications | Notifications |
| `settings.notifications.desc` | Get notified about game updates | Recevoir les mises à jour |
| `settings.dark_mode.label` | Dark Mode | Mode sombre |
| `settings.dark_mode.desc` | Use dark theme | Utiliser le thème sombre |
| `settings.language.label` | Language | Langue |
| `settings.language.desc` | Choose your language | Choisir votre langue |
| `settings.language.offline` | Unavailable offline | Indisponible hors ligne |
| `settings.language.retry` | Retry | Réessayer |
| `settings.auto_save.label` | Auto Save | Sauvegarde auto |
| `settings.auto_save.desc` | Automatically save changes | Enregistrer automatiquement |
| `settings.tooltips.label` | Show Tooltips | Afficher les infobulles |
| `settings.tooltips.desc` | Display helpful tooltips | Afficher les infobulles |
| `settings.section.data` | Data Management | Gestion des données |
| `settings.data.bgg_imported` | BGG Catalog importé | Catalogue BGG importé |
| `settings.data.export` | Export Data | Exporter les données |
| `settings.data.import` | Import Data | Importer les données |
| `settings.data.reset` | Reset All Data | Réinitialiser toutes les données |
| `settings.data.bgg_catalog` | BGG Catalog | Catalogue BGG |
| `settings.data.bgg_not_imported` | Non importé | Non importé |
| `settings.data.bgg_count` | {count} jeux | {count} jeux |
| `settings.data.bgg_importing` | Import en cours… | Import en cours… |
| `settings.data.bgg_import_file` | Importer boardgames_ranks.csv | Importer boardgames_ranks.csv |
| `settings.section.about` | About | À propos |
| `settings.about.version` | Board Game Dashboard v1.0.0 | Board Game Dashboard v1.0.0 |
| `settings.about.desc` | A modern dashboard for tracking your board game sessions and player statistics. | Un tableau de bord moderne pour suivre vos sessions et statistiques. |
| `settings.section.session` | Session | Session |
| `settings.logout` | Sign out | Se déconnecter |

#### `errors.*` — Messages d'erreur

| key | en | fr |
|---|---|---|
| `errors.generic` | An error occurred | Une erreur est survenue |
| `errors.network` | Network error. Please check your connection. | Erreur réseau. Vérifiez votre connexion. |
| `errors.game.not_found` | Game not found | Jeu introuvable |
| `errors.game.duplicate` | This game is already in your collection | Ce jeu est déjà dans votre collection |
| `errors.player.not_found` | Player not found | Joueur introuvable |
| `errors.player.duplicate_pseudo` | This pseudo is already taken | Ce pseudo est déjà utilisé |
| `errors.session.not_found` | Session not found | Session introuvable |
| `errors.auth.unauthorized` | Unauthorized | Non autorisé |
| `errors.auth.wrong_password` | Incorrect password | Mot de passe incorrect |

---

## Convention de nommage des clés

Format : `{feature}.{groupe}.{élément}`

| Préfixe | Périmètre |
|---|---|
| `common.*` | Boutons, éléments partagés |
| `auth.*` | Page de connexion |
| `dashboard.*` | Dashboard principal |
| `games.*` | Page jeux, dialogs ajout/modif/suppression |
| `players.*` | Page joueurs, dialogs |
| `sessions.*` | Nouvelle partie |
| `stats.game.*` | Statistiques par jeu |
| `stats.player.*` | Statistiques par joueur |
| `settings.*` | Page paramètres |
| `errors.*` | Messages d'erreur API et UI |

---

## Backend

### Endpoints

#### 1. Récupérer les labels d'une locale

```
GET /api/v1/labels?locale=fr
```

- **Auth** : non requise — les labels sont publics (chargés avant login)
- **Réponse** : objet plat `Record<string, string>`
- **Validation Zod** : `z.object({ locale: z.string().min(2).max(5).default('en') })`

```json
{
  "games.page.title": "Jeux",
  "common.buttons.save": "Enregistrer",
  "errors.generic": "Une erreur est survenue"
}
```

#### 2. Lister les locales disponibles

```
GET /api/v1/labels/locales
```

- **Auth** : non requise
- **Réponse** : liste des locales disponibles avec leur nom natif

```json
[
  { "locale": "en", "name": "English" },
  { "locale": "fr", "name": "Français" }
]
```

Le nom natif est lui-même un label stocké en BDD : clé `locale.{code}.name` (ex: `locale.en.name = "English"`, `locale.fr.name = "Français"`). Ainsi ajouter une langue = ajouter des lignes, sans toucher au code.

### Architecture backend (layered)

```
GET /api/v1/labels?locale=fr     → LabelsRoute → LabelsService → LabelsRepository
GET /api/v1/labels/locales       → LabelsRoute → LabelsService → LabelsRepository
```

- **LabelsRepository** :
  - `getByLocale(locale: string): Promise<Record<string, string>>`  
    `SELECT key, value FROM labels WHERE locale = ?`
  - `getAvailableLocales(): Promise<Array<{locale: string, name: string}>>`  
    `SELECT DISTINCT locale, value as name FROM labels WHERE key = 'locale.' || locale || '.name'`

---

## Frontend

### Fichiers nouveaux / modifiés

```
src/
  i18n/
    en.json                  ← seed EN statique, embarqué dans le bundle
  hooks/
    useLabels.ts             ← hook principal : t(key), t(key, fallback)
    useLocales.ts            ← liste des locales depuis API (pour le select)
    useApiReachable.ts       ← détection réseau via GET /api/health
    useLocale.ts             ← lecture/écriture localStorage + invalidation React Query
    useSettingsPage.ts       ← modifié : stub language → useLocale
  services/api/
    labelsApi.ts             ← fetchLabels(locale), fetchLocales()
  views/
    SettingsPageView.tsx     ← modifié : select dynamique + grisage + retry
```

### Hook `useLabels()`

```ts
// Clé React Query : ['labels', locale]
// staleTime: Infinity — pas de refetch silencieux en cours de session
// Fallback : en.json si clé absente ou API indisponible

const { t } = useLabels()
t('games.page.title')              // → "Jeux" si locale=fr
t('missing.key', 'Default text')  // → "Default text" si clé absente
```

### Hook `useLocales()`

```ts
// Clé React Query : ['labels', 'locales']
// Alimente le <Select> dans SettingsPageView
// Désactivé (skip) si !isReachable

const { locales } = useLocales()
// → [{ locale: 'en', name: 'English' }, { locale: 'fr', name: 'Français' }]
```

### Fallback EN statique (`src/i18n/en.json`)

Embarqué dans le bundle Vite. Utilisé :
- Au démarrage avant que l'API réponde (pas de flash de clés brutes)
- Si l'API est indisponible (offline) — EN toujours fonctionnel sans réseau

### Détection réseau (`useApiReachable`)

```ts
const { isReachable, triggerRetry } = useApiReachable()
// Tente GET /api/health
// triggerRetry() : nouvelle tentative manuelle
```

### Changement de langue (flux complet)

```
Settings → setLocale('fr')
  → localStorage.setItem('locale', 'fr')
  → queryClient.invalidateQueries(['labels', 'fr'])
  → GET /api/v1/labels?locale=fr
  → dictionnaire mis à jour en mémoire
  → tous les composants useLabels() re-render
```

Pas de rechargement de page. Instantané si cache React Query présent.

### UX dégradée (offline)

- **EN** : toujours actif (JSON statique embarqué), toujours sélectionnable
- **Autres locales** : grisées si `!isReachable`
- Bouton "Réessayer" visible quand des options sont grisées → appelle `triggerRetry()`
- Si `isReachable` revient à `true` → options se déverrouillent

### Select langue dynamique

Le `<Select>` dans `SettingsPageView` est alimenté par `useLocales()` — aucune locale hardcodée dans le frontend. Ajouter une langue = ajouter ses entrées en BDD, le select l'affiche automatiquement.

---

## Hors scope

- Valeurs d'enums stockées en BDD (`difficulty`, `game_type`, `session_type`…) — chantier séparé, nécessite une analyse de la structure des tables existantes
- ES (espagnol) — supprimé du sélecteur Settings
- Pluralisation avancée et interpolation de variables (ex. `"{{count}} jeux"`) — les clés avec `{name}`, `{count}` etc. sont gérées par une simple substitution de string côté frontend, pas de lib i18n
- Table `settings` en BDD pour stocker la préférence locale — déféré, localStorage suffit
