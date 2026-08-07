#!/usr/bin/env python3
"""
Era plates: one archival photograph per act, shown at the fidelity its era could manage.

The fidelity is the point. Act I is a one-bit halftone, the way a photograph reached a reader
in 1950 — through a screen, as dots. Act III is 320 x 200 in four fixed colours, because that
is what a colour graphics adapter had. By act V the same kind of photograph arrives intact, in
colour, at a resolution nobody in 1950 could have displayed. The century is legible in the
pictures as well as in the palette.

The early plates are dithered against their era's own ramp, read out of src/art/palette.ts so
there is one source of truth for those colours; the later ones are left alone. Everything is
written into src/art/plates/ as ordinary image files and imported by src/art/plates.ts, which
this script also generates.

Sources are public domain or CC0. Every image is of a machine or a room. No photograph of an
identifiable person is used, which keeps the depiction rules in src/content/characters.ts
intact: nobody real is pictured, only what they built.

Run it when the source list, the treatment or an era ramp changes; the output is committed, so
a normal build, test run or deploy never needs Python or a network:

    pip install Pillow
    python3 tools/plates/make-plates.py

Downloads are cached in tools/plates/cache/, which is git-ignored.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
ART = os.path.normpath(os.path.join(HERE, "..", "..", "src", "art"))
OUT_DIR = os.path.join(ART, "plates")
OUT_TS = os.path.join(ART, "plates.ts")
PALETTE = os.path.join(ART, "palette.ts")


@dataclass
class Source:
    era: str
    file: str
    """Wikimedia Commons file name, without the File: prefix."""
    size: tuple[int, int]
    caption: str
    credit: str
    year: str
    tones: int = 0
    """0 leaves the photograph in colour; 2 or 4 dithers it against the era ramp."""
    dither: str = "ordered"
    """'ordered' for the eras that would have used a fixed screen, 'diffusion' for the rest."""
    crop: tuple[float, float, float, float] = (0.0, 0.0, 1.0, 1.0)
    """Fractional box taken before the 8:5 fit, for images that need reframing."""
    adjust: dict = field(default_factory=dict)
    """gamma / floor / ceil / contrast / saturation, applied before quantisation."""


SOURCES = [
    Source(
        era="teletype",
        file="ARL ENIAC 03.png",
        # A halftone screen is fine-grained — it is the *tone* that is one bit, not the detail.
        # 960 across gives the dots something to describe.
        size=(960, 600),
        tones=2,
        dither="ordered",
        caption="ENIAC, Ballistic Research Laboratory, Building 328",
        credit="U.S. Army photograph · public domain",
        year="1947",
        crop=(0.02, 0.06, 0.98, 0.94),
        adjust={"gamma": 0.92, "contrast": 0.74},
    ),
    Source(
        era="phosphor",
        file="Control Data 6600 mainframe.jpg",
        size=(640, 400),
        tones=4,
        dither="ordered",
        caption="Control Data 6600 console, with its two round displays",
        credit="Photograph by Hullie · public domain",
        year="1964",
        crop=(0.06, 0.16, 0.98, 0.86),
        adjust={"gamma": 0.92},
    ),
    Source(
        era="cga",
        file="Cray-1 (1).jpg",
        # Not upscaled, deliberately: 320 x 200 is the mode, and the whole look depends on the
        # pixels being big enough to count.
        size=(320, 200),
        tones=4,
        dither="ordered",
        caption="Cray-1, Computer History Museum",
        credit="Photograph by Ed Toton · public domain",
        year="1976",
        crop=(0.12, 0.10, 1.0, 0.98),
        adjust={"gamma": 0.94, "ceil": 0.94},
    ),
    Source(
        era="web",
        file="Columbia Supercomputer - NASA Advanced Supercomputing Facility.jpg",
        # Colour arrives, and with it a resolution a browser of the day could plausibly show.
        size=(1280, 800),
        caption="Columbia, NASA Advanced Supercomputing Facility",
        credit="Trower, NASA · public domain",
        year="2004",
        crop=(0.0, 0.05, 1.0, 0.95),
        adjust={"saturation": 0.92},
    ),
    Source(
        era="glass",
        file="The catalyst high performance computing (HPC).jpg",
        size=(1920, 1200),
        caption="Catalyst cluster, Lawrence Livermore National Laboratory",
        credit="U.S. Department of Energy · public domain",
        year="2013",
        crop=(0.0, 0.04, 1.0, 0.96),
    ),
    Source(
        era="ambient",
        file="Wafer-scale integrated circuit.png",
        size=(1600, 1000),
        caption="A wafer-scale integrated circuit",
        credit="Wikideas1 · CC0",
        year="2024",
        crop=(0.04, 0.06, 0.96, 0.94),
    ),
    # Act VII has no plate, and that is deliberate: its own device line says no device is
    # specified. A photograph of a machine would answer a question the act keeps open.
]

BAYER8 = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
]


def ramps() -> dict[str, list[str]]:
    """Era id → plate ramp, parsed out of palette.ts so the colours are defined in one place."""
    text = open(PALETTE).read()
    out: dict[str, list[str]] = {}
    era = None
    for line in text.splitlines():
        m = re.search(r"^\s*id: '([a-z]+)',", line)
        if m:
            era = m.group(1)
        m = re.search(r"^\s*plateRamp: \[([^\]]+)\]", line)
        if m and era:
            out[era] = re.findall(r"'(#[0-9a-fA-F]{6})'", m.group(1))
    return out


UA = {"User-Agent": "ai-timelines-plates/1.0 (era plate generator; run rarely)"}


def get(url: str, tries: int = 8) -> bytes:
    """One request, backing off politely. Commons rate-limits, and it is right to."""
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=240) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == tries - 1:
                raise
            wait = 30 * (attempt + 1)
            print(f"    rate-limited, waiting {wait}s")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def fetch(name: str) -> str:
    """
    The original upload, not a thumbnail: asking the thumbnailer for an arbitrary width is the
    thing Commons asks people not to do at volume, and the originals are served from cache.
    """
    os.makedirs(CACHE, exist_ok=True)
    dest = os.path.join(CACHE, re.sub(r"[^A-Za-z0-9._-]", "_", name))
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest

    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url", "titles": f"File:{name}",
    })
    pages = json.loads(get(api).decode())["query"]["pages"]
    info = next(iter(pages.values())).get("imageinfo")
    if not info:
        raise SystemExit(f"no such file on Commons: {name}")

    print(f"  fetching {name}")
    with open(dest, "wb") as f:
        f.write(get(info[0]["url"].split("?")[0]))
    time.sleep(2)
    return dest


def framed(src: Source):
    """Crop to the era's aspect and resample once, still in colour."""
    from PIL import Image

    im = Image.open(fetch(src.file)).convert("RGB")
    w, h = im.size
    l, t, r, b = src.crop
    im = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))

    tw, th = src.size
    w, h = im.size
    if w / h > tw / th:
        nw = int(h * tw / th)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w * th / tw)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return im.resize((tw, th), Image.LANCZOS)


