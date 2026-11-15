/* ===================== AMIS & SYNCHRONISATION (Firebase Realtime Database, API REST) =====================
   - chaque personne a un @profil (pseudo) ; sur chaque téléphone il est relié à un joueur local (surnom libre)
   - une partie terminée est envoyée dans le cloud, étiquetée avec les @profils présents (index idx/<pseudo>/<partie>)
   - chaque téléphone voit : ses propres parties + celles où son propriétaire a joué ailleurs
   - le profil officiel (nom, couleur, musique, bilan complet) est publié par le téléphone de son propriétaire
   - groupes : un code (QR) ; le rejoindre ajoute tous les membres en amis, et les membres ajoutent le nouveau venu */
(function(){
const DB='https://loubard-cricket-master-default-rtdb.europe-west1.firebasedatabase.app';
const K_SY='darts.sync.v1',K_EXT='darts.sync.ext.v1';
const rid=n=>{const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<n;i++)s+=a[Math.floor(Math.random()*a.length)];return s};
let SY=store.get(K_SY,null)||{};SY.ph=SY.ph||rid(6);SY.me=SY.me||null;SY.fr=SY.fr||{};SY.gr=SY.gr||[];SY.up=SY.up||{};SY.del=SY.del||{};SY.pc=SY.pc||{};SY.last=SY.last||0;
let EXT=store.get(K_EXT,{})||{};
const sySave=()=>{store.set(K_SY,SY)};const extSave=()=>store.set(K_EXT,EXT);sySave();
const hOk=h=>/^[a-z0-9_]{2,15}$/.test(h);
const api=(path,method,body,q)=>fetch(DB+'/'+path+'.json'+(q||''),{method:method||'GET',cache:'no-store',headers:body!==undefined?{'Content-Type':'application/json'}:undefined,body:body!==undefined?JSON.stringify(body):undefined})
  .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()});

/* ---------- correspondances nom local <-> @profil ---------- */
const linkOf=n=>{n=String(n||'');if(SY.me&&SY.me.local===n)return SY.me.h;for(const h in SY.fr)if(SY.fr[h].local===n)return h;return null};
const localOf=h=>SY.me&&SY.me.h===h?SY.me.local:SY.fr[h]?SY.fr[h].local:(SY.pc[h]&&SY.pc[h].name)||h.toUpperCase();
const linkedNames=()=>{const s=new Set();if(SY.me)s.add(SY.me.local);Object.values(SY.fr).forEach(f=>s.add(f.local));return s};
window.syHandle=linkOf;

/* ---------- parties venues d'autres téléphones : traduites avec les surnoms de ce téléphone ---------- */
function trRec(gid,raw){let r;try{r=JSON.parse(raw.j)}catch(e){return null}const hm={};(raw.hm||[]).forEach(([n,h])=>hm[n]=h);const L=linkedNames();
  const tr=n=>{if(!n||isBot(n))return n;const h=hm[n];if(h)return localOf(h);return L.has(n)?n+'*':n};
  r.p=(r.p||[]).map(x=>{const y=Object.assign({},x);if(y.members&&y.members.length){y.members=y.members.map(tr);y.name=y.members.join(' & ')}else y.name=tr(y.name);return y});
  if(r.fin)r.fin=tr(r.fin);if(r.log)r.log=r.log.map(e=>{const c=e.slice();if(c[1])c[1]=tr(c[1]);return c});
  r.id=gid;r.gid=gid;r.ext=1;return r}
function extInject(){HIST=HIST.filter(r=>!r.ext);Object.entries(EXT).forEach(([gid,raw])=>{if(SY.del[gid])return;const r=trRec(gid,raw);if(r)HIST.push(r)})}
extInject();

/* ---------- envoi des parties de ce téléphone ---------- */
function hmOf(r){const out=[];const seen=new Set();(r.p||[]).forEach(x=>(x.members&&x.members.length?x.members:[x.name]).forEach(n=>{const h=linkOf(n);if(h&&!seen.has(n)&&unlocked(h,r.date||0)){seen.add(n);out.push([n,h])}}));return out}
async function pushGames(){const todo=HIST.filter(r=>!r.ext&&r.p&&r.w!=null).map(r=>{const hm=hmOf(r);return{r,hm,sig:JSON.stringify(hm)+'|'+r.w+'|'+(r.log?r.log.length:0)}}).filter(x=>x.hm.length&&SY.up[x.r.id]!==x.sig);
  for(const x of todo){const gid=SY.ph+'-'+x.r.id,{r}=x;
    await api('games/'+gid,'PUT',{j:JSON.stringify(r),hm:x.hm,src:SY.ph,by:SY.me?SY.me.h:null,t:Date.now(),d:r.date||Date.now()});
    const ix={};x.hm.forEach(([,h])=>ix[h+'/'+gid]=true);await api('idx','PATCH',ix);SY.up[r.id]=x.sig;sySave()}
  return todo.length}

