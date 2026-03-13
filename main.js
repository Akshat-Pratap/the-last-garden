/**
 * THE LAST GARDEN — main.js  (v2)
 * - Fixed: all scroll animations replay when scrolling back up
 * - Added: floating particles, cursor glow, scene wipe transitions,
 *          ken-burns on images, text shimmer, ambient line, ink drop,
 *          scene number counter, petal drift, and more.
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
    s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(60px)';
    el.appendChild(s);
    return s;
  });
}

function splitWords(el) {
  const text = el.textContent;
  el.innerHTML = '';
  el.setAttribute('aria-label', text);
  return text.split(' ').map((word, i, arr) => {
    const s = document.createElement('span');
    s.textContent = word + (i < arr.length - 1 ? ' ' : '');
    s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(22px)';
    el.appendChild(s);
    return s;
  });
}

/* ============================================================
   0. RESET PLACEHOLDER VISIBILITY
============================================================ */
document.querySelectorAll([
  '.hero-eyebrow', '.hero-title', '.hero-subtitle', '.hero-scroll-hint',
  '.scene-number', '.scene-title',
  '.prose p', '.dialogue-line', '.revelation',
  '.letter-text', '.final-line',
  '.end-title', '.end-subtitle'
].join(',')).forEach(el => {
  el.style.opacity = '';
  el.style.transform = '';
});

/* ============================================================
   NEW — CURSOR GLOW
============================================================ */
(function cursorGlow() {
  if (window.innerWidth < 768) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9999;
    width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle,rgba(232,201,122,0.07) 0%,transparent 70%);
    transform:translate(-50%,-50%);top:0;left:0;
  `;
  document.body.appendChild(glow);
  let mx = window.innerWidth/2, my = window.innerHeight/2, cx = mx, cy = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    cx += (mx-cx)*0.08; cy += (my-cy)*0.08;
    glow.style.left = cx+'px'; glow.style.top = cy+'px';
    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   NEW — FLOATING PARTICLES (hero)
============================================================ */
(function floatingParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; }
  resize();
  window.addEventListener('resize', resize, { passive:true });
  const particles = Array.from({length:55}, () => ({
    x: Math.random()*(W||800), y: Math.random()*(H||600),
    r: Math.random()*1.8+0.4, speed: Math.random()*0.4+0.15,
    opacity: Math.random()*0.45+0.1, drift: (Math.random()-0.5)*0.3
  }));
  (function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(232,201,122,${p.opacity})`; ctx.fill();
      p.y -= p.speed; p.x += p.drift;
      if (p.y < -4) { p.y = H+4; p.x = Math.random()*W; }
      if (p.x < -4 || p.x > W+4) p.x = Math.random()*W;
    });
    requestAnimationFrame(draw);
  })();
})();

/* ============================================================
   NEW — SCENE WIPE TRANSITIONS
============================================================ */
(function sceneWipes() {
  document.querySelectorAll('.scene').forEach(scene => {
    const wipe = document.createElement('div');
    wipe.style.cssText = `position:absolute;top:0;left:0;width:0%;height:2px;
      background:linear-gradient(to right,transparent,rgba(232,201,122,0.7),transparent);
      z-index:10;pointer-events:none;`;
    scene.appendChild(wipe);
    ScrollTrigger.create({
      trigger: scene, start: 'top 75%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.fromTo(wipe,
          { width:'0%', opacity:1 },
          { width:'100%', duration:1.1, ease:'power2.inOut',
            onComplete: () => gsap.to(wipe, { opacity:0, duration:0.5, delay:0.1 }) }
        );
      },
      onLeaveBack: () => gsap.set(wipe, { width:'0%', opacity:0 })
    });
  });
})();

