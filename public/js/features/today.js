/* KVATYRKA — "today" (UX6, UI28.8, website-tech-spec.md §5.3).
   The day is taken in Europe/Kyiv, whatever the visitor's time zone. No open / closed status, no network.
   The schedule in the Visit section is the single source of the hours. */

const TIME_ZONE = "Europe/Kyiv";

function kyivWeekday(date = new Date()) {
  // "Mon", "Tue", … in English, independent of the visitor's locale
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(date);
}

export function init() {
  const day = kyivWeekday();
  const row = [...document.querySelectorAll("[data-hours] [data-days]")]
    .find((item) => item.dataset.days.split(" ").includes(day));
  if (!row) throw new Error(`no schedule row for ${day}`);

  const time = row.querySelector("[data-hours-time]");
  const heroHours = document.querySelector("[data-today-hours]");
  if (!time || !heroHours) throw new Error("schedule markup is incomplete");

  heroHours.textContent = time.textContent;

  const mark = document.createElement("span");
  mark.className = "hours__today t-small";
  mark.textContent = "Today";
  time.after(mark);
}
