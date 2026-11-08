// Fold and punch at every level: the open sheet picked from four (a wrong sheet first on odd goes, the hint naming the fold), the flap swinging back on a win, the tap mode at level 2 (a wrong tap is a hint and leaves no hole, Done too early is a miss, then every hole tapped), the think-first count, the why or another-way gate at level 3, Show me, and the lessons
const {open,go,stars,msg,book,done,guess,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const info=()=>pg.evaluate(()=>{const c=__ng().ctx;return{mode:c.mode,holes:c.holes,pick:c.help.pick,answer:c.help.answer}});
  const pickSheet=async i=>{await pg.locator('#controls .choice').nth(i).click();await pg.waitForTimeout(150)};
  const swung=async name=>{await pg.waitForTimeout(2200);if(!await pg.locator('#stage .fslot svg').count())errs.push(`${name}: the sheet was not opened in the ? slot`)};
  let sawTap=false,sawPick2=false;
  for(const lv of [1,2,3])for(let k=0;k<(lv===2?10:6);k++){await go(pg,'fold',lv,'reason');const before=await stars(pg);const name=`fold lv${lv} #${k}`;
    if(lv>1){if(!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);await guess(pg)}
    const c=await info();if(c.holes.length!==(lv===1?2:4))errs.push(`${name}: ${c.holes.length} holes expected on the open sheet`);
    if(c.mode==='tap'){sawTap=true;const wrong=[...Array(16).keys()].find(i=>!c.holes.includes(i));
      await pg.locator(`#stage .tap[data-cell="${wrong}"]`).click();await pg.waitForTimeout(100);if(!/fold/.test(await msg(pg)))errs.push(`${name}: a wrong tap gave no hint ("${await msg(pg)}")`);if(await pg.locator('#stage .fslot .hole').count())errs.push(`${name}: a wrong tap punched a hole`);
      const tap=async i=>{await pg.locator(`#stage .tap[data-cell="${i}"]`).click();await pg.waitForTimeout(60)};
      if(k%2){for(const i of c.holes.slice(0,-1))await tap(i);await pg.getByRole('button',{name:'Done'}).click();await pg.waitForTimeout(100);if(!/found 3 of 4/.test(await msg(pg)))errs.push(`${name}: Done too early said "${await msg(pg)}"`);await tap(c.holes[c.holes.length-1])}
      else for(const i of c.holes)await tap(i);
      if(!/You marked 4/.test(await pg.locator('#stage .counted').innerText()))errs.push(`${name}: the count did not follow the taps`);
      await pg.getByRole('button',{name:'Done'}).click();await pg.waitForTimeout(150);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
      if(!/tapped where the 4 holes would be/.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`);await swung(name);continue}
    if(lv===2)sawPick2=true;const n=await pg.locator('#controls .choice').count();if(n!==4)errs.push(`${name}: ${n} choices`);if(!/the one with (two|four) holes/.test(c.answer))errs.push(`${name}: answer "${c.answer}"`);
    if(k%2){await pickSheet((c.pick+1)%4);const m=await msg(pg);if(!/fold/.test(m))errs.push(`${name}: the hint on a wrong sheet does not name the fold: "${m}"`)}
    await pickSheet(c.pick);if(lv===3&&!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!/unfolded the paper in (her|his|their) head: [24] holes/.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`);await swung(name)}
  if(!sawTap)errs.push('fold lv2: never met the tap mode in 10 goes');if(!sawPick2)errs.push('fold lv2: never met the pick mode in 10 goes');
  /* Show me opens the sheet and names the answer */
  await go(pg,'fold',1,'reason');await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);if(!/It's the one with two holes/.test(await msg(pg)))errs.push(`fold lv1: Show me said "${await msg(pg)}"`);if(!await pg.locator('#controls .choice.hit').count())errs.push('fold lv1: Show me did not light the right sheet');await swung('fold lv1 show');
  await go(pg,'fold',3,'reason');await guess(pg);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);if(!/It's the one with four holes.*doubles/.test(await msg(pg)))errs.push(`fold lv3: Show me said "${await msg(pg)}"`);
  /* the lesson at each level runs to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['fold','fold','fold','fold','fold'],i:0,lit:[0,0,0,0,0]};s.skill='fold';s.m.fold={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`fold lv${lv}: no lesson before the first problem`);if(!(await pg.locator('#stage .narr .bubble').innerText()).length)errs.push(`fold lv${lv}: Pip said nothing in the lesson`);if(!await pg.locator('#stage .lesson .flap').count())errs.push(`fold lv${lv}: no sheet to fold in the lesson`);await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice, #controls .btn, #stage .guess').count())errs.push(`fold lv${lv}: My turn did not start the problem`)}
  done('solve-fold',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
