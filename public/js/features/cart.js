/* KVATYRKA — demo cart (UX17, UX18, UI21–UI24, T4, T6).
   Add to cart / Added on the button, header bag with counter, cart panel as a native modal <dialog>,
   demo order without forms or data. State lives in cart-store.js; names, grinds and prices are read
   from the cards every time (website-tech-spec.md §3). */

import { announce, announceIn } from "../core/announcer.js";
import { focusHeading, isPointerActivation } from "../core/focus-modality.js";
import { createCartStore, CART_LIMIT } from "./cart-store.js";

const ADDED_MS = 2000;
const LIMIT_MESSAGE = `Cart limit reached: ${CART_LIMIT} packs.`;

const items = (n) => (n === 1 ? "1 item" : `${n} items`);
const packs = (n) => (n === 1 ? "1 pack" : `${n} packs`);
const money = (n) => `${n.toLocaleString("en-US")} ₴`;

/* Coffees from the page: id → { id, name, price, grinds, select, button } */
function readCatalog() {
  const catalog = new Map();
  for (const card of document.querySelectorAll(".bean-card[data-sort-id]")) {
    const id = card.dataset.sortId;
    const name = card.querySelector(".bean-card__name")?.textContent.trim() || id;
    const select = card.querySelector(".bean-card__grind select");
    const button = card.querySelector(".bean-card__add");
    const digits = (card.querySelector(".bean-card__price-amount")?.textContent || "").replace(/\D/g, "");
    const price = Number(digits);
    if (!select || !button) {
      console.error(`[kvatyrka] cart: "${name}" has no grind or button — not available in the cart`);
      continue;
    }
    if (!digits || !Number.isInteger(price) || price <= 0) {
      console.error(`[kvatyrka] cart: the price of "${name}" cannot be read — this coffee is not added to the cart`);
      select.closest(".bean-card__grind").hidden = true;
      button.hidden = true;
      continue;
    }
    const grinds = new Set([...select.options].map((option) => option.value));
    catalog.set(id, { id, name, price, grinds, select, button });
  }
  return catalog;
}

function required(selector) {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`cart markup is missing: ${selector}`);
  return element;
}

