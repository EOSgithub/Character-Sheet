// Shared UI + helpers for open "of your choice" picks used in both character
// creation and level-up. Covers proficiency picks (skills/tools/languages) and,
// for feats, ability increases, extra Scholarly Pursuits, and Magic Initiate
// spells. Every value is encoded as "kind:value" so it can be routed and shown.

import { useId } from 'react'
import { SKILLS, ABILITY_NAMES } from '../types'
import { TOOL_GROUPS, LANGUAGES, ARTISANS_TOOLS, INSTRUMENTS, GAMING_SETS } from '../data/lists'
import type { PickSource, ChoicePick, FeatChoice } from '../data/lists'
import { SAVANT_SKILL_LIST } from '../data/savant'
import { spellOptions } from '../data/spells'

export type { ChoicePick, FeatChoice }

const skillName = (k: string) => SKILLS.find((s) => s.key === k)?.name ?? k

/** Human-readable label for an encoded pick value ("skill:arcana" → "Arcana"). */
export function pickLabel(encoded: string): string {
  const i = encoded.indexOf(':')
  if (i < 0) return encoded
  const kind = encoded.slice(0, i), val = encoded.slice(i + 1)
  if (kind === 'skill') return skillName(val)
  if (kind === 'ability') return ABILITY_NAMES[val as keyof typeof ABILITY_NAMES] ?? val
  return val
}

/** A <select> for one proficiency pick. Values are encoded as "kind:value". */
export function ProficiencySelect({ from, options, value, onChange }: { from: PickSource; options?: string[]; value: string; onChange: (v: string) => void }) {
  const restrict = options && options.length ? options : null
  const wantSkill = from === 'skill' || from === 'any-proficiency' || from === 'skill-or-tool'
  const wantTool = from === 'tool' || from === 'any-proficiency' || from === 'skill-or-tool'
  const wantLang = from === 'language' || from === 'any-proficiency'
  const savantSkills = from === 'savant-skill'
  const singleTool = from === 'artisan-tool' ? ARTISANS_TOOLS : from === 'instrument' ? INSTRUMENTS : from === 'gaming-set' ? GAMING_SETS : null
  const skillList = restrict ?? SKILLS.map((s) => s.key)
  return (
    <select className="wz-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">choose…</option>
      {savantSkills && (
        <optgroup label="Skills (Savant list)">
          {SAVANT_SKILL_LIST.map((k) => <option key={k} value={`skill:${k}`}>{skillName(k)}</option>)}
        </optgroup>
      )}
      {singleTool && singleTool.map((t) => <option key={t} value={`tool:${t}`}>{t}</option>)}
      {wantSkill && (
        <optgroup label="Skills">
          {skillList.map((k) => <option key={k} value={`skill:${k}`}>{skillName(k)}</option>)}
        </optgroup>
      )}
      {wantTool && TOOL_GROUPS.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.items.map((t) => <option key={t} value={`tool:${t}`}>{t}</option>)}
        </optgroup>
      ))}
      {wantLang && (
        <optgroup label="Languages">
          {LANGUAGES.map((l) => <option key={l} value={`language:${l}`}>{l}</option>)}
        </optgroup>
      )}
    </select>
  )
}

/** Renders proficiency picks (pursuits, species choices) keyed by pick id. */
export function PickRows({ picks, values, onChange }: {
  picks: ChoicePick[]
  values: Record<string, string>
  onChange: (id: string, v: string) => void
}) {
  return (
    <>
      {picks.map((pk) => (
        <div className="choice-row" key={pk.id}>
          <span className="c-label">{pk.label} — choose one</span>
          <ProficiencySelect from={pk.from} options={pk.options} value={values[pk.id] ?? ''} onChange={(v) => onChange(pk.id, v)} />
        </div>
      ))}
    </>
  )
}

function SpellInput({ list, level, value, onChange }: { list: 'cleric' | 'druid' | 'wizard'; level: 0 | 1; value: string; onChange: (v: string) => void }) {
  const dlId = useId()
  const raw = value.startsWith('spell:') ? value.slice(6) : ''
  return (
    <>
      <input
        className="wz-select"
        list={dlId}
        value={raw}
        placeholder="type or choose a spell…"
        onChange={(e) => onChange(e.target.value ? `spell:${e.target.value}` : '')}
      />
      <datalist id={dlId}>
        {spellOptions(list, level).map((s) => <option key={s} value={s} />)}
      </datalist>
    </>
  )
}

/** Renders any feat choice (proficiency / ability / pursuit / spell). */
export function FeatChoiceRows({ choices, values, onChange, pursuitOptions }: {
  choices: FeatChoice[]
  values: Record<string, string>
  onChange: (id: string, v: string) => void
  pursuitOptions?: { key: string; name: string }[]
}) {
  return (
    <>
      {choices.map((ch) => {
        const value = values[ch.id] ?? ''
        return (
          <div className="choice-row" key={ch.id}>
            <span className="c-label">{ch.label} — choose one</span>
            {ch.kind === 'proficiency' && (
              <ProficiencySelect from={ch.from} options={ch.options} value={value} onChange={(v) => onChange(ch.id, v)} />
            )}
            {ch.kind === 'ability' && (
              <select className="wz-select" value={value} onChange={(e) => onChange(ch.id, e.target.value)}>
                <option value="">choose…</option>
                {ch.abilities.map((a) => <option key={a} value={`ability:${a}`}>{ABILITY_NAMES[a]} (+{ch.amount ?? 1})</option>)}
              </select>
            )}
            {ch.kind === 'pursuit' && (
              <select className="wz-select" value={value} onChange={(e) => onChange(ch.id, e.target.value)}>
                <option value="">choose…</option>
                {(pursuitOptions ?? []).map((p) => <option key={p.key} value={`pursuit:${p.key}`}>{p.name}</option>)}
              </select>
            )}
            {ch.kind === 'spell' && (
              <SpellInput list={ch.list} level={ch.level} value={value} onChange={(v) => onChange(ch.id, v)} />
            )}
          </div>
        )
      })}
    </>
  )
}
