// observations from ordinary play: a new level tried before the lesson (clean, slip, Show me how), the first problem after five days away, the grown-ups' panel and the letter line, and the switch
const {open,stars,msg,done,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const seed=async(extra)=>{await pg.evaluate(extra=>{const day=Math.floor(Date.now()/864e5);const s=Object.assign({stars:0,m:{friends:{lv:1,streak:0,low:0}},book:[],flowers:[],counts:{},days:[],badges:{},welcomed:true,cold:true,taught:{},skill:'friends',trail:{door:'warm',steps:['friends','friends','friends','friends','friends'],i:0,lit:[0,0,0,0,0]}},extra||{});if(s.lastGap){s.last={friends:day-s.lastGap};delete s.lastGap}localStorage.setItem('ng2',JSON.stringify(s))},extra);await pg.reload();await pause(pg,300)};
  const st=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')));const ans=()=>pg.evaluate(()=>__ng().ctx.help.answer);
  const tap=async v=>{await pg.locator('#controls .num',{hasText:new RegExp('^'+v+'$')}).click();await pause(pg,200)};
  /* 1. a new level: one go before the lesson, no clues */
  await seed();if(/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push('the lesson came before the first try');
  if(!await pg.getByRole('button',{name:'Show me how'}).count())errs.push('no Show me how on a first try');if(await pg.getByRole('button',{name:'Clue'}).count())errs.push('a first try offers a clue');
  if(!/new/.test(await msg(pg)))errs.push('Pip did not say this one is new: '+await msg(pg));
  let before=await stars(pg);await tap(await ans());await gate(pg);let s=await st();
  if(!s.obs||s.obs.cold.length!==1||s.obs.cold[0].r!=='clean'||!s.obs.cold[0].first||s.obs.cold[0].s!=='friends')errs.push('clean first try not recorded: '+JSON.stringify(s.obs));
  if(!s.taught['friends:1'])errs.push('a solved first try should count as taught');if((await stars(pg))!==before+1)errs.push('a solved first try gave no star');
  await pg.getByRole('button',{name:'Next stone'}).click();await pause(pg,300);if(/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push('the lesson ran after a clean first try');if(!await pg.getByRole('button',{name:'Clue'}).count())errs.push('the second problem has no clue button');
  /* 2. a slip on the first try: no museum entry, Pip teaches, then a fresh problem with clues */
  await seed();const a=await ans();await tap(a===10?9:a+1);if(!/Good try/.test(await msg(pg)))errs.push('slip on a first try: '+await msg(pg));await pause(pg,1800);
  if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push('no lesson after a slip on the first try');s=await st();
  if(s.obs.cold[0].r!=='slip')errs.push('slip not recorded: '+JSON.stringify(s.obs.cold));if((s.misses||[]).length)errs.push('a first-try slip went into the museum');if(s.stars)errs.push('a slip gave a star');
  await pg.getByRole('button',{name:'My turn'}).click();await pause(pg,300);if(!await pg.getByRole('button',{name:'Clue'}).count())errs.push('after the lesson the problem has no clue button');if(await pg.getByRole('button',{name:'Show me how'}).count())errs.push('still a first try after the lesson');
  /* 3. Show me how */
  await seed();await pg.getByRole('button',{name:'Show me how'}).click();await pause(pg,300);if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push('Show me how did not start the lesson');s=await st();if(s.obs.cold[0].r!=='watch')errs.push('watch not recorded');
  /* 4. coming back after six days: clean, then with a clue */
  await seed({taught:{'friends:1':1},counts:{friends:3},lastGap:6});await tap(await ans());await gate(pg);s=await st();if(!s.obs||!s.obs.back||s.obs.back[0].r!=='clean'||s.obs.back[0].gap!==6)errs.push('coming back clean not recorded: '+JSON.stringify(s.obs));if(s.obs.cold&&s.obs.cold.length)errs.push('a taught level was treated as a first try');
  await seed({taught:{'friends:1':1},counts:{friends:3},lastGap:9});await pg.getByRole('button',{name:'Clue'}).click();await tap(await ans());await gate(pg);s=await st();if(s.obs.back[0].r!=='helped')errs.push('coming back with a clue not recorded as helped: '+JSON.stringify(s.obs.back));
  await seed({taught:{'friends:1':1},counts:{friends:3},lastGap:2});await tap(await ans());await gate(pg);s=await st();if(s.obs&&s.obs.back&&s.obs.back.length)errs.push('two days away was noted as coming back');
  /* 5. the grown-ups' panel, the letter and the switch */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));const now=Date.now();s.trail=null;s.m.make={lv:2,streak:0,low:0};s.obs={cold:[{d:now-1e6,s:'friends',lv:1,r:'clean',first:true,kin:['make']},{d:now-2e6,s:'take',lv:2,r:'slip',first:false,kin:[]},{d:now-3e6,s:'bridge',lv:2,r:'watch',first:false,kin:[]},{d:now-4e6,s:'dots',lv:2,r:'clean',first:false,kin:[]}],back:[{d:now-5e6,s:'coins',lv:1,gap:7,r:'clean'},{d:now-6e6,s:'cont',lv:1,gap:5,r:'helped'}]};localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pause(pg,300);
  await pg.locator('#gearBtn').click();await pause(pg,200);const panel=await pg.locator('#papa').innerText();
  for(const re of [/A new level, tried before the lesson: 1 of 3 solved first go/,/1 slipped and then watched the lesson/,/1 asked Pip to show how/,/A new game, tried before the lesson: 1 of 1/,/Carrying an idea over: 1 of 1/,/Coming back after five days or more: 1 of 2/,/Ten friends, new game: solved it first go \(after Make 10\)/,/back after 7 days/,/not a test/])if(!re.test(panel))errs.push('panel missing '+re);
  if(!await pg.locator('#coldOn').isChecked())errs.push('the try-first switch is not on');
  await pg.getByRole('button',{name:"This week's letter"}).click();await pause(pg,200);const letter=await pg.locator('#letterBox').innerText();if(!/Meeting new things: 2 of 4 new levels or games solved on the first go/.test(letter)||!/1 of 2 first problems were clean/.test(letter))errs.push('letter line missing: '+letter.slice(0,400));
  await pg.locator('#letterBack').click();await pg.locator('#coldOn').uncheck();await pause(pg,100);if((await st()).cold!==false)errs.push('the switch did not turn try-first off');
  /* the maker games are left out: no try-first step there, and coming back is not noted */
  await seed({skill:'hide',m:{hide:{lv:1,streak:0,low:0}},trail:{door:'make',steps:['hide','hide','hide','hide','hide'],i:0,lit:[0,0,0,0,0]}});if(await pg.evaluate(()=>!!__ng().ctx.cold)||await pg.getByRole('button',{name:'Show me how'}).count())errs.push('a maker game got a try-first step');
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.taught={'hide:1':1};s.counts={hide:2};s.last={hide:Math.floor(Date.now()/864e5)-8};localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();await pause(pg,300);if(await pg.evaluate(()=>__ng().ctx.back))errs.push('a maker game was marked as coming back');
  /* 6. off: the lesson comes first, as before */
  await seed({cold:false});if(!/Watch first/.test(await pg.locator('#prompt').innerText()))errs.push('with try-first off the lesson should come first');
  console.log('observations checked');done('solve-observe',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
