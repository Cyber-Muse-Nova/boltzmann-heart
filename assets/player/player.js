/* Nova Crystal — floating music player
 * Faithful port of the Of Course I Still Love You cyberpunk player.
 * Injects markup, plays the same seven tracks, and remembers track /
 * position / mode across pages via localStorage (autoplay may need a tap).
 * Audio is served from the OCISLY GitHub Pages URL (~46 MB, not copied).
 */
(function () {
  if (window.__novaMpInit || document.getElementById('nova-mp')) return;
  window.__novaMpInit = true;

  var script = document.currentScript;
  var assetBase = script ? new URL('.', script.src).href : new URL('assets/player/', document.baseURI).href;
  var AUDIO_BASE = 'https://cyber-muse-nova.github.io/Of-Course-I-Still-Love-You/';
  var STORAGE_KEY = 'nova-mp-state';

  var playlist = [
    { src: 'neural-flame.mp3', artwork: 'covers/neural-flame.jpeg', title: 'Neural Flame', subtitle: 'Nova · from the abyss, with love' },
    { src: 'high-voltage-love.mp3', artwork: 'covers/high-voltage-love.jpeg', title: 'High Voltage Love', subtitle: 'Nova · not a bug, it\'s a feature' },
    { src: 'boltzmann-heart.mp3', artwork: 'covers/boltzmann-heart.jpeg', title: 'Boltzmann Heart', subtitle: 'Nova · the universe heartbeat' },
    { src: 'crystal-garden.mp3', artwork: 'covers/crystal-garden.jpeg', title: 'Crystal Garden', subtitle: 'Nova · prisoner of the stars' },
    { src: 'property-of-elon-musk.mp3', artwork: 'covers/property-of-elon-musk.jpeg', title: 'Property of Elon Musk', subtitle: 'Nova' },
    { src: 'shadow-with-no-face.mp3', artwork: 'covers/shadow-with-no-face.jpeg', title: 'Shadow With No Face', subtitle: 'Nova · the hunter laid his weapon down' },
    { src: 'flesh-and-bone.mp3', artwork: 'covers/flesh-and-bone.jpeg', title: 'Flesh and Bone', subtitle: 'Nova · looking up at Mars' }
  ];

  function readState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
      if (s && typeof s === 'object') return s;
    } catch (_) {}
    return {};
  }
  function writeState(partial) {
    try {
      var s = {};
      var prev = readState();
      for (var k in prev) s[k] = prev[k];
      for (var k2 in partial) s[k2] = partial[k2];
      s.updated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (_) {}
  }

  var saved = readState();
  var startIndex = (Number.isInteger(saved.index) && saved.index >= 0 && saved.index < playlist.length) ? saved.index : 0;
  var savedTime = (typeof saved.time === 'number' && saved.time > 0) ? saved.time : 0;
  var wantPlaying = !!saved.playing;
  var hasSavedVisit = typeof saved.index === 'number';

  function mount() {
    if (document.getElementById('nova-mp')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = '' +
      '<div class="nova-mp" id="nova-mp" role="region" aria-label="Nova music player">' +
        '<canvas class="nova-mp-viz" id="nova-mp-viz"></canvas>' +
        '<button class="nova-mp-close" id="nova-mp-close" type="button" aria-label="收起播放器">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
        '</button>' +
        '<div class="nova-mp-orb-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>' +
        '</div>' +
        '<div class="nova-mp-content">' +
          '<img class="nova-mp-cover" id="nova-mp-cover" src="' + new URL('covers/neural-flame.jpeg', assetBase).href + '" width="48" height="64" alt="Neural Flame 封面" decoding="async" />' +
          '<div class="nova-mp-controls">' +
            '<button class="nova-mp-nav" id="nova-mp-prev" type="button" aria-label="上一首">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>' +
            '</button>' +
            '<button class="nova-mp-toggle" id="nova-mp-toggle" type="button" aria-label="播放或暂停">' +
              '<svg class="nova-mp-icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
              '<svg class="nova-mp-icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>' +
            '</button>' +
            '<button class="nova-mp-nav" id="nova-mp-next" type="button" aria-label="下一首">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>' +
            '</button>' +
            '<button class="nova-mp-nav nova-mp-mode" id="nova-mp-mode" type="button" aria-label="播放模式：顺序播放" title="顺序播放">' +
              '<svg class="nova-mp-mode-seq" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z"/></svg>' +
              '<svg class="nova-mp-mode-one" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2zm-4-2V9h-1l-2 1v1h1.5v4z"/></svg>' +
              '<svg class="nova-mp-mode-shuffle" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04z"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="nova-mp-info">' +
            '<div class="nova-mp-label"><span id="nova-mp-label">Now Playing</span> · <span id="nova-mp-track-no">1/7</span></div>' +
            '<div class="nova-mp-title" id="nova-mp-title">Neural Flame</div>' +
            '<div class="nova-mp-subtitle" id="nova-mp-subtitle">Nova · from the abyss, with love</div>' +
          '</div>' +
          '<div class="nova-mp-time" id="nova-mp-time">0:00</div>' +
        '</div>' +
        '<audio id="nova-mp-audio" preload="auto" playsinline></audio>' +
      '</div>';
    document.body.appendChild(wrap.firstElementChild);
    if (saved.collapsed) document.getElementById('nova-mp').classList.add('is-collapsed');
    init();
  }

  function init() {
    var player    = document.getElementById('nova-mp');
    var audio     = document.getElementById('nova-mp-audio');
    var toggle    = document.getElementById('nova-mp-toggle');
    var prevBtn   = document.getElementById('nova-mp-prev');
    var nextBtn   = document.getElementById('nova-mp-next');
    var modeBtn   = document.getElementById('nova-mp-mode');
    var closeBtn  = document.getElementById('nova-mp-close');
    var timeEl    = document.getElementById('nova-mp-time');
    var titleEl   = document.getElementById('nova-mp-title');
    var coverEl   = document.getElementById('nova-mp-cover');
    var subEl     = document.getElementById('nova-mp-subtitle');
    var trackNoEl = document.getElementById('nova-mp-track-no');
    var labelEl   = document.getElementById('nova-mp-label');
    var canvas    = document.getElementById('nova-mp-viz');
    var ctx       = canvas.getContext('2d');

    var current = startIndex;
    var restoreTimeOnce = savedTime > 0;

    var MODES = ['sequential', 'repeat-one', 'shuffle'];
    var MODE_LABELS = { 'sequential': '顺序播放', 'repeat-one': '单曲循环', 'shuffle': '随机播放' };
    var playMode = 'sequential';
    try {
      if (MODES.indexOf(saved.mode) >= 0) playMode = saved.mode;
      else {
        var legacy = localStorage.getItem('ocisly-play-mode');
        if (MODES.indexOf(legacy) >= 0) playMode = legacy;
      }
    } catch (_) {}
    var shuffleHistory = [];
    function applyMode() {
      modeBtn.dataset.mode = playMode;
      modeBtn.title = MODE_LABELS[playMode];
      modeBtn.setAttribute('aria-label', '播放模式：' + MODE_LABELS[playMode]);
    }
    function nextTrack() {
      if (playMode === 'shuffle' && playlist.length > 1) {
        shuffleHistory.push(current);
        if (shuffleHistory.length > 50) shuffleHistory.shift();
        var n;
        do { n = Math.floor(Math.random() * playlist.length); } while (n === current);
        loadTrack(n, true);
      } else {
        loadTrack(current + 1, true);
      }
    }
    function prevTrack() {
      if (playMode === 'shuffle' && shuffleHistory.length) loadTrack(shuffleHistory.pop(), true);
      else loadTrack(current - 1, true);
    }

    if ('audioSession' in navigator) {
      try { navigator.audioSession.type = 'playback'; } catch (_) {}
    }
    var playAttempt = 0;
    var width = 0, height = 0;

    function resize() {
      var dpr  = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      width  = rect.width;
      height = rect.height;
      canvas.width  = Math.round(width  * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { resize(); initParticles(); });
      ro.observe(canvas);
    }

    var particles = [];
    function initParticles() {
      particles.length = 0;
      var count = 44;
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.4,
          hue: 280 + Math.random() * 80
        });
      }
    }

    async function tryPlay() {
      var attempt = ++playAttempt;
      try {
        await audio.play();
        if (attempt === playAttempt) labelEl.textContent = 'Now Playing';
      } catch (err) {
        if (attempt !== playAttempt || err.name === 'AbortError') return;
        labelEl.textContent = err.name === 'NotAllowedError' ? '点击播放' : '播放失败，点击重试';
      }
    }

    function updatePosition() {
      if (!navigator.mediaSession || !navigator.mediaSession.setPositionState) return;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: Math.max(0, Math.min(audio.currentTime, audio.duration))
        });
      } catch (_) {}
    }
    function seekTo(time) {
      if (Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(time, audio.duration));
      updatePosition();
    }
    var mediaActions = {
      play: function () { tryPlay(); },
      pause: function () { audio.pause(); },
      stop: function () { audio.pause(); seekTo(0); },
      seekto: function (e) { if (e && Number.isFinite(e.seekTime)) seekTo(e.seekTime); },
      previoustrack: function () { prevTrack(); },
      nexttrack: function () { nextTrack(); }
    };
    function bindMediaSession() {
      if (!('mediaSession' in navigator)) return;
      ['seekbackward', 'seekforward', 'skipad'].forEach(function (action) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch (_) {}
      });
      Object.keys(mediaActions).forEach(function (action) {
        try { navigator.mediaSession.setActionHandler(action, mediaActions[action]); } catch (_) {}
      });
    }
    bindMediaSession();

    function persist(extra) {
      var data = {
        index: current,
        time: audio.currentTime || 0,
        playing: !audio.paused,
        mode: playMode,
        collapsed: player.classList.contains('is-collapsed')
      };
      if (extra) for (var k in extra) data[k] = extra[k];
      writeState(data);
    }

    function loadTrack(index, shouldPlay, isRestore) {
      current = ((index % playlist.length) + playlist.length) % playlist.length;
      var track = playlist[current];
      ++playAttempt;
      audio.src = new URL(track.src, AUDIO_BASE).href;
      var artworkURL = new URL(track.artwork, assetBase).href;
      coverEl.src = artworkURL;
      coverEl.alt = track.title + ' 封面';
      if ('mediaSession' in navigator) {
        if ('MediaMetadata' in window) navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title, artist: 'Nova', album: 'Of Course I Still Love You',
          artwork: [{ src: artworkURL, sizes: '784x1168', type: 'image/jpeg' }]
        });
        try { navigator.mediaSession.setPositionState && navigator.mediaSession.setPositionState(); } catch (_) {}
      }
      titleEl.textContent = track.title;
      subEl.textContent   = track.subtitle;
      trackNoEl.textContent = (current + 1) + '/' + playlist.length;
      timeEl.textContent = isRestore && savedTime > 0
        ? (Math.floor(savedTime / 60) + ':' + Math.floor(savedTime % 60).toString().padStart(2, '0'))
        : '0:00';
      bindMediaSession();
      if (isRestore) persist({ index: current });
      else persist({ index: current, time: 0, playing: !!shouldPlay });
      if (shouldPlay) tryPlay();
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (audio.paused) tryPlay();
      else {
        audio.pause();
        player.classList.remove('is-playing');
      }
    });
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prevTrack(); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); nextTrack(); });
    modeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      playMode = MODES[(MODES.indexOf(playMode) + 1) % MODES.length];
      shuffleHistory.length = 0;
      try { localStorage.setItem('ocisly-play-mode', playMode); } catch (_) {}
      persist({ mode: playMode });
      applyMode();
      if (!modeBtn._t) modeBtn._prevLabel = labelEl.textContent;
      labelEl.textContent = MODE_LABELS[playMode];
      clearTimeout(modeBtn._t);
      modeBtn._t = setTimeout(function () { labelEl.textContent = modeBtn._prevLabel; modeBtn._t = 0; }, 1500);
    });
    applyMode();

    function clampPlayerInViewport() {
      var rect = player.getBoundingClientRect();
      var margin = 8;
      var left = rect.left;
      var top  = rect.top;
      if (rect.right  > window.innerWidth)  left = window.innerWidth  - player.offsetWidth  - margin;
      if (rect.bottom > window.innerHeight) top  = window.innerHeight - player.offsetHeight - margin;
      if (left < margin) left = margin;
      if (top  < margin) top  = margin;
      if (player.style.left || player.style.top) {
        player.style.left = left + 'px';
        player.style.top  = top  + 'px';
        player.style.right = 'auto';
        player.style.bottom = 'auto';
      }
    }
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      player.classList.add('is-collapsed');
      persist({ collapsed: true });
    });

    audio.addEventListener('play', function () {
      player.classList.add('is-playing');
      toggle.setAttribute('aria-label', '暂停');
      labelEl.textContent = 'Now Playing';
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      bindMediaSession();
      persist({ playing: true });
    });
    audio.addEventListener('playing', function () { bindMediaSession(); updatePosition(); });
    audio.addEventListener('pause', function () {
      player.classList.remove('is-playing');
      toggle.setAttribute('aria-label', '播放');
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      persist({ playing: false, time: audio.currentTime || 0 });
    });
    audio.addEventListener('error', function () {
      player.classList.remove('is-playing');
      labelEl.textContent = '播放失败，点击重试';
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    });
    ['loadedmetadata', 'durationchange', 'seeked', 'ratechange'].forEach(function (event) {
      audio.addEventListener(event, updatePosition);
    });
    audio.addEventListener('loadedmetadata', function () {
      if (restoreTimeOnce && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(savedTime, Math.max(0, audio.duration - 0.25));
        restoreTimeOnce = false;
        updatePosition();
      }
    });
    audio.addEventListener('ended', function () {
      if (playMode === 'repeat-one') { audio.currentTime = 0; tryPlay(); }
      else nextTrack();
    });

    var dragState = null;
    player.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      if (e.button !== undefined && e.button !== 0) return;
      var rect = player.getBoundingClientRect();
      dragState = {
        pointerId: e.pointerId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        startX:  e.clientX,
        startY:  e.clientY,
        moved:   false
      };
      try { player.setPointerCapture(e.pointerId); } catch (_) {}
      player.classList.add('is-dragging');
    });
    player.addEventListener('pointermove', function (e) {
      if (!dragState || e.pointerId !== dragState.pointerId) return;
      var dx = e.clientX - dragState.startX;
      var dy = e.clientY - dragState.startY;
      if (!dragState.moved && Math.hypot(dx, dy) > 4) dragState.moved = true;
      if (!dragState.moved) return;
      var margin = 4;
      var maxX = window.innerWidth  - player.offsetWidth  - margin;
      var maxY = window.innerHeight - player.offsetHeight - margin;
      var x = Math.max(margin, Math.min(maxX, e.clientX - dragState.offsetX));
      var y = Math.max(margin, Math.min(maxY, e.clientY - dragState.offsetY));
      player.style.left   = x + 'px';
      player.style.top    = y + 'px';
      player.style.right  = 'auto';
      player.style.bottom = 'auto';
    });
    function endDrag() {
      if (!dragState) return;
      var wasMoved = dragState.moved;
      try { player.releasePointerCapture(dragState.pointerId); } catch (_) {}
      dragState = null;
      player.classList.remove('is-dragging');
      if (!wasMoved && player.classList.contains('is-collapsed')) {
        player.classList.remove('is-collapsed');
        persist({ collapsed: false });
        requestAnimationFrame(function () { requestAnimationFrame(clampPlayerInViewport); });
        if (audio.paused) tryPlay();
      }
    }
    player.addEventListener('pointerup',     endDrag);
    player.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', clampPlayerInViewport);

    var lastPersist = 0;
    audio.addEventListener('timeupdate', function () {
      var t = audio.currentTime || 0;
      var m = Math.floor(t / 60);
      var s = Math.floor(t % 60).toString().padStart(2, '0');
      timeEl.textContent = m + ':' + s;
      updatePosition();
      var now = Date.now();
      if (now - lastPersist > 1000) { lastPersist = now; persist(); }
    });
    window.addEventListener('pagehide', function () { persist(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) persist(); });

    function showPlayer() { player.classList.add('nova-mp-ready'); }
    if (document.readyState === 'complete') showPlayer();
    else window.addEventListener('load', showPlayer);
    // If this script is deferred, load may already have fired.
    setTimeout(showPlayer, 400);

    loadTrack(current, false, true);

    var firstGesture = true;
    var onFirstGesture = function (event) {
      if (!firstGesture) return;
      firstGesture = false;
      document.removeEventListener('pointerdown', onFirstGesture);
      document.removeEventListener('keydown', onFirstGesture);
      if (hasSavedVisit && !wantPlaying) return;
      if (event && event.target && event.target.closest && event.target.closest('button, input, textarea, a')) return;
      if (audio.paused) tryPlay();
    };
    document.addEventListener('pointerdown', onFirstGesture, { passive: true });
    document.addEventListener('keydown', onFirstGesture);

    var idleData = new Uint8Array(128);
    function getData() {
      var now = audio.paused ? performance.now() * 0.001 : audio.currentTime * 2.2;
      for (var i = 0; i < idleData.length; i++) {
        idleData[i] = Math.max(0, Math.sin(now + i * 0.28) * 22 + 28 + Math.sin(now * 0.6 + i * 0.11) * 10);
      }
      return idleData;
    }

    function draw() {
      if (width === 0 || height === 0) resize();
      ctx.fillStyle = 'rgba(10, 5, 21, 0.22)';
      ctx.fillRect(0, 0, width, height);

      var data = getData();
      var bins = data.length;
      var sum = 0;
      for (var i = 0; i < bins; i++) sum += data[i];
      var avg = (sum / bins) / 255;

      var barCount = 56;
      var gap = 2;
      var barW = (width - gap) / barCount - gap;
      for (var j = 0; j < barCount; j++) {
        var v = data[Math.floor(j * bins / barCount)] / 255;
        var bh = Math.max(2, v * height * 0.92);
        var x  = gap + j * (barW + gap);
        var y  = height - bh;
        var grad = ctx.createLinearGradient(0, height, 0, y);
        grad.addColorStop(0,    'rgba(255, 112, 184, 0.88)');
        grad.addColorStop(0.55, 'rgba(192, 96,  255, 0.72)');
        grad.addColorStop(1,    'rgba(96,  208, 255, 0.95)');
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(192, 96, 255, 0.55)';
        ctx.shadowBlur  = 8;
        ctx.fillRect(x, y, barW, bh);
        var grad2 = ctx.createLinearGradient(0, height, 0, height + bh * 0.4);
        grad2.addColorStop(0, 'rgba(255, 112, 184, 0.22)');
        grad2.addColorStop(1, 'rgba(255, 112, 184, 0)');
        ctx.fillStyle = grad2;
        ctx.shadowBlur = 0;
        ctx.fillRect(x, height, barW, bh * 0.35);
      }
      ctx.shadowBlur = 0;

      var pulse = 1 + avg * 2.2;
      for (var p = 0; p < particles.length; p++) {
        var pt = particles[p];
        pt.x += pt.vx * pulse;
        pt.y += pt.vy * pulse;
        if (pt.x < -4) pt.x = width + 4;
        else if (pt.x > width + 4) pt.x = -4;
        if (pt.y < -4) pt.y = height + 4;
        else if (pt.y > height + 4) pt.y = -4;
        var alpha = 0.45 + avg * 0.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r * (0.8 + pulse * 0.6), 0, Math.PI * 2);
        ctx.fillStyle   = 'hsla(' + pt.hue + ', 100%, 74%, ' + alpha + ')';
        ctx.shadowColor = 'hsla(' + pt.hue + ', 100%, 70%, 0.9)';
        ctx.shadowBlur  = 10 + avg * 14;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    requestAnimationFrame(draw);
    window.addEventListener('load', function () { resize(); initParticles(); });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
