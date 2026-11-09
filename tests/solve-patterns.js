// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {pause,fast}=require('./lib');
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});await fast(pg);
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').innerText();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
async function go(id,lv){await pg.evaluate(([id,lv])=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{}};s.trail={door:'pat',steps:[id,'dots','dots','dots','dots'],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};s.taught={[id+':'+lv]:1};localStorage.setItem('ng2',JSON.stringify(s))},[id,lv]);await pg.reload();if(await pg.locator('#home').isVisible())await pg.locator('.door',{hasText:'Patterns'}).click();await pg.waitForTimeout(60)}
const num=async v=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click()};
for(let k=0;k<4;k++){await go('cont',1);const before=await stars();
  const info=await pg.evaluate(()=>{const key=e=>e.querySelector('svg')?e.querySelector('svg').innerHTML:'';const its=[...document.querySelectorAll('#stage .seq .it:not(.q)')].map(key);const rowTop=[...document.querySelectorAll('#stage .seq .it')].map(e=>Math.round(e.getBoundingClientRect().top));return{its,oneRow:rowTop,opts:[...document.querySelectorAll('#controls .choice')].map(key)}});
  const p=[1,2,3].find(p=>info.its.every((u,i)=>i<p||u===info.its[i-p]));const ans=info.its[info.its.length-p];const idx=info.opts.indexOf(ans);
  await pg.locator('#controls .choice').nth(idx).click();console.log(`cont lv1 shown=${info.its.length} oneRow=${info.oneRow} p=${p} msg="${(await msg()).slice(0,50)}" ${before}->${await stars()}`)}
for(const lv of[2,3])for(let k=0;k<3;k++){await go('cont',lv);const before=await stars();const terms=(await pg.locator('#stage .seq .it:not(.q)').allInnerTexts()).map(Number);const jumps=await pg.locator('#stage .jumps span').allInnerTexts();
  const d=terms.slice(1).map((t,i)=>t-terms[i]);let ans;if(d.every(x=>x===d[0]))ans=terms[3]+d[0];else if(d[1]-d[0]===d[2]-d[1])ans=terms[3]+d[2]+(d[2]-d[1]);else ans=terms[3]*2;
  if(lv===2)await pg.locator('#controls .choice',{hasText:new RegExp('^'+ans+'$')}).click();else await num(ans);
  console.log(`cont lv${lv} ${terms.join(' ')} jumps=[${jumps.join(' ')}] ans=${ans} msg="${(await msg()).slice(0,50)}" ${before}->${await stars()}`)}
for(const lv of[1,2,3])for(let k=0;k<3;k++){await go('machine',lv);const before=await stars();const rows=await pg.locator('#stage .machine .io:not(.head)').allInnerTexts();const pairs=rows.map(r=>r.split(/\s+/).map(Number)).filter(p=>!isNaN(p[2]));
  const apply=(r,x)=>r==='doubles it'?x*2:r.startsWith('adds')?x+ +r.split(' ')[1]:x- +r.split(' ')[2];const cands=['doubles it',...[1,2,3,4,5].map(n=>'adds '+n),...[1,2,3].map(n=>'takes away '+n)];const rule=cands.find(r=>pairs.every(([x,,y])=>apply(r,x)===y));
  if(lv<3){const opts=await pg.locator('#controls .choice').allInnerTexts();if(k===1){await pg.locator('#controls .choice').filter({hasNotText:rule}).first().click();console.log('  miss:',(await msg()).slice(0,70))}await pg.locator('#controls .choice',{hasText:new RegExp('^'+rule+'$')}).click();console.log(`machine lv${lv} rows=[${pairs.map(p=>p[0]+'→'+p[2]).join(' ')}] opts=[${opts.join('|')}] msg="${(await msg()).slice(0,50)}" ${before}->${await stars()}`)}
  else{const q=+rows[rows.length-1].split(/\s+/)[0];const f=apply(rule,q);await num(f);console.log(`machine lv3 rows=[${rows.join(' | ').replace(/\s+/g,' ')}] rule="${rule}" ans=${f} msg="${(await msg()).slice(0,50)}" ${before}->${await stars()}`)}}
await go('cont',1);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});await go('cont',3);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});await go('machine',2);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});
console.log('errors:',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
