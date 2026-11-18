# Assets — sources and preparation

All files in `public/assets` are copies or web exports of approved materials, or replaceable placeholders. Originals were only read, never changed. Re-create with `tools/prepare_assets.py`.

## Fonts — `public/assets/fonts`

| File | Source | Notes |
|---|---|---|
| `geologica-regular.woff` / `-medium.woff` / `-semibold.woff` | `Fonts\Geologica[CRSV,SHRP,slnt,wght].ttf` (variable, v1.010) | Static instances wght 400 / 500 / 600 with CRSV 0, SHRP 0, slnt 0 (the font's named Regular / Medium / SemiBold). Subset: Latin, Cyrillic incl. Ukrainian, punctuation, ₴. WOFF (zlib). WOFF2 possible later (needs `brotli`). |
| `OFL.txt` | `Fonts\OFL_Geologica.txt` | Licence kept next to the fonts. |

## Brand — `public/assets/brand` and favicons in `public/`

| File | Source |
|---|---|
| `logo-h-light.svg`, `logo-h-dark.svg` | `Logo\Export\SVG\Kvatyrka_Logo_H_LIGHT.svg`, `…_H_DARK.svg` — byte-identical copies |
| `k5-light.svg`, `k5-dark.svg` | original K5 master SVGs `k5-master-light.svg`, `k5-master-dark.svg` (sun cut-out is an SVG mask) — byte-identical copies |
| `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` | `Logo\Export\Favicon\` (favicon v1) — copies. `site.webmanifest` is not used (`manifest-src 'none'`). |

## Images (AVIF + WebP, several widths)

| Stem | Source | Widths |
|---|---|---|
| `label/ethiopia-label` | `Pack250\_preview_v11\LABEL_ETH_1to1.png` (clean sticker, 1974 × 1392) | 660, 1320 |
| `loyalty/loyalty-card-front` | `LoyaltyCard\Preview\_export_raw\900ppi\CARD_FRONT.png` (export of `Kvatyrka_LoyaltyCard_FINAL.ai`, 3189 × 1772) | 520, 1040, 1560 |

## Placeholders (replace by files with the same names)

Cream `#F6EEDF` surface, 1 px Espresso `#3B2A22` outline, small label. They do not imitate photos or packaging.

| Stem | Ratio | Widths |
|---|---|---|
| `photos/f1-hero-window` | 411 : 632 (arch) | 420, 840 |
| `photos/f2-visit-entrance`, `photos/f5-roastery` | 4 : 3 | 480, 960, 1480 |
| `photos/f3-menu-espresso`, `photos/f4-menu-filter` | 4 : 3 | 480, 1040 |
| `photos/f6-story` | 4 : 5 | 420, 840, 1260 |
| `photos/f7-beans`, `photos/district-map` | 4 : 3 | 480, 960, 1260 |
| `packs/kenya-front`, `packs/sadova-8-blend-front`, `packs/indonesia-front` | 7 : 12 | 300, 600 |

## Not yet prepared

- **Pack fronts Ethiopia, Colombia, Brazil** — `Pack250\_preview_v11\LINEUP_*.png` contain technical guides (seam lines, labels) and cannot be used on the site. Clean fronts are exported from the approved `Kvatyrka_Pack250_composition_study_v11_F2a.ai` (file opened read-only, closed without saving) in step 8.5, with the crop used in v50.
