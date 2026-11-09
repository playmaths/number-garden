// "How did you know?": in a game with no why gate (How many? at level 3), the card appears on the 2nd, 6th, 10th… win and nowhere else; a right tap and a wrong tap both keep the star, write the flag in the log and leave Next stone working
const {open,go,stars,msg,done,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const setCount=n=>pg.evaluate(n=>{const s=JSON.parse(localStorage.getItem('ng2'));s.counts=s.counts||{};s.counts.dots=n;localStorage.setItem('ng2',JSON.stringify(s))},n);
  const last=()=>pg.evaluate(()=>{const l=JSON.parse(localStorage.getItem('ng2')).log||[];return l[l.length-1]||{}});
  const solve=async()=>{const n=await pg.evaluate(()=>__ng().ctx.help.answer);await pg.locator('#controls .num',{hasText:new RegExp('^'+n+'$')}).first().click();await pg.waitForTimeout(150);return n};
  const card=()=>pg.locator('#stage .gate.how');
  const next=async name=>{const before=await pg.locator('#prompt').innerText()+(await pg.evaluate(()=>__ng().ctx.help.answer));await pg.getByRole('button',{name:'Next stone'}).click();await pause(pg,400);
    if(!await pg.locator('#controls .num').count())errs.push(`${name}: no pad on the next problem`);if(await card().count())errs.push(`${name}: the card is still there on the next problem`);if(await pg.evaluate(()=>__ng().ctx.done))errs.push(`${name}: next problem already done`)};
  /* count 1 -> 2nd win: asked, right pick */
  await go(pg,'dots',3,'warm');await setCount(1);await pg.reload();await pg.waitForTimeout(80);let before=await stars(pg);let n=await solve();
  if(!await card().count())errs.push('right: no how card on the 2nd win');if((await stars(pg))!==before+1)errs.push('right: star not given before the pick');
  const opts=await pg.locator('#stage .gate.how .choice').count();if(opts!==3)errs.push(`right: ${opts} choices`);
  let e=await last();if(e.how!==1||e.howOk!=null)errs.push(`right: log before the pick ${JSON.stringify(e)}`);
  await gate(pg);const why=await pg.evaluate(()=>__ng().ctx.help.why);if(!(await msg(pg)).includes(why))errs.push(`right: msg "${await msg(pg)}" lacks the why "${why}"`);
  e=await last();if(e.how!==1||e.howOk!==true)errs.push(`right: log after the pick ${JSON.stringify(e)}`);
  if(await pg.locator('#stage .gate.how .choice:not([disabled])').count())errs.push('right: choices still live after one tap');await next('right');
  /* count 5 -> 6th win: asked, wrong pick */
  await go(pg,'dots',3,'warm');await setCount(5);await pg.reload();await pg.waitForTimeout(80);before=await stars(pg);n=await solve();
  if(!await card().count())errs.push('wrong: no how card on the 6th win');if((await stars(pg))!==before+1)errs.push('wrong: star not given');
  await pg.locator('#stage .gate.how .choice:not([data-right])').first().click();await pg.waitForTimeout(150);const why2=await pg.evaluate(()=>__ng().ctx.help.why);const m2=await msg(pg);if(!m2.includes(why2)||!/real reason/.test(m2))errs.push(`wrong: msg "${m2}"`);
  if(await pg.evaluate(()=>__ng().ctx.hints))errs.push('wrong: a wrong pick counted as a hint');if(!await pg.locator('#stage .gate.how .choice[data-right="1"].hit').count())errs.push('wrong: the real reason is not lit');
  e=await last();if(e.how!==1||e.howOk!==false)errs.push(`wrong: log after the pick ${JSON.stringify(e)}`);await next('wrong');
  /* count 2 -> 3rd win: not asked, and Next works without any tap */
  await go(pg,'dots',3,'warm');await setCount(2);await pg.reload();await pg.waitForTimeout(80);before=await stars(pg);await solve();
  if(await card().count())errs.push('quiet: how card on the 3rd win');if((await stars(pg))!==before+1)errs.push('quiet: no star');e=await last();if(e.how)errs.push(`quiet: log flagged ${JSON.stringify(e)}`);await next('quiet');
  /* a game with reasons keeps its why gate and never gets the how card */
  await go(pg,'make',2,'warm');await setCount(1);await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.counts.make=1;localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pg.waitForTimeout(80);
  const hasReasons=await pg.evaluate(()=>!!(__ng().ctx.help.reasons||__ng().ctx.help.ways));if(hasReasons){await solve();await gate(pg);if(await card().count())errs.push('make: how card on a game with a why gate')}
  done('solve-howknow',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
