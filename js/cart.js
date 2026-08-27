/**
 * Order state (the "cart").
 *
 * Deliberately tiny: a Map of item id -> quantity plus a subscribe callback.
 * Quantities are clamped so a tampered UI cannot produce a silly order.
 */

const MAX_QTY_PER_ITEM = 20;

export function createCart() {
  /** @type {Map<string, number>} */
  const lines = new Map();
  /** @type {Array<() => void>} */
  const listeners = [];

  const notify = () => listeners.forEach((listener) => listener());

  return {
    /** Register a callback fired after every change. */
    subscribe(listener) {
      listeners.push(listener);
    },

    /** Add one of an item (capped). */
    add(id) {
      const next = Math.min((lines.get(id) || 0) + 1, MAX_QTY_PER_ITEM);
      lines.set(id, next);
      notify();
    },

    /** Set an explicit quantity; 0 or less removes the line. */
    setQty(id, qty) {
      const safe = Math.min(Math.max(Math.trunc(Number(qty) || 0), 0), MAX_QTY_PER_ITEM);
      if (safe === 0) lines.delete(id);
      else lines.set(id, safe);
      notify();
    },

    remove(id) {
      lines.delete(id);
      notify();
    },

    clear() {
      lines.clear();
      notify();
    },

    /** @returns {Array<{ id: string, qty: number }>} */
    entries() {
      return [...lines.entries()].map(([id, qty]) => ({ id, qty }));
    },

    /** Total number of individual items. */
    count() {
      return [...lines.values()].reduce((sum, qty) => sum + qty, 0);
    },
  };
}

/**
 * Work out the order total in pounds.
 * @param {Array<{ id: string, qty: number }>} entries
 * @param {Map<string, import("./menu.js").MenuItem>} itemsById
 */
export function calculateTotal(entries, itemsById) {
  const pence = entries.reduce((sum, line) => {
    const item = itemsById.get(line.id);
    return item ? sum + Math.round(item.price * 100) * line.qty : sum;
  }, 0);
  return pence / 100;
}

/** Format a number as GBP. */
export function formatPrice(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}
