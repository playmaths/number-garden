/* ================= SPOT THE RULE: figure matrices ================= */
/* a small figure language (shape, colour, size, count, fill, turn) and a matrix made from one base figure: one attribute changes across each row, one (or none) down each column, everything else stays the same.
   Every cell, the answer, the rule in words, each hint and the lesson are derived from those two choices, so nothing is hand-written per puzzle. The distractors are the answer with exactly one attribute wrong,
   so a child who checks only the row or only the column is caught and has to look both ways */
const MX_COL={red:'#e63946',blue:'#1d6fd8',green:'#2a9d5c',yellow:'#f5c518',purple:'#9b5de5'};
const MX_PATH={circle:'<circle cx="20" cy="20" r="15"/>',square:'<rect x="5" y="5" width="30" height="30" rx="3"/>',triangle:'<path d="M20 4L36 35H4z"/>',star:'<path d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"/>',heart:'<path d="M20 35L6 20A8 8 0 0 1 20 10a8 8 0 0 1 14 10z"/>'};
const MX_TURN=['triangle','star','heart']; // the shapes whose quarter turn can be seen; a circle or a square looks the same turned, so they never carry a turn
const MX_VALS={shape:Object.keys(MX_PATH),col:Object.keys(MX_COL),size:['small','mid','big'],count:[1,2,3],fill:['solid','hollow'],turn:[0,90]};
const MX_NAME={col:'The colour',shape:'The shape',size:'The size',count:'How many',fill:'Filled in or hollow',turn:'Which way it points'};
/* one figure: count copies side by side, scaled so three fit, filled with a dark edge or hollow with a thick coloured edge, turned about its middle. Colour is never the only difference: the shape is always there too */
function mxSvg(f,px){const sc={small:.5,mid:.72,big:.95}[f.size]*2.5*(f.count===1?1:f.count===2?.5:.33),c=MX_COL[f.col];let h='';
  for(let i=0;i<f.count;i++){const cx=f.count===1?50:f.count===2?[26,74][i]:[18,50,82][i];h+=`<g transform="translate(${cx} 50) rotate(${f.turn}) scale(${sc.toFixed(2)}) translate(-20 -20)" fill="${f.fill==='solid'?c:'none'}" stroke="${f.fill==='solid'?'#1a1a1a':c}" stroke-width="${f.fill==='solid'?1.5:4}" stroke-linejoin="round">${MX_PATH[f.shape]}</g>`}
  return `<svg viewBox="0 0 100 100" style="width:${px}px;height:${px}px;display:block">${h}</svg>`}
/* the grid, with the empty square dashed; hl lights one row or column, fill drops the answer in */
function mxGrid(cells,miss,px){const n=cells.length;const g=el('div','mx');g.style.cssText=`display:grid;grid-template-columns:repeat(${n},${px+12}px);gap:6px;padding:6px;border-radius:14px;background:var(--line)`;g.cells=[];
  cells.forEach((row,r)=>row.forEach((f,c)=>{const q=r===miss[0]&&c===miss[1];const d=el('div','mxc'+(q?' mxq':''));d.style.cssText=`width:${px+12}px;height:${px+12}px;border-radius:10px;background:var(--card);display:grid;place-items:center;box-sizing:border-box;transition:box-shadow .3s;${q?'border:3px dashed var(--accent);color:var(--accent);font-family:var(--display);font-size:2rem':''}`;d.innerHTML=q?'?':mxSvg(f,px);g.appendChild(d);g.cells.push(d)}));
  g.hl=(which,i,on)=>g.cells.forEach((d,k)=>{const r=Math.floor(k/n),c=k%n;d.style.boxShadow=on&&(which==='row'?r===i:c===i)?'0 0 0 4px var(--sun)':''});
  g.fill=f=>{const d=g.cells[miss[0]*n+miss[1]];d.innerHTML=mxSvg(f,px);d.style.border='3px solid var(--leaf)';d.classList.add('pop')};return g}
