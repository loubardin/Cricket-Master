/* ===================== AMIS & SYNCHRONISATION (Firebase Realtime Database, API REST) =====================
   - chaque personne a un @profil (pseudo) ; sur chaque téléphone il est relié à un joueur local (surnom libre)
   - une partie terminée est envoyée dans le cloud, étiquetée avec les @profils présents (index idx/<pseudo>/<partie>)
   - chaque téléphone voit : ses propres parties + celles où son propriétaire a joué ailleurs
   - le profil officiel (nom, couleur, musique, bilan complet) est publié par le téléphone de son propriétaire
   - amis (lf-412) : on envoie une demande à un @pseudo, il accepte → amis des deux côtés, et TOUTES les parties
     des deux téléphones (anciennes comprises) sont partagées. Retirer un ami est réciproque. Plus de groupes ni de QR. */
(function(){if(window.EMBED)return;   /* pas de synchro dans les fenêtres de démonstration */
const DB='https://loubard-cricket-master-default-rtdb.europe-west1.firebasedatabase.app';
const K_SY='darts.sync.v1',K_EXT='darts.sync.ext.v1';
const rid=n=>{const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<n;i++)s+=a[Math.floor(Math.random()*a.length)];return s};
let SY=store.get(K_SY,null)||{};SY.ph=SY.ph||rid(6);SY.me=SY.me||null;SY.fr=SY.fr||{};SY.gr=SY.gr||[];SY.inq=SY.inq||{};SY.out=SY.out||{};SY.up=SY.up||{};SY.del=SY.del||{};SY.pc=SY.pc||{};SY.last=SY.last||0;
let EXT=store.get(K_EXT,{})||{};
const sySave=()=>{store.set(K_SY,SY)};const extSave=()=>store.set(K_EXT,EXT);sySave();
const hOk=h=>/^[a-z0-9_]{2,15}$/.test(h);
const api=(path,method,body,q)=>fetch(DB+'/'+path+'.json'+(q||''),{method:method||'GET',cache:'no-store',headers:body!==undefined?{'Content-Type':'application/json'}:undefined,body:body!==undefined?JSON.stringify(body):undefined})
  .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()});

/* ---------- correspondances nom local <-> @profil ---------- */
const linkOf=n=>{n=String(n||'');if(SY.me&&SY.me.local===n)return SY.me.h;for(const h in SY.fr)if(SY.fr[h].local===n)return h;return null};
const localOf=h=>SY.me&&SY.me.h===h?SY.me.local:SY.fr[h]?SY.fr[h].local:(SY.pc[h]&&SY.pc[h].name)||h.toUpperCase();
const linkedNames=()=>{const s=new Set();if(SY.me)s.add(SY.me.local);Object.values(SY.fr).forEach(f=>s.add(f.local));return s};
window.syHandle=linkOf;window.syMeName=()=>SY.me?SY.me.local:null;
window.syMine=r=>!r.ext||!!(SY.me&&rPeople(r).includes(SY.me.local));   /* historique principal : parties de ce téléphone + celles où je joue ailleurs */

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
/* lf-410 : TOUTES les parties du téléphone sont partagées (même sans joueur relié) et indexées aussi sous le profil du propriétaire,
   pour que les amis synchronisés aient exactement les mêmes classements statistiques */
async function pushGames(){const own=SY.me?SY.me.h:null;const todo=HIST.filter(r=>!r.ext&&r.p&&r.w!=null).map(r=>{const hm=hmOf(r);return{r,hm,sig:'v2|'+(own||'')+'|'+JSON.stringify(hm)+'|'+r.w+'|'+(r.log?r.log.length:0)}}).filter(x=>(x.hm.length||own)&&SY.up[x.r.id]!==x.sig);
  for(const x of todo){const gid=SY.ph+'-'+x.r.id,{r}=x;
    await api('games/'+gid,'PUT',{j:JSON.stringify(r),hm:x.hm,src:SY.ph,by:SY.me?SY.me.h:null,t:Date.now(),d:r.date||Date.now()});
    const ix={},tu=Date.now();x.hm.forEach(([,h])=>ix[h+'/'+gid]=tu);if(own)ix[own+'/'+gid]=tu;   /* l'index garde l'heure d'envoi : une partie renvoyée (joueur relié depuis) est re-téléchargée */await api('idx','PATCH',ix);SY.up[r.id]=x.sig;sySave()}
  return todo.length}

