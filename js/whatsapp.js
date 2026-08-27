/**
 * WhatsApp checkout.
 *
 * Builds a readable order message and opens wa.me, which hands off to the
 * WhatsApp app on mobile or WhatsApp Web on desktop.
 */

import { calculateTotal, formatPrice } from "./cart.js";

/** Shop WhatsApp number in international format, digits only. */
export const WHATSAPP_NUMBER = "447766628285";

/**
 * Compose the plain-text order message.
 * @param {Array<{ id: string, qty: number }>} entries
 * @param {Map<string, import("./menu.js").MenuItem>} itemsById
 * @returns {string}
 */
export function buildOrderMessage(entries, itemsById) {
  const lines = entries
    .map(({ id, qty }) => {
      const item = itemsById.get(id);
      if (!item) return null;
      const lineTotal = formatPrice(item.price * qty);
      return `• ${qty} x ${item.name} (${item.id}) — ${lineTotal}`;
    })
    .filter(Boolean);

  const total = formatPrice(calculateTotal(entries, itemsById));

  return [
    "Hi No.9 Bubble Tea! I'd like to place an order:",
    "",
    ...lines,
    "",
    `Total: ${total}`,
    "",
    "Order heads-up! Please wait for our WhatsApp confirmation before heading to the shop.",
    "",
    "Also, let us know if you have any allergies when placing your order -- we've got you!",
  ].join("\n");
}

/**
 * Open WhatsApp with the order pre-filled.
 * @param {string} message
 */
export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
