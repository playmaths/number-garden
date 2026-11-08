(function(){
'use strict';
const $=s=>document.querySelector(s), el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[rnd(0,a.length-1)], shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const S=Object.assign({stars:0,dad:0,name:'',duo:false,m:{},room:'add',skill:null,turn:0,book:[],flowers:[],badges:{},counts:{},trail:null,streakNow:0,bestStreak:0,note:'',days:[],savedAt:0},store.get('ng2',{}));
/* children on one device: a small registry of gardens. The active child's garden is the plain ng2 key (so everything else stays as it was); the others sleep under ng2_<id>. Switching swaps the keys and reloads */
const PROFILES=store.get('ng2_profiles',{active:'p1',list:[{id:'p1'}]});
const profileName=p=>p.id===PROFILES.active?(S.name||'Sprout'):((store.get('ng2_'+p.id,{})||{}).name||p.name||'Sprout');
function switchProfile(id){if(id===PROFILES.active)return;store.set('ng2_'+PROFILES.active,S);PROFILES.active=id;store.set('ng2_profiles',PROFILES);store.set('ng2',store.get('ng2_'+id,{})||{});location.reload()}
function addProfile(name){const id='p'+Date.now().toString(36);PROFILES.list.push({id,name});store.set('ng2_profiles',PROFILES);store.set('ng2_'+id,{name,stars:0,m:{},book:[],flowers:[],badges:{},counts:{},days:[]});switchProfile(id)}
function removeProfile(id){if(id===PROFILES.active||PROFILES.list.length<2)return;PROFILES.list=PROFILES.list.filter(p=>p.id!==id);store.set('ng2_profiles',PROFILES);try{localStorage.removeItem('ng2_'+id)}catch(e){}}
/* save: browser storage right away, cloud (db capability) a moment later; the cloud copy wins on load when it is newer */
let cloud=null,cloudTimer=null,cloudWriting=null,cloudState='';
function save(){S.savedAt=Date.now();store.set('ng2',S);if(cloud){clearTimeout(cloudTimer);cloudTimer=setTimeout(pushCloud,1500)}if(famOK()){clearTimeout(famTimer);famTimer=setTimeout(famPush,1500)}}
async function pushCloud(){if(!cloud)return;if(cloudWriting){cloudTimer=setTimeout(pushCloud,1500);return}const body=JSON.parse(JSON.stringify(S));cloudWriting=cloud.doc('progress/main').set(body).then(()=>{cloudState='saved '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}).catch(e=>{cloudState='could not save ('+(e&&e.code||'error')+')'}).finally(()=>{cloudWriting=null;const c=document.getElementById('cloud');if(c)c.textContent=cloudLine()})}
function cloudLine(){return cloud?`Progress is saved to the cloud for this page (${cloudState||'connected'}), so it carries over between devices and survives a cleared browser.`:'Progress is saved in this browser only. Sign in to Claude on this device for cloud saving across devices.'}
async function connectCloud(){try{if(!window.claude||!claude.use)return;const db=await claude.use('db');if(!db)return;cloud=db;const snap=await db.doc('progress/main').get();
  if(snap.exists){const d=snap.data();if(d&&(d.savedAt||0)>(S.savedAt||0)){Object.assign(S,d);store.set('ng2',S);renderHome();if(!$('#home').hidden)show('home');else if(!$('#play').hidden&&S.trail)play(S.trail.steps[S.trail.i])}else pushCloud()}
  else pushCloud();cloudState='connected';const c=document.getElementById('cloud');if(c)c.textContent=cloudLine()}catch(e){cloud=null}}

/* ---------- family code: one garden on every device, through Firestore's plain web API; the browser copy stays as the offline fallback ---------- */
const FIREBASE={apiKey:'AIzaSyCgG83-cqWqDuzOWrIQwqLBMF7sTwOkbWA',projectId:'playmaths-6a181'};
const famUrl=code=>`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/families/${encodeURIComponent(code)}?key=${FIREBASE.apiKey}`;
let famTimer=null,famBusy=false,famState='';
const famOK=()=>/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(S.family||'');
function newFamilyCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const pick4=()=>Array.from({length:4},()=>A[Math.floor(Math.random()*A.length)]).join('');return pick4()+'-'+pick4()}
function famLine(){const f=$('#famState');if(!f)return;f.textContent=famOK()?`Family ${S.family}: ${famState||'connecting…'}`:'No family code yet. Tap New family on the first device, then type that code on the others.'}
async function famPush(){if(!famOK()||!navigator.onLine)return;if(famBusy){famTimer=setTimeout(famPush,1500);return}famBusy=true;
  try{const body={fields:{data:{stringValue:JSON.stringify(S)},savedAt:{integerValue:String(S.savedAt||0)}}};const r=await fetch(famUrl(S.family),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});famState=r.ok?'saved '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'could not save ('+r.status+')'}catch(e){famState='offline, saved on this device'}
  famBusy=false;famLine()}
async function famPull(){if(!famOK()||!navigator.onLine)return;try{const r=await fetch(famUrl(S.family));
    if(r.status===404){famPush();return}if(!r.ok){famState='could not read ('+r.status+')';famLine();return}
    const doc=await r.json();const d=JSON.parse(doc.fields.data.stringValue);
    const fresh=!S.stars&&!(S.book||[]).length&&!(S.flowers||[]).length,remoteHas=!!(d.stars||(d.book||[]).length||(d.flowers||[]).length); // a device with no progress takes the family's garden, if the family has one
    if((fresh&&remoteHas)||(d.savedAt||0)>(S.savedAt||0)){const code=S.family,localTrail=S.trail,localSkill=S.skill,localM=localSkill&&S.m[localSkill],inPlay=!$('#play').hidden,keepLocal=inPlay&&!d.trail;Object.assign(S,d);S.family=code;if(keepLocal){S.trail=localTrail;S.skill=localSkill;if(localM)S.m[localSkill]=localM}if(S.skill&&!S.m[S.skill])S.m[S.skill]={lv:1,streak:0,low:0};store.set('ng2',S);famState='up to date';renderHome();$('#name').value=S.name||'';$('#pro').value=S.pro||'she';if(!$('#sheet').hidden)renderLevels();else if(!$('#home').hidden)show('home');else if(!$('#play').hidden&&S.trail&&!keepLocal)play(S.trail.steps[S.trail.i])}
    else{famState='up to date';if((d.savedAt||0)<(S.savedAt||0))famPush()}}catch(e){famState='offline, saved on this device'}famLine()}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')famPull()});

/* ---------- Tell Pip: a child's bug report. Six big choices, no typing. Each report is saved on the device and sent to the reports collection; failed sends retry later. Nothing personal goes in: no name, just the game, the level, the words on screen, the time, the app version, the family code and the device type ---------- */
const APP_VERSION='2026-11-07f';
const TELLS=[['🧱','It got stuck','stuck'],['❌','The answer is wrong','wrong'],['🤔','I don\'t get it','confused'],['😵','Too hard','hard'],['😴','Too easy','easy'],['💛','I love this one','love']];
let tellFrom='play';
let pendingShot=null,pendingHtml='';
function openTell(from){tellFrom=from;pendingHtml=(from==='play'?$('#play'):$('#learn')).innerHTML.slice(0,24000);pendingShot=snapshot(); // the picture is taken of the screen as the child saw it, before the Tell view replaces it
  const g=$('#tellGrid');g.innerHTML='';$('#tellDone').hidden=true;$('#tellBubble').textContent='Something silly? Tap what happened and I\'ll tell the gardeners.';$('#tellBug').innerHTML=BUG;
  TELLS.forEach(([ico,label,kind])=>{const b=el('button','choice',`<b>${ico}</b>${label}`);b.onclick=()=>{fileReport(kind,label);g.querySelectorAll('.choice').forEach(x=>x.disabled=true);b.classList.add('hit');$('#tellBubble').innerHTML=kind==='love'?`Me too! I'll tell the gardeners you love it.`:`Thank you! I'll tell the gardeners: <em>${label}</em>. They'll have a look.`;bugs('happy');$('#tellDone').hidden=false};g.appendChild(b)});show('tell')}
