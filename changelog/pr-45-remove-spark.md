# PR #45 — Suppression @github/spark + nettoyage dépendances (Mars 2026)

## Suppressions principales

- ✅ **`@github/spark`** supprimé — SDK plateforme inutilisé dans ce projet

## 15 packages morts supprimés

| Package | Raison |
|---|---|
| `d3` | Jamais utilisé (Recharts suffit) |
| `framer-motion` | Jamais utilisé |
| `three` | Jamais utilisé |
| `uuid` | Jamais utilisé |
| `@heroicons/react` | Remplacé par @phosphor-icons/react |
| `next-themes` | Remplacé par solution custom |
| `rollup` | Géré par Vite, inutile en dépendance directe |
| `winston` | Jamais utilisé |
| `loglevel` | Jamais utilisé |
| `date-fns` | Jamais utilisé |
| `octokit` | Jamais utilisé |
| `react-resizable-panels` | Composant orphelin supprimé |
| `@hookform/resolvers` | Non utilisé dans les formulaires actuels |
| `zod` | Utilisé uniquement côté backend (non nécessaire en dep frontend) |
| `@tanstack/react-query` | Nettoyé (réintégré proprement via imports directs) |

## Nettoyage composants

- ✅ **`resizable.tsx`** supprimé — composant shadcn/ui orphelin sans consommateur

## Nettoyage CSS

- ✅ Commentaires explicatifs ajoutés sur `tw-animate-css` et `@radix-ui/colors` — ces packages ne sont utilisés que via `@import` CSS, non comme imports JS
