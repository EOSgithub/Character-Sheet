// D&D 2024 (PHB) species. Trait text is summarized for sheet use.

export interface SpeciesTrait {
  name: string
  text: string
}

export interface SpeciesVariant {
  key: string
  name: string
  traits: SpeciesTrait[]
}

export interface SpeciesDef {
  key: string
  name: string
  size: string
  speed: number
  traits: SpeciesTrait[]
  variantLabel?: string
  variants?: SpeciesVariant[]
}

export const SPECIES: SpeciesDef[] = [
  {
    key: 'aasimar',
    name: 'Aasimar',
    size: 'Medium or Small (choose when you select this species)',
    speed: 30,
    traits: [
      { name: 'Celestial Resistance', text: 'You have resistance to Necrotic and Radiant damage.' },
      { name: 'Darkvision', text: 'You have Darkvision with a range of 60 feet.' },
      { name: 'Healing Hands', text: 'As a Magic action, touch a creature and roll a number of d4s equal to your Proficiency Bonus; it regains that many Hit Points. Once used, you must finish a Long Rest before using it again.' },
      { name: 'Light Bearer', text: 'You know the Light cantrip. Charisma is your spellcasting ability for it.' },
      { name: 'Celestial Revelation', text: 'When you reach character level 3, as a Bonus Action you can transform for 1 minute or until you end it (once per Long Rest). Choose Heavenly Wings (Fly Speed equal to your Speed), Inner Radiance (Bright Light 10 ft, at the end of your turns each creature within 10 feet takes Radiant damage equal to your Proficiency Bonus), or Necrotic Shroud (creatures within 10 feet must succeed on a Charisma save or be Frightened until end of your next turn). Once per turn while transformed, you can deal extra damage equal to your Proficiency Bonus (Radiant, or Necrotic for Necrotic Shroud) when you hit with an attack or deal spell damage.' },
    ],
  },
  {
    key: 'dragonborn',
    name: 'Dragonborn',
    size: 'Medium',
    speed: 30,
    variantLabel: 'Draconic Ancestry',
    variants: [
      { key: 'black', name: 'Black (Acid)', traits: [] },
      { key: 'blue', name: 'Blue (Lightning)', traits: [] },
      { key: 'brass', name: 'Brass (Fire)', traits: [] },
      { key: 'bronze', name: 'Bronze (Lightning)', traits: [] },
      { key: 'copper', name: 'Copper (Acid)', traits: [] },
      { key: 'gold', name: 'Gold (Fire)', traits: [] },
      { key: 'green', name: 'Green (Poison)', traits: [] },
      { key: 'red', name: 'Red (Fire)', traits: [] },
      { key: 'silver', name: 'Silver (Cold)', traits: [] },
      { key: 'white', name: 'White (Cold)', traits: [] },
    ],
    traits: [
      { name: 'Draconic Ancestry', text: 'Your lineage stems from a dragon progenitor; its type determines the damage type of your Breath Weapon and Damage Resistance.' },
      { name: 'Breath Weapon', text: 'When you take the Attack action, you can replace one attack with an exhalation in a 15-foot Cone or 30-foot Line (5 ft wide). Each creature in the area makes a Dexterity save (DC 8 + CON modifier + Proficiency Bonus); on a failure it takes 1d10 damage of your ancestry type (half on success). Damage increases to 2d10 at character level 5, 3d10 at 11, 4d10 at 17. Uses: Proficiency Bonus per Long Rest.' },
      { name: 'Damage Resistance', text: 'You have resistance to the damage type of your Draconic Ancestry.' },
      { name: 'Darkvision', text: 'You have Darkvision with a range of 60 feet.' },
      { name: 'Draconic Flight', text: 'At character level 5, as a Bonus Action you can sprout spectral wings for 10 minutes (once per Long Rest), gaining a Fly Speed equal to your Speed.' },
    ],
  },
  {
    key: 'dwarf',
    name: 'Dwarf',
    size: 'Medium',
    speed: 30,
    traits: [
      { name: 'Darkvision', text: 'You have Darkvision with a range of 120 feet.' },
      { name: 'Dwarven Resilience', text: 'You have resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition.' },
      { name: 'Dwarven Toughness', text: 'Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.' },
      { name: 'Stonecunning', text: 'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes; you must be on a stone surface or touching stone. Uses: Proficiency Bonus per Long Rest.' },
    ],
  },
  {
    key: 'elf',
    name: 'Elf',
    size: 'Medium',
    speed: 30,
    variantLabel: 'Elven Lineage',
    variants: [
      { key: 'drow', name: 'Drow', traits: [
        { name: 'Lineage: Drow', text: 'Darkvision range becomes 120 feet. You know the Dancing Lights cantrip. At character level 3 you learn Faerie Fire; at level 5, Darkness (each castable once per Long Rest without a spell slot, or with slots).' },
      ] },
      { key: 'high-elf', name: 'High Elf', traits: [
        { name: 'Lineage: High Elf', text: 'You know the Prestidigitation cantrip; on a Long Rest you can replace it with another Wizard cantrip. At character level 3 you learn Detect Magic; at level 5, Misty Step (each castable once per Long Rest without a spell slot, or with slots).' },
      ] },
      { key: 'wood-elf', name: 'Wood Elf', traits: [
        { name: 'Lineage: Wood Elf', text: 'Your Speed increases to 35 feet. You know the Druidcraft cantrip. At character level 3 you learn Longstrider; at level 5, Pass Without Trace (each castable once per Long Rest without a spell slot, or with slots).' },
      ] },
    ],
    traits: [
      { name: 'Darkvision', text: 'You have Darkvision with a range of 60 feet.' },
      { name: 'Elven Lineage', text: 'Choose a lineage (Drow, High Elf, or Wood Elf). You gain its benefits; Intelligence, Wisdom, or Charisma is your spellcasting ability for its spells (choose when you select the lineage).' },
      { name: 'Fey Ancestry', text: 'You have Advantage on saving throws to avoid or end the Charmed condition.' },
      { name: 'Keen Senses', text: 'You have proficiency in the Insight, Perception, or Survival skill (choose one).' },
      { name: 'Trance', text: "You don't need to sleep and magic can't put you to sleep. You can finish a Long Rest in 4 hours in a trancelike meditation." },
    ],
  },
  {
    key: 'gnome',
    name: 'Gnome',
    size: 'Small',
    speed: 30,
    variantLabel: 'Gnomish Lineage',
    variants: [
      { key: 'forest', name: 'Forest Gnome', traits: [
        { name: 'Lineage: Forest Gnome', text: 'You know the Minor Illusion cantrip. You always have Speak with Animals prepared; you can cast it without a spell slot a number of times equal to your Proficiency Bonus per Long Rest.' },
      ] },
      { key: 'rock', name: 'Rock Gnome', traits: [
        { name: 'Lineage: Rock Gnome', text: "You know the Mending and Prestidigitation cantrips. You can spend 10 minutes casting Prestidigitation to create a Tiny clockwork device (AC 5, 1 HP) that produces one Prestidigitation effect on command; you can have three such devices at a time, each lasting 8 hours." },
      ] },
    ],
    traits: [
      { name: 'Darkvision', text: 'You have Darkvision with a range of 60 feet.' },
      { name: 'Gnomish Cunning', text: 'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.' },
      { name: 'Gnomish Lineage', text: 'Choose Forest Gnome or Rock Gnome. Intelligence, Wisdom, or Charisma is your spellcasting ability for its spells (choose when you select the lineage).' },
    ],
  },
  {
    key: 'goliath',
    name: 'Goliath',
    size: 'Medium (about 7–8 feet tall)',
    speed: 35,
    variantLabel: 'Giant Ancestry',
    variants: [
      { key: 'cloud', name: "Cloud's Jaunt", traits: [{ name: "Cloud's Jaunt", text: 'As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see.' }] },
      { key: 'fire', name: "Fire's Burn", traits: [{ name: "Fire's Burn", text: 'When you hit a target with an attack roll and deal damage, you can also deal 1d10 Fire damage to that target.' }] },
      { key: 'frost', name: "Frost's Chill", traits: [{ name: "Frost's Chill", text: 'When you hit a target with an attack roll and deal damage, you can also deal 1d6 Cold damage and reduce its Speed by 10 feet until the start of your next turn.' }] },
      { key: 'hill', name: "Hill's Tumble", traits: [{ name: "Hill's Tumble", text: 'When you hit a Large or smaller creature with an attack roll and deal damage, you can give it the Prone condition.' }] },
      { key: 'stone', name: "Stone's Endurance", traits: [{ name: "Stone's Endurance", text: 'When you take damage, you can use a Reaction to roll 1d12, add your Constitution modifier, and reduce the damage by that total.' }] },
      { key: 'storm', name: "Storm's Thunder", traits: [{ name: "Storm's Thunder", text: 'When you take damage from a creature within 60 feet, you can use a Reaction to deal 1d8 Thunder damage to that creature.' }] },
    ],
    traits: [
      { name: 'Giant Ancestry', text: 'Choose one supernatural boon from your giant ancestry. You can use it a number of times equal to your Proficiency Bonus per Long Rest.' },
      { name: 'Large Form', text: 'At character level 5, as a Bonus Action you can become Large for 10 minutes (once per Long Rest) if there is room. You have Advantage on Strength checks and your Speed increases by 10 feet while Large.' },
      { name: 'Powerful Build', text: 'You have Advantage on saving throws to end the Grappled condition, and you count as one size larger for carrying capacity.' },
    ],
  },
  {
    key: 'halfling',
    name: 'Halfling',
    size: 'Small',
    speed: 30,
    traits: [
      { name: 'Brave', text: 'You have Advantage on saving throws to avoid or end the Frightened condition.' },
      { name: 'Halfling Nimbleness', text: 'You can move through the space of any creature that is a size larger than you, but you can\'t stop in the same space.' },
      { name: 'Luck', text: 'When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.' },
      { name: 'Naturally Stealthy', text: 'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.' },
    ],
  },
  {
    key: 'human',
    name: 'Human',
    size: 'Medium or Small (choose when you select this species)',
    speed: 30,
    traits: [
      { name: 'Resourceful', text: 'You gain Heroic Inspiration whenever you finish a Long Rest.' },
      { name: 'Skillful', text: 'You gain proficiency in one skill of your choice.' },
      { name: 'Versatile', text: 'You gain an Origin feat of your choice (Skilled is recommended).' },
    ],
  },
  {
    key: 'orc',
    name: 'Orc',
    size: 'Medium',
    speed: 30,
    traits: [
      { name: 'Adrenaline Rush', text: 'You can take the Dash action as a Bonus Action; when you do, you gain Temporary Hit Points equal to your Proficiency Bonus. Uses: Proficiency Bonus per Short or Long Rest.' },
      { name: 'Darkvision', text: 'You have Darkvision with a range of 120 feet.' },
      { name: 'Relentless Endurance', text: 'When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead (once per Long Rest).' },
    ],
  },
  {
    key: 'tiefling',
    name: 'Tiefling',
    size: 'Medium or Small (choose when you select this species)',
    speed: 30,
    variantLabel: 'Fiendish Legacy',
    variants: [
      { key: 'abyssal', name: 'Abyssal', traits: [
        { name: 'Legacy: Abyssal', text: 'You have resistance to Poison damage. You know the Poison Spray cantrip. At character level 3 you learn Ray of Sickness; at level 5, Hold Person (each castable once per Long Rest without a spell slot, or with slots).' },
      ] },
      { key: 'chthonic', name: 'Chthonic', traits: [
        { name: 'Legacy: Chthonic', text: 'You have resistance to Necrotic damage. You know the Chill Touch cantrip. At character level 3 you learn False Life; at level 5, Ray of Enfeeblement (each castable once per Long Rest without a spell slot, or with slots).' },
      ] },
      { key: 'infernal', name: 'Infernal', traits: [
        { name: 'Legacy: Infernal', text: 'You have resistance to Fire damage. You know the Fire Bolt cantrip. At character level 3 you learn Hellish Rebuke; at level 5, Darkness (each castable once per Long Rest without a spell slot, or with slots).' },
      ] },
    ],
    traits: [
      { name: 'Darkvision', text: 'You have Darkvision with a range of 60 feet.' },
      { name: 'Fiendish Legacy', text: 'Choose a legacy (Abyssal, Chthonic, or Infernal). You gain its benefits; Intelligence, Wisdom, or Charisma is your spellcasting ability for its spells (choose when you select the legacy).' },
      { name: 'Otherworldly Presence', text: 'You know the Thaumaturgy cantrip, using the same spellcasting ability as your Fiendish Legacy.' },
    ],
  },
]

export function getSpecies(key: string): SpeciesDef | undefined {
  return SPECIES.find((s) => s.key === key)
}