/* a picture of the screen for the gardeners: the visible page is serialised into an SVG with the page's own styles and drawn to a canvas. No library, no network; a small JPEG. If anything refuses, the report goes without it */
async function snapshot(){try{const el=$('#play').hidden?$('#learn'):$('#play');const w=Math.min(el.scrollWidth||innerWidth,600),h=Math.min(el.scrollHeight||innerHeight,1500);const css=[...document.querySelectorAll('style')].map(x=>x.textContent).join('\n');const bg=getComputedStyle(document.body).backgroundColor;const dark=matchMedia('(prefers-color-scheme: dark)').matches;
  const clone=el.cloneNode(true);clone.removeAttribute('hidden');clone.querySelectorAll('.puff,.dust').forEach(x=>x.remove());const xhtml=new XMLSerializer().serializeToString(clone);const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="background:${bg};width:${w}px;color-scheme:${dark?'dark':'light'}"><style>${css.replace(/<\/style/g,'')} *{animation:none!important;transition:none!important}</style>${xhtml}</div></foreignObject></svg>`; // a canvas rasterises the SVG at time zero, where every fade-in is still invisible, so animations are switched off
  const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);const img=new Image();await Promise.race([new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url}),wait(2500).then(()=>{throw new Error('slow')})]);
  const sc=Math.min(1,520/w,1100/h);const c=document.createElement('canvas');c.width=Math.round(w*sc);c.height=Math.round(h*sc);const g2=c.getContext('2d');g2.fillStyle=bg;g2.fillRect(0,0,c.width,c.height);g2.drawImage(img,0,0,c.width,c.height);const out=c.toDataURL('image/jpeg',.72);return out.length<380000?out:c.toDataURL('image/jpeg',.4)}catch(e){window.__snapErr=String(e);return ''}}
function fileReport(kind,label){const inPlay=tellFrom==='play';const r={kind,label,game:inPlay?((ctx&&ctx.id)||S.skill||''):('idea:'+($('#learnTitle').textContent||'')),level:inPlay?((ctx&&ctx.lv)||0):0,prompt:(inPlay?$('#prompt').textContent:$('#bubble').textContent).slice(0,380),stage:(inPlay?$('#stage').innerText:$('#sceneInner').innerText).replace(/\s+/g,' ').slice(0,380),controls:(inPlay?$('#controls').innerText:'').replace(/\s+/g,' ').slice(0,280),when:new Date().toISOString(),ver:APP_VERSION,family:S.family||'',device:`${navigator.platform||''} ${innerWidth}x${innerHeight} ${/iPad|iPhone/.test(navigator.userAgent)?'iOS':/Android/.test(navigator.userAgent)?'Android':'other'}`.trim(),lang:navigator.language||'',html:pendingHtml,shot:'',sent:false};
  S.reports=(S.reports||[]).concat(r).slice(-20);store.set('ng2',S);(pendingShot||Promise.resolve('')).then(png=>{r.shot=png||'';store.set('ng2',S);sendReports()})}
let sendingReports=false;
async function sendReports(){if(sendingReports||!navigator.onLine)return;const todo=(S.reports||[]).filter(r=>!r.sent);if(!todo.length)return;sendingReports=true;
  for(const r of todo){try{const fields={};for(const k of ['kind','label','game','prompt','stage','controls','when','ver','family','device','lang','html','shot'])fields[k]={stringValue:String(r[k]||'')};fields.level={integerValue:String(r.level||0)};
      const res=await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/reports?key=${FIREBASE.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields})});if(res.ok)r.sent=true;else if(res.status===400||res.status===403){delete fields.html;delete fields.shot;const res2=await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/reports?key=${FIREBASE.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields})});if(res2.ok){r.sent=true;r.noShot=true}}}catch(e){}}
  store.set('ng2',S);sendingReports=false;renderReports()}
function renderReports(){const l=$('#reportsList');if(!l)return;const rs=(S.reports||[]).slice().reverse();l.innerHTML=rs.length?rs.map(r=>`<div>${r.label} · ${r.game}${r.level?' level '+r.level:''} · ${new Date(r.when).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · ${r.sent?(r.noShot?'sent without the picture (rules not updated yet)':'sent with a picture'):'waiting to send'}</div>`).join(''):'None yet.'}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sendReports()});

/* ---------- rooms & skills ---------- */
const ROOMS=[
 {id:'warm',title:'Warm-ups',icon:'<circle cx="7" cy="7" r="3" fill="var(--dot)"/><circle cx="17" cy="7" r="3" fill="var(--dot)"/><circle cx="7" cy="17" r="3" fill="var(--dot)"/><circle cx="17" cy="17" r="3" fill="var(--accent)"/>'},
 {id:'add',title:'Add & take',icon:'<rect x="3" y="4" width="6" height="16" rx="2" fill="var(--dot)"/><circle cx="15" cy="8" r="2.4" fill="var(--dot)"/><circle cx="15" cy="16" r="2.4" fill="var(--dot-gone)"/><circle cx="20" cy="8" r="2.4" fill="var(--dot)"/>'},
 {id:'pat',title:'Patterns',icon:'<circle cx="5" cy="12" r="3" fill="var(--accent)"/><rect x="10" y="9" width="6" height="6" fill="var(--leaf)"/><circle cx="21" cy="12" r="3" fill="var(--accent)"/>'},
 {id:'puz',title:'Puzzles',icon:'<path d="M4 18h16M12 18V6M6 6h12" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6" cy="10" r="3" fill="var(--sun)"/><circle cx="18" cy="10" r="3" fill="var(--plum)"/>'},
 {id:'story',title:'Stories',icon:'<path d="M4 5h7a2 2 0 012 2v13a2 2 0 00-2-2H4zM20 5h-7a2 2 0 00-2 2v13a2 2 0 012-2h7z" fill="var(--bg)" stroke="currentColor" stroke-width="2"/><path d="M6 9h4M6 12h4M14 9h4M14 12h4" stroke="var(--accent)" stroke-width="1.5"/>'},
 {id:'space',title:'Shapes & space',icon:'<rect x="3" y="11" width="8" height="8" fill="var(--sky)"/><path d="M14 19l4-8 4 8z" fill="var(--accent)"/><circle cx="8" cy="6" r="3" fill="var(--leaf)"/>'},
 {id:'time',title:'Time',icon:'<circle cx="12" cy="12" r="9" fill="var(--card)" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" fill="none"/>'},
 {id:'meas',title:'Measure',icon:'<path d="M3 15h18v5H3z" fill="var(--sun)"/><path d="M6 15v3M9 15v2M12 15v3M15 15v2M18 15v3" stroke="#1a1a1a" stroke-width="1.5"/><path d="M4 11a8 8 0 0116 0" fill="var(--accent)"/>'},
 {id:'sud',title:'Sudoku',icon:'<rect x="3" y="3" width="18" height="18" rx="2" fill="var(--card)" stroke="currentColor" stroke-width="2"/><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="2"/><circle cx="7.5" cy="7.5" r="2" fill="var(--plum)"/><circle cx="16.5" cy="16.5" r="2" fill="var(--accent)"/>'},
 {id:'think',title:'Think',icon:'<path d="M12 3a6 6 0 00-3.5 10.9V17h7v-3.1A6 6 0 0012 3z" fill="var(--sun)" stroke="#1a1a1a" stroke-width="1.5"/><rect x="9.5" y="18" width="5" height="3" rx="1" fill="#1a1a1a"/>'},
 {id:'reason',title:'Reasoning',icon:'<rect x="3" y="3" width="8" height="8" rx="1.5" fill="var(--sky)"/><circle cx="17" cy="7" r="4" fill="var(--accent)"/><circle cx="7" cy="17" r="4" fill="var(--sky)"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="var(--card)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/><text x="17" y="20" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">?</text>'},
 {id:'make',title:'Makes it',icon:'<rect x="3" y="8" width="18" height="10" rx="3" fill="var(--plum)"/><circle cx="8" cy="13" r="2" fill="#fff"/><circle cx="16" cy="13" r="2" fill="#fff"/><path d="M12 3v5" stroke="var(--plum)" stroke-width="2"/><circle cx="12" cy="3" r="2" fill="var(--sun)"/>'}
];
const SK={};
function skill(def){SK[def.id]=def}
const MAX=id=>SK[id].levels;
const lvl=id=>{const m=S.m[id]||(S.m[id]={lv:1,streak:0,low:0});return m.lv};

/* read aloud (Web Speech, if the browser has it) */
/* Pip's voice: a local English voice if there is one, a warm-sounding one by name first, a little slower than normal. Voices arrive late in some browsers, so the choice is made again when they change. Every call is guarded: a browser (or a headless test) without speech must never throw */
let pipVoice=null,pipVoiceT=0;
function pickVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));const score=v=>(v.localService?4:0)+(/samantha|karen|moira|tessa|zira|google (uk|us) english|female|fiona|serena/i.test(v.name)?2:0)+(/en-(GB|US|AU)/i.test(v.lang)?1:0);pipVoice=vs.sort((a,b)=>score(b)-score(a))[0]||null}catch(e){pipVoice=null}}
try{if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}}catch(e){}
function speak(text){try{if(!window.speechSynthesis||S.speech===false)return false;const t=String(text||'').replace(/<[^>]+>/g,'').replace(/[🔊🐞✨]/g,'').replace(/\s+/g,' ').trim();if(!t)return false;speechSynthesis.cancel();if(!pipVoice)pickVoice();
  const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.pitch=1.05;if(pipVoice)u.voice=pipVoice;const my=++pipVoiceT;setTimeout(()=>{if(my===pipVoiceT)try{speechSynthesis.speak(u)}catch(e){}},40);return true}catch(e){return false}} // the short pause after cancel() keeps Chrome from dropping the new utterance
function readBtn(getText){if(!window.speechSynthesis||S.speech===false)return el('span');const b=el('button','readbtn','🔊 Read it to me');b.onclick=()=>speak(getText());return b}
/* auto-speech: when the switch is on, Pip reads the prompt, her messages and her bubbles aloud as they appear, so a child who cannot read yet can play alone. One observer watches the few places Pip talks from; changes within a tick are gathered (a problem may be re-rolled, a lesson sets its bubble step by step) and read once, in page order, the newest utterance cancelling the one before. The same words are not read twice in a row, so a lesson's own narration is never doubled */
const SPEAK_FROM='#prompt,#msg,#bubble,#tellBubble,.bubble';let speakQ=new Set(),speakT=0,spokeLast='',spokeAt=0;
const speakText=n=>[...n.childNodes].filter(c=>!(c.nodeType===1&&(c.classList.contains('readbtn')||c.querySelector('.readbtn')))).map(c=>c.textContent).join(' ');
function flushSpeak(){const nodes=[...speakQ].filter(n=>n.isConnected&&!n.closest('[hidden]')).sort((a,b)=>a.compareDocumentPosition(b)&4?-1:1);speakQ=new Set();const t=nodes.map(speakText).join(' ').replace(/\s+/g,' ').trim();if(!t)return;if(t===spokeLast&&Date.now()-spokeAt<4000)return;spokeLast=t;spokeAt=Date.now();speak(t)}
function queueSpeak(n){if(S.speech===false||!window.speechSynthesis)return;speakQ.add(n);clearTimeout(speakT);speakT=setTimeout(flushSpeak,180)}
try{new MutationObserver(ms=>{for(const m of ms){const t=m.target.nodeType===1?m.target:m.target.parentElement;const n=t&&t.closest(SPEAK_FROM);if(n)queueSpeak(n)}}).observe(document.body,{childList:true,characterData:true,subtree:true})}catch(e){}
/* the speaker button in the play header and the grown-ups' switch are one setting */
function setSpeech(on){S.speech=!!on;save();const c=$('#speechOn');if(c)c.checked=S.speech;renderSpeakBtn();if(!on)try{speechSynthesis.cancel()}catch(e){}}
function renderSpeakBtn(){const b=$('#speakBtn');if(!b)return;const on=S.speech!==false;b.textContent=on?'🔊':'🔇';b.classList.toggle('off',!on);b.setAttribute('aria-label',on?'Pip talks out loud. Tap to make her quiet':'Pip is quiet. Tap to make her talk')}
(()=>{const b=$('#speakBtn');if(b)b.onclick=()=>{setSpeech(S.speech===false);if(S.speech!==false)speak('I will read everything to you.')};const c=$('#speechOn');if(c)c.addEventListener('change',renderSpeakBtn);renderSpeakBtn()})();
/* ---------- shared UI ---------- */
const prompt=$('#prompt'),stage=$('#stage'),msg=$('#msg'),controls=$('#controls'),turnEl=$('#turn');
const DOORS={pick:["Pip's pick",'What is due today'],think:['Think','One good idea'],sud:['Sudoku','Rows, columns, boxes'],sand:['Playground','Just play'],warm:['Warm-ups','Count the dots'],add:['Add & take','Sticks of ten'],pat:['Patterns','What comes next?'],puz:['Puzzles','Think hard'],story:['Stories','Read and solve'],space:['Shapes & space','Look closely'],time:['Time','Clocks and days'],meas:['Measure','Halves, lengths, guesses'],reason:['Reasoning','Spot the rule'],make:['Makes it','You hide, I guess']};
const doorName=room=>room==='make'?`${KID()} makes it`:DOORS[room][0];
function show(id){document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==id);window.scrollTo(0,0);if(id==='home'||id==='done')bugs('wave');const c=document.getElementById('confetti');if(c&&id!=='done'){cancelAnimationFrame(window.__cf);c.getContext('2d').clearRect(0,0,c.width,c.height)}}
let ctx=null; // current problem context
window.__ng=()=>({ctx,tricks:typeof TRICKS==='undefined'?null:TRICKS,view3d,view3dBox,el,show,snapshot,playToday}); // read-only hook for the headless checks
function say(t,good){msg.textContent=t;msg.className='msg'+(good?' good':'');if(t){void msg.offsetWidth;msg.classList.add('in')}} // the reflow restarts the bubble's pop-in on every new message
function cheer(){const c=pick(['Nice thinking!','You got it!','Yes!','That\'s it!','Great counting!','Clever!']);const who=S.duo&&ctx.turn===1?'Dad':S.name;return who?`${c.replace('!','')}, ${who}!`:c}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;let c=document.getElementById('confetti');if(!c){c=document.createElement('canvas');c.id='confetti';document.body.appendChild(c)}
  const x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#ff7a59','#ffc83d','#4cae7c','#5aa9e6','#9b6bd6'];
  const P=Array.from({length:70},()=>({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*12-4,r:4+Math.random()*4,c:cols[rnd(0,4)],a:Math.random()*6,s:(Math.random()-.5)*.3}));
  let t=0;if(window.__cf)cancelAnimationFrame(window.__cf);(function f(){x.clearRect(0,0,c.width,c.height);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.vx*=.99;p.a+=p.s;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()}if(++t<70)window.__cf=requestAnimationFrame(f);else x.clearRect(0,0,c.width,c.height)})()}
let ac;function ding(){if(S.sound===false)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const t=ac.currentTime;[523,659,784].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.0001,t+i*.09);g.gain.exponentialRampToValueAtTime(.15,t+i*.09+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.09+.25);o.start(t+i*.09);o.stop(t+i*.09+.3)})}catch(e){}}
function pad(max,onPick,cls){const p=el('div','pad'+(max>9?' six':'')+(cls?' '+cls:''));for(let i=0;i<=max;i++){const b=el('button','num',i);b.onclick=()=>onPick(i,b);p.appendChild(b)}return p}
function lock(p){p.querySelectorAll('button').forEach(b=>b.disabled=true)}
function numpad(onSubmit,digits){digits=digits||2;const nm=el('div','pad');let typed='';const show=el('div','typed','_');nm.appendChild(show);
  for(let i=0;i<10;i++){const k=el('button','num',i);k.onclick=()=>{if(typed.length<digits){typed+=i;show.textContent=typed}};nm.appendChild(k)}
  const clr=el('button','num','⌫');clr.onclick=()=>{typed=typed.slice(0,-1);show.textContent=typed||'_'};
  const ok=el('button','num go','That\'s it');ok.style.gridColumn='span 4';ok.onclick=()=>{if(!typed)return;const ans=+typed;typed='';show.textContent='_';onSubmit(ans,nm)};
  nm.shake=()=>{show.classList.remove('shake');void show.offsetWidth;show.classList.add('shake')};
  nm.append(clr,ok);return nm}
function choices(opts,onPick){const r=el('div','row');opts.forEach(o=>{const b=el('button','choice');if(typeof o==='string'||typeof o==='number')b.textContent=o;else b.appendChild(o.node);b.onclick=()=>onPick(o,b);r.appendChild(b)});return r}
function nextBtn(){const r=el('div','row');const last=S.trail&&S.trail.i>=S.trail.steps.length-1;const b=el('button','btn',last?(S.build?'Lay the brick':'Plant the flower'):'Next stone');b.onclick=()=>stepTrail();r.appendChild(b);return r}
/* every few wins: ask her to explain her thinking to a grown-up before moving on */
function tellPapa(){S.tellCount=(S.tellCount||0)+1;if(!ctx||(S.skill!=='think'&&(S.tellCount%3!==0||ctx.hints>0)))return;
  const card=el('div','note said',`<small>In your own words</small>How did you know? Say it out loud: "I knew because…"`);const r=el('div','row');card.appendChild(r);stage.appendChild(card);
  const keep=t=>{t=(t||'').trim().slice(0,160);if(!t)return;S.said=(S.said||[]).slice(0,19);S.said.unshift({t,skill:S.skill,d:Date.now()});addPage(`${KID()} said: "${t}"`,true);save();card.innerHTML=`<small>In your own words</small>"${t.replace(/</g,'&lt;')}" — written in ${P().pp} book.`;bugs('happy')};
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){const mic=el('button','btn','🎤 Say it');mic.onclick=()=>{try{const rec=new SR();rec.lang='en-US';rec.interimResults=false;mic.textContent='Listening…';mic.disabled=true;rec.onresult=e=>keep(e.results[0][0].transcript);rec.onerror=()=>{mic.textContent='🎤 Say it';mic.disabled=false;say('I could not hear that. Try again, or type it.',false)};rec.onend=()=>{mic.textContent='🎤 Say it';mic.disabled=false};rec.start()}catch(e){mic.hidden=true}};r.appendChild(mic)}
  const typ=el('button','btn quiet','✏️ Type it');typ.onclick=()=>{typ.hidden=true;const inp=el('input','saidin');inp.placeholder='I knew because…';inp.maxLength=160;const ok=el('button','btn','Keep');ok.onclick=()=>keep(inp.value);r.append(inp,ok);inp.focus()};r.appendChild(typ);
  const told=el('button','btn quiet','I said it out loud');told.onclick=()=>{told.disabled=true;told.textContent='Said!';addPage(`${KID()} explained out loud how ${P().s} solved a ${SK[S.skill].title} problem.`,false);save()};r.appendChild(told)}

/* mastery + reward */
/* a right number is not the end. Where a game offers a reason or a second way, the star waits for one: odd problems ask why, even ones ask for another way. A level-up needs at least one right reason at this level */
function nextGate(){const h=ctx.help;if(!h||ctx.lesson||ctx.gated)return null;const has=[h.reasons&&'why',h.ways&&'ways'].filter(Boolean);if(!has.length)return null;S.gateTurn=(S.gateTurn||0)+1;const kind=has.length===2?(S.gateTurn%2?'why':'ways'):has[0];return Object.assign({kind},kind==='why'?h.reasons:h.ways)}
function askGate(g,go){ctx.gated=true;const card=el('div','note gate',`<small>${g.kind==='why'?'Why?':'Another way'}</small>${g.q}`);const r=el('div','row cards');let tries=0;
  shuffle(g.opts).forEach(o=>{const b=el('button','choice',o.t);if(o.ok)b.dataset.right='1';b.onclick=()=>{if(o.ok){b.classList.add('hit');r.querySelectorAll('button').forEach(x=>x.disabled=true);if(tries===0&&g.kind==='why'){const m=S.m[S.skill];if(m)m.why=(m.why||0)+1}say(g.why||'That is the reason.',true);bugs('happy');sfx('pop');setTimeout(go,800)}
      else{b.classList.add('miss');b.disabled=true;tries++;ctx.hints++;say(o.no||'Not that one. Look at the picture and think again.',false);bugs('puzzled');if(tries>=2){r.querySelectorAll('button').forEach(x=>{if(x.dataset.right)x.classList.add('hit');x.disabled=true});setTimeout(()=>{say(`${g.why||''} Next time, think it through first.`,false);setTimeout(go,900)},900)}}};r.appendChild(b)});
  card.appendChild(r);stage.appendChild(card);say(g.kind==='why'?'Right number! Now tell me why.':'Right! Now show me another way.',true);bugs('happy');card.scrollIntoView({block:'nearest',behavior:'smooth'})}
/* think first: before the numpad, one tap about the shape of the answer (more or fewer, bigger or smaller). A wrong guess costs nothing but a sentence; the point is to think before touching a number */
function guessGate(g){const kids=[...controls.children];kids.forEach(k=>k.hidden=true);const card=el('div','note guess',`<small>Think first</small>${g.q}`);const r=el('div','row');
  shuffle(g.opts).forEach(o=>{const b=el('button','choice',o.t);if(o.ok)b.dataset.right='1';b.onclick=()=>{r.querySelectorAll('button').forEach(x=>x.disabled=true);if(o.ok){b.classList.add('hit');say(o.why||'Good thinking. Now the number.',true);bugs('happy');sfx('pop')}else{b.classList.add('miss');say(o.why||g.why||'Hmm. Read the story again, then the number.',false);bugs('puzzled')}setTimeout(()=>{card.remove();kids.forEach(k=>k.hidden=false)},1000)};r.appendChild(b)});card.appendChild(r);stage.appendChild(card);bugs('think')}
function win(text,noMastery){
  if(ctx.done)return;const gate=nextGate();if(gate){askGate(gate,()=>win(text,noMastery));return}
  ctx.done=true;say(text,true);bugs('happy');
  const m=S.m[S.skill]||(S.m[S.skill]={lv:1,streak:0,low:0});let levelUp=false;
  if(!noMastery){if(ctx.hints===0){m.streak++;m.low=0;if(m.streak>=3&&m.lv<MAX(S.skill)&&(!SK[S.skill].hasReasons||m.why)){m.lv++;m.streak=0;m.why=0;levelUp=true}}
    else{m.streak=0;if(ctx.hints>=2){m.low++;if(m.low>=2&&m.lv>1){m.lv--;m.low=0}}else m.low=0}}
  const mine=!(S.duo&&ctx.turn===1);
  if(mine){S.stars++;S.counts[S.skill]=(S.counts[S.skill]||0)+1;const day=Math.floor(Date.now()/864e5);S.last=S.last||{};S.last[S.skill]=day;if(!S.days.includes(day))S.days.push(day);
    if(ctx.hints===0){S.streakNow++;if(S.streakNow>S.bestStreak)S.bestStreak=S.streakNow}else{S.streakNow=0;say('You kept going and got it. That is what good thinkers do. '+text,true)}
    if(S.streakNow===3)setTimeout(()=>say(`Three in a row, ${KID()}!`,true),900);
    if(S.streakNow===5){setTimeout(()=>{say(`Five in a row! ${KID()} is unstoppable today.`,true);confetti()},900);addPage(`${KID()} got five right in a row, no clues needed.`,true)}
    if(S.streakNow===10){setTimeout(()=>{say(`TEN in a row! Papa, come and see this.`,true);confetti()},900);addPage(`${KID()} got TEN right in a row. Best streak ever: ${S.bestStreak}.`,true)}
    renderStreak();
    const line=ctx.help&&ctx.help.book?ctx.help.book:`finished a ${SK[S.skill].title} problem`;addPage(`${KID()} ${line}.`,false);var entry={d:Date.now(),s:S.skill,h:ctx.hints,lv:m.lv};S.log=((S.log||[]).concat(entry)).slice(-400);if(ctx.hints===0)(S.misses||[]).forEach(x=>{if(x.s===S.skill&&!x.beaten&&x.lv<=m.lv){x.beaten=Date.now()}});if(museumRetry!=null){const x=(S.misses||[])[museumRetry];if(x&&ctx.hints===0)x.beaten=Date.now();museumRetry=null} // a clean win beats every old slip on that game at that level or below
    if(levelUp){addPage(`${KID()} moved up in ${SK[S.skill].title}. ${SK[S.skill].grow?SK[S.skill].grow(m.lv):'The problems get a little bigger now.'}`,true);setTimeout(()=>{say(text+' You moved up!',true);confetti()},700)}
    checkBadges()}
  if(S.trail)S.trail.lit[S.trail.i]=true;
  S.turn=1-S.turn;save();ding();renderTrail();const hr=controls.querySelector('#helpRow');if(hr)hr.remove();controls.appendChild(nextBtn());if(mine&&!howKnow(entry))tellPapa();
}
/* how did you know: a game with no why or another-way gate still gets asked for its reason, about one win in four (the game's 2nd, 6th, 10th… win, so a check can set the count). The star and Next are already there, so the card never holds the child: one tap answers it, and a wrong tap is not a miss, Pip just says the real reason. The log entry gets how:1, and howOk once the first tap lands, for the weekly letter to read later */
const HOW_WRONG=['I guessed.','It is my favourite number.','The picture was big.'];
function howKnow(entry){const h=ctx.help;if(!h||ctx.lesson||S.skill==='think'||h.reasons||h.ways||!h.why||!entry||(S.counts[S.skill]||0)%4!==2)return false;const right=h.why.replace(/<[^>]+>/g,'').split(/(?<=[.!?])\s+/)[0].trim();if(!right)return false;
  const opts=shuffle([{t:right,ok:true}].concat(shuffle(HOW_WRONG).slice(0,2).map(t=>({t}))));const card=el('div','note gate how',`<small>How did you know?</small>Tell me how you knew it was ${h.answer!=null?h.answer:'that'}.`);const r=el('div','row cards');entry.how=1;save();
  opts.forEach(o=>{const b=el('button','choice',o.t);if(o.ok)b.dataset.right='1';b.onclick=()=>{r.querySelectorAll('button').forEach(x=>{x.disabled=true;if(x.dataset.right)x.classList.add('hit')});if(entry.howOk==null){entry.howOk=!!o.ok;save()}if(o.ok){say('Yes, that is how. '+h.why,true);bugs('happy');sfx('pop')}else{say('Here is the real reason: '+h.why,true);bugs('think')}};r.appendChild(b)});
  card.appendChild(r);stage.appendChild(card);card.scrollIntoView({block:'nearest',behavior:'smooth'});return true}
function addPage(text,big){S.book.unshift({t:text,d:Date.now(),big:!!big});if(S.book.length>200)S.book.length=200}
const KID=()=>S.name||'Sprout'; // a garden nickname until a name is typed in the grown-ups screen
/* pronouns, chosen in the grown-ups screen: P().s = she/he/they, .o = her/him/them, .p = her/his/their, .pp = hers/his/theirs, .self; vb(singular, plural) picks the verb form, so 'they' reads "they have" */
const PRO={she:{s:'she',o:'her',p:'her',pp:'hers',self:'herself'},he:{s:'he',o:'him',p:'his',pp:'his',self:'himself'},they:{s:'they',o:'them',p:'their',pp:'theirs',self:'themself'}};
const P=()=>PRO[S.pro]||PRO.she;const vb=(sg,pl)=>P().s==='they'?pl:sg;const cap=w=>w[0].toUpperCase()+w.slice(1);
function miss(hint){ctx.hints++;say(hint,false);bugs('puzzled');
  if(ctx.hints===1&&!ctx.lesson&&S.skill&&SK[S.skill]){const st=$('#stage .story');S.misses=((S.misses||[]).concat({d:Date.now(),s:S.skill,lv:ctx.lv||1,p:$('#prompt').textContent.slice(0,120),st:st?st.textContent.slice(0,160):'',beaten:false})).slice(-60);save()} // the first slip on a problem goes in the museum
  if(ctx.hints===2&&SK[S.skill]&&SK[S.skill].idea){const l=controls.querySelector('.learn');if(l){l.classList.add('glow');setTimeout(()=>say(hint+' Want Pip to show you the idea? Tap Learn.',false),1200)}}if(S.streakNow){S.streakNow=0;renderStreak()}const t=controls.querySelector('.typed');if(t){t.classList.remove('shake');void t.offsetWidth;t.classList.add('shake')}}
/* every game declares help({clues:[...], answer, why, show}) so the Clue / Show me buttons work the same everywhere */
function help(o){ctx.help=o;ctx.clueIdx=0;if(o.reasons&&SK[S.skill])SK[S.skill].hasReasons=true}
function helpRow(){const r=el('div','row');r.id='helpRow';const c=el('button','btn quiet','Clue'),s=el('button','btn quiet','Show me');
  c.onclick=()=>{if(ctx.done||!ctx.help)return;const cl=ctx.help.clues;say(cl[Math.min(ctx.clueIdx,cl.length-1)]);bugs('think');ctx.clueIdx++;ctx.hints++};
  s.onclick=()=>{if(ctx.done||!ctx.help)return;reveal()};r.append(c,s);
  if(SK[S.skill]&&SK[S.skill].teach){const w=el('button','btn quiet','Watch');w.onclick=()=>{if(ctx.done)return;const lv=S.m[S.skill].lv;teachNow(S.skill,lv,()=>play(S.skill))};r.appendChild(w)}
  if(SK[S.skill]&&SK[S.skill].idea){const l=el('button','btn quiet learn','Learn');l.onclick=()=>{const idea=IDEAS.find(i=>i.id===SK[S.skill].idea);if(idea)openIdea(idea,true)};r.appendChild(l)}return r}
function reveal(){const h=ctx.help;ctx.done=true;S.streakNow=0;renderStreak();controls.querySelectorAll('button').forEach(b=>{if(b.closest('#helpRow'))return;b.disabled=true});
  if(h.show)try{h.show()}catch(e){}
  say((h.answer!=null?`It's ${h.answer}. `:'')+(h.why||''),true);
  const m=S.m[S.skill]||(S.m[S.skill]={lv:1,streak:0,low:0});m.streak=0;m.low++;if(m.low>=2&&m.lv>1){m.lv--;m.low=0}S.turn=1-S.turn;save();
  const r=controls.querySelector('#helpRow');if(r)r.remove();controls.appendChild(nextBtn())}
function renderStars(){}

/* ---------- garden ---------- */
const FLOWER={pick:'#ff6b6b',sud:'#7b61ff',think:'#ff9f1c',warm:'var(--sky)',add:'var(--accent)',pat:'var(--leaf)',puz:'var(--plum)',story:'var(--sun)',space:'var(--sky)',time:'var(--plum)',meas:'var(--sun)',reason:'#5bc0eb'};
const WORDS=['no','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const inWords=n=>n<=20?WORDS[n]:String(n);
/* ---------- the garden grows: flower kinds, bushes, a tree, visitors ---------- */
/* a flower by kind: 0 daisy, 1 tulip, 2 sunflower, 3 bell. The kind comes from the flower's number, so the garden mixes as it grows */
function flowerSvg(x,y,ht,col,scale,kind){scale=scale||1;kind=kind||0;let h=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-ht}" stroke="var(--leaf)" stroke-width="${2.5*scale}"/><ellipse cx="${x-5*scale}" cy="${y-ht/2}" rx="${5*scale}" ry="${2.5*scale}" fill="var(--leaf)" transform="rotate(-30 ${x-5*scale} ${y-ht/2})"/>`;
  if(kind===1)return h+`<path d="M${x-5*scale} ${y-ht+2*scale} q${5*scale} ${-12*scale} ${10*scale} 0 q${-2*scale} ${8*scale} ${-5*scale} ${9*scale} q${-3*scale} ${-1*scale} ${-5*scale} ${-9*scale}z" fill="${col}"/><path d="M${x} ${y-ht+2*scale} v${-9*scale}" stroke="${col}" stroke-width="${2*scale}"/>`;
  if(kind===2){for(let p=0;p<8;p++){const a=p*45*Math.PI/180;h+=`<ellipse cx="${x+Math.cos(a)*6*scale}" cy="${y-ht+Math.sin(a)*6*scale}" rx="${3.6*scale}" ry="${2*scale}" fill="var(--sun)" transform="rotate(${p*45} ${x+Math.cos(a)*6*scale} ${y-ht+Math.sin(a)*6*scale})"/>`}return h+`<circle cx="${x}" cy="${y-ht}" r="${3.4*scale}" fill="#6b4f1d"/>`}
  if(kind===3)return h+`<path d="M${x-5*scale} ${y-ht+4*scale} q${5*scale} ${2*scale} ${10*scale} 0 l${-2*scale} ${-9*scale} q${-3*scale} ${-3*scale} ${-6*scale} 0z" fill="${col}"/><circle cx="${x}" cy="${y-ht+5*scale}" r="${1.4*scale}" fill="var(--sun)"/>`;
  for(let p=0;p<5;p++){const a=p*72*Math.PI/180;h+=`<circle cx="${x+Math.cos(a)*5*scale}" cy="${y-ht+Math.sin(a)*5*scale}" r="${3.8*scale}" fill="${col}"/>`}return h+`<circle cx="${x}" cy="${y-ht}" r="${2.6*scale}" fill="var(--sun)"/>`}
/* what the garden has reached: every 8 flowers a bush, a tree that sprouts at 20 and grows through 4 stages, and visitors that arrive at milestones */
const GARDEN_STAGES=[{at:5,visitor:'🦋',text:'A butterfly has come to visit.'},{at:12,visitor:'🐝',text:'A bee found the flowers.'},{at:20,tree:1,text:'A little tree has sprouted!'},{at:30,visitor:'🐦',text:'A bird sings in the garden.'},{at:40,tree:2,text:'The tree is growing tall.'},{at:55,visitor:'🐿️',text:'A squirrel lives here now.'},{at:70,tree:3,text:'The tree has leaves to sit under.'},{at:90,visitor:'🌈',text:'A rainbow over the garden!'},{at:110,tree:4,text:'The tree is full of fruit.'}];
function gardenStage(n){return GARDEN_STAGES.filter(s=>n>=s.at)}
function treeSvg(x,y,stage){if(!stage)return'';const s=[0,.5,.75,1,1][stage];let h=`<path d="M${x} ${y} v${-30*s-10}" stroke="#6b4f1d" stroke-width="${3+4*s}" stroke-linecap="round"/>`;
  if(stage===1)return h+`<ellipse cx="${x-5}" cy="${y-22}" rx="6" ry="3" fill="var(--leaf)" transform="rotate(-30 ${x-5} ${y-22})"/><ellipse cx="${x+5}" cy="${y-30}" rx="6" ry="3" fill="var(--leaf)" transform="rotate(30 ${x+5} ${y-30})"/>`;
  h+=`<circle cx="${x}" cy="${y-30*s-18}" r="${14+10*s}" fill="#4cae7c"/><circle cx="${x-12*s-6}" cy="${y-30*s-8}" r="${10+6*s}" fill="#5bbd8a"/><circle cx="${x+12*s+6}" cy="${y-30*s-8}" r="${10+6*s}" fill="#5bbd8a"/>`;
  if(stage>=4)for(let i=0;i<6;i++)h+=`<circle cx="${x-18+i*7}" cy="${y-48+(i%2)*10}" r="3" fill="#e63946"/>`;return h}
function bushSvg(x,y){return `<circle cx="${x}" cy="${y-8}" r="11" fill="#4cae7c"/><circle cx="${x-9}" cy="${y-4}" r="8" fill="#5bbd8a"/><circle cx="${x+9}" cy="${y-4}" r="8" fill="#5bbd8a"/>`}
/* the garden follows the real calendar: snow in winter, blossom in spring, a sun in summer, falling leaves in autumn. Flowers never go: they are earned */
const SEASONS={winter:{months:[11,0,1],sky:'#dfe9f3',soil:'#e8eef4',leaf:'#7fa08a',bits:['❄','❄','❄'],text:'It is winter in the garden.'},spring:{months:[2,3,4],sky:'#eaf7ee',soil:null,leaf:'#4cae7c',bits:['🌸','🌸','·'],text:'It is spring: blossom everywhere.'},summer:{months:[5,6,7],sky:'#fff8e1',soil:null,leaf:'#3f9a66',bits:['☀'],text:'It is summer in the garden.'},autumn:{months:[8,9,10],sky:'#fdf0e0',soil:'#a86b3c',leaf:'#d9822b',bits:['🍂','🍁','🍂'],text:'It is autumn: the leaves are falling.'}};
function season(d){const m=(d||new Date()).getMonth();return Object.keys(SEASONS).find(k=>SEASONS[k].months.includes(m))}
function drawGarden(){const svg=$('#gardenSvg');const n=S.flowers.length;const stage=gardenStage(n);const sn=season(),se=SEASONS[sn];const tree=Math.max(0,...stage.filter(s=>s.tree).map(s=>s.tree));const visitors=stage.filter(s=>s.visitor).map(s=>s.visitor);
  const fl=S.flowers.slice(-32);let h=`<rect x="0" y="0" width="400" height="150" fill="${se.sky}" opacity=".55"/><rect x="0" y="130" width="400" height="20" fill="${se.soil||'var(--soil)'}" rx="6"/>`;if(sn==='winter')h+=`<rect x="0" y="128" width="400" height="6" fill="#fff" rx="3"/>`;if(sn==='summer')h+=`<circle cx="44" cy="26" r="14" fill="#ffd166"/>`;
  h+=treeSvg(360,132,tree).replace(/#4cae7c/g,se.leaf).replace(/#5bbd8a/g,se.leaf).replace(/var\(--leaf\)/g,se.leaf);if(sn==='spring'&&tree)for(let i=0;i<8;i++)h+=`<circle cx="${340+(i*17)%44}" cy="${70+(i*23)%40}" r="3" fill="#ffb3c6"/>`;if(sn==='winter'&&tree)h+=`<ellipse cx="360" cy="${132-30-18}" rx="22" ry="5" fill="#fff"/>`;for(let b=0;b<Math.min(4,Math.floor(n/8));b++)h+=bushSvg(30+b*85,132);
  const day0=fl.length?Math.min(...fl.map(f=>f.day)):0;const off=S.flowers.length-fl.length;
  fl.forEach((f,i)=>{const k=off+i;const x=14+(i%16)*20.5,row=Math.floor(i/16),ht=28+((f.day-day0)%5)*7+row*10;h+=flowerSvg(x,130-row*4,ht,FLOWER[f.room]||'var(--accent)',1,Math.floor(k/3)%4)});
  const today=Math.floor(Date.now()/864e5);visitors.forEach((v,i)=>{const x=40+((today*37+i*113)%300),y=30+((today*17+i*71)%40);h+=`<text x="${x}" y="${y}" font-size="18" class="visitor" style="animation-delay:${i*.7}s">${v}</text>`});
  if(sn!=='summer'){const today=Math.floor(Date.now()/864e5);for(let i=0;i<7;i++)h+=`<text class="bit" x="${(today*13+i*57)%390}" y="${-10-(i*19)%60}" font-size="${sn==='winter'?12:14}" style="animation-delay:-${(i*1.3)%7}s;animation-duration:${7+(i%3)*2}s">${se.bits[i%se.bits.length]}</text>`}
  svg.innerHTML=h;const latest=stage.length&&n===stage[stage.length-1].at?stage[stage.length-1].text:null;
  $('#sign').textContent=latest?latest:n===0?`${KID()}'s garden is ready for its first flower.`:n===1?`${KID()} has grown one flower.`:(Math.floor(Date.now()/864e5)%3===0?se.text+' ':'')+`${KID()} has grown ${inWords(n)} flowers${tree?' and a tree':''}.`;
  const hb=$('#homeBug');if(hb)hb.classList.toggle('hover',S.streakNow>=3)}

/* ---------- Pip's story: a page opens every ten flowers ---------- */
/* a short picture story about Pip, read aloud if the child likes. Page 1 opens with the first flower, and every ten flowers open the next. It is the reward that is a story, not a count */
const STORY=[
 {t:`One morning Pip woke up in the garden and saw that the number 5 was missing. Not from a page. From the <em>world</em>. Four, then six. "That cannot be," said Pip.`,pic:'🐞 4 ❓ 6'},
 {t:`She asked the snail. "Did you see a 5?" The snail counted his spots. "One, two, three, four… six. Oh dear. I have lost a spot too."`,pic:'🐌 🔢'},
 {t:`Pip flew to the pond. The frogs were in a muddle. Five frogs on a log had become four frogs and a gap, and nobody knew who was missing.`,pic:'🐸🐸🐸🐸 🪵'},
 {t:`"Think," said Pip. "If four are here, and there is one gap, then one frog is somewhere else." That is how you find a missing one: count what is here, then look at the gap.`,pic:'🐸🐸🐸🐸 ➕ ❓'},
 {t:`They found the fifth frog under a lily pad, asleep. "I did not know I was a five," he said. "You are when there are four friends with you," said Pip.`,pic:'🪷 🐸 💤'},
 {t:`But the number 5 was still gone. Pip went to the bee, who counts everything. "Ten and ten and ten," hummed the bee. "I never use five. I use tens."`,pic:'🐝 10 10 10'},
 {t:`"Half of ten is five," said Pip. The bee stopped humming. "So it is. Then half my tens are missing too!" Numbers hold hands, Pip thought. Lose one and the others feel it.`,pic:'10 ✂️ 5 5'},
 {t:`In the apple tree, the butterfly was crying. She had five spots on each wing, and now she had four. "Ten spots," she said, "and now only eight. I am not myself."`,pic:'🦋 4 + 4'},
 {t:`Pip sat down and thought the hardest she had ever thought. Where does a number go when it is lost? Then she heard it. A tiny voice from inside a seed.`,pic:'🐞 💭 🌱'},
 {t:`"I am in here," said the 5. "A child counted me wrong yesterday, and I fell off the end of the counting." Pip laughed. "Then we count you back."`,pic:'🌱 5 🗣️'},
 {t:`One. Two. Three. Four. And Pip said it slowly and clearly, with the frog and the snail and the bee and the butterfly all together: <em>FIVE</em>. The seed cracked open.`,pic:'1 2 3 4 ✨5✨'},
 {t:`The 5 climbed out and stood between 4 and 6, where it belonged. The snail got his spot back. The butterfly got her ten. And Pip went home to bed, because thinking that hard makes a ladybug very sleepy. The end.`,pic:'4 5 6 🐞 😴'}
];
const storyPages=()=>S.flowers.length===0?0:Math.min(STORY.length,1+Math.floor((S.flowers.length-1)/10)); // page 1 with the first flower, then one every ten
let talePage=0;
function renderTale(){const open=storyPages();const i=Math.max(0,Math.min(talePage,STORY.length-1));talePage=i;const p=STORY[i];const box=$('#taleBox');const locked=i>=open;
  $('#taleTitle').textContent="Pip and the lost five";$('#talePage').textContent=`page ${i+1} of ${STORY.length}`;
  box.innerHTML=locked?`<div class="emo">🔒</div><p class="talelock">This page opens when the garden has ${i*10+1} flowers. ${S.flowers.length} so far: ${i*10+1-S.flowers.length} more to grow.</p>`:`<div class="emo talepic">${p.pic}</div><p class="taletext">${p.t}</p>`;
  document.querySelectorAll('#tale .readbtn').forEach(b=>b.remove());if(!locked){const rb=readBtn(()=>p.t.replace(/<[^>]+>/g,''));box.appendChild(rb)}
  $('#talePrev').disabled=i===0;$('#taleNext').disabled=i>=STORY.length-1||i>=open; // the next page can be looked at only once it is open
  const dots=$('#taleDots');dots.innerHTML=STORY.map((_,k)=>`<i class="${k<open?'open':''}${k===i?' now':''}"></i>`).join('')}
function openTale(){talePage=Math.max(0,Math.min(storyPages()-1,S.lastTalePage||0));renderTale();show('tale');S.counts.tale_opened=(S.counts.tale_opened||0)+1;save()}

/* ---------- the weekly letter: the last seven days on one screen, for a grown-up to read in a minute ---------- */
/* what to say at the table, by what the child played this week */
const TABLE_TALK={bar:'When she reads a story, ask "what do we know, and what do we want?" before any number is said.',detective:'Ask her to tell a story back in her own words, then "what is it asking?"',rewind:'Tell her a tiny story backwards at bedtime: "I have 5 now, I ate 2, how many did I start with?"',three:'Take one story and move the ? yourself: ask how many now, then how many she got, then how many at the start.',trick:'When a sum comes up, ask "which trick?" before "what is the answer?"',make:'Hold up fingers and ask how many more make ten.',missing:'Ask "7 and what makes 10?" instead of "what is 10 take away 7?"',both:'Put the same thing on both sides of a toy scale and ask what happens if you take one off each side.',think:'Ask "how do you know?" after any answer, right or wrong, and wait.',truth:'Play "true or not" with the shopping: "all the apples are red", "some of the bananas are green".',combo:'With two tops and two bottoms, ask how many outfits, and make them all.',pipslip:'Make a mistake on purpose and let her catch you.',talk:'Point at a group of things and ask "how did you see it?" rather than "how many?"',sudoku:'Ask which row, column or box is nearly full.',cubes:'Stack some blocks and ask what they look like from above, then from the front.',build:'Build a block stack from a drawing of its top view.',jar:'With a jar or a bowl of anything, ask "about how many?" before counting.',maketrue:'Ask whether 5 take away something could ever be 12.',flash:'Show her five fingers for one second and hide them: how many?',balance:'If one apple weighs the same as two plums, ask what three apples weigh.',tale:'Act a story out with real things before saying a number.',askq:'Give her two facts and ask "what could we ask?"',ways:'Ask for a second way to the same answer: "could you get 8 another way?"'};
const dayN=ms=>Math.floor(ms/864e5);
function weekData(){const now=Date.now(),from=now-7*864e5;const log=(S.log||[]).filter(e=>e.d>=from);const wins=log.filter(e=>e.s);const ideas=log.filter(e=>e.idea);
  const byGame={};wins.forEach(e=>{const g=byGame[e.s]||(byGame[e.s]={n:0,h:0,clean:0});g.n++;if(e.h>0)g.h++;else g.clean++});
  const days=new Set(wins.map(e=>dayN(e.d))).size;const flowers=S.flowers.filter(f=>f.day>=dayN(from)).length;const said=(S.said||[]).filter(e=>e.d>=from);
  const ups=S.book.filter(e=>e.d>=from&&/moved up in/.test(e.t));const thinks=wins.filter(e=>['think','truth','combo','pipslip','talk'].includes(e.s)).length;
  const tried=Object.entries(byGame).sort((a,b)=>b[1].n-a[1].n);const hard=tried.filter(([id,g])=>g.n>=2&&g.h/g.n>=.5).slice(0,3);const strong=tried.filter(([id,g])=>g.n>=2&&g.clean/g.n>=.8).slice(0,3);
  const talk=[];tried.forEach(([id])=>{if(TABLE_TALK[id]&&talk.length<3)talk.push(TABLE_TALK[id])});if(!talk.length)talk.push(TABLE_TALK.think);
  return{days,wins:wins.length,flowers,said,ups,thinks,tried,hard,strong,ideas,talk}}
function letterText(w){const k=KID(),s=P().s,title=id=>SK[id]?SK[id].title:id;const lines=[];
  lines.push(`${k}'s week in the Number Garden`);lines.push('');
  lines.push(w.wins?`${cap(s)} played on ${inWords(w.days)} day${w.days===1?'':'s'}, solved ${w.wins} problem${w.wins===1?'':'s'} and grew ${inWords(w.flowers)} flower${w.flowers===1?'':'s'}.${w.thinks?` ${w.thinks} of the problems were think problems.`:''}`:`${cap(s)} did not play this week. No pressure: the garden waits.`);
  if(w.said.length){lines.push('');lines.push('In '+P().pp+' own words:');w.said.slice(0,4).forEach(e=>lines.push(`  "${e.t}" (${title(e.skill)})`))}
  if(w.ups.length){lines.push('');lines.push('Moved up:');w.ups.slice(0,4).forEach(e=>lines.push('  '+e.t))}
  if(w.strong.length){lines.push('');lines.push('Solid right now: '+w.strong.map(([id,g])=>`${title(id)} (${g.clean} of ${g.n} without a clue)`).join(', ')+'.')}
  if(w.hard.length){lines.push('');lines.push('Worth doing together: '+w.hard.map(([id,g])=>`${title(id)} (clues on ${g.h} of ${g.n})`).join(', ')+'.')}
  if(w.ideas.length){lines.push('');lines.push('Big Ideas read: '+[...new Set(w.ideas.map(e=>{const i=IDEAS.find(x=>x.id===e.idea);return i?i.title:e.idea}))].join(', ')+'.')}
  lines.push('');lines.push('To say at the table this week:');w.talk.forEach(t=>lines.push('  • '+t));
  return lines.join('\n')}
function renderLetter(){const w=weekData();const text=letterText(w);const box=$('#letterBox');box.innerHTML='';text.split('\n').forEach((ln,i)=>{if(!ln){box.appendChild(el('div','gap'));return}const d=el('div',i===0?'lhead':/^  /.test(ln)?'lline':/:$/.test(ln)?'lsub':'lpara',ln.trim());box.appendChild(d)});
  $('#letterPlain').value=text;const cp=$('#copyLetter');cp.textContent='Copy the letter';cp.onclick=async()=>{try{await navigator.clipboard.writeText(text);cp.textContent='Copied'}catch(e){$('#letterPlain').hidden=false;$('#letterPlain').select();cp.textContent='Select and copy below'}}}

/* ---------- brick builds: a set grows one brick per finished trail; the garden keeps its flowers too ---------- */
/* original sets drawn as real-looking 3D bricks: isometric blocks with studs, light from the upper left, seams between bricks, a studded baseplate.
   A set is a stack of layers, bottom first; each layer is rows from the back to the front; each row runs left to right. Letters are colours, dots are air.
   Bricks are one stud deep and up to four long; they are laid layer by layer, back row to front, left to right, so a half-built set looks half built */
const BRICK_COL={R:'#e63946',B:'#1d6fd8',Y:'#f5c518',G:'#2a9d5c',K:'#2f2f33',W:'#f1f3f5',O:'#ff8c1a',P:'#9b5de5',N:'#8d5a3c',C:'#79c7f0',L:'#b8bec6',D:'#5c6470',T:'#e7c48a'};
const MODELS=[
 {id:'car',name:'race car',plate:'#8a9099',layers:[
  ['.KK....KK.','RRRRRRRRRR','RRRRRRRRRR','.KK....KK.'],
  ['R..RRRRR..','RRRRRRRRRR','RRRRRRRRRR','R..RRRRR..'],
  ['..........','....KCC..Y','....KCC..Y','..........'],
  ['.........Y','.........Y','.........Y','.........Y']]},
 {id:'castle',name:'castle',plate:'#4f9d4a',layers:[
  ['LLLLLLLL','L......L','L......L','L......L','LLL..LLL'],
  ['LLLLLLLL','L......L','L......L','L......L','LLL..LLL'],
  ['LL....LL','........','........','........','LL.NN.LL'],
  ['L......L','........','........','........','L......L'],
  ['R......R','........','........','........','R......R']]},
 {id:'rocket',name:'rocket',plate:'#7d8591',layers:[
  ['..O..','.OOO.','OOOOO','.OOO.','..O..'],
  ['..R..','.RWR.','RWWWR','.RWR.','..R..'],
  ['.....','.WWW.','.WWW.','.WWW.','.....'],
  ['.....','.WWW.','.WWW.','.WCW.','.....'],
  ['.....','.WWW.','.WWW.','.WWW.','.....'],
  ['.....','..R..','.RRR.','..R..','.....'],
  ['.....','.....','..R..','.....','.....']]},
 {id:'ship',name:'pirate ship',plate:'#3a86c8',layers:[
  ['..........','.NNNNNNNN.','.NNNNNNNN.','..........'],
  ['NNNNNNNNNN','NNNNNNNNNN','NNNNNNNNNN','NNNNNNNNNN'],
  ['NNNNNNNNNN','....N.....','..........','NNNNNNNNNN'],
  ['..........','..WWWWW...','..........','..........'],
  ['..........','..WWWWW...','..........','..........'],
  ['..........','..WWWWW...','..........','..........'],
  ['..........','....K.....','..........','..........']]},
 {id:'dragon',name:'dragon',plate:'#4f9d4a',layers:[
  ['.G.....G....','............','.G.....G....'],
  ['............','GGGGGGGGG...','............'],
  ['..PPPP......','.GGGGGGGG...','..PPPP......'],
  ['...PP.......','........GG..','...PP.......'],
  ['....P.......','.........GG.','....P.......'],
  ['............','.........GGO','............'],
  ['............','..........Y.','............']]},
 {id:'house',name:'house',plate:'#4f9d4a',layers:[
  ['TTTTT','T...T','T...T','TTNTT'],
  ['TTTTT','T...T','T...T','CT.TC'],
  ['RRRRR','RRRRR','RRRRR','RRRRR'],
  ['.....','.RRR.','.RRR.','.....'],
  ['.....','..R..','..D..','.....']]},
 {id:'train',name:'train',plate:'#6b7280',layers:[
  ['K.K..K..K.','DDDDDDDDDD','K.K..K..K.'],
  ['BBBBBBRRR.','BBBBBBRRR.','BBBBBBRRR.'],
  ['......RCR.','.BBBBBRRR.','......RCR.'],
  ['......RRR.','.K....RRR.','......RRR.'],
  ['..........','.K........','..........']]},
 {id:'unicorn',name:'unicorn',plate:'#e6a8d7',layers:[
  ['.W....W..','.........','.W....W..'],
  ['.........','PWWWWWW..','.........'],
  ['.........','PWWWWWWW.','.........'],
  ['......P..','......WW.','.........'],
  ['......P..','......WWW','.........'],
  ['......P..','.......Y.','.........']]}
];
MODELS.forEach(m=>{m.W=Math.max(...m.layers.map(l=>Math.max(...l.map(r=>r.length))));m.D=Math.max(...m.layers.map(l=>l.length));m.H=m.layers.length;m.pieces=[];
  m.layers.forEach((rows,y)=>rows.forEach((row,z)=>{let x=0;while(x<row.length){const k=row[x];if(k==='.'){x++;continue}let L=1;while(L<4&&row[x+L]===k)L++;m.pieces.push({x,y,z,L,k});x+=L}}));m.total=m.pieces.length});
function tint(hex,k){const n=parseInt(hex.slice(1),16);const c=[n>>16,n>>8&255,n&255].map(v=>Math.round(k>0?v+(255-v)*k:v*(1+k)));return `rgb(${c.join(',')})`}
/* one picture of a set with the first `placed` bricks laid. opt: size (stud pitch in px), theta (turn, radians), ghost (show where the next brick goes), drop (the last brick falls in), plate (false hides the baseplate) */
function brickSvg(m,placed,size,opt){opt=opt||{};const s=size||22,a=s*.866,b=s*.5,h=s*1.05,th=opt.theta||0,cs=Math.cos(th),sn=Math.sin(th),cx=m.W/2,cz=m.D/2;
  const P=(x,y,z)=>{const X=(x-cx)*cs+(z-cz)*sn,Z=-(x-cx)*sn+(z-cz)*cs;return [(X-Z)*a,(X+Z)*b-y*h]};
  const pt=p=>p.map(v=>v.toFixed(1)).join(',');const poly=(pts,fill,extra)=>`<path d="M${pts.map(pt).join('L')}Z" fill="${fill}"${extra||` stroke="${fill}" stroke-width="${(s*.03).toFixed(2)}"`}/>`;
  const dx=cs>sn?1:-1,dz=sn+cs>0?1:-1;/* which end and which side face the viewer */
  const lx=-0.36,ly=0.77,lz=0.56;const lit=(nx,ny,nz)=>{const X=nx*cs+nz*sn,Z=-nx*sn+nz*cs;return Math.max(0,X*lx+ny*ly+Z*lz)};
  const shade=(col,n)=>{const d=lit(...n);return n[1]?tint(col,.16):tint(col,-.14-.36*(1-d))};
  const edge=`stroke="rgba(0,0,0,.28)" stroke-width="${(s*.045).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"`;
  const occ={},owner={};m.pieces.forEach((p,i)=>{if(i>=placed)return;for(let j=0;j<p.L;j++){occ[`${p.x+j},${p.y},${p.z}`]=1;owner[`${p.x+j},${p.y},${p.z}`]=i}});
  const at=(x,y,z)=>occ[`${x},${y},${z}`];const same=(x,y,z,i)=>owner[`${x},${y},${z}`]===i;
  const cube=(x,y,z,k,i,ghost)=>{const col=BRICK_COL[k];let o='';const g=ghost?' opacity=".45"':'';
    const top=!at(x,y+1,z),fx=!at(x+dx,y,z),fz=!at(x,y,z+dz);const X0=dx>0?x+1:x,Z0=dz>0?z+1:z;
    if(fz){const f=[P(x,y,Z0),P(x+1,y,Z0),P(x+1,y+1,Z0),P(x,y+1,Z0)];o+=poly(f,ghost?col:shade(col,[0,0,dz]),g);
      let e=`M${pt(f[0])}L${pt(f[1])}`;if(!same(x-1,y,z,i))e+=`M${pt(f[0])}L${pt(f[3])}`;if(!same(x+1,y,z,i))e+=`M${pt(f[1])}L${pt(f[2])}`;o+=`<path d="${e}" fill="none" ${edge}/>`}
    if(fx){const f=[P(X0,y,z),P(X0,y,z+1),P(X0,y+1,z+1),P(X0,y+1,z)];o+=poly(f,ghost?col:shade(col,[dx,0,0]),g);o+=`<path d="M${pt(f[0])}L${pt(f[1])}L${pt(f[2])}L${pt(f[3])}Z" fill="none" ${edge}/>`}
    if(top){const f=[P(x,y+1,z),P(x+1,y+1,z),P(x+1,y+1,z+1),P(x,y+1,z+1)];o+=poly(f,ghost?col:shade(col,[0,1,0]),g);
      let e=`M${pt(f[0])}L${pt(f[1])}M${pt(f[3])}L${pt(f[2])}`;if(!same(x-1,y,z,i))e+=`M${pt(f[0])}L${pt(f[3])}`;if(!same(x+1,y,z,i))e+=`M${pt(f[1])}L${pt(f[2])}`;o+=`<path d="${e}" fill="none" ${edge}/>`;
      if(!ghost&&s>=6)o+=stud(x+.5,y+1,z+.5,col)}
    return o};
  const stud=(x,y,z,col,plate)=>{const r=plate?.27:.3,rx=(1.2247*r*s).toFixed(1),ry=(.707*r*s).toFixed(1),hh=(plate?.12:.18)*h;const [bx,by]=P(x,y,z);const ty=by-hh;const side=tint(col,-.3),topc=tint(col,plate?.1:.22);
    return `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${rx}" ry="${ry}" fill="${side}"/><rect x="${(bx-rx).toFixed(1)}" y="${ty.toFixed(1)}" width="${(rx*2).toFixed(1)}" height="${hh.toFixed(1)}" fill="${side}"/><ellipse cx="${bx.toFixed(1)}" cy="${ty.toFixed(1)}" rx="${rx}" ry="${ry}" fill="${topc}"/>`};
  let out='';
  /* the baseplate: a thin studded slab a stud wider than the set on every side */
  if(opt.plate!==false){const x0=-1,x1=m.W+1,z0=-1,z1=m.D+1,t=.22,pc=m.plate||'#6b8f3a';const X0=dx>0?x1:x0,Z0=dz>0?z1:z0;
    out+=poly([P(x0,-t,Z0),P(x1,-t,Z0),P(x1,0,Z0),P(x0,0,Z0)],shade(pc,[0,0,dz]));out+=poly([P(X0,-t,z0),P(X0,-t,z1),P(X0,0,z1),P(X0,0,z0)],shade(pc,[dx,0,0]));
    out+=poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],shade(pc,[0,1,0]),` stroke="rgba(0,0,0,.2)" stroke-width="${(s*.04).toFixed(2)}"`);
    if(s>=9){const cells=[];for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++)if(!at(x,0,z))cells.push([x,z]);cells.sort((p,q)=>(P(p[0],0,p[1])[1]-P(q[0],0,q[1])[1]));cells.forEach(([x,z])=>out+=stud(x+.5,0,z+.5,pc,true))}}
  /* bricks, back to front, bottom to top */
  const plateOut=out;out='';const order=[];m.pieces.forEach((p,i)=>{if(i>=placed||(opt.drop&&i===placed-1))return;for(let j=0;j<p.L;j++)order.push({x:p.x+j,y:p.y,z:p.z,k:p.k,i})});
  const depth=c=>{const X=(c.x+.5-cx)*cs+(c.z+.5-cz)*sn,Z=-(c.x+.5-cx)*sn+(c.z+.5-cz)*cs;return X+Z+c.y*.999};order.sort((p,q)=>depth(p)-depth(q));
  order.forEach(c=>out+=cube(c.x,c.y,c.z,c.k,c.i));
  if(opt.drop&&placed>0){const p=m.pieces[placed-1];let g='';for(let j=0;j<p.L;j++)g+=cube(p.x+j,p.y,p.z,p.k,placed-1);out+=`<g class="dropin">${g}</g>`}
  if(opt.ghost&&placed<m.total){const p=m.pieces[placed];let g='';for(let j=0;j<p.L;j++)g+=cube(p.x+j,p.y,p.z,p.k,placed,true);out+=`<g class="ghost">${g}</g>`}
  if(opt.inner)out+=opt.inner(P,s,m);
  if(opt.gclass){const o=opt.origin?P(...opt.origin):[0,0];out=`<g class="${opt.gclass}" style="transform-origin:${o[0].toFixed(1)}px ${o[1].toFixed(1)}px">${out}</g>`}
  out=plateOut+out;if(opt.extra)out+=opt.extra(P,s,m);
  /* a frame that holds still while the set turns: the widest the plate and the set get at any angle */
  const padx=(opt.pad&&opt.pad.x||0)*s,pady=(opt.pad&&opt.pad.y||0)*h;const R=Math.hypot(m.W/2+1,m.D/2+1)*1.02,w=2*R*a+2*padx,top=-(m.H*h+R*b+s*.3)-pady,bot=R*b+.25*h+s*.1;
  return `<svg viewBox="${(-w/2).toFixed(1)} ${top.toFixed(1)} ${w.toFixed(1)} ${(bot-top).toFixed(1)}" style="width:${Math.min(opt.max||320,Math.round(w*1.05))}px;max-width:100%;display:block">${out}</svg>`}
