/**
 * App entry point.
 *
 * Wires together the CMS-driven menu, the order state and the WhatsApp
 * checkout. All DOM writes go through textContent / element creation so a
 * malformed CMS row can never inject markup into the page.
 */

import { loadMenu, getCategories } from "./menu.js";
import { createCart, calculateTotal, formatPrice } from "./cart.js";
import { buildOrderMessage, openWhatsApp } from "./whatsapp.js";

const ALL = "All";

/** Grab an element or fail loudly during development. */
const byId = (id) => document.getElementById(id);

const dom = {
  filters: byId("menu-filters"),
  status: byId("menu-status"),
  grid: byId("menu-grid"),
  gallery: byId("gallery-grid"),
  lines: byId("order-lines"),
  empty: byId("order-empty"),
  count: byId("order-count"),
  total: byId("order-total"),
  checkout: byId("checkout"),
  bar: byId("order-bar"),
  barCount: byId("order-bar-count"),
  barTotal: byId("order-bar-total"),
  navToggle: document.querySelector(".nav-toggle"),
  nav: byId("primary-nav"),
};

const cart = createCart();

/** @type {import("./menu.js").MenuItem[]} */
let items = [];
/** @type {Map<string, import("./menu.js").MenuItem>} */
let itemsById = new Map();
let activeCategory = ALL;

/* ── Rendering helpers ─────────────────────────────────────────────────── */

/** Product image with a graceful fallback to the logo. */
function createImage(item, lazy = true) {
  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.name;
  if (lazy) img.loading = "lazy";
  img.addEventListener(
    "error",
    () => {
      img.src = "assets/no9logo.png";
    },
    { once: true },
  );
  return img;
}

/** Category filter pills, rebuilt whenever the CMS changes. */
function renderFilters() {
  dom.filters.replaceChildren();
  [ALL, ...getCategories(items)].forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter";
    button.role = "tab";
    button.textContent = category;
    button.setAttribute("aria-selected", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderMenu();
    });
    dom.filters.append(button);
  });
}

/** The menu grid for the active category. */
function renderMenu() {
  const visible =
    activeCategory === ALL ? items : items.filter((item) => item.category === activeCategory);

  dom.grid.replaceChildren();

  if (visible.length === 0) {
    dom.status.hidden = false;
    dom.status.textContent = "No items in this category just yet — check back soon.";
    return;
  }
  dom.status.hidden = true;

  visible.forEach((item) => {
    const card = document.createElement("li");
    card.className = "menu-card";

    if (item.tag) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = item.tag;
      card.append(tag);
    }

    const title = document.createElement("h3");
    title.textContent = item.name;

    const desc = document.createElement("p");
    desc.className = "desc";
    desc.textContent = item.description;

    const row = document.createElement("div");
    row.className = "row";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatPrice(item.price);

    const add = document.createElement("button");
    add.type = "button";
    add.className = "add-btn";
    add.textContent = "+";
    add.setAttribute("aria-label", `Add ${item.name} to your order`);
    add.addEventListener("click", () => cart.add(item.id));

    row.append(price, add);
    card.append(createImage(item), title, desc, row);
    dom.grid.append(card);
  });
}

/** Gallery uses the same CMS images, so it stays in sync automatically. */
function renderGallery() {
  dom.gallery.replaceChildren();
  items.slice(0, 8).forEach((item) => {
    const li = document.createElement("li");
    li.append(createImage(item));
    dom.gallery.append(li);
  });
}

/** Order summary, sticky mobile bar and checkout state. */
function renderOrder() {
  const entries = cart.entries();
  const count = cart.count();
  const total = calculateTotal(entries, itemsById);

  dom.lines.replaceChildren();

  entries.forEach(({ id, qty }) => {
    const item = itemsById.get(id);
    if (!item) return;

    const line = document.createElement("li");
    line.className = "order-line";

    const name = document.createElement("div");
    const nameText = document.createElement("span");
    nameText.className = "name";
    nameText.textContent = item.name;
    const linePrice = document.createElement("div");
    linePrice.textContent = formatPrice(item.price * qty);
    name.append(nameText, linePrice);

    const qtyBox = document.createElement("div");
    qtyBox.className = "qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Remove one ${item.name}`);
    minus.addEventListener("click", () => cart.setQty(id, qty - 1));

    const output = document.createElement("output");
    output.textContent = String(qty);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Add another ${item.name}`);
    plus.addEventListener("click", () => cart.add(id));

    qtyBox.append(minus, output, plus);
    line.append(createImage(item), name, qtyBox);
    dom.lines.append(line);
  });

  dom.empty.hidden = count > 0;
  dom.count.textContent = String(count);
  dom.total.textContent = formatPrice(total);
  dom.checkout.disabled = count === 0;

  dom.bar.hidden = count === 0;
  dom.barCount.textContent = String(count);
  dom.barTotal.textContent = formatPrice(total);
}

/* ── Wiring ────────────────────────────────────────────────────────────── */

cart.subscribe(renderOrder);

dom.checkout.addEventListener("click", () => {
  const entries = cart.entries();
  if (entries.length === 0) return;
  openWhatsApp(buildOrderMessage(entries, itemsById));
  cart.clear();
});

dom.bar.addEventListener("click", () => {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Mobile navigation
dom.navToggle?.addEventListener("click", () => {
  const open = dom.navToggle.getAttribute("aria-expanded") === "true";
  dom.navToggle.setAttribute("aria-expanded", String(!open));
  dom.nav.classList.toggle("is-open", !open);
});
dom.nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    dom.nav.classList.remove("is-open");
    dom.navToggle?.setAttribute("aria-expanded", "false");
  }
});

/** Boot: load the CMS, then paint the page. */
async function init() {
  try {
    items = await loadMenu();
    itemsById = new Map(items.map((item) => [item.id, item]));

    if (items.length === 0) {
      dom.status.textContent = "Our menu is being updated — please check back shortly.";
      return;
    }

    renderFilters();
    renderMenu();
    renderGallery();
    renderOrder();
  } catch (error) {
    console.error(error);
    dom.status.textContent =
      "We couldn't load the menu right now. Please refresh, or message us on WhatsApp.";
  }
}

init();
