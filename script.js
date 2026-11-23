(() => {
  const U = 'https://faig.de/wp-content/uploads/';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth scrolling (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.25, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id === '#' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#' ? 0 : -70 });
    }));
  }
  const scrollY = () => window.scrollY;

  /* ---------- Loader → hero sequence ---------- */
  const loader = document.getElementById('loader');
  const heroImg = document.getElementById('heroImg');
  let started = false;
  const start = () => {
    if (started) return; started = true;
    loader.classList.add('is-done');
    setTimeout(() => {
      root.classList.add('is-loaded');
      heroImg.classList.add('is-live');
      startAuto();
    }, reduce ? 0 : 450);
    setTimeout(() => loader.remove(), 1600);
  };
  const minShow = reduce ? 0 : 1500;
  const t0 = performance.now();
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

  const restartBar = btn => {
    const bar = btn.querySelector('.picker__bar');
    bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
  };
  const go = i => {
    current = (i + items.length) % items.length;
    const btn = items[current];
    items.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    restartBar(btn);
    heroImg.classList.add('is-fading');
    setTimeout(() => {
      heroImg.style.transition = 'none';
      heroImg.classList.remove('is-live');
      heroImg.src = btn.dataset.src;
      heroImg.alt = btn.dataset.caption;
      heroCap.textContent = btn.dataset.caption;
      const show = () => {
        void heroImg.offsetWidth;
        heroImg.style.transition = '';
        heroImg.classList.remove('is-fading');
        heroImg.classList.add('is-live');
      };
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

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  const top = document.getElementById('top');
  const nav = document.getElementById('nav');
  let lastY = 0;
  const onHeader = y => {
    top.classList.toggle('is-scrolled', y > 10);
    top.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;
  };

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
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id));
    });
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

  /* ---------- Scroll reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      if (el.classList.contains('wipe')) setTimeout(() => el.classList.add('done'), 2000);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  const stagger = (els, step) => els.forEach((el, i) => el.style.setProperty('--d', (i * step).toFixed(2) + 's'));
  const mark = (sel, cls) => [...document.querySelectorAll(sel)].map(el => { el.classList.add(cls); return el; });

  // text
  document.querySelectorAll('.intro-row, .textcol, .note__text, .services, .about__text, .showroom__panel, .contact__lead, .contact__side').forEach(group => {
    const kids = [...group.querySelectorAll(':scope > h2, :scope > h3, :scope > p, :scope > a, :scope > dl, :scope > div > p, :scope > ul > li, :scope > form')];
    kids.forEach(k => k.classList.add('rv'));
    stagger(kids, 0.08);
    kids.forEach(k => io.observe(k));
  });
  // images: rows stagger left to right
  document.querySelectorAll('.row, .note__pics, .tiles').forEach(row => {
    const pics = [...row.querySelectorAll(':scope > .pic')];
    pics.forEach(p => p.classList.add('wipe'));
    stagger(pics, 0.12);
  });
  mark('.pano, .about__pic', 'wipe');
  document.querySelectorAll('.wipe').forEach(el => io.observe(el));
  // process steps
  const steps = [...document.querySelectorAll('.process li')];
  steps.forEach(s => s.classList.add('rv'));
  stagger(steps, 0.12);
  steps.forEach(s => io.observe(s));

  const moreBtn = document.getElementById('moreBtn');
  moreBtn.addEventListener('click', () => {
    const all = tiles.classList.toggle('show-all');
    moreBtn.textContent = all ? 'Weniger zeigen' : 'Weitere Projekte zeigen';
    if (all) {
      const extra = [...tiles.querySelectorAll('.is-extra')];
      extra.forEach((p, i) => { p.classList.remove('in', 'done'); p.style.setProperty('--d', ((i % 4) * 0.1) + 's'); io.observe(p); });
      lenis && lenis.resize();
    } else {
      lenis ? lenis.scrollTo('#projekte', { offset: -70 }) : document.getElementById('projekte').scrollIntoView();
    }
  });

  /* ---------- Counters ---------- */
  const fmt = n => n.toLocaleString('de-DE');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t = performance.now(), dur = 2000;
      const tick = now => {
        const p = Math.min((now - t) / dur, 1);
        el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick);
      };
      if (!reduce) requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.8 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Parallax ---------- */
  const pars = [...document.querySelectorAll('[data-parallax]')];
  const parallax = () => {
    const vh = innerHeight;
    pars.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // ≈ -0.5..0.5
      img.style.setProperty('--py', (-p * 14).toFixed(2) + '%');
    });
  };

  /* ---------- Scroll loop ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { onHeader(scrollY()); if (!reduce) parallax(); ticking = false; });
  };
  if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Cursor over photos ---------- */
  const cursor = document.getElementById('cursor');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    let x = -200, y = -200, cx = x, cy = y;
    addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      cursor.classList.toggle('is-on', !!e.target.closest('[data-lb]') && lb.hidden);
    }, { passive: true });
    const follow = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cursor.style.setProperty('--cx', cx.toFixed(1) + 'px');
      cursor.style.setProperty('--cy', cy.toFixed(1) + 'px');
      requestAnimationFrame(follow);
    };
    follow();
  }

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lb');
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
      lbCap.textContent = group[idx].querySelector('figcaption')?.textContent || img.alt;
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
  document.addEventListener('click', e => {
    const fig = e.target.closest('[data-lb]');
    if (fig && !lb.contains(fig)) open(fig);
  });
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