/* ---------- réception : parties où j'ai joué sur d'autres téléphones ---------- */
async function pullGames(){if(!SY.me)return 0;const ix=await api('idx/'+SY.me.h,'GET',undefined,'?shallow=true')||{};let n=0;
  const want=Object.keys(ix).filter(g=>!g.startsWith(SY.ph+'-')&&!EXT[g]&&!SY.del[g]);
  for(let i=0;i<want.length;i+=6){const part=await Promise.all(want.slice(i,i+6).map(g=>api('games/'+g).then(v=>[g,v]).catch(()=>[g,null])));
    part.forEach(([g,v])=>{if(v&&v.j){EXT[g]={j:v.j,hm:v.hm||[],src:v.src};n++}})}
  if(n)extSave();return n}

/* ---------- profils officiels ---------- */
function mySum(){const n=SY.me.local,T=trAll()[n]||{},rows=[];
  STG.forEach(g=>{const a=stAgg(g,false).E.find(x=>x.name===n);if(!a||!a.g)return;const key={cricket:['MPR moyen',a.d?fr(a.h*3/a.d):'–'],x01:['Moyenne',a.xd?fr(a.xp*3/a.xd):'–'],killer:['Vies prises',a.k],clock:['Réussite',a.d?Math.round(a.h*100/a.d)+' %':'–'],shanghai:['Record',a.best||'–'],halveit:['Record',a.best||'–']}[g]||['',''];rows.push([g,a.g,a.wins,key[0],String(key[1])])});
  const ck=stAgg('cricket',false).E.find(x=>x.name===n)||{},xo=stAgg('x01',false).E.find(x=>x.name===n)||{};let str=0;STG.forEach(g=>{const a=stAgg(g,false).E.find(x=>x.name===n);if(a)str=Math.max(str,a.str||0)});
  const rec=[['Meilleur MPR (Cricket)',ck.top?fr(ck.top):'–'],['Meilleur tour (Cricket)',ck.turn?ck.turn+' marques':'–'],['Meilleur finish (501)',String(xo.co||'–')],['180 (501)',String(xo.n180||0)],['Plus longue série de victoires',String(str||'–')]];
  return{T,rows,rec}}
async function pushMe(){if(!SY.me)return;const n=SY.me.local;
  await api('profiles/'+SY.me.h,'PATCH',{name:SY.me.h.toUpperCase().slice(0,8),color:pcol(n)||'',music:VSND[n]||'',upd:Date.now(),s:JSON.stringify(mySum())})}
let pmT=null;window.syMeChanged=()=>{clearTimeout(pmT);pmT=setTimeout(()=>pushMe().catch(()=>{}),1500)};
async function pullProfiles(){const hs=new Set(Object.keys(SY.fr));Object.values(EXT).forEach(r=>(r.hm||[]).forEach(([,h])=>hs.add(h)));if(SY.me)hs.delete(SY.me.h);
  const L=[...hs];for(let i=0;i<L.length;i+=6)await Promise.all(L.slice(i,i+6).map(h=>api('profiles/'+h).then(p=>{if(p)SY.pc[h]={name:p.name,color:p.color,music:p.music,upd:p.upd,s:p.s,pin:p.pin||''}}).catch(()=>{})));
  /* couleur et musique officielles, sauf si on les a changées sur ce téléphone */
  let ch=0;Object.entries(SY.fr).forEach(([h,f])=>{const p=SY.pc[h];if(!p)return;f.ov=f.ov||{};
    if(!f.ov.color&&p.color){let r=ROSTER.find(q=>q.name===f.local);if(!r){r={name:f.local,color:p.color};ROSTER.push(r);ch=1}if(r.color!==p.color){r.color=p.color;ch=1}}
    if(!f.ov.music){const m=p.music||'';if((VSND[f.local]||'')!==m){if(m)VSND[f.local]=m;else delete VSND[f.local];vsSave()}}});
  if(ch)store.set(K_R,ROSTER);sySave()}
/* changement de couleur / musique sur ce téléphone */
window.syTouch=(n,kind)=>{if(SY.me&&SY.me.local===n){window.syMeChanged();return}const h=linkOf(n);if(h){(SY.fr[h].ov=SY.fr[h].ov||{})[kind]=1;sySave()}};
window.syRename=(o,nw)=>{if(SY.me&&SY.me.local===o){SY.me.local=nw;window.syMeChanged()}for(const h in SY.fr)if(SY.fr[h].local===o)SY.fr[h].local=nw;sySave()};

/* ---------- amis ---------- */
function rosterEnsure(name,color){name=String(name||'').toUpperCase().slice(0,8)||'AMI';let nm=name,k=2;
  const taken=x=>ROSTER.some(r=>r.name===x)&&linkOf(x);while(taken(nm)){nm=(name.slice(0,7)+k);k++}
  if(!ROSTER.some(r=>r.name===nm)){ROSTER.push({name:nm,color:color||PCOLS[ROSTER.length%PCOLS.length]});store.set(K_R,ROSTER)}return nm}
