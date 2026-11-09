// Roll, slide, stack at every level: the hill questions and the real-thing matches by tapping the solid (wrong one first on odd goes), the acted-out answer, then faces, corners and edges counted by touching them on the turning solid, with the think-first card, the why gate and the sense card for a ball with corners
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const answerKey=()=>pg.evaluate(()=>__ng().ctx.help.answer.replace('the ',''));
  const pickSolid=async(k)=>{const b=pg.locator(`#controls .choice[data-k="${k}"]`);if(!await b.count())return false;await b.click();await pg.waitForTimeout(150);return true};
  for(let k=0;k<6;k++){await go(pg,'solids',1,'space');const before=await stars(pg);const name=`solids lv1 #${k}`;const ans=await answerKey();const idx=await pg.evaluate(()=>__ng().ctx.help.idx);const keys=await pg.locator('#controls .choice').evaluateAll(bs=>bs.map(b=>b.dataset.k));
    if(keys.length!==4)errs.push(`${name}: ${keys.length} choices`);if(keys[idx]!==ans)errs.push(`${name}: idx ${idx} is ${keys[idx]}, answer ${ans}`);
    if(k%2){await pickSolid(keys[(idx+1)%4]);const m=await msg(pg);if(!m.length)errs.push(`${name}: no hint on a wrong solid`);if(!/flat|round/.test(m))errs.push(`${name}: hint does not speak about faces: "${m}"`)}
    if(!await pickSolid(ans))errs.push(`${name}: no choice for ${ans}`);if(!await pg.locator('#stage svg g').count())errs.push(`${name}: the answer was not acted out`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!/found the solid that/.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`)}
  for(let k=0;k<8;k++){await go(pg,'solids',2,'space');const before=await stars(pg);const name=`solids lv2 #${k}`;const ans=await answerKey();const idx=await pg.evaluate(()=>__ng().ctx.help.idx);const keys=await pg.locator('#controls .choice').evaluateAll(bs=>bs.map(b=>b.dataset.k));
    if(keys[idx]!==ans)errs.push(`${name}: idx ${idx} is ${keys[idx]}, answer ${ans}`);
    if(k%2){await pickSolid(keys[(idx+1)%4]);if(!(await msg(pg)).length)errs.push(`${name}: no hint on a wrong solid`)}
    await pickSolid(ans);if(await pg.locator('#stage .bigword').count()!==1)errs.push(`${name}: the match was not shown`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!/matched .* to a|found the solid with a/.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`)}
  let sawRound=false,sawTurn=false;
  for(let k=0;k<12;k++){await go(pg,'solids',3,'space');const before=await stars(pg);const name=`solids lv3 #${k}`;const n=await pg.evaluate(()=>__ng().ctx.help.answer);const prompt=await pg.locator('#prompt').innerText();
    if(!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);await guess(pg);
    const taps=pg.locator('#stage [data-id]');const tappable=await taps.count();
    if(n===0){sawRound=true;if(tappable)errs.push(`${name}: a round solid has tappable parts`)}
    else{sawTurn=true;if(!tappable)errs.push(`${name}: nothing to touch and count`);await taps.first().click();await pg.waitForTimeout(80);if(!/You touched 1/.test(await pg.locator('#stage .counted').innerText()))errs.push(`${name}: touching a part did not count it`);
      await pg.locator('#stage .turnrow .btn',{hasText:'underneath'}).click();await pg.waitForTimeout(80);if(!await pg.locator('#stage [data-id]').count())errs.push(`${name}: nothing drawn from underneath`);
      const what=prompt.match(/How many (\w+)/)[1];const all=await pg.evaluate(()=>__ng().ctx.help.answer);if({faces:[6,5],corners:[8,5],edges:[12,8]}[what].indexOf(all)<0)errs.push(`${name}: ${all} ${what}?`)}
    if(k%2){await pg.locator('#controls .num',{hasText:new RegExp('^'+(n===0?3:n+1)+'$')}).first().click();await pg.waitForTimeout(100);if(!(await msg(pg)).length)errs.push(`${name}: no hint on a wrong count`);if(n===0&&!await pg.locator('#stage .sense').count())errs.push(`${name}: no sense card for a ball with corners`)}
    await pg.locator('#controls .num',{hasText:new RegExp('^'+n+'$')}).first().click();await pg.waitForTimeout(100);if(!await pg.locator('#stage .gate').count())errs.push(`${name}: no why gate`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!/counted \d+ (faces|corners|edges) on a/.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`)}
  if(!sawTurn)errs.push('solids lv3: never met a turnable solid in 12 goes');
  /* Show me acts the answer out at level 1 and marks every part at level 3 */
  await go(pg,'solids',1,'space');await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);if(!await pg.locator('#stage svg g').count())errs.push('solids lv1: Show me did not act it out');if(!/It's the/.test(await msg(pg)))errs.push(`solids lv1: Show me said "${await msg(pg)}"`);
  await go(pg,'solids',3,'space');await guess(pg);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);if(!/It's \d+\. Because/.test(await msg(pg)))errs.push(`solids lv3: Show me said "${await msg(pg)}"`);
  /* the lesson at each level runs to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'space',steps:['solids','solids','solids','solids','solids'],i:0,lit:[0,0,0,0,0]};s.skill='solids';s.m.solids={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`solids lv${lv}: no lesson before the first problem`);if(!(await pg.locator('#stage .narr .bubble').innerText()).length)errs.push(`solids lv${lv}: Pip said nothing in the lesson`);await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice, #controls .num, #stage .guess').count())errs.push(`solids lv${lv}: My turn did not start the problem`)}
  console.log('solids played, round solid seen:',sawRound);done('solve-solids',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
