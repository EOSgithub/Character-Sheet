// Rules glossary — the game terms, conditions, actions, and weapon properties
// that feature texts reference. These power the tap-any-keyword links: every
// entry here becomes readable in the rules panel. Texts follow the D&D 2024
// rules; Savant terms follow the class documents in /reference.

export interface GlossaryEntry {
  key: string
  name: string
  kind: 'condition' | 'term' | 'action' | 'property' | 'skill'
  /** subtitle shown under the name in the rules panel */
  meta?: string
  /** extra strings that should also link to this entry */
  aliases?: string[]
  /** match only the exact capitalisation (avoids linking prose words like "light" or "help") */
  matchCase?: boolean
  text: string
}

// ---------------------------------------------------------------------------
// Conditions (D&D 2024)
// ---------------------------------------------------------------------------

export const CONDITION_GLOSSARY: GlossaryEntry[] = [
  {
    key: 'blinded', name: 'Blinded', kind: 'condition',
    text: `While you have the Blinded condition:
• You can't see and automatically fail any ability check that requires sight.
• Attack rolls against you have Advantage, and your attack rolls have Disadvantage.`,
  },
  {
    key: 'charmed', name: 'Charmed', kind: 'condition',
    text: `While you have the Charmed condition:
• You can't attack the charmer or target the charmer with damaging abilities or magical effects.
• The charmer has Advantage on any ability check to interact with you socially.`,
  },
  {
    key: 'deafened', name: 'Deafened', kind: 'condition',
    text: `While you have the Deafened condition, you can't hear and automatically fail any ability check that requires hearing.`,
  },
  {
    key: 'frightened', name: 'Frightened', kind: 'condition',
    text: `While you have the Frightened condition:
• You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.
• You can't willingly move closer to the source of fear.`,
  },
  {
    key: 'grappled', name: 'Grappled', kind: 'condition',
    text: `While you have the Grappled condition:
• Your Speed is 0 and can't increase.
• You have Disadvantage on attack rolls against any target other than the grappler.
• The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.`,
  },
  {
    key: 'incapacitated', name: 'Incapacitated', kind: 'condition',
    text: `While you have the Incapacitated condition:
• You can't take any action, Bonus Action, or Reaction.
• Your Concentration is broken.
• You can't speak.
• If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll.`,
  },
  {
    key: 'invisible', name: 'Invisible', kind: 'condition',
    text: `While you have the Invisible condition:
• If you're Invisible when you roll Initiative, you have Advantage on the roll.
• You aren't affected by any effect that requires its target to be seen, unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed.
• Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature.`,
  },
  {
    key: 'paralyzed', name: 'Paralyzed', kind: 'condition',
    text: `While you have the Paralyzed condition:
• You have the Incapacitated condition and can't move or speak.
• You automatically fail Strength and Dexterity saving throws.
• Attack rolls against you have Advantage.
• Any attack roll that hits you is a critical hit if the attacker is within 5 feet of you.`,
  },
  {
    key: 'petrified', name: 'Petrified', kind: 'condition',
    text: `While you have the Petrified condition:
• You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.
• You have the Incapacitated condition and can't move or speak, and you are unaware of your surroundings.
• Attack rolls against you have Advantage, and you automatically fail Strength and Dexterity saving throws.
• You have Resistance to all damage, and you have Immunity to the Poisoned condition.`,
  },
  {
    key: 'poisoned', name: 'Poisoned', kind: 'condition',
    text: `While you have the Poisoned condition, you have Disadvantage on attack rolls and ability checks.`,
  },
  {
    key: 'prone', name: 'Prone', kind: 'condition',
    text: `While you have the Prone condition:
• Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to stand up, which ends the condition.
• You have Disadvantage on attack rolls.
• An attack roll against you has Advantage if the attacker is within 5 feet of you; otherwise it has Disadvantage.`,
  },
  {
    key: 'restrained', name: 'Restrained', kind: 'condition',
    text: `While you have the Restrained condition:
• Your Speed is 0 and can't increase.
• Attack rolls against you have Advantage, and your attack rolls have Disadvantage.
• You have Disadvantage on Dexterity saving throws.`,
  },
  {
    key: 'stunned', name: 'Stunned', kind: 'condition',
    text: `While you have the Stunned condition:
• You have the Incapacitated condition.
• You automatically fail Strength and Dexterity saving throws.
• Attack rolls against you have Advantage.`,
  },
  {
    key: 'unconscious', name: 'Unconscious', kind: 'condition',
    text: `While you have the Unconscious condition:
• You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone.
• You automatically fail Strength and Dexterity saving throws.
• Attack rolls against you have Advantage, and any attack roll that hits you is a critical hit if the attacker is within 5 feet of you.
• You are unaware of your surroundings.`,
  },
  {
    key: 'exhaustion', name: 'Exhaustion', kind: 'condition',
    text: `Exhaustion is cumulative — each time you receive it, you gain 1 level (max 6). While exhausted:
• D20 Tests (ability checks, attack rolls, and saving throws) take a penalty of 2 × your exhaustion level.
• Your Speed is reduced by 5 feet × your exhaustion level. (The Speed gauge on this sheet already reflects this.)
• If your exhaustion reaches level 6, you die.
Finishing a Long Rest removes 1 level of exhaustion.`,
  },
]

