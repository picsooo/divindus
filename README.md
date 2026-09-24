# DIVINDUS CAPREF — Maquettes de refonte du site web

Deux propositions de refonte complètes pour **DIVINDUS CAPREF Spa**, construites à partir
du contenu réel du site actuel ([divindus-capref.dz](https://www.divindus-capref.dz/)) :
textes, logo, photographies, chiffres clés, coordonnées des 7 unités et historique.

| | Proposition A | Proposition B |
|---|---|---|
| **Nom** | Corporate Pro | Design Moderne |
| **URL** | `/` | `/moderne` |
| **Positionnement** | Institutionnel, rassurant, orienté appels d'offres et marchés publics | Immersif, premium, « effet whaou » |
| **Fond** | Clair | Sombre |
| **Typographie** | Lexend + Source Sans 3 | Sora + Inter |
| **Signature visuelle** | Bleu nuit `#071C29`, turquoise `#0FA8A3` | Noir `#05090D`, turquoise `#4BE4DF`, aurores animées |
| **Effets** | Sobres : révélations au scroll, compteurs, carte interactive | Préchargeur, curseur personnalisé, glassmorphism, bento grid, parallaxe, marquees, boutons magnétiques |

Les deux versions partagent le même dossier `assets/` (images, polices, logos).

---

## Contenu du dépôt

```
.
├── index.html                      → Proposition A · Accueil
├── produits.html                   → Proposition A · Catalogue filtrable
├── produit-cabine-sandwich.html    → Proposition A · Fiche produit + fiche technique
├── produit-cabine-tole.html        → Proposition A · Fiche produit + fiche technique
├── unites.html                     → Proposition A · Réseau industriel (carte Leaflet)
├── contact.html                    → Proposition A · Contact & demande de devis
├── moderne/
│   ├── index.html                  → Proposition B · Accueil (one-page immersif)
│   └── produit.html                → Proposition B · Fiche produit
└── assets/
    ├── css/corporate.css           → Design system Proposition A
    ├── css/modern.css              → Design system Proposition B
    ├── js/corporate.js             → Interactions Proposition A
    ├── js/modern.js                → Interactions Proposition B
    ├── js/status.js                → Panneau « Statut des pages » (démo uniquement)
    └── img/                        → Logos, produits, actualités, visuels du site
```

---

## Panneau « Statut des pages »

Un module de présentation (`assets/js/status.js`) ajoute :

* une **pastille de couleur** à côté de chaque lien de navigation ;
* un **panneau récapitulatif** en bas à gauche listant l'ensemble des pages.

| Pastille | Signification |
|---|---|
| 🟢 vert | Page **maquettée** et navigable |
| 🟠 orange | Contenu présent **en section** — page dédiée à produire |
| ⚪ gris | **Non incluse** dans la maquette — à produire après validation du devis |

Le panneau permet de masquer les pastilles pendant la démonstration.
**En production, supprimer simplement les balises `<script src=".../status.js"></script>`.**

---

## Aperçu local

Aucune compilation n'est nécessaire (HTML/CSS/JS statiques).

```bash
# Python
python -m http.server 8080
# ou Node
npx serve .
```

Puis ouvrir <http://localhost:8080> (Proposition A) et <http://localhost:8080/moderne/> (Proposition B).

---

## Mise en ligne (GitHub + Vercel)

```bash
git init
git add .
git commit -m "Maquettes de refonte DIVINDUS CAPREF"
git branch -M main
git remote add origin https://github.com/<compte>/<depot>.git
git push -u origin main
```

Sur Vercel : **Add New… → Project → Import** le dépôt.
Framework Preset : **Other**, aucune commande de build, répertoire de sortie : la racine.

Les URLs produites :

* `https://<projet>.vercel.app/` → Proposition A
* `https://<projet>.vercel.app/moderne` → Proposition B

---

## Sources du contenu

Tout le contenu éditorial provient du site actuel de DIVINDUS CAPREF :

* **Identité** : logo CAPREF, baseline « La Solution intelligente », charte turquoise / bleu acier.
* **Chiffres** : 60+ ans d'expérience, 2 300+ employés, 7 unités, 8 192 182 453 DA de chiffre d'affaires.
* **Produits** : Cabine en panneau sandwich (CABINE 2025 · Cabines Desert — 30 m², 10 personnes)
  et Cabines Tôle (CABINE 2024 · cabines sahariennes — 44 m², 12 personnes), avec leurs descriptions d'origine.
* **Unités** : siège social + 7 unités avec leurs coordonnées GPS réelles (Alger, Béjaïa, Ain M'Lila, Oran).
* **Historique** : 1905 PHD, 1934 PEB, 1941 Mischler, 1960 CSMA, 1963 CSBA, 1968 CABAM, 1970 TRANSBOIS.
* **Mot du Directeur** : texte intégral de M. Madjid MOUHOUB, PDG.
* **Actualités** : les 4 publications en ligne (BATIWEST 2024, commémorations, hommage aux retraités).
* **Coordonnées** : 202 Rue Hassiba Ben Bouali Alger · +213 (0) 21 67 03 09 · +213 (0) 5 60 34 23 38 ·
  fax +213 (0) 21 67 75 79 · divindus.capref@divindus-capref.dz · dimanche à jeudi, 8h–16h.

### Points à confirmer avec le client

* Les **valeurs chiffrées détaillées des fiches techniques** (épaisseurs, coefficients U, charges,
  poids) sont signalées comme à compléter par le bureau d'études — elles ne figurent pas sur le site actuel.
* Les **documents à télécharger** (fiches Word/PDF, plans) sont des liens inactifs dans la maquette.
* Le **formulaire de contact** simule l'envoi ; il devra être relié à la messagerie CAPREF.
* Les **versions EN / AR** ne sont pas maquettées (sélecteur de langue présent, non fonctionnel).

---

## Accessibilité & performances

* Contrastes vérifiés (WCAG AA), navigation clavier complète, `aria-*` sur les composants interactifs.
* `prefers-reduced-motion` respecté sur les deux versions (animations désactivées).
* Images en `loading="lazy"` hors du premier écran, dimensions déclarées pour éviter les sauts de mise en page.
* Cibles tactiles ≥ 44 px, responsive testé de 375 px à 1440 px+.
* Dépendance externe unique : **Leaflet** (carte des unités) + Google Fonts.
