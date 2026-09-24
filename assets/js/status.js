/* ==========================================================================
   DIVINDUS CAPREF — Maquettes · Module « Statut des pages »
   --------------------------------------------------------------------------
   Affiche, dans les menus et le pied de page, un marqueur indiquant si la
   page est déjà maquettée ou si elle reste à produire (après validation du
   devis). Ajoute également un panneau récapitulatif flottant.

   ⚠ Module de présentation client : à supprimer lors de la mise en production
     (retirer simplement la balise <script src=".../status.js"></script>).
   ========================================================================== */
(function () {
  'use strict';

  // Détecte si l'on se trouve dans /moderne/ pour construire les liens relatifs
  var inModern = /[\\/]moderne[\\/]/.test(location.pathname);
  var up = inModern ? '../' : '';
  var into = inModern ? '' : 'moderne/';

  /* ----- Référentiel des pages ------------------------------------------ */
  var LEGEND = {
    done: { label: 'Maquettée', color: '#12B886', desc: 'Page réalisée dans cette maquette' },
    partial: { label: 'Section seule', color: '#E0910F', desc: 'Contenu présent en section ; page dédiée à produire' },
    todo: { label: 'À produire', color: '#9AA8B0', desc: 'Non incluse — en attente de validation du devis' }
  };

  var PAGES = [
    { g: 'Proposition A — Corporate Pro', t: 'Accueil', h: up + 'index.html', s: 'done' },
    { g: 'Proposition A — Corporate Pro', t: 'Catalogue produits', h: up + 'produits.html', s: 'done' },
    { g: 'Proposition A — Corporate Pro', t: 'Fiche produit — Panneau sandwich', h: up + 'produit-cabine-sandwich.html', s: 'done' },
    { g: 'Proposition A — Corporate Pro', t: 'Fiche produit — Cabines Tôle', h: up + 'produit-cabine-tole.html', s: 'done' },
    { g: 'Proposition A — Corporate Pro', t: 'Nos unités (carte interactive)', h: up + 'unites.html', s: 'done' },
    { g: 'Proposition A — Corporate Pro', t: 'Contact & demande de devis', h: up + 'contact.html', s: 'done' },

    { g: 'Proposition B — Design Moderne', t: 'Accueil', h: up + into + 'index.html', s: 'done' },
    { g: 'Proposition B — Design Moderne', t: 'Fiche produit', h: up + into + 'produit.html', s: 'done' },

    { g: 'Pages à produire', t: 'À propos (page dédiée)', h: null, s: 'partial' },
    { g: 'Pages à produire', t: 'Vision & Mission (page dédiée)', h: null, s: 'partial' },
    { g: 'Pages à produire', t: 'Mot du Directeur (page dédiée)', h: null, s: 'partial' },
    { g: 'Pages à produire', t: 'Actualités — liste + article', h: null, s: 'partial' },
    { g: 'Pages à produire', t: 'Galerie / Photothèque (page dédiée)', h: null, s: 'partial' },
    { g: 'Pages à produire', t: 'Historique de l\'entreprise', h: null, s: 'todo' },
    { g: 'Pages à produire', t: 'Espace téléchargements (fiches PDF)', h: null, s: 'todo' },
    { g: 'Pages à produire', t: 'Recherche interne', h: null, s: 'todo' },
    { g: 'Pages à produire', t: 'Mentions légales & confidentialité', h: null, s: 'todo' },
    { g: 'Pages à produire', t: 'Versions anglaise (EN) et arabe (AR)', h: null, s: 'todo' },
    { g: 'Pages à produire', t: 'Back-office (produits, actualités, galerie)', h: null, s: 'todo' }
  ];

  /* ----- Correspondance lien → statut ----------------------------------- */
  var FILE_STATUS = {
    'index.html': 'done',
    'produits.html': 'done',
    'produit-cabine-sandwich.html': 'done',
    'produit-cabine-tole.html': 'done',
    'unites.html': 'done',
    'contact.html': 'done',
    'produit.html': 'done'
  };
  var HASH_STATUS = {
    '#apropos': 'partial', '#mission': 'partial', '#directeur': 'partial',
    '#actualites': 'partial', '#galerie': 'partial',
    '#produits': 'done', '#unites': 'done', '#entreprise': 'done',
    '#secteurs': 'done', '#reseau': 'done', '#actus': 'done', '#contact': 'done'
  };
  var TITLES = {
    partial: 'Contenu présent dans la maquette (section) — page dédiée à produire après validation du devis',
    done: 'Page maquettée et navigable',
    todo: 'Page non incluse dans la maquette — à produire après validation du devis'
  };

  function statusOf(a) {
    var raw = a.getAttribute('href');
    if (!raw) return null;
    if (/^(tel:|mailto:|https?:)/i.test(raw)) return null;
    if (raw === '#') return 'todo';                       // lien placeholder
    var hash = raw.indexOf('#') >= 0 ? raw.slice(raw.indexOf('#')) : '';
    var file = raw.split('#')[0].split('/').pop();
    if (file && FILE_STATUS[file]) {
      if (hash && HASH_STATUS[hash]) return HASH_STATUS[hash];
      return FILE_STATUS[file];
    }
    if (!file && hash) return HASH_STATUS[hash] || 'done';
    return 'todo';
  }

  /* ----- Styles injectés ------------------------------------------------- */
  var css = [
    '.st-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex:none;margin-left:7px;',
    'vertical-align:middle;box-shadow:0 0 0 2px rgba(255,255,255,.28)}',
    '.st-dot--done{background:#12B886}',
    '.st-dot--partial{background:#E0910F}',
    '.st-dot--todo{background:#9AA8B0;box-shadow:0 0 0 2px rgba(255,255,255,.16)}',
    '.st-panel{position:fixed;left:16px;bottom:16px;z-index:9500;width:min(360px,calc(100vw - 32px));',
    'font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13.5px;color:#0E1F2A;',
    'background:#fff;border:1px solid #DCE5EA;border-radius:14px;',
    'box-shadow:0 22px 60px rgba(7,28,41,.26);overflow:hidden}',
    '.st-panel__head{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;',
    'background:#0B2A3D;color:#fff;border:0;width:100%;text-align:left;font:inherit;min-height:48px}',
    '.st-panel__head b{font-size:13.5px;font-weight:600}',
    '.st-panel__head small{margin-left:auto;opacity:.7;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase}',
    '.st-panel__head svg{width:16px;height:16px;transition:transform .25s ease;flex:none}',
    '.st-panel.is-closed .st-panel__head svg{transform:rotate(180deg)}',
    '.st-panel__body{max-height:min(58vh,520px);overflow-y:auto;padding:12px 14px 14px;background:#fff}',
    '.st-panel.is-closed .st-panel__body{display:none}',
    '.st-legend{display:grid;gap:6px;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #EDF3F6}',
    '.st-legend div{display:flex;align-items:flex-start;gap:8px;line-height:1.4}',
    '.st-legend b{font-weight:600;flex:none}',
    '.st-legend span{color:#6B7C86;font-size:12px}',
    '.st-group{margin-top:12px}',
    '.st-group > b{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7C8E99;margin-bottom:6px}',
    '.st-row{display:flex;align-items:center;gap:9px;padding:6px 8px;border-radius:7px;line-height:1.35;min-height:34px;color:#0E1F2A}',
    'a.st-row:hover{background:#F0F7F9;color:#0B7F7B}',
    '.st-row .st-dot{margin-left:0}',
    '.st-row span{flex:1}',
    '.st-row em{font-style:normal;font-size:11px;color:#98A6AE;flex:none}',
    '.st-panel__foot{margin-top:14px;padding-top:10px;border-top:1px solid #EDF3F6;display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.st-panel__foot button{border:1px solid #DCE5EA;background:#F6F9FB;border-radius:7px;padding:7px 12px;cursor:pointer;font:inherit;font-size:12px;min-height:34px}',
    '.st-panel__foot button:hover{border-color:#0FA8A3;color:#0B7F7B}',
    '.st-panel__foot span{font-size:11.5px;color:#98A6AE}',
    'body.st-hide .st-dot{display:none}',
    '@media(max-width:760px){.st-panel{left:8px;right:8px;bottom:8px;width:auto}}',
    '@media print{.st-panel,.st-dot{display:none!important}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ----- Marqueurs sur les liens de navigation --------------------------- */
  var SCOPES = '.nav a, .mnav a, .drop a, .footer a, .nav__menu a, .navover a, .foot a, .topbar .lang a';
  Array.prototype.forEach.call(document.querySelectorAll(SCOPES), function (a) {
    if (a.querySelector('.st-dot')) return;
    if (a.closest('.socials, .foot__soc, .st-panel')) return;
    var s;
    if (a.closest('.lang')) {
      // Sélecteur de langue : FR maquetté, EN / AR à produire
      s = a.getAttribute('aria-current') === 'true' ? 'done' : 'todo';
    } else {
      s = statusOf(a);
    }
    if (!s) return;
    var dot = document.createElement('i');
    dot.className = 'st-dot st-dot--' + s;
    dot.setAttribute('aria-hidden', 'true');
    a.appendChild(dot);
    var t = a.getAttribute('title');
    if (!t) a.setAttribute('title', TITLES[s]);
  });

  /* ----- Panneau récapitulatif ------------------------------------------- */
  var counts = { done: 0, partial: 0, todo: 0 };
  PAGES.forEach(function (p) { counts[p.s]++; });

  var panel = document.createElement('aside');
  panel.className = 'st-panel is-closed';
  panel.setAttribute('aria-label', 'Statut des pages de la maquette');

  var groups = [];
  PAGES.forEach(function (p) {
    var g = groups.filter(function (x) { return x.name === p.g; })[0];
    if (!g) { g = { name: p.g, items: [] }; groups.push(g); }
    g.items.push(p);
  });

  var html = '';
  html += '<button class="st-panel__head" type="button" aria-expanded="false">';
  html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>';
  html += '<b>Statut des pages</b><small>' + counts.done + ' prêtes / ' + (counts.partial + counts.todo) + ' à produire</small>';
  html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  html += '</button><div class="st-panel__body">';
  html += '<div class="st-legend">';
  ['done', 'partial', 'todo'].forEach(function (k) {
    html += '<div><i class="st-dot st-dot--' + k + '" style="margin-top:5px"></i><b>' + LEGEND[k].label + '</b><span>— ' + LEGEND[k].desc + '</span></div>';
  });
  html += '</div>';
  groups.forEach(function (g) {
    html += '<div class="st-group"><b>' + g.name + '</b>';
    g.items.forEach(function (p) {
      var tag = p.h ? 'a href="' + p.h + '"' : 'div';
      var end = p.h ? 'a' : 'div';
      html += '<' + tag + ' class="st-row">' +
        '<i class="st-dot st-dot--' + p.s + '"></i><span>' + p.t + '</span>' +
        '<em>' + LEGEND[p.s].label + '</em></' + end + '>';
    });
    html += '</div>';
  });
  html += '<div class="st-panel__foot">';
  html += '<button type="button" data-st-toggle>Masquer les pastilles</button>';
  html += '<span>Panneau de présentation — retiré en production.</span>';
  html += '</div></div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);

  var head = panel.querySelector('.st-panel__head');
  head.addEventListener('click', function () {
    var closed = panel.classList.toggle('is-closed');
    head.setAttribute('aria-expanded', closed ? 'false' : 'true');
    try { localStorage.setItem('capref-status-open', closed ? '0' : '1'); } catch (e) { }
  });
  try {
    if (localStorage.getItem('capref-status-open') === '1') {
      panel.classList.remove('is-closed');
      head.setAttribute('aria-expanded', 'true');
    }
  } catch (e) { }

  var toggle = panel.querySelector('[data-st-toggle]');
  toggle.addEventListener('click', function () {
    var hidden = document.body.classList.toggle('st-hide');
    toggle.textContent = hidden ? 'Afficher les pastilles' : 'Masquer les pastilles';
    try { localStorage.setItem('capref-status-dots', hidden ? '0' : '1'); } catch (e) { }
  });
  try {
    if (localStorage.getItem('capref-status-dots') === '0') {
      document.body.classList.add('st-hide');
      toggle.textContent = 'Afficher les pastilles';
    }
  } catch (e) { }
})();
