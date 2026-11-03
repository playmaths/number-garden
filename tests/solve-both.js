// plays Both sides at every level: takes bags then ones off both sides until a bag is alone, types its weight (clean, and after a wrong guess), and Show me; also checks a lesson waits for Next
const {open,go,stars,msg,done,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  for(let lv=1;lv<=3;lv++)for(const mode of ['clean','miss','show']){await go(pg,'both',lv,'puz');const before=await stars(pg);const name=`both lv${lv} ${mode}`;const w=await pg.evaluate(()=>__ng().ctx.help.answer);
    const bags=await pg.locator('#stage svg path[fill="var(--plum)"]').count();if(bags<1)errs.push(`${name}: no bags drawn`);if(lv>1&&bags<3)errs.push(`${name}: level ${lv} should have bags on both sides`);
    if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(1800);const left=await pg.locator('#stage svg path[fill="var(--plum)"]').count();if(left!==1)errs.push(`${name}: ${left} bags left after Show me`);continue}
    const bagBtn=pg.getByRole('button',{name:'Take a bag off both'}),oneBtn=pg.getByRole('button',{name:'Take 1 off both'});
    for(let k=0;k<6&&!(await bagBtn.isDisabled());k++)await bagBtn.click();for(let k=0;k<14&&!(await oneBtn.isDisabled());k++)await oneBtn.click();await pg.waitForTimeout(100);
    if(!/stands alone/.test(await msg(pg)))errs.push(`${name}: bag not alone: "${await msg(pg)}"`);if(!await pg.locator('#controls .num').count()){errs.push(`${name}: no numpad`);continue}
    if(mode==='miss'){await type(w+1);if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}await type(w);await gate(pg);
    const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s} ("${await msg(pg)}")`)}
  /* a lesson pauses for a tap: the Next button appears and the bubble does not move on until it is tapped */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'puz',steps:['both','both','both','both','both'],i:0,lit:[0,0,0,0,0]};s.skill='both';s.m.both={lv:2,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pg.waitForTimeout(900);
  const nx=pg.getByRole('button',{name:'Next ▶'});if(!await nx.isVisible())errs.push('lesson: no Next button after the first pause');const t1=await pg.locator('#stage .bubble').innerText();await pg.waitForTimeout(2500);if((await pg.locator('#stage .bubble').innerText())!==t1)errs.push('lesson moved on without a tap');
  await nx.click();await pg.waitForTimeout(900);await nx.click();await pg.waitForTimeout(900);await nx.click();await pg.waitForTimeout(300);if(!/Now you try/.test(await pg.locator('#stage .bubble').innerText()))errs.push('lesson did not reach the end after three taps: "'+await pg.locator('#stage .bubble').innerText()+'"');
  await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(200);if(!await pg.getByRole('button',{name:'Take a bag off both'}).count())errs.push('My turn did not start the problem');
  console.log('both played');done('solve-both',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
