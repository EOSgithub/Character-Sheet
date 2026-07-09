// Derived statistics for a Savant character (D&D 2024 chassis).

import type { AbilityKey, Character } from '../types'
import { ABILITY_KEYS, ARMORS, SKILLS } from '../types'
import { SAVANT_TABLE, DISCIPLINES, PURSUITS, getDiscipline } from '../data/savant'
import { getSpecies } from '../data/species'

export function mod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

export interface Derived {
  abilities: Record<AbilityKey, number>
  mods: Record<AbilityKey, number>
  pb: number
  intellectDie: number | null
  intellectDC: number
  reactions: number
  maxHP: number
  ac: number
  initiative: number
  speed: number
  saveProficiencies: AbilityKey[]
  saves: Record<AbilityKey, number>
  /** skill key -> bonus */
  skills: Record<string, number>
  skillProficiencies: Set<string>
  passivePerception: number
  pursuits: string[]
  disciplineKey?: string
  hitDiceTotal: number
}

/** Final ability scores: base + background bonuses + ASIs + Incomparable Intellect. */
export function finalAbilities(c: Character): Record<AbilityKey, number> {
  const out = {} as Record<AbilityKey, number>
  for (const k of ABILITY_KEYS) {
    let v = c.baseAbilities[k] + (c.backgroundBonuses[k] ?? 0)
    for (let lv = 1; lv <= c.level; lv++) {
      const asi = c.choices[lv]?.asi
      if (asi && asi[k]) v += asi[k]!
    }
    if (k === 'int' && c.level >= 20) v = Math.min(24, v + 4)
    else v = Math.min(20, v)
    out[k] = v
  }
  return out
}

export function allPursuits(c: Character): string[] {
  const list: string[] = []
  for (let lv = 1; lv <= c.level; lv++) {
    for (const p of c.choices[lv]?.pursuits ?? []) {
      if (!list.includes(p)) list.push(p)
    }
  }
  return list
}

export function disciplineKey(c: Character): string | undefined {
  for (let lv = 1; lv <= c.level; lv++) {
    if (c.choices[lv]?.discipline) return c.choices[lv]!.discipline
  }
  return undefined
}

/** Base tool proficiencies (from creation) plus any granted by level-up picks. */
export function characterTools(c: Character): string[] {
  const set = new Set<string>(c.toolProficiencies)
  for (const ch of Object.values(c.choices)) for (const t of ch.grantedTools ?? []) set.add(t)
  return [...set]
}

/** Known languages: base plus any learned via level-up picks. */
export function characterLanguages(c: Character): string[] {
  const set = new Set<string>(c.languages)
  for (const ch of Object.values(c.choices)) for (const l of ch.grantedLanguages ?? []) set.add(l)
  return [...set]
}

export function derive(c: Character): Derived {
  const abilities = finalAbilities(c)
  const mods = {} as Record<AbilityKey, number>
  for (const k of ABILITY_KEYS) mods[k] = mod(abilities[k])

  const row = SAVANT_TABLE[Math.min(c.level, 20) - 1]
  const pb = row.pb
  const intellectDie = row.intellectDie
  const intellectDC = 8 + pb + mods.int
  const reactions = row.reactions

  // HP: level 1 = 8 + CON; levels 2+ recorded per level (default 5 + CON).
  let maxHP = 8 + mods.con
  for (let lv = 2; lv <= c.level; lv++) {
    maxHP += c.choices[lv]?.hp ?? 5 + mods.con
  }
  const species = getSpecies(c.speciesKey)
  if (species?.key === 'dwarf') maxHP += c.level // Dwarven Toughness

  // AC: Predictive Defense lets INT replace DEX in light/medium armor or unarmored.
  const armor = ARMORS.find((a) => a.key === c.armor) ?? ARMORS[0]
  const abilityForAC = Math.max(mods.dex, mods.int)
  const ac = armor.baseAC + Math.min(abilityForAC, armor.maxAbilityBonus) + (c.shield ? 2 : 0)

  // Initiative: DEX, +INT from Keen Awareness at 7.
  const initiative = mods.dex + (c.level >= 7 ? mods.int : 0)

  const speed = species?.key === 'elf' && c.speciesVariant === 'wood-elf' ? 35 : species?.speed ?? 30

  // Saves: INT & WIS; +CHA at 14 (Unyielding Will).
  const saveProficiencies: AbilityKey[] = ['int', 'wis']
  if (c.level >= 14) saveProficiencies.push('cha')
  const saves = {} as Record<AbilityKey, number>
  for (const k of ABILITY_KEYS) {
    saves[k] = mods[k] + (saveProficiencies.includes(k) ? pb : 0)
  }

  // Skill proficiencies: class picks + background + discipline grants + pursuit grants + manual extras.
  const skillProficiencies = new Set<string>([...c.classSkills, ...c.bonusSkills])
  const dKey = disciplineKey(c)
  const discipline = getDiscipline(dKey)
  if (discipline) {
    for (const s of discipline.grantedSkills) skillProficiencies.add(s)
  }
  const pursuits = allPursuits(c)
  for (const pk of pursuits) {
    const p = PURSUITS.find((x) => x.key === pk)
    if (p?.grantsSkill) skillProficiencies.add(p.grantsSkill)
  }
  // skills granted by open picks resolved at level-up
  for (const ch of Object.values(c.choices)) {
    for (const s of ch.grantedSkills ?? []) skillProficiencies.add(s)
  }

  const skills: Record<string, number> = {}
  for (const s of SKILLS) {
    const prof = skillProficiencies.has(s.key) ? pb : 0
    const exp = c.expertise.includes(s.key) ? pb : 0
    skills[s.key] = mods[s.ability] + prof + exp
  }

  const passivePerception = 10 + skills['perception']

  return {
    abilities, mods, pb, intellectDie, intellectDC, reactions, maxHP, ac,
    initiative, speed, saveProficiencies, saves, skills, skillProficiencies,
    passivePerception, pursuits, disciplineKey: dKey, hitDiceTotal: c.level,
  }
}

export const DISCIPLINE_LIST = DISCIPLINES
