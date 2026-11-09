// Every row, every colour at every level: the grid is a Latin square on each attribute it uses and the right choice completes it; played clean and with a miss first (the hint speaks about the row), the think-first card at level 2, the why or another-way gate at level 3, Show me, and the lesson at each level
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const state=()=>pg.evaluate(()=>{const c=__ng().ctx;return{grid:c.grid,miss:c.miss,choices:c.choices,pick:c.help.pick,answer:c.help.answer}});
  const latin=(g,key)=>{for(let i=0;i<3;i++){if(new Set(g[i].map(f=>f[key])).size!==3)return false;if(new Set(g.map(r=>r[i][key])).size!==3)return false}return true};
  const BOOK={1:/found the missing shape from its row/,2:/found the missing figure from its row and column/,3:/found the missing figure by its shape and its colour/};
  for(const lv of[1,2,3])for(let k=0;k<6;k++){await go(pg,'serial',lv,'reason');const before=await stars(pg);const name=`serial lv${lv} #${k}`;const st=await state();
    if(!latin(st.grid,'s'))errs.push(`${name}: shapes are not a Latin square: ${JSON.stringify(st.grid)}`);
    if(lv===1&&new Set(st.grid.flat().map(f=>f.c)).size!==1)errs.push(`${name}: level 1 should use one colour`);if(lv>1&&!latin(st.grid,'c'))errs.push(`${name}: colours are not a Latin square: ${JSON.stringify(st.grid)}`);
    const want=st.grid[st.miss[0]][st.miss[1]],got=st.choices[st.pick];if(!got||got.s!==want.s||got.c!==want.c)errs.push(`${name}: choice ${st.pick} is ${JSON.stringify(got)}, the gap needs ${JSON.stringify(want)}`);
    if(st.choices.length!==4||new Set(st.choices.map(f=>f.s+f.c)).size!==4)errs.push(`${name}: choices ${JSON.stringify(st.choices)}`);
    if(lv===1&&!st.choices.some(f=>!st.grid.flat().some(g=>g.s===f.s)))errs.push(`${name}: no shape from outside the picture among the choices`);
    if(lv===2&&!st.choices.some(f=>f.s===want.s&&f.c!==want.c))errs.push(`${name}: no right-shape-wrong-colour trap`);
    if(lv===3){const row=st.grid[st.miss[0]].filter((_,c)=>c!==st.miss[1]);st.choices.forEach((f,i)=>{if(i===st.pick)return;const badS=row.some(g=>g.s===f.s),badC=row.some(g=>g.c===f.c);if(badS===badC)errs.push(`${name}: choice ${JSON.stringify(f)} breaks ${badS?'both rules':'no rule'}`)})}
    if(!new RegExp('the '+(lv===1?want.s:want.c+' '+want.s)).test(st.answer))errs.push(`${name}: answer reads "${st.answer}"`);
    if(lv===2){if(!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);await guess(pg)}
    if(await pg.locator('#stage .gap').count()!==1)errs.push(`${name}: the empty square is not drawn`);
    const btns=pg.locator('#controls .choice');if(await btns.count()!==4)errs.push(`${name}: ${await btns.count()} choice buttons`);
    if(k%2){await btns.nth((st.pick+1+k%3)%4).click();await pg.waitForTimeout(100);const m=await msg(pg);if(!m.length)errs.push(`${name}: no hint on a wrong figure`);if(!/row|anywhere|colou?r|column/.test(m))errs.push(`${name}: hint does not point at the row or the colour: "${m}"`);if(await pg.locator('#stage .gap').count()!==1)errs.push(`${name}: a miss filled the gap`)}
    await btns.nth(st.pick).click();await pg.waitForTimeout(120);if(await pg.locator('#stage .gap').count())errs.push(`${name}: the win did not fill the gap`);if(await pg.locator('#stage .sercell svg').count()!==9)errs.push(`${name}: the grid is not full after the win`);
    if(lv===3&&!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!BOOK[lv].test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`)}
  /* Show me lights the row, then the column, then fills the gap and reads the answer */
  await go(pg,'serial',1,'reason');await pg.getByRole('button',{name:'Show me'}).click(); /* the row is lit as the button is tapped; the column and the fill follow, each awaited */
  const lit=await pg.locator('#stage .sercell').evaluateAll(cs=>cs.filter(c=>c.style.outline).map(c=>c.r));if(lit.length!==3||new Set(lit).size!==1)errs.push(`serial lv1: Show me lit ${lit.length} cells of ${new Set(lit).size} rows`);
  await pg.waitForFunction(()=>{const cs=[...document.querySelectorAll('#stage .sercell')].filter(c=>c.style.outline);return cs.length&&cs.every(c=>c.c===cs[0].c)&&new Set(cs.map(c=>c.r)).size>1},null,{timeout:4000}).catch(()=>{});const litC=await pg.locator('#stage .sercell').evaluateAll(cs=>cs.filter(c=>c.style.outline).map(c=>c.c));if(litC.length!==3||new Set(litC).size!==1)errs.push(`serial lv1: Show me then lit ${litC.length} cells of ${new Set(litC).size} columns`);
  await pg.locator('#stage .gap').waitFor({state:'detached',timeout:4000}).catch(()=>{});if(await pg.locator('#stage .gap').count())errs.push('serial lv1: Show me did not fill the gap');if(!/^It's the \w+\. The row already has/.test(await msg(pg)))errs.push(`serial lv1: Show me said "${await msg(pg)}"`);
  await go(pg,'serial',3,'reason');await pg.getByRole('button',{name:'Show me'}).click();if(!/^It's the \w+ \w+\. This row needs/.test(await msg(pg)))errs.push(`serial lv3: Show me said "${await msg(pg)}"`);
  /* the lesson at each level runs from Pip's bubble to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['serial','serial','serial','serial','serial'],i:0,lit:[0,0,0,0,0]};s.skill='serial';s.m.serial={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`serial lv${lv}: no lesson before the first problem`);if(!/row/.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`serial lv${lv}: Pip did not read a row in the lesson`);if(await pg.locator('#stage .sercell svg').count()!==9)errs.push(`serial lv${lv}: the lesson grid is not full at the start`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice, #stage .guess').count())errs.push(`serial lv${lv}: My turn did not start the problem`)}
  console.log('serial played');done('solve-serial',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
