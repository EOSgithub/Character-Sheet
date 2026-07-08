// Per-rest resource trackers derived from class, discipline, species, and
// origin feats, plus short/long rest application (D&D 2024 rules: a long
// rest restores all HP, all Hit Dice, removes temp HP, and reduces
// exhaustion by 1).

import type { Character } from '../types'
import type { Derived } from './derive'
import { getBackground } from '../data/backgrounds'

export interface ResourceDef {
  key: string
  name: string
  max: number
  recharge: 'short' | 'long'
  source: string
}

function lineageSpells(c: Character): { l3?: string; l5?: string } {
  const map: Record<string, { l3: string; l5: string }> = {
    'elf/drow': { l3: 'Faerie Fire', l5: 'Darkness' },
    'elf/high-elf': { l3: 'Detect Magic', l5: 'Misty Step' },
    'elf/wood-elf': { l3: 'Longstrider', l5: 'Pass Without Trace' },
    'tiefling/abyssal': { l3: 'Ray of Sickness', l5: 'Hold Person' },
    'tiefling/chthonic': { l3: 'False Life', l5: 'Ray of Enfeeblement' },
    'tiefling/infernal': { l3: 'Hellish Rebuke', l5: 'Darkness' },
  }
  return map[`${c.speciesKey}/${c.speciesVariant}`] ?? {}
}

export function countDisciplineOptions(c: Character): number {
  let n = 0
  for (let lv = 1; lv <= c.level; lv++) n += c.choices[lv]?.disciplineOptions?.length ?? 0
  return n
}

export function deriveResources(c: Character, d: Derived): ResourceDef[] {
  const out: ResourceDef[] = []
  const pb = d.pb
  const intMod = Math.max(1, d.mods.int)

  // --- Savant class ---
  if (c.level >= 17) {
    out.push({ key: 'flawless-analysis', name: 'Flawless Analysis', max: 1, recharge: 'short', source: 'Savant 17' })
  }

  // --- Academic Discipline ---
  switch (d.disciplineKey) {
    case 'naturalist':
      if (c.level >= 10) out.push({ key: 'call-of-the-wild', name: 'Call of the Wild', max: 1, recharge: 'short', source: 'Naturalist 10' })
      break
    case 'investigator':
      if (c.level >= 15) out.push({ key: 'investigator-crit', name: 'Master Investigator (critical hit)', max: 1, recharge: 'short', source: 'Investigator 15' })
      break
    case 'mentor':
      out.push({ key: 'astute-advice', name: 'Astute Advice', max: intMod, recharge: c.level >= 10 ? 'short' : 'long', source: 'Mentor 3' })
      if (c.level >= 10) out.push({ key: 'mystical-intuition', name: 'Mystical Intuition', max: 1, recharge: c.level >= 15 ? 'short' : 'long', source: 'Mentor 10' })
      break
    case 'orator':
      if (c.level >= 10) out.push({ key: 'peerless-rhetoric', name: 'Peerless Rhetoric', max: 1, recharge: 'short', source: 'Orator 10' })
      break
    case 'philosopher':
      if (c.level >= 10) {
        out.push({ key: 'pw-enfeeble', name: 'Power Word: Enfeeble', max: 1, recharge: 'short', source: 'Philosopher 10' })
        out.push({ key: 'pw-shunt', name: 'Power Word: Shunt', max: 1, recharge: 'short', source: 'Philosopher 10' })
      }
      break
    case 'culinarian':
      out.push({ key: 'morsels', name: 'Morsels prepared', max: intMod, recharge: 'short', source: 'Culinarian 3' })
      break
    case 'rune-scribe': {
      const runes = countDisciplineOptions(c)
      if (runes > 0) out.push({ key: 'rune-invocations', name: 'Rune Invocations', max: runes, recharge: 'long', source: 'Rune Scribe 3' })
      break
    }
  }

  // --- Species ---
  switch (c.speciesKey) {
    case 'aasimar':
      out.push({ key: 'healing-hands', name: 'Healing Hands', max: 1, recharge: 'long', source: 'Aasimar' })
      if (c.level >= 3) out.push({ key: 'celestial-revelation', name: 'Celestial Revelation', max: 1, recharge: 'long', source: 'Aasimar' })
      break
    case 'dragonborn':
      out.push({ key: 'breath-weapon', name: 'Breath Weapon', max: pb, recharge: 'long', source: 'Dragonborn' })
      if (c.level >= 5) out.push({ key: 'draconic-flight', name: 'Draconic Flight', max: 1, recharge: 'long', source: 'Dragonborn' })
      break
    case 'dwarf':
      out.push({ key: 'stonecunning', name: 'Stonecunning', max: pb, recharge: 'long', source: 'Dwarf' })
      break
    case 'goliath':
      out.push({ key: 'giant-ancestry', name: 'Giant Ancestry boon', max: pb, recharge: 'long', source: 'Goliath' })
      if (c.level >= 5) out.push({ key: 'large-form', name: 'Large Form', max: 1, recharge: 'long', source: 'Goliath' })
      break
    case 'orc':
      out.push({ key: 'adrenaline-rush', name: 'Adrenaline Rush', max: pb, recharge: 'short', source: 'Orc' })
      out.push({ key: 'relentless-endurance', name: 'Relentless Endurance', max: 1, recharge: 'long', source: 'Orc' })
      break
    case 'gnome':
      if (c.speciesVariant === 'forest') out.push({ key: 'speak-with-animals', name: 'Speak with Animals', max: pb, recharge: 'long', source: 'Forest Gnome' })
      break
  }
  const spells = lineageSpells(c)
  if (spells.l3 && c.level >= 3) out.push({ key: 'lineage-spell-3', name: `${spells.l3} (free cast)`, max: 1, recharge: 'long', source: 'Species' })
  if (spells.l5 && c.level >= 5) out.push({ key: 'lineage-spell-5', name: `${spells.l5} (free cast)`, max: 1, recharge: 'long', source: 'Species' })

  // --- Origin feat (from background) ---
  const bg = getBackground(c.backgroundKey)
  if (bg?.featKey === 'lucky') {
    out.push({ key: 'luck-points', name: 'Luck Points', max: pb, recharge: 'long', source: 'Lucky feat' })
  }
  if (bg?.featKey.startsWith('magic-initiate')) {
    out.push({ key: 'magic-initiate-spell', name: 'Level 1 spell (free cast)', max: 1, recharge: 'long', source: 'Magic Initiate' })
  }

  return out
}

/** Finish a short rest: restore short-recharge resources and per-round state. */
export function applyShortRest(c: Character, defs: ResourceDef[]): Partial<Character> {
  const uses = { ...c.resourceUses }
  for (const def of defs) if (def.recharge === 'short') delete uses[def.key]
  return { resourceUses: uses, reactionsUsed: 0 }
}

/** Finish a long rest (2024): all HP, all Hit Dice, temp HP gone, exhaustion −1. */
export function applyLongRest(c: Character, d: Derived): Partial<Character> {
  return {
    currentHP: d.maxHP,
    tempHP: 0,
    hitDiceSpent: 0,
    deathSaves: { successes: 0, failures: 0 },
    exhaustion: Math.max(0, c.exhaustion - 1),
    resourceUses: {},
    reactionsUsed: 0,
    focus: { active: false, name: '', clues: [], notes: '' },
    // Human trait Resourceful: Heroic Inspiration on every long rest
    heroicInspiration: c.speciesKey === 'human' ? true : c.heroicInspiration,
  }
}
