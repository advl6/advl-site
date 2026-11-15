// advl.studio: serves public/ as static assets. Only /img/og/card.jpg runs through here: it returns one of the
// three business-card fronts at random, so a shared link shows a different card (Ariana, 11/15). Everything else goes straight to the files.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/img/og/card.jpg') {
      const n = 1 + Math.floor(Math.random() * 3);
      const res = await env.ASSETS.fetch(new Request(new URL('/img/og/card-' + n + '.jpg', url), request));
      const headers = new Headers(res.headers);
      headers.set('Cache-Control', 'no-store');
      return new Response(res.body, { status: res.status, headers });
    }
    return env.ASSETS.fetch(request);
  }
};
