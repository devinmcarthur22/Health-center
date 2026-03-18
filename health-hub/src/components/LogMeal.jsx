import React, { useState, useEffect, useMemo } from 'react'
import { MEAL_TEMPLATES, FOOD_LIBRARY, computeItemMacros, computeTemplateTotals } from '../data/meals.js'
import { getTargets } from '../utils/date.js'

const MEAL_TABS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { key: 'lunch', label: 'Lunch', emoji: '🥗' },
  { key: 'dinner', label: 'Dinner', emoji: '🍽' },
  { key: 'snacks', label: 'Snacks', emoji: '🍎' },
]

// Generate unique IDs for logged items
let _idCounter = Date.now()
const genId = () => `item_${_idCounter++}`

// Convert template items to storable meal items
const templateToItems = (template) =>
  template.items.map((item) => ({
    id: genId(),
    name: item.name,
    qty: item.qty,
    unit: item.unit,
    calPerUnit: item.calPerUnit,
    pPerUnit: item.pPerUnit,
    cPerUnit: item.cPerUnit,
    fPerUnit: item.fPerUnit,
    cal: Math.round(item.qty * item.calPerUnit),
    p: Math.round(item.qty * item.pPerUnit * 10) / 10,
    c: Math.round(item.qty * item.cPerUnit * 10) / 10,
    f: Math.round(item.qty * item.fPerUnit * 10) / 10,
    templateId: template.id,
  }))

