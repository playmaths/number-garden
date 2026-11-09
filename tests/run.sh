#!/bin/sh
# Runs every check, one suite at a time (several Chromiums at once crash the browser).
# Needs Node and Playwright: npm i -D playwright && npx playwright install chromium
# Works from any directory; prints a summary and exits non-zero if any suite failed.
# Usage: run.sh            every suite
#        run.sh 2/6        the second of six deterministic slices (round-robin over the fixed list below, so the
#                          long suites, smoke, books, trails, sync, tellpip, land in different slices); CI runs the slices in parallel
cd "$(dirname "$0")" || exit 1
group=${1:-}
n=0; m=1
if [ -n "$group" ]; then
  n=${group%/*}; m=${group#*/}
  case "$n$m" in ''|*[!0-9]*) echo "usage: $0 [N/M]  (e.g. 1/6)" >&2; exit 2;; esac
  if [ "$n" -lt 1 ] || [ "$n" -gt "$m" ]; then echo "group $n is not within 1..$m" >&2; exit 2; fi
  echo "=== group $n of $m"
fi
start=$(date +%s)
passed=""
failed=""
i=0
for t in syntax.js smoke.js trails.js books.js sync.js tellpip.js solve-*.js; do
  [ -f "$t" ] || continue
  i=$((i+1))
  if [ "$m" -gt 1 ] && [ $(( (i-1) % m + 1 )) -ne "$n" ]; then continue; fi
  echo "=== $t"
  t0=$(date +%s)
  if node "$t"; then passed="$passed $t"; else failed="$failed $t"; fi
  echo "    ($(( $(date +%s) - t0 ))s)"
done
echo ""
echo "=== summary ($(( $(date +%s) - start ))s)"
for t in $passed; do echo "  ok    $t"; done
for t in $failed; do echo "  FAIL  $t"; done
if [ -n "$failed" ]; then echo "some checks FAILED"; exit 1; fi
echo "all checks passed"
