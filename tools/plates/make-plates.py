#!/usr/bin/env python3
"""
Era plates: one archival photograph per act, reduced to something the era could have displayed.

The rule that no binary asset ships is not relaxed here. What ends up in the repository is
`src/art/plates.ts`: a typed module holding, per era, a base64 string of 1- or 2-bit palette
indices. The colours are not in the file at all — the renderer maps indices onto whichever
era theme is live, so a plate follows the palette instead of fighting it.

Sources are public-domain or CC0 and are named in full in the generated module, which is also
where the credits shown in-game come from. Every image is of a machine or a room. No
photograph of an identifiable person is used, which keeps the depiction rules in
`src/content/characters.ts` intact: nobody real is *pictured*, only what they built.

Run it when the source list or the treatment changes; the generated module is committed, so a
normal build, test run or deploy never needs Python or a network:

    pip install Pillow
    python3 tools/plates/make-plates.py

Downloads are cached in tools/plates/cache/, which is git-ignored.
"""

from __future__ import annotations

import base64
import os
import re
import sys
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "src", "art", "plates.ts"))

# CGA's own resolution, which every era's plate is reduced to. Wide enough to read as a room,
# coarse enough that the dither is the point rather than an artefact.
W, H = 320, 200


@dataclass
class Source:
    era: str
    file: str
    """Wikimedia Commons file name, without the File: prefix."""
    tones: int
    dither: str
    """'ordered' for the eras that would have used a fixed screen, 'diffusion' for the later ones."""
    caption: str
    credit: str
    year: str
    crop: tuple[float, float, float, float] = (0.0, 0.0, 1.0, 1.0)
    """Fractional box taken before the 8:5 fit, for images that need reframing."""
    adjust: dict = field(default_factory=dict)
    """gamma / floor / ceil, applied before quantisation so each plate uses its full range."""


SOURCES = [
    Source(
        era="teletype",
        file="ARL ENIAC 03.png",
        tones=2,
        dither="ordered",
        caption="ENIAC, Ballistic Research Laboratory, Building 328",
        credit="U.S. Army photograph · public domain",
        year="1947",
        crop=(0.02, 0.06, 0.98, 0.94),
        adjust={"gamma": 0.92, "contrast": 0.72},
    ),
    Source(
        era="phosphor",
        file="Control Data 6600 mainframe.jpg",
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
        tones=4,
        dither="diffusion",
        caption="Columbia, NASA Advanced Supercomputing Facility",
        credit="Trower, NASA · public domain",
        year="2004",
        crop=(0.0, 0.05, 1.0, 0.95),
        adjust={"gamma": 1.06},
    ),
    Source(
        era="glass",
        file="The catalyst high performance computing (HPC).jpg",
        tones=4,
        dither="diffusion",
        caption="Catalyst cluster, Lawrence Livermore National Laboratory",
        credit="U.S. Department of Energy · public domain",
        year="2013",
        crop=(0.0, 0.04, 1.0, 0.96),
        adjust={"gamma": 0.98},
    ),
    Source(
        era="ambient",
        file="Wafer-scale integrated circuit.png",
        tones=4,
        dither="diffusion",
        caption="A wafer-scale integrated circuit",
        credit="Wikideas1 · CC0",
        year="2024",
        crop=(0.04, 0.06, 0.96, 0.94),
        adjust={"gamma": 1.16, "ceil": 0.88, "contrast": 0.8},
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


def fetch(name: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    dest = os.path.join(CACHE, re.sub(r"[^A-Za-z0-9._-]", "_", name))
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    url = ("https://commons.wikimedia.org/wiki/Special:FilePath/"
           + urllib.parse.quote(name.replace(" ", "_")) + "?width=1400")
    req = urllib.request.Request(url, headers={"User-Agent": "ai-timelines-plates/1.0"})
    print(f"  fetching {name}")
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())
    return dest


def prepare(src: Source):
    from PIL import Image, ImageOps

    im = Image.open(fetch(src.file)).convert("L")
    w, h = im.size
    l, t, r, b = src.crop
    im = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))

    # Fit to 8:5 by taking the largest centred box of that shape, then resample once.
    w, h = im.size
    if w / h > W / H:
        nw = int(h * W / H)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w * H / W)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((W, H), Image.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=1)

    px = [p / 255 for p in im.tobytes()]
    gamma = src.adjust.get("gamma", 1.0)
    floor = src.adjust.get("floor", 0.0)
    ceil = src.adjust.get("ceil", 1.0)
    # Pulling contrast *down* before quantisation is what buys texture: a value that clips to
    # black or white carries no dither pattern at all, and at one bit per pixel the pattern is
    # the only tone there is.
    contrast = src.adjust.get("contrast", 1.0)
    span = max(1e-6, ceil - floor)
    out = []
    for v in px:
        v = ((v ** gamma) - floor) / span
        v = 0.5 + (v - 0.5) * contrast
        out.append(min(1.0, max(0.0, v)))
    return out


