# Tests

Headless checks against the local `index.html` in Chromium. Nothing is published until they pass.

```
npm i -D playwright && npx playwright install chromium
tests/run.sh            # everything, one suite at a time, with a summary at the end
tests/run.sh 2/6        # one deterministic sixth of the suites (what each CI job runs)
node tests/books.js "Even and odd"   # one book
```

`run.sh` works from any directory, runs the suites sequentially (parallel Chromiums crash), prints each suite's seconds, which passed and failed, and exits non-zero on any failure. With an argument `N/M` it runs every M-th suite of its fixed list (syntax, smoke, trails, books, sync, tellpip, then `solve-*` sorted) starting at the N-th, so the long suites land in different slices and the slices never overlap.

**Fast mode.** The app has one switch for the checks: when `window.__NG_FAST` is set before the page scripts run (or `localStorage` holds `ng2_fast=1`), `engine.js` sets `window.__ngFast`, puts the class `fast` on `<html>` (every CSS animation and transition is over in 20 ms) and scales every pause through `ms(n)` and `wait(n)` to a tenth, with a 20 ms floor so the order of steps holds: lesson waits (`L.wait`), Show-me animations, reveals, celebrations, the finale and turntable timers, the ten-frame glimpse, the save debounce and the daily-limit tick (which then adds five seconds every half second, so the limit still counts real play). `lib.js` seeds the flag with a browser init script (`open()` for the shared browser, `fast(pg)` for a script that launches its own), so it is there after every reload and untouched by the `localStorage.clear()` a check does. It is a window flag rather than a storage write on purpose: an init script that touches `localStorage` at document start makes Chromium load the storage area before the previous document's writes have landed, and about one reload in ten then finds an empty garden. Nothing in the app ever sets the flag or writes the key, and the grown-ups' Reset removes the key, so a child never plays in fast mode. New code should pause with `wait(ms)` or `setTimeout(f, ms(n))`, never a bare number. On the test side `pause(pg, n)` waits the fast-mode equivalent of a real `n` ms app delay (`T(n)`, a tenth plus a margin); where a condition can be awaited instead (the think-first card gone, `ctx.done` after a gate, the flash cover lifted and dropped, a Big Idea page's `data-drawing` cleared, the hundred chart's summary line) the helpers wait for that.

**Locally**, run the suites you touched plus `smoke.js` (and `trails.js` if you changed rooms or trails); the whole suite runs in CI. **GitHub Actions** (`.github/workflows/tests.yml`) runs on every push to `master` and every pull request as six parallel jobs, `bash tests/run.sh N/6`, each installing Playwright with the Chromium download cached by Playwright version (`actions/cache`), `tools/check-build.sh` in job 1 only, and each uploading its screenshots and log as `test-output-N`. A full sequential run takes about ten minutes on a laptop; a slice a minute or two.