/* ============================================================
   NEW — AMBIENT VERTICAL LINE
============================================================ */
(function ambientLines() {
  document.querySelectorAll('.scene').forEach(scene => {
    const line = document.createElement('div');
    line.style.cssText = `position:absolute;left:clamp(12px,3vw,40px);top:10%;
      width:1px;height:0%;pointer-events:none;z-index:1;
      background:linear-gradient(to bottom,transparent,rgba(232,201,122,0.25),transparent);`;
    scene.appendChild(line);
    gsap.to(line, {
      height:'80%', duration:1.6, ease:'power2.out',
      scrollTrigger: {
        trigger: scene, start:'top 70%',
        toggleActions:'play none none reverse'
      }
    });
  });
})();

/* ============================================================
   1. HERO ENTRANCE
============================================================ */
(function heroEntrance() {
  const heroTitle = document.querySelector('.hero-title');
  const titleChars = splitChars(heroTitle);
  const tl = gsap.timeline({ delay:0.4 });
  tl.from('.hero-eyebrow', { opacity:0, y:20, duration:0.8, ease:'power2.out' });
  tl.to(titleChars, { opacity:1, y:0, duration:0.65, ease:'power3.out', stagger:0.032 }, '-=0.3');
  tl.from('.hero-subtitle', { opacity:0, y:16, duration:0.9, ease:'power2.out' }, '-=0.3');
  tl.from('.hero-scroll-hint', { opacity:0, duration:1.1, ease:'power1.inOut' }, '+=0.4');
})();

/* ============================================================
   NEW — HERO TITLE SHIMMER ON HOVER
============================================================ */
(function heroShimmer() {
  if (window.innerWidth < 768) return;
  const chars = document.querySelectorAll('.hero-title span');
  if (!chars.length) return;
  chars.forEach((char, i) => {
    char.addEventListener('mouseenter', () => {
      gsap.to(char, { color:'#e8c97a', y:-6, duration:0.2, ease:'power2.out' });
      [-1,1].forEach(o => { const n = chars[i+o]; if(n) gsap.to(n, { color:'#c9a84c', y:-3, duration:0.2, delay:0.05, ease:'power2.out' }); });
    });
    char.addEventListener('mouseleave', () => {
      gsap.to(char, { color:'', y:0, duration:0.4, ease:'power2.inOut' });
      [-1,1].forEach(o => { const n = chars[i+o]; if(n) gsap.to(n, { color:'', y:0, duration:0.4, ease:'power2.inOut' }); });
    });
  });
})();

/* ============================================================
   2. BACKGROUND COLOR JOURNEY
============================================================ */
const bgMap = [
  { id:'hero',       color:'#0f0e0c' },
  { id:'scene-1',    color:'#1c1610' },
  { id:'scene-2',    color:'#1c1610' },
  { id:'scene-3',    color:'#2a1f0f' },
  { id:'scene-4',    color:'#3d2b0a' },
  { id:'scene-5',    color:'#f5e6c8' },
  { id:'end-screen', color:'#f5e6c8' },
];
bgMap.forEach(({ id, color }, i) => {
  const el = document.getElementById(id);
  if (!el) return;
  ScrollTrigger.create({
    trigger: el, start: 'top 55%',
    onEnter:     () => gsap.to('body', { backgroundColor:color, duration:1.4, ease:'power1.inOut' }),
    onLeaveBack: () => { const prev = bgMap[i-1]; if(prev) gsap.to('body', { backgroundColor:prev.color, duration:1.4, ease:'power1.inOut' }); }
  });
});

