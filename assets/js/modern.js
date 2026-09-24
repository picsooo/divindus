/* ==========================================================================
   DIVINDUS CAPREF — Proposition B « Design Moderne »
   Interactions : préchargeur, curseur, navigation plein écran, parallaxe,
   révélations, compteurs, bento lumineux, secteurs, onglets, carte, galerie.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Préchargeur ---------- */
  var loader = $('.loader');
  if (loader) {
    var hide = function () { loader.classList.add('is-done'); document.body.style.overflow = ''; };
    if (reduce) { hide(); }
    else {
      document.body.style.overflow = 'hidden';
      var t = setTimeout(hide, 1600);                    // durée nominale de l'intro
      window.addEventListener('load', function () {      // ou dès que la page est prête
        setTimeout(function () { clearTimeout(t); hide(); }, 300);
      });
    }
  }

  /* ---------- Curseur personnalisé ---------- */
  if (fine && !reduce) {
    var ring = document.createElement('div'); ring.className = 'cursor';
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    // Invisibles tant que la souris n'a pas bougé (évite le rond figé en haut à gauche)
    ring.style.opacity = dot.style.opacity = '0';
    document.body.appendChild(ring); document.body.appendChild(dot);
    var tx = 0, ty = 0, rx = 0, ry = 0, seen = false;
    window.addEventListener('mousemove', function (e) {
      if (!seen) { seen = true; rx = e.clientX; ry = e.clientY; ring.style.opacity = dot.style.opacity = '1'; }
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = 'translate(' + (tx - 2.5) + 'px,' + (ty - 2.5) + 'px)';
    }, { passive: true });
    (function loop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.transform = 'translate(' + (rx - 19) + 'px,' + (ry - 19) + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('a, button, .cell, .show__media, .mgal button');
      ring.classList.toggle('is-big', !!t);
    });
  }

  /* ---------- Barre de progression + nav collante ---------- */
  var bar = $('.progress'), nav = $('.nav');
  var onScroll = function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Navigation plein écran ---------- */
  var burger = $('.nav__burger'), over = $('.navover');
  if (burger && over) {
    var openN = function () {
      over.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true');
      over.removeAttribute('inert'); document.body.style.overflow = 'hidden';
      var f = over.querySelector('a'); if (f) f.focus();
    };
    var closeN = function () {
      over.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
      over.setAttribute('inert', ''); document.body.style.overflow = ''; burger.focus();
    };
    over.setAttribute('inert', '');
    burger.addEventListener('click', function () {
      burger.getAttribute('aria-expanded') === 'true' ? closeN() : openN();
    });
    var cb = $('.navover__close'); if (cb) cb.addEventListener('click', closeN);
    $$('.navover a').forEach(function (a) { a.addEventListener('click', closeN); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && over.classList.contains('is-open')) closeN();
    });
  }

  /* ---------- Révélations ---------- */
  var rv = $$('.rv');
  if (rv.length) {
    if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (el) { el.classList.add('is-in'); });
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -70px' });
      rv.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Compteurs ---------- */
  var cs = $$('[data-count]');
  if (cs.length) {
    var fmt = function (n, d) { return n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }); };
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      if (reduce) { el.textContent = fmt(target, dec); return; }
      var t0 = null, dur = 1700;
      var tick = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)), dec);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(target, dec);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) cs.forEach(run);
    else {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.4 });
      cs.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Bento : halo suivant la souris ---------- */
  if (fine && !reduce) {
    $$('.cell').forEach(function (cell) {
      cell.addEventListener('mousemove', function (e) {
        var r = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        cell.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Parallaxe du visuel héros ---------- */
  var heroImg = $('[data-parallax]');
  if (heroImg && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) heroImg.style.transform = 'translateY(' + (y * 0.12) + 'px)';
    }, { passive: true });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (fine && !reduce) {
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = 'translate(' + x + 'px,' + (y - 3) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Secteurs : liste ↔ image ---------- */
  var rows = $$('.sect__row');
  if (rows.length) {
    var imgs = $$('.sect__preview img');
    var cap = $('.sect__cap');
    var pick = function (row) {
      rows.forEach(function (r) { r.setAttribute('aria-selected', 'false'); });
      row.setAttribute('aria-selected', 'true');
      var key = row.getAttribute('data-key');
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
      if (cap) {
        cap.innerHTML = '<b>' + row.getAttribute('data-title') + '</b><span>' + row.getAttribute('data-desc') + '</span>';
      }
    };
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function () { if (fine) pick(r); });
      r.addEventListener('click', function () { pick(r); });
      r.addEventListener('focus', function () { pick(r); });
    });
    pick(rows[0]);
  }

  /* ---------- Onglets fiche produit ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); select(n);
      });
    });
  });

  /* ---------- Galerie produit ---------- */
  var mstage = $('#mStage');
  if (mstage) {
    var ths = $$('.mthumbs button');
    ths.forEach(function (b) {
      b.addEventListener('click', function () {
        ths.forEach(function (x) { x.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
        mstage.src = b.getAttribute('data-full');
        mstage.alt = b.querySelector('img').alt;
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var ml = $('.mlight');
  if (ml) {
    var mi = $('img', ml), prev = null;
    var openL = function (src, alt) {
      prev = document.activeElement;
      mi.src = src; mi.alt = alt || '';
      ml.classList.add('is-on'); document.body.style.overflow = 'hidden';
      $('.mlight__close', ml).focus();
    };
    var closeL = function () { ml.classList.remove('is-on'); document.body.style.overflow = ''; if (prev) prev.focus(); };
    $$('[data-light]').forEach(function (b) {
      b.addEventListener('click', function () {
        var img = b.querySelector('img');
        openL(b.getAttribute('data-light') || (img && img.src), img && img.alt);
      });
    });
    $('.mlight__close', ml).addEventListener('click', closeL);
    ml.addEventListener('click', function (e) { if (e.target === ml) closeL(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ml.classList.contains('is-on')) closeL(); });
  }

  /* ---------- Carte sombre des unités ---------- */
  var mapEl = $('#mapM');
  if (mapEl && window.L) {
    var chips = $$('.uchip');
    var map = L.map('mapM', { scrollWheelZoom: false, zoomControl: true }).setView([35.4, 2.6], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19
    }).addTo(map);

    var icon = function (on) {
      return L.divIcon({
        className: '',
        html: '<div style="width:' + (on ? 28 : 18) + 'px;height:' + (on ? 28 : 18) +
          'px;border-radius:50%;background:' + (on ? '#4BE4DF' : 'rgba(75,228,223,.35)') +
          ';border:2px solid ' + (on ? '#fff' : 'rgba(255,255,255,.55)') +
          ';box-shadow:0 0 ' + (on ? 22 : 10) + 'px rgba(75,228,223,.8)"></div>',
        iconSize: [on ? 28 : 18, on ? 28 : 18],
        iconAnchor: [on ? 14 : 9, on ? 14 : 9]
      });
    };

    var ms = [];
    chips.forEach(function (chip, i) {
      var lat = parseFloat(chip.getAttribute('data-lat'));
      var lng = parseFloat(chip.getAttribute('data-lng'));
      var name = chip.getAttribute('data-name');
      var role = chip.getAttribute('data-role') || '';
      var m = L.marker([lat, lng], { icon: icon(false), title: name }).addTo(map)
        .bindPopup('<strong style="font-family:Sora,sans-serif">' + name + '</strong><br><span style="opacity:.7">' + role + '</span>');
      ms.push(m);
      var focus = function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', 'true');
        ms.forEach(function (mk, j) { mk.setIcon(icon(j === i)); });
        map.flyTo([lat, lng], 12, { duration: reduce ? 0 : 1.2 });
        m.openPopup();
      };
      chip.addEventListener('click', focus);
      m.on('click', focus);
    });
    if (ms.length) map.fitBounds(L.featureGroup(ms).getBounds().pad(0.25));
    map.on('focus', function () { map.scrollWheelZoom.enable(); });
    map.on('blur', function () { map.scrollWheelZoom.disable(); });
  }

  /* ---------- Lien de navigation actif ---------- */
  var links = $$('.nav__menu a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50%' });
    links.forEach(function (a) {
      var s = document.getElementById(a.getAttribute('href').slice(1));
      if (s) sio.observe(s);
    });
  }
})();
