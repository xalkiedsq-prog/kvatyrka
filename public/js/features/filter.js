/* KVATYRKA — roast level filter of the catalogue (UX14, UI19).
   Native radios: Tab enters the group on the checked option, arrows move and select.
   Another feature can reset it by checking «All» and dispatching a `change` event. */

function applyRoastFilter(value, cards) {
  for (const card of cards) {
    card.hidden = value !== "all" && card.dataset.roast !== value;
  }
}

export function init() {
  const filter = document.querySelector("[data-filter]");
  const cards = [...document.querySelectorAll(".bean-card[data-roast]")];
  if (!filter || cards.length === 0) throw new Error("filter markup is missing");

  const radios = [...filter.querySelectorAll('input[type="radio"]')];
  if (radios.length !== 5) throw new Error("filter needs 5 options");

  filter.addEventListener("change", () => {
    const checked = radios.find((radio) => radio.checked);
    applyRoastFilter(checked ? checked.value : "all", cards);
  });

  const checked = radios.find((radio) => radio.checked) || radios[0];
  checked.checked = true;
  applyRoastFilter(checked.value, cards);
}
