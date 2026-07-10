---
name: screenshot-app
description: Capture rendered screenshots of the Savant Codex app for visual/design review. Use whenever you need to SEE the running UI — before/after a frontend or CSS change, to take stock of the current design, to verify layout at iPad/desktop/phone widths, or to check light/dark themes. Seeds a sample character so every page has real content.
---

# Screenshot the Savant Codex app

A Playwright runner seeds a sample character into `localStorage` and captures
every page, fully populated. Use it instead of writing ad-hoc screenshot code.

**The design target is `ipad` (1180×820, landscape) — the device the app is
actually played on.** Judge every layout decision on the iPad shots first;
`mobile` (390px phone) is a secondary stress test, `desktop` (1280px) opt-in.

## Run it

The dev server must be running. Then:

```bash
npm run dev          # terminal 1 (if not already up)
npm run shots        # terminal 2 — writes to ./screenshots
```

Output: `screenshots/<route>-<view>.png` (e.g. `battle-ipad.png`,
`home-mobile.png`). Default views: `ipad,mobile`. Files overwrite by name;
the dir is never wiped, so a scoped `ONLY=` run leaves other shots intact for
before/after comparison. Read the PNGs to review them.

Routes captured: `home, abilities, battle, features, inventory, compendium,
wizard` (sheet subtabs live under `/sheet/…`; the runner knows the paths).

## Scope a run (env vars)

```bash
ONLY=battle,home npm run shots     # only these routes
VIEWS=ipad npm run shots           # single viewport (ipad | mobile | desktop)
THEME=dark npm run shots           # emulate dark color-scheme
URL=http://localhost:5173/Character-Sheet/ npm run shots
```

When iterating on one page, use `ONLY=` + `VIEWS=ipad` to keep runs fast.

## Interaction shots (rules panel, modals, toggles)

`npm run shots` only captures pages as loaded. To capture state that needs
clicks (the rules side panel, a modal, toggled conditions), write a one-off
Playwright script — **it must live inside the project** (e.g.
`scripts/tmp-shot.mjs`, delete after) or Node won't resolve `playwright`;
the scratchpad directory does NOT work. Template:

```js
import { chromium } from 'playwright'
import { resolve } from 'node:path'
import { sampleCharacter, STORAGE_KEY } from './seed-character.mjs'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2 })
const seed = JSON.stringify({ characters: [sampleCharacter], activeId: sampleCharacter.id })
await ctx.addInitScript(([k, s]) => localStorage.setItem(k, s), [STORAGE_KEY, seed])
const page = await ctx.newPage()
await page.goto('http://localhost:5173/Character-Sheet/#/sheet/features')
await page.reload() // fresh mount so the seed is read
await page.waitForTimeout(400)
await page.getByRole('button', { name: /Adroit Analysis/ }).first().click()
await page.waitForTimeout(400)
await page.screenshot({ path: resolve(import.meta.dirname, '../screenshots/panel.png') })
await browser.close()
```

Note: pages scroll inside `.main`, so `fullPage: true` does NOT capture
below the fold — `scrollIntoViewIfNeeded()` the element you care about.

## How it works / gotchas

- `scripts/screenshot.mjs` — the runner. It seeds `localStorage` via
  `addInitScript` **before** the app mounts (the store reads storage once at
  mount, so seeding after load would not take), then reloads each route.
- `scripts/seed-character.mjs` — the sample character (level-5 High-Elf
  Investigator with temp HP, an active Focus, an attack, inventory). Edit it
  to exercise a different state.
- App uses `HashRouter` under base `/Character-Sheet/`, so routes are
  `.../#/sheet/battle` etc. The runner already handles this.
- If it prints "No dev server", start `npm run dev` first.
- `screenshots/` is gitignored.
