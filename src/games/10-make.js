/* ================= ZOE MAKES IT ================= */
skill({id:'hide',room:'make',title:'You hide the number',idea:'compare',levels:1,mount(){
  prompt.textContent=`Pick a secret number from 1 to 20. Don't say it out loud!`;
  const p=pad(20,(v,b)=>{if(v<1)return;lock(p);p.remove();start(v)});controls.appendChild(p);
  let secret,lo=1,hi=20,asked=0,right=0,wrongs=[];
  const qs=[
    {t:n=>`Is it bigger than ${n}?`,mid:true,f:(s,n)=>s>n,teach:(s,n)=>`${s} is ${s>n?'bigger':'smaller'} than ${n}. Count up from ${Math.min(s,n)}: you reach ${Math.max(s,n)} after ${Math.abs(s-n)} steps.`,apply:(ans,n)=>{if(ans)lo=Math.max(lo,n+1);else hi=Math.min(hi,n)}},
    {t:()=>`Is it an odd number?`,f:s=>s%2===1,teach:s=>`Pair up ${s}: ${s%2?'one is left alone, so it is odd':'everyone has a partner, so it is even'}.`,apply:(ans)=>{par=ans?1:0}},
    {t:()=>`Does it have two digits?`,f:s=>s>=10,teach:s=>`${s} ${s>=10?'has two digits, a tens digit and a ones digit':'is a one-digit number'}.`,apply:(ans)=>{if(ans)lo=Math.max(lo,10);else hi=Math.min(hi,9)}}
  ];let par=null;
  function cands(){const a=[];for(let i=lo;i<=hi;i++)if(par==null||i%2===par)a.push(i);return a}
  function start(v){secret=v;say(`Secret saved. I will ask you questions and try to guess it.`);stage.innerHTML='';const lock1=el('div','story',`🔒 Your number is hidden. Answer my questions with Yes or No.`);stage.appendChild(lock1);ask()}
  function ask(){const c=cands();if(c.length===1||asked>=5)return guess(c);
    let q;if(asked===0)q=qs[0];else if(asked===1)q=qs[1];else if(asked===2&&lo<10&&hi>=10)q=qs[2];else q=qs[0];
    const n=q.mid?Math.floor((lo+hi)/2):0;const text=q.t(n);asked++;
    controls.innerHTML='';stage.querySelectorAll('.story.now').forEach(b=>{b.classList.remove('now');b.classList.add('asked')});const box=el('div','story now',`<small>Question ${asked}</small>${text}`);stage.appendChild(box);
    const ch=choices(['Yes','No'],(o,b)=>{lock(ch);const ans=o==='Yes';const truth=q.f(secret,n);box.appendChild(el('b','ans',` ${o}`));
      if(ans===truth){right++;b.classList.add('hit');q.apply(ans,n);say('Got it.',true);setTimeout(ask,ms(500))}
      else{b.classList.add('miss');wrongs.push(text);const t=el('div','hint',`Hmm, let's check that together. ${q.teach(secret,n)} So the answer is ${truth?'Yes':'No'}.`);stage.appendChild(t);
        if(q===qs[1]){stage.appendChild(pairUp(secret))}
        q.apply(truth,n);const r=el('div','row');const k=el('button','btn','Okay, keep going');k.onclick=()=>{say('');ask()};r.appendChild(k);controls.appendChild(r)}});
    ch.classList.add('bigpick');controls.appendChild(ch)}
  function guess(c){const g=c[0];controls.innerHTML='';stage.querySelectorAll('.story.now').forEach(b=>{b.classList.remove('now');b.classList.add('asked')});const box=el('div','story now',`<small>My guess</small>I think your number is <b>${g}</b>! Am I right?`);stage.appendChild(box);
    const ch=choices(['Yes!','No'],(o,b)=>{lock(ch);if(g===secret){b.classList.add(o==='Yes!'?'hit':'miss');
        help({book:`hid the number ${secret} and answered ${right} of ${asked} questions about it correctly`,clues:['',''],why:''});
        win(right===asked?`${cheer()} You answered every question right and I still found it. Hide a harder one next time!`:`I found it! ${asked-right} answer${asked-right>1?'s':''} needed a second look, and now you know.`)}
      else{say(`My guess was off, because one of the answers sent me the wrong way. Your number was ${secret}. Let's play again!`);help({book:`played hide the number with ${secret}`,clues:['',''],why:''});win(`Your number was ${secret}. Let's do another!`,true)}});
    ch.classList.add('bigpick');controls.appendChild(ch)}
  help({clues:['Pick a number and keep it secret. Then answer Yes or No.','If a question is hard, think about the pictures from Big Ideas.'],why:'You pick the number; I ask questions and guess it.'})}});

