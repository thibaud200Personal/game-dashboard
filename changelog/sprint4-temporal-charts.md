# Sprint 4 — Graphiques Temporels (Recharts)

## Problème
L'infrastructure Recharts est prête et les données sont calculées dans les hooks, mais les graphiques ne sont pas implémentés. Des placeholders "coming soon" sont en place.

## État actuel

### Infrastructure disponible
- `src/components/ui/chart.tsx` : wrapper Recharts avec `ChartLineUpContainer`, `ChartLineUpTooltip`, `ChartLineUpLegend` — prêt pour LineChart, BarChart, AreaChart

### Données déjà calculées
- **`src/hooks/useGameStatsPage.ts` (lignes 90–99)** :
  - `performanceTrend` : array des 10 dernières sessions avec scores moyens
  - `playFrequency` : objet `{ 'YYYY-MM': count }` — sessions groupées par mois

### Placeholders à remplacer
- **`src/views/GameStatsView.tsx` (lignes 220–234)** : barres CSS manuelles (hauteur proportionnelle) → remplacer par `<BarChart>` Recharts
- **`src/views/PlayerStatsView.tsx` (lignes 255–265)** :
  ```tsx
  <ChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
  <p>Detailed charts coming soon...</p>
  ```
  → remplacer par graphiques Recharts réels

## Graphiques à implémenter

### 1. GameStatsView — BarChart fréquence par mois
Données : `playFrequency` (`{ '2025-11': 3, '2025-12': 7, '2026-01': 2 }`)
```tsx
<BarChart data={Object.entries(playFrequency).map(([month, count]) => ({ month, count }))}>
  <XAxis dataKey="month" />
  <YAxis />
  <Bar dataKey="count" />
</BarChart>
```

### 2. GameStatsView — LineChart scores dans le temps
Données : `performanceTrend` (10 dernières sessions avec `{ date, avgScore }`)
```tsx
<LineChart data={performanceTrend}>
  <XAxis dataKey="date" />
  <YAxis />
  <Line type="monotone" dataKey="avgScore" />
</LineChart>
```

### 3. PlayerStatsView — LineChart performances joueur
Données à ajouter dans `usePlayerStatsPage.ts` : sessions du joueur avec scores, triées par date

## Note importante
Voir `changelog/planned-updates.md` : recharts 3 est planifié avec une migration d'API. Vérifier la version actuellement installée avant d'implémenter (API recharts 2 vs 3 diffère sur certains composants).

## Fichiers à modifier
- `src/views/GameStatsView.tsx` — remplacer barres CSS par BarChart + ajouter LineChart
- `src/views/PlayerStatsView.tsx` — remplacer placeholder par LineChart
- `src/hooks/usePlayerStatsPage.ts` — ajouter données temporelles si manquantes

## Estimation
1 semaine
