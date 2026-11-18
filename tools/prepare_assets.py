"""KVATYRKA website — one-off asset preparation (not part of the published site).

Creates web copies of approved materials and replaceable placeholders.
Originals are only read, never modified.

Requirements: Python 3.11+, Pillow (with AVIF and WebP support), fontTools.
Usage:  python tools/prepare_assets.py <source-folder> <public-folder>

<source-folder> must contain copies of:
  Geologica-VF.ttf, OFL_Geologica.txt, LABEL_ETH_1to1.png, CARD_FRONT.png,
  pack-front-{ethiopia,colombia,brazil}.png
The pack fronts are exported (1200 px wide) from the approved Pack250/Kvatyrka_Pack250_composition_study_v11_F2a.ai,
artboards LINEUP_ETH / LINEUP_COL / LINEUP_BRA, with the technical layers 00_INFO, 01_DIELINE_TECH, 09_ANNOT,
10_3D_PREVIEW hidden; the source file is closed without saving. Copies: tools/source-exports/.
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
    "photos/f2-visit-entrance":   (4, 3,     [480, 960, 1480],  "Photo placeholder · F2"),
    "photos/f2-visit-entrance-portrait": (3, 4, [480, 960],     "Photo placeholder · F2"),  # < 768 px (3 : 4)
    "photos/f3-menu-espresso":    (4, 3,     [480, 1040],       "Photo placeholder · F3"),
    "photos/f4-menu-filter":      (4, 3,     [480, 1040],       "Photo placeholder · F4"),
    "photos/f6-story":            (4, 5,     [420, 840, 1260],  "Photo placeholder · F6"),
    "photos/f7-beans":            (4, 3,     [480, 960, 1260],  "Photo placeholder · F7"),
    "photos/district-map":        (4, 3,     [480, 960, 1260],  "Map placeholder"),
    "packs/kenya-front":          (7, 12,    [300, 600],        "Pack placeholder"),
    "packs/sadova-8-blend-front": (7, 12,    [300, 600],        "Pack placeholder"),
    "packs/indonesia-front":      (7, 12,    [300, 600],        "Pack placeholder"),
}


def save_web(img: Image.Image, stem: Path, width: int) -> None:
    """Save one width as AVIF and WebP."""
    h = round(img.height * width / img.width)
    im = img.resize((width, h), Image.LANCZOS) if img.width != width else img
    stem.parent.mkdir(parents=True, exist_ok=True)
    im.save(f"{stem}-{width}.avif", quality=60)
    im.save(f"{stem}-{width}.webp", quality=82, method=6)


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


def main(src: Path, public: Path) -> None:
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

    # F5 sits in the dark Roastery section (v50): Espresso surface, Cream outline and label
    f5 = placeholder(4, 3, "Photo placeholder · F5", label_font, bg=ESPRESSO, ink=CREAM)
    for wdt in (480, 960, 1480):
        save_web(f5, assets / "photos/f5-roastery", wdt)

    # F1 sits in the arch: no rectangular outline (the arch outline and mullion are drawn by CSS,
    # .arch--placeholder); short label in the left pane so the mullion never crosses it.
    f1 = Image.new("RGB", (1644, round(1644 * 632 / 410.667)), CREAM)
    ImageDraw.Draw(f1).text((99, f1.height // 2), "F1 · placeholder", fill=ESPRESSO,
                            font=ImageFont.truetype(str(label_font), 56), anchor="lm")
    for wdt in (420, 840):
        save_web(f1, assets / "photos/f1-hero-window", wdt)

    # Approved pack fronts (ART18), 7 : 12
    for name in ("ethiopia", "colombia", "brazil"):
        front = Image.open(src / f"pack-front-{name}.png").convert("RGB")
        for wdt in (300, 600):
            save_web(front, assets / f"packs/{name}-front", wdt)

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
    main(Path(sys.argv[1]), Path(sys.argv[2]))
