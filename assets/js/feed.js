/**
 * Module d'agrégation et parsing des flux RSS francophones
 */

const Feed = {
    articles: [],
    sources: [],

    /**
     * Initialise les sources RSS
     */
    async init() {
        try {
            const response = await fetch('data/sources.json');
            if (!response.ok) throw new Error('Erreur chargement sources');
            this.sources = await response.json();
        } catch (error) {
            console.error('Erreur initialisation Feed:', error);
            this.sources = [];
        }
    },

    /**
     * Charge les articles depuis data/articles.json
     */
    async loadArticles() {
        try {
            const response = await fetch('data/articles.json?' + Date.now());
            if (!response.ok) throw new Error('Erreur chargement articles');
            const data = await response.json();
            this.articles = data.articles || [];
            return this.articles;
        } catch (error) {
            console.error('Erreur chargement articles:', error);
            this.articles = [];
            return [];
        }
    },

    /**
     * Filtre les articles par pays
     */
    filterByCountry(country) {
        if (country === 'ALL') return this.articles;
        return this.articles.filter(article => article.country === country);
    },

    /**
     * Filtre les articles par recherche
     */
    filterBySearch(query) {
        const q = query.toLowerCase();
        return this.articles.filter(article =>
            article.title.toLowerCase().includes(q) ||
            article.excerpt.toLowerCase().includes(q) ||
            article.source.toLowerCase().includes(q)
        );
    },

    /**
     * Combine filtres pays + recherche
     */
    getFiltered(country = 'ALL', searchQuery = '') {
        let filtered = this.filterByCountry(country);
        if (searchQuery) {
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return filtered;
    },

    /**
     * Retourne les tendances (tags les plus fréquents)
     */
    getTrending(limit = 10) {
        const tagCount = {};
        
        this.articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    },

    /**
     * Retourne les articles les plus récents pour le ticker
     */
    getLatestTicker(limit = 5) {
        return this.articles
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
            .slice(0, limit);
    },

    /**
     * Formate une date en format lisible
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `Il y a ${diffMins}m`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR');
    },

    /**
     * Retourne les articles triés par date
     */
    sortByDate(articles) {
        return [...articles].sort((a, b) => 
            new Date(b.pubDate) - new Date(a.pubDate)
        );
    }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Feed;
}