def greys(src: Source, im) -> list[float]:
    from PIL import ImageOps

    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    gamma = src.adjust.get("gamma", 1.0)
    floor = src.adjust.get("floor", 0.0)
    ceil = src.adjust.get("ceil", 1.0)
    # Pulling contrast *down* before quantisation is what buys texture: a value that clips to
    # black or white carries no dither pattern at all, and at one bit per pixel the pattern is
    # the only tone there is.
    contrast = src.adjust.get("contrast", 1.0)
    span = max(1e-6, ceil - floor)
    out = []
    for v in g.tobytes():
        v = ((v / 255) ** gamma - floor) / span
        v = 0.5 + (v - 0.5) * contrast
        out.append(min(1.0, max(0.0, v)))
    return out


def quantise(px: list[float], size: tuple[int, int], tones: int, dither: str) -> list[int]:
    """Grey to palette indices. The dithering method ages with the era it is drawn for."""
    w, h = size
    top = tones - 1
    out = [0] * (w * h)
    if dither == "ordered":
        for y in range(h):
            for x in range(w):
                threshold = (BAYER8[y % 8][x % 8] + 0.5) / 64 - 0.5
                out[y * w + x] = min(top, max(0, round((px[y * w + x] + threshold / top) * top)))
        return out

    buf = list(px)
    for y in range(h):
        for x in range(w):
            i = y * w + x
            want = min(1.0, max(0.0, buf[i]))
            got = min(top, max(0, round(want * top)))
            out[i] = got
            err = want - got / top
            if x + 1 < w:
                buf[i + 1] += err * 7 / 16
            if y + 1 < h:
                if x > 0:
                    buf[i + w - 1] += err * 3 / 16
                buf[i + w] += err * 5 / 16
                if x + 1 < w:
                    buf[i + w + 1] += err * 1 / 16
    return out


