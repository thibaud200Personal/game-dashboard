# Audit UX/UI complet — Game Dashboard

**Portée** : revue exhaustive page par page (`src/features/**/View.tsx`), dialogs (`src/features/**/dialogs/*.tsx`), primitives UI (`src/shared/components/ui/*.tsx`), et patterns transverses.
**Date** : 2026-04-18
**Mise à jour** : 2026-05-01 — Sprint A terminé (PR #95) + fix régressions PR #91 (labels, GameForm, i18n, bottom-nav) + Sprint B §24-30 GamesPageView + GameDetailView. Items résolus retirés : §10 (timestamps fictifs Dashboard), §20 (empty state Games), §28 (double h1 GameDetail), §59 (bouton bleu BGGSearch), §74 (placeholder "coming soon" Stats Player), §75 (i18n Stats Player), §86 (Reset sans AlertDialog), §104-107 (DeleteGameDialog), §114-119 (EditPlayerDialog), §121 (DeletePlayerDialog). PR #85 (i18n 9 composants) et refactors dialogs ont résolu la majorité du Sprint 1 et Sprint 2.
**Méthode** : lecture ligne-à-ligne du code, cross-reference avec les spécifications WCAG 2.1 AA, audit de cohérence entre pages et entre modes clair/sombre.

---

## Revue critique de l'audit (Claude Sonnet 4.6 — 2026-04-19)

**Ce qui est excellent**

La méthode est rigoureuse : lecture ligne-à-ligne du code, calculs de contraste réels, grep de patterns, inventaire exhaustif fichier par fichier. Les findings sont concrets plutôt que vagues. Le Top 15 avec estimation de charge par sprint est directement actionnable.

**Ce qui est particulièrement juste**

- Le diagnostic sur `darkMode` prop-drilling (§ 14.1) est le point central de tout le backlog. Tout le reste des bugs de thème en découle. La priorité Sprint 3 #11 est correctement identifiée comme ROI maximal.
- La distinction entre "les primitives shadcn sont propres, le problème c'est que les devs les overrident avec `bg-slate-700`" (§ 13.3.2) — c'est la vraie cause racine, pas les primitives elles-mêmes.
- Les données fictives dans le Dashboard (§ 10) étaient identifiées comme critique de confiance — ✅ corrigées depuis.

**Ce que je nuancerais**

- Le wizard multi-étapes pour `NewPlayView` (§ 53) est peut-être sur-dimensionné pour un usage personnel. Le coût (un sprint entier) vs la valeur (moins de scroll) mérite réflexion. La vraie priorité dans ce formulaire c'est le RadioGroup winner (§ 48) et l'auto-save (§ 49).
- Les 26 primitives shadcn "non utilisées" (§ 13.2) : Vite + tree-shaking les exclut effectivement du bundle. La dette est réelle mais principalement cognitive (maintenance), pas de performance.
- L'estimation "1.5 à 2 mois" suppose un dev frontend à plein temps — en pratique x3 en temps calendaire sur un projet perso.

**Conclusion**

Document à garder. Le Sprint 1 (6 quick wins) peut se faire en une après-midi et éliminerait les bugs les plus visibles. Commencer là.

---

## Sommaire

1. [Login](#1-login-authloginpagetsx)
2. [Dashboard](#2-dashboard-dashboarddashboardviewtsx)
3. [Games — liste](#3-games--liste-gamesgamespageviewtsx)
4. [Game Detail](#4-game-detail-gamesdetailgamedetailviewtsx)
5. [Game Expansions / Characters](#5-game-expansions--characters)
6. [Players](#6-players-playersplayerspageviewtsx)
7. [New Play](#7-new-play-playsnewplayviewtsx)
8. [BGG Search](#8-bgg-search-bggbggsearchtsx)
9. [Stats — Game](#9-stats--game-statsgamegamestatsviewtsx)
10. [Stats — Player](#10-stats--player-statsplayerplayerstatsviewtsx)
11. [Settings](#11-settings-settingssettingspageviewtsx)
12. [Dialogs — audit complet](#12-dialogs--audit-complet)
13. [shared/components/ui — audit des primitives](#13-sharedcomponentsui--audit-des-primitives)
14. [Problèmes transverses — design system](#14-problèmes-transverses--design-system)
15. [Top 15 — priorités d'exécution](#15-top-15--priorités-dexécution)

**Légende de sévérité** : 🔴 critique (bloque la release ou casse l'usage) · 🟡 modéré (dégrade l'expérience) · 🟢 mineur (à faire dans un refactor)

---

## 1. Login (`auth/LoginPage.tsx`)

### Première impression

Une page centrée, fond gradient `from-slate-900 via-slate-800 to-slate-900`, carte glassmorphism (`bg-white/10 backdrop-blur-md`), un champ password, un bouton. L'ergonomie est correcte — mais **rien n'identifie l'application**. Un cadenas Phosphor `<Lock>`, un titre « Login », et c'est tout. Un utilisateur qui arrive par erreur sur cette URL ne saura pas sur quel produit il se connecte.

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 1 | 🟡 | Pas de logo, pas de nom produit, pas de tagline. L'icône `<Lock className="w-8 h-8 text-white">` est purement décorative et ajoute zéro valeur d'identification. | Remplacer le cadenas par un logo SVG `<GameDashboardLogo />` + titre `"Game Dashboard"` + sous-titre `"Suivi de vos parties de société"`. Ajouter un `<meta name="application-name">` et un `<title>` explicites. |

### Ce qui marche

- `autoComplete="current-password"` : reconnu par tous les password managers.
- Formulaire court, un seul champ, un seul CTA : conversion maximale, pas de doute possible.
- Pas de « confirm password » ni de champs décoratifs : zéro gras cognitif.
- ✅ Placeholder contrast `/30` → `/60` (WCAG 1.4.11 conforme).
- ✅ `placeholder="••••••••"` retiré (redondant avec `type="password"`).
- ✅ `autoFocus` retiré (fix clavier iOS restrictif).
- ✅ `aria-busy` + spinner `<Circle>` sur le bouton lors du chargement.
- ✅ `role="alert" aria-live="assertive"` sur le message d'erreur.
- ✅ `focus-visible:ring-white/80` sur le bouton submit (halo visible sur fond teal).
- ✅ Countdown 60 s après 3 tentatives échouées (`failCount` + `cooldown` state).
- ✅ Mode clair non géré : décision produit — dark mode fixe, cohérent avec le reste de l'app.
- ✅ Password-only sans identifiant : par design — mot de passe partagé pour protéger l'app.

### Résumé

Un seul finding restant : **§ 1 — identité visuelle** (logo + titre de l'app). Tout le reste est résolu.

---

## 2. Dashboard (`dashboard/DashboardView.tsx`)

### Première impression

Hero visuel chargé : deux grands cercles teal/emerald avec halo `animate-pulse`, gradient de fond, bannière d'accueil. Puis cascade descendante de cartes identiques. Le pattern est « tout est important, donc rien ne l'est ».

### Hiérarchie visuelle

- **Fixations oculaires en 2 s (estimation)** : (1) cercles teal/emerald en haut, (2) titre de la carte « Activité récente », (3) images joueurs. Le CTA primaire (« Démarrer une partie ») arrive en 5ᵉ position, donc hors du premier écran.
- **Flux de lecture attendu** vs **flux de lecture réel** :
  - Attendu : Header → CTA primaire → stats secondaires → activité → actions.
  - Réel : Header → cercles décoratifs → stats → listes → activité → CTA en bas.
- **Problème de pyramide** : l'action la plus stratégique (nouvelle partie) est en position la moins visible.

### Constats

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 11 | ✅ | ~~Deux CTA équivalents en bas : `"Nouveau jeu"` (teal) et `"Ajouter joueur"` (emerald), même taille, même poids.~~ → **Résolu** : `"Démarrer une partie"` = CTA primaire full-width (`p-5`, `font-semibold text-lg`, `min-h-[56px]`). `"Ajouter joueur"` = bouton secondaire outline (`border-white/20`, `min-h-[44px]`). | — |
| 12 | ✅ | ~~Cercles stats `w-20 h-20` trop grands, `animate-pulse` permanent.~~ → **Résolu** : `w-16 h-16`, ring `animate-pulse` remplacé par `hover:scale-105 transition-transform` sur le bouton. | — |
| 13 | ⏭️ | Toutes les cartes (Joueurs, Jeux, Activité) partagent la même recette visuelle. **Déféré** : les 3 sections sont du contenu pair — la hiérarchie est maintenant assurée par le CTA primaire (§11 ✅). Une distinction primaire/secondaire sur des cartes de même niveau n'apporterait pas de gain net. | — |
| 14 | ✅ | ~~Grilles sans indication « voir tous ».~~ → **Résolu** : bouton `"See all players (N) →"` et `"See all games (N) →"` ajoutés sous chaque grille, conditionnels sur `hasPlayers` / `hasGames`. | — |
| 15 | ✅ | ~~Header : `p-2` + `w-6 h-6` → 40×40 px tactile.~~ → **Résolu** : `p-2.5` + `w-5 h-5` = 44×44 px. | — |
| 16 | ✅ | ~~`text-white/60` ≈ 4.1:1, sous le seuil AA.~~ → **Résolu** : `dark:text-white/60` → `dark:text-white/70` (≈ 4.9:1) sur toutes les secondarys du Dashboard. | — |
| 17 | ✅ | ~~`text-white/40` timestamps ≈ 2.7:1.~~ → **Résolu** (item retiré : timestamps fictifs supprimés en Sprint 1, finding caduc). | — |
| 18 | 🟢 | `<img src={...} alt="" />` pour les avatars joueurs : correct (décoratif puisque le nom est visible à côté), bon réflexe d'accessibilité. |   |

### Accessibilité — focus spécifique

- Le sticky header n'a pas de `<nav>` ni de `aria-label`. Un lecteur d'écran ne distingue pas la barre du contenu.
- Les icônes décoratives manquent de `aria-hidden="true"` → lues par VoiceOver comme « image, cadenas ».
- La grille de cartes est un `<div grid>` plat, sans landmark. Ajouter `<section aria-labelledby="stats-heading">`.

### Résumé

Dashboard globalement fonctionnel. Priorité principale : restructurer la hiérarchie pour que l'action « démarrer une partie » soit en position dominante (CTA primaire visible sans scroll).

---

## 3. Games — liste (`games/GamesPageView.tsx`)

### Première impression

La page **la plus dense** d'information de l'app. Chaque carte de jeu affiche : thumbnail, titre, badges mode (compétitif/coop/…), nombre de joueurs, durée, difficulté, année, note BGG, poids BGG, expansions count. C'est riche, c'est informatif, c'est aussi à la limite de la surcharge cognitive.

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 19 | ✅ | ~~Champ de recherche hardcodé dark.~~ → **Résolu** : `GamesPageView` et `PlayersPageView` utilisent déjà `className="pl-10"` uniquement — tokens shadcn natifs. Icône `text-muted-foreground`. Dark mode forcé, pas de régression mode clair. | — |
| 21 | ✅ | ~~`DropdownMenuContent` hardcodé dark.~~ → **Résolu** : `<DropdownMenuContent align="end">` sans classes couleur — tokens shadcn. Items : `dark:` préfixés via `dropdownItemClass` dans `gameHelpers.ts`. | — |
| 22 | ✅ | ~~Double point d'entrée Add Game simultanément visible.~~ → **Résolu** : FAB `md:hidden` (mobile only), trigger header enveloppé dans `hidden md:flex` (desktop only). | — |
| 23 | ✅ | ~~Actions desktop carte : `p-2` + `w-4 h-4` ≈ 32 px.~~ → **Résolu** : `p-2.5` + `w-5 h-5` ≈ 44 px sur les 4 boutons (Eye, ChartLineUp, PencilSimple, Trash). | — |
| 24 | ✅ | ~~Le bouton `caret` d'expand/collapse est un `<button>` imbriqué dans une grille de badges, elle-même dans un container qui peut être cliquable.~~ → **Analysé 2026-05-01** : le caret est un `<button>` autonome dans la zone de badges, la `<Card>` n'est pas un élément interactif. HTML valide, pas de boutons imbriqués. Aucune action requise. | — |
| 25 | ✅ | ~~Badge « Extension » : `text-amber-400` sur blanc ≈ 2.3:1. Échec AA.~~ → **Résolu 2026-05-01** : `border-amber-600/60 text-amber-700 dark:border-amber-500/40 dark:text-amber-400`. WCAG AA conforme en mode clair. | — |
| 26 | ✅ | ~~Stats en haut : couleurs arbitraires emerald/blue/purple sans valeur sémantique.~~ → **Résolu 2026-05-01** : `text-emerald-700/blue-700/purple-700 dark:*-400` → `text-foreground` sur les 3 valeurs. | — |
| 27 | ✅ | ~~Incohérence de palette gameModeColors entre pages.~~ → **Résolu PR #91** : `src/shared/theme/gameModeColors.ts` créé, importé dans GamesPageView, GameStatsView, NewPlayView. | — |

### Accessibilité

- Recherche : icône `<MagnifyingGlass>` hardcodée `text-white/60` → invisible en mode clair.
- FAB `fixed bottom-24 right-6` — vérifier que `pb-32` est appliqué sur le scroll container (OK actuellement) pour que le dernier item de la liste ne soit pas masqué.
- `aria-label` sur les boutons d'action : présent sur le FAB, absent sur les icônes individuelles des cartes.

### Résumé

Page informativement riche mais cognitivement lourde. §24-27 tous résolus. Aucun finding restant dans cette section.

---

## 4. Game Detail (`games/detail/GameDetailView.tsx`)

### Première impression

Page vitrine d'un jeu : hero image, titre, badges, stats, puis onglets Overview / Expansions / Characters. Bien structurée sur desktop. Le double `<h1>` a été corrigé. §29 (GameOverview tokens) et §30 (bottom-nav) résolus le 2026-05-01. Restant : §31 (kebab mobile), §32 (header bg hardcodé).

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 29 | ✅ | ~~`GameOverview` entièrement hardcodé sombre : `bg-slate-800/50`, `border-slate-700/50`, `text-white`, `text-slate-300`, `text-slate-400`.~~ → **Résolu 2026-05-01** : refactor complet — `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-muted/50`. Page wrapper `bg-gradient-to-br slate` → `bg-background`. Rating pill amber WCAG AA corrigé. | — |
| 30 | ✅ | ~~Bottom nav mobile : onglet « Games » toujours `text-primary` peu importe la page.~~ → **Résolu 2026-05-01** : bottom-nav dupliquée inline dans `GameDetailView` supprimée. Le `<Layout>` global fournit `<BottomNavigation>` avec `useLocation()` correct. | — |
| 31 | ✅ | ~~Le kebab mobile mélange 5 items : 3 onglets de navigation + 2 actions de gestion.~~ → **Résolu 2026-05-01** : kebab réduit aux 2 actions de gestion (Manage Expansions / Manage Characters). `<TabsList>` rendu sur toutes les tailles d'écran (suppression des blocs `hidden md:block` / `md:hidden` séparés — un seul `<Tabs>` unifié). | — |
| 32 | ✅ | ~~Header `bg-slate-800/50 backdrop-blur-sm` hardcodé sombre.~~ → **Résolu 2026-05-01** : `bg-background/95 backdrop-blur-sm border-border`. Boutons ghost : `text-muted-foreground hover:text-foreground hover:bg-muted`. Hide-on-scroll déféré (non-bloquant). | — |
| 33 | ✅ | ~~Preview Expansions/Characters : lien « Gérer » affiché mais cartes non-cliquables — ambiguïté UX.~~ → **Résolu 2026-05-01** : `<Card>` entier cliquable (`cursor-pointer hover:border-primary/50 transition-colors`) → navigation vers management. Bouton « Gérer » retiré, remplacé par `<CaretRight>` indicator. | — |
| 34 | ✅ | ~~Rating pill `text-amber-400` sur `bg-amber-500/20` ≈ 2.5:1, échec AA en mode clair.~~ → **Résolu 2026-05-01** dans §29 : `bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400`. WCAG AA conforme. | — |
| 35 | ✅ | ~~`<TabsTrigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground>` contraste à vérifier.~~ → **Résolu 2026-05-01** : `tabs.tsx` utilise `data-[state=active]:bg-background` + `text-foreground` (≈ 21:1), pas `bg-primary`. Contraste WCAG AA largement conforme. `theme.json` est vide — les tokens CSS sont dans `index.css`. | — |
| 36 | ✅ | ~~Pas d'état de chargement visible pendant le fetch du game detail → UX pauvre.~~ → **Résolu 2026-05-01** : `<GameDetailSkeleton />` créé (`src/features/games/detail/GameDetailSkeleton.tsx`) avec `<Skeleton>` shadcn pour le header, les tabs, le hero card et les preview cards. `GamePageRoute` affiche le skeleton pendant `isLoading`. | — |

### Résumé

§29–§36 résolus. GameDetail entièrement audité ✅.

---

## 5. Game Expansions / Characters

Pages secondaires (gestion des extensions et personnages par jeu).

### Constats

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 37 | ✅ | ~~`ExpansionCard` utilise `bg-slate-800` hardcodé — deux recettes de carte coexistent.~~ → **Résolu 2026-05-01** : `ExpansionCard` + `CharacterCard` migrés vers `bg-card border-border text-foreground text-muted-foreground`. Zéro token slate hardcodé. Idem pour les empty-state cards. | — |
| 38 | ✅ | ~~Boutons Edit `flex-1` / Delete `w-auto` → asymétrie.~~ → **Résolu 2026-05-01** : `flex-1 justify-center` sur Edit **et** Delete dans `ExpansionCard` et `CharacterCard`. | — |
| 39 | ✅ | ~~Champ `character_key` (slug interne) exposé dans le formulaire et la carte.~~ → **Résolu 2026-05-01** : `character_key` retiré du formulaire `CharacterDialog` et de l'affichage carte. Auto-généré via `slugify(name)` dans `useGameCharacters` (ajout : depuis le nom ; édition : clé existante préservée pour éviter les régressions). | — |
| 40 | ✅ | Avatar par défaut `<User>` dans cercle gris — clean, aucune action requise. → Token migré vers `bg-muted text-muted-foreground` lors du fix §37. | — |
| 41 | 🟢 | Pas d'ordre explicite des expansions. | Tri par date/année — différé (non-bloquant). |

### Résumé

§37–40 résolus. §41 (tri expansions) différé — non-bloquant.

---

## 6. Players (`players/PlayersPageView.tsx`)

### Première impression

**La page la mieux exécutée du lot** en matière de cohérence thème. Le ternaire `darkMode ? "..." : "..."` est appliqué systématiquement sur chaque élément. L'empty state est un modèle à reproduire ailleurs.

### Constats

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 42 | ✅ | ~~Fallback avatar = URL Unsplash hardcodée — même visage pour tous + dépendance externe.~~ → **Résolu 2026-05-01** : `<InitialAvatar>` créé (`src/shared/components/InitialAvatar.tsx`) — cercle coloré (hash name → HSL) + 2 initiales blanches. Zéro dépendance externe, identité unique par joueur. | — |
| 43 | ✅ | ~~Seul l'icône `<ChartLineUp>` (32 px) était cliquable pour les stats.~~ → **Résolu 2026-05-01** : `PlayerCard` entière cliquable (`role="button"`, keyboard support). Desktop : icône `ChartLineUp` retirée, Edit + Delete conservés avec `stopPropagation`. Mobile kebab : item "View Stats" retiré (inutile — la carte suffit). | — |
| 44 | ✅ | ~~Victoires affichées en violet — convention culturellement incorrecte.~~ → **Résolu 2026-05-01** : `text-yellow-600 dark:text-yellow-400` + icône `<Trophy>` jaune. | — |
| 45 | ✅ | ~~Mobile kebab `size="sm"` → h-8 = 32 px, sous la cible 44 px.~~ → **Résolu 2026-05-01** : `size="icon" className="size-11"` → 44 px. | — |

### Empty state — à étudier

```tsx
<div className="text-center py-16">
  <UsersThree className="w-16 h-16 mx-auto mb-4 text-white/30" />
  <h3 className="text-xl font-semibold mb-2">Aucun joueur</h3>
  <p className="text-white/60 mb-6">Ajoutez votre premier joueur pour commencer</p>
  <AddPlayerDialog ... />
</div>
```

C'est **le pattern modèle** : icône grande, hiérarchie title/description, CTA inline. À reproduire sur `GamesPageView` (qui a un div vide) et dans les stats vides.

### Accessibilité

- `alt=""` sur les avatars → correct (nom visible à côté).
- `aria-label` sur les boutons d'action : présent. Bien.
- Les cartes ne sont pas navigables au clavier (pas focusables) mais, vu qu'elles ne sont pas cliquables non plus, c'est cohérent.

### Résumé

La page montre que l'équipe **peut** produire du code cohérent. Si le pattern `darkMode ? :` était généralisé, ce serait déjà la moitié du travail. Seule faiblesse : l'avatar fallback Unsplash, à remplacer urgemment.

---

## 7. New Play (`plays/NewPlayView.tsx`)

**La page la plus critique du projet** : **595 lignes** dans un seul composant, formulaire long, mélange de langues, plusieurs bugs de thème, modèle mental discutable (checkbox pour un winner unique).

### Première impression

Formulaire vertical. Sur desktop, le hero (sélecteur de jeu, mode) est en grande carte ; ensuite viennent Joueurs, Scoring (qui change de forme selon le mode), Détails session. Complexité **justifiée** par le domaine (competitive / cooperative / campaign / hybrid ont chacun leurs champs) — mais l'exécution souffre.

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 46 | ✅ | ~~**Mélange français / anglais hardcodé**.~~ → **Résolu 2026-05-01** : toutes les strings hardcodées externalisées en keys i18n via `t()` + `.replace()` pour les paramétriques (`{min}`, `{max}`). Nouvelles keys ajoutées dans `en.json` : `sessions.players.min_required`, `sessions.players.max_reached`, `sessions.cooperative.objectives.*`, `sessions.competitive.no_winner`, `sessions.leave.*`, `sessions.draft.restored`. | — |
| 47 | ✅ | ~~**Toutes les cartes suivantes hardcodées sombre** (`bg-white/10 backdrop-blur-md border-white/20 text-white`).~~ → **Résolu 2026-05-01** : toutes les cartes migrées vers tokens shadcn `bg-card border-border text-foreground text-muted-foreground`. Plus aucune valeur hardcodée dans `NewPlayView`. | — |
| 48 | ✅ | ~~**Winner désigné par checkbox, pas par radio** — sémantique HTML fausse.~~ → **Résolu 2026-05-01** : `<RadioGroup value={winnerId} onValueChange={setWinnerId}>` avec option `value=""` « Aucun vainqueur / Match nul » séparée par une bordure. `radio-group.tsx` installé dans `src/shared/components/ui/`. Sémantique correcte, navigation clavier (flèches ↑↓), accessible. | — |
| 49 | ✅ | ~~**Pas d'auto-sauvegarde, pas d'avertissement avant navigation**.~~ → **Résolu 2026-05-01** : (a) draft auto-save `localStorage` clé `newPlayDraft`, TTL 24 h, restauré au montage avec toast `sessions.draft.restored` ; (b) `beforeunload` handler si `isDirty` ; (c) `<AlertDialog>` sur retour/cancel si form modifié (`requestNavigation` + `confirmLeave`/`cancelLeave`). Draft effacé à la soumission et à la confirmation de départ. | — |
| 50 | ✅ | ~~Validation éclatée : erreurs affichées dans les `CardHeader` respectifs, loin des champs en cause.~~ → **Résolu 2026-05-02** : messages d'erreur déplacés sous le RadioGroup (inline, proche des champs). | — |
| 51 | ✅ | ~~Champ « Durée » : pas d'astérisque `*obligatoire` tant que l'erreur ne s'est pas déclenchée.~~ → **Résolu 2026-05-02** : astérisque statique + htmlFor/id. | — |
| 52 | ✅ | ~~Coopératif : `Team Success = false` + saisir un score d'équipe = cognitivement contradictoire.~~ → **Résolu 2026-05-02** : hint 'Session perdue — score optionnel' affiché quand teamSuccess=false. | — |
| 53 | 🟡 | Écran **très long** : 6-7 cartes empilées verticalement en mobile, ~2500 px de scroll total. Pas de stepper, pas de progress bar, pas d'indication « vous êtes à l'étape 3 sur 5 ». | **Transformer en wizard** 4 étapes : (1) Jeu + mode ; (2) Joueurs ; (3) Scores (contenu dépendant du mode) ; (4) Détails session. Avec `<Progress value={step * 25}>` visible en haut. Auto-save par étape. Réduction de charge cognitive → meilleur taux de complétion. |
| 54 | ✅ | ~~`SelectContent` hardcodé sombre (`bg-slate-800 border-white/20 text-white`).~~ → **Résolu 2026-05-01** (Sprint B §47) : toutes les `className` retirées des `<SelectContent>` de `NewPlayView`. Shadcn applique `bg-popover text-popover-foreground` par défaut. | — |
| 55 | 🟢 | Badges modes (`"Competitive"`, `"Cooperative"`, `"Campaign"`, `"Hybrid"`) avec couleurs différentes (`bg-orange-500/20`, `bg-green-500/20`, `bg-purple-500/20`, `bg-blue-500/20`). Mais le mapping ne correspond ni à `GamesPageView` ni à `GameStatsView`. | Voir recommandation transverse (§ 14.2) — token sémantique unique. |
| 56 | ✅ | ~~`Objectives` : la checkbox « completed » est à droite du champ texte objectif + points.~~ → **Résolu 2026-05-02** : checkbox déplacée à gauche, layout compact une ligne : checkbox | description | points | pts | trash. | — |
| 57 | ✅ | ~~`<Input type="number" min={0} max={999}>` : `""` devient `0` instantanément, l'utilisateur ne peut pas vider le champ.~~ → **Résolu 2026-05-02** : affiche `''` quand score=0 (`|| ''`), handleScoreChange accepte la saisie intermédiaire vide. | — |
| 58 | ✅ | ~~Les `<Label>` ne sont pas toujours liés aux `<Input>` par `htmlFor`.~~ → **Résolu 2026-05-02** : htmlFor/id ajoutés sur Duration et Notes. | — |

### Accessibilité — résumé

- Cooperative checkbox `data-[state=checked]:bg-green-500` : contraste OK en dark, tangent en light.
- Validation en temps réel : pas de `aria-live="polite"` sur la zone d'erreur → AT ne suit pas.
- Tous les boutons d'action finale (`"Enregistrer"`, `"Annuler"`) devraient être en bas **sticky** en mobile (actuellement ils défilent).

### Résumé

La page qui **mérite le plus d'investissement**. En ordre : i18n (§ 46), refactor thème (§ 47), winner en RadioGroup (§ 48), auto-save (§ 49), puis wizard (§ 53). Un sprint entier.

---

## 8. BGG Search (`bgg/BGGSearch.tsx`)

Modal intégrable de recherche sur BoardGameGeek (utilisé dans `AddGameDialog` et dans Settings pour import).

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 60 | ✅ | ~~Feature astucieuse (ID numérique direct) mais aucun hint ne l'explique.~~ → **Résolu 2026-05-02** : hint sous l'input — nom ou ID BGG numérique. | — |
| 61 | 🟡 | Enrichment séquentiel des thumbnails : boucle `for (const result of results) { await bggApiService.getGameDetails(result.bgg_id) }`. Pour 20 résultats × ~400 ms/req = **~8 secondes** avant que toutes les vignettes soient chargées. L'utilisateur voit les vignettes apparaître une par une. | (a) `Promise.allSettled` avec concurrence limitée (3-5 en parallèle) via `p-limit` ou implémentation maison ; (b) `AbortController` propre au lieu du flag ref actuel (les fetches continuent en coulisses même si on invalide). |
| 62 | ✅ | ~~L'icône `<Link>` ressemble à un bouton d'ouverture externe mais ne fait rien.~~ → **Résolu 2026-05-02** : icône Link → vrai `<a target='_blank'>` vers boardgamegeek.com/{id}, stopPropagation pour ne pas sélectionner le jeu. | — |
| 63 | ✅ | ~~Couleurs hardcodées `slate-*` dans les cards et placeholders.~~ → **Résolu 2026-05-02** : bg-card border-border hover:bg-muted/50, placeholder bg-muted, textes → tokens. | — |
| 64 | ✅ | ~~Spinner `<Circle>` sans `aria-label` ni `role="status"`.~~ → **Résolu 2026-05-02** : role='status' aria-live='polite' sur loading block, aria-hidden sur spinners. | — |
| 65 | ✅ | ~~Footer `text-white/40` : contraste échec AA.~~ → **Résolu 2026-05-02** : text-muted-foreground (contraste suffisant en light et dark). | — |
| 66 | 🟢 | 12 ternaires `darkMode ? :` dans ce seul composant. Pattern industrialisable. | Voir § 14.1. |

### Cohérence des states

- `isSearching` : spinner dans le bouton ✅
- `isLoadingDetails` : spinner centré avec texte ✅
- `searchError` : banner rouge avec texte ✅
- `empty` (query ≠ "" mais 0 résultats) : message centré ✅

Les 4 états sont couverts, ce qui est bien. L'infra existe — il manque juste la traduction et l'a11y.

### Résumé

Composant **fonctionnellement correct**, identité teal restaurée. Priorité : rendre le hint visible (§ 60) et rendre le lien BGG utile (§ 62).

---

## 9. Stats — Game (`stats/game/GameStatsView.tsx`)

### Première impression

Dashboard stats ambitieux : carte principale (jeu sélectionné ou vue globale), liste de jeux, popularité, tendances scores, distribution par mode, top winners, sessions récentes. **Trop** de sections pour un écran mobile — 7 cartes empilées, ~2200 px.

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 67 | 🔴 | **Feature morte** : les props `selectedPeriod` et `setSelectedPeriod` sont déstructurées avec `_` prefix (convention unused) — `const { _selectedPeriod, _setSelectedPeriod, ... } = props`. La feature « week / month / year / all time » est **câblée dans le hook parent** mais le UI pour la déclencher n'existe pas dans la View. Le filtre « depuis 7 jours » annoncé au design n'est jamais exposé à l'utilisateur. | Deux options équivalentes : (a) **implémenter** : ajouter un `<SegmentedControl>` ou `<Tabs>` en haut (`['7j', '30j', '1 an', 'Tout']`), binder sur `selectedPeriod`. (b) **retirer** : supprimer du hook et des props pour nettoyer. Laisser la feature zombie pourrit le code. |
| 68 | 🟡 | Bar chart « Score Trend » : rendered en `<div>` avec `title={...}` au survol. Axes absents, labels d'échelle absents, tooltip desktop-only (mobile tap ne le déclenche pas). → **Décoratif, pas informationnel.** | Migrer vers `recharts` (déjà dans `components.json` des plugins shadcn, donc `<ChartContainer>` / `<BarChart>` disponibles). Axes X (dates), Y (score), tooltip interactif au tap. |
| 69 | 🟡 | Distribution « Session Types » : `hybrid=vert` ici, mais `hybrid=orange` dans `GamesPageView` et `hybrid=bleu` dans `NewPlayView`. `cooperative=bleu` (cohérent avec Games) mais `competitive=rouge` (cohérent). | Token unique (voir § 14.2). |
| 70 | 🟡 | `topWinners` : `getMedalClass(index)` renvoie or/argent/bronze pour `index` 0-2, et au-delà ? Si > 3 winners affichés, comportement indéterminé (fallback à une couleur neutre ? bug silencieux ?). | Vérifier le fallback ; si `index >= 3`, renvoyer un cercle neutre `bg-muted` avec le numéro en `text-muted-foreground`. Tester avec 5+ items. |
| 71 | 🟡 | Image fallback pour jeu sans thumbnail : URL Unsplash `photo-1606092195730-...` — même problème qu'au § 42, dépendance externe + fake identité. | Placeholder SVG interne : carte de jeu générique stylisée (damier + meeple). Fichier `src/shared/assets/game-placeholder.svg`. |
| 72 | 🟢 | Transition non-animée entre « vue globale » et « jeu sélectionné » (`isGlobalStats` bascule). L'utilisateur voit un flash de contenu différent. | `<AnimatePresence>` de framer-motion (déjà installé via tw-animate-css ?) + fade 200ms. |
| 73 | 🟢 | `ChartBar className="w-5 h-5 text-primary"` dans un `<h2>` : décoratif, bien, OK. |   |

### Accessibilité

- Les bars du chart sont des `<div>` avec `title={...}` → non lu par lecteur d'écran. Ajouter `aria-label` explicite : `<div role="img" aria-label="Score: 42 points, date: 14 avril">`.
- Sections sans landmark (`<section aria-labelledby>`).

### Résumé

Vitrine ambitieuse, implémentation à moitié. **Un dashboard qui montre un filtre non fonctionnel et un chart décoratif pue le « coming soon »**. Choisir : investir pour livrer ou élaguer.

---

## 10. Stats — Player (`stats/player/PlayerStatsView.tsx`)

### Constats détaillés

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 76 | 🟡 | Sur la vue globale (`!selectedPlayer`), deux sections sont affichées successivement : « Top Players » (liste triée par score) ET « Recent Activity » (liste des dernières actions). **Les deux utilisent le même composant `ActivityRow` avec des données qui se chevauchent** — un top player peut apparaître deux fois, une fois dans chaque liste. Scroll long, contenu redondant. | Fusionner en une section unique « Activité joueurs » avec filtres (`[Top de la semaine] [Top all-time] [Plus récents]`). Gain : -1 card (~200 px de scroll). |
| 77 | 🟡 | 4 stat cards en `grid-cols-2` + `p-6` chacune = ~400 px de hauteur totale sur mobile. **Plus de la moitié de la hauteur d'écran pour 4 chiffres.** | Passer à `p-4` (gain ~40%), ou design ticker horizontal scrollable. |
| 78 | 🟡 | Quand pas de joueur sélectionné, la section « Stats globales » n'affiche que **2 cartes** (`totalPlayers`, `avgScore`) dans une `grid-cols-2`. Les deux cartes prennent tout l'écran pour 2 nombres. | Compacter : ligne horizontale `<div className="flex gap-4">` avec stats inline, icône + valeur + label en 1 ligne. |
| 79 | 🟢 | Classement `rounded-full bg-gradient-to-r from-yellow-400 to-orange-500` avec `text-black` : contraste OK (texte noir sur jaune saturé ≈ 10:1). |   |
| 80 | 🟢 | `ActivityRow` rendered avec `<div>` non focusable. Si elles doivent devenir cliquables (stats détail player), `<button>` + `aria-label`. |   |
| 81 | 🟢 | Fallback avatar Unsplash identique à § 42 — même recommandation : générateur d'avatar-initial. |   |

### Résumé

Améliorations principales restantes : fusionner les sections Top + Recent (§ 76), compacter les stat cards (§ 77-78).

---

## 11. Settings (`settings/SettingsPageView.tsx`)

### Première impression

La page la plus « formulaire » de l'app. Organisation par sections (Préférences, Données, À propos, Session). La double couleur est bien prise en charge dans la structure `cardClass`.

### Constats détaillés

Tous les findings résolus :

- ✅ §82 — Spacer `<div aria-hidden="true" />` avec `w-10 h-10` symétrique.
- ✅ §83 — Déjà résolu : bordures utilisaient `dark:border-white/10` (theme-aware).
- ✅ §84 — File-picker BGG refactorisé : `useRef` + `onClick(() => ref.current?.click())`, plus de `label` trick ni `pointer-events-none`.
- ✅ §85 — Retry : `<button>` raw → `<Button variant="link">`.
- ✅ §87 — `toLocaleString('fr-FR')` → `toLocaleString(navigator.language)`.
- ✅ §88 — Logout : styles custom → `variant="destructive"`.

### Résumé

Section entièrement résolue.

---

## 12. Dialogs — audit complet

Tous les dialogs vivent dans `src/features/*/dialogs/`. Ils se divisent en trois familles :
- **Dialogs standards** (shadcn `<Dialog>`) : Add/Edit Game, Add/Edit Player, Add/Edit Expansion, Add/Edit Character.
- **Alert dialogs** (shadcn `<AlertDialog>`) : Delete Game, Delete Player, Delete Expansion, Delete Character.
- **Modals intégrés** : `BGGSearch` (ouvert depuis AddGameDialog).

### 12.1 Vue d'ensemble — problèmes systémiques

Trois patterns de qualité coexistent dans les dialogs :

| Qualité | Exemples | Caractéristiques |
|---|---|---|
| 🟢 **Bonne** | `DeleteExpansionDialog`, `DeleteCharacterDialog`, `DeleteGameDialog`, `DeletePlayerDialog`, `EditPlayerDialog` | Theme-aware, i18n via `t()`, tokens `bg-destructive` |
| 🟡 **Moyenne** | `AddPlayerDialog`, `ExpansionDialogs`, `CharacterDialogs` | Wrapper theme-aware mais form fields hardcodés dark |
| 🔴 **Mauvaise** | `AddGameDialog`, `EditGameDialog` | Inputs hardcodés dark, title/boutons partiellement hardcodés |

**La même app contient 3 niveaux de qualité selon la personne / la période de développement**. C'est le symptôme d'une absence de dialog template partagé. Créer un `<FormDialog>` + `<ConfirmDialog>` normalisés résoudrait la quasi-totalité des findings ci-dessous.

### 12.2 `AddGameDialog.tsx` — 775 lignes

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 89 | 🔴 | Dialog de 775 lignes avec ~20 champs et un embed `BGGSearch`. **Tous les inputs sont hardcodés** `bg-slate-700 border-slate-600 text-white placeholder:text-white/50` — même si le dialog accepte la prop `darkMode`. En mode clair, on voit un dialog à fond clair + inputs noirs. Incohérence interne. | Retirer toutes les classes de couleur des inputs, laisser le shadcn `<Input>` utiliser ses tokens (`bg-transparent border-input`). |
| 90 | 🔴 | BGGSearch embed dans un wrapper `className="p-4 bg-slate-700 rounded-lg border border-slate-600"` — hardcodé dark. En mode clair, carré sombre dans dialog clair. | Retirer le wrapper ou tokens. |
| 91 | 🔴 | Strings anglais hardcodés : `"Has character roles"`, `"Characters/Roles"`, `"Add Character"`, `"Remove"`, `"Name"` (label), `"Key (slug)"`, `"Avatar URL"`, `"Description"`. Une partie des labels a `t()`, l'autre non — trilingue interne au formulaire. | i18n systématique, clés `games.form.field.*` et `games.form.character.*`. |
| 92 | 🟡 | Trigger button : `<Button aria-label="Open add game dialog" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">` — hardcodé teal gradient, même en mode clair. Le gradient fort fonctionne en dark mais écrase un mode clair calme. | Theme-aware ou `variant="default"` du shadcn. |
| 93 | 🟡 | Submit button : `<Button className="w-full bg-emerald-600 hover:bg-emerald-700">` — hardcodé emerald. Pourquoi emerald et pas teal comme le trigger ? Inconsistance dans le dialog même. | Standardiser : soit tout teal, soit tout emerald. Recommandation : `variant="default"` (teal via `--primary`). |
| 94 | 🟡 | Erreurs de validation : `<p className="text-red-400 text-sm mt-1">{errors.name}</p>` hardcodé → illisible en mode clair. | `text-destructive` (token). |
| 95 | 🟡 | `onInteractOutside={(e) => e.preventDefault()}` : le dialog ne se ferme **pas** en cliquant à l'extérieur. Décision volontaire (protection data-loss) mais **aucune indication** à l'utilisateur. Un utilisateur clique dehors 3 fois, s'énerve, ne sait pas comment sortir. | Garder le comportement mais ajouter un message subtil `"Cliquez sur Annuler pour fermer sans enregistrer"` en footer, OU afficher un `<AlertDialog>` de confirmation si clic extérieur détecté. |
| 96 | 🟡 | Parsing des expansions via regex sur textarea : `const match = text.match(/^([^(]+)\((\d{4})\)$/)` pour extraire nom et année. Format attendu : `"Gloomhaven: Jaws of the Lion (2020)"`. Mais l'utilisateur peut taper `"Gloomhaven: Jaws of the Lion, 2020"` ou `"2020 - Gloomhaven"` — le regex échoue silencieusement, l'expansion perd son année. | (a) Afficher un hint visible `"Format : Nom (AAAA) — une par ligne"` au-dessus du textarea ; (b) feedback visuel : ligne verte si parsed, rouge si échec. |
| 97 | 🟢 | 20+ champs dans un seul form long → scroll vertical + UX fatigante. | Sections repliables `<details>`  ou tabs (`Général` / `Joueurs & durée` / `BGG` / `Expansions` / `Characters`). |

### 12.3 `EditGameDialog.tsx`

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 98 | 🔴 | **Quasi-tous les labels hardcodés anglais** : `"Game Name *"`, `"Image URL"`, `"Thumbnail URL"`, `"Min Players"`, `"Max Players"`, `"Duration"`, `"Min Age"`, `"Playing Time"`, `"Min Playtime"`, `"Max Playtime"`, `"Difficulty"`, `"Game Modes"`, `"Category"`, `"Designer"`, `"Publisher"`, `"Year"`, `"BGG Rating"`, `"Weight (1-5)"`, `"Description"`, `"Has expansions"`, `"Has character roles"`. **Exception** : `"Est une extension"` (fr). Trilingue + anglais dominant. | i18n complet via clés `games.form.field.*`. |
| 99 | 🔴 | Description dialog hardcodée : `"Update game information and details."` (en). | i18n. |
| 100 | 🔴 | Labels en mode clair : `text-blue-700`. **Bleu**, même problème que BGG Search. Identité teal rompue. | `text-foreground` (token) ou `text-teal-700` en clair. |
| 101 | 🔴 | Inputs hardcodés `bg-slate-700 border-slate-600 text-white` sur quasi tous les champs. Même critique que AddGameDialog. | Retirer toutes les classes de couleur. |
| 102 | 🟡 | `SelectItem` difficulté : hardcodé anglais `"Beginner"`, `"Intermediate"`, `"Expert"`. | i18n. |
| 103 | 🟡 | Pas de confirmation avant fermeture si `isDirty` (form modifié mais non soumis). Un clic sur Cancel → modifications perdues silencieusement. | Même pattern qu'en § 49. |

### 12.4 `DeleteGameDialog.tsx` — ✅ Résolu

Réécrit sur le modèle de `DeleteExpansionDialog` : `useLabels()` + `t()` pour toutes les strings, tokens shadcn par défaut, plus de classes hardcodées.

### 12.5 `AddPlayerDialog.tsx`

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 108 | 🟢 | Validation utilisée correctement avec `t()` : `t('players.form.validation.name_required')`. **Bonne pratique** — exemple à reproduire ailleurs. |   |
| 109 | 🟢 | Comportement intelligent : auto-fill du pseudo à partir du player_name tant que l'utilisateur n'a pas tapé dans le champ pseudo. UX positive. |   |
| 110 | 🟡 | Description dialog hardcodée anglais : `"Create a new player profile by filling out the form below."`. Le title, lui, utilise `t('players.add_dialog.title')`. Incohérence interne. | i18n description. |
| 111 | 🟡 | Labels hardcodés français : `"Nom *"`, `"Pseudo *"`, `"Avatar URL"`. Les placeholders aussi : `"Prénom ou nom complet"`, `"Identifiant unique"`. Si l'app bascule en anglais, labels restent FR. | i18n. |
| 112 | 🟡 | Labels en mode clair : `text-blue-700`. Même problème que § 100. | Tokens. |
| 113 | 🔴 | Trigger en mode clair : `"bg-gradient-to-r from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-blue-700"`. **Gradient bleu** — casse l'identité teal/emerald. En mode sombre, le trigger est teal (cohérent), mais le dev a choisi bleu pour le mode clair. Bizarre et **visible immédiatement**. | Tokens teal : `"bg-teal-100 hover:bg-teal-200 text-teal-700"` ou `variant="default"`. |

### 12.6 `EditPlayerDialog.tsx` — ✅ Résolu

Régression annulée : validations et labels passés via `t()`, title et boutons i18n, plus de strings trilingues. Reste § 120 (trigger color) qui est couvert par § 14.1.

### 12.7 `DeletePlayerDialog.tsx` — ✅ Résolu

Réécrit sur le modèle de `DeleteExpansionDialog`, identique à § 12.4.

### 12.8 `ExpansionDialogs.tsx` (Add / Edit / Delete)

3 dialogs dans un fichier. Qualité moyenne.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 122 | 🟢 | Le `<DialogContent>` wrapper est theme-aware avec `darkMode ? ... : ...`. Bon. |   |
| 123 | 🟡 | **Labels hardcodés** : `<Label className="text-white">`. En mode clair, label blanc sur fond clair = invisible. | `className="text-foreground"`. |
| 124 | 🟡 | **Inputs hardcodés** : `"bg-slate-700/50 border-slate-600 text-white"`. Même problème qu'AddGameDialog. | Tokens. |
| 125 | 🟡 | Cancel button hardcodé : `"border-slate-600 text-slate-300 hover:bg-slate-700/50"`. | `<AlertDialogCancel>` sans class → utilise `buttonVariants({ variant: 'outline' })`. |
| 126 | 🟢 | `<AlertDialogAction>` pour la suppression utilise `bg-destructive hover:bg-destructive/90` (tokens). **Bonne pratique** — c'est la seule chose qui fonctionne en light & dark. |   |

### 12.9 `CharacterDialogs.tsx`

Même structure qu'`ExpansionDialogs`, mêmes findings.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 127 | 🟡 | Même patchwork theme-aware wrapper / form fields hardcodés. | Voir § 122-126. |
| 128 | 🔴 | **Champ `key` exposé dans le formulaire utilisateur**. Un slug technique (ex. `elf_mage`) n'a pas sa place dans l'UX finale — l'utilisateur ne comprend pas la différence entre « Name » et « Key ». | Auto-générer la key à la soumission : `slugify(character.name)`. Masquer le champ. Si besoin de contrôle avancé, `<details>` « Options avancées ». |

### 12.10 Synthèse dialogs

**Ce qu'il reste à faire** :

1. **`<FormDialog>`** — un wrapper template theme-aware, i18n, avec `title`, `description`, `children` (slots form), `onSubmit`, `onCancel`, et un paramètre `confirmDirtyOnClose`. Permettrait de refactorer `AddGameDialog` et `EditGameDialog` (~800 lignes combinées).
2. **Aligner `AddGameDialog` et `EditGameDialog`** sur les conventions établies par les Delete dialogs (tokens shadcn, `useLabels`, plus de hardcoded colors).

Les Delete dialogs et `EditPlayerDialog` ont été refactorisés et servent désormais de référence. `AddGameDialog` et `EditGameDialog` restent les dettes principales.

---

## 13. `shared/components/ui` — audit des primitives

Le dossier contient **45 fichiers** shadcn. Analyse d'utilisation (grep dans `src/features`, `src/pages`, `src/shared` hors `/ui/`) :

### 13.1 Primitives effectivement utilisées

| Composant | Usages | Notes |
|---|---|---|
| `button.tsx` | 19 | Principal — bien |
| `input.tsx` | 12 | — |
| `label.tsx` | 9 | — |
| `card.tsx` | 7 | Sous-utilisé : les « cartes » manuelles dans les views ne passent pas par ce composant |
| `dialog.tsx` | 7 | — |
| `tooltip.tsx` | 7 | — |
| `textarea.tsx` | 6 | — |
| `alert.tsx` | 4 | — |
| `alert-dialog.tsx` | 4 | — |
| `select.tsx` | 4 | — |
| `checkbox.tsx` | 3 | — |
| `badge.tsx` | 3 | — |
| `dropdown-menu.tsx` | 3 | — |
| `skeleton.tsx` | 1 | Très sous-utilisé (cf. § 14.9) |
| `separator.tsx` | 1 | — |
| `sheet.tsx` | 1 | — |
| `switch.tsx` | 1 | — |
| `tabs.tsx` | 1 | `GameDetailView` uniquement |
| `toggle.tsx` | 1 | — |

### 13.2 Primitives **non utilisées** (26 fichiers, ~2500 lignes de code mort)

Le dossier contient 26 composants **jamais importés nulle part** :

```
sidebar (723 lignes !)      drawer (130)              navigation-menu (168)
menubar (276)               breadcrumb (110)          pagination (125)
carousel (261)              hover-card                command (177)
input-otp (77)              context-menu (254)        accordion (64)
aspect-ratio                toggle-group (73)         collapsible
calendar (74)               chart (351)               slider (63)
popover                     sonner                    progress
radio-group                  table (114)              scroll-area (58)
avatar (53)                  form (165)
```

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 129 | 🟡 | **~2500 lignes de code shadcn non utilisé** inflatent le bundle (tree-shaking devrait les éliminer mais seulement si importés par le barrel, sinon TS vérifie quand même). Pire : ces fichiers doivent être maintenus (typing shadcn, majs Radix). | (a) Supprimer tout ce qui n'est pas importé. Si besoin futur, `npx shadcn add X` regénère instantanément. (b) Si on garde : documenter dans un README `ui/README.md` la liste des composants disponibles et des conventions. |
| 130 | 🔴 | `sidebar.tsx` (723 lignes, 26% du dossier) : **totalement non utilisé** mais gère un Context, un cookie, des hooks, des mobile breakpoints. Dette technique énorme au repos. | Supprimer ou utiliser (en desktop ≥ lg, remplacer le bottom-nav/header par un sidebar). |
| 131 | 🟡 | `chart.tsx` (351 lignes) : infrastructure recharts prête, **pas utilisée** — alors que `GameStatsView` affiche des bar charts faits main en `<div>` (voir § 68). | Deux options : utiliser `chart.tsx` pour `GameStatsView` (cohérent), ou supprimer. La première est meilleure. |
| 132 | 🟡 | `form.tsx` (165 lignes) : wrapper react-hook-form + FormField / FormItem / FormLabel / FormMessage. **Pas utilisé** — alors que `AddGameDialog`, `EditGameDialog`, `NewPlayView` font tous du form avec du `useState` manuel + validation custom. | Migrer les formulaires vers `<Form>` + `<FormField>`. Gain : validation Zod intégrée, gestion d'erreurs standardisée, `htmlFor` auto-câblé. Chantier : ~1 jour par form. |
| 133 | 🟡 | `radio-group.tsx` : pas utilisé. Directement pertinent pour fixer le § 48 (winner en radio). | Utiliser pour `NewPlayView`. |
| 134 | 🟡 | `progress.tsx` : pas utilisé. Pertinent pour le wizard `NewPlayView` (§ 53). | Utiliser. |
| 135 | 🟡 | `skeleton.tsx` : 1 usage seulement sur toute l'app. **Alors que les pages principales ne montrent aucun état de chargement** (§ 14.9). | Pousser l'adoption (Dashboard, Games, Players, Stats). |
| 136 | 🟢 | `avatar.tsx` : pas utilisé, mais `<img>` manuels partout avec même pattern. Migrer vers `<Avatar><AvatarImage><AvatarFallback>` unifierait (+ fixerait § 42 avec le fallback propre). |   |

### 13.3 Analyse qualité des primitives utilisées

Chaque primitive ci-dessous est **du shadcn standard** — avant d'en critiquer une, sachez qu'elle est maintenue par la communauté shadcn/Radix. Les remarques portent sur l'**usage** et les **détails maison**.

#### 13.3.1 `button.tsx` ✅

- **Bien** : variants bien définis (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`), CVA.
- **Bien** : `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` — **le focus visible est correct** au niveau primitive (contrairement à ce qu'on pourrait croire en voyant les composants custom qui overrident).
- **Bien** : `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive` — support invalid state.
- ⚠️ **Taille** : `default: h-9 px-4 py-2` = 36 px — **sous la cible 44 px** de iOS HIG. `icon: "size-9"` (36×36) idem.
- ⚠️ Pas de variante `destructive-outline` alors que le pattern existe ailleurs (Settings logout, § 88).

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 137 | 🟡 | Sizes default/icon sous la cible tactile 44 px. | Ajouter une size `touch: "h-11 px-5"` pour les cibles mobiles principales, ou monter `default` à `h-10`. |
| 138 | 🟢 | Manque `destructive-outline` variant. | Ajouter : `"border border-destructive text-destructive hover:bg-destructive/10"`. |

#### 13.3.2 `input.tsx` ✅

- **Bien** : `placeholder:text-muted-foreground` (token), `border-input`, `focus-visible:ring-[3px]`, `aria-invalid:...`, `md:text-sm` (responsive font size).
- **Bien** : `dark:bg-input/30` — distinct bg dark.
- ✅ Zéro couleur hardcodée.

**Usage** : le problème n'est pas le primitive, c'est que **presque toutes les occurrences d'Input dans les dialogs et views l'overrident avec `className="bg-slate-700 border-slate-600 text-white"`**. Les développeurs contournent les tokens → les bugs de thème reviennent. Voir § 101.

#### 13.3.3 `label.tsx` ✅

- Minimal, `text-sm leading-none font-medium`, gère `peer-disabled`. OK.
- Pas de couleur → hérite du parent. **C'est volontaire**, mais partout dans l'app les labels sont override avec `text-white` ou `text-blue-700` → couleurs inconsistantes.

#### 13.3.4 `card.tsx` ✅

- Structure : `Card / CardHeader / CardTitle / CardDescription / CardAction / CardContent / CardFooter`.
- Tokens : `bg-card text-card-foreground`.
- **Usage très sous-optimal** : les views reconstruisent des cartes manuellement en `<div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">` **partout** au lieu d'utiliser `<Card>`. Résultat : impossible de changer le look des cartes globalement.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 139 | 🟡 | Card primitive sous-utilisée : ~30+ occurrences de `<div className="bg-white/10 backdrop-blur-md ...">` dans les views. | Migrer vers `<Card>` + variants. Créer des variants `<Card variant="glass">` et `<Card variant="solid">` si besoin. |

#### 13.3.5 `dialog.tsx` ✅

- Overlay : `bg-black/50`, OK.
- Content : `bg-background` (token), `max-w-[calc(100%-2rem)] sm:max-w-lg`, close button intégré en absolute top-right avec `<XIcon>`.
- **Bien** : close button a `sr-only "Close"` pour lecteur d'écran.
- ⚠️ `sm:max-w-lg` = 512 px : sur un écran tablette ou desktop, **pas de max-width plus large** pour les gros formulaires (AddGameDialog en particulier qui a 20+ champs). → scroll vertical forcé.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 140 | 🟡 | `max-w-lg` trop étroit pour les gros dialogs. | Support `size` prop : `sm: 512`, `md: 768`, `lg: 1024`. Pour AddGameDialog, utiliser `md` minimum. |
| 141 | 🟢 | Close button : focus-ring à `focus:ring-ring focus:ring-2 focus:ring-offset-2` — classique, bien. Vérifier contraste du ring sur `bg-background` light et dark. |   |

#### 13.3.6 `alert-dialog.tsx` ✅

- `AlertDialogAction` utilise `buttonVariants()` (donc `default` = primary) — attention : un AlertDialog est souvent **destructif** (delete), donc par défaut l'action ressort en primary teal au lieu de destructive rouge. Il faut explicitement passer `className={buttonVariants({ variant: 'destructive' })}` à chaque usage.
- `AlertDialogCancel` = `buttonVariants({ variant: 'outline' })`. OK.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 142 | 🟡 | `AlertDialogAction` par défaut en teal — piège pour les dialogs de suppression. | Créer un wrapper `<DestructiveAlertDialog>` qui force `variant="destructive"` sur Action, ou documenter en commentaire header du fichier. |

#### 13.3.7 `select.tsx` ✅

- Trigger : tokens, focus-visible, aria-invalid, responsive size (`sm`/`default`).
- Content : `bg-popover text-popover-foreground` — **theme-aware automatiquement**.
- ⚠️ Usage : partout dans les views, `<SelectContent className="bg-slate-800 border-white/20">` override les tokens. Même problème qu'Input.

#### 13.3.8 `checkbox.tsx` ✅

- Tokens : `border-input`, `data-[state=checked]:bg-primary`, `focus-visible:ring-[3px]`.
- Taille : `size-4` = 16×16 px — **très petit**. Avec label adjacent, zone cliquable totale OK, mais seul = difficile à tapper.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 143 | 🟡 | Checkbox 16×16 + padding label implicite → zone tactile limite. | S'assurer que chaque checkbox a un `<Label>` adjacent cliquable. Le Radix Checkbox + Radix Label gèrent ça si utilisés ensemble. |

#### 13.3.9 `switch.tsx` ✅

- Taille thumb : `h-[1.15rem] w-8` = 18.4×32 px. OK visuellement.
- Tokens `data-[state=checked]:bg-primary` : OK.

#### 13.3.10 `tabs.tsx` ✅

- Tokens `bg-muted`, `data-[state=active]:bg-background`.
- `h-9` sur TabsList → 36 px. Sous 44 px.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 144 | 🟡 | Tabs h-9 sous la cible tactile. | Option size `lg` à `h-11` pour tabs mobile principales. |

#### 13.3.11 `tooltip.tsx` ✅

- `TooltipProvider delayDuration={0}` par défaut — **tooltip s'affiche instantanément au hover**. UX agressive : bouge la souris → un tooltip te saute au visage. Le default shadcn en général est `delayDuration=700`.
- Tokens : `bg-primary text-primary-foreground` pour le tooltip content.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 145 | 🟡 | `delayDuration={0}` — tooltip instantané = bruit UX. | Monter à `delayDuration={500}` (2× la vitesse de lecture humaine de « j'ai hésité et je veux l'info »). |

#### 13.3.12 `dropdown-menu.tsx` ✅

- Content : `bg-popover text-popover-foreground` — theme-aware auto.
- Item : `data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10` — variant destructive intégré. ✅
- ⚠️ Usage : override par `bg-slate-800 border-slate-700` dans les views (voir § 21).

#### 13.3.13 `textarea.tsx` ✅

- Tokens, focus-visible, aria-invalid, `field-sizing-content` (auto-resize modern CSS). OK.
- ⚠️ Usage overridé partout avec `bg-slate-700`.

#### 13.3.14 `badge.tsx` ✅

- Variants : `default`, `secondary`, `destructive`, `outline`.
- Manque : variants sémantiques custom pour les modes de session (competitive/coop/campaign/hybrid). Actuellement chaque view recrée ses badges avec des classes inline hétéroclites.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 146 | 🟡 | Badge n'a pas de variants `mode-competitive`, `mode-cooperative`, etc. Chaque view recrée ses couleurs (§ 27, § 55). | Étendre `badgeVariants` CVA pour inclure `variant: { competitive, cooperative, campaign, hybrid }`. Source unique. |

#### 13.3.15 `alert.tsx` ✅

- Variants `default`, `destructive`. Tokens `bg-card text-card-foreground`.
- ⚠️ Pas de variant `warning` / `info` / `success` — souvent utilisés dans les vrais produits.

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 147 | 🟢 | Étendre alert avec `warning` et `info` variants pour BGG import (qui affiche des statuts). |   |

#### 13.3.16 `skeleton.tsx`, `separator.tsx`, `sheet.tsx`, `toggle.tsx`

- Tous standards shadcn, peu ou pas d'issue interne. Voir usage § 135 pour skeleton.

### 13.4 Primitives manquantes / à ajouter

| # | Sévérité | Finding | Recommandation |
|---|---|---|---|
| 148 | 🟡 | Pas de `<EmptyState>` partagé. Chaque view recrée son empty state (bien dans Players, pourri dans Games). | Créer `src/shared/components/ui/empty-state.tsx` avec props `icon`, `title`, `description`, `action?`. |
| 149 | 🟡 | Pas de `<PageHeader>` partagé (retour + titre + actions). Chaque page reconstruit son header avec un hack `<div className="w-10" />` pour équilibrer. | `<PageHeader title actions backHref?>`. |
| 150 | 🟡 | Pas de `<SectionHeader>` (icône + titre + action optionnelle). Pattern répété ~15× dans les views. | Composant. |
| 151 | 🟡 | Pas de `<StatCard>` sémantique. Chaque stat est un `<div>` manuel avec icône + valeur + label. | Composant avec `variant: stat | highlight`. |

### 13.5 Synthèse shared/ui

**Bons points** :
- Les primitives shadcn en elles-mêmes sont **propres, theme-aware, accessibles**.
- Focus-visible et aria-invalid sont corrects par défaut.
- CVA bien utilisé pour les variants.

**Problèmes** :
1. **26 primitives non utilisées** = dette au repos (spécialement `sidebar.tsx` 723 lignes, `chart.tsx` 351 lignes, `form.tsx` 165 lignes).
2. **Primitives utilisées puis overridées** : les développeurs `className`-override avec des couleurs hardcodées (`bg-slate-700`, `text-white`) → les bugs de thème reviennent au niveau feature, alors que la primitive était déjà bien.
3. **Composants métier manquants** : `<EmptyState>`, `<PageHeader>`, `<SectionHeader>`, `<StatCard>`, `<FormDialog>`, `<ConfirmDialog>`, `<InitialAvatar>`.
4. **Token sémantique manquant** : pas de variant `mode-competitive/cooperative/...` sur Badge, donc chaque view recrée ses couleurs.

**Recommandation stratégique** : une session de refactor (1-2 jours) pour (a) supprimer les 26 primitives inutilisées, (b) créer les 7 composants métier manquants, (c) imposer une règle lint qui interdit `bg-slate-*` dans `src/features/**/*.tsx` (sauf `ui/`) — forcerait l'adoption des tokens.

---

## 14. Problèmes transverses — design system

Synthèse des motifs qui reviennent page après page.

### 14.1 Gestion du mode sombre/clair

Le pattern `darkMode ? "..." : "..."` est réparti dans **30+ fichiers** et passé en prop à travers tous les composants (prop drilling). Conséquences observées :

- **Chaque développeur doit penser aux deux thèmes à chaque modif.** Oubli fréquent → bugs § 19, § 21, § 29, § 47, § 54, § 63.
- **Incohérences inter-composants** : même concept coloré différemment selon la page (§ 27, § 69).
- **Dialogues résiduels** : `AddGameDialog` et `EditGameDialog` overrident encore les tokens (`bg-slate-700`) sur les inputs.
- **Overrides anti-tokens** : les devs remettent `bg-slate-700` partout sur des primitives pourtant theme-aware (§ 101, § 124).

**Recommandation architecturale** :

1. Adopter le **pattern natif Tailwind `dark:`** avec la stratégie `class` (déjà supportée par shadcn).
2. Utiliser les **variables CSS HSL** (`--background`, `--foreground`, `--card`, `--primary`, etc.) définies dans `theme.json`. Shadcn le fait déjà pour `--primary` — il faut généraliser.
3. **Supprimer toute prop `darkMode`** : 300+ lignes dégagées, zéro prop drilling.
4. Un toggle global `document.documentElement.classList.toggle('dark')` déclenché depuis le bouton Settings.

**Gain estimé** : ~300 lignes supprimées, 0 bug de thème futur, cohérence garantie.

### 14.2 Tokens de couleur sémantiques

**État actuel** :
- Couleurs en dur partout : `text-teal-400`, `border-red-400/30`, `text-emerald-700`, `bg-amber-500/20`, `text-purple-300`.
- Mêmes concepts (mode de session) colorés différemment selon la page.
- Couleurs choisies arbitrairement (purple pour victoires, blue pour joueurs actifs) sans lien sémantique.

**Recommandation** : définir dans `src/shared/theme/tokens.ts` + CSS :

```css
/* Modes de session */
--mode-competitive: hsl(0 80% 55%);    /* rouge */
--mode-cooperative: hsl(215 80% 55%);  /* bleu */
--mode-campaign:    hsl(270 80% 60%);  /* violet */
--mode-hybrid:      hsl(30 90% 55%);   /* orange */

/* Statuts */
--stat-positive: hsl(145 70% 45%);    /* victoires, succès */
--stat-negative: hsl(0 70% 55%);      /* défaites, erreurs */
--stat-neutral:  hsl(var(--muted-foreground));

/* Highlights */
--medal-gold:   hsl(45 95% 55%);
--medal-silver: hsl(210 10% 70%);
--medal-bronze: hsl(25 70% 50%);
```

Exposer en Tailwind via `extend.colors` + utilisation `bg-mode-competitive`, `text-stat-positive`.

### 14.3 Radius

**État** : 4 valeurs utilisées sans règle : `rounded-lg` (8), `rounded-xl` (12), `rounded-2xl` (16), `rounded-l-lg` (8 gauche).

**Recommandation** : 3 tokens :
- `--radius-sm: 0.375rem` (6px) — badges, chips.
- `--radius: 0.5rem` (8px) — inputs, buttons.
- `--radius-lg: 1rem` (16px) — cards, dialogs.

Tailwind config : `borderRadius.DEFAULT = 'var(--radius)'`, etc. Lint `rounded-[0-9]+` en warning dans `features/`.

### 14.4 Cartes — recette monolithique

**État** : une seule recette `bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl` reproduite ~30× dans les views. Aucune hiérarchie primaire/secondaire.

**Recommandation** : variants typés :

```tsx
<Card variant="glass" />       // principale (glassmorphism)
<Card variant="solid" />       // solide, contenu dense
<Card variant="accent" />      // bordure primary, info mise en avant
<Card variant="ghost" />       // sans fond, pour groupes
```

### 14.5 Internationalisation

**État** : l'infrastructure `useLabels` / `t('...')` existe et fonctionne. **Le problème n'est pas l'infra, c'est l'adoption inégale** :

- ✅ Bien utilisé : `PlayersPageView`, `AddPlayerDialog`, `DeleteGameDialog`, `DeletePlayerDialog`, `EditPlayerDialog`.
- 🟡 Partiel : `AddGameDialog`, `EditGameDialog` (titre/boutons encore hardcodés).
- ✅ Résolu : `PlayerStatsView` (i18n complète via PR #85), `NewPlayView` (§ 46 résolu 2026-05-01).

**Statut après Sprint B** : ~80 strings migrées via `t()`. Restent :
- `EditGameDialog` : titre dialog et bouton submit hardcodés en français.
- `AddGameDialog` : quelques labels (§ 91) potentiellement encore présents.

**Action restante** :
1. Vérifier `AddGameDialog` par grep ciblé.
2. Activer `eslint-plugin-i18n-text` pour bloquer les régressions futures.

### 14.6 Accessibilité — récapitulatif

| Problème | Occurrences | Références |
|---|---|---|
| Contraste `text-white/30-40` en dark | ~15 | §§ 2, 17, 50, 65 |
| Cibles tactiles < 44 px | ~10 | §§ 15, 23, 45, 137, 144 |
| Focus-visible absent au niveau composants custom | ~10 | § 8, § 14.6 ci-dessous |
| Images `alt=""` redondantes | ~5 | § 12.6 transverse |
| Aucun `role="alert"` / `aria-live` sur erreurs | ~6 | §§ 7, 49 |
| Boutons imbriqués (HTML invalide) | 1 | § 24 |
| Labels sans `htmlFor` | Nombreux | § 58 |

**Focus-visible** : la primitive `Button` shadcn a `focus-visible:ring-[3px]` correct. **Mais** les custom buttons inline (`<button className="p-2">` dans les views) n'héritent pas et n'ajoutent pas leur propre ring. Ajouter une règle globale CSS :

```css
button:focus-visible:not(.custom-focus) {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 14.7 Navigation

**État** : 3 patterns coexistent :

1. **Bottom-nav fixe** (`GameDetailView` uniquement) : 4 onglets Dashboard/Games/Players/Stats.
2. **Header back-button** (Dashboard, Games, Players, Settings, Stats, NewPlay) : flèche retour + titre.
3. **Pas de nav** (Login).

**Problème** : le bottom-nav n'existe que sur GameDetail → l'utilisateur pense que c'est une feature spécifique à cette page. Et cette bottom-nav a un bug (§ 30 toujours active sur « Games »).

**Recommandation** :
- Mobile : bottom-nav global, présent sur toutes les pages sauf Login/NewPlay (qui bénéficient du full-screen).
- Desktop (≥ lg) : sidebar latérale (utiliser `sidebar.tsx` qui est déjà là !) + header sans back-button.

### 14.8 Empty states

**Qualité variable** :

| Page | Quality | Détail |
|---|---|---|
| `PlayersPageView` | ✅ Bon | Icône large, title, description, CTA |
| `GamesPageView` | 🔴 Faible | `<div>` vide sans icône |
| Stats | 🔴 Absent | Texte « No data » simple |
| `BGGSearch` | 🟢 OK | Texte « Aucun résultat » sans icône |
| `NewPlayView` (pas de joueurs disponibles) | 🔴 Aucun | |

**Action** : créer `<EmptyState icon title description action?>` (§ 148) et imposer via lint ou code review.

### 14.9 Loading states

**État** :

| Page | Loading | Détail |
|---|---|---|
| `LoginPage` | 🟢 | Bouton loading state |
| `BGGSearch` | ✅ | Spinner dédié + message |
| Dashboard | 🔴 Aucun | React Query gère en background, rien d'affiché |
| Games | 🔴 Aucun | Idem |
| Players | 🔴 Aucun | Idem |
| Stats | 🔴 Aucun | Idem |
| GameDetail | 🔴 Aucun | Idem |

**Action** : sur chaque page, ajouter un skeleton dédié (`<GamesPageSkeleton>`, `<PlayersPageSkeleton>`, etc.) affiché tant que `isLoading` de React Query est true. Utiliser `skeleton.tsx` (§ 135).

### 14.10 Mobile vs desktop

- **Double rendering pattern** dans `GamesPageView` (desktop actions / mobile actions) et `GameDetailView` (tabs desktop / kebab mobile). Légèrement DRY-violant mais acceptable.
- **Plusieurs pages n'ont aucun breakpoint desktop** : Dashboard, Players, Settings, Stats restent en layout mobile sur un écran 1920 px → vaste espace blanc sur les côtés. Seul `GameDetailView` a `max-w-7xl`.

**Action** : wrapper global `<PageContainer className="max-w-7xl mx-auto px-4 md:px-8">` + layout 2-3 colonnes sur les pages de contenu (ex. Dashboard : stats à gauche, activité à droite).

### 14.11 Gestion des états de formulaire

Aucun formulaire n'utilise `react-hook-form` + `<Form>` shadcn alors que la primitive est disponible (§ 132). Tous les forms (`AddGameDialog`, `EditGameDialog`, `AddPlayerDialog`, `NewPlayView`…) sont gérés en `useState` manuel avec validation custom.

**Conséquences** :
- `htmlFor` souvent absent (§ 58).
- Messages d'erreur affichés ad hoc (`<p className="text-red-400">`).
- Dirty state non trackée → pas de confirmation avant fermeture (§ 49, § 103).

**Action** : migration progressive vers `<Form>` + Zod resolvers. Un formulaire par semaine. L'app gagne en cohérence et en robustesse.

---

## 15. Priorités restantes

Mise à jour 2026-04-30. Sprint 1 entièrement résolu. Sprint 2 items 7-8 résolus. Backlog actuel :

### Sprint A — Quick wins restants (≤ 1 jour chacun)

1. **🔴 Bottom-nav active-state dérivé du `currentView`** (§ 30). Bouton « Games » toujours actif quelle que soit la page.
2. **🟡 i18n résiduel** : vérifier `AddGameDialog` (§ 91), `EditGameDialog` (titre + bouton submit hardcodés). Audit grep ciblé. ~~`NewPlayView` (§ 46) — résolu 2026-05-01.~~
3. **🟡 Créer le token `gameModeColors` sémantique** (§ 14.2). Élimine les incohérences § 27, § 55, § 69 en un seul fichier.

### Sprint B — Refactors ciblés (1-3 jours chacun)

4. **🔴 Refactorer `AddGameDialog` + `EditGameDialog`** (§ 89-103). Inputs hardcodés dark, title/boutons partiellement hardcodés, taille dialog trop étroite. Créer `<FormDialog>` (§ 12.10) pour les couvrir en même temps.
5. ~~**🔴 Winner en `RadioGroup` dans `NewPlayView`** (§ 48). Sémantique HTML incorrecte (checkbox pour choix exclusif).~~ → Résolu 2026-05-01.
6. ~~**🟡 Auto-save + confirmation avant navigation dans `NewPlayView`** (§ 49). Risque de perte de données sur formulaire long.~~ → Résolu 2026-05-01.

### Sprint C — Chantiers structurants (≥ 1 semaine)

7. **🔴 Refactor `darkMode` prop → tokens CSS + `dark:` Tailwind** (§ 14.1). Débloque §§ 19, 21, 29, 47, 54, 63, 101, 123. ROI global le plus élevé du backlog restant.
8. **🔴 `NewPlayView` : wizard multi-étapes** (§ 53). Réduction de charge cognitive sur le formulaire le plus long.
9. **🟡 Créer `<EmptyState>`, `<StatCard>`, `<InitialAvatar>`** (§ 148-151). Composants métier manquants, patterns codifiés en Annexe E.
10. **🟡 Implémenter ou retirer le filtre de période dans `GameStatsView`** (§ 67). Feature zombie à trancher.
11. **🟡 Migrer les formulaires vers `<Form>` + Zod** (§ 14.11, § 132). Un form par semaine.

### Gain estimé restant

- Sprint A : **1-2 jours** — corrections rapides visibles immédiatement.
- Sprint B : **1 semaine** — éliminer les dettes majeures restantes (dialogs + NewPlayView).
- Sprint C : **3-4 semaines** — systémique, garantit la cohérence long terme.

---

## Annexes

### A. Inventaire des fichiers audités

**Pages / Views** : `auth/LoginPage.tsx`, `dashboard/DashboardView.tsx`, `games/GamesPageView.tsx`, `games/detail/GameDetailView.tsx`, `games/expansions/GameExpansionsView.tsx`, `games/characters/*` (partiel), `players/PlayersPageView.tsx`, `plays/NewPlayView.tsx`, `bgg/BGGSearch.tsx`, `stats/game/GameStatsView.tsx`, `stats/player/PlayerStatsView.tsx`, `settings/SettingsPageView.tsx`.

**Dialogs** : `games/dialogs/AddGameDialog.tsx`, `games/dialogs/EditGameDialog.tsx`, `games/dialogs/DeleteGameDialog.tsx`, `players/dialogs/AddPlayerDialog.tsx`, `players/dialogs/EditPlayerDialog.tsx`, `players/dialogs/DeletePlayerDialog.tsx`, `games/expansions/dialogs/ExpansionDialogs.tsx`, `games/characters/dialogs/CharacterDialogs.tsx`.

**Shared UI** : `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `tabs.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `textarea.tsx`, `badge.tsx`, `alert.tsx`, `avatar.tsx`, `skeleton.tsx`, `form.tsx` (partiel), `sidebar.tsx` (partiel pour usage), `chart.tsx` (usage). Inventaire complet des 45 fichiers du dossier.

### B. Hors périmètre (non audités)

- Routing global (`App.tsx`, `main.tsx`, `router.tsx`).
- Hooks (`useXxx` dans `shared/hooks/`, `features/**/hooks/`).
- Services API (`features/**/api/*`).
- Backend (`backend/**`).
- Tests (`**/__tests__/*`).

### C. Méthode de scoring

- 🔴 **Critique** : bloque la release (bug factuel, contenu mensonger, sécurité basse) ou casse l'usage (illisible, inutilisable).
- 🟡 **Modéré** : dégrade l'expérience (contraste limite, UX discutable, code incohérent).
- 🟢 **Mineur** : à faire au prochain refactor (polish, edge case).

### D. Suggestions de passes suivantes

1. Audit des routes & hooks (data flow, loading states au niveau Page).
2. Audit des mutations React Query (optimistic updates, error handling).
3. Audit performance (bundle analyse, lazy loading des dialogs et routes).
4. Audit sécurité UX (CSRF, input sanitization côté front, confirmation double pour actions destructives).
5. Audit responsive (breakpoints effectifs, ergonomie tactile vs curseur).
6. Audit motion / animations (`transition-all` global à auditer, préférer des durées spécifiques + `prefers-reduced-motion`).

---

### E. Patterns canoniques — copier-coller

Cette section rassemble les « bons exemples » identifiés pendant l'audit, à utiliser comme référence pour les refactors recommandés.

#### E.1 Empty state (d'après `PlayersPageView`)

```tsx
// src/shared/components/ui/empty-state.tsx
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 mb-4 text-muted-foreground opacity-50" aria-hidden="true" />
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Usage
<EmptyState
  icon={GameController}
  title={t('games.empty.title')}
  description={t('games.empty.description')}
  action={<AddGameDialog trigger={<Button>{t('games.empty.cta')}</Button>} />}
/>
```

#### E.2 ConfirmDialog destructif (d'après `DeleteExpansionDialog`)

```tsx
// src/shared/components/ui/confirm-dialog.tsx
interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  trigger: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const { t } = useLabels();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel ?? t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? buttonVariants({ variant: 'destructive' }) : undefined}
          >
            {confirmLabel ?? t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### E.3 FormDialog (base pour Add/Edit)

```tsx
// src/shared/components/ui/form-dialog.tsx
interface FormDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode  // <form> content
  footer: React.ReactNode    // buttons (submit, cancel)
  size?: 'sm' | 'md' | 'lg'
  isDirty?: boolean          // for close confirmation
  trigger?: React.ReactNode
}

const sizeClasses = {
  sm: 'sm:max-w-lg',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl',
};

export function FormDialog({
  title, description, children, footer,
  size = 'sm', isDirty, trigger, ...props
}: FormDialogProps) {
  const { t } = useLabels();
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={sizeClasses[size]}
        onInteractOutside={(e) => {
          if (isDirty && !confirm(t('common.unsaved_changes_warning'))) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### E.4 Avatar-initial sans dépendance externe (remplace Unsplash)

```tsx
// src/shared/components/ui/initial-avatar.tsx
interface InitialAvatarProps {
  name: string
  src?: string
  size?: number
  className?: string
}

function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function InitialAvatar({ name, src, size = 40, className }: InitialAvatarProps) {
  const hue = hashToHue(name);
  const initials = getInitials(name);
  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback
        style={{ backgroundColor: `hsl(${hue} 65% 45%)`, color: 'white' }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
```

#### E.5 Tokens sémantiques pour les modes (à placer dans `tailwind.config.js` + CSS)

```css
/* src/styles/theme.css */
:root {
  --mode-competitive: 0 80% 55%;
  --mode-cooperative: 215 80% 55%;
  --mode-campaign:    270 80% 60%;
  --mode-hybrid:      30 90% 55%;

  --stat-positive:    145 70% 45%;
  --stat-negative:    0 70% 55%;

  --medal-gold:       45 95% 55%;
  --medal-silver:     210 10% 70%;
  --medal-bronze:     25 70% 50%;
}
```

```ts
// tailwind.config.js — extension
colors: {
  mode: {
    competitive: 'hsl(var(--mode-competitive))',
    cooperative: 'hsl(var(--mode-cooperative))',
    campaign:    'hsl(var(--mode-campaign))',
    hybrid:      'hsl(var(--mode-hybrid))',
  },
  stat: {
    positive: 'hsl(var(--stat-positive))',
    negative: 'hsl(var(--stat-negative))',
  },
  medal: {
    gold:   'hsl(var(--medal-gold))',
    silver: 'hsl(var(--medal-silver))',
    bronze: 'hsl(var(--medal-bronze))',
  },
},
```

Usage : `className="bg-mode-competitive/20 text-mode-competitive border-mode-competitive/40"`.

#### E.6 Badge sémantique pour les modes (extension de `badge.tsx`)

```tsx
// src/shared/components/ui/badge.tsx — étendu
const badgeVariants = cva("...base classes...", {
  variants: {
    variant: {
      default:     "border-transparent bg-primary text-primary-foreground",
      secondary:   "border-transparent bg-secondary text-secondary-foreground",
      destructive: "border-transparent bg-destructive text-white",
      outline:     "text-foreground",
      // Nouveaux variants sémantiques
      competitive: "border-mode-competitive/40 bg-mode-competitive/20 text-mode-competitive",
      cooperative: "border-mode-cooperative/40 bg-mode-cooperative/20 text-mode-cooperative",
      campaign:    "border-mode-campaign/40 bg-mode-campaign/20 text-mode-campaign",
      hybrid:      "border-mode-hybrid/40 bg-mode-hybrid/20 text-mode-hybrid",
    },
  },
  defaultVariants: { variant: "default" },
});

// Helper pour dériver dynamiquement
export function ModeBadge({ mode, ...props }: { mode: GameMode }) {
  return <Badge variant={mode as any} {...props}>{t(`games.mode.${mode}`)}</Badge>;
}
```

#### E.7 Radio pour winner (remplace la checkbox du § 48)

```tsx
// Dans NewPlayView
<RadioGroup value={winnerId ?? 'none'} onValueChange={(v) => setWinnerId(v === 'none' ? null : v)}>
  {selectedPlayers.map((p) => (
    <div key={p.player_id} className="flex items-center gap-3">
      <RadioGroupItem id={`winner-${p.player_id}`} value={String(p.player_id)} />
      <Label htmlFor={`winner-${p.player_id}`} className="flex items-center gap-2 cursor-pointer">
        <InitialAvatar name={p.player_name} size={32} />
        <span>{p.player_name}</span>
      </Label>
    </div>
  ))}
  <div className="flex items-center gap-3 pt-2 border-t border-border">
    <RadioGroupItem id="winner-none" value="none" />
    <Label htmlFor="winner-none" className="text-muted-foreground">
      {t('plays.form.winner.none')}
    </Label>
  </div>
</RadioGroup>
```

#### E.8 Auto-save draft (remplace le silent loss du § 49)

```tsx
// src/shared/hooks/useDraftPersist.ts
export function useDraftPersist<T>(key: string, value: T, isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(`draft_${key}`, JSON.stringify({
        value,
        timestamp: Date.now(),
      }));
    }, 1000); // debounce 1s
    return () => clearTimeout(timeout);
  }, [key, value, isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}

export function loadDraft<T>(key: string, maxAgeMs = 24 * 60 * 60 * 1000): T | null {
  const raw = localStorage.getItem(`draft_${key}`);
  if (!raw) return null;
  try {
    const { value, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > maxAgeMs) {
      localStorage.removeItem(`draft_${key}`);
      return null;
    }
    return value as T;
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  localStorage.removeItem(`draft_${key}`);
}
```

#### E.9 PageHeader unifié (remplace le hack `<div className="w-10" />`)

```tsx
// src/shared/components/ui/page-header.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, backHref, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 max-w-7xl mx-auto">
        <div className="w-11 h-11 flex items-center justify-center">
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(backHref)}
              aria-label={t('common.back')}
              className="min-w-11 min-h-11"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="text-center sm:text-left min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}
```

---

### F. Checklist de PR review UI

À utiliser pour toute PR qui touche `src/features/**/*.tsx` ou `src/shared/components/**/*.tsx`.

**Thème et couleurs**
- [ ] Aucun `bg-slate-*`, `text-white`, `text-slate-*` en dur dans les features — uniquement des tokens (`bg-background`, `text-foreground`, `bg-card`, etc.) ou `dark:` Tailwind.
- [ ] Aucune prop `darkMode: boolean` ajoutée (cible : suppression totale à terme).
- [ ] Les couleurs de modes (competitive/coop/campaign/hybrid) viennent du token unique (`variant` Badge ou classe `bg-mode-*`).

**Accessibilité**
- [ ] Contraste ≥ 4.5:1 pour tout texte normal (pas de `text-white/30`, `/40`).
- [ ] Cibles tactiles ≥ 44 px (`min-w-11 min-h-11` sur les boutons d'icône).
- [ ] Chaque `<Input>`, `<Textarea>`, `<Select>` a un `<Label>` avec `htmlFor`.
- [ ] `focus-visible` visible — pas d'override qui supprime le ring.
- [ ] Pas de bouton imbriqué dans un autre bouton/lien.
- [ ] Un seul `<h1>` par page, hiérarchie `h1 → h2 → h3` respectée.
- [ ] `aria-label` sur les boutons d'icône sans texte.
- [ ] `role="alert"` + `aria-live` sur les messages d'erreur dynamiques.

**i18n**
- [ ] Aucune string en dur FR ou EN dans le JSX — tout passe par `t('...')` via `useLabels`.
- [ ] Les messages de validation sont traduits (pas `"Le nom est requis"` codé en dur).
- [ ] Les placeholders sont traduits.
- [ ] Les `alt` d'image pertinents sont traduits (ou vides pour décoratif).

**Composants**
- [ ] Les cartes utilisent `<Card>` shadcn ou une extension avec variants, pas des `<div className="bg-white/10 backdrop-blur-md">` manuels.
- [ ] Les dialogs Add/Edit utilisent `<FormDialog>`.
- [ ] Les dialogs Delete/Confirm utilisent `<ConfirmDialog destructive>`.
- [ ] Les empty states utilisent `<EmptyState>`.
- [ ] Les headers de page utilisent `<PageHeader>`.
- [ ] Les avatars utilisent `<InitialAvatar>` (pas de `<img>` Unsplash hardcodé).

**États asynchrones**
- [ ] Chaque page principale affiche un skeleton pendant `isLoading` de React Query.
- [ ] Les erreurs React Query ont un affichage dédié (pas « une page vide »).
- [ ] Les mutations destructives (delete, reset) passent par `<ConfirmDialog destructive>`.
- [ ] Les formulaires avec `isDirty` affichent une confirmation avant fermeture.

**Forms**
- [ ] Utilisation de `<Form>` + `react-hook-form` + Zod resolver (pas de `useState` manuel pour les nouveaux forms).
- [ ] `<FormMessage>` sous chaque champ en erreur (pas en haut de carte loin du champ).
- [ ] Indicateur `*` visible dès l'affichage pour les champs obligatoires.

**Responsive**
- [ ] Pages longues : `max-w-7xl mx-auto` appliqué sur le container principal.
- [ ] Breakpoints `md:` et `lg:` considérés pour les layouts grid.
- [ ] Mobile : zones de pouce respectées (bottom-nav, CTA principal en bas).

**Performance**
- [ ] Dialogs lazy-loadés (`const AddGameDialog = lazy(() => ...)`).
- [ ] Images avec `loading="lazy"` sauf hero above-the-fold.
- [ ] Pas de `Promise` await dans une boucle quand `Promise.all` suffit.

---

### G. Glossaire rapide

- **Design token** : variable CSS / valeur abstraite utilisable à travers toute l'app (ex. `--primary`, `--mode-competitive`). Centralise un concept de design.
- **Theme-aware** : composant qui s'adapte au thème clair/sombre sans intervention manuelle du développeur consommateur.
- **Prop drilling** : passer une prop de haut en bas à travers plusieurs niveaux de composants intermédiaires qui n'en ont pas directement besoin.
- **CVA** (class-variance-authority) : librairie pour typer des variants de classes Tailwind (utilisée par shadcn `buttonVariants`, `badgeVariants`).
- **WCAG AA** : niveau 2 des Web Content Accessibility Guidelines v2.1 — cible réaliste pour une app grand public. Exige contraste ≥ 4.5:1 (texte normal), ≥ 3:1 (gros texte, UI elements).
- **Empty state** : écran affiché quand une liste ou section n'a aucun contenu à afficher (liste vide, résultats de recherche vides, etc.).
- **Skeleton** : placeholder gris animé qui reproduit la structure d'un composant pendant son chargement.
- **Wizard** : formulaire multi-étapes avec progression visible (ex. 1/4, 2/4…). Alternative au formulaire mono-écran long.
- **Dirty state** (form) : état d'un formulaire dont au moins un champ a été modifié depuis le chargement initial. Utilisé pour la confirmation de fermeture.
- **Glassmorphism** : effet visuel où une surface apparaît comme du verre dépoli, obtenu via `backdrop-blur` + fond semi-transparent.

---

*Fin du document. Pour questions, améliorations ou passage suivant (routes & hooks, performance, sécurité UX), voir § D.*
