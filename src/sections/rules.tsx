// The connected-rules UI: a global side panel that shows any lexicon entry,
// and a text renderer that turns every recognised game term inside rules text
// into a tappable link that pushes the next entry onto the panel's stack —
// so a rules chain can be followed without leaving the sheet.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { findEntryByName, getEntry, mentionRegex, resolveMention } from '../rules/lexicon'

/** What the panel displays. Ad-hoc content (custom feats, item notes) can be
 *  passed directly; strings are lexicon entry ids. */
export interface PanelItem {
  name: string
  meta?: string
  text: string
}

interface RulesCtx {
  open: (item: PanelItem | string) => void
}

const Ctx = createContext<RulesCtx>({ open: () => {} })

export function useRules(): RulesCtx {
  return useContext(Ctx)
}

// ---------------------------------------------------------------------------
// Text rendering with keyword links
// ---------------------------------------------------------------------------

function LinkedLine({ line, excludeName }: { line: string; excludeName?: string }) {
  const { open } = useRules()
  const parts = useMemo(() => {
    const out: (string | { id: string; label: string })[] = []
    const re = mentionRegex()
    let last = 0
    let m: RegExpExecArray | null
    const seen = new Set<string>()
    while ((m = re.exec(line))) {
      const id = resolveMention(m[0])
      if (!id) continue
      const entry = getEntry(id)
      if (!entry) continue
      if (excludeName && entry.name.toLowerCase() === excludeName.toLowerCase()) continue
      // link each term once per line — repeats stay plain to keep prose calm
      if (seen.has(id)) continue
      seen.add(id)
      out.push(line.slice(last, m.index), { id, label: m[0] })
      last = m.index + m[0].length
    }
    out.push(line.slice(last))
    return out
  }, [line, excludeName])

  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          p
        ) : (
          <button key={i} type="button" className="term" onClick={() => open(p.id)}>
            {p.label}
          </button>
        ),
      )}
    </>
  )
}

/**
 * Renders a block of rules text (paragraphs and "• " bullets) with every
 * recognised term linked. `excludeName` suppresses links to the entry being
 * displayed, so a feature never links to itself.
 */
export function RulesText({ text, excludeName, className }: { text: string; excludeName?: string; className?: string }) {
  const blocks = useMemo(() => {
    const lines = text.split('\n')
    const out: ({ kind: 'p'; line: string } | { kind: 'ul'; items: string[] })[] = []
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('• ')) {
        const prev = out[out.length - 1]
        if (prev?.kind === 'ul') prev.items.push(line.slice(2))
        else out.push({ kind: 'ul', items: [line.slice(2)] })
      } else {
        out.push({ kind: 'p', line })
      }
    }
    return out
  }, [text])

  return (
    <div className={`rules-prose${className ? ` ${className}` : ''}`}>
      {blocks.map((b, i) =>
        b.kind === 'p' ? (
          <p key={i}><LinkedLine line={b.line} excludeName={excludeName} /></p>
        ) : (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}><LinkedLine line={item} excludeName={excludeName} /></li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}

/**
 * An inline link to a lexicon entry, for UI labels outside rules text
 * (e.g. the "Predictive Defense" hint on the Battle tab). Renders plain
 * text if the name is unknown, so it is always safe to use.
 */
export function TermLink({ name, children }: { name: string; children?: ReactNode }) {
  const { open } = useRules()
  const entry = findEntryByName(name)
  if (!entry) return <>{children ?? name}</>
  return (
    <button type="button" className="term" onClick={() => open(entry.id)}>
      {children ?? name}
    </button>
  )
}

// ---------------------------------------------------------------------------
// The side panel
// ---------------------------------------------------------------------------

export function RulesPanelProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<PanelItem[]>([])

  const open = useCallback((item: PanelItem | string) => {
    const resolved: PanelItem | undefined = typeof item === 'string' ? getEntry(item) : item
    if (!resolved) return
    setStack((s) => {
      const top = s[s.length - 1]
      // tapping the same term again shouldn't stack duplicates
      if (top && top.name === resolved.name && top.text === resolved.text) return s
      return [...s, resolved]
    })
  }, [])

  const back = useCallback(() => setStack((s) => s.slice(0, -1)), [])
  const close = useCallback(() => setStack([]), [])

  const ctx = useMemo(() => ({ open }), [open])

  useEffect(() => {
    if (stack.length === 0) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [stack.length > 0, close])

  const top = stack[stack.length - 1]

  return (
    <Ctx.Provider value={ctx}>
      {children}
      {top &&
        createPortal(
          <div className="rules-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
            <aside className="rules-drawer" role="dialog" aria-label={top.name}>
              <div className="rules-head">
                {stack.length > 1 ? (
                  <button className="rules-nav" onClick={back} aria-label="Back">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
                    Back
                  </button>
                ) : (
                  <span className="rules-nav-spacer" />
                )}
                <button className="rules-nav rules-x" onClick={close} aria-label="Close">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
              <div className="rules-body">
                <div className="rules-title">{top.name}</div>
                {top.meta && <div className="rules-meta">{top.meta}</div>}
                <RulesText text={top.text} excludeName={top.name} />
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </Ctx.Provider>
  )
}
