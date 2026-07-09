// D&D 2024 (PHB) backgrounds. Each grants three eligible abilities (+2/+1 or
// +1/+1/+1 among them), an Origin feat, two skill proficiencies, a tool
// proficiency, and equipment.

import type { AbilityKey } from '../types'
import type { ChoicePick } from './lists'

export interface OriginFeatDef {
  key: string
  name: string
  text: string
  /** open "of your choice" grants the feat forces you to resolve */
  picks?: ChoicePick[]
}

export const ORIGIN_FEATS: OriginFeatDef[] = [
  { key: 'alert', name: 'Alert', text: 'Initiative Proficiency: add your Proficiency Bonus to Initiative rolls. Initiative Swap: immediately after rolling Initiative, you can swap your result with a willing ally in the same combat (unless either of you is Incapacitated).' },
  { key: 'crafter', name: 'Crafter', text: "Tool Proficiency: gain proficiency with three Artisan's Tools of your choice. Discount: 20% discount when buying nonmagical items. Fast Crafting: after a Long Rest, you can craft one piece of simple gear from a tool you're proficient with; it lasts until your next Long Rest.", picks: [
    { id: 'tool1', label: "Artisan's tools (1st)", from: 'artisan-tool' },
    { id: 'tool2', label: "Artisan's tools (2nd)", from: 'artisan-tool' },
    { id: 'tool3', label: "Artisan's tools (3rd)", from: 'artisan-tool' },
  ] },
  { key: 'healer', name: 'Healer', text: "Battle Medic: if you have a Healer's Kit, you can expend one use as a Utilize action to let a creature within 5 feet expend one Hit Die, rolling it + your Proficiency Bonus, regaining that many Hit Points. Healing Rerolls: whenever you roll a die to determine Hit Points restored with the Medicine skill or a spell, you can reroll a 1 (must use the new roll)." },
  { key: 'lucky', name: 'Lucky', text: 'Luck Points: you have Luck Points equal to your Proficiency Bonus, regained on a Long Rest. Advantage: spend 1 Luck Point to give yourself Advantage on a D20 Test. Disadvantage: when a creature rolls a d20 for an attack against you, spend 1 Luck Point to impose Disadvantage on that roll.' },
  { key: 'magic-initiate-cleric', name: 'Magic Initiate (Cleric)', text: 'You learn two cantrips and one level 1 spell from the Cleric spell list (the level 1 spell is always prepared; castable once per Long Rest without a slot, or with slots). Spellcasting ability: Intelligence, Wisdom, or Charisma. On level up you can replace one of the cantrips.' },
  { key: 'magic-initiate-druid', name: 'Magic Initiate (Druid)', text: 'You learn two cantrips and one level 1 spell from the Druid spell list (the level 1 spell is always prepared; castable once per Long Rest without a slot, or with slots). Spellcasting ability: Intelligence, Wisdom, or Charisma. On level up you can replace one of the cantrips.' },
  { key: 'magic-initiate-wizard', name: 'Magic Initiate (Wizard)', text: 'You learn two cantrips and one level 1 spell from the Wizard spell list (the level 1 spell is always prepared; castable once per Long Rest without a slot, or with slots). Spellcasting ability: Intelligence, Wisdom, or Charisma. On level up you can replace one of the cantrips.' },
  { key: 'musician', name: 'Musician', text: 'Instrument Training: gain proficiency with three Musical Instruments of your choice. Encouraging Song: as you finish a Short or Long Rest, you can play a song to give Heroic Inspiration to allies (up to your Proficiency Bonus) who hear it.', picks: [
    { id: 'inst1', label: 'Instrument (1st)', from: 'instrument' },
    { id: 'inst2', label: 'Instrument (2nd)', from: 'instrument' },
    { id: 'inst3', label: 'Instrument (3rd)', from: 'instrument' },
  ] },
  { key: 'savage-attacker', name: 'Savage Attacker', text: "Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target." },
  { key: 'skilled', name: 'Skilled', text: 'You gain proficiency in any combination of three skills or tools of your choice. Repeatable: you can take this feat more than once.', picks: [
    { id: 'p1', label: 'Skill or tool (1st)', from: 'skill-or-tool' },
    { id: 'p2', label: 'Skill or tool (2nd)', from: 'skill-or-tool' },
    { id: 'p3', label: 'Skill or tool (3rd)', from: 'skill-or-tool' },
  ] },
  { key: 'tavern-brawler', name: 'Tavern Brawler', text: 'Enhanced Unarmed Strike: your Unarmed Strike deals 1d4 + STR bludgeoning damage. Damage Rerolls: reroll 1s on Unarmed Strike damage. Improvised Weaponry: proficiency with improvised weapons. Push: once per turn when you hit with an Unarmed Strike, you can push the target 5 feet away.' },
  { key: 'tough', name: 'Tough', text: 'Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a level thereafter, it increases by an additional 2.' },
]

