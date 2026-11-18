/* Loubard Fléchard — hors ligne + mises à jour automatiques.
   Page : réseau d'abord (version la plus récente), cache si pas de réseau.
   Change VERSION à chaque mise à jour publiée. */
const VERSION='lf-360';
const FILES=['./','index.html','sync.js','scenes.js','manifest.json','art/lexend.woff','art/ui-300.woff','art/ui-600.woff','art/ui-750.woff','art/ui-900.woff','art/fun.woff','art/funl.woff','art/funtxt.woff','art/lbl.woff','icon-180.png','icon-192.png','icon-512.png','skins/royal/accueil.webp','skins/royal/annuler.webp','skins/royal/barre.webp','skins/royal/carte.webp','skins/royal/carte_j2.webp','skins/royal/couronne.webp','skins/royal/curseur.webp','skins/royal/curseur_d.webp','skins/royal/curseur_j2.webp','skins/royal/curseur_t.webp','skins/royal/disque.webp','skins/royal/disque_j2.webp','skins/royal/num.webp','skins/royal/num_j2.webp','skins/royal/num_mort.webp','skins/royal/p_d.webp','skins/royal/p_e.webp','skins/royal/p_s.webp','skins/royal/p_t.webp','skins/royal/p_z.webp','skins/royal/pa.webp','skins/royal/pa_d.webp','skins/royal/pa_t.webp','skins/royal/pa_z.webp','skins/royal/rail.webp','skins/royal/trait1.webp','skins/royal/trait2.webp'];
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
    const same=new URL(q.url).origin===location.origin;
    const hit=await c.match(q,{ignoreSearch:same});   /* ailleurs (Google Fonts…) l'adresse complète compte : une police par adresse */
    const net=fetch(q).then(r=>{if(r&&r.ok)c.put(q,r.clone());return r}).catch(()=>null);
    return hit||await net||Response.error();
  }));
});
