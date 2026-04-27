export const CATEGORIES = [
  { id: 'achat',             label: 'Achat',             emoji: '🛒', color: '#3498DB' },
  { id: 'semences',          label: 'Semences',          emoji: '🌱', color: '#27AE60' },
  { id: 'intrants',          label: 'Intrants',          emoji: '🧪', color: '#8E44AD' },
  { id: 'irrigation',        label: 'Irrigation',        emoji: '💧', color: '#2980B9' },
  { id: 'main_oeuvre',       label: "Main-d'œuvre",      emoji: '👥', color: '#E67E22' },
  { id: 'confection',        label: 'Confection',        emoji: '🪡', color: '#E91E63' },
  { id: 'transport',         label: 'Transport',         emoji: '🚚', color: '#F39C12' },
  { id: 'equipement',        label: 'Équipement',        emoji: '🔧', color: '#16A085' },
  { id: 'maintenance',       label: 'Maintenance',       emoji: '🔨', color: '#C0392B' },
  { id: 'energie',           label: 'Carburant/Énergie', emoji: '⚡', color: '#F1C40F' },
  { id: 'commercialisation', label: 'Commercialisation', emoji: '💰', color: '#1ABC9C' },
  { id: 'autre',             label: 'Autre',             emoji: 'ℹ️',  color: '#95A5A6' },
]

export const getCat = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
