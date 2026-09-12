from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path(__file__).resolve().parent;report={};URL='http://127.0.0.1:4175/'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,channel='chrome',args=['--use-angle=d3d11','--ignore-gpu-blocklist'])
 page=b.new_page(viewport={'width':1440,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
 page.goto(URL);page.wait_for_selector('.stage.ready');page.wait_for_timeout(1400)
 diag=lambda:page.locator('canvas').evaluate('(c)=>c.sculptureDiagnostics')
 report['idle']=diag();assert diag()['instances']==1792 and diag()['drawCalls']==3 and diag()['maxDisplacement']<.001
 page.screenshot(path=str(O/'browser-idle.png'))
 page.mouse.move(1180,400,steps=20);page.wait_for_timeout(900);report['brush']=diag();assert .12<diag()['maxDisplacement']<1.2 and 0<diag()['disturbedPieces']<900,diag()
 page.screenshot(path=str(O/'browser-brush.png'))
 page.mouse.move(300,150);page.wait_for_timeout(2000);report['settled']=diag();assert diag()['maxDisplacement']<.005,diag()
 page.mouse.click(980,420);page.wait_for_timeout(1600);report['expanded']=diag();assert diag()['expanded'] and diag()['maxDisplacement']>1,diag()
 page.screenshot(path=str(O/'browser-expanded.png'))
 page.locator('#expand').focus();page.keyboard.press('Enter');page.mouse.move(200,150);page.wait_for_timeout(2000);assert not diag()['expanded'] and diag()['maxDisplacement']<.005
 page.mouse.move(980,420);page.mouse.down();page.mouse.move(1100,470,steps=20);page.mouse.up();page.mouse.move(200,150);page.wait_for_timeout(700)
 report['dragged']=diag();assert not diag()['expanded'] and abs(diag()['rotation'][1])>.3,diag();page.screenshot(path=str(O/'browser-dragged.png'))
 page.locator('#reset').click();page.wait_for_timeout(500);assert diag()['rotation']==[.17,-.12]
 page.locator('#pause').click();f=diag()['frames'];page.wait_for_timeout(250);assert diag()['frames']==f and page.locator('#expand').is_disabled()
 page.locator('#pause').click();page.wait_for_timeout(80);assert diag()['active']
 page.evaluate('scrollTo({top:document.querySelector("#idea").offsetTop,behavior:"instant"})');page.wait_for_function('!document.querySelector("canvas").sculptureDiagnostics.active');page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_function('document.querySelector("canvas").sculptureDiagnostics.active')
 for _ in range(10):page.locator('#expand').click();page.wait_for_timeout(50)
 page.mouse.move(200,150);page.wait_for_timeout(2000);assert not diag()['expanded'] and diag()['maxDisplacement']<.005
 page.emulate_media(reduced_motion='reduce');page.wait_for_function('!document.querySelector("canvas")');assert page.locator('.controls').is_hidden();page.emulate_media(reduced_motion='no-preference');page.wait_for_selector('.stage.ready')
 page.locator('canvas').evaluate('(c)=>c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext()');page.wait_for_function('!document.querySelector("canvas")');assert page.locator('#poster').is_visible() and page.locator('.controls').is_hidden()
 assert not errors,errors;report['errors']=errors;page.close()
 for name,width,height,mobile,reduced in [('desktop-720',1280,720,False,False),('desktop-retina',1920,1080,False,False),('pane',780,900,False,False),('mobile',390,844,True,False),('reduced',1440,900,False,True)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=2 if name=='desktop-retina' else 1,is_mobile=mobile,has_touch=mobile,reduced_motion='reduce' if reduced else 'no-preference');requests=[];page.on('request',lambda r:requests.append(r.url));page.goto(URL)
  if mobile or reduced:
   page.wait_for_timeout(300);assert page.locator('canvas').count()==0;assert not any('.glb' in u or '/vendor/' in u for u in requests);info={'still_only':True}
  else:
   page.wait_for_selector('.stage.ready');page.wait_for_timeout(1200);info=page.locator('canvas').evaluate('(c)=>c.sculptureDiagnostics');assert info['active']
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.screenshot(path=str(O/f'browser-{name}.png'));report[name]=info;page.close()
 page=b.new_page();page.route('**/infinity.glb',lambda r:r.abort());page.goto(URL);page.wait_for_timeout(1000);assert page.locator('canvas').count()==0 and page.locator('#poster').is_visible();page.close();b.close()
report['checks']=['local scatter affects subset','spring return without drift','click expands','keyboard reassembles','drag does not toggle','reset','pause/resume','offscreen pause','rapid toggles','reduced-motion unload/reload','context loss fallback','missing asset fallback','responsive layout','mobile still only'];report['status']='passed'
(O/'browser-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
