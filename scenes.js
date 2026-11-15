/* ===================== SCÈNES DES JEUX (écran Nouvelle partie) =====================
   À la place du bloc des règles : la ligne « Le but » + « Plus d'infos », et une petite scène illustrée
   qui montre 2-3 principes du jeu avec les éléments graphiques de l'appli.
   Deux formes à l'essai : « Démo » (un tableau qui se joue tout seul en boucle) et « Cartes » (une carte par principe). */
(function(){
const SU=$('setup'),R=$('gRules');if(!SU||!R)return;
const scn=el('div','gscn');scn.id='gScn';R.after(scn);
let GEN=0,TXT={goal:'',ps:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const visible=()=>SU.classList.contains('on')&&!SU.classList.contains('p2')&&document.visibilityState!=='hidden';
const PN=i=>{const n=((S.names||[])[i]||['LOU','TONE','ZOÉ'][i]||'J'+(i+1)).toUpperCase();return/^J\d$/.test(n)?['LOU','TONE','ZOÉ'][i]:n};
const PC=i=>{const c=pcol(PN(i));return/^#[0-9a-f]{6}$/i.test(c||'')?c:PFB[i%PFB.length]};
const MK=n=>`<svg viewBox="0 0 24 24">${n>=1?'<path d="M6 18 18 6"/>':''}${n>=2?'<path d="M6 6 18 18"/>':''}${n>=3?'<circle cx="12" cy="12" r="10"/>':''}</svg>`;
const pop=(e,k)=>e&&e.animate(k||[{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.3,1.6,.5,1)'});
const shake=e=>e&&e.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(-5px)'},{transform:'translateX(0)'}],{duration:380});
const q=(r,s)=>r.querySelector(s);
/* étiquette qui file d'un élément à un autre (ex. +20 vers le score de l'adversaire) */
function fly(st,from,to,txt,cls){const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),o=st.getBoundingClientRect(),t=el('b','scfly'+(cls?' '+cls:''),txt);st.append(t);
  const x0=a.left+a.width/2-o.left,y0=a.top+a.height/2-o.top,x1=b.left+b.width/2-o.left,y1=b.top+b.height/2-o.top;
  t.animate([{transform:`translate(${x0}px,${y0}px) translate(-50%,-50%) scale(.6)`,opacity:0},{transform:`translate(${x0}px,${y0-18}px) translate(-50%,-50%) scale(1.15)`,opacity:1,offset:.25},{transform:`translate(${x1}px,${y1}px) translate(-50%,-50%) scale(.8)`,opacity:.9}],{duration:900,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'}).onfinish=()=>t.remove()}
async function count(e,from,to,ms,dead){const n=12;for(let i=1;i<=n;i++){if(dead())return;e.textContent=Math.round(from+(to-from)*i/n);await sleep(ms/n)}}
const chip=(t,c)=>`<em class="scc ${c||''}">${t}</em>`;
const dl=(n,m)=>n===0?'S':n===25?(m===2?'DB':'B'):(m===3?'T':m===2?'D':'')+n;

/* ---------- les scènes : 3 étapes par jeu, chacune = { cap, html(), run(stage, dead) } ---------- */
function scenes(){const g=S.game||'cricket',A=PN(0),B=PN(1),C=PN(2);
  if(g==='cricket'){const cut=S.mode==='cut',nums=[20,19,18];
    const html=(ma,mb,sa,sb)=>`<div class="sck"><div class="scp" style="--pc:${PC(0)}"><b>${esc(A)}</b><em class="sa">${sa||0}</em></div><div class="scrows">${nums.map((n,i)=>`<div class="scr"><i class="ma" data-r="${n}">${MK(ma[i]||0)}</i><span class="scn" data-n="${n}">${n}</span><i class="mb">${MK(mb[i]||0)}</i></div>`).join('')}</div><div class="scp" style="--pc:${PC(1)}"><b>${esc(B)}</b><em class="sb">${sb||0}</em></div></div>`;
    return[{cap:'Touche un numéro <b>3 fois</b> pour le fermer',html:()=>html([0,0,0],[1,0,0]),run:async(s,d)=>{for(let k=1;k<=3;k++){await sleep(650);if(d())return;pop(q(s,'[data-n="20"]'));q(s,'.ma[data-r="20"]').innerHTML=MK(k);pop(q(s,'.ma[data-r="20"]'))}await sleep(900)}},
      {cap:cut?'Fermé chez toi : chaque touche en plus <b>donne des points</b> à l’adversaire':'Fermé chez toi : chaque touche en plus <b>te rapporte</b> ses points',html:()=>html([3,0,0],[1,0,0]),run:async(s,d)=>{let v=0;for(let k=0;k<2;k++){await sleep(700);if(d())return;const n=q(s,'[data-n="20"]'),to=q(s,cut?'.sb':'.sa');pop(n);fly(s,n,to,'+20');await sleep(850);if(d())return;v+=20;to.textContent=v;pop(to)}await sleep(700)}},
      {cap:cut?'Tout fermé avec <b>le moins de points</b> : gagné':'Tout fermé avec <b>le plus de points</b> : gagné',html:()=>html([3,0,0],[1,2,0],cut?0:40,cut?40:0),run:async(s,d)=>{for(const r of [19,18])for(let k=1;k<=3;k++){await sleep(230);if(d())return;q(s,`.ma[data-r="${r}"]`).innerHTML=MK(k);if(k===3)pop(q(s,`[data-n="${r}"]`))}
        await sleep(300);if(d())return;const p=q(s,'.scp');p.classList.add('win');p.insertAdjacentHTML('beforeend','<i class="sctr">🏆</i>');pop(q(s,'.sctr'),[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}]);await sleep(1300)}}]}
  if(g==='x01'){const st=S.xstart||501,dbl=S.xout!==0;
    const html=(v,c)=>`<div class="scx" style="--pc:${PC(0)}"><b>${esc(A)}</b><em class="sv">${v}</em><div class="scd">${c||''}</div></div>`;
    return[{cap:'Chaque volée est <b>retirée</b> de ton score',html:()=>html(st),run:async(s,d)=>{const box=q(s,'.scd');for(const t of ['T20','T20','T20']){await sleep(450);if(d())return;box.insertAdjacentHTML('beforeend',chip(t,'m3'));pop(box.lastElementChild)}
        await sleep(300);if(d())return;await count(q(s,'.sv'),st,st-180,600,d);fly(s,box,q(s,'.sv'),'−180');await sleep(1100)}},
      {cap:dbl?'Pour finir : tomber <b>pile sur 0</b> avec un <b>double</b>':'Pour finir : tomber <b>pile sur 0</b>',html:()=>html(40),run:async(s,d)=>{await sleep(600);if(d())return;q(s,'.scd').innerHTML=chip(dbl?'D20':'20',dbl?'m2':'');pop(q(s,'.scc'));await sleep(400);if(d())return;
        await count(q(s,'.sv'),40,dbl?0:20,400,d);if(!dbl){await sleep(300);q(s,'.scd').insertAdjacentHTML('beforeend',chip('20'));await count(q(s,'.sv'),20,0,300,d)}q(s,'.scx').classList.add('win');q(s,'.scx').insertAdjacentHTML('beforeend','<i class="sctr">🏆</i>');pop(q(s,'.sctr'),[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}]);await sleep(1300)}},
      {cap:'Trop haut ? <b>Bust</b> : ton tour ne compte pas',html:()=>html(32),run:async(s,d)=>{const box=q(s,'.scd'),v=q(s,'.sv');await sleep(500);if(d())return;box.innerHTML=chip('20');await count(v,32,12,300,d);await sleep(350);if(d())return;
        box.insertAdjacentHTML('beforeend',chip('19'));await sleep(300);if(d())return;box.insertAdjacentHTML('beforeend',chip('BUST','bu'));shake(q(s,'.scx'));v.classList.add('bu');await sleep(700);if(d())return;v.classList.remove('bu');v.textContent=32;pop(v);await sleep(1000)}}]}
  if(g==='killer'){const P=[[A,20,0],[B,19,1],[C,18,2]],L=S.klives||3;
    const html=(m,h,dead)=>`<div class="skl">${P.map(([n,num,i],k)=>`<div class="skc${dead&&k?' dead':''}" data-k="${k}" style="--pc:${PC(i)}"><div class="skh">${Array.from({length:L},(_,j)=>`<i class="${j<(h?h[k]:L)?'':'off'}">♥</i>`).join('')}</div><b>${esc(n)}</b><span class="skn">${num}</span><div class="skm">${[0,1,2].map(j=>`<i class="${j<(m?m[k]:0)?'on':''}"></i>`).join('')}</div>${dead&&k?'<em class="skd">💀</em>':''}</div>`).join('')}</div>`;
    return[{cap:'Touche <b>ton numéro 3 fois</b> : tu deviens Killer',html:()=>html([0,0,0]),run:async(s,d)=>{const c=q(s,'[data-k="0"]');for(let j=0;j<3;j++){await sleep(550);if(d())return;c.querySelectorAll('.skm i')[j].classList.add('on');pop(q(c,'.skn'))}
        await sleep(300);if(d())return;c.classList.add('kil');c.insertAdjacentHTML('beforeend','<em class="skk">KILLER</em>');pop(q(c,'.skk'),[{transform:'scale(0)'},{transform:'scale(1.2)'},{transform:'scale(1)'}]);await sleep(1000)}},
      {cap:'Vise les autres : chaque touche leur <b>enlève un cœur</b>',html:()=>html([3,0,0]).replace('class="skc"','class="skc kil"'),run:async(s,d)=>{for(const k of [1,2,1]){await sleep(650);if(d())return;const c=q(s,`[data-k="${k}"]`),h=[...c.querySelectorAll('.skh i:not(.off)')].pop();pop(q(c,'.skn'));if(h){h.animate([{transform:'scale(1)'},{transform:'scale(1.6) translateY(-6px)',opacity:0}],{duration:420});setTimeout(()=>h.classList.add('off'),400)}}await sleep(900)}},
      {cap:'Le <b>dernier en vie</b> gagne',html:()=>html([3,0,0],[L,1,1]).replace('class="skc"','class="skc kil"'),run:async(s,d)=>{for(const k of [1,2]){await sleep(500);if(d())return;const c=q(s,`[data-k="${k}"]`);c.querySelectorAll('.skh i').forEach(i=>i.classList.add('off'));c.classList.add('dead');c.insertAdjacentHTML('beforeend','<em class="skd">💀</em>')}
        await sleep(400);if(d())return;const w=q(s,'[data-k="0"]');w.classList.add('win');w.insertAdjacentHTML('beforeend','<i class="sctr">🏆</i>');pop(q(w,'.sctr'),[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}]);await sleep(1300)}}]}
  if(g==='clock'){const end=S.clkb!==0?21:20,lab=i=>i===21?'B':i;
    const html=(p)=>`<div class="sclk">${Array.from({length:end},(_,i)=>{const a=(i/end)*2*Math.PI-Math.PI/2;return`<span class="clk${i+1<=p?' done':''}${i+1===p+1?' cur':''}" data-i="${i+1}" style="left:${50+40*Math.cos(a)}%;top:${50+40*Math.sin(a)}%">${lab(i+1)}</span>`}).join('')}<b class="clkn" style="--pc:${PC(0)}">${esc(A)}</b></div>`;
    const go=(s,p)=>{s.querySelectorAll('.clk').forEach(e=>{const i=+e.dataset.i;e.classList.toggle('done',i<=p);e.classList.toggle('cur',i===p+1)});pop(q(s,`[data-i="${Math.min(p,end)}"]`))};
    return[{cap:'Touche les numéros <b>dans l’ordre</b> : 1, 2, 3…',html:()=>html(0),run:async(s,d)=>{for(let p=1;p<=4;p++){await sleep(520);if(d())return;go(s,p)}await sleep(700)}},
      {cap:S.clkm?'Un double te fait <b>sauter de 2</b>, un triple <b>de 3</b>':'Simple, double ou triple : tu <b>avances d’une case</b>',html:()=>html(4),run:async(s,d)=>{const seq=S.clkm?[6,9]:[5,6];for(const p of seq){await sleep(750);if(d())return;go(s,p)}await sleep(800)}},
      {cap:'Le <b>premier arrivé</b> '+(end===21?'à la Bulle':'au 20')+' gagne',html:()=>html(14),run:async(s,d)=>{for(let p=15;p<=end;p++){await sleep(160);if(d())return;go(s,p)}await sleep(200);if(d())return;q(s,'.clkn').insertAdjacentHTML('beforeend',' 🏆');pop(q(s,'.clkn'));await sleep(1300)}}]}
  if(g==='shanghai'){
    const html=(t,c)=>`<div class="ssh"><span class="sst">Tour ${t}</span><b class="ssn">${t}</b><div class="scd">${c||''}</div></div>`;
    return[{cap:'Tour 1 : vise le 1. Tour 2 : le 2… <b>un numéro par tour</b>',html:()=>html(1),run:async(s,d)=>{for(const t of [2,3]){await sleep(900);if(d())return;q(s,'.sst').textContent='Tour '+t;q(s,'.ssn').textContent=t;pop(q(s,'.ssn'))}await sleep(800)}},
      {cap:'Simple + double + triple du même numéro : <b>Shanghai !</b>',html:()=>html(3),run:async(s,d)=>{const box=q(s,'.scd');for(const [t,c] of [['3',''],['D3','m2'],['T3','m3']]){await sleep(500);if(d())return;box.insertAdjacentHTML('beforeend',chip(t,c));pop(box.lastElementChild)}
        await sleep(300);if(d())return;box.insertAdjacentHTML('beforeend','<em class="scc shg">SHANGHAI !</em>');pop(box.lastElementChild,[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}]);await sleep(1200)}},
      {cap:'Sinon, <b>le plus de points</b> à la fin gagne',html:()=>`<div class="sck2"><div class="scp" style="--pc:${PC(0)}"><b>${esc(A)}</b><em class="sa">0</em></div><div class="scp" style="--pc:${PC(1)}"><b>${esc(B)}</b><em class="sb">0</em></div></div>`,run:async(s,d)=>{await Promise.all([count(q(s,'.sa'),0,96,900,d),count(q(s,'.sb'),0,71,900,d)]);if(d())return;const p=q(s,'.scp');p.classList.add('win');p.insertAdjacentHTML('beforeend','<i class="sctr">🏆</i>');pop(q(s,'.sctr'),[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}]);await sleep(1300)}}]}
  /* halve-it */
  const seq=(S.hiseq&&S.hiseq.length?S.hiseq:HI_CLASSIC).slice(0,6),lb=x=>x==='D'?'Doubles':x==='T'?'Triples':x==='B'?'Bulle':x;
  const html=(i,v)=>`<div class="shi"><div class="shl">${seq.map((x,k)=>`<em class="scc${k===i?' cur':''}${k<i?' done':''}">${lb(x)}</em>`).join('')}</div><div class="scx" style="--pc:${PC(0)}"><b>${esc(A)}</b><em class="sv">${v}</em></div></div>`;
  const hl=(s,i)=>s.querySelectorAll('.shl .scc').forEach((e,k)=>{e.classList.toggle('cur',k===i);e.classList.toggle('done',k<i)});
  return[{cap:'Chaque manche a <b>sa cible</b>',html:()=>html(0,0),run:async(s,d)=>{for(let i=1;i<4;i++){await sleep(700);if(d())return;hl(s,i);pop(s.querySelectorAll('.shl .scc')[i])}await sleep(700)}},
    {cap:S.hip!==0?'Aucune fléchette sur la cible : ton score est <b>divisé par 2</b>':'Touche la cible de la manche pour <b>marquer</b>',html:()=>html(3,120),run:async(s,d)=>{await sleep(700);if(d())return;const v=q(s,'.sv');if(S.hip!==0){q(s,'.scx').insertAdjacentHTML('beforeend','<em class="scc bu">÷ 2</em>');shake(q(s,'.scx'));v.classList.add('bu');await count(v,120,60,500,d);await sleep(600);v.classList.remove('bu')}else{await count(v,120,174,600,d)}await sleep(900)}},
    {cap:'<b>Le plus de points</b> à la fin gagne',html:()=>html(seq.length-1,212),run:async(s,d)=>{await sleep(500);if(d())return;q(s,'.scx').classList.add('win');q(s,'.scx').insertAdjacentHTML('beforeend','<i class="sctr">🏆</i>');pop(q(s,'.sctr'),[{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}]);await sleep(1400)}}]}

/* ---------- affichage : démo (une scène qui enchaîne les étapes) ou cartes (une carte par étape) ---------- */
const mode=()=>S.scn==='cards'?'cards':'demo';
function build(){const my=++GEN,dead=()=>my!==GEN,ST=scenes(),m=mode();
  scn.innerHTML=`<div class="gsw"><button data-sm="demo" class="${m==='demo'?'on':''}">Démo</button><button data-sm="cards" class="${m==='cards'?'on':''}">Cartes</button></div>`+
    (m==='demo'?`<div class="gst"></div><p class="gcap"></p><div class="gdots">${ST.map(()=>'<i></i>').join('')}</div>`
      :`<div class="gcards">${ST.map((x,i)=>`<div class="gcard" data-i="${i}"><div class="gst"></div><p class="gcap">${x.cap}</p></div>`).join('')}</div><div class="gdots">${ST.map(()=>'<i></i>').join('')}</div>`);
  const dots=[...scn.querySelectorAll('.gdots i')];
  (async()=>{let i=0;
    if(m==='demo'){const st=q(scn,'.gst'),cap=q(scn,'.gcap');
      while(!dead()){if(!visible()){await sleep(600);continue}const x=ST[i];dots.forEach((d,k)=>d.classList.toggle('on',k===i));cap.innerHTML=x.cap;st.innerHTML=x.html();
        cap.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:300});
        try{await x.run(st,dead)}catch(e){}if(dead())return;await sleep(500);i=(i+1)%ST.length}}
    else{const box=q(scn,'.gcards'),cards=[...scn.querySelectorAll('.gcard')];cards.forEach((c,k)=>q(c,'.gst').innerHTML=ST[k].html());
      let cur=0,user=0;box.addEventListener('scroll',()=>{const k=Math.round(box.scrollLeft/box.clientWidth);if(k!==cur){cur=k;user=Date.now()}},{passive:true});
      while(!dead()){if(!visible()){await sleep(600);continue}const k=cur;dots.forEach((d,j)=>d.classList.toggle('on',j===k));const st=q(cards[k],'.gst');st.innerHTML=ST[k].html();
        try{await ST[k].run(st,()=>dead()||cur!==k)}catch(e){}if(dead())return;if(cur!==k)continue;await sleep(900);if(dead())return;
        if(cur===k&&Date.now()-user>2500){cur=(k+1)%ST.length;box.scrollTo({left:cur*box.clientWidth,behavior:'smooth'})}}}})()}
scn.addEventListener('click',e=>{const b=e.target.closest('[data-sm]');if(b){haptic();SFX.tick();S.scn=b.dataset.sm;store.set(K_S,S);build();return}
  const d=e.target.closest('.gdots i');if(d&&mode()==='cards'){const k=[...scn.querySelectorAll('.gdots i')].indexOf(d),box=q(scn,'.gcards');box.scrollTo({left:k*box.clientWidth,behavior:'smooth'})}});

/* ---------- « Le but » + « Plus d'infos » (règles complètes dans une feuille) ---------- */
let LAST='';
const _sr=showRules;showRules=function(){const r=_sr.apply(this,arguments);
  const g=R.querySelector(':scope>.rgoal');TXT={goal:g?g.innerHTML:'',ps:[...R.querySelectorAll(':scope>.rp')].map(x=>x.innerHTML)};
  R.innerHTML=(g?g.outerHTML:'')+'<button class="rmore">Plus d’infos ›</button>';R.style.minHeight='';   /* l'ancien texte et la hauteur réservée ne servent plus */
  const key=[S.game,S.mode,S.xstart,S.xout,S.klives,S.clkm,S.clkb,S.hip,(S.names||[]).slice(0,3).join(),S.scn].join('|');if(key!==LAST){LAST=key;build()}return r};
R.addEventListener('click',e=>{if(!e.target.closest('.rmore'))return;haptic();SFX.open();const o=el('div','');o.id='rsheet';
  o.innerHTML=`<div class="rsb"><i class="rsg"></i><p class="rsgoal">${TXT.goal}</p>${TXT.ps.map(x=>`<p>${x}</p>`).join('')}<button class="rsx">Fermer</button></div>`;document.body.append(o);
  requestAnimationFrame(()=>o.classList.add('on'));const close=()=>{o.classList.remove('on');setTimeout(()=>o.remove(),280)};
  o.addEventListener('click',ev=>{if(ev.target===o||ev.target.closest('.rsx'))close()});
  let y0=null;o.addEventListener('touchstart',ev=>{y0=ev.touches[0].clientY},{passive:true});o.addEventListener('touchend',ev=>{if(y0!==null&&ev.changedTouches[0].clientY-y0>70)close();y0=null},{passive:true})});
try{showRules()}catch(e){}

document.head.append(el('style','',`
#setup .grules .rp{display:none}
#setup .grules .rmore{display:inline-block;margin-top:4px;border:0;background:transparent;padding:4px 0;font:600 13px "Lbl",sans-serif;color:var(--accent)}
#setup.p2 .gscn{display:none}
#setup .gscn{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:8px;margin:10px 0 4px}
#setup .gsw{position:absolute;top:-4px;right:0;z-index:3;display:flex;border-radius:99px;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.18);overflow:hidden}
#setup .gsw button{border:0;background:transparent;padding:4px 10px;font:600 11px "Lbl",sans-serif;color:var(--mute)}#setup .gsw button.on{background:var(--accent);color:var(--btx,#fff)}
#setup .gst{position:relative;height:clamp(170px,26vh,230px);border-radius:22px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 2px var(--ol,#111);display:flex;align-items:center;justify-content:center;overflow:hidden}
#setup .gcap{margin:0;min-height:2.6em;text-align:center;font:500 14px/1.3 "Lbl",sans-serif;color:var(--ink);text-wrap:balance}#setup .gcap b{color:var(--accent);font-weight:700}
#setup .gdots{display:flex;justify-content:center;gap:6px}#setup .gdots i{width:7px;height:7px;border-radius:50%;background:rgba(0,0,0,.18);transition:background .2s,transform .2s}#setup .gdots i.on{background:var(--accent);transform:scale(1.3)}
#setup .gcards{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;gap:0}#setup .gcards::-webkit-scrollbar{display:none}
#setup .gcard{flex:0 0 100%;scroll-snap-align:center;display:flex;flex-direction:column;gap:8px;padding:0 2px;box-sizing:border-box}
#setup .scfly{position:absolute;left:0;top:0;z-index:5;font:400 22px "Fun",sans-serif;color:var(--accent);pointer-events:none;white-space:nowrap}
#setup .sctr{font-style:normal;font-size:26px;display:inline-block}
/* cricket */
#setup .sck{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;width:100%;padding:0 14px;box-sizing:border-box}
#setup .scp{display:flex;flex-direction:column;align-items:center;gap:2px;position:relative}#setup .scp b{font:400 16px "Fun",sans-serif;color:var(--pc)}#setup .scp em{font:400 34px "Fun",sans-serif;font-style:normal;color:var(--ink);line-height:1}
#setup .scp.win b{color:var(--pc)}#setup .scp .sctr{position:absolute;top:-30px}
#setup .scrows{display:flex;flex-direction:column;gap:6px}#setup .scr{display:flex;align-items:center;gap:8px}
#setup .scn{display:inline-flex;align-items:center;justify-content:center;width:52px;height:34px;border-radius:99px;background:var(--accent);color:var(--btx,#fff);font:400 20px "Fun",sans-serif}
#setup .scr i{width:26px;height:26px;display:inline-flex}#setup .scr i svg{width:100%;height:100%;fill:none;stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}
#setup .sck2{display:flex;justify-content:space-around;width:100%}
/* 501 */
#setup .scx{display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}#setup .scx b{font:400 17px "Fun",sans-serif;color:var(--pc)}
#setup .scx .sv{font:400 64px "Fun",sans-serif;font-style:normal;color:var(--ink);line-height:1;transition:color .2s}#setup .sv.bu{color:#c0392b}
#setup .scx .sctr{position:absolute;right:-34px;top:20px}
#setup .scd{display:flex;gap:6px;min-height:30px;flex-wrap:wrap;justify-content:center}
#setup .scc{display:inline-flex;align-items:center;justify-content:center;min-width:38px;padding:5px 9px;border-radius:99px;background:rgba(0,0,0,.07);font:400 15px "FunTxt","Fun",sans-serif;font-style:normal;color:var(--ink)}
#setup .scc.m2{background:var(--silver)}#setup .scc.m3{background:var(--gold)}#setup .scc.bu{background:#c0392b;color:#fff}#setup .scc.shg{background:var(--accent);color:var(--btx,#fff)}
/* killer */
#setup .skl{display:flex;gap:10px;justify-content:center;width:100%;padding:0 10px;box-sizing:border-box}
#setup .skc{position:relative;flex:1;max-width:110px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 6px 10px;border-radius:18px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.15);transition:opacity .3s,box-shadow .3s}
#setup .skc.kil{box-shadow:inset 0 0 0 3px var(--pc)}#setup .skc.dead{opacity:.35}#setup .skc b{font:400 14px "Fun",sans-serif;color:var(--pc)}
#setup .skn{font:400 28px "Fun",sans-serif;color:var(--ink);line-height:1}
#setup .skh{position:absolute;top:-10px;display:flex;gap:1px}#setup .skh i{font-style:normal;color:#e4251a;font-size:16px;text-shadow:0 0 0 #000}#setup .skh i.off{opacity:.15}
#setup .skm{display:flex;gap:4px}#setup .skm i{width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--ink)}#setup .skm i.on{background:var(--pc);box-shadow:none}
#setup .skk{font:700 10px "Lbl",sans-serif;font-style:normal;letter-spacing:.08em;color:var(--btx,#fff);background:var(--pc);border-radius:99px;padding:2px 7px}
#setup .skd{position:absolute;bottom:-8px;font-style:normal}#setup .skc .sctr{position:absolute;bottom:-14px}
/* horloge */
#setup .sclk{position:relative;width:min(100%,230px);aspect-ratio:1;max-height:100%}
#setup .clk{position:absolute;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:400 11px "Fun",sans-serif;color:var(--ink);box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.2);transition:background .2s}
#setup .clk.done{background:var(--accent);color:var(--btx,#fff);box-shadow:none}#setup .clk.cur{box-shadow:inset 0 0 0 2.5px var(--accent)}
#setup .clkn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:400 18px "Fun",sans-serif;color:var(--pc);white-space:nowrap}
/* shanghai / halve-it */
#setup .ssh{display:flex;flex-direction:column;align-items:center;gap:4px}#setup .sst{font:600 12px "Lbl",sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--mute)}
#setup .ssn{display:inline-flex;align-items:center;justify-content:center;width:72px;height:48px;border-radius:99px;background:var(--accent);color:var(--btx,#fff);font:400 30px "Fun",sans-serif}
#setup .shi{display:flex;flex-direction:column;align-items:center;gap:12px}#setup .shl{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;padding:0 10px}
#setup .shl .scc.cur{background:var(--accent);color:var(--btx,#fff)}#setup .shl .scc.done{opacity:.4}
#setup .shi .scx .sv{font-size:48px}
/* feuille « Plus d'infos » */
#rsheet{position:fixed;inset:0;z-index:250;background:rgba(0,0,0,0);display:flex;align-items:flex-end;transition:background .28s}
#rsheet.on{background:rgba(0,0,0,.4)}
#rsheet .rsb{width:100%;max-height:80vh;overflow-y:auto;box-sizing:border-box;padding:12px 22px calc(var(--sab,0px) + 22px);border-radius:26px 26px 0 0;background:var(--m-home,#f7f2e5);transform:translateY(100%);transition:transform .28s cubic-bezier(.3,1,.4,1);display:flex;flex-direction:column;gap:10px}
#rsheet.on .rsb{transform:none}
#rsheet .rsg{align-self:center;width:44px;height:5px;border-radius:99px;background:rgba(0,0,0,.2);margin-bottom:6px}
#rsheet p{margin:0;font:400 15px/1.45 "Lbl",sans-serif;color:var(--ink)}#rsheet .rsgoal{font:600 17px/1.35 "Lbl",sans-serif}#rsheet .rsgoal i{font-style:normal;color:var(--accent);margin-right:.3em}#rsheet .rsgoal i::after{content:" :"}
#rsheet .rsx{margin-top:8px;border:0;border-radius:99px;padding:13px;background:transparent;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 17px "Fun",sans-serif;color:var(--ink)}
`));
})();
