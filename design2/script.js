/* Faig – Design 2 · motion & interaction */
(function () {
  "use strict";
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var loader = $("#loader");

  /* Fallback: if the animation libraries are blocked, show everything plainly */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("js");
    if (loader) loader.style.display = "none";
    initBasics();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  $("#yr").textContent = new Date().getFullYear();

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(target) {
    var el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      scrollToEl(t);
    });
  });

  /* ---------- helpers ---------- */
  function splitLines(el) {
    // splits a heading into word spans wrapped in line masks (word = reveal unit)
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.innerHTML = "";
    nodes.forEach(function (n) {
      var isEm = n.nodeType === 1 && n.tagName === "EM";
      var text = n.textContent;
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
        var mask = document.createElement("span"); mask.className = "sp-l";
        var inner = document.createElement("span");
        inner.textContent = part;
        if (isEm) inner.className = "rs";
        mask.appendChild(inner); el.appendChild(mask);
      });
    });
    return $$(".sp-l>span", el);
  }

  /* ---------- loader + intro ---------- */
  var cnt = $("#loaderCount"), crack = $("#crackPath");
  var prog = { v: 0 };
  var heroImg = $("#heroImg");
  var imgReady = new Promise(function (res) {
    if (heroImg.complete) return res();
    heroImg.addEventListener("load", res); heroImg.addEventListener("error", res);
    setTimeout(res, 3500);
  });
  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 2500); })]) : Promise.resolve();
  var ready = Promise.all([imgReady, fontsReady]);
  var loaded = false; ready.then(function () { loaded = true; });
  if (lenis) lenis.stop();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  gsap.set("#top", { yPercent: -100 });
  gsap.from(".loader__plaque", { opacity: 0, scale: .92, duration: .9, ease: "expo.out" });
  gsap.to(prog, {
    v: 100, duration: 1.5, ease: "power2.inOut",
    onUpdate: function () {
      var v = loaded ? prog.v : Math.min(prog.v, 88);
      crack.style.strokeDashoffset = 1 - v / 100; cnt.textContent = Math.round(v);
    },
    onComplete: function () { ready.then(startSite); }
  });

  var started = false;
  function startSite() {
    if (started) return; started = true;
    crack.style.strokeDashoffset = 0; cnt.textContent = "100";
    gsap.timeline({ onComplete: function () { loader.style.display = "none"; } })
      .to(".loader__plaque", { opacity: 0, scale: 1.06, duration: .45, ease: "power2.in" }, 0)
      .to(".loader__crack", { opacity: 0, duration: .3 }, .25)
      .to(".loader__half--l", { xPercent: -104, duration: 1.2, ease: "expo.inOut" }, .3)
      .to(".loader__half--r", { xPercent: 104, duration: 1.2, ease: "expo.inOut" }, .3);
    if (lenis) lenis.start();
    buildAll();
    var lines = $$(".hero__title .ln>span");
    var tl = gsap.timeline({ delay: .35, defaults: { ease: "expo.out" } });
    tl.fromTo("#heroImg", { scale: 1.3 }, { scale: 1.12, duration: 2.4, ease: "power3.out" }, 0)
      .fromTo(".hero__eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, .1)
      .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1.5, stagger: .14 }, .15)
      .fromTo(".hero__lead", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1 }, .75)
      .fromTo(".hero__actions>*", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, stagger: .12 }, .85)
      .fromTo(".seal", { opacity: 0, scale: .6, rotate: -40 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.4 }, 1)
      .to("#top", { yPercent: 0, duration: 1.1, clearProps: "transform" }, .6);
    setTimeout(function () { root.classList.add("top-ready"); }, 2200);
  }

  /* ---------- build scroll animations ---------- */
  function buildAll() {
    var mm = gsap.matchMedia();

    /* progress bar */
    gsap.to("#progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

    /* header: solid + hide on scroll down */
    var top = $("#top"), lastY = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var y = self.scroll();
        top.classList.toggle("is-solid", y > 60);
        if (root.classList.contains("top-ready")) {
          if (y > lastY && y > 500 && !menuOpen) top.classList.add("is-hidden");
          else if (y < lastY - 4 || y < 500) top.classList.remove("is-hidden");
        }
        lastY = y;
      }
    });

    /* active nav */
    $$(".nav a").forEach(function (a) {
      var t = $(a.getAttribute("href"));
      if (!t) return;
      ScrollTrigger.create({ trigger: t, start: "top 55%", end: "bottom 55%", onToggle: function (s) { a.classList.toggle("is-active", s.isActive); } });
    });

    /* hero parallax */
    gsap.to("#heroMedia", { yPercent: 14, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to("#heroContent", { yPercent: -10, opacity: .0, ease: "none", scrollTrigger: { trigger: "#hero", start: "55% top", end: "bottom 25%", scrub: true } });
    gsap.to("#seal", { yPercent: 60, rotate: 80, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

    /* marquee speeds up with scroll velocity */
    var mq = $(".marquee__track");
    if (mq && !reduce) {
      // drive the CSS animation via Web Animations API so we can change its rate
      var anim = mq.getAnimations && mq.getAnimations()[0];
      if (anim) {
        var rate = { v: 1 };
        ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) {
          var target = 1 + Math.min(Math.abs(self.getVelocity()) / 700, 5);
          gsap.to(rate, { v: target, duration: .3, overwrite: true, onUpdate: function () { anim.playbackRate = rate.v; } });
          gsap.to(rate, { v: 1, duration: 1.2, delay: .3, onUpdate: function () { anim.playbackRate = rate.v; } });
        } });
      }
    }

    /* statement: words light up with scroll */
    var st = $("#statement");
    var words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    st.setAttribute("aria-label", words.join(" "));
    gsap.to($$(".w", st), { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: st, start: "top 82%", end: "bottom 55%", scrub: .6 } });

    /* generic reveal */
    ScrollTrigger.batch("[data-reveal]:not(.foot [data-reveal])", {
      start: "top 76%", once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: .12 }); }
    });
    /* footer sits at the very end of the page, so it can never reach 76%: trigger as soon as it peeks in */
    ScrollTrigger.batch(".foot [data-reveal]", {
      start: "top 99%", once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: .12 }); }
    });

    /* headings stay on one line on desktop: shrink until the line fits its column */
    if (window.innerWidth >= 900) {
      $$(".h1[data-split], .h2[data-split]").forEach(function (h) {
        h.style.whiteSpace = "nowrap";
        h.style.width = "max-content";
        var p = h.parentElement, ps = getComputedStyle(p);
        var avail = p.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
        var size = parseFloat(getComputedStyle(h).fontSize);
        for (var i = 0; i < 4 && h.getBoundingClientRect().width > avail; i++) {
          size = Math.max(28, Math.floor(size * avail / h.getBoundingClientRect().width) - 1);
          h.style.fontSize = size + "px";
        }
        h.style.width = "";
      });
    }

    /* split headings */
    $$("[data-split]").forEach(function (h) {
      var label = h.textContent; h.setAttribute("aria-label", label);
      var inner = splitLines(h);
      h.querySelectorAll(".sp-l").forEach(function (m) { m.setAttribute("aria-hidden", "true"); });
      gsap.fromTo(inner, { yPercent: 115 }, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: .07, scrollTrigger: { trigger: h, start: "top 76%", once: true } });
    });

    /* image reveals + parallax */
    $$(".reveal-img").forEach(function (fig) {
      var img = $("img", fig);
      gsap.fromTo(fig, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: fig, start: "top 78%", once: true } });
      var wide = fig.classList.contains("story__img--wide");
      gsap.fromTo(img, { yPercent: wide ? -2 : -7, scale: wide ? 1.08 : 1.18 }, { yPercent: wide ? 2 : 7, scale: 1.04, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.fromTo(".light__a", { yPercent: 6 }, { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".light", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".light__b", { yPercent: -4 }, { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".light", start: "top bottom", end: "bottom top", scrub: true } });

    /* counters */
    $$("[data-count]").forEach(function (el) {
      var end = +el.dataset.count, o = { v: 0 }, nogroup = el.hasAttribute("data-nogroup");
      var fmt = function (n) { return nogroup ? String(Math.round(n)) : Math.round(n).toLocaleString("de-DE"); };
      el.textContent = fmt(0);
      ScrollTrigger.create({ trigger: el, start: "top 76%", once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 2.4, ease: "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } });
      } });
    });


    /* big year */
    gsap.fromTo("#bigYear", { yPercent: 25 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: ".story", start: "top bottom", end: "bottom bottom", scrub: true } });

    /* process steps */
    var steps = $$(".step"), stepsEl = $("#steps"), lastActive = -2;
    function updateSteps() {
      var r = stepsEl.getBoundingClientRect(), H = window.innerHeight;
      if (r.bottom < 0 || r.top > H) return;
      var mid = H * 0.5, active = -1;
      steps.forEach(function (s, i) { var q = s.getBoundingClientRect(); if (q.top < mid + 40) active = i; });
      if (active !== lastActive) {
        lastActive = active;
        steps.forEach(function (s, i) { s.classList.toggle("is-on", i <= active); s.classList.toggle("is-cur", i === active); });
      }
      var first = steps[0].getBoundingClientRect().top, last = steps[steps.length - 1].getBoundingClientRect().top;
      var p = last > first ? (mid + 40 - first) / (last - first) : 0;
      gsap.set("#stepsFill", { scaleY: Math.max(0, Math.min(1, p)) });
    }
    gsap.ticker.add(updateSteps);

    /* horizontal scroll (desktop only) */
    mm.add("(min-width: 900px)", function () {
      if (reduce) return;
      var track = $("#hsTrack"), barEl = $("#hsBar");
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 0); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: ".hs__sticky", start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 2,
          onUpdate: function (self) { barEl.style.transform = "scaleX(" + self.progress + ")"; } }
      });
      var panels = $$(".panel"), first = [], rest = [];
      panels.forEach(function (p) { (p.getBoundingClientRect().left < window.innerWidth * 0.92 ? first : rest).push(p); });
      gsap.fromTo(first, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.3, delay: .55, stagger: .16, ease: "expo.out", scrollTrigger: { trigger: "#leistungen", start: "top 76%", once: true } });
      rest.forEach(function (p) {
        gsap.fromTo(p, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 88%", toggleActions: "play none none none" } });
      });
      $$(".panel__img img").forEach(function (img) {
        gsap.fromTo(img, { scale: 1.25, xPercent: -6 }, { scale: 1.05, xPercent: 6, ease: "none", scrollTrigger: { trigger: img.closest(".panel"), containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });
    mm.add("(max-width: 899px)", function () {
      $$(".panel").forEach(function (p) {
        gsap.from(p, { opacity: 0, y: 50, duration: 1, ease: "expo.out", scrollTrigger: { trigger: p, start: "top 78%", once: true } });
      });
    });

    initShowroomLab(); initCursor(); initMagnet(); initFilms(); initGallery(); initForm();

    /* keep trigger positions correct when lazy images / fonts change the layout */
    var rt;
    var rf = function () { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 250); };
    $$("img").forEach(function (i) { if (!i.complete) i.addEventListener("load", rf, { once: true }); });
    if (document.readyState === "complete") rf(); else window.addEventListener("load", rf);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rf);
    ScrollTrigger.refresh();
  }

  /* ---------- custom cursor ---------- */
  function initCursor() {
    if (!fine || reduce) return;
    var c = $("#cursor"), lab = $("#cursorLabel");
    var xTo = gsap.quickTo(c, "x", { duration: .35, ease: "power3" });
    var yTo = gsap.quickTo(c, "y", { duration: .35, ease: "power3" });
    window.addEventListener("mousemove", function (e) { c.classList.add("is-on"); xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener("mouseleave", function () { c.classList.remove("is-on"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (t) { lab.textContent = t.getAttribute("data-cursor"); c.classList.add("is-big"); }
      else c.classList.remove("is-big");
    });
  }

  /* ---------- magnetic buttons ---------- */
  function initMagnet() {
    if (!fine || reduce) return;
    $$("[data-magnet]").forEach(function (b) {
      var xt = gsap.quickTo(b, "x", { duration: .6, ease: "elastic.out(1,.5)" });
      var yt = gsap.quickTo(b, "y", { duration: .6, ease: "elastic.out(1,.5)" });
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        xt((e.clientX - r.left - r.width / 2) * .28); yt((e.clientY - r.top - r.height / 2) * .35);
      });
      b.addEventListener("mouseleave", function () { xt(0); yt(0); });
    });
  }

  /* ---------- films ---------- */
  function initShowroomLab() {
    /* C: walkthrough */
    var wi = $$(".walk__img"), ws = $$(".walk__s"), wd = $$("#walkDots i"), wn = $("#walkNo"), cur = -1;
    function setWalk(i) { if (i === cur) return; cur = i; wi.forEach(function (x, k) { x.classList.toggle("is-on", k === i); }); ws.forEach(function (x, k) { x.classList.toggle("is-on", k === i); }); wd.forEach(function (x, k) { x.classList.toggle("is-on", k === i); }); wn.textContent = "0" + (i + 1); }
    if (!reduce && window.matchMedia("(min-width: 900px)").matches) {
      ScrollTrigger.create({ trigger: ".walk", start: "top top", end: "+=" + (ws.length * 70) + "%", pin: ".walk__sticky", refreshPriority: 1, onUpdate: function (s) { setWalk(Math.min(ws.length - 1, Math.floor(s.progress * ws.length))); } });
    }
  }

  function initFilms() {
    var stage = $("#stage"), poster = $("#stagePoster"), frame = $("#stageFrame"), ext = $("#stageExt");
    var title = $("#stageTitle"), no = $("#stageNo"), btns = $$(".pl");
    var cur = btns[0];
    function select(btn, play) {
      cur = btn;
      btns.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      frame.innerHTML = ""; stage.classList.remove("is-playing");
      var tour = btn.classList.contains("pl--tour");
      poster.src = btn.dataset.poster;
      no.textContent = tour ? "Virtueller Rundgang" : "Film " + btn.dataset.n.padStart(2, "0");
      title.textContent = tour ? "Ausstellung in 360°" : btn.dataset.title;
      stage.setAttribute("data-cursor", tour ? "Rundgang" : "Abspielen");
      if (play) start();
    }
    function start() {
      var src = cur.dataset.src;
      var f = document.createElement("iframe");
      f.src = src; f.allow = "autoplay; fullscreen; xr-spatial-tracking; gyroscope; accelerometer"; f.allowFullscreen = true;
      f.title = cur.classList.contains("pl--tour") ? "Virtueller Rundgang durch die Faig-Ausstellung" : "Faig Film " + cur.dataset.n;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      frame.innerHTML = ""; frame.appendChild(f);
      ext.href = src.replace("autostart=true", "autostart=false");
      stage.classList.add("is-playing");
      stage.removeAttribute("data-cursor");
      var c = $("#cursor"); if (c) c.classList.remove("is-big");
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { select(b, true); if (window.innerWidth < 1000) scrollToEl(stage); }); });
    $("#stagePlay").addEventListener("click", function () { start(); });
    stage.addEventListener("click", function (e) { if (!stage.classList.contains("is-playing") && e.target === stage) start(); });
    gsap.from(".playlist li", { opacity: 0, y: 24, duration: 1, stagger: .09, ease: "expo.out", clearProps: "all", scrollTrigger: { trigger: ".playlist", start: "top 76%", once: true } });
    gsap.from(stage, { opacity: 0, y: 60, scale: .96, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: stage, start: "top 78%", once: true } });
  }

  /* ---------- gallery + lightbox ---------- */
  function initGallery() {
    var items = $$(".g"), chips = $$(".chip");
    gsap.from(items, { opacity: 0, y: 50, duration: 1, stagger: { each: .06, from: "start" }, ease: "expo.out", scrollTrigger: { trigger: "#gal", start: "top 78%", once: true } });
    chips.forEach(function (ch) {
      ch.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.toggle("is-on", c === ch); });
        var f = ch.dataset.f, show = [];
        items.forEach(function (it) { var ok = f === "all" || it.dataset.c === f; if (ok) show.push(it); it.classList.toggle("is-hide", !ok); });
        gsap.fromTo(show, { opacity: 0, y: 30, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .8, stagger: .05, ease: "expo.out", clearProps: "transform" });
        ScrollTrigger.refresh();
      });
    });

    var lb = $("#lb"), img = $("#lbImg"), cap = $("#lbCap"), idx = 0, list = [];
    function show(i) {
      idx = (i + list.length) % list.length;
      var a = list[idx];
      img.src = a.getAttribute("href"); img.alt = $("img", a).alt; cap.textContent = $("span", a).textContent + "  ·  " + (idx + 1) + " / " + list.length;
    }
    function open(a) { list = items.filter(function (x) { return !x.classList.contains("is-hide"); }); show(list.indexOf(a)); lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false"); if (lenis) lenis.stop(); }
    function close() { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); if (lenis) lenis.start(); }
    items.forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); open(a); }); });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", function () { show(idx - 1); });
    $("#lbNext").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- form (opens mail client) ---------- */
  function initForm() {
    var f = $("#form"), note = $("#formNote");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = false;
      ["name", "mail", "msg"].forEach(function (n) {
        var el = f.elements[n]; var ok = el.value.trim() && (n !== "mail" || /.+@.+\..+/.test(el.value));
        el.classList.toggle("is-err", !ok); if (!ok) bad = true;
      });
      if (bad) { note.textContent = "Bitte füllen Sie Name, E-Mail und Nachricht aus."; return; }
      var body = "Name: " + f.elements.name.value + "\nE-Mail: " + f.elements.mail.value + "\nTelefon: " + (f.elements.tel.value || "-") + "\nProjekt: " + f.elements.topic.value + "\n\n" + f.elements.msg.value;
      location.href = "mailto:info@faig.de?subject=" + encodeURIComponent("Anfrage Naturstein – " + f.elements.topic.value) + "&body=" + encodeURIComponent(body);
      note.textContent = "Ihr E-Mail-Programm wurde geöffnet. Alternativ erreichen Sie uns unter +49 (0) 9090 2450.";
    });
  }

  /* ---------- mobile menu ---------- */
  var menuOpen = false;
  var burger = $("#burger"), mob = $("#mobileNav");
  function closeMenu() { if (!menuOpen) return; menuOpen = false; burger.setAttribute("aria-expanded", "false"); mob.classList.remove("is-open"); mob.setAttribute("aria-hidden", "true"); if (lenis) lenis.start(); }
  burger.addEventListener("click", function () {
    menuOpen = !menuOpen; burger.setAttribute("aria-expanded", menuOpen); mob.classList.toggle("is-open", menuOpen); mob.setAttribute("aria-hidden", !menuOpen);
    if (lenis) menuOpen ? lenis.stop() : lenis.start();
  });

  function initBasics() {
    $("#yr").textContent = new Date().getFullYear();
    var b = $("#burger"), m = $("#mobileNav");
    b.addEventListener("click", function () { var o = m.classList.toggle("is-open"); b.setAttribute("aria-expanded", o); });
  }
})();
