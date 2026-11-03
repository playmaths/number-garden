// shared helpers for the headless checks. Every script opens the local index.html in Chromium.
const path=require('path');const {chromium}=require('playwright');
const URL='file://'+path.resolve(__dirname,'..','index.html');
async function open(opts={}){const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:420,height:860},...opts});const pg=await ctx.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message));pg.on('console',m=>{if((m.type()==='error'||m.type()==='warning')&&!/status of 500/.test(m.text()))errs.push(m.text().slice(0,160))});
  await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();return{br,ctx,pg,errs}}
/* jump straight to one game at one level, as the first stone of a trail from its door; lessons are marked as seen so the problem mounts at once */
async function go(pg,id,lv,door){await pg.evaluate(([id,lv,door])=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{}};s.taught=s.taught||{};s.taught[id+':'+lv]=1;s.trail={door,steps:[id,id,id,id,id],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[id,lv,door]);await pg.reload();await pg.waitForTimeout(80)}
const stars=pg=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
const msg=pg=>pg.locator('#msg').innerText();
const book=pg=>pg.evaluate(()=>{const b=JSON.parse(localStorage.getItem('ng2')).book;return b&&b[0]?b[0].t:''});
/* every registered game with its room, read from the page itself */
const games=pg=>pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'))||{};return window.__NG_SKILLS||null});
function done(name,errs){if(errs.length){console.log(`${name}: FAIL`);errs.forEach(e=>console.log('  ',e));process.exitCode=1}else console.log(`${name}: ok`)}
/* the think-first card before a numpad, and the why / another-way card after a right answer: tap the right option of each */
const guess=async pg=>{const g=pg.locator('#stage .guess .choice[data-right="1"]');if(await g.count()){await g.first().click();await pg.waitForTimeout(1100)}};
const gate=async pg=>{const g=pg.locator('#stage .gate .choice[data-right="1"]:not([disabled])');if(await g.count()){await g.first().click();await pg.waitForTimeout(950)}};
module.exports={open,go,stars,msg,book,done,URL,guess,gate};
