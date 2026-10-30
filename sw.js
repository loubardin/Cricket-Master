/* Loubard Fléchard — mise en cache pour jouer hors ligne.
   Change le numéro de VERSION à chaque mise à jour publiée pour forcer le rafraîchissement. */
const VERSION='lf-4';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* on sert le cache tout de suite (marche sans réseau) et on le met à jour en arrière-plan quand il y a du réseau */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
    return hit||await net||c.match('index.html');
  }));
});