/* the rule in a child's words, from the attribute and the values it runs through */
function mxRule(a,vals){if(!a)return 'it stays the same';const n=vals.length;
  if(a==='col')return n===2?`${vals[0]} turns ${vals[1]}`:`the colour changes: ${vals.join(', ')}`;
  if(a==='shape')return n===2?`a ${vals[0]} becomes a ${vals[1]}`:`the shape changes: ${vals.join(', ')}`;
  if(a==='size')return n===2?(vals[1]==='big'?'it gets big':'it gets small'):'it grows';
  if(a==='count')return n===2?'there is one more':'one more each step';
  if(a==='fill')return vals[1]==='hollow'?'it goes hollow':'it gets filled in';
  return vals[1]===90?'it tips on its side':'it stands up'}
const mxWord=(a,v)=>a==='shape'?`a ${v}`:a==='col'?v:a==='size'?(v==='mid'?'medium sized':v):a==='count'?['','just one','two of them','three of them'][v]:a==='fill'?(v==='hollow'?'hollow':'filled in'):(v===90?'on its side':'standing up');
const mxDesc=f=>`the ${f.count>1?['','','two','three'][f.count]+' ':''}${f.size==='mid'?'medium':f.size} ${f.fill==='hollow'?'hollow ':''}${f.turn?'sideways ':''}${f.col} ${f.shape}${f.count>1?'s':''}`;
/* the generator: pick the across rule (and the down rule from level 2), roll a base figure, derive the cells, the answer and three distractors each one attribute off.
   The across distractor takes the value from the cell beside the gap and the down distractor the value from the cell above it: the two natural traps */
function mxProblem(lv){const n=lv===3?3:2;const pool=lv===3?['col','shape','count','size']:['col','shape','size','count','fill','turn'];
  const A=pick(pool),B=lv===1?null:pick(pool.filter(x=>x!==A)),rules=[A,B].filter(Boolean);const turning=rules.includes('turn');
  const lvVals=a=>a==='size'?(lv===3?['small','mid','big']:['small','big']):a==='shape'&&turning?MX_TURN:MX_VALS[a];
  const vals=a=>a==='size'?(lv===3?['small','mid','big']:shuffle(['small','big'])):a==='count'?(lv===3?[1,2,3]:pick([[1,2],[2,3]])):a==='fill'||a==='turn'?shuffle(MX_VALS[a]):shuffle(lvVals(a)).slice(0,n);
  const vA=vals(A),vB=B?vals(B):null;
  const base={shape:pick(lvVals('shape')),col:pick(MX_VALS.col),size:pick(lvVals('size')),count:pick(lv===3?[1,2]:[1,2,3]),fill:pick(MX_VALS.fill),turn:0};
  const cells=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>{const f=Object.assign({},base);f[A]=vA[c];if(B)f[B]=vB[r];return f}));
  const miss=lv===3?[2,rnd(0,2)]:[1,1],ans=cells[miss[0]][miss[1]];
  const consts=shuffle(Object.keys(MX_VALS).filter(x=>!rules.includes(x)&&(x!=='turn'||MX_TURN.includes(ans.shape))));
  const spoil=rules.concat(consts).slice(0,3).map(X=>{const f=Object.assign({},ans);
    if(X===A)f[X]=vA[(miss[1]+n-1)%n];else if(X===B)f[X]=vB[miss[0]-1];
    else if(X==='count')f[X]=pick([ans.count-1,ans.count+1].filter(v=>v>=1&&v<=3));else f[X]=pick(lvVals(X).filter(v=>v!==ans[X]&&!(X==='shape'&&ans.turn&&!MX_TURN.includes(v))));return{f,X}});
  const choices=shuffle([{f:ans,X:null}].concat(spoil));return{n,A,B,vA,vB,cells,miss,ans,choices,pick:choices.findIndex(c=>!c.X)}}
