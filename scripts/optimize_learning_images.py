"""Conservatively compress public image assets, preserving names, dimensions and formats.
No changes to application source, login, admin, database or config.
"""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps, ImageFile
Image.MAX_IMAGE_PIXELS = 100_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = False
ROOT = Path("public")
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
total_before = total_after = count = 0
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
        continue
    original = path.read_bytes()
    total_before += len(original)
    if len(original) < 150_000:
        total_after += len(original)
        continue
    try:
        with Image.open(BytesIO(original)) as im:
            if getattr(im, "is_animated", False) or getattr(im, "n_frames", 1) > 1:
                total_after += len(original)
                continue
            im.load()
            buffer = BytesIO()
            ext = path.suffix.lower()
            if ext == ".png":
                im.save(buffer, format="PNG", optimize=True, compress_level=9)
            elif ext in (".jpg", ".jpeg"):
                if im.mode not in ("RGB", "L"):
                    im = im.convert("RGB")
                im.save(buffer, format="JPEG", quality=88, optimize=True, progressive=True, subsampling=0)
            else:
                im.save(buffer, format="WEBP", quality=88, method=6, exact=True)
            optimized = buffer.getvalue()
        # Preserve source when saving is not materially smaller.
        if len(optimized) < len(original) * 0.94:
            path.write_bytes(optimized)
            total_after += len(optimized)
            count += 1
            print(f"{path}: {len(original):,} -> {len(optimized):,}")
        else:
            total_after += len(original)
    except Exception as exc:
        print(f"Skipped {path}: {exc}")
        total_after += len(original)
print(f"Optimized {count} images; scanned {total_before:,} bytes; output {total_after:,} bytes")
