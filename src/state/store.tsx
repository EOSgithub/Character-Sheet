// App state: multiple characters persisted to localStorage.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Character } from '../types'

const STORAGE_KEY = 'savant-codex-v1'

export interface AppState {
  characters: Character[]
  activeId: string | null
}

interface StoreValue extends AppState {
  active: Character | null
  createCharacter: (c: Character) => void
  updateCharacter: (id: string, patch: Partial<Character> | ((c: Character) => Partial<Character>)) => void
  deleteCharacter: (id: string) => void
  setActive: (id: string | null) => void
  importCharacter: (c: Character) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (Array.isArray(parsed.characters)) return parsed
    }
  } catch {
    // corrupted storage — start fresh rather than crash
  }
  return { characters: [], activeId: null }
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo<StoreValue>(() => {
    const active = state.characters.find((c) => c.id === state.activeId) ?? null
    return {
      ...state,
      active,
      createCharacter: (c) =>
        setState((s) => ({ characters: [...s.characters, c], activeId: c.id })),
      updateCharacter: (id, patch) =>
        setState((s) => ({
          ...s,
          characters: s.characters.map((c) => {
            if (c.id !== id) return c
            const p = typeof patch === 'function' ? patch(c) : patch
            return { ...c, ...p, updatedAt: new Date().toISOString() }
          }),
        })),
      deleteCharacter: (id) =>
        setState((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      setActive: (id) => setState((s) => ({ ...s, activeId: id })),
      importCharacter: (c) =>
        setState((s) => {
          const exists = s.characters.some((x) => x.id === c.id)
          const imported = exists ? { ...c, id: newId(), name: `${c.name} (imported)` } : c
          return { characters: [...s.characters, imported], activeId: imported.id }
        }),
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext)
  if (!v) throw new Error('useStore must be used within StoreProvider')
  return v
}

export function exportCharacter(c: Character) {
  const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${c.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