function addFriend(h,local){if(SY.me&&SY.me.h===h)return;const p=SY.pc[h]||{};const nm=local||(ROSTER.some(r=>r.name===(p.name||'').toUpperCase())&&!linkOf((p.name||'').toUpperCase())?(p.name||'').toUpperCase():rosterEnsure(p.name||h,p.color));
  SY.fr[h]={local:nm,ov:{},t:Date.now()};sySave()}
async function groupsSync(){if(!SY.me)return;for(const c of SY.gr){const g=await api('groups/'+c).catch(()=>null);if(!g)continue;SY.gn=SY.gn||{};SY.gn[c]=g.name||c;
    if(!g.members||!g.members[SY.me.h])await api('groups/'+c+'/members','PATCH',{[SY.me.h]:true}).catch(()=>{});
    for(const h of Object.keys(g.members||{})){if(h===SY.me.h||SY.fr[h])continue;const p=await api('profiles/'+h).catch(()=>null);if(p)SY.pc[h]={name:p.name,color:p.color,music:p.music,upd:p.upd,s:p.s,pin:p.pin||''};addFriend(h)}}
  sySave()}

/* ---------- code de protection (facultatif) ----------
   Un profil protégé n'est rattaché à une partie jouée sur le téléphone d'un autre que si son code a été tapé
   sur ce téléphone pendant la soirée (10 h → 10 h). Sinon il joue en invité : la partie ne va pas sur son profil. */
const pinH=(h,c)=>{let x=2166136261;for(const ch of 'cm|'+h+'|'+c){x^=ch.charCodeAt(0);x=Math.imul(x,16777619)>>>0}return x.toString(16)};
const prot=h=>!!(SY.pc[h]&&SY.pc[h].pin)&&!(SY.me&&SY.me.h===h);
const unlocked=(h,t)=>{const f=SY.fr[h]||{};return!prot(h)||(f.histTo&&t<=f.histTo)||!!(f.unl&&f.unl[soirK(t)])};
function pinAsk(h,txt){return new Promise(ok=>{const o=el('div','');o.id='sypin';const nm=SY.fr[h]?SY.fr[h].local:h.toUpperCase();
  o.innerHTML=`<div class="sypb"><p class="sypt">🔒 <b>${esc(nm)}</b> · @${esc(h)}</p><p class="syhint">${txt}</p><input type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"><p class="syerr"></p>
    <div class="sybtns"><button class="sybt" data-no>Jouer en invité</button><button class="sybt acc" data-ok>Valider</button></div></div>`;document.body.append(o);const i=o.querySelector('input');setTimeout(()=>i.focus(),50);
  const end=v=>{o.remove();ok(v)};
  const val=()=>{if(pinH(h,i.value)===SY.pc[h].pin){haptic();SFX.ui();end(true)}else{SFX.err();o.querySelector('.syerr').textContent='Code faux';i.value='';o.querySelector('.sypb').animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:240})}};
  o.addEventListener('click',e=>{if(e.target.closest('[data-ok]'))val();else if(e.target.closest('[data-no]'))end(false)});
  i.addEventListener('input',()=>{i.value=i.value.replace(/\D/g,'');if(i.value.length===4)val()})})}
/* avant de lancer une partie : code des joueurs protégés, une fois par soirée */
{const _l=launchNew;launchNew=async function(){const a=arguments,now=Date.now(),k=soirK(now),hs=[];
   S.names.slice(0,S.n).forEach(n=>{const h=linkOf((n||'').trim().toUpperCase());if(h&&!hs.includes(h)&&prot(h)&&!unlocked(h,now)&&!((SY.fr[h]||{}).gst===k))hs.push(h)});
   for(const h of hs){const okp=await pinAsk(h,'Tape son code pour que la partie compte sur son profil. Une fois par soirée sur ce téléphone.');const f=SY.fr[h];if(!f)continue;
     if(okp){(f.unl=f.unl||{})[k]=1}else f.gst=k;sySave()}
   return _l.apply(this,a)}}
/* ---------- synchro complète ---------- */
let busy=false,again=false;
async function sync(manual){if(busy){again=true;return}if(!navigator.onLine&&!manual)return;busy=true;setSt('Synchronisation…');
  try{await groupsSync();const up=await pushGames();const dn=await pullGames();await pullProfiles();if(dn)extInject();if(SY.me)await pushMe();SY.last=Date.now();SY.err='';sySave();
    setSt(`À jour · ${hmT(SY.last)}`+(up?` · ${up} envoyée${up>1?'s':''}`:'')+(dn?` · ${dn} reçue${dn>1?'s':''}`:''));
    if(dn||up){try{if($('hist').classList.contains('on'))renderHist()}catch(e){}}if(dn&&manual)toast(dn+' PARTIE'+(dn>1?'S':'')+' REÇUE'+(dn>1?'S':''),'',true)}
  catch(e){SY.err=String(e.message||e);sySave();setSt('Pas de connexion · réessai plus tard')}
  busy=false;if(SY.open)draw();if(again){again=false;setTimeout(()=>sync(),500)}}
