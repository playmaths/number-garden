/* ================= STORIES ================= */
const THINGS=['strawberries','stickers','marbles','dinosaurs','crayons','shells','acorns','buttons','gummy bears','blueberries'];
const STORIES={
 1:[ // one step, within 10
  (k,t)=>{const a=rnd(2,6),b=rnd(1,4);return{text:`${k} had <b>${a}</b> ${t}. Papa gave ${P().o} <b>${b}</b> more. How many ${t} does ${k} have now?`,ans:a+b,hint:`Start at ${a} and count on ${b} more.`,why:`${a} and ${b} more is ${a+b}.`,viz:{type:'add',a,b}}},
  (k,t)=>{const a=rnd(5,10),b=rnd(1,a-1);return{text:`There were <b>${a}</b> ${t} in the jar. ${k} ate <b>${b}</b>. How many are left in the jar?`,ans:a-b,hint:`Start at ${a} and count back ${b}.`,why:`${a} take away ${b} leaves ${a-b}.`,viz:{type:'take',a,b}}},
  (k,t)=>{const a=rnd(2,5),b=rnd(2,5);return{text:`${k} has <b>${a}</b> ${t} in one hand and <b>${b}</b> in the other. How many altogether?`,ans:a+b,hint:`Put both hands together and count.`,why:`${a} + ${b} = ${a+b}.`,viz:{type:'add',a,b}}},
  (k,t)=>{const a=rnd(3,9),b=rnd(1,a-1);return{text:`${k} needs <b>${a}</b> ${t} for a game. ${cap(P().s)} ${vb('has','have')} <b>${b}</b>. How many more ${vb('does','do')} ${P().s} need?`,ans:a-b,hint:`Count up from ${b} until you reach ${a}.`,why:`From ${b} up to ${a} is ${a-b} more.`,viz:{type:'need',need:a,have:b}}}
 ],
 2:[ // within 20, compare and missing part
  (k,t)=>{const a=rnd(8,15),b=rnd(3,9);return{text:`${k} found <b>${a}</b> ${t}. ${cap(P().p)} friend found <b>${b}</b>. How many more did ${k} find than ${P().p} friend?`,ans:a-b,hint:`Line them up side by side. How many stick out past the shorter row?`,why:`${a} is ${a-b} more than ${b}.`,viz:{type:'compare',a,b,k}}},
  (k,t)=>{const a=rnd(7,12),b=rnd(4,9);return{text:`A box holds <b>10</b> ${t}. ${k} has <b>${a}</b> and Papa gives ${P().o} <b>${b}</b> more. How many will NOT fit in the box?`,ans:a+b-10,hint:`First find how many ${P().s} ${vb('has','have')} in all. Then take away the 10 that fit.`,why:`${a} + ${b} = ${a+b}. The box takes 10, so ${a+b-10} don't fit.`,viz:{type:'box',a,b}}},
  (k,t)=>{const a=rnd(11,19),b=rnd(2,9);return{text:`${k} had some ${t}. ${cap(P().s)} gave <b>${b}</b> to ${P().p} friend and now ${vb('has','have')} <b>${a-b}</b>. How many did ${P().s} start with?`,ans:a,hint:`Put the ${b} back. Then count everything.`,why:`${a-b} and the ${b} ${P().s} gave away: ${a} to start.`,viz:{type:'add',a:a-b,b,label:['has now','gave away']}}},
  (k,t)=>{const a=rnd(6,9),b=rnd(6,9);return{text:`${k} put <b>${a}</b> ${t} in a bag, then <b>${b}</b> more. Then ${P().s} took <b>5</b> out. How many are in the bag?`,ans:a+b-5,hint:`Do one thing at a time. First ${a} and ${b}. Then take away 5.`,why:`${a} + ${b} = ${a+b}, then ${a+b} − 5 = ${a+b-5}.`,viz:{type:'chain',a,steps:[b,-5]}}}
 ],
 3:[ // two steps, within 30, some reasoning
  (k,t)=>{const a=rnd(3,6),g=rnd(2,4);return{text:`${k} has <b>${a}</b> friends coming over. ${cap(P().s)} ${vb('wants','want')} to give each friend <b>${g}</b> ${t}. How many ${t} ${vb('does','do')} ${P().s} need?`,ans:a*g,hint:`Make ${a} piles with ${g} in each. Count them all.`,why:`${a} piles of ${g} is ${a*g}.`,viz:{type:'groups',rows:Array(a).fill(g),label:'friend'}}},
  (k,t)=>{const tot=rnd(6,12)*2,half=tot/2;return{text:`${k} and Papa share <b>${tot}</b> ${t} so they each get the same. Then ${k} eats <b>3</b> of ${P().pp}. How many does ${k} have left?`,ans:half-3,hint:`Half of ${tot} first. Then take away 3.`,why:`Half of ${tot} is ${half}. ${half} − 3 = ${half-3}.`,viz:{type:'share',tot,eat:3,k}}},
  (k,t)=>{const a=rnd(12,20),b=rnd(3,8),c=rnd(3,8);return{text:`${k} started with <b>${a}</b> ${t}. ${cap(P().s)} lost <b>${b}</b> at the park, then found <b>${c}</b> under the couch. How many now?`,ans:a-b+c,hint:`Two steps. Lose ${b} first, then find ${c}.`,why:`${a} − ${b} = ${a-b}, then + ${c} = ${a-b+c}.`,viz:{type:'chain',a,steps:[-b,c]}}},
  (k,t)=>{const d=rnd(3,6);return{text:`A spider has 8 legs. A ladybug has 6. ${k} saw <b>1</b> spider and <b>${d}</b> ladybugs. How many legs did ${P().s} see?`,ans:8+6*d,hint:`Legs on the ladybugs first: count by 6 ${d} times. Then add the spider.`,why:`${d} ladybugs is ${6*d} legs, plus 8 is ${8+6*d}.`,viz:{type:'groups',rows:[8].concat(Array(d).fill(6)),label:'bug'}}},
  (k,t)=>{const a=rnd(2,4),b=a+rnd(2,5);return{text:`${k} is <b>${a}</b> years older than ${P().p} cousin. ${cap(P().p)} cousin is <b>${b}</b>. In 2 years, how old will ${k} be?`,ans:a+b+2,hint:`How old is ${k} now? Then add 2.`,why:`${k} is ${a+b} now. In 2 years ${P().s}'ll be ${a+b+2}.`,viz:{type:'chain',a:b,steps:[a,2],label:['cousin now',`${a} older`,'2 years']}}}
 ]};


