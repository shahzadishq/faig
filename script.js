(() => {
  const U = 'https://faig.de/wp-content/uploads/';
  const R = n => `faig-steinmetzbetrieb-referenezen-${n}.jpg`;

  /* ---------- Referenzen data (all from faig.de) ---------- */
  const refs = {
    bad: [
      'Faig_Bad_Patagonia-und-Avorio-San-Sebastian.jpeg','Faig_Bad_Patagonia-green-und-Avorio-San-Sebastian.jpeg','Faig_Bad_Lumix-und-Taj-Mahal.jpeg',
      'Faig_1511.jpg','Faig_1523.jpg','Faig_1534.jpg','Faig_1540.jpg','Faig_1546.jpg',
      R(45),R(44),R(41),R(42),R(40),R(14),R(13),R(22),R(20),R(17),R(10),R('09'),R('04'),
      'drossel_faig_bad_naturstein_irish_green_avorio_9782.jpg','drossel_faig_bad_naturstein_irish_green_avorio_9787.jpg','drossel_faig_bad_naturstein_irish_green_avorio_9794.jpg',
      'drossel_faig_bad_naturstein_patagonia_nero_assoulto_minibad_9876.jpg','drossel_faig_bad_naturstein_patagonia_nero_assoulto_minibad_9901.jpg',
      'drossel_faig_naturstein_patagonia_nero_assolutto_9915.jpg','drossel_faig_naturstein_patagonia_nero_assolutto_9916.jpg','drossel_faig_naturstein_patagonia_nero_assolutto_9927.jpg',
      'faig_bad_1293.jpg','faig_bad_3196_1.jpg','Faig_1450.jpg','Faig_1455.jpg','Faig_1464.jpg','Faig_1449.jpg',
      'Faig_Wellnes_Adler3.jpeg','Faig_Wellnes_Adler2.jpeg','Faig_Wellnes_Adler.jpeg'
    ],
    treppe: ['startbild-wendeltreppe.jpg','Faig_1513.jpg','Faig_1522.jpg','Faig_1602.jpg',R(49),R(51),R(52),R(53),R(50),R(48),'startbild-eingangsbereich.jpg'],
    kueche: ['Faig-Kueche_Patagonia-hinterleuchtet.jpeg','Faig-Kueche_Taj-Mahal-2.jpeg','Faig-Kueche_Taj-Mahal.jpeg','Faig-Kueche_Taj-Mahal-4.jpeg','Faig-Kueche_Taj-Mahal-3.jpeg',
      'Faig_1552.jpg','Faig_1587.jpg','Faig_1425.jpg','Faig_1424.jpg','Faig_1290.jpg','APL-Taj-Mahal.jpg','Faig_Kueche.jpeg','Faig_Kueche-Woodstone.jpeg','Faig_Kueche-Tesla.jpeg','Faig_Kueche-Lumix.jpeg',
      'Faig-Kamin_Taj-Mahal.jpeg','Faig-Kamin_-Patagonia-green.jpeg','kuechen-1.jpg','IMG_5760.jpg'],
    grab: ['Grabmal-Faig_Altisheim_Kleinziegenfelder.jpeg','Grabmal-Faig_Wallerdorf.jpeg','Grabmal-Faig_Rain-2.jpeg','Grabmal-Faig_Poettmes.jpeg','Grabmal-Faig_Oberndorf.jpeg',
      'Grabmal-Faig_Pfaffenhofen_Lumix-und-Avorio-San-Sebastian.jpeg','Grabmal-Faig_Pannonia-Gruen-und-Impala.jpeg','Grabmal-Faig_Feldheim.jpeg','Grabmal-Faig_Holzheim.jpeg',
      'Grabmal-Faig_Impala-und-Taj-Mahal.jpeg','Faig_1273.jpg','Faig_1248.jpg','Faig_1240.jpg','Faig_1253.jpg']
  };

  /* interleave categories so "Alle" looks varied */
  const order = [];
  const keys = Object.keys(refs);
  const max = Math.max(...keys.map(k => refs[k].length));
  for (let i = 0; i < max; i++) keys.forEach(k => { if (refs[k][i]) order.push([k, refs[k][i]]); });

  const masonry = document.getElementById('masonry');
  masonry.innerHTML = order.map(([cat, f]) =>
    `<figure data-cat="${cat}" data-lightbox><img src="${U}${f}" alt="Referenz Faig – ${cat}" loading="lazy" onerror="this.parentElement.remove()"></figure>`
  ).join('');

  /* ---------- Loader ---------- */
  const finishLoad = () => {
    document.getElementById('loader').classList.add('done');
    document.body.classList.add('ready');
  };
  window.addEventListener('load', () => setTimeout(finishLoad, 600));
  setTimeout(finishLoad, 3200); // fallback

  /* ---------- Header ---------- */
  const header = document.getElementById('header');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    header.classList.toggle('hide', y > lastY && y > 700 && !nav.classList.contains('open'));
    lastY = y;
  };
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  burger.addEventListener('click', () => { nav.classList.toggle('open'); burger.classList.toggle('open'); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.classList.remove('open'); }));

  /* ---------- Hero slider ---------- */
  const slides = [...document.querySelectorAll('.hero__slide')];
  const slideNo = document.getElementById('slideNo');
  const slideLabel = document.getElementById('slideLabel');
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
    slideNo.textContent = String(current + 1).padStart(2, '0');
    slideLabel.style.opacity = 0;
    setTimeout(() => { slideLabel.innerHTML = slides[current].dataset.label; slideLabel.style.opacity = 1; }, 400);
  }, 6500);

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .clip, .masonry figure').forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count;
      const start = end > 1000 && end < 2100 ? 1700 : 0;
      const t0 = performance.now(), dur = 1800;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const v = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
        el.textContent = end >= 5000 ? v.toLocaleString('de-DE') : v;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Parallax ---------- */
  const pars = [...document.querySelectorAll('.parallax')];
  const parallax = () => {
    const vh = window.innerHeight;
    pars.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      img.style.transform = `translate3d(0, ${(-p * 8) - 8}%, 0)`;
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); parallax(); ticking = false; });
  }, { passive: true });
  parallax();

  /* ---------- Services hover preview ---------- */
  const preview = document.getElementById('servicePreview');
  document.querySelectorAll('#serviceList li').forEach(li => {
    const pre = new Image(); pre.src = li.dataset.img;
    li.addEventListener('mouseenter', () => {
      if (li.classList.contains('is-active')) return;
      document.querySelector('#serviceList li.is-active')?.classList.remove('is-active');
      li.classList.add('is-active');
      preview.classList.add('swap');
      setTimeout(() => { preview.src = li.dataset.img; preview.classList.remove('swap'); }, 300);
    });
  });

  /* ---------- Filters ---------- */
  document.querySelectorAll('#filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('#filters .is-active').classList.remove('is-active');
      btn.classList.add('is-active');
      const f = btn.dataset.f;
      masonry.querySelectorAll('figure').forEach(fig => {
        const show = f === 'all' || fig.dataset.cat === f;
        fig.classList.toggle('hidden', !show);
        if (show) { fig.classList.remove('in'); requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('in'))); }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  let group = [], idx = 0;
  const visibleGroup = el => {
    const scope = el.closest('section') || document;
    return [...scope.querySelectorAll('[data-lightbox]')].filter(f => !f.classList.contains('hidden')).map(f => f.querySelector('img').src);
  };
  const show = i => { idx = (i + group.length) % group.length; lbImg.src = group[idx]; };
  document.addEventListener('click', e => {
    const fig = e.target.closest('[data-lightbox]');
    if (!fig) return;
    group = visibleGroup(fig);
    show(group.indexOf(fig.querySelector('img').src));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---------- Contact form → mail ---------- */
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const body = `Name: ${d.get('name')}\nTelefon: ${d.get('tel')}\nThema: ${d.get('thema')}\n\n${d.get('msg')}`;
    window.location.href = `mailto:info@faig.de?subject=${encodeURIComponent('Beratungstermin – ' + d.get('thema'))}&body=${encodeURIComponent(body)}`;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
