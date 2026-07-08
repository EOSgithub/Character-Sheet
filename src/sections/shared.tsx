import { Link } from 'react-router-dom'

export function NoCharacter() {
  return (
    <div className="empty card">
      <div className="display">No character selected</div>
      <p>Choose a character on the Home page, or create a new one.</p>
      <Link to="/" className="btn">Go to Home</Link>
    </div>
  )
}

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {sub && <span className="sub">{sub}</span>}
    </div>
  )
}

export function Stepper({ value, onChange, min = 0, max = 999 }: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <span className="row" style={{ gap: 6 }}>
      <button className="step-btn" aria-label="decrease" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="num" style={{ fontSize: 22, minWidth: 44, textAlign: 'center' }}>{value}</span>
      <button className="step-btn" aria-label="increase" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </span>
  )
}
