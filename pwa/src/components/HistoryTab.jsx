import React, { useState, useMemo } from 'react'
import { CATEGORIES, getCat } from '../lib/categories.js'
import { formatFCFA, formatDateLabel, getCurrentMonth, monthPrefix } from '../lib/utils.js'

export default function HistoryTab({ depenses, onOpenModal, onDeleteExpense }) {
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [period,    setPeriod]    = useState('tout')

  const { mois, annee } = getCurrentMonth()
  const prevMois  = mois === 1 ? 12 : mois - 1
  const prevAnnee = mois === 1 ? annee - 1 : annee

  const filtered = useMemo(() => {
    let list = depenses
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter((d) =>
        d.description.toLowerCase().includes(s) || String(d.montant).includes(s)
      )
    }
    if (filterCat) list = list.filter((d) => d.categorie === filterCat)
    if (period === 'mois')    list = list.filter((d) => d.date.startsWith(monthPrefix(mois, annee)))
    if (period === 'dernier') list = list.filter((d) => d.date.startsWith(monthPrefix(prevMois, prevAnnee)))
    return list
  }, [depenses, search, filterCat, period, mois, annee, prevMois, prevAnnee])

  const groups = useMemo(() => {
    const map = new Map()
    for (const d of filtered) {
      if (!map.has(d.date)) map.set(d.date, [])
      map.get(d.date).push(d)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }))
  }, [filtered])

  const total = filtered.reduce((s, d) => s + d.montant, 0)

  function handleDelete(exp) {
    if (confirm(`Supprimer : ${exp.description || getCat(exp.categorie).label} — ${formatFCFA(exp.montant)} ?`)) {
      onDeleteExpense(exp.id)
    }
  }

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="bg-[#27AE60] px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-white mb-3">📋 Historique</h2>
        <div className="bg-white rounded-xl flex items-center px-3 gap-2">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 py-2.5 text-sm text-[#2C3E50] outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-sm px-1">✕</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100">
        {/* Period */}
        <div className="flex px-4 py-2 gap-2 overflow-x-auto">
          {[['tout','Tout'], ['mois','Ce mois'], ['dernier','Mois dernier']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setPeriod(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${
                period === v ? 'bg-[#27AE60] text-white border-[#27AE60]' : 'bg-white text-[#7F8C8D] border-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {/* Category filter */}
        <div className="flex px-4 pb-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCat('')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${
              !filterCat ? 'bg-[#27AE60] text-white border-[#27AE60]' : 'bg-white text-[#7F8C8D] border-gray-200'
            }`}
          >
            Toutes
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? '' : cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${
                filterCat === cat.id ? 'bg-[#27AE60] text-white border-[#27AE60]' : 'bg-white text-[#7F8C8D] border-gray-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-3 flex flex-col gap-4">
        {groups.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-[#7F8C8D]">
            <span className="text-4xl">🔍</span>
            <p className="font-semibold">Aucune dépense trouvée</p>
          </div>
        )}

        {groups.map(({ date, items }) => (
          <div key={date}>
            <p className="text-xs font-semibold text-[#7F8C8D] capitalize mb-2">
              📅 {formatDateLabel(date)}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((exp) => {
                const cat = getCat(exp.categorie)
                return (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2C3E50] truncate">
                        {exp.description || cat.label}
                      </p>
                      <p className="text-xs text-[#7F8C8D]">{cat.label}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <p className="text-sm font-bold text-[#2C3E50] whitespace-nowrap">
                        {formatFCFA(exp.montant)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenModal(exp)}
                          className="text-xs text-[#27AE60] font-medium px-2 py-1 rounded-lg bg-green-50"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(exp)}
                          className="text-xs text-red-500 font-medium px-2 py-1 rounded-lg bg-red-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Total footer */}
      {filtered.length > 0 && (
        <div className="mx-4 my-4 bg-white rounded-xl p-4 shadow-sm flex justify-between items-center border-t-2 border-[#27AE60]">
          <p className="text-sm font-semibold text-[#7F8C8D]">
            Total ({filtered.length} dépenses)
          </p>
          <p className="text-base font-black text-[#2C3E50]">{formatFCFA(total)}</p>
        </div>
      )}
    </div>
  )
}