/* little pictures for story objects */
const ICONS={
 strawberries:'<path d="M20 36C12 34 6 26 7 18c4-4 9-4 13-1 4-3 9-3 13 1 1 8-5 16-13 18z" fill="#e63946"/><path d="M14 12c2-5 5-7 6-9 1 2 4 4 6 9-4-2-8-2-12 0z" fill="#4cae7c"/><g fill="#ffe08a"><circle cx="14" cy="21" r="1.3"/><circle cx="20" cy="18" r="1.3"/><circle cx="26" cy="21" r="1.3"/><circle cx="17" cy="27" r="1.3"/><circle cx="23" cy="27" r="1.3"/></g>',
 stickers:'<path d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#ffc83d" stroke="#e6a800" stroke-width="1.5"/>',
 marbles:'<circle cx="20" cy="20" r="16" fill="#5aa9e6"/><path d="M12 14q8-10 16 2" stroke="#9b6bd6" stroke-width="4" fill="none" opacity=".8"/><circle cx="14" cy="13" r="4" fill="#fff" opacity=".8"/>',
 dinosaurs:'<path d="M8 30c0-10 6-16 14-16 6 0 8 4 12 2l2 4c-3 3-6 2-7 5 0 5-3 9-9 9H8z" fill="#4cae7c"/><circle cx="26" cy="19" r="1.5" fill="#1a1a1a"/><path d="M10 14l3-6 3 6 3-6 3 6" fill="#2e8b57"/>',
 crayons:'<rect x="15" y="10" width="10" height="26" rx="2" fill="#ff7a59"/><path d="M15 10l5-7 5 7z" fill="#ff7a59"/><rect x="15" y="18" width="10" height="5" fill="#fff" opacity=".6"/>',
 shells:'<path d="M20 36C8 36 4 24 6 14c6 4 10 6 14 6s8-2 14-6c2 10-2 22-14 22z" fill="#f4a261"/><path d="M20 20v16M12 19l-3 14M28 19l3 14" stroke="#c6703d" stroke-width="1.5"/>',
 acorns:'<path d="M12 18c0 10 4 16 8 18 4-2 8-8 8-18z" fill="#b98a5b"/><path d="M9 18c2-6 7-9 11-9s9 3 11 9z" fill="#6b4a2b"/><rect x="18" y="4" width="4" height="6" rx="2" fill="#6b4a2b"/>',
 buttons:'<circle cx="20" cy="20" r="16" fill="#9b6bd6"/><circle cx="20" cy="20" r="11" fill="none" stroke="#7a4fb3" stroke-width="2"/><g fill="#fff"><circle cx="15" cy="16" r="2"/><circle cx="25" cy="16" r="2"/><circle cx="15" cy="24" r="2"/><circle cx="25" cy="24" r="2"/></g>',
 'gummy bears':'<path d="M11 34V20a9 9 0 0118 0v14z" fill="#ff5c8a"/><circle cx="13" cy="12" r="4" fill="#ff5c8a"/><circle cx="27" cy="12" r="4" fill="#ff5c8a"/><circle cx="20" cy="14" r="8" fill="#ff5c8a"/><circle cx="17" cy="13" r="1.3" fill="#7a1f3d"/><circle cx="23" cy="13" r="1.3" fill="#7a1f3d"/>',
 blueberries:'<circle cx="20" cy="22" r="14" fill="#2b4c9b"/><circle cx="15" cy="17" r="4" fill="#fff" opacity=".35"/><path d="M16 11l4 4 4-4-2-2h-4z" fill="#1a2d5e"/>'
};
let currentThing='strawberries';

