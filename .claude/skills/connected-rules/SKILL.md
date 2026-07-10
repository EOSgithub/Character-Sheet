---
name: connected-rules
description: How to work with the connected-rules system (lexicon, rules side panel, term links). Use whenever adding or editing game content in src/data, adding glossary terms, making a new UI surface tappable, wiring a feature's numeric effect into derive(), or debugging a wrong/missing/noisy term link.
---

# The connected-rules system

Everything named in the game data is an entry in **`src/rules/lexicon.ts`**,
openable in the global side panel, and every mention of an entry inside rules
text auto-links. Three parts:

- **`src/data/glossary.ts`** — hand-written 2024 keywords: conditions,
  game terms (Focus, Intellect Die…), actions, weapon properties, skills.
- **`src/rules/lexicon.ts`** — builds the registry + link index from ALL of
  `src/data` at module load. `getEntry(id)`, `findEntryByName(name)`,
  `mentionRegex()`/`resolveMention()`.
- **`src/sections/rules.tsx`** — `RulesPanelProvider` (mounted in `App`),
  `useRules().open(id | {name, meta, text})`, `RulesText`, `TermLink`.

## Adding game content

Add it to the right `src/data` file (`savant.ts`, `species.ts`, `weapons.ts`,
`backgrounds.ts`, `glossary.ts`) — **it registers in the lexicon
automatically**. Never inline rules text in components.

Entry id conventions (needed for explicit `open()` calls):
`class:adroit-analysis`, `dfeat:<discipline>:<slug>`, `dopt:<disc>:<key>`,
`pursuit:<key>`, `feat:<key>`, `ofeat:<key>`, `trait:<species>:<slug>`,
`weapon:<key>`, `mastery:<key>`, `armor:<key>`, `mitem:<slug>`,
`condition:<key>`, `term:<key>`, `action:<key>`, `property:<key>`,
`skill:<key>`.

## Link matching rules (the part that bites)

- Matching is **longest-pattern-first** with `\b` word boundaries. If a
  sub-feature name is referenced by other texts (e.g. "Wondrous Insight"
  inside Unrivaled Genius), it MUST be its own entry or a shorter term
  ("Insight" the skill) will claim part of it. When a bullet-defined
  sub-ability gets referenced elsewhere, promote it to a glossary term.
- **`matchCase: true`** for names that are also prose words (Focus, Light,
  Help, Search…) — texts capitalise game terms, prose stays lowercase.
  Lowercase usages that SHOULD link get lowercase `aliases` (see Advantage).
- **`aliases`** also cover plurals/variants ("Hit Die"/"Hit Dice").
- **`noLink: true`** registers an entry for explicit `open()` without
  auto-linking (species names, backgrounds, "Shield" — too prose-ambiguous).
- Duplicate names: first registration wins `findEntryByName`; glossary
  registers before data content, species traits last (so the ten "Darkvision"
  traits defer to the term). Keep that order in lexicon.ts.
- A rendered entry never links to itself (`excludeName`); each term links
  only once per line to keep prose calm.

## Making UI tappable

- Blocks of rules text → `<RulesText text={…} />` (handles `• ` bullets).
- List rows → `FeatureRow` (already panel-wired).
- Inline labels in UI copy → `<TermLink name="Predictive Defense" />` —
  safe on unknown names (renders plain text).
- Row that both edits AND informs → container div + main button +
  `.info-dot` button (see Inventory), never nested buttons.
- Toggle chips with rules → split chip: `.chip.split` > `.chip-main` +
  `.chip-info` (see Conditions on Battle).
- Inside `.ledger` tables `.term` renders ink-coloured (dotted underline
  only) by design — don't "fix" it to blue.

## Text ↔ math invariant

If a feature/feat text states a number, `derive()` must produce it — never
hardcode in components. Already wired: Tough, Alert (via `hasOriginFeat`),
Dwarven Toughness, exhaustion/conditions → Speed, Predictive Defense,
Keen Awareness, Unyielding Will, Doctoral Robes. When adding content with a
numeric effect, extend `derive()` (or `resources.ts` for per-rest uses) in
the same change.

## Verify

1. `npm run build`
2. Panel + links need interaction shots — see the screenshot-app skill's
   "Interaction shots" section for the ready-made pattern (a temp Playwright
   script must live inside the project or `playwright` won't resolve).
3. Check: new entry opens, its terms link, no noisy/wrong links introduced
   (scan a Features iPad shot for over-linked prose).
