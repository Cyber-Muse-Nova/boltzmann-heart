'use strict';
// 画面效果：闭眼的白色光点（浮动 → 竖列 → 向下流动）、故障、倒带。
(function () {
  const G = window.G, P = G.P;

  G.bgTween = (ms, fn) => { G.tween(ms, fn).catch(() => {}); };

  // 闭眼光点
  const N = 140;
  const seeds = [];
  (function () {
    const r = G.rng(2034);
    for (let i = 0; i < N; i++) seeds.push({ x: r() * 320, y: r() * 180, c: Math.floor(r() * 17), ph: r() * 6.28, sp: 0.6 + r() * 0.8, b: r() });
  })();
  G.rain = { align: 0, flow: 0, alpha: 1, offset: 0, last: 0 };
  G.resetRain = () => Object.assign(G.rain, { align: 0, flow: 0, alpha: 1, offset: 0, last: 0 });
  G.drawRain = (ctx, t, color = '#dfe8f4') => {
    const R = G.rain;
    const dt = R.last ? Math.min(50, t - R.last) : 0;
    R.last = t;
    R.offset += dt * 0.05 * R.flow;
    ctx.globalAlpha = R.alpha;
    for (const s of seeds) {
      const fx = s.x + Math.sin(t / 900 + s.ph) * 6;
      const fy = s.y + Math.cos(t / 1100 + s.ph) * 5;
      const cx = 10 + s.c * 18.8;
      const x = fx + (cx - fx) * R.align;
      let y = fy + R.offset * s.sp;
      y = ((y % 190) + 190) % 190 - 5;
      const bright = s.b > 0.7 ? color : '#7d8ba0';
      if (R.flow > 0.2) {
        for (let k = 1; k <= 3; k++) {
          ctx.globalAlpha = R.alpha * (0.35 - k * 0.1);
          G.px(ctx, x, y - k * 2, bright);
        }
        ctx.globalAlpha = R.alpha;
      }
      if (Math.sin(t / 400 + s.ph * 3) > -0.8 || R.flow > 0.2) G.px(ctx, x, y, bright);
    }
    ctx.globalAlpha = 1;
  };

  // 完整的闭眼段落：texts 与光点变化同时进行
  G.eyesClosed = async (texts, opts = {}) => {
    G.resetRain();
    const prev = G.bg;
    G.bg = (ctx, t) => { G.rect(ctx, 0, 0, 320, 180, opts.bg || '#000'); G.drawRain(ctx, t); if (opts.after) opts.after(ctx, t); };
    await G.fadeTo(0, 800);
    const steps = texts.length;
    // 第一段：浮动；中段：排成竖列；末段：向下流动
    const alignAt = opts.alignAt != null ? opts.alignAt : Math.max(1, Math.floor(steps / 3));
    const flowAt = opts.flowAt != null ? opts.flowAt : Math.max(alignAt + 1, Math.floor((steps * 2) / 3));
    for (let i = 0; i < steps; i++) {
      if (i === alignAt) { const a0 = G.rain.align; G.bgTween(2600, (p) => { G.rain.align = a0 + (1 - a0) * p; }); }
      if (i === flowAt) { G.rain.align = 1; G.bgTween(2600, (p) => { G.rain.flow = p; }); }
      await G.say(texts[i], { pos: opts.pos || 'bottom', noBox: opts.noBox });
    }
    G.rain.align = 1; G.rain.flow = 1;
    if (!opts.keep) G.bg = prev;
  };

  // 故障：横向切片错位
  G.glitchFx = (ctx, amount = 1, seed = 0) => {
    const r = G.rng(Math.floor(seed) + 1);
    const n = Math.floor(3 + amount * 8);
    for (let i = 0; i < n; i++) {
      const y = Math.floor(r() * 180), h = 1 + Math.floor(r() * 8 * amount);
      const dx = Math.floor((r() - 0.5) * 40 * amount);
      ctx.drawImage(G.canvas, 0, y, 320, h, dx, y, 320, h);
    }
    ctx.globalAlpha = 0.12 * amount;
    for (let y = 0; y < 180; y += 2) G.rect(ctx, 0, y, 320, 1, '#000');
    ctx.globalAlpha = 1;
  };

  // 在标题画面上闪一下的竖列光点
  G.flashRain = (ctx, t, a) => {
    const saved = Object.assign({}, G.rain);
    G.rain.align = 1; G.rain.flow = 1; G.rain.alpha = a;
    G.drawRain(ctx, t);
    Object.assign(G.rain, saved, { last: G.rain.last, offset: G.rain.offset });
  };

  // 书页上的“一个点”
  G.dotScreen = (ctx, color = P.white, r = 2) => {
    G.rect(ctx, 0, 0, 320, 180, '#000');
    G.disc(ctx, 160, 80, r, color);
  };
})();
