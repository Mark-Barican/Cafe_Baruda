# Roast & Bloom Next.js App

Production-ready Next.js (App Router) cafe website with data-driven menu rendering from CSV/Excel-compatible sources.

## Stack

- Next.js (App Router) + TypeScript
- React Server Components (default) with a client component for menu filtering/search
- `papaparse` + `xlsx` for CSV/Excel parsing
- `react-icons` for iconography

## Project Structure

- `app/` - routes, pages, API endpoints
- `components/` - reusable UI modules
- `lib/data/` - data loading and transformation
- `lib/utils/` - formatting helpers
- `data/raw/` - source data files (CSV/Excel)

## Local Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Main routes:
- `/` - marketing landing page
- `/menu` - customer menu browser
- `/pos` - separate staff POS ordering terminal
- `/pos/history` - persisted orders history (staff)

## Production Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Add environment variable:
   - `DATABASE_URL` = your Neon connection string
   - `GBP_TO_PHP_RATE` = GBP to PHP conversion rate (optional, defaults to `73`)
4. Keep default settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: auto
5. Deploy.

## Data Source Notes

- Menu and pricing are parsed from `data/raw/items.csv`.
- Source prices are converted from GBP to PHP in the app layer.
- Ingredient references are parsed from `data/raw/recipe.csv` and `data/raw/ingredients.csv`.
- The loader supports `.csv`, `.xlsx`, and `.xls` for each source name.

## POS Database Persistence (Neon)

- POS orders are submitted from `/pos` to `POST /api/orders`.
- Recent persisted orders can be read via `GET /api/orders?limit=25` and viewed at `/pos/history`.
- The API persists records into Neon Postgres using `DATABASE_URL`.
- Tables are created automatically on first order write:
  - `orders`
  - `order_items`
