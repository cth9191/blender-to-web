const stage=document.querySelector('.stage'),controls=document.querySelector('.controls'),hint=document.querySelector('#hint');

const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)'),wide=matchMedia('(min-width: 1001px)'),connection=navigator.connection;

const journey=document.querySelector('.journey'),heroCopy=document.querySelector('.hero-copy'),scattered=document.querySelector('.scattered'),connected=document.querySelector('.connected'),progressRail=document.querySelector('.story-progress'),discovery=document.querySelector('.discovery');

let live=null,pending=false,failed=false,visible=true,paused=false,scrollFrame=0;

function eligible(){return fine.matches&&!reduced.matches&&!connection?.saveData;}

function smooth(a,b,v){const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);}

function show(el,opacity,offset=0){el.style.opacity=opacity;el.style.visibility=opacity>.015?'visible':'hidden';el.style.translate=`0 ${offset}px`;const rect=el.getBoundingClientRect(),hidden=opacity<.5||rect.bottom<160||rect.top>innerHeight-150;el.inert=hidden;el.setAttribute('aria-hidden',String(hidden));}
function updateStory(){

 scrollFrame=0;const storytelling=Boolean(live)&&eligible()&&wide.matches;

 document.body.classList.toggle('story-mode',storytelling);

 const rect=journey.getBoundingClientRect(),p=storytelling?Math.max(0,Math.min(1,-rect.top/(journey.offsetHeight-innerHeight))):0;

 document.body.classList.toggle('text-scrolling',storytelling&&p>.001);

 const hero=1-smooth(.24,.38,p),first=smooth(.08,.20,p)*(1-smooth(.58,.73,p)),second=smooth(.59,.76,p),shift=smooth(.48,.75,p);
 // Text follows native scroll distance while the sculpture stays pinned.
 // The final statement settles before the entire scene leaves the viewport.
 const travel=storytelling?p*(journey.offsetHeight-innerHeight):0;
 show(heroCopy,hero,-travel);
 show(scattered,first,storytelling?innerHeight*.95-travel:0);
 show(connected,second,storytelling?Math.max(0,innerHeight*1.85-travel):0);
 stage.style.transform=storytelling?`translateX(${-innerWidth*.325*shift}px)`:'';

 const storyVisible=smooth(.1,.24,p);progressRail.style.opacity=storyVisible;progressRail.style.setProperty('--progress-px',`${Math.max(0,Math.min(1,(p-.23)/.59))*Math.max(0,progressRail.clientHeight-62)}px`);

 const cue=1-smooth(.045,.19,p);discovery.style.opacity=cue;document.querySelector('.scroll-cue').style.opacity=cue;

 const storyActive=p>.08;document.querySelector('#expand').hidden=storyActive;document.querySelector('#reset').hidden=storyActive;

 if(live)hint.textContent=storyActive?'Scroll to reconnect · Drag to explore':document.querySelector('#expand').getAttribute('aria-pressed')==='true'?'Click to reassemble · Drag to explore':'Brush to scatter · Click to expand · Drag to rotate';

 if(!paused)live?.setStory({active:storyActive,progress:p,scatter:smooth(.16,.34,p)*(1-smooth(.55,.82,p))*.78,turn:shift});

}

function scheduleStory(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateStory);}

function fallback(error){failed=true;live?.dispose();live=null;stage.classList.remove('ready');controls.hidden=true;hint.textContent='A sculpture of possibility.';updateStory();if(error)console.warn('Sculpture still fallback:',error.message);}

function sync(){

 if(!eligible()){live?.dispose();live=null;stage.classList.remove('ready');controls.hidden=true;hint.textContent='A sculpture of possibility.';updateStory();return;}

 if(live){live.setActive(visible&&!document.hidden&&!paused);updateStory();return;}

 if(pending||failed)return;pending=true;

 import('./sculpture.js').then(m=>m.createSculpture(stage,fallback)).then(result=>{if(!eligible()){result.dispose();return;}live=result;stage.classList.add('ready');controls.hidden=false;sync();}).catch(fallback).finally(()=>{pending=false;});

}

function pauseMotion(value){paused=value;const b=document.querySelector('#pause');b.textContent=paused?'Resume motion':'Pause motion';b.setAttribute('aria-label',paused?'Resume animation':'Pause animation');b.setAttribute('aria-pressed',String(paused));sync();}

document.querySelector('#pause').addEventListener('click',()=>pauseMotion(!paused));

reduced.addEventListener('change',sync);fine.addEventListener('change',sync);wide.addEventListener('change',updateStory);connection?.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);

window.addEventListener('scroll',scheduleStory,{passive:true});window.addEventListener('resize',scheduleStory,{passive:true});

new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(stage);sync();



