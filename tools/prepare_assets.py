"""KVATYRKA website — one-off asset preparation (not part of the published site).

Creates web copies of approved materials and replaceable placeholders.
Originals are only read, never modified.

Requirements: Python 3.11+, Pillow (with AVIF and WebP support), fontTools.
Usage:  python tools/prepare_assets.py <source-folder> <public-folder> <photo-masters-folder> <pack3d-folder>

<source-folder> must contain copies of:
  Geologica-VF.ttf, OFL_Geologica.txt, LABEL_ETH_1to1.png, CARD_FRONT.png
(pack-front-{ethiopia,colombia,brazil}.png in tools/source-exports are kept as the sources of the F7 photo
composite; the catalogue no longer uses flat fronts.) The pack fronts are exported (1200 px wide) from the approved Pack250/Kvatyrka_Pack250_composition_study_v11_F2a.ai,
artboards LINEUP_ETH / LINEUP_COL / LINEUP_BRA, with the technical layers 00_INFO, 01_DIELINE_TECH, 09_ANNOT,
10_3D_PREVIEW hidden; the source file is closed without saving. Copies: tools/source-exports/.

<pack3d-folder> is Pack250/_mockup_3d_v1/exports: the approved realistic packs of the six coffees
(transparent PNG 2048 × 3072, sRGB, from Kvatyrka_pack_3d_master.psd — one blank mockup, the six
approved fronts of Kvatyrka_Pack250_composition_study_v16_F2a_6SORTS.ai; owner's approval 18.11.2026).
They replace the flat pack fronts of the catalogue (ART18 revised by the owner).

<photo-masters-folder> is Website/Photos/04_masters (approved masters F1–F7: PNG, RGB, embedded sRGB,
no alpha; see website-photo-brief.md). The masters are only resized and encoded; all metadata
(ICC, EXIF, GPS) is dropped from the web files — browsers treat untagged images as sRGB.
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image, ImageDraw, ImageFont

CREAM = (246, 238, 223)    # «Вершки»  #F6EEDF
ESPRESSO = (59, 42, 34)    # «Еспресо» #3B2A22

# Latin + Cyrillic (incl. Ukrainian), punctuation, hryvnia sign
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0400-045F,U+0490-0491,U+2000-206F,U+20B4,U+2116,U+2122,U+2190-2193,U+2212"
)
WEIGHTS = {400: "regular", 500: "medium", 600: "semibold"}

# Placeholders: file stem -> (aspect w, aspect h, widths, label)
PLACEHOLDERS = {
    "photos/district-map":        (4, 3,     [480, 960, 1260],  "Map placeholder"),
}


# Approved photo masters (Website/Photos/04_masters) -> file stem, widths, (AVIF, WebP) quality.
# F3 and F7 (fine detail: steel texture, pack labels) use a higher quality; all stay within the budgets
# of website-photo-brief.md §5.3.
MASTERS = {
    "photos/f1-hero-window":             ("F1_hero-window_master_909x1399.png",                  [420, 840],        (60, 82)),
    "photos/f2-visit-entrance":          ("F2_visit-entrance_master_4x3_2048x1536.png",          [480, 960, 1480],  (60, 82)),
    "photos/f2-visit-entrance-portrait": ("F2_visit-entrance-portrait_master_3x4_1152x1536.png", [480, 960],        (60, 82)),
    "photos/f3-menu-espresso":           ("F3_menu-espresso_master_1040x780.png",                [480, 1040],       (68, 86)),
    "photos/f4-menu-filter":             ("F4_menu-pourover_master_1040x780.png",                [480, 1040],       (60, 82)),
    "photos/f5-roastery":                ("F5_roastery_master_1480x1110.png",                    [480, 960, 1480],  (60, 82)),
    "photos/f6-story":                   ("F6_story_master_1260x1575.png",                       [420, 840, 1260],  (60, 82)),
    "photos/f7-beans":                   ("F7_beans_master_1260x945.png",                        [480, 960, 1260],  (68, 86)),
}


def save_web(img: Image.Image, stem: Path, width: int, quality: tuple[int, int] = (60, 82)) -> None:
    """Save one width as AVIF and WebP, without metadata."""
    h = round(img.height * width / img.width)
    im = img.resize((width, h), Image.LANCZOS) if img.width != width else img
    im = Image.frombytes("RGB", im.size, im.convert("RGB").tobytes())   # drop ICC / EXIF / GPS
    stem.parent.mkdir(parents=True, exist_ok=True)
    im.save(f"{stem}-{width}.avif", quality=quality[0])
    im.save(f"{stem}-{width}.webp", quality=quality[1], method=6)


def make_fonts(src: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for wght, name in WEIGHTS.items():
        font = instancer.instantiateVariableFont(
            TTFont(src / "Geologica-VF.ttf"),
            {"wght": wght, "CRSV": 0, "SHRP": 0, "slnt": 0},
        )
        opts = subset.Options()
        opts.flavor = "woff"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=subset.parse_unicodes(UNICODES))
        sub.subset(font)
        font.flavor = "woff"
        font.save(out / f"geologica-{name}.woff")
    (out / "OFL.txt").write_bytes((src / "OFL_Geologica.txt").read_bytes())


def placeholder(aw: int, ah: int, label: str, font_file: Path, base_w: int = 1600,
                bg=CREAM, ink=ESPRESSO) -> Image.Image:
    """Flat surface, 1 px outline at the largest size, small label. No imitation of a photo."""
    w, h = base_w, round(base_w * ah / aw)
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    line = max(2, w // 400)
    d.rectangle([0, 0, w - 1, h - 1], outline=ink, width=line)
    font = ImageFont.truetype(str(font_file), size=max(28, w // 22))
    tw = d.textlength(label, font=font)
    d.text(((w - tw) / 2, h / 2), label, fill=ink, font=font, anchor="lm")
    return img


# Realistic packs: catalogue file stem -> transparent export in <pack3d-folder>
PACKS3D = {
    "packs/ethiopia-pack3d":       "Kvatyrka_pack3d_1_Ethiopia_transparent_2048x3072.png",
    "packs/kenya-pack3d":          "Kvatyrka_pack3d_2_Kenya_transparent_2048x3072.png",
    "packs/colombia-pack3d":       "Kvatyrka_pack3d_3_Colombia_transparent_2048x3072.png",
    "packs/brazil-pack3d":         "Kvatyrka_pack3d_4_Brazil_transparent_2048x3072.png",
    "packs/sadova-8-blend-pack3d": "Kvatyrka_pack3d_5_Sadova8_transparent_2048x3072.png",
    "packs/indonesia-pack3d":      "Kvatyrka_pack3d_6_Indonesia_transparent_2048x3072.png",
}


def make_packs(pack3d: Path, assets: Path, widths=(300, 600), quality=(70, 86)) -> None:
    """Crop each transparent pack to the bag (the same box for all six: one mockup), resize with
    premultiplied alpha (no halo), keep the alpha channel; AVIF + WebP, no ICC / EXIF."""
    boxes = {stem: Image.open(pack3d / name).getchannel("A").getbbox() for stem, name in PACKS3D.items()}
    box = next(iter(boxes.values()))
    assert all(b == box for b in boxes.values()), boxes
    for stem, name in PACKS3D.items():
        im = Image.open(pack3d / name).convert("RGBA").crop(box)
        for wdt in widths:
            hgt = round(im.height * wdt / im.width)
            small = im.convert("RGBa").resize((wdt, hgt), Image.LANCZOS).convert("RGBA")
            clean = Image.frombytes("RGBA", small.size, small.tobytes())
            clean.save(assets / f"{stem}-{wdt}.avif", quality=quality[0])
            clean.save(assets / f"{stem}-{wdt}.webp", quality=quality[1], method=6)


def main(src: Path, public: Path, masters: Path, pack3d: Path) -> None:
    assets = public / "assets"
    make_fonts(src, assets / "fonts")

    label_font = src / "_label-font.ttf"
    TTFont(src / "Geologica-VF.ttf")  # sanity check
    inst = instancer.instantiateVariableFont(
        TTFont(src / "Geologica-VF.ttf"), {"wght": 500, "CRSV": 0, "SHRP": 0, "slnt": 0}
    )
    inst.save(label_font)

    for stem, (aw, ah, widths, label) in PLACEHOLDERS.items():
        img = placeholder(aw, ah, label, label_font)
        for wdt in widths:
            save_web(img, assets / stem, wdt)

    # Approved photo masters F1–F7 (replace the former placeholders, same file names)
    for stem, (name, widths, quality) in MASTERS.items():
        img = Image.open(masters / name).convert("RGB")
        for wdt in widths:
            save_web(img, assets / stem, wdt, quality)

    # Realistic packs of the six coffees (catalogue cards)
    make_packs(pack3d, assets)

    # The label itself, 106 × 72 mm, without the 5 mm white margin of the LABEL_ETH_1to1 artboard
    # (1974 × 1392 px export: 85 px margin, label 1804 × 1225 px); rounded corners are drawn by CSS.
    label = Image.open(src / "LABEL_ETH_1to1.png").convert("RGB").crop((85, 85, 1889, 1310))
    for wdt in (660, 1320):
        save_web(label, assets / "label/ethiopia-label", wdt)

    card = Image.open(src / "CARD_FRONT.png").convert("RGB")
    for wdt in (520, 1040, 1560):
        save_web(card, assets / "loyalty/loyalty-card-front", wdt)

    label_font.unlink()


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4]))
