# Architecture, design choices and principles

This is the record of how Number Garden is built and why. Each section states the choice and the reason, so a change that goes against one of them is made knowingly.

## 1. Shape of the app

**One `index.html`, no framework, no dependencies.** The shipped file is still a single `index.html` (styles, markup and about 3,800 lines of plain JavaScript), next to a manifest, a service worker and an icon folder. The source now lives in `src/` as plain pieces: `head.html`, `style.css`, `body.html`, then the script split at top-level statement boundaries into `engine.js`, `games/*.js` (one file per room, numbered in load order), `ideas.js`, `playground.js`, `think.js`, `play.js` and `wiring.js`. `tools/build.sh` (POSIX sh, nothing to install) concatenates them back, byte for byte, into `index.html`, which is committed alongside `src/`; `tools/check-build.sh` fails when the two disagree. Edit `src/`, run `sh tools/build.sh`, commit both.

Why: the fastest possible loop is save-then-refresh, and there is exactly one file to publish anywhere (a static host, a chat artifact, an Electron or WebView2 shell). For a solo project of this size a bundler buys nothing visible; `cat` is the whole build, and the generated file is kept in git so the host, the service worker and the tests never see the split.

When to change it further: if `src/` ever needs modules or a second output, that is the moment for a real bundler; until then the split stays plain concatenation so the pieces read like the original file.

## 2. Runtime layout

The page is a set of **views**, one visible at a time, switched by `show(id)`: `home` (garden and doors), `play` (one problem), `done` (flower planted), `book`, `playground` and `toy`, `ideas` and `learn` (the picture books), `sheet` (grown-ups).

All state is one object `S`, persisted under the local-storage key `ng2` by `save()`:

| field | holds |
|---|---|
| `name`, `pro` | the child's name and pronouns (`she` / `he` / `they`) |
| `m` | per-game mastery `{lv, streak, low}` |
| `counts`, `last`, `days`, `stars`, `streakNow`, `bestStreak` | play history |
| `book`, `flowers`, `badges` | the rewards |
| `trail` | the current five stones `{door, steps, i, lit}` |
| `taught`, `recent` | lessons already shown; signatures of recent problems |
| `note`, `duo`, `family`, `savedAt` | grown-up settings, the family code, the write clock |

The child never sees levels or counts; they see flowers, the book and badges.

## 3. The game engine

Every game is one `skill({...})` registration:

```
skill({id, room, title, levels, idea?, grow?(lv), teach?(lv, lesson), mount(lv)})
```

`mount(lv)` draws into `stage` and `controls` using the shared widgets, and ends each problem by calling `win(message)` or `miss(hint)`. Every game also calls `help({book, clues, answer, why, show})`: `book` is the sentence written in the child's book, `clues` feed the Clue button (one per tap, each counting as a hint), `show` draws the answer for Show me, `why` is said with it. `reveal()` (Show me) ends the problem without a star and nudges mastery down.

The number line Pip walks (`walkTo(line, pos)`) remembers her position and jumps: each call flies her there in an arc (`bugFly` draws her with wing cases open, wings beating and legs dangling; a shadow runs along the line and the arc is drawn as she goes, and she squashes on landing) and draws the jump as a labelled arc, newest bold and older ones fading, so every book page and the Playground toy that moves her get the same animation for free.