window.sySync=sync;
const hmT=t=>new Date(t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
let ST='';const setSt=s=>{ST=s;const e=document.querySelector('#sync .syst');if(e)e.textContent=s};
{const _p=histPut;histPut=function(rec){const r=_p.apply(this,arguments);clearTimeout(window._syT);window._syT=setTimeout(()=>sync(),2500);return r}}
{const _d=histDel;histDel=function(id){const x=HIST.find(r=>r.id===id);if(x&&x.ext){SY.del[id]=1;delete EXT[id];extSave();sySave()}return _d.apply(this,arguments)}}
addEventListener('online',()=>sync());document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-SY.last>60000)sync()});
setTimeout(()=>sync(),2000);

/* ---------- profil d'un ami : bilan officiel ---------- */
window.syTag=n=>{const h=linkOf(n);if(!h)return'';const me=SY.me&&SY.me.h===h;return`<p class="prtag">@${esc(h)}${me?' · c’est toi':' · bilan officiel, tous téléphones'}</p>`};
window.syOfficial=n=>{const h=linkOf(n);if(!h||(SY.me&&SY.me.h===h))return null;const p=SY.pc[h];if(!p||!p.s)return null;let s;try{s=JSON.parse(p.s)}catch(e){return null}
  return{T:s.T||{},rows:(s.rows||[]).map(([g,c,w,kl,kv])=>`<tr><td class="sn">${esc(GNAME[g]||g)}</td><td>${+c}</td><td>${+w}</td><td>${c?Math.round(w*100/c):0} %</td><td class="pk">${kl?`<b>${esc(kv)}</b><small>${esc(kl)}</small>`:''}</td></tr>`),rec:(s.rec||[]).map(([k,v])=>[esc(k),esc(v)])}};

/* ---------- QR : génération et lecture (bibliothèques chargées à la demande) ---------- */
const lib=(url,glob)=>window[glob]?Promise.resolve(window[glob]):new Promise((ok,ko)=>{const s=document.createElement('script');s.src=url;s.onload=()=>window[glob]?ok(window[glob]):ko(new Error('lib'));s.onerror=()=>ko(new Error('réseau'));document.head.append(s)});
const QRGEN='https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js',QRREAD='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
const appURL=()=>location.origin+location.pathname;
function qrSvg(box,text){box.innerHTML='<p class="syhint">QR code…</p>';lib(QRGEN,'qrcode').then(Q=>{const q=Q(0,'M');q.addData(text);q.make();box.innerHTML=q.createSvgTag(5,2)}).catch(()=>{box.innerHTML='<p class="syhint">QR indisponible hors connexion</p>'})}
function parseCode(t){t=String(t||'').trim();let m=t.match(/[?&]g=([A-Z0-9]{4,8})/i);if(m)return{g:m[1].toUpperCase()};m=t.match(/[?&]ami=([a-z0-9_]{2,15})/i);if(m)return{f:m[1].toLowerCase()};
  if(/^@?[a-z0-9_]{2,15}$/i.test(t)&&t.startsWith('@'))return{f:t.slice(1).toLowerCase()};if(/^[A-Z0-9]{6}$/.test(t))return{g:t};return null}
function scan(onCode){const ov=el('div','');ov.id='syscan';ov.innerHTML='<video playsinline muted autoplay></video><p>Vise le QR code</p><button class="sybt">Annuler</button>';document.body.append(ov);
  let stream=null,on=true;const stop=()=>{on=false;if(stream)stream.getTracks().forEach(t=>t.stop());ov.remove()};ov.querySelector('button').onclick=stop;
  Promise.all([lib(QRREAD,'jsQR'),navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})]).then(([J,s])=>{stream=s;const v=ov.querySelector('video');v.srcObject=s;v.play();
    const c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true});
    const tick=()=>{if(!on)return;if(v.videoWidth){c.width=v.videoWidth;c.height=v.videoHeight;x.drawImage(v,0,0);const r=J(x.getImageData(0,0,c.width,c.height).data,c.width,c.height);if(r&&r.data){const k=parseCode(r.data);if(k){haptic();stop();onCode(k);return}}}setTimeout(tick,250)};tick()})
  .catch(e=>{ov.querySelector('p').textContent='Caméra indisponible : tape plutôt le code.';})}

