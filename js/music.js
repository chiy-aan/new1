/**
 * ============================================================
 * MUSIC PLAYER
 * ============================================================
 */

const MusicPlayer = (() => {
  let audio = null;
  let tracks = [];
  let currentTrack = 0;
  let isPlaying = false;
  let vizBars = [];
  let vizInterval;
  let userInteracted = false;

  function init() {
    const cfg = window.SITE_CONFIG;
    if (cfg && cfg.music) tracks = [...cfg.music];

    setupAudio();
    setupControls();
    setupMusicFab();
    buildVisualizer();
    loadTrack(currentTrack, false);
    updateUI();
  }

  function setupAudio() {
    audio = new Audio();
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      currentTrack = (currentTrack + 1) % tracks.length;
      loadTrack(currentTrack, true);
    });
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('error', () => {
      isPlaying = false;
      updatePlayState();
      stopFakeVisualizer();
      showToast('This audio file could not be played. Try an MP3 or WAV file.');
    });
  }

  function loadTrack(idx, autoPlay = false) {
    if (!tracks[idx] || !tracks[idx].file) {
      updateUI();
      return;
    }
    audio.src = tracks[idx].file;
    currentTrack = idx;
    updateUI();
    if (autoPlay && userInteracted) {
      play();
    }
  }

  function play() {
    if (!audio.src) {
      showToast('No song is configured yet.');
      return;
    }
    audio.play().then(() => {
      isPlaying = true;
      updatePlayState();
      startFakeVisualizer();
    }).catch(e => {
      console.warn('Audio play failed:', e);
    });
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    updatePlayState();
    stopFakeVisualizer();
  }

  function toggle() {
    userInteracted = true;
    if (isPlaying) pause();
    else play();
  }

  function updateProgress() {
    if (!audio.duration) return;

    const pct = (audio.currentTime / audio.duration) * 100;
    const fill = document.getElementById('progress-fill');
    const thumb = document.getElementById('progress-thumb');
    const curTime = document.getElementById('current-time');
    const durTime = document.getElementById('duration-time');

    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (curTime) curTime.textContent = formatTime(audio.currentTime);
    if (durTime) durTime.textContent = formatTime(audio.duration);
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function setupControls() {
    const playPause = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressTrack = document.getElementById('progress-track');

    if (playPause) playPause.addEventListener('click', toggle);
    if (prevBtn) prevBtn.addEventListener('click', () => {
      currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
      loadTrack(currentTrack, isPlaying);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      currentTrack = (currentTrack + 1) % tracks.length;
      loadTrack(currentTrack, isPlaying);
    });

    if (volumeSlider) {
      volumeSlider.addEventListener('input', e => {
        audio.volume = e.target.value / 100;
      });
    }

    if (progressTrack) {
      progressTrack.addEventListener('click', e => {
        if (!audio.duration) return;
        const rect = progressTrack.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
      });
    }
  }

  function setupMusicFab() {
    const fab = document.getElementById('music-fab-btn');
    if (!fab) return;
    fab.addEventListener('click', toggle);
  }

  function updatePlayState() {
    const disc = document.querySelector('.album-disc');
    const btn = document.getElementById('play-pause-btn');
    const fab = document.getElementById('music-fab-btn');

    if (disc) disc.classList.toggle('playing', isPlaying);

    if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
    if (fab) fab.textContent = isPlaying ? '⏸' : '🎵';
  }

  function updateUI() {
    const track = tracks[currentTrack];
    const titleEl = document.getElementById('track-title');
    const artistEl = document.getElementById('track-artist');

    if (titleEl) titleEl.textContent = track ? track.title : 'Our special song';
    if (artistEl) artistEl.textContent = track ? (track.artist || 'Your special song') : 'Click the button below';
  }

  function buildVisualizer() {
    const viz = document.getElementById('visualizer');
    if (!viz) return;
    viz.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('div');
      bar.className = 'viz-bar';
      bar.style.height = '4px';
      viz.appendChild(bar);
      vizBars.push(bar);
    }
  }

  function startFakeVisualizer() {
    stopFakeVisualizer();
    vizInterval = setInterval(() => {
      vizBars.forEach(bar => {
        if (isPlaying) {
          const h = Math.random() * 44 + 4;
          bar.style.height = h + 'px';
        }
      });
    }, 100);
  }

  function stopFakeVisualizer() {
    clearInterval(vizInterval);
    vizBars.forEach(bar => bar.style.height = '4px');
  }

  function tryPlay() {
    userInteracted = true;
    if (tracks[currentTrack] && tracks[currentTrack].file) {
      loadTrack(currentTrack, true);
    }
  }

  return { init, tryPlay, toggle };
})();

window.MusicPlayer = MusicPlayer;

// Init music player when main site is shown
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const main = document.getElementById('main-site');
    if (main && main.style.display !== 'none' && !window._musicInited) {
      window._musicInited = true;
      MusicPlayer.init();
    }
  });
  const main = document.getElementById('main-site');
  if (main) observer.observe(main, { attributes: true, attributeFilter: ['style'] });
});