/* scene engine: draws the objects in a story and acts out what the child answered */
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function dot(cls){const d=el('div','it2'+(cls?' '+cls:''));d.innerHTML=`<svg viewBox="0 0 40 40">${ICONS[currentThing]||ICONS.marbles}</svg>`;return d}
function row(label){const r=el('div','srow');if(label)r.appendChild(el('div','lab',label));return r}
async function appear(items,cls,gap){for(const d of items){d.classList.add('in');await wait(0);d.classList.add(cls||'new');await wait(20);d.classList.remove('in');await wait(gap||140)}}
async function countAlong(items,gap){let n=0;const sc=items[0]&&items[0].closest('.scene');let tally=sc&&sc.querySelector('.tally');if(sc&&!tally){tally=el('div','tally','');sc.appendChild(tally)}
  for(const d of items){if(d.classList.contains('gone')||d.classList.contains('slot'))continue;n++;d.classList.add('hi');d.appendChild(el('b','',n));if(tally){tally.textContent=n;tally.classList.remove('bump');void tally.offsetWidth;tally.classList.add('bump')}await wait(gap||260);d.classList.remove('hi')}return n}
/* move an item to a new parent with a real flight path */
async function flyTo(d,target){const a=d.getBoundingClientRect(),b=target.getBoundingClientRect();d.classList.add('fly');d.style.transform=`translate(${b.left-a.left}px,${b.top-a.top}px)`;await wait(620);d.classList.remove('fly');d.style.transform='';target.replaceWith(d);d.classList.add('new')}
function buildScene(v){const sc=el('div','scene');const S={sc,rows:[]};
  const mkRow=(n,label,cls)=>{const r=row(label);if(n>7)r.classList.add('dense');const items=[];for(let i=0;i<n;i++){const d=dot(cls);items.push(d);r.appendChild(d)}sc.appendChild(r);S.rows.push(items);return items};
  if(v.type==='add'){S.a=mkRow(v.a,v.label?v.label[0]:'');S.b=mkRow(0,v.label?v.label[1]:'more')}
  else if(v.type==='take'){S.a=mkRow(v.a,'')}
  else if(v.type==='need'){const r=row('needs');S.slots=[];for(let i=0;i<v.need;i++){const d=dot(i<v.have?'':'slot');S.slots.push(d);r.appendChild(d)}sc.appendChild(r)}
  else if(v.type==='compare'){S.a=mkRow(v.a,v.k);S.b=mkRow(v.b,'friend');S.rows.forEach(rw=>rw[0].parentElement.style.justifyContent='flex-start')}
  else if(v.type==='box'){const r=row('');const bx=el('div','box10');S.slots=[];for(let i=0;i<10;i++){const d=dot('slot');S.slots.push(d);bx.appendChild(d)}r.appendChild(bx);sc.appendChild(r);S.pile=mkRow(v.a,'has');S.more=mkRow(0,'Papa gives')}
  else if(v.type==='chain'){S.a=mkRow(v.a,v.label?v.label[0]:'start');S.steps=v.steps.map((s,i)=>mkRow(0,v.label?v.label[i+1]:(s>0?`+${s}`:`${s}`)))}
  else if(v.type==='groups'){S.g=v.rows.map((n,i)=>mkRow(0,`${v.label} ${i+1}`))}
  else if(v.type==='share'){S.a=mkRow(0,v.k);S.b=mkRow(0,'Papa')}
  return S}
