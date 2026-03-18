export const getToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const formatDate = (d) => {
  const dt = new Date(d + 'T12:00:00')
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export const getDayOfWeek = (dateStr) => {
  return new Date(dateStr + 'T12:00:00').getDay() // 0=Sun, 6=Sat
}

export const getDayName = (dateStr) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[getDayOfWeek(dateStr)]
}

export const getShortDayName = (dateStr) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[getDayOfWeek(dateStr)]
}

// Mon=1, Wed=3, Fri=5
export const isWeighInDay = (dateStr) => {
  const day = getDayOfWeek(dateStr)
  return day === 1 || day === 3 || day === 5
}

// Macro targets by day of week
// Saturday (6) = dance night = higher target
export const getTargets = (dateStr) => {
  const day = getDayOfWeek(dateStr)
  if (day === 6) {
    return { calMin: 2600, calMax: 2800, protein: 200, carbMin: 175, carbMax: 225, fatMin: 70, fatMax: 80 }
  }
  return { calMin: 2300, calMax: 2400, protein: 200, carbMin: 175, carbMax: 225, fatMin: 70, fatMax: 80 }
}

// Returns array of last N days as date strings (oldest first)
export const getLastNDays = (n = 7) => {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(formatDate(d.toISOString().split('T')[0]))
  }
  return days
}

// Format a date string as "Mon, Mar 17"
export const formatDisplayDate = (dateStr) => {
  const dt = new Date(dateStr + 'T12:00:00')
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Get the Monday of the current week
export const getWeekStart = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return formatDate(d.toISOString().split('T')[0])
}

// Get Mon/Wed/Fri of the week containing dateStr
export const getWeighInDaysOfWeek = (dateStr) => {
  const weekStart = getWeekStart(dateStr)
  const mon = new Date(weekStart + 'T12:00:00')
  const wed = new Date(weekStart + 'T12:00:00')
  const fri = new Date(weekStart + 'T12:00:00')
  wed.setDate(wed.getDate() + 2)
  fri.setDate(fri.getDate() + 4)
  return [
    formatDate(mon.toISOString().split('T')[0]),
    formatDate(wed.toISOString().split('T')[0]),
    formatDate(fri.toISOString().split('T')[0]),
  ]
}

// Get an array of the last N complete weeks (Mon–Fri weigh-in sets)
export const getWeeklyAverages = (allWeights, numWeeks = 10) => {
  const today = getToday()
  const result = []
  for (let w = numWeeks - 1; w >= 0; w--) {
    const d = new Date(today + 'T12:00:00')
    d.setDate(d.getDate() - w * 7)
    const weekDays = getWeighInDaysOfWeek(formatDate(d.toISOString().split('T')[0]))
    const weights = weekDays.map((day) => allWeights[day]).filter(Boolean)
    if (weights.length > 0) {
      const avg = weights.reduce((a, b) => a + b, 0) / weights.length
      result.push({ week: weekDays[0], avg: Math.round(avg * 10) / 10, count: weights.length })
    }
  }
  return result
}
