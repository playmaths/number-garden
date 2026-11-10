// Finish the wallpaper at every level: the grid read through the hook obeys its rule (two tiles taking turns, a three-tile cycle sliding one step a row, shapes across and colours down), the right piece continues the row and the column,
// every distractor differs from it, the hole is off the edge at level 1 and 2 by 2 at level 3; a wrong pick first on odd goes (the hint speaks about the row), the think-first card at level 2, the why or another-way gate at level 3, the star and the book line; Show me; the lesson at each level
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
const key=f=>[f.shape,f.col,f.size,f.count,f.fill,f.turn].join('|');const same=(a,b)=>a.length===b.length&&a.every((f,i)=>key(f)===key(b[i]));
(async()=>{const {br,pg,errs}=await open();
  const read=()=>pg.evaluate(()=>{const c=__ng().ctx;return{grid:c.grid,hole:c.hole,choices:c.choices,rule:c.rule,pick:c.help.pick,answer:c.help.answer,hasGuess:!!c.help.guess}});
  const seenKind=new Set(),seenHole=new Set();
  for(const [lv,goes] of [[1,8],[2,8],[3,8]])for(let k=0;k<goes;k++){await go(pg,'tile',lv,'reason');const before=await stars(pg);const name=`tile lv${lv} #${k}`;const p=await read();const h=p.hole,n=lv===3?2:1;
    if(!p.grid||p.grid.length!==4||p.grid.some(r=>r.length!==4))errs.push(`${name}: grid is not 4 by 4`);if(p.choices.length!==4)errs.push(`${name}: ${p.choices.length} choices`);
    if(h.n!==n||h.r<0||h.c<0||h.r+n>4||h.c+n>4)errs.push(`${name}: hole ${JSON.stringify(h)}`);if(lv===1&&(h.r===0||h.r===3||h.c===0||h.c===3))errs.push(`${name}: the hole is on the edge`);seenHole.add(lv+':'+h.r+','+h.c);
    /* the rule the game says it used must hold on every cell, the hole included (the grid carries the true tiles), and the rule must be a real wallpaper: the tiles differ by shape, never by colour alone */
    const R=p.rule,at=lv===1?(r,c)=>R.tiles[R.kind==='abab'?c%2:R.kind==='stripes'?r%2:(r+c)%2]:lv===2?(r,c)=>R.tiles[(c+R.shift*r)%3]:(r,c)=>({shape:R.shapes[c%2],col:R.cols[r%2],fill:R.fills[r%2]});
    p.grid.forEach((row,r)=>row.forEach((f,c)=>{const w=at(r,c);if(lv===3?(f.shape!==w.shape||f.col!==w.col||f.fill!==w.fill):key(f)!==key(w))errs.push(`${name}: cell ${r},${c} breaks the rule`)}));
    if(lv<3){const sh=R.tiles.map(t=>t.shape);if(new Set(sh).size!==sh.length)errs.push(`${name}: tiles share a shape: ${sh}`);if(lv===1)seenKind.add(R.kind);if(lv===2&&![1,2].includes(R.shift))errs.push(`${name}: shift ${R.shift}`)}
    else{if(R.shapes[0]===R.shapes[1]||R.cols[0]===R.cols[1]||R.fills[0]===R.fills[1])errs.push(`${name}: level 3 rules do not alternate: ${JSON.stringify(R)}`)}
    /* the right piece is what the grid holds at the hole, read row by row: it continues the row and the column by construction of the rule above; every other piece differs from it */
    const want=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)want.push(p.grid[h.r+i][h.c+j]);const ans=p.choices[p.pick];
    if(!ans||!same(ans,want))errs.push(`${name}: help.pick ${p.pick} is ${JSON.stringify(ans)}, the hole holds ${JSON.stringify(want)}`);
    p.choices.forEach((P,i)=>{if(i===p.pick)return;if(P.length!==n*n)errs.push(`${name}: choice ${i} has ${P.length} squares`);if(same(P,want))errs.push(`${name}: choice ${i} is the answer too`)});
    if(lv===1){const a=want[0];if(!p.choices.some(P=>P[0].shape!==a.shape))errs.push(`${name}: no other-tile choice`);if(!p.choices.some(P=>P[0].shape===a.shape&&P[0].col===a.col&&P[0].turn!==a.turn))errs.push(`${name}: no turned choice`);if(!p.choices.some(P=>P[0].shape===a.shape&&P[0].col!==a.col&&P[0].turn===a.turn))errs.push(`${name}: no wrong-colour choice`)}
    if(lv===3){const m=[want[1],want[0],want[3],want[2]];if(!p.choices.some(P=>same(P,m)))errs.push(`${name}: no mirrored piece among the choices`)}
    if(!/^the /.test(p.answer))errs.push(`${name}: help.answer "${p.answer}"`);
    if(await pg.locator('#stage .tic').count()!==16)errs.push(`${name}: ${await pg.locator('#stage .tic').count()} squares drawn`);if(await pg.locator('#stage .tiq').count()!==n*n)errs.push(`${name}: ${await pg.locator('#stage .tiq').count()} hole squares`);
    if(lv===2){if(!p.hasGuess||!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push(`${name}: a think-first card at level ${lv}`);
    const btn=i=>pg.locator(`#controls .choice[data-i="${i}"]`);
    if(k%2){const w=(p.pick+1+k%3)%4;await btn(w).click();await pg.waitForTimeout(120);const m=await msg(pg);if(!/^(That piece|Right shape)/.test(m))errs.push(`${name}: the hint does not name what is wrong: "${m}"`);if(!/row|stand up/.test(m))errs.push(`${name}: hint does not point at the row: "${m}"`);
      if(await pg.locator('#stage .tiq').count()!==n*n)errs.push(`${name}: a miss filled the hole`);
      if(k%4===3){await btn((p.pick+2+k%3)%4).click();await pg.waitForTimeout(120);if(!/^The hole needs the /.test(await msg(pg)))errs.push(`${name}: second hint "${await msg(pg)}"`)}}
    await btn(p.pick).click();await pg.waitForTimeout(150);
    if(lv===3&&!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg); /* at levels 1 and 2 the only .gate card is the engine's How did you know? on every fourth win */
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);const bl=await book(pg);if(!/ finished the wallpaper: \w+, \w+, \w+\.$/.test(bl))errs.push(`${name}: book line "${bl}"`);
    await pg.locator('#stage .tiq').waitFor({state:'detached',timeout:4000}).catch(()=>{});if(await pg.locator('#stage .tiq').count())errs.push(`${name}: the win did not slide the piece in`);if(await pg.locator('#stage .tic svg').count()!==16)errs.push(`${name}: the wallpaper is not full after the win`)}
  /* the three level-1 kinds are rolled at random: keep mounting until each has shown up, with a cap, so luck cannot fail the check */
  for(let k=0;k<40&&seenKind.size<3;k++){await go(pg,'tile',1,'reason');seenKind.add(await pg.evaluate(()=>__ng().ctx.rule.kind))}
  if(seenKind.size<3)errs.push(`level 1 only ever drew ${[...seenKind]}`);if(seenHole.size<6)errs.push(`the hole sat in only these places: ${[...seenHole]}`);
  /* Show me slides the piece in, lights the row, then the column, and says the answer with both readings */
  await go(pg,'tile',3,'reason');await pg.getByRole('button',{name:'Show me'}).click();if(!/^It's the piece with the .*\. Because the row goes .*, and the column goes /.test(await msg(pg)))errs.push(`tile lv3: Show me said "${await msg(pg)}"`);
  await pg.locator('#stage .tiq').waitFor({state:'detached',timeout:4000}).catch(()=>{});if(await pg.locator('#stage .tiq').count())errs.push('tile lv3: Show me did not fill the hole');
  await pg.waitForFunction(()=>/^→ Along the row/.test(document.querySelector('#stage .hint').textContent),null,{timeout:4000}).catch(()=>{});
  const lit=await pg.locator('#stage .tic').evaluateAll(cs=>cs.filter(c=>c.style.boxShadow).map(c=>c.r));if(lit.length!==4||new Set(lit).size!==1)errs.push(`tile lv3: Show me lit ${lit.length} squares of ${new Set(lit).size} rows`);
  await pg.waitForFunction(()=>/^↓ Down the column/.test(document.querySelector('#stage .hint').textContent),null,{timeout:4000}).catch(()=>{});
  const litC=await pg.locator('#stage .tic').evaluateAll(cs=>cs.filter(c=>c.style.boxShadow).map(c=>c.c));if(litC.length!==4||new Set(litC).size!==1)errs.push(`tile lv3: Show me then lit ${litC.length} squares of ${new Set(litC).size} columns`);
  await go(pg,'tile',1,'reason');await pg.getByRole('button',{name:'Show me'}).click();if(!/^It's the \w+ \w+\. Along the row: /.test(await msg(pg)))errs.push(`tile lv1: Show me said "${await msg(pg)}"`);
  /* the lesson at each level: Pip's hand covers the square, the row is read, the hand is lifted by the end */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['tile','tile','tile','tile','tile'],i:0,lit:[0,0,0,0,0]};s.skill='tile';s.m.tile={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`tile lv${lv}: no lesson before the first problem`);if(!/hand/.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`tile lv${lv}: Pip did not put her hand on the wallpaper`);
    if(await pg.locator('#stage .tihand').count()!==1)errs.push(`tile lv${lv}: no hand on the wallpaper`);if(await pg.locator('#stage .tic svg').count()!==16)errs.push(`tile lv${lv}: the lesson wallpaper is not full`);
    await pg.getByRole('button',{name:'Next ▶'}).click();await pause(pg,400);if(!/Read the row with me/.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`tile lv${lv}: the lesson's second line does not read the row`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice, #stage .guess').count())errs.push(`tile lv${lv}: My turn did not start the problem`)}
  done('solve-tile',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