/* ============================================================
   3. SCENE IMAGES — ken-burns + parallax + fade
============================================================ */
document.querySelectorAll('.scene-image').forEach(img => {
  const scene = img.closest('.scene');
  gsap.fromTo(img, { scale:1.12 }, {
    scale:1.0, ease:'none',
    scrollTrigger: { trigger:scene, start:'top bottom', end:'bottom top', scrub:1.5 }
  });
  ScrollTrigger.create({
    trigger: scene, start:'top 78%', end:'top 20%',
    onEnter:     () => gsap.to(img, { opacity:0.82, duration:1.6, ease:'power2.out' }),
    onLeaveBack: () => gsap.to(img, { opacity:0,    duration:0.9, ease:'power2.in'  }),
    onEnterBack: () => gsap.to(img, { opacity:0.82, duration:1.6, ease:'power2.out' }),
  });
  gsap.to(img, {
    yPercent:-10, ease:'none',
    scrollTrigger: { trigger:scene, start:'top bottom', end:'bottom top', scrub:true }
  });
});

/* ============================================================
   4. SCENE HEADERS
============================================================ */
document.querySelectorAll('.scene').forEach(scene => {
  const num   = scene.querySelector('.scene-number');
  const title = scene.querySelector('.scene-title');
  if (!num || !title) return;
  gsap.set([num, title], { opacity:0, y:30 });
  const tl = gsap.timeline({
    scrollTrigger: { trigger:scene, start:'top 72%', toggleActions:'play none none reverse' }
  });
  tl.to(num,   { opacity:1, y:0, duration:0.55, ease:'power2.out' })
    .to(title,  { opacity:1, y:0, duration:0.85, ease:'power3.out' }, '-=0.25');
});

/* ============================================================
   NEW — SCENE NUMBER LETTER-SPACING PULSE
============================================================ */
document.querySelectorAll('.scene-number').forEach(num => {
  gsap.fromTo(num,
    { letterSpacing:'0.7em' },
    {
      letterSpacing:'0.4em', duration:0.8, ease:'power2.out',
      scrollTrigger: { trigger:num, start:'top 80%', toggleActions:'play none none reverse' }
    }
  );
});

/* ============================================================
   5. PROSE PARAGRAPHS — word-by-word
============================================================ */
document.querySelectorAll('.prose p').forEach(para => {
  if (para.closest('#scene-5')) return;

  if (para.querySelector('.word-terminal')) {
    gsap.set(para, { opacity:0, y:20 });
    gsap.to(para, {
      opacity:1, y:0, duration:0.9, ease:'power2.out',
      scrollTrigger: { trigger:para, start:'top 86%', toggleActions:'play none none reverse' }
    });
    const terminal = para.querySelector('.word-terminal');
    ScrollTrigger.create({
      trigger: terminal, start:'top 82%',
      onEnter: () => {
        gsap.timeline()
          .to(terminal, { scale:2.1, color:'#e8c97a', duration:0.45, ease:'power2.out' })
          .to(terminal, { scale:1.0,                  duration:0.55, ease:'elastic.out(1,0.45)' });
      },
      onLeaveBack: () => gsap.set(terminal, { scale:1, color:'' })
    });
    return;
  }

  const words = splitWords(para);
  gsap.set(para, { opacity:1, transform:'none' });
  ScrollTrigger.create({
    trigger: para, start:'top 89%',
    onEnter:     () => gsap.to(words, { opacity:1, y:0, duration:0.48, stagger:0.022, ease:'power2.out' }),
    onLeaveBack: () => gsap.set(words, { opacity:0, y:22 })
  });
});

/* ============================================================
   6. DIALOGUE LINES
============================================================ */
document.querySelectorAll('.dialogue-line').forEach(line => {
  const isResponse = line.classList.contains('response');
  gsap.set(line, { opacity:0, x: isResponse ? 35 : -35 });
  gsap.to(line, {
    opacity:1, x:0, duration:0.75, ease:'power2.out',
    scrollTrigger: { trigger:line, start:'top 89%', toggleActions:'play none none reverse' }
  });
});

