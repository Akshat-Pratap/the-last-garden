/**
 * THE LAST GARDEN — main.js (v4 — CINEMATIC)
 * Every word, line, and element has its own animation.
 * Scroll up and back down — everything replays.
 */

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   UTILITIES
============================================================ */

function splitChars(el) {
  const text = el.textContent;
  el.innerHTML = '';
  el.setAttribute('aria-label', text);
  return [...text].map(char => {
    const s = document.createElement('span');
    s.textContent = char === ' ' ? '\u00A0' : char;
    s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(60px) rotateX(40deg)';
    el.appendChild(s);
    return s;
  });
}

function splitWords(el) {
  const text = el.textContent.trim();
  el.innerHTML = '';
  el.setAttribute('aria-label', text);
  const words = text.split(/\s+/);
  return words.map((word, i) => {
    const s = document.createElement('span');
    s.textContent = word;
    s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(22px)';
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return s;
  });
}

function resetWords(words) {
  gsap.killTweensOf(words);
  words.forEach(w => gsap.set(w, { opacity:0, y:22, rotation:0, skewX:0 }));
}

function animWords(words, opts) {
  const o = opts || {};
  gsap.to(words, {
    opacity:1, y:0,
    duration: o.duration || 0.6,
    ease: o.ease || 'power2.out',
    stagger: { each: o.stagger || 0.02, from: o.from || 'start' },
    delay: o.delay || 0,
    overwrite: true
  });
}

/* ============================================================
   GATE SCREEN
============================================================ */
(function gateScreen() {
  const gate = document.getElementById('gate-screen');
  const btn  = document.getElementById('enter-btn');
  const waves = document.getElementById('sound-waves');
  if (!gate || !btn) return;

  document.body.classList.add('gate-open');

  gsap.timeline({ delay:0.5 })
    .to('.gate-eyebrow', { opacity:1, y:0, duration:0.8, ease:'power2.out' })
    .to('.gate-title',   { opacity:1, y:0, duration:1.0, ease:'power3.out' }, '-=0.4')
    .to('.gate-tagline', { opacity:1, y:0, duration:0.8, ease:'power2.out' }, '-=0.3')
    .to('.gate-btn-wrap',{ opacity:1,      duration:0.8 }, '-=0.2')
    .to('.gate-hint',    { opacity:0.5,    duration:0.6 }, '-=0.2');

  function playGardenSound() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC(), t = ctx.currentTime;
    const r1=ctx.createDelay(0.8), r2=ctx.createDelay(0.5),
          rg1=ctx.createGain(), rg2=ctx.createGain();
    r1.delayTime.value=0.55; r2.delayTime.value=0.28;
    rg1.gain.value=0.18; rg2.gain.value=0.12;
    r1.connect(rg1); rg1.connect(r2); r2.connect(rg2); rg2.connect(r1);
    const mg=ctx.createGain();
    mg.gain.setValueAtTime(0,t); mg.gain.linearRampToValueAtTime(0.38,t+0.08);
    mg.gain.setValueAtTime(0.38,t+1.4); mg.gain.linearRampToValueAtTime(0,t+2.0);
    r1.connect(mg); r2.connect(mg); mg.connect(ctx.destination);
    const bowl=ctx.createOscillator(), bg=ctx.createGain();
    bowl.type='sine'; bowl.frequency.value=392;
    bg.gain.setValueAtTime(0,t); bg.gain.linearRampToValueAtTime(0.22,t+0.01);
    bg.gain.exponentialRampToValueAtTime(0.001,t+2.0);
    bowl.connect(bg); bg.connect(r1); bg.connect(mg);
    bowl.start(t); bowl.stop(t+2.1);
    const ot=ctx.createOscillator(), og=ctx.createGain();
    ot.type='sine'; ot.frequency.value=784;
    og.gain.setValueAtTime(0,t); og.gain.linearRampToValueAtTime(0.07,t+0.02);
    og.gain.exponentialRampToValueAtTime(0.001,t+1.6);
    ot.connect(og); og.connect(r2); ot.start(t); ot.stop(t+1.7);
  }

  btn.addEventListener('click', () => {
    try { playGardenSound(); } catch(e) {}
    if (waves) waves.classList.add('playing');
    btn.disabled = true;
    setTimeout(() => {
      if (waves) waves.classList.remove('playing');
      gsap.to('.gate-ring', { scale:2.5, opacity:0, duration:1.0, stagger:0.1 });
      gsap.to(btn, { scale:1.4, opacity:0, duration:0.8, ease:'power2.in' });
      gsap.to(gate, {
        opacity:0, duration:1.6, ease:'power2.inOut',
        onComplete: () => {
          gate.classList.add('hidden');
          document.body.classList.remove('gate-open');
          window.scrollTo({ top:0, behavior:'instant' });
          ScrollTrigger.refresh(true);
          playHeroEntrance();
          setTimeout(() => {
            const s1 = document.getElementById('scene-1');
            if (s1) {
              s1.scrollIntoView({ behavior:'smooth', block:'start' });
              setTimeout(() => {
                if (window._s1Enter) window._s1Enter();
                ScrollTrigger.refresh(true);
                setTimeout(unstick, 500);
              }, 900);
            }
          }, 1400);
        }
      });
    }, 400);
  });
  btn.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }});
})();

/* ============================================================
   UNSTICK SAFETY NET
============================================================ */
function unstick() {
  document.querySelectorAll('.scene-number,.scene-title,.scene-rule,.prose p,.dialogue-line,.pull-quote,.revelation,.rev-line,.final-line,.letter-text,.end-title,.end-subtitle').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0 && parseFloat(getComputedStyle(el).opacity) < 0.1) {
      gsap.to(el, { opacity:1, y:0, x:0, duration:0.5, ease:'power2.out', overwrite:true });
      el.querySelectorAll('span').forEach(s => gsap.to(s, { opacity:1, y:0, duration:0.4, ease:'power1.out', overwrite:true }));
    }
  });
  document.querySelectorAll('.scene-image').forEach(img => {
    const r = img.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0 && parseFloat(getComputedStyle(img).opacity) < 0.1)
      gsap.to(img, { opacity:0.9, duration:1.0, ease:'power2.out', overwrite:true });
  });
}

