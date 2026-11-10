// Pip says at every level: the sentence in Pip's bubble with a dashed gap and a Read it to me button, four pictures with exactly one right (help.pick names it), a wrong picture hinted with the picked word in the hint, the think-first card at level 2 (a thing, a place or an action), the why or another-way gate at level 3, two-clue riddles and honest number sentences, Show me filling the gap and lighting the picture, and the lesson at each level
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const W=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];const word=async()=>{const a=await pg.evaluate(()=>__ng().ctx.help.answer.replace(/^(a|an|the) /,''));return W.includes(a)?String(W.indexOf(a)):a};
  const keysOf=()=>pg.locator('#play .choice[data-k]').evaluateAll(bs=>bs.map(b=>b.dataset.k));
  const tap=async k=>{await pg.locator(`#play .choice[data-k="${k}"]`).click();await pg.waitForTimeout(150)};
  const seen={};
  const playOne=async(lv,k)=>{await go(pg,'listen',lv,'reason');const before=await stars(pg);const name=`listen lv${lv} #${k}`;
    const c=await pg.evaluate(()=>{const c=__ng().ctx;return{s:c.sentence,kind:c.kind,choices:c.choices,pick:c.help.pick,answer:c.help.answer}});seen[c.kind]=(seen[c.kind]||0)+1;
    if(!/___/.test(c.s||''))errs.push(`${name}: no gap in the sentence "${c.s}"`);
    if(!await pg.locator('#stage .bubble .lgap').count())errs.push(`${name}: no gap drawn in Pip's bubble`);
    const bub=await pg.locator('#stage .bubble').innerText();if(!bub.replace(/hmm/,'').trim().length)errs.push(`${name}: the bubble is empty`);
    if(!await pg.locator('#stage .readbtn').count())errs.push(`${name}: no Read it to me button`);
    if(lv===1&&!/^(mean|cat)$/.test(c.kind))errs.push(`${name}: kind ${c.kind} at level 1`);if(lv===2&&!/^(pos|cmp|seq|cause)$/.test(c.kind))errs.push(`${name}: kind ${c.kind} at level 2`);if(lv===3&&!/^(clue|num)$/.test(c.kind))errs.push(`${name}: kind ${c.kind} at level 3`);
    if(lv===2){if(!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);const q=await pg.locator('#stage .guess').innerText().catch(()=>'');if(!/thing/.test(q))errs.push(`${name}: the think-first card does not ask what kind of word: "${q}"`);await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push(`${name}: a think-first card at level ${lv}`);
    const ans=await word();const keys=await keysOf();
    if(keys.length!==4)errs.push(`${name}: ${keys.length} choices`);if(keys[c.pick]!==ans)errs.push(`${name}: pick ${c.pick} is ${keys[c.pick]}, answer ${ans}`);
    if(new Set(keys).size!==4)errs.push(`${name}: a repeated choice: ${keys}`);if(keys.join()!==c.choices.join())errs.push(`${name}: ctx.choices ${c.choices} differ from the tiles ${keys}`);
    if(keys.filter(x=>x===ans).length!==1)errs.push(`${name}: ${keys.filter(x=>x===ans).length} choices equal the answer`);
    const words=await pg.locator('#play .btile small').allInnerTexts();if(words.some(w=>!/^[a-z ]+$/.test(w)))errs.push(`${name}: a tile without its word: ${words}`);
    if(c.kind==='num'){const m=c.s.match(/^(\w+) \w+,? and (\w+)/);const W=['no','one','two','three','four','five','six','seven','eight','nine','ten'];const a=W.indexOf(m[1].toLowerCase()),b=W.indexOf(m[2]);const want=/eaten/.test(c.s)?a-b:a+b;if(String(want)!==ans)errs.push(`${name}: "${c.s}" wants ${want}, answer ${ans}`)}
    if(k%2){const wrong=keys[(c.pick+1)%4];await tap(wrong);const m=await msg(pg);if(!m.length)errs.push(`${name}: no hint on a wrong picture`);
      const w=/^\d+$/.test(wrong)?['no','one','two','three','four','five','six','seven','eight','nine','ten'][+wrong]:wrong;if(!m.toLowerCase().includes(w))errs.push(`${name}: the hint does not name the picked word ${wrong}: "${m}"`);
      if(c.kind!=='num'&&c.kind!=='pos'&&!/hmm/.test(m))errs.push(`${name}: the hint does not re-read the sentence with the gap: "${m}"`)}
    await tap(ans);
    if(lv===3){if(!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg)}else if(await pg.locator('#stage .gate:not(.how)').count())errs.push(`${name}: a gate below level 3`);
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(await pg.locator('#controls .choice.hit').count()!==1)errs.push(`${name}: ${await pg.locator('#controls .choice.hit').count()} pictures lit after the win`);
    const aw=/^\d+$/.test(ans)?W[+ans]:ans;const filled=await pg.locator('#stage .bubble').innerText();if(/hmm/.test(filled)||!filled.toLowerCase().includes(aw))errs.push(`${name}: the bubble after the win is "${filled}", answer ${ans}`);
    const b=await book(pg);if(!/finished Pip's (number )?sentence: |solved Pip's riddle: /.test(b))errs.push(`${name}: book line "${b}"`)};
  for(let k=0;k<10;k++)await playOne(1,k);
  for(let k=0;k<12;k++)await playOne(2,k);
  for(let k=0;k<12;k++)await playOne(3,k);
  for(const kind of['mean','cat','pos','cmp','seq','cause','clue','num'])if(!seen[kind])errs.push(`listen: never met a ${kind} sentence (${JSON.stringify(seen)})`);
  /* Show me fills the gap, lights the picture and reads the answer, at each level */
  for(const lv of[1,2,3]){await go(pg,'listen',lv,'reason');await guess(pg);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);const m=await msg(pg);if(!/^It's /.test(m))errs.push(`listen lv${lv}: Show me said "${m}"`);if(await pg.locator('#controls .choice.hit').count()!==1)errs.push(`listen lv${lv}: Show me did not light one picture`);if(await pg.locator('#stage .bubble .lgap').count())errs.push(`listen lv${lv}: Show me left the gap open`)}
  /* the lesson at each level runs to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['listen','listen','listen','listen','listen'],i:0,lit:[0,0,0,0,0]};s.skill='listen';s.m.listen={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pause(pg,300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`listen lv${lv}: no lesson before the first problem`);const said=await pg.locator('#stage .narr .bubble').first().innerText();if(!said.length)errs.push(`listen lv${lv}: Pip said nothing in the lesson`);
    if(!await pg.locator('#stage .lesson .lgap').count())errs.push(`listen lv${lv}: the lesson shows no sentence with a gap`);
    if(lv===1&&!/gap/.test(said))errs.push(`listen lv1: the lesson does not name the gap`);if(lv===2&&!/where/.test(said))errs.push(`listen lv2: the lesson is not about where`);if(lv===3&&!/two/.test(said))errs.push(`listen lv3: the lesson is not about two clues`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#play .choice[data-k], #stage .guess').count())errs.push(`listen lv${lv}: My turn did not start the problem`)}
  console.log('listen played:',JSON.stringify(seen));done('solve-listen',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