// ---------------------------------------------------------------------------
// Savant & general game terms
// ---------------------------------------------------------------------------

export const TERM_GLOSSARY: GlossaryEntry[] = [
  {
    key: 'focus', name: 'Focus', kind: 'term', meta: 'Adroit Analysis', matchCase: true,
    text: `The creature you have designated with Adroit Analysis (a Bonus Action, one creature you can see within 60 feet). While a creature is your Focus:
• When you hit it with an attack, or observe it for 1 minute, you learn one characteristic of your choice (highest or lowest ability score, Armor Class, Speed, creature type, or one special sense).
• You can use Intelligence, instead of Strength or Dexterity, for weapon attack and damage rolls against it.
• Once per turn when you hit it with an attack, you deal bonus damage equal to one roll of your Intellect Die.
• Its attacks against you have Disadvantage.
It stays your Focus until you end the effect, it hides from you, you designate another creature, or you are Incapacitated. While you have a Focus you cannot cast or concentrate on spells.`,
  },
  {
    key: 'intellect-die', name: 'Intellect Die', kind: 'term', meta: 'Genius Intellect', matchCase: true,
    aliases: ['Intellect Dice'],
    text: `The die that represents your analytical abilities, granted by Genius Intellect at Savant level 2. It starts as a d6 and grows with your Savant level: d8 at 5th, d10 at 11th, and d12 at 17th.
Features that use it include Calculated Flourish, Potent Observation, Wondrous Insight, your Focus bonus damage, and many discipline and pursuit features. If a feature would let you add your Intellect Die to a roll that already benefits from it, roll twice and use the higher result.`,
  },
  {
    key: 'intellect-dc', name: 'Intellect save DC', kind: 'term', meta: 'Genius Intellect', matchCase: true,
    aliases: ['Intellect Save DC'],
    text: `The saving throw DC for your Savant features: 8 + your Proficiency Bonus + your Intelligence modifier. The DC gauge in the character band shows the current value.`,
  },
  {
    key: 'calculated-flourish', name: 'Calculated Flourish', kind: 'term', meta: 'Genius Intellect', matchCase: true,
    text: `When a creature you can see targets you with a melee attack, you can use a reaction to add one roll of your Intellect Die to your Armor Class against that attack. If this Flourish causes the attack to miss, you can move up to 10 feet as part of the same reaction without provoking opportunity attacks.
From 11th level (Unrivaled Genius), if your reaction causes the attack to miss, you can instead make one melee attack against your attacker as part of the reaction. An Investigator's Devious Flourish can force a Rough & Tumble saving throw instead of the movement.`,
  },
  {
    key: 'potent-observation', name: 'Potent Observation', kind: 'term', meta: 'Genius Intellect', matchCase: true,
    text: `When another creature that can hear you hits your Focus with an attack, you can use your reaction to grant it a bonus to its damage roll equal to one roll of your Intellect Die.
From 11th level (Unrivaled Genius), you can use this reaction whenever another creature that can hear you attacks a creature you can see — and if the target is your Focus, you add two rolls of your Intellect Die to the damage.`,
  },
  {
    key: 'wondrous-insight', name: 'Wondrous Insight', kind: 'term', meta: 'Genius Intellect', matchCase: true,
    text: `When another creature that can hear you makes an ability check using a skill or tool that you are proficient in, you can use your reaction to grant it a bonus to its roll equal to one roll of your Intellect Die. You can do so after it rolls the d20.
From 11th level (Unrivaled Genius), you roll your Intellect Die twice and use the higher roll.`,
  },
  {
    key: 'heroic-inspiration', name: 'Heroic Inspiration', kind: 'term', matchCase: true,
    text: `If you have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll. You can never have more than one Heroic Inspiration; if you gain it while you already have it, you can give it to another creature instead.`,
  },
  {
    key: 'temp-hp', name: 'Temporary Hit Points', kind: 'term',
    aliases: ['temporary hit points', 'temporary hit point'],
    text: `A buffer of protection on top of your real Hit Points. Damage removes Temporary Hit Points first. They can't be healed, don't stack (when you gain more, keep the higher amount), and disappear when you finish a Long Rest. Having them doesn't count as being healed.`,
  },
  {
    key: 'hit-dice', name: 'Hit Dice', kind: 'term',
    aliases: ['Hit Die'],
    text: `You have one Hit Die per level (d8 for a Savant). During a Short Rest you can spend Hit Dice: for each die spent, roll it, add your Constitution modifier, and regain that many Hit Points. You regain all spent Hit Dice when you finish a Long Rest.`,
  },
  {
    key: 'short-rest', name: 'Short Rest', kind: 'term',
    aliases: ['short rest'],
    text: `A period of at least 1 hour of light activity. At the end you can spend Hit Dice to regain Hit Points, and features that recharge on a Short Rest are restored. The Rest card on the Battle tab automates this.`,
  },
  {
    key: 'long-rest', name: 'Long Rest', kind: 'term',
    aliases: ['long rest'],
    text: `A period of at least 8 hours of sleep or light activity. When you finish a Long Rest you regain all Hit Points and all spent Hit Dice, your Temporary Hit Points end, your exhaustion drops by 1 level, and all per-rest feature uses reset. The Rest card on the Battle tab automates this.`,
  },
  {
    key: 'advantage', name: 'Advantage', kind: 'term', matchCase: true,
    aliases: ['advantage'],
    text: `Roll two d20s and use the higher roll. Multiple sources of Advantage don't stack — you still roll only two dice. If a roll has both Advantage and Disadvantage from any source, they cancel and you roll one d20.`,
  },
  {
    key: 'disadvantage', name: 'Disadvantage', kind: 'term', matchCase: true,
    aliases: ['disadvantage'],
    text: `Roll two d20s and use the lower roll. Multiple sources of Disadvantage don't stack — you still roll only two dice. If a roll has both Advantage and Disadvantage from any source, they cancel and you roll one d20.`,
  },
  {
    key: 'concentration', name: 'Concentration', kind: 'term',
    aliases: ['concentrate', 'concentration'],
    text: `Some effects require Concentration to stay active. You lose Concentration if you take damage and fail a Constitution saving throw (DC 10 or half the damage, whichever is higher), if you have the Incapacitated condition, or if you start another effect that requires Concentration.
Savant note: while you have a Focus you cannot cast or concentrate on spells or use other features that require your Concentration (Rune Scribes and Archaeologists gain exceptions).`,
  },
  {
    key: 'reaction', name: 'Reaction', kind: 'term',
    aliases: ['reaction', 'reactions'],
    text: `An instant response to a trigger, taken on your turn or another creature's. You normally have one Reaction per round, regained at the start of your turn.
Savant note: Swift Reflexes grants a second Reaction at 5th level, a third at 13th, and a fourth at 18th — but only one Reaction per trigger.`,
  },
  {
    key: 'bonus-action', name: 'Bonus Action', kind: 'term',
    aliases: ['bonus action'],
    text: `A brief extra activity on your turn. You can take only one Bonus Action per turn, and only when a feature says you can (for a Savant: Adroit Analysis, Sharp Mind, and various discipline features).`,
  },
  {
    key: 'opportunity-attack', name: 'Opportunity Attack', kind: 'term',
    aliases: ['opportunity attack', 'opportunity attacks'],
    text: `When a creature you can see leaves your reach, you can use your Reaction to make one melee attack against it. Taking the Disengage action lets you move without provoking Opportunity Attacks.`,
  },
  {
    key: 'difficult-terrain', name: 'Difficult Terrain', kind: 'term',
    aliases: ['difficult terrain'],
    text: `Every foot of movement in Difficult Terrain costs 1 extra foot, even if multiple things in a space make it difficult.`,
  },
  {
    key: 'darkvision', name: 'Darkvision', kind: 'term', matchCase: true,
    text: `You can see in dim light within the listed range as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.`,
  },
  {
    key: 'truesight', name: 'Truesight', kind: 'term', matchCase: true,
    text: `Within the listed range you see in normal and magical darkness, see creatures and objects with the Invisible condition, automatically detect visual illusions and succeed on saves against them, perceive the original form of a shapeshifter or transformed creature, and see into the Ethereal Plane.`,
  },
  {
    key: 'tremorsense', name: 'Tremorsense', kind: 'term', matchCase: true,
    aliases: ['tremorsense'],
    text: `You can pinpoint the location of creatures and moving objects within the listed range, provided that you and anything you're detecting are in contact with the same ground or liquid. Tremorsense can't detect creatures or objects in the air.`,
  },
  {
    key: 'proficiency-bonus', name: 'Proficiency Bonus', kind: 'term', matchCase: true,
    text: `A bonus added to any D20 Test that uses something you are proficient in (skills, saving throws, weapons, tools). It starts at +2 and grows with your level: +3 at 5th, +4 at 9th, +5 at 13th, +6 at 17th. It is never added more than once to the same roll (Expertise adds it a second time as a special exception).`,
  },
  {
    key: 'd20-test', name: 'D20 Test', kind: 'term', matchCase: true,
    aliases: ['D20 Tests'],
    text: `The umbrella term for the three main d20 rolls: ability checks, attack rolls, and saving throws. Anything that affects "D20 Tests" (like Heroic Inspiration or exhaustion) affects all three.`,
  },
  {
    key: 'unarmed-strike', name: 'Unarmed Strike', kind: 'term', matchCase: true,
    aliases: ['unarmed strike', 'unarmed strikes'],
    text: `A melee attack with your body: punch, kick, headbutt, or shove. On a hit you can deal bludgeoning damage equal to 1 + your Strength modifier, grapple the target, or push it.
Savant note: an Investigator's Rough & Tumble upgrades unarmed strike damage to an Intellect Die roll + Strength modifier.`,
  },
  {
    key: 'thieves-cant', name: "Thieves' Cant", kind: 'term', matchCase: true,
    text: `A secret mix of dialect, jargon, and code used by the criminal underworld to hide messages in seemingly normal conversation.`,
  },
]

