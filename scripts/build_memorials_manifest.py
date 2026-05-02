#!/usr/bin/env python3
"""Generate site/data/memorials.json from site/imgs/memorials/ structure.

Conventions (per user):
  site/imgs/memorials/dd_mm_yyyy.jpg     -- single photo for that azkara date
  site/imgs/memorials/dd_mm_yyyy/...     -- folder; all photos under it belong to that azkara
                                            (recursively, including sub-albums like 'Nahal hasofet')
  site/imgs/memorials/speeches/dd_mm_yyyy/*.pdf  -- speech files for that azkara

Photos with a sibling 'name(1).ext' are treated as thumbnail pairs:
  small (no '(1)') is the thumb; large ('(1)') is the full image.
"""
import os, json, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, 'site', 'imgs', 'memorials')
OUTPUT = os.path.join(ROOT, 'site', 'data', 'memorials.json')
WEB_BASE = 'imgs/memorials'   # path used by HTML (relative to site/)

DATE_RE = re.compile(r'^(\d{2})_(\d{2})_(\d{4})')

def parse_date(name: str):
    m = DATE_RE.match(name)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2)), int(m.group(3))

def is_date_folder(name: str) -> bool:
    return bool(re.fullmatch(r'\d{2}_\d{2}_\d{4}', name))

def is_image(name: str) -> bool:
    return name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))

def is_doc(name: str) -> bool:
    return name.lower().endswith(('.pdf', '.docx', '.txt', '.md'))

def list_files_recursive(folder: str):
    """Yield (relative_path, basename) for files under folder (sorted, recursive)."""
    out = []
    for entry in sorted(os.listdir(folder)):
        full = os.path.join(folder, entry)
        if os.path.isdir(full):
            for sub_rel, sub_name in list_files_recursive(full):
                out.append((os.path.join(entry, sub_rel), sub_name))
        else:
            out.append((entry, entry))
    return out

def detect_pairs(rel_files):
    """Group thumbnail/full pairs.

    Returns list of dicts: {thumb: webpath, full: webpath, caption: name}.
    Files where 'name(1).ext' exists alongside 'name.ext' → small is thumb, big is full.
    Other images become standalone (thumb=full=path).
    """
    by_path = {p: True for p, _ in rel_files}
    seen_full = set()
    photos = []
    for rel, name in rel_files:
        if not is_image(name):
            continue
        base, ext = os.path.splitext(name)
        # If this is the (1) version, skip — handled with its small counterpart
        if base.endswith('(1)'):
            continue
        # Check for sibling 'name(1)ext' in the same directory
        dirpath = os.path.dirname(rel)
        large_name = f'{base}(1){ext}'
        large_rel = os.path.join(dirpath, large_name) if dirpath else large_name
        if large_rel in by_path:
            photos.append({
                'thumb': rel.replace(os.sep, '/'),
                'full': large_rel.replace(os.sep, '/'),
                'caption': base,
            })
        else:
            photos.append({
                'thumb': rel.replace(os.sep, '/'),
                'full': rel.replace(os.sep, '/'),
                'caption': base,
            })
    return photos

def main():
    if not os.path.isdir(BASE):
        print(f'No {BASE}; nothing to do.')
        return 0

    memorials: dict[str, dict] = {}

    def get(date_key: str) -> dict:
        if date_key not in memorials:
            memorials[date_key] = {'photos': [], 'speeches': []}
        return memorials[date_key]

    # Top-level scan of memorials/
    for entry in sorted(os.listdir(BASE)):
        full = os.path.join(BASE, entry)
        if entry == 'speeches':
            continue
        if os.path.isdir(full):
            if is_date_folder(entry):
                date_key = entry
                rel_files = list_files_recursive(full)
                photos = detect_pairs(rel_files)
                # Prefix with date_key for web path
                for p in photos:
                    p['thumb'] = f'{WEB_BASE}/{date_key}/{p["thumb"]}'
                    p['full'] = f'{WEB_BASE}/{date_key}/{p["full"]}'
                get(date_key)['photos'].extend(photos)
            else:
                # Unknown folder — log and skip
                print(f'  warn: unknown folder (no date prefix): {entry}', file=sys.stderr)
        elif os.path.isfile(full) and is_image(entry):
            d = parse_date(entry)
            if not d:
                continue
            dd, mm, yyyy = d
            date_key = f'{dd:02d}_{mm:02d}_{yyyy}'
            base = os.path.splitext(entry)[0]
            get(date_key)['photos'].append({
                'thumb': f'{WEB_BASE}/{entry}',
                'full': f'{WEB_BASE}/{entry}',
                'caption': base,
            })

    # Speeches scan
    speeches_dir = os.path.join(BASE, 'speeches')
    if os.path.isdir(speeches_dir):
        for entry in sorted(os.listdir(speeches_dir)):
            full = os.path.join(speeches_dir, entry)
            if os.path.isdir(full) and is_date_folder(entry):
                date_key = entry
                for f in sorted(os.listdir(full)):
                    if is_doc(f):
                        title = os.path.splitext(f)[0]
                        ext = os.path.splitext(f)[1].lstrip('.').lower()
                        get(date_key)['speeches'].append({
                            'title': title,
                            'file': f'{WEB_BASE}/speeches/{date_key}/{f}',
                            'ext': ext,
                        })

    # Build sorted output (oldest first)
    sorted_keys = sorted(memorials.keys(), key=lambda k: parse_date(k))
    output = {'memorials': []}
    for k in sorted_keys:
        dd, mm, yyyy = parse_date(k)
        m = memorials[k]
        m['date'] = k
        m['day'] = dd
        m['month'] = mm
        m['year'] = yyyy
        m['displayDate'] = f'{dd:02d}/{mm:02d}/{yyyy}'
        output['memorials'].append(m)

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f'Wrote {OUTPUT}')
    print(f'  {len(output["memorials"])} memorial date(s)')
    for m in output['memorials']:
        print(f'    {m["date"]}: {len(m["photos"])} photo(s), {len(m["speeches"])} speech(es)')
    return 0

if __name__ == '__main__':
    sys.exit(main() or 0)
