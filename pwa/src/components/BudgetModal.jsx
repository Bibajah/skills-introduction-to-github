import React, { useState, useEffect } from 'react'
import { CATEGORIES } from '../lib/categories.js'
import { formatFCFA } from '../lib/utils.js'

export default function BudgetModal({ budgets, mois, annee, onClose, onSave }) {
  const [values, setValues] = useState({})

  useEffect(() => {
    const initial = {}
    CATEGORIES.forEach((cat) => {
      const key = `${cat.id}_${mois}_${annee}`
      initial[cat.id] = budgets[key]?.montant_max > 0 ? String(budgets[key].montant_max) : ''
    })
    setValues(initial)
  }, [budgets, mois, annee])

  function handleSave() {
    const newBudgets = { ...budgets }
    CATEGORIES.forEach((cat) => {
      const key = `${cat.id}_${mois}_${annee}`
      const val = parseInt(values[cat.id] || '0', 10)
      if (val > 0) {
        newBudgets[key] = { categorie: cat.id, mois, annee, montant_max: val }
      } else {
        delete newBudgets[key]
      }
    })
    onSave(newBudgets)
  }

  const monthName = new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <h2 className="text-lg font-bold text-[#2C3E50]">⚙️ Définir budgets</h2>
            <p className="text-sm text-[#7F8C8D] capitalize">{monthName}</p>
          </div>
          <button onClick={onClose} className="text-[#7F8C8D] text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{cat.emoji}</span>
              <span className="flex-1 text-sm font-medium text-[#2C3E50]">{cat.label}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  value={values[cat.id] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [cat.id]: e.target.value }))}
                  placeholder="0"
                  className="w-28 border border-gray-300 rounded-lg px-2 py-2 text-sm text-[#2C3E50] text-right"
                />
                <span className="text-xs text-[#7F8C8D]">FCFA</span>
              </div>
            </div>
          ))}

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-xl py-3.5 font-semibold text-[#7F8C8D] text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] bg-[#27AE60] text-white rounded-xl py-3.5 font-bold text-sm"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
