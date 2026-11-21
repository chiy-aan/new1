/**
 * ============================================================
 * TIMELINE — Relationship Journey
 * ============================================================
 */

const Timeline = (() => {
  let memories = [];

  function init() {
    const cfg = window.SITE_CONFIG;
    if (cfg && cfg.timeline) {
      memories = cfg.timeline.map((m, i) => ({ ...m, id: 'mem_' + i }));
    }
    loadFromStorage();
    render();
    setupAddButton();
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('anniversary_timeline');
      if (saved) memories = JSON.parse(saved);
    } catch (e) {}
  }

  function save() {
    try {
      localStorage.setItem('anniversary_timeline', JSON.stringify(memories));
    } catch (e) {}
  }

  function render() {
    const container = document.getElementById('timeline-items');
    if (!container) return;
    container.innerHTML = '';

    memories.forEach((mem, i) => {
      const item = document.createElement('div');
      item.className = 'timeline-item fade-in';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-card glass-card" data-id="${mem.id || i}">
          ${mem.photo ? `<img src="${mem.photo}" alt="${mem.title}" class="timeline-photo" loading="lazy">` : ''}
          <div class="timeline-date">${mem.date}</div>
          <div class="timeline-title">${mem.title}</div>
          <div class="timeline-desc">${mem.description}</div>
          <div class="timeline-heart">❤️</div>
          <div class="timeline-actions" style="display:flex;gap:8px;margin-top:10px;">
            <button class="btn-small btn-edit" data-idx="${i}" title="Edit">✏️ Edit</button>
            <button class="btn-small btn-delete" data-idx="${i}" title="Delete">🗑️</button>
            <label class="btn-small btn-photo-upload" title="Add Photo">
              📷 Photo
              <input type="file" accept="image/*" style="display:none" data-idx="${i}">
            </label>
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    // Bind events
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        openEditModal(idx);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        if (confirm('Remove this memory?')) {
          memories.splice(idx, 1);
          save();
          render();
          if (window.ScrollAnimations) window.ScrollAnimations.init();
        }
      });
    });

    container.querySelectorAll('input[type="file"]').forEach(input => {
      input.addEventListener('change', e => {
        const idx = parseInt(e.target.dataset.idx);
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          memories[idx].photo = ev.target.result;
          save();
          render();
          if (window.ScrollAnimations) window.ScrollAnimations.init();
        };
        reader.readAsDataURL(file);
      });
    });

    // Re-observe new elements
    if (window.ScrollAnimations) window.ScrollAnimations.init();
  }

  function setupAddButton() {
    const btn = document.getElementById('add-memory-btn');
    if (!btn) return;
    btn.addEventListener('click', () => openEditModal(-1));
  }

  function openEditModal(idx) {
    const isNew = idx === -1;
    const mem = isNew ? { date: '', title: '', description: '', photo: null } : memories[idx];

    const overlay = document.getElementById('timeline-modal');
    if (!overlay) return;

    overlay.querySelector('#modal-mem-date').value = mem.date || '';
    overlay.querySelector('#modal-mem-title').value = mem.title || '';
    overlay.querySelector('#modal-mem-desc').value = mem.description || '';
    overlay.querySelector('.modal-title').textContent = isNew ? '✨ Add a Memory' : '✏️ Edit Memory';

    overlay.classList.add('open');

    // Save handler
    const saveBtn = overlay.querySelector('#modal-save-btn');
    const newSave = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSave, saveBtn);

    newSave.addEventListener('click', () => {
      const date = overlay.querySelector('#modal-mem-date').value.trim();
      const title = overlay.querySelector('#modal-mem-title').value.trim();
      const desc = overlay.querySelector('#modal-mem-desc').value.trim();
      if (!title) return showToast('Please enter a memory title 💕');

      const newMem = {
        id: isNew ? 'mem_' + Date.now() : mem.id,
        date: date || 'A beautiful day',
        title,
        description: desc,
        photo: mem.photo || null
      };

      if (isNew) memories.push(newMem);
      else memories[idx] = newMem;

      save();
      render();
      closeModal(overlay);
      showToast(isNew ? 'Memory added! 💕' : 'Memory updated! ✨');
    });
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
  }

  return { init };
})();

/**
 * ============================================================
 * PHOTO GALLERY
 * ============================================================
 */

