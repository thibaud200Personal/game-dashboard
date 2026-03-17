# Rapport d'état du projet — Board Game Dashboard

> Généré le 2026-03-17

---

## 1. Vue d'ensemble

**Projet :** Board Game Dashboard — application de suivi de scores de jeux de société
**Stack :** React 19 + TypeScript (frontend) · Express + SQLite (backend)
**Architecture :** SPA avec pattern Container/Presenter, hooks personnalisés, service layer
**Statut global :** ~85-90% des fonctionnalités prévues implémentées

---

## 2. Ce qui est fait ✅

### Gestion des joueurs
- CRUD complet (ajout, édition, suppression)
- Statistiques par joueur (parties jouées, victoires, scores)
- Avatars, jeu favori

### Gestion des jeux
- CRUD complet
- 4 types de jeux : compétitif, coopératif, campagne, hybride
- Intégration BoardGameGeek (BGG) : recherche et import automatique avec métadonnées
- Gestion des extensions (GameExpansions)
- Gestion des personnages/rôles (GameCharacters) avec avatars et capacités (JSON)

### Sessions de jeu
- Création et suivi de sessions
- Scoring par joueur
- Suivi des gagnants
- Historique des parties

### Statistiques & Analytics
- Dashboard avec métriques globales
- Vue stats par joueur et par jeu
- Graphiques via Recharts (infrastructure en place)

### Interface utilisateur
- Navigation bottom bar (mobile)
- Navigation breadcrumb
- Dialogs CRUD organisés dans `src/components/dialogs/`
- Design glassmorphism + Tailwind CSS
- Infrastructure thème sombre/clair (provider non connecté) — prop `darkMode` propagée correctement depuis App.tsx (mars 2026)
- Responsive mobile/tablette/desktop

### Architecture & Infrastructure
- Pattern Container/Presenter (`components/` ↔ `views/`)
- Hooks extraits dans `src/hooks/`
- Service layer centralisé (`ApiService.ts`, `bggApi.ts`)
- Validation Zod + React Hook Form
- Backend Express avec middleware de validation
- Schéma BDD normalisé : 6 tables, 2 vues SQL, 6 index, triggers auto (created_at/updated_at)
- Optimisation N+1 résolue, vues `player_statistics` et `game_statistics`
- **31/31 tests passent** (Vitest + RTL + MSW)
- Documentation technique dans `src/docs/`

---

## 3. Ce qui reste à faire 🔄

### Bugs / Review ouverts (REVIEW_TASKS.md)
| # | Tâche | Fichier | État |
|---|-------|---------|------|
| 1 | Typo `joueurs(nexiste pas…)` → `joueurs (n'existe pas…)` | `src/docs/ARCHITECTURE.md` | Ouvert |
| 2 | Bug filtrage jeux — hook filtre mais passe les jeux non-filtrés à la vue | `GamesPage.tsx` | Commit `2186cd5` l'adresse — **à confirmer** |
| 3 | Commentaire obsolète sur import Button ligne 2 | `DashboardView.tsx` | Ouvert |
| 4 | Tests `useGamesPage` ne vérifient pas que les jeux filtrés sont retournés | `useGamesPage.test.ts` | Commit `2186cd5` l'adresse — **à confirmer** |

### ROADMAP — Prochaines priorités

**Court terme (2-4 semaines)**
- [ ] Atteindre 50+ tests : restructurer en `unit/technical/`, `unit/functional/`, `integration/`, ajouter 7 workflows BGG E2E
- [ ] Cache BGG — éviter les appels répétés à l'API
- [ ] Formulaire pré-import BGG — éditer les données avant sauvegarde
- [ ] Copier le service UltraBoardGames depuis `boardGameScore` (déjà implémenté là-bas)

**Moyen terme (1-2 mois)**
- [ ] Thème sombre/clair — ✅ prop-driven corrigé (mars 2026) ; reste : ThemeProvider + persistance localStorage + toggle survit au reload
- [ ] Sélection des personnages en session — interface modale manquante
- [ ] Graphiques temporels — infrastructure Recharts prête, visualisations à implémenter
- [ ] Migration React Query pour la gestion d'état
- [ ] Système de migration automatique du schéma BDD (knex.js)
- [ ] Compléter persistance métadonnées BGG (thumbnail, playing_time, categories JSON)

**Long terme (2-6 mois)**
- [ ] Dashboard avancé avec graphiques sophistiqués
- [ ] Mode campagne multi-scénario, Mode tournoi
- [ ] Export/Import données (JSON/CSV)
- [ ] Système de recommandations basé sur l'historique
- [ ] Tests E2E Cypress/Playwright
- [ ] PWA (Progressive Web App)

---

## 4. Structure des fichiers clés

```
game-dashboard/
├── src/
│   ├── components/          # Containers (logique)
│   │   ├── dialogs/         # Tous les dialogs CRUD (barrel export via index.ts)
│   │   └── ui/              # 60+ composants shadcn/ui
│   ├── views/               # Presenters (rendu)
│   ├── hooks/               # Logique métier extraite
│   ├── services/            # ApiService.ts + bggApi.ts
│   ├── types/               # Interfaces TypeScript centralisées
│   └── docs/                # ARCHITECTURE.md, DEVELOPMENT_GUIDE.md, DATA_MAPPING.md
│
├── backend/
│   ├── server.ts
│   ├── api/                 # GameCharacterController.ts
│   ├── services/            # GameCharacterService.ts
│   ├── database/            # schema.sql, DatabaseManager.ts
│   └── validation/          # Zod schemas + middleware
│
├── ROADMAP.md               # Feuille de route complète
├── REVIEW_TASKS.md          # Tâches de review (certaines peut-être résolues)
└── rapport.md               # ← ce fichier
```

