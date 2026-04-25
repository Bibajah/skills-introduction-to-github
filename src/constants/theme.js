export const COLORS = {
  primary: '#27AE60',
  primaryDark: '#1E8449',
  danger: '#E74C3C',
  textDark: '#2C3E50',
  textMedium: '#7F8C8D',
  textLight: '#BDC3C7',
  background: '#ECF0F1',
  white: '#FFFFFF',
  border: '#D5D8DC',
};

export const formatFCFA = (n) =>
  Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

export const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

export const todayISO = () => new Date().toISOString().split('T')[0];
