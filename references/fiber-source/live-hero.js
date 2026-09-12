import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/GLTFLoader.js';
import {GuideSprings} from './springs.js';

export async function createLiveHero({host,onFailure}) {
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
 try {
 const gl=renderer.getContext(),debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
 const gpuName=debugInfo?gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL):'';
 if(/swiftshader|llvmpipe|software/i.test(gpuName))throw Error('Software graphics renderer');
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.2;
 const canvas=renderer.domElement;canvas.className='live-canvas';host.append(canvas);
 const scene=new THREE.Scene(),assembly=new THREE.Group();scene.add(assembly);
 const camera=new THREE.OrthographicCamera(-5.2,5.2,3.25,-3.25,.1,100);
 camera.position.set(0,.8,14);camera.lookAt(-1.35,0,0);
 const envScene=new THREE.Scene();envScene.background=new THREE.Color(.07,.075,.08);
 function panel(x,y,z,w,h,strength,tint=0xffffff){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(tint).multiplyScalar(strength),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);envScene.add(m);return m;}
 panel(-4,4,5,4,6,6);panel(4,1,-3,3,5,4);panel(-4,1,-1,2,5,3);panel(0,-4,3,3,2,1.5);
 const pmrem=new THREE.PMREMGenerator(renderer);const studio=pmrem.fromScene(envScene,.06,.1,100,{size:128});scene.environment=studio.texture;
 const topReflection=panel(0,2,0,3.5,2.5,1.8,0xe9ed40),bottomReflection=panel(0,-2,0,3.5,2.5,1.8,0xe9ed40);
 const optic=pmrem.fromScene(envScene,.03,.1,100,{size:128});envScene.remove(topReflection,bottomReflection);
 scene.add(new THREE.HemisphereLight(0xfaf9e9,0x252831,1.1));
 function light(x,y,z,c,p){let l=new THREE.DirectionalLight(c,p);l.position.set(x,y,z);scene.add(l);}
 light(-4,6,5,0xffffff,3);light(4,1,-4,0xdfe8ff,2.8);light(-3,-2,2,0xfbf8d0,.8);
 const base='./assets/live/';
 async function file(name){const r=await fetch(base+name);if(!r.ok)throw Error('Missing live asset: '+name);return r;}
 const [gltf,meta,up,lo,ug,lg]=await Promise.all([new GLTFLoader().loadAsync(base+'sculpture.glb'),file('groom.json').then(r=>r.json()),file('upper-paths.bin').then(r=>r.arrayBuffer()),file('lower-paths.bin').then(r=>r.arrayBuffer()),file('upper-guides.bin').then(r=>r.arrayBuffer()),file('lower-guides.bin').then(r=>r.arrayBuffer())]);
 assembly.add(gltf.scene);
 const upper=gltf.scene.getObjectByName('Upper_Pivot'),lower=gltf.scene.getObjectByName('Lower_Pivot'),core=gltf.scene.getObjectByName('Suspended_Optical_Core');
 if(!upper||!lower||!core)throw Error('Incomplete sculpture export');
 gltf.scene.traverse(o=>{if(!o.isMesh)return;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.envMapIntensity=1.05;if(m.name.includes('Inner')){m.color.set('#eee900');m.metalness=.25;m.roughness=.27;m.emissive.set('#c6c800');m.emissiveIntensity=.12;}if(m.name.includes('Fibers')){m.color.set('#101216');m.roughness=.48;}}});
 core.material=new THREE.MeshPhysicalMaterial({color:0x24261b,metalness:.9,roughness:.16,clearcoat:1,clearcoatRoughness:.15,envMap:optic.texture,envMapIntensity:1.2});
 const bases=[upper,lower].map(p=>({position:p.position.clone(),quaternion:p.quaternion.clone()}));
 const coreBase=core.position.clone();
 const systems=[];
 function hair(parent,label,buffer,ids){
  const paths=new Float32Array(buffer),count=meta[label].count,width=1024,height=Math.ceil(count*8/width),data=new Float32Array(width*height*4);
  for(let i=0;i<count*8;i++){data[i*4]=paths[i*4];data[i*4+1]=paths[i*4+2];data[i*4+2]=-paths[i*4+1];data[i*4+3]=paths[i*4+3];}
  const texture=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);texture.needsUpdate=true;
  const guideData=new Float32Array(128*4),guideTexture=new THREE.DataTexture(guideData,128,1,THREE.RGBAFormat,THREE.FloatType);guideTexture.needsUpdate=true;
  const springs=new GuideSprings(128),roots=meta[label].guides.map(v=>new THREE.Vector3(v[0],v[2],-v[1]));
  const geom=new THREE.InstancedBufferGeometry();const vertices=[],indices=[];
  for(let i=0;i<8;i++)for(let j=0;j<3;j++)vertices.push(i,j*2*Math.PI/3,0);
  for(let i=0;i<7;i++)for(let j=0;j<3;j++){let a=i*3+j,b=i*3+(j+1)%3,c=(i+1)*3+j,d=(i+1)*3+(j+1)%3;indices.push(a,c,b,b,c,d);}
  geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setAttribute('normal',new THREE.Float32BufferAttribute(vertices.map(()=>0),3));geom.setIndex(indices);
  geom.setAttribute('strandIndex',new THREE.InstancedBufferAttribute(Float32Array.from({length:count},(_,i)=>i),1));
  geom.setAttribute('guideIndex',new THREE.InstancedBufferAttribute(new Float32Array(ids),1));geom.instanceCount=count;
  const mat=new THREE.MeshStandardMaterial({color:0x08090b,metalness:0,roughness:.72,side:THREE.DoubleSide,envMapIntensity:.16});
  mat.onBeforeCompile=shader=>{
   shader.uniforms.pathMap={value:texture};shader.uniforms.pathSize={value:new THREE.Vector2(width,height)};shader.uniforms.guideMap={value:guideTexture};
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute float strandIndex;
attribute float guideIndex;
uniform sampler2D pathMap;
uniform sampler2D guideMap;
uniform vec2 pathSize;
varying float fiberTip;
vec4 pathAt(float k){float n=strandIndex*8.0+k;return texture2D(pathMap,(vec2(mod(n,pathSize.x),floor(n/pathSize.x))+.5)/pathSize);}
vec3 bendAt(float k,vec3 offset){return pathAt(k).xyz+offset*pow(k/7.0,2.0);}
`);
   shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`
vec3 guideOffset=texture2D(guideMap,vec2((guideIndex+.5)/128.0,.5)).xyz;
float ring=position.x;vec4 pth=pathAt(ring);
vec3 center=bendAt(ring,guideOffset);
vec3 tangent=normalize(bendAt(min(7.0,ring+1.0),guideOffset)-bendAt(max(0.0,ring-1.0),guideOffset));
vec3 side=normalize(cross(tangent,abs(tangent.y)>.9?vec3(1,0,0):vec3(0,1,0)));
vec3 radial=cos(position.y)*side+sin(position.y)*cross(tangent,side);
vec3 objectNormal=radial;
`);
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`vec3 transformed=center+radial*pth.w;fiberTip=ring/7.0;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float fiberTip;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= mix(0.18,0.8,smoothstep(0.0,0.9,fiberTip));').replace('#include <opaque_fragment>','outgoingLight *= mix(0.07,0.42,pow(fiberTip,1.6));\n#include <opaque_fragment>');
  };
  const mesh=new THREE.Mesh(geom,mat);mesh.frustumCulled=false;parent.add(mesh);
  systems.push({parent,roots,springs,guideData,guideTexture,texture,mesh});
 }
 hair(upper,'upper',up,ug);hair(lower,'lower',lo,lg);
 let active=false,disposed=false,raf=0,last=0,time=0,opening=1,openVelocity=0,hover=false,isOpen=true,gesture=null;
 const spin=new THREE.Vector2(),spinVelocity=new THREE.Vector2();
 const closedRotations=[new THREE.Quaternion(),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI)];
 const toggle=document.querySelector('#sculpture-toggle'),hint=document.querySelector('#interaction-hint');
 const rigidMeshes=[];gltf.scene.traverse(o=>{if(o.isMesh&&!systems.some(s=>s.mesh===o))rigidMeshes.push(o);});
 const target=new THREE.Vector2(),pointer=new THREE.Vector2(),previous=new THREE.Vector2(),speed=new THREE.Vector2(),localCursor=new THREE.Vector3();
 const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),worldCursor=new THREE.Vector3();
 const hero=document.querySelector('.hero');let frames=0,totalDt=0,slowTime=0,quality=1.5;
 const diagnostic={mode:'live',frames:0,triangles:0,drawCalls:0,rotation:[0,0],opening:1,isOpen:true,dragging:false,maxGuideDisplacement:0,active:false,pixelRatio:renderer.getPixelRatio(),fps:0,gpu:gpuName};
 // Small read-only snapshot for reproducible regression checks.
 Object.defineProperty(canvas,'apertureDiagnostics',{get:()=>({...diagnostic})});
 function resize(){const r=host.getBoundingClientRect(),a=r.width/r.height;if(a>=1.6){camera.left=-5.2;camera.right=5.2;camera.top=5.2/a;camera.bottom=-5.2/a;}else{camera.top=3.25;camera.bottom=-3.25;camera.left=-3.25*a;camera.right=3.25*a;}camera.updateProjectionMatrix();assembly.scale.setScalar(Math.min(.74,(camera.top-camera.bottom)*.68/6.8));assembly.position.x=.85;renderer.setSize(r.width,r.height,false);if(!active)renderer.render(scene,camera);}
 function coordinates(e){const r=host.getBoundingClientRect();target.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));}
 function overObject(e){
  if(e.target.closest('a,button,dialog'))return false;
  coordinates(e);scene.updateMatrixWorld(true);raycaster.setFromCamera(target,camera);
  return raycaster.intersectObjects(rigidMeshes,false).length>0;
 }
 function updateInteraction(){
  toggle.hidden=false;toggle.textContent=isOpen?'Close sculpture':'Open sculpture';toggle.setAttribute('aria-expanded',String(isOpen));toggle.disabled=!active;
  hint.textContent=isOpen?'Click the sculpture to close · Brush to stir the fibers':'Click to open · Drag to rotate · Brush the fibers';
 }
 function toggleOpen(){if(!active)return;isOpen=!isOpen;spinVelocity.set(0,0);updateInteraction();}
 function move(e){
  coordinates(e);hover=!e.target.closest('a,button,dialog');
  if(gesture&&e.pointerId===gesture.id){
   const distance=Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY);
   if(distance>6)gesture.moved=true;
   if(gesture.moved&&!isOpen){
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,seconds=Math.max(.008,(e.timeStamp-gesture.time)/1000);
    spin.x=THREE.MathUtils.clamp(spin.x+dy*.006,-1.25,1.25);spin.y+=dx*.006;
    spinVelocity.set(THREE.MathUtils.clamp(dy*.006/seconds,-2,2),THREE.MathUtils.clamp(dx*.006/seconds,-3,3));
    hero.style.cursor='grabbing';
   }
   gesture.x=e.clientX;gesture.y=e.clientY;gesture.time=e.timeStamp;
  }else hero.style.cursor=active&&overObject(e)?(isOpen?'pointer':'grab'):'';
 }
 function down(e){
  if(!active||e.button!==0||!overObject(e))return;
  gesture={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,time:e.timeStamp,moved:false};spinVelocity.set(0,0);
  hero.setPointerCapture(e.pointerId);hero.classList.add('sculpture-grab');e.preventDefault();
 }
 function pointerUp(e){
  if(!gesture||e.pointerId!==gesture.id)return;
  const clicked=!gesture.moved;gesture=null;
  if(hero.hasPointerCapture(e.pointerId))hero.releasePointerCapture(e.pointerId);
  hero.classList.remove('sculpture-grab');hero.style.cursor='';
  if(clicked)toggleOpen();
 }
 function cancel(){const id=gesture?.id;gesture=null;if(id!==undefined&&hero.hasPointerCapture(id))hero.releasePointerCapture(id);spinVelocity.set(0,0);hero.classList.remove('sculpture-grab');hero.style.cursor='';}
 function lostCapture(){if(gesture)cancel();}
 function leave(){if(!gesture){hover=false;target.set(0,0);hero.style.cursor='';}}
 hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',leave);
 hero.addEventListener('pointerdown',down);hero.addEventListener('pointerup',pointerUp);hero.addEventListener('pointercancel',cancel);hero.addEventListener('lostpointercapture',lostCapture);
 toggle.addEventListener('click',toggleOpen);
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function tick(now){
  if(!active||disposed)return;if(now-last<1000/60-.5){raf=requestAnimationFrame(tick);return;}const wallDt=(now-last)/1000||1/60;const dt=Math.min(wallDt,.05);last=now;time+=dt;
  previous.copy(pointer);pointer.lerp(target,1-Math.exp(-dt*7));speed.copy(pointer).sub(previous).multiplyScalar(1/Math.max(dt,.001));
  if(isOpen){spin.multiplyScalar(Math.exp(-dt*5));spinVelocity.set(0,0);}
  else if(!gesture){spin.addScaledVector(spinVelocity,dt);spin.x=THREE.MathUtils.clamp(spin.x,-1.25,1.25);spinVelocity.multiplyScalar(Math.exp(-dt*6));}
  assembly.rotation.set(spin.x,spin.y,0);
  raycaster.setFromCamera(pointer,camera);raycaster.ray.intersectPlane(plane,worldCursor);
  const openTarget=isOpen?1:0;
  // Shell response uses its own damped spring, independent of fiber springs.
  for(let t=0;t<dt;t+=1/120){let h=Math.min(1/120,dt-t);openVelocity+=(45*(openTarget-opening)-14*openVelocity)*h;opening+=openVelocity*h;}
  const amount=THREE.MathUtils.clamp(opening,0,1);
  [upper,lower].forEach((p,i)=>{const sign=i===0?1:-1;p.position.set(0,sign*.024,0).lerp(bases[i].position,amount);p.position.y+=sign*.14*amount;p.quaternion.copy(closedRotations[i]).slerp(bases[i].quaternion,amount);});
  core.position.copy(coreBase);core.position.y+=Math.sin(time*.9)*.035*amount;core.rotation.y=time*.09;
  const coreReveal=THREE.MathUtils.smoothstep(amount,.5,1);core.scale.setScalar(Math.max(.001,coreReveal));core.visible=coreReveal>.001;
  scene.updateMatrixWorld(true);let maxGuide=0;
  for(const sys of systems){
   localCursor.copy(worldCursor);sys.parent.worldToLocal(localCursor);
   for(let i=0;i<128;i++){
    const root=sys.roots[i],d=root.distanceTo(localCursor),influence=hover?Math.exp(-d*d/1.5):0,k=i*3;
    sys.springs.target[k]=Math.sin(time*.8+i*.6)*.009+influence*(speed.x*.09+(root.x-localCursor.x)*.16);
    sys.springs.target[k+1]=Math.cos(time*.65+i*.43)*.008+influence*(root.y-localCursor.y)*.12;
    sys.springs.target[k+2]=Math.sin(time*.7+i*.21)*.008+influence*(speed.y*.08+.11)-openVelocity*.025;
   }
   sys.springs.advance(dt);
   for(let i=0;i<128;i++){let k=i*3,j=i*4;sys.guideData[j]=sys.springs.position[k];sys.guideData[j+1]=sys.springs.position[k+1];sys.guideData[j+2]=sys.springs.position[k+2];maxGuide=Math.max(maxGuide,Math.hypot(...sys.springs.position.subarray(k,k+3)));}
   sys.guideTexture.needsUpdate=true;
  }
  renderer.render(scene,camera);frames++;totalDt+=wallDt;
  if(frames%60===0){diagnostic.fps=frames/totalDt;if(diagnostic.fps<35)slowTime+=totalDt;else slowTime=0;frames=0;totalDt=0;
   if(slowTime>4&&quality>1){quality=1;renderer.setPixelRatio(Math.min(devicePixelRatio,quality));for(const sys of systems)sys.mesh.geometry.instanceCount=Math.floor(meta.upper.count*.65);resize();diagnostic.pixelRatio=renderer.getPixelRatio();slowTime=0;}else if(slowTime>5&&diagnostic.fps<24){setActive(false);onFailure(new Error('Sustained low rendering performance'));return;}}
  Object.assign(diagnostic,{frames:diagnostic.frames+1,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,rotation:[assembly.rotation.x,assembly.rotation.y],opening,isOpen,dragging:Boolean(gesture?.moved),scale:assembly.scale.x,maxGuideDisplacement:maxGuide,active:true});
  raf=requestAnimationFrame(tick);
 }
 function setActive(value){if(disposed)return;if(value===active){updateInteraction();return;}active=value;diagnostic.active=value;updateInteraction();if(active){last=performance.now();raf=requestAnimationFrame(tick);}else{cancel();cancelAnimationFrame(raf);last=0;}}
 function lost(e){e.preventDefault();setActive(false);onFailure(new Error('Graphics context lost'));}
 canvas.addEventListener('webglcontextlost',lost);
 // Compile before showing the live layer; a failed shader must not reveal a blank canvas.
 await renderer.compileAsync(scene,camera);renderer.render(scene,camera);
 if(!renderer.info.programs.every(p=>p.diagnostics?.runnable!==false))throw Error('Fiber shader failed');
 return {setActive,canvas,dispose(){cancel();disposed=true;active=false;toggle.hidden=true;toggle.removeEventListener('click',toggleOpen);cancelAnimationFrame(raf);observer.disconnect();hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);hero.removeEventListener('pointerdown',down);hero.removeEventListener('pointerup',pointerUp);hero.removeEventListener('pointercancel',cancel);hero.removeEventListener('lostpointercapture',lostCapture);canvas.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});for(const s of systems){s.texture.dispose();s.guideTexture.dispose();}studio.dispose();optic.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
 }catch(error){renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();throw error;}
}

