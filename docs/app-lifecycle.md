# App Lifecycle: Installing & Uninstalling Mini-Apps

Each mini-app is a fully isolated module: its own Drizzle schema/migrations,
its own routes, and (optionally) its own auth and its own contributions to the
shared component library — but all apps share one database (local
`data/workshop.db`, or Turso via `URL`/`TURSO_KEY`). Because everything
an app owns lives in a small, predictable set of locations, **installing and
uninstalling are mirror images of each other** — the uninstall checklist is
the install checklist run in reverse.

> This process is manual for now. It may become tooling (`npm run app:create`
> / `app:remove`) later, but the on-disk footprint below is the contract
> either way.

## An app's complete footprint

Everything an app called `<slug>` may own, and nothing else:

| Location | Purpose | Required? |
|---|---|---|
| `src/lib/apps/<slug>/` | module: `db/` (schema, client, migrations), `drizzle.config.ts`, optional `auth/`, optional app-internal components | yes |
| `src/routes/apps/<slug>/` | all pages + API endpoints | yes |
| one entry in `src/lib/apps/registry.ts` | homepage/nav/admin discovery | yes |
| `data/workshop.db` (gitignored) | the shared local database file | if the app has a db |
| one branch in `src/hooks.server.ts` + one field in `src/app.d.ts` | session validation → `locals.<slug>` | only if the app has auth |
| `src/lib/ui/<slug>/` + entries in `src/lib/ui/catalog.ts` + demos in `src/routes/apps/gallery/+page.svelte` | reusable components extracted from the app | only if extracted |
| `URL` / `TURSO_KEY` env vars | shared Turso database, production | only when deployed |

Rules that keep this clean:

- **Apps never import from other apps** (`$lib/apps/<other>/...` is off-limits).
  Shared code lives in `$lib/ui` (components) or future shared libs.
- **`$lib/ui` components never import from any app** — data via props only.
- **Pages use only semantic theme tokens** (`bg-surface`, `text-ink`, ...),
  never raw palette classes. See `src/lib/ui/README.md`.

---

# Installing an app

Steps below use `todo` as the example slug.

## 1. Scaffold the module folder

```
src/lib/apps/todo/
├── db/
│   ├── schema.ts
│   ├── client.ts
│   └── migrations/      # created by drizzle-kit, do not hand-write
└── drizzle.config.ts
```

Easiest path: copy `src/lib/apps/counter/` (simplest possible app) and rename
`counter` → `todo` throughout. For an app with accounts, crib from
`src/lib/apps/screenwriter/` instead (it adds `auth/`, API routes, and
signup/login pages).

## 2. Define the schema

Edit `src/lib/apps/todo/db/schema.ts` using `drizzle-orm/sqlite-core` — define
only tables this app needs. Never import another app's schema. Because all
apps share one database, **prefix every table name with `<slug>_`** (e.g.
`todo_items`), unless the table name is already globally unique.

## 3. Wire up the client

Copy `src/lib/apps/counter/db/client.ts` as-is — it already points at the
shared database (`file:data/workshop.db` locally, or `URL`/`TURSO_KEY`
for Turso). No per-app edits needed.

## 4. Add the drizzle-kit config

Copy `drizzle.config.example.ts` (repo root) into
`src/lib/apps/todo/drizzle.config.ts` and replace `<slug>` with `todo`.

## 5. Generate and run the migration

```bash
npx drizzle-kit generate --config=src/lib/apps/todo/drizzle.config.ts
npx drizzle-kit migrate --config=src/lib/apps/todo/drizzle.config.ts
```

This applies the schema to the shared `data/workshop.db`, tracking the
migration in the `todo_drizzle_migrations` table so apps don't step on each
other's migrations.

## 6. Add routes

```
src/routes/apps/todo/
├── +page.server.ts   # load / actions, imports db client + schema from $lib/apps/todo
└── +page.svelte       # UI — semantic tokens + $lib/ui components only
```

## 7. Register the app

Add one entry to `src/lib/apps/registry.ts`:

