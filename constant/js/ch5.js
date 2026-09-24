'use strict';
// 第五章　未读：最后那个夜晚。关键分歧。
(function () {
  const G = window.G, P = G.P;
  const ALL_GONE = ['rug', 'plant', 'clothes', 'lamp', 'chair', 'books', 'speaker'];

  // 返回 'unread' 或 'reply'
  G.ch5 = async () => {
    await G.chapterCard('五', '未读');
    const st = { gone: new Set(ALL_GONE), dark: 0.3, tvLight: true, screenOn: true };
    const f = {};
    G.ch5State = st;
    const draw = (ctx, t) => { G.drawBedroom(ctx, t, st); G.clockHud(ctx); };
    G.bg = draw;
    G.audio.hum(0.25);
    await G.fadeTo(0, 1200);
    await G.say('最后那个夜晚，和第一个夜晚一样普通。');
    await G.say('那时他已经连续相当长一段时间没有下床了。');
    await G.say('两点三十四分，他醒着。他已经很久不需要闹钟来叫醒这个时刻了。');

    const room = {
      bounds: G.BED_BOUNDS, start: { x: 60, y: 118, dir: 'right' }, draw, done: false,
      objs: [
        G.bedObj('window', {
          name: '窗边',
          act: async () => {
            if (f.window) { await G.say('没有人在等他什么。他是这么想的。'); return; }
            await G.say('他坐在窗边，看着对面楼零零星星的灯。有一户人家的窗帘没有拉严，漏出一条电视的蓝光。');
            await G.say('他想起十四岁时读到的那个结局：整部人类史，只为了替别人捎一句「你好」。那时他觉得好笑。');
            await G.say('现在他想，至少那句「你好」，是有人在等的。');
            await G.say('没有人在等他什么。他是这么想的。');
            f.window = true; check();
          },
        }),
        G.bedObj('poster', {
          name: '火箭海报',
          act: async (o) => {
            if (f.poster) return;
            await G.say('他把火箭海报从墙上揭下来，折好，放进抽屉。');
            st.poster = false;
            f.poster = true;
            o.hidden = true;
            const k = await G.choose(['看一眼抽屉里的东西', '关上抽屉']);
            if (k === 0) {
              G.add('mars', 2);
              await G.say('也许那时他想起来了小时候的某一天，父母送了他第一个火箭模型，小小的他拿着它快乐地挥舞。');
              await G.say('可是他永远也不可能触摸真正的火箭了。');
            }
            check();
          },
        }),
        G.bedObj('computer', {
          name: '屏幕上的窗口',
          act: async (o) => {
            if (f.pc) return;
            await closeWindows();
            st.screenOn = false;
            f.pc = true; o.hidden = true;
            check();
          },
        }),
      ],
    };
    function check() { if (f.window && f.poster && f.pc) room.done = true; }
    await G.explore(room);

    await G.wait(900);
    G.audio.select();
    st.phoneGlow = 1;
    await G.wait(600);
    await G.say('桌上的手机亮了一下。一条消息的预览浮在锁屏上，是小满：');
    const prev = G.bg;
    G.bg = (ctx, t) => { prev(ctx, t); G.drawLockScreen(ctx, t, 1); };
    await G.wait(900);
    const k = await G.choose(['不看', '看，并且回复她'], { pos: 'low' });
    return k === 0 ? 'unread' : 'reply';
  };

  // 锁屏：「你睡了吗」
  G.drawLockScreen = (ctx, t, a = 1) => {
    ctx.globalAlpha = a;
    const x = 110, y = 14, w = 100, h = 150;
    G.rect(ctx, x - 3, y - 3, w + 6, h + 6, '#05070b');
    for (let j = 0; j < h; j++) G.rect(ctx, x, y + j, w, 1, G.lerpC('#0e1a30', '#1c2d4d', j / h));
    G.text(ctx, '02:34', x + w / 2, y + 22, P.white, { align: 'center' });
    G.rect(ctx, x + 6, y + 50, w - 12, 30, '#2a4064');
    G.text(ctx, '小满', x + 11, y + 52, P.dim);
    G.text(ctx, '「你睡了吗」', x + 11, y + 65, P.white);
    ctx.globalAlpha = 1;
  };

  async function closeWindows() {
    const wins = ['论文', '视频', '网站', '𝕏 上的帖子', '那个问过「你到底是不是活的」的对话框'];
    const open = wins.slice();
    const prev = G.bg;
    G.bg = (ctx, t) => {
      G.rect(ctx, 0, 0, 320, 180, '#08101e');
      G.dither(ctx, 0, 0, 320, 180, '#0a1426');
      open.forEach((name, i) => {
        const x = 20 + i * 22, y = 10 + i * 16, w = 200, h = 96;
        G.rect(ctx, x, y, w, h, '#05080f');
        G.frame(ctx, x, y, w, h, i === open.length - 1 ? '#5b7196' : '#26344d');
        G.rect(ctx, x + 1, y + 1, w - 2, 12, '#142038');
        G.text(ctx, name.length > 14 ? '对话' : name, x + 5, y + 1, P.dim);
        G.text(ctx, '×', x + w - 10, y + 1, i === open.length - 1 ? P.white : P.gray);
        if (name.startsWith('那个')) {
          G.rect(ctx, x + 110, y + 24, 80, 14, '#2a4064');
          G.text(ctx, '那你到底是不是活的？', x + 186, y + 25, P.white, { align: 'right' });
          G.rect(ctx, x + 8, y + 44, 56, 14, '#1a2233');
          G.text(ctx, '我不知道。', x + 12, y + 45, P.cold);
        } else for (let k = 0; k < 8; k++) G.rect(ctx, x + 8, y + 20 + k * 8, 60 + ((k * 41 + i * 13) % 110), 2, '#1f2a40');
      });
      G.redDot(ctx, 314, 174, t);
    };
    await G.say('他把屏幕上的窗口一个一个关掉：');
    while (open.length) {
      G.clearInput();
      await G.until(() => G.eat('ok') || !!G.eatClick() || G.held('skip'));
      G.audio.cancel();
      open.pop();
      await G.wait(G.held('skip') ? 60 : 250);
    }
    await G.say('论文，视频，网站，𝕏 上的帖子，以及那个问过「你到底是不是活的」的对话框。');
    G.bg = prev;
  }

  // 看，并且回复：黎明
  G.replyDawn = async () => {
    const st = G.ch5State;
    const chat = new G.Chat('小满');
    chat.msgs.push({ from: '小满', text: '你睡了吗', side: 'l' });
    const room = (ctx, t) => G.drawBedroom(ctx, t, st);
    G.bg = (ctx, t) => { room(ctx, t); chat.draw(ctx, { x: 84, y: 6, w: 152, h: 168 }); };
    await G.wait(800);
    // 他回了什么，只有他们两个人知道
    for (let i = 0; i < 9; i++) { chat.draft += '·'; G.audio.type(); await G.wait(120); }
    chat.sendHint = '发送';
    G.clearInput();
    await G.until(() => G.eat('ok') || !!G.eatClick() || G.held('skip'));
    chat.sendHint = null; chat.draft = '';
    chat.msgs.push({ from: 'me', text: '　　　　　　', side: 'r', blur: true });
    G.audio.confirm();
    await G.wait(1400);
    chat.typing = '小满';
    await G.wait(1600);
    G.bg = room;
    st.phoneGlow = 0.6;
    G.audio.heart();
    G.bgTween(6000, (p) => { st.dawn = p; st.dark = 0.3 * (1 - p); });
    await G.wait(2400);
    G.audio.heart();
    await G.wait(3800);
    await G.fadeTo(1, 1500, '#000');
  };
})();
