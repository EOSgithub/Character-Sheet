// What each Savant level grants and which choices it requires.

import type { Character } from '../types'
import {
  SAVANT_TABLE, SAVANT_FEATURES, PURSUIT_LEVELS, ASI_LEVELS,
  getDiscipline,
} from '../data/savant'
import type { FeatureDef } from '../data/savant'

export interface LevelGains {
  level: number
  features: FeatureDef[]
  disciplineFeatures: FeatureDef[]
  needsPursuit: boolean
  needsDiscipline: boolean
  needsASI: boolean
  /** discipline option picks due at this level (runes etc.) */
  optionPicks: number
  /** discipline-granted pursuit arriving at this level, if any */
  grantedPursuit?: { pursuit: string; alternatives: string[] }
  intellectDieChanged: boolean
}

export function gainsForLevel(c: Character, level: number): LevelGains {
  const row = SAVANT_TABLE[level - 1]
  const prev = level > 1 ? SAVANT_TABLE[level - 2] : null
  const features = SAVANT_FEATURES.filter((f) => f.level === level)
  const dKey = level >= 3 ? (c.choices[3]?.discipline ?? undefined) : undefined
  const discipline = getDiscipline(dKey)
  const disciplineFeatures = discipline ? discipline.features.filter((f) => f.level === level) : []

  let optionPicks = 0
  if (discipline?.options) {
    if (level === 3) optionPicks = discipline.options.initial
    else if (discipline.options.moreAt.includes(level)) optionPicks = 1
  }

  const grantedPursuit =
    discipline?.grantsPursuit && discipline.grantsPursuit.level === level
      ? { pursuit: discipline.grantsPursuit.pursuit, alternatives: discipline.grantsPursuit.alternatives }
      : undefined

  return {
    level,
    features,
    disciplineFeatures,
    needsPursuit: PURSUIT_LEVELS.includes(level),
    needsDiscipline: level === 3,
    needsASI: ASI_LEVELS.includes(level),
    optionPicks,
    grantedPursuit,
    intellectDieChanged: !!row.intellectDie && row.intellectDie !== prev?.intellectDie,
  }
}

/** True if the recorded choices for `level` satisfy everything that level requires. */
export function levelComplete(c: Character, level: number): boolean {
  const g = gainsForLevel(c, level)
  const ch = c.choices[level]
  if (g.needsDiscipline && !ch?.discipline) return false
  if (g.needsPursuit && (ch?.pursuits?.length ?? 0) < 1) return false
  if (g.needsASI && !ch?.asi && !ch?.feat) return false
  if (g.optionPicks > 0 && (ch?.disciplineOptions?.length ?? 0) < g.optionPicks) return false
  if (level >= 2 && ch?.hp === undefined) return false
  return true
}

/** Levels (≤ current) that still have unresolved choices. */
export function pendingLevels(c: Character): number[] {
  const out: number[] = []
  for (let lv = 1; lv <= c.level; lv++) {
    if (lv >= 2 && !levelComplete(c, lv)) out.push(lv)
  }
  return out
}
