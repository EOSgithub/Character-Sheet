// D&D 2024 weapon table with Mastery properties.

export type MasteryKey = 'cleave' | 'graze' | 'nick' | 'push' | 'sap' | 'slow' | 'topple' | 'vex'

export const MASTERIES: Record<MasteryKey, { name: string; text: string }> = {
  cleave: {
    name: 'Cleave',
    text: "If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon's damage, but don't add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.",
  },
  graze: {
    name: 'Graze',
    text: 'If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and it can be increased only by increasing the ability modifier.',
  },
  nick: {
    name: 'Nick',
    text: 'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.',
  },
  push: {
    name: 'Push',
    text: 'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.',
  },
  sap: {
    name: 'Sap',
    text: 'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.',
  },
  slow: {
    name: 'Slow',
    text: "If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn't exceed 10 feet.",
  },
  topple: {
    name: 'Topple',
    text: 'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 + the ability modifier used to make the attack roll + your Proficiency Bonus). On a failed save, the creature has the Prone condition.',
  },
  vex: {
    name: 'Vex',
    text: 'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn.',
  },
}

export interface WeaponDef {
  key: string
  name: string
  category: 'Simple Melee' | 'Simple Ranged' | 'Martial Melee' | 'Martial Ranged'
  damage: string
  damageType: string
  mastery: MasteryKey
  properties: string[]
  range?: string
}

const has = (props: string[], p: string) => props.some((x) => x.toLowerCase().startsWith(p))

