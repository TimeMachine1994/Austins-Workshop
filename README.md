# Austin's Workshop

A SvelteKit "mega site" portal for hosting small, self-contained demo apps —
each app is an isolated module with its own libSQL/Turso database, own
Drizzle schema, and own routes under `/apps/<slug>`.

## Quickstart

```sh
npm install
npm run dev -- --open
```

The `counter` example app's database (`data/counter.db`) is already migrated
and ready to use. Visit `/apps/counter` to try it.

## Architecture

- **Portal shell**: `src/routes/+layout.svelte` + `src/lib/components/Nav.svelte`
  render shared nav/chrome around every page. Tailwind CSS handles styling.
- **App registry**: `src/lib/apps/registry.ts` is the single source of truth
  for which apps appear on the homepage grid and in the nav.
- **Per-app isolation**: every mini-app lives in `src/lib/apps/<slug>/` with
  its own Drizzle schema (`db/schema.ts`), its own libSQL client
  (`db/client.ts`), and its own `drizzle.config.ts`/migrations. Apps never
  share tables or connections — each is backed by its own database file
  under `data/<slug>.db` (gitignored).
- **Routes**: each app's UI lives at `src/routes/apps/<slug>/`.

See `docs/adding-a-new-app.md` for the exact steps to add a new mini-app.

## Admin dashboard

A hidden "command center" app lives at `/apps/admin` — not linked from the
homepage or nav, reachable only by navigating there directly. It treats every
other registered app's database as a "virtual database" section and lets you
browse, sort, paginate, create, edit, and delete rows in any of their tables,
introspected at runtime (no per-table config, works the same once apps move
to Turso). See `docs/adding-a-new-app.md` and `src/lib/apps/admin/` for
details.

It's gated behind a session-cookie login. Create the (single) admin user
with:

```sh
npm run admin:create-user
```

This prompts for a username/password on stdin and stores a scrypt-hashed
password in its own `data/admin.db` — there is no public signup page.

## Database: local libSQL now, Turso later

Locally, each app's `db/client.ts` points at a local file
(`file:data/<slug>.db`). When ready to go live, create a Turso database per
app and set that app's `<SLUG>_DATABASE_URL` / `<SLUG>_AUTH_TOKEN` env vars
(e.g. `COUNTER_DATABASE_URL`, `SCREENWRITER_DATABASE_URL`, ...) —
`db/client.ts` already reads from `process.env` first, so **no code changes**
are needed to switch from local dev to Turso.

## Building

```sh
npm run build
```

Preview the production build with `npm run preview`.

> No deployment adapter has been chosen yet — this project currently uses
> `@sveltejs/adapter-auto`. Swap it once a host is decided.
