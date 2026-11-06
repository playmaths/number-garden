# Number Garden

A single-file maths game for a five-year-old who already does procedural arithmetic and needs the other half: number sense, strategy, patterns, and puzzles with no procedure. Every answer comes with a picture of why, a ladybug named Pip teaches before she asks, and each finished trail plants a flower.

Play it at **https://playmaths.github.io/number-garden/**, or open `index.html` in any browser. On a phone or tablet use *Add to Home Screen*: the web manifest and service worker make it an installed app with its own icon that works offline.

**Progress** is saved in the device's browser straight away. A **family code** (grown-ups screen → *New family* on the first device, then type the code on the others) keeps one garden on every device through a small cloud database; the browser copy is the offline fallback and the newer copy always wins. No account, no sign-in, no analytics. Details in [ARCHITECTURE.md](ARCHITECTURE.md).

## Rooms

| Room | Games | What it builds |
|---|---|---|
| Warm-ups | How many? · Make 10 · Which has more? · Ten-frame flash | Subitizing, complements to 10/20/100, comparing groups and numbers and finding the difference. Ten-frame flash shows a frame for a blink and covers it, so counting one by one is impossible and seeing a full row of 5 or a frame of 10 is the only way; Show again is always there, and the child is never timed |
| Add & take | Take away · Make a ten to add · Find the missing number · Name the trick | Place value (sticks of 10 that break), bridging through ten, missing-addend thinking, and the named mental strategies (doubles, near doubles, count on, ten and more, make ten, count back, take from ten): see the trick before you count |
| Patterns | What comes next? · Rule machine | Repeating and growing patterns, function machines |
| Puzzles | Balance it · Which one is different? · Make the money · Number riddle · Who has what? (logic grid) · Sort by two things · If this, then that · Rewind it · Both sides · Make it true | Reasoning with no algorithm: the seed of competition maths. Rewind it is working backwards: the end of a story is known, the start is the question, and each step is undone from the last one back. Both sides is a balance with secret bags on it, the same bag on both pans: take the same thing off both sides until a bag stands alone, and read its weight. Make it true asks for the sign that fits (did the number go up or down?), then which of two sentences can ever be true (5 − ? = 12 cannot), then =, more or less between two sums |
| Stories | Story mystery · How many ways? · Draw the bar · Story detective · Same story, three unknowns | Reading-level word problems in one to two steps, open questions with several right answers, and bar models: the story drawn as parts of a bar before it is solved (whole hidden, part hidden, two bars compared, then choosing the bar that fits a story). Story detective is the reading ritual itself: level 1 has no numbers at all (did they end with more or fewer?), level 2 makes the child find the two facts, pick the question and pick the picture before any number is typed, level 3 moves the hidden number to the start, the middle or the end. Same story, three unknowns tells one story three times with the ? in a different place each time (end, change, start; then the whole and each part of a bar), so the child sees that the shape stays and only the question moves |
| Shapes & space | Mirror it · Count the shapes · Fit the hole · Finish the mirror · Count the cubes · Build the stack | Spatial reasoning: reflections, shapes hidden inside shapes, matching a piece to a gap, completing a symmetric picture, counting cubes you cannot see. Count the cubes teaches first with a stack that turns in 3D, and after the answer spins the stack round, then lets the child turn it by dragging or with front, side, top buttons, with the three views beneath. Faces are coloured by direction (yellow tops, blue fronts, green sides) so the three views look like three different things. Build the stack is the views backwards: tap squares on the floor plan to raise towers until the build shows the given top view (level 1), top and front (level 2), or all three (level 3); a turnable copy shows what the child has built |
| Time | What time is it? · How long until…? · Days and months | Reading the clock to five minutes, elapsed time by counting on, the week and the year going round |
| Measure | Parts of a whole · How long? · About how many? · Estimation jar | Halves and quarters of shapes and of groups, measuring with units laid end to end, estimating against a box of 10, and a jar of scattered beads to size up without counting (about 10, 20, 50?), then revealed in coloured tens |
| (Name) makes it | You hide the number · You make the rule · You write the story · You make the pattern · You ask the question | The child sets the puzzle and the app solves it, sometimes wrongly on purpose, so the child checks the answer and says why |
| Sudoku | Sudoku | Its own door, numbers from the first level: 4×4 with few blanks, 4×4 with more, 6×6 with 2×3 boxes, then 9×9 twice. Each level draws from a few boards, so the size and the tiles vary: level 1 is usually a garden bed of four bugs (ladybug 1, bee 2, butterfly 3, snail 4) and sometimes plain numbers; a 6×6 can turn up at level 2 and a 9×9 at level 3; bugs come back now and then on the bigger boards (nine of them for a 9×9). Every number has its own colour on the board and on the pad, a tapped square lights its row, column and box and every twin of its number, a placed tile pops in, a row, column or box that completes lights up gold with a note and a word from Pip, and the finished board ripples green. A number that clashes shakes the row, column or box it breaks and comes back out, with the rule said aloud. In take-turns mode Balance it becomes best of three (a point for a first-try answer) and Find every way a race for ways (a point per way, a repeat loses the turn), and the sudoku board becomes a **race**: one tile each, a point per tile, two more for completing a row, column or box, a clash loses the turn, and the result is announced at the end. *Fill one* finds a square with only one possible number, lights the squares that decide it and says why. Pip's lesson shows the three rules on a real grid |
| Think | Think it through · True or not? · Find every way · Catch Pip's mistake · How did you see it? | Sixty problem families written by hand, each needing one good idea and no procedure: logic ("all", "some", "none"), ordering, parity, handshakes and outfits, traps (the candles are still on the cake, the race, the siblings). The middle stone of every trail from every door is a think problem. True or not? is logic statements: all, some and none over a row of balls; a rule ("every ladybug has spots") and what it says for sure, what it leaves open and what it rules out; two clues that point at one bug. Find every way is visible combinatorics: build every outfit from the shirts and hats, every two-scoop cone, every order of three cars: tap a shirt, tap a hat, and the outfit lands by itself in its place in a table (shirts down the side and hats across, a triangle for the cones, three groups by the first car), so the structure that makes the count is what she sees; the star comes when the table is full. Catch Pip's mistake flips the roles: Pip works a problem with one classic slip (counting the start as a hop, adding when the story gave away, counting the full boxes instead of the empty ones, putting two piles together when the question was the gap, counting a dot twice, adding the tens digit as ones) and the child names the slip from three cards, then puts it right. How did you see it? is a number talk: a dot picture with structure, how many, then how you saw it, where any true way wins (rows, a ten and some more, a double, a full grid take away the gaps) and the dots recolour to show that way |
| Playground | Counters and sticks · Number line walk · Balance scale | Free play with no questions: feel ten snapping into a stick, send Pip flying along the line (wing cases open, wings beating, a shadow under her, and every hop leaves a labelled arc, so the sum is drawn as she goes), load a scale and watch it tip |
| Big Ideas | **Numbers:** Counting on · Skip counting · Tens and ones · Bigger and smaller · Number neighbors **Adding and taking:** Making ten · How far apart · What = really means **Groups:** Even and odd · Double and half · Equal groups · Fair sharing **Patterns:** Rules and machines **Shapes:** Shapes and mirrors · Top, front and side **Measure:** Money · Measuring **Time:** Reading the clock · Day and night · Why 24, 60 and 60? · A day on Mars · Before there were clocks · Why time is precious · What is time for? **Ways of thinking:** Bars that tell a story · Walking backwards · Tricks with names · Reading a story | Picture books of 10 to 14 pages narrated by Pip: the idea in a sentence, two or three ways to see it, the rule, why it works, the traps, where you meet it, practice with and without pictures, what it is the same as; then three try-its and a link to the game |

