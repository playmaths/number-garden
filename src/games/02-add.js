/* ================= ADD & TAKE ================= */
skill({id:'take',room:'add',title:'Take away',idea:'tens',levels:4,grow:lv=>['','Now the numbers go up to 50.',`Now ${P().s} ${vb('takes','take')} away two-digit numbers.`,'Now the numbers go up to 99.'][lv-1],mount(lv){
  let a,b;if(lv===1){a=rnd(11,20);b=rnd(1,9)}else if(lv===2){a=rnd(11,50);b=rnd(1,9)}else if(lv===3){a=rnd(21,50);b=rnd(11,29)}else{a=rnd(41,99);b=rnd(11,49)}
  if(b>=a)b=a-rnd(1,5);
  const tens=Math.floor(a/10),ones=a%10;prompt.textContent=`${a} take away ${b}`;
  const wrap=el('div','ta'),counts=el('div','counts',`<div>here<b id="here">${a}</b></div><div>taken<b id="taken">0</b></div>`),rods=el('div','rods'),onesBox=el('div','ones'),hint=el('div','hint','Tap dots to take them away. Tap a stick of 10 to break it open.');
  wrap.append(counts,rods,onesBox,hint);stage.appendChild(wrap);
  let taken=0,asked=false;
  const update=()=>{counts.querySelector('#here').textContent=a-taken;counts.querySelector('#taken').textContent=taken;
    if(taken===b&&!asked){asked=true;hint.textContent='';ask()}else if(taken>b)hint.textContent='One too many. Tap a grey dot to put it back.';else if(!asked)hint.textContent=`${b-taken} more to take.`};
  const addOne=()=>{const o=el('button','one');o.setAttribute('aria-label','dot');o.onclick=()=>{if(asked)return;if(o.classList.contains('gone')){o.classList.remove('gone');taken--}else{o.classList.add('gone');taken++}update()};onesBox.appendChild(o)};
  for(let i=0;i<tens;i++){const r=el('button','rod');r.setAttribute('aria-label','stick of ten');for(let j=0;j<10;j++)r.appendChild(el('span','u'));
    r.onclick=()=>{if(asked)return;if(lv>=3&&b-taken>=10&&!r.whole){r.classList.add('gone');r.style.opacity='.2';r.whole=true;taken+=10;hint.textContent='Took a whole stick. That\'s 10.';update();return}
      if(r.whole){r.style.opacity='1';r.whole=false;taken-=10;update();return}r.remove();for(let j=0;j<10;j++)addOne();hint.textContent='One stick became 10 dots.'};rods.appendChild(r)}
  for(let i=0;i<ones;i++)addOne();update();
  if(lv>=3)hint.textContent='Tap a stick to take all 10 at once, or break it into dots.';
  help({book:`took ${b} away from ${a} and got ${a-b}`,clues:[b>ones?`There are only ${ones} loose dots. Break a stick to get more.`:`Take ${b} dots, one at a time.`,`After taking ${b}, count what's left: sticks are 10 each.`],answer:a-b,why:`${a} take away ${b}: ${b>ones?`break a ten, take ${b}, and `:''}${a-b} are left.`});
  function ask(){say('How many are left? Count the blue sticks as 10 each, then the dots.');
    controls.appendChild(numpad((v,nm)=>{if(v===a-b){lock(nm);win(`${cheer()} ${a} take away ${b} is ${a-b}.`)}else miss(ctx.hints===0?'Count once more, slowly.':`Blue sticks first: each is 10. Then the blue dots.`)}))}}});

skill({id:'bridge',room:'add',title:'Make a ten to add',idea:'ten',levels:2,mount(lv){
  let a,b;if(lv===1){a=rnd(6,9);b=rnd(2,9);if(a+b<=10)b=11-a+rnd(0,2)}else{a=rnd(15,38);b=rnd(3,9);if(a%10+b<=10)b=11-(a%10)+rnd(0,2);if(a%10===0)a++}
  const ans=a+b;prompt.textContent=`${a} + ${b} = ?`;
  const fs=el('div','frames');const row=el('div','row');row.style.alignItems='center';
  const fa=tenFrame(a%10||10);const fb=tenFrame(b);
  if(lv===2){const rods=el('div','rods');for(let i=0;i<Math.floor(a/10);i++){const r=el('div','rod solid');for(let j=0;j<10;j++)r.appendChild(el('span','u'));rods.appendChild(r)}row.appendChild(rods)}
  row.append(fa,el('div','plus','+'),fb);fs.appendChild(row);stage.appendChild(fs);
  const need=10-(a%10);
  const showMove=()=>{fb.cells.slice(0,need).forEach(d=>d.className='empty');fa.cells.slice(a%10).forEach((d,i)=>setTimeout(()=>d.className='new',120*i))};
  help({book:`added ${a} and ${b} by making a ten: ${ans}`,clues:[`How many dots would fill the first frame? Take those from the second one.`,`${a} needs ${need} to make a ten. Then add the rest.`],answer:ans,why:`${a} + ${need} = ${a+need}, then ${b-need} more is ${ans}.`,show:showMove});
  controls.appendChild(numpad((v,nm)=>{if(v===ans){lock(nm);
      fb.cells.slice(0,need).forEach(d=>d.className='empty');fa.cells.slice(a%10).forEach((d,i)=>setTimeout(()=>d.className='new',120*i));
      win(`${cheer()} Move ${need} over to fill the ten: ${a} + ${need} = ${a+need}, then ${b-need} more is ${ans}.`)}
    else miss(ctx.hints===0?`How many dots fill up the first frame? Take those from the second one.`:`${a} needs ${need} to make a ten. Then add what's left.`)}))}});

