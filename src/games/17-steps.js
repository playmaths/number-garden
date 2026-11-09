/* ================= WHERE IS PIP? position and direction on a small grid ================= */
/* x runs left to right and y runs from the bottom up, so "up" is toward the top of the picture. A step is one square sideways or up and down, never slantways and never through a rock. The same grid serves the three levels: where does Pip land (tap the square), give Pip the directions (arrow buttons, then Go) and the fewest steps round a rock */
const DIRS={left:{dx:-1,dy:0,a:'←'},right:{dx:1,dy:0,a:'→'},up:{dx:0,dy:1,a:'↑'},down:{dx:0,dy:-1,a:'↓'}};
const dirH=h=>h>0?'right':'left',dirV=v=>v>0?'up':'down';
const stepWords=(h,v)=>[h&&`${Math.abs(h)} step${Math.abs(h)>1?'s':''} ${dirH(h)}`,v&&`${Math.abs(v)} step${Math.abs(v)>1?'s':''} ${dirV(v)}`].filter(Boolean).join(', then ');
const shortWords=(h,v)=>[h&&`${Math.abs(h)} ${dirH(h)}`,v&&`${Math.abs(v)} ${dirV(v)}`].filter(Boolean).join(', ');
const movesOf=(h,v,vFirst)=>{const H=Array(Math.abs(h)).fill(dirH(h)),V=Array(Math.abs(v)).fill(dirV(v));return vFirst?V.concat(H):H.concat(V)};
const arrowsOf=moves=>moves.map(m=>DIRS[m].a).join(' ');
/* follow the moves from a square: the path of squares visited, stopping at the edge of the grid or at the rock */
function pathFrom(at,moves,N,rock){const path=[];let x=at.x,y=at.y,off=false,bump=false;for(const m of moves){const nx=x+DIRS[m].dx,ny=y+DIRS[m].dy;if(nx<0||ny<0||nx>=N||ny>=N){off=true;break}if(rock&&rock.x===nx&&rock.y===ny){bump=true;break}x=nx;y=ny;path.push({x,y})}return{path,off,bump,end:{x,y}}}
/* which way Pip still has to go from where she is to the goal, as a direction a child can act on */
const offWord=(e,t)=>e.y<t.y?'still too low: up means toward the top ↑':e.y>t.y?'too high: down means toward the bottom ↓':e.x<t.x?'not far enough to the right →':'too far: left is back this way ←';
const flowerAt=(cx,cy)=>{let h='';for(let p=0;p<5;p++){const a=p*72*Math.PI/180;h+=`<circle cx="${cx+Math.cos(a)*8}" cy="${cy+Math.sin(a)*8}" r="6" fill="#ff8fab"/>`}return h+`<circle cx="${cx}" cy="${cy}" r="4.5" fill="var(--sun)"/>`};
/* the grid with Pip on it: go(x,y) slides her to a square, walk(path) takes her square by square with a note and a step number per square, cell(x,y) is the tappable square */
function stepGrid(N,at,goal,rock){const C=48,s=(C-10)/60,cy=y=>(N-1-y)*C;const d=el('div','ta');d.style.gap='4px';
  let h=`<svg viewBox="0 0 ${N*C} ${N*C}" style="width:${Math.min(330,N*56)}px;max-width:100%">`;
  for(let y=N-1;y>=0;y--)for(let x=0;x<N;x++)h+=`<rect class="cell" data-x="${x}" data-y="${y}" x="${x*C+2}" y="${cy(y)+2}" width="${C-4}" height="${C-4}" rx="6" fill="var(--bg)" stroke="var(--line)" stroke-width="1.5" role="button" aria-label="square ${x+1} across, ${y+1} up"/>`;
  if(rock)h+=`<path d="M${rock.x*C+9} ${cy(rock.y)+38}q1 -16 13 -22q15 -3 17 11q5 11 -7 13q-12 2 -23 -2z" fill="#8d99ae" stroke="#4a5568" stroke-width="1.5"/>`;
  if(goal)h+=flowerAt(goal.x*C+C/2,cy(goal.y)+C/2);
  h+=`<g class="pip" style="transition:transform .4s ease"><g transform="scale(${s})">${BUG}</g></g><g class="marks"></g></svg>`;d.innerHTML=h;
  const svg=d.firstChild,pip=svg.querySelector('.pip'),marks=svg.querySelector('.marks');d.cells=[...svg.querySelectorAll('.cell')];d.cell=(x,y)=>d.cells[(N-1-y)*N+x];
  d.go=(x,y)=>{d.at={x,y};pip.style.transform=`translate(${x*C+C/2-30*s}px,${cy(y)+C/2-32*s}px)`};
  d.mark=(x,y,n)=>marks.insertAdjacentHTML('beforeend',`<text x="${x*C+C-7}" y="${cy(y)+15}" text-anchor="end" font-size="12" font-weight="700" fill="var(--accent)" font-family="var(--display)">${n}</text>`);
  d.clear=()=>{marks.innerHTML=''};d.paint=(x,y,col)=>d.cell(x,y).setAttribute('fill',col);
  d.walk=async(path,label)=>{let n=0;for(const p of path){n++;d.go(p.x,p.y);if(label)d.mark(p.x,p.y,n);playNote(n*2);await wait(420)}};
  d.go(at.x,at.y);return d}