/* ============================================================
   CURSOR GLOW
============================================================ */
(function cursorGlow() {
  if (innerWidth < 768) return;
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(232,201,122,0.06) 0%,transparent 70%);transform:translate(-50%,-50%);top:0;left:0;transition:opacity 0.3s;';
  document.body.appendChild(glow);
  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  (function loop(){ cx+=(mx-cx)*0.06; cy+=(my-cy)*0.06; glow.style.left=cx+'px'; glow.style.top=cy+'px'; requestAnimationFrame(loop); })();
})();

/* ============================================================
   FLOATING PARTICLES
============================================================ */
(function floatingParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W,H;
  const resize = () => { W=canvas.width=hero.offsetWidth; H=canvas.height=hero.offsetHeight; };
  resize();
  window.addEventListener('resize', resize, { passive:true });
  const P = Array.from({length:70}, () => ({
    x:Math.random()*(W||800), y:Math.random()*(H||600),
    r:Math.random()*2+0.3, speed:Math.random()*0.5+0.1,
    op:Math.random()*0.5+0.1, drift:(Math.random()-0.5)*0.4
  }));
  (function draw() {
    ctx.clearRect(0,0,W,H);
    P.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(232,201,122,${p.op})`; ctx.fill();
      p.y-=p.speed; p.x+=p.drift;
      if(p.y<-4){p.y=H+4;p.x=Math.random()*W;}
      if(p.x<-4||p.x>W+4) p.x=Math.random()*W;
    });
    requestAnimationFrame(draw);
  })();
})();

/* ============================================================
   SCENE WIPE LINES
============================================================ */
(function sceneWipes() {
  document.querySelectorAll('.scene').forEach(scene => {
    const wipe = document.createElement('div');
    wipe.style.cssText = 'position:absolute;top:0;left:0;width:0%;height:2px;background:linear-gradient(to right,transparent,rgba(232,201,122,0.9),transparent);z-index:10;pointer-events:none;';
    scene.appendChild(wipe);
    ScrollTrigger.create({
      trigger:scene, start:'top 75%',
      onEnter: () => gsap.fromTo(wipe,{width:'0%',opacity:1},{width:'100%',duration:1.2,ease:'power2.inOut',onComplete:()=>gsap.to(wipe,{opacity:0,duration:0.6,delay:0.2})}),
      onLeaveBack: () => gsap.set(wipe,{width:'0%',opacity:0})
    });
  });
})();

/* ============================================================
   AMBIENT VERTICAL LINES
============================================================ */
(function ambientLines() {
  document.querySelectorAll('.scene').forEach(scene => {
    const line = document.createElement('div');
    line.style.cssText = 'position:absolute;left:clamp(10px,2.5vw,32px);top:8%;width:1px;height:0%;pointer-events:none;z-index:1;background:linear-gradient(to bottom,transparent,rgba(232,201,122,0.35),transparent);';
    scene.appendChild(line);
    ScrollTrigger.create({
      trigger:scene, start:'top 68%',
      onEnter:     () => gsap.to(line,{height:'84%',duration:1.8,ease:'power2.out'}),
      onLeaveBack: () => gsap.set(line,{height:'0%'})
    });
  });
})();

/* ============================================================
   HERO ENTRANCE
============================================================ */
function playHeroEntrance() {
  const ht = document.querySelector('.hero-title');
  if (!ht) return;
  gsap.set(['.hero-eyebrow','.hero-scroll-hint'],{opacity:0,y:20});
  const chars = splitChars(ht);
  gsap.set(chars,{opacity:0,y:60});
  const tl = gsap.timeline({delay:0.1});
  tl.to('.hero-eyebrow',{opacity:1,y:0,duration:0.8,ease:'power2.out'});
  tl.to(chars,{opacity:1,y:0,rotateX:0,duration:0.7,ease:'power3.out',stagger:{each:0.03,from:'center'}},'-=0.4');
  tl.to('.hero-scroll-hint',{opacity:1,y:0,duration:1.0,ease:'power1.inOut'},'+=0.5');
}

/* ============================================================
   HERO SHIMMER
============================================================ */
(function heroShimmer() {
  if (innerWidth < 768) return;
  setTimeout(() => {
    document.querySelectorAll('.hero-title span').forEach((c,i,all) => {
      c.addEventListener('mouseenter',()=>{
        gsap.to(c,{color:'#e8c97a',y:-8,scale:1.1,duration:0.2,ease:'power2.out'});
        [-1,1,-2,2].forEach(o=>{const n=all[i+o];if(n) gsap.to(n,{color:'#c9a84c',y:-4,duration:0.2,delay:Math.abs(o)*0.04});});
      });
      c.addEventListener('mouseleave',()=>{
        gsap.to(c,{color:'',y:0,scale:1,duration:0.5,ease:'elastic.out(1,0.4)'});
        [-1,1,-2,2].forEach(o=>{const n=all[i+o];if(n) gsap.to(n,{color:'',y:0,duration:0.4});});
      });
    });
  }, 2500);
})();

/* ============================================================
   BACKGROUND COLOR JOURNEY
============================================================ */
const bgMap = [
  {id:'hero',color:'#0f0e0c'},{id:'scene-1',color:'#1a1510'},
  {id:'scene-2',color:'#1c1610'},{id:'scene-3',color:'#2a1f0f'},
  {id:'scene-4',color:'#3d2b0a'},{id:'scene-5',color:'#f5e6c8'},
  {id:'end-screen',color:'#f5e6c8'},
];
bgMap.forEach(({id,color},i) => {
  const el=document.getElementById(id); if(!el) return;
  ScrollTrigger.create({
    trigger:el, start:'top 55%',
    onEnter:     ()=>gsap.to('body',{backgroundColor:color,duration:1.6,ease:'power1.inOut'}),
    onLeaveBack: ()=>{ const p=bgMap[i-1]; if(p) gsap.to('body',{backgroundColor:p.color,duration:1.6,ease:'power1.inOut'}); }
  });
});

/* ============================================================
   SCENE IMAGES — fade + parallax
============================================================ */
document.querySelectorAll('.scene-image').forEach(img => {
  const scene = img.closest('.scene'); if(!scene) return;
  gsap.set(img,{opacity:0});
  ScrollTrigger.create({
    trigger:scene, start:'top 80%',
    onEnter:     ()=>gsap.to(img,{opacity:0.92,duration:1.6,ease:'power2.out'}),
    onLeaveBack: ()=>gsap.to(img,{opacity:0,duration:0.9,ease:'power2.in'}),
    onEnterBack: ()=>gsap.to(img,{opacity:0.92,duration:1.6,ease:'power2.out'}),
  });
  gsap.to(img,{yPercent:-12,ease:'none',scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:1.2}});
});

/* ============================================================
   SCENE HEADERS — staggered cinematic entrance
============================================================ */
document.querySelectorAll('.scene').forEach(scene => {
  const num  = scene.querySelector('.scene-number');
  const title= scene.querySelector('.scene-title');
  const rule = scene.querySelector('.scene-rule');
  if (!num||!title) return;

  // Split title into chars for letter animation
  const titleText = title.textContent;
  title.innerHTML=''; title.setAttribute('aria-label',titleText);
  const titleChars = [...titleText].map(ch => {
    const s=document.createElement('span');
    s.textContent=ch===' '?'\u00A0':ch;
    s.style.cssText='display:inline-block;opacity:0;transform:translateY(50px) skewX(8deg)';
    title.appendChild(s);
    return s;
  });

  gsap.set(num,{opacity:0,y:24,letterSpacing:'1em'});
  if(rule) gsap.set(rule,{width:0,opacity:0});

  const play=()=>{
    const tl=gsap.timeline();
    tl.to(num,{opacity:1,y:0,letterSpacing:'0.5em',duration:0.8,ease:'power3.out'});
    tl.to(titleChars,{opacity:1,y:0,skewX:0,duration:0.7,ease:'power3.out',stagger:{each:0.025,from:'start'}},'-=0.4');
    if(rule) tl.to(rule,{width:48,opacity:0.5,duration:0.8,ease:'power2.out'},'-=0.3');
  };
  const reset=()=>{
    gsap.set(num,{opacity:0,y:24,letterSpacing:'1em'});
    gsap.set(titleChars,{opacity:0,y:50,skewX:8});
    if(rule) gsap.set(rule,{width:0,opacity:0});
  };

  ScrollTrigger.create({trigger:scene,start:'top 68%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
});

/* ============================================================
   PROSE PARAGRAPHS — smooth fade-in with upward drift
   Each paragraph fades in cleanly as you scroll into it.
   Repeats every time you scroll back up and down.
============================================================ */
document.querySelectorAll('.prose p').forEach((para, idx) => {
  if (para.closest('#scene-5')) return;
  if (para.classList.contains('pull-quote')) return;

  // ── Paragraph with "terminal" word ───────────────────────
  if (para.querySelector('.word-terminal')) {
    gsap.set(para, { opacity:0, y:30 });

    const play  = () => gsap.to(para, { opacity:1, y:0, duration:1.0, ease:'power2.out', overwrite:true });
    const reset = () => gsap.set(para, { opacity:0, y:30 });

    ScrollTrigger.create({
      trigger: para, start:'top 86%',
      onEnter:     play,
      onLeaveBack: reset,
      onEnterBack: play
    });

    // "terminal" word burst
    const terminal = para.querySelector('.word-terminal');
    ScrollTrigger.create({
      trigger: terminal, start:'top 82%',
      onEnter: () => gsap.timeline()
        .to(terminal, { scale:2.4, color:'#e8c97a', skewX:-5, duration:0.4, ease:'power2.out' })
        .to(terminal, { scale:1.0, skewX:0, duration:0.7, ease:'elastic.out(1,0.35)' }),
      onLeaveBack: () => gsap.set(terminal, { scale:1, color:'', skewX:0 })
    });
    return;
  }

  // ── Standard paragraph — fade in with drift ───────────────
  // Each paragraph fades up from slightly below, with a small
  // delay based on its position so they stagger naturally
  gsap.set(para, { opacity:0, y:32 });

  const delay = (idx % 3) * 0.08; // subtle stagger between adjacent paragraphs

  const play = () => gsap.to(para, {
    opacity: 1,
    y: 0,
    duration: 0.85,
    delay: delay,
    ease: 'power2.out',
    overwrite: true
  });

  const reset = () => gsap.set(para, { opacity:0, y:32 });

  ScrollTrigger.create({
    trigger: para,
    start: 'top 88%',
    onEnter:     play,
    onLeaveBack: reset,
    onEnterBack: play
  });
});

/* ============================================================
   PULL QUOTES — dramatic cinematic entrance
============================================================ */
document.querySelectorAll('.pull-quote').forEach(pq => {
  const words = splitWords(pq);
  gsap.set(pq,{opacity:1,clearProps:'transform'});

  ScrollTrigger.create({
    trigger:pq, start:'top 84%',
    onEnter: ()=>{
      gsap.timeline()
        .to(pq,{borderLeftColor:'rgba(232,201,122,0.6)',duration:0.4,ease:'power2.out'})
        .to(words,{opacity:1,y:0,duration:0.7,ease:'power3.out',stagger:{each:0.04,from:'center'}},'-=0.2')
        .to(pq,{letterSpacing:'0.03em',duration:0.8,ease:'power1.out'},'-=0.5');
    },
    onLeaveBack: ()=>{
      resetWords(words);
      gsap.set(pq,{letterSpacing:'0em',borderLeftColor:'transparent'});
    },
    onEnterBack: ()=>{
      gsap.timeline()
        .to(pq,{borderLeftColor:'rgba(232,201,122,0.6)',duration:0.4})
        .to(words,{opacity:1,y:0,duration:0.7,ease:'power3.out',stagger:{each:0.04,from:'center'}},'-=0.2')
        .to(pq,{letterSpacing:'0.03em',duration:0.8,ease:'power1.out'},'-=0.5');
    }
  });
});

/* ============================================================
   DIALOGUE LINES — slide from sides with stagger
============================================================ */
document.querySelectorAll('.dialogue-line').forEach((line,i) => {
  const isR = line.classList.contains('response');
  gsap.set(line,{opacity:0,x:isR?50:-50,skewX:isR?-3:3});

  const play  = ()=>gsap.to(line,{opacity:1,x:0,skewX:0,duration:0.85,ease:'power3.out',overwrite:true,delay:i*0.1});
  const reset = ()=>gsap.set(line,{opacity:0,x:isR?50:-50,skewX:isR?-3:3});

  ScrollTrigger.create({trigger:line,start:'top 88%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
});

/* ============================================================
   CHARACTER NAMES — gold pulse
============================================================ */
document.querySelectorAll('.character-name').forEach(name => {
  ScrollTrigger.create({
    trigger:name, start:'top 86%',
    onEnter:()=>gsap.timeline()
      .to(name,{color:'#e8c97a',scale:1.1,skewX:-3,duration:0.3,ease:'power2.out'})
      .to(name,{scale:1.0,skewX:0,duration:0.5,ease:'elastic.out(1,0.4)'}),
    onLeaveBack:()=>gsap.set(name,{color:'',scale:1,skewX:0})
  });
});

/* ============================================================
   GOLD TEXT HIGHLIGHTS — glow burst
============================================================ */
document.querySelectorAll('.text-gold').forEach(span => {
  gsap.set(span,{opacity:0});
  ScrollTrigger.create({
    trigger:span, start:'top 85%',
    onEnter:()=>gsap.timeline()
      .to(span,{opacity:1,scale:1.05,duration:0.2,ease:'power2.out'})
      .to(span,{scale:1.0,duration:0.4,ease:'elastic.out(1,0.4)'})
      .fromTo(span,{textShadow:'0 0 18px rgba(232,201,122,1)'},{textShadow:'0 0 0px rgba(232,201,122,0)',duration:1.6,ease:'power2.out'},'-=0.3'),
    onLeaveBack:()=>gsap.set(span,{opacity:0,scale:1})
  });
});

/* ============================================================
   SCENE 1 ENTRANCE
============================================================ */
(function scene1Layout() {
  const content = document.querySelector('#scene-1 .scene-content');
  const img     = document.querySelector('#scene-1 .scene-image');
  if (!content) return;
  gsap.set(content,{opacity:0,x:-60,skewX:2});

  const play  = ()=>{
    gsap.to(content,{opacity:1,x:0,skewX:0,duration:1.1,ease:'power3.out',overwrite:true});
    if(img) gsap.to(img,{opacity:0.92,duration:1.6,ease:'power2.out',overwrite:true});
  };
  const reset = ()=>{
    gsap.set(content,{opacity:0,x:-60,skewX:2});
    if(img) gsap.set(img,{opacity:0});
  };

  ScrollTrigger.create({trigger:'#scene-1',start:'top 75%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
  window._s1Enter = play;
})();

/* ============================================================
   SCENE 2 ENTRANCE
============================================================ */
(function scene2Layout() {
  const content = document.querySelector('#scene-2 .scene-content');
  if (!content) return;
  gsap.set(content,{opacity:0,y:50});
  ScrollTrigger.create({
    trigger:'#scene-2', start:'top 70%',
    onEnter:     ()=>gsap.to(content,{opacity:1,y:0,duration:1.1,ease:'power3.out',overwrite:true}),
    onLeaveBack: ()=>gsap.set(content,{opacity:0,y:50}),
    onEnterBack: ()=>gsap.to(content,{opacity:1,y:0,duration:1.1,ease:'power3.out',overwrite:true})
  });
})();

/* ============================================================
   ARJUN QUOTE — full-width cinematic moment
============================================================ */
(function arjunQuote() {
  const block    = document.getElementById('arjun-quote'); if(!block) return;
  const main     = block.querySelector('.quote-main');
  const response = block.querySelector('.quote-response');
  const attr     = block.querySelector('.quote-attr');

  // Split quote into chars for dramatic entrance
  const mainChars = splitChars(main);
  gsap.set(response,{opacity:0,y:20});
  if(attr) gsap.set(attr,{opacity:0});

  const play = ()=>{
    const tl=gsap.timeline();
    tl.to(mainChars,{opacity:1,y:0,rotateX:0,duration:0.8,ease:'power3.out',stagger:{each:0.03,from:'start'}});
    tl.to(response, {opacity:1,y:0,duration:0.9,ease:'power2.out'},'-=0.2');
    if(attr) tl.to(attr,{opacity:0.5,duration:0.6},'-=0.2');
    gsap.fromTo(block,{backgroundColor:'rgba(232,201,122,0)'},{backgroundColor:'rgba(232,201,122,0.07)',duration:1.0,yoyo:true,repeat:1,ease:'power1.inOut'});
  };
  const reset = ()=>{
    gsap.set(mainChars,{opacity:0,y:60,rotateX:40});
    gsap.set(response,{opacity:0,y:20});
    if(attr) gsap.set(attr,{opacity:0});
  };

  ScrollTrigger.create({trigger:block,start:'top 78%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
})();

/* ============================================================
   SCENE 4 — REVELATION (line by line, expanding)
============================================================ */
(function revelationAnimation() {
  const rev = document.getElementById('revelation-text'); if(!rev) return;
  const html=rev.innerHTML, lines=html.split('<br>');
  rev.innerHTML=lines.map(l=>
    `<span class="rev-line" style="display:block;opacity:0;transform:translateX(-32px) skewX(4deg)">${l.trim()}</span>`
  ).join('');

  const play  = ()=>gsap.to('.rev-line',{opacity:1,x:0,skewX:0,duration:0.8,stagger:0.22,ease:'power3.out',overwrite:true});
  const reset = ()=>gsap.set('.rev-line',{opacity:0,x:-32,skewX:4});

  ScrollTrigger.create({trigger:rev,start:'top 80%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
  gsap.fromTo(rev,
    {fontSize:'clamp(1.2rem,2.8vw,1.7rem)',letterSpacing:'0em'},
    {fontSize:'clamp(1.5rem,4vw,2.2rem)',letterSpacing:'0.05em',ease:'none',
     scrollTrigger:{trigger:rev,start:'top 62%',end:'bottom 18%',scrub:1.2}}
  );
})();

/* ============================================================
   SCENE 4 — BLOOM CURTAIN REVEAL
============================================================ */
(function bloomReveal() {
  const img=document.querySelector('#scene-4 .scene-image'); if(!img) return;
  gsap.set(img,{clipPath:'inset(100% 0 0 0)',opacity:1});
  ScrollTrigger.create({
    trigger:'#scene-4', start:'top 62%',
    onEnter:     ()=>gsap.to(img,{clipPath:'inset(0% 0 0 0)',duration:2.0,ease:'power3.inOut'}),
    onLeaveBack: ()=>gsap.set(img,{clipPath:'inset(100% 0 0 0)'})
  });
})();

/* ============================================================
   PETAL DRIFT — scene 4
============================================================ */
(function petalDrift() {
  const s4=document.getElementById('scene-4'); if(!s4) return;
  const spawn=()=>{
    for(let i=0;i<12;i++){
      const p=document.createElement('div'), sz=Math.random()*8+3;
      p.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50% 0 50% 0;background:rgba(232,201,122,${Math.random()*0.4+0.1});left:${Math.random()*100}%;top:-10px;z-index:2;pointer-events:none;`;
      s4.appendChild(p);
      gsap.to(p,{y:s4.offsetHeight+20,x:(Math.random()-0.5)*150,rotation:Math.random()*720,opacity:0,duration:Math.random()*4+2,delay:Math.random()*2,ease:'power1.in',onComplete:()=>p.remove()});
    }
  };
  ScrollTrigger.create({trigger:s4,start:'top 60%',onEnter:spawn,onEnterBack:spawn});
})();

