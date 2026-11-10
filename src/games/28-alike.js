/* ================= THREE OF A KIND: figure classification ================= */
/* the CogAT form of classification: three figures share one rule and the child picks the fourth that belongs. The figures use the matrix language (MX_PATH, MX_COL, MX_VALS: shape, colour, size, count, fill).
   The rule is one attribute value the three share while every other attribute varies across them (all triangles, in different colours, sizes, counts and fills), so the child must find what is the same and ignore what differs.
   Every distractor fails the rule but shares some other attribute with one of the three (a red circle when the rule is "all triangles" and one triangle was red), so "looks like one of them" is caught and named.
   Level 1: shape or colour, four choices. Level 2: count, fill or size, five choices, a think-first guess. Level 3: two rules at once, every wrong choice keeping one and breaking the other, with a why gate and another way */
const AL_ATTR=['shape','col','size','count','fill'];
const AL_ORD=['first','second','third'];
/* one figure, like mxSvg but with highlights: hl is a list of attributes to point at. shape: a thick outline round each copy; col: a ring in the figure's colour; count: a numeral under each copy; size: a bar as wide as the figure; fill: a little badge, filled or hollow like the figure */
function alSvg(f,px,hl){hl=hl||[];const sc={small:.55,mid:.8,big:1.05}[f.size]*2.5*(f.count===1?1:f.count===2?.55:.38),c=MX_COL[f.col],xs=f.count===1?[50]:f.count===2?[26,74]:[18,50,82];let h='';
  const place=cx=>`transform="translate(${cx} 50) rotate(${f.turn||0}) scale(${sc.toFixed(2)}) translate(-20 -20)"`;
  if(hl.includes('col'))h+=`<circle cx="50" cy="50" r="46" fill="none" stroke="${c}" stroke-width="5" stroke-dasharray="6 5"/>`;
  xs.forEach((cx,i)=>{if(hl.includes('shape'))h+=`<g ${place(cx)} fill="none" stroke="var(--sun)" stroke-width="11" stroke-linejoin="round">${MX_PATH[f.shape]}</g>`;
    h+=`<g ${place(cx)} fill="${f.fill==='solid'?c:'none'}" stroke="${f.fill==='solid'?'#1a1a1a':c}" stroke-width="${f.fill==='solid'?1.5:4}" stroke-linejoin="round">${MX_PATH[f.shape]}</g>`;
    if(hl.includes('count'))h+=`<text x="${cx}" y="94" text-anchor="middle" font-size="15" font-weight="700" font-family="var(--display)" fill="var(--fg)">${i+1}</text>`});
  if(hl.includes('size')){const x1=xs[0]-sc*20,x2=xs[xs.length-1]+sc*20;h+=`<path d="M${x1.toFixed(0)} 84v8M${x1.toFixed(0)} 88H${x2.toFixed(0)}M${x2.toFixed(0)} 84v8" stroke="var(--sun)" stroke-width="3" fill="none"/>`}
  if(hl.includes('fill'))h+=`<circle cx="88" cy="12" r="8" fill="${f.fill==='solid'?c:'none'}" stroke="${f.fill==='solid'?'#1a1a1a':c}" stroke-width="${f.fill==='solid'?1.5:3}"/>`;
  return `<svg viewBox="0 0 100 100" style="width:${px}px;height:${px}px;display:block;overflow:visible">${h}</svg>`}
/* a card holding one figure (or a ? for the one to find); set(hl) redraws it with highlights, fill(f,hl) drops a figure into the ? */
function alCard(f,px){const d=el('div','alc'+(f?'':' alq'));d.style.cssText=`width:${px+14}px;height:${px+14}px;border-radius:12px;background:var(--card);display:grid;place-items:center;box-sizing:border-box;transition:box-shadow .3s;${f?'':'border:3px dashed var(--accent);color:var(--accent);font-family:var(--display);font-size:2rem'}`;
  d.f=f;d.innerHTML=f?alSvg(f,px):'?';d.set=hl=>{if(d.f)d.innerHTML=alSvg(d.f,px,hl)};d.fill=(g,hl)=>{d.f=g;d.innerHTML=alSvg(g,px,hl);d.style.border='3px solid var(--leaf)';d.style.color='';d.classList.remove('alq');d.classList.add('pop')};return d}
/* the row: three given figures, a + sign gap, and the ? card */
function alRow(given,px){const r=el('div','alrow');r.style.cssText='display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;padding:6px;border-radius:14px;background:var(--line)';r.cards=given.map(f=>alCard(f,px));r.q=alCard(null,px);r.cards.forEach(c=>r.appendChild(c));r.appendChild(r.q);
  r.light=hl=>r.cards.forEach(c=>c.set(hl));return r}
