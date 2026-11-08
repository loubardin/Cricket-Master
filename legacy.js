/* Cricket Master — compatibilité vieux iPad (iOS 12 / Safari 12).
   Chargé UNIQUEMENT quand le navigateur ne connaît pas l'unité « dvh » (voir le petit test en tête d'index.html).
   Sur un iPhone récent, ce fichier n'est jamais téléchargé ni exécuté.
   1. Pointer Events (pointerdown/move/up) recréés à partir des événements tactiles.
   2. element.animate() / getAnimations() minimalistes.
   3. matchMedia().addEventListener, canvas.roundRect.
   4. Réécriture des feuilles de style : dvh→vh, cqi→largeur du conteneur, :is()→:-webkit-any(),
      color-mix() approché, inset, translate/scale/rotate → transform. */
(function(){
  'use strict';
  document.documentElement.classList.add('legacy');
  /* diagnostic : toute erreur s'affiche en bas de l'écran (vieil iPad seulement) pour pouvoir l'envoyer en capture */
  var ERR=[];
  function showErr(m){ERR.push(m);if(ERR.length>4)ERR.shift();var b=document.getElementById('lgErr');
    if(!b){if(!document.body){document.addEventListener('DOMContentLoaded',function(){showErr(ERR.pop())});return}
      b=document.createElement('div');b.id='lgErr';b.setAttribute('style','position:fixed;left:6px;right:6px;bottom:6px;z-index:99999;background:#b00;color:#fff;font:12px/1.35 -apple-system,sans-serif;padding:8px 10px;border-radius:8px;white-space:pre-wrap;word-break:break-all');
      b.addEventListener('click',function(){b.remove()});document.body.appendChild(b)}
    b.textContent='Erreur (touche pour fermer) :\n'+ERR.join('\n')}
  window.addEventListener('error',function(e){showErr((e.message||'?')+' @'+(e.lineno||'?')+':'+(e.colno||'?')+(e.filename?' '+String(e.filename).split('/').pop():''))});
  window.addEventListener('unhandledrejection',function(e){showErr('promesse : '+(e.reason&&e.reason.message||e.reason))});

  /* ---------- 1. Pointer Events à partir du tactile ---------- */
  if(!window.PointerEvent){
    var cap={};   // pointerId → élément qui a capturé
    var mk=function(type,t,src,tgt){
      var e=document.createEvent('Event');e.initEvent(type,true,true);
      e.pointerId=t.identifier+1;e.pointerType='touch';e.isPrimary=true;e.button=0;e.buttons=type==='pointerup'||type==='pointercancel'?0:1;
      e.clientX=t.clientX;e.clientY=t.clientY;e.pageX=t.pageX;e.pageY=t.pageY;e.screenX=t.screenX;e.screenY=t.screenY;
      e.width=e.height=1;e.pressure=.5;e.altKey=src.altKey;e.ctrlKey=src.ctrlKey;e.shiftKey=src.shiftKey;e.metaKey=src.metaKey;
      return e};
    var fire=function(type,src){
      for(var i=0;i<src.changedTouches.length;i++){
        var t=src.changedTouches[i],id=t.identifier+1,tgt=cap[id]||t.target;
        if(tgt&&tgt.nodeType===3)tgt=tgt.parentNode;
        var ev=mk(type,t,src,tgt);tgt.dispatchEvent(ev);
        if(ev.defaultPrevented&&src.cancelable&&type==='pointermove')src.preventDefault();   // jamais sur touchend : ça annulerait le clic
        if(type==='pointerup'||type==='pointercancel')delete cap[id];
      }};
    var o={passive:false,capture:true};
    document.addEventListener('touchstart',function(e){fire('pointerdown',e)},o);
    document.addEventListener('touchmove',function(e){fire('pointermove',e)},o);
    document.addEventListener('touchend',function(e){fire('pointerup',e)},o);
    document.addEventListener('touchcancel',function(e){fire('pointercancel',e)},o);
    Element.prototype.setPointerCapture=function(id){cap[id]=this};
    Element.prototype.releasePointerCapture=function(id){if(cap[id]===this)delete cap[id]};
    Element.prototype.hasPointerCapture=function(id){return cap[id]===this};
    window.PointerEvent=function PointerEvent(){};
  }

  /* ---------- 2. Web Animations minimalistes ---------- */
  if(!Element.prototype.animate){
    var PROPS=['transform','opacity','clipPath','translate','rotate','scale','filter','strokeDashoffset'];
    Element.prototype.animate=function(frames,opt){
      var el=this;opt=typeof opt==='number'?{duration:opt}:(opt||{});
      var dur=(opt.duration||0)+(opt.delay||0),it=opt.iterations===Infinity?0:1,set=[],done=false,timer=0;
      var a={onfinish:null,oncancel:null,playState:'running',currentTime:0,effect:{target:el},
        cancel:function(){clearTimeout(timer);set.forEach(function(p){el.style[p]=''});set=[];a.playState='idle';if(a.oncancel)a.oncancel()},
        finish:function(){end()},play:function(){},pause:function(){},reverse:function(){},
        addEventListener:function(t,f){if(t==='finish')a.onfinish=f}};
      var end=function(){if(done)return;done=true;a.playState='finished';
        var last=Array.isArray(frames)?frames[frames.length-1]:null;
        if(last&&(opt.fill==='forwards'||opt.fill==='both'))PROPS.forEach(function(p){if(last[p]!==undefined){el.style[p]=last[p];set.push(p)}});
        if(a.onfinish)try{a.onfinish({target:a})}catch(e){}};
      a.finished=new Promise(function(r){var f=end;end=function(){f();r(a)}});
      if(it)timer=setTimeout(function(){end()},dur);
      return a};
    Element.prototype.getAnimations=function(){return []};
    if(!document.getAnimations)document.getAnimations=function(){return []};
  }

  /* ---------- 3. petits manques ---------- */
  try{var mq=window.matchMedia('all');
    if(mq&&!mq.addEventListener){var MP=Object.getPrototypeOf(mq);
      MP.addEventListener=function(t,f){if(t==='change')this.addListener(f)};
      MP.removeEventListener=function(t,f){if(t==='change')this.removeListener(f)}}}catch(e){}
  if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect)
    CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.max(0,Math.min(+r||0,w/2,h/2));
      this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath()};

  /* ---------- 4. réécriture des styles ---------- */
  // trouve la parenthèse fermante correspondante
  function close(s,i){var d=0;for(;i<s.length;i++){if(s[i]==='(')d++;else if(s[i]===')'){d--;if(!d)return i}}return -1}
  function splitTop(s,sep){var out=[],d=0,b=0;for(var i=0;i<s.length;i++){var c=s[i];if(c==='(')d++;else if(c===')')d--;else if(c===sep&&!d){out.push(s.slice(b,i));b=i+1}}out.push(s.slice(b));return out.map(function(x){return x.trim()})}
  function splitSpaces(s){var out=[],d=0,b=0;s=s.trim();for(var i=0;i<s.length;i++){var c=s[i];if(c==='(')d++;else if(c===')')d--;else if(/\s/.test(c)&&!d){if(i>b)out.push(s.slice(b,i));b=i+1}}if(b<s.length)out.push(s.slice(b));return out}
  function hex(c){c=c.trim();var m=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);if(!m)return null;var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
  function colorMix(s){var i;while((i=s.indexOf('color-mix('))>=0){var j=close(s,i+9);if(j<0)break;
      var args=splitTop(s.slice(i+10,j),',').slice(1),A=args[0]||'',B=args[1]||'transparent',pa=/\s(\d+(\.\d+)?)%\s*$/.exec(A),pb=/\s(\d+(\.\d+)?)%\s*$/.exec(B);
      A=A.replace(/\s\d+(\.\d+)?%\s*$/,'');B=B.replace(/\s\d+(\.\d+)?%\s*$/,'');
      var p=pa?+pa[1]:pb?100-pb[1]:50,ha=hex(A),hb=hex(B),out;
      if(ha&&(hb||B==='transparent')){var bb=hb||ha,al=hb?1:p/100,t=hb?p/100:1;out='rgba('+[0,1,2].map(function(k){return Math.round(ha[k]*t+bb[k]*(1-t))}).join(',')+','+al+')'}
      else if(B==='transparent'&&/^(var|rgb)/.test(A))out=A;   // on garde la couleur, sans la transparence
      else out=p>=50?A:B;
      s=s.slice(0,i)+out+s.slice(j+1)}return s}
  /* :is(A,B) n'existe pas : on développe « X :is(A,B) Y » en « X A Y, X B Y » (même résultat, même priorité) */
  function expandOne(sel){var i=sel.indexOf(':is(');if(i<0)return [sel];var k=close(sel,i+3);if(k<0)return [sel];
    var pre=sel.slice(0,i),post=sel.slice(k+1),out=[];
    splitTop(sel.slice(i+4,k),',').forEach(function(a){expandOne(pre+a+post).forEach(function(x){out.push(x)})});return out}
  function isSel(s){if(s.indexOf(':is(')<0)return s;var out=[];splitTop(s,',').forEach(function(x){expandOne(x).forEach(function(y){out.push(y)})});return out.join(',')}
  // une déclaration-bloc : inset, translate/scale/rotate → transform
  /* hors @keyframes : translate / rotate / scale / transform deviennent des variables (--lg-*) que recompose une règle universelle,
     pour que deux règles différentes (l'une avec transform, l'autre avec translate) se cumulent comme sur un navigateur récent */
  var COMP='transform:var(--lg-tr,translate(0px)) var(--lg-ro,rotate(0deg)) var(--lg-sc,scale(1)) var(--lg-tf,translate(0px))';
  function blockVar(b){
    var hit=0,imp=0;
    var out=splitTop(b,';').map(function(d){if(!d)return d;var k=d.indexOf(':');if(k<0)return d;
      var p=d.slice(0,k).trim(),v=d.slice(k+1).trim(),im=/!important\s*$/.test(v),s2=im?' !important':'';v=v.replace(/\s*!important\s*$/,'');
      if(p==='inset'){var q=splitSpaces(v),t=q[0],r=q[1]||t,bo=q[2]||t,l=q[3]||r;return ['top:'+t+s2,'right:'+r+s2,'bottom:'+bo+s2,'left:'+l+s2].join(';')}
      if(/^(translate|rotate|scale|transform)$/.test(p)){hit=1;if(im)imp=1}
      if(p==='translate'){if(v==='none')return '--lg-tr:initial'+s2;var q2=splitSpaces(v);return '--lg-tr:translate('+q2[0]+','+(q2[1]||'0px')+')'+s2}
      if(p==='rotate')return v==='none'?'--lg-ro:initial'+s2:'--lg-ro:rotate('+v+')'+s2;
      if(p==='scale'){if(v==='none')return '--lg-sc:initial'+s2;var q3=splitSpaces(v);return '--lg-sc:scale('+q3[0]+','+(q3[1]||q3[0])+')'+s2}
      if(p==='transform')return v==='none'?'--lg-tf:initial'+s2:'--lg-tf:'+v+s2;
      return d}).join(';');
    return hit?out+';'+COMP+(imp?' !important':''):out}
  function block(b){
    var decl=splitTop(b,';'),tr=null,ro=null,sc=null,tf=null,imp=false,out=[];
    decl.forEach(function(d){if(!d)return;var k=d.indexOf(':');if(k<0){out.push(d);return}
      var p=d.slice(0,k).trim(),v=d.slice(k+1).trim(),im=/!important\s*$/.test(v);v=v.replace(/\s*!important\s*$/,'');
      if(p==='inset'){var q=splitSpaces(v),t=q[0],r=q[1]||t,bo=q[2]||t,l=q[3]||r,s2=im?' !important':'';out.push('top:'+t+s2,'right:'+r+s2,'bottom:'+bo+s2,'left:'+l+s2);return}
      if(p==='translate'){if(v!=='none'){var q2=splitSpaces(v);tr='translate('+q2[0]+','+(q2[1]||'0')+')'}else tr='';imp=imp||im;return}
      if(p==='rotate'){ro=v==='none'?'':'rotate('+v+')';imp=imp||im;return}
      if(p==='scale'){if(v!=='none'){var q3=splitSpaces(v);sc='scale('+q3[0]+','+(q3[1]||q3[0])+')'}else sc='';imp=imp||im;return}
      if(p==='transform'){tf=v;imp=imp||im;return}
      out.push(d)});
    if(tr!==null||ro!==null||sc!==null||tf!==null){
      var parts=[tr,ro,sc].filter(function(x){return x}),base=tf&&tf!=='none'?tf:'';
      var t2=parts.concat(base?[base]:[]).join(' ')||'none';out.push('transform:'+t2+(imp?' !important':''))}
    return out.join(';')}
  function rewrite(css){
    css=css.replace(/\/\*[\s\S]*?\*\//g,'');
    css=css.replace(/(\d*\.?\d+)(dvh|svh|lvh)\b/g,'$1vh').replace(/(\d*\.?\d+)(dvw|svw|lvw)\b/g,'$1vw')
           .replace(/(\d*\.?\d+)cq(i|w)\b/g,'calc($1 * var(--cq,1vw))').replace(/(\d*\.?\d+)cqh\b/g,'calc($1 * var(--cqh,1vh))');
    css=colorMix(css);
    // parcours des blocs { … } (sélecteurs et déclarations)
    var res='',i=0,n=css.length;
    while(i<n){var o=css.indexOf('{',i);if(o<0){res+=css.slice(i);break}
      var head=css.slice(i,o),depth=1,j=o+1;for(;j<n&&depth;j++){if(css[j]==='{')depth++;else if(css[j]==='}')depth--}
      var body=css.slice(o+1,j-1);
      if(/^\s*@(media|supports|document)/.test(head))res+=head+'{'+rewrite(body)+'}';
      else if(/^\s*@(keyframes|-webkit-keyframes)/.test(head)){var kb='',k=0;while(k<body.length){var o2=body.indexOf('{',k);if(o2<0){kb+=body.slice(k);break}var c2=body.indexOf('}',o2);kb+=body.slice(k,o2)+'{'+block(body.slice(o2+1,c2))+'}';k=c2+1}res+=head+'{'+kb+'}'}
      else if(/^\s*@/.test(head))res+=head+'{'+body+'}';
      else res+=isSel(head)+'{'+blockVar(body)+'}';
      i=j}
    return res}
  var CQSEL=[];
  window.__legacyCSS=function(){
    if(!document.getElementById('lgT')){var u=document.createElement('style');u.id='lgT';u.dataset.legacy='1';
      u.textContent='*{--lg-tr:initial;--lg-ro:initial;--lg-sc:initial;--lg-tf:initial}';
      document.head.insertBefore(u,document.head.firstChild)}
    var st=document.querySelectorAll('style');
    for(var k=0;k<st.length;k++){var s=st[k];if(s.dataset.legacy)continue;var t=s.textContent;
      t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/([^{}]+)\{[^{}]*container-type\s*:/g,function(m,sel){sel=sel.trim();if(sel&&sel[0]!=='@')CQSEL.push(isSel(sel))});
      try{s.textContent=rewrite(t);s.dataset.legacy='1'}catch(e){console.error('legacy css',e)}}
    cq()};
  // largeur des « conteneurs » pour remplacer cqi
  var raf=0;
  function cq(){raf=0;CQSEL.forEach(function(sel){try{var els=document.querySelectorAll(sel);for(var i=0;i<els.length;i++){var e=els[i],w=e.clientWidth,h=e.clientHeight;
      if(w){e.style.setProperty('--cq',(w/100)+'px');e.style.setProperty('--cqh',(h/100)+'px')}}}catch(e){}})}
  function later(){if(!raf)raf=requestAnimationFrame(cq)}
  window.addEventListener('resize',later);
  document.addEventListener('DOMContentLoaded',function(){
    // après chaque rendu : largeur des conteneurs à jour, puis on replace ce qui dépend des tailles (cœurs du killer…)
    ['render','kRender','xRender','bcRender'].forEach(function(n){var f=window[n];if(typeof f!=='function')return;
      window[n]=function(){var r=f.apply(this,arguments);try{cq();if(n==='kRender'&&typeof window.kArc==='function')window.kArc()}catch(e){}return r}});
    try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}catch(e){}
    // styles ajoutés plus tard par le script
    try{new MutationObserver(function(){window.__legacyCSS()}).observe(document.head,{childList:true})}catch(e){}
    later()});
  // el.style.translate / rotate / scale (inconnus de Safari 12) → variables recomposées par la règle universelle
  if(!('translate' in document.documentElement.style)){
    var conv={translate:['--lg-tr',function(v){var q=splitSpaces(v);return 'translate('+q[0]+','+(q[1]||'0px')+')'}],
              rotate:['--lg-ro',function(v){return 'rotate('+v+')'}],
              scale:['--lg-sc',function(v){var q=splitSpaces(v);return 'scale('+q[0]+','+(q[1]||q[0])+')'}]};
    Object.keys(conv).forEach(function(k){var c=conv[k];
      Object.defineProperty(CSSStyleDeclaration.prototype,k,{configurable:true,
        get:function(){return this.getPropertyValue(c[0])},
        set:function(v){v=String(v||'').trim();if(!v||v==='none')this.removeProperty(c[0]);else{this.setProperty(c[0],c[1](v));if(!this.transform)this.transform=COMP.slice(10)}}})})}
  // styles posés en ligne par le script (style="…dvh")
  var sp=CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty=function(p,v,pr){if(typeof v==='string'&&/dvh|svh|lvh|cqi|color-mix/.test(v))v=rewrite('x{a:'+v+'}').replace(/^x\{a:|\}$/g,'');return sp.call(this,p,v,pr)};
})();