/* ---------- réception : parties où j'ai joué sur d'autres téléphones ---------- */
/* plus de confidentialité : on récupère toutes les parties où jouent soi-même ou ses amis, d'où qu'elles viennent */
async function pullGames(){if(!SY.me)return 0;const hs=[SY.me.h,...Object.keys(SY.fr)],ix={};let n=0;
  for(let i=0;i<hs.length;i+=6)(await Promise.all(hs.slice(i,i+6).map(h=>api('idx/'+h,'GET',undefined,'?shallow=true').catch(()=>null)))).forEach(o=>Object.assign(ix,o||{}));
  const want=Object.keys(ix).filter(g=>!g.startsWith(SY.ph+'-')&&!SY.del[g]&&(!EXT[g]||(typeof ix[g]==='number'&&ix[g]>(EXT[g].u||0))));
  for(let i=0;i<want.length;i+=6){const part=await Promise.all(want.slice(i,i+6).map(g=>api('games/'+g).then(v=>[g,v]).catch(()=>[g,null])));
    part.forEach(([g,v])=>{if(v&&v.j){EXT[g]={j:v.j,hm:v.hm||[],src:v.src,u:typeof ix[g]==='number'?ix[g]:0};n++}})}
  if(n)extSave();return n}

/* ---------- profils officiels ---------- */
function mySum(){const n=SY.me.local,T=trAll()[n]||{},rows=[];
  STG.forEach(g=>{const a=stAgg(g,false).E.find(x=>x.name===n);if(!a||!a.g)return;const key={cricket:['MPR moyen',a.d?fr(a.h*3/a.d):'–'],x01:['Moyenne',a.xd?fr(a.xp*3/a.xd):'–'],killer:['Vies prises',a.k],clock:['Réussite',a.d?Math.round(a.h*100/a.d)+' %':'–'],shanghai:['Record',a.best||'–'],halveit:['Record',a.best||'–']}[g]||['',''];rows.push([g,a.g,a.wins,key[0],String(key[1])])});
  const ck=stAgg('cricket',false).E.find(x=>x.name===n)||{},xo=stAgg('x01',false).E.find(x=>x.name===n)||{};let str=0;STG.forEach(g=>{const a=stAgg(g,false).E.find(x=>x.name===n);if(a)str=Math.max(str,a.str||0)});
  const rec=[['Meilleur MPR (Cricket)',ck.top?fr(ck.top):'–'],['Meilleur tour (Cricket)',ck.turn?ck.turn+' marques':'–'],['Meilleur finish (501)',String(xo.co||'–')],['180 (501)',String(xo.n180||0)],['Plus longue série de victoires',String(str||'–')]];
  return{T,rows,rec}}
async function pushMe(){if(!SY.me)return;const n=SY.me.local;
  await api('profiles/'+SY.me.h,'PATCH',{name:String(SY.me.local||SY.me.h).toUpperCase().slice(0,8),color:pcol(n)||'',music:VSND[n]||'',upd:Date.now(),s:JSON.stringify(mySum())})}
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
/* oublier un ami (depuis sa fiche profil) : fin de l'amitié + ses stats et parties reçues effacées de ce téléphone (celles où je joue restent) */
window.syForget=n=>{const h=linkOf(n);if(!h||(SY.me&&SY.me.h===h))return false;unfriend(h,true);return true};
function dropFriend(h){delete SY.fr[h];delete SY.pc[h];delete SY.out[h];delete SY.inq[h];
  for(const gid in EXT){const hm=(EXT[gid]&&EXT[gid].hm)||[];if(hm.some(x=>x[1]===h)&&!(SY.me&&hm.some(x=>x[1]===SY.me.h)))delete EXT[gid]}extSave();sySave();extInject()}
window.syRename=(o,nw)=>{if(SY.me&&SY.me.local===o){SY.me.local=nw;window.syMeChanged()}for(const h in SY.fr)if(SY.fr[h].local===o)SY.fr[h].local=nw;sySave()};

