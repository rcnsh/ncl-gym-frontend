# ncl-gym-frontend

Charts of gym occupancy over time, read from a Postgres table.

A single-page Next.js app (pages router). On each request the page reads every row from the `gym_occupancy` table and renders two charts: an area chart of occupancy over the last 30 days, 7 days or 24 hours, and a bar chart of the average occupancy per day for the last seven days with data. This repo only reads the data; whatever writes rows into `gym_occupancy` lives elsewhere.

<!-- TODO: add screenshot/GIF at docs/screenshot.png -->
<!-- ![ncl-gym-frontend screenshot](docs/screenshot.png) -->

Built from [create-t3-app](https://create.t3.gg/) with Next.js 15, React 19, Prisma, Tailwind CSS 4, shadcn/ui and Recharts.

## Quickstart

Needs Node.js, pnpm (`packageManager` pins `pnpm@10.4.1`) and a Postgres database.

```sh
pnpm install               # also runs `prisma generate`
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/gym"' > .env
pnpm db:push               # create the gym_occupancy table from prisma/schema.prisma
pnpm dev                   # http://localhost:3000
```

The page is empty until the table has rows. There are no migrations in `prisma/migrations`, so use `db:push` rather than `db:migrate` against a fresh database.

## Configuration

Environment variables are validated at build and start time by `src/env.js` (`@t3-oss/env-nextjs` + zod).

| Variable | Required | Read in | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | `src/env.js`, `prisma/schema.prisma` | Postgres connection URL. Must be a valid URL. |
| `NODE_ENV` | no | `src/env.js`, `src/server/db.ts` | `development` (default), `test` or `production`. In `development` Prisma logs queries. |
| `SKIP_ENV_VALIDATION` | no | `src/env.js` | Any non-empty value skips env validation, e.g. for builds without a database. |

No client-side (`NEXT_PUBLIC_*`) variables are used.

### Data model

`prisma/schema.prisma`:

```prisma
model gym_occupancy {
  id              Int      @id @default(autoincrement())
  timestamp       DateTime @default(now())
  occupancy_level Int
  @@index([timestamp], name: "idx_timestamp")
}
```

### Exporting data

`export.ts` dumps every row (ordered by `timestamp`) to `data.json` for analysis outside the app. `data.json` in the repo is a committed snapshot of that output. There is no script for it in `package.json`; it needs a TypeScript runner that understands the `@/` path alias.

## Deployment

It's a standard Next.js server build. The page uses `getServerSideProps`, so it needs a Node runtime with `DATABASE_URL` set, not a static export.

```sh
pnpm build
pnpm start
```

There is no hosting config in the repo (no `vercel.json`, `wrangler` config or Dockerfile). See the create-t3-app guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker).

## Contributing

Setup is the Quickstart above. Before opening a PR:

```sh
pnpm typecheck       # tsc --noEmit
pnpm lint            # next lint
pnpm format:check    # prettier; `pnpm format:write` to fix
pnpm build
```

`pnpm check` runs lint and typecheck together. `next lint` loads `next.config.js`, which validates env vars, so set `DATABASE_URL` or `SKIP_ENV_VALIDATION=1` first. There are no tests.

Keep PRs small and focused, describe what changed and why, and include a screenshot for visual changes. Don't commit `.env` files.

Other scripts: `pnpm db:studio` (Prisma Studio), `pnpm db:generate` (`prisma migrate dev`), `pnpm preview` (build and start).