```ts
{
  slug: 'todo',
  title: 'Todo List',
  description: 'A simple todo list demo.',
  icon: '✅'
}
```

This automatically adds it to the homepage grid, the top nav, and the admin
dashboard (`/apps/admin`) as a "virtual database" — nothing else to wire up.
Set `hidden: true` to keep it off the homepage/nav (as `admin` and `gallery`
do). Apps without a `db/client.ts` are automatically skipped by the admin
dashboard.

## 8. (Optional) Per-app auth

If the app needs its own accounts, mirror `src/lib/apps/screenwriter/auth/`
(own `users`/`sessions` tables, own cookie name, cookie path scoped to
`/apps/todo`), then:

- add a branch in `src/hooks.server.ts` for `pathname.startsWith('/apps/todo')`
  populating `event.locals.todo = { user, session }`
- add the matching field to `App.Locals` in `src/app.d.ts`

Never reuse another app's auth module or tables.

## 9. (Optional) Contribute components to the library

If a component you built is genuinely reusable, move it to
`src/lib/ui/todo/`, export it from `src/lib/ui/index.ts`, add a
`catalog.ts` entry (with `originApp: 'todo'`), and wire a demo snippet into
`src/routes/apps/gallery/+page.svelte`. See `src/lib/ui/README.md` for the
rules.

## 10. Verify

```bash
npm run check && npm run build
```

Then click through: homepage tile, the app itself, and its tables in
`/apps/admin`.

---

# Uninstalling an app

The same steps in reverse. Work top-down so nothing dangles mid-way.

> **Before you start:** the database is the only part that isn't in git, and
> it's shared with every other app. If any of the app's data matters, export
> it first (e.g. a sqlite dump filtered to the app's `<slug>_`-prefixed
> tables, or the app's own export features).

## 1. Unregister

Remove the app's entry from `src/lib/apps/registry.ts`. It disappears from
the homepage, nav, and admin dashboard immediately.

## 2. Delete the routes

```bash
rm -rf src/routes/apps/<slug>/
```

## 3. Remove auth wiring (if the app had auth)

- delete the app's branch from `src/hooks.server.ts`
- delete the app's field from `App.Locals` in `src/app.d.ts`

## 4. Handle its component-library contributions (if any)

For each `src/lib/ui/<slug>/` component, decide:

- **Still used by another app?** Keep it — `originApp` in the catalog is
  historical provenance, not a dependency. Nothing to do.
- **Used by nothing else?** Delete the component, its `catalog.ts` entry,
  its export in `src/lib/ui/index.ts`, and its demo snippet in
  `src/routes/apps/gallery/+page.svelte`.

## 5. Delete the module

```bash
rm -rf src/lib/apps/<slug>/
```

(This removes the schema, client, migrations, and drizzle config in one go.)

## 6. Delete the app's tables

The database is shared, so don't delete the file — drop only this app's
`<slug>_`-prefixed tables:

```sql
-- list them first
SELECT name FROM sqlite_master
WHERE type = 'table' AND (name = '<slug>' OR name LIKE '<slug>\_%') ESCAPE '\';
```

If deployed: drop the same tables from Turso. Leave `URL` / `TURSO_KEY`
alone — every other app still uses them.

## 7. Verify a clean removal

```bash
# no code references left anywhere:
grep -ri "apps/<slug>" src/
# still compiles and builds:
npm run check && npm run build
```

Both greps coming back empty plus a green build means the uninstall left no
trace.

---

## Later: deploying to Turso

All apps share one database, so this is a one-time site-wide switch:

1. Create one Turso database (`turso db create workshop`).
2. Set `URL` and `TURSO_KEY` env vars (e.g. via `.env`, and in Vercel).
3. Run every app's migrations against it:
   ```bash
   for slug in admin counter screenwriter slideshow; do
     npx drizzle-kit migrate --config=src/lib/apps/$slug/drizzle.config.ts
   done
   ```
4. Recreate the admin user (`npm run admin:create-user`) against Turso.

No code changes — every `db/client.ts` already reads `URL`/`TURSO_KEY`
and falls back to the local file only when they're unset.
