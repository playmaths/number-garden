// Sudoku at every level: a clashing number shakes and comes back out, Fill one fills a single with a reason, the grid is finished from the solution, and the box borders are drawn
const {open,go,stars,msg,done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const sizes=new Set(),styles=new Set();for(let lv=1;lv<=5;lv++)for(let k=0;k<3;k++){await go(pg,'sudoku',lv,'sud');const before=await stars(pg);const name=`sudoku lv${lv} #${k}`;const N=await pg.evaluate(()=>__ng().ctx.N);sizes.add(N);styles.add(await pg.locator('#stage .sq .crit').count()?'bugs':'numbers');
    const cells=await pg.locator('#stage .sq').count();if(cells!==N*N)errs.push(`${name}: ${cells} squares`);
    const sol=await pg.evaluate(()=>__ng().ctx.sol);const empties=await pg.evaluate(()=>[...document.querySelectorAll('#stage .sq')].map((c,i)=>c.classList.contains('given')?-1:i).filter(i=>i>=0));
    if(!await pg.locator('#stage .sq.bR').count()||!await pg.locator('#stage .sq.bB').count())errs.push(`${name}: no box borders`);
    /* a clash: put into an empty square a number that its row already has */
    const i0=empties[0],r0=Math.floor(i0/N);const rowVal=await pg.evaluate(([r,N])=>{const cs=[...document.querySelectorAll('#stage .sq')];for(let c=0;c<N;c++){const x=cs[r*N+c];if(x.classList.contains('given'))return +x.dataset.v}return null},[r0,N]);
    if(rowVal!=null){await pg.locator('#stage .sq').nth(i0).click();await pg.locator(`#controls .num[data-v="${rowVal}"]`).click();if(!/already in this/.test(await msg(pg)))errs.push(`${name}: no clash message: "${await msg(pg)}"`);if(!await pg.locator('#stage .sq.clash').count())errs.push(`${name}: no clash animation`);await pg.waitForTimeout(1000);const t=await pg.locator('#stage .sq').nth(i0).getAttribute('data-v');if(t)errs.push(`${name}: clashing number stayed in the square ("${t}")`)}
    /* Fill one: a square gets filled with its only possible number and a reason is given */
    await pg.getByRole('button',{name:'Fill one'}).click();const m=await msg(pg);if(!/Only \d is left|two choices/.test(m))errs.push(`${name}: Fill one said "${m}"`);await pg.waitForTimeout(1600);
    /* finish from the solution */
    for(const i of empties){const cell=pg.locator('#stage .sq').nth(i);if(await cell.getAttribute('data-v'))continue;await cell.click();await pg.locator(`#controls .num[data-v="${sol[Math.floor(i/N)][i%N]+1}"]`).click()}
    await pg.waitForTimeout(200);const s=await stars(pg);if(s!==before+1)errs.push(`${name}: stars ${before}->${s} "${await msg(pg)}"`)}
  if(sizes.size<3)errs.push(`only sizes ${[...sizes]} seen in 15 boards`);if(styles.size<2)errs.push(`only ${[...styles]} tiles seen in 15 boards`);
  /* take-turns mode: a race with a scoreboard, turns swapping after each tile, and a result at the end */
  await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.duo=true;s.turn=0;localStorage.setItem('ng2',JSON.stringify(s))});await go(pg,'sudoku',2,'sud');
  {if(!await pg.locator('#stage .race').count())errs.push('race: no scoreboard');const sol=await pg.evaluate(()=>__ng().ctx.sol);const N=await pg.evaluate(()=>__ng().ctx.N);const empties=await pg.evaluate(()=>[...document.querySelectorAll('#stage .sq')].map((c,i)=>c.classList.contains('given')?-1:i).filter(i=>i>=0));
    const t0=await pg.locator('#stage .race .now').innerText();await pg.locator('#stage .sq').nth(empties[0]).click();await pg.locator(`#controls .num[data-v="${sol[Math.floor(empties[0]/N)][empties[0]%N]+1}"]`).click();await pg.waitForTimeout(100);const t1=await pg.locator('#stage .race .now').innerText();if(t0.split(' ')[1]===t1.split(' ')[1])errs.push(`race: turn did not pass (${t0} -> ${t1})`);if(!await pg.locator('#stage .sq.p0, #stage .sq.p1').count())errs.push('race: tile not marked for its player');
    for(const i of empties.slice(1)){await pg.locator('#stage .sq').nth(i).click();await pg.locator(`#controls .num[data-v="${sol[Math.floor(i/N)][i%N]+1}"]`).click()}await pg.waitForTimeout(200);const m=await pg.locator('#msg').innerText();if(!/wins the race|A tie/.test(m))errs.push(`race: no result: "${m}"`);
    await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ng2'));s.duo=false;localStorage.setItem('ng2',JSON.stringify(s))})}
  /* the Sudoku door builds a trail of sudoku with a think stone in the middle */
  await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.locator('.door',{hasText:'Rows, columns'}).click();const steps=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail.steps);if(steps[0]!=='sudoku'||steps[2]!=='think')errs.push(`sudoku door trail: ${steps}`);
  console.log('sudoku played');done('solve-sudoku',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
