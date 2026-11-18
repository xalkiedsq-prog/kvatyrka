/* KVATYRKA — input modality for programmatic focus on headings (UI26.1).
   A click counts as a pointer activation only if a pointerdown (mouse / touch / pen) happened
   on the same element just before it. Everything else — keyboard, assistive technology,
   synthetic clicks, uncertainty — is non-pointer: the focus ring is shown. */

const POINTER_TYPES = new Set(["mouse", "touch", "pen"]);
let lastPointerTarget = null;
let listening = false;

function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener("pointerdown", (event) => {
    lastPointerTarget = POINTER_TYPES.has(event.pointerType) ? event.target : null;
  }, true);
  document.addEventListener("keydown", () => {
    lastPointerTarget = null;
  }, true);
}

listen();

/** True only for a confirmed pointer activation of `element` by `clickEvent`. */
export function isPointerActivation(clickEvent, element) {
  const target = lastPointerTarget;
  lastPointerTarget = null;
  if (!target || !element.contains(target)) return false;
  if (typeof PointerEvent !== "undefined" && clickEvent instanceof PointerEvent) {
    return POINTER_TYPES.has(clickEvent.pointerType);
  }
  return clickEvent.detail > 0;   // older engines: a real click has detail ≥ 1 (supporting sign only)
}

/** Focus a heading (tabindex="-1") without scrolling; ring only for non-pointer activation. */
export function focusHeading(heading, { pointer = false } = {}) {
  if (!heading) return;
  if (pointer) {
    heading.removeAttribute("data-kbd-focus");
  } else {
    heading.setAttribute("data-kbd-focus", "");
    heading.addEventListener("blur", () => heading.removeAttribute("data-kbd-focus"), { once: true });
  }
  heading.focus({ preventScroll: true, focusVisible: !pointer });
}
