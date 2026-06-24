# findMe — Adressage Numérique pour l'Afrique

> Plateforme grand public de gestion des adresses urbaines et périurbaines.  
> Projet 4 · DHI Academy · Mai 2026 · GeoLink Africa, Douala, Cameroun

---

## Présentation

**findMe** est une application web full-stack développée avec **Nuxt 3 / Vue 3** qui permet à chaque citoyen de créer, gérer et partager son adresse numérique officielle en quelques minutes.

### Fonctionnalités principales

| Fonctionnalité | Statut |
|---|---|
| Authentification (signup, login, mot de passe oublié, reset) | ✅ |
| Gestion des adresses (CRUD, max 4 par utilisateur) | ✅ |
| Géolocalisation GPS + carte OSM interactive | ✅ |
| Upload & compression d'image côté client | ✅ |
| Export PDF avec QR Code | ✅ |
| Landing page optimisée SEO + conversion | ✅ |
| Mode sombre / clair / système | ✅ |
| Multilingue FR / EN | ✅ |
| Dashboard administrateur complet | ✅ |
| Support client | ✅ |
| Page 404 personnalisée | ✅ |

---

## Stack Technique

- **Framework** : Nuxt 3.x (Vue 3 Composition API)
- **Gestion d'état** : Pinia
- **Styles** : CSS natif — Design System custom (tokens, composants)
- **Carte** : Leaflet + OpenStreetMap
- **PDF** : jsPDF + html2canvas
- **i18n** : @nuxtjs/i18n (FR/EN)
- **Thème** : @nuxtjs/color-mode
- **API** : Serveur Nitro local (`server/api/`) + Mock Postman cloud

---

## Installation & Lancement

### Prérequis
- Node.js >= 18
- npm >= 9

### Étapes

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd findme

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Modifier NUXT_PUBLIC_API_BASE selon votre configuration

# 4. Lancer en développement
npm run dev

# 5. Build pour la production
npm run build && npm run preview
```

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | URL de base de l'API | `/api` (Nitro local) |

**Pour utiliser le mock Postman cloud :**
```env
NUXT_PUBLIC_API_BASE=https://0e736129-e57d-4161-af5d-4f0d1d1613e7.mock.pstmn.io
```

---

## Structure du Projet

```
findme/
├── app/                        # srcDir Nuxt
│   ├── assets/css/main.css     # Design System (tokens, composants globaux)
│   ├── components/
│   │   ├── map/                # OSMMap.vue, CustomMap.vue
│   │   └── ui/                 # Toast.vue, AddressCard.vue, StatusBadge.vue
│   ├── composables/
│   │   ├── usePDF.ts           # Génération PDF (jsPDF + html2canvas)
│   │   └── useToast.ts         # Notifications toast
│   ├── layouts/
│   │   ├── default.vue         # Layout public (navbar + footer)
│   │   └── dashboard.vue       # Layout authentifié (sidebar responsive)
│   ├── middleware/auth.ts      # Protection des routes privées
│   ├── pages/
│   │   ├── index.vue           # Landing page (Hero, Steps, Testi, CTA)
│   │   ├── auth/               # login, signup, forgot-password, reset-password
│   │   ├── dashboard/          # Espace personnel (stats + adresses)
│   │   ├── address/            # Création (4 étapes) & édition
│   │   ├── admin/              # Dashboard, utilisateurs, adresses, support
│   │   ├── settings.vue        # Thème + langue
│   │   └── support.vue         # Formulaire support client
│   ├── stores/
│   │   ├── auth.ts             # Auth (token, user, session localStorage)
│   │   └── address.ts          # Adresses (CRUD, draft, limite 4)
│   └── error.vue               # Page d'erreur 404 / 500
├── server/api/                 # Handlers Nitro (mock API local)
│   ├── auth/                   # login, signup, logout, forgot-password
│   ├── addresses/              # GET, POST, PUT, DELETE
│   ├── admin/                  # dashboard, users, addresses, support
│   └── support/                # POST messages
├── i18n/locales/
│   ├── fr.json                 # Traductions français
│   └── en.json                 # Traductions anglais
├── nuxt.config.ts
└── README.md
```

---

## Architecture & Choix Techniques

### Pourquoi Nuxt 3 ?
- **SSR sélectif** : Landing page en SSR (SEO), dashboard en CSR (`ssr: false` via `routeRules`)
- **Nitro** : Serveur mock intégré, pas de dépendance backend externe requise
- **Auto-imports** : Composables, stores et utils sans import manuel

### Gestion d'état (Pinia)
- `useAuthStore` : session utilisateur, token JWT, persistance localStorage, restore au montage
- `useAddressStore` : CRUD complet, brouillon auto-sauvegardé toutes les 30s, limite 4/utilisateur

### Design System
Palette conforme à la charte **GeoLink Africa** :
- `#185FA5` GeoBlue (primaire) · `#0C6B3A` GeoGreen (accent) · `#0F2744` NightMap (fond sombre)
- Dark mode complet via variables CSS (`:root` / `.dark`)
- Tokens : couleurs, typographie, espacement, ombre, rayon, transition

### SEO & Performance
- `useSeoMeta()` sur chaque page · balises Open Graph · SSR sur la landing
- Skeleton loading sur tous les états d'attente
- Compression d'image Canvas côté client avant envoi
- `lazy loading` attribut sur toutes les images

### Accessibilité (ARIA)
- `aria-label`, `aria-describedby`, `role="alert"` sur tous les éléments dynamiques
- Navigation clavier complète (`:focus-visible`)
- Contrastes WCAG AA respectés
- Structure sémantique HTML5

---

## Comptes de test (mock local)

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@findme.cm` | `Admin123` |
| Utilisateur | `user@findme.cm` | `User1234` |

> Le mock local détecte le rôle via l'email : si l'email contient `admin` → rôle `admin`.

---

## Livrables

| Code | Livrable | Emplacement |
|---|---|---|
| L1 | Code Source | Ce dépôt Git (≥15 commits significatifs) |
| L2 | UI/UX | Brand Identity PDF + Design System v1.0 |
| L3 | API Contracts | `postman/findme.postman_collection.json` |
| L4 | Mock Server | `server/api/` (Nitro) + Postman mock cloud |
| L5 | Rapport Performance | Lighthouse mobile / desktop |
| L6 | Documentation | Ce README |

---

## Auteur

**Alex (bakandalex)** · Promotion Mai 2026 · DHI Academy  
Encadrement : GeoLink Africa · Douala, Cameroun
