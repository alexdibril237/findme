# L5 — Rapport de Performance findMe

**Outil** : Google Lighthouse v12  
**Date** : Juin 2026  
**URL analysée** : http://localhost:3000 (environnement de développement)

---

## Scores Lighthouse

| Critère | Mobile | Desktop |
|---|---|---|
| Performance | 82 / 100 | 96 / 100 |
| Accessibilité | 91 / 100 | 91 / 100 |
| Bonnes pratiques | 95 / 100 | 95 / 100 |
| SEO | 98 / 100 | 100 / 100 |

---

## Métriques Core Web Vitals (Mobile)

| Métrique | Valeur | Cible | Statut |
|---|---|---|---|
| LCP (Largest Contentful Paint) | 1.8 s | < 2.5 s | ✅ |
| FID / INP (Interaction to Next Paint) | 45 ms | < 200 ms | ✅ |
| CLS (Cumulative Layout Shift) | 0.02 | < 0.1 | ✅ |
| FCP (First Contentful Paint) | 0.9 s | < 1.8 s | ✅ |
| TTFB (Time to First Byte) | 210 ms | < 800 ms | ✅ |
| TBT (Total Blocking Time) | 120 ms | < 200 ms | ✅ |

---

## Optimisations Implémentées

### Performance

- **SSR sélectif** : la landing page est pré-rendue (`prerender: true`), les pages dashboard/admin sont en CSR (`ssr: false`). Résultat : la landing est servie instantanément sans JavaScript côté serveur.
- **Code splitting automatique** : Nuxt 3 divise le bundle par route — chaque page ne charge que ce dont elle a besoin.
- **Lazy loading des composants lourds** : Leaflet (carte interactive) est importé dynamiquement via `import('leaflet')` uniquement quand la page de création d'adresse est visitée (~180 KB économisés au chargement initial).
- **Compression d'images** : avant l'upload, les photos de bâtiments sont redimensionnées et compressées en `image/webp` via Canvas API (réduction ~70% du poids).
- **Import dynamique jsPDF + QRCode** : les bibliothèques d'export PDF ne sont chargées qu'au moment de l'export (non incluses dans le bundle principal).
- **Police Google Fonts** : préconnexion via `<link rel="preconnect">` pour réduire la latence de chargement de la typo.

### SEO

- **`useSeoMeta()`** sur toutes les pages : title, description, og:title, og:type.
- **SSR landing page** : le contenu HTML est indexable immédiatement par Google sans exécution JavaScript.
- **Structure sémantique** : H1 unique par page, H2/H3 hiérarchisés, balises `<nav>`, `<main>`, `<footer>`.
- **`robots.txt`** présent dans `/public/`.
- **Contenu textuel réel** indexable (pas de contenu uniquement en JavaScript).

### Accessibilité

- **Attributs ARIA** sur les éléments interactifs : `aria-label`, `aria-describedby`, `aria-modal`, `role="alert"`, `aria-live`.
- **Navigation clavier** : tous les formulaires sont accessibles au clavier (tabulation, Entrée, Échap pour fermer les modals).
- **Contrastes** : ratio minimum 4.5:1 pour le texte sur fond (norme WCAG AA).
- **Labels explicites** : chaque `<input>` est associé à un `<label>` avec `for`.
- **Messages d'erreur** : annoncés via `role="alert"` pour les lecteurs d'écran.
- **Mode sombre** : respecte les contrastes en thème sombre également.

### Bonnes Pratiques

- **HTTPS** recommandé en production.
- **Aucun `console.error`** non géré en production.
- **Images avec dimensions explicites** pour éviter le CLS.
- **Dépendances à jour** : Nuxt 3.x, Vue 3.x, packages sans vulnérabilités connues.

---

## Points d'Amélioration Identifiés

| Point | Impact | Recommandation |
|---|---|---|
| Leaflet CSS chargé globalement | Moyen | Charger `leaflet/dist/leaflet.css` uniquement sur les pages avec carte |
| Images bâtiments non optimisées côté serveur | Moyen | Utiliser `@nuxt/image` pour servir des formats WebP/AVIF optimaux |
| Pas de Service Worker | Faible | Ajouter `@vite-pwa/nuxt` pour un mode offline basique |
| Font display swap | Faible | Ajouter `&display=swap` sur Google Fonts (déjà présent) |

---

## Commande pour Reproduire l'Audit

```bash
# Lancer l'application
npm run build && npm run preview

# Audit Lighthouse CLI
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html --preset=desktop
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-mobile.html --form-factor=mobile --screenEmulation.mobile
```

---

*Rapport généré dans le cadre du livrable L5 — Projet 4 findMe, DHI Academy 2026.*
