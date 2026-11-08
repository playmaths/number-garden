/* ================= TWO THINGS CHANGE ================= */
/* figure series where two or three things change at once, each on its own easy rule (the CogAT figure series, taught as a lesson). A figure is {s:shape, c:colour, n:how many, z:size, r:quarter turns};
   S2_ATTR reads, names and isolates one attribute, so a clue, a hint, Show me and the lesson can all paint one thing at a time: the whole trick of the game */
const S2_COL=[{v:'var(--accent)',t:'orange'},{v:'var(--leaf)',t:'green'},{v:'var(--sky)',t:'blue'},{v:'var(--plum)',t:'purple'},{v:'var(--sun)',t:'yellow'}];
const S2_SHAPE={circle:'circle',square:'square',tri:'triangle',star:'star',heart:'heart',diamond:'diamond',hex:'hexagon',cross:'cross'};
const S2_SIZE=['tiny','small','middle-sized','big','very big'],S2_DIR=['up','right','down','left'],S2_GREY='#9aa7a0';
const S2_POS={1:[[20,20]],2:[[11,20],[29,20]],3:[[20,9],[10,30],[30,30]],4:[[10,10],[30,10],[10,30],[30,30]],5:[[9,9],[31,9],[20,20],[9,31],[31,31]],6:[[9,10],[20,10],[31,10],[9,30],[20,30],[31,30]]};
const s2Path=(s,c)=>s==='arrow'?`<path d="M20 3L35 19H27V37H13V19H5z" fill="${c}"/>`:shapes[s](c);
/* one figure as a 40×40 svg: n copies of the shape, scaled by its size when it stands alone, turned a quarter r times */
function s2Fig(f){const col=typeof f.c==='string'?f.c:f.c.v,k=f.n>1?(f.n>4?.34:.42):[.4,.55,.7,.85,1][f.z];const e=el('div');
  e.innerHTML=`<svg class="shape" viewBox="0 0 40 40">${S2_POS[f.n].map(([x,y])=>`<g transform="translate(${x} ${y}) rotate(${f.r*90}) scale(${k}) translate(-20 -20)">${s2Path(f.s,col)}</g>`).join('')}</svg>`;return e.firstChild}
/* iso draws a figure with everything but one attribute covered in grey, so the child sees one pattern at a time */
const S2_ATTR={s:{t:'shape',name:f=>S2_SHAPE[f.s],iso:f=>({s:f.s,c:S2_GREY,n:1,z:4,r:0})},c:{t:'colour',name:f=>f.c.t,iso:f=>({s:'circle',c:f.c,n:1,z:4,r:0})},
  n:{t:'number',name:f=>String(f.n),iso:f=>({s:'circle',c:S2_GREY,n:f.n,z:4,r:0})},z:{t:'size',name:f=>S2_SIZE[f.z],iso:f=>({s:'circle',c:S2_GREY,n:1,z:f.z,r:0})},r:{t:'turn',name:f=>S2_DIR[f.r],iso:f=>({s:'arrow',c:S2_GREY,n:1,z:4,r:f.r})}};
