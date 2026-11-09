// Shape detective at every level: Pip's riddle among four turned shapes, the corner counter with the why gate, the odd one out, the square that is a rectangle too, and the think-first count; each clean and with a miss first
const {open,go,stars,msg,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const H=()=>pg.evaluate(()=>{const h=__ng().ctx.help;return{answer:h.answer,pick:h.pick,v:h.guess?'guess':h.pick!=null?(h.reasons?'odd':'pick'):'count',yesno:!!h.reasons&&h.pick!=null&&/^Why is (a square a rectangle|it not a square)/.test(h.reasons.q)}});
  const tapCorners=async n=>{const cs=pg.locator('#stage .corner');const k=await cs.count();if(k!==n)errs.push(`shapes: ${k} corner targets for a ${n}-sided shape`);for(let i=0;i<k;i++)await cs.nth(i).click();const cap=await pg.locator('#stage .counted').innerText();if(!cap.startsWith(`${n} corners`))errs.push(`shapes: caption after tapping every corner: "${cap}"`)};
  const padTap=async v=>{await pg.locator('#controls .num',{hasText:new RegExp('^'+v+'$')}).first().click();await pg.waitForTimeout(80)};
  const pickChoice=async(idx,missFirst)=>{const ch=pg.locator('#controls .choice');const n=await ch.count();if(missFirst){await ch.nth((idx+1)%n).click();if(!(await msg(pg)).length)errs.push('shapes: no hint after a wrong pick')}await ch.nth(idx).click();await pg.waitForTimeout(80)};
  /* level 1: the riddle */
  for(let k=0;k<4;k++){await go(pg,'shapes',1,'space');const before=await stars(pg);const h=await H();if(await pg.locator('#controls .choice svg').count()!==4)errs.push('shapes lv1: not four drawn shapes');if(typeof h.pick!=='number')errs.push('shapes lv1: no pick index in help');
    await pickChoice(h.pick,k%2===1);if((await stars(pg))!==before+1)errs.push(`shapes lv1 #${k}: no star ("${await msg(pg)}")`);if(!await pg.locator('#controls .choice.hit circle').count()&&!/circle/.test(await msg(pg)))errs.push('shapes lv1: corners not marked on the winning shape')}
  /* level 2: tap the corners, give the sides, say why */
  for(let k=0;k<4;k++){await go(pg,'shapes',2,'space');const before=await stars(pg);const n=(await H()).answer;if(!(n>=3&&n<=6))errs.push(`shapes lv2: odd answer ${n}`);await tapCorners(n);
    if(k%2){await padTap(n===6?5:n+1);if(!(await msg(pg)).length)errs.push('shapes lv2: no hint on a wrong count')}await padTap(n);if(!await pg.locator('#stage .gate').count())errs.push('shapes lv2: no why gate');
    if(k===0){const wrong=pg.locator('#stage .gate .choice:not([data-right])').first();await wrong.click();await pg.waitForTimeout(100);const m=await msg(pg);if(!/colour|turn/i.test(m))errs.push(`shapes lv2: wrong reason not corrected: "${m}"`)}
    await gate(pg);if((await stars(pg))!==before+1)errs.push(`shapes lv2 #${k}: no star ("${await msg(pg)}")`);if(await pg.locator('#stage .cornerbox svg text').count()!==n)errs.push('shapes lv2: sides not numbered after the win')}
  /* level 3: whichever kind comes up, until each has been seen clean and with a miss */
  const seen={odd:0,yesno:0,guess:0};for(let k=0;k<30&&Object.values(seen).some(v=>v<2);k++){await go(pg,'shapes',3,'space');const before=await stars(pg);const h=await H();const kind=h.v==='guess'?'guess':h.yesno?'yesno':'odd';const missFirst=seen[kind]===1;seen[kind]++;
    if(kind==='guess'){if(!await pg.locator('#stage .guess').count())errs.push('shapes lv3: no think-first card');await guess(pg);const n=h.answer;await tapCorners(n);if(missFirst)await padTap(n-1);await padTap(n)}
    else{if(kind==='yesno'&&await pg.locator('#controls .choice').count()!==2)errs.push('shapes lv3: yes/no without two choices');await pickChoice(h.pick,missFirst)}
    if(!await pg.locator('#stage .gate').count())errs.push(`shapes lv3 ${kind}: no why gate`);await gate(pg);if((await stars(pg))!==before+1)errs.push(`shapes lv3 ${kind} #${seen[kind]}: no star ("${await msg(pg)}")`)}
  if(Object.values(seen).some(v=>v<2))errs.push('shapes lv3: not every kind came up twice in thirty goes: '+JSON.stringify(seen));
  /* Show me on each level */
  for(const lv of[1,2,3]){await go(pg,'shapes',lv,'space');await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(150);const m=await msg(pg);if(!m.length)errs.push(`shapes lv${lv}: Show me said nothing`);if(/It's \d+\. .*one|It's the \d/.test(m))errs.push(`shapes lv${lv}: Show me reads an index: "${m}"`)}
  console.log('shape detective played',JSON.stringify(seen));done('solve-shape-detective',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
