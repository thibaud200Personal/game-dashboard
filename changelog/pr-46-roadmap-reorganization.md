# PR #46 — Réorganisation Roadmap + Changelog (Mars 2026)

## Changements

### ROADMAP.md
- ✅ Correction du fragment dupliqué en début de fichier
- ✅ Statuts corrigés : tests (0 → 31/31 ✅), React Query (à faire → ✅ déjà intégré), BGG Schema (terminé → ⚠️ partiel)
- ✅ Comparaison V1 corrigée : "0 tests" → "31/31 ✅"
- ✅ Double "Phase 4" résolu → Phase 4 (évolutions moyennes) + Phase 5 (long terme)
- ✅ Section "Infrastructure Tests" dédupliquée (était présente 3 fois)
- ✅ Bugs connus remontés en section dédiée `🐛 Bugs Connus & Polish`
- ✅ Historique PRs réduit à un tableau de référence avec liens
- ✅ Sprints renumérotés dans l'ordre de priorité : BGG → Tests → Polish → Features → Long terme

### Répertoire `changelog/`
- ✅ `pr-43-fix-popups-delete.md` — détail PR #43
- ✅ `pr-44-stack-update.md` — détail PR #44
- ✅ `pr-45-remove-spark.md` — détail PR #45
- ✅ `planned-updates.md` — Vite 8 et recharts 3 planifiés
- ✅ 23 fichiers de détail par item de sprint (sprint1 à sprint5)

### `.gitattributes`
- ✅ Ajout `.gitattributes` : force LF sur tous les fichiers texte (projet Docker/Linux)
- ✅ `git add --renormalize .` appliqué pour normaliser les fichiers existants
