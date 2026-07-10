// In-app screenshot taker for design review.
//
// Seeds a sample character into localStorage, then captures every page.
// The PRIMARY design target is iPad landscape (~1180×820) — that is the
// device the app is played on. Output lands in ./screenshots (gitignored).
//
// Usage:
//   npm run dev            # in one terminal (or let this script find it)
//   node scripts/screenshot.mjs
//
// Options (env vars):
//   URL=http://localhost:5173/Character-Sheet/   base app URL
//   ONLY=battle,home                             comma list of routes to shoot
//   VIEWS=ipad,mobile,desktop                    which viewports to capture
//   THEME=light|dark                             color-scheme to emulate
//   OUT=screenshots                              output directory
//
// Requires the dev server to be running. The script probes URL first and
// exits with a clear message if nothing answers.

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sampleCharacter, STORAGE_KEY } from './seed-character.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const BASE = process.env.URL ?? 'http://localhost:5173/Character-Sheet/'
const OUT = resolve(root, process.env.OUT ?? 'screenshots')
const THEME = process.env.THEME === 'dark' ? 'dark' : 'light'

// route name -> hash path (HashRouter). Order = capture order.
const ROUTES = {
  home: '/',
  abilities: '/sheet/abilities',
  battle: '/sheet/battle',
  features: '/sheet/features',
  inventory: '/sheet/inventory',
  compendium: '/compendium',
  wizard: '/new',
}

const VIEWPORTS = {
  ipad: { width: 1180, height: 820 },   // iPad landscape — the real play surface
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },  // phone, secondary stress test
}

const only = (process.env.ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const views = (process.env.VIEWS ?? 'ipad,mobile').split(',').map((s) => s.trim()).filter(Boolean)
const routeNames = only.length ? only.filter((r) => r in ROUTES) : Object.keys(ROUTES)

function url(hashPath) {
  return BASE.replace(/\/$/, '/') + '#' + hashPath
}

async function probe() {
  try {
    const res = await fetch(BASE)
    return res.ok
  } catch {
    return false
  }
}

async function main() {
  if (!(await probe())) {
    console.error(`\n  No dev server at ${BASE}\n  Start it first:  npm run dev\n`)
    process.exit(1)
  }

  // Files overwrite by name; we don't wipe the dir, so partial runs (ONLY=…)
  // leave other shots intact for side-by-side comparison.
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch()

  for (const view of views) {
    const viewport = VIEWPORTS[view]
    if (!viewport) {
      console.warn(`  skipping unknown view "${view}"`)
      continue
    }
    const ctx = await browser.newContext({
      viewport,
      deviceScaleFactor: 2,
      colorScheme: THEME,
    })

    // Seed localStorage before any app code runs, on every document load. The
    // store reads localStorage once at mount, so it must already be present.
    const seed = JSON.stringify({ characters: [sampleCharacter], activeId: sampleCharacter.id })
    await ctx.addInitScript(
      ([key, state]) => localStorage.setItem(key, state),
      [STORAGE_KEY, seed],
    )

    const page = await ctx.newPage()

    for (const name of routeNames) {
      await page.goto(url(ROUTES[name]))
      await page.reload() // ensure a fresh mount that reads the seeded storage
      await page.waitForLoadState('networkidle').catch(() => {})
      await page.waitForTimeout(400)
      const file = resolve(OUT, `${name}-${view}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`  ${name} · ${view}  ->  ${file.replace(root + '\\', '').replace(root + '/', '')}`)
    }

    await ctx.close()
  }

  await browser.close()
  console.log(`\n  Done. ${routeNames.length * views.length} shots in ${OUT}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
