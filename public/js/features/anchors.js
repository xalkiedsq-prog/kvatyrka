/* KVATYRKA — in-page links (UI26, UI26.1): instant scroll, focus moves to the target heading.
   Links to coffee cards are handled by menu-to-sort.js, links inside the cart panel by cart.js. */

import { isPointerActivation, focusHeading } from "../core/focus-modality.js";

function headingFor(target) {
  if (target.matches("h1, h2, h3")) return target;
  if (target.id === "hero") return target.querySelector("h1");
  if (target.matches("section")) return target.querySelector("h2");
  return null;
}

export function goToTarget(target, { pointer = false } = {}) {
  const heading = headingFor(target);
  if (!heading) return false;
  if (target.id === "hero") {
    window.scrollTo(0, 0);
  } else {
    target.scrollIntoView({ block: "start" });   // scroll-margin-top keeps it below the sticky header
  }
  if (location.hash !== `#${target.id}`) history.pushState(null, "", `#${target.id}`);
  focusHeading(heading, { pointer });
  return true;
}

function onClick(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.closest("dialog")) return;
  const id = decodeURIComponent(link.getAttribute("href").slice(1));
  if (!id || id.startsWith("sort-")) return;
  const target = document.getElementById(id);
  if (!target || !headingFor(target)) return;      // e.g. the skip link keeps its native behaviour
  event.preventDefault();
  goToTarget(target, { pointer: isPointerActivation(event, link) });
}

export function init() {
  document.addEventListener("click", onClick);
}
