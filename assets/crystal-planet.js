/*
 * CrystalPlanet — 半透明发光水晶星球渲染器（Canvas 2D，无依赖）
 *
 * 用法：
 *   CrystalPlanet.draw(ctx, x, y, r, opts, timeMs)
 *   opts 可以是预设名（"earth"、"saturn"…），也可以是对象：
 *   { color, deep, light, glow, tint, tintChance, seed, facets, bands, emissive,
 *     ring:{inner, outer, flat, tilt, color}, dust, sparkles, alpha, glowScale, flare }
 *   CrystalPlanet.fromColor("#4f6bff", seed) 由单一主色生成一套水晶配色。
 *
 * 星球主体（切面、菲涅耳边缘光、高光、内部透光）按像素逐点计算后缓存成贴图，
 * 每帧只叠加动态部分：外发光、流光扫过、内部闪烁粒子、环绕光尘、星芒。
 */
(function () {
  "use strict";

  var TAU = Math.PI * 2;
  var spriteCache = new Map();
  var fxCache = new Map();
  var reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rgb(hex) {
    hex = String(hex).replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var n = parseInt(hex.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function css(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")"; }
  function hex(c) { return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- 预设 ---------- */
  var PRESETS = {
    mercury: { color: "#c9cfe2", deep: "#3e4462", light: "#f4f6ff", glow: "#9aa6d8", tint: "#b8a6ff", tintChance: .25, facets: 34, seed: 11 },
    venus:   { color: "#f3cf82", deep: "#8a4f1c", light: "#fff4d2", glow: "#f0b650", tint: "#ffb6a0", tintChance: .3, facets: 40, seed: 23, bands: .35 },
    earth:   { color: "#4fb0ff", deep: "#0a2a7a", light: "#c8f4ff", glow: "#3b8cff", tint: "#5fe6b8", tintChance: .38, facets: 52, seed: 37 },
    mars:    { color: "#ff7c56", deep: "#5e160e", light: "#ffd6c2", glow: "#ff5a36", tint: "#ffb07a", tintChance: .3, facets: 38, seed: 41 },
    jupiter: { color: "#ecb88e", deep: "#5e321c", light: "#fff2e0", glow: "#e0925a", tint: "#fff0d0", tintChance: .2, facets: 70, seed: 53, bands: 1 },
    saturn:  { color: "#f2d89c", deep: "#6e5024", light: "#fff8e0", glow: "#e6c272", tint: "#ffe6b0", tintChance: .2, facets: 60, seed: 67, bands: .55,
               ring: { inner: 1.42, outer: 2.3, flat: .26, tilt: 0, color: "#f4dcae" } },
    uranus:  { color: "#a2f2ea", deep: "#165e66", light: "#ecfffd", glow: "#5ee6d8", tint: "#c4e8ff", tintChance: .3, facets: 44, seed: 71,
               ring: { inner: 1.45, outer: 1.7, flat: .22, tilt: 1.38, color: "#bff6f0", faint: true } },
    neptune: { color: "#5274ff", deep: "#0a0f5c", light: "#b4ccff", glow: "#3456ff", tint: "#8e7bff", tintChance: .35, facets: 46, seed: 83, bands: .3 },
    sun:     { color: "#ffe2a0", deep: "#ff8a20", light: "#ffffff", glow: "#ffb447", tint: "#fff3c8", tintChance: .4, facets: 48, seed: 97, emissive: true, glowScale: 3.4 },
    home:    { color: "#9fb2ff", deep: "#002fa7", light: "#ffffff", glow: "#4d6dff", tint: "#d6b8ff", tintChance: .35, facets: 56, seed: 7, emissive: true, glowScale: 3 }
  };

  function fromColor(c, seed) {
    var b = rgb(c);
    return {
      color: c, deep: hex(mix(b, [6, 4, 28], .72)), light: hex(mix(b, [255, 255, 255], .75)),
      glow: c, tint: hex(mix(b, [255, 190, 240], .45)), tintChance: .3,
      facets: 30 + ((seed || 0) % 4) * 6, seed: seed || 1
    };
  }

  function resolve(opts) {
    if (typeof opts === "string") return PRESETS[opts] || PRESETS.earth;
    if (opts && opts.preset) {
      var base = PRESETS[opts.preset] || {}, o = {}, k;
      for (k in base) o[k] = base[k];
      for (k in opts) o[k] = opts[k];
      return o;
    }
    return opts || PRESETS.earth;
  }

  /* ---------- 静态主体贴图（逐像素：切面 + 菲涅耳 + 高光 + 透光） ---------- */
  function buildSprite(o, res) {
    var key = [o.color, o.deep, o.light, o.tint, o.tintChance, o.seed, o.facets, o.bands, o.emissive, res].join("|");
    var hit = spriteCache.get(key);
    if (hit) return hit;

    var R = rng((o.seed || 1) * 9973 + 17);
    var N = Math.round((o.facets || 40) * (res >= 256 ? 1.7 : res >= 128 ? 1.25 : 1)), seeds = [], ga = Math.PI * (3 - Math.sqrt(5));
    var rx = R() * TAU, ry = R() * TAU;
    for (var i = 0; i < N; i++) {
      var y = 1 - (i + .5) / N * 2, rad = Math.sqrt(1 - y * y), th = ga * i + (R() - .5) * .9;
      var px = Math.cos(th) * rad, pz = Math.sin(th) * rad, py = y + (R() - .5) * .18;
      // 随机旋转，让每颗星球的切面布局不同
      var x1 = px * Math.cos(ry) + pz * Math.sin(ry), z1 = -px * Math.sin(ry) + pz * Math.cos(ry);
      var y1 = py * Math.cos(rx) - z1 * Math.sin(rx), z2 = py * Math.sin(rx) + z1 * Math.cos(rx);
      var l = Math.hypot(x1, y1, z2) || 1;
      seeds.push({ x: x1 / l, y: y1 / l, z: z2 / l, b: .7 + R() * .55, tint: R() < (o.tintChance || 0), spark: R() });
    }

    var cMain = rgb(o.color), cDeep = rgb(o.deep), cLight = rgb(o.light), cTint = rgb(o.tint || o.light);
    var emis = !!o.emissive, bands = o.bands || 0;
    var Lx = -.52, Ly = -.6, Lz = .6, Ll = Math.hypot(Lx, Ly, Lz); Lx /= Ll; Ly /= Ll; Lz /= Ll;
    var Hx = Lx, Hy = Ly, Hz = Lz + 1, Hl = Math.hypot(Hx, Hy, Hz); Hx /= Hl; Hy /= Hl; Hz /= Hl;

    var cv = document.createElement("canvas"); cv.width = cv.height = res;
    var g = cv.getContext("2d"), img = g.createImageData(res, res), d = img.data;
    var half = res / 2, Rp = half - 1, edgeW = 1.5 / Rp;

    for (var py2 = 0; py2 < res; py2++) {
      for (var px2 = 0; px2 < res; px2++) {
        var dx = (px2 + .5 - half) / Rp, dy = (py2 + .5 - half) / Rp, d2 = dx * dx + dy * dy;
        var idx = (py2 * res + px2) * 4;
        if (d2 > 1.0 + 2 / Rp) { d[idx + 3] = 0; continue; }
        var dist = Math.sqrt(d2), cover = clamp((1 - dist) * Rp + .5, 0, 1);
        var nz = Math.sqrt(Math.max(0, 1 - Math.min(d2, 1))), nx = dx, ny = dy;

        // 最近与次近切面
        var b1 = -2, b2 = -2, s1 = null;
        for (var k = 0; k < N; k++) {
          var s = seeds[k], dot = s.x * nx + s.y * ny + s.z * nz;
          if (dot > b1) { b2 = b1; b1 = dot; s1 = s; } else if (dot > b2) b2 = dot;
        }
        // 切面法线：介于球面与切面中心之间 → 保留球形，又有晶体棱面
        var fx = nx * .38 + s1.x * .62, fy = ny * .38 + s1.y * .62, fz = nz * .38 + s1.z * .62;
        var fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;

        var diff = Math.max(0, fx * Lx + fy * Ly + fz * Lz);
        // 切面闪光（柔和）+ 球面高光（小而锐利）
        var spec = Math.pow(Math.max(0, fx * Hx + fy * Hy + fz * Hz), 36) * (.1 + s1.spark * s1.spark * .9)
                 + Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 140) * .9;
        var fres = Math.pow(1 - nz, 2.3);
        var edge = (1 - smooth(0, edgeW * (1.1 + (1 - nz) * 2.2), b1 - b2)) * (.25 + .6 * diff + .5 * fres);
        // 背光透射：光从左上射入，在右下内缘透出
        var trans = Math.pow(Math.max(0, nx * .55 + ny * .62), 2) * (1 - nz * .5);
        var core = Math.pow(nz, 3);

        var base = mix(cDeep, cMain, clamp(diff * diff * 1.25 + (emis ? .45 : 0), 0, 1));
        if (s1.tint) base = mix(base, cTint, .42);
        if (bands) {
          var bw = Math.sin(dy * 9.5 + Math.sin(dx * 3 + dy * 5) * .7) * .5 + .5;
          base = mix(base, bw > .5 ? cLight : cDeep, Math.abs(bw - .5) * .55 * bands);
        }
        base = [base[0] * s1.b, base[1] * s1.b, base[2] * s1.b];
        var col = mix(base, cLight, clamp(core * (emis ? .55 : .22) + trans * .5, 0, 1));
        col = mix(col, cLight, clamp(fres * .65 + edge * .45, 0, 1));
        col = mix(col, [255, 255, 255], clamp(spec * 1.1 + edge * fres * .3, 0, .78));

        var a = emis
          ? .78 + .22 * fres + spec
          : .30 + .42 * fres + .24 * diff + .22 * edge + .28 * trans + spec;
        a = clamp(a, 0, 1) * cover;
        d[idx] = clamp(col[0], 0, 255); d[idx + 1] = clamp(col[1], 0, 255); d[idx + 2] = clamp(col[2], 0, 255);
        d[idx + 3] = a * 255;
      }
    }
    g.putImageData(img, 0, 0);

    // 晶体内部的柔光核心
    g.globalCompositeOperation = "lighter";
    var ig = g.createRadialGradient(half * .82, half * .78, 0, half, half, Rp);
    ig.addColorStop(0, css(cLight, emis ? .35 : .16)); ig.addColorStop(.6, css(cMain, .05)); ig.addColorStop(1, css(cMain, 0));
    g.fillStyle = ig; g.beginPath(); g.arc(half, half, Rp, 0, TAU); g.fill();
    // 细亮的外轮廓
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = css(mix(cLight, [255, 255, 255], .4), .55); g.lineWidth = Math.max(1, res / 160);
    g.beginPath(); g.arc(half, half, Rp - g.lineWidth / 2, 0, TAU); g.stroke();

    if (spriteCache.size > 120) spriteCache.delete(spriteCache.keys().next().value);
    spriteCache.set(key, cv);
    return cv;
  }

  /* ---------- 动态粒子数据（按 seed 缓存） ---------- */
  function fxData(o) {
    var key = (o.seed || 1) + "|" + (o.dust || 0) + "|" + (o.sparkles || 0);
    var hit = fxCache.get(key);
    if (hit) return hit;
    var R = rng((o.seed || 1) * 31 + 5), inner = [], dust = [], ringDust = [];
    for (var i = 0; i < 60; i++) {
      var u = R() * TAU, v = Math.acos(2 * R() - 1), rr = Math.cbrt(R()) * .78;
      inner.push({ u: u, v: v, r: rr, ph: R() * TAU, sp: .6 + R() * 1.8, s: .5 + R() * .9 });
    }
    for (i = 0; i < 40; i++) dust.push({ a: R() * TAU, d: 1.18 + R() * .95, tilt: (R() - .5) * 1.4, sp: (.25 + R() * .7) * (R() < .5 ? 1 : -1), ph: R() * TAU, s: .4 + R() * .9 });
    for (i = 0; i < 90; i++) ringDust.push({ a: R() * TAU, d: R(), ph: R() * TAU, s: .3 + R() * .8 });
    var out = { inner: inner, dust: dust, ringDust: ringDust };
    fxCache.set(key, out);
    return out;
  }

  function glint(ctx, x, y, size, a, c) {
    if (a <= .01) return;
    ctx.globalAlpha = a;
    var g = ctx.createRadialGradient(x, y, 0, x, y, size);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, css(c, .6)); g.addColorStop(1, css(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - size, y); ctx.quadraticCurveTo(x, y, x, y - size); ctx.quadraticCurveTo(x, y, x + size, y);
    ctx.quadraticCurveTo(x, y, x, y + size); ctx.quadraticCurveTo(x, y, x - size, y); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, size * .18, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawRing(ctx, x, y, r, o, ring, t, front, scale) {
    var c = rgb(ring.color || o.light), fx = fxData(o);
    var rin = r * ring.inner, rout = r * ring.outer, flat = ring.flat || .3, tilt = ring.tilt || 0;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(1, flat);
    ctx.beginPath();
    if (front) ctx.rect(-rout - 2, 0, rout * 2 + 4, rout + 2); else ctx.rect(-rout - 2, -rout - 2, rout * 2 + 4, rout + 2);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    var hz = ctx.createRadialGradient(0, 0, rin * .95, 0, 0, rout * 1.05);
    hz.addColorStop(0, css(c, 0)); hz.addColorStop(.25, css(c, ring.faint ? .08 : .16)); hz.addColorStop(.8, css(c, ring.faint ? .06 : .12)); hz.addColorStop(1, css(c, 0));
    ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(0, 0, rout * 1.05, 0, TAU); ctx.arc(0, 0, rin * .95, 0, TAU, true); ctx.fill();
    var bands = ring.faint ? 2 : 5;
    for (var i = 0; i < bands; i++) {
      var rr = rin + (rout - rin) * (i + .5) / bands, w = (rout - rin) / bands * (.55 + .4 * ((i * 7) % 3) / 2);
      ctx.strokeStyle = css(mix(c, [255, 255, 255], i % 2 ? .1 : .4), (ring.faint ? .3 : .34 + .16 * (i % 2)) * (front ? 1 : .75));
      ctx.lineWidth = w * 1.15; ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke();
    }
    ctx.strokeStyle = css([255, 255, 255], ring.faint ? .2 : .42); ctx.lineWidth = Math.max(.6, r * .02);
    ctx.beginPath(); ctx.arc(0, 0, rout, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, rin, 0, TAU); ctx.stroke();
    // 环上的发光碎晶
    if (r * scale > 9) {
      var n = ring.faint ? 30 : fx.ringDust.length;
      for (i = 0; i < n; i++) {
        var p = fx.ringDust[i], a = p.a + t * .00012 * (1.4 - p.d * .6), rr2 = rin + (rout - rin) * p.d;
        var px = Math.cos(a) * rr2, py = Math.sin(a) * rr2;
        if ((py >= 0) !== front) continue;
        var tw = .45 + .55 * Math.sin(t * .003 + p.ph);
        ctx.fillStyle = css(mix(c, [255, 255, 255], .6), .75 * tw);
        ctx.beginPath(); ctx.arc(px, py, Math.max(.5, r * .028 * p.s) / Math.sqrt(flat), 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------- 主绘制 ---------- */
  function draw(ctx, x, y, r, opts, t) {
    if (!(r > .5)) return;
    var o = resolve(opts);
    t = reduce ? 0 : (t || 0);
    var tr = ctx.getTransform ? ctx.getTransform() : { a: 1 };
    var scale = Math.abs(tr.a) || 1, pr = r * scale;
    var res = pr < 24 ? 64 : pr < 56 ? 128 : pr < 120 ? 256 : 384;
    var sprite = buildSprite(o, res);
    var cGlow = rgb(o.glow || o.color), cLight = rgb(o.light), fx = fxData(o);
    var alpha = o.alpha == null ? 1 : o.alpha, small = pr < 14;
    var dustN = o.dust != null ? o.dust : (small ? 7 : pr < 40 ? 16 : 30);
    var sparkN = o.sparkles != null ? o.sparkles : (small ? 4 : pr < 40 ? 12 : pr < 90 ? 26 : 50);

    ctx.save();
    // 1. 外发光
    ctx.globalCompositeOperation = "lighter";
    var gs = o.glowScale || 2.5, pulse = 1 + .05 * Math.sin(t * .0012 + (o.seed || 0));
    var gg = ctx.createRadialGradient(x, y, r * .55, x, y, r * gs * pulse);
    gg.addColorStop(0, css(cGlow, (o.emissive ? .55 : .32) * alpha));
    gg.addColorStop(.35, css(cGlow, (o.emissive ? .2 : .1) * alpha));
    gg.addColorStop(1, css(cGlow, 0));
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r * gs * pulse, 0, TAU); ctx.fill();

    // 2. 背后的光尘与环
    var dustPts = [];
    for (var i = 0; i < dustN; i++) {
      var p = fx.dust[i], a = p.a + t * .00035 * p.sp;
      var ex = Math.cos(a) * p.d * r, ey = Math.sin(a) * p.d * r * .32;
      var px = x + ex * Math.cos(p.tilt) - ey * Math.sin(p.tilt), py = y + ex * Math.sin(p.tilt) + ey * Math.cos(p.tilt);
      dustPts.push({ x: px, y: py, back: Math.sin(a) < 0, p: p });
    }
    function drawDust(back) {
      for (var j = 0; j < dustPts.length; j++) {
        var q = dustPts[j]; if (q.back !== back) continue;
        var tw = .35 + .65 * Math.pow(.5 + .5 * Math.sin(t * .0026 * (1 + q.p.s) + q.p.ph), 2);
        var s = clamp(r * .045 * q.p.s, .6 / scale, 2.2 / scale);
        ctx.fillStyle = css(mix(cLight, [255, 255, 255], .5), tw * .85 * alpha);
        ctx.beginPath(); ctx.arc(q.x, q.y, s, 0, TAU); ctx.fill();
        if (!small && tw > .8) {
          ctx.fillStyle = css(cGlow, .25 * tw * alpha);
          ctx.beginPath(); ctx.arc(q.x, q.y, s * 3.2, 0, TAU); ctx.fill();
        }
      }
    }
    drawDust(true);
    if (o.ring) drawRing(ctx, x, y, r, o, o.ring, t, false, scale);

    // 3. 水晶主体
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;

    // 4. 流光：一道光带缓缓扫过晶面
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r * .99, 0, TAU); ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    var sw = ((t * .00011 + (o.seed || 0) * .137) % 1) * 3.2 - 1.6;
    var ang = -.75, ux = Math.cos(ang), uy = Math.sin(ang);
    var sx = x + ux * sw * r, sy = y + uy * sw * r;
    var lg = ctx.createLinearGradient(sx - ux * r * .35, sy - uy * r * .35, sx + ux * r * .35, sy + uy * r * .35);
    lg.addColorStop(0, css(cLight, 0)); lg.addColorStop(.5, css([255, 255, 255], .16 * alpha)); lg.addColorStop(1, css(cLight, 0));
    ctx.fillStyle = lg; ctx.fillRect(x - r, y - r, r * 2, r * 2);

    // 5. 晶体内部漂浮的发光粒子
    var rot = t * .00022 + (o.seed || 0);
    for (i = 0; i < sparkN; i++) {
      var s3 = fx.inner[i], u = s3.u + rot;
      var X = Math.sin(s3.v) * Math.cos(u) * s3.r, Y = Math.cos(s3.v) * s3.r, Z = Math.sin(s3.v) * Math.sin(u) * s3.r;
      var tw2 = .5 + .5 * Math.sin(t * .002 * s3.sp + s3.ph), depth = .55 + .45 * (Z + 1) / 2;
      var ss = clamp(r * .035 * s3.s, .5 / scale, 2 / scale) * (.7 + .5 * depth);
      ctx.fillStyle = css(mix(cLight, [255, 255, 255], .55), (.25 + .7 * tw2) * depth * alpha);
      ctx.beginPath(); ctx.arc(x + X * r, y + Y * r, ss, 0, TAU); ctx.fill();
      if (!small && tw2 > .82) {
        ctx.fillStyle = css(cGlow, .35 * tw2 * alpha);
        ctx.beginPath(); ctx.arc(x + X * r, y + Y * r, ss * 3, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();

    // 6. 前方的环与光尘
    ctx.globalCompositeOperation = "lighter";
    if (o.ring) drawRing(ctx, x, y, r, o, o.ring, t, true, scale);
    drawDust(false);

    // 7. 星芒：高光处周期性闪一下
    if (o.flare !== false && pr > 6) {
      var fl = Math.pow(Math.max(0, Math.sin(t * .0009 + (o.seed || 0) * 1.7)), 6);
      glint(ctx, x - r * .42, y - r * .48, r * (.35 + .35 * fl) + 2 / scale, (.35 + .65 * fl) * alpha, cLight);
      if (o.emissive) {
        var fl2 = .5 + .5 * Math.sin(t * .0007);
        glint(ctx, x, y, r * (1.5 + .5 * fl2), .22 * alpha, cGlow);
      }
    }
    ctx.restore();
  }

  window.CrystalPlanet = { draw: draw, fromColor: fromColor, presets: PRESETS };
})();