/* ---------- amis : demande → acceptation ----------
   profiles/<lui>/req/<moi> = {t,n}   demande envoyée
   profiles/<moi>/acc/<lui> = t | 0   réponse (t = accepté, 0 = refusé)
   profiles/<lui>/rm/<moi>  = t       on n'est plus amis (des deux côtés) */
function rosterEnsure(name,color){name=String(name||'').toUpperCase().slice(0,8)||'AMI';let nm=name,k=2;
  const taken=x=>ROSTER.some(r=>r.name===x)&&linkOf(x);while(taken(nm)){nm=(name.slice(0,7)+k);k++}
  if(!ROSTER.some(r=>r.name===nm)){ROSTER.push({name:nm,color:color||PCOLS[ROSTER.length%PCOLS.length]});store.set(K_R,ROSTER)}return nm}
const pcSet=(h,p)=>{SY.pc[h]={name:p.name,color:p.color,music:p.music,upd:p.upd,s:p.s,pin:p.pin||''}};
const getP=h=>api('profiles/'+h).then(p=>{if(p)pcSet(h,p);return p}).catch(()=>null);
/* devenir amis : même nom qu'un joueur de ce téléphone → c'est lui (ses anciennes parties rejoignent son profil) ; sinon nouveau joueur + question « c'est qui ? » */
function linkFriend(h){if(SY.me&&SY.me.h===h)return;if(SY.fr[h])return;const p=SY.pc[h]||{};
  const cands=[p.name,h].map(x=>String(x||'').toUpperCase().slice(0,8)).filter(Boolean),hit=ROSTER.find(r=>r.name&&cands.includes(r.name)&&!linkOf(r.name)&&!isBot(r.name));
  const local=hit?hit.name:rosterEnsure(p.name||h,p.color);
  SY.fr[h]={local,ov:{},t:Date.now(),histTo:Date.now(),ask:hit?0:1};delete SY.out[h];delete SY.inq[h];
  if(S.forgot)S.forgot=S.forgot.filter(x=>x!==local);sySave();extInject()}
async function sendReq(h){await api('profiles/'+h+'/req','PATCH',{[SY.me.h]:{t:Date.now(),n:String(SY.me.local||'').slice(0,8)}});if(!SY.fr[h])SY.out[h]={t:Date.now()};sySave()}
async function acceptReq(h,quiet){const p=await getP(h);if(!p)return false;linkFriend(h);
  await api('profiles/'+h+'/acc','PATCH',{[SY.me.h]:Date.now()}).catch(()=>{});await api('profiles/'+SY.me.h+'/req/'+h,'DELETE').catch(()=>{});
  if(!quiet){toast(SY.fr[h].local+' EST TON AMI','👥',true);SFX.lead()}return true}
async function refuseReq(h){delete SY.inq[h];sySave();await api('profiles/'+h+'/acc','PATCH',{[SY.me.h]:0}).catch(()=>{});await api('profiles/'+SY.me.h+'/req/'+h,'DELETE').catch(()=>{})}
async function unfriend(h,send){const nm=SY.fr[h]&&SY.fr[h].local;dropFriend(h);if(send&&SY.me){api('profiles/'+h+'/rm','PATCH',{[SY.me.h]:Date.now()}).catch(()=>{});api('profiles/'+h+'/req/'+SY.me.h,'DELETE').catch(()=>{})}return nm}
async function reqSync(){if(!SY.me)return;const me=SY.me.h;
  /* amis d'avant (ajout à sens unique, groupes) : on leur envoie une demande ; ceux qui nous ont déjà l'acceptent tout seuls */
  if(!SY.v2){for(const h of Object.keys(SY.fr))await sendReq(h).catch(()=>{});SY.gr=[];delete SY.gd;delete SY.gn;SY.v2=1;sySave()}
  const [rq,ac,rm]=await Promise.all(['req','acc','rm'].map(k=>api('profiles/'+me+'/'+k).catch(()=>null)));
  for(const [h,v] of Object.entries(rm||{})){if(SY.fr[h]){const nm=unfriend(h,false);}await api('profiles/'+me+'/rm/'+h,'DELETE').catch(()=>{})}
  for(const [h,v] of Object.entries(ac||{})){if(v&&!SY.fr[h]&&SY.out[h]){const p=await getP(h);if(p){linkFriend(h);toast((SY.fr[h]||{}).local+' A ACCEPTÉ : VOS PARTIES SONT PARTAGÉES','👥',true)}}
    else if(!v&&(SY.out[h]||SY.fr[h])){delete SY.out[h];if(SY.fr[h])dropFriend(h);toast('@'+h.toUpperCase()+' A REFUSÉ','',true)}
    if(v)delete SY.out[h];await api('profiles/'+me+'/acc/'+h,'DELETE').catch(()=>{})}
  const R=rq||{};for(const h of Object.keys(SY.inq))if(!R[h])delete SY.inq[h];   /* demande annulée */
  for(const [h,v] of Object.entries(R)){if(h===me)continue;if(SY.fr[h]||SY.out[h]){await acceptReq(h,!!SY.fr[h]);continue}   /* déjà amis, ou on s'était demandé tous les deux */
    if(!SY.inq[h]){const p=await getP(h);SY.inq[h]={t:(v&&v.t)||Date.now(),n:(p&&p.name)||(v&&v.n)||h.toUpperCase(),color:(p&&p.color)||''};toast('@'+h.toUpperCase()+' VEUT ÊTRE TON AMI','👥',true)}}
  sySave()}

