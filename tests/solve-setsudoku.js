// You set the sudoku: a clash while setting is refused, too few clues are refused, Pip gets stuck on thin clues and asks for more, solves full clues, and her slips are caught by tapping the square
const {open,go,stars,msg,done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();
  const place=async(i,v)=>{await pg.locator('#stage .sq').nth(i).click();await pg.locator(`#controls .num.c${v}`).click();await pg.waitForTimeout(40)};
  const bubble=()=>pg.locator('#stage .bubble').innerText();
  /* a clash is refused; fewer than four clues are refused */
  await go(pg,'setsudoku',1,'make');await place(0,1);await place(1,1);if(!/already in that row/.test(await msg(pg)))errs.push('clash while setting not refused: '+await msg(pg));if((await pg.locator('#stage .sq').nth(1).getAttribute('data-v'))==='1')errs.push('clashing clue was kept');
  await pg.getByRole('button',{name:'Pip, solve it'}).click();if(!/at least four clues/.test(await msg(pg)))errs.push('three clues should be refused: '+await msg(pg));
  /* thin clues: Pip must get stuck and ask for more, then finish when a clue is added */
  await place(1,2);await place(2,3);await place(3,4);await pg.getByRole('button',{name:'Pip, solve it'}).click();await pg.waitForTimeout(6000);
  const stuck=/stuck/.test(await bubble());if(!stuck&&await pg.locator('#stage .sq[data-v=""], #stage .sq:not([data-v])').count())errs.push('Pip neither solved nor said stuck: '+await bubble());
  let caught=0,agreed=0;
  for(let round=0;round<8;round++){await go(pg,'setsudoku',1,'make');const before=await stars(pg);
    /* a full-ish set of clues from a known valid grid: the first row, first column and one diagonal square */
    const g=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];for(const [r,c] of [[0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[3,0],[1,1],[2,2],[1,2],[2,1]])await place(r*4+c,g[r][c]); // eleven clues with one solution; fewer left two
    await pg.getByRole('button',{name:'Pip, solve it'}).click();for(let t=0;t<30;t++){await pg.waitForTimeout(600);if(/Am I right/.test(await bubble()))break}
    if(!/Am I right/.test(await bubble())){errs.push(`round ${round}: Pip did not finish: "${await bubble()}"`);continue}
    const slip=await pg.evaluate(()=>{const cs=[...document.querySelectorAll('#stage .sq')].map(c=>+c.dataset.v);const N=4;const box=i=>Math.floor(Math.floor(i/N)/2)*2+Math.floor((i%N)/2);for(let a=0;a<16;a++)for(let b=a+1;b<16;b++)if(cs[a]===cs[b]&&(Math.floor(a/4)===Math.floor(b/4)||a%4===b%4||box(a)===box(b)))return [a,b];return null});
    if(slip){caught++;await pg.getByRole('button',{name:'No, there is a mistake'}).click();if(!/Tap the square/.test(await msg(pg)))errs.push(`round ${round}: no prompt to tap the wrong square`);
      const wrongIdx=await pg.evaluate(([a,b])=>{const cs=[...document.querySelectorAll('#stage .sq')];return cs[a].classList.contains('pipfill')&&!cs[a].classList.contains('given')?a:b},slip);
      const other=slip.find(i=>i!==wrongIdx);const otherIsPip=await pg.evaluate(i=>document.querySelectorAll('#stage .sq')[i].classList.contains('pipfill'),other);if(otherIsPip){await pg.locator('#stage .sq').nth(other).click();const mm=await msg(pg);if(!/Not that one|caught/.test(mm))errs.push(`round ${round}: tapping the wrong square gave "${mm}"`)}
      await pg.locator('#stage .sq').nth(wrongIdx).click();await pg.waitForTimeout(100);if(!/caught Pip/.test(await msg(pg)))errs.push(`round ${round}: catching the slip gave "${await msg(pg)}"`)}
    else{agreed++;await pg.getByRole('button',{name:'Yes!'}).click();await pg.waitForTimeout(100);if(!/checked it/.test(await msg(pg)))errs.push(`round ${round}: Yes gave "${await msg(pg)}"`)}
    if((await stars(pg))!==before+1)errs.push(`round ${round}: no star`)}
  console.log(`setsudoku: caught ${caught}, agreed ${agreed}`);if(!caught)errs.push('Pip never slipped in 8 rounds');if(!agreed)errs.push('Pip never solved cleanly in 8 rounds');done('solve-setsudoku',errs);await br.close()})().catch(e=>{console.error(e);process.exit(1)});