/* the rule in words: "all triangles", "all red", "all small", "all with two copies", "all hollow"; a value in words as mxWord gives it */
const alRule=(a,v)=>a==='shape'?`all ${v}s`:a==='col'?`all ${v}`:a==='size'?`all ${v==='mid'?'medium sized':v}`:a==='count'?(v===1?'all just one':`all with ${['','one','two','three'][v]} copies`):`all ${v==='hollow'?'hollow':'filled in'}`;
const alRules=R=>R.map(r=>alRule(r.a,r.v)).join(' and ');
const AL_Q={shape:'The shape',col:'The colour',count:'How many',size:'The size',fill:'Filled in or hollow'};
const alSame=(a,v)=>a==='count'?`${['','just one','two','three'][v]} each`:mxWord(a,v);
/* the generator. The given three share every rule; on each other attribute their values are a shuffled run of that attribute's values, so no other attribute is shared by all three.
   The answer shares the rules with fresh other values. A distractor breaks the rule (at level 3, exactly one of the two rules) and copies one non-rule attribute from one given figure, the look-alike trap it is named by */
function alProblem(lv){const R=lv===1?[{a:pick(['shape','col'])}]:lv===2?[{a:pick(['count','fill','size'])}]:(()=>{const a=shuffle(AL_ATTR);return[{a:a[0]},{a:a[1]}]})();
  R.forEach(r=>r.v=pick(MX_VALS[r.a]));const ruleOf=f=>R.every(r=>f[r.a]===r.v);const free=AL_ATTR.filter(x=>!R.some(r=>r.a===x));
  const runs={};free.forEach(x=>{const vs=shuffle(MX_VALS[x]);runs[x]=[0,1,2].map(i=>vs[i%vs.length])});
  const given=[0,1,2].map(i=>{const f={turn:0};R.forEach(r=>f[r.a]=r.v);free.forEach(x=>f[x]=runs[x][i]);return f});
  const eq=(f,g)=>AL_ATTR.every(x=>f[x]===g[x]);const roll=()=>{const f={turn:0};AL_ATTR.forEach(x=>f[x]=pick(MX_VALS[x]));return f};
  let ans;do{ans=roll();R.forEach(r=>ans[r.a]=r.v)}while(given.some(g=>eq(g,ans)));
  const nD=lv===1?3:4,ds=[];let guard=0;
  while(ds.length<nD&&guard++<200){const k=ds.length,f=roll();const brk=lv===3?R[k%2]:R[0];R.forEach(r=>f[r.a]=r.v);f[brk.a]=pick(MX_VALS[brk.a].filter(v=>v!==brk.v));
    const i=k%3,X=pick(free);f[X]=given[i][X];if(ds.some(d=>eq(d.f,f))||given.some(g=>eq(g,f)))continue;ds.push({f,X,i,brk:brk.a})}
  const choices=shuffle([{f:ans,X:null}].concat(ds));return{R,given,ans,choices,pick:choices.findIndex(c=>!c.X),ruleOf,free}}
