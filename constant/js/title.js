'use strict';
// 内容提示、标题画面、结局图鉴、设置
(function () {
  const G = window.G, P = G.P;

  G.warning = async () => {
    G.bg = (ctx) => {
      G.rect(ctx, 0, 0, 320, 180, '#000');
      G.text(ctx, '内容提示', 160, 52, P.dim, { align: 'center' });
      const ls = G.wrap('本作涉及抑郁、存在主义危机与自杀题材。', 260);
      ls.forEach((l, i) => G.text(ctx, l, 160, 76 + i * G.LH, P.cold, { align: 'center' }));
      if (Math.floor(G.real / 600) % 2 === 0) G.text(ctx, '空格／回车／点击　继续', 160, 136, P.gray2, { align: 'center' });
    };
    G.fade = 1;
    await G.fadeTo(0, 700);
    await G.waitOk();
    G.audio.unlock();
    await G.fadeTo(1, 600);
  };

  // ---------------------------------------------------------------- 缩略插图
  function thumb(ctx, id, x, y, w, h, t, locked) {
    G.rect(ctx, x, y, w, h, '#04060b');
    if (locked) {
      if (id === 'e5') { G.text(ctx, '·', x + w / 2, y + h / 2 - 8, P.gray2, { align: 'center' }); return; }
      // 剪影
      G.disc(ctx, x + w / 2, y + h / 2 - 6, 5, '#141a26');
      G.rect(ctx, x + w / 2 - 7, y + h / 2, 14, 12, '#141a26');
      return;
    }
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (id === 'e1') {
      G.rect(ctx, x, y, w, h, '#020306');
      G.rect(ctx, x + w / 2 + 8, y + h - 12, 6, 3, '#9fc0e8');
      ctx.globalAlpha = 0.15; G.disc(ctx, x + w / 2 + 11, y + h - 11, 8, '#9fc0e8'); ctx.globalAlpha = 1;
    } else if (id === 'e2') {
      G.rect(ctx, x, y, w, h, '#04070a');
      for (let i = 0; i < 6; i++) G.rect(ctx, x + 4 + (i % 2) * 4, y + 4 + i * 5, 14 + ((i * 11) % 22), 2, i === 3 ? '#9fb4c8' : '#2f6b4c');
      if (Math.floor(G.real / 450) % 2 === 0) G.rect(ctx, x + 34, y + 19, 2, 4, '#7cc79b');
    } else if (id === 'e3') {
      G.rect(ctx, x, y, w, h, '#05080f');
      G.stars(ctx, x, y, w, h - 10, 14, 4, t, P.mist);
      G.px(ctx, x + w / 2 + 6, y + 6, P.red);
      G.rect(ctx, x + w / 2 - 6, y + 12, 1, h - 12, '#2b3547'); G.rect(ctx, x + w / 2 - 1, y + 12, 1, h - 12, '#2b3547');
      for (let k = y + 14; k < y + h; k += 5) G.rect(ctx, x + w / 2 - 6, k, 6, 1, '#222b3a');
    } else if (id === 'e4') {
      G.rect(ctx, x, y, w, h, '#0e1626');
      for (let i = 0; i < 3; i++) { G.rect(ctx, x + 2 + i * 18, y + 10 + (i % 2) * 6, 10, h - 10, '#1a2336'); G.rect(ctx, x + 12 + i * 18, y + 6, 8, h - 6, '#b7c0cc'); }
    } else if (id === 'e5') {
      G.rect(ctx, x, y, w, h, '#000');
      G.disc(ctx, x + w / 2, y + h / 2, 1, P.red);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- 标题画面
  G.titleScreen = () => new Promise((resolve, reject) => {
    G.onMenu = null;
    G.audio.quiet();
    const st = { mode: 'main', sel: 0, gsel: 0, enter: G.t, result: null };
    const dotOn = G.allFour();
    const MAIN = ['开始', '结局图鉴', '设置'];
    const menuY = 118;
    const speedName = ['慢', '中', '快'];
    let settings = null;
    const flash = G.titleFlash; G.titleFlash = false;
    const intro = G.titleIntro; G.titleIntro = null;
    if (G.lastUnlocked) { G.toast('解锁：' + G.lastUnlocked); G.lastUnlocked = null; }

    const makeSettings = () => new G.Menu([
      { label: () => '声音：' + (G.save.settings.mute ? '关' : '开'), act: () => G.audio.setMute(!G.save.settings.mute) },
      { label: () => '文字速度：' + speedName[G.save.settings.speed], act: () => { G.save.settings.speed = (G.save.settings.speed + 1) % 3; G.persist(); } },
      { label: '分享游戏链接', act: () => G.share() },
      { label: '返回 Nova Crystal 网站', act: () => { location.href = '../index.html#works'; } },
      { label: '清除存档', act: () => { settings = confirmClear(); } },
      { label: '返回', act: () => { st.mode = 'main'; settings = null; } },
    ], { title: '设置', onBack: () => { st.mode = 'main'; settings = null; }, dim: true });
    const confirmClear = () => new G.Menu([
      { label: '取消', act: () => { settings = makeSettings(); } },
      {
        label: '清除',
        act: () => {
          G.clearSave();
          G.toast('存档已清除。');
          st.mode = 'main'; settings = null;
          st.result = 'reload';
        },
      },
    ], { title: '清除所有结局、已读记录与 RUN 编号？', onBack: () => { settings = makeSettings(); }, w: 250 });

    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#000');
      // 中央的红点
      const dsel = st.mode === 'main' && st.sel === -1;
      G.disc(ctx, 160, 64, dsel ? 2 : 1, P.red);
      if (dotOn && !dsel && Math.floor(G.real / 900) % 3 === 0) G.px(ctx, 160, 60, '#3a1210');
      if (dsel && Math.floor(G.real / 400) % 2 === 0) G.frame(ctx, 154, 58, 13, 13, '#5b7196');
      G.text(ctx, '常数　CONSTANT', 160, 88, P.white, { align: 'center' });
      G.text(ctx, '02:34', 314, 166, P.gray2, { align: 'right' });
      G.text(ctx, 'RUN ' + G.fmtRun(G.save.run), 6, 166, P.gray2);
      if (intro) {
        const n = Math.floor((G.t - st.enter) / 90);
        const shown = [...intro].slice(0, Math.max(0, n)).join('');
        G.text(ctx, shown, 160, 20, P.cold, { align: 'center' });
      }
      if (st.mode === 'main' || st.mode === 'settings') {
        MAIN.forEach((m, i) => {
          const on = st.sel === i && st.mode === 'main';
          G.text(ctx, (on ? '▸ ' : '') + m + (on ? ' ◂' : ''), 160, menuY + i * 14, on ? P.white : P.gray3, { align: 'center' });
        });
      }
      if (st.mode === 'gallery') drawGallery(ctx, t);
      if (st.mode === 'settings' && settings) settings.draw(ctx);
      if (flash && G.t - st.enter < 1600) G.flashRain(ctx, t, Math.max(0, 1 - (G.t - st.enter) / 1600));
    };

    function drawGallery(ctx, t) {
      G.rect(ctx, 0, 0, 320, 180, '#000');
      G.text(ctx, '结局图鉴', 160, 6, P.dim, { align: 'center' });
      G.ENDINGS.forEach((e, i) => {
        const x = 12 + i * 60, y = 26;
        const un = !!G.save.endings[e.id];
        const on = st.gsel === i;
        G.rect(ctx, x, y, 56, 64, on ? '#142038' : '#0a0f1a');
        G.frame(ctx, x, y, 56, 64, on ? '#5b7196' : '#1c2d4d');
        thumb(ctx, e.id, x + 3, y + 3, 50, 38, t, !un);
        const short = un ? e.name.split('　')[1] : e.id === 'e5' ? '·' : '？？？';
        G.text(ctx, short, x + 28, y + 45, un ? P.cold : P.gray2, { align: 'center' });
      });
      const e = G.ENDINGS[st.gsel];
      const rec = G.save.endings[e.id];
      G.rect(ctx, 12, 98, 296, 64, '#060911');
      G.frame(ctx, 12, 98, 296, 64, '#1c2d4d');
      if (rec) {
        G.text(ctx, e.name, 20, 102, P.white);
        G.wrap(e.quote, 280).slice(0, 2).forEach((l, i) => G.text(ctx, l, 20, 118 + i * G.LH, P.cold));
        G.text(ctx, 'RUN ' + G.fmtRun(rec.run), 302, 147, P.gray2, { align: 'right' });
      } else {
        G.text(ctx, e.id === 'e5' ? '·' : '？？？', 20, 102, P.gray3);
        G.text(ctx, e.id === 'e5' ? '四个结局都解锁以后，才能看见它。' : '尚未抵达。', 20, 118, P.gray2);
      }
      const n = Object.keys(G.save.endings).length;
      G.text(ctx, n + ' / 5　　已开局 ' + G.save.runs + ' 次', 12, 166, P.gray2);
      G.text(ctx, '返回', 308, 166, P.dim, { align: 'right' });
    }

    G.sceneUpdate = () => {
      if (st.result) return;
      if (st.mode === 'main') {
        const min = dotOn ? -1 : 0;
        if (G.eat('up')) { st.sel = Math.max(min, st.sel - 1); G.audio.select(); }
        if (G.eat('down')) { st.sel = Math.min(2, st.sel + 1); G.audio.select(); }
        let pick = null;
        if (G.mouse && G.mouse !== st.lastM) {
          st.lastM = G.mouse;
          const m = G.mouse;
          if (dotOn && Math.abs(m.x - 160) < 9 && Math.abs(m.y - 64) < 9) st.sel = -1;
          const i = Math.floor((m.y - menuY + 2) / 14);
          if (Math.abs(m.x - 160) < 50 && i >= 0 && i < 3) st.sel = i;
        }
        const c = G.eatClick();
        if (c) {
          if (dotOn && Math.abs(c.x - 160) < 9 && Math.abs(c.y - 64) < 9) pick = -1;
          const i = Math.floor((c.y - menuY + 2) / 14);
          if (Math.abs(c.x - 160) < 50 && i >= 0 && i < 3) pick = i;
        }
        if (G.eat('ok')) pick = st.sel;
        if (pick === null) return;
        G.audio.confirm();
        st.sel = pick;
        if (pick === -1) st.result = 'e5';
        else if (pick === 0) st.result = 'start';
        else if (pick === 1) { st.mode = 'gallery'; }
        else { st.mode = 'settings'; settings = makeSettings(); }
      } else if (st.mode === 'gallery') {
        if (G.eat('left')) { st.gsel = (st.gsel + 4) % 5; G.audio.select(); }
        if (G.eat('right')) { st.gsel = (st.gsel + 1) % 5; G.audio.select(); }
        const c = G.eatClick();
        if (c) {
          const i = Math.floor((c.x - 12) / 60);
          if (c.y >= 26 && c.y < 90 && i >= 0 && i < 5) { st.gsel = i; G.audio.select(); }
          else if (c.y > 160 && c.x > 270) { st.mode = 'main'; G.audio.cancel(); }
        }
        if (G.eat('ok') || G.eat('menu')) { st.mode = 'main'; G.audio.cancel(); }
      } else if (st.mode === 'settings' && settings) {
        settings.update();
      }
    };

    G.fade = Math.max(G.fade, 0);
    G.fadeTo(0, 900).then(() => G.until(() => !!st.result)).then(async () => {
      if (st.result === 'reload') { G.sceneUpdate = null; resolve('reload'); return; }
      await G.fadeTo(1, 700);
      G.sceneUpdate = null;
      resolve(st.result);
    }, reject);
  });
})();
