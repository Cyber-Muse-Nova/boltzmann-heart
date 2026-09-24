'use strict';
// 核心：主循环、缩放、输入、协程式等待、存档、音频。
(function () {
  const G = (window.G = {});
  G.W = 320;
  G.H = 180;
  G.ABORT = { abort: true, toString: () => 'ABORT' };

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  G.canvas = canvas;
  G.ctx = ctx;

  G.t = 0; // 游戏时间（暂停时停止）
  G.timeScale = 1; // 仅供自动化测试加速
  G.real = 0; // 真实时间
  G.bg = null; // (ctx, t) => void —— 当前场景画面
  G.sceneUpdate = null; // (dt, hasInput) => void
  G.ui = []; // 模态控件栈：{update(dt, active), draw(ctx), done}
  G.overlay = null; // 暂停菜单等，冻结 G.t
  G.fade = 0; // 0 透明 → 1 全黑
  G.fadeColor = '#000';

  // ---------------------------------------------------------------- 缩放
  function resize() {
    const vw = window.innerWidth;
    const touch = document.body.classList.contains('touch');
    const portrait = window.innerHeight > vw;
    const reserve = touch && portrait ? 220 : 0;
    const vh = window.innerHeight - reserve;
    const fit = Math.min(vw / G.W, vh / G.H);
    // 整数倍放大；窗口太小时退回分数倍，避免手机上只有 1 倍
    const s = fit >= 2 ? Math.floor(fit) : Math.max(0.5, fit);
    canvas.style.width = G.W * s + 'px';
    canvas.style.height = G.H * s + 'px';
    const stage = document.getElementById('stage');
    stage.style.bottom = reserve + 'px';
    G.scale = s;
  }
  window.addEventListener('resize', resize);
  resize();
  G.resize = resize;

  // ---------------------------------------------------------------- 输入
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'ok', Enter: 'ok', NumpadEnter: 'ok', KeyZ: 'ok',
    Escape: 'menu', KeyX: 'skip', ControlLeft: 'skip', ControlRight: 'skip',
  };
  G.keys = {};
  let queue = {};
  G.pressed = {};
  G.anyKey = false;
  let anyQueued = false;
  G.mouse = null;
  G.click = null;
  let clickQueued = null;

  window.addEventListener('keydown', (e) => {
    const a = KEYMAP[e.code];
    if (a) {
      e.preventDefault();
      if (!e.repeat) queue[a] = true;
      G.keys[a] = true;
    }
    if (!e.repeat && !e.metaKey && !e.altKey) anyQueued = true;
    G.audio.unlock();
  });
  window.addEventListener('keyup', (e) => {
    const a = KEYMAP[e.code];
    if (a) G.keys[a] = false;
  });
  window.addEventListener('blur', () => { G.keys = {}; });

  function toGame(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((e.clientX - r.left) / r.width) * G.W),
      y: Math.floor(((e.clientY - r.top) / r.height) * G.H),
    };
  }
  canvas.addEventListener('pointermove', (e) => { G.mouse = toGame(e); });
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    G.mouse = toGame(e);
    clickQueued = G.mouse;
    G.audio.unlock();
  });

  // 虚拟按键
  function markTouch() {
    if (!document.body.classList.contains('touch')) {
      document.body.classList.add('touch');
      resize();
    }
  }
  window.addEventListener('touchstart', markTouch, { passive: true });
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) markTouch();
  document.querySelectorAll('#pad button').forEach((b) => {
    const a = b.dataset.k;
    const down = (e) => {
      e.preventDefault();
      queue[a] = true; G.keys[a] = true; anyQueued = true;
      b.classList.add('on');
      G.audio.unlock();
    };
    const up = (e) => { e.preventDefault(); G.keys[a] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('pointerleave', up);
  });

  G.hit = (a) => !!G.pressed[a];
  G.eat = (a) => { const v = !!G.pressed[a]; G.pressed[a] = false; return v; };
  G.eatClick = () => { const c = G.click; G.click = null; return c; };
  G.held = (a) => !!G.keys[a];
  G.clearInput = () => { queue = {}; G.pressed = {}; G.click = null; clickQueued = null; anyQueued = false; G.anyKey = false; };

  // ---------------------------------------------------------------- 协程式等待
  G.waiters = [];
  G.aborting = false;
  G.until = (pred) =>
    new Promise((res, rej) => {
      if (G.aborting) return rej(G.ABORT);
      G.waiters.push({ pred, res, rej });
    });
  G.wait = (ms) => {
    const end = G.t + ms;
    return G.until(() => G.t >= end);
  };
  G.nextFrame = () => { let n = 0; return G.until(() => ++n > 1); };
  function processWaiters() {
    const ws = G.waiters;
    G.waiters = [];
    for (const w of ws) {
      let ok = false;
      try { ok = w.pred(); } catch (err) { w.rej(err); continue; }
      if (ok) w.res(); else G.waiters.push(w);
    }
  }
  G.abort = () => {
    G.aborting = true;
    const ws = G.waiters;
    G.waiters = [];
    ws.forEach((w) => w.rej(G.ABORT));
    G.ui = [];
    G.overlay = null;
    G.sceneUpdate = null;
  };

  // 动画辅助：在 ms 内把 get/set 从当前值过渡到 to
  G.tween = async (ms, fn) => {
    const start = G.t;
    await G.until(() => {
      const p = Math.min(1, (G.t - start) / ms);
      fn(p);
      return p >= 1;
    });
  };
  G.fadeTo = (to, ms = 600, color) => {
    if (color) G.fadeColor = color;
    const from = G.fade;
    return G.tween(ms, (p) => { G.fade = from + (to - from) * p; });
  };

  // ---------------------------------------------------------------- 主循环
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    G.real += dt;
    G.pressed = queue; queue = {};
    G.click = clickQueued; clickQueued = null;
    G.anyKey = anyQueued; anyQueued = false;

    try {
      if (G.overlay) {
        G.overlay.update(dt);
        if (G.overlay && G.overlay.done) G.overlay = null;
      } else {
        G.t += dt * G.timeScale;
        if (G.hit('menu') && G.onMenu) { G.eat('menu'); G.onMenu(); }
        const top = G.ui[G.ui.length - 1];
        for (const w of G.ui) w.update(dt * G.timeScale, w === top);
        G.ui = G.ui.filter((w) => !w.done);
        if (G.sceneUpdate) G.sceneUpdate(dt * Math.min(G.timeScale, 4), G.ui.length === 0 && !G.lockInput);
        processWaiters();
      }
      draw();
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(frame);
  }
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, G.W, G.H);
    if (G.bg) { ctx.save(); G.bg(ctx, G.t); ctx.restore(); }
    for (const w of G.ui) { ctx.save(); w.draw(ctx); ctx.restore(); }
    if (G.fade > 0) {
      ctx.globalAlpha = Math.min(1, G.fade);
      ctx.fillStyle = G.fadeColor;
      ctx.fillRect(0, 0, G.W, G.H);
      ctx.globalAlpha = 1;
    }
    if (G.after) { ctx.save(); G.after(ctx, G.t); ctx.restore(); }
    if (G.overlay) { ctx.save(); G.overlay.draw(ctx); ctx.restore(); }
  }
  G.start = () => requestAnimationFrame(frame);

  // ---------------------------------------------------------------- 存档
  const SAVE_KEY = 'constant.save.v1';
  const RUN0 = 7038112904;
  G.RUN0 = RUN0;
  function defaults() {
    return {
      v: 1,
      run: RUN0, // 下一局（标题画面显示）的编号
      runs: 0, // 已开局次数
      endings: {}, // e1..e5: {run, at}
      read: {},
      settings: { mute: false, speed: 1 },
    };
  }
  G.loadSave = () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { s = null; }
    const d = defaults();
    if (!s || typeof s !== 'object') return d;
    return Object.assign(d, s, { settings: Object.assign(d.settings, s.settings || {}) });
  };
  G.persist = () => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) { /* 隐私模式等情况下忽略 */ }
  };
  G.clearSave = () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    G.save = defaults();
    G.audio.setMute(false);
  };
  G.save = G.loadSave();

  // 已读文本：以文本内容的哈希为键
  G.hash = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };
  G.isRead = (s) => !!G.save.read[G.hash(s)];
  G.markRead = (s) => { G.save.read[G.hash(s)] = 1; };

  G.fmtRun = (n) => Number(n).toLocaleString('en-US');

  // ---------------------------------------------------------------- 音频（Web Audio 芯片音）
  const A = (G.audio = {});
  let ac = null, master = null, humNodes = null, windNodes = null;
  A.unlock = () => {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain();
        master.gain.value = G.save.settings.mute ? 0 : 0.8;
        master.connect(ac.destination);
      } catch (e) { ac = null; return; }
    }
    if (ac.state === 'suspended') ac.resume();
  };
  A.setMute = (m) => {
    G.save.settings.mute = m;
    G.persist();
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ac.currentTime, 0.05);
  };
  function blip(freq, dur, type = 'square', vol = 0.04, slide = 0) {
    if (!ac || G.save.settings.mute) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  A.type = (mono) => blip(mono ? 1200 + Math.random() * 200 : 640 + Math.random() * 180, 0.03, 'square', 0.025);
  A.select = () => blip(880, 0.05, 'square', 0.03);
  A.confirm = () => { blip(660, 0.06, 'square', 0.035); setTimeout(() => blip(990, 0.08, 'square', 0.03), 60); };
  A.cancel = () => blip(330, 0.08, 'square', 0.03, 0.7);
  A.heart = () => {
    blip(62, 0.18, 'sine', 0.35, 0.6);
    setTimeout(() => blip(55, 0.22, 'sine', 0.28, 0.6), 230);
  };
  A.thud = () => blip(90, 0.3, 'triangle', 0.2, 0.4);
  A.glitch = (dur = 0.25) => {
    if (!ac || G.save.settings.mute) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.floor(i / 400) % 2 ? 1 : 0.2);
    const s = ac.createBufferSource();
    const g = ac.createGain();
    g.gain.value = 0.08;
    s.buffer = buf; s.connect(g); g.connect(master); s.start();
  };
  // 机房/房间的低频嗡鸣
  A.hum = (level = 1) => {
    if (!ac) return;
    if (!humNodes) {
      const g = ac.createGain();
      g.gain.value = 0;
      const f = ac.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 180;
      const o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 50;
      const o2 = ac.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 100.6;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(master);
      o1.start(); o2.start();
      humNodes = { g };
    }
    humNodes.g.gain.setTargetAtTime(0.05 * level, ac.currentTime, 0.4);
  };
  A.wind = (level = 1) => {
    if (!ac) return;
    if (!windNodes) {
      const len = ac.sampleRate * 2;
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      let v = 0;
      for (let i = 0; i < len; i++) { v = v * 0.98 + (Math.random() * 2 - 1) * 0.02; d[i] = v * 6; }
      const s = ac.createBufferSource(); s.buffer = buf; s.loop = true;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.6;
      const g = ac.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(master); s.start();
      windNodes = { g };
    }
    windNodes.g.gain.setTargetAtTime(0.25 * level, ac.currentTime, 0.8);
  };
  A.quiet = () => { A.hum(0); A.wind(0); };
})();
