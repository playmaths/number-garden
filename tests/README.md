# Tests

Headless checks against the local `index.html` in Chromium. Nothing is published until they pass.

```
npm i -D playwright && npx playwright install chromium
tests/run.sh            # everything
node tests/books.js "Even and odd"   # one book
```

| script | checks |
|---|---|
| `syntax.js` | the whole script parses |
| `smoke.js` | every game mounts at every level; Clue and Show me respond; no console errors |
| `trails.js` | every door builds five-stone trails from its own games, no neighbours alike |
| `books.js` | every page of every Big Idea draws, interactive pages respond, try-its run; fails on any draw warning |
| `sync.js` | two simulated devices against a mocked Firestore: join, win on each side, foreground refresh |
| `solve-build.js` | builds every Build the stack level by tapping the floor, with a wrong build and Show me, and checks that a different stack with the same views is accepted |
| `solve-detective.js` | plays Story detective at every level and checks the Does-that-make-sense card on three games |
| `solve-thinking.js` | plays Draw the bar, Rewind it and Name the trick at every level: clean, miss-then-win and Show me |
| `solve-*.js` | plays one door's games for real, right and wrong, asserting stars and book lines (screenshots go to the temp folder) |

`lib.js` has the shared helpers: `open()`, `go(pg, gameId, level, door)`, `stars`, `msg`, `book`.