## How a session works

The home screen is the garden with its doors. Pip the ladybug bobs there and in the corner of the play card, jumps on a right answer and tilts her head on a miss. Tapping a door starts a **trail** of five stepping stones, all from that door (a door with fewer than five games cycles through them, never the same problem twice). Each solved stone lights up; the fifth plants a flower. Levels adapt silently and are never shown to the child.

On every problem the child has **Clue**, **Show me**, and, where the game has one, **Watch** (Pip's lesson for that level, shown automatically the first time) and **Learn** (the Big Idea behind the game, offered by Pip on the second miss).

**My Book** (or "(Name)'s Book" once a name is set) writes one sentence the child can read for every problem solved ("Sprout took 9 away from 23 and got 14"), a bigger entry for each level-up and finished trail, and holds the badge shelf.

The grown-up settings are behind the faint *for grown-ups* link at the bottom of the home screen: the child's name and pronouns, the family code, a note for the home screen, a take-turns mode, a level nudge for every game, a short summary page (ideas read, strongest games, what needs a second look, her own words, the last five book lines), and **this week's letter**: one screen for the last seven days, readable in a minute. Days played, problems solved, flowers grown, how many were think problems; her own words from the week; level-ups; what is solid and what is worth doing together (from clues used); Big Ideas read; and three things to say at the table, chosen from what she actually played. A button copies it as plain text to send to the other parent or a grandparent.

**Tell Pip.** A button on every problem and every picture book lets the child report a bug with one tap: it got stuck, the answer is wrong, I don't get it, too hard, too easy, I love this one. Each report carries what was on screen (the game, level, prompt, the words on the stage and the buttons), the app version, the family code and the device, plus a screenshot drawn by the page itself and a copy of the page's markup; if the database rules have not yet been updated for the picture fields, the report is sent again without them so nothing is lost. It goes to the family's database for the grown-ups to read (`tools/reports.sh` lists them and saves the pictures); the grown-ups screen lists the ones sent from the device.

In Stories, the dots warm-up and Count the shapes, the child can touch each object to count it; the touch adds a numbered badge. Stories, riddles, how-many-ways and every Big Idea have a *Read it to me* button (browser speech, where available). Every fourth clean win, a card asks the child to explain out loud how they knew before the next stone.

## Design rules

- One thing on screen at a time. No tabs, no counters, no level tags visible to the child.
- No timers anywhere. Speed is never rewarded.
- A star is earned for finishing a problem, not for a first-try answer.
- Wrong answers get a hint that points at the structure, never an X. The second miss offers the lesson.
- A right number is not the end. Where a game offers one, the star waits for a **why** (choose the reason, with the classic trap among the choices) or **another way** (choose a second method that also works). A wrong reason breaks the streak, and a level-up needs at least one right reason at that level.
- **Think first.** Story games ask one tap before the numpad appears: more or fewer, bigger or smaller than the number in the story. A wrong guess costs only a sentence.
- **Her own words.** After every think problem and every third clean win, a card asks "How did you know?" with Say it (speech recognition, where the browser has it), Type it, or I said it out loud. What she says goes in her book, leads the next greeting, and is listed for the grown-ups.
- Every game shows the idea, not just the answer: Show me draws it, a win acts it out.
- Where asking first would be unfair, Pip teaches first (the Time games and the thinking games), and the lesson can be replayed. A lesson never moves on by the clock: after each sentence it waits for a tap on Next, so the child reads at their own pace.
- Levels adapt on their own: three clean problems in a row moves up, two hint-heavy problems moves down. A grown-up can nudge any level.
- The child's name and pronouns (she, he or they) are a setting; every story, hint and book line uses them, with verbs agreeing. Nothing in the code assumes a name or a gender.
- Take-turns mode alternates turns on the same games so the child watches an adult think out loud.
- Every finished trail waters and grows a flower, and the garden keeps changing: four flower kinds mix as the count grows, a bush appears every eight flowers, a tree sprouts at twenty and grows through four stages to fruit, and visitors arrive at milestones (a butterfly at five, a bee, a bird, a squirrel, a rainbow), each announced on the done screen and in the book. On a streak of three Pip hovers over the flowers on the home screen. The garden follows the real calendar: snow on the soil and falling flakes in winter, blossom in spring, a sun in summer, an orange tree and falling leaves in autumn; the flowers never go, because they were earned. **Pip's story**, a twelve-page picture story (*Pip and the lost five*) read aloud if she likes, opens one page with the first flower and one more every ten flowers, so the reward for a trail is a story, not a count; the done screen announces a new page and offers to read it. Confetti is reserved for flowers, level-ups, and 5- and 10-in-a-row streaks. Streaks are celebrated, never punished, and there is no daily streak to break.
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
      allow create: if request.resource.data.keys().hasOnly(['kind','label','game','level','prompt','stage','controls','when','ver','family','device','lang','html','shot'])
                    && request.resource.data.prompt.size() < 400
                    && request.resource.data.stage.size() < 400
                    && request.resource.data.controls.size() < 300
                    && request.resource.data.html.size() < 25000
                    && request.resource.data.shot.size() < 400000;
    }