// ---------------------------------------------------------------------------
// Actions (D&D 2024)
// ---------------------------------------------------------------------------

export const ACTION_GLOSSARY: GlossaryEntry[] = [
  { key: 'attack-action', name: 'Attack action', kind: 'action', matchCase: true, aliases: ['Attack Action'], text: `Attack with a weapon or make an Unarmed Strike. Features like the Tactician's Strategic Superiority let you attack twice when you take this action, and Orders are issued in place of one of these attacks.` },
  { key: 'dash', name: 'Dash', kind: 'action', matchCase: true, text: `Gain extra movement equal to your Speed (after modifiers) for the rest of the turn.` },
  { key: 'disengage', name: 'Disengage', kind: 'action', matchCase: true, text: `Your movement doesn't provoke Opportunity Attacks for the rest of the turn.` },
  { key: 'dodge', name: 'Dodge', kind: 'action', matchCase: true, text: `Until the start of your next turn, attack rolls against you have Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. You lose these benefits if you have the Incapacitated condition or your Speed is 0.` },
  { key: 'help', name: 'Help', kind: 'action', matchCase: true, text: `Either assist another creature's ability check (it gains Advantage on the next check with the chosen skill or tool before the start of your next turn), or distract a foe within 5 feet of you (the next attack roll against it by one of your allies has Advantage before the start of your next turn).
Savant note: Sharp Mind lets you take the Help action as a Bonus Action, and lets you aid attacks against your Focus from 5 feet of the attacker instead of the target.` },
  { key: 'hide', name: 'Hide', kind: 'action', matchCase: true, text: `Make a DC 15 Dexterity (Stealth) check while Heavily Obscured or behind cover, out of enemies' line of sight. On a success you have the Invisible condition until you are found, make noise, attack, or cast a spell with a verbal component.` },
  { key: 'search', name: 'Search', kind: 'action', matchCase: true, text: `Make a Wisdom check to discern something that isn't obvious — Insight (thoughts and intentions), Medicine (ailments and cause of death), Perception (concealed creatures and objects), or Survival (tracks and food).
Savant note: Sharp Mind lets you take the Search action as a Bonus Action; an Investigator's Student of Truth gains a full minute of information in one action.` },
  { key: 'study', name: 'Study', kind: 'action', matchCase: true, text: `Make an Intelligence check to recall or discover information — Arcana, History, Investigation, Nature, or Religion depending on the subject.` },
  { key: 'utilize', name: 'Utilize', kind: 'action', matchCase: true, aliases: ['Use an Object'], text: `Use an object that requires an action, such as drinking a potion or pulling a lever.` },
  { key: 'magic-action', name: 'Magic action', kind: 'action', matchCase: true, text: `Cast a spell, use a magic item, or use a magical feature that requires the Magic action.` },
]

