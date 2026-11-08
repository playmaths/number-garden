/* ---------- play loop ---------- */
function play(id){S.skill=id;save();prompt.textContent='';stage.innerHTML='';controls.innerHTML='';say('');$('#where').textContent=`${S.trail&&S.trail.door==='pick'?"Pip's pick":doorName(SK[id].room)} · ${SK[id].title}`;
  ctx={hints:0,done:false,turn:S.duo?S.turn:0};
  turnEl.textContent=S.duo?(ctx.turn===1?"Dad's turn":`${KID()}'s turn`):'';
  const m=S.m[id]||(S.m[id]={lv:1,streak:0,low:0});
  const mountProblem=()=>{
    /* no repeats: a problem's signature is its prompt plus what is on the stage; re-roll if she has seen it in the last few goes of this game */
    S.recent=S.recent||{};const seen=S.recent[id]||[];let sig='';
    for(let t=0;t<6;t++){stage.innerHTML='';controls.innerHTML='';say('');ctx={hints:0,done:false,turn:S.duo?S.turn:0,id,lv:m.lv};SK[id].mount(m.lv);if(ctx.help&&ctx.help.guess&&!ctx.done)guessGate(ctx.help.guess);sig=prompt.textContent+'|'+stage.textContent+'|'+stage.innerHTML.length;if(!seen.includes(sig))break}
    S.recent[id]=seen.concat(sig).slice(-6);save();
    if(ctx.help)controls.appendChild(helpRow())};
  /* teach first: a game with a teach(lv) lesson shows it the first time she meets that level, before any question */
  S.taught=S.taught||{};const key=id+':'+m.lv;
  if(SK[id].teach&&!S.taught[key]){S.taught[key]=1;save();teachNow(id,m.lv,mountProblem)}else mountProblem();
  renderTrail()}
/* a lesson is Pip's bubble plus an animated scene; it ends with a My turn button */
let lessonToken=0;
function teachNow(id,lv,done){const my=++lessonToken;stage.innerHTML='';controls.innerHTML='';say('');ctx={hints:0,done:true,turn:0,lesson:true};prompt.textContent='Watch first';
  const n=el('div','narr');n.innerHTML=`<svg class="bug think" viewBox="0 0 60 60">${BUG}</svg><div class="bubble"></div>`;const bub=n.querySelector('.bubble');const scene=el('div','ta');scene.style.gap='8px';stage.append(n,scene);
  const r=el('div','row');const nx=el('button','btn next','Next ▶');nx.hidden=true;const b=el('button','btn quiet','My turn');b.onclick=()=>{lessonToken++;done()};r.append(nx,b);controls.appendChild(r);
  /* a pause under 1.2 s is animation and runs on the clock; a longer one is reading time, so after a short settle the lesson shows Next and waits for a tap */
  const tapNext=()=>new Promise(res=>{nx.hidden=false;nx.onclick=()=>{nx.hidden=true;nx.onclick=null;res()}});
  scene.classList.add('lesson');const lesson={say:t=>{if(my===lessonToken)bub.innerHTML=t},scene,wait:async ms=>{if(ms<1200)await wait(ms);else{await wait(Math.min(ms,600));if(my!==lessonToken)throw new Error('lesson over');await tapNext()}if(my!==lessonToken)throw new Error('lesson over')}};
  b.classList.remove('quiet');
  Promise.resolve().then(()=>SK[id].teach(lv,lesson)).catch(()=>{})}
