// Catch Pip's mistake and How did you see it? at every level: wrong card then right card, the number, the dots recoloured, and Show me
const {open,go,stars,msg,done,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  for(let lv=1;lv<=3;lv++)for(let k=0;k<6;k++){await go(pg,'pipslip',lv,'think');const before=await stars(pg);const name=`pipslip lv${lv} #${k}`;const ans=await pg.evaluate(()=>__ng().ctx.help.answer);
    if(!await pg.locator('#stage .bubble').count())errs.push(`${name}: Pip did not show her working`);
    if(k%2){await pg.locator('#controls .choice:not([data-right])').first().click();if(!(await msg(pg)).length)errs.push(`${name}: wrong card got no reply`)}
    await pg.locator('#controls .choice[data-right="1"]').click();await pause(pg,1400);if(!await pg.locator('#controls .num').count()){errs.push(`${name}: no numpad after naming the slip`);continue}
    if(k%3===2){await type(ans+1);if(!(await msg(pg)).length)errs.push(`${name}: no hint on a wrong number`)}await type(ans);await gate(pg);
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`)}
  for(let lv=1;lv<=3;lv++)for(let k=0;k<6;k++){await go(pg,'talk',lv,'think');const before=await stars(pg);const name=`talk lv${lv} #${k}`;const n=await pg.evaluate(()=>__ng().ctx.help.answer);
    const shown=await pg.locator('#stage .dot:not(.ghost)').count();if(shown!==n)errs.push(`${name}: ${shown} dots drawn for ${n}`);
    if(k===5){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);const painted=await pg.evaluate(()=>[...document.querySelectorAll('#stage .dot:not(.ghost)')].filter(d=>d.style.background).length);if(painted!==n)errs.push(`${name}: Show me painted ${painted} of ${n}`);continue}
    if(k%2){await type(n+1);if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}await type(n);await pg.waitForTimeout(100);
    const cards=await pg.locator('#controls .choice').count();if(cards!==3)errs.push(`${name}: ${cards} ways offered`);const right=await pg.locator('#controls .choice[data-right="1"]').count();if(right!==2)errs.push(`${name}: ${right} true ways, expected 2`);
    if(k%3===0){await pg.locator('#controls .choice:not([data-right])').click();if(!/finger/.test(await msg(pg)))errs.push(`${name}: false way got no reply`)}
    await pg.locator('#controls .choice[data-right="1"]').first().click();await pg.waitForTimeout(100);const painted=await pg.evaluate(()=>[...document.querySelectorAll('#stage .dot:not(.ghost)')].filter(d=>d.style.background).length);if(painted!==n)errs.push(`${name}: the way was not painted (${painted} of ${n})`);
    await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`)}
  console.log('slips and talks played');done('solve-pip-talk',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
