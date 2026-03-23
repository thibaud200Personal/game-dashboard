# Sprint 4 — Export / Import Données

## Problème
Les boutons Export, Import et Reset existent dans `SettingsPage` mais les handlers sont des stubs vides. Aucun endpoint backend n'est implémenté.

## État actuel

### `src/views/SettingsPageView.tsx` (lignes 160–191)
```tsx
<Button onClick={props.handleExportData}>
  <Download /> Export Data
</Button>
<Button onClick={props.handleImportData}>
  <Upload /> Import Data
</Button>
<Button onClick={props.handleResetData}>
  <Trash /> Reset All Data
</Button>
```
UI en place, boutons fonctionnels visuellement.

### `src/hooks/useSettingsPage.ts` (lignes 52–62)
```typescript
const handleExportData = () => {
  // Implementation for data export would go here
};
const handleImportData = () => {
  // Implementation for data import would go here
};
const handleResetData = () => {
  // Implementation for data reset would go here
};
```
Stubs vides.

### `backend/server.ts`
Aucun endpoint `/api/export`, `/api/import`, ou `/api/reset`.

## Ce qui manque

### Backend

#### `GET /api/export`
```typescript
app.get('/api/export', async (req, res) => {
  const data = await db.exportAll(); // retourne { players, games, sessions, ... }
  res.json(data);
});
```
Dans `DatabaseManager.ts` : méthode `exportAll()` qui retourne toutes les tables en JSON.

#### `POST /api/import`
```typescript
app.post('/api/import', async (req, res) => {
  await db.importAll(req.body); // valide et réimporte
  res.json({ success: true });
});
```
Avec validation Zod du body importé.

#### `DELETE /api/reset` (optionnel, dangereux)
Requiert confirmation explicite (header ou body spécifique).

### Frontend

#### `handleExportData` dans `useSettingsPage.ts`
```typescript
const handleExportData = async () => {
  const data = await ApiService.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `board-game-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

#### `handleImportData` dans `useSettingsPage.ts`
```typescript
const handleImportData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    await ApiService.importData(data);
    toast.success('Données importées avec succès');
  };
  input.click();
};
```

## Fichiers à modifier
- `backend/server.ts` — 2-3 nouvelles routes
- `backend/database/DatabaseManager.ts` — méthodes `exportAll()` et `importAll()`
- `src/hooks/useSettingsPage.ts` — implémenter les 3 handlers
- `src/services/ApiService.ts` — méthodes `exportData()` et `importData()`

## Estimation
3-4 jours
