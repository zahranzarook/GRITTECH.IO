"""Record looping preview videos of the demos for store cards, product pages and service tiles.

Setup (once):  pip install playwright && playwright install chromium   (ffmpeg must be installed)
Run:           npm run dev   (in another terminal, serves http://localhost:5173)
               python3 tools/record_demos.py            # all
               python3 tools/record_demos.py ember atlas  # some
Output:        public/media/store/<name>.mp4  (H.264, 1280x720, 30fps)
Fonts load from @fontsource (devDependencies) so videos match the live site even offline.
To add a demo: write a steps function below and add it to main().
"""
import asyncio, sys, math
from record_lib import record
W=lambda pg,ms: pg.wait_for_timeout(ms)
async def ember(pg):
    await W(pg,1200)
    for i in range(30): await pg.mouse.move(640+300*math.sin(i/5), 300+150*math.cos(i/5)); await W(pg,40)
    await pg.evaluate("lenis.scrollTo('#menu',{duration:1.8})"); await W(pg,2200)
    await pg.click("[data-cat='fire']"); await W(pg,900)
    await pg.click("[data-quick='shortrib']"); await W(pg,1000)
    await pg.evaluate("lenis.scrollTo('#story',{offset:-300,duration:2.4})"); await W(pg,2800)
async def atlas(pg):
    await W(pg,1800)
    await pg.click("#pills [data-d='japan']"); await W(pg,2200)
    await pg.click("#pills [data-d='usa']"); await W(pg,2200)
    await pg.evaluate("lenis.scrollTo(document.querySelector('.dest').getBoundingClientRect().top+scrollY,{duration:1.6})"); await W(pg,1800)
    await pg.evaluate("lenis.scrollTo(scrollY+1400,{duration:3.2})"); await W(pg,3500)
async def bite(pg):
    await W(pg,1700)
    await pg.click(".rest[data-rest='ember']"); await W(pg,1100)
    await pg.click("[data-quick='hummus']"); await W(pg,600)
    await pg.click(".item[data-item='shortrib'] b"); await W(pg,900)
    await pg.click("[data-size='1']"); await W(pg,300); await pg.click("[data-addit]"); await W(pg,900)
    await pg.click("#basketbar"); await W(pg,1200)
    await pg.click("[data-place]"); await W(pg,4200)
async def libprep(pg):
    await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
    for y in range(0,5000,600): await pg.evaluate(f"scrollTo(0,{y})"); await W(pg,250)
    await pg.evaluate("scrollTo(0, document.getElementById('ui-grid').getBoundingClientRect().top + scrollY - 90)"); await W(pg,2500)
async def lib(pg):
    await W(pg,800)
    for x,y in [(300,420),(330,400),(280,440),(700,430),(1000,420),(1020,440)]: await pg.mouse.move(x,y,steps=12); await W(pg,180)
    await pg.evaluate("(function(){var y0=scrollY,t0=performance.now();(function s(t){var k=Math.min(1,(t-t0)/5000);scrollTo(0,y0+k*1300);if(k<1)requestAnimationFrame(s)})(t0)})()"); await W(pg,5600)
async def main():
    which=sys.argv[1:] or ['ember','atlas','bite','lib']
    if 'ember' in which: await record('ember-restaurant','/demo/restaurant/',ember)
    if 'atlas' in which: await record('atlas-travel','/demo/travel/',atlas)
    if 'bite' in which: await record('bite-app','/demo/app-food/',bite)
    if 'lib' in which: await record('grit-ui-library','/store/ui-elements/',lib,prep=libprep)
asyncio.run(main())
