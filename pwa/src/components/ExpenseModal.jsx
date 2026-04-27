import React, { useState, useEffect } from 'react'
import { CATEGORIES } from '../lib/categories.js'
import { todayISO } from '../lib/utils.js'

export default function ExpenseModal({ initialData, onClose, onSave }) {
  const [date,        setDate]        = useState(todayISO())
  const [categorie,   setCategorie]   = useState('achat')
  const [description, setDescription] = useState('')
  const [montant,     setMontant]     = useState('')
  const [errors,      setErrors]      = useState({})

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || todayISO())
      setCategorie(initialData.categorie || 'achat')
      setDescription(initialData.description || '')
      setMontant(String(initialData.montant || ''))
    } else {
      setDate(todayISO())
      setCategorie('achat')
      setDescription('')
      setMontant('')
    }
    setErrors({})
  }, [initialData])

  function validate() {
    const e = {}
    const m = parseInt(montant, 10)
    if (!montant || isNaN(m) || m <= 0) e.montant = 'Montant invalide (doit être > 0)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSave({ date, categorie, description: description.trim(), montant: parseInt(montant, 10) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="text-lg font-bold text-[#2C3E50]">
            {initialData ? '✏️ Modifier' : '➕ Nouvelle dépense'}
          </h2>
          <button onClick={onClose} className="text-[#7F8C8D] text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 flex flex-col gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3E50] mb-1">📅 Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-[#2C3E50] text-sm"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3E50] mb-2">📂 Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategorie(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    categorie === cat.id
                      ? 'bg-[#27AE60] text-white border-[#27AE60] font-semibold'
                      : 'bg-white text-[#2C3E50] border-gray-300'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3E50] mb-1">
              ✍️ Description <span className="font-normal text-[#7F8C8D]">(optionnel)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Engrais NPK 50kg"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-[#2C3E50] text-sm"
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-semibold text-[#2C3E50] mb-1">💰 Montant (FCFA)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0"
                className={`flex-1 border rounded-lg px-3 py-3 text-[#2C3E50] text-sm ${
                  errors.montant ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="text-sm font-semibold text-[#7F8C8D]">FCFA</span>
            </div>
            {errors.montant && <p className="text-red-500 text-xs mt-1">{errors.montant}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-xl py-3.5 font-semibold text-[#7F8C8D] text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-[2] bg-[#27AE60] text-white rounded-xl py-3.5 font-bold text-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
