/* ================= more PUZZLES ================= */
skill({id:'sort2',room:'puz',title:'Sort by two things',idea:'evenodd',levels:3,mount(lv){
  /* a two-way grid. The ladybug sorts the first one out loud as the example; then she sorts four, and every miss names the question she skipped */
  const cols=[['var(--accent)','red'],['var(--sky)','blue']];let rowsA,colsA,items,drawIt,describe;
  if(lv===1){rowsA=['big','small'];colsA=['red','blue'];items=shuffle([[0,0],[0,1],[1,0],[1,1]]);drawIt=([r,c],big)=>{const e=svgShape('circle',cols[c][0]);e.style.width=e.style.height=(r===0?44:24)*(big?1.6:1)+'px';return e};describe=([r,c])=>`It is <b>${rowsA[r]}</b> and it is <b>${colsA[c]}</b>.`}
  else if(lv===2){rowsA=['circle','square'];colsA=['red','blue'];items=shuffle([[0,0],[0,1],[1,0],[1,1]]);drawIt=([r,c],big)=>{const e=svgShape(r===0?'circle':'square',cols[c][0]);if(big)e.style.width=e.style.height='64px';return e};describe=([r,c])=>`It is a <b>${rowsA[r]}</b> and it is <b>${colsA[c]}</b>.`}
  else{rowsA=['odd','even'];colsA=['less than 10','10 or more'];const nums=shuffle([rnd(1,9)|1,rnd(1,4)*2,rnd(5,9)*2+1,rnd(5,9)*2]).slice(0,4);items=nums.map(v=>[v%2?0:1,v<10?0:1,v]);drawIt=(it,big)=>{const e=el('b','',it[2]);e.style.fontSize=big?'2.4rem':'1.4rem';return e};describe=it=>`${it[2]} is <b>${rowsA[it[0]]}</b> and it is <b>${colsA[it[1]]}</b>.`}
  const example=items.pop(); // Pip takes one of the four combinations as her example; she sorts the other three, so every box ends with exactly one
  prompt.textContent='Sort them into the boxes.';
  const card=el('div','story');card.style.cssText='display:flex;align-items:center;gap:14px;max-width:none';const pic=el('div'),txt=el('div');card.append(pic,txt);
  const grid=el('div','sud');grid.style.cssText='grid-template-columns:auto 1fr 1fr;background:var(--card);border:3px solid var(--fg)';
  const hdr=(t,color)=>{const c=el('div','sq given',t);c.style.cssText=`width:auto;min-width:76px;min-height:48px;font-size:1rem;padding:4px 8px;${color?`color:${color};`:''}`;return c};
  grid.appendChild(hdr(''));colsA.forEach((c,ci)=>grid.appendChild(hdr(c,lv<3?cols[ci][0]:'')));const zones=[];
  rowsA.forEach((r,ri)=>{grid.appendChild(hdr(r));colsA.forEach((c,ci)=>{const z=el('button','sq');z.style.cssText='width:auto;min-width:76px;min-height:64px;border:3px dashed var(--line);background:var(--bg);display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-items:center';z.r=ri;z.c=ci;zones.push(z);grid.appendChild(z)})});
  stage.append(card,grid);let i=-1;
  const zoneOf=it=>zones.find(z=>z.r===it[0]&&z.c===it[1]);
  const showItem=(it,text)=>{pic.innerHTML='';pic.appendChild(drawIt(it,true));txt.innerHTML=text};
  const next=()=>{i++;if(i>=items.length)return;showItem(items[i],`Which box? Ask two things: <b>${rowsA[0]} or ${rowsA[1]}</b>? <b>${colsA[0]} or ${colsA[1]}</b>?`)};
  /* the ladybug does the first one */
  showItem(example,`Watch me. ${describe(example)} So it goes in the <b>${rowsA[example[0]]}</b> row, <b>${colsA[example[1]]}</b> column.`);
  const ez=zoneOf(example);setTimeout(()=>{if(ctx.done||!ez.isConnected)return;ez.style.outline='4px solid var(--sun)';const e=drawIt(example);e.classList.add('shown');ez.appendChild(e);
    const r=el('div','row');const b=el('button','btn','My turn');b.onclick=()=>{r.remove();ez.style.outline='';next()};r.appendChild(b);controls.insertBefore(r,controls.firstChild)},1200); // the example stays until she taps, so she can look as long as she likes
  help({book:`sorted things by two rules at once`,clues:[`Ask two questions about it: ${rowsA[0]} or ${rowsA[1]}? That picks the row. ${colsA[0]} or ${colsA[1]}? That picks the column.`,i>=0&&i<items.length?describe(items[i]).replace(/<\/?b>/g,''):`Find the row first, then slide along to the column.`],why:`Each box answers two questions at once: the row and the column.`,show:()=>{items.slice(Math.max(i,0)).forEach(it=>{const e=drawIt(it);e.classList.add('shown');zoneOf(it).appendChild(e)});pic.innerHTML='';txt.innerHTML='Here is where each one goes. The dashed ones are the ones Pip placed.';i=items.length}});
  zones.forEach(z=>z.onclick=()=>{if(ctx.done||i<0||i>=items.length)return;const it=items[i];
    if(z.r===it[0]&&z.c===it[1]){z.appendChild(drawIt(it));if(i>=items.length-1){i++;txt.innerHTML='All sorted!';win(`${cheer()} All sorted, every one by both rules.`)}else{say('Yes!',true);next()}}
    else miss(z.r!==it[0]?`Look at the row. Is it ${rowsA[it[0]]} or ${rowsA[(it[0]+1)%2]}?`:`Right row! Now the column: is it ${colsA[it[1]]} or ${colsA[(it[1]+1)%2]}?`)})}});

