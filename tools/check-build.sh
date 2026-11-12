#!/bin/sh
# Fails when index.html is not what tools/build.sh would make from src/ (a forgotten rebuild). Safe for CI: writes only a temp file.
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
sh "$root/tools/build.sh" "$tmp"
if cmp -s "$tmp" "$root/index.html"; then
  echo 'index.html is up to date with src/'
else
  echo 'index.html differs from the build of src/. Run: sh tools/build.sh, then commit index.html with src/.' >&2
  diff "$root/index.html" "$tmp" | head -20 >&2
  exit 1
fi
stamp=$(grep -o "APP_BUILD='[0-9a-f]*'" "$root/index.html" | cut -d"'" -f2)
if [ "$(cat "$root/version.txt" 2>/dev/null)" != "$stamp" ]; then echo 'version.txt does not match the build stamp in index.html. Run: sh tools/build.sh, then commit version.txt.' >&2; exit 1; fi
python3 "$root/tools/docs-counts.py" --check
