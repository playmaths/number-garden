// the weekly letter: built from a week of wins, idea reads and own words; empty-week wording; the copy button
const {open,go,stars,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  /* an empty week */
  await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('ng2',JSON.stringify({stars:0,m:{},book:[],counts:{},days:[],badges:{},flowers:[]}))});await pg.reload();await pg.locator('#gearBtn').click();await pg.getByRole('button',{name:"This week's letter"}).click();
  if(!await pg.locator('#letter').isVisible())errs.push('letter view not shown');const empty=await pg.locator('#letterBox').innerText();if(!/did not play this week/.test(empty))errs.push('empty week wording: '+empty.slice(0,80));if(!/table/.test(empty))errs.push('no table talk on an empty week');
  await pg.locator('#letterBack').click();if(!await pg.locator('#sheet').isVisible())errs.push('back did not return to the grown-ups sheet');
  /* a real win writes the log */
  await go(pg,'make',1,'warm');await guess(pg);const a=await pg.evaluate(()=>__ng().ctx.help.answer);await pg.locator('#controls .num',{hasText:new RegExp('^'+a+'$')}).click();await gate(pg);
  const log=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).log);if(!log||log[log.length-1].s!=='make')errs.push('win did not log: '+JSON.stringify(log));
  /* a built week */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));const now=Date.now(),d=864e5;s.log=[{d:now-d,s:'bar',h:0,lv:1},{d:now-d,s:'bar',h:0,lv:1},{d:now-2*d,s:'bar',h:0,lv:2},{d:now-2*d,s:'think',h:0,lv:1},{d:now-3*d,s:'rewind',h:2,lv:1},{d:now-3*d,s:'rewind',h:1,lv:1},{d:now-1*d,idea:'bars'},{d:now-20*d,s:'coins',h:0,lv:1}];s.said=[{t:'I knew because 4 and 3 is 7',skill:'bar',d:now-d},{t:'old words',skill:'bar',d:now-20*d}];s.book=[{t:'Sprout moved up in Draw the bar. Now a part is hidden.',d:now-2*d,big:true}];s.flowers=[{room:'story',day:Math.floor((now-d)/d)},{room:'puz',day:Math.floor((now-30*d)/d)}];s.trail=null;localStorage.setItem('ng2',JSON.stringify(s))});await pg.reload();
  await pg.locator('#gearBtn').click();await pg.getByRole('button',{name:"This week's letter"}).click();const t=await pg.locator('#letterBox').innerText();
  for(const re of [/played on three days/,/solved 6 problems/,/grew one flower/,/1 of the problems were think problems/,/I knew because 4 and 3 is 7/,/moved up in Draw the bar/,/Solid right now: Draw the bar \(3 of 3/,/Worth doing together: Rewind it \(clues on 2 of 2\)/,/Big Ideas read: Bars that tell a story/,/what do we know, and what do we want/]){if(!re.test(t))errs.push(`letter missing ${re}`)}
  if(/old words/.test(t))errs.push('letter included words older than a week');if(/Make the money/.test(t))errs.push('letter included a game from three weeks ago');
  const plain=await pg.locator('#letterPlain').inputValue();if(!/week in the Number Garden/.test(plain))errs.push('plain text not filled');
  await pg.getByRole('button',{name:'Copy the letter'}).click();await pg.waitForTimeout(100);const label=await pg.locator('#copyLetter').innerText();if(!/Copied|Select and copy/.test(label))errs.push('copy button did nothing: '+label);
  console.log('letter checked');done('solve-letter',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
