/* KVATYRKA — from a drink in Menu to its coffee card (UX13, UI25).
   Card top 24 px below the header (CSS scroll-margin-top), focus on the coffee name,
   temporary target frame on the card (data-menu-target) until the first user action. */

import { announce } from "../core/announcer.js";

let current = null;          // { card, name }
let triggerClick = null;     // the click that started the move must not clear the frame

function clearTarget() {
  if (!current) return;
  current.card.removeAttribute("data-menu-target");
  current = null;
}

function goToSort(card, event) {
  // A level filter that hides the coffee is reset to «All» first, announced once
  if (card.hidden) {
    const all = document.querySelector('[data-filter] input[value="all"]');
    if (all) {
      all.checked = true;
      all.dispatchEvent(new Event("change", { bubbles: true }));
      announce("Roast level filter reset to All");
    }
  }

  clearTarget();
  const name = card.querySelector(".bean-card__name");
  card.scrollIntoView({ block: "start" });
  if (location.hash !== `#${card.id}`) history.pushState(null, "", `#${card.id}`);
  card.setAttribute("data-menu-target", "");
  current = { card, name };
  triggerClick = event;
  name.focus({ preventScroll: true });
}

export function init() {
  const menu = document.getElementById("menu");
  if (!menu) throw new Error("menu section is missing");

  menu.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#sort-"]');
    if (!link) return;
    const card = document.getElementById(link.getAttribute("href").slice(1));
    if (!card) return;
    event.preventDefault();
    goToSort(card, event);
  });

  // (a) focus moves anywhere except the coffee name
  document.addEventListener("focusin", (event) => {
    if (current && event.target !== current.name) clearTarget();
  });

  // (b) the first click or tap anywhere (not pointerdown: scrolling by touch keeps the frame)
  document.addEventListener("click", (event) => {
    if (event === triggerClick) return;
    clearTarget();
  });
}