skill({id:'ifthen',room:'puz',title:'If this, then that',idea:'rules',levels:3,mount(lv){
  const cols=[['var(--accent)','red'],['var(--sky)','blue'],['var(--leaf)','green']];
  if(lv<3){const rules=lv===1?[{t:'If it is red, put it in the box.',f:it=>it.c===0}]:[{t:'If it is red, put it in the box.',f:it=>it.c===0},{t:'If it is a star, put it in the box too.',f:it=>it.s==='star'}];
    const sh=['circle','square','star'];const items=shuffle(Array.from({length:4},()=>({s:pick(sh),c:rnd(0,2)})));if(!items.some(it=>rules.some(r=>r.f(it))))items[0]={s:'star',c:0};if(items.every(it=>rules.some(r=>r.f(it))))items[1]={s:'circle',c:1};
    prompt.textContent='Follow the rule.';const box=el('div','story',rules.map(r=>`<b>${r.t}</b>`).join('<br>')+'<br>If not, leave it out.');const show=el('div','hint','');const tray=el('div','tray');stage.append(box,show,tray);let i=0;
    const inBox=it=>rules.some(r=>r.f(it));const draw=it=>svgShape(it.s,cols[it.c][0]);
    const next=()=>{show.innerHTML='';show.appendChild(draw(items[i]))};next();
    help({book:`followed ${lv===1?'a rule':'two rules'} to sort shapes`,clues:[`Read the rule out loud. Then look at the shape: does it match?`,lv===1?`Only the color matters here. Red goes in, anything else stays out.`:`Two ways in: red, or a star. Blue circles and green squares stay out.`],why:`Check each shape against the rule${lv===2?'s':''}: in if it matches, out if not.`});
    const ch=choices(['In the box','Leave it out'],(o,b)=>{if(ctx.done||i>=items.length)return;const it=items[i];const want=inBox(it);if((o==='In the box')===want){if(want)tray.appendChild(draw(it));i++;if(i>=items.length){lock(ch);win(`${cheer()} Every shape went the right way.`)}else{say('Yes!',true);next()}}
      else miss(want?`It is ${cols[it.c][1]}${it.s==='star'?' and a star':''}. Does the rule say that goes in?`:`It is a ${cols[it.c][1]} ${it.s}. The rule says ${rules.map(r=>r.t.replace('If it is ','').replace(' too','').replace(', put it in the box.','')).join(' or ')} goes in. Does it match?`)});controls.appendChild(ch)}
  else{const rules=pick([[{t:'If it is even, cut it in half.',f:x=>x/2,ok:x=>x%2===0},{t:'If it is odd, add 1.',f:x=>x+1}],[{t:'If it is bigger than 10, take away 10.',f:x=>x-10,ok:x=>x>10},{t:'If not, double it.',f:x=>x*2}],[{t:'If it ends in 0, add 5.',f:x=>x+5,ok:x=>x%10===0},{t:'If not, add 10.',f:x=>x+10}]]);
    const x=pick([3,4,6,7,8,9,10,12,14,15,20]);const which=rules[0].ok(x)?0:1;const ans=rules[which].f(x);
    prompt.textContent=`The number is ${x}. What comes out?`;stage.appendChild(el('div','story',rules.map(r=>`<b>${r.t}</b>`).join('<br>')));
    help({book:`ran the number ${x} through an if-then rule and got ${ans}`,clues:[`First decide: does ${x} fit the first rule? ${rules[0].ok(x)?'Yes, so use the first line.':'No, so use the second line.'}`,`${rules[which].t} So do that to ${x}.`],answer:ans,why:`${x}: ${rules[which].t.toLowerCase()} That makes ${ans}.`});
    controls.appendChild(numpad((v,nm)=>{if(v===ans){lock(nm);win(`${cheer()} ${ctx.help.why}`)}else miss(ctx.hints===0?`Which line is for ${x}? Check the first rule: is it true for ${x}?`:`${rules[which].t} Do that to ${x}.`)},2))}}});

