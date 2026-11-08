"""Apply an image order saved in the "Project image order" artifact (layouts/p<NN>) to data.json.
Usage: python3 tools/apply_layout.py layout.json   (the saved document's data)
Each saved lane maps to the tab section with the same heading; new headings become new sections
(their text is empty, the heading is Ariana's own). "Top of page" fills the tab's hero.
Sections that exist in data.json but not in the saved order keep their text with no images."""
import json,sys
L=json.load(open(sys.argv[1]))
fn='public/data.json';d=json.load(open(fn))
p=[x for x in d['projects'] if x['num']==L['num']][0]
alt={}
def walk(o):
  if isinstance(o,dict): [walk(v) for v in o.values()]
  elif isinstance(o,list):
    if len(o)==2 and all(isinstance(x,str) for x in o) and o[0].endswith('.webp'): alt.setdefault(o[0],o[1])
    else: [walk(v) for v in o]
walk(p)
A=lambda k:[k,alt.get(k,k.split('/')[-1].split('.')[0].replace('_',' '))]
cut=lambda k:'/cut/' in k
def groups(imgs):
  out=[];i=0
  while i<len(imgs):
    c=cut(imgs[i]);run=[]
    while i<len(imgs) and cut(imgs[i])==c: run.append(imgs[i]);i+=1
    n=3 if c and len(run)==3 else 2
    for j in range(0,len(run),n):
      ch=run[j:j+n];g={"t":"gal","cols":len(ch) if len(ch)>1 else 1,"cap":None,"imgs":[A(k) for k in ch],"fit":True}
      if c: g["cut"]=True
      out.append(g)
  return out
seen=set()
for tl in L['tabs']:
  t=[x for x in p['tabs'] if x['f']==tl['f']][0]
  old={s['h'] or 'Title and intro':s for s in t['secs']}
  secs=[]
  for ln in tl['lanes']:
    imgs=[k for k in ln['imgs'] if not (k in seen or seen.add(k))]
    if ln.get('top'):
      if not imgs: t.pop('hero',None)
      elif t.get('hero',{}).get('t')=='viewer' or not all(map(cut,imgs)): t['hero']={"t":"viewer","imgs":[A(k) for k in imgs]}
      else: t['hero']={"t":"gal","cols":min(3,len(imgs)),"cut":True,"fit":True,"cap":None,"imgs":[A(k) for k in imgs]}
      continue
    s=old.pop(ln['h'],None) or {"h":ln['h'],"lvl":3,"text":[]}
    s['media']=groups(imgs);secs.append(s)
  for h,s in old.items():  # sections dropped in the tool keep their text
    s['media']=[];secs.append(s)
  t['secs']=secs
json.dump(d,open(fn,'w'),ensure_ascii=False,separators=(',',':'))
print('applied',L['num'],[ (t['f'],[(s['h'],len(s['media'])) for s in t['secs']]) for t in p['tabs']])