/* ============================================================
   EXTRA IMAGE STRIP (scene 2 bottom)
============================================================ */
(function extraImages() {
  const img=document.querySelector('.extra-img');
  const cap=document.querySelector('.extra-img-caption');
  if (!img) return;
  gsap.set(img,{opacity:0});
  ScrollTrigger.create({
    trigger:'.scene-extra-img', start:'top 85%',
    onEnter:     ()=>{ gsap.to(img,{opacity:1,duration:1.2,ease:'power2.out'}); if(cap) gsap.to(cap,{opacity:1,duration:0.8,delay:0.6}); },
    onLeaveBack: ()=>{ gsap.set(img,{opacity:0}); if(cap) gsap.set(cap,{opacity:0}); },
    onEnterBack: ()=>{ gsap.to(img,{opacity:1,duration:1.2,ease:'power2.out'}); if(cap) gsap.to(cap,{opacity:1,duration:0.8,delay:0.6}); }
  });
  gsap.to(img,{yPercent:-8,ease:'none',scrollTrigger:{trigger:'.scene-extra-img',start:'top bottom',end:'bottom top',scrub:true}});
})();

/* ============================================================
   LETTER — paper drop + typewriter reveal
============================================================ */
(function letterReveal() {
  const lt=document.querySelector('.letter-text'); if(!lt) return;
  const full=lt.innerHTML, plain=lt.textContent;
  let done=false;
  gsap.set(lt,{opacity:0});

  ScrollTrigger.create({
    trigger:lt, start:'top 82%',
    onEnter: ()=>{
      if(done) return; done=true;
      gsap.to(lt,{opacity:1,duration:0.3,ease:'power1.in',onComplete:()=>{
        const parts=full.split('<br><br>');
        lt.innerHTML=''; lt.setAttribute('aria-label',plain);
        parts.forEach((part,i)=>{
          const p=document.createElement('p');
          p.innerHTML=part;
          p.style.cssText=`font-family:var(--font-display);font-style:italic;font-weight:300;font-size:clamp(1rem,1.9vw,1.18rem);line-height:2;color:var(--c-ink);margin-bottom:${i<parts.length-1?'1.6em':'0'};opacity:0;transform:translateY(18px);`;
          lt.appendChild(p);
          gsap.to(p,{opacity:1,y:0,duration:1.4,delay:i*0.95,ease:'power1.inOut'});
        });
      }});
    },
    onLeaveBack:()=>{ done=false; lt.innerHTML=full; gsap.set(lt,{opacity:0}); }
  });
})();

