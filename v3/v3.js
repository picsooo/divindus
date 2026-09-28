(() => {
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Découpage en mots ---------- */
  const splitWords = (el, cls) => {
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(t)); return; }
            if (cls === 'mask') { const w = d.createElement('span'); w.className = 'w'; const s = d.createElement('span'); s.textContent = t; w.appendChild(s); frag.appendChild(w); }
            else { const s = d.createElement('span'); s.className = cls; s.textContent = t; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  };
  d.querySelectorAll('[data-split]').forEach(el => splitWords(el, 'mask'));
  d.querySelectorAll('[data-words]').forEach(el => splitWords(el, 'mw'));

  /* ---------- Défilement fluide (Lenis) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    }
  }
  d.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(a => {
    const url = new URL(a.href, location.href);
    if (url.pathname.replace(/\/$/, '') !== location.pathname.replace(/\/$/, '') || !url.hash) return;
    a.addEventListener('click', e => {
      const t = d.querySelector(url.hash); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -90, duration: 1.4 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', url.hash);
    });
  });

  /* ---------- Nav : se cache en descendant, revient en remontant ---------- */
  const nav = d.querySelector('.nav');
  if (nav && hasGsap) ScrollTrigger.create({ start: 120, end: 'max', onUpdate: s => nav.classList.toggle('is-hidden', s.direction === 1 && !d.querySelector('.menu.is-open')) });

  /* ---------- Menu mobile ---------- */
  const burger = d.querySelector('.nav__burger'), menu = d.querySelector('.menu');
  if (burger && menu) {
    const set = open => {
      menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open);
      burger.innerHTML = open ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => e.key === 'Escape' && set(false));
  }
  d.querySelectorAll('.nav__lang button').forEach(b => b.addEventListener('click', () => d.querySelectorAll('.nav__lang button').forEach(x => x.setAttribute('aria-pressed', x === b))));

  /* ---------- Boutons magnétiques (desktop) ---------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    d.querySelectorAll('[data-mag]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .28).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .38).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* ---------- Compteurs ---------- */
  const fmt = (n, dec) => n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const count = el => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (reduce || !hasGsap) { el.textContent = fmt(to, dec); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', onUpdate: () => el.textContent = fmt(o.v, dec) });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); io.unobserve(e.target); } }), { threshold: .5 });
    d.querySelectorAll('[data-count]').forEach(c => io.observe(c));
  }

  /* ---------- Accordéon secteurs ---------- */
  const accs = [...d.querySelectorAll('.acc__item')];
  const openAcc = it => accs.forEach(a => { a.classList.toggle('is-open', a === it); a.setAttribute('aria-expanded', a === it); });
  accs.forEach(it => {
    it.addEventListener('click', () => openAcc(it));
    it.addEventListener('mouseenter', () => matchMedia('(hover:hover) and (min-width:901px)').matches && openAcc(it));
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAcc(it); } });
  });

  /* ---------- Aperçu image des actualités ---------- */
  const prev = d.querySelector('.npreview');
  if (prev && hasGsap && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const img = prev.querySelector('img');
    const qx = gsap.quickTo(prev, 'x', { duration: .6, ease: 'power3' }), qy = gsap.quickTo(prev, 'y', { duration: .6, ease: 'power3' });
    d.querySelectorAll('.nlist a').forEach(a => {
      a.addEventListener('mouseenter', () => { img.src = a.dataset.img; prev.classList.add('is-on'); });
      a.addEventListener('mouseleave', () => prev.classList.remove('is-on'));
    });
    addEventListener('pointermove', e => { qx(e.clientX + 170); qy(e.clientY); });
  }

  /* ---------- Vidéo au clic ---------- */
  d.querySelectorAll('[data-yt]').forEach(v => v.querySelector('button').addEventListener('click', () => {
    v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" title="${v.dataset.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }));

  /* ---------- Formulaires ---------- */
  d.querySelectorAll('form[data-form]').forEach(f => {
    const rules = { required: v => v.trim().length > 0, email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), tel: v => v.replace(/\D/g, '').length >= 9 };
    const check = fl => {
      const el = fl.querySelector('input,select,textarea'); if (!el) return true;
      const ok = (el.dataset.check || '').split(' ').filter(Boolean).every(t => rules[t](el.value));
      fl.classList.toggle('is-bad', !ok); el.setAttribute('aria-invalid', !ok); return ok;
    };
    f.querySelectorAll('.field').forEach(fl => { const el = fl.querySelector('input,select,textarea'); el && el.addEventListener('input', () => fl.classList.contains('is-bad') && check(fl)); });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [...f.querySelectorAll('.field')].filter(fl => !check(fl));
      if (bad.length) { bad[0].querySelector('input,select,textarea').focus(); return; }
      const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Envoi en cours';
      setTimeout(() => { f.classList.add('is-sent'); f.querySelector('.form__ok').focus(); }, 700);
    });
  });

  /* ---------- Carte des unités ---------- */
  const mapEl = d.getElementById('map');
  if (mapEl && window.L) {
    const map = L.map(mapEl, { scrollWheelZoom: false }).setView([36.2, 3.2], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap, &copy; CARTO' }).addTo(map);
    const ms = [];
    d.querySelectorAll('[data-unit]').forEach(b => {
      const [lat, lng] = b.dataset.unit.split(',').map(Number);
      const m = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: `<div class="pin${b.dataset.hq ? ' pin--hq' : ''}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] }) })
        .addTo(map).bindPopup(`<b>${b.querySelector('b').textContent}</b><br>${b.querySelector('small').textContent}`);
      ms.push(m);
      b.addEventListener('click', () => { d.querySelectorAll('[data-unit]').forEach(x => x.setAttribute('aria-pressed', x === b)); map.flyTo([lat, lng], 11, { duration: reduce ? 0 : 1 }); m.openPopup(); });
    });
    map.fitBounds(L.featureGroup(ms).getBounds().pad(.25));
  }

  /* ================= GSAP ================= */
  if (!hasGsap) return;
  if (reduce) { gsap.set('.w > span', { yPercent: 0 }); return; }

  // Entrée orchestrée : titres masqués
  const intro = gsap.timeline({ delay: .15 });
  d.querySelectorAll('[data-split="intro"]').forEach((el, i) => intro.from(el.querySelectorAll('.w > span'), { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: .06 }, i * .1));
  intro.from('[data-intro]', { y: 24, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08 }, .35);
  if (d.querySelector('.hero__frame')) intro.from('.hero__frame', { clipPath: 'inset(94% 3.2% 6% 45% round 22px)', duration: 1.4, ease: 'expo.inOut' }, .1);

  // Titres de sections masqués
  d.querySelectorAll('[data-split="scroll"]').forEach(el => gsap.from(el.querySelectorAll('.w > span'), {
    yPercent: 115, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top 85%' }
  }));

  // Parallaxe douce des images
  d.querySelectorAll('[data-par]').forEach(el => {
    const img = el.querySelector('img') || el;
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Manifeste : les mots s'allument au fil du scroll
  d.querySelectorAll('[data-words]').forEach(el => gsap.to(el.querySelectorAll('.mw'), {
    opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: .6 }
  }));

  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    // HERO : le cadre s'ouvre en plein écran
    if (d.querySelector('.hero__frame')) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', pin: true, scrub: .8, anticipatePin: 1 } });
      tl.to('.hero__frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut' }, 0)
        .fromTo('.hero__frame img', { yPercent: 30, scale: 1.18 }, { yPercent: 0, scale: 1, ease: 'power2.inOut' }, 0)
        .to('.hero__type', { yPercent: -18, opacity: 0, ease: 'power1.in' }, 0)
        .to('.hero__shade', { opacity: 1, ease: 'none' }, .35)
        .to('.hero__over', { opacity: 1, y: 0, ease: 'power2.out' }, .55)
        .from('.hero__over .kv > div', { y: 40, stagger: .08, ease: 'power3.out' }, .55);
    }
    // HÉRITAGE : panoramique horizontal épinglé
    const track = d.querySelector('.pan__track');
    if (track) {
      const dist = () => track.scrollWidth - innerWidth;
      const pan = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.pan', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
      gsap.to('.pan__bar i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.pan', start: 'top top', end: () => '+=' + dist(), scrub: true } });
      d.querySelectorAll('.yr:not(.yr--now) b').forEach(b => gsap.to(b, { color: '#fff', webkitTextStroke: '1.5px rgba(255,255,255,0)', ease: 'none', scrollTrigger: { trigger: b, containerAnimation: pan, start: 'left 75%', end: 'left 45%', scrub: true } }));
    }
  });

  // Pile produits : la carte précédente recule quand la suivante arrive
  const cards = gsap.utils.toArray('.scard');
  cards.forEach((c, i) => {
    if (i === cards.length - 1) return;
    gsap.to(c, { scale: .92, filter: 'brightness(.72)', ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 96px', scrub: true } });
  });

  // Marquee : vitesse et sens suivent le scroll
  const mq = d.querySelector('.marquee__track');
  if (mq) {
    const loop = gsap.to(mq, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: s => {
      const v = s.getVelocity() / 300;
      gsap.to(loop, { timeScale: gsap.utils.clamp(-6, 6, v === 0 ? 1 : v), duration: .3, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: s.direction, duration: 1.2 }) });
    } });
  }

  // Cellules du bento : entrée en cascade
  gsap.from('.bento .cell', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.bento', start: 'top 80%' } });

  // Footer : le mot géant remonte
  if (d.querySelector('.foot__word')) gsap.from('.foot__word', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // Page produit : zoom de l'image principale
  if (d.querySelector('.p-hero')) gsap.to('.p-hero img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '.p-hero', start: 'top 85%', end: 'bottom top', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
