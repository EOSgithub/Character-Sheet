// The rules lexicon — one registry of every named thing in the game data, so
// any of them can be opened in the rules panel and any mention of one inside
// rules text can become a link. This is what makes the sheet "connected":
// entries come straight from src/data, never duplicated.

import { SAVANT_FEATURES, DISCIPLINES, PURSUITS, SCHOLARLY_FEATS, SAVANT_MAGIC_ITEMS } from '../data/savant'
import { ORIGIN_FEATS } from '../data/backgrounds'
import { SPECIES } from '../data/species'
import { WEAPONS, MASTERIES } from '../data/weapons'
import { ARMORS } from '../types'
import { GLOSSARY } from '../data/glossary'

export interface Entry {
  id: string
  name: string
  /** subtitle line in the rules panel, e.g. "Savant 5" or "Martial Melee weapon" */
  meta?: string
  text: string
}

interface LinkPattern {
  /** the exact string that links (entry name or alias) */
  pattern: string
  id: string
  /** if true the mention must match this capitalisation exactly */
  matchCase: boolean
}

const registry = new Map<string, Entry>()
const patterns: LinkPattern[] = []
/** lowercased name/alias -> entry id (first registration wins) */
const byName = new Map<string, string>()

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function register(entry: Entry, opts: { aliases?: string[]; matchCase?: boolean; noLink?: boolean } = {}) {
  registry.set(entry.id, entry)
  for (const n of [entry.name, ...(opts.aliases ?? [])]) {
    const key = n.toLowerCase()
    if (!byName.has(key)) byName.set(key, entry.id) // first registration wins name lookup
    if (!opts.noLink) patterns.push({ pattern: n, id: entry.id, matchCase: opts.matchCase ?? false })
  }
}

function KIND_LABEL(kind: string): string {
  switch (kind) {
    case 'condition': return 'Condition'
    case 'term': return 'Rules term'
    case 'action': return 'Action'
    case 'property': return 'Weapon property'
    default: return ''
  }
}

// ---------------------------------------------------------------------------
// Registration order defines link priority for duplicate names: game terms
// and conditions first (so "Darkvision" resolves to the term, not one of the
// ten species traits named Darkvision), then Savant content, then equipment.
// ---------------------------------------------------------------------------

for (const g of GLOSSARY) {
  register(
    { id: `${g.kind}:${g.key}`, name: g.name, meta: g.meta ?? KIND_LABEL(g.kind), text: g.text },
    { aliases: g.aliases, matchCase: g.matchCase },
  )
}

for (const f of SAVANT_FEATURES) {
  register({ id: `class:${slug(f.name)}`, name: f.name, meta: `Savant ${f.level} · class feature`, text: f.text }, { matchCase: true })
}

for (const d of DISCIPLINES) {
  register(
    {
      id: `discipline:${d.key}`, name: d.name, meta: 'Academic Discipline',
      text: `${d.blurb}\nGrants features at Savant levels 3, 6, 10, and 15: ${d.features.map((f) => f.name).join(', ')}.`,
    },
    { matchCase: true, noLink: true }, // "Investigator"/"Mentor" read as job words in prose — link only explicitly
  )
  for (const f of d.features) {
    register({ id: `dfeat:${d.key}:${slug(f.name)}`, name: f.name, meta: `${d.name} ${f.level} · discipline feature`, text: f.text }, { matchCase: true })
  }
  for (const o of d.options?.list ?? []) {
    register(
      { id: `dopt:${d.key}:${o.key}`, name: o.name, meta: `${d.name} · ${d.options!.label}${o.minLevel ? ` · Savant ${o.minLevel}+` : ''}`, text: o.text },
      { matchCase: true },
    )
  }
}

for (const p of PURSUITS) {
  register(
    { id: `pursuit:${p.key}`, name: p.name, meta: `Scholarly Pursuit${p.minLevel ? ` · Savant ${p.minLevel}+` : ''}`, text: p.text },
    { matchCase: true },
  )
}

for (const f of SCHOLARLY_FEATS) {
  register({ id: `feat:${f.key}`, name: f.name, meta: 'Scholarly Feat', text: f.text }, { matchCase: true })
}

for (const f of ORIGIN_FEATS) {
  register({ id: `ofeat:${f.key}`, name: f.name, meta: 'Origin Feat', text: f.text }, { matchCase: true })
}

for (const m of Object.entries(MASTERIES)) {
  register({ id: `mastery:${m[0]}`, name: m[1].name, meta: 'Weapon Mastery', text: m[1].text }, { matchCase: true })
}

