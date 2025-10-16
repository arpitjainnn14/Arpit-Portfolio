// WOW Effects: magnetic buttons, click ripple, scroll progress, cursor spotlight,
// morphing hero blob, and hologram orb. All progressive, reduced-motion aware.

(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  // ========== Scroll Progress Bar ========== //
  function initScrollProgress() {
    let bar = document.getElementById('scrollProgress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scrollProgress';
      document.body.appendChild(bar);
    }

    const update = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ========== Magnetic Buttons ========== //
  function initMagneticButtons() {
    if (isTouch) return; // skip on touch devices
    const buttons = document.querySelectorAll('.btn, .project-link, .back-top-link');
    buttons.forEach((btn) => {
      const strength = 20; // px
      btn.style.willChange = 'transform';
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        const dx = Math.max(-strength, Math.min(strength, relX / 6));
        const dy = Math.max(-strength, Math.min(strength, relY / 6));
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ========== Ripple on Click ========== //
  function initRipple() {
    const rippleTargets = document.querySelectorAll('.btn, .project-link');
    rippleTargets.forEach((el) => {
      el.style.overflow = 'hidden';
      el.addEventListener('click', (e) => {
        const rect = el.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;
        circle.className = 'ripple';
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        el.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
      });
    });
  }

  // ========== Cursor Spotlight (masked radial gradient) ========== //
  function initSpotlight() {
    if (isTouch) return; // desktop only
    let spotlight = document.getElementById('cursor-spotlight');
    if (!spotlight) {
      spotlight = document.createElement('div');
      spotlight.id = 'cursor-spotlight';
      document.body.appendChild(spotlight);
    }
    const move = (e) => {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
    };
    document.addEventListener('mousemove', move, { passive: true });
  }

  // ========== Morphing Blob in Hero ========== //
  function initHeroBlob() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    let blob = document.getElementById('hero-blob');
    if (!blob) {
      blob = document.createElement('div');
      blob.id = 'hero-blob';
      hero.appendChild(blob);
    }
    if (prefersReduced) return; // let CSS handle a subtle static blob

    let t = 0;
    const animate = () => {
      t += 0.005;
      const scale = 1 + Math.sin(t) * 0.05;
      const rotate = Math.sin(t * 2) * 6;
      blob.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // ========== Hologram Orb near Skills ========== //
  function initHologramOrb() {
    const skills = document.querySelector('.skills');
    if (!skills) return;
    let orb = document.getElementById('holo-orb');
    if (!orb) {
      orb = document.createElement('div');
      orb.id = 'holo-orb';
      skills.appendChild(orb);
    }
    if (prefersReduced) return;

    let angle = 0;
    const radius = 120;
    const center = () => {
      const rect = skills.getBoundingClientRect();
      return { x: rect.width - 180, y: 160 };
    };

    const animate = () => {
      const c = center();
      angle += 0.01;
      const x = c.x + Math.cos(angle) * radius;
      const y = c.y + Math.sin(angle) * (radius * 0.6);
      orb.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initMagneticButtons();
    initRipple();
    initSpotlight();
    initHeroBlob();
    initHologramOrb();
    initScrollSpy();
    initProfileShine();
    initProjectSheen();
  });
})();

// ========== ScrollSpy: highlight active nav link ==========
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-menu .nav-link');
  if (!sections.length || !links.length) return;

  const map = {};
  links.forEach((l) => { const h = l.getAttribute('href'); if (h && h.startsWith('#')) map[h.slice(1)] = l; });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute('id');
      const link = map[id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach((el) => el.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px', threshold: 0.01 });

  sections.forEach((sec) => observer.observe(sec));
}

// ========== Profile Image Shine ==========
function initProfileShine() {
  const wrap = document.querySelector('.profile-image-wrapper');
  if (!wrap) return;
  const onMove = (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    wrap.style.setProperty('--shine-x', x + 'px');
    wrap.style.setProperty('--shine-y', y + 'px');
  };
  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', () => {
    wrap.style.removeProperty('--shine-x');
    wrap.style.removeProperty('--shine-y');
  });
}

// ========== Project Card Sheen ==========
function initProjectSheen() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;
  cards.forEach((card) => {
    const move = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    };
    card.addEventListener('mousemove', move);
  });
}
