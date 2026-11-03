// plays Same story, three unknowns at every level: three rounds answered in a row (clean and with a miss), and Show me
const {open,go,stars,msg,done,gate}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  const ans=()=>pg.evaluate(()=>__ng().ctx.help.answer);
  for(let lv=1;lv<=3;lv++)for(const mode of ['clean','miss','show']){await go(pg,'three',lv,'story');const before=await stars(pg);const name=`three lv${lv} ${mode}`;
    if(await pg.locator('#stage .stone').count()!==3)errs.push(`${name}: expected 3 stones`);
    if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);if(!(await msg(pg)).length)errs.push(`${name}: silent`);if(await pg.locator('#stage .node.q, #stage .barm text[fill="var(--accent)"]').count()>1)errs.push(`${name}: ? still shown after Show me`);continue}
    const texts=new Set();for(let r=0;r<3;r++){texts.add(await pg.locator('#stage .story').innerText());const a=await ans();if(mode==='miss'&&r===1){await type(a+3);if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}await type(a);await pg.waitForTimeout(2100)}
    await gate(pg);if(texts.size!==3)errs.push(`${name}: the three rounds were not three different stories`);
    const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s} ("${await msg(pg)}")`);
    const pics=await pg.locator(lv===3?'#stage .barm':'#stage .chain').count();if(pics!==3)errs.push(`${name}: ${pics} pictures in the summary`);
    const b=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book.slice(0,2).map(x=>x.t).join(' / '));if(!/three ways/.test(b))errs.push(`${name}: book "${b}"`)}
  console.log('three played');done('solve-three',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
