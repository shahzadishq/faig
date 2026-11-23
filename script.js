(() => {
  const U = 'https://faig.de/wp-content/uploads/';
  const root = document.documentElement;

  /* ---------- Hero load: one orchestrated reveal ---------- */
  const heroImg = document.getElementById('heroImg');
  const reveal = () => root.classList.add('is-loaded');
  if (heroImg.complete) requestAnimationFrame(reveal);
  else { heroImg.addEventListener('load', reveal, { once: true }); heroImg.addEventListener('error', reveal, { once: true }); }
  setTimeout(reveal, 2500);

  /* ---------- Hero picker (user-triggered image swap) ---------- */
  const heroCap = document.getElementById('heroCap');
  const items = [...document.querySelectorAll('.picker__item')];
  items.forEach(btn => {
    const pre = new Image(); pre.src = btn.dataset.src;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      items.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
      heroImg.classList.add('is-fading');
      setTimeout(() => {
        heroImg.src = btn.dataset.src;
        heroImg.alt = btn.dataset.caption;
        heroCap.textContent = btn.dataset.caption;
        const done = () => heroImg.classList.remove('is-fading');
        heroImg.complete ? done() : heroImg.addEventListener('load', done, { once: true });
      }, 350);
    });
  });

  /* ---------- Header ---------- */
  const top = document.getElementById('top');
  const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  // highlight current section in nav
  const links = [...nav.querySelectorAll('a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id));
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
    // extra
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
  const moreBtn = document.getElementById('moreBtn');
  moreBtn.addEventListener('click', () => {
    const all = tiles.classList.toggle('show-all');
    moreBtn.textContent = all ? 'Weniger zeigen' : 'Weitere Projekte zeigen';
    if (!all) document.getElementById('projekte').scrollIntoView();
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let group = [], idx = 0, lastFocus = null;
  const visible = el => el.offsetParent !== null;
  const show = i => {
    idx = (i + group.length) % group.length;
    const img = group[idx].querySelector('img');
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = group[idx].querySelector('figcaption')?.textContent || img.alt;
  };
  const open = fig => {
    group = [...fig.closest('section').querySelectorAll('[data-lb]')].filter(visible);
    lastFocus = document.activeElement;
    show(group.indexOf(fig));
    lb.hidden = false; document.body.style.overflow = 'hidden';
    lb.querySelector('.lb__close').focus();
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); };
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