export interface BackgroundDef {
  key: string
  name: string
  abilities: [AbilityKey, AbilityKey, AbilityKey]
  featKey: string
  skills: [string, string]
  tool: string
  equipment: string
  blurb: string
}

export const BACKGROUNDS: BackgroundDef[] = [
  { key: 'acolyte', name: 'Acolyte', abilities: ['int', 'wis', 'cha'], featKey: 'magic-initiate-cleric', skills: ['insight', 'religion'], tool: "Calligrapher's Supplies", equipment: "Calligrapher's Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP — or 50 GP", blurb: 'You devoted yourself to service in a temple, learning sacred rites and rituals.' },
  { key: 'artisan', name: 'Artisan', abilities: ['str', 'dex', 'int'], featKey: 'crafter', skills: ['investigation', 'persuasion'], tool: "Artisan's Tools (one of your choice)", equipment: "Artisan's Tools (same as chosen), 2 Pouches, Traveler's Clothes, 32 GP — or 50 GP", blurb: 'You began mopping floors and scrubbing counters in an artisan\'s workshop, and learned the craft.' },
  { key: 'charlatan', name: 'Charlatan', abilities: ['dex', 'con', 'cha'], featKey: 'skilled', skills: ['deception', 'sleight-of-hand'], tool: 'Forgery Kit', equipment: "Forgery Kit, Costume, Fine Clothes, 15 GP — or 50 GP", blurb: 'You learned to prey on unsuspecting marks in taverns and on merchant ships.' },
  { key: 'criminal', name: 'Criminal', abilities: ['dex', 'con', 'int'], featKey: 'alert', skills: ['sleight-of-hand', 'stealth'], tool: "Thieves' Tools", equipment: "2 Daggers, Thieves' Tools, Crowbar, 2 Pouches, Traveler's Clothes, 16 GP — or 50 GP", blurb: 'You eked out a living in dark alleyways, cutting purses or burgling shops.' },
  { key: 'entertainer', name: 'Entertainer', abilities: ['str', 'dex', 'cha'], featKey: 'musician', skills: ['acrobatics', 'performance'], tool: 'Musical Instrument (one of your choice)', equipment: "Musical Instrument (same as chosen), 2 Costumes, Mirror, Perfume, Traveler's Clothes, 11 GP — or 50 GP", blurb: 'You spent much of your youth following roving fairs and carnivals, performing for audiences.' },
  { key: 'farmer', name: 'Farmer', abilities: ['str', 'con', 'wis'], featKey: 'tough', skills: ['animal-handling', 'nature'], tool: "Carpenter's Tools", equipment: "Sickle, Carpenter's Tools, Healer's Kit, Iron Pot, Shovel, Traveler's Clothes, 30 GP — or 50 GP", blurb: 'You grew up close to the land, learning the rhythms of nature and hard work.' },
  { key: 'guard', name: 'Guard', abilities: ['str', 'int', 'wis'], featKey: 'alert', skills: ['athletics', 'perception'], tool: 'Gaming Set (one of your choice)', equipment: "Spear, Light Crossbow, 20 Bolts, Gaming Set (same as chosen), Hooded Lantern, Manacles, Quiver, Traveler's Clothes, 12 GP — or 50 GP", blurb: 'Your feet ache when you remember the countless hours you spent at your post in the tower.' },
  { key: 'guide', name: 'Guide', abilities: ['dex', 'con', 'wis'], featKey: 'magic-initiate-druid', skills: ['stealth', 'survival'], tool: "Cartographer's Tools", equipment: "Shortbow, 20 Arrows, Cartographer's Tools, Bedroll, Quiver, Tent, Traveler's Clothes, 3 GP — or 50 GP", blurb: 'You came of age in the outdoors, far from settled lands, learning from wilderness wardens.' },
  { key: 'hermit', name: 'Hermit', abilities: ['con', 'wis', 'cha'], featKey: 'healer', skills: ['medicine', 'religion'], tool: 'Herbalism Kit', equipment: "Quarterstaff, Herbalism Kit, Bedroll, Book (philosophy), Lamp, Oil (3 flasks), Traveler's Clothes, 16 GP — or 50 GP", blurb: 'You spent your early years secluded in a hut or monastery, in contemplation of the cosmos.' },
  { key: 'merchant', name: 'Merchant', abilities: ['con', 'int', 'cha'], featKey: 'lucky', skills: ['animal-handling', 'persuasion'], tool: "Navigator's Tools", equipment: "Navigator's Tools, 2 Pouches, Traveler's Clothes, 22 GP — or 50 GP", blurb: 'You were apprenticed to a trader, caravan master, or shopkeeper, learning the fundamentals of commerce.' },
  { key: 'noble', name: 'Noble', abilities: ['str', 'int', 'cha'], featKey: 'skilled', skills: ['history', 'persuasion'], tool: 'Gaming Set (one of your choice)', equipment: 'Gaming Set (same as chosen), Fine Clothes, Perfume, 29 GP — or 50 GP', blurb: 'You were raised in a castle as a creature of wealth, power, and privilege.' },
  { key: 'sage', name: 'Sage', abilities: ['con', 'int', 'wis'], featKey: 'magic-initiate-wizard', skills: ['arcana', 'history'], tool: "Calligrapher's Supplies", equipment: "Quarterstaff, Calligrapher's Supplies, Book (history), Parchment (8 sheets), Robe, 8 GP — or 50 GP", blurb: 'You spent your formative years traveling between manors and monasteries, studying and learning.' },
  { key: 'sailor', name: 'Sailor', abilities: ['str', 'dex', 'wis'], featKey: 'tavern-brawler', skills: ['acrobatics', 'perception'], tool: "Navigator's Tools", equipment: "Dagger, Navigator's Tools, Rope, Traveler's Clothes, 20 GP — or 50 GP", blurb: 'You lived as a seafarer, wind at your back and decks swaying beneath your feet.' },
  { key: 'scribe', name: 'Scribe', abilities: ['dex', 'int', 'wis'], featKey: 'skilled', skills: ['investigation', 'perception'], tool: "Calligrapher's Supplies", equipment: "Calligrapher's Supplies, Fine Clothes, Lamp, Oil (3 flasks), Parchment (12 sheets), 23 GP — or 50 GP", blurb: 'You spent formative years in a scriptorium or government agency, copying official texts.' },
  { key: 'soldier', name: 'Soldier', abilities: ['str', 'dex', 'con'], featKey: 'savage-attacker', skills: ['athletics', 'intimidation'], tool: 'Gaming Set (one of your choice)', equipment: "Spear, Shortbow, 20 Arrows, Gaming Set (same as chosen), Healer's Kit, Quiver, Traveler's Clothes, 14 GP — or 50 GP", blurb: 'You trained as a youth, studied the use of weapons and armor, and learned basic survival techniques.' },
  { key: 'wayfarer', name: 'Wayfarer', abilities: ['dex', 'wis', 'cha'], featKey: 'lucky', skills: ['insight', 'stealth'], tool: "Thieves' Tools", equipment: "2 Daggers, Thieves' Tools, Gaming Set (any), Bedroll, 2 Pouches, Traveler's Clothes, 16 GP — or 50 GP", blurb: 'You grew up on the streets, surrounded by similarly ill-fated castoffs.' },
]

export function getBackground(key: string): BackgroundDef | undefined {
  return BACKGROUNDS.find((b) => b.key === key)
}

export function getOriginFeat(key: string): OriginFeatDef | undefined {
  return ORIGIN_FEATS.find((f) => f.key === key)
}
