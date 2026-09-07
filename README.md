# Austin's Workshop

A SvelteKit "mega site" portal for hosting small, self-contained demo apps —
each app is an isolated module with its own Drizzle schema, own routes, and
(optionally) own auth, all sharing one libSQL/Turso database.

## Quickstart

```sh
npm install
npm run dev -- --open
```

All apps share a single local database (`data/workshop.db`). Run the
migrations for each app, then visit `/apps/counter` to try the example app.

## Architecture

- **Portal shell**: `src/routes/+layout.svelte` + `src/lib/components/Nav.svelte`
  render shared nav/chrome around every page. Tailwind CSS handles styling.
- **App registry**: `src/lib/apps/registry.ts` is the single source of truth
  for which apps appear on the homepage grid and in the nav.
- **Per-app isolation**: every mini-app lives in `src/lib/apps/<slug>/` with
  its own Drizzle schema (`db/schema.ts`), its own libSQL client
  (`db/client.ts`), and its own `drizzle.config.ts`/migrations. Apps never
  share tables or connections — but they share one database, so every table
  name is prefixed with its app slug (e.g. `screenwriter_users`) to keep
  apps from colliding.
- **Routes**: each app's UI lives at `src/routes/apps/<slug>/`.

See `docs/app-lifecycle.md` for the exact steps to install a new mini-app —
and to uninstall one cleanly (the two are mirror images).

## Admin dashboard

A hidden "command center" app lives at `/apps/admin` — not linked from the
homepage or nav, reachable only by navigating there directly. It treats every
other registered app's database as a "virtual database" section and lets you
browse, sort, paginate, create, edit, and delete rows in any of their tables,
introspected at runtime (no per-table config, works the same once apps move
to Turso). See `docs/app-lifecycle.md` and `src/lib/apps/admin/` for
details.

It's gated behind a session-cookie login. Create the (single) admin user
with:

```sh
npm run admin:create-user
```

This prompts for a username/password on stdin and stores a scrypt-hashed
password in the shared database's `admin_users` table — there is no public
signup page.

## Database: local libSQL now, Turso in production

Locally, every app's `db/client.ts` points at the same local file
(`file:data/workshop.db`). To go live, create one Turso database and set
`URL` / `TURSO_KEY` — `db/client.ts` already reads from `process.env`
first, so **no code changes** are needed to switch from local dev to Turso.

## Building

```sh
npm run build
```

Preview the production build with `npm run preview`.

> No deployment adapter has been chosen yet — this project currently uses
> `@sveltejs/adapter-auto`. Swap it once a host is decided.