Shared widgets: `pad` (number buttons), `numpad` (typed answer), `choices` (text or drawn options), `tenFrame`, `numberLine`, `clockSvg`, `gridSvg`, `coinBtn`, the story scene engine (`buildScene` / `actOut`, which animates what the child's answer would mean), and the drag engine (`trayOf`, `zones`, `makeDraggable`, `fullCount`).

**Mastery.** Three clean problems in a row move a game up a level; two hint-heavy problems move it down. `grow(lv)` optionally supplies the book line for a level-up.

**No repeats.** `play()` builds a signature of each problem (prompt plus stage) and keeps the last six per game; a repeat is re-rolled. Trails are built by `makeTrail(door)`.

**Pronouns.** `P()` returns the chosen set (`s`/`o`/`p`/`pp`/`self`), `vb(singular, plural)` picks the verb form, `cap()` capitalises. All child-facing text goes through these, so "they" reads "they have" and "do they need".

Generators over hand-written puzzles: Sudoku and Who has what? are parameterised generators that brute-force a unique solution, so a new variant is a level entry, not a new game. Which one is different? checks its reasons as number properties rather than storing sentences.

## 4. Trails and doors

A door starts a trail of **five stones from that door only**, cycling through the door's games with no two alike in a row; the no-repeat rule keeps a repeated game from showing the same problem. Earlier the trail borrowed a warm-up and a puzzle stone and swapped in any game not played for three days. That was sound tutoring and confusing play: the child chose Time and got sudoku. Pure doors won.

## 5. Teaching layers

Help is layered, cheapest first, and the child chooses:

1. **Clue**: one structural hint per tap.
2. **Show me**: the answer drawn and acted out; the problem ends.
3. **Watch**: the game's `teach(lv, lesson)`, a narrated animation in Pip's bubble (`lesson.say`, `lesson.scene`, `await lesson.wait(ms)`), shown automatically the first time the child meets that level (`S.taught`), ending in a **My turn** button, replayable any time. Tapping My turn early stops it cleanly. A `lesson.wait` under 1.2 s is animation and runs on the clock; a longer one is reading time, so after a short settle the lesson shows **Next** and waits for a tap. Lessons are therefore written with long waits where the child should read and short ones inside animations.
4. **Learn**: the Big Idea named by the game (`idea:'ten'`), opened in place and returning to the same stone. On the second miss Pip offers it and the button glows.

Pip the ladybug is the single narrator everywhere: home greeting, lessons, picture books, the maker games. The child learns one voice.

## 5a. Tell Pip: bug reports a child can make

A **Tell Pip** button sits on the play card and in every picture book. It opens six big choices with no typing: *It got stuck*, *The answer is wrong*, *I don't get it*, *Too hard*, *Too easy*, *I love this one*. Pip thanks the child and says she will tell the gardeners; *Back to my puzzle* returns to the same problem. Each report is kept on the device (last twenty, listed in the grown-ups screen with sent / waiting) and posted to the `reports` collection with the plain REST API; a failed send is retried when the app comes back to the foreground. `tools/reports.sh` lists the reports, newest first, and saves each one's picture and markup. The picture is made by the page itself: the visible view is serialised to XHTML, wrapped in an SVG `foreignObject` with the page's own styles, drawn to a canvas and kept as a small JPEG (`snapshot`); if the browser refuses any step the report goes without it. The "love" choice exists so the button is also a way to say something nice, which keeps a child willing to tap it.

## 5b. The thinking loop: gates, think-first, the Think door, her own words

The generators give breadth and fluency, and on their own they are Kumon: roll numbers, type a number, star. Four things change the loop.

- **Gates.** A game may give `help({reasons:{q,opts,why}, ways:{q,opts,why}})`, each option `{t, ok, no}`. `win()` first calls `nextGate()`: odd problems ask *why*, even ones ask for *another way*, and the star waits for the right choice (`askGate`). A wrong choice counts as a hint (so no streak) and explains the trap; two wrong reveal and move on. A level-up requires `m.why` at that level when the game has reasons at all (`SK[id].hasReasons`).
- **Think first.** `help({guess:{q,opts}})` hides the controls until one tap about the shape of the answer (`guessGate`); a wrong guess costs a sentence, never a hint.
- **The Think door.** `THINK` is a hand-written bank of problem families, each `make()` rolling its numbers or names but keeping its one idea; `think` picks fresh ones first (`S.thinkDone`). `makeTrail` puts a think stone in the middle of every trail, so no trail is five of the same thing.
- **Her own words.** `tellPapa` is now the own-words card: after every think problem and every third clean win, Say it (Web Speech recognition where present), Type it, or I said it out loud; kept in `S.said`, written to the book as a big entry, led with in the greeting and listed in the grown-ups summary.

**True or not?** (`truth`, Think) generates statements over a row of coloured balls (all, some, none, there is one) with the truth computed, a rule with its must / might / cannot questions, and two clues that fit exactly one of four bugs. **Find every way** (`combo`, Think) is combinatorics with no formula: the child builds each outfit, cone or order from pickers and taps *That's one*; duplicates (by a canonical key, so a cone is the same whichever scoop is first) and bad builds are refused with the reason, and the star comes when the tray holds every way.

**Catch Pip's mistake** (`pipslip`, Think) is `pipSlip(lv)`: one family per classic slip, each with Pip's wrong working, three cards naming slips of which one is hers, and the right answer typed afterwards. **How did you see it?** (`talk`, Think) is `talkPicture(lv)`: a dot grid with optional gaps, every true way of seeing it computed as index groups (rows, columns, top row and rest, a full grid take away the gaps, ten and more, a double), two true ways and one false offered, and the dots painted by group for the chosen way.

**Estimation jar** (`jar`, Measure) scatters beads with a seeded placement so the count is exact, offers four sizes and accepts the nearest; a miss colours ten beads as a unit, the win recolours the jar in tens. **Make it true** (`maketrue`, Puzzles) asks for the sign (up or down?), then which of two sentences can be true at all, then =, > or < between two sums, each with a why gate.

## 5c. Ways of thinking

Three games carry strategies rather than facts, after the Russian and Singapore primary traditions. **Draw the bar** (`bar`, Stories) draws every story as a bar model with `barSvg` (parts to scale, the whole as a bracket, two bars lined up for a comparison, `?` for the unknown); level 4 asks only for the shape, which is the modelling skill itself. **Rewind it** (`rewind`, Puzzles) shows a story as a chain of boxes and arrows and the child undoes each step from the last one back; `rewindStory` generates starts and steps whose every intermediate value stays between 1 and 20. **Name the trick** (`trick`, Add & take) is driven by the `TRICKS` table: each strategy has a name, a `fits(a,b,sub)` test, a one-line reason it does not fit, a `why` sentence and a picture; `trickProblem` generates a sum for a target trick and offers only distractors that do not fit, so exactly one answer is right. **Story detective** (`detective`, Stories) is the reading ritual as a game: `detectiveStory(lv)` builds a story with its two true facts, two false ones, the right question and two wrong ones, and the picture that fits; the child taps through know, want and picture before the numpad appears, and level 1 has no numbers at all. Each has a lesson per level and a Big Idea in the strand *Ways of thinking*.

**Both sides** (`both`, Puzzles) puts the same secret bag on both pans of a balance (`bagScale`); the only moves are *take a bag off both* and *take 1 off both*, so the invariant is the game, and the numpad appears when a bag stands alone. **Same story, three unknowns** (`three`, Stories) is one problem of three rounds from `threeStory`: the same numbers with the ? at the end, in the change and at the start (level 3: the whole and each part of a bar); the star is for all three and the summary shows the three pictures filled. **You set the sudoku** (`setsudoku`, Makes it) lets the child place clues on a 4×4 under the usual clash rule; Pip's solver is deliberately weak, naked singles and hidden singles only (`step()`), each said aloud, so it gets honestly stuck on ambiguous clues and asks for one more in the squares it could not decide, and in about a third of solves it plants one wrong number (`slipCell`) for the child to catch by tapping. **You ask the question** (`askq`, Makes it) builds the scene with the same chip-and-pad steps as You write the story, offers three question cards of which one is already answered by the story (`known`), and answers the chosen one with a bar and a deliberate slip 40% of the time.

**Does that make sense?** A game may give `help({sense: v => ({q, opts, ans, why}) | null})`. On a wrong number it calls `senseCard(v)`, which, when `sense` returns a check for that value, shows a card with one question about the story's shape (a part cannot be as big as the whole; a start cannot exceed an end that only grew). Answering it does not count as a hint. Draw the bar, Rewind it and Story detective use it.

**3D views.** `view3d(hm, yaw, pitch)` draws a height map from any angle with a painter's sort and back-face removal, so the same function gives the front, side and top views and the spinning one (`spinCubes`). Faces are coloured by world direction (`FACE_COL`: tops yellow, fronts blue, sides green), so a front view is all blue and a top view all yellow. `turnable(hm)` is the widget the child drives: drag sideways to walk round, up and down to fly over, buttons for the named views. Count the cubes teaches with it and spins the stack slowly after the answer; **Build the stack** (`build`) gives the views and asks for the stack, checking with `topOf`, `frontOf` and `sideOf` so any stack with the same views is accepted at levels 2 and 3. The Big Idea *Top, front and side* uses the same widget.

## 5d. Sudoku, Balance it and the garden

**Sudoku** has its own door (`sud`) and five levels from `SUD` (4×4, 4×4, 6×6, 9×9, 9×9), all numbers. Shape boards use `CRITTERS`, nine plain SVG shapes each with its own colour, so no two tiles can be confused at a glance (emoji creatures were tried and rejected: too alike and too soft at tile size). A placed number is checked against the squares it shares a row, column or box with, not against the stored solution, so any valid completion wins (`valid()`); a clash flashes the squares and the line it breaks, the number comes back out, and `miss` says the rule. *Fill one* (`single()`) finds a naked single, lights the squares that force it and fills it after the reason is read; it counts as a hint. **Balance it** draws real fruit from `PAIRS` with `fruitScale`, shows the rule as a card, and `work()` performs the swap one big thing at a time on a win or Show me. **The garden** (`drawGarden`) mixes four flower kinds by flower number, adds a bush every eight, grows a tree through `GARDEN_STAGES` and places visitors at milestones; `finishTrail` waters and sprouts the new flower and announces the milestone reached, and `#homeBug` hovers over the flowers while `S.streakNow` is 3 or more. `season()` reads the month and `SEASONS` gives each season a sky tint, soil, leaf colour and falling bits (negative animation delays, so a fresh load already has weather). **Pip's story** is `STORY`, twelve `{t, pic}` pages; `storyPages()` opens one page with the first flower and one per ten after that, the `#tale` view shows open pages with read-aloud and the first locked page with how many flowers it needs, and `finishTrail` announces a newly opened page with a button to read it.

## 5e. The weekly letter

`win()` and a Big Idea read append to `S.log` (`{d, s, h, lv}` or `{d, idea}`, last 400). `weekData()` folds the last seven days into days played, wins, flowers, her own words, level-ups (from the book), think problems, games tried with clean and hinted counts, and from those the solid and the worth-doing-together games. `letterText()` writes it as plain text (so it copies into any message) and `renderLetter()` lays the same lines out. `TABLE_TALK` maps each game to one sentence a grown-up can say at the table; the letter picks up to three by what was played most.

## 5f. Playing over weeks: Pip's pick, the museum, bricks, children, the limit

`pickTrail()` reads `S.log` and `S.last`: due games (a hinted entry with no clean one after it), stale games (not played for five days), fresh games (never played), think stone in the middle. The **mistake museum** records the first `miss()` on a problem in `S.misses` with the prompt; a clean win on the same game at that level or below marks older slips beaten, and *Try one like it* replays the game at the slip's level. **Bricks**: `MODELS` are strings of colour letters; `layBrick()` runs in `finishTrail` and adds one brick per trail to `S.build`, moving a finished set to `S.built`; the home card has a Garden / Bricks tab and the flowers keep growing underneath. **Children**: `PROFILES` (`ng2_profiles`) lists gardens; the active child's state stays under the plain `ng2` key so nothing else changes, the others sleep under `ng2_<id>`, and switching swaps the keys and reloads. **The daily limit**: `S.today` counts five-second ticks while a playing view is visible; `gardenClosed()` is checked when a trail starts and at each next stone, never mid-problem; no clock is shown to the child.

## 6. Big Ideas

A Big Idea is a concept taught, not a game dressed up. Every book follows the same order, and *Even and odd* is the model:

1. the idea in one plain sentence;
2. the same idea in a picture;
3. a second and a third way to see it;
4. the pattern or rule stated outright;
5. the reason the rule works;
6. the traps a child actually falls into;
7. where they meet it in life;
8. practice with pictures, then practice without ("three in a row and you have it");
9. what it is the same as elsewhere in the garden.

Each is an entry in `IDEAS`: `title`, `line`, `strand`, `thing`, `door`, `book`, `pages` (each `{say, draw(scene)}`), and `tries()` returning `{q, kind:'choice'|'num', opts?, ans, draw, explain, show?}`; the try-its sample several kinds, not just the first picture. A page that fails to draw logs a warning rather than failing silently.

## 7. Progress and sync

**Local first.** Every change is written to local storage at once. The app works with no network at all.

**Family code.** A code is four plus four characters from an unambiguous alphabet (`K7PM-3QX2`), made by *New family*. Sync uses Firestore's plain REST API with `fetch`, no SDK: one document per code in `families/{code}` with two fields, `data` (the whole `S` as a JSON string) and `savedAt`.

- Push: 1.5 seconds after any change, serialised so writes never overlap.
- Pull: on open and whenever the app returns to the foreground.
- Resolution: the copy with the newer `savedAt` wins. A device with no progress adopts the family's garden if the family has one. Typing a code is not progress and does not touch `savedAt`, so joining never overwrites the family.
- A pull that lands mid-problem keeps the current game's mastery record; `win` and `reveal` tolerate a missing one.
- Offline, the status line says so and the local copy carries on.

**The chat-artifact copy.** The same file also runs as a published claude.ai artifact, where it uses that page's own cloud store (`claude.use('db')`). That sandbox blocks outbound requests, so the family code cannot sync from there; the two stores are independent. The static site is the primary home.

## 8. Hosting and install

GitHub Pages serves `master` as-is; every push deploys. The repository lives under an organisation so the address carries no personal name. `manifest.webmanifest` (standalone display, garden colours, icons) and `sw.js` (network-first for the page so updates arrive, cache fallback when offline, old caches cleared on activate) make *Add to Home Screen* a real install. The service worker registers only over `https` on a real site, so the file keeps working from disk and from the artifact page.

## 9. Security and privacy

- No accounts, no sign-in, no analytics, no server of our own. The only outbound call is the family sync.
- The Firebase web `apiKey` and `projectId` are in the source on purpose. The web key is a public identifier, present in the page source of every site that uses Firebase; it grants nothing by itself. Access is controlled by the Firestore rules: a client may read or write one `families/{code}` document whose nine-character code it knows, with only the two expected fields, and may not list or delete. Codes have about a trillion combinations and cannot be enumerated.
- The remaining exposure is junk writes under made-up codes. The project runs on the free plan with no payment method, so that cannot cost money, only pause syncing for a day at the quota. Two optional hardenings: restrict the key to the site's domain in the Google Cloud console, and cap the document size in the rules.
- What is stored per family: a child's first name (if entered), pronouns, game levels and counts, book lines, flowers and badges. Nothing else.
- **Tell Pip** reports (section 5a) carry the game, level, the words on screen, the time, the app version, the family code and the device type. No name.
- The repository contains no child's name, no family's name, no account handles. The default child name is a neutral nickname, "Sprout", until one is typed on the device; pronouns are a setting with a neutral option.
- Anyone forking the project uses their own Firebase project; the rules above are in the README.

## 10. Design principles

The rules the games are held to, in rough order of importance:

1. **No timers.** Speed is never rewarded; thinking is.
2. **A star is for finishing**, never for a first try. Mistakes cost nothing but a hint.
3. **Hints point at the structure, never an X.** "Count the empty boxes," not "wrong".
4. **Every game shows the idea, not just the answer.** A win acts the problem out; Show me draws it; Which one is different? demands a reason, not a pick.
5. **Teach before asking** where asking first would be unfair, and let the lesson be replayed.
6. **Levels are invisible and adaptive.** The child sees flowers; a grown-up can nudge.
7. **One thing on screen.** No tabs, no counters, nothing competing for a five-year-old's attention.
8. **Pure doors.** Choosing Time means Time.
9. **Distractors stay inside what the level teaches.** A level-1 clock offers o'clock and half past, not 12:05.
10. **The child's natural order of taps wins** over the programmer's. Tap the bead, then the paint pot; sort first, then say why. A worked example waits for *My turn*.
11. **Pictures must be honest.** No box ends with two dots; faded means "placed for you", never "the wrong colour"; the dime really is smaller than the nickel because that is the trap worth learning.
12. **Language is the child's.** "Adds 4", not "+4"; "90 minutes, 1 hour and a half"; every sentence in the chosen name and pronouns; read-aloud wherever there is reading.
13. **Celebration is rare and real.** Confetti for flowers, level-ups and streaks of five and ten; nothing punishes a broken streak.
14. **No repeats.** Not the same problem twice in six goes, not the same game on two neighbouring stones.

## 11. Testing

Nothing is published until it passes a headless run. The checks, all Playwright against the local file:

- a syntax check of the whole script (`new Function` on the extracted source);
- every game at every level, played clean and miss-then-recover, asserting a star, a book line and no console errors (the solver scripts read the current problem through the read-only `window.__ng()` hook);
- every page of every Big Idea drawn, the interactive pages driven, every kind of try-it answered;
- trail construction for every door, many times, asserting no neighbouring repeats and no cross-door stones;
- two simulated devices against a mocked Firestore (join, win on each side, foreground refresh, offline), asserting the garden moves both ways and that joining never overwrites;
- screenshots at phone width for layout checks (rows that must not wrap, clocks side by side), in light and in dark mode: every fixed light background (yellow tiles, pastel sudoku numbers, the build grid, the every-way table) sets its own dark text, so dark mode cannot leave light text on a light tile.

The scripts live in `tests/` (`tests/run.sh` runs them all; `tests/README.md` lists them).

The same run happens on GitHub Actions (`.github/workflows/tests.yml`) for every push to `master` and every pull request: one Ubuntu job installs Playwright and Chromium, runs `tests/run.sh` with the suites one after another (several Chromiums at once crash the browser), and fails the check if any suite fails. The whole run takes 15 to 25 minutes; screenshots and the log are kept as a build artifact for a week.

## 12. Conventions

- Edit `src/`, never `index.html` by hand; run `sh tools/build.sh` and commit `src/` and the regenerated `index.html` together (`sh tools/check-build.sh` tells you when they have drifted).
- The code is dense one-liners by design; a new game should read like its neighbours.
- Comments explain *why* (a trap, a rule, a child's behaviour), not what.
- Book lines are written in the child's name and past tense: "found half of 8".
- `grow(lv)` text tells the child what gets bigger at the new level.
- Every child-facing string goes through `P()` / `vb()` where a pronoun or its verb appears.
- Tool-generated changes to the big arrays (`IDEAS`, `TOYS`) are spliced by entry id and bounded to the array's closing bracket; one over-reach once deleted the mascot and the drag engine, caught by the tests before publish.