/* ---------- écran « Amis » ---------- */
let V={step:null,q:'',found:null,err:''};
function draw(){const o=$('sync');if(!o)return;const me=SY.me,F=Object.entries(SY.fr).sort((a,b)=>a[1].local.localeCompare(b[1].local));
  let h=`<div class="ovh"><h2>Amis</h2><button class="circ" data-x aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><p class="syst">${esc(ST||(SY.last?'À jour · '+hmT(SY.last):'Jamais synchronisé'))}</p>`;
  if(!me){const R=ROSTER.filter(r=>r.name&&!linkOf(r.name));
    h+=`<div class="sybox"><h3>Crée ton @profil</h3><p class="syhint">Ton pseudo unique, pour que tes amis te retrouvent (lettres, chiffres, _).</p>
      <div class="syrow"><span class="syat">@</span><input id="syH" maxlength="15" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="pseudo" value="${esc(V.q)}"></div>
      <p class="syhint">Qui es-tu parmi les joueurs de ce téléphone ?</p><div class="sych">${R.map(r=>`<button data-meis="${esc(r.name)}" class="${V.mel===r.name?'on':''}" style="--pc:${r.color}"><b></b>${esc(r.name)}</button>`).join('')}</div>
      ${V.err?`<p class="syerr">${esc(V.err)}</p>`:''}<button class="sybt acc" data-mk>Créer mon profil</button></div>`}
  else{h+=`<div class="sybox syme"><div class="symh"><b style="--pc:${pcol(me.local)||'var(--accent)'}"></b><div><strong>@${esc(me.h)}</strong><small>${esc(me.local)} sur ce téléphone</small></div><button class="sysm" data-myqr>${V.step==='myqr'?'Fermer':'Mon QR'}</button></div>
      ${V.step==='myqr'?`<div class="syqr" id="syQR"></div><p class="syhint">Tes amis scannent ce code dans Amis → Ajouter.</p>`:''}
      <div class="sypin"><span>🔒 Code de protection : <b>${SY.myPin?'activé':'désactivé'}</b></span><button class="sysm" data-pin>${V.step==='pin'?'Fermer':SY.myPin?'Changer':'Activer'}</button></div>
      ${V.step==='pin'?`<p class="syhint">4 chiffres. Jamais demandé sur ton téléphone ; sur celui d’un autre, on le tape une fois par soirée (10 h → 10 h) pour que les parties comptent sur ton profil.</p><div class="syrow"><input id="syP" type="password" inputmode="numeric" maxlength="4" placeholder="••••"><button class="sysm" data-pinok>Enregistrer</button>${SY.myPin?'<button class="sysm" data-pinoff>Désactiver</button>':''}</div>`:''}</div>
    <h3 class="sysec">Mes amis <i>${F.length}</i></h3>
    ${V.step==='add'?addHtml():`<div class="sybtns"><button class="sybt" data-add>+ Ajouter un ami</button><button class="sybt" data-scan>📷 Scanner</button></div>`}
    <div class="syl">${F.map(([k,f])=>`<div class="syf"><b style="--pc:${pcol(f.local)||'#999'}"></b><div><strong>${esc(f.local)}</strong><small>@${esc(k)}${SY.pc[k]&&SY.pc[k].name&&SY.pc[k].name!==f.local?' · '+esc(SY.pc[k].name):''}</small></div><button class="sysm" data-rl="${esc(k)}">${V.rl===k?'Fermer':'Relier'}</button><button class="sysm" data-rm="${esc(k)}">Retirer</button></div>${V.rl===k?`<div class="sybox"><p class="syhint">C’est quel joueur sur ce téléphone ?</p><div class="sych">${ROSTER.filter(r=>r.name&&(!linkOf(r.name)||r.name===f.local)).map(r=>`<button data-rlk="${esc(r.name)}" class="${r.name===f.local?'on':''}" style="--pc:${r.color}"><b></b>${esc(r.name)}</button>`).join('')}</div></div>`:''}`).join('')||'<p class="syhint">Aucun ami pour l’instant.</p>'}</div>
    <h3 class="sysec">Mes groupes <i>${SY.gr.length}</i></h3>
    ${V.step==='grp'?`<div class="sybox"><input id="syG" maxlength="24" placeholder="Nom du groupe (ex. Potes du jeudi)"><div class="sybtns"><button class="sybt acc" data-gmk>Créer</button><button class="sybt" data-cancel>Annuler</button></div></div>`
     :V.step==='join'?`<div class="sybox"><input id="syJ" maxlength="6" autocapitalize="characters" placeholder="Code du groupe (6 caractères)"><div class="sybtns"><button class="sybt acc" data-gjoin>Rejoindre</button><button class="sybt" data-cancel>Annuler</button></div>${V.err?`<p class="syerr">${esc(V.err)}</p>`:''}</div>`
     :`<div class="sybtns"><button class="sybt" data-grp>+ Créer un groupe</button><button class="sybt" data-join>Rejoindre</button></div>`}
    <div class="syl">${SY.gr.map(c=>`<div class="syf syg"><div><strong>${esc((SY.gn||{})[c]||c)}</strong><small>code ${esc(c)}</small></div><button class="sysm" data-gqr="${esc(c)}">${V.gq===c?'Fermer':'QR'}</button><button class="sysm" data-gleave="${esc(c)}">Quitter</button></div>${V.gq===c?`<div class="syqr" id="syGQ"></div><p class="syhint">Scanner ce code (ou taper ${esc(c)}) ajoute tout le groupe en amis.</p>`:''}`).join('')}</div>
    <button class="sybt" data-now>Synchroniser maintenant</button>
    <p class="syhint">Ce téléphone voit ses propres parties et celles où tu as joué sur d’autres téléphones. Le profil d’un ami affiche son bilan officiel complet.</p>`}
  o.innerHTML=h;
  if(V.step==='myqr'&&me)qrSvg($('syQR'),appURL()+'?ami='+me.h);
  if(V.gq)qrSvg($('syGQ'),appURL()+'?g='+V.gq);
  const i=$('syH');if(i)i.addEventListener('input',()=>{i.value=i.value.toLowerCase().replace(/[^a-z0-9_]/g,'');V.q=i.value});}
