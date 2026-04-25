import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('ferme.db');

export async function initDatabase() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS depenses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,
      categorie   TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      montant     INTEGER NOT NULL,
      created_at  TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_date      ON depenses(date);
    CREATE INDEX IF NOT EXISTS idx_categorie ON depenses(categorie);
  `);
}

export async function seedDataIfEmpty() {
  const row = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM depenses');
  if (row.cnt > 0) return;

  const today = new Date();
  const entries = [
    { daysAgo: 0,  cat: 'achat',             desc: 'Intrants divers au marché',            montant: 45000 },
    { daysAgo: 0,  cat: 'main_oeuvre',        desc: 'Journaliers arrosage (3 pers.)',        montant: 18000 },
    { daysAgo: 1,  cat: 'irrigation',         desc: 'Pompage puits parcelle nord',           montant: 12000 },
    { daysAgo: 2,  cat: 'semences',           desc: 'Semences oignon Kent 500g',             montant: 8700  },
    { daysAgo: 3,  cat: 'transport',          desc: 'Transport récolte au marché',           montant: 15000 },
    { daysAgo: 4,  cat: 'intrants',           desc: 'Engrais NPK 50kg',                      montant: 18000 },
    { daysAgo: 5,  cat: 'confection',         desc: 'Sacs et emballages oignons',            montant: 7500  },
    { daysAgo: 6,  cat: 'equipement',         desc: 'Sécateur et outils jardinage',          montant: 12000 },
    { daysAgo: 7,  cat: 'maintenance',        desc: 'Réparation tuyau irrigation',           montant: 5500  },
    { daysAgo: 8,  cat: 'energie',            desc: 'Carburant groupe électrogène',          montant: 22000 },
    { daysAgo: 9,  cat: 'commercialisation',  desc: 'Frais transport vente Dakar',           montant: 35000 },
    { daysAgo: 10, cat: 'achat',              desc: 'Fil de fer clôture périmètre',          montant: 9000  },
    { daysAgo: 12, cat: 'semences',           desc: 'Semences tomate hybride F1',            montant: 14500 },
    { daysAgo: 14, cat: 'main_oeuvre',        desc: 'Sarclage parcelle principale (5 pers.)',montant: 24000 },
    { daysAgo: 15, cat: 'irrigation',         desc: 'Réparation pompe immergée',             montant: 18000 },
    { daysAgo: 20, cat: 'intrants',           desc: 'Pesticide Calypso 500ml',               montant: 6800  },
    { daysAgo: 25, cat: 'transport',          desc: 'Carburant tracteur 40L',                montant: 28000 },
    { daysAgo: 30, cat: 'achat',              desc: 'Bâche plastique serre tunnel',          montant: 28000 },
    { daysAgo: 35, cat: 'equipement',         desc: 'Batterie tracteur 12V',                 montant: 32000 },
    { daysAgo: 40, cat: 'confection',         desc: 'Étiquettes et cartons livraison',       montant: 4500  },
  ];

  for (const e of entries) {
    const d = new Date(today);
    d.setDate(d.getDate() - e.daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    await db.runAsync(
      `INSERT INTO depenses (date, categorie, description, montant, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [dateStr, e.cat, e.desc, e.montant, d.toISOString()]
    );
  }
}

export async function getDepenses({ search = '', categorie = '' } = {}) {
  let sql = 'SELECT * FROM depenses WHERE 1=1';
  const params = [];
  if (search) {
    sql += ' AND (description LIKE ? OR CAST(montant AS TEXT) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categorie) {
    sql += ' AND categorie = ?';
    params.push(categorie);
  }
  sql += ' ORDER BY date DESC, id DESC';
  return await db.getAllAsync(sql, params);
}

export async function addDepense({ date, categorie, description, montant }) {
  await db.runAsync(
    `INSERT INTO depenses (date, categorie, description, montant, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [date, categorie, description, montant, new Date().toISOString()]
  );
}

export async function updateDepense(id, { date, categorie, description, montant }) {
  await db.runAsync(
    `UPDATE depenses SET date=?, categorie=?, description=?, montant=? WHERE id=?`,
    [date, categorie, description, montant, id]
  );
}

export async function deleteDepense(id) {
  await db.runAsync('DELETE FROM depenses WHERE id=?', [id]);
}

export async function getMonthlyTotal(mois, annee) {
  const prefix = `${annee}-${String(mois).padStart(2, '0')}`;
  const row = await db.getFirstAsync(
    `SELECT COALESCE(SUM(montant), 0) as total FROM depenses WHERE date LIKE ?`,
    [`${prefix}%`]
  );
  return row.total;
}
