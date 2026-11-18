/* KVATYRKA — live regions for screen readers (UI22, UI24, UI25, T4).
   One polite region per place: the page region for the catalogue, the cart panel has its own
   (a modal dialog makes everything outside it inert, so a region outside would stay silent). */

let pageRegion = null;

function ensurePageRegion() {
  if (pageRegion && pageRegion.isConnected) return pageRegion;
  pageRegion = document.createElement("div");
  pageRegion.className = "visually-hidden";
  pageRegion.setAttribute("aria-live", "polite");
  pageRegion.dataset.liveRegion = "page";
  document.body.append(pageRegion);
  return pageRegion;
}

/* Clear first, then write on the next task: the same text twice in a row is announced twice. */
export function announceIn(region, message) {
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

export function announce(message) {
  announceIn(ensurePageRegion(), message);
}

export function initAnnouncer() {
  ensurePageRegion();
}
