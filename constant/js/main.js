'use strict';
// 流程：内容提示 → 标题 → 一局（第一至五章 → 结局）→ 标题
(function () {
  const G = window.G;

  G.playRun = async () => {
    const run = G.save.run;
    G.save.run += 1;
    G.save.runs += 1;
    G.persist();
    G.curRun = run;
    G.tend = { code: 0, mars: 0, time: 0 };
    G.ch5State = null;
    await G.ch1();
    await G.ch2();
    await G.ch3();
    await G.ch4();
    const r = await G.ch5();
    G.persist();
    if (r === 'unread') {
      await G.e1(run);
      noteUnlock('e1');
    } else {
      await G.replyDawn();
      const k = G.route();
      await G[k](run);
      noteUnlock(k);
    }
    G.persist();
  };

  const before = {};
  function snapshot() { for (const e of G.ENDINGS) before[e.id] = !!G.save.endings[e.id]; }
  function noteUnlock(k) {
    if (!before[k] && G.save.endings[k]) G.lastUnlocked = G.ENDINGS.find((e) => e.id === k).name;
  }

  function reset() {
    G.aborting = false;
    G.waiters = [];
    G.ui = [];
    G.overlay = null;
    G.sceneUpdate = null;
    G.after = null;
    G.lockInput = false;
    G.onMenu = null;
    G.fade = 1;
    G.fadeColor = '#000';
    G.audio.quiet();
    G.clearInput();
  }

  // 自动化测试用的只读状态
  G.debugState = () => {
    const top = G.ui[G.ui.length - 1];
    const r = G.curRoom;
    return {
      mode: G.mode, top: top ? top.kind : null, text: top && top.text, items: top && top.items,
      room: r && !r.done && !r.busy && G.sceneUpdate === r.updateFn ? r.objs.filter((o) => o.act && !o.hidden).map((o) => ({ id: o.id, name: o.name, count: o.count || 0 })) : null,
      tend: G.tend, run: G.save.run, endings: Object.keys(G.save.endings), overlay: !!G.overlay,
    };
  };

  async function main() {
    G.start();
    try {
      await Promise.race([document.fonts.load('12px "FusionPixel12"'), new Promise((r) => setTimeout(r, 1500))]);
    } catch (e) { /* 没有像素字体时使用系统字体 */ }
    G.clearTextCache();
    await G.warning();
    for (;;) {
      reset();
      let act;
      G.mode = 'title';
      try { act = await G.titleScreen(); } catch (e) { continue; }
      if (act === 'reload') continue;
      snapshot();
      G.mode = 'game';
      G.onMenu = G.openPause;
      try {
        if (act === 'e5') { G.curRun = G.save.run; await G.e5(); noteUnlock('e5'); }
        else await G.playRun();
      } catch (e) {
        if (e !== G.ABORT) console.error(e);
      }
    }
  }
  main();
})();