```

The Firebase web key is a public identifier, not a secret; these rules are the access control (see [ARCHITECTURE.md](ARCHITECTURE.md#security-and-privacy)).

## Ways of thinking

Four games and four books borrow from the Russian and Singapore primary traditions, where the picture and the strategy are taught by name before the sum: **bar models** (draw the story, then solve it), **working backwards** (undo from the end), **named mental strategies** (look for the trick before you count), and the **reading ritual**, know · want · picture · solve · check (Story detective and the book *Reading a story*). **You ask the question** flips the ritual: the child builds a scene, then chooses what to ask about it; one card asks something the story already says and Pip refuses it, and Pip answers the real one, sometimes wrongly, for the child to check. On a wrong number in a story game a **Does that make sense?** card asks one question about the story's shape ("Max got more and ended with 12. Can he have started with 19?") so the child checks the answer against the story, not the sum. The **Think** door and the **why / another way / think-first** gates are the answer to the Kumon problem: generated problems build fluency, but the star is earned by a reason, a second way or a hand-written puzzle, not by throughput.

## Ideas queued

More Think problems (the bank grows by hand; each family rolls its numbers but keeps its idea).

## Developing

Everything about the code, the engine contract for games and Big Ideas, the sync design and the testing approach is in [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT. See [LICENSE](LICENSE).
