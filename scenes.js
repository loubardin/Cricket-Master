/* ===================== ILLUSTRATIONS DES JEUX (écran Nouvelle partie) =====================
   - sous « Le but » : une petite illustration du tableau du jeu choisi, dans la DA de l'appli,
     animée en CSS pur (boucle légère, sans texte d'explication)
   - « Plus d'infos » : un écran à onglets ; chaque onglet = une animation + l'explication d'un principe,
     le dernier onglet = toutes les règles. */
(function(){
/* ===== mode « scène » : l'appli tourne dans une petite fenêtre (onglets « Plus d'infos ») et joue toute seule
   une situation de jeu avec les vrais écrans et les vrais effets. Rien n'est enregistré (stockage neutralisé). ===== */
if(window.EMBED){(function(){
  const [g,st]=(new URLSearchParams(location.search).get('scene')||'cricket:0').split(':'),k=+st||0;
  document.documentElement.classList.add('embed');
  S.sound=false;S.voice=false;S.bet=0;S.teams=0;S.order='fixed';S.game=g;S.xrep=0;
  const sl=ms=>new Promise(r=>setTimeout(r,ms)),W=950;
  const N=[0,1,2].map(i=>{const n=((S.names||[])[i]||'').trim().toUpperCase();return(!n||/^J\d$/.test(n))?['LOU','TONE','ZOÉ'][i]:n});
  const closeWin=()=>{['win','knext'].forEach(id=>{const e=$(id);if(e)e.classList.remove('on')})};
  /* lance une partie neuve du jeu, avec n joueurs */
  const start=n=>{closeWin();S.n=n;S.names=N.slice(0,n);if(g==='killer')startKiller(N.slice(0,n),[20,19,18].slice(0,n));else launchNew()};
  const c=(t,m)=>{G.mult=m||1;throwDart(t)};                       /* cricket */
  const x=(t,m)=>{XG.mult=m||1;xThrow(t,m||1)};                    /* 501 et mini-jeux */
  const kk=(t,m)=>{KG.mult=m||1;kThrow(t)};                        /* killer */
  const rx=()=>{if(XG.mode)showX01();else xRender()};
  const hiHit=()=>{const t=hiT();if(t==='D')x(16,2);else if(t==='T')x(20,3);else if(t==='B'||t===25)x(25,1);else x(+t,1)};
  const S3={
    cricket:[async()=>{start(2);for(let i=0;i<3;i++){await sl(W);c(20)}await sl(2600)},
      async()=>{start(2);await sl(W);c(20,3);await sl(W);c(20);await sl(W);c(20);await sl(2800)},
      async()=>{start(2);const A=G.players[0],B=G.players[1];TARGETS.forEach(t=>{if(t!==25)A.marks[t]=3});[20,19,18,17].forEach(t=>B.marks[t]=2);
        if(G.mode==='cut')B.score=60;else A.score=60;render();await sl(W);c(25);await sl(W);c(25,2);await sl(4200)}],
    x01:[async()=>{start(2);for(let i=0;i<3;i++){await sl(W);x(20,3)}await sl(2600)},
      async()=>{start(2);const p=XG.players[0];p.rem=40;XG.ts=40;rx();await sl(W);if(XG.outR)x(20,2);else{x(20,1);await sl(W);x(20,1)}await sl(4200)},
      async()=>{start(2);const p=XG.players[0];p.rem=32;XG.ts=32;rx();await sl(W);x(20,1);await sl(W);x(19,1);await sl(3000)}],
    killer:[async()=>{start(3);for(let i=0;i<3;i++){await sl(W);kk(20)}await sl(2600)},
      async()=>{start(3);const p=KG.players[0];p.marks=3;p.killer=true;kRender();await sl(W);kk(19);await sl(W);kk(18,2);await sl(W);kk(19);await sl(2600)},
      async()=>{start(3);const P=KG.players;P[0].marks=3;P[0].killer=true;P[1].lives=1;P[2].lives=1;kRender();await sl(W);kk(19);await sl(W);kk(18);await sl(4200)}],
    clock:[async()=>{start(2);for(const t of [1,2,3]){await sl(W);x(t,1)}await sl(2600)},
      async()=>{start(2);XG.players[0].tgt=4;rx();await sl(W);x(4,XG.clkm?2:1);await sl(W);x(XG.clkm?6:5,XG.clkm?3:1);await sl(W);x(0,1);await sl(2600)},
      async()=>{start(2);const p=XG.players[0],e=XG.clkb?25:20;p.tgt=e===25?19:18;rx();for(const t of (e===25?[19,20,25]:[18,19,20])){await sl(W);x(t,1)}await sl(4200)}],
    shanghai:[async()=>{start(2);for(const m of [1,2,1]){await sl(W);x(1,m)}await sl(1800)},
      async()=>{start(2);XG.round=3;rx();await sl(W);x(3,1);await sl(W);x(3,2);await sl(W);x(3,3);await sl(4200)},
      async()=>{start(2);XG.round=XG.shr;XG.players[0].rem=80;XG.players[1].rem=74;rx();for(const t of [XG.shr,XG.shr,0]){await sl(W);x(t,1)}await sl(1600);for(let i=0;i<3;i++){await sl(W*.7);x(0,1)}await sl(4200)}],
    halveit:[async()=>{start(2);for(let i=0;i<3;i++){await sl(W);hiHit()}await sl(2600)},
      async()=>{start(2);XG.players[0].rem=120;rx();for(let i=0;i<(XG.hid||3);i++){await sl(W);x(0,1)}await sl(3000)},
      async()=>{start(2);XG.round=XG.hiseq.length;XG.players[0].rem=180;XG.players[1].rem=150;rx();for(let i=0;i<(XG.hid||3);i++){await sl(W);hiHit()}await sl(1600);for(let i=0;i<(XG.hid||3);i++){await sl(W*.7);x(0,1)}await sl(4200)}]};
  /* démos de l'écran « Nouvelle partie » (lf-416) : plusieurs situations du jeu à la suite, avec les vrais effets */
  const tap=e=>{if(!e)return;try{e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))}catch(x){}e.click()};
  const arm=m=>{const b=$(m===3?'b3':'b2');if(b)b.click()},spew=()=>$('bS').click();
  const cn=t=>{const RR=(0,eval)('R');return RR&&RR.num&&RR.num[t]};   /* R global de l'appli (masqué ici par le R de ce fichier) */
  const D={
    cricket:async()=>{start(2);await sl(700);
      tap(cn(20));await sl(W);arm(3);await sl(500);tap(cn(20));await sl(W);spew();await sl(1500);
      tap(cn(19));await sl(W);arm(2);await sl(450);tap(cn(19));await sl(W);tap(cn(25));await sl(1500);
      arm(3);await sl(450);tap(cn(20));await sl(W);tap(cn(18));await sl(W);arm(2);await sl(450);tap(cn(18));await sl(2200)},
    x01:async()=>{start(2);await sl(700);
      x(20,3);await sl(W*.8);x(20,1);await sl(W*.8);x(5,1);await sl(1300);
      x(19,1);await sl(W*.8);x(19,3);await sl(W*.8);x(0,1);await sl(1300);
      x(20,3);await sl(W*.8);x(20,3);await sl(W*.8);x(1,1);await sl(1300);
      x(16,2);await sl(W*.8);x(12,1);await sl(W*.8);x(25,2);await sl(2000)},
    killer:async()=>{start(3);await sl(700);
      kk(20);await sl(W);kk(20,2);await sl(1400);
      kk(19);await sl(W);kk(4);await sl(W);kk(19);await sl(1300);
      kk(18);await sl(W);kk(18,2);await sl(1300);
      kk(19);await sl(W);kk(18);await sl(W);kk(19,2);await sl(2200)},
    clock:async()=>{start(2);await sl(700);
      x(1,1);await sl(W*.8);x(2,1);await sl(W*.8);x(3,XG.clkm?2:1);await sl(1300);
      x(1,1);await sl(W*.8);x(0,1);await sl(W*.8);x(2,1);await sl(1300);
      x(XG.players[0].tgt||4,1);await sl(W*.8);x(XG.players[0].tgt||5,3);await sl(W*.8);x(XG.players[0].tgt||6,1);await sl(2200)},
    shanghai:async()=>{start(2);await sl(700);
      x(1,1);await sl(W*.8);x(1,2);await sl(W*.8);x(0,1);await sl(1300);
      x(1,3);await sl(W*.8);x(1,1);await sl(W*.8);x(1,1);await sl(1300);
      x(2,1);await sl(W*.8);x(2,2);await sl(W*.8);x(2,3);await sl(3200)},
    halveit:async()=>{start(2);await sl(700);
      hiHit();await sl(W*.8);hiHit();await sl(W*.8);x(0,1);await sl(1300);
      hiHit();await sl(W*.8);hiHit();await sl(W*.8);hiHit();await sl(1300);
      for(let i=0;i<(XG.hid||3);i++){x(0,1);await sl(W*.8)}await sl(2400)}};
  const run=st==='d'?(D[g]||D.cricket):((S3[g]||S3.cricket)[k]||S3.cricket[0]);
  (async()=>{await sl(400);for(;;){try{await run()}catch(e){console.warn(e);await sl(1500)}}})();
  document.querySelectorAll('footer,#fbar2,#fbar3').forEach(f=>f.style.setProperty('visibility','hidden','important'));
  document.head.append(el('style','',`html.embed .toastx,html.embed #sync,html.embed #win button,html.embed #win #wBet,html.embed #win #wExtra{display:none!important}html.embed body{pointer-events:none}`));
})();return}

