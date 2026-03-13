/**
 * THE LAST GARDEN — main.js
 * All GSAP animations: timeline sequencing, ScrollTrigger,
 * parallax, typography effects, color transitions.
 */

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   UTILITIES
============================================================ */

/**
 * Split text into individual character spans.
 * Used for staggered letter animations without the paid SplitText plugin.
 */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text); // preserve accessibility
  return text.split('').map(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(60px)';
    el.appendChild(span);
    return span;
  });
}

/**
 * Split text into word spans for word-by-word reveals.
 */
function splitWords(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  return text.split(' ').map((word, i, arr) => {
    const span = document.createElement('span');
    span.textContent = word + (i < arr.length - 1 ? ' ' : '');
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(20px)';
    el.appendChild(span);
    return span;
  });
}

/* ============================================================
   0. REMOVE PLACEHOLDER VISIBILITY
   (Step 4 set everything to opacity:1 for readability.
    We now hand control entirely to GSAP.)
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
   1. HERO ENTRANCE — timeline on page load
============================================================ */
(function heroEntrance() {
  // Split hero title into characters
  const heroTitle   = document.querySelector('.hero-title');
  const titleChars  = splitChars(heroTitle);

  const tl = gsap.timeline({ delay: 0.3 });

  // Eyebrow fades in
  tl.to('.hero-eyebrow', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out'
  });

  // Title letters scatter up one by one
  tl.to(titleChars, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.035
  }, '-=0.4');

  // Subtitle glides in
  tl.to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.2');

  // Scroll hint appears last
  tl.to('.hero-scroll-hint', {
    opacity: 1,
    duration: 1.2,
    ease: 'power1.inOut'
  }, '+=0.3');
})();

/* ============================================================
   2. BACKGROUND COLOR JOURNEY
   Each scene transition tweens the body background.
============================================================ */
const bgColors = {
  'scene-1': '#1c1610',
  'scene-2': '#1c1610',
  'scene-3': '#2a1f0f',
  'scene-4': '#3d2b0a',
  'scene-5': '#f5e6c8',
  'end-screen': '#f5e6c8'
};

Object.entries(bgColors).forEach(([id, color]) => {
  const el = document.getElementById(id);
  if (!el) return;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 60%',
    onEnter: () => gsap.to('body', { backgroundColor: color, duration: 1.4, ease: 'power1.inOut' }),
    onLeaveBack: () => {
      // revert to previous scene color on scroll up
      const scenes = Object.keys(bgColors);
      const idx = scenes.indexOf(id);
      if (idx > 0) {
        gsap.to('body', { backgroundColor: bgColors[scenes[idx - 1]], duration: 1.4, ease: 'power1.inOut' });
      }
    }
  });
});

/* ============================================================
   3. SCENE IMAGES — parallax + reveal
============================================================ */
document.querySelectorAll('.scene-image').forEach(img => {
  const scene = img.closest('.scene');

  // Reveal image as scene enters
  ScrollTrigger.create({
    trigger: scene,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(img, {
        opacity: 0.85,
        scale: 1.0,
        duration: 1.8,
        ease: 'power2.out'
      });
    }
  });

  // Parallax — image moves at 40% of scroll speed
  gsap.to(img, {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: scene,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
});

/* ============================================================
   4. SCENE HEADERS — number + title slide up
============================================================ */
document.querySelectorAll('.scene').forEach(scene => {
  const num   = scene.querySelector('.scene-number');
  const title = scene.querySelector('.scene-title');
  if (!num || !title) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top 70%',
      toggleActions: 'play none none none'
    }
  });

  tl.to(num, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to(title, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3');
});