/* ============================================================
   LETTER DESIGN — paper tilt + hover + seal
============================================================ */
(function letterDesign() {
  const wrap=document.querySelector('.letter-wrap');
  const sal =document.querySelector('.letter-salutation');
  const sig =document.querySelector('.letter-signoff');
  const seal=document.querySelector('.letter-seal');
  if(!wrap) return;

  gsap.set(wrap,{opacity:0,y:40,rotation:-1,scale:0.97});
  if(sal)  gsap.set(sal, {opacity:0,x:-20});
  if(sig)  gsap.set(sig, {opacity:0,x:20});
  if(seal) gsap.set(seal,{opacity:0,scale:0.4,rotation:20});

  ScrollTrigger.create({
    trigger:wrap, start:'top 80%',
    onEnter:()=>{
      gsap.timeline()
        .to(wrap,{opacity:1,y:0,rotation:-0.5,scale:1,duration:1.2,ease:'power3.out'})
        .to(sal, {opacity:1,x:0,duration:0.7,ease:'power2.out'},'-=0.5')
        .to(seal,{opacity:1,scale:1,rotation:0,duration:0.6,ease:'back.out(2.5)'},'-=0.4')
        .to(sig, {opacity:1,x:0,duration:0.7,ease:'power2.out',delay:3.2});
    },
    onLeaveBack:()=>{
      gsap.set(wrap,{opacity:0,y:40,rotation:-1,scale:0.97});
      if(sal) gsap.set(sal,{opacity:0,x:-20});
      if(sig) gsap.set(sig,{opacity:0,x:20});
      if(seal) gsap.set(seal,{opacity:0,scale:0.4,rotation:20});
    }
  });

  if(innerWidth>768){
    wrap.addEventListener('mousemove',e=>{
      const r=wrap.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      gsap.to(wrap,{rotationX:(e.clientY-cy)/r.height*3,rotationY:(e.clientX-cx)/r.width*-3,duration:0.4,ease:'power1.out',transformPerspective:900});
    });
    wrap.addEventListener('mouseleave',()=>gsap.to(wrap,{rotationX:0,rotationY:0,rotation:-0.5,duration:0.8,ease:'power2.out'}));
  }
})();