skill({id:'rulemaker',room:'make',title:'You make the rule',idea:'rules',levels:1,mount(){
  const rules=[1,2,3,4,5].map(n=>({t:'+'+n,f:x=>x+n})).concat([1,2,3].map(n=>({t:'−'+n,f:x=>x-n})),[{t:'double',f:x=>x*2}]);
  prompt.textContent='Choose a secret rule for your machine.';let rule=null,asked=0,right=0;
  const ch=choices(rules.map(r=>r.t),(o,b)=>{rule=rules.find(r=>r.t===o);lock(ch);ch.remove();stage.innerHTML='';stage.appendChild(el('div','story',`🔒 Your rule is hidden. I will put numbers in. You tell me what comes out.`));feed()});controls.appendChild(ch);
  const m=el('div','machine');stage.appendChild(m);
  const inputs=shuffle([2,3,4,5,6,7,8,9,10]);
  function feed(){if(asked>=3)return guess();const x=inputs[asked];asked++;controls.innerHTML='';
    const io=el('div','io',`<span>${x}</span><span>→</span><span class="q" style="color:var(--accent)">?</span>`);m.appendChild(io);if(!m.parentElement)stage.appendChild(m);
    say(`I put in ${x}. What comes out with your rule?`);
    controls.appendChild(numpad((v,nm)=>{const truth=rule.f(x);lock(nm);io.querySelector('.q').textContent=v;
      if(v===truth){right++;say('Okay!',true);setTimeout(feed,ms(500))}
      else{io.querySelector('.q').textContent=truth;io.querySelector('.q').style.color='var(--leaf)';const t=el('div','hint',`With your rule ${rule.t}, ${x} becomes ${truth}, not ${v}. ${rule.t==='double'?`Double means ${x} + ${x}.`:rule.t[0]==='+'?`Count up ${rule.t.slice(1)} from ${x}.`:`Count back ${rule.t.slice(1)} from ${x}.`}`);stage.appendChild(t);
        const r=el('div','row');const k=el('button','btn','Okay, keep going');k.onclick=()=>{t.remove();say('');feed()};r.appendChild(k);controls.appendChild(r)}},3))}
  function guess(){controls.innerHTML='';const g=rule;stage.appendChild(el('div','story',`I think your rule is <b>${g.t}</b>! Am I right?`));
    const c2=choices(['Yes!','No'],(o,b)=>{lock(c2);b.classList.add('hit');help({book:`made a secret rule (${rule.t}) and ran ${P().p} own machine`,clues:['',''],why:''});
      win(right===3?`${cheer()} Your machine worked perfectly and I cracked the rule.`:`I cracked it! ${3-right} output${3-right>1?'s':''} needed a second look.`)});c2.classList.add('bigpick');controls.appendChild(c2)}
  help({clues:['Pick a rule, then do that rule to each number I give you.','If you forget, the rule is shown only to you at the top: look at the choice you made.'],why:'You choose the rule; I give inputs and guess it.'})}});

