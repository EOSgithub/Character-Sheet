// A representative sample Savant, used to populate the app for screenshots.
// Level 5 High-Elf Investigator with an active Focus, temp HP, an attack, and
// inventory — enough to exercise every page. Edit freely; it only affects the
// screenshot runner, never the real app.

export const sampleCharacter = {
  id: 'seed-vesper',
  name: 'Vesper Quill',
  playerName: 'Ed',
  speciesKey: 'elf',
  speciesVariant: 'high-elf',
  backgroundKey: 'sage',
  backgroundBonuses: { int: 2, wis: 1 },
  baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
  level: 5,
  xp: 6500,
  classSkills: ['arcana', 'investigation'],
  bonusSkills: [],
  expertise: [],
  toolProficiencies: ["Alchemist's Supplies"],
  languages: ['Common', 'Elvish', 'Draconic'],
  choices: {
    1: { pursuits: [] },
    3: { discipline: 'investigator' },
    4: { asi: { int: 2 } },
  },
  currentHP: 24,
  tempHP: 4,
  hitDiceSpent: 1,
  deathSaves: { successes: 0, failures: 0 },
  conditions: [],
  exhaustion: 0,
  armor: 'studded',
  shield: false,
  focus: {
    active: true,
    name: 'Gnoll Fang-of-Yeenoghu',
    clues: ['Armor Class', 'Speed'],
    notes: 'AC 15, unnaturally fast, reeks of old blood.',
  },
  reactionsUsed: 0,
  resourceUses: {},
  heroicInspiration: true,
  inventory: [
    { id: 'i2', name: 'Rapier', qty: 1, weight: 2, equipped: true, category: 'weapon' },
    { id: 'i5', name: 'Light Crossbow', qty: 1, weight: 5, category: 'weapon' },
    { id: 'i6', name: 'Studded Leather', qty: 1, weight: 13, equipped: true, category: 'armor' },
    { id: 'i1', name: "Scholar's Pack", qty: 1, weight: 10, category: 'gear', notes: 'bedroll, rations, ink, 10 parchment' },
    { id: 'i7', name: 'Bolts', qty: 20, weight: 1.5, category: 'gear' },
    { id: 'i3', name: "Alchemist's Supplies", qty: 1, weight: 8, category: 'tool' },
    { id: 'i4', name: 'Potion of Healing', qty: 3, weight: 0.5, category: 'consumable', notes: 'regain 2d4+2 HP' },
    { id: 'i8', name: 'Lens of the Archivist', qty: 1, weight: 0.5, category: 'magic', attuned: true, requiresAttunement: true, notes: 'advantage to decipher text' },
  ],
  attacks: [
    { id: 'a1', name: 'Rapier', ability: 'dex', proficient: true, damage: '1d8', damageType: 'piercing', weaponKey: 'rapier' },
  ],
  coins: { cp: 0, sp: 12, gp: 45, pp: 2 },
  notes: 'Investigating the missing archivist of Candlekeep. The margin notes in her ledger point to a cellar beneath the west tower.',
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date('2026-01-01').toISOString(),
}

export const STORAGE_KEY = 'savant-codex-v1'
