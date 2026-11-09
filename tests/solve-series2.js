// Two things change at every level: the answer continues every rule in the row, every distractor is off in at least one attribute, a miss names the attribute, the think-first card at level 2, the gates, Show me and the lesson
const {open,go,stars,msg,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const read=()=>pg.evaluate(()=>{const c=__ng().ctx;return{seq:c.seq,choices:c.choices,attrs:c.attrs,pick:c.help.pick,answer:c.help.answer}});
  /* what the next figure must be, from the row alone: a cycle repeats every 2 or 3, a count or size grows by one, a turn goes a quarter round */
  const next=(vals,k)=>{const L=vals.length,last=vals[L-1];if(k==='n'||k==='z'){if(!vals.every((v,i)=>!i||v===vals[i-1]+1))return{err:'not growing by one'};return{v:last+1}}if(k==='r'){if(!vals.every((v,i)=>!i||v===(vals[i-1]+1)%4))return{err:'not a quarter turn'};return{v:(last+1)%4}}
    const p=[2,3].find(p=>vals.every((v,i)=>i<p||v===vals[i-p]));if(!p)return{err:'no cycle of 2 or 3'};return{v:vals[L-p]}};
  for(const lv of[1,2,3])for(let k=0;k<6;k++){await go(pg,'series2',lv,'pat');const before=await stars(pg);const tag=`series2 lv${lv} #${k}`;
    if(lv===2&&!await pg.locator('#stage .guess').count())errs.push(tag+': no think-first card');if(lv!==2&&await pg.locator('#stage .guess').count())errs.push(tag+': think-first card at the wrong level');await guess(pg);
    const d=await read();const ans=d.choices[d.pick];if(!ans||typeof d.answer!=='string'||!d.answer)errs.push(tag+': no readable answer');if(d.attrs.length!==(lv===3&&d.seq[0].s!=='arrow'?3:2))errs.push(tag+`: ${d.attrs.length} attributes change (${d.attrs})`);
    for(const a of d.attrs){const want=next(d.seq.map(f=>f[a]),a);if(want.err)errs.push(`${tag}: ${a} ${want.err}: ${d.seq.map(f=>f[a])}`);else if(ans[a]!==want.v)errs.push(`${tag}: ${a} should go on to ${want.v}, answer has ${ans[a]}`)}
    const fixed=['s','c','n','z','r'].filter(x=>!d.attrs.includes(x));for(const x of fixed)if(!d.seq.every(f=>f[x]===d.seq[0][x])||ans[x]!==d.seq[0][x])errs.push(`${tag}: ${x} should stay the same`);
    d.choices.forEach((f,i)=>{if(i===d.pick)return;const diff=d.attrs.filter(a=>f[a]!==ans[a]);if(!diff.length)errs.push(`${tag}: distractor ${i} is the answer again`);if(diff.length===d.attrs.length&&d.attrs.length===3)errs.push(`${tag}: a three-way distractor has nothing right`)});
    if(d.choices.length!==4)errs.push(tag+': not four choices');if(await pg.locator('#controls .choice svg').count()!==4)errs.push(tag+': the choices are not drawn');
    if(k%2){const wrong=d.choices.findIndex((f,i)=>i!==d.pick);await pg.locator('#controls .choice').nth(wrong).click();const m=await msg(pg);const bad=d.attrs.filter(a=>d.choices[wrong][a]!==ans[a]);const names={s:'shape',c:'colour',n:'number',z:'size',r:'turn'};
      if(!m.length)errs.push(tag+': no hint on a miss');else if(!bad.some(a=>m.includes(names[a])))errs.push(`${tag}: the hint "${m.slice(0,80)}" does not name ${bad.map(a=>names[a])}`);if(await pg.locator('#controls .choice.miss').count()!==1)errs.push(tag+': the wrong pick is not marked');}
    await pg.locator('#controls .choice').nth(d.pick).click();await pg.waitForTimeout(100);if(!await pg.locator('#stage .gate').count())errs.push(tag+': no why or another-way gate');await gate(pg);
    if((await stars(pg))!==before+1)errs.push(`${tag}: no star ("${(await msg(pg)).slice(0,80)}")`);if(!await pg.locator('#stage .seq .q svg').count())errs.push(tag+': the answer was not drawn in the box');
    const book=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book.find(b=>/patterns at once/.test(b.t)));if(!book)errs.push(tag+': no book line about two patterns at once')}
  /* Show me paints one attribute at a time, then the answer */
  for(const lv of[1,3]){await go(pg,'series2',lv,'pat');await guess(pg);const d=await read();await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(100);if(!(await msg(pg)).includes(d.answer))errs.push(`series2 lv${lv} Show me: "${(await msg(pg)).slice(0,80)}" does not name ${d.answer}`);
    const grey=await pg.locator('#stage .seq .it:not(.q) [fill="#9aa7a0"]').first().waitFor({state:'attached',timeout:4000}).then(()=>1,()=>0);if(!grey)errs.push(`series2 lv${lv} Show me: nothing covered in grey while one attribute is shown`);
    await pg.locator('#stage .seq .q svg').waitFor({timeout:d.attrs.length*2600+1500}).catch(()=>{});await pg.waitForTimeout(50);if(await pg.locator('#stage .seq .it:not(.q) [fill="#9aa7a0"]').count())errs.push(`series2 lv${lv} Show me: the grey stayed`);if(!await pg.locator('#stage .seq .q svg').count())errs.push(`series2 lv${lv} Show me: no answer in the box`)}
  /* the lesson at each level runs through to My turn without errors */
  for(const lv of[1,2,3]){await go(pg,'series2',lv,'pat');await pg.getByRole('button',{name:'Watch'}).click();await pg.waitForTimeout(300);if(!await pg.locator('#stage .lesson .seq').count())errs.push(`series2 lv${lv} lesson: no row of figures`);
    for(let i=0;i<12;i++){await pause(pg,700);const nx=pg.getByRole('button',{name:'Next ▶'});if(await nx.isVisible())await nx.click()}
    const bub=await pg.locator('#stage .bubble').innerText();if(!/Now you try/.test(bub))errs.push(`series2 lv${lv} lesson: did not reach the end ("${bub.slice(0,60)}")`);if(!await pg.locator('#stage .lesson .seq .q svg').count())errs.push(`series2 lv${lv} lesson: the answer was not put in the box`);
    await pg.getByRole('button',{name:'My turn'}).click();await pg.waitForTimeout(150);if(!await pg.locator('#controls .choice').count())errs.push(`series2 lv${lv} lesson: My turn did not start the problem`)}
  await go(pg,'series2',1,'pat');await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-series2-'+Date.now()+'.png')});
  console.log('series2 played');done('solve-series2',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
