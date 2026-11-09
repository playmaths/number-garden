// two simulated devices against a mocked Firestore: A makes a family and wins, B joins and inherits, B wins, A comes back and sees it
const {chromium}=require('playwright');const {fast,pause}=require('./lib');
(async()=>{const br=await chromium.launch();const errs=[];const store={};const log=[];
const mock=async route=>{const u=route.request().url();const c=decodeURIComponent(u.match(/families\/([^?]+)/)[1]);const m=route.request().method();log.push(m+' '+c);if(m==='GET'){if(store[c])route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(store[c])});else route.fulfill({status:404,body:'{}'})}else{store[c]=JSON.parse(route.request().postData());route.fulfill({status:200,contentType:'application/json',body:'{}'})}};
const mk=async()=>{const ctx=await br.newContext({viewport:{width:420,height:860}});const pg=await ctx.newPage();await fast(pg);pg.on('pageerror',e=>errs.push(e.message));await pg.route('**/firestore.googleapis.com/**',mock);await pg.goto('file://'+require('path').resolve(__dirname,'..','index.html'));const sk=pg.locator('#welcomeSkip');if(await sk.isVisible())await sk.click(); /* a brand-new device meets the welcome first; the grown-up skips it to reach the code */return[ctx,pg]};
const stars=pg=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).stars);
// A: name + new family + one real win
const [ca,pa]=await mk();await pa.locator('#gearBtn').click();await pa.locator('#name').fill('Zoe');await pa.locator('#newFamily').click();const code=await pa.locator('#family').inputValue();await pa.locator('#closeSheet').click();
await pa.locator('.door',{hasText:'Warm'}).click();await pa.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail.steps[0]='make';localStorage.setItem('ng2',JSON.stringify(s))});await pa.reload();await pa.waitForTimeout(150);
console.log('A view play?',await pa.locator('#play').isVisible(),'| prompt:',await pa.locator('#prompt').innerText());
const k=+(await pa.locator('#prompt').innerText()).match(/^(\d+)/)[1];await pa.locator('#controls .num',{hasText:new RegExp('^'+(10-k)+'$')}).click();await pa.waitForTimeout(200);{const g=pa.locator('#stage .gate .choice[data-right="1"]');if(await g.count())await g.first().click()}await pause(pa,2300);
console.log('A stars:',await stars(pa),'| doc stars:',store[code]?JSON.parse(store[code].fields.data.stringValue).stars:'(no doc)');
// B joins
const [cb,pb]=await mk();await pb.locator('#gearBtn').click();await pb.locator('#family').fill(code);await pause(pb,900);await pb.locator('#closeSheet').click();console.log('B stars after join:',await stars(pb),'| greet:',(await pb.locator('#greet').innerText()).slice(0,30));
// B wins one
await pb.locator('.door',{hasText:'Warm'}).click();await pb.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail.steps[0]='make';localStorage.setItem('ng2',JSON.stringify(s))});await pb.reload();await pb.waitForTimeout(150);console.log('B view play?',await pb.locator('#play').isVisible());
const k2=+(await pb.locator('#prompt').innerText()).match(/^(\d+)/)[1];await pb.locator('#controls .num',{hasText:new RegExp('^'+(10-k2)+'$')}).click();await pb.waitForTimeout(200);{const g=pb.locator('#stage .gate .choice[data-right="1"]');if(await g.count())await g.first().click()}await pause(pb,2300);
console.log('B stars:',await stars(pb),'| doc stars:',JSON.parse(store[code].fields.data.stringValue).stars);
// A comes back
await pa.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await pause(pa,800);console.log('A stars after refocus:',await stars(pa));
console.log('requests:',log.join(', '));const ok=!errs.length&&(await stars(pa))===2;console.log(ok?'sync: ok':'sync: FAIL');errs.forEach(e=>console.log('  ',e));if(!ok)process.exitCode=1;await br.close()})().catch(e=>{console.error(e);process.exit(1)});
