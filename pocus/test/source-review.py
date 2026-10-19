"""Validate the source expansion before publication. Run from any directory."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,hashlib,re,subprocess
ROOT=Path(__file__).resolve().parents[2]
records=json.loads((ROOT/'pocus/media/course-2026/manifest.json').read_text())
pages=[ROOT/f'pocus/{p}/index.html' for p in ['rv','basics','cardiac','lung','cases']]
allhtml='\n'.join(p.read_text() for p in pages)
assert len(records)==69
assert len({r['id'] for r in records})==len(records)
registered=set()
for r in records:
 assert r['licence']=='Used with permission' and r['licence_evidence'] and r['credit']
 assert r.get('source_slides') or r.get('source_pages'),r['id']
 for key,checksum in [('file','sha256'),('poster','poster_sha256')]:
  if key not in r:continue
  p=ROOT/r[key];registered.add(p.name)
  assert p.stat().st_size<50*1024*1024
  assert hashlib.sha256(p.read_bytes()).hexdigest()==r[checksum],p
  assert p.name in allhtml,('unreferenced source asset',p)
for p in (ROOT/'pocus/media/course-2026').iterdir():
 assert p.name=='manifest.json' or p.name in registered,p
for p in pages:
 s=p.read_text();markup=re.sub(r'<script\b.*?</script>', '', s, flags=re.S);ids=re.findall(r'\bid="([^"]+)"',markup)
 assert not [i for i,n in Counter(ids).items() if n>1],p
 assert 'noindex' in s,p
 assert 'chewshihao.com' in s or '../shared/series.js' in s,p
 for v in re.findall(r'<video\b([^>]*)>',s):
  assert 'controls' in v and 'playsinline' in v and 'preload="none"' in v and 'autoplay' not in v
for p in (ROOT/'pocus/rv').glob('*.js'):subprocess.run(['node','--check',str(p)],check=True)
print('Source review passed: 62 cines, 62 posters, seven figures; attribution, hashes, references, video behavior and RV syntax.')