/* ============================================================
   NEW — DIALOGUE BORDER PULSE
============================================================ */
document.querySelectorAll('.dialogue-line').forEach(line => {
  ScrollTrigger.create({
    trigger: line, start:'top 88%',
    toggleActions: 'play none none reverse',
    onEnter:     () => gsap.fromTo(line, { borderLeftColor:'transparent', borderRightColor:'transparent' },
                                         { borderLeftColor:'var(--c-gold-mid)', borderRightColor:'var(--c-gold-mid)', duration:0.5, ease:'power2.out' }),
    onLeaveBack: () => gsap.set(line, { borderLeftColor:'transparent', borderRightColor:'transparent' })
  });
});

/* ============================================================
   7. CHARACTER NAMES
============================================================ */
document.querySelectorAll('.character-name').forEach(name => {
  ScrollTrigger.create({
    trigger: name, start:'top 86%',
    onEnter: () => {
      gsap.timeline()
        .to(name, { color:'#e8c97a', scale:1.06, duration:0.35, ease:'power2.out' })
        .to(name, { scale:1.0, duration:0.35, ease:'power2.inOut' });
    },
    onLeaveBack: () => gsap.set(name, { color:'', scale:1 })
  });
});

/* ============================================================
   8. REVELATION — expand on scrub
============================================================ */
(function revelationAnimation() {
  const rev = document.getElementById('revelation-text');
  if (!rev) return;

  // Line-by-line split
  const html  = rev.innerHTML;
  const lines = html.split('<br>');
  rev.innerHTML = lines.map(l =>
    `<span class="rev-line" style="display:block;opacity:0;transform:translateX(-22px)">${l}</span>`
  ).join('');

  ScrollTrigger.create({
    trigger: rev, start:'top 80%',
    toggleActions: 'play none none reverse',
    onEnter:     () => gsap.to('.rev-line', { opacity:1, x:0, duration:0.7, stagger:0.18, ease:'power2.out' }),
    onLeaveBack: () => gsap.set('.rev-line', { opacity:0, x:-22 })
  });

  gsap.fromTo(rev,
    { fontSize:'clamp(1.2rem,3vw,1.75rem)', letterSpacing:'0em' },
    { fontSize:'clamp(1.5rem,4vw,2.2rem)',  letterSpacing:'0.04em', ease:'none',
      scrollTrigger: { trigger:rev, start:'top 62%', end:'bottom 18%', scrub:1 }
    }
  );
})();

/* ============================================================
   9. SCENE 4 IMAGE — bloom curtain
============================================================ */
(function bloomReveal() {
  const img = document.querySelector('#scene-4 .scene-image');
  if (!img) return;
  gsap.set(img, { clipPath:'inset(100% 0 0 0)', opacity:1 });
  gsap.to(img, {
    clipPath:'inset(0% 0 0 0)', duration:1.9, ease:'power3.inOut',
    scrollTrigger: { trigger:'#scene-4', start:'top 62%', toggleActions:'play none none reverse' }
  });
})();

/* ============================================================
   NEW — PETAL DRIFT (scene 4)
============================================================ */
(function petalDrift() {
  const scene4 = document.getElementById('scene-4');
  if (!scene4) return;

  function spawnPetals() {
    for (let i = 0; i < 10; i++) {
      const petal = document.createElement('div');
      const size  = Math.random()*6+4;
      petal.style.cssText = `position:absolute;width:${size}px;height:${size}px;
        border-radius:50% 0 50% 0;
        background:rgba(232,201,122,${Math.random()*0.3+0.1});
        left:${Math.random()*100}%;top:-10px;z-index:2;pointer-events:none;`;
      scene4.appendChild(petal);
      gsap.to(petal, {
        y: scene4.offsetHeight+20, x:(Math.random()-0.5)*120,
        rotation:Math.random()*360, opacity:0,
        duration:Math.random()*3+2, delay:Math.random()*1.5, ease:'power1.in',
        onComplete: () => petal.remove()
      });
    }
  }

  ScrollTrigger.create({
    trigger: scene4, start:'top 60%',
    onEnter:     spawnPetals,
    onEnterBack: spawnPetals
  });
})();

