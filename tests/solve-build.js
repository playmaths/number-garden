// plays Build the stack at every level: builds the target by tapping the floor, checks it; also a wrong build then a fix; and Show me
const {open,go,stars,msg,done,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const target=()=>pg.evaluate(()=>__ng().ctx.target);
  const tap=async(i,times)=>{for(let k=0;k<times;k++)await pg.locator('#stage .bcell').nth(i).click()};
  const build=async(hm)=>{const C=hm[0].length;for(let r=0;r<hm.length;r++)for(let c=0;c<C;c++)await tap(r*C+c,hm[r][c])};
  for(let lv=1;lv<=3;lv++)for(const mode of ['clean','miss','show']){await go(pg,'build',lv,'space');const before=await stars(pg);const name=`build lv${lv} ${mode}`;const hm=await target();
    const views=await pg.locator('#stage .views .vcard').count();if(views!==(lv===1?1:lv===2?2:3))errs.push(`${name}: ${views} goal views`);
    if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);const cells=await pg.locator('#stage .bcell').allInnerTexts();const got=cells.map(x=>+x||0);if(JSON.stringify(got)!==JSON.stringify(hm.flat()))errs.push(`${name}: Show me filled ${got} not ${hm.flat()}`);continue}
    if(mode==='miss'){await tap(0,1);await pg.getByRole('button',{name:'Check it'}).click();const m=await msg(pg);if(!/view|tower|square/.test(m))errs.push(`${name}: hint was "${m}"`);await tap(0,3)} // undo the extra cube (heights cycle 0..3)
    await build(hm);await pg.getByRole('button',{name:'Check it'}).click();await pg.waitForTimeout(150);
    const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s}, msg "${await msg(pg)}"`);
    if(!await pg.locator('#stage .turn .views').count())errs.push(`${name}: no views after the win`)}
  /* a view switch (Tell Pip and back) must not hide the goal cards: they used to share the page-view class */
  await go(pg,'build',2,'space');await pg.locator('#tellBtn').click();await pg.locator('#tellGrid .choice',{hasText:'love'}).click();await pg.waitForTimeout(300);await pg.locator('#tellReturn').click();await pg.waitForTimeout(100);if(!await pg.locator('#stage .views .vcard').first().isVisible())errs.push('goal views hidden after Tell Pip and back');
  /* level 2 accepts any stack with the same top and front views: add a hidden cube that changes neither */
  await go(pg,'build',2,'space');{const hm=await target();const alt=hm.map(r=>r.slice());let changed=false;for(let c=0;c<2&&!changed;c++){const col=[hm[0][c],hm[1][c]];if(col[0]&&col[1]&&col[0]<col[1]){alt[0][c]=col[1];changed=true}}
    await build(alt);await pg.getByRole('button',{name:'Check it'}).click();await pg.waitForTimeout(100);if(changed&&!/same views/.test(await msg(pg)))errs.push(`build lv2 alt: a stack with the same views was refused: "${await msg(pg)}"`)}
  console.log('build played');done('solve-build',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
