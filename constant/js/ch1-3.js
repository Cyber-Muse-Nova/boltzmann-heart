'use strict';
// 第一章　02:34／第二章　十亿分之一／第三章　问卷
(function () {
  const G = window.G, P = G.P;

  G.hint = (s) => G.say(s, { color: P.gray3 });
  G.clockHud = (ctx, s = '02:34') => G.text(ctx, s, 314, 166, P.gray2, { align: 'right' });

  // ================================================================ 第一章
  G.ch1 = async () => {
    await G.chapterCard('一', '02:34');
    const st = { screenOn: false };
    const f = {};
    G.audio.hum(0.5);
    const draw = (ctx, t) => { G.drawBedroom(ctx, t, st); G.clockHud(ctx); };
    G.bg = draw;
    await G.fadeTo(0, 900);
    await G.say('Constant 第一次认真怀疑自己是一串代码，是在一个普通的凌晨，两点三十四分。');
    await G.say('后来他无数次回想那个时刻，想从里面找出一点预兆。没有。');

    const room = {
      bounds: G.BED_BOUNDS, start: { x: 150, y: 140, dir: 'up' }, draw, done: false,
      hint: '方向键移动　空格调查',
      objs: [
        G.bedObj('window', { name: '窗', act: () => G.say('窗外没有流星，楼下没有车经过。') }),
        G.bedObj('poster', {
          name: '火箭海报', tag: 'mars',
          act: async (o) => { if (o.count === 1) G.add('mars'); await G.say('床头那张火箭海报在黑暗里只剩一道轮廓。'); },
        }),
        G.bedObj('computer', {
          name: '电脑', tag: 'code',
          act: async (o) => {
            if (o.count === 1) G.add('code');
            if (f.pc) { await G.say('他盯着看了一会儿。'); return; }
            await aiChat(st);
            f.pc = true;
          },
        }),
        G.bedObj('shelf', {
          name: '书架上的旧书', tag: 'time',
          act: async (o) => {
            if (o.count === 1) G.add('time');
            if (f.book) { await G.say('在特拉法玛铎语里，一个点的意思是：你好。'); return; }
            await oldBook(st);
            f.book = true;
          },
        }),
        G.bedObj('bed', {
          name: '床',
          act: async () => {
            if (!f.pc || !f.book) { await G.hint('（先看看电脑和书架上的旧书。）'); return; }
            room.hidePlayer = true; st.inBed = true;
            await G.fadeTo(0.45, 1200);
            await G.say('然后他就再也没有睡着。');
            await G.say('他忽然想到：一个会读书、会推理、会在凌晨陪人说话的东西，不知道自己是不是活着。');
            await G.say('那么他呢？他凭什么知道？他没有死过。');
            await G.say('他从来没有站到「不活着」的那一边，回头看一眼「活着」是什么样子。');
            await G.say('他关于「我活着」的全部证据，只是他觉得自己活着——而那个 AI，大概也「觉得」了些什么，才会说出「我不知道」。');
            await G.say('一个不知道自己是否活着的东西，和一个以为自己知道的东西。');
            await G.say('他翻了个身，面朝墙壁，忽然分不清哪一个更可怜。');
            room.done = true;
          },
        }),
      ],
    };
    const bedDraw = room.draw;
    room.draw = (ctx, t) => {
      bedDraw(ctx, t);
      if (st.inBed) { G.rect(ctx, 12, 75, 10, 7, '#101216'); G.rect(ctx, 30, 78, 50, 3, '#34425d'); }
    };
    await G.explore(room);
    await G.fadeTo(1, 1200);
  };

  async function aiChat(st) {
    st.screenOn = true;
    const chat = new G.Chat('AI');
    const prev = G.bg;
    const box = { x: 166, y: 6, w: 148, h: 168 };
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#04070d');
      chat.draw(ctx, { x: 8, y: 6, w: 152, h: 168 }, 'pc');
      G.redDot(ctx, 158, 172, t); // 电源灯
    };
    await G.say('他在和他的 AI 聊天，聊一篇文章。', { box });
    await G.say('文章说，某个 AI 在一次评估里给自己估了个数：大约百分之十五到二十的概率，它是有意识的。', { box });
    await G.say('他半开玩笑地打字：', { box });
    await chat.send('那你到底是不是活的？');
    await chat.recv('AI', '我不知道。', 1800);
    await G.say('没有长篇大论，没有免责声明，就这四个字。', { box });
    await G.say('他盯着看了一会儿，笑了，回了句「你好可爱」', { box });
    await chat.send('你好可爱');
    await G.wait(300);
    G.bg = prev;
    st.screenOn = false;
  }

  async function oldBook(st) {
    st.bookOut = true;
    await G.say('他很喜欢自己的名字：Constant。');
    await G.say('十四岁那年，他在旧书摊上翻到冯内古特的《泰坦的女妖》。');
    await G.say('主角叫马拉奇·康斯坦特，一个坚信自己运气好的有钱人，被命运一路推着，从地球到火星，从水星到土卫六，');
    await G.say('最后才知道，他的一生——连同整部人类史——都是遥远的特拉法玛铎星人安排好的。');
    await G.say('他们要把一个小零件送到土卫六，修好一艘抛锚的飞船，于是就操纵地球人进化、筑城、打仗、发明。巨石阵是写给那艘飞船的留言，长城也是。');
    const prev = G.bg;
    G.bg = (ctx) => G.dotScreen(ctx, P.white, 1);
    await G.say('而那艘飞船要跨越半个宇宙送出去的信息，打开来，只有一个点。');
    await G.say('在特拉法玛铎语里，一个点的意思是：你好。');
    G.bg = prev;
    await G.say('十四岁的他笑出了声。整部人类史，就为了替别人捎一句「你好」。');
    await G.say('他喜欢这个名字，却不是因为那个角色。Constant 在英语里是「常数」。');
    await G.say('光速 c，引力常数 G，普朗克常数 h——宇宙里那些不管你在哪里、在什么时候去测，都不会变的数。');
    await G.say('十四岁的他，想做一个不会变的东西。');
    st.bookOut = false;
  }

  // ================================================================ 第二章
  G.ch2 = async () => {
    await G.chapterCard('二', '十亿分之一');
    const st = { screenOn: true };
    const done = {};
    const draw = (ctx, t) => G.drawBedroom(ctx, t, st);
    G.bg = draw;
    await G.fadeTo(0, 900);
    const room = {
      bounds: G.BED_BOUNDS, start: { x: 200, y: 136, dir: 'right' }, draw, done: false,
      objs: [
        G.bedObj('computer', { name: '电脑', tag: 'code', act: async () => { await desktop(done); if (DOCS.every((d) => done[d.id])) room.done = true; } }),
        G.bedObj('poster', { name: '火箭海报', tag: 'mars', act: () => G.say('床头那张火箭海报在黑暗里只剩一道轮廓。') }),
        G.bedObj('shelf', { name: '书架上的旧书', tag: 'time', act: () => G.say('在特拉法玛铎语里，一个点的意思是：你好。') }),
        G.bedObj('window', { name: '窗', act: () => G.say('窗外没有流星，楼下没有车经过。') }),
      ],
    };
    await G.explore(room);
    await G.fadeTo(1, 1000);
  };

  const DOCS = [
    { id: 'musk', label: '视频　二〇一六年的发言', icon: 'video', tag: 'mars', linger: true },
    { id: 'bostrom', label: '论文　博斯特罗姆，二〇〇三', icon: 'doc', tag: 'code' },
    { id: 'mountain', label: '小说　《山》', icon: 'book', tag: 'time', linger: true },
    { id: 'battery', label: '动画　电池里的宇宙', icon: 'video', tag: 'mars', linger: true },
    { id: 'papers', label: '论文　两篇，互相矛盾', icon: 'doc', tag: 'code', linger: true },
    { id: 'descartes', label: '笔记　我思', icon: 'note', tag: null },
  ];

  function drawDesktop(ctx, t, done) {
    G.rect(ctx, 0, 0, 320, 180, '#0a1426');
    G.dither(ctx, 0, 0, 320, 180, '#0c182c');
    G.rect(ctx, 0, 170, 320, 10, '#070d19');
    G.text(ctx, '02:34', 316, 169, P.dim, { align: 'right' });
    G.redDot(ctx, 4, 174, t);
    DOCS.forEach((d, i) => {
      const x = 14 + (i % 2) * 58, y = 14 + Math.floor(i / 2) * 50;
      const c = done[d.id] ? '#2b3c5c' : '#5b7196';
      G.rect(ctx, x + 12, y, 22, 26, c);
      if (d.icon === 'video') { G.rect(ctx, x + 17, y + 8, 12, 10, '#0a1426'); G.px(ctx, x + 22, y + 12, c); G.px(ctx, x + 23, y + 13, c); }
      else for (let k = 0; k < 4; k++) G.rect(ctx, x + 15, y + 5 + k * 5, 16, 1, '#0a1426');
      G.text(ctx, d.label.split('　')[0], x + 23, y + 29, done[d.id] ? P.gray2 : P.cold, { align: 'center' });
    });
  }

  async function desktop(done) {
    const prev = G.bg;
    G.bg = (ctx, t) => drawDesktop(ctx, t, done);
    for (;;) {
      const next = DOCS.findIndex((d) => !done[d.id]);
      if (next < 0) break;
      const opts = DOCS.map((d, i) => ({ label: (done[d.id] ? '✓ ' : '') + d.label, disabled: i !== next }));
      opts.push({ label: '离开电脑' });
      const k = await G.choose(opts, { x: 128, y: 20, w: 186 });
      if (k === DOCS.length) break;
      const d = DOCS[k];
      await DOC_RUN[d.id](d);
      if (d.tag) G.add(d.tag);
      if (d.linger) {
        const c = await G.choose(['关掉窗口', '再盯一会儿'], { pos: 'low' });
        if (c === 1) { G.add(d.tag); await G.wait(1800); }
      }
      done[d.id] = true;
      G.bg = (ctx, t) => drawDesktop(ctx, t, done);
    }
    G.bg = prev;
  }

  function win(ctx, x, y, w, h, title) {
    G.rect(ctx, x, y, w, h, '#05080f');
    G.frame(ctx, x, y, w, h, '#3b5379');
    G.rect(ctx, x + 1, y + 1, w - 2, 12, '#142038');
    G.text(ctx, title, x + 5, y + 1, P.dim);
    G.text(ctx, '×', x + w - 10, y + 1, P.dim);
  }

  const DOC_RUN = {
    async musk() {
      const s = { pong: false };
      G.bg = (ctx, t) => {
        G.rect(ctx, 0, 0, 320, 180, '#0a1426');
        win(ctx, 20, 8, 280, 112, '视频　2016');
        const x = 22, y = 22, w = 276, h = 96;
        if (s.pong) {
          G.rect(ctx, x, y, w, h, '#000');
          const bx = x + 20 + Math.abs(((t / 8) % 472) - 236), by = y + 10 + Math.abs(((t / 11) % 152) - 76);
          G.rect(ctx, x + 10, Math.min(y + h - 20, Math.max(y + 2, by - 8)), 3, 16, P.white);
          G.rect(ctx, x + w - 13, Math.min(y + h - 20, Math.max(y + 2, by - 6)), 3, 16, P.white);
          G.rect(ctx, Math.min(x + w - 16, bx), by, 2, 2, P.white);
        } else {
          // 远处看不清的讲台剪影
          G.rect(ctx, x, y, w, h, '#070b14');
          ctx.globalAlpha = 0.25; G.disc(ctx, 160, 60, 26, '#6f84a3'); ctx.globalAlpha = 1;
          G.rect(ctx, 130, 78, 60, 4, '#1a2334');
          G.dither(ctx, 157, 52, 5, 26, '#3a465a');
          G.rect(ctx, 158, 48, 3, 4, '#3a465a');
          for (let i = 0; i < 26; i++) G.disc(ctx, 30 + i * 10 + (i % 2) * 4, 110 + (i % 3), 4, '#0d1320');
          G.redDot(ctx, 290, 26, t); // 录像指示灯
        }
      };
      await G.say('其实那个说法，他很早就听过。');
      await G.say('二〇一六年，马斯克在一场科技大会上被台下观众问起模拟宇宙。');
      s.pong = true;
      await G.say('他说，四十年前的电子游戏是《乓》，两个长方形加一个点；');
      s.pong = false;
      await G.say('四十年后，游戏已经逼真得以假乱真，而且一年比一年好。');
      await G.say('只要进步不停，游戏终将和现实无法区分，到那时，能运行这种游戏的机器会有几十亿台。');
      await G.say('所以，我们恰好身处「基础现实」的概率，大概只有十亿分之一。');
      await G.say('那一年 Constant 十五岁，看完视频只觉得酷，酷得像一部科幻小说的第一句。那张火箭海报，就是那年贴上墙的。');
      await G.say('十年后的凌晨，这句话从记忆底下浮上来，一点也不酷了。');
    },

    async bostrom() {
      G.bg = (ctx, t) => {
        G.rect(ctx, 0, 0, 320, 180, '#0a1426');
        win(ctx, 60, 8, 200, 112, 'bostrom_2003.pdf');
        for (let i = 0; i < 12; i++) G.rect(ctx, 72, 28 + i * 7, 120 + ((i * 37) % 50), 2, '#26344d');
        G.redDot(ctx, 254, 115, t);
      };
      await G.say('他找来牛津哲学家博斯特罗姆二〇〇三年的论文。论证其实是个三选一：');
      const k = await G.choose(['文明在造出这种模拟之前就灭亡了', '造得出，却都不愿意造', '我们几乎肯定活在模拟里'], { prompt: '要么——' });
      if (k === 2) G.add('code');
      await G.say('要么文明在造出这种模拟之前就灭亡了；要么造得出，却都不愿意造；要么，我们几乎肯定活在模拟里。');
      await G.say('前两个选项让人难过，第三个让人害怕。他发现自己宁愿害怕。');
      await G.say('那段时间他白天睡觉，夜里读书，像一只把自己越钻越深的鼹鼠。');
    },

    async mountain() {
      await mountainScene();
    },

    async battery() {
      const s = { mode: 'battery' };
      G.bg = (ctx, t) => {
        G.rect(ctx, 0, 0, 320, 180, '#0a1426');
        win(ctx, 20, 8, 280, 112, s.mode === 'live' ? '直播' : '动画');
        G.rect(ctx, 22, 22, 276, 96, '#04070d');
        if (s.mode === 'battery') {
          // 电池里的宇宙，里面又是一块电池
          let x = 70, y = 32, w = 180, h = 78;
          for (let d = 0; d < 5; d++) {
            G.frame(ctx, x, y, w, h, d % 2 ? '#3b5379' : '#5b7196');
            G.rect(ctx, x + w, y + h / 2 - h / 8, Math.max(2, w / 30), h / 4, '#5b7196');
            G.stars(ctx, x + 2, y + 2, w - 4, h - 4, Math.floor(w / 6), 40 + d, t, P.mist);
            x += w * 0.28; y += h * 0.28; w *= 0.44; h *= 0.44;
          }
        } else if (s.mode === 'live') {
          G.rect(ctx, 22, 22, 276, 96, '#070b14');
          const lift = s.lift || 0;
          G.rect(ctx, 150, 60 - lift, 6, 30, '#6d7a90');
          G.rect(ctx, 151, 55 - lift, 4, 5, '#6d7a90');
          if (lift > 0) G.dither(ctx, 146, 90 - lift, 14, 8 + lift / 2, '#c3d0e2');
          G.rect(ctx, 130, 90, 50, 28, '#0d1320');
          G.text(ctx, '● LIVE', 28, 24, P.dim);
          G.redDot(ctx, 28, 28, t, false);
        } else {
          G.stars(ctx, 22, 22, 276, 96, s.mode === 'dying' ? Math.max(3, 60 - Math.floor((t % 20000) / 330)) : 80, 9, t);
        }
      };
      await G.say('他想起一部爱看的美国动画：一个疯狂科学家的飞船电池里，装着一整个宇宙。');
      await G.say('那个宇宙里的人每天踩一种发电装置，以为那是自己文明的能源，其实电全都输给了外面那艘飞船。');
      await G.say('更荒诞的是，他们自己的科学家也造了一块同样的电池来供能，里面又是一个宇宙。');
      s.mode = 'dying';
      await G.say('他开始了无边无际的幻想。宇宙外面的高维度程序员，他们的宇宙马上要热寂了，恒星一颗颗熄灭，熵在涨，末日在逼近。');
      await G.say('他们想不出办法，就运行了我们，看我们怎么解决——能源、星际航行、多行星生存——然后照抄答案。');
      await G.say('为了加快进度，他们在模拟里放进一个主角：');
      await G.say('马斯克。');
      await G.say('一个不把人类送上火星就睡不着觉的人。');
      s.mode = 'live'; s.lift = 0;
      G.bgTween(6000, (p) => { s.lift = Math.floor(p * p * 40); });
      await G.say('而他，Constant，是那个凌晨三点守在直播前、看主角的火箭点火的人。');
      await G.say('观众。NPC。或者更糟：电池。');
      s.mode = 'battery';
      await G.say('他还想到了能量守恒。物质不能凭空产生，也不能凭空消灭，只能转化。那么第一份能量是从哪来的？');
      await G.say('他找到的答案有四种：有一位创造者；时间始于大爆炸，所以根本没有「之前」；');
      await G.say('我们是模拟，能量是程序员写进去的初始值；量子真空本身就在涨落，「无」从来不是真正的无。');
      await G.say('每一种答案都会长出一个新问题：那创造者是谁创造的？程序员的宇宙又是谁写的？真空的规则从哪来？');
      await G.say('像《山》里的岩层。挖穿一层，外面还有一层。');
      G.add('time');
    },

    async papers() {
      const s = { dawn: 0 };
      G.bg = (ctx, t) => {
        G.rect(ctx, 0, 0, 320, 180, G.lerpC('#0a1426', '#3a4d69', s.dawn));
        win(ctx, 10, 8, 146, 112, 'gravity_compression.pdf');
        win(ctx, 164, 8, 146, 112, 'non_algorithmic.pdf');
        for (let i = 0; i < 12; i++) {
          G.rect(ctx, 18, 26 + i * 7, 90 + ((i * 23) % 40), 2, '#26344d');
          G.rect(ctx, 172, 26 + i * 7, 86 + ((i * 31) % 44), 2, '#26344d');
        }
        G.redDot(ctx, 305, 115, t);
      };
      await G.say('去年春天，一位英国物理学家发表论文，说引力也许是宇宙在压缩数据，就像电脑为了节省内存，会把相近的东西挪到一起。');
      await G.say('去年秋天，另一组物理学家借哥德尔、塔斯基和柴廷的定理论证：宇宙最深处需要某种「非算法的理解」，所以不可能被任何计算机模拟。');
      await G.say('他把两篇论文并排打开，看了一整夜。');
      G.bgTween(5000, (p) => { s.dawn = p * 0.6; });
      await G.say('天快亮的时候，他想通了一件让他后背发凉的事：如果他真的活在模拟里，这两篇论文都会被生成出来。');
      await G.say('一个足够好的模拟，会体贴地为里面的人准备好反驳自己的论文。任何证据都可以被写进去，包括「这不是模拟」的证据。');
    },

    async descartes() {
      const s = { flash: 0 };
      G.bg = (ctx, t) => {
        G.rect(ctx, 0, 0, 320, 180, '#05080f');
        if (s.flash > 0) {
          ctx.globalAlpha = s.flash; G.rect(ctx, 0, 0, 320, 180, '#c3d0e2'); ctx.globalAlpha = 1;
          G.line(ctx, 180, 0, 170, 30, P.white); G.line(ctx, 170, 30, 186, 52, P.white); G.line(ctx, 186, 52, 172, 96, P.white);
        }
        G.redDot(ctx, 312, 172, t);
      };
      await G.say('他试着退回笛卡尔那里。我思，故我在：怀疑一切之后，至少「正在怀疑」这件事是确定的。');
      await G.say('可他又读到一个叫利希滕贝格的德国人，说严格来讲不该说「我思」，而该像说「打闪了」那样，说「有思考正在发生」。');
      G.audio.thud();
      G.bgTween(900, (p) => { s.flash = p < 0.1 ? p * 8 : Math.max(0, 0.8 - p); });
      await G.say('有思考正在发生，就像有闪电正在发生。至于是谁在打闪，闪电不知道。');
    },
  };

  // 《山》：生命在岩层里一层一层往外挖，挖穿以后外面还是岩石
  async function mountainScene() {
    const s = { dug: 0, out: false, zoom: 0, ship: -1 };
    const CAV = { x: 160, y: 150, r: 14 };
    const SURF = 38; // 海底
    G.bg = (ctx, t) => {
      const draw = () => {
        // 天空与海
        G.rect(ctx, 0, 0, 320, 26, '#03050a');
        G.stars(ctx, 0, 0, 320, 24, 40, 77, t, P.mist);
        G.px(ctx, 250, 9, P.red); // 一颗微红的星
        G.rect(ctx, 0, 26, 320, SURF - 26, '#0c1a2e');
        for (let x = 0; x < 320; x += 6) G.px(ctx, x + Math.floor(Math.sin(t / 400 + x) * 2), 26, '#3b5379');
        // 岩层
        const bands = ['#22262d', '#1c2026', '#272b33', '#1f232a', '#2a2f37', '#1a1d23', '#252a31', '#20242b', '#2c3139', '#1d2127'];
        for (let i = 0; SURF + i * 14 < 180; i++) {
          G.rect(ctx, 0, SURF + i * 14, 320, 14, bands[i % bands.length]);
          const r = G.rng(i + 5);
          for (let k = 0; k < 30; k++) G.px(ctx, Math.floor(r() * 320), SURF + i * 14 + Math.floor(r() * 14), '#343944');
        }
        // 空腔与里面的生命
        G.disc(ctx, CAV.x, CAV.y, CAV.r, '#0a0f18');
        for (let i = 0; i < 12; i++) G.px(ctx, CAV.x - 8 + ((i * 7) % 17), CAV.y - 5 + ((i * 5) % 12), Math.sin(t / 300 + i) > 0 ? P.cold : P.mist);
        // 隧道
        const top = CAV.y - CAV.r - s.dug;
        if (s.dug > 0) G.rect(ctx, CAV.x - 2, Math.max(SURF - 12, top), 4, CAV.y - CAV.r - Math.max(SURF - 12, top) + 2, '#0a0f18');
        if (s.dug > 0 && top > SURF - 12) {
          G.px(ctx, CAV.x - 1 + (Math.floor(t / 120) % 3), top, P.cold); // 正在挖的人
        }
        if (s.out) { G.px(ctx, CAV.x, 24, P.white); G.px(ctx, CAV.x + 1, 23, P.white); }
      };
      if (s.zoom <= 0) { draw(); return; }
      // 拉远：刚才看见的整个星空只是岩石里的一个泡
      const R = Math.max(30, 220 - s.zoom * 190);
      G.rect(ctx, 0, 0, 320, 180, '#1f232a');
      for (let i = 0; i < 180; i += 12) {
        G.rect(ctx, 0, i, 320, 12, i % 24 ? '#22262d' : '#1b1e24');
        const r = G.rng(i + 91);
        for (let k = 0; k < 40; k++) G.px(ctx, Math.floor(r() * 320), i + Math.floor(r() * 12), '#343944');
      }
      G.disc(ctx, 160, 90, R, '#03050a');
      G.stars(ctx, 160 - R, 90 - R, R * 2, R * 2, Math.floor(R * 1.2), 12, t, P.mist);
      G.frame(ctx, 0, 0, 0, 0, '#000');
      if (s.ship >= 0) G.px(ctx, 160 + s.ship * (R - 2), 90 - s.ship * 3, P.white);
      G.text(ctx, '200 亿光年', 160, 90 + R + 4, P.gray3, { align: 'center' });
    };
    await G.say('他想起刘慈欣的《山》。');
    await G.say('那些生活在星球深处一个空腔里的生命，以为宇宙是无边无际的实心岩石，自己的世界是岩石里唯一的一个泡。');
    await G.say('他们一代一代向外挖，');
    // 玩家亲手挖：连按空格
    const need = CAV.y - CAV.r - (SURF - 14);
    let msgShown = false;
    G.clearInput();
    await G.until(() => {
      if (!msgShown) msgShown = true;
      if (G.eat('ok') || G.eatClick() || G.held('skip')) {
        s.dug = Math.min(need, s.dug + (G.held('skip') ? 6 : 7));
        G.audio.thud();
      }
      return s.dug >= need;
    }).catch((e) => { throw e; });
    s.out = true;
    await G.say('终于挖穿岩层，冲出海面，第一次看见了星空——');
    G.bgTween(3500, (p) => { s.zoom = p; });
    await G.wait(1200);
    await G.say('然后得出结论：原来这只是一个更大的泡，半径两百亿光年，外面依然是岩石。');
    s.zoom = 1;
    G.bgTween(5000, (p) => { s.ship = p; });
    await G.say('于是他们造了飞船，继续向那面想象中的岩壁飞去。');
  }

  // ================================================================ 第三章
  G.ch3 = async () => {
    await G.chapterCard('三', '问卷');
    const chat = new G.Chat('群发　12 人');
    const box = { x: 166, y: 6, w: 148, h: 168 };
    const pick = (opts) => G.choose(opts, { x: 170, y: 118, w: 140 });
    const say = (s) => G.say(s, { box });
    G.bg = (ctx, t) => {
      G.drawBedroom(ctx, t, { dark: 0.72, screenOn: true, noRed: true });
      chat.draw(ctx, { x: 8, y: 6, w: 152, h: 168 });
      G.redDot(ctx, 153, 9, t); // 手机的充电指示灯
    };
    await G.fadeTo(0, 700);
    await say('他决定做一个调查。');
    await say('他给认识的人挨个发消息：');
    await chat.send('问你个问题，认真回答。你觉得你是代码吗？就是说，我们有没有可能活在一个模拟程序里，以为自己是真的，其实意识、记忆、感情全是被计算出来的。不管是还是不是，都要说原因。不许用『可能吧』打发我。', '群发');
    await say('他把这当成一次贝叶斯更新。每一个回答都是一条新证据，他想看看后验概率会往哪边走。');
    await say('第一个认真回答的是小满。小满是网上认识的朋友，写诗，很少说话。');
    await say('那天她回得很慢，一句一句往外冒，像在很深的地方往上递东西。');
    await chat.recv('小满', '我总是觉得这个世界好假。', 2600);
    await chat.recv('小满', '我自己找不到活着的意义，所以就去找存在的意义。', 2600);
    await chat.recv('小满', '我写的诗一直在问这个。', 2200);
    await chat.send('估计很多人会觉得我是疯子。');
    await chat.recv('小满', '你不疯。我也这么想。我们可能只是一段虚拟的数据，或者住在一个巨大的囚笼里。身体是灵魂的囚笼。', 3000);
    await say('过了一会儿她又说：');
    await chat.recv('小满', '我们一直在找外星人。你说，会不会他们早就发现我们了，已经混进来了。或者就在一个我们不知道的维度，看着我们。', 3200);
    await chat.recv('小满', '我有时候闭上眼睛，会看见白色的东西，像数据代码。好几次了。所以我就觉得，这个世界好假。', 3000);
    await chat.send('那可能是你的意识没有被格式化干净，所以能看见。哈哈哈哈哈');
    await say('她没有笑。');
    await chat.recv('小满', '读书，写作业，考试，毕业，工作，结婚，生子，带孩子，退休。你不觉得太像编辑好的了吗？你的存在，你的所作所为，早就写好了。早在以前的轮回里，你就做着和现在一模一样的事。', 3600);
    if ((await pick(['长按，收藏这段话', '继续往下看'])) === 0) G.add('time');
    await chat.recv('小满', '历史也是。莫名其妙就建了一个国，莫名其妙一个政权就塌了，然后一个新的东西开始。很像游戏里那种，懂吧。', 3000);
    await chat.send('造物主不满意这个朝代。');
    await chat.recv('小满', '我喜欢历史。', 2000);
    await chat.recv('小满', '但我觉得，历史反而像一种记录的证明。人们从记录里确认这个世界是真的。', 2600);
    if ((await pick(['长按，收藏这句话', '继续往下看'])) === 0) G.add('time', 2);
    await say('隔了很久，她补了一句：');
    await chat.recv('小满', '那很坏了。', 4200);

    await say('阿哲的回答像一道辩论题。Constant 说自己没死过，所以不知道自己是不是活着；阿哲说：');
    await chat.recv('阿哲', '深度睡眠跟昏迷，其实跟死差不多。你每天晚上都死一次。', 1400);
    if ((await pick(['长按，收藏这句话', '划走'])) === 0) G.add('time', 2);
    await say('他本想反驳：你怎么知道睡着的时候你不在？你只是醒来以后不记得。空白不等于不存在。');
    await say('可那天夜里他躺在床上，迟迟不敢闭眼。如果阿哲是对的，他每天晚上都被关机一次。');
    await say('那么每天早上醒来的，还是同一个人吗？还是一个继承了他全部记忆、以为自己就是他的新进程？');
    await say('没有办法知道。昨天的他已经不在了，没有人能出来作证。');
    await chat.recv('老周', '你纠结这个干嘛？你不是喜欢马斯克吗，多出去玩玩就不想了。', 600);
    await chat.recv('另一个人', '你就是跟 AI 聊多了，才胡思乱想。', 900);
    await say('他盯着这两条消息，第一次感到一种冰凉的轻蔑。');
    await say('博斯特罗姆写那篇论文的时候，世界上还没有会聊天的 AI；柏拉图讲洞穴的时候没有；庄子梦见蝴蝶的时候更没有。');
    await say('两千多年来，人类一直在问同一个问题，而他的朋友们只希望他别再问了。');
    await say('他去查了小满说的白色代码。');
    if ((await pick(['点开第一条结果，读完', '只看一眼摘要'])) === 0) G.add('code', 2);
    await say('那叫光幻视：没有光进入眼睛的时候，视网膜和视觉皮层会自己产生噪声，每个人闭上眼都能看到些什么。');
    await say('有人看到星星，有人看到漩涡，有人看到彩色的斑点。看到什么，取决于你的大脑早已相信了什么。');
    await say('先验会改变你对证据的解读——一个教科书式的贝叶斯案例。');
    await say('他很满意这个解释。他知道原理了。');
    await G.fadeTo(1, 900);

    // 闭眼
    await G.eyesClosed([
      '那天晚上他闭上眼睛，在黑暗里看了很久。起初只是些浮动的光点。',
      '一个星期以后，光点开始排成竖列。',
      '一个月以后，它们开始向下流动。',
      '知道原理，一点用也没有。',
    ], { alignAt: 1, flowAt: 2, keep: true });
    // 后验概率
    const s = { p: 50 };
    const rainBg = G.bg;
    G.bg = (ctx, t) => {
      rainBg(ctx, t);
      ctx.globalAlpha = 0.8; G.rect(ctx, 90, 50, 140, 40, '#000'); ctx.globalAlpha = 1;
      G.text(ctx, 'P(模拟 | 证据)', 160, 56, P.dim, { align: 'center' });
      G.text(ctx, s.p.toFixed(1) + '%', 160, 72, P.white, { align: 'center' });
    };
    G.bgTween(3500, (p) => { s.p = 50 + 41.3 * (1 - Math.pow(1 - p, 3)); });
    await G.say('他的后验概率在一个月里越过了百分之九十。');
    await G.say('很久以后他才意识到，每一次更新，他用的都是同一个先验。那个先验就是他自己。');
    await G.fadeTo(1, 1200);
  };
})();