def quantise(px: list[float], tones: int, dither: str) -> list[int]:
    """Grey to palette indices. The dithering method ages with the era it is drawn for."""
    top = tones - 1
    out = [0] * (W * H)
    if dither == "ordered":
        for y in range(H):
            for x in range(W):
                threshold = (BAYER8[y % 8][x % 8] + 0.5) / 64 - 0.5
                v = px[y * W + x] + threshold / top
                out[y * W + x] = min(top, max(0, round(v * top)))
        return out

    buf = list(px)
    for y in range(H):
        for x in range(W):
            i = y * W + x
            want = min(1.0, max(0.0, buf[i]))
            got = min(top, max(0, round(want * top)))
            out[i] = got
            err = want - got / top
            # Floyd–Steinberg, serpentine-free: the plates are static, so the classic
            # left-to-right pass is fine and keeps the texture directional, like a print.
            if x + 1 < W:
                buf[i + 1] += err * 7 / 16
            if y + 1 < H:
                if x > 0:
                    buf[i + W - 1] += err * 3 / 16
                buf[i + W] += err * 5 / 16
                if x + 1 < W:
                    buf[i + W + 1] += err * 1 / 16
    return out


def pack(indices: list[int], bits: int) -> str:
    per = 8 // bits
    data = bytearray()
    for i in range(0, len(indices), per):
        byte = 0
        for j in range(per):
            v = indices[i + j] if i + j < len(indices) else 0
            byte = (byte << bits) | (v & ((1 << bits) - 1))
        data.append(byte)
    return base64.b64encode(bytes(data)).decode("ascii")


def preview(src: Source, indices: list[int]) -> None:
    """A PNG of what the plate will look like in flat greys, for eyeballing before committing."""
    from PIL import Image

    top = src.tones - 1
    im = Image.new("L", (W, H))
    im.putdata([round(255 * v / top) for v in indices])
    os.makedirs(os.path.join(CACHE, "preview"), exist_ok=True)
    im.save(os.path.join(CACHE, "preview", f"{src.era}.png"))


def main() -> int:
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Pillow is required: pip install Pillow", file=sys.stderr)
        return 1

    chunks = []
    total = 0
    for src in SOURCES:
        px = prepare(src)
        indices = quantise(px, src.tones, src.dither)
        preview(src, indices)
        bits = 1 if src.tones <= 2 else 2
        data = pack(indices, bits)
        total += len(data)
        print(f"  {src.era:9} {src.tones} tones  {len(data) / 1024:6.1f} kB of base64")
        chunks.append(f"""  {src.era}: {{
    w: {W},
    h: {H},
    bits: {bits},
    tones: {src.tones},
    caption: {js(src.caption)},
    year: {js(src.year)},
    credit: {js(src.credit)},
    source: {js('https://commons.wikimedia.org/wiki/File:' + src.file.replace(' ', '_'))},
    data:
      {js(data)},
  }},""")

    body = "\n".join(chunks)
    header = f'''/**
 * Era plates — GENERATED by tools/plates/make-plates.py. Do not edit by hand.
 *
 * One archival photograph per act, reduced to the kind of image its era could actually put on
 * a screen: {W}×{H}, one or two bits per pixel, ordered dither for the early eras and error
 * diffusion for the later ones. What is stored is palette *indices*, so src/art/plate.ts can
 * paint the same plate in whichever era theme is live.
 *
 * Every source is public domain or CC0, and every one is of a machine or a room rather than a
 * person — see the depiction rules in src/content/characters.ts. Credits are shown in game on
 * the act break and collected in the codex.
 */

export interface Plate {{
  w: number;
  h: number;
  /** Bits per pixel: 1 or 2. */
  bits: number;
  /** Distinct palette entries this plate uses, 2 or 4. */
  tones: number;
  caption: string;
  year: string;
  credit: string;
  source: string;
  /** Row-major palette indices, high bits first, base64. */
  data: string;
}}

/** Keyed by era id. Act VII has no plate on purpose. */
export const PLATES: Record<string, Plate> = {{
{body}
}};
'''
    with open(OUT, "w") as f:
        f.write(header)
    print(f"\n  wrote {OUT} — {total / 1024:.1f} kB of base64 across {len(SOURCES)} plates")
    return 0


def js(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


if __name__ == "__main__":
    raise SystemExit(main())
