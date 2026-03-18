const KEYS = {
  LOGS: 'dhh_logs',
  WORKOUTS: 'dhh_workouts',
  WEIGHTS: 'dhh_weights',
  CYCLE_INDEX: 'dhh_cycle_index',
  PRS: 'dhh_prs',
}

const load = (key, fallback) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Storage write failed', e)
  }
}

// Daily meal logs — keyed by date string YYYY-MM-DD
export const getAllLogs = () => load(KEYS.LOGS, {})

export const saveAllLogs = (logs) => save(KEYS.LOGS, logs)

// Workouts — keyed by date
export const getAllWorkouts = () => load(KEYS.WORKOUTS, {})

export const saveAllWorkouts = (workouts) => save(KEYS.WORKOUTS, workouts)

// Weights — keyed by date, value is weight in lbs
export const getAllWeights = () => load(KEYS.WEIGHTS, {})

export const saveAllWeights = (weights) => save(KEYS.WEIGHTS, weights)

// Workout cycle position (0–4 in the 5-day cycle)
export const getStoredCycleIndex = () => load(KEYS.CYCLE_INDEX, 0)

export const saveStoredCycleIndex = (index) => save(KEYS.CYCLE_INDEX, index)

// Personal records — keyed by exercise id
// Each PR: { weight, reps, oneRM, date }
export const getStoredPRs = () => load(KEYS.PRS, {})

export const saveStoredPRs = (prs) => save(KEYS.PRS, prs)

// Epley 1RM estimate
export const calcOneRM = (weight, reps) => {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}