const SU=$('setup'),R=$('gRules');if(!SU||!R)return;
const ill=el('div','gill');ill.id='gIll';R.before(ill);   /* l'emblème au-dessus, « Le but » en dessous */
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

/* ===== emblèmes animés (lf-413) : couleurs opaques, DA « bulle » (contour noir, la couleur déborde), animations vives et rebondies ===== */
const ACC='var(--accent)',INK='var(--ol,#111)',RED='#ff2d3a',GOLD='#ffc21a',SILV='#cfd6de',SUN='#ffd21f';
/* bulle : la couleur déborde un peu du contour noir */
const bub=(cx,cy,r,f,cls)=>`<g class="${cls||''}"><circle cx="${cx}" cy="${cy}" r="${r+4}" fill="${f}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="${INK}" stroke-width="3.5"/></g>`;
const capR=(x,y,w,h,f,cls)=>`<g class="${cls||''}"><rect x="${x-4}" y="${y-4}" width="${w+8}" height="${h+8}" rx="${(h+8)/2}" fill="${f}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${f}" stroke="${INK}" stroke-width="3.5"/></g>`;
const tx=(x,y,sz,t,f,cls)=>`<text class="${cls||''}" x="${x}" y="${y}" text-anchor="middle" font-family="Fun" font-size="${sz}" fill="${f||'#fff'}" stroke="${INK}" stroke-width="${(sz*.17).toFixed(1)}" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
/* la fléchette = la croix de l'appli */
const cross=(x,y,s,cls,st)=>`<g transform="translate(${(+x).toFixed(1)} ${(+y).toFixed(1)})"><g class="afx ${cls||''}" style="${st||''}"><path d="M${-s} ${-s}L${s} ${s}M${s} ${-s}L${-s} ${s}" stroke="${INK}" stroke-width="${(s*.42).toFixed(1)}" stroke-linecap="round"/></g></g>`;
/* éclat : 8 rayons jaunes contour noir */
const burst=(cx,cy,r,cls,st)=>`<g class="afb ${cls||''}" style="${st||''}">${Array.from({length:8},(_,k)=>{const a=k/8*2*Math.PI+.2,x1=cx+r*.55*Math.cos(a),y1=cy+r*.55*Math.sin(a),x2=cx+r*Math.cos(a),y2=cy+r*Math.sin(a);
  return`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/><path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${k%2?SUN:ACC}" stroke-width="3.5" stroke-linecap="round"/>`}).join('')}</g>`;
/* vraie fléchette illustrée : pointe en (x,y), corps vers le haut à droite, empennage à la couleur f */
const dart=(x,y,k,cls,st,f)=>`<g transform="translate(${(+x).toFixed(1)} ${(+y).toFixed(1)}) scale(${k||1})"><g class="afd ${cls||''}" style="${st||''}"><g transform="rotate(-38)">
  <path d="M0 0L9 0" stroke="#8a8f96" stroke-width="2.6" stroke-linecap="round"/><rect x="8" y="-3.6" width="15" height="7.2" rx="3" fill="#3a3f46" stroke="${INK}" stroke-width="2"/><path d="M11 -3.6V3.6M14.5 -3.6V3.6M18 -3.6V3.6" stroke="#8a8f96" stroke-width="1.2"/>
  <rect x="22" y="-1.8" width="10" height="3.6" rx="1.5" fill="#fff" stroke="${INK}" stroke-width="1.6"/><path d="M30 0L37 -10L45 -10L41 0L45 10L37 10Z" fill="${f||ACC}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></g></g></g>`;
