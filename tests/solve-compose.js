// Make a shape at every level: pieces dragged with the mouse onto the outline (turned first where needed), a wrong drop that slides back with a hint, the extra piece and the think-first card at level 2, the cut named and then cut by hand at level 3, with the why or another-way gate
const {open,go,stars,msg,done,guess,gate,pause}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const state=()=>pg.evaluate(()=>{const c=__ng().ctx;return{pieces:c.pieces.map(p=>({i:p.i,t:p.t,rot:p.rot,px:p.px,py:p.py,placed:p.placed})),target:c.target.map(s=>({t:s.t,x:s.x,y:s.y,rot:s.rot,key:s.key,filled:s.filled})),rows:c.board.rows}});
  const fits=(i,x,y)=>pg.evaluate(([i,x,y])=>{const c=__ng().ctx;const p=c.pieces[i];const key=(()=>{const CSH={T:[[0,0],[1,0],[0,1]],S:[[0,0],[1,0],[1,1],[0,1]],R:[[0,0],[2,0],[2,1],[0,1]],B:[[0,0],[2,0],[0,2]]};let q=CSH[p.t];for(let r=0;r<p.rot;r++)q=q.map(([a,b])=>[-b,a]);const mx=Math.min(...q.map(v=>v[0])),my=Math.min(...q.map(v=>v[1]));return q.map(([a,b])=>(a-mx+x)+','+(b-my+y)).sort().join(' ')})();return c.target.some(s=>s.filled<0&&s.key===key)},[i,x,y]);
  /* drag piece i so that its top-left cell lands on (x,y): the mouse goes down on the piece's middle and moves by the distance between its home cell and the target cell */
  const dragTo=async(i,x,y)=>{const {from,to}=await pg.evaluate(([i,x,y])=>{const c=__ng().ctx;const p=c.pieces[i];return{from:c.pieceCenter(i),to:{x:c.cellPos(x,y).x-c.cellPos(p.px,p.py).x,y:c.cellPos(x,y).y-c.cellPos(p.px,p.py).y}}},[i,x,y]);
    await pg.mouse.move(from.x,from.y);await pg.mouse.down();for(let k=1;k<=6;k++)await pg.mouse.move(from.x+to.x*k/6,from.y+to.y*k/6);await pg.mouse.up();await pause(pg,450)};
  const tap=async i=>{const c=await pg.evaluate(i=>__ng().ctx.pieceCenter(i),i);await pg.mouse.click(c.x,c.y);await pg.waitForTimeout(60)};
  for(const lv of [1,2])for(let k=0;k<4;k++){await go(pg,'compose',lv,'space');const before=await stars(pg);const tag=`compose lv${lv} #${k}`;
    if(lv===2){if(!await pg.locator('#stage .guess').count())errs.push(tag+': no think-first card');await guess(pg)}
    let st=await state();const n=await pg.evaluate(()=>__ng().ctx.help.answer);if(n!==st.target.length)errs.push(`${tag}: help.answer ${n} but ${st.target.length} slots`);if(lv===2&&st.pieces.length!==n+1)errs.push(`${tag}: ${st.pieces.length} pieces for ${n} slots`);
    if(await pg.locator('#stage [data-i]').count()!==st.pieces.length)errs.push(tag+': pieces without data-i');if(!await pg.getByRole('button',{name:'Turn the piece'}).count())errs.push(tag+': no Turn button');
    if(k%2){ /* a miss: the first piece dropped on the empty board row below the outline, where nothing fits */
      const p=st.pieces[0];await dragTo(p.i,st.target[0].x,st.rows-1);const m=await msg(pg);if(!m.length)errs.push(tag+': no hint on a wrong drop');const after=(await state()).pieces[0];if(after.placed||Math.abs(after.px-p.px)>.01)errs.push(tag+': the piece did not slide back');
      if(lv===2){const extra=st.pieces.find(p=>!st.target.some(s=>s.t===p.t&&s.filled<0));if(extra){await dragTo(extra.i,st.target[0].x,st.target[0].y);if(!/extra|somewhere else|wrong way|no room/i.test(await msg(pg)))errs.push(tag+': extra piece dropped without a hint: '+await msg(pg))}}}
    for(const s of (await state()).target){st=await state();if(s.filled>=0)continue;const p=st.pieces.find(p=>!p.placed&&p.t===s.t);if(!p){errs.push(`${tag}: no piece for a ${s.t} slot`);break}
      let turns=0;while(!(await fits(p.i,s.x,s.y))&&turns<4){await tap(p.i);turns++}if(turns===4){errs.push(`${tag}: piece ${p.i} never fits at ${s.x},${s.y}`);break}
      await dragTo(p.i,s.x,s.y);const now=(await state()).pieces[p.i];if(!now.placed)errs.push(`${tag}: ${s.t} not placed at ${s.x},${s.y} ("${await msg(pg)}")`)}
    await gate(pg);if((await stars(pg))!==before+1)errs.push(`${tag}: no star ("${await msg(pg)}")`)}
  /* Turn button turns the selected piece */
  await go(pg,'compose',1,'space');{const r0=(await state()).pieces[0].rot;await tap(0);await pg.getByRole('button',{name:'Turn the piece'}).click();const r1=(await state()).pieces[0].rot;const t=(await state()).pieces[0].t;if(t!=='S'&&r1!==(r0+2)%4)errs.push(`compose: tap + Turn gave rot ${r0} -> ${r1}`)}
  for(let k=0;k<4;k++){await go(pg,'compose',3,'space');const before=await stars(pg);const tag=`compose lv3 #${k}`;const ans=await pg.evaluate(()=>__ng().ctx.help.answer);const ch=pg.locator('#controls .choice');const texts=await ch.allInnerTexts();if(!texts.includes(ans))errs.push(`${tag}: answer "${ans}" not among ${texts}`);
    if(await pg.locator('#stage .ccut').count()!==1)errs.push(tag+': no cut line');
    if(k%2){await ch.nth(texts.findIndex(t=>t!==ans)).click();if(!(await msg(pg)).length)errs.push(tag+': no hint on a wrong name')}
    await ch.nth(texts.indexOf(ans)).click();await pause(pg,1700);const cut=await pg.evaluate(()=>__ng().ctx.cut);if(!cut){errs.push(tag+': no cut-it-yourself part');continue}if(await pg.locator('#stage .cdot').count()!==8)errs.push(tag+': not 8 dots');
    const dot=async j=>{const p=await pg.evaluate(j=>__ng().ctx.cutPos(j),j);await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(80)};
    if(k%2){await dot(0);await dot(1);if(!/side/.test(await msg(pg)))errs.push(tag+': a side was not refused: '+await msg(pg));await pause(pg,1300);const wrong=cut.want==='two triangles'?[4,6]:[0,2];await dot(wrong[0]);await dot(wrong[1]);if(!(await msg(pg)).length)errs.push(tag+': no hint on the wrong cut');await pause(pg,1300)}
    await dot(cut.good[0]);await dot(cut.good[1]);await pg.waitForTimeout(150);await gate(pg);if((await stars(pg))!==before+1)errs.push(`${tag}: no star ("${await msg(pg)}")`)}
  /* Clue and Show me at each level */
  for(const lv of [1,2,3]){await go(pg,'compose',lv,'space');await guess(pg);await pg.getByRole('button',{name:'Clue'}).click();if(!(await msg(pg)).length)errs.push(`compose lv${lv}: Clue said nothing`);await pg.getByRole('button',{name:'Show me'}).click();await pause(pg,2000);if(!(await msg(pg)).length)errs.push(`compose lv${lv}: Show me said nothing`);if(lv<3&&(await state()).target.some(s=>s.filled<0))errs.push(`compose lv${lv}: Show me left a slot empty`)}
  console.log('compose played');done('solve-compose',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
