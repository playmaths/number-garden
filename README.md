# Number Garden

A single-file maths game for a five-year-old who already does procedural arithmetic and needs the other half: number sense, strategy, patterns, and puzzles with no procedure. Every answer comes with a picture of why, a ladybug named Pip teaches before she asks, and each finished trail plants a flower.

Play it at **https://playmaths.github.io/number-garden/**, or open `index.html` in any browser. On a phone or tablet use *Add to Home Screen*: the web manifest and service worker make it an installed app with its own icon that works offline.

**Progress** is saved in the device's browser straight away. A **family code** (grown-ups screen → *New family* on the first device, then type the code on the others) keeps one garden on every device through a small cloud database; the browser copy is the offline fallback and the newer copy always wins. No account, no sign-in, no analytics. Details in [ARCHITECTURE.md](ARCHITECTURE.md).

## Rooms

| Room | Games | What it builds |
|---|---|---|
| Warm-ups | How many? · Make 10 · Which has more? | Subitizing, complements to 10/20/100, comparing groups and numbers and finding the difference |
| Add & take | Take away · Make a ten to add · Find the missing number · Name the trick | Place value (sticks of 10 that break), bridging through ten, missing-addend thinking, and the named mental strategies (doubles, near doubles, count on, ten and more, make ten, count back, take from ten): see the trick before you count |
| Patterns | What comes next? · Rule machine | Repeating and growing patterns, function machines |
| Puzzles | Balance it · Which one is different? · Make the money · Sudoku (shapes 4×4 → digits 4×4 → 6×6) · Number riddle · Who has what? (logic grid) · Sort by two things · If this, then that · Rewind it | Reasoning with no algorithm: the seed of competition maths. Rewind it is working backwards: the end of a story is known, the start is the question, and each step is undone from the last one back |
| Stories | Story mystery · How many ways? · Draw the bar · Story detective · Same story, three unknowns | Reading-level word problems in one to two steps, open questions with several right answers, and bar models: the story drawn as parts of a bar before it is solved (whole hidden, part hidden, two bars compared, then choosing the bar that fits a story). Story detective is the reading ritual itself: level 1 has no numbers at all (did they end with more or fewer?), level 2 makes the child find the two facts, pick the question and pick the picture before any number is typed, level 3 moves the hidden number to the start, the middle or the end. Same story, three unknowns tells one story three times with the ? in a different place each time (end, change, start; then the whole and each part of a bar), so the child sees that the shape stays and only the question moves |
| Shapes & space | Mirror it · Count the shapes · Fit the hole · Finish the mirror · Count the cubes · Build the stack | Spatial reasoning: reflections, shapes hidden inside shapes, matching a piece to a gap, completing a symmetric picture, counting cubes you cannot see. Count the cubes teaches first with a stack that turns in 3D, and after the answer spins the stack round, then lets the child turn it by dragging or with front, side, top buttons, with the three views beneath. Faces are coloured by direction (yellow tops, blue fronts, green sides) so the three views look like three different things. Build the stack is the views backwards: tap squares on the floor plan to raise towers until the build shows the given top view (level 1), top and front (level 2), or all three (level 3); a turnable copy shows what the child has built |
| Time | What time is it? · How long until…? · Days and months | Reading the clock to five minutes, elapsed time by counting on, the week and the year going round |
| Measure | Parts of a whole · How long? · About how many? | Halves and quarters of shapes and of groups, measuring with units laid end to end, estimating against a box of 10 |
| (Name) makes it | You hide the number · You make the rule · You write the story · You make the pattern · You ask the question | The child sets the puzzle and the app solves it, sometimes wrongly on purpose, so the child checks the answer and says why |
| Playground | Counters and sticks · Number line walk · Balance scale | Free play with no questions: feel ten snapping into a stick, send Pip flying along the line (wing cases open, wings beating, a shadow under her, and every hop leaves a labelled arc, so the sum is drawn as she goes), load a scale and watch it tip |
| Big Ideas | **Numbers:** Counting on · Skip counting · Tens and ones · Bigger and smaller · Number neighbors **Adding and taking:** Making ten · How far apart · What = really means **Groups:** Even and odd · Double and half · Equal groups · Fair sharing **Patterns:** Rules and machines **Shapes:** Shapes and mirrors · Top, front and side **Measure:** Money · Measuring **Time:** Reading the clock · Day and night · Why 24, 60 and 60? · A day on Mars · Before there were clocks · Why time is precious · What is time for? **Ways of thinking:** Bars that tell a story · Walking backwards · Tricks with names · Reading a story | Picture books of 10 to 14 pages narrated by Pip: the idea in a sentence, two or three ways to see it, the rule, why it works, the traps, where you meet it, practice with and without pictures, what it is the same as; then three try-its and a link to the game |

## How a session works