/* ---------- code de protection (facultatif) ----------
   Un profil protégé n'est rattaché à une partie jouée sur le téléphone d'un autre que si son code a été tapé
   sur ce téléphone pendant la soirée (10 h → 10 h). Sinon il joue en invité : la partie ne va pas sur son profil. */
const pinH=(h,c)=>{let x=2166136261;for(const ch of 'cm|'+h+'|'+c){x^=ch.charCodeAt(0);x=Math.imul(x,16777619)>>>0}return x.toString(16)};
const prot=h=>!!(SY.pc[h]&&SY.pc[h].pin)&&!(SY.me&&SY.me.h===h);
const unlocked=(h,t)=>{const f=SY.fr[h]||{};return!prot(h)||(f.histTo&&t<=f.histTo)||!!(f.unl&&f.unl[soirK(t)])};
function pinAsk(h,txt,no){return new Promise(ok=>{const o=el('div','');o.id='sypin';const nm=SY.fr[h]?SY.fr[h].local:h.toUpperCase();
  o.innerHTML=`<div class="sypb"><p class="sypt">🔒 <b>${esc(nm)}</b> · @${esc(h)}</p><p class="syhint">${txt}</p><input type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"><p class="syerr"></p>
    <div class="sybtns"><button class="sybt" data-no>${no||'Annuler'}</button><button class="sybt acc" data-ok>Valider</button></div></div>`;document.body.append(o);const i=o.querySelector('input');setTimeout(()=>i.focus(),50);
  const end=v=>{o.remove();ok(v)};
  const val=()=>{if(pinH(h,i.value)===SY.pc[h].pin){haptic();SFX.ui();end(true)}else{SFX.err();o.querySelector('.syerr').textContent='Code faux';i.value='';o.querySelector('.sypb').animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:240})}};
  o.addEventListener('click',e=>{if(e.target.closest('[data-ok]'))val();else if(e.target.closest('[data-no]'))end(false)});
  i.addEventListener('input',()=>{i.value=i.value.replace(/\D/g,'');if(i.value.length===4)val()})})}
/* avant de lancer une partie : code des joueurs protégés, une fois par soirée */
{const _l=launchNew;launchNew=async function(){const a=arguments,now=Date.now(),k=soirK(now),hs=[];
   S.names.slice(0,S.n).forEach(n=>{const h=linkOf((n||'').trim().toUpperCase());if(h&&!hs.includes(h)&&prot(h)&&!unlocked(h,now))hs.push(h)});
   for(const h of hs){const okp=await pinAsk(h,'Profil protégé : tape son code pour jouer avec ce joueur. Une fois par soirée sur ce téléphone.');const f=SY.fr[h];if(!f)continue;
     if(!okp){toast('CODE REQUIS POUR '+f.local,'🔒',true);return}   /* pas de code : pas de partie avec ce joueur */
     (f.unl=f.unl||{})[k]=1;sySave()}
   return _l.apply(this,a)}}
