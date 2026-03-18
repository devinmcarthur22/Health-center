import React, { useState, useCallback } from 'react'
import Navigation from './components/Navigation.jsx'
import Today from './components/Today.jsx'
import LogMeal from './components/LogMeal.jsx'
import Workouts from './components/Workouts.jsx'
import Weight from './components/Weight.jsx'
import Weekly from './components/Weekly.jsx'
import {
  getAllLogs, saveAllLogs,
  getAllWorkouts, saveAllWorkouts,
  getAllWeights, saveAllWeights,
  getStoredCycleIndex, saveStoredCycleIndex,
  getStoredPRs, saveStoredPRs,
  calcOneRM,
} from './utils/storage.js'
import { getToday } from './utils/date.js'

const EMPTY_LOG = (date) => ({
  date,
  meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
})

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [today] = useState(getToday)

  const [logs, setLogs] = useState(() => getAllLogs())
  const [workouts, setWorkouts] = useState(() => getAllWorkouts())
  const [weights, setWeights] = useState(() => getAllWeights())
  const [cycleIndex, setCycleIndexState] = useState(() => getStoredCycleIndex())
  const [prs, setPRs] = useState(() => getStoredPRs())

  const todayLog = logs[today] || EMPTY_LOG(today)
  const todayWorkout = workouts[today] || null
  const todayWeight = weights[today] || null

  // ─── Meal actions ────────────────────────────────────────────────
  const addMealItems = useCallback((mealType, items) => {
    const log = logs[today] || EMPTY_LOG(today)
    const newLog = {
      ...log,
      meals: {
        ...log.meals,
        [mealType]: [...log.meals[mealType], ...items],
      },
    }
    const newLogs = { ...logs, [today]: newLog }
    setLogs(newLogs)
    saveAllLogs(newLogs)
  }, [logs, today])

  const removeMealItem = useCallback((mealType, itemId) => {
    const log = logs[today] || EMPTY_LOG(today)
    const newLog = {
      ...log,
      meals: {
        ...log.meals,
        [mealType]: log.meals[mealType].filter((i) => i.id !== itemId),
      },
    }
    const newLogs = { ...logs, [today]: newLog }
    setLogs(newLogs)
    saveAllLogs(newLogs)
  }, [logs, today])

  const updateMealItem = useCallback((mealType, itemId, newQty) => {
    const log = logs[today] || EMPTY_LOG(today)
    const newLog = {
      ...log,
      meals: {
        ...log.meals,
        [mealType]: log.meals[mealType].map((item) => {
          if (item.id !== itemId) return item
          return {
            ...item,
            qty: newQty,
            cal: Math.round(newQty * item.calPerUnit),
            p: Math.round(newQty * item.pPerUnit * 10) / 10,
            c: Math.round(newQty * item.cPerUnit * 10) / 10,
            f: Math.round(newQty * item.fPerUnit * 10) / 10,
          }
        }),
      },
    }
    const newLogs = { ...logs, [today]: newLog }
    setLogs(newLogs)
    saveAllLogs(newLogs)
  }, [logs, today])

  // ─── Workout actions ─────────────────────────────────────────────
  const saveWorkout = useCallback((date, workout) => {
    const newWorkouts = { ...workouts, [date]: workout }
    setWorkouts(newWorkouts)
    saveAllWorkouts(newWorkouts)
  }, [workouts])

  const advanceCycle = useCallback(() => {
    const next = (cycleIndex + 1) % 5
    setCycleIndexState(next)
    saveStoredCycleIndex(next)
  }, [cycleIndex])

  const checkAndSavePR = useCallback((exerciseId, weight, reps) => {
    const newOneRM = calcOneRM(weight, reps)
    const existing = prs[exerciseId]
    if (!existing || newOneRM > existing.oneRM) {
      const newPRs = {
        ...prs,
        [exerciseId]: { weight, reps, oneRM: newOneRM, date: today },
      }
      setPRs(newPRs)
      saveStoredPRs(newPRs)
      return true // new PR!
    }
    return false
  }, [prs, today])

  // ─── Weight actions ──────────────────────────────────────────────
  const logWeight = useCallback((date, weight) => {
    const newWeights = { ...weights, [date]: weight }
    setWeights(newWeights)
    saveAllWeights(newWeights)
  }, [weights])

  // ─── Tab change with LogMeal auto-nav ────────────────────────────
  const [logMealTarget, setLogMealTarget] = useState(null)

  const goToLogMeal = useCallback((mealType) => {
    setLogMealTarget(mealType)
    setActiveTab('log')
  }, [])

  const handleTabChange = useCallback((tab) => {
    if (tab !== 'log') setLogMealTarget(null)
    setActiveTab(tab)
  }, [])

  const tabProps = {
    today: {
      todayLog, today,
      workouts, weights,
      cycleIndex, prs,
      goToLogMeal, removeMealItem,
    },
    log: {
      todayLog, today,
      addMealItems, removeMealItem, updateMealItem,
      initialMealType: logMealTarget,
    },
    workouts: {
      today, workouts,
      cycleIndex, prs,
      saveWorkout, advanceCycle, checkAndSavePR,
    },
    weight: {
      today, weights,
      logWeight,
    },
    weekly: {
      today, logs, workouts, weights,
    },
  }

  const COMPONENTS = { today: Today, log: LogMeal, workouts: Workouts, weight: Weight, weekly: Weekly }
  const ActiveComponent = COMPONENTS[activeTab]

  return (
    <div className="flex flex-col min-h-dvh bg-zinc-950 text-zinc-100 max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="tab-content" key={activeTab}>
          <ActiveComponent {...tabProps[activeTab]} />
        </div>
      </div>
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
