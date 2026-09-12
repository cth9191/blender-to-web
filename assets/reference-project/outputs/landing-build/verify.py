from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path(__file__).resolve().parent;report={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,channel='chrome',args=['--use-angle=d3d11','--ignore-gpu-blocklist'])
 ctx=b.new_context(viewport={'width':1672,'height':941},permissions=['clipboard-read','clipboard-write']);page=ctx.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
 page.goto('http://127.0.0.1:4175/');page.wait_for_selector('body.story-mode');page.wait_for_timeout(1200)
 diag=lambda:page.locator('canvas').evaluate('(c)=>c.sculptureDiagnostics')
 report['hero']=diag();page.screenshot(path=str(O/'desktop-hero.png'));assert page.locator('.hero-copy').get_attribute('aria-hidden')=='false'
 page.locator('#expand').click();page.wait_for_timeout(1000);assert diag()['expanded'];page.locator('#expand').click();page.wait_for_timeout(1200)
 def story(value):
  page.evaluate('(v)=>scrollTo({top:(document.querySelector(".journey").offsetHeight-innerHeight)*v,behavior:"instant"})',value);page.wait_for_timeout(1200)
 story(.4);report['scattered']=diag();assert diag()['storyScatter']>.6 and diag()['maxDisplacement']>.4;assert page.locator('.scattered').get_attribute('aria-hidden')=='false';assert page.locator('.hero-copy').get_attribute('inert') is not None;page.screenshot(path=str(O/'desktop-story-scattered.png'))
 story(.88);report['connected']=diag();assert diag()['storyScatter']==0;assert page.locator('.connected').get_attribute('aria-hidden')=='false';page.wait_for_timeout(700);assert diag()['maxDisplacement']<.005;page.screenshot(path=str(O/'desktop-story-connected.png'))
 page.locator('.connected .primary').click();page.wait_for_timeout(850);assert page.locator('#demo').is_visible();page.wait_for_function('!document.querySelector("canvas").sculptureDiagnostics.active')
 page.locator('#demo').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.wait_for_timeout(300);page.screenshot(path=str(O/'desktop-product.png'))
 page.locator('#tab-risk').click();assert page.locator('#answer h3').inner_text()=='Make the basics work for everyone.';assert page.locator('.citation').count()==2
 page.locator('#tab-risk').press('ArrowRight');assert page.locator('#tab-next').get_attribute('aria-selected')=='true';assert page.locator('#answer h3').inner_text()=='Put the prototype in front of people.'
 page.locator('#copy-answer').click();assert 'Prepare three source-based tasks' in page.evaluate('navigator.clipboard.readText()')
 page.locator('.citation').first.click();assert page.locator('#source-notes').get_attribute('open') is not None;assert page.locator('#note-3').evaluate('(el)=>el===document.activeElement');page.screenshot(path=str(O/'desktop-source.png'))
 page.locator('#source-notes summary').click();page.locator('#tab-priority').click()
 page.locator('.detail').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.wait_for_timeout(300);page.screenshot(path=str(O/'desktop-detail.png'))
 page.locator('.finale').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.wait_for_timeout(300);page.screenshot(path=str(O/'desktop-finale.png'))
 page.locator('.finale .primary').click();page.wait_for_timeout(500);assert '#demo' in page.url
 page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(350);page.locator('#pause').click();frames=diag()['frames'];phase=diag()['pulsePhase'];page.wait_for_timeout(300);assert diag()['frames']==frames and diag()['pulsePhase']==phase;page.locator('#pause').click()
 page.emulate_media(reduced_motion='reduce');page.wait_for_function('!document.querySelector("canvas")');assert not page.locator('body').evaluate('(el)=>el.classList.contains("story-mode")');assert page.locator('.static-stories').is_visible();page.screenshot(path=str(O/'reduced-hero.png'));page.emulate_media(reduced_motion='no-preference');page.wait_for_selector('.stage.ready');page.close();ctx.close()
 for name,w,h,touch in [('mobile',390,844,True),('pane',780,900,False),('desktop-small',1280,720,False)]:
  page=b.new_page(viewport={'width':w,'height':h},is_mobile=touch,has_touch=touch);page.on('pageerror',lambda e:errors.append(str(e)));requests=[];page.on('request',lambda r:requests.append(r.url));page.goto('http://127.0.0.1:4175/');page.wait_for_timeout(1100)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
  if touch:assert page.locator('canvas').count()==0 and not any('.glb' in x for x in requests)
  else:page.wait_for_selector('.stage.ready')
  page.screenshot(path=str(O/f'{name}-hero.png'))
  if name!='desktop-small':
   page.locator('.static-stories').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.screenshot(path=str(O/f'{name}-story.png'))
   page.locator('#demo').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.wait_for_timeout(150);page.screenshot(path=str(O/f'{name}-product.png'));page.locator('#tab-next').click();assert 'Put the prototype' in page.locator('#answer').inner_text()
   page.locator('.detail').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.wait_for_timeout(150);page.screenshot(path=str(O/f'{name}-detail.png'))
   page.locator('.finale').evaluate('(el)=>el.scrollIntoView({behavior:"instant",block:"start"})');page.screenshot(path=str(O/f'{name}-finale.png'))
  report[name]={'no_overflow':True,'still_only':touch};page.close()
 page=b.new_page();page.route('**/infinity.glb',lambda r:r.abort());page.goto('http://127.0.0.1:4175/');page.wait_for_timeout(800);assert page.locator('canvas').count()==0 and page.locator('.static-stories').is_visible();page.close();b.close()
assert not errors,errors
report['status']='passed';report['errors']=errors;report['checks']=['hero expansion preserved','scroll scatter/reassembly','inactive story focus removed','demo CTA','offscreen renderer pause','three sample questions','keyboard tab navigation','copy answer','source focus and original note','detail and finale','pause freezes pulse','reduced-motion normal-flow story','mobile still no GLB','responsive no-overflow','asset failure story fallback']
(O/'validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