---

## 5. Dépendances notables

| Catégorie | Lib |
|-----------|-----|
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| Forms | React Hook Form 7, Zod 3 |
| État serveur | TanStack React Query 5 (installé, pas encore utilisé) |
| Graphiques | Recharts 2, D3 7 |
| Animation | Framer Motion 12 |
| Tests | Vitest 3, RTL, MSW 2 |
| Backend | Express 4, better-sqlite3 |

---

## 6. Points d'attention

1. **`GamesPageOld.tsx`** — ancien composant encore présent, à supprimer si la nouvelle version est stable.
2. **Thème sombre/clair** — commits `31f5cb0`/`30f0292` marqués PARTIAL. Correctif mars 2026 : prop `darkMode` propagée correctement (Players + Stats). Reste : persistance localStorage + ThemeProvider.
3. **React Query** — installé dans les deps mais pas encore utilisé dans le code.
4. **`src/REFACTORING_GUIDE.md`** — stub de redirection obsolète (voir section 7).
5. **`src/README.md`** — mentionne React 18 (le projet est en React 19) et Spark KV (remplacé par SQLite).

---

## 7. Fichiers .md à supprimer ou nettoyer

### 🔴 À supprimer — obsolètes ou sans valeur

| Fichier | Raison |
|---------|--------|
| `debug-navigation.md` | Fichier de debug incomplet (22 lignes, contenu tronqué). Listé comme "safe to remove" dans `DOCUMENTATION_MIGRATION.md`. |
| `CLEANUP_SUMMARY.md` | Résumé d'un nettoyage déjà effectué (suppression champs `email`/`rank`). Historique pur, listé comme "safe to remove". |
| `DOCUMENTATION_MIGRATION.md` | Le fichier lui-même porte le warning `⚠️ Fichier Obsolète` en tête. Archive d'une réorganisation terminée. |
| `src/REFACTORING_GUIDE.md` | Stub de 10 lignes qui dit juste "FICHIER DÉPLACÉ". La cible réelle est `src/docs/DEVELOPMENT_GUIDE.md`. |
| `backend/SQL_OPTIMIZATION_SUMMARY.md` | Résumé d'une optimisation SQL déjà intégrée dans le code. Valeur historique uniquement. |
| `backend/api/README.md` | 1 seule ligne générique : "This directory contains all API endpoint definitions…". Zéro valeur. |
| `backend/config/README.md` | 1 seule ligne générique. Zéro valeur. |
| `backend/models/README.md` | 1 seule ligne générique. Zéro valeur. |
| `backend/services/README.md` | 1 seule ligne générique. Zéro valeur. |
| `backend/utils/README.md` | 1 seule ligne générique + le dossier `backend/utils/` n'existe même pas dans le projet. |

### 🟡 À nettoyer ou consolider

| Fichier | Raison |
|---------|--------|
| `DIALOG_REORGANIZATION_SUMMARY.md` | Contient un stub de redirection EN TÊTE mais aussi l'ancien contenu complet EN BAS — migration incomplète/corrompue. Peut être supprimé : le contenu utile est dans `src/docs/ARCHITECTURE.md`. |
| `src/docs/ISSUE_RESOLUTION.md` | Doublon de `src/docs/TROUBLESHOOTING.md`. Même contenu (CORS, accessibilité forms, BGG, navigation), mais `ISSUE_RESOLUTION.md` a du contenu corrompu/dupliqué en fin de fichier. Garder `TROUBLESHOOTING.md`, supprimer celui-ci. |
| `src/README.md` | Infos partiellement obsolètes : mentionne React 18 (projet en React 19), Spark KV (remplacé par SQLite), et liste des composants en doublon avec `src/docs/ARCHITECTURE.md`. À mettre à jour ou supprimer. |
| `src/prd.md` | PRD (Product Requirements Document) initial. Mentionne `local storage` comme persistence alors que le projet utilise SQLite. Utile comme référence de design (couleurs, UX intent) mais techniquement daté. |
| `README.md` (racine) | Contenu générique du template Spark ("Welcome to Your Spark Template!"). Ne décrit pas le projet réel. À remplacer par un vrai README de projet. |
| `REVIEW_TASKS.md` | Les tâches #2 et #4 semblent avoir été adressées par le commit `2186cd5`. À vérifier et mettre à jour ou supprimer les tâches résolues. |

### ✅ À conserver

| Fichier | Raison |
|---------|--------|
| `ROADMAP.md` | Feuille de route active, référence principale de planification |
| `SECURITY.md` | Politique de sécurité GitHub standard, nécessaire |
| `backend/README.md` | Documentation backend complète avec endpoints et BDD |
| `backend/database/README.md` | Setup et exemples de queries |
| `backend/database/database-structure.md` | Référence schéma détaillée (200+ lignes) |
| `src/docs/ARCHITECTURE.md` | Architecture frontend de référence |
| `src/docs/DEVELOPMENT_GUIDE.md` | Guide de développement actif |
| `src/docs/DATA_MAPPING.md` | Mapping frontend/BDD (100% complet) |
| `src/docs/NAVIGATION_CONTEXT.md` | Documente le système de navigation contextuelle |
| `src/docs/TROUBLESHOOTING.md` | Guide de dépannage à jour (en français) |
| `src/docs/README.md` | Index de la documentation frontend |
| `rapport.md` | Ce fichier |

---

## 8. Bilan documentaire

**28 fichiers `.md` au total**
- 10 à supprimer (obsolètes, stubs vides, résumés d'actions terminées)
- 7 à nettoyer/consolider
- 11 à conserver

Supprimer les 10 fichiers identifiés en 🔴 réduirait le bruit documentaire de ~36% sans perte d'information utile.
