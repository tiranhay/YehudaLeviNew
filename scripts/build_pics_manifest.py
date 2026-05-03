#!/usr/bin/env python3
"""Build manifest + thumbnails for site/imgs/pics and site/imgs/newspaper.

For every full-size image without a `TN_<name>` thumbnail sibling, the script
generates one with Pillow (longest side <= 600px, JPEG quality 80). Then it
emits site/data/pics.json with entries { thumb, full, caption } per folder.

Display order is controlled by site/data/pics_captions.json:
    {
      "pics":      [{"name": "Foo.JPG", "caption": "..."}, ...],
      "newspaper": [...]
    }
Files listed there appear first, in listed order. Anything present on disk
but unlisted is appended at the end (natural sort) with a filename caption.
The script is idempotent: existing thumbnails are never modified.
"""
import os, json, re, sys
from urllib.parse import quote

try:
    from PIL import Image
except ImportError:
    sys.stderr.write("ERROR: Pillow is required. Install with `pip install Pillow`.\n")
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
DATA_DIR = os.path.join(SITE, 'data')
CAPTIONS_PATH = os.path.join(DATA_DIR, 'pics_captions.json')
OUTPUT_PATH = os.path.join(DATA_DIR, 'pics.json')

FOLDERS = [
    ('pics',      os.path.join(SITE, 'imgs', 'pics'),      'imgs/pics'),
    ('newspaper', os.path.join(SITE, 'imgs', 'newspaper'), 'imgs/newspaper'),
]

IMG_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
IGNORE_FILES = {'thumbs.db', '.ds_store'}
THUMB_PREFIX = 'TN_'
THUMB_MAX_DIM = 600
THUMB_JPEG_QUALITY = 80


_NUM_RE = re.compile(r'(\d+)')
def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in _NUM_RE.split(s)]


def is_image(name):
    return os.path.splitext(name)[1].lower() in IMG_EXTS


def url_path(p):
    return quote(p, safe='/')


def fallback_caption(fname):
    return os.path.splitext(fname)[0].replace('_', ' ')


def load_captions():
    if not os.path.isfile(CAPTIONS_PATH):
        return {'pics': [], 'newspaper': []}
    with open(CAPTIONS_PATH, encoding='utf-8') as f:
        c = json.load(f)
    c.setdefault('pics', [])
    c.setdefault('newspaper', [])
    return c


def captions_lookup(folder_key, captions):
    return {entry['name']: entry.get('caption', '') for entry in captions[folder_key]}


def ensure_thumbnail(folder_abs, fname):
    full_path = os.path.join(folder_abs, fname)
    thumb_path = os.path.join(folder_abs, THUMB_PREFIX + fname)
    if os.path.isfile(thumb_path):
        return False
    print(f"  generating thumbnail: {THUMB_PREFIX}{fname}")
    try:
        with Image.open(full_path) as im:
            if im.mode in ('RGBA', 'P'):
                im = im.convert('RGB')
            im.thumbnail((THUMB_MAX_DIM, THUMB_MAX_DIM), Image.LANCZOS)
            ext = os.path.splitext(fname)[1].lower()
            save_kwargs = {}
            if ext in ('.jpg', '.jpeg'):
                save_kwargs = {'quality': THUMB_JPEG_QUALITY, 'optimize': True}
            im.save(thumb_path, **save_kwargs)
        return True
    except Exception as e:
        sys.stderr.write(f"WARN: could not thumbnail {fname}: {e}\n")
        return False


def build_one(folder_key, folder_abs, web_base, captions):
    if not os.path.isdir(folder_abs):
        sys.stderr.write(f"WARN: missing folder {folder_abs}\n")
        return []

    on_disk = set()
    for name in os.listdir(folder_abs):
        if name.lower() in IGNORE_FILES:
            continue
        if name.startswith(THUMB_PREFIX):
            continue
        if not is_image(name):
            continue
        on_disk.add(name)

    cap_lookup = captions_lookup(folder_key, captions)
    listed_names = [e['name'] for e in captions[folder_key]]

    ordered = [n for n in listed_names if n in on_disk]
    leftover = sorted(on_disk - set(ordered), key=natural_key)
    if leftover:
        print(f"[{folder_key}] new file(s) discovered: {leftover}")
    ordered.extend(leftover)

    print(f"[{folder_key}] {len(ordered)} total image(s) for manifest")
    entries = []
    for fname in ordered:
        ensure_thumbnail(folder_abs, fname)
        thumb_name = THUMB_PREFIX + fname
        thumb_exists = os.path.isfile(os.path.join(folder_abs, thumb_name))
        entries.append({
            'thumb':   url_path(f"{web_base}/{thumb_name}") if thumb_exists else url_path(f"{web_base}/{fname}"),
            'full':    url_path(f"{web_base}/{fname}"),
            'caption': cap_lookup.get(fname, fallback_caption(fname)),
        })
    return entries


def main():
    captions = load_captions()
    out = {}
    for key, abs_path, web_base in FOLDERS:
        out[key] = build_one(key, abs_path, web_base, captions)
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    total = sum(len(v) for v in out.values())
    print(f"\nWrote {OUTPUT_PATH}: {total} entries across {len(out)} folder(s)")


if __name__ == '__main__':
    main()
