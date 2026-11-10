// Three of a kind at every level: the three given figures share ctx.rule and no other attribute, the answer at help.pick keeps the rule and no wrong choice does (at level 3 each breaks exactly one of the two rules),
// played clean and with a miss first (the hint names what the pick shares with one figure, or at level 3 the rule it keeps and the one it breaks), the think-first card at level 2, the why or another-way gate at level 3, Show me, and the lesson at each level
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
const KEYS=['shape','col','size','count','fill'];
(async()=>{const {br,pg,errs}=await open();
  const read=()=>pg.evaluate(()=>{const c=__ng().ctx;return{rule:c.rule,given:c.given,choices:c.choices,pick:c.help.pick,answer:c.help.answer,hasGuess:!!c.help.guess,hasGate:!!(c.help.reasons||c.help.ways)}});
  const seenRule=new Set();
  for(const [lv,goes] of [[1,8],[2,8],[3,10]])for(let k=0;k<goes;k++){await go(pg,'alike',lv,'reason');const before=await stars(pg);const name=`alike lv${lv} #${k}`;const p=await read();
    const ra=Object.keys(p.rule);if(ra.length!==(lv===3?2:1))errs.push(`${name}: ${ra.length} rules (${ra})`);ra.forEach(a=>seenRule.add(lv+':'+a));
    if(lv===1&&!ra.every(a=>a==='shape'||a==='col'))errs.push(`${name}: level 1 rule on ${ra}`);if(lv===2&&!ra.every(a=>['count','fill','size'].includes(a)))errs.push(`${name}: level 2 rule on ${ra}`);
    const keeps=f=>ra.every(a=>f[a]===p.rule[a]);
    if(!p.given||p.given.length!==3)errs.push(`${name}: ${p.given&&p.given.length} given figures`);if(!p.given.every(keeps))errs.push(`${name}: a given figure breaks the rule ${JSON.stringify(p.rule)}: ${JSON.stringify(p.given)}`);
    KEYS.filter(x=>!ra.includes(x)).forEach(x=>{if(p.given.every(f=>f[x]===p.given[0][x]))errs.push(`${name}: all three share ${x} which is not the rule`)});
    if(p.choices.length!==(lv===1?4:5))errs.push(`${name}: ${p.choices.length} choices`);if(!keeps(p.choices[p.pick]))errs.push(`${name}: help.pick does not keep the rule`);
    p.choices.forEach((f,i)=>{if(i===p.pick)return;if(keeps(f))errs.push(`${name}: wrong choice ${i} keeps the rule`);if(lv===3&&ra.filter(a=>f[a]===p.rule[a]).length!==1)errs.push(`${name}: wrong choice ${i} does not keep exactly one rule: ${JSON.stringify(f)}`);
      if(lv<3&&!KEYS.some(x=>!ra.includes(x)&&p.given.some(g=>g[x]===f[x])))errs.push(`${name}: wrong choice ${i} looks like none of the three`)});
    if(!/^the /.test(p.answer))errs.push(`${name}: help.answer "${p.answer}"`);
    if(await pg.locator('#stage .alc').count()!==4||await pg.locator('#stage .alq').innerText()!=='?')errs.push(`${name}: the row is not three figures and a ?`);
    if(lv===2){if(!p.hasGuess||!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card`);await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push(`${name}: a think-first card at level ${lv}`);
    const btn=i=>pg.locator(`#controls .choice[data-i="${i}"]`);const n=p.choices.length;
    if(k%2){const w=(p.pick+1+k%3)%n;await btn(w).click();await pg.waitForTimeout(120);const m=await msg(pg);if(!/^That one is /.test(m))errs.push(`${name}: the hint does not name the pick: "${m}"`);
      if(!(lv===3?/ like all three, but it is .*, and the rule is /:/ like the (first|second|third), but the rule is all /).test(m))errs.push(`${name}: hint "${m}"`);
      if(k%4===3){const w2=[...Array(n).keys()].find(i=>i!==p.pick&&i!==w);await btn(w2).click();await pg.waitForTimeout(120);if(!/^Look for what all three share: all /.test(await msg(pg)))errs.push(`${name}: second hint "${await msg(pg)}"`)}}
    await btn(p.pick).click();await pg.waitForTimeout(150);if(lv===3&&(!p.hasGate||!await pg.locator('#stage .gate').count()))errs.push(`${name}: no why or another-way gate`);if(lv<3&&p.hasGate)errs.push(`${name}: a why gate declared at level ${lv}`);await gate(pg); /* levels 1 and 2 have no gate of their own, but the engine's How did you know? card can appear on a win */
    if((await stars(pg))!==before+1)errs.push(`${name}: no star ("${await msg(pg)}")`);if(!/found the rule, all .*, and the fourth one that fits\.?$/.test(await book(pg)))errs.push(`${name}: book line "${await book(pg)}"`);
    await pause(pg,2400);if(!await pg.locator('#stage .alq').count()&&!await pg.locator('#stage .alc:nth-child(4) svg').count())errs.push(`${name}: the answer was not dropped into the ?`)}
  if(seenRule.size<8)errs.push(`rules seen only: ${[...seenRule]}`);
  /* Show me names the rule, highlights it on the three, then fills the ? and reads the answer */
  await go(pg,'alike',1,'reason');await pg.getByRole('button',{name:'Show me'}).click();if(!/^Same: all /.test(await pg.locator('#stage .hint').innerText()))errs.push('alike lv1: Show me did not name the rule');
  if(!/^It's the .*\. All three are .*, and so is the /.test(await msg(pg)))errs.push(`alike lv1: Show me said "${await msg(pg)}"`);await pg.locator('#stage .alc:nth-child(4) svg').waitFor({timeout:5000}).catch(()=>{});if(!await pg.locator('#stage .alc:nth-child(4) svg').count())errs.push('alike lv1: Show me did not fill the ?');
  const lit=await pg.locator('#stage .alc:nth-child(-n+3) svg').evaluateAll(ss=>ss.filter(s=>/var\(--sun\)|stroke-dasharray|<text/.test(s.outerHTML)).length);if(lit!==3)errs.push(`alike lv1: Show me highlighted ${lit} of the three`);
  await go(pg,'alike',3,'reason');await pg.getByRole('button',{name:'Show me'}).click();await pg.locator('#stage .alc:nth-child(4) svg').waitFor({timeout:5000}).catch(()=>{});if(!/^All three are .* and .*\. So is this one: the /.test(await pg.locator('#stage .hint').innerText()))errs.push(`alike lv3: Show me ended with "${await pg.locator('#stage .hint').innerText()}"`);
  /* the lesson at each level: Pip names what is different, then the rule, then tries two choices against it, to its My turn button */
  for(const lv of[1,2,3]){await pg.evaluate(([lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={};s.trail={door:'reason',steps:['alike','alike','alike','alike','alike'],i:0,lit:[0,0,0,0,0]};s.skill='alike';s.m.alike={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[lv]);await pg.reload();await pg.waitForTimeout(300);
    if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push(`alike lv${lv}: no lesson before the first problem`);if(!/the rule/.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`alike lv${lv}: Pip did not speak of the rule`);if(await pg.locator('#stage .alrow .alc').count()!==4)errs.push(`alike lv${lv}: no row in the lesson`);
    await pg.getByRole('button',{name:'Next ▶'}).click();await pause(pg,400);if(!/All different, so .* is not the rule/.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`alike lv${lv}: the second line does not dismiss a difference: "${await pg.locator('#stage .narr .bubble').innerText()}"`);
    for(let i=0;i<5;i++){const b=pg.getByRole('button',{name:'Next ▶'});if(!await b.count())break;await b.click();await pause(pg,400)}
    if(!/Now you try/.test(await pg.locator('#stage .narr .bubble').innerText()))errs.push(`alike lv${lv}: the lesson did not reach its end: "${await pg.locator('#stage .narr .bubble').innerText()}"`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice, #stage .guess').count())errs.push(`alike lv${lv}: My turn did not start the problem`)}
  done('solve-alike',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
