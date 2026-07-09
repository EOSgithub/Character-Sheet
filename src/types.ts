// Core domain types for the Savant character sheet (D&D 2024 chassis).

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const ABILITY_NAMES: Record<AbilityKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
}

export interface SkillDef {
  key: string
  name: string
  ability: AbilityKey
}

export const SKILLS: SkillDef[] = [
  { key: 'acrobatics', name: 'Acrobatics', ability: 'dex' },
  { key: 'animal-handling', name: 'Animal Handling', ability: 'wis' },
  { key: 'arcana', name: 'Arcana', ability: 'int' },
  { key: 'athletics', name: 'Athletics', ability: 'str' },
  { key: 'deception', name: 'Deception', ability: 'cha' },
  { key: 'history', name: 'History', ability: 'int' },
  { key: 'insight', name: 'Insight', ability: 'wis' },
  { key: 'intimidation', name: 'Intimidation', ability: 'cha' },
  { key: 'investigation', name: 'Investigation', ability: 'int' },
  { key: 'medicine', name: 'Medicine', ability: 'wis' },
  { key: 'nature', name: 'Nature', ability: 'int' },
  { key: 'perception', name: 'Perception', ability: 'wis' },
  { key: 'performance', name: 'Performance', ability: 'cha' },
  { key: 'persuasion', name: 'Persuasion', ability: 'cha' },
  { key: 'religion', name: 'Religion', ability: 'int' },
  { key: 'sleight-of-hand', name: 'Sleight of Hand', ability: 'dex' },
  { key: 'stealth', name: 'Stealth', ability: 'dex' },
  { key: 'survival', name: 'Survival', ability: 'wis' },
]

export type ArmorKey = 'none' | 'leather' | 'studded' | 'padded' | 'chain-shirt' | 'scale-mail' | 'breastplate' | 'half-plate'

export interface ArmorDef {
  key: ArmorKey
  name: string
  category: 'none' | 'light' | 'medium'
  baseAC: number
  /** max ability bonus added on top of baseAC (Infinity for light/none, 2 for medium) */
  maxAbilityBonus: number
  stealthDisadvantage?: boolean
}

export const ARMORS: ArmorDef[] = [
  { key: 'none', name: 'Unarmored', category: 'none', baseAC: 10, maxAbilityBonus: Infinity },
  { key: 'padded', name: 'Padded Armor', category: 'light', baseAC: 11, maxAbilityBonus: Infinity, stealthDisadvantage: true },
  { key: 'leather', name: 'Leather Armor', category: 'light', baseAC: 11, maxAbilityBonus: Infinity },
  { key: 'studded', name: 'Studded Leather', category: 'light', baseAC: 12, maxAbilityBonus: Infinity },
  { key: 'chain-shirt', name: 'Chain Shirt', category: 'medium', baseAC: 13, maxAbilityBonus: 2 },
  { key: 'scale-mail', name: 'Scale Mail', category: 'medium', baseAC: 14, maxAbilityBonus: 2, stealthDisadvantage: true },
  { key: 'breastplate', name: 'Breastplate', category: 'medium', baseAC: 14, maxAbilityBonus: 2 },
  { key: 'half-plate', name: 'Half Plate', category: 'medium', baseAC: 15, maxAbilityBonus: 2, stealthDisadvantage: true },
]

export interface InventoryItem {
  id: string
  name: string
  qty: number
  weight?: number
  notes?: string
  equipped?: boolean
  attuned?: boolean
  requiresAttunement?: boolean
}

export interface Attack {
  id: string
  name: string
  /** ability used for attack/damage; Savant can use INT vs Focus */
  ability: AbilityKey
  proficient: boolean
  damage: string
  damageType: string
  range?: string
  notes?: string
  /** links the attack to a 2024 weapon (mastery, properties) */
  weaponKey?: string
}

export type ConditionKey =
  | 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled' | 'incapacitated'
  | 'invisible' | 'paralyzed' | 'petrified' | 'poisoned' | 'prone' | 'restrained'
  | 'stunned' | 'unconscious'

export const CONDITIONS: ConditionKey[] = [
  'blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated',
  'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained',
  'stunned', 'unconscious',
]

/** Choices made at a given Savant level (recorded so leveling is replayable/undoable). */
export interface LevelChoices {
  /** ASI: which abilities were raised, e.g. { int: 2 } or { int: 1, con: 1 } */
  asi?: Partial<Record<AbilityKey, number>>
  /** Feat taken instead of an ASI (name; description optional/custom) */
  feat?: { name: string; description?: string }
  /** Scholarly Pursuits mastered at this level */
  pursuits?: string[]
  /** Academic Discipline chosen (level 3) */
  discipline?: string
  /** Rune Scribe runes / Culinarian recipes picked at this level */
  disciplineOptions?: string[]
  /** skills granted by open picks resolved at this level (pursuit/feat "of your choice") */
  grantedSkills?: string[]
  /** tool proficiencies granted by open picks resolved at this level */
  grantedTools?: string[]
  /** languages learned via open picks resolved at this level */
  grantedLanguages?: string[]
  /** HP rolled/taken for this level (levels 2+); level 1 is fixed */
  hp?: number
}

export const FOCUS_CLUES = [
  'Highest ability score',
  'Lowest ability score',
  'Armor Class',
  'Speed',
  'Creature type',
  'One special sense',
] as const

export interface FocusState {
  active: boolean
  name: string
  /** which characteristics have been learned */
  clues: string[]
  notes: string
}

export interface Character {
  id: string
  name: string
  playerName?: string
  speciesKey: string
  /** species lineage/ancestry option, if the species has one */
  speciesVariant?: string
  /** chosen size, e.g. 'Medium' */
  size?: string
  /** species creation choices keyed by choice id (size, skillful, versatile, keen-senses, spell-ability) */
  speciesChoices?: Record<string, string>
  backgroundKey: string
  /** +2/+1 (or +1/+1/+1) assignment from background */
  backgroundBonuses: Partial<Record<AbilityKey, number>>
  /** base scores before background bonuses and ASIs */
  baseAbilities: Record<AbilityKey, number>
  level: number
  xp: number
  /** class skill proficiencies chosen at level 1 (two) */
  classSkills: string[]
  /** extra proficiencies granted by pursuits/feats etc. keyed by skill key */
  bonusSkills: string[]
  /** skills with expertise (future-proofing) */
  expertise: string[]
  toolProficiencies: string[]
  languages: string[]
  /** choices recorded per level, index = level */
  choices: Record<number, LevelChoices>
  // -- live state --
  currentHP: number
  tempHP: number
  hitDiceSpent: number
  deathSaves: { successes: number; failures: number }
  conditions: ConditionKey[]
  exhaustion: number
  armor: ArmorKey
  shield: boolean
  focus: FocusState
  reactionsUsed: number
  /** expended uses per resource key (see rules/resources.ts) */
  resourceUses: Record<string, number>
  heroicInspiration: boolean
  inventory: InventoryItem[]
  attacks: Attack[]
  coins: { cp: number; sp: number; gp: number; pp: number }
  notes: string
  createdAt: string
  updatedAt: string
}
