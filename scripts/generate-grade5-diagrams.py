"""Generate grade5 textbook study cards from canonical content; no archival or map imagery."""
from pathlib import Path
import json,html,textwrap
r=Path(__file__).resolve().parent.parent
# Responsive SVG: dynamic height for every point; never overlaps long titles or footer.
a=json.loads((r/'src/data/grade45Content.ts').read_text().split('=',1)[1].strip().rstrip(';'))
def text(t,x,y,size=24,width=58,color='#334155',gap=None):
 lines=textwrap.wrap(t,width=width)
 return ''.join(f'<text x="{x}" y="{y+i*(gap or size+10)}" font-size="{size}" fill="{color}">{html.escape(line)}</text>' for i,line in enumerate(lines))
def frame(title,height):
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 {height}"><title>{html.escape(title)}</title><rect width="960" height="{height}" rx="24" fill="#f0fdf4"/><g font-family="Arial,sans-serif"><rect x="20" y="20" width="920" height="{height-40}" rx="24" fill="white"/><rect x="40" y="40" width="880" height="115" rx="18" fill="#047857"/>'+text(title,65,85,27,52,'white')
def foot(height):return text('Sơ đồ học tập · không phải ảnh tư liệu hoặc bản đồ địa lí',55,height-40,18,90)+'</g></svg>'
for l in a:
 if l['grade']!=5:continue
 dest=r/'public/learning/grade45';base=l['id']+'-textbook-'
 for i,p in enumerate(l['points'],1):
  svg=frame(p['title'],650)+text(str(i),75,235,48,4,'#047857')+text(p['fact'],75,325,28,50)+text('Quan sát → Tìm căn cứ → Chia sẻ',75,535,24,60)+foot(650)
  (dest/f'{base}point-{i}.svg').write_text(svg)
 height=240+len(l['points'])*165
 svg=frame(l['subtitle'],height)
 for i,p in enumerate(l['points']):
  y=200+i*165
  svg+=f'<rect x="48" y="{y-25}" width="864" height="151" rx="14" fill="#f0fdf4"/>'+text(f'{i+1}. '+p['title'],65,y+7,23,65,'#047857')+text(p['fact'],65,y+65,18,82)
 svg+=foot(height);(dest/f'{base}map.svg').write_text(svg)
 height=260+len(l['points'])*95
 svg=frame(l['subtitle'],height)+text('KHỐI 5 · HÀNH TRÌNH KHÁM PHÁ',65,195,20,70,'#047857')
 for i,p in enumerate(l['points']):svg+=text(f'{i+1}. '+p['title'],65,255+i*95,25,56)
 (dest/f'{base}cover.svg').write_text(svg+foot(height))
