#!/usr/bin/env python3
"""Build the public-site copy of ADVL Stair for Cloudflare Pages -> out/web/
- full HTML document (the artifact host normally adds doctype/head)
- full-quality films copied in as v/hq/*.mp4 instead of the artifact asset store (/_blob/...)
- config.js holds the Parking Lot's Supabase address + public key (blank = Parking Lot offline)
- _headers for long caching of media
"""
import json, os, shutil, re, sys
S = '/home/claude/site'; OUT = S + '/out/web'
shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(S + '/shared', OUT)
HQ = json.load(open(S + '/hq_videos.json'))
os.makedirs(OUT + '/v/hq', exist_ok=True)
data = open(OUT + '/data.json').read()
for k, v in HQ.items():
    shutil.copy(v['local'], f'{OUT}/v/hq/{k}.mp4')
    data = data.replace(v['src'], f'v/hq/{k}.mp4')
assert '/_blob/' not in data
open(OUT + '/data.json', 'w').write(data)

cfg = json.load(open(S + '/web_config.json')) if os.path.exists(S + '/web_config.json') else {}
open(OUT + '/config.js', 'w').write(
    '/* Parking Lot message store (Supabase). The key is the public "anon/publishable" key, safe to ship. */\n'
    f'window.ADVL_LOT_DB = {json.dumps({"url": cfg.get("url", ""), "key": cfg.get("key", "")})};\n')

site = cfg.get('site', '')
page = open(S + '/c2/index.html').read()
page = page.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
desc = 'Ariana Dorothea Levy: multimedia industrial and graphic designer, design systems researcher and Embodied AI specialist. Portfolio of projects, films and 3D work.'
head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{desc}">
<meta property="og:title" content="Ariana Dorothea Levy">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="{site}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#16182A">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<style>:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;font:14px/1.4 system-ui,-apple-system,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<script src="config.js"></script>
'''
page = page.replace('<title>ADVL Stair</title>', head + '<title>Ariana Dorothea Levy</title>', 1)
# everything up to the first </style> stays in <head>
i = page.index('</style>', page.index('<title>')) + len('</style>')
page = page[:i] + '\n</head>\n<body>\n' + page[i:] + '\n</body>\n</html>\n'
open(OUT + '/index.html', 'w').write(page)

open(OUT + '/favicon.svg', 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#16182A"/><path d="M8 25h5v-5h5v-5h5V9" fill="none" stroke="#CFF002" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')
open(OUT + '/_headers', 'w').write('''/v/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=2592000
/models/*
  Cache-Control: public, max-age=2592000
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
''')
n = sum(len(f) for _, _, f in os.walk(OUT)); big = [(os.path.getsize(os.path.join(r, f)), f) for r, _, fs in os.walk(OUT) for f in fs if os.path.getsize(os.path.join(r, f)) > 25 * 1024 * 1024]
print('files', n, 'too big', big)
from PIL import Image, ImageOps
ImageOps.fit(Image.open(OUT + '/img/hero/01_crop.webp').convert('RGB'), (1200, 630)).save(OUT + '/img/og.jpg', quality=86)