function addHtml(){const f=V.found;
  if(!f)return`<div class="sybox"><div class="syrow"><span class="syat">@</span><input id="syF" maxlength="15" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="pseudo de ton ami" value="${esc(V.q)}"></div>${V.err?`<p class="syerr">${esc(V.err)}</p>`:''}<div class="sybtns"><button class="sybt acc" data-find>Chercher</button><button class="sybt" data-cancel>Annuler</button></div></div>`;
  const R=ROSTER.filter(r=>r.name&&!linkOf(r.name));
  return`<div class="sybox"><h3>@${esc(f.h)} · ${esc(f.p.name||'')}</h3><p class="syhint">C’est quel joueur sur ce téléphone ? Ses anciennes parties ici rejoindront son profil.</p>
    <div class="sych">${R.map(r=>`<button data-lk="${esc(r.name)}" style="--pc:${r.color}"><b></b>${esc(r.name)}</button>`).join('')}<button data-lk="" class="synew">+ Nouveau joueur</button></div><button class="sybt" data-cancel>Annuler</button></div>`}
function open(pre){let o=$('sync');if(o)o.remove();o=el('div','ov');o.id='sync';document.body.append(o);SY.open=1;V={step:null,q:'',found:null,err:''};draw();requestAnimationFrame(()=>o.classList.add('on'));SFX.open();
  o.addEventListener('click',onClick);if(pre)handleCode(pre);sync(true)}
window.syOpen=open;
async function handleCode(k){if(!SY.me){toast('CRÉE D’ABORD TON PROFIL','',true);return}
  if(k.f){V.step='add';V.q=k.f;await find()}
  else if(k.g){await joinGroup(k.g)}}
async function find(){V.err='';const h=(V.q||'').toLowerCase();if(!hOk(h)){V.err='Pseudo invalide';draw();return}if(SY.me&&h===SY.me.h){V.err='C’est toi !';draw();return}if(SY.fr[h]){V.err='Déjà dans tes amis';draw();return}
  try{const p=await api('profiles/'+h);if(!p){V.err='Aucun profil @'+h;draw();return}SY.pc[h]={name:p.name,color:p.color,music:p.music,upd:p.upd,s:p.s,pin:p.pin||''};V.found={h,p};draw()}catch(e){V.err='Pas de connexion';draw()}}
async function joinGroup(c){c=String(c||'').toUpperCase();V.err='';try{const g=await api('groups/'+c);if(!g){V.err='Aucun groupe '+c;V.step='join';draw();return}
    if(!SY.gr.includes(c))SY.gr.push(c);sySave();await api('groups/'+c+'/members','PATCH',{[SY.me.h]:true});await groupsSync();V.step=null;toast('GROUPE REJOINT','',true);SFX.lead();draw();sync()}
  catch(e){V.err='Pas de connexion';V.step='join';draw()}}
