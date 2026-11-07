/* ================= PATTERNS ================= */
skill({id:'cont',room:'pat',title:'What comes next?',idea:'skip',levels:3,mount(lv){
  prompt.textContent='What comes next?';const seq=el('div','seq');
  if(lv===1){const cols=['var(--accent)','var(--leaf)','var(--sky)','var(--plum)'],sh=Object.keys(shapes);const core=pick([2,3]);const units=[];for(let i=0;i<core;i++){let u;do{u={s:pick(sh),c:pick(cols)}}while(units.some(x=>x.s===u.s&&x.c===u.c));units.push(u)}
    const rule=pick(['AB','ABB','ABC'].filter(r=>new Set(r).size===core));const seqUnits=[];for(let i=0;i<7;i++)seqUnits.push(units[rule.charCodeAt(i%rule.length)-65]);
    seqUnits.slice(0,6).forEach(u=>{const it=el('div','it');it.appendChild(svgShape(u.s,u.c));seq.appendChild(it)});seq.appendChild(el('div','it q','?'));stage.appendChild(seq);
    const ans=seqUnits[6];
    help({book:`spotted a ${rule.split('').join(' ')} pattern`,clues:['Say the pattern out loud from the start. What repeats?',`It repeats every ${rule.length}. Look back ${rule.length} places.`],why:`The pattern is ${rule.split('').join(' ')}, over and over, so the next one is the same as the one ${rule.length} back.`,show:()=>{const q=seq.querySelector('.q');q.textContent='';q.appendChild(svgShape(ans.s,ans.c))}});
    const opts=shuffle(units.concat(units.length<3?[{s:pick(sh.filter(s=>!units.some(u=>u.s===s))),c:pick(cols)}]:[])).map(u=>({u,node:svgShape(u.s,u.c)}));
    const c=choices(opts,(o,b)=>{if(o.u===ans){b.classList.add('hit');lock(c);win(`${cheer()} The pattern is ${rule.split('').join(' ')}, over and over.`)}else{b.classList.add('miss');b.disabled=true;miss('Say the pattern out loud from the start. What repeats?')}});controls.appendChild(c)}
  else{let start,d,terms=[];if(lv===2){d=pick([2,5,10]);start=d===10?rnd(1,9)*(pick([1,10])):rnd(1,20);for(let i=0;i<5;i++)terms.push(start+i*d)}
    else{const kind=pick(['grow','double']);if(kind==='grow'){start=rnd(1,5);let t=start,step=rnd(1,3);for(let i=0;i<5;i++){terms.push(t);t+=step;step++}}else{start=rnd(1,3);for(let i=0;i<5;i++)terms.push(start*Math.pow(2,i))}}
    terms.slice(0,4).forEach(t=>seq.appendChild(el('div','it',t)));seq.appendChild(el('div','it q','?'));const ans=terms[4];
    const jumps=terms.slice(1).map((t,i)=>t-terms[i]);
    const jr=el('div','jumps');jumps.slice(0,3).forEach(j=>jr.appendChild(el('span','',`+${j}`)));jr.appendChild(el('span','q','+?'));const col=el('div','ta');col.style.gap='8px';col.append(seq,jr);stage.appendChild(col); // the jumps are the pattern, so they are drawn, not hidden
    help({book:`saw that ${terms.slice(0,4).join(', ')} goes on to ${ans}`,clues:['How much does it jump from one number to the next? Check two next to each other.',lv===2?`It goes up by ${d} every time.`:`The jumps are ${jumps.slice(0,3).join(', ')}. What jump comes next?`],answer:ans,why:lv===2?`Each jump is ${d}: ${terms[3]} + ${d} = ${ans}.`:`The jumps go ${jumps.join(', ')}, so ${terms[3]} + ${jumps[3]} = ${ans}.`,show:()=>{seq.querySelector('.q').textContent=ans}});
    if(lv===2){const opts=shuffle([ans,ans+d,ans-1,ans+1].filter((v,i,a)=>a.indexOf(v)===i));const c=choices(opts,(o,b)=>{if(o===ans){b.classList.add('hit');lock(c);win(`${cheer()} It goes up by ${d} each time.`)}else{b.classList.add('miss');b.disabled=true;miss(ctx.hints===0?'How much does it go up each time? Check two numbers next to each other.':`It goes up by ${d}. What is ${terms[3]} + ${d}?`)}});controls.appendChild(c)}
    else controls.appendChild(numpad((v,nm)=>{if(v===ans){lock(nm);win(`${cheer()} ${terms[3]} to ${ans}. Did you see how the jumps change?`)}else miss(ctx.hints===0?'Write down how much it jumps each time. Do the jumps change?':`The jumps are ${terms.slice(1).map((t,i)=>t-terms[i]).slice(0,3).join(', ')}... what's the next jump?`)},3))}}});

