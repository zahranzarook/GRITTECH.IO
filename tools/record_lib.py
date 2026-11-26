"""Shared recorder used by tools/record_demos.py."""
import asyncio, sys, os, glob, shutil, subprocess
from playwright.async_api import async_playwright
import pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
F=str(ROOT/'node_modules/@fontsource')+'/'
FAM={'Fraunces':('fraunces',[(400,'normal'),(600,'normal'),(400,'italic')]),'Inter':('inter',[(400,'normal'),(500,'normal'),(600,'normal')]),
'Instrument Serif':('instrument-serif',[(400,'normal'),(400,'italic')]),'Manrope':('manrope',[(w,'normal') for w in (400,500,600,700)]),
'Plus Jakarta Sans':('plus-jakarta-sans',[(w,'normal') for w in (400,500,600,700,800)])}
CSS=''.join(f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:block;src:url(https://fonts.gstatic.com/x/{d}/{d}-latin-{w}-{st}.woff2) format('woff2')}}" for fam,(d,ws) in FAM.items() for w,st in ws)
GS={'gsap.min.js':'gsap/dist/gsap.min.js','ScrollTrigger.min.js':'gsap/dist/ScrollTrigger.min.js','lenis.min.js':'lenis/dist/lenis.min.js'}
async def fonts(r):
    u=r.request.url
    if 'googleapis' in u: return await r.fulfill(body=CSS, content_type='text/css')
    p=u.split('/x/')[-1]; d,f=p.split('/')
    await r.fulfill(path=F+d+'/files/'+f, content_type='font/woff2')
async def cdn(r): await r.fulfill(path=str(ROOT/'node_modules')+'/'+GS[r.request.url.split('/')[-1]], content_type='application/javascript')
BASE=os.environ.get('BASE','http://localhost:5173')
async def record(name, url, steps, size=(1280,720), prep=None):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--force-device-scale-factor=1'])
        d=f'/tmp/rec/raw-{name}'; shutil.rmtree(d,ignore_errors=True)
        ctx=await b.new_context(viewport={'width':size[0],'height':size[1]}, record_video_dir=d, record_video_size={'width':size[0],'height':size[1]})
        await ctx.route('https://fonts.googleapis.com/**', fonts); await ctx.route('https://fonts.gstatic.com/**', fonts); await ctx.route('https://cdn.jsdelivr.net/**', cdn)
        pg=await ctx.new_page()
        await pg.goto(BASE+url, wait_until='networkidle')
        await pg.evaluate("document.querySelector('.gritbar')?.remove()")
        if prep: await prep(pg)
        t0=await pg.evaluate('performance.now()')
        await steps(pg)
        t1=await pg.evaluate('performance.now()')
        await ctx.close(); await b.close()
        raw=glob.glob(d+'/*.webm')[0]
        # trim the page-load start; keep the scripted part
        dur=(t1-t0)/1000; total=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',raw]).decode())
        ss=max(0,total-dur-0.1)
        out=str(ROOT/f'public/media/store/{name}.mp4')
        subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',f'{ss:.2f}','-i',raw,'-t',f'{dur:.2f}','-vf','fps=30,scale=1280:-2','-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart','-an',out],check=True)
        print(name, round(dur,1),'s', os.path.getsize(out)//1024,'KB')
