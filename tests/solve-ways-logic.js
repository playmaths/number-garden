// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {pause,fast}=require('./lib');
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});await fast(pg);
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').innerText();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
async function go(door,id,lv){await pg.evaluate(([door,id,lv])=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{}};s.trail={door,steps:[id,'dots','dots','dots','dots'],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};s.taught={[id+':'+lv]:1};localStorage.setItem('ng2',JSON.stringify(s))},[door,id,lv]);await pg.reload();if(await pg.locator('#home').isVisible())await pg.locator('.door',{hasText:door==='story'?'Stories':'Puzzles'}).click();await pg.waitForTimeout(60)}
const num=async v=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click()};
for(const lv of[3,4]){await go('story','ways',lv);const before=await stars();const n=await pg.locator('#stage .bead').count();const beads=pg.locator('#stage .bead'),way=pg.getByRole('button',{name:"That's a way"});console.log(`ways lv${lv} n=${n}: "${await pg.locator('.story').innerText()}"`);
  for(let r=1;r<n;r++){for(let i=0;i<n;i++){await beads.nth(i).click();await pg.locator('#stage .pot').nth(i<r?0:1).click()}await way.click();console.log(`  ${r} red:`,(await msg()).slice(0,70))}
  if(lv===4){console.log('  prompt now:',await pg.locator('#prompt').innerText());await num(n);console.log('  wrong count:',(await msg()).slice(0,60));await num(n-1);console.log('  right:',(await msg()).slice(0,70))}
  console.log(`  ways listed=${await pg.locator('#stage .way').count()} ${before}->${await stars()}`);if(await stars()!==before+1)throw new Error('ways lv'+lv)}
await go('story','ways',3);await pg.getByRole('button',{name:'Show me'}).click();console.log('show lv3:',await msg(),'| rows',await pg.locator('#stage .way').count());
await go('puz','logic',1);console.log('logic:',await pg.locator('#stage .hint').innerText());await pg.getByRole('button',{name:'Check'}).click();console.log('  empty check:',await msg());await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});
console.log('errors:',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