/* ============================================================
   10. LETTER — paragraph reveal
============================================================ */
(function letterReveal() {
  const letterText = document.querySelector('.letter-text');
  if (!letterText) return;
  const fullHTML  = letterText.innerHTML;
  const plainText = letterText.textContent;
  let hasAnimated = false;

  gsap.set(letterText, { opacity:0 });

  ScrollTrigger.create({
    trigger: letterText, start:'top 82%',
    onEnter:     () => animate(),
    onLeaveBack: () => { hasAnimated=false; letterText.innerHTML=fullHTML; gsap.set(letterText,{opacity:0}); }
  });

  function animate() {
    if (hasAnimated) return;
    hasAnimated = true;
    gsap.to(letterText, {
      opacity:1, duration:0.3, ease:'power1.in',
      onComplete: () => {
        const lines = fullHTML.split('<br><br>');
        letterText.innerHTML = '';
        letterText.setAttribute('aria-label', plainText);
        lines.forEach((line, i) => {
          const p = document.createElement('p');
          p.innerHTML = line;
          p.style.cssText = `font-family:var(--font-display);font-style:italic;font-weight:300;
            font-size:clamp(1rem,2.2vw,1.2rem);line-height:2;color:var(--c-ink);
            margin-bottom:${i<lines.length-1?'1.6em':'0'};opacity:0;transform:translateY(16px);`;
          letterText.appendChild(p);
          gsap.to(p, { opacity:1, y:0, duration:1.3, delay:i*0.85, ease:'power1.inOut' });
        });
      }
    });
  }
})();

/* ============================================================
   11. FINAL LINES
============================================================ */
(function finalLines() {
  const lines     = document.querySelectorAll('.final-line');
  const container = document.querySelector('.final-lines');
  if (!lines.length || !container) return;

  gsap.set(lines, { opacity:0, y:12 });

  ScrollTrigger.create({
    trigger: container, start:'top 82%',
    onEnter:     () => lines.forEach((l,i) => gsap.to(l, { opacity:1, y:0, duration:3.0, delay:i*1.3, ease:'power1.inOut' })),
    onLeaveBack: () => gsap.set(lines, { opacity:0, y:12 })
  });
})();

/* ============================================================
   NEW — INK DROP on final period
============================================================ */
(function inkDrop() {
  const firstFinal = document.querySelector('.final-line');
  if (!firstFinal) return;
  const text = firstFinal.textContent;
  if (!text.trim().endsWith('.')) return;
  const dot = document.createElement('span');
  dot.textContent = '.';
  dot.style.cssText = 'display:inline-block;transform-origin:center';
  firstFinal.textContent = text.slice(0,-1);
  firstFinal.appendChild(dot);
  ScrollTrigger.create({
    trigger: firstFinal, start:'top 80%',
    onEnter: () => {
      gsap.timeline({ delay:3.2 })
        .to(dot, { scale:3.5, color:'var(--c-gold-dark)', duration:0.3, ease:'power2.out' })
        .to(dot, { scale:1.0, color:'var(--c-ink)',       duration:0.6, ease:'elastic.out(1,0.4)' });
    },
    onLeaveBack: () => gsap.set(dot, { scale:1, color:'' })
  });
})();

/* ============================================================
   12. END SCREEN — blur fade + char stagger
============================================================ */
(function endScreen() {
  const endTitle    = document.querySelector('.end-title');
  const endSubtitle = document.querySelector('.end-subtitle');
  if (!endTitle) return;

  const chars = splitChars(endTitle);
  gsap.set(chars,       { opacity:0, y:30 });
  gsap.set(endSubtitle, { opacity:0, y:10 });

  ScrollTrigger.create({
    trigger: '#end-screen', start:'top 72%',
    toggleActions: 'play none none reverse',
    onEnter: () => {
      gsap.to(chars, { opacity:1, y:0, duration:0.7, stagger:0.04, ease:'power3.out', delay:0.2 });
      gsap.to(endSubtitle, { opacity:0.55, y:0, duration:1.4, ease:'power1.inOut', delay:1.0 });
    },
    onLeaveBack: () => {
      gsap.set(chars, { opacity:0, y:30 });
      gsap.set(endSubtitle, { opacity:0, y:10 });
    }
  });
})();

