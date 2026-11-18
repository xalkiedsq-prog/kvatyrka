# Assets — sources and preparation

All files in `public/assets` are copies or web exports of approved materials (no placeholders remain since 18.11.2026). Originals were only read, never changed. Re-create with `tools/prepare_assets.py`.

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

## Photos F1–F7 — `public/assets/photos` (approved masters, 18.11.2026)

Source: `Website\Photos\04_masters` (PNG, RGB, embedded sRGB IEC61966-2.1, no alpha; approval log — `website-photo-brief.md` §8–15). Resized with Lanczos, AVIF + WebP; the script writes them without ICC / EXIF / GPS. Quality AVIF / WebP 60 / 82; F3 and F7 68 / 86. The committed files additionally carry a C2PA content-credentials manifest (≈ 5.9 KB per file) added when the files were delivered from the AI workspace; pixels are identical to the script output. In `index.html` every F1–F7 URL carries `?v=20261118`: the files keep the placeholder names and `/assets/photos/*` is cached for a day (`_headers`), so the version mark makes browsers that saw the placeholders load the new photos. Change the mark whenever a photo file is replaced under the same name.

| Stem | Master | Widths | Largest AVIF |
|---|---|---|---|
| `photos/f1-hero-window` | `F1_hero-window_master_909x1399.png` (arch 410.667 : 632) | 420, 840 | 72 KB |
| `photos/f2-visit-entrance` | `F2_visit-entrance_master_4x3_2048x1536.png` | 480, 960, 1480 | 158 KB |
| `photos/f2-visit-entrance-portrait` | `F2_visit-entrance-portrait_master_3x4_1152x1536.png` (< 768 px) | 480, 960 | 117 KB |
| `photos/f3-menu-espresso` | `F3_menu-espresso_master_1040x780.png` | 480, 1040 | 83 KB |
| `photos/f4-menu-filter` | `F4_menu-pourover_master_1040x780.png` | 480, 1040 | 60 KB |
| `photos/f5-roastery` | `F5_roastery_master_1480x1110.png` | 480, 960, 1480 | 85 KB |
| `photos/f6-story` | `F6_story_master_1260x1575.png` | 420, 840, 1260 | 91 KB |
| `photos/f7-beans` | `F7_beans_master_1260x945.png` (pack fronts composited from the approved v11_F2a exports) | 480, 960, 1260 | 83 KB |

## Realistic packs — `public/assets/packs` (owner's approval 18.11.2026)

Six catalogue packs on one blank 3D mockup: `Pack250\_mockup_3d_v1\Kvatyrka_pack_3d_master.psd` (blank mockup ×2 Preserve Details 2.0, the six approved fronts of `Kvatyrka_Pack250_composition_study_v16_F2a_6SORTS.ai` as smart objects, light and texture of the blank pouch in Multiply). Source of the web files: the transparent exports `Pack250\_mockup_3d_v1\exports\Kvatyrka_pack3d_<N>_<sort>_transparent_2048x3072.png` (sRGB). `make_packs()` crops all six to the same bag box (1431 × 2427 px, ratio 0.590), resizes with premultiplied alpha (no halo) and keeps the alpha channel; AVIF 70 / WebP 86, no ICC / EXIF. Written on the owner's computer, so the files carry no C2PA data. New file names (`-pack3d-`) — no stale browser cache. The flat fronts (`packs/*-front-*`, ART18 v1) and the three pack placeholders were removed; the catalogue `img` has `width="300" height="509"`, the same box as before (height 80 % of the 4 : 3 zone).

| Stem | Export | Widths | AVIF 300 / 600 |
|---|---|---|---|
| `packs/ethiopia-pack3d` | `…_1_Ethiopia_transparent_…` | 300, 600 | 12 / 32 KB |
| `packs/kenya-pack3d` | `…_2_Kenya_transparent_…` | 300, 600 | 12 / 32 KB |
| `packs/colombia-pack3d` | `…_3_Colombia_transparent_…` | 300, 600 | 12 / 33 KB |
| `packs/brazil-pack3d` | `…_4_Brazil_transparent_…` | 300, 600 | 13 / 33 KB |
| `packs/sadova-8-blend-pack3d` | `…_5_Sadova8_transparent_…` | 300, 600 | 13 / 33 KB |
| `packs/indonesia-pack3d` | `…_6_Indonesia_transparent_…` | 300, 600 | 12 / 32 KB |

## District scheme — `public/assets/photos/district-map` (18.11.2026)

Concept scheme, not a real map (ART14): vector master `Website\Map\Kvatyrka_District_Map_v01.svg` (628 × 471, opens in Illustrator), rendered at 4× to `Kvatyrka_District_Map_v01_2512x1884.png`. Only data that already exist on the site: Sadova St., No. 8 (K5 master `k5-light.svg`, geometry unchanged, 64 px), the square (`A few steps from the square`), `CONCEPT LOCATION` on the scheme; cross streets have no names (Q5 postponed). «Вершки» background, blocks — 1 px «Еспресо» outline, Sadova St. — 1.5 px edges, the square — «Листок» `#7FA27A`; labels Geologica Medium, caps, 22 px, tracking 80 (≈ 11.5 px at 360). `make_district_map()`: AVIF / WebP 80 / 90 (flat graphics with small type), widths 480, 960, 1260; 5–14 KB AVIF. URLs carry `?v=20261118` (same file names as the former placeholder, `/assets/photos/*` cached for a day).

## Pack fronts for the F7 composite

`tools/source-exports/pack-front-{ethiopia,colombia,brazil}.png` — clean fronts exported from the approved `Kvatyrka_Pack250_composition_study_v11_F2a.ai` (technical layers hidden, file closed without saving). Used only as the sources of the F7 photo composite; the catalogue uses the realistic packs above.

## Social preview (Open Graph / Twitter) — `public/assets/social`

| File | Source | Notes |
|---|---|---|
| `og-image-1200x630.jpg` | `public/assets/photos/f1-hero-window-840.webp` (approved F1, unchanged, in the Hero arch shape ART3) + `public/assets/brand/logo-h-light.svg` (approved logo B LIGHT, unchanged) | Layout `tools/social/og-image-layout.html` (Вершки background, Label style for «Coffee shop & roastery · Concept project», arch outline 1 px Еспресо as in Hero). Rendered in Chromium at 2×, downsampled to 1200 × 630, JPEG q86, progressive, 4:4:4, no metadata (≈ 71 KB). Stage 9, 18.11.2026. |