skill({id:'matrix',room:'reason',title:'Spot the rule',idea:'rule',levels:3,grow:lv=>['','Now something changes down the column too.','Now three across and three down, and the empty square can be anywhere in the bottom row.'][lv-1],
  async teach(lv,L){const n=lv===3?3:2,A=lv===3?'count':'col',B=lv===1?null:lv===2?'shape':'size',vA=lv===3?[1,2,3]:['red','blue'],vB=lv===2?['circle','square']:['small','mid','big'];
    const base={shape:lv===3?'heart':'circle',col:'red',size:lv===3?'small':'big',count:1,fill:'solid',turn:0};const cells=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>{const f=Object.assign({},base);f[A]=vA[c];if(B)f[B]=vB[r];return f}));const miss=lv===3?[2,1]:[1,1],ans=cells[miss[0]][miss[1]];
    const g=mxGrid(cells,miss,lv===3?62:84),big=el('div','bigword','');L.scene.append(g,big);
    L.say(`A picture puzzle. Something changes <em>across</em> each row, and something changes <em>down</em> each column. One square is empty. Pip reads it with her finger.`);await L.wait(2600);
    g.hl('row',0,true);big.innerHTML=lv===3?'1, 2, 3: <em>one more</em> each step':'same, same, only the <em>colour</em> changed';
    L.say(lv===3?`Finger <em>across</em> the top row: one heart, two hearts, three hearts. One more each step.`:`Finger <em>across</em> the top row: a red circle, then a blue circle. Same shape, same size. Only the <em>colour</em> changed: red turns blue.`);await L.wait(2800);
    g.hl('row',0,false);g.hl('col',miss[1],true);big.innerHTML=lv===1?'same, same: it <em>stays the same</em>':lv===2?'a circle becomes a <em>square</em>':'small, medium, big: it <em>grows</em>';
    L.say(lv===1?`Finger <em>down</em>: a blue circle, then the empty square. Down this column nothing changes, so the empty one is the same as the one above it.`:lv===2?`Finger <em>down</em> the first column: a red circle, then a red square. Same colour. Only the <em>shape</em> changed: a circle becomes a square.`:`Finger <em>down</em> this column: small, medium, then the empty square. It <em>grows</em>, so the last one is big.`);await L.wait(2800);
    g.hl('col',miss[1],false);big.innerHTML=lv===1?'blue <em>and</em> a circle':lv===2?'blue <em>and</em> a square':'two <em>and</em> big';
    L.say(lv===1?`So the empty one must be <em>blue</em>, from the row, AND a <em>circle</em>, the same as above. Both at once.`:lv===2?`So the empty one must be <em>blue</em>, from the row, AND a <em>square</em>, from the column. Both at once, not just one.`:`Its row says <em>two</em> hearts. Its column says <em>big</em>. So the empty one must be two big hearts. Both at once.`);await L.wait(2600);
    g.fill(ans);L.say(`There it is: ${mxDesc(ans)}. Across first, then down, then both together. Now you try.`)},
  mount(lv){const p=mxProblem(lv);const {n,A,B,vA,vB,cells,miss:gap,ans,choices:opts}=p;const px=n===3?(innerWidth<430?60:72):90;ctx.cells=cells;ctx.choices=opts.map(c=>c.f);ctx.missing=gap;
    prompt.textContent='Which one goes in the empty square?';const sc=el('div','scene');const g=mxGrid(cells,gap,px);const lab=el('div','hint','Look across, then down.');sc.append(g,lab);stage.appendChild(sc);
    const across=mxRule(A,vA),down=mxRule(B,vB),desc=mxDesc(ans);
    const act=async()=>{lab.textContent=`→ Across: ${across}.`;g.hl('row',0,true);await wait(1100);g.hl('row',0,false);lab.textContent=`↓ Down: ${down}.`;g.hl('col',gap[1],true);await wait(1100);g.hl('col',gap[1],false);g.fill(ans);lab.textContent=`Across, ${across}. Down, ${down}. So: ${desc}.`};
    const other=Object.keys(MX_VALS).filter(x=>x!==A&&x!==B&&(x!=='turn'||MX_TURN.includes(ans.shape)));
    const badWhy=[{t:'Because it is pretty',no:'Pretty is not a rule. Look at what changes across, then what changes down.'},{t:'Because it is the biggest one',no:'Big or small is not the reason. The row and the column say what it must be.',skip:'size'},{t:'Because it is my favourite colour',no:'A favourite is not a rule. Read the row across and the column down.'},{t:'Because it was the first one I saw',no:'First is not a reason. Check it against the row and the column.'}].filter(o=>o.skip!==A&&o.skip!==B).slice(0,2);
    help({book:`spotted the rule: across ${A==='count'?'there is one more':A==='size'?'it changes size':A==='col'?'it changes colour':A==='shape'?'it changes shape':A==='fill'?'it changes filled or hollow':'it turns'}, down ${B?(B==='count'?'there is one more':B==='size'?'it changes size':B==='col'?'it changes colour':B==='shape'?'it changes shape':B==='fill'?'it changes filled or hollow':'it turns'):'it stays the same'}`,
      pick:p.pick,idx:p.pick,answer:desc,clues:[`Look across the top row. What is the only thing that changes? ${cap(MX_NAME[A].toLowerCase())}: ${across}.`,`Now look down. ${cap(down)}. So the missing one must be ${mxWord(A,ans[A])} AND ${B?mxWord(B,ans[B]):'the same as the one above'}.`],
      why:`Across the row ${across}, and down the column ${down}. So the missing one is ${desc}.`,show:act,
      guess:lv===3?{q:'Before you look at the choices: what changes across the top row?',opts:[{t:MX_NAME[A],ok:1,why:`Yes: across, ${across}. Now find the one that fits the row and the column.`},{t:MX_NAME[B],why:`That is what changes going down. Across the top row, ${across}.`},{t:MX_NAME[pick(other)],why:`Look again: that stays the same across the row. Across, ${across}.`}]}:null,
      reasons:{q:'Why does that one fit?',opts:[{t:`Because across the row ${across} and down the column ${down}`,ok:1}].concat(badWhy),why:`Across, ${across}. Down, ${down}. Both at once.`},
      ways:{q:'Another way to find it?',opts:[{t:`Look across first, then down: it must be ${mxWord(A,ans[A])}, and ${B?mxWord(B,ans[B]):'the same as above'}`,ok:1},{t:`Look down first, then across: it must be ${B?mxWord(B,ans[B]):'the same as above'}, and ${mxWord(A,ans[A])}`,ok:1},{t:'Pick the one that looks nicest',no:'Nice is not a way. Across and down are the two ways, and both find it.'}],why:'Across then down, or down then across: both roads meet at the same square.'}});
    const row=choices(opts.map((c,i)=>({c,i,node:(()=>{const d=el('div','mxpick');d.innerHTML=mxSvg(c.f,64);return d})()})),(o,b)=>{if(ctx.done)return;
      if(!o.c.X){b.classList.add('hit');lock(row);act();win(`${cheer()} Across, ${across}. Down, ${down}. So it is ${desc}.`)}
      else{b.classList.add('miss');b.disabled=true;const X=o.c.X,f=o.c.f;miss(ctx.hints===0?(X===A?`That one is ${mxWord(X,f[X])}. Look across the row: ${across}, so it must be ${mxWord(X,ans[X])}.`:X===B?`That one is ${mxWord(X,f[X])}. Look down the column: ${down}, so it must be ${mxWord(X,ans[X])}.`:`That one is ${mxWord(X,f[X])}. ${MX_NAME[X]} never changes here: every one is ${mxWord(X,ans[X])}.`):`It must be ${desc}. Across, ${across}. Down, ${down}. Check both.`)}});
    row.querySelectorAll('.choice').forEach((b,i)=>{b.dataset.i=i;b.style.padding='6px'});controls.appendChild(row)}});
