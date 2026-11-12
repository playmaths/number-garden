/* ---------- wiring ---------- */
$('#gearBtn').onclick=()=>{renderLevels();renderVoices();show('sheet')};
$('#closeSheet').onclick=()=>{renderHome();show('home')};
$('#backBtn').onclick=()=>{if(S.welcomeStep)return endWelcome();show('home');renderHome()};
$('#bookBtn').onclick=()=>{renderBook();show('book')};$('#tabGarden').onclick=()=>setGardenView('garden');$('#tabBricks').onclick=()=>setGardenView('bricks');
$('#bookBack').onclick=()=>{show('home')};$('#museumBtn').onclick=()=>{renderMuseum();show('museum')};$('#museumBack').onclick=()=>{renderBook();show('book')};
$('#ideasBack').onclick=()=>{renderHome();show('home')};
$('#openLetter').onclick=()=>{renderLetter();show('letter')};$('#letterBack').onclick=()=>{renderLevels();show('sheet')};
$('#taleBack').onclick=()=>{S.lastTalePage=talePage;save();renderHome();show('home')};$('#talePrev').onclick=()=>{talePage--;renderTale()};$('#taleNext').onclick=()=>{talePage++;renderTale()};
$('#pgBack').onclick=()=>{renderHome();show('home')};
bugs('idle');
$('#tellBtn').onclick=()=>openTell('play');$('#tellBtn2').onclick=()=>openTell('learn');$('#tellBack').onclick=$('#tellReturn').onclick=()=>{show(tellFrom)};
$('#learnBack').onclick=()=>{if(learnFromGame&&S.trail){learnFromGame=false;show('play');play(S.trail.steps[S.trail.i])}else{renderIdeas();show('ideas')}};
$('#name').value=S.name;$('#name').oninput=e=>{S.name=e.target.value.trim();save();renderKids()};
function renderKids(){const l=$('#kidList');if(!l)return;l.innerHTML='';PROFILES.list.forEach(p=>{const c=el('span','chip'+(p.id===PROFILES.active?' on':''),profileName(p));if(p.id!==PROFILES.active){const x=el('button','x','×');x.title='remove this child from this device';x.onclick=()=>{if(confirm(`Remove ${profileName(p)}'s garden from this device? A family code can bring it back.`)){removeProfile(p.id);renderKids()}};c.appendChild(x);c.onclick=e=>{if(e.target===x)return;switchProfile(p.id)}}l.appendChild(c)})}
$('#addKid').onclick=()=>{const n=$('#newKid').value.trim();if(!n)return;addProfile(n)};
$('#pro').value=S.pro||'she';$('#pro').onchange=e=>{S.pro=e.target.value;save();renderLevels()};
$('#duo').checked=S.duo;$('#duo').onchange=e=>{S.duo=e.target.checked;save()};
$('#soundOn').checked=S.sound!==false;$('#soundOn').onchange=e=>{S.sound=e.target.checked;save()};$('#micOn').checked=S.mic===true;$('#micOn').onchange=e=>{S.mic=e.target.checked;save()};$('#talkOn').checked=S.talk===true;$('#talkOn').onchange=e=>{S.talk=e.target.checked;save();renderSpeakBtn()};$('#speechOn').checked=S.speech!==false;$('#speechOn').onchange=e=>{S.speech=e.target.checked;save()};
$('#limit').onchange=e=>{S.limit=+e.target.value;save();renderLimit()};$('#moreToday').onclick=()=>{const t=playToday();t.extra=(t.extra||0)+600000;save();renderLimit();renderHome()};
function renderLimit(){$('#limit').value=String(S.limit==null?20:S.limit);const t=playToday();const used=Math.round(t.ms/60000);const lim=S.limit==null?20:S.limit;$('#limitNote').textContent=lim?`${used} minute${used===1?'':'s'} played today of ${lim}${t.extra?` (+${t.extra/60000} extra today)`:''}. When the time is up, the current problem finishes and the garden closes until tomorrow. No clock is ever shown to the child.`:`${used} minute${used===1?'':'s'} played today. No limit set.`}
$('#note').value=S.note||'';$('#note').oninput=e=>{S.note=e.target.value;save()};
$('#gearBtn').addEventListener('click',()=>{$('#cloud').textContent=cloudLine();$('#family').value=S.family||'';famLine();renderReports()});
$('#family').oninput=e=>{const v=e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,'');e.target.value=v;S.family=v;store.set('ng2',S);/* no save(): typing a code is not new progress, so the family's copy stays newer */if(famOK()){famState='';famLine();famPull()}else famLine()};
$('#newFamily').onclick=()=>{S.family=newFamilyCode();$('#family').value=S.family;famState='';save();famLine();famPush()};
$('#resetAll').onclick=()=>{S.stars=0;S.dad=0;S.m={};S.turn=0;S.book=[];S.flowers=[];S.badges={};S.counts={};S.trail=null;S.streakNow=0;S.bestStreak=0;S.days=[];S.last={};S.tellCount=0;try{localStorage.removeItem('ng2_fast')}catch(e){}save();renderLevels()}; // Reset also drops the tests' fast-mode flag, should it ever be found on a real device
renderHome();connectCloud();famPull();sendReports();
/* installable: register the service worker when served from a real site (not from the claude.ai page, which has no sw.js) */
if('serviceWorker' in navigator&&location.protocol==='https:'&&!location.hostname.endsWith('claude.ai')){navigator.serviceWorker.register('sw.js').then(reg=>{try{reg.update()}catch(e){}}).catch(()=>{})}
/* a home-screen app does not reload when it is reopened: it comes back from memory with the build it had. So whenever the page becomes visible again (and once a minute while it is), a tiny version file is fetched past every cache and compared with this build's stamp; a newer build reloads the page on the home screen, never mid-problem (play state is saved anyway) */
async function checkBuild(){try{if(location.protocol!=='https:'&&!window.__ngFast)return;if(!/^[0-9a-f]{12}$/.test(APP_BUILD))return;const r=await fetch(window.__versionUrl||('version.txt?t='+Date.now()),{cache:'no-store'});/* __versionUrl: the tests point this at a mocked address, since a page opened from a file cannot fetch */if(!r.ok)return;const v=(await r.text()).trim();if(v&&v!==APP_BUILD){window.__newBuild=v;if(!$('#home').hidden)location.reload()}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkBuild()});setInterval(()=>{if(document.visibilityState==='visible')checkBuild()},60000);setTimeout(checkBuild,3000);
if(S.trail&&S.trail.steps&&S.trail.steps.every(id=>SK[id])){show('play');play(S.trail.steps[S.trail.i])}else{S.trail=null;if(welcomeDue())startWelcome();else show('home')}
})();
