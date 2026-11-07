// children on one device: add a child, switch between gardens, each keeps its own stars and name, remove a sleeping child
const {open,done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('ng2',JSON.stringify({stars:7,name:'Ada',m:{},book:[],flowers:[{room:'warm',day:20700}],counts:{},days:[],badges:{}}))});await pg.reload();
  if(await pg.locator('#who').isVisible())errs.push('switcher shown with one child');
  await pg.locator('#gearBtn').click();if(!/Ada/.test(await pg.locator('#kidList').innerText()))errs.push('kid list lacks the first child: '+await pg.locator('#kidList').innerText());
  await pg.locator('#newKid').fill('Bo');await pg.getByRole('button',{name:'Add a child'}).click();await pg.waitForTimeout(400);
  const s2=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')));if(s2.name!=='Bo'||s2.stars)errs.push('new child did not get a fresh garden: '+JSON.stringify({name:s2.name,stars:s2.stars}));
  if(!await pg.locator('#who').isVisible())errs.push('switcher hidden with two children');const chips=await pg.locator('#who .chip').allInnerTexts();if(chips.join(',')!=='Ada,Bo')errs.push('chips: '+chips);if(!/Bo/.test(await pg.locator('#who .chip.on').innerText()))errs.push('active chip is not Bo');
  if(!/Welcome to your garden, Bo/.test(await pg.locator('#greet').innerText()))errs.push('greeting for the new child: '+await pg.locator('#greet').innerText().then(t=>t.slice(0,60)));
  await pg.locator('#who .chip',{hasText:'Ada'}).click();await pg.waitForTimeout(400);const s3=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')));if(s3.name!=='Ada'||s3.stars!==7)errs.push('switching back lost Ada\'s garden: '+JSON.stringify({name:s3.name,stars:s3.stars}));
  const sleeping=await pg.evaluate(()=>{const p=JSON.parse(localStorage.getItem('ng2_profiles'));const other=p.list.find(x=>x.id!==p.active);return JSON.parse(localStorage.getItem('ng2_'+other.id))});if(!sleeping||sleeping.name!=='Bo')errs.push('Bo\'s garden not kept while asleep');
  await pg.locator('#gearBtn').click();pg.once('dialog',d=>d.accept());await pg.locator('#kidList .chip',{hasText:'Bo'}).locator('.x').click();await pg.waitForTimeout(200);const list=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2_profiles')).list.length);if(list!==1)errs.push('remove did not drop Bo');
  console.log('profiles checked');done('solve-profiles',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
