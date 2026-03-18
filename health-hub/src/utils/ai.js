// Rule-based AI recommendation engine

export const getMealInsight = (totals, targets, lastMealType) => {
  const { cal, p, c, f } = totals
  const { calMin, calMax, protein, carbMin, carbMax, fatMin, fatMax } = targets

  const remaining = {
    cal: calMax - cal,
    p: protein - p,
    c: carbMax - c,
    f: fatMax - f,
  }

  const proteinPct = p / protein
  const calPct = cal / calMax
  const carbPct = c / carbMax
  const fatPct = f / fatMax

  // --- Over-limit flags ---
  if (cal > calMax + 300) {
    return { text: `Calories are ${Math.round(cal - calMax)} over today — keep the rest of the day light on carbs and fat.`, type: 'warning' }
  }

  if (f > fatMax * 1.1) {
    return { text: `Fat is running high today (${Math.round(f)}g) — go with chicken breast instead of thighs at dinner.`, type: 'warning' }
  }

  // --- After dinner analysis ---
  if (lastMealType === 'dinner' || lastMealType === 'snack') {
    if (remaining.cal > 400) {
      return { text: `You're ${Math.round(remaining.cal)} calories under for the day — have your shake and a snack to hit your target.`, type: 'info' }
    }
    if (p < 180) {
      return { text: `Protein is at ${Math.round(p)}g — under the 180g minimum. Prioritize a protein shake or chicken before bed.`, type: 'warning' }
    }
    if (c < 130 && calPct < 0.85) {
      return { text: `Carbs are at ${Math.round(c)}g on a training day — add a banana or rice to fuel recovery.`, type: 'warning' }
    }
    if (proteinPct >= 1 && calPct >= 0.9 && calPct <= 1.15) {
      return { text: `Great day — you're on track across all macros. Protein hit, calories dialed in.`, type: 'success' }
    }
  }

  // --- Mid-day insights ---
  if (lastMealType === 'lunch') {
    if (proteinPct >= 0.7 && carbPct < 0.45) {
      return { text: `Protein is strong (${Math.round(p)}g). You're light on carbs — add a banana or rice before your workout.`, type: 'info' }
    }
    if (proteinPct < 0.4) {
      return { text: `Only ${Math.round(p)}g protein midday — front-load a big chicken lunch to stay on track.`, type: 'warning' }
    }
    if (calPct < 0.45) {
      return { text: `You're ${Math.round(remaining.cal)} calories under so far — you'll need a solid dinner to hit your targets.`, type: 'info' }
    }
  }

  // --- After breakfast ---
  if (lastMealType === 'breakfast') {
    if (proteinPct >= 0.3) {
      return { text: `Strong breakfast — ${Math.round(p)}g protein already. Keep the momentum going at lunch.`, type: 'success' }
    }
    return { text: `${Math.round(p)}g protein from breakfast. Aim for a high-protein lunch to stay on track for the day.`, type: 'info' }
  }

  // --- Generic remaining reminder ---
  if (remaining.cal > 0) {
    return {
      text: `${Math.round(remaining.cal)} calories remaining. Need ${Math.round(Math.max(0, remaining.p))}g more protein.`,
      type: 'info'
    }
  }

  return { text: `Macros looking solid today — stay on track!`, type: 'success' }
}

export const getEndOfDayAnalysis = (totals, targets) => {
  const { cal, p, c, f } = totals
  const { calMin, calMax, protein, carbMin, carbMax, fatMin, fatMax } = targets

  const flags = []
  const suggestions = []

  if (p < 180) {
    flags.push(`Protein under 180g (${Math.round(p)}g)`)
    suggestions.push('Add a protein shake or extra chicken tomorrow morning')
  }
  if (c < 130) {
    flags.push(`Carbs under 130g on a training day (${Math.round(c)}g)`)
    suggestions.push('Add jasmine rice or a banana to tomorrow\'s meals')
  }
  if (cal < calMin - 400) {
    flags.push(`Calories more than 400 under target (${Math.round(cal)} vs ${calMin})`)
    suggestions.push('Tomorrow, add a shake and pre-workout snack to hit your target')
  }
  if (cal > calMax + 300) {
    flags.push(`Calories over target by ${Math.round(cal - calMax)}`)
    suggestions.push('Tomorrow, skip the rice cake snack and watch portions at dinner')
  }

  const isOnTrack = flags.length === 0 && p >= protein * 0.9 && cal >= calMin && cal <= calMax + 100

  return { flags, suggestions, isOnTrack }
}

export const getWeightInsight = (currentWeekAvg, lastWeekAvg, weeklyAverages) => {
  const GOAL_MIN = 200
  const GOAL_MAX = 203
  const START = 205

  if (!currentWeekAvg) return null

  const insights = []

  // Goal status
  if (currentWeekAvg >= GOAL_MIN && currentWeekAvg <= GOAL_MAX) {
    insights.push({ text: 'You\'re in your goal range!', type: 'success' })
  } else if (currentWeekAvg < GOAL_MIN) {
    insights.push({ text: `${(currentWeekAvg - GOAL_MIN).toFixed(1)} lbs below goal — consider adding 100–200 calories.`, type: 'warning' })
  } else {
    const toGo = (currentWeekAvg - GOAL_MAX).toFixed(1)
    insights.push({ text: `${toGo} lbs above goal range — stay in a moderate deficit.`, type: 'info' })
  }

  // Rate of loss check
  if (lastWeekAvg && currentWeekAvg < lastWeekAvg) {
    const weeklyLoss = lastWeekAvg - currentWeekAvg
    if (weeklyLoss > 1.0) {
      insights.push({ text: `Losing ${weeklyLoss.toFixed(1)} lbs/week — that's too fast. Risk of muscle loss. Add 200+ calories.`, type: 'error' })
    }
  }

  // Stall check — 3 consecutive weekly averages with no change
  if (weeklyAverages.length >= 3) {
    const last3 = weeklyAverages.slice(-3).map((w) => w.avg)
    const maxDiff = Math.max(...last3) - Math.min(...last3)
    if (maxDiff < 0.3 && currentWeekAvg > GOAL_MAX) {
      insights.push({ text: 'Weight has stalled for 3 weeks — try a small calorie reduction or add cardio.', type: 'warning' })
    }
  }

  return insights
}
