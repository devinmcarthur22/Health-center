import React, { useState, useMemo, useCallback } from 'react'
import { WORKOUT_CYCLE, WORKOUT_EXERCISES, CARDIO_TYPES, TYPE_COLORS } from '../data/workouts.js'
import { calcOneRM } from '../utils/storage.js'
import { formatDisplayDate } from '../utils/date.js'

// ─── Helpers ──────────────────────────────────────────────────────
let _idCounter = Date.now() + 9000
const genId = () => `w_${_idCounter++}`

const blankSet = () => ({ id: genId(), weight: '', reps: '' })

// Find the last workout of a given type before today
const findPrevWorkout = (workouts, today, type) => {
  const dates = Object.keys(workouts).filter((d) => d < today && workouts[d]?.type === type)
  if (!dates.length) return null
  dates.sort((a, b) => (a > b ? -1 : 1))
  return workouts[dates[0]]
}

// ─── PR Badge ─────────────────────────────────────────────────────
const PRBadge = () => (
  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-500/30">
    🏆 PR
  </span>
)

// ─── Set Row ──────────────────────────────────────────────────────
function SetRow({ setNum, set, prevSet, onUpdate, onRemove, isPR }) {
  return (
    <div className={`flex items-center gap-2 py-1.5 ${isPR ? 'bg-yellow-500/5 -mx-1 px-1 rounded-lg' : ''}`}>
      <span className="text-xs text-zinc-600 w-5 text-center font-medium">{setNum}</span>

      {/* Previous */}
      <div className="w-[68px] text-center">
        {prevSet ? (
          <span className="text-xs text-zinc-600 font-mono">
            {prevSet.weight || '—'}×{prevSet.reps || '—'}
          </span>
        ) : (
          <span className="text-xs text-zinc-800">—</span>
        )}
      </div>

      {/* Weight input */}
      <input
        type="number"
        value={set.weight}
        onChange={(e) => onUpdate({ ...set, weight: e.target.value })}
        placeholder="lbs"
        className="w-[60px] bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs text-center rounded-lg px-1.5 py-2 focus:outline-none focus:border-blue-500 placeholder-zinc-700"
      />

      {/* Reps input */}
      <input
        type="number"
        value={set.reps}
        onChange={(e) => onUpdate({ ...set, reps: e.target.value })}
        placeholder="reps"
        className="w-[52px] bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs text-center rounded-lg px-1.5 py-2 focus:outline-none focus:border-blue-500 placeholder-zinc-700"
      />

      {isPR && <PRBadge />}

      <button
        onClick={onRemove}
        className="ml-auto text-zinc-700 hover:text-red-400 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────
function ExerciseCard({ exercise, sets, prevSets, prs, onSetsChange, checkAndSavePR }) {
  const [newPRs, setNewPRs] = useState({})

  const addSet = () => onSetsChange([...sets, blankSet()])

  const updateSet = (id, updatedSet) => {
    const newSets = sets.map((s) => (s.id === id ? updatedSet : s))
    onSetsChange(newSets)

    // Check PR
    const w = parseFloat(updatedSet.weight)
    const r = parseInt(updatedSet.reps)
    if (w > 0 && r > 0) {
      const isNewPR = checkAndSavePR(exercise.id, w, r)
      if (isNewPR) setNewPRs((prev) => ({ ...prev, [id]: true }))
    }
  }

  const removeSet = (id) => onSetsChange(sets.filter((s) => s.id !== id))

  const currentPR = prs[exercise.id]
  const hasVolume = sets.some((s) => s.weight && s.reps)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-100">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[exercise.type] || 'bg-zinc-700 text-zinc-400'}`}>
              {exercise.type}
            </span>
            {currentPR && (
              <span className="text-[10px] text-zinc-500">
                PR: {currentPR.weight}lbs × {currentPR.reps}
              </span>
            )}
          </div>
        </div>
        {sets.length === 0 && (
          <button
            onClick={addSet}
            className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-xl active:bg-blue-500/30"
          >
            + Set
          </button>
        )}
      </div>

      {sets.length > 0 && (
        <div className="px-4 pb-3">
          {/* Column headers */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-zinc-700 w-5 text-center">Set</span>
            <span className="text-[10px] text-zinc-700 w-[68px] text-center">Previous</span>
            <span className="text-[10px] text-zinc-700 w-[60px] text-center">Weight</span>
            <span className="text-[10px] text-zinc-700 w-[52px] text-center">Reps</span>
          </div>

          <div className="space-y-0.5">
            {sets.map((set, i) => (
              <SetRow
                key={set.id}
                setNum={i + 1}
                set={set}
                prevSet={prevSets?.[i] || null}
                onUpdate={(updated) => updateSet(set.id, updated)}
                onRemove={() => removeSet(set.id)}
                isPR={newPRs[set.id] || false}
              />
            ))}
          </div>

          <button
            onClick={addSet}
            className="mt-2.5 w-full py-2 text-xs text-blue-400 font-medium bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/5 rounded-xl transition-colors"
          >
            + Add Set
          </button>
        </div>
      )}

      {sets.length === 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={addSet}
            className="w-full py-2.5 text-xs text-zinc-600 border border-dashed border-zinc-800 rounded-xl hover:border-zinc-600 hover:text-zinc-400"
          >
            Tap to log sets
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Cardio Section ───────────────────────────────────────────────
function CardioSection({ cardio, onChange }) {
  const [type, setType] = useState('')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const addCardio = () => {
    if (!type || !duration) return
    onChange([...cardio, { id: genId(), type, duration: parseInt(duration), calories: parseInt(calories) || 0 }])
    setType('')
    setDuration('')
    setCalories('')
    setShowAdd(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100">Cardio</h3>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-xl active:bg-blue-500/30"
        >
          + Cardio
        </button>
      </div>

      {cardio.length > 0 && (
        <div className="px-4 space-y-2 mb-3">
          {cardio.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-zinc-200 font-medium">{c.type}</span>
                <span className="text-zinc-500 ml-2">{c.duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                {c.calories > 0 && <span className="text-xs text-blue-400">{c.calories} cal</span>}
                <button
                  onClick={() => onChange(cardio.filter((x) => x.id !== c.id))}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="px-4 pb-3 space-y-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select type...</option>
            {CARDIO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (min)"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-zinc-600"
            />
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Cal burned"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-zinc-600"
            />
          </div>
          <button
            onClick={addCardio}
            disabled={!type || !duration}
            className="w-full py-2.5 bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Add Cardio
          </button>
        </div>
      )}

      {cardio.length === 0 && !showAdd && (
        <div className="px-4 pb-3">
          <p className="text-xs text-zinc-600 text-center py-2">No cardio logged yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Workouts Component ──────────────────────────────────────
export default function Workouts({ today, workouts, cycleIndex, prs, saveWorkout, advanceCycle, checkAndSavePR }) {
  const workoutType = WORKOUT_CYCLE[cycleIndex % 5]
  const exercises = WORKOUT_EXERCISES[workoutType]
  const prevWorkout = useMemo(() => findPrevWorkout(workouts, today, workoutType), [workouts, today, workoutType])

  // Local state for today's workout
  const existingWorkout = workouts[today]
  const [exerciseSets, setExerciseSets] = useState(() => {
    if (existingWorkout?.exercises) return existingWorkout.exercises
    return Object.fromEntries(exercises.map((e) => [e.id, []]))
  })
  const [cardio, setCardio] = useState(existingWorkout?.cardio || [])
  const [saved, setSaved] = useState(!!existingWorkout)
  const [started, setStarted] = useState(!!existingWorkout)

  const handleSetsChange = useCallback((exerciseId, sets) => {
    setExerciseSets((prev) => ({ ...prev, [exerciseId]: sets }))
    setSaved(false)
  }, [])

  const handleCardioChange = useCallback((newCardio) => {
    setCardio(newCardio)
    setSaved(false)
  }, [])

  // Auto-save after any change
  const handleSave = useCallback(() => {
    const workout = {
      date: today,
      type: workoutType,
      cyclePosition: cycleIndex,
      exercises: exerciseSets,
      cardio,
    }
    saveWorkout(today, workout)
    setSaved(true)
  }, [today, workoutType, cycleIndex, exerciseSets, cardio, saveWorkout])

  const handleFinish = () => {
    handleSave()
    advanceCycle()
    setSaved(true)
  }

  // Weekly volume
  const totalVolume = Object.values(exerciseSets).flat().reduce((acc, set) => {
    const w = parseFloat(set.weight) || 0
    const r = parseInt(set.reps) || 0
    return acc + w * r
  }, 0)

  const totalSets = Object.values(exerciseSets).flat().filter((s) => s.weight && s.reps).length

  // Cycle display
  const cycleDisplay = WORKOUT_CYCLE.map((type, i) => ({
    type,
    active: i === cycleIndex % 5,
    label: type === 'Push' ? 'P' : type === 'Pull' ? 'u' : 'L',
    fullLabel: type,
  }))

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-zinc-100">Workouts</h1>
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-500">{formatDisplayDate(today)}</p>
      </div>

      {/* Cycle Indicator */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-zinc-100">{workoutType} Day</div>
            <div className="text-xs text-zinc-500">5-day rotation</div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            workoutType === 'Push' ? 'bg-blue-500/20 text-blue-300' :
            workoutType === 'Pull' ? 'bg-purple-500/20 text-purple-300' :
            'bg-emerald-500/20 text-emerald-300'
          }`}>
            {workoutType}
          </div>
        </div>

        {/* Cycle viz */}
        <div className="flex items-center gap-2">
          {cycleDisplay.map(({ type, active, label }, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-1.5 ${active ? (type === 'Push' ? 'bg-blue-500' : type === 'Pull' ? 'bg-purple-500' : 'bg-emerald-500') : 'bg-zinc-800'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-zinc-200' : 'text-zinc-700'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Previous session info */}
        {prevWorkout && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <span>📅</span>
              <span>Last {workoutType}: {formatDisplayDate(prevWorkout.date)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Volume summary */}
      {started && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{totalSets}</div>
            <div className="text-xs text-zinc-500">Sets Logged</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{totalVolume > 0 ? `${Math.round(totalVolume / 1000 * 10) / 10}k` : '0'}</div>
            <div className="text-xs text-zinc-500">lbs Volume</div>
          </div>
        </div>
      )}

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/20 transition-colors"
        >
          Start {workoutType} Day
        </button>
      ) : (
        <>
          {/* Exercises */}
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                sets={exerciseSets[exercise.id] || []}
                prevSets={prevWorkout?.exercises?.[exercise.id] || null}
                prs={prs}
                onSetsChange={(sets) => handleSetsChange(exercise.id, sets)}
                checkAndSavePR={checkAndSavePR}
              />
            ))}
          </div>

          {/* Cardio */}
          <CardioSection cardio={cardio} onChange={handleCardioChange} />

          {/* Save / Finish */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-2xl transition-colors"
            >
              Save Progress
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Finish Workout ✓
            </button>
          </div>
        </>
      )}

      <div className="h-2" />
    </div>
  )
}
