---
name: add-character-field
description: Checklist for adding or changing a field on the persisted Character type. Use whenever a change touches src/types.ts Character shape, adds per-character state, or adds a new tracker/resource/choice that must survive reload. Skipping a step crashes old saves.
---

# Adding a field to `Character`

`Character` (src/types.ts) is persisted raw to `localStorage` and moved
between devices as exported JSON. Old saves **do not have your new field**,
so every addition must be backfilled. A missed step = crash on load for the
owner's real character. Work through all five steps:

## 1. `src/types.ts`
Add the field to the `Character` interface. Prefer optional (`?`) only when
`undefined` is a *meaningful* state; otherwise make it required and backfill
in `migrate()` — required fields keep downstream code free of `?.` noise.

## 2. `migrate()` in `src/state/store.tsx`
Backfill the field for characters saved before it existed. This runs on every
load AND on JSON import, so it is the single choke point. Follow the existing
pattern (`if (c.foo === undefined) c.foo = …`).

## 3. Creation — `src/sections/Wizard.tsx`
New characters must be born with the field. Find where the wizard assembles
the initial `Character` and include a sensible default (often the same value
`migrate()` backfills).

## 4. Derivation & rest behaviour
- If the field affects any displayed number → wire it through `derive()`
  (`src/rules/derive.ts`). UI components never compute stats themselves.
- If it is a spendable/rechargeable resource → register it in
  `src/rules/resources.ts` so short/long rests reset it correctly.

## 5. Verify
```sh
npm run build        # typecheck — the only correctness gate
```
Then prove migration works: in the running app, import a character JSON that
was exported **before** your change (or delete the field from a fresh export
by hand) and confirm the app loads and the field shows its default. The
screenshot seed (`scripts/seed-character.mjs`) may also need the field if a
page's design depends on it.
