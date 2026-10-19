"""Bounded structural checks for the critical care lectures and licensed media."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter
import hashlib, json, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[2]
PAGES = [ROOT/'pocus/index.html', ROOT/'pocus/media/index.html'] + [ROOT/f'pocus/{slug}/index.html' for slug in ['basics','cardiac','lung','haemodynamics','shock','efast','dvt','cases']]

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

import re
cardiac=(ROOT/'pocus/cardiac/index.html').read_text()
routes=re.findall(r'<section[^>]*\bdata-route="(\d+)"[^>]*class="slide',cardiac)
assert sorted(map(int,routes))==list(range(1,32)),'cardiac numeric routes must stay 1-31, each once'

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
    # Open licences, or the owner-confirmed SCCM course permission (which must record its evidence).
    assert asset['licence'].startswith(('CC BY ','CC BY-SA ')) or (asset['licence']=='Used with permission' and asset.get('licence_evidence')),asset['id']
    for key,checksum in [('filename','sha256'),('poster','poster_sha256')]:
        data=(ROOT/'pocus/media'/asset[key]).read_bytes()
        assert hashlib.sha256(data).hexdigest()==asset[checksum],asset[key]
    assert asset['author'] and asset['source_url'] and asset['licence_url'] and asset['changes']
cases=(ROOT/'pocus/cases/index.html').read_text()
recorded={a['filename'] for a in manifest['assets']}|{a['poster'] for a in manifest['assets']}
# Every SCCM file referenced by a page, and every SCCM file on disk, must have a manifest record.
for file in PAGES:
    for src in re.findall(r'(?:src|poster|href)="(?:\.\./)?media/(sccm-[a-z]+/[^"#?]+)"',file.read_text()):
        assert src in recorded,('unrecorded SCCM media',file.name,src)
for path in (ROOT/'pocus/media').glob('sccm-*/*'):
    rel=path.relative_to(ROOT/'pocus/media').as_posix()
    assert rel in recorded,('SCCM file with no manifest record',rel)
    if path.suffix=='.jpg':
        # No COM (0xFE) or EXIF (0xE1) segments before the image data.
        b=path.read_bytes();i=2
        while b[i+1]!=0xDA:
            assert b[i+1] not in (0xFE,0xE1),('JPEG metadata segment',rel)
            i+=2+int.from_bytes(b[i+2:i+4],'big')
for qid,answer,body in re.findall(r'<fieldset class="cs-q" id="([^"]+)" data-answer="([a-d])"[^>]*>(.*?)</fieldset>',cases,re.S):
    assert f'data-choice="{answer}"' in body and 'class="cs-reveal" hidden' in body,qid
for file in (ROOT/'pocus').rglob('*.js'):
    if file.parts[-2] in ['basics','cardiac','haemodynamics','shared','shock','cases']:
        subprocess.run(['node','--check',str(file)],check=True,capture_output=True)
print(f'{total} lecture sections; {len(manifest["assets"])} attributed media records: pass')
