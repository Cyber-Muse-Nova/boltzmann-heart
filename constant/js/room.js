'use strict';
// 可探索房间：角色移动、碰撞、调查、停留计时；以及 Constant 的卧室。
(function () {
  const G = window.G, P = G.P;

  // 隐藏倾向值（只存在于本局内存中）
  G.tend = { code: 0, mars: 0, time: 0 };
  G.add = (k, n = 1) => { if (k && G.tend[k] != null) G.tend[k] += n; };

  /**
   * room: {
   *   draw(ctx, t, room), bounds:{x0,x1,y0,y1},
   *   objs: [{id, name, x, y, w, h, solid?, hidden?, tag?, dwell?, act: async (o) => {}}],
   *   start: {x, y, dir}, done: false, update?(dt)
   * }
   */
  G.explore = async (room) => {
    const p = { x: room.start.x, y: room.start.y, dir: room.start.dir || 'down', anim: 0, moving: false };
    room.player = p;
    G.curRoom = room;
    room.cam = 0;
    let busy = false, err = null, near = null;
    const SPEED = 52;
    const b = room.bounds;

    const blocked = (x, y) => {
      if (x < b.x0 || x > b.x1 || y < b.y0 || y > b.y1) return true;
      for (const o of room.objs) {
        if (!o.solid || o.hidden) continue;
        if (x + 5 > o.x && x - 5 < o.x + o.w && y > o.y && y - 3 < o.y + o.h) return true;
      }
      return false;
    };

    G.bg = (ctx, t) => {
      room.draw(ctx, t, room);
      if (!room.hidePlayer) G.drawActor(ctx, room.sprite || 'constant', p.dir, p.moving ? G.WALK[Math.floor(p.anim / 140) % 4] : 0, p.x - room.cam, p.y);
      if (room.drawFront) room.drawFront(ctx, t, room);
      if (near && !busy && G.ui.length === 0) {
        const bob = Math.floor(G.real / 300) % 2;
        const mx = (near.mx != null ? near.mx : near.x + near.w / 2) - room.cam;
        const my = near.my != null ? near.my : near.y - 4;
        G.text(ctx, '▾', mx, my - 10 + bob, P.white, { align: 'center' });
        const label = '空格　' + near.name;
        const lw = G.measure(label) + 10;
        ctx.globalAlpha = 0.85;
        G.rect(ctx, 160 - lw / 2, 3, lw, 14, '#060911');
        ctx.globalAlpha = 1;
        G.text(ctx, label, 160, 4, P.cold, { align: 'center' });
      }
      if (room.hint && G.ui.length === 0 && !near) G.text(ctx, room.hint, 160, 4, P.gray3, { align: 'center' });
    };

    G.sceneUpdate = room.updateFn = (dt, input) => {
      room.busy = busy;
      if (room.update) room.update(dt);
      if (busy) return;
      let dx = 0, dy = 0;
      if (input) {
        if (G.held('left')) dx -= 1;
        if (G.held('right')) dx += 1;
        if (G.held('up')) dy -= 1;
        if (G.held('down')) dy += 1;
      }
      p.moving = dx !== 0 || dy !== 0;
      if (p.moving) {
        if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
        p.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
        const nx = p.x + dx * SPEED * dt / 1000, ny = p.y + dy * SPEED * dt / 1000;
        if (!blocked(nx, p.y)) p.x = nx;
        if (!blocked(p.x, ny)) p.y = ny;
        p.anim += dt;
      }
      if (room.world) room.cam = Math.max(0, Math.min(room.world - 320, p.x - 160));
      // 最近的可调查物
      near = null;
      let best = 1e9;
      for (const o of room.objs) {
        if (o.hidden || !o.act) continue;
        const ix = Math.max(o.x - 4, Math.min(p.x, o.x + o.w + 4));
        const iy = Math.max(o.y - 2, Math.min(p.y, o.y + o.h + 14));
        const d = Math.hypot(ix - p.x, iy - p.y);
        if (d < 4 && d < best) { best = d; near = o; }
      }
      // 停留计时：在物品前站得久，倾向 +1（每件一次）
      if (near && near.tag && !near.dwelled) {
        near.dwellT = (near.dwellT || 0) + dt;
        if (near.dwellT > 4500) { near.dwelled = true; G.add(near.tag, 1); }
      }
      if (input && near && (G.eat('ok') || G.eatClick())) {
        busy = room.busy = true;
        const o = near;
        o.count = (o.count || 0) + 1;
        Promise.resolve(o.act(o)).then(() => { busy = room.busy = false; G.clearInput(); }, (e) => { err = e; });
      }
    };
    G.clearInput();
    await G.until(() => { if (err) throw err; return room.done && !busy; });
    G.sceneUpdate = null;
    G.curRoom = null;
  };

  // ------------------------------------------------------------------ 卧室
  // state: {dark 0..1, gone: Set(物件), poster: bool, screenOn: bool, phoneGlow: 0..1, dawn: 0..1, night: 1..}
  G.drawBedroom = (ctx, t, st = {}) => {
    const gone = st.gone || new Set();
    // 墙
    G.rect(ctx, 0, 0, 320, 96, '#0d1424');
    for (let x = 0; x < 320; x += 24) G.rect(ctx, x, 0, 1, 96, '#0f172a');
    G.rect(ctx, 0, 92, 320, 4, '#0a101c');
    // 地板
    G.rect(ctx, 0, 96, 320, 84, '#101725');
    for (let y = 100; y < 180; y += 10) G.rect(ctx, 0, y, 320, 1, '#0d1320');
    // 窗
    const wx = 136, wy = 14, ww = 64, wh = 58;
    const dawn = st.dawn || 0;
    G.rect(ctx, wx - 3, wy - 3, ww + 6, wh + 6, '#1b263b');
    const sky1 = dawn > 0 ? lerpC('#070b16', '#6d86a8', dawn) : '#070b16';
    const sky2 = dawn > 0 ? lerpC('#0b1222', '#b8c8dc', dawn) : '#0b1222';
    for (let j = 0; j < wh; j++) G.rect(ctx, wx, wy + j, ww, 1, lerpC(sky1, sky2, j / wh));
    if (dawn < 0.6) G.stars(ctx, wx, wy, ww, 20, 6, 3, t, P.mist);
    // 对面的楼和零星的灯
    G.rect(ctx, wx, wy + 24, 26, wh - 24, dawn ? lerpC('#0a0f1b', '#3b4a60', dawn) : '#0a0f1b');
    G.rect(ctx, wx + 30, wy + 16, 34, wh - 16, dawn ? lerpC('#0c1220', '#46566d', dawn) : '#0c1220');
    const lr = G.rng(7);
    for (let i = 0; i < 14; i++) {
      const lx = wx + 33 + Math.floor(lr() * 28), ly = wy + 20 + Math.floor(lr() * 34);
      if (lr() > 0.72 && dawn < 0.5) G.rect(ctx, lx, ly, 2, 2, '#6f84a3');
    }
    if (st.tvLight && dawn < 0.5) { // 没有拉严的窗帘，漏出一条电视的蓝光
      const f = 0.6 + 0.4 * Math.sin(t / 170) * Math.sin(t / 53);
      G.rect(ctx, wx + 8, wy + 34, 1, 8, f > 0.5 ? '#5f8fd0' : '#3e6aa6');
    }
    G.rect(ctx, wx + ww / 2 - 1, wy, 2, wh, '#1b263b');
    G.rect(ctx, wx, wy + wh / 2, ww, 2, '#1b263b');
    // 月光
    ctx.globalAlpha = 0.07 + dawn * 0.12;
    ctx.fillStyle = '#9fb8dc';
    ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(wx + ww + 30, 170); ctx.lineTo(wx - 20, 170); ctx.fill();
    ctx.globalAlpha = 1;

    // 门
    G.rect(ctx, 96, 30, 26, 64, '#141c2d');
    G.frame(ctx, 95, 29, 28, 66, '#1c273c');
    G.px(ctx, 118, 62, P.gray2);

    // 海报（火箭轮廓）
    if (st.poster !== false) {
      G.rect(ctx, 30, 14, 26, 38, '#162034');
      G.frame(ctx, 30, 14, 26, 38, '#223049');
      const rx = 43;
      G.rect(ctx, rx - 2, 22, 4, 18, '#3a4c69');
      G.rect(ctx, rx - 1, 19, 2, 3, '#3a4c69');
      G.px(ctx, rx, 18, '#3a4c69');
      G.rect(ctx, rx - 4, 36, 2, 5, '#33445f');
      G.rect(ctx, rx + 2, 36, 2, 5, '#33445f');
      G.dither(ctx, rx - 3, 42, 6, 6, '#26344d');
    } else {
      G.frame(ctx, 30, 14, 26, 38, '#111a2c'); // 墙上留下的印子
    }

    // 床
    G.rect(ctx, 6, 64, 80, 8, '#1a2335'); // 床头
    G.rect(ctx, 6, 72, 84, 34, '#222c40');
    G.rect(ctx, 8, 74, 22, 10, '#39455c'); // 枕头
    G.rect(ctx, 30, 76, 58, 26, '#2c3850'); // 被子
    G.rect(ctx, 30, 76, 58, 2, '#34425d');
    G.rect(ctx, 6, 106, 84, 3, '#0b1019');
    if (st.controller) { G.rect(ctx, 62, 84, 10, 5, '#10141c'); G.px(ctx, 64, 86, P.gray2); G.px(ctx, 69, 86, P.gray2); }

    // 地毯、植物、台灯、椅子、衣服堆、音响——第四章一件件消失
    if (!gone.has('rug')) { G.rect(ctx, 118, 128, 84, 30, '#141d2e'); G.dither(ctx, 120, 130, 80, 26, '#18233a'); }
    if (!gone.has('plant')) {
      G.rect(ctx, 204, 82, 10, 12, '#1d2331');
      G.rect(ctx, 207, 70, 2, 12, '#23322e');
      G.rect(ctx, 201, 68, 6, 4, '#253a33'); G.rect(ctx, 209, 64, 6, 5, '#253a33'); G.rect(ctx, 204, 60, 5, 5, '#2b4239');
    }
    if (!gone.has('clothes')) { G.rect(ctx, 96, 104, 20, 6, '#2c313b'); G.rect(ctx, 100, 101, 12, 4, '#353b47'); }

    // 书桌 + 电脑 + 手机
    G.rect(ctx, 220, 70, 64, 4, '#1f2a3d');
    G.rect(ctx, 222, 74, 3, 30, '#171f2e');
    G.rect(ctx, 279, 74, 3, 30, '#171f2e');
    G.rect(ctx, 250, 74, 29, 12, '#1a2334'); // 抽屉
    G.px(ctx, 264, 80, P.gray2);
    // 显示器
    G.rect(ctx, 228, 44, 36, 24, '#0b0f17');
    const on = st.screenOn;
    G.rect(ctx, 230, 46, 32, 20, on ? '#2c4a73' : '#0f1520');
    if (on) {
      G.rect(ctx, 232, 48, 20, 2, '#6f93c2');
      G.rect(ctx, 232, 52, 26, 1, '#557aa8');
      G.rect(ctx, 232, 55, 22, 1, '#557aa8');
      G.rect(ctx, 232, 58, 24, 1, '#557aa8');
      ctx.globalAlpha = 0.08; G.rect(ctx, 200, 40, 90, 70, '#8fb4dc'); ctx.globalAlpha = 1;
    }
    G.rect(ctx, 244, 68, 4, 2, '#0b0f17');
    // 待机灯：全场景唯一的暖色
    if (!st.noRed) G.redDot(ctx, 262, 67, t, !on);
    // 手机
    G.rect(ctx, 268, 66, 8, 4, '#0a0d13');
    if (st.phoneGlow) {
      ctx.globalAlpha = st.phoneGlow;
      G.rect(ctx, 269, 66, 6, 3, '#9fc0e8');
      ctx.globalAlpha = st.phoneGlow * 0.15;
      G.disc(ctx, 272, 68, 12, '#9fc0e8');
      ctx.globalAlpha = 1;
    }
    if (!gone.has('lamp')) { G.rect(ctx, 272, 56, 2, 10, '#262f40'); G.rect(ctx, 268, 52, 10, 5, '#2f3a4f'); }
    if (!gone.has('chair')) { G.rect(ctx, 236, 84, 18, 4, '#1b2436'); G.rect(ctx, 238, 88, 2, 14, '#161d2b'); G.rect(ctx, 250, 88, 2, 14, '#161d2b'); G.rect(ctx, 236, 72, 3, 12, '#1b2436'); }
    // 音响
    if (!gone.has('speaker')) { G.rect(ctx, 208, 96, 8, 12, '#151b27'); G.disc(ctx, 212, 102, 2, '#0c1019'); }

    // 书架
    G.rect(ctx, 290, 22, 26, 76, '#172033');
    for (let s = 0; s < 4; s++) {
      const sy = 30 + s * 17;
      G.rect(ctx, 290, sy + 12, 26, 2, '#0f1625');
      if (gone.has('books') && s > 0) continue;
      const br = G.rng(s + 11);
      let bx = 292;
      while (bx < 312) {
        const bw = 2 + Math.floor(br() * 3);
        const bh = 7 + Math.floor(br() * 5);
        G.rect(ctx, bx, sy + 12 - bh, bw, bh, ['#2a3650', '#233049', '#34405b', '#1f2a40'][Math.floor(br() * 4)]);
        bx += bw + 1;
      }
    }
    if (st.bookOut) G.rect(ctx, 300, 29, 4, 1, '#0f1625');

    // 整体变暗
    if (st.dark) { ctx.globalAlpha = st.dark; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1; }
  };

  function hex(c) { return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); }
  function lerpC(a, b, p) {
    const A = hex(a), B = hex(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * p).toString(16).padStart(2, '0')).join('');
  }
  G.lerpC = lerpC;

  // 卧室的标准可调查物坐标
  G.BED = {
    poster: { x: 28, y: 88, w: 30, h: 6, mx: 43, my: 14 },
    bed: { x: 6, y: 72, w: 84, h: 34, solid: true, mx: 48, my: 70 },
    door: { x: 96, y: 88, w: 26, h: 6, mx: 109, my: 30 },
    window: { x: 136, y: 88, w: 64, h: 6, mx: 168, my: 12 },
    computer: { x: 224, y: 74, w: 36, h: 30, solid: true, mx: 246, my: 44 },
    phone: { x: 264, y: 74, w: 16, h: 30, mx: 272, my: 64 },
    shelf: { x: 290, y: 86, w: 26, h: 14, solid: true, mx: 303, my: 22 },
  };
  G.bedObj = (key, extra) => Object.assign({}, G.BED[key], { id: key }, extra);
  G.BED_BOUNDS = { x0: 8, x1: 312, y0: 100, y1: 172 };
})();
