#!/usr/bin/env python3
"""Fills the live counts in docs/architecture.html from the repository, so the drawn architecture never lies about inventory.
Each number sits between markers in the page: <!--n:key-->42<!--/n-->. Run with no arguments to rewrite the page (tools/build.sh does),
or with --check to exit non-zero when the page is out of date (tools/check-build.sh does). No dependencies beyond Python 3."""
import re, sys, glob, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
game_files = sorted(glob.glob(os.path.join(root, 'src/games/*.js')))
game_src = ''.join(open(f, encoding='utf-8').read() for f in game_files) + rd('src/think.js')
engine = rd('src/engine.js')
counts = {
  'skills': len(re.findall(r"skill\(\{id:'", game_src)),
  'levels': sum(int(n) for n in re.findall(r"skill\(\{id:'[^']+',[^\n]*?levels:(\d+)", game_src)),
  'books': len(re.findall(r"^ \{id:'", rd('src/ideas.js'), flags=re.M)),
  'rooms': len(re.findall(r"^ \{id:'[a-z]+',title:'", engine[engine.index('const ROOMS=['):engine.index('];', engine.index('const ROOMS=['))], flags=re.M)),
  'sets': len(re.findall(r"^ \{id:'[a-z]+',name:'", engine[engine.index('const MODELS=['):engine.index('];', engine.index('const MODELS=['))], flags=re.M)),
  'gamefiles': len(game_files),
  'srcfiles': len(glob.glob(os.path.join(root, 'src/*.*'))) + len(game_files),
  'checks': len([f for f in glob.glob(os.path.join(root, 'tests/*.js')) if not f.endswith('lib.js')]),
  'solves': len(glob.glob(os.path.join(root, 'tests/solve-*.js'))),
  'jobs': len(re.search(r"group: \[([^\]]*)\]", rd('.github/workflows/tests.yml')).group(1).split(',')),
}
page_path = os.path.join(root, 'docs/architecture.html')
page = open(page_path, encoding='utf-8').read()
def fill(m):
  key = m.group(1)
  if key not in counts: sys.exit(f'docs/architecture.html: unknown count marker {key}')
  return f'<!--n:{key}-->{counts[key]}<!--/n-->'
new = re.sub(r'<!--n:([a-z]+)-->[^<]*<!--/n-->', fill, page)
if '--check' in sys.argv:
  if new != page:
    sys.exit('docs/architecture.html counts are out of date. Run: sh tools/build.sh, then commit docs/architecture.html.')
  print('docs/architecture.html counts are current: ' + ', '.join(f'{k} {v}' for k, v in counts.items()))
else:
  if new != page: open(page_path, 'w', encoding='utf-8').write(new)
  print('docs counts: ' + ', '.join(f'{k} {v}' for k, v in counts.items()))
