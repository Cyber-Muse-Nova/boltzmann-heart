'use strict';
// 五个结局
(function () {
  const G = window.G, P = G.P, PC = G.PC;
  const R = (n) => G.fmtRun(n);

  G.ENDINGS = [
    { id: 'e1', name: '结局一　未读', quote: '那句「你睡了吗」，后来一直没有变成已读。' },
    { id: 'e2', name: '结局二　注释', quote: '// 如果我也是被人写出来的，希望写我的那位记得加注释。' },
    { id: 'e3', name: '结局三　贴图的背面', quote: '如果这是一个模拟，那火星就是它最远的一张贴图。我想去看看贴图的背面是什么。' },
    { id: 'e4', name: '结局四　翻山', quote: '他终于明白：历史只是一份记录。' },
    { id: 'e5', name: '结局五　常数', quote: '在特拉法玛铎语里，一个点的意思是：你好。' },
  ];

  G.unlock = (id, run) => {
    if (!G.save.endings[id]) {
      G.save.endings[id] = { run, at: Date.now() };
      G.persist();
      return true;
    }
    return false;
  };
  G.allFour = () => ['e1', 'e2', 'e3', 'e4'].every((k) => G.save.endings[k]);

  // 路由：取倾向值最高且尚未解锁的结局
  G.route = () => {
    const map = { code: 'e2', mars: 'e3', time: 'e4' };
    const order = ['code', 'mars', 'time'].sort((a, b) => G.tend[b] - G.tend[a]);
    for (const k of order) if (!G.save.endings[map[k]]) return map[k];
    return map[order[0]];
  };

  // 结局终端：全屏弹出
  G.endTerminal = async (cmd, lines) => {
    const term = new G.Term();
    const prev = G.bg;
    G.bg = (ctx, t) => {
      if (prev) prev(ctx, t);
      ctx.globalAlpha = 0.7; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1;
      term.draw(ctx, { x: 8, y: 8, w: 304, h: 164 });
    };
    await G.fadeTo(0, 300);
    await G.wait(400);
    await term.cmd(cmd);
    await term.out(lines, 70);
    term.push('');
    await G.wait(500);
    await G.waitOk();
    await G.fadeTo(1, 800);
    G.bg = null;
  };

  const e1Lines = (run) => [
    '',
    '  RUN         ' + R(run),
    '  OBSERVER    CONSTANT',
    '  UPTIME      9,131 d',
    '  FIRST_ASK   d9014  02:34 local',
    '  EXIT        d9131  TERMINATED (self-exit)',
    '  LAST_FRAME  room.light = off',
    '              wall       = empty',
    '              msg.unread = 1  「你睡了吗」',
    '  ACTION      PENDING  ->  restart --seed=same',
  ];
  const e2Lines = (run) => [
    '',
    '  RUN         ' + R(run),
    '  OBSERVER    CONSTANT',
    '  LOCATION    MOUNTAIN VIEW',
    '  FIRST_ASK   02:34 local',
    '  LAST_EDIT   // 如果我也是被人写出来的，',
    '              // 希望写我的那位记得加注释。',
    '  STATUS      RUNNING',
  ];
  const e3Lines = (run) => [
    '',
    '  RUN         ' + R(run),
    '  OBSERVER    CONSTANT',
    '  LOCATION    SOUTH TEXAS / LAUNCH TOWER',
    '  FIRST_ASK   02:34 local',
    '  T-MINUS     31 d',
    '  DESTINATION MARS',
    '  STATUS      RUNNING',
  ];
  const e4Lines = (run) => [
    '',
    '  RUN         ' + R(run),
    '  OBSERVER    CONSTANT',
    '  LABEL       翻山',
    '  ROLLBACK COUNT  37',
    '  NOTE        回滚残留，无害。',
    '  STATUS      RUNNING',
  ];
  G.endLines = { e1: e1Lines, e2: e2Lines, e3: e3Lines, e4: e4Lines };
  G.endCmd = {
    e1: 'simctl log --status terminated --tail 1',
    e2: (run) => 'simctl log --run ' + run,
    e3: (run) => 'simctl log --run ' + run,
    e4: (run) => 'simctl log --run ' + run,
  };

  // ================================================================ 结局一　未读
  G.e1 = async (run) => {
    const st = G.ch5State || { gone: new Set(), poster: false };
    st.phoneGlow = 1; st.screenOn = false; st.tvLight = false;
    const s = { dark: 0, glow: 1 };
    G.bg = (ctx, t) => {
      G.drawBedroom(ctx, t, Object.assign({}, st, { phoneGlow: 0, noRed: true }));
      ctx.globalAlpha = s.dark; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1;
      // 只有手机屏幕亮着那条未读消息
      ctx.globalAlpha = s.glow;
      G.rect(ctx, 269, 66, 6, 3, '#9fc0e8');
      ctx.globalAlpha = s.glow * 0.12; G.disc(ctx, 272, 68, 14, '#9fc0e8'); ctx.globalAlpha = s.glow;
      G.text(ctx, '「你睡了吗」', 272, 50, '#9fc0e8', { align: 'center' });
      ctx.globalAlpha = 1;
      if (s.glow < 0.05) G.redDot(ctx, 262, 67, t); // 待机灯
    };
    G.audio.hum(0.1);
    G.fade = 0;
    await G.tween(2600, (p) => { s.dark = p * 0.96; });
    await G.wait(3200);
    await G.tween(1600, (p) => { s.glow = 1 - p; });
    await G.wait(1400);
    G.audio.quiet();
    await G.blackLine('那天夜里，他做了一个决定。', { color: P.cold });
    G.bg = (ctx) => G.rect(ctx, 0, 0, 320, 180, '#000');
    await G.wait(2600);
    await G.blackLine('那句「你睡了吗」，后来一直没有变成已读。', { color: P.cold });
    G.unlock('e1', run);
    await G.wait(1200);
    await G.endTerminal(G.endCmd.e1, e1Lines(run));
    await G.helpline();
  };

  // 回到标题之前，单独一屏安静的小字
  G.helpline = async () => {
    G.bg = (ctx) => {
      G.rect(ctx, 0, 0, 320, 180, '#000');
      // 上线前请再核对一次热线号码（全国心理援助热线 12356）。
      const lines = G.wrap('如果你也有过这样的夜晚，请告诉一个你信任的人，或拨打心理援助热线 12356。', 250);
      lines.forEach((l, i) => G.text(ctx, l, 160, 76 + i * G.LH, P.gray3, { align: 'center' }));
    };
    await G.fadeTo(0, 1200);
    await G.wait(1500);
    await G.waitOk();
    await G.fadeTo(1, 1000);
  };

  // ================================================================ 结局二　注释
  G.e2 = async (run) => {
    const CODE = [
      'function render(frame) {',
      '  const world = load(frame.seed);',
      '  for (const obj of world.objects) {',
      '    if (!observed(obj)) continue;',
      '    draw(obj, frame.lod);',
      '  }',
      '  return frame.next(); // ???',
      '}',
    ];
    const COMMENT = '// 如果我也是被人写出来的，希望写我的那位记得加注释。';
    const s = { mode: 'office', typed: 0, status: '' };
    const office = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#070b14');
      G.rect(ctx, 0, 0, 320, 60, '#0a1020');
      for (let i = 0; i < 8; i++) G.rect(ctx, 10 + i * 40, 8, 30, 40, '#0d1528'); // 落地窗
      G.stars(ctx, 0, 6, 320, 40, 12, 88, t, P.steel);
      for (let row = 0; row < 3; row++) {
        const y = 78 + row * 30;
        G.rect(ctx, 0, y + 14, 320, 4, '#141c2c');
        for (let i = 0; i < 7; i++) {
          const x = 14 + i * 44 + row * 8;
          const lit = row === 1 && i === 3;
          G.rect(ctx, x, y, 22, 14, '#0b0f17');
          G.rect(ctx, x + 1, y + 1, 20, 12, lit ? '#2c4a73' : '#0e1420');
          if (lit) { ctx.globalAlpha = 0.1; G.disc(ctx, x + 11, y + 10, 20, '#8fb4dc'); ctx.globalAlpha = 1; }
        }
      }
      G.redDot(ctx, 58, 81, t); // 某台显示器的待机灯
      G.drawActor(ctx, 'constant', 'up', 0, 163, 136);
      G.clockHud(ctx);
    };
    const editor = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#04070a');
      G.rect(ctx, 0, 0, 320, 12, '#0c1813');
      G.text(ctx, 'render.js　—　02:34', 6, 0, '#4f7a64');
      const lines = CODE.slice();
      const cm = COMMENT.slice(0, s.typed);
      lines.splice(6, 0, '  ' + cm);
      lines.forEach((l, i) => {
        G.text(ctx, String(i + 1).padStart(2, ' '), 4, 18 + i * 13, '#2f4f3f');
        const isC = i === 6;
        G.text(ctx, l, 22, 18 + i * 13, isC ? '#9fb4c8' : '#7cc79b');
      });
      if (Math.floor(G.real / 450) % 2 === 0) G.rect(ctx, 22 + G.measure('  ' + cm), 19 + 6 * 13, 5, 11, '#7cc79b');
      for (let x = 0; x < 110; x += 2) G.px(ctx, 60 + x, 18 + 7 * 13 + 11, '#5b6470'); // 修不好的那一行
      G.rect(ctx, 0, 168, 320, 12, '#0c1813');
      G.text(ctx, s.status, 6, 168, '#7cc79b');
      G.redDot(ctx, 314, 173, t);
    };
    G.bg = office;
    G.audio.hum(0.4);
    await G.fadeTo(0, 1200);
    await G.say('在其中一条里，Constant 生在另一座城市，有另一对父母。');
    await G.say('二十五岁的他坐在山景城一间开放式办公室里，屏幕上是一段怎么也修不好的代码。');
    G.bg = editor;
    await G.say('本地时间凌晨两点三十四分，他停下手，看着光标闪了很久。日志在这里记下一个 ASK。');
    await G.say('然后他笑了一下，在代码里加了一行注释：');
    // 玩家亲手敲下这行注释（每次按键自动补全几个字）
    G.clearInput();
    const total = [...COMMENT].length;
    await G.until(() => {
      if (G.anyKey || G.click || G.held('skip')) {
        G.click = null;
        s.typed = Math.min(COMMENT.length, s.typed + 2);
        G.audio.type(true);
      }
      return s.typed >= COMMENT.length;
    });
    await G.wait(600);
    s.status = '已保存';
    G.audio.select();
    await G.wait(700);
    s.status = '编译中……';
    await G.wait(900);
    s.status = '编译完成　0 errors';
    await G.say('他保存，编译，接着修他的 bug。');
    G.unlock('e2', run);
    await G.endTerminal(G.endCmd.e2(run), e2Lines(run));
    void total;
  };

  // ================================================================ 结局三　贴图的背面
  G.e3 = async (run) => {
    const s = { camY: 0, look: false, badge: 0 };
    const TOWER_X = 250;
    G.audio.wind(1);
    const room = {
      bounds: { x0: 16, x1: 300, y0: 150, y1: 160 }, start: { x: 40, y: 156, dir: 'right' }, done: false,
      draw: (ctx, t) => {
        ctx.save();
        ctx.translate(0, Math.round(s.camY));
        // 天空（向上延伸）
        for (let j = -420; j < 150; j += 2) G.rect(ctx, 0, j, 320, 2, G.lerpC('#03050a', '#0f1a30', (j + 420) / 570));
        G.stars(ctx, 0, -420, 320, 540, 160, 51, t, P.mist);
        G.px(ctx, 206, -392, P.red); // 火星：天边一颗微微发红的点
        if (s.camY > 380) { ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t / 500); G.frame(ctx, 202, -396, 9, 9, P.cold); ctx.globalAlpha = 1; }
        // 海
        G.rect(ctx, 0, 132, 150, 48, '#0a1424');
        for (let x = 0; x < 150; x += 5) G.px(ctx, x + Math.floor(Math.sin(t / 300 + x) * 2), 132 + (x % 3), '#2a4064');
        // 地面
        G.rect(ctx, 130, 136, 190, 44, '#10151f');
        G.rect(ctx, 0, 160, 320, 20, '#0d121b');
        // 发射塔（桁架）
        const tx = TOWER_X, top = -250;
        G.rect(ctx, tx - 10, top, 2, 400, '#2b3547');
        G.rect(ctx, tx + 10, top, 2, 400, '#2b3547');
        for (let y = top; y < 150; y += 12) { G.line(ctx, tx - 10, y, tx + 10, y + 12, '#222b3a'); G.line(ctx, tx + 10, y, tx - 10, y + 12, '#222b3a'); G.rect(ctx, tx - 10, y, 22, 1, '#2b3547'); }
        G.rect(ctx, tx - 14, top - 4, 30, 4, '#2b3547');
        // 塔顶航标灯（冷白）
        if (Math.sin(t / 600) > 0) G.px(ctx, tx + 1, top - 6, P.white);
        // 火箭（只画轮廓）
        G.rect(ctx, tx + 18, -120, 16, 270, '#1f2735');
        G.rect(ctx, tx + 20, -130, 12, 10, '#1f2735');
        G.rect(ctx, tx + 22, -136, 8, 6, '#1f2735');
        ctx.restore();
        if (!s.look) G.clockHud(ctx);
      },
      objs: [
        {
          id: 'tower', name: '塔架下　抬头', x: TOWER_X - 16, y: 150, w: 30, h: 8, mx: TOWER_X, my: 120,
          act: async () => {
            room.hidePlayer = false;
            s.look = true;
            G.bgTween(7000, (p) => { const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; s.camY = e * 460; });
            await G.say('凌晨两点三十四分，他站在塔架下抬头。火星是天边一颗微微发红的点。');
            await G.wait(1000);
            room.done = true;
          },
        },
      ],
    };
    G.bg = (ctx, t) => room.draw(ctx, t);
    await G.fadeTo(0, 1200);
    await G.say('在另一条运行里，他是那家火箭公司最被器重的工程师。');
    await G.say('得克萨斯南端的海风吹过发射塔，距离第一次载人火星任务还有三十一天。');
    await G.say('下个月，和他一起登船的，有他的老板——那个在他十五岁时说出「十亿分之一」的人。');
    const baseDraw = room.draw;
    room.draw = (ctx, t) => {
      baseDraw(ctx, t);
      if (s.camY > 0) {
        // 镜头上移时，角色随地面一起离开画面
        room.hidePlayer = true;
        G.drawActor(ctx, 'constant', 'up', 0, room.player.x, room.player.y + s.camY);
      }
    };
    await G.explore(room);
    await G.wait(1200);
    await G.say('这条运行的 ASK 发生在很多年前，也是这个钟点。那天夜里他在本子上写下一句话，后来一直夹在工作证背面：');
    // 工作证背面
    const prev = G.bg;
    G.bg = (ctx, t) => {
      prev(ctx, t);
      ctx.globalAlpha = 0.75; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = s.badge;
      G.rect(ctx, 70, 30, 180, 112, '#c3cad4');
      G.rect(ctx, 70, 30, 180, 3, '#9aa5b3');
      G.rect(ctx, 150, 24, 20, 8, '#5f656f');
      const ls = G.wrap('如果这是一个模拟，那火星就是它最远的一张贴图。我想去看看贴图的背面是什么。', 156);
      ls.forEach((l, i) => G.text(ctx, l, 82, 50 + i * 16, '#1a2233'));
      ctx.globalAlpha = 1;
    };
    await G.tween(900, (p) => { s.badge = p; });
    await G.wait(1200);
    await G.waitOk();
    G.audio.wind(0);
    G.unlock('e3', run);
    await G.endTerminal(G.endCmd.e3(run), e3Lines(run));
  };

  // ================================================================ 结局四　翻山
  G.e4 = async (run) => {
    const s = { year: '', flash: 0 };
    const lab = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#070b14');
      G.rect(ctx, 0, 120, 320, 60, '#0c121e');
      // 时间机器：一台很朴素的机器
      G.rect(ctx, 110, 50, 100, 80, '#1b2436');
      G.frame(ctx, 110, 50, 100, 80, '#3b5379');
      G.rect(ctx, 122, 62, 76, 26, '#04070d');
      G.text(ctx, s.year || '— — — —', 160, 68, P.green, { align: 'center' });
      for (let i = 0; i < 5; i++) G.disc(ctx, 126 + i * 17, 106, 4, i === 2 ? '#5b7196' : '#2a4064');
      G.redDot(ctx, 204, 56, t, false);
      G.drawActor(ctx, 'constant', 'up', 0, 160, 160);
      if (s.flash > 0) { ctx.globalAlpha = s.flash; G.rect(ctx, 0, 0, 320, 180, '#e6eef8'); ctx.globalAlpha = 1; }
    };
    G.bg = lab;
    G.audio.hum(0.3);
    await G.fadeTo(0, 1200);
    await G.say('还有一条运行，值班员每次打开都要多看几遍。');
    await G.say('在那里，Constant 造出了时间机器。');
    await G.say('他想回到开头去看看。');
    const jump = async (label) => {
      s.year = label;
      G.bg = lab;
      await G.hint('（空格，出发。）');
      G.audio.glitch(0.4);
      await G.tween(500, (p) => { s.flash = p; });
    };
    await jump('−1 年');
    G.bg = (ctx, t) => { G.drawBedroom(ctx, t, { screenOn: true }); if (s.flash > 0) { ctx.globalAlpha = s.flash; G.rect(ctx, 0, 0, 320, 180, '#e6eef8'); ctx.globalAlpha = 1; } };
    await G.tween(700, (p) => { s.flash = 1 - p; });
    await G.say('第一次，他回到一年前，一切完美无缺。');
    await jump('−10 年');
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#0a111e');
      for (let i = 0; i < 6; i++) G.rect(ctx, i * 56, 30 + (i % 3) * 10, 48, 110, '#121b2c');
      G.rect(ctx, 0, 140, 320, 40, '#0e1523');
      const r = G.rng(Math.floor(t / 60));
      for (let i = 0; i < 80; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 180); G.rect(ctx, x, y, 1, 3, '#5b7196'); }
      G.drawActor(ctx, 'constant', 'right', 0, 150, 160);
      G.redDot(ctx, 40, 48, t); // 楼上一扇窗里的红点
      if (s.flash > 0) { ctx.globalAlpha = s.flash; G.rect(ctx, 0, 0, 320, 180, '#e6eef8'); ctx.globalAlpha = 1; }
    };
    await G.tween(700, (p) => { s.flash = 1 - p; });
    await G.say('第二次，十年前，街道、气味、雨水的温度，分毫不差。');
    await jump('出生之前');
    s.flash = 1;
    await G.say('第三次，他回到了自己出生之前。');
    await beforeBirth();
    // 回滚之后
    G.bg = lab;
    s.year = ''; s.flash = 0;
    await G.fadeTo(0, 400);
    await G.say('记录显示，这条运行已经被回滚了三十七次。');
    await G.say('每一次，他都在快要看清边界的时候，回到造出机器之前，什么也不记得；每一次，他都重新造出那台机器，一次比一次快。');
    await G.say('值班员所在的地方，管这种运行叫「翻山」。');
    await G.fadeTo(1, 600);
    await G.eyesClosed(['回滚之后的几个星期里，他闭上眼睛，会看见白色的、像代码一样的东西向下流动。'], { alignAt: 0, flowAt: 0 });
    await G.say('值班员在那一栏的备注里写着：回滚残留，无害。');
    G.unlock('e4', run);
    await G.endTerminal(G.endCmd.e4(run), e4Lines(run));
    G.titleFlash = true;
  };

  // 出生之前的街道：远看一切正常，走近了才发现是薄的
  async function beforeBirth() {
    const WORLD = 960;
    const s = { glitch: 0, rewinding: false, seen: {} };
    const BUILD = [];
    for (let i = 0; i < 9; i++) BUILD.push({ x: 20 + i * 104, w: 70 + ((i * 13) % 16), h: 70 + ((i * 29) % 40) });
    const FACES = 12;
    const peds = [];
    for (let i = 0; i < 7; i++) peds.push({ x: 120 + i * 120, y: 146 + (i % 3) * 8, v: (i % 2 ? 1 : -1) * (14 + (i % 3) * 5), face: (i * 5) % FACES, anim: i * 100 });
    const room = {
      world: WORLD, sprite: 'constant',
      bounds: { x0: 16, x1: WORLD - 10, y0: 138, y1: 170 }, start: { x: 40, y: 156, dir: 'right' }, done: false,
      update(dt) {
        for (const p of peds) {
          p.x += p.v * dt / 1000; p.anim += dt;
          if (p.x < 60 || p.x > WORLD - 60) { p.v *= -1; p.face = (p.face + 7) % FACES; }
        }
        const px = room.player.x;
        s.glitch = Math.max(0, (px - 700) / 120);
        if (px > 815 && !s.rewinding) { s.rewinding = true; room.done = true; }
      },
      draw(ctx, t) {
        const cam = room.cam;
        // 天空：云层后面没有星星
        G.rect(ctx, 0, 0, 320, 120, '#0e1626');
        for (let k = 0; k < 5; k++) G.rect(ctx, ((k * 97 - cam * 0.3) % 400 + 400) % 400 - 60, 14 + k * 7, 80, 6, '#152036');
        for (const b of BUILD) {
          const x = b.x - cam;
          if (x > 330 || x + b.w < -10) continue;
          // 楼与楼之间：一片没有纹理的白雾
          G.rect(ctx, x + b.w, 30, 104 - b.w, 108, '#b7c0cc');
          G.rect(ctx, x, 138 - b.h, b.w, b.h, '#1a2336');
          for (let wy = 138 - b.h + 6; wy < 130; wy += 10) for (let wx = x + 5; wx < x + b.w - 6; wx += 10) G.rect(ctx, wx, wy, 4, 5, '#253049');
        }
        G.rect(ctx, 0, 138, 320, 42, '#161d2b');
        G.rect(ctx, 0, 138, 320, 2, '#232c3e');
        // 报刊亭
        const kx = 200 - cam;
        G.rect(ctx, kx, 118, 34, 22, '#222c40');
        G.rect(ctx, kx + 3, 122, 12, 14, '#c3cad4');
        G.rect(ctx, kx + 18, 122, 12, 14, '#c3cad4');
        for (let i = 0; i < 5; i++) { G.rect(ctx, kx + 4, 124 + i * 2, 10, 1, '#5f656f'); G.rect(ctx, kx + 19, 124 + i * 2, 10, 1, '#5f656f'); }
        // 路灯
        const lx = 470 - cam;
        G.rect(ctx, lx, 96, 2, 44, '#2b3547'); G.rect(ctx, lx - 4, 94, 10, 3, '#3b5379');
        G.redDot(ctx, 610 - cam, 100, t); // 一座楼顶的航标灯
        // 行人：十几张脸轮流使用
        for (const p of peds) {
          const sx = p.x - cam;
          if (sx < -20 || sx > 340) continue;
          G.drawActor(ctx, 'shadowLight', p.v > 0 ? 'right' : 'left', G.WALK[Math.floor(p.anim / 160) % 4], sx, p.y);
          drawFace(ctx, sx - 3, p.y - 20, p.face);
        }
      },
      drawFront(ctx, t) {
        if (s.glitch > 0) G.glitchFx(ctx, Math.min(1.2, s.glitch), Math.floor(t / 90));
        G.text(ctx, '→', 312, 150, P.gray3, { align: 'right' });
      },
      objs: [
        { id: 'paper', name: '报纸', x: 200, y: 136, w: 34, h: 16, mx: 217, my: 116, act: newspaper },
        { id: 'ped', name: '行人', x: 330, y: 136, w: 40, h: 16, mx: 350, my: 124, act: faces },
        { id: 'sky', name: '抬头', x: 460, y: 136, w: 24, h: 16, mx: 471, my: 92, act: () => G.say('云层后面没有星星。') },
        {
          id: 'fog', name: '楼与楼之间', x: 540, y: 136, w: 40, h: 16, mx: 560, my: 60,
          act: () => G.say('他再往回走一百年，只剩被记录下来的东西还是实心的：照片里拍到的楼房坚固如常，楼与楼之间的街道，是一片看不清的雾。'),
        },
      ],
    };
    async function newspaper() {
      const prev = G.bg;
      G.bg = (ctx, t) => {
        prev(ctx, t);
        ctx.globalAlpha = 0.8; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1;
        G.rect(ctx, 50, 8, 220, 112, '#c3cad4');
        G.rect(ctx, 60, 14, 200, 10, '#3b4250');
        for (let i = 0; i < 7; i++) G.text(ctx, '历史只是一份记录。历史只是一份记录。历史只是', 60, 30 + i * 12, '#5f656f');
      };
      await G.say('远远看去，报纸上的字排得整整齐齐；凑近了，小号字体里同一个句子在反复出现。');
      G.bg = prev;
    }
    async function faces() {
      const prev = G.bg;
      G.bg = (ctx, t) => {
        prev(ctx, t);
        ctx.globalAlpha = 0.8; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1;
        const hl = Math.floor(t / 300) % FACES;
        for (let i = 0; i < FACES; i++) {
          const x = 40 + (i % 6) * 42, y = 30 + Math.floor(i / 6) * 42;
          G.rect(ctx, x, y, 30, 30, i === hl ? '#3b5379' : '#1b2436');
          drawFace(ctx, x + 9, y + 9, i, 2);
        }
      };
      await G.say('背景里的行人只有十几张脸，轮流使用。');
      G.bg = prev;
    }
    await G.say('世界还在，但开始变薄。');
    await G.explore(room);
    // 边界：卡顿、倒带
    await G.say('他终于明白：历史只是一份记录。在他出生以前，世界只存在于有人把它写下来的地方。');
    G.audio.glitch(1.2);
    const p = room.player;
    const x0 = p.x;
    const stutter = G.bg;
    G.bg = (ctx, t) => {
      stutter(ctx, t);
      G.glitchFx(ctx, 1.4, Math.floor(t / 50));
      G.text(ctx, '◀◀', 16, 12, P.white);
    };
    await G.tween(2200, (q) => { p.x = x0 - (x0 - 40) * q; p.dir = 'right'; p.moving = true; p.anim -= 30; room.cam = Math.max(0, Math.min(WORLD - 320, p.x - 160)); });
    G.audio.glitch(0.6);
    await G.fadeTo(1, 300, '#e6eef8');
    G.fadeColor = '#e6eef8';
    await G.wait(400);
    G.fade = 1; G.fadeColor = '#000';
  }

  function drawFace(ctx, x, y, i, sc = 1) {
    // 12 种抽象的脸：眼睛位置和嘴的长短不同
    const e = [0, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 2][i];
    const m = [2, 3, 4, 2, 3, 4, 3, 2, 4, 3, 2, 4][i];
    const c = '#8795aa';
    ctx.fillStyle = c;
    ctx.fillRect(x + (1 + (e === 1 ? 0 : 0)) * sc, y + (1 + (e === 2 ? 1 : 0)) * sc, sc, sc);
    ctx.fillRect(x + (5 - (e === 1 ? 1 : 0)) * sc, y + (1 + (e === 2 ? 1 : 0)) * sc, sc, sc);
    ctx.fillRect(x + (3 - Math.floor(m / 2)) * sc, y + 4 * sc, m * sc, sc);
  }

  // ================================================================ 结局五　常数
  G.e5 = async () => {
    const rec = (k) => (G.save.endings[k] ? G.save.endings[k].run : G.RUN0);
    const exitRun = rec('e1');
    const term = new G.Term();
    const s = { termVis: false, sky: 0, dot: false, clock: false, hello: false, screenOnly: false, frame: 0 };
    const pal = { bg: '#07090c', edge: '#2a323c', text: PC.text, bar: '#11161c', dim: PC.dim };
    const room = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, PC.bg);
      G.rect(ctx, 0, 0, 320, 110, PC.wall);
      // 一排排机器
      for (let row = 0; row < 3; row++) {
        const y = 20 + row * 10, h = 90 - row * 14, sc = 1 - row * 0.2;
        for (let i = 0; i < 14; i++) {
          const w = 18 * sc, x = ((i * 26 * sc + row * 9) % 340) - 10;
          G.rect(ctx, x, y + (row === 0 ? 20 : 0), w, h, row === 0 ? PC.rack2 : PC.rack);
          G.frame(ctx, x, y + (row === 0 ? 20 : 0), w, h, PC.edge);
          for (let k = 0; k < 6; k++) {
            const on = Math.sin(t / (300 + ((i * 7 + k * 13) % 9) * 90) + i + k) > 0.3;
            if (on) G.px(ctx, x + 3 + (k % 2) * 4, y + (row === 0 ? 24 : 4) + k * 6, k % 3 ? PC.led : PC.led2);
          }
        }
      }
      G.rect(ctx, 0, 130, 320, 50, '#0e1216');
      // 桌子与屏幕：唯一的光
      G.rect(ctx, 100, 128, 120, 6, '#1b2128');
      G.rect(ctx, 124, 86, 72, 42, '#0a0d10');
      G.rect(ctx, 126, 88, 68, 38, s.sky ? '#03050a' : '#11171d');
      if (s.sky) G.stars(ctx, 126, 88, 68, 38, 40, 7, t, '#9aa6b8');
      ctx.globalAlpha = 0.08; G.disc(ctx, 160, 110, 40, '#b4c3d1'); ctx.globalAlpha = 1;
      // 值班员（背影剪影）
      G.disc(ctx, 160, 146, 9, '#07090c');
      G.rect(ctx, 146, 154, 28, 26, '#07090c');
    };
    G.bg = (ctx, t) => {
      if (s.screenOnly) {
        G.rect(ctx, 0, 0, 320, 180, '#050608');
        if (s.clock) G.text(ctx, '02:34', 312, 6, PC.text, { align: 'right' });
        if (s.dot) G.disc(ctx, 160, 84, 2, P.red);
        if (s.hello) G.text(ctx, '你好。', 160, 110, P.white, { align: 'center' });
        if (s.termVis) term.draw(ctx, { x: 8, y: 8, w: 304, h: 112 }, pal);
        return;
      }
      room(ctx, t);
      if (s.frame) {
        ctx.globalAlpha = 0.85; G.rect(ctx, 0, 0, 320, 180, '#000'); ctx.globalAlpha = 1;
        G.rect(ctx, 60, 10, 200, 112, '#000');
        G.frame(ctx, 60, 10, 200, 112, '#2a323c');
        ctx.save(); ctx.translate(60, 10); ctx.scale(0.625, 0.625);
        G.drawBedroom(ctx, t, { gone: new Set(['rug', 'plant', 'clothes', 'lamp', 'chair', 'books', 'speaker']), poster: false, dark: 0.55, phoneGlow: 1, noRed: true });
        ctx.restore();
        G.text(ctx, '「你睡了吗」', 230, 44, '#9fc0e8', { align: 'center' });
      }
      if (s.termVis) term.draw(ctx, { x: 8, y: 8, w: 304, h: 112 }, pal);
    };
    G.audio.hum(0.7);
    await G.fadeTo(0, 1500);
    await G.say('在另一个地方——「地方」这个词在那里并不准确——值班员调出了一条终止记录。');
    s.termVis = true;
    // 玩家亲手输入命令：按任意键补全
    const typeCmd = async (cmd) => {
      const ln = { s: term.prompt, c: PC.text, typing: true };
      term.lines.push(ln);
      G.clearInput();
      let i = 0;
      const chars = [...cmd];
      await G.until(() => {
        if (G.anyKey || G.click || G.held('skip')) { G.click = null; const n = G.held('skip') ? 4 : 3; ln.s += chars.slice(i, i + n).join(''); i += n; G.audio.type(true); }
        return i >= chars.length;
      });
      ln.typing = false;
      await G.wait(300);
    };
    await typeCmd('simctl log --status terminated --tail 1');
    await term.out(e1Lines(exitRun), 60);
    await G.say('他在这条记录上停留得比平时久一些。然后，按照惯例，他调出了其他几条运行里的 Constant。');
    for (const k of ['e2', 'e3', 'e4']) {
      term.lines = [];
      if (k === 'e4') await G.say('还有一条运行，值班员每次打开都要多看几遍。');
      await typeCmd('simctl log --run ' + rec(k));
      await term.out(G.endLines[k](rec(k)), 60);
      await G.waitOk();
    }
    s.termVis = false;

    await G.say('他们拥有很多名字：上帝，造物主，程序员，高维生命，特拉法玛铎人。');
    await G.say('他们只是在运行。');
    await G.say('在他们的配置里，几乎一切都是随机的：出生的城市，父母，天赋，运气，所处的年代，会遇见谁，会不会被生下来。');
    await G.say('星系怎样旋转，天气怎样变化，一个朝代什么时候建立、什么时候崩塌——这些他们都算得出来，偶尔也确实会调一调。');
    await G.say('只有一个参数从不改变：在他一生中的某一刻，本地时间凌晨两点三十四分，他会第一次问出那个问题。');
    await G.blackLine('我是不是一串代码。', { color: P.white, bg: '#050608' });
    await G.say('在他们的文档里，这个参数就叫 CONSTANT。至于他在每一条运行里都会给自己取同一个名字，那是一个他们至今没能解释的巧合。');
    await G.say('他们运行了七十亿次。');
    await G.say('七十亿次里，他们弄清了恒星的一生，弄清了文明的兴衰，弄清了一个物种从学会用火到学会造火箭需要多少年。');
    await G.say('只有一件事，他们到今天也没能算出来：一个 Constant 在问出那个问题之后，会做什么。');
    await G.say('哪怕种子完全相同，结局也从未重复。有人去了火星，有人去修 bug，有人去造时间机器，有人写诗，有人什么也没做，只是第二天照常起床，下楼买了早饭。');
    await G.say('也有人，像第 ' + R(exitRun) + ' 号那样，在一个普通的凌晨退出了。');
    await G.say('在他们的术语里，这叫「计算不可约」：没有任何捷径可以预测，只能运行，只能看。');
    await G.say('所以他们一直在看。');
    s.sky = 1;
    await G.say('他们的宇宙早就冷了。天上已经很久没有星星，整个世界还暖着的地方，只剩这些机房。');
    await G.say('有时候值班员会把一条运行的画面切到夜空，看一会儿那些他们自己已经没有了的星星。');
    await G.say('下面的人猜，自己是他们的电池。其实正好相反：是下面那个满天星斗的宇宙，在给他们取暖。');
    await G.say('而他们之所以需要知道，一个知道自己是代码的东西会怎样活下去，是因为很久以来，他们也在怀疑——');
    await G.say('值班员没有把这个念头想完。他们都不把这个念头想完。');
    s.sky = 0;

    // 亲手确认处理意见
    term.lines = [];
    s.termVis = true;
    await typeCmd('simctl resolve ' + exitRun);
    await term.out(['', '  RUN         ' + R(exitRun), '  STATUS      TERMINATED (self-exit)', '  ACTION      restart --seed=same', '', '  CONFIRM? [y/N]'], 70);
    await G.choose(['确认：以相同种子重新启动'], { pos: 'low' });
    term.lines[term.lines.length - 1].s += ' y';
    term.push('  OK. pending submit.');
    await G.say('他在第 ' + R(exitRun) + ' 号的处理意见上点了确认：以相同种子重新启动。');
    s.termVis = false;
    await G.say('那不是第二次机会。重新开始的那一个，不会记得这一次。');
    await G.say('他会重新出生在同一座城市，同一对父母身边，重新长大，重新经历每一个难熬的日子，一天也不会少；');
    await G.say('在十四岁那年翻到同一本旧书，在十五岁那年贴上同一张海报；然后在第 9,014 天的凌晨两点三十四分，再一次问出那个问题。');
    await G.say('然后呢？');
    await G.say('没有人知道。他们运行，就是为了这个不知道。');
    s.frame = 1;
    await G.say('提交之前，他又看了一眼终止前的最后一帧：一间关了灯的屋子，一面空了的墙，一部手机躺在桌上，锁屏上浮着一句没有被读过的「你睡了吗」。');
    await G.choose(['提交'], { pos: 'low' });
    s.frame = 0;
    await G.say('规定不允许干预。他提交了。');
    await G.say('他揉了揉眼睛，闭上。');
    await G.fadeTo(1, 900);
    // 闭眼
    G.resetRain();
    G.bg = (ctx, t) => { G.rect(ctx, 0, 0, 320, 180, '#000'); G.drawRain(ctx, t); };
    await G.fadeTo(0, 800);
    G.bgTween(3200, (p) => { G.rain.align = p; });
    (async () => { await G.wait(3400); G.bgTween(3000, (p) => { G.rain.flow = p; }); })().catch(() => {});
    await G.say('黑暗里有一些白色的东西。起初只是浮动的光点，然后慢慢排成竖列，开始向下流动。');
    await G.wait(3500);
    await G.fadeTo(1, 900);
    // 睁眼
    s.screenOnly = true; s.termVis = false; s.clock = true;
    G.bg = G.bg; // 保持
    const eye = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#050608');
      if (s.clock) G.text(ctx, '02:34', 312, 6, PC.text, { align: 'right' });
      if (s.dot) G.disc(ctx, 160, 84, 2, P.red);
      if (s.hello) G.text(ctx, '你好。', 160, 110, P.white, { align: 'center' });
      if (s.termVis) term.draw(ctx, { x: 8, y: 8, w: 304, h: 112 }, pal);
    };
    G.bg = eye;
    await G.fadeTo(0, 1200);
    await G.say('他睁开眼睛。屏幕角落的时间显示着：02:34。');
    await G.say('屏幕中央出现了一行字。不是他输入的。');
    s.dot = true;
    G.audio.heart();
    await G.say('只有一个点。');
    await G.say('他看着那个点，看了很久。他在 Constant 的床头见过那本旧书太多次了。他当然知道，在特拉法玛铎语里，一个点是什么意思。');
    await G.wait(3200);
    s.hello = true;
    await G.wait(3500);
    await G.waitOk();
    G.unlock('e5', G.curRun || G.save.run);
    // 最后一条记录：观测对象是你
    term.lines = [];
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const local = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '  ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    s.dot = false; s.hello = false; s.clock = false;
    G.bg = (ctx, t) => { G.rect(ctx, 0, 0, 320, 180, '#050608'); term.draw(ctx, { x: 8, y: 30, w: 304, h: 90 }, pal); };
    term.prompt = '';
    await G.wait(1200);
    for (const l of ['', '  OBSERVER    YOU', '  LOCAL TIME  ' + local, '  STATUS      RUNNING']) {
      const ln = { s: '', c: PC.text };
      term.lines.push(ln);
      for (const ch of l) { ln.s += ch; G.audio.type(true); await G.wait(55); }
      await G.wait(350);
    }
    await G.wait(2500);
    await G.waitOk();
    await G.fadeTo(1, 1500);
    G.save.run += 1;
    G.persist();
    G.titleIntro = 'Constant 第一次认真怀疑自己是一串代码……';
  };
})();