skill({id:'missing',room:'add',title:'Find the missing number',idea:'diff',levels:4,mount(lv){
  let a,b,form,max;if(lv===1){max=10;a=rnd(1,8);b=rnd(a+1,10);form='a+?=b'}else if(lv===2){max=20;a=rnd(3,15);b=rnd(a+1,20);form=pick(['a+?=b','?+a=b'])}else if(lv===3){max=20;b=rnd(2,18);a=rnd(b+1,20);form='a-?=b'}else{max=50;if(Math.random()<.5){a=rnd(5,40);b=rnd(a+1,50);form='?+a=b'}else{b=rnd(5,40);a=rnd(b+1,50);form='a-?=b'}}
  const ans=form==='a-?=b'?a-b:b-a;
  const eq=el('div','eq');const box='<span class="box">?</span>';eq.innerHTML=form==='a+?=b'?`${a} + ${box} = ${b}`:form==='?+a=b'?`${box} + ${a} = ${b}`:`${a} − ${box} = ${b}`;
  prompt.textContent='What goes in the box?';
  const lo=form==='a-?=b'?b:a,hi=form==='a-?=b'?a:b;
  const nl=el('div','nline');nl.innerHTML=numberLine(max,lo,hi);stage.append(eq,nl);
  help({book:`found the missing number ${ans} between ${lo} and ${hi}`,clues:[`Find the green dot (${lo}) on the line. How many hops to the orange dot (${hi})?`,`Count the hops from ${lo} up to ${hi}, one at a time.`],answer:ans,why:`From ${lo} to ${hi} is a jump of ${ans}.`,guess:{q:`Before you count: is the box bigger or smaller than ${hi}?`,opts:[{t:'smaller',ok:1,why:`Yes. The box is a part, and a part is smaller than ${hi}. Now the number.`},{t:'bigger',why:`The box is only a part of ${hi}, so it is smaller. Now the number.`}]},reasons:{q:`Why is the box ${ans}?`,opts:[{t:`Because ${lo} and ${ans} make ${hi}`,ok:1},{t:`Because ${lo} + ${hi} = ${lo+hi}`,no:'That adds the two numbers we already have. The box is what is missing between them.'},{t:`Because ${ans} is my favourite number`,no:'A favourite is not a reason! Check: does it make the sum work?'}],why:`${lo} + ${ans} = ${hi}. It works.`},ways:{q:'Show me another way to find it.',opts:[{t:`Hop from ${lo} up to ${hi} and count the hops`,ok:1},{t:`Take ${lo} away from ${hi}`,ok:1},{t:`Add ${lo} and ${hi}`,no:'That makes an even bigger number. The box is the gap, not both together.'}],why:'Hopping up and taking away both find the gap.'},show:()=>{eq.querySelector('.box').textContent=ans}});
  controls.appendChild(numpad((v,nm)=>{if(v===ans){lock(nm);win(`${cheer()} From ${lo} to ${hi} is a jump of ${ans}.`)}
    else miss(ctx.hints===0?`Find ${lo} on the line. How many hops to ${hi}?`:`Count the hops from ${lo} up to ${hi}, one at a time.`)}))}});
function numberLine(max,lo,hi){const w=500,pad=14,step=(w-2*pad)/max;let h=`<svg viewBox="0 0 ${w} 60"><line x1="${pad}" y1="36" x2="${w-pad}" y2="36" stroke="var(--fg)" stroke-width="2"/>`;
  const every=max>20?5:1;for(let i=0;i<=max;i++){const x=pad+i*step;const big=i%every===0;h+=`<line x1="${x}" y1="${big?28:32}" x2="${x}" y2="${big?44:40}" stroke="var(--fg)" stroke-width="1.5"/>`;if(big&&(max<=20||i%10===0))h+=`<text x="${x}" y="58" text-anchor="middle" font-size="12" fill="var(--muted)" font-family="var(--display)">${i}</text>`}
  const xl=pad+lo*step,xh=pad+hi*step;h+=`<path d="M${xl} 34 Q${(xl+xh)/2} ${34-Math.min(26,(hi-lo)*3)} ${xh} 34" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="4 3"/><circle cx="${xl}" cy="36" r="5" fill="var(--leaf)"/><circle cx="${xh}" cy="36" r="5" fill="var(--accent)"/></svg>`;return h}

