from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('outputs/scroll-refinement'); report=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,channel='chrome',args=['--use-angle=d3d11','--ignore-gpu-blocklist'])
 for width,height in [(1672,941),(1280,720)]:
  page=b.new_page(viewport={'width':width,'height':height});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:4175/');page.wait_for_selector('body.story-mode');page.wait_for_timeout(700)
  for progress in [0,.1,.25,.4,.65,.88,0]:
   page.evaluate('(p)=>scrollTo({top:(document.querySelector(".journey").offsetHeight-innerHeight)*p,behavior:"instant"})',progress);page.wait_for_timeout(300)
   state=page.evaluate('''()=>({texts:[...document.querySelectorAll('.hero-copy,.story-beat')].map(el=>({class:el.className,top:el.getBoundingClientRect().top,opacity:getComputedStyle(el).opacity,inert:el.inert})),scatter:document.querySelector('canvas').sculptureDiagnostics.storyScatter})''')
   if progress==.1:assert abs(state['texts'][0]['top']-(first_top-height*.24))<2
   if progress==0:first_top=state['texts'][0]['top'];assert state['texts'][0]['opacity']=='1'
   if progress==.4:assert state['scatter']>.7 and state['texts'][0]['inert'] and not state['texts'][1]['inert']
   if progress==.88:assert state['scatter']==0 and not state['texts'][2]['inert']
   page.screenshot(path=str(out/f'{width}-{progress}.png'));report.append({'width':width,'p':progress,**state})
  page.emulate_media(reduced_motion='reduce');page.wait_for_function('!document.querySelector("canvas")');assert page.locator('.hero-copy').evaluate('(e)=>getComputedStyle(e).translate')=='0px';assert page.locator('.static-stories').is_visible();assert not errors;page.close()
 b.close()
(out/'validation.json').write_text(json.dumps(report,indent=2));print('Passed: native text displacement, reverse scroll, story timing, reduced-motion reset; no JS errors.')
