/* Loubard Fléchard — hors ligne + mises à jour automatiques.
   Page : réseau d'abord (version la plus récente), cache si pas de réseau.
   Change VERSION à chaque mise à jour publiée. */
const VERSION='lf-337';
const FILES=['./','index.html','sync.js','scenes.js','manifest.json','art/lexend.woff','art/ui-300.woff','art/ui-600.woff','art/ui-750.woff','art/ui-900.woff','art/fun.woff','art/funl.woff','art/funtxt.woff','art/lbl.woff','icon-180.png','icon-192.png','icon-512.png','skins/casino/accueil.webp','skins/casino/annuler.webp','skins/casino/barre.webp','skins/casino/carte.webp','skins/casino/couronne.webp','skins/casino/curseur.webp','skins/casino/disque.webp','skins/casino/num.webp','skins/casino/num_mort.webp','skins/casino/p_d.webp','skins/casino/p_e.webp','skins/casino/p_s.webp','skins/casino/p_t.webp','skins/casino/p_z.webp','skins/casino/pa.webp','skins/casino/pa_d.webp','skins/casino/pa_t.webp','skins/casino/pa_z.webp','skins/casino/rail.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION)
  .then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:'reload'}).then(r=>r.ok&&c.put(f,r)).catch(()=>{}))))
  .then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  const page=q.mode==='navigate'||/\/(index\.html)?$/.test(new URL(q.url).pathname);
  e.respondWith(caches.open(VERSION).then(async c=>{
    if(page){
      /* réseau d'abord, sans cache HTTP ; au bout de 3 s sans réponse → version en cache */
      const net=fetch(q.url,{cache:'no-store'}).then(r=>{if(r&&r.ok)c.put('index.html',r.clone());return r}).catch(()=>null);
      const slow=new Promise(ok=>setTimeout(()=>ok(null),3000));
      const r=await Promise.race([net,slow]);
      return r||await c.match('index.html')||await net||Response.error();
    }
    const hit=await c.match(q,{ignoreSearch:true});
    const net=fetch(q).then(r=>{if(r&&r.ok)c.put(q,r.clone());return r}).catch(()=>null);
    return hit||await net||Response.error();
  }));
});
