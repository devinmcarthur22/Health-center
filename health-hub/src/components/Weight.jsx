import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { getToday, isWeighInDay, formatDisplayDate, getShortDayName, getWeeklyAverages, getLastNDays } from '../utils/date.js'
import { getWeightInsight } from '../utils/ai.js'

const GOAL_MIN = 200
const GOAL_MAX = 203
const START_WEIGHT = 205

// ─── Progress Bar toward goal ─────────────────────────────────────
function GoalProgress({ current }) {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const pct = clamp(((START_WEIGHT - current) / (START_WEIGHT - GOAL_MAX)) * 100, 0, 100)
  const inGoal = current >= GOAL_MIN && current <= GOAL_MAX
  const over = current > START_WEIGHT

  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-2">
        <span>Start: {START_WEIGHT} lbs</span>
        <span>Goal: {GOAL_MIN}–{GOAL_MAX} lbs</span>
      </div>
      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${inGoal ? 'bg-emerald-500' : over ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
        {/* Goal zone marker */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-500/20 border-l border-r border-emerald-500/40"
          style={{
            left: `${((START_WEIGHT - GOAL_MAX) / (START_WEIGHT - GOAL_MIN + 2)) * 100}%`,
            right: `${((GOAL_MIN - (GOAL_MIN - 2)) / (START_WEIGHT - GOAL_MIN + 2)) * 100}%`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>{over ? `${(current - START_WEIGHT).toFixed(1)} above start` : `${(START_WEIGHT - current).toFixed(1)} lbs lost`}</span>
        <span className={inGoal ? 'text-emerald-400 font-semibold' : `${Math.max(0, current - GOAL_MAX).toFixed(1)} lbs to go`}>{inGoal ? '✓ In goal range' : `${Math.max(0, current - GOAL_MAX).toFixed(1)} lbs to go`}</span>
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-blue-400">{payload[0].value} lbs</p>
    </div>
  )
}

// ─── Weight log input ─────────────────────────────────────────────
function WeightInput({ onLog, existingWeight }) {
  const [val, setVal] = useState(existingWeight ? String(existingWeight) : '')
  const [logged, setLogged] = useState(!!existingWeight)

  const handleLog = () => {
    const num = parseFloat(val)
    if (isNaN(num) || num < 50 || num > 400) return
    onLog(num)
    setLogged(true)
  }

  if (logged && existingWeight) {
    return (
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
        <div>
          <div className="text-2xl font-bold text-emerald-300">{existingWeight} lbs</div>
          <div className="text-xs text-emerald-500/80 mt-0.5">Logged today ✓</div>
        </div>
        <button
          onClick={() => setLogged(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="text-sm font-semibold text-zinc-300 mb-3">Log Morning Weight</div>
      <div className="text-xs text-zinc-500 mb-3">Fasted, no clothes, first thing in the morning</div>
      <div className="flex gap-2">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="e.g. 203.4"
          step="0.1"
          className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 text-lg font-semibold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-700"
        />
        <span className="flex items-center text-zinc-500 font-medium px-2">lbs</span>
        <button
          onClick={handleLog}
          disabled={!val || isNaN(parseFloat(val))}
          className="px-5 py-3 bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
        >
          Log
        </button>
      </div>
    </div>
  )
}

// ─── Main Weight Component ────────────────────────────────────────
export default function Weight({ today, weights, logWeight }) {
  const todayWeight = weights[today]
  const isWeighIn = isWeighInDay(today)

  // Build weekly averages
  const weeklyAverages = useMemo(() => getWeeklyAverages(weights, 12), [weights])

  // Recent daily entries (last 30 days that have entries)
  const recentEntries = useMemo(() => {
    const days = getLastNDays(30)
    return days
      .filter((d) => weights[d] != null)
      .map((d) => ({
        date: d,
        label: getShortDayName(d) + ' ' + d.slice(5),
        weight: weights[d],
      }))
      .reverse()
      .slice(0, 15)
  }, [weights])

  // This week's average
  const thisWeekEntries = useMemo(() => {
    const days = getLastNDays(7)
    return days.filter((d) => weights[d] != null && isWeighInDay(d)).map((d) => weights[d])
  }, [weights])

  const thisWeekAvg = thisWeekEntries.length > 0
    ? Math.round((thisWeekEntries.reduce((a, b) => a + b, 0) / thisWeekEntries.length) * 10) / 10
    : null

  // Last week's average
  const lastWeekEntries = useMemo(() => {
    const days = getLastNDays(14).slice(0, 7)
    return days.filter((d) => weights[d] != null && isWeighInDay(d)).map((d) => weights[d])
  }, [weights])

  const lastWeekAvg = lastWeekEntries.length > 0
    ? Math.round((lastWeekEntries.reduce((a, b) => a + b, 0) / lastWeekEntries.length) * 10) / 10
    : null

  const weekChange = thisWeekAvg && lastWeekAvg ? Math.round((thisWeekAvg - lastWeekAvg) * 10) / 10 : null

  // AI insights
  const weightInsights = getWeightInsight(thisWeekAvg, lastWeekAvg, weeklyAverages)

  // Chart data
  const chartData = weeklyAverages.map((w) => ({
    week: w.week.slice(5), // MM-DD
    weight: w.avg,
    entries: w.count,
  }))

  // Y-axis domain
  const allWeightVals = weeklyAverages.map((w) => w.avg)
  const minY = allWeightVals.length > 0
    ? Math.floor(Math.min(...allWeightVals, GOAL_MIN) - 1)
    : GOAL_MIN - 2
  const maxY = allWeightVals.length > 0
    ? Math.ceil(Math.max(...allWeightVals, START_WEIGHT) + 1)
    : START_WEIGHT + 2

  const INSIGHT_STYLES = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  }

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Weight Tracker</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{formatDisplayDate(today)}</p>
        </div>
        {isWeighIn && !todayWeight && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-center">
            <div className="text-xs font-semibold text-amber-400">⚖ Weigh-In Day</div>
          </div>
        )}
      </div>

      {/* Weigh-in prompt */}
      {(isWeighIn || true) && (
        <WeightInput
          onLog={(w) => logWeight(today, w)}
          existingWeight={todayWeight}
        />
      )}

      {/* Goal Progress */}
      {thisWeekAvg && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Goal Progress</h2>
            <div className="text-xs text-zinc-500">Goal: {GOAL_MIN}–{GOAL_MAX} lbs</div>
          </div>
          <GoalProgress current={thisWeekAvg} />
        </div>
      )}

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <div className="text-xl font-bold text-zinc-100">{thisWeekAvg ?? '—'}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">This Week Avg</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <div className={`text-xl font-bold ${
            weekChange == null ? 'text-zinc-600' :
            weekChange < 0 ? 'text-emerald-400' :
            weekChange > 0 ? 'text-red-400' :
            'text-zinc-400'
          }`}>
            {weekChange == null ? '—' : weekChange === 0 ? '±0' : `${weekChange > 0 ? '+' : ''}${weekChange}`}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">vs Last Week</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
          <div className="text-xl font-bold text-zinc-100">{thisWeekEntries.length}/3</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Weigh-ins This Wk</div>
        </div>
      </div>

      {/* AI Insights */}
      {weightInsights && weightInsights.length > 0 && (
        <div className="space-y-2">
          {weightInsights.map((ins, i) => (
            <div key={i} className={`rounded-2xl border p-3.5 ${INSIGHT_STYLES[ins.type] || INSIGHT_STYLES.info}`}>
              <div className="flex items-start gap-2">
                <span>{ins.type === 'success' ? '✅' : ins.type === 'error' ? '🚨' : ins.type === 'warning' ? '⚠️' : '💡'}</span>
                <p className="text-sm leading-relaxed">{ins.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trend Chart */}
      {chartData.length >= 2 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Weekly Average Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[minY, maxY]}
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Goal zone */}
              <ReferenceLine y={GOAL_MAX} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={GOAL_MIN} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#60a5fa', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <div className="w-4 h-0.5 bg-blue-500" />
              Weekly avg
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <div className="w-4 h-0.5 bg-emerald-500 opacity-50" style={{ borderTop: '1px dashed #10b981' }} />
              Goal range
            </div>
          </div>
        </div>
      )}

      {/* Recent Log */}
      {recentEntries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Weigh-ins</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentEntries.map(({ date, label, weight }) => {
              const inGoal = weight >= GOAL_MIN && weight <= GOAL_MAX
              const isToday = date === today
              return (
                <div key={date} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-zinc-300">{label}</span>
                    {isToday && <span className="ml-2 text-[10px] text-blue-400 font-medium">Today</span>}
                  </div>
                  <span className={`text-sm font-semibold ${inGoal ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {weight} lbs
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentEntries.length === 0 && !todayWeight && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">⚖️</div>
          <p className="text-zinc-400 font-medium">No weigh-ins logged yet</p>
          <p className="text-zinc-600 text-sm mt-1">Log your first weight above to start tracking</p>
        </div>
      )}

      <div className="h-2" />
    </div>
  )
}
