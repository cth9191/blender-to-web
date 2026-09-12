from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os
out=Path('outputs/scroll-refinement');report={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,channel='chrome',args=['--use-angle=d3d11','--ignore-gpu-blocklist'])
 page=b.new_page(viewport={'width':1672,'height':941});requests=[];errors=[];page.on('request',lambda r:requests.append(r.url));page.on('pageerror',lambda e:errors.append(str(e)));page.goto(os.environ.get('DEMO_URL','http://127.0.0.1:4175/'));page.wait_for_selector('body.story-mode');page.wait_for_timeout(500)
 canvas=page.locator('canvas').element_handle();diag=lambda:canvas.evaluate('(c)=>c.sculptureDiagnostics')
 stage=page.locator('.stage');rect=stage.bounding_box();hit=None
 for xf,yf in [(.5,.5),(.4,.4),(.7,.4),(.3,.5),(.65,.65),(.25,.65)]:
  x,y=rect['x']+rect['width']*xf,rect['y']+rect['height']*yf;page.mouse.move(x,y)
  if stage.evaluate('(e)=>e.style.cursor')=='grab':hit=(x,y);break
 assert hit,'No draggable tile found'
 x,y=hit;page.mouse.down();page.mouse.move(x+140,y+45,steps=20);page.mouse.up();page.mouse.move(200,100);page.wait_for_timeout(1000)
 before=diag()['rotation'];assert abs(before[1]+.12)>.4,before;report['after_drag']=before;page.screenshot(path=str(out/'orientation-hero.png'))
 def scroll(progress):
  page.evaluate('(p)=>scrollTo({top:(document.querySelector(".journey").offsetHeight-innerHeight)*p,behavior:"instant"})',progress);page.wait_for_timeout(250)
 for progress in [.1,.4,.88,0,.1,0]:
  scroll(progress);now=diag()['rotation'];assert max(abs(a-b) for a,b in zip(before,now))<.02,(progress,before,now);assert canvas.evaluate('(c)=>c===document.querySelector("canvas")');report[str(progress)]=now
 page.screenshot(path=str(out/'orientation-returned.png'))
 page.locator('#expand').click();page.wait_for_timeout(300);assert diag()['expanded'];scroll(.1);assert not diag()['expanded'];assert max(abs(a-b) for a,b in zip(before,diag()['rotation']))<.02
 scroll(0);page.locator('#reset').click();page.wait_for_timeout(100);assert diag()['rotation']==[.17,-.12]
 assert sum('.glb' in u for u in requests)==1;assert not errors,errors;b.close()
report.update(status='passed',checks=['drag orientation preserved entering story','same orientation through scatter and reassembly','orientation preserved returning to hero and re-entering','same canvas and one GLB request','expanded state closes without rotation reset','explicit Reset still works'],errors=errors)
(out/'orientation-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