function renderSkills(){}
function renderDoors(){const d=$('#doors');d.innerHTML='';const closed=gardenClosed();d.classList.toggle('resting',closed);const rest=$('#resting');if(rest)rest.hidden=!closed;ROOMS.forEach(rm=>{if(!Object.values(SK).some(k=>k.room===rm.id))return;/* a room with no games yet stays hidden */const b=el('button','door'+(rm.id==='make'?' maker':''),`<svg viewBox="0 0 24 24">${rm.icon}</svg><b>${rm.id==='make'?KID()+' makes it':DOORS[rm.id][0]}</b><small>${DOORS[rm.id][1]}</small>`);b.onclick=()=>startTrail(rm.id);d.appendChild(b)});
  const pgd=el('button','door sand',`<svg viewBox="0 0 24 24"><rect x="3" y="14" width="18" height="6" rx="2" fill="var(--soil)"/><circle cx="8" cy="9" r="3" fill="var(--sky)"/><rect x="13" y="6" width="6" height="6" fill="var(--accent)"/></svg><b>Playground</b><small>Just play</small>`);pgd.onclick=()=>{renderToys();show('playground')};d.appendChild(pgd);
  const i=el('button','door ideas',`<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" fill="#fff"/><rect x="9" y="18" width="6" height="3" rx="1" fill="#1a1a1a"/></svg><b>Big Ideas</b><small>Read and understand</small>`);i.onclick=()=>{renderIdeas();show('ideas')};d.appendChild(i);
  const pk=pickTrail();const why=pk.due.length?`${pk.due.length} to try again, a think problem, and something new`:pk.stale.length?'something not seen for a while, a think problem, something new':'a mix of five, with a think problem in the middle';const pd=el('button','door pick',`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff" stroke="#1a1a1a" stroke-width="1.5"/><path d="M8 12l3 3 5-6" stroke="var(--leaf)" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg><b>Pip's pick</b><small>${why}</small>`);pd.onclick=()=>startTrail('pick');d.appendChild(pd);
  const open=storyPages();const st=el('button','door tale',`<svg viewBox="0 0 24 24"><path d="M4 4h12a3 3 0 013 3v13H7a3 3 0 00-3 3z" fill="#fff" stroke="#1a1a1a" stroke-width="1.5"/><path d="M8 9h7M8 13h5" stroke="var(--accent)" stroke-width="1.5"/></svg><b>Pip's story</b><small>${open===0?'Grow a flower to open page 1':open>=STORY.length?'All '+STORY.length+' pages open':open+' of '+STORY.length+' pages open · next at '+(open*10+1)+' flowers'}</small>`);st.onclick=openTale;d.appendChild(st)}
function renderPapa(){const panel=$('#papa');const played=Object.values(SK).filter(k=>S.counts[k.id]);const strong=played.slice().sort((a,b)=>(S.m[b.id]?S.m[b.id].lv:1)*10+(S.counts[b.id]||0)-((S.m[a.id]?S.m[a.id].lv:1)*10+(S.counts[a.id]||0))).slice(0,3);
  const stuck=Object.values(SK).map(k=>({k,low:S.m[k.id]?S.m[k.id].low:0,streak:S.m[k.id]?S.m[k.id].streak:0})).filter(x=>x.low>0).sort((a,b)=>b.low-a.low)[0];
  const ideas=IDEAS.filter(i=>S.counts['idea_'+i.id]).map(i=>i.title);
  panel.innerHTML=`<h3>At a glance</h3><div>${inWords(S.flowers.length).replace(/^./,c=>c.toUpperCase())} flowers, ${S.stars} problems solved, best streak ${S.bestStreak} in a row, played on ${S.days.length} day${S.days.length===1?'':'s'}.</div>
  <h3>Big ideas ${P().s} ${vb('has','have')} read</h3><div>${ideas.length?ideas.join(', '):'None yet. Try Even and odd together first.'}</div>
  <h3>Strongest right now</h3><div>${strong.length?strong.map(k=>`${k.title} (level ${S.m[k.id]?S.m[k.id].lv:1})`).join(', '):'Not enough played yet.'}</div>
  <h3>Needs a second look</h3><div>${stuck?`${stuck.k.title}: ${P().s} needed hints on the last ${stuck.low===1?'problem':'two problems'}. Worth doing one together.`:`Nothing flagged. ${cap(P().s)} ${vb('is','are')} solving without many hints.`}</div>
  <h3>In ${P().pp} own words</h3><ul>${(S.said||[]).slice(0,5).map(e=>`<li>"${e.t.replace(/</g,'&lt;')}" <small>(${SK[e.skill]?SK[e.skill].title:e.skill})</small></li>`).join('')||'<li>Nothing kept yet. After a think problem the card offers Say it or Type it.</li>'}</ul>
  <h3>${cap(P().p)} last lines</h3><ul>${S.book.slice(0,5).map(e=>`<li>${e.t}</li>`).join('')||'<li>Nothing yet.</li>'}</ul>`}