skill({id:'writestory',room:'make',title:'You write the story',idea:'counton',levels:1,mount(){
  /* she picks a thing and two numbers; the ladybug solves it out loud, and now and then gets it wrong so she has to check */
  const k=KID(),max=12;const acts=[{t:'got',b:'get',v:1,q:'now'},{t:'found',b:'find',v:1,q:'now'},{t:'ate',b:'eat',v:-1,q:'left'},{t:'gave away',b:'give away',v:-1,q:'left'}]; // t is past tense for the story, b the base form for the question
  const st={thing:null,a:null,act:null,b:null};
  prompt.textContent='You write the story. I will try to solve it.';
  const box=el('div','story','');stage.appendChild(box);
  const words=()=>{if(!st.thing)return`<i>Tap to build your story…</i>`;let h=`${k} had `;if(st.a==null)return h+`<b>?</b> ${st.thing}…`;h+=`<b>${st.a}</b> ${st.thing}.`;if(!st.act)return h;
    h+=` Then ${P().s} ${st.act.t} <b>${st.b==null?'?':st.b}</b>${st.act.v>0?' more':''}.`;if(st.b!=null)h+=` How many ${st.thing} ${st.act.q==='left'?'are left':`${vb('does','do')} ${P().s} have now`}?`;return h};
  const chips=(opts,label,on)=>{controls.innerHTML='';controls.appendChild(el('div','hint',label));const c=choices(opts.map(x=>({node:x.node||el('span','',x.t),o:x.o})),(x,b)=>{b.classList.add('hit');lock(c);on(x.o)});controls.appendChild(c)};
  const ask=(label,lo,hi,on)=>{controls.innerHTML='';controls.appendChild(el('div','hint',label));const p=pad(hi,(v,b)=>{if(v<lo)return;b.classList.add('hit');lock(p);on(v)});for(let i=0;i<lo;i++)p.children[i].disabled=true;controls.appendChild(p)};
  const build=()=>{box.innerHTML=words();
    if(!st.thing)return chips(shuffle(THINGS).slice(0,4).map(t=>{const d=el('span');d.innerHTML=`<svg viewBox="0 0 40 40" width="30" height="30">${ICONS[t]}</svg> ${t}`;return{node:d,o:t}}),`What does ${k} have?`,t=>{st.thing=t;currentThing=t;build()});
    if(st.a==null)return ask('How many to start?',1,max,v=>{st.a=v;build()});
    if(!st.act)return chips(acts.filter(a=>a.v>0?st.a<max:st.a>1).map(a=>({t:a.t,o:a})),'Then what happened?',a=>{st.act=a;build()});
    if(st.b==null)return ask(`How many did ${P().s} ${st.act.b}?`,1,st.act.v>0?max-st.a:st.a-1,v=>{st.b=v;build()});
    solve()};
  function solve(){const ans=st.a+st.b*st.act.v,wrong=Math.random()<.4,said=wrong?ans+pick([-2,-1,1,2].filter(o=>ans+o>=0&&ans+o!==st.a)):ans;const add=st.act.v>0;
    const viz={type:add?'add':'take',a:st.a,b:st.b,ans};const sc=buildScene(viz);stage.appendChild(sc.sc);let fresh=true;
    const replay=()=>{const s2=buildScene(viz);stage.replaceChild(s2.sc,sc.sc);Object.assign(sc,s2)};const show=()=>{if(!fresh)replay();fresh=false;return actOut(viz,sc,null)};
    const steps=add?Array.from({length:st.b},(_,i)=>st.a+i+1):Array.from({length:st.b},(_,i)=>st.a-i-1);
    const miscount=Array.from({length:Math.abs(said-st.a)},(_,i)=>st.a+(said>st.a?i+1:-i-1)); // when wrong, the bug counts too far or not far enough, so the slip is in the counting
    help({book:`wrote a story about ${st.a} ${st.thing} and ${wrong?`caught a wrong answer (${said})`:`checked the answer ${ans}`}`,clues:[`Act it out with your fingers: start with ${st.a}, then ${st.act.t} ${st.b}.`,`${add?'Count on':'Count back'} from ${st.a}: ${steps.join(', ')}.`],answer:ans,why:`${st.a} ${add?'+':'−'} ${st.b} = ${ans}. I was ${wrong?'wrong':'right'}.`,show});
    controls.innerHTML='';const n=el('div','narr');n.innerHTML=`<svg class="bug think" viewBox="0 0 60 60">${BUG}</svg><div class="bubble">Hmm, let me think…</div>`;controls.append(n,helpRow());const bub=n.querySelector('.bubble');const my=ctx;
    setTimeout(()=>{if(ctx!==my)return;bub.innerHTML=`Start at ${st.a} and ${add?'count on':'count back'} ${st.b}: ${miscount.join(', ')}. So it's <em>${said}</em>! Am I right?`;
      const r=choices(['Yes!','No'],async(o,b)=>{if(ctx.done)return;const yes=o==='Yes!';lock(r);if(!fresh)replay();fresh=false;
        if(yes===!wrong){b.classList.add('hit');if(!wrong){win(`${cheer()} ${st.a} ${add?'+':'−'} ${st.b} is ${ans}.`);await show()}
          else{say(`Good catch! I said ${said}. What is it really?`,true);controls.insertBefore(numpad((v,nm)=>{if(v===ans){lock(nm);win(`${cheer()} It's ${ans}, not ${said}. You caught me!`);show()}else miss(ctx.hints===0?`Act it out: start with ${st.a}, then ${st.act.t} ${st.b}.`:`Count the picture after each step.`)},2),controls.querySelector('#helpRow'))}}
        else{b.classList.add('miss');miss(wrong?`Check me again. Start with ${st.a} and act it out.`:`Count it out: I was actually right this time.`);r.querySelectorAll('button').forEach(x=>x.disabled=false);b.disabled=true;await show()}});
      r.classList.add('bigpick');controls.insertBefore(r,controls.querySelector('#helpRow'))},ms(900))}
  build()}});

