/* ================= FOLD AND PUNCH ================= */
/* a square sheet on a 4 by 4 grid of hole spots is folded once or twice and punched. The fold line is a mirror: every hole gets a twin straight across it, the same distance away.
   A sheet is a 0/1 grid, so the open sheet is the punched holes OR their flip (flipH / flipV from Mirror it), choices are compared with sameGrid, and a fold's pictures and animations all come from one fold object */
const FC=26,FP=4,FW=FC*4+FP*2,FULL={x0:0,x1:4,y0:0,y1:4};
const PAPER=['#fff3c4','#d6e8ff','#d9f5e0','#ead9ff','#ffd9ee','#ffe3c7'];
const fcx=i=>FP+i*FC+FC/2;
const emptyG=()=>[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
const orG=(a,b)=>a.map((r,y)=>r.map((v,x)=>v||b[y][x]));
const cellsOf=g=>{const c=[];g.forEach((r,y)=>r.forEach((v,x)=>{if(v)c.push([x,y])}));return c};
const gridOf=cells=>{const g=emptyG();cells.forEach(([x,y])=>g[y][x]=1);return g};
const countG=g=>cellsOf(g).length;
const FOLD_WORD={L:'the left side over onto the right',R:'the right side over onto the left',T:'the top down onto the bottom',B:'the bottom up onto the top'};
/* a fold of a region: the half that swings (move), the half it lands on (stay), the mirror that twins a cell, the slide that a child who forgets the mirror would make, and the line */
function foldOf(reg,dir){const v=dir==='L'||dir==='R',xm=(reg.x0+reg.x1)/2,ym=(reg.y0+reg.y1)/2;
  const left={...reg,x1:xm},right={...reg,x0:xm},top={...reg,y1:ym},bottom={...reg,y0:ym};
  const move=dir==='L'?left:dir==='R'?right:dir==='T'?top:bottom,stay=dir==='L'?right:dir==='R'?left:dir==='T'?bottom:top;
  const m=([x,y])=>v?[reg.x0+reg.x1-1-x,y]:[x,reg.y0+reg.y1-1-y];const sh=v?(move.x0-stay.x0):(move.y0-stay.y0);const t=([x,y])=>v?[x+sh,y]:[x,y+sh];
  const line=v?[FP+xm*FC,FP+reg.y0*FC,FP+xm*FC,FP+reg.y1*FC]:[FP+reg.x0*FC,FP+ym*FC,FP+reg.x1*FC,FP+ym*FC];
  const dist=([x,y])=>Math.abs((v?x:y)+.5-(v?xm:ym))+.5; // spots from the hole to the fold line
  return{reg,dir,v,move,stay,m,t,line,dist,flip:v?flipH:flipV,word:FOLD_WORD[dir]}}
const dotsSvg=r=>{let h='';for(let y=r.y0;y<r.y1;y++)for(let x=r.x0;x<r.x1;x++)h+=`<circle cx="${fcx(x)}" cy="${fcx(y)}" r="2.4" fill="#1a1a1a" opacity=".22"/>`;return h};
const regRect=(r,extra)=>`<rect x="${FP+r.x0*FC}" y="${FP+r.y0*FC}" width="${(r.x1-r.x0)*FC}" height="${(r.y1-r.y0)*FC}" rx="3" ${extra}/>`;
const paperSvg=(r,col)=>regRect(r,`fill="${col}" stroke="#1a1a1a" stroke-width="1.6"`)+dotsSvg(r);
const holeSvg=([x,y])=>`<circle class="hole" cx="${fcx(x)}" cy="${fcx(y)}" r="7.5" fill="var(--bg)" stroke="#1a1a1a" stroke-width="1.6"/>`;
const svgWrap=(inner,w)=>`<svg viewBox="0 0 ${FW} ${FW}" style="width:${w}px;height:${w}px;max-width:100%;overflow:visible;display:block">${inner}</svg>`;
const sheetSvg=(g,col,w)=>svgWrap(paperSvg(FULL,col)+cellsOf(g).map(holeSvg).join(''),w);
/* a fold picture whose flap can swing: the moving half is drawn open in its own group, and scale(-1) about the fold line lays it on the other half. Folded, the holes punched through both layers sit on top of each other; opened, the flap's holes are the twins */
function foldPic(f,holes,col,w,folded){const d=el('div');const twins=cs=>cs.map(c=>holeSvg(f.m(c))).join('');
  d.innerHTML=svgWrap(regRect(f.move,`fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-dasharray="4 3" opacity=".5"`)+`<g class="base">${paperSvg(f.stay,col)}${holes.map(holeSvg).join('')}</g><g class="flap">${paperSvg(f.move,col)}${regRect(f.move,`fill="#000" opacity=".12"`)}${twins(holes)}</g><line class="fold" x1="${f.line[0]}" y1="${f.line[1]}" x2="${f.line[2]}" y2="${f.line[3]}" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>`,w);
  const svg=d.firstChild,flap=svg.querySelector('.flap'),line=svg.querySelector('.fold');flap.style.transformOrigin=f.v?`${f.line[0]}px 0px`:`0px ${f.line[1]}px`;const T=b=>f.v?`scaleX(${b?-1:1})`:`scaleY(${b?-1:1})`;flap.style.transform=T(folded);
  svg.swing=(to,ms)=>new Promise(res=>{const a=flap.animate([{transform:T(!to)},{transform:T(to)}],{duration:ms,easing:'ease-in-out',fill:'forwards'});a.onfinish=()=>{flap.style.transform=T(to);res()};setTimeout(res,ms+300)});
  svg.punch=cs=>{svg.querySelector('.base').insertAdjacentHTML('beforeend',cs.map(holeSvg).join(''));flap.insertAdjacentHTML('beforeend',twins(cs))};
  svg.pulse=()=>{line.animate([{strokeWidth:'3.5px'},{strokeWidth:'9px'},{strokeWidth:'3.5px'}],{duration:900,iterations:2})};
  return svg}
/* level 1: one fold, one hole. Level 2: one fold, two holes, picked or tapped. Level 3: fold in half, then in half again, one hole. steps[k] is the sheet after k folds are opened */
function foldProblem(lv){const col=pick(PAPER);let folds;
  if(lv<3)folds=[foldOf(FULL,pick(['L','R','T','B']))];else{const a=pick(['T','B']),b=pick(['L','R']);const first=Math.random()<.5?a:b;const f1=foldOf(FULL,first);folds=[f1,foldOf(f1.stay,first===a?b:a)]}
  const vis=folds[folds.length-1].stay;const spots=[];for(let y=vis.y0;y<vis.y1;y++)for(let x=vis.x0;x<vis.x1;x++)spots.push([x,y]);
  const holes=shuffle(spots).slice(0,lv===2?2:1);let g=gridOf(holes);const steps=[g];for(let i=folds.length-1;i>=0;i--){g=orG(g,folds[i].flip(g));steps.push(g)}
  return{col,folds,holes,U:g,steps,mode:lv===2&&Math.random()<.5?'tap':'pick'}}
/* plausible wrong sheets: twins across the wrong line, holes slid across instead of mirrored, a fold forgotten, one hole too many. Only sheets that differ from the answer and from each other are offered */
function foldWrongs(p){const {folds,U,steps}=p;const g0=steps[0];const slide=(f,g)=>orG(g,gridOf(cellsOf(g).map(f.t)));const extra=()=>{const g=U.map(r=>r.slice());const free=cellsOf(g.map(r=>r.map(v=>1-v)));const [x,y]=pick(free);g[y][x]=1;return g};
  let pool;if(folds.length===1){const f=folds[0];const one=gridOf(cellsOf(g0).slice(0,1));pool=[orG(g0,(f.v?flipV:flipH)(g0)),g0,extra(),slide(f,g0),countG(g0)===2?orG(g0,f.flip(one)):null]}
  else pool=[steps[1],slide(folds[0],steps[1]),slide(folds[0],slide(folds[1],g0)),extra()];
  const out=[];pool.forEach(g=>{if(g&&!sameGrid(g,U)&&!out.some(o=>sameGrid(o,g)))out.push(g)});return out.slice(0,3)}
function foldMount(lv){const p=foldProblem(lv);const {col,folds,holes,U,steps}=p;const n=countG(U),f1=folds[0],two=folds.length===2,w=two?64:76;ctx.holes=cellsOf(U).map(([x,y])=>y*4+x);ctx.mode=p.mode;
  prompt.textContent=p.mode==='tap'?'Fold, punch, open: tap every spot where a hole will be.':'Fold, punch, open: which sheet is it?';
  const sc=el('div','scene');const row=el('div','row');row.style.cssText='align-items:center;gap:6px;flex-wrap:nowrap';const arrow=()=>el('span','',`<span style="font-size:1.4rem;color:var(--muted)">→</span>`);
  const first=el('div');first.innerHTML=sheetSvg(emptyG(),col,w);const fp=foldPic(f1,two?[]:holes,col,w,true);row.append(first,arrow(),fp);const fp2=two?foldPic(folds[1],holes,col,w,true):null;if(fp2)row.append(arrow(),fp2);
  const slot=el('div','fslot','?');slot.style.cssText=`width:${w}px;height:${w}px;border:2px dashed var(--line);border-radius:6px;display:grid;place-items:center;font-family:var(--display);font-size:2rem;color:var(--muted)`;row.append(arrow(),slot);
  const capt=el('div','hint',`Fold ${f1.word}${two?', then '+folds[1].word:''}. Punch ${holes.length===1?'one hole':'two holes'}. Open it out.`);sc.append(row,capt);stage.appendChild(sc);
  const pulse=()=>{fp.pulse();if(fp2)fp2.pulse()};
  /* the unfold, one fold at a time: the flap swings back and the twins appear */
  const open=async()=>{slot.style.border='none';for(let i=folds.length-1;i>=0;i--){const svg=foldPic(folds[i],cellsOf(steps[folds.length-1-i]),col,w,true);slot.replaceChildren(svg);await wait(350);await svg.swing(false,1200)}const fin=el('div');fin.innerHTML=sheetSvg(U,col,w);fin.classList.add('pop');slot.replaceChildren(fin);capt.textContent=two?`1 hole, then 2, then ${n}: every fold doubles the holes.`:`${holes.length===1?'The hole has':'Each hole has'} a twin across the fold, the same distance away.`};
  const d=f1.dist(holes[0]),why=two?'One hole through four layers is four holes. Every fold doubles them: 1, 2, 4.':`A punch goes through both layers, so every hole has a twin across the fold, the same distance away: ${n} holes.`;
  const clues=two?['Open one fold at a time. Each fold gives every hole a twin.',`1 hole, open a fold: 2 holes. Open the other fold: 4 holes, in a mirror across both lines.`]:['Find the fold line. Each hole has a twin straight across it, the same distance away.',`Count the spots from the hole to the fold: ${d}. Go ${d} spot${d>1?'s':''} past the fold for its twin.`];
  const hint1=two?'Two folds. Open one fold at a time: 1 hole, then 2, then 4.':'The fold is here. The twin hole is the same distance on the other side of the fold.';
  const hint2=two?'Every hole gets a twin across each fold. Find the sheet with 4 holes, a mirror across both lines.':`The hole is ${d} spot${d>1?'s':''} from the fold, so its twin is ${d} on the other side. Find the sheet with ${n} holes, twins across the fold.`;
  const guess=lv===2?{q:'Think first: how many holes will the open sheet have?',opts:[{t:'2',why:'Every hole gets a twin across the fold. 2 holes punched make 4.'},{t:'4',ok:1,why:'Yes: each hole has a twin, so 2 make 4.'}]}
    :two?{q:'Two folds and one hole. How many holes when it is all open?',opts:[{t:'1',why:'One punch goes through every layer. Open it and count.'},{t:'2',why:'One fold makes 2. The second fold doubles them again: 4.'},{t:'4',ok:1,why:'Yes: 1, then 2, then 4. Every fold doubles the holes.'}]}:null;
  const gates=two?{reasons:{q:'Why are there 4 holes?',opts:[{t:'Because every fold doubles the holes: 1, 2, 4',ok:1},{t:'Because the paper is big',no:'A big sheet or a tiny one: one hole through four layers makes four holes.'},{t:'Because I punched hard',no:'Soft or hard, the punch goes through every layer. Four layers, four holes.'}],why:'Every fold doubles the holes: 1, 2, 4.'},
    ways:{q:'Another way to find the holes?',opts:[{t:'Unfold one fold at a time: 1 hole, then 2, then 4',ok:1},{t:'Count: each fold doubles, so 1, 2, 4',ok:1},{t:'Pick the sheet with the most holes',no:'More is not the rule. Two folds make exactly 4, in a mirror across both lines.'}],why:'Open a fold, double the holes; or count the doubling: 1, 2, 4.'}}:{};
  if(p.mode==='tap'){ /* a blank sheet: tap the spots. A wrong tap is a hint, not a miss, until Done is pressed */
    let marks=[];const grid=el('div');const dots=[];for(let y=0;y<4;y++)for(let x=0;x<4;x++)dots.push(`<circle class="tap" data-cell="${y*4+x}" cx="${fcx(x)}" cy="${fcx(y)}" r="10.5" fill="transparent" stroke="#1a1a1a" stroke-opacity=".18" stroke-dasharray="2 3" style="cursor:pointer"/>`);
    const draw=()=>{grid.innerHTML=svgWrap(paperSvg(FULL,col)+marks.map(i=>holeSvg([i%4,Math.floor(i/4)])).join('')+dots.join(''),w);cnt.textContent=marks.length?`You marked ${marks.length}`:'Tap a spot to punch it'};
    const cnt=el('div','counted','');slot.style.border='none';slot.replaceChildren(grid);sc.appendChild(cnt);draw();
    grid.onclick=e=>{const c=e.target.closest('.tap');if(!c||ctx.done||stage.querySelector('.guess'))return;const i=+c.dataset.cell;
      if(marks.includes(i)){marks=marks.filter(x=>x!==i);draw();return}
      if(ctx.holes.includes(i)){marks=marks.concat(i);playNote(marks.length*3);draw()}
      else{pulse();say(marks.length?'Not there. Count the spots from a hole to the fold line, then the same number past it.':'Not there. Find the fold line: every hole\'s twin is straight across it, the same distance away.',false);bugs('think')}};
    help({book:`tapped where the ${n} holes would be on the open sheet`,answer:n,clues,why,guess,show:async()=>{marks=ctx.holes.slice();draw();pulse();await wait(900);open()}});
    const r=el('div','row');const b=el('button','btn','Done');b.onclick=()=>{if(ctx.done)return;if(marks.length===n&&ctx.holes.every(i=>marks.includes(i))){b.disabled=true;open();win(`${cheer()} ${n} holes: every hole has a twin across the fold.`)}
      else{pulse();miss(ctx.hints===0?`You found ${marks.length} of ${n}. Every hole has a twin across the fold, the same distance away.`:`Count the spots from each hole to the fold line, then count the same past the line. ${n} holes in all.`)}};r.appendChild(b);controls.appendChild(r);return}
  const opts=shuffle([U].concat(foldWrongs(p)));const idx=opts.findIndex(g=>g===U);
  help(Object.assign({book:`unfolded the paper in ${P().p} head: ${n} holes`,pick:idx,answer:`the one with ${inWords(n)} holes, twins across the fold`,clues,why,guess,show:()=>{open();c.querySelectorAll('.choice').forEach((b,i)=>{if(i===idx)b.classList.add('hit')})}},gates));
  const c=choices(opts.map(g=>{const d=el('div');d.innerHTML=sheetSvg(g,col,58);return{g,node:d.firstChild}}),(o,b)=>{if(ctx.done)return;if(sameGrid(o.g,U)){b.classList.add('hit');lock(c);open();win(`${cheer()} ${n} holes: ${two?'1, then 2, then 4. Every fold doubles them.':'every hole has a twin across the fold.'}`)}
    else{b.classList.add('miss');b.disabled=true;pulse();miss(ctx.hints===0?hint1:hint2)}});controls.appendChild(c)}
skill({id:'fold',room:'reason',title:'Fold and punch',levels:3,grow:lv=>['','Now two holes, and sometimes you tap where the holes will be.','Now the paper is folded twice: one hole makes four.'][lv-1],
  async teach(lv,L){const sc=el('div','scene'),big=el('div','bigword','');L.scene.append(sc,big);const col=pick(PAPER);
    if(lv<3){const f=foldOf(FULL,'L');const hs=lv===1?[[3,1]]:[[2,0],[3,2]];const pic=foldPic(f,[],col,150,false);sc.appendChild(pic);
      L.say('Pip has a square sheet of paper with spots on it. Watch: she folds the left side over onto the right.');await L.wait(2200);await pic.swing(true,1300);await L.wait(600);
      pic.punch(hs);big.innerHTML=lv===1?'punch: 1 hole':'punch, punch: 2 holes';L.say(lv===1?'Punch! One hole, straight through <em>both</em> layers of paper.':'Punch, punch! Two holes, each straight through <em>both</em> layers.');await L.wait(2400);
      L.say('Now she opens it, slowly…');await L.wait(1100);await pic.swing(false,2000);big.innerHTML=lv===1?'1 hole became <em>2</em>':'2 holes became <em>4</em>';await L.wait(1100);
      L.say(`Every hole has a <em>twin</em> on the other side of the fold, the same distance away. The fold line is a mirror.${lv===2?' Count the spots from a hole to the line, then the same past it.':''} Now you try.`)}
    else{const f1=foldOf(FULL,'T'),f2=foldOf(f1.stay,'L');let pic=foldPic(f1,[],col,150,false);sc.appendChild(pic);
      L.say('Two folds this time. First the top comes down onto the bottom.');await L.wait(2000);await pic.swing(true,1200);await L.wait(600);
      const p2=foldPic(f2,[],col,150,false);pic.replaceWith(p2);L.say('Then the left side folds over onto the right. The paper is small now: four layers thick.');await L.wait(2200);await p2.swing(true,1200);await L.wait(600);
      p2.punch([[3,3]]);big.innerHTML='punch: 1 hole, 4 layers';L.say('Punch! One hole, through all four layers.');await L.wait(2200);
      L.say('Open one fold at a time. First the left side…');await L.wait(1100);await p2.swing(false,1600);big.innerHTML='1 became <em>2</em>';await L.wait(1100);
      pic=foldPic(f1,[[3,3],[0,3]],col,150,true);p2.replaceWith(pic);L.say('…then the top.');await L.wait(1000);await pic.swing(false,1600);big.innerHTML='2 became <em>4</em>';await L.wait(1100);
      L.say('Two folds made <em>four</em> twins: 1, then 2, then 4. Every fold doubles the holes. Now you try.')}},
  mount(lv){foldMount(lv)}});
