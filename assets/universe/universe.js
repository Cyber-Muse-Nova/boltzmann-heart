(function(){
  "use strict";
  var P = window.PROJECTS || [], C = window.UNIVERSE_CATEGORIES || [];
  var I = window.I18N || { lang:"zh", t:function(k){ return k; }, onChange:function(){} };
  var isEn = function(){ return I.lang === "en"; };
  var catName = function(id){ for (var i = 0; i < C.length; i++) if (C[i].id === id) return isEn() ? (C[i].en || C[i].name) : C[i].name; return ""; };
  var title = function(p){ return isEn() ? (p.title_en || p.title_zh) : p.title_zh; };
  var sub = function(p){ return isEn() ? (p.name !== title(p) ? p.name : p.title_zh) : p.name; };
  var desc = function(p){ return isEn() ? (p.desc_en || p.desc_zh) : p.desc_zh; };
  var tagsOf = function(p){ return (isEn() ? (p.tags_en || p.tags) : p.tags) || []; };
  var stat = function(s){ return I.t("status." + s); };
  var COLORS = { ai:"#b49be8", game:"#c39ee5", scifi:"#9fcfe8", art:"#edacd1", other:"#c99bdf" };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pad = function(n){ return (n < 10 ? "0" : "") + n; };
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };

  var currentFilter = "all";
  var filtersEl = document.getElementById("filters"), cardsEl = document.getElementById("cards");
  function render(){
  /* ---------- stats ---------- */
  var live = P.filter(function(p){ return p.status === "已上线"; }).length;
  document.getElementById("stats").innerHTML =
    "<div><dt>" + I.t("u.stat.projects") + "</dt><dd>" + pad(P.length) + "</dd></div>" +
    "<div><dt>" + I.t("u.stat.live") + "</dt><dd>" + pad(live) + "</dd></div>" +
    "<div><dt>" + I.t("u.stat.systems") + "</dt><dd>" + pad(C.length) + "</dd></div>";

  /* ---------- cards ---------- */
  cardsEl.innerHTML = P.map(function(p, i){
    var dev = p.status !== "已上线";
    var cover = p.cover
      ? '<img src="' + esc(p.cover) + '" alt="' + esc(title(p)) + ' ' + I.t('u.preview') + '" loading="lazy" decoding="async" width="1200" height="750">'
      : '<div class="u-ph" aria-hidden="true"><i></i><b>' + esc(stat(p.status)) + '</b></div>';
    var visit = p.url
      ? '<a class="u-btn primary" href="' + esc(p.url) + '"' + (p.home ? "" : ' target="_blank" rel="noopener"') + '>' + I.t('u.visit') + ' <span class="arr">↗</span></a>'
      : '<span class="u-btn disabled" aria-disabled="true">' + I.t('u.soon') + '</span>';
    return '<article class="u-card reveal' + (p.home ? " home" : "") + '" id="p-' + esc(p.id) + '" data-cat="' + esc(p.category) + '">' +
      '<div class="u-cover">' + cover + '<span class="u-num">' + pad(i + 1) + '</span><span class="u-badge' + (dev ? " dev" : "") + '">' + esc(stat(p.status)) + '</span></div>' +
      '<div class="u-body"><div class="u-meta"><span class="cat">' + esc(catName(p.category)) + (p.home ? '<em class="u-home"> · ' + I.t('u.home') + '</em>' : '') + '</span><span>' + esc(p.year || "") + '</span></div>' +
      '<h3>' + esc(title(p)) + '</h3><p class="u-en">' + esc(sub(p)) + '</p>' +
      '<p class="u-desc">' + esc(desc(p)) + '</p>' +
      '<div class="u-tags">' + tagsOf(p).map(function(t){ return "<span>" + esc(t) + "</span>"; }).join("") + '</div>' +
      '<div class="u-actions">' + visit + '</div></div></article>';
  }).join("");

  /* ---------- filters ---------- */
  var tabs = [{ id:"all", name:I.t("u.all"), en:I.t("u.all") }].concat(C);
  filtersEl.innerHTML = tabs.map(function(t, i){
    var n = t.id === "all" ? P.length : P.filter(function(p){ return p.category === t.id; }).length;
    return '<button type="button" data-f="' + t.id + '" aria-pressed="' + (i === 0) + '">' + (isEn() ? (t.en || t.name) : t.name) + '<sup>' + n + '</sup></button>';
  }).join("");
    applyFilter(currentFilter);
  }
  function applyFilter(f){
    currentFilter = f;
    filtersEl.querySelectorAll("button").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.f === f); });
    cardsEl.querySelectorAll(".u-card").forEach(function(c){ c.hidden = !(f === "all" || c.dataset.cat === f); });
  }
  filtersEl.addEventListener("click", function(e){ var b = e.target.closest("button"); if (b) applyFilter(b.dataset.f); });

  render(); legend();
  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add("in"); ro.unobserve(en.target); } }); }, { rootMargin:"0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach(function(el){ ro.observe(el); });
  } else document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });

  /* ---------- legend ---------- */
  function legend(){
  document.getElementById("legend").innerHTML = C.map(function(c, i){
    return '<li style="color:' + COLORS[c.id] + '"><span></span><b>' + pad(i + 1) + '</b><em style="font-style:normal;color:var(--ink)">' + catName(c.id) + "</em></li>";
  }).join("");
  }

  /* ---------- galaxy ---------- */
  var cv = document.getElementById("galaxy"), ctx = cv.getContext("2d"), tip = document.getElementById("tip");
  var W = 0, H = 0, DPR = 1, t = 0, running = false, visible = false, hover = null, armed = null, raf = 0, last = 0;
  var home = P.filter(function(p){ return p.home; })[0];
  var rings = C.map(function(c, i){
    var items = P.filter(function(p){ return p.category === c.id && !p.home; });
    return { cat:c, ring:i, items:items.map(function(p, k){ return { p:p, a:(k / Math.max(items.length,1)) * Math.PI * 2 + i * 1.3, x:0, y:0, r:0 }; }), speed:0.00011 / (1 + i * 0.45) };
  });
  var bodies = []; rings.forEach(function(r){ r.items.forEach(function(b){ b.ringRef = r; bodies.push(b); }); });
  var homeBody = home ? { p:home, x:0, y:0, r:0 } : null;
  var stars = []; for (var s = 0; s < 160; s++) stars.push({ x:Math.random(), y:Math.random(), r:Math.random() * 1.1 + .2, o:Math.random() * .5 + .15 });

  function resize(){
    var rect = cv.getBoundingClientRect(); DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR,0,0,DPR,0,0); draw();
  }
  function geom(){
    var mobile = W < 640, cx = W / 2, cy = H / 2;
    var maxR = Math.min(W * (mobile ? .47 : .44), H * (mobile ? .78 : 1.25));
    return { cx:cx, cy:cy, tilt: mobile ? .62 : .42, r0: maxR * .26, step: (maxR - maxR * .26) / (C.length - 1), mobile:mobile };
  }
  function draw(){
    if (!W) return;
    var g = geom();
    ctx.clearRect(0,0,W,H);
    stars.forEach(function(st){ ctx.globalAlpha = st.o; ctx.fillStyle = "#dfe4ff"; ctx.beginPath(); ctx.arc(st.x * W, st.y * H, st.r, 0, 6.283); ctx.fill(); });
    ctx.globalAlpha = 1;
    // core glow
    var cg = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.r0 * 1.6);
    cg.addColorStop(0, "rgba(42,77,255,.28)"); cg.addColorStop(1, "rgba(42,77,255,0)");
    ctx.fillStyle = cg; ctx.fillRect(0,0,W,H);
    // orbits
    rings.forEach(function(r){
      var R = g.r0 + g.step * r.ring;
      ctx.strokeStyle = r.cat.id === (hover && hover.p.category) ? "rgba(236,228,255,.38)" : "rgba(236,228,255,.10)";
      ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(g.cx, g.cy, R, R * g.tilt, 0, 0, 6.283); ctx.stroke();
      ctx.fillStyle = "rgba(236,228,255,.38)"; ctx.font = "500 10px Inter, sans-serif";
      if (!g.mobile) ctx.fillText(pad(r.ring + 1), g.cx + R + 6, g.cy + 3);
    });
    // home star
    if (homeBody){
      homeBody.x = g.cx; homeBody.y = g.cy; homeBody.r = g.mobile ? 13 : 17;
      var hg = ctx.createRadialGradient(g.cx - 4, g.cy - 5, 1, g.cx, g.cy, homeBody.r);
      hg.addColorStop(0, "#ffffff"); hg.addColorStop(.35, "#b9c6ff"); hg.addColorStop(1, "#002FA7");
      ctx.shadowColor = "rgba(90,120,255,.7)"; ctx.shadowBlur = 30;
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(g.cx, g.cy, homeBody.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    }
    // planets: sort by depth so far ones draw first
    bodies.forEach(function(b){
      var R = g.r0 + g.step * b.ringRef.ring, a = b.a + t * b.ringRef.speed;
      b.x = g.cx + Math.cos(a) * R; b.y = g.cy + Math.sin(a) * R * g.tilt;
      b.depth = Math.sin(a); b.r = (g.mobile ? 6 : 7.5) * (0.82 + 0.28 * (b.depth + 1) / 2) + (b.p.status === "已上线" ? 1.5 : 0);
    });
    bodies.slice().sort(function(a,b){ return a.depth - b.depth; }).forEach(function(b){
      var col = COLORS[b.p.category], on = hover === b, dev = b.p.status !== "已上线";
      if (on){ ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 7, 0, 6.283); ctx.stroke(); }
      var pg = ctx.createRadialGradient(b.x - b.r * .4, b.y - b.r * .4, .5, b.x, b.y, b.r);
      pg.addColorStop(0, "#ffffff"); pg.addColorStop(.3, col); pg.addColorStop(1, "rgba(3,2,8,1)");
      ctx.globalAlpha = 0.55 + 0.45 * (b.depth + 1) / 2;
      ctx.fillStyle = dev ? "rgba(3,2,8,1)" : pg; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
      if (dev){ ctx.setLineDash([2,3]); ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]); }
      ctx.globalAlpha = 1;
      if (!g.mobile && (on || W > 1100)){
        ctx.fillStyle = on ? "#fff" : "rgba(236,228,255,.55)"; ctx.font = (on ? "500 " : "400 ") + "11px Inter, 'Noto Sans SC', sans-serif";
        var lb = title(b.p); if (!on && lb.length > 24) lb = lb.slice(0, 22) + "…";
        ctx.fillText(lb, b.x + b.r + 8, b.y + 4);
      }
    });
  }
  function loop(ts){
    if (!running) return;
    var dt = last ? Math.min(ts - last, 50) : 16; last = ts;
    if (!hover) t += dt;
    draw(); raf = requestAnimationFrame(loop);
  }
  function start(){ if (running || reduce || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
  function stop(){ running = false; cancelAnimationFrame(raf); }

  function pick(x, y){
    var all = homeBody ? bodies.concat([homeBody]) : bodies, best = null, bd = 1e9, touchPad = 14;
    all.forEach(function(b){ var d = Math.hypot(b.x - x, b.y - y); if (d < b.r + touchPad && d < bd){ bd = d; best = b; } });
    return best;
  }
  function showTip(b){
    if (!b){ tip.hidden = true; return; }
    tip.innerHTML = "<b>" + esc(title(b.p)) + "</b><span>" + esc(sub(b.p)) + "</span><i>" + esc(catName(b.p.category)) + " · " + esc(stat(b.p.status)) + "</i>";
    var rect = cv.getBoundingClientRect(), wrap = cv.parentNode.getBoundingClientRect();
    tip.style.left = (b.x + rect.left - wrap.left) + "px"; tip.style.top = (b.y + rect.top - wrap.top) + "px"; tip.hidden = false;
    var safeX = Math.max(tip.offsetWidth / 2 + 8, Math.min(wrap.width - tip.offsetWidth / 2 - 8, b.x + rect.left - wrap.left));
    tip.style.left = safeX + "px";
  }
  function openCard(b){
    applyFilter("all");
    var el = document.getElementById("p-" + b.p.id); if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block:"center" });
    el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash");
  }
  function local(e){ var r = cv.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top }; }
  cv.addEventListener("pointermove", function(e){
    if (e.pointerType !== "mouse") return;
    var q = local(e), b = pick(q.x, q.y); if (b !== hover){ hover = b; showTip(b); cv.style.cursor = b ? "pointer" : "crosshair"; if (!running) draw(); }
  });
  cv.addEventListener("pointerleave", function(){ hover = null; showTip(null); if (!running) draw(); });
  cv.addEventListener("click", function(e){
    var q = local(e), b = pick(q.x, q.y);
    if (!b){ armed = null; hover = null; showTip(null); return; }
    // 触屏：第一次轻点显示信息，第二次进入卡片；鼠标：直接定位卡片
    var touch = e.pointerType === "touch" || (e.pointerType === undefined && matchMedia("(hover:none)").matches) || matchMedia("(hover:none)").matches;
    if (touch && armed !== b){ armed = b; hover = b; showTip(b); if (!running) draw(); return; }
    armed = null; hover = null; showTip(null); openCard(b);
  });

  if ("IntersectionObserver" in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; visible ? start() : stop(); }, { threshold:.05 }).observe(cv);
  } else { visible = true; start(); }
  document.addEventListener("visibilitychange", function(){ document.hidden ? stop() : start(); });
  var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(resize, 120); });
  resize();
  I.onChange(function(){ render(); legend(); cardsEl.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); }); armed = null; hover = null; showTip(null); draw(); });
})();

