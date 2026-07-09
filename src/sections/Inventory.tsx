import { useStore, newId } from '../state/store'
import type { InventoryItem } from '../types'
import { NoCharacter, PageHead, Stepper } from './shared'
import CharacterBand from './CharacterBand'

const ATTUNEMENT_SLOTS = 3

export default function Inventory() {
  const { active, updateCharacter } = useStore()
  if (!active) return <><PageHead title="Inventory & Attuned Items" /><NoCharacter /></>
  const c = active

  const attunedCount = c.inventory.filter((i) => i.attuned).length

  function addItem() {
    const item: InventoryItem = { id: newId(), name: 'New item', qty: 1 }
    updateCharacter(c.id, { inventory: [...c.inventory, item] })
  }

  function patchItem(id: string, patch: Partial<InventoryItem>) {
    updateCharacter(c.id, { inventory: c.inventory.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }

  function removeItem(id: string) {
    updateCharacter(c.id, { inventory: c.inventory.filter((i) => i.id !== id) })
  }

  const attunedItems = c.inventory.filter((i) => i.attuned)

  return (
    <>
      <CharacterBand section="Inventory" />

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Attunement</h2>
          <span className="row" style={{ gap: 6 }}>
            {Array.from({ length: ATTUNEMENT_SLOTS }, (_, i) => (
              <span
                key={i}
                className="death-dot"
                style={{
                  background: i < attunedCount ? 'var(--prussian)' : undefined,
                  borderColor: i < attunedCount ? 'var(--prussian)' : undefined,
                }}
              />
            ))}
            <span className="small muted num" style={{ marginLeft: 6 }}>{attunedCount}/{ATTUNEMENT_SLOTS}</span>
          </span>
        </div>
        {attunedItems.length === 0 ? (
          <p className="muted small">Nothing attuned. Mark items below as attuned to fill these slots.</p>
        ) : (
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            {attunedItems.map((i) => <li key={i.id}><strong>{i.name}</strong>{i.notes ? ` — ${i.notes}` : ''}</li>)}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Items</h2>
          <button className="btn small" onClick={addItem}>Add item</button>
        </div>
        {c.inventory.length === 0 ? (
          <div className="empty">
            <div className="display">Empty pack</div>
            <p>Add your gear — weapons, tools, scholarly instruments, and the magic items you find.</p>
          </div>
        ) : (
          <table className="ledger mt">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Equipped</th><th>Attuned</th><th>Notes</th><th></th></tr>
            </thead>
            <tbody>
              {c.inventory.map((i) => (
                <tr key={i.id}>
                  <td style={{ minWidth: 140 }}>
                    <input
                      value={i.name}
                      onChange={(e) => patchItem(i.id, { name: e.target.value })}
                      style={{ border: 'none', background: 'transparent', width: '100%', minHeight: 36, fontWeight: 600 }}
                    />
                  </td>
                  <td><Stepper value={i.qty} onChange={(v) => patchItem(i.id, { qty: v })} min={1} /></td>
                  <td>
                    <input type="checkbox" checked={!!i.equipped} onChange={(e) => patchItem(i.id, { equipped: e.target.checked })} style={{ width: 22, height: 22 }} />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!i.attuned}
                      disabled={!i.attuned && attunedCount >= ATTUNEMENT_SLOTS}
                      onChange={(e) => patchItem(i.id, { attuned: e.target.checked })}
                      style={{ width: 22, height: 22 }}
                    />
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <input
                      value={i.notes ?? ''}
                      placeholder="—"
                      onChange={(e) => patchItem(i.id, { notes: e.target.value })}
                      style={{ border: 'none', background: 'transparent', width: '100%', minHeight: 36, color: 'var(--graphite)' }}
                    />
                  </td>
                  <td className="right">
                    <button className="btn small danger" onClick={() => removeItem(i.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Coin</h2>
        <div className="row" style={{ gap: 24 }}>
          {(['pp', 'gp', 'sp', 'cp'] as const).map((k) => (
            <span key={k} className="row" style={{ gap: 8 }}>
              <span className="eyebrow">{k.toUpperCase()}</span>
              <Stepper value={c.coins[k]} onChange={(v) => updateCharacter(c.id, { coins: { ...c.coins, [k]: v } })} />
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