The home screen is the garden with its doors. Pip the ladybug bobs there and in the corner of the play card, jumps on a right answer and tilts her head on a miss. Tapping a door starts a **trail** of five stepping stones, all from that door (a door with fewer than five games cycles through them, never the same problem twice). Each solved stone lights up; the fifth plants a flower. Levels adapt silently and are never shown to the child.

On every problem the child has **Clue**, **Show me**, and, where the game has one, **Watch** (Pip's lesson for that level, shown automatically the first time) and **Learn** (the Big Idea behind the game, offered by Pip on the second miss).

**My Book** (or "(Name)'s Book" once a name is set) writes one sentence the child can read for every problem solved ("Sprout took 9 away from 23 and got 14"), a bigger entry for each level-up and finished trail, and holds the badge shelf.

The grown-up settings are behind the faint *for grown-ups* link at the bottom of the home screen: the child's name and pronouns, the family code, a note for the home screen, a take-turns mode, a level nudge for every game, and a short summary page: ideas read, strongest games, what needs a second look, the last five book lines.

**Tell Pip.** A button on every problem and every picture book lets the child report a bug with one tap: it got stuck, the answer is wrong, I don't get it, too hard, too easy, I love this one. Reports go to the family's database for the grown-ups to read (`tools/reports.sh`); the grown-ups screen lists the ones sent from the device.

In Stories, the dots warm-up and Count the shapes, the child can touch each object to count it; the touch adds a numbered badge. Stories, riddles, how-many-ways and every Big Idea have a *Read it to me* button (browser speech, where available). Every fourth clean win, a card asks the child to explain out loud how they knew before the next stone.

## Design rules

- One thing on screen at a time. No tabs, no counters, no level tags visible to the child.
- No timers anywhere. Speed is never rewarded.
- A star is earned for finishing a problem, not for a first-try answer.
- Wrong answers get a hint that points at the structure, never an X. The second miss offers the lesson.
- Every game shows the idea, not just the answer: Show me draws it, a win acts it out.
- Where asking first would be unfair, Pip teaches first (the Time games), and the lesson can be replayed.
- Levels adapt on their own: three clean problems in a row moves up, two hint-heavy problems moves down. A grown-up can nudge any level.
- The child's name and pronouns (she, he or they) are a setting; every story, hint and book line uses them, with verbs agreeing. Nothing in the code assumes a name or a gender.
- Take-turns mode alternates turns on the same games so the child watches an adult think out loud.
- Every finished trail plants a flower. Confetti is reserved for flowers, level-ups, and 5- and 10-in-a-row streaks. Streaks are celebrated, never punished, and there is no daily streak to break.
- The home screen greets the child by name with what they did last time and a rotating one-line motto; a grown-up can leave a note.

## Setting up your own copy

1. Fork the repository and turn on GitHub Pages (Settings → Pages → *Deploy from a branch*, `master`, root). The app works at once, saving progress on each device.
2. For the family code (one garden across devices), create a free Firebase project, enable Firestore, and put its `apiKey` and `projectId` in the `FIREBASE` constant near the top of the script in `index.html`. Then paste these rules in Firestore → Rules and publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{code} {
      allow read: if code.size() == 9;
      allow write: if code.size() == 9
                   && request.resource.data.keys().hasOnly(['data', 'savedAt']);
    }
  }
}
```

For the Tell Pip reports, add this block inside the same `match /databases/{database}/documents {` before its closing brace:

```
    match /reports/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['kind','label','game','level','prompt','stage','controls','when','ver','family','device','lang'])
                    && request.resource.data.prompt.size() < 400
                    && request.resource.data.stage.size() < 400
                    && request.resource.data.controls.size() < 300;
    }
```

The Firebase web key is a public identifier, not a secret; these rules are the access control (see [ARCHITECTURE.md](ARCHITECTURE.md#security-and-privacy)).

## Ways of thinking

Four games and four books borrow from the Russian and Singapore primary traditions, where the picture and the strategy are taught by name before the sum: **bar models** (draw the story, then solve it), **working backwards** (undo from the end), **named mental strategies** (look for the trick before you count), and the **reading ritual**, know · want · picture · solve · check (Story detective and the book *Reading a story*). **You ask the question** flips the ritual: the child builds a scene, then chooses what to ask about it; one card asks something the story already says and Pip refuses it, and Pip answers the real one, sometimes wrongly, for the child to check. On a wrong number in a story game a **Does that make sense?** card asks one question about the story's shape ("Max got more and ended with 12. Can he have started with 19?") so the child checks the answer against the story, not the sum. Still queued from the same tradition: unknowns on both sides of a balance, logic statements ("if all… then…"), and visible combinatorics.

## Ideas queued

Unknowns on both sides · Logic statements · Visible combinatorics (see above).

## Developing

Everything about the code, the engine contract for games and Big Ideas, the sync design and the testing approach is in [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT. See [LICENSE](LICENSE).
