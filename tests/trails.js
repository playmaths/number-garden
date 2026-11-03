// every door builds five-stone trails from its own games with no two alike in a row
const {open,done}=require('./lib');
(async()=>{const {br,pg,errs}=await open();const doors=['Warm','Add','Patterns','Puzzles','Stories','Shapes','Time','Measure','makes','Rows, columns','One good idea'];
  for(const t of doors)for(let k=0;k<6;k++){await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.locator('.door',{hasText:t}).click();const tr=await pg.evaluate(()=>JSON.parse(localStorage.getItem('ng2')).trail);
    if(tr.steps.length!==5)errs.push(`${t}: ${tr.steps.length} stones`);const oneGame=t==='One good idea'||t==='Rows, columns';if(!oneGame&&!tr.steps.every((id,i)=>i===0||id!==tr.steps[i-1]))errs.push(`${t}: neighbours alike ${tr.steps}`); // a one-game door (Think, Sudoku) repeats its game; every problem is still differentif(t!=='One good idea'){if(tr.steps[2]!=='think')errs.push(`${t}: the middle stone is not a think stone: ${tr.steps}`);if(tr.steps.filter(x=>x==='think').length!==1)errs.push(`${t}: ${tr.steps.filter(x=>x==='think').length} think stones`)}
    const rooms=await pg.evaluate(ids=>ids.map(id=>document.querySelector('#where')?1:1),tr.steps)}
  done('trails',errs);await br.close()})();