// Macro totals from a meal items array
const sumItems = (items) =>
  items.reduce((a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { cal: 0, p: 0, c: 0, f: 0 })

// ─── Template Customize Modal ─────────────────────────────────────
function CustomizeModal({ template, onAdd, onClose }) {
  const [items, setItems] = useState(template.items.map((it) => ({ ...it })))

  const totals = useMemo(() => computeTemplateTotals(items), [items])

  const setQty = (idx, delta) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it
        const step = it.unit === 'oz' ? 1 : it.unit === 'eggs' ? 1 : 0.5
        const newQty = Math.max(step, Math.round((it.qty + delta * step) * 10) / 10)
        return { ...it, qty: newQty }
      })
    )
  }

  const handleAdd = () => {
    const storable = items.map((item) => ({
      id: genId(),
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      calPerUnit: item.calPerUnit,
      pPerUnit: item.pPerUnit,
      cPerUnit: item.cPerUnit,
      fPerUnit: item.fPerUnit,
      cal: Math.round(item.qty * item.calPerUnit),
      p: Math.round(item.qty * item.pPerUnit * 10) / 10,
      c: Math.round(item.qty * item.cPerUnit * 10) / 10,
      f: Math.round(item.qty * item.fPerUnit * 10) / 10,
      templateId: template.id,
    }))
    onAdd(storable)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-zinc-900 rounded-t-3xl border-t border-zinc-800 px-4 pt-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{template.emoji}</span>
          <h3 className="font-bold text-zinc-100 text-lg">{template.name}</h3>
        </div>

        {/* Macro summary */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-zinc-950 rounded-xl">
          {[
            { label: 'Cal', value: Math.round(totals.cal), color: 'text-blue-400' },
            { label: 'Pro', value: Math.round(totals.p) + 'g', color: 'text-emerald-400' },
            { label: 'Carb', value: Math.round(totals.c) + 'g', color: 'text-amber-400' },
            { label: 'Fat', value: Math.round(totals.f) + 'g', color: 'text-orange-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-sm font-bold ${color}`}>{value}</div>
              <div className="text-[10px] text-zinc-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-2 mb-5">
          {items.map((item, idx) => {
            const m = computeItemMacros(item)
            return (
              <div key={idx} className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">{item.name}</div>
                  <div className="text-xs text-zinc-500">{Math.round(m.cal)} cal · {Math.round(m.p)}p · {Math.round(m.c)}c · {Math.round(m.f)}f</div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => setQty(idx, -1)} className="w-7 h-7 flex items-center justify-center bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold active:bg-zinc-600">−</button>
                  <span className="text-sm font-semibold text-zinc-200 min-w-[44px] text-center">
                    {item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} {item.unit}
                  </span>
                  <button onClick={() => setQty(idx, 1)} className="w-7 h-7 flex items-center justify-center bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold active:bg-zinc-600">+</button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-2xl transition-colors"
        >
          Add to Meal
        </button>
      </div>
    </div>
  )
}

// ─── Template Card ────────────────────────────────────────────────
function TemplateCard({ template, onQuickAdd, onCustomize }) {
  const totals = computeTemplateTotals(template.items)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-2 min-w-[150px]">
      <div className="flex items-start justify-between gap-1">
        <div>
          <span className="text-xl block mb-1">{template.emoji}</span>
          <div className="text-sm font-semibold text-zinc-100 leading-tight">{template.name}</div>
        </div>
        <button
          onClick={() => onCustomize(template)}
          className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800 flex-shrink-0"
          title="Customize"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-0.5 text-center">
        <div>
          <div className="text-xs font-bold text-blue-400">{Math.round(totals.cal)}</div>
          <div className="text-[9px] text-zinc-600">cal</div>
        </div>
        <div>
          <div className="text-xs font-bold text-emerald-400">{Math.round(totals.p)}g</div>
          <div className="text-[9px] text-zinc-600">pro</div>
        </div>
        <div>
          <div className="text-xs font-bold text-amber-400">{Math.round(totals.c)}g</div>
          <div className="text-[9px] text-zinc-600">carb</div>
        </div>
        <div>
          <div className="text-xs font-bold text-orange-400">{Math.round(totals.f)}g</div>
          <div className="text-[9px] text-zinc-600">fat</div>
        </div>
      </div>

      <button
        onClick={() => onQuickAdd(template)}
        className="w-full py-2 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors"
      >
        Add Now
      </button>
    </div>
  )
}

// ─── Food Library Item ────────────────────────────────────────────
function FoodItem({ food, onAdd }) {
  const [qty, setQty] = useState(food.defaultQty)

  const cal = Math.round(qty * food.calPerUnit)
  const p = Math.round(qty * food.pPerUnit * 10) / 10
  const c = Math.round(qty * food.cPerUnit * 10) / 10
  const f = Math.round(qty * food.fPerUnit * 10) / 10

  const dec = () => setQty((q) => Math.max(food.step, Math.round((q - food.step) * 10) / 10))
  const inc = () => setQty((q) => Math.round((q + food.step) * 10) / 10)

  const handleAdd = () => {
    onAdd({
      id: genId(),
      name: food.name,
      qty,
      unit: food.unit,
      calPerUnit: food.calPerUnit,
      pPerUnit: food.pPerUnit,
      cPerUnit: food.cPerUnit,
      fPerUnit: food.fPerUnit,
      cal, p, c, f,
    })
    setQty(food.defaultQty) // reset
  }

  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-3.5 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-200">{food.name}</div>
        <div className="text-xs text-zinc-500 mt-0.5">
          <span className="text-blue-400 font-medium">{cal}</span> cal ·&nbsp;
          <span className="text-emerald-400">{p}p</span> ·&nbsp;
          <span className="text-amber-400">{c}c</span> ·&nbsp;
          <span className="text-orange-400">{f}f</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={dec} className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-300 rounded-lg font-bold active:bg-zinc-700">−</button>
        <span className="text-xs font-semibold text-zinc-200 min-w-[48px] text-center">
          {qty % 1 === 0 ? qty : qty.toFixed(1)} {food.unit}
        </span>
        <button onClick={inc} className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-300 rounded-lg font-bold active:bg-zinc-700">+</button>
        <button
          onClick={handleAdd}
          className="ml-1 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-xl text-lg font-bold active:bg-blue-600"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Main LogMeal Component ───────────────────────────────────────
export default function LogMeal({ todayLog, today, addMealItems, removeMealItem, updateMealItem, initialMealType }) {
  const [activeMeal, setActiveMeal] = useState(initialMealType || 'breakfast')
  const [customizeTarget, setCustomizeTarget] = useState(null)
  const [showAllTemplates, setShowAllTemplates] = useState(false)
  const [added, setAdded] = useState(null) // brief "added" flash

  useEffect(() => {
    if (initialMealType) setActiveMeal(initialMealType)
  }, [initialMealType])

  const targets = getTargets(today)
  const allItems = [...todayLog.meals.breakfast, ...todayLog.meals.lunch, ...todayLog.meals.dinner, ...todayLog.meals.snacks]
  const totals = allItems.reduce((a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { cal: 0, p: 0, c: 0, f: 0 })

  // Filter templates by meal or show all
  const relevantTemplates = useMemo(() => {
    if (showAllTemplates) return MEAL_TEMPLATES
    // Show templates for this meal + snacks
    return MEAL_TEMPLATES.filter(
      (t) => t.category === activeMeal || (activeMeal === 'snacks' && t.category === 'snack')
    )
  }, [activeMeal, showAllTemplates])

  // All templates if none match this meal
  const displayTemplates = relevantTemplates.length > 0 ? relevantTemplates : MEAL_TEMPLATES

  const quickAdd = (template) => {
    const items = templateToItems(template)
    addMealItems(activeMeal, items)
    flashAdded(template.name)
  }

  const customizeAdd = (items) => {
    addMealItems(activeMeal, items)
    flashAdded('Meal')
  }

  const flashAdded = (name) => {
    setAdded(name)
    setTimeout(() => setAdded(null), 2000)
  }

  const currentMealItems = todayLog.meals[activeMeal] || []
  const currentMealTotals = currentMealItems.reduce((a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { cal: 0, p: 0, c: 0, f: 0 })

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-zinc-100">Log Meal</h1>
        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
          <span className="text-blue-400 font-medium">{Math.round(totals.cal)} cal</span>
          <span>·</span>
          <span className="text-emerald-400">{Math.round(totals.p)}g protein</span>
          <span>today so far</span>
        </div>
      </div>

      {/* Meal Tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
        {MEAL_TABS.map(({ key, label, emoji }) => {
          const count = todayLog.meals[key]?.length || 0
          return (
            <button
              key={key}
              onClick={() => setActiveMeal(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeMeal === key
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 active:bg-zinc-800'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeMeal === key ? 'bg-white/20 text-white' : 'bg-zinc-700 text-zinc-400'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Current meal summary */}
      {currentMealItems.length > 0 && (
        <div className="mx-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              {MEAL_TABS.find((t) => t.key === activeMeal)?.label} Today
            </span>
            <span className="text-xs text-zinc-500">
              {Math.round(currentMealTotals.cal)} cal · {Math.round(currentMealTotals.p)}p
            </span>
          </div>
          <div className="space-y-1.5">
            {currentMealItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">
                  {item.qty !== 1 ? `${item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} ${item.unit} ` : ''}{item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{Math.round(item.cal)} cal</span>
                  <button
                    onClick={() => removeMealItem(activeMeal, item.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Quick Templates</h2>
          <button
            onClick={() => setShowAllTemplates((v) => !v)}
            className="text-xs text-blue-400 font-medium"
          >
            {showAllTemplates ? 'Show relevant' : 'Show all'}
          </button>
        </div>

        {/* Added flash */}
        {added && (
          <div className="mb-3 py-2 px-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <span>✓</span> {added} added to {MEAL_TABS.find((t) => t.key === activeMeal)?.label}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {displayTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onQuickAdd={quickAdd}
              onCustomize={setCustomizeTarget}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4 border-t border-zinc-800" />

      {/* Food Library */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Food Library</h2>
        <div className="space-y-2">
          {FOOD_LIBRARY.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onAdd={(item) => {
                addMealItems(activeMeal, [item])
                flashAdded(food.name)
              }}
            />
          ))}
        </div>
      </div>

      {/* Customize Modal */}
      {customizeTarget && (
        <CustomizeModal
          template={customizeTarget}
          onAdd={customizeAdd}
          onClose={() => setCustomizeTarget(null)}
        />
      )}
    </div>
  )
}
