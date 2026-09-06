const DB_NAME = 'satyascan_db'
const STORE_NAME = 'inspection_images'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION,
    )

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export async function saveInspectionImage(
  image: string,
): Promise<string> {
  const db = await openDatabase()

  const id = `image-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite',
    )

    const store =
      transaction.objectStore(STORE_NAME)

    const request = store.put(image, id)

    request.onsuccess = () => {
      resolve(id)
    }

    request.onerror = () => {
      reject(request.error)
    }

    transaction.oncomplete = () => {
      db.close()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

export async function getInspectionImage(
  id: string,
): Promise<string | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly',
    )

    const store =
      transaction.objectStore(STORE_NAME)

    const request = store.get(id)

    request.onsuccess = () => {
      resolve(
        typeof request.result === 'string'
          ? request.result
          : null,
      )
    }

    request.onerror = () => {
      reject(request.error)
    }

    transaction.oncomplete = () => {
      db.close()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

export async function deleteInspectionImage(
  id: string,
): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite',
    )

    const store =
      transaction.objectStore(STORE_NAME)

    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }

    transaction.oncomplete = () => {
      db.close()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}