/* étincelles qui scintillent */
const spark=(x,y,r,d,c)=>`<path class="afsp" style="animation-delay:${d}s" d="M${x} ${y-r}Q${x+r*.18} ${y-r*.18} ${x+r} ${y}Q${x+r*.18} ${y+r*.18} ${x} ${y+r}Q${x-r*.18} ${y+r*.18} ${x-r} ${y}Q${x-r*.18} ${y-r*.18} ${x} ${y-r}Z" fill="${c||SUN}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
const shadow=(cx,cy,rx,cls)=>`<ellipse class="${cls||''}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${(rx*.16).toFixed(1)}" fill="#e6dcc4"/>`;
/* cible illustrée (ordre officiel des secteurs), anneaux rouge / vert */
const BOARD=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
function board(cx,cy,R){const P=(a,r)=>[(cx+r*Math.sin(a)).toFixed(1),(cy-r*Math.cos(a)).toFixed(1)];let o=`<circle cx="${cx}" cy="${cy}" r="${R+7}" fill="#1b1b1b" stroke="${INK}" stroke-width="3"/>`;
  const ring=(r0,r1,c0,c1)=>BOARD.map((_,i)=>{const a0=(i-.5)/20*2*Math.PI,a1=(i+.5)/20*2*Math.PI,[x0,y0]=P(a0,r1),[x1,y1]=P(a1,r1),[x2,y2]=P(a1,r0),[x3,y3]=P(a0,r0);
    return`<path d="M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z" fill="${i%2?c1:c0}"/>`}).join('');
  o+=ring(R*.1,R*.58,'#f3e7c9','#1f1f1f')+ring(R*.58,R*.66,RED,'#2bb24c')+ring(R*.66,R*.92,'#f3e7c9','#1f1f1f')+ring(R*.92,R,RED,'#2bb24c');
  o+=`<circle cx="${cx}" cy="${cy}" r="${R*.1}" fill="#2bb24c"/><circle cx="${cx}" cy="${cy}" r="${R*.045}" fill="${RED}"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="1.5"/>`;return o}
const dPos=(cx,cy,R,n,m)=>{const i=n===25?-1:BOARD.indexOf(n),a=i<0?0:i/20*2*Math.PI+(Math.random()-.5)*.25,r=n===25?R*.04:m===3?R*.62:m===2?R*.96:(Math.random()<.5?R*.36:R*.8);return[cx+r*Math.sin(a),cy-r*Math.cos(a)]};
const conf=(cx,cy,n,cls)=>Array.from({length:n},(_,k)=>{const a=k/n*2*Math.PI,c=[SUN,ACC,'#2bd9ff','#ff4dff','#2bff7a'][k%5];return`<rect class="afcf ${cls||''}" x="${cx-4}" y="${cy-3}" width="8" height="6" rx="1.5" fill="${c}" stroke="${INK}" stroke-width="1.5" style="--dx:${(Math.cos(a)*70).toFixed(0)}px;--dy:${(Math.sin(a)*52-14).toFixed(0)}px;--r:${(k*67)%360}deg"/>`}).join('');
const HEART='M50 90C22 70 4 52 4 31C4 15 16 4 30 4C40 4 47 10 50 18C53 10 60 4 70 4C84 4 96 15 96 31C96 52 78 70 50 90Z';
const ZIG='50,18 43,36 55,49 45,63 53,76 50,90';
const heart=(f)=>`<path d="${HEART}" fill="${f}" stroke="${f}" stroke-width="11" stroke-linejoin="round"/><path d="${HEART}" fill="${f}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
function illHtml(){const g=S.game||'cricket',P1=PC(0);
  if(g==='cricket')/* 3 fléchettes : / puis X puis ⊗ dans la case, la bulle encaisse chaque coup, puis le 20 est fermé : bulle dorée + couronne */
    return`<svg class="aff afck" viewBox="0 0 240 180">${shadow(78,158,44)}${spark(22,40,9,0)}${spark(140,30,7,.7,'#2bd9ff')}${spark(226,150,8,1.3,'#ff4dff')}
      <g class="ckB">${bub(78,100,46,ACC)}${bub(78,100,46,GOLD,'ckG')}${tx(78,118,50,'20')}</g>
      ${capR(140,76,84,48,'#fff','ckC')}
      <g class="ckM m1"><path d="M166 112L198 88" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g>
      <g class="ckM m2"><path d="M166 88L198 112" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g>
      <g class="ckM m3"><circle cx="182" cy="100" r="19" fill="none" stroke="${INK}" stroke-width="6"/></g>
      ${dart(182,100,1.15,'ckD d1')}${dart(182,100,1.15,'ckD d2')}${dart(182,100,1.15,'ckD d3')}
      ${burst(182,100,40,'b1')}${burst(182,100,40,'b2')}${burst(182,100,40,'b3')}
      <g class="ckCr"><path d="M54 52L60 28L71 41L78 22L85 41L96 28L102 52Z" fill="${GOLD}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>${conf(78,70,10,'ckF')}</svg>`;
  if(g==='x01')return x01Html();
  if(g==='killer'){/* le viseur fond sur le cœur, se cale, BANG : le cœur explose en éclats ; puis il repousse */
    const sh=Array.from({length:10},(_,k)=>{const a=k/10*2*Math.PI+.3,d=60+(k%3)*22,x=186+Math.cos(a)*10,y=86+Math.sin(a)*10,z=7+(k%3)*3;
      return`<polygon class="klS" points="${x},${y-z} ${x+z*.9},${y+z*.6} ${x-z*.8},${y+z*.5}" fill="${k%4?RED:'#ff8a8a'}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" style="--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d*.8).toFixed(0)}px;--r:${(k*77)%360-180}deg"/>`}).join('');
    return`<svg class="aff afkl" viewBox="0 0 250 180">${shadow(186,160,40,'klSh')}${spark(30,150,8,.4)}${spark(110,24,7,1.1,'#2bd9ff')}
      <g class="klH"><g transform="translate(150 50) scale(.72)">${heart(RED)}<path d="M28 26Q34 16 44 18" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".85"/></g></g>
      ${[0,1,2].map(k=>`<circle class="klP p${k}" cx="${186+[-18,16,2][k]}" cy="${86+[6,10,-14][k]}" r="${[16,13,12][k]}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`).join('')}
      ${burst(186,86,66,'klB')}${sh}
      <g class="afscope"><circle cx="186" cy="86" r="40" fill="none" stroke="${INK}" stroke-width="13"/><circle cx="186" cy="86" r="40" fill="none" stroke="${ACC}" stroke-width="7"/>
        <path d="M186 34V62M186 110V138M134 86H162M210 86H238" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="186" cy="86" r="5" fill="${INK}"/></g>
      <g class="klBang">${tx(70,72,34,'BANG','#fff')}</g></svg>`}
  if(g==='clock'){/* l'aiguille saute de cible en cible ; chaque cible touchée s'allume */
    const dots=Array.from({length:20},(_,i)=>{const a=i/20*2*Math.PI-Math.PI/2,x=(120+50*Math.cos(a)).toFixed(1),y=(92+50*Math.sin(a)).toFixed(1);return`<circle class="cd${i>=1&&i<=5?' c'+i:''}" cx="${x}" cy="${y}" r="${i>=1&&i<=5?6:4}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`}).join('');
    return`<svg class="aff afclk" viewBox="0 0 240 180">${shadow(120,166,54)}${spark(36,36,9,0)}${spark(206,140,8,.9,'#2bff7a')}${bub(120,92,64,ACC)}<circle cx="120" cy="92" r="58" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>${dots}
      <g class="afhand"><path d="M120 92L120 40" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M120 92L120 40" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>${bub(120,92,8,SUN)}</svg>`}
  if(g==='shanghai')/* simple, double, triple du même numéro dans la volée → SHANGHAI ! victoire immédiate */
    return`<svg class="aff afsh2" viewBox="0 0 240 180">${shadow(120,166,104)}${spark(24,30,8,.2,'#2bd9ff')}${spark(216,24,9,1,'#ff4dff')}
      <g class="shC c1">${capR(18,104,60,42,ACC)}${tx(48,135,24,'×1')}</g>
      <g class="shC c2">${capR(90,104,60,42,SILV)}${tx(120,135,24,'×2')}</g>
      <g class="shC c3">${capR(162,104,60,42,GOLD)}${tx(192,135,24,'×3')}</g>
      ${dart(56,112,1,'shD d1')}${dart(128,112,1,'shD d2')}${dart(200,112,1,'shD d3')}
      <g class="shStar"><polygon points="${Array.from({length:24},(_,k)=>{const a=k/24*2*Math.PI,r=k%2?44:62;return(120+r*Math.cos(a)*1.45).toFixed(1)+','+(54+r*Math.sin(a)*.72).toFixed(1)}).join(' ')}" fill="${SUN}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>${tx(120,63,25,'SHANGHAI !')}</g>
      ${conf(120,54,12,'shF')}</svg>`;
  /* halve-it : raté → la lame tombe, la bulle se coupe, et revient deux fois plus petite (64 → 32) */
  return`<svg class="aff afhi" viewBox="0 0 240 180">${shadow(120,166,56,'hiSh')}${spark(30,36,8,.3)}<defs><clipPath id="afcl"><rect x="0" y="0" width="120" height="180"/></clipPath><clipPath id="afcr"><rect x="120" y="0" width="120" height="180"/></clipPath></defs>
    <g class="afwhole"><g class="afh2 l" clip-path="url(#afcl)">${bub(120,96,58,ACC)}</g><g class="afh2 r" clip-path="url(#afcr)">${bub(120,96,58,ACC)}</g>${tx(120,116,52,'64','#fff','hiA')}${tx(120,116,52,'32','#fff','hiB')}</g>
    ${dart(200,156,1.1,'hiD')}<g class="hiNo">${tx(206,128,20,'RATÉ',RED)}</g>
    <g class="afblade"><path d="M120 6V186" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M120 6V186" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
    <g class="afdiv">${capR(168,16,58,34,INK)}${tx(197,41,22,'÷2')}</g></svg>`}