/* ============================================================
   13. SCENE 5 PROSE
============================================================ */
document.querySelectorAll('#scene-5 .prose p').forEach(para => {
  const words = splitWords(para);
  gsap.set(para, { opacity:1, transform:'none' });
  ScrollTrigger.create({
    trigger: para, start:'top 88%',
    onEnter:     () => gsap.to(words, { opacity:1, y:0, duration:0.5, stagger:0.022, ease:'power2.out' }),
    onLeaveBack: () => gsap.set(words, { opacity:0, y:22 })
  });
});

/* ============================================================
   NEW — SCROLL VELOCITY STRETCH
============================================================ */
(function velocityStretch() {
  if (window.innerWidth < 768) return;
  let lastY = 0, raf;
  window.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const v = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      const stretch = Math.min(v * 0.0008, 0.04);
      document.querySelectorAll('.scene-title, .hero-title').forEach(el => {
        gsap.to(el, { scaleY:1+stretch, duration:0.1, ease:'none', overwrite:'auto' });
        gsap.to(el, { scaleY:1, duration:0.5, ease:'elastic.out(1,0.3)', delay:0.1, overwrite:false });
      });
    });
  }, { passive:true });
})();

/* ============================================================
   14. NAV DOTS
============================================================ */
(function navDots() {
  const sceneIds = ['hero','scene-1','scene-2','scene-3','scene-4','scene-5'];
  const dots     = document.querySelectorAll('.nav-dot');
  sceneIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start:'top center', end:'bottom center',
      onEnter:     () => setDot(i),
      onEnterBack: () => setDot(i)
    });
  });
  function setDot(i) { dots.forEach((d,j) => d.classList.toggle('active', i===j)); }
})();

/* ============================================================
   15. KEYBOARD NAV
============================================================ */
(function keyboardNav() {
  const ids = ['hero','scene-1','scene-2','scene-3','scene-4','scene-5','end-screen'];
  let cur = 0;
  ids.forEach((id,i) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger:el, start:'top center', end:'bottom center',
      onEnter:     () => { cur=i; },
      onEnterBack: () => { cur=i; }
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key==='ArrowDown'||e.key==='PageDown') {
      e.preventDefault();
      document.getElementById(ids[Math.min(cur+1,ids.length-1)])?.scrollIntoView({behavior:'smooth'});
    }
    if (e.key==='ArrowUp'||e.key==='PageUp') {
      e.preventDefault();
      document.getElementById(ids[Math.max(cur-1,0)])?.scrollIntoView({behavior:'smooth'});
    }
  });
})();

/* ============================================================
   16. PERFORMANCE + MOBILE
============================================================ */
document.fonts.ready.then(() => ScrollTrigger.refresh());
if (window.innerWidth < 768) ScrollTrigger.config({ limitCallbacks:true });

/* ============================================================
   17. REDUCED MOTION
============================================================ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  ScrollTrigger.getAll().forEach(st => st.kill());
  gsap.globalTimeline.clear();
  document.querySelectorAll([
    '.hero-eyebrow','.hero-title','.hero-subtitle','.hero-scroll-hint',
    '.scene-number','.scene-title','.prose p','.dialogue-line',
    '.revelation','.rev-line','.letter-text','.final-line',
    '.end-title','.end-subtitle','.scene-image','.word-terminal'
  ].join(',')).forEach(el => {
    gsap.set(el, { opacity:1, transform:'none', filter:'none', fontSize:'', letterSpacing:'', clipPath:'none' });
  });
}