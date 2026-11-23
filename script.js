(() => {
  const U = 'https://faig.de/wp-content/uploads/';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => innerWidth > 900;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const HEAD = () => document.getElementById('top').offsetHeight;

  /* ---------- Smooth scrolling (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.3, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id === '#' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#' ? 0 : -HEAD() + 1 });
    }));
  }

  /* ---------- Loader → hero intro ---------- */
  const loader = document.getElementById('loader');
  const heroImg = document.getElementById('heroImg');
  let started = false;
  const start = () => {
    if (started) return; started = true;
    loader.classList.add('is-done');
    setTimeout(() => {
      root.classList.add('is-loaded', 'is-intro');
      heroImg.classList.add('is-live');
      setTimeout(() => root.classList.remove('is-intro'), 1400);
      startAuto();
    }, reduce ? 0 : 450);
    setTimeout(() => loader.remove(), 1600);
  };
  const t0 = performance.now(), minShow = reduce ? 0 : 1500;
  const ready = () => setTimeout(start, Math.max(0, minShow - (performance.now() - t0)));
  if (heroImg.complete) ready(); else { heroImg.addEventListener('load', ready, { once: true }); heroImg.addEventListener('error', ready, { once: true }); }
  setTimeout(start, 4000);

  /* ---------- Hero picker: auto-advance with progress line ---------- */
  const heroCap = document.getElementById('heroCap');
  const picker = document.querySelector('.picker');
  const items = [...document.querySelectorAll('.picker__item')];
  const DURATION = 6000;
  picker.style.setProperty('--pick', DURATION + 'ms');
  let current = 0, timer = null, remaining = DURATION, tStart = 0;
  const restartBar = btn => { const bar = btn.querySelector('.picker__bar'); bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = ''; };
  const go = i => {
    current = (i + items.length) % items.length;
    const btn = items[current];
    items.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    restartBar(btn);
    heroImg.classList.add('is-fading');
    setTimeout(() => {
      heroImg.style.transition = 'none';
      heroImg.classList.remove('is-live');
      heroImg.src = btn.dataset.src; heroImg.alt = btn.dataset.caption;
      heroCap.textContent = btn.dataset.caption;
      const show = () => { void heroImg.offsetWidth; heroImg.style.transition = ''; heroImg.classList.remove('is-fading'); heroImg.classList.add('is-live'); };
      heroImg.complete ? show() : heroImg.addEventListener('load', show, { once: true });
    }, 450);
  };
  const schedule = ms => { clearTimeout(timer); tStart = performance.now(); remaining = ms; timer = setTimeout(() => { go(current + 1); schedule(DURATION); }, ms); };
  function startAuto() { if (!reduce) { restartBar(items[0]); schedule(DURATION); } }
  items.forEach((btn, i) => {
    const pre = new Image(); pre.src = btn.dataset.src;
    btn.addEventListener('click', () => { if (i !== current) { go(i); schedule(DURATION); } });
  });
  picker.addEventListener('mouseenter', () => { clearTimeout(timer); remaining -= performance.now() - tStart; picker.classList.add('is-paused'); });
  picker.addEventListener('mouseleave', () => { picker.classList.remove('is-paused'); if (started && !reduce) schedule(Math.max(remaining, 300)); });

  /* ---------- Header (static) + mobile menu + current section ---------- */
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? 'Schließen' : 'Menü';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', false); menuBtn.textContent = 'Menü';
  }));
  const links = [...nav.querySelectorAll('a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id)); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = document.querySelector(l.getAttribute('href')); if (s) spy.observe(s); });

  /* ---------- Project tiles (all photos from faig.de) ---------- */
  const projects = [
    ['Faig_1464.jpg', 'Bad mit dunklem Marmor'],
    ['drossel_faig_bad_naturstein_irish_green_avorio_9784.jpg', 'Bad in Irish Green und Avorio'],
    ['Faig-Kueche_Taj-Mahal-4.jpeg', 'Küche in Taj Mahal Quarzit'],
    ['faig-steinmetzbetrieb-referenezen-51.jpg', 'Wendeltreppe'],
    ['drossel_faig_bad_naturstein_patagonia_nero_assoulto_minibad_9876.jpg', 'Bad in Patagonia und Nero Assoluto'],
    ['Faig_Kueche-Tesla.jpeg', 'Küche mit hinterleuchtetem Stein'],
    ['drossel_faig_hotel_naturstein_sequoia_brown_tresen_9760.jpg', 'Hoteltresen in Sequoia Brown'],
    ['Faig-Kamin_-Patagonia-green.jpeg', 'Kamin in Patagonia Green'],
    ['Faig_Bad_Lumix-und-Taj-Mahal.jpeg', 'Bad in Lumix und Taj Mahal'],
    ['Faig_1552.jpg', 'Küche mit Natursteinplatte'],
    ['faig-steinmetzbetrieb-referenezen-49.jpg', 'Treppe mit Natursteinstufen'],
    ['drossel_faig_büro_rezeption_naturstein_greystone_9834.jpg', 'Empfang in Greystone'],
    ['Faig_1587.jpg', 'Küche mit Natursteinplatte'],
    ['Faig_Wellnes_Adler.jpeg', 'Wellnessbereich, Hotel Adler'],
    ['Faig-Kamin_Taj-Mahal.jpeg', 'Kamin in Taj Mahal'],
    ['Faig_1602.jpg', 'Eingangsbereich mit Natursteinboden'],
    ['Faig-Kueche_Taj-Mahal-3.jpeg', 'Küche in Taj Mahal Quarzit'],
    ['Faig_Kueche-Lumix.jpeg', 'Küche in Lumix'],
    ['drossel_faig_bad_naturstein_irish_green_avorio_9782.jpg', 'Bad in Irish Green und Avorio'],
    ['Faig_1248.jpg', 'Grabmal mit Madonna']
  ];
  const tiles = document.getElementById('tiles');
  tiles.innerHTML = projects.map(([f, c], i) =>
    `<figure class="pic${i >= 8 ? ' is-extra' : ''}" data-lb><img src="${U}${f}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`
  ).join('');

  /* ---------- One-time reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  const stagger = (els, step) => els.forEach((el, i) => el.style.setProperty('--d', (i * step).toFixed(2) + 's'));
  document.querySelectorAll('.intro-row, .textcol, .note__text, .services, .about__text, .showroom__panel, .contact__lead, .contact__side').forEach(group => {
    const kids = [...group.querySelectorAll(':scope > h2, :scope > h3, :scope > p, :scope > a, :scope > dl, :scope > div > p, :scope > ul > li, :scope > form')];
    kids.forEach(k => k.classList.add('rv')); stagger(kids, 0.08); kids.forEach(k => io.observe(k));
  });
  document.querySelectorAll('.row, .note__pics, .tiles').forEach(row => {
    const pics = [...row.querySelectorAll(':scope > .pic')];
    pics.forEach(p => p.classList.add('wipe')); stagger(pics, 0.12);
  });
  document.querySelectorAll('.pano, .about__pic').forEach(el => el.classList.add('wipe'));
  document.querySelectorAll('.wipe').forEach(el => io.observe(el));
  const steps = [...document.querySelectorAll('.process li')];
  steps.forEach(s => s.classList.add('rv')); stagger(steps, 0.12); steps.forEach(s => io.observe(s));

  const moreBtn = document.getElementById('moreBtn');
  moreBtn.addEventListener('click', () => {
    const all = tiles.classList.toggle('show-all');
    moreBtn.textContent = all ? 'Weniger zeigen' : 'Weitere Projekte zeigen';
    if (all) {
      [...tiles.querySelectorAll('.is-extra')].forEach((p, i) => { p.classList.remove('in'); p.style.setProperty('--d', ((i % 4) * 0.1) + 's'); io.observe(p); });
      lenis && lenis.resize(); measure();
    } else {
      lenis ? lenis.scrollTo('#projekte', { offset: -HEAD() }) : document.getElementById('projekte').scrollIntoView();
      measure();
    }
  });

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t = performance.now(), dur = 2000;
      const tick = now => { const p = Math.min((now - t) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toLocaleString('de-DE'); if (p < 1) requestAnimationFrame(tick); };
      if (!reduce) requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.8 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* =========================================================
     SCROLL-LINKED MOTION
     ========================================================= */
  // statement: split into words
  const statement = document.getElementById('statement');
  statement.innerHTML = statement.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = [...statement.querySelectorAll('.w')];

  const heroPin = document.getElementById('heroPin');
  const hero = document.getElementById('hero');
  const heroMedia = document.getElementById('heroMedia');
  const heroText = document.getElementById('heroText');
  const heroSlot = document.getElementById('heroSlot');
  const hs = document.getElementById('baeder');
  const hsSticky = hs.querySelector('.hs__sticky');
  const hsTrack = document.getElementById('hsTrack');
  const hsFrames = [...hsTrack.querySelectorAll('.hs__frame')];
  const hsBar = document.getElementById('hsBar');
  const hsCount = document.getElementById('hsCount');
  const pano = document.querySelector('.pano');
  const showMedia = document.getElementById('showMedia');
  const parImgs = [...document.querySelectorAll('.pic img, .about__pic img, #showMedia img')];
  const stonesTrack = document.querySelector('.stones__track');

  let base = { t: 0, r: 0, b: 0, l: 0 }, hsDist = 0;
  function measure() {
    if (desktop() && !reduce) {
      // hero: where the right column sits inside the hero
      const h = hero.getBoundingClientRect(), s = heroSlot.getBoundingClientRect();
      base = { t: s.top - h.top, r: h.right - s.right, b: h.bottom - s.bottom, l: s.left - h.left };
      // horizontal gallery: section height = travel distance + one screen
      hsDist = Math.max(0, hsTrack.scrollWidth - innerWidth);
      hs.style.height = (hsDist + hsSticky.offsetHeight) + 'px';
    } else {
      hs.style.height = '';
      ['--ct', '--cr', '--cb', '--cl'].forEach(v => hero.style.removeProperty(v));
      heroText.style.cssText = '';
    }
    lenis && lenis.resize();
  }
  addEventListener('resize', () => { measure(); frame(true); });
  addEventListener('load', () => { measure(); frame(true); });
  document.fonts && document.fonts.ready.then(() => { measure(); frame(true); });
  measure();

  let lastY = -1, vel = 0, dir = 1, mx = 0;
  function frame(force) {
    const y = scrollY, vh = innerHeight;
    const delta = y - (lastY < 0 ? y : lastY);
    if (delta !== 0) dir = delta > 0 ? 1 : -1;
    vel += (Math.abs(delta) - vel) * 0.1;

    // stones marquee: always moves; faster with scroll, follows direction
    if (!reduce) {
      const half = stonesTrack.scrollWidth / 2;
      mx -= (0.5 + vel * 0.35) * dir;
      if (mx <= -half) mx += half; if (mx > 0) mx -= half;
      stonesTrack.style.transform = `translate3d(${mx.toFixed(1)}px,0,0)`;
    }
    if (y === lastY && !force) return;
    lastY = y;
    if (reduce) return;

    if (desktop()) {
      // HERO: clip opens from right column to full screen
      const head = HEAD();
      const pr = heroPin.getBoundingClientRect();
      const travel = heroPin.offsetHeight - hero.offsetHeight;
      const p = clamp((head - pr.top) / travel);
      const e = ease(clamp(p / 0.7));
      hero.style.setProperty('--ct', (base.t * (1 - e)).toFixed(1) + 'px');
      hero.style.setProperty('--cr', (base.r * (1 - e)).toFixed(1) + 'px');
      hero.style.setProperty('--cb', (base.b * (1 - e)).toFixed(1) + 'px');
      hero.style.setProperty('--cl', (base.l * (1 - e)).toFixed(1) + 'px');
      hero.style.setProperty('--p', e.toFixed(3));
      hero.style.setProperty('--shade', e.toFixed(3));
      hero.style.setProperty('--over', clamp((p - 0.55) / 0.3).toFixed(3));
      if (root.classList.contains('is-loaded')) {
        heroText.style.opacity = clamp(1 - e * 1.8).toFixed(3);
        heroText.style.transform = `translate3d(0,${(-e * 80).toFixed(1)}px,0)`;
        heroText.style.pointerEvents = e > 0.4 ? 'none' : '';
      }

      // BÄDER: horizontal travel
      const hr = hs.getBoundingClientRect();
      const hp = clamp((head - hr.top) / Math.max(1, hs.offsetHeight - hsSticky.offsetHeight));
      hsTrack.style.transform = `translate3d(${(-hp * hsDist).toFixed(1)}px,0,0)`;
      hsBar.style.setProperty('--hp', hp.toFixed(3));
      hsCount.textContent = String(Math.min(hsFrames.length, Math.round(hp * (hsFrames.length - 1)) + 1)).padStart(2, '0') + ' / ' + String(hsFrames.length).padStart(2, '0');
      hsFrames.forEach(f => {
        const r = f.getBoundingClientRect();
        if (r.right < -200 || r.left > innerWidth + 200) return;
        const c = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
        f.firstElementChild.style.setProperty('--hx', (-c * 8).toFixed(2) + '%');
      });
    }

    // STATEMENT: words light up
    const sr = statement.getBoundingClientRect();
    const sp = clamp((vh * 0.85 - sr.top) / (vh * 0.55 + sr.height * 0.4));
    const n = words.length;
    words.forEach((w, i) => w.style.setProperty('--o', (0.14 + 0.86 * clamp(sp * n - i)).toFixed(2)));

    // photos drift inside their frames
    parImgs.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const c = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      img.style.setProperty('--py', (-c * 12).toFixed(2) + '%');
    });

    // TREPPEN pano: zoom out
    const pr2 = pano.getBoundingClientRect();
    const pz = clamp((vh - pr2.top) / (vh + pr2.height * 0.5));
    pano.firstElementChild.style.setProperty('--ps', (1.25 - 0.25 * pz).toFixed(4));

    // SHOWROOM: photo opens
    const mr = showMedia.getBoundingClientRect();
    const q = ease(clamp((vh - mr.top) / (vh * 0.85)));
    showMedia.style.setProperty('--si', (12 * (1 - q)).toFixed(2) + '%');
    showMedia.style.setProperty('--ss', (1.2 - 0.2 * q).toFixed(4));
  }

  const loop = t => { lenis && lenis.raf(t); frame(false); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  frame(true);

  /* ---------- Cursor over photos ---------- */
  const cursor = document.getElementById('cursor');
  const lb = document.getElementById('lb');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    let x = -200, y = -200, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cursor.classList.toggle('is-on', !!e.target.closest('[data-lb]') && lb.hidden); }, { passive: true });
    const follow = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; cursor.style.setProperty('--cx', cx.toFixed(1) + 'px'); cursor.style.setProperty('--cy', cy.toFixed(1) + 'px'); requestAnimationFrame(follow); };
    follow();
  }

  /* ---------- Lightbox ---------- */
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let group = [], idx = 0, lastFocus = null;
  const visible = el => el.offsetParent !== null;
  const show = i => {
    idx = (i + group.length) % group.length;
    const img = group[idx].querySelector('img');
    lbImg.style.opacity = 0;
    setTimeout(() => {
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = group[idx].querySelector('figcaption')?.textContent.replace(/^\d+/, '').trim() || img.alt;
      lbImg.onload = () => (lbImg.style.opacity = 1);
      if (lbImg.complete) lbImg.style.opacity = 1;
    }, 150);
  };
  const open = fig => {
    group = [...fig.closest('section').querySelectorAll('[data-lb]')].filter(visible);
    lastFocus = document.activeElement;
    show(group.indexOf(fig));
    lb.hidden = false; requestAnimationFrame(() => lb.classList.add('is-open'));
    lenis ? lenis.stop() : (document.body.style.overflow = 'hidden');
    cursor.classList.remove('is-on');
    lb.querySelector('.lb__close').focus();
  };
  const close = () => {
    lb.classList.remove('is-open');
    setTimeout(() => { lb.hidden = true; }, 400);
    lenis ? lenis.start() : (document.body.style.overflow = '');
    lastFocus?.focus();
  };
  document.addEventListener('click', e => { const fig = e.target.closest('[data-lb]'); if (fig && !lb.contains(fig)) open(fig); });
  lb.querySelector('.lb__close').addEventListener('click', close);
  lb.querySelector('.lb__prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb__next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---------- Contact form opens an e-mail ---------- */
  document.getElementById('form').addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const body = `Name: ${d.get('name')}\nTelefon: ${d.get('tel')}\nThema: ${d.get('thema')}\n\n${d.get('msg')}`;
    location.href = `mailto:info@faig.de?subject=${encodeURIComponent('Terminanfrage: ' + d.get('thema'))}&body=${encodeURIComponent(body)}`;
  });
})();
