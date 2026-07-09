import { useState } from 'react'
import Modal from './Modal'

/** A tidy tappable row that opens the feature's full text in a reading modal. */
export default function FeatureRow({ name, meta, text }: { name: string; meta?: string; text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="feature-row" onClick={() => setOpen(true)}>
        <span className="f-name">{name}</span>
        {meta && <span className="f-meta">{meta}</span>}
        <span className="chev" aria-hidden="true">›</span>
      </button>
      {open && (
        <Modal open onClose={() => setOpen(false)} title={name} subtitle={meta}>
          <div className="modal-prose">{text}</div>
        </Modal>
      )}
    </>
  )
}
