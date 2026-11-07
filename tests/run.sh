#!/bin/sh
# Runs every check, one suite at a time (several Chromiums at once crash the browser).
# Needs Node and Playwright: npm i -D playwright && npx playwright install chromium
# Works from any directory; prints a summary and exits non-zero if any suite failed.
cd "$(dirname "$0")" || exit 1
start=$(date +%s)
passed=""
failed=""
for t in syntax.js smoke.js trails.js books.js sync.js tellpip.js solve-*.js; do
  [ -f "$t" ] || continue
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
