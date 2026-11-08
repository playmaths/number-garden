// Spot the rule at every level: the grid and the four choices read through the hook (every distractor differs from the answer in exactly one attribute, the answer sits at help.pick),
// a wrong pick first on odd goes (the hint names what is wrong with it), then the right one, the why or another-way gate, the star and the book line; the think-first card at level 3; Show me; the lesson at each level
const {open,go,stars,msg,book,done,guess,gate}=require('./lib');
const KEYS=['shape','col','size','count','fill','turn'];
(async()=>{const {br,pg,errs}=await open();
  const read=()=>pg.evaluate(()=>{const c=__ng().ctx;return{cells:c.cells,choices:c.choices,missing:c.missing,pick:c.help.pick,answer:c.help.answer,hasGuess:!!c.help.guess}});
  const seenMiss=new Set(),seenAttr=new Set();
  for(const [lv,goes] of [[1,6],[2,8],[3,10]])for(let k=0;k<goes;k++){await go(pg,'matrix',lv,'reason');const before=await stars(pg);const name=`matrix lv${lv} #${k}`;const p=await read();const n=lv===3?3:2;
    if(!p.cells||p.cells.length!==n||p.cells.some(r=>r.length!==n))errs.push(`${name}: grid is not ${n} by ${n}`);if(p.choices.length!==4)errs.push(`${name}: ${p.choices.length} choices`);
    const ans=p.cells[p.missing[0]][p.missing[1]];if(p.missing[0]!==n-1)errs.push(`${name}: the gap is not in the bottom row`);seenMiss.add(lv+':'+p.missing[1]);
    const diff=f=>KEYS.filter(x=>f[x]!==ans[x]);if(diff(p.choices[p.pick]).length)errs.push(`${name}: help.pick is not the answer`);
    p.choices.forEach((f,i)=>{if(i===p.pick)return;const d=diff(f);if(d.length!==1)errs.push(`${name}: choice ${i} differs in ${d.length} attributes (${d})`);else seenAttr.add(d[0])});
    if(!/^the /.test(p.answer))errs.push(`${name}: help.answer "${p.answer}"`);
    /* the rows all follow one across rule and the columns one down rule: the attributes that vary along the top row vary the same way along every row */
    const across=KEYS.filter(x=>p.cells[0].some(f=>f[x]!==p.cells[0][0][x]));const down=KEYS.filter(x=>p.cells.some(r=>r[0][x]!==p.cells[0][0][x]));
    if(across.length!==1)errs.push(`${name}: ${across.length} attributes change across (${across})`);if(down.length!==(lv===1?0:1))errs.push(`${name}: ${down.length} attributes change down (${down})`);
    p.cells.forEach((r,ri)=>r.forEach((f,ci)=>{KEYS.forEach(x=>{const want=across.includes(x)?p.cells[0][ci][x]:down.includes(x)?p.cells[ri][0][x]:p.cells[0][0][x];if(f[x]!==want)errs.push(`${name}: cell ${ri},${ci} breaks the rule on ${x}`)})}));
    const grid=await pg.locator('#stage .mxc').count();if(grid!==n*n)errs.push(`${name}: ${grid} squares drawn`);if(await pg.locator('#stage .mxq').innerText()!=='?')errs.push(`${name}: the gap is not marked`);
    if(lv===3){if(!p.hasGuess||!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push(`${name}: a think-first card at level ${lv}`);
    const btn=i=>pg.locator(`#controls .choice[data-i="${i}"]`);
    if(k%2){const w=(p.pick+1)%4;await btn(w).click();await pg.waitForTimeout(120);const m=await msg(pg);if(!/^That one is /.test(m))errs.push(`${name}: the hint does not name what is wrong: "${m}"`);const d=diff(p.choices[w])[0];if(!(d===across[0]?/Look across the row/:d===down[0]?/Look down the column/:/never changes here/).test(m))errs.push(`${name}: hint for a wrong ${d} says "${m}"`);
      if(k%4===3){await btn((p.pick+2)%4).click();await pg.waitForTimeout(120);if(!/^It must be the /.test(await msg(pg)))errs.push(`${name}: second hint "${await msg(pg)}"`)}}
    await btn(p.pick).click();await pg.waitForTimeout(150);if(!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg);
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);if(!/spotted the rule: across .*, down /.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`);
    await pg.waitForTimeout(2400);if(!await pg.locator('#stage .mxq svg').count())errs.push(`${name}: the answer was not dropped into the gap`)}
  if(seenMiss.size<4)errs.push(`the gap sat in only these places: ${[...seenMiss]}`);if(seenAttr.size<4)errs.push(`distractors only ever spoiled ${[...seenAttr]}`);
  /* Show me lights the row, then the column, then fills the gap, and says the answer with both rules */
  await go(pg,'matrix',2,'reason');await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);if(!/^It's the .*\. Across the row .*, and down the column /.test(await msg(pg)))errs.push(`matrix lv2: Show me said "${await msg(pg)}"`);
  if(!/^→ Across: /.test(await pg.locator('#stage .hint').innerText()))errs.push('matrix lv2: Show me did not start with the row');await pg.waitForTimeout(2500);if(!await pg.locator('#stage .mxq svg').count())errs.push('matrix lv2: Show me did not fill the gap');
  /* the lesson at each level runs to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['matrix','matrix','matrix','matrix','matrix'],i:0,lit:[0,0,0,0,0]};s.skill='matrix';s.m.matrix={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`matrix lv${lv}: no lesson before the first problem`);if(!(await pg.locator('#stage .narr .bubble').innerText()).length)errs.push(`matrix lv${lv}: Pip said nothing in the lesson`);if(!await pg.locator('#stage .mx').count())errs.push(`matrix lv${lv}: no grid in the lesson`);
    await pg.getByRole('button',{name:'Next ▶'}).click();await pg.waitForTimeout(400);if(!/across/i.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`matrix lv${lv}: the lesson's second line is not about across`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice, #stage .guess').count())errs.push(`matrix lv${lv}: My turn did not start the problem`)}
  done('solve-matrix',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