skill({id:'askq',room:'make',title:'You ask the question',idea:'reading',levels:1,mount(){
  /* the child builds a scene, then chooses what to ask about it; one card asks something the story already says. Pip answers the real question, and now and then gets it wrong, so the child checks */
  const k=KID(),who=pick(DET_NAMES),max=12;const st={thing:null,kind:null,a:null,b:null,q:null};
  prompt.textContent='You make the story and ask the question. I will answer.';
  const box=el('div','story','');stage.appendChild(box);
  const words=()=>{if(!st.thing)return'<i>Tap to build your story…</i>';if(!st.kind)return`Some ${st.thing}…`;
    if(st.kind==='two'){let h=`${k} has <b>${st.a==null?'?':st.a}</b> ${st.thing}.`;if(st.a!=null)h+=` ${who} has <b>${st.b==null?'?':st.b}</b> ${st.thing}.`;return h}
    let h=`${k} had <b>${st.a==null?'?':st.a}</b> ${st.thing}.`;if(st.a!=null)h+=` Then ${P().s} ${st.kind==='got'?'got':'gave away'} <b>${st.b==null?'?':st.b}</b>${st.kind==='got'?' more':''}.`;return h};
  const chips=(opts,label,on)=>{controls.innerHTML='';controls.appendChild(el('div','hint',label));const c=choices(opts.map(x=>({node:x.node||el('span','',x.t),o:x.o})),(x,b)=>{b.classList.add('hit');lock(c);on(x.o)});controls.appendChild(c)};
  const ask=(label,lo,hi,on)=>{controls.innerHTML='';controls.appendChild(el('div','hint',label));const p=pad(hi,(v,b)=>{if(v<lo)return;b.classList.add('hit');lock(p);on(v)});for(let i=0;i<lo;i++)p.children[i].disabled=true;controls.appendChild(p)};
  const build=()=>{box.innerHTML=words();
    if(!st.thing)return chips(shuffle(THINGS).slice(0,4).map(t=>{const d=el('span');d.innerHTML=`<svg viewBox="0 0 40 40" width="30" height="30">${ICONS[t]}</svg> ${t}`;return{node:d,o:t}}),'What is the story about?',t=>{st.thing=t;currentThing=t;build()});
    if(!st.kind)return chips([{t:`${k} and ${who} both have some`,o:'two'},{t:`${k} gets more`,o:'got'},{t:`${k} gives some away`,o:'gave'}],'What kind of story?',kd=>{st.kind=kd;build()});
    if(st.a==null)return ask(st.kind==='two'?`How many does ${k} have?`:`How many did ${k} have at the start?`,st.kind==='gave'?2:1,max,v=>{st.a=v;build()});
    if(st.b==null)return ask(st.kind==='two'?`How many does ${who} have?`:st.kind==='got'?`How many did ${P().s} get?`:`How many did ${P().s} give away?`,1,st.kind==='two'?max:st.kind==='got'?max-st.a:st.a-1,v=>{st.b=v;build()});
    if(!st.q)return pickQuestion();solve()};
  /* the questions: two that the story does not answer, one that it already does */
  const questions=()=>{if(st.kind==='two'){const big=Math.max(st.a,st.b),small=Math.min(st.a,st.b),bigWho=st.a>=st.b?k:who,smallWho=st.a>=st.b?who:k;return shuffle([{t:`How many ${st.thing} in all?`,ans:st.a+st.b,kind:'whole',why:`${st.a} and ${st.b} together: ${st.a+st.b}.`,pic:()=>barSvg({parts:[{n:st.a,t:st.a,col:'var(--accent)'},{n:st.b,t:st.b}],whole:'?'})},
      {t:st.a===st.b?`Who has more?`:`How many more does ${bigWho} have?`,ans:big-small,kind:'more',why:st.a===st.b?'They have the same: nobody has more, 0 more.':`Count up from ${small} to ${big}: ${big-small} more.`,pic:()=>barSvg({compare:[{n:st.a,t:`${k} ${st.a}`},{n:st.b,t:`${who} ${st.b}`}],gap:'?'})},
      {t:`How many does ${who} have?`,known:st.b}])}
    const now=st.kind==='got'?st.a+st.b:st.a-st.b;return shuffle([{t:`How many does ${k} have now?`,ans:now,kind:'now',why:`${st.a} ${st.kind==='got'?'+':'−'} ${st.b} = ${now}.`,pic:()=>barSvg(st.kind==='got'?{parts:[{n:st.a,t:st.a,col:'var(--accent)'},{n:st.b,t:st.b}],whole:'?'}:{parts:[{n:now,t:'?',q:1},{n:st.b,t:st.b}],whole:st.a})},
      {t:st.kind==='got'?`How many did ${k} have before ${P().s} got more?`:`How many did ${k} have before ${P().s} gave some away?`,known:st.a},
      {t:st.kind==='got'?`How many did ${k} get?`:`How many did ${k} give away?`,known:st.b}])};
  function pickQuestion(){const qs=questions();controls.innerHTML='';controls.appendChild(el('div','hint','What shall we ask? Pick a question the story does not already answer.'));
    const c=choices(qs.map(q=>q.t),(o,b)=>{const q=qs.find(x=>x.t===o);if(q.known!=null){b.classList.add('miss');b.disabled=true;say(`We already know that! The story says ${q.known}. Ask something the story does not tell us.`,false);bugs('think');return}b.classList.add('hit');lock(c);say('');st.q=q;build()});c.classList.add('cards');controls.appendChild(c)}
  function solve(){const q=st.q,ans=q.ans,wrong=Math.random()<.4;const said=wrong?ans+pick([-2,-1,1,2].filter(o=>ans+o>=0)):ans;
    box.innerHTML=words()+` <b>${q.t}</b>`;const pic=el('div','nline');pic.innerHTML=q.pic();stage.appendChild(pic);
    help({book:`made up a story about ${st.thing}, asked "${q.t}" and ${wrong?`caught a wrong answer (${said})`:`checked the answer ${ans}`}`,clues:['Look at the bar. Where is the ?',q.why],answer:ans,why:`${q.why} I was ${wrong?'wrong':'right'}.`,show:()=>{}});
    controls.innerHTML='';const n=el('div','narr');n.innerHTML=`<svg class="bug think" viewBox="0 0 60 60">${BUG}</svg><div class="bubble">Good question. Let me think…</div>`;controls.append(n,helpRow());const bub=n.querySelector('.bubble');const my=ctx;
    setTimeout(()=>{if(ctx!==my)return;bub.innerHTML=`${q.kind==='more'?`The gap between ${Math.min(st.a,st.b)} and ${Math.max(st.a,st.b)}`:q.kind==='whole'?`${st.a} and ${st.b} together`:`${st.a} ${st.kind==='got'?'and':'take away'} ${st.b}`}… it's <em>${said}</em>! Am I right?`;
      const r=choices(['Yes!','No'],(o,b)=>{if(ctx.done)return;const yes=o==='Yes!';lock(r);
        if(yes===!wrong){b.classList.add('hit');if(!wrong)win(`${cheer()} ${q.why} A good question, and a right answer.`);
          else{say(`Good catch! I said ${said}. What is it really?`,true);controls.insertBefore(numpad((v,nm)=>{if(v===ans){lock(nm);win(`${cheer()} It's ${ans}, not ${said}. You caught me!`)}else miss(ctx.hints===0?'Look at the bar. Where is the ?':q.why)},2),controls.querySelector('#helpRow'))}}
        else{b.classList.add('miss');miss(wrong?`Check me again. Look at the bar: ${q.why}`:`Count it out: I was actually right this time.`);r.querySelectorAll('button').forEach(x=>x.disabled=false);b.disabled=true}});
      r.classList.add('bigpick');controls.insertBefore(r,controls.querySelector('#helpRow'))},ms(900))}
  build()}});

