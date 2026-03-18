import React, { useState, useMemo } from 'react'
import { getTargets, getDayName, formatDisplayDate, isWeighInDay } from '../utils/date.js'
import { getMealInsight, getEndOfDayAnalysis } from '../utils/ai.js'
import { WORKOUT_CYCLE } from '../data/workouts.js'

// ─── Helpers ─────────────────────────────────────────────────────
const sumMacros = (items) =>
  items.reduce((acc, i) => ({ cal: acc.cal + i.cal, p: acc.p + i.p, c: acc.c + i.c, f: acc.f + i.f }), { cal: 0, p: 0, c: 0, f: 0 })

const sumAllMeals = (meals) => {
  const all = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snacks]
  return sumMacros(all)
}

// Progress bar with color coding
const MacroBar = ({ value, target, color, isMin = false }) => {
  const pct = Math.min((value / target) * 100, 100)
  const over = value > target * 1.1
  const near = value > target * 0.88 && !over

  let barColor = color
  if (isMin) {
    barColor = value >= target ? 'bg-emerald-500' : value >= target * 0.75 ? 'bg-amber-500' : 'bg-zinc-600'
  } else {
    if (over) barColor = 'bg-red-500'
    else if (near) barColor = 'bg-amber-500'
    else barColor = color
  }

  return (
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full macro-bar-fill ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// Calorie ring SVG
const CalorieRing = ({ current, target }) => {
  const r = 52
  const cx = 64
  const cy = 64
  const circ = 2 * Math.PI * r
  const pct = Math.min(current / target, 1.08)
  const offset = circ * (1 - pct)

  const color = current > target * 1.12 ? '#ef4444' : current > target * 0.9 ? '#f59e0b' : '#3b82f6'

  return (
    <svg width="128" height="128" className="drop-shadow-lg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth="10" />
      {current > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s' }}
        />
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="system-ui">
        {current}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="system-ui">
        / {target}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="system-ui">
        cal
      </text>
    </svg>
  )
}

// Meal section accordion
const MealSection = ({ title, emoji, items, onAdd, onRemove }) => {
  const [open, setOpen] = useState(true)
  const totals = sumMacros(items)

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="font-semibold text-zinc-100">{title}</span>
          {items.length > 0 && (
            <span className="text-xs text-zinc-500 font-medium">
              {Math.round(totals.cal)} cal · {Math.round(totals.p)}p
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            className="w-7 h-7 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-lg leading-none"
          >
            +
          </button>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-2">
          {items.length === 0 ? (
            <button
              onClick={onAdd}
              className="w-full py-2.5 text-sm text-zinc-600 border border-dashed border-zinc-800 rounded-xl hover:border-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Tap + to add {title.toLowerCase()}
            </button>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">
                    {item.qty !== 1 ? `${item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} ${item.unit} ` : ''}{item.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {Math.round(item.cal)} cal · {Math.round(item.p)}p · {Math.round(item.c)}c · {Math.round(item.f)}f
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="ml-3 w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 flex-shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Insight badge colors
const INSIGHT_STYLES = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
}

export default function Today({ todayLog, today, workouts, weights, cycleIndex, prs, goToLogMeal, removeMealItem }) {
  const targets = getTargets(today)
  const totals = sumAllMeals(todayLog.meals)
  const remaining = {
    cal: targets.calMax - totals.cal,
    p: targets.protein - totals.p,
  }

  const lastMealType = useMemo(() => {
    if (todayLog.meals.snacks.length) return 'snack'
    if (todayLog.meals.dinner.length) return 'dinner'
    if (todayLog.meals.lunch.length) return 'lunch'
    if (todayLog.meals.breakfast.length) return 'breakfast'
    return null
  }, [todayLog.meals])

  const insight = lastMealType
    ? getMealInsight(totals, targets, lastMealType)
    : null

  const endOfDay = lastMealType === 'dinner' || lastMealType === 'snack'
    ? getEndOfDayAnalysis(totals, targets)
    : null

  const todayWorkout = workouts[today]
  const nextWorkoutType = WORKOUT_CYCLE[cycleIndex % 5]
  const todayWeight = weights[today]
  const weighIn = isWeighInDay(today)
  const GOAL_MIN = 200, GOAL_MAX = 203, START = 205

  // Weight color for goal tracking
  const getWeightStatus = (w) => {
    if (!w) return null
    if (w >= GOAL_MIN && w <= GOAL_MAX) return { color: 'text-emerald-400', label: 'In goal range' }
    if (w < GOAL_MIN) return { color: 'text-amber-400', label: 'Below goal' }
    const progress = ((START - w) / (START - GOAL_MAX)) * 100
    if (w > START) return { color: 'text-red-400', label: `${(w - START).toFixed(1)} lbs above start` }
    return { color: 'text-blue-400', label: `${(w - GOAL_MAX).toFixed(1)} lbs from goal` }
  }

  const wStatus = getWeightStatus(todayWeight)

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Devin's Health Hub</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{formatDisplayDate(today)}</p>
        </div>
        {weighIn && !todayWeight && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-center">
            <div className="text-xs font-semibold text-amber-400">⚖ Weigh-in day</div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">Log fasted weight</div>
          </div>
        )}
        {weighIn && todayWeight && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-2.5 py-1.5 text-center">
            <div className="text-xs font-semibold text-emerald-400">{todayWeight} lbs</div>
            <div className={`text-[10px] mt-0.5 ${wStatus?.color || 'text-zinc-500'}`}>{wStatus?.label}</div>
          </div>
        )}
      </div>

      {/* Calorie Hero */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
        <div className="flex items-center gap-5">
          <CalorieRing current={Math.round(totals.cal)} target={targets.calMax} />
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Calories</span>
                <span className={remaining.cal < 0 ? 'text-red-400' : 'text-zinc-400'}>
                  {remaining.cal < 0 ? `+${Math.abs(Math.round(remaining.cal))} over` : `${Math.round(remaining.cal)} left`}
                </span>
              </div>
              <MacroBar value={totals.cal} target={targets.calMax} color="bg-blue-500" />
              <div className="text-xs text-zinc-600 mt-1">Target: {targets.calMin}–{targets.calMax}</div>
            </div>

            {/* Workout info */}
            <div className="pt-1 border-t border-zinc-800">
              {todayWorkout ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  {todayWorkout.type} day logged
                </div>
              ) : (
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-zinc-700 rounded-full" />
                  Next: {nextWorkoutType} day
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Macro Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Protein', value: totals.p, target: targets.protein, color: 'text-emerald-400', barColor: 'bg-emerald-500', isMin: true, unit: 'g' },
          { label: 'Carbs', value: totals.c, target: targets.carbMax, color: 'text-amber-400', barColor: 'bg-amber-500', isMin: false, unit: 'g' },
          { label: 'Fat', value: totals.f, target: targets.fatMax, color: 'text-orange-400', barColor: 'bg-orange-500', isMin: false, unit: 'g' },
        ].map(({ label, value, target, color, barColor, isMin, unit }) => {
          const pct = Math.round((value / target) * 100)
          return (
            <div key={label} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3">
              <div className={`text-lg font-bold ${color}`}>{Math.round(value)}{unit}</div>
              <div className="text-xs text-zinc-500 mb-2">{label}</div>
              <MacroBar value={value} target={target} color={barColor} isMin={isMin} />
              <div className="text-[10px] text-zinc-600 mt-1.5">{pct}% of {target}{unit}</div>
            </div>
          )
        })}
      </div>

      {/* AI Insight */}
      {insight && (
        <div className={`rounded-2xl border p-3.5 ${INSIGHT_STYLES[insight.type]}`}>
          <div className="flex items-start gap-2.5">
            <span className="text-base mt-0.5 flex-shrink-0">
              {insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : insight.type === 'error' ? '🚨' : '💡'}
            </span>
            <p className="text-sm leading-relaxed">{insight.text}</p>
          </div>
        </div>
      )}

      {/* End of day flags */}
      {endOfDay && !endOfDay.isOnTrack && endOfDay.flags.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">📊</span>
            <span className="text-sm font-semibold text-zinc-200">Day Summary</span>
          </div>
          {endOfDay.flags.map((flag, i) => (
            <div key={i} className="text-xs text-amber-400 flex items-center gap-2">
              <span className="w-1 h-1 bg-amber-400 rounded-full flex-shrink-0" />
              {flag}
            </div>
          ))}
          {endOfDay.suggestions.map((s, i) => (
            <div key={i} className="text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-1 h-1 bg-zinc-600 rounded-full flex-shrink-0" />
              {s}
            </div>
          ))}
        </div>
      )}
      {endOfDay?.isOnTrack && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="text-sm font-semibold text-emerald-300">Nailed it today — all macros on target!</span>
          </div>
        </div>
      )}

      {/* Meal Log */}
      <div className="space-y-2.5">
        {[
          { key: 'breakfast', title: 'Breakfast', emoji: '🍳' },
          { key: 'lunch', title: 'Lunch', emoji: '🥗' },
          { key: 'dinner', title: 'Dinner', emoji: '🍽' },
          { key: 'snacks', title: 'Snacks', emoji: '🍎' },
        ].map(({ key, title, emoji }) => (
          <MealSection
            key={key}
            title={title}
            emoji={emoji}
            items={todayLog.meals[key]}
            onAdd={() => goToLogMeal(key)}
            onRemove={(id) => removeMealItem(key, id)}
          />
        ))}
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  )
}
