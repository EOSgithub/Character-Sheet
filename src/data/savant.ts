// The Savant class (homebrew by /u/laserllama, v5.2) — transcribed from
// "The Savant Class" and "The Savant: Expanded" PDFs in /reference.

export interface SavantLevelRow {
  level: number
  pb: number
  /** Intellect Die size (6 = d6); null before level 2 */
  intellectDie: number | null
  features: string[]
  reactions: number
}

export const SAVANT_TABLE: SavantLevelRow[] = [
  { level: 1, pb: 2, intellectDie: null, features: ['Adroit Analysis', 'Predictive Defense', 'Scholarly Pursuits'], reactions: 1 },
  { level: 2, pb: 2, intellectDie: 6, features: ['Genius Intellect', 'Sharp Mind'], reactions: 1 },
  { level: 3, pb: 2, intellectDie: 6, features: ['Academic Discipline'], reactions: 1 },
  { level: 4, pb: 2, intellectDie: 6, features: ['Ability Score Improvement'], reactions: 1 },
  { level: 5, pb: 3, intellectDie: 8, features: ['Peerless Insights', 'Swift Reflexes (2)'], reactions: 2 },
  { level: 6, pb: 3, intellectDie: 8, features: ['Discipline feature'], reactions: 2 },
  { level: 7, pb: 3, intellectDie: 8, features: ['Keen Awareness'], reactions: 2 },
  { level: 8, pb: 3, intellectDie: 8, features: ['Ability Score Improvement'], reactions: 2 },
  { level: 9, pb: 4, intellectDie: 8, features: ['Predictive Expert'], reactions: 2 },
  { level: 10, pb: 4, intellectDie: 8, features: ['Discipline feature'], reactions: 2 },
  { level: 11, pb: 4, intellectDie: 10, features: ['Unrivaled Genius'], reactions: 2 },
  { level: 12, pb: 4, intellectDie: 10, features: ['Ability Score Improvement'], reactions: 2 },
  { level: 13, pb: 5, intellectDie: 10, features: ['Swift Reflexes (3)'], reactions: 3 },
  { level: 14, pb: 5, intellectDie: 10, features: ['Unyielding Will'], reactions: 3 },
  { level: 15, pb: 5, intellectDie: 10, features: ['Discipline feature'], reactions: 3 },
  { level: 16, pb: 5, intellectDie: 10, features: ['Ability Score Improvement'], reactions: 3 },
  { level: 17, pb: 6, intellectDie: 12, features: ['Flawless Analysis'], reactions: 3 },
  { level: 18, pb: 6, intellectDie: 12, features: ['Swift Reflexes (4)'], reactions: 4 },
  { level: 19, pb: 6, intellectDie: 12, features: ['Ability Score Improvement'], reactions: 4 },
  { level: 20, pb: 6, intellectDie: 12, features: ['Incomparable Intellect'], reactions: 4 },
]

/** Levels at which a new Scholarly Pursuit is mastered. */
export const PURSUIT_LEVELS = [1, 4, 7, 13, 18]
/** Levels with an ASI (or feat). */
export const ASI_LEVELS = [4, 8, 12, 16, 19]
/** Levels granting an Academic Discipline feature. */
export const DISCIPLINE_FEATURE_LEVELS = [3, 6, 10, 15]

export const SAVANT_SKILL_LIST = [
  'arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'persuasion', 'religion',
]

export const SAVANT_BASICS = {
  hitDie: 8,
  saves: ['int', 'wis'] as const,
  armor: 'Light armor',
  weapons: "Simple weapons, rapiers, shortswords, whips",
  tools: "One set of artisan's tools of your choice",
  skillsText: 'Choose two from Arcana, History, Insight, Investigation, Medicine, Nature, Persuasion, or Religion',
  startingEquipment: [
    '(a) a simple weapon of your choice or (b) a shortsword',
    '(a) a light crossbow and 20 bolts or (b) two daggers',
    "a set of artisan's tools, leather armor, and a scholar's pack",
  ],
}

export interface EquipItem { name: string; qty?: number; equipped?: boolean; notes?: string }
/** An open pick an equipment option requires (e.g. "a simple weapon of your choice"). */
export interface EquipPick { kind: 'weapon'; category: 'simple' | 'any'; equipped?: boolean }
export interface EquipOption { key: string; label: string; items: EquipItem[]; pick?: EquipPick }
export interface EquipChoice { id: string; prompt: string; options: EquipOption[] }

/** Selectable starting-equipment choices for a 1st-level Savant. */
export const SAVANT_EQUIP_CHOICES: EquipChoice[] = [
  {
    id: 'weapon',
    prompt: 'Primary weapon',
    options: [
      { key: 'a', label: 'A simple weapon of your choice', items: [], pick: { kind: 'weapon', category: 'simple', equipped: true } },
      { key: 'b', label: 'A shortsword', items: [{ name: 'Shortsword', equipped: true }] },
    ],
  },
  {
    id: 'ranged',
    prompt: 'Ranged option',
    options: [
      { key: 'a', label: 'A light crossbow and 20 bolts', items: [{ name: 'Light Crossbow' }, { name: 'Bolts', qty: 20 }] },
      { key: 'b', label: 'Two daggers', items: [{ name: 'Dagger', qty: 2 }] },
    ],
  },
]

/** Always granted (armor + pack). Artisan's tools are a separate pick. */
export const SAVANT_EQUIP_FIXED: EquipItem[] = [
  { name: 'Leather Armor', equipped: true },
  { name: "Scholar's Pack" },
]

export interface FeatureDef {
  name: string
  level: number
  text: string
}

export const SAVANT_FEATURES: FeatureDef[] = [
  {
    name: 'Adroit Analysis',
    level: 1,
    text: `You can focus your mind to analyze your foe. You can use a bonus action to analyze one creature you can see within 60 feet, designating it as your Focus. While it is your Focus, you gain the following benefits against it:
• When you hit it with an attack, or if you observe it for 1 minute, you learn one of the following characteristics of your choice: its highest ability score, lowest ability score, Armor Class, speed, creature type, or one special sense.
• You can use your Intelligence, instead of your Strength or Dexterity, for weapon attack and damage rolls against it.
• Once per turn when you hit it with an attack, you deal 1d6 bonus damage. The bonus increases as you gain levels, to match the Intellect Die column of the Savant table.
• Any attacks it makes against you have disadvantage.
It remains your Focus until you choose to end this effect (no action required), it is hidden from you, you designate another creature as your Focus, or you are incapacitated. While you have a Focus, you cannot cast or concentrate on spells or use other features that require your concentration.`,
  },
  {
    name: 'Predictive Defense',
    level: 1,
    text: `Your analytical style of fighting allows you to better anticipate and dodge attacks. When you calculate your Armor Class in light or medium armor, or when you are unarmored, you can use Intelligence in place of Dexterity.`,
  },
  {
    name: 'Scholarly Pursuits',
    level: 1,
    text: `Never satisfied with your current state, you are always looking to expand your educational horizons. At 1st level, you master one Scholarly Pursuit. You master one additional Scholarly Pursuit of your choice when you reach 4th, 7th, 13th, and 18th level in this class.`,
  },
  {
    name: 'Genius Intellect',
    level: 2,
    text: `Your mind is capable of wondrous bursts of insight, fortitude, and inspiration. Your analytical abilities are represented by your Intellect Die, which begins as a d6 and increases in size at certain levels. You know three features that use your Intellect Die:
• Calculated Flourish. When a creature you can see targets you with a melee attack, you can use a reaction to add one roll of your Intellect Die to your Armor Class against that attack. If this Flourish causes the attack to miss, you can move up to 10 feet as part of the same reaction without provoking opportunity attacks.
• Potent Observation. When another creature that can hear you hits your Focus with an attack, you can use your reaction to grant it a bonus to its damage roll equal to one roll of your Intellect Die.
• Wondrous Insight. When another creature that can hear you makes an ability check using a skill or tool that you are proficient in, you can use your reaction to grant it a bonus to its roll equal to one roll of your Intellect Die. You can do so after it rolls the d20.
If one of your Intellect Die features requires a saving throw: Intellect save DC = 8 + your proficiency bonus + your Intelligence modifier.`,
  },
  {
    name: 'Sharp Mind',
    level: 2,
    text: `Your ability to analyze your surroundings is unrivaled. You can use a bonus action on your turn to take the Help or Search actions, or make an Intelligence ability check to recall information about a creature or object you can see.
Moreover, you can use the Help action to aid a creature in attacking your Focus, so long as you are within 5 feet of the attacker, even when you are not within 5 feet of the target.`,
  },
  {
    name: 'Academic Discipline',
    level: 3,
    text: `Choose an Academic Discipline to best represent your Savant's studies. Your Academic Discipline grants you features at 3rd level, and again when you reach 6th, 10th, and finally 15th level.`,
  },
  {
    name: 'Peerless Insights',
    level: 5,
    text: `Your mind and its capabilities are truly wondrous. If another creature that can hear you is forced to make a saving throw, you can use your reaction to grant it a bonus to its roll equal to one roll of your Intellect Die.
Moreover, whenever you make an Intelligence, Wisdom, or Charisma saving throw you can add one roll of your Intellect Die to your saving throw, so long as you are not incapacitated.`,
  },
  {
    name: 'Swift Reflexes',
    level: 5,
    text: `The speed at which you observe and react to your surroundings is incredible. You have a second reaction you can take each round, but only one reaction per trigger. You gain a third reaction at 13th level and a fourth at 18th level.`,
  },
  {
    name: 'Keen Awareness',
    level: 7,
    text: `You are always prepared for danger. So long as you aren't incapacitated you cannot be surprised, and you add your Intelligence modifier to your initiative rolls.
Also, when you roll initiative you can use Adroit Analysis to designate a creature you can see within range as your Focus.`,
  },
  {
    name: 'Predictive Expert',
    level: 9,
    text: `You are seemingly always one step ahead of your chosen foes. When your Focus forces you to make an ability check or saving throw, you have advantage on your roll.`,
  },
  {
    name: 'Unrivaled Genius',
    level: 11,
    text: `Your intellect has risen to near-supernatural heights. Your Genius Intellect features gain the following benefits:
• Calculated Flourish. If your reaction causes the attack to miss, you can make one melee attack against your attacker as part of your reaction.
• Potent Observation. You can use this reaction whenever another creature that can hear you attacks a creature that you can see. Moreover, if you use this reaction when another creature attacks your Focus, you can add two rolls of your Intellect Die to its damage roll.
• Wondrous Insight. When you use Wondrous Insight on another creature's ability check you roll your Intellect Die twice and use the higher roll.`,
  },
  {
    name: 'Unyielding Will',
    level: 14,
    text: `You gain proficiency in Charisma saving throws, and you have advantage on any saving throw you are forced to make to resist the charmed and frightened conditions.`,
  },
  {
    name: 'Flawless Analysis',
    level: 17,
    text: `You can use your action to flawlessly predict your Focus's next move and alert your allies. Until the start of your next turn, your Focus has disadvantage on every ability check, attack roll, and saving throw. Also, creatures of your choice that can hear you have advantage on any saving throw your Focus forces them to make until your next turn.
Once you use this feature you must finish a short or long rest before you can use it again.`,
  },
  {
    name: 'Incomparable Intellect',
    level: 20,
    text: `You realize your true potential. Your Intelligence score increases by 4, up to a maximum of 24. Also, if you roll an Intellect Die and roll lower than your Intelligence modifier, you can replace the roll with your Intelligence modifier.`,
  },
]