const Gallery = (() => {
  let photos = [];
  let lightboxIndex = 0;
  let slideshowInterval;
  let isSlideshowMode = false;

  function init() {
    loadFromStorage();
    render();
    setupUploadZone();
    setupLightbox();
    setupSlideshow();
  }

  function loadFromStorage() {
    try {
      const dbReq = indexedDB.open('anniversary_gallery', 1);
      dbReq.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      };
      dbReq.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const req = store.getAll();
        req.onsuccess = () => {
          photos = req.result || [];
          render();
        };
      };
      dbReq.onerror = () => {
        // Fallback to localStorage
        const saved = localStorage.getItem('anniversary_gallery');
        if (saved) {
          try { photos = JSON.parse(saved); render(); } catch(e) {}
        }
      };
    } catch(e) {
      const saved = localStorage.getItem('anniversary_gallery');
      if (saved) {
        try { photos = JSON.parse(saved); render(); } catch(e2) {}
      }
    }
  }

  function saveToDb(photo) {
    try {
      const dbReq = indexedDB.open('anniversary_gallery', 1);
      dbReq.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction('photos', 'readwrite');
        tx.objectStore('photos').put(photo);
      };
    } catch(e) {
      // Fallback
      try { localStorage.setItem('anniversary_gallery', JSON.stringify(photos)); } catch(e2) {}
    }
  }

  function deleteFromDb(id) {
    try {
      const dbReq = indexedDB.open('anniversary_gallery', 1);
      dbReq.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction('photos', 'readwrite');
        tx.objectStore('photos').delete(id);
      };
    } catch(e) {}
  }

  function addPhoto(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const photo = {
        id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2),
        src: ev.target.result,
        caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        addedAt: Date.now()
      };
      photos.push(photo);
      saveToDb(photo);
      render();
      showToast('📷 Photo added to memories!');
    };
    reader.readAsDataURL(file);
  }

  function render() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (photos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted); font-style:italic;">
          <div style="font-size:3rem;margin-bottom:1rem;">📷</div>
          <p>Your beautiful memories will appear here...</p>
          <p style="font-size:0.8rem;margin-top:0.5rem;">Drag and drop photos or click the upload area above.</p>
        </div>
      `;
      return;
    }

    photos.forEach((photo, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item fade-in';
      item.innerHTML = `
        <div class="gallery-img-wrapper">
          <img src="${photo.src}" alt="${photo.caption}" class="gallery-img" loading="lazy">
          <div class="gallery-overlay">
            <span style="color:var(--gold);font-size:0.8rem;letter-spacing:0.1em;">🔍 View Full</span>
          </div>
        </div>
        <div class="gallery-info">
          <span class="gallery-caption" contenteditable="true" data-idx="${i}">${photo.caption}</span>
          <div class="gallery-date-label">${photo.date}</div>
        </div>
        <button class="gallery-remove" data-idx="${i}" title="Remove">✕</button>
      `;

      // Click to open lightbox
      item.querySelector('.gallery-img-wrapper').addEventListener('click', () => openLightbox(i));

      // Caption edit
      item.querySelector('.gallery-caption').addEventListener('blur', e => {
        const idx = parseInt(e.target.dataset.idx);
        photos[idx].caption = e.target.textContent;
        saveToDb(photos[idx]);
      });

      // Remove
      item.querySelector('.gallery-remove').addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.dataset.idx);
        if (confirm('Remove this photo?')) {
          deleteFromDb(photos[idx].id);
          photos.splice(idx, 1);
          render();
        }
      });

      grid.appendChild(item);
    });

    if (window.ScrollAnimations) window.ScrollAnimations.init();
  }

  function setupUploadZone() {
    const zone = document.getElementById('gallery-upload-zone');
    const fileInput = document.getElementById('gallery-file-input');
    if (!zone || !fileInput) return;

    zone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', e => {
      Array.from(e.target.files).forEach(addPhoto);
      fileInput.value = '';
    });

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      files.forEach(addPhoto);
    });
  }

  function openLightbox(idx) {
    lightboxIndex = idx;
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.add('open');
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    if (!img || !photos[lightboxIndex]) return;
    img.src = photos[lightboxIndex].src;
    img.alt = photos[lightboxIndex].caption;
    if (cap) cap.textContent = photos[lightboxIndex].caption;
  }

  function setupLightbox() {
    const lb = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', () => lb.classList.remove('open'));
    if (prevBtn) prevBtn.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex - 1 + photos.length) % photos.length;
      updateLightboxImage();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex + 1) % photos.length;
      updateLightboxImage();
    });

    lb.addEventListener('click', e => {
      if (e.target === lb) lb.classList.remove('open');
    });

    // Keyboard nav
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + photos.length) % photos.length; updateLightboxImage(); }
      if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % photos.length; updateLightboxImage(); }
      if (e.key === 'Escape') lb.classList.remove('open');
    });
  }

  function setupSlideshow() {
    const btn = document.getElementById('slideshow-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (photos.length === 0) return showToast('Add some photos first! 📷');
      isSlideshowMode = !isSlideshowMode;

      if (isSlideshowMode) {
        btn.textContent = '⏸ Stop Slideshow';
        lightboxIndex = 0;
        const lb = document.getElementById('lightbox');
        if (lb) lb.classList.add('open');
        updateLightboxImage();
        slideshowInterval = setInterval(() => {
          lightboxIndex = (lightboxIndex + 1) % photos.length;
          updateLightboxImage();
        }, 3000);
      } else {
        btn.textContent = '▶ Slideshow Mode';
        clearInterval(slideshowInterval);
        const lb = document.getElementById('lightbox');
        if (lb) lb.classList.remove('open');
      }
    });
  }

  return { init };
})();

/**
 * ============================================================
 * LOVE REASONS
 * ============================================================
 */

const Reasons = (() => {
  function init() {
    const cfg = window.SITE_CONFIG;
    const reasons = cfg ? cfg.reasons : [];
    const grid = document.getElementById('reasons-grid');
    if (!grid || !reasons) return;

    // Render reason cards
    reasons.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'reason-card fade-in';
      card.innerHTML = `
        <div class="reason-card-inner">
          <div class="reason-card-front">
            <div class="reason-icon" aria-hidden="true">${r.front}</div>
            <div class="reason-title">${r.title}</div>
            <div class="reason-tap-hint">Tap to discover ✨</div>
          </div>
          <div class="reason-card-back">
            <div class="reason-detail">${r.detail}</div>
          </div>
        </div>
      `;
      card.addEventListener('click', e => {
        card.classList.toggle('flipped');
        if (card.classList.contains('flipped')) {
          const rect = card.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
        }
      });
      grid.appendChild(card);
    });

    // Special card
    const special = document.createElement('div');
    special.className = 'reason-card special fade-in';
    special.style.gridColumn = 'span 1';
    special.innerHTML = `
      <div class="reason-card-inner">
        <div class="reason-card-front">
          <div class="reason-icon" aria-hidden="true">💖</div>
          <div class="reason-title">AND THE BIGGEST REASON...</div>
          <div class="reason-tap-hint">Tap to find out 💕</div>
        </div>
        <div class="reason-card-back">
          <div class="reason-detail" style="font-size:0.9rem;line-height:1.6;">
            Because you are <strong style="color:var(--gold)">YOU</strong>.<br><br>
            And I wouldn't choose anyone else in this entire universe.
          </div>
        </div>
      </div>
    `;
    special.addEventListener('click', () => {
      special.classList.toggle('flipped');
      if (special.classList.contains('flipped')) {
        const rect = special.getBoundingClientRect();
        burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
      }
    });
    grid.appendChild(special);

    if (window.ScrollAnimations) window.ScrollAnimations.init();
  }

  return { init };
})();

/**
 * ============================================================
 * LOVE LETTER — Envelope
 * ============================================================
 */

const LoveLetter = (() => {
  let opened = false;

  function init() {
    const env = document.getElementById('envelope');
    if (!env) return;

    env.addEventListener('click', () => {
      if (opened) return;
      opened = true;
      open();
    });

    // Populate letter
    const cfg = window.SITE_CONFIG;
    if (cfg) {
      const textEl = document.getElementById('letter-body');
      if (textEl) textEl.textContent = cfg.loveLetter;
      const sigEl = document.getElementById('letter-signature');
      if (sigEl) sigEl.textContent = cfg.loveLetterSignature;
    }
  }

  function open() {
    const env = document.getElementById('envelope');
    const content = document.getElementById('letter-content');
    if (!env || !content) return;

    env.classList.add('opening');

    setTimeout(() => {
      env.style.display = 'none';
      content.style.display = 'block';
      typewriterEffect();
    }, 900);
  }

  function typewriterEffect() {
    const textEl = document.getElementById('letter-body');
    if (!textEl) return;

    const cfg = window.SITE_CONFIG;
    const fullText = cfg ? cfg.loveLetter : textEl.textContent;
    textEl.textContent = '';

    let i = 0;
    const type = () => {
      if (i < fullText.length) {
        textEl.textContent += fullText[i];
        i++;
        setTimeout(type, 25);
      }
    };
    type();
  }

  return { init };
})();

/**
 * ============================================================
 * SURPRISE SECTION
 * ============================================================
 */

const Surprise = (() => {
  let msgIndex = 0;
  let opened = false;

  function init() {
    const scrollTrigger = document.getElementById('gift-box-trigger');
    const loveBtn = document.getElementById('love-amount-btn');
    const loveClose = document.getElementById('love-fs-close');

    if (scrollTrigger) {
      scrollTrigger.addEventListener('click', () => {
        openGift();
      });
    }

    if (loveBtn) {
      loveBtn.addEventListener('click', () => {
        const fs = document.getElementById('love-fullscreen');
        if (fs) fs.classList.add('open');
        burstHearts(window.innerWidth / 2, window.innerHeight / 2, 20);
      });
    }

    if (loveClose) {
      loveClose.addEventListener('click', () => {
        const fs = document.getElementById('love-fullscreen');
        if (fs) fs.classList.remove('open');
      });
    }

    // Next message
    const nextMsgBtn = document.getElementById('next-surprise-btn');
    if (nextMsgBtn) {
      nextMsgBtn.addEventListener('click', showNextMessage);
    }
  }

  function openGift() {
    const cfg = window.SITE_CONFIG;
    const messages = cfg ? cfg.surpriseMessages : [];
    if (messages.length === 0) return;

    if (opened) return;
    opened = true;

    const trigger = document.getElementById('gift-box-trigger');
    const scroll = document.querySelector('.love-scroll');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.disabled = true;
      trigger.querySelector('.scroll-trigger-label').textContent = 'Your note is unrolled';
    }
    if (scroll) scroll.classList.add('open');

    const rect = trigger.getBoundingClientRect();
    burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    showMessage(messages[0]);
    msgIndex = 0;
  }

  function showNextMessage() {
    const cfg = window.SITE_CONFIG;
    const messages = cfg ? cfg.surpriseMessages : [];
    msgIndex = (msgIndex + 1) % messages.length;
    showMessage(messages[msgIndex]);
  }

  function showMessage(msg) {
    const el = document.querySelector('.surprise-msg');
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.9)';
    el.style.transition = 'all 0.5s';

    setTimeout(() => {
      el.textContent = msg;
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    }, 300);
  }

  return { init };
})();

// Init everything on main site load
function initAllSections() {
  Reasons.init();
  LoveLetter.init();
  Surprise.init();

  // Modal close buttons
  document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    });
  });

  // Replay button
  const replayBtn = document.getElementById('replay-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      const main = document.getElementById('main-site');
      const scene = document.getElementById('opening-scene');
      const nav = document.getElementById('nav');
      const musicFab = document.getElementById('music-fab');

      if (main) main.style.display = 'none';
      if (scene) {
        scene.style.display = 'block';
        scene.style.opacity = '1';
        scene.style.transition = 'none';
      }
      if (nav) nav.classList.remove('visible');
      if (musicFab) musicFab.style.display = 'none';

      // Reset bike position
      const bike = document.getElementById('couple-bike');
      if (bike) {
        bike.style.transition = 'none';
        bike.style.left = '10%';
        bike.style.opacity = '1';
        bike.style.display = 'flex';
      }
      const walking = document.getElementById('couple-walking');
      if (walking) {
        walking.style.display = 'none';
        walking.style.opacity = '0';
      }

      // Reset messages
      document.querySelectorAll('.opening-message').forEach(m => m.classList.remove('show'));
      const openingText = document.getElementById('opening-text');
      if (openingText) {
        openingText.style.display = 'none';
        openingText.style.background = 'rgba(255,249,244,0)';
        openingText.style.transition = 'none';
      }

      const enterBtn = document.getElementById('enter-btn');
      if (enterBtn) {
        enterBtn.style.opacity = '0';
        enterBtn.style.display = 'none';
      }

      // Restart sequence
      setTimeout(() => {
        if (window.OpeningScene) window.OpeningScene.startSequence();
      }, 500);
    });
  }
}

// Called when site enters
document.addEventListener('DOMContentLoaded', () => {
  // Init sections when main site becomes visible
  const observer = new MutationObserver(() => {
    const main = document.getElementById('main-site');
    if (main && main.style.display !== 'none' && !window._sectionsInited) {
      window._sectionsInited = true;
      initAllSections();
    }
  });
  const main = document.getElementById('main-site');
  if (main) observer.observe(main, { attributes: true, attributeFilter: ['style'] });
});