async function onClick(e){const t=e.target,o=$('sync'),q=s=>t.closest(s);
  if(q('[data-x]')){SY.open=0;o.classList.remove('on');setTimeout(()=>o.remove(),300);return}
  let b;
  if((b=q('[data-meis]'))){haptic();V.mel=b.dataset.meis;V.q=($('syH')||{}).value||V.q;draw();return}
  if(q('[data-mk]')){const h=(($('syH')||{}).value||'').toLowerCase();V.q=h;V.err='';if(!hOk(h)){V.err='Pseudo : 2 à 15 caractères, lettres, chiffres ou _';draw();return}if(!V.mel){V.err='Choisis qui tu es';draw();return}
    try{const ex=await api('profiles/'+h);if(ex){V.err='@'+h+' est déjà pris';draw();return}SY.me={h,local:V.mel};delete SY.fr[h];sySave();await pushMe();haptic();SFX.lead();toast('PROFIL @'+h.toUpperCase()+' CRÉÉ','',true);draw();sync(true)}
    catch(err){SY.me=null;V.err='Pas de connexion';draw()}return}
  if(q('[data-pin]')){haptic();V.step=V.step==='pin'?null:'pin';draw();const i=$('syP');if(i)i.focus();return}
  if(q('[data-pinok]')){const c=(($('syP')||{}).value||'').replace(/\D/g,'');if(c.length!==4){toast('4 CHIFFRES','',true);SFX.err();return}
    try{await api('profiles/'+SY.me.h,'PATCH',{pin:pinH(SY.me.h,c)});SY.myPin=1;sySave();V.step=null;haptic();SFX.lead();toast('PROFIL PROTÉGÉ','🔒',true);draw()}catch(e){toast('PAS DE CONNEXION','',true)}return}
  if(q('[data-pinoff]')){try{await api('profiles/'+SY.me.h+'/pin','DELETE');SY.myPin=0;sySave();V.step=null;haptic();SFX.back();toast('CODE DÉSACTIVÉ','',true);draw()}catch(e){toast('PAS DE CONNEXION','',true)}return}
  if(q('[data-myqr]')){haptic();V.step=V.step==='myqr'?null:'myqr';draw();return}
  if(q('[data-add]')){haptic();V={step:'add',q:'',found:null,err:''};draw();const i=$('syF');if(i)i.focus();return}
  if(q('[data-scan]')){haptic();scan(k=>handleCode(k));return}
  if(q('[data-cancel]')){haptic();V={step:null,q:'',found:null,err:''};draw();return}
  if(q('[data-find]')){V.q=(($('syF')||{}).value||'').toLowerCase().replace(/^@/,'');await find();return}
  if((b=q('[data-lk]'))){const f=V.found;if(!f)return;addFriend(f.h,b.dataset.lk||null);if(prot(f.h)){const okp=await pinAsk(f.h,'Son profil est protégé : tape son code pour que ses anciennes parties sur ce téléphone rejoignent son profil.');if(okp){SY.fr[f.h].histTo=Date.now();SY.fr[f.h].unl={[soirK(Date.now())]:1};sySave()}}haptic();SFX.lead();toast((b.dataset.lk||SY.fr[f.h].local)+' = @'+f.h.toUpperCase(),'',true);V={step:null,q:'',found:null,err:''};draw();sync(true);return}
  if((b=q('[data-rl]'))){haptic();V.rl=V.rl===b.dataset.rl?null:b.dataset.rl;draw();return}
  if((b=q('[data-rlk]'))){const h=V.rl;if(!h||!SY.fr[h])return;SY.fr[h].local=b.dataset.rlk;SY.fr[h].ov={};sySave();haptic();SFX.lead();toast(b.dataset.rlk+' = @'+h.toUpperCase(),'',true);V.rl=null;extInject();draw();sync(true);return}
  if((b=q('[data-rm]'))){const h=b.dataset.rm;if(!confirmTap(b))return;delete SY.fr[h];sySave();haptic();SFX.back();draw();return}
  if(q('[data-grp]')){haptic();V.step='grp';draw();return}
  if(q('[data-join]')){haptic();V.step='join';V.err='';draw();return}
  if(q('[data-gmk]')){const nm=(($('syG')||{}).value||'').trim().slice(0,24)||'Mon groupe';let c=rid(6).toUpperCase();
    try{while(await api('groups/'+c))c=rid(6).toUpperCase();await api('groups/'+c,'PUT',{name:nm,t:Date.now(),members:{[SY.me.h]:true}});SY.gr.push(c);(SY.gn=SY.gn||{})[c]=nm;sySave();V.step=null;V.gq=c;haptic();SFX.lead();draw()}catch(err){toast('PAS DE CONNEXION','',true)}return}
  if(q('[data-gjoin]')){await joinGroup((($('syJ')||{}).value||'').trim());return}
  if((b=q('[data-gqr]'))){haptic();V.gq=V.gq===b.dataset.gqr?null:b.dataset.gqr;draw();return}
  if((b=q('[data-gleave]'))){const c=b.dataset.gleave;if(!confirmTap(b))return;SY.gr=SY.gr.filter(x=>x!==c);sySave();api('groups/'+c+'/members/'+SY.me.h,'DELETE').catch(()=>{});draw();return}
  if(q('[data-now]')){haptic();sync(true);return}}
/* double appui pour confirmer (pas de fenêtre système) */
function confirmTap(b){if(b.dataset.sure){return true}b.dataset.sure=1;const t=b.textContent;b.textContent='Sûr ?';b.classList.add('sure');setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent=t;b.classList.remove('sure')}},2500);return false}

/* lien ouvert depuis un QR (appareil photo) : ?ami=… ou ?g=… */
{const k=parseCode(location.search);if(k){history.replaceState(null,'',location.pathname);setTimeout(()=>open(k),900)}}

