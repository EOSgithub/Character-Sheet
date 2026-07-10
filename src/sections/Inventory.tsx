import { useMemo, useState } from 'react'
import { useStore, newId } from '../state/store'
import type { InventoryItem, ItemCategory } from '../types'
import { ITEM_CATEGORIES } from '../types'
import { Stepper } from './shared'
import Modal from './Modal'

const ATTUNEMENT_SLOTS = 3
const catLabel = (k?: ItemCategory) => ITEM_CATEGORIES.find((c) => c.key === k)?.label ?? 'Gear'
const catGroup = (k?: ItemCategory) => ITEM_CATEGORIES.find((c) => c.key === k)?.group ?? 'Adventuring gear'

export default function Inventory() {
  const { active, updateCharacter } = useStore()
  const [editing, setEditing] = useState<InventoryItem | 'new' | null>(null)
  const [filter, setFilter] = useState<ItemCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  if (!active) return null
  const c = active

  const attunedCount = c.inventory.filter((i) => i.attuned).length
  const totalWeight = c.inventory.reduce((sum, i) => sum + (i.weight ?? 0) * i.qty, 0)
  const itemCount = c.inventory.reduce((sum, i) => sum + i.qty, 0)
  const goldValue = c.coins.pp * 10 + c.coins.gp + c.coins.sp / 10 + c.coins.cp / 100

  function saveItem(item: InventoryItem) {
    const exists = c.inventory.some((i) => i.id === item.id)
    updateCharacter(c.id, {
      inventory: exists ? c.inventory.map((i) => (i.id === item.id ? item : i)) : [...c.inventory, item],
    })
    setEditing(null)
  }
  function removeItem(id: string) {
    updateCharacter(c.id, { inventory: c.inventory.filter((i) => i.id !== id) })
    setEditing(null)
  }

  // categories present, in canonical order, for the filter bar
  const presentCats = ITEM_CATEGORIES.filter((cat) => c.inventory.some((i) => (i.category ?? 'gear') === cat.key))

  const visible = c.inventory.filter((i) =>
    (filter === 'all' || (i.category ?? 'gear') === filter) &&
    (!search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase())),
  )
  const groups = useMemo(() => {
    const byGroup = new Map<string, InventoryItem[]>()
    for (const cat of ITEM_CATEGORIES) byGroup.set(cat.group, [])
    for (const i of visible) byGroup.get(catGroup(i.category))!.push(i)
    return [...byGroup.entries()].filter(([, items]) => items.length > 0)
      .map(([group, items]) => [group, items.sort((a, b) => a.name.localeCompare(b.name))] as const)
  }, [visible])

  return (
    <>

      {/* summary */}
      <div className="inv-summary">
        <div><div className="k">Items carried</div><div className="v">{itemCount}</div></div>
        <div><div className="k">Total weight</div><div className="v">{totalWeight % 1 === 0 ? totalWeight : totalWeight.toFixed(1)}<small> lb</small></div></div>
        <div>
          <div className="k">Attunement</div>
          <div className="attune-track" style={{ marginTop: 4 }}>
            {Array.from({ length: ATTUNEMENT_SLOTS }, (_, i) => (
              <span key={i} className="death-dot" style={{ width: 18, height: 18, background: i < attunedCount ? 'var(--brass)' : undefined, borderColor: i < attunedCount ? 'var(--brass)' : undefined }} />
            ))}
            <span className="num small muted" style={{ marginLeft: 4 }}>{attunedCount}/{ATTUNEMENT_SLOTS}</span>
          </div>
        </div>
      </div>

      {/* coins */}
      <div className="card mt">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Coin purse</h2>
          <span className="small muted num">≈ {goldValue % 1 === 0 ? goldValue : goldValue.toFixed(2)} gp total</span>
        </div>
        <div className="coins">
          {(['pp', 'gp', 'sp', 'cp'] as const).map((k) => (
            <label key={k} className={`coin ${k}`}>
              <span className="denom"><span className="dot" />{k.toUpperCase()}</span>
              <input
                inputMode="numeric"
                value={c.coins[k]}
                onChange={(e) => updateCharacter(c.id, { coins: { ...c.coins, [k]: Math.max(0, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0) } })}
              />
            </label>
          ))}
        </div>
      </div>

      {/* items */}
      <div className="card mt">
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Items</h2>
          <button className="btn small primary" onClick={() => setEditing('new')}>+ Add item</button>
        </div>

        {c.inventory.length === 0 ? (
          <div className="empty">
            <div className="display">Your pack is empty</div>
            <p>Add the gear you carry — weapons, tools, scholarly instruments, and the treasures you find.</p>
            <button className="btn primary" onClick={() => setEditing('new')}>Add your first item</button>
          </div>
        ) : (
          <>
            <div className="inv-tools">
              <button className={`filter-chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>All</button>
              {presentCats.map((cat) => (
                <button key={cat.key} className={`filter-chip${filter === cat.key ? ' on' : ''}`} onClick={() => setFilter(cat.key)}>{cat.group}</button>
              ))}
              <input className="search" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {groups.length === 0 ? (
              <p className="muted small mt">No items match “{search}”.</p>
            ) : groups.map(([group, items]) => (
              <div key={group}>
                <div className="inv-group-head">
                  <h3>{group}</h3>
                  <span className="count">{items.length}</span>
                </div>
                {items.map((i) => (
                  <button key={i.id} className="inv-item" onClick={() => setEditing(i)}>
                    <span className="qty">{i.qty > 1 ? `×${i.qty}` : ''}</span>
                    <span className="body">
                      <span className="nm">
                        {i.name}
                        {i.equipped && <span className="tag equipped">Equipped</span>}
                        {i.attuned && <span className="tag attuned">Attuned</span>}
                      </span>
                      {(i.notes || i.weight) && (
                        <span className="sub">
                          {i.notes}{i.notes && i.weight ? ' · ' : ''}{i.weight ? `${i.weight} lb` : ''}
                        </span>
                      )}
                    </span>
                    <span className="marks"><span className="tag">{catLabel(i.category)}</span></span>
                  </button>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {editing && (
        <ItemModal
          item={editing === 'new' ? null : editing}
          attunementFull={attunedCount >= ATTUNEMENT_SLOTS}
          onSave={saveItem}
          onDelete={editing !== 'new' ? () => removeItem((editing as InventoryItem).id) : undefined}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

/** Add or edit a single item. */
function ItemModal({ item, attunementFull, onSave, onDelete, onClose }: {
  item: InventoryItem | null
  attunementFull: boolean
  onSave: (i: InventoryItem) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<InventoryItem>(
    item ?? { id: newId(), name: '', qty: 1, category: 'gear' },
  )
  const set = (patch: Partial<InventoryItem>) => setDraft((d) => ({ ...d, ...patch }))
  const canSave = draft.name.trim().length > 0
  const canAttune = draft.attuned || !attunementFull

  return (
    <Modal
      open
      onClose={onClose}
      title={item ? 'Edit item' : 'Add item'}
      subtitle={item ? 'Update the details or remove it from your pack.' : 'Record a new piece of gear.'}
      footer={
        <>
          {onDelete && <button className="btn danger" onClick={onDelete}>Delete</button>}
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => onSave({ ...draft, name: draft.name.trim() })}>
            {item ? 'Save changes' : 'Add to pack'}
          </button>
        </>
      }
    >
      <div className="field">
        <label>Name</label>
        <input value={draft.name} placeholder="e.g. Rapier, Potion of Healing…" onChange={(e) => set({ name: e.target.value })} />
      </div>

      <div className="field">
        <label>Type</label>
        <div className="row" style={{ gap: 7 }}>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`filter-chip${(draft.category ?? 'gear') === cat.key ? ' on' : ''}`}
              onClick={() => set({ category: cat.key })}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: 20, marginTop: 14, alignItems: 'flex-end' }}>
        <div className="field">
          <label>Quantity</label>
          <Stepper value={draft.qty} min={1} onChange={(v) => set({ qty: v })} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Weight (lb, each)</label>
          <input
            inputMode="decimal"
            value={draft.weight ?? ''}
            placeholder="—"
            onChange={(e) => set({ weight: e.target.value === '' ? undefined : Math.max(0, parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0) })}
          />
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginTop: 16 }}>
        <button className={`chip${draft.equipped ? ' on' : ''}`} style={{ minHeight: 40 }} onClick={() => set({ equipped: !draft.equipped })}>
          {draft.equipped ? '✓ ' : ''}Equipped
        </button>
        <button
          className={`chip${draft.attuned ? ' on' : ''}`}
          style={{ minHeight: 40 }}
          disabled={!canAttune}
          onClick={() => set({ attuned: !draft.attuned, requiresAttunement: true })}
          title={!canAttune ? 'All attunement slots are full' : undefined}
        >
          {draft.attuned ? '✦ ' : ''}Attuned
        </button>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label>Notes</label>
        <textarea value={draft.notes ?? ''} placeholder="Properties, damage, effects, where you found it…" onChange={(e) => set({ notes: e.target.value })} />
      </div>
    </Modal>
  )
}