/* ---------- synchro complète ---------- */
let busy=false,again=false;
async function sync(manual){if(busy){again=true;return}if(!navigator.onLine&&!manual)return;busy=true;setSt('Synchronisation…');
  try{await reqSync();const up=await pushGames();const dn=await pullGames();await pullProfiles();if(dn)extInject();if(SY.me)await pushMe();SY.last=Date.now();SY.err='';sySave();
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
setTimeout(()=>{if(!SY.me&&!$('sync'))open()},1600);   /* pas encore de @profil : on ouvre la fenêtre pour le créer */

/* ---------- profil d'un ami : bilan officiel ---------- */
window.syTag=n=>{const h=linkOf(n);if(!h)return'';const me=SY.me&&SY.me.h===h;return`<p class="prtag">@${esc(h)}${me?' · c’est toi':' · bilan officiel, tous téléphones'}</p>`};
window.syOfficial=n=>{const h=linkOf(n);if(!h||(SY.me&&SY.me.h===h))return null;const p=SY.pc[h];if(!p||!p.s)return null;let s;try{s=JSON.parse(p.s)}catch(e){return null}
  return{T:s.T||{},rows:(s.rows||[]).map(([g,c,w,kl,kv])=>`<tr><td class="sn">${esc(GNAME[g]||g)}</td><td>${+c}</td><td>${+w}</td><td>${c?Math.round(w*100/c):0} %</td><td class="pk">${kl?`<b>${esc(kv)}</b><small>${esc(kl)}</small>`:''}</td></tr>`),rec:(s.rec||[]).map(([k,v])=>[esc(k),esc(v)])}};

/* ---------- écran « Amis » ---------- */
let V={q:'',err:'',busy:0};
const dot=(c)=>`<b style="--pc:${c||'#999'}"></b>`;
function draw(){const o=$('sync');if(!o)return;const me=SY.me,F=Object.entries(SY.fr).sort((a,b)=>a[1].local.localeCompare(b[1].local)),I=Object.entries(SY.inq),O=Object.keys(SY.out).filter(h=>!SY.fr[h]),A=F.filter(([,f])=>f.ask);
  let h=`<div class="ovh"><h2>Amis</h2><button class="circ" data-x aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><p class="syst">${esc(ST||(SY.last?'À jour · '+hmT(SY.last):'Jamais synchronisé'))}</p>`;
  if(!me){const R=ROSTER.filter(r=>r.name&&!linkOf(r.name)&&!isBot(r.name));
    h+=`<div class="sybox"><h3>Crée ton @pseudo</h3><p class="syhint">Ton pseudo unique : tes amis le tapent pour t’ajouter (lettres, chiffres, _).</p>
      <div class="syrow"><span class="syat">@</span><input id="syH" maxlength="15" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="pseudo" value="${esc(V.q)}"></div>
      <p class="syhint">Qui es-tu parmi les joueurs de ce téléphone ?</p><div class="sych">${R.map(r=>`<button data-meis="${esc(r.name)}" class="${V.mel===r.name?'on':''}" style="--pc:${r.color}"><b></b>${esc(r.name)}</button>`).join('')}</div>
      ${V.err?`<p class="syerr">${esc(V.err)}</p>`:''}<button class="sybt acc" data-mk>Créer mon pseudo</button></div>`;o.innerHTML=h;bindIn();return}
  h+=`<div class="sybox syme"><div class="symh">${dot(pcol(me.local))}<div><strong>@${esc(me.h)}</strong><small>${esc(me.local)} · donne ce pseudo à tes amis</small></div></div>
      <div class="sypin"><span>🔒 Code secret : <b>${SY.myPin?'activé':'désactivé'}</b></span><button class="sysm" data-pin>${V.pin?'Fermer':SY.myPin?'Changer':'Activer'}</button></div>
      ${V.pin?`<p class="syhint">4 chiffres. Jamais demandé sur ton téléphone. Sur celui d’un ami, on le tape une fois par soirée pour que la partie compte sur ton profil.</p><div class="syrow"><input id="syP" type="password" inputmode="numeric" maxlength="4" placeholder="••••"><button class="sysm" data-pinok>Enregistrer</button>${SY.myPin?'<button class="sysm" data-pinoff>Désactiver</button>':''}</div>`:''}</div>
    <div class="sybox"><h3>Ajouter un ami</h3><div class="syrow"><span class="syat">@</span><input id="syF" maxlength="15" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="son pseudo" value="${esc(V.q)}"><button class="sysm acc" data-send ${V.busy?'disabled':''}>Envoyer</button></div>
      ${V.err?`<p class="syerr">${esc(V.err)}</p>`:'<p class="syhint">Dès qu’il accepte, toutes vos parties sont partagées, même les anciennes.</p>'}</div>`;
  if(I.length)h+=`<h3 class="sysec">Demandes reçues <i>${I.length}</i></h3><div class="syl">${I.map(([k,x])=>`<div class="syf syrq">${dot(x.color)}<div><strong>${esc(x.n)}</strong><small>@${esc(k)} veut être ton ami</small></div><button class="sysm" data-no="${esc(k)}">Refuser</button><button class="sysm acc" data-yes="${esc(k)}">Accepter</button></div>`).join('')}</div>`;
  if(A.length)h+=`<h3 class="sysec">C’est qui ?</h3>${A.map(([k,f])=>`<div class="sybox"><p class="syhint"><b>@${esc(k)}</b> correspond à un joueur de ce téléphone ? Ses anciennes parties rejoindront son profil.</p><div class="sych">${ROSTER.filter(r=>r.name&&!isBot(r.name)&&(!linkOf(r.name)||r.name===f.local)).map(r=>`<button data-is="${esc(k)}" data-v="${esc(r.name)}" class="${r.name===f.local?'on':''}" style="--pc:${r.color}"><b></b>${esc(r.name)}</button>`).join('')}</div><button class="sysm" data-isok="${esc(k)}">${esc(f.local)}, c’est bon</button></div>`).join('')}`;
  h+=`<h3 class="sysec">Mes amis <i>${F.length}</i></h3><div class="syl">${F.map(([k,f])=>`<div class="syf">${dot(pcol(f.local))}<div><strong>${esc(f.local)}</strong><small>@${esc(k)}</small></div><button class="sysm" data-rl="${esc(k)}">${V.rl===k?'Fermer':'Changer'}</button><button class="sysm" data-rm="${esc(k)}">Retirer</button></div>${V.rl===k?`<div class="sybox"><p class="syhint">C’est quel joueur sur ce téléphone ?</p><div class="sych">${ROSTER.filter(r=>r.name&&!isBot(r.name)&&(!linkOf(r.name)||r.name===f.local)).map(r=>`<button data-rlk="${esc(r.name)}" class="${r.name===f.local?'on':''}" style="--pc:${r.color}"><b></b>${esc(r.name)}</button>`).join('')}</div></div>`:''}`).join('')||'<p class="syhint">Aucun ami pour l’instant.</p>'}</div>`;
  if(O.length)h+=`<h3 class="sysec">En attente <i>${O.length}</i></h3><div class="syl">${O.map(k=>`<div class="syf"><div><strong>@${esc(k)}</strong><small>demande envoyée</small></div><button class="sysm" data-cx="${esc(k)}">Annuler</button></div>`).join('')}</div>`;
  h+=`<button class="sybt" data-now>Synchroniser maintenant</button>`;
  o.innerHTML=h;bindIn()}
function bindIn(){['syH','syF'].forEach(id=>{const i=$(id);if(i)i.addEventListener('input',()=>{i.value=i.value.toLowerCase().replace(/[^a-z0-9_]/g,'');V.q=i.value})})}
function open(){let o=$('sync');if(o)o.remove();o=el('div','ov');o.id='sync';document.body.append(o);SY.open=1;V={q:'',err:'',busy:0};draw();requestAnimationFrame(()=>o.classList.add('on'));SFX.open();
  o.addEventListener('click',onClick);sync(true)}
window.syOpen=open;
window.syReqN=()=>Object.keys(SY.inq).length;
async function onClick(e){const t=e.target,o=$('sync'),q=s=>t.closest(s);
  if(q('[data-x]')){SY.open=0;o.classList.remove('on');setTimeout(()=>o.remove(),300);return}
  let b;
  if((b=q('[data-meis]'))){haptic();V.mel=b.dataset.meis;V.q=($('syH')||{}).value||V.q;draw();return}
  if(q('[data-mk]')){const h=(($('syH')||{}).value||'').toLowerCase();V.q=h;V.err='';if(!hOk(h)){V.err='Pseudo : 2 à 15 caractères, lettres, chiffres ou _';draw();return}if(!V.mel){V.err='Choisis qui tu es';draw();return}
    try{const ex=await api('profiles/'+h);if(ex){V.err='@'+h+' est déjà pris';draw();return}SY.me={h,local:V.mel};SY.v2=1;delete SY.fr[h];sySave();await pushMe();haptic();SFX.lead();toast('PSEUDO @'+h.toUpperCase()+' CRÉÉ','',true);V.q='';draw();sync(true)}
    catch(err){SY.me=null;V.err='Pas de connexion';draw()}return}
  if(q('[data-pin]')){haptic();V.pin=!V.pin;draw();const i=$('syP');if(i)i.focus();return}
  if(q('[data-pinok]')){const c=(($('syP')||{}).value||'').replace(/\D/g,'');if(c.length!==4){toast('4 CHIFFRES','',true);SFX.err();return}
    try{await api('profiles/'+SY.me.h,'PATCH',{pin:pinH(SY.me.h,c)});SY.myPin=1;sySave();V.pin=0;haptic();SFX.lead();toast('CODE SECRET ACTIVÉ','🔒',true);draw()}catch(e){toast('PAS DE CONNEXION','',true)}return}
  if(q('[data-pinoff]')){try{await api('profiles/'+SY.me.h+'/pin','DELETE');SY.myPin=0;sySave();V.pin=0;haptic();SFX.back();toast('CODE DÉSACTIVÉ','',true);draw()}catch(e){toast('PAS DE CONNEXION','',true)}return}
  if(q('[data-send]')){const h=(($('syF')||{}).value||'').toLowerCase().replace(/^@/,'');V.q=h;V.err='';
    if(!hOk(h)){V.err='Pseudo invalide';draw();return}if(h===SY.me.h){V.err='C’est toi !';draw();return}if(SY.fr[h]){V.err='Déjà ton ami';draw();return}if(SY.out[h]){V.err='Demande déjà envoyée';draw();return}
    V.busy=1;draw();try{const p=await getP(h);if(!p){V.busy=0;V.err='Aucun joueur @'+h;draw();return}
      if(SY.inq[h]){await acceptReq(h)}else{await sendReq(h);toast('DEMANDE ENVOYÉE À @'+h.toUpperCase(),'👥',true)}haptic();SFX.ui();V={q:'',err:'',busy:0};draw();sync(true)}
    catch(err){V.busy=0;V.err='Pas de connexion';draw()}return}
  if((b=q('[data-yes]'))){haptic();b.disabled=true;if(await acceptReq(b.dataset.yes))sync(true);else toast('PAS DE CONNEXION','',true);draw();return}
  if((b=q('[data-no]'))){if(!confirmTap(b))return;haptic();SFX.back();await refuseReq(b.dataset.no);draw();return}
  if((b=q('[data-cx]'))){const h=b.dataset.cx;haptic();SFX.back();delete SY.out[h];sySave();api('profiles/'+h+'/req/'+SY.me.h,'DELETE').catch(()=>{});draw();return}
  if((b=q('[data-is]'))){const h=b.dataset.is,f=SY.fr[h];if(!f)return;haptic();SFX.tick();relink(h,b.dataset.v);draw();return}
  if((b=q('[data-isok]'))){const f=SY.fr[b.dataset.isok];if(f){f.ask=0;sySave()}haptic();SFX.ui();draw();return}
  if((b=q('[data-rl]'))){haptic();V.rl=V.rl===b.dataset.rl?null:b.dataset.rl;draw();return}
  if((b=q('[data-rlk]'))){const h=V.rl;if(!h||!SY.fr[h])return;relink(h,b.dataset.rlk);haptic();SFX.lead();toast(b.dataset.rlk+' = @'+h.toUpperCase(),'',true);V.rl=null;draw();sync(true);return}
  if((b=q('[data-rm]'))){const h=b.dataset.rm;if(!confirmTap(b))return;await unfriend(h,true);haptic();SFX.back();draw();return}
  if(q('[data-now]')){haptic();sync(true);return}}
/* relier l'ami à un autre joueur de ce téléphone (le joueur créé automatiquement, resté vide, est retiré) */
function relink(h,name){const f=SY.fr[h],old=f.local;if(old===name)return;f.local=name;f.ov={};
  if(f.ask&&!HIST.some(r=>!r.ext&&rPeople(r).includes(old))){ROSTER=ROSTER.filter(r=>r.name!==old);store.set(K_R,ROSTER)}sySave();extInject()}
/* double appui pour confirmer (pas de fenêtre système) */
function confirmTap(b){if(b.dataset.sure){return true}b.dataset.sure=1;const t=b.textContent;b.textContent='Sûr ?';b.classList.add('sure');setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent=t;b.classList.remove('sure')}},2500);return false}

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
#sync .sysm.acc{background:var(--accent);color:var(--btx,#fff);box-shadow:none}#sync .sysm[disabled]{opacity:.5}
#sync .syrq{box-shadow:inset 0 0 0 2.5px var(--accent)}
#sync .sysm.sure{background:#c0392b;color:#fff;box-shadow:none}
#sync .syqr{align-self:center;background:#fff;padding:8px;border-radius:12px}#sync .syqr svg{display:block;width:min(60vw,240px);height:auto}
#sync .sypin{display:flex;align-items:center;justify-content:space-between;gap:8px;font:400 14px "Lbl",sans-serif;color:var(--ink)}
#sypin{position:fixed;inset:0;z-index:320;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px}
#sypin .sypb{width:min(340px,100%);display:flex;flex-direction:column;gap:10px;padding:18px;border-radius:24px;background:var(--m-home,#f7f2e5);box-shadow:0 0 0 5px var(--accent),0 12px 30px rgba(0,0,0,.3)}
#sypin .sypt{margin:0;font:400 20px "Fun",sans-serif;color:var(--ink)}#sypin .syhint{margin:0;font:400 13px/1.35 "Lbl",sans-serif;color:var(--mute)}#sypin .syerr{margin:0;min-height:1em;font:400 13px "Lbl",sans-serif;color:#c0392b}
#sypin input{padding:12px;border-radius:14px;border:2px solid var(--ol,#111);background:#fff;color:#111;font:400 28px "Lbl",sans-serif;text-align:center;letter-spacing:.5em}
#sypin .sybtns{display:flex;gap:8px}#sypin .sybt{flex:1}
#sync .sycap{margin:4px 0 0;font:700 11px "Lbl",sans-serif;text-transform:uppercase;letter-spacing:.05em;color:var(--mute);display:flex;gap:6px}#sync .sycap i{font-style:normal;font-weight:400;text-transform:none;letter-spacing:0}
#sync .sym{display:inline-flex;align-items:center;gap:6px;border-radius:99px;padding:6px 10px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.14);font:400 14px "Fun",sans-serif;color:var(--ink);text-transform:uppercase}#sync .sym b{width:10px;height:10px;border-radius:50%;background:var(--pc)}#sync .sym i{font:400 11px "Lbl",sans-serif;font-style:normal;color:var(--mute);text-transform:none}
#sync .sypd{display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px dashed rgba(0,0,0,.12)}#sync .sypd>div{flex:1;display:flex;flex-direction:column}#sync .sypd strong{font:400 16px "Fun",sans-serif;text-transform:uppercase;color:var(--ink)}#sync .sypd small{font:400 12px "Lbl",sans-serif;color:var(--mute)}
#sync .syg{cursor:pointer}
#prof .prtag{margin:-6px 0 0 28px;font:400 13px "Lbl",sans-serif;color:var(--mute)}
#syscan{position:fixed;inset:0;z-index:300;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px}
#syscan video{width:100%;max-width:420px;border-radius:20px}#syscan p{color:#fff;font:400 16px "Lbl",sans-serif}
`));
})();
