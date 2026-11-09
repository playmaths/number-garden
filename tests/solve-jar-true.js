// Estimation jar and Make it true at every level: the jar's dots match its count, a wrong size shows ten, the right size reveals tens; the sign games with wrong then right picks and the why gate
const {open,go,stars,msg,done,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  for(let lv=1;lv<=3;lv++)for(let k=0;k<5;k++){await go(pg,'jar',lv,'meas');const before=await stars(pg);const name=`jar lv${lv} #${k}`;const best=await pg.evaluate(()=>__ng().ctx.help.answer);
    const dots=await pg.locator('#stage .jd').count();const real=await pg.evaluate(()=>+__ng().ctx.help.why.match(/There are (\d+)/)[1]);if(dots!==real)errs.push(`${name}: ${dots} dots drawn, said ${real}`);
    const opts=await pg.locator('#controls .choice').allInnerTexts();const vals=opts.map(o=>+o.replace('about ',''));const nearest=vals.reduce((a,b)=>Math.abs(b-real)<Math.abs(a-real)?b:a);if(nearest!==best)errs.push(`${name}: best ${best} but nearest to ${real} is ${nearest}`);
    if(k%2){const wrong=opts.find(o=>+o.replace('about ','')!==best);await pg.locator('#controls .choice',{hasText:new RegExp('^'+wrong+'$')}).click();if(!/ten/i.test(await msg(pg)))errs.push(`${name}: wrong size got "${await msg(pg)}"`);const yellow=await pg.locator('#stage .jd[fill="var(--sun)"]').count();if(yellow!==Math.min(10,real))errs.push(`${name}: ten beads not shown after a miss (${yellow})`)}
    await pg.locator('#controls .choice',{hasText:new RegExp('^about '+best+'$')}).click();await pg.waitForTimeout(100);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);await pg.waitForTimeout(400*Math.ceil(real/10)+300);if(!(await pg.locator('#stage .bigword').innerText()).includes(String(real)))errs.push(`${name}: reveal did not end on ${real}`)}
  for(let lv=1;lv<=3;lv++)for(let k=0;k<6;k++){await go(pg,'maketrue',lv,'puz');const before=await stars(pg);const name=`maketrue lv${lv} #${k}`;
    const right=pg.locator('#controls .choice[data-right="1"]');if(await right.count()!==1)errs.push(`${name}: ${await right.count()} right options`);
    if(k%2){await pg.locator('#controls .choice:not([data-right])').first().click();if(!(await msg(pg)).length)errs.push(`${name}: wrong sign got no reply`)}
    await right.click();await pg.waitForTimeout(100);if(!await pg.locator('#stage .gate').count())errs.push(`${name}: no why gate`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    const eq=await pg.locator('#stage .eq').innerText();if(/\?/.test(eq)&&lv!==2)errs.push(`${name}: the sign was not filled in: "${eq}"`)}
  console.log('jar and make-it-true played');done('solve-jar-true',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