async function actOut(v,S,guess){ // plays the true story; returns nothing. guess is the child's answer or null.
  const ans=v.ans;
  if(v.type==='add'){const r=S.b[0]?S.b[0].parentElement:S.sc.children[1];const items=[];for(let i=0;i<v.b;i++){const d=dot('in');items.push(d);r.appendChild(d)}await appear(items);S.b=items;await wait(300);await countAlong(S.a.concat(items))}
  else if(v.type==='take'){for(let i=0;i<v.b;i++){S.a[S.a.length-1-i].classList.add('gone');await wait(220)}await wait(300);await countAlong(S.a)}
  else if(v.type==='need'){const n=guess==null?ans:Math.min(guess,ans+5);const empties=S.slots.filter(d=>d.classList.contains('slot'));let placed=0;const extras=[];const r=S.slots[0].parentElement;
    for(let i=0;i<n;i++){if(placed<empties.length){const d=empties[placed++];d.classList.remove('slot');d.classList.add('in');await wait(10);d.classList.add('new');await wait(10);d.classList.remove('in')}else{const d=dot('in extra');r.appendChild(d);extras.push(d);await wait(0);d.classList.remove('in')}await wait(160)}
    await wait(300);if(guess!=null&&guess<ans){say(`You said ${guess}. ${ans-guess} ${ans-guess===1?'box is':'boxes are'} still empty. How many more would fill them?`)}else if(guess!=null&&guess>ans){say(`You said ${guess}. The purple ones don't fit${guess-ans>5?' (and there would be even more)':''}, ${guess-ans} extra. How many did fit?`)}}
  else if(v.type==='compare'){for(let i=v.b;i<v.a;i++){S.a[i].classList.add('hi');await wait(180)}await wait(200);await countAlong(S.a.slice(v.b))}
  else if(v.type==='box'){const items=[];for(let i=0;i<v.b;i++){const d=dot('in');items.push(d);S.more[0]?S.more[0].parentElement.appendChild(d):S.sc.children[2].appendChild(d)}await appear(items);await wait(300);
    const all=S.pile.concat(items);let i=0;const moved=[];for(const d of all){if(i<10){await flyTo(d,S.slots[i]);moved.push(d);i++;await wait(60)}else{d.classList.add('extra');await wait(160)}}
    await wait(300);await countAlong(all.slice(10))}
  else if(v.type==='chain'){let cur=S.a.slice();for(let i=0;i<v.steps.length;i++){const s=v.steps[i];if(s>0){const items=[];for(let j=0;j<s;j++){const d=dot('in');items.push(d);S.steps[i][0]?S.steps[i][0].parentElement.appendChild(d):S.sc.children[i+1].appendChild(d)}await appear(items);cur=cur.concat(items)}else{const live=cur.filter(d=>!d.classList.contains('gone'));for(let j=0;j<-s;j++){live[live.length-1-j].classList.add('gone');await wait(200)}}await wait(400)}await countAlong(cur)}
  else if(v.type==='groups'){let all=[];for(let i=0;i<v.rows.length;i++){const items=[];for(let j=0;j<v.rows[i];j++){const d=dot('in');items.push(d);S.sc.children[i].appendChild(d)}await appear(items,'',70);all=all.concat(items);await wait(150)}await wait(300);await countAlong(all,120)}
  else if(v.type==='share'){const A=[],B=[];for(let i=0;i<v.tot;i++){const d=dot('in');(i%2?B:A).push(d);S.sc.children[i%2].appendChild(d);await wait(0);d.classList.remove('in');await wait(90)}await wait(400);for(let i=0;i<v.eat;i++){A[A.length-1-i].classList.add('gone');await wait(220)}await wait(300);await countAlong(A)}}

