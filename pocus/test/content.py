"""Bounded structural checks for the critical care lectures and licensed media."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter
import hashlib, json, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[2]
PAGES = [ROOT/'pocus/index.html', ROOT/'pocus/media/index.html'] + [ROOT/f'pocus/{slug}/index.html' for slug in ['basics','cardiac','lung','haemodynamics','shock','efast','dvt']]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.scripts=[]; self.script=None; self.videos=[]; self.slides=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if 'slide' in a.get('class','').split(): self.slides+=1
        for key in ('href','src','poster'):
            if key in a: self.links.append(a[key])
        if tag=='script' and not a.get('src'): self.script=''
        if tag=='video': self.videos.append(a)
    def handle_data(self,data):
        if self.script is not None: self.script+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.script is not None: self.scripts.append(self.script);self.script=None

total=0
for file in PAGES:
    page=Page();page.feed(file.read_text());total+=page.slides
    duplicates=[key for key,n in Counter(page.ids).items() if n>1]
    assert not duplicates,(file,duplicates)
    for link in page.links:
        u=urlsplit(link)
        if u.scheme or u.netloc: continue
        if not u.path:
            if u.fragment: assert unquote(u.fragment) in page.ids or u.fragment.isdigit(),(file,link)
            continue
        target=(ROOT/u.path.lstrip('/')) if u.path.startswith('/') else (file.parent/unquote(u.path))
        assert target.exists(),(file,link)
    for video in page.videos:
        assert 'controls' in video and 'playsinline' in video and video.get('preload')=='none' and 'autoplay' not in video,(file,video)
    for script in page.scripts:
        with tempfile.NamedTemporaryFile(mode='w',suffix='.js') as tmp:
            tmp.write(script);tmp.flush();subprocess.run(['node','--check',tmp.name],check=True,capture_output=True)
    print(file.relative_to(ROOT), f'{page.slides} sections, {len(page.videos)} videos: pass')

manifest=json.loads((ROOT/'pocus/media/media-attributions.json').read_text())
for asset in manifest['assets']:
    assert asset['licence'].startswith(('CC BY ','CC BY-SA ')),asset['id']
    for key,checksum in [('filename','sha256'),('poster','poster_sha256')]:
        data=(ROOT/'pocus/media'/asset[key]).read_bytes()
        assert hashlib.sha256(data).hexdigest()==asset[checksum],asset[key]
    assert asset['author'] and asset['source_url'] and asset['licence_url'] and asset['changes']
for file in (ROOT/'pocus').rglob('*.js'):
    if file.parts[-2] in ['basics','cardiac','haemodynamics','shared','shock']:
        subprocess.run(['node','--check',str(file)],check=True,capture_output=True)
print(f'{total} lecture sections; {len(manifest["assets"])} licensed media records: pass')
