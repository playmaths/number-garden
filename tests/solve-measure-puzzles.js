// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {chromium}=require('playwright');
(async()=>{
const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/firebase|net::|googleapis/i.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').textContent();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
const doorOf={parts:'Measure',measure:'Measure',estimate:'Measure',sort2:'Puzzles',ifthen:'Puzzles'},roomOf={Measure:'meas',Puzzles:'puz'};
await pg.locator('.door',{hasText:'Measure'}).click();console.log('measure trail:',(await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps)).join(','));
async function go(id,lv){const door=doorOf[id];await pg.evaluate(([id,lv,room])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail={door:room,steps:[id,'dots','dots','dots','dots'],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};s.taught={[id+':'+lv]:1};localStorage.setItem('ng2',JSON.stringify(s))},[id,lv,roomOf[door]]);await pg.reload();if(await pg.locator('#home').isVisible())await pg.locator('.door',{hasText:door}).click();await pg.waitForTimeout(80)}
const num=async v=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click()};
const clickChoice=async(t)=>{const c=pg.locator('#controls .choice',{hasText:t});await c.first().click()};
async function check(label,before){await pg.waitForTimeout(150);const after=await stars();const m=await msg();console.log(`${label} msg="${m.slice(0,60)}" ${before}->${after}`);if(after!==before+1)throw new Error('no win '+label);console.log('  book:',await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book[0].t))}
async function parts(lv,missFirst){await go('parts',lv);const before=await stars();
  if(lv===1){const info=await pg.evaluate(()=>{const ps=[...document.querySelectorAll('#stage svg path,#stage svg rect,#stage svg circle')];return{d:ps.length,n:ps.filter(p=>p.getAttribute('fill').includes('accent')).length}});
    const t=info.d===1?'the whole thing':info.d===2?'half':info.n===1?'a quarter':'three quarters';if(missFirst){await clickChoice(t==='half'?'a quarter':'half');console.log('  miss:',(await msg()).slice(0,60))}await clickChoice(new RegExp('^'+t+'$'));await check(`parts lv1 ${info.n}/${info.d}`,before)}
  else{const p=await pg.locator('#prompt').innerText();const m=p.match(/Tap (.+?) of the (\d+)/);const need=+m[2]/(m[1]==='half'?2:4);const dots=pg.locator('#stage .it2');
    if(missFirst){const wrong=need===1?2:1;for(let i=0;i<wrong;i++)await dots.nth(i).click();await pg.getByRole('button',{name:'Done'}).click();console.log('  miss:',(await msg()).slice(0,60));for(let i=0;i<wrong;i++)await dots.nth(i).click()}
    for(let i=0;i<need;i++)await dots.nth(i).click();await pg.getByRole('button',{name:'Done'}).click();await check(`parts lv${lv} ${m[1]} of ${m[2]}=${need}`,before)}}
async function measure(lv,missFirst){await go('measure',lv);const before=await stars();const p=await pg.locator('#prompt').innerText();
  const counts=await pg.evaluate(()=>[...document.querySelectorAll('#stage svg')].map(s=>s.querySelectorAll('rect').length-1));let ans;if(lv===1)ans=counts[0];else if(lv===2)ans=Math.abs(counts[0]-counts[1]);else ans=+p.match(/is (\d+) big/)[1]*2;
  if(missFirst){await num(ans+1);console.log('  miss:',(await msg()).slice(0,60))}await num(ans);await check(`measure lv${lv} ans=${ans}`,before)}
async function estimate(lv,missFirst){await go('estimate',lv);const before=await stars();const n=await pg.locator('#stage .ta > div:last-child .it2').count();const step=lv===3?20:10;const ans=Math.round(n/step)*step;
  if(missFirst){const opts=await pg.locator('#controls .choice').allInnerTexts();const o=opts.find(t=>+t.split(' ')[1]!==ans);await clickChoice(o);console.log('  miss:',(await msg()).slice(0,60))}await clickChoice(new RegExp('^about '+ans+'$'));await check(`estimate lv${lv} n=${n} ans=${ans}`,before)}
async function readItem(sel){return pg.evaluate(sel=>{const h=document.querySelector(sel);const b=h.querySelector('b');if(b)return{v:+b.textContent};const svg=h.querySelector('svg');const e=svg.firstElementChild;const f=e.getAttribute('fill');return{shape:e.tagName==='circle'?'circle':e.tagName==='rect'?'square':(e.getAttribute('d').startsWith('M20 3')?'star':'tri'),col:f.includes('accent')?'red':f.includes('sky')?'blue':'green',big:parseFloat(svg.style.width||'40')>30}},sel)}
async function sort2(lv,missFirst){await go('sort2',lv);const before=await stars();const zones=pg.locator('#stage .sud button');
  for(let k=0;k<4;k++){const it=await readItem('#stage .hint');let r,c;if(lv===1){r=it.big?0:1;c=it.col==='red'?0:1}else if(lv===2){r=it.shape==='circle'?0:1;c=it.col==='red'?0:1}else{r=it.v%2?0:1;c=it.v<10?0:1}
    if(missFirst&&k===0){await zones.nth((r*2+c+1)%4).click();console.log('  miss:',(await msg()).slice(0,60))}await zones.nth(r*2+c).click()}
  await check(`sort2 lv${lv}`,before)}
async function ifthen(lv,missFirst){await go('ifthen',lv);const before=await stars();
  if(lv<3){for(let k=0;k<4;k++){const it=await readItem('#stage .hint');const want=it.col==='red'||(lv===2&&it.shape==='star');if(missFirst&&k===0){await clickChoice(want?'Leave it out':'In the box');console.log('  miss:',(await msg()).slice(0,60))}await clickChoice(want?'In the box':'Leave it out')}}
  else{const p=await pg.locator('#prompt').innerText();const x=+p.match(/is (\d+)/)[1];const t=await pg.locator('.story').innerText();let ans;if(t.includes('even'))ans=x%2===0?x/2:x+1;else if(t.includes('bigger than 10'))ans=x>10?x-10:x*2;else ans=x%10===0?x+5:x+10;
    if(missFirst){await num(ans+1);console.log('  miss:',(await msg()).slice(0,60))}await num(ans)}
  await check(`ifthen lv${lv}`,before)}
for(const lv of[1,2,3]){await parts(lv,false);await parts(lv,true);await measure(lv,false);await measure(lv,true);await estimate(lv,false);await estimate(lv,true);/* sort2 is covered by solve-sort.js */await ifthen(lv,false);await ifthen(lv,true)}
for(const id of['parts','measure','estimate','ifthen']){await go(id,3);await pg.getByRole('button',{name:'Clue'}).click();const c=await msg();await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);console.log(id,'clue:',c.slice(0,55),'| show:',(await msg()).slice(0,60))}
await go('parts',1);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});await go('estimate',2);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});await go('sort2',1);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});await go('measure',2);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});
console.log('errors:',errs);await br.close();if(errs.length)process.exit(1)})().catch(e=>{console.error(e);process.exit(1)});
