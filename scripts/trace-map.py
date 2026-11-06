"""Trace supplied raster map into real vector paths. Requires: pip install vtracer.
The result preserves raster geometry; it does not add verified map information.
Usage: python scripts/trace-map.py source.png assets/leonida-map-vector.svg
"""
import sys
from pathlib import Path
import vtracer
source, target = sys.argv[1:3]
vtracer.convert_image_to_svg_py(source, target, colormode='color', hierarchical='stacked',
    mode='spline', filter_speckle=2, color_precision=5, layer_difference=16,
    corner_threshold=60, length_threshold=3.0, max_iterations=10,
    splice_threshold=45, path_precision=2)
p=Path(target)
s=p.read_text()
from PIL import Image
w,h=Image.open(source).size
s=s.replace(f'width="{w}" height="{h}"', f'width="{w}" height="{h}" viewBox="0 0 {w} {h}"')
s=s.replace('<svg ', '<svg role="img" aria-label="خريطة توضيحية محوّلة إلى مسارات متجهة" ',1)
s=s.replace('>', '>',1)
# Keep source attribution embedded with vector asset.
i=s.find('>',s.find('<svg'))+1
s=s[:i]+'\n<title>GTA Arabia — vector trace of user-supplied map</title>\n<desc>Automatic vector trace of the supplied 2048×2048 raster. Coastlines and roads follow the source pixels. Small labels and symbols may be approximated. This is not an official geographic dataset.</desc>\n'+s[i:]
# Restore the supplied water gradient from nine sampled left-edge pixels.
# VTracer averages smooth gradients; this preserves the actual input colors.
import re
im=Image.open(source).convert('RGB')
ys=[round((h-1)*i/8) for i in range(9)]
stops=''.join(f'<stop offset="{y/(h-1):.4f}" stop-color="#{im.getpixel((0,y))[0]:02x}{im.getpixel((0,y))[1]:02x}{im.getpixel((0,y))[2]:02x}"/>' for y in ys)
defs='<defs><linearGradient id="water" x1="0" y1="0" x2="0" y2="1">'+stops+'</linearGradient></defs>'
s=s.replace('<path ',defs+'\n<path ',1)
s=re.sub(r'fill="#[A-Fa-f0-9]+"', 'fill="url(#water)"', s, count=1)
p.write_text(s)
print(str(p),p.stat().st_size,'bytes',s.count('<path'),'paths')
