const DB_NAME = 'UrlViewerPWA';
const STORE_NAME = 'urls';
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database and creates the object store if it doesn't exist.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        // console.log(`Object store "${STORE_NAME}" created.`);
      }
    };

    request.onsuccess = (event) => {
      // console.log('Database initialized successfully.');
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Database error:', event.target.errorCode);
      reject(event.target.error);
    };
  });
}

/**
 * Retrieves all URLs from the IndexedDB object store.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of URL objects.
 */
export async function getAllUrls() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // console.log('URLs loaded from IndexedDB:', request.result);
      resolve(request.result || []);
    };

    request.onerror = (event) => {
      console.error('Error loading URLs from IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Saves an array of URL objects to the IndexedDB object store.
 * This will clear the existing store and add all new URLs.
 * @param {Array<Object>} urls The array of URL objects to save.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function saveUrls(urls) {
  if (!Array.isArray(urls)) {
    return Promise.reject(new TypeError('Expected urls to be an array.'));
  }
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data
    const clearRequest = store.clear();
    clearRequest.onerror = (event) => {
        console.error('Error clearing object store:', event.target.error);
        reject(event.target.error);
        transaction.abort(); // Abort transaction on error
        return;
    };

    clearRequest.onsuccess = () => {
        // Add new data
        // If urls is empty, this loop won't run, effectively just clearing the store.
        if (urls.length === 0) {
            resolve(); // Nothing more to do if urls array is empty
            return;
        }

        let putCount = 0;
        urls.forEach(urlObject => {
            // Ensure urlObject is an object and has a 'url' property
            if (typeof urlObject === 'object' && urlObject !== null && 'url' in urlObject) {
                try {
                    const putRequest = store.put(urlObject);
                    putRequest.onsuccess = () => {
                        putCount++;
                        if (putCount === urls.length) {
                            // console.log('All URLs saved to IndexedDB.');
                            // resolve(); // Resolve will be handled by transaction.oncomplete
                        }
                    };
                    putRequest.onerror = (event) => {
                        console.error('Error saving URL to IndexedDB:', urlObject, event.target.error);
                        // Don't reject immediately, try to save other URLs or let transaction error handle it.
                        // However, it's better to abort if one fails to ensure data consistency.
                        transaction.abort();
                        reject(event.target.error);
                    };
                } catch (e) {
                    console.error('Error calling store.put():', e, 'for object:', urlObject);
                    transaction.abort();
                    reject(e);
                }
            } else {
                console.warn('Skipping invalid URL object during save:', urlObject);
                // If we need to count this as "processed" for the putCount logic:
                // putCount++;
                // if (putCount === urls.length) resolve();
                // Or, if strictness is required:
                transaction.abort();
                reject(new Error('Invalid URL object encountered during save.'));
                return; // exit forEach
            }
        });
    };

    transaction.oncomplete = () => {
      // console.log('Save transaction completed.');
      resolve();
    };

    transaction.onerror = (event) => {
      console.error('Error in save transaction:', event.target.error);
      reject(event.target.error);
    };

    transaction.onabort = (event) => {
        console.error('Save transaction aborted:', event.target.error);
        // Reject if not already rejected by a specific put/clear error
        // This is important if an error in one of the put requests caused transaction.abort()
        reject(event.target.error || new Error("Transaction aborted"));
    };
  });
}

/**
 * Adds a single URL object to the IndexedDB object store.
 * If the URL already exists, it updates the existing entry.
 * @param {Object} urlObject The URL object to add or update.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function addUrl(urlObject) {
  if (typeof urlObject !== 'object' || urlObject === null || !('url' in urlObject)) {
    return Promise.reject(new TypeError('Invalid URL object provided to addUrl.'));
  }
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(urlObject);

    request.onsuccess = () => {
      // console.log('URL added/updated in IndexedDB:', urlObject);
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error adding/updating URL in IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Example of how shared-url-handler.html might use these (conceptual)
/*
async function handleSharedUrl(sharedUrl, sharedTitle, sharedText) {
    try {
        const urls = await getAllUrls();
        const newUrlEntry = {
            url: sharedUrl,
            title: sharedTitle || sharedUrl,
            text: sharedText,
            status: 'unloaded'
        };

        const existingIndex = urls.findIndex(item => item.url === newUrlEntry.url);
        if (existingIndex > -1) {
            urls.splice(existingIndex, 1);
        }
        urls.unshift(newUrlEntry);

        await saveUrls(urls); // saveUrls clears and writes all
        console.log('Shared URL processed and saved via IndexedDB.');
        // redirect logic here
    } catch (error) {
        console.error('Error processing shared URL with IndexedDB:', error);
        // redirect or error handling logic here
    }
}
*/

// It's good practice to also handle potential errors from initDB itself,
// though the individual functions already await it.
initDB().catch(error => {
  console.error("Failed to initialize IndexedDB on module load:", error);
});