export const WEAPONS: WeaponDef[] = [
  // Simple Melee
  { key: 'club', name: 'Club', category: 'Simple Melee', damage: '1d4', damageType: 'bludgeoning', mastery: 'slow', properties: ['Light'] },
  { key: 'dagger', name: 'Dagger', category: 'Simple Melee', damage: '1d4', damageType: 'piercing', mastery: 'nick', properties: ['Finesse', 'Light', 'Thrown (20/60)'] },
  { key: 'greatclub', name: 'Greatclub', category: 'Simple Melee', damage: '1d8', damageType: 'bludgeoning', mastery: 'push', properties: ['Two-Handed'] },
  { key: 'handaxe', name: 'Handaxe', category: 'Simple Melee', damage: '1d6', damageType: 'slashing', mastery: 'vex', properties: ['Light', 'Thrown (20/60)'] },
  { key: 'javelin', name: 'Javelin', category: 'Simple Melee', damage: '1d6', damageType: 'piercing', mastery: 'slow', properties: ['Thrown (30/120)'] },
  { key: 'light-hammer', name: 'Light Hammer', category: 'Simple Melee', damage: '1d4', damageType: 'bludgeoning', mastery: 'nick', properties: ['Light', 'Thrown (20/60)'] },
  { key: 'mace', name: 'Mace', category: 'Simple Melee', damage: '1d6', damageType: 'bludgeoning', mastery: 'sap', properties: [] },
  { key: 'quarterstaff', name: 'Quarterstaff', category: 'Simple Melee', damage: '1d6', damageType: 'bludgeoning', mastery: 'topple', properties: ['Versatile (1d8)'] },
  { key: 'sickle', name: 'Sickle', category: 'Simple Melee', damage: '1d4', damageType: 'slashing', mastery: 'nick', properties: ['Light'] },
  { key: 'spear', name: 'Spear', category: 'Simple Melee', damage: '1d6', damageType: 'piercing', mastery: 'sap', properties: ['Thrown (20/60)', 'Versatile (1d8)'] },
  // Simple Ranged
  { key: 'dart', name: 'Dart', category: 'Simple Ranged', damage: '1d4', damageType: 'piercing', mastery: 'vex', properties: ['Finesse', 'Thrown (20/60)'], range: '20/60' },
  { key: 'light-crossbow', name: 'Light Crossbow', category: 'Simple Ranged', damage: '1d8', damageType: 'piercing', mastery: 'slow', properties: ['Ammunition (80/320)', 'Loading', 'Two-Handed'], range: '80/320' },
  { key: 'shortbow', name: 'Shortbow', category: 'Simple Ranged', damage: '1d6', damageType: 'piercing', mastery: 'vex', properties: ['Ammunition (80/320)', 'Two-Handed'], range: '80/320' },
  { key: 'sling', name: 'Sling', category: 'Simple Ranged', damage: '1d4', damageType: 'bludgeoning', mastery: 'slow', properties: ['Ammunition (30/120)'], range: '30/120' },
  // Martial Melee
  { key: 'battleaxe', name: 'Battleaxe', category: 'Martial Melee', damage: '1d8', damageType: 'slashing', mastery: 'topple', properties: ['Versatile (1d10)'] },
  { key: 'flail', name: 'Flail', category: 'Martial Melee', damage: '1d8', damageType: 'bludgeoning', mastery: 'sap', properties: [] },
  { key: 'glaive', name: 'Glaive', category: 'Martial Melee', damage: '1d10', damageType: 'slashing', mastery: 'graze', properties: ['Heavy', 'Reach', 'Two-Handed'] },
  { key: 'greataxe', name: 'Greataxe', category: 'Martial Melee', damage: '1d12', damageType: 'slashing', mastery: 'cleave', properties: ['Heavy', 'Two-Handed'] },
  { key: 'greatsword', name: 'Greatsword', category: 'Martial Melee', damage: '2d6', damageType: 'slashing', mastery: 'graze', properties: ['Heavy', 'Two-Handed'] },
  { key: 'halberd', name: 'Halberd', category: 'Martial Melee', damage: '1d10', damageType: 'slashing', mastery: 'cleave', properties: ['Heavy', 'Reach', 'Two-Handed'] },
  { key: 'lance', name: 'Lance', category: 'Martial Melee', damage: '1d10', damageType: 'piercing', mastery: 'topple', properties: ['Heavy', 'Reach', 'Two-Handed (unless mounted)'] },
  { key: 'longsword', name: 'Longsword', category: 'Martial Melee', damage: '1d8', damageType: 'slashing', mastery: 'sap', properties: ['Versatile (1d10)'] },
  { key: 'maul', name: 'Maul', category: 'Martial Melee', damage: '2d6', damageType: 'bludgeoning', mastery: 'topple', properties: ['Heavy', 'Two-Handed'] },
  { key: 'morningstar', name: 'Morningstar', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', mastery: 'sap', properties: [] },
  { key: 'pike', name: 'Pike', category: 'Martial Melee', damage: '1d10', damageType: 'piercing', mastery: 'push', properties: ['Heavy', 'Reach', 'Two-Handed'] },
  { key: 'rapier', name: 'Rapier', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', mastery: 'vex', properties: ['Finesse'] },
  { key: 'scimitar', name: 'Scimitar', category: 'Martial Melee', damage: '1d6', damageType: 'slashing', mastery: 'nick', properties: ['Finesse', 'Light'] },
  { key: 'shortsword', name: 'Shortsword', category: 'Martial Melee', damage: '1d6', damageType: 'piercing', mastery: 'vex', properties: ['Finesse', 'Light'] },
  { key: 'trident', name: 'Trident', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', mastery: 'topple', properties: ['Thrown (20/60)', 'Versatile (1d10)'] },
  { key: 'warhammer', name: 'Warhammer', category: 'Martial Melee', damage: '1d8', damageType: 'bludgeoning', mastery: 'push', properties: ['Versatile (1d10)'] },
  { key: 'war-pick', name: 'War Pick', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', mastery: 'sap', properties: ['Versatile (1d10)'] },
  { key: 'whip', name: 'Whip', category: 'Martial Melee', damage: '1d4', damageType: 'slashing', mastery: 'slow', properties: ['Finesse', 'Reach'] },
  // Martial Ranged
  { key: 'blowgun', name: 'Blowgun', category: 'Martial Ranged', damage: '1', damageType: 'piercing', mastery: 'vex', properties: ['Ammunition (25/100)', 'Loading'], range: '25/100' },
  { key: 'hand-crossbow', name: 'Hand Crossbow', category: 'Martial Ranged', damage: '1d6', damageType: 'piercing', mastery: 'vex', properties: ['Ammunition (30/120)', 'Light', 'Loading'], range: '30/120' },
  { key: 'heavy-crossbow', name: 'Heavy Crossbow', category: 'Martial Ranged', damage: '1d10', damageType: 'piercing', mastery: 'push', properties: ['Ammunition (100/400)', 'Heavy', 'Loading', 'Two-Handed'], range: '100/400' },
  { key: 'longbow', name: 'Longbow', category: 'Martial Ranged', damage: '1d8', damageType: 'piercing', mastery: 'slow', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'], range: '150/600' },
  { key: 'musket', name: 'Musket', category: 'Martial Ranged', damage: '1d12', damageType: 'piercing', mastery: 'slow', properties: ['Ammunition (40/120)', 'Loading', 'Two-Handed'], range: '40/120' },
  { key: 'pistol', name: 'Pistol', category: 'Martial Ranged', damage: '1d10', damageType: 'piercing', mastery: 'vex', properties: ['Ammunition (30/90)', 'Loading'], range: '30/90' },
]

export function getWeapon(key: string | undefined): WeaponDef | undefined {
  return key ? WEAPONS.find((w) => w.key === key) : undefined
}

/** Savant weapon proficiencies: simple weapons + rapier, shortsword, whip;
 *  Tactician (Student of War) adds martial weapons without the Heavy property. */
export function savantProficientWith(w: WeaponDef, isTactician: boolean): boolean {
  if (w.category.startsWith('Simple')) return true
  if (['rapier', 'shortsword', 'whip'].includes(w.key)) return true
  if (isTactician) return !has(w.properties, 'heavy')
  return false
}

/** Suggested default attack ability: DEX for finesse/ranged weapons, otherwise STR. */
export function defaultAbility(w: WeaponDef): 'str' | 'dex' {
  if (w.category.includes('Ranged') || has(w.properties, 'finesse')) return 'dex'
  return 'str'
}