const s2Eq=(a,b,k)=>k==='c'?a.c.v===b.c.v:a[k]===b[k],s2Plain=f=>({s:f.s,c:f.c.t,n:f.n,z:f.z,r:f.r});
/* a figure in words, naming only the attributes that change: "a blue square", "3 orange circles", "a big green circle", "an orange arrow pointing left" */
function s2Say(f,keys){const bits=[];if(keys.includes('z'))bits.push(S2_SIZE[f.z]);if(keys.includes('c'))bits.push(f.c.t);const sh=f.s==='arrow'?`arrow pointing ${S2_DIR[f.r]}`:S2_SHAPE[f.s]+(f.n>1?'s':'');const w=bits.concat(sh).join(' ');return f.n>1?`${f.n} ${w}`:(/^[aeiou]/.test(w)?'an ':'a ')+w}
/* the rules: a cycle repeats its units every p, a grow adds one each time, a turn goes a quarter round. Each knows its value along the row, a wrong value for a distractor and how to say itself */
const s2Cycle=(k,units)=>({k,p:units.length,at:i=>units[i%units.length],wrong:v=>pick(units.filter(u=>u!==v)),how:`it goes round and round, the same every ${units.length}`});
const s2Grow=k=>k==='n'?{k,at:i=>i+1,wrong:v=>pick([v-1,v+1]),how:'one more each time'}:{k,at:i=>i,wrong:v=>pick([v-1,v-2]),how:'bigger each time'};
const s2Turn={k:'r',at:i=>i%4,wrong:v=>pick([0,1,2,3].filter(x=>x!==v)),how:'it turns a quarter each time'};
/* level 1 two cycles of different lengths; level 2 one cycle and one grow; level 3 three at once, or a turn with a colour cycle */
function s2Make(lv){const shp=shuffle(Object.keys(S2_SHAPE)),col=shuffle(S2_COL),base={s:shp[0],c:col[0],n:1,z:4,r:0};let R,L=5,kind='';
  if(lv===1){const two=Math.random()<.5;R=[s2Cycle('s',shp.slice(0,two?2:3)),s2Cycle('c',col.slice(0,two?3:2))]}
  else if(lv===2){kind=pick(['count','size']);L=4;R=kind==='count'?[s2Cycle('s',shp.slice(0,2)),s2Grow('n')]:[s2Cycle('c',col.slice(0,pick([2,3]))),s2Grow('z')]}
  else{kind=pick(['three','turn']);if(kind==='three'){L=4;R=[s2Cycle('s',shp.slice(0,2)),s2Cycle('c',col.slice(0,3)),s2Grow('n')]}else{base.s='arrow';R=[s2Turn,s2Cycle('c',col.slice(0,pick([2,3])))]}}
  const fig=i=>{const f=Object.assign({},base);R.forEach(r=>f[r.k]=r.at(i));return f};const seq=[],keys=R.map(r=>r.k);for(let i=0;i<L;i++)seq.push(fig(i));const ans=fig(L);
  const off=rs=>{const f=Object.assign({},ans);rs.forEach(r=>f[r.k]=r.wrong(ans[r.k]));return f};const opts=shuffle([ans].concat(R.map(r=>off([r])),R.length===2?[off(R)]:[])); // every distractor has one thing right and one wrong, or (one of them) both wrong
  return{R,keys,seq,ans,opts,idx:opts.indexOf(ans),kind,list:r=>seq.map(f=>S2_ATTR[r.k].name(f)).join(', ')}}
const s2Row=seq=>{const row=el('div','seq');seq.forEach(f=>{const it=el('div','it');it.fig=f;it.appendChild(s2Fig(f));row.appendChild(it)});row.appendChild(el('div','it q','?'));return row};
const s2Paint=(row,k)=>row.querySelectorAll('.it:not(.q)').forEach(it=>it.replaceChildren(s2Fig(k?S2_ATTR[k].iso(it.fig):it.fig)));
/* Show me: each attribute alone, its figures blinking along the row in order, then everything back together and the answer in the box */
function s2Show(row,note,p,done){const its=[...row.querySelectorAll('.it:not(.q)')];let t=0;const at=(ms,f)=>setTimeout(()=>{if(row.isConnected)f()},t+=ms);
  p.R.forEach(r=>{const A=S2_ATTR[r.k];at(200,()=>{s2Paint(row,r.k);note.textContent=`${cap(A.t)}s only: ${p.list(r)}, then ${A.name(p.ans)}`});its.forEach((it,i)=>at(i?380:300,()=>{it.firstChild.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:360});playNote(i)}))});
  at(600,()=>{s2Paint(row,null);note.textContent=`Together: ${s2Say(p.ans,p.keys)}`;if(done)done()})}
