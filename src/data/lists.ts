// Selectable proficiency lists for open-ended "of your choice" picks made
// during character creation (tools, languages). Skills come from types.ts,
// weapons from data/weapons.ts.

export const ARTISANS_TOOLS = [
  "Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools",
  "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools",
  "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies",
  "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools",
]

export const OTHER_TOOLS = [
  'Disguise Kit', 'Forgery Kit', 'Herbalism Kit', "Navigator's Tools", "Poisoner's Kit", "Thieves' Tools",
]

export const GAMING_SETS = ['Dice Set', 'Dragonchess Set', 'Playing Card Set', 'Three-Dragon Ante Set']

export const INSTRUMENTS = [
  'Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Horn', 'Lute', 'Lyre', 'Pan Flute', 'Shawm', 'Viol',
]

export const TOOL_GROUPS: { label: string; items: string[] }[] = [
  { label: "Artisan's Tools", items: ARTISANS_TOOLS },
  { label: 'Other Tools', items: OTHER_TOOLS },
  { label: 'Gaming Sets', items: GAMING_SETS },
  { label: 'Musical Instruments', items: INSTRUMENTS },
]

export const ALL_TOOLS = TOOL_GROUPS.flatMap((g) => g.items)

export const LANGUAGES = [
  'Common Sign Language', 'Draconic', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc',
  'Abyssal', 'Celestial', 'Deep Speech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon',
]

/** Which selectable list an open pick draws from. */
export type PickSource =
  | 'skill' | 'savant-skill' | 'tool' | 'language' | 'any-proficiency'
  | 'skill-or-tool' | 'artisan-tool' | 'instrument' | 'gaming-set'

import type { AbilityKey } from '../types'
import type { SpellList } from './spells'

/** An open "of your choice" proficiency pick (skill / tool / language). */
export interface ChoicePick {
  id: string
  label: string
  from: PickSource
  /** restrict a skill pick to these skill keys */
  options?: string[]
}

/**
 * A choice a feat forces the player to make. Superset of ChoicePick that also
 * covers ability increases, extra Scholarly Pursuits, and Magic Initiate spells
 * — so every feat choice can be captured and shown on the sheet.
 */
export type FeatChoice =
  | ({ kind: 'proficiency' } & ChoicePick)
  | { kind: 'ability'; id: string; label: string; abilities: AbilityKey[]; amount?: number }
  | { kind: 'pursuit'; id: string; label: string }
  | { kind: 'spell'; id: string; label: string; list: SpellList; level: 0 | 1 }

/** Bucket resolved feat-choice values (encoded "kind:value") into typed grants. */
export function routeFeatChoices(encoded: string[]) {
  const skills: string[] = [], tools: string[] = [], languages: string[] = []
  const abilities: AbilityKey[] = [], pursuits: string[] = [], spells: string[] = []
  for (const v of encoded) {
    const i = v.indexOf(':')
    if (i < 0) continue
    const kind = v.slice(0, i), val = v.slice(i + 1)
    if (kind === 'skill') skills.push(val)
    else if (kind === 'tool') tools.push(val)
    else if (kind === 'language') languages.push(val)
    else if (kind === 'ability') abilities.push(val as AbilityKey)
    else if (kind === 'pursuit') pursuits.push(val)
    else if (kind === 'spell') spells.push(val)
  }
  return { skills, tools, languages, abilities, pursuits, spells }
}

/** Route encoded pick values ("skill:arcana", "tool:Thieves' Tools", "language:Elvish") into buckets. */
export function bucketPicks(encoded: string[]): { skills: string[]; tools: string[]; languages: string[] } {
  const skills: string[] = [], tools: string[] = [], languages: string[] = []
  for (const v of encoded) {
    const i = v.indexOf(':')
    if (i < 0) continue
    const kind = v.slice(0, i), val = v.slice(i + 1)
    if (kind === 'skill') skills.push(val)
    else if (kind === 'tool') tools.push(val)
    else if (kind === 'language') languages.push(val)
  }
  return { skills, tools, languages }
}