let brickTurn=0;
function renderBricks(){const box=$('#bricks');if(!box)return;const b=S.build;box.innerHTML='';
  if(b){const m=MODELS.find(x=>x.id===b.model);const wrap=el('div','buildwrap');const d=el('div','buildnow');const draw=()=>{d.innerHTML=brickSvg(m,b.placed,22,{theta:brickTurn,ghost:true,max:340})};draw();turnBricks(d,draw);
    const art=el('div','boxart');art.innerHTML=brickSvg(m,m.total,7,{theta:.5,max:120})+'<small>the picture on the box</small>';wrap.append(d,art);
    const left=m.total-b.placed;const t=el('div','buildtext',`${KID()}'s ${m.name}: brick ${b.placed} of ${m.total}. ${left===0?'Finished!':`${left} more trail${left===1?'':'s'} to go. The see-through brick is the next one.`}`);box.append(wrap,t,el('small','turnhint','Drag the set to turn it around.'))}
  else{box.appendChild(el('div','buildtext','Pick a set to build. Every finished trail adds one brick.'));const shelf=el('div','modelshelf');MODELS.forEach(m=>{const c=el('button','modelcard');c.innerHTML=brickSvg(m,m.total,8,{theta:.5,max:140})+`<small>${m.name} · ${m.total} bricks</small>`;c.onclick=()=>{S.build={model:m.id,placed:0};brickTurn=0;save();renderBricks()};shelf.appendChild(c)});box.appendChild(shelf)}
  const done=(S.built||[]);if(done.length){const sh=el('div','builtshelf');sh.appendChild(el('small','',`Finished: ${done.length}`));const stage=el('div','buildnow finalebox');stage.hidden=true;sh.appendChild(stage);done.forEach(id=>{const m=MODELS.find(x=>x.id===id);if(!m)return;const d=el('button','builtone');d.innerHTML=brickSvg(m,m.total,6,{theta:.5,max:96});d.title=m.name;d.setAttribute('aria-label',m.name);d.onclick=()=>{stage.hidden=false;finale(stage,m,14)};sh.appendChild(d)});sh.appendChild(el('small','',"Tap a finished set to see it go."));box.appendChild(sh)}}
