# App Lifecycle: Installing & Uninstalling Mini-Apps

Each mini-app is a fully isolated module: its own database file, its own
Drizzle schema/migrations, its own routes, and (optionally) its own auth and
its own contributions to the shared component library. Because everything an
app owns lives in a small, predictable set of locations, **installing and
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
| `data/<slug>.db` (gitignored) | local database file | if the app has a db |
| one branch in `src/hooks.server.ts` + one field in `src/app.d.ts` | session validation → `locals.<slug>` | only if the app has auth |
| `src/lib/ui/<slug>/` + entries in `src/lib/ui/catalog.ts` + demos in `src/routes/apps/gallery/+page.svelte` | reusable components extracted from the app | only if extracted |
| `<SLUG>_DATABASE_URL` / `<SLUG>_AUTH_TOKEN` env vars | Turso, production | only when deployed |

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
only tables this app needs. Never import another app's schema; each app's
tables live in their own database file, so there's nothing to share.

## 3. Wire up the client

Copy `src/lib/apps/counter/db/client.ts` and update:

- the `file:data/todo.db` path
- the env var names (`TODO_DATABASE_URL`, `TODO_AUTH_TOKEN`) for the future
  Turso swap

## 4. Add the drizzle-kit config

Copy `drizzle.config.example.ts` (repo root) into
`src/lib/apps/todo/drizzle.config.ts` and replace `<slug>` with `todo`.

## 5. Generate and run the migration

```bash
npx drizzle-kit generate --config=src/lib/apps/todo/drizzle.config.ts
npx drizzle-kit migrate --config=src/lib/apps/todo/drizzle.config.ts
```

This creates `data/todo.db` and applies the schema.

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

> **Before you start:** the database file is the only part that isn't in git.
> If any of its data matters, export it first (e.g. sqlite dump of
> `data/<slug>.db`, or the app's own export features).

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

## 6. Delete the database

```bash
rm -f data/<slug>.db data/<slug>.db-*
```

If deployed: also delete the Turso database and remove the
`<SLUG>_DATABASE_URL` / `<SLUG>_AUTH_TOKEN` env vars from the host.

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

## Later: swapping to Turso

When ready to take an app's database remote:

1. Create a Turso database (`turso db create <slug>`).
2. Set `<SLUG>_DATABASE_URL` and `<SLUG>_AUTH_TOKEN` env vars (e.g. via `.env`).
3. No code changes — `db/client.ts` already reads from `process.env` and falls
   back to the local file only when those vars are unset.
