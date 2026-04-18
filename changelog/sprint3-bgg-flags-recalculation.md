# Sprint 3 — Recalcul has_expansion / has_characters

## Constat (avril 2026)

Le bug est plus large que prévu. Il ne concerne pas uniquement l'import BGG.

## Ce qui fonctionne ✅

- Import BGG → `has_expansion: (bggGame.expansions?.length || 0) > 0` calculé correctement (`useGamesPage.ts:236`)
- `has_characters: false` à l'import BGG → correct (BGG ne fournit pas de données personnages)
- `GameService.getById()` charge toujours expansions + characters sans condition sur les flags

## Bug ⚠️

`GameService.addExpansion()` et `GameService.deleteExpansion()` ne mettent pas à jour `has_expansion` sur le jeu parent. Même chose pour `addCharacter` / `deleteCharacter`.

```ts
// GameService.ts — addExpansion
addExpansion(gameId: number, data: ...): GameExpansion {
  const id = this.gameRepo.createExpansion(gameId, data)
  return { ...data, expansion_id: id, game_id: gameId }
  // ❌ has_expansion non mis à true sur le jeu parent
}

// GameService.ts — deleteExpansion
deleteExpansion(expansionId: number): void {
  this.gameRepo.deleteExpansion(expansionId)
  // ❌ has_expansion non repassé à false si c'était la dernière expansion
}
```

Conséquence : `GameService.getAll()` gate le chargement des expansions sur `has_expansion` :

```ts
expansions: g.has_expansion ? this.gameRepo.findExpansions(g.game_id) : [],
```

→ Une expansion ajoutée via le dialog n'apparaît pas dans la liste si l'utilisateur n'avait pas coché "Has expansions" au moment de la création du jeu.

## Correction à faire

Dans `GameService` :

```ts
addExpansion(gameId, data) {
  const id = this.gameRepo.createExpansion(gameId, data)
  this.gameRepo.update(gameId, { has_expansion: true })   // ← ajouter
  return { ...data, expansion_id: id, game_id: gameId }
}

deleteExpansion(expansionId) {
  this.gameRepo.deleteExpansion(expansionId)
  // recalculer : si plus aucune expansion, passer has_expansion à false
  const gameId = ... // récupérer avant delete, ou ajouter findById sur expansion
  const remaining = this.gameRepo.findExpansions(gameId)
  if (!remaining.length) this.gameRepo.update(gameId, { has_expansion: false })
}
```

Même logique pour `addCharacter` / `deleteCharacter` → `has_characters`.

## Impact

Faible en pratique : `getById()` (vue détail) charge toujours les expansions. La liste principale (`getAll()`) est affectée mais l'utilisateur voit quand même les expansions en ouvrant le détail du jeu.
