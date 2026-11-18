/* KVATYRKA — module loader with per-feature isolation (website-tech-spec.md §5.1).
   Nothing is imported statically: each feature is loaded on its own with import() and started
   inside its own try / catch, all in parallel (Promise.allSettled). A file that fails to load or a
   failing init() only switches its own feature off; the others keep working.
   After a successful init() the feature's ready class is put on <html>; without it the feature's
   interactive parts stay hidden (§6). */

const root = document.documentElement;

const features = [
  { name: "focus-modality", load: () => import("./core/focus-modality.js") },
  { name: "anchors", load: () => import("./features/anchors.js") },
  { name: "current-section", load: () => import("./features/current-section.js") },
  { name: "today", load: () => import("./features/today.js"), ready: "ready-today" },
  { name: "filter", load: () => import("./features/filter.js"), ready: "ready-filter" },
  { name: "menu-to-sort", load: () => import("./features/menu-to-sort.js") },
  { name: "cart", load: () => import("./features/cart.js"), ready: "ready-cart" },
];

async function start(feature) {
  try {
    const module = await feature.load();
    if (typeof module.init === "function") await module.init();
    if (feature.ready) root.classList.add(feature.ready);
  } catch (error) {
    console.error(`[kvatyrka] feature "${feature.name}" is off:`, error);
  }
}

Promise.allSettled(features.map(start));
