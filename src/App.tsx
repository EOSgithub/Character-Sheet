import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Home from './sections/Home'
import Abilities from './sections/Abilities'
import Battle from './sections/Battle'
import Features from './sections/Features'
import Inventory from './sections/Inventory'
import Compendium from './sections/Compendium'
import Wizard from './sections/Wizard'
import LevelUp from './sections/LevelUp'

const ICONS = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  abilities: <path d="M12 3v18M4 8h16M6.5 13h11M8.5 18h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  battle: <path d="m5 19 6-6M5 19l-1.5 1.5M5 19l-2-.5.5-2L14 6l3-1 2 2-1 3L7.5 20.5l-2-.5ZM15 15l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  features: <path d="M6 4h10.5A1.5 1.5 0 0 1 18 5.5V20H7a1.5 1.5 0 0 0-1.5 1.5M6 4a1.5 1.5 0 0 0-1.5 1.5v16M6 4v13.5M9.5 8.5h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  inventory: <path d="M4 8h16v11H4zM4 8l2-4h12l2 4M10 12h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  compendium: <path d="M12 6c-1.8-1.6-4.2-2-8-2v14c3.8 0 6.2.4 8 2 1.8-1.6 4.2-2 8-2V4c-3.8 0-6.2.4-8 2Zm0 0v14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
}

function Tab({ to, icon, label }: { to: string; icon: keyof typeof ICONS; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[icon]}</svg>
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand">Savant<br />Codex</div>
        <nav>
          <Tab to="/" icon="home" label="Home" />
          <Tab to="/abilities" icon="abilities" label="Abilities" />
          <Tab to="/battle" icon="battle" label="Battle" />
          <Tab to="/features" icon="features" label="Features" />
          <Tab to="/inventory" icon="inventory" label="Inventory" />
          <Tab to="/compendium" icon="compendium" label="Compendium" />
        </nav>
      </aside>
      <main className="main">
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/abilities" element={<Abilities />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/features" element={<Features />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/compendium" element={<Compendium />} />
            <Route path="/new" element={<Wizard />} />
            <Route path="/level-up" element={<LevelUp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
