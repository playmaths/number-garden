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
| `solve-profiles.js` | children on one device: add, switch, each keeps its own garden, remove |
| `solve-bricks.js` | brick builds: the tab, picking a set, a brick per trail, the finished set on the shelf, flowers untouched |
| `solve-arrays-chart.js` | Rows of how many at every level and the hundred chart toy |
| `solve-pick-museum.js` | Pip's pick from a built log (due, stale, think in the middle, no repeats), a slip recorded, retried and beaten in the museum, the sound and speech switches |
| `solve-limit.js` | the daily play limit (counts only on playing views, closes at the next stone, rests the home screen, ten more minutes, no limit, a new day) and the current question marked in You hide the number |
| `solve-setsudoku.js` | You set the sudoku: a clash while setting refused, too few clues refused, Pip stuck on ambiguous clues, solved on a full set, and her slips caught by tapping the square |
| `solve-story-seasons.js` | the garden in each season under a fixed clock (falling bits, snow, sun, orange tree, flowers kept) and Pip's story: the door text, pages per ten flowers, locked pages, read-aloud, the done screen's new-page button |
| `solve-jar-true.js` | Estimation jar (dots match the count, a miss shows ten, the win reveals tens) and Make it true at every level with the why gate |
| `solve-pip-talk.js` | Catch Pip's mistake and How did you see it? at every level: wrong card then right, the number, the dots recoloured for the chosen way, Show me |
| `solve-logic-combo.js` | True or not? at every level with wrong picks, Find every way built out by hand with duplicates and bad builds refused, Show me, and the Think door's mixed trail |
| `solve-sudoku.js` | every sudoku level: a clash shakes and clears, Fill one fills a single with a reason, the grid is finished from the solution, the door's trail |
| `solve-garden.js` | the garden over time: flower kinds, bushes, tree, visitors, Pip hovering on a streak, the watered sprout and the milestone on the done screen |
| `solve-think.js` | the thinking loop: thirty think problems over three tiers, the think stone in a trail, the think-first card, the why gate (a wrong reason breaks the streak, no level-up without a right reason), the own-words card, the greeting and the summary |
| `solve-both.js` | plays Both sides at every level by taking bags then ones off both pans, with a wrong weight and Show me; also checks a lesson pauses on Next |
| `solve-three.js` | plays Same story, three unknowns at every level, all three rounds, with a miss and Show me |
| `solve-askq.js` | plays You ask the question eight times: builds a scene, checks that an already-known question is refused, checks Pip's answer and types the truth when she slipped |
| `solve-build.js` | builds every Build the stack level by tapping the floor, with a wrong build and Show me, and checks that a different stack with the same views is accepted |
| `solve-detective.js` | plays Story detective at every level and checks the Does-that-make-sense card on three games |
| `solve-thinking.js` | plays Draw the bar, Rewind it and Name the trick at every level: clean, miss-then-win and Show me |
| `solve-*.js` | plays one door's games for real, right and wrong, asserting stars and book lines (screenshots go to the temp folder) |

`lib.js` has the shared helpers: `open()`, `go(pg, gameId, level, door)`, `stars`, `msg`, `book`.
