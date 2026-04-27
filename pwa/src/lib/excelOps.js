import * as XLSX from 'xlsx'
import { readBuffer, writeBuffer } from './fileStorage.js'

const SHEET_DEPENSES = 'Dépenses'
const SHEET_BUDGETS  = 'Budgets'

export function bufferToData(buffer) {
  try {
    const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })

    const wsD = wb.Sheets[SHEET_DEPENSES]
    const depenses = wsD
      ? XLSX.utils.sheet_to_json(wsD).map((r) => ({
          id:          String(r.id || ''),
          date:        String(r.date || ''),
          categorie:   String(r.categorie || ''),
          description: String(r.description || ''),
          montant:     Number(r.montant) || 0,
          created_at:  String(r.created_at || ''),
        }))
      : []

    const wsB = wb.Sheets[SHEET_BUDGETS]
    const budgets = {}
    if (wsB) {
      for (const r of XLSX.utils.sheet_to_json(wsB)) {
        const key = `${r.categorie}_${r.mois}_${r.annee}`
        budgets[key] = {
          categorie:   String(r.categorie),
          mois:        Number(r.mois),
          annee:       Number(r.annee),
          montant_max: Number(r.montant_max) || 0,
        }
      }
    }

    return { depenses, budgets }
  } catch {
    return { depenses: [], budgets: {} }
  }
}

export function dataToBuffer(depenses, budgets) {
  const wb = XLSX.utils.book_new()

  const wsD = XLSX.utils.json_to_sheet(depenses)
  wsD['!cols'] = [
    { wch: 16 }, { wch: 12 }, { wch: 20 },
    { wch: 40 }, { wch: 10 }, { wch: 24 }
  ]
  XLSX.utils.book_append_sheet(wb, wsD, SHEET_DEPENSES)

  const wsB = XLSX.utils.json_to_sheet(Object.values(budgets))
  XLSX.utils.book_append_sheet(wb, wsB, SHEET_BUDGETS)

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

export async function loadFromFile(handle) {
  const buffer = await readBuffer(handle)
  return bufferToData(buffer)
}

export async function saveToFile(handle, depenses, budgets) {
  const buffer = dataToBuffer(depenses, budgets)
  await writeBuffer(handle, buffer)
}

export function downloadExcel(depenses, budgets, filename = 'depenses-ferme.xlsx') {
  const buffer = dataToBuffer(depenses, budgets)
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}

// 30 seed entries for demo/testing
export const TEST_DATA = (() => {
  const now   = new Date()
  const items = [
    // Current month
    { daysAgo: 0,  cat: 'achat',             desc: 'Intrants divers marché',            montant: 45000  },
    { daysAgo: 0,  cat: 'main_oeuvre',        desc: 'Journaliers arrosage (3 pers.)',    montant: 18000  },
    { daysAgo: 1,  cat: 'irrigation',         desc: 'Pompage puits parcelle nord',       montant: 12000  },
    { daysAgo: 2,  cat: 'semences',           desc: 'Oignon Kent 500g',                  montant: 8700   },
    { daysAgo: 3,  cat: 'transport',          desc: 'Transport récolte au marché',       montant: 15000  },
    { daysAgo: 4,  cat: 'intrants',           desc: 'Engrais NPK 50kg',                 montant: 18000  },
    { daysAgo: 5,  cat: 'confection',         desc: 'Sacs et emballages oignons',        montant: 7500   },
    { daysAgo: 6,  cat: 'equipement',         desc: 'Sécateur et outils jardinage',      montant: 12000  },
    { daysAgo: 7,  cat: 'maintenance',        desc: 'Réparation tuyau irrigation',       montant: 5500   },
    { daysAgo: 8,  cat: 'energie',            desc: 'Carburant groupe électrogène',      montant: 22000  },
    { daysAgo: 9,  cat: 'commercialisation',  desc: 'Frais transport vente Dakar',       montant: 35000  },
    { daysAgo: 10, cat: 'achat',              desc: 'Fil de fer clôture périmètre',      montant: 9000   },
    { daysAgo: 12, cat: 'semences',           desc: 'Semences tomate hybride F1',        montant: 14500  },
    { daysAgo: 14, cat: 'main_oeuvre',        desc: 'Sarclage parcelle principale',      montant: 24000  },
    { daysAgo: 15, cat: 'irrigation',         desc: 'Réparation pompe immergée',         montant: 18000  },
    // Previous month
    { daysAgo: 35, cat: 'semences',           desc: 'Semences mil certifiées',           montant: 14000  },
    { daysAgo: 37, cat: 'main_oeuvre',        desc: 'Labour parcelle sud',               montant: 40000  },
    { daysAgo: 39, cat: 'intrants',           desc: 'Herbicide Roundup 1L',              montant: 8500   },
    { daysAgo: 41, cat: 'equipement',         desc: 'Batterie tracteur 12V',             montant: 32000  },
    { daysAgo: 43, cat: 'transport',          desc: 'Location camionnette',              montant: 20000  },
    { daysAgo: 45, cat: 'maintenance',        desc: 'Soudure cadre remorque',            montant: 9000   },
    { daysAgo: 47, cat: 'energie',            desc: 'Facture eau mensuelle',             montant: 18000  },
    // Month -2
    { daysAgo: 65, cat: 'semences',           desc: 'Semences coton sélect.',            montant: 22000  },
    { daysAgo: 67, cat: 'main_oeuvre',        desc: 'Plantation pépinière tomate',       montant: 30000  },
    { daysAgo: 69, cat: 'achat',              desc: 'Bâche plastique serre tunnel',      montant: 28000  },
    { daysAgo: 71, cat: 'confection',         desc: 'Étiquettes et cartons livraison',   montant: 4500   },
    { daysAgo: 73, cat: 'commercialisation',  desc: 'Frais marché hebdomadaire',         montant: 8000   },
    { daysAgo: 75, cat: 'irrigation',         desc: 'Achat tuyaux PVC 50m',             montant: 15000  },
    { daysAgo: 77, cat: 'equipement',         desc: 'Pulvérisateur 16L neuf',            montant: 18500  },
    { daysAgo: 79, cat: 'intrants',           desc: 'Fongicide Mancozeb 500g',           montant: 6800   },
  ]
  return items.map((item, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - item.daysAgo)
    return {
      id:          String(Date.now() + i),
      date:        d.toISOString().split('T')[0],
      categorie:   item.cat,
      description: item.desc,
      montant:     item.montant,
      created_at:  d.toISOString(),
    }
  })
})()
