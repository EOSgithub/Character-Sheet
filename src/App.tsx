import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Home from './sections/Home'
import CharacterSheet, { CharacterSheetIndex } from './sections/CharacterSheet'
import Abilities from './sections/Abilities'
import Battle from './sections/Battle'
import Features from './sections/Features'
import Inventory from './sections/Inventory'
import Compendium from './sections/Compendium'
import Wizard from './sections/Wizard'
import LevelUp from './sections/LevelUp'
import { Reticle } from './sections/CharacterBand'

const ICONS = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  sheet: <path d="M6.5 3.5h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1ZM9 8h6M9 12h6M9 16h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  compendium: <path d="M12 6c-1.8-1.6-4.2-2-8-2v14c3.8 0 6.2.4 8 2 1.8-1.6 4.2-2 8-2V4c-3.8 0-6.2.4-8 2Zm0 0v14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
}

function Tab({ to, icon, label, end }: { to: string; icon: keyof typeof ICONS; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[icon]}</svg>
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand">
          <Reticle className="mark" />
          <span className="word">Savant<br />Codex</span>
        </div>
        <nav>
          <Tab to="/" icon="home" label="Home" end />
          <Tab to="/sheet" icon="sheet" label="Character" />
          <Tab to="/compendium" icon="compendium" label="Compendium" />
        </nav>
      </aside>
      <main className="main">
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sheet" element={<CharacterSheet />}>
              <Route index element={<CharacterSheetIndex />} />
              <Route path="abilities" element={<Abilities />} />
              <Route path="battle" element={<Battle />} />
              <Route path="features" element={<Features />} />
              <Route path="inventory" element={<Inventory />} />
            </Route>
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