skill({id:'tale',room:'story',title:'Story mystery',idea:'counton',levels:3,grow:lv=>['','Now the stories go up to 20 and ask trickier questions.','Now the stories have two steps.'][lv-1],mount(lv){
  const thing=pick(THINGS);currentThing=thing;let st=null;for(let i=0;i<10&&!st;i++)st=pick(STORIES[lv])(KID(),thing);
  st.viz.ans=st.ans;
  prompt.textContent='Read the story. Then solve it.';const box=el('div','story',st.text);const scene=buildScene(st.viz);stage.append(box,scene.sc);const cnt=el('div','counted','Touch things to count them');scene.sc.appendChild(cnt);stage.insertBefore(readBtn(()=>box.textContent),scene.sc);tapCount(scene.sc,'.it2:not(.slot)',k=>{cnt.textContent=k?`You counted ${k}`:'Touch things to count them'});
  let fresh=true;const replay=()=>{const old=scene.sc;const s=buildScene(st.viz);Object.assign(scene,s);stage.replaceChild(s.sc,old)};
  let busy=false;
  const vz=st.viz;const guess=(vz.type==='add'||vz.type==='take')&&vz.a!=null?{q:`Before the number: will there be more or fewer than ${vz.a} at the end?`,opts:[{t:'more',ok:vz.type==='add',why:vz.type==='add'?'Yes: some came, so more. Now the number.':'Some went away, so fewer. Now the number.'},{t:'fewer',ok:vz.type==='take',why:vz.type==='take'?'Yes: some went away, so fewer. Now the number.':'Some came, so more. Now the number.'}]}:null;
  help({guess,book:`read a story and worked out the answer: ${st.ans}`,clues:['Look at the picture. What do we know, and what is the question asking?',st.hint],answer:st.ans,why:st.why,show:()=>{if(!fresh)replay();fresh=false;actOut(st.viz,scene,null)}});
  controls.appendChild(numpad(async(v,nm)=>{if(busy)return;busy=true;nm.style.pointerEvents='none';nm.style.opacity='.6';if(!fresh)replay();fresh=false;scene.sc.querySelectorAll('b.tc').forEach(b=>b.remove());const cc=scene.sc.querySelector('.counted');if(cc)cc.remove();
    if(v===st.ans){lock(nm);win(`${cheer()} ${st.why}`);await actOut(st.viz,scene,v)}
    else{miss(`You said ${v}. Watch what really happens.`);await actOut(st.viz,scene,v);if(st.viz.type!=='need')say(`You said ${v}. Now count the numbered ones, then try again.`)}
    busy=false;nm.style.pointerEvents='';nm.style.opacity=''},3))}});

