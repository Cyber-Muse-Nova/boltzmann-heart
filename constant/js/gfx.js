'use strict';
// 绘图：色板、像素文字、基本图元、角色精灵。
(function () {
  const G = window.G;

  // 深蓝、炭灰、冷白。全游戏唯一的暖色是 red。
  G.P = {
    black: '#05070c', night: '#090e1a', deep: '#0e1628', navy: '#142038', blue: '#1c2d4d',
    steel: '#2a4064', slate: '#3b5379', mist: '#5b7196',
    char: '#15171c', char2: '#1e2127', char3: '#2b2f37', gray: '#40454e', gray2: '#5f656f', gray3: '#838a95',
    dim: '#8795aa', cold: '#c3d0e2', white: '#e6eef8',
    green: '#7cc79b', dgreen: '#2f6b4c', screen: '#8fb4dc', glow: '#a9c9ec',
    red: '#e0302a',
  };
  // 值班员的世界：更冷的灰蓝
  G.PC = {
    bg: '#0b0e12', wall: '#151a20', rack: '#1d232b', rack2: '#262d36', edge: '#343d48',
    led: '#7f93a6', led2: '#b4c3d1', text: '#c8d3dc', dim: '#6f7d8a',
  };

  // ---------------------------------------------------------------- 文字
  G.FONT = '"FusionPixel12", "WenQuanYi Zen Hei Sharp", "Zpix", "WenQuanYi Zen Hei Mono", "SimSun", "Songti SC", monospace';
  G.LH = 14; // 行高
  const mctx = document.createElement('canvas').getContext('2d');
  const font = (size) => `${size}px ${G.FONT}`;
  const wcache = new Map();
  G.measure = (s, size = 12) => {
    const k = size + '|' + s;
    let w = wcache.get(k);
    if (w === undefined) {
      mctx.font = font(size);
      w = Math.ceil(mctx.measureText(s).width);
      if (wcache.size > 4000) wcache.clear();
      wcache.set(k, w);
    }
    return w;
  };

  // 把文字画进离屏画布并做阈值处理，让系统字体也呈现硬边像素
  const tcache = new Map();
  function textImg(s, color, size) {
    const k = size + '|' + color + '|' + s;
    let c = tcache.get(k);
    if (c) return c;
    const w = Math.max(1, G.measure(s, size) + 2);
    const h = size + 4;
    c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.font = font(size);
    x.textBaseline = 'top';
    x.fillStyle = color;
    x.fillText(s, 1, 1);
    const img = x.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 100 ? 255 : 0;
    x.putImageData(img, 0, 0);
    if (tcache.size > 1500) tcache.clear();
    tcache.set(k, c);
    return c;
  }
  G.clearTextCache = () => { tcache.clear(); wcache.clear(); };

  // opts: {size, align:'left'|'center'|'right', clip: 可见宽度（打字机用）, alpha}
  G.text = (ctx, s, x, y, color = G.P.cold, opts = {}) => {
    if (!s) return 0;
    const size = opts.size || 12;
    const img = textImg(s, color, size);
    const w = img.width - 2;
    let dx = x;
    if (opts.align === 'center') dx = Math.round(x - w / 2);
    else if (opts.align === 'right') dx = x - w;
    const cw = opts.clip == null ? img.width : Math.min(img.width, opts.clip + 1);
    if (cw <= 0) return w;
    if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
    ctx.drawImage(img, 0, 0, cw, img.height, Math.round(dx) - 1, Math.round(y) - 1, cw, img.height);
    if (opts.alpha != null) ctx.globalAlpha = 1;
    return w;
  };

  // 断行：英文单词不拆开，行首避开中文收尾标点（悬挂）
  const NO_START = '，。、；：？！」』）》…—,.;:!?)%';
  G.wrap = (s, maxW, size = 12) => {
    const out = [];
    for (const para of String(s).split('\n')) {
      const toks = para.match(/[A-Za-z0-9_\-.\/:'~%$@=+#<>]+|\s+|./gu) || [''];
      let line = '';
      for (const tk of toks) {
        const test = line + tk;
        if (G.measure(test, size) <= maxW || line === '') { line = test; continue; }
        if (NO_START.includes(tk[0])) { line = test; continue; } // 标点悬挂
        out.push(line.replace(/\s+$/, ''));
        line = tk.replace(/^\s+/, '');
      }
      out.push(line);
    }
    return out;
  };

  // ---------------------------------------------------------------- 图元
  G.rect = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  G.px = (ctx, x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); };
  G.frame = (ctx, x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  };
  G.disc = (ctx, cx, cy, r, c) => {
    ctx.fillStyle = c;
    for (let dy = -r; dy <= r; dy++) {
      const dx = Math.floor(Math.sqrt(r * r - dy * dy) + 0.3);
      ctx.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
    }
  };
  G.dither = (ctx, x, y, w, h, c) => {
    ctx.fillStyle = c;
    for (let j = 0; j < h; j++) for (let i = (j % 2); i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  };
  G.line = (ctx, x0, y0, x1, y1, c) => {
    ctx.fillStyle = c;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let n = 0; n < 2000; n++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  // 确定性伪随机
  G.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  };
  // 夜空星点
  G.stars = (ctx, x, y, w, h, n, seed, t = 0, color = G.P.dim) => {
    const r = G.rng(seed);
    for (let i = 0; i < n; i++) {
      const sx = x + Math.floor(r() * w), sy = y + Math.floor(r() * h);
      const tw = r();
      if (Math.sin(t / 700 + tw * 20) > -0.6) G.px(ctx, sx, sy, tw > 0.8 ? G.P.white : color);
    }
  };
  // 红色像素点（每个场景藏一个）；blink 为真时缓慢明灭
  G.redDot = (ctx, x, y, t, blink = true) => {
    if (!blink || Math.sin(t / 900) > -0.7) G.px(ctx, x, y, G.P.red);
  };

  // ---------------------------------------------------------------- 精灵
  function build(rows, pal) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = rows.length;
    const x = c.getContext('2d');
    rows.forEach((row, j) => {
      for (let i = 0; i < 16; i++) {
        const ch = row[i];
        if (ch && ch !== '.' && pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); }
      }
    });
    return c;
  }
  function mirror(rows) { return rows.map((r) => r.padEnd(16, '.').slice(0, 16).split('').reverse().join('')); }
  // 走路帧：抬起一条腿、摆一下手
  function step(rows, side) {
    const out = rows.map((r) => r.padEnd(16, '.').slice(0, 16).split(''));
    for (let j = 18; j < 23; j++) {
      for (let i = 0; i < 16; i++) {
        const left = i < 8;
        if ((side === 1 && left) || (side === 2 && !left)) out[j][i] = rows[j + 1] ? rows[j + 1].padEnd(16, '.')[i] : '.';
      }
    }
    return out.map((r) => r.join(''));
  }
  function sideStep(rows, side) {
    const out = rows.map((r) => r.padEnd(16, '.').slice(0, 16).split(''));
    const legs = side === 1
      ? ['....pppppppp....', '....ppp..ppp....', '...ppp....ppp...', '...ppp.....ppp..', '..kkkk.....kkkk.']
      : ['....pppppppp....', '.....pppppp.....', '.....pppppp.....', '......pppp......', '.....kkkkkk.....'];
    for (let j = 0; j < 5; j++) out[18 + j] = legs[j].split('');
    return out.map((r) => r.join(''));
  }

  const HOODIE = { h: '#101216', s: '#c3c6cc', E: '#1a1d24', g: '#6d737d', G: '#50555e', d: '#b9c0ca', p: '#262c38', k: '#14161b', m: '#9aa0a8' };
  const DOWN = [
    '................',
    '.....hhhhhh.....',
    '...hhhhhhhhhh...',
    '..hhhhhhhhhhhhh.',
    '..hhhhhhhhhhhh..',
    '..hhshhhsshhhh..',
    '...hsEssssEsh...',
    '....ssssssss....',
    '.....ssmmss.....',
    '......ssss......',
    '...gggggggggg...',
    '..gggggddggggg..',
    '..ggggdggdgggg..',
    '..gGggggggggGg..',
    '..gGggggggggGg..',
    '..sGggggggggGs..',
    '..s.gggggggg.s..',
    '....gggggggg....',
    '....pppppppp....',
    '....ppp..ppp....',
    '....ppp..ppp....',
    '....ppp..ppp....',
    '....kkk..kkk....',
    '................',
  ];
  const UP = DOWN.map((r, j) => {
    if (j >= 5 && j <= 8) return j === 8 ? '.....hhhhhh.....' : j === 7 ? '....hhhhhhhh....' : '..hhhhhhhhhhhh..';
    if (j === 11 || j === 12) return '..gggggggggggg..';
    return r;
  });
  const RIGHT = [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '...hhhhhhhhhh...',
    '...hhhhhhhhhhh..',
    '...hhhhhhhsshh..',
    '...hhhhhssssh...',
    '...hhhhssssEs...',
    '....hhhsssssss..',
    '.....hssssss....',
    '....gggggggg....',
    '...gggggggggg...',
    '...gggggggggg...',
    '...gggGggggggg..',
    '...gggGgggggg...',
    '...gggGgggggg...',
    '....ggsggggg....',
    '....gggggggg....',
    '....pppppppp....',
    '.....pppppp.....',
    '.....ppp.ppp....',
    '.....ppp.ppp....',
    '.....kkkk.kkkk..',
    '................',
  ];
  G.sprites = {};
  function makeSet(name, pal) {
    const set = {};
    set.down = [build(DOWN, pal), build(step(DOWN, 1), pal), build(step(DOWN, 2), pal)];
    set.up = [build(UP, pal), build(step(UP, 1), pal), build(step(UP, 2), pal)];
    set.right = [build(RIGHT, pal), build(sideStep(RIGHT, 1), pal), build(sideStep(RIGHT, 2), pal)];
    set.left = set.right.map((_, i) => build(mirror(i === 0 ? RIGHT : sideStep(RIGHT, i)), pal));
    G.sprites[name] = set;
  }
  makeSet('constant', HOODIE);
  // 剪影（行人、朋友、远处看不清的人）
  makeSet('shadow', { h: '#1c2331', s: '#27303f', E: '#27303f', g: '#222a38', G: '#1d2432', d: '#222a38', p: '#1a202b', k: '#141820', m: '#27303f' });
  makeSet('shadowLight', { h: '#3c4658', s: '#566175', E: '#566175', g: '#485266', G: '#3f485a', d: '#485266', p: '#343c4c', k: '#2a303c', m: '#566175' });

  // 画角色：x,y 为脚底中点
  G.drawActor = (ctx, set, dir, frame, x, y) => {
    const s = G.sprites[set][dir][frame];
    ctx.drawImage(s, Math.round(x - 8), Math.round(y - 24));
  };
  G.WALK = [0, 1, 0, 2];
})();