/* ================= YOU SET THE SUDOKU: she places the clues, Pip solves out loud ================= */
/* a 4 by 4 board. The child places as many clues as she likes (a clash is refused, as always), then asks Pip to solve. Pip only ever uses "the only number left for this square" and "the only square left for this number", says each step, gets honestly stuck when the clues are not enough, and now and then makes a slip on purpose that the child has to catch */
skill({id:'setsudoku',room:'make',title:'You set the sudoku',idea:'evenodd',levels:1,
  async teach(lv,L){const box=el('div','story');const big=el('div','bigword','');L.scene.append(box,big);box.textContent='You put the clues in. I solve it.';L.say('This time the sudoku is <em>yours</em>. Put some numbers in the squares, any you like, as long as no row, column or box gets the same number twice.');await L.wait(2400);big.innerHTML='then tap <em>Pip, solve it</em>';L.say('Then I solve it, and I say why for every square. If your clues are not enough, I get stuck and ask for one more. And sometimes I make a mistake. Catch me!')},
  mount(){const N=4,br=2,bc=2;prompt.textContent='Put in some clues. Then let Pip solve it.';const grid=el('div','sud n4');const cells=[];let sel=null,solving=false;
    const box=i=>Math.floor(Math.floor(i/N)/br)*(N/bc)+Math.floor((i%N)/bc);const same=(i,j)=>Math.floor(i/N)===Math.floor(j/N)?'row':i%N===j%N?'column':box(i)===box(j)?'box':null;
    const clashOf=(i,v)=>cells.filter(x=>x.i!==i&&x.v===v&&same(i,x.i));
    for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N;const cell=el('button','sq'+((c+1)%bc===0&&c<N-1?' bR':'')+((r+1)%br===0&&r<N-1?' bB':''),'');cell.v=-1;cell.i=i;cell.onclick=()=>{if(ctx.done||solving)return;cells.forEach(x=>x.classList.remove('sel'));sel=cell;cell.classList.add('sel')};cells.push(cell);grid.appendChild(cell)}
    const hint=el('div','hint','Tap a square, then a number. At least four clues.');stage.append(grid,hint);
    const n=el('div','narr');n.innerHTML=`<svg class="bug think" viewBox="0 0 60 60">${BUG}</svg><div class="bubble">I am waiting for your clues…</div>`;const bub=n.querySelector('.bubble');stage.appendChild(n);
    const setCell=(cell,v,cls)=>{cell.v=v;cell.textContent=v<0?'':String(v+1);cell.dataset.v=v<0?'':String(v+1);cell.className=cell.className.replace(/ c\d/,'')+(v>=0?' c'+(v+1):'');if(cls)cell.classList.add(cls)};
    const p=el('div','pad four');for(let v=0;v<N;v++){const b=el('button','num c'+(v+1),v+1);b.onclick=()=>{if(!sel||ctx.done||solving)return;const cl=clashOf(sel.i,v);if(cl.length){const where=same(sel.i,cl[0].i);sel.classList.add('clash');setTimeout(()=>sel.classList.remove('clash'),ms(600));say(`${v+1} is already in that ${where}. A ${where} can only have one ${v+1}.`,false);return}setCell(sel,v,'given');sel.classList.add('given');playNote(v+2);say('')};p.appendChild(b)}
    const er=el('button','num','⌫');er.onclick=()=>{if(!sel||ctx.done||solving)return;setCell(sel,-1);sel.classList.remove('given')};p.appendChild(er);
    const go=el('button','num go','Pip, solve it');go.style.gridColumn='1/-1';p.appendChild(go);controls.appendChild(p);
    const givens=()=>cells.filter(x=>x.classList.contains('given')).length;
    /* one step of reasoning: a square with one number left, or a number with one square left in a row, column or box */
    const step=()=>{for(const cell of cells){if(cell.v>=0)continue;const used=new Set(cells.filter(x=>x.v>=0&&same(cell.i,x.i)).map(x=>x.v));if(used.size===N-1){const v=[...Array(N).keys()].find(k=>!used.has(k));return{cell,v,why:`this square's row, column and box already have ${[...used].map(x=>x+1).sort().join(', ')}, so it must be ${v+1}`}}}
      const units=[];for(let k=0;k<N;k++){units.push({t:'row',cs:cells.filter(x=>Math.floor(x.i/N)===k)});units.push({t:'column',cs:cells.filter(x=>x.i%N===k)});units.push({t:'box',cs:cells.filter(x=>box(x.i)===k)})}
      for(const u of units)for(let v=0;v<N;v++){if(u.cs.some(x=>x.v===v))continue;const spots=u.cs.filter(x=>x.v<0&&!clashOf(x.i,v).length);if(spots.length===1)return{cell:spots[0],v,why:`in this ${u.t}, ${v+1} fits nowhere else`}}return null};
    let slipCell=null,slipShown=-1;
    help({book:'set a sudoku for Pip and checked her solving',clues:['Give Pip a clue in every box to start with.','When Pip is stuck, add a clue in a square she could not decide.'],answer:null,why:'Pip solves with two moves: the only number left for a square, and the only square left for a number.',show:()=>{}});
    go.onclick=async()=>{if(ctx.done||solving)return;if(givens()<4){say('Pip needs at least four clues. Add a few more.',false);return}solving=true;go.disabled=true;cells.forEach(x=>x.classList.remove('sel'));sel=null;
      const my=ctx;let moves=0;const wrongAt=Math.random()<.35?rnd(2,4):-1;
      while(true){if(ctx!==my)return;const s=step();if(!s)break;moves++;
        if(moves===wrongAt){const others=[...Array(N).keys()].filter(k=>k!==s.v);const bad=pick(others);slipCell=s.cell;slipShown=bad;bub.innerHTML=`Hmm… ${s.why.replace(`must be ${s.v+1}`,`must be ${bad+1}`).replace(`${s.v+1} fits nowhere else`,`${bad+1} fits here`)}. <em>${bad+1}</em>.`;s.cell.classList.add('sel');setCell(s.cell,bad,'pipfill');s.cell.v=s.v}else{bub.innerHTML=`${s.why[0].toUpperCase()+s.why.slice(1)}. <em>${s.v+1}</em>.`;s.cell.classList.add('sel');setCell(s.cell,s.v,'pipfill')}
        playNote(s.v+2);await wait(1300);s.cell.classList.remove('sel')}
      const empty=cells.filter(x=>x.v<0);
      if(empty.length){bub.innerHTML=`I am <em>stuck</em>. ${empty.length} square${empty.length>1?'s':''} could still be two things. Put one more clue in one of the flashing squares and tap me again.`;empty.forEach(x=>x.classList.add('line'));setTimeout(()=>empty.forEach(x=>x.classList.remove('line')),ms(2500));bugs('think');solving=false;go.disabled=false;go.textContent='Pip, try again';return}
      bub.innerHTML=slipCell?`Done! Every square is full. Am I right?`:`Done! Every row, column and box has 1 to 4. Am I right?`;bugs('happy');
      const r=choices(['Yes!','No, there is a mistake'],(o,b)=>{if(ctx.done)return;const yes=o==='Yes!';if(yes===!slipCell){b.classList.add('hit');lock(r);if(!slipCell)win(`${cheer()} You set it, Pip solved it, and you checked it.`);else{say('Good catch! Tap the square that is wrong.',true);cells.forEach(x=>{if(x.classList.contains('pipfill'))x.onclick=()=>{if(ctx.done)return;if(x===slipCell){setCell(x,x.v,'pipfill');x.classList.add('hit');bub.innerHTML=`You found it. It should be <em>${x.v+1}</em>, not ${slipShown+1}. Fixed.`;win(`${cheer()} You caught Pip's slip: ${x.v+1}, not ${slipShown+1}.`)}else{miss(`Not that one. Look for a row, column or box with the same number twice.`);x.classList.add('clash');setTimeout(()=>x.classList.remove('clash'),ms(600))}}})}}
        else{b.classList.add('miss');b.disabled=true;miss(slipCell?'Look again. One row, column or box has the same number twice.':'Check each row, column and box. Pip was right this time.')}});r.classList.add('bigpick');controls.insertBefore(r,controls.firstChild)}}});