skill({id:'series2',room:'pat',title:'Two things change',idea:'rules',levels:3,grow:lv=>['','Now one thing repeats while the other one grows.','Now three things change at once, or an arrow turns while its colour changes.'][lv-1],
  async teach(lv,L){const p=s2Make(lv),row=s2Row(p.seq),note=el('div','hint','');const q=row.querySelector('.q');L.scene.append(row,note);const names=p.R.map(r=>S2_ATTR[r.k].t);
    L.say(`Look at this row. <em>${p.R.length===3?'Three':'Two'}</em> things are changing at once: the ${names.join(', the ')}. That looks hard. Pip has a trick: look at <em>one thing at a time</em>.`);await L.wait(2800);
    for(const r of p.R){const A=S2_ATTR[r.k];s2Paint(row,r.k);note.textContent=`${cap(A.t)}s only`;L.say(`Pip covers everything else with grey. Look at the <em>${A.t}s only</em>: ${p.list(r)}. ${cap(r.how)}, so the next ${A.t} is <em>${A.name(p.ans)}</em>.`);await L.wait(3200)}
    s2Paint(row,null);note.textContent='';q.textContent='';q.appendChild(s2Fig(p.ans));L.say(`Now put them together: <em>${s2Say(p.ans,p.keys)}</em>. ${p.R.length===3?'Three':'Two'} patterns at once, each one easy by itself. Now you try.`)},
  mount(lv){const p=s2Make(lv),{R,keys,seq,ans,opts}=p;prompt.textContent='What comes next?';const row=s2Row(seq),note=el('div','hint',R.length===3?'Three things change. Look at one at a time.':'Two things change. Look at one at a time.');const col=el('div','ta');col.style.gap='8px';col.append(row,note);stage.appendChild(col);
    ctx.seq=seq.map(s2Plain);ctx.choices=opts.map(s2Plain);ctx.attrs=keys;const A=R.map(r=>S2_ATTR[r.k]),nm=A.map(a=>a.t);
    const why=`Because the ${R.map((r,i)=>`${nm[i]} goes ${p.list(r)}`).join(' and the ')}, so next comes ${s2Say(ans,keys)}.`;
    const rw=R.find(r=>r.k==='c')||R.find(r=>r.k==='s')||R[0],RW=S2_ATTR[rw.k],wrongV=rw.wrong(ans[rw.k]),wrongName=RW.name(Object.assign({},ans,{[rw.k]:wrongV}));
    help({book:`followed ${R.length===3?'three':'two'} patterns at once: ${nm.slice(0,-1).join(', ')} and ${nm[nm.length-1]}`,pick:p.idx,answer:s2Say(ans,keys),
      clues:[`Look at only the ${nm[0]}s. They go ${p.list(R[0])}. What ${nm[0]} comes next?`,`Now only the ${nm[1]}s: ${p.list(R[1])}. What ${nm[1]} comes next? Then find that ${nm[1]} on the right ${nm[0]}.`],why,
      guess:lv===2?(p.kind==='count'?{q:'What is happening to the number of dots?',opts:[{t:'More each time',ok:1,why:'Yes: 1, 2, 3, 4, one more each time. Now which shape comes next?'},{t:'Fewer each time',why:'Count them: 1, 2, 3, 4. They are going up.'},{t:'The same',why:'Count the dots in each one. Do they stay the same?'}]}
        :{q:'What is happening to the size?',opts:[{t:'Bigger each time',ok:1,why:'Yes, bigger and bigger. Now which colour comes next?'},{t:'Smaller each time',why:'Look again: tiny, small, middle-sized, big. Growing!'},{t:'The same',why:'Look at the first one and the last one. Are they the same size?'}]}):null,
      reasons:{q:`Why is ${s2Say(ans,keys)} next?`,opts:[{t:why.replace(/, so next.*$/,''),ok:1},{t:'Because it is the prettiest',no:'Pretty is not a rule. A pattern is something that repeats or grows. Look at one thing at a time.'},{t:`Because ${wrongName} comes next`,no:`Look at only the ${RW.t}s: ${p.list(rw)}. After ${RW.name(seq[seq.length-1])} comes ${RW.name(ans)}, not ${wrongName}.`}],why},
      ways:{q:'How can you find what comes next?',opts:[{t:`Look at only the ${nm[0]}s first, then only the ${nm[1]}s`,ok:1},{t:'Say the pattern out loud, one thing at a time',ok:1},{t:'Pick the one that looks best',no:'Looking nice is not a rule. Each thing has its own pattern. Find them one at a time.'}],why:'One thing at a time. Each pattern is easy on its own.'},
      show:()=>s2Show(row,note,p,()=>{const q=row.querySelector('.q');q.textContent='';q.appendChild(s2Fig(ans))})});
    const c=choices(opts.map(f=>({f,node:s2Fig(f)})),(o,b)=>{if(ctx.done)return;if(o.f===ans){b.classList.add('hit');lock(c);const q=row.querySelector('.q');q.textContent='';q.appendChild(s2Fig(ans));note.textContent='';win(`${cheer()} ${R.map((r,i)=>`${cap(nm[i])}: ${p.list(r)}, ${A[i].name(ans)}`).join('. ')}. ${cap(s2Say(ans,keys))}!`)}
      else{b.classList.add('miss');b.disabled=true;const bad=R.filter(r=>!s2Eq(o.f,ans,r.k)),good=R.filter(r=>s2Eq(o.f,ans,r.k)),w=bad[0],W=S2_ATTR[w.k]; // the hint names the thing her pick got wrong, and credits what it got right
        miss(ctx.hints===0?`${good.length?`The ${good.map(r=>S2_ATTR[r.k].t).join(' and ')} is right. `:''}Look at only the ${W.t}s: ${p.list(w)}. What ${W.t} comes next?`:`It needs ${s2Say(ans,keys)}. ${bad.map(r=>`The ${S2_ATTR[r.k].t} goes ${p.list(r)}, then ${S2_ATTR[r.k].name(ans)}`).join('. ')}.`)}});controls.appendChild(c)}});