| script | checks |
|---|---|
| `syntax.js` | the whole script parses |
| `smoke.js` | every game mounts at every level; Clue and Show me respond; no console errors |
| `trails.js` | every door builds five-stone trails from its own games, no neighbours alike |
| `books.js` | every page of every Big Idea draws, interactive pages respond, try-its run; fails on any draw warning |
| `sync.js` | two simulated devices against a mocked Firestore: join, win on each side, foreground refresh |
| `tellpip.js` | Tell Pip: the six big choices on the play card and in a picture book; the report kept on the device, sent to the reports collection, listed for grown-ups, retried when a send fails |
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
| `solve-welcome.js` | the first-time welcome on a truly empty browser: Pip waves and says hello, the name field (Done or Skip), one dot problem through the engine with no flower from it, the flower explanation, home greeting by name, no welcome after a reload, Skip at every step, a reload resumes the step, a seeded garden never sees it |
| `solve-think.js` | the thinking loop: thirty think problems over three tiers, the think stone in a trail, the think-first card, the why gate (a wrong reason breaks the streak, no level-up without a right reason), the own-words card, the greeting and the summary |
| `solve-both.js` | plays Both sides at every level by taking bags then ones off both pans, with a wrong weight and Show me; also checks a lesson pauses on Next |
| `solve-three.js` | plays Same story, three unknowns at every level, all three rounds, with a miss and Show me |
| `solve-askq.js` | plays You ask the question eight times: builds a scene, checks that an already-known question is refused, checks Pip's answer and types the truth when she slipped |
| `solve-build.js` | builds every Build the stack level by tapping the floor, with a wrong build and Show me, and checks that a different stack with the same views is accepted |
| `solve-steps.js` | plays Where is Pip? at every level: the landing square tapped (wrong square first), a path built from the arrow buttons and walked with Go (a short path first, then the right one), the fewest steps round a rock with the think-first card and the why or another-way gate, and Show me |
| `solve-detective.js` | plays Story detective at every level and checks the Does-that-make-sense card on three games |
| `solve-compose.js` | Make a shape at every level: pieces dragged with the mouse onto the outline (turned first where needed), a wrong drop slides back with a hint, the extra piece and the think-first card at level 2, the cut named and then cut by hand at level 3, Clue and Show me |
| `solve-thinking.js` | plays Draw the bar, Rewind it and Name the trick at every level: clean, miss-then-win and Show me |
| `solve-analogy.js` | Number pairs at every level: the rule in `ctx.rule` fits the given pairs and gives the answer, dots drawn and redrawn at level 1, the think-first card at level 2, the two-rules trap at level 3 (the first pair fits two rules, the second pins the one in `ctx.rule`), a wrong rule hinted at the other pair, the why or another-way gate, Show me |
| `solve-howknow.js` | the How did you know? card on a game with no why gate: shown on the 2nd and 6th win only, right and wrong picks keep the star and flag the log, Next stone works, and a game with a why gate never gets it |
| `solve-matrix.js` | Spot the rule at every level: the grid and choices read through the hook (one across rule, one down rule, every distractor one attribute off the answer, the gap anywhere in the bottom row), a wrong pick first with the hint naming what is wrong, the gate, the star and the book line, the think-first card at level 3, Show me lighting the row then the column, the lesson at each level |
| `solve-serial.js` | Every row, every colour at every level: the grid a Latin square on shape and on colour, the right choice completing it, a miss hinted from the row, the think-first card, the why or another-way gate, Show me lighting row then column, and the lesson at each level |
| `solve-*.js` | plays one door's games for real, right and wrong, asserting stars and book lines (screenshots go to the temp folder) |
| `solve-fold.js` | Fold and punch at every level: the right open sheet, tap mode with a wrong tap and an early Done, every fold doubles the holes, the unfold, lessons |
| `solve-belongs.js` | Goes together at every level: odd one out, one more of the group, analogies where the relationship decides, hint wording, the rule card, lessons |
| `solve-listen.js` | Pip says at every level: the sentence in Pip's bubble with a dashed gap and a Read it to me button, four pictures with exactly one right, a wrong picture hinted with the picked word named and the sentence re-read with the gap, the think-first card at level 2, the why or another-way gate at level 3, honest number sentences, Show me filling the gap and lighting the picture, the lesson at each level |
| `solve-hear.js` | Listen and solve at every level: the story and its steps read from `ctx` (never through speech) with the answer following from the steps, no story text on screen before the answer when a voice is present (a pretend voice) and the words with a note when Pip cannot talk, the big Hear it again button and the replay count in the book line, the level-1 build by tapping tray pictures into the place and onto the side (a wrong build retold step by step and cleared, Done, then the pad), the think-first card at level 2, the why or another-way gate at level 3, the trap story's unused number refused with its reason, Show me acting the story out, the Good Listener badge after ten, the lesson at each level |
| `solve-series2.js` | Two things change at every level: the answer continues every rule, distractors differ, the miss hint names the wrong attribute, Show me, lessons |
| `solve-tile.js` | Finish the wallpaper at every level: the grid obeys its rule (two tiles, a sliding three-tile cycle, shape across and colour down), the right piece continues the row and the column, every distractor differs, the hole off the edge at level 1 and 2 by 2 at level 3, a miss hinted at the row, the think-first card at level 2, the why or another-way gate at level 3, Show me sliding the piece in, lessons |
| `solve-alike.js` | Three of a kind at every level: the three given figures share `ctx.rule` and nothing else, the answer keeps it and no wrong choice does (at level 3 each breaks exactly one of the two rules), a miss named by what the pick shares with one figure, the think-first card at level 2, the why or another-way gate at level 3, Show me highlighting the rule then the answer, and the lesson at each level |
| `solve-voice.js` | Pip's voice: the natural voice wins the auto pick, the grown-ups' list is in quality order, a chosen voice is remembered and used for prompts, an iPhone without an enhanced voice gets the download tip |

`lib.js` has the shared helpers: `open()` (a seeded fast-mode browser), `go(pg, gameId, level, door)`, `stars`, `msg`, `book`, `guess`, `gate`, `fast(pg)`, `pause(pg, ms)`, `T(ms)`.

`tools/check-build.sh` also runs `tools/docs-counts.py --check`: the drawn architecture in `docs/architecture.html` carries live counts (games, levels, books, rooms, brick sets, files, checks, CI jobs) between `<!--n:key-->` markers, refreshed by `sh tools/build.sh`; CI fails if the page is behind the repository.
