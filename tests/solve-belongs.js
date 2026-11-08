// Goes together at every level: which one does not belong and which one goes with these (level 1), picture analogies with the think-first rule card (level 2), the mix with the why or another-way gate (level 3); each played clean and after a wrong picture, then Show me and the lesson at each level
const {open,go,stars,msg,book,done,guess,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const word=()=>pg.evaluate(()=>__ng().ctx.help.answer.replace(/^(a|an) /,''));
  const keysOf=()=>pg.locator('#play .choice[data-k]').evaluateAll(bs=>bs.map(b=>b.dataset.k));
  const tap=async k=>{await pg.locator(`#play .choice[data-k="${k}"]`).click();await pg.waitForTimeout(150)};
  const seen={odd:0,with:0,ana:0};
  const playOne=async(lv,k)=>{await go(pg,'belongs',lv,'reason');const before=await stars(pg);const name=`belongs lv${lv} #${k}`;const prompt=await pg.locator('#prompt').innerText();
    const kind=/NOT belong/.test(prompt)?'odd':/goes with these/.test(prompt)?'with':'ana';seen[kind]++;
    if(lv===1&&kind==='ana')errs.push(`${name}: an analogy at level 1`);if(lv===2&&kind!=='ana')errs.push(`${name}: not an analogy at level 2`);
    if(kind==='ana'){if(!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first rule card`);await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push(`${name}: a think-first card on a group question`);
    const ans=await word();const pick=await pg.evaluate(()=>__ng().ctx.help.pick);const keys=await keysOf();
    if(keys.length!==4)errs.push(`${name}: ${keys.length} choices`);if(keys[pick]!==ans)errs.push(`${name}: pick ${pick} is ${keys[pick]}, answer ${ans}`);
    if(new Set(keys).size!==4)errs.push(`${name}: a repeated choice: ${keys}`);
    const words=await pg.locator('#play .btile small').allInnerTexts();if(words.filter(w=>w!=='?').some(w=>!/^[a-z ]+$/.test(w)))errs.push(`${name}: a tile without its word`);
    if(k%2){const wrong=keys[(pick+1)%4];await tap(wrong);const m=await msg(pg);if(!m.length)errs.push(`${name}: no hint on a wrong picture`);
      if(kind==='ana'&&!/We want|has nothing to do with/.test(m))errs.push(`${name}: the hint does not name the relationship: "${m}"`);if(kind!=='ana'&&!/is (a|an|something|clothes)/.test(m))errs.push(`${name}: the hint does not name the kind: "${m}"`)}
    await tap(ans);
    if(lv===3){if(!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg)}else if(await pg.locator('#stage .gate:not(.how)').count())errs.push(`${name}: a gate below level 3`);
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!await pg.locator('#stage .note').count())errs.push(`${name}: the rule card was not shown after the win`);
    const b=await book(pg);if(!/knew that .* the way|spotted the .* that did not belong|found one more of the/.test(b))errs.push(`${name}: book line "${b}"`)};
  for(let k=0;k<8;k++)await playOne(1,k);
  for(let k=0;k<8;k++)await playOne(2,k);
  for(let k=0;k<10;k++)await playOne(3,k);
  if(!seen.odd||!seen.with)errs.push(`belongs lv1: never met both kinds (odd ${seen.odd}, with ${seen.with})`);
  /* Show me fills the blank and reads the rule, at each level */
  for(const lv of[1,2,3]){await go(pg,'belongs',lv,'reason');await guess(pg);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);const m=await msg(pg);if(!/^It's /.test(m))errs.push(`belongs lv${lv}: Show me said "${m}"`);if(!await pg.locator('#stage .note').count())errs.push(`belongs lv${lv}: Show me did not show the rule card`);if(!await pg.locator('#play .choice.hit').count())errs.push(`belongs lv${lv}: Show me did not light the right picture`)}
  /* the lesson at each level runs to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['belongs','belongs','belongs','belongs','belongs'],i:0,lit:[0,0,0,0,0]};s.skill='belongs';s.m.belongs={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`belongs lv${lv}: no lesson before the first problem`);const said=await pg.locator('#stage .narr .bubble').innerText();if(!said.length)errs.push(`belongs lv${lv}: Pip said nothing in the lesson`);
    if(lv===1&&!/shoe/.test(said))errs.push(`belongs lv1: the lesson has no shoe among the fruit`);if(lv===2&&!/connection|nest/.test(said))errs.push(`belongs lv2: the lesson does not ask for the connection`);
    if(await pg.locator('#stage .btile').count()<3)errs.push(`belongs lv${lv}: the lesson shows no pictures`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#play .choice[data-k], #stage .guess').count())errs.push(`belongs lv${lv}: My turn did not start the problem`)}
  console.log('belongs played:',JSON.stringify(seen));done('solve-belongs',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
