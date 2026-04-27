// File System Access API — allows direct read/write to a local .xlsx file.
// Falls back gracefully on browsers that don't support it (iOS Safari, Firefox).
// The FileSystemFileHandle is persisted in IndexedDB so we can reuse it across sessions.

const DB_NAME = 'ferme-pwa'
const STORE   = 'handles'
const KEY     = 'main'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess  = () => resolve(req.result)
    req.onerror    = () => reject(req.error)
  })
}

export async function saveHandle(handle) {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(handle, KEY)
    tx.oncomplete = res
    tx.onerror    = () => rej(tx.error)
  })
}

export async function loadHandle() {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx  = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(KEY)
    req.onsuccess = () => res(req.result || null)
    req.onerror   = () => rej(req.error)
  })
}

export async function clearHandle() {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = res
    tx.onerror    = () => rej(tx.error)
  })
}

export const isSupported = () =>
  typeof window !== 'undefined' && 'showOpenFilePicker' in window

export async function pickOpenFile() {
  const [handle] = await window.showOpenFilePicker({
    types: [{
      description: 'Fichier Excel',
      accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    }],
    multiple: false
  })
  await saveHandle(handle)
  return handle
}

export async function pickSaveFile() {
  const handle = await window.showSaveFilePicker({
    suggestedName: 'depenses-ferme.xlsx',
    types: [{
      description: 'Fichier Excel',
      accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    }]
  })
  await saveHandle(handle)
  return handle
}

export async function getPermission(handle) {
  const opts = { mode: 'readwrite' }
  if (await handle.queryPermission(opts) === 'granted') return true
  return (await handle.requestPermission(opts)) === 'granted'
}

export async function readBuffer(handle) {
  const file = await handle.getFile()
  return file.arrayBuffer()
}

export async function writeBuffer(handle, buffer) {
  const writable = await handle.createWritable()
  await writable.write(buffer)
  await writable.close()
}

export async function getFileInfo(handle) {
  try {
    const file = await handle.getFile()
    return {
      name: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified).toLocaleString('fr-FR')
    }
  } catch {
    return { name: handle.name, size: 0, lastModified: '—' }
  }
}
