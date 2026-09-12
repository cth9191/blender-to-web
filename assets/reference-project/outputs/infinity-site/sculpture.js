import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/GLTFLoader.js';

// One soft wave follows the authored tile rows around the complete loop.
const IDLE_PULSE={period:10,width:.065,strength:1,fadeIn:1.1,fadeOut:5};

export async function createSculpture(host,onFailure){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.append(canvas);
 let scene,env,pmrem,batches=[],disposed=false,active=false,raf=0,observer;
 const cleanup=[];
 function dispose(){if(disposed)return;disposed=true;active=false;cancelAnimationFrame(raf);observer?.disconnect();cleanup.forEach(f=>f());for(const b of batches){b.geometry.dispose();b.material.dispose();b.dispose();}env?.dispose();pmrem?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();host.classList.remove('ready');}
 try{
  const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'';
  if(/swiftshader|llvmpipe|software/i.test(gpu))throw Error('Software rendering');
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.2;
  scene=new THREE.Scene();const assembly=new THREE.Group();scene.add(assembly);
  const camera=new THREE.OrthographicCamera(-3.85,3.85,3,-3,.1,50);camera.position.set(0,0,12);camera.lookAt(0,0,0);
  const studio=new THREE.Scene();studio.background=new THREE.Color(.065,.07,.066);
  function panel(pos,w,h,strength,color=0xffffff){let mat=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(strength),side:THREE.DoubleSide}),p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);p.position.fromArray(pos);p.lookAt(0,0,0);studio.add(p);}
  panel([-3,5,3],5,4,5,0xfff8df);panel([4,1,-3],3,6,5);panel([-4,0,-1],2,5,2.5);panel([0,-4,5],6,1,2);
  pmrem=new THREE.PMREMGenerator(renderer);env=pmrem.fromScene(studio,.06,.1,100,{size:128});scene.environment=env.texture;
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  scene.add(new THREE.HemisphereLight(0xfffbea,0x1c2320,1.1));const key=new THREE.DirectionalLight(0xfffbea,2.4);key.position.set(-3,5,6);scene.add(key);const rim=new THREE.DirectionalLight(0xf3ffff,1.7);rim.position.set(4,1,-4);scene.add(rim);
  const gltf=await new GLTFLoader().loadAsync('./assets/infinity.glb');gltf.scene.updateMatrixWorld(true);
  const groups=new Map();gltf.scene.traverse(o=>{if(!o.isMesh)return;const k=o.geometry.uuid+'|'+o.material.uuid;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  const first=[...groups.values()][0];if(!first||first.length!==1792)throw Error('Incomplete tile assembly');const count=first.length;
  const bases=first.map(o=>{const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();o.matrixWorld.decompose(p,q,s);return {p,q,s};});
  const pulseUniforms={phase:{value:0},gain:{value:0}};
  function tilePhase(object){
   for(let node=object;node;node=node.parent){const match=/^Tile_(\d{3})_(\d{2})/.exec(node.name);if(match)return Number(match[1])/128;}
   throw Error('Missing authored tile order for light pulse');
  }
  for(const pieces of groups.values()){
   if(pieces.length!==count)throw Error('Inconsistent material instances');
   const geometry=pieces[0].geometry,material=pieces[0].material;
   if(material.name.includes('Charcoal')){material.color.set('#353b3b');material.metalness=.86;material.roughness=.29;}
   if(material.name.includes('titanium')){material.color.set('#87918b');material.metalness=.95;material.roughness=.24;}
   if(material.name.includes('yellow')){material.color.set('#ecf000');material.metalness=.35;material.roughness=.27;material.emissive.set('#b6c000');material.emissiveIntensity=.09;}
   material.envMapIntensity=1.15;
   geometry.setAttribute('loopPhase',new THREE.InstancedBufferAttribute(Float32Array.from(pieces,tilePhase),1));
   const surfaceGlow=material.name.includes('Charcoal')?.16:material.name.includes('yellow')?1.35:.9;
   material.onBeforeCompile=shader=>{
    shader.uniforms.uPulsePhase=pulseUniforms.phase;shader.uniforms.uPulseGain=pulseUniforms.gain;shader.uniforms.uSurfaceGlow={value:surfaceGlow};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float loopPhase;\nvarying float vLoopPhase;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLoopPhase=loopPhase;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLoopPhase;\nuniform float uPulsePhase;\nuniform float uPulseGain;\nuniform float uSurfaceGlow;').replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float pulseDistance=abs(fract(vLoopPhase-uPulsePhase+0.5)-0.5);
float lightWave=exp(-pow(pulseDistance/${IDLE_PULSE.width.toFixed(3)},2.0));
totalEmissiveRadiance+=vec3(0.88,1.0,0.004)*lightWave*uPulseGain*uSurfaceGlow;
`);
   };
   material.customProgramCacheKey=()=> 'infinity-idle-pulse-v1';
   const batch=new THREE.InstancedMesh(geometry,material,count);batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);batch.frustumCulled=false;
   for(let i=0;i<count;i++){batch.setMatrixAt(i,pieces[i].matrixWorld);if(material.name.includes('Charcoal'))batch.setColorAt(i,new THREE.Color().setScalar(.55+.45*hash(i+31)));}
   assembly.add(batch);batches.push(batch);
  }
  function hash(n){return (Math.sin(n*127.1+311.7)*43758.5453)%1+1-(Math.sin(n*127.1+311.7)*43758.5453>=0?1:0);}
  const offsets=new Float32Array(count*3),velocities=new Float32Array(count*3),targets=new Float32Array(count*3);
  const bursts=bases.map((b,i)=>b.p.clone().normalize().multiplyScalar(1.1+hash(i+7)*.7).add(new THREE.Vector3(hash(i+2)-.5,hash(i+4)-.5,hash(i+6)-.5).multiplyScalar(.8)));
  const axes=bases.map((b,i)=>new THREE.Vector3(hash(i+71)-.5,hash(i+72)-.5,hash(i+73)-.5).normalize());
  let expanded=false,gesture=null,hover=false,last=0,time=0,phase=0,frameCounter=0,elapsed=0,slow=0,quality=1.5;
  let story={active:false,progress:0,scatter:0,turn:0};
  const rotation=new THREE.Vector2(.17,-.12),inertia=new THREE.Vector2();
  const pointer=new THREE.Vector2(5,5),raycaster=new THREE.Raycaster(),localRay=new THREE.Ray(),inverse=new THREE.Matrix4(),closest=new THREE.Vector3(),point=new THREE.Vector3(),delta=new THREE.Vector3();
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),turn=new THREE.Quaternion();
  const expandButton=document.querySelector('#expand'),resetButton=document.querySelector('#reset'),hint=document.querySelector('#hint');
  const diag={active:false,expanded:false,frames:0,instances:count,drawCalls:0,triangles:0,maxDisplacement:0,disturbedPieces:0,rotation:[0,0],fps:0,gpu,pulsePhase:0,pulseGain:0,pulsePeriod:IDLE_PULSE.period};
  Object.defineProperty(canvas,'sculptureDiagnostics',{get:()=>({...diag})});
  function listen(target,type,fn,options){target.addEventListener(type,fn,options);cleanup.push(()=>target.removeEventListener(type,fn,options));}
  function updateControls(){expandButton.setAttribute('aria-pressed',String(expanded));expandButton.innerHTML=expanded?'Reassemble <span aria-hidden="true">↙</span>':'Expand sculpture <span aria-hidden="true">↗</span>';expandButton.disabled=!active;resetButton.disabled=!active;hint.textContent=expanded?'Click to reassemble · Drag to explore':'Brush to scatter · Click to expand · Drag to rotate';}
  function toggle(){if(!active||story.active)return;expanded=!expanded;updateControls();}
  function reset(){if(!active)return;expanded=false;rotation.set(.17,-.12);inertia.set(0,0);hover=false;updateControls();}
  function coordinates(e){const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);}
  function updateRay(){assembly.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);inverse.copy(assembly.matrixWorld).invert();localRay.copy(raycaster.ray).applyMatrix4(inverse);}
  function hit(){updateRay();for(let i=0;i<count;i++){point.copy(bases[i].p);point.x+=offsets[i*3];point.y+=offsets[i*3+1];point.z+=offsets[i*3+2];if(localRay.distanceSqToPoint(point)<.06)return true;}return false;}
  function down(e){if(!active||e.button!==0)return;coordinates(e);if(!hit())return;gesture={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,t:e.timeStamp,moved:false};inertia.set(0,0);host.setPointerCapture(e.pointerId);e.preventDefault();}
  function move(e){coordinates(e);hover=true;if(gesture&&gesture.id===e.pointerId){if(Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy)>6)gesture.moved=true;if(gesture.moved){const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,dt=Math.max(.008,(e.timeStamp-gesture.t)/1000);rotation.x=THREE.MathUtils.clamp(rotation.x+dy*.005,-1.25,1.25);rotation.y+=dx*.005;inertia.set(THREE.MathUtils.clamp(dy*.005/dt,-1.6,1.6),THREE.MathUtils.clamp(dx*.005/dt,-2.5,2.5));host.classList.add('dragging');}gesture.x=e.clientX;gesture.y=e.clientY;gesture.t=e.timeStamp;}else host.style.cursor=active&&hit()?'grab':'';}
  function cancel(){const id=gesture?.id;gesture=null;if(id!==undefined&&host.hasPointerCapture(id))host.releasePointerCapture(id);inertia.set(0,0);hover=false;host.classList.remove('dragging');host.style.cursor='';}
  function up(e){if(!gesture||gesture.id!==e.pointerId)return;const clicked=!gesture.moved;gesture=null;if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);host.classList.remove('dragging');if(clicked)toggle();}
  listen(host,'pointerdown',down);listen(host,'pointermove',move,{passive:true});listen(host,'pointerup',up);listen(host,'pointercancel',cancel);listen(host,'lostpointercapture',()=>{if(gesture)cancel();});listen(host,'pointerleave',()=>{if(!gesture){hover=false;host.style.cursor='';}});listen(expandButton,'click',toggle);listen(resetButton,'click',reset);
  cleanup.push(cancel);
  function resize(){const r=host.getBoundingClientRect(),aspect=Math.max(.1,r.width/r.height);const width=Math.max(7.1,4.9*aspect);camera.left=-width/2;camera.right=width/2;camera.top=width/aspect/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);if(!active)renderer.render(scene,camera);}
  observer=new ResizeObserver(resize);observer.observe(host);resize();
  function tick(now){
   if(!active||disposed)return;if(now-last<1000/60-.5){raf=requestAnimationFrame(tick);return;}const wall=(now-last)/1000,dt=Math.min(wall||1/60,.05);last=now;time+=dt;
   phase+=(Number(expanded)-phase)*(1-Math.exp(-dt*4));
   if(!gesture){rotation.addScaledVector(inertia,dt);inertia.multiplyScalar(Math.exp(-dt*6));rotation.x=THREE.MathUtils.clamp(rotation.x,-1.25,1.25);}
   assembly.rotation.set(rotation.x+Math.sin(time*.35)*.025,rotation.y+Math.sin(time*.22)*.04+story.turn*.24,-.1+story.turn*.12);assembly.scale.setScalar(1-phase*.32-story.scatter*.22);assembly.position.y=Math.sin(time*.65)*.035;
   updateRay();let touched=0;
   for(let i=0;i<count;i++){
    const k=i*3,b=bases[i];let influence=0;
    if(hover&&!gesture&&!expanded){localRay.closestPointToPoint(b.p,closest);delta.copy(b.p).sub(closest);const d=delta.length();influence=Math.max(0,1-d/.9);influence*=influence;if(influence>.01)touched++;if(d>.001)delta.multiplyScalar(1/d);else delta.set(0,1,0);}
    targets[k]=expanded?bursts[i].x:(delta.x*.9+axes[i].x*.45)*influence;
    targets[k+1]=expanded?bursts[i].y:(delta.y*.9+axes[i].y*.45)*influence;
    targets[k+2]=expanded?bursts[i].z:influence*(.95+axes[i].z*.35);
    if(story.active){const release=story.scatter*Math.max(0,Math.min(1,(b.p.x+.3)/2.6));targets[k]+=bursts[i].x*release;targets[k+1]+=bursts[i].y*release;targets[k+2]+=bursts[i].z*release;}
   }
   const interacting=expanded||Boolean(gesture)||touched>0||story.scatter>.1;
   const pulseTarget=interacting?.06:IDLE_PULSE.strength;
   pulseUniforms.gain.value+=(pulseTarget-pulseUniforms.gain.value)*(1-Math.exp(-dt*(interacting?IDLE_PULSE.fadeOut:IDLE_PULSE.fadeIn)));
   pulseUniforms.phase.value=(time/IDLE_PULSE.period)%1;
   // Bounded semi-implicit spring steps keep response stable across frame rates.
   for(let t=0;t<dt;t+=1/120){const h=Math.min(1/120,dt-t);for(let k=0;k<offsets.length;k++){velocities[k]+=(70*(targets[k]-offsets[k])-15*velocities[k])*h;offsets[k]+=velocities[k]*h;}}
   let maximum=0;
   for(let i=0;i<count;i++){
    const k=i*3,b=bases[i],distance=Math.hypot(offsets[k],offsets[k+1],offsets[k+2]);maximum=Math.max(maximum,distance);
    point.copy(b.p);point.x+=offsets[k];point.y+=offsets[k+1];point.z+=offsets[k+2];turn.setFromAxisAngle(axes[i],Math.min(2.4,distance*1.8));q.copy(b.q).multiply(turn);matrix.compose(point,q,b.s);
    for(const batch of batches)batch.setMatrixAt(i,matrix);
   }
   for(const batch of batches)batch.instanceMatrix.needsUpdate=true;
   renderer.render(scene,camera);frameCounter++;elapsed+=wall;
   if(frameCounter>=60){diag.fps=frameCounter/elapsed;slow=diag.fps<30?slow+elapsed:0;if(slow>4&&quality>1){quality=1;renderer.setPixelRatio(Math.min(devicePixelRatio,1));resize();slow=0;}else if(slow>6){setActive(false);onFailure();return;}frameCounter=0;elapsed=0;}
   Object.assign(diag,{active,expanded,frames:diag.frames+1,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,maxDisplacement:maximum,disturbedPieces:touched,rotation:[rotation.x,rotation.y],pulsePhase:pulseUniforms.phase.value,pulseGain:pulseUniforms.gain.value,storyProgress:story.progress,storyScatter:story.scatter});raf=requestAnimationFrame(tick);
  }
  function setActive(value){if(disposed)return;if(value===active){updateControls();return;}active=value;diag.active=value;updateControls();if(value){last=performance.now();raf=requestAnimationFrame(tick);}else{cancel();cancelAnimationFrame(raf);}}
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();setActive(false);onFailure();});
  await renderer.compileAsync(scene,camera);renderer.render(scene,camera);if(!renderer.info.programs.every(p=>p.diagnostics?.runnable!==false))throw Error('Shader compilation failed');
  function setStory(value){if(disposed)return;if(value.active&&!story.active){expanded=false;rotation.set(.17,-.12);inertia.set(0,0);updateControls();}story=value;}
  return {setActive,setStory,dispose};
 }catch(e){dispose();throw e;}
}
