import { useState } from 'react'
import { ABILITY_NAMES, SKILLS } from '../types'
import type { AbilityKey } from '../types'
import { defaultSize } from '../data/species'
import type { SpeciesDef } from '../data/species'
import { ORIGIN_FEATS, getOriginFeat } from '../data/backgrounds'
import type { BackgroundDef } from '../data/backgrounds'
import type { PursuitDef } from '../data/savant'
import { ALL_TOOLS, ARTISANS_TOOLS, GAMING_SETS, INSTRUMENTS } from '../data/lists'
import Modal from './Modal'
import { FeatChoiceRows, PickRows } from './picks'

const skillName = (k: string) => SKILLS.find((s) => s.key === k)?.name ?? k

function Trait({ name, tag, text }: { name?: string; tag?: string; text: string }) {
  return (
    <div className="trait">
      {name && <div className="t-name">{name}{tag && <span className="tag">{tag}</span>}</div>}
      <div className="t-text">{text}</div>
    </div>
  )
}

/** The list a background's "of your choice" tool draws from. */
export function toolChoiceList(tool: string): string[] | null {
  if (!/choice|one of|\(one/i.test(tool)) return null
  if (/gaming/i.test(tool)) return GAMING_SETS
  if (/instrument/i.test(tool)) return INSTRUMENTS
  if (/artisan/i.test(tool)) return ARTISANS_TOOLS
  return ALL_TOOLS
}

/* -------------------------------- species -------------------------------- */

export type SpeciesDraft = { variant: string; size: string; choices: Record<string, string>; featPicks: Record<string, string> }

export function defaultSpeciesDraft(s: SpeciesDef): SpeciesDraft {
  const choices: Record<string, string> = {}
  for (const ch of s.choices ?? []) if (ch.kind === 'spellAbility') choices[ch.id] = ch.options?.[0] ?? 'int'
  return { variant: '', size: defaultSize(s), choices, featPicks: {} }
}

export function SpeciesModal({ species, initial, onChoose, onClose }: {
  species: SpeciesDef
  initial: SpeciesDraft
  onChoose: (d: SpeciesDraft) => void
  onClose: () => void
}) {
  const [variant, setVariant] = useState(initial.variant)
  const [size, setSize] = useState(initial.size)
  const [choices, setChoices] = useState(initial.choices)
  const [featPicks, setFeatPicks] = useState(initial.featPicks)

  const variantObj = species.variants?.find((v) => v.key === variant)
  const versatileChoice = species.choices?.find((c) => c.kind === 'originFeat')
  const versatileFeat = versatileChoice ? getOriginFeat(choices[versatileChoice.id] ?? '') : undefined
  const choicesAnswered = (species.choices ?? []).filter((c) => c.kind !== 'size').every((c) => !!choices[c.id])
  const versatilePicksComplete = (versatileFeat?.picks ?? []).every((pk) => !!featPicks[pk.id])
  const complete = (!species.variants || !!variant) && !!size && choicesAnswered && versatilePicksComplete

  return (
    <Modal
      open
      onClose={onClose}
      title={species.name}
      subtitle={`Size ${size} · Speed ${species.speed} ft${variantObj ? ` · ${variantObj.name}` : ''}`}
      footer={
        <>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!complete} onClick={() => onChoose({ variant, size, choices, featPicks })}>Choose {species.name}</button>
        </>
      }
    >
      {species.variants && (
        <div className="field">
          <label>{species.variantLabel} — choose one</label>
          <div className="grid cols-2" style={{ gap: 10 }}>
            {species.variants.map((v) => (
              <button key={v.key} className={`opt${variant === v.key ? ' selected' : ''}`} onClick={() => setVariant(v.key)}>
                <div className="opt-title">{v.name}</div>
                {v.traits[0] && <div className="opt-sub">{v.traits[0].text}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {species.choices?.map((ch) => (
        <div className="choice-row" key={ch.id}>
          <span className="c-label">{ch.label}</span>
          {ch.help && <span className="c-help">{ch.help}</span>}
          {ch.kind === 'size' || ch.kind === 'spellAbility' ? (
            <div className="row">
              {(ch.options ?? []).map((opt) => {
                const isSize = ch.kind === 'size'
                const selected = isSize ? size === opt : choices[ch.id] === opt
                const label = ch.kind === 'spellAbility' ? ABILITY_NAMES[opt as AbilityKey] : opt
                return (
                  <button key={opt} className={`chip${selected ? ' on' : ''}`} style={{ minHeight: 44 }}
                    onClick={() => isSize ? setSize(opt) : setChoices({ ...choices, [ch.id]: opt })}>{label}</button>
                )
              })}
            </div>
          ) : (
            <select className="wz-select" value={choices[ch.id] ?? ''}
              onChange={(e) => { setChoices({ ...choices, [ch.id]: e.target.value }); if (ch.kind === 'originFeat') setFeatPicks({}) }}>
              <option value="">choose…</option>
              {ch.kind === 'originFeat'
                ? ORIGIN_FEATS.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)
                : (ch.options ?? SKILLS.map((s) => s.key)).map((sk) => <option key={sk} value={sk}>{skillName(sk)}</option>)}
            </select>
          )}
        </div>
      ))}

      {versatileFeat?.picks && (
        <>
          <h3>{versatileFeat.name} — make your choices</h3>
          <FeatChoiceRows choices={versatileFeat.picks} values={featPicks} onChange={(id, v) => setFeatPicks({ ...featPicks, [id]: v })} />
        </>
      )}

      <h3>Traits</h3>
      {species.traits.map((t) => <Trait key={t.name} name={t.name} text={t.text} />)}
      {variantObj?.traits.map((t) => <Trait key={t.name} name={t.name} tag={variantObj.name} text={t.text} />)}
      {versatileFeat && <Trait name={versatileFeat.name} tag="Origin feat" text={versatileFeat.text} />}
    </Modal>
  )
}

/* ------------------------------- background ------------------------------- */

export type BackgroundDraft = { bonusMode: '2-1' | '1-1-1'; bonusTwo: AbilityKey | ''; bonusOne: AbilityKey | ''; bgTool: string; bgFeatPicks: Record<string, string> }

export function defaultBackgroundDraft(): BackgroundDraft {
  return { bonusMode: '2-1', bonusTwo: '', bonusOne: '', bgTool: '', bgFeatPicks: {} }
}

export function BackgroundModal({ background, initial, onChoose, onClose }: {
  background: BackgroundDef
  initial: BackgroundDraft
  onChoose: (d: BackgroundDraft) => void
  onClose: () => void
}) {
  const [bonusMode, setBonusMode] = useState(initial.bonusMode)
  const [bonusTwo, setBonusTwo] = useState<AbilityKey | ''>(initial.bonusTwo)
  const [bonusOne, setBonusOne] = useState<AbilityKey | ''>(initial.bonusOne)
  const [bgTool, setBgTool] = useState(initial.bgTool)
  const [bgFeatPicks, setBgFeatPicks] = useState(initial.bgFeatPicks)

  const feat = getOriginFeat(background.featKey)
  const toolList = toolChoiceList(background.tool)
  const bonusOk = bonusMode === '1-1-1' || (!!bonusTwo && !!bonusOne && bonusTwo !== bonusOne)
  const featPicksComplete = (feat?.picks ?? []).every((pk) => !!bgFeatPicks[pk.id])
  const complete = bonusOk && (!toolList || !!bgTool) && featPicksComplete

  return (
    <Modal
      open
      onClose={onClose}
      title={background.name}
      subtitle={`${background.abilities.map((a) => a.toUpperCase()).join(' / ')} · ${feat?.name ?? ''}`}
      footer={
        <>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!complete} onClick={() => onChoose({ bonusMode, bonusTwo, bonusOne, bgTool, bgFeatPicks })}>Choose {background.name}</button>
        </>
      }
    >
      <p className="lede" style={{ marginTop: 0 }}>{background.blurb}</p>

      <h3>Ability score increases</h3>
      <p className="muted small" style={{ marginTop: 0 }}>
        Increase {background.abilities.map((a) => ABILITY_NAMES[a]).join(', ')}: +2 to one and +1 to another, or +1 to all three.
      </p>
      <div className="row">
        <button className={`chip${bonusMode === '2-1' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setBonusMode('2-1')}>+2 / +1</button>
        <button className={`chip${bonusMode === '1-1-1' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setBonusMode('1-1-1')}>+1 / +1 / +1</button>
      </div>
      {bonusMode === '2-1' && (
        <div className="row mt" style={{ gap: 16 }}>
          <div className="field">
            <label>+2 to</label>
            <select className="wz-select" value={bonusTwo} onChange={(e) => setBonusTwo(e.target.value as AbilityKey)}>
              <option value="">choose…</option>
              {background.abilities.map((a) => <option key={a} value={a}>{ABILITY_NAMES[a]}</option>)}
            </select>
          </div>
          <div className="field">
            <label>+1 to</label>
            <select className="wz-select" value={bonusOne} onChange={(e) => setBonusOne(e.target.value as AbilityKey)}>
              <option value="">choose…</option>
              {background.abilities.filter((a) => a !== bonusTwo).map((a) => <option key={a} value={a}>{ABILITY_NAMES[a]}</option>)}
            </select>
          </div>
        </div>
      )}

      {toolList && (
        <div className="field mt">
          <label>Tool proficiency — choose one</label>
          <span className="c-help" style={{ fontSize: 12.5, color: 'var(--graphite)' }}>{background.tool}</span>
          <select className="wz-select" value={bgTool} onChange={(e) => setBgTool(e.target.value)}>
            <option value="">choose…</option>
            {toolList.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {feat?.picks && (
        <>
          <h3>{feat.name} — make your choices</h3>
          <FeatChoiceRows choices={feat.picks} values={bgFeatPicks} onChange={(id, v) => setBgFeatPicks({ ...bgFeatPicks, [id]: v })} />
        </>
      )}

      <h3>What you gain</h3>
      {feat && <Trait name={feat.name} tag="Origin feat" text={feat.text} />}
      <Trait name="Skill proficiencies" text={background.skills.map(skillName).join(', ')} />
      {!toolList && <Trait name="Tool proficiency" text={background.tool} />}
      <Trait name="Starting equipment" text={background.equipment} />
    </Modal>
  )
}

/* -------------------------------- pursuit -------------------------------- */

export function PursuitModal({ pursuit, initialPicks, onChoose, onClose }: {
  pursuit: PursuitDef
  initialPicks: Record<string, string>
  onChoose: (picks: Record<string, string>) => void
  onClose: () => void
}) {
  const [picks, setPicks] = useState(initialPicks)
  const complete = (pursuit.picks ?? []).every((pk) => !!picks[pk.id])
  return (
    <Modal
      open
      onClose={onClose}
      title={pursuit.name}
      subtitle={pursuit.source === 'expanded' ? 'Savant: Expanded' : 'Scholarly Pursuit'}
      footer={
        <>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!complete} onClick={() => onChoose(picks)}>Master {pursuit.name}</button>
        </>
      }
    >
      {pursuit.grantsSkill && <p className="lede" style={{ marginTop: 0 }}>Grants proficiency in {skillName(pursuit.grantsSkill)}.</p>}
      <div className="modal-prose">{pursuit.text}</div>
      {pursuit.picks && (
        <div style={{ marginTop: 8 }}>
          <PickRows picks={pursuit.picks} values={picks} onChange={(id, v) => setPicks({ ...picks, [id]: v })} />
        </div>
      )}
    </Modal>
  )
}
