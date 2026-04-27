import React, { useState, useEffect } from 'react'
import { loadHandle, pickOpenFile, isSupported, getPermission } from './lib/fileStorage.js'
import { loadFromFile, saveToFile, bufferToData, dataToBuffer, TEST_DATA, downloadExcel } from './lib/excelOps.js'
import TabBar from './components/TabBar.jsx'
import HomeTab from './components/HomeTab.jsx'
import HistoryTab from './components/HistoryTab.jsx'
import StatsTab from './components/StatsTab.jsx'
import BudgetTab from './components/BudgetTab.jsx'
import SettingsTab from './components/SettingsTab.jsx'
import ExpenseModal from './components/ExpenseModal.jsx'

const STORAGE_KEY_DEPENSES = 'ferme_depenses'
const STORAGE_KEY_BUDGETS  = 'ferme_budgets'

export default function App() {
  const [activeTab,      setActiveTab]      = useState('home')
  const [depenses,       setDepenses]       = useState([])
  const [budgets,        setBudgets]        = useState({})
  const [fileHandle,     setFileHandle]     = useState(null)
  const [noFSA,          setNoFSA]          = useState(false)
  const [modalOpen,      setModalOpen]      = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading,        setLoading]        = useState(true)

  // Init — load from localStorage or file
  useEffect(() => {
    async function init() {
      try {
        const handle = await loadHandle()
        if (handle && isSupported()) {
          try {
            if (await getPermission(handle)) {
              const { depenses: d, budgets: b } = await loadFromFile(handle)
              setFileHandle(handle)
              setDepenses(d || [])
              setBudgets(b || {})
              setLoading(false)
              return
            }
          } catch (e) {
            console.warn('File permission error:', e)
          }
        }
      } catch (e) {
        console.warn('Load handle error:', e)
      }

      // Fallback to localStorage
      const savedD = localStorage.getItem(STORAGE_KEY_DEPENSES)
      const savedB = localStorage.getItem(STORAGE_KEY_BUDGETS)

      if (savedD && savedB) {
        setDepenses(JSON.parse(savedD))
        setBudgets(JSON.parse(savedB))
      } else {
        // First time — load test data
        setDepenses(TEST_DATA)
        const testBudgets = {}
        const now = new Date()
        const mois = now.getMonth() + 1
        const annee = now.getFullYear()
        TEST_DATA.slice(0, 8).forEach((exp, i) => {
          const key = `${exp.categorie}_${mois}_${annee}`
          testBudgets[key] = {
            categorie: exp.categorie,
            mois, annee,
            montant_max: 100000
          }
        })
        setBudgets(testBudgets)
      }

      setNoFSA(!isSupported())
      setLoading(false)
    }

    init()
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (loading) return
    localStorage.setItem(STORAGE_KEY_DEPENSES, JSON.stringify(depenses))
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets))
  }, [depenses, budgets, loading])

  // Save to file if handle exists
  useEffect(() => {
    if (loading || !fileHandle || depenses.length === 0) return
    const timer = setTimeout(async () => {
      try {
        await saveToFile(fileHandle, depenses, budgets)
      } catch (e) {
        console.error('Save to file error:', e)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [depenses, budgets, fileHandle, loading])

  function handleOpenFile() {
    pickOpenFile()
      .then(async (handle) => {
        const { depenses: d, budgets: b } = await loadFromFile(handle)
        setFileHandle(handle)
        setDepenses(d || [])
        setBudgets(b || {})
      })
      .catch(() => {})
  }

  function handleAddOrUpdateExpense(data) {
    if (editingExpense) {
      setDepenses((list) =>
        list.map((exp) =>
          exp.id === editingExpense.id ? { ...exp, ...data, id: exp.id } : exp
        )
      )
      setEditingExpense(null)
    } else {
      const newExp = {
        id: String(Date.now()),
        ...data,
        created_at: new Date().toISOString(),
      }
      setDepenses((list) => [newExp, ...list])
    }
    setModalOpen(false)
  }

  function handleDeleteExpense(id) {
    setDepenses((list) => list.filter((exp) => exp.id !== id))
  }

  function handleUpdateBudgets(newBudgets) {
    setBudgets(newBudgets)
  }

  function handleResetData() {
    if (confirm('⚠️ Cela supprimera TOUTES vos données. Êtes-vous sûr ?')) {
      setDepenses([])
      setBudgets({})
      localStorage.removeItem(STORAGE_KEY_DEPENSES)
      localStorage.removeItem(STORAGE_KEY_BUDGETS)
    }
  }

  function handleLoadTestData() {
    setDepenses(TEST_DATA)
    const testBudgets = {}
    const now = new Date()
    const mois = now.getMonth() + 1
    const annee = now.getFullYear()
    TEST_DATA.slice(0, 8).forEach((exp, i) => {
      const key = `${exp.categorie}_${mois}_${annee}`
      testBudgets[key] = {
        categorie: exp.categorie,
        mois, annee,
        montant_max: 100000
      }
    })
    setBudgets(testBudgets)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#ECF0F1]">
        <div className="text-center">
          <p className="text-3xl mb-4">🌾</p>
          <p className="text-[#7F8C8D] font-semibold">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#ECF0F1]">
      <div className="flex-1 overflow-y-auto bg-[#ECF0F1]">
        {activeTab === 'home'    && <HomeTab depenses={depenses} budgets={budgets} onOpenModal={(exp) => { setEditingExpense(exp); setModalOpen(true) }} />}
        {activeTab === 'history' && <HistoryTab depenses={depenses} onOpenModal={(exp) => { setEditingExpense(exp); setModalOpen(true) }} onDeleteExpense={handleDeleteExpense} />}
        {activeTab === 'stats'   && <StatsTab depenses={depenses} />}
        {activeTab === 'budgets' && <BudgetTab depenses={depenses} budgets={budgets} onUpdateBudgets={handleUpdateBudgets} />}
        {activeTab === 'settings' && <SettingsTab depenses={depenses} budgets={budgets} fileHandle={fileHandle} noFSA={noFSA} onOpenFile={handleOpenFile} onResetData={handleResetData} onLoadTestData={handleLoadTestData} />}
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {modalOpen && (
        <ExpenseModal
          initialData={editingExpense}
          onClose={() => { setModalOpen(false); setEditingExpense(null) }}
          onSave={handleAddOrUpdateExpense}
        />
      )}
    </div>
  )
}
