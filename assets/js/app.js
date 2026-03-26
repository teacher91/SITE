/**
 * Module principal : orchestration de l'application
 */

const App = {
    /**
     * Initialise l'application
     */
    async init() {
        console.log('🚀 Initialisation SITE IA...');

        try {
            UI.showLoader();
            UI.init();

            // Charger les sources et articles
            await Feed.init();
            const articles = await Feed.loadArticles();

            console.log(`✅ ${articles.length} articles chargés`);

            // Rendu initial
            this.render();

            // Événement personnalisé pour notification
            document.dispatchEvent(new CustomEvent('appReady', {
                detail: { articleCount: articles.length }
            }));

        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            UI.hideLoader();
            this.showErrorState();
        }
    },

    /**
     * Rend la page complète
     */
    render() {
        try {
            // Afficher les articles
            const filtered = Feed.getFiltered(UI.currentCountry, UI.currentSearch);
            UI.renderArticles(filtered);

            // Mettre à jour ticker et tendances
            UI.updateTicker();
            UI.updateTrending();
            UI.updateLastUpdate();

            UI.hideLoader();

        } catch (error) {
            console.error('Erreur rendu:', error);
            this.showErrorState();
        }
    },

    /**
     * Affiche une erreur
     */
    showErrorState() {
        const grid = document.getElementById('articlesGrid');
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: #ff6b6b;">
                <p>❌ Erreur chargement articles. Veuillez rafraîchir la page.</p>
            </div>
        `;
    }
};

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
