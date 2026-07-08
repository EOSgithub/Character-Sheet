# Savant Codex

A D&D 2024 character sheet for the homebrew **Savant** class (by /u/laserllama, v5.2),
optimized for iPad use at the table. Built with Vite + React + TypeScript and deployed
to GitHub Pages.

## Sections

- **Home** — character roster, active character overview, level-up entry, JSON export/import, notes
- **Abilities, Saves & Skills** — derived scores, saving throws, skill ledger
- **Battle Mode** — HP/temp HP, hit dice, death saves, AC & armor, reactions (Swift Reflexes),
  conditions, attacks with the 2024 weapon table and **Weapon Masteries**, automated
  **short/long rests** with per-rest feature-use tracking, Heroic Inspiration, and the
  **Adroit Analysis Focus tracker**
- **Features & Traits** — class features by level, discipline features, pursuits, feats, species & background traits
- **Inventory & Attuned Items** — gear, attunement slots, coin
- **Compendium** — the full Savant source text: class, 11 Academic Disciplines, Scholarly Pursuits,
  Scholarly Feats, magic items, personality tables, plus the 2024 weapons & masteries reference

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`
(set Pages source to "GitHub Actions" in repository settings).

Character data lives in `localStorage` on the device; use Export/Import (JSON) to move
characters between devices.

## Sources

- `reference/savant-class.txt` and `reference/savant-expanded.txt` — text extracted from the
  source PDFs in the repository root; game data in `src/data/savant.ts` is transcribed from these.
- D&D 2024 core rules (species, backgrounds, origin feats) in `src/data/species.ts` and `src/data/backgrounds.ts`.
