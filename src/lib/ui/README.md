# Component Library (`$lib/ui`)

Reusable components for the whole site, organized by the app they originated
in. Every component here is theme-agnostic and app-agnostic so it can be
reused in future mini-apps (or future projects).

## Layout

```
src/lib/ui/
├── catalog.ts      # typed index of every component (origin app, description, status)
├── index.ts        # barrel: import { Button, Card } from '$lib/ui'
├── shared/          # generic primitives (Button, Input, Card, Modal, ...)
├── workshop/        # components born in the portal shell (Nav, AppCard, ThemePicker)
└── <app-slug>/      # components extracted from a mini-app (e.g. screenwriter/)
```

## Rules

1. **Semantic tokens only.** Use `bg-surface`, `bg-panel`, `text-ink`,
   `text-ink-muted`, `border-edge`, `bg-accent`, `text-danger`, etc. (defined
   in `src/app.css`). Never raw palette classes (`bg-neutral-900`,
   `text-red-400`). This is what makes every component work under every theme
   in `src/lib/themes/` with zero changes.
2. **No app imports.** A `ui/` component must never import from
   `$lib/apps/*`. Data comes in via props/snippets; app logic stays in the app.
3. **Catalog every component.** Each component gets a `catalog.ts` entry
   recording its origin app. The catalog powers the hidden `/apps/gallery`
   reference page — when adding a component, also wire a demo snippet into
   `src/routes/apps/gallery/+page.svelte`.
4. **Promote, don't preempt.** Components start in their origin-app folder;
   move them to `shared/` only once a second app actually uses them.
   Don't extract app-specific components (e.g. the screenplay editor) at all.

## Adding a theme

See `src/lib/themes/registry.ts` — one CSS file + one registry entry; no
component changes needed if rule 1 was followed.
