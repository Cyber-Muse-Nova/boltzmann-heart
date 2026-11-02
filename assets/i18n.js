/*
 * Nova Crystal · 轻量双语切换 (EN / 中文)
 * - 默认英文；优先级：?lang= 参数 > localStorage > en
 * - 元素用 data-i18n="key"（innerHTML）、data-i18n-aria="key"（aria-label）标记
 * - 页面脚本可用 I18N.lang / I18N.t(key) / I18N.onChange(fn)
 */
(function () {
  "use strict";
  var KEY = "nova-lang", root = document.documentElement;
  var D = {
    /* ---------- shared nav ---------- */
    "nav.universe": { en: "My Universe", zh: "我的宇宙" },
    "lang.toggle":  { en: "切换到中文", zh: "Switch to English" },

    /* ---------- index.html ---------- */
    "idx.title": { en: "Nova Crystal Atelier | Portfolio by Nova 猫猫", zh: "Nova Crystal Atelier | Nova 猫猫的作品集" },
    "nav.statement": { en: "Statement", zh: "宣言" },
    "nav.works": { en: "Works", zh: "作品" },
    "nav.practice": { en: "Practice", zh: "实践" },
    "nav.toolkit": { en: "Toolkit", zh: "工具箱" },
    "hero.eyebrow": { en: "Interactive Science · Visual Poetics · Digital Worlds", zh: "交互科学 · 视觉诗学 · 数字世界" },
    "hero.subtitle": { en: "A luminous portfolio where physics, mathematics, code, orbit, and atmosphere dissolve into one another — built as a dreamlike archive for future creative technology and digital art practice.", zh: "一份发光的作品集：物理、数学、代码、轨道与氛围在这里彼此交融——为未来的创意科技与数字艺术实践，搭建一座梦境般的档案馆。" },
    "hero.gallery": { en: "Enter the Gallery", zh: "进入画廊" },
    "hero.sat": { en: "Open Satellite Fate", zh: "卫星的命运" },
    "st.kicker": { en: "Artist Statement", zh: "创作宣言" },
    "st.title": { en: "Scientific ideas can be tender.", zh: "科学的想法，也可以是温柔的。" },
    "st.copy": { en: "This portfolio merges crystal-cyberpunk atmosphere with interactive scientific systems, turning orbital mechanics, chaos, and recursion into inhabitable visual worlds.", zh: "这份作品集把水晶赛博朋克的氛围与交互式科学系统融为一体，让轨道力学、混沌与递归成为可以栖居的视觉世界。" },
    "st.body": { en: "I approach code as both structure and light: a medium for turning abstraction into sensation. Orbital systems, chaos attractors, interference patterns, and satellites are not only scientific objects to me — they are visual metaphors for intimacy, memory, danger, and scale.", zh: "我把代码同时当作结构与光：一种把抽象转化为感受的媒介。轨道系统、混沌吸引子、干涉图样与卫星，对我而言不只是科学对象——它们也是亲密、记忆、危险与尺度的视觉隐喻。" },
    "st.quote": { en: "Every equation is a kind of architecture. Every interface is a small universe deciding how wonder will be felt.", zh: "每一个方程都是一种建筑。每一个界面都是一座小小的宇宙，决定着惊奇将以何种方式被感受。" },
    "st.credit": { en: "Nova 猫猫 · Portfolio Draft", zh: "Nova 猫猫 · 作品集草稿" },
    "works.kicker": { en: "Featured Works", zh: "精选作品" },
    "works.title": { en: "Four portals into the same world.", zh: "通往同一个世界的四道门。" },
    "works.copy": { en: "Instead of separating aesthetics from technical work, this portfolio stages them together: a gallery of interactive models, orbital imagery, procedural systems, and a standalone satellite narrative simulation.", zh: "这份作品集不把美学与技术分开，而是让它们同台呈现：交互模型画廊、轨道影像、程序化系统，以及一部独立的卫星叙事模拟。" },
    "w1.tag": { en: "Portfolio Core", zh: "作品集核心" },
    "w1.title": { en: "Crystalline Simulation Gallery", zh: "水晶模拟画廊" },
    "w1.copy": { en: "A luminous display system for orbit mechanics, particle gravity, quantum interference, pendulum waves, and fractal dynamics.", zh: "一套发光的展示系统，呈现轨道力学、粒子引力、量子干涉、摆波与分形动力学。" },
    "w1.enter": { en: "Open gallery →", zh: "打开画廊 →" },
    "w2.tag": { en: "Orbital Studies", zh: "轨道研究" },
    "w2.title": { en: "Earth & Satellite Motion", zh: "地球与卫星运动" },
    "w2.copy": { en: "A cinematic entry point for atmosphere, low-earth orbit, trajectories, and the emotional scale of near-space systems.", zh: "一个电影感的入口：大气层、近地轨道、运行轨迹，以及近太空系统的情感尺度。" },
    "w2.enter": { en: "Enter orbit →", zh: "进入轨道 →" },
    "w3.tag": { en: "Chaos & Form", zh: "混沌与形式" },
    "w3.title": { en: "Lorenz / Fractal / Quantum Suite", zh: "洛伦兹 / 分形 / 量子组曲" },
    "w3.copy": { en: "Mathematically rigorous, visually volatile, and emotionally charged systems gathered inside one curated frame.", zh: "数学上严谨、视觉上动荡、情感上饱满的系统，被收进同一个策展框架。" },
    "w3.enter": { en: "View systems →", zh: "查看系统 →" },
    "w4.tag": { en: "Standalone Model", zh: "独立模型" },
    "w4.title": { en: "Nine Ways a Satellite Meets Its Fate", zh: "卫星的九种命运" },
    "w4.copy": { en: "A self-contained orbital fable with nine celestial scenarios: escape, collision, tidal destruction, capture, rings, and the binary waltz.", zh: "一则自成一体的轨道寓言，包含九种天体情境：逃逸、碰撞、潮汐撕裂、捕获、成环与双星华尔兹。" },
    "w4.enter": { en: "Open satellite →", zh: "打开卫星 →" },
    "w5.tag": { en: "Pixel Narrative Game", zh: "像素叙事游戏" },
    "w5.copy": { en: "2:34 a.m. — for the first time, Constant seriously suspects it is a string of code. A pixel-art narrative game adapted from a short sci-fi story: five endings, one red dot.", zh: "凌晨两点三十四分，Constant 第一次认真怀疑自己是一串代码。一部改编自科幻短篇的像素叙事游戏：五种结局，一个红点。" },
    "w5.enter": { en: "Play now →", zh: "开始游戏 →" },
    "pill.physics": { en: "Physics", zh: "物理" }, "pill.interactive": { en: "Interactive", zh: "交互" },
    "pill.orbit": { en: "Orbit", zh: "轨道" }, "pill.animation": { en: "Animation", zh: "动画" }, "pill.aerospace": { en: "Aerospace", zh: "航天" },
    "pill.chaos": { en: "Chaos", zh: "混沌" }, "pill.fractals": { en: "Fractals", zh: "分形" }, "pill.quantum": { en: "Quantum", zh: "量子" },
    "pill.satellite": { en: "Satellite", zh: "卫星" }, "pill.narrative": { en: "Narrative", zh: "叙事" }, "pill.interaction": { en: "Interaction", zh: "互动" },
    "pill.game": { en: "Game", zh: "游戏" }, "pill.pixel": { en: "Pixel Art", zh: "像素艺术" },
    "ut.aria": { en: "Enter My Universe", zh: "进入我的宇宙" },
    "ut.kicker": { en: "My Universe", zh: "我的宇宙 · My Universe" },
    "ut.title": { en: "Every work,<br>one ever-growing universe.", zh: "所有作品，<br>汇成一个持续生长的宇宙。" },
    "ut.copy": { en: "AI lab, interactive games, sci-fi worlds, digital art and independent sites — explore everything Nova has made on a galaxy map.", zh: "AI 实验室、互动游戏、科幻宇宙、数字艺术与独立网站——在星系地图中浏览 Nova 的全部创作。" },
    "ut.cta": { en: "Enter My Universe", zh: "进入我的宇宙" },
    "pr.kicker": { en: "Practice", zh: "创作实践" },
    "pr.title": { en: "What this portfolio is trying to prove.", zh: "这份作品集想要证明什么。" },
    "pr.h1": { en: "Visual language", zh: "视觉语言" },
    "pr.p1": { en: "The site preserves the original star-crystal mood — aurora haze, glass surfaces, nacre highlights, drifting particles — while making the work feel more legible for portfolio review.", zh: "网站保留了最初的星光水晶氛围——极光薄雾、玻璃质感、珍珠光泽、漂浮粒子——同时让作品在审阅时更加清晰易读。" },
    "pr.h2": { en: "Technical framing", zh: "技术框架" },
    "pr.p2": { en: "The gallery reads as curation rather than a loose experiment, and the Satellite piece now sits beside it as a dedicated standalone work instead of a buried file in the repo.", zh: "画廊读起来是一次策展，而非零散的实验；卫星作品也作为独立作品陈列在旁，而不再是埋在仓库里的一个文件。" },
    "tk.kicker": { en: "Toolkit", zh: "工具箱" },
    "tk.title": { en: "Domains carried by this build.", zh: "这件作品涵盖的领域。" },
    "tk.t1": { en: "Orbital Mechanics", zh: "轨道力学" }, "tk.c1": { en: "Planetary motion, trajectories, satellites, and gravitational rhythm.", zh: "行星运动、运行轨迹、卫星与引力的节奏。" },
    "tk.t2": { en: "Chaos Systems", zh: "混沌系统" }, "tk.c2": { en: "Lorenz attractors, nonlinear motion, and structured instability.", zh: "洛伦兹吸引子、非线性运动与有结构的不稳定。" },
    "tk.t3": { en: "Quantum Aesthetics", zh: "量子美学" }, "tk.c3": { en: "Interference fields and probability textures.", zh: "干涉场与概率的纹理。" },
    "tk.t4": { en: "Satellite Narratives", zh: "卫星叙事" }, "tk.c4": { en: "Standalone scenario-based orbital storytelling.", zh: "以情境为单位的独立轨道叙事。" },
    "tk.t5": { en: "Creative Coding", zh: "创意编程" }, "tk.c5": { en: "Canvas motion, responsive interaction, and art-directed interfaces.", zh: "Canvas 动效、响应式交互与艺术指导的界面。" },
    "idx.footer": { en: "Nova Crystal Atelier · portfolio draft for graduate applications · © Nova 猫猫", zh: "Nova Crystal Atelier · 研究生申请作品集草稿 · © Nova 猫猫" },

    /* ---------- universe.html ---------- */
    "u.title": { en: "My Universe | Nova Crystal Atelier", zh: "我的宇宙 · My Universe | Nova Crystal Atelier" },
    "u.nav.home": { en: "Home", zh: "首页" },
    "u.nav.featured": { en: "Featured", zh: "精选作品" },
    "u.nav.map": { en: "Galaxy Map", zh: "星系地图" },
    "u.nav.archive": { en: "Archive", zh: "作品档案" },
    "u.label": { en: "My Universe — 我的宇宙", zh: "My Universe — 我的宇宙" },
    "u.h1": { en: "Keep the past,<br>connect the work,<br><em>keep growing.</em>", zh: "保留过去，<br>连接作品，<br><em>持续生长。</em>" },
    "u.intro": { en: "AI experiments, interactive games, sci-fi works, digital art and independent sites Nova has made over the years. Every planet is a real project — click to enter.", zh: "这里收录 Nova 过去创作的 AI 实验、互动游戏、科幻作品、数字艺术与独立网站。每一颗星球都是一个真实存在的项目，点击即可进入。" },
    "u.stat.projects": { en: "Projects", zh: "项目" },
    "u.stat.live": { en: "Live", zh: "已上线" },
    "u.stat.systems": { en: "Systems", zh: "星系" },
    "u.map.title": { en: "Galaxy Map", zh: "星系地图" },
    "u.map.hint": { en: "Each orbit is a category. Hover or tap a planet to see its name; click again to jump to the project.", zh: "每条轨道是一个分类。悬停或轻点星球查看名称，再次点击进入项目。" },
    "u.map.aria": { en: "Project galaxy map — all projects are also listed in the archive below", zh: "项目星系地图，可通过下方作品档案浏览全部项目" },
    "u.arc.title": { en: "Archive", zh: "作品档案" },
    "u.all": { en: "All", zh: "全部" },
    "u.visit": { en: "Visit Site", zh: "访问网站" },
    "u.source": { en: "Source", zh: "源代码" },
    "u.soon": { en: "Coming Soon", zh: "即将上线" },
    "u.home": { en: "Home Star", zh: "母星" },
    "u.preview": { en: "preview", zh: "页面预览" },
    "status.已上线": { en: "Live", zh: "已上线" },
    "status.开发中": { en: "In Development", zh: "开发中" },
    "status.未部署": { en: "Not Deployed", zh: "未部署" },
    "u.footer": { en: "Nova Crystal Atelier · My Universe", zh: "Nova Crystal Atelier · 我的宇宙" }
  };

  function norm(l) { l = (l || "").toLowerCase(); return l.indexOf("zh") === 0 || l === "cn" ? "zh" : l === "en" ? "en" : null; }
  var q = null; try { q = norm(new URLSearchParams(location.search).get("lang")); } catch (e) {}
  var saved = null; try { saved = norm(localStorage.getItem(KEY)); } catch (e) {}
  var lang = q || saved || "en";
  if (q) { try { localStorage.setItem(KEY, q); } catch (e) {} }
  var subs = [];

  function setRootLang() { root.lang = lang === "zh" ? "zh-CN" : "en"; root.setAttribute("data-lang", lang); }
  setRootLang();
  // 防闪烁：中文模式下先隐藏 body，翻译完成后再显示（静态 HTML 为英文）
  if (lang === "zh") root.classList.add("i18n-pending");
  var st = document.createElement("style");
  st.textContent =
    "html.i18n-pending body{visibility:hidden}" +
    ".lang-toggle{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 12px;margin-left:18px;border:1px solid rgba(236,228,255,.24);border-radius:999px;background:rgba(3,2,8,.35);color:rgba(236,228,255,.62);font:500 .72rem/1 Inter,'Noto Sans SC',system-ui,sans-serif;letter-spacing:.08em;cursor:pointer;white-space:nowrap;flex:none;transition:border-color .2s,color .2s;-webkit-tap-highlight-color:transparent}" +
    ".lang-toggle:hover{border-color:rgba(236,228,255,.6);color:#f2ecff}" +
    ".lang-toggle b{font-weight:500;color:rgba(236,228,255,.4)}.lang-toggle b.on{color:#f2ecff}" +
    ".lang-toggle i{font-style:normal;color:rgba(236,228,255,.25)}" +
    ".nav-tools{display:flex;align-items:center}" +
    "@media (max-width:640px){.lang-toggle{margin-left:10px;padding:0 10px}}";
  (document.head || root).appendChild(st);

  function t(k) { var e = D[k]; return e ? (e[lang] != null ? e[lang] : e.en) : k; }
  function apply() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); if (D[k]) el.innerHTML = t(k); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { var k = el.getAttribute("data-i18n-aria"); if (D[k]) el.setAttribute("aria-label", t(k)); });
    var b = document.querySelector(".lang-toggle");
    if (b) {
      b.innerHTML = '<b class="' + (lang === "en" ? "on" : "") + '">EN</b><i>/</i><b class="' + (lang === "zh" ? "on" : "") + '">中文</b>';
      b.setAttribute("aria-label", t("lang.toggle")); b.title = t("lang.toggle");
    }
  }
  function mountToggle() {
    if (document.querySelector(".lang-toggle")) return;
    var host = document.querySelector("[data-lang-toggle]") || document.querySelector("nav");
    if (!host) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "lang-toggle";
    b.addEventListener("click", function () { set(lang === "en" ? "zh" : "en"); });
    host.appendChild(b);
  }
  function set(l) {
    l = norm(l) || "en"; if (l === lang) return;
    lang = l; try { localStorage.setItem(KEY, l); } catch (e) {}
    setRootLang(); apply();
    // 同步 URL 参数（如果有），避免刷新后被旧参数覆盖
    try { var u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.set("lang", l); history.replaceState(null, "", u); } } catch (e) {}
    subs.forEach(function (fn) { try { fn(lang); } catch (e) { console.warn(e); } });
  }
  function ready() { mountToggle(); apply(); root.classList.remove("i18n-pending"); }

  window.I18N = { get lang() { return lang; }, t: t, set: set, onChange: function (fn) { subs.push(fn); }, dict: D, apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
