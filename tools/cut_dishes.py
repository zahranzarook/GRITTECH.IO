"""Cut top-down dish photos out of their background as clean circles (no white halos, rotation-safe).

Setup: pip install rembg onnxruntime opencv-python-headless pillow numpy
Usage: python3 tools/cut_dishes.py <photo.jpg> <out.webp> [--mode auto|hough|dark|free|union]
  auto  : AI mask -> ellipse fit of the plate (most plates)
  hough : circle detection on the plate edge (white plate on white background)
  dark  : fit the dark area (black plate on white background)
  free  : keep the AI outline (pizza, no plate)
  union : plate circle + AI outline (food that sticks out of the plate, e.g. a fish tail)
Output: 720x720 WEBP with alpha, plate centred.
Always check the result on a dark and a bright background before using it.
"""
import argparse, numpy as np, cv2
from PIL import Image

def ai_mask(im):
    from rembg import remove, new_session
    return np.array(remove(im, session=new_session('isnet-general-use'), only_mask=True)).astype(np.float32) / 255

def largest(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    return (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)

def ellipse_circle(m):
    c = max(cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)
    (x, y), (a, b), _ = cv2.fitEllipse(c)
    return x, y, (a + b) / 4

def hough_circle(im):
    g = cv2.GaussianBlur(cv2.cvtColor(np.array(im), cv2.COLOR_RGB2GRAY), (0, 0), 2)
    W, H = im.size
    cs = cv2.HoughCircles(g, cv2.HOUGH_GRADIENT, dp=1.2, minDist=50, param1=60, param2=40, minRadius=int(W * .32), maxRadius=int(W * .49))
    best = None
    for x, y, r in cs[0]:
        if abs(x - W / 2) < W * .12 and abs(y - H / 2) < H * .12 and (best is None or r > best[2]): best = (x, y, r)
    return best

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--mode', default='auto'); ap.add_argument('--size', type=int, default=720)
    a = ap.parse_args()
    im = Image.open(a.src).convert('RGB'); W, H = im.size
    yy, xx = np.mgrid[0:H, 0:W]
    circle = lambda cx, cy, r: np.clip(r - np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) + .5, 0, 1)
    if a.mode == 'dark':
        g = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2GRAY)
        m = largest(cv2.morphologyEx((g < 110).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8)))
        cx, cy, r = ellipse_circle(m); r -= 2; alpha = circle(cx, cy, r); R = r
    elif a.mode == 'hough':
        cx, cy, r = hough_circle(im); r -= 2; alpha = circle(cx, cy, r); R = r
    else:
        m = largest((ai_mask(im) > .5).astype(np.uint8))
        if a.mode == 'free':
            alpha = cv2.GaussianBlur(cv2.erode(m * 255, np.ones((3, 3), np.uint8)), (0, 0), .8) / 255.0
            ys, xs = np.nonzero(m); cx, cy = xs.mean(), ys.mean(); R = np.sqrt(((xs - cx) ** 2 + (ys - cy) ** 2).max())
        else:
            if a.mode == 'union': cx, cy, r = hough_circle(im)
            else: cx, cy, r = ellipse_circle(m)
            r -= 2; alpha = circle(cx, cy, r); R = r
            if a.mode == 'union':
                soft = cv2.GaussianBlur(cv2.erode(m * 255, np.ones((5, 5), np.uint8)), (0, 0), .8) / 255
                alpha = np.maximum(alpha, soft); ys, xs = np.nonzero(alpha > .05); R = np.sqrt(((xs - cx) ** 2 + (ys - cy) ** 2).max())
    out = np.dstack([np.array(im), (alpha * 255).astype(np.uint8)])
    p = 6; x0, y0, x1, y1 = int(max(0, cx - R - p)), int(max(0, cy - R - p)), int(min(W, cx + R + p)), int(min(H, cy + R + p))
    o = Image.fromarray(out[y0:y1, x0:x1], 'RGBA'); s = max(o.size)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(o, ((s - o.width) // 2, (s - o.height) // 2))
    res = sq.convert('RGB').resize((a.size, a.size), Image.LANCZOS); res.putalpha(sq.getchannel('A').resize((a.size, a.size), Image.LANCZOS))
    res.save(a.dst, 'WEBP', quality=82, exact=True)
    print('saved', a.dst)

if __name__ == '__main__': main()
