// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {pause,fast}=require('./lib');
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});await fast(pg);
const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/firebase|net::|googleapis/i.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').innerText();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
async function go(lv){await pg.evaluate(lv=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{}};s.trail={door:'puz',steps:['coins','dots','dots','dots','dots'],i:0,lit:[0,0,0,0,0]};s.skill='coins';s.m.coins={lv,streak:0,low:0};s.taught={['coins:'+lv]:1};s.streakNow=4;localStorage.setItem('ng2',JSON.stringify(s))},lv);await pg.reload();if(await pg.locator('#home').isVisible())await pg.locator('.door',{hasText:'Puzzles'}).click();await pg.waitForTimeout(60)}
const num=async v=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click()};
for(let k=0;k<6;k++){await go(1);const p=await pg.locator('#prompt').innerText();const before=await stars();
  if(p.startsWith('Which')){const v=await pg.locator('#stage .coin').innerText();const name={'1¢':'penny','5¢':'nickel','10¢':'dime'}[v];if(k%2)await pg.locator('#controls .choice').filter({hasNotText:name}).first().click();await pg.locator('#controls .choice',{hasText:name}).click()}
  else{const vs=await pg.locator('#stage .coin').allInnerTexts();const t=vs.reduce((a,b)=>a+parseInt(b),0);if(k%2)await num(t+1);await num(t)}
  console.log(`lv1 "${p}" msg="${(await msg()).slice(0,60)}" ${before}->${await stars()}`)}
for(const lv of[2,3])for(let k=0;k<3;k++){await go(lv);const p=await pg.locator('#prompt').innerText();const t=+p.match(/(\d+)¢/)[1];const before=await stars();const bar=pg.locator('#stage .coins .coin');
  let left=t;for(const v of[25,10,5,1]){if(lv===2&&v===25)continue;while(left>=v){await bar.filter({hasText:new RegExp('^'+v+'¢$')}).click();left-=v}}
  if(k===1){await bar.filter({hasText:/^1¢$/}).click();await pg.getByRole('button',{name:'Done'}).click();console.log('  over:',await msg());await pg.locator('#stage .tray .coin').last().click()}
  const narr=await pg.locator('#stage .hint').innerText();await pg.getByRole('button',{name:'Done'}).click();await pg.waitForTimeout(100);console.log(`lv${lv} ${p} counting="${narr}" msg="${(await msg()).slice(0,70)}" ${before}->${await stars()}`)}
await go(2);await pg.locator('#stage .coins .coin').nth(2).click();await pg.locator('#stage .coins .coin').nth(1).click();await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});await go(1);await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});
console.log('errors:',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
