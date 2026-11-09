const CACHE='ironwatch-v1.12';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const timeout=(ms)=>new Promise((_,rej)=>setTimeout(()=>rej('timeout'),ms));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const page=req.mode==='navigate'||req.url.endsWith('.html')||req.url.endsWith('/');
  if(page){
    // свежая страница из сети, если интернет есть; в море — из памяти телефона
    e.respondWith(Promise.race([fetch(req,{cache:'no-store'}),timeout(4000)]).then(res=>{
      if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put('index.html',c))}return res})
      .catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));return res})));
});
