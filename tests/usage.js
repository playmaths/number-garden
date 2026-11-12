// Anonymous usage counts: one batched write per day to gardenUsage/{day} with only numbers; a device counts once a day; trails and flowers by door; the queue waits offline; the grown-ups screen reads the counts back.
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');const {fast,pause,done}=require('./lib');
(async()=>{
  const root=path.resolve(__dirname,'..');
  const srv=http.createServer((q,r)=>{const f=path.join(root,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':'text/javascript'});fs.createReadStream(f).pipe(r)});
  await new Promise(r=>srv.listen(8771,r));
  const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:420,height:860}});await fast(ctx);const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  const commits=[];const store={};
  await ctx.route('**/firestore.googleapis.com/**',route=>{const u=route.request().url();
    if(u.includes('documents:commit')){const b=JSON.parse(route.request().postData());commits.push(b);for(const w of b.writes){if(w.update){const d=w.update.name.split('/').pop();store[d]=store[d]||{day:d,families:[]}}if(w.transform){const d=store[w.transform.document.split('/').pop()];for(const t of w.transform.fieldTransforms){if(t.increment)d[t.fieldPath]=(d[t.fieldPath]||0)+Number(t.increment.integerValue);if(t.appendMissingElements)t.appendMissingElements.values.forEach(v=>{if(!d.families.includes(v.stringValue))d.families.push(v.stringValue)})}}}return route.fulfill({status:200,contentType:'application/json',body:'{"writeResults":[]}'})}
    if(u.includes('documents:runQuery')){const docs=Object.values(store).map(d=>({document:{name:'x/gardenUsage/'+d.day,fields:{day:{stringValue:d.day},devices:{integerValue:String(d.devices||0)},opens:{integerValue:String(d.opens||0)},starts:{integerValue:String(d.starts||0)},wins:{integerValue:String(d.wins||0)},families:{arrayValue:{values:d.families.map(f=>({stringValue:f}))}}}}}));return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(docs)})}
    return route.fulfill({status:404,contentType:'application/json',body:'{}'})});
  await pg.goto('http://localhost:8771/');const sk=pg.locator('#welcomeSkip');if(await sk.isVisible())await sk.click();await pause(pg,3200);
  const today=new Date();const day=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const d=()=>store[day]||{};
  if(!(d().devices===1&&d().opens>=1))errs.push('first open not counted: '+JSON.stringify(d()));
  if(!(commits[0]&&commits[0].writes[0].update&&commits[0].writes[0].updateMask.fieldPaths[0]==='day'&&commits[0].writes[1].transform))errs.push('write shape wrong: '+JSON.stringify(commits[0]).slice(0,200));
  if(JSON.stringify(commits).includes('"name"')===false)errs.push('no document name in write');
  // a trail from a door counts a start by door
  await pg.locator('.door',{hasText:'Add & take'}).click();await pause(pg,300);await pg.evaluate(()=>__ng().show('home'));await pause(pg,3200);
  if(!(d().starts===1&&d()['startsByLevel.add']===1))errs.push('trail start not counted: '+JSON.stringify(d()));
  // the queue drains and never touches the garden (S)
  const q=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2_usage')||'{}'));if(Object.keys(q.queue||{}).length)errs.push('queue not drained: '+JSON.stringify(q));
  const ng=await pg.evaluate(()=>localStorage.getItem('ng2'));if(/usage|queue/.test(ng))errs.push('usage leaked into the garden state');
  // reload the same day: opens grows, devices does not
  await pg.reload();await pause(pg,3200);if(!(d().devices===1&&d().opens>=2))errs.push('device counted twice: '+JSON.stringify(d()));
  // a family code is sent only as a hash
  await pg.evaluate(()=>document.getElementById('gearBtn').click());await pause(pg,300);await pg.locator('#family').fill('ABCD-2345');await pause(pg,600);await pg.locator('#closeSheet').click();await pg.locator('.door',{hasText:'Patterns'}).click();await pause(pg,300);await pause(pg,3200);
  if(!(d().families.length===1&&!JSON.stringify(commits).includes('ABCD-2345')))errs.push('family code not hashed: '+JSON.stringify(d().families)+' '+JSON.stringify(commits).includes('ABCD'));
  // a flower counts a win by door
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail.lit=[true,true,true,true,true];s.trail.i=4;localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pause(pg,500);await pg.evaluate(()=>__ng().finishTrail());await pause(pg,3200);
  if(!(d().wins===1&&d()['winsByLevel.pat']===1))errs.push('flower not counted: '+JSON.stringify(d()));
  // offline: counts wait, then flush when back
  await ctx.setOffline(true);await pg.evaluate(()=>__ng().show('home'));await pg.locator('.door',{hasText:'Puzzles'}).click();await pause(pg,300);await pause(pg,3200);
  const q2=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2_usage')));if(!(q2.queue[day]&&q2.queue[day].starts===1))errs.push('offline count not queued: '+JSON.stringify(q2));
  const before=d().starts;await ctx.setOffline(false);await pg.evaluate(()=>window.dispatchEvent(new Event('online')));await pause(pg,3200);
  if(d().starts!==before+1)errs.push('queued count not flushed: '+before+' -> '+d().starts);
  // the grown-ups screen reads the counts back
  await pg.evaluate(()=>__ng().show('home'));await pg.evaluate(()=>document.getElementById('gearBtn').click());await pause(pg,800);const txt=await pg.locator('#usageList').innerText();if(!/device-days/.test(txt)||!txt.includes(day))errs.push('grown-ups usage line missing: '+txt.slice(0,120));
  await br.close();srv.close();done('usage',errs)})();
