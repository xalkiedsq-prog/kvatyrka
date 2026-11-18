/* KVATYRKA — current section in the header navigation (UI10): aria-current on the link of the
   section that is under the sticky header. Sections without a link (Hero, Roastery, Loyalty,
   footer) mark nothing. */

export function init() {
  const header = document.querySelector(".site-header");
  const links = [...document.querySelectorAll(".site-nav__link[href^='#']")];
  const sections = [...document.querySelectorAll("main > section[id]")];
  if (!header || links.length === 0 || sections.length === 0) throw new Error("navigation markup is missing");

  const linkFor = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
  let currentLink = null;
  let scheduled = false;

  function update() {
    scheduled = false;
    const probe = header.getBoundingClientRect().bottom + 1;
    let active = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) {
        active = linkFor.get(section.id) || null;
        break;
      }
    }
    if (active === currentLink) return;
    if (currentLink) currentLink.removeAttribute("aria-current");
    if (active) active.setAttribute("aria-current", "true");
    currentLink = active;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", schedule);
  update();
}
