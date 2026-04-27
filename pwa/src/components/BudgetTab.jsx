import React, { useState, useMemo } from 'react'
import { CATEGORIES } from '../lib/categories.js'
import { formatFCFA, getCurrentMonth, monthPrefix, monthLabel } from '../lib/utils.js'
import BudgetModal from './BudgetModal.jsx'

export default function BudgetTab({ depenses, budgets, onUpdateBudgets }) {
  const [showModal, setShowModal] = useState(false)
  const { mois, annee }           = getCurrentMonth()

  const budgetData = useMemo(() => {
    const monthExp = depenses.filter((d) => d.date.startsWith(monthPrefix(mois, annee)))
    return CATEGORIES.map((cat) => {
      const spent  = monthExp.filter((d) => d.categorie === cat.id).reduce((s, d) => s + d.montant, 0)
      const budget = budgets[`${cat.id}_${mois}_${annee}`]?.montant_max || 0
      const pct    = budget > 0 ? (spent / budget) * 100 : 0
      const color  = pct >= 100 ? '#E74C3C' : pct >= 80 ? '#F39C12' : '#27AE60'
      return { ...cat, spent, budget, pct, color }
    })
  }, [depenses, budgets, mois, annee])

  const alerts = budgetData.filter((b) => b.budget > 0 && b.pct >= 80)
  const over   = alerts.filter((b) => b.pct >= 100)

  return (
    <div className="pb-safe">
      <div className="bg-[#27AE60] px-4 pt-4 pb-4">
        <h2 className="text-lg font-bold text-white">💰 Budgets</h2>
        <p className="text-sm text-white/70 capitalize">{monthLabel(mois, annee)}</p>
      </div>

      {/* Alert banner */}
      {over.length > 0 && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <span className="text-lg">🔴</span>
          <p className="text-sm text-red-700 font-medium">
            {over.map((b) => b.label).join(', ')} : budget dépassé !
          </p>
        </div>
      )}
      {over.length === 0 && alerts.length > 0 && (
        <div className="mx-4 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
          <span className="text-lg">🟠</span>
          <p className="text-sm text-orange-700 font-medium">
            {alerts.map((b) => b.label).join(', ')} approchent de la limite
          </p>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {budgetData.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#2C3E50]">
                {item.emoji} {item.label}
              </span>
              {item.budget > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: item.color,
                    backgroundColor: item.color + '18'
                  }}
                >
                  {item.pct.toFixed(0)}%
                </span>
              )}
            </div>

            <div className="flex justify-between text-xs text-[#7F8C8D] mb-1.5">
              <span>
                Dépensé : <strong className="text-[#2C3E50]">{formatFCFA(item.spent)}</strong>
              </span>
              <span>
                Budget : <strong className="text-[#2C3E50]">
                  {item.budget > 0 ? formatFCFA(item.budget) : '—'}
                </strong>
              </span>
            </div>

            {item.budget > 0 && (
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width:           `${Math.min(item.pct, 100)}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            )}
            {item.pct >= 100 && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                Dépassement : +{formatFCFA(item.spent - item.budget)}
              </p>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className="bg-white border-2 border-[#27AE60] text-[#27AE60] rounded-xl py-3.5 font-bold text-sm shadow-sm mt-1"
        >
          ⚙️ Modifier les budgets
        </button>
      </div>

      {showModal && (
        <BudgetModal
          budgets={budgets}
          mois={mois}
          annee={annee}
          onClose={() => setShowModal(false)}
          onSave={(newBudgets) => { onUpdateBudgets(newBudgets); setShowModal(false) }}
        />
      )}
    </div>
  )
}