skill({id:'machine',room:'pat',title:'Rule machine',idea:'rules',levels:3,mount(lv){
  const rules=lv===1?[1,2,3,4,5].map(n=>({t:'adds '+n,f:x=>x+n})):[1,2,3,4,5].map(n=>({t:'adds '+n,f:x=>x+n})).concat([1,2,3].map(n=>({t:'takes away '+n,f:x=>x-n})),[{t:'doubles it',f:x=>x*2}]);
  const rule=pick(rules);const ins=shuffle((lv===1?[1,2,3,4,5,6,7,8]:[2,3,4,5,6,7,8,9,10]).filter(x=>rule.f(x)>=1)).slice(0,lv===3?2:3); // never let a take-away machine drop below 1
  const m=el('div','machine');m.appendChild(el('div','io head','<span>in</span><span></span><span>out</span>'));ins.forEach(x=>m.appendChild(el('div','io',`<span>${x}</span><span>→</span><span>${rule.f(x)}</span>`)));
  stage.appendChild(el('div','hint','A number goes in the top and comes out changed. The machine does the same thing to every number.'));
  const q3=pick([11,12,13,14,15,20]);
  help({book:`figured out a rule machine: it ${rule.t}`,clues:[`Look at the first row: ${ins[0]} went in and ${rule.f(ins[0])} came out. Did it get bigger or smaller? By how much?`,`Try the same idea on the second row. Does it work there too?`],answer:lv<3?`it ${rule.t}`:rule.f(q3),why:lv<3?`The machine ${rule.t}, every time.`:`The machine ${rule.t}, so ${q3} becomes ${rule.f(q3)}.`,show:()=>{const mb=m.querySelector('.mbox');if(mb)mb.textContent=rule.t;const qq=m.querySelector('.q');if(qq)qq.textContent=rule.f(q3)}});
  if(lv<3){m.appendChild(el('div','mbox','rule?'));prompt.textContent='What is the machine doing?';stage.appendChild(m);
    const opts=shuffle(rules).slice(0,4);if(!opts.includes(rule))opts[rnd(0,3)]=rule;
    const c=choices(opts.map(r=>r.t),(o,b)=>{if(o===rule.t){b.classList.add('hit');lock(c);win(`${cheer()} The machine ${rule.t}, every time.`)}else{b.classList.add('miss');b.disabled=true;miss(ctx.hints===0?`Try that on the first row: ${ins[0]} goes in. Would ${rule.f(ins[0])} come out?`:`Look at ${ins[0]} → ${rule.f(ins[0])}. What happened to it?`)}});controls.appendChild(c)}
  else{const q=q3;m.appendChild(el('div','io',`<span>${q}</span><span>→</span><span class="q" style="color:var(--accent)">?</span>`));prompt.textContent='What does the machine do? Then finish the last row.';stage.appendChild(m);
    controls.appendChild(numpad((v,nm)=>{if(v===rule.f(q)){lock(nm);win(`${cheer()} The machine ${rule.t}, so ${q} becomes ${rule.f(q)}.`)}else miss(ctx.hints===0?'First find what the machine does from the top rows. Then do that to the last number.':`The machine ${rule.t}. Do that to ${q}.`)},3))}}});