/* drag sideways to turn the set */
function turnBricks(d,draw){let px=null;d.onpointerdown=e=>{px=e.clientX;try{d.setPointerCapture(e.pointerId)}catch(e2){}};d.onpointermove=e=>{if(px===null)return;brickTurn+=(e.clientX-px)*.012;px=e.clientX;draw()};d.onpointerup=d.onpointercancel=()=>{px=null}}
/* a finished set puts on a show: each set has its own, with its own sound, then it turns on the turntable */
const FINALE={
 car:{sfx:'vroom',dur:3400,cls:'fin-car',theta:.25,pad:{x:4},extra:(P,s)=>{const [x,y]=P(0,1.5,2);return `<g class="fin-lines">${[0,1,2].map(i=>`<line x1="${(x-s*1.5).toFixed(1)}" y1="${(y-i*s*.55).toFixed(1)}" x2="${(x-s*4.5).toFixed(1)}" y2="${(y-i*s*.55).toFixed(1)}" stroke="rgba(0,0,0,.35)" stroke-width="${(s*.14).toFixed(1)}" stroke-linecap="round"/>`).join('')}</g>`}},
 dragon:{sfx:'roar',dur:3600,cls:'fin-bob',theta:.25,pad:{x:4,y:1},origin:[5.5,0,1.5],extra:(P,s,m)=>{const [x,y]=P(m.W,4.5,1.5);const f=(len,wid,col,cl)=>`<path class="flame ${cl}" style="transform-origin:${x.toFixed(1)}px ${y.toFixed(1)}px" d="M${x.toFixed(1)} ${(y-wid).toFixed(1)} Q${(x+len*.55).toFixed(1)} ${(y-wid*1.6).toFixed(1)} ${(x+len).toFixed(1)} ${(y-wid*.1).toFixed(1)} Q${(x+len*.55).toFixed(1)} ${(y+wid*1.4).toFixed(1)} ${x.toFixed(1)} ${(y+wid).toFixed(1)}Z" fill="${col}"/>`;return `<g class="fin-fire">${f(s*3.4,s*.9,'#e63946','f1')}${f(s*2.8,s*.7,'#ff8c1a','f2')}${f(s*1.9,s*.42,'#ffd93d','f3')}</g>`}},
 castle:{sfx:'fanfare',dur:3800,cls:'fin-bob',theta:.3,pad:{y:7},origin:[4,0,2.5],extra:(P,s)=>{const cols=['#e63946','#f5c518','#79c7f0','#9b5de5','#2a9d5c'];return `<g class="fin-fw">${[[1,9,1],[6.5,10,1],[4,11.5,4],[7.5,9,4.5],[1.5,10.5,4]].map(([x,y,z],i)=>{const [px,py]=P(x,y,z);const r=s*1.4;return `<g class="fw" style="transform-origin:${px.toFixed(1)}px ${py.toFixed(1)}px;animation-delay:${(i*.35).toFixed(2)}s">${[0,1,2,3,4,5,6,7].map(k=>{const a=k*Math.PI/4;return `<line x1="${(px+Math.cos(a)*r*.25).toFixed(1)}" y1="${(py+Math.sin(a)*r*.25).toFixed(1)}" x2="${(px+Math.cos(a)*r).toFixed(1)}" y2="${(py+Math.sin(a)*r).toFixed(1)}" stroke="${cols[(i+k)%5]}" stroke-width="${(s*.16).toFixed(1)}" stroke-linecap="round"/>`}).join('')}<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(s*.3).toFixed(1)}" fill="#fff"/></g>`}).join('')}</g>`}},
 rocket:{sfx:'whoosh',dur:4200,cls:'fin-rocket',theta:.3,pad:{y:1},inner:(P,s)=>{const [x,y]=P(2.5,0,2.5);return `<g class="exhaust" style="transform-origin:${x.toFixed(1)}px ${y.toFixed(1)}px"><path d="M${(x-s*1.1).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y+s*4.5).toFixed(1)} ${(x+s*1.1).toFixed(1)} ${y.toFixed(1)}Z" fill="#ff8c1a"/><path d="M${(x-s*.55).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y+s*2.8).toFixed(1)} ${(x+s*.55).toFixed(1)} ${y.toFixed(1)}Z" fill="#ffd93d"/></g>`},extra:(P,s)=>{const [x,y]=P(2.5,0,2.5);return `<g class="fin-smoke">${[-2.2,-1.1,0,1.1,2.2].map((k,i)=>`<circle class="smoke" style="transform-origin:${(x+k*s).toFixed(1)}px ${(y+s*.2).toFixed(1)}px;animation-delay:${(.3+i*.12).toFixed(2)}s" cx="${(x+k*s).toFixed(1)}" cy="${(y+s*.2).toFixed(1)}" r="${(s*.9).toFixed(1)}" fill="rgba(200,200,205,.85)"/>`).join('')}</g>`}},
 house:{sfx:'bell',dur:4000,cls:'fin-bob',theta:.3,pad:{y:4},extra:(P,s)=>{const [cx,cy]=P(2.5,5,2.5);const puffs=[0,1,2,3].map(i=>`<circle class="fpuff" style="transform-origin:${cx.toFixed(1)}px ${cy.toFixed(1)}px;animation-delay:${(i*.7).toFixed(2)}s" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*.5).toFixed(1)}" fill="rgba(210,210,215,.85)"/>`).join('');const glow=[[0.5,1.5,4],[4.5,1.5,4]].map(([x,y,z])=>{const [gx,gy]=P(x,y,z);return `<circle class="fglow" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${(s*.75).toFixed(1)}" fill="rgba(255,214,80,.75)"/>`}).join('');return `<g>${puffs}${glow}</g>`}},
 train:{sfx:'chuff',dur:4200,cls:'fin-train',theta:.25,pad:{x:2,y:3},inner:(P,s)=>{const [cx,cy]=P(1.5,5,1.5);return [0,1,2,3,4].map(i=>`<circle class="fpuff" style="transform-origin:${cx.toFixed(1)}px ${cy.toFixed(1)}px;animation-delay:${(i*.45).toFixed(2)}s" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*.6).toFixed(1)}" fill="rgba(235,235,240,.9)"/>`).join('')}},
 unicorn:{sfx:'sparkle',dur:4000,cls:'fin-jump',theta:.3,pad:{x:2,y:6},origin:[4.5,0,1.5],extra:(P,s,m)=>{const [cx,cy]=P(4.5,2,1.5);const cols=['#e63946','#ff8c1a','#f5c518','#2a9d5c','#1d6fd8','#9b5de5'];const bow=cols.map((c,i)=>`<path class="rainbow" d="M${(cx-s*8+i*s*.55).toFixed(1)} ${cy.toFixed(1)} A${(s*8-i*s*.55).toFixed(1)} ${(s*8-i*s*.55).toFixed(1)} 0 0 1 ${(cx+s*8-i*s*.55).toFixed(1)} ${cy.toFixed(1)}" fill="none" stroke="${c}" stroke-opacity=".8" stroke-width="${(s*.5).toFixed(1)}"/>`).join('');const sp=[[1,6,0],[7,7,0],[-0.5,4,2],[9.5,5,1],[4,9,1],[8,3.5,3]].map(([x,y,z],i)=>{const [px,py]=P(x,y,z);const r=s*.55;return `<path class="spark" style="transform-origin:${px.toFixed(1)}px ${py.toFixed(1)}px;animation-delay:${(i*.3).toFixed(2)}s" d="M${px.toFixed(1)} ${(py-r).toFixed(1)}Q${px.toFixed(1)} ${py.toFixed(1)} ${(px+r).toFixed(1)} ${py.toFixed(1)}Q${px.toFixed(1)} ${py.toFixed(1)} ${px.toFixed(1)} ${(py+r).toFixed(1)}Q${px.toFixed(1)} ${py.toFixed(1)} ${(px-r).toFixed(1)} ${py.toFixed(1)}Q${px.toFixed(1)} ${py.toFixed(1)} ${px.toFixed(1)} ${(py-r).toFixed(1)}Z" fill="#fff3b0" stroke="#f5c518" stroke-width="${(s*.08).toFixed(1)}"/>`}).join('');return `<g>${bow}${sp}</g>`}},
 ship:{sfx:'sea',dur:4200,cls:'fin-ship',theta:.3,pad:{x:3,y:1},origin:[5,0,2],extra:(P,s,m)=>{const [x0,y0]=P(-1,0,m.D+1),[x1]=P(m.W+1,0,m.D+1);const w=s*1.4;let d='';for(let x=x0-w*3;x<x1+w*3;x+=w)d+=`M${x.toFixed(1)} ${y0.toFixed(1)} q${(w/4).toFixed(1)} ${(-s*.35).toFixed(1)} ${(w/2).toFixed(1)} 0 t${(w/2).toFixed(1)} 0`;const [cx,cy]=P(m.W+.5,1.5,1.5);return `<g class="waves"><path d="${d}" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="${(s*.14).toFixed(1)}" stroke-linecap="round"/></g><g class="cannon" style="transform-origin:${cx.toFixed(1)}px ${cy.toFixed(1)}px"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s*1.1).toFixed(1)}" fill="rgba(240,240,240,.9)"/><circle cx="${(cx+s*.9).toFixed(1)}" cy="${(cy-s*.5).toFixed(1)}" r="${(s*.7).toFixed(1)}" fill="rgba(240,240,240,.9)"/><circle cx="${(cx-s*.2).toFixed(1)}" cy="${(cy-s*.9).toFixed(1)}" r="${(s*.6).toFixed(1)}" fill="rgba(240,240,240,.9)"/></g>`}}
};
function finale(d,m,size){const f=FINALE[m.id];const tok=d.finTok=(d.finTok||0)+1;if(!f){turntable(d,m,size);return}d.innerHTML=brickSvg(m,m.total,size,{theta:f.theta,max:340,pad:f.pad,gclass:f.cls,origin:f.origin,inner:f.inner,extra:f.extra});sfx(f.sfx);setTimeout(()=>{if(d.isConnected&&d.finTok===tok)turntable(d,m,size)},f.dur)}
/* little sounds for the finales, made on the spot */
function sfx(kind){if(S.sound===false)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const t=ac.currentTime;
  const osc=(type,f0,f1,dur,vol,at)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t+at);o.frequency.exponentialRampToValueAtTime(f1,t+at+dur);g.gain.setValueAtTime(.0001,t+at);g.gain.exponentialRampToValueAtTime(vol,t+at+.05);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);o.connect(g);g.connect(ac.destination);o.start(t+at);o.stop(t+at+dur+.05)};
  const noise=(dur,f0,f1,vol,at)=>{const n=Math.floor(ac.sampleRate*dur),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=b;const flt=ac.createBiquadFilter();flt.type='lowpass';flt.frequency.setValueAtTime(f0,t+at);flt.frequency.exponentialRampToValueAtTime(f1,t+at+dur);const g=ac.createGain();g.gain.setValueAtTime(.0001,t+at);g.gain.exponentialRampToValueAtTime(vol,t+at+.1);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);src.connect(flt);flt.connect(g);g.connect(ac.destination);src.start(t+at);src.stop(t+at+dur)};
  if(kind==='vroom'){osc('sawtooth',70,95,1.1,.1,0);osc('sawtooth',95,480,1.3,.12,1.1);noise(1.2,400,2500,.12,1.2);osc('square',880,880,.12,.06,2.5);osc('square',880,880,.12,.06,2.7)}
  else if(kind==='roar'){noise(1.6,250,1400,.25,.3);osc('sawtooth',120,55,1.6,.1,.3)}
  else if(kind==='fanfare'){[523,659,784,1047].forEach((f,i)=>osc('triangle',f,f,.3,.12,i*.17));osc('triangle',1047,1047,.9,.12,.75);osc('triangle',1319,1319,.9,.08,.75)}
  else if(kind==='whoosh'){noise(3.2,150,3500,.25,0);osc('sawtooth',55,28,2.8,.08,0)}
  else if(kind==='sea'){noise(3.5,500,900,.1,0);noise(.9,180,50,.35,1.4)}
  else if(kind==='bell'){osc('sine',659,659,.7,.15,.2);osc('sine',523,523,1,.15,.75)}
  else if(kind==='chuff'){[0,.45,.9,1.35,1.8,2.25].forEach(at=>noise(.3,900,200,.2,at));osc('triangle',880,880,.5,.1,2.6);osc('triangle',1109,1109,.9,.1,2.9)}
  else if(kind==='sparkle'){[1319,1568,1976,2637,1976,2637].forEach((f,i)=>osc('triangle',f,f,.35,.08,i*.16));osc('sawtooth',500,380,.5,.05,1.4);osc('sawtooth',380,520,.4,.05,1.9)}
  else if(kind==='tap')osc('sine',720,480,.06,.05,0) /* a soft click under every tap */
  else if(kind==='pop'){osc('sine',520,1040,.09,.12,0);osc('triangle',1040,1560,.08,.05,.07)}}catch(e){}} /* a bubble pop for a right answer */
