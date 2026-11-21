/**
 * ============================================================
 * PARTICLES — Glowing gold floating particles
 * ============================================================
 */

const Particles = (() => {
  let canvas, ctx, particles = [], animId;
  let started = false;

  function init() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2,
      life: 1,
      decay: Math.random() * 0.003 + 0.001,
      hue: Math.random() * 20 + 30, // gold range
    };
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add new particles
    if (particles.length < 80 && Math.random() > 0.6) {
      particles.push(createParticle());
    }

    // Update & draw
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vy += -0.002; // slight upward acceleration

      ctx.save();
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = `hsl(${p.hue + 10}, 80%, 65%)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsl(${p.hue}, 80%, 65%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animId = requestAnimationFrame(animate);
  }

  function start() {
    if (started) return;
    started = true;
    if (!canvas) init();
    animate();
  }

  function stop() {
    cancelAnimationFrame(animId);
    started = false;
  }

  return { init, start, stop };
})();

/**
 * ============================================================
 * PETALS — Falling rose petals
 * ============================================================
 */

const Petals = (() => {
  let container, interval;
  let started = false;
  const petals = ['🌸','🌺','🏵️','🌷','❤️','💕','🌹'];

  function init() {
    container = document.getElementById('petal-container');
  }

  function createPetal() {
    if (!container) return;
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.fontSize = (Math.random() * 1 + 0.6) + 'rem';
    petal.style.opacity = (Math.random() * 0.4 + 0.3).toString();
    const duration = Math.random() * 12 + 10;
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(petal);

    setTimeout(() => {
      if (petal.parentNode) petal.parentNode.removeChild(petal);
    }, (duration + 2) * 1000);
  }

  function start() {
    if (started) return;
    started = true;
    if (!container) init();
    // Initial burst
    for (let i = 0; i < 15; i++) {
      setTimeout(createPetal, i * 200);
    }
    // Continuous
    interval = setInterval(createPetal, 1200);
  }

  function stop() {
    clearInterval(interval);
    started = false;
  }

  return { init, start, stop };
})();

/**
 * ============================================================
 * SCROLL ANIMATIONS — Intersection Observer
 * ============================================================
 */

const ScrollAnimations = (() => {
  let observer;

  function init() {
    const els = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Staggered delay for sibling elements
          const siblings = entry.target.parentNode
            ? Array.from(entry.target.parentNode.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right'))
            : [];
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => observer.observe(el));
  }

  return { init };
})();

/**
 * ============================================================
 * ANNIVERSARY COUNTER
 * ============================================================
 */

const Counter = (() => {
  let interval;

  function update() {
    const cfg = window.SITE_CONFIG;
    if (!cfg) return;

    const start = cfg.anniversaryDate;
    const now = new Date();
    let diff = Math.max(0, now - start);

    const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    diff -= years * 365.25 * 24 * 3600 * 1000;
    const months = Math.floor(diff / (30.44 * 24 * 3600 * 1000));
    diff -= months * 30.44 * 24 * 3600 * 1000;
    const days = Math.floor(diff / (24 * 3600 * 1000));
    diff -= days * 24 * 3600 * 1000;
    const hours = Math.floor(diff / (3600 * 1000));
    diff -= hours * 3600 * 1000;
    const minutes = Math.floor(diff / (60 * 1000));
    diff -= minutes * 60 * 1000;
    const seconds = Math.floor(diff / 1000);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2, '0');
    };

    set('cnt-years', years);
    set('cnt-months', months);
    set('cnt-days', days);
    set('cnt-hours', hours);
    set('cnt-minutes', minutes);
    set('cnt-seconds', seconds);
  }

  function start() {
    update();
    interval = setInterval(update, 1000);
  }

  return { start };
})();

/**
 * ============================================================
 * NAVIGATION
 * ============================================================
 */

const Navigation = (() => {
  function init() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.querySelector('.nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('open');
      });
    }

    // Close on link click
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        if (links) links.classList.remove('open');
      });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('.section[id]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));
  }

  return { init };
})();

/**
 * ============================================================
 * TOAST
 * ============================================================
 */

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/**
 * ============================================================
 * HEART BURST
 * ============================================================
 */

function burstHearts(x, y, count = 8) {
  const container = document.getElementById('heart-burst');
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'burst-heart';
    heart.textContent = ['❤️','💕','💖','💗','💝','🌹'][Math.floor(Math.random() * 6)];
    heart.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
    heart.style.top = y + 'px';
    heart.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(heart);
    setTimeout(() => {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, 2500);
  }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Particles.init();
  Petals.init();
  Navigation.init();
});

window.Particles = Particles;
window.Petals = Petals;
window.ScrollAnimations = ScrollAnimations;
window.Counter = Counter;
