(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Chargement orchestré du hero
  const ready = () => requestAnimationFrame(() => d.body.classList.add('is-ready'));
  if (d.readyState === 'complete') ready(); else addEventListener('load', ready);
  setTimeout(ready, 1200);

  // Nav : bordure au scroll
  const nav = d.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Menu mobile
  const burger = d.querySelector('.nav__burger'), menu = d.querySelector('.menu');
  if (burger && menu) {
    const set = (open) => {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.innerHTML = open ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
      d.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  // Sélecteur de langue (maquette : FR seulement)
  d.querySelectorAll('.nav__lang button').forEach(b => b.addEventListener('click', () => {
    d.querySelectorAll('.nav__lang button').forEach(x => x.setAttribute('aria-pressed', x === b));
  }));

  // Révélations légères
  const rv = d.querySelectorAll('[data-rv]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    rv.forEach((el, i) => { el.style.transitionDelay = (el.dataset.rv || 0) * 80 + 'ms'; io.observe(el); });
  } else rv.forEach(el => el.classList.add('is-in'));

  // Compteurs
  const fmt = (n, dec) => n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const counters = d.querySelectorAll('[data-count]');
  const run = (el) => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (reduce) { el.textContent = fmt(to, dec); return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
    counters.forEach(c => io.observe(c));
  } else counters.forEach(run);

  // Frise patrimoniale : les années s'allument au défilement
  const years = [...d.querySelectorAll('.year')];
  if (years.length) {
    const light = () => {
      const line = innerHeight * 0.72;
      const box = d.querySelector('.years').getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (line - box.top) / (innerHeight * 0.5)));
      const n = Math.round(progress * years.length);
      years.forEach((y, i) => y.classList.toggle('is-lit', i < n));
    };
    if (reduce) years.forEach(y => y.classList.add('is-lit'));
    else { addEventListener('scroll', light, { passive: true }); light(); }
  }

  // Rail secteurs
  d.querySelectorAll('[data-rail]').forEach(wrap => {
    const rail = wrap.querySelector('.rail'), prev = wrap.querySelector('[data-prev]'), next = wrap.querySelector('[data-next]');
    if (!rail || !prev || !next) return;
    const step = () => rail.firstElementChild.getBoundingClientRect().width + 20;
    const upd = () => {
      prev.disabled = rail.scrollLeft < 8;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
    };
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  // Vidéo : chargée au clic seulement
  d.querySelectorAll('[data-yt]').forEach(v => v.querySelector('button').addEventListener('click', () => {
    v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" title="${v.dataset.title || 'Vidéo'}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }));

  // Galerie produit
  const main = d.querySelector('.gallery__main img');
  d.querySelectorAll('.gallery__thumbs button').forEach(b => b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') === 'true') return;
    d.querySelectorAll('.gallery__thumbs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const src = b.dataset.src, alt = b.querySelector('img').alt;
    if (reduce) { main.src = src; main.alt = alt; return; }
    main.classList.add('is-out');
    const img = new Image(); img.src = src;
    img.onload = () => setTimeout(() => { main.src = src; main.alt = alt; main.classList.remove('is-out'); }, 120);
  }));

  // Formulaire : validation inline
  d.querySelectorAll('form[data-form]').forEach(f => {
    const rules = {
      required: v => v.trim().length > 0,
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      tel: v => v.replace(/[^\d]/g, '').length >= 9
    };
    const check = (field) => {
      const el = field.querySelector('input,select,textarea'); if (!el) return true;
      const types = (el.dataset.check || '').split(' ').filter(Boolean);
      const ok = types.every(t => rules[t](el.value)) || (!el.required && !el.value.trim());
      field.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', !ok);
      return ok;
    };
    f.querySelectorAll('.field').forEach(fl => {
      const el = fl.querySelector('input,select,textarea');
      el && el.addEventListener('blur', () => fl.classList.contains('is-bad') || el.value ? check(fl) : 0);
      el && el.addEventListener('input', () => fl.classList.contains('is-bad') && check(fl));
    });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [...f.querySelectorAll('.field')].filter(fl => !check(fl));
      if (bad.length) { bad[0].querySelector('input,select,textarea').focus(); return; }
      const btn = f.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Envoi en cours';
      setTimeout(() => { f.classList.add('is-sent'); f.querySelector('.form__ok').focus(); }, 700);
    });
  });

  // Carte des unités (Leaflet)
  const mapEl = d.getElementById('map');
  if (mapEl && window.L) {
    const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([36.2, 3.2], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18, attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }).addTo(map);
    const markers = {};
    d.querySelectorAll('[data-unit]').forEach(b => {
      const [lat, lng] = b.dataset.unit.split(',').map(Number);
      const hq = b.dataset.hq === '1';
      const m = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: `<div class="pin${hq ? ' pin--hq' : ''}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] }) })
        .addTo(map).bindPopup(`<b>${b.querySelector('b').textContent}</b><br>${b.querySelector('small').textContent}`);
      markers[b.dataset.unit] = m;
      b.addEventListener('click', () => {
        d.querySelectorAll('[data-unit]').forEach(x => x.setAttribute('aria-pressed', x === b));
        map.flyTo([lat, lng], 11, { duration: reduce ? 0 : .9 });
        m.openPopup();
      });
    });
    const group = L.featureGroup(Object.values(markers));
    map.fitBounds(group.getBounds().pad(0.25));
    mapEl.addEventListener('click', () => map.scrollWheelZoom.enable(), { once: true });
  }
})();
