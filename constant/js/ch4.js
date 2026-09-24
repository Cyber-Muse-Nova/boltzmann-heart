'use strict';
// 第四章　帧率：六个“试图麻痹自己”的迷你场景，自选顺序。每回来一次，房间更暗、更空。
(function () {
  const G = window.G, P = G.P;
  const GONE_ORDER = ['rug', 'plant', 'clothes', 'lamp', 'chair', 'books'];

  G.ch4 = async () => {
    await G.chapterCard('四', '帧率');
    const st = { gone: new Set(), dark: 0, screenOn: false, controller: true };
    const done = {};
    const draw = (ctx, t) => G.drawBedroom(ctx, t, st);
    G.bg = draw;
    G.audio.hum(0.45);
    await G.fadeTo(0, 900);
    await G.say('没有人再回他的问卷了。群里的话题换成了新出的游戏、谁的婚礼、一只会后空翻的狗。小满也很久没有说话。');
    await G.say('他开始试着让自己别想。');

    const room = { bounds: G.BED_BOUNDS, start: { x: 150, y: 138, dir: 'down' }, draw, done: false, objs: [] };
    const run = (id, fn) => async () => {
      if (done[id]) { await G.hint('（这个已经试过了。）'); return; }
      await G.fadeTo(1, 500);
      const keep = G.bg, keepU = G.sceneUpdate;
      await fn();
      G.sceneUpdate = keepU;
      done[id] = true;
      const n = Object.keys(done).length;
      st.gone.add(GONE_ORDER[n - 1]);
      st.dark = n * 0.075;
      G.audio.hum(0.45 - n * 0.05);
      G.bg = keep;
      room.player.x = 150; room.player.y = 138; room.player.dir = 'down';
      await G.fadeTo(0, 800);
      if (n >= 6) room.done = true;
    };
    room.objs = [
      G.bedObj('bed', { name: '床上的手柄　开放世界游戏', act: run('world', openWorld), mx: 66, my: 80 }),
      G.bedObj('phone', { name: '手机　短视频', act: run('video', shortVideo) }),
      G.bedObj('computer', { name: '电脑　个人网站', tag: 'code', act: run('site', website) }),
      G.bedObj('window', { name: '阳台　望远镜', tag: 'mars', act: run('moon', telescope) }),
      G.bedObj('door', {
        name: '出门',
        act: async () => {
          const opts = [{ label: '和朋友去吃火锅', disabled: !!done.hotpot }, { label: '去电影院', disabled: !!done.cinema }, { label: '算了' }];
          if (done.hotpot && done.cinema) { await G.hint('（这个已经试过了。）'); return; }
          const k = await G.choose(opts);
          if (k === 0) await run('hotpot', hotpot)();
          if (k === 1) await run('cinema', cinema)();
        },
      }),
    ];
    const baseDraw = room.draw;
    room.draw = (ctx, t) => {
      baseDraw(ctx, t);
      const n = Object.keys(done).length;
      G.text(ctx, '·'.repeat(n) + '∘'.repeat(6 - n), 314, 166, P.gray2, { align: 'right' });
    };
    await G.explore(room);

    // 六件事都做完以后
    await G.say('他一睡十四个小时。醒来的第一个念头是：开机了。');
    await G.say('吃喝玩乐都变得很无聊。');
    await G.say('他又买了好几套科幻小说，读得泪流满面。他想，为什么小说主角不能是自己。为什么这个世界的主角不能是自己。');
    await G.say('有一部小说里写到：超级计算机算了七百五十万年，得出生命、宇宙以及一切的终极答案是 42，然后大家才发现，没人知道问题到底是什么。');
    await G.say('三个月后他去了纹身店，把 42 纹在心脏上面。觉得不够，又在手腕上加了一个 𝕏。');
    st.dark = 0.55;
    await G.say('后来，他开始讨厌人。');
    await G.say('起初只是评论区。同一个段子被一百个人复制粘贴，同一场骂战每天换一个帖子重演，连错别字都一样。');
    await G.say('他看着那些情绪饱满的争吵，只觉得像在看一群 NPC 按脚本念台词，谁也不知道自己在念。');
    await G.say('后来是身边的人。父母的抱怨，亲戚的催促，朋友的安慰，一句接一句，和上个月一样，和去年一样。他在心里给每一句话标上行号。');
    await G.say('他越来越少说话。他在网上写很长的帖子，讲模拟论证，讲哥德尔，讲热寂，底下只有两个赞，其中一个是机器人账号。');
    await G.say('他点开新闻，看见同样的战争换个地名再打一遍，同样的错误换一代人再犯一次。他想，如果造物主真的会因为不满意而重启一个朝代，那这一轮大概也快了。');
    st.dark = 0.62;
    await G.say('清醒的代价是彻底的孤独。他觉得自己是这个世界上唯一醒着的人。');
    await G.say('房间里的音响播放着《Vagrant》，他非常喜爱的英文歌。');
    await G.say('他没有注意到，「所有人都是 NPC，只有我醒着」——这恰好也是 NPC 最常说的一句台词。');

    // 让玩家有意地推一推倾向
    const a = await G.choose(['打开编辑器，再写几行代码', '刷一整晚火箭起飞的视频', '把那本旧书再翻一遍'], { prompt: '今晚要做什么' });
    G.add(['code', 'mars', 'time'][a], 2);
    const b = await G.choose(['数一数光点排成了几列', '看一眼天边那颗发红的星', '想一想今天是不是昨天'], { prompt: '闭上眼睛之前' });
    G.add(['code', 'mars', 'time'][b], 2);
    await G.fadeTo(1, 1400);
  };

  // ---------------------------------------------------------------- 开放世界
  async function openWorld() {
    const s = { x: 40, dir: 'right', moving: false, anim: 0, cam: 0, lookT: 0, turned: 0 };
    const trees = [];
    for (let i = 0; i < 26; i++) trees.push({ x: 90 + i * 46 + ((i * 17) % 20), h: 18 + ((i * 13) % 14) });
    const WORLD = 1300;
    G.bg = (ctx, t) => {
      const cam = s.cam;
      for (let j = 0; j < 110; j++) G.rect(ctx, 0, j, 320, 1, G.lerpC('#0b1426', '#1d2f4e', j / 110));
      G.stars(ctx, 0, 0, 320, 60, 30, 5, t, P.mist);
      // 远山：转头的一瞬间才变清晰
      const sharp = t - s.turned > 450;
      for (let k = 0; k < 4; k++) {
        const mx = ((k * 160 - cam * 0.2) % 640 + 640) % 640 - 160;
        ctx.fillStyle = '#1a2640';
        ctx.beginPath(); ctx.moveTo(mx, 110); ctx.lineTo(mx + 80, 60 + k * 5); ctx.lineTo(mx + 170, 110); ctx.fill();
        if (sharp) for (let q = 0; q < 12; q++) G.line(ctx, mx + 80, 62 + k * 5, mx + 40 + q * 8, 108, q % 2 ? '#1f2d4a' : '#223252');
      }
      G.redDot(ctx, ((200 - cam * 0.2) % 640 + 640) % 640 - 80, 64, t); // 远处信号塔的灯
      G.rect(ctx, 0, 110, 320, 70, '#101a28');
      G.dither(ctx, 0, 112, 320, 4, '#15223a');
      for (const tr of trees) {
        const sx = tr.x - cam;
        if (sx < -30 || sx > 350) continue;
        const d = Math.abs(tr.x - (s.x));
        G.rect(ctx, sx - 1, 132 - tr.h, 3, tr.h, '#1d2533');
        if (d < 64) { // 走近了才长出叶子
          G.disc(ctx, sx, 132 - tr.h - 6, 10, '#1e3a36');
          G.disc(ctx, sx - 4, 132 - tr.h - 3, 6, '#23443f');
          G.dither(ctx, sx - 8, 132 - tr.h - 14, 16, 12, '#2c5550');
        } else {
          G.line(ctx, sx, 132 - tr.h, sx - 5, 126 - tr.h, '#1d2533');
          G.line(ctx, sx, 132 - tr.h + 4, sx + 5, 128 - tr.h, '#1d2533');
        }
      }
      G.drawActor(ctx, 'constant', s.dir, s.moving ? G.WALK[Math.floor(s.anim / 140) % 4] : 0, s.x - cam, 140);
      G.text(ctx, '← → 走动　' + Math.floor((s.x / WORLD) * 100) + '%', 6, 166, P.gray2);
    };
    G.sceneUpdate = (dt, input) => {
      s.moving = false;
      if (!input) return;
      let dx = 0;
      if (G.held('left')) dx -= 1;
      if (G.held('right')) dx += 1;
      if (dx) {
        const nd = dx < 0 ? 'left' : 'right';
        if (nd !== s.dir) s.turned = G.t;
        s.dir = nd; s.moving = true; s.anim += dt;
        s.x = Math.max(20, Math.min(WORLD, s.x + dx * 60 * dt / 1000));
      }
      s.cam = Math.max(0, Math.min(WORLD - 280, s.x - 140));
    };
    await G.fadeTo(0, 600);
    await G.say('他买了最新的开放世界游戏，打算在里面待一整个周末。');
    G.clearInput();
    await G.until(() => s.x > 420);
    await G.say('可他总是注意到，远处的树在他走近时才长出叶子，山的纹理在他转头的一瞬间才变清晰。');
    await G.say('他知道这叫多细节层次渲染，为了节省算力：你看不到的地方，就不必画得那么真。');
    await G.until(() => s.x > 760);
    G.sceneUpdate = null;
    await G.say('他放下手柄，想到了双缝实验，想到「没有被观测的东西没有确定的状态」。');
    await G.say('宇宙是不是也只在有人看的时候，才把自己画出来？');
    await G.fadeTo(1, 700);
  }

  // ---------------------------------------------------------------- 短视频
  async function shortVideo() {
    const KINDS = ['rocket', 'code', 'rock', 'dog', 'food', 'wave'];
    const TAG = { rocket: 'mars', code: 'code', rock: 'time' };
    const s = { i: 0, kind: 'dog', since: 0, off: 0, clock: 23 * 60 + 12, liked: {}, dwell: {} };
    let last = null;
    const nextKind = () => {
      // 推给他的东西越来越准：更常推他停留最久的那类
      let best = null, bv = 0;
      for (const k in s.dwell) if (s.dwell[k] > bv) { bv = s.dwell[k]; best = k; }
      if (best && s.i > 3 && Math.random() < 0.65) return best;
      let k;
      do { k = KINDS[Math.floor(Math.random() * KINDS.length)]; } while (k === last);
      return k;
    };
    const px = 110, pw = 100;
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#03050a');
      G.rect(ctx, px - 4, 2, pw + 8, 176, '#0b0f17');
      const y0 = 12 - s.off;
      const cy = y0, ch = 156;
      ctx.save(); ctx.beginPath(); ctx.rect(px, 12, pw, 156); ctx.clip();
      drawClip(ctx, t, s.kind, px, cy, pw, ch, t - s.since);
      if (s.off > 0) drawClip(ctx, t, s.pending, px, cy + ch, pw, ch, 0);
      ctx.restore();
      const hh = Math.floor(s.clock / 60) % 24, mm = s.clock % 60;
      G.text(ctx, String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), px + pw / 2, 1, P.dim, { align: 'center' });
      G.text(ctx, '↑ 下一条', 238, 150, P.gray2);
      G.text(ctx, '第 ' + (s.i + 1) + ' 条', 238, 136, P.gray2);
      G.redDot(ctx, px + pw - 3, 5, t); // 录制指示
    };
    const swipe = async () => {
      const k = s.kind;
      const stay = G.t - s.since;
      s.dwell[k] = (s.dwell[k] || 0) + stay;
      if (TAG[k] && stay > 3000 && !s.liked[k]) { s.liked[k] = true; G.add(TAG[k]); }
      s.pending = nextKind();
      await G.tween(220, (p) => { s.off = p * 156; });
      last = s.kind = s.pending; s.off = 0; s.since = G.t; s.i++;
      s.clock += 6 + Math.floor(Math.random() * 9);
      G.audio.select();
    };
    s.kind = 'dog'; s.since = G.t;
    await G.fadeTo(0, 500);
    await G.say('他刷短视频，一条接一条，手指一滑就是下一个十五秒。');
    G.clearInput();
    while (s.i < 12) {
      await G.until(() => G.eat('up') || G.eat('ok') || !!G.eatClick() || G.held('skip'));
      await swipe();
      if (s.i === 7) await G.say('刷到凌晨，他发现推给他的东西越来越准，准到让他害怕：有什么东西，比他更早知道他下一秒想看什么。');
    }
    await G.fadeTo(1, 600);
  }

  function drawClip(ctx, t, kind, x, y, w, h, age) {
    G.rect(ctx, x, y, w, h, '#070b14');
    const cx = x + w / 2, cy = y + h / 2;
    if (kind === 'rocket') {
      const lift = Math.min(60, (age / 60) % 90);
      G.rect(ctx, cx - 3, cy + 10 - lift, 6, 26, '#8795aa');
      G.rect(ctx, cx - 2, cy + 6 - lift, 4, 4, '#8795aa');
      G.dither(ctx, cx - 6, cy + 36 - lift, 12, 10 + lift / 3, P.cold);
      G.rect(ctx, x, cy + 40, w, h / 2 - 40, '#0d1320');
    } else if (kind === 'code') {
      for (let i = 0; i < 18; i++) G.rect(ctx, x + 6 + (i % 3) * 4, y + 8 + i * 8 - ((age / 30) % 8), 20 + ((i * 29 + Math.floor(age / 500)) % 60), 2, i % 4 ? '#2f6b4c' : '#7cc79b');
    } else if (kind === 'rock') {
      for (let i = 0; i < 12; i++) G.rect(ctx, x, y + i * 13, w, 13, i % 2 ? '#22262d' : '#1b1e24');
      G.rect(ctx, cx - 1, cy - 40 + ((age / 40) % 60), 2, 30, '#0a0f18');
    } else if (kind === 'dog') {
      const a = (age / 400) % (Math.PI * 2);
      G.rect(ctx, x, cy + 30, w, 2, '#26344d');
      const jy = Math.abs(Math.sin(a)) * 30;
      ctx.save(); ctx.translate(cx, cy + 20 - jy); ctx.rotate(-a * 1.0);
      G.rect(ctx, -9, -4, 18, 8, '#6d737d'); G.rect(ctx, 7, -8, 6, 6, '#6d737d');
      ctx.restore();
    } else if (kind === 'food') {
      G.disc(ctx, cx, cy, 30, '#26344d');
      G.disc(ctx, cx, cy, 22, '#3b5379');
      for (let i = 0; i < 6; i++) G.disc(ctx, cx - 12 + ((i * 11) % 24), cy - 10 + ((i * 7) % 20), 3, '#8795aa');
    } else {
      for (let i = 0; i < w; i += 2) G.rect(ctx, x + i, cy + Math.sin(i / 8 + age / 300) * 14, 2, 2, '#5b7196');
    }
  }

  // ---------------------------------------------------------------- 个人网站
  async function website() {
    const CODE = [
      '<!doctype html>',
      '<title>CONSTANT</title>',
      '<style>',
      ' body{background:#05070c;',
      '  color:#e6eef8}',
      ' .dot{width:1px;height:1px}',
      '</style>',
      '<h1>CONSTANT</h1>',
      '<p>c, G, h</p>',
      '<canvas id=sky></canvas>',
      '<script>',
      ' draw(stars)',
      '</script>',
    ];
    const full = CODE.join('\n');
    const s = { n: 0, shown: 0 };
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#03050a');
      // 编辑器
      G.rect(ctx, 4, 4, 150, 172, '#05090a');
      G.frame(ctx, 4, 4, 150, 172, '#1f3a2e');
      G.text(ctx, 'index.html', 8, 5, '#4f7a64');
      const typed = full.slice(0, s.n).split('\n');
      typed.forEach((l, i) => {
        G.text(ctx, String(i + 1).padStart(2, ' '), 8, 20 + i * 12, '#2f4f3f');
        G.text(ctx, l, 24, 20 + i * 12, '#7cc79b');
      });
      if (Math.floor(G.real / 400) % 2 === 0) {
        const li = typed.length - 1;
        G.rect(ctx, 24 + G.measure(typed[li] || ''), 21 + li * 12, 5, 10, '#7cc79b');
      }
      // 预览：代码一行行变成页面
      G.rect(ctx, 160, 4, 156, 172, '#070b14');
      G.frame(ctx, 160, 4, 156, 172, '#26344d');
      const p = s.n / full.length;
      if (p > 0.25) G.rect(ctx, 161, 5, 154, 170, '#05070c');
      if (p > 0.55) G.text(ctx, 'CONSTANT', 238, 30, P.white, { align: 'center' });
      if (p > 0.65) G.text(ctx, 'c, G, h', 238, 48, P.dim, { align: 'center' });
      if (p > 0.85) G.stars(ctx, 164, 66, 148, 104, 70, 21, t, P.mist);
      if (p >= 1) G.px(ctx, 238, 118, P.red);
    };
    await G.fadeTo(0, 500);
    await G.hint('（随便按键，一行行写下去。）');
    G.clearInput();
    await G.until(() => {
      if (G.anyKey || G.click || G.held('skip')) { s.n = Math.min(full.length, s.n + 4); G.audio.type(true); G.click = null; }
      return s.n >= full.length;
    });
    await G.say('他尝试搭建自己的个人网站，却越搭越崩溃。');
    await G.say('他亲眼看着一行行跳动的代码变成绚丽的页面，接着想到，构成他的生物 DNA，又何尝不是一串串代码。');
    G.add('code');
    if ((await G.choose(['继续写下去', '关掉编辑器'])) === 0) G.add('code');
    await G.fadeTo(1, 600);
  }

  // ---------------------------------------------------------------- 火锅
  async function hotpot() {
    const s = { laughs: 0 };
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#0b111d');
      G.rect(ctx, 0, 0, 320, 70, '#0e1626');
      // 朋友们（没有脸的剪影）
      for (let i = 0; i < 4; i++) {
        const x = 70 + i * 60, y = 78;
        G.disc(ctx, x, y - 22, 9, '#1e2635');
        G.rect(ctx, x - 13, y - 12, 26, 30, '#1b2230');
        const open = Math.sin(t / 130 + i * 1.7) > 0.2;
        G.rect(ctx, x - 3, y - 19, 6, open ? 3 : 1, '#0a0e16');
      }
      // 桌子与锅
      G.rect(ctx, 20, 96, 280, 70, '#161f30');
      G.rect(ctx, 20, 96, 280, 3, '#1f2a3f');
      G.disc(ctx, 160, 120, 26, '#2a3346');
      G.disc(ctx, 160, 118, 22, '#3a4254');
      for (let i = 0; i < 7; i++) G.disc(ctx, 146 + ((i * 9 + Math.floor(t / 200)) % 28), 112 + ((i * 5) % 12), 2 + (Math.floor(t / 150 + i) % 2), '#4a5366');
      for (let i = 0; i < 5; i++) G.dither(ctx, 146 + i * 6, 70 - ((t / 30 + i * 20) % 30), 3, 8, '#5f6b80');
      G.rect(ctx, 132, 146, 56, 6, '#0d121c');
      G.redDot(ctx, 182, 148, t, false); // 电磁炉的指示灯
      // “哈哈”——每次出现在同样的位置
      const k = Math.floor(t / 1600) % 3;
      G.text(ctx, '哈哈哈', [60, 196, 128][k], [36, 30, 42][k], P.gray3);
    };
    await G.fadeTo(0, 500);
    await G.say('他和朋友去吃火锅。锅底翻滚，大家笑得东倒西歪。');
    await G.say('他看着他们的嘴一张一合，那些笑话他好像听过，不止一次——');
    if ((await G.choose(['跟着笑', '数一数，这个笑话听过几次'])) === 1) G.add('time', 2);
    await G.say('也许在上个周末，也许在上一次轮回。他像坐在别人的存档里吃饭。');
    await G.say('朋友们开始对着精美菜肴拍照打卡。他尝了一口，想自己为什么不在家点外卖，反正都是吃。');
    await G.say('和朋友分别回家，他想，还不如躺床上刷一天火箭起飞的视频。虽然收藏夹里已经躺着几百个这样的视频了。');
    if ((await G.choose(['打开收藏夹', '不打开'])) === 0) G.add('mars', 2);
    await G.fadeTo(1, 600);
  }

  // ---------------------------------------------------------------- 望远镜
  async function telescope() {
    const s = { vx: 0, vy: 0, seam: 0, found: false };
    const MOON = { x: 0, y: 0, r: 70 };
    const MARS = { x: 150, y: -110 };
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#000');
      ctx.save();
      ctx.beginPath(); ctx.arc(160, 90, 84, 0, Math.PI * 2); ctx.clip();
      G.rect(ctx, 76, 6, 168, 168, '#03050a');
      const ox = 160 - s.vx, oy = 90 - s.vy;
      G.stars(ctx, ox - 300, oy - 300, 600, 600, 220, 31, t, P.mist);
      G.px(ctx, ox + MARS.x, oy + MARS.y, P.red); // 天边那颗微微发红的点
      // 月亮
      G.disc(ctx, ox, oy, MOON.r, '#8a96a8');
      G.dither(ctx, ox - 50, oy - 40, 60, 50, '#9aa6b8');
      const cr = G.rng(3);
      for (let i = 0; i < 40; i++) {
        const a = cr() * 6.28, d = cr() * (MOON.r - 8), rr = 2 + Math.floor(cr() * 7);
        G.disc(ctx, ox + Math.cos(a) * d, oy + Math.sin(a) * d, rr, '#6f7b8e');
        G.disc(ctx, ox + Math.cos(a) * d + 1, oy + Math.sin(a) * d + 1, Math.max(1, rr - 2), '#7d899b');
      }
      // 边缘露出贴图的方格
      const edge = Math.hypot(s.vx, s.vy) / MOON.r;
      if (edge > 0.55) {
        ctx.globalAlpha = Math.min(0.6, (edge - 0.55) * 1.6);
        for (let gx = -MOON.r; gx <= MOON.r; gx += 16) G.rect(ctx, ox + gx, oy - MOON.r, 1, MOON.r * 2, '#b8c4d4');
        for (let gy = -MOON.r; gy <= MOON.r; gy += 16) G.rect(ctx, ox - MOON.r, oy + gy, MOON.r * 2, 1, '#b8c4d4');
        ctx.globalAlpha = 1;
        s.seam = Math.max(s.seam, edge);
      }
      ctx.restore();
      G.text(ctx, '方向键移动视野　空格放下', 160, 166, P.gray2, { align: 'center' });
    };
    G.sceneUpdate = (dt, input) => {
      if (!input) return;
      const v = 50 * dt / 1000;
      if (G.held('left')) s.vx -= v;
      if (G.held('right')) s.vx += v;
      if (G.held('up')) s.vy -= v;
      if (G.held('down')) s.vy += v;
      s.vx = Math.max(-200, Math.min(200, s.vx)); s.vy = Math.max(-160, Math.min(160, s.vy));
      if (!s.found && Math.hypot(s.vx - MARS.x, s.vy - MARS.y) < 20) { s.found = true; G.add('mars'); }
    };
    await G.fadeTo(0, 500);
    await G.say('他买了一台天文望远镜，在阳台上对准月亮。环形山清晰得不可思议。');
    G.clearInput();
    await G.until(() => s.seam > 0.8 || G.eat('ok') || G.held('skip'));
    G.sceneUpdate = null;
    await G.say('他看了很久，只觉得那是一张分辨率很高的贴图。');
    G.add('mars');
    await G.fadeTo(1, 600);
  }

  // ---------------------------------------------------------------- 电影院
  async function cinema() {
    const s = { fps: false };
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#05070c');
      // 银幕
      G.rect(ctx, 40, 12, 240, 96, '#1a2438');
      const f = s.fps ? Math.floor(t / 125) : t / 16; // 注意到帧率之后，画面一格一格地跳
      const bx = 40 + ((f * 2) % 240);
      G.rect(ctx, 40, 70, 240, 38, '#223049');
      G.disc(ctx, bx, 60, 10, '#3b5379');
      G.rect(ctx, 80 + Math.sin(f / 20) * 30, 50, 8, 20, '#2c3a55');
      if (s.fps) {
        G.text(ctx, '24 fps', 276, 14, P.gray3, { align: 'right' });
        for (let i = 0; i < 3; i++) G.rect(ctx, 40, 12 + ((Math.floor(t / 125) * 7 + i * 32) % 96), 240, 1, '#0e1628');
      }
      ctx.globalAlpha = 0.05; G.rect(ctx, 40, 108, 240, 70, '#8fb4dc'); ctx.globalAlpha = 1;
      // 观众后脑勺
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 9; i++) {
          const x = 24 + i * 34 + (row % 2) * 16, y = 128 + row * 18;
          G.disc(ctx, x, y, 7, '#0c111b');
          G.rect(ctx, x - 12, y + 6, 24, 12, '#0a0e17');
        }
      }
      G.redDot(ctx, 300, 6, t); // 放映间里的一点红光
    };
    await G.fadeTo(0, 500);
    await G.say('有一次他坐在影院里。有人为剧情动容，有人觉得无聊。');
    s.fps = true;
    await G.say('他却在想镜头是怎么切的，台词是怎么写的，票房是怎么算的。电影是假的。他进不去。这只是一台用来赚钱的机器。');
    await G.say('一个人一旦开始注意帧率，就再也没办法好好看完一部电影。');
    await G.fadeTo(1, 600);
  }
})();