// ---------------------------------------------------------------------------
// Academic Disciplines
// ---------------------------------------------------------------------------

export interface DisciplineOptionDef {
  key: string
  name: string
  /** minimum Savant level to pick it */
  minLevel?: number
  text: string
}

export interface DisciplineDef {
  key: string
  name: string
  source: 'core' | 'expanded'
  blurb: string
  features: FeatureDef[]
  /** Skills auto-granted by the 3rd-level "Student of..." feature */
  grantedSkills: string[]
  /**
   * A Scholarly Pursuit auto-granted by a discipline feature, with the level it
   * arrives at and the alternatives offered if it is already mastered.
   */
  grantsPursuit?: { level: number; pursuit: string; alternatives: string[] }
  /** Pickable options (Runes / Recipes): choose `initial` at level 3, +1 at each of `moreAt`. */
  options?: {
    label: string
    initial: number
    moreAt: number[]
    list: DisciplineOptionDef[]
  }
}

export const DISCIPLINES: DisciplineDef[] = [
  {
    key: 'archaeologist',
    name: 'Archaeologist',
    source: 'core',
    blurb: 'Specializing in the study of forgotten civilizations, uncharted lands, and ancient places, Archaeologists bring the light of knowledge to the dark and deadly places of the world.',
    grantedSkills: ['history', 'investigation'],
    features: [
      {
        name: 'Student of History',
        level: 3,
        text: `You gain proficiency in History and Investigation. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Also, if you spend 1 minute examining an object you are touching, you can ascertain its value, origin, and age. If it has magic properties, you learn them as if you had cast identify.`,
      },
      {
        name: 'Adventuring Academic',
        level: 3,
        text: `Your time in ancient places has given you insights into arcane items and honed your instincts:
• You gain a climbing speed equal to your walking speed.
• When you make a saving throw related to a trap, you gain a bonus to your roll equal to one roll of your Intellect Die.
• You ignore all class, race, and alignment requirements for attunement and use of magic items, scrolls, and potions. Intelligence is your spellcasting ability for magic items.
• You can cast and concentrate on spells from magic items, scrolls, and potions while you are using Adroit Analysis.`,
      },
      {
        name: 'Daring Determination',
        level: 6,
        text: `You are well acquainted with danger. Whenever you make a Dexterity saving throw, or an ability check related to a trap, you add one roll of your Intellect Die to the result of your roll.
Also, if you use your action to use a magic item, potion, or scroll you can make one weapon attack as a bonus action.`,
      },
      {
        name: 'Lore Master',
        level: 10,
        text: `You constantly study every myth, legend, and folk tale you come across. If you observe a person, place, or object for at least 10 minutes, you mystically recall information about it as if it were the target of a legend lore spell. The target does not need to be of legendary importance; though if there is no relevant lore about the target you learn nothing.
Finally, when you use a magic item, you use your Intellect save DC for its effects unless the item's save DC was higher.`,
      },
      {
        name: 'Master Archaeologist',
        level: 15,
        text: `Your familiarity with ancient magic has given you insight into its workings. You gain resistance to all damage from spells.
Also, when you finish a short rest, you can touch one magic item that normally regains its charges at dawn, and it regains expended charges equal to your Intelligence modifier.`,
      },
    ],
  },
  {
    key: 'investigator',
    name: 'Investigator',
    source: 'core',
    blurb: 'Masters at unraveling mysteries, conspiracies, and secrets of all kinds, Investigators possess an uncanny ability to read the intent of others.',
    grantedSkills: ['insight', 'investigation'],
    grantsPursuit: { level: 6, pursuit: 'secrets-whispers', alternatives: ['perfect-recall', 'traditions'] },
    features: [
      {
        name: 'Student of Truth',
        level: 3,
        text: `You gain proficiency in Insight and Investigation. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Your intuitive nature grants you the following benefits:
• Whenever you make an Insight or Perception check you can choose to use your Intelligence in place of Wisdom.
• When you take the Search action, you gain information as if you spent a full minute searching instead of one action.`,
      },
      {
        name: 'Rough & Tumble',
        level: 3,
        text: `You have gained some unsavory skills while fighting shadows in the underbelly of civilization. You learn to speak, read, and decode Thieves' Cant, the language of the criminal world.
Also, your unarmed strikes deal bludgeoning damage equal to a roll of your Intellect Die + your Strength modifier on hit.
When you hit your Focus with a melee attack on your turn, you can force it to make a Dexterity saving throw against your Intellect save DC. On a failure, it is either blinded, deafened, or it cannot speak until the start of your next turn, or if the target is Large or smaller, you can choose to knock it prone.`,
      },
      {
        name: 'Devious Flourish',
        level: 6,
        text: `Your intuition grants you a heightened sense for openings in your foe's defenses. When you use Calculated Flourish and cause the attack to miss, you can force the attacker to make a Dexterity saving throw against Rough & Tumble as part of the same reaction, instead of moving.
Also, whenever your Focus fails the saving throw against Rough & Tumble, you can choose for it to take bludgeoning damage equal to one roll of your Intellect Die.
Finally, whenever you take the Attack action on your turn, you can make one unarmed strike attack as a bonus action.`,
      },
      {
        name: 'Illicit Contacts',
        level: 6,
        text: `You have become familiar with the criminal elements of society. You have advantage on Charisma checks while you are communicating with another creature in Thieves' Cant.
You also master the Secrets & Whispers Scholarly Pursuit. If you have already mastered this Scholarly Pursuit you can instead master your choice of Perfect Recall or Traditions.`,
      },
      {
        name: 'Piercing Gaze',
        level: 10,
        text: `Your gaze sees through the most intricate deceptions and conspiracies. You instantly detect the presence of illusions and shapeshifters, and you are instantly aware if your Focus is lying to you.
Also, if your Focus fails its saving throw against Rough & Tumble, you can cause it to be stunned for the duration in place of the normal effects.`,
      },
      {
        name: 'Master Investigator',
        level: 15,
        text: `Your sense for truth has reached near-supernatural levels. You gain Truesight out to a 30-foot radius.
Also, when you hit your Focus with an attack, or use Potent Observation against your Focus, you can cause the attack to become a critical hit. You can only do so once between each short or long rest.`,
      },
    ],
  },
  {
    key: 'naturalist',
    name: 'Naturalist',
    source: 'core',
    blurb: "The Naturalist's classroom begins at the edge of civilization. They are scholars of the wilderness: experts at predicting weather, identifying toxic and medicinal plants, caring for animals, and guiding others safely through the wild.",
    grantedSkills: ['nature', 'survival'],
    grantsPursuit: { level: 6, pursuit: 'physical-fitness', alternatives: ['falconry', 'perfect-recall'] },
    features: [
      {
        name: 'Student of Nature',
        level: 3,
        text: `You gain proficiency in both Nature and Survival. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Also, whenever you make an Animal Handling or Survival check you can use your Intelligence in place of Wisdom.`,
      },
      {
        name: "Naturalist's Journal",
        level: 3,
        text: `You compile your research on fantastical flora and fauna in a Naturalist's Journal. Over the course of 1 hour, which can be during a short or long rest, you can take notes in your Journal, detailing your current environment or a specific beast, plant, or monstrosity that was your Focus within the last 24 hours. If your Journal is lost, you can spend 1 hour adding each old entry to a new Journal from memory.
You have advantage on all Intelligence checks related to all environments and creatures detailed in your Journal.
Finally, once per turn when you make an attack roll against a creature that is detailed in your Journal, you gain a bonus to your attack roll equal to one roll of your Intellect Die.`,
      },
      {
        name: 'Survivalist',
        level: 6,
        text: `You are a master tracker of wild creatures and any that would threaten them. You can designate a creature as the Focus of your Adroit Analysis by analyzing signs of its passing, such as tracks or marks, even if you can't see the creature. Creatures also remain your Focus even if they become hidden from you.
You also master the Physical Fitness Scholarly Pursuit. If you have already mastered this Scholarly Pursuit, you instead master your choice of either Falconry or Perfect Recall.`,
      },
      {
        name: 'Wilderness Guide',
        level: 6,
        text: `Your knowledge allows you and your companions to thrive in the wild places of the world. If you are in an environment that is detailed in your Journal, you and up to ten other creatures that travel with you gain the following benefits:
• You can ignore the effects of nonmagical difficult terrain.
• You cannot become lost, except by magical means.
• You can move stealthily while traveling at a normal pace.`,
      },
      {
        name: 'Advanced Studies',
        level: 10,
        text: `Your knowledge of the wild does not stop with the mundane. You can add specific dragons, giants, oozes, and undead to your Naturalist's Journal.
• Creatures. You treat the specific creatures in your Journal as if they were your Focus, even if they are not currently designated as the Focus of your Adroit Analysis.
• Environments. You, and up to ten other creatures traveling with you, can ignore the effects of magical difficult terrain and have advantage on saving throws to resist the hostile effects of any environments detailed in your Journal.`,
      },
      {
        name: 'Call of the Wild',
        level: 10,
        text: `As an action on your turn, you can force one beast, plant, or monstrosity within 30 feet to make a Wisdom saving throw against your Intellect save DC, so long as it can hear you. On a failure, it is charmed by you for 1 hour. Creatures with an Intelligence score equal to half your Savant level or higher automatically succeed.
While charmed, it is friendly to you and your allies. As a bonus action, you can issue a verbal command to the creature, which it does its best to obey. If the creature takes damage, it repeats its saving throw at the beginning of its next turn; you can use a reaction to shout at it and subtract one roll of your Intellect Die from its roll.
Once a creature succeeds on its saving throw it is immune for 24 hours. You can only have one creature charmed this way. Once you successfully charm a creature you must complete a short or long rest before using this feature again.`,
      },
      {
        name: 'Master Naturalist',
        level: 15,
        text: `Your knowledge of the natural world surpasses that of nearly all other scholars. You can add specific creatures of any type, except constructs and humanoids, to your Journal.
Also, the duration of Call of the Wild increases to 8 hours, and creatures detailed in your Journal have disadvantage on their initial save to resist Call of the Wild.
Finally, you have advantage on attack rolls against any creatures detailed in your Journal.`,
      },
    ],
  },
  {
    key: 'physician',
    name: 'Physician',
    source: 'core',
    blurb: 'Physicians use their considerable intellect to heal the sick and tend to the wounded, keeping their allies in top condition and crippling foes with their knowledge of anatomy.',
    grantedSkills: ['medicine', 'sleight-of-hand'],
    features: [
      {
        name: 'Student of Medicine',
        level: 3,
        text: `You gain proficiency in Medicine and Sleight of Hand. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you instead gain proficiency in another skill from the Savant list.
Moreover, your medical training and insight into anatomy grants you:
• Whenever you would make a Wisdom (Medicine) check, you can make an Intelligence (Medicine) check instead.
• If you spend 1 minute examining your Focus, you can identify any disease, poison, or curse affecting it.
• Once per turn, if you hit your Focus with a weapon attack, you can reduce its speed by a number of feet equal to 5 times your Intelligence modifier (minimum of 5 feet) until the beginning of your next turn.`,
      },
      {
        name: 'Combat Medic',
        level: 3,
        text: `You have trained to administer medical aid, even in the midst of battle. When you finish a short or long rest, you can touch one Healer's Kit and cause it to regain a number of uses equal to your Intelligence modifier (minimum of 1).
You know the Combat Medic abilities below, each of which takes an action. Whenever you use one, you can expend one use from a Healer's Kit you are holding to use the maximum Intellect Die result, instead of rolling.
• Adrenaline Jolt. You touch another creature that is blinded, charmed, deafened, frightened, poisoned, or suffering from a disease; it instantly repeats a saving throw to end that condition with a bonus equal to one roll of your Intellect Die.
• Dress Wounds. You touch another creature and it gains temporary hit points equal to one roll of your Intellect Die. No effect on a creature at its hit point maximum; a creature can't benefit again until those temporary hit points are gone.
• Healing Surge. You touch another living creature and it can expend one of its Hit Dice to regain hit points equal to its Hit Die roll + its Constitution modifier + one roll of your Intellect Die. Used on a living creature at 0 hit points, it is instantly stabilized even if it does not expend a Hit Die.`,
      },
      {
        name: 'Field Doctor',
        level: 6,
        text: `You have learned to move about the field of battle unscathed to better administer aid. You can take the Dash or Disengage action as a bonus action on each of your turns.
Also, whenever you use your action to use a Combat Medic ability, you can make one weapon attack as a bonus action.`,
      },
      {
        name: 'Medicinal Expertise',
        level: 10,
        text: `Your techniques push allies to their physical limit. When you use a Combat Medic ability you can empower it as described below. You can use an empowered ability on each individual creature once with no negative effects; each subsequent time before it finishes a long rest, it gains 1 level of exhaustion.
• Restorative Jolt. Adrenaline Jolt can automatically end one of: blinded, charmed, deafened, frightened, paralyzed, petrified, poisoned, stunned, an ability score reduction, or a reduction to hit point maximum.
• Resuscitating Surge. Healing Surge can return a creature that died within the past minute back to life, so long as it expends one Hit Die. No effect on creatures dead of old age; cannot restore missing body parts.
• Suture Wounds. If you use Dress Wounds on a living creature for 10 minutes without interruption, you can reattach severed limbs or digits, and it gains temporary hit points equal to the difference between its current and maximum hit points (instantly dispelled if the creature regains any hit points).`,
      },
      {
        name: 'Master Physician',
        level: 15,
        text: `You can perform legendary feats of medicine. You can use two empowered Combat Medic abilities on each individual creature between each long rest with no negative effects.
Also, if you roll an Intellect Die as part of a Combat Medic ability, you add your Intelligence modifier to your total roll.`,
      },
    ],
  },
  {
    key: 'tactician',
    name: 'Tactician',
    source: 'core',
    blurb: 'All successful monarchs, conquerors, and revolutions have a master Tactician responsible for their success — always one step ahead, with a plan for every eventuality.',
    grantedSkills: ['history', 'persuasion'],
    features: [
      {
        name: 'Student of War',
        level: 3,
        text: `You gain proficiency in History and Persuasion. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Your study of warfare also grants you:
• Proficiency in two gaming sets of your choice; whenever you make an ability check that uses any gaming set, you add one roll of your Intellect Die to the roll.
• Proficiency in medium armor, shields, and all martial weapons that do not have the heavy property.`,
      },
      {
        name: 'Tactical Commander',
        level: 3,
        text: `You can use your knowledge of tactics to direct your allies on the battlefield. You learn the following Orders, each issued in place of an attack when you take the Attack action, targeting another creature that can see or hear you within 30 feet:
• Attack Order. The next time that creature takes the Attack action before the start of your next turn, it can make one additional weapon attack as part of its Attack action.
• Defensive Order. That creature gains the benefits of the Dodge action until the beginning of its next turn.
• Maneuvering Order. That creature can use its reaction to move up to its speed without provoking opportunity attacks.
• Support Order. That creature can immediately take the Help, Hide, Search, Study, or Use an Object action.`,
      },
      {
        name: 'Strategic Superiority',
        level: 6,
        text: `You can attack twice, instead of once, whenever you take the Attack action on your turn. Moreover, you can take the Dash, Disengage, or Help action in place of one of these attacks.`,
      },
      {
        name: 'Tactical Genius',
        level: 10,
        text: `Your genius allows you to control the flow of each battle from the outset. When you roll initiative, you can issue an Order to one creature before any other creatures have a chance to act.
Also, when another creature that can hear you makes an attack against your Focus, you can use Potent Observation to add a roll of your Intellect Die to its attack roll. You can do so after it rolls, but before you know if its attack hits.`,
      },
      {
        name: 'Master Tactician',
        level: 15,
        text: `Your words inspire heroism in your allies. Whenever you issue an Order to a creature you can grant it temporary hit points equal to your Intelligence modifier (minimum of 1).`,
      },
    ],
  },
  // --- Expanded disciplines ---
  {
    key: 'culinarian',
    name: 'Culinarian',
    source: 'expanded',
    blurb: 'Culinarians put their great intellects to work in the science of food and drink, venturing into the world in a lifelong search for new wondrous and exotic ingredients.',
    grantedSkills: ['nature'],
    options: {
      label: 'Recipes',
      initial: 2,
      moreAt: [],
      list: [
        { key: 'invigorating', name: 'Invigorating Morsel', text: 'Sample: any Beast without a flying or swimming speed. The creature that eats this Morsel regains hit points equal to one roll of your Intellect Die + your Intelligence modifier.' },
        { key: 'limbering', name: 'Limbering Morsel', text: 'Sample: any Beast with a flying speed. For 1 hour, the creature gains a bonus to its initiative rolls equal to your Intelligence modifier (minimum of +1), and its walking speed increases by 10 feet.' },
        { key: 'monstrous', name: 'Monstrous Morsel', text: 'Sample: any Monstrosity of CR 1 or higher. For 1 hour, the creature gains the "Change Appearance" or "Natural Weapons" benefit from the alter self spell.' },
        { key: 'subterranean', name: 'Subterranean Morsel', text: 'Sample: any Beast with a burrowing speed. For 1 hour, the creature gains darkvision out to 60 feet. If it already has darkvision, its radius grows by 30 feet.' },
        { key: 'thalassic', name: 'Thalassic Morsel', text: 'Sample: any Beast with a swimming speed. For 1 hour, the creature gains a swimming speed equal to its walking speed, and it can hold its breath for up to 10 minutes.' },
        { key: 'verdant', name: 'Verdant Morsel', text: 'Sample: any Plant of CR 1 or higher. The creature is instantly cured of: blinded, deafened, paralyzed, petrified, poisoned, a reduction to an ability score, or a reduction to its hit point maximum.' },
        { key: 'draconic', name: 'Draconic Morsel', minLevel: 6, text: "Sample: any Dragon of CR 1 or higher. For 1 hour, the creature gains resistance to the damage type dealt by the Sample dragon's breath weapon attack." },
        { key: 'psionic', name: 'Psionic Morsel', minLevel: 6, text: 'Sample: any Aberration of CR 1 or higher. For 1 hour, the creature can communicate telepathically with any creature within 30 feet.' },
        { key: 'titanic', name: 'Titanic Morsel', minLevel: 6, text: 'Sample: any Giant of CR 1 or higher. For 1 hour, the creature grows to the size of the Sample giant (concentration), and gains a bonus to Strength checks and saves equal to your Intelligence modifier.' },
        { key: 'viscous', name: 'Viscous Morsel', minLevel: 6, text: 'Sample: any Ooze of CR 1 or higher. For 1 hour, when the creature takes acid, lightning, poison, or slashing damage, it can reduce the damage by your Intelligence modifier (minimum of 1).' },
        { key: 'aerial', name: 'Aerial Morsel', minLevel: 10, text: 'Sample: any Air Elemental of CR 1 or higher. For 1 hour, the creature can take the Dash action as a bonus action on each turn, and it can hold its breath indefinitely.' },
        { key: 'aqueous', name: 'Aqueous Morsel', minLevel: 10, text: 'Sample: any Water Elemental of CR 1 or higher. For 1 hour, the creature can breathe air and water, gains a swimming speed equal to its walking speed, and can use its reaction to turn a critical hit into a normal hit.' },
        { key: 'ignan', name: 'Ignan Morsel', minLevel: 10, text: 'Sample: any Fire Elemental of CR 1 or higher. For 1 hour, the creature gains resistance to fire damage, and immunity to the charmed and frightened conditions.' },
        { key: 'terran', name: 'Terran Morsel', minLevel: 10, text: 'Sample: any Earth Elemental of CR 1 or higher. For 1 hour, the creature gains tremorsense out to 15 feet, and resistance to nonmagical bludgeoning, piercing, and slashing damage.' },
        { key: 'celestial', name: 'Celestial Morsel', minLevel: 15, text: 'Sample: any Celestial of CR 1 or higher. For 1 hour, the creature manifests ethereal angelic wings granting a flying speed equal to its walking speed.' },
        { key: 'infernal', name: 'Infernal Morsel', minLevel: 15, text: 'Sample: any Fiend of CR 1 or higher. For 1 hour, the creature has advantage on any saving throw to resist a spell or other magical effect.' },
        { key: 'sylvan', name: 'Sylvan Morsel', minLevel: 15, text: 'Sample: any Fey of CR 1 or higher. For 1 hour, the creature can use a bonus action on each turn to teleport up to 30 feet to an unoccupied space it can see.' },
      ],
    },
    features: [
      {
        name: 'Student of Flavor',
        level: 3,
        text: `You gain proficiency in Nature and cook's utensils. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in Nature you gain proficiency in another skill from the Savant skill list in its place.
In addition, so long as you have access to cook's utensils and edible ingredients, any creature that expends a Hit Die to regain hit points during a short rest with you also regains additional hit points equal to one roll of your Intellect Die.`,
      },
      {
        name: "Culinarian's Cook Book",
        level: 3,
        text: `You are compiling a Cook Book of the exotic Recipes you discover during your adventures.
• Recipes Known. You know two Recipes of your choice from the Recipe list.
• Adding a Recipe. As an action, you can harvest a Sample from a creature that died within the last minute. Before the end of your next long rest, you can spend 1 hour using cook's utensils and the Sample to add the corresponding Recipe to your Cook Book.
• Preparing a Morsel. At the end of each short or long rest, you prepare a number of Morsels equal to your Intelligence modifier, each with the properties of one Recipe from your Cook Book. Morsels lose potency at the end of the next short or long rest.
• Serving Morsels. As an action, any creature can eat a Morsel, or feed it to a willing creature within its reach. A creature can only benefit from one Morsel at a time.
• Replacing a Cook Book. If lost or destroyed, you can spend 1 hour rewriting your old Recipes from memory.`,
      },
      {
        name: 'Cut Above',
        level: 6,
        text: `As an action, you can touch one of your Morsels with cook's utensils and change it to a Morsel of another Recipe.
Also, when you use your action to eat or feed a Morsel to a creature, you can make one weapon attack as a bonus action.`,
      },
      {
        name: 'Improved Recipes',
        level: 10,
        text: `Your Recipes invigorate your allies along with their normal benefits. A creature that eats one of your Morsels also gains temporary hit points equal to your Savant level.`,
      },
      {
        name: 'Master Culinarian',
        level: 15,
        text: `You are a master monster chef and can cook with anything, anywhere. Over the course of 1 hour, which can be during a short or long rest, you can prepare a monstrous feast that can feed yourself and a number of other creatures equal to your Savant level.
If a creature spends 10 minutes eating its meal, it is instantly cured of any poisons, diseases, or any other hostile condition, and for 24 hours it is immune to the frightened and poisoned conditions and adds one roll of your Intellect Die to any Wisdom or Constitution ability check or saving throw.`,
      },
    ],
  },
  {
    key: 'mentor',
    name: 'Mentor',
    source: 'expanded',
    blurb: 'Mentors use their intellect in the service of others, ready to gently guide those around them and pass their knowledge on to the next generation.',
    grantedSkills: ['history', 'insight'],
    grantsPursuit: { level: 3, pursuit: 'instruction', alternatives: ['perfect-recall', 'quick-study'] },
    features: [
      {
        name: 'Student of Life',
        level: 3,
        text: `You gain proficiency in both History and Insight. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Your knowledge of life also grants you:
• You master the Instruction Scholarly Pursuit. If you have already mastered it, you can instead master your choice of Perfect Recall or Quick Study.
• Whenever you use Instruction you can teach the chosen language, skill, tool, or weapon to a number of creatures equal to your Intelligence modifier, instead of just one.
• When you use Potent Observation or Wondrous Insight and you roll a 1, you can re-roll your Intellect Die. You must use the new roll.`,
      },
      {
        name: 'Astute Advice',
        level: 3,
        text: `You know just what to say to help your allies learn from their failures. Whenever another creature that can hear you within 30 feet misses with an attack roll, or fails an ability check or saving throw, you can use a reaction to have it re-roll the d20, adding one roll of your Intellect Die to the result.
You can use this reaction a number of times equal to your Intelligence modifier (minimum of once), regaining all uses when you finish a long rest.`,
      },
      {
        name: 'Adept Assistance',
        level: 6,
        text: `You can target two creatures, instead of just one, whenever you use an action on your turn to take the Help action.`,
      },
      {
        name: 'Soothing Presence',
        level: 6,
        text: `Your calming presence allows others to truly relax. Creatures that complete a short rest with you have advantage on any Hit Die rolls they make to regain their hit points. They also gain a number of temporary hit points equal to your Savant level.`,
      },
      {
        name: 'Mystical Intuition',
        level: 10,
        text: `Your life experience and extraordinary intuition can give you mystical insights. You can spend 1 minute meditating on a question; at the end, you mystically intuit the answer as if you had cast the commune spell — but you can only intuit an answer that is known to another mortal being. Once used, you must finish a long rest before doing so again.
Finally, you regain all expended uses of Astute Advice whenever you complete a short or long rest.`,
      },
      {
        name: 'Master Mentor',
        level: 15,
        text: `Your advice is legendary. Creatures of your choice within 15 feet of you gain a bonus to all ability checks and saving throws equal to your Intelligence modifier (minimum of +1), so long as they can hear you.
Moreover, whenever you target an allied creature with the Help action or Astute Advice, you can grant it temporary hit points equal to your Intelligence modifier (minimum of 1).
Lastly, you regain the use of Mystical Intuition whenever you complete a short or long rest.`,
      },
    ],
  },
  {
    key: 'orator',
    name: 'Orator',
    source: 'expanded',
    blurb: 'Orators are true masters of linguistics and the spoken word, emboldening their allies and winning over their enemies with nothing but reasonable logic and convincing rhetoric.',
    grantedSkills: ['deception', 'persuasion'],
    features: [
      {
        name: 'Student of Logic',
        level: 3,
        text: `You gain proficiency in both Deception and Persuasion, and whenever you make a check with either proficiency you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Your mastery over words grants you:
• Whenever you make a Deception or Persuasion check you can use your Intelligence in place of Charisma.
• You master your choice of the Instruction, Riddles, or Traditions Scholarly Pursuit, even if you do not meet the normal level prerequisite.
• You learn to speak, read, and write a number of extra languages equal to your Intelligence modifier.`,
      },
      {
        name: 'Rhetorical Superiority',
        level: 3,
        text: `Your mastery of language allows you to inspire, dominate, and charm with words. These abilities use your Intellect save DC and affect creatures that can both hear and understand you:
• Convincing Conversation. If you spend at least 1 minute talking with a creature that is not hostile toward you, you can force it to unknowingly make a Wisdom saving throw. On a failure, it is charmed by you for 1 hour, or until you or your allies harm it or its allies. Only one creature at a time.
• Cutting Retort. When a creature you can see within 30 feet makes an attack, you can use your reaction to distract it: it must succeed on a Wisdom saving throw or subtract one roll of your Intellect Die from the attack roll. On a success it is immune for 24 hours.
• Invigorating Word. When a creature you can see within 30 feet takes damage from a hostile creature, you can use your reaction to grant it temporary hit points equal to one roll of your Intellect Die (it must have at least 1 hit point remaining).
• Uplifting Remark. When another creature you can see within 30 feet makes an Intelligence, Wisdom, or Charisma saving throw, you can use a reaction to add one roll of your Intellect Die to its roll.`,
      },
      {
        name: 'Iron Logic',
        level: 6,
        text: `Your masterful grasp of logic allows you to resist all but the strongest mind-altering effects. You have advantage on any saving throw to resist enchantment spells, and you are immune to the charmed condition.
Also, whenever you use Uplifting Remark, the creature can roll the Intellect Die twice and use the higher result.`,
      },
      {
        name: 'Peerless Rhetoric',
        level: 10,
        text: `You can bend the masses to your will with your words. If you speak to a group of creatures who can hear and understand you for 1 minute, you can choose to inspire or persuade a number of creatures equal to your Savant level. Once you do so, you must finish a short or long rest before using this on a crowd again.
• Inspire. Creatures gain temporary hit points equal to your Savant level; while those remain, they have advantage on saves against enchantment spells and are immune to being frightened.
• Persuade. Creatures must succeed on a Wisdom saving throw against your Intellect save DC or be charmed by you for up to 24 hours as if by the mass suggestion spell.`,
      },
      {
        name: 'Master Orator',
        level: 15,
        text: `Your absolute mastery over the spoken word allows you to bend all but the strongest creatures to your will. When you force a creature to make a saving throw to resist one of your Rhetorical Superiority abilities or Peerless Rhetoric, it has disadvantage on the roll if both its Intelligence and Wisdom scores are lower than your Intelligence score.`,
      },
    ],
  },
  {
    key: 'philosopher',
    name: 'Philosopher',
    source: 'expanded',
    blurb: 'Philosophers expend their genius pondering the deep questions of existence, trying to perfect mortal knowledge of the true nature of reality.',
    grantedSkills: ['arcana', 'religion'],
    features: [
      {
        name: 'Student of Thought',
        level: 3,
        text: `You gain proficiency in both Arcana and Religion. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Your grasp of reality also grants you:
• Whenever you make an ability check to communicate with a creature that is not native to the material plane you gain a bonus to your roll equal to one roll of your Intellect Die.
• You can also learn the following characteristics about your Focus with Adroit Analysis: its alignment, its native plane of existence, or its spellcasting ability (if any) and the level of the highest spell it can cast.
• You learn to speak, read, and write either Celestial, Infernal, Primordial, or Sylvan.`,
      },
      {
        name: 'Words of Power',
        level: 3,
        text: `You have learned to speak Words of Power used in shaping the multiverse. If your Focus is within 30 feet and can hear you, you can speak one Word of Power at it, forcing a saving throw against your Intellect save DC:
• Power Word: Confound. Whenever your Focus makes an ability check or attack roll, you can use your reaction to force an Intelligence saving throw. On a failure, it takes psychic damage equal to one roll of your Intellect Die and suffers disadvantage on the triggering roll.
• Power Word: Disorient. As an action, Wisdom saving throw. On a failure, psychic damage equal to one roll of your Intellect Die and disadvantage on the first saving throw it makes before your next turn.
• Power Word: Dread. As an action, Wisdom saving throw. On a failure, psychic damage equal to one roll of your Intellect Die and it is frightened of a creature of your choice it can see until the beginning of your next turn.
• Power Word: Halt. When your Focus attempts to move, you can use a reaction to force a Strength saving throw. On a failure, psychic damage equal to one roll of your Intellect Die and its speed is reduced to zero until the beginning of your next turn.`,
      },
      {
        name: 'Unwavering Focus',
        level: 6,
        text: `Your resolute sense of purpose bolsters your Words of Power. You can speak your Words of Power at any creature that can hear you within 30 feet, instead of just your current Focus.
Moreover, if you speak a Word of Power at your Focus, it takes additional psychic damage equal to one roll of your Intellect Die on a failed save, and half as much on a successful save.`,
      },
      {
        name: 'Supreme Understanding',
        level: 10,
        text: `You learn the Words of Power below; you can speak each of them once between each short or long rest.
• Power Word: Enfeeble. As an action, Intelligence saving throw. On a failure, your Focus is stunned for 1 minute. It can repeat the save at the end of each of its turns; on a failure it takes psychic damage equal to two rolls of your Intellect Die.
• Power Word: Shunt. As an action, Charisma saving throw. On a failure, your Focus is shunted from the current plane for up to 1 minute (to a harmless demiplane if native to the current plane, otherwise to its native plane). It can repeat the save at the end of each of its turns; on a failure it takes psychic damage equal to two rolls of your Intellect Die.`,
      },
      {
        name: 'Master Philosopher',
        level: 15,
        text: `Your willpower rivals that of powerful extraplanar beings. You are always under the effect of protection from evil and good.
Also, whenever a creature takes psychic damage from one of your Words of Power, it takes additional psychic damage equal to your Intelligence modifier (minimum of +1).`,
      },
    ],
  },
  {
    key: 'rune-scribe',
    name: 'Rune Scribe',
    source: 'expanded',
    blurb: 'Savants that dedicate their lives to the study of ancient sigils that embody the magic of creation. The secrets of rune magic are jealously guarded by those who master it.',
    grantedSkills: ['arcana'],
    options: {
      label: 'Runes',
      initial: 2,
      moreAt: [6, 10, 15, 18],
      list: [
        { key: 'enchantment', name: 'Rune of Enchantment', text: 'Item: a bracelet, diadem, necklace, or ring. Creatures treat the bearer one stage friendlier than normal (ends if the bearer attacks). Invoke: as an action, cast calm emotions, charm person, or command, targeting creatures equal to the Rune Scribe\'s Intelligence modifier.' },
        { key: 'evocation', name: 'Rune of Evocation', text: 'Item: a simple or martial melee weapon. Imbued with acid, cold, fire, poison, or lightning: on hit, the weapon deals additional damage of that type equal to one roll of your Intellect Die. Invoke: on hit, deal additional damage equal to three rolls of the Intellect Die.' },
        { key: 'illusion', name: 'Rune of Illusion', text: 'Item: a cloak, robe, or suit of armor. As an action, the bearer can change its appearance to a creature it has seen (same limb arrangement; detected by Investigation vs your Intellect save DC). Invoke: as an action, turn invisible for 10 minutes (ends on attack or forcing a save).' },
        { key: 'necromancy', name: 'Rune of Necromancy', text: 'Item: a belt, ring, or suit of armor. The bearer can use a bonus action to gain temporary hit points equal to the Rune Scribe\'s Intelligence modifier. Invoke: when reduced to 0 hit points but not killed outright, fall to 1 hit point instead.' },
        { key: 'abjuration', name: 'Rune of Abjuration', minLevel: 6, text: 'Item: a cloak, robe, shield, or suit of armor. Once per turn, reduce damage from a spell or magical effect by the Rune Scribe\'s Intelligence modifier. Invoke: when a creature within 30 feet casts a spell, reaction to force a Constitution saving throw; on a failure the spell fails.' },
        { key: 'conjuration', name: 'Rune of Conjuration', minLevel: 6, text: 'Item: a belt, cloak, ring, or suit of armor. As an action, expend movement to teleport that distance to an unoccupied space you can see. Invoke: as an action, force two creatures within 60 feet to make a Charisma saving throw (can choose to fail); if both fail, they switch places.' },
        { key: 'divination', name: 'Rune of Divination', minLevel: 10, text: 'Item: a wand, staff, robe, or spellcasting focus. Use as a focus to cast comprehend languages, detect magic, and identify as rituals without material components. Invoke: as an action, gain truesight, see hidden doors/traps, and see into the Ethereal Plane out to 120 feet for 1 hour.' },
        { key: 'transmutation', name: 'Rune of Transmutation', minLevel: 10, text: 'Item: a bracelet, diadem, ring, or necklace. Gain a 30-ft swimming speed, 30-ft climbing speed, or +10 ft walking speed (switch as a bonus action). Invoke: as an action, transform into a beast of CR up to the Rune Scribe\'s Savant level (as polymorph, but no concentration).' },
      ],
    },
    features: [
      {
        name: 'Student of Rune Magic',
        level: 3,
        text: `You gain proficiency with Arcana and calligrapher's supplies. Whenever you make a check with either proficiency you gain a bonus to the roll equal to one roll of your Intellect Die. If you are already proficient in Arcana you gain proficiency in another skill from the Savant skill list in its place.
You also learn to speak, read, and write two of the following Runic Languages: Draconic, Druidic, Dwarvish, Giant, or Primordial.`,
      },
      {
        name: 'Rune Carving',
        level: 3,
        text: `You have learned the artful and ancient magic of Runes.
• Runes Known. You learn two Runes of your choice; one additional Rune at 6th, 10th, 15th, and 18th level. Whenever you gain a level in this class, you can replace one Rune you know with another.
• Inscribing a Rune. Over 1 hour, you can use calligrapher's supplies to inscribe a Rune you know into a weapon, suit of armor, or an object that can be worn or held. A creature that wears or wields the Runic object gains its benefits. Each Rune can only be inscribed in one object at a time.
• Invoking Runes. If the bearer speaks the language the Rune is inscribed in, it can Invoke the Rune for its greater effect. Once Invoked, a Rune cannot be Invoked again until you finish a long rest.
• Runic Casting. You can cast and concentrate on spells from your Runes even while you have a Focus. Saves use your Intellect save DC; Runic attack modifier = your proficiency bonus + your Intelligence modifier.`,
      },
      {
        name: 'Elder Magicks',
        level: 6,
        text: `The power imbued within your Runes has grown. Your Runic objects count as magical for as long as the Rune is inscribed.
Also, during a short rest, you can perform a 10-minute ritual to reawaken the magic of a Rune that has already been Invoked, letting it be Invoked one additional time before the end of your next long rest.`,
      },
      {
        name: 'Runic Ward',
        level: 10,
        text: `Your Runes offer a measure of protection to those that bear them. If a creature bearing at least one of your Runic objects is forced to make a saving throw to resist a spell or another magical effect, it gains a bonus to the roll equal to your Intelligence modifier (minimum of +1).
Moreover, each time you finish a long rest, you can replace one Rune you know with another Rune of your choice.`,
      },
      {
        name: 'Master Rune Scribe',
        level: 15,
        text: `You can draw on the magic of your Runes to protect yourself in times of great need. When you are reduced to 0 hit points but not killed outright, you can draw on the power of a Runic object within 60 feet of you, instantly dispelling the Rune and any of its effects, and you fall to 1 hit point instead of 0.`,
      },
    ],
  },
  {
    key: 'virtuoso',
    name: 'Virtuoso',
    source: 'expanded',
    blurb: 'Bending their impressive intellect toward the study of music, Virtuosos manipulate the emotions of their listeners with impressively complex themes and compositions.',
    grantedSkills: ['insight', 'performance'],
    features: [
      {
        name: 'Student of Music',
        level: 3,
        text: `You gain proficiency in Insight and Performance. Whenever you make a check with either of these proficiencies you gain a bonus to your roll equal to one roll of your Intellect Die. If you are already proficient in either skill you gain proficiency in another skill from the Savant skill list in its place.
Your intuitive understanding of music also grants you:
• Whenever you would make a Performance check you can use your Intelligence in place of your Charisma.
• You gain proficiency with three musical instruments.
• If you spend 1 hour practicing with a musical instrument, you are considered proficient with it (one instrument at a time).
• Whenever you make an ability check that incorporates a musical instrument you are proficient with, you can treat a roll of 9 or lower on the d20 as a 10.`,
      },
      {
        name: 'Wondrous Theme',
        level: 3,
        text: `You have composed powerful Themes that stir the hearts of any creature that can hear them. As an action, you can begin to play your Theme, which continues until the start of your next turn (extend with a bonus action). It can be heard up to 120 feet away, but only influences creatures within 30 feet. Saves use your Intellect save DC.
While performing your Theme, you can use your reaction to alter its sound:
• Discordant Note. When a creature under the influence of your Theme attacks another creature you can see, subtract one roll of your Intellect Die from its attack roll.
• Inspiring Tune. When a creature under the influence of your Theme takes damage from a source you can see, reduce the damage it takes by one roll of your Intellect Die.
• Uplifting Melody. When a creature under the influence of your Theme makes a saving throw to resist being charmed, frightened, or stunned, it automatically succeeds.`,
      },
      {
        name: 'Disarming Melody',
        level: 6,
        text: `You have woven threads of disarming music into your Theme. If a creature under the influence of your Theme attacks you, it must succeed on a Wisdom saving throw or attack another target of its choice within range (or miss if there is none). A creature that succeeds is immune for 24 hours.
Additionally, whenever you use your action to begin your Theme or your bonus action to continue it, you can target one creature under its influence with a burst of sound: Constitution saving throw or take thunder damage equal to two rolls of your Intellect Die.`,
      },
      {
        name: 'Empowered Theme',
        level: 10,
        text: `The strength and beauty of your Theme has increased: it now affects any creature within 60 feet that can hear it.
Also, whenever you use a Wondrous Theme reaction, you can grant one creature under the influence of your Theme temporary hit points equal to your Intelligence modifier.`,
      },
      {
        name: 'Master Virtuoso',
        level: 15,
        text: `Your musical genius is without peer:
• Creatures within range of your Theme are still considered under its influence, even if they cannot hear it.
• When a creature fails its saving throw against Disarming Melody it takes additional thunder damage equal to one roll of your Intellect Die.`,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Scholarly Pursuits
// ---------------------------------------------------------------------------

/** An open "of your choice" pick a pursuit forces the player to resolve. */
export interface PursuitPick {
  id: string
  label: string
  from: 'skill' | 'savant-skill' | 'tool' | 'language' | 'any-proficiency'
}

export interface PursuitDef {
  key: string
  name: string
  source: 'core' | 'expanded'
  /** minimum Savant level (undefined = none) */
  minLevel?: number
  /** skill proficiency granted, if any */
  grantsSkill?: string
  /** open picks the player must resolve when mastering this pursuit */
  picks?: PursuitPick[]
  text: string
}

export const PURSUITS: PursuitDef[] = [
  {
    key: 'instruction', name: 'Instruction', source: 'core',
    text: `You have dedicated a significant amount of your studies to the art of education. Over the course of 1 hour, you can teach one humanoid that can hear and understand you one skill, tool, or weapon proficiency, or one language you know. The creature gains that proficiency or language until it completes a long rest.`,
  },
  {
    key: 'perfect-recall', name: 'Perfect Recall', source: 'core',
    text: `You can recall picture-perfect details from things that you commit to memory. If you spend at least 1 minute observing an object or creature, you can perfectly recall any observable information about it at any point in the future — a map, a page from a tome, a work of art, or the appearance of a creature.`,
  },
  {
    key: 'quick-study', name: 'Quick Study', source: 'core',
    picks: [{ id: 'prof', label: 'Skill, tool, or language', from: 'any-proficiency' }],
    text: `You learn exceptionally fast. You gain proficiency in one skill or tool, or learn to speak and read a language of your choice. Over the course of 1 hour, which can be during a short or long rest, you can replace this proficiency or language with another of your choice, so long as you have an example to learn from, such as a teacher or manual.`,
  },
  {
    key: 'astrology', name: 'Astrology', source: 'core', minLevel: 4, grantsSkill: 'arcana',
    text: `You are a disciple of heavenly bodies and use this knowledge to twist fate. You gain proficiency in Arcana, and whenever you make an Intelligence (Arcana) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
During each long rest that you can see the night sky, roll a d20 and record that number. Once before the end of the next long rest, you can choose to use that roll in place of the d20 for an ability check, attack roll, or saving throw before you roll.`,
  },
  {
    key: 'falconry', name: 'Falconry', source: 'core', minLevel: 4, grantsSkill: 'perception',
    text: `You have spent many months learning to train birds of prey. You gain proficiency in Perception, and whenever you make a Wisdom (Perception) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
You gain a trained Falcon (Hawk stat block, Intelligence 8). You and your Falcon can communicate simple ideas. In combat, it shares your initiative and acts on your turn; it only takes the Dodge action unless you use a bonus action to command it. If it dies, you can track and train another over 8 hours using 5 gp worth of bait.`,
  },
  {
    key: 'linguistics', name: 'Linguistics', source: 'core', minLevel: 4, grantsSkill: 'persuasion',
    text: `You are a student of language and the art of the spoken word. You gain proficiency in Persuasion, and whenever you make a Charisma (Persuasion) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
You also know how to speak, read, and write a number of additional languages equal to your Intelligence modifier.`,
  },
  {
    key: 'physical-fitness', name: 'Physical Fitness', source: 'core', minLevel: 4,
    text: `You know that the key to a healthy mind is a healthy body. You gain proficiency in either Athletics or Acrobatics. Whenever you make an ability check with that skill, you gain a bonus to your roll equal to one roll of your Intellect Die.
Also, you gain a climbing speed and a swimming speed equal to your walking speed, and when you make a running jump, you add your Intelligence modifier to the distance.`,
  },
  {
    key: 'riddles', name: 'Riddles', source: 'core', minLevel: 4, grantsSkill: 'deception',
    text: `You have spent a great deal of time learning to speak in both riddles and rhymes. You gain proficiency in Deception. When you make a Charisma (Deception) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
Also, when you speak, you can choose to speak in Riddles: you appear to be speaking normally, but you include hidden messages laced in your rhyming words. Over 1 hour you can teach a creature with Intelligence 11+ to understand your Riddles and respond in kind.`,
  },
  {
    key: 'secrets-whispers', name: 'Secrets & Whispers', source: 'core', minLevel: 4, grantsSkill: 'stealth',
    text: `You have a knack for knowing where to eavesdrop and the right person to bribe. You gain proficiency in Stealth. When you make a Dexterity (Stealth) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
Whenever you spend a long rest in a settlement, you can spend 1 hour gathering local rumors to learn of a significant, even secret, event which occurred there in the last week.`,
  },
  {
    key: 'theology', name: 'Theology', source: 'core', minLevel: 4, grantsSkill: 'religion',
    text: `You are a dedicated scholar of various holy texts and sacred rituals. You gain proficiency in Religion, and whenever you make an Intelligence (Religion) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
You also learn to speak, read, and write Celestial. Finally, you learn the ceremony spell, but you can only cast it as a ritual; for you the ritual takes only 10 minutes, and you can cast it without material components once per long rest.`,
  },
  {
    key: 'traditions', name: 'Traditions', source: 'core', minLevel: 4, grantsSkill: 'history',
    text: `You are a student of local cultures, politics, and traditions. You gain proficiency in History, and whenever you make an Intelligence (History) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
Whenever you make a Charisma check to interact with a local ruler or otherwise important figure and you incorporate a local custom or tradition, you have advantage on your roll.`,
  },
  // --- Expanded pursuits ---
  {
    key: 'polymath', name: 'Polymath', source: 'expanded',
    picks: [
      { id: 'skill', label: 'Skill (Savant list)', from: 'savant-skill' },
      { id: 'tool', label: 'Tool', from: 'tool' },
      { id: 'language', label: 'Language', from: 'language' },
    ],
    text: `You have a knack for picking up new skills, though you may not be a master of them all. You gain proficiency in one skill from the Savant skill list, one tool of your choice, and you learn to speak, read, and write one language of your choice.`,
  },
  {
    key: 'bushcraft', name: 'Bushcraft', source: 'expanded', minLevel: 4, grantsSkill: 'nature',
    text: `You can use your knowledge of nature to thrive in the wilds. You gain proficiency in Nature, and whenever you make an Intelligence (Nature) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
Over 10 minutes, you can gather natural material and use a dagger or handaxe to create: a club, 1d4 darts, a javelin, a net, 10 feet of rope, or a Bushcraft Snare. As an action, you can set a Snare in an adjacent unoccupied 5-foot space: the first Large or smaller creature to move into it must make a Dexterity saving throw against your Intellect save DC or be restrained.`,
  },
  {
    key: 'equestrianism', name: 'Equestrianism', source: 'expanded', minLevel: 4, grantsSkill: 'animal-handling',
    text: `You have learned to tend to horses and other trained mounts. You gain proficiency in Animal Handling, and whenever you make a Wisdom (Animal Handling) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
When you are riding a trained mount, it shares your initiative and acts during your turn. Whenever it makes an ability check, damage roll, or saving throw, it can add one roll of your Intellect Die; you can use a bonus action to command it to attack or use another action. You can train a friendly quadruped as a mount over 8 hours and 50 gp of materials.`,
  },
  {
    key: 'first-aid', name: 'First Aid', source: 'expanded', minLevel: 4, grantsSkill: 'medicine',
    text: `You have learned basic medicinal techniques to aid your allies. You gain proficiency in Medicine, and whenever you make a Wisdom (Medicine) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
During a long rest, you can spend 1 hour using a Healer's Kit to produce a number of potions of healing equal to your Intelligence modifier (minimum of 1). Unused potions expire 24 hours after creation.`,
  },
  {
    key: 'marksmanship', name: 'Marksmanship', source: 'expanded', minLevel: 4, grantsSkill: 'sleight-of-hand',
    text: `You bring your intellect to bear in the use of ranged weapons. You gain proficiency in Sleight of Hand. Whenever you make a Dexterity (Sleight of Hand) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
You also gain proficiency with all martial ranged weapons, and whenever you make a ranged weapon attack, you can use your Intellect Die in place of the weapon's damage die. If your setting includes firearms and your Savant has been exposed to their inner workings, they are proficient with simple and martial firearms.`,
  },
  {
    key: 'mercantilism', name: 'Mercantilism', source: 'expanded', minLevel: 4, grantsSkill: 'insight',
    text: `You are an astute scholar of economics, trade routes, and the marketplace. You gain proficiency in Insight, and whenever you make a Wisdom (Insight) check, you gain a bonus to your roll equal to one roll of your Intellect Die.
While you are trading with a creature whose Intelligence and Wisdom are both lower than your Intelligence, items you purchase cost 10 percent less, and items you sell are purchased for 10 percent more than usual.`,
  },
  {
    key: 'musicianship', name: 'Musicianship', source: 'expanded', minLevel: 4, grantsSkill: 'performance',
    text: `You have talent for music and song. You gain proficiency in Performance and with one musical instrument. Whenever you make an ability check with either, you gain a bonus to your roll equal to one roll of your Intellect Die.
Also, when you play a musical instrument or perform for a creature for 1 minute or longer, you have advantage on any ability checks to interact socially with that creature for 1 hour (ends if you or your allies harm the creature or its allies).`,
  },
]

// ---------------------------------------------------------------------------
// Scholarly Feats (Savant: Expanded)
// ---------------------------------------------------------------------------

export interface ScholarlyFeatDef {
  key: string
  name: string
  text: string
}

export const SCHOLARLY_FEATS: ScholarlyFeatDef[] = [
  {
    key: 'classical-artist', name: 'Classical Artist',
    text: `Your great intellect has allowed you to master what many would consider the fine arts:
• Increase your Intelligence score by 1, to a maximum of 20.
• You gain proficiency with both mason's tools and painter's supplies. Whenever you make an ability check with either tool, you can treat a roll of 9 or lower on the d20 as a 10.
• You can use mason's tools or painter's supplies and the appropriate materials to create a work of fine art worth 50 gp for each 8-hour workday you spend working on it.
• You have advantage on checks to assess the value of art.`,
  },
  {
    key: 'helpful-insights', name: 'Helpful Insights',
    text: `You always seem to have helpful advice for any situation:
• You increase your Intelligence or Wisdom score by 1, up to a maximum of 20.
• You can take the Help action as a bonus action on each of your turns.
• When you use a Help action to give advantage on an ability check with a skill or tool you are proficient in, the target can treat a result of 7 or lower on the d20 as an 8.`,
  },
  {
    key: 'lifelong-learner', name: 'Lifelong Learner',
    text: `You have made a vow to never stop learning. You gain the benefits below that correspond to your Intelligence modifier and lower (they scale with your modifier):
• +1: learn one additional language.
• +2: proficiency with one set of artisan's tools.
• +3: proficiency in one skill of your choice.
• +4: for one skill proficiency of your choice, treat a roll of 7 or lower on the d20 as an 8.
• +5: when forced to make a Wisdom saving throw, you can make an Intelligence saving throw instead.`,
  },
  {
    key: 'mental-acuity', name: 'Mental Acuity',
    text: `Your mind is a wonderful thing, capable of bursts of insight and mental fortitude:
• Increase your Intelligence score by 1, to a maximum of 20.
• You gain proficiency in two of: Arcana, History, Investigation, Medicine, Nature, or Religion.
• Choose any two skills from that list: whenever you make an ability check with either, you can treat a roll of 7 or lower on the d20 as an 8.`,
  },
  {
    key: 'scholar-of-lore', name: 'Scholar of Lore',
    text: `You have spent time learning everything there is to know about a specific area of study:
• Increase your Intelligence score by 1, to a maximum of 20.
• You master a Scholarly Pursuit of your choice from those available to the Savant. If the Pursuit has a Savant level prerequisite, you can learn it if your total level meets or exceeds it.
• If the Scholarly Pursuit requires you to roll an Intellect Die, you roll a d4 unless your Intellect Die is higher.`,
  },
]

// ---------------------------------------------------------------------------
// Magic items (Savant: Expanded) — compendium data
// ---------------------------------------------------------------------------

export interface MagicItemDef {
  name: string
  meta: string
  text: string
}

export const SAVANT_MAGIC_ITEMS: MagicItemDef[] = [
  {
    name: 'Blade of the Scribe',
    meta: 'Weapon (rapier), rare (requires attunement by a Savant)',
    text: `The handle of this elegant rapier is fashioned from silver and steel, and the hollow blade is filled with ink. You gain a +1 bonus to both attack and damage rolls with this magic weapon.
This magic rapier has 4 Charges. When you hit a target, you can expend 1 Charge to release a blast of ink: DC 15 Dexterity saving throw or be blinded for 1 minute (ends early if the creature uses its action to wipe its eyes). Regains 1d4 Charges daily at dawn.`,
  },
  {
    name: 'Doctoral Robes',
    meta: 'Wondrous item, legendary (requires attunement by a Savant)',
    text: `While attuned to these luxurious robes you gain the following benefits:
• So long as you are not wearing any armor, your Armor Class is equal to 15 + your Intelligence modifier.
• When you are forced to make a saving throw you gain a bonus to your roll equal to your Intelligence modifier.
• When another creature that can hear you within 30 feet makes an ability check, you can use your reaction to add your Intelligence modifier to the result of its roll.`,
  },
  {
    name: 'Living Quill',
    meta: 'Wondrous item, common',
    text: `As an action, you can speak the Quill's command word and touch it to a piece of paper or parchment. As long as the Quill can hear you, it transcribes your words exactly, for up to 1 hour or until you speak its command word again.`,
  },
  {
    name: 'Monocle of the Linguist',
    meta: 'Wondrous item, uncommon (requires attunement)',
    text: `This elegantly constructed single eyeglass allows you to read and understand all writing you view through it as if it were your native tongue.`,
  },
  {
    name: 'Ring of Remembering',
    meta: 'Ring, rare (requires attunement)',
    text: `This bronze ring is etched with hieroglyphics from a forgotten civilization. It has 3 Charges, regaining 1 daily at dawn. While wearing it, you can expend 1 Charge and focus on one object or creature you can see to instantly learn one piece of significant, forgotten, or secret knowledge about it, so long as such information exists.`,
  },
  {
    name: 'Staff of the Headmaster',
    meta: 'Staff, very rare (requires attunement by a Savant)',
    text: `A magic quarterstaff granting a +2 bonus to attack and damage rolls made with it. While holding it, you have a +2 bonus to any ability checks that use your Intelligence or Wisdom.
As an action, plunge the staff into the ground to produce the effect of private sanctum within a 30-foot radius (the area appears as an ornate study). Once used this way, the staff cannot do so again until the following dawn.`,
  },
  {
    name: 'Tome of Everlasting Genius',
    meta: 'Wondrous item, very rare (requires attunement by a Savant)',
    text: `This ageless tome has been passed down by generations of geniuses. It contains 1d4+1 entries; for each entry, you gain proficiency in the corresponding skill and an additional +5 bonus to checks with it. Geniuses: Actor (Performance), Astronomer (Nature), Cultist (Deception), Linguist (Persuasion), Magistrate (History), Psychologist (Insight), Surgeon (Medicine), Researcher (Investigation), Ritualist (Arcana), Theologian (Religion).
Once attuned for a year and a day, you can add your own entry, choosing one skill you are proficient in.`,
  },
]

export const SAVANT_QUIRKS = {
  obsessions: [
    'You discovered a strange script in the margin of a book. The best scholars cannot identify it.',
    'As a child you saw a majestic golden bird fly across the sky that left a rainbow in its wake.',
    'Your father charged you to find the legendary, and most likely fictional, chalice of Bahamut.',
    'You use the word "inconceivable" all the time even though you aren\'t exactly sure what it means.',
  ],
  eccentricities: [
    'You assume that every person you talk to cares about the minutia of your area of expertise.',
    'You have a really bad habit of only speaking in the technical jargon of your field.',
    "You don't understand children.",
    "When someone doesn't understand something you just haven't explained it enough times.",
    "You take diligent notes on everything even when it isn't socially appropriate.",
    'You are so dedicated to your field of study that you find yourself explaining things to your foes.',
  ],
  luckyTrinkets: [
    'You refuse to place your faith in a single deity so you carry a multitude of holy symbols.',
    'Your father was a farmer who paid for your education. You wear his hat in his memory.',
    'Despite its ineffectiveness, you carry a whip to impress and intimidate others.',
    'You carry a scroll of insane ramblings. One day you will figure out its meaning.',
    'You wear a pair of crystal spectacles even though you have perfect vision.',
    "You never leave home without a copy of your mentor's thesis on owlbear anatomy.",
  ],
  irrationalFears: [
    'You are convinced you contracted a minor form of lycanthropy from a dog that bit you as a child.',
    'You will do literally anything to avoid interacting with fire magic.',
    'You always make sure to sleep with a silver coin in your hand to ward off night hags.',
    'You hate snakes and snake-like creatures.',
    'You are so afraid of undead that the sight of them causes you to vomit.',
    "You give out code words to your allies so they can prove they aren't doppelgangers.",
  ],
}

export function getDiscipline(key: string | undefined): DisciplineDef | undefined {
  return DISCIPLINES.find((d) => d.key === key)
}

export function getPursuit(key: string): PursuitDef | undefined {
  return PURSUITS.find((p) => p.key === key)
}
