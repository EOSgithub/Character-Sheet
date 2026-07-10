import { useStore } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { ABILITY_KEYS, ABILITY_NAMES, SKILLS } from '../types'

export default function Abilities() {
  const { active } = useStore()
  if (!active) return null
  const d = derive(active)

  return (
    <>
      <div className="grid cols-3" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {ABILITY_KEYS.map((k) => (
          <div className="stat-tile ability" key={k}>
            <div className="label">{ABILITY_NAMES[k]}</div>
            <div className="value">{fmt(d.mods[k])}</div>
            <div className="detail num">{d.abilities[k]}</div>
          </div>
        ))}
      </div>

      <div className="grid cols-2 mt">
        <div className="card">
          <h2>Saving throws</h2>
          <table className="ledger">
            <tbody>
              {ABILITY_KEYS.map((k) => (
                <tr key={k}>
                  <td style={{ width: 28 }}>
                    <span
                      title={d.saveProficiencies.includes(k) ? 'Proficient' : 'Not proficient'}
                      style={{
                        display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                        border: '1.5px solid var(--prussian)',
                        background: d.saveProficiencies.includes(k) ? 'var(--prussian)' : 'transparent',
                      }}
                    />
                  </td>
                  <td>{ABILITY_NAMES[k]}</td>
                  <td className="num right" style={{ fontSize: 18 }}>{fmt(d.saves[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted mt">
            Peerless Insights (5th+): add one roll of your Intellect Die to INT, WIS, and CHA saving throws while not incapacitated.
            {active.level >= 14 && ' Unyielding Will (14th): advantage on saves against charmed and frightened.'}
          </p>
        </div>

        <div className="card">
          <h2>Senses & measures</h2>
          <table className="ledger">
            <tbody>
              <tr><td>Passive Perception</td><td className="num right" style={{ fontSize: 18 }}>{d.passivePerception}</td></tr>
              <tr><td>Proficiency Bonus</td><td className="num right" style={{ fontSize: 18 }}>{fmt(d.pb)}</td></tr>
              <tr><td>Intellect Save DC</td><td className="num right" style={{ fontSize: 18 }}>{d.intellectDC}</td></tr>
              <tr><td>Intellect Die</td><td className="num right" style={{ fontSize: 18 }}>{d.intellectDie ? `d${d.intellectDie}` : '—'}</td></tr>
              <tr><td>Speed</td><td className="num right" style={{ fontSize: 18 }}>{d.speed} ft</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt">
        <h2>Skills</h2>
        <table className="ledger">
          <thead>
            <tr><th style={{ width: 28 }}></th><th>Skill</th><th>Ability</th><th className="right">Bonus</th></tr>
          </thead>
          <tbody>
            {SKILLS.map((s) => {
              const prof = d.skillProficiencies.has(s.key)
              return (
                <tr key={s.key}>
                  <td>
                    <span
                      title={prof ? 'Proficient' : 'Not proficient'}
                      style={{
                        display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                        border: '1.5px solid var(--prussian)',
                        background: prof ? 'var(--prussian)' : 'transparent',
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: prof ? 600 : 400 }}>{s.name}</td>
                  <td className="muted small">{s.ability.toUpperCase()}</td>
                  <td className="num right" style={{ fontSize: 18 }}>{fmt(d.skills[s.key])}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="small muted mt">
          Discipline and Pursuit skill grants are included automatically. Intellect Die bonuses to specific skills are listed with the granting feature.
        </p>
      </div>
    </>
  )
}
