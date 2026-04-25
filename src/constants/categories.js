export const CATEGORIES = [
  { id: 'achat',             label: 'Achat',              emoji: '🛒' },
  { id: 'semences',          label: 'Semences',           emoji: '🌱' },
  { id: 'intrants',          label: 'Intrants',           emoji: '🧪' },
  { id: 'irrigation',        label: 'Irrigation',         emoji: '💧' },
  { id: 'main_oeuvre',       label: "Main-d'œuvre",       emoji: '👥' },
  { id: 'confection',        label: 'Confection',         emoji: '🪡' },
  { id: 'transport',         label: 'Transport',          emoji: '🚚' },
  { id: 'equipement',        label: 'Équipement',         emoji: '🔧' },
  { id: 'maintenance',       label: 'Maintenance',        emoji: '🔨' },
  { id: 'energie',           label: 'Carburant/Énergie',  emoji: '⚡' },
  { id: 'commercialisation', label: 'Commercialisation',  emoji: '💰' },
  { id: 'autre',             label: 'Autre',              emoji: 'ℹ️' },
];

export const getCat = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
