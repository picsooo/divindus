/* ==========================================================================
   DIVINDUS CAPREF — Proposition A « Corporate Pro »
   Interactions : navigation, révélations, compteurs, onglets, carte,
   galerie/lightbox, catalogue filtrable, fiche produit, formulaire.
   Aucune dépendance hors Leaflet (chargé uniquement sur les pages carte).
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Année courante ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header collant ---------- */
  var header = $('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
      var top = $('.to-top');
      if (top) top.classList.toggle('is-on', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Retour en haut ---------- */
  var toTop = $('.to-top');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Menu mobile (drawer + piège de focus) ---------- */
  var burger = $('.burger'), mnav = $('.mnav'), scrim = $('.scrim');
  if (burger && mnav && scrim) {
    var lastFocus = null;
    var openNav = function () {
      lastFocus = document.activeElement;
      mnav.classList.add('is-open');
      scrim.classList.add('is-on');
      burger.setAttribute('aria-expanded', 'true');
      mnav.removeAttribute('inert');
      document.body.style.overflow = 'hidden';
      var f = mnav.querySelector('button, a');
      if (f) f.focus();
    };
    var closeNav = function () {
      mnav.classList.remove('is-open');
      scrim.classList.remove('is-on');
      burger.setAttribute('aria-expanded', 'false');
      mnav.setAttribute('inert', '');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    mnav.setAttribute('inert', '');
    burger.addEventListener('click', function () {
      burger.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });
    scrim.addEventListener('click', closeNav);
    var closeBtn = $('.mnav__close');
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    $$('.mnav a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('is-open')) closeNav();
    });
  }

  /* ---------- Révélations au scroll ---------- */
  var revealables = $$('.reveal');
  if (revealables.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Compteurs ---------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    var fmt = function (n, dec) {
      return n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      if (reduce) { el.textContent = fmt(target, dec); return; }
      var dur = 1500, t0 = null;
      var tick = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased, dec);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target, dec);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { counters.forEach(run); }
    else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Onglets génériques (role=tablist) ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
  });

  /* ---------- Galerie + lightbox ---------- */
  var lb = $('.lightbox');
  if (lb) {
    var lbImg = $('img', lb), lbPrev = null;
    var openLb = function (src, alt) {
      lbPrev = document.activeElement;
      lbImg.src = src; lbImg.alt = alt || '';
      lb.classList.add('is-on');
      document.body.style.overflow = 'hidden';
      $('.lightbox__close', lb).focus();
    };
    var closeLb = function () {
      lb.classList.remove('is-on');
      document.body.style.overflow = '';
      if (lbPrev) lbPrev.focus();
    };
    $$('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-lightbox');
        var img = btn.querySelector('img');
        openLb(src || (img && img.src), img && img.alt);
      });
    });
    $('.lightbox__close', lb).addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('is-on')) closeLb();
    });
  }

  /* ---------- Fiche produit : galerie principale ---------- */
  var stage = $('#pdpStage');
  if (stage) {
    var thumbs = $$('.pdp__thumbs button');
    thumbs.forEach(function (b) {
      b.addEventListener('click', function () {
        thumbs.forEach(function (x) { x.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
        var full = b.getAttribute('data-full');
        stage.src = full;
        stage.alt = b.querySelector('img').alt;
        var zoom = $('.pdp__zoom');
        if (zoom) zoom.setAttribute('data-lightbox', full);
      });
    });
  }

  /* ---------- Catalogue filtrable ---------- */
  var catalog = $('#catalog');
  if (catalog) {
    var chips = $$('[data-filter]');
    var cards = $$('[data-cat]', catalog);
    var countEl = $('#resultsCount');
    var apply = function (val) {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = val === 'all' || c.getAttribute('data-cat') === val;
        c.hidden = !ok;
        if (ok) shown++;
      });
      var empty = $('#catalogEmpty');
      if (empty) empty.hidden = shown > 0;
      if (countEl) countEl.textContent = shown + (shown > 1 ? ' produits affichés' : ' produit affiché');
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', 'true');
        apply(chip.getAttribute('data-filter'));
      });
    });
    apply('all');
  }

  /* ---------- Carte des unités (Leaflet) ---------- */
  var mapEl = $('#map');
  if (mapEl && window.L) {
    var units = $$('.unit');
    var map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView([35.4, 2.6], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    var icon = function (active) {
      return L.divIcon({
        className: '',
        html: '<div style="width:' + (active ? 26 : 20) + 'px;height:' + (active ? 26 : 20) +
          'px;border-radius:50%;background:' + (active ? '#0FA8A3' : '#0B2A3D') +
          ';border:3px solid #fff;box-shadow:0 3px 10px rgba(7,28,41,.35)"></div>',
        iconSize: [active ? 26 : 20, active ? 26 : 20],
        iconAnchor: [active ? 13 : 10, active ? 13 : 10]
      });
    };

    var markers = [];
    units.forEach(function (btn, i) {
      var lat = parseFloat(btn.getAttribute('data-lat'));
      var lng = parseFloat(btn.getAttribute('data-lng'));
      var name = btn.getAttribute('data-name');
      var role = btn.getAttribute('data-role') || '';
      var m = L.marker([lat, lng], { icon: icon(false), title: name })
        .addTo(map)
        .bindPopup('<strong style="font-family:Lexend,sans-serif;color:#071C29">' + name +
          '</strong><br><span style="color:#7C8E99">' + role + '</span>');
      markers.push(m);
      var focusUnit = function () {
        units.forEach(function (u) { u.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        markers.forEach(function (mk, j) { mk.setIcon(icon(j === i)); });
        map.flyTo([lat, lng], 12, { duration: reduce ? 0 : 1.1 });
        m.openPopup();
      };
      btn.addEventListener('click', focusUnit);
      m.on('click', function () {
        focusUnit();
        btn.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    if (markers.length) {
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
    }
    map.on('focus', function () { map.scrollWheelZoom.enable(); });
    map.on('blur', function () { map.scrollWheelZoom.disable(); });
  }

  /* ---------- Formulaire : validation + retour visuel ---------- */
  $$('form[data-validate]').forEach(function (form) {
    var setErr = function (field, msg) {
      field.classList.add('is-invalid');
      var err = field.querySelector('.err span');
      if (err && msg) err.textContent = msg;
    };
    var clearErr = function (field) { field.classList.remove('is-invalid'); };

    $$('.field input, .field textarea, .field select', form).forEach(function (input) {
      input.addEventListener('blur', function () {
        var field = input.closest('.field');
        if (input.required && !input.value.trim()) setErr(field, 'Ce champ est obligatoire.');
        else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value))
          setErr(field, 'Adresse e-mail invalide (ex. nom@domaine.dz).');
        else clearErr(field);
      });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('is-invalid') && input.value.trim()) clearErr(input.closest('.field'));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      $$('.field input, .field textarea, .field select', form).forEach(function (input) {
        var field = input.closest('.field');
        var bad = (input.required && !input.value.trim()) ||
          (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value));
        if (bad) { setErr(field, input.required && !input.value.trim() ? 'Ce champ est obligatoire.' : 'Adresse e-mail invalide (ex. nom@domaine.dz).'); if (!firstInvalid) firstInvalid = input; }
        else clearErr(field);
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var btn = form.querySelector('[type="submit"]');
      var okBox = form.querySelector('.form__ok');
      if (btn) { btn.setAttribute('aria-busy', 'true'); btn.dataset.label = btn.innerHTML; btn.innerHTML = 'Envoi en cours…'; }
      setTimeout(function () {
        if (btn) { btn.removeAttribute('aria-busy'); btn.innerHTML = btn.dataset.label; }
        if (okBox) { okBox.classList.add('is-on'); okBox.focus && okBox.focus(); }
        form.reset();
      }, 900);
    });
  });

  /* ---------- Ancres : surlignage du lien actif ---------- */
  var sectionLinks = $$('.nav__link[href^="#"], .nav__link[href*="#"]');
  var ids = sectionLinks.map(function (a) {
    var h = a.getAttribute('href');
    var i = h.indexOf('#');
    return i >= 0 ? h.slice(i + 1) : '';
  }).filter(Boolean);
  if (ids.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sectionLinks.forEach(function (a) {
          var on = a.getAttribute('href').indexOf('#' + en.target.id) >= 0;
          if (on) a.setAttribute('aria-current', 'page');
          else if (a.getAttribute('href').charAt(0) === '#') a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50%' });
    ids.forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  }
})();