def write_dithered(src: Source, ramp: list[str]) -> str:
    """An indexed PNG in the era's own colours — a handful of kilobytes, and exact."""
    from PIL import Image

    indices = quantise(greys(src, framed(src)), src.size, src.tones, src.dither)
    im = Image.new("P", src.size)
    palette = []
    for hexcolour in ramp[: src.tones]:
        palette += [int(hexcolour[i:i + 2], 16) for i in (1, 3, 5)]
    im.putpalette(palette + [0] * (768 - len(palette)))
    im.putdata(indices)
    name = f"{src.era}.png"
    im.save(os.path.join(OUT_DIR, name), optimize=True, bits=1 if src.tones <= 2 else 2)
    return name


def write_photo(src: Source) -> str:
    from PIL import ImageEnhance, ImageOps

    im = ImageOps.autocontrast(framed(src), cutoff=0.5)
    sat = src.adjust.get("saturation")
    if sat:
        im = ImageEnhance.Color(im).enhance(sat)
    name = f"{src.era}.webp"
    im.save(os.path.join(OUT_DIR, name), quality=82, method=6)
    return name


def main() -> int:
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Pillow is required: pip install Pillow", file=sys.stderr)
        return 1

    os.makedirs(OUT_DIR, exist_ok=True)
    ramp_by_era = ramps()

    imports, chunks, total = [], [], 0
    for src in SOURCES:
        if src.tones:
            ramp = ramp_by_era.get(src.era)
            if not ramp or len(ramp) < src.tones:
                print(f"{src.era}: needs a plateRamp of {src.tones} colours in palette.ts", file=sys.stderr)
                return 1
            name = write_dithered(src, ramp)
            treatment = f"{src.tones} tones, {'ordered dither' if src.dither == 'ordered' else 'error diffusion'}"
        else:
            name = write_photo(src)
            treatment = "colour"

        size = os.path.getsize(os.path.join(OUT_DIR, name))
        total += size
        print(f"  {src.era:9} {src.size[0]:>4}×{src.size[1]:<4} {treatment:28} {size / 1024:7.1f} kB")

        ident = f"{src.era}Url"
        imports.append(f"import {ident} from './plates/{name}';")
        chunks.append(f"""  {src.era}: {{
    url: {ident},
    w: {src.size[0]},
    h: {src.size[1]},
    tones: {src.tones},
    caption: {js(src.caption)},
    year: {js(src.year)},
    credit: {js(src.credit)},
    source: {js('https://commons.wikimedia.org/wiki/File:' + src.file.replace(' ', '_'))},
  }},""")

    header = f'''/**
 * Era plates — GENERATED by tools/plates/make-plates.py. Do not edit by hand.
 *
 * One archival photograph per act, at the fidelity its era could manage: a one-bit halftone in
 * 1950, four fixed colours at 320 × 200 in the 1980s, and full colour at a resolution nobody
 * then could have displayed by the 2010s. The images live in src/art/plates/ and are imported
 * here so the bundler fingerprints them.
 *
 * `tones` is 0 for a plate left in colour, or the number of palette entries a dithered one was
 * reduced to — the renderer uses it to decide whether the image wants pixel-exact scaling.
 *
 * Every source is public domain or CC0, and every one is of a machine or a room rather than a
 * person — see the depiction rules in src/content/characters.ts. Credits are shown in game on
 * the act break and collected in the codex.
 */

{chr(10).join(imports)}

export interface Plate {{
  /** Bundled asset URL. */
  url: string;
  w: number;
  h: number;
  /** 0 for a colour plate; 2 or 4 for one dithered against the era ramp. */
  tones: number;
  caption: string;
  year: string;
  credit: string;
  source: string;
}}

/** Keyed by era id. Act VII has no plate on purpose. */
export const PLATES: Record<string, Plate> = {{
{chr(10).join(chunks)}
}};
'''
    with open(OUT_TS, "w") as f:
        f.write(header)
    print(f"\n  wrote {OUT_TS} and {len(SOURCES)} images — {total / 1024:.0f} kB total")
    return 0


def js(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


if __name__ == "__main__":
    raise SystemExit(main())
