// Sticks and dots at every level: built by hand with too many sticks then put right (level 1), read from the picture after the think-first card (level 2), 10 more / 10 less and 1 more / 1 less with the trap answer first (level 3); Show me and the why / another-way gate on each
const {open,go,stars,msg,done,guess,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  const counts=async()=>({s:await pg.locator('#stage .rods .rod').count(),d:await pg.locator('#stage .ones .one').count()});
  /* level 1: tap stick and dot until the picture is the number; on a miss round, one stick too many first, then tapped off again */
  for(let k=0;k<4;k++){await go(pg,'place',1,'add');const before=await stars(pg);const n=await pg.evaluate(()=>__ng().ctx.help.answer);const t=Math.floor(n/10),o=n%10;
    if(!/Show me \d+/.test(await pg.locator('#prompt').innerText()))errs.push('place lv1: prompt is not Show me');
    const stick=pg.locator('#controls .btn',{hasText:'+ stick'}),dot=pg.locator('#controls .btn',{hasText:'+ dot'});
    for(let i=0;i<t;i++)await stick.click();
    if(k%2){await stick.click();if(!/too many/.test(await msg(pg)))errs.push('place lv1: no hint on one stick too many: '+await msg(pg));await pg.locator('#stage .rods .rod').last().click();if((await counts()).s!==t)errs.push('place lv1: tapping a stick did not take it off')}
    for(let i=0;i<o;i++)await dot.click();await pg.waitForTimeout(150);
    const c=await counts();if(c.s!==t||c.d!==o)errs.push(`place lv1: built ${c.s} sticks ${c.d} dots for ${n}`);
    if(!await pg.locator('#stage .gate').count())errs.push('place lv1: no why or another-way gate');await gate(pg);if((await stars(pg))!==before+1)errs.push(`place lv1 #${k}: no star ("${await msg(pg)}")`)}
  /* ten dots snap into a stick */
  await go(pg,'place',1,'add');for(let i=0;i<10;i++)await pg.locator('#controls .btn',{hasText:'+ dot'}).click();await pg.waitForTimeout(100);{const c=await counts();if(c.s!==1||c.d!==0)errs.push(`place lv1: ten dots gave ${c.s} sticks and ${c.d} dots, not one stick`)}
  /* level 2: the picture matches the number, think first, the stick-as-one trap gets its own hint */
  for(let k=0;k<4;k++){await go(pg,'place',2,'add');const before=await stars(pg);const n=await pg.evaluate(()=>__ng().ctx.help.answer);const t=Math.floor(n/10),o=n%10;const c=await counts();if(c.s!==t||c.d!==o)errs.push(`place lv2: picture is ${c.s} sticks ${c.d} dots for ${n}`);
    if(!await pg.locator('#stage .guess').count())errs.push('place lv2: no think-first card');await guess(pg);
    if(k%2){await type(t+o);if(!/stick as one|ten/i.test(await msg(pg)))errs.push('place lv2: no stick-as-one hint: '+await msg(pg))}
    await type(n);await gate(pg);if((await stars(pg))!==before+1)errs.push(`place lv2 #${k}: no star ("${await msg(pg)}")`)}
  /* level 3: the trap answer (dots changed for 10 more, a stick for 1 more) is named, then the right one; a stick appears or fades on the win */
  let seenTens=0,seenOnes=0;for(let k=0;k<8;k++){await go(pg,'place',3,'add');const before=await stars(pg);const ans=await pg.evaluate(()=>__ng().ctx.help.answer);const p=await pg.locator('#prompt').innerText();const m=p.match(/What is (\d+) (more|less) than (\d+)\?/);if(!m){errs.push('place lv3: prompt '+p);continue}
    const kk=+m[1],up=m[2]==='more',n=+m[3];if(ans!==(up?n+kk:n-kk))errs.push(`place lv3: answer ${ans} for ${p}`);if(Math.floor(ans/10)!==Math.floor(n/10)&&kk===1)errs.push('place lv3: 1 more crossed a ten');kk===10?seenTens++:seenOnes++;
    if(!await pg.locator('#stage .guess').count())errs.push('place lv3: no think-first card');await guess(pg);
    if(k%2){const slip=up?n+(kk===10?1:10):n-(kk===10?1:10);await type(slip);if(!/changed/.test(await msg(pg)))errs.push('place lv3: no trap hint for '+slip+': '+await msg(pg))}
    const c0=await counts();await type(ans);const c1=await counts();if(kk===10&&up&&c1.s!==c0.s+1)errs.push('place lv3: 10 more did not add a stick');if(kk===1&&up&&c1.d!==c0.d+1)errs.push('place lv3: 1 more did not add a dot');
    await gate(pg);if((await stars(pg))!==before+1)errs.push(`place lv3 #${k}: no star ("${await msg(pg)}")`)}
  if(!seenTens||!seenOnes)console.log('  note: level 3 rolled',seenTens,'ten-steps and',seenOnes,'one-steps');
  /* Show me on each level: level 1 builds it and counts by tens, level 3 draws the hundred chart */
  for(const lv of[1,2,3]){await go(pg,'place',lv,'add');if(lv>1)await guess(pg);await pg.getByRole('button',{name:'Clue'}).click();if(!(await msg(pg)).length)errs.push(`place lv${lv}: Clue said nothing`);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(lv===1?3200:400);
    const n=await pg.evaluate(()=>__ng().ctx.help.answer);if(!(await msg(pg)).includes(String(n)))errs.push(`place lv${lv}: Show me did not say ${n}`);
    if(lv===1){const c=await counts();if(c.s!==Math.floor(n/10)||c.d!==n%10)errs.push(`place lv1: Show me built ${c.s} sticks ${c.d} dots for ${n}`);if(!/10/.test(await pg.locator('#stage .hint').innerText()))errs.push('place lv1: Show me did not count by tens')}
    if(lv===3&&await pg.locator('#stage div[style*="grid-template-columns"]').count()!==1)errs.push('place lv3: Show me drew no hundred chart')}
  console.log('sticks and dots played');done('solve-place',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
