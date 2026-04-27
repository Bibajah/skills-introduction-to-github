export const formatFCFA = (n) =>
  Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'

export const todayISO = () => new Date().toISOString().split('T')[0]

export const getCurrentMonth = () => {
  const now = new Date()
  return { mois: now.getMonth() + 1, annee: now.getFullYear() }
}

export const monthPrefix = (mois, annee) =>
  `${annee}-${String(mois).padStart(2, '0')}`

export const filterByMonth = (depenses, mois, annee) =>
  depenses.filter((d) => d.date.startsWith(monthPrefix(mois, annee)))

export const formatDateLabel = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export const monthLabel = (mois, annee) =>
  new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

export const shortMonthLabel = (mois, annee) =>
  new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'short' })
