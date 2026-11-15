"""Give every page its own address file: public/<path>.html is public/index.html with that page's
title, description, link-preview image and canonical address. Cloudflare serves /<path> from it.
Run after ANY change to public/index.html or to project titles/paths in data.json:
    python3 tools/build_pages.py
Also writes public/sitemap.xml and public/robots.txt. Link-preview images live in public/img/og/<path>.jpg
(screenshots of the pages; tools/og_shots.js remakes them)."""
import json,re,os,html
PUB='public/';SITE='https://advl.studio'
src=open(PUB+'index.html').read();D=json.load(open(PUB+'data.json'))
strip=lambda s:html.unescape(re.sub(r'<[^>]+>','',s or ''))
BASE='Ariana Dorothea Levy'
DESC=re.search(r'<meta name="description" content="([^"]*)"',src).group(1)
pages=[('home','',DESC),('projects','Projects',DESC),('works','Works Gallery',DESC),('background','Background',DESC),('about','About',DESC),('resume','Resume',DESC),('artifacts','Artifacts',DESC),('lot','Parking Lot',DESC)]
for p in D['projects']:
    if p.get('off') or not p.get('path'): continue
    t=strip(p.get('full') or p['t']); pages.append((p['path'],t,t+(' · '+strip(p['meta']) if p.get('meta') else '')+' · '+BASE))
def sub(s,pat,rep):
    s2,n=re.subn(pat,lambda m:rep,s,count=1); assert n==1,pat; return s2
urls=[SITE+'/']
for path,name,desc in pages:
    title=(name+' · ' if name else '')+BASE; e=lambda x:html.escape(x,quote=True)
    img=SITE+'/img/og/card.jpg'  # one of the three business cards, picked at random by worker.js (11/15)
    s=src
    s=sub(s,r'<title>[^<]*</title>','<title>'+e(title)+'</title>')
    s=sub(s,r'<meta name="description" content="[^"]*">','<meta name="description" content="'+e(desc)+'">')
    s=sub(s,r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="'+e(title)+'">')
    s=sub(s,r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+e(desc)+'">')
    s=sub(s,r'<meta property="og:image" content="[^"]*">','<meta property="og:image" content="'+img+'">')
    s=sub(s,r'<meta property="og:url" content="[^"]*">','<meta property="og:url" content="'+SITE+'/'+path+'">')
    s=sub(s,r'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+SITE+'/'+path+'">')
    open(PUB+path+'.html','w').write(s); urls.append(SITE+'/'+path)
open(PUB+'sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls)+'</urlset>\n')
open(PUB+'robots.txt','w').write('User-agent: *\nAllow: /\nSitemap: '+SITE+'/sitemap.xml\n')
print('built',len(pages),'pages')
