/**
 * ============================================================
 * OPENING SCENE — Cinematic Bike Ride to Temple
 * ============================================================
 */

class OpeningScene {
  constructor() {
    this.scene = document.getElementById('opening-scene');
    this.bikeCar = document.getElementById('couple-bike');
    this.walkingCar = document.getElementById('couple-walking');
    this.openingText = document.getElementById('opening-text');
    this.enterBtn = document.getElementById('enter-btn');
    this.phase = 0;
  }

  init() {
    this.buildScene();
    this.startSequence();
    this.enterBtn.addEventListener('click', () => this.enterSite());
  }

  buildScene() {
    // Create stars
    const stars = document.querySelector('.stars');
    if (stars) {
      for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${Math.random() * 100}%;;
          top: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 4}s;
          animation-duration: ${Math.random() * 3 + 2}s;
        `;
        stars.appendChild(star);
      }
    }

    // Create road dashes
    const road = document.querySelector('.road');
    if (road) {
      for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.className = 'road-line';
        line.style.top = `${i * 60}px`;
        line.style.animationDelay = `${i * 0.0625}s`;
        road.appendChild(line);
      }
    }

    // Build temple gopuram
    const gopuram = document.querySelector('.temple-gopuram');
    if (gopuram) {
      const tiers = [
        { width: 20, height: 25 },
        { width: 30, height: 20 },
        { width: 44, height: 18 },
        { width: 60, height: 16 },
        { width: 78, height: 14 },
        { width: 96, height: 12 },
        { width: 114, height: 10 },
      ];
      tiers.forEach((t, i) => {
        const tier = document.createElement('div');
        tier.className = 'gopuram-tier';
        tier.style.cssText = `width:${t.width}px; height:${t.height}px;`;
        gopuram.appendChild(tier);
      });
    }

    // Scatter flowers
    const flowerRow = document.querySelector('.flowers-row');
    if (flowerRow) {
      const flowers = ['🌸','🌺','🌼','🌻','🌷'];
      for (let i = 0; i < 20; i++) {
        const f = document.createElement('div');
        f.className = 'flower-item';
        f.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        f.style.left = `${Math.random() * 100}%`;
        f.style.animationDelay = `${Math.random() * 2}s`;
        f.style.fontSize = `${Math.random() * 0.5 + 0.7}rem`;
        // avoid road centre
        const leftPct = parseFloat(f.style.left);
        if (leftPct > 38 && leftPct < 62) {
          f.style.left = leftPct > 50 ? `${leftPct + 15}%` : `${leftPct - 15}%`;
        }
        flowerRow.appendChild(f);
      }
    }
  }

  startSequence() {
    // Phase 1: Bike rides across screen (0–5s)
    setTimeout(() => this.rideIn(), 500);

    // Phase 2: Approach temple (5–10s)
    setTimeout(() => this.approachTemple(), 5000);

    // Phase 3: Arrive, walk (10–14s)
    setTimeout(() => this.arriveAtTemple(), 10000);

    // Phase 4: Fade to text (14–30s)
    setTimeout(() => this.showOpeningText(), 14000);
  }

  rideIn() {
    const bike = document.getElementById('couple-bike');
    if (!bike) return;
    bike.style.transition = 'left 4.5s ease-in-out';
    bike.style.left = '35%';
  }

  approachTemple() {
    const bike = document.getElementById('couple-bike');
    if (!bike) return;
    bike.style.transition = 'left 5s ease-in-out';
    bike.style.left = '44%';
  }

  arriveAtTemple() {
    const bike = document.getElementById('couple-bike');
    const walking = document.getElementById('couple-walking');
    if (!bike || !walking) return;

    // Fade out bike
    bike.style.transition = 'opacity 1s ease';
    bike.style.opacity = '0';

    setTimeout(() => {
      bike.style.display = 'none';
      walking.style.display = 'flex';
      walking.style.opacity = '0';
      walking.style.transition = 'opacity 1s ease';
      setTimeout(() => { walking.style.opacity = '1'; }, 50);
    }, 1000);
  }

  showOpeningText() {
    const textEl = document.getElementById('opening-text');
    if (!textEl) return;

    // Overlay fades
    textEl.style.display = 'flex';
    textEl.style.background = 'rgba(255,249,244,0)';
    setTimeout(() => {
      textEl.style.transition = 'background 2s ease';
      textEl.style.background = 'rgba(255,249,244,0.82)';
    }, 100);

    const cfg = window.SITE_CONFIG;
    const msgs = cfg ? cfg.openingMessages : [
      "Every beautiful story has a beginning...",
      "And ours became my favourite story.",
      "365 Days of Love. Countless Memories. One Forever."
    ];

    const els = document.querySelectorAll('.opening-message:not(#enter-btn)');

    // Show messages sequentially
    let delay = 2000;
    els.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('show');
      }, delay);
      delay += 3000;
    });

    // Show enter button
    setTimeout(() => {
      const btn = document.getElementById('enter-btn');
      if (btn) {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        btn.style.transition = 'all 1s ease';
        btn.style.display = 'inline-flex';
        setTimeout(() => {
          btn.style.opacity = '1';
          btn.style.transform = 'translateY(0)';
        }, 100);
      }
    }, delay + 500);
  }

  enterSite() {
    const scene = document.getElementById('opening-scene');
    const main = document.getElementById('main-site');
    const nav = document.getElementById('nav');
    const musicFab = document.getElementById('music-fab');

    if (!scene) return;

    scene.style.transition = 'opacity 1.5s ease';
    scene.style.opacity = '0';

    setTimeout(() => {
      scene.style.display = 'none';
      if (main) main.style.display = 'block';
      if (nav) nav.classList.add('visible');
      if (musicFab) musicFab.style.display = 'block';

      // Start particles & petals
      if (window.Particles) window.Particles.start();
      if (window.Petals) window.Petals.start();

      // Start music if loaded
      if (window.MusicPlayer) window.MusicPlayer.tryPlay();

      // Trigger home animations
      if (window.ScrollAnimations) window.ScrollAnimations.init();
      if (window.Counter) window.Counter.start();
    }, 1500);
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const openingScene = new OpeningScene();
  openingScene.init();
  window.OpeningScene = openingScene;
});