/* the tap click under every big button, from the gesture itself so the audio context may start */
document.addEventListener('pointerdown',e=>{const b=e.target&&e.target.closest&&e.target.closest('.choice,.num,.pad button,.door,.btn,.back,.tab,.chip,.spk');if(b&&!b.disabled)sfx('tap')},{passive:true});
/* a finished set turns slowly on the done screen for a little while */
function turntable(d,m,size){let th=.3,n=0;const tok=d.finTok;const tick=()=>{if(!d.isConnected||d.finTok!==tok||n++>360)return;th+=.02;d.innerHTML=brickSvg(m,m.total,size,{theta:th,max:280});setTimeout(tick,50)};tick()}
function setGardenView(v){S.gview=v;save();$('#gardenWrap').hidden=v==='bricks';$('#bricks').hidden=v!=='bricks';$('#tabGarden').classList.toggle('on',v!=='bricks');$('#tabBricks').classList.toggle('on',v==='bricks');renderBricks()}
/* a finished trail lays a brick; a finished set goes on the shelf. Returns a line for the done screen, or '' */
function layBrick(){const b=S.build;if(!b)return'';const m=MODELS.find(x=>x.id===b.model);if(!m)return'';b.placed++;if(b.placed>=m.total){S.built=(S.built||[]).concat(m.id);S.build=null;addPage(`${KID()} finished building the ${m.name}, brick by brick.`,true);return `The ${m.name} is finished! Every brick came from a trail.`}return `Brick ${b.placed} of ${m.total} on the ${m.name}.`}

