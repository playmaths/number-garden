// plays Draw the bar, Rewind it and Name the trick at every level: a clean win, a miss-then-win, and Show me; asserts stars, book lines and no console errors
const {open,go,stars,msg,book,done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  const answer=()=>pg.evaluate(()=>__ng().ctx.help.answer);
  const check=async(name,before,expectBook)=>{const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s}`);const b=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book.slice(0,2).map(x=>x.t).join(' / '));if(!expectBook.test(b))errs.push(`${name}: book line "${b}"`)}; // a badge line may sit on top
  /* bar: levels 1-3 typed, level 4 picks a bar */
  for(let lv=1;lv<=4;lv++){for(const mode of ['clean','miss','show']){await go(pg,'bar',lv,'story');const before=await stars(pg);const name=`bar lv${lv} ${mode}`;
      if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);if(!(await msg(pg)).length)errs.push(`${name}: silent`);continue}
      if(lv<4){const a=await answer();if(mode==='miss'){await type(a+1);if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}await type(a);await check(name,before,/bar|part|difference/)}
      else{const kind=await pg.evaluate(()=>{const c=[...document.querySelectorAll('#controls .choice')];const k=prompt.textContent;return c.map(x=>x.dataset.kind)});const right=await pg.evaluate(()=>{const st=document.querySelector('#stage .story').textContent;return /in all/.test(st)?'whole':/blue/.test(st)?'part':'more'});
        if(mode==='miss'){const wrong=kind.find(k=>k!==right);await pg.locator(`#controls .choice[data-kind="${wrong}"]`).click();if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}
        await pg.locator(`#controls .choice[data-kind="${right}"]`).click();await pg.waitForTimeout(100);await check(name,before,/picked the right bar/)}}}
  /* rewind */
  for(let lv=1;lv<=3;lv++){for(const mode of ['clean','miss','show']){await go(pg,'rewind',lv,'puz');const before=await stars(pg);const name=`rewind lv${lv} ${mode}`;
      const chain=await pg.locator('#stage .chain .node').count();if(chain!==(lv===1?2:3))errs.push(`${name}: chain has ${chain} nodes`);
      if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(1800);const q=await pg.locator('#stage .node.q').count();if(q)errs.push(`${name}: ${q} nodes still ? after Show me`);continue}
      const a=await answer();if(mode==='miss'){await type(a+2);if(!/undo|Start at/.test(await msg(pg)))errs.push(`${name}: hint was "${await msg(pg)}"`)}await type(a);await check(name,before,/rewound a story/)}}
  /* trick: pick the name, then (levels 2-3) type the answer */
  for(let lv=1;lv<=3;lv++){for(const mode of ['clean','miss','show']){await go(pg,'trick',lv,'add');const before=await stars(pg);const name=`trick lv${lv} ${mode}`;
      const info=await pg.evaluate(()=>({right:__ng().ctx.help.answer,names:[...document.querySelectorAll('#controls .choice')].map(c=>c.textContent),why:__ng().ctx.help.why}));
      if(mode==='show'){await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);if(!(await msg(pg)).length)errs.push(`${name}: silent`);if(!await pg.locator('#stage svg').count())errs.push(`${name}: no picture`);continue}
      const rightName=lv===1?info.right:await pg.evaluate(()=>{const w=__ng().ctx.help.book;return Object.values(__ng().tricks).map(t=>t.name).find(n=>w.includes(n))});
      if(mode==='miss'){const wrong=info.names.find(n=>n!==rightName);await pg.locator('#controls .choice',{hasText:wrong}).click();if(!(await msg(pg)).length)errs.push(`${name}: no hint`)}
      await pg.locator('#controls .choice',{hasText:rightName}).first().click();await pg.waitForTimeout(100);
      if(lv>1){if(!await pg.locator('#controls .num').count())errs.push(`${name}: no numpad after the pick`);else{if(mode==='miss'){await type(info.right+1)}await type(info.right)}}
      await check(name,before,lv===1?/named the/:/used the/)}}
  console.log('thinking games played');done('solve-thinking',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
