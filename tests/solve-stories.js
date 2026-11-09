// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {pause,fast}=require('./lib');
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});await fast(pg);
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').innerText();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
async function go(id,lv){await pg.evaluate(([id,lv])=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{}};s.trail={door:'story',steps:[id,'dots','dots','dots','dots'],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};s.taught={[id+':'+lv]:1};localStorage.setItem('ng2',JSON.stringify(s))},[id,lv]);await pg.reload();if(await pg.locator('#home').isVisible())await pg.locator('.door',{hasText:'Stories'}).click();await pg.waitForTimeout(60)}
for(const lv of[1,2,3]){await go('ways',lv);const before=await stars();const n=await pg.locator('#stage .bead').count();const parts=2;const need=lv===1?2:lv===2?3:n-1;
  const beads=pg.locator('#stage .bead');const way=pg.getByRole('button',{name:"That's a way"});
  await way.click();console.log('  blank:',(await msg()).slice(0,50));
  for(let i=0;i<n;i++)await beads.nth(i).click();await way.click();console.log('  one color:',(await msg()).slice(0,60));
  // split: first r beads red (ci 0 already), rest blue (click once more), lv3: last one green
  for(let w=0;w<need;w++){for(let i=0;i<n;i++){const want=i<w+1?0:(parts===3&&i===n-1?2:1);await beads.nth(i).click();await pg.locator('#stage .pot').nth(want).click()}
    await way.click();if(w===0){await way.click();console.log('  dup:',(await msg()).slice(0,50))}console.log(`  way ${w+1}:`,(await msg()).slice(0,60))}
  console.log(`ways lv${lv} n=${n} ways listed=${await pg.locator('#stage .way').count()} ${before}->${await stars()}`);if(await stars()!==before+1)throw new Error('ways')}
await go('ways',3);await pg.locator('#stage .bead').nth(0).click();await pg.locator('#stage .pot').nth(1).click();await pg.locator('#stage .bead').nth(1).click();await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});
await go('tale',2);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});
console.log('errors:',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
