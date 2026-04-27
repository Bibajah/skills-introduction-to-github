import React from 'react'

const TABS = [
  { id: 'home',     label: 'Accueil', emoji: '🏠' },
  { id: 'history',  label: 'Hist.',   emoji: '📋' },
  { id: 'stats',    label: 'Stats',   emoji: '📊' },
  { id: 'budgets',  label: 'Budgets', emoji: '💰' },
  { id: 'settings', label: 'Param.',  emoji: '⚙️' },
]

export default function TabBar({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors min-h-[56px] ${
            active === tab.id ? 'text-[#27AE60]' : 'text-[#7F8C8D]'
          }`}
        >
          <span className="text-[22px] leading-tight">{tab.emoji}</span>
          <span className={`text-[11px] font-medium ${active === tab.id ? 'text-[#27AE60]' : 'text-[#7F8C8D]'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