/* ---------- trails ---------- */
function makeTrail(door){ /* pure doors: all five stones come from the door she picked, cycling through its games with no two alike in a row */
  if(door==='pick'){S.trail={door:'pick',steps:pickTrail().steps,i:0,lit:[false,false,false,false,false]};save();return}
  const d=shuffle(Object.values(SK).filter(k=>k.room===door).map(k=>k.id));
  const steps=[];for(let i=0;i<5;i++)steps.push(d[i%d.length]);
  if(door!=='think'&&SK.think)steps[2]='think'; // the middle stone of every trail is a think problem: one good idea, written by hand, no numpad reflex
  S.trail={door,steps,i:0,lit:[false,false,false,false,false]};save()}
function renderStreak(){const c=$('#streakChip');if(!c)return;c.hidden=S.streakNow<2;c.textContent=`${S.streakNow} in a row`}
function renderTrail(){const t=$('#trail');t.innerHTML='';if(!S.trail)return;S.trail.steps.forEach((id,i)=>{const st=el('div','stone'+(S.trail.lit[i]?' lit':'')+(i===S.trail.i?' now':'')+(id==='think'?' think':''));t.appendChild(st)})}
/* play time: counted only while a playing view is on screen and the tab is visible, in 5-second ticks. The limit is minutes per day, 0 for none; a grown-up can add ten minutes for today */
const PLAY_VIEWS=['play','learn','playground','toy','tale'];const todayN=()=>Math.floor(Date.now()/864e5);
function playToday(){if(!S.today||S.today.day!==todayN())S.today={day:todayN(),ms:0,extra:0};return S.today}
function limitMs(){const t=playToday();const lim=S.limit==null?20:S.limit;return lim?lim*60000+(t.extra||0):Infinity}
function gardenClosed(){return playToday().ms>=limitMs()}
setInterval(()=>{if(document.visibilityState!=='visible')return;const on=PLAY_VIEWS.some(id=>{const v=$('#'+id);return v&&!v.hidden});if(!on)return;const t=playToday();t.ms+=5000;if(t.ms%60000<5000)save()},5000);
function showClosed(){const k=KID();$('#closedTitle').textContent='Pip is sleepy';$('#closedText').textContent=`${k} has played for a good while today. The garden opens again tomorrow. Everything is saved: the flowers, the book, the story.`;show('closed');$('#closedHome').onclick=()=>{renderHome();show('home')}}
/* Pip's pick: a trail of what is due, from the log. A game that needed clues lately and has not been done clean since is due; a game not played for five days is stale; a game never played is new. Think stone in the middle, as always */
function pickTrail(){const now=Date.now(),day=todayN();const log=(S.log||[]).filter(e=>e.s&&now-e.d<10*864e5);const pool=Object.values(SK).filter(k=>k.room!=='make'&&k.room!=='think'&&k.room!=='pick');
  const due=pool.filter(k=>{const es=log.filter(e=>e.s===k.id);const lastHint=[...es].reverse().find(e=>e.h>0);return lastHint&&!es.some(e=>e.h===0&&e.d>lastHint.d)}).map(k=>k.id);
  const stale=pool.filter(k=>S.last&&S.last[k.id]!=null&&day-S.last[k.id]>=5).map(k=>k.id);const fresh=pool.filter(k=>!S.counts[k.id]).map(k=>k.id);
  const steps=[];const take=(...lists)=>{for(const l of lists){const x=shuffle(l).find(id=>!steps.includes(id));if(x){steps.push(x);return true}}return false};
  take(due,stale,fresh);take(stale,fresh,due);take(due,fresh,stale);take(stale,due,fresh);while(steps.length<4)take([shuffle(pool.map(k=>k.id)).find(id=>!steps.includes(id))]);
  steps.splice(2,0,'think');return{steps:steps.slice(0,5),due,stale,fresh}}
