/* ===================== ILLUSTRATIONS DES JEUX (écran Nouvelle partie) =====================
   - sous « Le but » : une petite illustration du tableau du jeu choisi, dans la DA de l'appli,
     animée en CSS pur (boucle légère, sans texte d'explication)
   - « Plus d'infos » : un écran à onglets ; chaque onglet = une animation + l'explication d'un principe,
     le dernier onglet = toutes les règles. */
(function(){
const SU=$('setup'),R=$('gRules');if(!SU||!R)return;
const ill=el('div','gill');ill.id='gIll';R.after(ill);
const PN=i=>{const n=((S.names||[])[i]||'').trim().toUpperCase();return(!n||/^J\d$/.test(n))?['LOU','TONE','ZOÉ'][i]:n};
const PC=i=>{const c=pcol(PN(i));return/^#[0-9a-f]{6}$/i.test(c||'')?c:PFB[i%PFB.length]};

/* ---------- animations CSS générées : fenêtres d'apparition et pulsations sur une boucle de T secondes ---------- */
const KS=el('style','');document.head.append(KS);const KD=new Set();
const pc=(t,T)=>Math.max(0,Math.min(100,t/T*100)).toFixed(2);
function kf(name,body){if(!KD.has(name)){KD.add(name);KS.textContent+=`@keyframes ${name}{${body}}`}return name}
/* visible de t0 à t1 (secondes) puis caché, en boucle */
const win=(t0,t1,T)=>{const a=pc(t0,T),b=pc(t1,T),n=kf(`gw${a.replace('.','_')}x${b.replace('.','_')}`,`0%{opacity:0;transform:scale(.6)}${a}%{opacity:0;transform:scale(.6)}${(+a+1.5).toFixed(2)}%{opacity:1;transform:scale(1.12)}${(+a+3).toFixed(2)}%{opacity:1;transform:scale(1)}${b}%{opacity:1;transform:scale(1)}${Math.min(100,+b+1.5).toFixed(2)}%{opacity:0;transform:scale(1)}100%{opacity:0}`);return`animation:${n} ${T}s linear infinite`};
/* petit rebond à t (secondes) */
const bump=(ts,T)=>{const n=kf('gb'+ts.map(t=>pc(t,T).replace('.','_')).join('x'),'0%,100%{transform:scale(1)}'+ts.map(t=>{const a=+pc(t,T);return`${a.toFixed(2)}%{transform:scale(1)}${(a+1.5).toFixed(2)}%{transform:scale(1.18)}${(a+4).toFixed(2)}%{transform:scale(1)}`}).join(''));return`animation:${n} ${T}s linear infinite`};
const MK=n=>`<svg viewBox="0 0 24 24"><path d="M5 19 19 5"/>${n>=2?'<path d="M5 5 19 19"/>':''}${n>=3?'<circle cx="12" cy="12" r="10.5"/>':''}</svg>`;
/* marques successives / X ⊗ qui apparaissent l'une après l'autre au même endroit */
const marks=(ts,T,end)=>ts.map((t,k)=>`<i class="ilm" style="${win(t,k<ts.length-1?ts[k+1]:end,T)}">${MK(k+1)}</i>`).join('');
const nums=(vals,T)=>vals.map(([v,t0,t1])=>`<span style="${win(t0,t1,T)}">${v}</span>`).join('');

function illHtml(){const g=S.game||'cricket',A=PN(0),B=PN(1),C=PN(2),a=PC(0),b=PC(1),c=PC(2);
  if(g==='cricket'){const T=8,cut=S.mode==='cut';
    const row=(n,ts,on)=>`<div class="ilr"><span class="ilmk">${ts.length?marks(ts,T,7.5):''}</span><b class="iln" style="${on?bump(ts,T):''}">${n}</b></div>`;
    return`<div class="il ilck"><div class="ilcards"><div class="ilc act" style="--pc:${a}"><small>${esc(A)}</small><b class="ils">${cut?'0':nums([['0',0,5.2],['20',5.2,7.5]],T)}</b></div>
      <div class="ilc" style="--pc:${b}"><small>${esc(B)}</small><b class="ils">${cut?nums([['0',0,5.2],['20',5.2,7.5]],T):'0'}</b></div></div>
      <div class="ilrows">${row(20,[.6,1.3,2],1)}${row(19,[2.8,3.4],1)}${row(18,[4],1)}</div><b class="ilfly" style="${win(4.6,5.3,T)}">+20</b></div>`}
  if(g==='x01'){const T=7,st=S.xstart||501;
    return`<div class="il ilx"><div class="ilc act big" style="--pc:${a}"><small>${esc(A)}</small><b class="ils">${nums([[st,0,2],[st-180,2,6.6]],T)}</b>
        <div class="ilch"><i class="g" style="${win(.5,6.6,T)}">T20</i><i class="g" style="${win(1,6.6,T)}">T20</i><i class="g" style="${win(1.5,6.6,T)}">T20</i></div></div>
      <div class="ilc big" style="--pc:${b}"><small>${esc(B)}</small><b class="ils">${st}</b></div>
      <div class="ilkeys">${[1,2,3,4,5].map(n=>`<span>${n}</span>`).join('')}<span class="on" style="${bump([.5,1,1.5],T)}">20</span></div></div>`}
  if(g==='killer'){const T=7,L=Math.min(S.klives||3,5);
    const card=(n,num,col,act,lose)=>`<div class="ilk${act?' act':''}" style="--pc:${col}"><div class="ilh">${Array.from({length:L},(_,j)=>{const t=lose.find(x=>x[0]===j);return`<i style="${t?win(0,t[1],T):''}">♥</i>`}).join('')}</div><small>${esc(n)}</small><b class="ils" style="${act?bump([1.6,3.4],T):''}">${num}</b></div>`;
    return`<div class="il ilkl">${card(A,20,a,1,[])}${card(B,19,b,0,[[L-1,2]])}${card(C,18,c,0,[[L-1,3.8],[L-2,5.4]])}</div>`}
  if(g==='clock'){const T=7;
    return`<div class="il ilclk"><div class="ilc act big" style="--pc:${a}"><small>${esc(A)}</small><b class="ils">${nums([[1,0,1.4],[2,1.4,2.8],[3,2.8,4.2],[4,4.2,5.6],[5,5.6,7]],T)}</b>
      <div class="ilslot">${[0,1,2].map(k=>`<i><em style="${win(.6+k*.45,1.4,T)}">${k===0?'1':'·'}</em></i>`).join('')}</div></div>
      <div class="ilring">${Array.from({length:20},(_,i)=>{const an=i/20*2*Math.PI-Math.PI/2;return`<span style="left:${50+42*Math.cos(an)}%;top:${50+42*Math.sin(an)}%">${i+1}${i<5?`<em style="${win(1.4*(i+1)-.01,7,T)}">${i+1}</em>`:''}</span>`}).join('')}</div></div>`}
  if(g==='shanghai'){const T=7;
    return`<div class="il ilsh"><div class="ilc act big" style="--pc:${a}"><small>${esc(A)} · tour <span class="iltour">${nums([[1,0,2],[2,2,4],[3,4,7]],T)}</span></small><b class="ils">${nums([[0,0,1],[1,1,2],[1,2,3],[5,3,4],[5,4,5.6],[23,5.6,7]],T)}</b>
      <div class="ilch"><i style="${win(4.4,6.8,T)}">3</i><i class="s" style="${win(4.9,6.8,T)}">D3</i><i class="g" style="${win(5.4,6.8,T)}">T3</i></div></div><b class="ilbig" style="${win(5.8,6.8,T)}">SHANGHAI !</b></div>`}
  /* halve-it */
  const T=8,q=(S.hiseq&&S.hiseq.length?S.hiseq:HI_CLASSIC).slice(0,5),lb=x=>x==='D'?'D':x==='T'?'T':x==='B'?'B':x;
  return`<div class="il ilhi"><div class="ilt">${q.map((x,k)=>`<span style="${bump([k*1.5+.2],T)}"><em style="${win(k*1.5+.2,k*1.5+1.7,T)}"></em>${lb(x)}</span>`).join('')}</div>
    <div class="ilc act big" style="--pc:${a}"><small>${esc(A)}</small><b class="ils">${nums([[0,0,.8],[45,.8,2.3],[93,2.3,3.8],[93,3.8,4.6],[46,4.6,6.2],[80,6.2,8]],T)}</b><i class="ilhalf" style="${win(4.1,5.4,T)}">÷ 2</i></div></div>`}

/* ---------- « Plus d'infos » : onglets avec une animation et l'explication de chaque principe ---------- */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pop=(e,k)=>e&&e.animate&&e.animate(k||[{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.3,1.6,.5,1)'});
const shake=e=>e&&e.animate&&e.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:340});
const q=(r,s)=>r.querySelector(s);
const TROPHY=[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}];
async function count(e,a,b,ms,dead){for(let i=1;i<=12;i++){if(dead())return;e.textContent=Math.round(a+(b-a)*i/12);await sleep(ms/12)}}
function fly(st,from,to,txt){const A=from.getBoundingClientRect(),B=to.getBoundingClientRect(),O=st.getBoundingClientRect(),t=el('b','ilfly2',txt);st.append(t);
  const x0=A.left+A.width/2-O.left,y0=A.top+A.height/2-O.top,x1=B.left+B.width/2-O.left,y1=B.top+B.height/2-O.top;
  const an=t.animate([{transform:`translate(${x0}px,${y0}px) translate(-50%,-50%) scale(.6)`,opacity:0},{transform:`translate(${x0}px,${y0-16}px) translate(-50%,-50%) scale(1.1)`,opacity:1,offset:.25},{transform:`translate(${x1}px,${y1}px) translate(-50%,-50%) scale(.8)`,opacity:.9}],{duration:850,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});an.onfinish=()=>t.remove()}
const card=(n,v,col,act,cls)=>`<div class="ilc${act?' act':''} ${cls||''}" style="--pc:${col}"><small>${esc(n)}</small><b class="ils">${v}</b></div>`;
const win2=(s,c)=>{c.classList.add('won');c.insertAdjacentHTML('beforeend','<i class="iltr">🏆</i>');pop(q(c,'.iltr'),TROPHY)};
function pages(){const g=S.game||'cricket',A=PN(0),B=PN(1),C=PN(2),a=PC(0),b=PC(1),c=PC(2);
  if(g==='cricket'){const cut=S.mode==='cut',N=[20,19,18];
    const html=(ma,mb,sa,sb)=>`<div class="il ilck"><div class="ilcards">${card(A,sa||0,a,1,'pa')}${card(B,sb||0,b,0,'pb')}</div><div class="ilrows">${N.map((n,i)=>`<div class="ilr"><span class="ilmk" data-r="${n}">${ma[i]?MK(ma[i]):''}</span><b class="iln" data-n="${n}">${n}</b><span class="ilmk ilmb">${mb[i]?MK(mb[i]):''}</span></div>`).join('')}</div></div>`;
    return[{t:'Fermer',cap:'Touche un numéro 3 fois pour le fermer',txt:'Simple = 1 marque, double = 2, triple = 3. Les marques s’affichent / puis X puis ⊗ : le numéro est fermé pour toi.',html:()=>html([0,0,0],[1,0,0]),
        run:async(s,d)=>{for(let k=1;k<=3;k++){await sleep(650);if(d())return;pop(q(s,'[data-n="20"]'));q(s,'.ilmk[data-r="20"]').innerHTML=MK(k)}await sleep(1000)}},
      {t:cut?'Arroser':'Marquer',cap:cut?'Fermé chez toi : chaque touche donne des points aux autres':'Fermé chez toi : chaque touche te rapporte des points',txt:cut?'Tant qu’un adversaire n’a pas fermé ce numéro, chaque touche en plus lui donne sa valeur (× 1, 2 ou 3). Arrose les meilleurs !':'Tant qu’un adversaire n’a pas fermé ce numéro, chaque touche en plus te rapporte sa valeur (× 1, 2 ou 3).',html:()=>html([3,0,0],[1,0,0]),
        run:async(s,d)=>{let v=0;for(let k=0;k<2;k++){await sleep(700);if(d())return;const n=q(s,'[data-n="20"]'),to=q(s,cut?'.pb .ils':'.pa .ils');pop(n);fly(s,n,to,'+20');await sleep(800);if(d())return;v+=20;to.textContent=v;pop(to)}await sleep(800)}},
      {t:'Gagner',cap:cut?'Tout fermé avec le moins de points':'Tout fermé avec le plus de points',txt:(cut?'Le premier qui a tout fermé (15 à 20 et la Bulle) en ayant le moins de points gagne.':'Le premier qui a tout fermé (15 à 20 et la Bulle) en ayant au moins autant de points que les autres gagne.')+' Un numéro fermé par tout le monde ne rapporte plus rien.',html:()=>html([3,0,0],[1,2,0],cut?0:40,cut?40:0),
        run:async(s,d)=>{for(const r of [19,18])for(let k=1;k<=3;k++){await sleep(220);if(d())return;q(s,`.ilmk[data-r="${r}"]`).innerHTML=MK(k);if(k===3)pop(q(s,`[data-n="${r}"]`))}await sleep(300);if(d())return;win2(s,q(s,'.pa'));await sleep(1400)}}]}
  if(g==='x01'){const st=S.xstart||501,dbl=S.xout!==0,din=S.xin===1;
    const html=v=>`<div class="il ilx"><div class="ilc act big pa" style="--pc:${a}"><small>${esc(A)}</small><b class="ils">${v}</b><div class="ilch"></div></div></div>`;
    return[{t:'Descendre',cap:'Chaque volée est retirée de ton score',txt:`Chacun part de ${st}. À ton tour, tu lances 3 fléchettes et leur total est retiré.`+(din?' Pour commencer à compter, il faut d’abord toucher un double.':''),html:()=>html(st),
        run:async(s,d)=>{const box=q(s,'.ilch');for(let k=0;k<3;k++){await sleep(450);if(d())return;box.insertAdjacentHTML('beforeend','<i class="g">T20</i>');pop(box.lastElementChild)}await sleep(300);if(d())return;await count(q(s,'.ils'),st,st-180,600,d);await sleep(1100)}},
      {t:'Finir',cap:dbl?'Tomber pile sur 0 avec un double':'Tomber pile sur 0',txt:dbl?'La dernière fléchette doit être un double (l’anneau extérieur, ou la double Bulle) qui amène pile à 0. L’appli te propose un finish quand c’est possible.':'Il faut arriver exactement à 0, avec n’importe quelle fléchette.',html:()=>html(40),
        run:async(s,d)=>{await sleep(600);if(d())return;const box=q(s,'.ilch');box.innerHTML=dbl?'<i class="s">D20</i>':'<i>20</i><i>20</i>';pop(box.firstElementChild);await sleep(300);if(d())return;await count(q(s,'.ils'),40,0,400,d);win2(s,q(s,'.pa'));await sleep(1400)}},
      {t:'Bust',cap:'Trop haut ? Bust : ton tour ne compte pas',txt:'Si tu dépasses 0'+(dbl?', s’il te reste 1, ou si tu arrives à 0 sans double':'')+', c’est un bust : ton score revient à ce qu’il était au début du tour.',html:()=>html(32),
        run:async(s,d)=>{const box=q(s,'.ilch'),v=q(s,'.ils');await sleep(500);if(d())return;box.innerHTML='<i>20</i>';await count(v,32,12,300,d);await sleep(350);if(d())return;box.insertAdjacentHTML('beforeend','<i>19</i>');await sleep(300);if(d())return;box.insertAdjacentHTML('beforeend','<i class="bu">BUST</i>');shake(q(s,'.pa'));v.classList.add('bu');await sleep(800);if(d())return;v.classList.remove('bu');v.textContent=32;box.innerHTML='';pop(v);await sleep(1000)}}]}
  if(g==='killer'){const L=Math.min(S.klives||3,5),P=[[A,20,a],[B,19,b],[C,18,c]];
    const html=(m,dead)=>`<div class="il ilkl">${P.map(([n,num,col],k)=>`<div class="ilk${k===0&&m>=3?' act':''}${dead&&k?' dead':''}" data-k="${k}" style="--pc:${col}"><div class="ilh">${Array.from({length:L},()=>`<i>♥</i>`).join('')}</div><small>${esc(n)}</small><b class="ils">${num}</b><div class="ilpip">${[0,1,2].map(j=>`<i class="${k===0&&j<m?'on':''}"></i>`).join('')}</div></div>`).join('')}</div>`;
    return[{t:'Devenir Killer',cap:'Touche ton numéro 3 fois',txt:'Chacun reçoit un numéro. Touche le tien 3 fois (un double compte 2, un triple 3) : tu deviens Killer.',html:()=>html(0),
        run:async(s,d)=>{const k0=q(s,'[data-k="0"]');for(let j=0;j<3;j++){await sleep(550);if(d())return;k0.querySelectorAll('.ilpip i')[j].classList.add('on');pop(q(k0,'.ils'))}await sleep(250);if(d())return;k0.classList.add('act');k0.insertAdjacentHTML('beforeend','<em class="ilkk">KILLER</em>');pop(q(k0,'.ilkk'),TROPHY);await sleep(1100)}},
      {t:'Attaquer',cap:'Vise les autres : chaque touche enlève un cœur',txt:'Une fois Killer, chaque touche sur le numéro d’un autre lui enlève une vie (2 avec un double, 3 avec un triple).'+(S.kbonus?' Tuer quelqu’un te rend un cœur.':'')+' Attention : toucher ton propre numéro te coûte une vie.',html:()=>html(3),
        run:async(s,d)=>{for(const k of [1,2,1]){await sleep(650);if(d())return;const ck=q(s,`[data-k="${k}"]`),h=[...ck.querySelectorAll('.ilh i:not(.off)')].pop();pop(q(ck,'.ils'));if(h){h.animate([{transform:'scale(1)'},{transform:'scale(1.6) translateY(-6px)',opacity:0}],{duration:420});setTimeout(()=>h.classList.add('off'),400)}}await sleep(900)}},
      {t:'Gagner',cap:'Le dernier en vie gagne',txt:'Sans cœur, tu es éliminé. Le dernier joueur en vie remporte la manche.'+(S.kcarry?' Le vainqueur commence la manche suivante avec un cœur en plus.':''),html:()=>html(3),
        run:async(s,d)=>{for(const k of [1,2]){await sleep(550);if(d())return;const ck=q(s,`[data-k="${k}"]`);ck.querySelectorAll('.ilh i').forEach(i=>i.classList.add('off'));ck.classList.add('dead');ck.insertAdjacentHTML('beforeend','<em class="ilsk">💀</em>')}await sleep(400);if(d())return;win2(s,q(s,'[data-k="0"]'));await sleep(1400)}}]}
  if(g==='clock'){const end=S.clkb!==0?21:20,lab=i=>i===21?'B':i;
    const html=p=>`<div class="il ilclk wide"><div class="ilring big">${Array.from({length:end},(_,i)=>{const an=i/end*2*Math.PI-Math.PI/2;return`<span class="${i+1<=p?'done':''}${i+1===p+1?' cur':''}" data-i="${i+1}" style="left:${50+42*Math.cos(an)}%;top:${50+42*Math.sin(an)}%">${lab(i+1)}</span>`}).join('')}<b class="ilcn" style="--pc:${a}">${esc(A)}</b></div></div>`;
    const go=(s,p)=>{s.querySelectorAll('.ilring span').forEach(e=>{const i=+e.dataset.i;e.classList.toggle('done',i<=p);e.classList.toggle('cur',i===p+1)});pop(q(s,`[data-i="${Math.min(p,end)}"]`))};
    return[{t:'Dans l’ordre',cap:'Touche 1, puis 2, puis 3…',txt:'Tu dois toucher les numéros dans l’ordre, du 1 au 20'+(end===21?', puis la Bulle':'')+'. Tant que tu n’as pas touché ton numéro, tu restes dessus.',html:()=>html(0),run:async(s,d)=>{for(let p=1;p<=4;p++){await sleep(520);if(d())return;go(s,p)}await sleep(800)}},
      {t:S.clkm?'Sauter':'Avancer',cap:S.clkm?'Double : saute 2 cases, triple : 3':'Une touche = une case',txt:S.clkm?'Un double te fait avancer de 2 numéros, un triple de 3.':'Simple, double ou triple : chaque touche te fait avancer d’un numéro.'+(S.clkr?` Si tu fais un MPR d’au moins ${S.clkr} sur ton tour, tu rejoues.`:''),html:()=>html(4),run:async(s,d)=>{for(const p of (S.clkm?[6,9]:[5,6])){await sleep(750);if(d())return;go(s,p)}await sleep(900)}},
      {t:'Gagner',cap:'Le premier arrivé gagne',txt:'Le premier qui termine le tour '+(end===21?'(Bulle comprise)':'(jusqu’au 20)')+' gagne la partie.',html:()=>html(14),run:async(s,d)=>{for(let p=15;p<=end;p++){await sleep(160);if(d())return;go(s,p)}await sleep(200);if(d())return;q(s,'.ilcn').insertAdjacentHTML('beforeend',' 🏆');pop(q(s,'.ilcn'));await sleep(1400)}}]}
  if(g==='shanghai'){const html=t=>`<div class="il ilsh"><div class="ilc act big pa" style="--pc:${a}"><small>${esc(A)} · tour <span class="iltn">${t}</span></small><b class="ils">${t}</b><div class="ilch"></div></div></div>`;
    return[{t:'Un numéro par tour',cap:'Tour 1 : le 1, tour 2 : le 2…',txt:`À chaque tour, seul le numéro du tour compte : simple = sa valeur, double × 2, triple × 3. La partie dure ${S.shr||7} tours.`,html:()=>html(1),run:async(s,d)=>{for(const t of [2,3]){await sleep(900);if(d())return;q(s,'.iltn').textContent=t;q(s,'.ils').textContent=t;pop(q(s,'.ils'))}await sleep(900)}},
      {t:'Shanghai',cap:'Simple + double + triple : Shanghai !',txt:'Toucher le simple, le double et le triple du numéro dans le même tour fait un Shanghai : '+(S.shw!==0?'tu gagnes la partie tout de suite.':`bonus de ${S.shb||100} points.`),html:()=>html(3),run:async(s,d)=>{const box=q(s,'.ilch');for(const [t,cl] of [['3',''],['D3','s'],['T3','g']]){await sleep(500);if(d())return;box.insertAdjacentHTML('beforeend',`<i class="${cl}">${t}</i>`);pop(box.lastElementChild)}await sleep(300);if(d())return;box.insertAdjacentHTML('beforeend','<i class="sh">SHANGHAI !</i>');pop(box.lastElementChild,TROPHY);await sleep(1300)}},
      {t:'Gagner',cap:'Le plus de points gagne',txt:'Sans Shanghai, celui qui a le plus de points à la fin du dernier tour gagne.',html:()=>`<div class="il ilck"><div class="ilcards">${card(A,0,a,1,'pa')}${card(B,0,b,0,'pb')}</div></div>`,run:async(s,d)=>{await Promise.all([count(q(s,'.pa .ils'),0,96,900,d),count(q(s,'.pb .ils'),0,71,900,d)]);if(d())return;win2(s,q(s,'.pa'));await sleep(1400)}}]}
  const seq=(S.hiseq&&S.hiseq.length?S.hiseq:HI_CLASSIC),lb=x=>x==='D'?'Doubles':x==='T'?'Triples':x==='B'?'Bulle':x;
  const html=(i,v)=>`<div class="il ilhi"><div class="ilt">${seq.slice(0,6).map((x,k)=>`<span class="${k===i?'cur':''}${k<i?' done':''}">${lb(x)}</span>`).join('')}</div><div class="ilc act big pa" style="--pc:${a}"><small>${esc(A)}</small><b class="ils">${v}</b></div></div>`;
  const hl=(s,i)=>s.querySelectorAll('.ilt span').forEach((e,k)=>{e.classList.toggle('cur',k===i);e.classList.toggle('done',k<i)});
  return[{t:'Cibles',cap:'Chaque manche a sa cible',txt:'Les manches s’enchaînent : '+seq.map(lb).join(', ')+`. Tu as ${S.hid||3} fléchettes par manche ; seules celles sur la cible comptent.`,html:()=>html(0,0),run:async(s,d)=>{for(let i=1;i<4;i++){await sleep(700);if(d())return;hl(s,i);pop(s.querySelectorAll('.ilt span')[i])}await sleep(800)}},
    {t:S.hip!==0?'÷ 2':'Marquer',cap:S.hip!==0?'Raté la cible : score divisé par 2':'Touche la cible pour marquer',txt:S.hip!==0?'Si aucune de tes fléchettes ne touche la cible de la manche, ton score total est divisé par deux.':'Chaque fléchette sur la cible rapporte sa valeur (× 2 ou × 3 pour un double ou un triple).',html:()=>html(3,120),run:async(s,d)=>{await sleep(700);if(d())return;const v=q(s,'.ils');if(S.hip!==0){q(s,'.pa').insertAdjacentHTML('beforeend','<i class="ilhalf">÷ 2</i>');shake(q(s,'.pa'));v.classList.add('bu');await count(v,120,60,500,d);await sleep(600);v.classList.remove('bu')}else await count(v,120,174,600,d);await sleep(1000)}},
    {t:'Gagner',cap:'Le plus de points gagne',txt:'Après la dernière manche, le plus gros score gagne. Égalité : prolongation à la Bulle.',html:()=>html(5,212),run:async(s,d)=>{await sleep(500);if(d())return;win2(s,q(s,'.pa'));await sleep(1400)}}]}

let TXT={goal:'',ps:[]},GEN=0;
function openInfo(){const P=pages(),my=++GEN,dead=()=>my!==GEN,gn={cricket:'Cricket',x01:String(S.xstart||501),killer:'Killer',clock:'L’horloge',shanghai:'Shanghai',halveit:'Halve-it'}[S.game]||'';
  const o=el('div','ov');o.id='rinfo';
  o.innerHTML=`<div class="ovh"><h2>${esc(gn)}</h2><button class="circ" data-x aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div class="rtabs">${P.map((p,i)=>`<button data-t="${i}">${esc(p.t)}</button>`).join('')}<button data-t="${P.length}">Règles</button></div>
    <div class="rpages">${P.map(p=>`<section><div class="gst"></div><h3>${esc(p.cap)}</h3><p>${esc(p.txt)}</p></section>`).join('')}<section class="rall"><p class="rgoal2">${TXT.goal}</p>${TXT.ps.map(x=>`<p>${x}</p>`).join('')}</section></div>`;
  document.body.append(o);requestAnimationFrame(()=>o.classList.add('on'));SFX.open();
  const box=q(o,'.rpages'),tabs=[...o.querySelectorAll('.rtabs button')],secs=[...o.querySelectorAll('.rpages section')];
  P.forEach((p,i)=>{q(secs[i],'.gst').innerHTML=p.html()});
  let cur=0;const mark=()=>tabs.forEach((t,i)=>t.classList.toggle('on',i===cur));mark();
  box.addEventListener('scroll',()=>{const k=Math.round(box.scrollLeft/box.clientWidth);if(k!==cur){cur=k;mark();const t=tabs[k];if(t)t.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}},{passive:true});
  o.addEventListener('click',e=>{if(e.target.closest('[data-x]')){GEN++;o.classList.remove('on');setTimeout(()=>o.remove(),300);SFX.back();return}
    const t=e.target.closest('[data-t]');if(t){haptic();box.scrollTo({left:+t.dataset.t*box.clientWidth,behavior:'smooth'})}});
  (async()=>{while(!dead()){const k=cur;if(k>=P.length){await sleep(300);continue}const st=q(secs[k],'.gst');st.innerHTML=P[k].html();
      try{await P[k].run(st,()=>dead()||cur!==k)}catch(e){}if(dead())return;await sleep(cur===k?600:50)}})()}

/* ---------- « Le but » + « Plus d'infos » ---------- */
let LAST='';
const _sr=showRules;showRules=function(){const r=_sr.apply(this,arguments);
  const g=R.querySelector(':scope>.rgoal');TXT={goal:g?g.innerHTML:'',ps:[...R.querySelectorAll(':scope>.rp')].map(x=>x.innerHTML)};
  R.innerHTML=(g?g.outerHTML:'')+'<button class="rmore">Plus d’infos ›</button>';R.style.minHeight='';
  const key=[S.game,S.mode,S.xstart,S.klives,S.hiseq&&S.hiseq.join(),(S.names||[]).slice(0,3).join(),ROSTER.map(x=>x.color).join()].join('|');
  if(key!==LAST){LAST=key;ill.innerHTML=illHtml()}return r};
R.addEventListener('click',e=>{if(e.target.closest('.rmore')){haptic();openInfo()}});
ill.addEventListener('click',()=>{haptic();openInfo()});
try{showRules()}catch(e){}

/* ---------- styles : mêmes cases, contours, bulles et polices que les écrans de jeu ---------- */
const OL='0 0 0 var(--ol,#111)';
document.head.append(el('style','',`
#setup .grules .rp{display:none}
#setup .grules .rmore{display:inline-block;margin-top:4px;border:0;background:transparent;padding:4px 0;font:700 13px "Lbl",sans-serif;color:var(--accent)}
#setup.p2 .gill{display:none}
#setup .gill{position:relative;margin:12px 0 4px;height:clamp(150px,22vh,200px);display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto}
.il{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:100%;--b:2.5px}
.il .ilc{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:74px;padding:8px 12px;border-radius:20px;box-shadow:inset 0 0 0 var(--b) var(--ol,#111);background:var(--m-cell,#fff)}
.il .ilc.act{background:var(--pc);box-shadow:inset 0 0 0 var(--b) var(--ol,#111),0 0 0 5px color-mix(in srgb,var(--pc) 55%,transparent)}
.il .ilc small{font:700 10px "Lbl",sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--pc)}
.il .ilc.act small{color:var(--btx,#fff)}
.il .ils{position:relative;display:grid;font:400 34px/1 "Fun",sans-serif;color:var(--ink)}
.il .ils>span{grid-area:1/1;opacity:0;text-align:center}
.il .ilc.act .ils{color:var(--btx,#fff);text-shadow:2px 0 var(--ol,#111),-2px 0 var(--ol,#111),0 2px var(--ol,#111),0 -2px var(--ol,#111),1.5px 1.5px var(--ol,#111),-1.5px 1.5px var(--ol,#111),1.5px -1.5px var(--ol,#111),-1.5px -1.5px var(--ol,#111)}
.il .ilc{flex:0 0 auto;width:auto;max-width:none;box-sizing:border-box}.il .ilc.big{min-width:118px;padding:10px 18px}.il .ilc.big .ils{font-size:44px}
.il .ils.bu{color:#e4251a!important}
.il .ilch{display:flex;gap:4px;min-height:22px;margin-top:4px}
.il .ilch i{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:22px;padding:0 6px;border-radius:99px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 1.5px var(--ol,#111);font:400 12px "FunTxt","Fun",sans-serif;font-style:normal;color:#111}
.il .ilch i.g{background:var(--gold)}.il .ilch i.s{background:var(--silver)}.il .ilch i.bu{background:#e4251a;color:#fff}.il .ilch i.sh{background:var(--accent);color:var(--btx,#fff)}
.il [style*="animation"]{will-change:opacity,transform}
.il .ilch i[style*="animation"],.il .ilh i[style*="animation"]{opacity:0}
.il .ilh i[style*="animation"]{opacity:1}
/* cricket */
.ilck{flex-direction:column;gap:8px}.ilck .ilcards{display:flex;gap:10px}
.ilck .ilrows{display:flex;flex-direction:column;gap:5px;width:min(260px,80%)}
.ilck .ilr{position:relative;display:flex;align-items:center;justify-content:space-between;height:28px;border-radius:99px;box-shadow:inset 0 0 0 2px var(--ol,#111);background:var(--m-cell,#fff);padding-left:10px}
.ilck .iln{display:inline-flex;align-items:center;justify-content:center;width:70px;height:100%;border-radius:99px;background:var(--accent);box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 18px "Fun",sans-serif;color:var(--btx,#fff)}
.ilck .ilmk{position:relative;display:grid;width:24px;height:22px}.ilck .ilmk>*{grid-area:1/1}.ilck .ilm{opacity:0;display:block}
.ilck .ilmk svg{width:22px;height:22px;fill:none;stroke:var(--ink);stroke-width:2.8;stroke-linecap:round}
.ilck .ilmb{position:absolute;right:78px}
.il .ilfly{position:absolute;right:18%;top:12%;font:400 22px "Fun",sans-serif;color:var(--accent);opacity:0}
/* 501 */
.ilx{flex-wrap:wrap;align-content:center;row-gap:14px}.ilx .ilkeys{flex:0 0 100%;display:flex;justify-content:center;gap:5px}
.ilx .ilkeys span{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 12px "Fun",sans-serif;color:var(--ink)}
.ilx .ilkeys span.on{width:auto;padding:0 8px;border-radius:99px;background:var(--gold);color:#111}
/* killer */
.ilkl{gap:8px}
.il .ilk{position:relative;flex:0 1 92px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:18px 6px 10px;border-radius:20px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 var(--b) var(--ol,#111);transition:opacity .3s}
.il .ilk.act{background:var(--pc);box-shadow:inset 0 0 0 var(--b) var(--ol,#111),0 0 0 5px color-mix(in srgb,var(--pc) 55%,transparent)}
.il .ilk small{font:700 10px "Lbl",sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--pc)}.il .ilk.act small{color:var(--btx,#fff)}
.il .ilk .ils{font-size:32px}.il .ilk.act .ils{color:var(--btx,#fff);text-shadow:2px 0 var(--ol,#111),-2px 0 var(--ol,#111),0 2px var(--ol,#111),0 -2px var(--ol,#111)}
.il .ilk.dead{opacity:.35}
.il .ilh{position:absolute;top:-11px;display:flex}
.il .ilh i{font-style:normal;font-size:19px;line-height:1;color:#ff2d3a;text-shadow:1.5px 0 var(--ol,#111),-1.5px 0 var(--ol,#111),0 1.5px var(--ol,#111),0 -1.5px var(--ol,#111);transition:opacity .25s}
.il .ilh i.off{opacity:.15}
.il .ilpip{display:flex;gap:3px}.il .ilpip i{width:14px;height:9px;border-radius:99px;box-shadow:inset 0 0 0 1.5px var(--ol,#111);background:#fff}.il .ilpip i.on{background:var(--ink)}
.il .ilkk{position:absolute;bottom:-9px;font:700 9px "Lbl",sans-serif;font-style:normal;letter-spacing:.08em;color:#111;background:var(--gold);border-radius:99px;padding:2px 7px;box-shadow:inset 0 0 0 1.5px var(--ol,#111)}
.il .ilsk{position:absolute;bottom:-9px;font-style:normal}
/* horloge */
.ilclk{gap:14px}.ilclk .ilslot{display:flex;gap:4px;margin-top:4px}.ilclk .ilslot i{width:22px;height:20px;border-radius:7px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--ol,#111);display:flex;align-items:center;justify-content:center}
.ilclk .ilslot em{font:400 12px "Fun",sans-serif;font-style:normal;color:#111;opacity:0}
.ilclk .ilring{position:relative;flex:none;width:150px;height:150px}.ilclk .ilring.big{width:min(240px,64vw);height:min(240px,64vw)}
.ilclk .ilring span{position:absolute;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:400 10px "Fun",sans-serif;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ol,#111);background:var(--m-cell,#fff)}
.ilclk .ilring.big span{width:26px;height:26px;font-size:12px}
.ilclk .ilring span em{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;background:var(--accent);color:var(--btx,#fff);opacity:0}
.ilclk .ilring span.done{background:var(--accent);color:var(--btx,#fff)}.ilclk .ilring span.cur{box-shadow:inset 0 0 0 3px var(--accent)}
.ilclk .ilcn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:400 18px "Fun",sans-serif;color:var(--pc);white-space:nowrap}
/* shanghai / halve-it */
.ilsh{flex-direction:column}.ilsh .iltour,.ilsh .iltn{display:inline-grid}.ilsh .iltour>span{grid-area:1/1;opacity:0}
.il .ilbig{position:absolute;bottom:4px;font:400 20px "Fun",sans-serif;color:var(--accent);opacity:0}
.ilhi{flex-direction:column;gap:12px}.ilhi .ilt{display:flex;gap:5px;flex-wrap:wrap;justify-content:center}
.ilhi .ilt span{position:relative;min-width:30px;height:26px;padding:0 8px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 13px "Fun",sans-serif;color:var(--ink);overflow:hidden;background:var(--m-cell,#fff)}
.ilhi .ilt span em{position:absolute;inset:0;background:var(--accent);opacity:0;z-index:-1}.ilhi .ilt span{isolation:isolate}
.ilhi .ilt span.cur{background:var(--accent);color:var(--btx,#fff)}.ilhi .ilt span.done{opacity:.4}
.il .ilhalf{position:absolute;right:-14px;top:-10px;font:400 14px "Fun",sans-serif;font-style:normal;color:#fff;background:#e4251a;border-radius:99px;padding:3px 8px;box-shadow:inset 0 0 0 1.5px var(--ol,#111)}
.il .ilhalf[style*="animation"]{opacity:0}
.il .iltr{position:absolute;top:-18px;right:-12px;font-style:normal;font-size:26px}
/* écran « Plus d'infos » */
#rinfo{gap:10px;background:var(--page,#f7f2e5)!important}
#rinfo .rtabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;flex:none;padding:2px}#rinfo .rtabs::-webkit-scrollbar{display:none}
#rinfo .rtabs button{flex:none;border:0;border-radius:99px;padding:9px 14px;background:transparent;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 15px "Fun",sans-serif;color:var(--ink)}
#rinfo .rtabs button.on{background:var(--accent);color:var(--btx,#fff)}
#rinfo .rpages{flex:1;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;min-height:0}#rinfo .rpages::-webkit-scrollbar{display:none}
#rinfo section{flex:0 0 100%;scroll-snap-align:center;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:6px 4px 20px;box-sizing:border-box}
#rinfo .gst{position:relative;flex:none;height:min(300px,40vh);border-radius:24px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 2.5px var(--ol,#111);display:flex;align-items:center;justify-content:center;overflow:visible}
#rinfo .gst .il{--b:3px;zoom:1.2}
#rinfo h3{margin:4px 2px 0;font:400 22px/1.2 "Fun",sans-serif;color:var(--ink)}
#rinfo section p{margin:0 2px;font:500 16px/1.45 "Lbl",sans-serif;color:var(--ink)}
#rinfo .rall{gap:12px}#rinfo .rgoal2{font-weight:700}#rinfo .rgoal2 i{font-style:normal;color:var(--accent);margin-right:.3em}#rinfo .rgoal2 i::after{content:" :"}
#rinfo .ilfly2{position:absolute;left:0;top:0;z-index:5;font:400 24px "Fun",sans-serif;color:var(--accent);pointer-events:none}
`));
})();
