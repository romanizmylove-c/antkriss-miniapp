"""Build 24 high-quality visual frames from the already-approved hoodie views.
This is a static image turntable, NOT a photogrammetric or geometric 3D model.
Never blend adjacent frames: one hoodie in each crop.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import base64
import io
import re

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "hoodie-72-sprite-data.js").read_text(encoding="utf-8")
match = re.search(r"data:image/webp;base64,([A-Za-z0-9+/=]+)", source)
if not match:
    raise RuntimeError("Approved source atlas missing")
atlas = Image.open(io.BytesIO(base64.b64decode(match.group(1)))).convert("RGB")
SW, SH, SOURCE_COLS = 448, 448, 8
assert atlas.size == (SW * 8, SH * 9), f"Unexpected source atlas: {atlas.size}"
TILE, COLS, ROWS = 720, 6, 4
output = Image.new("RGB", (TILE * COLS, TILE * ROWS), "#eeedeb")
for index in range(24):
    source_index = 3 * index
    col, row = source_index % SOURCE_COLS, source_index // SOURCE_COLS
    tile = atlas.crop((col * SW, row * SH, (col + 1) * SW, (row + 1) * SH))
    # Preserve the approved shape, scale and light background.
    # This is careful raster refinement, not a claim of new source detail.
    tile = tile.resize((TILE, TILE), Image.Resampling.LANCZOS)
    tile = tile.filter(ImageFilter.UnsharpMask(radius=1.05, percent=88, threshold=4))
    output.paste(tile, ((index % COLS) * TILE, (index // COLS) * TILE))

destination = ROOT / "assets" / "hoodie-final24.webp"
destination.parent.mkdir(parents=True, exist_ok=True)
output.save(destination, "WEBP", quality=95, method=6)
test = Image.open(destination)
assert test.size == (4320, 2880)
print(f"ANTKRIS final 24-view atlas: {destination.stat().st_size:,} bytes, 24 × 720px")