function startTrail(door){if(gardenClosed())return showClosed();makeTrail(door);show('play');play(S.trail.steps[0])}
function stepTrail(){const tr=S.trail;if(!tr)return show('home');if(tr.i>=tr.steps.length-1)return finishTrail();if(gardenClosed()){S.trail=null;save();return showClosed()}tr.i++;save();play(tr.steps[tr.i])}
function finishTrail(){const tr=S.trail;const day=Math.floor(Date.now()/864e5);S.flowers.push({room:tr.door,day});const lit=tr.lit.filter(Boolean).length;S.trail=null;checkBadges();save();
  const brickLine=layBrick();if(brickLine){checkBadges();save()}const n=S.flowers.length,kind=Math.floor((n-1)/3)%4;const bf=$('#bigflower');bf.innerHTML=`<div class="water">🚿</div><svg viewBox="0 0 60 70"><g class="sprout">${flowerSvg(30,66,40,FLOWER[tr.door],2.2,kind)}</g></svg>`;
  const reached=GARDEN_STAGES.find(st=>st.at===n);const pageOpened=(n===1||(n-1)%10===0)&&storyPages()<=STORY.length?storyPages():0;const finished=brickLine&&!S.build;$('#doneTitle').textContent=reached?reached.text:pageOpened?`Page ${pageOpened} of Pip's story is open!`:finished?`${KID()} finished the set!`:brickLine?`A new brick for ${KID()}!`:`A new flower for ${KID()}!`;
  const walked=`${KID()} walked the whole ${doorName(tr.door)} trail${lit?` and solved ${inWords(lit)} problem${lit===1?'':'s'} ${P().self}`:' and looked carefully at every problem'}.`;
  $('#doneText').textContent=brickLine?`${brickLine} ${walked} A flower grew in the garden too: ${inWords(n)} now.`:`${walked} The garden now has ${inWords(n)} flower${n===1?'':'s'}.`;
  $('#bigflower').classList.toggle('aside',!!brickLine);
  addPage(`${KID()} finished the ${doorName(tr.door)} trail and planted flower number ${n}.`,true);
  show('done');drawGarden();confetti();ding();if(brickLine){const bb=$('#bigflower');if(S.build||/finished/.test(brickLine)){const m=MODELS.find(x=>S.build?x.id===S.build.model:x.id===(S.built||[]).slice(-1)[0]);if(m){const bd=el('div','buildnow');bd.innerHTML=brickSvg(m,S.build?S.build.placed:m.total,14,S.build?{drop:true,max:280}:{theta:.3,max:280});bb.before(bd);if(!S.build)finale(bd,m,14)}}}document.querySelectorAll('#done .buildnow').forEach((x,i,a)=>{if(i<a.length-1)x.remove()});if(reached){addPage(`${KID()}'s garden: ${reached.text}`,true);save()}const old=$('#readTale');if(old)old.remove();if(pageOpened){addPage(`Page ${pageOpened} of Pip's story opened for ${KID()}.`,true);save();const rb=el('button','btn','Read the new page');rb.id='readTale';rb.onclick=()=>{talePage=pageOpened-1;renderTale();show('tale')};$('#againBtn').parentNode.insertBefore(rb,$('#againBtn'))}$('#againBtn').onclick=()=>startTrail(tr.door);$('#homeBtn').onclick=()=>{renderHome();show('home')}}

