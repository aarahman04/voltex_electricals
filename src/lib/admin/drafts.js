let database;
function open() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("voltex-admin-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => { database = undefined; reject(request.error); };
    request.onblocked = () => reject(new Error("Close other admin tabs and try again."));
  });
  return database;
}

export async function readDrafts() {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = db.transaction("drafts").objectStore("drafts").get("list");
    request.onsuccess = () => resolve(request.result ?? { drafts: [], form: null });
    request.onerror = () => reject(request.error);
  });
}

export async function saveDrafts(value) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").put(value, "list");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error("Could not keep drafts on this phone."));
  });
}
