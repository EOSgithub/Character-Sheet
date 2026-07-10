# CLAUDE.md

Guidance for working in this repository. **Read the Product charter first** —
most past mistakes came from building the wrong thing well, not from bad code.

## Product charter (the vision — do not drift from this)

**Savant Codex** is a play-at-the-table companion for **one character**: the
owner's **Savant** (a homebrew D&D 2024 class by /u/laserllama — a non-magical
scholar-detective; signature mechanic *Adroit Analysis*). It runs on an
**iPad in landscape (~1180×820)** propped next to dice and a beer. Think
"a leaner D&D Beyond": the same level of visual quality and rules accuracy,
a fraction of the features.

**What it is for** — answering, mid-session, in one glance or one tap:
- What can I do right now? (attacks, feature uses, what my Focus gives me)
- Take damage / heal / spend a hit die / rest.
- What does this feature/item actually say? (full rules text readable in
  place, one tap away — never "go look it up somewhere else")

**What it is NOT:**
- Not a general character builder for arbitrary classes. Savant-only, done well.
- Not a rules wiki you *browse*. Reference text serves the sheet, not the
  other way round.
- Not a bookkeeping simulator. No micro-trackers for things a player just
  remembers (e.g. reactions-used-this-round). If a widget wouldn't be touched
  in a real session, it shouldn't exist.

**Direction the owner wants (confirmed 2026-07):**
- An **Actions view**: one combat surface listing everything the character can
  do — attacks with to-hit/damage, feature uses, bonus actions, reactions.
- **Readable descriptions everywhere**: tap any feature/item → full rules text
  inline (modal/expand), without leaving the sheet.
- **Fewer battle micro-trackers** — the reactions-per-round counter is the
  canonical example of what to remove, not extend.
- Keep: Compendium, Inventory (with weight/coins), Level-up flow.

**Every UI decision is judged at iPad landscape width first.** Desktop and
phone must not break, but they are secondary. Use `npm run shots` (captures
`ipad` viewport by default) and actually look at the PNGs.

## Stack & commands

Vite + React 19 + TypeScript, React Router (HashRouter), no backend.
Character data lives in `localStorage`; JSON export/import moves it between
devices. Deployed to GitHub Pages via `.github/workflows/deploy.yml` on push
to `main`.

```sh
npm run dev      # local dev server
npm run build    # tsc -b + vite build — THE correctness gate (no tests/linter)
npm run shots    # screenshot every page (see screenshot-app skill)
```

## Architecture

Everything hangs off a single **`Character`** object (`src/types.ts`). Nothing
is precomputed and stored: live edits mutate the raw `Character`, and every
displayed stat is a **pure derivation** of it.

- **`src/types.ts`** — the `Character` domain type plus static game tables
  (`SKILLS`, `ARMORS`, `CONDITIONS`, `ITEM_CATEGORIES`, ability keys). The
  authoritative shape of persisted data.
- **`src/state/store.tsx`** — React context store. `useStore()` exposes
  `active` (the selected character) and `characters`, plus `createCharacter`,
  `updateCharacter(id, patch | fn)`, `deleteCharacter`, `setActive`,
  `importCharacter`. Persists to `localStorage` on every change. `migrate()`
  backfills fields added after a character was first saved — **extend it
  whenever you add a `Character` field** (see the add-character-field skill)
  or old saves will crash.
- **`src/rules/derive.ts`** — `derive(c)` computes all displayed numbers
  (ability mods, PB, HP, AC, saves, skills, initiative, speed, Intellect
  Die/DC). Single source of truth for the math; UI never recomputes stats
  itself. `fmt()` renders signed modifiers (`+3` / `-1`).
- **`src/rules/resources.ts`** — per-rest resource trackers and
  `applyShortRest` / `applyLongRest`.
- **`src/rules/levelup.ts`** — `pendingLevels(c)` / leveling logic; per-level
  choices are recorded in `c.choices[level]` so leveling is replayable.
- **`src/data/`** — static game content: `savant.ts` (class table, 11
  disciplines, pursuits, feats — ~1000 lines), `species.ts`,
  `backgrounds.ts`, `weapons.ts` (2024 weapons + masteries), `spells.ts`,
  `lists.ts`. Transcribed from `reference/*.txt` (the source texts).
- **`src/sections/`** — one component per route.

### Routing (`src/App.tsx`)

Three rail tabs: **`/` Home · `/sheet` Character · `/compendium`**, plus
`/new` (Wizard) and `/level-up` (LevelUp). The character sheet
(`src/sections/CharacterSheet.tsx`) renders one persistent `CharacterBand`
plus a **subtab segmented control** (Abilities · Battle · Features ·
Inventory) whose panes render through `<Outlet />` at
`/sheet/abilities|battle|features|inventory`. Rail icons are inline SVG
`path`s in the `ICONS` map in `App.tsx`.

Sheet subtab components (`Abilities.tsx`, `Battle.tsx`, `Features.tsx`,
`Inventory.tsx`) assume the parent already handled the no-character case and
the `CharacterBand`; they `return null` when `!active` and render content
only. Standalone pages (Home, Compendium, Wizard) keep the
`PageHead`/`NoCharacter` pattern.

## Conventions

- **Styling is centralized** in `src/styles/app.css` (~1250 lines) via shared
  classes — `card`, `ledger` (tables), `stat-tile`, `gauge`, `btn` (+
  `primary` / `brass` / `danger` / `small`), `chip`, `grid cols-N`,
  `row between`, `num`, `muted`, `mt`, `subtabs`/`subtab`. Prefer a shared
  class over inline styles or new CSS files; a change in `app.css` lifts every
  page at once.
- **Design system** (keep it — do not flatten to plain cards):
  scholar's-instrument / field-casebook concept. Palette = cool ledger-grey
  paper + Prussian-blue ink + restrained **brass** for identity;
  **vermilion = danger/damage, moss = healing** (colour is semantic, never
  decorative). Type: Spectral (display) / IBM Plex Sans (body) / **IBM Plex
  Mono for every game number** (tabular). CSS custom properties
  (`--prussian`, `--brass`, `--gold`, …) top of `app.css`.
- **Touch-first**: hit targets ≥ 40px, no hover-only affordances, no tiny
  steppers for values that change often mid-combat.
- **Immutable updates only** — never mutate `active`; call
  `updateCharacter(id, patch)`. The patch may be a partial or a
  `(c) => Partial<Character>` function.
- Game rules/content go in `src/data/` or `src/rules/`, never inlined in
  components. Components stay presentational; `derive`/`resources` own math.
- Rules accuracy matters: when implementing a Savant feature, check the text
  in `reference/savant-class.txt` / `reference/savant-expanded.txt` rather
  than guessing from the feature's name.

## Verifying a change

1. `npm run build` — must pass (this is the only typecheck).
2. If anything visible changed: `npm run shots` (dev server running), then
   **read the iPad PNGs** and check layout, spacing, and that game numbers
   render in mono. Use `ONLY=`/`VIEWS=` to keep iteration fast.
3. For store/types changes: bump-test an old save — `migrate()` must backfill
   every new field (an old character JSON imported via Home must not crash).

## Gotchas

- HashRouter (GitHub Pages has no server routing) — URLs contain `#`, base
  path is `/Character-Sheet/`.
- Adding a `Character` field touches **four** places: `types.ts`, the Wizard,
  `migrate()` in `store.tsx`, and (usually) export/import. Use the
  add-character-field skill.
- `derive()` runs on every render of the active character; keep it pure and
  cheap.
- The screenshot runner seeds `localStorage` **before** app mount
  (`addInitScript`); seeding after load silently does nothing.