/* a start square from which h sideways and v up or down stays on the grid */
const startFor=(N,h,v)=>({x:h>0?rnd(0,N-1-h):rnd(-h,N-1),y:v>0?rnd(0,N-1-v):rnd(-v,N-1)});

skill({id:'steps',room:'space',title:'Where is Pip?',levels:3,grow:lv=>['',`Now ${P().s} ${vb('gives','give')} Pip the directions with arrows.`,'Now a bigger grid, a rock in the way, and the fewest steps.'][lv-1],
  async teach(lv,L){const big=el('div','bigword','');
    if(lv===1){const g=stepGrid(4,{x:1,y:1});L.scene.append(g,big);L.say('This is Pip\'s grid. She walks one square at a time. <em>Right</em> is this way →.');await L.wait(1500);g.go(2,1);big.innerHTML='→ 1 step <em>right</em>';await L.wait(1600);
      L.say('<em>Left</em> is back this way ←.');g.go(1,1);big.innerHTML='← 1 step <em>left</em>';await L.wait(1600);L.say('<em>Up</em> means toward the top of the picture ↑.');g.go(1,2);big.innerHTML='↑ 1 step <em>up</em>';await L.wait(1600);L.say('<em>Down</em> means toward the bottom ↓.');g.go(1,1);big.innerHTML='↓ 1 step <em>down</em>';await L.wait(1600);
      L.say('You can say a whole path as numbers: <em>2 right, 1 up</em>. Watch her go.');await L.wait(900);await g.walk([{x:2,y:1},{x:3,y:1},{x:3,y:2}],true);big.innerHTML='→ → ↑ · <em>2 right, 1 up</em>';await L.wait(1600);L.say('Two steps right, then one step up: that is where she lands. Now you try: find Pip\'s square.')}
    else if(lv===2){const g=stepGrid(4,{x:0,y:0},{x:2,y:1});L.scene.append(g,big);L.say(`Now ${KID()} gives the directions. Pip wants the flower. Count the squares <em>sideways</em> first: 1, 2. Two to the right.`);g.paint(1,0,'var(--sun)');g.paint(2,0,'var(--sun)');await L.wait(2000);
      L.say('Then count <em>up</em>: 1. One up.');g.paint(2,1,'var(--sun)');big.innerHTML='2 right, 1 up';await L.wait(1600);L.say('Say it as arrows: <em>→ → ↑</em>. Tap those, then Go, and Pip walks.');big.innerHTML='<em>→ → ↑</em>';await L.wait(900);await g.walk([{x:1,y:0},{x:2,y:0},{x:2,y:1}],true);await L.wait(1500);
      L.say('If Pip lands in the wrong square, look where she is. Too low? Add an ↑. Too far? Take one back. Now you try.')}
    else{const g=stepGrid(5,{x:0,y:0},{x:3,y:2},{x:1,y:1});L.scene.append(g,big);L.say('A bigger grid, and a <em>rock</em>. Pip walks sideways or up and down, never slantways, and never through the rock.');await L.wait(2000);
      L.say('The <em>fewest</em> steps: count sideways from Pip to the flower: 3. Count up: 2. <em>3 and 2 is 5</em>.');await L.wait(900);await g.walk(pathFrom({x:0,y:0},movesOf(3,2),5).path,true);big.innerHTML='3 right and 2 up: <em>5</em> steps';await L.wait(1800);
      L.say('Up first, then right, is also 5. The rock is not in the way when you go round the edge. Now you try.');g.clear();g.go(0,0);await L.wait(600);await g.walk(pathFrom({x:0,y:0},movesOf(3,2,true),5).path,true)}},
  mount(lv){const N=lv===3?6:5;const sg=()=>Math.random()<.5?1:-1;let h,v;
    if(lv===3){h=rnd(2,4)*sg();v=rnd(2,3)*sg()}else{h=rnd(1,3)*sg();v=(lv===2?Math.random()<.8:Math.random()<.7)?rnd(1,2)*sg():0;if(!v)h=rnd(2,3)*Math.sign(h)} // a one-direction path is still at least two steps, so there is something to count
    const start=startFor(N,h,v),target={x:start.x+h,y:start.y+v},steps=Math.abs(h)+Math.abs(v);
    const rock=lv===3?{x:start.x+Math.sign(h)*rnd(1,Math.abs(h)-1),y:start.y+Math.sign(v)*rnd(1,Math.abs(v)-1)}:null; // inside the box between Pip and the flower, so it blocks the straight-through look but neither corner route
    ctx.start=start;ctx.target=Object.assign({i:(N-1-target.y)*N+target.x},target);let busy=false;
    const g=stepGrid(N,start,lv>1?target:null,rock);const best=movesOf(h,v);
    if(lv===1){prompt.textContent=`Pip goes ${stepWords(h,v)}. Where does Pip land? Tap the square.`;
      const strip=el('div','ways strip');best.forEach(m=>strip.appendChild(el('span','way',DIRS[m].a)));stage.append(g,strip,el('div','hint','Up is toward the top of the picture. Start counting from the square next to Pip.'));
      help({book:`found where Pip landed after ${shortWords(h,v)}`,clues:[`Put your finger on Pip. Count ${Math.abs(h)} square${Math.abs(h)>1?'s':''} ${dirH(h)}${v?`, then ${Math.abs(v)} ${dirV(v)}`:''}.`,'The first step is the square next to Pip, not Pip\'s own square.'],answer:null,why:`${stepWords(h,v)} from Pip's square lands here.`,show:async()=>{g.paint(target.x,target.y,'var(--leaf)');await g.walk(pathFrom(start,best,N).path,true)}});
      g.cells.forEach(c=>{const x=+c.dataset.x,y=+c.dataset.y;const tap=async()=>{if(ctx.done||busy)return;if(x===target.x&&y===target.y){busy=true;g.paint(x,y,'var(--sun)');await g.walk(pathFrom(start,best,N).path,true);win(`${cheer()} ${stepWords(h,v)}: Pip lands right there.`)}
          else{c.setAttribute('stroke','var(--accent)');c.setAttribute('stroke-width','4');setTimeout(()=>{c.setAttribute('stroke','var(--line)');c.setAttribute('stroke-width','1.5')},ms(700));miss(ctx.hints===0?`Put your finger on Pip and count ${Math.abs(h)} square${Math.abs(h)>1?'s':''} ${dirH(h)}${v?`, then ${Math.abs(v)} ${dirV(v)}`:''}.`:`That square is ${offWord({x,y},target)}.`)}};c.addEventListener('click',tap);c.setAttribute('tabindex','0');c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tap()}})})}
    else if(lv===2){prompt.textContent='Tell Pip how to get to the flower. Tap the arrows, then Go.';let moves=[];
      const strip=el('div','ways strip');const pathLine=el('div','hint','');const draw=()=>{strip.innerHTML='';moves.forEach(m=>strip.appendChild(el('span','way',DIRS[m].a)));pathLine.textContent=moves.length?`Pip's path: ${moves.length} step${moves.length>1?'s':''}`:'Pip\'s path: tap the arrows.'};draw();stage.append(g,strip,pathLine);
      help({book:`gave Pip directions to the flower: ${shortWords(h,v)}`,clues:['Count the squares from Pip to the flower going sideways. That many → or ←.','Then count how many squares up ↑ or down ↓ to the flower.'],answer:null,why:`${stepWords(h,v)}: ${arrowsOf(best)}.`,show:async()=>{moves=best;draw();await g.walk(pathFrom(start,best,N).path,true)}});
      const arrows=el('div','row');['left','right','up','down'].forEach(k=>{const b=el('button','num',DIRS[k].a);b.setAttribute('aria-label',k);b.style.minWidth='56px';b.onclick=()=>{if(ctx.done||busy||moves.length>=12)return;moves.push(k);playNote(moves.length);draw()};arrows.appendChild(b)});
      const r=el('div','row');const undo=el('button','btn quiet','Undo');undo.onclick=()=>{if(ctx.done||busy)return;moves.pop();draw()};const goBtn=el('button','btn','Go');
      goBtn.onclick=async()=>{if(ctx.done||busy)return;if(!moves.length){say('Tap some arrows first, then Go.');return}busy=true;const p=pathFrom(start,moves,N);await g.walk(p.path,true);
        if(!p.off&&p.end.x===target.x&&p.end.y===target.y){lock(arrows);lock(r);win(`${cheer()} ${moves.length} step${moves.length>1?'s':''} and Pip is on the flower.${moves.length>steps?` A shorter way: ${shortWords(h,v)}.`:''}`);return}
        miss(p.off?'Pip bumped into the edge of the grid. Count the squares to the flower before you tap.':ctx.hints===0?`Look where Pip stopped. She is ${offWord(p.end,target)}.`:`From Pip to the flower is ${stepWords(h,v)}: ${arrowsOf(best)}. Tap those, then Go.`);
        await wait(1100);if(ctx.done)return;g.clear();g.go(start.x,start.y);moves=[];draw();busy=false};
      r.append(undo,goBtn);controls.append(arrows,r)}
    else{prompt.textContent='A rock is in the way. What is the fewest steps for Pip to reach the flower?';stage.append(g,el('div','hint','Pip walks one square sideways or up and down, never slantways, and never through the rock.'));
      const pivot=Math.min(8,Math.max(3,steps+pick([-2,-1,1,2])));const H=Math.abs(h),V=Math.abs(v);
      help({book:`found the fewest steps for Pip round a rock: ${steps}`,clues:[`Count the sideways squares from Pip to the flower: ${H}. Then the ${dirV(v)} squares: ${V}.`,'The rock is not in the way if Pip goes round the edge: sideways first, or up first. Add the two counts.'],answer:steps,why:`${H} ${dirH(h)} and ${V} ${dirV(v)} is ${steps} steps.`,
        guess:{q:`Think first: more or fewer than ${pivot} steps?`,opts:[{t:'more',ok:steps>pivot,why:steps>pivot?`Yes, more than ${pivot}. Now count them.`:`Count: ${H} sideways and ${V} ${dirV(v)}. That is fewer than ${pivot}.`},{t:'fewer',ok:steps<pivot,why:steps<pivot?`Yes, fewer than ${pivot}. Now count them.`:`Count: ${H} sideways and ${V} ${dirV(v)}. That is more than ${pivot}.`}]},
        reasons:{q:`Why is it ${steps} steps?`,opts:[{t:`Because ${H} ${dirH(h)} and ${V} ${dirV(v)} is ${steps} steps`,ok:1},{t:`Because the grid has ${N*N} squares`,no:'The grid is big, but Pip only walks from her square to the flower. Count those steps.'},{t:'Because the rock is grey',no:'The colour of the rock does not change the steps. Count sideways, then up.'}],why:`${H} ${dirH(h)} and ${V} ${dirV(v)}: ${steps}.`},
        ways:{q:'Is there another way with the same number of steps?',opts:[{t:`${cap(dirV(v))} first, then ${dirH(h)}: still ${steps}`,ok:1},{t:`${cap(dirH(h))} first, then ${dirV(v)}: still ${steps}`,ok:1},{t:'Walk all the way round the edge of the grid',no:`That is far more than ${steps} steps. The sideways steps and the ${dirV(v)} steps are enough.`}],why:'Either way round the rock, the sideways steps and the up or down steps stay the same.'},
        show:async()=>{await g.walk(pathFrom(start,best,N,rock).path,true)}});
      const p=pad(10,async(val,b)=>{if(ctx.done||busy)return;if(val===steps){b.classList.add('hit');lock(p);busy=true;await g.walk(pathFrom(start,best,N,rock).path,true);win(`${cheer()} ${H} ${dirH(h)} and ${V} ${dirV(v)}: ${steps} steps, and the rock did not matter.`)}
        else{b.classList.add('miss');b.disabled=true;miss(ctx.hints===0?`Count the sideways squares from Pip to the flower with your finger. Then the ${dirV(v)} squares. Add them.`:`${H} ${dirH(h)} and ${V} ${dirV(v)}. ${H} and ${V} is ${steps}.`)}});controls.appendChild(p)}}});
