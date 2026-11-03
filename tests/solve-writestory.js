// plays the games of one door for real, answering correctly and wrongly, asserting stars and book lines
const {chromium}=require('playwright');
(async()=>{
const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:860}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/firebase|net::|googleapis/i.test(m.text()))errs.push(m.text())});
await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'');await pg.evaluate(()=>localStorage.clear());await pg.reload();
const msg=()=>pg.locator('#msg').textContent();const stars=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
const choice=i=>pg.locator('#controls .choice').nth(i).click();const num=v=>pg.locator('#controls .num',{hasText:new RegExp('^'+v+'$')}).first().click();
// trail from the door must contain writestory
await pg.locator('.door.maker').click();const trail=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps);console.log('make trail:',trail.join(','));
if(!trail.includes('writestory')&&!trail.includes('think'))throw new Error('writestory not on trail'); // the middle stone is now a think stone, so a five-game door shows four of its games
async function goWrite(){for(let i=0;i<8;i++){await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail={door:'make',steps:['writestory','hide','rulemaker','hide','rulemaker'],i:0,lit:[0,0,0,0,0]};s.skill='writestory';localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();
  if(await pg.locator('#home').isVisible())await pg.locator('.door.maker').click();await pg.waitForTimeout(100);if((await pg.locator('#where').textContent()).includes('write the story'))return}throw new Error('could not reach writestory')}
async function run(sayWrong){await goWrite();
  console.log('where:',await pg.locator('#where').textContent());
  await choice(2);await num(7);const act=await pg.locator('#controls .choice').nth(3).innerText();await choice(3);await num(4);
  const story=await pg.locator('.story').innerText();await pg.waitForSelector('#controls .bigpick .choice');
  const bub=await pg.locator('#controls .bubble').innerText();const said=+await pg.locator('.bubble em').innerText();const real=/got|found/.test(act)?11:3;const right=said===real;
  const before=await stars();
  if(sayWrong){await choice(right?1:0);console.log('  wrong-judge:',(await msg()).slice(0,60));await pg.waitForTimeout(300)}
  await choice(right?0:1);
  if(!right){await pg.waitForSelector('#controls .typed');for(const ch of String(real))await num(ch);await pg.locator('#controls .go').click()}
  await pg.waitForTimeout(700);const m=await msg();const after=await stars();
  console.log(`story="${story}" bubble="${bub.slice(0,50)}…" said=${said} real=${real} right=${right} msg="${m.slice(0,60)}" stars ${before}->${after} helpRows=${await pg.locator('#helpRow').count()}`);
  if(after!==before+1)throw new Error('no star');
  await pg.waitForTimeout(2500);
  const book=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book[0].t);console.log('  book:',book);
  await pg.getByRole('button',{name:'Next stone'}).click();
}
for(let i=0;i<4;i++)await run(i%2===1);
// clue + show me
await goWrite();
console.log('help row during build:',await pg.locator('#helpRow').count());
await choice(0);await num(5);await choice(2);await num(2);await pg.waitForSelector('#controls .bigpick');
await pg.getByRole('button',{name:'Clue'}).click();console.log('clue:',await msg());await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(2500);console.log('show me:',await msg(),'| tally:',await pg.locator('.tally').innerText());
await pg.screenshot({path:require('path').join(require('os').tmpdir(),'ng-'+Date.now()+'.png')});console.log('errors:',errs);await br.close();if(errs.length)process.exit(1)})().catch(e=>{console.error(e);process.exit(1)});
