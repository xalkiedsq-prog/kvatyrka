/* KVATYRKA — demo cart state (T4, T6, website-tech-spec.md §5.2).
   Stored: only identifiers — [{ sortId, grind, qty }] under one sessionStorage key.
   Every storage access is inside try / catch; nothing here ever throws to the page:
   - storage unavailable → the cart lives in memory;
   - corrupted value (JSON.parse error, not an array, a record without the fields or of the wrong type)
     → the value is removed, the cart starts empty in memory for the rest of the visit, one console warning;
   - partly invalid records (unknown coffee or grind, qty not an integer 1…99) → only they are dropped,
     the total is capped at 99;
   - write error → memory from then on, the shown state does not change. */

export const CART_LIMIT = 99;
const KEY = "kvatyrka-cart";

let warned = false;
function warnOnce(message, error) {
  if (warned) return;
  warned = true;
  console.warn(`[kvatyrka] cart: ${message}`, error || "");
}

function getStorage() {
  try {
    const storage = window.sessionStorage;
    const probe = `${KEY}-probe`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch (error) {
    return null;                                   // blocked, private mode, quota 0 …
  }
}

function isRecordShape(item) {
  return item !== null && typeof item === "object" &&
    typeof item.sortId === "string" && typeof item.grind === "string" && typeof item.qty === "number";
}

/**
 * @param {(sortId: string, grind: string) => boolean} isKnown — validates a coffee and its grind against the page
 */
export function createCartStore(isKnown) {
  let storage = getStorage();
  let lines = [];
  const listeners = new Set();

  function useMemory() {
    storage = null;
  }

  function read() {
    if (!storage) return [];
    let raw;
    try {
      raw = storage.getItem(KEY);
    } catch (error) {
      useMemory();
      return [];
    }
    if (raw === null) return [];

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      data = undefined;
    }
    if (!Array.isArray(data) || !data.every(isRecordShape)) {
      try { storage.removeItem(KEY); } catch (error) { /* ignored */ }
      useMemory();
      warnOnce("stored cart was corrupted; starting empty, in memory");
      return [];
    }

    const result = [];
    let total = 0;
    for (const item of data) {
      if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > CART_LIMIT) continue;
      if (!isKnown(item.sortId, item.grind)) continue;
      const room = CART_LIMIT - total;
      if (room <= 0) break;
      const qty = Math.min(item.qty, room);
      const same = result.find((line) => line.sortId === item.sortId && line.grind === item.grind);
      if (same) same.qty += qty; else result.push({ sortId: item.sortId, grind: item.grind, qty });
      total += qty;
    }
    return result;
  }

  function write() {
    if (!storage) return;
    try {
      storage.setItem(KEY, JSON.stringify(lines));
    } catch (error) {
      useMemory();                                 // quota, denied … — keep working in memory
    }
  }

  function commit() {
    write();
    for (const listener of listeners) {
      try { listener(); } catch (error) { console.error("[kvatyrka] cart listener failed:", error); }
    }
  }

  lines = read();

  return {
    get lines() { return lines.map((line) => ({ ...line })); },
    get total() { return lines.reduce((sum, line) => sum + line.qty, 0); },
    get inMemory() { return storage === null; },
    subscribe(listener) { listeners.add(listener); },

    /** @returns {boolean} false when the 99 limit is reached and nothing was added */
    add(sortId, grind) {
      if (this.total >= CART_LIMIT) return false;
      const same = lines.find((line) => line.sortId === sortId && line.grind === grind);
      if (same) same.qty += 1; else lines.push({ sortId, grind, qty: 1 });
      commit();
      return true;
    },

    increment(index) {
      if (!lines[index] || this.total >= CART_LIMIT) return false;
      lines[index].qty += 1;
      commit();
      return true;
    },

    decrement(index) {
      if (!lines[index] || lines[index].qty <= 1) return false;
      lines[index].qty -= 1;
      commit();
      return true;
    },

    remove(index) {
      if (!lines[index]) return null;
      const [removed] = lines.splice(index, 1);
      commit();
      return removed;
    },

    clear() {
      lines = [];
      commit();
    },
  };
}