function renderLevels(){renderPapa();renderLimit();renderKids();const t=$('#levels');t.innerHTML='';Object.values(SK).forEach(k=>{const tr=el('tr');tr.innerHTML=`<td>${DOORS[k.room][0]} · ${k.title}</td>`;const td=el('td');const box=el('div','lvl');const dn=el('button','','−'),sp=el('span','',` ${lvl(k.id)} / ${k.levels} `),up=el('button','','+');
  dn.onclick=()=>{const m=S.m[k.id];if(m.lv>1){m.lv--;m.streak=0;m.low=0;save();renderLevels()}};up.onclick=()=>{const m=S.m[k.id];if(m.lv<k.levels){m.lv++;m.streak=0;m.low=0;save();renderLevels()}};box.append(dn,sp,up);td.appendChild(box);tr.appendChild(td);t.appendChild(tr)})}
const MOTTOS=['Every problem you try makes your brain a little stronger.','Being stuck is where the thinking happens.','Mistakes are how we find out what to look at next.','Slow and sure beats fast and wrong.','You can always break a hard problem into small pieces.','Ask yourself: how do I know?','Nobody is born knowing this. You are learning it.'];
function greeting(){const h=new Date().getHours();const hi=h<12?'Good morning':h<17?'Good afternoon':'Good evening';const k=KID();
  const big=S.book.find(e=>e.big)||S.book[0];const today=Math.floor(Date.now()/864e5);const last=S.days.length?S.days[S.days.length-1]:null;
  let line;if(!S.book.length)line=`Welcome to your garden, <em>${k}</em>. I'm Pip, the ladybug. Pick a door and let's grow your first flower.`;
  else if(last===today)line=S.said&&S.said[0]&&today-Math.floor(S.said[0].d/864e5)<=1?`${hi}, <em>${k}</em>! You said: "${S.said[0].t.replace(/</g,'&lt;')}" That is thinking.`:`${hi}, <em>${k}</em>! Last thing you did: ${big.t.replace(k,'you').replace(/\bshe\b/g,'you')}`;
  else{const n=S.days.length;line=`${hi}, <em>${k}</em>! Pip here. Welcome back. ${big?big.t.replace(k,'You').replace(/\bshe\b/g,'you')+' ':''}You have played on ${inWords(n)} different day${n===1?'':'s'}.`}
  return line+' <br><span style="color:var(--muted)">'+MOTTOS[today%MOTTOS.length]+'</span>'}
function renderWho(){const w=$('#who');if(!w)return;w.hidden=PROFILES.list.length<2;w.innerHTML='';PROFILES.list.forEach(p=>{const b=el('button','chip'+(p.id===PROFILES.active?' on':''),profileName(p));b.onclick=()=>switchProfile(p.id);w.appendChild(b)})}
function renderHome(){$('#homeTitle').textContent='Number Garden';renderWho();setGardenView(S.gview||'garden');$('#bookBtn').textContent=S.name?`${S.name}'s Book`:'My Book';$('#greet').innerHTML=greeting();const gb=$('#greetRead');if(gb)gb.remove();const rb=readBtn(()=>$('#greet').textContent+(S.note?' A note from Papa: '+S.note:''));rb.id='greetRead';document.querySelector('.homebug').after(rb);const nc=$('#noteCard');nc.hidden=!S.note;if(S.note)nc.innerHTML=`<small>A note from Papa</small>${S.note.replace(/</g,'&lt;')}`;drawGarden();renderDoors()}

