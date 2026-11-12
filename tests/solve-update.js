// a newer build online reloads the page on the home screen, never mid-problem; the same build does nothing
const {open,go,pause}=require('./lib');const {done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const stamp=await pg.evaluate(()=>document.documentElement.outerHTML.match(/APP_BUILD='([0-9a-f]+)'/)[1]);if(!/^[0-9a-f]{12}$/.test(stamp))errs.push('no build stamp in the page: '+stamp);
  let served=stamp;await pg.addInitScript(()=>{window.__versionUrl='https://garden.test/version.txt'});await pg.route('https://garden.test/version.txt',r=>r.fulfill({status:200,contentType:'text/plain',body:served+'\n'}));
  await pg.evaluate(()=>{localStorage.setItem('ng2',JSON.stringify({stars:1,m:{},book:[],counts:{},days:[],badges:{},flowers:[],welcomed:true}))});await pg.reload();await pause(pg,3500);
  await pg.evaluate(()=>{window.__marker=1});await pg.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await pause(pg,600);
  if(!await pg.evaluate(()=>window.__marker))errs.push('the same build reloaded the page');
  /* a newer build appears while she is mid-problem: no reload until the home screen */
  await go(pg,'dots',1,'warm');await pg.evaluate(()=>{window.__marker=1});served='ffffffffffff';await pg.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await pause(pg,600);
  if(!await pg.evaluate(()=>window.__marker))errs.push('a new build reloaded the page mid-problem');if(!await pg.evaluate(()=>window.__newBuild))errs.push('the new build was not noticed');
  await pg.locator('.back').first().click();await pause(pg,1200);
  if(await pg.evaluate(()=>window.__marker).catch(()=>null))errs.push('the page did not reload on the home screen after a new build');
  console.log('update checked');done('solve-update',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
