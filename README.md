# KVATYRKA — fictional concept project

**KVATYRKA is a fictional concept project.** It presents an imagined Ukrainian neighbourhood coffee shop and roastery. The business, address, opening hours, prices and loyalty terms are invented for demonstration. The site takes no real orders, accepts no payments and collects no personal data.

**Live site:** the link will be added after publication.

## Stack

- Plain HTML, CSS and JavaScript (ES modules). No frameworks, no build step, no third-party libraries.
- All content is readable without JavaScript. Interactive parts (today's hours, roast filter, grind, demo cart) appear only after they have started successfully.
- No external requests. Fonts, icons and images are served from this site. A Content-Security-Policy is set in `public/_headers`.
- No cookies, no analytics scripts. The demo cart is kept in `sessionStorage` (roast, grind, quantity only) or in memory.
- Hosting: Cloudflare Pages (static, output folder `public`).

## Run locally

From the `public` folder, start any simple static server, for example:

```
py -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000`. Stop the server with `Ctrl+C` when you are done.

## Structure

- `public/` — the published site.
- `tools/` — one-off helpers, not published (asset preparation, notes).
- `LICENSES/` — licences of third-party fonts and icons.

## Licences

- **Geologica** typeface — SIL Open Font License 1.1 (`LICENSES/OFL-Geologica.txt`, also next to the font files in `public/assets/fonts/OFL.txt`). Web files are subsets of the original font.
- **Lucide** icons — ISC License (`LICENSES/ISC-Lucide.txt`).
- KVATYRKA name, logo, packaging and loyalty card are part of this concept project.
