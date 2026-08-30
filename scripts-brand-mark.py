import math
from PIL import Image, ImageDraw, ImageFont

V3=(0xA9,0x7B,0xFF); V1=(0x67,0x33,0xCC)   # --violet-3 -> --violet
ANGLE=145.0

# i-spark path from components/IconSprite.tsx, 24x24 viewBox (pure polygon)
SPARK=[(12,2.8),(14.3,9),(20.5,11.3),(14.3,13.6),(12,19.8),(9.7,13.6),(3.5,11.3),(9.7,9)]

def gradient(n):
    """CSS linear-gradient(145deg, V3, V1) over an n x n box."""
    th=math.radians(ANGLE)
    dx,dy=math.sin(th),-math.cos(th)          # CSS 0deg = to top, y grows down
    L=(abs(dx)+abs(dy))*n                     # CSS gradient-line length
    g=Image.new("RGB",(n,n)); px=g.load()
    for y in range(n):
        for x in range(n):
            # projection of pixel onto gradient line, origin at box centre
            t=(((x-n/2)*dx+(y-n/2)*dy)/L)+0.5
            t=0.0 if t<0 else 1.0 if t>1 else t
            px[x,y]=(round(V3[0]+(V1[0]-V3[0])*t),
                     round(V3[1]+(V1[1]-V3[1])*t),
                     round(V3[2]+(V1[2]-V3[2])*t))
    return g

def spark_mask(box, scale):
    """White spark glyph centred in a box of `box` px, glyph `scale` of the box."""
    m=Image.new("L",(box,box),0)
    d=ImageDraw.Draw(m)
    s=box*scale/24.0
    off=(box-24*s)/2
    d.polygon([(off+x*s, off+y*s) for x,y in SPARK], fill=255)
    return m

def mark(size, radius_frac, glyph_scale, ss=4):
    """The brand mark: gradient square (optionally rounded) + white spark."""
    n=size*ss
    img=gradient(256).resize((n,n), Image.BICUBIC).convert("RGBA")
    if radius_frac:
        rm=Image.new("L",(n,n),0)
        ImageDraw.Draw(rm).rounded_rectangle([0,0,n-1,n-1], radius=int(n*radius_frac), fill=255)
        img.putalpha(rm)
    else:
        img.putalpha(255)
    img.paste((255,255,255,255), (0,0), spark_mask(n, glyph_scale))
    return img.resize((size,size), Image.LANCZOS)

OUT="/Users/downtick/Library/Mobile Documents/com~apple~CloudDocs/Claude Working/websites/memberperkclub/public/brand"
import os; os.makedirs(OUT, exist_ok=True)

# 1. Stripe ICON — full-bleed square so Stripe's own rounding/cropping is safe.
mark(512, 0, 0.56).save(f"{OUT}/stripe-icon-512.png")

# 2. Favicon-ish rounded mark, matching the site header .mark exactly (radius 10/30).
mark(512, 10/30, 0.60).save(f"{OUT}/mark-rounded-512.png")

# 3. Stripe LOGO — mark + wordmark, transparent ground.
def wordmark(h=256, ss=3):
    H=h*ss
    m=mark(H, 10/30, 0.60, ss=2)
    font=None
    for path,idx in [("/System/Library/Fonts/SFNS.ttf",0),
                     ("/System/Library/Fonts/HelveticaNeue.ttc",0),
                     ("/System/Library/Fonts/Supplemental/Arial Bold.ttf",0)]:
        try:
            font=ImageFont.truetype(path, int(H*0.60), index=idx)
            try: font.set_variation_by_name("Semibold")   # site .logo is font-weight 600
            except Exception: pass
            break
        except Exception: pass
    text="MemberPerkClub"
    tmp=ImageDraw.Draw(Image.new("RGBA",(1,1)))
    bb=tmp.textbbox((0,0), text, font=font)
    tw,th=bb[2]-bb[0], bb[3]-bb[1]
    gap=int(H*0.30)
    W=H+gap+tw+int(H*0.06)
    img=Image.new("RGBA",(W,H),(0,0,0,0))
    img.paste(m,(0,0),m)
    ImageDraw.Draw(img).text((H+gap-bb[0], (H-th)/2-bb[1]), text, font=font, fill=(0x1A,0x14,0x2E,255))
    return img.resize((W//ss, h), Image.LANCZOS)

wordmark(256).save(f"{OUT}/stripe-logo-wordmark.png")
for f in sorted(os.listdir(OUT)):
    im=Image.open(f"{OUT}/{f}")
    print(f, im.size, im.mode, os.path.getsize(f"{OUT}/{f}"), "bytes")