// ---------------------------------------------------------------------------
// Weapon properties (D&D 2024)
// ---------------------------------------------------------------------------

export const PROPERTY_GLOSSARY: GlossaryEntry[] = [
  { key: 'ammunition', name: 'Ammunition', kind: 'property', matchCase: true, text: `You can use the weapon to make a ranged attack only if you have ammunition to fire. The type and the weapon's range appear in parentheses. Each attack expends one piece of ammunition; drawing it is part of the attack. After combat you can recover half your expended ammunition.` },
  { key: 'finesse', name: 'Finesse', kind: 'property', matchCase: true, text: `When making an attack with a Finesse weapon, use your choice of Strength or Dexterity for the attack and damage rolls (the same ability for both). A Savant can use Intelligence against their Focus regardless.` },
  { key: 'heavy', name: 'Heavy', kind: 'property', matchCase: true, text: `You have Disadvantage on attack rolls with a Heavy weapon if it's a melee weapon and your Strength is below 13, or a ranged weapon and your Dexterity is below 13. (Tacticians' martial weapon training excludes Heavy weapons.)` },
  { key: 'light', name: 'Light', kind: 'property', matchCase: true, text: `When you take the Attack action and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn with a different Light weapon, without adding your ability modifier to the extra attack's damage (unless the modifier is negative).` },
  { key: 'loading', name: 'Loading', kind: 'property', matchCase: true, text: `You can fire only one piece of ammunition from the weapon when you use an action, Bonus Action, or Reaction to fire it, regardless of the number of attacks you can normally make.` },
  { key: 'reach', name: 'Reach', kind: 'property', matchCase: true, text: `The weapon adds 5 feet to your reach when you attack with it, and when determining your reach for Opportunity Attacks with it.` },
  { key: 'thrown', name: 'Thrown', kind: 'property', matchCase: true, text: `You can throw the weapon to make a ranged attack (range in parentheses), drawing it as part of the attack. If it's a melee weapon, use the same ability for the attack and damage rolls that you'd use for a melee attack.` },
  { key: 'two-handed', name: 'Two-Handed', kind: 'property', matchCase: true, text: `The weapon requires two hands when you attack with it.` },
  { key: 'versatile', name: 'Versatile', kind: 'property', matchCase: true, text: `The weapon can be used with one or two hands. The damage value in parentheses applies when it's wielded with two hands.` },
]

