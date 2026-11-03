// the garden over time: flower kinds mix, bushes and a tree appear, visitors arrive at milestones, the done screen waters and grows the flower, and Pip hovers on a streak
const {open,done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const setFlowers=async(n,streak)=>{await pg.evaluate(([n,streak])=>{const s=JSON.parse(localStorage.getItem('ng2'))||{stars:0,m:{},book:[],flowers:[],counts:{},days:[]};s.flowers=Array.from({length:n},(_,i)=>({room:['warm','add','puz','story'][i%4],day:20700+i}));s.streakNow=streak||0;s.bestStreak=streak||0;localStorage.setItem('ng2',JSON.stringify(s))},[n,streak]);await pg.reload();await pg.waitForTimeout(100)};
  const count=sel=>pg.locator('#gardenSvg '+sel).count();
  await setFlowers(3);if(await count('text.visitor'))errs.push('visitor before 5 flowers');if(!/three flowers/.test(await pg.locator('#sign').innerText()))errs.push('sign at 3: '+await pg.locator('#sign').innerText());
  await setFlowers(5);if(await count('text.visitor')!==1)errs.push('no butterfly at 5 flowers');if(!/butterfly/.test(await pg.locator('#sign').innerText()))errs.push('sign at 5: '+await pg.locator('#sign').innerText());
  await setFlowers(9);const petalKinds=await pg.evaluate(()=>{const svg=document.querySelector('#gardenSvg');return{sun:svg.querySelectorAll('circle[fill="#6b4f1d"]').length,bush:svg.querySelectorAll('circle[fill="#4cae7c"]').length}});if(!petalKinds.sun)errs.push('no sunflower kind among 9 flowers');if(!petalKinds.bush)errs.push('no bush at 9 flowers');
  await setFlowers(20);if(!/tree has sprouted/.test(await pg.locator('#sign').innerText()))errs.push('sign at 20: '+await pg.locator('#sign').innerText());if(!await count('path[stroke="#6b4f1d"]'))errs.push('no tree trunk at 20');
  await setFlowers(70);if(await count('text.visitor')<3)errs.push('fewer than 3 visitors at 70');
  await setFlowers(4,3);if(!await pg.locator('#homeBug.hover').count())errs.push('Pip does not hover on a streak of 3');await setFlowers(4,0);if(await pg.locator('#homeBug.hover').count())errs.push('Pip hovers without a streak');
  /* the done screen: finishing a trail waters and grows the flower; the fifth flower announces the butterfly */
  await setFlowers(4);await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.trail={door:'warm',steps:['dots','dots','dots','dots','dots'],i:4,lit:[1,1,1,1,0]};s.skill='dots';s.m.dots={lv:1,streak:0,low:0};s.taught={'dots:1':1};localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pg.waitForTimeout(100);
  await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(200);await pg.getByRole('button',{name:'Plant the flower'}).click();await pg.waitForTimeout(300);
  if(!await pg.locator('#bigflower .water').count())errs.push('no watering can on the done screen');if(!await pg.locator('#bigflower .sprout').count())errs.push('no sprouting flower on the done screen');
  if(!/butterfly/.test(await pg.locator('#doneTitle').innerText()))errs.push('done title at the fifth flower: '+await pg.locator('#doneTitle').innerText());
  const b=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).book.slice(0,3).map(x=>x.t).join(' / '));if(!/butterfly/.test(b))errs.push('milestone not in the book: '+b);
  console.log('garden checked');done('solve-garden',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
