// shared helpers for the headless checks. Every script opens the local index.html in Chromium.
const path=require('path');const {chromium}=require('playwright');
const URL='file://'+path.resolve(__dirname,'..','index.html');
/* fast mode: the seed sets window.__NG_FAST before any page script runs (an init script, so it is there after every reload and untouched by the localStorage.clear() a check does), and the app then runs its waits at a tenth and its animations in a blink. It is a window flag, not a storage write: an init script that touches localStorage at document start makes Chromium load the area before the old document's writes have landed, and a reload then meets an empty garden about one time in ten. T(n) is the matching test-side pause for an app delay of n ms (a tenth plus a margin); pause(pg,n) waits that long */
const FAST_SEED=()=>{window.__NG_FAST=true};
const fast=pgOrCtx=>pgOrCtx.addInitScript(FAST_SEED);
const T=n=>n>=200?Math.round(n/10)+60:n;
const pause=(pg,n)=>pg.waitForTimeout(T(n));
async function open(opts={}){const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:420,height:860},...opts});await fast(ctx);const pg=await ctx.newPage();const errs=[];await pg.route('**/firestore.googleapis.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'})); // no real network from the checks; a test that needs its own mock routes after this and wins
  pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message));pg.on('console',m=>{if((m.type()==='error'||m.type()==='warning')&&!/status of 500/.test(m.text()))errs.push(m.text().slice(0,160))});
  await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();return{br,ctx,pg,errs}}
/* jump straight to one game at one level, as the first stone of a trail from its door; lessons are marked as seen so the problem mounts at once */
async function go(pg,id,lv,door){await pg.evaluate(([id,lv,door])=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{}};s.taught=s.taught||{};s.taught[id+':'+lv]=1;s.trail={door,steps:[id,id,id,id,id],i:0,lit:[0,0,0,0,0]};s.skill=id;s.m[id]={lv,streak:0,low:0};localStorage.setItem('ng2',JSON.stringify(s))},[id,lv,door]);await pg.reload();await pg.waitForTimeout(50)}
const stars=pg=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
const msg=pg=>pg.locator('#msg').innerText();
const book=pg=>pg.evaluate(()=>{const b=JSON.parse(localStorage.getItem('ng2')).book;return b&&b[0]?b[0].t:''});
/* every registered game with its room, read from the page itself */
const games=pg=>pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'))||{};return window.__NG_SKILLS||null});
function done(name,errs){if(errs.length){console.log(`${name}: FAIL`);errs.forEach(e=>console.log('  ',e));process.exitCode=1}else console.log(`${name}: ok`)}
/* the think-first card before a numpad, and the why / another-way card after a right answer: tap the right option of each, then wait for what the tap leads to (the card gone; the problem finished) rather than a fixed time */
const guess=async pg=>{const g=pg.locator('#stage .guess .choice[data-right="1"]');if(await g.count()){await g.first().click();await pg.locator('#stage .guess').waitFor({state:'detached',timeout:4000}).catch(()=>{});await pg.waitForTimeout(30)}};
const gate=async pg=>{const g=pg.locator('#stage .gate .choice[data-right="1"]:not([disabled])');if(await g.count()){await g.first().click();await pg.waitForFunction(()=>{const c=__ng().ctx;return !!(c&&c.done)},null,{timeout:4000}).catch(()=>{});await pg.waitForTimeout(30)}};
module.exports={open,go,stars,msg,book,done,URL,guess,gate,fast,pause,T};
