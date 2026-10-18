"""Import only the reviewed, openly licensed photograph manifest. No app/database access."""
import hashlib
import io
import json
import time
import sys
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
records = json.loads((root / 'content-review/grade5-media-sources.json').read_text())
only=set(sys.argv[1:])
previous=root / 'content-review/grade5-media-integrity.json'
results = [m for m in json.loads(previous.read_text()) if m['id'] not in only] if only and previous.exists() else []
for record in records:
    if only and record['id'] not in only:
        continue
    url = record['downloadUrl']
    assert url.startswith('https://upload.wikimedia.org/wikipedia/commons/')
    request = urllib.request.Request(url, headers={'User-Agent': 'ChamDaNangEducation/1.0 (open-license educational media import)'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = response.read(32 * 1024 * 1024)
            break
        except Exception:
            if attempt == 3:
                raise
            time.sleep(5 * (attempt + 1))
    image = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
    image.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
    output = root / 'public' / record['src'].lstrip('/')
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, 'WEBP', quality=83, method=6)
    binary = output.read_bytes()
    assert 1000 < len(binary) < 900000
    results.append({'id': record['id'], 'src': record['src'], 'sha256': hashlib.sha256(binary).hexdigest(), 'bytes': len(binary), 'width': image.width, 'height': image.height, 'downloadSha256': hashlib.sha256(data).hexdigest()})
    print(record['id'], image.size, len(binary), flush=True)
    time.sleep(5)
(root / 'content-review/grade5-media-integrity.json').write_text(json.dumps(results, indent=2) + '\n')
