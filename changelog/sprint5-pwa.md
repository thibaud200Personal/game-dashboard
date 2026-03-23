# Sprint 5 — Progressive Web App (PWA)

## Problème
L'application est une web app standard, non installable sur mobile/desktop. Pas de service worker, pas de manifest.

## État actuel
- `vite.config.ts` : aucun plugin PWA
- `index.html` : aucun `manifest.json` lié, aucune meta PWA
- Pas de service worker dans `public/`

## Ce qui manque

### 1. Plugin Vite PWA
```bash
npm install --save-dev vite-plugin-pwa
```

Dans `vite.config.ts` :
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    // ... plugins existants
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Board Game Dashboard',
        short_name: 'BGDashboard',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
```

### 2. Icônes
- Créer/exporter `public/icon-192.png` et `public/icon-512.png`
- Icône aux couleurs du thème de l'application

### 3. Meta tags dans `index.html`
```html
<meta name="theme-color" content="#1a1a2e">
<link rel="apple-touch-icon" href="/icon-192.png">
```

## Note
Pas de besoin offline identifié — scope limité à "installable" (bouton "Ajouter à l'écran d'accueil" sur mobile). Le service worker met en cache les assets statiques uniquement.

## Fichiers à créer/modifier
- `vite.config.ts` — ajouter VitePWA plugin
- `index.html` — meta tags
- `public/icon-192.png` et `public/icon-512.png` — icônes

## Estimation
1 jour
