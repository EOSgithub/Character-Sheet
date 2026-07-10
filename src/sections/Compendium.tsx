import { useState } from 'react'
import {
  SAVANT_TABLE, SAVANT_BASICS, SAVANT_FEATURES, DISCIPLINES, PURSUITS,
  SCHOLARLY_FEATS, SAVANT_MAGIC_ITEMS, SAVANT_QUIRKS,
} from '../data/savant'
import { WEAPONS, MASTERIES } from '../data/weapons'
import { PageHead } from './shared'
import FeatureRow from './FeatureRow'
import { useRules } from './rules'

type Entry = { key: string; label: string; group: string }

const ENTRIES: Entry[] = [
  { key: 'class', label: 'The Savant', group: 'Class' },
  { key: 'table', label: 'Class table', group: 'Class' },
  ...DISCIPLINES.map((d) => ({ key: `disc-${d.key}`, label: d.name, group: 'Academic Disciplines' })),
  { key: 'pursuits', label: 'Scholarly Pursuits', group: 'Options' },
  { key: 'feats', label: 'Scholarly Feats', group: 'Options' },
  { key: 'items', label: 'Magic Items', group: 'Options' },
  { key: 'quirks', label: 'Personality & Quirks', group: 'Options' },
  { key: 'weapons', label: 'Weapons & Masteries', group: 'Rules 2024' },
]

function FeatureBlock({ name, meta, text }: { name: string; meta?: string; text: string }) {
  return <FeatureRow name={name} meta={meta} text={text} />
}

