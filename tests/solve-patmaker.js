// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {pause,fast}=require('./lib');
const {chromium}=require('playwright');
(async()=>{
const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});await fast(pg);
const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/firebase|net::|googleapis/i.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').textContent();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
const pal=i=>pg.locator('#controls .row').first().locator('.choice').nth(i).click();
async function go(){for(let i=0;i<8;i++){await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail={door:'make',steps:['patmaker','hide','rulemaker','hide','rulemaker'],i:0,lit:[0,0,0,0,0]};s.skill='patmaker';localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();
  if(await pg.locator('#home').isVisible())await pg.locator('.door.maker').click();await pg.waitForTimeout(100);if((await pg.locator('#where').textContent()).includes('make the pattern'))return}throw new Error('no patmaker')}
await pg.locator('.door.maker').click();console.log('trail:',(await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps)).join(','));
async function run(seqIdx,sayWrong){await go();
  for(const i of seqIdx)await pal(i);
  const n=await pg.locator('#stage .seq .it:not(.q)').count();
  await pg.getByRole('button',{name:'Done'}).click();await pg.waitForSelector('#controls .bigpick .choice');
  const bub=await pg.locator('#controls .bubble').innerText();
  // read dotted continuation and compute truth from the palette order
  const info=await pg.evaluate(()=>{const its=[...document.querySelectorAll('#stage .seq .it')];const key=e=>e.querySelector('svg').innerHTML;const made=its.filter(e=>!e.classList.contains('q')).map(key),qs=its.filter(e=>e.classList.contains('q')).map(key);return{made,qs}});
  const p=[1,2,3].find(p=>info.made.length>=2*p&&info.made.every((u,i)=>i<p||u===info.made[i-p]));const ext=info.made.slice();for(let i=0;i<3;i++)ext.push(ext[ext.length-p]);const cont=ext.slice(-3);
  const wrongIdx=info.qs.findIndex((q,i)=>q!==cont[i]);const right=wrongIdx<0;const before=await stars();
  const judge=i=>pg.locator('#controls .bigpick .choice').nth(i).click();
  if(sayWrong){await judge(right?1:0);console.log('  wrong-judge:',(await msg()).slice(0,70))}
  await judge(right?0:1);
  if(!right){if(sayWrong){const ok=wrongIdx===0?1:0;await pg.locator('#stage .seq .it.q').nth(ok).click();console.log('  wrong-tap:',(await msg()).slice(0,60))}await pg.locator('#stage .seq .it.q').nth(wrongIdx).click()}
  await pause(pg,600);const after=await stars();const m=await msg();
  console.log(`n=${n} p=${p} bubble="${bub.slice(0,45)}" right=${right} msg="${m.slice(0,60)}" stars ${before}->${after} helpRows=${await pg.locator('#helpRow').count()}`);
  if(after!==before+1||!m)throw new Error('no win');console.log('  book:',await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book[0].t))}
await run([0,1,0,1,0,1],false);await run([0,1,1,0,1,1],true);await run([0,1,2,0,1,2],false);await run([2,2,2,2],true);await run([0,1,0,1],false);await run([0,1,0,1,0,1],true);
// not a pattern, undo, clue/show
await go();await pal(0);await pal(1);await pal(2);await pal(3);await pg.getByRole('button',{name:'Done'}).click();console.log('no-repeat:',await msg());
await pg.getByRole('button',{name:'⌫'}).click();await pal(0);await pal(1);await pal(2);await pg.getByRole('button',{name:'Clue'}).click();console.log('clue(build):',await msg());
await pg.getByRole('button',{name:'Done'}).click();await pg.waitForSelector('#controls .bigpick');await pg.getByRole('button',{name:'Show me'}).click();console.log('show:',await msg());
await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});console.log('errors:',errs);await br.close();if(errs.length)process.exit(1)})().catch(e=>{console.error(e);process.exit(1)});