/* 501 : vraie cible ; 4 volées de 3 fléchettes lancées vite ; chaque fléchette s'affiche comme dans le jeu (pastille blanche, D argent, T dorée) et le score descend */
const rdart=()=>{const r=Math.random(),m=r<.68?1:r<.84?3:2,n=m===3?[20,20,19,18,17,20][Math.floor(Math.random()*6)]:Math.random()<.06?25:1+Math.floor(Math.random()*20);return{m:n===25&&m===3?1:m,n}};
function x01Html(){const st=S.xstart||501,V=4,D=.36,G=.75,BX=66,BY=92,BR=56;let sc=st,t0=.35;const H=[];
  for(let v=0;v<V;v++){for(let k=0;k<3;k++){let d=rdart(),val=d.m*d.n;if(sc-val<40){d={m:1,n:1+Math.floor(Math.random()*5)};val=d.n}sc-=val;H.push({...d,val,t:t0+k*D,v,k,sc,lab:d.n===25?(d.m===2?'BULL':'25'):(d.m===3?'T':d.m===2?'D':'')+d.n})}t0+=3*D+G}
  H.forEach(h=>h.p=dPos(BX,BY,BR,h.n,h.m));
  const T=+(t0+.2).toFixed(2),vEnd=v=>H[v*3+2].t+G-.12,L=String(st).length,fs=L>3?34:40,cx=188,cy=60,cw=fs*.62*L+34,ch=fs+14;
  const land=(t,te)=>{const a=+pc(t-.12,T),b=+pc(t,T),e=+pc(te,T);return`animation:${kf(`gd${a.toFixed(1)}_${e.toFixed(1)}`.replace(/\./g,'_'),`0%,${a}%{opacity:0;transform:translate(70px,-70px) rotate(-25deg) scale(1.4)}${b}%{opacity:1;transform:none}${(b+1).toFixed(2)}%{transform:rotate(-7deg)}${(b+2).toFixed(2)}%{transform:rotate(5deg)}${(b+3).toFixed(2)}%{transform:rotate(-2deg)}${(b+4).toFixed(2)}%,${e}%{opacity:1;transform:none}${Math.min(100,e+2).toFixed(2)}%,100%{opacity:0;transform:translate(0,-20px)}`)} ${T}s linear infinite`};
  const pill=(h)=>{const f=h.m===3?'url(#afpt)':h.m===2?'url(#afpd)':'#fff',x=cx-66+h.k*44;return`<g style="${win(h.t,vEnd(h.v),T)}"><rect x="${x}" y="108" width="40" height="24" rx="12" fill="${f}" stroke="${INK}" stroke-width="2"/><text x="${x+20}" y="125" text-anchor="middle" font-family="Fun" font-size="${h.lab.length>3?11:14}" fill="#1d1d1d">${h.lab}</text></g>`};
  const scs=[{sc:st,t:0},...H.map(h=>({sc:h.sc,t:h.t}))];
  return`<svg class="aff afx01" viewBox="0 0 250 180"><defs><linearGradient id="afpt" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#ffe07a"/><stop offset=".5" stop-color="#f2bd1a"/><stop offset="1" stop-color="#cf9300"/></linearGradient>
      <linearGradient id="afpd" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#e3e7ec"/><stop offset=".5" stop-color="#bfc6ce"/><stop offset="1" stop-color="#9ea7b1"/></linearGradient></defs>
    ${shadow(BX,166,52)}${board(BX,BY,BR)}${spark(140,150,7,.5)}${spark(236,20,8,1.2,'#2bd9ff')}
    <g style="${bump(H.map(h=>h.t),T)}">${capR(cx-cw/2,cy-ch/2,cw,ch,ACC)}${scs.map((o,k)=>`<g style="${win(o.t,k<scs.length-1?scs[k+1].t:T-.25,T)}">${tx(cx,cy+fs*.36,fs,o.sc)}</g>`).join('')}</g>
    ${[0,1,2].map(k=>`<rect x="${cx-66+k*44}" y="108" width="40" height="24" rx="12" fill="#efe6d2" stroke="#cfc3a8" stroke-width="1.5"/>`).join('')}
    ${H.map(pill).join('')}
    ${H.map(h=>{const[x,y]=h.p;return dart(x,y,.78,'',land(h.t,vEnd(h.v)),PC(0))}).join('')}
    ${H.filter(h=>h.m>1).map(h=>{const[x,y]=h.p;const a=+pc(h.t,T);return burst(x,y,22,'',`animation:${kf('gx'+a.toFixed(0),`0%,${a}%{opacity:0;transform:scale(.3)}${(a+1).toFixed(2)}%{opacity:1}${(a+7).toFixed(2)}%{opacity:0;transform:scale(1.5)}100%{opacity:0}`)} ${T}s linear infinite`)}).join('')}
    <rect class="afclock" width="1" height="1" fill="none" style="animation:gtick ${T}s linear infinite"/></svg>`}
