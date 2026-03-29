# Mises à jour techniques planifiées

## ✅ Livrées (mars 2026)

| Package | De | Vers | PR | Notes |
|---|---|---|---|---|
| Vite | 7 | 8 | #62 | Aucun changement `vite.config.ts` requis |
| recharts | 2 | 3 | #63 | Aucun changement code requis (charts = placeholders) |
| express | 4 | 5 | #61 | Adapté : `.issues`, casts `req.params` |
| zod | 3 | 4 | #61 | Adapté : `ZodError.errors` → `.issues` |
| lucide-react | 0.x | 1.x | #63 | Aucun changement code requis |
| dotenv | 16 | 17 | #60 | Drop-in |
| globals | 16 | 17 | #60 | ESLint uniquement |
| @types/node | 24 | 25 | #60 | Types uniquement |

## ⏳ Différées — écosystème pas prêt

| Package | Version cible | Condition |
|---|---|---|
| TypeScript | 6 | Attendre ts-node + vitest + typescript-eslint compatibles |
| ESLint | 10 | Attendre eslint-plugin-react-hooks + sonarjs compatibles |
