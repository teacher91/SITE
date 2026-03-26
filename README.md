# 🚀 SITE IA — Actualités Intelligence Artificielle Francophones

> Agrégateur d'actualités IA en français, auto-alimenté par des flux RSS de France, Belgique, Canada et Suisse.

## 🎯 Fonctionnalités

✅ **Agrégation RSS** — 12 sources francophones officielles (Le Monde, ZDNet, Radio-Canada, RTBF, RTS...)
✅ **Design ultra-moderne** — Dark mode natif, glassmorphism, animations fluides, responsive
✅ **Filtrage avancé** — Par pays, recherche temps réel, tendances
✅ **Auto-alimentation** — Cron GitHub Actions chaque 6h
✅ **Déploiement automatique** — GitHub Pages, CI/CD zero-config
✅ **Performance** — Lazy loading, CSS optimisé, JS modulaire

## 📱 Pages couvertes

- 🇫🇷 **France** : Le Monde, ZDNet, 01net, Siècle Digital, L'Usine Digitale, Journal du Net, Les Numériques
- 🇨🇦 **Canada** : Radio-Canada, Le Devoir
- 🇧🇪 **Belgique** : RTBF, L'Echo
- 🇨🇭 **Suisse** : RTS

## 🏗️ Structure

```
SITE/
├── index.html                 # Page principale
├── assets/
│   ├── css/style.css          # Design moderne (glassmorphism, dark mode)
│   └── js/
│       ├── app.js             # Orchestration
│       ├── feed.js            # Parsing + agrégation RSS
│       └── ui.js              # Interactions + filtres
├── data/
│   ├── sources.json           # Configuration flux RSS
│   └── articles.json          # Cache articles (auto-généré)
├── scripts/
│   └── fetch-feeds.js         # Synchronisation RSS (Node.js)
└── .github/workflows/
    ├── fetch-feeds.yml        # Cron auto-fetch (6h)
    └── deploy.yml             # GitHub Pages deploy
```

## 🛠️ Installation & Déploiement

### 1. Cloner le repo
```bash
git clone https://github.com/teacher91/SITE.git
cd SITE
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Test local
```bash
npm run fetch          # Récupérer les articles
npm start             # Serveur local http://localhost:8000
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Init SITE IA"
git push -u origin main
```

### 5. GitHub Pages
- Aller sur **Settings → Pages**
- Source : Deploy from a branch
- Branch : `gh-pages` / root
- ✅ Site en ligne !

## 🔄 Auto-Alimentation

Les flux RSS sont **synchronisés automatiquement chaque 6h** via GitHub Actions.

**Forcer une synchronisation manuelle** :
1. Aller sur **Actions → Fetch Francophone Feeds**
2. Cliquer **Run workflow**
3. Attendre ✅

## 🎨 Design

| Élément | Palette |
|---------|---------|
| Fond | `#0a0a0f` (noir profond) |
| Accent primaire | `#6c63ff` (violet) |
| Accent secondaire | `#00d4ff` (cyan) |
| Texte | `#ffffff` / `#b0b0c0` |

**Modes** :
- 🌙 Dark mode (défaut)
- ☀️ Light mode (toggle)

**Effets** :
- Glassmorphism sur les cards
- Micro-animations CSS au hover
- Lazy loading images
- Ticker d'actualités en temps réel
- Responsive 320px → 1920px

## 🔐 Sécurité

- ✅ Aucun secret/token en dur
- ✅ Échappement contenu RSS (XSS protection)
- ✅ HTTPS auto (GitHub Pages)
- ✅ Content Security Policy
- ✅ Dépendances validées (`npm audit`)

## 📊 Performance

| Métrique | Target |
|----------|--------|
| Lighthouse | 95+ |
| FCP | < 1s |
| LCP | < 2.5s |
| CLS | < 0.1 |

Images optimisées, CSS minifié, JS modulaire.

## 🚀 Technologies

- **Frontend** : HTML5 / CSS3 / JavaScript vanilla
- **Backend** : Node.js (RSS parser)
- **Infrastructure** : GitHub Pages / GitHub Actions
- **Monitoring** : Console browser, GitHub Actions logs

## 📄 Licence

MIT — Libre d'utilisation et de modification

---

**Créé avec ⚡ par APEX** | [GitHub](https://github.com/teacher91/SITE)
