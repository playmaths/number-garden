// Ten friends at every level, clean and with a miss first: the frame's empties (pad) at level 1, the partner from a row of choices at level 2 (frame shown or pictured in the head with the think-first card), friends of 20 and a full ten plus a frame at level 3 (numpad); Show me on each
const {open,go,stars,msg,book,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const type=async(v)=>{for(const d of String(v))await pg.locator('#controls .num',{hasText:new RegExp('^'+d+'$')}).first().click();await pg.locator('#controls .go').click();await pg.waitForTimeout(120)};
  const ans=()=>pg.evaluate(()=>__ng().ctx.help.answer);
  const finish=async(tag,before)=>{await gate(pg);if((await stars(pg))!==before+1)errs.push(`${tag}: no star ("${await msg(pg)}")`);const b=await book(pg);if(!/ten friends|friends of 20|make 1\d/.test(b))errs.push(`${tag}: book line "${b}"`)};
  for(let k=0;k<6;k++){await go(pg,'friends',1,'warm');const before=await stars(pg);const a=await ans();const dots=await pg.locator('#stage .cell i:not(.empty)').count();if(dots+a!==10)errs.push(`friends lv1: ${dots} dots but friend ${a}`);
    if(k%2){await pg.locator('#controls .num',{hasText:new RegExp('^'+(a===10?9:a+1)+'$')}).click();if(!/empty squares|make 10/.test(await msg(pg)))errs.push('friends lv1: no structural hint on a miss: '+await msg(pg))}
    await pg.locator('#controls .num',{hasText:new RegExp('^'+a+'$')}).click();await pg.waitForTimeout(100);if(!await pg.locator('#stage .gate').count())errs.push('friends lv1: no why or another-way gate');await finish(`friends lv1 #${k}`,before);await pause(pg,450);if((await pg.locator('#stage .cell i.new').count())!==a)errs.push('friends lv1: the empties were not filled in the second colour')}
  let hiddenSeen=0,shownSeen=0;
  for(let k=0;k<10;k++){await go(pg,'friends',2,'warm');const before=await stars(pg);const a=await ans();const n=10-a;const hidden=!(await pg.locator('#stage .frame').count());if(hidden)hiddenSeen++;else shownSeen++;
    if(hidden){if(!await pg.locator('#stage .guess').count())errs.push('friends lv2: hidden frame but no think-first card');await guess(pg)}else if(await pg.locator('#stage .guess').count())errs.push('friends lv2: think-first card with the frame shown');
    if(await pg.locator('#stage .bignum').innerText()!==String(n))errs.push('friends lv2: the number card does not show '+n);
    const ch=pg.locator('#controls .choice');const texts=await ch.allInnerTexts();const idx=texts.indexOf(String(a));if(idx<0){errs.push(`friends lv2: friend ${a} not among ${texts}`);continue}if(texts.length!==4||new Set(texts).size!==4)errs.push(`friends lv2: choices ${texts}`);
    if(k%2){await ch.nth((idx+1)%texts.length).click();if(!(await msg(pg)).length)errs.push('friends lv2: no hint on a wrong friend')}
    await ch.nth(idx).click();await pg.waitForTimeout(100);await finish(`friends lv2 #${k}${hidden?' hidden':''}`,before);if(!await pg.locator('#stage .frame').count())errs.push('friends lv2: no frame revealed on the win')}
  if(!hiddenSeen||!shownSeen)errs.push(`friends lv2: hidden ${hiddenSeen}, shown ${shownSeen} in ten goes`);
  const kinds={};
  for(let k=0;k<10;k++){await go(pg,'friends',3,'warm');const before=await stars(pg);const a=await ans();const p=await pg.locator('#prompt').innerText();const kind=/make 20/.test(p)?'twenty':a===10?'ten':'three';kinds[kind]=(kinds[kind]||0)+1;
    if(kind==='twenty'){if(await pg.locator('#stage .frame').count()!==2)errs.push('friends lv3: friends of 20 without two frames');const dots=await pg.locator('#stage .cell i:not(.empty)').count();if(dots+a!==20)errs.push(`friends lv3: ${dots} dots but ${a} more make 20`)}
    else{if(!await pg.locator('#stage .rod').count()||await pg.locator('#stage .frame').count()!==1)errs.push(`friends lv3 ${kind}: expected a full ten and one frame`);if(!await pg.locator('#stage .eq .box').count())errs.push('friends lv3: no box in the sentence')}
    if(k%2){await type(a===10?3:a+1);if(!(await msg(pg)).length)errs.push('friends lv3: no hint on a miss')}
    await type(a);await finish(`friends lv3 #${k} ${kind}`,before)}
  if(!kinds.twenty||!(kinds.ten||kinds.three))errs.push('friends lv3: kinds seen '+JSON.stringify(kinds));
  for(const lv of [1,2,3]){await go(pg,'friends',lv,'warm');await pg.getByRole('button',{name:'Clue'}).click();if(!(await msg(pg)).length)errs.push(`friends lv${lv}: Clue said nothing`);await pg.getByRole('button',{name:'Show me'}).click();await pause(pg,1400);if(!/It's \d+/.test(await msg(pg)))errs.push(`friends lv${lv}: Show me said "${await msg(pg)}"`);if(lv<3&&!await pg.locator('#stage .cell i.new').count())errs.push(`friends lv${lv}: Show me did not fill the empties`)}
  console.log('friends played; lv2 hidden/shown',hiddenSeen,shownSeen,'lv3 kinds',kinds);done('solve-friends',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
