import { useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { deriveResources, applyShortRest, applyLongRest } from '../rules/resources'
import Modal from './Modal'
import { TermLink } from './rules'

/** Short and long rests, automated per the 2024 rules — opened from the
 *  rest button in the character band. */
export default function RestModal({ onClose }: { onClose: () => void }) {
  const { active, updateCharacter } = useStore()
  const [dieRoll, setDieRoll] = useState('')
  if (!active) return null
  const c = active
  const d = derive(c)
  const defs = deriveResources(c, d)
  const diceLeft = d.hitDiceTotal - c.hitDiceSpent

  function spendDie(roll: number) {
    if (diceLeft <= 0) return
    const healed = Math.max(1, roll + d.mods.con)
    updateCharacter(c.id, {
      hitDiceSpent: c.hitDiceSpent + 1,
      currentHP: Math.min(d.maxHP, c.currentHP + healed),
    })
    setDieRoll('')
  }

  function finishShortRest() {
    updateCharacter(c.id, applyShortRest(c, defs))
    onClose()
  }

  function finishLongRest() {
    updateCharacter(c.id, applyLongRest(c, d))
    onClose()
  }

  const hints: { key: string; node: ReactNode }[] = []
  if (d.disciplineKey === 'culinarian' && c.level >= 3) hints.push({ key: 'flavor', node: <><TermLink name="Student of Flavor" />: each spent Hit Die also heals +1 Intellect Die roll (add it to the roll you enter).</> })
  if (d.disciplineKey === 'mentor' && c.level >= 6) hints.push({ key: 'soothing', node: <><TermLink name="Soothing Presence" />: advantage on Hit Die rolls; allies gain temp HP equal to your Savant level.</> })

  return (
    <Modal open onClose={onClose} title="Rest" subtitle={`HP ${c.currentHP}/${d.maxHP} · hit dice d8 × ${diceLeft} left`}>
      <div className="eyebrow">Short rest · spend Hit Dice</div>
      <div className="row mt" style={{ marginTop: 8 }}>
        <input
          inputMode="numeric"
          placeholder="d8 roll"
          value={dieRoll}
          onChange={(e) => setDieRoll(e.target.value.replace(/\D/g, ''))}
          style={{ width: 90, minHeight: 44, border: '1px solid var(--rule-strong)', borderRadius: 6, padding: '4px 12px', background: '#fff' }}
        />
        <button
          className="btn small"
          disabled={diceLeft <= 0 || !(parseInt(dieRoll, 10) >= 1 && parseInt(dieRoll, 10) <= 8)}
          onClick={() => spendDie(parseInt(dieRoll, 10))}
        >
          Spend & heal
        </button>
        <button className="btn small" disabled={diceLeft <= 0} onClick={() => spendDie(5)}>
          Average (5)
        </button>
      </div>
      <p className="small muted" style={{ marginBottom: 0 }}>Each die heals its roll {fmt(d.mods.con)} (CON).</p>
      {hints.map((h) => <p key={h.key} className="small muted" style={{ marginBottom: 0 }}>{h.node}</p>)}

      <hr className="rule" />
      <div className="row">
        <button className="btn" onClick={finishShortRest}>Finish short rest</button>
        <button className="btn primary" onClick={finishLongRest}>Finish long rest</button>
      </div>
      <p className="small muted" style={{ marginBottom: 0 }}>
        <TermLink name="Short Rest">Short rest</TermLink> restores short-rest uses.{' '}
        <TermLink name="Long Rest">Long rest</TermLink> restores all HP, Hit Dice, and uses; temp HP is lost; exhaustion −1.
      </p>
    </Modal>
  )
}