skill({id:'ways',room:'story',title:'How many ways?',idea:'share',levels:4,grow:lv=>['','Now find three ways.','Now find every way there is.',`Now ${P().s} also ${vb('says','say')} how many ways there are in all.`][lv-1],mount(lv){
  /* she colors the beads herself by tapping; every split that uses every color is a right answer, and she needs a few different ones */
  const k=KID();const COL={red:'var(--accent)',blue:'var(--sky)',green:'var(--leaf)'};let total,parts,need;
  const all=lv>=3; /* levels 3 and 4: every split of n beads into two colors, at least one of each: n-1 ways */
  if(lv===1){total=rnd(4,6);parts=['red','blue'];need=2}else if(lv===2){total=rnd(6,9);parts=['red','blue'];need=3}else{total=lv===3?rnd(4,6):rnd(5,7);parts=['red','blue'];need=total-1}
  const text=`${k} has <b>${total}</b> beads to paint. Some <b>red</b> and some <b>blue</b>, at least one of each. ${all?'Find <b>every</b> way there is.':`Find <b>${need}</b> different ways.`}`;
  prompt.textContent='Many right answers!';const wtext=el('div','story',text);stage.append(wtext,readBtn(()=>wtext.textContent));
  /* either order works: tap a bead then a pot, or pick a pot then tap beads */
  let brush=-1,picked=null;const pots=el('div','pots');const beads=[],row=el('div','beads');
  const paintBead=(b,ci)=>{b.ci=ci;b.style.background=COL[parts[ci]];b.classList.add('on');b.classList.remove('picked');say('')};
  const potEls=parts.map((c,ci)=>{const pt=el('button','pot');pt.style.background=COL[c];pt.setAttribute('aria-label',c+' paint');pt.appendChild(el('span','',c));
    pt.onclick=()=>{if(ctx.done)return;if(picked){paintBead(picked,ci);picked=null;return}brush=ci;potEls.forEach((x,j)=>x.classList.toggle('sel',j===ci))};pots.appendChild(pt);return pt});
  for(let i=0;i<total;i++){const b=el('button','bead');b.ci=-1;b.onclick=()=>{if(ctx.done)return;if(brush>=0){paintBead(b,brush);return}if(picked)picked.classList.remove('picked');picked=b;b.classList.add('picked')};beads.push(b);row.appendChild(b)}
  const legend=el('div','hint','Tap a bead, then tap a paint pot.');const found=[],list=el('div','ways');stage.append(pots,row,legend,list);
  const counts=()=>parts.map((_,ci)=>beads.filter(b=>b.ci===ci).length);
  const ex=parts.length===2?[[1,total-1],[2,total-2],[3,total-3]]:[[1,1,total-2],[1,2,total-3],[2,1,total-3]];
  const paint=c=>{let i=0;c.forEach((n,ci)=>{for(let j=0;j<n;j++){beads[i].ci=ci;beads[i].style.background=COL[parts[ci]];beads[i].classList.add('on');i++}})};
  const miniRow=c=>{const w=el('span','way');c.forEach((n,ci)=>{for(let j=0;j<n;j++){const d=el('i');d.style.background=COL[parts[ci]];w.appendChild(d)}});w.appendChild(el('b','',c.map((n,ci)=>`${n} ${parts[ci]}`).join(' + ')));return w};
  const every=Array.from({length:total-1},(_,i)=>[i+1,total-1-i]);
  help({book:all?`found every way to split ${total} beads into two colors: ${need} ways`:`found ${need} different ways to split ${total} beads`,clues:[`Paint just one bead ${parts[0]} and all the rest ${parts[1]}. That is one way.`,all?`Go in order: 1 red, then 2 red, then 3 red… When every bead but one is red, you have found them all.`:`Now change one bead: one more ${parts[0]}, one fewer ${parts[1]}. That is a new way.`],why:all?`Go in order, 1 red up to ${total-1} red: ${need} ways in all.`:`Some ways: ${ex.map(c=>c.map((n,ci)=>`${n} ${parts[ci]}`).join(' + ')).join('; ')}.`,show:()=>{(all?every:ex).forEach(c=>list.appendChild(miniRow(c)));paint((all?every:ex)[0])}});
  const go=el('button','btn','That\'s a way');go.onclick=()=>{if(ctx.done)return;const c=counts();const blank=beads.filter(b=>b.ci<0).length;
    if(blank)return miss(`${blank} bead${blank>1?'s are':' is'} still plain. Paint every bead.`);
    const missing=parts.filter((_,ci)=>c[ci]===0);if(missing.length)return miss(`There is no ${missing[0]} bead. ${cap(P().s)} ${vb('needs','need')} at least one of each color.`);
    const key=c.join('+');if(found.includes(key))return miss('You already found that one. Change a bead to make a different way.');
    found.push(key);list.appendChild(miniRow(c));
    if(found.length>=need){lock(row);go.disabled=true;
      if(!all)win(`${cheer()} ${need} ways, and there are even more.`);
      else if(lv===3)win(`${cheer()} That is every way: ${need} ways, and there are no more. 1 red up to ${total-1} red.`);
      else{ /* level 4: now the real question */ say(`That is all of them! Now: how many ways did you find in all?`,true);prompt.textContent='How many ways are there in all?';
        const nm=numpad((v,n2)=>{if(v===need){lock(n2);win(`${cheer()} ${total} beads, ${need} ways: one for each place the color can change, from 1 red up to ${total-1} red.`)}else miss(ctx.hints===0?'Count the little rows you found.':`There are ${need} rows. Count them one by one.`)},2);controls.insertBefore(nm,r)}}
    else{say(`That works! ${need-found.length} more. ${all?'Try one more red.':'Change a bead for a new way.'}`,true)}};
  const r=el('div','row');r.appendChild(go);controls.append(r)}});

