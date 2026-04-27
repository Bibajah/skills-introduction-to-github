import React, { useMemo } from 'react'
import { CATEGORIES } from '../lib/categories.js'
import { formatFCFA, getCurrentMonth, monthPrefix, shortMonthLabel } from '../lib/utils.js'

function TrendChart({ points, labels }) {
  if (points.every((p) => p === 0)) return null
  const max  = Math.max(...points, 1)
  const W    = 300
  const H    = 100
  const PAD  = { l: 8, r: 8, t: 10, b: 22 }
  const cW   = W - PAD.l - PAD.r
  const cH   = H - PAD.t - PAD.b
  const n    = points.length

  const pts = points.map((v, i) => ({
    x: PAD.l + (i / (n - 1)) * cW,
    y: PAD.t + (1 - v / max) * cH,
  }))
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PAD.l} y1={PAD.t + (1 - f) * cH}
          x2={W - PAD.r} y2={PAD.t + (1 - f) * cH}
          stroke="#ECF0F1" strokeWidth="1"
        />
      ))}
      <polyline points={poly} fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#27AE60" stroke="white" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fontSize="9" fill="#7F8C8D">
          {l}
        </text>
      ))}
    </svg>
  )
}

export default function StatsTab({ depenses }) {
  const { mois, annee } = getCurrentMonth()

  const monthExp = useMemo(
    () => depenses.filter((d) => d.date.startsWith(monthPrefix(mois, annee))),
    [depenses, mois, annee]
  )

  const monthTotal = monthExp.reduce((s, d) => s + d.montant, 0)
  const avgPerDay  = monthTotal > 0 ? Math.round(monthTotal / new Date().getDate()) : 0

  const catData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const total = monthExp.filter((d) => d.categorie === cat.id).reduce((s, d) => s + d.montant, 0)
      return { ...cat, total, pct: monthTotal > 0 ? (total / monthTotal) * 100 : 0 }
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [monthExp, monthTotal])

  const topCat = catData[0]

  const trend = useMemo(() => {
    const months = []
    const labels = []
    const now    = new Date()
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m   = d.getMonth() + 1
      const y   = d.getFullYear()
      const tot = depenses
        .filter((dep) => dep.date.startsWith(monthPrefix(m, y)))
        .reduce((s, dep) => s + dep.montant, 0)
      months.push(tot)
      labels.push(shortMonthLabel(m, y))
    }
    return { months, labels }
  }, [depenses])

  const monthName = new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric'
  })

  return (
    <div className="pb-safe">
      <div className="bg-[#27AE60] px-4 pt-4 pb-4">
        <h2 className="text-lg font-bold text-white">📊 Tableau de bord</h2>
        <p className="text-sm text-white/70 capitalize">{monthName}</p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* KPI */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <p className="text-xs text-[#7F8C8D] mb-1">Total mois</p>
            <p className="text-sm font-black text-[#2C3E50] leading-tight">{formatFCFA(monthTotal)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <p className="text-xs text-[#7F8C8D] mb-1">Moy./jour</p>
            <p className="text-sm font-black text-[#2C3E50] leading-tight">{formatFCFA(avgPerDay)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <p className="text-xs text-[#7F8C8D] mb-1">Top catég.</p>
            <p className="text-sm font-black text-[#2C3E50] leading-tight">
              {topCat ? `${topCat.emoji} ${topCat.pct.toFixed(0)}%` : '—'}
            </p>
          </div>
        </div>

        {/* Category bars */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#2C3E50] mb-3">Dépenses par catégorie</p>
          {catData.length === 0 && (
            <p className="text-sm text-[#7F8C8D] text-center py-4">Aucune dépense ce mois</p>
          )}
          <div className="flex flex-col gap-3">
            {catData.map((cat) => (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#2C3E50]">
                    {cat.emoji} {cat.label}
                  </span>
                  <span className="text-xs font-semibold text-[#7F8C8D]">
                    {cat.pct.toFixed(0)}% · {formatFCFA(cat.total)}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#2C3E50] mb-3">Tendance sur 6 mois</p>
          <TrendChart points={trend.months} labels={trend.labels} />
          {trend.months.every((v) => v === 0) && (
            <p className="text-sm text-[#7F8C8D] text-center py-4">Pas assez de données</p>
          )}
        </div>
      </div>
    </div>
  )
}
