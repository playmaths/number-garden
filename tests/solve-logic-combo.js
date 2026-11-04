// True or not? and Find every way at every level: right and wrong picks, duplicates and bad builds refused, Show me, and the Think door's trail mixing the three games
const {open,go,stars,msg,done,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  for(let lv=1;lv<=3;lv++)for(let k=0;k<6;k++){await go(pg,'truth',lv,'think');const before=await stars(pg);const name=`truth lv${lv} #${k}`;
    if(!await pg.locator('#stage .story').count())errs.push(`${name}: no statement`);const right=pg.locator('#controls .choice[data-right="1"]');if(await right.count()!==1)errs.push(`${name}: ${await right.count()} right options`);
    if(k%2){const w=pg.locator('#controls .choice:not([data-right])').first();await w.click();if(!(await msg(pg)).length)errs.push(`${name}: wrong pick got no reason`)}
    await right.click();await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`)}
  for(let lv=1;lv<=3;lv++)for(const mode of ['clean','show']){await go(pg,'combo',lv,'think');const before=await stars(pg);const name=`combo lv${lv} ${mode}`;const total=await pg.evaluate(()=>__ng().ctx.help.answer);
    if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);if(await pg.locator('#stage .ccell.got').count()!==total)errs.push(`${name}: Show me filled ${await pg.locator('#stage .ccell.got').count()} of ${total}`);continue}
    const groups=await pg.evaluate(()=>[...document.querySelectorAll('#stage .build .bwrap')].map(w=>[...w.querySelectorAll('.choice')].map(b=>b.textContent)));
    const pickOne=async(sel)=>{for(let gi=0;gi<sel.length;gi++)await pg.locator('#stage .build .bwrap').nth(gi).locator('.choice',{hasText:sel[gi]}).click();await pg.waitForTimeout(500)}; // a way is placed by itself once its last piece is tapped
    /* every combination, including the bad and duplicate ones, which must be refused */
    const all=[];const rec=(i,cur)=>{if(i===groups.length){all.push(cur);return}groups[i].forEach(it=>rec(i+1,cur.concat(it)))};rec(0,[]);
    let refused=0;for(const sel of all){if(!await pg.getByRole('button',{name:"That's one"}).count())break;await pickOne(sel);const m=await msg(pg);if(/already found|same/.test(m))refused++}
    if(lv>1&&!refused)errs.push(`${name}: no duplicate or bad build was refused`);
    const found=await pg.locator('#stage .ccell.got').count();if(found!==total)errs.push(`${name}: ${found} found, expected ${total}`);if(await pg.locator('#stage .ccell:not(.off):not(.got)').count())errs.push(`${name}: empty cells left in the table`);if(await pg.getByRole('button',{name:"That's one"}).count())errs.push(`${name}: That's one still shown after the win`);
    await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`)}
  await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.locator('.door',{hasText:'One good idea'}).click();const steps=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps);if(new Set(steps).size<3)errs.push(`think door trail does not mix the games: ${steps}`);
  console.log('logic and combos played');done('solve-logic-combo',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
