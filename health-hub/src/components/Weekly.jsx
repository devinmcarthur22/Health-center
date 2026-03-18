import React, { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { getLastNDays, getTargets, getShortDayName, formatDisplayDate, isWeighInDay } from '../utils/date.js'

// ─── Helpers ──────────────────────────────────────────────────────
const sumMeals = (meals) => {
  const all = [...(meals.breakfast || []), ...(meals.lunch || []), ...(meals.dinner || []), ...(meals.snacks || [])]
  return all.reduce((acc, i) => ({ cal: acc.cal + i.cal, p: acc.p + i.p, c: acc.c + i.c, f: acc.f + i.f }), { cal: 0, p: 0, c: 0, f: 0 })
}

const avg = (arr) => arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)

// ─── Custom Tooltip ───────────────────────────────────────────────
const CalTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-blue-400">{val ? `${val} cal` : 'Not logged'}</p>
    </div>
  )
}

// ─── Streak computation ───────────────────────────────────────────
const computeStreak = (logs, today) => {
  let streak = 0
  const days = getLastNDays(60).reverse()
  for (const d of days) {
    const log = logs[d]
    if (!log) break
    const all = [...log.meals.breakfast, ...log.meals.lunch, ...log.meals.dinner, ...log.meals.snacks]
    if (all.length === 0) break
    streak++
  }
  return streak
}