skill({id:'patmaker',room:'make',title:'You make the pattern',idea:'skip',levels:1,mount(){
  /* she builds a repeating pattern from four shapes; the ladybug says the rule and continues it, now and then wrongly, so she checks */
  const cols=['var(--accent)','var(--leaf)','var(--sky)','var(--plum)'],sh=shuffle(Object.keys(shapes));const units=sh.map((s,i)=>({s,c:cols[i],i}));
  prompt.textContent='Make a pattern that repeats. Tap shapes to add them.';
  const seq=el('div','seq');stage.appendChild(seq);const made=[];
  const hint=el('div','hint','Make it repeat at least twice, like 🔴🟢🔴🟢. Then tap Done.');stage.appendChild(hint);
  const draw=()=>{seq.innerHTML='';made.forEach(u=>{const it=el('div','it');it.appendChild(svgShape(u.s,u.c));seq.appendChild(it)});if(made.length<12)seq.appendChild(el('div','it q','+'))};draw();
  const period=a=>{for(let p=1;p<=Math.floor(a.length/2);p++){if(a.every((u,i)=>i<p||u===a[i-p]))return p}return 0}; // a unit of any length, as long as it repeats at least twice; a third repeat may be cut short
  const letters=p=>made.slice(0,p).map(u=>String.fromCharCode(65+made.slice(0,p).findIndex(x=>x===u))).join(' ');
  const pal=choices(units.map(u=>({u,node:svgShape(u.s,u.c)})),(o)=>{if(made.length>=12)return;made.push(o.u);draw();say('')});
  const r=el('div','row');const undo=el('button','btn quiet','⌫'),done=el('button','btn','Done');undo.onclick=()=>{made.pop();draw()};
  done.onclick=()=>{const p=period(made);if(made.length<4)return say('Add a few more shapes so I can see it repeat.');if(!p)return say('I can\'t see a repeat yet. Say it out loud: does it go round and round?');lock(pal);undo.disabled=done.disabled=true;solve(p)};
  r.append(undo,done);controls.append(pal,r);
  function solve(p){const ext=made.slice();for(let i=0;i<3;i++)ext.push(ext[ext.length-p]);const cont=ext.slice(-3); // each new one is the same as the one p back
    const wrong=Math.random()<.4;let said=cont.slice();if(wrong){const j=rnd(0,2);said[j]=pick(units.filter(u=>u!==cont[j]))}
    const rule=letters(p);const plus=seq.querySelector('.q');if(plus)plus.remove();const qs=[];said.forEach(u=>{const it=el('div','it q');it.appendChild(svgShape(u.s,u.c));seq.appendChild(it);qs.push(it)});hint.textContent='';
    help({book:`made the pattern ${rule} and ${wrong?'caught my mistake continuing it':'checked how I continued it'}`,clues:['Say your pattern out loud from the start. Keep going past the end.',`It repeats every ${p}. Each new one is the same as the one ${p} back.`],why:`Your pattern is ${rule}, over and over.`,show:()=>qs.forEach((it,i)=>{it.innerHTML='';it.appendChild(svgShape(cont[i].s,cont[i].c));it.style.borderColor='var(--leaf)'})});
    controls.innerHTML='';const n=el('div','narr');n.innerHTML=`<svg class="bug think" viewBox="0 0 60 60">${BUG}</svg><div class="bubble">Hmm, let me look…</div>`;controls.append(n,helpRow());const bub=n.querySelector('.bubble');const my=ctx;
    setTimeout(()=>{if(ctx!==my)return;bub.innerHTML=`I think your pattern goes <em>${rule}</em>, over and over. So the next three are the dotted ones. Am I right?`;
      const ch=choices(['Yes!','No'],(o,b)=>{if(ctx.done)return;const yes=o==='Yes!';lock(ch);
        if(yes===!wrong){b.classList.add('hit');if(!wrong){qs.forEach(it=>it.style.borderColor='var(--leaf)');win(`${cheer()} ${rule}, over and over, and I kept it going.`)}
          else{say('Good catch! Which one did I get wrong? Tap it.',true);qs.forEach((it,i)=>{it.style.cursor='pointer';it.onclick=()=>{if(ctx.done)return;if(said[i]===cont[i])return miss('That one fits. Which one breaks the pattern?');
            it.innerHTML='';it.appendChild(svgShape(cont[i].s,cont[i].c));it.style.borderColor='var(--leaf)';win(`${cheer()} That one should be the same as the one ${p} back. You caught me!`)}})}}
        else{b.classList.add('miss');miss(wrong?`Say the pattern out loud and keep going. Do all three dotted ones fit?`:`Check each dotted one: is it the same as the one ${p} back? I was right this time.`);ch.querySelectorAll('button').forEach(x=>x.disabled=false);b.disabled=true}});
      ch.classList.add('bigpick');controls.insertBefore(ch,controls.querySelector('#helpRow'))},ms(900))}
  help({clues:['Tap shapes in an order that repeats, like red, green, red, green.','When it repeats at least twice, tap Done and I will continue it.'],why:'You make the pattern; I say the rule and keep it going.'})}});

