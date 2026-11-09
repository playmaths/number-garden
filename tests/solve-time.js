// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {pause,fast}=require('./lib');
const {chromium}=require('playwright');
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const parseWords=w=>{let m;if(m=w.match(/^(\d+) o'clock/))return[+m[1],0];if(m=w.match(/^half past (\d+)/))return[+m[1],30];if(m=w.match(/^quarter past (\d+)/))return[+m[1],15];if(m=w.match(/^quarter to (\d+)/))return[(+m[1]+10)%12+1,45];if(m=w.match(/^(\d+) minutes past (\d+)/))return[+m[2],+m[1]];throw new Error('parse '+w)};
(async()=>{
const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});await fast(pg);
const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/firebase|net::|googleapis/i.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').textContent();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
const doors=await pg.locator('.door b').allInnerTexts();console.log('doors:',doors.join(' | '));
await pg.locator('.door',{hasText:'Time'}).click();console.log('time trail:',(await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps)).join(','));
async function go(id,lv){await pg.evaluate(([id,lv])=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail={door:'time',steps:[id,'minutes','elapsed','calendar','minutes'],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};s.taught={[id+':'+lv]:1};localStorage.setItem('ng2',JSON.stringify(s))},[id,lv]);await pg.reload();if(await pg.locator('#home').isVisible())await pg.locator('.door',{hasText:'Time'}).click();await pg.waitForTimeout(80)}
const clockOf=async(svgLoc)=>svgLoc.evaluate(s=>{const L=[...s.querySelectorAll('line')].filter(l=>l.getAttribute('stroke-linecap'));const ang=l=>{const x=+l.getAttribute('x2')-100,y=100-+l.getAttribute('y2');return((Math.atan2(x,y)*180/Math.PI)+360)%360};const ha=ang(L[0]),ma=ang(L[1]);const m=Math.round(ma/6)%60;const h=Math.round((ha-m*.5)/30)%12||12;return[h,m]});
async function run(id,lv,missFirst){await go(id,lv);const where=await pg.locator('#where').textContent();let ans;const ptxt=await pg.locator('#prompt').innerText();
  if(id==='minutes'){const[h,m]=await clockOf(pg.locator('#stage svg').first());ans=`${h}:${String(m).padStart(2,'0')}`}
  else if(id==='elapsed'){const m=ptxt.match(/It is (.+?)\. .+? is at (.+?)\. How long/);const[a,b]=[parseWords(m[1]),parseWords(m[2])];let gap=(b[0]*60+b[1])-(a[0]*60+a[1]);if(gap<=0)gap+=720;ans=lv===1?gap/60:gap}
  else{const t=await pg.locator('.story').innerText();const list=lv<3?DAYS:MONTHS;const cur=list.find(d=>t.includes(d));const i=list.indexOf(cur);let k;if(/comes next/.test(t))k=1;else if(/yesterday|before/.test(t))k=-1;else if(/in 2 months/.test(t))k=2;else k=+t.match(/in (\d) days/)[1];ans=list[((i+k)%list.length+list.length)%list.length]}
  const before=await stars();const ch=pg.locator('#controls .choice');const n=await ch.count();let texts=[];
  if(n){texts=(await ch.allInnerTexts()).map(t=>t.split('\n')[0]);const idx=texts.findIndex(t=>id==='elapsed'?parseInt(t)===ans:t===ans);if(idx<0)throw new Error(`answer ${ans} not among ${texts}`);
    if(missFirst){await ch.nth((idx+1)%n).click();console.log('  miss:',(await msg()).slice(0,70))}await ch.nth(idx).click()}
  else{if(missFirst){await pg.locator('#controls .num',{hasText:/^9$/}).click();await pg.locator('#controls .num',{hasText:/^9$/}).click();await pg.locator('#controls .go').click();console.log('  miss:',(await msg()).slice(0,70))}for(const d of String(ans))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click()}
  await pg.waitForTimeout(300);const after=await stars();const m=await msg();const extra=id==='minutes'?' opts=['+texts.join('|')+']':id==='calendar'?' lit='+await pg.locator('#stage .strip .way[style*="rgba"], #stage .strip .way[style*="leaf"]').count():'';console.log(`${where} lv${lv} ans=${ans}${extra} msg="${m.slice(0,70)}" ${before}->${after}`);if(after!==before+1)throw new Error('no win');console.log('  book:',await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book[0].t))}
for(const id of['minutes','elapsed','calendar'])for(const lv of[1,2,3]){await run(id,lv,false);await run(id,lv,true)}
// clue + show me on each
for(const id of['minutes','elapsed','calendar']){await go(id,3);await pg.getByRole('button',{name:'Clue'}).click();const c=await msg();await pg.getByRole('button',{name:'Show me'}).click();await pause(pg,1500);console.log(id,'clue:',c.slice(0,60),'| show:',(await msg()).slice(0,60))}
await go('elapsed',2);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});console.log('errors:',errs);await br.close();if(errs.length)process.exit(1)})().catch(e=>{console.error(e);process.exit(1)});
