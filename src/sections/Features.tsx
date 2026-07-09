import { useStore } from '../state/store'
import { derive, characterTools, characterLanguages, characterSpells } from '../rules/derive'
import { getSpecies } from '../data/species'
import { getBackground, getOriginFeat } from '../data/backgrounds'
import { getDiscipline, getPursuit, SAVANT_FEATURES, SCHOLARLY_FEATS } from '../data/savant'
import { NoCharacter, PageHead } from './shared'
import CharacterBand from './CharacterBand'
import FeatureRow from './FeatureRow'

function Feature({ name, meta, text }: { name: string; meta: string; text: string; open?: boolean }) {
  return <FeatureRow name={name} meta={meta} text={text} />
}

export default function Features() {
  const { active } = useStore()
  if (!active) return <><PageHead title="Features & Traits" /><NoCharacter /></>
  const c = active
  const d = derive(c)
  const species = getSpecies(c.speciesKey)
  const variant = species?.variants?.find((v) => v.key === c.speciesVariant)
  const background = getBackground(c.backgroundKey)
  const originFeat = background ? getOriginFeat(background.featKey) : undefined
  const discipline = getDiscipline(d.disciplineKey)

  const classFeatures = SAVANT_FEATURES.filter((f) => f.level <= c.level)
  const disciplineFeatures = discipline?.features.filter((f) => f.level <= c.level) ?? []

  // feats chosen at ASI levels
  const feats: { name: string; level: number; text: string }[] = []
  for (let lv = 1; lv <= c.level; lv++) {
    const feat = c.choices[lv]?.feat
    if (feat) {
      const known = SCHOLARLY_FEATS.find((f) => f.name === feat.name)
      feats.push({ name: feat.name, level: lv, text: feat.description || known?.text || 'See your source book for the full feat text.' })
    }
  }

  // discipline option picks (runes/recipes)
  const optionPicks: { name: string; text: string }[] = []
  if (discipline?.options) {
    for (let lv = 1; lv <= c.level; lv++) {
      for (const key of c.choices[lv]?.disciplineOptions ?? []) {
        const def = discipline.options.list.find((o) => o.key === key)
        if (def) optionPicks.push({ name: def.name, text: def.text })
      }
    }
  }

  return (
    <>
      <CharacterBand section="Features & Traits" />

      <div className="card">
        <h2>Savant class features</h2>
        {classFeatures.map((f) => (
          <Feature key={f.name} name={f.name} meta={`Savant ${f.level}`} text={f.text} />
        ))}
      </div>

      {discipline && (
        <div className="card">
          <h2>{discipline.name} discipline</h2>
          <p className="muted small">{discipline.blurb}</p>
          {disciplineFeatures.map((f) => (
            <Feature key={f.name} name={f.name} meta={`${discipline.name} ${f.level}`} text={f.text} />
          ))}
          {optionPicks.length > 0 && (
            <>
              <h3>{discipline.options?.label}</h3>
              {optionPicks.map((o) => (
                <Feature key={o.name} name={o.name} meta={discipline.options?.label ?? ''} text={o.text} />
              ))}
            </>
          )}
        </div>
      )}

      <div className="card">
        <h2>Scholarly Pursuits</h2>
        {d.pursuits.length === 0 ? (
          <p className="muted small">None mastered yet.</p>
        ) : (
          d.pursuits.map((pk) => {
            const p = getPursuit(pk)
            return p ? <Feature key={pk} name={p.name} meta="Pursuit" text={p.text} /> : null
          })
        )}
      </div>

      {feats.length > 0 && (
        <div className="card">
          <h2>Feats</h2>
          {feats.map((f) => (
            <Feature key={`${f.name}-${f.level}`} name={f.name} meta={`taken at level ${f.level}`} text={f.text} />
          ))}
        </div>
      )}

      <div className="card">
        <h2>{species?.name ?? 'Species'} traits</h2>
        {species?.traits.map((t) => (
          <Feature key={t.name} name={t.name} meta={species.name} text={t.text} />
        ))}
        {variant?.traits.map((t) => (
          <Feature key={t.name} name={t.name} meta={variant.name} text={t.text} />
        ))}
      </div>

      <div className="card">
        <h2>Proficiencies</h2>
        <div className="grid cols-2">
          <div>
            <h3>Tools</h3>
            {characterTools(c).length === 0
              ? <p className="muted small">None yet.</p>
              : <div className="row">{characterTools(c).map((t) => <span key={t} className="chip">{t}</span>)}</div>}
          </div>
          <div>
            <h3>Languages</h3>
            <div className="row">{characterLanguages(c).map((l) => <span key={l} className="chip">{l}</span>)}</div>
          </div>
        </div>
        {characterSpells(c).length > 0 && (
          <>
            <h3>Spells &amp; cantrips</h3>
            <div className="row">{characterSpells(c).map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </>
        )}
      </div>

      {background && (
        <div className="card">
          <h2>{background.name} background</h2>
          <p className="muted small">{background.blurb}</p>
          {originFeat && <Feature name={originFeat.name} meta="Origin feat" text={originFeat.text} open />}
          <p className="small muted mt">
            Skills: {background.skills.join(', ')} · Tool: {background.tool}
          </p>
        </div>
      )}
    </>
  )
}