/* styles */
document.head.append(el('style','',`
#sync{gap:12px;overflow-y:auto;background:var(--page,#f7f2e5)!important}
#sync .syst{margin:-4px 2px 0;font:400 12px "Lbl",sans-serif;color:var(--mute)}
#sync .sybox{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:20px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 2px var(--ol,#111)}
#sync .sybox h3{margin:0;font:400 20px "Fun",sans-serif;color:var(--ink)}
#sync .syhint{margin:0;font:400 13px/1.35 "Lbl",sans-serif;color:var(--mute)}
#sync .syerr{margin:0;font:400 13px "Lbl",sans-serif;color:#c0392b}
#sync .syrow{display:flex;align-items:center;gap:6px}#sync .syat{font:400 22px "Fun",sans-serif;color:var(--ink)}
#sync input{flex:1;min-width:0;padding:10px 12px;border-radius:14px;border:2px solid var(--ol,#111);background:#fff;color:#111;font:400 18px "Lbl",sans-serif}
#sync .sych{display:flex;flex-wrap:wrap;gap:6px}
#sync .sych button{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:99px;padding:8px 12px;background:transparent;box-shadow:inset 0 0 0 2px rgba(0,0,0,.18);font:400 15px "Fun",sans-serif;color:var(--ink);text-transform:uppercase}
#sync .sych button b{width:12px;height:12px;border-radius:50%;background:var(--pc)}#sync .sych button.on{box-shadow:inset 0 0 0 3px var(--accent)}#sync .sych .synew{font-family:"Lbl",sans-serif;text-transform:none}
#sync .sybtns{display:flex;gap:8px}#sync .sybtns .sybt{flex:1}
.sybt{border:0;border-radius:99px;padding:12px 14px;background:transparent;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 16px "Fun",sans-serif;color:var(--ink)}.sybt.acc{background:var(--accent);color:var(--btx,#fff)}
#syscan .sybt{color:#fff;box-shadow:inset 0 0 0 2px #fff;padding:12px 30px}
#sync .sysec{margin:8px 2px 0;font:400 18px "Fun",sans-serif;color:var(--ink);display:flex;justify-content:space-between}#sync .sysec i{font:400 13px "Lbl",sans-serif;font-style:normal;color:var(--mute)}
#sync .syl{display:flex;flex-direction:column;gap:6px}
#sync .syf,#sync .symh{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 2px rgba(0,0,0,.12)}
#sync .symh{padding:0;background:none;box-shadow:none}
#sync .syf>b,#sync .symh>b{flex:none;width:14px;height:14px;border-radius:50%;background:var(--pc)}
#sync .syf>div,#sync .symh>div{flex:1;min-width:0;display:flex;flex-direction:column}
#sync .syf strong,#sync .symh strong{font:400 17px "Fun",sans-serif;color:var(--ink);text-transform:uppercase}#sync .symh strong{text-transform:none;font-size:22px}
#sync .syf small,#sync .symh small{font:400 12px "Lbl",sans-serif;color:var(--mute)}
#sync .sysm{flex:none;border:0;border-radius:99px;padding:7px 12px;background:transparent;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 13px "Lbl",sans-serif;color:var(--ink)}
#sync .sysm.sure{background:#c0392b;color:#fff;box-shadow:none}
#sync .syqr{align-self:center;background:#fff;padding:8px;border-radius:12px}#sync .syqr svg{display:block;width:min(60vw,240px);height:auto}
#sync .sypin{display:flex;align-items:center;justify-content:space-between;gap:8px;font:400 14px "Lbl",sans-serif;color:var(--ink)}
#sypin{position:fixed;inset:0;z-index:320;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px}
#sypin .sypb{width:min(340px,100%);display:flex;flex-direction:column;gap:10px;padding:18px;border-radius:24px;background:var(--m-home,#f7f2e5);box-shadow:0 0 0 5px var(--accent),0 12px 30px rgba(0,0,0,.3)}
#sypin .sypt{margin:0;font:400 20px "Fun",sans-serif;color:var(--ink)}#sypin .syhint{margin:0;font:400 13px/1.35 "Lbl",sans-serif;color:var(--mute)}#sypin .syerr{margin:0;min-height:1em;font:400 13px "Lbl",sans-serif;color:#c0392b}
#sypin input{padding:12px;border-radius:14px;border:2px solid var(--ol,#111);background:#fff;color:#111;font:400 28px "Lbl",sans-serif;text-align:center;letter-spacing:.5em}
#sypin .sybtns{display:flex;gap:8px}#sypin .sybt{flex:1}
#prof .prtag{margin:-6px 0 0 28px;font:400 13px "Lbl",sans-serif;color:var(--mute)}
#syscan{position:fixed;inset:0;z-index:300;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px}
#syscan video{width:100%;max-width:420px;border-radius:20px}#syscan p{color:#fff;font:400 16px "Lbl",sans-serif}
`));
})();
