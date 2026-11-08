// the thinking loop: Think it through at every tier (number and choice problems, right and wrong), the think stone in a trail, the think-first card, the why and another-way gates, the own-words card, and the greeting
const {open,go,stars,msg,done,guess,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  const H=()=>pg.evaluate(()=>({answer:__ng().ctx.help.answer,id:__ng().ctx.thinkId}));
  /* Think it through: many problems per tier, no repeats while fresh ones remain */
  const seen=new Set();for(let lv=1;lv<=3;lv++)for(let k=0;k<16;k++){await go(pg,'think',lv,'think');const before=await stars(pg);const {answer,id}=await H();seen.add(id);const name=`think lv${lv} ${id}`;
    if(!await pg.locator('#stage .story').count())errs.push(`${name}: no story`);
    const num=await pg.locator('#controls .num').count();const wrong=k%2===1;
    if(num){if(wrong){await type(answer+1);if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}await type(answer)}
    else{if(wrong){const w=pg.locator('#controls .choice:not([data-right]):not([disabled])').first();await w.click();if(!(await msg(pg)).length)errs.push(`${name}: no reason for the wrong pick`)}await pg.locator('#controls .choice[data-right="1"]').first().click()}
    await gate(pg);const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s} "${await msg(pg)}"`);
    if(!await pg.locator('#stage .said').count())errs.push(`${name}: no own-words card after a think problem`);
    const b=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book[0].t);if(!/thought through/.test(b))errs.push(`${name}: book "${b}"`)}
  console.log(`think problems seen: ${seen.size}`);if(seen.size<30)errs.push(`only ${seen.size} different think problems in 48 goes`);
  /* a trail from another door carries a think stone in the middle, and it mounts as Think */
  await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.locator('.door',{hasText:'Warm'}).click();const steps=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps);if(steps[2]!=='think')errs.push(`trail: ${steps}`);
  if(await pg.locator('#trail .stone.think').count()!==1)errs.push('trail: no think stone drawn');
  /* think first on Find the missing number, then the why gate, then the star */
  await go(pg,'missing',1,'add');let before=await stars(pg);if(!await pg.locator('#stage .guess').count())errs.push('missing: no think-first card');if(await pg.locator('#controls .num').first().isVisible())errs.push('missing: numpad visible before the guess');
  await pg.locator('#stage .guess .choice:not([data-right])').first().click();await pg.waitForTimeout(1100);if(await pg.locator('#stage .guess').count())errs.push('missing: guess card stayed after a wrong guess');if(!await pg.locator('#controls .num').first().isVisible())errs.push('missing: numpad still hidden');
  let a=await pg.evaluate(()=>__ng().ctx.help.answer);await type(a);if(!await pg.locator('#stage .gate').count())errs.push('missing: no why or another-way gate after the right number');if((await stars(pg))!==before)errs.push('missing: star given before the gate');
  const wrongGate=pg.locator('#stage .gate .choice:not([data-right])').first();await wrongGate.click();if(!(await msg(pg)).length)errs.push('gate: a wrong reason gave no reply');await gate(pg);if((await stars(pg))!==before+1)errs.push(`missing: no star after the gate ("${await msg(pg)}")`);
  const hinted=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).m.missing.streak);if(hinted!==0)errs.push(`missing: a wrong reason should break the streak, streak=${hinted}`);
  /* a level-up needs a right reason: three clean numbers with wrong reasons do not move up */
  await go(pg,'make',1,'warm');for(let k=0;k<3;k++){if(k){await pg.getByRole('button',{name:'Next stone'}).click();await pg.waitForTimeout(150)}await guess(pg);a=await pg.evaluate(()=>__ng().ctx.help.answer);await pg.locator('#controls .num',{hasText:new RegExp('^'+a+'$')}).click();await gate(pg)}
  const m=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).m.make);if(m.lv!==2)errs.push(`make: three clean answers with right reasons should level up, got ${JSON.stringify(m)}`);
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.m.make={lv:1,streak:2,low:0,why:0};localStorage.setItem('ng2',JSON.stringify(s))});await go(pg,'make',1,'warm');await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.m.make={lv:1,streak:2,low:0,why:0};localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pg.waitForTimeout(100);
  a=await pg.evaluate(()=>__ng().ctx.help.answer);await pg.locator('#controls .num',{hasText:new RegExp('^'+a+'$')}).click();await pg.waitForTimeout(100);
  const g=pg.locator('#stage .gate');if(await g.count()){const kind=await g.locator('small').innerText();if(/Why/.test(kind)){await g.locator('.choice:not([data-right])').first().click();await g.locator('.choice:not([data-right]):not([disabled])').first().click();await pg.waitForTimeout(2200)}else await gate(pg)}
  const m2=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).m.make);if(m2.lv!==1)errs.push(`make: should not level up without a right reason: ${JSON.stringify(m2)}`);
  /* the own-words card keeps a typed explanation, writes it in the book and the greeting leads with it */
  await go(pg,'think',1,'think');{const {answer}=await H();const num=await pg.locator('#controls .num').count();if(num)await type(answer);else await pg.locator('#controls .choice[data-right="1"]').first().click();await gate(pg)}
  if(await pg.getByRole('button',{name:'Say it'}).count())errs.push('the Say it microphone button shows without the grown-ups switch');
  await pg.getByRole('button',{name:'Type it'}).click();await pg.locator('#stage .saidin').fill('I knew because every cat has four legs');await pg.getByRole('button',{name:'Keep'}).click();await pg.waitForTimeout(100);
  const said=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).said);if(!said||!/four legs/.test(said[0].t))errs.push('own words not kept');
  const b2=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book[0].t);if(!/said: "I knew because/.test(b2))errs.push(`own words not in the book: "${b2}"`);
  await pg.locator('#backBtn').click();await pg.waitForTimeout(100);const greet=await pg.locator('#greet').innerText();if(!/You said: "I knew because/.test(greet))errs.push(`greeting does not lead with her words: "${greet.slice(0,80)}"`);
  await pg.locator('#gearBtn').click();await pg.waitForTimeout(100);if(!/four legs/.test(await pg.locator('#papa').innerText()))errs.push('own words missing from the grown-ups summary');
  console.log('thinking loop checked');done('solve-think',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