// ─── Main Weekly Component ────────────────────────────────────────
export default function Weekly({ today, logs, workouts, weights }) {
  const last7 = useMemo(() => getLastNDays(7), [])
  const last14 = useMemo(() => getLastNDays(14), [])

  // Build 7-day nutrition chart data
  const weekData = useMemo(() =>
    last7.map((date) => {
      const log = logs[date]
      const targets = getTargets(date)
      const totals = log ? sumMeals(log.meals) : null
      const hasData = totals && (totals.cal > 0 || totals.p > 0)
      return {
        date,
        day: getShortDayName(date),
        cal: hasData ? Math.round(totals.cal) : null,
        protein: hasData ? Math.round(totals.p) : null,
        carbs: hasData ? Math.round(totals.c) : null,
        fat: hasData ? Math.round(totals.f) : null,
        calTarget: targets.calMax,
        onTarget: hasData && totals.cal >= targets.calMin && totals.cal <= targets.calMax + 200,
        over: hasData && totals.cal > targets.calMax + 300,
        logged: !!hasData,
      }
    }), [last7, logs])

  // 7-day averages (only logged days)
  const loggedDays = weekData.filter((d) => d.logged)
  const avgCal = avg(loggedDays.map((d) => d.cal))
  const avgProtein = avg(loggedDays.map((d) => d.protein))
  const avgCarbs = avg(loggedDays.map((d) => d.carbs))
  const avgFat = avg(loggedDays.map((d) => d.fat))

  // Days on target / over / under
  const daysOnTarget = loggedDays.filter((d) => d.onTarget).length
  const daysOver = loggedDays.filter((d) => d.over).length
  const daysUnder = loggedDays.filter((d) => d.logged && !d.onTarget && !d.over).length

  // Previous 7 days for comparison
  const prev7 = last14.slice(0, 7)
  const prevData = prev7.map((date) => {
    const log = logs[date]
    const totals = log ? sumMeals(log.meals) : null
    return totals && totals.cal > 0 ? totals : null
  }).filter(Boolean)

  const prevAvgCal = avg(prevData.map((t) => Math.round(t.cal)))
  const prevAvgProtein = avg(prevData.map((t) => Math.round(t.p)))
  const calChange = prevAvgCal > 0 ? Math.round(avgCal - prevAvgCal) : null
  const proteinChange = prevAvgProtein > 0 ? Math.round(avgProtein - prevAvgProtein) : null

  // Streak
  const streak = useMemo(() => computeStreak(logs, today), [logs, today])

  // Workout summary
  const weekWorkouts = useMemo(() => {
    return last7.map((d) => workouts[d]).filter(Boolean)
  }, [last7, workouts])

  const totalVolume = weekWorkouts.reduce((acc, w) => {
    const vol = Object.values(w.exercises || {}).flat().reduce((a, s) => {
      return a + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)
    }, 0)
    return acc + vol
  }, 0)

  const totalCardio = weekWorkouts.reduce((acc, w) => acc + (w.cardio?.length || 0), 0)
  const workoutTypes = weekWorkouts.map((w) => w.type)

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Weekly Summary</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Last 7 days</p>
      </div>

      {/* Streak + Days logged */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl">🔥</span>
            <span className="text-2xl font-bold text-orange-400">{streak}</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Day Streak</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{loggedDays.length}/7</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Days Logged</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{weekWorkouts.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Workouts</div>
        </div>
      </div>

      {/* 7-day calorie chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-300">Calorie Trend</h2>
          <div className="text-xs text-zinc-500">Target: 2,300–2,400</div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CalTooltip />} />
            <ReferenceLine y={2300} stroke="#3b82f6" strokeDasharray="4 3" strokeOpacity={0.4} />
            <ReferenceLine y={2400} stroke="#f59e0b" strokeDasharray="4 3" strokeOpacity={0.4} />
            <Bar dataKey="cal" radius={[4, 4, 0, 0]}>
              {weekData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={!entry.logged ? '#27272a' : entry.over ? '#ef4444' : entry.onTarget ? '#3b82f6' : '#6366f1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Day dots summary */}
        <div className="flex justify-between mt-3">
          {weekData.map(({ day, logged, onTarget, over, date }) => (
            <div key={date} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                !logged ? 'bg-zinc-800' :
                over ? 'bg-red-500' :
                onTarget ? 'bg-emerald-500' :
                'bg-amber-500'
              }`} />
              <span className="text-[9px] text-zinc-700">{day}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2">
          {[
            { color: 'bg-emerald-500', label: 'On target' },
            { color: 'bg-amber-500', label: 'Under' },
            { color: 'bg-red-500', label: 'Over' },
            { color: 'bg-zinc-800', label: 'Not logged' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1 text-[10px] text-zinc-600">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Avg macros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">7-Day Averages</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Calories', value: avgCal, change: calChange, color: 'text-blue-400', unit: '' },
            { label: 'Protein', value: avgProtein, change: proteinChange, color: 'text-emerald-400', unit: 'g' },
            { label: 'Carbs', value: avgCarbs, color: 'text-amber-400', unit: 'g' },
            { label: 'Fat', value: avgFat, color: 'text-orange-400', unit: 'g' },
          ].map(({ label, value, change, color, unit }) => (
            <div key={label} className="text-center">
              <div className={`text-base font-bold ${color}`}>{value || '—'}{unit}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{label}</div>
              {change != null && (
                <div className={`text-[10px] font-medium mt-0.5 ${change < 0 ? 'text-emerald-400' : change > 0 ? 'text-red-400' : 'text-zinc-600'}`}>
                  {change > 0 ? '+' : ''}{change}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Week comparison */}
        {(calChange != null || proteinChange != null) && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 text-center">vs previous week</div>
          </div>
        )}
      </div>

      {/* Target summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Days vs Target</h2>
        <div className="flex items-center gap-3">
          {[
            { count: daysOnTarget, label: 'On Target', color: 'bg-emerald-500' },
            { count: daysUnder, label: 'Under', color: 'bg-amber-500' },
            { count: daysOver, label: 'Over', color: 'bg-red-500' },
            { count: 7 - loggedDays.length, label: 'Not Logged', color: 'bg-zinc-800' },
          ].map(({ count, label, color }) => (
            <div key={label} className="flex-1 text-center">
              <div className={`text-xl font-bold ${color.replace('bg-', 'text-').replace('-500', '-400').replace('-800', '-600')}`}>
                {count}
              </div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Workout Summary</h2>
        {weekWorkouts.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-2">No workouts logged this week</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{weekWorkouts.length}</div>
                <div className="text-[10px] text-zinc-600">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : '—'}
                </div>
                <div className="text-[10px] text-zinc-600">lbs Volume</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">{totalCardio}</div>
                <div className="text-[10px] text-zinc-600">Cardio Sessions</div>
              </div>
            </div>

            {/* Workout type breakdown */}
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map((type, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                    type === 'Push' ? 'bg-blue-500/20 text-blue-300' :
                    type === 'Pull' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {type}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="h-2" />
    </div>
  )
}