const notebook={

 priority:{title:'Keep the source in sight.',text:'People need to understand where an answer comes from. Make source links visible before adding more features.',sources:[1,2],quotes:['Answers should retain a clear link to their original source.','Make source links visible by default. Use simpler language.']},

 risk:{title:'Make the basics work for everyone.',text:'Keyboard navigation and reading contrast still need a check. Resolve those issues before inviting people to test the prototype.',sources:[2,3],quotes:['Keyboard navigation and reading contrast need to be checked before inviting testers.','Observe where people need more context, record the friction, and revise the prototype.']},

 next:{title:'Put the prototype in front of people.',text:'Prepare three source-based tasks and invite five participants. Watch where they need more context, then use what you learn to revise the next version.',sources:[3,1],quotes:['Prepare three source-based tasks and invite five participants.','People want to check the context behind a recommendation before deciding what to do.']}

};

const sourceNames=['Research notes','Prototype review','Launch plan'],tabs=[...document.querySelectorAll('[data-question]')],answer=document.querySelector('#answer'),status=document.querySelector('#demo-status');let selected='priority',copyTimer;

function openSource(id){const details=document.querySelector('#source-notes');details.open=true;document.querySelectorAll('.notes-grid article').forEach(el=>el.classList.toggle('active-note',el.id===`note-${id}`));const note=document.querySelector(`#note-${id}`);note.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});note.focus({preventScroll:true});}

function renderAnswer(key,announce=true){

 selected=key;const data=notebook[key];tabs.forEach(t=>{const yes=t.dataset.question===key;t.setAttribute('aria-selected',String(yes));t.tabIndex=yes?0:-1;});answer.setAttribute('aria-labelledby',`tab-${key}`);answer.querySelector('h3').textContent=data.title;answer.querySelector('.answer-text').textContent=data.text;

 const list=answer.querySelector('.citations');list.replaceChildren();data.sources.forEach((id,i)=>{const b=document.createElement('button');b.className='citation';b.dataset.cites=id;b.setAttribute('aria-label',`Read source ${id}: ${sourceNames[id-1]}`);const number=document.createElement('span');number.textContent=String(id).padStart(2,'0');const body=document.createElement('div'),title=document.createElement('strong'),quote=document.createElement('p'),more=document.createElement('small');title.textContent=sourceNames[id-1];quote.textContent=data.quotes[i];more.textContent='Read the original note';body.append(title,quote,more);b.append(number,body);b.addEventListener('click',()=>openSource(id));list.append(b);});

 document.querySelectorAll('[data-source]').forEach(b=>b.dataset.linked=String(data.sources.includes(Number(b.dataset.source))));document.querySelector('#copy-answer').textContent='Copy answer';if(announce)status.textContent=`Showing answer: ${data.title}`;requestAnimationFrame(drawConnections);

}

tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>renderAnswer(tab.dataset.question));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;if(e.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;if(e.key==='Home')index=0;if(e.key==='End')index=tabs.length-1;if(index!==undefined){e.preventDefault();tabs[index].focus();renderAnswer(tabs[index].dataset.question);}});});

document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>openSource(Number(b.dataset.source))));

document.querySelector('#copy-answer').addEventListener('click',async e=>{const button=e.currentTarget,data=notebook[selected];try{await navigator.clipboard.writeText(data.title+'\n\n'+data.text+'\n\nSources: '+data.sources.map(id=>sourceNames[id-1]).join(', ')+'\nPrepared example from a fictional notebook.');button.textContent='Copied';status.textContent='Answer copied.';}catch{button.textContent='Select answer to copy';status.textContent='Clipboard unavailable. Select the answer text and copy it.';}clearTimeout(copyTimer);copyTimer=setTimeout(()=>button.textContent='Copy answer',2500);});

const notebookElement=document.querySelector('.notebook'),svgNS='http://www.w3.org/2000/svg',connections=document.createElementNS(svgNS,'svg');

connections.classList.add('source-connections');connections.setAttribute('aria-hidden','true');notebookElement.append(connections);

function drawConnections(){

 connections.replaceChildren();if(!wide.matches)return;

 const box=notebookElement.getBoundingClientRect();connections.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);

 document.querySelectorAll('.citation').forEach(c=>{

  const from=document.querySelector(`[data-source="${c.dataset.cites}"]`).getBoundingClientRect(),to=c.querySelector('span').getBoundingClientRect();

  const x=from.right-box.left+5,y=from.top+from.height/2-box.top,ex=to.left-box.left-7,ey=to.top+to.height/2-box.top,mx=x+(ex-x)*.45;

  const path=document.createElementNS(svgNS,'path');path.setAttribute('d',`M ${x} ${y} C ${mx} ${y}, ${mx} ${ey}, ${ex} ${ey}`);connections.append(path);

  const dot=document.createElementNS(svgNS,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r','2');connections.append(dot);

 });

}

new ResizeObserver(()=>requestAnimationFrame(drawConnections)).observe(notebookElement);

document.fonts.ready.then(drawConnections);

renderAnswer('priority',false);

