"""Generate labelled learning summaries from the reviewed Grade 5 content, never geographic maps."""
from pathlib import Path
import json, textwrap, html
root=Path(__file__).resolve().parent.parent
s=(root/'src/data/grade45Content.ts').read_text();lessons=json.loads(s[s.index('['):s.rindex(']')+1])[5:]
def text(value,x,y,size=24,color='#334155',width=57,gap=None):
    return ''.join(f'<text x="{x}" y="{y+i*(gap or size+9)}" font-size="{size}" fill="{color}">{html.escape(line)}</text>' for i,line in enumerate(textwrap.wrap(value,width=width)))
def frame(title):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720"><title>'+html.escape(title)+'</title><rect width="960" height="720" rx="30" fill="#f0fdf4"/><g font-family="Arial,sans-serif"><rect x="24" y="24" width="912" height="672" rx="26" fill="white"/><rect x="40" y="40" width="880" height="108" rx="20" fill="#047857"/>'+text(title,66,88,27,'white',53,34)
def finish():
    return text('Sơ đồ học tập · Không phải ảnh tư liệu hoặc bản đồ địa lí',55,674,17,'#475569',92)+'</g></svg>'
for l in lessons:
    dest=root/'public/learning/grade45'
    for i,p in enumerate(l['points'],1):
        svg=frame(p['title'])+f'<circle cx="480" cy="245" r="54" fill="#dcfce7"/>'+text(str(i),464,260,42,'#047857',4)+text(p['fact'],75,365,28,width=51,gap=39)+text('Quan sát tư liệu → Tìm căn cứ → Chia sẻ điều em hiểu',75,581,21,width=75)+finish()
        (dest/(l['id']+f'-point-{i}.svg')).write_text(svg)
    svg=frame(l['subtitle'])+text('Hành trình khối 5',66,182,19,'#047857',60)
    for i,p in enumerate(l['points']):
        y=208+i*103;svg+=f'<rect x="54" y="{y}" width="852" height="93" rx="15" fill="#f0fdf4"/><circle cx="85" cy="{y+30}" r="20" fill="#047857"/>'+text(str(i+1),79,y+37,21,'white',2)+text(p['title'],123,y+31,22,width=59,gap=27)+text(p['fact'],123,y+61,16,width=89,gap=21)
    svg+=finish();(dest/(l['id']+'-map.svg')).write_text(svg)
    svg=frame(l['subtitle'])+text('KHỐI 5 · HỌC LIỆU THEO CHỦ ĐỀ',66,190,20,'#047857',70)
    for i,p in enumerate(l['points']):
        y=239+i*85;svg+=f'<circle cx="86" cy="{y}" r="22" fill="#dcfce7"/>'+text(str(i+1),79,y+7,22,'#047857',2)+text(p['title'],130,y+8,25,width=53)
    svg+=text('Quan sát · Tìm hiểu · Vận dụng · Gìn giữ quê hương',66,610,21,width=76)+finish();(dest/(l['id']+'-cover.svg')).write_text(svg)