/* ---------- badges ---------- */
const BADGES=[
 {id:'first',name:'First Flower',text:'planted the very first flower',test:()=>S.flowers.length>=1},
 {id:'tenbreaker',name:'Ten-Breaker',text:'solved ten take-away problems',test:()=>(S.counts.take||0)>=10},
 {id:'riddle',name:'Riddle Solver',text:'cracked five number riddles',test:()=>(S.counts.riddle||0)>=5},
 {id:'ways',name:'Many Ways',text:'found splits in five how-many-ways puzzles',test:()=>(S.counts.ways||0)>=5},
 {id:'build',name:'Builder',text:'built five stacks from their views',test:()=>(S.counts.build||0)>=5},
 {id:'setter',name:'Puzzle Setter',text:'set five sudokus for Pip',test:()=>(S.counts.setsudoku||0)>=5},
 {id:'guesser',name:'Good Guesser',text:'guessed a jar closely ten times',test:()=>(S.counts.jar||0)>=10},
 {id:'truemaker',name:'Sign Finder',text:'made ten number sentences true',test:()=>(S.counts.maketrue||0)>=10},
 {id:'catcher',name:'Slip Catcher',text:"caught Pip's mistake ten times",test:()=>(S.counts.pipslip||0)>=10},
 {id:'seer',name:'Number Seer',text:'saw a number three ways ten times',test:()=>(S.counts.talk||0)>=10},
 {id:'truth',name:'Truth Teller',text:'judged ten statements true or not',test:()=>(S.counts.truth||0)>=10},
 {id:'combo',name:'Every Way',text:'found every way five times',test:()=>(S.counts.combo||0)>=5},
 {id:'thinker',name:'Thinker',text:'thought through ten puzzles',test:()=>(S.counts.think||0)>=10},
 {id:'ownwords',name:'In My Own Words',text:'explained five answers in their own words',test:()=>(S.said||[]).length>=5},
 {id:'both',name:'Bag Weigher',text:'found the secret bag five times',test:()=>(S.counts.both||0)>=5},
 {id:'three',name:'Three Ways',text:'answered five stories three ways each',test:()=>(S.counts.three||0)>=5},
 {id:'detective',name:'Story Detective',text:'read ten stories like a detective',test:()=>(S.counts.detective||0)>=10},
 {id:'bars',name:'Bar Builder',text:'drew ten bars for stories',test:()=>(S.counts.bar||0)>=10},
 {id:'rewind',name:'Rewinder',text:'rewound five stories back to the start',test:()=>(S.counts.rewind||0)>=5},
 {id:'tricks',name:'Trick Namer',text:'named ten adding tricks',test:()=>(S.counts.trick||0)>=10},
 {id:'balance',name:'Balance Master',text:'balanced the scale five times',test:()=>(S.counts.balance||0)>=5},
 {id:'pattern',name:'Pattern Spotter',text:'spotted ten patterns',test:()=>((S.counts.cont||0)+(S.counts.machine||0))>=10},
 {id:'reader',name:'Story Reader',text:'read and solved ten story mysteries',test:()=>(S.counts.tale||0)>=10},
 {id:'garden',name:'Gardener',text:'grew ten flowers',test:()=>S.flowers.length>=10}
].concat(MODELS.map(m=>({id:'set_'+m.id,name:m.name.replace(/\b\w/g,c=>c.toUpperCase())+' Builder',text:`built the ${m.name}, brick by brick`,test:()=>(S.built||[]).includes(m.id),pic:()=>brickSvg(m,m.total,3,{theta:.5,plate:false,max:40})})));
function checkBadges(){BADGES.forEach(b=>{if(!S.badges[b.id]&&b.test()){S.badges[b.id]=Date.now();addPage(`${KID()} earned the ${b.name} badge: ${P().s} ${b.text}.`,true)}})}
let museumRetry=null;
function renderMuseum(){const l=$('#museumList');l.innerHTML='';const ms=(S.misses||[]).map((m,i)=>({m,i})).reverse();if(!ms.length){l.appendChild(el('div','page','Nothing here yet. A slip is not a bad thing: it is how we find out what to look at next.'));return}
  ms.forEach(({m,i})=>{const t=SK[m.s]?SK[m.s].title:m.s;const c=el('div','page museum'+(m.beaten?' beaten':''));c.innerHTML=`<b>${m.beaten?'🏆 ':''}${t}</b><div>${(m.st||m.p).replace(/</g,'&lt;')}</div><small>${new Date(m.d).toLocaleDateString(undefined,{month:'long',day:'numeric'})}${m.beaten?' · beaten '+new Date(m.beaten).toLocaleDateString(undefined,{month:'long',day:'numeric'}):''}</small>`;
    if(!m.beaten&&SK[m.s]){const b=el('button','btn quiet','Try one like it');b.onclick=()=>{if(gardenClosed())return showClosed();S.m[m.s]=S.m[m.s]||{lv:1,streak:0,low:0};S.m[m.s].lv=Math.min(m.lv,SK[m.s].levels);S.trail={door:SK[m.s].room,steps:[m.s],i:0,lit:[false]};museumRetry=i;save();show('play');play(m.s)};c.appendChild(b)}l.appendChild(c)})}
function renderBook(){$('#bookTitle').textContent=S.name?`${S.name}'s Book`:'My Book';const sh=$('#shelf');sh.innerHTML='';BADGES.forEach(b=>{const e=el('div','badge'+(S.badges[b.id]?'':' locked'),`<span>${S.badges[b.id]?(b.pic?b.pic():'🏅'):'○'}</span>${b.name}`);e.title=b.text;sh.appendChild(e)});
  const pg=$('#pages');pg.innerHTML='';if(!S.book.length)pg.appendChild(el('div','page',`This book is empty. Every problem ${KID()} solves writes a line here.`));
  S.book.forEach(e=>{const d=new Date(e.d);pg.appendChild(el('div','page'+(e.big?' big':''),`${e.t}<small>${d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</small>`))})}

/* tap-to-count: the child touches each object and it gets her number */
function tapCount(container,selector,onCount){let order=[];const items=()=>Array.from(container.querySelectorAll(selector));
  const renumber=()=>{items().forEach(d=>{const b=d.querySelector('b.tc');if(b)b.remove()});order.forEach((d,i)=>{const b=el('b','tc',i+1);d.appendChild(b)});if(onCount)onCount(order.length)};
  items().forEach(d=>{d.style.cursor='pointer';d.addEventListener('click',()=>{if(ctx&&ctx.done)return;if(order.includes(d))order=order.filter(x=>x!==d);else order.push(d);renumber()})})}
/* ---------- visuals ---------- */
const shapes={heart:c=>`<path d="M20 35 L6 20 A8 8 0 0 1 20 10 A8 8 0 0 1 34 20z" fill="${c}"/>`,diamond:c=>`<path d="M20 3L36 20 20 37 4 20z" fill="${c}"/>`,moon:c=>`<path d="M24 4a16 16 0 1 0 12 26 12 12 0 1 1-12-26z" fill="${c}"/>`,cross:c=>`<path d="M14 4h12v10h10v12H26v10H14V26H4V14h10z" fill="${c}"/>`,hex:c=>`<path d="M20 3l15 8.5v17L20 37 5 28.5v-17z" fill="${c}"/>`,circle:c=>`<circle cx="20" cy="20" r="16" fill="${c}"/>`,square:c=>`<rect x="5" y="5" width="30" height="30" rx="4" fill="${c}"/>`,tri:c=>`<path d="M20 4L37 35H3z" fill="${c}"/>`,star:c=>`<path d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="${c}"/>`};
const svgShape=(s,c)=>{const e=el('div');e.innerHTML=`<svg class="shape" viewBox="0 0 40 40">${shapes[s](c)}</svg>`;return e.firstChild};
function tenFrame(k,cls){const f=el('div','frame'+(cls?' '+cls:''));f.cells=[];for(let i=0;i<10;i++){const c=el('div','cell');const d=el('i');if(i>=k)d.className='empty';c.appendChild(d);f.appendChild(c);f.cells.push(d)}return f}