export default function Compendium() {
  const [current, setCurrent] = useState('class')
  const { open } = useRules()

  let content: React.ReactNode = null

  if (current === 'class') {
    content = (
      <div className="card prose">
        <h2>The Savant</h2>
        <p className="muted">
          An Intelligence-based, non-magical class that focuses on gathering information and supporting
          allies. Homebrew by <strong>/u/laserllama</strong>, version 5.2 — transcribed from “The Savant Class”
          and “The Savant: Expanded”.
        </p>
        <h3>Core numbers</h3>
        <table className="ledger">
          <tbody>
            <tr><td>Hit Dice</td><td className="right">1d8 per Savant level</td></tr>
            <tr><td>HP at 1st level</td><td className="right">8 + CON modifier</td></tr>
            <tr><td>HP at higher levels</td><td className="right">1d8 (or 5) + CON modifier</td></tr>
            <tr><td>Saving throws</td><td className="right">Intelligence, Wisdom</td></tr>
            <tr><td>Armor</td><td className="right">{SAVANT_BASICS.armor}</td></tr>
            <tr><td>Weapons</td><td className="right">{SAVANT_BASICS.weapons}</td></tr>
            <tr><td>Tools</td><td className="right">{SAVANT_BASICS.tools}</td></tr>
          </tbody>
        </table>
        <h3>Skills</h3>
        <p>{SAVANT_BASICS.skillsText}.</p>
        <h3>Starting equipment</h3>
        <ul>{SAVANT_BASICS.startingEquipment.map((e) => <li key={e}>{e}</li>)}</ul>
        <h3>Class features</h3>
        {SAVANT_FEATURES.map((f) => <FeatureBlock key={f.name} name={f.name} meta={`Level ${f.level}`} text={f.text} />)}
      </div>
    )
  } else if (current === 'table') {
    content = (
      <div className="card" style={{ overflowX: 'auto' }}>
        <h2>The Savant — class table</h2>
        <table className="ledger">
          <thead>
            <tr><th>Level</th><th>PB</th><th>Features</th><th>Intellect Die</th><th>Reactions</th></tr>
          </thead>
          <tbody>
            {SAVANT_TABLE.map((r) => (
              <tr key={r.level}>
                <td className="num">{r.level}</td>
                <td className="num">+{r.pb}</td>
                <td>{r.features.join(', ')}</td>
                <td className="num">{r.intellectDie ? `d${r.intellectDie}` : '—'}</td>
                <td className="num">{r.reactions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } else if (current.startsWith('disc-')) {
    const d = DISCIPLINES.find((x) => `disc-${x.key}` === current)!
    content = (
      <div className="card prose">
        <h2>{d.name}</h2>
        <p className="muted">{d.blurb} <span className="small">({d.source === 'core' ? 'The Savant Class' : 'Savant: Expanded'})</span></p>
        {d.features.map((f) => <FeatureBlock key={f.name} name={f.name} meta={`Level ${f.level}`} text={f.text} />)}
        {d.options && (
          <>
            <h3>{d.options.label}</h3>
            {d.options.list.map((o) => (
              <FeatureBlock key={o.key} name={o.name} meta={o.minLevel ? `Level ${o.minLevel}+` : undefined} text={o.text} />
            ))}
          </>
        )}
      </div>
    )
  } else if (current === 'pursuits') {
    content = (
      <div className="card prose">
        <h2>Scholarly Pursuits</h2>
        <p className="muted">
          Mastered at Savant levels 1, 4, 7, 13, and 18. If a Pursuit lets you add an Intellect Die to a check
          that already has this benefit, roll the die twice and use the higher result.
        </p>
        {PURSUITS.map((p) => (
          <FeatureBlock
            key={p.key}
            name={p.name}
            meta={`${p.minLevel ? `Savant ${p.minLevel}+ · ` : ''}${p.source === 'core' ? 'core' : 'expanded'}`}
            text={p.text}
          />
        ))}
      </div>
    )
  } else if (current === 'feats') {
    content = (
      <div className="card prose">
        <h2>Scholarly Feats</h2>
        <p className="muted">From Savant: Expanded — available alongside the Player's Handbook feats.</p>
        {SCHOLARLY_FEATS.map((f) => <FeatureBlock key={f.key} name={f.name} text={f.text} />)}
      </div>
    )
  } else if (current === 'items') {
    content = (
      <div className="card prose">
        <h2>Magic Items</h2>
        <p className="muted">Scholarly magic items from Savant: Expanded.</p>
        {SAVANT_MAGIC_ITEMS.map((i) => <FeatureBlock key={i.name} name={i.name} meta={i.meta} text={i.text} />)}
      </div>
    )
  } else if (current === 'weapons') {
    content = (
      <div className="card prose" style={{ maxWidth: 'none' }}>
        <h2>Weapons & Masteries (D&D 2024)</h2>
        <p className="muted">
          The 2024 weapon table, including each weapon's Mastery property. Using a Mastery property normally
          requires a class feature that unlocks it — the Savant as written predates Weapon Mastery, so check
          with your DM. The Savant is proficient with simple weapons, rapiers, shortswords, and whips;
          Tacticians add martial weapons without the Heavy property.
        </p>
        <h3>Mastery properties</h3>
        {Object.values(MASTERIES).map((m) => <FeatureBlock key={m.name} name={m.name} text={m.text} />)}
        <h3>Weapon table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="ledger">
            <thead>
              <tr><th>Weapon</th><th>Category</th><th>Damage</th><th>Mastery</th><th>Properties</th></tr>
            </thead>
            <tbody>
              {WEAPONS.map((w) => (
                <tr key={w.key}>
                  <td style={{ fontWeight: 600 }}>
                    <button className="term" onClick={() => open(`weapon:${w.key}`)}>{w.name}</button>
                  </td>
                  <td className="small muted">{w.category}</td>
                  <td className="num">{w.damage} {w.damageType.slice(0, 1).toUpperCase()}</td>
                  <td>
                    <button className="term" onClick={() => open(`mastery:${w.mastery}`)}>{MASTERIES[w.mastery].name}</button>
                  </td>
                  <td className="small muted">{w.properties.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  } else if (current === 'quirks') {
    content = (
      <div className="card prose">
        <h2>Personality & Quirks</h2>
        <p className="muted">Roleplaying tables for Savants — take what you like, or use them as inspiration.</p>
        <h3>Obsessions (d4)</h3>
        <ol>{SAVANT_QUIRKS.obsessions.map((q, i) => <li key={i}>{q}</li>)}</ol>
        <h3>Eccentricities (d6)</h3>
        <ol>{SAVANT_QUIRKS.eccentricities.map((q, i) => <li key={i}>{q}</li>)}</ol>
        <h3>Good Luck Charms (d6)</h3>
        <ol>{SAVANT_QUIRKS.luckyTrinkets.map((q, i) => <li key={i}>{q}</li>)}</ol>
        <h3>Irrational Fears (d6)</h3>
        <ol>{SAVANT_QUIRKS.irrationalFears.map((q, i) => <li key={i}>{q}</li>)}</ol>
      </div>
    )
  }

  const groups = [...new Set(ENTRIES.map((e) => e.group))]

  return (
    <>
      <PageHead title="Compendium" sub="Source texts for the table — the Savant, its options, and more to come" />
      <div className="comp-layout">
        <nav className="comp-nav" aria-label="Compendium contents">
          {groups.map((g) => (
            <div key={g}>
              <div className="group">{g}</div>
              {ENTRIES.filter((e) => e.group === g).map((e) => (
                <button key={e.key} className={current === e.key ? 'active' : ''} onClick={() => setCurrent(e.key)} style={{ width: '100%' }}>
                  {e.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div>{content}</div>
      </div>
    </>
  )
}
