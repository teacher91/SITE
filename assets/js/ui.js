/**
 * Module UI/UX : interactions, filtres, animations
 */

const UI = {
    currentCountry: 'ALL',
    currentSearch: '',
    imageLoadQueue: new Set(),

    /**
     * Initialise les listeners UI
     */
    init() {
        this.setupThemeToggle();
        this.setupFilters();
        this.setupSearch();
        this.setupScrollAnimations();
    },

    /**
     * Toggle thème dark/light
     */
    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        const isDark = localStorage.getItem('theme') !== 'light';

        if (!isDark) document.body.classList.add('light-mode');

        toggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            toggle.textContent = isLight ? '🌙' : '☀️';
        });

        toggle.textContent = isDark ? '🌙' : '☀️';
    },

    /**
     * Setup filtres pays
     */
    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('change', (e) => {
                this.currentCountry = e.target.value;
                this.refreshArticles();
                
                // Mise à jour visuelle
                document.querySelectorAll('.filter-btn').forEach(b => 
                    b.classList.remove('active')
                );
                btn.classList.add('active');
            });
        });
    },

    /**
     * Setup recherche
     */
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            this.currentSearch = e.target.value;

            searchTimeout = setTimeout(() => {
                this.refreshArticles();
            }, 300);
        });
    },

    /**
     * Animations au scroll
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        // Observer les cards lors du rendu
        document.addEventListener('cardAdded', (e) => {
            observer.observe(e.detail.card);
        });
    },

    /**
     * Rafraîchit l'affichage des articles
     */
    refreshArticles() {
        const filtered = Feed.getFiltered(this.currentCountry, this.currentSearch);
        this.renderArticles(filtered);
    },

    /**
     * Rend la grille d'articles
     */
    renderArticles(articles) {
        const grid = document.getElementById('articlesGrid');
        const emptyState = document.getElementById('emptyState');
        const articlesCount = document.getElementById('articlesCount');

        articlesCount.textContent = articles.length;

        if (articles.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.innerHTML = Feed.sortByDate(articles)
            .map(article => this.createArticleCard(article))
            .join('');

        // Lazy load images
        this.setupLazyLoading();
    },

    /**
     * Crée une card article
     */
    createArticleCard(article) {
        const excerpt = article.excerpt || 'Lire la suite...';
        const image = article.image || this.getPlaceholderImage();
        const date = Feed.formatDate(article.pubDate);
        const tags = article.tags ? article.tags.slice(0, 3).map(tag => 
            `<span class="article-tag">${this.escapeHtml(tag)}</span>`
        ).join('') : '';

        return `
            <article class="article-card" data-url="${this.escapeHtml(article.link)}">
                <img 
                    class="article-image" 
                    src="${this.escapeHtml(image)}" 
                    alt="${this.escapeHtml(article.title)}"
                    loading="lazy"
                >
                <div class="article-content">
                    <div class="article-source">${this.escapeHtml(article.source)}</div>
                    <h2 class="article-title">${this.escapeHtml(article.title)}</h2>
                    <p class="article-excerpt">${this.escapeHtml(excerpt)}</p>
                    <div class="article-tags">${tags}</div>
                    <div class="article-footer">
                        <span class="article-date">${date}</span>
                        <a href="${this.escapeHtml(article.link)}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="article-link">Lire</a>
                    </div>
                </div>
            </article>
        `;
    },

    /**
     * Setup lazy loading pour images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('.article-image').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    /**
     * Affiche le ticker d'actualités
     */
    updateTicker() {
        const ticker = document.getElementById('tickerContent');
        const latest = Feed.getLatestTicker(5);

        ticker.innerHTML = latest.map(article =>
            `<span class="ticker-item">📌 ${this.escapeHtml(article.title.substring(0, 60))}...</span>`
        ).join('');

        // Relancer animation
        ticker.style.animation = 'none';
        setTimeout(() => {
            ticker.style.animation = '';
        }, 10);
    },

    /**
     * Affiche les tendances
     */
    updateTrending() {
        const container = document.getElementById('trendingContainer');
        const trending = Feed.getTrending(8);

        if (trending.length === 0) {
            container.innerHTML = '<p class="loading">Pas de tendances</p>';
            return;
        }

        container.innerHTML = trending.map(({ tag, count }) =>
            `<div class="trending-item" title="${count} articles">#${this.escapeHtml(tag)}</div>`
        ).join('');

        // Ajouter listeners de click
        document.querySelectorAll('.trending-item').forEach(item => {
            item.addEventListener('click', () => {
                const tag = item.textContent.replace('#', '').trim();
                document.getElementById('searchInput').value = tag;
                this.currentSearch = tag;
                this.refreshArticles();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    },

    /**
     * Affiche le loader
     */
    showLoader() {
        document.getElementById('loader').style.display = 'flex';
    },

    /**
     * Cache le loader
     */
    hideLoader() {
        document.getElementById('loader').style.display = 'none';
    },

    /**
     * Met à jour la date de dernière mise à jour
     */
    updateLastUpdate() {
        const element = document.getElementById('lastUpdate');
        const now = new Date();
        element.textContent = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Échappe les caractères HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Retourne une image placeholder
     */
    getPlaceholderImage() {
        const colors = ['6c63ff', '00d4ff', 'ff6b6b', '4ecdc4', 'ffa502'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return `https://via.placeholder.com/320x200/${randomColor}/FFFFFF?text=IA`;
    }
};
