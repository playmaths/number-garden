#!/bin/sh
# Builds index.html from src/: head + <style> + style.css + </style> + body + <script> + the scripts in order + </script>.
# Plain concatenation, no dependencies: the output is byte-identical to the single file this project has always shipped.
# Usage: sh tools/build.sh [out]   (default out: index.html, next to src/)
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:-"$root/index.html"}
cd "$root/src"
{
  cat head.html
  echo '<style>'
  cat style.css
  echo '</style>'
  cat body.html
  echo '<script>'
  cat engine.js \
      games/01-warmups.js games/02-add.js games/03-patterns.js games/04-puzzles.js games/05-sudoku.js \
      games/06-stories.js games/07-ways.js \
      ideas.js playground.js \
      games/08-logic.js games/09-space.js games/10-make.js games/11-space-more.js \
      think.js \
      games/12-measure.js games/13-puzzles-more.js games/14-time.js games/16-place.js \
      play.js wiring.js
  echo '</script>'
} > "$out"
