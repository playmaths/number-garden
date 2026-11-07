/* ================= LOGIC: who has what ================= */
const KIDS=[null,'Max','Lily','Sam'],PETS=[['cat','🐱'],['dog','🐶'],['fish','🐟'],['bird','🐦']];
skill({id:'logic',room:'puz',title:'Who has what?',levels:2,mount(lv){
  const n=lv===1?3:4;const kids=KIDS.slice(0,n).map(k=>k||KID()),pets=PETS.slice(0,n);
  const perms=a=>a.length<=1?[a]:a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(p=>[x].concat(p)));const all=perms([...Array(n).keys()]);
  let sol,clues;for(let tries=0;tries<60;tries++){sol=pick(all);clues=[];let cands=all.slice();
    const pool=shuffle([...Array(n).keys()].flatMap(k=>[...Array(n).keys()].map(q=>({k,q}))));
    for(const {k,q} of pool){if(cands.length===1)break;const yes=sol[k]===q;if(yes&&Math.random()<.4){const c={t:`${kids[k]} has the ${pets[q][0]}.`,f:p=>p[k]===q};const next=cands.filter(c.f);if(next.length<cands.length){cands=next;clues.push(c)}}
      else if(!yes){const c={t:`${kids[k]} does not have the ${pets[q][0]}.`,f:p=>p[k]!==q};const next=cands.filter(c.f);if(next.length<cands.length&&clues.length<(lv===1?3:5)){cands=next;clues.push(c)}}}
    if(cands.length===1&&clues.length>=2)break}
  prompt.textContent='Read the clues. Who has which pet?';const rule=el('div','hint',`${n} friends, ${n} pets. Every friend has exactly one pet, and no two friends share. Put a ✓ in one box for each friend.`);const ul=el('ul','clues');clues.forEach(c=>ul.appendChild(el('li','',c.t)));
  const g=el('div','logic');g.style.gridTemplateColumns=`70px repeat(${n},1fr)`;g.appendChild(el('div','hd',''));pets.forEach(p=>g.appendChild(el('div','hd',`<span style="font-size:1.4rem">${p[1]}</span>`)));
  const marks=Array.from({length:n},()=>Array(n).fill(0));const cells=[];
  kids.forEach((k,i)=>{g.appendChild(el('div','hd',k));pets.forEach((p,j)=>{const c=el('button','lc','');c.onclick=()=>{if(ctx.done)return;marks[i][j]=(marks[i][j]+1)%3;c.textContent=['','✓','✗'][marks[i][j]];c.className='lc'+(marks[i][j]===1?' yes':marks[i][j]===2?' no':'')};cells.push(c);g.appendChild(c)})});
  stage.append(rule,ul,readBtn(()=>rule.textContent+' '+clues.map(c=>c.t).join(' ')),g);
  help({book:`solved a who-has-what puzzle with ${n} friends`,clues:['Start with a clue that says who HAS something. Put a ✓ there, then ✗ in the rest of that row and column.','Find a row with only one empty box left. That must be the ✓.'],why:kids.map((k,i)=>`${k} has the ${pets[sol[i]][0]}`).join(', ')+'.',show:()=>cells.forEach((c,idx)=>{const i=Math.floor(idx/n),j=idx%n;c.className='lc'+(sol[i]===j?' yes':' no');c.textContent=sol[i]===j?'✓':'✗'})});
  const r=el('div','row');const b=el('button','btn','Check');b.onclick=()=>{let ok=true,empty=0;kids.forEach((k,i)=>{const ticks=marks[i].map((m,j)=>m===1?j:-1).filter(j=>j>=0);if(ticks.length!==1)empty++;else if(ticks[0]!==sol[i])ok=false});
    if(ok&&!empty){lock(r);win(`${cheer()} ${kids.map((k,i)=>`${k}: ${pets[sol[i]][1]}`).join('  ')}`)}else miss(empty?`${empty} friend${empty>1?'s':''} still need${empty>1?'':'s'} a pet: one ✓ in ${empty>1?'each of their rows':'that row'}, and only one.`:'One ✓ is in the wrong place. Check each clue again.')};r.appendChild(b);controls.appendChild(r)}});