// ---------------------------------------------------------------------------
// Skills (D&D 2024) — linked from the Abilities page and feature texts
// ---------------------------------------------------------------------------

const SKILL_TEXTS: Record<string, { ability: string; text: string }> = {
  Acrobatics: { ability: 'Dexterity', text: 'Stay on your feet in a tricky situation, or perform an acrobatic stunt.' },
  'Animal Handling': { ability: 'Wisdom', text: 'Calm or train an animal, or get an animal to behave in a certain way.' },
  Arcana: { ability: 'Intelligence', text: 'Recall lore about spells, magic items, and the planes of existence.' },
  Athletics: { ability: 'Strength', text: 'Jump farther than normal, stay afloat in rough water, or break something.' },
  Deception: { ability: 'Charisma', text: 'Tell a convincing lie, or wear a disguise convincingly.' },
  History: { ability: 'Intelligence', text: 'Recall lore about historical events, people, nations, and cultures.' },
  Insight: { ability: 'Wisdom', text: "Discern a person's mood and intentions." },
  Intimidation: { ability: 'Charisma', text: 'Awe or threaten someone into doing what you want.' },
  Investigation: { ability: 'Intelligence', text: 'Find obscure information in books, or deduce how something works.' },
  Medicine: { ability: 'Wisdom', text: 'Diagnose an illness, or determine what killed the recently slain.' },
  Nature: { ability: 'Intelligence', text: 'Recall lore about terrain, plants, animals, and weather.' },
  Perception: { ability: 'Wisdom', text: 'Using a combination of senses, notice something that is easy to miss.' },
  Performance: { ability: 'Charisma', text: 'Act, tell a story, perform music, or dance.' },
  Persuasion: { ability: 'Charisma', text: 'Honestly and graciously convince someone of something.' },
  Religion: { ability: 'Intelligence', text: 'Recall lore about gods, religious rituals, and holy symbols.' },
  'Sleight of Hand': { ability: 'Dexterity', text: "Pick a pocket, conceal a handheld object, or perform legerdemain." },
  Stealth: { ability: 'Dexterity', text: 'Escape notice by moving quietly and hiding behind things.' },
  Survival: { ability: 'Wisdom', text: 'Follow tracks, forage, find a trail, or avoid natural hazards.' },
}

export const SKILL_GLOSSARY: GlossaryEntry[] = Object.entries(SKILL_TEXTS).map(([name, s]) => ({
  key: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  kind: 'skill' as const,
  meta: `Skill · ${s.ability}`,
  matchCase: true,
  text: `${s.text}
A ${s.ability} check. If you are proficient, add your Proficiency Bonus; with Expertise, add it twice.`,
}))

export const GLOSSARY: GlossaryEntry[] = [
  ...CONDITION_GLOSSARY,
  ...TERM_GLOSSARY,
  ...ACTION_GLOSSARY,
  ...PROPERTY_GLOSSARY,
  ...SKILL_GLOSSARY,
]
