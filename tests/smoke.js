// every game mounts at every level with no console errors, and Clue and Show me work on each
const {open,go,msg,done}=require('./lib');
const fs=require('fs'),path=require('path');const SRC=fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8');
const LEVELS={};for(const m of SRC.matchAll(/skill\(\{id:'([a-z0-9]+)',room:'[a-z]+',title:'[^']*',(?:idea:'[a-z]+',)?levels:(\d+)/g))LEVELS[m[1]]=+m[2];
const GAMES={warm:['dots','make','more'],add:['take','bridge','missing','trick'],pat:['cont','machine'],puz:['balance','wodb','coins','sudoku','riddle','logic','sort2','ifthen','rewind'],story:['tale','ways','bar','detective'],space:['mirror','count','fit','symmetry','cubes'],time:['minutes','elapsed','calendar'],meas:['parts','measure','estimate'],make:['hide','rulemaker','writestory','patmaker']};
(async()=>{const {br,pg,errs}=await open();let n=0;
  for(const [door,ids] of Object.entries(GAMES))for(const id of ids){const levels=LEVELS[id]||1;for(let lv=1;lv<=levels;lv++){await go(pg,id,lv,door);if(!await pg.locator('#play').isVisible()){errs.push(`${id} lv${lv}: play view not shown`);continue}
    const where=await pg.locator('#where').innerText();if(!where)errs.push(`${id} lv${lv}: no title`);
    const clue=pg.getByRole('button',{name:'Clue'});if(await clue.count()){await clue.click();if(!(await msg(pg)).length)errs.push(`${id} lv${lv}: Clue said nothing`);await pg.getByRole('button',{name:'Show me'}).click();await pg.waitForTimeout(150);if(!(await msg(pg)).length)errs.push(`${id} lv${lv}: Show me said nothing`)}
    n++}}
  console.log('mounted',n,'game levels');done('smoke',errs);await br.close()})();
