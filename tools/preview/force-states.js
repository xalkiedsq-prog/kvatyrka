/* Preview helper (not published).
   Copies the site's real :hover / :active / :focus-visible rules into class twins
   (.is-hover / .is-active / .is-focus) so every state can be shown side by side.
   Nothing is restated by hand: what you see is exactly what the site CSS says. */

const STATES = [
  [/:hover/g, ".is-hover"],
  [/:active/g, ".is-active"],
  [/:focus-visible/g, ".is-focus"],
];

function twinSelector(selectorText) {
  let changed = false;
  let result = selectorText;
  for (const [pattern, replacement] of STATES) {
    if (pattern.test(result)) {
      changed = true;
      result = result.replace(pattern, replacement);
    }
  }
  return changed ? result : null;
}

function collect(rules, out) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      const twin = twinSelector(rule.selectorText);
      if (twin) out.push(`${twin} { ${rule.style.cssText} }`);
    } else if (rule instanceof CSSMediaRule && rule.conditionText.includes("hover")) {
      collect(rule.cssRules, out);   // preview acts as a hover-capable device
    }
  }
}

const twins = [];
for (const sheet of document.styleSheets) {
  if (!sheet.href || !sheet.href.includes("/public/css/")) continue;
  collect(sheet.cssRules, twins);
}

const style = document.createElement("style");
style.textContent = twins.join("\n");
document.head.append(style);
document.documentElement.dataset.forcedRules = String(twins.length);