skill({id:'alike',room:'reason',title:'Three of a kind',levels:3,grow:lv=>['','Now the rule can be how many, filled or hollow, or the size, and there are five to choose from.','Now two things are the same about all three, and every wrong one keeps only one of them.'][lv-1],
  async teach(lv,L){const R=lv===1?[{a:'shape',v:'triangle'}]:lv===2?[{a:'count',v:2}]:[{a:'fill',v:'hollow'},{a:'count',v:2}];const free=AL_ATTR.filter(x=>!R.some(r=>r.a===x));
    const runs={shape:['circle','square','star'],col:['red','blue','green'],size:['small','big','mid'],count:[1,3,2],fill:['solid','hollow','solid']};
    const given=[0,1,2].map(i=>{const f={turn:0};R.forEach(r=>f[r.a]=r.v);free.forEach(x=>f[x]=runs[x][i]);return f});
    const ans={shape:lv===1?'triangle':'heart',col:'yellow',size:'mid',count:lv===1?1:2,fill:lv===3?'hollow':'solid',turn:0};
    const bad=Object.assign({},given[0]);bad[R[0].a]=lv===1?'circle':lv===2?3:'solid';
    const row=alRow(given,lv===3?62:72),big=el('div','bigword','');const tray=el('div','row');tray.style.cssText='gap:10px;justify-content:center';const cb=alCard(bad,56),cg=alCard(ans,56);tray.append(cb,cg);L.scene.append(row,big,tray);
    L.say(`Three pictures that belong together. ${lv===3?'Two things are':'One thing is'} the same about all three: that is the rule. First I look for what is <em>different</em>, because that does not matter.`);await L.wait(2800);
    const diffs=free.slice(0,2);for(const x of diffs){big.innerHTML=`${AL_Q[x].toLowerCase()}: <em>different</em>`;L.say(`${AL_Q[x]}: ${given.map(f=>alSame(x,f[x])).join(', ')}. All different, so ${AL_Q[x].toLowerCase()} is not the rule.`);await L.wait(2600)}
    row.light(R.map(r=>r.a));big.innerHTML=`<em>${alRules(R)}</em>`;
    L.say(lv===3?`Now look: hollow, hollow, hollow. And two, two, two. The same! Both at once. So the rule is <em>${alRules(R)}</em>.`:`Now look: ${given.map(f=>alSame(R[0].a,f[R[0].a])).join(', ')}. The same! So the rule is <em>${alRules(R)}</em>.`);await L.wait(2800);
    cb.style.boxShadow='0 0 0 4px var(--sun)';L.say(`I try one: ${mxDesc(bad)}. It is ${mxWord(free[0]==='col'?'col':free[0],bad[free[0]==='col'?'col':free[0]])} like the first one, but ${lv===1?'it is a circle, not a triangle':lv===2?'there are three, not two':'it is filled in, not hollow'}. It breaks the rule. No.`);await L.wait(3000);
    cb.style.boxShadow='';cg.style.boxShadow='0 0 0 4px var(--leaf)';L.say(`I try another: ${mxDesc(ans)}. ${lv===3?'Hollow, and two of them':lv===1?'A triangle':'Two of them'}: it keeps the rule, so it belongs.`);await L.wait(2800);
    row.q.fill(ans,R.map(r=>r.a));L.say(`Different things do not matter. The same thing is the rule, and the fourth one must keep it. Now you try.`)},
  mount(lv){const p=alProblem(lv);const {R,given,ans,choices:opts,free}=p;const px=innerWidth<430?64:76;ctx.rule=Object.fromEntries(R.map(r=>[r.a,r.v]));ctx.given=given;ctx.choices=opts.map(c=>c.f);
    prompt.textContent='Which one belongs with these three?';const sc=el('div','scene');const row=alRow(given,px);const lab=el('div','hint',lv===3?'Two things are the same about all three.':'Something is the same about all three.');sc.append(row,lab);stage.appendChild(sc);
    const rule=alRules(R),are=rule.replace(/\ball /g,''),desc=mxDesc(ans),keys=R.map(r=>r.a);
    const act=async()=>{for(let i=0;i<R.length;i++){lab.textContent=`Same: ${alRule(R[i].a,R[i].v)}.`;row.light(keys.slice(0,i+1));await wait(1100)}row.q.fill(ans,keys);lab.textContent=`All three are ${are}. So is this one: ${desc}.`};
    const like=d=>`${mxWord(d.X,d.f[d.X])} like the ${AL_ORD[d.i]}`;
    help({book:`found the rule, ${rule}, and the fourth one that fits`,pick:p.pick,idx:p.pick,answer:desc,
      clues:[`Do not look for one that matches a picture. Look for what ALL three have the same: ${lv===3?'two things':'the shape, the colour, how many, the size, or filled in'}.`,`All three are ${are}. Find the one that is ${are} too.`],
      why:`All three are ${are}, and so is ${desc}. Everything else is different, so it does not matter.`,show:act,
      guess:lv===2?{q:'What is the same about all three?',opts:[{t:AL_Q[R[0].a],ok:1,why:`Yes: ${rule}. Now find the one that keeps the rule.`}].concat(shuffle(free).slice(0,2).map(x=>({t:AL_Q[x],why:`Look again: ${AL_Q[x].toLowerCase()} is ${given.map(f=>alSame(x,f[x])).join(', ')}. Different. What is the same about all three?`})))}:null,
      reasons:lv===3?{q:'Why does that one belong?',opts:[{t:`Because all three are ${are}, and so is this one`,ok:1},{t:'Because it is the prettiest',no:'Pretty is not a rule. Say what all three have the same, then check it.'},{t:`Because it is ${like(opts.find(c=>c.X)||{X:free[0],f:given[0],i:0})}`,no:`Like one of them is not enough. The rule is what ALL three share: ${rule}.`}],why:`All three are ${are}. So is ${desc}: it keeps the rule.`}:null,
      ways:lv===3?{q:'Another way to find it?',opts:[{t:'Say what is the same about all three, then check each choice against it',ok:1},{t:'Cross out every choice that breaks the rule; the one left belongs',ok:1},{t:'Pick the one that looks most like the first picture',no:'Like one picture is a trap. The rule is what all three share.'}],why:'Say the rule then check, or cross out the ones that break it: both find the one that keeps the rule.'}:null});
    const rowC=choices(opts.map((c,i)=>({c,i,node:(()=>{const d=el('div','mxpick');d.innerHTML=alSvg(c.f,opts.length>4?52:64);return d})()})),(o,b)=>{if(ctx.done)return;
      if(!o.c.X){b.classList.add('hit');lock(rowC);act();win(`${cheer()} All three are ${are}, and so is ${desc}.`)}
      else{b.classList.add('miss');b.disabled=true;const d=o.c;const kept=R.find(r=>r.a!==d.brk);miss(ctx.hints===0?(lv===3?`That one is ${mxWord(kept.a,kept.v)} like all three, but it is ${mxWord(d.brk,d.f[d.brk])}, and the rule is ${alRule(d.brk,R.find(r=>r.a===d.brk).v)} too.`:`That one is ${like(d)}, but the rule is ${rule}.`):`Look for what all three share: ${rule}. It must be ${desc}.`)}});
    rowC.querySelectorAll('.choice').forEach((b,i)=>{b.dataset.i=i;b.style.padding='6px'});controls.appendChild(rowC)}});