for (const w of WEAPONS) {
  register(
    {
      id: `weapon:${w.key}`, name: w.name, meta: `${w.category} weapon`,
      text: `Damage: ${w.damage} ${w.damageType}${w.range ? ` · Range ${w.range} ft` : ''}
Mastery: ${MASTERIES[w.mastery].name}
${w.properties.length ? `Properties: ${w.properties.join(', ')}` : 'No properties.'}
The Savant is proficient with simple weapons, rapiers, shortswords, and whips; a Tactician adds martial weapons without the Heavy property.`,
    },
    { matchCase: true },
  )
}

for (const a of ARMORS) {
  if (a.key === 'none') continue
  register(
    {
      id: `armor:${a.key}`, name: a.name, meta: `${a.category === 'light' ? 'Light' : 'Medium'} armor`,
      text: `Armor Class: ${a.baseAC} + your Dexterity or Intelligence modifier${Number.isFinite(a.maxAbilityBonus) ? ` (max +${a.maxAbilityBonus})` : ''} — Predictive Defense lets a Savant use Intelligence in place of Dexterity.${a.stealthDisadvantage ? '\nWearing this armor gives you Disadvantage on Dexterity (Stealth) checks.' : ''}${a.category === 'medium' ? '\nThe Savant is only proficient with light armor unless a feature (such as Student of War) grants more.' : ''}`,
    },
    { matchCase: true },
  )
}
register({
  id: 'armor:shield', name: 'Shield', meta: 'Armor',
  text: 'While you hold a shield, you gain a +2 bonus to your Armor Class. You can benefit from only one shield at a time. The Savant is not proficient with shields unless a feature (such as Student of War) grants it.',
}, { matchCase: true, noLink: true }) // "Shield" also names a spell and appears in prose — explicit opens only

// Species traits last: generic names (Darkvision) are already claimed by terms.
for (const s of SPECIES) {
  register(
    { id: `species:${s.key}`, name: s.name, meta: 'Species', text: `${s.size} · Speed ${s.speed} ft.\nTraits: ${s.traits.map((t) => t.name).join(', ')}.` },
    { noLink: true }, // species names in prose ("an Elf", "Human") would over-link
  )
  for (const t of s.traits) {
    register({ id: `trait:${s.key}:${slug(t.name)}`, name: t.name, meta: `${s.name} trait`, text: t.text }, { matchCase: true })
  }
  for (const v of s.variants ?? []) {
    for (const t of v.traits) {
      register({ id: `trait:${s.key}:${v.key}:${slug(t.name)}`, name: t.name, meta: `${v.name} · ${s.name} trait`, text: t.text }, { matchCase: true })
    }
  }
}

for (const i of SAVANT_MAGIC_ITEMS) {
  register({ id: `mitem:${slug(i.name)}`, name: i.name, meta: i.meta, text: i.text }, { matchCase: true })
}

// ---------------------------------------------------------------------------
// Lookup API
// ---------------------------------------------------------------------------

export function getEntry(id: string): Entry | undefined {
  return registry.get(id)
}

/** Resolve a display name (exact, case-insensitive) to its entry — trailing
 *  parentheticals like "Detect Magic (free cast)" are ignored. */
export function findEntryByName(name: string): Entry | undefined {
  const clean = name.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase()
  const id = byName.get(clean) ?? byName.get(name.trim().toLowerCase())
  return id ? registry.get(id) : undefined
}

// ---------------------------------------------------------------------------
// Link matching — one regex over all linkable names, longest first so
// "Intellect save DC" wins over "Intellect" and "Attack action" over "Attack".
// ---------------------------------------------------------------------------

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const sorted = [...patterns].sort((a, b) => b.pattern.length - a.pattern.length)
/** lowercased pattern -> candidates (in priority order) */
const byPattern = new Map<string, LinkPattern[]>()
for (const p of sorted) {
  const key = p.pattern.toLowerCase()
  const list = byPattern.get(key)
  if (list) list.push(p)
  else byPattern.set(key, [p])
}

const LINK_REGEX = new RegExp(
  `\\b(?:${[...new Set(sorted.map((p) => escapeRe(p.pattern.toLowerCase())))].join('|')})\\b`,
  'gi',
)

/** Resolve a regex match to an entry id, honouring per-pattern case rules. */
export function resolveMention(matched: string): string | undefined {
  const candidates = byPattern.get(matched.toLowerCase())
  if (!candidates) return undefined
  for (const c of candidates) {
    if (!c.matchCase || c.pattern === matched) return c.id
  }
  return undefined
}

/** Fresh stateful regex for scanning a piece of text. */
export function mentionRegex(): RegExp {
  return new RegExp(LINK_REGEX.source, 'gi')
}
