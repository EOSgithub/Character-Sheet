import { useRules } from './rules'
import { findEntryByName } from '../rules/lexicon'

/** A tidy tappable row that opens the feature's full text in the rules panel,
 *  where every game term inside it is itself tappable. */
export default function FeatureRow({ name, meta, text }: { name: string; meta?: string; text: string }) {
  const { open } = useRules()
  const entry = findEntryByName(name)
  return (
    <button
      className="feature-row"
      onClick={() => open({ name, meta: meta ?? entry?.meta, text })}
    >
      <span className="f-name">{name}</span>
      {meta && <span className="f-meta">{meta}</span>}
      <span className="chev" aria-hidden="true">›</span>
    </button>
  )
}
