/**
 * Menu data layer.
 *
 * Loads /cms/menu.csv, validates every row and turns it into a clean list of
 * menu items. Anything malformed is skipped rather than allowed to break the
 * page — the CMS is edited by hand, so bad input is expected.
 */

import { parseCsvToObjects } from "./csv.js";

/** Where the CMS lives, relative to index.html. */
const MENU_CSV_URL = "cms/menu.csv";
const IMAGE_DIR = "cms/images";

/** IDs must be a category letter followed by 1–2 digits, e.g. A1, B12. */
const ID_PATTERN = /^[A-Z][0-9]{1,2}$/;

/**
 * @typedef {object} MenuItem
 * @property {string} id
 * @property {string} category
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} tag
 * @property {string} image
 */

/**
 * Convert one CSV record into a MenuItem, or null when it is not usable.
 * @param {Record<string, string>} row
 * @returns {MenuItem | null}
 */
function toMenuItem(row) {
  const id = (row.id || "").toUpperCase();
  const name = row.name || "";
  const price = Number.parseFloat(row.price);
  const available = (row.available || "yes").toLowerCase();

  const isValid =
    ID_PATTERN.test(id) &&
    id.length <= 3 &&
    name.length > 0 &&
    Number.isFinite(price) &&
    price >= 0 &&
    available !== "no" &&
    available !== "false";

  if (!isValid) return null;

  return {
    id,
    category: row.category || "Other",
    name,
    description: row.description || "",
    price: Math.round(price * 100) / 100,
    tag: row.tags || "",
    image: `${IMAGE_DIR}/${id}.png`,
  };
}

/**
 * Fetch and validate the menu.
 * @returns {Promise<MenuItem[]>} unique, available items in CSV order
 */
export async function loadMenu() {
  const response = await fetch(MENU_CSV_URL, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Could not load the menu (HTTP ${response.status})`);
  }

  const rows = parseCsvToObjects(await response.text());
  const seen = new Set();

  return rows.reduce((items, row) => {
    const item = toMenuItem(row);
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      items.push(item);
    }
    return items;
  }, /** @type {MenuItem[]} */ ([]));
}

/**
 * Unique category names, in the order they first appear in the CSV.
 * @param {MenuItem[]} items
 * @returns {string[]}
 */
export function getCategories(items) {
  return [...new Set(items.map((item) => item.category))];
}
