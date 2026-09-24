'use strict';
// 界面控件：对话框（逐字）、选项、终端、聊天、章节卡、暂停菜单、提示。
(function () {
  const G = window.G, P = G.P;
  const SPEEDS = [24, 42, 90];

  // ---------------------------------------------------------------- 对话框
  // opts: {speaker, mono, color, pos:'bottom'|'top'|'center', box:{x,y,w,h}, auto:ms, bold}
  G.say = async (text, opts = {}) => {
    const w = makeSay(text, opts);
    G.ui.push(w);
    await G.until(() => w.done);
  };
  // 连续多段
  G.sayAll = async (list, opts = {}) => {
    for (const t of list) await G.say(t, opts);
  };

  function layout(opts) {
    if (opts.box) {
      const b = opts.box;
      return { box: b, tx: b.x + 7, ty: b.y + 6, maxW: b.w - 14, lines: Math.max(1, Math.floor((b.h - 10) / G.LH)), drawBox: true };
    }
    if (opts.pos === 'center') return { box: null, tx: 160, ty: 0, maxW: 272, lines: 7, center: true };
    const y = opts.pos === 'top' ? 4 : 124;
    return { box: { x: 4, y, w: 312, h: 52 }, tx: 12, ty: y + 6, maxW: 296, lines: 3, drawBox: true };
  }

  function makeSay(text, opts) {
    const L = layout(opts);
    const all = G.wrap(text, L.maxW);
    const pages = [];
    for (let i = 0; i < all.length; i += L.lines) pages.push(all.slice(i, i + L.lines));
    const read = G.isRead(text);
    const color = opts.color || (opts.mono ? P.green : P.white);
    const w = {
      kind: 'say', text,
      done: false, page: 0, shown: 0, acc: 0, wait: 0,
      update(dt, active) {
        const lines = pages[this.page];
        const total = lines.reduce((a, l) => a + [...l].length, 0);
        const skipping = active && read && G.held('skip');
        if (this.shown < total) {
          const cps = SPEEDS[G.save.settings.speed] || SPEEDS[1];
          this.acc += (dt / 1000) * cps * (G.held('ok') && active ? 3 : 1);
          const before = Math.floor(this.shown);
          this.shown = Math.min(total, this.shown + Math.floor(this.acc));
          this.acc -= Math.floor(this.acc);
          if (Math.floor(this.shown) !== before && Math.floor(this.shown) % 2 === 0) G.audio.type(opts.mono);
          if (skipping) this.shown = total;
          if (active && (G.eat('ok') || G.eatClick())) this.shown = total;
          return;
        }
        this.wait += dt;
        const adv = (active && (G.eat('ok') || G.eatClick())) || (skipping && this.wait > 40) || (opts.auto && this.wait > opts.auto);
        if (adv) {
          this.page++; this.shown = 0; this.acc = 0; this.wait = 0;
          if (this.page >= pages.length) { this.done = true; G.markRead(text); }
        }
      },
      draw(ctx) {
        if (this.done) return;
        const lines = pages[this.page];
        if (L.drawBox && !opts.noBox) {
          const b = L.box;
          ctx.globalAlpha = 0.88;
          G.rect(ctx, b.x, b.y, b.w, b.h, '#060911');
          ctx.globalAlpha = 1;
          G.frame(ctx, b.x, b.y, b.w, b.h, '#26344d');
          if (opts.speaker) {
            const sw = G.measure(opts.speaker) + 10;
            G.rect(ctx, b.x + 4, b.y - 12, sw, 13, '#060911');
            G.frame(ctx, b.x + 4, b.y - 12, sw, 13, '#26344d');
            G.text(ctx, opts.speaker, b.x + 9, b.y - 11, P.dim);
          }
        }
        let left = this.shown;
        const startY = L.center ? Math.round(90 - (lines.length * G.LH) / 2) : L.ty;
        lines.forEach((ln, i) => {
          const chars = [...ln];
          const n = Math.max(0, Math.min(chars.length, left));
          left -= chars.length;
          const clip = n >= chars.length ? null : G.measure(chars.slice(0, n).join(''));
          if (n <= 0) return;
          const y = startY + i * G.LH;
          if (L.center) {
            const full = G.measure(ln);
            G.text(ctx, ln, Math.round(160 - full / 2), y, color, { clip });
          } else G.text(ctx, ln, L.tx, y, color, { clip });
        });
        const total = lines.reduce((a, l) => a + [...l].length, 0);
        if (this.shown >= total && Math.floor(G.real / 400) % 2 === 0) {
          if (L.center) G.text(ctx, '▾', 160, startY + lines.length * G.LH + 2, P.dim, { align: 'center' });
          else { const b = L.box; G.text(ctx, '▾', b.x + b.w - 11, b.y + b.h - 13, P.dim); }
        }
        if (read && L.drawBox && !opts.noBox && this.page === 0) G.px(ctx, L.box.x + 2, L.box.y + 2, P.slate); // 已读标记
      },
    };
    return w;
  }

  // ---------------------------------------------------------------- 选项
  // options: 字符串或 {label, disabled}；返回下标
  G.choose = async (options, opts = {}) => {
    const w = makeChoice(options, opts);
    G.ui.push(w);
    await G.until(() => w.done);
    G.audio.confirm();
    return w.result;
  };
  function makeChoice(options, opts) {
    const items = options.map((o) => (typeof o === 'string' ? { label: o } : o));
    const pad = 8;
    const iw = Math.max(80, ...items.map((i) => G.measure(i.label) + 22), opts.prompt ? G.measure(opts.prompt) + 16 : 0);
    const w0 = Math.min(opts.w || 300, iw + pad);
    const ih = G.LH + 2;
    const ph = opts.prompt ? G.LH + 4 : 0;
    const h = items.length * ih + pad + ph;
    const x = opts.x != null ? opts.x : Math.round(160 - w0 / 2);
    const y = opts.y != null ? opts.y : Math.round((opts.pos === 'low' ? 120 : 92) - h / 2);
    let sel = items.findIndex((i) => !i.disabled);
    const move = (d) => {
      for (let k = 0; k < items.length; k++) {
        sel = (sel + d + items.length) % items.length;
        if (!items[sel].disabled) break;
      }
      G.audio.select();
    };
    return {
      kind: 'choice', items: items.map((i) => (i.disabled ? '!' : '') + i.label),
      done: false, result: -1,
      update(dt, active) {
        if (!active) return;
        if (G.eat('up')) move(-1);
        if (G.eat('down')) move(1);
        if (G.mouse) {
          const m = G.mouse;
          const i = Math.floor((m.y - (y + 4 + ph)) / ih);
          if (m.x >= x && m.x < x + w0 && i >= 0 && i < items.length && !items[i].disabled && this._lastMouse !== m) { sel = i; }
          this._lastMouse = m;
        }
        const c = G.eatClick();
        if (c) {
          const i = Math.floor((c.y - (y + 4 + ph)) / ih);
          if (c.x >= x && c.x < x + w0 && i >= 0 && i < items.length && !items[i].disabled) { this.result = i; this.done = true; return; }
        }
        if (G.eat('ok') && sel >= 0) { this.result = sel; this.done = true; }
      },
      draw(ctx) {
        ctx.globalAlpha = 0.92;
        G.rect(ctx, x, y, w0, h, '#060911');
        ctx.globalAlpha = 1;
        G.frame(ctx, x, y, w0, h, '#3b5379');
        if (opts.prompt) G.text(ctx, opts.prompt, x + 8, y + 5, P.dim);
        items.forEach((it, i) => {
          const iy = y + 4 + ph + i * ih;
          const on = i === sel;
          if (on) G.rect(ctx, x + 2, iy, w0 - 4, ih, '#142038');
          G.text(ctx, (on ? '▸ ' : '  ') + it.label, x + 6, iy + 2, it.disabled ? P.gray : on ? P.white : P.cold);
        });
      },
    };
  }

  // ---------------------------------------------------------------- 终端
  class Term {
    constructor(title = 'duty@node-07: ~') {
      this.title = title;
      this.lines = [];
      this.cursor = true;
      this.prompt = 'duty@node-07:~$ ';
    }
    push(s, c) { this.lines.push({ s, c }); }
    async cmd(str, speed = 20) {
      const ln = { s: this.prompt, c: P.cold, typing: true };
      this.lines.push(ln);
      await G.wait(260);
      for (const ch of str) {
        ln.s += ch;
        G.audio.type(true);
        if (!G.held('skip')) await G.wait(1000 / speed + Math.random() * 30);
      }
      ln.typing = false;
      await G.wait(G.held('skip') ? 30 : 280);
    }
    async out(lines, gap = 55, color) {
      for (const l of lines) {
        const o = typeof l === 'string' ? { s: l, c: color } : l;
        this.lines.push(o);
        if (!G.held('skip')) await G.wait(gap);
      }
    }
    // 在 rect 中绘制，只显示能放下的最后几行
    draw(ctx, r, pal = {}) {
      const bg = pal.bg || '#04070a', edge = pal.edge || '#1f3a2e', txt = pal.text || '#8fd1a8', bar = pal.bar || '#0c1813';
      G.rect(ctx, r.x, r.y, r.w, r.h, bg);
      G.frame(ctx, r.x, r.y, r.w, r.h, edge);
      G.rect(ctx, r.x + 1, r.y + 1, r.w - 2, 12, bar);
      G.text(ctx, this.title, r.x + 5, r.y + 1, pal.dim || '#4f7a64');
      const lh = 12;
      const max = Math.floor((r.h - 17) / lh);
      const vis = this.lines.slice(-max);
      vis.forEach((l, i) => {
        G.text(ctx, l.s, r.x + 5, r.y + 15 + i * lh, l.c || txt);
      });
      if (this.cursor && Math.floor(G.real / 450) % 2 === 0) {
        const lastI = vis.length - 1;
        const last = vis[lastI];
        const onPrompt = last && last.typing;
        const cy = onPrompt ? r.y + 15 + lastI * lh : r.y + 15 + Math.min(vis.length, max - 1) * lh;
        const cx = onPrompt ? r.x + 5 + G.measure(last.s) : r.x + 5;
        G.rect(ctx, cx, cy + 1, 6, 10, txt);
      }
    }
  }
  G.Term = Term;
  G.waitOk = async () => {
    G.clearInput();
    await G.until(() => G.eat('ok') || !!G.eatClick() || G.held('skip'));
  };

  // ---------------------------------------------------------------- 聊天（手机 / 电脑）
  class Chat {
    constructor(title) {
      this.title = title;
      this.msgs = [];
      this.typing = null; // 正在输入的人
      this.draft = '';
    }
    async recv(from, text, delay = 900) {
      this.typing = from;
      if (!G.held('skip') || !G.isRead(text)) await G.wait(delay);
      this.typing = null;
      this.msgs.push({ from, text, side: 'l' });
      G.markRead(text);
      G.audio.select();
      await G.wait(G.held('skip') ? 30 : 220);
    }
    async send(text, hint = '发送') {
      this.draft = '';
      for (const ch of text) {
        this.draft += ch;
        G.audio.type();
        if (!G.held('skip')) await G.wait(45);
      }
      this.sendHint = hint;
      G.clearInput();
      await G.until(() => G.eat('ok') || !!G.eatClick() || (G.held('skip') && G.isRead(text)));
      this.sendHint = null;
      this.draft = '';
      this.msgs.push({ from: 'me', text, side: 'r' });
      G.markRead(text);
      G.audio.confirm();
      await G.wait(200);
    }
    draw(ctx, r, style = 'phone') {
      const inner = { x: r.x + 4, y: r.y + 16, w: r.w - 8, h: r.h - 36 };
      G.rect(ctx, r.x, r.y, r.w, r.h, style === 'phone' ? '#0b111d' : '#070b12');
      G.frame(ctx, r.x, r.y, r.w, r.h, '#2a4064');
      G.text(ctx, this.title, r.x + r.w / 2, r.y + 2, P.dim, { align: 'center' });
      G.rect(ctx, r.x + 1, r.y + 14, r.w - 2, 1, '#1c2d4d');
      // 气泡从底部往上排
      const bw = inner.w - 22;
      let y = inner.y + inner.h;
      ctx.save();
      ctx.beginPath(); ctx.rect(inner.x, inner.y, inner.w, inner.h); ctx.clip();
      if (this.typing) {
        y -= 18;
        const dots = '·'.repeat(1 + (Math.floor(G.real / 300) % 3));
        G.rect(ctx, inner.x, y, 30, 15, '#1c2d4d');
        G.text(ctx, dots, inner.x + 6, y + 1, P.cold);
      }
      let prevFrom = this.typing;
      for (let i = this.msgs.length - 1; i >= 0 && y > inner.y - 200; i--) {
        const m = this.msgs[i];
        const lines = G.wrap(m.text, bw - 8);
        const h = lines.length * G.LH + 4;
        const w = Math.min(bw, Math.max(...lines.map((l) => G.measure(l))) + 9);
        y -= h + 3;
        const bx = m.side === 'r' ? inner.x + inner.w - w : inner.x;
        G.rect(ctx, bx, y, w, h, m.side === 'r' ? '#2a4064' : '#1a2233');
        if (m.blur) G.dither(ctx, bx + 3, y + 3, w - 6, h - 6, P.mist);
        else lines.forEach((l, j) => G.text(ctx, l, bx + 4, y + 2 + j * G.LH, m.side === 'r' ? P.white : P.cold));
        const next = this.msgs[i - 1];
        if (m.side === 'l' && (!next || next.from !== m.from)) {
          y -= G.LH;
          G.text(ctx, m.from, inner.x, y + 1, P.gray3);
        }
        prevFrom = m.from;
      }
      ctx.restore();
      // 输入栏
      const iy = r.y + r.h - 18;
      G.rect(ctx, r.x + 3, iy, r.w - 6, 15, '#101a2c');
      if (this.draft) {
        const ls = G.wrap(this.draft, r.w - 40);
        G.text(ctx, ls[ls.length - 1], r.x + 6, iy + 1, P.white);
      }
      if (this.sendHint) {
        const blink = Math.floor(G.real / 400) % 2 === 0;
        G.text(ctx, this.sendHint, r.x + r.w - 6, iy + 1, blink ? P.white : P.dim, { align: 'right' });
      }
    }
  }
  G.Chat = Chat;

  // ---------------------------------------------------------------- 章节卡
  G.chapterCard = async (num, title) => {
    const prevBg = G.bg;
    G.fade = 1;
    G.bg = (ctx) => {
      G.rect(ctx, 0, 0, 320, 180, P.black);
      G.text(ctx, num, 160, 72, P.dim, { align: 'center' });
      G.text(ctx, title, 160, 92, P.white, { align: 'center' });
    };
    await G.fadeTo(0, 700);
    await G.wait(G.held('skip') ? 200 : 1600);
    await G.fadeTo(1, 600);
    G.bg = prevBg;
  };

  // 黑屏正中的一句
  G.blackLine = async (text, opts = {}) => {
    const prev = G.bg;
    G.bg = (ctx) => G.rect(ctx, 0, 0, 320, 180, opts.bg || '#000');
    await G.say(text, Object.assign({ pos: 'center' }, opts));
    G.bg = prev;
  };

  // ---------------------------------------------------------------- 提示条（DOM）
  let toastTimer = 0;
  G.toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  };

  G.share = async () => {
    const url = location.href.split('#')[0].split('?')[0];
    const data = { title: '常数 CONSTANT', text: '凌晨两点三十四分，Constant 第一次认真怀疑自己是一串代码。', url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(url);
      G.toast('链接已复制，可以直接发给朋友。');
    } catch (e) {
      window.prompt('复制这个链接分享给朋友：', url);
    }
  };
  document.getElementById('shareBtn').addEventListener('click', () => G.share());

  // ---------------------------------------------------------------- 菜单（不依赖游戏时间，可在暂停时使用）
  // items: [{label: string|()=>string, act: ()=>any, disabled}]
  G.Menu = class {
    constructor(items, opts = {}) {
      this.items = items; this.opts = opts; this.sel = 0; this.done = false;
    }
    label(i) { const l = this.items[i].label; return typeof l === 'function' ? l() : l; }
    geom() {
      const o = this.opts;
      const w = o.w || Math.max(120, ...this.items.map((_, i) => G.measure(this.label(i)) + 26));
      const ih = 16;
      const h = this.items.length * ih + 8 + (o.title ? 18 : 0);
      const x = o.x != null ? o.x : Math.round(160 - w / 2);
      const y = o.y != null ? o.y : Math.round(90 - h / 2);
      return { x, y, w, h, ih, top: y + 4 + (o.title ? 18 : 0) };
    }
    update() {
      const g = this.geom();
      const n = this.items.length;
      const mv = (d) => { for (let k = 0; k < n; k++) { this.sel = (this.sel + d + n) % n; if (!this.items[this.sel].disabled) break; } G.audio.select(); };
      if (G.eat('up')) mv(-1);
      if (G.eat('down')) mv(1);
      if (G.mouse && G.mouse !== this._m) {
        this._m = G.mouse;
        const i = Math.floor((G.mouse.y - g.top) / g.ih);
        if (G.mouse.x >= g.x && G.mouse.x < g.x + g.w && i >= 0 && i < n && !this.items[i].disabled) this.sel = i;
      }
      const c = G.eatClick();
      let pick = -1;
      if (c) {
        const i = Math.floor((c.y - g.top) / g.ih);
        if (c.x >= g.x && c.x < g.x + g.w && i >= 0 && i < n) pick = i;
      }
      if (G.eat('ok')) pick = this.sel;
      if (pick >= 0 && !this.items[pick].disabled) { this.sel = pick; G.audio.confirm(); this.items[pick].act(); }
      if (G.eat('menu') && this.opts.onBack) { G.audio.cancel(); this.opts.onBack(); }
    }
    draw(ctx) {
      const g = this.geom();
      if (this.opts.dim !== false) { ctx.globalAlpha = 0.6; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1; }
      if (this.opts.box !== false) {
        G.rect(ctx, g.x, g.y, g.w, g.h, '#060911');
        G.frame(ctx, g.x, g.y, g.w, g.h, '#3b5379');
      }
      if (this.opts.title) G.text(ctx, this.opts.title, g.x + g.w / 2, g.y + 4, P.dim, { align: 'center' });
      this.items.forEach((it, i) => {
        const on = i === this.sel;
        const iy = g.top + i * g.ih;
        if (on && this.opts.box !== false) G.rect(ctx, g.x + 2, iy, g.w - 4, g.ih, '#142038');
        const lab = this.label(i);
        if (this.opts.align === 'center') G.text(ctx, (on ? '▸ ' : '') + lab, g.x + g.w / 2, iy + 2, it.disabled ? P.gray : on ? P.white : P.dim, { align: 'center' });
        else G.text(ctx, (on ? '▸ ' : '  ') + lab, g.x + 6, iy + 2, it.disabled ? P.gray : on ? P.white : P.cold);
      });
    }
  };

  // 暂停菜单
  G.openPause = () => {
    const speedName = ['慢', '中', '快'];
    const close = () => { G.overlay = null; G.clearInput(); };
    const m = new G.Menu([
      { label: '继续', act: close },
      { label: () => '声音：' + (G.save.settings.mute ? '关' : '开'), act: () => G.audio.setMute(!G.save.settings.mute) },
      { label: () => '文字速度：' + speedName[G.save.settings.speed], act: () => { G.save.settings.speed = (G.save.settings.speed + 1) % 3; G.persist(); } },
      { label: '分享游戏链接', act: () => G.share() },
      {
        label: '回到标题',
        act: () => {
          G.overlay = null;
          G.persist();
          G.abort();
        },
      },
      { label: '返回 Nova Crystal 网站', act: () => { location.href = '../index.html#works'; } },
    ], { title: '暂停　Esc 继续', onBack: close });
    G.overlay = m;
  };
})();
