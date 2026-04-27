import React, { useMemo } from 'react'
import { CATEGORIES, getCat } from '../lib/categories.js'
import { formatFCFA, filterByMonth, getCurrentMonth, todayISO } from '../lib/utils.js'

export default function HomeTab({ depenses, budgets, onOpenModal }) {
  const { mois, annee } = getCurrentMonth()
  const today = todayISO()

  const monthExpenses = useMemo(
    () => filterByMonth(depenses, mois, annee),
    [depenses, mois, annee]
  )
  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, d) => s + d.montant, 0),
    [monthExpenses]
  )
  const todayTotal = useMemo(
    () => depenses.filter((d) => d.date === today).reduce((s, d) => s + d.montant, 0),
    [depenses, today]
  )
  const budgetTotal = useMemo(
    () => CATEGORIES.reduce((s, c) => s + (budgets[`${c.id}_${mois}_${annee}`]?.montant_max || 0), 0),
    [budgets, mois, annee]
  )

  const budgetPct    = budgetTotal > 0 ? Math.min((monthTotal / budgetTotal) * 100, 100) : 0
  const budgetColor  = budgetPct >= 90 ? '#E74C3C' : budgetPct >= 70 ? '#F39C12' : '#27AE60'
  const recent       = depenses.slice(0, 5)

  const monthName = new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric'
  })

  return (
    <div className="p-4 pb-safe flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#2C3E50]">🌾 Suivi Dépenses</h1>
          <p className="text-sm text-[#7F8C8D] capitalize">{monthName}</p>
        </div>
        <button
          onClick={() => onOpenModal(null)}
          className="bg-[#27AE60] text-white w-12 h-12 rounded-full text-2xl flex items-center justify-center shadow-lg"
        >
          +
        </button>
      </div>

      {/* Total mois */}
      <div className="bg-[#27AE60] rounded-2xl p-5 text-white">
        <p className="text-sm text-white/70 mb-1">💰 Total du mois</p>
        <p className="text-3xl font-black tracking-tight">{formatFCFA(monthTotal)}</p>
        <p className="text-sm text-white/60 mt-1">
          {monthExpenses.length} dépense{monthExpenses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#7F8C8D] mb-1">📅 Aujourd'hui</p>
          <p className="text-base font-bold text-[#2C3E50]">{formatFCFA(todayTotal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#7F8C8D] mb-1">🎯 Budget mois</p>
          <p className="text-base font-bold text-[#2C3E50]">
            {budgetTotal > 0 ? formatFCFA(budgetTotal) : '—'}
          </p>
        </div>
      </div>

      {/* Budget progress */}
      {budgetTotal > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-[#2C3E50]">Utilisation budget</p>
            <p className="text-sm font-bold" style={{ color: budgetColor }}>
              {budgetPct.toFixed(0)}%
            </p>
          </div>
          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${budgetPct}%`, backgroundColor: budgetColor }}
            />
          </div>
          <p className="text-xs text-[#7F8C8D] mt-1">
            {formatFCFA(monthTotal)} / {formatFCFA(budgetTotal)}
          </p>
        </div>
      )}

      {/* Recent expenses */}
      {recent.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#2C3E50] mb-3">📋 Dernières dépenses</p>
          <div className="flex flex-col divide-y divide-gray-50">
            {recent.map((exp) => {
              const cat = getCat(exp.categorie)
              return (
                <button
                  key={exp.id}
                  onClick={() => onOpenModal(exp)}
                  className="flex items-center gap-3 py-2.5 text-left w-full"
                >
                  <span className="text-xl w-7 text-center">{cat.emoji}</span>
                  <span className="flex-1 text-sm text-[#2C3E50] truncate">
                    {exp.description || cat.label}
                  </span>
                  <span className="text-sm font-semibold text-[#2C3E50] whitespace-nowrap ml-2">
                    {formatFCFA(exp.montant)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {depenses.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-[#7F8C8D]">
          <span className="text-5xl">🌾</span>
          <p className="font-semibold">Aucune dépense enregistrée</p>
          <p className="text-sm text-center">Appuyez sur + pour ajouter votre première dépense</p>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={() => onOpenModal(null)}
        className="bg-[#27AE60] text-white rounded-xl py-4 font-bold text-base shadow"
      >
        ➕ Nouvelle dépense
      </button>
    </div>
  )
}
