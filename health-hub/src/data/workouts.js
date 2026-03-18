// Push/Pull/Legs/Push/Pull rotating 5-day cycle
export const WORKOUT_CYCLE = ['Push', 'Pull', 'Legs', 'Push', 'Pull']

export const WORKOUT_EXERCISES = {
  Push: [
    { id: 'bench-press', name: 'Bench Press', type: 'Barbell' },
    { id: 'overhead-press', name: 'Overhead Press', type: 'Barbell' },
    { id: 'incline-db-press', name: 'Incline Dumbbell Press', type: 'Dumbbell' },
    { id: 'tricep-pushdowns', name: 'Tricep Pushdowns', type: 'Cable' },
    { id: 'lateral-raises', name: 'Lateral Raises', type: 'Dumbbell' },
    { id: 'chest-flyes', name: 'Chest Flyes', type: 'Dumbbell' },
  ],
  Pull: [
    { id: 'deadlifts', name: 'Deadlifts', type: 'Barbell' },
    { id: 'barbell-rows', name: 'Barbell Rows', type: 'Barbell' },
    { id: 'lat-pulldowns', name: 'Pull-Ups / Lat Pulldowns', type: 'Cable' },
    { id: 'face-pulls', name: 'Face Pulls', type: 'Cable' },
    { id: 'bicep-curls', name: 'Bicep Curls', type: 'Dumbbell' },
    { id: 'rear-delt-flyes', name: 'Rear Delt Flyes', type: 'Dumbbell' },
  ],
  Legs: [
    { id: 'squats', name: 'Squats', type: 'Barbell' },
    { id: 'romanian-deadlifts', name: 'Romanian Deadlifts', type: 'Barbell' },
    { id: 'leg-press', name: 'Leg Press', type: 'Machine' },
    { id: 'leg-curls', name: 'Leg Curls', type: 'Machine' },
    { id: 'calf-raises', name: 'Calf Raises', type: 'Machine' },
    { id: 'lunges', name: 'Lunges', type: 'Dumbbell' },
  ],
}

export const CARDIO_TYPES = ['Running', 'Walking', 'Cycling', 'Rowing', 'Elliptical', 'Jump Rope', 'HIIT', 'Swimming', 'Other']

// Type badge colors
export const TYPE_COLORS = {
  Barbell: 'bg-blue-500/20 text-blue-300',
  Dumbbell: 'bg-purple-500/20 text-purple-300',
  Cable: 'bg-emerald-500/20 text-emerald-300',
  Machine: 'bg-amber-500/20 text-amber-300',
}
