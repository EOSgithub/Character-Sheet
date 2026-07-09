// Shared UI + helpers for open "of your choice" picks (skills, tools,
// languages) used in both character creation and level-up.

import { SKILLS } from '../types'
import { TOOL_GROUPS, LANGUAGES, ARTISANS_TOOLS, INSTRUMENTS, GAMING_SETS } from '../data/lists'
import type { PickSource, ChoicePick } from '../data/lists'
import { SAVANT_SKILL_LIST } from '../data/savant'

export type { ChoicePick }

const skillName = (k: string) => SKILLS.find((s) => s.key === k)?.name ?? k

/** Human-readable label for an encoded pick value ("skill:arcana" → "Arcana"). */
export function pickLabel(encoded: string): string {
  const i = encoded.indexOf(':')
  if (i < 0) return encoded
  const kind = encoded.slice(0, i), val = encoded.slice(i + 1)
  return kind === 'skill' ? skillName(val) : val
}

/** A <select> for one open pick. Values are encoded as "kind:value". */
export function ProficiencySelect({ from, value, onChange }: { from: PickSource; value: string; onChange: (v: string) => void }) {
  const wantSkill = from === 'skill' || from === 'any-proficiency' || from === 'skill-or-tool'
  const wantTool = from === 'tool' || from === 'any-proficiency' || from === 'skill-or-tool'
  const wantLang = from === 'language' || from === 'any-proficiency'
  const savantSkills = from === 'savant-skill'
  const singleTool = from === 'artisan-tool' ? ARTISANS_TOOLS : from === 'instrument' ? INSTRUMENTS : from === 'gaming-set' ? GAMING_SETS : null
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
          {SKILLS.map((s) => <option key={s.key} value={`skill:${s.key}`}>{s.name}</option>)}
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

/** Renders a labelled row per pick and reports selections keyed by pick id. */
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
          <ProficiencySelect from={pk.from} value={values[pk.id] ?? ''} onChange={(v) => onChange(pk.id, v)} />
        </div>
      ))}
    </>
  )
}