/* ============================================================
   SOIL PARTICLES — Scene 5 Letter Section
   Dark earth-coloured particles fall and drift across the
   letter, depicting it being buried in soil.
   Uses a canvas overlay on the scene-5 section.
============================================================ */
(function soilParticles() {
  const scene5 = document.getElementById('scene-5');
  if (!scene5) return;

  // Create canvas overlay — sits above scene but below content
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    opacity: 0;
  `;
  scene5.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, animating = false, rafId;

  function resize() {
    W = canvas.width  = scene5.offsetWidth;
    H = canvas.height = scene5.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Soil particle types — different sizes, shapes, colours
  // Real soil has varied earthy tones: dark brown, reddish, sandy
  const SOIL_COLORS = [
    'rgba(62, 38, 14, {a})',    // dark earth brown
    'rgba(84, 52, 22, {a})',    // rich brown
    'rgba(105, 65, 28, {a})',   // mid brown
    'rgba(133, 87, 40, {a})',   // warm amber-brown
    'rgba(76, 47, 18, {a})',    // deep soil
    'rgba(48, 30, 10, {a})',    // almost black earth
    'rgba(94, 72, 44, {a})',    // grey-brown
  ];

  function randomColor(alpha) {
    const c = SOIL_COLORS[Math.floor(Math.random() * SOIL_COLORS.length)];
    return c.replace('{a}', alpha.toFixed(2));
  }

  // Create a pool of particles
  function makeParticle() {
    const size = Math.random() * 4 + 1;
    return {
      x:        Math.random() * (W || 800),
      y:        -size - Math.random() * 120,  // start above canvas
      size:     size,
      speedY:   Math.random() * 1.2 + 0.4,    // falling speed
      speedX:   (Math.random() - 0.5) * 0.6,  // slight horizontal drift
      wobble:   Math.random() * Math.PI * 2,  // phase for sine wobble
      wobbleSpeed: Math.random() * 0.03 + 0.01,
      wobbleAmp:   Math.random() * 1.2 + 0.3,
      opacity:  Math.random() * 0.55 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.06,
      // Shape: 0=circle, 1=elongated, 2=irregular clump
      shape:    Math.floor(Math.random() * 3),
      color:    randomColor(Math.random() * 0.5 + 0.2),
    };
  }

  const PARTICLE_COUNT = 80;
  const particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);

  // Draw a single soil particle — varied shapes for realism
  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    if (p.shape === 0) {
      // Circle — small pebble
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.shape === 1) {
      // Elongated — soil grain
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Irregular clump — multiple overlapping circles
      const count = Math.floor(p.size / 1.5) + 2;
      for (let i = 0; i < count; i++) {
        const ox = (Math.random() - 0.5) * p.size;
        const oy = (Math.random() - 0.5) * p.size;
        const r  = Math.random() * p.size * 0.7 + 0.5;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Animation loop
  function tick() {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Update position
      p.wobble  += p.wobbleSpeed;
      p.x       += p.speedX + Math.sin(p.wobble) * p.wobbleAmp;
      p.y       += p.speedY;
      p.rotation += p.rotSpeed;

      // Slow particles near the bottom (settling effect)
      const nearBottom = Math.max(0, (p.y / H - 0.75) * 4);
      p.speedY = Math.max(0.05, p.speedY * (1 - nearBottom * 0.04));

      // Reset when off screen
      if (p.y > H + p.size * 2) {
        Object.assign(p, makeParticle());
        p.y = -p.size;
      }
      if (p.x < -p.size * 2)  p.x = W + p.size;
      if (p.x > W + p.size * 2) p.x = -p.size;

      drawParticle(p);
    });

    rafId = requestAnimationFrame(tick);
  }

  // Start when scene enters, stop when leaves
  ScrollTrigger.create({
    trigger: scene5,
    start: 'top 70%',
    end: 'bottom top',

    onEnter: () => {
      if (animating) return;
      resize();
      animating = true;
      gsap.to(canvas, { opacity: 1, duration: 2.0, ease: 'power1.in' });
      tick();
    },

    onEnterBack: () => {
      if (animating) return;
      resize();
      animating = true;
      gsap.to(canvas, { opacity: 1, duration: 1.5, ease: 'power1.in' });
      tick();
    }
    // No onLeave — particles fall forever once started
  });

  // Reduce particles on mobile for performance
  if (window.innerWidth < 768) {
    particles.splice(50);
  }

})();

/* ============================================================
   SCENE 5 PROSE — fade in on gold background
============================================================ */
document.querySelectorAll('#scene-5 .prose p').forEach((para, idx) => {
  gsap.set(para, { opacity:0, y:28 });

  const delay = (idx % 3) * 0.08;
  const play  = () => gsap.to(para, { opacity:1, y:0, duration:0.85, delay:delay, ease:'power2.out', overwrite:true });
  const reset = () => gsap.set(para, { opacity:0, y:28 });

  ScrollTrigger.create({
    trigger: para, start:'top 88%',
    onEnter:     play,
    onLeaveBack: reset,
    onEnterBack: play
  });
});

/* ============================================================
   FINAL LINES — ultra slow cinematic reveal
============================================================ */
(function finalLines() {
  const lines=document.querySelectorAll('.final-line');
  const cont =document.querySelector('.final-lines');
  if(!lines.length||!cont) return;
  gsap.set(lines,{opacity:0,y:16,letterSpacing:'0em'});

  const play=()=>{
    gsap.killTweensOf(lines);
    lines.forEach((l,i)=>gsap.timeline({delay:i*1.4})
      .to(l,{opacity:1,y:0,duration:3.0,ease:'power1.inOut',overwrite:true})
      .to(l,{letterSpacing:'0.04em',duration:2.0,ease:'power1.out'},'-=2.5')
    );
  };
  const reset=()=>{ gsap.killTweensOf(lines); gsap.set(lines,{opacity:0,y:16,letterSpacing:'0em'}); };

  ScrollTrigger.create({trigger:cont,start:'top 82%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
})();

/* ============================================================
   INK DROP
============================================================ */
(function inkDrop() {
  const first=document.querySelector('.final-line'); if(!first) return;
  const text=first.textContent;
  if(!text.trim().endsWith('.')) return;
  const dot=document.createElement('span');
  dot.textContent='.'; dot.style.cssText='display:inline-block;transform-origin:center';
  first.textContent=text.slice(0,-1); first.appendChild(dot);
  ScrollTrigger.create({
    trigger:first, start:'top 80%',
    onEnter:()=>gsap.timeline({delay:3.4})
      .to(dot,{scale:4,color:'var(--c-gold-dark)',duration:0.3,ease:'power2.out'})
      .to(dot,{scale:1,color:'var(--c-ink)',duration:0.8,ease:'elastic.out(1,0.35)'}),
    onLeaveBack:()=>gsap.set(dot,{scale:1,color:''})
  });
})();

/* ============================================================
   END SCREEN — character stagger
============================================================ */
(function endScreen() {
  const et=document.querySelector('.end-title');
  const es=document.querySelector('.end-subtitle');
  if(!et) return;
  const chars=splitChars(et);
  gsap.set(chars,{opacity:0,y:40,rotateX:40});
  if(es) gsap.set(es,{opacity:0,y:14,letterSpacing:'0em'});

  const play=()=>{
    gsap.to(chars,{opacity:1,y:0,rotateX:0,duration:0.8,stagger:{each:0.04,from:'center'},ease:'power3.out',delay:0.2,overwrite:true});
    if(es) gsap.timeline({delay:1.2}).to(es,{opacity:0.55,y:0,duration:1.4,ease:'power1.inOut',overwrite:true}).to(es,{letterSpacing:'0.35em',duration:1.0,ease:'power1.out'},'-=1.0');
  };
  const reset=()=>{
    gsap.set(chars,{opacity:0,y:40,rotateX:40});
    if(es) gsap.set(es,{opacity:0,y:14,letterSpacing:'0em'});
  };

  ScrollTrigger.create({trigger:'#end-screen',start:'top 72%',onEnter:play,onLeaveBack:reset,onEnterBack:play});
})();

/* ============================================================
   SCROLL VELOCITY STRETCH
============================================================ */
(function velocityStretch() {
  if(innerWidth<768) return;
  let lastY=0,raf;
  window.addEventListener('scroll',()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const v=Math.abs(scrollY-lastY); lastY=scrollY;
      const s=Math.min(v*0.001,0.06);
      document.querySelectorAll('.scene-title').forEach(el=>{
        gsap.to(el,{scaleY:1+s,scaleX:1-s*0.3,duration:0.1,ease:'none',overwrite:'auto'});
        gsap.to(el,{scaleY:1,scaleX:1,duration:0.7,ease:'elastic.out(1,0.25)',delay:0.1});
      });
    });
  },{passive:true});
})();

/* ============================================================
   FLOWER NAV
============================================================ */
(function flowerNav() {
  const nav=document.getElementById('flower-nav'); if(!nav) return;
  const scenes=[
    {id:'hero',label:'Beginning'},{id:'scene-1',label:'The Diagnosis'},
    {id:'scene-2',label:'The Digging'},{id:'scene-3',label:'The Visitors'},
    {id:'scene-4',label:'The Blooming'},{id:'scene-5',label:'The Letter'},
  ];
  scenes.forEach(({id,label},i)=>{
    const btn=document.createElement('button');
    btn.className='flower-petal'; btn.setAttribute('aria-label',`Go to ${label}`); btn.setAttribute('title',label);
    btn.innerHTML=`<svg viewBox="0 0 28 28"><path d="M14 4 C18 8,22 13,14 22 C6 13,10 8,14 4Z" fill="rgba(232,201,122,0.25)" stroke="rgba(232,201,122,0.6)" stroke-width="0.8" class="petal-shape"/><line x1="14" y1="22" x2="14" y2="26" stroke="rgba(232,201,122,0.4)" stroke-width="0.8"/></svg>`;
    btn.addEventListener('click',()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}));
    nav.appendChild(btn);
    const el=document.getElementById(id); if(!el) return;
    ScrollTrigger.create({trigger:el,start:'top center',end:'bottom center',
      onEnter:()=>setActive(i),onEnterBack:()=>setActive(i)});
  });
  function setActive(i){
    nav.querySelectorAll('.flower-petal').forEach((p,j)=>{
      p.classList.toggle('active',i===j);
      const s=p.querySelector('.petal-shape');
      if(s) s.setAttribute('fill',i===j?'rgba(232,201,122,0.85)':'rgba(232,201,122,0.25)');
    });
  }
})();

/* ============================================================
   KEYBOARD NAV
============================================================ */
(function keyboardNav() {
  const ids=['hero','scene-1','scene-2','scene-3','scene-4','scene-5','end-screen'];
  let cur=0;
  ids.forEach((id,i)=>{
    const el=document.getElementById(id); if(!el) return;
    ScrollTrigger.create({trigger:el,start:'top center',end:'bottom center',onEnter:()=>{cur=i;},onEnterBack:()=>{cur=i;}});
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();document.getElementById(ids[Math.min(cur+1,ids.length-1)])?.scrollIntoView({behavior:'smooth'});}
    if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();document.getElementById(ids[Math.max(cur-1,0)])?.scrollIntoView({behavior:'smooth'});}
  });
})();

/* ============================================================
   HERO TYPING
============================================================ */
(function heroTyping() {
  const el=document.querySelector('#hero-typing .typing-text'); if(!el) return;
  const phrases=['About grief, and what comes after.','About soil, and what it remembers.','About the things that keep growing.'];
  let pi=0,ci=0,del=false,paused=false;
  function tick(){
    const cur=phrases[pi];
    if(paused){paused=false;setTimeout(tick,del?80:1800);return;}
    if(!del){el.textContent=cur.slice(0,ci+1);ci++;if(ci===cur.length){if(pi===phrases.length-1)return;paused=true;del=true;setTimeout(tick,1800);return;}}
    else{el.textContent=cur.slice(0,ci-1);ci--;if(ci===0){del=false;pi=(pi+1)%phrases.length;setTimeout(tick,400);return;}}
    setTimeout(tick,del?40:55);
  }
  setTimeout(tick,2400);
})();

/* ============================================================
   AMBIENT SOUND (muted button — functionality kept)
============================================================ */
(function ambientSound() {
  const btn=document.getElementById('sound-toggle'); if(!btn) return;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC){btn.style.display='none';return;}
  let ctx=null,mg=null,playing=false,built=false;
  function build(){
    ctx=new AC();mg=ctx.createGain();mg.gain.value=0;mg.connect(ctx.destination);
    const bl=ctx.sampleRate*4,buf=ctx.createBuffer(1,bl,ctx.sampleRate),d=buf.getChannelData(0);
    let b0=0,b1=0,b2=0;for(let i=0;i<bl;i++){const w=Math.random()*2-1;b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;d[i]=(b0+b1+b2)*0.08;}
    const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
    const lpf=ctx.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=200;
    const wg=ctx.createGain();wg.gain.value=0.4;src.connect(lpf);lpf.connect(wg);wg.connect(mg);src.start();
    const dr=ctx.createOscillator(),dg=ctx.createGain();dr.type='sine';dr.frequency.value=98;dg.gain.value=0.04;dr.connect(dg);dg.connect(mg);dr.start();
    const chime=()=>{
      if(!playing)return;const notes=[392,440,523,587,659],f=notes[Math.floor(Math.random()*notes.length)],t=ctx.currentTime;
      const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.06,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+2.5);
      o.connect(g);g.connect(mg);o.start(t);o.stop(t+2.6);setTimeout(chime,6000+Math.random()*8000);
    };
    setTimeout(chime,3000);built=true;
  }
  btn.addEventListener('click',()=>{
    if(!built)build();if(ctx.state==='suspended')ctx.resume();
    if(playing){gsap.to(mg.gain,{value:0,duration:1.5});playing=false;btn.classList.add('muted');}
    else{gsap.to(mg.gain,{value:0.5,duration:2.0});playing=true;btn.classList.remove('muted');}
  });
})();

/* ============================================================
   LOADING SCREEN
============================================================ */
(function loadingScreen() {
  const l=document.getElementById('loading-screen'); if(!l) return;
  document.fonts.ready.then(()=>setTimeout(()=>l.classList.add('done'),1500));
})();

/* ============================================================
   READING TIME
============================================================ */
(function readingTime() {
  const el=document.getElementById('reading-time'); if(!el) return;
  const update=()=>{
    const p=scrollY/(document.body.scrollHeight-innerHeight);
    const m=Math.max(0,Math.ceil(4*(1-p)));
    el.textContent=p<0.02?'4 min read':m<=0?'fin.':`~${m} min left`;
  };
  window.addEventListener('scroll',update,{passive:true}); update();
})();

/* ============================================================
   SCENE FADE STRIPS
============================================================ */
(function sceneFadeStrips() {
  const map={'scene-1':'#1c1610','scene-2':'#2a1f0f','scene-3':'#3d2b0a','scene-4':'#f5e6c8'};
  document.querySelectorAll('.scene-fade-strip').forEach(strip=>{
    const scene=strip.closest('.scene'); if(!scene) return;
    const next=scene.nextElementSibling;
    strip.style.background=`linear-gradient(to bottom,transparent,${next?(map[next.id]||'transparent'):'transparent'})`;
  });
})();

/* ============================================================
   PROGRESS BAR COLOR
============================================================ */
ScrollTrigger.create({trigger:'#scene-4',start:'top 50%',onEnter:()=>gsap.to('#progress-bar',{background:'#c9a84c',duration:1.0}),onLeaveBack:()=>gsap.to('#progress-bar',{background:'#e8c97a',duration:1.0})});
ScrollTrigger.create({trigger:'#scene-5',start:'top 50%',onEnter:()=>gsap.to('#progress-bar',{background:'#8b6914',duration:1.0}),onLeaveBack:()=>gsap.to('#progress-bar',{background:'#c9a84c',duration:1.0})});

/* ============================================================
   MOBILE SWIPE
============================================================ */
(function touchSwipe() {
  if(innerWidth>768) return;
  const ids=['hero','scene-1','scene-2','scene-3','scene-4','scene-5','end-screen'];
  let cur=0,sy=0;
  ids.forEach((id,i)=>{const el=document.getElementById(id);if(!el)return;ScrollTrigger.create({trigger:el,start:'top center',end:'bottom center',onEnter:()=>{cur=i;},onEnterBack:()=>{cur=i;}});});
  document.addEventListener('touchstart',e=>{sy=e.touches[0].clientY;},{passive:true});
  document.addEventListener('touchend',e=>{
    const d=sy-e.changedTouches[0].clientY; if(Math.abs(d)<60) return;
    const next=d>0?ids[Math.min(cur+1,ids.length-1)]:ids[Math.max(cur-1,0)];
    document.getElementById(next)?.scrollIntoView({behavior:'smooth'});
  },{passive:true});
})();

/* ============================================================
   PERFORMANCE
============================================================ */
document.fonts.ready.then(()=>{
  ScrollTrigger.refresh(true);
  setTimeout(unstick,3000);
  setTimeout(unstick,7000);
});
if(innerWidth<768) ScrollTrigger.config({limitCallbacks:true});

/* ============================================================
   REDUCED MOTION
============================================================ */
if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
  ScrollTrigger.getAll().forEach(st=>st.kill());
  gsap.globalTimeline.clear();
  document.querySelectorAll('*').forEach(el=>{
    if(el.style.opacity==='0') el.style.opacity='1';
    if(el.style.transform&&el.style.transform!=='none') el.style.transform='none';
  });
}