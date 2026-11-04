// Ten-frame flash at every level (the cover lifts and drops, Show again counts as a clue, the why gate), and the two-player races on Balance it and Find every way
const {open,go,stars,msg,done,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  for(let lv=1;lv<=3;lv++)for(let k=0;k<5;k++){await go(pg,'flash',lv,'warm');const before=await stars(pg);const name=`flash lv${lv} #${k}`;const n=await pg.evaluate(()=>__ng().ctx.help.answer);
    await pg.waitForTimeout(600);if(!await pg.locator('#stage .cover.off').count())errs.push(`${name}: the cover did not lift`);await pg.waitForTimeout(1500);if(await pg.locator('#stage .cover.off').count())errs.push(`${name}: the cover did not drop back`);
    const dots=await pg.locator('#stage .frame i:not(.empty)').count();if(dots!==n)errs.push(`${name}: ${dots} dots for ${n}`);
    if(k%2){await pg.getByRole('button',{name:'Show again'}).click();await pg.waitForTimeout(100);if(!await pg.locator('#stage .cover.off').count())errs.push(`${name}: Show again did not lift the cover`);const h=await pg.evaluate(()=>__ng().ctx.hints);if(h!==1)errs.push(`${name}: Show again should count as a clue (hints=${h})`);await pg.waitForTimeout(1500)}
    await type(n);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);if(!await pg.locator('#stage .cover.gone').count())errs.push(`${name}: the frame stays covered after the win`)}
  /* races */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.duo=true;s.turn=0;localStorage.setItem('ng2',JSON.stringify(s))});
  await go(pg,'balance',1,'puz');{const before=await stars(pg);if(!await pg.locator('#stage .race').count())errs.push('balance race: no scoreboard');
    for(let r=0;r<3;r++){const ans=await pg.evaluate(()=>__ng().ctx.help.answer);const now=await pg.locator('#stage .race .now').innerText();await type(ans);await pg.waitForTimeout(1900);if(r<2){const next=await pg.locator('#stage .race .now').innerText();if(now.split(' ')[1]===next.split(' ')[1])errs.push(`balance race: turn did not pass after round ${r+1}`);if(!/\d of 3/.test(await pg.locator('#stage .race').innerText()))errs.push('balance race: no round counter')}}
    await gate(pg);const m=await msg(pg);if(!/wins|tie/i.test(m))errs.push(`balance race: no result ("${m}")`);if((await stars(pg))!==before+1)errs.push('balance race: no star')}
  await go(pg,'combo',1,'think');{const before=await stars(pg);if(!await pg.locator('#stage .race').count())errs.push('combo race: no scoreboard');
    const groups=await pg.evaluate(()=>[...document.querySelectorAll('#stage .build .bwrap')].map(w=>[...w.querySelectorAll('.choice')].map(b=>b.textContent)));
    const pickOne=async(sel)=>{for(let gi=0;gi<sel.length;gi++)await pg.locator('#stage .build .bwrap').nth(gi).locator('.choice',{hasText:sel[gi]}).click();await pg.waitForTimeout(500)}; // a way is placed by itself once its last piece is tapped
    const t0=await pg.locator('#stage .race .now').innerText();await pickOne([groups[0][0],groups[1][0]]);const t1=await pg.locator('#stage .race .now').innerText();if(t0.split(' ')[1]===t1.split(' ')[1])errs.push('combo race: turn did not pass after a way');
    await pickOne([groups[0][0],groups[1][0]]);if(!/loses the turn/.test(await msg(pg)))errs.push('combo race: a repeat should lose the turn');const t2=await pg.locator('#stage .race .now').innerText();if(t1.split(' ')[1]===t2.split(' ')[1])errs.push('combo race: turn did not pass after a repeat');
    for(const a of groups[0])for(const b of groups[1]){if(!await pg.getByRole('button',{name:"That's one"}).count())break;await pickOne([a,b])}
    await gate(pg);const m=await msg(pg);if(!/found more|tie/i.test(m))errs.push(`combo race: no result ("${m}")`);if((await stars(pg))!==before+1)errs.push('combo race: no star')}
  console.log('flash and races played');done('solve-flash-race',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