export function init() {
  const catalog = readCatalog();
  if (catalog.size === 0) throw new Error("no coffee can be added to the cart");

  const cartButton = required("[data-cart-open]");
  const countBadge = required("[data-cart-count]");
  const panel = required("[data-cart-panel]");
  const closeButton = required("[data-cart-close]");
  const list = required("[data-cart-list]");
  const emptyState = required("[data-cart-empty]");
  const finalState = required("[data-cart-final]");
  const finalTitle = required("[data-cart-final-title]");
  const foot = required("[data-cart-foot]");
  const totalOutput = required("[data-cart-total]");
  const itemsOutput = required("[data-cart-items]");
  const orderButton = required("[data-cart-order]");
  const browseLink = required("[data-cart-browse]");
  const visitLink = required("[data-cart-visit]");
  const panelLive = required("[data-cart-live]");
  const template = required("#cart-line-template");
  const navBeans = required('.site-nav__link[href="#beans"]');
  if (typeof panel.showModal !== "function") throw new Error("<dialog> is not supported");

  const store = createCartStore((id, grind) => catalog.has(id) && catalog.get(id).grinds.has(grind));
  const addedTimers = new WeakMap();
  let limitAnnounced = false;
  let showingFinal = false;
  let pendingNavigation = null;   // { target, pointer } — set by links in the panel

  /* ---------- header bag ---------- */

  function updateBadge() {
    const total = store.total;
    countBadge.textContent = String(total);
    cartButton.toggleAttribute("data-wide", total > 9);
    cartButton.setAttribute("aria-label", `Cart, ${items(total)}`);
    cartButton.hidden = total === 0;
  }

  /* ---------- Add to cart ---------- */

  function showAdded(button) {
    button.dataset.state = "added";
    window.clearTimeout(addedTimers.get(button));
    addedTimers.set(button, window.setTimeout(() => delete button.dataset.state, ADDED_MS));
  }

  function addToCart(coffee) {
    const grind = coffee.select.value;
    if (!coffee.grinds.has(grind)) return;
    if (!store.add(coffee.id, grind)) {
      if (!limitAnnounced) {
        limitAnnounced = true;
        announce(LIMIT_MESSAGE);
      }
      return;
    }
    showAdded(coffee.button);
    announce(`${coffee.name}, ${grind} — added to cart`);
  }

  for (const coffee of catalog.values()) {
    coffee.button.addEventListener("click", () => addToCart(coffee));
  }

  /* ---------- panel rendering ---------- */

  function updateSummary() {
    const lines = store.lines;
    const total = lines.reduce((sum, line) => sum + line.qty, 0);
    const amount = lines.reduce((sum, line) => sum + line.qty * catalog.get(line.sortId).price, 0);
    itemsOutput.textContent = items(total);
    totalOutput.textContent = money(amount);
    const atLimit = total >= CART_LIMIT;
    for (const plus of list.querySelectorAll("[data-line-plus]")) plus.disabled = atLimit;
  }

  function fillLine(li, line) {
    const coffee = catalog.get(line.sortId);
    li.querySelector("[data-line-qty]").textContent = String(line.qty);
    li.querySelector("[data-line-price]").textContent = money(line.qty * coffee.price);
    const minus = li.querySelector("[data-line-minus]");
    if (line.qty <= 1) minus.setAttribute("aria-disabled", "true");
    else minus.removeAttribute("aria-disabled");
  }

  function buildLine(line) {
    const coffee = catalog.get(line.sortId);
    const li = template.content.firstElementChild.cloneNode(true);
    const label = `${coffee.name}, ${line.grind}`;
    li.querySelector("[data-line-name]").textContent = coffee.name;
    li.querySelector("[data-line-grind]").textContent = `${line.grind} · 250 g`;
    li.querySelector("[data-line-remove]").setAttribute("aria-label", `Remove ${label}`);
    li.querySelector("[data-line-minus]").setAttribute("aria-label", `Remove one pack: ${label}`);
    li.querySelector("[data-line-plus]").setAttribute("aria-label", `Add one pack: ${label}`);
    fillLine(li, line);
    return li;
  }

  function showState() {
    const hasLines = store.total > 0;
    list.hidden = !hasLines || showingFinal;
    foot.hidden = !hasLines || showingFinal;
    emptyState.hidden = hasLines || showingFinal;
    finalState.hidden = !showingFinal;
  }

  function renderPanel() {
    list.replaceChildren(...store.lines.map(buildLine));
    showState();
    updateSummary();
  }

  /* ---------- panel actions ---------- */

  function lineIndex(li) {
    return [...list.children].indexOf(li);
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !list.contains(button)) return;
    const li = button.closest("li");
    const index = lineIndex(li);
    const line = store.lines[index];
    if (!line) return;
    const coffee = catalog.get(line.sortId);

    if (button.matches("[data-line-minus]")) {
      if (button.getAttribute("aria-disabled") === "true") return;      // qty 1: nothing, no announcement
      if (!store.decrement(index)) return;
      const updated = store.lines[index];
      fillLine(li, updated);
      updateSummary();
      announceIn(panelLive, `${coffee.name}, ${line.grind}: ${packs(updated.qty)}`);
      return;
    }

    if (button.matches("[data-line-plus]")) {
      if (button.disabled) return;
      const hadFocus = document.activeElement === button;
      if (!store.increment(index)) return;
      const updated = store.lines[index];
      fillLine(li, updated);
      updateSummary();                                                   // may disable every «+»
      let message = `${coffee.name}, ${line.grind}: ${packs(updated.qty)}`;
      if (store.total >= CART_LIMIT) {
        if (hadFocus) li.querySelector("[data-line-minus]").focus();      // a disabled button loses focus
        if (!limitAnnounced) {
          limitAnnounced = true;
          message += `. ${LIMIT_MESSAGE}`;
        }
      }
      announceIn(panelLive, message);
      return;
    }

    if (button.matches("[data-line-remove]")) {
      store.remove(index);
      li.remove();
      updateSummary();
      const next = list.children[index] || list.children[index - 1];
      if (next) {
        next.querySelector("[data-line-minus]").focus();
      } else {
        showState();
        browseLink.focus();
      }
      announceIn(panelLive, `${coffee.name}, ${line.grind} removed from cart`);
    }
  });

  orderButton.addEventListener("click", (event) => {
    const pointer = isPointerActivation(event, orderButton);
    store.clear();
    showingFinal = true;
    list.replaceChildren();
    showState();
    updateSummary();
    focusHeading(finalTitle, { pointer });
  });

  function navigateFromPanel(event, link) {
    event.preventDefault();
    const target = document.getElementById(link.getAttribute("href").slice(1));
    pendingNavigation = target ? { target, pointer: isPointerActivation(event, link) } : null;
    closePanel();
  }

  browseLink.addEventListener("click", (event) => navigateFromPanel(event, browseLink));
  visitLink.addEventListener("click", (event) => navigateFromPanel(event, visitLink));
  closeButton.addEventListener("click", () => closePanel());

  // Click on the dimmed page (768+) closes the panel; the page below is not activated
  panel.addEventListener("click", (event) => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) closePanel();
  });

  /* Closing does not depend on the dialog «close» event alone: some engines do not fire it reliably
     (seen in Chromium 156 during the 8.6 check). Every way out runs afterClose() once. */
  let isOpen = false;

  function openPanel() {
    showingFinal = false;
    renderPanel();
    document.documentElement.classList.add("cart-open");
    panel.showModal();
    isOpen = true;
    closeButton.focus();
  }

  function closePanel() {
    if (panel.open) panel.close();
    afterClose();
  }

  function afterClose() {
    if (!isOpen) return;
    isOpen = false;
    document.documentElement.classList.remove("cart-open");
    showingFinal = false;
    const navigation = pendingNavigation;
    pendingNavigation = null;

    if (navigation) {
      const { target, pointer } = navigation;
      target.scrollIntoView({ block: "start" });
      if (location.hash !== `#${target.id}`) history.pushState(null, "", `#${target.id}`);
      focusHeading(target.querySelector("h2") || target, { pointer });
      return;
    }
    if (store.total > 0) {
      cartButton.focus();
    } else {
      // The bag is gone (UX18): focus the «Beans» item without scrolling, ring visible (UI24.3)
      navBeans.setAttribute("data-kbd-focus", "");
      navBeans.addEventListener("blur", () => navBeans.removeAttribute("data-kbd-focus"), { once: true });
      navBeans.focus({ preventScroll: true, focusVisible: true });
    }
  }

  cartButton.addEventListener("click", openPanel);

  // Escape closes through closePanel(), so our focus return runs after the browser's own one
  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closePanel();
  });
  panel.addEventListener("cancel", (event) => {
    if (event.cancelable) {
      event.preventDefault();
      closePanel();
    } else {
      window.setTimeout(() => { if (!panel.open) afterClose(); }, 0);
    }
  });
  panel.addEventListener("close", afterClose);

  /* ---------- state ---------- */

  store.subscribe(() => {
    updateBadge();
    if (store.total < CART_LIMIT) limitAnnounced = false;
  });
  updateBadge();
}