/* ============================================================
   5. PROSE PARAGRAPHS — staggered word reveal per paragraph
============================================================ */
document.querySelectorAll('.prose p').forEach((para, i) => {
  // Skip paragraphs that contain the word-terminal span (handled separately)
  if (para.querySelector('.word-terminal')) {
    // Animate the paragraph itself
    gsap.to(para, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: para,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    // Animate the word "terminal" with a scale burst
    const terminal = para.querySelector('.word-terminal');
    ScrollTrigger.create({
      trigger: terminal,
      start: 'top 80%',
      onEnter: () => {
        gsap.timeline()
          .to(terminal, { scale: 2.0, color: '#e8c97a', duration: 0.5, ease: 'power2.out' })
          .to(terminal, { scale: 1.0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
          .to(terminal, { color: '#e8c97a', duration: 0 }); // keep accent color
      }
    });

    return;
  }

  // Split into words for staggered reveal
  const words = splitWords(para);

  // Animate paragraph container first (handles opacity/transform set in CSS)
  gsap.set(para, { opacity: 1, transform: 'none' });

  gsap.to(words, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.025,
    scrollTrigger: {
      trigger: para,
      start: 'top 88%',
      toggleActions: 'play none none none'
    }
  });
});

/* ============================================================
   6. DIALOGUE LINES — slide in from sides
============================================================ */
document.querySelectorAll('.dialogue-line').forEach(line => {
  const isResponse = line.classList.contains('response');

  gsap.to(line, {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: line,
      start: 'top 88%',
      toggleActions: 'play none none none'
    }
  });
});

/* ============================================================
   7. CHARACTER NAMES — warm gold pulse on reveal
============================================================ */
document.querySelectorAll('.character-name').forEach(name => {
  ScrollTrigger.create({
    trigger: name,
    start: 'top 85%',
    onEnter: () => {
      gsap.timeline()
        .to(name, { color: '#e8c97a', scale: 1.05, duration: 0.4, ease: 'power2.out' })
        .to(name, { scale: 1.0, duration: 0.4, ease: 'power2.inOut' });
    }
  });
});

/* ============================================================
   8. SCENE 4 — THE REVELATION
   Font size expands + letter spacing opens on scroll
============================================================ */
(function revelationAnimation() {
  const rev = document.getElementById('revelation-text');
  if (!rev) return;

  // Initial state
  gsap.set(rev, { opacity: 0, y: 30 });

  // Entrance
  gsap.to(rev, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: rev,
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Font size + letter spacing expand while in viewport (scrub)
  gsap.to(rev, {
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    letterSpacing: '0.04em',
    ease: 'none',
    scrollTrigger: {
      trigger: rev,
      start: 'top 60%',
      end: 'bottom 20%',
      scrub: 1
    }
  });
})();

/* ============================================================
   9. SCENE 4 IMAGE — bloom reveal (clip-path curtain)
============================================================ */
(function bloomReveal() {
  const scene4img = document.querySelector('#scene-4 .scene-image');
  if (!scene4img) return;

  gsap.set(scene4img, { clipPath: 'inset(100% 0 0 0)', scale: 1.2, opacity: 1 });

  gsap.to(scene4img, {
    clipPath: 'inset(0% 0 0 0)',
    scale: 1.0,
    duration: 1.8,
    ease: 'power3.inOut',
    scrollTrigger: {
      trigger: '#scene-4',
      start: 'top 60%',
      toggleActions: 'play none none none'
    }
  });
})();

/* ============================================================
   10. SCENE 5 — LETTER typewriter reveal
============================================================ */
(function letterTypewriter() {
  const letterText = document.querySelector('.letter-text');
  if (!letterText) return;

  // Get the full HTML content (preserves <br> tags)
  const fullHTML = letterText.innerHTML;
  const plainText = letterText.textContent;

  // Set initial state
  gsap.set(letterText, { opacity: 0 });

  ScrollTrigger.create({
    trigger: letterText,
    start: 'top 80%',
    onEnter: () => {
      // Fade the container in, then reveal text character by character
      gsap.to(letterText, {
        opacity: 1,
        duration: 0.4,
        ease: 'power1.in',
        onComplete: () => {
          // Typewriter effect using a counter approach
          letterText.innerHTML = '';
          letterText.setAttribute('aria-label', plainText);

          let charIndex = 0;
          const chars = plainText.split('');
          const totalChars = chars.length;

          // Re-inject HTML structure but reveal chars progressively
          // We use a visible counter trick with a clip animation
          letterText.innerHTML = fullHTML;
          letterText.style.setProperty('--char-count', totalChars);

          // Instead: fade in line-by-line for simplicity + elegance
          const lines = fullHTML.split('<br><br>');
          letterText.innerHTML = '';

          lines.forEach((line, i) => {
            const p = document.createElement('p');
            p.innerHTML = line;
            p.style.cssText = `
              font-family: var(--font-display);
              font-style: italic;
              font-weight: 300;
              font-size: clamp(1rem, 2.2vw, 1.2rem);
              line-height: 2;
              color: var(--c-ink);
              margin-bottom: ${i < lines.length - 1 ? '1.6em' : '0'};
              opacity: 0;
            `;
            letterText.appendChild(p);

            gsap.to(p, {
              opacity: 1,
              duration: 1.4,
              delay: i * 0.9,
              ease: 'power1.inOut'
            });
          });
        }
      });
    }
  });
})();

/* ============================================================
   11. SCENE 5 — FINAL LINES (ultra-slow reveal)
============================================================ */
document.querySelectorAll('.final-line').forEach((line, i) => {
  gsap.to(line, {
    opacity: 1,
    duration: 3.0,
    delay: i * 1.2,
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '.final-lines',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
});

/* ============================================================
   12. END SCREEN — title returns, fades in from blur
============================================================ */
(function endScreen() {
  const endTitle    = document.querySelector('.end-title');
  const endSubtitle = document.querySelector('.end-subtitle');
  if (!endTitle) return;

  gsap.set(endTitle,    { opacity: 0, filter: 'blur(8px)', y: 20 });
  gsap.set(endSubtitle, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#end-screen',
      start: 'top 70%',
      toggleActions: 'play none none none'
    }
  });

  tl.to(endTitle, {
    opacity: 0.9,
    filter: 'blur(0px)',
    y: 0,
    duration: 2.0,
    ease: 'power2.out'
  }).to(endSubtitle, {
    opacity: 0.6,
    duration: 1.5,
    ease: 'power1.inOut'
  }, '-=0.5');
})();

/* ============================================================
   13. SCENE 5 PROSE — dark ink text fade (special handling)
============================================================ */
document.querySelectorAll('#scene-5 .prose p').forEach(para => {
  gsap.set(para, { opacity: 1, transform: 'none' });
});

/* ============================================================
   14. MOBILE — reduce parallax intensity
============================================================ */
if (window.innerWidth < 768) {
  ScrollTrigger.getAll().forEach(st => {
    // Reduce scrub intensity on mobile
    if (st.vars && st.vars.scrub) {
      st.vars.scrub = 0.5;
    }
  });
}

/* ============================================================
   15. PERFORMANCE — refresh on fonts loaded
============================================================ */
document.fonts.ready.then(() => {
  ScrollTrigger.refresh();
});

/* ============================================================
   16. KEYBOARD NAVIGATION — scene jumping with arrow keys
============================================================ */
(function keyboardNav() {
  const sceneIds = ['hero', 'scene-1', 'scene-2', 'scene-3', 'scene-4', 'scene-5', 'end-screen'];
  let currentIdx = 0;

  // Update current scene index on scroll
  sceneIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter:     () => { currentIdx = i; },
      onEnterBack: () => { currentIdx = i; }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      const next = sceneIds[Math.min(currentIdx + 1, sceneIds.length - 1)];
      document.getElementById(next)?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      const prev = sceneIds[Math.max(currentIdx - 1, 0)];
      document.getElementById(prev)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();

/* ============================================================
   17. REDUCED MOTION — respect user preference
============================================================ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Kill all scroll triggers and instantly show everything
  ScrollTrigger.getAll().forEach(st => st.kill());
  gsap.globalTimeline.clear();

  document.querySelectorAll([
    '.hero-eyebrow', '.hero-title', '.hero-subtitle', '.hero-scroll-hint',
    '.scene-number', '.scene-title',
    '.prose p', '.dialogue-line', '.revelation',
    '.letter-text', '.final-line', '.end-title', '.end-subtitle',
    '.scene-image', '.word-terminal'
  ].join(',')).forEach(el => {
    gsap.set(el, { opacity: 1, transform: 'none', filter: 'none',
                   fontSize: '', letterSpacing: '', clipPath: 'none' });
  });
}