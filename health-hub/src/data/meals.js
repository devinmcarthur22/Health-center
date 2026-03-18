// Meal templates — each item has per-unit macros so quantities can be adjusted
export const MEAL_TEMPLATES = [
  {
    id: 'standard-breakfast',
    name: 'Standard Breakfast',
    emoji: '🍳',
    category: 'breakfast',
    items: [
      { name: 'Large Eggs', qty: 5, unit: 'eggs', calPerUnit: 70, pPerUnit: 6, cPerUnit: 0, fPerUnit: 5 },
      { name: '4% Cottage Cheese', qty: 1, unit: '½ cup', calPerUnit: 120, pPerUnit: 12, cPerUnit: 6, fPerUnit: 5 },
      { name: 'Greek Yogurt', qty: 1, unit: '180g', calPerUnit: 95, pPerUnit: 16, cPerUnit: 4.3, fPerUnit: 2.2 },
      { name: 'Blueberries', qty: 1, unit: 'handful', calPerUnit: 40, pPerUnit: 0, cPerUnit: 10, fPerUnit: 0 },
    ],
  },
  {
    id: 'smoothie-breakfast',
    name: 'Smoothie Breakfast',
    emoji: '🥤',
    category: 'breakfast',
    items: [
      { name: 'Frozen Mixed Berries', qty: 1, unit: 'cup', calPerUnit: 70, pPerUnit: 1, cPerUnit: 17, fPerUnit: 0 },
      { name: 'Banana', qty: 1, unit: 'medium', calPerUnit: 105, pPerUnit: 1, cPerUnit: 27, fPerUnit: 0 },
      { name: 'Greek Yogurt', qty: 1, unit: 'cup', calPerUnit: 145, pPerUnit: 22, cPerUnit: 11, fPerUnit: 2 },
    ],
  },
  {
    id: 'standard-lunch',
    name: 'Standard Lunch',
    emoji: '🥗',
    category: 'lunch',
    items: [
      { name: 'Shredded Chicken Breast', qty: 10, unit: 'oz', calPerUnit: 46, pPerUnit: 8.5, cPerUnit: 0, fPerUnit: 0.5 },
      { name: 'Apple', qty: 1, unit: 'medium', calPerUnit: 80, pPerUnit: 0, cPerUnit: 21, fPerUnit: 0 },
    ],
  },
  {
    id: 'chicken-breast-large',
    name: 'Chicken Breast Large',
    emoji: '🍗',
    category: 'lunch',
    items: [
      { name: 'Shredded Chicken Breast', qty: 12, unit: 'oz', calPerUnit: 45.83, pPerUnit: 8.5, cPerUnit: 0, fPerUnit: 0.5 },
    ],
  },
  {
    id: 'standard-dinner',
    name: 'Standard Dinner',
    emoji: '🥩',
    category: 'dinner',
    items: [
      { name: '93/7 Ground Beef', qty: 8, unit: 'oz', calPerUnit: 42.5, pPerUnit: 5.75, cPerUnit: 0, fPerUnit: 2 },
      { name: 'Jasmine Rice (cooked)', qty: 1, unit: 'cup', calPerUnit: 200, pPerUnit: 4, cPerUnit: 44, fPerUnit: 0 },
      { name: 'Brussels Sprouts', qty: 1, unit: 'cup', calPerUnit: 55, pPerUnit: 4, cPerUnit: 11, fPerUnit: 0 },
    ],
  },
  {
    id: 'chicken-thighs',
    name: 'Chicken Thighs',
    emoji: '🍗',
    category: 'dinner',
    items: [
      { name: 'Trimmed Chicken Thighs', qty: 15, unit: 'oz', calPerUnit: 46, pPerUnit: 7, cPerUnit: 0, fPerUnit: 1.47 },
    ],
  },
  {
    id: 'protein-shake',
    name: 'Protein Shake',
    emoji: '💪',
    category: 'snack',
    items: [
      { name: 'Transparent Labs Whey', qty: 1, unit: 'scoop', calPerUnit: 140, pPerUnit: 28, cPerUnit: 3, fPerUnit: 1 },
    ],
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout Snack',
    emoji: '⚡',
    category: 'snack',
    items: [
      { name: 'Banana', qty: 1, unit: 'medium', calPerUnit: 105, pPerUnit: 1, cPerUnit: 27, fPerUnit: 0 },
    ],
  },
  {
    id: 'rice-cake-snack',
    name: 'Rice Cake Snack',
    emoji: '🍙',
    category: 'snack',
    items: [
      { name: 'Rice Cakes', qty: 2, unit: 'cakes', calPerUnit: 40, pPerUnit: 0, cPerUnit: 8, fPerUnit: 0 },
      { name: 'Banana', qty: 1, unit: 'medium', calPerUnit: 105, pPerUnit: 1, cPerUnit: 27, fPerUnit: 0 },
      { name: 'Cashew Butter', qty: 2, unit: 'tbsp', calPerUnit: 95, pPerUnit: 3, cPerUnit: 5, fPerUnit: 8 },
    ],
  },
  {
    id: 'clementines',
    name: '3 Clementines',
    emoji: '🍊',
    category: 'snack',
    items: [
      { name: 'Clementines', qty: 3, unit: 'clementines', calPerUnit: 35, pPerUnit: 0, cPerUnit: 8.67, fPerUnit: 0 },
    ],
  },
]

