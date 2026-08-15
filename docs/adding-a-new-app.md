# Adding a New Mini-App

Each mini-app is a fully isolated module: its own database file, its own Drizzle
schema/migrations, its own routes. Follow these steps to add one (using `todo`
as an example slug).

## 1. Scaffold the module folder

```
src/lib/apps/todo/
├── db/
│   ├── schema.ts
│   ├── client.ts
│   └── migrations/      # created by drizzle-kit, do not hand-write
└── drizzle.config.ts
```

Easiest path: copy `src/lib/apps/counter/` and rename `counter` → `todo`
throughout (folder name, table name, file contents).

## 2. Define the schema

Edit `src/lib/apps/todo/db/schema.ts` using `drizzle-orm/sqlite-core` — define
only tables this app needs. Never import another app's schema; each app's
tables live in their own database file, so there's nothing to share.

## 3. Wire up the client

Copy `src/lib/apps/counter/db/client.ts` into `src/lib/apps/todo/db/client.ts`
and update:

- the `file:data/todo.db` path
- the env var names (e.g. `TODO_DATABASE_URL`, `TODO_AUTH_TOKEN`) for the
  future Turso swap

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
└── +page.svelte       # UI
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

This automatically adds it to the homepage grid and the top nav — no other
shared file needs to change.

> New apps are also picked up automatically by the admin dashboard
> (`/apps/admin`) as a new "virtual database" section — it discovers apps via
> this same registry plus a glob over `db/client.ts` files, so there's nothing
> extra to wire up there either. Set `hidden: true` on the registry entry
> instead of a real `icon`/etc. if an app shouldn't appear on the homepage
> grid or nav (as `admin` itself does).

## Later: swapping to Turso

When ready to go remote, for each app:

1. Create a Turso database (`turso db create <slug>`).
2. Set `<SLUG>_DATABASE_URL` and `<SLUG>_AUTH_TOKEN` env vars (e.g. via `.env`).
3. No code changes — `db/client.ts` already reads from `process.env` and falls
   back to the local file only when those vars are unset.
