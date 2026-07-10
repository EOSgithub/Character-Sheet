import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../state/store'
import CharacterBand from './CharacterBand'
import { NoCharacter, PageHead } from './shared'

const SUBTABS = [
  { path: 'abilities', label: 'Abilities' },
  { path: 'battle', label: 'Battle' },
  { path: 'features', label: 'Features' },
  { path: 'inventory', label: 'Inventory' },
] as const

/**
 * The unified Character Sheet page: one persistent CharacterBand plus a
 * segmented control that swaps between the Abilities / Battle / Features /
 * Inventory sub-sections (rendered through <Outlet />). All four work on the
 * single active character.
 */
export default function CharacterSheet() {
  const { active } = useStore()
  const location = useLocation()

  if (!active) return <><PageHead title="Character Sheet" /><NoCharacter /></>

  const current = SUBTABS.find((t) => location.pathname.endsWith(`/${t.path}`)) ?? SUBTABS[0]

  return (
    <>
      <CharacterBand section={current.label} />

      <nav className="subtabs" aria-label="Character sheet sections">
        {SUBTABS.map((t) => (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) => `subtab${isActive ? ' active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </>
  )
}

export { SUBTABS }
export const CharacterSheetIndex = () => <Navigate to="abilities" replace />
