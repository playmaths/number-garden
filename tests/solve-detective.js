// plays Story detective at every level (clean, miss-then-win, Show me) and checks the "Does that make sense?" card on Draw the bar and Rewind it
const {open,go,stars,msg,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  const H=()=>pg.evaluate(()=>{const c=__ng().ctx;return{answer:c.help.answer,book:c.help.book}});
  const check=async(name,before,re)=>{const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s}`);const b=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book.slice(0,2).map(x=>x.t).join(' / '));if(!re.test(b))errs.push(`${name}: book "${b}"`)};
  const tapRight=async()=>{await pg.locator('#controls .choice[data-right="1"]:not([disabled])').first().click();await pg.waitForTimeout(80)};
  const tapWrong=async(name)=>{await pg.locator('#controls .choice:not([data-right]):not([disabled])').first().click();if(!(await msg(pg)).length)errs.push(`${name}: no hint after a wrong card`)};
  for(let lv=1;lv<=3;lv++)for(const mode of ['clean','miss','show']){await go(pg,'detective',lv,'story');const before=await stars(pg);const name=`detective lv${lv} ${mode}`;
    if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);if(!(await msg(pg)).length)errs.push(`${name}: silent`);continue}
    if(lv===1){const {answer}=await H();if(mode==='miss'){const w=pg.locator('#controls .choice',{hasNotText:answer}).first();await w.click();if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}await pg.locator('#controls .choice',{hasText:new RegExp('^'+answer+'$')}).click();await check(name,before,/no numbers/);continue}
    /* know: two right cards */
    if(mode==='miss')await tapWrong(name);await tapRight();await tapRight();await pause(pg,1400);
    if(!/Want/.test(await pg.locator('#stage .instr').innerText()))errs.push(`${name}: did not reach Want`);
    if(mode==='miss')await tapWrong(name);await tapRight();await pause(pg,1400);
    if(!/Picture/.test(await pg.locator('#stage .instr').innerText()))errs.push(`${name}: did not reach Picture`);
    if(mode==='miss')await tapWrong(name);await tapRight();await pause(pg,1100);
    if(!/Solve/.test(await pg.locator('#stage .instr').innerText()))errs.push(`${name}: did not reach Solve`);if(!await pg.locator('#stage .guess').count())errs.push(`${name}: no think-first card before the number`);await guess(pg);
    const {answer}=await H();if(mode==='miss'){await type(answer+9);if(!(await msg(pg)).length)errs.push(`${name}: no hint on the number`);let card=pg.locator('#stage .sense');if(!await card.count()){await type(1);card=pg.locator('#stage .sense')}if(!await card.count())errs.push(`${name}: no sense card for an impossible answer`);else{await card.locator('.choice',{hasText:/^no$/}).click();if(!/Try again/.test(await msg(pg))){await card.locator('.choice',{hasText:/^yes$/}).click()}if(!/Try again/.test(await msg(pg)))errs.push(`${name}: sense card did not answer`)}}
    await type(answer);await gate(pg);if(await pg.locator('#stage .sense').count())errs.push(`${name}: sense card left after the win`);await check(name,before,/detective/)}
  /* sense card on Draw the bar level 2 (a part cannot be as big as the whole) and Rewind it level 1 */
  await go(pg,'bar',2,'story');await guess(pg);const whole=await pg.evaluate(()=>+document.querySelector('#stage .story').textContent.match(/has (\d+)/)[1]);await type(whole+1);if(!await pg.locator('#stage .sense').count())errs.push('bar lv2: no sense card for a part bigger than the whole');
  await go(pg,'rewind',1,'puz');await guess(pg);const st=await pg.evaluate(()=>document.querySelector('#stage .story').textContent);const end=+st.match(/has (\d+)/)[1];const got=/got/.test(st);await type(got?end+3:Math.max(0,end-1));if(!await pg.locator('#stage .sense').count())errs.push('rewind lv1: no sense card for an impossible start');
  console.log('detective played');done('solve-detective',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