kf('gtick','0%,100%{opacity:0}');

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
    <div class="rpages">${P.map(p=>`<section><div class="gfr"></div><h3>${esc(p.cap)}</h3><p>${esc(p.txt)}</p></section>`).join('')}<section class="rall"><p class="rgoal2">${TXT.goal}</p>${TXT.ps.map(x=>`<p>${x}</p>`).join('')}</section></div>`;
  document.body.append(o);requestAnimationFrame(()=>o.classList.add('on'));SFX.open();
  const box=q(o,'.rpages'),tabs=[...o.querySelectorAll('.rtabs button')],secs=[...o.querySelectorAll('.rpages section')];
  let cur=0;const mark=()=>tabs.forEach((t,i)=>t.classList.toggle('on',i===cur));mark();
  box.addEventListener('scroll',()=>{const k=Math.round(box.scrollLeft/box.clientWidth);if(k!==cur){cur=k;mark();const t=tabs[k];if(t)t.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}},{passive:true});
  o.addEventListener('click',e=>{if(e.target.closest('[data-x]')){GEN++;o.classList.remove('on');setTimeout(()=>o.remove(),300);SFX.back();return}
    const t=e.target.closest('[data-t]');if(t){haptic();box.scrollTo({left:+t.dataset.t*box.clientWidth,behavior:'smooth'})}});
  /* l'onglet affiché fait tourner la vraie partie dans une petite fenêtre (un seul à la fois) */
  const VW=393,VH=720,VC=612,fit=f=>{const b=f.parentNode,k=b.clientHeight/VC;   /* la barre du bas (masquée) est hors cadre */
  f.style.transform=`scale(${k})`;if(k>0)b.style.width=Math.round(VW*k)+'px'};
  const show=()=>{secs.forEach((sc,i)=>{const b=q(sc,'.gfr');if(!b)return;if(i===cur){if(!q(b,'iframe')){const f=document.createElement('iframe');f.src='index.html?scene='+S.game+':'+i;f.setAttribute('tabindex','-1');f.style.width=VW+'px';f.style.height=VH+'px';b.append(f);fit(f);requestAnimationFrame(()=>fit(f));f.onload=()=>fit(f)}}else b.innerHTML=''})};
  show();box.addEventListener('scroll',()=>{clearTimeout(box._t);box._t=setTimeout(show,180)},{passive:true});
  addEventListener('resize',()=>o.querySelectorAll('.gfr iframe').forEach(fit))}

/* ---------- « Le but » + « Plus d'infos » ---------- */
let LAST='';
const _sr=showRules;showRules=function(){const r=_sr.apply(this,arguments);
  const g=R.querySelector(':scope>.rgoal');TXT={goal:g?g.innerHTML:'',ps:[...R.querySelectorAll(':scope>.rp')].map(x=>x.innerHTML)};
  R.innerHTML=(g?g.outerHTML:'')+'<button class="rmore">Plus d’infos ›</button>';R.style.minHeight='';
  const key=[S.game,S.mode,S.xstart,S.klives,S.hiseq&&S.hiseq.join(),(S.names||[]).slice(0,3).join(),ROSTER.map(x=>x.color).join()].join('|');
  if(key!==LAST){LAST=key;demo()}return r};
/* lf-416 : l'emblème = une vraie démo du jeu (l'appli joue toute seule dans une fenêtre, avec ses vrais écrans et effets), cadrée sur la zone utile */
const CROP={cricket:[0,470],x01:[6,490],killer:[0,540],clock:[0,620],shanghai:[0,470],halveit:[0,470]};
function demoOn(){return SU.classList.contains('on')&&!SU.classList.contains('p2')}
function demo(){if(!demoOn()){ill.innerHTML='';return}const g=S.game||'cricket';ill.innerHTML=`<div class="gdemo"><iframe tabindex="-1" aria-hidden="true" src="index.html?scene=${g}:d"></iframe></div>`;
  const f=ill.querySelector('iframe');f.onload=fitDemo;fitDemo();requestAnimationFrame(fitDemo)}
function fitDemo(){const b=ill.querySelector('.gdemo'),f=b&&b.querySelector('iframe');if(!f)return;const[y0,h]=CROP[S.game]||CROP.cricket,W=ill.clientWidth,H=ill.clientHeight;if(!W||!H)return;
  const k=Math.min(W/393,H/h);b.style.width=Math.round(393*k)+'px';b.style.height=Math.round(h*k)+'px';f.style.transform=`translateY(${(-y0*k).toFixed(1)}px) scale(${k.toFixed(4)})`}
addEventListener('resize',fitDemo);
/* la démo ne tourne que sur la page 1 visible */
new MutationObserver(()=>{const has=!!ill.querySelector('iframe');if(demoOn()&&!has)demo();else if(!demoOn()&&has)ill.innerHTML=''}).observe(SU,{attributes:true,attributeFilter:['class']});
   /* 501 : nouvelles fléchettes à chaque tour */
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

/* emblèmes animés */
/* démo du jeu (page 1) */
#setup .gill .gdemo{position:relative;margin:0 auto;overflow:hidden;border-radius:22px;-webkit-mask-image:linear-gradient(to bottom,#000 86%,transparent);mask-image:linear-gradient(to bottom,#000 86%,transparent)}
#setup .gill .gdemo iframe{position:absolute;left:0;top:0;width:393px;height:720px;border:0;transform-origin:0 0;pointer-events:none;background:transparent}
#setup .gill{height:clamp(150px,22vh,190px);margin:12px 0 6px}
.aff{width:100%;height:100%;overflow:visible}
.aff g,.aff path,.aff circle,.aff rect,.aff text,.aff polygon{transform-box:fill-box;transform-origin:center}
.aff *{animation-timing-function:cubic-bezier(.3,1.5,.5,1)}
.aff .afb{opacity:0}
/* cricket */
.afck .ckB{animation:ckSq 4.8s infinite}
@keyframes ckSq{0%,13%{transform:scale(1)}15%{transform:scale(1.16,.84)}19%{transform:scale(.94,1.06)}23%,31%{transform:scale(1)}33%{transform:scale(1.16,.84)}37%{transform:scale(.94,1.06)}41%,49%{transform:scale(1)}51%{transform:scale(1.2,.8)}55%{transform:scale(.92,1.08)}59%,100%{transform:scale(1)}}
.afck .ckG{opacity:0;animation:ckGo 4.8s infinite}
@keyframes ckGo{0%,55%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.15)}64%,92%{opacity:1;transform:scale(1)}96%,100%{opacity:0}}
.afck .ckC{animation:ckCs 4.8s infinite}
@keyframes ckCs{0%,14%{transform:none}16%{transform:scale(1.08,.9)}20%,32%{transform:none}34%{transform:scale(1.08,.9)}38%,50%{transform:none}52%{transform:scale(1.1,.88)}56%,100%{transform:none}}
.afck .ckM{opacity:0}.afck .m1{animation:ckS1 4.8s infinite}.afck .m2{animation:ckS2 4.8s infinite}.afck .m3{animation:ckS3 4.8s infinite}
@keyframes ckS1{0%,13%{opacity:0;transform:scale(2.4)}15%{opacity:1;transform:scale(.85)}18%{transform:scale(1.1)}21%,92%{opacity:1;transform:scale(1)}96%,100%{opacity:0}}
@keyframes ckS2{0%,31%{opacity:0;transform:scale(2.4)}33%{opacity:1;transform:scale(.85)}36%{transform:scale(1.1)}39%,92%{opacity:1;transform:scale(1)}96%,100%{opacity:0}}
@keyframes ckS3{0%,49%{opacity:0;transform:scale(2.4)}51%{opacity:1;transform:scale(.85)}54%{transform:scale(1.12)}57%,92%{opacity:1;transform:scale(1)}96%,100%{opacity:0}}
.afck .ckD{opacity:0}.afck .d1{animation:ckD1 4.8s infinite}.afck .d2{animation:ckD2 4.8s infinite}.afck .d3{animation:ckD3 4.8s infinite}
@keyframes ckD1{0%,6%{opacity:0;transform:translate(60px,-70px) scale(1.6) rotate(-50deg)}13%{opacity:1;transform:none}15%,100%{opacity:0;transform:none}}
@keyframes ckD2{0%,24%{opacity:0;transform:translate(60px,-70px) scale(1.6) rotate(-50deg)}31%{opacity:1;transform:none}33%,100%{opacity:0;transform:none}}
@keyframes ckD3{0%,42%{opacity:0;transform:translate(60px,-70px) scale(1.6) rotate(-50deg)}49%{opacity:1;transform:none}51%,100%{opacity:0;transform:none}}
.afck .b1{animation:afB1 4.8s infinite}.afck .b2{animation:afB2 4.8s infinite}.afck .b3{animation:afB3 4.8s infinite}
@keyframes afB1{0%,14%{opacity:0;transform:scale(.3)}15%{opacity:1}24%,100%{opacity:0;transform:scale(1.35)}}
@keyframes afB2{0%,32%{opacity:0;transform:scale(.3)}33%{opacity:1}42%,100%{opacity:0;transform:scale(1.35)}}
@keyframes afB3{0%,50%{opacity:0;transform:scale(.3)}51%{opacity:1}62%,100%{opacity:0;transform:scale(1.5)}}
.afck .ckCr{opacity:0;animation:ckCr 4.8s infinite}
@keyframes ckCr{0%,57%{opacity:0;transform:translateY(-70px) rotate(-20deg)}63%{opacity:1;transform:translateY(6px) scale(1.15,.8) rotate(-8deg)}67%{transform:translateY(-8px) rotate(-12deg)}71%,92%{opacity:1;transform:rotate(-10deg)}96%,100%{opacity:0;transform:rotate(-10deg)}}
.aff .afcf{opacity:0}
.afck .ckF{animation:afCf 4.8s infinite}
@keyframes afCf{0%,60%{opacity:0;transform:none}62%{opacity:1}80%{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}88%,100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 30px)) rotate(var(--r))}}
/* killer : le cœur explose */
.afkl .afscope{animation:afScope 4.4s infinite}
@keyframes afScope{0%{transform:translate(-160px,50px) rotate(-90deg);opacity:0}8%{opacity:1}24%{transform:translate(-26px,-22px) rotate(-10deg)}33%{transform:translate(10px,9px) rotate(6deg)}40%,46%{transform:none}49%{transform:scale(.8)}53%{transform:scale(1.15)}57%{opacity:1;transform:scale(1)}63%,100%{transform:scale(1.4);opacity:0}}
.afkl .klH{animation:klH 4.4s infinite}
@keyframes klH{0%,44%{transform:scale(1);opacity:1}47%{transform:scale(1.12,.9);opacity:1}49%{transform:scale(1.3);opacity:1}50%,84%{transform:scale(0);opacity:0}88%{transform:scale(1.25);opacity:1}92%{transform:scale(.92)}96%,100%{transform:scale(1);opacity:1}}
.afkl .klSh{animation:klSh 4.4s infinite}
@keyframes klSh{0%,49%{transform:scale(1)}51%,84%{transform:scale(.3)}90%,100%{transform:scale(1)}}
.afkl .klS{opacity:0;animation:klS 4.4s infinite;animation-timing-function:cubic-bezier(.15,.7,.3,1)}
@keyframes klS{0%,49%{opacity:0;transform:none}50%{opacity:1;transform:scale(1.2)}72%{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}80%,100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 26px)) rotate(var(--r))}}
.afkl .klP{opacity:0;animation:klP 4.4s infinite}.afkl .p1{animation-delay:.05s}.afkl .p2{animation-delay:.1s}
@keyframes klP{0%,49%{opacity:0;transform:scale(.2)}52%{opacity:1;transform:scale(1.1)}64%{opacity:1;transform:scale(1.5)}72%,100%{opacity:0;transform:scale(1.8)}}
.afkl .klB{animation:klB 4.4s infinite}
@keyframes klB{0%,48%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(.8)}62%,100%{opacity:0;transform:scale(1.5)}}
.afkl .klBang{opacity:0;animation:klBg 4.4s infinite}
@keyframes klBg{0%,48%{opacity:0;transform:scale(.3) rotate(-14deg)}52%{opacity:1;transform:scale(1.3) rotate(-8deg)}56%,72%{opacity:1;transform:scale(1) rotate(-8deg)}78%,100%{opacity:0;transform:scale(.6) rotate(-8deg)}}
/* étincelles */
.aff .afsp{animation:afSp 2.4s infinite}
@keyframes afSp{0%,100%{transform:scale(.3) rotate(0);opacity:0}15%{transform:scale(1.25) rotate(25deg);opacity:1}30%{transform:scale(1) rotate(45deg);opacity:1}55%{transform:scale(.4) rotate(90deg);opacity:0}}
/* horloge : 5 sauts d'aiguille, chaque cible s'allume */
.afclk .afhand{transform-box:view-box;transform-origin:120px 92px;animation:afHand 4.8s infinite}
@keyframes afHand{0%,6%{transform:rotate(0)}10%{transform:rotate(24deg)}13%,20%{transform:rotate(18deg)}24%{transform:rotate(42deg)}27%,34%{transform:rotate(36deg)}38%{transform:rotate(60deg)}41%,48%{transform:rotate(54deg)}52%{transform:rotate(78deg)}55%,62%{transform:rotate(72deg)}66%{transform:rotate(96deg)}69%,86%{transform:rotate(90deg)}92%,100%{transform:rotate(360deg)}}
.afclk .c1{animation:cOn1 4.8s infinite}.afclk .c2{animation:cOn2 4.8s infinite}.afclk .c3{animation:cOn3 4.8s infinite}.afclk .c4{animation:cOn4 4.8s infinite}.afclk .c5{animation:cOn5 4.8s infinite}
@keyframes cOn1{0%,10%{fill:#fff;transform:scale(1)}12%{fill:#ffd21f;transform:scale(1.9)}16%,88%{fill:#ffd21f;transform:scale(1.25)}92%,100%{fill:#fff;transform:scale(1)}}
@keyframes cOn2{0%,24%{fill:#fff;transform:scale(1)}26%{fill:#ffd21f;transform:scale(1.9)}30%,88%{fill:#ffd21f;transform:scale(1.25)}92%,100%{fill:#fff;transform:scale(1)}}
@keyframes cOn3{0%,38%{fill:#fff;transform:scale(1)}40%{fill:#ffd21f;transform:scale(1.9)}44%,88%{fill:#ffd21f;transform:scale(1.25)}92%,100%{fill:#fff;transform:scale(1)}}
@keyframes cOn4{0%,52%{fill:#fff;transform:scale(1)}54%{fill:#ffd21f;transform:scale(1.9)}58%,88%{fill:#ffd21f;transform:scale(1.25)}92%,100%{fill:#fff;transform:scale(1)}}
@keyframes cOn5{0%,66%{fill:#fff;transform:scale(1)}68%{fill:#ffd21f;transform:scale(1.9)}72%,88%{fill:#ffd21f;transform:scale(1.25)}92%,100%{fill:#fff;transform:scale(1)}}
/* shanghai : ×1, ×2, ×3 touchés → les trois sautent et SHANGHAI ! explose */
.afsh2 .shC{animation:shC 4.8s infinite}.afsh2 .c2{animation-name:shC2}.afsh2 .c3{animation-name:shC3}
@keyframes shC{0%,12%{transform:none}14%{transform:scale(1.15,.85)}18%,56%{transform:none}60%{transform:translateY(-16px)}64%{transform:translateY(4px) scale(1.05,.95)}68%,100%{transform:none}}
@keyframes shC2{0%,28%{transform:none}30%{transform:scale(1.15,.85)}34%,58%{transform:none}62%{transform:translateY(-16px)}66%{transform:translateY(4px) scale(1.05,.95)}70%,100%{transform:none}}
@keyframes shC3{0%,44%{transform:none}46%{transform:scale(1.15,.85)}50%,60%{transform:none}64%{transform:translateY(-16px)}68%{transform:translateY(4px) scale(1.05,.95)}72%,100%{transform:none}}
.afsh2 .shD{opacity:0}.afsh2 .d1{animation:shD1 4.8s infinite}.afsh2 .d2{animation:shD2 4.8s infinite}.afsh2 .d3{animation:shD3 4.8s infinite}
@keyframes shD1{0%,7%{opacity:0;transform:translate(40px,-60px) scale(2) rotate(-60deg)}13%{opacity:1;transform:scale(.8)}16%,90%{opacity:1;transform:none}95%,100%{opacity:0}}
@keyframes shD2{0%,23%{opacity:0;transform:translate(40px,-60px) scale(2) rotate(-60deg)}29%{opacity:1;transform:scale(.8)}32%,90%{opacity:1;transform:none}95%,100%{opacity:0}}
@keyframes shD3{0%,39%{opacity:0;transform:translate(40px,-60px) scale(2) rotate(-60deg)}45%{opacity:1;transform:scale(.8)}48%,90%{opacity:1;transform:none}95%,100%{opacity:0}}
.afsh2 .shStar{opacity:0;animation:shSt 4.8s infinite}
@keyframes shSt{0%,62%{opacity:0;transform:scale(.2) rotate(-30deg)}67%{opacity:1;transform:scale(1.2) rotate(6deg)}71%{transform:scale(.95) rotate(-3deg)}75%,90%{opacity:1;transform:scale(1) rotate(0)}95%,100%{opacity:0;transform:scale(.6)}}
.afsh2 .shF{animation:shF 4.8s infinite}
@keyframes shF{0%,64%{opacity:0;transform:none}66%{opacity:1}84%{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}92%,100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 30px)) rotate(var(--r))}}
/* halve-it */
.afhi .hiD{opacity:0;animation:hiD 4.8s infinite}
@keyframes hiD{0%,6%{opacity:0;transform:translate(30px,-80px) scale(2) rotate(-60deg)}13%{opacity:1;transform:scale(.8)}16%{transform:translateX(-5px)}19%{transform:translateX(5px)}22%,40%{opacity:1;transform:none}46%,100%{opacity:0}}
.afhi .hiNo{opacity:0;animation:hiNo 4.8s infinite}
@keyframes hiNo{0%,13%{opacity:0;transform:scale(.3)}17%{opacity:1;transform:scale(1.25) rotate(-6deg)}21%,40%{opacity:1;transform:rotate(-6deg)}46%,100%{opacity:0}}
.afhi .afblade{opacity:0;animation:afBlade 4.8s infinite}
@keyframes afBlade{0%,22%{opacity:0;transform:translateY(-170px)}24%{opacity:1}31%{transform:translateY(0);opacity:1}37%{opacity:0;transform:translateY(24px)}100%{opacity:0}}
.afhi .afh2.l{animation:afSpL 4.8s infinite}.afhi .afh2.r{animation:afSpR 4.8s infinite}
@keyframes afSpL{0%,31%{transform:none}37%,50%{transform:translate(-22px,10px) rotate(-14deg)}57%,100%{transform:none}}
@keyframes afSpR{0%,31%{transform:none}37%,50%{transform:translate(22px,10px) rotate(14deg)}57%,100%{transform:none}}
.afhi .afwhole{transform-box:view-box;transform-origin:120px 96px;animation:afShrink 4.8s infinite}
@keyframes afShrink{0%,54%{transform:scale(1)}58%{transform:scale(.62)}62%,86%{transform:scale(.71)}91%{transform:scale(1.08)}95%,100%{transform:scale(1)}}
.afhi .hiA{animation:hiA 4.8s infinite}.afhi .hiB{opacity:0;animation:hiB 4.8s infinite}
@keyframes hiA{0%,31%{opacity:1}33%,90%{opacity:0}94%,100%{opacity:1}}
@keyframes hiB{0%,56%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.3)}64%,88%{opacity:1;transform:scale(1)}91%,100%{opacity:0}}
.afhi .afdiv{opacity:0;animation:afDiv 4.8s infinite}
@keyframes afDiv{0%,33%{opacity:0;transform:scale(.3) rotate(-20deg)}38%{opacity:1;transform:scale(1.25) rotate(6deg)}42%,84%{opacity:1;transform:rotate(0)}90%,100%{opacity:0}}
/* 501 */
.afx01 .afnum g{opacity:0}
/* écran « Plus d'infos » */
#rinfo{gap:10px;background:var(--page,#f7f2e5)!important}
#rinfo .rtabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;flex:none;padding:2px}#rinfo .rtabs::-webkit-scrollbar{display:none}
#rinfo .rtabs button{flex:none;border:0;border-radius:99px;padding:9px 14px;background:transparent;box-shadow:inset 0 0 0 2px var(--ol,#111);font:400 15px "Fun",sans-serif;color:var(--ink)}
#rinfo .rtabs button.on{background:var(--accent);color:var(--btx,#fff)}
#rinfo .rpages{flex:1;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;min-height:0}#rinfo .rpages::-webkit-scrollbar{display:none}
#rinfo section{flex:0 0 100%;scroll-snap-align:center;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:6px 4px 20px;box-sizing:border-box}
#rinfo .gfr{position:relative;flex:none;align-self:center;height:min(470px,56vh);aspect-ratio:393/612;border-radius:26px;overflow:hidden;box-shadow:0 0 0 2px rgba(0,0,0,.12);background:var(--page,#f7f2e5)}
#rinfo .gfr iframe{position:absolute;left:0;top:0;border:0;transform-origin:0 0;pointer-events:none}
#rinfo .gst{position:relative;flex:none;height:min(300px,40vh);border-radius:24px;background:var(--m-cell,#fff);box-shadow:inset 0 0 0 2.5px var(--ol,#111);display:flex;align-items:center;justify-content:center;overflow:visible}
#rinfo .gst .il{--b:3px;zoom:1.2}
#rinfo h3{margin:4px 2px 0;font:400 22px/1.2 "Fun",sans-serif;color:var(--ink)}
#rinfo section p{margin:0 2px;font:500 16px/1.45 "Lbl",sans-serif;color:var(--ink)}
#rinfo .rall{gap:12px}#rinfo .rgoal2{font-weight:700}#rinfo .rgoal2 i{font-style:normal;color:var(--accent);margin-right:.3em}#rinfo .rgoal2 i::after{content:" :"}
#rinfo .ilfly2{position:absolute;left:0;top:0;z-index:5;font:400 24px "Fun",sans-serif;color:var(--accent);pointer-events:none}
`));
})();
