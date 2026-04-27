import React, { useState, useEffect } from 'react'
import { downloadExcel, TEST_DATA } from '../lib/excelOps.js'
import { getFileInfo, isSupported } from '../lib/fileStorage.js'

export default function SettingsTab({
  depenses, budgets, fileHandle, noFSA,
  onOpenFile, onResetData, onLoadTestData
}) {
  const [fileInfo, setFileInfo] = useState(null)

  useEffect(() => {
    if (!fileHandle) return
    getFileInfo(fileHandle).then(setFileInfo)
  }, [fileHandle])

  function handleDownload() {
    downloadExcel(depenses, budgets)
  }

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <p className="text-sm text-[#7F8C8D]">{label}</p>
      <p className="text-sm font-semibold text-[#2C3E50]">{value}</p>
    </div>
  )

  const now = new Date()

  return (
    <div className="pb-safe">
      <div className="bg-[#27AE60] px-4 pt-4 pb-4">
        <h2 className="text-lg font-bold text-white">⚙️ Paramètres</h2>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Fichier Excel */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-[#2C3E50] mb-3">📁 Fichier Excel</p>

          {noFSA ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-orange-700 font-medium">
                ⚠️ Mode stockage local (votre navigateur ne supporte pas l'écriture directe dans un fichier)
              </p>
            </div>
          ) : fileHandle ? (
            <div className="flex flex-col gap-1 mb-3">
              <Row label="Nom" value={fileInfo?.name || 'depenses-ferme.xlsx'} />
              <Row label="Taille" value={fileInfo ? `${(fileInfo.size / 1024).toFixed(1)} KB` : '—'} />
              <Row label="Modifié" value={fileInfo?.lastModified || '—'} />
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-700">Aucun fichier ouvert. Données sauvegardées localement.</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!noFSA && (
              <button
                onClick={onOpenFile}
                className="bg-[#27AE60] text-white rounded-xl py-3 font-semibold text-sm"
              >
                📂 {fileHandle ? 'Changer de fichier' : 'Ouvrir / Créer un fichier Excel'}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="border border-[#27AE60] text-[#27AE60] rounded-xl py-3 font-semibold text-sm"
            >
              📥 Télécharger toutes les données (.xlsx)
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-[#2C3E50] mb-3">📊 Statistiques</p>
          <Row label="Dépenses enregistrées" value={depenses.length} />
          <Row
            label="Ce mois"
            value={depenses.filter((d) =>
              d.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
            ).length + ' entrées'}
          />
          <Row label="Budgets définis" value={Object.keys(budgets).length + ' catégories'} />
        </div>

        {/* Données test */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-[#2C3E50] mb-1">🧪 Données de test</p>
          <p className="text-xs text-[#7F8C8D] mb-3">
            Charge 30 dépenses de démonstration pour tester l'application.
          </p>
          <button
            onClick={onLoadTestData}
            className="border border-gray-300 text-[#7F8C8D] rounded-xl py-3 font-semibold text-sm w-full"
          >
            📋 Charger les données de test
          </button>
        </div>

        {/* Zone danger */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <p className="text-sm font-bold text-red-600 mb-1">⚠️ Zone de danger</p>
          <p className="text-xs text-[#7F8C8D] mb-3">
            Cette action est irréversible et supprimera toutes vos données.
          </p>
          <button
            onClick={onResetData}
            className="bg-red-50 border border-red-200 text-red-600 rounded-xl py-3 font-semibold text-sm w-full"
          >
            🗑️ Supprimer toutes les données
          </button>
        </div>

        {/* À propos */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-bold text-[#2C3E50] mb-3">📱 À propos</p>
          <Row label="Version"       value="1.0.0" />
          <Row label="Mode stockage" value={noFSA ? 'LocalStorage' : fileHandle ? 'Fichier Excel' : 'LocalStorage'} />
          <Row label="Catégories"    value="12 catégories agricoles" />
        </div>
      </div>
    </div>
  )
}
