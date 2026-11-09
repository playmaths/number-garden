// plays You ask the question several times: builds a scene, taps the already-known question (refused), asks a real one, checks Pip's answer right or wrong, and types the truth when she was wrong
const {open,go,stars,msg,done,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  let caught=0,agreed=0,refusedAll=0;
  for(let round=0;round<8;round++){await go(pg,'askq',1,'make');const before=await stars(pg);const name=`askq round ${round}`;
    await pg.locator('#controls .choice').nth(round%4).click();await pg.waitForTimeout(60); // the thing
    await pg.locator('#controls .choice').nth(round%3).click();await pg.waitForTimeout(60); // the kind
    const a=pg.locator('#controls .num:not([disabled])');await a.nth(Math.min(3,await a.count()-1)).click();await pg.waitForTimeout(60);
    const b=pg.locator('#controls .num:not([disabled])');await b.nth(Math.min(1,await b.count()-1)).click();await pg.waitForTimeout(60);
    const qs=await pg.locator('#controls .choice').allInnerTexts();if(qs.length!==3)errs.push(`${name}: ${qs.length} questions`);
    /* tap cards until one is accepted: the known ones are refused and stay in place */
    let refused=0,asked=false;for(let i=0;i<3&&!asked;i++){const c=pg.locator('#controls .choice').nth(i);if(await c.isDisabled())continue;await c.click();await pg.waitForTimeout(80);if(await pg.locator('#controls .hint').count()){refused++;if(!/already know/.test(await msg(pg)))errs.push(`${name}: a refused card gave no reason`)}else asked=true}
    if(!asked)errs.push(`${name}: no question was accepted among ${qs.join(' | ')}`);refusedAll+=refused;await pause(pg,1100);
    if(!await pg.locator('#stage .barm').count())errs.push(`${name}: no bar for the question`);
    const info=await pg.evaluate(()=>{const c=__ng().ctx;return{ans:c.help.answer,wrong:/wrong/.test(c.help.why),said:+document.querySelector('.bubble em').textContent}});
    if(info.wrong===(info.said===info.ans))errs.push(`${name}: bubble said ${info.said}, answer ${info.ans}, wrong=${info.wrong}`);
    await pg.locator('#controls .choice',{hasText:info.wrong?'No':'Yes!'}).click();await pg.waitForTimeout(100);
    if(info.wrong){caught++;if(!await pg.locator('#controls .num').count())errs.push(`${name}: no numpad after catching Pip`);else await type(info.ans)}else agreed++;
    const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s} ("${await msg(pg)}")`)}
  if(!refusedAll)errs.push('no already-known question was ever refused');console.log(`askq: caught ${caught}, agreed ${agreed}, refused ${refusedAll}`);done('solve-askq',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
