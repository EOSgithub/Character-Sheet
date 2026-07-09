// Spell-name lists for Magic Initiate choices (cantrips + level 1). Names only.
// The picker uses these as suggestions via a datalist, so a spell missing from
// a list can still be typed in — but these cover the common PHB 2024 options.

export type SpellList = 'cleric' | 'druid' | 'wizard'

interface ListSpells { cantrips: string[]; level1: string[] }

export const SPELLS: Record<SpellList, ListSpells> = {
  cleric: {
    cantrips: ['Guidance', 'Light', 'Mending', 'Resistance', 'Sacred Flame', 'Spare the Dying', 'Thaumaturgy', 'Toll the Dead', 'Word of Radiance'],
    level1: ['Bane', 'Bless', 'Command', 'Cure Wounds', 'Detect Evil and Good', 'Detect Magic', 'Guiding Bolt', 'Healing Word', 'Inflict Wounds', 'Protection from Evil and Good', 'Sanctuary', 'Shield of Faith'],
  },
  druid: {
    cantrips: ['Druidcraft', 'Guidance', 'Mending', 'Message', 'Poison Spray', 'Produce Flame', 'Resistance', 'Shillelagh', 'Starry Wisp', 'Thorn Whip'],
    level1: ['Cure Wounds', 'Detect Magic', 'Entangle', 'Faerie Fire', 'Fog Cloud', 'Goodberry', 'Healing Word', 'Jump', 'Longstrider', 'Speak with Animals', 'Thunderwave'],
  },
  wizard: {
    cantrips: ['Acid Splash', 'Chill Touch', 'Dancing Lights', 'Fire Bolt', 'Light', 'Mage Hand', 'Mending', 'Message', 'Minor Illusion', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Shocking Grasp', 'True Strike'],
    level1: ['Burning Hands', 'Charm Person', 'Chromatic Orb', 'Detect Magic', 'Disguise Self', 'Feather Fall', 'Find Familiar', 'Fog Cloud', 'Grease', 'Ice Knife', 'Identify', 'Jump', 'Mage Armor', 'Magic Missile', 'Shield', 'Sleep', 'Thunderwave', 'Witch Bolt'],
  },
}

export function spellOptions(list: SpellList, level: 0 | 1): string[] {
  return level === 0 ? SPELLS[list].cantrips : SPELLS[list].level1
}
