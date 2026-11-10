// Listen and solve at every level: the story in ctx.story and ctx.steps (never read through speech), its answer following from the steps, no story text on screen before the answer when Pip can talk and the text with a note when she cannot, the big Hear it again button and the replay count in the book line, the build at level 1 (tray pictures tapped into the place and onto the side, a wrong build retold step by step, Done, then the pad), the think-first card at level 2, the why or another-way gate at level 3, the trap story's unused number refused with its reason, Show me acting the story out, and the lesson at each level
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const read=()=>pg.evaluate(()=>{const c=__ng().ctx;return{story:c.story,steps:c.steps,answer:c.answer,kind:c.kind,want:c.want,spoken:c.spoken,trap:c.trap,start:c.start,replays:c.replays,phase:c.phase,noun:c.noun}});
  const calc=steps=>{let c=0;steps.forEach(s=>{if(s.add)c+=s.add[1];else if(s.take)c-=s.take});return c};
  const idle=()=>pg.waitForFunction(()=>{const c=__ng().ctx;return c&&!c.busy},null,{timeout:8000}).catch(()=>errs.push('busy never cleared'));
  const stageText=()=>pg.locator('#stage').innerText();const line=()=>pg.evaluate(()=>{const b=JSON.parse(localStorage.getItem('ng2')).book;return (b.find(e=>/listened to a story/.test(e.t))||{}).t||''}); // the newest story line, past a badge page
  const tapNum=async n=>{await pg.locator(`#controls .pad .num:not([disabled])`,{hasText:new RegExp(`^${n}$`)}).first().click();await pg.waitForTimeout(60)};
  const tray=k=>pg.locator(`#controls .htray .hpic[data-k="${k}"]`);
  const build=async(want,extra)=>{for(const [k,n] of Object.entries(want.place))for(let i=0;i<n;i++)await tray(k).click();
    for(const [k,n] of Object.entries(want.side)){for(let i=0;i<n;i++)await tray(k).click();for(let i=0;i<n;i++)await pg.locator('#stage .hzone[data-zone="place"] .hpic').last().click()}
    if(extra){const k=Object.keys(want.place)[0]||Object.keys(want.side)[0];await tray(k).click()}await pg.waitForTimeout(40)};
  const seen={};let replayed=0;
  const playOne=async(lv,k)=>{await go(pg,'hear',lv,'story');const before=await stars(pg);const name=`hear lv${lv} #${k}`;const c=await read();seen[c.kind]=(seen[c.kind]||0)+1;
    if(!c.story||c.story.length<20)errs.push(`${name}: no story in ctx.story`);if(!c.steps||c.steps.length<2)errs.push(`${name}: ${c.steps&&c.steps.length} steps`);
    if(calc(c.steps)!==c.answer)errs.push(`${name}: the steps make ${calc(c.steps)}, answer ${c.answer}`);if(c.answer<0||c.answer>(lv===1?10:12))errs.push(`${name}: answer ${c.answer} out of range`);
    if(lv===1&&!/^(join|take|two)$/.test(c.kind))errs.push(`${name}: kind ${c.kind}`);if(lv===2&&c.kind!=='chain')errs.push(`${name}: kind ${c.kind}`);if(lv===3&&!/^(do|trap)$/.test(c.kind))errs.push(`${name}: kind ${c.kind}`);
    if(c.kind==='trap'){if(c.trap==null)errs.push(`${name}: a trap story with no trap sum`);if(!c.steps.some(s=>s.extra))errs.push(`${name}: a trap story with no extra number`)}
    if(lv===1&&!/Then build/.test(await pg.locator('#prompt').innerText()))errs.push(`${name}: prompt "${await pg.locator('#prompt').innerText()}"`);
    const first=c.story.split('.')[0];const st=await stageText();
    if(c.spoken){if(st.includes(first))errs.push(`${name}: the story is on screen before the answer: "${st.slice(0,80)}"`)}else{if(!st.includes(first)||!/Pip cannot talk/.test(st))errs.push(`${name}: Pip cannot talk but the words or the note are missing: "${st.slice(0,120)}"`)}
    const hb=pg.getByRole('button',{name:'Hear it again'});if(await hb.count()!==1)errs.push(`${name}: ${await hb.count()} Hear it again buttons`);
    if(k%3===0){await hb.click();await hb.click();await pg.waitForTimeout(40);if((await read()).replays!==2)errs.push(`${name}: replays ${(await read()).replays} after two taps`)}
    if(lv===2){const g=pg.locator('#stage .guess');if(!await g.count())errs.push(`${name}: no think-first card`);else{const q=await g.innerText();if(!/more or fewer/.test(q))errs.push(`${name}: think-first asks "${q}"`);const r=await g.locator('.choice[data-right="1"]').innerText();const rel=c.answer>c.start?'more':c.answer<c.start?'fewer':'the same';if(r!==rel)errs.push(`${name}: right guess ${r}, start ${c.start} end ${c.answer}`)}await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push(`${name}: a think-first card at level ${lv}`);
    if(lv===1){if(!await pg.locator('#controls .htray .hpic').count())errs.push(`${name}: no tray`);if(!await pg.locator('#stage .hzone[data-zone="place"]').count())errs.push(`${name}: no place zone`);
      const dn=pg.getByRole('button',{name:'Done'});await dn.click();await pg.waitForTimeout(40);if((await read()).phase!=='build')errs.push(`${name}: Done with nothing placed moved on`);
      if(k%2){await build(c.want,true);await dn.click();await pg.waitForTimeout(40);const m=await msg(pg);if(!/The story had \d+ /.test(m))errs.push(`${name}: wrong build hinted "${m}"`);await idle();if(await pg.locator('#stage .hzone .hpic').count())errs.push(`${name}: the retold scene was not cleared for the rebuild`);if((await read()).phase!=='build')errs.push(`${name}: a wrong build moved on`)}
      await build(c.want);await dn.click();await pg.waitForTimeout(60);if((await read()).phase!=='count')errs.push(`${name}: a right build not accepted ("${await msg(pg)}")`);if(!await pg.locator('#controls .pad').count())errs.push(`${name}: no pad after the build`);
      if(!/How many/.test(await pg.locator('#prompt').innerText()))errs.push(`${name}: no question after the build`)}
    else if(!await pg.locator('#controls .pad').count())errs.push(`${name}: no pad`);
    if(k%2){const wrong=c.kind==='trap'&&c.trap<=12&&c.trap!==c.answer?c.trap:c.answer<(lv===1?10:12)?c.answer+1:c.answer-1;await tapNum(wrong);const m=await msg(pg);if(!m.length)errs.push(`${name}: no hint on a wrong number`);
      if(wrong===c.trap&&!m.includes(String(c.trap)))errs.push(`${name}: the trap number ${c.trap} is not named in "${m}"`);if(!await pg.locator('#stage .story:visible').count())errs.push(`${name}: the story text is not shown after an answer`);await idle();
      if(lv===1){const m2=await msg(pg);if(!/How many/.test(m2))errs.push(`${name}: after the retelling Pip said "${m2}"`)}
      if(!await pg.locator('#stage .hzone .hpic').count())errs.push(`${name}: no pictures acted out after a wrong number`);
      const max=lv===1?10:12;await tapNum([c.answer-1,c.answer+1,c.answer-2,c.answer+2].find(x=>x>=0&&x<=max&&x!==wrong));const m3=await msg(pg);if(!/How many is that/.test(m3))errs.push(`${name}: second hint "${m3}"`)}
    await tapNum(c.answer);
    if(lv===3){if(!await pg.locator('#stage .gate').count())errs.push(`${name}: no why or another-way gate`);await gate(pg)}else if(await pg.locator('#stage .gate:not(.how)').count())errs.push(`${name}: a gate below level 3`);
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);
    if(!await pg.locator('#stage .story:visible').count())errs.push(`${name}: the story text is not shown after the win`);const shown=await pg.locator('#stage .story').innerText();if(shown!==c.story)errs.push(`${name}: the shown text "${shown}" is not the story`);
    await idle();const pics=await pg.locator('#stage .hzone[data-zone="place"] .hpic').count();if(pics!==c.answer)errs.push(`${name}: ${pics} pictures in the place after the win, answer ${c.answer}`);
    const b=await line();if(!/listened to a story/.test(b)||!b.includes(`found ${c.answer} ${c.noun}`))errs.push(`${name}: book line "${b}"`);
    if(k%3===0){if(!/after hearing it three times/.test(b))errs.push(`${name}: the replays are not in the book line "${b}"`);replayed++}else if(/after hearing/.test(b))errs.push(`${name}: replays in the book line without a replay "${b}"`)};
  for(let k=0;k<12;k++)await playOne(1,k);
  for(let k=0;k<10;k++)await playOne(2,k);
  for(let k=0;k<12;k++)await playOne(3,k);
  for(const kind of['join','take','two','chain','do','trap'])if(!seen[kind])errs.push(`hear: never met a ${kind} story (${JSON.stringify(seen)})`);
  if(!replayed)errs.push('hear: no replay was checked');
  if(!await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book.some(e=>/Good Listener badge/.test(e.t))))errs.push('hear: no Good Listener badge after ten stories');
  /* a Pip who cannot talk shows her words with a note; the game still plays */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.speech=false;localStorage.setItem('ng2',JSON.stringify(s))});await go(pg,'hear',2,'story');
  {const c=await read();const st=await stageText();if(c.spoken)errs.push('hear: spoken with speech off');if(!/Pip cannot talk on this device/.test(st))errs.push(`hear: no note with speech off: "${st.slice(0,100)}"`);if(!st.includes(c.story.split('.')[0]))errs.push('hear: no story text with speech off');
    if(await pg.getByRole('button',{name:'Hear it again'}).count()!==1)errs.push('hear: no Hear it again button with speech off');await guess(pg);await tapNum(c.answer);await idle();if(!/listened to a story/.test(await line()))errs.push('hear: no win with speech off')}
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));delete s.speech;localStorage.setItem('ng2',JSON.stringify(s))});
  /* with a voice on the device (a pretend one here: headless Chromium has none) the story stays off the screen until the answer, then appears */
  {const pg2=await br.newPage({viewport:{width:420,height:860}});await pg2.addInitScript(()=>{window.__NG_FAST=true;try{speechSynthesis.getVoices=()=>[{name:'Pretend',lang:'en-US',voiceURI:'pretend',localService:true}]}catch(e){}});pg2.on('pageerror',e=>errs.push('PAGEERROR (voice) '+e.message));
    await pg2.goto(require('./lib').URL);await pg2.evaluate(()=>localStorage.clear());await go(pg2,'hear',2,'story');const c=await pg2.evaluate(()=>{const c=__ng().ctx;return{story:c.story,spoken:c.spoken,answer:c.answer}});const st=await pg2.locator('#stage').innerText();
    if(!c.spoken)errs.push('hear (voice): not spoken with a voice present');if(st.includes(c.story.split('.')[0]))errs.push(`hear (voice): the story is on screen before the answer: "${st.slice(0,80)}"`);if(/Pip cannot talk/.test(st))errs.push('hear (voice): the cannot-talk note with a voice present');
    if(await pg2.locator('#stage .story:visible').count())errs.push('hear (voice): the story box is visible before the answer');await guess(pg2);await pg2.locator('#controls .pad .num',{hasText:new RegExp(`^${c.answer}$`)}).first().click();await pg2.waitForTimeout(80);
    if(!await pg2.locator('#stage .story:visible').count())errs.push('hear (voice): the story is not shown after the answer');await pg2.close()}
  /* Show me shows the words and acts the story out, at each level */
  for(const lv of[1,2,3]){await go(pg,'hear',lv,'story');const c=await read();await guess(pg);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);const m=await msg(pg);if(!/^It's /.test(m))errs.push(`hear lv${lv}: Show me said "${m}"`);
    if(!await pg.locator('#stage .story:visible').count())errs.push(`hear lv${lv}: Show me did not show the words`);await pause(pg,4000);const pics=await pg.locator('#stage .hzone[data-zone="place"] .hpic').count();if(pics!==c.answer)errs.push(`hear lv${lv}: Show me left ${pics} pictures in the place, answer ${c.answer}`)
    await pg.screenshot({path:require('path').join(require('os').tmpdir(),`ng-hear-lv${lv}.png`)})}
  /* the lesson at each level: Pip invites her to close her eyes, tells a story, retells it with pictures, and runs to My turn */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'story',steps:['hear','hear','hear','hear','hear'],i:0,lit:[0,0,0,0,0]};s.skill='hear';s.m.hear={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pause(pg,300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`hear lv${lv}: no lesson before the first problem`);const said=await pg.locator('#stage .narr .bubble').first().innerText();if(!/Close your eyes/.test(said))errs.push(`hear lv${lv}: the lesson opens with "${said}"`);
    for(let i=0;i<4;i++){const nx=pg.getByRole('button',{name:'Next ▶'});if(await nx.isVisible().catch(()=>false)){await nx.click();await pause(pg,400)}}await pause(pg,3000);
    if(!await pg.locator('#stage .lesson .hzone .hpic').count())errs.push(`hear lv${lv}: the lesson never showed the pictures`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .pad, #controls .htray, #stage .guess').count())errs.push(`hear lv${lv}: My turn did not start the problem`)}
  console.log('hear played:',JSON.stringify(seen));done('solve-hear',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