// Individual food library for custom logging
export const FOOD_LIBRARY = [
  { id: 'large-egg', name: 'Large Egg', unit: 'egg', calPerUnit: 70, pPerUnit: 6, cPerUnit: 0, fPerUnit: 5, defaultQty: 1, step: 1 },
  { id: 'cottage-cheese', name: '4% Cottage Cheese', unit: '½ cup', calPerUnit: 120, pPerUnit: 12, cPerUnit: 6, fPerUnit: 5, defaultQty: 1, step: 0.5 },
  { id: 'greek-yogurt', name: 'Greek Yogurt', unit: '¾ cup', calPerUnit: 90, pPerUnit: 15, cPerUnit: 4, fPerUnit: 2, defaultQty: 1, step: 1 },
  { id: 'chicken-breast', name: 'Shredded Chicken Breast', unit: 'oz', calPerUnit: 46, pPerUnit: 8.5, cPerUnit: 0, fPerUnit: 0.5, defaultQty: 8, step: 1 },
  { id: 'ground-beef', name: '93/7 Ground Beef', unit: 'oz', calPerUnit: 42.5, pPerUnit: 5.75, cPerUnit: 0, fPerUnit: 2, defaultQty: 8, step: 1 },
  { id: 'jasmine-rice', name: 'Jasmine Rice (cooked)', unit: 'cup', calPerUnit: 200, pPerUnit: 4, cPerUnit: 44, fPerUnit: 0, defaultQty: 1, step: 0.5 },
  { id: 'sweet-potato', name: 'Sweet Potato', unit: 'medium', calPerUnit: 130, pPerUnit: 3, cPerUnit: 30, fPerUnit: 0, defaultQty: 1, step: 1 },
  { id: 'brussels-sprouts', name: 'Brussels Sprouts', unit: 'cup', calPerUnit: 55, pPerUnit: 4, cPerUnit: 11, fPerUnit: 0, defaultQty: 1, step: 0.5 },
  { id: 'apple', name: 'Apple', unit: 'medium', calPerUnit: 80, pPerUnit: 0, cPerUnit: 21, fPerUnit: 0, defaultQty: 1, step: 1 },
  { id: 'banana', name: 'Banana', unit: 'medium', calPerUnit: 105, pPerUnit: 1, cPerUnit: 27, fPerUnit: 0, defaultQty: 1, step: 1 },
  { id: 'blueberries', name: 'Blueberries', unit: 'handful', calPerUnit: 40, pPerUnit: 0, cPerUnit: 10, fPerUnit: 0, defaultQty: 1, step: 0.5 },
  { id: 'rice-cake', name: 'Rice Cake', unit: 'cake', calPerUnit: 40, pPerUnit: 0, cPerUnit: 8, fPerUnit: 0, defaultQty: 1, step: 1 },
  { id: 'cashew-butter', name: 'Cashew Butter', unit: 'tbsp', calPerUnit: 95, pPerUnit: 3, cPerUnit: 5, fPerUnit: 8, defaultQty: 1, step: 0.5 },
  { id: 'clementine', name: 'Clementine', unit: 'clementine', calPerUnit: 35, pPerUnit: 0, cPerUnit: 9, fPerUnit: 0, defaultQty: 1, step: 1 },
  { id: 'orange', name: 'Orange', unit: 'medium', calPerUnit: 85, pPerUnit: 0, cPerUnit: 21, fPerUnit: 0, defaultQty: 1, step: 1 },
]

// Compute totals for a list of template items
export const computeItemMacros = (item) => ({
  cal: Math.round(item.qty * item.calPerUnit),
  p: Math.round(item.qty * item.pPerUnit * 10) / 10,
  c: Math.round(item.qty * item.cPerUnit * 10) / 10,
  f: Math.round(item.qty * item.fPerUnit * 10) / 10,
})

export const computeTemplateTotals = (items) => {
  return items.reduce((acc, item) => {
    const m = computeItemMacros(item)
    return { cal: acc.cal + m.cal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }
  }, { cal: 0, p: 0, c: 0, f: 0 })
}
